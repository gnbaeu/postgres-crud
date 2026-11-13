import { MOVIES, FOODS, MOVIE_GENRES, FOOD_CATEGORIES } from "./randomizer-data.js";
import { pickItem } from "./randomizer-core.js";

const DATA = { movie: MOVIES, food: FOODS };
const CATEGORIES = { movie: MOVIE_GENRES, food: FOOD_CATEGORIES };
const escape = value => String(value ?? "").replace(/[&<>"']/g, character => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" })[character]);
const localized = (value, language) => typeof value === "string" ? value : value?.[language] || value?.en || value?.mn || "";

// Uses the full Randomizer's data and unbiased/no-repeat selection function.
// Preview state stays in memory; full Randomizer favorites/history are untouched.
export function createQuickDraw({ datasets = DATA, select = pickItem } = {}) {
  let type = "movie";
  const results = { movie: null, food: null };
  const previous = { movie: null, food: null };
  const statuses = { movie: "idle", food: "idle" };
  return {
    state: () => ({ type, result: results[type], status: statuses[type] }),
    setType(value) { if (value === "movie" || value === "food") type = value; },
    draw() {
      try {
        const items = Array.isArray(datasets[type]) ? datasets[type] : [];
        const candidate = select(items, previous[type]);
        const actual = candidate && items.find(item => item.id === candidate.id);
        if (!actual) { results[type] = null; statuses[type] = "empty"; }
        else { results[type] = actual; previous[type] = actual.id; statuses[type] = "ready"; }
      } catch { results[type] = null; statuses[type] = "error"; }
      return this.state();
    }
  };
}

export function quickDrawMarkup({ state, translate, language, busy = false }) {
  const t = key => translate("pz." + key);
  const item = state.result;
  const title = item ? state.type === "movie" ? item.title : localized(item.names, language) : "";
  const description = item ? localized(state.type === "movie" ? item.summary : item.description, language) : "";
  const categoryNames = item ? (item.genres || item.categories).slice(0,3).map(id => {
    const category = CATEGORIES[state.type].find(category => category.id === id);
    return category ? translate(category.key) : "";
  }).filter(Boolean) : [];
  const message = state.status === "error" ? "quickError" : state.status === "empty" ? "quickEmpty" : "quickIdle";
  return `<header class="qd-heading"><p class="pz-micro">${escape(t("quickEyebrow"))}</p><h2 id="quick-draw-title">${escape(t("quickTitle"))}</h2><p>${escape(t("quickIntro"))}</p></header>
    <div class="qd-interactive">
      <div class="qd-controls">
        <fieldset class="qd-type"><legend class="visually-hidden">${escape(t("quickType"))}</legend>${["movie","food"].map(type=>`<button type="button" data-quick-type="${type}" data-quick-focus="${type}" aria-pressed="${state.type===type}" aria-controls="quick-draw-result">${escape(t(type==="movie"?"quickMovie":"quickFood"))}</button>`).join("")}</fieldset>
        <button class="pz-button pz-button--primary qd-draw" type="button" data-quick-action="draw" data-quick-focus="draw" aria-controls="quick-draw-result" ${busy?"disabled":""}>${escape(t(busy?"quickBusy":item?"quickAgain":"quickPick"))}<span aria-hidden="true">›</span></button>
      </div>
      <div class="qd-result" id="quick-draw-result">
        ${item ? `<article data-quick-result-id="${escape(item.id)}" data-quick-result-type="${state.type}" aria-labelledby="quick-result-title"><p class="qd-result-label">${escape(t("quickResult"))}${state.type==="movie"?" / "+item.year:""}</p><h3 id="quick-result-title">${escape(title)}</h3><p class="qd-summary">${escape(description)}</p><p class="qd-result-meta">${categoryNames.map(escape).join(" · ")}</p></article>` : `<p class="qd-idle" data-quick-state="${state.status}">${escape(t(message))}</p>`}
      </div>
      <div class="qd-bottom"><p>${escape(t("quickNote"))}</p><a href="/randomizer/${state.type}" data-quick-open>${escape(t("quickOpen"))}<span aria-hidden="true"> →</span></a></div>
    </div>`;
}

export function initQuickDraw({ container, translate, getLanguage, getPage, navigate, model = createQuickDraw() }) {
  if (!container) return;
  let busy = false, run = 0;
  const announce = message => {
    const live = container.querySelector("#quick-draw-live");
    if (live) live.textContent = message;
  };
  function render() {
    const host = container.querySelector("[data-quick-draw]");
    if (!host) return;
    const active = document.activeElement;
    const key = host.contains(active) ? active?.dataset.quickFocus : null;
    host.setAttribute("aria-busy", String(busy));
    host.innerHTML = quickDrawMarkup({ state:model.state(), translate, language:getLanguage(), busy });
    if (key) host.querySelector('[data-quick-focus="'+key+'"]')?.focus({preventScroll:true});
  }
  function refresh() {
    if (getPage() !== "playground" && busy) { run++; busy = false; }
    render();
  }
  container.addEventListener("click", async event => {
    const type = event.target.closest("[data-quick-type]");
    if (type) {
      run++; busy = false; model.setType(type.dataset.quickType);
      render(); announce(""); return;
    }
    const open = event.target.closest("[data-quick-open]");
    if (open && event.button === 0 && !event.ctrlKey && !event.metaKey && !event.shiftKey && !event.altKey) {
      event.preventDefault();
      navigate(model.state().type === "movie" ? "randomizerMovie" : "randomizerFood");
      return;
    }
    if (!event.target.closest('[data-quick-action="draw"]') || busy) return;
    const host = container.querySelector("[data-quick-draw]");
    const restoreFocus = host?.contains(document.activeElement) ? document.activeElement?.dataset.quickFocus : null;
    const token = ++run;
    busy = true; render(); announce(translate("pz.quickBusy"));
    // Yield once for the loading/duplicate-click state, without an artificial delay.
    await Promise.resolve();
    if (token !== run || getPage() !== "playground") {
      if (token === run) { busy = false; render(); }
      return;
    }
    const state = model.draw();
    busy = false; render();
    if (restoreFocus) container.querySelector("[data-quick-draw]")?.querySelector('[data-quick-focus="'+restoreFocus+'"]')?.focus({preventScroll:true});
    if (state.result) {
      const title = state.type === "movie" ? state.result.title : localized(state.result.names, getLanguage());
      announce(translate("pz.quickAnnounce") + ": " + title);
    } else announce(translate("pz." + (state.status === "error" ? "quickError" : "quickEmpty")));
  });
  window.addEventListener("gnwaa:public-view", refresh);
  render();
  return { model, refresh };
}

import {uxText,shareResult} from "./pixel-ux.js";
// Keep this module name distinct from /randomizer so Vite serves the SPA at that URL.
import { MOVIE_GENRES, FOOD_CATEGORIES, MOVIES, FOODS, DATASET_SOURCES } from "./randomizer-data.js";
import { eligibleItems, toggleSelection, pickItem, readCollection, writeCollection, rememberDraw, toggleFavorite } from "./randomizer-core.js";

const DEFAULT_DATA = { movie: MOVIES, food: FOODS };
const CATEGORIES = { movie: MOVIE_GENRES, food: FOOD_CATEGORIES };
const ROUTES = { landing: "randomizer", movie: "randomizerMovie", food: "randomizerFood" };
const escape = value => String(value ?? "").replace(/[&<>"']/g, character => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character]);
const arrow = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14m-6-6 6 6-6 6"/></svg>';
const heart = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z"/></svg>';
const filmArt = '<svg class="mn-rpg-art" viewBox="0 0 32 32" aria-hidden="true" focusable="false"><use href="/images/mongolian-ui.svg#film"/></svg>';
const foodArt = '<svg class="mn-rpg-art" viewBox="0 0 32 32" aria-hidden="true" focusable="false"><use href="/images/mongolian-ui.svg#bowl"/></svg>';
const capsule = '<svg class="rz-capsule mn-rpg-art" viewBox="0 0 32 32" aria-hidden="true" focusable="false"><use href="/images/mongolian-ui.svg#draw"/></svg>';

export function initRandomizer({ root, getLanguage, setLanguage, navigate, translate, datasets = DEFAULT_DATA }) {
  if (!root) return;
  const DATA = datasets;
  const content = root.querySelector("#randomizer-content");
  const live = root.querySelector("#randomizer-live");
  let storage = null;
  try { storage = window.localStorage; } catch { /* Optional persistence. */ }
  let storageFailed = !storage;
  let lastPath = "";
  let timer = null;
  const models = Object.fromEntries(["movie", "food"].map(type => {
    const saved = readCollection(storage, type, DATA[type]);
    return [type, {
      selected: [], mode: "any", result: null, previousId: saved.history[0]?.id || null, busy: false, limited: false,
      openedSaved: false, fresh: false, error: false, ...saved
    }];
  }));
  const tr = (key, values) => key==="addFavorite"?uxText("save",getLanguage()):key==="removeFavorite"?uxText("remove",getLanguage()):key==="favorites"?uxText("save",getLanguage()):translate("randomizer." + key, values);
  const text = value => typeof value === "string" ? value : value?.[getLanguage()] || value?.en || value?.mn || "";
  const name = (item, type) => type === "movie" ? item.title : text(item.names);
  const routeType = () => location.pathname.replace(/\/+$/, "").split("/")[2] || "landing";
  const motionAllowed = () => document.documentElement.dataset.motion === "on" && !matchMedia("(prefers-reduced-motion: reduce)").matches;
  const persist = type => { if (!writeCollection(storage, type, models[type])) storageFailed = true; };
  const labels = (item, type) => (item.genres || item.categories).map(id => translate(CATEGORIES[type].find(category => category.id === id)?.key || id));
  const focus = key => content.querySelector('[data-rz-focus="' + CSS.escape(key) + '"]')?.focus({ preventScroll: true });
  const localeSelect = () => `<label class="rz-locale"><span class="visually-hidden">${escape(tr("language"))}</span><select id="randomizer-language" aria-label="${escape(tr("language"))}">${[["mn","MN"],["en","EN"],["ja","日本語"]].map(([value,label]) => `<option value="${value}" ${getLanguage() === value ? "selected" : ""}>${label}</option>`).join("")}</select></label>`;
  const breadcrumbs = type => `<div class="rz-toolbar"><nav class="rz-breadcrumb" aria-label="${escape(tr("back"))}"><a href="/" data-rz-route="home">${escape(tr("home"))}</a><span aria-hidden="true">/</span>${type === "landing" ? `<span aria-current="page">${escape(tr("back"))}</span>` : `<a href="/randomizer" data-rz-route="randomizer">${escape(tr("back"))}</a><span aria-hidden="true">/</span><span aria-current="page">${escape(tr(type))}</span>`}</nav>${localeSelect()}</div>`;
  const tagList = (item, type) => labels(item, type).map(label => `<span class="rz-tag">${escape(label)}</span>`).join("");

  function landing() {
    return `${breadcrumbs("landing")}
      <header class="rz-landing-header"><span class="rz-kicker">${escape(tr("eyebrow"))}</span><h1 id="randomizer-title" tabindex="-1">${escape(tr("title"))}</h1><p>${escape(tr("intro"))}</p><span class="rz-small-seal" aria-hidden="true">GNWAA</span></header>
      <div class="rz-selection-grid">${["movie","food"].map((type, index) => `
        <a class="rz-choice rz-choice--${type}" href="/randomizer/${type}" data-rz-route="${ROUTES[type]}">
          <div class="rz-choice-top"><span>0${index+1} / ${type === "movie" ? "CINEMA" : "TABLE"}</span><span class="rz-circle-arrow">${arrow}</span></div>
          <div class="rz-choice-art">${type === "movie" ? filmArt : foodArt}</div>
          <div class="rz-choice-copy"><h2>${escape(tr(type + "Title"))}</h2><p>${escape(tr(type + "Description"))}</p></div>
          <div class="rz-choice-footer"><span>${escape(tr("available",{count:DATA[type].length}))}</span><strong>${escape(tr("enter"))} ${arrow}</strong></div>
        </a>`).join("")}</div>
      <div class="rz-landing-note"><span class="rz-note-mark" aria-hidden="true">+</span><div><strong>${escape(tr("curated"))}</strong><p>${escape(tr("landingNote"))}</p></div></div>`;
  }

  function collectionPanel(type, kind) {
    const model = models[type];
    const entries = kind === "favorites" ? model.favorites : model.history.map(entry => entry.id);
    const items = entries.map(id => DATA[type].find(item => item.id === id)).filter(Boolean);
    return `<section class="rz-collection" aria-labelledby="rz-${kind}-title"><div class="rz-collection-heading"><h2 id="rz-${kind}-title">${escape(tr(kind))}</h2><span>${items.length.toString().padStart(2,"0")}</span></div>
      ${items.length ? `<ul>${items.map((item,index) => `<li><span class="rz-list-number">${String(index+1).padStart(2,"0")}</span><button type="button" class="rz-open-saved" data-rz-action="open" data-id="${item.id}" data-rz-focus="${kind}-${item.id}" aria-label="${escape(tr("openItem",{name:name(item,type)}))}"><strong>${escape(name(item,type))}</strong><span>${type === "movie" ? item.year : escape(labels(item,type)[0])}</span></button><button type="button" class="rz-heart rz-list-heart" data-rz-action="favorite" data-id="${item.id}" data-rz-focus="${kind}-heart-${item.id}" aria-pressed="${model.favorites.includes(item.id)}" aria-label="${escape(tr(model.favorites.includes(item.id) ? "removeFavorite" : "addFavorite") + ": " + name(item,type))}">${heart}</button></li>`).join("")}</ul>` : `<p class="rz-collection-empty">${escape(tr(kind === "favorites" ? "noFavorites" : "noHistory"))}</p>`}</section>`;
  }

  function result(type, pool) {
    const model = models[type];
    if (model.busy) return `<div class="rz-waiting rz-drawing" aria-busy="true">${capsule}<span class="rz-kicker">GNWAA / DRAW</span><h2>${escape(tr("drawing"))}</h2><p>${escape(tr("motion"))}</p></div>`;
    if (!pool.length && !model.openedSaved) return `<div class="rz-waiting rz-empty" data-rz-empty><span class="rz-empty-mark" aria-hidden="true">—</span><h2>${escape(tr("emptyTitle"))}</h2><p>${escape(tr("emptyText"))}</p><div class="rz-result-actions"><button type="button" class="rz-button" data-rz-action="any" data-rz-focus="empty-any">${escape(tr("switchAny"))}</button><button type="button" class="rz-text-button" data-rz-action="clear" data-rz-focus="empty-clear">${escape(tr("removeFilters"))}</button></div></div>`;
    const item = model.result;
    if (!item) return `<div class="rz-waiting">${capsule}<span class="rz-kicker">${escape(tr("curated"))}</span><h2>${escape(tr("waitingTitle"))}</h2><p>${escape(tr("waitingText"))}</p>${model.error ? `<p role="alert">${escape(tr("error"))}</p>` : ""}</div>`;
    return `<article class="rz-result ${model.fresh ? "is-fresh" : ""}" data-result-id="${item.id}" aria-labelledby="rz-result-title">
      <div class="rz-result-art rz-result-art--${type}" aria-hidden="true"><span class="rz-art-label">${escape(tr("localEntry"))}</span>${type === "movie" ? filmArt : foodArt}<span class="rz-art-year">${type === "movie" ? item.year : "いただきます"}</span><small>${escape(tr("customArt"))}</small></div>
      <div class="rz-result-copy"><div class="rz-result-topline"><span class="rz-kicker">${escape(tr(model.openedSaved ? "saved" : "yourPick"))}</span><button type="button" class="rz-heart" data-rz-action="favorite" data-id="${item.id}" data-rz-focus="result-favorite" aria-pressed="${model.favorites.includes(item.id)}" aria-label="${escape(tr(model.favorites.includes(item.id) ? "removeFavorite" : "addFavorite") + ": " + name(item,type))}">${heart}</button></div>
      <h2 id="rz-result-title">${escape(name(item,type))}</h2>
      ${type === "movie" ? `<p class="rz-release-year">${item.year}</p>` : `<p class="rz-food-names" aria-label="${escape(tr("allNames"))}">${Object.entries(item.names).filter(([locale]) => locale !== getLanguage()).map(([locale,value]) => `<span lang="${locale}">${escape(value)}</span>`).join('<span aria-hidden="true"> / </span>')}</p>`}
      <div class="rz-tags">${tagList(item,type)}</div><p class="rz-synopsis">${escape(text(item.summary || item.description))}</p>
      ${item.detailUrl ? `<a class="rz-details-link" href="${escape(item.detailUrl)}" target="_blank" rel="noopener noreferrer">${escape(tr("details"))} ↗</a>` : ""}
      <div class="rz-share-actions"><button type="button" data-rz-action="favorite" data-id="${item.id}" data-rz-focus="save" aria-pressed="${model.favorites.includes(item.id)}">${escape(tr(model.favorites.includes(item.id)?"removeFavorite":"addFavorite"))}</button><button type="button" data-rz-action="copy" data-rz-focus="copy">${escape(uxText("copy",getLanguage()))}</button>${typeof navigator!=="undefined"&&navigator.share?`<button type="button" data-rz-action="share" data-rz-focus="share">${escape(uxText("share",getLanguage()))}</button>`:""}</div><div class="rz-result-actions"><button type="button" class="rz-button rz-button--primary" data-rz-action="draw" data-rz-focus="again">${escape(tr("tryAgain"))} ${arrow}</button><button type="button" class="rz-text-button" data-rz-action="change" data-rz-focus="change">${escape(tr(type === "movie" ? "changeGenres" : "changeCategories"))}</button></div></div></article>`;
  }

  function categoryPage(type) {
    const model = models[type];
    const pool = eligibleItems(DATA[type], model.selected, model.mode);
    const disabled = model.busy ? "disabled" : "";
    return `${breadcrumbs(type)}<header class="rz-page-header"><div><span class="rz-kicker">${escape(tr("eyebrow"))}</span><h1 id="randomizer-title" tabindex="-1">${escape(tr(type+"Title"))}</h1><p>${escape(tr(type+"Description"))}</p></div><span class="rz-edition">0${type === "movie" ? "1" : "2"}<small>DRAW / GNWAA</small></span></header>
      <div class="rz-workspace"><section class="rz-filters" aria-labelledby="rz-filter-title"><div class="rz-filter-heading"><h2 id="rz-filter-title">${escape(tr(type === "movie" ? "chooseGenres" : "chooseCategories"))}</h2><span id="rz-selected-count" class="rz-counter" data-count="${model.selected.length}">${escape(tr("selected",{count:model.selected.length}))}</span></div><p class="rz-filter-hint">${escape(tr(type === "movie" ? "genreHint" : "foodHint"))}</p>
      <div class="rz-chips" role="group" aria-label="${escape(tr(type === "movie" ? "genres" : "categories"))}">${CATEGORIES[type].map(category => `<button class="rz-chip" type="button" data-rz-action="category" data-id="${category.id}" data-rz-focus="chip-${category.id}" aria-pressed="${model.selected.includes(category.id)}" ${disabled}><span class="rz-chip-check" aria-hidden="true">${model.selected.includes(category.id) ? "✓" : "+"}</span>${escape(translate(category.key))}</button>`).join("")}</div>
      <p class="rz-limit" id="rz-limit" role="status">${model.limited || model.selected.length === 5 ? escape(tr("limit")) : ""}</p>
      <div class="rz-mode-row"><span>${escape(tr("match"))}</span><div class="rz-mode" role="group" aria-label="${escape(tr("match"))}">${["any","all"].map(mode => `<button type="button" data-rz-action="mode" data-mode="${mode}" data-rz-focus="mode-${mode}" aria-pressed="${model.mode === mode}" ${disabled}>${escape(tr(mode))}</button>`).join("")}</div></div>
      <p class="rz-mode-help">${escape(tr(model.mode+"Help"))}</p><p class="rz-unfiltered">${!model.selected.length ? escape(tr(type === "movie" ? "unfilteredMovie" : "unfilteredFood")) : ""}</p>
      <div class="rz-draw-row"><button id="rz-draw" type="button" class="rz-button rz-button--primary" data-rz-action="draw" data-rz-focus="draw" ${disabled}>${escape(tr(model.busy ? "drawing" : "draw"))} ${arrow}</button><button type="button" class="rz-text-button" data-rz-action="clear" data-rz-focus="clear" ${!model.selected.length || model.busy ? "disabled" : ""}>${escape(tr("clear"))}</button></div>
      <p id="rz-eligible-count" class="rz-eligible" data-count="${pool.length}">${escape(tr("eligible",{count:pool.length,total:DATA[type].length}))}</p></section>
      <section id="rz-result-region" class="rz-result-region" aria-label="${escape(tr("yourPick"))}">${result(type,pool)}</section></div>
      <p class="rz-device-note">${escape(uxText("device",getLanguage()))}</p><div class="rz-collection-grid">${collectionPanel(type,"favorites")}${collectionPanel(type,"history")}</div>
      <div class="rz-data-note"><p>${escape(tr(type+"Note",{count:DATA[type].length}))}</p>${storageFailed ? `<p class="rz-storage-notice" role="status">${escape(tr("storageNotice"))}</p>` : ""}<details><summary>${escape(tr("sourceTitle"))}</summary><p>${escape(tr("sourceText"))}</p><ul>${DATASET_SOURCES[type === "movie" ? "movies" : "foods"].map(source => `<li><a href="${escape(source.url)}" target="_blank" rel="noopener noreferrer">${escape(source.label)} ↗</a></li>`).join("")}</ul></details></div>`;
  }

  function render(restoreFocus = true) {
    const key = restoreFocus && root.contains(document.activeElement) ? document.activeElement.dataset.rzFocus : null;
    const type = routeType();
    content.innerHTML = type === "movie" || type === "food" ? categoryPage(type) : landing();
    if (key) focus(key);
  }

  function announce(value) {
    live.textContent = "";
    requestAnimationFrame(() => { live.textContent = value; });
  }

  function draw(type) {
    const model = models[type];
    if (model.busy) return;
    try {
      const pool = eligibleItems(DATA[type], model.selected, model.mode);
      const item = pickItem(pool, model.previousId);
      model.openedSaved = false;
      if (!item) { model.result = null; render(); announce(tr("emptyText")); return; }
      model.busy = true; model.error = false; model.fresh = false;
      const returnFocus = document.activeElement?.dataset.rzFocus || "draw";
      const finish = () => {
        timer = null;
        model.busy = false; model.result = item; model.previousId = item.id; model.fresh = motionAllowed();
        model.history = rememberDraw(model.history, item.id);
        persist(type); render(); focus(returnFocus);
        announce(tr("resultAnnounce",{name:name(item,type)}));
      };
      if (motionAllowed()) { render(); announce(tr("drawing")); timer = setTimeout(finish,640); }
      else finish();
    } catch {
      model.busy = false; model.error = true; render(); announce(tr("error"));
    }
  }

  root.addEventListener("click", async event => {
    const link = event.target.closest("[data-rz-route]");
    if (link && !event.ctrlKey && !event.metaKey && !event.shiftKey && !event.altKey && event.button === 0) {
      event.preventDefault(); navigate(link.dataset.rzRoute); return;
    }
    const button = event.target.closest("[data-rz-action]");
    const type = routeType();
    if (!button || !DATA[type]) return;
    const model = models[type];
    const action = button.dataset.rzAction;
    if (model.busy) return;
    model.fresh = false;
    if(action==="copy"||action==="share"){
      if(!model.result)return;
      const message=name(model.result,type)+(type==="movie"?" ("+model.result.year+")":"")+" — GNWAA Randomizer";
      const ok=await shareResult(message,{share:action==="share"});
      announce(uxText(ok?(action==="share"?"shared":"copied"):"failed",getLanguage()));return;
    }
    if (action === "draw") { draw(type); return; }
    if (action === "change") {
      const chip = content.querySelector('.rz-chip[aria-pressed="true"]') || content.querySelector(".rz-chip");
      chip?.scrollIntoView({block:"center",behavior:"auto"}); chip?.focus({preventScroll:true}); return;
    }
    if (action === "favorite" || action === "open") {
      const item = DATA[type].find(entry => entry.id === button.dataset.id);
      if (!item) return;
      if (action === "favorite") { model.favorites = toggleFavorite(model.favorites,item.id); persist(type); }
      else {
        model.result = item; model.previousId = item.id; model.openedSaved = true; render(false);
        content.querySelector("#rz-result-title")?.setAttribute("tabindex","-1");
        content.querySelector("#rz-result-title")?.focus({preventScroll:true});
        content.querySelector("#rz-result-region")?.scrollIntoView({block:"center",behavior:"auto"});
        announce(tr("resultAnnounce",{name:name(item,type)})); return;
      }
    } else {
      if (action === "category") {
        if (!CATEGORIES[type].some(category => category.id === button.dataset.id)) return;
        const next = toggleSelection(model.selected,button.dataset.id);
        model.selected = next.values; model.limited = next.limited;
        if (next.limited) { render(); announce(tr("limit")); return; }
      } else if (action === "mode" || action === "any") {
        model.mode = action === "any" ? "any" : button.dataset.mode === "all" ? "all" : "any";
      } else if (action === "clear") { model.selected = []; model.limited = false; }
      model.result = null; model.openedSaved = false;
    }
    render();
  });
  root.addEventListener("change", event => {
    if (event.target.id === "randomizer-language") {
      setLanguage(event.target.value);
      content.querySelector("#randomizer-language")?.focus({preventScroll:true});
    }
  });
  function refresh() {
    const path = location.pathname;
    document.body.classList.toggle("rz-active", path === "/randomizer" || path.startsWith("/randomizer/"));
    const changed = lastPath !== path;
    if (changed) {
      if (timer) clearTimeout(timer);
      timer = null;
      Object.values(models).forEach(model => { model.busy = false; model.fresh = false; });
      lastPath = path;
    }
    render(!changed);
    if (path === "/randomizer" || path.startsWith("/randomizer/")) {
      const type = routeType();
      document.title = tr(type === "movie" || type === "food" ? type+"Title" : "title") + " · GNWAA";
      if (changed && window.self === window.top) requestAnimationFrame(() => {
        content.querySelector("#randomizer-title")?.focus({preventScroll:true});
        window.scrollTo({top:0,behavior:"auto"});
      });
    }
  }
  window.addEventListener("gnwaa:public-view", refresh);
  new MutationObserver(() => {
    if (Object.values(models).some(model => model.busy) && !motionAllowed()) {
      // Cancel a pending reveal when motion preferences change; failed/cancelled draws are not recorded.
      if (timer) { clearTimeout(timer); timer = null; Object.values(models).forEach(model => { model.busy = false; }); render(); }
    }
  }).observe(document.documentElement,{attributes:true,attributeFilter:["data-motion"]});
  window.addEventListener("storage", event => {
    if (event.key === null || event.key?.startsWith("gnwaa-randomizer-")) {
      for (const type of ["movie","food"]) Object.assign(models[type],readCollection(storage,type,DATA[type]));
      render();
    }
  });
  refresh();
}

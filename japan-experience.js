// Public preferences stay separate from the owner's appearance controls.
export const JAPAN_SETTINGS_KEY = "gnwaa-japan-experience-v1";
export const PIXEL_SETTINGS_KEY = "gnwaa-pixel-zen-v1";
const root = document.documentElement;
const systemTheme = window.matchMedia("(prefers-color-scheme: dark)");
const systemMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const read = key => { try { return JSON.parse(localStorage.getItem(key) || "{}") || {}; } catch { return {}; } };
const previous = read(JAPAN_SETTINGS_KEY), saved = read(PIXEL_SETTINGS_KEY);
let legacy = null;
try { legacy = localStorage.getItem("ganbat-customer-theme"); } catch { /* Optional storage. */ }
const appearances = ["light", "dark", "system"];
const settings = {
  appearance: [saved.appearance, previous.appearance, legacy].find(value => appearances.includes(value)) || "dark",
  motion: ["off", "reduced"].includes(previous.motion) ? previous.motion : "on"
};
export const resolveJapanAppearance = () => settings.appearance === "system" ? systemTheme.matches ? "dark" : "light" : settings.appearance;
// Pure compatibility export; old seasonal preferences are retained but no longer drive public styles.
export function suggestedSeason(date = new Date()) {
  const month = Number(new Intl.DateTimeFormat("en", {timeZone:"Asia/Tokyo", month:"numeric"}).format(date));
  return month >= 3 && month <= 5 ? "spring" : month >= 6 && month <= 8 ? "summer" : month >= 9 && month <= 11 ? "autumn" : "winter";
}
export function chooseDiscovery(articles, locale, getCopy, random = Math.random, previousSlug = null) {
  const available = articles.filter(item => item.status === "published" && getCopy(item, locale)?.title && getCopy(item, locale)?.summary);
  const pool = available.length > 1 ? available.filter(item => item.slug !== previousSlug) : available;
  return pool.length ? pool[Math.min(pool.length - 1, Math.max(0, Math.floor(random() * pool.length)))] : null;
}
const copy = {
  mn: {close:"Хаах", random:"Өдрийн сугалаа", prompt:"Архив дахь бодит нийтлэлээс нэгийг сугалж үзээрэй.", draw:"Дахин сугалах", open:"Нийтлэлийг унших", empty:"Энэ хэл дээр нийтлэгдсэн нийтлэл одоогоор алга.", discover:"Нийтлэлийн архив", zen:"Төвлөрч унших", exitZen:"Унших горимоос гарах", failure:"Нийтлэлийг нээж чадсангүй. Дахин оролдоно уу."},
  en: {close:"Close", random:"Daily discovery", prompt:"Draw a real article from the preserved collection.", draw:"Draw again", open:"Read this article", empty:"No published articles are available in this language yet.", discover:"Article archive", zen:"Focus Reading Mode", exitZen:"Exit Reading Mode", failure:"The article could not be opened. Please try again."},
  ja: {close:"閉じる", random:"今日の発見", prompt:"保存された記事から、ひとつの発見を引いてみよう。", draw:"もう一度引く", open:"記事を読む", empty:"この言語で読める記事はまだありません。", discover:"記事アーカイブ", zen:"集中読書モード", exitZen:"読書モードを終了", failure:"記事を開けませんでした。もう一度お試しください。"}
};
export function initJapanExperience({applyAppearance, articles, getCopy, openArticle, navigate, closeLegacyAppearance}) {
  const publicView = () => document.body.classList.contains("jm-public");
  const text = key => copy[["en", "ja"].includes(root.lang) ? root.lang : "mn"][key];
  const selectors = [...document.querySelectorAll("#public-appearance,#public-appearance-mobile")];
  const persist = () => { try { localStorage.setItem(PIXEL_SETTINGS_KEY, JSON.stringify({appearance:settings.appearance})); } catch { /* In-memory preferences still work. */ } };
  function updateMotion() {
    root.dataset.motion = settings.motion === "off" ? "off" : settings.motion === "reduced" || systemMotion.matches ? "reduced" : "on";
  }
  function updateAppearance() {
    selectors.forEach(select => { select.value = settings.appearance; });
    if (publicView()) applyAppearance(resolveJapanAppearance(), false);
    updateMotion();
  }
  selectors.forEach(select => select.addEventListener("change", () => {
    if (!appearances.includes(select.value)) return;
    settings.appearance = select.value;
    persist(); updateAppearance();
  }));
  const omikuji = document.createElement("dialog");
  omikuji.id = "japan-omikuji"; omikuji.className = "japan-dialog";
  omikuji.setAttribute("aria-labelledby", "japan-omikuji-title");
  omikuji.innerHTML = `<div class="japan-dialog-head"><div><span aria-hidden="true">GNWAA / DRAW</span><h2 id="japan-omikuji-title" data-copy="random"></h2></div><button type="button" data-close data-copy="close"></button></div><p data-copy="prompt"></p><div id="omikuji-result" role="status" aria-live="polite" aria-atomic="true"><h3 id="omikuji-title"></h3><p id="omikuji-summary"></p></div><div class="japan-dialog-actions"><button type="button" id="omikuji-read" data-copy="open"></button><button type="button" id="omikuji-draw" data-copy="draw"></button><a href="/discover" id="omikuji-discover" data-copy="discover"></a></div>`;
  document.body.append(omikuji);
  let returnFocus = null, selected = null;
  omikuji.querySelector("[data-close]").addEventListener("click", () => omikuji.close());
  omikuji.addEventListener("close", () => {
    if (returnFocus?.isConnected && returnFocus.getClientRects().length) returnFocus.focus();
  });
  function showSelection() {
    const content = selected ? getCopy(selected, root.lang) : null;
    omikuji.querySelector("#omikuji-title").textContent = content?.title || text("empty");
    omikuji.querySelector("#omikuji-summary").textContent = content?.summary || "";
    omikuji.querySelector("#omikuji-read").hidden = !selected;
  }
  function draw() { selected = chooseDiscovery(articles, root.lang, getCopy, Math.random, selected?.slug); showSelection(); }
  document.addEventListener("click", event => {
    const opener = event.target.closest("[data-omikuji-open]");
    if (!opener || !publicView()) return;
    returnFocus = opener; draw(); omikuji.showModal(); omikuji.querySelector("[data-close]").focus();
  });
  omikuji.querySelector("#omikuji-draw").addEventListener("click", draw);
  omikuji.querySelector("#omikuji-read").addEventListener("click", () => {
    if (!selected) return;
    try { omikuji.close(); openArticle(selected.slug); }
    catch { selected = null; omikuji.querySelector("#omikuji-title").textContent = text("failure"); omikuji.querySelector("#omikuji-read").hidden = true; if (!omikuji.open) omikuji.showModal(); }
  });
  omikuji.querySelector("#omikuji-discover").addEventListener("click", event => { event.preventDefault(); omikuji.close(); navigate("discover"); });
  const archiveEntry = document.createElement("button");
  archiveEntry.type = "button"; archiveEntry.id = "japan-discover-omikuji"; archiveEntry.className = "japan-omikuji-entry";
  archiveEntry.dataset.omikujiOpen = ""; archiveEntry.setAttribute("aria-haspopup", "dialog"); archiveEntry.setAttribute("aria-controls", "japan-omikuji");
  document.querySelector("#discover-listing").prepend(archiveEntry);
  const zenButton = document.createElement("button");
  zenButton.type = "button"; zenButton.id = "japan-zen";
  document.querySelector(".discover-article-topline").prepend(zenButton);
  let zen = false;
  try { zen = sessionStorage.getItem("gnwaa-japan-zen-v1") === "true"; } catch { /* Optional storage. */ }
  zenButton.addEventListener("click", () => { zen = !zen; try { sessionStorage.setItem("gnwaa-japan-zen-v1", String(zen)); } catch { /* Optional storage. */ } refresh(); });
  let wasPublic = publicView(), lastRoute = location.pathname + location.hash;
  function refresh() {
    const reading = publicView() && !document.querySelector("#discover-article-view").hidden && location.pathname.startsWith("/discover/");
    document.body.classList.toggle("japan-zen", reading && zen);
    zenButton.textContent = text(zen ? "exitZen" : "zen"); zenButton.setAttribute("aria-pressed", String(zen));
    omikuji.querySelectorAll("[data-copy]").forEach(node => { node.textContent = text(node.dataset.copy); });
    archiveEntry.textContent = text("random");
    if (omikuji.open) showSelection();
    if (publicView() && document.querySelector("#theme-studio-dialog")?.open) closeLegacyAppearance();
    if (wasPublic !== publicView()) {
      wasPublic = publicView();
      let ownerAppearance = "dark";
      try { ownerAppearance = localStorage.getItem("ganbat-customer-theme") === "light" ? "light" : "dark"; } catch { /* Optional storage. */ }
      applyAppearance(wasPublic ? resolveJapanAppearance() : ownerAppearance, false);
    }
    updateAppearance();
  }
  window.addEventListener("gnwaa:public-view", () => {
    if (lastRoute !== location.pathname + location.hash) { if (omikuji.open) omikuji.close(); lastRoute = location.pathname + location.hash; }
    refresh();
  });
  new MutationObserver(refresh).observe(root, {attributes:true, attributeFilter:["lang"]});
  window.addEventListener("storage", event => {
    if (event.key !== PIXEL_SETTINGS_KEY) return;
    const incoming = read(PIXEL_SETTINGS_KEY).appearance;
    if (appearances.includes(incoming)) { settings.appearance = incoming; updateAppearance(); }
  });
  systemTheme.addEventListener("change", () => { if (settings.appearance === "system") updateAppearance(); });
  systemMotion.addEventListener("change", updateMotion);
  updateAppearance(); refresh();
}

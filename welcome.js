import { welcomeBackgroundMarkup } from "./welcome-background.js";
export const WELCOME_KEY = "gnwaa-welcome-v1";
export function welcomeState(storage) {
  let completed = false;
  try { completed = storage?.getItem(WELCOME_KEY) === "done"; } catch {}
  return {
    shouldShow: path => path === "/" && !completed,
    complete() { completed = true; try { storage?.setItem(WELCOME_KEY, "done"); } catch {} }
  };
}
const escape = value => String(value).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[c]);
export function welcomeMarkup(t, language, appearance) {
  return `<div class="tw-bar"><span class="tw-dots" aria-hidden="true"><svg class="mn-terminal-mark" viewBox="0 0 32 32" focusable="false"><use href="/images/mongolian-ui.svg#ger-icon"/></svg></span><svg viewBox="0 0 39 9" aria-hidden="true"><use href="/images/pixel-zen.svg#wordmark"/></svg><span aria-hidden="true">~/welcome</span></div>
    <div class="tw-body"><div class="tw-settings"><label>${escape(t("pz.language"))}<select data-welcome-language>${["mn","en","ja"].map(value=>`<option value="${value}" ${value===language?"selected":""}>${value.toUpperCase()}</option>`).join("")}</select></label><label>${escape(t("pz.appearance"))}<select data-welcome-theme>${["light","dark","system"].map(value=>`<option value="${value}" ${value===appearance?"selected":""}>${escape(t("pz."+value))}</option>`).join("")}</select></label></div>
    <p class="tw-command"><span>visitor@gnwaa:~$</span> whoami</p>
    <div class="tw-introduction"><h1 id="terminal-welcome-title">${escape(t("pz.welcomeTitle"))}</h1><p>${escape(t("pz.welcomeFirst"))}</p><p>${escape(t("pz.welcomeSecond"))}</p></div>
    <div class="tw-sections"><p class="tw-command"><span>visitor@gnwaa:~$</span> ls</p><ul><li>/projects</li><li>/playground</li><li>/about<span class="tw-cursor" aria-hidden="true">▌</span></li></ul></div>
    <button class="pz-button pz-button--primary tw-enter" data-welcome-enter type="button" autofocus>${escape(t("pz.welcomeEnter"))}</button></div>`;
}
export function initWelcome({translate, getLanguage, setLanguage, navigate, getPage = () => "home"}) {
  let storage;
  try { storage = window.localStorage; } catch {}
  const state = welcomeState(storage);
  if (document.querySelector("#welcome-view")) return;
  const app = document.querySelector(".app-layout");
  const view = document.createElement("section");
  view.id = "welcome-view";
  view.className = "welcome-view";
  view.hidden = true;
  view.setAttribute("aria-labelledby", "terminal-welcome-title");
  view.innerHTML = welcomeBackgroundMarkup();
  const dialog = document.createElement("section");
  dialog.id = "terminal-welcome";
  dialog.className = "terminal-welcome";
  dialog.setAttribute("aria-labelledby", "terminal-welcome-title");
  view.append(dialog);
  document.body.append(view);
  let active = false, previousInert = false, previousHidden = false, exitAnimation;
  let renderedLanguage;
  const render = () => {
    const active = dialog.contains(document.activeElement) ? document.activeElement?.tagName === "SELECT" ? document.activeElement.hasAttribute("data-welcome-language") ? "[data-welcome-language]" : "[data-welcome-theme]" : "[data-welcome-enter]" : null;
    dialog.innerHTML = welcomeMarkup(translate, getLanguage(), document.querySelector("#public-appearance")?.value || "system");
    renderedLanguage = getLanguage();
    if(active) dialog.querySelector(active)?.focus({preventScroll:true});
  };
  const close = (complete, focus = true) => {
    if(!active) return;
    active = false;
    if(complete) state.complete();
    document.documentElement.classList.remove("welcome-open");
    if(app) app.hidden = previousHidden;
    if(app && !/^\/(admin|login)(?:\/|$)/.test(location.pathname)) app.inert = previousInert;
    view.inert = true;
    view.classList.add("is-exiting");
    if(focus) document.querySelector("#main")?.focus({preventScroll:true});
    const finish = () => { if(!active) {view.hidden=true;view.classList.remove("is-exiting");} };
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches || ["off","reduced"].includes(document.documentElement.dataset.motion);
    if(complete && !reduced && view.animate) {
      exitAnimation = view.animate([{opacity:1},{opacity:0}],{duration:180,easing:"ease-out"});
      exitAnimation.finished.then(finish,finish);
    } else finish();
  };
  const open = () => {
    if(active) return;
    active = true;
    exitAnimation?.cancel();
    view.classList.remove("is-exiting");
    view.inert = false;
    render();
    previousInert = app?.inert || false;
    previousHidden = app?.hidden || false;
    if(app) {app.inert = true;app.hidden = true;}
    document.documentElement.classList.add("welcome-open");
    view.hidden = false;
    view.scrollTop = 0;
    dialog.querySelector("[data-welcome-enter]")?.focus({preventScroll:true});
  };
  dialog.addEventListener("click", event => {if(event.target.closest("[data-welcome-enter]"))close(true);});
  dialog.addEventListener("keydown", event => {
    if(event.key==="Escape") {event.preventDefault();close(true);return;}
    if(event.key==="Tab") {
      const controls=[...view.querySelectorAll("select,button")];
      const first=controls[0], last=controls.at(-1);
      if(event.shiftKey && document.activeElement===first) {event.preventDefault();last.focus();}
      else if(!event.shiftKey && document.activeElement===last) {event.preventDefault();first.focus();}
      return;
    }
    if(event.key!=="Enter" || event.isComposing || event.altKey || event.ctrlKey || event.metaKey) return;
    if(event.target.closest("select,input,textarea,a,[contenteditable=true]")) return;
    event.preventDefault();close(true);
  });
  dialog.addEventListener("change", event => {
    if(event.target.matches("[data-welcome-language]")) setLanguage(event.target.value);
    if(event.target.matches("[data-welcome-theme]")) {
      const control=document.querySelector("#public-appearance");
      control.value=event.target.value;control.dispatchEvent(new Event("change",{bubbles:true}));
    }
  });
  document.addEventListener("click", event => {
    if(!event.target.closest("[data-welcome-replay]"))return;
    navigate("home");open();
  });
  window.addEventListener("gnwaa:public-view", () => {
    if(!active)return;
    if(location.pathname!=="/" || getPage()!=="home")close(false,false);
    else if(renderedLanguage!==getLanguage())render();
  });
  if(getPage()==="home" && state.shouldShow(location.pathname))open();
  return {open,close};
}

import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { PORTFOLIO_COPY } from "../portfolio-copy.js";
import { initPortfolio } from "../portfolio.js";
import { PROJECTS } from "../portfolio-data.js";

const read = file => readFile(new URL("../" + file, import.meta.url), "utf8");
const [html, app, css, portfolio, settings, sprite, favicon] = await Promise.all(
  ["index.html", "app.js", "pixel-zen.css", "portfolio.js", "japan-experience.js", "public/images/pixel-zen.svg", "public/images/pixel-zen-mark.svg"].map(read)
);
const vercel = JSON.parse(await read("vercel.json"));
const publicNav = html.match(/<nav class="pz-nav"[\s\S]*?<\/nav>/)?.[0];
assert.ok(publicNav);
assert.deepEqual([...publicNav.matchAll(/data-page-link="([^"]+)"/g)].map(match => match[1]), ["home","projects","playground","about"]);
assert.doesNotMatch(publicNav, /discover|randomizer/i);
assert.doesNotMatch(html, /matrix-loader|jm-navigation|jm-petals|inert aria-hidden="true"/);
assert.doesNotMatch(app, /startMatrixSplash|startMatrixRain|welcomeIntroKey/);
assert.match(app, /legacyStyleUrl from "\.\/style\.css\?url"/);
assert.match(app, /legacyStyles\.disabled = document\.body\.classList\.contains\("jm-public"\)/);
assert.doesNotMatch(html, /href="(?:style|japanese-modern|brand-identity|japan-experience)\.css"/);
assert.doesNotMatch(css, /gradient|box-shadow:\s*(?!none)[^;]+;/);
assert.match(css, /shape-rendering:crispEdges/);
assert.match(css, /prefers-reduced-motion/);
assert.match(css, /pz-desktop-appearance\{display:none\}/);
assert.match(sprite, /shape-rendering="crispEdges"/);
for(const id of ["fuji","wordmark","laptop","gamepad"]) assert.ok(sprite.includes('id="'+id+'"'),"Original pixel asset: "+id);
assert.match(sprite, /id="fuji" viewBox="0 0 480 300"/);
assert.match(css, /--background:#111F2E/);
assert.match(css, /--font-display:"GNWAA Pixel"/);
assert.match(css, /\.pz-intro h1 \{[^}]*font-weight:400;line-height:1\.25/);
assert.match(css, /\.pz-button--primary \{background:var\(--accent\);color:var\(--background\)/);
assert.match(css, /pz-home-active #public-footer\{display:none\}/);
assert.doesNotMatch(html+app+css+portfolio, /design-reference\.png/,"The approved screenshot must never be embedded in the frontend.");
assert.match(favicon, /viewBox="0 0 32 32"/);
const luminance=hex=>{
  const values=hex.match(/\w\w/g).map(value=>parseInt(value,16)/255).map(value=>value<=.04045?value/12.92:((value+.055)/1.055)**2.4);
  return .2126*values[0]+.7152*values[1]+.0722*values[2];
};
for(const declaration of [css.match(/:root \{([^}]+)\}/)[1],css.match(/:root\[data-theme="dark"\] \{([^}]+)\}/)[1],css.match(/:root\[data-theme="light"\] \{([^}]+)\}/)[1]]) {
  const colors=Object.fromEntries([...declaration.matchAll(/--(background|surface|text-primary|text-secondary|accent):#([a-f0-9]{6})/gi)].map(match=>[match[1],luminance(match[2])]));
  for(const background of ["background","surface"])for(const foreground of ["text-primary","text-secondary","accent"]) {
    const ordered=[colors[background],colors[foreground]].sort((a,b)=>a-b);
    assert.ok((ordered[1]+.05)/(ordered[0]+.05)>=4.5,foreground+" on "+background+" meets normal text contrast");
  }
}
for (const route of ["/projects","/projects/gnwaa","/projects/randomizer","/playground","/about","/lab","/randomizer","/randomizer/movie","/randomizer/food","/discover","/discover/:path*","/admin","/login"]) {
  assert.ok(vercel.rewrites.some(rewrite => rewrite.source === route && rewrite.destination === "/"), route + " deep-link shell");
}
assert.ok(vercel.rewrites.every(rewrite => !rewrite.source.startsWith("/api")), "API routes are not captured by an SPA wildcard.");
const keys = Object.keys(PORTFOLIO_COPY.en).sort();
for (const locale of ["mn","en","ja"]) {
  assert.deepEqual(Object.keys(PORTFOLIO_COPY[locale]).sort(), keys, locale + " translation parity");
  assert.ok(Object.values(PORTFOLIO_COPY[locale]).every(value => typeof value === "string" && value.trim()));
}

assert.equal(PROJECTS.length,2);
assert.equal(PROJECTS.filter(project=>project.kind==="project").length,1);
for(const project of PROJECTS) {
  assert.ok(project.source==="https://github.com/gnbaeu/postgres-crud");
  if(project.preview) {
    const image=await readFile(new URL("../public"+project.preview.src,import.meta.url));
    assert.equal(image.toString("ascii",0,4),"RIFF");assert.equal(image.toString("ascii",8,12),"WEBP");
    assert.ok(project.preview.width>0&&project.preview.height>0);
    assert.ok(project.preview.sourcePath.startsWith("/"));
  }
}
console.log("Genuine project screenshots configured:",PROJECTS.filter(project=>project.preview).length,"— no image is fabricated when capture is unavailable.");

// Component behavior with a small DOM adapter. This verifies events/rendering,
// not browser layout, hit testing, screenshots, or native accessibility behavior.
class Node {
  constructor() { this.dataset={}; this.attributes={}; this.listeners={}; this.value=""; this.innerHTML=""; this.textContent=""; this.hidden=false; this.isConnected=true; this.classes=new Set(); this.classList={contains:key=>this.classes.has(key),toggle:(key,on)=>{if(on)this.classes.add(key);else this.classes.delete(key);}}; }
  setAttribute(key,value) {this.attributes[key]=String(value);}
  removeAttribute(key) {delete this.attributes[key];}
  addEventListener(key,handler) {this.listeners[key]=handler;}
  focus() {this.focused=true;}
  getClientRects() {return [{}];}
}
const elements = new Map();
const node = selector => {if(!elements.has(selector))elements.set(selector,new Node());return elements.get(selector);};
const pages = ["home","projects","projectCase","randomizerCase","playground","about"];
pages.forEach(page => node('[data-page-view="'+page+'"]'));
const nav = ["home","projects","playground","about"].map(page=>{const value=new Node();value.dataset.pageLink=page;return value;});
const documentEvents = {}, windowEvents = {};
globalThis.location={pathname:"/",hash:"",search:""};
globalThis.document={
  body:node("body"),
  querySelector:node,
  querySelectorAll:selector=>selector==="#public-nav a"?nav:[],
  addEventListener:(event,handler)=>{documentEvents[event]=handler;}
};
globalThis.window={scrollTo(){},addEventListener:(event,handler)=>{windowEvents[event]=handler;}};
globalThis.requestAnimationFrame=handler=>handler();
let locale="en", page="home", navigated=null, lab=null;
const missing=[];
initPortfolio({
  translate:key=>{const value=PORTFOLIO_COPY[locale][key];if(!value)missing.push(key);return value||key;},
  getLanguage:()=>locale,setLanguage:value=>{locale=value;},getPage:()=>page,
  navigate:value=>{navigated=value;},openLab:value=>{lab=value;}
});
for (const lang of ["en","mn","ja"]) {
  locale=lang; windowEvents["gnwaa:public-view"]();
  assert.ok(node('[data-page-view="home"]').innerHTML.includes(PORTFOLIO_COPY[lang]["pz.headline"]));
  const home=node('[data-page-view="home"]').innerHTML;
  assert.doesNotMatch(home,/<button|<section|data-project-kind|data-quick-draw|pz-workbench/,"Home is one hero with three route links");
  assert.equal((home.match(/data-pz-route=/g)||[]).length,3);
  assert.match(home,/class="mp-world-image"/);
  assert.match(home,/data-scene-layer="walkers"/);
  assert.doesNotMatch(home,/design-reference/);
  assert.match(home,/PORTFOLIO \/ DIGITAL PLAYGROUND/);
  const playground=node('[data-page-view="playground"]').innerHTML;
  assert.match(playground,/data-quick-draw/);
  assert.match(playground,/mn-landscape--camp/);
  assert.match(home,/mp-ambient-clouds/);
  assert.match(playground,/quick-draw-live[^>]*role="status"[^>]*aria-live="polite"/);
  assert.equal((node('[data-page-view="projects"]').innerHTML.match(/data-project-kind="project"/g)||[]).length,1,"Only one verified standalone project");
  assert.equal((node('[data-page-view="projects"]').innerHTML.match(/data-project-kind="feature"/g)||[]).length,1,"Randomizer is labelled as a feature");
  assert.match(node('[data-page-view="projects"]').innerHTML,/href="\/projects\/randomizer" data-pz-route="randomizerCase"/);
  for (const key of ["projectCase","randomizerCase"]) assert.equal((node('[data-page-view="'+key+'"]').innerHTML.match(/<section>/g)||[]).length,7,"Seven factual case-study sections");
  const about=node('[data-page-view="about"]').innerHTML;
  assert.match(about,/mn-landscape--steppe/);
  assert.match(about,/ganwaa-anime-avatar\.webp/); assert.doesNotMatch(about,/github\.com/);
  assert.match(node('[data-page-view="playground"]').innerHTML,/data-omikuji-open/);
  for (const tool of ["universe","detective","personality"]) assert.ok(node('[data-page-view="playground"]').innerHTML.includes('data-pz-lab="'+tool+'"'));
}
assert.deepEqual(missing,[]);
node("#public-menu-toggle").listeners.click();
assert.equal(node("#public-menu-toggle").attributes["aria-expanded"],"true");
documentEvents.keydown({key:"Escape"});
assert.equal(node("#public-menu-toggle").attributes["aria-expanded"],"false");
assert.equal(node("#public-menu-toggle").focused,true);
let prevented=false;
documentEvents.click({target:{closest:()=>({dataset:{pzRoute:"projects"}})},button:0,preventDefault(){prevented=true;}});
assert.equal(navigated,"projects"); assert.equal(prevented,true);
documentEvents.click({target:{closest:()=>({dataset:{pzLab:"detective"}})},button:0,preventDefault(){}});
assert.equal(lab,"detective");
for(const path of ["/randomizer/movie","/lab","/discover/article"]) {
  location.pathname=path;page="randomizer";windowEvents["gnwaa:public-view"]();
  assert.equal(nav.find(value=>value.dataset.pageLink==="playground").attributes["aria-current"],"page");
}
location.pathname="/projects/gnwaa";page="projectCase";windowEvents["gnwaa:public-view"]();
assert.equal(nav.find(value=>value.dataset.pageLink==="projects").attributes["aria-current"],"page");
assert.match(settings,/PIXEL_SETTINGS_KEY/);assert.doesNotMatch(settings,/japan-settings|japan-season|japan-auto-season/);

// Run the actual preference/Omikuji module against isolated storage and media.
const storage=new Map([["gnwaa-japan-experience-v1",JSON.stringify({appearance:"dark",motion:"off",season:"winter"})]]);
globalThis.localStorage={getItem:key=>storage.get(key)||null,setItem:(key,value)=>storage.set(key,value)};
globalThis.sessionStorage={getItem:()=>null,setItem(){}};
const themeMedia={matches:false,addEventListener(_event,handler){this.change=handler;}};
const motionMedia={matches:false,addEventListener(_event,handler){this.change=handler;}};
window.matchMedia=query=>query.includes("color-scheme")?themeMedia:motionMedia;
document.documentElement=node("root");document.documentElement.lang="en";
document.body.classList.toggle("jm-public",true);
document.body.append=()=>{};
document.createElement=()=>{const value=new Node();value.querySelector=selector=>node("dialog "+selector);value.querySelectorAll=()=>[];value.showModal=()=>{value.open=true;};value.close=()=>{value.open=false;};return value;};
node("#discover-listing").prepend=()=>{};node(".discover-article-topline").prepend=()=>{};
node("#discover-article-view").hidden=true;
document.querySelectorAll=selector=>selector==="#public-appearance,#public-appearance-mobile"?[node("#public-appearance"),node("#public-appearance-mobile")]:[];
globalThis.MutationObserver=class {observe(){}};
const experience=await import("data:text/javascript;base64,"+Buffer.from(settings).toString("base64"));
assert.equal(experience.resolveJapanAppearance(),"dark","Migrate the previous appearance");
let applied=null;
experience.initJapanExperience({applyAppearance:value=>{applied=value;},articles:[],getCopy:()=>null,openArticle(){},navigate(){},closeLegacyAppearance(){}});
assert.equal(document.documentElement.dataset.motion,"off","Old Motion Off still applies");
assert.equal(applied,"dark");
node("#public-appearance").value="light";node("#public-appearance").listeners.change();
assert.equal(applied,"light");assert.equal(node("#public-appearance-mobile").value,"light");
assert.equal(JSON.parse(storage.get(experience.PIXEL_SETTINGS_KEY)).appearance,"light");
assert.equal(JSON.parse(storage.get(experience.JAPAN_SETTINGS_KEY)).season,"winter","Legacy settings retained");
node("#public-appearance-mobile").value="system";node("#public-appearance-mobile").listeners.change();
themeMedia.matches=true;themeMedia.change();assert.equal(applied,"dark","Live System appearance");
themeMedia.matches=false;themeMedia.change();assert.equal(applied,"light");
localStorage.setItem=()=>{throw Error("blocked");};
node("#public-appearance").value="dark";assert.doesNotThrow(()=>node("#public-appearance").listeners.change());
assert.equal(applied,"dark","Blocked storage keeps in-memory selection");
const articles=[{slug:"a",status:"published",title:"A",summary:"a"},{slug:"b",status:"published",title:"B",summary:"b"},{slug:"draft",status:"draft",title:"Draft",summary:"x"}];
assert.equal(experience.chooseDiscovery(articles,"en",item=>item,()=>0,"a").slug,"b");
assert.equal(experience.chooseDiscovery([],"en",item=>item),null);
assert.equal(experience.chooseDiscovery(articles,"en",()=>null),null);
console.log("Pixel Zen checks passed: four core pages + case study, 3-language rendering, nav/menu events, compatibility rewrites, preference migration/persistence/System, Motion Off, Omikuji and safe storage. Browser layout remains a separate check.");

// Prerequisites: Vite on 127.0.0.1:5175 and an isolated Chrome/Edge profile on CDP port 9225.
// Never attach a personal browser profile: this suite clears storage for the test origin.
import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import { resolve, join } from "node:path";
import { MOVIES, FOODS } from "../randomizer-data.js";
import { eligibleItems, storageKey } from "../randomizer-core.js";

const origin = process.env.GNWAA_TEST_ORIGIN || "http://127.0.0.1:5175";
const screenshots = resolve("artifacts/randomizer");
let target;
try {
  target = await (await fetch("http://127.0.0.1:9225/json/new?about:blank",{method:"PUT"})).json();
} catch {
  throw new Error("No isolated debugging browser on port 9225. Start Chrome/Edge with a temporary --user-data-dir and --remote-debugging-port=9225, then rerun npm run check:randomizer:browser.");
}
const ws = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((resolve,reject) => { ws.addEventListener("open",resolve,{once:true}); ws.addEventListener("error",reject,{once:true}); });
let sequence = 0;
const pending = new Map();
const events = [];
ws.addEventListener("message",event => {
  const message = JSON.parse(event.data);
  if (message.id) { pending.get(message.id)?.(message); pending.delete(message.id); }
  else events.push(message);
});
const send = (method,params={}) => new Promise((resolve,reject) => {
  const id=++sequence;
  pending.set(id,message=>message.error ? reject(message.error) : resolve(message.result));
  ws.send(JSON.stringify({id,method,params}));
});
const evaluate = async expression => {
  const result=await send("Runtime.evaluate",{expression,returnByValue:true,awaitPromise:true});
  if(result.exceptionDetails) throw new Error(JSON.stringify(result.exceptionDetails));
  return result.result.value;
};
const delay = ms => new Promise(resolve=>setTimeout(resolve,ms));
const waitFor = async (expression,label) => {
  const until=Date.now()+12000;
  while(Date.now()<until) { if(await evaluate(expression)) return; await delay(60); }
  throw new Error("Timed out: "+label);
};
const click = async selector => {
  const point=await evaluate(`(async()=>{const el=[...document.querySelectorAll(${JSON.stringify(selector)})].find(el=>el.getClientRects().length);if(!el)throw Error('Missing '+${JSON.stringify(selector)});el.scrollIntoView({block:'center',behavior:'instant'});await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));const r=el.getBoundingClientRect();const x=r.x+r.width/2,y=r.y+r.height/2;if(el.closest('[inert]')||!el.contains(document.elementFromPoint(x,y)))throw Error('Blocked click '+${JSON.stringify(selector)});return{x,y}})()`);
  await send("Input.dispatchMouseEvent",{type:"mousePressed",button:"left",clickCount:1,...point});
  await send("Input.dispatchMouseEvent",{type:"mouseReleased",button:"left",clickCount:1,...point});
};
const ready = async path => {
  await waitFor(`location.pathname===${JSON.stringify(path)} && document.readyState==='complete' && document.querySelector('#matrix-loader')===null && !document.querySelector('#main').inert && !document.querySelector('#randomizer-view').hidden`,path);
};
const navigate = async path => { await send("Page.navigate",{url:origin+path}); await ready(path); };
const reload = async path => { await send("Page.reload"); await delay(150); await ready(path); };
const locale = async language => {
  await evaluate(`(()=>{const el=document.querySelector('#randomizer-language');el.value=${JSON.stringify(language)};el.dispatchEvent(new Event('change',{bubbles:true}))})()`);
  assert.equal(await evaluate("document.documentElement.lang"),language);
};
const screen = async (name,full=false) => {
  await mkdir(screenshots,{recursive:true});
  const metrics=await send("Page.getLayoutMetrics");
  const clip=full ? {x:0,y:0,width:metrics.cssContentSize.width,height:metrics.cssContentSize.height,scale:1} : undefined;
  const {data}=await send("Page.captureScreenshot",{format:"png",captureBeyondViewport:full,...(clip?{clip}:{})});
  await writeFile(join(screenshots,name),Buffer.from(data,"base64"));
};
const count = () => evaluate("Number(document.querySelector('#rz-selected-count').dataset.count)");
const eligible = () => evaluate("Number(document.querySelector('#rz-eligible-count').dataset.count)");
const resultId = () => evaluate("document.querySelector('[data-result-id]')?.dataset.resultId");
const saved = type => evaluate(`JSON.parse(localStorage.getItem(${JSON.stringify(storageKey(type))})||'{}')`);
const choose = id => click('.rz-chip[data-id="'+id+'"]');
const draw = async () => { await click("#rz-draw"); await waitFor("!!document.querySelector('[data-result-id]') && !document.querySelector('.rz-drawing')","draw complete"); return resultId(); };
const viewport = async width => {
  await send("Emulation.setDeviceMetricsOverride",{width,height:1100,deviceScaleFactor:1,mobile:width<768});
  await delay(80);
};
try {
  await send("Page.enable"); await send("Runtime.enable"); await send("Network.enable");
  await send("Storage.clearDataForOrigin",{origin,storageTypes:"all"});
  await send("Page.addScriptToEvaluateOnNewDocument",{source:`localStorage.setItem('gnwaa-welcome-v1','done');sessionStorage.setItem('gnwaa-welcome-intro-seen-v1','shown');if(!localStorage.getItem('gnwaa-japan-experience-v1'))localStorage.setItem('gnwaa-japan-experience-v1',JSON.stringify({appearance:'dark',motion:'off',season:'spring'}));`});
  await viewport(1440);
  await navigate("/randomizer");
  await locale("en");
  assert.equal(await evaluate("document.querySelectorAll('.rz-choice').length"),2);
  assert.equal(await evaluate("document.querySelector('#public-nav [data-page-link=\"playground\"]').getAttribute('aria-current')"),"page");
  await screen("randomizer-landing-1440.png",true);
  await click('[data-rz-route="randomizerMovie"]'); await ready("/randomizer/movie");
  assert.equal(await evaluate("document.querySelectorAll('.rz-chip').length"),19);
  assert.equal(await count(),0); assert.equal(await eligible(),MOVIES.length);
  await screen("movie-selection-1440.png",true);
  await choose("action"); assert.equal(await count(),1); assert.equal(await eligible(),eligibleItems(MOVIES,["action"]).length);
  await choose("science-fiction"); await choose("thriller");
  assert.equal(await eligible(),eligibleItems(MOVIES,["action","science-fiction","thriller"],"any").length);
  await click('[data-mode="all"]');
  assert.equal(await eligible(),eligibleItems(MOVIES,["action","science-fiction","thriller"],"all").length);
  await choose("crime"); await choose("history"); assert.equal(await count(),5);
  await choose("documentary"); assert.equal(await count(),5);
  assert.ok(await evaluate("document.querySelector('#rz-limit').textContent.length>0"));
  await choose("action"); assert.equal(await count(),4);
  await click('[data-rz-focus="clear"]'); assert.equal(await count(),0); assert.equal(await eligible(),MOVIES.length);
  // Native keyboard input toggles chips and retains a visible focus indication.
  await evaluate("document.querySelector('.rz-chip[data-id=\"action\"]').focus()");
  await send("Input.dispatchKeyEvent",{type:"keyDown",key:" ",code:"Space",windowsVirtualKeyCode:32});
  await send("Input.dispatchKeyEvent",{type:"keyUp",key:" ",code:"Space",windowsVirtualKeyCode:32});
  assert.equal(await count(),1);
  assert.ok(await evaluate("getComputedStyle(document.activeElement).outlineStyle!=='none'"));
  await click('[data-rz-focus="clear"]');
  await choose("documentary"); await choose("western");
  assert.equal(await eligible(),0); assert.ok(await evaluate("!!document.querySelector('[data-rz-empty]')"));
  await click("#rz-draw");
  assert.equal((await saved("movie")).history?.length || 0,0,"Failed draws do not enter history.");
  await click('[data-rz-focus="empty-any"]'); assert.ok(await eligible()>0);
  await click('[data-rz-focus="clear"]');
  const first=await draw();
  const second=await draw(); assert.notEqual(first,second,"No immediate repetition.");
  await click('[data-rz-focus="result-favorite"]');
  assert.equal(await evaluate("document.querySelector('[data-rz-focus=\"result-favorite\"]').getAttribute('aria-pressed')"),"true");
  assert.ok((await saved("movie")).favorites.includes(second));
  await screen("movie-result-1440.png",true);
  await reload("/randomizer/movie");
  assert.ok((await saved("movie")).favorites.includes(second));
  assert.equal((await saved("movie")).history.length,2);
  assert.notEqual(await draw(),second,"The latest saved draw is not immediately repeated after reload.");
  await click('[data-rz-focus="favorites-'+second+'"]'); assert.equal(await resultId(),second);
  await click('[data-rz-route="randomizer"]'); await ready("/randomizer");
  await click('[data-rz-route="randomizerFood"]'); await ready("/randomizer/food");
  assert.equal(await evaluate("document.querySelectorAll('.rz-chip').length"),12);
  await screen("food-selection-1440.png",true);
  await choose("japanese"); await choose("vegetarian"); await click('[data-mode="all"]');
  assert.equal(await eligible(),eligibleItems(FOODS,["japanese","vegetarian"],"all").length);
  const foodId=await draw(); assert.ok(FOODS.find(item=>item.id===foodId).categories.includes("vegetarian"));
  await click('[data-rz-focus="result-favorite"]');
  await screen("food-result-1440.png",true);
  assert.deepEqual((await saved("movie")).favorites,[second]);
  await reload("/randomizer/food");
  assert.ok((await saved("food")).favorites.includes(foodId));
  assert.equal((await saved("food")).history[0].id,foodId);
  for(const language of ["mn","en","ja"]) {
    await locale(language);
    const expected={mn:"Туршилтууд",en:"Playground",ja:"実験室"}[language];
    assert.equal(await evaluate("document.querySelector('#public-nav [data-page-link=\"playground\"]').textContent"),expected);
    assert.ok(await evaluate("![...document.querySelectorAll('#randomizer-content button')].some(el=>el.textContent.includes('randomizer.'))"));
  }
  await click('[data-rz-route="randomizer"]'); await ready("/randomizer");
  assert.equal(await evaluate("document.querySelector('#randomizer-title').textContent"),"今日は何を選ぶ？");
  await send("Page.reload"); await delay(150); await ready("/randomizer");
  assert.equal(await evaluate("document.documentElement.lang"),"ja");
  await click('[data-rz-route="randomizerMovie"]'); await ready("/randomizer/movie");
  await evaluate("history.back()"); await ready("/randomizer");
  await evaluate("history.forward()"); await ready("/randomizer/movie");
  await locale("en");
  // Exercise the 640ms reveal and the duplicate-draw lock with Motion On.
  await evaluate("localStorage.setItem('gnwaa-japan-experience-v1',JSON.stringify({appearance:'dark',motion:'on'}))");
  await reload("/randomizer/movie");
  const before=(await saved("movie")).history.length;
  const started=Date.now(); await click("#rz-draw");
  assert.equal(await evaluate("document.querySelector('#rz-draw').disabled"),true);
  await waitFor("!!document.querySelector('[data-result-id]') && !document.querySelector('.rz-drawing')","animated reveal");
  assert.ok(Date.now()-started>=600 && Date.now()-started<1800,"Reveal is short and completes.");
  assert.ok((await saved("movie")).history.length<=before+1);
  await send("Emulation.setEmulatedMedia",{features:[{name:"prefers-reduced-motion",value:"reduce"}]});
  await draw();
  assert.equal(await evaluate("getComputedStyle(document.querySelector('.rz-result')).animationName"),"none");
  await send("Emulation.setEmulatedMedia",{features:[{name:"prefers-reduced-motion",value:"no-preference"}]});
  await evaluate("localStorage.setItem('gnwaa-japan-experience-v1',JSON.stringify({appearance:'dark',motion:'off'}))");
  await reload("/randomizer/movie");
  await draw();
  assert.equal(await evaluate("document.documentElement.dataset.motion"),"off");
  assert.equal(await evaluate("getComputedStyle(document.querySelector('.rz-result')).animationName"),"none");
  for(const width of [320,360,375,390,430,768,1024,1440]) {
    await viewport(width);
    assert.equal(await evaluate("document.documentElement.scrollWidth<=innerWidth"),true,width+"px: no horizontal overflow.");
    assert.equal(await evaluate("[...document.querySelectorAll('#randomizer-content button,#randomizer-content select,#randomizer-content a')].filter(el=>el.getClientRects().length&&!el.disabled).every(el=>{const r=el.getBoundingClientRect();return r.height>=43.5&&r.width>=43.5})"),true,width+"px: 44px controls.");
  }
  await viewport(390);
  await click("#public-menu-toggle");
  await click('#public-nav [data-page-link="playground"]');
  await waitFor("location.pathname==='/playground'", "mobile Playground");
  assert.equal(await evaluate("document.querySelector('#public-menu-toggle').getAttribute('aria-expanded')"),"false");
  await click('[data-pz-route="randomizerMovie"]'); await ready("/randomizer/movie");
  await click('[data-rz-route="randomizer"]'); await ready("/randomizer");
  await screen("randomizer-landing-390.png",true);
  await click('[data-rz-route="randomizerMovie"]'); await ready("/randomizer/movie");
  await screen("movie-selection-390.png",true);
  await draw();
  await evaluate("window.scrollTo({top:document.querySelector('#rz-result-region').getBoundingClientRect().top+scrollY-110,behavior:'instant'})");
  await screen("movie-result-390.png");
  await viewport(1440);
  await evaluate("document.querySelector('#public-appearance').value='light';document.querySelector('#public-appearance').dispatchEvent(new Event('change',{bubbles:true}))");
  assert.equal(await evaluate("document.documentElement.dataset.theme"),"light");
  await click('[data-rz-route="randomizer"]'); await ready("/randomizer");
  await screen("randomizer-light-1440.png",true);
  await navigate("/randomizer/food");
  await navigate("/randomizer/movie");
  await evaluate(`localStorage.setItem(${JSON.stringify(storageKey("movie"))},'{broken')`);
  await reload("/randomizer/movie");
  assert.equal(await evaluate("document.querySelectorAll('.rz-collection li').length"),0);
  await draw();
  assert.ok((await saved("movie")).history.length===1,"Corrupted storage recovers on the next successful draw.");
  const exceptions=events.filter(event=>event.method==="Runtime.exceptionThrown").map(event=>event.params.exceptionDetails.exception?.description);
  assert.deepEqual(exceptions,[],"No uncaught browser exceptions.");
  console.log("Randomizer browser regression passed: navigation, all filters, five-chip limit, keyboard, RNG no-repeat, local collections, MN/EN/JA, themes, motion, direct URLs and history; widths 360/375/390/430/768/1024/1440.");
  console.log("Screenshots: "+screenshots);
} finally {
  await send("Target.closeTarget",{targetId:target.id}); ws.close();
}

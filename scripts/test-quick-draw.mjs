import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createQuickDraw, quickDrawMarkup, initQuickDraw } from "../quick-draw.js";
import { MOVIES, FOODS } from "../randomizer-data.js";
import { pickItem } from "../randomizer-core.js";
import { PORTFOLIO_COPY } from "../portfolio-copy.js";
import { RANDOMIZER_COPY } from "../randomizer-copy.js";

const datasets={movie:MOVIES.slice(0,3),food:FOODS.slice(0,3)};
const firstEligible=(items,previous)=>pickItem(items,previous,null,()=>0);
const model=createQuickDraw({datasets,select:firstEligible});
assert.equal(model.state().type,"movie");
assert.equal(model.state().status,"idle");
assert.equal(model.draw().result.id,datasets.movie[0].id);
assert.equal(model.draw().result.id,datasets.movie[1].id,"No immediate movie repeat");
model.setType("food");
assert.equal(model.state().status,"idle");
assert.equal(model.draw().result.id,datasets.food[0].id);
assert.equal(model.draw().result.id,datasets.food[1].id,"No immediate food repeat");
model.setType("movie");
assert.equal(model.state().result.id,datasets.movie[1].id,"Per-type result survives switching");
assert.notEqual(model.draw().result.id,datasets.movie[1].id,"Previous movie is remembered across a food draw");
model.setType("unknown");assert.equal(model.state().type,"movie");
const empty=createQuickDraw({datasets:{movie:[],food:[]},select:firstEligible});
assert.equal(empty.draw().status,"empty");assert.equal(empty.state().result,null);
const failed=createQuickDraw({select(){throw Error("selection failed");}});
assert.equal(failed.draw().status,"error");assert.equal(failed.state().result,null);
const invalid=createQuickDraw({datasets,select:()=>({id:"not-in-the-real-collection"})});
assert.equal(invalid.draw().status,"empty","Never present an invented item");
const single=createQuickDraw({datasets:{movie:[MOVIES[0]],food:[]},select:firstEligible});
assert.equal(single.draw().result.id,MOVIES[0].id);
assert.equal(single.draw().result.id,MOVIES[0].id,"A single eligible item may repeat");

let locale="mn";
const missing=[];
const translate=key=>{
  const value=PORTFOLIO_COPY[locale][key]||RANDOMIZER_COPY[locale][key];
  if(!value)missing.push(locale+":"+key);
  return value||key;
};
for(const language of ["mn","en","ja"]) {
  locale=language;
  for(const type of ["movie","food"]) {
    model.setType(type);model.draw();
    const html=quickDrawMarkup({state:model.state(),translate,language});
    assert.ok(html.includes(PORTFOLIO_COPY[language]["pz.quickTitle"]));
    assert.ok(html.includes('data-quick-result-type="'+type+'"'));
    assert.ok(html.includes('data-quick-type="'+type+'"')&&html.includes('aria-pressed="true"'));
    assert.match(html,/href="\/randomizer\/(?:movie|food)"/);
    assert.match(html,/aria-controls="quick-draw-result"/);
    assert.match(html,/data-quick-result-id/);
  }
  for(const source of [empty,failed]) {
    const html=quickDrawMarkup({state:source.state(),translate,language});
    assert.doesNotMatch(html,/data-quick-result-id/);
    assert.ok(html.includes(translate("pz."+(source===empty?"quickEmpty":"quickError"))));
  }
  const loading=quickDrawMarkup({state:model.state(),translate,language,busy:true});
  assert.match(loading,/disabled/);
  assert.ok(loading.includes(translate("pz.quickBusy")));
}
assert.deepEqual(missing,[]);

// Component event tests. Native browser hit testing/layout are separate.
let focusRestores=0;
class Node {
  constructor(){this.dataset={};this.listeners={};this.attributes={};this.innerHTML="";this.textContent="";}
  addEventListener(name,listener){this.listeners[name]=listener;}
  setAttribute(name,value){this.attributes[name]=value;}
  contains(node){return node===active;}
  querySelector(){return {focus(){focusRestores++;}};}
}
const host=new Node(),live=new Node(),container=new Node();
container.querySelector=selector=>selector==="[data-quick-draw]"?host:selector==="#quick-draw-live"?live:null;
let active={dataset:{quickFocus:"draw"}},page="playground",navigated=null;
let eventListeners={};
globalThis.document={get activeElement(){return active;}};
globalThis.window={addEventListener:(name,listener)=>{eventListeners[name]=listener;}};
const componentModel=createQuickDraw({datasets,select:firstEligible});
initQuickDraw({container,translate,getLanguage:()=>locale,getPage:()=>page,navigate:value=>{navigated=value;},model:componentModel});
const click=(type,value,extra={})=>({
  button:0,
  target:{closest:selector=>
    type==="draw"&&selector==='[data-quick-action="draw"]'?{}:
    type==="type"&&selector==="[data-quick-type]"?{dataset:{quickType:value}}:
    type==="open"&&selector==="[data-quick-open]"?{}:null},
  preventDefault(){this.prevented=true;},
  ...extra
});
const focusBefore=focusRestores;
const pending=container.listeners.click(click("draw"));
assert.equal(host.attributes["aria-busy"],"true","Loading state starts immediately");
await container.listeners.click(click("draw"));
await pending;
assert.equal(componentModel.state().result.id,datasets.movie[0].id,"Duplicate click draws only once");
assert.equal(host.attributes["aria-busy"],"false");
assert.ok(focusRestores>focusBefore,"Keyboard draw returns focus after the disabled loading state");
assert.ok(live.textContent.includes(datasets.movie[0].title),"Actual result is announced");
await container.listeners.click(click("type","food"));
assert.equal(componentModel.state().type,"food");
await container.listeners.click(click("draw"));
assert.equal(componentModel.state().result.id,datasets.food[0].id);
const previous=componentModel.state().result.id;
const interrupted=container.listeners.click(click("draw"));
page="projects";eventListeners["gnwaa:public-view"]();await interrupted;
assert.equal(componentModel.state().result.id,previous,"Navigation cancels an unfinished draw");
assert.equal(host.attributes["aria-busy"],"false");
page="playground";eventListeners["gnwaa:public-view"]();
locale="ja";eventListeners["gnwaa:public-view"]();
assert.ok(host.innerHTML.includes(PORTFOLIO_COPY.ja["pz.quickTitle"]));
assert.ok(host.innerHTML.includes(datasets.food[0].names.ja),"Selected food localizes after a language change");
await container.listeners.click(click("open"));assert.equal(navigated,"randomizerFood");
navigated=null;await container.listeners.click(click("open",null,{ctrlKey:true}));
assert.equal(navigated,null,"Modifier-click retains native link behavior");
const source=await readFile(new URL("../quick-draw.js",import.meta.url),"utf8");
assert.match(source,/import \{ pickItem \} from "\.\/randomizer-core\.js"/);
assert.match(source,/import \{ MOVIES, FOODS,/);
assert.doesNotMatch(source,/localStorage\.|requestJson|fetch\(|setTimeout|animate\(/,"No backend, fake delay, persistent history write, or motion in Quick Draw");
console.log("Quick Draw passed: shared real data/RNG, Movie/Food, no-repeat across switching, duplicate lock, loading/empty/error states, live announcements, MN/EN/JA, route cancellation and full Randomizer links.");

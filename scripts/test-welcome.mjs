import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {WELCOME_KEY,welcomeState,welcomeMarkup,initWelcome} from '../welcome.js';
import {PORTFOLIO_COPY} from '../portfolio-copy.js';
const values=new Map();
const storage={getItem:key=>values.get(key),setItem:(key,value)=>values.set(key,value)};
const first=welcomeState(storage);
assert.equal(first.shouldShow('/'),true);
for(const path of ['/projects','/playground','/randomizer','/about','/login','/admin'])assert.equal(first.shouldShow(path),false);
first.complete();assert.equal(values.get(WELCOME_KEY),'done');assert.equal(first.shouldShow('/'),false);
assert.equal(welcomeState(storage).shouldShow('/'),false,'Refresh persistence');
for(const broken of [undefined,{getItem(){throw Error();},setItem(){throw Error();}}]){
  const state=welcomeState(broken);assert.equal(state.shouldShow('/'),true);state.complete();assert.equal(state.shouldShow('/'),false);
}
values.set(WELCOME_KEY,'corrupted');assert.equal(welcomeState(storage).shouldShow('/'),true);
for(const locale of ['mn','en','ja'])for(const theme of ['light','dark','system']){
  const markup=welcomeMarkup(key=>{assert.ok(PORTFOLIO_COPY[locale][key],key);return PORTFOLIO_COPY[locale][key];},locale,theme);
  assert.ok(markup.includes(PORTFOLIO_COPY[locale]['pz.welcomeTitle'].replaceAll('&','&amp;')));
  assert.match(markup,/whoami/);assert.match(markup,/\/projects/);assert.match(markup,/data-welcome-enter/);
  assert.doesNotMatch(markup,/aria-live|disabled|contenteditable|<input/);
}
const source=await readFile(new URL('../welcome.js',import.meta.url),'utf8');
assert.doesNotMatch(source,/setTimeout|setInterval|eval\(|new Function/);
assert.match(source,/select,input,textarea,a/);
assert.doesNotMatch(source,/showModal|createElement\("dialog"\)/);
assert.match(source,/app.inert = true/);
assert.match(source,/view.hidden = false/);assert.match(source,/preventScroll:true/);
const css=await readFile(new URL('../pixel-zen.css',import.meta.url),'utf8');
assert.match(css,/prefers-reduced-motion:reduce/);assert.match(css,/data-motion="off"/);
assert.doesNotMatch(css,/animation:pz-enter/);
console.log('Welcome checks passed: first visit, deep-link bypass, persistence, blocked/corrupted storage, 3 locales, 3 themes, complete accessible text and no second intro animation.');

// Exercise fullscreen lifecycle with a small DOM adapter (not a browser-layout test).
const nodes=new Map(),windowEvents=new Map();
function element(){
 const classes=new Set(),handlers=new Map();
 return {hidden:false,inert:false,dataset:{},classList:{add:x=>classes.add(x),remove:x=>classes.delete(x)},
 setAttribute(){},append(child){child.parent=this;nodes.set(child.id,child);},
 addEventListener(type,fn){handlers.set(type,fn);},handlers,
 contains(child){return child?.parent===this;},
 querySelector(selector){if(selector.includes('welcome-enter'))return enterButton;return null;},
 querySelectorAll(){return [enterButton];},focus(){document.activeElement=this;}};
}
const app=element(),main=element(),enterButton=element(),body=element();
nodes.set('.app-layout',app);nodes.set('#main',main);nodes.set('#public-appearance',{value:'system'});
globalThis.document={body,documentElement:{classList:{add(){},remove(){}},dataset:{}},activeElement:null,
 createElement:()=>element(),querySelector:key=>nodes.get(key)||nodes.get(key.replace('#','')),addEventListener(){}};
globalThis.window={localStorage:{getItem(){return null;},setItem(){}},addEventListener:(key,fn)=>windowEvents.set(key,fn)};
globalThis.location={pathname:'/'};globalThis.matchMedia=()=>({matches:true});
const controller=initWelcome({translate:key=>key,getLanguage:()=> 'en',setLanguage(){},navigate(){}});
assert.equal(app.hidden,true);assert.equal(app.inert,true);assert.equal(nodes.get('welcome-view').hidden,false);
controller.close(true);assert.equal(app.hidden,false);assert.equal(app.inert,false);assert.equal(document.activeElement,main);assert.equal(nodes.get('welcome-view').hidden,true);
controller.open();assert.equal(app.hidden,true);location.pathname='/projects';windowEvents.get('gnwaa:public-view')();assert.equal(app.hidden,false);assert.equal(app.inert,false);
assert.equal(initWelcome({}),undefined,'Duplicate initialization adds no listeners/view');
console.log('Fullscreen lifecycle passed: app hidden/inert, Enter restoration, replay, route cleanup and duplicate initialization guard.');

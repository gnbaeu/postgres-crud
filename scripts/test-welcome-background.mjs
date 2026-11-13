import assert from 'node:assert/strict';
import {readFile,stat} from 'node:fs/promises';
import {welcomeBackgroundMarkup} from '../welcome-background.js';
import {mongolScene,WORLD_PEOPLE,WORLD_BACKGROUNDS,initWorldMotion} from '../mongol-scene.js';
const welcome=welcomeBackgroundMarkup();
assert.match(welcome,/class="tw-steppe"/);
assert.match(welcome,/tw-mountain-far|tw-ger-window|tw-moon/);
assert.doesNotMatch(welcome,/mp-scene|mp-world-image|plaza-|data-person/);
const markup=mongolScene();
assert.match(welcome,/class="tw-ambient" aria-hidden="true" inert/);
assert.match(markup,/class="mp-world-image"/);
assert.match(markup,/data-scene-layer="walkers"/);
assert.equal(WORLD_PEOPLE.length,12);
assert.equal((markup.match(/data-person=/g)||[]).length,12);
assert.equal((markup.match(/data-walk-frame=/g)||[]).length,48);

assert.doesNotMatch(markup,/<(?:button|input|a|canvas)\b|tabindex|fuji/);
for(const p of WORLD_PEOPLE){
 for(let t=0;t<=1;t+=.05){
  const x=p.from[0]+(p.to[0]-p.from[0])*t,y=p.from[1]+(p.to[1]-p.from[1])*t,s=p.scale[0]+(p.scale[1]-p.scale[0])*t;
  assert.ok(x>=0&&x+16*s<=960&&y>=520&&y+28*s<=640,p.id+' stays on the plaza');
 }
 assert.ok(p.duration>=30&&p.pace>=.6);assert.notDeepEqual(p.from,p.to);
}
assert.ok(WORLD_PEOPLE.some(p=>p.scale[0]!==p.scale[1]),'Depth routes change perspective');
assert.ok(WORLD_PEOPLE.some(p=>p.to[0]<p.from[0])&&WORLD_PEOPLE.some(p=>p.to[0]>p.from[0]));
assert.ok(markup.indexOf('class="mp-world-image"')<markup.indexOf('data-scene-layer="walkers"'),'Actors are a separate foreground layer');
for(const source of Object.values(WORLD_BACKGROUNDS)){
 const bytes=await readFile(new URL('../public'+source,import.meta.url));
 assert.equal(bytes.subarray(1,4).toString(),'PNG');
 assert.equal(bytes.readUInt32BE(16),1536);assert.equal(bytes.readUInt32BE(20),1024);
 assert.ok((await stat(new URL('../public'+source,import.meta.url))).size<2500000);
}
assert.doesNotMatch(markup,/design-reference|<text|mongol-world\.svg/);
const css=await readFile(new URL('../pixel-zen.css',import.meta.url),'utf8');
assert.match(css,/\.tw-ambient\{display:none;position:fixed/);
assert.match(css,/\.mp-scene\{[^}]*pointer-events:none/);
assert.match(css,/steps\(4,end\)/);assert.match(css,/data-world-paused="true"/);
assert.match(css,/data-motion="off"\] \.mp-scene/);
assert.match(css,/prefers-reduced-motion:reduce\)\{\.mp-scene/);
assert.match(css,/\.mp-person-2,[^}]*display:none/);
assert.ok(mongolScene().includes('viewBox="0 0 960 640"'));
console.log('World scene passed: 12 perspective actors, 48 walking frames, safe foreground plaza paths, day/night raster assets, independent sprite layer, visibility and reduced-motion rules.');

// Exercise theme/visibility wiring without replacing sprite nodes.
const image={href:WORLD_BACKGROUNDS.dark,getAttribute(){return this.href;},setAttribute(_key,value){this.href=value;}};
const events={},viewEvents={};let themeChange;
globalThis.document={hidden:false,documentElement:{dataset:{theme:'light'}},querySelectorAll:()=>[image],addEventListener:(key,handler)=>{events[key]=handler;}};
globalThis.window={addEventListener:(key,handler)=>{viewEvents[key]=handler;}};
globalThis.MutationObserver=class{constructor(fn){themeChange=fn;}observe(_root,options){assert.deepEqual(options.attributeFilter,['data-theme']);}};
initWorldMotion();assert.equal(image.href,WORLD_BACKGROUNDS.light);
document.documentElement.dataset.theme='dark';themeChange();assert.equal(image.href,WORLD_BACKGROUNDS.dark);
document.hidden=true;events.visibilitychange();assert.equal(document.documentElement.dataset.worldPaused,'true');
document.hidden=false;events.visibilitychange();assert.equal(document.documentElement.dataset.worldPaused,'false');
image.href='stale';viewEvents['gnwaa:public-view']();assert.equal(image.href,WORLD_BACKGROUNDS.dark);
console.log('World lifecycle passed: initial theme, live theme, route refresh and hidden-tab pause.');

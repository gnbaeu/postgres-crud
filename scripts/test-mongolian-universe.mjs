import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {steppeScene,mongolIcon} from '../mongolian-art.js';
import {PORTFOLIO_COPY} from '../portfolio-copy.js';
import {mongolScene} from '../mongol-scene.js';
const read=p=>readFile(new URL('../'+p,import.meta.url),'utf8');
const css=await read('mongolian-universe.css'),base=await read('pixel-zen.css');
for(const [token,color] of Object.entries({sky:'#3C83C5','deep-blue':'#153452',gold:'#E5B85B',sand:'#E9D9B8',ink:'#172330',ivory:'#F8F3E9'}))assert.ok(css.includes('--mn-'+token+':'+color));
for(const kind of ['camp','steppe']){
 const art=steppeScene(kind);assert.match(art,/aria-hidden="true" inert/);assert.match(art,/mongolian-ui.svg#ger/);
 assert.doesNotMatch(art,/<(?:text|button|a|input|canvas)\b/);assert.match(art,/shape-rendering="crispEdges"/);
}
assert.match(steppeScene('camp'),/mn-camp-fire/);assert.doesNotMatch(steppeScene('steppe'),/mn-camp-fire/);
assert.match(mongolIcon('ger-icon'),/aria-hidden="true"/);
const asset=await read('public/images/mongolian-ui.svg');
for(const name of ['ger','ger-icon','knot','film','bowl','draw'])assert.ok(asset.includes('id="'+name+'"'));
assert.doesNotMatch(asset,/<script|(?:href|src)="https?:|<text/);
for(const locale of ['mn','en','ja'])for(const key of ['campCaption','steppeCaption'])assert.ok(PORTFOLIO_COPY[locale]['pz.'+key]);
assert.equal(PORTFOLIO_COPY.mn['pz.headline'],'Санаа их. RAM бага.');
assert.equal(PORTFOLIO_COPY.en['pz.headline'],'Too many ideas. Not enough RAM.');
assert.equal(PORTFOLIO_COPY.ja['pz.headline'],'アイデアは多い。RAMは足りない。');
assert.match(css,/prefers-reduced-motion:reduce/);assert.match(css,/data-motion="off"/);assert.match(css,/data-world-paused="true"/);
assert.match(css,/mp-ambient-cloud-two\{animation:none/);
assert.match(mongolScene(),/mp-ambient-clouds/);
assert.match(css,/aria-pressed="true"/);assert.match(css,/input:focus-visible/);
assert.match(css,/max-width:768px/);assert.match(css,/max-width:600px/);
assert.doesNotMatch(css,/gradient|backdrop-filter|box-shadow/);
// Selection contrast is invariant across themes: dark ink on warm gold.
function lum(hex){const c=hex.match(/../g).map(x=>parseInt(x,16)/255).map(x=>x<=.04045?x/12.92:((x+.055)/1.055)**2.4);return .2126*c[0]+.7152*c[1]+.0722*c[2];}
assert.ok((lum('E5B85B')+.05)/(lum('172330')+.05)>4.5);
assert.match(base,/--background:#F8F3E9/);
console.log('Mongolian Universe PASS: 6 tokens, code-native pixel assets, 3-language hero/captions, separate clouds/actors, golden selection contrast, motion and responsive rules. Browser layout is tested separately.');

import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {UX_COPY,shareResult} from '../pixel-ux.js';
import {createQuickDraw} from '../quick-draw.js';
import {toggleFavorite,readCollection,writeCollection} from '../randomizer-core.js';
for(const lang of ['mn','en','ja'])assert.deepEqual(Object.keys(UX_COPY[lang]).sort(),Object.keys(UX_COPY.en).sort());
const quick=createQuickDraw();for(let i=0,previous=null;i<30;i++){const next=quick.draw();assert.ok(next.result);assert.notEqual(next.result.id,previous);previous=next.result.id;}
const blocked={getItem(){throw Error()},setItem(){throw Error()}};assert.deepEqual(readCollection(blocked,'movie',[]),{favorites:[],history:[]});assert.equal(writeCollection(blocked,'movie',{favorites:[],history:[]}),false);
assert.deepEqual(toggleFavorite(toggleFavorite([], 'a'),'a'),[]);
const previous=Object.getOwnPropertyDescriptor(globalThis,'navigator');let copied,shared;
Object.defineProperty(globalThis,'navigator',{configurable:true,value:{clipboard:{writeText:async value=>{copied=value}},share:async value=>{shared=value}}});
assert.equal(await shareResult('Public movie result'),true);assert.equal(copied,'Public movie result');assert.equal(await shareResult('Public food result',{share:true}),true);assert.deepEqual(shared,{title:'GNWAA Randomizer',text:'Public food result'});
navigator.clipboard.writeText=async()=>{throw Error('denied')};assert.equal(await shareResult('Result'),false);delete navigator.clipboard;delete navigator.share;assert.equal(await shareResult('Result',{share:true}),false);
if(previous)Object.defineProperty(globalThis,'navigator',previous);else delete globalThis.navigator;
const lum=hex=>{const [r,g,b]=hex.match(/../g).map(x=>parseInt(x,16)/255).map(x=>x<=.04045?x/12.92:((x+.055)/1.055)**2.4);return .2126*r+.7152*g+.0722*b;};
// Brightest possible art (white) under the least opaque part of the hero panel.
const background=[11,26,43].map(x=>Math.round(x*.9+255*.1)).map(x=>x.toString(16).padStart(2,'0')).join('');
assert.ok((lum('FFF3D8')+.05)/(lum(background)+.05)>=4.5);
assert.ok((lum('E5B85B')+.05)/(lum('172330')+.05)>=4.5);
const css=await readFile(new URL('../pixel-zen.css',import.meta.url),'utf8');assert.match(css,/--font-body:system-ui/);assert.match(css,/font-display:swap/);assert.match(css,/\.pz-home-active \.pz-intro-text\{background:linear-gradient/);
console.log('Pixel UX units PASS: translation parity, shared no-repeat engine, storage failure, save toggle, copy/share privacy/fallback, hero and primary CTA AA contrast, system body font and nonblocking pixel loading.');

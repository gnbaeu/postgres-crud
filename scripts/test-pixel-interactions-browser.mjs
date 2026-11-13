import assert from 'node:assert/strict';
import {connectBrowser,localOrigin} from './browser-session.mjs';
import {PORTFOLIO_COPY} from '../portfolio-copy.js';
const b=await connectBrowser(),origin=localOrigin();
try{
 await b.send('Page.bringToFront');await b.send('Emulation.setFocusEmulationEnabled',{enabled:true});
 await b.send('Storage.clearDataForOrigin',{origin,storageTypes:'all'});
 await b.send('Page.addScriptToEvaluateOnNewDocument',{source:"localStorage.setItem('gnwaa-welcome-v1','done');window.audioProbe={contexts:0,tones:0};const NativeAudio=window.AudioContext;if(NativeAudio)window.AudioContext=class extends NativeAudio{constructor(){super();window.audioProbe.contexts++}createOscillator(){window.audioProbe.tones++;return super.createOscillator()}};"});
 await b.viewport(1440,900);await b.navigate(origin+'/');await b.evaluate('document.fonts.ready');
 assert.equal(await b.evaluate("document.querySelector('#public-sound').getAttribute('aria-pressed')"),'false');
 assert.equal(await b.evaluate('audioProbe.contexts'),0);
 for(const locale of ['mn','en','ja']){await b.select('#public-language',locale);assert.equal(await b.evaluate("document.querySelector('#public-sound').title"),PORTFOLIO_COPY[locale]['pz.soundEnable']);}
 await b.click('#public-sound');await b.wait('audioProbe.tones>0','Enabled audio creates a real tone');
 assert.equal(await b.evaluate("localStorage.getItem('gnwaa-sound-v1')"),'on');
 await b.navigate(origin+'/');assert.equal(await b.evaluate("document.querySelector('#public-sound').getAttribute('aria-pressed')"),'true');assert.equal(await b.evaluate('audioProbe.contexts'),0,'No autoplay on refresh');
 await b.click('#public-sound');const off=await b.evaluate('audioProbe.tones');
 await b.click('#public-nav [data-page-link=projects]');assert.equal(await b.evaluate('audioProbe.tones'),off,'OFF stays silent');
 await b.send('Emulation.setTouchEmulationEnabled',{enabled:false});
 await b.send('Emulation.setEmulatedMedia',{features:[{name:'forced-colors',value:'none'},{name:'prefers-reduced-motion',value:'reduce'}]});
 assert.equal(await b.evaluate("matchMedia('(hover:hover) and (pointer:fine)').matches"),true,'Desktop environment exposes a fine hovering pointer');
 {
  assert.match(await b.evaluate('getComputedStyle(document.body).cursor'),/arrow-/);
  assert.match(await b.evaluate("getComputedStyle(document.querySelector('#public-sound')).cursor"),/pointer-/);
 }
 await b.evaluate("const field=document.createElement('input');field.id='cursor-probe';document.querySelector('#page-content').prepend(field)");
 assert.equal(await b.evaluate("getComputedStyle(document.querySelector('#cursor-probe')).cursor"),'text');
 await b.send('Emulation.setEmulatedMedia',{features:[{name:'forced-colors',value:'active'}]});assert.doesNotMatch(await b.evaluate('getComputedStyle(document.body).cursor'),/url/);
 await b.send('Emulation.setTouchEmulationEnabled',{enabled:true});await b.viewport(390,844);assert.doesNotMatch(await b.evaluate('getComputedStyle(document.body).cursor'),/url/);
 assert.equal(await b.evaluate('document.documentElement.scrollWidth<=innerWidth'),true);
 console.log('Pixel cursor/sound browser PASS: OFF default, trusted opt-in, real oscillator, refresh persistence, silence OFF, MN/EN/JA, text cursor, forced-colors, touch and reduced motion.');
}finally{await b.close()}

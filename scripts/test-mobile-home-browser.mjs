import assert from 'node:assert/strict';
import {connectBrowser} from './browser-session.mjs';
const b=await connectBrowser();
try{
 await b.send('Page.addScriptToEvaluateOnNewDocument',{source:"localStorage.setItem('gnwaa-welcome-v1','done')"});
 for(const [w,h] of [[360,740],[375,812],[390,844],[430,932],[768,1024],[1024,768],[1440,900]]){
 await b.viewport(w,h);await b.navigate('http://127.0.0.1:5175/');
 for(const lang of ['en','mn','ja']){await b.select('#public-language',lang);for(const theme of ['light','dark','system']){
 await b.select('#public-appearance',theme);
 const r=await b.evaluate(`(()=>{const rect=s=>document.querySelector(s).getBoundingClientRect();return {overflow:document.documentElement.scrollWidth>innerWidth,gap:rect('.pz-intro-text').top-rect('.pz-intro-art').bottom,header:rect('#public-header').height,hotspot:rect('[data-square-hotspots]').bottom,scene:rect('.pz-intro-art').bottom,demo:!!document.querySelector('[data-page-view=home] [data-home-demo]')};})()`);
 assert.equal(r.overflow,false,`${w}/${lang}/${theme}`);if(w<=768){assert.ok(Math.abs(r.gap)<2);assert.ok(r.header<=64);assert.ok(r.hotspot<=r.scene);assert.equal(r.demo,false);}
 if(lang==='en'&&theme==='dark')await b.screenshot(`artifacts/mobile-home/after-${w}.png`);
 }}
 if(w<=768){await b.navigate('http://127.0.0.1:5175/playground');await b.click('[data-home-draw]');assert.ok(await b.evaluate("document.querySelector('[data-home-result]').textContent"));}
 }
 console.log('Mobile Home matrix PASS: 7 widths, 3 languages, 3 themes, flow gap, hotspot bounds, compact header, overflow, relocated demo.');
}finally{await b.close()}

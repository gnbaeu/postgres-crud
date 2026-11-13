import assert from 'node:assert/strict';
import {connectBrowser,localOrigin} from './browser-session.mjs';
import {resolve} from 'node:path';
const b=await connectBrowser(),origin=localOrigin();
try{
 await b.send('Page.bringToFront');await b.send('Emulation.setFocusEmulationEnabled',{enabled:true});
 await b.send('Storage.clearDataForOrigin',{origin,storageTypes:'all'});
 await b.send('Page.addScriptToEvaluateOnNewDocument',{source:"localStorage.setItem('gnwaa-welcome-v1','done')"});
 await b.viewport(1440,900);await b.navigate(origin+'/');await b.evaluate('document.fonts.ready');
 assert.equal(await b.evaluate("document.querySelectorAll('.pz-home .mp-person').length"),12);
 assert.equal(await b.evaluate("document.querySelectorAll('.pz-home [data-walk-frame]').length"),48);
 assert.equal(await b.evaluate("getComputedStyle(document.querySelector('.pz-home .mp-scene')).pointerEvents"),'none');
 await b.send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'no-preference'}]});
 await b.wait("getComputedStyle(document.querySelector('.pz-home .mp-sprite-strip')).animationName==='mp-sprite'",'Sprite cycle active');
 await b.evaluate("window.worldPose=getComputedStyle(document.querySelector('.pz-home .mp-sprite-strip')).transform;window.worldMotion=document.querySelector('.pz-home .mp-route').getAnimations()[0]");
 await b.wait("getComputedStyle(document.querySelector('.pz-home .mp-sprite-strip')).transform!==window.worldPose",'Walking frames advance');
 assert.equal(await b.evaluate("[...document.querySelectorAll('.pz-home .mp-route')].every(el=>{const m=new DOMMatrix(getComputedStyle(el).transform);return m.e>=0&&m.e+16*m.a<=960&&m.f>=520&&m.f+28*m.a<=640})"),true,'Animated actors remain on the plaza');
 for(const theme of ['light','dark']){
  await b.select('#public-appearance',theme);
  await b.wait("document.querySelector('.pz-home .mp-world-image').getAttribute('href').includes('plaza-"+(theme==='light'?'day':'night')+"-v1.png')",'Matching scenery theme');
  assert.equal(await b.evaluate("(async()=>{const image=document.querySelector('.pz-home .mp-world-image');const result=await fetch(image.getAttribute('href'));return result.ok&&result.headers.get('content-type').includes('image/png')})()"),true,'Real scenery asset loads');
  assert.equal(await b.evaluate("document.querySelector('.pz-home .mp-route').getAnimations()[0]===window.worldMotion"),true,'Theme retains route animation');
  await b.screenshot(resolve('artifacts/world-reference/home-'+theme+'-1440.png'),{full:false});
 }
 for(const width of [360,390,430,768,1024,1440]){
  await b.viewport(width,width<600?844:900);
  assert.equal(await b.evaluate('document.documentElement.scrollWidth<=innerWidth'),true,'No overflow '+width);
  if(width>=1024)assert.equal(await b.evaluate('document.documentElement.scrollHeight<=innerHeight+1'),true,'One desktop viewport');
  const people=await b.evaluate("[...document.querySelectorAll('.pz-home .mp-person')].filter(el=>getComputedStyle(el).display!=='none').length");
  assert.equal(people,width<=600?5:12);
  if(width===390)await b.screenshot(resolve('artifacts/world-reference/home-dark-390.png'),{full:false});
 }
 await b.send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});
 assert.equal(await b.evaluate("[...document.querySelectorAll('.pz-home .mp-scene *')].every(el=>getComputedStyle(el).animationName==='none')"),true);
 await b.send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'no-preference'}]});
 // Media overrides can acknowledge before CSS animations are recreated.
 await b.wait("getComputedStyle(document.querySelector('.pz-home .mp-route')).animationName==='mp-route'",'Route animation restored after reduced motion');
 await b.evaluate("Object.defineProperty(document,'hidden',{configurable:true,value:true});document.dispatchEvent(new Event('visibilitychange'))");
 await b.wait("getComputedStyle(document.querySelector('.pz-home .mp-route')).animationPlayState==='paused'",'Hidden world animation pauses');
 assert.equal(await b.evaluate("document.documentElement.dataset.worldPaused"),'true');
 assert.equal(await b.evaluate("getComputedStyle(document.querySelector('.pz-home .mp-route')).animationPlayState"),'paused');
 await b.evaluate("delete document.hidden;document.dispatchEvent(new Event('visibilitychange'))");
 assert.equal(await b.evaluate("document.documentElement.dataset.worldPaused"),'false');
 console.log('World browser PASS: sprite frames, safe actor positions, theme continuity, 5 mobile/12 desktop actors, responsive viewport, reduced motion and visibility handler.');
}finally{await b.close()}

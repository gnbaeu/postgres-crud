import assert from 'node:assert/strict';
import {connectBrowser,localOrigin} from './browser-session.mjs';
import {UX_COPY,shareResult} from '../pixel-ux.js';
for(const language of ['mn','en','ja'])assert.deepEqual(Object.keys(UX_COPY[language]).sort(),Object.keys(UX_COPY.en).sort());
const b=await connectBrowser(),origin=localOrigin();
const key=async(value,extra={})=>{await b.send('Input.dispatchKeyEvent',{type:'keyDown',key:value,code:value,windowsVirtualKeyCode:({Escape:27,Enter:13,Tab:9,ArrowDown:40,ArrowUp:38}[value]||75),...extra});await b.send('Input.dispatchKeyEvent',{type:'keyUp',key:value,code:value,windowsVirtualKeyCode:({Escape:27,Enter:13,Tab:9,ArrowDown:40,ArrowUp:38}[value]||75),...extra});};
try{
 await b.send('Page.bringToFront');await b.send('Emulation.setFocusEmulationEnabled',{enabled:true});
 await b.send('Storage.clearDataForOrigin',{origin,storageTypes:'all'});
 await b.send('Page.addScriptToEvaluateOnNewDocument',{source:`localStorage.setItem('gnwaa-welcome-v1','done');Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async text=>{window.sharedResult=text}}});Object.defineProperty(navigator,'share',{configurable:true,value:async data=>{window.sharedData=data}});`});
 await b.viewport(1440,1000);await b.navigate(origin+'/');
 await b.click('[data-home-draw]');const first=await b.evaluate("document.querySelector('[data-home-result]').textContent");assert.ok(first);
 await b.click('[data-home-draw]');assert.notEqual(await b.evaluate("document.querySelector('[data-home-result]').textContent"),first);
 await b.click('[data-hotspot=flag]');assert.equal(await b.evaluate("document.querySelector('#square-popover').open"),true);await key('Escape');assert.equal(await b.evaluate('document.activeElement.dataset.hotspot'),'flag');
 await key('k',{modifiers:2});assert.equal(await b.evaluate("document.querySelector('#command-palette').open"),true);await key('ArrowDown');assert.equal(await b.evaluate("document.querySelector('[data-command-list] [aria-current]').dataset.command"),'1');await key('Tab',{modifiers:8});assert.equal(await b.evaluate("document.activeElement.hasAttribute('data-ux-close')"),true,'Palette focus trap');await key('Escape');assert.equal(await b.evaluate('document.activeElement.dataset.hotspot'),'flag');
 await b.click('[data-palette-open]');await b.evaluate("document.querySelector('#command-palette input').value='料理';document.querySelector('#command-palette input').dispatchEvent(new Event('input',{bubbles:true}))");
 await key('Enter');await b.wait("location.pathname==='/randomizer/food'",'Multilingual palette route');
 await b.click('#rz-draw');await b.wait("!!document.querySelector('[data-result-id]')",'Food result');
 await b.click('[data-rz-focus=save]');assert.equal(await b.evaluate("document.querySelectorAll('#rz-favorites-title').length"),1);
 const saved=await b.evaluate("JSON.parse(localStorage.getItem('gnwaa-randomizer-food-v1')).favorites");assert.equal(saved.length,1);
 await b.click('[data-rz-action=copy]');await b.wait('!!window.sharedResult','Copied result');assert.ok((await b.evaluate('window.sharedResult')).includes('GNWAA Randomizer'));
 await b.click('[data-rz-action=share]');await b.wait('!!window.sharedData','Shared result');assert.deepEqual(await b.evaluate('Object.keys(window.sharedData).sort()'),['text','title']);
 await b.navigate(origin+'/randomizer/food');assert.deepEqual(await b.evaluate("JSON.parse(localStorage.getItem('gnwaa-randomizer-food-v1')).favorites"),saved);
 await b.click('.rz-list-heart');assert.equal(await b.evaluate("JSON.parse(localStorage.getItem('gnwaa-randomizer-food-v1')).favorites.length"),0);
 await b.navigate(origin+'/playground');await b.click('[data-surprise]');const route=await b.evaluate("location.pathname+':'+(document.querySelector('[data-lab-panel]:not([hidden])')?.dataset.labPanel||'')");await b.click('#public-nav [data-page-link=playground]');await b.click('[data-surprise]');assert.notEqual(await b.evaluate("location.pathname+':'+(document.querySelector('[data-lab-panel]:not([hidden])')?.dataset.labPanel||'')"),route);
 for(const width of [375,390,768,1440]){
  await b.viewport(width,width<600?844:1000);
  for(const locale of ['en','mn','ja']){
   await b.navigate(origin+'/');await b.select('#public-language',locale);
   for(const theme of ['light','dark','system']){
    await b.select('#public-appearance',theme);
    assert.equal(await b.evaluate('document.documentElement.scrollWidth<=innerWidth'),true,`${width} ${locale} ${theme}`);
    assert.equal(await b.evaluate("!getComputedStyle(document.body).fontFamily.includes('GNWAA Pixel')"),true,'Sans-serif body');
    assert.equal(await b.evaluate("getComputedStyle(document.querySelector('#home-hero-title')).fontFamily.includes('GNWAA Pixel')"),true,'Pixel hero');
    assert.equal(await b.evaluate("(async()=>{for(const el of document.querySelectorAll('.pz-actions a,[data-home-draw],[data-hotspot]')){if(!el.getClientRects().length)continue;el.scrollIntoView({block:'center',behavior:'instant'});await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));const r=el.getBoundingClientRect();if(r.height<44||r.width<44||!el.contains(document.elementFromPoint(r.x+r.width/2,r.y+r.height/2)))return false;}window.scrollTo(0,0);return true;})()"),true,'Touch targets remain reachable');
    if(locale==='en'&&theme==='dark')await b.screenshot(`artifacts/polish-6.2/home-${width}.png`);
   }
  }
 }
 await b.viewport(390,844);await b.navigate(origin+'/projects');await b.screenshot('artifacts/polish-6.2/projects-390.png');
 assert.equal(await b.evaluate("document.body.textContent.includes('Screenshot not captured yet')"),false);
 await b.evaluate("document.querySelector('[data-project-screenshot]').dispatchEvent(new Event('error'))");assert.equal(await b.evaluate("document.querySelector('[data-project-media]').hidden"),true,'Broken screenshot degrades to text-only');
 await b.click('[data-palette-open]');await key('Tab');await key('Escape');assert.equal(await b.evaluate('document.activeElement.hasAttribute("data-palette-open")'),true);
 await b.evaluate("const i=document.createElement('input');i.id='typing-probe';document.body.append(i);i.focus()");await key('k',{modifiers:2});assert.equal(await b.evaluate("document.querySelector('#command-palette').open"),false,'Typing is not hijacked');
 await b.send('Page.addScriptToEvaluateOnNewDocument',{source:`Storage.prototype.setItem=function(){throw Error('blocked')};Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async()=>{throw Error('denied')}}});`});
 await b.navigate(origin+'/randomizer/movie');await b.click('#rz-draw');await b.wait("!!document.querySelector('[data-result-id]')",'Blocked storage draw');await b.click('[data-rz-focus=save]');assert.ok(await b.evaluate("!!document.querySelector('.rz-storage-notice')"));await b.click('[data-rz-action=copy]');await b.wait("document.querySelector('#randomizer-live').textContent.length>0",'Clipboard failure feedback');
 console.log('GNWAA 6.2 browser PASS: demo, palette multilingual search/focus/typing, hotspots, saved picks, copy/share privacy/failure, surprise, responsive locale/theme matrix, blocked storage.');
}finally{await b.close()}

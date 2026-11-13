import assert from 'node:assert/strict';
import {resolve} from 'node:path';
import {connectBrowser,localOrigin} from './browser-session.mjs';
import {PORTFOLIO_COPY} from '../portfolio-copy.js';
const b=await connectBrowser(),origin=localOrigin();
const pages=[['home','/'],['portfolio','/projects'],['playground','/playground'],['randomizer','/randomizer/movie'],['about','/about']];
try{
 await b.send('Page.bringToFront');
 await b.send('Emulation.setFocusEmulationEnabled',{enabled:true});
 await b.send('Page.addScriptToEvaluateOnNewDocument',{source:"localStorage.setItem('gnwaa-welcome-v1','done')"});
 for(const width of [360,390,430,768,1024,1440]){
  await b.viewport(width,width<600?844:900);
  for(const [name,path] of pages){
   await b.navigate(origin+path);await b.evaluate('document.fonts.ready');
   for(const theme of ['light','dark']){
    await b.select('#public-appearance',theme);
    assert.equal(await b.evaluate('document.documentElement.dataset.theme'),theme);
    assert.equal(await b.evaluate('document.documentElement.scrollWidth<=innerWidth'),true,name+' overflow at '+width);
    assert.equal(await b.evaluate("getComputedStyle(document.documentElement).getPropertyValue('--mn-gold').trim()"),'#E5B85B');
    if(name==='home'&&width>=1024)assert.equal(await b.evaluate('document.documentElement.scrollHeight<=innerHeight+1'),true,'One-screen Home');
    if(name==='playground'||name==='about'){
     assert.equal(await b.evaluate("(()=>{const el=document.querySelector('[data-page-view="+name+"] .mn-landscape');return !!el&&getComputedStyle(el).pointerEvents==='none'&&el.getAttribute('aria-hidden')==='true'})()"),true,'Decorative landscape');
    }
    await b.evaluate("(async()=>{const images=[...document.querySelectorAll('.mp-world-image')].filter(el=>el.getClientRects().length);await Promise.all(images.map(async el=>{const img=new Image();img.src=el.getAttribute('href');await img.decode();}));})()");
    if([390,1440].includes(width))await b.screenshot(resolve('artifacts/universe-6/'+name+'-'+theme+'-'+width+'.png'),{full:true});
   }
  }
 }
 await b.viewport(1440,900);await b.navigate(origin+'/');
 for(const locale of ['mn','en','ja']){
  await b.select('#public-language',locale);
  assert.equal(await b.evaluate('document.documentElement.lang'),locale);
  assert.equal(await b.evaluate("document.querySelector('#home-hero-title').textContent"),PORTFOLIO_COPY[locale]['pz.headline']);
 }
 assert.deepEqual(await b.evaluate("[...document.querySelectorAll('#public-nav>a')].map(el=>el.getAttribute('href'))"),['/','/projects','/playground','/about']);
 await b.click('#public-nav [data-page-link=projects]');await b.wait("location.pathname==='/projects'",'Portfolio route');
 await b.click('#public-nav [data-page-link=playground]');await b.wait("location.pathname==='/playground'",'Playground route');
 await b.evaluate('history.back()');await b.wait("location.pathname==='/projects'",'Back');
 await b.evaluate('history.forward()');await b.wait("location.pathname==='/playground'",'Forward');
 await b.send('Page.reload',{ignoreCache:true});await b.wait("!!document.querySelector('[data-page-view=playground] .mn-camp-fire')",'Direct refresh');
 await b.send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});
 assert.equal(await b.evaluate("[...document.querySelectorAll('.mn-landscape *')].every(el=>getComputedStyle(el).animationName==='none')"),true);
 await b.send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'no-preference'}]});
 await b.navigate(origin+'/randomizer/movie');
 await b.click('.rz-chip');
 assert.equal(await b.evaluate("document.querySelectorAll('.rz-chip[aria-pressed=true]').length"),1);
 assert.equal(await b.evaluate("(()=>{const style=getComputedStyle(document.querySelector('.rz-chip[aria-pressed=true]'));return style.backgroundColor==='rgb(229, 184, 91)'&&style.color==='rgb(23, 35, 48)'})()"),true,'Golden RPG selection');
 await b.send('Input.dispatchKeyEvent',{type:'keyDown',key:'Tab',code:'Tab',windowsVirtualKeyCode:9});
 await b.send('Input.dispatchKeyEvent',{type:'keyUp',key:'Tab',code:'Tab',windowsVirtualKeyCode:9});
 await b.evaluate("document.querySelector('.rz-chip').focus()");
 assert.notEqual(await b.evaluate("getComputedStyle(document.activeElement).outlineStyle"),'none','Visible keyboard focus');
 console.log('Mongolian Universe browser PASS: five pages, 6 widths, both themes, 3 languages, golden selection, decorative hit testing, focus, history, direct refresh and reduced motion.');
}finally{await b.close();}

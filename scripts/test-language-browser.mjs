import assert from 'node:assert/strict';
import {connectBrowser,localOrigin} from './browser-session.mjs';
import {PORTFOLIO_COPY} from '../portfolio-copy.js';
const origin=process.argv[2]||localOrigin(),key='ganbat-customer-language';
const b=await connectBrowser();
const language=async(locale)=>{
 assert.equal(await b.evaluate('document.documentElement.lang'),locale);
 assert.equal(await b.evaluate("document.querySelector('#public-language').value"),locale);
};
try{
 await b.send('Page.bringToFront');
 for(const locale of ['mn-MN','ja-JP','en-US']){
  await b.send('Emulation.setLocaleOverride',{locale});
  await b.send('Page.addScriptToEvaluateOnNewDocument',{source:`Object.defineProperty(navigator,'language',{configurable:true,get:()=>${JSON.stringify(locale)}});Object.defineProperty(navigator,'languages',{configurable:true,get:()=>[${JSON.stringify(locale)}]});`});
  await b.send('Storage.clearDataForOrigin',{origin,storageTypes:'all'});
  await b.navigate(origin+'/');await language('en');
  assert.equal(await b.evaluate('navigator.language'),locale);
  await b.wait("!!document.querySelector('[data-welcome-language]')",'Fresh welcome');
  assert.equal(await b.evaluate("document.querySelector('[data-welcome-language]').value"),'en');
  assert.equal(await b.evaluate("document.querySelector('#terminal-welcome-title').textContent"),PORTFOLIO_COPY.en['pz.welcomeTitle']);
  await b.click('[data-welcome-enter]');await b.wait("document.querySelector('#welcome-view').hidden",'Enter Home');await language('en');
 }
 for(const locale of ['mn','ja','en']){
  await b.select('#public-language',locale);
  assert.equal(await b.evaluate(`localStorage.getItem('${key}')`),locale);
  await b.navigate(origin+'/');await language(locale);
  for(const path of ['/projects','/playground','/randomizer/movie','/about']){await b.navigate(origin+path);await language(locale);}
  await b.click('[data-welcome-replay]');await language(locale);
  assert.equal(await b.evaluate("document.querySelector('[data-welcome-language]').value"),locale);
  await b.select('[data-welcome-language]',locale);
  await b.click('[data-welcome-enter]');await b.wait("document.querySelector('#welcome-view').hidden",'Replay exit');
  const tab=await connectBrowser();try{await tab.navigate(origin+'/about');assert.equal(await tab.evaluate('document.documentElement.lang'),locale);}finally{await tab.close();}
 }
 await b.evaluate(`localStorage.removeItem('${key}')`);
 for(const path of ['/about','/projects','/playground','/randomizer/movie','/']){await b.navigate(origin+path);await language('en');}
 console.log('Language browser PASS: fresh EN under MN/JA/EN locales, welcome title/switcher, Enter Home, saved MN/JA/EN, reload/routes/new tabs, replay and deleted preference; origin='+origin);
}finally{await b.close();}

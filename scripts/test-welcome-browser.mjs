import assert from 'node:assert/strict';
import {resolve} from 'node:path';
import {connectBrowser,localOrigin} from './browser-session.mjs';
const origin=localOrigin(),browser=await connectBrowser();
const {send,evaluate,wait,navigate,viewport,click,select,screenshot}=browser;
const shot=async name=>{
  await evaluate("Promise.all(document.querySelector('#terminal-welcome').getAnimations({subtree:true}).filter(a=>a.animationName!=='tw-blink').map(a=>a.finished.catch(()=>{})))");
  return screenshot(resolve('artifacts/terminal-welcome',name));
};
const enter=async()=>{await send('Input.dispatchKeyEvent',{type:'keyDown',key:'Enter',code:'Enter',windowsVirtualKeyCode:13});await send('Input.dispatchKeyEvent',{type:'keyUp',key:'Enter',code:'Enter',windowsVirtualKeyCode:13});};
try {
  await send('Storage.clearDataForOrigin',{origin,storageTypes:'all'});
  await viewport(1440);await navigate(origin+'/');
  await wait("document.querySelector('#welcome-view') && !document.querySelector('#welcome-view').hidden",'First visit');
  const before=await evaluate("document.querySelector('[data-welcome-enter]').getBoundingClientRect().y");
  assert.equal(await evaluate("document.querySelectorAll('#terminal-welcome').length"),1);
  assert.equal(await evaluate("getComputedStyle(document.querySelector('.app-layout')).display"),'none');
  assert.equal(await evaluate("document.querySelector('.app-layout').hidden"),true);
  assert.equal(await evaluate("document.querySelectorAll('dialog#terminal-welcome').length"),0);
  await evaluate("document.querySelector('#public-language').focus()");
  assert.notEqual(await evaluate('document.activeElement.id'),'public-language');
  await select('[data-welcome-theme]','light');
  assert.equal(await evaluate("document.querySelector('.tw-ambient').inert"),true);
  assert.equal(await evaluate("getComputedStyle(document.querySelector('.tw-ambient')).pointerEvents"),'none');
  await shot('welcome-light-desktop.png');
  assert.equal(await evaluate("document.querySelector('[data-welcome-enter]').getBoundingClientRect().y"),before,'Reveal reserves layout');
  await select('[data-welcome-theme]','dark');await shot('welcome-dark-desktop.png');
  for(const language of ['mn','en','ja']){
    await select('[data-welcome-language]',language);
    assert.equal(await evaluate('document.documentElement.lang'),language);
    for(const width of [320,360,390,430,768,1440]){
      await viewport(width);
      assert.equal(await evaluate("(()=>{const d=document.querySelector('#terminal-welcome');return d.scrollWidth<=d.clientWidth && document.documentElement.scrollWidth<=innerWidth})()"),true);
      assert.equal(await evaluate("(()=>{const r=document.querySelector('.tw-ambient .mp-scene').getBoundingClientRect(),d=document.querySelector('#terminal-welcome').getBoundingClientRect();return r.right>0 && r.left<innerWidth && r.bottom>d.bottom && r.top<innerHeight})()"),true,'Square scene extends below terminal');
    }
  }
  await select('[data-welcome-theme]','system');
  await send('Emulation.setEmulatedMedia',{features:[{name:'prefers-color-scheme',value:'light'},{name:'prefers-reduced-motion',value:'reduce'}]});
  await wait("document.documentElement.dataset.theme==='light'",'System appearance');
  assert.equal(await evaluate("getComputedStyle(document.querySelector('.tw-cursor')).animationName"),'none');
  assert.equal(await evaluate("[...document.querySelectorAll('.tw-ambient *')].every(el=>getComputedStyle(el).animationName==='none')"),true,'Reduced motion stops decorative animation');
  await send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'no-preference'}]});
  await evaluate("document.documentElement.dataset.motion='off'");
  assert.equal(await evaluate("[...document.querySelectorAll('.tw-ambient *')].every(el=>getComputedStyle(el).animationName==='none')"),true,'Motion Off stops decoration');
  await evaluate("document.querySelector('[data-welcome-language]').focus()");await enter();
  assert.equal(await evaluate("!document.querySelector('#welcome-view').hidden"),true,'Select Enter does not dismiss');
  await viewport(390);await select('[data-welcome-theme]','light');await shot('welcome-mobile-light.png');
  await select('[data-welcome-theme]','dark');await shot('welcome-mobile-dark.png');
  await click('[data-welcome-enter]');
  await wait("document.querySelector('#welcome-view').hidden",'Exit completes');
  assert.equal(await evaluate("document.querySelector('.app-layout').inert"),false);
  assert.notEqual(await evaluate("getComputedStyle(document.querySelector('.app-layout')).display"),'none');
  assert.equal(await evaluate("document.activeElement.id"),'main');
  assert.equal(await evaluate("document.documentElement.classList.contains('welcome-open')"),false);
  assert.equal(await evaluate("getComputedStyle(document.querySelector('.tw-ambient')).display"),'none','Closed welcome removes ambient rendering');
  await shot('homepage-after-enter.png');
  await navigate(origin+'/');assert.equal(await evaluate("!document.querySelector('#welcome-view').hidden"),false);
  await navigate(origin+'/about');
  await click('[data-welcome-replay]');await enter();await wait("document.querySelector('#welcome-view').hidden",'Keyboard exit');assert.equal(await evaluate("!document.querySelector('#welcome-view').hidden"),false);
  await evaluate("localStorage.removeItem('gnwaa-welcome-v1')");
  for(const path of ['/projects','/playground','/randomizer','/about']){
    await navigate(origin+path);assert.equal(await evaluate("!document.querySelector('#welcome-view').hidden"),false);
  }
  await click('[data-welcome-replay]');await wait("location.pathname==='/' && !document.querySelector('#welcome-view').hidden",'Replay from About');
  await evaluate('history.back()');await wait("location.pathname==='/about' && !!document.querySelector('#welcome-view').hidden",'Back closes welcome');
  console.log('Terminal browser checks passed; screenshots: artifacts/terminal-welcome');
}finally{await browser.close();}

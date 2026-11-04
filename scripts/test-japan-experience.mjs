// Uses an already running, isolated Chrome debugging session; installs nothing.
// Prerequisites: Vite dev server and a dedicated headless Chrome with
// --remote-debugging-port=9225 --user-data-dir=<temporary test profile>.
// Run: node scripts/test-browser.mjs (override GNWAA_TEST_ORIGIN if needed).
// This suite expects the backend to be unavailable and clears only the test
// profile's storage for the tested origin. Never attach a personal profile.
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
const screenshotDir = join(tmpdir(), 'gnwaa-japan-experience');
const origin = process.env.GNWAA_TEST_ORIGIN || 'http://127.0.0.1:5175';
const target = await (await fetch('http://127.0.0.1:9225/json/new?about:blank', {method:'PUT'})).json();
const ws = new WebSocket(target.webSocketDebuggerUrl);
await new Promise(resolve => ws.addEventListener('open', resolve, { once: true }));
let sequence = 0;
const pending = new Map();
const events = [];
ws.addEventListener('message', event => {
  const message = JSON.parse(event.data);
  if (message.id) {
    pending.get(message.id)?.(message);
    pending.delete(message.id);
  } else events.push(message);
});
const send = (method, params = {}) => new Promise((resolve, reject) => {
  const id = ++sequence;
  pending.set(id, message => message.error ? reject(message.error) : resolve(message.result));
  ws.send(JSON.stringify({ id, method, params }));
});
const evaluate = async expression => {
  const result = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
  if (result.exceptionDetails) throw new Error(JSON.stringify(result.exceptionDetails));
  return result.result.value;
};
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
const screenshot = async name => {
  await mkdir(screenshotDir, {recursive:true});
  const {data} = await send('Page.captureScreenshot', {format:'png'});
  await writeFile(join(screenshotDir,name), Buffer.from(data,'base64'));
};
const reload = async () => {
  const start = events.length;
  await send('Page.reload');
  for (let attempt = 0; attempt < 100; attempt++) {
    if (events.slice(start).some(event => event.method === 'Page.loadEventFired')) return;
    await delay(60);
  }
  throw new Error('Reload did not finish');
};
const navigate = async url => {
  const start = events.length;
  await send('Page.navigate', {url});
  for (let attempt=0;attempt<100;attempt++) {
    if(events.slice(start).some(event=>event.method==='Page.loadEventFired')) return;
    await delay(60);
  }
  throw new Error('Navigation did not finish');
};
const waitFor = async (expression, label, timeout = 10500) => {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    if (await evaluate(expression)) return;
    await delay(60);
  }
  throw new Error(`Timed out: ${label}`);
};
const pressKey = async (key, windowsVirtualKeyCode) => {
  await send('Input.dispatchKeyEvent', {type:'keyDown', key, code:key, windowsVirtualKeyCode});
  await send('Input.dispatchKeyEvent', {type:'keyUp', key, code:key, windowsVirtualKeyCode});
};
const assertIntroDuration = async (label, upperBound = 9500) => {
  await waitFor(`window.__gnwaaIntroTiming && window.__gnwaaIntroTiming.closedAt !== null`, `${label} timing capture`);
  const timing = await evaluate(`window.__gnwaaIntroTiming`);
  assert.ok(Number.isFinite(timing?.startedAt), `${label}: intro start was captured`);
  assert.ok(Number.isFinite(timing?.closedAt), `${label}: intro completion was captured`);
  const duration = timing.closedAt - timing.startedAt;
  assert.ok(duration >= 7700 && duration < upperBound, `${label} duration is about eight seconds (${duration.toFixed(0)} ms)`);
  return duration;
};
// Native input checks hit testing, overlays and inert; element.click() would bypass them.
const click = async (selector, touch = false) => {
  const point = await evaluate(`(async () => {
    const node = [...document.querySelectorAll(${JSON.stringify(selector)})].find(node => node.getClientRects().length > 0);
    if (!node) throw new Error('Missing click target');
    node.scrollIntoView({block:'center',behavior:'instant'});
    await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    const rect = node.getBoundingClientRect();
    const x = rect.x + rect.width / 2, y = rect.y + rect.height / 2;
    if (node.closest('[inert]') || !node.contains(document.elementFromPoint(x,y)))
      throw new Error('Click blocked: ' + ${JSON.stringify(selector)} + ' hit=' + document.elementFromPoint(x,y)?.outerHTML.slice(0,300) + ' inert=' + !!node.closest('[inert]'));
    return {x,y};
  })()`);
  if (touch) {
    await send('Input.dispatchTouchEvent', {type:'touchStart', touchPoints:[{...point, radiusX:4, radiusY:4, force:1, id:1}]});
    await send('Input.dispatchTouchEvent', {type:'touchEnd', touchPoints:[]});
    return;
  }
  await send('Input.dispatchMouseEvent', { type: 'mousePressed', button: 'left', clickCount: 1, ...point });
  await send('Input.dispatchMouseEvent', { type: 'mouseReleased', button: 'left', clickCount: 1, ...point });
};
const setOption = async (id,value) => evaluate(`document.querySelector('#${id}').value=${JSON.stringify(value)};document.querySelector('#${id}').dispatchEvent(new Event('change',{bubbles:true}))`);
try {
 await send('Runtime.enable');await send('Page.enable');await send('Network.enable');
 await send('Emulation.setDeviceMetricsOverride',{width:1440,height:960,deviceScaleFactor:1,mobile:false});
 await send('Emulation.setEmulatedMedia',{features:[{name:'prefers-color-scheme',value:'dark'},{name:'prefers-reduced-motion',value:'no-preference'}]});
 await send('Page.addScriptToEvaluateOnNewDocument',{source:`window.__experienceTiming={start:null,end:null};new MutationObserver(records=>{for(const {target} of records){if(target.id!=='matrix-loader')continue;const t=window.__experienceTiming;if(!target.hidden && t.start===null)t.start=performance.now();if(target.hidden && t.start!==null && t.end===null)t.end=performance.now();}}).observe(document,{attributes:true,attributeFilter:['hidden'],subtree:true});`});
 await send('Storage.clearDataForOrigin',{origin,storageTypes:'all'});
 await navigate(origin);
 await delay(400);
 await evaluate(`sessionStorage.clear();localStorage.clear();history.replaceState({},'')`);
 await navigate('about:blank');await navigate(origin+'/?intro-timing=1');
 await waitFor(`!document.querySelector('#matrix-loader').hidden`,'Initial intro');
 await delay(6000);await screenshot('japanese-intro.png');
 await waitFor(`document.querySelector('#matrix-loader').hidden`,'8s completion');
 await waitFor(`window.__experienceTiming.end!==null`,'Intro timing recorded');
 const duration=await evaluate('window.__experienceTiming.end-window.__experienceTiming.start');assert.ok(duration>=7700 && duration<9600, 'Measured intro duration '+duration);
 assert.equal(await evaluate(`document.querySelector('#matrix-canvas').width`),0);
 assert.equal(await evaluate(`document.querySelector('#skip-intro')===null`),true);
 await evaluate(`document.querySelector('.jm-featured').scrollIntoView({behavior:'instant',block:'center'})`);
 await waitFor(`document.querySelector('.jm-featured').classList.contains('japan-reveal')`,'Section reveal');
 await evaluate(`window.__revealAnimation=document.querySelector('.jm-featured').getAnimations()[0]`);await delay(750);
 await evaluate(`scrollTo(0,0);document.querySelector('.jm-featured').scrollIntoView({behavior:'instant',block:'center'})`);
 assert.equal(await evaluate(`document.querySelector('.jm-featured').getAnimations()[0]===window.__revealAnimation`),true,'Section reveal does not replay while scrolling');
 await evaluate('scrollTo(0,0)');

 await click('#theme-studio-toggle');
 await send('Input.dispatchKeyEvent',{type:'keyDown',key:'Escape',code:'Escape',windowsVirtualKeyCode:27});await send('Input.dispatchKeyEvent',{type:'keyUp',key:'Escape',code:'Escape',windowsVirtualKeyCode:27});
 await waitFor(`!document.querySelector('#japan-settings').open`,'Escape closes settings');
 assert.equal(await evaluate('document.activeElement.id'),'theme-studio-toggle','Settings returns focus');await click('#theme-studio-toggle');
 assert.equal(await evaluate(`document.querySelector('#japan-settings').open`),true);
 await setOption('japan-appearance','system');
 await send('Emulation.setEmulatedMedia',{features:[{name:'prefers-color-scheme',value:'light'},{name:'prefers-reduced-motion',value:'no-preference'}]});
 await waitFor(`document.documentElement.dataset.theme==='light'`,'System follows light');
 await send('Emulation.setEmulatedMedia',{features:[{name:'prefers-color-scheme',value:'dark'},{name:'prefers-reduced-motion',value:'no-preference'}]});
 await waitFor(`document.documentElement.dataset.theme==='dark'`,'System follows dark');
 await setOption('japan-season','spring');await setOption('japan-motion','off');
 assert.equal(await evaluate('document.documentElement.dataset.motion'),'off');
 await click('#japan-settings [data-close]');
 await reload();
 assert.equal(await evaluate(`document.querySelector('#matrix-loader').hidden`),true);
 assert.equal(await evaluate('document.documentElement.dataset.season'),'spring');
 await click('#theme-studio-toggle');await setOption('japan-motion','on');await click('#japan-settings [data-close]');
 for(const [season,theme] of [['spring','dark'],['spring','light'],['summer','dark'],['autumn','dark'],['winter','dark']]) {
  await click('#theme-studio-toggle');await setOption('japan-season',season);await setOption('japan-appearance',theme);await click('#japan-settings [data-close]');
  assert.equal(await evaluate('document.documentElement.dataset.season'),season);
  await screenshot(season+'-'+theme+'.png');
 }
 await click('#japan-omikuji-open');
 assert.ok(await evaluate(`document.querySelector('#omikuji-title').textContent.length>0`));
 const first=await evaluate(`document.querySelector('#omikuji-title').textContent`);
 await click('#omikuji-draw');assert.notEqual(await evaluate(`document.querySelector('#omikuji-title').textContent`),first);
 await screenshot('omikuji.png');
 const empty=await evaluate(`import('/japan-experience.js').then(module=>module.chooseDiscovery([],document.documentElement.lang,()=>null))`);
 assert.equal(empty,null,'Empty catalog returns no invented result');
 await click('#omikuji-read');await waitFor(`location.pathname.startsWith('/discover/')`,'Open real article');
 await click('#japan-zen');assert.equal(await evaluate(`document.body.classList.contains('japan-zen')`),true);
 await screenshot('zen-reading.png');await click('#japan-zen');assert.equal(await evaluate(`document.body.classList.contains('japan-zen')`),false);
 await click('#language-toggle');await click('#theme-studio-toggle');
 assert.equal(await evaluate(`document.querySelector('#japan-settings [data-copy="appearance"]').textContent`),await evaluate(`document.documentElement.lang==='en'?'Appearance':'\u0425\u0430\u0440\u0430\u0433\u0434\u0430\u0446'`));
 await setOption('japan-motion','reduced');assert.equal(await evaluate('document.documentElement.dataset.motion'),'reduced');
 await setOption('japan-motion','on');
 await send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});
 await waitFor(`document.documentElement.dataset.motion==='reduced'`,'OS reduce overrides On');await click('#japan-settings [data-close]');
 await evaluate(`document.querySelector('[data-page-link="home"]').click()`);
 for(const width of [360,375,390,430,768,1024,1440]) {
  await send('Emulation.setDeviceMetricsOverride',{width,height:960,deviceScaleFactor:1,mobile:width<600});
  await delay(100);await click('#theme-studio-toggle');
  assert.equal(await evaluate('document.documentElement.scrollWidth<=innerWidth'),true,'No overflow '+width);
  await screenshot('settings-'+width+'.png');await click('#japan-settings [data-close]');
  await click('#japan-omikuji-open');
  if(width===390) {
    await click('#omikuji-read');await click('#japan-zen');
    assert.equal(await evaluate(`document.body.classList.contains('japan-zen') && document.documentElement.scrollWidth<=innerWidth`),true);
    await screenshot('zen-mobile.png');await click('#japan-zen');await click('.jm-wordmark');
  } else {await send('Input.dispatchKeyEvent',{type:'keyDown',key:'Escape',code:'Escape',windowsVirtualKeyCode:27});await send('Input.dispatchKeyEvent',{type:'keyUp',key:'Escape',code:'Escape',windowsVirtualKeyCode:27});await waitFor(`!document.querySelector('#japan-omikuji').open`,'Escape closes Omikuji');}

 }
 // Exercise the real empty-state UI by intercepting only the public catalog in this test tab.
 const catalog=await(await fetch(origin+'/discover/articles.js')).text();
 const emptyCatalog=catalog.replace(/export const DISCOVER_ARTICLES = \[[\s\S]*?\r?\n\];/,'export const DISCOVER_ARTICLES = [];');
 assert.notEqual(catalog,emptyCatalog,'Empty fixture replaces the public array');
 const intercept=async event=>{const message=JSON.parse(event.data);if(message.method==='Fetch.requestPaused')await send('Fetch.fulfillRequest',{requestId:message.params.requestId,responseCode:200,responseHeaders:[{name:'Content-Type',value:'text/javascript'}],body:Buffer.from(emptyCatalog).toString('base64')});};
 ws.addEventListener('message',intercept);
 await send('Network.setCacheDisabled',{cacheDisabled:true});await send('Fetch.enable',{patterns:[{urlPattern:'*/discover/articles.js*'}]});
 await navigate(origin+'/?empty-catalog=1');await click('#japan-omikuji-open');
 assert.equal(await evaluate(`document.querySelector('#omikuji-read').hidden`),true);
 assert.ok(await evaluate(`document.querySelector('#omikuji-title').textContent.length>0`));
 await screenshot('omikuji-empty.png');await click('#japan-omikuji [data-close]');
 await send('Fetch.disable');ws.removeEventListener('message',intercept);
 // Legacy appearance migration retains the old key and writes the versioned preference.
 await navigate(origin+'/?migration=1');
 await evaluate(`localStorage.removeItem('gnwaa-japan-experience-v1');localStorage.setItem('ganbat-customer-theme','light')`);
 await navigate(origin+'/?migration=2');
 assert.equal(await evaluate('document.documentElement.dataset.theme'),'light');
 assert.equal(await evaluate(`JSON.parse(localStorage.getItem('gnwaa-japan-experience-v1')).appearance`),'light');
 assert.equal(await evaluate(`localStorage.getItem('ganbat-customer-theme')`),'light');
 await evaluate(`document.querySelector('#theme-studio-dialog').showModal();window.dispatchEvent(new Event('gnwaa:public-view'))`);
 await waitFor(`!document.querySelector('#theme-studio-dialog').open`,'Legacy modal cleanup on public view');
 await click('#theme-studio-toggle');
 await evaluate(`document.querySelector('[data-page-link="discover"]').click()`);
 await waitFor(`!document.querySelector('#japan-settings').open`,'Navigation closes public settings safely');
 await evaluate(`document.querySelector('[data-page-link="home"]').click()`);
 // A blocked preference store must not prevent public controls from working.
 const injection=await send('Page.addScriptToEvaluateOnNewDocument',{source:`Object.defineProperty(window,'localStorage',{get(){throw new DOMException('Test denied','SecurityError')}})`});
 await navigate(origin+'/?storage-blocked=1');await click('#theme-studio-toggle');await setOption('japan-season','autumn');await setOption('japan-motion','off');
 assert.equal(await evaluate('document.documentElement.dataset.motion'),'off');await click('#japan-settings [data-close]');
 await send('Page.removeScriptToEvaluateOnNewDocument',{identifier:injection.identifier});
 assert.equal(events.filter(e=>e.method==='Runtime.exceptionThrown').length,0,'No uncaught exceptions');
 console.log('Japan Experience passed: 8s intro, System live changes, persistence, seasons, motion, actual Omikuji/redraw/empty selection, Zen exit, bilingual settings and seven responsive widths. '+screenshotDir);
} catch(error){console.log(events.filter(e=>e.method==='Runtime.exceptionThrown').map(e=>e.params.exceptionDetails.exception?.description));console.log(await evaluate(`({timing:window.__experienceTiming,motion:document.documentElement.dataset.motion,ready:document.readyState,inert:document.querySelector('.app-layout')?.inert,intro:document.querySelector('#matrix-loader')?.hidden})`));throw error;} finally {await send('Target.closeTarget',{targetId:target.id});ws.close();}

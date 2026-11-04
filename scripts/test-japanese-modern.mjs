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
const screenshotDir = join(tmpdir(), 'gnwaa-japanese-modern');
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
try {
 await send('Runtime.enable');await send('Page.enable');await send('Network.enable');
 await send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});
 await navigate(origin);
 await evaluate(`if(document.documentElement.lang!=='mn')document.querySelector('#language-toggle').click()`);
 for(const theme of ['dark','light']) {
  await click('#theme-studio-toggle');await evaluate(`document.querySelector('#japan-appearance').value='${theme}';document.querySelector('#japan-appearance').dispatchEvent(new Event('change',{bubbles:true}))`);await click('#japan-settings [data-close]');
  for(const width of [360,375,390,430,768,1024,1440]) {
   await send('Emulation.setDeviceMetricsOverride',{width,height:960,deviceScaleFactor:1,mobile:width<600});
   for(const page of ['home','discover','lab','about']) {
    await evaluate(`document.querySelector('[data-page-link="${page}"]').click()`);
    await delay(100);
    assert.equal(await evaluate('document.documentElement.scrollWidth<=innerWidth'),true,theme+' '+width+' '+page+' overflow '+JSON.stringify(await evaluate(`Array.from(document.querySelectorAll('body *')).filter(e=>e.getBoundingClientRect().right>innerWidth+1&&e.getClientRects().length).slice(-8).map(e=>e.className)`)));
    if(width===390||width===1440) {
      await screenshot(theme+'-'+width+'-'+page+'.png');
      if(page==='home') {
       await evaluate(`Promise.all(Array.from(document.images).map(image=>{image.loading='eager';return image.decode().catch(()=>{});} ))`);
       const metrics=await send('Page.getLayoutMetrics');
       const {data}=await send('Page.captureScreenshot',{format:'png',captureBeyondViewport:true,clip:{x:0,y:0,width:metrics.cssContentSize.width,height:metrics.cssContentSize.height,scale:1}});
       await writeFile(join(screenshotDir,theme+'-'+width+'-home-full.png'),Buffer.from(data,'base64'));
      }
    }
   }
  }
 }
 await send('Emulation.setDeviceMetricsOverride',{width:1440,height:960,deviceScaleFactor:1,mobile:false});
 await click('#theme-studio-toggle');
 const accents=new Set();
 for(const preset of ['spring','summer','autumn','winter']) {
  await evaluate(`document.querySelector('#japan-season').value='${preset}';document.querySelector('#japan-season').dispatchEvent(new Event('change',{bubbles:true}))`);
  accents.add(await evaluate(`getComputedStyle(document.body).getPropertyValue('--color-accent').trim()`));
 }
 assert.equal(accents.size,4,'All four seasons produce distinct controlled accent variations');
 await click('#japan-settings [data-close]');
 assert.equal(await evaluate(`document.querySelector('.about-creator-github')===null`),true);
 assert.equal(events.filter(event=>event.method==='Runtime.exceptionThrown').length,0,'No runtime exceptions');
 console.log('Japanese Modern responsive pages passed: dark/light, seven widths, Home/Discover/Lab/About. Screenshots: '+screenshotDir);
} finally {await send('Target.closeTarget',{targetId:target.id});ws.close();}

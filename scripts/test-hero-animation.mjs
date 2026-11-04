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
 for(const width of [1440,390]) {
  await send('Emulation.setDeviceMetricsOverride',{width,height:960,deviceScaleFactor:1,mobile:width===390});
  await send('Emulation.setTouchEmulationEnabled',{enabled:width===390,maxTouchPoints:5});
  await send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'no-preference'}]});
  await navigate(origin+'/?hero-animation='+width);
  await waitFor(`document.querySelector('.home-hero').classList.contains('jm-hero-revealed')`,'Entrance completes once');
  const count=await evaluate(`Array.from(document.querySelectorAll('.jm-petals i')).filter(e=>getComputedStyle(e).display!=='none').length`);
  assert.equal(count,width===390?5:10);
  assert.equal(await evaluate(`getComputedStyle(document.querySelector('.jm-petals')).pointerEvents`),'none');
  const before=await evaluate(`getComputedStyle(document.querySelector('.jm-petals i')).transform`);
  const bounds=await evaluate(`JSON.stringify(document.querySelector('.home-hero h1').getBoundingClientRect().toJSON())`);
  await delay(300);
  assert.notEqual(await evaluate(`getComputedStyle(document.querySelector('.jm-petals i')).transform`),before,'Petals genuinely move');
  assert.equal(await evaluate(`JSON.stringify(document.querySelector('.home-hero h1').getBoundingClientRect().toJSON())`),bounds,'No headline layout shift');
  assert.equal(await evaluate('document.documentElement.scrollWidth<=innerWidth'),true);
  await screenshot('hero-animated-'+width+'.png');
  await click('#language-toggle');
  assert.equal(await evaluate(`getComputedStyle(document.querySelector('.home-hero h1')).animationName`),'none','Language change does not replay entrance');
  await click('.home-hero-actions [data-page-link="lab"]');
  assert.equal(await evaluate('location.pathname'),'/lab');
  await evaluate(`document.querySelector('[data-page-link="home"]').click()`);
  await send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});
  assert.equal(await evaluate(`getComputedStyle(document.querySelector('.jm-petals')).display`),'none');
 }
 const svg=await (await fetch(origin+'/images/jm-fuji.svg')).text();
 assert.match(svg,/jm-moon-breathe 6s/);assert.match(svg,/jm-wave-drift 12s/);assert.match(svg,/prefers-reduced-motion:reduce/);
 assert.equal(events.filter(e=>e.method==='Runtime.exceptionThrown').length,0);
 console.log('Hero animation passed: 1440/390, 10/5 moving petals, stable layout, immediate Lab CTA, one-time entrance, MN/EN interaction, reduced motion and no exceptions. Moon/wave timing verified in SVG; actual iPhone not tested.');
} finally {await send('Target.closeTarget',{targetId:target.id});ws.close();}

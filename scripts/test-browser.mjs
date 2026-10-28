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
const screenshotDir = join(tmpdir(), 'gnwaa-intro-preview');
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
  await send('Runtime.enable');
  await send('Page.enable');
  await send('Network.enable');
  await navigate(origin);
  await waitFor(`document.readyState === 'complete'`, 'initial document');
  await evaluate(`sessionStorage.clear(); localStorage.clear()`);
  await send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 1000, deviceScaleFactor: 1, mobile: false });
  await send('Emulation.setEmulatedMedia', { features: [{name:'prefers-reduced-motion',value:'no-preference'}] });
  await reload();
  await waitFor(`!document.querySelector('#matrix-loader').hidden`, 'first-session intro');
  const desktopStarted = Date.now();
  assert.equal(await evaluate(`document.querySelector('#skip-intro') === null`), true);
  await delay(6400);
  await screenshot('desktop-1440.png');
  await waitFor(`document.querySelector('#matrix-loader').hidden`, 'desktop automatic completion');
  assert.ok(Date.now()-desktopStarted >= 7700 && Date.now()-desktopStarted < 9500, 'Desktop duration is about eight seconds');
  await waitFor(`document.querySelector('#matrix-loader').hidden && !document.querySelector('.app-layout').inert`, 'completion releases UI');
  await waitFor(`document.querySelector('#matrix-canvas').width === 0`, 'canvas cleanup');
  await click('#language-toggle');
  assert.equal(await evaluate('document.documentElement.lang'), 'en');
  await click('#language-toggle');
  assert.equal(await evaluate('document.documentElement.lang'), 'mn');
  await click('#sidebar-toggle');
  assert.equal(await evaluate(`document.querySelector('#sidebar').classList.contains('is-collapsed')`), true);
  await click('#sidebar-toggle');
  assert.equal(await evaluate(`document.querySelector('#sidebar').classList.contains('is-collapsed')`), false);
  await click('#theme-toggle');
  assert.equal(await evaluate('document.documentElement.dataset.theme'), 'light');
  await click('#top-avatar');
  assert.equal(await evaluate(`document.querySelector('#profile-dropdown').hidden`), false);
  await click('#top-avatar');
  assert.equal(await evaluate(`document.querySelector('#profile-dropdown').hidden`), true);
  await click('#theme-studio-toggle');
  assert.equal(await evaluate(`document.querySelector('#theme-studio-dialog').open`), true);
  await click('[data-theme-preset="ocean-night"]');
  await click('#theme-studio-apply');
  assert.equal(await evaluate('document.documentElement.dataset.accentTheme'), 'ocean-night');
  await click('#theme-studio-toggle');
  await click('[data-theme-preset="moonlight"]');
  await click('#theme-studio-cancel');
  assert.equal(await evaluate('document.documentElement.dataset.accentTheme'), 'ocean-night');
  await click('.side-nav [data-page-link="discover"]');
  await waitFor(`location.pathname === '/discover'`, 'Discover navigation');
  await click('#discover-surprise');
  await waitFor(`location.pathname.startsWith('/discover/')`, 'Surprise Me');
  const articlePath = await evaluate('location.pathname');
  await evaluate('history.back()');
  await waitFor(`location.pathname === '/discover'`, 'browser Back');
  await evaluate('history.forward()');
  await waitFor(`location.pathname === ${JSON.stringify(articlePath)}`, 'browser Forward');
  await click('.side-nav [data-page-link="lab"]');
  await click('[data-lab-open="universe"]');
  assert.equal(await evaluate(`document.querySelector('#du-form').getClientRects().length > 0`), true);
  await click('[data-lab-back]');
  await click('[data-lab-open="detective"]');
  await click('[data-detective-answer]');
  await click('[data-lab-back]');
  await click('[data-lab-open="personality"]');
  assert.equal(await evaluate(`document.querySelector('#pl-form').getClientRects().length > 0`), true);
  await reload();
  await waitFor(`document.readyState === 'complete' && !document.querySelector('.app-layout').inert`, 'refresh interactive');
  assert.equal(await evaluate(`document.querySelector('#matrix-loader').hidden`), true);
  await click('#language-toggle');
  await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
  await send('Emulation.setTouchEmulationEnabled', {enabled:true, maxTouchPoints:5});
  await evaluate(`new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)))`);
  await click('#mobile-nav-toggle');
  await waitFor(`document.querySelector('#sidebar').classList.contains('is-mobile-open')`, 'mobile drawer');
  // Allow the drawer slide transition to finish before hit testing.
  await delay(400);
  await click('.side-nav [data-page-link="discover"]');
  await waitFor(`location.pathname === '/discover' && !document.querySelector('#main').inert && document.querySelector('#mobile-nav-backdrop').hidden`, 'mobile navigation closes drawer');
  await evaluate(`sessionStorage.removeItem('gnwaa-welcome-intro-seen-v1')`);
  await reload();
  await waitFor(`!document.querySelector('#matrix-loader').hidden`, 'new-session intro');
  await waitFor(`document.querySelector('#matrix-loader').hidden`, 'automatic intro completion');
  assert.equal(await evaluate(`document.querySelector('#matrix-canvas').width`), 0);
  await click('#language-toggle');
  await evaluate(`sessionStorage.removeItem('gnwaa-welcome-intro-seen-v1')`);
  await send('Emulation.setEmulatedMedia', { features: [{name:'prefers-reduced-motion',value:'reduce'}] });
  await reload();
  await waitFor(`document.readyState === 'complete' && !document.querySelector('.app-layout').inert`, 'reduced-motion startup');
  assert.equal(await evaluate(`document.querySelector('#matrix-loader').hidden`), true);
  await click('#language-toggle');
  // iPhone-shaped Chromium environment: touch/coarse pointer, Safari UA and
  // deliberately unavailable storage. This does NOT replace real iOS WebKit QA.
  await send('Emulation.setTouchEmulationEnabled', {enabled:true, maxTouchPoints:5});
  await send('Network.setUserAgentOverride', {userAgent:'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1'});
  await send('Emulation.setEmulatedMedia', {features:[{name:'prefers-reduced-motion',value:'no-preference'}]});
  for (const mode of ['denied', 'quota', 'canvas-options', 'canvas-error', 'timer-stall']) {
    const injection = await send('Page.addScriptToEvaluateOnNewDocument', {source:`(() => {
      const mode = ${JSON.stringify(mode)};
      if(mode === 'timer-stall') { const nativeTimeout=window.setTimeout; window.setTimeout=(callback,delay,...args)=>nativeTimeout(delay===7000 ? ()=>{} : callback,delay,...args); }
      const probe = window.__introProbe = {paints:0, plainContexts:0, touches:0, listeners:new Set()};
      if((mode.startsWith('canvas-') || mode==='timer-stall') && location.origin === ${JSON.stringify(origin)} && performance.getEntriesByType('navigation')[0]?.type === 'navigate') sessionStorage.removeItem('gnwaa-welcome-intro-seen-v1');
      if (mode === 'denied') Object.defineProperty(window, 'sessionStorage', {get(){throw new DOMException('Test storage denied','SecurityError');}});
      if (mode === 'quota') Object.defineProperty(window, 'sessionStorage', {value:{getItem(){return null},setItem(){throw new DOMException('Test quota','QuotaExceededError')}}});
      const getContext = HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext = function(type, options) {
        if(this.id === 'matrix-canvas') {
          if(mode === 'canvas-options' && options) throw new TypeError('Test optional settings unsupported');
          if(!options) probe.plainContexts++;
        }
        return getContext.call(this,type,options);
      };
      const paint = CanvasRenderingContext2D.prototype.fillText;
      CanvasRenderingContext2D.prototype.fillText = function(...args) {
        if(this.canvas.id === 'matrix-canvas') {
          if(mode === 'canvas-error') throw new Error('Test render failure');
          probe.paints++;
        }
        return paint.apply(this,args);
      };
      const add = EventTarget.prototype.addEventListener, remove = EventTarget.prototype.removeEventListener;
      EventTarget.prototype.addEventListener = function(type, ...args) {
        if(this.id === 'matrix-loader') probe.listeners.add(type);
        return add.call(this,type,...args);
      };
      EventTarget.prototype.removeEventListener = function(type, ...args) {
        if(this.id === 'matrix-loader') probe.listeners.delete(type);
        return remove.call(this,type,...args);
      };
      window.addEventListener('pointerdown', event => {if(event.pointerType === 'touch') probe.touches++;}, {passive:true});
    })()`});
    await navigate('about:blank');
    await navigate(`${origin}/?intro-test=${mode}`);
    await waitFor(`document.querySelector('#matrix-loader') && !document.querySelector('#matrix-loader').hidden`, `${mode} mobile first visit`);
    const mobileStarted = Date.now();
    assert.equal(await evaluate(`document.querySelector('#skip-intro') === null`), true);
    assert.equal(await evaluate(`document.documentElement.scrollWidth <= innerWidth`), true, `${mode}: no horizontal overflow`);
    if (mode !== 'canvas-error') await waitFor(`window.__introProbe.paints > 0`, `${mode} ASCII paints`);
    if (mode === 'canvas-options') assert.ok(await evaluate('window.__introProbe.plainContexts > 0'));
    await send('Input.dispatchTouchEvent', {type:'touchStart', touchPoints:[{x:180,y:420,id:1}]});
    await send('Input.dispatchTouchEvent', {type:'touchEnd', touchPoints:[]});
    assert.ok(await evaluate('window.__introProbe.touches > 0'), 'Native touch produces pointer input');
    await waitFor(`document.querySelector('#matrix-loader').hidden`, `${mode} automatic completion/failsafe`);
    assert.ok(Date.now()-mobileStarted >= 7700 && Date.now()-mobileStarted < 9800, 'Mobile duration is about eight seconds');
    assert.equal(await evaluate('window.__introProbe.listeners.size'), 0, 'Pointer listeners cleaned');
    assert.equal(await evaluate(`document.querySelector('#matrix-canvas').width`), 0);
    const painted = await evaluate('window.__introProbe.paints');
    await delay(120);
    assert.equal(await evaluate('window.__introProbe.paints'), painted, 'No painting after cleanup');
    await click('#language-toggle', true);
    if(mode==='denied') {
      await click('#theme-toggle', true);
      await click('#theme-studio-toggle', true);
      await click('#theme-studio-cancel', true);
      await click('#mobile-nav-toggle', true);
      await delay(400);
      await click('#sidebar-toggle', true);
      assert.equal(await evaluate(`document.querySelector('#main').inert`), false);
    }
    if(mode.startsWith('canvas-') || mode==='timer-stall') {
      await send('Page.removeScriptToEvaluateOnNewDocument', {identifier:injection.identifier});
      continue;
    }
    await reload();
    await waitFor(`document.readyState === 'complete' && !document.querySelector('.app-layout').inert`, `${mode} refresh ready`);
    await waitFor(`!document.querySelector('#matrix-loader').hidden`, `${mode} mobile refresh replays`);
    await waitFor(`document.querySelector('#matrix-loader').hidden`, 'automatic completion');
    await click('#language-toggle', true);
    await click('.home-card[data-page-link="about"]', true);
    assert.equal(await evaluate(`document.querySelector('#matrix-loader').hidden`), true, 'Internal navigation must not replay');
    await reload();
    await waitFor(`document.readyState === 'complete' && !document.querySelector('.app-layout').inert`, `${mode} SPA-route refresh`);
    await waitFor(`!document.querySelector('#matrix-loader').hidden`, 'Reload of public SPA route replays on mobile');
    await waitFor(`document.querySelector('#matrix-loader').hidden`, 'automatic completion');
    await evaluate('history.back()');
    await waitFor(`location.pathname === '/'`, 'mobile browser Back');
    assert.equal(await evaluate(`document.querySelector('#matrix-loader').hidden`), true, 'Back must not replay');
    await evaluate('history.forward()');
    await waitFor(`location.pathname === '/about'`, 'mobile browser Forward');
    assert.equal(await evaluate(`document.querySelector('#matrix-loader').hidden`), true, 'Forward must not replay');
    await send('Page.removeScriptToEvaluateOnNewDocument', {identifier:injection.identifier});
  }
  // Responsive visual QA on a fresh public document for each viewport.
  for (const [width,height] of [[360,800],[375,812],[390,844],[430,932],[844,390]]) {
    await send('Emulation.setDeviceMetricsOverride', {width,height,deviceScaleFactor:1,mobile:true});
    await reload();
    await waitFor(`!document.querySelector('#matrix-loader').hidden`, `${width} mobile reload`);
    await delay(6400);
    assert.equal(await evaluate(`document.querySelector('#matrix-loader').classList.contains('is-mobile-intro')`), true);
    assert.equal(await evaluate(`(() => {
      const loader=document.querySelector('#matrix-loader'), bounds=loader.getBoundingClientRect();
      return document.documentElement.scrollWidth <= innerWidth && bounds.width <= innerWidth && Math.abs(bounds.height-innerHeight)<2 &&
        [...loader.querySelectorAll('.loader-init,.loader-gnwaa,.loader-ready,.loader-progress-track')].every(node=>{
          const r=node.getBoundingClientRect();return r.x>=0 && r.y>=0 && r.right<=innerWidth && r.bottom<=innerHeight && node.scrollWidth<=node.clientWidth+1;
        });
    })()`), true, `${width}x${height}: visible unclipped typography and progress within viewport`);
    if(width===390) await screenshot('mobile-390.png');
    if(width===844) await screenshot('mobile-landscape.png');
    await waitFor(`document.querySelector('#matrix-loader').hidden`, 'automatic completion');
    assert.equal(await evaluate(`document.body.classList.contains('splash-active')`), false);
    assert.equal(await evaluate(`document.activeElement.id`), 'main', 'Focus returns to the public UI');
    await click('#language-toggle', true);
  }
  await send('Emulation.setDeviceMetricsOverride', {width:768,height:1024,deviceScaleFactor:1,mobile:true});
  await reload();
  await waitFor(`document.readyState==='complete' && !document.querySelector('.app-layout').inert`, 'tablet ready');
  assert.equal(await evaluate(`document.querySelector('#matrix-loader').hidden`), true, 'Larger tablet keeps desktop session behavior');
  await evaluate(`sessionStorage.removeItem('gnwaa-welcome-intro-seen-v1')`);
  await navigate('about:blank');
  await navigate(`${origin}/?intro-test=tablet`);
  await waitFor(`!document.querySelector('#matrix-loader').hidden`, '768px tablet first visit');
  assert.equal(await evaluate(`document.querySelector('#matrix-loader').classList.contains('is-mobile-intro')`), false);
  await delay(6400);
  assert.equal(await evaluate(`document.documentElement.scrollWidth<=innerWidth && [...document.querySelectorAll('.loader-gnwaa,.loader-init,.loader-ready')].every(node=>{const r=node.getBoundingClientRect();return r.left>=0 && r.right<=innerWidth && node.scrollWidth<=node.clientWidth+1;})`), true);
  await screenshot('tablet-768.png');
  await waitFor(`document.querySelector('#matrix-loader').hidden`, 'tablet automatic completion');
  console.log('Mobile intro regression passed: first visit, every reload, storage denial/quota, Canvas fallback/failure, touch input, cleanup, Back/Forward and SPA behavior; layouts 360/375/390/430 and 844x390; larger tablet desktop behavior. Chromium emulation is not iPhone Safari.');
  console.log('Intro screenshots:', screenshotDir);
  await send('Page.navigate', {url: `${origin}/admin`});
  await waitFor(`location.pathname === '/admin' && !document.querySelector('#auth-gate').hidden`, 'admin authentication gate');
  assert.equal(await evaluate(`document.querySelector('.app-layout').inert`), true, 'Admin remains gated while API is unavailable');
  assert.equal(await evaluate(`document.querySelector('#matrix-loader').hidden`), true);
  await navigate(`${origin}/login`);
  assert.equal(await evaluate(`document.querySelector('#matrix-loader').hidden`), true, 'Login has no intro');
  await send('Page.navigate', {url: origin});
  await waitFor(`location.pathname === '/' && document.readyState === 'complete' && !document.querySelector('.app-layout').inert`, 'return to public UI');
  await click('#language-toggle');
  const exceptions = events.filter(e => e.method === 'Runtime.exceptionThrown').map(e => e.params.exceptionDetails.exception?.description);
  assert.deepEqual(exceptions, [], 'No uncaught browser exceptions');
  const failures = events.filter(e => e.method === 'Network.responseReceived' && e.params.response.status >= 400)
    .map(e => ({ path: new URL(e.params.response.url).pathname, status: e.params.response.status }));
  assert.ok(failures.some(e => e.path.startsWith('/api/')), 'Exercise public UI while backend is unavailable');
  assert.deepEqual(failures.filter(e => !e.path.startsWith('/api/') && e.path !== '/favicon.ico'), [], 'No missing frontend modules/assets');
  console.log('Browser regression passed: startup, real clicks, sidebar, MN/EN, themes, Discover, Surprise Me, Lab, Back/Forward, refresh, mobile drawer, intro completion/cleanup, reduced motion, API-offline public UI.');
  console.log('Expected unavailable-backend responses:', JSON.stringify([...new Map(failures.map(e => [e.path,e])).values()]));
} catch(error) {
  console.error('Uncaught browser exceptions:', events.filter(event=>event.method==='Runtime.exceptionThrown').map(event=>event.params.exceptionDetails.exception?.description));
  throw error;
} finally {
  await send('Target.closeTarget', {targetId:target.id});
  ws.close();
}

// Uses an already running, isolated Chrome debugging session; installs nothing.
// Prerequisites: Vite dev server and a dedicated headless Chrome with
// --remote-debugging-port=9225 --user-data-dir=<temporary test profile>.
// Run: node scripts/test-browser.mjs (override GNWAA_TEST_ORIGIN if needed).
// This suite expects the backend to be unavailable and clears only the test
// profile's storage for the tested origin. Never attach a personal profile.
import assert from 'node:assert/strict';
const origin = process.env.GNWAA_TEST_ORIGIN || 'http://127.0.0.1:5175';
const targets = await (await fetch('http://127.0.0.1:9225/json')).json();
const ws = new WebSocket(targets.find(t => t.type === 'page').webSocketDebuggerUrl);
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
const reload = async () => {
  const start = events.length;
  await send('Page.reload');
  for (let attempt = 0; attempt < 100; attempt++) {
    if (events.slice(start).some(event => event.method === 'Page.loadEventFired')) return;
    await delay(60);
  }
  throw new Error('Reload did not finish');
};
const waitFor = async (expression, label, timeout = 7000) => {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    if (await evaluate(expression)) return;
    await delay(60);
  }
  throw new Error(`Timed out: ${label}`);
};
// Native input checks hit testing, overlays and inert; element.click() would bypass them.
const click = async selector => {
  const point = await evaluate(`(() => {
    const node = [...document.querySelectorAll(${JSON.stringify(selector)})].find(node => node.getClientRects().length > 0);
    if (!node) throw new Error('Missing click target');
    node.scrollIntoView({block:'center'});
    const rect = node.getBoundingClientRect();
    const x = rect.x + rect.width / 2, y = rect.y + rect.height / 2;
    if (node.closest('[inert]') || !node.contains(document.elementFromPoint(x,y)))
      throw new Error('Click blocked: ' + ${JSON.stringify(selector)} + ' hit=' + document.elementFromPoint(x,y)?.outerHTML.slice(0,300) + ' inert=' + !!node.closest('[inert]'));
    return {x,y};
  })()`);
  await send('Input.dispatchMouseEvent', { type: 'mousePressed', button: 'left', clickCount: 1, ...point });
  await send('Input.dispatchMouseEvent', { type: 'mouseReleased', button: 'left', clickCount: 1, ...point });
};
try {
  await send('Runtime.enable');
  await send('Page.enable');
  await send('Network.enable');
  await send('Page.navigate', { url: origin });
  await waitFor(`document.readyState === 'complete'`, 'initial document');
  await evaluate(`sessionStorage.clear(); localStorage.clear()`);
  await send('Emulation.setDeviceMetricsOverride', { width: 1280, height: 900, deviceScaleFactor: 1, mobile: false });
  await send('Emulation.setEmulatedMedia', { features: [{name:'prefers-reduced-motion',value:'no-preference'}] });
  await reload();
  await waitFor(`!document.querySelector('#matrix-loader').hidden`, 'first-session intro');
  await click('#skip-intro');
  await waitFor(`document.querySelector('#matrix-loader').hidden && !document.querySelector('.app-layout').inert`, 'skip releases UI');
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
  await send('Page.navigate', {url: `${origin}/admin`});
  await waitFor(`location.pathname === '/admin' && !document.querySelector('#auth-gate').hidden`, 'admin authentication gate');
  assert.equal(await evaluate(`document.querySelector('.app-layout').inert`), true, 'Admin remains gated while API is unavailable');
  await send('Page.navigate', {url: origin});
  await waitFor(`location.pathname === '/' && document.readyState === 'complete' && !document.querySelector('.app-layout').inert`, 'return to public UI');
  await click('#language-toggle');
  const exceptions = events.filter(e => e.method === 'Runtime.exceptionThrown').map(e => e.params.exceptionDetails.exception?.description);
  assert.deepEqual(exceptions, [], 'No uncaught browser exceptions');
  const failures = events.filter(e => e.method === 'Network.responseReceived' && e.params.response.status >= 400)
    .map(e => ({ path: new URL(e.params.response.url).pathname, status: e.params.response.status }));
  assert.ok(failures.some(e => e.path.startsWith('/api/')), 'Exercise public UI while backend is unavailable');
  assert.deepEqual(failures.filter(e => !e.path.startsWith('/api/') && e.path !== '/favicon.ico'), [], 'No missing frontend modules/assets');
  console.log('Browser regression passed: startup, real clicks, sidebar, MN/EN, themes, Discover, Surprise Me, Lab, Back/Forward, refresh, mobile drawer, intro Skip/completion/cleanup, reduced motion, API-offline public UI.');
  console.log('Expected unavailable-backend responses:', JSON.stringify([...new Map(failures.map(e => [e.path,e])).values()]));
} finally {
  ws.close();
}

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
const screenshotDir = join(tmpdir(), 'gnwaa-brand-identity');
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
const setOption=async(id,value)=>evaluate(`document.querySelector('#${id}').value=${JSON.stringify(value)};document.querySelector('#${id}').dispatchEvent(new Event('change',{bubbles:true}))`);
try {
 await send('Runtime.enable');await send('Page.enable');await send('Network.enable');
 await send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});
 await navigate(origin);
 await click('#theme-studio-toggle');await setOption('japan-season','spring');await setOption('japan-motion','reduced');await click('#japan-settings [data-close]');
 if(await evaluate('document.documentElement.lang')!=='mn')await click('#language-toggle');
 assert.equal(await evaluate(`document.querySelector('#home-hero-title').textContent`),'\u04ae\u043b \u043c\u044d\u0434\u044d\u0445\u0438\u0439\u043d \u0437\u04af\u0433.');
 await click('#language-toggle');assert.equal(await evaluate(`document.querySelector('#home-hero-title').textContent`),'Into the Unknown.');
 assert.equal(await evaluate(`document.querySelector('.gnwaa-hero-tagline').getAttribute('aria-hidden')`),'true');
 const cards=['discover','universe','detective','personality','japan','about'];
 const initialLinks=await evaluate(`Array.from(document.querySelectorAll('.home-bento-card')).map(a=>a.getAttribute('href'))`);
 assert.deepEqual(initialLinks,['/discover','/lab','/lab','/lab','/discover/how-suica-works','/about']);
 for(const theme of ['dark','light']) {
  await click('#theme-studio-toggle');await setOption('japan-appearance',theme);await click('#japan-settings [data-close]');
  for(const width of [320,360,375,390,430,768,1024,1440]) {
   await send('Emulation.setDeviceMetricsOverride',{width,height:width<=430?844:960,deviceScaleFactor:1,mobile:width<600});await delay(150);
   assert.equal(await evaluate('document.documentElement.scrollWidth<=innerWidth'),true,theme+' '+width+' overflow');
   const capsule=await evaluate(`(()=>{const r=document.querySelector('.topbar').getBoundingClientRect();return {left:r.left,right:r.right,viewport:document.documentElement.clientWidth}})()`);
   assert.ok(capsule.left>0 && capsule.right<capsule.viewport,'Capsule has outer breathing room');
   assert.ok(Math.abs(capsule.left-(capsule.viewport-capsule.right))<3,'Capsule is centered');
   assert.equal(await evaluate(`document.querySelector('.main-shell').getBoundingClientRect().left`),0,'No sidebar gutter');
   if(width<=780) {
    const hero=await evaluate(`(()=>{const rect=s=>document.querySelector(s).getBoundingClientRect();const header=rect('.topbar'), primary=rect('.home-hero-actions>a:first-child'),secondary=rect('.home-hero-actions>a:nth-child(2)'),tertiary=rect('#japan-omikuji-open'),art=rect('.jm-landscape');return{headerHeight:header.height,primary:primary.width,secondary:secondary.width,artTop:art.top,artBottom:art.bottom,actionsBottom:tertiary.bottom,viewport:innerHeight,caption:document.querySelector('.jm-landscape-caption').textContent,targets:[...document.querySelectorAll('.topbar button')].filter(n=>n.getClientRects().length).every(n=>{const r=n.getBoundingClientRect();return r.width>=44 && r.height>=44})}})()`);
    assert.ok(hero.headerHeight>=56 && hero.headerHeight<=60,'Compact mobile header '+width);
    assert.ok(Math.abs(hero.primary-hero.secondary)<1,'Equal CTA widths');
    assert.ok(hero.artTop>=hero.actionsBottom,'Artwork below controls');
    if(width<=430) assert.ok(hero.artBottom<=hero.viewport,'Fuji composition visible in first viewport '+width);
    assert.ok(hero.targets,'44px header touch targets');
    assert.equal(hero.caption,'\u672a\u77e5\u306e\u4e16\u754c\u3078\u3002');
   }
   if(width<=1100) {
    await click('#mobile-nav-toggle');
    await waitFor(`document.querySelector('#sidebar').classList.contains('is-mobile-open') && document.activeElement.closest('.side-nav')`,'Compact drawer focus');
    await delay(250);
    assert.equal(await evaluate(`document.querySelector('#sidebar').getAttribute('aria-modal')`),'true');
    await pressKey('Escape',27);
    assert.equal(await evaluate(`document.activeElement.id`),'mobile-nav-toggle','Escape restores focus');
    assert.equal(await evaluate(`document.querySelector('.main-shell').inert`),false,'Background restored');
    assert.equal(await evaluate(`getComputedStyle(document.querySelector('#mobile-nav-toggle')).minHeight`),'44px');
   } else {
    assert.equal(await evaluate(`getComputedStyle(document.querySelector('#sidebar')).display`),'none','Desktop sidebar absent');
   }
   assert.equal(await evaluate(`document.querySelector('#home-hero-title').scrollWidth<=document.querySelector('#home-hero-title').clientWidth`),true,'Headline fits');
   assert.equal(await evaluate(`Array.from(document.querySelectorAll('.gnwaa-card-art')).every(svg=>svg.viewBox.baseVal.width===160 && svg.viewBox.baseVal.height===128)`),true);
   const originalLang=await evaluate('document.documentElement.lang');
   await click('#language-toggle');
   assert.equal(await evaluate(`document.querySelector('#home-hero-title').scrollWidth<=document.querySelector('#home-hero-title').clientWidth`),true,'Both language headlines fit '+width);
   await click('#language-toggle');
   if(theme==='dark' && originalLang==='en') await click('#language-toggle');
   if(theme==='light' && await evaluate('document.documentElement.lang')!=='en') await click('#language-toggle');
   if(width===360||width===390||width===1440)await screenshot('home-'+theme+'-'+width+'.png');
  }
 }
 await evaluate(`scrollTo({top:0,behavior:'instant'})`);
 const r=await evaluate(`(()=>{const r=document.querySelector('.home-bento-grid').getBoundingClientRect();return{x:r.x+scrollX,y:Math.max(0,r.y+scrollY-24),width:r.width,height:r.height+48,scale:1}})()`);
 const cardShot=await send('Page.captureScreenshot',{format:'png',captureBeyondViewport:true,clip:r});await writeFile(join(screenshotDir,'six-cards.png'),Buffer.from(cardShot.data,'base64'));
 for(const name of cards) {
  await click('.home-bento-card--'+name);
  const path=await evaluate('location.pathname');
  assert.equal(path,name==='about'?'/about':name==='japan'?'/discover/how-suica-works':name==='discover'?'/discover':'/lab');
  await click('.jm-wordmark');
 }
 for(const file of ['gnwaa-symbol.svg','gnwaa-symbol-dark.svg','gnwaa-symbol-light.svg','gnwaa-logo-dark.svg','gnwaa-logo-light.svg','gnwaa-card-icons.svg']) {
  assert.equal(await evaluate(`fetch('/images/brand/${file}').then(r=>r.text()).then(text=>new DOMParser().parseFromString(text,'image/svg+xml').querySelector('parsererror')===null)`),true,'Valid vector '+file);
 }
 assert.ok(await evaluate(`document.querySelector('link[rel="icon"]').href.endsWith('/images/brand/gnwaa-symbol.svg')`));
 assert.equal(await evaluate(`getComputedStyle(document.querySelector('.gnwaa-card-art .card-anim')).transitionDuration`),'0s','Reduced decorative interaction');
 await click('#theme-studio-toggle');await setOption('japan-motion','on');await click('#japan-settings [data-close]');
 await send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'no-preference'}]});
 await waitFor(`getComputedStyle(document.querySelector('.gnwaa-brush-stroke')).animationName === 'gnwaa-stroke-reveal'`,'Brush reveal follows motion preference change');
 await delay(750);
 assert.equal(await evaluate(`getComputedStyle(document.querySelector('.gnwaa-brush-stroke')).animationIterationCount`),'1','Brush reveal never loops');
 assert.equal(await evaluate(`getComputedStyle(document.querySelector('.gnwaa-brand-row strong')).animationDuration`),'0.65s','Wordmark fades within 500–700ms');
 assert.equal(await evaluate(`getComputedStyle(document.querySelector('.gnwaa-brand-row strong')).opacity`),'1');
 assert.equal(await evaluate(`getComputedStyle(document.querySelector('.gnwaa-brush-stroke')).strokeDashoffset`),'0px');
 const logoPoint=await evaluate(`(()=>{const a=document.querySelector('.jm-wordmark');a.scrollIntoView({block:'center',behavior:'instant'});const r=a.getBoundingClientRect();return{x:r.x+r.width/2,y:r.y+r.height/2}})()`);
 await send('Input.dispatchMouseEvent',{type:'mouseMoved',...logoPoint});await delay(650);
 assert.equal(await evaluate(`getComputedStyle(document.querySelector('.gnwaa-brush-underline path')).strokeDashoffset`),'0px','Hover draws underline');
 await click('.jm-wordmark');
 await click('#language-toggle');
 assert.equal(await evaluate(`document.querySelector('.gnwaa-brand-row strong').getAnimations().every(a=>a.playState==='finished')`),true,'Language/navigation do not replay logo');
 await evaluate(`document.querySelector('#main').focus()`);
 await pressKey('Tab',9);
 await delay(650);
 assert.equal(await evaluate(`document.activeElement.matches('.jm-wordmark:focus-visible')`),true,'Logo receives visible keyboard focus: '+await evaluate(`document.activeElement.outerHTML.slice(0,200)`));
 assert.equal(await evaluate(`getComputedStyle(document.querySelector('.gnwaa-brush-underline path')).strokeDashoffset`),'0px','Keyboard focus draws underline');
 const point=await evaluate(`(()=>{const node=document.querySelector('.home-bento-card--discover');node.scrollIntoView({behavior:'instant',block:'center'});const r=node.getBoundingClientRect();return{x:r.x+r.width/2,y:r.y+r.height/2}})()`);
 await send('Input.dispatchMouseEvent',{type:'mouseMoved',...point});await delay(400);
 assert.notEqual(await evaluate(`getComputedStyle(document.querySelector('.home-art-discover .card-anim')).transform`),'none','Book page reacts to hover');
 await send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});
 await delay(100);
 await click('#mobile-nav-toggle');
 await waitFor(`document.activeElement.closest('.side-nav')`,'Animated drawer receives focus');
 await delay(300);
 await screenshot('floating-mobile-menu.png');
 await pressKey('Escape',27);
 assert.equal(await evaluate(`document.activeElement.id`),'mobile-nav-toggle');
 await send('Emulation.setDeviceMetricsOverride',{width:1440,height:960,deviceScaleFactor:1,mobile:false});
 await delay(100);
 await send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});
 assert.equal(await evaluate(`getComputedStyle(document.querySelector('.home-art-discover .card-anim')).transform`),'none','Reduced motion disables hover movement');
 assert.equal(await evaluate(`getComputedStyle(document.querySelector('.gnwaa-brush-stroke')).animationName`),'none','Reduced motion disables brush reveal');
 assert.equal(await evaluate(`getComputedStyle(document.querySelector('.gnwaa-brush-underline path')).transitionDuration`),'0s','Reduced motion disables underline movement');
 assert.equal(events.filter(e=>e.method==='Runtime.exceptionThrown').length,0,'No browser exceptions');
 await evaluate(`document.body.className='brand-review';document.body.style.cssText='margin:0;padding:40px;background:#e8e4de;font-family:Arial,sans-serif';document.body.innerHTML='<h1 style="color:#0b111b">GNWAA / Rising Horizon</h1>'+['dark','light'].map(mode=>'<section style="background:'+(mode==='dark'?'#0b111b':'#f5f1ea')+';padding:32px;margin:20px 0;border-radius:16px;display:flex;align-items:center;gap:40px"><img alt="Horizontal '+mode+' logo" src="/images/brand/gnwaa-logo-'+mode+'.svg" width="288" height="64">'+[16,32,64].map(size=>'<img alt="'+size+'px symbol" src="/images/brand/gnwaa-symbol-'+mode+'.svg" width="'+size+'" height="'+size+'">').join('')+'</section>').join('');Promise.all(Array.from(document.images).map(image=>image.decode()))`);
 await screenshot('logo-variations.png');
 console.log('Brand/mobile UX passed: MN/EN, dark/light at 320/360/375/390/430/768/1024/1440px, 58px mobile header, equal CTA widths, visible Fuji composition, keyboard drawer/settings, Sumi-e logo, preserved card links, reduced motion, no overflow/exceptions. '+screenshotDir);
} finally {await send('Target.closeTarget',{targetId:target.id});ws.close();}

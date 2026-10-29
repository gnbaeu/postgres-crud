import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

const origin = process.env.GNWAA_TEST_ORIGIN || "http://127.0.0.1:5175";
const screenshotDir = join(tmpdir(), "gnwaa-home-surface-refinement");
const target = await (await fetch("http://127.0.0.1:9225/json/new?about:blank", { method: "PUT" })).json();
const socket = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((resolve, reject) => {
  socket.addEventListener("open", resolve, { once: true });
  socket.addEventListener("error", reject, { once: true });
});

let sequence = 0;
const pending = new Map();
socket.addEventListener("message", (event) => {
  const message = JSON.parse(event.data);
  if (!message.id) return;
  pending.get(message.id)?.(message);
  pending.delete(message.id);
});

const send = (method, params = {}) => new Promise((resolve, reject) => {
  const id = ++sequence;
  pending.set(id, (message) => message.error ? reject(message.error) : resolve(message.result));
  socket.send(JSON.stringify({ id, method, params }));
});
const evaluate = async (expression) => {
  const result = await send("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true });
  if (result.exceptionDetails) throw new Error(JSON.stringify(result.exceptionDetails));
  return result.result.value;
};
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const waitFor = async (expression, label, timeout = 15000) => {
  const end = Date.now() + timeout;
  while (Date.now() < end) {
    if (await evaluate(expression)) return;
    await delay(80);
  }
  throw new Error(`Timed out: ${label}`);
};
const click = async (selector) => {
  const point = await evaluate(`(async () => { const element = document.querySelector(${JSON.stringify(selector)}); if (!element) return null; element.scrollIntoView({block:'center',inline:'center'}); await new Promise(requestAnimationFrame); const rect = element.getBoundingClientRect(); return {x:rect.x+rect.width/2,y:rect.y+rect.height/2}; })()`);
  assert.ok(point, `Missing visible control: ${selector}`);
  await send("Input.dispatchMouseEvent", { type: "mouseMoved", ...point });
  await send("Input.dispatchMouseEvent", { type: "mousePressed", button: "left", clickCount: 1, ...point });
  await send("Input.dispatchMouseEvent", { type: "mouseReleased", button: "left", clickCount: 1, ...point });
};
const screenshot = async (name) => {
  const metrics = await send("Page.getLayoutMetrics");
  const { width, height } = metrics.cssContentSize;
  const { data } = await send("Page.captureScreenshot", {
    format: "png",
    fromSurface: true,
    captureBeyondViewport: true,
    clip: { x: 0, y: 0, width, height, scale: 1 },
  });
  await writeFile(join(screenshotDir, name), Buffer.from(data, "base64"));
};
const setComparisonStyle = (css) => evaluate(`(() => { let style=document.querySelector('#surface-before-comparison'); if(!style){style=document.createElement('style');style.id='surface-before-comparison';document.head.append(style);} style.textContent=${JSON.stringify(css)}; })()`);
const clearComparisonStyle = () => evaluate("document.querySelector('#surface-before-comparison')?.remove()");
const setViewport = async (width, height) => {
  await send("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: 1, mobile: width < 600 });
  await delay(280);
};

await mkdir(screenshotDir, { recursive: true });
await send("Page.enable");
await send("Runtime.enable");
await send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "no-preference" }] });
await setViewport(1440, 1080);
await send("Page.navigate", { url: origin });
await waitFor("document.readyState === 'complete' && !!document.querySelector('#matrix-loader')", "Home loaded");
await evaluate("sessionStorage.clear(); localStorage.clear()");
await send("Page.reload");
await waitFor("!document.querySelector('#matrix-loader').hidden", "Intro shown");
assert.equal(await evaluate("!!document.querySelector('#skip-intro')"), false, "Skip Intro remains absent");
await waitFor("document.querySelector('#matrix-loader').hidden && !document.querySelector('.app-layout').inert", "Intro completion", 12000);
await waitFor("document.querySelector('#matrix-canvas').width === 0", "Intro canvas cleanup");
assert.equal(await evaluate("document.documentElement.lang"), "mn");
assert.equal(await evaluate("document.querySelectorAll('.home-view h1').length"), 1);
const previousHomeSurface = `
:root[data-theme] .home-view .home-hero {
  border-color: color-mix(in srgb, var(--editorial-accent) 17%, var(--editorial-border)) !important;
  background: radial-gradient(ellipse at 82% 18%, color-mix(in srgb, var(--editorial-accent-secondary) 7%, transparent), transparent 36%), linear-gradient(135deg, var(--editorial-surface), var(--editorial-elevated)) !important;
  box-shadow: 0 20px 48px rgba(0,0,0,.17), inset 0 1px 0 rgba(255,255,255,.035) !important;
}`;
await setComparisonStyle(previousHomeSurface);
await screenshot("home-1440-before.png");
await clearComparisonStyle();
await screenshot("home-1440.png");

const widths = [360, 390, 430, 768, 1024, 1440];
const homeOverflow = [];
for (const width of widths) {
  await setViewport(width, width < 600 ? 844 : 960);
  const result = await evaluate("({viewport:window.innerWidth,document:document.documentElement.scrollWidth,client:document.documentElement.clientWidth})");
  homeOverflow.push({ width, ...result });
  assert.ok(result.document <= result.viewport, `Home horizontal overflow at ${width}px: ${JSON.stringify(result)}`);
}
await setViewport(390, 844);
assert.equal(await evaluate("getComputedStyle(document.querySelector('.home-bento-grid')).gridTemplateColumns.split(' ').length"), 1);
await setComparisonStyle(previousHomeSurface);
await screenshot("home-390-before.png");
await clearComparisonStyle();
await screenshot("home-390.png");

await setViewport(1440, 1080);
await send("Page.navigate", { url: `${origin.replace(/\/$/, "")}/about` });
await waitFor("location.pathname === '/about' && document.querySelectorAll('.about-detail-card').length === 3", "About information cards");
assert.deepEqual(await evaluate("Array.from(document.querySelectorAll('.about-detail-card h3')).map(node=>node.textContent.trim())"), ["Юу олж үзэх вэ?", "Яаж бүтээгдсэн бэ?", "Дараагийн хуудсууд"]);
const surface = await evaluate(`(() => {
  const hero = document.querySelector('.about-hero');
  const cards = [...document.querySelectorAll('.about-detail-card')];
  const style = (element) => { const css=getComputedStyle(element); return {background:css.backgroundImage,border:css.borderColor,radius:css.borderRadius,shadow:css.boxShadow,transform:css.transform}; };
  return {hero:style(hero), cards:cards.map(style), tint:getComputedStyle(document.documentElement).getPropertyValue('--editorial-card-surface-start').trim()};
})()`);
assert.match(surface.hero.background, /radial-gradient/);
assert.ok(surface.tint, "Theme-aware tinted card surface token resolves");
assert.ok(surface.cards.every((card) => card.background.includes("radial-gradient") && card.radius === "22px"));
assert.ok(surface.cards.every((card) => card.background === surface.cards[0].background && card.border === surface.cards[0].border));
const previousAboutSurface = `
:root[data-theme] .about-view .about-hero {
  border-color: var(--accent-line) !important;
  background: radial-gradient(ellipse at 82% 38%, color-mix(in srgb, var(--accent-secondary) 13%, transparent), transparent 36%), radial-gradient(ellipse at 12% 84%, var(--accent-soft), transparent 46%), linear-gradient(130deg, rgba(20,24,51,.97), rgba(10,18,37,.96) 58%, rgba(13,25,49,.97)) !important;
  box-shadow: var(--surface-shadow) !important;
}
:root[data-theme] .about-view .about-detail-card {
  border-color: var(--editorial-border) !important;
  background: linear-gradient(145deg, var(--editorial-elevated), var(--editorial-surface) 70%) !important;
  box-shadow: 0 12px 28px rgba(0,0,0,.12) !important;
}`;
await setComparisonStyle(previousAboutSurface);
await screenshot("about-cards-1440-before.png");
await clearComparisonStyle();
await screenshot("about-cards-1440.png");

const detailOverflow = [];
for (const width of widths) {
  await setViewport(width, width < 600 ? 844 : 960);
  const result = await evaluate("({viewport:window.innerWidth,document:document.documentElement.scrollWidth,client:document.documentElement.clientWidth,columns:getComputedStyle(document.querySelector('.about-detail-grid')).gridTemplateColumns.split(' ').length})");
  detailOverflow.push({ width, ...result });
  assert.ok(result.document <= result.viewport, `About horizontal overflow at ${width}px: ${JSON.stringify(result)}`);
  if (width < 600) assert.equal(result.columns, 1, `About cards should stack at ${width}px`);
}
await setViewport(390, 844);
await setComparisonStyle(previousAboutSurface);
await screenshot("about-cards-390-before.png");
await clearComparisonStyle();
await screenshot("about-cards-390.png");

await click("#language-toggle");
assert.equal(await evaluate("document.documentElement.lang"), "en");
assert.deepEqual(await evaluate("Array.from(document.querySelectorAll('.about-detail-card h3')).map(node=>node.textContent.trim())"), ["What can you explore?", "How is it built?", "More pages ahead"]);
const englishOverflow = await evaluate("document.documentElement.scrollWidth <= window.innerWidth");
assert.equal(englishOverflow, true, "English card text should not overflow at 390px");
await click("#language-toggle");
assert.equal(await evaluate("document.documentElement.lang"), "mn");

const lightBefore = await evaluate("document.documentElement.dataset.theme");
await click("#theme-toggle");
const lightTheme = await evaluate("document.documentElement.dataset.theme");
assert.notEqual(lightTheme, lightBefore, "Appearance control should switch dark/light theme");
const lightSurface = await evaluate("({hero:getComputedStyle(document.querySelector('.about-hero')).backgroundImage,card:getComputedStyle(document.querySelector('.about-detail-card')).backgroundImage,border:getComputedStyle(document.querySelector('.about-detail-card')).borderColor})");
assert.match(lightSurface.hero, /radial-gradient/);
assert.match(lightSurface.card, /radial-gradient/);
assert.notEqual(lightSurface.border, "rgba(0, 0, 0, 0)");
await click("#theme-toggle");
assert.equal(await evaluate("document.documentElement.dataset.theme"), lightBefore);

const presets = ["aurora-purple", "ocean-night", "emerald-matrix", "sunset-neon", "moonlight"];
const presetChecks = [];
for (const preset of presets) {
  await evaluate(`document.documentElement.dataset.accentTheme = ${JSON.stringify(preset)}`);
  const result = await evaluate("({preset:document.documentElement.dataset.accentTheme,accent:getComputedStyle(document.documentElement).getPropertyValue('--editorial-accent').trim(),card:getComputedStyle(document.querySelector('.about-detail-card')).backgroundImage})");
  assert.equal(result.preset, preset);
  assert.ok(result.accent && result.card.includes("radial-gradient"), `Card tint should resolve for ${preset}`);
  presetChecks.push({ preset, accent: result.accent });
}
await evaluate("document.documentElement.dataset.accentTheme = 'aurora-purple'");
const contrastChecks = await evaluate(`(() => {
  const root=document.documentElement;
  const context=document.createElement('canvas').getContext('2d');
  const rgb=(value)=>{context.clearRect(0,0,1,1);context.fillStyle='rgb(0 0 0)';context.fillStyle=value;context.fillRect(0,0,1,1);return [...context.getImageData(0,0,1,1).data].slice(0,3).map(value=>value/255);};
  const luminance=(value)=>{const [r,g,b]=rgb(value).map(channel=>channel<=.04045?channel/12.92:((channel+.055)/1.055)**2.4);return .2126*r+.7152*g+.0722*b;};
  const ratio=(a,b)=>{const values=[luminance(a),luminance(b)].sort((x,y)=>y-x);return (values[0]+.05)/(values[1]+.05);};
  const checks=[];
  for(const mode of ['dark','light']){
    root.dataset.theme=mode;
    for(const preset of ${JSON.stringify(presets)}){
      root.dataset.accentTheme=preset;
      const css=getComputedStyle(root);
      const surfaces=['--editorial-card-surface-start','--editorial-card-surface-end','--editorial-hero-surface-start','--editorial-hero-surface-end'].map(name=>css.getPropertyValue(name).trim());
      const colors=['--editorial-text','--editorial-muted','--accent-readable'].map(name=>css.getPropertyValue(name).trim());
      const ratios=surfaces.map(surface=>colors.map(color=>ratio(color,surface)));
      checks.push({mode,preset,minPrimary:Math.min(...ratios.map(row=>row[0])),minMuted:Math.min(...ratios.map(row=>row[1])),minAccent:Math.min(...ratios.map(row=>row[2]))});
    }
  }
  root.dataset.theme=${JSON.stringify(lightBefore)};
  root.dataset.accentTheme='aurora-purple';
  return checks;
})()`);
assert.ok(contrastChecks.every((check) => check.minPrimary >= 4.5 && check.minMuted >= 4.5 && check.minAccent >= 4.5), `Text contrast below 4.5: ${JSON.stringify(contrastChecks)}`);

const focusStyle = await evaluate("(() => { const link=document.querySelector('.about-detail-card a'); link.focus({focusVisible:true}); const css=getComputedStyle(link); return {outline:css.outlineStyle,width:css.outlineWidth,minHeight:css.minHeight}; })()");
assert.equal(focusStyle.outline, "solid");
assert.ok(Number.parseFloat(focusStyle.width) >= 3);
assert.ok(Number.parseFloat(focusStyle.minHeight) >= 44);
await send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "reduce" }] });
const reducedMotion = await evaluate("({card:getComputedStyle(document.querySelector('.about-detail-card')).transitionDuration,link:getComputedStyle(document.querySelector('.about-detail-card a')).transitionDuration})");
assert.equal(reducedMotion.card, "0s");
assert.equal(reducedMotion.link, "0s");
await send("Emulation.setTouchEmulationEnabled", { enabled: true, maxTouchPoints: 5 });
assert.equal(await evaluate("matchMedia('(hover: none)').matches"), true);

console.log(JSON.stringify({
  result: "Home/About surface visual checks passed",
  intro: "completed and canvas cleaned up; no Skip Intro",
  screenshots: screenshotDir,
  homeOverflow,
  aboutOverflow: detailOverflow,
  englishMobileOverflow: englishOverflow,
  theme: { before: lightBefore, light: lightTheme, accents: presetChecks },
  contrastChecks,
  focusStyle,
  reducedMotion,
}, null, 2));
socket.close();

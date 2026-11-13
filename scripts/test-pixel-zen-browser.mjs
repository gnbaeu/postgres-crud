// Requires a local Vite server and an ISOLATED Chrome/Edge test profile on CDP 9225.
// This suite clears only the test origin's storage. Never use a personal profile.
import assert from "node:assert/strict";
import {mkdir, writeFile} from "node:fs/promises";
import {resolve,join} from "node:path";
import {PORTFOLIO_COPY} from "../portfolio-copy.js";
const origin=process.env.GNWAA_TEST_ORIGIN||"http://127.0.0.1:5175";
const screenshots=resolve("artifacts/world-6");
let target;
try {target=await(await fetch("http://127.0.0.1:9225/json/new?about:blank",{method:"PUT"})).json();}
catch {throw Error("Browser verification blocked: no isolated Chrome/Edge on CDP port 9225. No scenarios or screenshots ran. Start a temporary debugging profile, then run npm run check:portfolio:browser.");}
const ws=new WebSocket(target.webSocketDebuggerUrl);
await new Promise((resolve,reject)=>{ws.addEventListener("open",resolve,{once:true});ws.addEventListener("error",reject,{once:true});});
let sequence=0;
const pending=new Map(),events=[];
ws.addEventListener("message",event=>{
  const message=JSON.parse(event.data);
  if(message.id){pending.get(message.id)?.(message);pending.delete(message.id);}
  else events.push(message);
});
ws.addEventListener("close",()=>{
  for(const complete of pending.values())complete({error:{message:"CDP connection closed before browser verification completed"}});
  pending.clear();
});
const send=(method,params={})=>new Promise((resolve,reject)=>{
  if(ws.readyState!==WebSocket.OPEN){reject(Error("CDP connection is not open"));return;}
  const id=++sequence;pending.set(id,message=>message.error?reject(Error(JSON.stringify(message.error))):resolve(message.result));
  ws.send(JSON.stringify({id,method,params}));
});
const evaluate=async expression=>{
  const result=await send("Runtime.evaluate",{expression,returnByValue:true,awaitPromise:true});
  if(result.exceptionDetails)throw Error(JSON.stringify(result.exceptionDetails));
  return result.result.value;
};
const delay=ms=>new Promise(resolve=>setTimeout(resolve,ms));
const wait=async(expression,label)=>{
  const deadline=Date.now()+10000;
  while(Date.now()<deadline){if(await evaluate(expression))return;await delay(60);}
  throw Error("Timed out: "+label);
};
const ready=async path=>{
  await wait(`location.pathname===${JSON.stringify(path)} && document.readyState==='complete' && document.querySelector('#public-footer')?.textContent.length>0 && !document.querySelector('.app-layout').inert && [...document.querySelectorAll('[data-page-view]:not([hidden]) h1,#page-title')].some(el=>el.getClientRects().length)`,path);
  await evaluate("document.fonts.ready");
  // The portfolio deliberately schedules heading focus and scroll-to-top in RAF.
  // Finish that route work before a test focuses a control or scrolls to a target.
  await evaluate("new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)))");
};
const navigate=async path=>{
  const start=events.length;
  await send("Page.navigate",{url:origin+path});
  const deadline=Date.now()+10000;
  while(!events.slice(start).some(event=>event.method==="Page.loadEventFired")) {
    if(Date.now()>deadline)throw Error("Document did not load: "+path);
    await delay(60);
  }
  await ready(path);
};
// Page.reload acknowledges the request before the old document is replaced.
// Wait for the new document's load event before evaluating its readiness.
const reload=async path=>{
  const start=events.length;
  await send("Page.reload");
  const deadline=Date.now()+10000;
  while(!events.slice(start).some(event=>event.method==="Page.loadEventFired")){
    if(Date.now()>deadline)throw Error("Reload did not finish: "+path);
    await delay(60);
  }
  await ready(path);
};
// Keep native hit testing; settle pending UI frames before positioning the target.
const click=async selector=>{
  const point=await evaluate(`(async()=>{await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));const el=[...document.querySelectorAll(${JSON.stringify(selector)})].find(el=>el.getClientRects().length);if(!el)throw Error('Missing target '+${JSON.stringify(selector)});el.scrollIntoView({block:'center',behavior:'instant'});await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));const rect=el.getBoundingClientRect(),x=rect.x+rect.width/2,y=rect.y+rect.height/2;if(el.closest('[inert]')||!el.contains(document.elementFromPoint(x,y)))throw Error('Blocked target '+${JSON.stringify(selector)}+' at '+x+','+y+' hit='+document.elementFromPoint(x,y)?.outerHTML.slice(0,400)+' inert='+!!el.closest('[inert]'));return{x,y};})()`);
  await send("Input.dispatchMouseEvent",{type:"mousePressed",button:"left",clickCount:1,...point});
  await send("Input.dispatchMouseEvent",{type:"mouseReleased",button:"left",clickCount:1,...point});
};
const select=async(selector,value)=>evaluate(`(()=>{const el=document.querySelector(${JSON.stringify(selector)});el.value=${JSON.stringify(value)};el.dispatchEvent(new Event('change',{bubbles:true}));})()`);
const language=async value=>{await select("#public-language",value);await wait(`document.documentElement.lang===${JSON.stringify(value)}`,"language");};
const theme=async value=>{await select("#public-appearance",value);await wait(`document.querySelector('#public-appearance-mobile').value===${JSON.stringify(value)}`,"appearance");};
const viewport=async width=>{await send("Emulation.setDeviceMetricsOverride",{width,height:1050,deviceScaleFactor:1,mobile:width<768});await delay(80);};
const key=async value=>{await send("Input.dispatchKeyEvent",{type:"keyDown",key:value,code:value,windowsVirtualKeyCode:value==="Escape"?27:9});await send("Input.dispatchKeyEvent",{type:"keyUp",key:value,code:value,windowsVirtualKeyCode:value==="Escape"?27:9});};
const screenshot=async(name,clip)=>{
  await mkdir(screenshots,{recursive:true});
  await evaluate("document.fonts.ready.then(()=>Promise.all([...document.images].filter(img=>img.getClientRects().length).map(img=>img.decode().catch(()=>{}))))");
  assert.equal(await evaluate("[...document.querySelectorAll('[data-project-screenshot]')].filter(el=>el.getClientRects().length).every(el=>el.complete && el.naturalWidth>0)"),true,"Configured genuine screenshots load");
  const metrics=await send("Page.getLayoutMetrics");
  const bounds=clip||{x:0,y:0,width:metrics.cssContentSize.width,height:metrics.cssContentSize.height,scale:1};
  const {data}=await send("Page.captureScreenshot",{format:"png",captureBeyondViewport:true,clip:bounds});
  await writeFile(join(screenshots,name),Buffer.from(data,"base64"));
};
try {
  await send("Page.enable");await send("Runtime.enable");await send("Network.enable");
  // Native keyboard input and route RAF work require a foreground test tab.
  await send("Page.bringToFront");
  await send("Emulation.setFocusEmulationEnabled",{enabled:true});
  await send("Storage.clearDataForOrigin",{origin,storageTypes:"all"});
  await send("Page.addScriptToEvaluateOnNewDocument",{source:`localStorage.setItem('gnwaa-welcome-v1','done');if(!localStorage.getItem('ganbat-customer-language'))localStorage.setItem('ganbat-customer-language','en');`});
  await viewport(1440);await navigate("/");
  assert.equal(await evaluate("document.documentElement.dataset.theme"),"dark","A new visitor starts with the Mongolian ink theme");
  await language("mn");await theme("light");
  assert.equal(await evaluate("document.querySelector('#matrix-loader')===null && !document.querySelector('.app-layout').inert"),true,"No blocking intro");
  assert.deepEqual(await evaluate("[...document.querySelectorAll('#public-nav>a')].map(el=>el.getAttribute('href'))"),["/","/projects","/playground","/about"]);
  assert.equal(await evaluate("document.querySelector('[data-page-view=home]').textContent.includes('Discover')"),false);
  assert.equal(await evaluate("document.querySelector('#home-hero-title').textContent"),PORTFOLIO_COPY.mn["pz.headline"]);
  assert.equal(await evaluate("getComputedStyle(document.body).backgroundColor"),"rgb(27, 99, 172)","Daytime reference sky");
  assert.equal(await evaluate("document.querySelectorAll('[data-page-view=home] button,[data-page-view=home] section').length"),0,"Home has no extra sections");
  assert.ok(await evaluate("Number(getComputedStyle(document.querySelector('#home-hero-title')).fontWeight)")>=400);
  assert.equal(await evaluate("document.querySelectorAll('[data-page-view=home] .pz-project-entry').length"),0);
  assert.equal(await evaluate("document.querySelectorAll('[data-page-view=home] iframe').length"),0,"Compact Featured Work has no iframe");
  assert.ok(await evaluate("document.querySelector('.pz-intro-art').getBoundingClientRect().width")>=350,"Fuji is a prominent part of the desktop composition");
  assert.equal(await evaluate("fetch('/images/pixel-zen.svg').then(r=>r.text()).then(xml=>!new DOMParser().parseFromString(xml,'image/svg+xml').querySelector('parsererror'))"),true,"Original pixel SVG is valid");
  assert.equal(await evaluate("document.querySelectorAll('[data-page-view=home] [data-pz-route]').length"),3,"Three hero routes");
  assert.equal(await evaluate("getComputedStyle(document.querySelector('.pz-home .mp-scene')).pointerEvents"),"none","Scene never intercepts navigation");
  await screenshot("reference-desktop-1440.png");
  await screenshot("home-desktop-light-1440.png");
  const sectionClip=async selector=>evaluate(`(()=>{const r=document.querySelector(${JSON.stringify(selector)}).getBoundingClientRect();return{x:r.x,y:r.y+scrollY,width:r.width,height:r.height,scale:1}})()`);
  await navigate("/playground");
  for(const locale of ["mn","en","ja"]) {
    await language(locale);
    for(const type of ["movie","food"]) {
      await click(`[data-quick-type="${type}"]`);
      await click('[data-quick-action="draw"]');
      await wait(`document.querySelector('[data-quick-result-type="${type}"]')`,"Quick Draw result");
      const previous=await evaluate("document.querySelector('[data-quick-result-id]').dataset.quickResultId");
      await click('[data-quick-action="draw"]');
      assert.notEqual(await evaluate("document.querySelector('[data-quick-result-id]').dataset.quickResultId"),previous,"No immediate repeat");
      assert.ok(await evaluate("document.querySelector('#quick-draw-live').textContent.length")>0,"Result is announced");
      assert.equal(await evaluate("document.querySelector('[data-quick-open]').getAttribute('href')"),`/randomizer/${type}`);
    }
  }
  await screenshot("playground-quick-draw.png",await sectionClip('.pz-quick'));
  await click('[data-quick-open]');await ready('/randomizer/food');
  await evaluate('history.back()');await ready('/playground');await navigate('/');await language('mn');
  const logo=await evaluate("(()=>{const r=document.querySelector('.pz-brand').getBoundingClientRect();return{x:r.x,y:r.y+scrollY,width:r.width,height:r.height,scale:1}})()");
  await screenshot("logo-light.png",logo);
  await theme("dark");assert.equal(await evaluate("document.documentElement.dataset.theme"),"dark");
  await screenshot("home-desktop-dark-1440.png");await screenshot("logo-dark.png",logo);
  await click('#public-nav [data-page-link="projects"]');await ready("/projects");
  assert.equal(await evaluate("document.querySelectorAll('[data-page-view=projects] .pz-project-entry').length"),2);
  await screenshot("projects-desktop-1440.png");
  await screenshot("featured-desktop-1440.png",await sectionClip(".pz-projects-list"));
  await click('[data-page-view="projects"] [data-pz-route="projectCase"]');await ready("/projects/gnwaa");
  assert.equal(await evaluate("document.querySelector('[data-page-view=projectCase]').querySelectorAll('.pz-case-sections section').length"),7);
  await screenshot('project-detail-desktop.png');
  await navigate('/projects/randomizer');
  assert.equal(await evaluate("document.querySelector('[data-page-view=randomizerCase]').querySelectorAll('.pz-case-sections section').length"),7);
  await reload('/projects/randomizer');
  assert.equal(await evaluate("document.querySelector('#public-nav [data-page-link=projects]').getAttribute('aria-current')"),"page");
  await click('#public-nav [data-page-link="playground"]');await ready("/playground");
  await screenshot("playground-desktop-1440.png");
  for(const tool of ["universe","detective","personality"]) {
    await click('[data-pz-lab="'+tool+'"]');await ready("/lab");
    assert.equal(await evaluate(`document.querySelector('[data-lab-panel="${tool}"]').hidden`),false);
    if(tool==="universe"){
      await evaluate("document.querySelector('#du-nickname').value='Pixel test'");
      await click('input[name="interest"][value="music"]');await click('#du-form button[type="submit"]');
      assert.ok(await evaluate("document.querySelectorAll('.du-planet').length")>0);
    }
    if(tool==="detective"){await click("[data-detective-answer]");assert.equal(await evaluate("document.querySelector('#id-feedback').hidden"),false);}
    if(tool==="personality"){await click('#pl-form input[type="radio"]');await click('#pl-form button[type="submit"]');assert.ok(await evaluate("document.querySelector('#pl-progress-label').textContent.length")>0);}
    await click('#public-nav [data-page-link="playground"]');await ready("/playground");
  }
  await click("[data-omikuji-open]");await wait("document.querySelector('#japan-omikuji').open","Omikuji");
  const first=await evaluate("document.querySelector('#omikuji-title').textContent");
  await click("#omikuji-draw");assert.notEqual(await evaluate("document.querySelector('#omikuji-title').textContent"),first);
  await click("#omikuji-read");await wait("location.pathname.startsWith('/discover/')","article compatibility");
  await click("#japan-zen");assert.equal(await evaluate("document.body.classList.contains('japan-zen')"),true);
  await click("#japan-zen");assert.equal(await evaluate("document.body.classList.contains('japan-zen')"),false);
  await click('#public-nav [data-page-link="about"]');await ready("/about");
  assert.equal(await evaluate("document.querySelector('.pz-biography').textContent.includes('GitHub')"),false);
  await screenshot("about-desktop-1440.png");
  await navigate("/");await evaluate("window.scrollTo(0,document.body.scrollHeight)");
  await click('#public-nav [data-page-link=projects]');await ready("/projects");
  assert.ok(await evaluate("scrollY")<=1,"Navigation scrolls to top");
  await evaluate("history.back()");await ready("/");
  await evaluate("history.forward()");await ready("/projects");
  await reload("/projects");
  await theme("system");
  for(const scheme of ["dark","light"]) {
    await send("Emulation.setEmulatedMedia",{features:[{name:"prefers-color-scheme",value:scheme}]});
    await wait(`document.documentElement.dataset.theme===${JSON.stringify(scheme)}`,"System follows media: "+scheme);
  }
  await theme("dark");await reload("/projects");
  assert.equal(await evaluate("document.documentElement.dataset.theme"),"dark","Theme persists");
  for(const locale of ["mn","en","ja"]) {
    await language(locale);
    assert.equal(await evaluate("document.querySelector('#public-nav [data-page-link=projects]').textContent"),PORTFOLIO_COPY[locale]["pz.projects"]);
    for(const mode of ["light","dark"]) {
      await theme(mode);
      for(const width of [320,360,375,390,430,768,1024,1440]) {
        await viewport(width);
        for(const path of ["/","/projects","/projects/gnwaa","/projects/randomizer","/playground","/about","/lab","/randomizer","/randomizer/movie","/randomizer/food"]) {
          await navigate(path);
          assert.equal(await evaluate("document.documentElement.scrollWidth<=innerWidth"),true,`${locale} ${mode} ${width}px ${path} overflow`);
          if(path==="/"){
            assert.equal(await evaluate("document.querySelectorAll('[data-page-view=home] .pz-project-entry,[data-page-view=home] [data-quick-draw]').length"),0);
            assert.equal(await evaluate("document.querySelector('#home-hero-title').textContent"),PORTFOLIO_COPY[locale]['pz.headline']);
            if(width>=1024)assert.equal(await evaluate("document.documentElement.scrollHeight<=innerHeight+1"),true,"Desktop home is one screen");
            assert.ok(await evaluate("getComputedStyle(document.querySelector('#home-hero-title')).fontFamily.includes('GNWAA Pixel')"));
          }
          assert.equal(await evaluate("document.querySelectorAll('#matrix-loader,#japan-settings').length"),0);
        }
      }
    }
  }
  await language("mn");await viewport(390);await navigate("/");await theme("light");
  assert.ok(await evaluate("document.querySelector('.pz-intro-art').getBoundingClientRect().width")>=280,"Mobile retains the pixel landscape");
  // The Mongolian world is a bottom-anchored decorative layer, outside text flow.
  for(const width of [360,390,430]) {
    await send("Emulation.setDeviceMetricsOverride",{width,height:844,deviceScaleFactor:1,mobile:true});
    await navigate("/");
    for(const mode of ["light","dark"]) {
      await theme(mode);
      const layout=await evaluate(`(()=>{
        const art=document.querySelector('.pz-intro-art'),scene=art.querySelector('.mp-scene');
        const a=art.getBoundingClientRect(),s=scene.getBoundingClientRect(),t=document.querySelector('.pz-intro-text').getBoundingClientRect();
        const controls=[...document.querySelectorAll('#public-header a,#public-header select,#public-menu-toggle,.pz-actions a')].filter(el=>el.getClientRects().length);
        return {position:getComputedStyle(art).position,passive:getComputedStyle(art).pointerEvents==='none',
          belowText:s.top>=t.bottom,contained:s.left>=a.left-1&&s.right<=a.right+1&&s.bottom<=a.bottom+1&&s.height>0,
          overflow:document.documentElement.scrollWidth>innerWidth,
          reachable:controls.every(el=>{const r=el.getBoundingClientRect();return r.top>=0&&r.bottom<=innerHeight&&el.contains(document.elementFromPoint(r.x+r.width/2,r.y+r.height/2))})};
      })()`);
      assert.deepEqual(layout,{position:"absolute",passive:true,belowText:true,contained:true,overflow:false,reachable:true},`${width}px ${mode}: bottom-anchored world stays below copy and leaves navigation reachable`);
      await screenshot(`home-mobile-${mode}-${width}.png`);
    }
    await click("#public-menu-toggle");
    await click('#public-nav [data-page-link="projects"]');await ready("/projects");
    assert.equal(await evaluate("document.querySelector('#public-menu-toggle').getAttribute('aria-expanded')"),"false",`${width}px mobile navigation closes after routing`);
  }
  await viewport(390);await navigate("/");await theme("light");
  assert.equal(await evaluate("[...document.querySelectorAll('#public-header a,#public-header select,#public-menu-toggle')].filter(el=>el.getClientRects().length).every(el=>el.getBoundingClientRect().height>=44)"),true,"Reference controls keep comfortable touch targets");
  await screenshot("reference-mobile-390.png");

  await click("#public-menu-toggle");assert.equal(await evaluate("document.querySelector('#public-menu-toggle').getAttribute('aria-expanded')"),"true");
  await key("Escape");assert.equal(await evaluate("document.activeElement.id"),"public-menu-toggle");
  await click("#public-menu-toggle");await click('#public-nav [data-page-link="projects"]');await ready("/projects");
  assert.equal(await evaluate("document.querySelector('#public-menu-toggle').getAttribute('aria-expanded')"),"false");
  for(const mode of ["light","dark"]){await theme(mode);await navigate("/");await screenshot("home-mobile-"+mode+"-390.png");}
  await navigate("/projects");await screenshot("projects-mobile-390.png");
  await navigate("/playground");await screenshot("playground-mobile-390.png");
  await send("Emulation.setEmulatedMedia",{features:[{name:"prefers-reduced-motion",value:"reduce"}]});
  await navigate("/playground");
  assert.equal(await evaluate("getComputedStyle(document.querySelector('.pz-brand svg')).animationName"),"none");
  assert.equal(await evaluate("[...document.querySelectorAll('.mp-scene *')].every(el=>getComputedStyle(el).animationName==='none')"),true,"Reduced motion stops scene animation");
  await evaluate("document.querySelector('[data-quick-action=draw]').focus()");
  assert.equal(await evaluate("document.activeElement.dataset.quickAction"),"draw","Keyboard draw starts on the focused button");
  // CDP needs the Enter character to generate keypress/default button activation.
  await send('Input.dispatchKeyEvent',{type:'keyDown',key:'Enter',code:'Enter',windowsVirtualKeyCode:13,text:'\r',unmodifiedText:'\r'});
  await send('Input.dispatchKeyEvent',{type:'keyUp',key:'Enter',code:'Enter',windowsVirtualKeyCode:13});
  await wait("document.querySelector('[data-quick-result-id]')","Reduced-motion keyboard draw");
  assert.equal(await evaluate("document.activeElement.dataset.quickAction"),'draw','Draw retains keyboard focus');
  await evaluate("document.querySelector('.pz-brand').focus()");await key("Tab");
  assert.equal(await evaluate("document.activeElement.id"),"public-language","Collapsed menu links are excluded from keyboard order");
  await send("Page.navigate",{url:origin+"/login"});
  await wait("!document.querySelector('#auth-gate').hidden && document.querySelector('.app-layout').inert","Protected owner boundary");
  await send("Page.navigate",{url:origin+"/admin#customers"});
  await wait("!document.querySelector('#auth-gate').hidden && document.querySelector('.app-layout').inert","Anonymous admin remains gated");
  const exceptions=events.filter(event=>event.method==="Runtime.exceptionThrown").map(event=>event.params.exceptionDetails.exception?.description);
  assert.deepEqual(exceptions,[],"No uncaught browser errors");
  const missingAssets=events.filter(event=>event.method==="Network.responseReceived" && event.params.response.status>=400).map(event=>new URL(event.params.response.url).pathname).filter(path=>!path.startsWith("/api/")&&path!=="/favicon.ico");
  assert.deepEqual([...new Set(missingAssets)],[],"No missing frontend assets");
  console.log("Pixel Zen browser regression passed: core pages, case study, real navigation, Lab tools, Omikuji/Zen, archive routes, 3 languages, Light/Dark/System, keyboard/mobile menu, no intro, history/direct refresh, protected owner gate and 8 viewport widths.");
  console.log("Actual screenshots: "+screenshots);
} catch(error) {
  console.error("Browser state at failure:",await evaluate("({path:location.pathname,ready:document.readyState,theme:document.documentElement.dataset.theme,appearance:document.querySelector('#public-appearance')?.value,systemDark:matchMedia('(prefers-color-scheme: dark)').matches,focus:document.activeElement?.outerHTML.slice(0,200),motion:document.documentElement.dataset.motion})").catch(()=>null));
  throw error;
} finally {if(ws.readyState===WebSocket.OPEN)await send("Target.closeTarget",{targetId:target.id});ws.close();}

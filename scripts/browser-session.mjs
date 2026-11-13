// Local QA only. Requires a dedicated temporary Chrome/Edge profile on CDP 9225.
import { mkdir, writeFile } from "node:fs/promises";
import { dirname } from "node:path";

export async function connectBrowser() {
  let target;
  try { target=await(await fetch("http://127.0.0.1:9225/json/new?about:blank",{method:"PUT"})).json(); }
  catch { throw Error("Browser verification blocked: no isolated Chrome/Edge on CDP 9225. No scenarios or screenshots ran."); }
  const ws=new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((resolve,reject)=>{ws.addEventListener("open",resolve,{once:true});ws.addEventListener("error",reject,{once:true});});
  let sequence=0;
  const pending=new Map(),events=[];
  ws.addEventListener("message",event=>{
    const message=JSON.parse(event.data);
    if(message.id){pending.get(message.id)?.(message);pending.delete(message.id);}
    else events.push(message);
  });
  const send=(method,params={})=>new Promise((resolve,reject)=>{
    const id=++sequence;
    const timer=setTimeout(()=>{pending.delete(id);reject(Error("CDP timeout: "+method));},20000);
    pending.set(id,message=>{clearTimeout(timer);message.error?reject(Error(JSON.stringify(message.error))):resolve(message.result);});
    ws.send(JSON.stringify({id,method,params}));
  });
  const evaluate=async expression=>{
    const result=await send("Runtime.evaluate",{expression,returnByValue:true,awaitPromise:true});
    if(result.exceptionDetails)throw Error(JSON.stringify(result.exceptionDetails));
    return result.result.value;
  };
  const delay=ms=>new Promise(resolve=>setTimeout(resolve,ms));
  const wait=async(expression,label)=>{
    const end=Date.now()+10000;
    while(Date.now()<end){if(await evaluate(expression))return;await delay(60);}
    throw Error("Timed out: "+label);
  };
  const navigate=async url=>{
    const start=events.length;
    await send("Page.navigate",{url});
    const end=Date.now()+10000;
    while(!events.slice(start).some(event=>event.method==="Page.loadEventFired")){
      if(Date.now()>end)throw Error("Document did not load: "+url);
      await delay(60);
    }
    await wait("document.readyState==='complete' && document.body.classList.contains('jm-public') && !!document.querySelector('#public-footer')?.textContent.trim()","public application");
  };
  const viewport=async(width,height=1050)=>{
    await send("Emulation.setDeviceMetricsOverride",{width,height,deviceScaleFactor:1,mobile:width<768});
    await delay(80);
  };
  const click=async selector=>{
    const point=await evaluate(`(async()=>{const el=[...document.querySelectorAll(${JSON.stringify(selector)})].find(el=>el.getClientRects().length);if(!el)throw Error('Missing '+${JSON.stringify(selector)});el.scrollIntoView({block:'center',behavior:'instant'});await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));const r=el.getBoundingClientRect(),x=r.x+r.width/2,y=r.y+r.height/2;if(el.closest('[inert]')||!el.contains(document.elementFromPoint(x,y)))throw Error('Blocked '+${JSON.stringify(selector)});return{x,y};})()`);
    await send("Input.dispatchMouseEvent",{type:"mousePressed",button:"left",clickCount:1,...point});
    await send("Input.dispatchMouseEvent",{type:"mouseReleased",button:"left",clickCount:1,...point});
  };
  const select=async(selector,value)=>evaluate(`(()=>{const el=document.querySelector(${JSON.stringify(selector)});el.value=${JSON.stringify(value)};el.dispatchEvent(new Event('change',{bubbles:true}));})()`);
  const screenshot=async(path,{clip,full=true,format="png",quality}={})=>{
    await evaluate("document.fonts.ready");
    const metrics=await send("Page.getLayoutMetrics");
    const bounds=clip||(full?{x:0,y:0,width:metrics.cssContentSize.width,height:metrics.cssContentSize.height,scale:1}:undefined);
    const {data}=await send("Page.captureScreenshot",{format,...(quality?{quality}:{}),captureBeyondViewport:full,...(bounds?{clip:bounds}:{})});
    const bytes=Buffer.from(data,"base64");
    if(path){await mkdir(dirname(path),{recursive:true});await writeFile(path,bytes);}
    return bytes;
  };
  await send("Page.enable");await send("Runtime.enable");await send("Network.enable");
  return {send,evaluate,wait,navigate,viewport,click,select,screenshot,events,close:async()=>{try{await send("Target.closeTarget",{targetId:target.id});}finally{ws.close();}}};
}

export function localOrigin() {
  const url=new URL(process.env.GNWAA_TEST_ORIGIN||"http://127.0.0.1:5175");
  if(url.protocol!=="http:"||!["127.0.0.1","localhost","[::1]"].includes(url.hostname))throw Error("Only a local HTTP preview origin is allowed.");
  return url.origin;
}

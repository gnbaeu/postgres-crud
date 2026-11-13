// Raster scenery and independent four-frame actors share one scene camera.
const ACTOR_ROUTES = [
 {id:'student',from:[100,390],to:[330,390],scale:[.75,.75],duration:36,phase:-6,pace:.78,color:'#6F9FA9',bag:true},
 {id:'office',from:[820,338],to:[600,338],scale:[.45,.45],duration:65,phase:-24,pace:1.1,color:'#B49B74',bag:true},
 {id:'couple-a',from:[430,424],to:[640,424],scale:[.8,.8],duration:42,phase:-21,pace:.85,color:'#7A809B'},
 {id:'couple-b',from:[447,433],to:[657,433],scale:[.8,.8],duration:42,phase:-21.2,pace:.89,color:'#AF7874'},
 {id:'deel',from:[820,468],to:[460,468],scale:[1.1,1.1],duration:50,phase:-4,pace:.8,color:'#577F93',deel:true},
 {id:'tourist',from:[210,485],to:[440,485],scale:[1,1],duration:34,phase:-19,pace:.68,color:'#C2AA73',bag:true,cap:true},
 {id:'distant-a',from:[490,308],to:[650,308],scale:[.35,.35],duration:80,phase:-45,pace:1.2,color:'#879880'},
 {id:'distant-b',from:[860,315],to:[760,315],scale:[.35,.35],duration:72,phase:-30,pace:1.12,color:'#AD8F7C'},
 {id:'away',from:[340,474],to:[410,336],scale:[1,.42],duration:62,phase:-11,pace:.96,color:'#B79679',bag:true},
 {id:'towards',from:[870,330],to:[858,490],scale:[.4,1.05],duration:68,phase:-32,pace:.92,color:'#879F9C'},
 {id:'walker',from:[570,510],to:[210,510],scale:[.95,.95],duration:52,phase:-38,pace:.74,color:'#82729A'},
 {id:'worker',from:[88,340],to:[300,340],scale:[.5,.5],duration:68,phase:-50,pace:1.05,color:'#8095A9',bag:true}
];
// Keep every route below the statue/planters, on the open foreground paving.
export const WORLD_PEOPLE = ACTOR_ROUTES.map(p=>({...p,
 from:[p.from[0],520+(p.from[1]-308)*.35],
 to:[p.to[0],520+(p.to[1]-308)*.35],
 scale:p.scale.map(s=>s*1.4)
}));
export const WORLD_BACKGROUNDS = Object.freeze({
 light:'/images/world/plaza-day-v1.png',
 dark:'/images/world/plaza-night-v1.png'
});
function person(p,i){
 const frames=[0,1,2,3].map(frame=>{
  const legs=frame===1?'M2 20h3v5H2Zm0 5h5v2H2Zm8-5h3v3h-3Zm0 3h4v2h-4Z':frame===3?'M3 20h3v3H3Zm-1 3h4v2H2Zm7-3h3v5H9Zm0 5h5v2H9Z':'M4 20h3v7H4Zm5 0h3v7H9Z';
  const arms=frame===1?'M0 10h2v5H0Zm14 3h2v7h-2Z':frame===3?'M0 13h2v7H0Zm14-3h2v5h-2Z':'M0 10h2v9H0Zm14 0h2v9h-2Z';
  return '<g class="mp-sprite-frame" data-walk-frame="'+frame+'" transform="translate('+frame*16+' 0)"><path fill="var(--scene-ink)" d="'+legs+'"/><path fill="'+(['#BD987C','#A98268','#CEAD8A'][i%3])+'" d="M4 2h8v7H4Z'+arms+'"/><path fill="'+p.color+'" d="M2 9h12v'+(p.deel?15:12)+'H2Z"/>'+(p.deel?'<path fill="#D9B764" d="M2 16h12v2H2Z"/>':'')+(p.bag?'<path fill="#695748" d="M0 10h4v10H0Z"/>':'')+(p.cap?'<path fill="#64788A" d="M3 0h10v3H3Zm0 3h12v2H3Z"/>':'<path fill="#41403B" d="M4 0h8v3H4Z"/>')+'</g>';
 }).join('');
 const style='--from-x:'+p.from[0]+'px;--from-y:'+p.from[1]+'px;--to-x:'+p.to[0]+'px;--to-y:'+p.to[1]+'px;--from-scale:'+p.scale[0]+';--to-scale:'+p.scale[1]+';--walk-duration:'+p.duration+'s;--walk-delay:'+p.phase+'s;--step-duration:'+p.pace+'s;--step-delay:'+(-i*.19)+'s';
 return '<g class="mp-person mp-person-'+i+'" data-person="'+p.id+'" style="'+style+'"><g class="mp-route"><path d="M-1 26h18v2H-1Z" fill="var(--scene-shadow)" opacity=".3"/><g transform="'+(p.to[0]<p.from[0]?'translate(16 0) scale(-1 1)':'translate(0 0)')+'"><svg class="mp-sprite" viewBox="0 0 16 28" width="16" height="28" overflow="hidden"><g class="mp-sprite-strip">'+frames+'</g></svg></g></g></g>';
}
export function mongolScene(variant='home'){
 const theme=globalThis.document?.documentElement?.dataset?.theme==='light'?'light':'dark';
 const people=WORLD_PEOPLE.map((p,i)=>({p,i})).sort((a,b)=>Math.max(a.p.from[1],a.p.to[1])-Math.max(b.p.from[1],b.p.to[1]));
 return '<svg class="mp-scene mp-scene--'+variant+'" viewBox="0 0 960 640" preserveAspectRatio="xMidYMax slice" aria-hidden="true" focusable="false" shape-rendering="crispEdges">'+
 '<defs><clipPath id="mp-plaza-'+variant+'"><path d="M0 520h960v120H0Z"/></clipPath></defs>'+
 '<image class="mp-world-image" href="'+WORLD_BACKGROUNDS[theme]+'" x="0" y="0" width="960" height="640" preserveAspectRatio="none"/>'+
 '<g class="mp-ambient-clouds"><g class="mp-ambient-cloud mp-ambient-cloud-one" transform="translate(452 94)"><path fill="var(--mn-moving-cloud)" d="M0 20h12v-8h16V4h24v8h12v8h20v8H0Z"/><path fill="var(--mn-moving-cloud-shade)" d="M0 24h28v-4h16v4h40v4H0Z"/></g><g class="mp-ambient-cloud mp-ambient-cloud-two" transform="translate(762 142)"><path fill="var(--mn-moving-cloud)" d="M0 12h12V4h20v8h20v8H0Z"/><path fill="var(--mn-moving-cloud-shade)" d="M12 16h40v4H12Z"/></g></g>'+
 '<g class="mp-people" data-scene-layer="walkers" clip-path="url(#mp-plaza-'+variant+')">'+people.map(({p,i})=>person(p,i)).join('')+'</g></svg>';
}
export function initWorldMotion(){
 const syncVisibility=()=>{document.documentElement.dataset.worldPaused=String(document.hidden);};
 const syncTheme=()=>{
  const theme=document.documentElement.dataset.theme==='light'?'light':'dark';
  // Replace only the scenery source; actors retain their running animation state.
  document.querySelectorAll('.mp-world-image').forEach(image=>{
   const source=WORLD_BACKGROUNDS[theme];
   if(image.getAttribute('href')!==source)image.setAttribute('href',source);
  });
 };
 document.addEventListener('visibilitychange',syncVisibility);
 new MutationObserver(syncTheme).observe(document.documentElement,{attributes:true,attributeFilter:['data-theme']});
 window.addEventListener('gnwaa:public-view',syncTheme);
 syncVisibility();syncTheme();
}

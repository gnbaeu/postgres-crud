// Public experience only. Legacy appearance keys and admin controls remain intact.
export const JAPAN_SETTINGS_KEY = 'gnwaa-japan-experience-v1';
const root = document.documentElement;
const systemTheme = window.matchMedia('(prefers-color-scheme: dark)');
const systemMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const seasons = ['spring', 'summer', 'autumn', 'winter'];
export function suggestedSeason(date = new Date()) {
  const month = Number(new Intl.DateTimeFormat('en', {timeZone:'Asia/Tokyo',month:'numeric'}).format(date));
  return month >= 3 && month <= 5 ? 'spring' : month >= 6 && month <= 8 ? 'summer' : month >= 9 && month <= 11 ? 'autumn' : 'winter';
}
function readSettings() {
  let stored = {}, legacy = null;
  try { stored = JSON.parse(localStorage.getItem(JAPAN_SETTINGS_KEY) || '{}') || {}; legacy = localStorage.getItem('ganbat-customer-theme'); } catch { /* Storage is optional. */ }
  return {appearance:['dark','light','system'].includes(stored.appearance) ? stored.appearance : ['dark','light'].includes(legacy) ? legacy : 'system',
    season:seasons.includes(stored.season) ? stored.season : null,
    motion:['on','reduced','off'].includes(stored.motion) ? stored.motion : 'on'};
}
const settings = readSettings();
export const resolveJapanAppearance = () => settings.appearance === 'system' ? systemTheme.matches ? 'dark' : 'light' : settings.appearance;
function applyAtmosphere() {
  root.dataset.season = settings.season || suggestedSeason();
  root.dataset.motion = settings.motion === 'off' ? 'off' : settings.motion === 'reduced' || systemMotion.matches ? 'reduced' : 'on';
  root.style.setProperty('--japan-animation-state', root.dataset.motion === 'on' ? 'running' : 'paused');
  if(root.dataset.motion !== 'on') window.dispatchEvent(new Event('gnwaa:intro-stop'));
}
applyAtmosphere();
export function chooseDiscovery(articles, locale, getCopy, random = Math.random, previous = null) {
  const available = articles.filter(item => item.status === 'published' && getCopy(item, locale)?.title && getCopy(item, locale)?.summary);
  const pool = available.length > 1 ? available.filter(item => item.slug !== previous) : available;
  return pool.length ? pool[Math.min(pool.length - 1, Math.max(0, Math.floor(random() * pool.length)))] : null;
}
const copy = {
  en:{appearance:'Appearance',dark:'Dark',light:'Light',system:'System',season:'Season',spring:'Spring / 春',summer:'Summer / 夏',autumn:'Autumn / 秋',winter:'Winter / 冬',motion:'Motion',on:'On',reduced:'Reduced',off:'Off',close:'Close',hint:'Changes are saved immediately. Device reduced-motion preferences take priority.',auto:'Use Japan’s seasonal suggestion',random:'Random Discovery',draw:'Draw again',open:'Read this discovery',empty:'No published content is available in this language yet.',discover:'Back to Discover',zen:'Zen Reading Mode',exitZen:'Exit Zen Mode',prompt:'A small moment of curiosity. Draw a real story from GNWAA.',suggested:'Suggested for this month in Japan',manual:'Your chosen season',failure:'This discovery could not be opened. Please try Discover.'},
  mn:{appearance:'Харагдац',dark:'Бараан',light:'Цайвар',system:'Систем',season:'Улирал',spring:'Хавар / 春',summer:'Зун / 夏',autumn:'Намар / 秋',winter:'Өвөл / 冬',motion:'Хөдөлгөөн',on:'Асаалттай',reduced:'Багасгасан',off:'Унтраалттай',close:'Хаах',hint:'Сонголт шууд хадгалагдана. Төхөөрөмжийн хөдөлгөөн багасгах тохиргоог хүндэтгэнэ.',auto:'Японы улирлын санал ашиглах',random:'Санамсаргүй нээлт',draw:'Дахин сонгох',open:'Нийтлэлийг унших',empty:'Энэ хэл дээр нийтлэгдсэн контент одоогоор алга.',discover:'Discover рүү буцах',zen:'Төвлөрч унших горим',exitZen:'Унших горимоос гарах',prompt:'Сониуч зангийн бяцхан завсарлага. GNWAA-ийн бодит нийтлэлтэй танилцаарай.',suggested:'Японы энэ сарын улирлын санал',manual:'Таны сонгосон улирал',failure:'Нийтлэлийг нээж чадсангүй. Discover-оос дахин оролдоно уу.'}
};
export function initJapanExperience({applyAppearance, articles, getCopy, openArticle, navigate, legacyText, closeLegacyAppearance}) {
  const publicView = () => document.body.classList.contains('jm-public');
  const locale = () => root.lang === 'en' ? 'en' : 'mn';
  const text = key => copy[locale()][key];
  let storageAvailable=true;
  const persist = () => {
    try { localStorage.setItem(JAPAN_SETTINGS_KEY, JSON.stringify(settings));storageAvailable=true; } catch { storageAvailable=false; }
    panel.querySelector('[data-copy="hint"]').textContent=storageAvailable?text('hint'):locale()==='mn'?'Browser хадгалалт хаалттай тул сонголт энэ зочлолтод үйлчилнэ.':'Browser storage is unavailable; preferences apply for this visit.';
  };
  const panel = document.createElement('dialog');
  panel.id = 'japan-settings'; panel.className = 'japan-dialog'; panel.setAttribute('aria-labelledby','japan-settings-title');
  panel.innerHTML = `<div class="japan-dialog-head"><div><span lang="ja">和の世界</span><h2 id="japan-settings-title">Japan Experience</h2></div><button type="button" data-close data-copy="close"></button></div><div class="japan-settings-fields"></div><p data-copy="hint"></p><p id="japan-season-hint"></p><button type="button" id="japan-auto-season" data-copy="auto"></button>`;
  const fields = panel.querySelector('.japan-settings-fields');
  for (const [name, options] of [['appearance',['dark','light','system']],['season',seasons],['motion',['on','reduced','off']]]) {
    const label = document.createElement('label');
    const title = document.createElement('span'); title.dataset.copy = name;
    const select = document.createElement('select'); select.id = `japan-${name}`;
    for (const value of options) {const option = document.createElement('option');option.value=value;option.dataset.copy=value;select.append(option);}
    label.append(title,select);fields.append(label);
    select.addEventListener('change', () => { settings[name] = select.value; update();persist(); });
  }
  const omikuji = document.createElement('dialog'); omikuji.id='japan-omikuji';omikuji.className='japan-dialog';omikuji.setAttribute('aria-labelledby','japan-omikuji-title');
  omikuji.innerHTML=`<div class="japan-dialog-head"><div><span lang="ja">おみくじ</span><h2 id="japan-omikuji-title" data-copy="random"></h2></div><button type="button" data-close data-copy="close"></button></div><p data-copy="prompt"></p><div id="omikuji-result" role="status" aria-live="polite"><h3 id="omikuji-title"></h3><p id="omikuji-summary"></p></div><div class="japan-dialog-actions"><button type="button" id="omikuji-read" data-copy="open"></button><button type="button" id="omikuji-draw" data-copy="draw"></button><a href="/discover" id="omikuji-discover" data-copy="discover"></a></div>`;
  document.body.append(panel,omikuji);
  for (const dialog of [panel,omikuji]) {
    let returnFocus;
    dialog.querySelector('[data-close]').addEventListener('click',()=>dialog.close());
    dialog.addEventListener('close',()=>{if(returnFocus?.isConnected){returnFocus.setAttribute('aria-expanded','false');returnFocus.focus();}});
    dialog.addEventListener('keydown',event=>{
      if(event.key!=='Tab') return;
      const items=[...dialog.querySelectorAll('button:not([hidden]),select,a[href]')].filter(item=>item.getClientRects().length);
      const first=items[0],last=items.at(-1);
      if(event.shiftKey && document.activeElement===first){event.preventDefault();last?.focus();}
      else if(!event.shiftKey && document.activeElement===last){event.preventDefault();first?.focus();}
    });
    dialog.openExperience = () => {returnFocus=document.activeElement;returnFocus?.setAttribute('aria-expanded','true');dialog.showModal();dialog.querySelector('button')?.focus();};
  }
  const entry = document.createElement('button'); entry.type='button';entry.id='japan-omikuji-open';entry.className='japan-omikuji-entry';
  entry.setAttribute('aria-haspopup','dialog');
  entry.setAttribute('aria-controls','japan-omikuji');
  document.querySelector('.home-hero-actions').append(entry);
  const discoverEntry = entry.cloneNode();discoverEntry.id='japan-discover-omikuji';document.querySelector('#discover-listing').prepend(discoverEntry);
  let selected = null;
  function draw() {
    selected=chooseDiscovery(articles,locale(),getCopy,Math.random,selected?.slug);
    const content=selected ? getCopy(selected,locale()) : null;
    omikuji.querySelector('#omikuji-title').textContent=content?.title || text('empty');
    omikuji.querySelector('#omikuji-summary').textContent=content?.summary || '';
    omikuji.querySelector('#omikuji-read').hidden=!selected;
  }
  for(const button of [entry,discoverEntry]) button.addEventListener('click',()=>{draw();omikuji.openExperience();});
  omikuji.querySelector('#omikuji-draw').addEventListener('click',draw);
  omikuji.querySelector('#omikuji-read').addEventListener('click',()=>{
    if(!selected) return;
    try {omikuji.close();openArticle(selected.slug);refreshView();} catch {
      selected=null;omikuji.querySelector('#omikuji-title').textContent=text('failure');omikuji.querySelector('#omikuji-summary').textContent='';omikuji.querySelector('#omikuji-read').hidden=true;
      if(!omikuji.open)omikuji.showModal();
    }
  });
  omikuji.querySelector('#omikuji-discover').addEventListener('click',event=>{event.preventDefault();omikuji.close();navigate('discover');refreshView();});
  const zenButton=document.createElement('button');zenButton.type='button';zenButton.id='japan-zen';zenButton.setAttribute('aria-pressed','false');
  document.querySelector('.discover-article-topline').prepend(zenButton);
  let zen=false;try {zen=sessionStorage.getItem('gnwaa-japan-zen-v1')==='true';}catch{}
  zenButton.addEventListener('click',()=>{zen=!zen;try{sessionStorage.setItem('gnwaa-japan-zen-v1',String(zen));}catch{}refreshView();});
  let revealObserver, lastRoute='', revealed=new WeakSet();
  const targets='.jm-featured,.jm-creator-teaser,.home-bento-card,.discover-featured,.discover-article-card,.about-lab-launch,.about-creator,.about-building,.about-hero';
  function refreshView(force=false) {
    const reading=publicView() && !document.querySelector('#discover-article-view').hidden && location.pathname.startsWith('/discover/');
    document.body.classList.toggle('japan-zen',reading && zen);
    zenButton.textContent=`禅モード · ${text(zen?'exitZen':'zen')}`;zenButton.setAttribute('aria-pressed',String(zen));
    const route=location.pathname+location.hash;
    const routeChanged=route!==lastRoute;
    if(!force && !routeChanged) return;
    lastRoute=route;revealObserver?.disconnect();
    if(routeChanged) {revealed=new WeakSet();document.querySelectorAll(targets).forEach(node=>node.classList.remove('japan-reveal'));}
    if(root.dataset.motion!=='on' || !('IntersectionObserver' in window)) {document.querySelectorAll(targets).forEach(node=>node.classList.remove('japan-reveal'));return;}
    revealObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('japan-reveal');revealed.add(entry.target);revealObserver.unobserve(entry.target);}}),{threshold:.08});
    document.querySelectorAll(targets).forEach(node=>{if(node.getClientRects().length && !revealed.has(node))revealObserver.observe(node);});
  }
  function translate() {
    // A legacy admin dialog must never leave an invisible modal layer on a public route.
    if(publicView() && document.querySelector('#theme-studio-dialog')?.open)closeLegacyAppearance();
    for(const dialog of [panel,omikuji])dialog.querySelectorAll('[data-copy]').forEach(node=>node.textContent=text(node.dataset.copy));
    entry.textContent=discoverEntry.textContent=`おみくじ · ${text('random')}`;
    for(const button of document.querySelectorAll('#theme-studio-toggle,#footer-theme-toggle')) {
      if(publicView()) {
        button.setAttribute('aria-label','Japan Experience');button.title='Japan Experience';
        button.setAttribute('aria-controls','japan-settings');
        if(button.id==='footer-theme-toggle')button.textContent='Japan Experience';
      } else if(button.id==='theme-studio-toggle') {
        button.setAttribute('aria-controls','theme-studio-dialog');
        button.setAttribute('aria-label',legacyText('themeStudio.open'));button.title=legacyText('themeStudio.open');
      } else button.textContent=legacyText('footer.appearance');
    }
    panel.querySelector('#japan-season-hint').textContent=`${text(settings.season?'manual':'suggested')}: ${text(root.dataset.season)}`;
    if(!storageAvailable)panel.querySelector('[data-copy="hint"]').textContent=locale()==='mn'?'Browser хадгалалт хаалттай тул сонголт энэ зочлолтод үйлчилнэ.':'Browser storage is unavailable; preferences apply for this visit.';
    refreshView();
  }
  function update() {
    applyAtmosphere();if(publicView())applyAppearance(resolveJapanAppearance(),false);
    panel.querySelector('#japan-appearance').value=settings.appearance;
    panel.querySelector('#japan-season').value=root.dataset.season;
    panel.querySelector('#japan-motion').value=settings.motion;
    translate();refreshView(true);
  }
  panel.querySelector('#japan-auto-season').addEventListener('click',()=>{settings.season=null;update();persist();});
  document.addEventListener('click',event=>{
    if(!publicView()) return;
    if(event.target.closest('#theme-studio-toggle,#theme-toggle,#footer-theme-toggle')) {
      event.preventDefault();event.stopImmediatePropagation();translate();panel.openExperience();
    }
  },true);
  systemTheme.addEventListener('change',()=>{if(publicView() && settings.appearance==='system')applyAppearance(resolveJapanAppearance(),false);});
  systemMotion.addEventListener('change',update);
  new MutationObserver(translate).observe(root,{attributes:true,attributeFilter:['lang']});
  let previousPublic=publicView();
  window.addEventListener('gnwaa:public-view',()=>queueMicrotask(()=>{
    if(location.pathname+location.hash!==lastRoute) {
      if(panel.open)panel.close();
      if(omikuji.open)omikuji.close();
    }
    if(previousPublic!==publicView()) {
      previousPublic=publicView();
      let legacy='dark';try{legacy=localStorage.getItem('ganbat-customer-theme')==='light'?'light':'dark';}catch{}
      applyAppearance(previousPublic?resolveJapanAppearance():legacy,false);
    }
    translate();refreshView();
  }));
  window.addEventListener('popstate',()=>queueMicrotask(refreshView));
  window.addEventListener('hashchange',()=>queueMicrotask(refreshView));
  update();persist();
}

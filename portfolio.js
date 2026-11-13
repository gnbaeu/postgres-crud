import { steppeScene, mongolIcon } from "./mongolian-art.js";
import { mongolScene } from "./mongol-scene.js";
import { PROJECTS, getProject } from "./portfolio-data.js";

const escape = value => String(value ?? "").replace(/[&<>"']/g, character => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" })[character]);
const icon = (id, className="") => `<svg class="pixel-art ${className}" viewBox="0 0 ${id === "fuji" ? "480 300" : id === "wordmark" ? "39 9" : "32 32"}" aria-hidden="true" focusable="false"><use href="/images/pixel-zen.svg#${id}"/></svg>`;
const paths = {home:"/",projects:"/projects",projectCase:"/projects/gnwaa",randomizerCase:"/projects/randomizer",playground:"/playground",about:"/about",randomizer:"/randomizer",randomizerMovie:"/randomizer/movie",randomizerFood:"/randomizer/food",lab:"/lab"};

export function initPortfolio({translate, getLanguage, setLanguage, getPage, navigate, openLab}) {
  const t = (key, values) => translate("pz."+key,values);
  const embedded = location.pathname.startsWith("/randomizer") && new URLSearchParams(location.search).get("preview") === "1";
  document.body.classList.toggle("pz-embed",embedded);
  let renderedLocale = null;
  let lastRoute = "";
  const header = document.querySelector("#public-header");
  const menuButton = document.querySelector("#public-menu-toggle");
  const language = document.querySelector("#public-language");
  const appearance = document.querySelector("#public-appearance");
  const link = (route,key,className="pz-text-link") => `<a class="${className}" href="${paths[route]}" data-pz-route="${route}">${escape(t(key))}${className.includes("--outline") ? "" : `<span aria-hidden="true">${className.includes("--primary") ? "›" : "↗"}</span>`}</a>`;
  const label = (number,key) => `<div class="pz-section-label"><span>${number}</span><h2>${escape(t(key))}</h2></div>`;
  const workbench = () => `<aside class="pz-workbench" aria-label="${escape(t("workbench"))}"><span class="pz-micro">${escape(t("workbench"))}</span><div><strong>GNWAA</strong><p>${escape(t("workbenchText"))}</p><small>${escape(t("workbenchNote"))}</small></div>${icon("cursor")}</aside>`;
  const techList = (project,compact=false) => `<ul class="pz-tech-list" aria-label="${escape(t("technologies"))}">${(compact?project.technologies.slice(-4):project.technologies).map(value=>`<li>${escape(value)}</li>`).join("")}</ul>`;
  const featureList = project => `<ul class="pz-project-features">${project.features.map(key=>`<li>${escape(t(key))}</li>`).join("")}</ul>`;
  const fallback = project => `<div class="pz-preview-fallback" data-preview-fallback ${project.preview?"hidden":""}>
    ${icon(project.icon)}<strong>${escape(project.title)}</strong>
    ${link(project.livePage,"viewProject")}
  </div>`;
  const projectMedia = project => {
    const media = project.preview;
    if(!media)return "";
    return `<figure class="pz-project-media" data-project-media="${project.id}" data-media-state="${media?"image":"fallback"}">
      <div class="pz-project-visual">
        ${media ? `<a class="pz-project-image-link" href="${project.livePath}" data-pz-route="${project.livePage}" data-project-image-link aria-label="${escape(t("viewProject")+": "+project.title)}"><img data-project-screenshot src="${escape(media.src)}" width="${media.width}" height="${media.height}" alt="${escape(project.title+" — "+t("previewAlt"))}" loading="lazy" decoding="async"></a>` : ""}
        ${fallback(project)}
      </div>
      <figcaption data-preview-caption>${escape(t("previewCaptured"))}</figcaption>
    </figure>`;
  };
  const projectActions = (project,compact=false) => `<div class="pz-project-links">
    ${link(project.livePage,project.id==="gnwaa"?"visitSite":"tryDemo","pz-button pz-button--primary")}
    ${link(project.casePage,"caseStudy")}
    <a href="${project.source}" target="_blank" rel="noopener noreferrer">${escape(t("source"))}<span aria-hidden="true"> ↗</span></a>
  </div>`;
  const projectEntry = (project,heading,context) => `<article class="pz-project-entry" data-project-id="${project.id}" data-project-kind="${project.kind}" data-has-preview="${Boolean(project.preview)}" aria-labelledby="${context}-${project.id}-title">
    ${projectMedia(project)}
    <div class="pz-project-copy">
      <p class="pz-micro">${project.number} / ${escape(t(project.category))}</p>
      <h${heading} id="${context}-${project.id}-title">${escape(project.title)}</h${heading}>
      <p class="pz-project-description">${escape(t(project.description))}</p>
      ${techList(project,true)}${project.kind==="feature"?featureList(project):""}
      ${projectActions(project,true)}
      <p class="pz-feature-note">${escape(t(project.kind==="feature"?"featureOf":"standalone"))}</p>
    </div>
  </article>`;

  function home() {
    return `<header class="pz-intro"><div class="pz-intro-text"><p class="mp-eyebrow">${escape(t("worldSubtitle"))}</p><h1 id="home-hero-title" data-i18n="home.heroTitle" tabindex="-1">${escape(t("headline"))}</h1><p class="pz-intro-copy" data-i18n="home.heroText">${escape(t("intro"))}</p><nav class="pz-actions" aria-label="${escape(t("heroNavigation"))}">${link("projects","viewProjects","pz-button pz-button--primary")}${link("playground","tryPlayground")}</nav><aside class="ux-home-demo" data-home-demo></aside></div><div class="pz-intro-art">${mongolScene()}</div><p class="mp-place-label">${escape(t("squareCaption"))}</p></header>`;
  }
  function projects() {
    return `<header class="pz-page-heading mn-gallery-heading"><div class="mn-gallery-sign" aria-hidden="true">${mongolIcon("knot")}</div><p class="pz-micro">01 / ${escape(t("projects"))}</p><h1 tabindex="-1">${escape(t("projectHeading"))}</h1><p>${escape(t("projectIntro"))}</p></header><section class="pz-section pz-projects-list">${PROJECTS.map(project=>projectEntry(project,2,"work")).join("")}</section>${workbench()}`;
  }
  function caseStudy(id) {
    const project=getProject(id);
    const sections=[
      ["overview",`<p>${escape(t(project.study.overview))}</p>`],
      ["motivation",`<p>${escape(t(project.study.motivation))}</p>`],
      ["approach",`<p>${escape(t(project.study.approach))}</p>`],
      ["technologies",techList(project)],
      ["noteworthy",featureList(project)],
      ["challenges",`<p>${escape(t(project.study.challenges))}</p>`],
      ["outcome",`<p>${escape(t(project.study.outcome))}</p>`]
    ];
    return `<nav class="pz-breadcrumb" aria-label="${escape(t("backProjects"))}">${link("projects","backProjects")}</nav><header class="pz-page-heading"><p class="pz-micro">${escape(t(project.kind==="feature"?"featureOf":"projectPlatformCategory"))}</p><h1 tabindex="-1">${escape(project.title)}</h1><p>${escape(t(project.description))}</p>${projectActions(project)}</header>${projectMedia(project)}
      <div class="pz-case-sections">${sections.map(([heading,body],index)=>`<section><span class="pz-micro">0${index+1}</span><h2>${escape(t(heading))}</h2><div>${body}</div></section>`).join("")}</div>`;
  }
  function playground() {
    return `<header class="pz-page-heading mn-illustrated-heading"><p class="pz-micro">02 / ${escape(t("playground"))}</p><h1 tabindex="-1">${escape(t("smallExperiments"))}.</h1><p>${escape(t("playgroundIntro"))}</p>${steppeScene("camp")}<span class="mn-scene-caption">${escape(t("campCaption"))}</span></header>
      <section class="pz-quick" aria-labelledby="quick-draw-title"><div data-quick-draw></div><p id="quick-draw-live" class="visually-hidden" role="status" aria-live="polite" aria-atomic="true"></p></section>
      <section class="pz-gacha-feature"><div class="pz-gacha-illustration">${icon("controller")}<span class="pz-micro">01 / ${escape(t("gacha"))}</span></div><div><p class="pz-micro">${escape(t("experiment"))}</p><h2>${escape(t("randomizer"))}</h2><p>${escape(t("randomizerText"))}</p><div class="pz-actions">${link("randomizerMovie","movie","pz-button")}${link("randomizerFood","food")}</div></div></section>
      <section class="pz-section pz-experiments"><div class="pz-section-label"><span>02</span><h2>${escape(t("lab"))}</h2></div><p>${escape(t("labText"))}</p><ol>${["universe","detective","personality"].map((key,index)=>`<li><span class="pz-micro">0${index+1}</span>${icon(index === 1 ? "cursor" : "folder")}<div><h3>${escape(t(key))}</h3><p>${escape(t(key+"Text"))}</p></div><a href="/lab" data-pz-lab="${key}" aria-label="${escape(t("open")+" "+t(key))}">${escape(t("open"))} <span aria-hidden="true">↗</span></a></li>`).join("")}</ol></section>
      <section class="pz-omikuji">${icon("folder")}<div><h2>${escape(t("omikuji"))}</h2><p>${escape(t("omikujiText"))}</p></div><button class="pz-button" type="button" data-omikuji-open aria-haspopup="dialog" aria-controls="japan-omikuji">${escape(t("draw"))}</button></section>`;
  }
  function about() {
    return `<header class="pz-page-heading mn-illustrated-heading"><p class="pz-micro">03 / GANWAA</p><h1 id="about-heading" tabindex="-1">${escape(t("aboutTitle"))}</h1>${steppeScene("steppe")}<span class="mn-scene-caption">${escape(t("steppeCaption"))}</span></header>
      <section class="pz-biography" aria-labelledby="about-creator-title"><div class="about-creator-image"><picture><source srcset="/images/ganwaa-anime-avatar.webp" type="image/webp"><img src="/images/ganwaa-anime-avatar.png" width="1254" height="1254" alt="${escape(t("portraitAlt"))}" loading="lazy" decoding="async"></picture><span class="pz-micro">GANWAA / GNWAA</span></div><div><span class="pz-micro">${escape(t("meet"))}</span><h2 id="about-creator-title">${escape(t("aboutPreview"))}</h2><p>${escape(t("bioOne"))}</p><p data-i18n="about.description">${escape(t("bioTwo"))}</p></div></section>
      <div class="pz-about-notes"><section><h2>${escape(t("philosophy"))}</h2><ol>${["philosophyOne","philosophyTwo","philosophyThree"].map(key=>`<li>${escape(t(key))}</li>`).join("")}</ol></section><section><h2>${escape(t("technologies"))}</h2><dl><dt>${escape(t("frontEnd"))}</dt><dd>HTML · CSS · JavaScript · Vite</dd><dt>${escape(t("backEnd"))}</dt><dd>Express · PostgreSQL</dd></dl></section></div>${workbench()}`;
  }

  function setMenu(open, restoreFocus=false) {
    header.dataset.menuOpen=String(open);
    menuButton.setAttribute("aria-expanded",String(open));
    menuButton.setAttribute("aria-label",t(open?"closeMenu":"menu"));
    if(!open && restoreFocus)menuButton.focus();
  }
  function render() {
    if(embedded)return;
    document.body.classList.toggle("pz-home-active",getPage()==="home" && document.body.classList.contains("jm-public"));
    const locale=getLanguage();
    const oldAppearance=appearance.value || "system";
    language.setAttribute("aria-label",t("language"));
    language.value=locale;
    appearance.setAttribute("aria-label",t("appearance"));
    appearance.innerHTML=["system","light","dark"].map(value=>`<option value="${value}">${escape(t(value))}</option>`).join("");
    appearance.value=oldAppearance;
    const mobileAppearance=document.querySelector("#public-appearance-mobile");
    mobileAppearance.innerHTML=appearance.innerHTML;
    mobileAppearance.value=oldAppearance;
    mobileAppearance.setAttribute("aria-label",t("appearance"));
    document.querySelector("#public-appearance-label").textContent=t("appearance");
    menuButton.setAttribute("aria-label",t(header.dataset.menuOpen==="true"?"closeMenu":"menu"));
    if(renderedLocale!==locale) {
      const pages={home:home(),projects:projects(),projectCase:caseStudy("gnwaa"),randomizerCase:caseStudy("randomizer"),playground:playground(),about:about()};
      for(const [page,html] of Object.entries(pages))document.querySelector('[data-page-view="'+page+'"]').innerHTML=html;
      document.querySelector("#public-footer").innerHTML=`<div class="pz-footer-brand"><a href="/" data-pz-route="home">${icon("wordmark","pz-wordmark")}<strong class="visually-hidden">GNWAA</strong></a><p>${escape(t("footer"))}</p></div><nav aria-label="${escape(t("menu"))}">${["home","projects","playground","about"].map(page=>link(page,page)).join("")}</nav><div class="pz-footer-bottom"><button type="button" data-welcome-replay>${escape(t("welcomeReplay"))}</button><span>© ${new Date().getFullYear()} GNWAA</span><a href="/login">${escape(t("owner"))} ↗</a></div>`;
      renderedLocale=locale;
    }
    const path=location.pathname.replace(/\/+$/,"")||"/";
    const active=path.startsWith("/projects")?"projects":path==="/about"?"about":/^\/(?:playground|randomizer|lab|discover)(?:\/|$)/.test(path)?"playground":"home";
    document.querySelectorAll("#public-nav a").forEach(link=>{
      const selected=link.dataset.pageLink===active;
      link.classList.toggle("active",selected);
      if(selected)link.setAttribute("aria-current","page");else link.removeAttribute("aria-current");
    });
    const brand=document.querySelector(".pz-brand");
    if(active==="home")brand.setAttribute("aria-current","page");else brand.removeAttribute("aria-current");
    const route=location.pathname+location.hash;
    if(lastRoute!==route) {
      setMenu(false);lastRoute=route;
      if(!["/admin","/login"].includes(path))requestAnimationFrame(()=>{
        document.querySelector('[data-page-view="'+getPage()+'"] h1')?.focus({preventScroll:true});
        window.scrollTo({top:0,behavior:"auto"});
      });
    }
    if(["home","projects","playground","about","projectCase","randomizerCase"].includes(getPage()))
      document.title=(getPage()==="home"?"Ganwaa":getPage()==="projectCase"?"GNWAA Platform":getPage()==="randomizerCase"?"Randomizer":t(getPage()))+" · GNWAA";
  }
  menuButton.addEventListener("click",()=>setMenu(header.dataset.menuOpen!=="true"));
  language.addEventListener("change",()=>setLanguage(language.value));
  document.addEventListener("keydown",event=>{if(event.key==="Escape" && header.dataset.menuOpen==="true")setMenu(false,true);});
  document.addEventListener("click",event=>{
    const routeLink=event.target.closest("[data-pz-route],[data-pz-lab]");
    if(routeLink && !event.ctrlKey && !event.metaKey && !event.shiftKey && !event.altKey && event.button===0) {
      event.preventDefault();
      if(routeLink.dataset.pzLab)openLab(routeLink.dataset.pzLab);
      else {
        const samePath=paths[routeLink.dataset.pzRoute]===location.pathname;
        navigate(routeLink.dataset.pzRoute);
        if(samePath)window.scrollTo({top:0,behavior:"auto"});
      }
      setMenu(false);
    } else if(event.target.closest("#public-nav a"))setMenu(false);
  });
  document.addEventListener("error",event=>{
    if(!event.target.matches?.("[data-project-screenshot]"))return;
    const media=event.target.closest("[data-project-media]");
    if(!media)return;
    media.hidden=true;
    const card=media.closest('[data-project-id]');
    if(card)card.dataset.hasPreview="false";
  },true);
  window.addEventListener("gnwaa:public-view",render);
  render();
}

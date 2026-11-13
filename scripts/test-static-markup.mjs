import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");
const portfolio = readFileSync(new URL("../portfolio.js", import.meta.url), "utf8");
const app = readFileSync(new URL("../app.js", import.meta.url), "utf8");
const api = readFileSync(new URL("../api.js", import.meta.url), "utf8");
const css = readFileSync(new URL("../style.css", import.meta.url), "utf8");
const creatorAvatar = readFileSync(new URL("../public/images/ganwaa-anime-avatar.png", import.meta.url));
const creatorAvatarWebp = readFileSync(new URL("../public/images/ganwaa-anime-avatar.webp", import.meta.url));
assert.deepEqual([...creatorAvatar.subarray(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10],
  "The creator portrait should be a valid PNG asset.");
assert.equal(creatorAvatarWebp.toString("ascii", 0, 4), "RIFF", "The WebP fallback asset should have a valid RIFF container.");
assert.equal(creatorAvatarWebp.toString("ascii", 8, 12), "WEBP", "The optimized creator portrait should be a WebP asset.");
assert.ok(creatorAvatarWebp.length < creatorAvatar.length, "The WebP derivative should be smaller than the PNG fallback.");
const creatorAvatarWidth = creatorAvatar.readUInt32BE(16);
const creatorAvatarHeight = creatorAvatar.readUInt32BE(20);
assert.ok(creatorAvatarWidth > 0 && creatorAvatarHeight > 0, "The creator portrait should preserve a valid intrinsic aspect ratio.");
// Catch stale element-map references, including properties with no selector at all.
// ID-selector checks alone missed the removed loaderMessage/loaderSubtext entries.
const elementMap = app.slice(app.indexOf("const el = {"), app.indexOf("const labState ="));
const declaredElements = new Set([...elementMap.matchAll(/^\s*(\w+):/gm)].map(match => match[1]));
const usedElements = [...app.matchAll(/\bel\.(\w+)/g)].map(match => match[1]);
assert.deepEqual([...new Set(usedElements)].filter(name => !declaredElements.has(name)), [],
  "Every el property must be declared: stale references can abort startup and leave the app inert.");
const vercel = JSON.parse(readFileSync(new URL("../vercel.json", import.meta.url), "utf8"));
const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]);
const dynamicallyCreatedIds = [...(app + portfolio).matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]);
const idSet = new Set(ids);
const duplicateIds = ids.filter((id, index) => ids.indexOf(id) !== index);
const selectorIds = [...app.matchAll(/document\.querySelector(?:All)?\(\s*["']#([\w-]+)["']/g)].map((match) => match[1]);
const availableIds = new Set([...ids, ...dynamicallyCreatedIds]);
const missingIds = [...new Set(selectorIds)].filter((id) => !availableIds.has(id));

assert.deepEqual(duplicateIds, [], "HTML must not contain duplicate IDs.");
assert.deepEqual(missingIds, [], "Every direct ID selector in app.js must exist in index.html.");
assert.match(html, /<script\s+type="module"\s+src="\/app\.js"><\/script>/);
assert.doesNotMatch(app, /http:\/\/localhost:3000|API_BASE|apiRequest/);
assert.doesNotMatch(app, /supabase\.auth|\.from\(TABLE\)/);
assert.match(app, /requestJson\("\/auth\/me"\)/);
assert.match(app, /error\?\.status === 403 && \/owner access required\/i\.test\(error\?\.message \|\| ""\)/);
assert.doesNotMatch(app, /if \(error\?\.status === 403\) return t\("auth\.ownerOnly"\)/);
assert.match(html, /id="gnwaa-labs"/);
assert.match(app, /function applyLanguage\(/);
assert.match(html, /id="theme-toggle"/);
assert.match(html, /id="language-toggle"/);

function extractFunction(source, name, nextName) {
  const start = source.indexOf(`function ${name}(`);
  assert.notEqual(start, -1, `Expected function ${name} to exist.`);
  const end = source.indexOf(`\nasync function ${nextName}(`, start) >= 0
    ? source.indexOf(`\nasync function ${nextName}(`, start)
    : source.indexOf(`\nfunction ${nextName}(`, start);
  assert.notEqual(end, -1, `Expected function ${nextName} to follow ${name}.`);
  return source.slice(start, end);
}

const authInitialization = app.slice(
  app.indexOf("async function initializeAuthentication("),
  app.indexOf("\nasync function submitAuthentication(")
);
assert.match(authInitialization, /applyAuthSession\(result\.user\)[\s\S]*result\.user\?\.role === "owner"[\s\S]*isAdminPath\(\)[\s\S]*state\.currentPage === "content"[\s\S]*await loadAdminContent\(\)/,
  "Direct /admin#content visits must load CMS after owner authentication resolves.");
assert.match(app, /state\.currentPage = pageFromCurrentLocation\(\)[\s\S]*setActivePage\(state\.currentPage, false\)[\s\S]*void initializeAuthentication\(\)/,
  "The initial route, including public Discover deep links, must be set before authentication initialization completes.");

const canWriteFunction = app.match(/function contentEditorCanWrite\(role, loadStatus, busy\) \{[\s\S]*?\n\}/)?.[0];
assert.ok(canWriteFunction, "The CMS write gate must exist.");
const contentEditorCanWrite = new Function(`${canWriteFunction}; return contentEditorCanWrite;`)();
assert.equal(contentEditorCanWrite("owner", "loaded", false), true);
for (const [role, status, busy] of [
  ["owner", "idle", false],
  ["owner", "loading", false],
  ["owner", "error", false],
  ["owner", "loaded", true],
  ["member", "loaded", false],
  [null, "loaded", false]
]) {
  assert.equal(contentEditorCanWrite(role, status, busy), false,
    `CMS writes must be blocked for role=${role}, status=${status}, busy=${busy}.`);
}

const contentActions = extractFunction(app, "updateContentActionState", "loadAdminContent");
assert.match(contentActions, /loadingOrBusy = state\.contentLoadStatus === "loading" \|\| state\.contentBusy/);
assert.match(contentActions, /querySelectorAll\("button"\)[\s\S]*button\.disabled = !canWrite/,
  "Draft, publish, and delete controls must be disabled until loaded and idle.");
assert.match(contentActions, /querySelectorAll\("input, textarea"\)[\s\S]*field\.disabled = loadingOrBusy/);

const loadContent = extractFunction(app, "loadAdminContent", "renderContentEditor");
assert.match(loadContent, /contentLoadStatus = "loading"[\s\S]*updateContentActionState\(\)[\s\S]*await requestJson\("\/admin\/content"\)/,
  "The UI must enter its disabled loading state before the admin GET begins.");
assert.match(loadContent, /if \(!Array\.isArray\(result\.data\)\) throw[\s\S]*contentRecords = result\.data[\s\S]*contentLoadStatus = "loaded"/);
assert.match(loadContent, /catch[\s\S]*contentLoadStatus = "error"[\s\S]*t\("content\.loadFailed"\)/,
  "A failed GET must leave writes blocked and show a readable error.");
assert.match(loadContent, /contentLoadPromise\) return state\.contentLoadPromise/,
  "Repeated navigation or refresh must not start duplicate concurrent GET requests.");

const saveContent = extractFunction(app, "saveWebsiteContent", "deleteWebsiteContent");
assert.match(saveContent, /if \(!canEditContent\(\)\)[\s\S]*return/);
assert.equal((saveContent.match(/requestJson\("\/admin\/content\/bulk"/g) || []).length, 1,
  "Each Save as Draft or Publish action must issue exactly one bulk request.");
assert.match(saveContent, /body: \{ locale, status, home: withVersion\("home"\), about: withVersion\("about"\) \}/,
  "The bulk request must include both Home and About with their optimistic versions.");
assert.match(saveContent, /content_id: existing\?\.content_id \?\? null,[\s\S]*updated_at: existing\?\.updated_at \?\? null/,
  "Existing content must carry its current ID and timestamp; missing content must be created without a version.");
assert.doesNotMatch(saveContent, /requestJson\(`\/admin\/content\/\$\{existing\.content_id\}`|requestJson\("\/admin\/content", \{ method: "POST"/,
  "Bulk save must not send per-record POST or PATCH writes.");
assert.match(saveContent, /error\?\.status === 409[\s\S]*await loadAdminContent\(\)[\s\S]*t\("content\.conflictReloaded"\)/,
  "409 must reload current content for review without automatically retrying or overwriting.");
const conflictHandler = saveContent.slice(saveContent.indexOf('if (error?.status === 409)'), saveContent.indexOf("} else {", saveContent.indexOf('if (error?.status === 409)')));
assert.doesNotMatch(conflictHandler, /requestJson\(/,
  "Conflict recovery must not retry the write automatically.");

const deleteContent = extractFunction(app, "deleteWebsiteContent", "getFilteredCustomers");
assert.match(deleteContent, /if \(!canEditContent\(\)\)[\s\S]*return/);

const refreshContent = extractFunction(app, "refreshCurrentPage", "escapeHtml");
assert.match(refreshContent, /state\.currentPage === "content"[\s\S]*return loadAdminContent\(\)/);
assert.match(app, /el\.refreshButton\.addEventListener\("click", refreshCurrentPage\)/,
  "Refresh must reload CMS data while the Content Editor is open.");
assert.match(app, /function render\(\)[\s\S]*updateContentActionState\(\)/,
  "General renders must preserve CMS loading and write-disabled state.");

const pageNavigation = extractFunction(app, "setActivePage", "refreshCustomers");
assert.match(pageNavigation, /if \(page === "discover"\)[\s\S]*pushState\(\{\}, "", "\/discover"\)[\s\S]*else if \(adminPages\.has\(page\) && !isAdminPath\(\)\)[\s\S]*pushState[\s\S]*resolveDiscoverRoute\(normalizedPath\(\)\)/,
  "Discover and admin navigation, including returns to public pages, must use in-app history transitions.");
assert.match(pageNavigation, /if \(page === "lab"\)[\s\S]*normalizedPath\(\) !== "\/lab"[\s\S]*window\.history\[updateUrl \? "pushState" : "replaceState"\][\s\S]*"\/lab"/,
  "The Laboratory should use a dedicated history path and replace legacy hash deep links.");
assert.match(pageNavigation, /resolveDiscoverRoute\(normalizedPath\(\)\) \|\| \["\/lab", "\/about", "\/login"\]\.includes\(normalizedPath\(\)\)/,
  "Returning from the Laboratory to Home or About should leave the standalone route cleanly.");
assert.ok(vercel.rewrites.some((rewrite) => rewrite.source === "/lab" && rewrite.destination === "/"),
  "Vercel must serve the app shell when /lab is opened directly or refreshed.");

const navRoutes = [...html.matchAll(/<a class="nav-item"[^>]*data-page-link="([^"]+)"/g)].map((match) => match[1]);
assert.equal(navRoutes.indexOf("lab"), navRoutes.indexOf("about") + 1,
  "The Laboratory link should follow About in the sidebar.");
assert.equal(navRoutes.indexOf("analytics"), navRoutes.indexOf("lab") + 1,
  "The Laboratory link should precede Analytics in the sidebar.");
assert.match(html, /href="\/lab" data-page-link="lab"[^>]*data-i18n-aria="nav\.lab"/);
assert.match(html, /<h1[^>]*id="page-title"/,
  "Public page views should share the page-level H1 so only the active route is visible.");
assert.equal((html.match(/data-page-view="lab"/g) || []).length, 1,
  "The Laboratory content should exist as one independent page view.");
const labHubMarkup = html.match(/<div class="about-labs-grid" id="about-labs-hub">([\s\S]*?)<\/div>/);
assert.ok(labHubMarkup, "The standalone Laboratory hub should remain in the markup.");
assert.equal((labHubMarkup[1].match(/data-lab-open="(?:universe|detective|personality)"/g) || []).length, 3,
  "All three existing interactive launch controls must remain on the Laboratory page.");
const labLanguage = extractFunction(app, "applyLabLanguage", "showLabTool");
assert.match(labLanguage, /data-lab-mn[\s\S]*data-lab-en/,
  "The existing lab content should continue to use the shared Mongolian/English language switch.");
assert.match(app, /applyLabLanguage\(\)/,
  "Language changes should continue refreshing the Laboratory labels.");
assert.match(app, /window\.addEventListener\("popstate", syncPageFromLocation\)/);
assert.match(app, /link\.closest\("\.side-nav"\)[\s\S]*setMobileNavOpen\(false/,
  "Selecting the new route from the mobile sidebar should close the drawer.");

const pageFromLocation = extractFunction(app, "pageFromCurrentLocation", "setActivePage");
const runPageFromLocation = new Function(
  "window", "normalizedPath", "resolveDiscoverRoute", "state", "PAGE_COPY", "rememberDiscoverArticle",
  `${pageFromLocation}; return pageFromCurrentLocation;`
);
const publicRouteCases = [
  ["/", "", "home"],
  ["/projects", "", "projects"],
  ["/projects/gnwaa", "", "projectCase"],
  ["/projects/randomizer", "", "randomizerCase"],
  ["/playground", "", "playground"],
  ["/discover", "", "discover"],
  ["/lab", "", "lab"],
  ["/about", "", "about"],
  ["/randomizer", "", "randomizer"],
  ["/randomizer/movie", "", "randomizer"],
  ["/randomizer/food", "", "randomizer"]
];
for (const [path, hash, expectedPage] of publicRouteCases) {
  const routeState = { discoverSlug: null };
  const resolvePublicPage = runPageFromLocation(
    { location: { hash } }, () => path,
    (candidate) => candidate === "/discover" ? { slug: null } : null,
    routeState, { home: true, about: true, lab: true, discover: true }, () => {}
  );
  assert.equal(resolvePublicPage(), expectedPage, `Anonymous public route ${path} should resolve to ${expectedPage}.`);
}
const resolvePage = runPageFromLocation(
  { location: { hash: "" } }, () => "/lab", () => null, { discoverSlug: null }, { home: true, about: true, lab: true }, () => {}
);
assert.equal(resolvePage(), "lab", "A direct /lab URL should resolve to the Laboratory page.");
const resolveLegacyHash = runPageFromLocation(
  { location: { hash: "#gnwaa-labs" } }, () => "/", () => null, { discoverSlug: null }, { home: true, about: true, lab: true }, () => {}
);
assert.equal(resolveLegacyHash(), "lab", "The former #gnwaa-labs deep link should resolve to the new page.");
const resolveLabHash = runPageFromLocation(
  { location: { hash: "#lab" } }, () => "/", () => null, { discoverSlug: null }, { home: true, about: true, lab: true }, () => {}
);
assert.equal(resolveLabHash(), "lab", "The #lab compatibility route should resolve to the Laboratory page.");
const resolveCustomerAdminRoute = runPageFromLocation(
  { location: { hash: "#customers" } }, () => "/admin", () => null, { discoverSlug: null },
  { home: true, about: true, lab: true, discover: true, customers: true }, () => {}
);
assert.equal(resolveCustomerAdminRoute(), "customers", "A CRM deep link must resolve to the owner-protected customer view.");

const authViewSource = extractFunction(app, "updateAuthenticatedView", "authErrorText");
function runAuthView(pathname, hash = "", authStatus = "anonymous", user = null) {
  let path = pathname;
  let routeHash = hash;
  const replacements = [];
  const state = { user, authStatus, authError: "" };
  const application = { inert: false, setAttribute(name, value) { this[name] = value; } };
  const el = {
    authGate: { hidden: true },
    authSessionCheck: { hidden: true },
    authForm: { hidden: false }
  };
  const fakeWindow = {
    location: {
      get pathname() { return path; },
      get hash() { return routeHash; }
    },
    history: {
      replaceState(_state, _title, url) {
        replacements.push(url);
        const [nextPath, nextHash = ""] = url.split("#");
        path = nextPath || "/";
        routeHash = nextHash ? `#${nextHash}` : "";
      }
    }
  };
  const update = new Function(
    "state", "el", "document", "window", "isAdminPath", "normalizedPath", "t", "updateProfileMenu", "renderAuthForm",
    `${authViewSource}; return updateAuthenticatedView;`
  )(
    state, el, { querySelector: () => application }, fakeWindow,
    () => path === "/admin", () => path.replace(/\/+$/, "") || "/", (key) => key, () => {}, () => {}
  );
  update();
  return { path, hash: routeHash, replacements, state, el, application };
}

for (const [path] of publicRouteCases) {
  const result = runAuthView(path, "", "error");
  assert.deepEqual(result.replacements, [], `Public route ${path} must not redirect when the auth API is unavailable.`);
  assert.equal(result.el.authGate.hidden, true, `Public route ${path} must stay visible to anonymous visitors.`);
  assert.equal(result.application.inert, false, `Public route ${path} must not be made inert by an auth API error.`);
}
const anonymousAdmin = runAuthView("/admin", "#customers", "anonymous");
assert.deepEqual(anonymousAdmin.replacements, ["/login#customers"], "Anonymous admin and CRM routes should redirect to Login and preserve the requested section.");
assert.equal(anonymousAdmin.el.authGate.hidden, false, "The protected route should show the login gate to anonymous users.");
assert.equal(anonymousAdmin.application.inert, true, "Protected content must remain inert until an owner session exists.");
const directLogin = runAuthView("/login", "", "anonymous");
assert.deepEqual(directLogin.replacements, [], "Explicitly opening Login should show the login page without another redirect.");
assert.equal(directLogin.el.authGate.hidden, false);
const unavailableAdmin = runAuthView("/admin", "#customers", "error");
assert.equal(unavailableAdmin.el.authGate.hidden, false, "Protected routes must fail closed when session validation is unavailable.");
assert.equal(unavailableAdmin.application.inert, true);
const ownerAdmin = runAuthView("/admin", "#home", "authenticated", { role: "owner" });
assert.equal(ownerAdmin.el.authGate.hidden, true, "A validated owner session should open the Admin Dashboard.");
assert.equal(ownerAdmin.application.inert, false);
const ownerLogin = runAuthView("/login", "", "authenticated", { role: "owner" });
assert.deepEqual(ownerLogin.replacements, ["/admin#home"], "An already-authenticated owner opening Login should return to the dashboard.");

assert.match(html, /<a class="nav-item" href="\/login" data-login-only hidden[^>]*[\s\S]*data-i18n="nav\.login"/,
  "The public sidebar should include a Login entry that can be hidden after owner authentication.");
assert.match(html, /id="login-link" href="\/login"/, "The header Login control should stay available to guests.");
assert.match(app, /\[data-login-only\]"\)\.forEach\(\(node\) => \{ node\.hidden = isOwner; \}\)/,
  "Login navigation should be visible to guests and hidden for owners.");
assert.equal([...html.matchAll(/<[^>]+data-admin-only[^>]*>/g)].filter(([markup]) => !/\shidden(?:\s|>)/.test(markup)).length, 0,
  "Owner-only markup must start hidden before session validation finishes.");
assert.match(app, /data-admin-only hidden[\s\S]*data-admin-only hidden/,
  "Dynamically inserted content navigation and CMS editor must also start hidden.");

const activePageSource = extractFunction(app, "setActivePage", "refreshCustomers");
let activePath = "/";
let activeHash = "#about";
const navigationHistory = [];
const navigationWindow = {
  location: {
    get pathname() { return activePath; },
    get hash() { return activeHash; }
  },
  history: {
    pushState(_state, _title, url) {
      navigationHistory.push(["push", url]);
      const [path, hash = ""] = url.split("#");
      activePath = path || "/";
      activeHash = hash ? `#${hash}` : "";
    },
    replaceState(_state, _title, url) {
      navigationHistory.push(["replace", url]);
      const [path, hash = ""] = url.split("#");
      activePath = path || "/";
      activeHash = hash ? `#${hash}` : "";
    }
  }
};
const navigationState = { currentPage: "about", user: null, discoverSlug: null };
let labHubResets = 0;
const runSetActivePage = new Function(
  "PAGE_COPY", "el", "setProfileMenuOpen", "window", "normalizedPath", "isAdminPath",
  "resolveDiscoverRoute", "state", "showLabTool", "updatePageCopy", "updateAuthenticatedView",
  "loadCustomers", "loadAdminContent",
  `${activePageSource}; return setActivePage;`
)(
  { about: {}, lab: {}, home: {}, projects: {}, projectCase: {}, randomizerCase: {}, playground: {}, discover: {}, randomizer: {}, customers: {}, analytics: {}, settings: {}, content: {} },
  { profileDropdown: { hidden: true } }, () => {}, navigationWindow, () => activePath,
  () => false, () => null, navigationState, () => { labHubResets += 1; }, () => {}, () => {}, () => {}, () => {}
);
runSetActivePage("lab");
assert.deepEqual(navigationHistory, [["push", "/lab"]], "Opening Laboratory should add one /lab browser-history entry.");
activePath = "/";
activeHash = "#about";
runSetActivePage(resolvePageFrom(navigationWindow, activePath, activeHash), false);
assert.equal(navigationState.currentPage, "about", "Browser Back should restore the prior public page.");
activePath = "/lab";
activeHash = "";
runSetActivePage(resolvePageFrom(navigationWindow, activePath, activeHash), false);
assert.equal(navigationState.currentPage, "lab", "Browser Forward should restore the Laboratory page.");
assert.equal(labHubResets, 2, "Entering the Lab view should show its launcher without resetting feature data.");
runSetActivePage("randomizerMovie");
assert.equal(activePath, "/randomizer/movie");
assert.equal(activeHash, "");
assert.equal(navigationState.currentPage, "randomizer");
runSetActivePage("randomizerFood");
assert.equal(activePath, "/randomizer/food");
runSetActivePage("home");
assert.equal(activePath, "/", "Leaving a nested Randomizer route must not strand Home under that URL.");
assert.equal(activeHash, "");
activePath = "/randomizer/movie";
activeHash = "";
runSetActivePage("randomizer", false);
assert.equal(activePath, "/randomizer/movie", "Back/Forward resolution preserves the nested Randomizer URL.");
assert.equal(navigationState.currentPage, "randomizer");

function resolvePageFrom(windowObject, pathname, hash) {
  activePath = pathname;
  activeHash = hash;
  const resolver = runPageFromLocation(
    windowObject, () => activePath, () => null, navigationState,
    { home: true, about: true, lab: true }, () => {}
  );
  return resolver();
}

assert.match(html, /id="top-avatar"[^>]*type="button"[^>]*aria-haspopup="menu"[^>]*aria-expanded="false"[^>]*aria-controls="profile-dropdown"/);
assert.match(html, /id="profile-dropdown"[^>]*role="menu"[^>]*hidden/);
assert.match(html, /id="mobile-nav-toggle"[^>]*aria-expanded="false"[^>]*aria-controls="sidebar"/,
  "Mobile navigation must have an accessible toggle controlling the sidebar.");
assert.match(html, /id="mobile-nav-backdrop"[^>]*type="button"[^>]*hidden/,
  "The mobile drawer must have a keyboard-accessible close backdrop.");
for (const id of ["profile-menu-name", "profile-menu-email", "profile-menu-role", "profile-login", "profile-settings-link", "profile-admin-link", "profile-logout"]) {
  assert.match(html, new RegExp(`id="${id}"`), `Profile menu must include ${id}.`);
}
const profileMenuUpdater = extractFunction(app, "updateProfileMenu", "profileMenuItems");
assert.match(profileMenuUpdater, /state\.user[\s\S]*profileMenuEmail\.textContent = user\.email[\s\S]*profileMenuRole\.textContent = t\(owner \? "profile\.owner" : "profile\.member"\)/,
  "Profile information must come from the /me user object, not hardcoded account data.");
assert.match(profileMenuUpdater, /profileSettingsLink\.hidden = !owner[\s\S]*profileAdminLink\.hidden = !owner/,
  "Admin and settings menu items must remain owner-only in the UI.");
const menuOpen = extractFunction(app, "setProfileMenuOpen", "navigateToAdminDashboard");
assert.match(menuOpen, /aria-expanded.*String\(open\)[\s\S]*profileMenuItems\(\)\[0\]\?\.focus\(\)[\s\S]*el\.topAvatar\.focus\(\)/,
  "Opening and closing the menu must update ARIA state and manage focus.");
assert.match(app, /profileDropdownWrap\.contains\(event\.target\)[\s\S]*setProfileMenuOpen\(false, \{ restoreFocus: false \}\)/,
  "Clicking outside the menu must close it.");
assert.match(app, /event\.key === "Escape"[\s\S]*setProfileMenuOpen\(false\)/);
assert.match(app, /event\.key === "ArrowDown"[\s\S]*event\.key === "ArrowUp"[\s\S]*profileMenuItems\(\)/,
  "The profile menu must support keyboard navigation.");
assert.match(css, /#login-link\.utility-button[^\n]*min-width:[^;]+;[^\n]*white-space: nowrap/);
assert.match(css, /\.topbar-right[^\n]*align-items: center/);
assert.match(css, /\.profile-dropdown \{[^}]*right: 0;[^}]*width: min\(/);
assert.match(css, /@media \(max-width: 600px\)[\s\S]*\.topbar-right/);
assert.match(css, /@media \(max-width: 380px\)[\s\S]*#login-link, #sign-out-button/,
  "Very narrow screens should keep the action controls reachable in the profile menu without overlap.");
assert.match(app, /function setMobileNavOpen\(open[\s\S]*aria-expanded[\s\S]*el\.mobileNavBackdrop\.hidden = !open[\s\S]*el\.mainShell\.inert = open/);
assert.match(app, /mobileNavBackdrop\.addEventListener\("click"[\s\S]*setMobileNavOpen\(false, \{ restoreFocus: true \}\)/);
assert.match(app, /event\.key === "Escape" && el\.sidebar\.classList\.contains\("is-mobile-open"\)[\s\S]*setMobileNavOpen\(false, \{ restoreFocus: true \}\)/);
assert.match(css, /--page: #080c18;[\s\S]*--brand-gradient: linear-gradient\(135deg, #7856ff, #37b6ff\)/,
  "Aurora design tokens must define the requested dark base and purple-blue accent.");
assert.match(css, /:root:not\(\[data-theme="light"\]\) \{[\s\S]*--page: #080c18;[\s\S]*--brand-gradient: linear-gradient\(135deg, #7856ff, #37b6ff\)/,
  "The dark token override must outrank the existing GNWAA cyber palette.");
assert.match(css, /@media \(max-width: 780px\)[\s\S]*\.sidebar\.is-mobile-open[\s\S]*@media \(max-width: 600px\)[\s\S]*@media \(max-width: 400px\)/,
  "Responsive navigation and layouts must cover mobile, tablet, and compact phone breakpoints.");
assert.match(css, /@media \(prefers-reduced-motion: reduce\)[\s\S]*\.sidebar \{ transition: none/,
  "Aurora motion must respect the user's reduced-motion preference.");

const adminNavigation = extractFunction(app, "navigateToAdminDashboard", "renderAuthForm");
assert.match(adminNavigation, /await requestJson\("\/auth\/me"\)[\s\S]*result\.user\?\.role !== "owner"[\s\S]*pushState\(\{\}, "", "\/admin#home"\)/,
  "Admin navigation must recheck the server session and owner role before entering.");
assert.match(adminNavigation, /error\?\.status === 401[\s\S]*pushState\(\{\}, "", "\/login"\)/,
  "An expired or anonymous session must be sent to Login.");
assert.match(api, /response\.status === 401 && path\.startsWith\("\/admin\/"\)[\s\S]*dispatchEvent\(new Event\("gnwaa:session-expired"\)\)/,
  "Protected API 401 responses must notify the UI about session expiry.");
const logout = extractFunction(app, "signOut", "readPreference");
assert.match(logout, /await requestJson\("\/auth\/logout", \{ method: "POST" \}\)[\s\S]*resetCsrfToken\(\)[\s\S]*applyAuthSession\(null\)/,
  "Logout must use the CSRF-protected server endpoint before clearing local identity.");
assert.match(logout, /const destinationPage = isAdminPath\(\) \? "home" : pageFromCurrentLocation\(\)[\s\S]*setActivePage\(destinationPage, false\)/,
  "Logout should return admins to public Home and leave an owner on their current public route.");
assert.match(logout, /catch \(error\)[\s\S]*showToast[\s\S]*finally/,
  "A failed server logout must report an error and keep the identity until logout succeeds.");
assert.match(html, /id="auth-session-check"[^>]*role="status"/,
  "Admin route session checks should show an accessible in-page status indicator.");

const themePresets = [
  ["aurora-purple", "#7856FF", "#37B6FF"],
  ["ocean-night", "#0891B2", "#22D3EE"],
  ["emerald-matrix", "#10B981", "#34D399"],
  ["sunset-neon", "#F97316", "#EC4899"],
  ["moonlight", "#A5B4FC", "#818CF8"]
];
assert.match(html, /id="theme-studio-dialog"[^>]*aria-labelledby="theme-studio-title"/,
  "Theme Studio must be a labelled native dialog.");
assert.match(html, /id="theme-studio-toggle"[^>]*aria-expanded="false"[^>]*aria-controls="theme-studio-dialog"/,
  "The Theme Studio trigger must expose its dialog state.");
assert.equal((html.match(/data-theme-preset="[a-z-]+"/g) || []).length, themePresets.length,
  "The Theme Studio must offer exactly five presets.");
for (const [id, accent, secondary] of themePresets) {
  assert.match(app, new RegExp(`id: "${id}", name: "[^"]+", accent: "${accent}", secondary: "${secondary}"`),
    `${id} must use the specified palette colors.`);
  assert.match(html, new RegExp(`data-theme-preset="${id}"`));
}
assert.match(html, /gnwaa-aurora-accent-v1/);
assert.match(html, /localStorage\.getItem\("gnwaa-aurora-accent-v1"\)[\s\S]*localStorage\.getItem\("ganbat-customer-theme"\)[\s\S]*catch/,
  "Stored palettes and light/dark mode must apply before the stylesheet to reduce color flash and tolerate blocked storage.");
const accentApply = extractFunction(app, "applyAccentTheme", "openThemeStudio");
assert.match(accentApply, /document\.documentElement\.dataset\.accentTheme = preset\.id[\s\S]*if \(persist\) writePreference\(ACCENT_THEME_KEY, preset\.id\)/,
  "Accent selection must apply globally and persist only when requested.");
const studioClose = extractFunction(app, "closeThemeStudio", "toggleAppearance");
assert.match(studioClose, /resolveThemeStudioAction\([\s\S]*applyAccentTheme\(nextTheme, false\)[\s\S]*writePreference\(ACCENT_THEME_KEY, nextTheme\)/,
  "Apply commits a preview and Cancel/Escape restores the opening palette.");
assert.match(app, /themeStudioReset\.addEventListener\("click", \(\) => \{[\s\S]*resolveThemeStudioAction\("reset"[\s\S]*closeThemeStudio\(\{ apply: true \}\)/,
  "Reset to Default must commit the default palette and close the Studio.");
const themeActionSource = extractFunction(app, "resolveThemeStudioAction", "writePreference");
const resolveThemeStudioAction = new Function("ACCENT_THEME_IDS", `${themeActionSource}; return resolveThemeStudioAction;`)(themePresets.map(([id]) => id));
assert.equal(resolveThemeStudioAction("preview", "ocean-night", "aurora-purple"), "ocean-night");
assert.equal(resolveThemeStudioAction("apply", "emerald-matrix", "aurora-purple"), "emerald-matrix");
assert.equal(resolveThemeStudioAction("cancel", "sunset-neon", "ocean-night"), "ocean-night",
  "Cancel must roll back a live preview to the palette active when the Studio opened.");
assert.equal(resolveThemeStudioAction("reset", "sunset-neon", "ocean-night"), "aurora-purple",
  "Reset must choose the default palette.");
assert.equal(resolveThemeStudioAction("apply", "unknown-theme", "ocean-night"), "aurora-purple",
  "An invalid preset must safely fall back to Aurora Purple.");

const readPreferenceSource = extractFunction(app, "readPreference", "resolveThemeStudioAction");
const safeReadPreference = new Function("localStorage", `${readPreferenceSource}; return readPreference;`);
assert.equal(safeReadPreference({ getItem: () => "ocean-night" })("accent", themePresets.map(([id]) => id), "aurora-purple"), "ocean-night");
assert.equal(safeReadPreference({ getItem: () => "not-a-theme" })("accent", themePresets.map(([id]) => id), "aurora-purple"), "aurora-purple");
assert.equal(safeReadPreference({ getItem: () => { throw new Error("storage unavailable"); } })("accent", themePresets.map(([id]) => id), "aurora-purple"), "aurora-purple");
const writePreferenceSource = extractFunction(app, "writePreference", "renderThemeStudioSelection");
const safeWritePreference = new Function("localStorage", `${writePreferenceSource}; return writePreference;`);
const storedValues = new Map();
safeWritePreference({ setItem: (key, value) => storedValues.set(key, value) })("accent", "moonlight");
assert.equal(storedValues.get("accent"), "moonlight", "Theme selection should persist when storage is available.");
assert.doesNotThrow(() => safeWritePreference({ setItem: () => { throw new Error("storage unavailable"); } })("accent", "moonlight"));

const applyThemeSource = extractFunction(app, "applyTheme", "applyLanguage");
const appearanceState = { theme: "dark" };
const appearanceData = { accentTheme: "ocean-night" };
const appearanceWrites = [];
const appearanceToggle = { setAttribute(name, value) { this[name] = value; } };
const appearanceDocument = { documentElement: { dataset: appearanceData }, querySelector: () => ({ content: "" }) };
const runApplyTheme = new Function("state", "document", "el", "t", "writePreference", "THEME_KEY", `${applyThemeSource}; return applyTheme;`)(
  appearanceState, appearanceDocument, { themeToggle: appearanceToggle }, (key) => key,
  (key, value) => appearanceWrites.push([key, value]), "appearance-key"
);
runApplyTheme("light");
assert.equal(appearanceData.theme, "light");
assert.equal(appearanceData.accentTheme, "ocean-night", "Changing Light/Dark mode must preserve the selected accent palette.");
assert.deepEqual(appearanceWrites, [["appearance-key", "light"]], "Appearance and accent preferences must use separate storage writes.");

const accentApplySource = extractFunction(app, "applyAccentTheme", "openThemeStudio");
const accentState = { accentTheme: "aurora-purple" };
const accentDataset = {};
const accentWrites = [];
const runApplyAccentTheme = new Function("state", "document", "ACCENT_THEMES", "ACCENT_THEME_KEY", "writePreference", "renderThemeStudioSelection", `${accentApplySource}; return applyAccentTheme;`)(
  accentState, { documentElement: { dataset: accentDataset } },
  themePresets.map(([id, accent, secondary]) => ({ id, accent, secondary })), "accent-key",
  (key, value) => accentWrites.push([key, value]), () => {}
);
runApplyAccentTheme("sunset-neon", false);
assert.equal(accentDataset.accentTheme, "sunset-neon");
assert.equal(accentWrites.length, 0, "Previewing must not save before Apply.");
runApplyAccentTheme("moonlight", true);
assert.deepEqual(accentWrites.at(-1), ["accent-key", "moonlight"], "An explicit palette apply should persist the choice.");
const closeThemeStudioSource = extractFunction(app, "closeThemeStudio", "toggleAppearance");
const studioState = { accentTheme: "sunset-neon", themeStudioStart: "ocean-night" };
const studioWrites = [];
const studioDialog = { open: true, close() { this.open = false; } };
const studioTrigger = { setAttribute(name, value) { this[name] = value; }, focus() { this.focused = true; } };
const runCloseThemeStudio = new Function("state", "ACCENT_THEME_IDS", "ACCENT_THEMES", "ACCENT_THEME_KEY", "resolveThemeStudioAction", "applyAccentTheme", "writePreference", "showToast", "t", "el", `${closeThemeStudioSource}; return closeThemeStudio;`)(
  studioState, themePresets.map(([id]) => id), themePresets.map(([id]) => ({ id, name: id })), "accent-key", resolveThemeStudioAction,
  (id) => { studioState.accentTheme = id; }, (key, value) => studioWrites.push([key, value]), () => {}, (key) => key,
  { themeStudioToggle: studioTrigger, themeStudioDialog: studioDialog }
);
runCloseThemeStudio();
assert.equal(studioState.accentTheme, "ocean-night");
assert.equal(studioWrites.length, 0, "Cancel/Escape should not save the temporary preview.");
assert.equal(studioDialog.open, false);
assert.equal(studioTrigger.focused, true, "Closing the Studio should restore focus to its trigger.");
studioState.themeStudioStart = "ocean-night";
studioState.accentTheme = "emerald-matrix";
studioDialog.open = true;
runCloseThemeStudio({ apply: true });
assert.deepEqual(studioWrites, [["accent-key", "emerald-matrix"]], "Apply should save the selected palette.");
assert.equal(studioState.themeStudioStart, null);
assert.match(app, /themeStudioDialog\.addEventListener\("keydown"[\s\S]*event\.key !== "Tab"[\s\S]*first\?\.focus\(\)/,
  "Theme Studio keyboard focus must remain in the dialog.");
assert.match(app, /themeStudioDialog\.addEventListener\("cancel"[\s\S]*event\.preventDefault\(\)[\s\S]*closeThemeStudio\(\)/,
  "Escape must restore the saved palette and close the dialog.");
assert.match(app, /themeToggle\.addEventListener\("click", \(\) => applyTheme\(state\.theme === "dark" \? "light" : "dark"\)\)/);
assert.match(app, /document\.querySelector\("#footer-theme-toggle"\)\.addEventListener\("click", toggleAppearance\)/);
assert.match(app, /function applyTheme\([\s\S]*writePreference\(THEME_KEY, state\.theme\)/,
  "Light/dark appearance must continue using its separate preference key.");
assert.match(css, /:root\[data-accent-theme="ocean-night"\][\s\S]*--accent: #0891b2/);
assert.match(css, /:root\[data-theme="light"\]\[data-accent-theme="moonlight"\]/,
  "Light mode must define readable accent mappings independently from the preset.");
assert.match(css, /--brand-gradient: linear-gradient\(135deg, var\(--accent\), var\(--accent-secondary\)\)/);
assert.match(css, /@media \(prefers-reduced-motion: reduce\)[\s\S]*\.theme-preset-card:hover \{ transform: none/);

const sidebarCollapse = extractFunction(app, "setSidebarCollapsed", "mobileDrawerFocusables");
assert.match(sidebarCollapse, /aria-expanded[\s\S]*writePreference\(SIDEBAR_KEY, collapsed \? "collapsed" : "expanded"\)/,
  "Desktop collapsed state must be accessible and persisted locally.");
assert.match(app, /setSidebarCollapsed\(readPreference\(SIDEBAR_KEY, \["expanded", "collapsed"\], "expanded"\) === "collapsed", false\)/);
assert.match(app, /function mobileDrawerFocusables\([\s\S]*getClientRects\(\)\.length > 0/);
assert.match(app, /el\.sidebar\.classList\.contains\("is-mobile-open"\) && event\.key === "Tab"[\s\S]*last\.focus\(\)[\s\S]*first\.focus\(\)/,
  "Tab and Shift+Tab should stay within the open mobile drawer.");
assert.match(app, /mobileNavReturnFocus = document\.activeElement[\s\S]*restoreFocus && returnFocus\?\.isConnected/);
assert.match(app, /if \(usesCompactNavigation\(\) && el\.sidebar\.classList\.contains\("is-mobile-open"\)\)[\s\S]*setMobileNavOpen\(false, \{ restoreFocus: true \}\)/,
  "The mobile sidebar control closes the drawer and returns focus.");

assert.doesNotMatch(html, /footer-navigation[\s\S]*Contact|mailto:/i,
  "Footer must not invent a contact link.");
assert.match(app, /footerYear\.textContent = String\(new Date\(\)\.getFullYear\(\)\)/,
  "Footer copyright must use the current year.");

process.stdout.write(`Static markup, CMS security, owner appearance, routing, navigation, and profile-menu checks passed (${idSet.size} unique IDs; creator avatar ${creatorAvatarWidth}x${creatorAvatarHeight}).\n`);

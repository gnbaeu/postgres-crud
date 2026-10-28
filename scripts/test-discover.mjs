import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  DISCOVER_ARTICLES,
  DISCOVER_CATEGORIES,
  FEATURED_ARTICLE_SLUG,
  getDiscoverArticle,
  getDiscoverCopy,
  resolveDiscoverRoute,
  selectSurpriseArticle
} from "../discover/articles.js";

const html = await readFile(new URL("../index.html", import.meta.url), "utf8");
const app = await readFile(new URL("../app.js", import.meta.url), "utf8");
const styles = await readFile(new URL("../style.css", import.meta.url), "utf8");
const vercel = JSON.parse(await readFile(new URL("../vercel.json", import.meta.url), "utf8"));

assert.equal(DISCOVER_ARTICLES.length, 9, "Discover must start with nine sample articles.");
assert.equal(DISCOVER_CATEGORIES.length, 3, "Discover must have three categories.");
assert.equal(new Set(DISCOVER_ARTICLES.map((article) => article.slug)).size, 9, "Article slugs must be unique.");
assert.ok(getDiscoverArticle(FEATURED_ARTICLE_SLUG), "The featured article must exist in the catalog.");

for (const category of DISCOVER_CATEGORIES) {
  assert.equal(DISCOVER_ARTICLES.filter((article) => article.category === category.id).length, 3,
    `Category ${category.id} must contain three articles.`);
  assert.ok(category.label.mn && category.label.en, `Category ${category.id} needs both labels.`);
}

for (const article of DISCOVER_ARTICLES) {
  assert.match(article.publishedAt, /^\d{4}-\d{2}-\d{2}$/u, `${article.slug} needs a publication date.`);
  assert.ok(article.source?.title, `${article.slug} needs a named source.`);
  assert.match(article.source.url, /^https:\/\//iu, `${article.slug} must link to an HTTPS source.`);
  assert.equal(article.status, "published", `${article.slug} is frontend public content and must be explicitly published.`);
  for (const locale of ["mn", "en"]) {
    const copy = getDiscoverCopy(article, locale);
    assert.ok(copy?.title && copy.summary && copy.sections?.length, `${article.slug} needs ${locale} copy.`);
    assert.ok(copy.sections.every((section) => section.heading), `${article.slug} has a section without a heading.`);
  }
}

function countBodyWords(copy) {
  return copy.sections.flatMap((section) => section.paragraphs || []).join(" ").trim().split(/\s+/u).filter(Boolean).length;
}

for (const article of DISCOVER_ARTICLES.filter((item) => item.category === "minute")) {
  for (const locale of ["mn", "en"]) {
    const count = countBodyWords(getDiscoverCopy(article, locale));
    assert.ok(count >= 100 && count <= 200, `${article.slug} ${locale} body should be 100–200 words; got ${count}.`);
  }
}

for (const article of DISCOVER_ARTICLES.filter((item) => item.category === "digital")) {
  for (const locale of ["mn", "en"]) {
    const sections = getDiscoverCopy(article, locale).sections;
    assert.ok(sections.length >= 3, `${article.slug} ${locale} should explain the issue, give an example, and offer safety advice.`);
    const advice = sections.find((section) => Array.isArray(section.items));
    assert.ok(advice?.items.length >= 3 && advice.items.length <= 5, `${article.slug} ${locale} must give 3–5 protective tips.`);
  }
}

assert.deepEqual(resolveDiscoverRoute("/discover"), { page: "discover", slug: null });
assert.deepEqual(resolveDiscoverRoute("/discover/why-airplanes-fly/"), { page: "discover", slug: "why-airplanes-fly" });
assert.deepEqual(resolveDiscoverRoute("/about"), null);
assert.equal(getDiscoverCopy({ content: { mn: { title: "Монгол" } } }, "en"), null,
  "Missing translations must be represented as unavailable, not silently translated.");

assert.equal(selectSurpriseArticle(DISCOVER_ARTICLES, "mn", [], null, () => 0)?.slug, DISCOVER_ARTICLES[0].slug,
  "A deterministic random value at the start of the range should select an eligible article.");
assert.equal(selectSurpriseArticle(DISCOVER_ARTICLES, "en", [], null, () => 0.999999)?.slug, DISCOVER_ARTICLES.at(-1).slug,
  "Every eligible article should be reachable through the random range.");
const recentlyViewed = DISCOVER_ARTICLES.slice(0, 3).map((article) => article.slug);
const surpriseAfterHistory = selectSurpriseArticle(DISCOVER_ARTICLES, "mn", recentlyViewed, recentlyViewed[2], () => 0);
assert.ok(surpriseAfterHistory && !recentlyViewed.includes(surpriseAfterHistory.slug),
  "Surprise selection should avoid the three most recently viewed articles when alternatives exist.");
const draftOnly = [{ ...DISCOVER_ARTICLES[0], slug: "draft-only", status: "draft" }];
assert.equal(selectSurpriseArticle(draftOnly, "mn"), null, "Drafts must never be selected.");
const englishUnavailable = [{ ...DISCOVER_ARTICLES[0], slug: "mn-only", content: { mn: DISCOVER_ARTICLES[0].content.mn } }];
assert.equal(selectSurpriseArticle(englishUnavailable, "en"), null, "Articles without the selected language must be excluded.");
assert.equal(selectSurpriseArticle([], "mn"), null, "An empty public catalog should return an empty result safely.");

assert.match(html, /href="\/discover"[^>]*data-page-link="discover"/u, "Discover must be in the public navigation.");
assert.match(html, /id="discover-search" type="search"/u, "Discover needs an accessible title-search control.");
assert.match(html, /id="discover-surprise" type="button"/u, "The Discover hero needs a keyboard-accessible Surprise Me button.");
assert.match(html, /id="discover-another-surprise" type="button"/u, "Article details need Another Surprise.");
assert.match(html, /id="discover-surprise-status"[^>]*role="status"[^>]*aria-live="polite"/u,
  "An empty random selection needs an accessible status message.");
for (const category of DISCOVER_CATEGORIES) {
  assert.match(html, new RegExp(`data-discover-category="${category.id}"`, "u"), `Missing filter for ${category.id}.`);
}
assert.match(html, /id="discover-reading-progress"[^>]*role="progressbar"/u, "Article details need a reading progress indicator.");
assert.match(html, /id="discover-related-grid"/u, "Article details need related articles.");
assert.match(app, /function pageFromCurrentLocation\(\)[\s\S]*resolveDiscoverRoute\(normalizedPath\(\)\)/u,
  "The SPA must resolve /discover and /discover/:slug routes.");
assert.match(app, /function rememberDiscoverArticle\(slug\)[\s\S]*slice\(0, 3\)[\s\S]*sessionStorage/u,
  "The last three viewed published articles should be remembered for this browser tab session.");
assert.match(app, /function surpriseMe\(\)[\s\S]*selectSurpriseArticle\([\s\S]*state\.language[\s\S]*state\.discoverRecentSlugs[\s\S]*state\.discoverSlug/u,
  "Surprise Me must respect locale, recent views, and the current article.");
assert.match(app, /function openDiscoverArticle\(slug\)[\s\S]*pushState\(\{\}, "", `\/discover\/\$\{encodeURIComponent\(article\.slug\)\}`\)[\s\S]*setActivePage\("discover", false\)/u,
  "Random article navigation must use history so browser Back can return to the previous article or listing.");
assert.match(app, /addEventListener\("popstate", syncPageFromLocation\)/u,
  "Browser Back and Forward must restore Discover route state.");
assert.match(app, /function renderDiscoverListing\(\)[\s\S]*state\.discoverQuery[\s\S]*publishedAt\.localeCompare/u,
  "Discover must filter and order articles by publication date.");
assert.match(app, /function renderDiscoverListing\(\)[\s\S]*filter\(\(article\) => article\.status === "published"\)/u,
  "Draft articles must never appear in the public Discover listing.");
assert.match(app, /function renderDiscoverArticle\(article\)[\s\S]*if \(!article \|\| article\.status !== "published"\)/u,
  "Draft articles must not be readable through a guessed detail URL.");
assert.match(app, /target = "_blank";[\s\S]*rel = "noopener noreferrer"/u, "External source links must be isolated from the opener window.");
const articleRenderer = app.slice(app.indexOf("function renderDiscoverArticle("), app.indexOf("function updateDiscoverReadingProgress("));
assert.match(articleRenderer, /textContent/u, "Article copy must be inserted as text.");
assert.doesNotMatch(articleRenderer, /innerHTML/u, "Article copy must not be rendered as raw HTML.");
assert.match(styles, /\.discover-article-grid\s*\{[^}]*repeat\(3/u, "Discover needs a desktop card grid.");
assert.match(styles, /@media \(max-width: 1080px\)[\s\S]*\.discover-article-grid/u, "Discover needs tablet layout rules.");
assert.match(styles, /@media \(max-width: 600px\)[\s\S]*\.discover-article-grid\s*\{ grid-template-columns: 1fr/u,
  "Discover needs a single-column mobile layout.");
assert.match(styles, /\.discover-surprise-button[^\{]*\{[^}]*linear-gradient/u, "Surprise controls must use the Aurora gradient style.");
assert.match(styles, /@media \(prefers-reduced-motion: reduce\)[\s\S]*\.discover-featured/u,
  "Surprise and Discover animations must respect reduced-motion preferences.");
assert.ok(vercel.rewrites.some((rewrite) => rewrite.source === "/discover" && rewrite.destination === "/"),
  "Vercel must serve the SPA entry point for /discover.");
assert.ok(vercel.rewrites.some((rewrite) => rewrite.source === "/discover/:path*" && rewrite.destination === "/"),
  "Vercel must serve the SPA entry point for article detail routes.");

console.log("Discover data, routing, bilingual fallback, source, filtering, and responsive checks passed (9 articles).");

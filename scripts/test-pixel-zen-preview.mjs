import assert from "node:assert/strict";
const origin=process.argv[2]||process.env.GNWAA_TEST_ORIGIN||"http://127.0.0.1:5175";
for(const path of ["/","/projects","/projects/gnwaa","/projects/randomizer","/playground","/about","/lab","/randomizer","/randomizer/movie","/randomizer/food","/discover","/discover/why-airplanes-fly","/login","/admin"]) {
  const response=await fetch(origin+path,{headers:{Accept:"text/html"}});
  assert.equal(response.status,200,path);
  assert.ok(response.headers.get("content-type")?.includes("text/html"));
  const html=await response.text();
  assert.match(html,/id="public-header"/);
  assert.match(html,/data-page-view="projects"/);
  assert.doesNotMatch(html,/id="matrix-loader"/);
  const styles=[...html.matchAll(/<link[^>]*rel="stylesheet"[^>]*href="([^"]+)"/g)].map(match=>match[1]);
  assert.ok(styles.every(url=>url.startsWith("/")),"Deep links resolve styles from root");
  for(const asset of styles) {
    const res=await fetch(origin+asset,{headers:{Accept:"text/css"}});
    assert.equal(res.status,200);assert.ok(res.headers.get("content-type")?.includes("text/css"),asset);
  }
}
for(const path of ["/images/pixel-zen.svg","/images/pixel-zen-mark.svg","/images/ganwaa-anime-avatar.webp"]) {
  const response=await fetch(origin+path);assert.equal(response.status,200,path);
  assert.ok(response.headers.get("content-type")?.startsWith("image/"));
}
console.log("Pixel Zen HTTP preview passed: 14 direct routes, root-resolved styles, pixel assets and preserved portrait. This is delivery verification, not a browser rendering test.");

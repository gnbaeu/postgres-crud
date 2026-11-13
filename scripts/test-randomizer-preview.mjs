import assert from "node:assert/strict";

const origin = process.env.GNWAA_TEST_ORIGIN || "http://127.0.0.1:5175";
for (const path of ["/randomizer","/randomizer/movie","/randomizer/food"]) {
  const response = await fetch(origin + path,{headers:{Accept:"text/html"}});
  assert.equal(response.status,200,path + " is served.");
  assert.ok(response.headers.get("content-type")?.includes("text/html"),path + " serves the SPA rather than an extensionless JavaScript module.");
  const html = await response.text();
  assert.ok(html.includes('id="randomizer-view"'));
  const styles = [...html.matchAll(/<link[^>]*rel="stylesheet"[^>]*href="([^"]+)"/g)].map(match=>match[1]);
  assert.ok(styles.includes("/randomizer.css"));
  assert.ok(styles.every(url=>url.startsWith("/")),"Nested routes must resolve CSS from the site root.");
  for (const url of styles) {
    const asset = await fetch(origin + url,{headers:{Accept:"text/css"}});
    assert.equal(asset.status,200);
    assert.ok(asset.headers.get("content-type")?.includes("text/css"),url + " is CSS, not an HTML fallback.");
  }
}
console.log("Randomizer HTTP preview passed: all three direct URLs return the SPA and root-resolved CSS.");

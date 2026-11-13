import assert from 'node:assert/strict';
import {readFile,access} from 'node:fs/promises';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const read=file=>readFile(resolve(root,file),'utf8');
const pkg=JSON.parse(await read('package.json'));
const lock=JSON.parse(await read('package-lock.json'));
assert.deepEqual(lock.packages[''].dependencies||{},pkg.dependencies||{});
assert.deepEqual(lock.packages[''].devDependencies,pkg.devDependencies);
for(const name of [...Object.keys(pkg.dependencies||{}),...Object.keys(pkg.devDependencies||{}),...Object.keys(lock.packages)])assert.doesNotMatch(name,/supabase/i);
const seen=new Set();
async function visit(file){
  if(seen.has(file))return;seen.add(file);
  const source=await readFile(file,'utf8');
  assert.doesNotMatch(source,/supabase|createClient|VITE_SUPABASE/i,'No legacy provider in runtime graph: '+file);
  for(const match of source.matchAll(/(?:from\s+|import\s*)["'](\.[^"']+)["']/g)){
    const target=resolve(dirname(file),match[1].split('?')[0]);
    await access(target);
    if(/\.(?:js|mjs)$/.test(target))await visit(target);
  }
}
await visit(resolve(root,'app.js'));
const html=await read('index.html');
for(const match of html.matchAll(/(?:src|href)=["'](\/[^"'?#]+)(?:[?#][^"']*)?["']/g)){
  if(/\.(?:svg|png|webp|css|js)$/.test(match[1]))await access(resolve(root,match[1].startsWith('/images/')?'public'+match[1]:'.'+match[1]));
}
const api=await read('api.js');
assert.match(api,/fetch\(`\/api\$\{path\}`/);
assert.match(api,/credentials: "include"/);
assert.match(api,/X-CSRF-Token/);
const vite=await read('vite.config.js');
assert.match(vite,/"\/api\/": \{ target: "http:\/\/127\.0\.0\.1:3001"/);
const vercel=JSON.parse(await read('vercel.json'));
assert.ok(vercel.rewrites.every(rule=>!rule.source.startsWith('/api')),'SPA rewrites do not replace API routes');
assert.doesNotMatch(await read('.env.example'),/^\s*VITE_\w+\s*=/m);
console.log(`Architecture passed: ${seen.size} runtime modules, no provider package/client dependency, assets resolve, same-origin Express API and CSRF/cookie contracts preserved.`);

import assert from 'node:assert/strict';
import pg from '../../backend/node_modules/pg/lib/index.js';
import bcrypt from '../../backend/node_modules/bcryptjs/index.js';
import session from '../../backend/node_modules/express-session/index.js';
import {createApp} from '../../backend/src/app.js';
import {randomBytes} from 'node:crypto';
const pool=new pg.Pool({host:'127.0.0.1',port:55433,database:'gnwaa_laravel_dev',user:'gnwaa_migration',password:'local-development-admin-only'});
assert.equal((await pool.query('SELECT current_database() AS db')).rows[0].db,'gnwaa_laravel_dev');
const tag=randomBytes(6).toString('hex'),pass=randomBytes(20).toString('hex'),hash=await bcrypt.hash(pass,12),ids=[];
const config={allowedOrigins:['http://127.0.0.1:5175'],sessionSecret:randomBytes(32).toString('hex'),cookieName:'contract.sid',cookieSecure:false,cookieSameSite:'lax',trustProxyHops:0,loginWindowMs:900000,loginMaxAttempts:8};
const server=createApp({pool,sessionStore:new session.MemoryStore(),config}).listen(0,'127.0.0.1');await new Promise(r=>server.once('listening',r));
const beforeKeys=(await pool.query('SELECT key_hash FROM gnwaa_app.login_attempt_limits')).rows.map(r=>r.key_hash);
const results=[];
try{
 for(const role of ['owner','member']){const q=await pool.query('INSERT INTO gnwaa_app.accounts(email,password_hash,role) VALUES($1,$2,$3) RETURNING account_id',[`${role}-${tag}@example.test`,hash,role]);ids.push(q.rows[0].account_id);}
 for(const origin of [`http://127.0.0.1:${server.address().port}`,'http://127.0.0.1:3002']){
  let cookies=new Map(),token;const log=[];
  async function call(path,method='GET',body,headers={}){const res=await fetch(origin+path,{method,headers:{Cookie:[...cookies].map(([k,v])=>`${k}=${v}`).join('; '),...(body?{'Content-Type':'application/json'}:{}),...(token?{'X-CSRF-Token':token}:{}),...headers},body:body?JSON.stringify(body):undefined});for(const c of res.headers.getSetCookie()){const [pair]=c.split(';'),i=pair.indexOf('=');cookies.set(pair.slice(0,i),pair.slice(i+1));assert.match(c,/httponly/i);}const text=await res.text();let json=text?JSON.parse(text):null;log.push([method,path,res.status]);return {res,json};}
  async function expect(path,status,method='GET',body,headers){const v=await call(path,method,body,headers);assert.equal(v.res.status,status,`${origin} ${method} ${path}: ${JSON.stringify(v.json)}`);return v.json;}
  await expect('/healthz',200);await expect('/api/admin/customers',401);await expect('/api/auth/login',403,'POST',{email:'x',password:'x'});
  token=(await expect('/api/auth/csrf-token',200)).csrfToken;
  await expect('/api/auth/login',403,'POST',{email:'x',password:'x'},{Origin:'https://evil.example'});
  await expect('/api/auth/login',400,'POST',{email:'invalid',password:'x'});
  await expect('/api/auth/login',401,'POST',{email:`owner-${tag}@example.test`,password:'incorrect'});
  const oldCookie=[...cookies.values()].join('');
  const login=await expect('/api/auth/login',200,'POST',{email:`owner-${tag}@example.test`,password:pass});assert.equal(login.user.role,'owner');assert.equal(typeof login.user.id,'string');assert.notEqual([...cookies.values()].join(''),oldCookie);
  await expect('/api/admin/customers',403,'POST',{});token=(await expect('/api/auth/csrf-token',200)).csrfToken;
  await expect('/api/auth/me',200);await expect('/api/admin/customers',400,'POST',{first_name:'X',last_name:'Y',store_id:1,address_id:1,active:'true'});
  const customer=(await expect('/api/admin/customers',201,'POST',{first_name:' Test ',last_name:tag,email:null,store_id:'1',address_id:2})).data;assert.equal(customer.first_name,'Test');assert.equal(typeof customer.customer_id,'string');assert.equal(customer.active,true);
  await expect('/api/admin/customers/'+customer.customer_id,200);const list=await expect('/api/admin/customers?page=1&pageSize=1&search='+tag,200);assert.equal(list.total,1);assert.equal(list.pageSize,1);
  await expect('/api/admin/customers/'+customer.customer_id,400,'PATCH',{unexpected:true});await expect('/api/admin/customers/'+customer.customer_id,200,'PATCH',{active:false});await expect('/api/admin/customers/'+customer.customer_id,204,'DELETE');await expect('/api/admin/customers/'+customer.customer_id,404);
  const home=(await expect('/api/admin/content',201,'POST',{slug:'home',locale:'en',heading:'Home '+tag,description:'Description',status:'draft'})).data;assert.match(home.updated_at,/\.\d{6}Z$/);
  await expect('/api/content/home?locale=en',404);await expect('/api/admin/content/'+home.content_id,400,'PATCH',{heading:'New'});
  const published=(await expect('/api/admin/content/'+home.content_id,200,'PATCH',{status:'published',updated_at:home.updated_at})).data;
  await expect('/api/content/home?locale=en',200);await expect('/api/admin/content/'+home.content_id,409,'PATCH',{heading:'Stale',updated_at:home.updated_at});
  const bulk={locale:'en',status:'published',home:{heading:'Bulk',description:'Bulk desc',content_id:home.content_id,updated_at:published.updated_at},about:{heading:'About',description:'About desc',content_id:null,updated_at:null}};
  const both=(await expect('/api/admin/content/bulk',200,'POST',bulk)).data;assert.equal(both.length,2);
  await expect('/api/admin/content/bulk',409,'POST',{...bulk,home:{...bulk.home,heading:'Must roll back',updated_at:both[0].updated_at}});
  assert.equal((await expect('/api/content/home?locale=en',200)).data.heading,'Bulk');
  for(const row of both)await expect('/api/admin/content/'+row.content_id,204,'DELETE');
  await expect('/api/auth/logout',204,'POST');await expect('/api/auth/me',401);token=(await expect('/api/auth/csrf-token',200)).csrfToken;
  await expect('/api/auth/login',200,'POST',{email:`member-${tag}@example.test`,password:pass});await expect('/api/admin/customers',403);await pool.query('UPDATE gnwaa_app.accounts SET is_active=false WHERE account_id=$1',[ids[1]]);await expect('/api/auth/me',401);await pool.query('UPDATE gnwaa_app.accounts SET is_active=true WHERE account_id=$1',[ids[1]]);token=(await expect('/api/auth/csrf-token',200)).csrfToken;await expect('/api/auth/logout',204,'POST');
  token=(await expect('/api/auth/csrf-token',200)).csrfToken;for(let i=0;i<8;i++)await expect('/api/auth/login',401,'POST',{email:`missing-${tag}@example.test`,password:'bad'});await expect('/api/auth/login',429,'POST',{email:`missing-${tag}@example.test`,password:'bad'});
  results.push(log);console.log('Contract + PostgreSQL PASS: '+origin);
 }
 // IDs and ports differ, method/status sequence must be identical.
 assert.deepEqual(results[0].map(([m,p,s])=>[m,p.replace(/\/[0-9]+/g,'/:id'),s]),results[1].map(([m,p,s])=>[m,p.replace(/\/[0-9]+/g,'/:id'),s]));
 console.log('Express/Laravel parity PASS: '+results[0].length+' requests per backend; PostgreSQL CRUD, transactions, auth rotation, CSRF, role, limiter.');
}finally{const afterKeys=(await pool.query('SELECT key_hash FROM gnwaa_app.login_attempt_limits')).rows.map(r=>r.key_hash).filter(k=>!beforeKeys.includes(k));await pool.query('DELETE FROM gnwaa_app.login_attempt_limits WHERE key_hash=ANY($1::text[])',[afterKeys]);await pool.query('DELETE FROM gnwaa_app.accounts WHERE account_id=ANY($1::bigint[])',[ids]);server.close();await pool.end();}

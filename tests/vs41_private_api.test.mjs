import {test} from 'node:test';import assert from 'node:assert/strict';import http from 'node:http';import {createApi} from '../infra/vs41-private/api.mjs';import {parseUsers,passwordHash} from '../infra/vs41-private/auth.mjs';import {fixture,profiles} from './vs41_private_fixture.mjs';
test('login autenticado, dois perfis, recusa de origem, sem IDs do cliente, logout revoga',async()=>{
 const f=fixture(),passA='fixture-A-only-123',passB='fixture-B-only-123';
 const users=parseUsers(JSON.stringify(await Promise.all(['A','B'].map(async s=>({username:s,...profiles[s],passwordHash:await passwordHash(s==='A'?passA:passB)})))));
 assert.throws(()=>parseUsers(JSON.stringify([...users.values()].map(u=>({...u,profileId:'same'})))));
 let handler;const server=http.createServer((req,res)=>void handler(req,res));
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const origin='http://127.0.0.1:'+server.address().port;
 handler=createApi({...f,users,origin});
 const req=(p,opts={})=>fetch(origin+'/api/vs41/'+p,opts);
 const login=(s,p,extra={})=>req('login',{method:'POST',headers:{Origin:origin,'Content-Type':'application/json',...extra},body:JSON.stringify({username:s,password:p,rootId:'rootB',subject:'B'})});
 try{
  assert.equal((await req('private-cards')).status,401);assert.equal(f.requests.length,0);
  assert.equal((await login('A','wrong')).status,401);
  assert.equal((await login('A',passA,{Origin:'https://foreign.example'})).status,403);
  const [a,b]=await Promise.all([login('A',passA),login('B',passB)]);assert.equal(a.status,200);assert.equal(b.status,200);
  const cookies=[a,b].map(r=>{const c=r.headers.get('set-cookie');assert.match(c,/HttpOnly; Secure; SameSite=Strict/);return c.split(';')[0]});
  const contexts=await Promise.all(cookies.map(async Cookie=>(await (await req('session',{headers:{Cookie}})).json()).context));assert.notEqual(contexts[0],contexts[1]);assert.match(contexts[0],/^[a-f0-9]{32}$/);assert.equal((await req('private-cards',{headers:{Cookie:cookies[0]}})).status,409);assert.equal((await req('private-cards',{headers:{Cookie:cookies[0],'X-BM-Context':contexts[1]}})).status,409);
  const views=await Promise.all(cookies.map((Cookie,i)=>req('private-cards',{headers:{Cookie,'X-BM-Context':contexts[i]}})));assert.deepEqual(await Promise.all(views.map(async r=>(await r.json()).records[0].back)),['Resposta privada A','Resposta privada B']);
  assert.equal((await req('private-cards?subject=B',{headers:{Cookie:cookies[0]}})).status,403);
  assert.equal((await req('private-cards',{headers:{Cookie:cookies[0],Origin:'https://foreign.example'}})).status,403);
  assert.equal((await req('logout',{method:'POST',headers:{Cookie:cookies[0],Origin:origin}})).status,200);
  assert.equal((await req('private-cards',{headers:{Cookie:cookies[0]}})).status,401);
  assert.equal((await req('private-cards',{headers:{Cookie:cookies[1],'X-BM-Context':contexts[1]}})).status,200);
 }finally{await new Promise(r=>server.close(r))}
});

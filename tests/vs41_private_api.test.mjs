import {test} from 'node:test';import assert from 'node:assert/strict';import http from 'node:http';import {createApi} from '../infra/vs41-private/api.mjs';import {parseUsers,passwordHash} from '../infra/vs41-private/auth.mjs';import {accountTokens} from '../infra/vs41-private/oauth.mjs';import {reviewFixture,mediaFixture,formulaFixture,profiles} from './vs41_private_fixture.mjs';
test('login autenticado, dois perfis, recusa de origem, sem IDs do cliente, logout revoga',async()=>{
 const f=formulaFixture(mediaFixture(reviewFixture())),passA='fixture-A-only-123',passB='fixture-B-only-123';
 const users=parseUsers(JSON.stringify(await Promise.all(['A','B'].map(async s=>({username:s,...profiles[s],passwordHash:await passwordHash(s==='A'?passA:passB)})))));
 assert.throws(()=>parseUsers(JSON.stringify([...users.values()].map(u=>({...u,profileId:'same'})))));
 let handler;const server=http.createServer((req,res)=>void handler(req,res));
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const origin='http://127.0.0.1:'+server.address().port;
 // Exercise real accountTokens selection through the authenticated HTTP API.
 const grants=['A','B'].map(s=>({subject:s,permissionId:'google'+s,refreshToken:'refresh'+s}));
 const calls=[],violations=[];let revokeA=false;
 const fetcher=async(url,opts)=>{
  const u=new URL(url);
  if(u.origin==='https://oauth2.googleapis.com'){
   const s=opts.body.get('refresh_token').slice(-1);
   if(s==='A'&&revokeA)return new Response(null,{status:401});
   return Response.json({access_token:'access'+s,expires_in:120});
  }
  const s=opts.headers.Authorization?.match(/^Bearer access([AB])$/)?.[1];
  if(!s){violations.push('missing individual token');return new Response(null,{status:403})}
  if(u.pathname==='/drive/v3/about')return Response.json({user:{permissionId:'google'+s}});
  const method=opts.method||'GET';
  let owner;
  if(method==='POST'){
   const meta=JSON.parse(opts.body.split('\r\n')[3]);owner=meta.appProperties.bmOwner;
   if(meta.parents?.[0]!=='root'+s)violations.push('cross-account write');
  }else if(u.pathname==='/drive/v3/files'){
   owner=u.searchParams.get('q')?.match(/^'root([AB])' in parents/)?.[1];
  }else{
   const id=u.pathname.endsWith('/export')?u.pathname.split('/').at(-2):u.pathname.split('/').at(-1);
   owner=f.files.get(id)?.meta.appProperties?.bmOwner;
  }
  calls.push({s,owner,method});
  if(owner!==s){violations.push('cross-account or unknown target');return new Response(null,{status:403})}
  return f.fetcher(url,{...opts,headers:{...opts.headers,Authorization:'Bearer fixture'}});
 };
 let clock=Date.now();
 const getToken=accountTokens({users,grants,clientId:'fixture',clientSecret:'fixture',fetcher,now:()=>clock});
 handler=createApi({users,origin,getToken,fetcher,now:()=>clock});
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
  const call=(p,i,opts={})=>req(p,{...opts,headers:{Cookie:cookies[i],'X-BM-Context':contexts[i],...opts.headers}});
  for(const endpoint of ['formulas','images','pdfs','media/CARD-9901/IMG-TEST','annotations/PDF-TEST/1','image-ink/IMG-TEST','study','gaps','reviews']){
   for(const i of [0,1])assert.equal((await call(endpoint,i)).status,200,endpoint+' '+i);
  }
  const legacy={...f.files.get('cardsA').payload.records[0],id:'TRT01-C001',related_card_ids:[]};delete legacy.expl;delete legacy.consolidation;
  f.files.get('cardsA').payload.records.push(legacy);
  f.files.get('mediaA').payload.records[1].card_ids.push(legacy.id);
  assert.equal((await call('media/TRT01-C001/PDF-TEST',0)).status,200);
  assert.equal((await call('media/TRT01-C001/PDF-TEST',1)).status,404);
  const event_id='12345678-1234-4234-8234-000000000001';
  for(const i of [0,1]){
   const r=await call('reviews',i,{method:'POST',headers:{Origin:origin,'Content-Type':'application/json'},body:JSON.stringify({id:'CARD-9901',event_id,rating:i?'Bom':'Fácil',owner:i?'A':'B',rootId:i?'rootA':'rootB'})});
   assert.equal(r.status,200);
  }
  assert.deepEqual(f.writes.map(w=>w.parent),['rootA','rootB']);
  assert.deepEqual(violations,[]);
  assert.ok(calls.some(c=>c.s==='A'&&c.method==='POST')&&calls.some(c=>c.s==='B'&&c.method==='POST'));
  // Expiration triggers individual renewal; revoking A must not affect B.
  clock+=61000;revokeA=true;
  assert.equal((await call('private-cards',0)).status,503);
  assert.equal((await call('private-cards',1)).status,200);
  assert.deepEqual(violations,[]);
  assert.equal((await req('private-cards?subject=B',{headers:{Cookie:cookies[0]}})).status,403);
  assert.equal((await req('private-cards',{headers:{Cookie:cookies[0],Origin:'https://foreign.example'}})).status,403);
  assert.equal((await req('logout',{method:'POST',headers:{Cookie:cookies[0],Origin:origin}})).status,200);
  assert.equal((await req('private-cards',{headers:{Cookie:cookies[0]}})).status,401);
  assert.equal((await req('private-cards',{headers:{Cookie:cookies[1],'X-BM-Context':contexts[1]}})).status,200);
 }finally{await new Promise(r=>server.close(r))}
});

import test from 'node:test';
import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {passwordHash,parseUsers,createAuth,sessionToken} from '../infra/central-drive/auth.mjs';
import {createCentralHandler} from '../infra/central-drive/server.mjs';
import {createOwnerLoader} from '../infra/central-drive/owner-drive.mjs';
const pw='example test password only';
test('isolamento de duas sessões, logout, origem, injeção e acesso anônimo',async()=>{
 const hash=await passwordHash(pw);const rows=[{username:'a',subject:'a1',rootId:'rootA',passwordHash:hash},{username:'b',subject:'b1',rootId:'rootB',passwordHash:hash}];
 assert.throws(()=>parseUsers(JSON.stringify([rows[0],{...rows[1],rootId:'rootA'}])));
 assert.throws(()=>parseUsers(JSON.stringify([{...rows[0],rootId:undefined}])));
 assert.throws(()=>parseUsers(JSON.stringify([{...rows[0],subject:42}])));
 const auth=createAuth({users:parseUsers(JSON.stringify(rows))});
 const origin='https://study.example';const seen=[];
 const srv=createServer(createCentralHandler({auth,origin,loadProfile:async u=>{seen.push(u.rootId);return {counts:{cards:u.rootId==='rootA'?7:2}}}}));
 await new Promise(r=>srv.listen(0,'127.0.0.1',r));const base='http://127.0.0.1:'+srv.address().port;
 const login=async(username,password,extra={})=>fetch(base+'/api/login',{method:'POST',headers:{origin,'content-type':'application/json'},body:JSON.stringify({username,password,...extra})});
 try{
  assert.equal((await fetch(base+'/api/profile')).status,401);
  assert.equal((await login('a',pw,{rootId:'rootB'})).status,400);
  assert.equal((await login('a','wrong')).status,401);
  const [a,b]=await Promise.all([login('a',pw),login('b',pw)]);
  assert.equal(a.status,200);assert.equal(b.status,200);
  const ac=a.headers.get('set-cookie'),bc=b.headers.get('set-cookie');
  assert.match(ac,/HttpOnly; Secure; SameSite=Strict/);assert.notEqual(sessionToken(ac),sessionToken(bc));
  const ca=ac.split(';')[0],cb=bc.split(';')[0];
  const get=async cookie=>fetch(base+'/api/profile',{headers:{cookie}});
  assert.equal((await (await get(ca)).json()).counts.cards,7);
  assert.equal((await (await get(cb)).json()).counts.cards,2);
  assert.equal((await fetch(base+'/api/logout',{method:'POST',headers:{cookie:ca,origin:'https://evil.example'}})).status,403);
  assert.equal((await get(ca)).status,200);
  assert.equal((await fetch(base+'/api/logout',{method:'POST',headers:{cookie:ca,origin}})).status,200);
  assert.equal((await get(ca)).status,401);assert.equal((await get(cb)).status,200);
  assert.equal((await fetch(base+'/api/profile?rootId=rootB',{headers:{cookie:ca}})).status,404);
  assert.ok(seen.includes('rootA')&&seen.includes('rootB'));
 }finally{srv.closeAllConnections();await new Promise(r=>srv.close(r))}
});
test('nega raiz divergente antes de buscar manifesto',async()=>{
 let requests=0;
 const load=createOwnerLoader({getToken:async()=>({token:'test',expiresAt:Date.now()+100000}),fetcher:async()=>{requests++;return new Response(JSON.stringify({files:[{id:'otherRoot',mimeType:'application/vnd.google-apps.folder',ownedByMe:true,shared:false,trashed:false,appProperties:{bmProject:'bm-portal-multi-v1',bmOwner:'a1',bmKind:'root'}}]}),{status:200})}});
 await assert.rejects(load({username:'a',subject:'a1',rootId:'rootA'}),/Raiz divergente/);
 assert.equal(requests,1);
});

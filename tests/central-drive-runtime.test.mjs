import test from 'node:test';
import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {CATALOGS} from '../assets/multiaccount-catalog-v001.mjs';
import {createServerCatalogLoader} from '../infra/central-drive/catalog.mjs';
import {createOwnerLoader} from '../infra/central-drive/owner-drive.mjs';
import {projectRuntime} from '../infra/central-drive/runtime.mjs';
import {createAuth,parseUsers,passwordHash} from '../infra/central-drive/auth.mjs';
import {createCentralHandler} from '../infra/central-drive/server.mjs';
const kinds=['cards','srs','questions','pdf','images','annotations','study'];
function fixture(subject,rootId){
 const info={sub:subject,email:subject+'@example.invalid',email_verified:true};
 const privateData=Object.fromEntries(kinds.map(k=>[k,[]]));
 privateData.cards=[{id:'CARD-0001',front:'Pergunta '+subject,back:'Resposta '+subject,active:true}];
 privateData.srs=[{id:'CARD-0001',due:subject==='A'?'2026-12-01':'2026-12-02',rating:'Bom'}];
 return {info,profile:{subject,catalog:'private-only',rootId,profileId:'profile'+subject,publicCards:[],privateData},events:[],discursive:[],uploadedImages:[]}
}
test('catálogo civil usa reconciliador original; perfil privado não importa catálogo',async()=>{
 const load=createServerCatalogLoader();
 const a=await load(CATALOGS['civil-public-v348']);assert.equal(a.cards.length,1601);assert.equal(a.cards.filter(c=>c.active).length,1584);
 a.cards[0].front='alterado';assert.notEqual((await load(CATALOGS['civil-public-v348'])).cards[0].front,'alterado');
 assert.equal((await load(CATALOGS['private-only'])).cards.length,0);
 await assert.rejects(load({id:'civil-public-v348'}));
});
test('runtime real, mesmas IDs com dados e vencimentos distintos, sem referências privadas',()=>{
 const a=projectRuntime(fixture('A','rootA')),b=projectRuntime(fixture('B','rootB'));
 assert.equal(a.cards[0].front,'Pergunta A');assert.equal(b.cards[0].front,'Pergunta B');
 assert.equal(a.srs.records[0].due,'2026-12-01');assert.equal(b.srs.records[0].due,'2026-12-02');
 assert.ok(!JSON.stringify(a).includes('rootA'));assert.ok(!JSON.stringify(a).includes('profileA'));
 const bad=fixture('A','rootA');bad.profile.privateData.cards.push(bad.profile.privateData.cards[0]);assert.throws(()=>projectRuntime(bad));
});
test('API runtime deriva conta do cookie, não aceita parâmetros nem acesso após logout',async()=>{
 const hash=await passwordHash('password for tests only');
 const auth=createAuth({users:parseUsers(JSON.stringify([{username:'a',subject:'A',rootId:'rootA',passwordHash:hash},{username:'b',subject:'B',rootId:'rootB',passwordHash:hash}]))});
 const origin='https://study.example';
 const server=createServer(createCentralHandler({auth,origin,loadProfile:async(u,{runtime=false}={})=>{const v=projectRuntime(fixture(u.subject,u.rootId));return runtime?v:{catalog:v.catalog,counts:v.counts}}}));
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const base='http://127.0.0.1:'+server.address().port;
 const login=async username=>fetch(base+'/api/login',{method:'POST',headers:{origin,'content-type':'application/json'},body:JSON.stringify({username,password:'password for tests only'})});
 const read=async(cookie,path='/api/runtime')=>fetch(base+path,{headers:{cookie}});
 try{
  assert.equal((await fetch(base+'/api/runtime')).status,401);
  const [a,b]=await Promise.all([login('a'),login('b')]);assert.equal(a.status,200);assert.equal(b.status,200);
  assert.ok(!Object.hasOwn(await a.json(),'cards'));
  const ca=a.headers.get('set-cookie').split(';')[0],cb=b.headers.get('set-cookie').split(';')[0];
  const av=await read(ca),bv=await read(cb);assert.equal(av.headers.get('cache-control'),'no-store');assert.equal((await av.json()).cards[0].back,'Resposta A');assert.equal((await bv.json()).cards[0].back,'Resposta B');
  assert.equal((await read(ca,'/api/runtime?subject=B')).status,404);
  assert.equal((await read(cb,'/api/session')).status,200);
  await fetch(base+'/api/logout',{method:'POST',headers:{origin,cookie:ca}});
  assert.equal((await read(ca)).status,401);assert.equal((await read(cb)).status,200);
 }finally{server.closeAllConnections();await new Promise(r=>server.close(r))}
});
test('Drive simulado: valida coleções e diário por titular, não permite ID estrangeiro',async()=>{
 const project='bm-portal-multi-v1',root='rootA',sub='A',f=fixture(sub,root);
 const collections=Object.fromEntries(kinds.map(k=>[k,'a_'+k]));
 const payloads={profileA:{schema:'BM-PORTAL-PROFILE/1',project,owner:sub,catalog:'private-only',collections}};
 for(const k of kinds)payloads[collections[k]]={schema:'BM-PORTAL-COLLECTION/1',project,owner:sub,kind:k,records:f.profile.privateData[k]};
 const meta=(id,kind,parent=root,owner=sub)=>({id,name:id,mimeType:kind==='root'?'application/vnd.google-apps.folder':'application/json',ownedByMe:true,shared:false,trashed:false,parents:kind==='root'?[]:[parent],appProperties:{bmProject:project,bmOwner:owner,bmKind:kind},size:String(Buffer.byteLength(JSON.stringify(payloads[id]||{})))});
 let crossed=false;
 const fetcher=async url=>{const u=new URL(url),q=u.searchParams.get('q'),id=u.pathname.split('/').pop();let data;
  if(q){const kind=q.match(/key='bmKind' and value='([^']+)'/)[1];assert.ok(q.includes("key='bmOwner' and value='A'"));data={files:kind==='root'?[meta(root,'root')]:kind==='profile'?[meta('profileA','profile')]:[]}}
  else if(u.searchParams.get('alt')==='media')data=payloads[id];
  else {const kind=id.slice(2);data=meta(id,kind,root,crossed&&kind==='cards'?'B':sub)}
  assert.ok(data);return new Response(JSON.stringify(data),{status:200});
 };
 const load=createOwnerLoader({getToken:async()=>({token:'test',expiresAt:Date.now()+100000}),fetcher});
 const v=await load({username:'a',subject:sub,rootId:root},{runtime:true});assert.equal(v.cards[0].front,'Pergunta A');
 crossed=true;await assert.rejects(load({username:'a',subject:sub,rootId:root},{runtime:true}),/não pertence/);
});

// End-to-end architecture check: the existing Google browser reader supplies the
// ORIGINAL full VS41 through its private API contract. No public catalog or writes.
// This is a browser-test transport, not a deployed login or production server.
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {createPortalHost} from '../infra/vs41-private/host.mjs';
import {createApi} from '../infra/vs41-private/api.mjs';
import {parseUsers,passwordHash} from '../infra/vs41-private/auth.mjs';
import {fixture,profiles,card} from './vs41_private_fixture.mjs';
const root=process.cwd(),original=fs.readFileSync(process.argv[2],'utf8'),seed=JSON.parse(original);
assert.equal(seed.cards.length,1460);
const passwords={A:'fixture-browser-A-only',B:'fixture-browser-B-only'};
const users=parseUsers(JSON.stringify(await Promise.all(['A','B'].map(async s=>({username:s,...profiles[s],passwordHash:await passwordHash(passwords[s])})))));
const f=fixture();
let handler;const server=http.createServer((req,res)=>handler(req,res));
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const origin='http://127.0.0.1:'+server.address().port;
const api=createApi({users,origin,getToken:async()=>{throw Error('No server-side Drive credentials in browser transport test')},fetcher:f.fetcher});
const host=createPortalHost({root,api});
const modulePaths=new Set(['/infra/vs41-private/browser-drive.mjs','/infra/vs41-private/records.mjs']);
handler=(req,res)=>{
 if(req.method==='GET'&&req.url==='/browser-transport-test'){res.writeHead(200,{'Content-Type':'text/html','Cache-Control':'no-store'});return res.end('<!doctype html><meta charset="utf-8"><title>Browser transport test</title>');}
 if(req.method==='GET'&&modulePaths.has(req.url)){res.writeHead(200,{'Content-Type':'text/javascript','Cache-Control':'no-store'});return res.end(fs.readFileSync(path.join(root,req.url.slice(1))));}
 return host(req,res);
};
const browser=await chromium.launch({headless:true});
try{
 for(const account of ['A','B']){
  const ctx=await browser.newContext({viewport:{width:1366,height:900}});
  const login=await ctx.request.post(origin+'/api/vs41/login',{headers:{Origin:origin},data:{username:account,password:passwords[account]}});assert.equal(login.status(),200);
  const page=await ctx.newPage();
  const other=JSON.stringify({format:'BancoMestrePrivadoV159',schema_version:1,version:'TESTE-B',counts:{cards:1},cards:[card('B')]});
  let bytes=account==='A'?original:other;
  const own=account==='A'?'candidate':'privateB';
  const requests=[],catalogRequests=[],writes=[];let privateSnapshot=null;
  await page.route('**/*',async route=>{
   const req=route.request(),u=new URL(req.url());
   if(u.origin===origin){
    if(/\/assets\/(?:catalog_snapshot_|cards_drive_sync_|layers_public_)/.test(u.pathname)){catalogRequests.push(u.pathname);return route.abort();}
    if(u.pathname==='/api/vs41/private-cards'){
     // The test transport fulfills this exact authenticated private endpoint with
     // the browser-verified snapshot. It never sends a Google token to the host.
     const expected=req.headers()['x-bm-context'];assert.match(expected,/^[a-f0-9]{32}$/);
     const verified=privateSnapshot;
     assert.ok(verified);return route.fulfill({contentType:'application/json',body:JSON.stringify({schema:'BM-VS41-PRIVATE-CARDS/1',records:verified.records,context:expected})});
    }
    if(u.pathname.startsWith('/api/vs41/')&&req.method()!=='GET'){writes.push(u.pathname);return route.fulfill({status:403,contentType:'application/json',body:'{"error":"Somente leitura"}'});}
    return route.continue();
   }
   if(u.hostname==='cdnjs.cloudflare.com'&&/\/pdf\.js\/3\.11\.174\/pdf(?:\.worker)?\.min\.js$/.test(u.pathname))return route.fulfill({contentType:'application/javascript',body:fs.readFileSync(path.join(root,'node_modules/pdfjs-dist/build',u.pathname.split('/').pop()))});
   if(u.origin!=='https://www.googleapis.com')return route.abort();
   const headers={'access-control-allow-origin':'*','access-control-allow-headers':'authorization','access-control-allow-methods':'GET,OPTIONS'};
   if(req.method()==='OPTIONS')return route.fulfill({status:204,headers});
   assert.equal(req.method(),'GET');assert.equal(req.headers().authorization,'Bearer mock-'+account);requests.push(u.pathname);
   const json=(obj,status=200)=>route.fulfill({status,headers,contentType:'application/json',body:JSON.stringify(obj)});
   const id=u.pathname.split('/').at(-1);
   if(id==='about')return json({user:{permissionId:'owner'+account}});
   if(id==='root'+account)return json({id,mimeType:'application/vnd.google-apps.folder',ownedByMe:true,shared:false,trashed:false});
   if(id!==own)return json({},403);
   if(u.searchParams.has('alt'))return route.fulfill({headers,contentType:'application/json',body:bytes});
   return json({id,name:id+'.json',mimeType:'application/json',ownedByMe:true,shared:false,trashed:false,parents:['root'+account],version:'1',size:String(Buffer.byteLength(bytes))});
  });
  await page.goto(origin+'/browser-transport-test');
  // Use the same readBrowserSnapshot as the published OAuth preview, not a second reader.
  const verified=await page.evaluate(async({account,own})=>{
   const {readBrowserSnapshot}=await import('/infra/vs41-private/browser-drive.mjs');
   const p=await readBrowserSnapshot({token:'mock-'+account,source:own});
   let refused=false;try{await readBrowserSnapshot({token:'mock-'+account,source:account==='A'?'privateB':'candidate'});}catch(e){refused=String(e.message).includes('403');}
   if(!refused)throw Error('Cross-account read not rejected');
   return p;
  },{account,own});
  assert.equal(verified.records.length,account==='A'?1460:1);
  // Test harness only: fulfill the existing private API using verified browser records.
  // No credentials or data are persisted; this is not a production transport.
  privateSnapshot=verified;
  await page.goto(origin+'/index.html',{waitUntil:'domcontentloaded',timeout:60000});
  await page.waitForFunction(()=>typeof loadCards==='function'&&window.BancoMestreVisualizarCardV050);
  await page.evaluate(()=>loadCards());
  assert.equal(await page.evaluate(()=>cards.length),verified.records.length);
  const id=account==='A'?'CARD-0047':'CARD-9901';
  assert.ok(await page.evaluate(id=>window.BancoMestreVisualizarCardV050.showId(id),id));
  const answer=page.locator('#bmCardPeekV050 .bm-v050-peek-answer');
  assert.equal(await answer.isVisible(),false);
  await page.locator('#bmCardPeekV050 .bm-v050-peek-reveal').click();
  const article=answer.locator('.bm349-reading');await article.waitFor({state:'visible'});
  assert.equal(await article.locator('.historic-module').count(),11);
  assert.equal(await article.getAttribute('data-render-fallback'),null);
  assert.deepEqual(await article.locator('p[data-bm-answer-paragraph]').allTextContents(),verified.records.find(c=>c.id===id).consolidation.profile.editorial.answer_paragraphs.map(p=>typeof p==='string'?p:p.text||p.texto));
  await page.evaluate(()=>window.BancoMestreVisualizarCardV050.close());
  assert.deepEqual(catalogRequests,[],'Solicitações a catálogo público');assert.deepEqual(writes,[],'Tentativas de gravação');assert.ok(requests.length>0);
  await ctx.close();
  console.log('OAuth browser transport -> original VS41: '+account+'; '+verified.records.length+' cards; original reader; no public catalog or writes.');
 }
}finally{await browser.close();server.close();}

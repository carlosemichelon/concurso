import {privatePage} from '../infra/vs41-private/page.mjs';
import fs from 'node:fs';import path from 'node:path';import http from 'node:http';import assert from 'node:assert/strict';import {chromium} from 'playwright';
import {createApi} from '../infra/vs41-private/api.mjs';import {parseUsers,passwordHash} from '../infra/vs41-private/auth.mjs';
import {fixture,profiles} from './vs41_private_fixture.mjs';
const root=process.cwd(),html=fs.readFileSync('index.html','utf8'),f=fixture();
const manifest=JSON.parse(fs.readFileSync('assets/version.json','utf8'));
const passwords={A:'fixture-A-only-123',B:'fixture-B-only-123'};
const users=parseUsers(JSON.stringify(await Promise.all(['A','B'].map(async label=>({username:label,...profiles[label],passwordHash:await passwordHash(passwords[label])})))));
const types={'.html':'text/html','.js':'application/javascript','.json':'application/json','.css':'text/css','.svg':'image/svg+xml'};
let api;
const server=http.createServer(async(req,res)=>{
 const u=new URL(req.url,'http://localhost');
 if(await api(req,res))return;
 if(u.pathname==='/index.html'){res.setHeader('Content-Type','text/html');res.setHeader('Cache-Control','no-store');return res.end(privatePage(html))}
 // Only serve the original portal's static assets and the one private client script.
 if(!u.pathname.startsWith('/assets/')&&u.pathname!=='/infra/vs41-private/client.js'){res.writeHead(404);return res.end()}
 const file=path.resolve(root,'.'+u.pathname);
 if(!file.startsWith(root+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404);return res.end()}
 res.setHeader('Content-Type',types[path.extname(file)]||'application/octet-stream');fs.createReadStream(file).pipe(res);
});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const url='http://127.0.0.1:'+server.address().port;
api=createApi({...f,users,origin:url});
const browser=await chromium.launch({headless:true});
const login=(context,label)=>context.request.post(url+'/api/vs41/login',{headers:{Origin:url},data:{username:label,password:passwords[label]}});
const logout=context=>context.request.post(url+'/api/vs41/logout',{headers:{Origin:url}});
async function open(context,label){
 const p=await context.newPage();let publicReads=0,privateReads=0;
 await p.route('**/*',r=>{const u=new URL(r.request().url());if(u.origin!==url)return r.abort();if(u.pathname.includes(manifest.catalog.path)||/\/assets\/catalog_snapshot_|\/assets\/cards_drive_sync_/.test(u.pathname)){publicReads++;return r.abort()}return r.continue()});
 p.on('request',r=>{if(r.url().endsWith('/api/vs41/private-cards'))privateReads++});
 try{
  await p.goto(url+'/index.html',{waitUntil:'domcontentloaded',timeout:60000});
  await p.waitForFunction(()=>typeof loadCards==='function'&&window.BancoMestreVisualizarCardV050);
  if(label==='X'){assert.equal(await p.evaluate(()=>loadCards().then(()=>true,()=>false)),false);assert.equal(await p.evaluate(()=>cards.length),0)}
  else{
   await p.evaluate(()=>loadCards());
   assert.deepEqual(await p.evaluate(()=>cards.map(c=>[c.id,c.front])),[['CARD-9901','Pergunta privada '+label]]);
   assert.ok(await p.evaluate(()=>window.BancoMestreVisualizarCardV050.showId('CARD-9901')));
   const answer=p.locator('#bmCardPeekV050 .bm-v050-peek-answer');assert.equal(await answer.isVisible(),false);
   await p.locator('#bmCardPeekV050 .bm-v050-peek-reveal').click();
   await p.waitForFunction(label=>document.querySelector('#bmCardPeekV050 .bm-v050-peek-answer')?.innerText.includes('Resposta privada '+label),label);
   assert.ok(!(await answer.innerText()).includes('Resposta privada '+(label==='A'?'B':'A')));
   const article=answer.locator('.bm349-reading');await article.waitFor({state:'visible'});
   assert.equal(await article.locator('.historic-module').count(),11,'11 módulos do perfil privado');
   assert.equal(await article.getAttribute('data-render-fallback'),null,'sem fallback');
   assert.deepEqual(await article.locator('p[data-bm-answer-paragraph]').allTextContents(),['Resposta privada '+label]);
   assert.equal(await p.evaluate(()=>cards[0].consolidation.profile.modules.length),11);
   assert.ok(!(await article.innerText()).includes('Módulo experimental 3 do perfil '+(label==='A'?'B':'A')));
  }
  assert.equal(publicReads,0);assert.ok(privateReads>0);console.log('Perfil '+label+': fonte privada e sem fallback público');
 }finally{await p.close()}
}
try{
 const a=await browser.newContext(),b=await browser.newContext();
 await open(a,'X');
 const results=await Promise.all([login(a,'A'),login(b,'B')]);assert.deepEqual(results.map(x=>x.status()),[200,200]);
 for(const context of [a,b]){const cookie=(await context.cookies()).find(x=>x.name==='__Host-bm_session');assert.ok(cookie&&cookie.httpOnly&&cookie.secure&&cookie.sameSite==='Strict')}
 await Promise.all([open(a,'A'),open(b,'B')]);
 assert.equal((await logout(a)).status(),200);
 await open(a,'X');await open(b,'B');
 assert.equal((await login(a,'B')).status(),200);await open(a,'B');
 assert.equal((await logout(a)).status(),200);assert.equal((await logout(b)).status(),200);
 await Promise.all([a.close(),b.close()]);
 console.log('Login, sessões simultâneas, logout e troca de perfil após nova abertura: aprovados.');
}finally{await browser.close();server.close()}

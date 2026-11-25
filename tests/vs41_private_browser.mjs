import {privatePdfLibrary,privatePdfSync} from '../infra/vs41-private/pdf-library.mjs';
import {privateMediaRenderer} from '../infra/vs41-private/media-renderer.mjs';
import {privateCalendar,privateStudyQueue} from '../infra/vs41-private/calendar.mjs';
import {privateJournal} from '../infra/vs41-private/journal.mjs';
import {privatePage} from '../infra/vs41-private/page.mjs';
import fs from 'node:fs';import path from 'node:path';import http from 'node:http';import assert from 'node:assert/strict';import {chromium} from 'playwright';
import {createApi} from '../infra/vs41-private/api.mjs';import {parseUsers,passwordHash} from '../infra/vs41-private/auth.mjs';
import {mediaFixture,profiles} from './vs41_private_fixture.mjs';
const root=process.cwd(),html=fs.readFileSync('index.html','utf8'),f=mediaFixture();
const manifest=JSON.parse(fs.readFileSync('assets/version.json','utf8'));
const passwords={A:'fixture-A-only-123',B:'fixture-B-only-123'};
const users=parseUsers(JSON.stringify(await Promise.all(['A','B'].map(async label=>({username:label,...profiles[label],passwordHash:await passwordHash(passwords[label])})))));
const types={'.html':'text/html','.js':'application/javascript','.json':'application/json','.css':'text/css','.svg':'image/svg+xml'};
let api;
const server=http.createServer(async(req,res)=>{
 const u=new URL(req.url,'http://localhost');
 if(await api(req,res))return;
 if(u.pathname==='/index.html'){res.setHeader('Content-Type','text/html');res.setHeader('Cache-Control','no-store');return res.end(privatePage(html))}
 if(u.pathname==='/assets/v382_srs_journal_vc23.js'){res.setHeader('Content-Type','application/javascript');res.setHeader('Cache-Control','no-store');return res.end(privateJournal(fs.readFileSync('assets/v382_srs_journal_vc23.js','utf8')))}
 if(u.pathname==='/assets/v414_js_076_087_header.js'||u.pathname==='/assets/v383_study_queue.js'){const file=u.pathname.slice(1),adapt=file.includes('header')?privateCalendar:privateStudyQueue;res.setHeader('Content-Type','application/javascript');res.setHeader('Cache-Control','no-store');return res.end(adapt(fs.readFileSync(file,'utf8')))}
 if(u.pathname==='/assets/v417_shared_reader.js'){res.setHeader('Content-Type','application/javascript');return res.end(privateMediaRenderer(fs.readFileSync('assets/v417_shared_reader.js','utf8')))}
 if(u.pathname==='/assets/v432_js_002_015_topic_media.js'||u.pathname==='/assets/v432_js_040_051_atlas.js'){const file=u.pathname.slice(1),adapt=file.includes('topic_media')?privatePdfLibrary:privatePdfSync;res.setHeader('Content-Type','application/javascript');return res.end(adapt(fs.readFileSync(file,'utf8')))}
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
async function open(context,label,keep=false){
 const p=await context.newPage();let publicReads=0,privateReads=0,sessionReads=0;
 await p.route('**/*',r=>{const u=new URL(r.request().url());if(u.origin!==url)return r.abort();if(u.pathname.includes(manifest.catalog.path)||/\/assets\/catalog_snapshot_|\/assets\/cards_drive_sync_/.test(u.pathname)){publicReads++;return r.abort()}return r.continue()});
 p.on('request',r=>{if(r.url().endsWith('/api/vs41/private-cards'))privateReads++;if(r.url().endsWith('/api/vs41/session'))sessionReads++});
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
   const figure=article.locator('figure[data-media-id="IMG-TEST"]');await figure.locator('button').click();
   await figure.locator('[data-private-state="CARREGADA"]').waitFor({state:'visible'});
   assert.ok(await figure.locator('img').evaluate(im=>im.naturalWidth>0));
   const pdf=await p.evaluate(async()=>await (await window.BMVS41PrivateMedia.read('CARD-9901','PDF-TEST')).text());assert.ok(pdf.includes('perfil '+label));
   const library=await p.evaluate(()=>window.BMVS41PrivatePdfs.list());assert.deepEqual(library.map(x=>[x.id,x.title]),[['PDF-TEST','Material privado '+label]]);assert.ok(!Object.hasOwn(library[0],'fileId'));
  }
  assert.equal(publicReads,0);assert.ok(sessionReads>0);assert.equal(privateReads>0,label!=='X');console.log('Perfil '+label+': fonte privada e sem fallback público');
  if(keep)return p;
 }finally{if(!keep)await p.close()}
}
try{
 const a=await browser.newContext(),b=await browser.newContext();
 await open(a,'X');
 const results=await Promise.all([login(a,'A'),login(b,'B')]);assert.deepEqual(results.map(x=>x.status()),[200,200]);
 for(const context of [a,b]){const cookie=(await context.cookies()).find(x=>x.name==='__Host-bm_session');assert.ok(cookie&&cookie.httpOnly&&cookie.secure&&cookie.sameSite==='Strict')}
 const [oldA,oldB]=await Promise.all([open(a,'A',true),open(b,'B',true)]);
 const reviewButtons=[oldA.locator('#bm316-srs-panel button[data-grade="Bom"]'),oldB.locator('#bm316-srs-panel button[data-grade="Fácil"]')];
 await Promise.all(reviewButtons.map(b=>b.click()));
 await Promise.all([oldA,oldB].map(p=>p.waitForFunction(()=>document.querySelector('#bm316-srs-state')?.textContent.includes('registrado no Drive e conferido'))));
 assert.equal(f.writes.length,2);
 assert.deepEqual(f.writes.map(x=>[x.parent,x.payload.rating]).sort(),[['rootA','Bom'],['rootB','Fácil']]);
 for(const [p,rating] of [[oldA,'Bom'],[oldB,'Fácil']]){
  await p.evaluate(()=>window.BM316SrsJournal.refresh());
  const rows=await p.evaluate(()=>window.BM316SrsJournal.records());assert.equal(rows.length,1);assert.equal(rows[0].rating,rating);assert.equal(rows[0].id,'CARD-9901');
 }
 console.log('Botões originais: avaliações gravadas e relidas exclusivamente na raiz de cada usuário.');
 for(const [p,rating,label] of [[oldA,'Bom','A'],[oldB,'Fácil','B']]){
  await p.evaluate(()=>window.BancoMestreVisualizarCardV050.close());
  await p.evaluate(()=>window.BM141Calendar.open());
  const result=await p.evaluate(()=>({counts:window.BM141Calendar.counts(),rows:window.BM141Calendar.rows().map(x=>({id:x.id,front:x.card.front,rating:x.rec?.rating,due:x.rec?.due}))}));
  assert.equal(result.counts.active,1);assert.equal(result.counts.verified,1);assert.ok(result.counts.privateInfo);
  assert.deepEqual(result.rows.map(x=>[x.id,x.front,x.rating]),[['CARD-9901','Pergunta privada '+label,rating]]);
  assert.equal(result.rows[0].due,f.writes.find(x=>x.parent==='root'+label).payload.due);
  const dueRows=await p.evaluate(()=>window.BM382Study.dueRows(window.BM141Calendar.rows(),'9999-12-31').map(x=>x.id));assert.deepEqual(dueRows,['CARD-9901']);
  assert.ok(await p.evaluate(()=>window.BancoMestreVisualizarCardV050.showId('CARD-9901')));
  await p.locator('#bmCardPeekV050 .bm-v050-peek-reveal').click();
 }
 console.log('Calendário e fila: catálogo, vencimentos e classificações individuais, sem histórico público.');
 for(const [p,label] of [[oldA,'A'],[oldB,'B']]){
  await p.evaluate(()=>window.BancoMestreVisualizarCardV050.close());
  await p.evaluate(()=>section('pdfs'));await p.locator('#pdfRows .v036-pdf-title').waitFor({state:'visible'});
  assert.deepEqual(await p.locator('#pdfRows .v036-pdf-title').allTextContents(),['Material privado '+label]);
  await p.locator('#pdfRows .v036-pdf-actions button').first().click();
  await p.locator('#pdfDialog[open]').waitFor({state:'visible'});assert.equal(await p.locator('#docTitle').innerText(),'Material privado '+label);
  const src=await p.locator('#pdfFrame').getAttribute('src');assert.match(src,/^blob:/);
  assert.ok((await p.evaluate(async src=>await (await fetch(src)).text(),src)).includes('perfil '+label));
  await p.locator('#pdfClose').click();
  assert.ok(await p.evaluate(()=>window.BancoMestreVisualizarCardV050.showId('CARD-9901')));
  await p.locator('#bmCardPeekV050 .bm-v050-peek-reveal').click();
 }
 console.log('Biblioteca original: agrupamento, filtro, abertura do PDF próprio; preview sem edição.');
 const before=f.requests.length;
 await oldA.evaluate(()=>window.dispatchEvent(new Event('focus')));await oldA.waitForTimeout(300);assert.equal(f.requests.length,before,'checagem de sessão não consulta Drive');
 const reloaded=oldA.waitForEvent('framenavigated',{predicate:frame=>frame===oldA.mainFrame(),timeout:15000});
 assert.equal((await logout(a)).status(),200);await oldA.evaluate(()=>window.dispatchEvent(new Event('focus'))).catch(()=>{});await reloaded;await oldA.waitForLoadState('domcontentloaded');
 assert.ok(!(await oldA.locator('body').innerText()).includes('Resposta privada A'));assert.equal(await oldA.evaluate(()=>loadCards().then(()=>true,()=>false)),false);
 assert.ok((await oldB.locator('#bmCardPeekV050 .bm-v050-peek-answer').innerText()).includes('Resposta privada B'));
 await oldA.close();await oldB.close();await open(a,'X');await open(b,'B');
 assert.equal((await login(a,'B')).status(),200);await open(a,'B');
 assert.equal((await logout(a)).status(),200);assert.equal((await logout(b)).status(),200);
 await Promise.all([a.close(),b.close()]);
 console.log('Login, sessões simultâneas, logout e troca de perfil após nova abertura: aprovados.');
}finally{await browser.close();server.close()}

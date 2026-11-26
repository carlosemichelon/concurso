import {createPortalHost} from '../infra/vs41-private/host.mjs';
import {privateGaps} from '../infra/vs41-private/gaps-ui.mjs';
import {privatePdfEditor} from '../infra/vs41-private/pdf-editor.mjs';
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
let handler;
const server=http.createServer((req,res)=>handler(req,res));
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const url='http://127.0.0.1:'+server.address().port;
const api=createApi({...f,users,origin:url});handler=createPortalHost({root,api});
const browser=await chromium.launch({headless:true});
const login=(context,label)=>context.request.post(url+'/api/vs41/login',{headers:{Origin:url},data:{username:label,password:passwords[label]}});
const logout=context=>context.request.post(url+'/api/vs41/logout',{headers:{Origin:url}});
async function open(context,label,keep=false){
 const p=await context.newPage();let publicReads=0,privateReads=0,sessionReads=0;
 await p.route('**/*',r=>{const u=new URL(r.request().url());if(u.origin!==url){if(u.hostname==='cdnjs.cloudflare.com'&&/\/pdf\.js\/3\.11\.174\/pdf(?:\.worker)?\.min\.js$/.test(u.pathname))return r.fulfill({contentType:'application/javascript',body:fs.readFileSync(path.join(root,'node_modules/pdfjs-dist/build',u.pathname.split('/').pop()))});return r.abort();}if(u.pathname.includes(manifest.catalog.path)||/\/assets\/catalog_snapshot_|\/assets\/cards_drive_sync_/.test(u.pathname)){publicReads++;return r.abort()}return r.continue()});
 p.on('request',r=>{if(r.url().endsWith('/api/vs41/private-cards'))privateReads++;if(r.url().endsWith('/api/vs41/session'))sessionReads++});
 try{
  await p.goto(url+'/index.html',{waitUntil:'domcontentloaded',timeout:60000});
  if(label==='X'){await p.locator('#login').waitFor({state:'visible'});assert.equal(await p.evaluate(()=>typeof loadCards),'undefined');assert.equal((await context.request.get(url+'/assets/v417_shared_reader.js')).status(),401);}
  else{
   await p.waitForFunction(()=>typeof loadCards==='function'&&window.BancoMestreVisualizarCardV050);
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
  assert.equal(publicReads,0);assert.equal(sessionReads>0,label!=='X');assert.equal(privateReads>0,label!=='X');console.log('Perfil '+label+': fonte privada e sem fallback público');
  if(keep)return p;
 }finally{if(!keep)await p.close()}
}
try{
 const a=await browser.newContext(),b=await browser.newContext();
 await open(a,'X');
 const loginPage=await a.newPage();await loginPage.goto(url+'/index.html');
 await loginPage.locator('input[name=username]').fill('A');await loginPage.locator('input[name=password]').fill(passwords.A);
 await loginPage.locator('#login button').click();await loginPage.waitForFunction(()=>typeof loadCards==='function');await loginPage.close();
 assert.equal((await login(b,'B')).status(),200);
 for(const c of [a,b])for(const forbidden of [manifest.catalog.path,'assets/pdf_catalog_v149.json','assets/catalog_lookup/cards/CARD-0701.json','assets/drive_auth_v038.json','infra/vs41-private/api.mjs','assets/version.json','teste-drive-vs41/index.html']){
  const res=await c.request.get(url+'/'+forbidden.replace(/^\//,''));assert.equal(res.status(),404,'rota legada bloqueada: '+forbidden);
 }
 console.log('Servidor: login obrigatório e dados/arquivos administrativos fora da lista de recursos.');
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
  await p.locator('#bmV056ClosePDF').click();
  await p.locator('#pdfDialog').waitFor({state:'hidden'});
  await p.waitForFunction(async u=>{try{await fetch(u);return false}catch{return true}},src,{timeout:5000});
  assert.ok(await p.evaluate(()=>window.BancoMestreVisualizarCardV050.showId('CARD-9901')));
  await p.locator('#bmCardPeekV050 .bm-v050-peek-reveal').click();
 }
 console.log('Biblioteca original: agrupamento, filtro, abertura e revogação do PDF próprio.');
 const saved=await Promise.all([[oldA,'A'],[oldB,'B']].map(async([p,label])=>p.evaluate(async label=>{
  const api=window.BMVS41PrivateAnnotations,original=await api.get('PDF-TEST',1);
  if(original.marks.length||original.revision!==null)throw Error('Página inicial contaminada');
  const input={event_id:crypto.randomUUID(),hash:original.hash,previous:original.revision,marks:[{type:'text_highlight',text:'Grifo '+label,rects:[[.1,.2,.3,.4]]}]};
  const saved=await api.save('PDF-TEST',1,input);
  const again=await api.get('PDF-TEST',1);
  if(saved.revision!==again.revision||again.marks[0].text!=='Grifo '+label)throw Error('Grifo divergente');
  if((await api.get('PDF-TEST',2)).marks.length)throw Error('Outra página contaminada');
  return {hash:again.hash,revision:again.revision,text:again.marks[0].text};
 },label)));
 assert.deepEqual(saved.map(x=>x.text),['Grifo A','Grifo B']);
 const annotationWrites=f.writes.filter(x=>x.payload.schema==='BM-PDF-PAGE/1');
 assert.deepEqual(annotationWrites.map(x=>[x.parent,x.payload.marks[0].text]).sort(),[['rootA','Grifo A'],['rootB','Grifo B']]);
 await assert.rejects(oldA.evaluate(async hash=>window.BMVS41PrivateAnnotations.save('PDF-TEST',1,{event_id:crypto.randomUUID(),hash,previous:null,marks:[]}),saved[1].hash));
 console.log('Grifos: API autenticada no navegador, dados por usuário e página, conflito bloqueado.');
 for(const [p,label] of [[oldA,'A'],[oldB,'B']]){
  await p.evaluate(()=>window.BancoMestreVisualizarCardV050.close());
  await p.evaluate(()=>section('pdfs'));
  await p.locator('#pdfRows .v036-pdf-actions button').first().click();
  await p.locator('#pdfDialog[open]').waitFor({state:'visible'});
  await p.evaluate(async()=>{const script=document.createElement('script');script.src='/test-pdfjs/pdf.min.js';await new Promise((ok,no)=>{script.onload=ok;script.onerror=no;document.head.append(script)});window.pdfjsLib.GlobalWorkerOptions.workerSrc='/test-pdfjs/pdf.worker.min.js'});
  await p.locator('#bmV056OpenPdfMenu').click();await p.locator('#pdfChooseLocal').click();
  await p.waitForFunction(()=>window.BMVS41PrivatePdfEditor.confirmed&&window.BancoMestrePDFV042.totalPages===2);
  assert.equal(await p.evaluate(()=>window.BancoMestrePDFV042.currentMarks[0].text),'Grifo '+label);
  await p.evaluate(()=>{const x=window.BancoMestrePDFV042;const result=x.addTextHighlight({text:'Marca editor',rects:[[.2,.1,.4,.18]],documentId:x.currentId,sourceHash:x.sourceHash,page:x.currentPage,color:'#ffd400'});if(!result)throw Error('Ferramenta de grifo original não registrou')});
  await p.waitForFunction(()=>window.BMVS41PrivatePdfEditor.confirmed&&!window.BMVS41PrivatePdfEditor.busy);
  const rows=await p.evaluate(()=>window.BMVS41PrivateAnnotations.get('PDF-TEST',1));assert.equal(rows.marks.length,2);assert.equal(rows.marks[1].text,'Marca editor');
  await p.locator('#bmV056ClosePDF').click();await p.locator('#pdfDialog').waitFor({state:'hidden'});
  assert.ok(await p.evaluate(()=>window.BancoMestreVisualizarCardV050.showId('CARD-9901')));
  await p.locator('#bmCardPeekV050 .bm-v050-peek-reveal').click();
 }
 console.log('Editor PDF.js original: PDF válido, marcação e gravação autenticada.');
 for(const [p,label] of [[oldA,'A'],[oldB,'B']]){
  await p.evaluate(()=>window.BancoMestreVisualizarCardV050.close());
  await p.evaluate(()=>{localStorage.setItem('BM_LACUNAS_V242',JSON.stringify({schema:1,records:[{id:'LAC-LEGACY',descricao:'Administrador privado'}],log:[]}));window.BM242Lacunas.openForm()});
  await p.waitForFunction(()=>window.BM242Lacunas?.data?.records?.length===0&&document.querySelector('#lacunas.active')&&!document.querySelector('#bm242-form button[type=submit]').disabled);
  const form=p.locator('#bm242-form');
  await form.locator('[name=descricao]').fill('Lacuna privada '+label);
  await form.locator('[name=relatoEstudante]').fill('Relato literal '+label);
  await form.locator('[name=cardIds]').fill('CARD-9901');
  await form.locator('[name=disciplina]').fill('Teste');
  await form.locator('button[type=submit]').click();
  await p.waitForFunction(label=>document.querySelector('#bm242-form-msg')?.textContent.includes('gravada e conferida')&&window.BM242Lacunas.data.records[0]?.descricao==='Lacuna privada '+label,label);
  assert.equal(await p.evaluate(()=>window.BM242Lacunas.data.records[0].relatoEstudante),'Relato literal '+label);
  assert.ok((await p.locator('#bm242-list').innerText()).includes('Lacuna privada '+label));
  await p.evaluate(()=>document.querySelector('#bm242-list [data-stage]').click());
  await p.waitForFunction(()=>window.BM242Lacunas.data.records[0].etapa==='Explicada');
  await p.evaluate(()=>window.BM242LacunasDrive.sync());
  assert.equal(await p.evaluate(()=>window.BM242Lacunas.data.records.length),1);
  assert.equal(await p.evaluate(()=>window.BM242Lacunas.data.records[0].etapa),'Explicada');
  assert.equal(await p.evaluate(()=>JSON.parse(localStorage.getItem('BM_LACUNAS_V242')).records[0].id),'LAC-LEGACY');
  assert.ok(await p.evaluate(()=>window.BancoMestreVisualizarCardV050.showId('CARD-9901')));
  await p.locator('#bmCardPeekV050 .bm-v050-peek-reveal').click();
 }
 const gapWrites=f.writes.filter(x=>x.payload.schema==='BM-GAP-EVENT/1');assert.equal(gapWrites.length,4);
 assert.deepEqual(gapWrites.map(x=>[x.parent,x.payload.record.relatoEstudante]).sort(),[['rootA','Relato literal A'],['rootA','Relato literal A'],['rootB','Relato literal B'],['rootB','Relato literal B']]);
 assert.equal(f.writes.filter(x=>x.payload.schema==='bm-srs-formal-event/1').length,2);
 console.log('Lacunas: formulário original, etapa, releitura privada e armazenamento legado intacto.');
 for(const p of [oldA,oldB]){
  assert.equal(await p.evaluate(()=>window.BM239DriveGlobal.writeToken()),'');
  assert.equal(await p.evaluate(()=>window.BM186Checkpoints),undefined);
  assert.equal(await p.evaluate(()=>window.BM368Supplements),undefined);
  assert.equal(await p.evaluate(()=>window.BM349.has('CARD-1560')),false);
  assert.ok(await p.locator('#bm-vs41-logout').count());
 }
 console.log('Perfis autenticados: sem token Google no cliente, sem complementos públicos e sem checkpoints administrativos.');
 for(const [p,label] of [[oldA,'A'],[oldB,'B']]){
  await p.evaluate(()=>window.BancoMestreVisualizarCardV050.close());
  await p.evaluate(()=>section('imagens'));
  const card=p.locator('#imageRows article[data-private-image-id="IMG-TEST"]');
  await card.waitFor({state:'visible'});assert.equal(await card.locator('h4').innerText(),'Material privado '+label);
  await card.getByRole('button',{name:'Abrir imagem'}).click();
  const preview=p.locator('#imageDialog[open]');await preview.waitFor({state:'visible'});assert.ok((await preview.locator('#imgTitle').innerText()).includes('Material privado '+label));
  await p.waitForFunction(()=>window.BMVS41PrivateImageEditor.confirmed);
  assert.deepEqual(await p.evaluate(()=>window.BMVS41PrivateImageEditor.marks),[]);
  const color=label==='A'?'#ffd400':'#202b36';
  await preview.locator('[data-ink-color="'+color+'"]').click();await preview.locator('[data-ink-tool="pen"]').click();
  await preview.locator('#grifo').click();
  await p.waitForFunction(()=>document.getElementById('imgMessage').textContent.includes('gravadas e conferidas'));
  const stored=await p.evaluate(()=>window.BMVS41PrivateImageInk.get('IMG-TEST'));assert.equal(stored.marks.length,1);assert.equal(stored.marks[0].color,color);
  await preview.locator('#imgClose').click();await preview.waitFor({state:'hidden'});
  await card.getByRole('button',{name:'Abrir imagem'}).click();await preview.waitFor({state:'visible'});
  await p.waitForFunction(()=>window.BMVS41PrivateImageEditor.confirmed);
  assert.equal(await p.evaluate(()=>window.BMVS41PrivateImageEditor.marks[0].color),color);
  await preview.locator('#imgClose').click();await preview.waitFor({state:'hidden'});
  await p.evaluate(()=>{const s=document.getElementById('imageSearch');s.value='Inexistente';s.dispatchEvent(new Event('input',{bubbles:true}))});
  await p.waitForFunction(()=>!document.querySelector('#imageRows article[data-private-image-id]'));
  await p.evaluate(()=>{const s=document.getElementById('imageSearch');s.value='IMG-TEST';s.dispatchEvent(new Event('input',{bubbles:true}))});
  await card.waitFor({state:'visible'});
  assert.ok(await p.evaluate(()=>window.BancoMestreVisualizarCardV050.showId('CARD-9901')));
  await p.locator('#bmCardPeekV050 .bm-v050-peek-reveal').click();
 }
 assert.deepEqual(f.writes.filter(x=>x.payload.schema==='BM-IMAGE-INK/1').map(x=>[x.parent,x.payload.marks[0].color]).sort(),[['rootA','#ffd400'],['rootB','#202b36']]);
 console.log('Galeria e editor original: marcações privadas persistidas e reabertas em dois perfis.');
 for(const [p,label] of [[oldA,'A'],[oldB,'B']]){
  await p.evaluate(()=>window.BancoMestreVisualizarCardV050.close());
  await p.locator('#bm240-study-tab').click();
  await p.locator('#controle-estudos.active').waitFor({state:'visible'});
  await p.waitForFunction(()=>window.BMVS41StudyControl?.confirmed&&window.BM240ControlApp?.taxonomyCount);
  const subject=await p.evaluate(label=>window.BM240ControlApp.createSubject('Disciplina privada '+label),label);
  const root=p.locator('#bm240-native-host');
  await root.locator('#bm252-main-nav [data-group="organizar"]').click();
  await root.locator('#bm320-organizar-nav [data-view="execucao"]').click();
  await root.locator('#registro.active #sessionForm').waitFor({state:'visible'});
  await root.locator('#sessionSubject').selectOption(subject);
  await root.locator('#sessionMinutes').fill(label==='A'?'30':'45');
  await root.locator('#sessionQuestions').fill('10');await root.locator('#sessionCorrect').fill('8');
  await root.locator('#sessionSubmit').click();
  await p.waitForFunction(()=>window.BMVS41StudyControl.confirmed&&window.BM240ControlApp.status.sessions===1);
  const result=await p.evaluate(()=>window.BMVS41PrivateStudy.read());assert.equal(result.data.sessions.length,1);assert.equal(result.data.sessions[0].minutes,label==='A'?30:45);
  assert.ok(result.data.subjects.some(x=>x.name==='Disciplina privada '+label));assert.ok(!result.data.subjects.some(x=>x.name==='Disciplina privada '+(label==='A'?'B':'A')));
  assert.ok(await p.evaluate(()=>window.BancoMestreVisualizarCardV050.showId('CARD-9901')));
  await p.locator('#bmCardPeekV050 .bm-v050-peek-reveal').click();
 }
 console.log('Controle original: disciplinas e registro manual individuais confirmados no Drive simulado.');
 await oldA.evaluate(()=>window.BancoMestreVisualizarCardV050.close());
 await oldA.locator('#bm240-study-tab').click();
 const studyRoot=oldA.locator('#bm240-native-host');
 await studyRoot.locator('#bm252-main-nav [data-group="organizar"]').click();
 await studyRoot.locator('#bm320-organizar-nav [data-view="execucao"]').click();
 const subjectId=await oldA.evaluate(async()=>{const d=await window.BMVS41PrivateStudy.read();return d.data.subjects.find(x=>x.name==='Disciplina privada A').id});
 await oldA.waitForFunction(id=>[...document.getElementById('bm241-subject').options].some(x=>x.value===id),subjectId);
 await oldA.locator('#bm241-subject').selectOption(subjectId);
 await oldA.locator('#bm241-start').click();
 await oldA.waitForFunction(()=>window.BMVS41StudyControl.confirmed&&window.BM240ControlApp.timer.running);
 const initialTimer=await oldA.evaluate(async()=> (await window.BMVS41PrivateStudy.read()).data.activeTimer);
 const reopened=await a.newPage();await reopened.goto(url+'/index.html#controle-estudos');
 await reopened.waitForFunction(()=>window.BMVS41StudyControl?.confirmed&&window.BM240ControlApp.timer.running);
 assert.equal(await reopened.evaluate(async()=> (await window.BMVS41PrivateStudy.read()).data.activeTimer.sessionId),initialTimer.sessionId);
 await reopened.waitForFunction(()=>window.BM240ControlApp.timer.elapsedMs>=1000);
 await reopened.locator('#bm241-pause').click();
 await reopened.waitForFunction(()=>window.BMVS41StudyControl.confirmed&&!window.BM240ControlApp.timer.running);
 const paused=await reopened.evaluate(async()=> (await window.BMVS41PrivateStudy.read()).data.activeTimer);
 assert.ok(paused&&paused.elapsed>=1000&&!paused.running);
 await reopened.locator('#bm241-save').click();
 await reopened.waitForFunction(()=>window.BMVS41StudyControl.confirmed&&window.BM240ControlApp.status.sessions===2);
 const finished=await reopened.evaluate(()=>window.BMVS41PrivateStudy.read());
 assert.equal(finished.data.activeTimer,null);
 assert.equal(finished.data.sessions.filter(x=>x.id===initialTimer.sessionId).length,1);
 await reopened.close();
 await oldA.evaluate(()=>window.BMVS41StudyControl.refresh());
 assert.equal(await oldA.evaluate(()=>window.BM240ControlApp.timer.running),false);
 await oldA.evaluate(()=>window.BancoMestreVisualizarCardV050.showId('CARD-9901'));await oldA.locator('#bmCardPeekV050 .bm-v050-peek-reveal').click();
 console.log('Cronômetro: recuperação em nova aba na mesma sessão, pausa e encerramento confirmados, sem duplicação.');
 const before=f.requests.length;
 await oldA.evaluate(()=>window.dispatchEvent(new Event('focus')));await oldA.waitForTimeout(300);assert.equal(f.requests.length,before,'checagem de sessão não consulta Drive');
 const reloaded=oldA.waitForEvent('framenavigated',{predicate:frame=>frame===oldA.mainFrame(),timeout:15000});
 assert.equal((await logout(a)).status(),200);await oldA.evaluate(()=>window.dispatchEvent(new Event('focus'))).catch(()=>{});await reloaded;await oldA.waitForLoadState('domcontentloaded');
 assert.ok(!(await oldA.locator('body').innerText()).includes('Resposta privada A'));assert.equal(await oldA.evaluate(()=>typeof loadCards),'undefined');await oldA.locator('#login').waitFor({state:'visible'});
 assert.ok((await oldB.locator('#bmCardPeekV050 .bm-v050-peek-answer').innerText()).includes('Resposta privada B'));
 await oldA.close();await oldB.close();await open(a,'X');await open(b,'B');
 assert.equal((await login(a,'B')).status(),200);await open(a,'B');
 assert.equal((await logout(a)).status(),200);assert.equal((await logout(b)).status(),200);
 await Promise.all([a.close(),b.close()]);
 console.log('Login, sessões simultâneas, logout e troca de perfil após nova abertura: aprovados.');
}finally{await browser.close();server.close()}

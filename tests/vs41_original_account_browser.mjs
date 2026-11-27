// Real original document, no intermediary or iframe. Google is simulated for repeatability.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {fixture} from './vs41_browser_account_fixture.mjs';
const out=process.argv[2]||'/tmp/bm-original-account',base='https://carlosemichelon.github.io/concurso/';
const source=fs.readFileSync('index.html','utf8'),built=fs.readFileSync(path.join(out,'index.html'),'utf8');
const css=s=>[...s.matchAll(/<link\b[^>]*rel=["']stylesheet["'][^>]*>/g)].map(m=>m[0]);
assert.deepEqual(css(built),css(source),'As folhas de estilo originais devem permanecer idênticas');
const browser=await chromium.launch({headless:true});
try{
 const context=await browser.newContext({viewport:{width:1366,height:900}}),page=await context.newPage();
 const errors=[],networkWrites=[],dataRequests=[];let account='A',snapshotDownloads=0;const reads={gaps:0,schedule:0};
 page.on('pageerror',e=>errors.push(e.message));
 const writes=[];const fixtures={A:fixture('A',{writable:true,writes}),B:fixture('B',{writable:true,writes})};
 await page.route('**/*',async route=>{
  const req=route.request(),url=new URL(req.url());
  if(url.href==='https://accounts.google.com/gsi/client')return route.fulfill({contentType:'application/javascript',body:'window.google={accounts:{oauth2:{hasGrantedAllScopes:()=>true,initTokenClient:c=>({requestAccessToken(o){window.__prompt=o.prompt;if(window.__bmTestPopupError){c.error_callback({type:"popup_failed_to_open"});return;}c.callback({access_token:'+JSON.stringify(account)+',expires_in:3600})}})}}};'});
  if(url.origin==='https://www.googleapis.com'){
   if(req.method()==='OPTIONS')return route.fulfill({status:204,headers:{'access-control-allow-origin':'*','access-control-allow-headers':'authorization,content-type,if-match','access-control-allow-methods':'GET,POST,PATCH,OPTIONS'}});
   const key=req.headers().authorization?.slice(7);assert.equal(key,account);
   if(url.pathname.endsWith('/snapshotA')&&url.searchParams.get('alt')==='media')snapshotDownloads++;
   if(req.method()==='GET'&&url.searchParams.get('q')?.includes('bm_lacunas_v242'))reads.gaps++;
   if(req.method()==='GET'&&url.searchParams.get('q')?.includes('Delta de estudo e cartões aprovados'))reads.schedule++;
   if(req.method()!=='GET'){networkWrites.push({account:key,method:req.method(),url:url.href});assert.ok(url.pathname.startsWith('/upload/drive/v3/files'));}
   if(url.pathname.endsWith('/about')){await page.waitForFunction(()=>window.BM316DriveProgress?.pending>0);}
   const res=await fixtures[key](req.url(),{method:req.method(),headers:{Authorization:'Bearer '+key},body:req.postData()});
   return route.fulfill({status:res.status,contentType:res.headers.get('Content-Type')||'application/json',body:Buffer.from(await res.arrayBuffer()),headers:{'access-control-allow-origin':'*'}});
  }
  if(url.origin==='https://cdnjs.cloudflare.com'&&/\/pdf(?:\.worker)?\.min\.js$/.test(url.pathname)){
   const file=path.join(process.cwd(),'node_modules/pdfjs-dist/build',path.basename(url.pathname));return route.fulfill({contentType:'application/javascript',body:fs.readFileSync(file),headers:{'access-control-allow-origin':'*'}});
  }
  if(url.href.startsWith(base)){
   const rel=url.pathname.slice(new URL(base).pathname.length)||'index.html';
   if(/(?:catalog_snapshot_|cards_drive_sync_|layers_public_).*\.json$/.test(rel)){dataRequests.push(rel);return route.abort();}
   const f=fs.existsSync(path.join(out,rel))?path.join(out,rel):path.join(process.cwd(),rel);
   if(!fs.existsSync(f)||!fs.statSync(f).isFile())return route.fulfill({status:404});
   const type=rel.endsWith('.css')?'text/css':/\.(?:mjs|js)$/.test(rel)?'application/javascript':rel.endsWith('.json')?'application/json':rel.endsWith('.svg')?'image/svg+xml':'text/html';
   return route.fulfill({contentType:type,body:fs.readFileSync(f)});
  }
  return route.abort();
 });
 for(const a of ['A','B']){
  account=a;
  await page.goto(base+'index.html',{waitUntil:'domcontentloaded'});
  const btn=page.locator('#bm239-drive-action');
  await page.waitForFunction(()=>document.getElementById('bm239-drive-action')?.textContent==='Usuário / Login'&&!document.getElementById('bm239-drive-action').disabled);
  assert.equal(await page.locator('#bm-vs41-chat-destination,#bm-vs41-logout,#full-portal').count(),0);
  assert.equal(await page.locator('#bmAccountDriveLink').isVisible(),false);
  assert.equal(await page.locator('#bmAccountExport').isVisible(),false);
  const verifyHeader=async()=>{const actual=await btn.evaluate(b=>({text:b.textContent,pseudo:getComputedStyle(b,'::after').content,before:getComputedStyle(b,'::before').content,font:parseFloat(getComputedStyle(b).fontSize)}));assert.equal(actual.pseudo,'none');assert.equal(actual.before,'none');assert.ok(actual.font>=10);assert.equal(await page.locator('header nav a.bm343-launch,header nav [data-bm343-proposals],header nav [data-petro28-link],header nav [data-petro24-link],header nav [data-bm348-audit]').count(),0);assert.ok(await page.locator('#bmAccountSettings').isVisible());return actual};
  await page.setViewportSize({width:990,height:600});
  assert.equal((await verifyHeader()).text,'Usuário / Login');
  await page.setViewportSize({width:1366,height:900});
  assert.equal(await page.evaluate(()=>cards.length),0);
  await page.locator('#bmAccountSettings').click();
  assert.ok(await page.locator('#bmAccountSettingsDialog').isVisible());
  const settingsBox=await page.locator('#bmAccountSettingsDialog').boundingBox();assert.ok(settingsBox.width<=441&&settingsBox.height<520,'Configurações deve ser compacta');
  if(a==='A'){
   await page.locator('#bmAccountRoot').fill('https://example.invalid/folder');
   await page.locator('#bmAccountSettingsSave').click();
   assert.ok((await page.locator('#bmAccountSettingsStatus').innerText()).includes('pasta do Google Drive'));
   await page.locator('#bmAccountRoot').fill('https://drive.google.com/drive/folders/rootA');
   assert.equal(await page.locator('#bmAccountClientId').count(),0);
   await page.locator('#bmAccountCacheEnabled').check();
   await Promise.all([page.waitForEvent('domcontentloaded'),page.locator('#bmAccountSettingsSave').click()]);
   await page.waitForFunction(()=>!document.getElementById('bm239-drive-action').disabled);
   await page.locator('#bmAccountSettings').click();
   assert.equal(await page.locator('#bmAccountRoot').inputValue(),'https://drive.google.com/drive/folders/rootA');
   await page.locator('#bmAccountSettingsCancel').click();
  }else{
   await page.locator('#bmAccountSettingsDefault').click();
   await Promise.all([page.waitForEvent('domcontentloaded'),page.locator('#bmAccountSettingsSave').click()]);
   await page.waitForFunction(()=>!document.getElementById('bm239-drive-action').disabled);
  }
  if(a==='A'){await page.evaluate(()=>{window.__bmTestPopupError=true});await btn.click();await page.waitForFunction(()=>window.BM263SyncPanel?.diagnostic.connection.state==='error');await page.evaluate(()=>window.dispatchEvent(new Event('focus')));assert.match(await page.evaluate(()=>window.BM263SyncPanel.diagnostic.connection.message),/Permita pop-ups/);assert.ok(await btn.isEnabled());await page.evaluate(()=>{window.__bmTestPopupError=false});}
  await btn.click();
  await page.waitForFunction(()=>window.BMVS41Session?.available()===true,{},{timeout:30000});
  assert.equal(await page.evaluate(()=>window.__prompt),'select_account');
  await page.waitForFunction(name=>document.getElementById('bm239-drive-action')?.textContent===name, 'Estudante '+a);
  assert.equal(await page.locator('#bmAccountDriveLink').getAttribute('href'),'https://drive.google.com/drive/folders/root'+a);
  assert.ok(await page.locator('#bmAccountDriveLink').isVisible());
  await page.setViewportSize({width:990,height:600});assert.equal((await verifyHeader()).text,'Estudante '+a);
  assert.ok(await page.locator('#bmAccountExport').isVisible());
  await page.setViewportSize({width:1366,height:900});
  assert.equal(await page.evaluate(()=>window.BMAccountInfo().name),'Estudante '+a);
  await page.evaluate(()=>loadCards());
  assert.deepEqual(await page.evaluate(()=>cards.map(c=>c.front)),['Pergunta privada '+a]);
  if(a==='A'){
   assert.equal(snapshotDownloads,1);
   await page.locator('#bmAccountSettings').click();await page.waitForFunction(()=>document.getElementById('bm239-drive-action')?.textContent==='Usuário / Login'&&!document.getElementById('bm239-drive-action').disabled);
   await btn.click();await page.waitForFunction(()=>window.BMVS41Session?.available()===true);await page.evaluate(()=>loadCards());
   assert.equal(snapshotDownloads,1,'Segunda conexão deve reutilizar IndexedDB');assert.deepEqual(await page.evaluate(()=>cards.map(c=>c.front)),['Pergunta privada A']);
  }
  assert.ok((await page.locator('#cardCount').innerText()).includes('1 cartões ativos'));
  assert.ok(!(await page.locator('#bm119PublicSource').innerText()).includes('Catálogo público'));
  for(const notice of await page.locator('#bm119HomeSource,#bm119PublicSource,.bm225-drive-auth').all())assert.ok(!(await notice.isVisible()),'Avisos de conexão redundantes devem ficar ocultos');
  assert.ok(await btn.isVisible(),'Login e identidade continuam disponíveis no cabeçalho');
  assert.equal(await page.locator('[data-bm343-proposals]').count(),0);
  assert.ok(await page.locator('#bmAccountExport').isVisible());
  await page.locator('#bmAccountExport').click();
  assert.ok(await page.locator('#bmAccountExportDialog').isVisible());
  assert.equal(await page.locator('#bmAccountExportEmail').innerText(),a.toLowerCase()+'@example.invalid');
  assert.equal(await page.locator('#bmAccountStudyObjective').count(),0);
  const exportBox=await page.locator('#bmAccountExportDialog').boundingBox();assert.ok(exportBox.width<=441&&exportBox.height<380,'Exportação compacta');
  await page.setViewportSize({width:390,height:844});
  await page.waitForFunction(()=>{const r=document.getElementById('bmAccountExportDialog').getBoundingClientRect();return r.left>=4&&r.right<=innerWidth-4&&r.height<500},{},{timeout:3000}).catch(async()=>{const d=await page.locator('#bmAccountExportDialog').evaluate(e=>{const r=e.getBoundingClientRect(),s=getComputedStyle(e);return {width:r.width,height:r.height,viewport:[innerWidth,innerHeight],css:[s.width,s.height,s.minWidth,s.minHeight,s.position,s.inset,s.display],childHeight:e.firstElementChild.getBoundingClientRect().height}});throw Error('Exportação mobile: '+JSON.stringify(d))});
  await page.setViewportSize({width:1366,height:900});
  const downloadPromise=page.waitForEvent('download');
  await page.locator('#bmAccountExportSave').click();
  const download=await downloadPromise,filename=await download.path();
  const exported=JSON.parse(fs.readFileSync(filename,'utf8'));
  assert.equal(exported.format,'BancoMestreChatGPTExport');
  assert.equal(exported.data.cards[0].front,'Pergunta privada '+a);
  assert.equal(exported.data.study.data.subjects[0].name,'Disciplina '+a);
  assert.equal(exported.account.email,a.toLowerCase()+'@example.invalid');
  assert.equal(exported.study_objective,null);
  assert.equal(exported.data.review_schedule.records[0].due,'2026-11-28');
  assert.equal(exported.data.methodology.text,'Metodologia integral '+a);
  assert.equal(exported.data.operational_guide.text,'Guia integral '+a);
  assert.equal(exported.complete,true);
  assert.ok(exported.sections.includes('pdf_highlights')&&exported.sections.includes('image_ink'));
  assert.ok(!Object.hasOwn(exported,'token')&&!Object.hasOwn(exported,'email')&&!Object.hasOwn(exported,'clientId'));
  await page.locator('#bmAccountExportCancel').click();
  console.log('Conta '+a+': pacote exportado somente da conta selecionada.');
  // Exercise the original writing workshop, not merely a top-level DOM placeholder.
  await page.locator('header nav button[data-page=redacao]').click();
  await page.waitForFunction(()=>{const f=document.getElementById('bm302-redacao-original');return f?.contentWindow?.__bmWritingIsolated===true&&f.contentDocument?.title.includes('Redação V296')},{},{timeout:30000});
  assert.ok(await page.locator('#bm302-redacao-shell').isVisible());
  await page.waitForFunction(()=>document.getElementById('bm302-redacao-original')?.contentDocument?.documentElement.dataset.bm306Theme==='portal');
  const frame=page.frameLocator('#bm302-redacao-original');
  assert.ok(await frame.locator('#aba-treino').count());
  await page.locator('#bm302-redacao-original').evaluate((f,a)=>{f.contentWindow.localStorage.setItem('BM_LAYOUT_TEST',a)},a);
  assert.equal(await page.evaluate(()=>localStorage.getItem('BM_LAYOUT_TEST')),null);
  assert.ok(await page.locator('#bmWritingSaveDrive').isVisible());
  assert.ok((await page.locator('.bm-writing-toolbar').boundingBox()).height<=55,'Barra de Redação compacta');
  await page.locator('#bm302-redacao-original').evaluate((f,a)=>{f.contentWindow.localStorage.setItem('treino_teste',JSON.stringify({resposta:'Rascunho '+a}));f.contentWindow.localStorage.setItem('treino_indice','["treino_teste"]')},a);
  if(a==='A'){await page.locator('#bmWritingSaveDrive').click();await page.waitForFunction(()=>document.getElementById('bmWritingNotice').textContent.includes('gravado e conferido'));}
  await page.locator('#bm240-study-tab').click();
  assert.equal(await page.locator('#bm302-redacao-shell').isVisible(),false);
  assert.ok(await page.locator('#controle-estudos').isVisible());
  await page.locator('header nav button[data-page=redacao]').click();
  assert.equal(await page.locator('#bm302-redacao-original').evaluate(f=>f.contentWindow.localStorage.getItem('BM_LAYOUT_TEST')),a);
  await page.locator('header nav button[data-page=cartoes]').click();
  assert.equal(await page.locator('#bm302-redacao-shell').isVisible(),false);
  const cardPanel=await page.locator('#cartoes>.panel').boundingBox();assert.ok((await page.locator('#bm382StudyStart').boundingBox()).height<=90,'Faixa de estudo compacta');
  await page.locator('#bm242-nav').click();await page.locator('#lacunas>.bm242-shell').waitFor({state:'visible'});
  const gapsPanel=await page.locator('#lacunas>.bm242-shell').boundingBox();assert.ok(Math.abs(gapsPanel.width-cardPanel.width)<=2,'Lacunas deve ter a largura de Flashcards: '+JSON.stringify({gaps:gapsPanel,cards:cardPanel}));
  await page.waitForFunction(()=>window.BM242LacunasDrive?.lastResult?.state==='downloaded');
  const gapReads=reads.gaps;
  await page.evaluate(async()=>{await window.BM242LacunasDrive.sync();await window.BM242LacunasDrive.sync()});
  assert.equal(reads.gaps,gapReads,'Lacunas: reuso sem consulta remota');
  await page.locator('#bm242-refresh').click();
  await page.waitForFunction(()=>document.getElementById('bm242-refresh')?.disabled===false);
  assert.ok(reads.gaps>gapReads,'Atualização explícita consulta o mestre');
  await page.locator('header nav button[data-page=calendario]').click();
  await page.waitForFunction(()=>document.getElementById('calendario')?.dataset.bm411Ready==='true');
  const planReads=reads.schedule;assert.ok(planReads>0);
  const gapOptions=await page.locator('#bm242-type option').allTextContents();assert.ok(gapOptions.every(x=>/\(\d+\)$/.test(x)),'Filtros exibem quantidades');
  await page.locator('header nav button[data-page=cartoes]').click();
  await page.locator('header nav button[data-page=calendario]').click();
  await page.evaluate(()=>window.BM141Calendar.open());
  await page.evaluate(async()=>{await window.BM141Calendar.refreshPrivate();await window.BM141Calendar.refreshPrivate();await window.BM316SrsJournal.refresh()});
  assert.equal(reads.schedule,planReads,'Planejamento: reabrir e iniciar fila preservam agenda confirmada');
  await page.evaluate(()=>window.BM141Calendar.open(true));
  assert.ok(reads.schedule>planReads,'Atualização explícita consulta o SRS');
  console.log('Conta '+a+': Redação V296 original e troca de seções confirmadas.');
  await page.locator('#bm240-study-tab').click();
  await page.locator('#bm240-native-host #bm252-main-nav').waitFor({state:'visible',timeout:30000});
  await page.waitForFunction(()=>window.BMVS41StudyControl?.confirmed===true);
  assert.equal(await page.locator('#bm240-native-host').getAttribute('aria-busy'),null);
  assert.equal(await page.locator('#bm240-native-host [data-bm240-progress]').count(),0);
  await page.locator('#bm240-native-host #bm252-main-nav button[data-group="relatorios"]').click();
  await page.locator('#bm240-native-host main #painel').waitFor({state:'visible',timeout:10000});
  assert.deepEqual(await page.evaluate(()=>window.BMVS41StudyControl.snapshot().subjects.map(s=>s.name).filter(x=>x.startsWith('Disciplina '))),['Disciplina '+a]);
  console.log('Conta '+a+': Controle de Estudos confirmado e relatórios visíveis.');
  assert.ok(await page.evaluate(()=>window.BancoMestreVisualizarCardV050.showId('CARD-9901')));
  await page.locator('#bmCardPeekV050 .bm-v050-peek-reveal').click();
  await page.locator('#bmCardPeekV050 .bm349-reading').waitFor({state:'visible'});
  assert.equal(await page.locator('#bmCardPeekV050 .historic-module').count(),11);
  assert.ok((await page.locator('#bmCardPeekV050 .bm349-reading').innerText()).includes('Resposta privada '+a));
  await page.evaluate(()=>window.BancoMestreVisualizarCardV050.close());
  const docs=await page.evaluate(()=>window.BMVS41PrivatePdfs.list());
  assert.equal(docs[0].id,'pdf'+a);
  await page.evaluate(async doc=>{await window.BMVS41PrivatePdfs.preview(doc);const blob=await window.BMVS41PrivateMedia.read(undefined,doc.id);await window.BMVS41PrivatePdfEditor.open(doc,blob)},docs[0]);
  assert.ok(await page.evaluate(()=>window.BMVS41PrivatePdfEditor.confirmed));
  assert.ok(await page.locator('#pdfMarker').isEnabled(),'Grifos confirmados devem liberar a ferramenta de edição');
  assert.ok(await page.locator('#pdfDialog').evaluate(d=>d.open));
  const pdfMarks=await page.evaluate(id=>window.BMVS41PrivateAnnotations.get(id,1),docs[0].id);
  assert.deepEqual(pdfMarks.marks,[]);
  if(a==='A'){
   const mark={id:'browser-test-pdf-A',type:'highlight',color:'#ffee00',rects:[[0,0,0.5,0.1]]};
   const saved=await page.evaluate(({id,row,mark})=>window.BMVS41PrivateAnnotations.save(id,1,{event_id:crypto.randomUUID(),hash:row.hash,previous:row.revision,marks:[mark]}),{id:docs[0].id,row:pdfMarks,mark});
   assert.deepEqual(saved.marks,[mark]);
   assert.deepEqual((await page.evaluate(id=>window.BMVS41PrivateAnnotations.get(id,1),docs[0].id)).marks,[mark]);
  }
  await page.locator('#bmV056ClosePDF').click();
  await page.waitForFunction(()=>!document.getElementById('pdfDialog').open);
  const images=await page.evaluate(()=>window.BMVS41PrivateImages.list());assert.equal(images[0].id,'img'+a);
  await page.evaluate(img=>window.BMVS41PrivateImageEditor.open(img),images[0]);
  assert.ok(await page.evaluate(()=>window.BMVS41PrivateImageEditor.confirmed));
  const imageMarks=await page.evaluate(id=>window.BMVS41PrivateImageInk.get(id),images[0].id);
  assert.deepEqual(imageMarks.marks,[]);
  if(a==='A'){
   const mark={id:'browser-test-image-A',type:'pen',color:'#ff0000',size:3,points:[[0.1,0.2,0.5],[0.3,0.4,0.5]]};
   const saved=await page.evaluate(({id,row,mark})=>window.BMVS41PrivateImageInk.save(id,{event_id:crypto.randomUUID(),hash:row.hash,previous:row.revision,marks:[mark]}),{id:images[0].id,row:imageMarks,mark});
   assert.deepEqual(saved.marks,[mark]);
   assert.deepEqual((await page.evaluate(id=>window.BMVS41PrivateImageInk.get(id),images[0].id)).marks,[mark]);
  }
  await page.locator('#imgClose').click();
  console.log('Conta '+a+': PDF e imagem abertos nos editores originais.');
  await page.setViewportSize({width:390,height:844});
  assert.ok(await btn.isVisible());
  await page.setViewportSize({width:1366,height:900});
  // Account button opens settings; Logout destroys the prior realm.
  await btn.click();assert.ok(await page.locator('#bmAccountSettingsDialog').isVisible());
  await page.locator('#bmAccountSettingsCancel').click();
  assert.equal(await page.locator('#bmAccountSettings').innerText(),'Logout');
  await page.locator('#bmAccountSettings').click();
  await page.waitForFunction(()=>document.getElementById('bm239-drive-action')?.textContent==='Usuário / Login');
  assert.equal(await page.evaluate(()=>window.BMVS41Session.available()),false);
 }
 assert.deepEqual(dataRequests,[]);
 assert.equal(networkWrites.length,3);assert.ok(networkWrites.every(x=>x.account==='A'&&x.method==='POST'));
 assert.equal(writes.length,3);assert.ok(writes.every(x=>x.account==='A'));
 assert.ok(writes.some(x=>x.name==='BancoMestre_Grifos_Mestre.json'));
 assert.ok(writes.some(x=>x.name?.startsWith('BM_IMAGE_INK_')));
 assert.deepEqual(errors,[]);
 console.log('Original portal: header Google account selection, cards and study control from two accounts, no iframe, no public catalogue, verified private annotation writes only in account A.');
}catch(e){console.error('Falha no teste de interface:',e.message);throw e}finally{await browser.close()}

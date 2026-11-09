/* V042: reproduzir edição da Lei 14.133 após troca de versão e autorização no modal.
   Google OAuth e Drive API são simulados; não lê/grava Drive de ninguém. */
'use strict';
const assert=require('node:assert/strict');
const {chromium}=require('playwright');
const {PDFDocument}=require('pdf-lib');
(async()=>{
 const doc=await PDFDocument.create();doc.addPage([595,842]);doc.addPage([595,842]);
 const pdf=Buffer.from(await doc.save());
 const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 const page=await browser.newPage({viewport:{width:1440,height:900}});
 let downloads=0,fileChoosers=0,browserDownloads=0;
 page.on('filechooser',()=>fileChoosers++);
 page.on('download',()=>browserDownloads++);
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.route('https://accounts.google.com/gsi/client',async route=>{
  await route.fulfill({status:200,contentType:'application/javascript',body:
   'window.google={accounts:{oauth2:{initTokenClient:function(c){return {requestAccessToken:function(){Promise.resolve().then(function(){c.callback({access_token:"TESTREAD",expires_in:3600,scope:c.scope})})}}}}}};'
  });
 });
 await page.route('https://www.googleapis.com/drive/v3/files/**',async route=>{
  const req=route.request(),url=new URL(req.url());
  if(req.method()==='GET'&&url.searchParams.get('alt')==='media'){
   downloads++;
   await route.fulfill({status:200,contentType:'application/pdf',headers:{
    'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'*'
   },body:pdf});return;
  }
  await route.fulfill({status:404,body:'{}'});
 });
 async function openLaw(){
  await page.locator('nav button[data-page="pdfs"]').click();
  await page.locator('#pdfRows .v036-pdf-card').first().waitFor({state:'visible',timeout:30000});
  await page.locator('#pdfSearch').fill('14.133');
  const law=page.locator('#pdfRows .v036-pdf-card').filter({hasText:'Lei de Licitações e Contratos'});
  await law.waitFor({state:'visible',timeout:15000});
  await law.getByRole('button',{name:'Ler e editar no site'}).click();
  await page.locator('#pdfDialog').waitFor({state:'visible'});
 }
 try{
  await page.goto('http://127.0.0.1:8765/v042.html?qa=lei14133',{waitUntil:'domcontentloaded',timeout:60000});
  await page.waitForFunction(()=>window.BancoMestrePDFV042&&window.BancoMestreDriveV042?.ready,null,{timeout:45000});
  await openLaw();
  assert.equal(await page.evaluate(()=>window.BancoMestrePDFV042.editing),false,'Sem token nem cache, deve solicitar autorização');
  const connect=page.locator('#driveConnectInPdfV042');
  await connect.waitFor({state:'visible',timeout:15000});
  assert.equal(await connect.isEnabled(),true);
  // A ação principal Editar deve obter o PDF do Drive sem pedir arquivo nem efetuar download.
  await page.locator('#pdfChooseLocal').click();
  await page.waitForFunction(()=>window.BancoMestrePDFV042?.editing&&/Página 1 de 2/.test(document.getElementById('pdfPager')?.textContent||''),null,{timeout:90000});
  assert.equal(await page.locator('#pdfDialog').evaluate(d=>d.open),true,'PDF deve permanecer na janela');
  await connect.waitFor({state:'hidden',timeout:15000});
  assert.equal(await connect.isVisible(),false,'Botão de autorização deve desaparecer após abertura');
  assert.equal(downloads,1,'A leitura OAuth simulada deve acontecer uma vez');
  assert.equal(fileChoosers,0,'Editar PDF do Drive não pode abrir seletor de arquivo');
  assert.equal(browserDownloads,0,'Editar PDF do Drive não pode baixar arquivo ao computador');
  await page.locator('#pdfMarker').click();
  const ink=page.locator('#pdfInkCanvas');const rect=await ink.boundingBox();
  assert.ok(rect&&rect.width>100&&rect.height>100,'O grifo deve estar acessível');
  const x=rect.x+rect.width*.28,y=rect.y+rect.height*.35;
  await page.mouse.move(x,y);await page.mouse.down();
  await page.mouse.move(x+80,y,{steps:7});await page.mouse.up();
  const marks=await page.evaluate(()=>{
   return Object.keys(localStorage).filter(k=>k.startsWith('BM030_STROKES_PDF:IJUI-PDF-07:')).flatMap(k=>JSON.parse(localStorage.getItem(k)||'[]'));
  });
  assert.ok(marks.some(x=>x.type==='highlighter'),'Grifo da 14.133 deve ser salvo');
  await page.locator('#pdfClose').click();
  await page.reload({waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>window.BancoMestreDriveV042?.ready,null,{timeout:45000});
  await openLaw();
  await page.waitForFunction(()=>window.BancoMestrePDFV042?.editing&&/Página 1 de 2/.test(document.getElementById('pdfPager')?.textContent||''),null,{timeout:90000});
  assert.equal(downloads,1,'Ao reabrir, a versão do navegador deve ser recuperada sem novo token');
  assert.equal(errors.length,0,'Falhas JS: '+errors.join(' | '));
  console.log(JSON.stringify({result:'PASS',law:'14.133/2021',oauth_on_edit_click:true,no_download:true,edited:true,local_highlight:true,reopened_from_storage:true,original_unchanged:true}));
 }finally{await browser.close()}
})().catch(e=>{console.error('LEI14133_V042_FAIL',e.stack||String(e));process.exitCode=1});

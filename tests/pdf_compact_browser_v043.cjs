/* V043 — teste real de layout em Chromium (1440 e 390 px), Drive/OAuth simulados.
   Confirma área do PDF, botões compactos, persistência, grifo e exportação. */
'use strict';
const assert=require('node:assert/strict');
const {chromium}=require('playwright');
const {PDFDocument}=require('pdf-lib');
(async()=>{
 const pdfDoc=await PDFDocument.create();
 pdfDoc.addPage([595,842]);pdfDoc.addPage([595,842]);
 const pdf=Buffer.from(await pdfDoc.save());
 const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 const results=[];
 async function inspect({width,height,version}){
  const page=await browser.newPage({viewport:{width,height},acceptDownloads:true});
  const jsErrors=[],fileChoosers=[];page.on('pageerror',e=>jsErrors.push(e.message));
  page.on('filechooser',()=>fileChoosers.push('opened'));
  await page.route('https://accounts.google.com/gsi/client',async route=>{
   await route.fulfill({status:200,contentType:'application/javascript',body:
    'window.google={accounts:{oauth2:{initTokenClient:function(c){return {requestAccessToken:function(){Promise.resolve().then(function(){c.callback({access_token:"MOCK_READ",expires_in:3600,scope:c.scope})})}}}}}};'
   });
  });
  await page.route('https://www.googleapis.com/drive/v3/files/**',async route=>{
   const req=route.request(),url=new URL(req.url());
   if(req.method()==='GET'&&url.searchParams.get('alt')==='media'){
    await route.fulfill({status:200,contentType:'application/pdf',headers:{
     'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'*'
    },body:pdf});return;
   }
   await route.fulfill({status:404,body:'{}'});
  });
  try{
   await page.goto('http://127.0.0.1:8765/'+version+'.html?ci=pdfcompact',{waitUntil:'domcontentloaded',timeout:60000});
   await page.waitForFunction(()=>window.BancoMestrePDFV042&&window.BancoMestreDriveV042?.ready,null,{timeout:60000});
   if(version==='v043')await page.waitForFunction(()=>window.BancoMestreCompactV043?.ready,null,{timeout:12000});
   await page.locator('nav button[data-page="pdfs"]').click();
   await page.locator('#pdfRows .v036-pdf-card').first().waitFor({state:'visible',timeout:30000});
   await page.locator('#pdfSearch').fill('14.133');
   const law=page.locator('#pdfRows .v036-pdf-card').filter({hasText:'Lei de Licitações e Contratos'});
   await law.waitFor({state:'visible',timeout:15000});
   await law.getByRole('button',{name:'Ler e editar no site'}).click();
   await page.locator('#pdfChooseLocal').click();
   await page.waitForFunction(()=>window.BancoMestrePDFV042?.editing&&/Página 1 de 2/.test(document.getElementById('pdfPager')?.textContent||''),null,{timeout:60000});
   const rects=await page.evaluate(()=>{
    const rect=e=>{const r=e.getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height}};
    const dialog=document.querySelector('#pdfDialog');
    const toolbar=document.querySelector('#pdfLocalTools');
    const reader=document.querySelector('#pdfLocalMode');
    const main=document.querySelector('#pdfMainV043');
    return {dialog:rect(dialog),toolbar:rect(toolbar),reader:rect(reader),
      main:main?rect(main):null,scroll:main?main.scrollWidth-main.clientWidth:0,
      buttons:Array.from(toolbar.querySelectorAll('button')).map(b=>({id:b.id,height:b.getBoundingClientRect().height,hidden:b.hidden}))};
   });
   assert.ok(rects.reader.height>250,'A área do PDF deve permanecer ampla: '+JSON.stringify(rects));
   if(version==='v043'){
    const toolbar=page.locator('#pdfMainV043');
    assert.ok(rects.main.height<=46,'Barra principal está alta: '+rects.main.height);
    assert.ok(rects.toolbar.height<=50,'Ferramentas ocupam mais de 50px: '+rects.toolbar.height);
    assert.ok(rects.buttons.find(b=>b.id==='pdfMarker')?.height<=32,'Botão grifar está muito grande');
    assert.ok(rects.buttons.find(b=>b.id==='pdfSaveDriveV042'),'Botão salvar no Drive não pode desaparecer');
    if(width<700)assert.ok(rects.scroll>0,'Celular deve permitir rolagem horizontal das ferramentas');
    const more=page.locator('#pdfMoreV043');
    await more.scrollIntoViewIfNeeded();
    await more.click();
    assert.equal(await more.getAttribute('aria-expanded'),'true');
    assert.equal(await page.locator('#pdfClearPage').isVisible(),true,'Opção limpar página deve estar no menu');
    await more.click();
    assert.equal(await page.locator('#pdfClearPage').isVisible(),false,'Opções adicionais devem recolher');
   }
   if(width>700&&version==='v043'){
    await page.locator('#pdfMarker').click();
    const ink=page.locator('#pdfInkCanvas');await ink.scrollIntoViewIfNeeded();
    const r=await ink.boundingBox();assert.ok(r?.height>100);
    const x=r.x+r.width*.22,y=r.y+r.height*.31;
    await page.mouse.move(x,y);await page.mouse.down();await page.mouse.move(x+90,y,{steps:6});await page.mouse.up();
    const count=await page.evaluate(()=>Object.keys(localStorage).filter(k=>k.startsWith('BM030_STROKES_PDF:IJUI-PDF-07:')).flatMap(k=>JSON.parse(localStorage.getItem(k)||'[]')).filter(m=>m.type==='highlighter').length);
    assert.ok(count>0,'Grifo não foi salvo após compactar controles');
    await page.locator('#pdfUndo').click();
    await page.locator('#pdfRedo').click();
    const download=page.waitForEvent('download',{timeout:60000});
    await page.locator('#pdfExportPDF').click();
    const file=await download;
    assert.ok(file.suggestedFilename().endsWith('_ANOTADO.pdf'),'Exportação PDF indisponível');
    await page.locator('#pdfClose').click();
    await law.getByRole('button',{name:'Ler e editar no site'}).click();
    await page.waitForFunction(()=>window.BancoMestrePDFV042?.editing,null,{timeout:25000});
    const persisted=await page.evaluate(()=>Object.keys(localStorage).filter(k=>k.startsWith('BM030_STROKES_PDF:IJUI-PDF-07:')).flatMap(k=>JSON.parse(localStorage.getItem(k)||'[]')).filter(m=>m.type==='highlighter').length);
    assert.ok(persisted>0,'Grifo deve permanecer após reabrir');
   }
   assert.equal(fileChoosers.length,0,'Editar PDF do Drive não pode pedir arquivo');
   assert.equal(jsErrors.length,0,'Erros inesperados: '+jsErrors.join(' | '));
   const result={version,width,height,mainHeight:rects.main?.height||null,toolbarHeight:rects.toolbar.height,readerHeight:rects.reader.height,
     scrollableButtons:rects.scroll>0,buttons:rects.buttons.length,ok:true};
   results.push(result);return result;
  }finally{await page.close()}
 }
 try{
  const oldDesktop=await inspect({width:1440,height:950,version:'v042'});
  const newDesktop=await inspect({width:1440,height:950,version:'v043'});
  const oldMobile=await inspect({width:390,height:844,version:'v042'});
  const newMobile=await inspect({width:390,height:844,version:'v043'});
  assert.ok(newDesktop.toolbarHeight<oldDesktop.toolbarHeight,'Barra desktop não ficou menor: '+JSON.stringify(results));
  assert.ok(newMobile.toolbarHeight<oldMobile.toolbarHeight,'Barra móvel não ficou menor: '+JSON.stringify(results));
  assert.ok(newMobile.readerHeight>oldMobile.readerHeight,'A área de leitura móvel não aumentou');
  console.log(JSON.stringify({result:'PASS',desktopToolbarBefore:oldDesktop.toolbarHeight,desktopToolbarAfter:newDesktop.toolbarHeight,
    mobileToolbarBefore:oldMobile.toolbarHeight,mobileToolbarAfter:newMobile.toolbarHeight,
    mobileReaderBefore:oldMobile.readerHeight,mobileReaderAfter:newMobile.readerHeight,
    compactButtons:true,advancedMenu:true,highlighter:true,undoRedo:true,pdfExport:true,driveSaveControl:true}));
 }finally{await browser.close()}
})().catch(e=>{console.error('PDF_COMPACT_V043_FAIL',e.stack||String(e));process.exitCode=1});

/* V046: testar interface, transparência real e catálogo de excluídas.
   PDFs e autenticação Drive simulados; nenhuma exclusão real executada. */
'use strict';
const assert=require('node:assert/strict');
const {chromium}=require('playwright');
const {PDFDocument}=require('pdf-lib');
(async()=>{
 const fixture=await PDFDocument.create();
 fixture.addPage([595,842]);fixture.addPage([595,842]);
 const pdf=Buffer.from(await fixture.save());
 const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 const page=await browser.newPage({viewport:{width:1440,height:900},acceptDownloads:true});
 const errs=[],driveRequests=[];page.on('pageerror',e=>errs.push(e.message));
 await page.route('https://accounts.google.com/gsi/client',async route=>route.fulfill({
  status:200,contentType:'application/javascript',
  body:'window.google={accounts:{oauth2:{initTokenClient:function(c){return {requestAccessToken:function(){Promise.resolve().then(function(){c.callback({access_token:"MOCK_READ",expires_in:3600,scope:c.scope})})}}}}}};'
 }));
 await page.route('https://www.googleapis.com/drive/v3/files/**',async route=>{
  const req=route.request(),url=new URL(req.url());
  if(req.method()==='GET'&&url.searchParams.get('alt')==='media'){
   driveRequests.push({method:req.method(),id:url.pathname.split('/').pop()});
   await route.fulfill({status:200,contentType:'application/pdf',headers:{
    'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'*'
   },body:pdf});return;
  }
  await route.fulfill({status:404,body:'{}'});
 });
 const waitImage=()=>page.waitForFunction(()=>window.BancoMestreAtlasV045?.indexed&&window.BancoMestreAtlasV045?.total===270,null,{timeout:45000});
 const imageGeometry=()=>page.evaluate(()=>{
  const stage=document.querySelector('#imageStage').getBoundingClientRect();
  const side=document.querySelector('#imageDialog .editor-tools').getBoundingClientRect();
  return {stage:{x:stage.x,y:stage.y,width:stage.width,height:stage.height},
   side:{x:side.x,y:side.y,width:side.width,height:side.height}}
 });
 try{
  await page.goto('http://127.0.0.1:8765/index.html#imagens',{waitUntil:'domcontentloaded',timeout:60000});
  await page.waitForURL(/v046\.html\?versao=V046.*#imagens/,{timeout:25000});
  await page.waitForFunction(()=>window.BancoMestreLayoutV046?.ready&&window.BancoMestreLayoutV046?.heroRemoved,null,{timeout:25000});
  await waitImage();
  const header=await page.evaluate(()=>{
   const stats=document.querySelector('header .head>.bm-v046-header-stats');
   return {hero:!!document.querySelector('main>.hero'),statsInHeader:!!stats,
    stats:[...(stats?.querySelectorAll('b')||[])].map(x=>x.textContent),
    height:stats?.getBoundingClientRect().height,
    pdfSidebar:window.BancoMestreLayoutV046?.pdfSidebar,
    imageSidebar:window.BancoMestreLayoutV046?.imageSidebar};
  });
  assert.equal(header.hero,false);
  assert.equal(header.statsInHeader,true);
  assert.ok(header.height<60,'Cabeçalho deve ter indicadores pequenos');
  assert.equal(header.pdfSidebar,true);
  assert.equal(header.imageSidebar,true);
  assert.equal(header.stats[2],'270');

  await page.evaluate(()=>api.setStatus('IMG-001','hidden'));
  await page.evaluate(()=>api.setStatus('IMG-P10-02','hidden'));
  await page.waitForFunction(()=>document.querySelector('header .bm-v046-header-stats .stat:nth-child(3) b')?.textContent==='268',null,{timeout:18000});
  const exclusions=await page.evaluate(()=>window.BancoMestreDriveExclusionsV046.preview());
  assert.equal(exclusions.count,2);
  assert.ok(exclusions.items.find(x=>x.id==='IMG-001'&&x.needs_identity_check===true),'Associação por nome não pode ser tratada como verificada');
  assert.ok(exclusions.items.find(x=>x.id==='IMG-P10-02'&&x.needs_identity_check===false),'ID catalogado de P10 deve estar no relatório');
  assert.ok(exclusions.items.every(x=>x.drive_file_id===null||/^[A-Za-z0-9_-]+$/.test(x.drive_file_id)));
  assert.equal(driveRequests.length,0,'Preparar exclusões jamais pode apagar ou acessar arquivos por API');

  await page.locator('#imageSearch').fill('IMG-002');
  await page.locator('#imageRows article.card').first().waitFor({state:'visible',timeout:15000});
  await page.locator('#imageRows article.card').first().getByRole('button',{name:/Abrir em tela cheia/}).click();
  await page.waitForFunction(()=>document.querySelector('#imageDialog')?.open,null,{timeout:20000});
  const imgDesk=await imageGeometry();
  assert.ok(imgDesk.side.width<=180&&imgDesk.side.width>=80,'Imagem: painel lateral deveria ser compacto');
  assert.ok(imgDesk.stage.width>imgDesk.side.width*3,'Imagem precisa permanecer ampla');
  assert.ok(imgDesk.side.x>=imgDesk.stage.x+imgDesk.stage.width-3,'Imagem: ferramentas devem ficar na lateral direita');
  assert.equal(await page.locator('#imageDialog .editor-tools [data-ink-tool="highlighter"]').getAttribute('aria-label'),'Marca-texto semitransparente');
  await page.locator('#imgClose').click();

  await page.setViewportSize({width:390,height:844});
  await page.locator('#imageRows article.card').first().getByRole('button',{name:/Abrir em tela cheia/}).click();
  await page.waitForFunction(()=>document.querySelector('#imageDialog')?.open,null,{timeout:20000});
  const imgMobile=await imageGeometry();
  assert.ok(imgMobile.side.width<=102&&imgMobile.side.width>=75,'Imagem mobile: painel lateral deveria ficar ao lado');
  assert.ok(imgMobile.stage.width>=200,'Imagem mobile: área de leitura ficou pequena');
  assert.ok(imgMobile.side.x>=imgMobile.stage.x+imgMobile.stage.width-3,'Imagem mobile: painel sobrepôs a imagem');
  await page.locator('#imgClose').click();

  await page.setViewportSize({width:1440,height:900});
  await page.locator('nav button[data-page="pdfs"]').click();
  await page.locator('#pdfSearch').fill('14.133');
  const law=page.locator('#pdfRows .v036-pdf-card').filter({hasText:'Lei de Licitações e Contratos'});
  await law.waitFor({state:'visible',timeout:25000});
  await law.getByRole('button',{name:'Ler e editar no site'}).click();
  await page.locator('#pdfChooseLocal').click();
  await page.waitForFunction(()=>window.BancoMestrePDFV042?.editing&&/Página 1 de 2/.test(document.querySelector('#pdfPager')?.textContent||''),null,{timeout:60000});
  const pdfDesk=await page.evaluate(()=>{
   const side=document.querySelector('#pdfDialog .bm-v046-pdf-side').getBoundingClientRect();
   const reader=document.querySelector('#pdfDialog .bm-v046-pdf-content').getBoundingClientRect();
   const slider=document.querySelector('#pdfMarkerOpacityV046');
   return {sidebarWidth:side.width,readerWidth:reader.width,sideX:side.x,readerX:reader.x,
    slider:slider?.value,previewHidden:document.querySelector('#pdfFrame')?.classList.contains('localHidden')};
  });
  assert.ok(pdfDesk.sidebarWidth>=80&&pdfDesk.sidebarWidth<=130,'PDF: barra não compacta');
  assert.ok(pdfDesk.readerWidth>750);
  assert.ok(pdfDesk.sideX<pdfDesk.readerX,'PDF: barra deve estar à esquerda');
  assert.equal(pdfDesk.slider,'25','Transparência inicial deve ser 25%');
  assert.equal(pdfDesk.previewHidden,true);
  await page.locator('#pdfMarker').click();
  await page.locator('#pdfMarkerOpacityV046').evaluate(el=>{
   el.value='20';el.dispatchEvent(new Event('input',{bubbles:true}));
  });
  const canvas=page.locator('#pdfInkCanvas');await canvas.scrollIntoViewIfNeeded();
  const rect=await canvas.boundingBox();assert.ok(rect?.width>150);
  const x=rect.x+rect.width*.25,y=rect.y+rect.height*.3;
  await page.mouse.move(x,y);await page.mouse.down();
  await page.mouse.move(x+80,y,{steps:8});await page.mouse.up();
  const stroke=await page.evaluate(()=>{
   const keys=Object.keys(localStorage).filter(k=>k.startsWith('BM030_STROKES_PDF:IJUI-PDF-07:'));
   const marks=keys.flatMap(k=>JSON.parse(localStorage.getItem(k)||'[]'));
   const canvas=document.getElementById('pdfInkCanvas');
   const ctx=canvas.getContext('2d');
   const samples=[];
   for(let yy=Math.round(canvas.height*.3)-3;yy<=Math.round(canvas.height*.3)+3;yy++){
    for(let xx=Math.round(canvas.width*.25)+10;xx<Math.round(canvas.width*.25)+25;xx++){
     if(xx>0&&yy>0&&xx<canvas.width&&yy<canvas.height)samples.push(ctx.getImageData(xx,yy,1,1).data[3]);
    }
   }
   return {marks:marks.filter(m=>m.type==='highlighter'),maxAlpha:Math.max(0,...samples)};
  });
  assert.equal(stroke.marks.length,1);
  assert.equal(stroke.marks[0].opacity,.2,'O grifo deve armazenar sua transparência');
  assert.ok(stroke.maxAlpha>0&&stroke.maxAlpha<100,'O grifo deve ser visualmente transparente: '+stroke.maxAlpha);

  await page.locator('#pdfClose').click();
  await page.setViewportSize({width:390,height:844});
  await law.getByRole('button',{name:'Ler e editar no site'}).click();
  await page.waitForFunction(()=>window.BancoMestrePDFV042?.editing,null,{timeout:30000});
  const pdfMobile=await page.evaluate(()=>{
   const side=document.querySelector('#pdfDialog .bm-v046-pdf-side').getBoundingClientRect();
   const reader=document.querySelector('#pdfDialog .bm-v046-pdf-content').getBoundingClientRect();
   return {sideX:side.x,sideWidth:side.width,readerX:reader.x,readerWidth:reader.width,readerHeight:reader.height};
  });
  assert.ok(pdfMobile.sideWidth<=98&&pdfMobile.sideWidth>=75);
  assert.ok(pdfMobile.readerWidth>=250&&pdfMobile.readerHeight>450);
  assert.ok(pdfMobile.sideX<pdfMobile.readerX);
  assert.equal(errs.length,0,'Erros JS: '+errs.join(' | '));
  console.log(JSON.stringify({result:'PASS',version:'V046',home:true,heroRemoved:true,statsInHeader:true,
   imgSidebarDesktop:imgDesk.side.width,imgSidebarMobile:imgMobile.side.width,
   pdfSidebarDesktop:pdfDesk.sidebarWidth,pdfSidebarMobile:pdfMobile.sideWidth,
   opacity:stroke.marks[0].opacity,canvasAlpha:stroke.maxAlpha,
   excludedCount:exclusions.count,unverifiedGuard:true,driveDeleteCalls:0,jsErrors:errs.length}));
 }finally{await browser.close()}
})().catch(e=>{console.error('V046_BROWSER_FAIL',e.stack||String(e));process.exitCode=1});

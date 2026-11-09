/* Testes V042 com OAuth e Drive API simulados: nenhum arquivo real é gravado.
   Requer servidor local http://127.0.0.1:8765, Playwright e pdf-lib. */
'use strict';
const {chromium}=require('playwright');
const {PDFDocument}=require('pdf-lib');
const assert=require('node:assert/strict');
const DRIVE_ID='bmDriveAnnotatedCopyV0420000000001';
const headers={'access-control-allow-origin':'*','access-control-allow-methods':'GET, POST, PUT, PATCH, OPTIONS','access-control-allow-headers':'*','access-control-expose-headers':'Location','content-type':'application/json'};
const fields={bm_format:'BancoMestreV042',bm_source_id:'VADE-SENADO-2026-GUIA'};
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 const page=await browser.newPage({viewport:{width:1440,height:950},acceptDownloads:true});
 const browserErrors=[],requests=[];
 let state='create',storedMetadata=null;
 page.on('pageerror',e=>browserErrors.push(e.message));
 page.on('dialog',d=>d.accept());
 await page.route('https://accounts.google.com/gsi/client',async route=>{
  await route.fulfill({status:200,contentType:'application/javascript',body:
   'window.google={accounts:{oauth2:{initTokenClient:function(c){return {requestAccessToken:function(){Promise.resolve().then(function(){c.callback({access_token:"mock-write-token",expires_in:3600,scope:c.scope})})}}}}}};'
  });
 });
 await page.route('https://www.googleapis.com/**',async route=>{
  const request=route.request(),url=new URL(request.url()),method=request.method();
  if(method==='OPTIONS'){await route.fulfill({status:204,headers});return}
  requests.push({method,url:request.url()});
  if(url.pathname.startsWith('/upload/drive/v3/files')){
   if(method==='POST'||method==='PATCH'){
    if(state==='deny'){await route.fulfill({status:403,headers,body:JSON.stringify({error:'no_permission'})});return}
    const original=method==='POST'?null:url.pathname.split('/').pop();
    assert.ok(!original||original===DRIVE_ID,'Tentativa de alterar arquivo que não é a cópia do Banco Mestre');
    const metainfo=JSON.parse(request.postData()||'{}');
    if(method==='POST'){
     assert.equal(metainfo.mimeType,'application/pdf');
     assert.equal(metainfo.appProperties.bm_source_id,fields.bm_source_id);
     assert.equal(metainfo.appProperties.bm_format,fields.bm_format);
     assert.ok(metainfo.name.endsWith('.pdf'));
     storedMetadata={id:DRIVE_ID,name:metainfo.name,mimeType:'application/pdf',appProperties:metainfo.appProperties,trashed:false};
    }else assert.deepEqual(metainfo,{});
    const uploadId=method==='POST'?'MOCK_CREATE':'MOCK_UPDATE';
    await route.fulfill({status:200,headers:{...headers,Location:'https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable&upload_id='+uploadId},body:''});
    return;
   }
   if(method==='PUT'){
    assert.ok(url.searchParams.get('upload_id')?.startsWith('MOCK_'),'Sessão não reconhecida');
    const bytes=request.postDataBuffer();
    assert.equal(bytes.toString('latin1',0,5),'%PDF-','O upload não contém um PDF válido');
    const pdf=await PDFDocument.load(bytes);
    assert.equal(pdf.getPageCount(),809,'Cópia anotada perdeu páginas');
    assert.ok(bytes.length>500000,'PDF anotado pequeno demais');
    await route.fulfill({status:200,headers,body:JSON.stringify(storedMetadata)});
    return;
   }
  }
  if(url.pathname==='/drive/v3/files/'+DRIVE_ID&&method==='GET'){
   assert.ok(storedMetadata);
   await route.fulfill({status:200,headers,body:JSON.stringify(storedMetadata)});return;
  }
  await route.fulfill({status:404,headers,body:'{}'});
 });
 try{
  await page.goto('http://127.0.0.1:8765/v042.html#pdfs',{waitUntil:'domcontentloaded',timeout:60000});
  await page.locator('#bmVade041').waitFor({state:'visible',timeout:45000});
  await page.waitForFunction(()=>window.BancoMestrePDFV042&&window.BancoMestreDriveSaveV042?.ready,{timeout:30000});
  await page.getByRole('button',{name:'Abrir e marcar o PDF'}).click();
  await page.waitForFunction(()=>window.BancoMestrePDFV042?.editing&&/Página 1 de \d+/.test(document.getElementById('pdfPager')?.textContent||''),null,{timeout:120000});
  await page.locator('#pdfMarker').click();
  const ink=page.locator('#pdfInkCanvas'),rect=await ink.boundingBox();
  assert.ok(rect&&rect.width>100&&rect.height>100);
  let x=rect.x+rect.width*.23,y=rect.y+rect.height*.26;
  await page.mouse.move(x,y);await page.mouse.down();await page.mouse.move(x+90,y,{steps:8});await page.mouse.up();
  assert.ok((await page.evaluate(()=>Object.keys(localStorage).filter(x=>x.startsWith('BM030_STROKES_PDF:VADE-SENADO-2026-GUIA:')).length))>0,'Grifo não persistiu');
  await page.locator('#pdfSaveDriveV042').click();
  await page.waitForFunction(()=>document.getElementById('driveSaveStatusV042')?.textContent.includes('Nova cópia criada'),null,{timeout:120000});
  assert.equal(requests.filter(r=>r.method==='POST'&&r.url.includes('uploadType=resumable')).length,1,'Deveria criar uma única cópia');
  assert.equal(requests.filter(r=>r.method==='PUT').length,1);
  const lastLink=await page.locator('#driveSaveLinkV042').getAttribute('href');
  assert.equal(lastLink,'https://drive.google.com/file/d/'+DRIVE_ID+'/view');
  // Segundo salvamento tem de conferir metadados e atualizar APENAS a cópia criada.
  state='update';
  await page.locator('#pdfSaveDriveV042').click();
  await page.waitForFunction(()=>document.getElementById('driveSaveStatusV042')?.textContent.includes('Cópia atualizada'),null,{timeout:120000});
  assert.equal(requests.filter(r=>r.method==='PATCH'&&r.url.includes(DRIVE_ID)).length,1,'Atualização deveria ser na cópia');
  assert.equal(requests.filter(r=>r.method==='POST'&&r.url.includes('uploadType=resumable')).length,1,'Não criar cópia duplicada ao atualizar');
  assert.ok(requests.some(r=>r.method==='GET'&&r.url.includes(DRIVE_ID)),'Não verificou appProperties antes de atualizar');
  // Simulação 403: não se pode afirmar sucesso, nem alterar mapeamento.
  state='deny';
  await page.locator('#pdfSaveDriveV042').click();
  await page.waitForFunction(()=>document.getElementById('driveSaveStatusV042')?.textContent.includes('Não foi possível confirmar'),null,{timeout:120000});
  const mapping=await page.evaluate(()=>Object.keys(localStorage).filter(k=>k.startsWith('BM042_DRIVE_COPIA_ANOTADA:')).map(k=>JSON.parse(localStorage.getItem(k))));
  assert.equal(mapping.length,1);
  assert.equal(mapping[0].id,DRIVE_ID);
  assert.equal(browserErrors.length,0,'Erros inesperados: '+browserErrors.join('; '));
  console.log(JSON.stringify({result:'PASS',site:'V042',oauth_mock:true,create:true,update_only_copy:true,pdf_pages:809,forbidden_403_handled:true,original_untouched:true,requests:requests.length}));
 }finally{await browser.close()}
})().catch(e=>{console.error('DRIVE_SAVE_V042_FAIL',e.stack||String(e));process.exitCode=1});

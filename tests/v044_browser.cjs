/* V044: auditoria do Atlas, layout, OAuth Drive para Vade sem fonte GitHub e preservação das marcas.
   Todas as respostas Drive são SIMULADAS: não acessa nem modifica conta particular. */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const crypto=require('node:crypto');
const {chromium}=require('playwright');
const raw=Buffer.concat(Array.from({length:21},(_,i)=>{
 const name='assets/pdf/vade_senado_2026_'+String(i+1).padStart(2,'0')+'.b64';
 return Buffer.from(fs.readFileSync(name,'utf8').replace(/\s+/g,''),'base64');
}));
assert.equal(raw.length,8201546);
assert.equal(crypto.createHash('sha256').update(raw).digest('hex'),'6eeac7822562b6944ea9c7587b6ecb28a575830a89eeb03861f9e1e7ebed7a39');
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 const page=await browser.newPage({viewport:{width:1440,height:900},acceptDownloads:true});
 const errors=[],network=[],requests=[];
 page.on('pageerror',e=>errors.push(e.message));
 page.on('request',r=>{if(r.url().includes('assets/pdf/vade_senado_2026_'))network.push(r.url())});
 await page.route('https://accounts.google.com/gsi/client',async route=>{
  await route.fulfill({status:200,contentType:'application/javascript',body:
   'window.google={accounts:{oauth2:{initTokenClient:function(c){return {requestAccessToken:function(){Promise.resolve().then(function(){c.callback({access_token:"MOCK_GOOGLE",expires_in:3600,scope:c.scope})})}}}}}};'
  });
 });
 await page.route('https://www.googleapis.com/drive/v3/files/**',async route=>{
  const req=route.request(),url=new URL(req.url());
  if(req.method()==='GET'&&url.searchParams.get('alt')==='media'){
   const id=url.pathname.split('/').pop();
   requests.push(id);
   if(id!=='1Bl5q1QE-HKk_G3JSfcP2qQWdnFhckzHI')
    throw Error('Drive file ID inválido para o Vade: '+id);
   await route.fulfill({status:200,contentType:'application/pdf',headers:{
    'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'*'
   },body:raw});return;
  }
  await route.fulfill({status:404,body:'{}'});
 });
 try{
  await page.goto('http://127.0.0.1:8765/v044.html',{waitUntil:'domcontentloaded',timeout:60000});
  await page.waitForFunction(()=>window.BancoMestreUiV044?.ready&&window.BancoMestreCompactV043?.ready&&window.BancoMestreVadeV044&&window.BancoMestreDriveV042?.ready,null,{timeout:45000});
  const layout=await page.evaluate(()=>{
   const stats=document.querySelector('main > .stats');
   return {
    statsHeight:stats?.getBoundingClientRect().height,
    statsContent:[...stats.querySelectorAll('b')].map(x=>x.textContent),
    thirdLabel:stats.querySelector('.stat:nth-child(3) span')?.textContent,
    panelRemoved:!document.getElementById('v037LocalGuides'),
    connectInPdfHeader:!!document.querySelector('#pdfs .bm-v044-pdf-heading #driveConnectV038'),
    title:document.querySelector('#tema h3.sectionTitle')?.textContent,
    vadeSource:window.BancoMestreVadeV044?.source,
    vadeDriveId:window.BancoMestreVadeV044?.source_file_id,
    vadeText:document.querySelector('#bmVade041 p')?.textContent
   }
  });
  assert.equal(layout.panelRemoved,true,'Painel de importar lei não foi retirado');
  assert.equal(layout.connectInPdfHeader,true,'Conectar Drive deveria estar no cabeçalho de PDFs');
  assert.equal(layout.title,'Cartões cadastrados');
  assert.equal(layout.vadeSource,'google-drive');
  assert.equal(layout.vadeDriveId,'1Bl5q1QE-HKk_G3JSfcP2qQWdnFhckzHI');
  assert.equal(layout.statsContent[2],'254');
  assert.ok(layout.statsHeight<68,'Indicadores continuam altos: '+layout.statsHeight);
  assert.ok(!/GitHub|21 partes/i.test(layout.vadeText),'Texto do Vade continua referindo GitHub');

  await page.locator('nav button[data-page="imagens"]').click();
  await page.waitForFunction(()=>window.BancoMestreAtlasV044?.indexed&&window.BancoMestreAtlasV044.total===254,null,{timeout:45000});
  let count=await page.locator('#imageCount').innerText();
  assert.ok(/254/.test(count),'Atlas deve informar 254: '+count);
  const index=await page.locator('#imageIndexV044').innerText();
  assert.ok(/16 registros separados/.test(index)||/P10: 16/.test(index),'P10 precisa estar distinto do Atlas principal');
  const areas=await page.locator('#imageAreaV044 option').allTextContents();
  assert.ok(areas.includes('Engenharia Civil')&&areas.includes('Português')&&areas.includes('Matemática'));
  await page.locator('#imageSearch').fill('IMG-254');
  await page.waitForFunction(()=>document.querySelector('#imageRows')?.textContent?.includes('IMG-254'),null,{timeout:15000});
  assert.ok((await page.locator('#imageCount').innerText()).startsWith('1 de 254'));
  await page.locator('#imageSearch').fill('42');
  await page.waitForFunction(()=>document.querySelector('#imageRows')?.textContent?.includes('IMG-042'),null,{timeout:15000});
  await page.locator('#imageSearch').fill('');
  await page.locator('#imageSortV044').selectOption('id-desc');
  await page.waitForFunction(()=>document.querySelector('#imageRows .card')?.textContent?.includes('IMG-254'),null,{timeout:15000});
  await page.locator('#imageAreaV044').selectOption('Português');
  await page.waitForFunction(()=>document.querySelector('#imageCount')?.textContent?.startsWith('19 de 254'),null,{timeout:15000});
  await page.locator('#imageSourceV044').selectOption('visual');
  const filtered=await page.locator('#imageCount').innerText();
  assert.ok(/\d+ de 254/.test(filtered));
  await page.getByRole('button',{name:'Limpar filtros'}).click();
  assert.ok((await page.locator('#imageCount').innerText()).startsWith('254 de 254'));

  await page.locator('nav button[data-page="pdfs"]').click();
  await page.getByRole('button',{name:'Abrir e marcar o PDF'}).click();
  await page.locator('#driveConnectInPdfV042').waitFor({state:'visible',timeout:15000});
  assert.equal(await page.locator('#pdfLocalMode').isVisible(),false,'Vade deve exigir leitura Drive ao entrar');
  await page.locator('#driveConnectInPdfV042').click();
  await page.waitForFunction(()=>window.BancoMestrePDFV042?.editing&&/Página 1 de 809/.test(document.getElementById('pdfPager')?.textContent||''),null,{timeout:120000});
  assert.equal(requests.length,1,'Primeira abertura deve ler PDF do Drive via OAuth');
  assert.equal(network.length,0,'A V044 não pode ler nenhuma parte do Vade do GitHub');
  const href=await page.locator('#pdfOriginal').getAttribute('href');
  assert.ok(href.includes('drive.google.com/file/d/1Bl5q1QE-'),'Link original deveria ser Drive');
  const ink=page.locator('#pdfInkCanvas');await ink.scrollIntoViewIfNeeded();
  const box=await ink.boundingBox();assert.ok(box?.width>100);
  await page.locator('#pdfMarker').click();
  const x=box.x+box.width*.25,y=box.y+box.height*.25;
  await page.mouse.move(x,y);await page.mouse.down();await page.mouse.move(x+85,y,{steps:6});await page.mouse.up();
  const marks=await page.evaluate(()=>Object.keys(localStorage).filter(k=>k.startsWith('BM030_STROKES_PDF:VADE-SENADO-2026-GUIA:')).flatMap(k=>JSON.parse(localStorage.getItem(k)||'[]')).filter(m=>m.type==='highlighter').length);
  assert.ok(marks>=1,'Marcações Vade com ID anterior não foram gravadas');
  await page.locator('#pdfClose').click();
  await page.getByRole('button',{name:'Abrir e marcar o PDF'}).click();
  await page.waitForFunction(()=>window.BancoMestrePDFV042?.editing&&/Página 1 de 809/.test(document.getElementById('pdfPager')?.textContent||''),null,{timeout:120000});
  assert.equal(requests.length,2,'Reabrir deve ler origem Drive; não apenas versão GitHub em cache');
  const marksLater=await page.evaluate(()=>Object.keys(localStorage).filter(k=>k.startsWith('BM030_STROKES_PDF:VADE-SENADO-2026-GUIA:')).flatMap(k=>JSON.parse(localStorage.getItem(k)||'[]')).filter(m=>m.type==='highlighter').length);
  assert.ok(marksLater>=1,'Marcações não persistiram após reabertura pelo Drive');
  assert.equal(errors.length,0,'Erros de JavaScript: '+errors.join(' | '));
  console.log(JSON.stringify({result:'PASS',statsHeight:layout.statsHeight,stats254:true,removedImportPanel:true,driveHeader:true,cardTitle:true,atlasIndexed:254,atlasFilters:true,p10Separate:true,vadeSource:'google-drive',vadePages:809,vadeDriveFetches:requests.length,githubChunksLoaded:network.length,marksPersisted:true,jsErrors:errors.length}));
 }finally{await browser.close()}
})().catch(e=>{console.error('V044_BROWSER_FAIL',e.stack||String(e));process.exitCode=1});

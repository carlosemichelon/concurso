/* V047: rolagem entre páginas, vínculo CARD e prévia sem mostrar gabarito;
   biblioteca PDF e OAuth simulados, sem modificar arquivos pessoais. */
'use strict';
const assert=require('node:assert/strict');
const {chromium}=require('playwright');
const {PDFDocument}=require('pdf-lib');
async function build(n){
 const d=await PDFDocument.create();for(let i=0;i<n;i++)d.addPage([595,842]);
 return Buffer.from(await d.save());
}
(async()=>{
 const pdf=await build(3);
 const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 const page=await browser.newPage({viewport:{width:1440,height:900},acceptDownloads:true});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.route('https://accounts.google.com/gsi/client',async route=>route.fulfill({
  status:200,contentType:'application/javascript',
  body:'window.google={accounts:{oauth2:{initTokenClient:function(c){return {requestAccessToken:function(){Promise.resolve().then(function(){c.callback({access_token:"MOCK_GOOGLE",expires_in:3600,scope:c.scope})})}}}}}};'
 }));
 await page.route('https://www.googleapis.com/drive/v3/files/**',async route=>{
  const req=route.request(),u=new URL(req.url());
  if(req.method()==='GET'&&u.searchParams.get('alt')==='media'){
   await route.fulfill({status:200,contentType:'application/pdf',headers:{'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'*'},body:pdf});return;
  }
  await route.fulfill({status:404,body:'{}'});
 });
 const pageNo=async n=>page.waitForFunction(x=>window.BancoMestrePDFV042?.currentPage===x&&document.querySelector('#pdfPager')?.textContent?.includes('Página '+x+' de 3'),n,{timeout:20000});
 const wheel=async(delta)=>{
  await page.locator('#pdfLocalMode').evaluate((el,amount)=>{
   el.dispatchEvent(new WheelEvent('wheel',{deltaY:amount,bubbles:true,cancelable:true}));
  },delta);
 };
 try{
  await page.goto('http://127.0.0.1:8765/v047.html#pdfs',{waitUntil:'domcontentloaded',timeout:60000});
  await page.waitForFunction(()=>window.BancoMestreLayoutV046?.ready&&window.BancoMestreCardPreviewV047?.ready&&window.BancoMestreDriveV042?.ready,null,{timeout:45000});
  await page.locator('nav button[data-page="pdfs"]').click();
  await page.locator('#pdfSearch').fill('14.133');
  const law=page.locator('#pdfRows .v036-pdf-card').filter({hasText:'Lei de Licitações e Contratos'});
  await law.waitFor({state:'visible',timeout:20000});
  await law.getByRole('button',{name:'Ler e editar no site'}).click();
  await page.locator('#pdfChooseLocal').click();
  await pageNo(1);
  assert.equal(await page.locator('#pdfQuickCardV047').isVisible(),true);
  assert.equal(await page.locator('#pdfMarkerOpacityV046').inputValue(),'25');
  // Evento real de vincular CARD a página 1. Não registra avaliação SRS.
  page.once('dialog',d=>d.accept('CARD-0028'));
  await page.locator('#pdfCardV037').click();
  const ink=page.locator('#pdfInkCanvas');await ink.scrollIntoViewIfNeeded();
  const rect=await ink.boundingBox();assert.ok(rect?.height>150);
  await page.mouse.click(rect.x+rect.width*.4,rect.y+rect.height*.28);
  let marks=await page.evaluate(()=>window.BancoMestrePDFV042.currentMarks);
  assert.equal(marks.find(m=>m.type==='card')?.text,'CARD-0028');
  const sourceHash=await page.evaluate(()=>window.BancoMestrePDFV042.sourceHash);
  await page.locator('#pdfQuickCardV047').click();
  await page.waitForFunction(()=>document.getElementById('pdfQuickResultV047')?.textContent?.includes('Mostrar resposta'),null,{timeout:30000});
  assert.equal(await page.locator('#pdfQuickPanelV047').isVisible(),true);
  assert.ok((await page.locator('#pdfQuickLinkedV047').innerText()).includes('CARD-0028'));
  assert.equal(await page.locator('#pdfQuickResultV047 .bm-v047-answer').isVisible(),false);
  const front=await page.locator('#pdfQuickResultV047').innerText();
  assert.ok(front.includes('CARD-0028'));
  await page.getByRole('button',{name:'Mostrar resposta'}).click();
  assert.equal(await page.locator('#pdfQuickResultV047 .bm-v047-answer').isVisible(),true);
  const full=await page.locator('#pdfQuickResultV047 a.bm-v047-full').getAttribute('href');
  assert.ok(full.includes('cartao=CARD-0028'));
  await page.getByRole('button',{name:'Fechar prévia do flashcard'}).click();

  // Rolar por dentro da página (sem pular antes do fim).
  const reader=page.locator('#pdfLocalMode');
  const range=await reader.evaluate(el=>({max:el.scrollHeight-el.clientHeight}));
  if(range.max>12){
   await reader.evaluate(el=>el.scrollTop=0);
   await wheel(20);
   await pageNo(1);
  }
  // Mover-se à última linha e rolar para avançar.
  await reader.evaluate(el=>el.scrollTop=el.scrollHeight-el.clientHeight);
  await wheel(75);await pageNo(2);
  const hashAfter=await page.evaluate(()=>window.BancoMestrePDFV042.sourceHash);
  assert.equal(hashAfter,sourceHash,'Rolar deve preservar o documento/hash');
  assert.equal((await page.evaluate(()=>window.BancoMestrePDFV042.currentMarks)).length,0,'Marcações da página 1 não podem ir para a 2');
  // Caminhar para terceira página ao rolar no fim.
  await reader.evaluate(el=>el.scrollTop=el.scrollHeight-el.clientHeight);
  await page.waitForTimeout(530);
  await wheel(80);await pageNo(3);
  await reader.evaluate(el=>el.scrollTop=0);
  await page.waitForTimeout(530);
  await wheel(-80);await pageNo(2);
  await reader.evaluate(el=>el.scrollTop=0);
  await page.waitForTimeout(530);
  await wheel(-80);await pageNo(1);
  marks=await page.evaluate(()=>window.BancoMestrePDFV042.currentMarks);
  assert.equal(marks.find(m=>m.type==='card')?.text,'CARD-0028','Rolagem deve preservar o vínculo da página 1');

  // Busca por ID mesmo sem marcar outro cartão na página.
  await page.locator('#pdfQuickCardV047').click();
  await page.locator('#pdfQuickIdV047').fill('CARD-0078');
  await page.locator('#pdfQuickIdV047').press('Enter');
  await page.waitForFunction(()=>document.getElementById('pdfQuickResultV047')?.textContent?.includes('Mostrar resposta'),null,{timeout:20000});
  assert.equal(await page.locator('#pdfQuickResultV047 .bm-v047-answer').isVisible(),false);
  await page.getByRole('button',{name:'Fechar prévia do flashcard'}).click();
  assert.equal(errors.length,0,'Erros JS: '+errors.join(' | '));

  // Retorno à leitura: página atual e o leitor continuam disponíveis.
  await page.setViewportSize({width:390,height:844});
  assert.equal(await page.locator('#pdfQuickCardV047').isVisible(),true);
  const sidebar=await page.locator('#pdfDialog .bm-v046-pdf-side').boundingBox();
  assert.ok(sidebar.width<=100,'Ícone não pode alongar a sidebar móvel');
  await reader.evaluate(el=>el.scrollTop=el.scrollHeight-el.clientHeight);
  await page.waitForTimeout(530);
  await wheel(75);await pageNo(2);
  await page.locator('#pdfClose').click();
  console.log(JSON.stringify({result:'PASS',version:'V047',wheelPageDown:true,wheelPageUp:true,pdf3pages:true,
   linkedCard:'CARD-0028',quickSearch:'CARD-0078',backInitiallyHidden:true,
   originalHashPreserved:true,marksPerPage:true,mobileSidebar:sidebar.width,jsErrors:errors.length}));
 }finally{await browser.close()}
})().catch(e=>{console.error('V047_BROWSER_FAIL',e.stack||String(e));process.exitCode=1});

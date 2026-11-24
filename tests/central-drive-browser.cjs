'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs');
const {chromium}=require('playwright');
const base='http://127.0.0.1:8765/preview-multiusuario/';
const output='test-artifacts/central-browser';
fs.mkdirSync(output,{recursive:true});
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 const results=[];
 async function run(name,fn,width=1366){
  const ctx=await browser.newContext({viewport:{width,height:900}}),page=await ctx.newPage(),errors=[],external=[];
  page.setDefaultTimeout(12000);
  page.on('pageerror',e=>errors.push(String(e.stack||e)));
  await page.route('**/*',r=>{const u=r.request().url();if(u.startsWith('http://127.0.0.1:8765/')||u.startsWith('blob:')||u.startsWith('data:'))return r.continue();external.push(u);return r.abort()});
  page.on('dialog',d=>d.accept('Evidência fictícia: aplicação correta em recuperação ativa.'));
  let failure=null;
  try{await fn(page,ctx);assert.deepEqual(errors,[],'Erros JavaScript');assert.deepEqual(external,[],'Rede externa não permitida')}
  catch(e){failure=String(e.stack||e)}
  finally{try{await page.screenshot({path:output+'/'+name+'.png',fullPage:true,timeout:5000})}catch{};results.push({name,ok:!failure,failure,errors,external,url:page.url()});console.log('BROWSER '+JSON.stringify(results.at(-1)));await ctx.close()}
 }
 async function open(p,profile='A'){
  await p.goto(base+'portal.html?perfil='+profile,{waitUntil:'domcontentloaded'});
  await p.waitForFunction(()=>!document.body.hidden&&window.BMAccountRuntime?.mode==='central');
  assert.ok(await p.locator('#bm239-sync-details').textContent().then(x=>x.includes('Perfil '+profile)));
 }
 async function tab(p,id){await p.locator('header nav [data-page="'+id+'"]').click();await p.locator('main > section#'+id).waitFor({state:'visible'})}
 async function card(p,id='CARD-9001'){
  await tab(p,'cartoes');await p.locator('#cardSearch').fill(id);
  await p.locator('#cardRows .bm-v050-peek-button').first().click();
  await p.locator('#bmCardPeekV050').waitFor({state:'visible'});
  assert.equal(await p.evaluate(()=>window.BancoMestreVisualizarCardV050.currentId),id);
 }
 await run('01-navigation',async p=>{await open(p);for(const id of ['assuntos','cartoes','pdfs','imagens','lacunas','calendario','controle-estudos'])await tab(p,id);assert.ok(await p.evaluate(()=>!!window.BMAccountRuntime))});
 await run('02-reader-srs',async p=>{await open(p);await card(p);assert.equal(await p.locator('.bm-v050-peek-answer').isVisible(),false);
  await p.locator('.bm-v050-peek-reveal').click();await p.locator('.bm197-evolutive').waitFor({state:'visible'});await p.waitForFunction(()=>document.querySelector('.bm197-evolutive')?.textContent.includes('Rastreabilidade'));
  const first=await p.evaluate(()=>window.BMAccountRuntime.srs().records.find(x=>x.id==='CARD-9001').due);
  await p.locator('#bm316-srs-panel [data-grade="Fácil"]').click();await p.waitForFunction(()=>document.querySelector('#bm316-srs-state')?.textContent.includes('24 dias'));
  assert.notEqual(await p.evaluate(()=>window.BMAccountRuntime.srs().records.find(x=>x.id==='CARD-9001').due),first);
  await p.locator('.bm165-toggle-sidebar').click();assert.ok(await p.evaluate(()=>window.BancoMestreVisualizarCardV050.relatedCount>=2));
 });
 await run('03-discursive',async p=>{await open(p);await card(p);const before=await p.evaluate(()=>JSON.stringify(window.BMAccountRuntime.srs()));await p.locator('.bm195-open').click();await p.locator('[data-bm195-answer]').fill('Tentativa fictícia de recuperação ativa.');await p.locator('[data-bm195-note]').fill('Observação de teste.');await p.locator('[data-bm195-rate="Bom"]').click();await p.locator('[data-bm195-save]').click();await p.waitForFunction(()=>window.BMAccountRuntime.attempts().length===1);assert.equal(await p.evaluate(()=>JSON.stringify(window.BMAccountRuntime.srs())),before);await p.locator('[data-bm195-history-toggle]').click();await p.locator('[data-bm195-history] summary').first().waitFor({state:'visible'})});
 await run('04-images',async p=>{await open(p);await tab(p,'imagens');await p.locator('#imageRows').getByText('Abrir em tela cheia',{exact:true}).first().click();await p.locator('#imageDialog').waitFor({state:'visible'});await p.locator('#imageDialog [data-ink-tool="pen"]').click();const c=await p.locator('#grifo').boundingBox();assert.ok(c&&c.width>20&&c.height>20);await p.mouse.move(c.x+c.width*.3,c.y+c.height*.3);await p.mouse.down();await p.mouse.move(c.x+c.width*.6,c.y+c.height*.6,{steps:12});await p.mouse.up();await p.locator('#bmCentralImageSync').click();await p.waitForFunction(()=>document.querySelector('#imgMessage')?.textContent.includes('Simulação confirmada'));await p.locator('#imgClose').click()});
 await run('05-pdf',async p=>{await open(p);await tab(p,'pdfs');await p.locator('#pdfRows').getByText('Ler / editar PDF',{exact:true}).first().click();await p.waitForFunction(()=>window.BancoMestrePDFV042?.editing&&window.BancoMestrePDFV042.totalPages===1);await p.locator('#pdfDraw').click();const c=await p.locator('#pdfInkCanvas').boundingBox();assert.ok(c&&c.width>20&&c.height>20);await p.mouse.move(c.x+40,c.y+60);await p.mouse.down();await p.mouse.move(c.x+130,c.y+90,{steps:8});await p.mouse.up();await p.waitForFunction(()=>window.BancoMestrePDFV042.currentMarks.length>0);await p.getByRole('button',{name:'Sincronizar grifos',exact:true}).click();await p.waitForFunction(()=>document.querySelector('#pdfLocalStatus')?.textContent.includes('Grifos simulados'));await p.getByRole('button',{name:'Simular cópia no Drive',exact:true}).click();await p.waitForFunction(()=>document.querySelector('#pdfLocalStatus')?.textContent.includes('Cópia fictícia confirmada'))});
 await run('06-gaps',async p=>{await open(p);await tab(p,'lacunas');await p.locator('#bm242-new summary').click();await p.locator('#bm242-form [name="descricao"]').fill('Teste fictício de lacuna');await p.locator('#bm242-form [name="cardIds"]').fill('CARD-9001');await p.locator('#bm242-form button[type="submit"]').click();await p.locator('#bm242-sync').click();await p.waitForFunction(()=>document.querySelector('#bm242-state')?.textContent.includes('fictícias sincronizadas'));assert.equal(await p.evaluate(()=>window.BM242Lacunas.data.records.length),2)});
 await run('07-study',async p=>{await open(p);await tab(p,'controle-estudos');await p.waitForFunction(()=>!!window.BM240ControlApp);assert.ok(await p.locator('#bm240-native-host').isVisible());await p.locator('#bm240-native-host').getByRole('button',{name:'Backup',exact:true}).click();await p.locator('#bm-profile-study-sync').click();await p.waitForFunction(()=>document.querySelector('#bm240-native-host').shadowRoot.querySelector('#backupStatus').textContent.includes('fictício sincronizado'))});
 await run('08-isolation',async(p,ctx)=>{await open(p,'A');const q=await ctx.newPage();await open(q,'B');const a=await p.evaluate(()=>window.BMAccountRuntime.catalog()),b=await q.evaluate(()=>window.BMAccountRuntime.catalog());assert.notEqual(a.find(c=>c.id==='CARD-9001').front,b.find(c=>c.id==='CARD-9001').front);assert.equal(await p.evaluate(()=>window.BMAccountRuntime.srs().records.length),1);assert.equal(await q.evaluate(()=>window.BMAccountRuntime.srs().records.length),2);await assert.rejects(p.evaluate(()=>window.BMAccountRuntime.loadLayers('CARD-9004')));assert.equal(await p.evaluate(()=>localStorage.length),0);assert.equal(await q.evaluate(()=>localStorage.length),0);await q.close()});
 await run('09-mobile',async p=>{await open(p);await tab(p,'cartoes');await card(p);assert.equal(await p.locator('.bm-v050-peek-answer').isVisible(),false);await p.locator('.bm-v050-peek-reveal').click();assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+2),'Rolagem horizontal global');},390);
 await browser.close();fs.writeFileSync(output+'/results.json',JSON.stringify(results,null,2));assert.ok(results.every(x=>x.ok),results.filter(x=>!x.ok).map(x=>x.name+': '+x.failure).join('\n'));
})().catch(e=>{console.error(e.stack||e);process.exitCode=1});

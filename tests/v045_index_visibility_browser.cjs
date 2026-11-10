/* Banco Mestre V045 — validar redirecionamento padrão e índice por exclusões locais.
   Os testes usam armazenamento efêmero de um navegador automatizado, sem dados do usuário. */
'use strict';
const assert=require('node:assert/strict');
const {chromium}=require('playwright');
const fs=require('node:fs');
const currentVersion=JSON.parse(fs.readFileSync('assets/version.json','utf8')).version;
const currentFile='v'+currentVersion.slice(1)+'.html';
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 const context=await browser.newContext({viewport:{width:1366,height:900}});
 const page=await context.newPage();
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 const root='http://127.0.0.1:8765/';
 const loaded=async()=>{
  await page.waitForFunction(()=>window.BancoMestreAtlasV045?.indexed&&window.BancoMestreAtlasV045.total===270,null,{timeout:18000});
 };
 const visible=async(n)=>{
  await page.waitForFunction(v=>(document.querySelector('header .bm-v046-header-stats .stat:nth-child(3) b')||document.querySelector('main > .stats .stat:nth-child(3) b'))?.textContent===String(v),n,{timeout:20000});
  await page.waitForFunction(v=>document.querySelector('#imageCount')?.textContent?.startsWith(v+' de '+v),n,{timeout:20000});
 };
 try{
  const indexResp=await page.goto(root+'index.html#imagens',{waitUntil:'domcontentloaded',timeout:60000});
  assert.equal(indexResp.status(),200);
  await page.waitForURL(url=>url.pathname.endsWith('/'+currentFile)&&url.searchParams.get('versao')===currentVersion&&url.hash==='#imagens',{timeout:40000});
  await page.waitForTimeout(2200);
  const diagnostics=await page.evaluate(()=>({
   url:location.href,title:document.title,route:location.hash,
   body:document.body.innerText.slice(0,220),
   atlasExists:!!window.BancoMestreAtlasV045,
   indexed:window.BancoMestreAtlasV045?.indexed,
   imageRows:document.querySelector('#imageRows')?.textContent.slice(0,150),
   imageCount:document.getElementById('imageCount')?.textContent,
   loadedImages:typeof loadedImages!=='undefined'?loadedImages:'unavailable',
   images:typeof imgs!=='undefined'?imgs.length:'unavailable',
   scripts:[...document.scripts].map(x=>x.getAttribute('src')).filter(Boolean).slice(-8)
  }));
  console.log('V045_DIAGNOSTICO',JSON.stringify(diagnostics),'JS_ERRORS',JSON.stringify(errors));
  await loaded();
  assert.equal(await page.locator('#imagens').evaluate(e=>e.classList.contains('active')),true,'O redirecionamento deve preservar o hash da seção');
  const initial=await page.evaluate(()=>window.BancoMestreAtlasV045.getIndexStatus());
  assert.equal(initial.total,270);
  assert.equal(initial.visible,270);
  assert.deepEqual(initial.hidden,[]);
  await visible(270);
  // Exclusão de imagem legada, que usa IndexedDB.
  await page.evaluate(()=>api.setStatus('IMG-005','hidden'));
  await page.waitForTimeout(900);
  console.log('V045_AFTER_LEGACY_DELETE',JSON.stringify(await page.evaluate(async()=>({
   status:await window.BancoMestreAtlasV045.getIndexStatus(),
   home:document.querySelector('main > .stats .stat:nth-child(3) b')?.textContent,
   count:document.getElementById('imageCount')?.textContent,
   errors:(window.BancoMestreAtlasV045?.filtered||'')
  }))), 'JS_ERRORS',JSON.stringify(errors));
  await visible(269);
  let st=await page.evaluate(()=>window.BancoMestreAtlasV045.getIndexStatus());
  assert.deepEqual(st.hidden,['IMG-005']);
  // Exclusão de imagem P10, que usa localStorage.
  await page.evaluate(()=>api.setStatus('IMG-P10-04','hidden'));
  await visible(268);
  st=await page.evaluate(()=>window.BancoMestreAtlasV045.getIndexStatus());
  assert.equal(st.visible,268);
  assert.deepEqual(st.hidden.sort(),['IMG-005','IMG-P10-04']);
  const detail=await page.locator('#imageIndexV044').innerText();
  assert.ok(detail.includes('268 visíveis, 2 excluídas localmente'),detail);
  await page.locator('#imageSearch').fill('IMG-005');
  await page.waitForFunction(()=>document.querySelector('#imageCount')?.textContent?.startsWith('0 de 268'),null,{timeout:15000});
  assert.ok(!(await page.locator('#imageRows').innerText()).includes('IMG-005'),'Imagem excluída não pode aparecer como ativa');
  await page.locator('#imageSearch').fill('');
  // Índice de excluídas: ambas devem estar disponíveis para restauração.
  await page.locator('#imageVisibilityV045').selectOption('hidden');
  await page.waitForFunction(()=>document.querySelector('#imageCount')?.textContent?.startsWith('2 de 2'),null,{timeout:15000});
  const hiddenIds=await page.locator('#imageRows article.card .tag').allTextContents();
  assert.ok(hiddenIds.some(x=>x.trim()==='IMG-005'));
  assert.ok(hiddenIds.some(x=>x.trim()==='IMG-P10-04'));
  assert.equal(await page.locator('#imageRows').getByRole('button',{name:'Restaurar'}).count(),2);
  // Reiniciar o navegador preserva as duas exclusões (versões do mesmo domínio).
  await page.reload({waitUntil:'domcontentloaded'});
  await page.locator('nav button[data-page="imagens"]').click();
  await loaded();
  await visible(268);
  const remembered=await page.evaluate(()=>window.BancoMestreAtlasV045.getIndexStatus());
  assert.deepEqual(remembered.hidden.sort(),['IMG-005','IMG-P10-04']);
  await page.locator('#imageVisibilityV045').selectOption('hidden');
  await page.waitForFunction(()=>document.querySelector('#imageCount')?.textContent?.startsWith('2 de 2'),null,{timeout:15000});
  // Restaurar via botões reais da UI: IDs e catálogo histórico não são removidos.
  const cardA=page.locator('#imageRows article.card').filter({hasText:'IMG-005'});
  await cardA.getByRole('button',{name:'Restaurar'}).click();
  await page.waitForFunction(()=>document.querySelector('#imageCount')?.textContent?.startsWith('1 de 1'),null,{timeout:15000});
  const cardB=page.locator('#imageRows article.card').filter({hasText:'IMG-P10-04'});
  await cardB.getByRole('button',{name:'Restaurar'}).click();
  await page.waitForFunction(()=>document.querySelector('#imageCount')?.textContent?.startsWith('0 de 0'),null,{timeout:15000});
  const restored=await page.evaluate(()=>window.BancoMestreAtlasV045.getIndexStatus());
  assert.equal(restored.visible,270);
  assert.deepEqual(restored.hidden,[]);
  // Filtro "Todas" contabiliza as 270 mesmo com exclusões (historicamente estável).
  await page.locator('#imageVisibilityV045').selectOption('all');
  await page.waitForFunction(()=>document.querySelector('#imageCount')?.textContent?.startsWith('270 de 270'),null,{timeout:15000});
  assert.equal(errors.length,0,'Falhas JavaScript: '+errors.join(' | '));
  console.log(JSON.stringify({result:'PASS',defaultRedirect:currentVersion,hashPreserved:true,cataloged:270,hiddenLegacy:true,hiddenP10:true,visibleAfterHide:268,filteredIndex:true,refreshPersistence:true,restored:true,originalIdsPreserved:true,jsErrors:errors.length}));
  // Se o manifesto falhar, fallback do index também deve ser a versão atual.
  const fallback=await context.newPage();
  await fallback.route('**/assets/version.json*',r=>r.fulfill({status:503,body:'offline'}));
  await fallback.goto(root+'index.html',{waitUntil:'domcontentloaded'});
  await fallback.waitForFunction(expected=>document.getElementById('entrar')?.getAttribute('href')?.includes(expected),currentFile,{timeout:10000});
  const link=await fallback.locator('#entrar').getAttribute('href');
  assert.ok(link.includes(currentFile),'Fallback deve apontar para a versão atual, não V037');
  console.log(JSON.stringify({result:'PASS',fallback:currentVersion}));
  await fallback.close();
 }finally{await browser.close()}
})().catch(e=>{console.error('V045_INDEX_FAIL',e.stack||String(e));process.exitCode=1});

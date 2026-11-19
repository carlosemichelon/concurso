/* V262: inspeção real de estabilidade e JavaScript sem OAuth privado. */
'use strict';
const assert=require('node:assert/strict');
const {chromium}=require('playwright');
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 const snapshots=[];
 try {
  const context=await browser.newContext({viewport:{width:1366,height:900}});
  const page=await context.newPage(),errors=[];
  page.on('pageerror',err=>errors.push(String(err.stack||err.message)));
  await page.goto('http://127.0.0.1:8765/v262.html',{waitUntil:'domcontentloaded',timeout:60000});
  await page.waitForFunction(()=>!!document.querySelector('header .bm-v046-header-stats #bm239-drive-action'),null,{timeout:20000});
  const sample=()=>page.evaluate(()=>{
   const host=document.querySelector('header .bm-v046-header-stats'),
   nav=document.querySelector('header nav'),stats=[...host.querySelectorAll(':scope > .stat')];
   return {navTop:Math.round(nav.getBoundingClientRect().top),hostHeight:Math.round(host.getBoundingClientRect().height),
    statHeight:stats.map(n=>Math.round(n.getBoundingClientRect().height)),stats:stats.length,
    button:!!document.getElementById('bm239-drive-action'),
    status:!!document.getElementById('bm239-sync-details'),
    hero:!!document.querySelector('main>.hero'),
    statInMain:!!document.querySelector('main>.stats'),
    version:document.documentElement.getAttribute('data-bm-portal-version')};
  });
  snapshots.push(await sample());
  await page.waitForTimeout(2500);snapshots.push(await sample());
  await page.waitForTimeout(2500);snapshots.push(await sample());
  for(const entry of snapshots){
   assert.equal(entry.stats,5,'Cinco indicadores sempre presentes');
   assert.equal(entry.version,'V262');
   assert.equal(entry.hero,false);assert.equal(entry.statInMain,false);
   assert.equal(entry.button,true);assert.equal(entry.status,true);
   assert.ok(entry.statHeight.every(h=>h===65),'Altura dos indicadores desktop deve permanecer fixa: '+JSON.stringify(entry.statHeight));
  }
  assert.ok(Math.max(...snapshots.map(x=>x.navTop))-Math.min(...snapshots.map(x=>x.navTop))<=5,
    'Navegação deslocou no carregamento: '+JSON.stringify(snapshots));
  const api=await page.evaluate(()=>({
   syncTruth:!!window.BM241SyncTruth,
   globalDrive:!!window.BM239DriveGlobal,
   statuses:window.BM241SyncTruth?.snapshot
  }));
  assert.equal(api.syncTruth,true,'Módulo de verificação V262 carregado');
  assert.equal(api.globalDrive,true,'Módulo de Drive V262 carregado');
  assert.ok(api.statuses?.cards?.state==='excluded','SRS não deve ser exibido como sincronizado');
  assert.ok(['pending','error'].includes(api.statuses.pdfs?.state),'PDF privado não deve ser confirmado sem OAuth');
  await page.setViewportSize({width:390,height:844});
  await page.waitForTimeout(350);
  const mobile=await sample();
  assert.equal(mobile.stats,5);assert.ok(mobile.statHeight.every(h=>h===60),'Altura mobile estável');
  assert.ok(mobile.hostHeight>100&&mobile.hostHeight<250,'Grade móvel compacta: '+mobile.hostHeight);
  // Navegação deve continuar funcional após estabilização do cabeçalho.
  await page.locator('nav button[data-page="pdfs"]').click();
  await page.waitForFunction(()=>document.getElementById('pdfs')?.classList.contains('active'),null,{timeout:12000});
  const safeErrors=errors.filter(x=>!/google|oauth|network|fetch|identity/i.test(x));
  assert.deepEqual(safeErrors,[],'Erros JavaScript não relacionados ao OAuth: '+JSON.stringify(safeErrors));
  console.log('V262_BROWSER_PASS '+JSON.stringify({snapshots,mobile,api,errors}));
  await context.close();
 }finally{await browser.close()}
})().catch(e=>{console.error('V262_BROWSER_FAIL',e.stack||e);process.exitCode=1});

'use strict';
/* V263 — layout Chromium real + OAuth/Drive em mocks locais sem acesso à conta do usuário. */
const assert=require('node:assert/strict');
const {chromium}=require('playwright');
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 try{
  const ctx=await browser.newContext({viewport:{width:1366,height:900}});
  const page=await ctx.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(e.stack||e.message));
  await page.route('**/assets/drive_auth_v038.json',r=>r.fulfill({status:200,contentType:'application/json',
   body:JSON.stringify({client_id:'test-v263.apps.googleusercontent.com',authorized_javascript_origin:'http://127.0.0.1:8765'})}));
  await page.route('https://accounts.google.com/gsi/client',r=>r.fulfill({status:200,contentType:'application/javascript',
   body:'window.google={accounts:{oauth2:{initTokenClient:function(c){return {requestAccessToken:function(){c.callback({access_token:"MOCK_V263_BROWSER_ONLY",expires_in:3600,scope:"https://www.googleapis.com/auth/drive.readonly https://www.googleapis.com/auth/drive.file"})}}}}}};'}));
  await page.route('https://www.googleapis.com/**',r=>r.fulfill({status:403,contentType:'application/json',body:'{"error":"forbidden in isolated test"}'}));
  await page.goto('http://127.0.0.1:8765/index.html',{waitUntil:'domcontentloaded',timeout:60000});
  const sample=()=>page.evaluate(()=>{
   const h=document.querySelector('body>header'),nav=h.querySelector('nav');
   const stats=h.querySelector('.bm-v046-header-stats');
   return {height:Math.round(h.getBoundingClientRect().height),
    nav:Math.round(nav.getBoundingClientRect().top),
    ribbon:Math.round(stats.getBoundingClientRect().height),
    visibleStats:[...stats.querySelectorAll(':scope>.stat')].filter(el=>getComputedStyle(el).display!=='none').length,
    clickTarget:!!document.getElementById('bm239-sync-details'),
    version:document.documentElement.dataset.bmPortalVersion};
  });
  const pictures=[await sample()];
  await page.waitForTimeout(1200);pictures.push(await sample());
  await page.waitForTimeout(1200);pictures.push(await sample());
  assert.ok(pictures.every(x=>x.version==='V263'));
  assert.ok(pictures.every(x=>x.height<=85),'Cabeçalho desktop deveria ser menor que 85px: '+JSON.stringify(pictures));
  assert.ok(pictures.every(x=>x.ribbon===32),'Faixa desktop 32px: '+JSON.stringify(pictures));
  assert.ok(Math.max(...pictures.map(x=>x.nav))-Math.min(...pictures.map(x=>x.nav))<=2,'Mudança de posição do menu');
  await page.setViewportSize({width:390,height:844});
  await page.waitForTimeout(500);
  const mobile=await sample();
  assert.ok(mobile.height<=90,'Cabeçalho mobile não compacto: '+JSON.stringify(mobile));
  assert.equal(mobile.visibleStats,0,'Indicadores móveis devem abrir no painel, não ocupar a tela');
  await page.locator('nav button[data-page="pdfs"]').click();
  await page.waitForFunction(()=>document.getElementById('pdfs')?.classList.contains('active'),null,{timeout:10000});
  await page.waitForFunction(()=>!document.querySelector('#bm239-drive-action')?.disabled,null,{timeout:12000});
  // As APIs a seguir são substituídas por fakes apenas neste contexto de teste.
  await page.evaluate(()=>{
   let readToken='',lastGrifos=0;
   window.BancoMestreMediaSyncV182={
    token:()=>readToken,publishToken:s=>{readToken=s;return true},
    syncAll:async()=>({at:new Date().toISOString(),
      pdf:{source:'google_drive_only',found:102,folders:8,static:78},
      img:{scope:'atlas_authenticated_session_only',found:12}})
   };
   window.BancoMestreDriveImagesV182={lastCount:12,lastError:'',
    get lastSuccess(){return new Date().toISOString()}};
   window.BM240ControlDrive={sync:async()=>({state:'empty',message:'Controle: sem registros locais para enviar'})};
   window.BM240StudyBackups={afterSync:async()=>({state:'empty',message:'Backup: sem controle local'})};
   window.BM242LacunasDrive={sync:async()=>({state:'empty',message:'Lacunas: nenhum registro privado encontrado'})};
   window.BancoMestreGrifosDriveSyncV104={
    sync:async()=>{lastGrifos=Date.now();return true},
    get lastSync(){return lastGrifos},
    get lastStatus(){return 'Cores/grifos confirmados no Drive: 3 registro(s) de páginas/metadados; exclusões sincronizadas. Sem divergências detectadas.'}
   };
  });
  await page.locator('#bm239-drive-action').click();
  await page.waitForFunction(()=>!!window.BM239DriveGlobal?.lastReport?.at,null,{timeout:25000});
  const first=await page.evaluate(()=>window.BM239DriveGlobal.lastReport);
  assert.equal(first.warnings.length,0,'Estado vazio foi tratado como falha: '+JSON.stringify(first.warnings));
  assert.ok(first.pending.length>=3,'Controle vazio e Lacunas vazias devem ser pendências');
  assert.equal(first.modules.pdfs.state,'verified');
  assert.equal(first.modules.atlas.state,'verified');
  assert.equal(first.modules.control.state,'pending');
  assert.equal(first.modules.lacunas.state,'pending');
  assert.equal(first.modules.grifos.state,'verified');
  assert.equal(first.complete,false,'Não declarar tudo sincronizado quando faltam dados');
  await page.locator('#bm239-sync-details').click();
  await page.locator('#bm263-sync-panel').waitFor({state:'visible',timeout:5000});
  assert.ok((await page.locator('#bm263-report-list').innerText()).includes('Pendente'));
  assert.equal(await page.locator('#bm263-copy-diagnostic').count(),1);
  await page.evaluate(()=>{
   window.BM240ControlDrive={sync:async()=>({state:'error',message:'Controle: HTTP 403 - permissão insuficiente'})};
   window.BM242LacunasDrive={sync:async()=>({state:'conflict',message:'Lacunas: dados de dispositivos divergentes; sem substituição'})};
  });
  const after=await page.evaluate(()=>window.BM239DriveGlobal.sync());
  assert.equal(after.modules.control.state,'error');
  assert.equal(after.modules.lacunas.state,'conflict');
  assert.equal(after.warnings.length,2,'Erros reais precisam continuar visíveis');
  assert.ok(!JSON.stringify(after).includes('MOCK_V263_BROWSER_ONLY'),'Relatório não pode conter token');
  await page.waitForTimeout(300);
  const panelText=await page.locator('#bm263-report-list').innerText();
  assert.ok(panelText.includes('HTTP 403'));
  assert.ok(panelText.includes('Conflito'));
  const severe=errors.filter(x=>!/google|oauth|network|identity/i.test(x));
  assert.deepEqual(severe,[],'Erros JavaScript em navegador: '+JSON.stringify(severe));
  console.log('V263_BROWSER_PASS '+JSON.stringify({desktop:pictures,mobile,emptyFirst:{verified:first.notes.length,pending:first.pending.length,errors:first.warnings.length},realErrorsAfter:{errors:after.warnings.length,control:after.modules.control.state,lacunas:after.modules.lacunas.state},jsErrors:severe.length,auth:'mock only'}));
  await ctx.close();
 }finally{await browser.close()}
})().catch(e=>{console.error('V263_BROWSER_FAIL',e.stack||e);process.exitCode=1});

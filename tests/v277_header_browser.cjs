'use strict';
/* Teste visual básico do CSS V277 em navegador isolado, sem acessar Drive privado. */
const assert=require('node:assert/strict');
const {chromium}=require('playwright');
const fs=require('node:fs');
const expectedVersion=JSON.parse(fs.readFileSync('assets/version.json','utf8')).version;
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 try{
  for(const size of [{width:1366,height:900},{width:390,height:844}]){
   const page=await browser.newPage({viewport:size});
   await page.route('https://accounts.google.com/**',r=>r.abort());
   await page.route('https://www.googleapis.com/**',r=>r.abort());
   const requests=[];
   page.on('response',r=>{if(r.url().includes('v277_header_compiled.css'))requests.push({status:r.status(),url:r.url()})});
   await page.goto('http://127.0.0.1:8765/index.html',{waitUntil:'domcontentloaded',timeout:60000});
   await page.locator('header .brand').waitFor();
   await page.waitForFunction(()=>window.BM309MobileTabs?.ready,{timeout:15000});
   const state=await page.evaluate(()=>{
    const head=document.querySelector('body>header'),nav=head?.querySelector('nav');
    const drive=document.getElementById('bm239-drive-action'),details=document.getElementById('bm239-sync-details');
    const computed=el=>el?getComputedStyle(el):null;
    return {
     version:document.documentElement.dataset.bmPortalVersion,
     compiled:[...document.styleSheets].some(s=>(s.href||'').includes('v277_header_compiled.css')),
     cssLinks:document.querySelectorAll('link[rel="stylesheet"]').length,
     headerVisible:!!head&&head.getBoundingClientRect().height>0,
     navVisible:!!nav&&nav.getBoundingClientRect().height>0,
     menuVisible:!!document.getElementById('bm309-mobile-tabs-toggle')&&getComputedStyle(document.getElementById('bm309-mobile-tabs-toggle')).display!=='none',
     navCollapsed:!!nav?.hidden,
     actionsPresent:!!drive&&!!details,
     driveDisplay:computed(drive)?.display,detailsDisplay:computed(details)?.display,
     bodyScrollWidth:document.documentElement.scrollWidth
    };
   });
   assert.equal(state.version,expectedVersion);
   const expectedCss={V303:18,V304:19,V305:20,V306:21,V307:22,V308:23,V309:24,V310:24}[expectedVersion];
   assert.ok(expectedCss,'Versão não auditada: '+expectedVersion);
   assert.equal(state.cssLinks,expectedCss,'Orçamento CSS divergente da versão '+expectedVersion);
   assert.ok(state.compiled,'Bundle CSS não entrou na CSSOM');
   assert.ok(requests.some(x=>x.status===200),'Arquivo CSS não retornou HTTP 200');
   assert.ok(state.headerVisible&&state.actionsPresent&&(size.width<=620?(state.menuVisible&&state.navCollapsed):state.navVisible),'Layout de cabeçalho/menu não montou: '+JSON.stringify(state));
   assert.notEqual(state.driveDisplay,'none');
   assert.notEqual(state.detailsDisplay,'none');
   await page.close();
   console.log(expectedVersion+'_HEADER_BROWSER_PASS '+size.width+'x'+size.height+': CSS pronto, cabeçalho presente');
  }
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});

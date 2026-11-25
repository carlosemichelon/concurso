'use strict';
const {chromium}=require('playwright'),http=require('node:http'),fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=process.cwd(),types={'.html':'text/html','.js':'application/javascript','.json':'application/json','.svg':'image/svg+xml','.css':'text/css'};
const server=http.createServer((req,res)=>{const f=path.resolve(root,'.'+new URL(req.url,'http://localhost').pathname);if(!f.startsWith(root+path.sep)||!fs.existsSync(f)||!fs.statSync(f).isFile()){res.writeHead(404);res.end();return}res.setHeader('Content-Type',types[path.extname(f)]||'application/octet-stream');fs.createReadStream(f).pipe(res)});
const doc=Array.from({length:36},(_,i)=>{const n=i+1;return n+'. SEÇÃO FICTÍCIA '+n+'\n'+(n===18?Array.from({length:12},()=> 'Retângulo:\nA = b·h; I_x = b·h³/12; I_y = h·b³/12; W_x = b·h²/6.\nCírculo:\nA = πd²/4; I_x = πd⁴/64.').join('\n\n'):'I = b·h³/12\nFórmula fictícia de teste')}).join('\n\n');
(async()=>{await new Promise(r=>server.listen(0,'127.0.0.1',r));const url='http://127.0.0.1:'+server.address().port,browser=await chromium.launch({headless:true});try{
for(const width of [1366,390]){
 const page=await browser.newPage({viewport:{width,height:800}});let reads=0;const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.route('https://**/*',async r=>{const u=new URL(r.request().url());if(u.hostname==='www.googleapis.com'&&u.pathname.includes('1eOla5S9In1LTB6IJkJPLmP8mQfM2P2urk33jgCYam5M')){reads++;const headers={'access-control-allow-origin':'*','access-control-allow-headers':'authorization','access-control-allow-methods':'GET, OPTIONS'};if(r.request().method()==='OPTIONS')return r.fulfill({status:204,headers});if(u.pathname.endsWith('/export'))return r.fulfill({headers,contentType:'text/plain',body:doc});return r.fulfill({headers,json:{id:'1eOla5S9In1LTB6IJkJPLmP8mQfM2P2urk33jgCYam5M',mimeType:'application/vnd.google-apps.document',modifiedTime:'2026-11-25T00:00:00Z',version:'1',trashed:false}})}return r.abort()});
 await page.goto(url+'/index.html',{waitUntil:'domcontentloaded',timeout:60000});
 await page.waitForFunction(()=>window.BM246Formulas&&window.BancoMestreMediaSyncV182);
 // Real portal, real listeners; only identity and Drive response are simulated.
 await page.evaluate(()=>{const prev=window.BancoMestreMediaSyncV182;window.BancoMestreMediaSyncV182={...prev,token:()=> 'mock-token'};window.BM246Formulas.open()});
 await page.waitForFunction(()=>window.BM246Formulas.status.sectionCount===36);
 await page.locator('button.bm246-formula-entry[data-formula-section="18"]').click();
 const dlg=page.locator('#bm427FormulaDialog');
 await dlg.waitFor({state:'visible'});assert.equal(await dlg.getAttribute('data-formula-section'),'18');
 const check=await dlg.evaluate(d=>{const sc=d.querySelector('.bm427-formula-scroll');const nested=[...sc.querySelectorAll('*')].filter(e=>{const s=getComputedStyle(e);return /auto|scroll/.test(s.overflowY)&&e.scrollHeight>e.clientHeight+2});return {scroll:sc.scrollHeight>sc.clientHeight,nested:nested.map(e=>e.className?.baseVal||e.className),foot:d.querySelector('.bm427-formula-foot').getBoundingClientRect().bottom,view:innerHeight}});
 assert.equal(check.scroll,true);assert.deepEqual(check.nested,[]);assert.ok(check.foot<=check.view);
 await dlg.locator('.bm427-formula-scroll').evaluate(e=>e.scrollTop=e.scrollHeight);
 const before=reads;await dlg.locator('#bm430FormulaNext').click();assert.equal(await dlg.getAttribute('data-formula-section'),'3');assert.equal(await dlg.locator('.bm427-formula-scroll').evaluate(e=>e.scrollTop),0);
 await dlg.locator('#bm430FormulaPrev').click();assert.equal(await dlg.getAttribute('data-formula-section'),'18');assert.equal(reads,before,'navegação não consulta Drive');
 console.log(width+'px: portal integral, rolagem única, seção 18 → 3 → 18; sem consulta adicional.');await page.close()
}
}finally{await browser.close();server.close()}})().catch(e=>{console.error(e);server.close();process.exitCode=1});

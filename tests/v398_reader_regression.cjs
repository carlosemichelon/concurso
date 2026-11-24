'use strict';
const {chromium}=require('playwright'),http=require('node:http'),fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=process.cwd(),types={'.html':'text/html','.js':'application/javascript','.json':'application/json','.svg':'image/svg+xml','.css':'text/css'};
const server=http.createServer((req,res)=>{const f=path.resolve(root,'.'+new URL(req.url,'http://localhost').pathname);if(!f.startsWith(root+path.sep)||!fs.existsSync(f)||!fs.statSync(f).isFile()){res.writeHead(404);return res.end()}res.setHeader('Content-Type',types[path.extname(f)]||'application/octet-stream');fs.createReadStream(f).pipe(res)});
(async()=>{await new Promise(r=>server.listen(0,'127.0.0.1',r));const browser=await chromium.launch({headless:true});try{
 const m=JSON.parse(fs.readFileSync('assets/version.json','utf8')),ids=m.release_vc31.updated_ids, p=await browser.newPage({viewport:{width:1366,height:900}});
 await p.route('https://accounts.google.com/**',r=>r.abort());await p.route('https://www.googleapis.com/**',r=>r.abort());
 await p.goto('http://127.0.0.1:'+server.address().port+'/index.html',{waitUntil:'domcontentloaded',timeout:60000});await p.waitForFunction(()=>typeof loadCards==='function'&&window.BM349,{timeout:30000});await p.evaluate(()=>loadCards());
 const result=[];
 for(const id of ['CARD-1448',...ids.filter(x=>x!=='CARD-1448'),'CARD-0701']){
  const opened=await p.evaluate(id=>window.BancoMestreVisualizarCardV050.showId(id),id);assert.ok(opened,id+' abrir');
  const answer=p.locator('#bmCardPeekV050 .bm-v050-peek-answer');assert.equal(await answer.isVisible(),false,id+' frente revela verso');
  await p.locator('#bmCardPeekV050 .bm-v050-peek-reveal').click();
  const article=answer.locator('.bm349-reading');await article.waitFor({state:'visible',timeout:10000});
  const observed=await article.evaluate(a=>({id:a.dataset.bm349Card,fallback:a.dataset.renderFallback,txt:a.textContent,modules:a.querySelectorAll('.historic-module').length,imgs:[...a.querySelectorAll('img')].map(x=>x.getAttribute('src')),math:a.querySelectorAll('math').length}));
  assert.equal(observed.id,id);assert.ok(!observed.fallback,id+' fallback');assert.ok(observed.txt.length>150,id+' texto vazio');assert.equal(observed.modules,11,id+' módulos');
  if(id==='CARD-1448'){assert.ok(observed.txt.includes('pressão corrigida de penetração'));assert.ok(observed.imgs.some(x=>x.includes('camadas.svg')));assert.ok(observed.math>=1);await article.locator('img[src*="camadas.svg"]').evaluate(img=>img.decode());}
  result.push({id,modules:observed.modules,images:observed.imgs.length,math:observed.math});
  await p.evaluate(()=>window.BancoMestreVisualizarCardV050.close());
 }
 console.log(JSON.stringify({ok:true,checked:result.length,vc:m.catalog.display_version,card1448:result[0],cards:result.map(x=>x.id)}));
}finally{await browser.close();server.close()}})().catch(e=>{console.error(e);server.close();process.exitCode=1});

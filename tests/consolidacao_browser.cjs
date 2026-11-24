'use strict';
const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=process.argv[2]||'.',packet=JSON.parse(fs.readFileSync(path.join(root,'candidatos/consolidacao_conceitual_25_v1.json'),'utf8'));
(async()=>{const browser=await chromium.launch({headless:true,args:['--no-sandbox']});const report=[];
try{for(const viewport of [{width:1440,height:950},{width:390,height:844}]){const page=await browser.newPage({viewport});await page.route('**/*',route=>{const u=new URL(route.request().url());return ['127.0.0.1','localhost'].includes(u.hostname)||u.protocol==='data:'?route.continue():route.abort()});
await page.goto('http://127.0.0.1:8765/index.html',{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>window.BM349&&window.BancoMestreVisualizarCardV050?.ready);
await page.evaluate(async()=>{await loadCards();});
const counts=await page.evaluate(()=>({all:cards.filter(c=>!c.provisional).length,active:cards.filter(c=>!c.provisional&&c.active!==false).length,primary:cards.filter(c=>c.consolidation?.profile).length,aliases:cards.filter(c=>c.consolidated_into).length}));
assert.equal(counts.primary,25);assert.equal(counts.aliases,56);
for(const r of packet.revisions){
await page.evaluate(id=>window.BancoMestreVisualizarCardV050.showId(id),r.id);
const host=page.locator('#bmCardPeekV050 .bm-v050-peek-answer');await host.waitFor({state:'hidden'});
const reveal=page.locator('#bmCardPeekV050 button').filter({hasText:'Revelar resposta'}).first();await reveal.click();
const article=host.locator('[data-bm-consolidated="'+r.id+'"]');await article.waitFor({state:'visible'});
assert.equal(await article.locator('mark').count(),r.editorial.highlights.length,r.id);
assert.equal(await article.locator(':scope > section > .table-wrap > table').count(),1,r.id);
assert.equal(await article.locator(':scope > .formula math').count(),r.editorial.formulas.length,r.id);
const figures=article.locator(':scope > figure');const expected=r.editorial.media.filter(m=>m.role==='VERSO_APOS_TENTATIVA');assert.equal(await figures.count(),expected.length,r.id);
for(const m of expected){const figure=article.locator(':scope > figure[data-media-id="'+m.id+'"]');assert.equal(await figure.count(),1,m.id);assert.equal(await figure.getAttribute('data-role'),m.role,m.id);if(m.private_original){assert.equal(await figure.locator('img').count(),0,m.id);assert.equal(await figure.locator('[data-private-state]').count(),1,m.id);}else{const image=figure.locator('img');await image.evaluate(im=>im.decode());assert.ok(await image.evaluate(im=>im.naturalWidth>0),m.id);}}
assert.equal(await article.locator('.historic-module').count(),11,r.id);
assert.equal(await article.locator('details.evolution').getAttribute('open'),null,r.id);
if(['CARD-1610','CARD-1426','CARD-1503'].includes(r.id)){await page.screenshot({path:'preview-'+viewport.width+'-'+r.id+'.png',fullPage:false});}
report.push({id:r.id,width:viewport.width,ok:true});await page.evaluate(()=>window.BancoMestreVisualizarCardV050.close());
}await page.close();}console.log(JSON.stringify({tested:report.length,report}));}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1});

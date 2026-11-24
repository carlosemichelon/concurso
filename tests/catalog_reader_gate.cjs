'use strict';
// Teste obrigatório do leitor para IDs novos/alterados; sem OAuth, sem SRS.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),cp=require('node:child_process');
const git=(...args)=>cp.execFileSync('git',args,{encoding:'utf8',maxBuffer:64*1024*1024});
const m=JSON.parse(fs.readFileSync('assets/version.json','utf8')),snapshot=JSON.parse(fs.readFileSync(m.catalog.path,'utf8'));
const active=c=>c.active!==false&&!c.provisional;
const signature=c=>JSON.stringify([c.front,c.back,c.expl,c.reference,c.mnemonic,c.consolidation?.profile]);
function changedIds(base){
 if(!base||/^0+$/.test(base))throw Error('Informar base válida para validação incremental');
 const old=JSON.parse(git('show',base+':assets/version.json'));
 if(old.catalog.git_blob===m.catalog.git_blob)return [];
 const p=JSON.parse(git('show',base+':'+old.catalog.path)),before=new Map(p.base.map(c=>[c.id,c]));
 return snapshot.base.filter(c=>active(c)&&(!before.has(c.id)||signature(before.get(c.id))!==signature(c))).map(c=>c.id);
}
const ids=process.argv.includes('--smoke')?['CARD-1448','CARD-0701']:changedIds(process.argv[2]);
if(process.argv.includes('--plan')){console.log('count='+ids.length);console.log('ids='+ids.join(','));process.exit(0);}
if(!ids.length){console.log(JSON.stringify({ok:true,checked:0,reason:'Sem alteração de conteúdo'}));process.exit(0);}
const {chromium}=require('playwright'),http=require('node:http');
const root=process.cwd(),types={'.html':'text/html','.js':'application/javascript','.json':'application/json','.svg':'image/svg+xml','.css':'text/css'};
const server=http.createServer((req,res)=>{const f=path.resolve(root,'.'+new URL(req.url,'http://localhost').pathname);if(!f.startsWith(root+path.sep)||!fs.existsSync(f)||!fs.statSync(f).isFile()){res.writeHead(404);return res.end()}res.setHeader('Content-Type',types[path.extname(f)]||'application/octet-stream');fs.createReadStream(f).pipe(res)});
const norm=s=>String(s||'').replace(/\s+/g,' ').trim();
(async()=>{await new Promise(r=>server.listen(0,'127.0.0.1',r));const browser=await chromium.launch({headless:true});try{
 const p=await browser.newPage({viewport:{width:1366,height:900}});
 await p.route('https://accounts.google.com/**',r=>r.abort());await p.route('https://www.googleapis.com/**',r=>r.abort());
 await p.goto('http://127.0.0.1:'+server.address().port+'/index.html',{waitUntil:'domcontentloaded',timeout:60000});
 await p.waitForFunction(()=>typeof loadCards==='function'&&window.BM349,{timeout:30000});await p.evaluate(()=>loadCards());
 const result=[],lookup=new Map(snapshot.base.map(c=>[c.id,c]));
 for(const id of ids){
  const c=lookup.get(id),profile=c?.consolidation?.profile;assert.ok(c&&active(c),id+' ID');
  assert.ok(await p.evaluate(id=>window.BancoMestreVisualizarCardV050.showId(id),id),id+' abrir');
  const answer=p.locator('#bmCardPeekV050 .bm-v050-peek-answer');assert.equal(await answer.isVisible(),false,id+' verso antes da tentativa');
  await p.locator('#bmCardPeekV050 .bm-v050-peek-reveal').click();
  if(profile){
   const article=answer.locator('.bm349-reading');await article.waitFor({state:'visible',timeout:10000});
   const o=await article.evaluate(a=>({id:a.dataset.bm349Card,fallback:a.dataset.renderFallback,text:a.textContent,modules:a.querySelectorAll('.historic-module').length,imgs:[...a.querySelectorAll('figure[data-media-id]')].filter(x=>x.querySelector('img')).map(x=>({id:x.dataset.mediaId,src:x.querySelector('img').getAttribute('src')})),math:a.querySelectorAll('.formula math').length,tables:a.querySelectorAll('table').length}));
   assert.equal(o.id,id);assert.ok(!o.fallback,id+' fallback não é aprovação');
   assert.ok(norm(o.text).includes(norm(profile.back)),id+' verso não corresponde ao catálogo');assert.equal(o.modules,11,id+' módulos');
   const e=profile.editorial||{};if(Array.isArray(e.answer_paragraphs)&&e.answer_paragraphs.join('\n\n')===profile.back){const blocks=await article.locator('p[data-bm-answer-paragraph]').allTextContents();assert.deepEqual(blocks,e.answer_paragraphs,id+' parágrafos editoriais colados ou alterados');}assert.ok(o.math>=(e.formulas||[]).length,id+' fórmulas ausentes');
   if(e.table)assert.ok(o.tables>=1,id+' tabela ausente');
   for(const img of (e.media||[]).filter(x=>x.role==='VERSO_APOS_TENTATIVA'&&(x.src||x.inline_svg))){
    const got=o.imgs.find(x=>x.id===img.id);assert.ok(got,id+' mídia ausente '+img.id);
    if(img.src&&!img.inline_svg)assert.equal(got.src,img.src,id+' vínculo');
   }
   await article.locator('figure img').evaluateAll(async imgs=>{for(const img of imgs){await img.decode();if(!img.naturalWidth)throw Error('Imagem sem largura '+img.src);}});
   result.push({id,modules:o.modules,images:o.imgs.length,math:o.math});
  }else{
   await p.waitForFunction(()=>{const a=document.querySelector('#bmCardPeekV050 .bm-v050-peek-answer');return a&&!a.hidden&&a.innerText.trim().length>0;},{},{timeout:10000});
   const v=await answer.innerText();assert.ok(norm(v).length>0&&!/^(Falha ao carregar|Carregando resposta)/i.test(norm(v)),id+' verso vazio/erro');
   result.push({id,legacy:true});
  }
  await p.evaluate(()=>window.BancoMestreVisualizarCardV050.close());
 }
 console.log(JSON.stringify({ok:true,checked:result.length,vc:m.catalog.display_version,results:result}));
}finally{await browser.close();server.close()}})().catch(e=>{console.error(e);server.close();process.exitCode=1});

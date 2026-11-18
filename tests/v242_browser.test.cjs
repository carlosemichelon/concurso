/* E2E V241 — navegador real sem autorização privada Google; perfil descartável. */
const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const fs = require('node:fs/promises');
const path = require('node:path');
const { chromium } = require('playwright');

const root = path.resolve(__dirname, '..');
let server, browser, base;
const TYPE = {'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8',
 '.css':'text/css; charset=utf-8','.json':'application/json','.svg':'image/svg+xml',
 '.png':'image/png','.jpg':'image/jpeg','.webp':'image/webp','.woff2':'font/woff2'};
const seed = {
 schema:1, subjects:[{id:'e2e-eng-civil',name:'Engenharia Civil',color:'#318980',
 difficulty:3,weight:3,exam:50,daily:2,weekly:10,monthly:40}],
 sessions:[],reviews:[],cycle:[],cycleIndex:0,availabilityWeek:15,availabilityMonth:60
};
async function newPage(options={}){
 const context=await browser.newContext({viewport:options.viewport||{width:1440,height:900}});
 const page=await context.newPage();
 await page.route('https://**/*',route=>route.abort());
 await page.addInitScript(v=>{
  if(!localStorage.getItem('BM_CONTROLE_ESTUDOS_V238'))
   localStorage.setItem('BM_CONTROLE_ESTUDOS_V238',JSON.stringify(v));
 },seed);
 return {page,context};
}
async function portal(page,fragment=''){
 await page.goto(base+'/v242.html'+fragment,{waitUntil:'domcontentloaded',timeout:30000});
 await page.locator('#bm241-bar').waitFor({state:'attached',timeout:30000});
 await page.locator('#bm238-study-frame').waitFor({state:'attached',timeout:30000});
 await page.locator('#bm241-subject option[value="e2e-eng-civil"]').waitFor({state:'attached',timeout:30000});
 await page.waitForFunction(()=>Boolean(window.BM241TimerHeader?.state),null,{timeout:30000});
}
function clockStore(page){return page.evaluate(()=>JSON.parse(localStorage.getItem('BM_CONTROLE_TIMER_V238')||'null'));}
function dataStore(page){return page.evaluate(()=>JSON.parse(localStorage.getItem('BM_CONTROLE_ESTUDOS_V238')||'null'));}
before(async()=>{
 server=http.createServer(async(req,res)=>{
  const pathname=decodeURIComponent(new URL(req.url,'http://local').pathname);
  const filename=path.resolve(root,'.'+pathname);
  if(!filename.startsWith(root+path.sep)){res.writeHead(403);res.end();return}
  try{
   const bytes=await fs.readFile(filename);
   res.writeHead(200,{'Content-Type':TYPE[path.extname(filename)]||'application/octet-stream','Cache-Control':'no-store'});
   res.end(bytes);
  }catch(e){res.writeHead(404);res.end('not found')}
 });
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 base='http://127.0.0.1:'+server.address().port;
 browser=await chromium.launch({headless:true,args:['--no-sandbox']});
});
after(async()=>{if(browser)await browser.close();if(server)await new Promise(r=>server.close(r))});

test('página inicial é Controle de Estudos; botões e status são montados',async()=>{
 const {page,context}=await newPage();
 try{
  await portal(page);
  assert.equal(await page.locator('#bm238-study-tab').first().textContent(),'Controle de Estudos');
  assert.equal(await page.locator('main #controle-estudos').evaluate(x=>x.classList.contains('active')),true);
  assert.equal(await page.locator('header nav button[data-page]').first().getAttribute('data-page'),'controle-estudos');
  for(const key of ['pdfs','cards','atlas','control','grifos']){
   await page.locator('.bm241-'+key+' .bm241-verification, .stat:nth-child('+
    (key==='pdfs'?1:key==='cards'?2:key==='atlas'?3:999)+') .bm241-verification').first().waitFor({state:'attached',timeout:10000});
  }
  const statuses=await page.evaluate(()=>window.BM241SyncTruth?.snapshot);
  assert.ok(statuses,'status de integração não montado');
  assert.equal(statuses.cards.state,'excluded');
  assert.notEqual(statuses.pdfs.state,'verified');
  assert.notEqual(statuses.atlas.state,'verified');
  assert.ok(await page.locator('#bm241-bar').isVisible());
 }finally{await context.close()}
});

test('cronômetro no cabeçalho: início, pausa sem contar, retomada e gravação única',async()=>{
 const {page,context}=await newPage();
 try{
  await portal(page);
  await page.locator('#bm241-subject').selectOption('e2e-eng-civil');
  await page.locator('#bm241-topic').fill('NBR 6118');
  await page.locator('#bm241-start').click();
  await page.waitForFunction(()=>document.title.includes('▶')&&document.title.includes('NBR 6118'),null,{timeout:10000});
  await page.waitForTimeout(1250);
  const beforePause=await page.evaluate(()=>window.BM241TimerHeader.state.elapsedMs);
  await page.locator('#bm241-pause').click();
  await page.waitForFunction(()=>document.title.includes('⏸'),null,{timeout:10000});
  const pauseTime=await page.evaluate(()=>window.BM241TimerHeader.state.elapsedMs);
  await page.waitForTimeout(1200);
  const stillPaused=await page.evaluate(()=>window.BM241TimerHeader.state.elapsedMs);
  assert.ok(stillPaused-pauseTime<450,'tempo avançou enquanto pausado');
  assert.ok(beforePause>800,'tempo inicial insuficiente');
  await page.locator('#bm241-resume').click();
  await page.waitForFunction(()=>document.title.startsWith('▶'),null,{timeout:10000});
  await page.waitForTimeout(1100);
  await page.locator('#bm241-pause').click();
  await page.waitForFunction(()=>document.title.startsWith('⏸'),null,{timeout:10000});
  await page.locator('#bm241-save').click();
  await page.waitForFunction(()=>document.title.startsWith('Banco Mestre'),null,{timeout:10000});
  const saved=await dataStore(page);
  assert.equal(saved.sessions.length,1,'deve ser salva exatamente uma sessão');
  assert.equal(saved.sessions[0].subjectId,'e2e-eng-civil');
  assert.equal(saved.sessions[0].topic,'NBR 6118');
  assert.ok(saved.sessions[0].minutes>0);
  const clock=await clockStore(page);assert.equal(clock.running,false);
 }finally{await context.close()}
});

test('recarregar durante execução preserva tempo líquido e matéria',async()=>{
 const {page,context}=await newPage();
 try{
  await portal(page);
  await page.locator('#bm241-subject').selectOption('e2e-eng-civil');
  await page.locator('#bm241-topic').fill('Topografia');
  await page.locator('#bm241-start').click();
  await page.waitForTimeout(1500);
  const prior=await clockStore(page);
  assert.ok(prior?.running);
  await page.reload({waitUntil:'domcontentloaded'});
  await page.locator('#bm241-bar').waitFor({state:'attached',timeout:30000});
  await page.waitForFunction(()=>window.BM241TimerHeader?.state?.kind==='running',null,{timeout:30000});
  const later=await page.evaluate(()=>window.BM241TimerHeader.state);
  assert.equal(later.topic,'Topografia');
  assert.ok(later.elapsedMs>=1000,'tempo zerado após recarga');
  await page.locator('#bm241-pause').click();
  await page.waitForFunction(()=>window.BM241TimerHeader.state.kind==='paused',null,{timeout:10000});
 }finally{await context.close()}
});

test('link explícito #pdfs preserva destino e mantém barra de cronômetro',async()=>{
 const {page,context}=await newPage();
 try{
  await portal(page,'#pdfs');
  assert.equal(await page.locator('#pdfs').evaluate(x=>x.classList.contains('active')),true);
  assert.ok(await page.locator('#bm241-bar').isVisible());
 }finally{await context.close()}
});

test('visual compacto é operável em viewport de celular',async()=>{
 const {page,context}=await newPage({viewport:{width:390,height:844}});
 try{
  await portal(page);
  assert.ok(await page.locator('#bm241-start').isVisible());
  const bbox=await page.locator('#bm241-start').boundingBox();
  assert.ok(bbox&&bbox.x>=0&&bbox.x+bbox.width<=395,'botão iniciar fora da tela');
  const nav=await page.locator('header nav').first().boundingBox();
  assert.ok(nav&&nav.width<=395,'menu externo à viewport');
 }finally{await context.close()}
});


test('simulação dos indicadores: sucesso somente com evidência e conflito preservado',async()=>{
 const {page,context}=await newPage();
 try{
  await portal(page);
  const before=await page.evaluate(()=>window.BM241SyncTruth.snapshot);
  for(const k of ['pdfs','atlas','control','grifos'])assert.notEqual(before[k].state,'verified');
  await page.evaluate(()=>{
   window.BM239DriveGlobal={
    connected:true,
    lastReport:{
     at:new Date().toISOString(),
     notes:['78 PDFs consultados no Drive','101 imagens originais consultadas no Drive',
      'Controle: mestre privado criado e verificado',
      'Grifos: mestre privado conferido, sem divergências'],
     warnings:[],complete:true,
     summary:'SIMULAÇÃO AUTOMATIZADA — não é prova de OAuth Google'
    }
   };
   window.BM241SyncTruth.refresh();
  });
  const complete=await page.evaluate(()=>window.BM241SyncTruth.snapshot);
  for(const k of ['pdfs','atlas','control','grifos'])
   assert.equal(complete[k].state,'verified',k+' não reconheceu evidência simulada');
  assert.equal(complete.cards.state,'excluded','SRS nunca deve ser atestado');
  await page.evaluate(()=>{
   window.BM239DriveGlobal.lastReport={
    ...window.BM239DriveGlobal.lastReport,
    notes:['78 PDFs consultados no Drive','101 imagens originais consultadas no Drive',
      'Controle: mestre privado criado e verificado'],
    warnings:['Grifos: Existem 2 divergência(s) preservada(s) para revisão.'],
    complete:false
   };
   window.BM241SyncTruth.refresh();
  });
  const conflict=await page.evaluate(()=>window.BM241SyncTruth.snapshot);
  assert.equal(conflict.grifos.state,'partial','divergência não pode ser sucesso');
  assert.equal(conflict.cards.state,'excluded');
 }finally{await context.close()}
});

test('cronômetro fica fixado no rodapé e não cobre o conteúdo',async()=>{
 const {page,context}=await newPage();
 try{
  await portal(page);
  await page.waitForFunction(()=>window.BM242TimerDock?.attached===true,null,{timeout:10000});
  const layout=await page.evaluate(()=>{
   const bar=document.getElementById('bm241-bar'),box=bar.getBoundingClientRect();
   const cs=getComputedStyle(bar),bottom=parseFloat(getComputedStyle(document.body).paddingBottom)||0;
   return {position:cs.position,top:box.top,bottom:box.bottom,height:box.height,
    viewport:window.innerHeight,padding:bottom,parent:bar.parentElement?.tagName};
  });
  assert.equal(layout.parent,'BODY');
  assert.equal(layout.position,'fixed');
  assert.ok(Math.abs(layout.bottom-layout.viewport)<3,'rodapé não alinhado à base');
  assert.ok(layout.padding>=layout.height,'espaço de rolagem inferior insuficiente');
  const before=await page.locator('#bm241-bar').boundingBox();
  await page.evaluate(()=>window.scrollTo(0,document.body.scrollHeight));
  await page.waitForTimeout(150);
  const after=await page.locator('#bm241-bar').boundingBox();
  assert.ok(Math.abs(after.y-before.y)<3,'barra não permaneceu fixa ao rolar');
 }finally{await context.close()}
});
test('em celular, cadastro de matéria amplia o rodapé sem esconder conteúdo',async()=>{
 const {page,context}=await newPage({viewport:{width:390,height:844}});
 try{
  await portal(page);
  await page.waitForFunction(()=>window.BM242TimerDock?.attached===true);
  await page.locator('#bm241-add').click();
  await page.locator('#bm241-new-name').fill('Geotecnia');
  await page.waitForTimeout(200);
  const state=await page.evaluate(()=>{
   const bar=document.getElementById('bm241-bar'),r=bar.getBoundingClientRect();
   return {bottom:r.bottom,height:r.height,viewport:innerHeight,
    bodyPadding:parseFloat(getComputedStyle(document.body).paddingBottom)||0};
  });
  assert.ok(Math.abs(state.bottom-state.viewport)<3);
  assert.ok(state.bodyPadding>=state.height,'barra expandida sem reserva na página');
  await page.locator('#bm241-new-cancel').click();
 }finally{await context.close()}
});

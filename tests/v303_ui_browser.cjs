'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs');
const {chromium}=require('playwright');
const fixture={schema:1,updatedAt:'2026-11-19T12:00:00.000Z',log:[],records:[{
 id:'LAC-TESTE-001',cardIds:['CARD-1338'],relatoEstudante:'Não compreendi a relação entre fórmulas.',
 diagnosticoAssistente:'',descricao:'Revisar aplicação do coeficiente',disciplina:'Engenharia Civil',
 assuntoGeral:'Estruturas',assuntoEspecifico:'Concreto',subassunto:'Flexão',tipo:'Aplicação',
 cobertura:'Parcial',etapa:'Identificada',prioridade:'Alta',origem:'Questão',questaoId:'TEST-Q1',
 enunciado:'Questão de teste',respostaEstudante:'B',gabarito:'C',fonte:'Fonte simulada',
 pesquisa:'',auditoriaStatus:'Teste isolado',historico:[],createdAt:'2026-11-19T12:00:00.000Z'
}]};
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 fs.mkdirSync('test-artifacts/v303',{recursive:true});
 try{
  for(const width of [1366,390]){
   const page=await browser.newPage({viewport:{width,height:width>600?900:844}});
   await page.addInitScript(x=>{try{localStorage.setItem('BM_LACUNAS_V242',JSON.stringify(x))}catch(_){}} ,fixture);
   await page.route('https://accounts.google.com/**',r=>r.abort());
   await page.route('https://www.googleapis.com/**',r=>r.abort());
   const errors=[];page.on('pageerror',e=>errors.push(String(e)));
   await page.goto('http://127.0.0.1:8765/index.html',{waitUntil:'domcontentloaded',timeout:60000});
   await page.waitForFunction(()=>window.BM303UnifiedFilters?.ready,{timeout:14000});
   for(const [tab,toolbar,more,mainId,advancedId] of [
     ['assuntos','bm303-assuntos-toolbar',null,'topicSearch',null],
     ['pdfs','bm303-pdf-toolbar','Áreas, PDFs locais e ferramentas','pdfSearch','pdfHidden'],
     ['cartoes','bm303-card-toolbar','Assuntos, ordenação e opções','cardSearch','bm281IdOrder'],
     ['imagens','bm303-image-toolbar','Assuntos, classificação e opções','imageSearch','bm155GeneralImagem']
   ]){
    await page.locator('header nav button[data-page="'+tab+'"]').evaluate(x=>x.click());
    await page.locator('#'+toolbar).waitFor({state:'visible',timeout:12000});
    const metrics=await page.evaluate(({tab,toolbar,mainId,advancedId})=>{
     const host=document.getElementById(tab),panel=host.querySelector(':scope>.panel'),bar=document.getElementById(toolbar);
     const main=bar.querySelector('.bm303-primary'),details=bar.querySelector('.bm303-more');
     const rect=x=>x.getBoundingClientRect();
     const primary=bar.querySelector('.bm303-primary').querySelectorAll('input[type="search"],select');
     const advanced=advancedId?document.getElementById(advancedId):null;
     return {version:document.documentElement.dataset.bmPortalVersion,
      panelX:rect(panel).x,panelW:rect(panel).width,barX:rect(bar).x,barW:rect(bar).width,
      pageWidth:document.documentElement.scrollWidth,viewport:innerWidth,
      primaryCount:primary.length,mainVisible:rect(document.getElementById(mainId)).height>0,
      detailsClosed:details?!details.open:true,hidden:advanced?rect(advanced).height===0:true,
      panelDisplay:getComputedStyle(panel).display};
    },{tab,toolbar,mainId,advancedId});
    assert.equal(metrics.version,'V303');assert.ok(metrics.mainVisible,'Busca oculta: '+tab);
    assert.equal(metrics.primaryCount,2,'Deve haver busca e um seletor principal em '+tab);
    assert.ok(metrics.barX>=metrics.panelX-2&&metrics.barX+metrics.barW<=metrics.panelX+metrics.panelW+2,'Barra fora do painel: '+tab+' '+JSON.stringify(metrics));
    assert.equal(metrics.pageWidth,metrics.viewport,'Rolagem horizontal: '+tab);
    assert.ok(metrics.detailsClosed&&metrics.hidden,'Filtros secundários aparecem com detalhe fechado: '+tab);
    if(tab==='pdfs'){
     assert.equal(metrics.panelDisplay,'flex','PDFs ainda dispostos em colunas conflitantes');
     assert.ok(await page.locator('#bm303-pdf-toolbar .bm303-actions #driveConnectV038').count());
     const next=page.locator('#bm303-pdf-toolbar .bm303-more summary');
     await next.click();assert.ok(await page.locator('#pdfHidden').isVisible());
     assert.ok(await page.locator('#bm210PdfToolbar').isVisible(),'Ferramentas PDFs perdidas');
     await next.click();assert.equal(await page.locator('#pdfHidden').isVisible(),false);
    }
    if(tab==='cartoes'){
     const d=page.locator('#bm303-card-toolbar .bm303-more summary');
     assert.equal(await page.locator('#bm281IdOrder').isVisible(),false);
     await d.click();assert.ok(await page.locator('#bm281IdOrder').isVisible());
     await d.click();assert.equal(await page.locator('#bm281IdOrder').isVisible(),false);
    }
    if(tab==='imagens'){
     assert.equal(await page.locator('#bm155AssuntoGeralImagem').isVisible(),false);
     const d=page.locator('#bm303-image-toolbar .bm303-more summary');
     await d.click();assert.ok(await page.locator('#bm155AssuntoGeralImagem').isVisible());
     await d.click();assert.equal(await page.locator('#bm155AssuntoGeralImagem').isVisible(),false);
    }
    await page.screenshot({path:'test-artifacts/v303/after-'+tab+'-'+width+'.png'});
    console.log('V303_TAB_PASS '+width+' '+tab+' '+JSON.stringify(metrics));
   }
   await page.locator('header nav button[data-page="lacunas"]').evaluate(x=>x.click());
   await page.locator('#bm299-lac-filter-more').waitFor({state:'visible'});
   assert.equal(await page.locator('#bm242-general').isVisible(),false,'Filtro avançado Lacunas não fechado');
   await page.locator('#bm299-lac-filter-more summary').click();
   assert.ok(await page.locator('#bm242-general').isVisible());
   await page.locator('#bm299-lac-filter-more summary').click();
   assert.equal(await page.locator('#bm242-general').isVisible(),false);
   assert.ok(await page.locator('#bm242-list').textContent().then(x=>x.includes('Revisar aplicação do coeficiente')));
   const footer=await page.evaluate(()=>{const lac=document.getElementById('lacunas'),foot=document.querySelector('main>footer');return !!lac&&!!foot&&lac.nextElementSibling===foot});
   assert.ok(footer,'Lacunas ainda depois do rodapé');
   await page.screenshot({path:'test-artifacts/v303/after-lacunas-'+width+'.png'});
   assert.ok(!errors.length,'Erro JavaScript: '+errors.slice(0,5));
   console.log('V303_BROWSER_PASS '+width+'px: barras, recolhíveis, editor e navegação; OAuth real não testado');
   await page.close();
  }
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});

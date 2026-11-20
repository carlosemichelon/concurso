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
    assert.equal(metrics.version,'V306');assert.ok(metrics.mainVisible,'Busca oculta: '+tab);
    assert.equal(metrics.primaryCount,2,'Deve haver busca e um seletor principal em '+tab);
    assert.ok(metrics.barX>=metrics.panelX-2&&metrics.barX+metrics.barW<=metrics.panelX+metrics.panelW+2,'Barra fora do painel: '+tab+' '+JSON.stringify(metrics));
    assert.equal(metrics.pageWidth,metrics.viewport,'Rolagem horizontal: '+tab);
    assert.ok(metrics.detailsClosed&&metrics.hidden,'Filtros secundários aparecem com detalhe fechado: '+tab);
    if(tab==='pdfs'){
     assert.equal(metrics.panelDisplay,'flex','PDFs ainda dispostos em colunas conflitantes');
     const h2=page.locator('#bm303-pdf-toolbar>h2');
     assert.equal(await h2.count(),1,'Título PDFs duplicado ou fora da barra');
     const positions=await page.evaluate(()=>{
      const h=document.querySelector('#bm303-pdf-toolbar>h2').getBoundingClientRect(),
       f=document.querySelector('#bm303-pdf-toolbar .bm303-primary').getBoundingClientRect();
      return {hTop:h.top,hBottom:h.bottom,searchTop:f.top};
     });
     assert.ok(positions.hBottom<=positions.searchTop+2,'Título PDFs ainda abaixo da pesquisa: '+JSON.stringify(positions));
     assert.ok(await page.locator('#bm303-pdf-toolbar .bm303-actions #driveConnectV038').count());
     const next=page.locator('#bm303-pdf-toolbar .bm303-more > summary');
     await next.click();assert.ok(await page.locator('#pdfHidden').isVisible());
     assert.ok(await page.locator('#bm210PdfToolbar').isVisible(),'Ferramentas PDFs perdidas');
     await next.click();assert.equal(await page.locator('#pdfHidden').isVisible(),false);
    }
    if(tab==='cartoes'){
     const d=page.locator('#bm303-card-toolbar .bm303-more > summary');
     assert.equal(await page.locator('#bm281IdOrder').isVisible(),false);
     await d.click();assert.ok(await page.locator('#bm281IdOrder').isVisible());
     await d.click();assert.equal(await page.locator('#bm281IdOrder').isVisible(),false);
     await page.waitForFunction(()=>document.querySelectorAll('#cardRows article.card').length>0,{timeout:18000});
     await page.waitForFunction(()=>{
      const rows=document.getElementById('cardRows');
      return rows?.querySelector(':scope > article.card') && !rows?.querySelector(':scope > details.bm128CardsGroup,:scope > details.v036-card-group');
     },{timeout:15000});
     assert.ok(await page.locator('#bm305-count-detail').count(),'Detalhamento de contagem dos cartões ausente');
     const cardIds=await page.locator('#cardRows article.card .tag').allTextContents();
     console.log('V306_ID_ORDER '+width+' '+cardIds.slice(0,14).join(' → '));
     const numeric=cardIds.filter(id=>/^CARD-\d+$/.test(id)).map(id=>Number(id.slice(5)));
     assert.ok(numeric.length>1&&numeric.every((id,i)=>i===0||numeric[i-1]>=id),'Ordenação decrescente por ID foi substituída por grupos de assuntos');
     const open=page.locator('#cardRows .bm-v050-peek-button').first();
     if(await open.count()){
      await open.click();
      assert.ok(await page.locator('#bmCardPeekV050 .bm165-panel.bm165-sidebar-hidden').count(),'Outros cartões não iniciou recolhido');
      assert.equal(await page.locator('#bmCardPeekV050 .bm165-toggle-sidebar').getAttribute('aria-expanded'),'false');
      await page.evaluate(()=>window.BancoMestreVisualizarCardV050?.close?.());
     }
     // CARD-0001 possui relação explícita com CARD-0008 no módulo 8.
     // Deve existir link verificável na frente e navegação para o ID correto.
     const search=page.locator('#cardSearch');
     await search.fill('CARD-0001');
     const linked=page.locator('#cardRows .bm305-relation-link').filter({hasText:'CARD-0008'}).first();
     await linked.waitFor({state:'visible',timeout:16000});
     await linked.click();
     assert.match(await page.locator('#bmCardPeekTitleV050').textContent(),/CARD-0008/,'Link da frente não abriu o cartão relacionado');
     await page.evaluate(()=>window.BancoMestreVisualizarCardV050?.close?.());
     await search.fill('');
     // V306: um original de enunciado/figura deve surgir no próprio cartão.
     await search.fill('CARD-1509');
     await page.waitForFunction(()=>window.BM306CardMedia?.ready,{timeout:18000});
     const media=page.locator('#cardRows article.card .bm306-image-item[data-image-id="IMG-C12-030"]');
     await media.waitFor({state:'visible',timeout:18000});
     const fileLink=media.locator('a[href*="1gdepf2G5xQfT82pjAA1Rszl9nLdXyuZS"]');
     assert.equal(await fileLink.count(),1,'Imagem do cartão não aponta para o original correto do Drive');
     const fold=page.locator('#cardRows article.card .bm306-explanations').first();
     if(await fold.count())assert.equal(await fold.getAttribute('open'),null,'Imagem explicativa abriu sem tentativa');
     const imageReader=page.locator('#cardRows .bm-v050-peek-button').first();
     await imageReader.click();
     assert.ok(await page.locator('#bmCardPeekV050 .bm306-image-item[data-image-id="IMG-C12-030"]').count(),'Leitor do cartão não incorporou imagem original');
     await page.evaluate(()=>window.BancoMestreVisualizarCardV050?.close?.());
     await search.fill('');
    }
    if(tab==='imagens'){
     assert.equal(await page.locator('#bm155AssuntoGeralImagem').isVisible(),false);
     const d=page.locator('#bm303-image-toolbar .bm303-more > summary');
     await d.click();assert.ok(await page.locator('#bm155AssuntoGeralImagem').isVisible());
     await d.click();assert.equal(await page.locator('#bm155AssuntoGeralImagem').isVisible(),false);
     assert.ok(await page.locator('#bm305-image-pending').count(),'Atalho de imagens sem classificação não aparece');
    }
    await page.screenshot({path:'test-artifacts/v303/after-'+tab+'-'+width+'.png'});
    console.log('V306_TAB_PASS '+width+' '+tab+' '+JSON.stringify(metrics));
   }
   // Tema da oficina original deve combinar com a interface do portal sem regravar textos.
   await page.locator('header nav button[data-page="redacao"]').evaluate(x=>x.click());
   const redTheme=page.locator('#bm302-redacao-original');
   await redTheme.waitFor({state:'visible',timeout:12000});
   await page.waitForFunction(()=>{
    const frame=document.getElementById('bm302-redacao-original');
    return !!frame?.contentDocument?.getElementById('bm306-redacao-theme');
   },{timeout:18000});
   const theme=await redTheme.evaluate(frame=>{
    const doc=frame.contentDocument,root=getComputedStyle(doc.documentElement);
    return {bg:root.getPropertyValue('--bg').trim(),azure:root.getPropertyValue('--ouro').trim(),
     cardRadius:getComputedStyle(doc.querySelector('.card')).borderRadius,
     tabs:doc.querySelectorAll('.tabs .tab').length,
     source:frame.getAttribute('src'),
     cssReady:[...doc.styleSheets].some(s=>(s.href||'').includes('v306_redacao_theme.css'))};
   });
   assert.equal(theme.azure,'#176a9f','Redação continua com paleta diferente do portal');
   assert.ok(theme.cssReady&&theme.tabs>=8,'A oficina perdeu abas ou o estilo não carregou');
   console.log('V306_REDACAO_THEME '+width+' '+JSON.stringify(theme));
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
   console.log('V306_BROWSER_PASS '+width+'px: barras, recolhíveis, editor e navegação; OAuth real não testado');
   await page.close();
  }
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});

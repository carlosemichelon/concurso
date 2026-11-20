'use strict';
/* V300 — testes Chromium de UI sem conta Drive nem dados reais. */
const assert=require('node:assert/strict');
const {chromium}=require('playwright');
const fixture={
 schema:1,updatedAt:'2026-11-19T00:00:00.000Z',log:[],
 records:[
 {id:'LAC-TESTE-001',cardIds:['CARD-1338'],relatoEstudante:'Não compreendi a relação entre fórmulas.',diagnosticoAssistente:'',
 descricao:'Revisar aplicação do coeficiente',disciplina:'Engenharia Civil',assuntoGeral:'Estruturas',assuntoEspecifico:'Concreto',subassunto:'Flexão',
 tipo:'Aplicação',cobertura:'Parcial',etapa:'Identificada',prioridade:'Alta',origem:'Questão',questaoId:'TEST-Q1',
 enunciado:'Questão de teste',respostaEstudante:'B',gabarito:'C',fonte:'Fonte simulada',pesquisa:'',auditoriaStatus:'Teste isolado',historico:[],createdAt:'2026-11-19T00:00:00.000Z'},
 {id:'LAC-TESTE-002',cardIds:[],relatoEstudante:'',diagnosticoAssistente:'',
 descricao:'Comparar dois tipos de fundação',disciplina:'Engenharia Civil',assuntoGeral:'Fundações',assuntoEspecifico:'Rasas',subassunto:'',
 tipo:'Conceitual',cobertura:'Ausente',etapa:'Em reforço',prioridade:'Normal',origem:'Pesquisa',questaoId:'TEST-Q2',
 enunciado:'',respostaEstudante:'',gabarito:'',fonte:'',pesquisa:'',auditoriaStatus:'Teste isolado',historico:[],createdAt:'2026-11-18T00:00:00.000Z'},
 {id:'LAC-TESTE-003',cardIds:['CARD-1338'],relatoEstudante:'Registro literal preservado',diagnosticoAssistente:'',
 descricao:'Revisar conceitos de estruturas',disciplina:'Engenharia Civil',assuntoGeral:'Estruturas',assuntoEspecifico:'Concreto',subassunto:'',
 tipo:'Memorização',cobertura:'Direta',etapa:'Dominada',prioridade:'Baixa',origem:'Revisão',questaoId:'TEST-Q3',
 enunciado:'',respostaEstudante:'',gabarito:'',fonte:'',pesquisa:'',auditoriaStatus:'Teste isolado',historico:[],createdAt:'2026-11-17T00:00:00.000Z'}
 ]
};
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 const results=[];
 try{
  for(const width of [1366,390]){
   const page=await browser.newPage({viewport:{width,height:width>600?900:844}});
   await page.addInitScript(obj=>{try{localStorage.setItem('BM_LACUNAS_V242',JSON.stringify(obj));}catch(_){}},fixture);
   await page.route('https://accounts.google.com/**',r=>r.abort());
   await page.route('https://www.googleapis.com/**',r=>r.abort());
   await page.goto('http://127.0.0.1:8765/index.html',{waitUntil:'domcontentloaded',timeout:60000});
   await page.waitForSelector('#bm299-card-quick',{state:'attached',timeout:12000});
   await page.waitForSelector('#bm299-pdf-quick',{state:'attached',timeout:12000});
   await page.locator('header nav button[data-page="cartoes"]').click();
   await page.locator('#bm299-card-quick').waitFor({state:'visible',timeout:12000});
   await page.locator('header nav button[data-page="pdfs"]').click();
   await page.locator('#bm299-pdf-quick').waitFor({state:'visible',timeout:12000});
   const integrity=await page.evaluate(()=>{
    const scripts=[...document.querySelectorAll('script[src]')].map(x=>x.src);
    const pdf=document.getElementById('pdfSearch');
    const card=document.getElementById('cardSearch');
    return {
     version:document.documentElement.dataset.bmPortalVersion,
     pdfSearch:!!pdf&&pdf.closest('#bm299-pdf-quick')!==null,
     cardSearch:!!card&&card.closest('#bm299-card-quick')!==null,
     pdfOldScript:scripts.some(x=>x.includes('v269_drive_pdf_sync')),
     compact:!!document.getElementById('bm299-card-more'),
     cardHidden:!document.getElementById('bm299-card-more').open,
     pdfHidden:!document.getElementById('bm299-pdf-more').open
    };
   });
   assert.equal(integrity.version,'V300');
   assert.ok(integrity.pdfSearch&&integrity.cardSearch);
   assert.ok(integrity.compact&&integrity.cardHidden&&integrity.pdfHidden);
   await page.locator('header nav button[data-page="lacunas"]').click();
   await page.waitForSelector('#bm299-lac-stats',{timeout:12000});
   await page.waitForSelector('#bm299-lac-backups',{timeout:12000});
   await page.waitForFunction(()=>document.querySelectorAll('#bm242-list>.bm299-lac-group').length>=2,null,{timeout:12000});
   const lac=await page.evaluate(()=>{
    const stats=[...document.querySelectorAll('#bm299-lac-stats strong')].map(x=>x.textContent);
    const items=[...document.querySelectorAll('#bm242-list>article.bm242-item')];
    const entries=[...document.querySelectorAll('#bm242-list>.bm299-lac-group')];
    const detail=items[0]?.querySelector('details.bm299-lac-entry-details');
    return {stats,count:items.length,groups:entries.length,
     filtersMain:document.querySelectorAll('#bm299-lac-filter-main>label').length,
     advancedClosed:!document.getElementById('bm299-lac-filter-more').open,
     detailClosed:!!detail&&!detail.open,detailPresent:!!detail,
     preserved:items.some(x=>x.textContent.includes('Não compreendi a relação entre fórmulas.')),
     initialStage:!!items[0]?.querySelector('.bm299-lac-state')};
   });
   assert.deepEqual(lac.stats,['2','1','1']);
   assert.equal(lac.count,3);
   assert.ok(lac.groups>=2);
   assert.equal(lac.filtersMain,3);
   assert.ok(lac.advancedClosed&&lac.detailClosed&&lac.detailPresent&&lac.preserved&&lac.initialStage);
   await page.locator('#bm242-list>article .bm299-lac-entry-details').first().locator('summary').click();
   const block=page.locator('#bm242-list>article .bm299-lac-entry-details section.bm256-lac-block').first();
   if(await block.count()){
    assert.equal(await block.evaluate(x=>getComputedStyle(x).display),'block','Bloco didático ficou oculto pelo CSS global');
   }
   const all=(await page.locator('#bm242-list>article').allTextContents()).join(' ');
   assert.ok(all.includes('Registro literal preservado'));
   await page.locator('#bm299-lac-filter-more summary').click();
   assert.ok(await page.locator('#bm242-general').isVisible(),'Filtro avançado inacessível');
   await page.locator('header nav button[data-page="imagens"]').click();
   const imageToggle=page.locator('#bm299-image-toggle');
   if(await imageToggle.count()){
    await imageToggle.click();
    assert.equal(await imageToggle.getAttribute('aria-expanded'),'true');
   }
   results.push({width,integrity,lac});
   await page.close();
  }
  console.log('V300_BROWSER_PASS '+JSON.stringify(results));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});

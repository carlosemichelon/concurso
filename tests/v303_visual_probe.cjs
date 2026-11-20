'use strict';
const {chromium}=require('playwright');
const fs=require('node:fs');
const fixture={schema:1,updatedAt:'2026-11-19T12:00:00.000Z',log:[],records:[{
 id:'LAC-TESTE-001',cardIds:['CARD-1338'],relatoEstudante:'Não compreendi a relação entre fórmulas.',diagnosticoAssistente:'',
 descricao:'Revisar aplicação do coeficiente',disciplina:'Engenharia Civil',assuntoGeral:'Estruturas',
 assuntoEspecifico:'Concreto',subassunto:'Flexão',tipo:'Aplicação',cobertura:'Parcial',etapa:'Identificada',
 prioridade:'Alta',origem:'Questão',questaoId:'TEST-Q1',enunciado:'Questão simulada',respostaEstudante:'B',
 gabarito:'C',fonte:'Fonte de teste',pesquisa:'',auditoriaStatus:'Teste isolado',historico:[],createdAt:'2026-11-19T12:00:00.000Z'
}]};
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 const results=[];fs.mkdirSync('test-artifacts/v303',{recursive:true});
 try{for(const width of [1366,390]){
   const page=await browser.newPage({viewport:{width,height:width>600?900:844}});
   await page.addInitScript(obj=>{try{localStorage.setItem('BM_LACUNAS_V242',JSON.stringify(obj))}catch(_){}},fixture);
   await page.route('https://accounts.google.com/**',r=>r.abort());
   await page.route('https://www.googleapis.com/**',r=>r.abort());
   const errors=[];page.on('pageerror',e=>errors.push(String(e)));
   await page.goto('http://127.0.0.1:8765/index.html',{waitUntil:'domcontentloaded',timeout:60000});
   await page.waitForTimeout(1200);
   for(const tab of ['assuntos','pdfs','cartoes','imagens','lacunas']){
    const nav=page.locator('header nav button[data-page="'+tab+'"]');
    if(await nav.count()===0){results.push({width,tab,error:'sem navegador'});continue}
    await nav.evaluate(x=>x.click());await page.waitForTimeout(950);
    const data=await page.evaluate(tab=>{
      const root=document.querySelector('section#'+tab);
      const q=(x)=>[...root.querySelectorAll(x)];
      const bounds=el=>{const r=el.getBoundingClientRect(),style=getComputedStyle(el);
       return {id:el.id||'',tag:el.tagName,cls:String(el.className||'').slice(0,90),
        label:(el.getAttribute('aria-label')||el.placeholder||el.querySelector('summary')?.textContent||el.textContent||'').trim().slice(0,80),
        x:Math.round(r.x),y:Math.round(r.y),w:Math.round(r.width),h:Math.round(r.height),
        display:style.display,visibility:style.visibility};
      };
      return {tab,version:document.documentElement.dataset.bmPortalVersion,
       viewport:innerWidth,documentWidth:document.documentElement.scrollWidth,
       pdfToolbar:q('#bm210PdfToolbar').map(bounds),
       containers:q('.controls,.bm299-quick,.bm299-more,#bm210PdfActions,#bm210PdfFilters,#bm209SyncBar,#bm155ImageFilters,.bm242-filters,.bm299-lac-filter-main').map(bounds),
       visibleControls:q('input:not([type=hidden]),select,button,summary').filter(x=>{
         const r=x.getBoundingClientRect(),cs=getComputedStyle(x);return r.width>0&&r.height>0&&cs.visibility!=='hidden'&&r.y>-300&&r.y<1400;
       }).slice(0,85).map(bounds),allDetails:q('details').slice(0,25).map(d=>({id:d.id,open:d.open,display:getComputedStyle(d).display})),
       studyBlocks:q('.bm256-lac-block').length};
    },tab);
    results.push({...data,errors:[...errors]});
    await page.screenshot({path:'test-artifacts/v303/'+tab+'-'+width+'.png',fullPage:false});
    console.log('V303_PROBE '+width+' '+tab+' '+JSON.stringify({version:data.version,documentWidth:data.documentWidth,viewport:data.viewport,
      toolbar:data.pdfToolbar,containers:data.containers,
      visible:data.visibleControls.filter(x=>x.w>0&&x.h>0).slice(0,23),
      details:data.allDetails,studyBlocks:data.studyBlocks,errors:errors.slice(0,4)}));
   }
   await page.close();
  }
 }finally{fs.writeFileSync('test-artifacts/v303/audit.json',JSON.stringify(results,null,2));await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});

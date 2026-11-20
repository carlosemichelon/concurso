'use strict';
/* V307: matriz real de layout responsivo, sem Drive privado e sem alterar dados.
 * Faz zoom de verificação em telas de 320, 360, 390, 412, 480 e 667px.
 */
const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const W=[320,360,390,412,480,667];
const output='test-artifacts/v307-mobile';
fs.mkdirSync(output,{recursive:true});
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 try{
  for(const width of W){
   const height=width===667?375:844;
   const context=await browser.newContext({viewport:{width,height},deviceScaleFactor:2,isMobile:true,hasTouch:true});
   const page=await context.newPage();
   page.setDefaultTimeout(18000);
   await page.route('https://accounts.google.com/**',r=>r.abort());
   await page.route('https://www.googleapis.com/**',r=>r.abort());
   await page.route('**/redacao_temas_treino_v296.html?versao=V296',r=>r.fulfill({
    status:200,contentType:'text/html',
    body:'<!doctype html><html><head></head><body><div class="tabs">'+Array.from({length:10},(_,i)=>'<button class="tab">Aba '+i+'</button>').join('')+'</div><div class="card">Redação preservada por CSS externo</div></body></html>'
   }));
   const errors=[];page.on('pageerror',e=>errors.push(String(e)));
   await page.goto('http://127.0.0.1:8765/index.html',{waitUntil:'domcontentloaded',timeout:60000});
   await page.waitForFunction(()=>document.documentElement.dataset.bmPortalVersion==='V307'&&window.BM303UnifiedFilters?.ready,{timeout:20000});
   const check=async tab=>{
    await page.locator('header nav button[data-page="'+tab+'"]').evaluate(n=>n.click());
    const r=await page.evaluate(tab=>{
     const e=document.documentElement,section=document.getElementById(tab),box=section?.querySelector(':scope>.panel');
     const rect=box?.getBoundingClientRect();
     return {tab,viewport:innerWidth,scroll:e.scrollWidth,
      panelLeft:rect?.left,panelRight:rect?.right,cardWidth:rect?.width};
    },tab);
    assert.equal(r.viewport,width,'Viewport incorreto');
    assert.ok(r.scroll<=width+1,'Rolagem horizontal em '+tab+' '+width+': '+JSON.stringify(r));
    assert.ok(r.panelLeft>=-1&&r.panelRight<=width+1,'Painel fora da tela em '+tab+' '+width+': '+JSON.stringify(r));
    return r;
   };
   const results=[];
   results.push(await check('assuntos'));
   await page.waitForFunction(()=>document.querySelectorAll('#areaRows .topicCard').length>=5);
   const areas=await page.evaluate(()=>{
    const list=[...document.querySelectorAll('#areaRows .topicCard')].slice(0,5);
    const b=list.map(x=>x.getBoundingClientRect());
    return {n:list.length,
     cols:b.length>1&&Math.abs(b[0].top-b[1].top)<4?2:1,
     decorative:list.some(x=>getComputedStyle(x,'::before').display!=='none'),
     cut:list.some(x=>x.getBoundingClientRect().right>innerWidth+1||x.getBoundingClientRect().left<0)};
   });
   assert.equal(areas.n,5);
   assert.equal(areas.decorative,false,'Ícones grandes reapareceram');
   assert.equal(areas.cut,false,'Disciplinas cortadas');
   if(width<=620&&width>340)assert.equal(areas.cols,2,'Áreas não ficaram em duas colunas');
   results.push(await check('pdfs'));
   await page.locator('#pdfSearch').waitFor({state:'visible'});
   results.push(await check('imagens'));
   await page.locator('#imageSearch').waitFor({state:'visible'});
   results.push(await check('cartoes'));
   await page.locator('#cardSearch').fill('CARD-1533');
   const card=page.locator('#cardRows article.bm307-card[data-bm305-id="CARD-1533"]');
   await card.waitFor({state:'visible',timeout:20000});
   const metrics=await card.evaluate(a=>{
    const get=s=>a.querySelector(':scope > '+s);
    const rect=s=>get(s)?.getBoundingClientRect();
    const b=a.getBoundingClientRect(), title=rect('h3'),read=rect('.bm-v050-peek-button'),badge=rect('.tag');
    const buttons=[...a.querySelectorAll(':scope > .buttons button')].map(x=>({title:x.textContent,rect:x.getBoundingClientRect()}));
    const fold=get('details.bm307-source');
    const style=getComputedStyle(get('h3'));
    return {box:{x:b.x,right:b.right,width:b.width},
     title:{top:title?.top,bottom:title?.bottom,font:parseFloat(style.fontSize),right:title?.right},
     read:{top:read?.top,bottom:read?.bottom,left:read?.left,right:read?.right},
     idTop:badge?.top,refFound:!!fold?.querySelector('.bm163-card-ref'),refOpen:!!fold?.open,
     footer:buttons.map(x=>({text:x.title,left:x.rect.left,right:x.rect.right,width:x.rect.width,top:x.rect.top}))};
   });
   assert.ok(metrics.box.x>=-1&&metrics.box.right<=width+1,'Cartão excedeu largura '+width+': '+JSON.stringify(metrics));
   assert.ok(metrics.title.font>=14,'Fonte do enunciado pequena no celular '+width);
   assert.ok(metrics.title.top>=metrics.read.bottom-2,'Botão Abrir leitura sobreposto à pergunta '+width+': '+JSON.stringify(metrics));
   assert.ok(metrics.read.right<=metrics.box.right+1&&metrics.read.left>=metrics.box.x-1,'Botão fora do cartão '+width);
   assert.ok(metrics.idTop<metrics.title.top&&metrics.refFound&&!metrics.refOpen,'Hierarquia do cartão incompleta '+width);
   assert.ok(metrics.footer.every(x=>x.left>=metrics.box.x-1&&x.right<=metrics.box.right+1),'Ações cortadas '+width+': '+JSON.stringify(metrics.footer));
   await card.screenshot({path:output+'/card-1533-'+width+'.png'});
   await card.locator('.bm-v050-peek-button').click();
   const modal=await page.locator('#bmCardPeekV050 .bm163-panel').evaluate(x=>{
    const r=x.getBoundingClientRect();
    return {left:r.left,right:r.right,width:r.width,window:innerWidth,sidebarClosed:x.classList.contains('bm165-sidebar-hidden')};
   });
   assert.ok(modal.left>=-2&&modal.right<=width+2,'Leitor do cartão excede largura em '+width+': '+JSON.stringify(modal));
   assert.ok(modal.sidebarClosed,'Outros cartões abriu indevidamente em '+width);
   await page.screenshot({path:output+'/reader-'+width+'.png'});
   await page.evaluate(()=>window.BancoMestreVisualizarCardV050?.close?.());
   results.push(await check('lacunas'));
   results.push(await check('redacao'));
   await page.waitForFunction(()=>document.getElementById('bm302-redacao-original')?.contentDocument?.getElementById('bm306-redacao-theme'),{timeout:16000});
   const style=await page.evaluate(()=>{
    const f=document.getElementById('bm302-redacao-original'),d=f.contentDocument;
    return {color:f.contentWindow.getComputedStyle(d.documentElement).getPropertyValue('--ouro').trim(),
      iframeWidth:f.getBoundingClientRect().width,viewport:innerWidth};
   });
   assert.equal(style.color,'#176a9f','Paleta da Redação não aplicada');
   assert.ok(style.iframeWidth<=width+1,'Redação excede viewport');
   assert.deepEqual(errors,[],'Erros JS no navegador '+width);
   console.log('V307_MOBILE_MATRIX_PASS '+width+' '+JSON.stringify({areas,card:metrics,modal,redacao:style,tabs:results,jsErrors:errors.length}));
   await page.screenshot({path:output+'/redacao-'+width+'.png'});
   await context.close();
  }
  console.log('V307_MOBILE_ALL_PASS '+W.join(','));
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exit(1)});

'use strict';
/* Chromium isolado, sem acesso OAuth. Verifica aparência calculada e captura telas públicas. */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {chromium}=require('playwright');
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 try{
  fs.mkdirSync('test-artifacts/v298',{recursive:true});
  const results=[];
  for(const width of [1366,390]){
   const page=await browser.newPage({viewport:{width,height:width>700?900:844}});
   const cssErrors=[];
   page.on('response',r=>{if(r.url().includes('v298_')&&r.status()!==200)cssErrors.push(r.url()+':'+r.status());});
   await page.route('https://accounts.google.com/**',r=>r.abort());
   await page.route('https://www.googleapis.com/**',r=>r.abort());
   await page.goto('http://127.0.0.1:8765/v298.html',{waitUntil:'domcontentloaded',timeout:60000});
   await page.locator('header .brand').waitFor();
   await page.screenshot({path:path.join('test-artifacts/v298',width+'-inicio.png')});
   await page.locator('header nav button[data-page="cartoes"]').click();
   await page.waitForFunction(()=>document.querySelector('#cartoes')?.classList.contains('active'));
   const metrics=await page.evaluate(()=>{
    const cardRows=document.getElementById('cardRows');
    const article=document.createElement('article');
    article.className='card';article.id='bm298-test-card';
    const heading=document.createElement('h3');
    heading.textContent='Pergunta de teste: legibilidade no celular';
    const para=document.createElement('p');
    para.textContent='Texto de teste sem alteração de flashcard.';
    article.append(heading,para);cardRows.prepend(article);
    let bar=document.querySelector('#imagens #bm209SyncBar');
    if(!bar){bar=document.createElement('div');bar.id='bm209SyncBar';bar.className='bm210ImageToolbar';document.querySelector('#imagens .panel').prepend(bar);}
    const action=document.createElement('button');action.className='primary';action.textContent='Ação azul';action.id='bm298-test-action';bar.append(action);
    const nav=document.querySelector('header nav button[data-page="cartoes"]');
    const style=el=>getComputedStyle(el);
    return {
     version:document.documentElement.dataset.bmPortalVersion,
     cssLinks:document.querySelectorAll('link[rel="stylesheet"]').length,
     bundled:[...document.styleSheets].some(x=>(x.href||'').includes('v298_ui_bundle.css')),
     headingColor:style(heading).color,headingSize:style(heading).fontSize,
     bodySize:style(para).fontSize,
     actionColor:style(action).color,actionBackground:style(action).backgroundColor,
     navMinHeight:parseFloat(style(nav).minHeight),
     cardWidth:article.getBoundingClientRect().width,
     documentWidth:document.documentElement.scrollWidth,viewport:window.innerWidth
    };
   });
   console.log('V298_METRICS '+JSON.stringify(metrics));
   assert.equal(metrics.version,'V298');
   assert.equal(metrics.cssLinks,16);
   assert.ok(metrics.bundled,'Bundle CSS não carregado');
   assert.equal(metrics.headingColor,'rgb(16, 24, 32)','Título não preto forte');
   assert.equal(metrics.headingSize,'16px','Título do cartão não mede 16px');
   assert.equal(metrics.bodySize,'15px','Fonte de leitura não mede 15px');
   assert.equal(metrics.actionColor,'rgb(255, 255, 255)','Texto branco sobre botão azul ausente');
   assert.equal(metrics.actionBackground,'rgb(20, 127, 191)','Fundo azul não padronizado');
   assert.ok(metrics.navMinHeight>=40,'Área de toque pequena');
   assert.ok(metrics.cardWidth>0&&metrics.cardWidth<=width,'Cartão excedeu a tela');
   assert.deepEqual(cssErrors,[],'Arquivos CSS V298 com erro HTTP');
   await page.waitForTimeout(200);
   await page.screenshot({path:path.join('test-artifacts/v298',width+'-cartoes.png')});
   results.push({width,...metrics});
   await page.close();
  }
  console.log('V298_VISUAL_BROWSER_PASS '+JSON.stringify(results));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});

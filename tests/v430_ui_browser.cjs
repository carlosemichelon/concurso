'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict'),{chromium}=require('playwright');
const html=fs.readFileSync('index.html','utf8');
const styles=[...html.matchAll(/<style\b[^>]*>[\s\S]*?<\/style>/gi)].map(m=>m[0]).join('\n');
const external=[...html.matchAll(/<link\b[^>]*rel="stylesheet"[^>]*href="([^"]+)"/g)].map(m=>fs.readFileSync(m[1].split('?')[0],'utf8')).join('\n');
const source=fs.readFileSync('assets/v430_js_002_015_topic_media.js','utf8');
const code=source.slice(source.indexOf('function bm430TopicScore('),source.indexOf('\nasync function openTopic(t){'));
(async()=>{const browser=await chromium.launch({headless:true});try{
for(const width of [1440,390]){
 const page=await browser.newPage({viewport:{width,height:900}});
 await page.setContent('<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><style>'+external+'</style>'+styles+'</head><body><main><section id="tema" class="active bm064-auditing-images"><div id="topicMedia"></div></section><section id="formulas"><dialog id="bm427FormulaDialog"><div class="bm427-formula-head">Fórmulas</div><div class="bm427-formula-scroll"><div class="bm249-body"><p>Teste</p></div></div><div class="bm427-formula-foot">Fechar</div></dialog></section></main><dialog id="imageDialog" class="bm422-editor"><div id="imageStage" style="height:360px!important;width:320px!important"><div class="canvases" style="width:100px;height:80px"></div></div></dialog></body></html>');
 await page.addScriptTag({content:`
let bm169MediaSequence=0,bm430CurrentTopic=null,bm430TopicSession='';
const byId=id=>document.getElementById(id),plain=s=>String(s).normalize('NFD').replace(/[\\u0300-\\u036f]/g,'').toLowerCase();
const chip=(label,fn)=>{const b=document.createElement('button');b.textContent=label;b.onclick=fn;return b},addTitle=(el,label)=>{const h=document.createElement('h3');h.textContent=label;el.append(h)},addPara=(el,label,cls)=>{const p=document.createElement('p');p.textContent=label;p.className=cls;el.append(p)};
window.opened=[];function pdfOpen(p){opened.push(p.id)}function section(){}
window.BancoMestreMediaSyncV182={token:()=> 'mocked-token'};
let release;const wait=new Promise(r=>release=r);window.releaseScan=release;
const pixel='data:image/svg+xml,%3Csvg%20xmlns=%22http://www.w3.org/2000/svg%22%20width=%2220%22%20height=%2220%22%3E%3Crect%20width=%2220%22%20height=%2220%22%20fill=%22blue%22/%3E%3C/svg%3E';
let list=null,docs=null;
window.BancoMestreDriveImagesV182={connected:true,topicRecords:()=>list,refresh:async()=>{await wait;list=[{id:'i',title:'Concreto armado',subject:'Concreto armado',preview:async()=>pixel,open:()=>opened.push('i')},{id:'x',title:'Solo',preview:async()=>pixel}]}};
window.BancoMestrePDFSyncV130={connected:true,topicRecords:()=>docs,refresh:async()=>{await wait;docs=[{id:'p',title:'NBR 6118 - concreto armado'},{id:'z',title:'Hidráulica'}]}};
`+code+`\nshowTopicImages({subject:'Concreto armado',group:'ENG_GERAL'});`});
 await page.locator('.bm171-open-media').evaluate(b=>b.click());
 await page.waitForSelector('#bm428TopicProgress',{state:'visible'});
 const initial=await page.locator('#bm428TopicProgress progress').evaluate(e=>({indeterminate:!e.hasAttribute('value'),animation:getComputedStyle(e).animationName}));
 assert.ok(initial.indeterminate);assert.notEqual(initial.animation,'none');
 await page.evaluate(()=>releaseScan());
 await page.waitForSelector('#bm428TopicProgress',{state:'detached'});
 assert.equal(await page.locator('.bm430-topic-grid article').count(),1);
 assert.equal(await page.locator('.bm169-pdf-links button').count(),1);
 assert.equal(await page.locator('#topicMedia').evaluate(e=>getComputedStyle(e).visibility),'visible');
 assert.equal(await page.locator('.bm430-topic-grid img').evaluate(e=>e.complete&&e.naturalWidth>0),true);
 await page.locator('.bm169-pdf-links button').click();await page.locator('.bm430-media-link').click();
 assert.deepEqual(await page.evaluate(()=>opened),['p','i']);
 await page.evaluate(()=>{document.getElementById('formulas').classList.add('active');document.getElementById('bm427FormulaDialog').showModal()});
 const r=await page.locator('#bm427FormulaDialog').boundingBox();assert.ok(r.width<=Math.min(740,width-24)+2,'largura real '+r.width+' em viewport '+width);assert.ok(r.height<500,'diálogo curto deve adaptar a altura: '+r.height);
 console.log(width+'px: progresso visível durante espera, imagem/PDF aparecem, abertura e fórmula compacta aprovadas.');
 await page.close();
}
}finally{await browser.close()}})().catch(e=>{console.error(e);process.exitCode=1});

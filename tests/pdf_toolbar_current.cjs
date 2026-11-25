'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict');
const {chromium}=require('playwright');
const html=fs.readFileSync('index.html','utf8');
const styles=[...html.matchAll(/<style\b[^>]*>[\s\S]*?<\/style>/gi)].map(m=>m[0]).join('\n');
const external=[...html.matchAll(/<link\b[^>]*rel="stylesheet"[^>]*href="([^"]+)"/g)].map(m=>fs.readFileSync(m[1].split('?')[0],'utf8')).join('\n');
const scriptPath=html.match(/<script\b[^>]*src="(assets\/v\d+_editor_ui\.js)(?:\?[^"]*)?"/)[1];
const script=fs.readFileSync(scriptPath,'utf8');
const ids=['pdfDraw','pdfMarker','pdfEraser','pdfPan','pdfUndo','pdfRedo','pdfPrev','pdfNext','pdfZoomOut','pdfZoomIn','pdfExportPDF'];
const button=id=>'<button id="'+id+'" type="button" data-bm096-context="notes" aria-pressed="'+(id==='pdfDraw')+'">'+id+'</button>';
(async()=>{const browser=await chromium.launch({headless:true});try{
for(const width of [1440,390]){
 const page=await browser.newPage({viewport:{width,height:900}});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.setContent('<!doctype html><html><head><style>'+external+'</style>'+styles+'</head><body><dialog id="pdfDialog" open><div class="bm-v046-pdf-side"><div id="pdfLocalTools"><div id="pdfMainV043"><div class="bm100-section"><div class="bm100-row">'+ids.map(button).join('')+'</div></div></div></div></div></dialog></body></html>');
 await page.addScriptTag({content:script});
 const results=await page.evaluate(ids=>ids.map(id=>{const el=document.getElementById(id),s=getComputedStyle(el,'::before'),svg=el.querySelector('svg');return {id,display:s.display,width:s.width,height:s.height,content:s.content,mask:s.maskImage,svg:svg&&getComputedStyle(svg).display,active:getComputedStyle(el).backgroundColor}}),ids);
 for(const r of results){assert.notEqual(r.display,'none',r.id+' pseudo-elemento oculto');assert.equal(r.width,'22px',r.id+' largura');assert.equal(r.height,'22px',r.id+' altura');assert.notEqual(r.content,'none',r.id+' conteúdo');assert.match(r.mask,/data:image\/svg\+xml/,r.id+' máscara');assert.equal(r.svg,'none',r.id+' SVG duplicado');}
 assert.notEqual(results[0].active,results[1].active,'Estado ativo indistinguível');
 assert.deepEqual(errors,[]);
 console.log(width+'px: '+results.length+' ícones visíveis, 22px, uma fonte visual e estado ativo distinto.');
 await page.close();
}
}finally{await browser.close()}})().catch(e=>{console.error(e);process.exitCode=1});

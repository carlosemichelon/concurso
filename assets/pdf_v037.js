
/* Banco Mestre V037 — leitor e editor PDF persistente com referência aos cartões, direto na página.
   PDF.js rasteriza para leitura; camada de tinta transparente usa IDs antigos
   BM030_STROKES_PDF:...; pdf-lib grava uma CÓPIA PDF anotada sem substituir original.
   O iframe Google Drive é somente leitura (origem cruzada).
   Cópias autorizadas podem ser guardadas apenas neste navegador em IndexedDB. */
(function(){
'use strict';
const $=id=>document.getElementById(id);
const versionTag='V037';
const DB_NAME='BancoMestrePDFLocalV035',STORE='sources';
let selected=null,pdf=null,sourceBytes=null,info=null,pageNo=1,zoom=1,task=Promise.resolve(),serial=0,painting=false,tool='marker',draft=null,undo=new Map(),redo=new Map(),loadingLib=null,loadingSaveLib=null,dbPromise=null,exportBusy=false,cachedSource=null;
const pageCanvas=$('pdfLocalCanvas'),inkCanvas=$('pdfInkCanvas');
const pageWrap=$('pdfPageWrap'),inkCtx=inkCanvas.getContext('2d');
const menu=['pdfPrev','pdfNext','pdfZoomOut','pdfZoomIn','pdfDraw','pdfMarker','pdfEraser','pdfPan','pdfUndo','pdfRedo','pdfClearPage','pdfExportPNG','pdfExportPDF','pdfChangeFile'];
const status=message=>$('pdfLocalStatus').textContent=message;
function library(url){return new Promise((resolve,reject)=>{const s=document.createElement('script');s.src=url;s.onload=resolve;s.onerror=()=>reject(Error('Biblioteca indisponível: '+url));document.head.append(s)})}
async function pdfjs(){
 if(window.pdfjsLib)return window.pdfjsLib;
 if(!loadingLib)loadingLib=(async()=>{
  try{await library('https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js')}
  catch{await library('https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.min.js')}
  if(!window.pdfjsLib)throw Error('Leitor PDF.js não foi carregado');
  window.pdfjsLib.GlobalWorkerOptions.workerSrc='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
  return window.pdfjsLib;
 })().catch(e=>{loadingLib=null;throw e});
 return loadingLib;
}
async function pdflib(){
 if(window.PDFLib)return window.PDFLib;
 if(!loadingSaveLib)loadingSaveLib=(async()=>{
  try{await library('https://cdn.jsdelivr.net/npm/pdf-lib@1.17.1/dist/pdf-lib.min.js')}
  catch{await library('https://unpkg.com/pdf-lib@1.17.1/dist/pdf-lib.min.js')}
  if(!window.PDFLib)throw Error('Gerador de PDF indisponível');
  return window.PDFLib;
 })().catch(e=>{loadingSaveLib=null;throw e});
 return loadingSaveLib;
}
function db(){
 if(!dbPromise)dbPromise=new Promise((yes,no)=>{
  const req=indexedDB.open(DB_NAME,1);
  req.onupgradeneeded=()=>{if(!req.result.objectStoreNames.contains(STORE))req.result.createObjectStore(STORE,{keyPath:'id'})};
  req.onsuccess=()=>yes(req.result);req.onerror=()=>no(req.error||Error('Armazenamento indisponível'));
 });
 return dbPromise;
}
async function storeFile(id,file){
 try{
  const d=await db();
  await new Promise((yes,no)=>{
   const tr=d.transaction(STORE,'readwrite');
   tr.objectStore(STORE).put({id,blob:file,name:file.name,size:file.size,saved:new Date().toISOString()});
   tr.oncomplete=yes;tr.onerror=()=>no(tr.error||Error('Não foi possível guardar o PDF'));
  });
  return true;
 }catch(e){console.warn('PDF local não persistido:',e);return false}
}
async function storedFile(id){
 try{
  const d=await db();
  return await new Promise((yes,no)=>{
   const req=d.transaction(STORE,'readonly').objectStore(STORE).get(id);
   req.onsuccess=()=>yes(req.result);req.onerror=()=>no(req.error);
  });
 }catch{return null}
}
function key(page=pageNo){return 'BM030_STROKES_PDF:'+selected.id+':'+info.hash+':P'+page}
function annotations(page=pageNo){
 if(!info||!selected)return [];
 try{const r=JSON.parse(localStorage.getItem(key(page))||'[]');return Array.isArray(r)?r:[]}catch{return []}
}
function storeStrokes(){
 try{localStorage.setItem(key(),JSON.stringify(annotationsInView));return true}
 catch(e){status('Anotações não foram salvas neste navegador: '+e.message);return false}
}
let annotationsInView=[];
function snapshot(){const id=key();if(!undo.has(id))undo.set(id,[]);const list=undo.get(id);list.push(JSON.stringify(annotationsInView));if(list.length>60)list.shift();redo.set(id,[])}
function canUse(id,on){$(id).disabled=!on}
function controls(open){
 for(const id of menu)canUse(id,open);
 if(open&&pdf){canUse('pdfPrev',pageNo>1);canUse('pdfNext',pageNo<pdf.numPages)}
 else {canUse('pdfPrev',false);canUse('pdfNext',false)}
 if(open){
  canUse('pdfUndo',(undo.get(key())||[]).length>0);
  canUse('pdfRedo',(redo.get(key())||[]).length>0);
 }
}
function markTool(name){
 tool=name;draft=null;
 for(const [key,n] of [['pdfDraw','pen'],['pdfMarker','marker'],['pdfEraser','eraser'],['pdfPan','pan']])$(key).setAttribute('aria-pressed',String(n===tool));
 inkCanvas.style.cursor=tool==='pan'?'grab':tool==='eraser'?'cell':'crosshair';
 inkCanvas.style.touchAction=tool==='pan'?'pan-x pan-y':'none';
 inkCanvas.style.pointerEvents=tool==='pan'?'none':'auto';
}
function stroke(ctx,m,w,h){
 if(!m)return;
 if(m.type==='rect'&&Array.isArray(m.box)&&m.box.length===4){
  const b=m.box;ctx.save();ctx.globalAlpha=.32;
  ctx.fillStyle=m.color||'#ffd400';
  ctx.fillRect(Math.min(b[0],b[2])*w,Math.min(b[1],b[3])*h,Math.abs(b[2]-b[0])*w,Math.abs(b[3]-b[1])*h);
  ctx.restore();return;
 }
 if((m.type==='note'||m.type==='card')&&Array.isArray(m.pos)){
  ctx.save();ctx.globalAlpha=1;ctx.fillStyle=m.color||'#17616a';
  const fontSize=Math.max(10,Math.min(w,h)*.025);
  ctx.font='bold '+fontSize+'px system-ui,Arial,sans-serif';
  const lines=String(m.text||'').split('\n').slice(0,5);
  let y=m.pos[1]*h;for(const line of lines){ctx.fillText(line.slice(0,110),m.pos[0]*w,y);y+=fontSize*1.25}ctx.restore();return;
 }
 if(!Array.isArray(m.points)||!m.points.length)return;
 ctx.save();
 const isPen=m.type==='pen',opacity=isPen?1:.32;
 ctx.globalAlpha=opacity;ctx.lineCap='round';ctx.lineJoin='round';
 ctx.strokeStyle=m.color||(isPen?'#174059':'#ffd400');ctx.fillStyle=ctx.strokeStyle;
 const thick=Math.max(1,Math.min(w,h)*(m.size||3)/1000*(isPen?1:1.7));
 const pts=m.points;
 if(pts.length===1){ctx.beginPath();ctx.arc(pts[0][0]*w,pts[0][1]*h,thick/2,0,Math.PI*2);ctx.fill()}
 else{for(let i=1;i<pts.length;i++){
  const a=pts[i-1],b=pts[i];
  ctx.lineWidth=thick*(.55+.3*((a[2]||.65)+(b[2]||.65)));
  ctx.beginPath();ctx.moveTo(a[0]*w,a[1]*h);ctx.lineTo(b[0]*w,b[1]*h);ctx.stroke();
 }}
 ctx.restore();
}
function paint(){
 const w=inkCanvas.width,h=inkCanvas.height;inkCtx.clearRect(0,0,w,h);
 for(const s of annotationsInView)stroke(inkCtx,s,w,h);
 if(draft)stroke(inkCtx,draft,w,h);
 if(info)controls(!painting&&!exportBusy&&!!pdf);
}
function at(e){const r=inkCanvas.getBoundingClientRect();return [
 Math.max(0,Math.min(1,(e.clientX-r.left)/Math.max(1,r.width))),
 Math.max(0,Math.min(1,(e.clientY-r.top)/Math.max(1,r.height))),e.pressure||.65];}
function gapToSegment(px,py,ax,ay,bx,by){
 const dx=bx-ax,dy=by-ay,den=dx*dx+dy*dy,t=den?Math.max(0,Math.min(1,((px-ax)*dx+(py-ay)*dy)/den)):0;
 return Math.hypot(px-ax-t*dx,py-ay-t*dy);
}
function near(m,p){
 if(m?.pos)return Math.hypot(p[0]-m.pos[0],p[1]-m.pos[1])<.055;
 if(!m?.points?.length)return false;
 const points=m.points,tol=.018+Math.max(0,(m.size||4))/3000;
 if(points.length===1)return Math.hypot(p[0]-points[0][0],p[1]-points[0][1])<tol;
 for(let i=1;i<points.length;i++){if(gapToSegment(p[0],p[1],points[i-1][0],points[i-1][1],points[i][0],points[i][1])<tol)return true}
 return false;
}
inkCanvas.addEventListener('pointerdown',e=>{
 if(!pdf||painting||exportBusy||tool==='pan'||e.button>0)return;
 const p=at(e);
 if(tool==='note'||tool==='card'){
  let typed=prompt(tool==='card'?'ID(s) de cartões (ex.: CARD-1280):':'Anotação textual nesta página da lei:');
  if(!typed||!typed.trim())return;
  typed=typed.trim();
  if(tool==='card'){
   const matches=typed.toUpperCase().match(/(?:CARD-\d{4,}|PROP-IJUI-\d+)/g);
   if(!matches?.length){status('Informe um ID de cartão válido (CARD-0001 ou PROP-IJUI-001).');return}
   typed=[...new Set(matches)].join(' · ');
  }
  snapshot();annotationsInView.push({type:tool,color:$('pdfInkColor').value,pos:[p[0],p[1]],text:typed});
  storeStrokes();paint();e.preventDefault();return;
 }
 if(tool==='eraser'){
  const i=annotationsInView.findLastIndex(m=>near(m,p));
  if(i<0)return;
  if(!confirm('Excluir esta marcação do PDF? A exclusão ficará somente neste navegador e poderá ser desfeita.'))return;
  snapshot();annotationsInView.splice(i,1);storeStrokes();paint();return;
 }
 draft={type:tool==='pen'?'pen':'highlighter',color:$('pdfInkColor').value,size:tool==='pen'?3:12,points:[p]};
 inkCanvas.setPointerCapture(e.pointerId);e.preventDefault();paint();
});
inkCanvas.addEventListener('pointermove',e=>{
 if(!draft||!inkCanvas.hasPointerCapture(e.pointerId))return;
 const p=at(e),pts=draft.points,last=pts[pts.length-1];
 if(Math.hypot((p[0]-last[0])*inkCanvas.width,(p[1]-last[1])*inkCanvas.height)>=1.6){pts.push(p);paint()}
});
function endStroke(e){
 if(!draft)return;
 snapshot();annotationsInView.push(draft);draft=null;
 if(inkCanvas.hasPointerCapture(e.pointerId))inkCanvas.releasePointerCapture(e.pointerId);
 storeStrokes();paint();
}
inkCanvas.addEventListener('pointerup',endStroke);
inkCanvas.addEventListener('pointercancel',e=>{draft=null;if(inkCanvas.hasPointerCapture(e.pointerId))inkCanvas.releasePointerCapture(e.pointerId);paint()});
function historyEdit(type){
 const id=key(),from=type==='undo'?undo:redo,to=type==='undo'?redo:undo,stack=from.get(id)||[];
 if(!stack.length)return;
 const current=JSON.stringify(annotationsInView);
 if(!to.has(id))to.set(id,[]);to.get(id).push(current);
 annotationsInView=JSON.parse(stack.pop());
 storeStrokes();paint();
}
async function renderOne(ticket){
 if(!pdf||ticket!==serial)return;
 painting=true;controls(false);status('Carregando página '+pageNo+'...');
 try{
  const page=await pdf.getPage(pageNo);if(ticket!==serial)return;
  const original=page.getViewport({scale:1});
  const pane=$('pdfLocalMode'),available=Math.max(320,pane.clientWidth-30);
  const visual=Math.min(1.6,Math.max(.55,available/original.width))*zoom;
  const dpi=Math.min(2,Math.max(1,window.devicePixelRatio||1));
  const viewport=page.getViewport({scale:visual*dpi});
  const max=Math.sqrt(9000000/(viewport.width*viewport.height));
  const factor=Math.min(1,max,3800/Math.max(viewport.width,viewport.height));
  const physical=page.getViewport({scale:visual*dpi*factor});
  const w=Math.round(physical.width),h=Math.round(physical.height);
  for(const cv of [pageCanvas,inkCanvas]){cv.width=w;cv.height=h;cv.style.width=Math.round(w/(dpi*factor))+'px';cv.style.height=Math.round(h/(dpi*factor))+'px'}
  pageWrap.style.width=pageCanvas.style.width;pageWrap.style.height=pageCanvas.style.height;
  const ctx=pageCanvas.getContext('2d',{alpha:false});ctx.fillStyle='white';ctx.fillRect(0,0,w,h);
  await page.render({canvasContext:ctx,viewport:physical}).promise;
  if(ticket!==serial)return;
  annotationsInView=annotations();
  draft=null;markTool(tool);paint();
  $('pdfPager').textContent='Página '+pageNo+' de '+pdf.numPages+' · '+Math.round(zoom*100)+'%';
  status('Desenhe diretamente nesta página. As marcações são gravadas localmente; use “Salvar PDF anotado” para criar um documento com todas as páginas marcadas.');
 }catch(e){if(ticket===serial)status('Erro ao renderizar a página: '+e.message)}
 finally{if(ticket===serial){painting=false;controls(!!pdf)}}
}
function render(){const ticket=++serial;task=task.catch(()=>{}).then(()=>renderOne(ticket));return task}
async function hashBuffer(b){
 if(crypto?.subtle){const raw=await crypto.subtle.digest('SHA-256',b.slice(0));return [...new Uint8Array(raw)].slice(0,12).map(n=>n.toString(16).padStart(2,'0')).join('')}
 return 'local-'+b.byteLength+'-'+info.name.replace(/\W/g,'');
}
async function openBytes(blob,name,remember){
 if(!selected||!blob)return;
 status('Preparando PDF no editor do Banco Mestre...');
 try{
  const lib=await pdfjs(),buf=await blob.arrayBuffer();
  if(buf.byteLength>120000000)throw Error('PDF muito grande para edição local nesta versão');
  const current=selected;
  info={name,size:blob.size,hash:''};info.hash=await hashBuffer(buf);
  sourceBytes=new Uint8Array(buf.slice(0));
  if(pdf){try{await pdf.destroy()}catch{}}
  pdf=await lib.getDocument({data:new Uint8Array(buf.slice(0))}).promise;
  pageNo=1;zoom=1;undo.clear();redo.clear();
  $('pdfFileName').textContent=name+' · '+pdf.numPages+' páginas';
  $('pdfFrame').classList.add('localHidden');
  $('pdfLocalMode').classList.add('active');
  $('pdfLocalTools').hidden=false;
  $('pdfIntro').hidden=true;
  if(remember){
   const saved=await storeFile(current.id,new File([blob],name,{type:'application/pdf'}));
   if(saved)try{localStorage.setItem('BM_PDF_HAS_SOURCE_V037:'+current.id,'1')}catch(e){}
   if(!saved)status('PDF aberto, porém o armazenamento neste navegador não está disponível.');
  }
  await render();
 }catch(e){
  status('Não foi possível editar o PDF: '+e.message+'. Confira se ele está íntegro e não está protegido por senha.');
  $('pdfLocalMode').classList.remove('active');$('pdfFrame').classList.remove('localHidden');
  $('pdfLocalTools').hidden=true;$('pdfIntro').hidden=false;sourceBytes=null;info=null;pdf=null;
 }
}
async function openCached(){
 if(!selected)return false;
 const saved=await storedFile(selected.id);
 if(!saved?.blob)return false;
 await openBytes(saved.blob,saved.name,false);return !!pdf;
}
function enterEditor(){
 if(!selected)return;
 if(pdf){$('pdfLocalMode').classList.add('active');return}
 if(cachedSource?.id===selected.id&&cachedSource.blob){
  openBytes(cachedSource.blob,cachedSource.name,false);return;
 }
 // Chamada síncrona no clique do usuário: navegadores podem bloquear o
 // seletor de arquivos quando .click() ocorre após uma espera assíncrona.
 status('Escolha uma cópia autorizada deste PDF uma vez. A edição é feita aqui, sem upload.');
 $('pdfFileInput').click();
}
function selectFile(file){
 if(!file||!selected)return;
 if(!/\.pdf$/i.test(file.name)&&file.type!=='application/pdf'){status('Selecione um PDF válido.');return}
 if(file.size>120000000){status('PDF muito grande (limite 120 MB).');return}
 if(selected.filename&&selected.filename.toLowerCase()!==file.name.toLowerCase()){
  if(!confirm('O arquivo selecionado tem nome diferente do documento '+selected.id+'. Confirma que é o PDF correto?'))return;
 }
 openBytes(file,file.name,true);
}
function download(blob,name){
 const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;a.click();
 setTimeout(()=>URL.revokeObjectURL(url),30000);
}
async function exportPDF(){
 if(!pdf||!sourceBytes||!info||exportBusy)return;
 exportBusy=true;controls(false);status('Preparando uma nova cópia PDF com seus grifos; original preservado...');
 try{
  const lib=await pdflib(),pdfOutput=await lib.PDFDocument.load(sourceBytes.slice());
  const pages=pdfOutput.getPages();let count=0;
  for(let k=1;k<=pages.length;k++){
   const strokes=annotations(k).filter(m=>m&&(m.points?.length||m.pos?.length||m.type==='rect'&&m.box?.length===4));
   if(!strokes.length)continue;
   const cv=document.createElement('canvas');cv.width=1400;cv.height=Math.round(1400*pages[k-1].getHeight()/Math.max(1,pages[k-1].getWidth()));
   const ctx=cv.getContext('2d');for(const mark of strokes)stroke(ctx,mark,cv.width,cv.height);
   const img=await pdfOutput.embedPng(cv.toDataURL('image/png'));
   const pg=pages[k-1];pg.drawImage(img,{x:0,y:0,width:pg.getWidth(),height:pg.getHeight(),opacity:1});
   count++;
  }
  const bytes=await pdfOutput.save({useObjectStreams:true});
  const name=info.name.replace(/\.pdf$/i,'')+'_ANOTADO.pdf';
  download(new Blob([bytes],{type:'application/pdf'}),name);
  status('Cópia '+name+' gerada com '+count+' página(s) anotada(s). O PDF original do Drive não foi alterado.');
 }catch(e){status('Não foi possível exportar o PDF anotado: '+e.message)}
 finally{exportBusy=false;controls(!!pdf)}
}
function close(){
 serial++;const p=pdf;pdf=null;info=null;sourceBytes=null;selected=null;cachedSource=null;pageNo=1;undo.clear();redo.clear();draft=null;
 $('pdfLocalMode').classList.remove('active');$('pdfFrame').classList.remove('localHidden');$('pdfLocalTools').hidden=true;
 $('pdfFileInput').value='';$('pdfFileName').textContent='';$('pdfIntro').hidden=false;
 if(p)p.destroy().catch(()=>{});
}
const priorPdfOpen=pdfOpen;
pdfOpen=function(doc){
 close();selected=doc;priorPdfOpen(doc);
 $('pdfChooseLocal').textContent='✎ Editar PDF';
 status('Para grifar e editar nesta página, clique em “Editar PDF”. Documentos privados do Drive precisam de seleção local inicial.');
 storedFile(doc.id).then(record=>{
  if(selected?.id!==doc.id||!record?.blob)return;
  cachedSource={...record,id:doc.id};
  $('pdfChooseLocal').textContent='✎ Continuar edição';
  status('Cópia autorizada já salva neste navegador. Clique em “Continuar edição” para abrir as páginas e grifos.');
 }).catch(()=>{});
};
$('pdfChooseLocal').onclick=enterEditor;
$('pdfFileInput').onchange=e=>{const f=e.target.files?.[0];e.target.value='';selectFile(f)};
$('pdfChangeFile').onclick=()=>$('pdfFileInput').click();
$('pdfPrev').onclick=()=>{if(pdf&&pageNo>1){pageNo--;render()}};
$('pdfNext').onclick=()=>{if(pdf&&pageNo<pdf.numPages){pageNo++;render()}};
$('pdfZoomOut').onclick=()=>{if(pdf){zoom=Math.max(.55,Math.round(zoom/1.25*100)/100);render()}};
$('pdfZoomIn').onclick=()=>{if(pdf){zoom=Math.min(3,Math.round(zoom*1.25*100)/100);render()}};
$('pdfDraw').onclick=()=>markTool('pen');
$('pdfMarker').onclick=()=>markTool('marker');
$('pdfEraser').onclick=()=>markTool('eraser');
$('pdfPan').onclick=()=>markTool('pan');
$('pdfUndo').onclick=()=>historyEdit('undo');
$('pdfRedo').onclick=()=>historyEdit('redo');
$('pdfClearPage').onclick=()=>{
 if(!pdf||!annotationsInView.length)return;
 if(!confirm('Apagar todas as marcações desta página do PDF? Você poderá desfazer a operação.'))return;
 snapshot();annotationsInView=[];storeStrokes();paint();
};
$('pdfExportPNG').onclick=()=>{
 if(!pdf)return;
 const cv=document.createElement('canvas');cv.width=pageCanvas.width;cv.height=pageCanvas.height;
 const ctx=cv.getContext('2d');ctx.drawImage(pageCanvas,0,0);ctx.drawImage(inkCanvas,0,0);
 cv.toBlob(blob=>{if(blob)download(blob,selected.id+'_pagina_'+pageNo+'_anotada.png')},'image/png');
};
$('pdfExportPDF').onclick=exportPDF;
$('pdfClose').onclick=()=>$('pdfDialog').close();
$('pdfDialog').addEventListener('close',()=>{$('pdfFrame').src='about:blank';close()});
// Novos controles são agregados, preservando todas as ferramentas e grifos anteriores.
const peTools=$('pdfLocalTools')?.querySelector('.pdfGroup[aria-label="Ferramentas do PDF"]');
if(peTools){
 for(const [id,label,kind] of [['pdfNoteV037','Nota','note'],['pdfCardV037','Vincular CARD','card']]){
  const button=document.createElement('button');button.id=id;button.type='button';button.textContent=label;
  button.title=kind==='card'?'Registre ID de cartão na página do dispositivo':'Escreva anotação textual nesta página';
  button.onclick=()=>markTool(kind);peTools.append(button);
 }
}
markTool('marker');
function openAndEdit(doc){
 pdfOpen(doc);
 const local=String(doc.id||'').startsWith('LOCAL-');
 $('pdfOriginal').hidden=local;
 if(local){$('pdfFrame').src='about:blank';$('pdfIntro').textContent='PDF-guia original deste navegador. As marcações permanecem vinculadas a este arquivo. Exporte o PDF anotado como cópia de segurança.';}
 const storedFlag=localStorage.getItem('BM_PDF_HAS_SOURCE_V037:'+doc.id)==='1';
 if(storedFlag){
  storedFile(doc.id).then(record=>{
   if(selected?.id!==doc.id)return;
   if(record?.blob){cachedSource={...record,id:doc.id};openBytes(record.blob,record.name,false)}
   else status('Arquivo não restaurado. Clique Editar PDF e escolha o original novamente.');
  }).catch(()=>status('Falha ao restaurar cópia anterior. Clique Editar PDF.'));
 }else enterEditor();
}
window.BancoMestrePDFV035={get editing(){return !!pdf},render,exportPDF};
function openLocalFile(doc,file){
 pdfOpen(doc);$('pdfOriginal').hidden=true;$('pdfFrame').src='about:blank';
 selectFile(file);
}
window.BancoMestrePDFV037={get editing(){return !!pdf},render,exportPDF,openAndEdit,openLocal:openAndEdit,openLocalFile};
})();
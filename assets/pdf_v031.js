
/* Banco Mestre V031 — PDFs locais com anotação por página e ID.
   O original permanece no Google Drive e nenhum PDF é enviado ao servidor.
   A prévia do Drive, por ser externa, não pode ser anotada em um canvas do site. */
(function(){
'use strict';
const $=id=>document.getElementById(id);
let selectedPDF=null,pdf=null,fileInfo=null,pageNumber=1,scale=1.25,version=0,renderLock=Promise.resolve(),sourcePNG='',working=false;
let loadPromise=null;
function message(s){$('pdfLocalStatus').textContent=s}
function addScript(src){return new Promise((resolve,reject)=>{const s=document.createElement('script');s.src=src;s.onload=resolve;s.onerror=()=>reject(Error('Falha na biblioteca de leitura'));document.head.appendChild(s)})}
async function pdfjs(){
 if(window.pdfjsLib)return window.pdfjsLib;
 if(!loadPromise)loadPromise=(async()=>{
  try{await addScript('https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js')}
  catch{await addScript('https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.min.js')}
  if(!window.pdfjsLib)throw Error('O leitor de PDF não carregou');
  window.pdfjsLib.GlobalWorkerOptions.workerSrc='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
  return window.pdfjsLib;
 })();
 try{return await loadPromise}catch(e){loadPromise=null;throw e}
}
function docInkKey(){return 'PDF:'+selectedPDF.id+':'+fileInfo.hash+':P'+pageNumber}
function annotations(){try{return JSON.parse(localStorage.getItem('BM030_STROKES_'+docInkKey())||'[]')}catch{return []}}
function renderInk(ctx,w,h){
 for(const m of annotations()){
  if(!m||!['pen','highlighter','rect'].includes(m.type))continue;
  ctx.save();ctx.globalAlpha=m.type==='pen'?1:.35;ctx.strokeStyle=m.color||'#ffd400';ctx.fillStyle=m.color||'#ffd400';ctx.lineJoin='round';ctx.lineCap='round';
  if(m.type==='rect'&&m.box?.length===4){
   const a=m.box;ctx.fillRect(Math.min(a[0],a[2])*w,Math.min(a[1],a[3])*h,Math.abs(a[2]-a[0])*w,Math.abs(a[3]-a[1])*h);
  }else if(Array.isArray(m.points)&&m.points.length){
   const p=m.points;const thick=Math.max(1,Math.min(w,h)*(m.size||3)/1000*(m.type==='highlighter'?1.7:1));
   if(p.length===1){ctx.beginPath();ctx.arc(p[0][0]*w,p[0][1]*h,thick/2,0,Math.PI*2);ctx.fill()}
   else for(let i=1;i<p.length;i++){
    const a=p[i-1],b=p[i];ctx.lineWidth=thick*(.55+.3*((a[2]||.65)+(b[2]||.65)));
    ctx.beginPath();ctx.moveTo(a[0]*w,a[1]*h);ctx.lineTo(b[0]*w,b[1]*h);ctx.stroke();
   }
  }ctx.restore();
 }
}
function controls(ok){
 for(const id of ['pdfPrev','pdfNext','pdfDraw','pdfExportPNG','pdfZoomOut','pdfZoomIn'])$(id).disabled=!ok;
 if(ok){$('pdfPrev').disabled=pageNumber<=1;$('pdfNext').disabled=pageNumber>=pdf.numPages}
}
async function doRender(request){
 if(!pdf||request!==version)return;
 working=true;controls(false);message('Renderizando página '+pageNumber+'...');
 try{
  const page=await pdf.getPage(pageNumber);if(request!==version)return;
  const org=page.getViewport({scale:1});const factor=Math.min(2,2200/Math.max(org.width,org.height),Math.sqrt(4600000/(org.width*org.height)));
  const viewport=page.getViewport({scale:scale*factor});
  const cv=$('pdfLocalCanvas');cv.width=Math.max(1,Math.round(viewport.width));cv.height=Math.max(1,Math.round(viewport.height));
  const ctx=cv.getContext('2d',{alpha:false});ctx.fillStyle='#fff';ctx.fillRect(0,0,cv.width,cv.height);
  await page.render({canvasContext:ctx,viewport}).promise;
  if(request!==version)return;
  sourcePNG=cv.toDataURL('image/png');
  renderInk(ctx,cv.width,cv.height);
  $('pdfPager').textContent='Página '+pageNumber+' / '+pdf.numPages+' · '+Math.round(scale*100)+'%';
  message('Clique na página para abrir canetas, marca-texto, borracha e seleção. Anotações locais; PDF original intacto.');
 }catch(e){if(request===version)message('Não foi possível renderizar a página: '+e.message)}
 finally{if(request===version){working=false;controls(true)}}
}
function renderPage(){
 const n=++version;
 // Evita duas tarefas de renderização simultâneas no mesmo canvas.
 renderLock=renderLock.catch(()=>{}).then(()=>doRender(n));
 return renderLock;
}
async function hashFile(buffer){
 if(window.crypto?.subtle){
  const digest=await crypto.subtle.digest('SHA-256',buffer.slice(0));return [...new Uint8Array(digest)].slice(0,12).map(x=>x.toString(16).padStart(2,'0')).join('');
 }
 return 'local-'+buffer.byteLength+'-'+fileInfo.name.replace(/\W/g,'');
}
async function fileOpened(file){
 if(!selectedPDF||!file)return;
 controls(false);message('Lendo PDF somente neste aparelho...');
 try{
  const lib=await pdfjs();
  const bytes=await file.arrayBuffer();
  fileInfo={name:file.name,size:file.size,hash:''};
  fileInfo.hash=await hashFile(bytes);
  if(pdf)try{await pdf.destroy()}catch{}
  pdf=await lib.getDocument({data:new Uint8Array(bytes)}).promise;
  pageNumber=1;scale=1.25;
  $('pdfLocalMode').classList.add('active');$('pdfFrame').classList.add('localHidden');$('pdfLocalTools').hidden=false;
  const mismatch=selectedPDF.filename&&file.name.toLowerCase()!==selectedPDF.filename.toLowerCase();
  $('pdfFileName').textContent=file.name+(mismatch?' · confira se corresponde ao documento '+selectedPDF.id:'');
  await renderPage();
 }catch(e){
  message('Não foi possível carregar este PDF no editor local: '+e.message);
  $('pdfLocalMode').classList.remove('active');$('pdfFrame').classList.remove('localHidden');$('pdfLocalTools').hidden=true;pdf=null;fileInfo=null;controls(false);
 }
}
async function editPage(){
 if(!pdf||working||!sourcePNG)return;
 try{
  const img=await new Promise((resolve,reject)=>{let i=new Image();i.onload=()=>resolve(i);i.onerror=()=>reject(Error('Página indisponível'));i.src=sourcePNG});
  $('hideOpened').hidden=true;
  await window.BancoMestreEditorV030.open({image:img,imageId:docInkKey(),title:selectedPDF.id+' — página '+pageNumber,quality:'PDF aberto localmente: '+fileInfo.name,sourceUrl:selectedPDF.url,warning:'Caneta, marcador e borracha editam uma camada local sobre a página. Original PDF não é alterado. Anotações vinculadas ao ID, hash do PDF e página.'});
 }catch(e){message('Falha no editor da página: '+e.message);$('hideOpened').hidden=false}
}
function closeLocal(){
 version++;const old=pdf;pdf=null;fileInfo=null;selectedPDF=null;pageNumber=1;sourcePNG='';$('pdfLocalMode').classList.remove('active');$('pdfFrame').classList.remove('localHidden');$('pdfLocalTools').hidden=true;$('pdfFileInput').value='';$('pdfFileName').textContent='';
 if(old)old.destroy().catch(()=>{});
}
const priorPdfOpen=pdfOpen;
pdfOpen=function(item){
 closeLocal();selectedPDF=item;
 priorPdfOpen(item);
 $('pdfFileName').textContent='';
 message('Para anotar com canetas, escolha uma cópia local deste PDF. Não haverá envio nem anexo. A prévia do Drive continua disponível.');
};
$('pdfChooseLocal').onclick=()=>$('pdfFileInput').click();
$('pdfFileInput').onchange=e=>fileOpened(e.target.files?.[0]);
$('pdfPrev').onclick=()=>{if(!pdf||pageNumber<=1)return;pageNumber--;renderPage()};
$('pdfNext').onclick=()=>{if(!pdf||pageNumber>=pdf.numPages)return;pageNumber++;renderPage()};
$('pdfZoomOut').onclick=()=>{if(!pdf)return;scale=Math.max(.5,+(scale/1.25).toFixed(2));renderPage()};
$('pdfZoomIn').onclick=()=>{if(!pdf)return;scale=Math.min(3,+(scale*1.25).toFixed(2));renderPage()};
$('pdfDraw').onclick=editPage;$('pdfLocalCanvas').onclick=editPage;
$('pdfExportPNG').onclick=()=>{if(!pdf||!fileInfo||working)return;const a=document.createElement('a');a.href=$('pdfLocalCanvas').toDataURL('image/png');a.download=selectedPDF.id+'_pagina_'+pageNumber+'_anotada.png';a.click()};
$('pdfDialog').addEventListener('close',closeLocal);
$('imageDialog').addEventListener('close',()=>{if($('hideOpened').hidden){$('hideOpened').hidden=false;if(pdf)renderPage()}});
window.BancoMestrePDFV031={get isLocal(){return !!pdf},renderPage};
})();

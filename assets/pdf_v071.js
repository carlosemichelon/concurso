/* V071: adicionar seis categorias de cores; estados antigos continuam aceitos. */
/* V070: agrupamento atômico de grifos sem migrar registros anteriores. */
/* V069: estabilização do grifador — eventos de persistência e seleção após renderização. */
/* Banco Mestre V068: grifador avançado; os arquivos da V061 permanecem intactos. */
/* Banco Mestre V061: modo texto, V060 intacta. */

/* Banco Mestre V048 — leitor e editor PDF persistente com referência aos cartões, direto na página.
   PDF.js rasteriza para leitura; camada de tinta transparente usa IDs antigos
   BM030_STROKES_PDF:...; pdf-lib grava uma CÓPIA PDF anotada sem substituir original.
   O iframe Google Drive é somente leitura (origem cruzada).
   Cópias autorizadas podem ser guardadas apenas neste navegador em IndexedDB. */
(function(){
'use strict';
const $=id=>document.getElementById(id);
const versionTag='V038';
const DB_NAME='BancoMestrePDFLocalV035',STORE='sources';
let selected=null,pdf=null,sourceBytes=null,info=null,pageNo=1,zoom=1,task=Promise.resolve(),serial=0,painting=false,tool='marker',draft=null,undo=new Map(),redo=new Map(),loadingLib=null,loadingSaveLib=null,dbPromise=null,exportBusy=false,cachedSource=null;
const OPACITY_KEY='BM_PDF_MARKER_OPACITY_V046';
let markerOpacity=.25;
// V058: clique inicial e clique final produzem um trecho horizontal.
// Uma ação de arrastar continua gerando o grifo livre da versão anterior.
let pendingMarkerStart=null,markerGesture=null;
function notifyMarkerState(){
 window.dispatchEvent(new CustomEvent('bm-pdf-marker-state',{
  detail:{pending:!!pendingMarkerStart}
 }));
}
function cancelMarkerStart(){
 pendingMarkerStart=null;markerGesture=null;draft=null;notifyMarkerState();
}
function straightHighlight(start,end){
 // Preserva o mesmo formato de grifo da base e das exportações anteriores.
 // A altura é a do PRIMEIRO clique: o traço permanece alinhado à mesma linha.
 const y=start[1];
 return {type:'highlighter',color:$('pdfInkColor').value,size:12,
  opacity:markerOpacity,points:[[start[0],y,.65],[end[0],y,.65]],straight:true};
}
try{const saved=Number(localStorage.getItem(OPACITY_KEY));if(saved>=.1&&saved<=.65)markerOpacity=saved}catch(_){};
const pageCanvas=$('pdfLocalCanvas'),inkCanvas=$('pdfInkCanvas');
const pageWrap=$('pdfPageWrap'),pagePane=$('pdfLocalMode'),inkCtx=inkCanvas.getContext('2d');
// Janela virtual de três páginas: evita carregar centenas de canvases de uma só vez.
const prevSlice=document.createElement('div'),nextSlice=document.createElement('div');
for(const slice of [prevSlice,nextSlice]){
 slice.className='bm-v048-neighbor';slice.hidden=true;
 slice.setAttribute('aria-label','Página adjacente do PDF, disponível para leitura por rolagem');
}
pageWrap.before(prevSlice);pageWrap.after(nextSlice);
const topInPane=el=>el.getBoundingClientRect().top-pagePane.getBoundingClientRect().top+pagePane.scrollTop;
let suppressScroll=false,promoting=false,renderingNeighbors=false;

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
 try{
  localStorage.setItem(key(),JSON.stringify(annotationsInView));
  window.dispatchEvent(new CustomEvent('bm-pdf-storage-changed',{detail:{
   documentId:selected?.id||null,sourceHash:info?.hash||null,page:pageNo
  }}));
  return true;
 }catch(e){status('Anotações não foram salvas neste navegador: '+e.message);return false}
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
 cancelMarkerStart();
 tool=name;draft=null;
 for(const [key,n] of [['pdfDraw','pen'],['pdfMarker','marker'],['pdfEraser','eraser'],['pdfPan','pan']])$(key).setAttribute('aria-pressed',String(n===tool));
 inkCanvas.style.cursor=tool==='pan'?'grab':tool==='select'?'text':tool==='eraser'?'cell':'crosshair';
 inkCanvas.style.touchAction=tool==='pan'?'pan-x pan-y':tool==='select'?'auto':'none';
 inkCanvas.style.pointerEvents=(tool==='pan'||tool==='select')?'none':'auto';
 const selectButton=$('bmV061SelectTool');if(selectButton)selectButton.setAttribute('aria-pressed',String(tool==='select'));
 window.dispatchEvent(new CustomEvent('bm-pdf-tool-change',{detail:{tool}}));
}
function stroke(ctx,m,w,h){
 if(!m)return;
 if(m.type==='text_highlight'&&Array.isArray(m.rects)){
  ctx.save();
  const color=m.color||'#ffd400',style=m.style||'highlight';
  for(const b of m.rects){
   if(!Array.isArray(b)||b.length!==4||!b.every(Number.isFinite))continue;
   const x=b[0]*w,y=b[1]*h,width=Math.max(0,b[2]-b[0])*w,height=Math.max(0,b[3]-b[1])*h;
   if(style==='underline'||style==='double-underline'){
    ctx.globalAlpha=.92;ctx.strokeStyle=color;ctx.lineWidth=Math.max(1.5,height*.08);
    ctx.beginPath();ctx.moveTo(x,y+height-1);ctx.lineTo(x+width,y+height-1);ctx.stroke();
    if(style==='double-underline'){ctx.beginPath();ctx.moveTo(x,y+height-4);ctx.lineTo(x+width,y+height-4);ctx.stroke()}
   }else if(style==='strike'){
    ctx.globalAlpha=.92;ctx.strokeStyle=color;ctx.lineWidth=Math.max(1.5,height*.075);
    ctx.beginPath();ctx.moveTo(x,y+height*.55);ctx.lineTo(x+width,y+height*.55);ctx.stroke();
   }else if(style==='conceal'){
    ctx.globalAlpha=.97;ctx.fillStyle='#ffffff';ctx.fillRect(x,y,width,height);
    ctx.globalAlpha=1;ctx.fillStyle='#6d7b84';ctx.font=Math.max(8,Math.min(16,height*.78))+'px system-ui,Arial';
    ctx.fillText('⋯',x+3,y+height*.76,Math.max(0,width-4));
   }else{
    ctx.globalAlpha=Math.max(.08,Math.min(.65,Number(m.opacity)||.25));
    ctx.fillStyle=color;ctx.fillRect(x,y,width,height);
   }
  }
  ctx.restore();return;
 }
 if(m.type==='rect'&&Array.isArray(m.box)&&m.box.length===4){
  const b=m.box;ctx.save();ctx.globalAlpha=Math.max(.1,Math.min(.65,Number(m.opacity)||.25));
  ctx.fillStyle=m.color||'#ffd400';
  ctx.fillRect(Math.min(b[0],b[2])*w,Math.min(b[1],b[3])*h,Math.abs(b[2]-b[0])*w,Math.abs(b[3]-b[1])*h);
  ctx.restore();return;
 }
 if((m.type==='note'||m.type==='card'||m.type==='status')&&Array.isArray(m.pos)){
  ctx.save();ctx.globalAlpha=1;ctx.fillStyle=m.color||'#17616a';
  const fontSize=Math.max(10,Math.min(w,h)*.025);
  ctx.font='bold '+fontSize+'px system-ui,Arial,sans-serif';
  const lines=String(m.text||'').split('\n').slice(0,5);
  let y=m.pos[1]*h;for(const line of lines){ctx.fillText(line.slice(0,110),m.pos[0]*w,y);y+=fontSize*1.25}ctx.restore();return;
 }
 if(!Array.isArray(m.points)||!m.points.length)return;
 ctx.save();
 const isPen=m.type==='pen',opacity=isPen?1:Math.max(.1,Math.min(.65,Number(m.opacity)||.25));
 ctx.globalAlpha=opacity;ctx.lineCap='round';ctx.lineJoin='round';
 ctx.strokeStyle=m.color||(isPen?'#174059':'#ffd400');ctx.fillStyle=ctx.strokeStyle;
 const thick=Math.max(1,Math.min(w,h)*(m.size||3)/1000*(isPen?1:1.7));
 const pts=m.points;
 if(pts.length===1){ctx.beginPath();ctx.arc(pts[0][0]*w,pts[0][1]*h,thick/2,0,Math.PI*2);ctx.fill()}
 else if(!isPen){
  // Um único caminho evita que segmentos sucessivos acumulem opacidade e
  // escureçam o marca-texto. Também vale na exportação PDF/PNG.
  ctx.lineWidth=thick;
  ctx.beginPath();ctx.moveTo(pts[0][0]*w,pts[0][1]*h);
  for(let i=1;i<pts.length;i++)ctx.lineTo(pts[i][0]*w,pts[i][1]*h);
  ctx.stroke();
 }else{for(let i=1;i<pts.length;i++){
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
 if(m?.type==='text_highlight'&&Array.isArray(m.rects))return m.rects.some(b=>Array.isArray(b)&&b.length===4&&p[0]>=b[0]-.004&&p[0]<=b[2]+.004&&p[1]>=b[1]-.004&&p[1]<=b[3]+.004);
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
 if(tool==='note'||tool==='card'||tool==='status'){
  let typed=tool==='status'?prompt('Cobertura do dispositivo: 1=Integral; 2=Parcial; 3=Sem cartão; 4=Não auditado'):
   prompt(tool==='card'?'ID(s) de cartões (ex.: CARD-1280):':'Anotação textual nesta página da lei:');
  if(!typed||!typed.trim())return;
  typed=typed.trim();
  if(tool==='status'){
   const labels={'1':'[COBERTO]','2':'[PARCIAL]','3':'[SEM CARTAO]','4':'[NAO AUDITADO]'};
   if(!labels[typed]){status('Escolha um número de 1 a 4.');return}
   typed=labels[typed];
  }
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
 if(tool==='marker'){
  markerGesture=pendingMarkerStart?'second':'first';
  draft=markerGesture==='second'?straightHighlight(pendingMarkerStart,p):
   {type:'highlighter',color:$('pdfInkColor').value,size:12,opacity:markerOpacity,points:[p]};
 }else draft={type:'pen',color:$('pdfInkColor').value,size:3,opacity:1,points:[p]};
 inkCanvas.setPointerCapture(e.pointerId);e.preventDefault();paint();
});
inkCanvas.addEventListener('pointermove',e=>{
 if(tool==='marker'&&pendingMarkerStart&&markerGesture===null){
  // Prévia horizontal entre o primeiro clique e a posição do mouse.
  draft=straightHighlight(pendingMarkerStart,at(e));paint();return;
 }
 if(!draft||!inkCanvas.hasPointerCapture(e.pointerId))return;
 const p=at(e);
 if(tool==='marker'&&markerGesture==='second'){
  draft=straightHighlight(pendingMarkerStart,p);paint();return;
 }
 const pts=draft.points,last=pts[pts.length-1];
 if(Math.hypot((p[0]-last[0])*inkCanvas.width,(p[1]-last[1])*inkCanvas.height)>=1.6){
  pts.push(p);paint();
 }
});
inkCanvas.addEventListener('pointerleave',()=>{
 if(tool==='marker'&&pendingMarkerStart&&markerGesture===null){draft=null;paint()}
});
function endStroke(e){
 if(!draft)return;
 if(inkCanvas.hasPointerCapture(e.pointerId))inkCanvas.releasePointerCapture(e.pointerId);
 if(tool==='marker'&&markerGesture==='first'){
  // Um clique simples só define a origem: não grava um ponto no documento.
  const start=draft.points[0],end=at(e);
  const distance=Math.hypot((end[0]-start[0])*inkCanvas.width,
   (end[1]-start[1])*inkCanvas.height);
  if(distance<5){
   pendingMarkerStart=start;markerGesture=null;draft=null;
   notifyMarkerState();
   status('Início do grifo definido. Clique no fim da mesma linha. Esc cancela.');
   paint();return;
  }
 }else if(tool==='marker'&&markerGesture==='second'){
  const start=pendingMarkerStart,end=at(e);
  const distance=Math.abs((end[0]-start[0])*inkCanvas.width);
  if(distance<5){
   markerGesture=null;draft=null;
   status('Escolha o ponto final mais distante do início.');
   paint();return;
  }
  draft=straightHighlight(start,end);
 }
 snapshot();annotationsInView.push(draft);
 cancelMarkerStart();storeStrokes();paint();
}
inkCanvas.addEventListener('pointerup',endStroke);
inkCanvas.addEventListener('pointercancel',e=>{
 cancelMarkerStart();
 if(inkCanvas.hasPointerCapture(e.pointerId))inkCanvas.releasePointerCapture(e.pointerId);
 paint();
});
document.addEventListener('keydown',e=>{
 if(e.key!=='Escape'||!pendingMarkerStart||!$('pdfDialog')?.open)return;
 if(e.target?.closest?.('input,textarea,select,[contenteditable="true"]'))return;
 e.preventDefault();cancelMarkerStart();paint();
 status('Grifo de dois cliques cancelado.');
},true);
function historyEdit(type){
 if(pendingMarkerStart){cancelMarkerStart();paint();}
 const id=key(),from=type==='undo'?undo:redo,to=type==='undo'?redo:undo,stack=from.get(id)||[];
 if(!stack.length)return;
 const current=JSON.stringify(annotationsInView);
 if(!to.has(id))to.set(id,[]);to.get(id).push(current);
 annotationsInView=JSON.parse(stack.pop());
 storeStrokes();paint();window.dispatchEvent(new CustomEvent('bm-pdf-mark-changed',{detail:{action:type,page:pageNo}}));
}
async function renderNeighbor(slice,target,ticket){
 if(target<1||target>pdf.numPages){slice.hidden=true;slice.replaceChildren();return}
 const page=await pdf.getPage(target);
 if(ticket!==serial||!pdf)return;
 const original=page.getViewport({scale:1});
 const available=Math.max(320,pagePane.clientWidth-30);
 const scale=Math.min(1.6,Math.max(.55,available/original.width))*zoom;
 const viewport=page.getViewport({scale});
 const max=Math.min(1,2200/Math.max(viewport.width,viewport.height),Math.sqrt(4500000/(viewport.width*viewport.height)));
 const physical=page.getViewport({scale:scale*max});
 const width=Math.max(1,Math.round(physical.width)),height=Math.max(1,Math.round(physical.height));
 const image=document.createElement('canvas');image.width=width;image.height=height;
 image.style.width=Math.round(viewport.width)+'px';image.style.height=Math.round(viewport.height)+'px';
 const context=image.getContext('2d',{alpha:false});
 context.fillStyle='white';context.fillRect(0,0,width,height);
 await page.render({canvasContext:context,viewport:physical}).promise;
 if(ticket!==serial||!pdf)return;
 const marker=document.createElement('canvas');marker.width=width;marker.height=height;
 marker.style.width=image.style.width;marker.style.height=image.style.height;
 const ctx=marker.getContext('2d');
 for(const m of annotations(target))stroke(ctx,m,width,height);
 const label=document.createElement('small');label.className='bm-v048-page-caption';
 label.textContent='Página '+target+' — role para ativar a edição';
 const surface=document.createElement('div');surface.className='bm-v048-neighbor-canvas';
 surface.append(image,marker);
 slice.style.width=image.style.width;
 slice.replaceChildren(label,surface);
 slice.dataset.page=String(target);slice.hidden=false;
}
async function renderOne(ticket){
 if(!pdf||ticket!==serial)return;
 painting=true;controls(false);status('Carregando página '+pageNo+'...');
 let readyDetail=null;
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
  readyDetail={page:pageNo,documentId:selected?.id||null,sourceHash:info?.hash||null,viewportScale:visual};
  $('pdfPager').textContent='Página '+pageNo+' de '+pdf.numPages+' · '+Math.round(zoom*100)+'%';
  status('Rolagem contínua entre páginas; grifos e cartões são editáveis somente na página ativa. O original permanece preservado.');
  renderingNeighbors=true;
  await Promise.all([
   renderNeighbor(prevSlice,pageNo-1,ticket),
   renderNeighbor(nextSlice,pageNo+1,ticket)
  ]);
  renderingNeighbors=false;
 }catch(e){if(ticket===serial)status('Erro ao renderizar a página: '+e.message)}
 finally{
  if(ticket===serial){
   painting=false;renderingNeighbors=false;controls(!!pdf);
   if(readyDetail)window.dispatchEvent(new CustomEvent('bm-pdf-active-page-rendered',{detail:readyDetail}));
  }
 }
}
function render(){const ticket=++serial;task=task.catch(()=>{}).then(()=>renderOne(ticket));return task}

/* V048 — rolagem vertical contínua, com vizinhas visualizáveis e uma
   página editável ativa. PDF grande: apenas anterior, atual e próxima
   renderizadas; IDs e marcas são mantidos por número/hash do documento. */
let lastScrollPromotion=0;
async function promoteByScroll(direction){
 if(!pdf||painting||renderingNeighbors||promoting||draft||exportBusy)return;
 const target=direction>0?nextSlice:prevSlice;
 if(target.hidden)return;
 promoting=true;lastScrollPromotion=Date.now();
 const relative=pagePane.scrollTop-topInPane(target);
 pageNo+=direction;
 try{
  await render();
  if(!pdf)return;
  suppressScroll=true;
  pagePane.scrollTop=Math.max(0,topInPane(pageWrap)+relative);
  requestAnimationFrame(()=>{suppressScroll=false});
 }finally{promoting=false}
}
let scrollFrame=0;
pagePane.addEventListener('scroll',()=>{
 if(suppressScroll||promoting||painting||renderingNeighbors||!pdf||draft||exportBusy)return;
 if(scrollFrame)return;
 scrollFrame=requestAnimationFrame(()=>{
  scrollFrame=0;
  if(suppressScroll||promoting||painting||!pdf)return;
  if(Date.now()-lastScrollPromotion<130)return;
  const center=pagePane.scrollTop+pagePane.clientHeight/2;
  if(!nextSlice.hidden&&center>topInPane(nextSlice)+Math.min(85,nextSlice.offsetHeight/5))
   void promoteByScroll(1);
  else if(!prevSlice.hidden&&center<topInPane(pageWrap)-30)
   void promoteByScroll(-1);
 });
},{passive:true});
pagePane.tabIndex=0;
pagePane.setAttribute('aria-label','Leitor PDF de rolagem contínua: role para avançar ou voltar. Apenas a página central ativa recebe grifos e cartões; para rolar com toque escolha Mover.');
function centerActive(){
 suppressScroll=true;
 pagePane.scrollTop=Math.max(0,topInPane(pageWrap)-8);
 requestAnimationFrame(()=>{suppressScroll=false});
}
// V057 — ir diretamente para qualquer página válida, mantendo o fluxo
// normal de renderização, rolagem e anotações da página ativa.
async function goToPage(input){
 if(!pdf)return false;
 const n=Number(input);
 if(!Number.isInteger(n)||n<1||n>pdf.numPages)return false;
 if(n!==pageNo){pageNo=n;await render();}
 centerActive();
 return true;
}
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
  markTool('select'); // V061: seleção textual padrão, grifo livre alternativo.
  $('pdfIntro').hidden=true;
  if(remember){
   const saved=await storeFile(current.id,new File([blob],name,{type:'application/pdf'}));
   if(saved)try{localStorage.setItem('BM_PDF_HAS_SOURCE_V037:'+current.id,'1')}catch(e){}
   if(!saved)status('PDF aberto, porém o armazenamento neste navegador não está disponível.');
  }
  await render();
  centerActive();
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
async function buildAnnotated(){
 if(!pdf||!sourceBytes||!info||!selected||exportBusy)throw Error('Abra um PDF no editor antes de salvar.');
 const sourceDoc=selected,sourceName=info.name,sourceHash=info.hash,originalBytes=sourceBytes.slice();
 exportBusy=true;controls(false);
 status('Preparando cópia PDF com marcações — original preservado...');
 try{
  const lib=await pdflib();
  const pdfOutput=await lib.PDFDocument.load(originalBytes);
  const pages=pdfOutput.getPages();let count=0;
  for(let k=1;k<=pages.length;k++){
   const storageKey='BM030_STROKES_PDF:'+sourceDoc.id+':'+sourceHash+':P'+k;
   let strokes;
   try{strokes=JSON.parse(localStorage.getItem(storageKey)||'[]')}
   catch{throw Error('Anotações locais inválidas na página '+k)}
   if(!Array.isArray(strokes))throw Error('Dados de marcação inválidos na página '+k);
   strokes=strokes.filter(m=>m&&(m.points?.length||m.pos?.length||(m.type==='rect'&&m.box?.length===4)||(m.type==='text_highlight'&&m.rects?.length)));
   if(!strokes.length)continue;
   const cv=document.createElement('canvas');cv.width=1400;cv.height=Math.round(1400*pages[k-1].getHeight()/Math.max(1,pages[k-1].getWidth()));
   const ctx=cv.getContext('2d');
   for(const mark of strokes)stroke(ctx,mark,cv.width,cv.height);
   const img=await pdfOutput.embedPng(cv.toDataURL('image/png'));
   const pg=pages[k-1];pg.drawImage(img,{x:0,y:0,width:pg.getWidth(),height:pg.getHeight(),opacity:1});
   count++;
  }
  const bytes=await pdfOutput.save({useObjectStreams:true});
  const name=sourceName.replace(/\.pdf$/i,'')+'_ANOTADO.pdf';
  return {blob:new Blob([bytes],{type:'application/pdf'}),name,pagesMarked:count,
   doc:{id:sourceDoc.id,title:sourceDoc.title||sourceName,file_id:sourceDoc.file_id||'',hash:sourceHash}};
 }finally{exportBusy=false;controls(!!pdf)}
}
async function exportPDF(){
 try{
  const result=await buildAnnotated();
  download(result.blob,result.name);
  status('Cópia '+result.name+' gerada com '+result.pagesMarked+' página(s) anotada(s). O PDF original não foi alterado.');
 }catch(e){status('Não foi possível exportar o PDF anotado: '+e.message)}
}

function close(){
 cancelMarkerStart();
 serial++;const p=pdf;pdf=null;info=null;sourceBytes=null;selected=null;cachedSource=null;pageNo=1;undo.clear();redo.clear();draft=null;
 $('pdfLocalMode').classList.remove('active');$('pdfFrame').classList.remove('localHidden');$('pdfLocalTools').hidden=true;
 prevSlice.hidden=true;nextSlice.hidden=true;prevSlice.replaceChildren();nextSlice.replaceChildren();
 $('pdfFileInput').value='';$('pdfFileName').textContent='';$('pdfIntro').hidden=false;
 if(p)p.destroy().catch(()=>{});
}
const priorPdfOpen=pdfOpen;
pdfOpen=function(doc){
 close();selected=doc;
 // Se a janela já estiver aberta durante OAuth, não chamar showModal novamente.
 if($('pdfDialog').open){
  $('docTitle').textContent=doc.title;
  $('pdfOriginal').href=doc.url||'';
  if(doc.file_id)$('pdfFrame').src='https://drive.google.com/file/d/'+encodeURIComponent(doc.file_id)+'/preview';
 }else priorPdfOpen(doc);
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
$('pdfPrev').onclick=async()=>{if(pdf&&pageNo>1){pageNo--;await render();centerActive()}};
$('pdfNext').onclick=async()=>{if(pdf&&pageNo<pdf.numPages){pageNo++;await render();centerActive()}};
$('pdfZoomOut').onclick=async()=>{if(pdf){zoom=Math.max(.55,Math.round(zoom/1.25*100)/100);await render();centerActive()}};
$('pdfZoomIn').onclick=async()=>{if(pdf){zoom=Math.min(3,Math.round(zoom*1.25*100)/100);await render();centerActive()}};
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
 for(const [id,label,kind] of [['pdfNoteV037','Nota','note'],['pdfCardV037','Vincular CARD','card'],['pdfStatusV037','Cobertura','status']]){
  const button=document.createElement('button');button.id=id;button.type='button';button.textContent=label;
  button.title=kind==='card'?'Registre ID de cartão na página do dispositivo':'Escreva anotação textual nesta página';
  button.onclick=()=>markTool(kind);peTools.append(button);
 }
}
// Transparência ajustável apenas para marca-texto, sem afetar caneta ou notas.
const opacityLabel=document.createElement('label');
opacityLabel.id='pdfMarkerOpacityWrapV046';
opacityLabel.title='Opacidade dos próximos grifos. As marcações já salvas mantêm sua transparência.';
opacityLabel.setAttribute('aria-label','Transparência do marca-texto');
opacityLabel.innerHTML='<span>Grifo</span> <input id="pdfMarkerOpacityV046" type="range" min="10" max="65" step="5" value="'+Math.round(markerOpacity*100)+'" aria-label="Opacidade dos próximos grifos"> <output id="pdfOpacityValueV046">'+Math.round(markerOpacity*100)+'%</output>';
const colorLabel=$('pdfInkColor')?.parentElement;
if(colorLabel)colorLabel.after(opacityLabel);
$('pdfMarkerOpacityV046').addEventListener('input',e=>{
 markerOpacity=Math.max(.1,Math.min(.65,Number(e.target.value)/100));
 $('pdfOpacityValueV046').textContent=Math.round(markerOpacity*100)+'%';
 try{localStorage.setItem(OPACITY_KEY,String(markerOpacity))}catch(_){}
});
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
window.BancoMestrePDFV038={
 get editing(){return !!pdf},
 render,exportPDF,
 openPreview(doc){pdfOpen(doc)},
 async openStored(doc){
  const local=await storedFile(doc.id);
  if(!local?.blob)return false;
  pdfOpen(doc);
  await openBytes(local.blob,local.name||doc.filename||doc.title+'.pdf',false);
  return !!pdf;
 },
 async openFromDrive(doc,blob){
  if(!blob||!doc)throw Error('Origem PDF inválida');
  pdfOpen(doc);
  const name=doc.filename||doc.title+'.pdf';
  await openBytes(blob,name,true);
  if(!pdf)throw Error('Não foi possível renderizar o documento recebido do Drive');
  return true;
 }
};
// Ctrl+Z desfaz a última anotação na página ativa; o navegador mantém
// seus atalhos em campos de texto e quando o editor PDF está fechado.
document.addEventListener('keydown',e=>{
 if(!$('pdfDialog')?.open||!pdf||$('imageDialog')?.open||e.isComposing||e.altKey)return;
 if(e.target?.closest?.('input,textarea,select,[contenteditable="true"],[role="textbox"]'))return;
 if(!(e.ctrlKey||e.metaKey))return;
 const key=String(e.key).toLowerCase();
 if(key==='z'||key==='y'){
  e.preventDefault();
  historyEdit(key==='y'||e.shiftKey?'redo':'undo');
 }
},true);

/* V059 — extração aproximada de texto sob grifos, por coordenada PDF.js.
   Os grifos originais estão em coordenadas normalizadas; o PDF.js devolve
   texto e transformações no espaço da página visível. Nenhum PDF é editado. */
function bm059ExtractPageText(textContent,viewport,highlights,pdfUtil){
 const width=viewport.width,height=viewport.height;
 const glyphs=[];
 const styles=textContent.styles||{};
 const transform=pdfUtil?.transform;
 if(typeof transform!=='function')throw Error('Transformações de texto do PDF.js não disponíveis');
 const charWeight=c=>{
  if(/\s/u.test(c))return .35;
  if(/[ilI1.,:;!|'\u0060]/u.test(c))return .42;
  if(/[mwMW@%&]/u.test(c))return 1.45;
  if(/[A-ZÀ-Ý]/u.test(c))return 1.12;
  return 1;
 };
 let rotatedIgnored=0;
 for(let index=0;index<(textContent.items||[]).length;index++){
  const item=textContent.items[index];
  if(!item?.str||!Array.isArray(item.transform))continue;
  const matrix=transform(viewport.transform,item.transform);
  const font=Math.max(1,Math.hypot(matrix[2],matrix[3])||item.height||9);
  // Grifos em linhas horizontais: texto vertical/rotacionado precisa revisão.
  if(Math.abs(matrix[1])>Math.abs(matrix[0])*.18){rotatedIgnored++;continue;}
  const dir=item.dir==='rtl'?-1:1;
  const chars=Array.from(item.str);
  const weights=chars.map(charWeight),totalWeight=weights.reduce((a,b)=>a+b,0)||1;
  const span=Math.max(font*.2,Math.abs(Number(item.width)||0)*viewport.scale);
  const style=styles[item.fontName]||{};
  const ascent=Number.isFinite(style.ascent)?style.ascent:.82;
  const descent=Number.isFinite(style.descent)?style.descent:-.18;
  const baseline=matrix[5];
  const centerY=baseline-(ascent+descent)*font/2;
  let cursor=matrix[4];
  for(let ci=0;ci<chars.length;ci++){
   const advance=span*weights[ci]/totalWeight;
   const left=dir>0?cursor:cursor-advance,right=left+advance;
   glyphs.push({
    char:chars[ci],left,right,x:(left+right)/2,y:centerY,
    height:Math.max(4,font),item:index,character:ci
   });
   cursor+=dir*advance;
  }
 }
 function distToSegment(x,y,ax,ay,bx,by){
  const dx=bx-ax,dy=by-ay,den=dx*dx+dy*dy;
  const t=den?Math.max(0,Math.min(1,((x-ax)*dx+(y-ay)*dy)/den)):0;
  return Math.hypot(x-(ax+t*dx),y-(ay+t*dy));
 }
 function hitsGlyph(mark,g){
  if(mark.type==='text_highlight'&&Array.isArray(mark.rects)&&mark.rects.length){
   return mark.rects.some(b=>Array.isArray(b)&&b.length===4&&g.right>=b[0]*width-1&&g.left<=b[2]*width+1&&g.y>=b[1]*height-g.height*.4&&g.y<=b[3]*height+g.height*.4);
  }
  if(mark.type==='rect'&&Array.isArray(mark.box)&&mark.box.length===4){
   const [ax,ay,bx,by]=mark.box;
   const x0=Math.min(ax,bx)*width,x1=Math.max(ax,bx)*width;
   const y0=Math.min(ay,by)*height,y1=Math.max(ay,by)*height;
   return g.right>=x0-1&&g.left<=x1+1&&
     g.y>=y0-g.height*.4&&g.y<=y1+g.height*.4;
  }
  const points=(mark.points||[]).filter(p=>Array.isArray(p)&&p.length>=2&&
   Number.isFinite(p[0])&&Number.isFinite(p[1]));
  if(!points.length)return false;
  const pointToPx=p=>[p[0]*width,p[1]*height];
  const radius=Math.max(3.0,Math.min(width,height)*(Number(mark.size)||12)/1000*.5,g.height*.54);
  if(points.length===1){
   const p=pointToPx(points[0]);return Math.hypot(g.x-p[0],g.y-p[1])<=radius;
  }
  // A extensão horizontal do glifo é considerada, evitando perder as letras
  // nas extremidades dos grifos de dois cliques.
  for(let i=1;i<points.length;i++){
   const a=pointToPx(points[i-1]),b=pointToPx(points[i]);
   if(mark.straight||Math.abs(a[1]-b[1])<=2){
    if(g.right>=Math.min(a[0],b[0])-2&&g.left<=Math.max(a[0],b[0])+2&&
      Math.abs(g.y-(a[1]+b[1])/2)<=radius)return true;
   }else if(distToSegment(g.x,g.y,...a,...b)<=radius)return true;
  }
  return false;
 }
 function joinGlyphs(selected){
  if(!selected.length)return '';
  selected.sort((a,b)=>a.y-b.y||a.left-b.left||a.item-b.item||a.character-b.character);
  const lines=[];
  for(const g of selected){
   const last=lines[lines.length-1];
   if(last&&Math.abs(last.y-g.y)<Math.max(3,Math.min(last.height,g.height)*.52)){
    last.glyphs.push(g);
    last.y=(last.y*(last.glyphs.length-1)+g.y)/last.glyphs.length;
   }else lines.push({y:g.y,height:g.height,glyphs:[g]});
  }
  return lines.map(line=>{
   line.glyphs.sort((a,b)=>a.left-b.left||a.item-b.item||a.character-b.character);
   let out='',previous=null;
   for(const g of line.glyphs){
    if(previous&&g.item!==previous.item&&
     g.left-previous.right>Math.max(2,g.height*.23)&&
     out&&!/\s$/.test(out)&&!/^\s$/.test(g.char))out+=' ';
    out+=g.char;previous=g;
   }
   return out.replace(/\s+/gu,' ').trim();
  }).filter(Boolean).join('\n');
 }
 return {
  hasDigitalText:glyphs.some(g=>g.char.trim()),
  rotatedIgnored,
  texts:highlights.map((mark,i)=>{
   const selected=glyphs.filter(g=>hitsGlyph(mark,g));
   return {mark_index:i+1,type:mark.type||'highlighter',
    text:joinGlyphs(selected),
    status:!glyphs.some(g=>g.char.trim())?'sem_texto_digital':
      selected.length?'extraido_para_conferencia':'sem_correspondencia_geometrica'};
  })
 };
}
async function bm059ExtractHighlights({scope='all',onProgress}={}){
 if(!pdf||!selected||!info)throw Error('Abra uma cópia editável do PDF antes de extrair.');
 const currentDocumentId=selected.id,currentHash=info.hash;
 const pages=[];
 for(let n=1;n<=pdf.numPages;n++){
  if(scope==='current'&&n!==pageNo)continue;
  const marks=annotations(n).filter(m=>
   (m?.type==='highlighter'&&Array.isArray(m.points)&&m.points.length)||
   (m?.type==='rect'&&Array.isArray(m.box)&&m.box.length===4)||
   (m?.type==='text_highlight'&&Array.isArray(m.rects)&&m.rects.length));
  if(marks.length)pages.push({number:n,marks});
 }
 const result={
  format:'BancoMestreTextosGrifadosV059',
  document_id:currentDocumentId,document_title:selected.title||info.name||currentDocumentId,
  source_filename:info.name,source_hash:currentHash,
  scope:scope==='current'?'pagina_ativa':'documento_inteiro',
  total_pages:pdf.numPages,highlighted_pages:pages.length,
  highlight_count:pages.reduce((acc,p)=>acc+p.marks.length,0),
  generated_at:new Date().toISOString(),
  method:'intersecao geometrica entre tracos e caracteres da camada de texto PDF.js; resultado aproximado, deve ser conferido',
  entries:[],
  warnings:[]
 };
 let scanned=0,unmatched=0,errors=0;
 for(let i=0;i<pages.length;i++){
  if(!pdf||!selected||selected.id!==currentDocumentId||!info||info.hash!==currentHash)
   throw Error('O documento mudou durante a extração. Abra o PDF novamente.');
  const record=pages[i];
  if(typeof onProgress==='function')onProgress(i+1,pages.length,record.number);
  try{
   const pdfPage=await pdf.getPage(record.number);
   const tc=await pdfPage.getTextContent();
   const viewport=pdfPage.getViewport({scale:1});
   const parsed=bm059ExtractPageText(tc,viewport,record.marks,window.pdfjsLib?.Util);
   if(!parsed.hasDigitalText)scanned++;
   if(parsed.rotatedIgnored)result.warnings.push('Página '+record.number+': '+parsed.rotatedIgnored+' trechos rotacionados não analisados.');
   for(const t of parsed.texts){
    const sourceMark=record.marks[t.mark_index-1];
    const precise=sourceMark?.type==='text_highlight'&&typeof sourceMark.text==='string'&&!!sourceMark.text.trim();
    if(t.status==='sem_correspondencia_geometrica'&&!precise)unmatched++;
    result.entries.push({page:record.number,mark:t.mark_index,
     text:precise?sourceMark.text:t.text,status:precise?'texto_selecionado':t.status,
     anchor_id:precise?sourceMark.id:null});
   }
  }catch(e){
   errors++;
   for(let j=0;j<record.marks.length;j++){
    result.entries.push({page:record.number,mark:j+1,text:'',
     status:'erro_de_leitura',error:String(e.message||e)});
   }
  }
 }
 if(scanned)result.warnings.push(scanned+' página(s) grifada(s) sem camada de texto digital; essas páginas exigem OCR.');
 if(unmatched)result.warnings.push(unmatched+' grifo(s) não corresponderam a texto detectável; confira posicionamento, direção ou qualidade do PDF.');
 if(errors)result.warnings.push(errors+' página(s) não puderam ser processadas.');
 result.extracted_count=result.entries.filter(e=>(e.status==='extraido_para_conferencia'||e.status==='texto_selecionado')&&e.text).length;
 return result;
}



function validateTextRecord(r){
 if(!pdf||!selected||!info||painting||exportBusy||tool!=='select'||!r||
 r.page!==pageNo||r.documentId!==selected.id||r.sourceHash!==info.hash)return null;
 const text=String(r.text||'').trim();
 const rects=(Array.isArray(r.rects)?r.rects:[]).filter(b=>Array.isArray(b)&&b.length===4&&
 b.every(v=>Number.isFinite(v)&&v>=0&&v<=1)&&b[0]<b[2]&&b[1]<b[3]).slice(0,250);
 if(!text||!rects.length||text.length>20000)return null;
 return {text,rects};
}
function identicalHighlight(a,b){
 return a?.type==='text_highlight'&&a.text===b.text&&
 Array.isArray(a.rects)&&a.rects.length===b.rects.length&&
 a.rects.every((box,i)=>Array.isArray(box)&&box.length===4&&box.every((v,j)=>Number.isFinite(v)&&Math.abs(v-b.rects[i][j])<.001));
}
function buildTextMark(r,validated){
 const {text,rects}=validated,id='BM-TXT-'+(globalThis.crypto?.randomUUID?.()||Date.now()+'-'+Math.random().toString(36).slice(2));
 const color=/^#[0-9a-f]{6}$/i.test(r.color||'')?r.color:($('pdfInkColor')?.value||'#ffe000');
 const kinds=['proibicao','obrigacao','prazo_numero','excecao','banca','regra','agente','condicao','nao_classificado'];
 const classificationKind=kinds.includes(r.classification_kind)?r.classification_kind:'nao_classificado';
 const suggestion=r.subject_suggestion&&typeof r.subject_suggestion==='object'?r.subject_suggestion:{};
 const mark={type:'text_highlight',id,text,rects,color,opacity:markerOpacity,
  style:['highlight','underline','double-underline','strike','conceal'].includes(r.style)?r.style:'highlight',
  color_label:String(r.color_label||'').slice(0,90),
  anchor:{quote:text,prefix:String(r.anchor?.prefix||'').slice(0,100),suffix:String(r.anchor?.suffix||'').slice(0,100)},
  source_id:selected.id,source_hash:info.hash,page:pageNo,created_at:new Date().toISOString(),
  classification_kind:classificationKind,
  classification_status:r.classification_status==='confirmada'?'confirmada':'sugestao',
  subject_suggestion:{
   discipline:String(suggestion.discipline||'').slice(0,120),
   topic:String(suggestion.topic||'').slice(0,140),
   subtopic:String(suggestion.subtopic||'').slice(0,140),
   basis:String(suggestion.basis||'').slice(0,60)
  },
  note_suggestion:String(r.note_suggestion||'').slice(0,1400),
  segment_index:Number.isInteger(r.segment_index)?r.segment_index:null,
  segment_total:Number.isInteger(r.segment_total)?r.segment_total:null,
  note:'',note_structured:{},tags:[],favorite:false,card_ids:[],history:[]};
 return mark;
}
function addTextHighlight(r){
 const valid=validateTextRecord(r);
 if(!valid)return null;
 const match={text:valid.text,rects:valid.rects};
 const duplicate=annotationsInView.find(m=>identicalHighlight(m,match));
 if(duplicate)return {...duplicate,duplicate:true};
 const mark=buildTextMark(r,valid);
 snapshot();annotationsInView.push(mark);
 if(!storeStrokes()){
  annotationsInView.pop();
  undo.get(key())?.pop();paint();return null;
 }
 paint();
 window.dispatchEvent(new CustomEvent('bm-pdf-mark-changed',{detail:{id:mark.id,action:'create',page:pageNo}}));
 return {...mark};
}
// Uma seleção pode produzir várias cores e frases. Persistência e desfazer são atômicos.
function addTextHighlights(records){
 if(!Array.isArray(records)||!records.length||records.length>40)return null;
 const created=[],duplicates=[];
 for(const r of records){
  const valid=validateTextRecord(r);
  if(!valid)return null; // nenhuma gravação parcial em caso de trecho inválido
  const match={text:valid.text,rects:valid.rects};
  const dup=[...annotationsInView,...created].find(m=>identicalHighlight(m,match));
  if(dup){duplicates.push(dup.id);continue}
  created.push(buildTextMark(r,valid));
 }
 if(!created.length)return {marks:[],duplicates,unchanged:true};
 snapshot();
 annotationsInView.push(...created);
 if(!storeStrokes()){
  annotationsInView.splice(annotationsInView.length-created.length,created.length);
  undo.get(key())?.pop();paint();return null;
 }
 paint();
 window.dispatchEvent(new CustomEvent('bm-pdf-mark-changed',{detail:{
  ids:created.map(m=>m.id),action:'create-group',page:pageNo
 }}));
 return {marks:created.map(m=>({...m})),duplicates,unchanged:false};
}
function updateTextHighlight(id,patch){
 if(!pdf||painting||exportBusy||!id||!patch||typeof patch!=='object')return false;
 const i=annotationsInView.findIndex(m=>m?.type==='text_highlight'&&m.id===id);
 if(i<0)return false;
 const previous=annotationsInView[i],mark={...previous};
 if(Object.hasOwn(patch,'color')&&/^#[0-9a-f]{6}$/i.test(patch.color))mark.color=patch.color;
 if(Object.hasOwn(patch,'color_label'))mark.color_label=String(patch.color_label||'').slice(0,90);
 if(Object.hasOwn(patch,'style')&&['highlight','underline','double-underline','strike','conceal'].includes(patch.style))mark.style=patch.style;
 if(Object.hasOwn(patch,'note'))mark.note=String(patch.note||'').slice(0,12000);
 if(Object.hasOwn(patch,'text')||Object.hasOwn(patch,'rects')){
  if(typeof patch.text!=='string'||!patch.text.trim()||patch.text.length>20000)return false;
  if(!Array.isArray(patch.rects)||!patch.rects.length||patch.rects.length>250||
   !patch.rects.every(b=>Array.isArray(b)&&b.length===4&&b.every(v=>Number.isFinite(v)&&v>=0&&v<=1)&&b[0]<b[2]&&b[1]<b[3]))return false;
  mark.text=patch.text.trim();mark.rects=patch.rects.map(b=>b.slice());
  mark.anchor={quote:mark.text,prefix:String(patch.anchor?.prefix||'').slice(0,100),
   suffix:String(patch.anchor?.suffix||'').slice(0,100)};
 }
 if(Object.hasOwn(patch,'note_structured')){
  const accepted=['explicacao','duvida','correcao','macete','pegadinha','fundamento','fonte'];
  const source=patch.note_structured&&typeof patch.note_structured==='object'?patch.note_structured:{};
  mark.note_structured=Object.fromEntries(accepted.map(k=>[k,String(source[k]||'').slice(0,8000)]));
 }
 if(Object.hasOwn(patch,'tags')){
  mark.tags=[...new Set((Array.isArray(patch.tags)?patch.tags:[]).map(x=>String(x||'').trim().slice(0,45)).filter(Boolean))].slice(0,30);
 }
 if(Object.hasOwn(patch,'favorite'))mark.favorite=!!patch.favorite;
 if(Object.hasOwn(patch,'classification_status')&&['sugestao','confirmada'].includes(patch.classification_status))
  mark.classification_status=patch.classification_status;
 if(Object.hasOwn(patch,'classification_kind')&&['proibicao','obrigacao','prazo_numero','excecao','banca','regra','agente','condicao','nao_classificado'].includes(patch.classification_kind))
  mark.classification_kind=patch.classification_kind;
 if(Object.hasOwn(patch,'card_ids')){
  mark.card_ids=[...new Set((Array.isArray(patch.card_ids)?patch.card_ids:[]).map(x=>String(x).trim()).filter(x=>/^(CARD-\d{4,}|PROP-IJUI-\d+)$/i.test(x)))].slice(0,80);
 }
 const changed=['color','color_label','style','note','text','rects','note_structured','tags','favorite','card_ids','classification_status','classification_kind']
  .some(k=>Object.hasOwn(patch,k)&&JSON.stringify(mark[k])!==JSON.stringify(previous[k]));
 if(!changed)return true;
 // Histórico incremental: registrar apenas campos alterados para preservar espaço do navegador.
 const fields=['color','color_label','style','note','text','rects','note_structured','tags','favorite','card_ids','classification_status','classification_kind'];
 const before={};
 for(const name of fields){
  if(JSON.stringify(mark[name])!==JSON.stringify(previous[name]))before[name]=previous[name]??null;
 }
 mark.history=[...(Array.isArray(previous.history)?previous.history:[]).slice(-19),{
  at:new Date().toISOString(),action:'edit',before
 }];
 mark.updated_at=new Date().toISOString();
 snapshot();annotationsInView[i]=mark;
 if(!storeStrokes()){annotationsInView[i]=previous;paint();return false}
 paint();window.dispatchEvent(new CustomEvent('bm-pdf-mark-changed',{detail:{id,action:'edit',page:pageNo}}));
 return true;
}
function removeTextHighlight(id){
 if(!pdf||painting||exportBusy)return false;
 const i=annotationsInView.findIndex(m=>m?.type==='text_highlight'&&m.id===id);
 if(i<0)return false;
 snapshot();const [old]=annotationsInView.splice(i,1);
 if(!storeStrokes()){annotationsInView.splice(i,0,old);paint();return false}paint();window.dispatchEvent(new CustomEvent('bm-pdf-mark-changed',{detail:{id,action:'remove',page:pageNo}}));return true;
}

window.BancoMestrePDFV042={
 get editing(){return !!pdf},
 getCurrentPdfPage(){return pdf?pdf.getPage(pageNo):Promise.resolve(null)},
 selectTextMode(){if(!pdf)return false;markTool('select');return true},
 addTextHighlight,addTextHighlights,updateTextHighlight,removeTextHighlight,
 get currentTool(){return tool},
 extractHighlights:bm059ExtractHighlights,
 get straightHighlightPending(){return !!pendingMarkerStart},
 get canUndo(){return !!pdf&&(undo.get(key())||[]).length>0},
 get canRedo(){return !!pdf&&(redo.get(key())||[]).length>0},
 goToPage,
 undoLast(){if(!pdf)return false;historyEdit('undo');return true},
 redoLast(){if(!pdf)return false;historyEdit('redo');return true},
 buildAnnotated,
 get currentId(){return selected?.id||null},
 get currentDoc(){return selected?{...selected}:null},
 get sourceHash(){return info?.hash||null},
 get currentPage(){return pageNo},
 get totalPages(){return pdf?.numPages||0},
 get currentMarks(){return annotationsInView.map(x=>({...x}))}
};
})();
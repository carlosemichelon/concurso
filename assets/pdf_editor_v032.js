
(function(){
'use strict';
const DB='banco-mestre-pdf-guia-v1', STORE_DOC='documents', STORE_MARK='annotations';
const $=id=>document.getElementById(id);
const editor=document.createElement('dialog');editor.id='bmPdfEditor';editor.setAttribute('aria-label','Editor de PDFs do Banco Mestre');
editor.innerHTML='<div class="pe-head"><strong id="peTitle">PDF-guia de estudo</strong><div><button id="peImport">Importar PDF original</button> <button id="peExport">Baixar PDF anotado</button> <button id="peClose">Fechar</button></div></div>'+
'<div class="pe-toolbar">'+
'<button id="pePrev" title="Página anterior">◀</button><span id="pePages">0 / 0</span><button id="peNext" title="Próxima página">▶</button>'+
'<button id="peZoomOut" title="Reduzir">−</button><span id="peZoomLabel">110%</span><button id="peZoomIn" title="Ampliar">+</button>'+
'<button data-pe-tool="highlight" class="active">Grifar</button><button data-pe-tool="pen">Caneta</button><button data-pe-tool="rect">Quadro</button><button data-pe-tool="text">Nota</button><button data-pe-tool="card">Vincular CARD</button><button data-pe-tool="erase">Borracha</button>'+
'<label>Cor <input type="color" id="peColor" value="#ffce00"></label><label>Espessura <input type="range" id="peWidth" min="2" max="30" value="12"></label>'+
'<button id="peUndo">Desfazer</button><button id="peRedo">Refazer</button><button id="peClear">Limpar página</button>'+
'<input id="peFile" type="file" accept=".pdf,application/pdf" hidden></div>'+
'<div id="peStatus" class="pe-status" role="status">Abra um PDF original para marcar e salvar suas anotações.</div>'+
'<div id="peStage" class="pe-stage"><div id="pePage" class="pe-page"><canvas id="peBase"></canvas><canvas id="peInk"></canvas></div></div>';
document.body.append(editor);
const state={id:null,title:null,bytes:null,doc:null,marks:{},page:1,zoom:1.1,tool:'highlight',color:'#ffce00',width:12,pointer:null,undo:[],redo:[],busy:false,renderSerial:0};
let database;
const db=()=>database||(database=new Promise((resolve,reject)=>{
 if(!('indexedDB' in window)){reject(Error('IndexedDB indisponível neste navegador'));return;}
 const req=indexedDB.open(DB,1);
 req.onupgradeneeded=()=>{const d=req.result;for(const name of [STORE_DOC,STORE_MARK])if(!d.objectStoreNames.contains(name))d.createObjectStore(name)};
 req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error);
}));
async function store(name,key,val){
 const d=await db();return new Promise((resolve,reject)=>{
 const tx=d.transaction(name,'readwrite');tx.objectStore(name).put(val,key);
 tx.oncomplete=()=>resolve();tx.onerror=()=>reject(tx.error||Error('Falha ao salvar anotações'));
 });
}
async function fetchStored(name,key){
 const d=await db();return new Promise((resolve,reject)=>{
 const tx=d.transaction(name,'readonly'),q=tx.objectStore(name).get(key);
 q.onsuccess=()=>resolve(q.result);q.onerror=()=>reject(q.error);
 });
}
const message=(s)=>{$('peStatus').textContent=s};
const hex=s=>{const a=s.replace('#','');return {r:parseInt(a.slice(0,2),16)/255,g:parseInt(a.slice(2,4),16)/255,b:parseInt(a.slice(4,6),16)/255}};
function clone(x){return JSON.parse(JSON.stringify(x))}
function pageMarks(){return state.marks[String(state.page)]||(state.marks[String(state.page)]=[])}
function saveSnapshot(){state.undo.push(clone(state.marks));if(state.undo.length>50)state.undo.shift();state.redo=[]}
async function persist(){if(!state.id)return;try{await store(STORE_MARK,state.id,state.marks);message('Marcações salvas neste navegador. Exporte o PDF anotado para conservar uma cópia independente.')}catch(e){message('Não foi possível salvar localmente: '+e.message)}}
function setTools(){for(const b of editor.querySelectorAll('[data-pe-tool]'))b.classList.toggle('active',b.dataset.peTool===state.tool)}
function dimensions(){return {w:$('peInk').clientWidth,h:$('peInk').clientHeight}}
function drawStroke(ctx,m,w,h){
 ctx.save();ctx.strokeStyle=m.color||'#ffce00';ctx.fillStyle=m.color||'#ffce00';ctx.lineWidth=Math.max(1,(m.widthNorm||.01)*w);ctx.lineCap='round';ctx.lineJoin='round';if(m.type==='highlight')ctx.globalAlpha=.34;
 if(m.type==='pen'||m.type==='highlight'){const pts=m.points||[];if(pts.length){ctx.beginPath();ctx.moveTo(pts[0].x*w,pts[0].y*h);for(const p of pts.slice(1))ctx.lineTo(p.x*w,p.y*h);if(pts.length===1)ctx.lineTo(pts[0].x*w+.1,pts[0].y*h+.1);ctx.stroke()}}
 else if(m.type==='rect'){ctx.strokeRect(Math.min(m.start.x,m.end.x)*w,Math.min(m.start.y,m.end.y)*h,Math.abs(m.start.x-m.end.x)*w,Math.abs(m.start.y-m.end.y)*h)}
 else if(m.type==='text'||m.type==='card'){ctx.globalAlpha=1;ctx.font='bold '+Math.max(10,(m.fontNorm||.018)*w)+'px system-ui,Arial,sans-serif';ctx.fillText(m.text||'',m.start.x*w,m.start.y*h)}
 ctx.restore();
}
function drawMarks(){const ink=$('peInk'),ctx=ink.getContext('2d');if(!ink.width)return;const w=ink.clientWidth,h=ink.clientHeight;const ratio=ink.width/w;ctx.setTransform(ratio,0,0,ratio,0,0);ctx.clearRect(0,0,w,h);for(const m of pageMarks())drawStroke(ctx,m,w,h);if(state.pointer?.mark)drawStroke(ctx,state.pointer.mark,w,h)}
async function render(){
 if(!state.doc)return;
 const serial=++state.renderSerial;
 try{
  const page=await state.doc.getPage(state.page),v=page.getViewport({scale:state.zoom}),ratio=Math.max(1,window.devicePixelRatio||1);
  const canvas=$('peBase'),ink=$('peInk'),width=Math.round(v.width),height=Math.round(v.height);
  for(const cv of [canvas,ink]){cv.style.width=width+'px';cv.style.height=height+'px';cv.width=Math.round(width*ratio);cv.height=Math.round(height*ratio)}
  $('pePage').style.width=width+'px';$('pePage').style.height=height+'px';
  await page.render({canvasContext:canvas.getContext('2d'),viewport:v,transform:ratio===1?null:[ratio,0,0,ratio,0,0]}).promise;
  if(serial!==state.renderSerial)return;
  $('pePages').textContent=state.page+' / '+state.doc.numPages;
  $('peZoomLabel').textContent=Math.round(state.zoom*100)+'%';
  drawMarks();
 }catch(e){message('Falha ao exibir a página: '+e.message)}
}
async function useBytes(bytes){
 if(!window.pdfjsLib)throw Error('Leitor PDF.js não carregou. Verifique o acesso à internet.');
 const data=bytes instanceof ArrayBuffer?bytes:bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength);
 state.bytes=data.slice(0);
 state.doc=await pdfjsLib.getDocument({data:new Uint8Array(data.slice(0))}).promise;
 state.page=1;state.undo=[];state.redo=[];
 await render();
}
async function open(catalog){
 state.id=catalog?.id||('local:'+Date.now());
 state.title=catalog?.title||'PDF importado';
 state.marks={};state.page=1;state.bytes=null;state.doc=null;state.undo=[];state.redo=[];state.pointer=null;
 $('peTitle').textContent=state.title;editor.showModal();message('Verificando cópia já guardada no navegador...');
 try{
  const saved=await fetchStored(STORE_DOC,state.id);
  if(saved?.bytes){state.title=saved.title||state.title;$('peTitle').textContent=state.title;state.marks=await fetchStored(STORE_MARK,state.id)||{};await useBytes(saved.bytes);message('PDF-guia e marcações anteriores restaurados deste navegador.')}
  else{message('Primeira abertura: clique em “Importar PDF original”. O arquivo ficará guardado neste navegador para próximas leituras.');$('peFile').click()}
 }catch(e){message('Não foi possível restaurar PDF: '+e.message+'; você pode importar o original.')}
}
$('peImport').onclick=()=>$('peFile').click();
$('peFile').onchange=async e=>{
 const file=e.target.files?.[0];e.target.value='';if(!file)return;
 if(!/pdf/i.test(file.type)&&!file.name.toLowerCase().endsWith('.pdf')){message('Selecione um arquivo .pdf');return}
 if(state.doc&&!confirm('Substituir a cópia original deste guia? As marcações existentes serão preservadas e aplicadas ao novo arquivo. Só confirme se as páginas corresponderem.'))return;
 try{
  message('Importando PDF original...');
  const bytes=await file.arrayBuffer();
  await useBytes(bytes);
  await store(STORE_DOC,state.id,{title:state.title||file.name,filename:file.name,bytes,updated:new Date().toISOString()});
  await persist();message('PDF aberto. Faça anotações: elas serão recuperadas ao reabrir este guia neste navegador.');
 }catch(err){message('Erro ao importar: '+err.message)}
};
function point(e){const r=$('peInk').getBoundingClientRect();return {x:Math.max(0,Math.min(1,(e.clientX-r.left)/r.width)),y:Math.max(0,Math.min(1,(e.clientY-r.top)/r.height))}}
function distanceMark(m,p){
 let pts=m.points||[m.start,m.end].filter(Boolean);if(!pts.length)return Infinity;
 return Math.min(...pts.map(t=>Math.hypot(t.x-p.x,t.y-p.y)));
}
$('peInk').addEventListener('pointerdown',e=>{
 if(!state.doc||e.button!==0)return;
 const p=point(e),current=pageMarks();
 if(state.tool==='erase'){
  const hits=current.map((m,i)=>({i,d:distanceMark(m,p)})).sort((a,b)=>a.d-b.d);
  if(hits[0]&&hits[0].d<.035){saveSnapshot();current.splice(hits[0].i,1);drawMarks();persist()}
  return;
 }
 if(state.tool==='text'||state.tool==='card'){
  const value=prompt(state.tool==='card'?'ID do cartão (ex.: CARD-1280):':'Texto da anotação:');
  if(!value?.trim())return;
  const text=state.tool==='card'?value.trim().toUpperCase():value.trim();
  saveSnapshot();current.push({type:state.tool,start:p,text,color:state.color,fontNorm:Math.max(.013,state.width/600)});
  drawMarks();persist();return;
 }
 const mark={type:state.tool,color:state.color,widthNorm:Math.max(.002,state.width/$('peInk').clientWidth)};
 if(state.tool==='rect'){mark.start=p;mark.end=p}else mark.points=[p];
 saveSnapshot();state.pointer={id:e.pointerId,mark};$('peInk').setPointerCapture(e.pointerId);drawMarks();e.preventDefault();
});
$('peInk').addEventListener('pointermove',e=>{
 if(!state.pointer||state.pointer.id!==e.pointerId)return;
 const p=point(e),m=state.pointer.mark;
 if(m.type==='rect')m.end=p;else m.points.push(p);
 drawMarks();e.preventDefault();
});
async function finish(e){
 if(!state.pointer||state.pointer.id!==e.pointerId)return;
 const m=state.pointer.mark;state.pointer=null;pageMarks().push(m);drawMarks();await persist();
}
$('peInk').addEventListener('pointerup',finish);$('peInk').addEventListener('pointercancel',finish);
for(const b of editor.querySelectorAll('[data-pe-tool]'))b.onclick=()=>{state.tool=b.dataset.peTool;setTools()};
$('peColor').oninput=e=>{state.color=e.target.value};
$('peWidth').oninput=e=>{state.width=Number(e.target.value)};
$('pePrev').onclick=async()=>{if(state.doc&&state.page>1){state.page--;await render()}};
$('peNext').onclick=async()=>{if(state.doc&&state.page<state.doc.numPages){state.page++;await render()}};
$('peZoomOut').onclick=async()=>{if(state.doc){state.zoom=Math.max(.5,state.zoom-.2);await render()}};
$('peZoomIn').onclick=async()=>{if(state.doc){state.zoom=Math.min(3,state.zoom+.2);await render()}};
$('peUndo').onclick=async()=>{if(!state.undo.length)return;state.redo.push(clone(state.marks));state.marks=state.undo.pop();drawMarks();await persist()};
$('peRedo').onclick=async()=>{if(!state.redo.length)return;state.undo.push(clone(state.marks));state.marks=state.redo.pop();drawMarks();await persist()};
$('peClear').onclick=async()=>{if(!pageMarks().length||!confirm('Limpar todas as marcações DESTA página?'))return;saveSnapshot();state.marks[String(state.page)]=[];drawMarks();await persist()};
$('peClose').onclick=()=>editor.close();
editor.addEventListener('close',()=>{state.pointer=null});
function pdfColor(c){const a=hex(c||'#ffce00');return PDFLib.rgb(a.r,a.g,a.b)}
function drawToPDF(page,m,font){
 const w=page.getWidth(),h=page.getHeight(),color=pdfColor(m.color),thick=Math.max(.5,(m.widthNorm||.01)*w);
 if(m.type==='highlight'||m.type==='pen'){
  const points=m.points||[];for(let i=1;i<points.length;i++){
   const a=points[i-1],b=points[i];page.drawLine({start:{x:a.x*w,y:(1-a.y)*h},end:{x:b.x*w,y:(1-b.y)*h},color,thickness:thick,opacity:m.type==='highlight'?.30:1});
  }
 }else if(m.type==='rect'){
  const left=Math.min(m.start.x,m.end.x)*w,right=Math.max(m.start.x,m.end.x)*w,top=Math.min(m.start.y,m.end.y)*h,bottom=Math.max(m.start.y,m.end.y)*h;
  page.drawRectangle({x:left,y:(1-bottom/h)*h,width:right-left,height:bottom-top,borderColor:color,borderWidth:thick});
 }else if(m.type==='text'||m.type==='card'){
  const raw=String(m.text||'').replace(/[\u2013\u2014]/g,'-').replace(/\u2022/g,'-');
  let safe=raw;try{font.encodeText(safe)}catch(e){safe=raw.replace(/[^\u0020-\u00ff]/g,'?')}
  page.drawText(safe,{x:m.start.x*w,y:(1-m.start.y)*h,color,font,size:Math.max(7,(m.fontNorm||.018)*w)});
 }
}
$('peExport').onclick=async()=>{
 if(!state.bytes){message('Importe primeiro um PDF.');return}
 if(!window.PDFLib){message('Biblioteca de exportação PDF não carregou. Verifique a conexão.');return}
 if(state.busy)return;state.busy=true;$('peExport').disabled=true;
 try{
  message('Aplicando as marcações ao PDF original, sem modificar o arquivo original armazenado...');
  const doc=await PDFLib.PDFDocument.load(state.bytes.slice(0),{updateMetadata:false});
  const font=await doc.embedFont(PDFLib.StandardFonts.Helvetica);
  const pages=doc.getPages();
  for(const [key,marks] of Object.entries(state.marks)){
   const i=Number(key)-1;if(i<0||i>=pages.length)continue;
   for(const mark of marks)drawToPDF(pages[i],mark,font);
  }
  const result=await doc.save({useObjectStreams:true});
  const url=URL.createObjectURL(new Blob([result],{type:'application/pdf'}));
  const a=document.createElement('a');a.href=url;a.download=(state.title||'PDF-guia').replace(/[^a-z0-9À-ÿ._-]+/gi,'_')+'_ANOTADO.pdf';document.body.append(a);a.click();a.remove();
  setTimeout(()=>URL.revokeObjectURL(url),120000);
  message('PDF ANOTADO baixado. Original e marcações editáveis permanecem guardados neste navegador.');
 }catch(e){message('Falha ao exportar: '+e.message)}finally{state.busy=false;$('peExport').disabled=false}
};
window.BancoMestrePDF={open,openLocal:()=>open({id:'meu-pdf-guia',title:'Meu PDF-guia de estudo'}),version:'V032'};
})();
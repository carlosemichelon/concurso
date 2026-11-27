/* V315: primeiros dois modulos de imagens, mesma ordem */

;
/* 0 assets/visibilidade-v026.js */
(function(root){
'use strict';
// Compatível com as exclusões de imagens das versões anteriores.
// Não oferece upload, importação, substituição ou publicação de arquivos.
const DB='BancoMestreImagensV023',STORE='items',VALID=/^IMG-\d{3}$/;
let dbPromise=null;
function db(){
 if(dbPromise)return dbPromise;
 dbPromise=new Promise((ok,fail)=>{
  const r=indexedDB.open(DB,1);
  r.onupgradeneeded=()=>{const d=r.result;if(!d.objectStoreNames.contains(STORE))d.createObjectStore(STORE,{keyPath:'id'})};
  r.onsuccess=()=>ok(r.result);r.onerror=()=>fail(r.error||Error('Armazenamento indisponível'));
 });
 return dbPromise;
}
async function transaction(mode,operate){
 const d=await db();return new Promise((resolve,reject)=>{
  const t=d.transaction(STORE,mode),s=t.objectStore(STORE),r=operate(s);
  let value;
  r.onsuccess=()=>value=r.result;
  r.onerror=()=>reject(r.error||Error('Falha de leitura'));
  t.oncomplete=()=>resolve(value);
  t.onerror=()=>reject(t.error||Error('Falha ao salvar exclusão'));
 });
}
async function all(){return transaction('readonly',s=>s.getAll())}
async function setStatus(id,status){
 if(!VALID.test(id)||!['visible','hidden'].includes(status))throw Error('Operação inválida');
 const old=await transaction('readonly',s=>s.get(id))||{id};
 const next={...old,id,status,updatedAt:new Date().toISOString()};
 await transaction('readwrite',s=>s.put(next));
 try{localStorage.setItem('BM_IMAGENS_V023_CHANGE',String(Date.now()))}catch(_){}
 root.dispatchEvent(new Event('bm-imagens-atualizadas'));
 return next;
}
root.BancoMestreImagens={all,setStatus};
})(window);


;
/* 1 assets/editor_imagens_v053.js */
/* V030 — editor de imagens de estudo; nenhuma alteração nos originais. */
(function(root){
'use strict';
const $=id=>document.getElementById(id);
const dialog=$('imageDialog'),stage=$('imageStage'),base=$('base'),canvas=$('grifo');
const ctx=canvas.getContext('2d'),baseCtx=base.getContext('2d');
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const validNum=x=>Number.isFinite(x)&&typeof x==='number';
const MAX_UNDO=50,MAX_STROKES=2000;
let imageId=null,sourceW=1,sourceH=1,scale=1,tool='pan',color='#ffd400',size=16;
let strokes=[],undo=[],redo=[],selected=new Set(),selBox=null,working=null,onExclude=null;
let fingers=new Map(),pinch=null;
const clone=x=>JSON.parse(JSON.stringify(x));
let row=null,busy=false,failed=false,opening=false,epoch=0;
 function note(msg){$('imgMessage').textContent=msg}
 function ready(){return !!row&&!busy&&!failed&&dialog.open}
 function save(){
  if(!ready()){if(row)strokes=clone(row.marks);draw();return}
  const snapshot=clone(strokes),ticket=epoch,input={event_id:crypto.randomUUID(),hash:row.hash,previous:row.revision,marks:snapshot};
  busy=true;note('Gravando marcações privadas…');
  void root.BMVS41PrivateImageInk.save(imageId,input).then(next=>{
   if(ticket!==epoch)return;
   if(next.revision!==input.event_id||next.hash!==input.hash)throw Error('Confirmação divergente');
   row=next;note('Marcações privadas gravadas e conferidas no Drive.');
  }).catch(e=>{if(ticket===epoch){failed=true;strokes=clone(row.marks);selected.clear();undo=[];redo=[];note('Gravação não confirmada: '+e.message+'. Reabra a imagem.')}})
  .finally(()=>{if(ticket===epoch){busy=false;draw()}});
 }
 
function checkpoint(){undo.push(JSON.stringify(strokes));if(undo.length>MAX_UNDO)undo.shift();redo.length=0}
function applyHistory(direction){
 if(!ready())return;
 let source=direction==='undo'?undo:redo,target=direction==='undo'?redo:undo;
 if(!source.length)return;
 target.push(JSON.stringify(strokes));strokes=JSON.parse(source.pop());selected.clear();draw();save();
}
function imgPoint(e){let r=canvas.getBoundingClientRect();return [
  clamp((e.clientX-r.left)/r.width,0,1),clamp((e.clientY-r.top)/r.height,0,1),
  e.pointerType==='pen'?clamp(e.pressure||.6,.15,1):.65];}
function boxOf(m){
 if(m.type==='rect'){const a=m.box;return [Math.min(a[0],a[2]),Math.min(a[1],a[3]),Math.max(a[0],a[2]),Math.max(a[1],a[3])];}
 let b=[1,1,0,0];for(let p of m.points){b[0]=Math.min(b[0],p[0]);b[1]=Math.min(b[1],p[1]);b[2]=Math.max(b[2],p[0]);b[3]=Math.max(b[3],p[1]);}return b;
}
function renderStroke(m){
 ctx.save();ctx.globalAlpha=m.type==='pen'?1:.35;
 ctx.strokeStyle=m.color||'#ffd400';ctx.fillStyle=m.color||'#ffd400';ctx.lineJoin='round';ctx.lineCap='round';
 if(m.type==='rect'){
  let q=boxOf(m);ctx.fillRect(q[0]*sourceW,q[1]*sourceH,Math.max(2,(q[2]-q[0])*sourceW),Math.max(8,(q[3]-q[1])*sourceH));ctx.restore();return;
 }
 const points=m.points,thickness=Math.max(1,Math.min(sourceW,sourceH)*(m.size||3)/1000*(m.type==='highlighter'?1.7:1));
 if(points.length===1){ctx.beginPath();ctx.arc(points[0][0]*sourceW,points[0][1]*sourceH,thickness/2,0,Math.PI*2);ctx.fill();}
 else for(let i=1;i<points.length;i++){
  const a=points[i-1],b=points[i];ctx.lineWidth=thickness*(.55+.3*((a[2]||.65)+(b[2]||.65)));
  ctx.beginPath();ctx.moveTo(a[0]*sourceW,a[1]*sourceH);ctx.lineTo(b[0]*sourceW,b[1]*sourceH);ctx.stroke();
 }
 ctx.restore();
}
function draw(){
 ctx.clearRect(0,0,sourceW,sourceH);
 strokes.forEach(renderStroke);
 if(working?.type==='stroke')renderStroke(working.stroke);
 ctx.save();ctx.strokeStyle='#14718d';ctx.lineWidth=Math.max(2,Math.min(sourceW,sourceH)/600);ctx.setLineDash([8,6]);
 selected.forEach(i=>{if(!strokes[i])return;let b=boxOf(strokes[i]),d=9;ctx.strokeRect(b[0]*sourceW-d,b[1]*sourceH-d,(b[2]-b[0])*sourceW+2*d,(b[3]-b[1])*sourceH+2*d)});
 if(selBox)ctx.strokeRect(selBox[0]*sourceW,selBox[1]*sourceH,(selBox[2]-selBox[0])*sourceW,(selBox[3]-selBox[1])*sourceH);
 ctx.restore();
 $('undo').disabled=busy||failed||!undo.length;$('redo').disabled=busy||failed||!redo.length;$('deleteSelected').disabled=busy||failed||!selected.size;
 $('selectedCount').textContent=selected.size?`${selected.size} selecionado(s)`:'';
}
function distanceToSegment(px,py,ax,ay,bx,by){let dx=bx-ax,dy=by-ay,n=dx*dx+dy*dy,t=n?clamp(((px-ax)*dx+(py-ay)*dy)/n,0,1):0;return Math.hypot(px-ax-t*dx,py-ay-t*dy)}
function findStroke(p){
 let x=p[0]*sourceW,y=p[1]*sourceH,tol=Math.max(7,12/scale);
 for(let i=strokes.length-1;i>=0;i--){let m=strokes[i],b=boxOf(m);if(x<b[0]*sourceW-tol||x>b[2]*sourceW+tol||y<b[1]*sourceH-tol||y>b[3]*sourceH+tol)continue;
  if(m.type==='rect')return i;
  let pts=m.points,t=tol+Math.min(sourceW,sourceH)*(m.size||3)/2000;
  if(pts.length===1&&Math.hypot(x-pts[0][0]*sourceW,y-pts[0][1]*sourceH)<=t)return i;
  for(let j=1;j<pts.length;j++)if(distanceToSegment(x,y,pts[j-1][0]*sourceW,pts[j-1][1]*sourceH,pts[j][0]*sourceW,pts[j][1]*sourceH)<=t)return i;
 }return -1;
}
function translate(m,dx,dy){if(m.type==='rect'){m.box=m.box.map((v,i)=>clamp(v+(i%2?dy:dx),0,1))}else for(const p of m.points){p[0]=clamp(p[0]+dx,0,1);p[1]=clamp(p[1]+dy,0,1)}}
let panX=0,panY=0;
const panFrame=()=>base.parentElement;
function applyPan(x,y){panX=x;panY=y;panFrame().style.transform='translate('+x+'px,'+y+'px)'}
function resetPan(){applyPan(0,0)}
function panStart(e){return {type:'pan',x:e.clientX,y:e.clientY,px:panX,py:panY,rect:panFrame().getBoundingClientRect()}}
function panMove(e){const w=working,r=stage.getBoundingClientRect(),dx=e.clientX-w.x,dy=e.clientY-w.y,minX=r.left+24-w.rect.right,maxX=r.right-24-w.rect.left,minY=r.top+24-w.rect.bottom,maxY=r.bottom-24-w.rect.top;applyPan(w.px+clamp(dx,minX,maxX),w.py+clamp(dy,minY,maxY))}
function setTool(next){tool=next;working=null;selBox=null;stage.classList.toggle('bm426-pan',next==='pan');
 document.querySelectorAll('#imageDialog [data-ink-tool]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.inkTool===tool)));
 canvas.dataset.tool=tool;draw();}
function setColor(c){if(!/^#[a-fA-F0-9]{6}$/.test(c))return;color=c.toLowerCase();$('inkColor').value=color;
 document.querySelectorAll('#imageDialog [data-ink-color]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.inkColor.toLowerCase()===color)));
 if(['eraser','pan','select'].includes(tool))setTool('pen');}
function zoomTo(next,at){
 if(!imageId)return;let old=scale,ax=at?.[0]??stage.clientWidth/2,ay=at?.[1]??stage.clientHeight/2;
 let px=(stage.scrollLeft+ax)/old,py=(stage.scrollTop+ay)/old;
 scale=clamp(next,.05,12);
 let width=Math.round(sourceW*scale),height=Math.round(sourceH*scale),frame=base.parentElement;
 frame.style.width=width+'px';frame.style.height=height+'px';
 for(let c of [base,canvas]){c.style.width=width+'px';c.style.height=height+'px';}
 $('zoomPct').textContent=Math.round(scale*100)+'%';
 stage.scrollLeft=Math.max(0,px*scale-ax);stage.scrollTop=Math.max(0,py*scale-ay);
}
function fit(){resetPan();const w=Math.max(1,stage.clientWidth-16),h=Math.max(1,stage.clientHeight-16);zoomTo(Math.min(w/sourceW,h/sourceH));stage.scrollLeft=0;stage.scrollTop=0;}
function fitWidth(){resetPan();zoomTo(clamp((stage.clientWidth-24)/sourceW,.2,3));stage.scrollLeft=0;stage.scrollTop=0;}
function erase(p){let i=findStroke(p);if(i<0)return;
 if(!working?.changed){checkpoint();working={type:'eraser',changed:true}}
 strokes.splice(i,1);selected.clear();draw();}
function deleteSelected(){if(!ready()||!selected.size)return;if(!confirm('Apagar as marcações selecionadas? Você poderá desfazer no histórico do editor.'))return;checkpoint();strokes=strokes.filter((m,i)=>!selected.has(i));selected.clear();draw();save();}
function onDown(e){
 if(!imageId||!ready()||e.button>1)return;
 if(e.pointerType==='touch'){
  fingers.set(e.pointerId,{x:e.clientX,y:e.clientY});
  if(fingers.size===2){let a=[...fingers.values()];pinch={distance:Math.max(1,Math.hypot(a[0].x-a[1].x,a[0].y-a[1].y)),zoom:scale};working=null;selBox=null;draw();canvas.setPointerCapture(e.pointerId);return}
 }
 if(pinch)return;
 const p=imgPoint(e);
 if(e.button===1||(e.shiftKey&&e.pointerType==='mouse')){e.preventDefault();working=panStart(e);canvas.setPointerCapture(e.pointerId);return;}
 if(tool==='pen'||tool==='highlighter'){
  if(strokes.length>=MAX_STROKES){note('Limite de marcações atingido. Apague alguns traços para continuar.');return;}
  working={type:'stroke',stroke:{type:tool,color,size,points:[p]}};
 }else if(tool==='eraser'){if(!confirm('Excluir marcação(ões) nesta passada da borracha? Você poderá desfazer pelo histórico.'))return;working={type:'eraser',changed:false};erase(p)}
 else if(tool==='select'){
  const hit=findStroke(p);
  if(hit>=0){if(!selected.has(hit))selected=new Set([hit]);working={type:'move',last:p,changed:false}}
  else{selected.clear();selBox=[p[0],p[1],p[0],p[1]];working={type:'box'};}
 }else if(tool==='pan'){working=panStart(e)}
 canvas.setPointerCapture(e.pointerId);draw();
}
function onMove(e){
 if(e.pointerType==='touch'&&fingers.has(e.pointerId)){
  fingers.set(e.pointerId,{x:e.clientX,y:e.clientY});
  if(pinch&&fingers.size>=2){let a=[...fingers.values()],dist=Math.hypot(a[0].x-a[1].x,a[0].y-a[1].y),r=stage.getBoundingClientRect();
   zoomTo(pinch.zoom*dist/pinch.distance,[(a[0].x+a[1].x)/2-r.left,(a[0].y+a[1].y)/2-r.top]);return}
 }
 if(!working||pinch)return;
 const p=imgPoint(e);
 if(working.type==='stroke'){const pts=working.stroke.points,last=pts[pts.length-1];if(Math.hypot((p[0]-last[0])*sourceW,(p[1]-last[1])*sourceH)>1.2){pts.push(p);draw()}}
 else if(working.type==='eraser')erase(p);
 else if(working.type==='box'){selBox[2]=p[0];selBox[3]=p[1];draw()}
 else if(working.type==='pan'){panMove(e)}
 else if(working.type==='move'){
  let dx=p[0]-working.last[0],dy=p[1]-working.last[1];if(Math.hypot(dx*sourceW,dy*sourceH)>1){if(!working.changed){checkpoint();working.changed=true}
   selected.forEach(i=>strokes[i]&&translate(strokes[i],dx,dy));working.last=p;draw()}
 }
}
function onUp(e){
 if(e.pointerType==='touch')fingers.delete(e.pointerId);
 if(pinch){if(fingers.size<2)pinch=null;working=null;return}
 if(!working)return;
 if(working.type==='stroke'){checkpoint();strokes.push(working.stroke);save()}
 else if((working.type==='move'||working.type==='eraser')&&working.changed)save();
 else if(working.type==='box'&&selBox){let b=[Math.min(selBox[0],selBox[2]),Math.min(selBox[1],selBox[3]),Math.max(selBox[0],selBox[2]),Math.max(selBox[1],selBox[3])];
  selected=new Set(strokes.map((m,i)=>{let q=boxOf(m);return !(q[2]<b[0]||q[0]>b[2]||q[3]<b[1]||q[1]>b[3])?i:-1}).filter(i=>i>=0));}
 working=null;selBox=null;draw();
}
async function open({image,imageId:targetId,title,quality,sourceUrl,warning,onExclude:doExclude,driveFile}){
 if(!image||!image.naturalWidth)throw Error('Imagem original indisponível');
 imageId=targetId;onExclude=doExclude;working=null;selected.clear();undo=[];redo=[];selBox=null;fingers.clear();pinch=null;
 let cap=Math.min(1,6400/Math.max(image.naturalWidth,image.naturalHeight),Math.sqrt(22000000/(image.naturalWidth*image.naturalHeight)));
 sourceW=Math.max(1,Math.round(image.naturalWidth*cap));sourceH=Math.max(1,Math.round(image.naturalHeight*cap));
 base.width=canvas.width=sourceW;base.height=canvas.height=sourceH;
 baseCtx.clearRect(0,0,sourceW,sourceH);baseCtx.drawImage(image,0,0,sourceW,sourceH);
 strokes=clone(row.marks);$('imgTitle').textContent=imageId+' — '+title;
 $('imagePixels').textContent=`${image.naturalWidth} × ${image.naturalHeight} px · ${quality}`;
 $('originalDriveLink').hidden=!sourceUrl;if(sourceUrl)$('originalDriveLink').href=sourceUrl;
 $('imageWarning').textContent=warning||'Originais preservados. Grifos salvos apenas neste navegador.';
 setColor('#ffd400');setTool('pan');draw();dialog.showModal();
 /* Flags administrativos não são usados neste editor. */
 const remove=$('hideOpened');remove.textContent=driveFile?'Excluir imagem':'Ocultar localmente';remove.disabled=!driveFile&&!onExclude;remove.dataset.bmArchiveAction=String(Boolean(driveFile));remove.setAttribute('data-bm096-icon',driveFile?'trash':'eye');remove.title=driveFile?'Mover imagem para Excluídas no Drive':'Ocultar localmente';remove.onclick=driveFile?()=>root.BM421PdfArchive?.requestImage(driveFile,remove):async()=>{if(!imageId||!onExclude)return;if(!confirm('Ocultar esta imagem da visualização? O original e os grifos serão preservados.'))return;try{await onExclude(imageId);dialog.close()}catch(e){note('Erro ao ocultar: '+e.message)}};
 requestAnimationFrame(()=>requestAnimationFrame(()=>{if(!dialog.open||imageId!==targetId)return;fit();draw();canvas.focus({preventScroll:true})}));
}
function close(){epoch++;row=null;busy=false;failed=false;strokes=[];ctx.clearRect(0,0,sourceW,sourceH);baseCtx.clearRect(0,0,sourceW,sourceH);resetPan();stagePointer=null;stage.classList.remove('bm426-dragging');imageId=null;working=null;onExclude=null;selected.clear();undo=[];redo=[];pinch=null;fingers.clear()}
for(const b of document.querySelectorAll('#imageDialog [data-ink-tool]'))b.onclick=()=>setTool(b.dataset.inkTool);
for(const b of document.querySelectorAll('#imageDialog [data-ink-color]'))b.onclick=()=>setColor(b.dataset.inkColor);
$('inkColor').oninput=e=>setColor(e.target.value);
$('inkWidth').oninput=e=>{size=clamp(Number(e.target.value),1,40);$('widthValue').textContent=size+' px'};
$('zoomOutImage').onclick=()=>zoomTo(scale/1.3);$('zoomInImage').onclick=()=>zoomTo(scale*1.3);
$('zoomFitImage').onclick=fit;$('zoomWidthImage').onclick=fitWidth;$('zoomActualImage').onclick=()=>{resetPan();zoomTo(1)};
$('undo').onclick=()=>applyHistory('undo');$('redo').onclick=()=>applyHistory('redo');
$('deleteSelected').onclick=deleteSelected;$('imgClose').onclick=()=>{if(busy){note('Aguarde a confirmação das marcações.');return}dialog.close()};
$('hideOpened').onclick=async()=>{if(!imageId||!onExclude)return;if(!confirm('Ocultar esta imagem da visualização? O original e os grifos serão preservados.'))return;try{await onExclude(imageId);dialog.close()}catch(e){note('Erro ao ocultar: '+e.message)}};
dialog.addEventListener('close',close);dialog.addEventListener('cancel',e=>{if(busy)e.preventDefault()});
canvas.addEventListener('pointerdown',onDown);canvas.addEventListener('pointermove',onMove);
// Drag from the empty stage as well as the image. Never intercept pen/selection.
let stagePointer=null;
stage.addEventListener('pointerdown',e=>{if(!imageId||tool!=='pan'||e.target===canvas||e.button!==0)return;e.preventDefault();working=panStart(e);stagePointer=e.pointerId;stage.setPointerCapture(e.pointerId);stage.classList.add('bm426-dragging')});
stage.addEventListener('pointermove',e=>{if(stagePointer===e.pointerId&&working?.type==='pan')panMove(e)});
for(const type of ['pointerup','pointercancel','lostpointercapture'])stage.addEventListener(type,e=>{if(stagePointer===e.pointerId){stagePointer=null;working=null;stage.classList.remove('bm426-dragging')}});
canvas.addEventListener('pointerup',onUp);canvas.addEventListener('pointercancel',e=>{fingers.delete(e.pointerId);onUp(e)});
stage.addEventListener('wheel',e=>{if(!dialog.open||!e.ctrlKey)return;e.preventDefault();let r=stage.getBoundingClientRect();zoomTo(scale*(e.deltaY<0?1.17:1/1.17),[e.clientX-r.left,e.clientY-r.top])},{passive:false});
document.addEventListener('keydown',e=>{if(!dialog.open||e.target?.closest?.('input,textarea,select,[contenteditable=true]'))return;
 if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='z'){e.preventDefault();applyHistory(e.shiftKey?'redo':'undo')}
 if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='y'){e.preventDefault();applyHistory('redo')}
 if(e.key==='Delete'&&selected.size){e.preventDefault();deleteSelected()}
});
root.BancoMestreEditorV030={open:async()=>{throw Error('Abra a imagem pela biblioteca autenticada')}};
 root.BMVS41PrivateImageEditor=Object.freeze({
  async open(file){
   if(opening||busy||dialog.open)throw Error('Editor ocupado');opening=true;
   try{
    if(!file||!Array.isArray(file.card_ids))throw Error('Imagem sem vínculo');
    const blob=await root.BMVS41PrivateMedia.read(file.card_ids[0]||'biblioteca',file.id);
    if(!/^image\/(png|jpeg|webp|gif|svg\+xml)$/.test(blob.type))throw Error('Formato inválido');
    const src=URL.createObjectURL(blob);
    try{
     const image=new Image();image.src=src;
     const [hash,next]=await Promise.all([
      blob.arrayBuffer().then(bytes=>crypto.subtle.digest('SHA-256',bytes)).then(digest=>[...new Uint8Array(digest)].map(x=>x.toString(16).padStart(2,'0')).join('')),
      root.BMVS41PrivateImageInk.get(file.id),
      image.decode()
     ]);
     if(next.hash!==hash||!root.BMVS41Session.available())throw Error('Versão ou sessão alterada');
     row=next;failed=false;epoch++;await open({image,imageId:file.id,title:file.title,quality:'Original privado conferido',warning:'Marcações salvas na conta autenticada. Original preservado.'});note('Marcações privadas carregadas.');
    }finally{URL.revokeObjectURL(src)}
   }finally{opening=false}
  },
  get busy(){return busy},get confirmed(){return ready()},get marks(){return clone(strokes)}
 });
 
})(window);


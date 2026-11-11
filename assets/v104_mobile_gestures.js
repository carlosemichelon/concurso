/* V104 — pinch-to-zoom do PDF, Desfazer sempre acessível no telefone.
 * Reusa o motor setZoomAt/undoLast; não cria versões paralelas de grifos.
 */
(function(){
'use strict';
if(window.BancoMestrePdfGesturesV104)return;
const $=id=>document.getElementById(id);
const dialog=$('pdfDialog'),pane=$('pdfLocalMode'),wrap=$('pdfPageWrap'),
 floating=$('bmV056FloatingControls'),api=window.BancoMestrePDFV042;
if(!dialog||!pane||!wrap||!floating||!api)return;
const touchOnly=window.matchMedia('(pointer:coarse)');
let pinch=null,zooming=false;
const distance=(a,b)=>Math.hypot(a.clientX-b.clientX,a.clientY-b.clientY);
const midpoint=(a,b)=>({x:(a.clientX+b.clientX)/2,y:(a.clientY+b.clientY)/2});
const undo=document.createElement('button');
undo.id='bm104FloatingUndo';undo.type='button';
undo.textContent='↶';
undo.setAttribute('aria-label','Desfazer último grifo ou anotação nesta página');
undo.title='Desfazer última alteração desta página';
undo.setAttribute('aria-controls','pdfInkCanvas');
const marker=$('bm103CurrentPage');
if(marker&&marker.parentNode===floating)floating.insertBefore(undo,marker);
else floating.prepend(undo);
function updateUndo(){
 const visible=dialog.open&&api.editing&&touchOnly.matches;
 undo.hidden=!visible;
 undo.disabled=!visible||!api.canUndo||zooming;
 undo.setAttribute('aria-disabled',String(undo.disabled));
}
undo.addEventListener('click',()=>{
 if(!api.editing||!api.canUndo||zooming)return;
 api.undoLast();
 updateUndo();
});
function clearPreview(){
 wrap.style.transform='';
 wrap.style.transformOrigin='';
 wrap.classList.remove('bm104-pinching');
}
function begin(e){
 if(!dialog.open||!api.editing||!touchOnly.matches||e.touches.length!==2||zooming)return;
 const [a,b]=e.touches;
 const sep=distance(a,b);
 if(sep<22)return;
 if(!api.beginPinch?.())return;
 window.BancoMestrePreciseSelectV094?.cancelPending?.();
 const center=midpoint(a,b),rect=wrap.getBoundingClientRect();
 const px=Math.max(0,Math.min(100,100*(center.x-rect.left)/Math.max(1,rect.width)));
 const py=Math.max(0,Math.min(100,100*(center.y-rect.top)/Math.max(1,rect.height)));
 pinch={sep,base:api.zoomLevel||1,center,ratio:1};
 wrap.style.transformOrigin=px+'% '+py+'%';
 wrap.classList.add('bm104-pinching');
 e.preventDefault();
}
function move(e){
 if(!pinch)return;
 if(e.touches.length<2)return;
 const [a,b]=e.touches,sep=distance(a,b);
 if(sep<1)return;
 const ratio=Math.min(3/Math.max(.55,pinch.base),Math.max(.55/pinch.base,sep/pinch.sep));
 pinch.ratio=ratio;
 pinch.center=midpoint(a,b);
 wrap.style.transform='scale('+ratio.toFixed(3)+')';
 if(e.cancelable)e.preventDefault();
}
async function end(e){
 if(!pinch||e.touches.length>=2)return;
 const details=pinch;pinch=null;
 clearPreview();
 if(e.cancelable)e.preventDefault();
 zooming=true;updateUndo();
 try{
  if(Math.abs(details.ratio-1)>.025)
   await api.setZoomAt?.(details.base*details.ratio,details.center);
 }catch(err){
  const message=$('pdfLocalStatus');if(message)message.textContent='Não foi possível aplicar zoom: '+err.message;
 }finally{
  api.endPinch?.();zooming=false;updateUndo();
 }
}
pane.addEventListener('touchstart',begin,{passive:false,capture:true});
pane.addEventListener('touchmove',move,{passive:false,capture:true});
pane.addEventListener('touchend',end,{passive:false,capture:true});
pane.addEventListener('touchcancel',end,{passive:false,capture:true});
dialog.addEventListener('close',()=>{
 pinch=null;clearPreview();api.endPinch?.();updateUndo();
});
for(const name of ['bm-pdf-active-page-rendered','bm-pdf-mark-changed','bm-pdf-tool-change','bm-pdf-zoom-changed']){
 window.addEventListener(name,updateUndo);
}
touchOnly.addEventListener?.('change',updateUndo);
updateUndo();
window.BancoMestrePdfGesturesV104=Object.freeze({
 get zooming(){return zooming||!!pinch},
 get undoVisible(){return !undo.hidden},
 updateUndo
});
})();
/* V316 — ampliar imagem original do cartão sem alterar fonte ou dados. */
(function(){
'use strict';
if(window.BM316ImageZoom)return;
let dialog=null,photo=null,title=null;
function setup(){
 if(dialog)return;
 const style=document.createElement('style');
 style.textContent='#bm316-image-viewer{border:1px solid #aebfc5;border-radius:10px;max-width:98vw;max-height:98dvh;width:min(1250px,98vw);height:min(940px,98dvh);padding:0;background:#101923;color:#fff;box-shadow:0 20px 100px #0008}#bm316-image-viewer::backdrop{background:#08151ee6}#bm316-image-viewer .bm316-viewer-bar{display:flex;gap:8px;align-items:center;justify-content:space-between;padding:9px 14px;background:#172b35}#bm316-image-viewer .bm316-viewer-bar strong{font-size:12px;font-weight:650;overflow-wrap:anywhere}#bm316-image-viewer .bm316-viewer-bar button{border:1px solid #94b7c1;border-radius:8px;background:#f7ffff;color:#214953;padding:7px 11px;cursor:pointer}#bm316-image-viewer img{display:block;width:100%;height:calc(100% - 49px);object-fit:contain;padding:12px;box-sizing:border-box}#bmCardPeekV050 img.bm306-preview,#cardRows img.bm306-preview{cursor:zoom-in}#bmCardPeekV050 img.bm306-preview:focus-visible,#cardRows img.bm306-preview:focus-visible{outline:3px solid #1b7f96}';
 document.head.append(style);
 dialog=document.createElement('dialog');dialog.id='bm316-image-viewer';
 dialog.setAttribute('aria-label','Imagem do cartão ampliada');
 const bar=document.createElement('div');bar.className='bm316-viewer-bar';
 title=document.createElement('strong');title.textContent='Imagem original';
 const close=document.createElement('button');close.textContent='Fechar imagem';close.type='button';close.onclick=()=>dialog.close();
 bar.append(title,close);
 photo=document.createElement('img');photo.alt='Imagem original ampliada';
 dialog.append(bar,photo);document.body.append(dialog);
 dialog.addEventListener('click',e=>{if(e.target===dialog)dialog.close()});
 dialog.addEventListener('close',()=>{photo.removeAttribute('src')});
}
function openImage(img){
 if(!img||img.hidden||!img.src||!img.complete||img.naturalWidth<1)return false;
 setup();photo.src=img.currentSrc||img.src;photo.alt=img.alt||'Imagem do cartão ampliada';
 title.textContent=img.alt||'Imagem original';
 if(!dialog.open)dialog.showModal();
 return true;
}
document.addEventListener('click',e=>{
 const img=e.target.closest?.('#bmCardPeekV050 img.bm306-preview,#cardRows img.bm306-preview,#bmCardPeekV050 img.bm211-image');
 if(img){e.preventDefault();openImage(img)}
});
document.addEventListener('keydown',e=>{
 if(e.key!=='Enter'&&e.key!==' ')return;
 const img=e.target.closest?.('#bmCardPeekV050 img.bm306-preview,#cardRows img.bm306-preview');
 if(img&&openImage(img))e.preventDefault();
});
document.addEventListener('focusin',e=>{
 const img=e.target.matches?.('#bmCardPeekV050 img.bm306-preview,#cardRows img.bm306-preview')?e.target:null;
 if(img)img.setAttribute('aria-label',(img.alt||'Imagem')+' — pressione Enter para ampliar');
});
const observer=new MutationObserver(records=>{
 for(const r of records)for(const n of r.addedNodes){
  if(n.nodeType!==1)continue;
  const imgs=n.matches?.('img.bm306-preview')?[n]:[...n.querySelectorAll?.('img.bm306-preview')||[]];
  for(const img of imgs){img.tabIndex=0;img.setAttribute('role','button');img.title='Clique para ampliar em tela cheia'}
 }
});
function boot(){observer.observe(document.body,{childList:true,subtree:true});}
window.BM316ImageZoom=Object.freeze({open:openImage});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
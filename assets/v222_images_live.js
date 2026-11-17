/* V221 — Biblioteca de imagens sempre visível, sem recarga de página.
 * Mantém o Drive como única fonte visual e preserva grifos, IDs e buscas existentes. */
(function(){
'use strict';
if(window.BM221ImagesLive)return;
const $=id=>document.getElementById(id);
let mounted=false,refreshStarted=0,pending=false,observer=null,loginWasSeen=false;
function sourceReady(){return Boolean(window.BancoMestreDriveImagesV182?.connected);}
function node(){
 const root=$('imagens')?.querySelector('.panel'),rows=$('imageRows');
 if(!root||!rows)return null;
 let vp=$('bm221DriveViewport');
 if(!vp){
  vp=document.createElement('div');vp.id='bm221DriveViewport';
  vp.setAttribute('aria-label','Imagens originais do Google Drive');
  const anchor=$('bm153Directory')||$('bm209SyncBar')||root.querySelector('.controls');
  if(anchor&&anchor.parentElement===root)anchor.after(vp);
  else root.append(vp);
 }
 if(rows.parentElement!==vp)vp.append(rows);
 rows.hidden=false;vp.hidden=false;
 // O renderizador de grupos legado pode tornar a grade invisível. Esta fonte é única.
 rows.style.setProperty('display','grid','important');
 return {root,rows,vp};
}
function sync(){
 const place=node();if(!place)return false;
 const {rows,vp}=place,source=$('bm084-grid');
 if(source&&source.children.length){
  const fresh=[...source.children].filter(x=>x.tagName==='ARTICLE');
  if(fresh.length){
   for(const old of rows.querySelectorAll(':scope > article.bm209ImageFromDrive'))old.remove();
   for(const card of fresh){
    card.classList.add('card','bm209ImageFromDrive');
    card.dataset.bm209ImageOrigin='drive';
    rows.append(card);
   }
  }
 }
 const known=[...rows.querySelectorAll(':scope > article.bm209ImageFromDrive')];
 for(const other of rows.querySelectorAll(':scope > article:not(.bm209ImageFromDrive)'))other.hidden=true;
 vp.dataset.bm221Count=String(known.length);
 const status=$('bm221ImageVisible');
 if(status){
  if(!sourceReady())status.textContent='Conecte o Google Drive para visualizar os originais.';
  else if(known.length)status.textContent=known.length+' imagens exibidas nesta página · atualizadas sem recarregar o site.';
  else status.textContent='Drive conectado. A consulta de imagens está sendo concluída ou não há resultados para os filtros.';
 }
 return known.length>0;
}
function queue(){
 if(pending)return;
 pending=true;requestAnimationFrame(()=>{pending=false;sync();});
}
function css(){
 if($('bm221-images-style'))return;
 const style=document.createElement('style');style.id='bm221-images-style';
 style.textContent=[
 '#imagens #bm221DriveViewport{display:block!important;visibility:visible!important;min-height:60px;margin:10px 0 18px}',
 '#imagens #bm221DriveViewport[hidden]{display:block!important}',
 '#imagens #bm221DriveViewport #imageRows{display:grid!important;visibility:visible!important;grid-template-columns:repeat(auto-fill,minmax(min(100%,230px),1fr));gap:10px}',
 '#imagens #bm221DriveViewport #imageRows[hidden]{display:grid!important}',
 '#imagens #bm221DriveViewport article.bm209ImageFromDrive{display:block!important;visibility:visible!important;min-width:0}',
 '#imagens #bm221ImageVisible{font-size:12px;color:#516a6d;padding:5px 0}'
 ].join('\n');
 document.head.append(style);
}
function refresh(reason){
 if(!sourceReady())return false;
 const now=Date.now();
 if(now-refreshStarted<25000)return false;
 refreshStarted=now;
 const provider=window.BancoMestreDriveImagesV182;
 if(!provider?.refresh)return false;
 Promise.resolve(provider.refresh()).then(()=>queue()).catch(err=>{
  const state=$('bm221ImageVisible');
  if(state)state.textContent='Atualização do Drive indisponível: '+String(err?.message||err);
 });
 return true;
}
function initialise(){
 if(mounted)return;
 const root=$('imagens')?.querySelector('.panel');
 if(!root||!$('imageRows'))return;
 mounted=true;css();
 const info=document.createElement('p');info.id='bm221ImageVisible';info.setAttribute('role','status');
 const anchor=$('bm153Directory')||$('bm209SyncBar')||root.querySelector('.controls');
 if(anchor?.parentElement===root)anchor.after(info);else root.append(info);
 sync();
 const source=$('bm084-grid');
 if(source&&!observer){
  observer=new MutationObserver(queue);
  observer.observe(source,{childList:true});
 }
 document.addEventListener('bm209-drive-render',queue);
 document.addEventListener('bm218-image-filter-change',queue);
 document.addEventListener('bm-media-drive-authorized',()=>{
  loginWasSeen=true;queue();
  // O sincronizador Drive já recebe este evento. Não iniciar outra varredura concorrente.
 });
 document.addEventListener('visibilitychange',()=>{
  if(!document.hidden){queue();refresh('visible');}
 });
 window.addEventListener('focus',()=>{queue();refresh('focus');});
 window.addEventListener('online',()=>{queue();refresh('online');});
 document.querySelector('nav button[data-page="imagens"]')?.addEventListener('click',()=>{
  queue();refresh('images-tab');
 });
 const viewport=$('bm221DriveViewport');
 if(viewport)new MutationObserver(queue).observe(viewport,{childList:true});
 if(sourceReady()){loginWasSeen=true;queue();}
}
document.readyState==='loading'
 ?document.addEventListener('DOMContentLoaded',initialise,{once:true})
 :initialise();
window.BM221ImagesLive=Object.freeze({refresh,render:queue,get ready(){return mounted},get loginSeen(){return loginWasSeen}});
})();
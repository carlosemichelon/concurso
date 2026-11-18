/* Banco Mestre V261 — continuidade de imagens no Atlas do Drive.
 * Reposiciona o botão já existente de paginação para junto da galeria visível;
 * não muda filtros, contagem, autenticação, originais, cartões nem grifos.
 */
(function(){
'use strict';
if(window.BM261ImagePaging)return;
const $=id=>document.getElementById(id);
let installed=false,listenersReady=false,shown=0,matching=0,lastEvent=false;
const format=n=>Number(n).toLocaleString('pt-BR');
function driveReady(){
 const s=window.BancoMestreDriveImagesV182;
 return Boolean(s?.connected&&s?.lastSuccess);
}
function mount(){
 const section=$('imagens'),grid=$('imageRows'),driveMore=$('bm084-more');
 if(!section||!grid||!driveMore)return false;
 let viewport=$('bm221DriveViewport');
 if(!viewport){
  const parent=grid.parentElement;
  if(!parent||parent.closest('#bm153Results:not(.bm153Browsing)'))return false;
  viewport=parent;
 }
 let button=$('bm209More');
 if(!button){
  button=document.createElement('button');button.id='bm209More';button.type='button';
  button.textContent='Mostrar mais imagens';
  button.onclick=()=>{if(driveReady()&&!driveMore.hidden&&!driveMore.disabled)driveMore.click()};
 }
 // O módulo V209 deixava esse botão no #bm153Results, que continua oculto
 // pelo diretório V153 mesmo após a grade ser transferida ao viewport V221.
 if(button.parentElement!==viewport)viewport.append(button);
 let progress=$('bm261ImageProgress');
 if(!progress){
  progress=document.createElement('p');progress.id='bm261ImageProgress';
  progress.setAttribute('role','status');progress.setAttribute('aria-live','polite');
  progress.style.cssText='text-align:center;font-size:12px;color:#4e6d70;margin:5px 0 9px';
 }
 if(progress.parentElement!==viewport)viewport.insertBefore(progress,button);
 let style=$('bm261ImagePagingStyle');
 if(!style){
  style=document.createElement('style');style.id='bm261ImagePagingStyle';
  style.textContent=[
   '#imagens #bm221DriveViewport #bm209More{display:block!important;position:relative!important;min-height:44px;max-width:100%;padding:9px 16px;margin:9px auto 15px!important;font-size:12px!important;border-radius:8px;visibility:visible!important}',
   '#imagens #bm221DriveViewport #bm209More[hidden]{display:none!important}',
   '#imagens #bm221DriveViewport #bm261ImageProgress{display:block!important;max-width:100%;overflow-wrap:anywhere}',
   '#imagens #bm221DriveViewport{overflow:visible}',
   '@media(max-width:600px){#imagens #bm221DriveViewport #bm209More{width:min(100%,320px);min-height:44px}}'
  ].join('\n');
  document.head.append(style);
 }
 installed=true;
 return true;
}
function update(){
 if(!mount())return false;
 const button=$('bm209More'),native=$('bm084-more'),progress=$('bm261ImageProgress');
 if(!button||!native||!progress)return false;
 const ready=driveReady();
 const canMore=ready&&!native.hidden&&!native.disabled;
 button.hidden=!canMore;
 button.disabled=!canMore;
 if(lastEvent&&ready){
  button.textContent='Mostrar mais 24 imagens ('+format(shown)+' de '+format(matching)+')';
  progress.textContent=matching
   ?'Exibindo '+format(shown)+' de '+format(matching)+' imagens para os filtros atuais.'
   :'Nenhuma imagem corresponde aos filtros atuais.';
  if(shown>=matching)button.hidden=true;
 }else{
  button.textContent='Mostrar mais imagens';
  progress.textContent=ready?'Atualizando imagens filtradas…':'Conecte o Drive para consultar as imagens originais.';
 }
 return true;
}
function receive(ev){
 const d=ev?.detail||{};
 if(Number.isSafeInteger(d.shown)&&Number.isSafeInteger(d.matching)&&d.shown>=0&&d.matching>=0){
  shown=d.shown;matching=d.matching;lastEvent=true;
 }
 update();
}
function init(){
 if(listenersReady)return;
 // O V221 monta o viewport em DOMContentLoaded; este módulo é carregado por último.
 if(!mount())return;
 listenersReady=true;
 const native=$('bm084-more');
 if(native)new MutationObserver(update).observe(native,{attributes:true,attributeFilter:['hidden','disabled']});
 document.addEventListener('bm-media-drive-authorized',update);
 document.addEventListener('bm218-image-filter-change',()=>{lastEvent=false;update()});
 document.addEventListener('bm153-drive-filter-change',()=>{lastEvent=false;update()});
 window.addEventListener('hashchange',()=>{if(location.hash==='#imagens')update()});
 update();
}
document.addEventListener('bm209-drive-render',receive);
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
else init();
window.BM261ImagePaging=Object.freeze({refresh:update,get attached(){return installed},get shown(){return shown},get matching(){return matching}});
})();
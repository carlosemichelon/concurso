/* V293: mesmos elementos e listeners da biblioteca; botão legado PDF apenas removido da UI. */
(function(){'use strict';
if(window.BM293CompactLayout)return;
const $=id=>document.getElementById(id);
let imageReady=false;
function removeOldPdfButton(){
 const root=$('pdfs');if(!root)return false;
 let removed=false;
 for(const btn of root.querySelectorAll('#bm151-pdf-check button,#bm210PdfToolbar button')){
  const name=(btn.textContent||'')+' '+(btn.title||'');
  if(/Verificar\s*(?:78\s*)?PDFs/i.test(name)){btn.remove();removed=true}
 }
 return removed;
}
function reorder(){
 const bar=document.querySelector('#imagens #bm209SyncBar.bm210ImageToolbar');
 const search=$('imageSearch'),filters=$('bm155ImageFilters');
 const ids=['bm155DisciplinaImagem','bm155AssuntoGeralImagem','bm155AssuntoEspecificoImagem','bm155SubassuntoImagem'];
 const fields=ids.map(id=>$(id)?.closest('label'));
 if(!bar||!search||!filters||fields.some(x=>!x))return false;
 const prevSearch=$('bm293ImageSearchRow'),prevActions=$('bm293ImageActions');
 if(bar.dataset.bm293Reordered==='yes'&&prevSearch?.contains(search)&&
    filters.parentElement===bar&&fields.every(x=>x.parentElement===filters)){
  imageReady=true;return true;
 }
 const searchRow=prevSearch||document.createElement('div');
 searchRow.id='bm293ImageSearchRow';
 const actions=prevActions||document.createElement('div');
 actions.id='bm293ImageActions';
 const details=$('bm210ImageInfo'),extra=details?.querySelector('.bm210StatusBody');
 searchRow.append(search);
 for(const field of fields)filters.append(field);
 for(const node of [...bar.children]){
  if(node===searchRow||node===filters||node===actions||node===details)continue;
  if(node===search||fields.includes(node))continue;
  const label=((node.textContent||'')+' '+(node.getAttribute('aria-label')||'')).toLowerCase();
  const secondary=node.tagName==='SELECT'||(node.tagName==='LABEL'&&
    !!node.querySelector('select')&&!/tipo|mostrar|classificar/.test(label));
  if(secondary&&extra)extra.append(node);
  else actions.append(node);
 }
 bar.prepend(searchRow);searchRow.after(filters);filters.after(actions);
 if(details)actions.after(details);
 const foot=filters.querySelector('.bm155Foot');
 if(foot&&!foot.querySelector('button,input,select')&&!foot.textContent.trim())foot.hidden=true;
 bar.dataset.bm293Reordered='yes';imageReady=true;return true;
}
function init(){
 removeOldPdfButton();
 if(reorder())return;
 let attempts=0;
 const retry=()=>{
  removeOldPdfButton();
  if(reorder()||++attempts>=20)return;
  setTimeout(retry,250);
 };
 setTimeout(retry,250);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
else init();
document.querySelector('header nav button[data-page="imagens"]')?.addEventListener('click',()=>setTimeout(reorder,0));
window.BM293CompactLayout=Object.freeze({reorder,removeOldPdfButton,get imageReady(){return imageReady}});
})();
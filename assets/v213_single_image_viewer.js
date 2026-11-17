/* Banco Mestre V213 — visualizador V1 com prioridade nos originais autenticados do Drive.
 * Reutiliza cartões publicos do motor historico e cartões Drive autenticados.
 * Nao altera arquivos, IDs, grifos, checkpoints, SRS ou classificacoes.
 */
(function(){
'use strict';
if(window.BM209SingleImageViewer)return;
const $=id=>document.getElementById(id);
const PREF_KEY='BM213_IMAGE_SOURCE_V1';
let sourcePreference='drive';
try{if(localStorage.getItem(PREF_KEY)==='catalog')sourcePreference='catalog';}catch(_){}
let privateCards=[],rowsObserver=null,mounted=false,scheduled=false;
function driveReady(){
 const p=window.BancoMestreDriveImagesV182;
 return Boolean(p?.connected&&p?.lastSuccess);
}
function useDrive(){return sourcePreference==='drive'&&driveReady();}
function applySource(){
 const area=$('imagens');if(!area)return;
 const direct=useDrive();
 area.dataset.bm213Source=direct?'drive':'catalog';
 const toggle=$('bm213SourceToggle');
 if(toggle){
  toggle.textContent=sourcePreference==='drive'?'Ver catálogo salvo':'Priorizar Drive';
  toggle.setAttribute('aria-pressed',String(sourcePreference==='drive'));
 }
 const info=$('bm213SourceInfo');
 if(info)info.textContent=direct?'Fonte: Drive autorizado · imagens originais':
  sourcePreference==='drive'?'Exibindo catálogo salvo até conectar o Drive':'Fonte: catálogo salvo';
 updateMore();
 document.dispatchEvent(new Event('bm213-source-change'));
}
function queueReconcile(){
 if(scheduled)return;
 scheduled=true;
 queueMicrotask(()=>{scheduled=false;reconcile()});
}
function reconcile(){
 const rows=$('imageRows');
 if(!rows)return;
 if(privateCards.length){
  for(const node of [...rows.children]){
   if(node.tagName==='P'&&/Nenhuma imagem corresponde aos filtros/i.test(node.textContent||''))node.remove();
  }
 }
 for(const card of privateCards){
  if(!card.isConnected||card.parentElement!==rows)rows.append(card);
 }
 applySource();
}
function updateMore(){
 const btn=$('bm209More'),old=$('moreImages'),drive=$('bm084-more');
 if(!btn)return;
 const publicMore=Boolean(!useDrive()&&old&&!old.disabled);
 const driveMore=Boolean(useDrive()&&drive&&!drive.hidden);
 btn.hidden=!(publicMore||driveMore);
 btn.disabled=!publicMore&&!driveMore;
 btn.title=(publicMore&&driveMore?'Carrega mais imagens da biblioteca e da sincronização':
  publicMore?'Carrega mais imagens publicadas':'Carrega mais imagens da fonte sincronizada');
}
function receiveDrive(event){
 const grid=$('bm084-grid');
 if(!grid)return;
 const children=[...grid.children].filter(x=>x.tagName==='ARTICLE');
 // O evento também é enviado com busca sem resultado: limpar cartões antigos.
 for(const card of privateCards)card.remove();
 privateCards=children;
 for(const card of privateCards){
  card.classList.add('card','bm209ImageFromDrive');
  card.dataset.bm209ImageOrigin='drive';
  card.setAttribute('aria-label','Imagem: '+String(card.querySelector('h4')?.textContent||'arquivo sincronizado'));
  const heading=card.querySelector('h4');
  if(heading){heading.style.fontSize='13px';heading.style.margin='6px 0';}
  const preview=card.querySelector('img');
  if(preview){preview.setAttribute('role','button');preview.tabIndex=0;
   preview.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();preview.click();}});
  }
 }
 reconcile();
}
function observeMainGrid(){
 const rows=$('imageRows');
 if(!rows||rowsObserver)return;
 rowsObserver=new MutationObserver(records=>{
  if(records.some(record=>[...record.addedNodes,...record.removedNodes].some(node=>
    !(node.nodeType===1&&node.classList?.contains('bm209ImageFromDrive')))))queueReconcile();
 });
 rowsObserver.observe(rows,{childList:true,subtree:false});
}
function css(){
 const style=document.createElement('style');style.id='bm209SingleImageViewerStyle';
 style.textContent=[
 '#imagens #bm084-sync{display:none!important}',
 '#imagens[data-bm213-source="drive"] #imageRows>article:not(.bm209ImageFromDrive){display:none!important}',
 '#imagens[data-bm213-source="catalog"] #imageRows>article.bm209ImageFromDrive{display:none!important}',
 '#imagens #bm153Directory .bm153Heading,#imagens #bm153AreaNav,#imagens .bm153Toolbar,#imagens #bm153GroupListing{display:none!important}',
 '#imagens .bm153Directory{background:transparent;border:0;padding:0;margin:8px 0}',
 '#imagens #bm153Results{display:block!important}',
 '#imagens #imageRows{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(100%,240px),1fr));gap:10px;align-items:start}',
 '#imagens #imageRows>article{margin:0;min-width:0;box-sizing:border-box}',
 '#imagens #imageRows>article.bm209ImageFromDrive{overflow:hidden;border-radius:10px;box-shadow:none}',
 '#imagens #imageRows>article.bm209ImageFromDrive img{height:150px!important;max-height:150px;object-fit:contain}',
 '#imagens #imageRows>article.bm209ImageFromDrive .bm202-image-actions{margin-top:8px}',
 '#imagens #bm209SyncBar{display:flex;align-items:center;gap:7px;flex-wrap:wrap;padding:7px 0;margin:3px 0 8px;border-bottom:1px solid #dce8e4}',
 '#imagens #bm209SyncBar button{font-size:12px;padding:6px 10px;min-height:30px}',
 '#imagens #bm209SyncBar #bm205-drive-count{font-size:11px;color:#4c716b}',
 '#imagens #bm209SyncBar #bm207-sync-time{margin:0!important;font-size:11px!important}',
 '#imagens #bm209SyncBar #bm084-status{margin:0!important;min-width:0;max-width:340px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:11px!important}',
 '#imagens #bm209More{display:block;margin:10px auto;font-size:12px;min-height:36px}',
 '#imagens #bm209More[hidden]{display:none!important}',
 '#imagens #moreImages{display:none!important}',
 '@media(max-width:680px){#imagens #imageRows{grid-template-columns:repeat(auto-fill,minmax(min(100%,165px),1fr));gap:8px}#imagens #bm209SyncBar{gap:6px}}'
 ].join('\n');
 document.head.append(style);
}
function init(){
 if(mounted)return;
 const host=$('imagens')?.querySelector('.panel'),privatePanel=$('bm084-sync');
 const connect=$('bm084-connect'),refresh=$('bm084-refresh');
 const legacyMore=$('moreImages'),rows=$('imageRows');
 if(!host||!privatePanel||!connect||!refresh||!legacyMore||!rows)return;
 mounted=true;css();
 const title=host.querySelector('h2');if(title)title.textContent='Biblioteca de imagens';
 const intro=host.querySelector('p.intro');if(intro)intro.textContent=
  'Uma única biblioteca para consultar, classificar, relacionar a cartões e grifar imagens. A fonte privada é consultada após sua autorização.';
 const bar=document.createElement('div');bar.id='bm209SyncBar';
 connect.textContent='Conectar imagens';
 refresh.textContent='Atualizar Drive';
 const toggle=document.createElement('button');toggle.type='button';toggle.id='bm213SourceToggle';
 toggle.setAttribute('aria-label','Alternar entre imagens do Drive e catálogo salvo');
 toggle.addEventListener('click',()=>{
  sourcePreference=sourcePreference==='drive'?'catalog':'drive';
  try{localStorage.setItem(PREF_KEY,sourcePreference);}catch(_){}
  applySource();
 });
 const sourceInfo=document.createElement('small');sourceInfo.id='bm213SourceInfo';
 sourceInfo.style.cssText='color:#527076;font-size:11px';
 bar.append(connect,refresh,toggle,sourceInfo);
 for(const id of ['bm205-drive-count','bm207-sync-time','bm084-status']){
  const node=$(id);if(node)bar.append(node);
 }
 const oldControls=host.querySelector('.controls');
 if(oldControls)oldControls.after(bar);else host.prepend(bar);
 privatePanel.hidden=true;
 privatePanel.style.display='none';
 const more=document.createElement('button');more.type='button';more.id='bm209More';
 more.textContent='Mostrar mais imagens';
 more.onclick=()=>{
  const sourceMore=$('moreImages'),driveMore=$('bm084-more');
  if(useDrive()){if(driveMore&&!driveMore.hidden)driveMore.click();}
  else if(sourceMore&&!sourceMore.disabled)sourceMore.click();
  queueReconcile();
 };
 const results=$('bm153Results')||rows.parentElement;
 results?.append(more);
 observeMainGrid();
 document.addEventListener('bm209-drive-render',receiveDrive);
 const search=$('imageSearch');
 search?.addEventListener('input',()=>{queueReconcile()});
 for(const id of ['imageFilter','bm197-type-filter','bm155DisciplinaImagem',
  'bm155AssuntoGeralImagem','bm155AssuntoEspecificoImagem','bm155SubassuntoImagem']){
  $(id)?.addEventListener('change',queueReconcile);
 }
 const statuses=$('bm084-status');
 if(statuses)new MutationObserver(()=>{statuses.title=statuses.textContent||''}).observe(statuses,{childList:true,characterData:true,subtree:true});
 const originalMore=legacyMore;
 new MutationObserver(updateMore).observe(originalMore,{attributes:true,attributeFilter:['disabled','hidden']});
 const other=$('bm084-more');
 if(other)new MutationObserver(updateMore).observe(other,{attributes:true,attributeFilter:['disabled','hidden']});
 applySource();
 queueReconcile();
}
window.BM209SingleImageViewer=Object.freeze({get ready(){return mounted},refresh:queueReconcile,
 get displayedPrivate(){return privateCards.length},get mode(){return 'drive_primary_with_catalog_fallback'},get selectedSource(){return useDrive()?'drive':'catalog'}});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
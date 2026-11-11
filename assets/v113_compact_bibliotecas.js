/* V113 — compactação reversível das bibliotecas, otimizada para celular.
 * Move APENAS nós de apresentação/filtros; preserva IDs, eventos, dados e SRS.
 * <details> inicia fechado em telas pequenas, e volta ao DOM original no desktop.
 */
(function(){
'use strict';
if(window.BancoMestreCompactBibliotecasV113)return;
const mq=window.matchMedia?.('(max-width:760px)');
const pdfSection=document.getElementById('pdfs');
const grifos=document.getElementById('grifos');
if(!mq||!pdfSection||!grifos)return;
const byId=id=>document.getElementById(id);
const mounts=[];
const state={mobile:false,enabled:false};
function makeFold(parent,before,id,label){
 const details=document.createElement('details');
 details.id=id;details.className='bm113-fold';
 const summary=document.createElement('summary');summary.className='bm113-summary';
 const text=document.createElement('strong');text.className='bm113-summary-title';text.textContent=label;
 summary.append(text);
 const content=document.createElement('div');content.className='bm113-fold-body';
 details.append(summary,content);
 parent.insertBefore(details,before||null);
 return {details,summary,text,content};
}
function relocate(node,container,label){
 if(!node||!node.parentNode||!container)return;
 const marker=document.createComment('bm113-original-'+label);
 node.parentNode.insertBefore(marker,node);
 mounts.push({node,marker,container});
}
function move(m,small){
 if(small){
  if(m.node.parentNode!==m.container)m.container.append(m.node);
 }else{
  if(m.marker.parentNode&&m.node.previousSibling!==m.marker)m.marker.after(m.node);
 }
}
function observeDetail(fold,controller){
 fold.details.addEventListener('toggle',()=>{
  if(mq.matches&&fold.details.open)controller?.();
 });
}
function monitorInputs(root,inputs,fold,title){
 const update=()=>{
  let count=0;
  for(const el of inputs){
   if(!el)continue;
   if(el.type==='checkbox'){if(el.checked)count++}
   else if(el.tagName==='SELECT'&&el.value&&el.value!=='all')count++;
  }
  fold.text.textContent=title+(count?' · '+count+' ativo'+(count===1?'':'s'):'');
  fold.details.classList.toggle('bm113-active',count>0);
 };
 for(const el of inputs){el?.addEventListener('change',update);el?.addEventListener('input',update)}
 update();return update;
}
// Flashcards/Imagens: instruções e ajuda técnica são acessíveis dentro dos
// filtros já recolhíveis da V109. A pesquisa e todos os resultados ficam fora.
const cardOptions=byId('bm109FiltersCards'),imageOptions=byId('bm109FiltersImages');
if(cardOptions)relocate(document.querySelector('#cartoes .panel > p.intro'),
 cardOptions,'cards-help');
if(imageOptions){
 relocate(document.querySelector('#imagens .panel > p.intro'),imageOptions,'images-help');
 relocate(document.querySelector('#imagens .bm109-image-help'),imageOptions,'images-original-help');
}
// PDFs: busca e número continuam visíveis; barra de áreas, importação,
// filtros, explicações e exclusões passam à seção expansível no celular.
const pdfPanel=pdfSection.querySelector('.panel');
const pdfControls=pdfPanel?.querySelector('.controls');
const pdfRows=byId('pdfRows');
let pdfFold=null,pdfUpdate=null;
if(pdfPanel&&pdfControls&&pdfRows){
 pdfFold=makeFold(pdfPanel,pdfRows,'bm113PdfOptions','Filtros, áreas e PDFs locais');
 const pdfInputs=['pdfFilter','pdfHidden'].map(byId);
 relocate(pdfPanel.querySelector(':scope > p.intro'),pdfFold.content,'pdf-intro');
 relocate(byId('v037LocalGuides'),pdfFold.content,'pdf-local');
 relocate(byId('pdfAreaNavV036'),pdfFold.content,'pdf-area-navigation');
 for(const el of pdfInputs)relocate(el,pdfFold.content,'pdf-filter-'+el?.id);
 pdfUpdate=monitorInputs(pdfControls,pdfInputs,pdfFold,'Filtros, áreas e PDFs locais');
 const bar=byId('pdfAreaNavV036');
 bar?.addEventListener('click',()=>queueMicrotask(pdfUpdate));
 observeDetail(pdfFold,pdfUpdate);
}
// Biblioteca de Grifos: não movimentar o resultado nem os registros.
// Busca, total e "Atualizar" ficam à vista. Drive, backup, diagnóstico e
// exportação continuam disponíveis num único painel recolhível.
const grifosPanel=grifos.querySelector('.bm062-panel');
const grifosResults=byId('bm062Results');
const grifosFilters=grifos.querySelector('.bm062-filters');
let service=null,filterFold=null,maintenance=null,updateGrifos=null;
if(grifosPanel&&grifosResults&&grifosFilters){
 const top=grifosPanel.querySelector('.bm062-top');
 service=makeFold(grifosPanel,top?.nextSibling||grifosResults,
  'bm113GrifosServices','Sincronização, backups e ferramentas');
 maintenance=makeFold(service.content,null,'bm113Maintenance',
  'Backup, exportação e diagnóstico');
 const syncBrief=document.createElement('small');
 syncBrief.id='bm113SyncBrief';syncBrief.setAttribute('aria-live','polite');
 syncBrief.textContent='Consulte o estado do arquivo mestre';
 service.summary.append(syncBrief);
 const countSlot=document.createElement('div');
 countSlot.className='bm113-grifos-count';countSlot.id='bm113GrifosCount';
 grifosFilters.after(countSlot);
 filterFold=makeFold(grifosFilters,null,'bm113GrifosFilters','Filtrar grifos');
 const filterIds=['bm062Discipline','bm062Topic','bm062Document',
  'bm062Color','bm062Kind','bm062Favs','bm108ShowRemoved'];
 const filterInputs=filterIds.map(byId).filter(Boolean);
 // Favorites and "Mostrar excluídos" are labels containing original checkboxes.
 for(const id of filterIds){
  const el=byId(id);
  if(!el)continue;
  const node=(el.type==='checkbox'?el.closest('label'):el);
  relocate(node,filterFold.content,'grifos-filter-'+id);
 }
 updateGrifos=monitorInputs(grifosFilters,filterInputs,filterFold,'Filtrar grifos');
 // Move the count before moving the export row, to retain its original
 // source position even if the entire export panel moves.
 relocate(byId('bm062Count'),countSlot,'grifos-count');
 relocate(top?.querySelector('.intro'),maintenance.content,'grifos-intro');
 relocate(byId('bm062Backup'),maintenance.content,'grifos-backup');
 relocate(grifosPanel.querySelector(':scope > .notice'),maintenance.content,'grifos-notice');
 relocate(byId('bm066DriveBackup'),maintenance.content,'grifos-legacy-backup');
 relocate(byId('bm067Audit'),maintenance.content,'grifos-diagnostics');
 relocate(grifosPanel.querySelector('.bm062-export'),maintenance.content,'grifos-export');
 relocate(byId('bm103DriveSync'),service.content,'grifos-master');
 const status=byId('bm103SyncStatus');
 const syncUpdate=()=>{
  if(!status)return;
  const info=String(status.textContent||'').replace(/\s+/g,' ').trim();
  syncBrief.textContent=info.length>105?info.slice(0,102)+'…':info||'Estado do Drive não disponível';
  const risky=status.classList.contains('bm103-sync-error')||
   status.classList.contains('bm103-sync-warning');
  service.details.classList.toggle('bm113-attention',risky);
 };
 syncUpdate();
 if(status&&typeof MutationObserver==='function')
  new MutationObserver(syncUpdate).observe(status,{childList:true,subtree:true,
   characterData:true,attributes:true,attributeFilter:['class']});
 observeDetail(filterFold,updateGrifos);
}
function adapt(){
 const small=!!mq.matches;
 if(state.enabled&&state.mobile===small)return;
 state.enabled=true;state.mobile=small;
 // Restore order matters for nested export count: child first, parent second.
 for(const m of mounts)move(m,small);
 for(const fold of [pdfFold,service,filterFold,maintenance]){
  if(!fold)continue;
  fold.details.hidden=!small;
  if(!small)fold.details.open=false;
  if(small&&!fold.details.dataset.bm113Init){
   fold.details.dataset.bm113Init='1';fold.details.open=false;
  }
 }
 pdfUpdate?.();updateGrifos?.();
}
adapt();
mq.addEventListener?.('change',adapt);
if(!mq.addEventListener)mq.addListener?.(adapt);
window.BancoMestreCompactBibliotecasV113=Object.freeze({
 refresh:adapt,get mobile(){return state.mobile},
 get foldCount(){return [pdfFold,service,filterFold,maintenance].filter(Boolean).length},
 get moved(){return mounts.length}
});
})();
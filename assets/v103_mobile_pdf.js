/* V103 — PDF: ferramentas recolhíveis no celular sem copiar os botões originais.
 * Mantém navegação, rolagem, seleção, persistência e painel de grifos.
 */
(function(){
 'use strict';
 if(window.BancoMestreMobilePdfV103)return;
 const $=id=>document.getElementById(id);
 const dialog=$('pdfDialog'),tools=$('pdfLocalTools'),
  floating=$('bmV056FloatingControls'),side=dialog?.querySelector('.bm-v046-pdf-side');
 if(!dialog||!tools||!floating||!side)return;
 const media=window.matchMedia('(max-width:760px)');
 const KEY='BM103_PDF_MOBILE_TOOLS_COLLAPSED';
 let preference=null;
 try{const stored=localStorage.getItem(KEY);if(stored==='0'||stored==='1')preference=stored==='1'}catch(_){}
 const toggle=document.createElement('button');toggle.id='bm103ToggleTools';
 toggle.type='button';toggle.setAttribute('aria-controls','pdfLocalTools');
 toggle.setAttribute('aria-label','Mostrar ou recolher ferramentas de edição');
 const page=document.createElement('span');page.id='bm103CurrentPage';
 page.setAttribute('aria-live','off');page.textContent='';
 floating.prepend(toggle,page);
 const quick=document.createElement('button');quick.id='bm103TextSelect';quick.type='button';
 quick.textContent='Grifar';quick.title='Ativar seleção de texto por primeiro e último toque';
 quick.setAttribute('aria-label','Grifar texto por primeiro e último toque');
 floating.insertBefore(quick,page);
 function shown(){return dialog.open&&!tools.hidden}
 function sync(){
  const active=shown(),collapsed=media.matches&&(preference===null?true:preference);
  dialog.classList.toggle('bm103-tools-collapsed',active&&collapsed);
  toggle.hidden=!active;quick.hidden=!active;
  page.hidden=!active;
  toggle.textContent=collapsed?'☰ Ferramentas':'✕ Recolher';
  toggle.setAttribute('aria-expanded',String(active&&!collapsed));
  toggle.title=collapsed?'Mostrar ferramentas de edição':'Recolher ferramentas para ler';
  quick.setAttribute('aria-pressed',String(window.BancoMestrePDFV042?.currentTool==='select'));
  if(active){
   const p=window.BancoMestrePDFV042?.currentPage||1;
   page.textContent='Pág. '+p;
  }
 }
 toggle.addEventListener('click',()=>{
  // A preferência representa o estado futuro (true = recolhido).
  preference=!dialog.classList.contains('bm103-tools-collapsed');
  try{localStorage.setItem(KEY,preference?'1':'0')}catch(_){}
  sync();
 });
 quick.addEventListener('click',()=>{
  const el=$('bm068SelectTool');
  if(el&&!el.disabled)el.click();
  else if($('pdfPan')&&!$('pdfPan').disabled)$('pdfPan').click();
  sync();
 });
 window.addEventListener('bm-pdf-tool-change',sync);
 window.addEventListener('bm-pdf-active-page-rendered',sync);
 new MutationObserver(sync).observe(tools,{attributes:true,attributeFilter:['hidden']});
 dialog.addEventListener('close',()=>{
  dialog.classList.remove('bm103-tools-collapsed');page.textContent='';
 });
 media.addEventListener?.('change',sync);
 sync();
 window.BancoMestreMobilePdfV103=Object.freeze({
  refresh:sync,get collapsed(){return dialog.classList.contains('bm103-tools-collapsed')}
 });
})();
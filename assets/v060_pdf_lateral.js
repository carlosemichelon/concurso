/* Banco Mestre V060 — controles PDF permanentes na lateral.
   Reutiliza a barra v043 e o campo de página v057 sem criar botões duplicados. */
(function(){
 'use strict';
 const dialog=document.getElementById('pdfDialog');
 const side=dialog?.querySelector('.bm-v046-pdf-side');
 const tools=document.getElementById('pdfLocalTools');
 const main=document.getElementById('pdfMainV043');
 const dock=document.getElementById('bmV057PdfDock');
 if(!dialog||!side||!tools||!main)return;
 if(dialog.classList.contains('bm-v060-pdf-permanent-sidebar'))return;
 dialog.classList.add('bm-v060-pdf-permanent-sidebar');
 main.setAttribute('aria-label','Ferramentas de PDF sempre disponíveis na lateral durante a edição. Role a barra para ver todos os controles.');
 if(dock&&dock.parentElement!==tools)main.after(dock);
 // Os handlers do PDF e os registros de anotação continuam nos elementos
 // originais; trocar de página não recolhe a barra.
 const sync=()=>{
  if(!dialog.open)return;
  const available=!tools.hidden;
  side.setAttribute('aria-hidden',String(!available));
  dialog.classList.toggle('bm-v060-editor-active',available);
  if(available)dialog.classList.remove('bm-v056-annotation-open');
 };
 new MutationObserver(sync).observe(tools,{attributes:true,attributeFilter:['hidden']});
 dialog.addEventListener('close',()=>{
  dialog.classList.remove('bm-v060-editor-active','bm-v056-annotation-open');
  side.setAttribute('aria-hidden','true');
 });
 sync();
 window.BancoMestrePDFLateralV060={
  get ready(){return !!main&&side.contains(main)},
  get visible(){return dialog.open&&!tools.hidden},
  get pageInputInSidebar(){return !!dock&&side.contains(dock)}
 };
})();
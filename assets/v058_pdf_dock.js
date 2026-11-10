/* Banco Mestre V057 — controle compacto fixo no leitor PDF.
   Reaproveita os IDs e funções do editor já carregado.
   Sem alterar documentos, grifos existentes, SRS ou o catálogo. */
(function(){
 'use strict';
 const $=id=>document.getElementById(id);
 const dialog=$('pdfDialog'),originalMarker=$('pdfMarker'),originalPan=$('pdfPan');
 const originalUndo=$('pdfUndo'),originalRedo=$('pdfRedo'),pager=$('pdfPager');
 const originalTools=$('pdfLocalTools'),canvas=$('pdfInkCanvas');
 if(!dialog||!originalMarker||!pager||!originalTools||$('bmV057PdfDock'))return;
 const api=()=>window.BancoMestrePDFV042;
 const dock=document.createElement('form');
 dock.id='bmV057PdfDock';dock.setAttribute('role','group');
 dock.setAttribute('aria-label','Grifos e navegação por página no PDF');
 dock.noValidate=true;
 function button(text,title){
  const b=document.createElement('button');
  b.type='button';b.textContent=text;b.title=title;
  b.setAttribute('aria-label',title);return b;
 }
 const marker=button('▤ Grifar','Grifar reto: clique no início e depois no fim da linha. Arraste para grifo livre.');
 marker.id='bmV057Marker';
 marker.setAttribute('aria-pressed','false');
 marker.dataset.bmAlwaysVisible='true';
 const hint=document.createElement('span');
 hint.id='bmV058MarkerHint';hint.hidden=true;
 hint.textContent='Clique no fim da mesma linha · Esc cancela';
 hint.setAttribute('role','status');
 const pan=button('✥','Mover e rolar o PDF');
 pan.id='bmV057Pan';pan.setAttribute('aria-pressed','false');
 const undo=button('↶','Desfazer último grifo ou anotação desta página (Ctrl+Z)');
 undo.id='bmV057Undo';
 const redo=button('↷','Refazer última alteração desfeita (Ctrl+Shift+Z ou Ctrl+Y)');
 redo.id='bmV057Redo';
 const separator=document.createElement('span');separator.className='bm-v057-separator';
 separator.setAttribute('aria-hidden','true');
 const pgLabel=document.createElement('label');pgLabel.htmlFor='bmV057PageNumber';pgLabel.textContent='Pág.';
 const page=document.createElement('input');
 page.id='bmV057PageNumber';page.type='number';page.min='1';page.step='1';
 page.inputMode='numeric';page.autocomplete='off';
 page.setAttribute('aria-label','Número da página PDF desejada');
 const total=document.createElement('span');total.id='bmV057PageTotal';
 total.textContent='/ —';total.setAttribute('aria-label','Total de páginas do PDF');
 const go=document.createElement('button');
 go.type='submit';go.id='bmV057GoPage';go.textContent='Ir';
 go.title='Abrir diretamente a página informada';
 const alert=document.createElement('span');alert.id='bmV057DockStatus';
 alert.setAttribute('role','status');alert.setAttribute('aria-live','polite');
 alert.className='bm-v057-visually-hidden';
 dock.append(marker,pan,undo,redo,separator,pgLabel,page,total,go,alert,hint);
 dialog.append(dock);
 let jumping=false;
 const edit=()=>!!api()?.editing;
 function refresh(){
  const ready=edit(),pdf=api(),pages=ready?pdf.totalPages:0;
  // O botão de grifar também abre o editor a partir da prévia do Drive.
  marker.disabled=false;
  marker.setAttribute('aria-pressed',String(ready&&pdf.currentTool==='marker'));
  hint.hidden=!(ready&&pdf.straightHighlightPending);
  marker.title=ready?(pdf.straightHighlightPending?
   'Grifo iniciado: clique no ponto final da mesma linha. Esc cancela.':
   'Sempre visível: clique início e fim para grifo reto; arraste para grifar livre.') :
   'Abra a cópia do PDF no editor para ativar o grifo.';
  pan.disabled=!ready;pan.setAttribute('aria-pressed',String(ready&&pdf.currentTool==='pan'));
  undo.disabled=!ready||!pdf.canUndo;
  redo.disabled=!ready||!pdf.canRedo;
  page.disabled=!ready||jumping;go.disabled=!ready||jumping;
  page.max=pages?String(pages):'1';
  page.placeholder=ready?'1':'—';
  if(document.activeElement!==page)page.value=ready?String(pdf.currentPage):'';
  total.textContent=ready?'/ '+pages:'/ —';
  const unavailable='Abra a cópia do PDF no editor para escolher uma página.';
  page.title=ready?'Digite um número entre 1 e '+pages:unavailable;
  go.title=ready?'Ir para a página digitada':unavailable;
 }
 function alertUser(text){alert.textContent=text;dock.title=text}
 marker.onclick=()=>{
  if(edit()){originalMarker.click();refresh();return}
  const b=$('pdfChooseLocal');
  if(b){b.click();alertUser('Abra a cópia autorizada no editor para grifar.')}
  else alertUser('Editor PDF indisponível neste documento.');
 };
 pan.onclick=()=>{if(edit()){originalPan.click();refresh()}};
 undo.onclick=()=>{if(edit()){api().undoLast();refresh()}};
 redo.onclick=()=>{if(edit()){api().redoLast();refresh()}};
 dock.addEventListener('submit',async e=>{
  e.preventDefault();
  if(!edit()||jumping)return;
  const n=Number(page.value),pages=api().totalPages;
  if(!page.value.trim()||!Number.isInteger(n)||n<1||n>pages){
   alertUser('Digite uma página válida entre 1 e '+pages+'.');
   page.focus();page.select();return;
  }
  jumping=true;refresh();
  try{
   const ok=await api().goToPage(n);
   alertUser(ok?'Página '+n+' de '+pages+'.':'Não foi possível abrir a página informada.');
   if(ok){page.blur();$('pdfLocalMode')?.focus({preventScroll:true})}
  }catch(err){alertUser('Falha ao abrir página: '+err.message)}
  finally{jumping=false;refresh()}
 });
 const watchButtons=[originalMarker,originalPan,$('pdfDraw'),$('pdfEraser')].filter(Boolean);
 for(const b of watchButtons)new MutationObserver(refresh).observe(b,{attributes:true,attributeFilter:['aria-pressed']});
 new MutationObserver(refresh).observe(originalTools,{attributes:true,attributeFilter:['hidden']});
 new MutationObserver(refresh).observe(pager,{childList:true,characterData:true,subtree:true});
 window.addEventListener('bm-pdf-marker-state',refresh);
 dialog.addEventListener('close',()=>{jumping=false;alertUser('');refresh()});
 const recheck=e=>{
  if(e.target?.closest?.('#bmV057PdfDock'))return;
  queueMicrotask(refresh);
 };
 dialog.addEventListener('click',recheck);
 canvas?.addEventListener('pointerdown',()=>queueMicrotask(refresh));
 canvas?.addEventListener('pointerup',()=>queueMicrotask(refresh));
 canvas?.addEventListener('pointercancel',()=>queueMicrotask(refresh));
 document.addEventListener('keydown',e=>{
  if(!dialog.open||!edit()||!(e.ctrlKey||e.metaKey))return;
  if(!['z','y'].includes(String(e.key).toLowerCase()))return;
  queueMicrotask(refresh);
 },false);
 refresh();
 window.BancoMestrePDFDockV057={
  get ready(){return !!$('bmV057PdfDock')},
  get page(){return api()?.currentPage||0},
  get enabled(){return edit()},
  refresh
 };
})();
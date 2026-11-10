/* V056 — tela inteira para PDF, controles compactos flutuantes.
   Não substitui o leitor: os botões originais continuam com seus handlers. */
(function(){
 'use strict';
 const dialog=document.getElementById('pdfDialog');
 const body=dialog?.querySelector(':scope > .dbody');
 const toolbar=body?.querySelector(':scope > .toolbar');
 const title=document.getElementById('docTitle');
 const oldClose=document.getElementById('pdfClose');
 const side=dialog?.querySelector('.bm-v046-pdf-side');
 const localTools=document.getElementById('pdfLocalTools');
 if(!dialog||!body||!toolbar||!oldClose)return;
 if(document.getElementById('bmV056FloatingControls'))return;

 toolbar.id='bmV056Toolbar';
 const caption=document.createElement('strong');
 caption.id='bmV056PdfCaption';caption.textContent=title?.textContent||'Documento PDF';
 toolbar.prepend(caption);
 const syncCaption=()=>{caption.textContent=title?.textContent||'Documento PDF'};
 if(title)new MutationObserver(syncCaption).observe(title,{subtree:true,characterData:true,childList:true});

 const showAnnotations=document.createElement('button');
 showAnnotations.type='button';showAnnotations.id='bmV056ShowAnnotations';
 showAnnotations.textContent='✎ Ferramentas de grifo';
 showAnnotations.title='Mostrar as ferramentas de grifo, página, zoom e salvamento';
 showAnnotations.setAttribute('aria-controls','pdfLocalTools');
 showAnnotations.setAttribute('aria-expanded','false');
 toolbar.append(showAnnotations);

 const floating=document.createElement('div');
 floating.id='bmV056FloatingControls';
 floating.setAttribute('role','toolbar');
 floating.setAttribute('aria-label','Comandos compactos do leitor PDF');
 const menuButton=document.createElement('button');
 menuButton.type='button';menuButton.id='bmV056OpenPdfMenu';
 menuButton.textContent='⋮';menuButton.title='Abrir opções do PDF';
 menuButton.setAttribute('aria-label','Abrir opções do PDF');
 menuButton.setAttribute('aria-expanded','false');
 menuButton.setAttribute('aria-controls','bmV056Toolbar');
 const closeButton=document.createElement('button');
 closeButton.type='button';closeButton.id='bmV056ClosePDF';
 closeButton.textContent='×';closeButton.title='Fechar o leitor PDF';
 closeButton.setAttribute('aria-label','Fechar o leitor PDF');
 floating.append(menuButton,closeButton);
 dialog.append(floating);

 let closeAnnotationsButton=null;
 if(side&&localTools){
  closeAnnotationsButton=document.createElement('button');
  closeAnnotationsButton.type='button';closeAnnotationsButton.id='bmV056CloseAnnotations';
  closeAnnotationsButton.textContent='× Recolher ferramentas';
  closeAnnotationsButton.title='Esconder ferramentas e ampliar novamente a área de leitura';
  side.prepend(closeAnnotationsButton);
 }
 const isEditing=()=>!!localTools&&!localTools.hidden;
 const syncTools=()=>{
  showAnnotations.hidden=!isEditing();
  if(!isEditing())hideAnnotations();
 };
 function hideMenu(){
  dialog.classList.remove('bm-v056-menu-open');
  menuButton.setAttribute('aria-expanded','false');
 }
 function hideAnnotations(){
  dialog.classList.remove('bm-v056-annotation-open');
  showAnnotations.setAttribute('aria-expanded','false');
 }
 menuButton.onclick=()=>{
  const opening=!dialog.classList.contains('bm-v056-menu-open');
  if(opening){hideAnnotations();syncCaption()}
  dialog.classList.toggle('bm-v056-menu-open',opening);
  menuButton.setAttribute('aria-expanded',String(opening));
 };
 closeButton.onclick=()=>oldClose.click();
 showAnnotations.onclick=()=>{
  if(!isEditing())return;
  const opening=!dialog.classList.contains('bm-v056-annotation-open');
  hideMenu();
  dialog.classList.toggle('bm-v056-annotation-open',opening);
  showAnnotations.setAttribute('aria-expanded',String(opening));
 };
 if(closeAnnotationsButton)closeAnnotationsButton.onclick=hideAnnotations;
 toolbar.addEventListener('click',event=>{
  if(event.target.closest('a,button')&&event.target!==showAnnotations)hideMenu();
 });
 dialog.addEventListener('pointerdown',event=>{
  const node=event.target;
  if(dialog.classList.contains('bm-v056-menu-open')&&!toolbar.contains(node)&&!floating.contains(node))hideMenu();
  if(dialog.classList.contains('bm-v056-annotation-open')&&side&&!side.contains(node)&&!floating.contains(node))hideAnnotations();
 },true);
 function reset(){
  hideMenu();hideAnnotations();syncCaption();syncTools();
 }
 dialog.addEventListener('close',reset);
 dialog.addEventListener('cancel',event=>{
  if(dialog.classList.contains('bm-v056-menu-open')||dialog.classList.contains('bm-v056-annotation-open')){
   event.preventDefault();hideMenu();hideAnnotations();
  }
 });
 if(localTools)new MutationObserver(syncTools).observe(localTools,{attributes:true,attributeFilter:['hidden']});
 new MutationObserver(()=>{
  if(dialog.open)reset();
 }).observe(dialog,{attributes:true,attributeFilter:['open']});
 reset();
 window.BancoMestrePDFV056={
  get fullscreen(){return dialog.open&&dialog.classList.contains('bm-v056-pdf-fullscreen')},
  get menuOpen(){return dialog.classList.contains('bm-v056-menu-open')},
  get annotationsOpen(){return dialog.classList.contains('bm-v056-annotation-open')},
  close:()=>oldClose.click()
 };
 dialog.classList.add('bm-v056-pdf-fullscreen');
})();
/* Banco Mestre V060 — imagem sem cabeçalho superior.
   Move os elementos DOM existentes, mantendo IDs e listeners originais. */
(function(){
 'use strict';
 const dialog=document.getElementById('imageDialog');
 const body=dialog?.querySelector(':scope > .dbody');
 const side=body?.querySelector(':scope > .editor-tools');
 const head=dialog?.querySelector(':scope > .dhead');
 const meta=body?.querySelector(':scope > .editor-meta');
 if(!dialog||!side||!head||!meta||dialog.classList.contains('bm-v060-image-side-only'))return;
 // Mesmo título e mesmo botão Fechar usados pelo editor anterior.
 // Nenhuma cópia ou handler paralelo é criado.
 dialog.classList.add('bm-v060-image-side-only');
 head.classList.add('bm-v060-image-sidebar-header');
 side.prepend(head);
 meta.classList.add('bm-v060-image-sidebar-meta');
 head.after(meta);
 const title=document.getElementById('imgTitle');
 if(title)title.setAttribute('title','Título/ID da imagem aberta; use o Atlas para editar a descrição');
 window.BancoMestreImageSideV060={
  get active(){return dialog.classList.contains('bm-v060-image-side-only')},
  get titleInSidebar(){return side.contains(document.getElementById('imgTitle'))},
  get closeInSidebar(){return side.contains(document.getElementById('imgClose'))},
  get zoomInSidebar(){return side.contains(document.getElementById('zoomInImage'))}
 };
})();
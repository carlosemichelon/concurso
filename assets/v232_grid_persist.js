/* V232 — preservar a grade dos flashcards em qualquer busca ou filtro.
   Muda só os nós de apresentação; não altera filtros, IDs, conteúdo, SRS ou paginação. */
(function(){
'use strict';
if(window.BM232GridPersist || typeof cardRender!=='function')return;
const rows=()=>document.getElementById('cardRows');
function normalize(){
 const root=rows();
 if(!root)return 0;
 const groups=root.querySelectorAll(':scope > .bm128CardsGroup');
 if(groups.length){
   // Os cartões já filtrados foram criados pelo renderizador original.
   // Retirá-los dos agrupamentos não altera o conteúdo nem seus listeners.
   const items=Array.from(root.querySelectorAll('article.card'));
   if(items.length)root.replaceChildren(...items);
 }
 root.classList.add('bm191-all-grid');
 return root.querySelectorAll(':scope > article.card').length;
}
const original=cardRender;
cardRender=function(...args){
 const result=original.apply(this,args);
 normalize();
 return result;
};
if(document.readyState==='loading'){
 document.addEventListener('DOMContentLoaded',normalize,{once:true});
}else normalize();
document.addEventListener('bm-v185-cards-synced',normalize);
window.BM232GridPersist=Object.freeze({refresh:normalize});
})();
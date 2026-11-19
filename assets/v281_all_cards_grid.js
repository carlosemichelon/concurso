/* Banco Mestre V191 — "Todos" realmente mostra TODOS os cartões disponíveis na grade.
 * Causa: cardRender legado limita a 24 e V128 embrulha cada categoria em <details>.
 * Esta camada atua SÓ na apresentação; não altera IDs, back, frente, SRS, Drive nem registros.
 * Cartões inativos continuam sob checkbox próprio; ocultados só sob toggle explícito.
 */
(function(){
 'use strict';
 if(window.BM191AllCardsGrid)return;
 if(typeof cardRender!=='function')return;
 const $=id=>document.getElementById(id);
 const ALL='all';
 let wasAll=false, renderCount=0, busy=false;
 const selection=()=>window.BM152FlashFilters?.selection||null;
 function allSelected(){
   if(window.BM281CardSort?.active)return false;
   const s=selection();
   if(s && [s.disc,s.general,s.subject,s.sub].some(v=>v!==undefined&&v!==ALL))return false;
   for(const id of ['cardFilter','cardTopicFilter','bm128CardGeneral']){
     const el=$(id);if(el&&el.value!==ALL)return false;
   }
   try{if(typeof focusGroup!=='undefined'&&focusGroup)return false;}catch(_){ }
   return true;
 }
 function statusNode(){
   let n=$('bm191CardCount');if(n)return n;
   const anchor=$('cardCount');if(!anchor)return null;
   n=document.createElement('small');n.id='bm191CardCount';n.className='bm191-card-count';
   n.setAttribute('role','status');
   anchor.insertAdjacentElement('afterend',n);
   return n;
 }
 function flatten(){
   const root=$('cardRows');if(!root)return 0;
   const articles=[...root.querySelectorAll('article.card')];
   if(articles.length){
     // Mover os nós preserva todos os listeners, atributos e históricos anexos à ficha.
     root.replaceChildren(...articles);
   }
   root.classList.add('bm191-all-grid');
   return articles.length;
 }
 function detailStyle(all){
   const b=$('moreCards');
   if(b){b.hidden=!!all;b.setAttribute('aria-hidden',String(!!all));}
   if(!all)$('cardRows')?.classList.remove('bm191-all-grid');
 }
 const previousRender=cardRender;
 cardRender=function(){
   if(busy)return previousRender();
   busy=true;
   try{
     const all=allSelected();
     if(all && typeof cards!=='undefined' && Array.isArray(cards)){
       // Renderizar todas as fichas na grade, não somente os primeiros 24.
       if(typeof cardLimit!=='undefined')cardLimit=Math.max(cardLimit,cards.length);
     }else if(wasAll && typeof cardLimit!=='undefined'){
       cardLimit=24; // Retornar à paginação para filtros específicos.
     }
     previousRender();
     const count=all?flatten():$('cardRows')?.querySelectorAll('article.card').length||0;
     detailStyle(all);
     const note=statusNode();
     if(note){
       const catalog=typeof cards!=='undefined'&&Array.isArray(cards)?cards.length:0;
       note.textContent=all?'Todos: '+count.toLocaleString('pt-BR')+' cartão(ões) na grade de '+catalog.toLocaleString('pt-BR')+' registros carregados. Os inativos e ocultados seguem seus controles próprios.':
         count.toLocaleString('pt-BR')+' cartão(ões) nesta página; filtros específicos ativos.';
     }
     wasAll=all;renderCount++;
   }finally{busy=false;}
 };
 // O botão legado de ocultar guarda o callback antigo; redirecionar ao novo wrapper.
 const hidden=$('cardHidden');if(hidden)hidden.onchange=()=>cardRender();
 window.BM191AllCardsGrid=Object.freeze({
   get allSelected(){return allSelected()},
   get visible(){return $('cardRows')?.querySelectorAll('article.card').length||0},
   get rendered(){return renderCount},
   redraw(){return cardRender()}
 });
 // A base poderá chegar mais tarde (OAuth do Drive). O sincronizador chama cardRender.
 if(typeof cards!=='undefined'&&Array.isArray(cards)&&cards.length)cardRender();
})();
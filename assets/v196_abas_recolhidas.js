/* Banco Mestre V196 — abas informativas recolhidas em todos os cartões.
 * Apenas comportamento visual: não modifica respostas, armazenamento, Drive ou SRS.
 * Abas abertas pelo estudante permanecem abertas até ele fechar ou trocar de cartão.
 */
(function BancoMestreV196AbasRecolhidas(){
 'use strict';
 if(window.BM196AbasRecolhidas)return;
 const seen=new WeakSet();
 const isDetails=node=>node&&node.nodeType===1&&node.tagName==='DETAILS';
 const childrenDetails=node=>{
  if(!node||node.nodeType!==1)return [];
  return (isDetails(node)?[node]:[]).concat(Array.from(node.querySelectorAll('details')));
 };
 // A resposta evolutiva é o conteúdo principal, NÃO uma aba informativa.
 // A abertura manual da resposta na grade também não deve ser desfeita.
 const isMainAnswer=d=>isDetails(d)&&(
  d.classList.contains('bm194-public-layers')||
  d.parentElement?.matches?.('article.card')
 );
 function closeAll(root){
  for(const d of childrenDetails(root)){seen.add(d);if(!isMainAnswer(d)&&d.open)d.open=false;}
 }
 function closeNew(root){
  for(const d of childrenDetails(root)){
   if(seen.has(d))continue;
   seen.add(d);
   if(!isMainAnswer(d)&&d.open)d.open=false;
  }
 }
 function accordion(event){
  const current=event.target;
  if(!isDetails(current)||!current.open||isMainAnswer(current))return;
  const parent=current.parentElement;
  if(!parent)return;
  // Apenas abas irmãs. Nunca fecha a seção ancestral de uma subaba interna.
  for(const sibling of parent.children){
   if(sibling!==current&&isDetails(sibling)&&!isMainAnswer(sibling)&&sibling.open)sibling.open=false;
  }
 }
 function mount(){
  const modal=document.getElementById('bmCardPeekV050');
  const rows=document.getElementById('cardRows');
  if(!modal||!rows)return false;
  const answer=modal.querySelector('.bm-v050-peek-answer');
  if(!answer)return false;
  let previousKey='';
  function resetOnCardChange(){
   const currentId=window.BancoMestreVisualizarCardV050?.currentId||'';
   const key=(modal.hidden?'fechado:':'aberto:')+currentId;
   if(previousKey===key)return;
   previousKey=key;
   // Gabarito e lei seca seguem o fluxo original: só fecha DETAILS informativos.
   if(!modal.hidden){
    closeAll(answer);
    closeAll(modal.querySelector('#bm195Discursive'));
   }
  }
  closeAll(answer);
  closeAll(modal.querySelector('#bm195Discursive'));
  for(const article of rows.querySelectorAll('article.card'))closeAll(article);
  // Abas que um renderizador criou abertas são fechadas somente na primeira inserção.
  // Não observa o atributo open, preservando o clique voluntário do estudante.
  const addObserver=new MutationObserver(records=>{
   for(const record of records){
    for(const n of record.addedNodes){
     if(n.nodeType!==1)continue;
     if(n.closest?.('#bmCardPeekV050')||n.closest?.('article.card')||
        n.querySelector?.('article.card')||n.querySelector?.('details'))closeNew(n);
    }
   }
  });
  addObserver.observe(answer,{childList:true,subtree:true});
  addObserver.observe(rows,{childList:true,subtree:true});
  const observer=new MutationObserver(resetOnCardChange);
  observer.observe(modal,{attributes:true,attributeFilter:['hidden']});
  const title=modal.querySelector('#bmCardPeekTitleV050');
  if(title)observer.observe(title,{childList:true,characterData:true,subtree:true});
  modal.addEventListener('toggle',accordion,true);
  rows.addEventListener('toggle',event=>{
   if(event.target.closest?.('article.card'))accordion(event);
  },true);
  resetOnCardChange();
  window.BM196AbasRecolhidas=Object.freeze({
   version:'V196',status:'abas informativas recolhidas; resposta evolutiva visível',scope:'apresentação',
   preserveSRS:true
  });
  return true;
 }
 if(!mount()){
  const wait=new MutationObserver(()=>{
   if(mount())wait.disconnect();
  });
  wait.observe(document.documentElement,{childList:true,subtree:true});
 }
})();
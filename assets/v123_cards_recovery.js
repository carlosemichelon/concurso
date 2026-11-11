/* V123 — retomada segura de flashcards após carga de JSON e navegação. */
(function(){
'use strict';
if(window.BancoMestreCardRecoveryV123)return;
const $=id=>document.getElementById(id),root=$('cartoes'),list=$('cardRows');
if(!root||!list)return;
const controls=root.querySelector('.controls'),notice=document.createElement('div');
notice.id='bm123CardsLoadStatus';
notice.setAttribute('role','status');
notice.setAttribute('aria-live','polite');
notice.hidden=true;
const reload=document.createElement('button');reload.type='button';reload.textContent='Recarregar cartões';
reload.hidden=true;
reload.className='bm123-card-retry';
notice.append(document.createElement('span'),reload);
if(controls)controls.after(notice);else root.querySelector('.panel')?.prepend(notice);
function msg(text,canRetry=false){
 const span=notice.querySelector('span');if(span)span.textContent=text;
 notice.hidden=!text;reload.hidden=!canRetry;
}
function number(){return typeof cards!=='undefined'&&Array.isArray(cards)?cards.length:0}
async function check(force=false){
 if(typeof loadCards!=='function')return;
 if(!number())msg('Carregando a base V024 do GitHub…');
 try{
  await loadCards();
  if(number()<1499)throw Error('A base ainda está incompleta ('+number()+' cartões).');
  if(typeof cardRender==='function')cardRender();
  const count=$('cardCount')?.textContent||'';
  if(!list.querySelector('article.card')){
   msg('A base foi carregada ('+number()+' IDs), mas nenhum cartão corresponde aos filtros atuais. Limpe a busca e os filtros.',true);
  }else msg('');
 }catch(e){msg('Não foi possível exibir os cartões: '+e.message+'. Verifique a conexão e tente novamente.',true);}
}
function resetFilters(){
 try{focusGroup=''}catch(_){}
 const search=$('cardSearch');if(search)search.value='';
 const filter=$('cardFilter');if(filter)filter.value='all';
 const topic=$('cardTopicFilter');if(topic)topic.value='all';
 for(const id of ['cardRecoveredOnly','cardReviewedOnly']){const x=$(id);if(x)x.checked=false;}
}
reload.addEventListener('click',()=>{
 resetFilters();check(true);
});
for(const button of document.querySelectorAll('header nav button[data-page="cartoes"]')){
 button.addEventListener('click',()=>{
  resetFilters();void check();
 });
}
if(location.hash==='#cartoes')void check();
window.BancoMestreCardRecoveryV123=Object.freeze({refresh:check,reset:resetFilters,get count(){return number()}});
})();
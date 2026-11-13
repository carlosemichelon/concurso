/* Banco Mestre V165 — navegação exclusivamente na biblioteca + pop-up.
 * Os links antigos ?cartao=ID abrem automaticamente a janela local.
 * Não cria abas, barras individuais, filtros particulares nem eventos SRS. */
(function(){
'use strict';
if(window.BM165CardsNavigation)return;
const root=document.getElementById('cardRows');
if(!root)return;
const valid=/^(?:CARD-\d{4,}|PROP-IJUI-\d+|IJUI-[A-Za-z0-9_-]+)$/i;
const idOf=article=>article?.querySelector(':scope > .tag')?.textContent?.trim()||'';
const read=id=>window.BancoMestreVisualizarCardV050?.showId?.(id);
function decorate(){
 for(const article of root.querySelectorAll('article.card')){
  const id=idOf(article);
  if(!valid.test(id))continue;
  article.tabIndex=0;
  article.title='Clique para abrir '+id+' na janela de estudo, sem sair da biblioteca';
  for(const old of article.querySelectorAll(':scope > .bm-open-card,:scope > .bm-open-hint'))old.remove();
 }
}
let scheduled=false;
const schedule=()=>{if(scheduled)return;scheduled=true;requestAnimationFrame(()=>{scheduled=false;decorate()})};
new MutationObserver(schedule).observe(root,{childList:true,subtree:true});schedule();
root.addEventListener('click',e=>{
 if(e.defaultPrevented)return;
 const article=e.target.closest('article.card');
 if(!article||!root.contains(article))return;
 if(e.target.closest('a,button,input,textarea,select,label,summary,details,form,[contenteditable="true"]'))return;
 const id=idOf(article);if(!valid.test(id))return;
 e.preventDefault();e.stopPropagation();
 read(id);
},true);
root.addEventListener('keydown',e=>{
 if(e.target.tagName!=='ARTICLE'||!e.target.classList.contains('card'))return;
 if(e.key==='Enter'||e.key===' '){
  e.preventDefault();
  const id=idOf(e.target);if(valid.test(id))read(id);
 }
});
const requested=new URLSearchParams(location.search).get('cartao');
async function openDeepLink(){
 if(!requested||!valid.test(requested))return;
 try{
  // Aguarde loadCards concluir, evitando o código individual antigo.
  if(typeof loadCards==='function')await loadCards();
  if(typeof section==='function')section('cartoes');
  for(let attempt=0;attempt<30;attempt++){
   if(read(requested))return;
   await new Promise(resolve=>setTimeout(resolve,120));
  }
  const note=document.createElement('p');
  note.className='bm165-link-missing';note.setAttribute('role','status');
  note.textContent='Não foi possível localizar o cartão '+requested+' nesta biblioteca. Verifique o ID e a conexão.';
  root.prepend(note);
 }catch(error){
  console.warn('Não foi possível abrir o cartão solicitado:',error);
  if(typeof section==='function')section('cartoes');
 }
}
if(requested)void openDeepLink();
window.BM165CardsNavigation=Object.freeze({
 mode:'pop-up',open(id){return valid.test(id)?!!read(id):false},
 get requested(){return requested}
});
})();
/* Banco Mestre V307 — acabamento visual não destrutivo dos cartões.
 * Mantém o ID e a pergunta como filhos diretos para compatibilidade com busca,
 * modal, ordenação, módulos, imagens do Drive e SRS.
 * Apenas o parágrafo de referência é recolhido no seu próprio details.
 */
(function(){
'use strict';
if(window.BM307CardLayout)return;
const $=id=>document.getElementById(id);
let observer=null,areaObserver=null,scheduled=false;
const normalized=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim().toLowerCase();
function cleanAreas(){
 const root=$('areaRows');if(!root)return;
 for(const b of root.querySelectorAll('.topicCard')){
  b.classList.add('bm307-area');
  // A marca era decorativa e recriava ícone gigante por ::before.
  b.removeAttribute('data-bm096-icon');
  b.removeAttribute('data-bm096-context');
  b.style.removeProperty('--bm096-mask');
 }
}
function decorateCard(article){
 const h3=article.querySelector(':scope > h3');
 const id=article.querySelector(':scope > .tag')?.textContent?.trim();
 const ribbon=article.querySelector(':scope > .bm163-card-ribbon');
 const peek=article.querySelector(':scope > .bm-v050-peek-button');
 if(!h3||!id||!ribbon||!peek)return;
 article.classList.add('bm307-card');
 article.dataset.bm307Layout='ready';
 const badge=ribbon.querySelector('.bm163-area');
 if(badge&&!badge.dataset.bm307Clean){
  badge.textContent=badge.textContent.replace(/^[▤▦∑⚖⌘✎]\s*/u,'').trim();
  badge.dataset.bm307Clean='1';
 }
 peek.title='Abrir leitura de '+id;
 const caption=[...article.children].find(n=>n.tagName==='P'&&!n.classList.contains('bm163-card-ref')&&!n.classList.contains('bm305-card-sub')&&!n.classList.contains('bm307-hint'));
 if(caption&&!caption.classList.contains('bm307-legacy-caption')){
  const a=normalized(badge?.textContent||'');
  const sub=normalized(caption.textContent||'');
  if(sub.includes(' · ')||a&&sub.startsWith(a))caption.classList.add('bm307-legacy-caption');
 }
 const ref=article.querySelector(':scope > .bm163-card-ref');
 if(ref&&!article.querySelector(':scope > details.bm307-source')){
  const fold=document.createElement('details');
  fold.className='bm307-source';
  const heading=document.createElement('summary');
  heading.textContent='Fonte, referência e edição';
  heading.title='Exibir a referência integral cadastrada sem alterar o texto original';
  fold.append(heading,ref);
  const answer=article.querySelector(':scope > details:not(.bm307-source)');
  if(answer)answer.before(fold);else article.append(fold);
 }
 const buttons=article.querySelector(':scope > .buttons');
 if(buttons){
  buttons.classList.add('bm307-actions');
  for(const b of buttons.querySelectorAll('button')){
   const label=normalized(b.textContent);
   if(label.includes('excluir da visualizacao')||label.includes('restaurar')){
    b.classList.add('bm307-visibility-action');
    if(label.includes('excluir'))b.title='Ocultar nesta visualização, sem apagar o cartão original nem o SRS';
   }
   if(label.includes('grifar')||label.includes('escrever'))b.classList.add('bm307-annotation-action');
  }
 }
}
function run(){
 cleanAreas();
 const root=$('cardRows');
 if(!root)return;
 for(const card of root.querySelectorAll('article.card'))decorateCard(card);
}
function queue(){
 if(scheduled)return;
 scheduled=true;
 requestAnimationFrame(()=>{scheduled=false;run()});
}
function init(){
 run();
 const cards=$('cardRows'),areas=$('areaRows');
 if(cards){observer=new MutationObserver(queue);observer.observe(cards,{childList:true,subtree:true});}
 if(areas){
  areaObserver=new MutationObserver(queue);
  areaObserver.observe(areas,{childList:true,subtree:true,attributes:true,attributeFilter:['data-bm096-icon']});
 }
 document.addEventListener('bm302-section-changed',queue);
}
window.BM307CardLayout=Object.freeze({
 refresh:queue,
 get ready(){return Boolean(observer)},
 get decorated(){return $('cardRows')?.querySelectorAll('article.card.bm307-card').length||0}
});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
else init();
})();

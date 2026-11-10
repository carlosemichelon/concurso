/* Banco Mestre V040: 1 cartão por aba, sem alterar base canônica/SRS. */
(function(){
'use strict';
const query=new URLSearchParams(location.search);
const requested=query.get('cartao');
const single=!!(requested && /^[A-Za-z0-9_-]{3,120}$/.test(requested));
const root=document.getElementById('cardRows');
if(!root)return;
const idOf=article=>article?.querySelector(':scope > .tag')?.textContent?.trim()||'';
const hrefFor=id=>{const u=new URL('v055.html',location.href);u.searchParams.set('cartao',id);u.hash='cartoes';return u.href};
const newWindow=id=>window.open(hrefFor(id),'_blank','noopener,noreferrer');
if(single){
 document.documentElement.classList.add('bm-single-card');
 document.title=requested+' · Banco Mestre · Cartão individual';
 const bar=document.createElement('div');bar.className='bm-focusbar';bar.setAttribute('role','navigation');bar.setAttribute('aria-label','Navegação do cartão individual');
 const heading=document.createElement('div');const title=document.createElement('strong');title.textContent='Cartão individual · '+requested;
 const subtitle=document.createElement('small');subtitle.textContent='Uma pergunta por janela · verso oculto até sua decisão';heading.append(title,subtitle);bar.append(heading);
 const links=document.createElement('div');links.style.display='flex';links.style.gap='8px';links.style.flexWrap='wrap';
 const back=document.createElement('a');back.className='bm-back';back.href='v055.html#cartoes';back.textContent='Voltar aos cartões';links.append(back);
 const pdf=document.createElement('a');pdf.href='v055.html#pdfs';pdf.target='_blank';pdf.rel='noopener noreferrer';pdf.textContent='Consultar PDFs';links.append(pdf);
 const close=document.createElement('button');close.type='button';close.textContent='Fechar esta aba';close.onclick=()=>{window.close();if(!window.closed)close.textContent='Feche a aba pelo navegador'};links.append(close);
 bar.append(links);document.body.insertBefore(bar,document.body.firstChild);
 const input=document.getElementById('cardSearch'),filter=document.getElementById('cardFilter'),topic=document.getElementById('cardTopicFilter'),show=document.getElementById('cardHidden');
 if(input)input.value=requested;
 if(filter)filter.value='all';
 if(topic)topic.value='all';
 if(show)show.checked=true;
 section('cartoes');
}
function decorate(){
 for(const article of root.querySelectorAll('article.card')){
  const id=idOf(article);
  if(!id)continue;
  if(single){article.dataset.bmFocus=id;continue}
  if(article.querySelector('.bm-open-card'))continue;
  article.tabIndex=0;
  article.title='Abrir '+id+' em uma aba exclusiva para estudar, escrever e corrigir';
  const actions=article.querySelector(':scope > .buttons');
  if(!actions)continue;
  const a=document.createElement('a');a.className='bm-open-card';a.href=hrefFor(id);a.target='_blank';a.rel='noopener noreferrer';
  a.textContent='Abrir cartão em janela separada';
  actions.prepend(a);
  const hint=document.createElement('p');hint.className='bm-open-hint';hint.textContent='Clique no cartão para estudar sem ver os outros ao lado.';
  article.insertBefore(hint,actions);
 }
 if(single){
  const found=root.querySelector('article.card');
  if(found && idOf(found)!==requested)found.hidden=true;
 }
}
let scheduled=false;
const schedule=()=>{if(scheduled)return;scheduled=true;requestAnimationFrame(()=>{scheduled=false;decorate()})};
const observer=new MutationObserver(schedule);observer.observe(root,{childList:true,subtree:true});schedule();
if(single){
 // Em caso de busca por ID inexistente, o catálogo exibe o estado de filtro normal.
 loadCards().then(()=>{schedule();if(cards.length&&!cards.some(c=>c.id===requested)&&!root.querySelector('.bm-focus-empty')){
  const p=document.createElement('p');p.className='bm-focus-empty';p.textContent='O ID '+requested+' não foi encontrado na base atual. Nenhum cartão foi alterado.';root.prepend(p);
 }}).catch(e=>{const p=document.createElement('p');p.className='bm-focus-empty';p.textContent='Erro ao abrir cartão: '+e.message;root.prepend(p)});
}else{
 root.addEventListener('click',event=>{
  if(event.defaultPrevented)return;
  const article=event.target.closest('article.card');
  if(!article||!root.contains(article))return;
  if(event.target.closest('a,button,input,textarea,select,label,form,summary,details,[contenteditable="true"]'))return;
  const id=idOf(article);if(!id)return;
  event.preventDefault();
  event.stopPropagation();
  newWindow(id);
 },true);
 root.addEventListener('keydown',event=>{
  if(event.target.tagName!=='ARTICLE'||!event.target.classList.contains('card'))return;
  if(event.key==='Enter'||event.key===' '){event.preventDefault();const id=idOf(event.target);if(id)newWindow(id)}
 });
}
window.BancoMestreCartaoIndividualV040={hrefFor,open:newWindow,single,requested};
})();
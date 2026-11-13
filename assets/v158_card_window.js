/* Banco Mestre V158: cartão individual compatível com a versão atual e retorno seguro.
 * Apenas navegação. Não altera IDs, conteúdo, respostas, SRS, PDF ou grifos. */
(function(){
'use strict';
const query=new URLSearchParams(location.search);
const requested=query.get('cartao');
const accepted=/^(?:CARD-\d{4,}|PROP-IJUI-\d+|IJUI-[A-Z0-9_-]+)$/i;
const single=!!(requested && accepted.test(requested));

const style=document.createElement('style');style.textContent=[
 'html.bm-single-card header nav{display:none!important}',
 'html.bm-single-card #cartoes .hero,html.bm-single-card #cartoes .controls,html.bm-single-card #cartoes #bm152ImageNav{display:none!important}',
 'html.bm-single-card #cartoes #moreCards,html.bm-single-card #cartoes #legalCoverage{display:none!important}',
 'html.bm-single-card main section:not(#cartoes){display:none!important}',
 'html.bm-single-card #cartoes #cardRows{display:block!important}',
 'html.bm-single-card #cartoes #cardRows>article.card{margin:12px 0 20px;max-width:880px}',
 '.bm-focusbar{position:sticky;top:0;z-index:80;background:#fff;border-bottom:1px solid #c9d7d4;box-shadow:0 2px 8px #0001;display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;padding:12px max(16px,calc((100vw - 1180px)/2))}',
 '.bm-focusbar strong{display:block;font-size:15px;color:#173c43}',
 '.bm-focusbar small{display:block;font-size:12px;color:#5f777b}',
 '.bm-focusbar a,.bm-focusbar button{background:#fff;border:1px solid #bbcdca;color:#225158;border-radius:8px;padding:9px 12px;text-decoration:none;min-height:40px;font-size:13px}',
 '.bm-focusbar a.bm-back{background:#1d666c;color:#fff;border-color:#1d666c}',
 '@media(max-width:600px){.bm-focusbar{padding:10px 12px}.bm-focusbar>div:last-child{width:100%}.bm-focusbar a,.bm-focusbar button{font-size:12px}}'
].join('\n');document.head.append(style);

const root=document.getElementById('cardRows');
if(!root)return;
const idOf=article=>article?.querySelector(':scope > .tag')?.textContent?.trim()||'';
const hrefFor=id=>{if(!accepted.test(id))return null;const u=new URL('./index.html',location.href);u.searchParams.set('cartao',id);u.hash='cartoes';return u.href};
const newWindow=id=>{const href=hrefFor(id);if(!href)return null;return window.open(href,'_blank','noopener,noreferrer')};
if(single){
 document.documentElement.classList.add('bm-single-card');
 document.title=requested+' · Banco Mestre · Cartão individual';
 const bar=document.createElement('div');bar.className='bm-focusbar';bar.setAttribute('role','navigation');bar.setAttribute('aria-label','Navegação do cartão individual');
 const heading=document.createElement('div');const title=document.createElement('strong');title.textContent='Cartão individual · '+requested;
 const subtitle=document.createElement('small');subtitle.textContent='Uma pergunta por janela · verso oculto até sua decisão';heading.append(title,subtitle);bar.append(heading);
 const links=document.createElement('div');links.style.display='flex';links.style.gap='8px';links.style.flexWrap='wrap';
 const back=document.createElement('a');back.className='bm-back';back.href=new URL('./index.html#cartoes',location.href).href;back.textContent='Voltar aos cartões · portal atual';links.append(back);
 const pdf=document.createElement('a');pdf.href=new URL('./index.html#pdfs',location.href).href;pdf.target='_blank';pdf.rel='noopener noreferrer';pdf.textContent='Consultar PDFs';links.append(pdf);
 const close=document.createElement('button');close.type='button';close.textContent='Fechar esta aba';close.onclick=()=>{window.close();if(!window.closed)close.textContent='Feche a aba pelo navegador'};links.append(close);
 bar.append(links);document.body.insertBefore(bar,document.body.firstChild);
 const input=document.getElementById('cardSearch'),filter=document.getElementById('cardFilter'),topic=document.getElementById('cardTopicFilter'),show=document.getElementById('cardHidden');
 for(const id of ['cardReviewedOnly','cardRecoveredOnly']){const el=document.getElementById(id);if(el)el.checked=false}
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
  if(event.target.closest('a,button,input,textarea,select,label,summary,details,[contenteditable="true"]'))return;
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
window.BancoMestreCartaoIndividualV158=Object.freeze({hrefFor,open:newWindow,single,requested,backHref:new URL('./index.html#cartoes',location.href).href});
})();
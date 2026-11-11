/* V109 — Flashcards e Imagens: pesquisa primeiro, filtros avançados recolhidos
 * só no celular. Os mesmos nós/IDs são movidos, sem clonar nem perder eventos.
 * Painel de apresentação/estatísticas continua acessível em "Visão geral".
 */
(function(){
'use strict';
if(window.BancoMestreMobileLibraryV109)return;
const main=document.querySelector('main'),hero=main?.querySelector(':scope > .hero'),
 stats=main?.querySelector(':scope > .stats');
const media=window.matchMedia('(max-width:760px)');
if(!main||!hero||!stats)return;
const intro=document.createElement('details');
intro.id='bm109Overview';intro.className='bm109-overview';
const caption=document.createElement('summary');caption.textContent='Visão geral e números do acervo';
intro.append(caption);
hero.before(intro);
intro.append(hero,stats);
let configured=false;
const libraries=[];
for(const id of ['cartoes','imagens']){
 const root=document.getElementById(id),controls=root?.querySelector('.controls');
 if(!root||!controls)continue;
 const introLine=root.querySelector('.panel > p.intro');
 if(introLine)introLine.textContent=id==='cartoes'?
  'Busque um cartão, veja a pergunta e revele a resposta sem alterar o SRS.':
  'Busque uma prancha e toque na imagem para ampliar.';
 const opts=[...controls.children].filter(e=>
  e.tagName==='SELECT'||e.tagName==='LABEL');
 const count=controls.querySelector('#'+(id==='cartoes'?'cardCount':'imageCount'));
 const filter=document.createElement('details');
 filter.className='bm109-filters';
 filter.id='bm109Filters'+(id==='cartoes'?'Cards':'Images');
 const summary=document.createElement('summary');
 summary.textContent=id==='cartoes'?'Filtros de cartões':'Filtros de imagens';
 filter.append(summary);
 // Rich help is still available without occupying initial reading space.
 let help=null;
 if(id==='imagens'){
  const p=root.querySelector('.panel'),notice=p?.querySelector('.notice'),
   original=p?.querySelector('.originalHelp');
  if(notice||original){
   help=document.createElement('details');help.className='bm109-image-help';
   const caption=document.createElement('summary');caption.textContent='Sobre originais e conferência técnica';
   help.append(caption);
   if(notice)help.append(notice);
   if(original)help.append(original);
   const after=p?.querySelector('.controls');
   after?.before(help);
  }
 }
 libraries.push({controls,opts,count,filter,help});
}
function adapt(){
 const mobile=media.matches;
 intro.open=!mobile;
 intro.classList.toggle('bm109-small',mobile);
 for(const lib of libraries){
  const {controls,opts,count,filter,help}=lib;
  if(help)help.open=!mobile;
  if(mobile){
   if(filter.parentNode!==controls)controls.append(filter);
   for(const node of opts)filter.append(node);
   if(!configured)filter.open=false;
  }else{
   for(const node of opts)if(node.parentNode!==controls)
    controls.insertBefore(node,count||filter);
   filter.remove();
  }
 }
 configured=true;
}
adapt();
media.addEventListener?.('change',adapt);
window.BancoMestreMobileLibraryV109=Object.freeze({refresh:adapt,filters:libraries.length});
})();
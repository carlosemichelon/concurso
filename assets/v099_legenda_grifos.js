/* V099 — legenda acessível do estudo ativo, sem alterar eventos do grifador */
(function(){
'use strict';
function init(){
 const bar=document.getElementById('bm068QuickBar');
 if(!bar||document.getElementById('bm099LawLegend'))return;
 const details=document.createElement('details');details.id='bm099LawLegend';
 const summary=document.createElement('summary');summary.textContent='Lei seca · código das 4 cores';
 details.append(summary);
 const rows=[
  ['#FDE68A','Amarelo — O quê?','Regra, inclusive proibição'],
  ['#BBF7D0','Verde — Quem?','Sujeito e competência'],
  ['#BAE6FD','Azul — Quando?','Prazo, número e condição'],
  ['#FECDD3','Rosa — Salvo o quê?','Exceção e ressalva']
 ];
 for(const [color,title,desc] of rows){
  const row=document.createElement('div');row.className='bm099-legend-row';
  const swatch=document.createElement('span');swatch.className='bm099-legend-swatch';
  swatch.style.backgroundColor=color;swatch.setAttribute('aria-hidden','true');
  const content=document.createElement('div');
  const strong=document.createElement('strong');strong.textContent=title;
  const small=document.createElement('small');small.textContent=desc;
  content.append(strong,small);row.append(swatch,content);details.append(row);
 }
 const hint=document.createElement('small');hint.className='bm099-legend-hint';
 hint.textContent='Liste só o núcleo. Negrito: apenas palavra que você já errou. Revise as sugestões antes de aplicar.';
 details.append(hint);bar.append(details);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
else init();
})();
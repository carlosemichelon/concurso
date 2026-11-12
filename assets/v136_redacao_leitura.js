/* V136 — apresentação apenas; preserva as bases Temas, Treino, cartões e SRS.
   Ações do usuário: acessibilidade tipográfica e reagrupamento visual dos elementos existentes. */
(function(){
'use strict';
const $=(s,base=document)=>base.querySelector(s);
const head=$('.hdr');
const storageKey='bm136_readable_font';
function clamp(value){const n=Number(value);return Number.isFinite(n)?Math.max(0,Math.min(4,n)):0}
let extra=0;try{extra=clamp(localStorage.getItem(storageKey)||0)}catch(e){}
function applySize(v){extra=clamp(v);document.documentElement.style.setProperty('--bm136-font-extra',extra+'px');try{localStorage.setItem(storageKey,String(extra))}catch(e){}}
applySize(extra);
if(head){
 const group=document.createElement('div');group.className='bm136-font-tools';group.setAttribute('role','group');group.setAttribute('aria-label','Ajustar tamanho dos textos');
 const label=document.createElement('span');label.textContent='Texto';group.append(label);
 const smaller=document.createElement('button');smaller.type='button';smaller.textContent='A−';smaller.title='Diminuir a letra';smaller.setAttribute('aria-label','Diminuir a letra');smaller.onclick=()=>update(extra-2);
 const normal=document.createElement('button');normal.id='bm136-font-reset';normal.type='button';normal.textContent='Padrão';normal.title='Restaurar o tamanho padrão';normal.onclick=()=>update(0);
 const bigger=document.createElement('button');bigger.type='button';bigger.textContent='A+';bigger.title='Aumentar a letra';bigger.setAttribute('aria-label','Aumentar a letra');bigger.onclick=()=>update(extra+2);
 const live=document.createElement('span');live.className='bm136-size-state';live.setAttribute('aria-live','polite');
 function update(value){applySize(value);live.textContent='Tamanho do texto '+(extra===0?'padrão':extra+' pixels maior')}
 group.append(smaller,normal,bigger,live);
 const privacy=$('.bm134-privacy',head);if(privacy)head.insertBefore(group,privacy);else head.append(group);
}
const theme=$('#aba-temas'),topics=$('#lista-temas');
if(theme&&topics&&!$('.bm136-catalog')){
 const filter=theme.querySelector(':scope > .card');
 const count=theme.querySelector(':scope > .bm134-count');
 const more=theme.querySelector(':scope > .bm134-more');
 const wrap=document.createElement('div');wrap.className='bm136-catalog';
 const sidebar=document.createElement('aside');sidebar.className='bm136-catalog-filters';
 const main=document.createElement('div');main.className='bm136-catalog-results';
 if(filter){filter.classList.add('bm136-filter-card');sidebar.append(filter);const t=filter.querySelector('.card-titulo');if(t)t.textContent='Filtrar temas'}
 if(count)main.append(count);
 main.append(topics);if(more)main.append(more);
 wrap.append(sidebar,main);theme.append(wrap);
}
const practice=$('#aba-flashcards');
if(practice&&!$('.bm136-practice-layout',practice)){
 const filter=practice.querySelector(':scope > .card:first-of-type'),question=$('#fc-card'),feedback=$('#fc-feedback');
 const wrap=document.createElement('div');wrap.className='bm136-practice-layout';
 const aside=document.createElement('aside');aside.className='bm136-practice-tools';
 const content=document.createElement('div');content.className='bm136-practice-question';
 if(filter)aside.append(filter);
 if(question)content.append(question);
 if(feedback)content.append(feedback);
 wrap.append(aside,content);practice.append(wrap);
}
window.BancoMestreLeituraV136={fontSize:function(){return extra},increase:function(){applySize(extra+2)}};
})();
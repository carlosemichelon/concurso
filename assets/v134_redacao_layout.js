
/* V134 — apenas interface, mantendo os métodos e dados originais da Redação. */
(function(){
'use strict';
const $=(s,base=document)=>base.querySelector(s);
const temas=$('#aba-temas'),treino=$('#aba-treino'),exercicios=$('#aba-flashcards');
if(!temas||!treino||!exercicios)return;
document.body.classList.toggle('bm134-embedded',window.self!==window.top);
const note=$('.bm132-notice');
if(note){const accordion=document.createElement('details');accordion.className='bm134-privacy';const title=document.createElement('summary');title.textContent='Privacidade, chave de IA e sincronização antiga (opcional)';note.before(accordion);accordion.append(title,note)}
function header(tag,title,sub,stat){
 const el=document.createElement('div');el.className='bm134-hero';
 const words=document.createElement('div');
 const k=document.createElement('div');k.className='eyebrow';k.textContent=tag;
 const h=document.createElement('h2');h.textContent=title;
 const p=document.createElement('p');p.textContent=sub;
 words.append(k,h,p);el.append(words);
 if(stat){const b=document.createElement('strong');b.textContent=stat;el.append(b)}
 return el;
}
temas.prepend(header('BANCO DE TEMAS','Escolha seu próximo tema','Pesquise e filtre. Selecione um assunto para abrir o treino guiado e começar a escrever.','120 temas'));
treino.prepend(header('PRODUÇÃO GUIADA','Treine a redação em etapas','FTTD, construção dos argumentos, desenvolvimento TEEC e redação final. Os recursos anteriores continuam disponíveis.'));
exercicios.prepend(header('PRÁTICA ATIVA','Exercícios de Redação','Identifique elementos, complete lacunas, ordene, classifique e corrija estruturas de redação.'));
const search=$('#tema-busca');
if(search){search.placeholder='Buscar tema por palavra-chave...';search.setAttribute('aria-label','Pesquisar tema')}
const chips=$('#chips-categoria');
if(chips){chips.setAttribute('role','group');chips.setAttribute('aria-label','Categorias de temas')}
const list=$('#lista-temas');
if(list){
 const counter=document.createElement('p');counter.className='bm134-count';counter.setAttribute('aria-live','polite');list.before(counter);
 const more=document.createElement('button');more.type='button';more.className='bm134-more';more.hidden=true;list.after(more);
 let visible=24;
 function update(reset){
  if(reset)visible=24;
  const cards=Array.from(list.children).filter(x=>x.classList.contains('tema-card'));
  cards.forEach((card,i)=>{
   card.hidden=i>=visible;
   card.setAttribute('tabindex','0');card.setAttribute('role','button');
   card.setAttribute('aria-label','Iniciar treino: '+($('.tema-titulo',card)?.textContent||'tema'));
  });
  const n=cards.length;
  counter.textContent=n+' tema'+(n===1?'':'s')+' encontrado'+(n===1?'':'s')+' · '+Math.min(visible,n)+' exibido'+(Math.min(visible,n)===1?'':'s');
  more.hidden=n<=visible;
  if(!more.hidden)more.textContent='Exibir mais '+Math.min(24,n-visible)+' temas';
 }
 list.addEventListener('keydown',ev=>{const item=ev.target.closest('.tema-card');if(item&&(ev.key==='Enter'||ev.key===' ')){ev.preventDefault();item.click()}});
 new MutationObserver(()=>update(true)).observe(list,{childList:true});
 more.addEventListener('click',()=>{visible+=24;update(false)});
 update(false);
}
const bar=$('#treino-prog')?.parentElement;
if(bar&&bar.classList.contains('progresso-bar')){
 const steps=document.createElement('div');steps.className='bm134-steps';
 ['Planejamento FTTD','Desenvolvimento','Texto final'].forEach((name,i)=>{
  const div=document.createElement('div');div.className='bm134-step';
  const number=document.createElement('b');number.textContent=String(i+1);
  const label=document.createElement('span');label.textContent=name;div.append(number,label);steps.append(div);
 });
 bar.after(steps);
 const level=$('#treino-nivel-badge');
 function updateLevel(){
  const current=Number((level?.textContent||'').match(/NÍVEL\s+([123])\/3/i)?.[1]||1);
  Array.from(steps.children).forEach((node,i)=>{
   node.classList.toggle('active',i+1===current);node.classList.toggle('done',i+1<current);
   if(i+1===current)node.setAttribute('aria-current','step');else node.removeAttribute('aria-current');
  });
 }
 if(level){new MutationObserver(updateLevel).observe(level,{childList:true});updateLevel()}
}
const guide=$('#fttd-conteudo');
if(guide&&guide.style.display!=='none'&&typeof window.treino_toggleFTTD==='function')window.treino_toggleFTTD();
const heading=guide?.parentElement?.firstElementChild;
if(heading){heading.setAttribute('tabindex','0');heading.setAttribute('role','button');heading.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();heading.click()}})}
const fields=$('#treino-campos');
if(fields){
 const count=document.createElement('p');count.id='bm134-wordcount';count.className='bm134-wordcount';fields.after(count);
 function wordCount(){const t=$('#treino-campo-redacao')?.value.trim()||'';count.textContent=t?(t.split(/\s+/).length+' palavras · '+t.split(/\n\s*\n/).filter(Boolean).length+' parágrafos no texto final'):''}
 function decorate(){
  let axis1=false,axis2=false;
  Array.from(fields.children).filter(x=>x.classList?.contains('field')).forEach(field=>{
   const area=field.querySelector('textarea[id^="treino-campo-"]');if(!area)return;
   const id=area.id;
   if(id.includes('arg1_')||id.endsWith('dev1')){field.classList.add('axis1');if(!axis1){axis1=true;const prev=field.previousElementSibling;if(!prev||!prev.classList.contains('axis-heading')){const h=document.createElement('h3');h.className='axis-heading';h.textContent='Eixo 1 — Primeiro argumento';field.before(h)}}}
   if(id.includes('arg2_')||id.endsWith('dev2')){field.classList.add('axis2');if(!axis2){axis2=true;const prev=field.previousElementSibling;if(!prev||!prev.classList.contains('axis-heading')){const h=document.createElement('h3');h.className='axis-heading';h.textContent='Eixo 2 — Segundo argumento';field.before(h)}}}
   if(['treino-campo-redacao','treino-campo-intro','treino-campo-conclusao'].includes(id))field.classList.add('final');
  });
  wordCount();
 }
 new MutationObserver(decorate).observe(fields,{childList:true});
 fields.addEventListener('input',ev=>{if(ev.target.id==='treino-campo-redacao')wordCount()});
 decorate();
}
const first=exercicios.querySelector('.card');
if(first){
 const header=first.firstElementChild,controls=header?.children?.[1];
 if(controls){
  controls.classList.add('bm134-fc-tools');
  const filters=document.createElement('div');filters.className='bm134-fc-filters';controls.prepend(filters);
  [['fc-tipo','Modalidade'],['fc-filtro','Elemento'],['fc-filtro-forma','Forma argumentativa']].forEach(([id,name])=>{
   const el=document.getElementById(id);if(!el)return;
   const label=document.createElement('label');label.append(document.createTextNode(name),el);filters.append(label);
  });
  const buttons=document.createElement('div');buttons.className='bm134-fc-actions';controls.append(buttons);
  Array.from(controls.children).filter(x=>x!==filters&&x!==buttons).forEach(x=>{
   if(x.id==='fc-progresso')header.children[0].append(x);else buttons.append(x);
  });
 }
}
window.BancoMestreFormatacaoV134={get temasExibidos(){return list?list.querySelectorAll('.tema-card:not([hidden])').length:0}};
})();

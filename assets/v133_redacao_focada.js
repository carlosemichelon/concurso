/* V133 — Treinador de Redação: somente Temas e Treino; exercícios integrados ao Treino.
 * Mantém a lógica FTTD/TEEC, o banco original, as respostas e os identificadores locais.
 */
(function(){
'use strict';
var bar=document.querySelector('.tabs');
var themePane=document.getElementById('aba-temas');
var guidedPane=document.getElementById('aba-treino');
var exercisePane=document.getElementById('aba-flashcards');
if(!bar||!themePane||!guidedPane||!exercisePane)return;
var title=document.querySelector('.hdr-title');
if(title)title.textContent='Redação — Temas e Treino';
var badge=document.querySelector('.hdr-badge');
if(badge)badge.textContent='BANCO MESTRE · CONCURSOS';
var navigation=[
  {id:'temas',label:'Temas'},
  {id:'treino',label:'Treino'}
];
bar.replaceChildren();
navigation.forEach(function(item){
  var btn=document.createElement('button');
  btn.type='button';btn.className='tab';btn.dataset.bm133Main=item.id;
  btn.textContent=item.label;
  btn.addEventListener('click',function(){window.setTab(item.id)});
  bar.appendChild(btn);
});
var subnav=document.createElement('div');
subnav.className='bm133-training-switch';
subnav.setAttribute('role','group');
subnav.setAttribute('aria-label','Modalidades do treino');
var modes=[
 {id:'treino',text:'Produção guiada · FTTD / TEEC'},
 {id:'flashcards',text:'Exercícios de Redação'}
];
modes.forEach(function(item){
 var btn=document.createElement('button');
 btn.type='button';btn.dataset.bm133Mode=item.id;
 btn.textContent=item.text;btn.addEventListener('click',function(){window.setTab(item.id)});
 subnav.appendChild(btn);
});
var connective=document.createElement('button');
connective.type='button';connective.className='bm133-connective';
connective.textContent='Guia de conectivos';
connective.addEventListener('click',function(){if(typeof window.conAbrir==='function')window.conAbrir()});
subnav.appendChild(connective);
bar.insertAdjacentElement('afterend',subnav);
var heading=exercisePane.querySelector('.card-titulo');
if(heading&&heading.textContent.includes('FLASHCARDS DE REDAÇÃO'))heading.textContent='EXERCÍCIOS DE REDAÇÃO · PRÁTICA ATIVA';
var intro=document.createElement('p');intro.className='bm133-practice-note';
intro.textContent='Exercícios independentes do SRS do Banco Mestre: identificação, completar lacunas, ordenar, classificar, corrigir erro, produção curta e mapa mental. Seu histórico anterior de prática foi preservado.';
exercisePane.insertBefore(intro,exercisePane.firstChild);
var originalSetter=window.setTab;
var initialized=false;
window.setTab=function(id){
 if(id==='fttd')id='treino';
 if(!['temas','treino','flashcards'].includes(id)){
  // Outros motores continuam disponíveis internamente como apoio ao treino,
  // mas não reaparecem como abas independentes.
  return;
 }
 document.querySelectorAll('.aba').forEach(function(p){p.classList.remove('ativo')});
 var selected=document.getElementById('aba-'+id);
 if(selected)selected.classList.add('ativo');
 var main=id==='temas'?'temas':'treino';
 bar.querySelectorAll('[data-bm133-main]').forEach(function(btn){
  var active=btn.dataset.bm133Main===main;
  btn.classList.toggle('ativo',active);
  btn.setAttribute('aria-selected',String(active));
 });
 subnav.hidden=main!=='treino';
 subnav.querySelectorAll('[data-bm133-mode]').forEach(function(btn){
  var active=btn.dataset.bm133Mode===id;
  btn.classList.toggle('ativo',active);
  btn.setAttribute('aria-pressed',String(active));
 });
 if(id==='flashcards'&&!initialized){
  initialized=true;
  try{if(typeof window.fcInit==='function')window.fcInit()}catch(e){initialized=false;console.error('Exercícios de redação',e)}
 }
 try{sessionStorage.setItem('bm133_redacao_painel',id)}catch(e){}
};
window.usarTema=function(idx){
 if(typeof TEMAS_BANCO==='undefined'||!TEMAS_BANCO[idx])return;
 var editable=guidedPane.querySelectorAll('textarea');
 var hasDraft=Array.from(editable).some(function(x){return x.value.trim().length>0});
 if(hasDraft&&!confirm('Selecionar outro tema reinicia o exercício que está na tela. Salve o progresso atual antes de trocar. Continuar?'))return;
 if(typeof window.treino_selecionarTema==='function')window.treino_selecionarTema(idx);
 window.setTab('treino');
};
var prevId='temas';
try{prevId=sessionStorage.getItem('bm133_redacao_painel')||'temas'}catch(e){}
window.setTab(['temas','treino','flashcards'].includes(prevId)?prevId:'temas');
window.BancoMestreTreinoV133={get painel(){return document.querySelector('.aba.ativo')?.id||null},abrirExercicios:function(){window.setTab('flashcards')}};
})();

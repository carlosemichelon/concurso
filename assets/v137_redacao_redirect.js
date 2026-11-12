/* V137 — manter abertura da Redação em página inteira. */
(function(){
'use strict';
const nav=document.querySelector('header nav'),b=nav?.querySelector('button[data-page="redacao"]');
const href='./redacao_temas_treino_v137.html?versao=V137';
const open=()=>window.location.assign(href);
if(b){b.type='button';b.textContent='Redação';b.onclick=open;b.title='Abrir Redação em tela inteira'}
window.BancoMestreRedacaoV137={abrir:open};
const check=()=>{if(location.hash==='#redacao')open()};
window.addEventListener('hashchange',check);check();
})();
/* V144 — Redação em tela inteira com consulta lateral. */
(function(){
'use strict';
const nav=document.querySelector('header nav'),btn=nav?.querySelector('button[data-page="redacao"]');
const url='./redacao_temas_treino_v144.html?versao=V144';
const open=()=>window.location.assign(url);
if(btn){btn.type='button';btn.textContent='Redação';btn.onclick=open;btn.title='Abrir a oficina com consultas e volta ao editor'}
window.BancoMestreRedacaoV144={abrir:open};
const check=()=>{if(location.hash==='#redacao')open()};
window.addEventListener('hashchange',check);check();
})();
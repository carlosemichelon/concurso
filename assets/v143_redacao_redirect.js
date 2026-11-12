/* V143 — Redação com janelas de consulta e retorno à escrita. */
(function(){
'use strict';
const nav=document.querySelector('header nav'),btn=nav?.querySelector('button[data-page="redacao"]');
const url='./redacao_temas_treino_v143.html?versao=V143';
const open=()=>window.location.assign(url);
if(btn){btn.type='button';btn.textContent='Redação';btn.onclick=open;btn.title='Abrir Redação com consulta lateral'}
window.BancoMestreRedacaoV143={abrir:open};
const check=()=>{if(location.hash==='#redacao')open()};
window.addEventListener('hashchange',check);check();
})();
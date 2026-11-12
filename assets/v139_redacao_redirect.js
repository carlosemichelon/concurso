/* V139 — manter oficina de Redação em tela inteira com fonte legível. */
(function(){
'use strict';
const nav=document.querySelector('header nav'),button=nav?.querySelector('button[data-page="redacao"]');
const target='./redacao_temas_treino_v139.html?versao=V139';
const open=()=>window.location.assign(target);
if(button){button.type='button';button.textContent='Redação';button.onclick=open;button.title='Abrir Redação em tela inteira'}
window.BancoMestreRedacaoV139={abrir:open};
const hash=()=>{if(location.hash==='#redacao')open()};
addEventListener('hashchange',hash);hash();
})();
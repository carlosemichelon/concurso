/* V138: Redação em tela inteira ao clicar no portal. */
(function(){
'use strict';
const nav=document.querySelector('header nav'),button=nav?.querySelector('button[data-page="redacao"]');
const url='./redacao_temas_treino_v138.html?versao=V138';
const open=()=>window.location.assign(url);
if(button){button.textContent='Redação';button.type='button';button.onclick=open;button.title='Abrir Temas e Treino em tela inteira'}
window.BancoMestreRedacaoV138={abrir:open};
const onHash=()=>{if(location.hash==='#redacao')open()};
addEventListener('hashchange',onHash);onHash();
})();
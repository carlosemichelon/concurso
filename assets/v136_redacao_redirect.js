/* V136 — Redação no próprio endereço em tela cheia. */
(function(){
'use strict';
const nav=document.querySelector('header nav'),button=nav?.querySelector('button[data-page="redacao"]');
const page='./redacao_temas_treino_v136.html?versao=V136';
function open(){window.location.assign(page)}
if(button){button.type='button';button.textContent='Redação';button.onclick=open;button.title='Abrir Redação em tela inteira'}
window.BancoMestreRedacaoV136={abrir:open};
function openHash(){if(location.hash==='#redacao')open()}
addEventListener('hashchange',openHash);openHash();
})();
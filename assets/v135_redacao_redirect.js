/* V135 — clique em Redação abre a oficina em página inteira, na mesma guia. */
(function(){
'use strict';
const nav=document.querySelector('header nav'),btn=nav?.querySelector('button[data-page="redacao"]');
const destination='./redacao_temas_treino_v135.html?versao=V135';
function openFull(){window.location.assign(destination)}
if(btn){
 btn.textContent='Redação';
 btn.type='button';
 btn.onclick=openFull;
 btn.setAttribute('title','Abrir Redação: Temas e Treino em tela inteira');
 btn.setAttribute('aria-label','Abrir Redação em tela inteira');
}
window.BancoMestreRedacaoV135={abrir:openFull};
function checkHash(){if(window.location.hash==='#redacao')openFull()}
window.addEventListener('hashchange',checkHash);
checkHash();
})();
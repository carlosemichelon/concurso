/* V142 — abrir redação em tela inteira, sem alterar dados. */
(function(){
'use strict';
const nav=document.querySelector('header nav'),button=nav?.querySelector('button[data-page="redacao"]');
const url='./redacao_temas_treino_v142.html?versao=V142';
const open=()=>window.location.assign(url);
if(button){button.type='button';button.textContent='Redação';button.onclick=open;button.title='Abrir Redação com texto legível'}
window.BancoMestreRedacaoV142={abrir:open};
const onHash=()=>{if(location.hash==='#redacao')open()};
addEventListener('hashchange',onHash);onHash();
})();
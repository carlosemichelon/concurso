/* V146: encaminhamento da Redação compacta. Mantém a V145 preservada. */
(function(){'use strict';
 const btn=document.querySelector('header nav [data-page="redacao"]');
 const target='./redacao_temas_treino_v146.html?versao=V146';
 const go=()=>location.assign(target);
 if(btn){btn.type='button';btn.textContent='Redação';btn.onclick=go;}
 window.BancoMestreRedacaoV146={abrir:go};
 const hash=()=>{if(location.hash==='#redacao')go()};
 addEventListener('hashchange',hash);hash();
})();
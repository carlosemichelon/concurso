/* V229 — não deixar o módulo informativo V206 sobrescrever o número da versão ativa. */
(function(){
'use strict';
if(window.BM229FooterVersion)return;
const CURRENT='V229';
let active=false;
function refresh(){
 const footer=document.querySelector('main footer');
 if(!footer)return;
 const text='Portal '+CURRENT+' · cartões e formatação no GitHub · imagens e PDFs originais no Google Drive · histórico pessoal privado';
 if(footer.textContent!==text)footer.textContent=text;
}
function init(){
 if(active)return;active=true;
 refresh();
 const footer=document.querySelector('main footer');
 if(footer)new MutationObserver(refresh).observe(footer,{childList:true,subtree:true,characterData:true});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
window.BM229FooterVersion=Object.freeze({refresh,version:CURRENT});
})();
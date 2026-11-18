/* V259 — leitura da versao real inclusive no index.html estatico. */
/* V232 — versão efetiva da página no cabeçalho e no rodapé.
   A versão vem da URL versionada; módulos históricos não podem mascará-la.
   Reutilizável em próximas edições sem modificar V206 nem a base canônica. */
(function(){
'use strict';
if(window.BM232SiteVersion)return;
const match=location.pathname.match(/\/v(\d{3})\.html$/i);
const current=match?'V'+match[1]:(document.documentElement.getAttribute('data-bm-portal-version')||'V259');
let ready=false;
function refresh(){
 const badge=document.querySelector('header .brand > .version');
 const counts=window.BM206Header?.counts;
 const privateSource=counts?.origin==='privada';
 const source=privateSource?'cartões privados autorizados':'cartões V194';
 const header='Portal '+current+' · '+source+' · Atlas V198';
 if(badge && badge.textContent!==header)badge.textContent=header;
 const footer=document.querySelector('main > footer');
 const caption='Portal '+current+' · cartões e formatação no GitHub · originais no Google Drive · histórico pessoal privado';
 if(footer && footer.textContent!==caption)footer.textContent=caption;
}
function init(){
 if(ready)return;ready=true;
 refresh();
 const badge=document.querySelector('header .brand > .version');
 const footer=document.querySelector('main > footer');
 if(typeof MutationObserver!=='undefined'){
  for(const el of [badge,footer]){
   if(el)new MutationObserver(refresh).observe(el,{childList:true,characterData:true,subtree:true});
  }
 }
 document.addEventListener('bm-v185-cards-synced',refresh);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
window.BM232SiteVersion=Object.freeze({refresh,get version(){return current}});
})();
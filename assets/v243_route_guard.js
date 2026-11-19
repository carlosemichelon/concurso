/* V243 — preservar o escopo offline da homologação sem alterar as rotas do portal oficial. */
(function(){
 'use strict';
 if(!location.pathname.includes('/homologacao-v243/'))return;
 const path=location.pathname;
 for(const method of ['pushState','replaceState']){
  const original=history[method].bind(history);
  history[method]=function(state,title,url){
   if(typeof url==='string'&&url.startsWith('#')){
    return original(state,title,path+location.search+url);
   }
   return original(state,title,url);
  };
 }
 window.BM243RouteGuard=Object.freeze({path});
})();

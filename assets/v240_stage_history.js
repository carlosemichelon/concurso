/* Homologação V242: caminhos # de histórico devem preservar o arquivo da área isolada.
   Não altera o roteador ou o histórico do site publicado. */
(function(){
 'use strict';
 if(!location.pathname.includes('/homologacao-v240/'))return;
 if(window.BM240StageHistory)return;
 for(const method of ['replaceState','pushState']){
  const original=history[method].bind(history);
  history[method]=function(data,title,url){
   if(typeof url==='string'&&url.startsWith('#')){
    return original(data,title,location.pathname+location.search+url);
   }
   return original(data,title,url);
  };
 }
 window.BM240StageHistory=Object.freeze({active:true});
})();
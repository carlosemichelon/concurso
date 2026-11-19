/* Register offline worker only in V243 isolated staging; never control public homepage. */
(function(){
'use strict';
if(!('serviceWorker' in navigator)||!window.isSecureContext)return;
if(!location.pathname.includes('/homologacao-v243/'))return;
window.addEventListener('load',()=>{
 const script=new URL('./homologacao-v243/sw.js',document.baseURI);
 const scope=new URL('./homologacao-v243/',document.baseURI);
 navigator.serviceWorker.register(script.href,{scope:scope.href}).catch(e=>console.warn('Modo offline da homologação indisponível:',e.message));
},{once:true});
})();
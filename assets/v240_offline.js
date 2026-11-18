/* V240 — offline cache for public site; browser still holds private study records. */
(function(){
'use strict';
if(!('serviceWorker' in navigator)||!window.isSecureContext)return;
window.addEventListener('load',()=>{
 navigator.serviceWorker.register('./sw-v240.js',{scope:'./'}).then(reg=>{
  console.info('V240 public offline cache',reg.scope);
 }).catch(e=>console.warn('V240 offline unavailable',e.message));
},{once:true});
})();
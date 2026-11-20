/* Banco Mestre V321 — Anotar flashcard abre em Ler / selecionar texto.
 * Não altera traços existentes, gravação local, ferramentas, SRS ou cartões.
 */
(function(){
'use strict';
if(window.BM321InkStartsSelection)return;
let installed=false;
function activate(overlay){
 if(overlay.hidden)return;
 const selector=overlay.querySelector('button[data-tool="read"]');
 if(selector&&selector.getAttribute('aria-pressed')!=='true')selector.click();
}
function install(){
 if(installed)return true;
 const overlay=document.getElementById('bm122CardInk');
 if(!overlay)return false;
 installed=true;
 new MutationObserver(mutations=>{
  if(mutations.some(m=>m.type==='attributes'&&m.attributeName==='hidden'))activate(overlay);
 }).observe(overlay,{attributes:true,attributeFilter:['hidden']});
 activate(overlay);
 return true;
}
if(!install()){
 const obs=new MutationObserver(()=>{if(install())obs.disconnect()});
 obs.observe(document.documentElement,{childList:true,subtree:true});
}
window.BM321InkStartsSelection=Object.freeze({get ready(){return installed}});
})();
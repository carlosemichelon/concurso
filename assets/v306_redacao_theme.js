/* Portal V306: injeta apenas CSS no documento histórico do iframe de Redação.
 * Não modifica scripts, histórico de exercícios, armazenamento ou OAuth.
 */
(function(){
'use strict';
if(window.BM306RedacaoTheme)return;
const CSS='assets/v306_redacao_theme.css?v=306-1';
let observer=null;
function apply(frame){
 if(!frame)return;
 frame.style.setProperty('border','0','important');
 frame.style.setProperty('background','#f5f8fb','important');
 frame.style.setProperty('min-height','760px','important');
 frame.style.setProperty('height','max(760px, calc(100vh - 155px))','important');
 frame.style.setProperty('border-radius','0','important');
 try{
  const doc=frame.contentDocument;
  if(!doc?.head||doc.getElementById('bm306-redacao-theme'))return;
  const link=doc.createElement('link');link.id='bm306-redacao-theme';link.rel='stylesheet';link.href=new URL(CSS,location.href).href;
  doc.head.append(link);
  doc.documentElement.dataset.bm306Theme='portal';
 }catch(e){console.warn('Tema da Redação depende de iframe na mesma origem:',e);}
}
function boot(){
 const iframe=document.getElementById('bm302-redacao-original');
 if(!iframe)return false;
 if(iframe.dataset.bm306Attached!=='1'){
  iframe.dataset.bm306Attached='1';iframe.addEventListener('load',()=>apply(iframe));
 }
 apply(iframe);return true;
}
function init(){
 if(boot())return;
 const main=document.querySelector('main');if(!main)return;
 observer=new MutationObserver(()=>{if(boot())observer.disconnect()});
 observer.observe(main,{childList:true,subtree:true});
}
window.BM306RedacaoTheme=Object.freeze({refresh:boot});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();

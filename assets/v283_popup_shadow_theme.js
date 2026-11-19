/* Banco Mestre V283 — harmonização de popups no Controle isolado. */
(function(){'use strict';let attempts=0;const id='bm283-popup-theme';
function apply(){
 const root=document.getElementById('bm240-native-host')?.shadowRoot;
 if(!root)return false;if(root.getElementById(id))return true;
 const s=document.createElement('style');s.id=id;
 s.textContent=`
 :host{--accent:#1687d8;--bg:#edf0f1;--paper:#fff;--ink:#344b5a;--sub:#6c7f8d;--line:#dce5ea}
 dialog,[role="dialog"],.modal,.popup,.popover{
  font-family:"Segoe UI",Arial,system-ui,sans-serif!important;
  color:#344b5a!important;background:#fff!important;border-color:#dce5ea!important;
  box-shadow:0 16px 52px #102c3c31!important
 }
 dialog :is(h2,h3,strong),[role="dialog"] :is(h2,h3,strong){color:#325a76!important}
 dialog :is(button,input,select,textarea),[role="dialog"] :is(button,input,select,textarea){
  font-family:"Segoe UI",Arial,sans-serif!important;border-radius:5px!important
 }
 dialog :is(input,select,textarea),[role="dialog"] :is(input,select,textarea){
  border-color:#ccdee8!important;background:#fff!important;color:#344b5a!important
 }
 dialog :is(button.primary,button.active),[role="dialog"] :is(button.primary,button.active){
  background:#1687d8!important;border-color:#1687d8!important;color:#fff!important
 }
 dialog :is(button,input,select,textarea):focus-visible,[role="dialog"] :is(button,input,select,textarea):focus-visible{
  outline:2px solid #65aee0!important;outline-offset:2px!important
 }
 `;root.append(s);return true
}
function retry(){if(apply()||attempts++>40)return;setTimeout(retry,250)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',retry,{once:true});else retry();
})();

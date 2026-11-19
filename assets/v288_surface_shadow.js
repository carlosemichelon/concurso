/* V288 — superfícies do Controle nativo com o padrão do portal.
   Overlay somente de CSS, sem alterar calendário, registros, SRS ou cores semânticas. */
(function(){
'use strict';
if(window.BM288Surface)return;
const key='bm288-surface';
const rules=`
:host{--bm-paper:#fff;--bm-soft:#f8fafc;--bm-line:#dae5eb;--bm-ink:#2b3f4d;
 font-family:"Segoe UI",Arial,system-ui,sans-serif!important;color:#2b3f4d!important}
:host main{background:#edf0f1!important}
:host .panel,:host .metric{
 background:#fff!important;color:#2b3f4d!important;
 border:1px solid #dae5eb!important;border-radius:6px!important;
 box-shadow:0 1px 2px #1e3a4a0c!important
}
:host .panel :is(p,li,td),:host .metric :is(span,small){color:#344b5a!important}
:host :is(input:not([type="checkbox"]):not([type="radio"]),select,textarea){
 background:#fff!important;border:1px solid #c5d8e5!important;color:#2b3f4d!important;
 border-radius:5px!important
}
:host #bm252-module-nav{background:#f6f9fc!important;border-color:#dce8f0!important}
:host #bm252-module-nav button[aria-current="page"]{
 color:#176ca3!important;background:#eaf5fc!important;border-color:#1687d8!important
}
:host #calendarioControle .bm240-day:not([data-bm252-state="done"]):not([data-bm252-state="planned"]):not([data-bm252-state="both"]):not(.selected){
 background:#fff!important;border-color:#cbdce8!important
}
:host .bm252-month-stats span,:host #bm252-month-stats span{
 background:#fff!important;border-color:#dce8ee!important;color:#365d74!important
}
:host .notice{border-color:#dce8ee!important}
:host :is(dialog,[role="dialog"],.modal,.popup){background:#fff!important;color:#2b3f4d!important}
`;
function apply(){
 const root=document.getElementById('bm240-native-host')?.shadowRoot;
 if(!root)return false;
 let style=root.getElementById(key);
 if(!style){style=document.createElement('style');style.id=key;style.textContent=rules}
 if(root.lastElementChild!==style)root.append(style);
 return true;
}
for(const event of ['bm240-study-mounted','bm252-study-ready','bm253-calendar-compact-ready'])document.addEventListener(event,apply);
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',apply,{once:true});else apply();
window.BM288Surface=Object.freeze({refresh:apply});
})();

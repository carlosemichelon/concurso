/* V291 — contraste e contornos retos no Controle isolado; sem escrita. */
(function(){'use strict';
if(window.BM291StudyContrast)return;
const id='bm291-study-contrast';
const rules=`
:host{--ink:#1c2730;--sub:#354653;--line:#bdccd5;color:#1c2730!important;
 font-family:"Segoe UI",Arial,system-ui,sans-serif!important}
:host :is(.panel,.metric,.item,.row,.notice,.bm240-day,.bm240-pad){
 border-radius:0!important;box-shadow:none!important;border-color:#bdccd5!important}
:host .panel,:host .metric{background:#fff!important}
:host .panel :is(p,li,td,th),:host .metric :is(span,small),
:host #calendarioControle .bm240-day :is(b,span,small){color:#1c2730!important}
:host :is(input:not([type="checkbox"]):not([type="radio"]),select,textarea,button){border-radius:0!important}
:host #bm252-main-nav button[aria-selected="true"]{
 background:#1687d8!important;color:#fff!important;border-color:#1687d8!important}
:host #bm252-module-nav button[aria-current="page"]{
 background:#e9f5fc!important;color:#196a9c!important;border-color:#1687d8!important}
:host :is(dialog,[role="dialog"],.popup,.modal){border-radius:0!important;color:#1c2730!important}
`;
function apply(){const root=document.getElementById('bm240-native-host')?.shadowRoot;if(!root)return false;
let s=root.getElementById(id);if(!s){s=document.createElement('style');s.id=id;s.textContent=rules}
if(root.lastElementChild!==s)root.append(s);return true}
for(const ev of ['bm240-study-mounted','bm252-study-ready','bm253-calendar-compact-ready'])document.addEventListener(ev,apply);
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',apply,{once:true});else apply();
window.BM291StudyContrast=Object.freeze({refresh:apply});
})();
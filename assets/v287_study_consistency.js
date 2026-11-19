/* V287: reforço visual do Controle — azul consistente, sem escrever estado. */
(function(){
'use strict';
if(window.BM287Theme)return;
const key='bm287-theme';
const css=`
:host{--accent:#1687d8;--bg:#edf0f1;--paper:#fff;--ink:#344b5a;
 --sub:#5d7584;--line:#dce6ed;--bmfont:"Segoe UI",Arial,system-ui,sans-serif;
 font-family:var(--bmfont)!important;color:#344b5a!important}
:host :is(header,main,section,article,.panel,.metric,.notice,.row,.fields),
:host :is(h1,h2,h3,h4,h5,p,button,summary,label,input,select,textarea,li,span,small,th,td){
 font-family:var(--bmfont)!important}
:host #bm252-main-nav button[aria-selected="true"],
:host #bm252-main-nav button.active,:host button.primary:not(.danger),:host .subtabs button.active{
 background:#1687d8!important;border-color:#1687d8!important;color:#fff!important;box-shadow:none!important}
:host #bm252-main-nav button:not([aria-selected="true"]){
 background:#f8fbfe!important;border-color:#cadce8!important;color:#2d6b95!important}
:host #bm252-module-nav{background:#f0f7fc!important;border-color:#d8e6ee!important}
:host #bm252-module-nav button[aria-current="page"],
:host #bm252-module-nav button.active,
:host button[aria-pressed="true"]:not(.primary):not(.danger){
 background:#e8f4fc!important;border-color:#1687d8!important;color:#166eaa!important}
:host #calTitle,:host #calendarioControle>.panel>h2{color:#316486!important}
:host #calendarioControle .bm240-day.selected,
:host #calendarioControle .bm240-day[aria-selected="true"]{
 background:#e8f5fd!important;border-color:#1687d8!important;outline:2px solid #1687d8!important}
:host #calendarioControle .bm240-day[data-bm252-state="done"]{
 background:#eff8fe!important;border-color:#84bde5!important}
:host #calendarioControle .bm240-day[data-bm252-state="planned"]{
 background:#fff8ed!important;border-color:#d6ba84!important}
:host #calendarioControle .bm240-day[data-bm252-state="both"]{
 background:linear-gradient(135deg,#eff8fe,#fff8ed)!important;border-color:#b3c6d6!important}
:host #calendarioControle .bm252-dots .done,
:host #bm252-legend .done i,:host .bar,:host .progress>i{background:#1687d8!important}
:host .panel,:host .metric{border-color:#dce6ed!important;box-shadow:none!important}
:host .panel :is(p,li,td),:host .metric{color:#344b5a!important}
:host .notice{background:#f0f7fc!important;border-left-color:#1687d8!important}
:host :is(input[type="checkbox"],input[type="radio"],input[type="range"]){accent-color:#1687d8!important}
:host :is(button,input,select,textarea,summary):focus-visible{
 outline:2px solid #6bb8e8!important;outline-offset:2px!important}
:host :is(dialog,[role="dialog"],.modal,.popup){font-family:var(--bmfont)!important;
 color:#344b5a!important;background:#fff!important;border-color:#dce6ed!important}
:host :is(button,summary,[role="tab"])>svg:not([data-technical]){
 width:15px!important;height:15px!important;stroke-width:1.5!important}
`;
function apply(){
 const root=document.getElementById('bm240-native-host')?.shadowRoot;if(!root)return false;
 let style=root.getElementById(key);
 if(!style){style=document.createElement('style');style.id=key;style.textContent=css}
 if(root.lastElementChild!==style)root.append(style);
 return true
}
for(const event of ['bm240-study-mounted','bm252-study-ready','bm253-calendar-compact-ready']){
 document.addEventListener(event,apply)
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',apply,{once:true});
else apply();
window.BM287Theme=Object.freeze({refresh:apply});
})();

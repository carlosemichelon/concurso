/* V292 — mesma hierarquia tipográfica nas telas encapsuladas do Controle.
 * Camada de CSS apenas; não modifica calendário, SRS, eventos, Drive ou estados. */
(function(){
'use strict';
if(window.BM292VisualSystem)return;
const id='bm292-visual-system';
const stylesheet=`
:host{
 --bm-ui-font:"Segoe UI",Arial,system-ui,sans-serif;
 --accent:#1687d8;--ink:#1c2730;--sub:#445967;--bg:#edf0f1;
 --paper:#fff;--line:#b9c9d3;
 color:#1c2730!important;font:400 13px/1.55 var(--bm-ui-font)!important
}
:host :is(header,main,section,article,.panel,.metric,.row,.fields,.notice,.subtabs),
:host :is(h1,h2,h3,h4,h5,h6,button,input,select,textarea,summary,label,
 p,span,small,strong,li,td,th){
 font-family:var(--bm-ui-font)!important
}
:host header h1{color:#203440!important;font-size:16px!important;font-weight:700!important}
:host main :is(h2,h3){color:#203440!important;font-weight:700!important;line-height:1.4!important}
:host main h2{font-size:16px!important}
:host main h3{font-size:14px!important}
:host .panel :is(p,li,td,th),:host .metric :is(span,small){
 color:#1c2730!important;font-size:12.5px!important;line-height:1.55!important
}
:host #bm252-main-nav button,:host #bm252-module-nav button,
:host .subtabs button,:host button{
 font:600 12px/1.4 var(--bm-ui-font)!important
}
:host #bm252-main-nav button[aria-selected="true"],
:host #bm252-main-nav button.active,:host button.primary:not(.danger),
:host .subtabs button.active{
 color:#fff!important;background:#1687d8!important;border-color:#1687d8!important
}
:host #bm252-module-nav button[aria-current="page"],
:host #bm252-module-nav button.active{
 color:#176c9b!important;background:#e9f5fc!important;border-color:#1687d8!important
}
:host :is(input:not([type="checkbox"]):not([type="radio"]),select,textarea){
 color:#1c2730!important;font:400 12.5px/1.45 var(--bm-ui-font)!important
}
:host .bm240-weeklabels span,:host #calTitle{
 font-family:var(--bm-ui-font)!important;color:#334e62!important
}
:host .bm240-weeklabels span{font-size:11px!important}
:host #calTitle{font-size:14px!important;font-weight:700!important}
:host #calendarioControle .bm240-day :is(b,span,small){
 font-family:var(--bm-ui-font)!important;font-size:11px!important;color:#1c2730!important
}
:host :is(dialog,[role="dialog"],.modal,.popup){
 color:#1c2730!important;font:400 13px/1.55 var(--bm-ui-font)!important
}
:host :is(dialog,[role="dialog"],.modal,.popup) :is(h2,h3){
 color:#203440!important;font-weight:700!important
}
:host :is(dialog,[role="dialog"],.modal,.popup) :is(p,label,button,select,input,textarea){
 font-family:var(--bm-ui-font)!important
}
@media(max-width:700px){
 :host #bm252-main-nav button,:host #bm252-module-nav button{font-size:11px!important}
 :host main h2{font-size:15px!important}
}
`;
function apply(){
 const root=document.getElementById('bm240-native-host')?.shadowRoot;
 if(!root)return false;
 let style=root.getElementById(id);
 if(!style){style=document.createElement('style');style.id=id;style.textContent=stylesheet}
 if(root.lastElementChild!==style)root.append(style);
 return true;
}
for(const event of ['bm240-study-mounted','bm252-study-ready','bm253-calendar-compact-ready']){
 document.addEventListener(event,apply);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',apply,{once:true});
else apply();
window.BM292VisualSystem=Object.freeze({refresh:apply});
})();

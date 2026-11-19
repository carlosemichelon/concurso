/* V286 — mesmíssima fonte e azul no Controle isolado, inclusive calendário.
   A folha visual é colocada após as camadas V252/V253 quando são montadas.
   Sem observação contínua, escrita de dados ou mudanças no SRS. */
(function(){
'use strict';
if(window.BM286StudyBlue)return;
const id='bm286-blue-ui';
const rules=`
:host{
 --bm-ui-font:"Segoe UI",Arial,system-ui,sans-serif;--accent:#1687d8;
 --bg:#edf0f1;--paper:#fff;--ink:#344b5a;--sub:#6c7f8d;--line:#dce5eb;
 font:13px/1.5 var(--bm-ui-font)!important;color:#344b5a!important;background:#edf0f1!important
}
:host :is(header,main,section,article,.panel,.metric,.row,.item,.actions,.fields,.grid,.twocol,.notice,.hint,.status,.tag),
:host :is(h1,h2,h3,h4,h5,h6,p,span,small,strong,b,label,legend,summary,button,a,input,select,textarea,option,table,th,td,li){
 font-family:var(--bm-ui-font)!important
}
:host :is(pre,code,kbd,samp,math,math *){font-family:revert!important}
:host header{background:#fff!important;color:#344b5a!important;border-bottom-color:#e1e8ed!important}
:host header h1,:host main :is(h2,h3){color:#315f7f!important}
:host .panel,:host .metric{background:#fff!important;border-color:#dfe8ee!important;border-radius:5px!important;box-shadow:none!important}
:host button:not(.danger){
 color:#236b98!important;background:#fff!important;border-color:#c7d9e6!important;
 border-radius:5px!important;box-shadow:none!important
}
:host button:not(.danger):hover{color:#126da8!important;background:#f0f8fe!important}
:host button.primary:not(.danger),
:host #bm252-main-nav button[aria-selected="true"],
:host #bm252-main-nav button.active,:host .subtabs button.active{
 color:#fff!important;background:#1687d8!important;border-color:#1687d8!important;box-shadow:none!important
}
:host #bm252-main-nav button[aria-selected="true"]:hover,
:host button.primary:not(.danger):hover{color:#fff!important;background:#116ea9!important;border-color:#116ea9!important}
:host #bm252-main-nav button:not([aria-selected="true"]){
 color:#326a91!important;background:#f8fbfd!important;border-color:#c9dce8!important
}
:host #bm252-module-nav{background:#f1f7fb!important;border-color:#d9e6ef!important;border-radius:5px!important}
:host #bm252-module-nav button[aria-current="page"],:host #bm252-module-nav button.active{
 color:#126ba0!important;background:#e2f1fb!important;border-color:#1687d8!important
}
:host #bm252-calendar-head{border-color:#dce8f0!important}
:host #calTitle,:host .bm240-weeklabels span{color:#285f85!important}
:host #calendarioControle .bm240-day{color:#2c5875!important;background:#fff!important;border-color:#c8d9e5!important;border-radius:5px!important}
:host #calendarioControle .bm240-day[data-bm252-state="done"]{border-color:#78bbe7!important;background:#edf7fe!important}
:host #calendarioControle .bm240-day[data-bm252-state="planned"]{border-color:#d9bd80!important;background:#fffaf0!important}
:host #calendarioControle .bm240-day[data-bm252-state="both"]{border-color:#9db9d8!important;background:linear-gradient(135deg,#ebf6ff,#fff9ef)!important}
:host #calendarioControle .bm240-day.selected,
:host #calendarioControle .bm240-day[aria-selected="true"]{
 outline:2px solid #1687d8!important;outline-offset:0!important;
 border-color:#1687d8!important;background:#e5f3fc!important
}
:host #calendarioControle .bm252-dots .done,:host #bm252-legend .done i{background:#1687d8!important}
:host #bm252-legend .both i{background:linear-gradient(90deg,#1687d8 50%,#cf9241 50%)!important}
:host .progress>i,:host .bar{background:#1687d8!important}
:host .notice{background:#f1f7fc!important;border-left-color:#1687d8!important;color:#395971!important}
:host .tag{background:#eaf4fb!important;color:#2b6c96!important}
:host :is(input,select,textarea){font-family:var(--bm-ui-font)!important;color:#344b5a!important;background:#fff!important;border:1px solid #c5d9e7!important;border-radius:5px!important}
:host :is(input[type="checkbox"],input[type="radio"]){accent-color:#1687d8!important}
:host :is(button,input,select,textarea,[role="tab"],summary):focus-visible{outline:2px solid #63b1e5!important;outline-offset:2px!important}
:host :is(button,summary,[role="tab"])>svg:not([data-technical]),
:host :is(button,summary,[role="tab"]) .icon svg{
 width:15px!important;height:15px!important;stroke-width:1.5!important;
 stroke-linecap:round!important;stroke-linejoin:round!important
}
:host :is(button,summary,[role="tab"]){font-variant-emoji:text}
:host :is(dialog,[role="dialog"],.modal,.popup){
 font-family:var(--bm-ui-font)!important;color:#344b5a!important;background:#fff!important;border-color:#cbdfe9!important
}
:host :is(dialog,[role="dialog"],.modal,.popup) :is(h2,h3,strong){color:#326f98!important}
:host :is(dialog,[role="dialog"],.modal,.popup) :is(button,input,select,textarea){
 font-family:var(--bm-ui-font)!important;border-radius:5px!important
}
:host :is(dialog,[role="dialog"],.modal,.popup) button.primary:not(.danger){
 background:#1687d8!important;color:#fff!important;border-color:#1687d8!important
}
@media(max-width:680px){
 :host #bm252-main-nav button{font-size:11px!important;min-width:0!important}
 :host #bm252-module-nav button{font-size:11px!important}
}
`;
let inserted=false;
function refresh(){
 const root=document.getElementById('bm240-native-host')?.shadowRoot;if(!root)return false;
 let style=root.getElementById(id);
 if(!style){style=document.createElement('style');style.id=id;style.textContent=rules}
 if(root.lastElementChild!==style)root.append(style);
 inserted=true;return true;
}
for(const e of ['bm240-study-mounted','bm252-study-ready','bm253-calendar-compact-ready']){
 document.addEventListener(e,refresh);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',refresh,{once:true});
else refresh();
window.BM286StudyBlue=Object.freeze({refresh,get ready(){return inserted}});
})();

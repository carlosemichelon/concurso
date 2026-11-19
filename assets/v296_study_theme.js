/* Banco Mestre V296 — tipografia e superfícies do Controle de Estudos.
 * Shadow DOM isolado: somente CSS, sem mudar estado, SRS ou registros.
 */
(function(){
'use strict';
if(window.BM296UnifiedStudyTheme)return;
const id='bm296-unified-study-theme';
const rules=`
:host{
 --bm-ui-font:"Segoe UI",Arial,system-ui,sans-serif;
 --accent:#147fbf;--bg:#edf0f2;--paper:#fff;
 --ink:#111a22;--sub:#334a5a;--line:#bfcfd9;
 color:#111a22!important;
 font:400 14px/1.55 var(--bm-ui-font)!important;
}
:host :is(header,main,section,article,.panel,.metric,.notice,.row,.fields,.subtabs),
:host :is(h1,h2,h3,h4,h5,h6,p,span,small,strong,button,a,summary,
 label,input,select,textarea,li,th,td){
 font-family:var(--bm-ui-font)!important;
}
:host main{background:#edf0f2!important}
:host :is(.panel,.metric,.item){
 background:#fff!important;border:1px solid #bfcfd9!important;
 border-radius:0!important;box-shadow:none!important;
}
:host header{
 background:#fff!important;border-bottom:1px solid #d5e2e9!important;
 color:#111a22!important;
}
:host header h1,:host main h2,:host main h3{
 color:#15222d!important;font-weight:700!important;line-height:1.4!important;
}
:host header h1,:host main h2{font-size:16px!important}
:host main h3{font-size:14px!important}
:host .panel :is(p,li,th,td),:host .metric :is(span,small){
 color:#111a22!important;font-size:13px!important;line-height:1.6!important
}
:host .metric strong{
 font-family:var(--bm-ui-font)!important;color:#15222d!important;
 font-size:21px!important;font-weight:700!important;line-height:1.3!important
}
:host button:not(.danger),:host select,:host input:not([type="checkbox"]),:host textarea{
 border-radius:0!important;
 font-family:var(--bm-ui-font)!important;
 font-size:12.5px!important;line-height:1.4!important
}
:host :is(input:not([type="checkbox"]):not([type="radio"]),select,textarea){
 color:#111a22!important;background:#fff!important;
 border:1px solid #bfcfd9!important;min-height:34px!important
}
:host #bm252-main-nav button,:host #bm252-module-nav button{
 font:650 12.5px/1.45 var(--bm-ui-font)!important
}
:host #bm252-main-nav button[aria-selected="true"],
:host #bm252-main-nav button.active,
:host button.primary:not(.danger),:host .subtabs button.active{
 background:#147fbf!important;border-color:#147fbf!important;color:#fff!important
}
:host #bm252-main-nav button:not([aria-selected="true"]){
 background:#f8fbfd!important;border-color:#cbd9e2!important;color:#20587b!important
}
:host #bm252-module-nav{
 background:#f6f9fb!important;border-color:#d2e0e9!important;border-radius:0!important
}
:host #bm252-module-nav button[aria-current="page"],
:host #bm252-module-nav button.active{
 color:#125e94!important;background:#eaf4fb!important;border-color:#147fbf!important
}
:host #calTitle,:host .bm240-weeklabels span{
 font-family:var(--bm-ui-font)!important;color:#233e50!important
}
:host #calTitle{font-size:14px!important;font-weight:700!important}
:host .bm240-weeklabels span{font-size:12px!important}
:host #calendarioControle .bm240-day{
 background:#fff!important;border-color:#bdcfdc!important;border-radius:0!important
}
:host #calendarioControle .bm240-day :is(b,span,small){
 color:#162a37!important;font:550 12px/1.4 var(--bm-ui-font)!important
}
:host #calendarioControle .bm240-day.selected,
:host #calendarioControle .bm240-day[aria-selected="true"]{
 background:#eaf4fb!important;border-color:#147fbf!important;outline:2px solid #147fbf!important
}
:host #calendarioControle .bm240-day[data-bm252-state="done"]{
 background:#ecf6fc!important;border-color:#85c0e6!important
}
:host #calendarioControle .bm240-day[data-bm252-state="planned"]{
 background:#fff9ef!important;border-color:#d8bb7c!important
}
:host #calendarioControle .bm240-day[data-bm252-state="both"]{
 background:linear-gradient(135deg,#ecf6fc,#fff9ef)!important;border-color:#9bbccf!important
}
:host :is(input[type="checkbox"],input[type="radio"],input[type="range"]){
 accent-color:#147fbf!important
}
:host .progress>i,:host .bar{background:#147fbf!important}
:host .notice{background:#f7fafc!important;border-color:#d3e1e9!important;color:#334a5a!important}
:host :is(dialog,[role="dialog"],.modal,.popup){
 color:#111a22!important;background:#fff!important;border:1px solid #bfcfd9!important;
 border-radius:0!important;font-family:var(--bm-ui-font)!important
}
:host :is(dialog,[role="dialog"],.modal,.popup) :is(h2,h3){
 color:#15222d!important;font-weight:700!important
}
:host :is(button,input,select,textarea,summary,a):focus-visible{
 outline:2px solid #299ad5!important;outline-offset:2px!important
}
:host :is(code,pre,kbd,samp,math,math *){font-family:revert!important}
@media(max-width:700px){
 :host #bm252-main-nav button,:host #bm252-module-nav button{
  font-size:11.5px!important
 }
 :host main h2{font-size:15.5px!important}
 :host .panel :is(p,li,td,th){font-size:12.5px!important}
}
`;
function apply(){
 const root=document.getElementById('bm240-native-host')?.shadowRoot;
 if(!root)return false;
 let style=root.getElementById(id);
 if(!style){style=document.createElement('style');style.id=id;style.textContent=rules}
 if(root.lastElementChild!==style)root.append(style);
 return true;
}
for(const event of ['bm240-study-mounted','bm252-study-ready','bm253-calendar-compact-ready']){
 document.addEventListener(event,apply);
}
if(document.readyState==='loading'){
 document.addEventListener('DOMContentLoaded',apply,{once:true});
}else apply();
window.BM296UnifiedStudyTheme=Object.freeze({refresh:apply});
})();
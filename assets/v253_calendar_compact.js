/* Banco Mestre V253 — calendário em evidência. Apenas rearranjo visual,
   preservando handlers, IDs, sessões, calendário e motor de dados V245. */
(function(){
'use strict';
if(window.BM253CalendarCompact)return;
let installed=false,root=null;
function create(tag,text){
 const e=document.createElement(tag);if(text!==undefined)e.textContent=text;return e;
}
function install(){
 if(installed)return;
 const host=document.getElementById('bm240-native-host');
 const target=host?.shadowRoot;
 if(!target?.getElementById('bm252-main-nav')||!target.getElementById('calGrid')||!window.BM252StudyFlow?.ready)return;
 root=target;
 const pane=root.getElementById('calendarioControle');
 const panel=pane?.querySelector(':scope > .panel');
 const grid=root.getElementById('calGrid');
 const toolbar=panel?.querySelector(':scope > .actions');
 const hero=root.getElementById('bm252-calendar-head');
 const heading=panel?.querySelector(':scope > h2');
 const srs=panel?.querySelector(':scope > .notice');
 const help=panel?.querySelector(':scope > p.muted');
 if(!panel||!grid||!toolbar||!hero||!heading||!srs){return;}
 const style=create('style');style.id='bm253-compact-style';style.textContent="/* V253 — prioridade visual: calendario. CSS no Shadow DOM do Controle. */\n:host{line-height:1.4}\nheader{padding:7px 10px 5px!important}\nheader h1{font-size:17px!important;line-height:1.2!important;margin:0 0 2px!important}\nheader>p{display:none!important}\nmain{padding:6px 9px 22px!important}\n#bm252-main-nav{gap:4px!important;margin:2px 0 0!important}\n#bm252-main-nav button{min-height:40px!important;padding:6px 6px!important;font-size:12px!important;border-radius:7px!important}\n#bm252-module-nav{gap:5px!important;margin:0 0 7px!important;padding:4px 7px!important;border-radius:7px!important}\n#bm252-module-nav>span{font-size:10px!important}\n#bm252-module-nav button{min-height:38px!important;padding:5px 9px!important;font-size:11px!important;border-radius:6px!important}\n#calendarioControle>.panel{padding:8px 10px!important;margin:0 0 8px!important;border-radius:9px!important}\n#calendarioControle>.panel>h2{font-size:16px!important;line-height:1.3!important;margin:0 0 5px!important}\n#calendarioControle>.panel>.actions{display:flex;align-items:center;gap:4px!important;margin:0 0 6px!important}\n#calendarioControle>.panel>.actions button{min-height:38px!important;padding:6px 9px!important;font-size:11px!important;border-radius:6px!important;line-height:1.1!important}\n#calTitle{font-size:13px!important;font-weight:750;min-width:100px;line-height:1.2;margin:0 5px 0 0!important;color:#185960}\n#calGrid{margin:0!important}\n#calendarioControle .bm240-weeklabels{display:grid!important;grid-template-columns:repeat(7,minmax(0,1fr))!important;gap:3px;margin:0 0 2px!important}\n#calendarioControle .bm240-weeklabels span{text-align:center;font-size:10px!important;padding:2px 0!important}\n#calendarioControle .bm240-days{gap:4px!important}\n#calendarioControle .bm240-day{min-height:49px!important;padding:4px 3px!important;gap:1px!important;border-radius:6px!important}\n#calendarioControle .bm240-day b{font-size:11px!important;line-height:1.1!important}\n#calendarioControle .bm240-day>span:not(.bm252-dots){font-size:10px!important;line-height:1.2!important}\n#calendarioControle .bm240-day small{font-size:9px!important;line-height:1.1!important}\n#calendarioControle .bm240-pad{min-height:45px!important}\n#calendarioControle .bm252-dots{margin-top:1px!important;gap:3px!important}\n#calendarioControle .bm252-dots i{width:6px!important;height:6px!important}\n#bm252-calendar-head{display:flex;flex-wrap:wrap;align-items:center;gap:5px 12px;border:0!important;border-top:1px solid #e1ebe8!important;background:transparent!important;border-radius:0!important;padding:7px 0 0!important;margin:6px 0 0!important}\n#bm252-calendar-head>h3,#bm252-calendar-head>p{display:none!important}\n#bm252-month-stats{display:flex;flex-wrap:wrap;gap:4px!important;margin:0!important;align-items:center}\n#bm252-month-stats span{font-size:10px!important;line-height:1.2!important;padding:3px 6px!important;border-radius:5px!important}\n#bm252-legend{display:flex;gap:9px!important;margin:0!important;align-items:center;font-size:10px!important;line-height:1.3!important}\n#bm252-legend i{width:7px!important;height:7px!important}\n#bm253-srs-details{margin:6px 0 0;border-top:1px solid #e2ebe8;padding:3px 0 0}\n#bm253-srs-details>summary{font-size:11px;color:#4b6569;font-weight:650;cursor:pointer;min-height:34px;display:flex;align-items:center}\n#bm253-srs-details>.notice{margin:2px 0 5px!important;padding:7px 9px!important;font-size:11px!important}\n#bm253-srs-details>p{font-size:11px!important;margin:2px 0 6px!important;color:#637779!important}\n#bm253-srs-details .actions{margin:4px 0 0!important}\n#bm253-srs-details button{min-height:38px!important;font-size:11px!important;padding:5px 8px!important}\n#calendarioControle>.panel:nth-of-type(2){padding:9px 11px!important}\n#calDayTitle{font-size:14px!important;margin:0 0 5px!important}\n#calDaySummary{font-size:11px!important;line-height:1.35!important}\n#bm252-realized{margin:6px 0 9px!important}\n#bm252-realized h3,#bm252-planned-title{font-size:13px!important;margin:7px 0 5px!important}\n.bm252-day-totals{margin:5px 0 7px!important;gap:4px!important}\n.bm252-day-totals span{font-size:10px!important;padding:3px 6px!important}\n.bm252-record{padding:7px 9px!important;margin-bottom:5px!important;border-radius:6px!important}\n.bm252-record strong{font-size:12px!important}\n.bm252-record p,.bm252-record small{font-size:10px!important;margin:2px 0!important}\n#bm252-plan-add{margin-top:7px!important;padding:0 9px 6px!important}\n#bm252-plan-add>summary{min-height:40px!important;padding:8px 0!important;font-size:11px!important}\n#bm252-plan-add .fields{gap:7px!important}\n#bm252-plan-add input,#bm252-plan-add select{min-height:38px!important}\n@media(max-width:800px){\n header{padding:6px 7px 5px!important}\n header h1{font-size:16px!important}\n main{padding:5px 6px 18px!important}\n #bm252-main-nav button{min-height:40px!important;font-size:11px!important}\n #bm252-module-nav{margin-bottom:5px!important;padding:3px 5px!important}\n #bm252-module-nav>span{display:none!important}\n #bm252-module-nav button{min-height:39px!important;font-size:10.5px!important;padding:5px 8px!important}\n #calendarioControle>.panel{padding:6px!important;margin:0 0 7px!important}\n #calendarioControle>.panel>h2{font-size:14px!important;margin:0 0 4px!important}\n #calendarioControle>.panel>.actions{gap:3px!important;margin:0 0 5px!important}\n #calendarioControle>.panel>.actions button{min-height:39px!important;padding:6px 7px!important;font-size:10px!important}\n #calTitle{font-size:12px!important;min-width:120px}\n #calendarioControle .bm240-days{grid-template-columns:repeat(7,minmax(0,1fr))!important;gap:3px!important}\n #calendarioControle .bm240-weeklabels{gap:3px}\n #calendarioControle .bm240-day{min-height:47px!important;padding:3px 1px!important;gap:1px!important}\n #calendarioControle .bm240-day b{font-size:10px!important}\n #calendarioControle .bm240-day>span:not(.bm252-dots){font-size:8.5px!important;white-space:nowrap}\n #calendarioControle .bm240-day small{display:none!important}\n #calendarioControle .bm240-pad{min-height:42px!important}\n #bm252-calendar-head{gap:4px 8px;padding:6px 0 0!important}\n #bm252-month-stats span{font-size:9.5px!important;padding:3px 5px!important}\n #bm252-legend{font-size:9.5px!important;gap:7px!important}\n #bm253-srs-details>summary{min-height:33px!important;font-size:10.5px}\n}\n@media(max-width:380px){\n #calendarioControle>.panel>.actions button{padding:5px 6px!important;font-size:9.5px!important}\n #calTitle{flex:1 1 100%;margin:0!important}\n #calendarioControle .bm240-day{min-height:45px!important}\n}\n@media(prefers-reduced-motion:reduce){#calendarioControle *{scroll-behavior:auto!important}}\n";root.append(style);
 // Order: heading -> compact period controls -> month grid -> summary/legend -> optional SRS help.
 heading.textContent='Calendário';
 panel.prepend(heading);
 const title=root.getElementById('calTitle');
 if(title)toolbar.prepend(title);
 heading.after(toolbar);
 toolbar.after(grid);
 grid.after(hero);
 const info=create('details');info.id='bm253-srs-details';
 const summary=create('summary','Informações de revisões SRS (consulta)');
 info.append(summary);
 info.append(srs);
 if(help)info.append(help);
 hero.after(info);
 // Keep a clean one-line interpretation; textual context remains in the collapsible area.
 const intro=hero.querySelector('p');
 if(intro)intro.textContent='Toque em um dia para consultar estudos e planejamento.';
 const h=hero.querySelector('h3');if(h)h.textContent='Resumo e legenda';
 // The native V245 renderer and V252 calendar decorators continue running unchanged.
 installed=true;
 document.dispatchEvent(new CustomEvent('bm253-calendar-compact-ready',{
  detail:{layout:'calendar_first',srs_notice:'collapsible_below_calendar',written_study_data:false}
 }));
}
function ready(){install()}
document.addEventListener('bm252-study-ready',ready);
document.addEventListener('bm240-study-mounted',ready);
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',ready,{once:true});
else ready();
window.BM253CalendarCompact=Object.freeze({get ready(){return installed}});
})();
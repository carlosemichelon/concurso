
/* V255 — navegação e calendário */
/* V255 — Fluxo de estudos em 3 abas (camada de leitura e navegação).
   Fonte: armazenamento local do Controle V245. Sem gravacoes, sem eventos SRS. */
(function(){
'use strict';
if(window.BM252StudyFlow)return;
const account=window.BMAccountRuntime;if(account?.mode!=='central')return;
const localStorage=account.local;
const KEY='BM245_CONTROLE_ESTUDOS';
const GROUPS=[
 {id:'ver',label:'Ver estudado',first:'calendarioControle',modules:[['calendarioControle','Calendário'],['historico','Histórico completo']]},
 {id:'organizar',label:'Organizar',first:'planejamento',modules:[['planejamento','Metas e disciplinas'],['registro','Registro manual'],['revisoes','Revisões de conteúdo'],['ciclo','Ciclo de estudos'],['backup','Dados e backup']]},
 {id:'relatorios',label:'Resumo e relatórios',first:'painel',modules:[['painel','Resumo'],['relatorios','Relatórios detalhados']]}
];
const allModules=GROUPS.flatMap(g=>g.modules.map(x=>x[0]));
let root=null,installed=false,mainNav=null,moduleNav=null;
const $=id=>root?.getElementById(id);
const el=(tag,cl,txt)=>{const x=document.createElement(tag);if(cl)x.className=cl;if(txt!==undefined)x.textContent=txt;return x};
const localDate=()=>{const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')};
const duration=n=>{const m=Math.round(Math.max(0,Number(n)||0));return Math.floor(m/60)+'h '+String(m%60).padStart(2,'0')+'min'};
const shortDuration=n=>{const m=Math.round(Math.max(0,Number(n)||0));return m>=60?Math.floor(m/60)+'h'+(m%60?String(m%60).padStart(2,'0'):''):m+'m'};
const prettyDay=x=>/^\d{4}-\d\d-\d\d$/.test(x)?x.split('-').reverse().join('/'):(x||'');
function source(){
 try{
  const txt=localStorage.getItem(KEY);
  if(!txt)return {state:'empty',subjects:[],sessions:[],plans:[],reviews:[],cycle:[]};
  const v=JSON.parse(txt);
  if(v?.schema!==1||!Array.isArray(v.subjects)||!Array.isArray(v.sessions)||!Array.isArray(v.reviews))return {state:'invalid',subjects:[],sessions:[],plans:[],reviews:[],cycle:[]};
  return {...v,plans:Array.isArray(v.plans)?v.plans:[],cycle:Array.isArray(v.cycle)?v.cycle:[],state:'ok'};
 }catch{return {state:'invalid',subjects:[],sessions:[],plans:[],reviews:[],cycle:[]}}
}
function getGroup(moduleId){return GROUPS.find(g=>g.modules.some(x=>x[0]===moduleId))}
function currentModule(){return root?.querySelector('section.pane.active')?.id||''}
function navTo(moduleId){
 if(!allModules.includes(moduleId))return;
 const b=root.querySelector('#tabs button[data-tab="'+moduleId+'"]');
 if(b)b.click();
 syncNavigation();
}
function openGroup(groupId){
 const group=GROUPS.find(x=>x.id===groupId);
 if(group)navTo(group.first);
}
function syncNavigation(){
 if(!installed)return;
 const current=currentModule();
 const g=getGroup(current)||GROUPS[0];
 for(const b of mainNav.querySelectorAll('button[data-group]')){
  const active=b.dataset.group===g.id;
  b.setAttribute('aria-selected',String(active));
  b.classList.toggle('active',active);
 }
 const expected=g.modules.map(x=>x[0]).join('|');
 if(moduleNav.dataset.modules!==expected){
  moduleNav.replaceChildren(el('span','','Dentro de '+g.label+':'));
  for(const [id,label] of g.modules){
   const b=el('button','',label);
   b.type='button';b.dataset.bm252Module=id;
   b.addEventListener('click',()=>navTo(id));
   moduleNav.append(b);
  }
  moduleNav.dataset.modules=expected;
 }
 for(const b of moduleNav.querySelectorAll('button')){
  const active=b.dataset.bm252Module===current;
  if(active)b.setAttribute('aria-current','page');
  else b.removeAttribute('aria-current');
 }
 if(current==='calendarioControle')refreshCalendar();
}
function byDate(data,day){
 return {
  done:data.sessions.filter(s=>!s.deletedAt&&s.date===day),
  planned:data.plans.filter(p=>!p.deletedAt&&p.date===day)
 };
}
const nsum=(arr,key)=>arr.reduce((n,x)=>n+(Number(x[key])||0),0);
function subjectName(data,id){return data.subjects.find(s=>s.id===id)?.name||'Disciplina não identificada'}
function addChip(host,label){host.append(el('span','',label))}
function decorateCalendar(data){
 const grid=$('calGrid');if(!grid)return;
 const mode=root.querySelector('[data-cal-mode].active')?.dataset.calMode||'month';
 const days=grid.querySelector('.bm240-days');
 if(days)days.dataset.bm252Mode=mode;
 for(const b of grid.querySelectorAll('button[data-cal-day]')){
  const date=b.dataset.calDay,records=byDate(data,date),done=records.done,planned=records.planned;
  const st=done.length&&planned.length?'both':done.length?'done':planned.length?'planned':'none';
  b.dataset.bm252State=st;
  b.setAttribute('aria-label',prettyDay(date)+' — '+done.length+' sessão(ões) registrada(s), '+planned.length+' atividade(s) planejada(s)');
  const label=b.querySelector('b');
  if(label)label.textContent=String(Number(date.slice(8)));
  const time=b.querySelector('span:not(.bm252-dots)');
  if(time)time.textContent=done.length?shortDuration(nsum(done,'minutes')):'—';
  const small=b.querySelector('small');
  if(small)small.textContent=(done.length?done.length+' realizada(s)':'')+(done.length&&planned.length?' · ':'')+(planned.length?planned.length+' planejada(s)':'');
  const dots=el('span','bm252-dots');dots.setAttribute('aria-hidden','true');
  if(done.length)dots.append(el('i','done'));
  if(planned.length)dots.append(el('i','planned'));
  b.querySelector('.bm252-dots')?.remove();
  b.append(dots);
 }
}
function renderDay(data){
 const host=$('bm252-realized'),summary=$('bm252-day-meta');
 if(!host||!summary)return;
 const when=$('planDate')?.value||localDate();
 const {done,planned}=byDate(data,when);
 host.replaceChildren();
 const h=el('h3','','Realizado em '+prettyDay(when));
 host.append(h);
 if(data.state==='invalid'){
  host.append(el('p','bm252-warning','Os registros locais não puderam ser validados. Nenhum dado foi alterado.'));return;
 }
 const questions=nsum(done,'questions'),correct=nsum(done,'correct');
 summary.replaceChildren();
 addChip(summary,done.length+' sessão(ões) realizadas');
 addChip(summary,planned.length+' atividade(s) planejadas');
 addChip(summary,duration(nsum(done,'minutes'))+' registradas');
 if(questions)addChip(summary,correct+'/'+questions+' acertos');
 if(!done.length){
  host.append(el('p','bm252-day-empty','Nenhum estudo registrado para este dia no Controle de Estudos. Questões de outros chats ou cartões não são importados automaticamente.'));
 }else{
  for(const r of done.slice().sort((a,b)=>String(a.startTime||'').localeCompare(String(b.startTime||'')))){
   const card=el('article','bm252-record');
   card.append(el('strong','',subjectName(data,r.subjectId)+' · '+duration(r.minutes)));
   const path=[r.general,r.specific,r.subtopic,r.topic].map(x=>String(x||'').trim()).filter(Boolean);
   if(path.length)card.append(el('p','',path.join(' → ')));
   const detail=[r.startTime?'Início '+r.startTime:'',r.type||'',r.questions?String(r.correct||0)+'/'+r.questions+' acertos':''].filter(Boolean);
   if(detail.length)card.append(el('small','',detail.join(' · ')));
   if(r.notes){const note=el('p','',String(r.notes));card.append(note);}
   host.append(card);
  }
 }
}
function renderSummary(data){
 const host=$('bm252-month-stats');if(!host)return;
 host.replaceChildren();
 if(data.state==='invalid'){host.append(el('span','','Dados locais inválidos — nenhuma contagem exibida'));return}
 const current=$('calTitle')?.textContent||'',date=$('planDate')?.value||localDate();
 const mode=root.querySelector('[data-cal-mode].active')?.dataset.calMode||'month';
 let periodDates=new Set([...$('calGrid').querySelectorAll('button[data-cal-day]')].map(x=>x.dataset.calDay));
 if(!periodDates.size)periodDates=new Set([date]);
 const done=data.sessions.filter(s=>!s.deletedAt&&periodDates.has(s.date));
 const planned=data.plans.filter(p=>!p.deletedAt&&periodDates.has(p.date));
 addChip(host,duration(nsum(done,'minutes'))+' realizadas no período');
 addChip(host,done.length+' sessões');
 addChip(host,planned.length+' planejadas ('+planned.filter(x=>!x.doneAt).length+' pendentes)');
 const q=nsum(done,'questions');if(q)addChip(host,nsum(done,'correct')+'/'+q+' acertos');
}
function refreshCalendar(){
 if(!installed||!$('calGrid'))return;
 const data=source();
 renderSummary(data);decorateCalendar(data);renderDay(data);
}
function scheduleCalendarRefresh(){
 if(typeof queueMicrotask==='function')queueMicrotask(refreshCalendar);
 else Promise.resolve().then(refreshCalendar);
}
function install(){
 if(installed)return;
 const holder=document.getElementById('bm240-native-host'),target=holder?.shadowRoot;
 if(!target?.getElementById('tabs')||!target?.getElementById('calGrid')||!window.BM240ControlApp)return;
 root=target;
 const header=root.querySelector('header'),orig=$('tabs'),main=root.querySelector('main');
 if(!header||!orig||!main||allModules.some(id=>!orig.querySelector('button[data-tab="'+id+'"]')))return;
 const s=el('style');s.textContent="/* V252 — controle de estudos com tres areas principais. Estilos encapsulados no Shadow DOM. */\n:host{display:block;color:#17363d}\nheader{padding:13px 15px 10px!important}\nheader h1{font-size:21px!important;line-height:1.2;margin:0 0 4px!important}\nheader>p{font-size:12px!important;margin:0 0 12px!important;color:#54747b}\n#tabs{display:none!important}\n#bm252-main-nav{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:7px;margin:0}\n#bm252-main-nav button{min-width:0;min-height:46px;border:1px solid #c6dcda;border-radius:9px;background:#f6faf9;color:#325960;font-weight:750;font-size:13px;padding:8px 6px;white-space:normal}\n#bm252-main-nav button[aria-selected=\"true\"]{background:#16685f;border-color:#16685f;color:#fff;box-shadow:inset 0 -3px #115046}\n#bm252-main-nav button:focus-visible,#bm252-module-nav button:focus-visible{outline:3px solid #e6ad44;outline-offset:2px}\n#bm252-module-nav{display:flex;align-items:center;flex-wrap:wrap;gap:6px;margin:0 0 13px;padding:8px 10px;background:#edf4f3;border:1px solid #d6e4e1;border-radius:9px}\n#bm252-module-nav>span{font-size:11px;font-weight:750;color:#5b7478;margin-right:3px}\n#bm252-module-nav button{min-height:36px;font-size:11.5px;padding:7px 10px;background:#fff}\n#bm252-module-nav button[aria-current=\"page\"]{border-color:#388f84;color:#0e6258;background:#e2f1ec}\n#calendarioControle h2{font-size:18px!important}\n#bm252-calendar-head{padding:12px 14px 8px;background:#f7fbf9;border:1px solid #d8e9e2;border-radius:10px;margin:0 0 13px}\n#bm252-calendar-head h3{font-size:14px;margin:0 0 4px}\n#bm252-calendar-head p{font-size:11px;color:#587178;margin:0}\n#bm252-month-stats{display:flex;gap:6px;flex-wrap:wrap;margin:9px 0 6px}\n#bm252-month-stats span{font-size:11px;border:1px solid #d9e7e2;background:#fff;border-radius:7px;padding:5px 9px;line-height:1.3}\n#bm252-legend{display:flex;gap:14px;align-items:center;flex-wrap:wrap;margin-top:9px;font-size:11px;color:#4c6769}\n#bm252-legend b{display:inline-flex;align-items:center;gap:5px;font-weight:700}\n#bm252-legend i{display:inline-block;width:9px;height:9px;border-radius:50%;background:#237c67}\n#bm252-legend .plan i{background:#cf9241}\n#bm252-legend .both i{background:linear-gradient(90deg,#237c67 50%,#cf9241 50%)}\n#calendarioControle .bm240-day{position:relative;min-width:0}\n#calendarioControle .bm240-day[data-bm252-state=\"done\"]{border-color:#7db79f;background:#f4faf6}\n#calendarioControle .bm240-day[data-bm252-state=\"planned\"]{border-color:#dcbf82;background:#fdf9ef}\n#calendarioControle .bm240-day[data-bm252-state=\"both\"]{border-color:#9dbda7;background:linear-gradient(135deg,#f5fbf7,#fdf9ed)}\n#calendarioControle .bm240-day.selected{outline:2px solid #146b65;outline-offset:0;border-color:#146b65!important}\n#calendarioControle .bm252-dots{display:flex;justify-content:center;gap:4px;width:100%;align-items:center;margin-top:auto}\n#calendarioControle .bm252-dots i{display:inline-block;width:7px;height:7px;border-radius:50%}\n#calendarioControle .bm252-dots .done{background:#238165}\n#calendarioControle .bm252-dots .planned{background:#d2943b}\n#bm252-realized{margin:12px 0 16px}\n#bm252-realized h3,#bm252-planned-title{font-size:15px!important;margin:10px 0}\n.bm252-day-totals{display:flex;flex-wrap:wrap;gap:6px;margin:7px 0 10px}\n.bm252-day-totals span{font-size:11px;border:1px solid #dce8e5;padding:5px 8px;border-radius:7px}\n.bm252-record{padding:10px 12px;border:1px solid #e0e9e7;border-left:3px solid #237c67;background:#f8fbfa;border-radius:8px;margin-bottom:7px}\n.bm252-record strong{display:block;font-size:13px;color:#254f50}\n.bm252-record p{margin:3px 0;font-size:11px;color:#526f72;overflow-wrap:anywhere}\n.bm252-record small{font-size:10.5px;color:#547578}\n#bm252-plan-add{padding:0 12px 11px;border:1px solid #dce9e6;background:#fafdfb;border-radius:9px;margin-top:12px}\n#bm252-plan-add>summary{cursor:pointer;padding:12px 0;min-height:44px;font-size:12px;font-weight:700;color:#23675c}\n#bm252-plan-add form{padding-bottom:5px}\n#bm252-day-empty{font-size:12px;color:#647d7e}\n#calendarioControle .bm240-weeklabels span{text-align:center;font-size:10px;padding:5px 0}\n#calendarioControle .bm240-days{gap:5px}\n#calendarioControle .bm240-day{min-height:76px;gap:4px;align-items:center;padding:7px 4px}\n#calendarioControle .bm240-day b{font-size:12px}\n#calendarioControle .bm240-day>span:not(.bm252-dots){font-size:11px}\n#calendarioControle .bm240-day small{font-size:9px;text-align:center}\n#calendarioControle .bm240-days[data-bm252-mode=\"day\"]{grid-template-columns:1fr!important}\n#calendarioControle .bm240-days[data-bm252-mode=\"day\"] .bm240-day{min-height:82px;max-width:340px}\n@media(max-width:680px){\n header{padding:11px 9px 8px!important}\n header h1{font-size:19px!important}\n header>p{font-size:11px!important}\n #bm252-main-nav{gap:5px}\n #bm252-main-nav button{font-size:11px;min-height:44px;padding:8px 4px}\n #bm252-module-nav{overflow-x:auto;display:flex;flex-wrap:nowrap;gap:5px;padding:7px 6px;scrollbar-width:thin}\n #bm252-module-nav>span{display:none}\n #bm252-module-nav button{white-space:nowrap;flex:0 0 auto;min-height:39px;font-size:11px}\n main{padding:9px 8px 28px!important}\n #calendarioControle .panel{padding:10px 7px}\n #calendarioControle .bm240-weeklabels{display:grid!important;grid-template-columns:repeat(7,minmax(0,1fr));gap:2px}\n #calendarioControle .bm240-days{display:grid!important;grid-template-columns:repeat(7,minmax(0,1fr))!important;gap:3px}\n #calendarioControle .bm240-pad{display:block!important;min-height:49px;border-radius:5px}\n #calendarioControle .bm240-day{min-height:61px!important;max-width:100%;gap:2px;padding:5px 1px!important;border-radius:7px;overflow:hidden}\n #calendarioControle .bm240-day b{font-size:11px;line-height:1.15}\n #calendarioControle .bm240-day>span:not(.bm252-dots){font-size:9px;line-height:1.1;white-space:nowrap}\n #calendarioControle .bm240-day small{display:none!important}\n #calendarioControle .bm252-dots{gap:3px}\n #calendarioControle .bm252-dots i{width:6px;height:6px}\n #calendarioControle .bm240-days[data-bm252-mode=\"day\"]{grid-template-columns:1fr!important}\n #calendarioControle #calGrid+div{max-width:100%}\n #bm252-calendar-head{padding:9px 10px}\n #bm252-month-stats span{font-size:10px;padding:4px 6px}\n #calendarioControle #calTitle{display:block;width:100%;font-size:12px}\n .item-head{flex-wrap:wrap}\n .scroll{overflow-x:auto}\n}\n@media(prefers-reduced-motion:reduce){#bm252-module-nav{scroll-behavior:auto!important}}\n\n/* V254 — manter o cronômetro nativo no DOM para o relógio inferior,\n   mas NÃO exibir seu painel duplicado ao usuário. */\n#registro>.twocol{display:block!important;grid-template-columns:minmax(0,1fr)!important;max-width:100%!important}\n#registro>.twocol>.panel:first-child{display:block!important;width:100%!important;margin-bottom:12px}\n#registro>.twocol>.panel:nth-child(2){display:block!important;width:100%!important;max-width:none!important}\n#registro>.twocol>.panel:nth-child(2)>h2{font-size:17px!important}\n#bm252-main-nav{grid-template-columns:repeat(3,minmax(0,1fr))!important}\n#bm252-module-nav>span{font-size:10px!important}\n@media(max-width:680px){\n #registro>.twocol{display:block!important}\n #registro>.twocol>.panel:nth-child(2){padding:11px!important}\n #bm252-main-nav button{min-height:41px!important}\n}\n\n/* V255 — tres abas principais, com titulos legiveis e sem alterar o conteudo. */\n#bm252-main-nav{grid-template-columns:repeat(3,minmax(0,1fr))!important}\n#bm252-main-nav button{white-space:normal!important;line-height:1.2!important;min-width:0!important}\n@media(max-width:680px){\n #bm252-main-nav{gap:4px!important}\n #bm252-main-nav button{font-size:10.5px!important;min-height:43px!important;padding:7px 3px!important;overflow-wrap:break-word!important}\n}\n@media(max-width:375px){#bm252-main-nav button{font-size:10px!important;padding:6px 2px!important}}\n";root.prepend(s);
 orig.style.display='none';orig.setAttribute('aria-hidden','true');
 orig.setAttribute('aria-label','Navegação interna preservada para compatibilidade');
 mainNav=el('nav');mainNav.id='bm252-main-nav';mainNav.setAttribute('role','tablist');mainNav.setAttribute('aria-label','Três áreas principais do Controle de Estudos');
 for(const g of GROUPS){
  const b=el('button','',g.label);
  b.type='button';b.dataset.group=g.id;b.setAttribute('role','tab');
  b.addEventListener('click',()=>openGroup(g.id));
  mainNav.append(b);
 }
 header.append(mainNav);
 moduleNav=el('nav');moduleNav.id='bm252-module-nav';moduleNav.setAttribute('aria-label','Conteúdos dentro da área');
 main.prepend(moduleNav);
 const h1=header.querySelector('h1');if(h1)h1.textContent='Controle de Estudos';
 const subtitle=header.querySelector('p');
 if(subtitle)subtitle.textContent='Consulte o calendário em Ver estudado, planeje em Organizar e acompanhe o desempenho em Resumo e relatórios. Cronômetro e registro em Organizar.';
 const manualPanel=$('registro')?.querySelector(':scope > .twocol > .panel:nth-child(2)');
 if(manualPanel&&!manualPanel.querySelector('#bm254-manual-help')){
  const tip=el('p','', 'Use o cronômetro acima ou registre manualmente uma sessão. Ambos mantêm o histórico individual.');
  tip.id='bm254-manual-help';tip.style.cssText='font-size:11px;color:#53727a;margin:2px 0 12px;line-height:1.4';
  manualPanel.querySelector('h2')?.after(tip);
 }
 const pane=$('calendarioControle');
 const topPanel=pane.querySelector('.panel');
 if(topPanel){
  const hero=el('div');hero.id='bm252-calendar-head';
  hero.append(el('h3','','Calendário: realizado e planejado'));
  hero.append(el('p','','Selecione qualquer dia para ver sessões registradas e atividades planejadas. O calendário não presume estudos não registrados.'));
  const metrics=el('div');metrics.id='bm252-month-stats';hero.append(metrics);
  const legend=el('div');legend.id='bm252-legend';
  for(const [name,label] of [['done','Realizado'],['plan','Planejado'],['both','Ambos']]){
   const item=el('b',name);item.append(el('i'),document.createTextNode(label));legend.append(item);
  }
  hero.append(legend);topPanel.prepend(hero);
  const oldTitle=topPanel.querySelector('h2');if(oldTitle)oldTitle.textContent='Veja o que estudou';
 }
 const dayPanel=$('calDayTitle')?.closest('.panel');
 if(dayPanel){
  const sum=$('calDaySummary');
  const meta=el('div','bm252-day-totals');meta.id='bm252-day-meta';
  sum?.after(meta);
  const studied=el('div');studied.id='bm252-realized';
  meta.after(studied);
  const planned=$('calPlans');
  if(planned){
   const title=el('h3');title.id='bm252-planned-title';title.textContent='Planejado para este dia';
   planned.before(title);
  }
  const form=$('planForm');
  if(form){
   const wrap=el('details');wrap.id='bm252-plan-add';
   const summ=el('summary','','Adicionar atividade planejada');
   form.before(wrap);wrap.append(summ,form);if(planned)planned.after(wrap);
  }
 }
 const previousCal=$('calGrid');
 const gridObs=new MutationObserver(scheduleCalendarRefresh);
 gridObs.observe(previousCal,{childList:true,subtree:false});
 const plans=$('calPlans');
 if(plans)new MutationObserver(scheduleCalendarRefresh).observe(plans,{childList:true,subtree:false});
 const title=$('calDayTitle');
 if(title)new MutationObserver(scheduleCalendarRefresh).observe(title,{childList:true,characterData:true,subtree:true});
 const paneObs=new MutationObserver(syncNavigation);
 for(const sec of root.querySelectorAll('section.pane'))
  paneObs.observe(sec,{attributes:true,attributeFilter:['class']});
 window.addEventListener('bm240-study-changed',scheduleCalendarRefresh);
 window.addEventListener('storage',e=>{if(e.key===KEY)scheduleCalendarRefresh()});
 document.addEventListener('visibilitychange',()=>{if(!document.hidden)scheduleCalendarRefresh()});
 // O motor V245 continua responsavel por editar e salvar. Esta camada so consulta.
 installed=true;
 navTo('calendarioControle');
 syncNavigation();scheduleCalendarRefresh();
 document.dispatchEvent(new CustomEvent('bm252-study-ready',{detail:{topLevelTabs:3,source:'local_control_v245',writes:false}}));
}
function ready(){install()}
document.addEventListener('bm240-study-mounted',ready);
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',ready,{once:true});
else ready();
window.BM252StudyFlow=Object.freeze({refresh:scheduleCalendarRefresh,get ready(){return installed}});
})();


/* v253_calendar_compact.js */
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


/* v280_study_theme.js */
/* V280: paleta na interface isolada do Controle de Estudos, apenas CSS. */
(function(){'use strict';let count=0;
function add(){const root=document.getElementById('bm240-native-host')?.shadowRoot;
 if(!root)return false;if(root.getElementById('bm280-study-style'))return true;
 const style=document.createElement('style');style.id='bm280-study-style';
 style.textContent=`:host{--bg:#edf0f1;--paper:#fff;--ink:#344551;--accent:#1687d8;--line:#dfe5e8}
 header{background:#343d44!important;color:#eaf2f6!important}
 header h1{color:#eaf2f6!important}
 .panel{border-radius:5px!important;border-color:#e0e6ea!important;box-shadow:none!important}
 #bm252-main-nav button,#bm252-module-nav button{border-radius:4px!important}
 #bm252-main-nav button.active,#bm252-module-nav button.active{background:#1687d8!important;color:#fff!important}
 input,select{border-radius:4px!important;border-color:#cbd7de!important}
 `;root.append(style);return true}
function tick(){if(add()||count++>=45)return;setTimeout(tick,250)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',tick,{once:true});else tick();
})();



/* v286_study_blue.js */
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



/* v287_study_consistency.js */
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



/* v288_surface_shadow.js */
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



/* v291_study_square.js */
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


/* v292_study_visual.js */
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



/* v296_study_theme.js */
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


/* v320_organizar_unificado.js */
/* Banco Mestre V320 — dois grupos em Organizar (apenas apresentação).
 * Reaproveita panes e handlers V245/V252. Não lê/grava localStorage, Drive ou SRS.
 * Reversão: retirar esta inclusão HTML e retornar à V319.
 */
(function(){
'use strict';
if(window.BM320Organizar)return;
const VIEWS=[
 {id:'metas',label:'Metas, disciplinas e revisões',first:'planejamento',items:['planejamento','revisoes']},
 {id:'execucao',label:'Ciclo, registros e dados',first:'registro',items:['registro','ciclo','backup']}
];
let installed=false,root=null,host=null,nav=null,last='metas',pending=false;
function current(){
 return root?.querySelector('section.pane.active')?.id||'';
}
function schedule(){
 if(pending)return;
 pending=true;
 queueMicrotask(()=>{pending=false;sync()});
}
function viewFor(id){
 const v=VIEWS.find(v=>v.items.includes(id));
 return v?.id||last;
}
function sync(){
 if(!installed||!host?.isConnected)return;
 const organizer=root.getElementById('bm252-main-nav')?.querySelector('[data-group="organizar"]');
 const on=organizer?.getAttribute('aria-selected')==='true';
 nav.hidden=!on;
 if(!on){host.removeAttribute('data-bm320-organizar');return;}
 const view=viewFor(current());
 last=view;host.setAttribute('data-bm320-organizar',view);
 for(const b of nav.querySelectorAll('button[data-view]')){
  const active=b.dataset.view===view;
  b.setAttribute('aria-selected',String(active));
  b.classList.toggle('active',active);
  b.tabIndex=active?0:-1;
 }
}
function go(view){
 const cfg=VIEWS.find(v=>v.id===view);if(!cfg||!root)return;
 const original=root.querySelector('#tabs button[data-tab="'+cfg.first+'"]');
 if(!original)return;
 last=view;
 original.click(); // Motor original conserva todos os formulários, ações e dados.
 sync();
}
function install(){
 if(installed)return;
 host=document.getElementById('bm240-native-host');
 root=host?.shadowRoot||null;
 const native=root?.getElementById('bm252-module-nav');
 const main=root?.getElementById('bm252-main-nav');
 if(!root||!native||!main||!root.getElementById('registro')||!window.BM252StudyFlow?.ready)return;
 const style=document.createElement('style');
 style.id='bm320-organizar-style';
 style.textContent=[
  ':host([data-bm320-organizar]) #bm252-module-nav{display:none!important}',
  ':host([data-bm320-organizar="metas"]) #revisoes{display:block!important}',
  ':host([data-bm320-organizar="execucao"]) #ciclo,',
  ':host([data-bm320-organizar="execucao"]) #backup{display:block!important}',
  '#bm320-organizar-nav{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:6px;margin:0 0 12px;padding:5px;border:1px solid #d6e4e1;border-radius:9px;background:#edf4f3}',
  '#bm320-organizar-nav[hidden]{display:none!important}',
  '#bm320-organizar-nav button{min-width:0;min-height:44px;white-space:normal;font-size:12px;line-height:1.3;padding:8px;border:1px solid #c4d7d8;border-radius:7px;background:#fff;color:#28565d;font-weight:700}',
  '#bm320-organizar-nav button[aria-selected="true"]{background:#e2f1ec;border-color:#388f84;color:#0e6258;box-shadow:inset 0 -2px #388f84}',
  '#bm320-organizar-nav button:focus-visible{outline:3px solid #e6ad44;outline-offset:2px}',
  '@media(max-width:560px){#bm320-organizar-nav{gap:4px;margin-bottom:8px;padding:4px}#bm320-organizar-nav button{font-size:11px;min-height:46px;padding:7px 5px}}'
 ].join('\n');
 root.append(style);
 nav=document.createElement('nav');
 nav.id='bm320-organizar-nav';
 nav.hidden=true;
 nav.setAttribute('role','tablist');
 nav.setAttribute('aria-label','Organização do estudo em dois grupos');
 for(const item of VIEWS){
  const b=document.createElement('button');
  b.type='button';b.dataset.view=item.id;b.textContent=item.label;
  b.setAttribute('role','tab');
  b.setAttribute('aria-selected','false');
  b.addEventListener('click',()=>go(item.id));
  nav.append(b);
 }
 native.after(nav);
 for(const pane of root.querySelectorAll('section.pane'))
  new MutationObserver(schedule).observe(pane,{attributes:true,attributeFilter:['class']});
 const organizeBtn=main.querySelector('[data-group="organizar"]');
 if(organizeBtn)new MutationObserver(schedule).observe(organizeBtn,{attributes:true,attributeFilter:['aria-selected']});
 installed=true;sync();
 document.dispatchEvent(new CustomEvent('bm320-organizar-ready',{detail:{groups:2,layoutOnly:true}}));
}
document.addEventListener('bm252-study-ready',install);
document.addEventListener('bm240-study-mounted',()=>queueMicrotask(install));
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});
else install();
window.BM320Organizar=Object.freeze({get ready(){return installed},open:go});
})();


/* v309_mobile_tabs.js */
/* V309 — menu de abas recolhível apenas no celular.
 * Não substitui botões nem handlers originais. Preserva foco/teclado, hash e navegação de desktop.
 */
(function(){
'use strict';
if(window.BM309MobileTabs)return;
const MQ='(max-width:620px)';
let btn=null,nav=null,mql=null,open=false,observer=null;
function activeName(){
 const active=nav?.querySelector('button[data-page].active');
 const s=String(active?.textContent||'Assuntos').trim();
 if(active?.dataset.page==='redacao')return 'Redação';
 if(active?.dataset.page==='controle-estudos')return 'Controle de Estudos';
 return s.length>33?s.slice(0,32)+'…':s;
}
function apply(){
 if(!btn||!nav)return;
 const mobile=Boolean(mql?.matches);
 if(!mobile)open=false;
 const expanded=mobile&&open;
 btn.hidden=!mobile;
 btn.setAttribute('aria-expanded',String(expanded));
 btn.setAttribute('aria-label',(expanded?'Recolher':'Abrir')+' abas de navegação. Atual: '+activeName());
 nav.hidden=mobile&&!expanded;
 document.documentElement.dataset.bm309MenuOpen=String(expanded);
 const label=btn.querySelector('.bm309-menu-label');
 if(label)label.textContent=expanded?'Recolher abas':'Abas';
 const current=btn.querySelector('.bm309-menu-current');
 if(current)current.textContent=activeName();
 const symbol=btn.querySelector('.bm309-menu-symbol');
 if(symbol)symbol.textContent=expanded?'×':'☰';
}
function hide(){if(!open)return;open=false;apply()}
function setup(){
 nav=document.querySelector('body>header .head>nav[aria-label="Seções"]');
 if(!nav)return;
 if(document.getElementById('bm309-mobile-tabs-toggle'))return;
 nav.id=nav.id||'bm309-main-sections';
 btn=document.createElement('button');
 btn.type='button';btn.id='bm309-mobile-tabs-toggle';btn.className='bm309-mobile-tabs-toggle';
 btn.setAttribute('aria-controls',nav.id);btn.setAttribute('aria-expanded','false');
 const icon=document.createElement('span');icon.className='bm309-menu-symbol';icon.setAttribute('aria-hidden','true');icon.textContent='☰';
 const label=document.createElement('strong');label.className='bm309-menu-label';label.textContent='Abas';
 const current=document.createElement('span');current.className='bm309-menu-current';current.textContent=activeName();
 const chevron=document.createElement('span');chevron.className='bm309-menu-chevron';chevron.setAttribute('aria-hidden','true');chevron.textContent='⌄';
 btn.append(icon,label,current,chevron);
 nav.before(btn);
 btn.addEventListener('click',()=>{open=!open;apply()});
 nav.addEventListener('click',e=>{
  if(e.target.closest?.('button[data-page]')){
   hide();
   queueMicrotask(apply);
  }
 });
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&open){hide();btn.focus()}});
 window.addEventListener('hashchange',()=>{hide();queueMicrotask(apply)});
 window.addEventListener('popstate',()=>{hide();queueMicrotask(apply)});
 mql=window.matchMedia(MQ);
 mql.addEventListener?.('change',()=>{open=false;apply()});
 observer=new MutationObserver(()=>{if(btn?.isConnected)apply()});
 observer.observe(nav,{subtree:true,attributes:true,attributeFilter:['class']});
 apply();
}
window.BM309MobileTabs=Object.freeze({get ready(){return Boolean(btn)},get open(){return open},close:hide});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',setup,{once:true});else setup();
})();


/* v314_srs_layout.js */
/* Banco Mestre V314 — interface enxuta do Planejamento SRS.
 * Apresentação somente; preserva os handlers e os dados do calendário V313.
 */
(function(){
'use strict';
if(window.BM314SrsLayout)return;
let mounted=false;
function create(tag,className,text){
 const e=document.createElement(tag);
 if(className)e.className=className;
 if(text!==undefined)e.textContent=text;
 return e;
}
function mount(){
 if(mounted)return;
 const root=document.getElementById('calendario');
 const wrap=root?.querySelector('.c141-wrap');
 const queue=root?.querySelector('#c313-panel');
 const calendar=root?.querySelector('.c141-board');
 const importPane=root?.querySelector('.c141-import');
 const source=root?.querySelector('.c141-private-source');
 if(!wrap||!queue||!calendar||!importPane||!source)return;
 mounted=true;root.classList.add('bm314-organized');

 const css=create('style');css.id='bm314-srs-layout-style';
 css.textContent=`
 #calendario.bm314-organized{--bm314-ink:#233f4b;--bm314-muted:#506775;--bm314-line:#d5e2e6}
 #calendario.bm314-organized .c141-wrap{max-width:1220px;margin:auto;min-width:0}
 #calendario.bm314-organized .c141-title{margin:0 0 12px;align-items:start}
 #calendario.bm314-organized .c141-title h2{font-size:clamp(21px,2.5vw,27px);line-height:1.25;margin:0 0 4px}
 #calendario.bm314-organized .c141-title p{font-size:13px;line-height:1.48;max-width:790px}
 #calendario.bm314-organized .c141-stats{margin:9px 0 12px;gap:9px}
 #calendario.bm314-organized .c141-stat{padding:12px 14px;box-shadow:none}
 #calendario.bm314-organized .c141-stat strong{font-size:24px;line-height:1.2}
 #calendario.bm314-organized .c141-stat span{line-height:1.35}
 #calendario.bm314-organized .c141-private-source{margin:0 0 14px!important;padding:12px 14px!important;border:1px solid #cbdde0!important;background:#f5faf9!important;display:flex;align-items:center;gap:12px;flex-wrap:wrap}
 #calendario.bm314-organized .c141-private-source button{flex:none;max-width:100%}
 #calendario.bm314-organized .c141-private-source span{flex:1 1 250px;min-width:0;color:#455e69;font-size:12px;line-height:1.5;margin:0!important}
 #calendario .c314-tabs{display:flex;gap:6px;flex-wrap:wrap;margin:0 0 12px;border-bottom:1px solid #cadbe0;padding-bottom:7px}
 #calendario .c314-tab{border:1px solid transparent!important;border-radius:7px!important;background:transparent!important;color:#3e6472!important;font-size:13px!important;min-height:40px;font-weight:750;padding:9px 14px!important}
 #calendario .c314-tab:hover{background:#eaf2f3!important}
 #calendario .c314-tab[aria-selected="true"]{background:#e8f2f1!important;border-color:#bdd7d4!important;color:#165c61!important}
 #calendario .c314-tab:focus-visible{outline:2px solid #267f84!important;outline-offset:2px}
 #calendario .c314-pane{min-width:0;background:#fff;border:1px solid var(--bm314-line,#d5e2e6);border-radius:11px;padding:14px;margin:0 0 12px}
 #calendario .c314-pane[hidden]{display:none!important}
 #calendario .c314-pane-title{font-size:16px;font-weight:800;color:var(--bm314-ink,#233f4b);margin:0 0 5px}
 #calendario .c314-pane-desc{font-size:12px;color:var(--bm314-muted,#506775);margin:0 0 12px;line-height:1.5}
 #calendario.bm314-organized #c313-panel{border:0!important;border-radius:0!important;background:transparent!important;padding:0!important;margin:0!important;min-width:0}
 #calendario.bm314-organized #c313-panel>h3{display:none}
 #calendario.bm314-organized #c313-panel>div:nth-of-type(1){margin-bottom:11px!important}
 #calendario.bm314-organized #c313-panel label{font-size:12px;font-weight:700;color:#456674}
 #calendario.bm314-organized #c313-panel select,#calendario.bm314-organized #c313-panel input{padding:8px 10px;border-radius:7px;min-height:38px}
 #calendario.bm314-organized #c313-count{font-size:12px;color:#536f79;margin:6px 0 9px!important}
 #calendario.bm314-organized #c313-panel .c141-scroll{border:1px solid #dce7ea;border-radius:8px}
 #calendario.bm314-organized #c313-panel table{min-width:830px;table-layout:fixed;font-size:12px;line-height:1.42}
 #calendario.bm314-organized #c313-panel th{position:sticky;top:0;z-index:1;background:#edf4f5;padding:9px 10px}
 #calendario.bm314-organized #c313-panel td{padding:10px;vertical-align:top;overflow-wrap:anywhere}
 #calendario.bm314-organized #c313-panel th:first-child{width:115px}
 #calendario.bm314-organized #c313-panel th:nth-child(2){width:28%}
 #calendario.bm314-organized #c313-panel th:nth-child(3){width:110px}
 #calendario.bm314-organized #c313-panel th:nth-child(4){width:100px}
 #calendario.bm314-organized #c313-panel th:nth-child(5){width:110px}
 #calendario.bm314-organized #c313-panel th:last-child{width:110px}
 #calendario.bm314-organized #c313-panel td:nth-child(2) strong{display:block;font-size:12px;font-weight:750;margin-bottom:4px}
 #calendario.bm314-organized #c313-panel td:nth-child(2) small{display:block;font-size:11px;color:#59717a;line-height:1.4;max-height:58px;overflow:hidden}
 #calendario.bm314-organized #c313-panel tbody tr:hover{background:#f2f8f8}
 #calendario.bm314-organized #c313-panel .c141-today{background:#fff8f5}
 #calendario.bm314-organized .c141-settings{margin-bottom:12px;max-width:100%}
 #calendario.bm314-organized .c141-board{margin:0;max-width:100%}
 #calendario.bm314-organized .c141-board .c141-scroll{max-height:490px;overflow:auto}
 #calendario.bm314-organized .c141-status{font-size:12px;margin:10px 0 0}
 #calendario.bm314-organized .c141-import{margin:0;border:0;padding:0}
 #calendario.bm314-organized .c141-import p{font-size:12px;line-height:1.55}
 #calendario.bm314-organized .c314-method{border:1px solid #dce5e7;border-radius:8px;padding:10px 12px;margin-top:12px}
 #calendario.bm314-organized .c314-method>summary{font-weight:750;font-size:12px}
 #calendario.bm314-organized .c141-note{font-size:12px;line-height:1.55;margin:10px 0 0}
 #calendario.bm314-organized .c141-limit{font-size:12px;font-weight:650;padding:8px 10px;margin:10px 0;display:inline-block}
 @media(max-width:700px){
  #calendario.bm314-organized .c141-stats{grid-template-columns:repeat(2,minmax(0,1fr))}
  #calendario.bm314-organized .c141-stat{padding:10px}
  #calendario.bm314-organized .c141-stat strong{font-size:21px}
  #calendario .c314-pane{padding:10px}
  #calendario .c314-tabs{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:5px}
  #calendario .c314-tab{padding:9px 5px!important;font-size:11px!important;line-height:1.3}
  #calendario.bm314-organized .c141-private-source button{width:100%}
  #calendario.bm314-organized .c141-private-source span{flex:1 1 100%}
  #calendario.bm314-organized #c313-panel label{flex:1 1 100%}
  #calendario.bm314-organized #c313-panel select,#calendario.bm314-organized #c313-panel input{width:100%!important;max-width:none}
 }
 `;
 document.head.append(css);

 const title=root.querySelector('.c141-title');
 const subtitle=title?.querySelector('p');
 if(subtitle)subtitle.textContent='Veja os atrasados, os próximos vencimentos e o histórico disponível. A consulta não registra respostas nem altera o SRS.';
 const indicator=root.querySelector('.c141-limit');
 const note=root.querySelector('.c141-note');
 const status=root.querySelector('.c141-status');
 const settings=root.querySelector('.c141-settings');

 const nav=create('div','c314-tabs');nav.setAttribute('role','tablist');
 nav.setAttribute('aria-label','Visualizações do Planejamento de revisões');
 const panes=[
  create('div','c314-pane'),create('div','c314-pane'),create('div','c314-pane')
 ];
 const specs=[
  {id:'fila',name:'Fila de revisão',heading:'Cartões por prioridade',desc:'Atrasados primeiro. Pesquise por ID ou assunto, confira a data e abra o cartão.'},
  {id:'calendario',name:'Calendário',heading:'Calendário de revisões',desc:'Organize os próximos dias; mover uma revisão aqui não altera o agendamento SRS.'},
  {id:'dados',name:'Regras SRS',heading:'Metodologia',desc:'Registros consultados do perfil individual; nenhuma avaliação é lançada automaticamente.'}
 ];
 const tabs=[];
 function selectTab(index,focus=false){
  for(let i=0;i<panes.length;i++){
   const selected=i===index;
   panes[i].hidden=!selected;
   tabs[i].setAttribute('aria-selected',String(selected));
   tabs[i].tabIndex=selected?0:-1;
  }
  root.dataset.bm314Tab=specs[index].id;
  if(focus)tabs[index].focus();
 }
 specs.forEach((spec,i)=>{
  const tab=create('button','c314-tab',spec.name);tab.type='button';
  tab.id='c314-tab-'+spec.id;tab.setAttribute('role','tab');
  tab.setAttribute('aria-controls','c314-pane-'+spec.id);
  tab.addEventListener('click',()=>selectTab(i));
  tab.addEventListener('keydown',e=>{
   if(!['ArrowRight','ArrowLeft','Home','End'].includes(e.key))return;
   e.preventDefault();
   const next=e.key==='Home'?0:e.key==='End'?tabs.length-1:e.key==='ArrowRight'?(i+1)%tabs.length:(i+tabs.length-1)%tabs.length;
   selectTab(next,true);
  });
  tabs.push(tab);nav.append(tab);
  const pane=panes[i];pane.id='c314-pane-'+spec.id;
  pane.setAttribute('role','tabpanel');pane.setAttribute('aria-labelledby',tab.id);
  pane.append(create('h3','c314-pane-title',spec.heading));
  pane.append(create('p','c314-pane-desc',spec.desc));
 });
 const wrapSource=source;
 // Move existing interface nodes; event handlers and ID references remain intact.
 panes[0].append(queue);
 if(settings)panes[1].append(settings);
 if(indicator)panes[1].append(indicator);
 panes[1].append(calendar);
 if(status)panes[1].append(status);
 panes[2].append(importPane);
 if(note){
  const method=create('details','c314-method');
  method.append(create('summary','', 'Regras SRS e segurança da fonte'),note);
  panes[2].append(method);
 }
 wrap.append(nav,...panes);
 // Source stays under statistics and above sub-tabs.
 const stat=root.querySelector('.c141-stats');
 if(stat)stat.after(wrapSource);
 selectTab(0);
 window.BM314SrsLayout=Object.freeze({
  get mounted(){return mounted},
  show:(name)=>{const idx=specs.findIndex(s=>s.id===name);if(idx<0)return false;selectTab(idx);return true},
  get active(){return root.dataset.bm314Tab}
 });
 document.dispatchEvent(new CustomEvent('bm314-srs-ready'));
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});
else mount();
})();
/* Ajustes somente de apresentação: diferenças do ambiente central. */
(function(){
'use strict';
const account=window.BMAccountRuntime;if(account?.mode!=='central')return;
const css=document.createElement('style');css.id='bm025-visual-fixes';
css.textContent="\n/* Regras específicas para o portal autenticado e a prévia. */\nbody>main>section{min-width:0}\n#controle-estudos,#bm240-native-host{min-width:0;max-width:100%;width:100%;box-sizing:border-box}\n#bm240-native-host{overflow:hidden!important;border-radius:0!important;border:1px solid #bfcfd9!important;background:#edf0f2!important}\n#bm240-native-host[hidden],#calendario [hidden],#lacunas [hidden],#bmCardPeekV050[hidden],#bmCardPeekV050 [hidden],#imageDialog [hidden],#pdfDialog [hidden]{display:none!important}\n#bm239-sync-details{overflow-wrap:anywhere;min-width:0}\n#bmCentralImageSync,#pdfLocalTools .pdfGroup button{white-space:normal;max-width:100%}\n#cardRows article,#pdfRows article,#imageRows article{min-width:0;overflow-wrap:anywhere}\n#calendario .c141-scroll,#lacunas .bm242-list{max-width:100%;min-width:0}\n#pdfDialog .pdfGroup{min-width:0;flex-wrap:wrap}\n#imageDialog .editor-meta{min-width:0}\n#imageDialog #imgMessage{min-width:0;overflow-wrap:anywhere}\n#bmCardPeekV050 .bm197-layer{min-width:0;overflow-wrap:anywhere}\n#bmCardPeekV050 .bm197-layer pre{white-space:pre-wrap;overflow-wrap:anywhere}\n@media(max-width:620px){\n body>header .head{min-width:0}\n body>main{min-width:0;padding-inline:8px!important}\n #controle-estudos{padding:0!important;margin:0!important}\n #imageDialog .editor-tools,#pdfLocalTools{max-height:38dvh;overflow:auto;overscroll-behavior:contain}\n #imageDialog .dbody{min-height:0}\n #bmCentralImageSync{min-height:36px}\n #pdfLocalTools .pdfGroup{max-width:100%}\n}\n";
document.head.append(css);
function study(){
 const host=document.getElementById('bm240-native-host'),root=host?.shadowRoot;if(!root||!root.getElementById('tabs'))return;
 let style=root.getElementById('bm025-study-fixes');
 if(!style){style=document.createElement('style');style.id='bm025-study-fixes';style.textContent="\n:host{display:block;box-sizing:border-box;min-width:0;max-width:100%;overflow:hidden;--accent:#147fbf;color:#111a22;font:14px/1.55 \"Segoe UI\",Arial,sans-serif}\n:host *{box-sizing:border-box}\n:host [hidden]{display:none!important}\n:host main{width:100%;max-width:none!important;margin:0!important;min-width:0;overflow:hidden}\n:host header{position:static!important;width:100%;min-width:0}\n:host #bm252-main-nav{grid-template-columns:repeat(3,minmax(0,1fr))!important;gap:5px!important}\n:host #bm252-main-nav button,:host #bm320-organizar-nav button{min-width:0;white-space:normal;overflow-wrap:anywhere}\n:host #bm320-organizar-nav{background:#f6f9fb;border:1px solid #d2e0e9;border-radius:0!important}\n:host #bm320-organizar-nav button[aria-selected=true]{color:#125e94!important;background:#eaf4fb!important;border-color:#147fbf!important;box-shadow:inset 0 -2px #147fbf}\n:host #bm320-organizar-nav button[aria-selected=false]{color:#20587b!important;background:white!important;border-color:#cbd9e2!important}\n:host .panel,:host .metric,:host .fields,:host .grid,:host .twocol,:host .item,:host .row{min-width:0;max-width:100%}\n:host .item-head{flex-wrap:wrap;min-width:0;overflow-wrap:anywhere}\n:host label,:host .metric,:host .notice,:host .status{overflow-wrap:anywhere;min-width:0}\n:host input[type=checkbox],:host input[type=radio]{width:auto;min-height:0!important;flex:none}\n:host input[type=date],:host input[type=time],:host select{min-width:0;max-width:100%}\n:host .scroll,:host .bars{max-width:100%;min-width:0;overflow-x:auto;overscroll-behavior-x:contain}\n:host .timer{font-size:clamp(28px,7vw,44px);white-space:nowrap}\n:host #registro>.twocol>.panel:first-child{display:block!important}\n:host #registro>.twocol{display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:12px}\n:host #calendarioControle .bm240-day{min-width:0;overflow:hidden}\n:host #calendarioControle .bm240-days:not([data-bm252-mode=day]){grid-template-columns:repeat(7,minmax(0,1fr))!important}\n:host #calendarioControle .bm240-days[data-bm252-mode=day]{grid-template-columns:minmax(0,1fr)!important}\n:host #calendarioControle .bm240-weeklabels{display:grid!important;grid-template-columns:repeat(7,minmax(0,1fr))!important}\n:host #calendarioControle .bm240-weeklabels span{min-width:0;overflow:hidden}\n:host #calendarioControle .bm240-day>span:not(.bm252-dots){max-width:100%;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}\n:host #bm-profile-study-sync{margin:6px 0 10px}\n@media(max-width:800px){:host #registro>.twocol{grid-template-columns:minmax(0,1fr)!important}}\n@media(max-width:620px){\n :host main{padding:6px 6px 20px!important}\n :host .panel{padding:10px!important}\n :host #bm252-main-nav button{font-size:11px!important;min-height:43px!important;padding:5px 3px!important}\n :host #bm320-organizar-nav button{font-size:11px!important}\n :host #calendarioControle>.panel{padding:6px!important}\n :host #calendarioControle .bm240-days,:host #calendarioControle .bm240-weeklabels{gap:3px!important}\n :host #calendarioControle .bm240-weeklabels span{font-size:9px!important;padding:4px 0!important}\n :host #calendarioControle .bm240-day :is(b,span,small){font-size:10px!important;line-height:1.2!important}\n :host #calendarioControle .bm240-day>span:not(.bm252-dots){font-size:8.5px!important}\n :host #calendarioControle .bm240-day{min-height:47px!important;padding:3px 1px!important}\n :host .fields,:host .fields.two{grid-template-columns:repeat(2,minmax(0,1fr))!important}\n :host .actions>*{max-width:100%}\n}\n@media(max-width:380px){:host .fields,:host .fields.two{grid-template-columns:minmax(0,1fr)!important}}\n";root.append(style)}
 if(root.lastElementChild!==style)root.append(style);
 const timerHint=root.getElementById('timerStatus')?.previousElementSibling;if(timerHint?.classList.contains('hint'))timerHint.textContent='Pausas não entram nas horas líquidas. O cronômetro permanece nesta sessão; encerre e sincronize o registro antes de sair.';
 const p=root.querySelector('#painel > p.muted');if(p)p.textContent='Resumo dos estudos registrados neste perfil. O SRS dos flashcards é independente.';
 const backup=root.getElementById('backupStatus');if(backup&&!backup.dataset.bm025){backup.dataset.bm025='1';backup.textContent='Controle individual. Sincronize os registros ou exporte um backup antes de sair.'}
 const nav=root.getElementById('bm320-organizar-nav');if(nav)nav.setAttribute('aria-label','Organização do estudo');
}
for(const e of ['bm240-study-mounted','bm252-study-ready','bm253-calendar-compact-ready','bm320-organizar-ready'])document.addEventListener(e,()=>queueMicrotask(study));
study();
})();
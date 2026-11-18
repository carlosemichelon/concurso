/* V252 — Fluxo de estudos em 3 abas (camada de leitura e navegação).
   Fonte: armazenamento local do Controle V245. Sem gravacoes, sem eventos SRS. */
(function(){
'use strict';
if(window.BM252StudyFlow)return;
const KEY='BM245_CONTROLE_ESTUDOS';
const GROUPS=[
 {id:'ver',label:'Ver estudado',first:'calendarioControle',modules:[['calendarioControle','Calendário'],['historico','Histórico completo']]},
 {id:'estudar',label:'Estudar',first:'registro',modules:[['registro','Cronômetro e registro'],['revisoes','Revisões de conteúdo']]},
 {id:'organizar',label:'Organizar',first:'planejamento',modules:[['planejamento','Metas e disciplinas'],['ciclo','Ciclo'],['painel','Resumo'],['relatorios','Relatórios'],['backup','Dados e backup']]}
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
 const s=el('style');s.textContent="/* V252 — controle de estudos com tres areas principais. Estilos encapsulados no Shadow DOM. */\n:host{display:block;color:#17363d}\nheader{padding:13px 15px 10px!important}\nheader h1{font-size:21px!important;line-height:1.2;margin:0 0 4px!important}\nheader>p{font-size:12px!important;margin:0 0 12px!important;color:#54747b}\n#tabs{display:none!important}\n#bm252-main-nav{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:7px;margin:0}\n#bm252-main-nav button{min-width:0;min-height:46px;border:1px solid #c6dcda;border-radius:9px;background:#f6faf9;color:#325960;font-weight:750;font-size:13px;padding:8px 6px;white-space:normal}\n#bm252-main-nav button[aria-selected=\"true\"]{background:#16685f;border-color:#16685f;color:#fff;box-shadow:inset 0 -3px #115046}\n#bm252-main-nav button:focus-visible,#bm252-module-nav button:focus-visible{outline:3px solid #e6ad44;outline-offset:2px}\n#bm252-module-nav{display:flex;align-items:center;flex-wrap:wrap;gap:6px;margin:0 0 13px;padding:8px 10px;background:#edf4f3;border:1px solid #d6e4e1;border-radius:9px}\n#bm252-module-nav>span{font-size:11px;font-weight:750;color:#5b7478;margin-right:3px}\n#bm252-module-nav button{min-height:36px;font-size:11.5px;padding:7px 10px;background:#fff}\n#bm252-module-nav button[aria-current=\"page\"]{border-color:#388f84;color:#0e6258;background:#e2f1ec}\n#calendarioControle h2{font-size:18px!important}\n#bm252-calendar-head{padding:12px 14px 8px;background:#f7fbf9;border:1px solid #d8e9e2;border-radius:10px;margin:0 0 13px}\n#bm252-calendar-head h3{font-size:14px;margin:0 0 4px}\n#bm252-calendar-head p{font-size:11px;color:#587178;margin:0}\n#bm252-month-stats{display:flex;gap:6px;flex-wrap:wrap;margin:9px 0 6px}\n#bm252-month-stats span{font-size:11px;border:1px solid #d9e7e2;background:#fff;border-radius:7px;padding:5px 9px;line-height:1.3}\n#bm252-legend{display:flex;gap:14px;align-items:center;flex-wrap:wrap;margin-top:9px;font-size:11px;color:#4c6769}\n#bm252-legend b{display:inline-flex;align-items:center;gap:5px;font-weight:700}\n#bm252-legend i{display:inline-block;width:9px;height:9px;border-radius:50%;background:#237c67}\n#bm252-legend .plan i{background:#cf9241}\n#bm252-legend .both i{background:linear-gradient(90deg,#237c67 50%,#cf9241 50%)}\n#calendarioControle .bm240-day{position:relative;min-width:0}\n#calendarioControle .bm240-day[data-bm252-state=\"done\"]{border-color:#7db79f;background:#f4faf6}\n#calendarioControle .bm240-day[data-bm252-state=\"planned\"]{border-color:#dcbf82;background:#fdf9ef}\n#calendarioControle .bm240-day[data-bm252-state=\"both\"]{border-color:#9dbda7;background:linear-gradient(135deg,#f5fbf7,#fdf9ed)}\n#calendarioControle .bm240-day.selected{outline:2px solid #146b65;outline-offset:0;border-color:#146b65!important}\n#calendarioControle .bm252-dots{display:flex;justify-content:center;gap:4px;width:100%;align-items:center;margin-top:auto}\n#calendarioControle .bm252-dots i{display:inline-block;width:7px;height:7px;border-radius:50%}\n#calendarioControle .bm252-dots .done{background:#238165}\n#calendarioControle .bm252-dots .planned{background:#d2943b}\n#bm252-realized{margin:12px 0 16px}\n#bm252-realized h3,#bm252-planned-title{font-size:15px!important;margin:10px 0}\n.bm252-day-totals{display:flex;flex-wrap:wrap;gap:6px;margin:7px 0 10px}\n.bm252-day-totals span{font-size:11px;border:1px solid #dce8e5;padding:5px 8px;border-radius:7px}\n.bm252-record{padding:10px 12px;border:1px solid #e0e9e7;border-left:3px solid #237c67;background:#f8fbfa;border-radius:8px;margin-bottom:7px}\n.bm252-record strong{display:block;font-size:13px;color:#254f50}\n.bm252-record p{margin:3px 0;font-size:11px;color:#526f72;overflow-wrap:anywhere}\n.bm252-record small{font-size:10.5px;color:#547578}\n#bm252-plan-add{padding:0 12px 11px;border:1px solid #dce9e6;background:#fafdfb;border-radius:9px;margin-top:12px}\n#bm252-plan-add>summary{cursor:pointer;padding:12px 0;min-height:44px;font-size:12px;font-weight:700;color:#23675c}\n#bm252-plan-add form{padding-bottom:5px}\n#bm252-day-empty{font-size:12px;color:#647d7e}\n#calendarioControle .bm240-weeklabels span{text-align:center;font-size:10px;padding:5px 0}\n#calendarioControle .bm240-days{gap:5px}\n#calendarioControle .bm240-day{min-height:76px;gap:4px;align-items:center;padding:7px 4px}\n#calendarioControle .bm240-day b{font-size:12px}\n#calendarioControle .bm240-day>span:not(.bm252-dots){font-size:11px}\n#calendarioControle .bm240-day small{font-size:9px;text-align:center}\n#calendarioControle .bm240-days[data-bm252-mode=\"day\"]{grid-template-columns:1fr!important}\n#calendarioControle .bm240-days[data-bm252-mode=\"day\"] .bm240-day{min-height:82px;max-width:340px}\n@media(max-width:680px){\n header{padding:11px 9px 8px!important}\n header h1{font-size:19px!important}\n header>p{font-size:11px!important}\n #bm252-main-nav{gap:5px}\n #bm252-main-nav button{font-size:11px;min-height:44px;padding:8px 4px}\n #bm252-module-nav{overflow-x:auto;display:flex;flex-wrap:nowrap;gap:5px;padding:7px 6px;scrollbar-width:thin}\n #bm252-module-nav>span{display:none}\n #bm252-module-nav button{white-space:nowrap;flex:0 0 auto;min-height:39px;font-size:11px}\n main{padding:9px 8px 28px!important}\n #calendarioControle .panel{padding:10px 7px}\n #calendarioControle .bm240-weeklabels{display:grid!important;grid-template-columns:repeat(7,minmax(0,1fr));gap:2px}\n #calendarioControle .bm240-days{display:grid!important;grid-template-columns:repeat(7,minmax(0,1fr))!important;gap:3px}\n #calendarioControle .bm240-pad{display:block!important;min-height:49px;border-radius:5px}\n #calendarioControle .bm240-day{min-height:61px!important;max-width:100%;gap:2px;padding:5px 1px!important;border-radius:7px;overflow:hidden}\n #calendarioControle .bm240-day b{font-size:11px;line-height:1.15}\n #calendarioControle .bm240-day>span:not(.bm252-dots){font-size:9px;line-height:1.1;white-space:nowrap}\n #calendarioControle .bm240-day small{display:none!important}\n #calendarioControle .bm252-dots{gap:3px}\n #calendarioControle .bm252-dots i{width:6px;height:6px}\n #calendarioControle .bm240-days[data-bm252-mode=\"day\"]{grid-template-columns:1fr!important}\n #calendarioControle #calGrid+div{max-width:100%}\n #bm252-calendar-head{padding:9px 10px}\n #bm252-month-stats span{font-size:10px;padding:4px 6px}\n #calendarioControle #calTitle{display:block;width:100%;font-size:12px}\n .item-head{flex-wrap:wrap}\n .scroll{overflow-x:auto}\n}\n@media(prefers-reduced-motion:reduce){#bm252-module-nav{scroll-behavior:auto!important}}\n";root.prepend(s);
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
 if(subtitle)subtitle.textContent='Consulte primeiro o calendário: verde = realizado; amarelo = planejado. Depois registre e organize seus estudos.';
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
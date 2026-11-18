/* Banco Mestre V251 — UX de Controle de Estudos, somente interface.
   Mantém os IDs, formulários, eventos e armazenamento do motor V245.
   Não escreve no Drive, SRS, cartões ou conteúdo de sessões. */
(function(){
'use strict';
if(window.BM251StudyUX)return;
const KEY='BM245_CONTROLE_ESTUDOS';
const ORDER=[
 ['painel','Hoje'],
 ['registro','Registrar'],
 ['calendarioControle','Agenda'],
 ['revisoes','Revisões'],
 ['planejamento','Planejar'],
 ['ciclo','Ciclo'],
 ['historico','Histórico'],
 ['relatorios','Relatórios'],
 ['backup','Dados e backup']
];
let attached=false,root=null;
const $=id=>root?.getElementById(id);
const node=(tag,cls,txt)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(txt!==undefined)e.textContent=txt;return e};
const dateLocal=()=>{const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')};
const fmt=n=>{const v=Math.round(Math.max(0,Number(n)||0));return Math.floor(v/60)+'h '+String(v%60).padStart(2,'0')+'m'};
const h=n=>String(Math.max(0,n||0)).replace(/\B(?=(\d{3})+(?!\d))/g,'.');
const style="\n/* Styles hosted in the native study Shadow DOM. */\n:host{--bm251-deep:#174c52;--bm251-line:#dce8e5;display:block}\nheader{padding:14px 16px 12px!important}\nheader h1{font-size:23px!important;letter-spacing:-.025em}\nheader p{margin:0 0 10px!important;font-size:12px!important;max-width:930px}\n#tabs{display:flex!important;flex-wrap:wrap;gap:6px;padding-top:5px}\n#tabs button{font-size:12px;min-height:38px;padding:8px 12px;border-radius:8px}\n#tabs button.active{background:#175e5b;border-color:#175e5b}\n#tabs button:focus-visible{outline:3px solid #68a69c;outline-offset:2px}\n.bm251-hero{border:1px solid #d9e6e4;background:#fff;padding:18px;border-radius:12px;margin:0 0 14px}\n.bm251-hero h2{font-size:19px;margin:0 0 3px}\n.bm251-hero-caption{margin:0 0 13px;font-size:12px;color:#5b7378}\n.bm251-today-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:9px}\n.bm251-today-card{display:flex;flex-direction:column;gap:3px;border:1px solid #dbe8e5;border-radius:10px;padding:11px 12px;background:#f8fbfa;min-width:0}\n.bm251-today-card small{font-size:11px;font-weight:700;color:#507178}\n.bm251-today-card strong{font-size:21px;line-height:1.15;color:#1c5557;font-variant-numeric:tabular-nums;overflow-wrap:anywhere}\n.bm251-today-card span{font-size:11px;line-height:1.3;color:#6a7b7d;overflow-wrap:anywhere}\n.bm251-goals-notice{display:flex;gap:10px;align-items:center;justify-content:space-between;background:#faf8ef;border:1px solid #e4d9ae;padding:9px 12px;border-radius:8px;margin:4px 0 12px;font-size:12px;color:#6b5a2f}\n.bm251-goals-notice button{min-width:120px;flex:0 0 auto}\n.bm251-next{margin-top:12px;padding:12px 14px;border:1px solid #b4d7ca;border-radius:10px;background:#f0f8f4;display:flex;align-items:center;justify-content:space-between;gap:16px}\n.bm251-next-text{min-width:0;max-width:800px}\n.bm251-next-text small{display:block;font-size:10px;color:#517269;font-weight:750;text-transform:uppercase;letter-spacing:.04em}\n.bm251-next-text strong{display:block;font-size:14px;margin:3px 0 4px;color:#174f49}\n.bm251-next-text p{margin:0;font-size:12px;color:#43645e}\nbutton.bm251-primary{background:#136e68;border-color:#136e68;color:#fff}\nbutton.bm251-primary:hover{background:#105a55}\n.bm251-next button{flex:0 0 auto}\n.bm251-warning{font-size:12px;color:#8c4031}\n#painel>.grid{margin:0 0 14px}\n#painel>.panel{margin-bottom:13px}\n.bm251-details{border:1px solid #d7e5e2;background:#fff;border-radius:10px;margin:13px 0;padding:0 13px 8px}\n.bm251-details>summary{cursor:pointer;padding:14px 1px;min-height:44px;font-size:15px;font-weight:750;color:#18545b}\n.bm251-details>summary span{font-weight:450;font-size:11px;display:block;color:#607a7f;margin:3px 0}\n.bm251-details>.twocol{margin:3px 0 0}\n.bm251-details>.panel{margin-bottom:6px}\n#planejamento>.panel:first-child{border-left:3px solid #6ca69b}\n#painel>.actions{margin:0 0 13px}\n@media(max-width:800px){\n .bm251-today-grid{grid-template-columns:repeat(2,minmax(0,1fr))}\n .bm251-hero{padding:13px}\n .bm251-next{align-items:flex-start;flex-direction:column;gap:9px}\n}\n@media(max-width:600px){\n header{padding:12px 10px 9px!important}\n header h1{font-size:20px!important}\n header p{font-size:11.5px!important}\n #tabs{flex-wrap:nowrap!important;overflow-x:auto;overflow-y:hidden;scrollbar-width:thin;-webkit-overflow-scrolling:touch;padding-bottom:7px;gap:5px}\n #tabs button{flex:0 0 auto!important;min-height:42px;padding:8px 10px;font-size:11.5px;scroll-snap-align:start}\n #tabs{scroll-snap-type:x proximity}\n main{padding:10px 8px 24px!important}\n .bm251-hero{padding:12px 10px;margin-bottom:10px}\n .bm251-hero h2{font-size:17px}\n .bm251-today-grid{gap:6px}\n .bm251-today-card{padding:9px 8px}\n .bm251-today-card strong{font-size:18px}\n .bm251-today-card small,.bm251-today-card span{font-size:10px}\n .bm251-next{padding:11px}\n .bm251-next button{width:100%;min-height:42px}\n .bm251-details{padding:0 9px 7px}\n .item-head{flex-wrap:wrap}\n .scroll{overflow-x:auto}\n}\n@media(prefers-reduced-motion:reduce){#tabs{scroll-behavior:auto!important}}\n";
/* The String.rawCSS sentinel is replaced by the static style literal in this module. */
function getData(){
 try {
  const raw=localStorage.getItem(KEY);
  if(!raw)return {state:'empty',subjects:[],sessions:[],plans:[],reviews:[],cycle:[],cycleIndex:0};
  const x=JSON.parse(raw);
  if(x?.schema!==1||!Array.isArray(x.subjects)||!Array.isArray(x.sessions)||!Array.isArray(x.reviews))return {state:'invalid'};
  return {...x,plans:Array.isArray(x.plans)?x.plans:[],cycle:Array.isArray(x.cycle)?x.cycle:[],state:'ok'};
 }catch{return {state:'invalid'}}
}
function navTo(id){
 const button=root?.querySelector('#tabs button[data-tab="'+id+'"]');
 if(button)button.click();
}
function createJump(text,id,primary=false){
 const b=node('button',primary?'bm251-primary':'bm251-secondary',text);
 b.type='button';b.dataset.bm251Target=id;
 b.addEventListener('click',()=>navTo(id));
 return b;
}
function today(){
 const host=$('bm251-today');if(!host)return;
 const dat=getData();
 host.replaceChildren();
 if(dat.state==='invalid'){
  const error=node('p','bm251-warning','Não foi possível conferir os registros locais; nenhuma alteração foi feita. Confira a integridade em Dados e backup.');
  host.append(error,createJump('Examinar dados','backup',true));return;
 }
 const date=dateLocal(),subjects=(dat.subjects?.length?dat.subjects:(window.BM240ControlApp?.timer?.subjects||[]));
 const sessions=(dat.sessions||[]).filter(x=>!x.deletedAt&&x.date===date);
 const plans=(dat.plans||[]).filter(x=>!x.deletedAt&&x.date===date&&!x.doneAt);
 const reviews=(dat.reviews||[]).filter(x=>!x.done&&typeof x.due==='string'&&x.due<=date);
 const c=dat.cycle||[],i=Math.max(0,Number(dat.cycleIndex)||0),up=c.length?c[Math.floor(i)%c.length]:null;
 const cards=[
  {label:'Estudado hoje',value:fmt(sessions.reduce((sum,x)=>sum+(Number(x.minutes)||0),0)),hint:sessions.length+' sessão(ões) salva(s)'},
  {label:'Tarefas de hoje',value:h(plans.length),hint:'Planejadas, ainda não concluídas'},
  {label:'Revisões pendentes',value:h(reviews.length),hint:'Agenda de conteúdo; não SRS'},
  {label:'Próximo bloco',value:up?(Number(up.minutes)||0)+' min':'—',hint:up?(subjects.find(x=>x.id===up.subjectId)?.name||'Disciplina não localizada'):'Ciclo ainda não definido'}
 ];
 const grid=node('div','bm251-today-grid');
 for(const c of cards){
  const metric=node('div','bm251-today-card');
  metric.append(node('small','',c.label),node('strong','',c.value),node('span','',c.hint));grid.append(metric);
 }
 host.append(grid);

 const goals=$('goalSummary');
 const goalPanel=goals?.closest('.panel');
 if(goals&&goalPanel){
  let notice=$('bm251-goals-notice');
  const hasTarget=subjects.some(x=>Number(x.weekly)>0||Number(x.daily)>0||Number(x.monthly)>0);
  if(!hasTarget&&subjects.length){
   if(!notice){
    notice=node('div','bm251-goals-notice');
    notice.id='bm251-goals-notice';
    notice.append(node('span','','Você ainda não definiu metas. Comece pela disponibilidade semanal; a distribuição por disciplina é uma sugestão, não horas realizadas.'),createJump('Configurar metas','planejamento'));
    goals.before(notice);
   }
  }else if(notice)notice.remove();
 }
 const next=node('div','bm251-next');
 const text=node('div','bm251-next-text');
 let title='',detail='',go='registro',button='Registrar estudo';
 if(!subjects.length){
  title='Comece cadastrando suas disciplinas';
  detail='Defina disponibilidade e prioridades. As horas serão contadas somente depois de registrar sessões.';
  go='planejamento';button='Organizar disciplinas';
 }else if(plans.length){
  title='Próxima ação: realizar o que está planejado';
  const first=plans[0],subject=subjects.find(x=>x.id===first.subjectId);
  detail=(subject?.name||'Disciplina')+' · '+String(first.topic||'Atividade prevista')+'; a conclusão do planejamento não registra horas.';
  go='calendarioControle';button='Ver agenda de hoje';
 }else if(reviews.length){
  title='Há revisões de conteúdo vencidas ou previstas para hoje';
  detail='Esta é a agenda manual do Controle, independente das revisões formais dos flashcards.';
  go='revisoes';button='Abrir revisões';
 }else{
  title='Próxima ação: registrar seu estudo';
  detail='Inicie o cronômetro ou lance uma sessão manual. Depois acompanhe metas e evolução aqui.';
 }
 text.append(node('small','','Próximo passo'),node('strong','',title),node('p','',detail));
 next.append(text,createJump(button,go,true));
 host.append(next);
}
function install(){
 if(attached)return;
 const holder=document.getElementById('bm240-native-host');
 const target=holder?.shadowRoot;
 if(!target?.getElementById('tabs')||!target.getElementById('painel')||!window.BM240ControlApp)return;
 root=target;
 const tabs=$('tabs'),pane=$('painel');
 if(!tabs||!pane)return;
 // All nine original tab buttons are MOVED, not cloned: listeners remain intact.
 for(const [id,label] of ORDER){
  const b=tabs.querySelector('button[data-tab="'+id+'"]');
  if(!b)return;
  b.textContent=label;
  b.title=({
   painel:'Visão de hoje, metas e próximo passo',
   registro:'Cronômetro e registro manual de sessões',
   calendarioControle:'Agenda de tarefas por dia, semana e mês',
   revisoes:'Revisões manuais de conteúdo, independentes do SRS',
   planejamento:'Disciplinas, prioridades e metas de horas',
   ciclo:'Blocos de estudo em sequência flexível',
   historico:'Sessões realizadas, edição e filtros',
   relatorios:'Estatísticas, evolução e exportação',
   backup:'Integridade, sincronização e recuperação de dados'
  })[id];
  tabs.append(b);
 }
 tabs.setAttribute('aria-label','Fluxo do controle de estudos: acompanhar, registrar, agendar, planejar e analisar');
 const sheet=node('style');
 sheet.textContent=style;root.prepend(sheet);
 const header=root.querySelector('header');
 const title=header?.querySelector('h1');if(title)title.textContent='Controle de Estudos';
 const subtitle=header?.querySelector('p');
 if(subtitle)subtitle.textContent='Seu fluxo: planejar, estudar, registrar, revisar e avaliar resultados. Horas reais e SRS são controles separados.';
 // Reorder the EXISTING panels without changing IDs, inputs, actions or event handlers.
 const metrics=$('metrics'),summary=$('goalSummary')?.closest('.panel'),charts=$('timeline')?.closest('.twocol'),
       performance=$('performance')?.closest('.panel');
 const oldIntro=pane.querySelector(':scope > p.muted');
 if(oldIntro)oldIntro.textContent='Indicadores calculados apenas a partir das sessões salvas neste navegador. Sincronização com o Drive requer confirmação própria.';
 const oldActions=pane.querySelector(':scope > .actions');
 if(oldActions){
  const first=oldActions.querySelector('[data-goto="calendarioControle"]');
  if(first)first.textContent='Abrir agenda';
  const report=oldActions.querySelector('[data-goto="relatorios"]');
  if(report)report.textContent='Ver relatórios';
  oldActions.prepend(createJump('Registrar estudo','registro',true));
 }
 const hero=node('div','bm251-hero');
 hero.append(node('h2','','Hoje: organize e acompanhe o estudo'));
 const expl=node('p','bm251-hero-caption','Priorize o que fazer agora. Planejamento não soma horas; revisões de conteúdo não alteram o SRS.');
 hero.append(expl);
 const todayHost=node('div');todayHost.id='bm251-today';hero.append(todayHost);
 if(oldIntro)pane.insertBefore(hero,oldIntro);
 else pane.prepend(hero);
 if(metrics)hero.after(metrics);
 if(summary&&metrics)metrics.after(summary);
 if(oldActions)hero.after(oldActions);
 if(charts){
  const details=node('details','bm251-details');
  details.id='bm251-analises';
  details.open=typeof matchMedia!=='undefined'&&matchMedia('(min-width:740px)').matches;
  const summ=node('summary','','Tendências e desempenho');
  const hint=node('span','','Evolução de horas, distribuição e questões por disciplina');summ.append(hint);
  details.append(summ,charts);
  if(performance)details.append(performance);
  pane.append(details);
 }
 if(oldIntro)pane.append(oldIntro);
 const meta=$('planejamento');
 if(meta){
  const panels=[...meta.querySelectorAll(':scope > .panel')];
  if(panels.length>=2){
   const availability=panels.find(p=>p.querySelector('#hoursWeek'));
   const subjectsPanel=panels.find(p=>p.querySelector('#subjectForm'));
   if(availability&&subjectsPanel){
    availability.querySelector('h2').textContent='1. Defina o tempo disponível';
    subjectsPanel.querySelector('h2').textContent='2. Ajuste disciplinas e prioridades';
    meta.insertBefore(availability,subjectsPanel);
   }
  }
 }
 const report=$('relatorios')?.querySelector('h2');if(report)report.textContent='Relatórios das sessões registradas';
 const cal=$('calendarioControle')?.querySelector('h2');if(cal)cal.textContent='Agenda: planejar e acompanhar';
 const reg=$('registro')?.querySelector('h2');if(reg)reg.textContent='1. Cronômetro de tempo líquido';
 const form=$('registro')?.querySelector('#sessionForm')?.closest('.panel')?.querySelector('h2');
 if(form)form.textContent='2. Registrar uma sessão manualmente';
 const hist=$('historico')?.querySelector('h2');if(hist)hist.textContent='Histórico: consultar e corrigir sessões';
 const back=$('backup')?.querySelector('h2');if(back)back.textContent='Dados, integridade e recuperação';
 // Accessibility: report which original tab is active. Never change app routing.
 const syncTabs=()=>{for(const b of tabs.querySelectorAll('button[data-tab]')){
  if(b.classList.contains('active'))b.setAttribute('aria-current','page');
  else b.removeAttribute('aria-current');
 }};
 new MutationObserver(syncTabs).observe(tabs,{attributes:true,attributeFilter:['class'],subtree:true});
 tabs.addEventListener('click',()=>{today();syncTabs()});
 window.addEventListener('bm240-study-changed',today);
 window.addEventListener('bm243-catalog-ready',today);
 document.addEventListener('visibilitychange',()=>{if(!document.hidden)today()});
 window.addEventListener('storage',e=>{if(e.key===KEY)today()});
 syncTabs();today();attached=true;
 document.dispatchEvent(new CustomEvent('bm251-study-ux-ready',{detail:{tabs:ORDER.length,updatedData:false}}));
}
function ready(){install()}
document.addEventListener('bm240-study-mounted',ready);
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',ready,{once:true});
else ready();
window.BM251StudyUX=Object.freeze({refresh:today,get ready(){return attached}});
})();
window.BM240ControlInit=(function(){
return function(root){
'use strict';
const KEY='BM245_CONTROLE_ESTUDOS', TIMER='BM245_CONTROLE_TIMER';
const types=['Teoria','Questões','Revisão','Lei seca','Flashcards','Simulado','Outros'];
const DEVICE_KEY='BM245_CONTROLE_DEVICE';
let device=localStorage.getItem(DEVICE_KEY);
if(!device){device=crypto.randomUUID();localStorage.setItem(DEVICE_KEY,device)}
function mirrorTimer(){
 const active=clock&&(clock.running||Number(clock.elapsed)>0);
 data.activeTimer=active?{...clock,ownerId:device,updatedAt:new Date().toISOString()}:null;
 return store();
}
const $=id=>root.getElementById(id);
const fresh=()=>({schema:1,subjects:[],sessions:[],reviews:[],plans:[],audit:[],cycle:[],cycleIndex:0,availabilityWeek:15,availabilityMonth:60});
let data, clock, editId=null, reviewFilter='due', tick, taxonomy=null, lastReadRaw=null;
function uid(){return (window.crypto&&crypto.randomUUID)?crypto.randomUUID():String(Date.now())+'-'+Math.random().toString(36).slice(2)}
function validDate(x){return /^\d{4}-\d{2}-\d{2}$/.test(String(x||''))}
function today(d){const z=d||new Date();return z.getFullYear()+'-'+String(z.getMonth()+1).padStart(2,'0')+'-'+String(z.getDate()).padStart(2,'0')}
function shift(date,days){const p=String(date).split('-').map(Number);const d=new Date(p[0],p[1]-1,p[2],12);d.setDate(d.getDate()+days);return today(d)}
function timeText(n){n=Math.round(Math.max(0,Number(n)||0));return Math.floor(n/60)+'h '+String(n%60).padStart(2,'0')+'m'}
function esc(x){return String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function nval(x,min,max){return Math.min(max,Math.max(min,Number(x)||0))}
function store(){
 try{
  const currentRaw=localStorage.getItem(KEY);
  if(currentRaw!==lastReadRaw)throw Error('Controle foi alterado em outra aba. Nenhum dado sobrescrito; atualize para reconciliar.');
  const old=currentRaw===null?fresh():JSON.parse(currentRaw);
  data.audit=Array.isArray(data.audit)?data.audit:(Array.isArray(old.audit)?old.audit.slice():[]);
  for(const kind of ['sessions','subjects','reviews','plans']){
   const previous=new Map((old[kind]||[]).map(x=>[x.id,x]));
   const current=new Map((data[kind]||[]).map(x=>[x.id,x]));
   for(const id of new Set([...previous.keys(),...current.keys()])){
    const before=previous.get(id)||null,after=current.get(id)||null;
    if(JSON.stringify(before)===JSON.stringify(after))continue;
    const event=kind==='sessions'&&after?.deletedAt&&!before?.deletedAt?'exclusao':
      kind==='sessions'&&before?.deletedAt&&!after?.deletedAt?'restauracao':!before?'criacao':!after?'remocao':'edicao';
    data.audit.push({id:uid(),at:new Date().toISOString(),kind,event,entityId:id,
      before:before?structuredClone(before):null,after:after?structuredClone(after):null});
   }
  }
  const nextRaw=JSON.stringify(data);
  localStorage.setItem(KEY,nextRaw);
  lastReadRaw=nextRaw;
  window.dispatchEvent(new CustomEvent('bm240-study-changed',{detail:{pending:true}}));
  return true;
 }catch(e){alert('Erro ao salvar no navegador: '+e.message);return false}
}
function storeClock(){try{localStorage.setItem(TIMER,JSON.stringify(clock))}catch(e){$('timerStatus').textContent='Falha na persistência do cronômetro: '+e.message}}
function load(){
 const raw=localStorage.getItem(KEY);let d=null;
 if(raw!==null){
  try{d=JSON.parse(raw)}catch{throw Error('Histórico corrompido: dados originais preservados. Não houve substituição.')}
  if(!d||d.schema!==1||!Array.isArray(d.subjects)||!Array.isArray(d.sessions)||!Array.isArray(d.reviews)||
    (d.plans!==undefined&&!Array.isArray(d.plans))||(d.audit!==undefined&&!Array.isArray(d.audit)))
   throw Error('Formato do histórico incompatível: dados originais preservados.');
 }
 data=d||fresh();lastReadRaw=raw;
 data.plans=Array.isArray(data.plans)?data.plans:[];
 data.audit=Array.isArray(data.audit)?data.audit:[];
 const rawClock=localStorage.getItem(TIMER);
 try{clock=rawClock===null?null:JSON.parse(rawClock)}catch{throw Error('Cronômetro corrompido, mantido para recuperação; nenhuma alteração automática.')}
 if(!clock||typeof clock!=='object')clock={running:false,start:0,elapsed:0,subject:'',topic:'',type:'Teoria'};
}
function subject(id){return data.subjects.find(x=>x.id===id)}
function subjectName(id){return subject(id)?.name||'Disciplina não localizada'}
function weekStart(){const d=new Date();d.setDate(d.getDate()-(d.getDay()+6)%7);return today(d)}
function total(arr){return arr.reduce((v,s)=>v+nval(s.minutes,0,1e7),0)}
function relevant(from,to){return data.sessions.filter(s=>!s.deletedAt&&(!from||s.date>=from)&&(!to||s.date<=to))}
function options(id,all){const e=$(id);if(!e)return;const v=e.value;e.replaceChildren();if(all)e.add(new Option('Todas as disciplinas','all'));else e.add(new Option('Selecione',''));for(const s of data.subjects)e.add(new Option(s.name,s.id));if([...e.options].some(o=>o.value===v))e.value=v}
function typeOptions(id,all){const e=$(id),v=e.value;e.replaceChildren();if(all)e.add(new Option('Todos os tipos','all'));for(const t of types)e.add(new Option(t,t));if([...e.options].some(o=>o.value===v))e.value=v}
function refreshOpts(){for(const id of ['timerSubject','sessionSubject','reviewSubject','planSubject'])options(id,false);options('historySubject',true);options('reportSubject',true);typeOptions('timerType',false);typeOptions('sessionType',false);typeOptions('historyType',true)}
function applyDatalist(id,items){
 const host=$(id);if(!host)return;
 host.replaceChildren();
 for(const name of [...new Set(items)].sort((a,b)=>a.localeCompare(b,'pt-BR'))){
  const opt=document.createElement('option');opt.value=name;host.append(opt);
 }
}
function normalized(x){return String(x||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim().toLowerCase()}
function catalogDiscipline(name){
 if(!taxonomy?.disciplines)return null;
 const exact=taxonomy.disciplines.find(d=>normalized(d.name)===normalized(name));
 if(exact)return exact;
 const alias=taxonomy.sourceDisciplineLabels?.find(x=>normalized(x.sourceLabel)===normalized(name));
 return alias?taxonomy.disciplines.find(d=>d.id===alias.discipline)||null:null;
}
function catalogAreas(id){
 const item=subject(id);
 return catalogDiscipline(item?.name)?.areas||[];
}
function catalogSubjects(id,areaName){
 const area=catalogAreas(id).find(a=>normalized(a.name)===normalized(areaName));
 return area?.subjects||[];
}
function catalogSubtopics(id,areaName,specific){
 return catalogSubjects(id,areaName).find(s=>normalized(s.name)===normalized(specific))?.subtopics||[];
}
function seedCatalogDisciplines(){
 if(!Array.isArray(taxonomy?.disciplines))return 0;
 let added=0;
 for(const d of taxonomy.disciplines){
  const aliases=d.id==='math'?['Matemática','Matemática, Lógica e Estatística']:[d.name];
  if(data.subjects.some(s=>aliases.some(n=>normalized(n)===normalized(s.name))))continue;
  const id='bm243-catalog-'+d.id;
  if(data.subjects.some(s=>s.id===id))continue;
  data.subjects.push({id,name:d.name,catalogDiscipline:d.id,color:'#277f79',difficulty:3,weight:1,exam:0,daily:0,weekly:0,monthly:0});
  added++;
 }
 return added; // catálogo apenas em memória até gravação explícita de um evento de estudo
}
function fillSelect(id,items,placeholder,keep=true){
 const e=$(id);if(!e)return;
 const previous=keep?e.value:'';
 e.replaceChildren();
 e.add(new Option(placeholder,''));
 for(const name of [...new Set(items)])e.add(new Option(name,name));
 if(items.includes(previous))e.value=previous;
}
function refreshTaxonomy(){
 if(!taxonomy?.disciplines)return;
 const session=$('sessionSubject').value,sessionArea=$('sessionGeneral').value.trim();
 const areas=catalogAreas(session);
 applyDatalist('bm240GeneralOptions',areas.map(a=>a.name));
 applyDatalist('bm240SpecificOptions',catalogSubjects(session,sessionArea).map(s=>s.name));
 applyDatalist('bm243SessionSubOptions',catalogSubtopics(session,sessionArea,$('sessionSpecific').value.trim()));
 const timer=$('timerSubject').value;
 fillSelect('timerGeneral',catalogAreas(timer).map(a=>a.name),'Selecione a matéria');
 applyDatalist('bm243TimerSpecificOptions',catalogSubjects(timer,$('timerGeneral').value).map(s=>s.name));
 applyDatalist('bm243TimerSubtopicOptions',catalogSubtopics(timer,$('timerGeneral').value,$('timerSpecific').value.trim()));
 const hSub=$('historySubject').value,hA=$('historyGeneral').value.trim(),hS=$('historySpecific').value.trim();
 const allAreas=hSub==='all'?taxonomy.disciplines.flatMap(d=>d.areas):catalogAreas(hSub);
 applyDatalist('bm243HistoryGeneralOptions',allAreas.map(x=>x.name));
 const inArea=allAreas.filter(x=>!hA||normalized(x.name)===normalized(hA));
 applyDatalist('bm243HistorySpecificOptions',inArea.flatMap(x=>x.subjects.map(z=>z.name)));
 applyDatalist('bm243HistorySubOptions',inArea.flatMap(x=>x.subjects.filter(z=>!hS||normalized(z.name)===normalized(hS)).flatMap(z=>z.subtopics)));
}
async function loadTaxonomy(){
 try{
  const r=await fetch('./assets/v245_estudo_catalogo.json',{cache:'default'});
  if(!r.ok)throw Error('Catálogo de estudo indisponível');
  const json=await r.json();
  if(json.format!=='BancoMestreEstudosCatalogoV245'||json.counts?.cards!==1518||
   json.disciplines?.length!==5||json.counts.unknown!==0)throw Error('Catálogo sem auditoria de integridade');
  taxonomy=json;
  const added=seedCatalogDisciplines();
  refresh();
  refreshTaxonomy();
  $('bm240TaxStatus').textContent='5 disciplinas prontas · '+json.counts.areas+' matérias · '+
    json.counts.specificSubjects+' assuntos · '+json.counts.subtopics+' subassuntos. '+(added?added+' disciplinas disponibilizadas sem sobrescrever originais.':'');
  window.dispatchEvent(new CustomEvent('bm243-catalog-ready',{detail:{disciplines:json.counts.disciplines,areas:json.counts.areas}}));
 }catch(e){
  $('bm240TaxStatus').textContent='Catálogo não carregado: '+e.message+'. Disciplinas já cadastradas e texto livre continuam disponíveis.';
 }
}
function go(id){root.querySelectorAll('#tabs button').forEach(b=>b.classList.toggle('active',b.dataset.tab===id));root.querySelectorAll('section.pane').forEach(s=>s.classList.toggle('active',s.id===id));if(id==='painel')renderDashboard();if(id==='relatorios')renderReports();if(id==='historico')renderHistory();if(id==='planejamento')renderSubjects();if(id==='ciclo')renderCycle();if(id==='revisoes')renderReviews();if(id==='backup')renderBackup();if(id==='calendarioControle')renderCalendar();resize()}
function resize(){}
function toggleMessage(id,text){$(id).textContent=text}
function reportRows(){
 const from=$('reportStart').value,to=$('reportEnd').value,subject=$('reportSubject').value;
 return relevant(from||undefined,to||undefined).filter(x=>!subject||subject==='all'||x.subjectId===subject);
}
function renderReports(){
 const rows=reportRows(),minutes=total(rows),
  questions=rows.reduce((v,x)=>v+(Number(x.questions)||0),0),
  correct=rows.reduce((v,x)=>v+(Number(x.correct)||0),0),
  distinctDays=new Set(rows.map(x=>x.date)).size,
  performance=questions?Math.round(correct/questions*100)+'%':'—';
 $('reportMetrics').innerHTML=[
  ['Horas líquidas',timeText(minutes)],
  ['Sessões registradas',String(rows.length)],
  ['Questões e acertos',correct+' / '+questions],
  ['Aproveitamento',performance]
 ].map(x=>'<div class="metric"><span>'+esc(x[0])+'</span><b>'+esc(x[1])+'</b></div>').join('');
 const grouped=new Map(),monthly=new Map(),byType=new Map();
 for(const row of rows){
  const stats=grouped.get(row.subjectId)||{minutes:0,questions:0,correct:0,count:0};
  stats.minutes+=Number(row.minutes)||0;stats.questions+=Number(row.questions)||0;
  stats.correct+=Number(row.correct)||0;stats.count++;grouped.set(row.subjectId,stats);
  const month=row.date.slice(0,7),days=monthly.get(month)||{minutes:0,questions:0,correct:0};
  days.minutes+=Number(row.minutes)||0;days.questions+=Number(row.questions)||0;
  days.correct+=Number(row.correct)||0;monthly.set(month,days);
  byType.set(row.type||'Outros',(byType.get(row.type||'Outros')||0)+(Number(row.minutes)||0));
 }
 const ordered=[...grouped.entries()].sort((a,b)=>b[1].minutes-a[1].minutes);
 $('reportBySubject').innerHTML=ordered.map(([id,st])=>
   '<div class="item"><b>'+esc(subjectName(id))+'</b> · '+esc(timeText(st.minutes))+' · '+st.count+' sessões'+
   '<div class="progress"><i style="width:'+Math.round(st.minutes/Math.max(1,minutes)*100)+'%"></i></div></div>').join('')||
   '<p class="empty">Nenhuma sessão registrada neste período.</p>';
 let topicHost=$('reportByTopic');if(!topicHost){const panel=document.createElement('div');panel.className='panel';panel.style.marginTop='13px';const h=document.createElement('h2');h.textContent='Horas por assunto';topicHost=document.createElement('div');topicHost.id='reportByTopic';panel.append(h,topicHost);$('reportBySubject').closest('.twocol').after(panel);}
 const topics=new Map();
 for(const row of rows){const route=[row.general,row.specific||row.topic,row.subtopic].map(x=>String(x||'').trim()).filter((x,i,a)=>x&&a.indexOf(x)===i);const label=route.join(' › ')||'Sem assunto registrado';const key=JSON.stringify([row.subjectId,label]);const t=topics.get(key)||{id:row.subjectId,label,minutes:0,count:0};t.minutes+=Number(row.minutes)||0;t.count++;topics.set(key,t);}
 topicHost.innerHTML=ordered.map(([id,st])=>'<details open class="item"><summary><b>'+esc(subjectName(id))+'</b> · '+esc(timeText(st.minutes))+'</summary>'+[...topics.values()].filter(t=>t.id===id).sort((a,b)=>b.minutes-a.minutes||a.label.localeCompare(b.label,'pt-BR')).map(t=>'<div class="item"><b>'+esc(t.label)+'</b> · '+esc(timeText(t.minutes))+' · '+t.count+' sessões<div class="progress"><i style="width:'+Math.round(t.minutes/Math.max(1,st.minutes)*100)+'%"></i></div></div>').join('')+'</details>').join('')||'<p class="empty">Nenhuma sessão registrada neste período.</p>';
 $('reportQuestions').innerHTML=ordered.map(([id,st])=>
   '<div class="item"><b>'+esc(subjectName(id))+'</b> · '+st.correct+'/'+st.questions+
   ' acertos · '+(st.questions?Math.round(st.correct/st.questions*100)+'%':'sem questões registradas')+'</div>').join('')||
   '<p class="empty">Sem questões registradas.</p>';
 $('reportByMonth').innerHTML=[...monthly].sort((a,b)=>a[0].localeCompare(b[0])).map(([month,st])=>
   '<div class="item"><b>'+esc(month)+'</b> · '+esc(timeText(st.minutes))+
   ' · '+st.correct+'/'+st.questions+' acertos'+
   '<div class="progress"><i style="width:'+Math.round(st.minutes/Math.max(1,minutes)*100)+'%"></i></div></div>').join('')||
   '<p class="empty">Sem registros mensais para exibir.</p>';
 $('reportByType').innerHTML=[...byType].sort((a,b)=>b[1]-a[1]).map(([kind,value])=>
   '<div class="item"><b>'+esc(kind)+'</b> · '+esc(timeText(value))+
   '<div class="progress"><i style="width:'+Math.round(value/Math.max(1,minutes)*100)+'%"></i></div></div>').join('')||
   '<p class="empty">Nenhuma atividade no período.</p>';
 $('reportStatus').textContent=distinctDays+' dias com estudo · '+rows.length+' sessões verificadas · questões não contabilizadas por flashcards SRS';
}
// VS23: filtros de consulta, sem persistir nem alterar sessões.
function chartTopicLabel(row){return [row.general,row.specific||row.topic,row.subtopic].map(x=>String(x||'').trim()).filter((x,i,a)=>x&&a.indexOf(x)===i).join(' › ')||'Sem assunto registrado'}
function chartOptions(node,items,allLabel){const selected=node.value||'all',sig=JSON.stringify(items);if(node.dataset.bm414Options!==sig){node.replaceChildren(new Option(allLabel,'all'),...items.map(x=>new Option(x.label,x.id)));node.dataset.bm414Options=sig;node.value=items.some(x=>x.id===selected)?selected:'all'}}
function chartRange(rows,period,t,from,to){
 const first=rows.map(x=>x.date).filter(validDate).sort()[0]||t;
 if(period==='custom')return [from||first,to||t];
 if(period==='all')return [first,t];
 if(period==='month')return [t.slice(0,7)+'-01',t];
 return [shift(t,-(Number(period)||14)+1),t];
}
function chartBuckets(from,to){
 const days=Math.round((Date.parse(to+'T12:00:00Z')-Date.parse(from+'T12:00:00Z'))/86400000)+1;
 if(!Number.isFinite(days)||days<1)return [];
 const step=days<=31?1:days<=180?7:Math.max(1,Math.ceil(days/84));
 const result=[];
 for(let i=0;i<days;i+=step){const start=shift(from,i),end=shift(from,Math.min(days-1,i+step-1));result.push({start,end,label:step===1?start.slice(8)+'/'+start.slice(5,7):start.slice(8)+'/'+start.slice(5,7)});}
 return result;
}
function renderSummaryCharts(){
 const all=relevant(),t=today(),ds=$('chartSubject'),ts=$('chartTopic'),period=$('chartPeriod'),fromEl=$('chartFrom'),toEl=$('chartTo');
 if(!ds||!ts||!period)return;
 const subjects=data.subjects.map(s=>({id:String(s.id),label:s.name}));for(const row of all)if(!subjects.some(x=>x.id===String(row.subjectId)))subjects.push({id:String(row.subjectId),label:subjectName(row.subjectId)||'Disciplina não identificada'});
 chartOptions(ds,subjects.sort((a,b)=>a.label.localeCompare(b.label,'pt-BR')),'Todas as disciplinas');
 const discipline=ds.value;const base=all.filter(s=>discipline==='all'||String(s.subjectId)===discipline);
 const topicNames=[...new Set(base.map(chartTopicLabel))].sort((a,b)=>a.localeCompare(b,'pt-BR'));
 chartOptions(ts,topicNames.map(x=>({id:'topic:'+x,label:x})),'Todos os assuntos');
 const chosen=ts.value;const custom=period.value==='custom';$('chartFromWrap').hidden=!custom;$('chartToWrap').hidden=!custom;
 const [from,to]=chartRange(base,period.value,t,fromEl.value,toEl.value);
 const rows=base.filter(s=>s.date>=from&&s.date<=to&&(chosen==='all'||'topic:'+chartTopicLabel(s)===chosen));
 const timeline=$('timeline'),scope=$('chartScope'),hint=$('chartTimelineHint');timeline.replaceChildren();
 $('chartTimelineTitle').textContent='Evolução do tempo estudado';
 $('chartDistributionTitle').textContent=discipline==='all'?'Horas por disciplina':'Horas por assunto';
 if(from>to){scope.textContent='A data inicial deve ser anterior ou igual à final.';hint.textContent='Corrija o período para consultar os gráficos.';$('distribution').textContent='—';$('types').textContent='—';return;}
 const mins=total(rows);scope.textContent=from.split('-').reverse().join('/')+' a '+to.split('-').reverse().join('/')+' · '+timeText(mins)+' · '+rows.length+' sessões';
 const groups=new Map();const bytype=new Map();
 const safeColor=value=>/^#[0-9a-f]{3,8}$/i.test(String(value||''))?value:'#1686bf';
 for(const s of rows){const label=discipline==='all'?(subjectName(s.subjectId)||'Disciplina não identificada'):chartTopicLabel(s);const k=discipline==='all'?String(s.subjectId):label;const obj=groups.get(k)||{label,m:0,color:safeColor(data.subjects.find(x=>x.id===s.subjectId)?.color)};obj.m+=Number(s.minutes)||0;groups.set(k,obj);const type=s.type||'Outros';bytype.set(type,(bytype.get(type)||0)+(Number(s.minutes)||0));}
 const buckets=chartBuckets(from,to);let i=0;const sorted=rows.slice().sort((a,b)=>a.date.localeCompare(b.date));
 for(const b of buckets){b.m=0;b.parts=new Map();while(i<sorted.length&&sorted[i].date<=b.end){const s=sorted[i++];if(s.date<b.start)continue;const k=String(s.subjectId),m=Number(s.minutes)||0;b.m+=m;b.parts.set(k,(b.parts.get(k)||0)+m);}}
 const max=Math.max(60,...buckets.map(b=>b.m));const dateBR=d=>d.split('-').reverse().join('/');
 for(const b of buckets){const btn=document.createElement('button');btn.type='button';btn.className='barcol';const label=dateBR(b.start)+(b.end!==b.start?' a '+dateBR(b.end):'')+' · '+timeText(b.m);btn.title=label;btn.setAttribute('aria-label',label);const bar=document.createElement('div');bar.className='bar';bar.style.cssText='height:'+Math.round(b.m/max*115)+'px;display:flex;flex-direction:column-reverse;overflow:hidden';for(const [id,m] of b.parts){if(m<=0)continue;const part=document.createElement('i');part.style.cssText='height:'+(m/Math.max(.01,b.m)*100)+'%;background:'+safeColor(data.subjects.find(x=>String(x.id)===id)?.color)+';width:100%;flex:none';bar.append(part)}const small=document.createElement('small');small.textContent=b.label;btn.append(bar,small);btn.onclick=()=>{hint.textContent=label};timeline.append(btn);}
 hint.textContent=rows.length?'Barras '+(buckets.some(b=>b.start!==b.end)?'por intervalo':'diárias')+' em horas líquidas. Clique em uma barra para consultar.':'Nenhuma sessão no filtro selecionado.';
 const barHTML=(label,m,color,display)=>'<div class="type-row"><span style="min-width:100px;max-width:48%;overflow-wrap:anywhere">'+esc(label)+'</span><div class="progress" style="flex:1"><i style="width:'+Math.round(m/Math.max(1,mins)*100)+'%;background:'+safeColor(color)+'"></i></div><strong>'+esc(display)+'</strong></div>';
 $('distribution').innerHTML=[...groups.values()].filter(x=>x.m>0).sort((a,b)=>b.m-a.m).map(x=>barHTML(x.label,x.m,x.color,timeText(x.m))).join('')||'<p class="empty">Nenhuma sessão no filtro selecionado.</p>';
 $('types').innerHTML=[...bytype].filter(x=>x[1]>0).sort((a,b)=>b[1]-a[1]).map(([type,m])=>barHTML(type,m,'#1686bf',Math.round(m/Math.max(1,mins)*100)+'%')).join('')||'<p class="empty">Sem registros por tipo no período.</p>';
}
function renderDashboard(){
const t=today(),ws=weekStart(),month=t.slice(0,7),all=relevant(),daily=relevant(t,t),weekly=relevant(ws,t),monthly=relevant().filter(s=>s.date.startsWith(month));
const q=all.reduce((a,x)=>a+(Number(x.questions)||0),0),c=all.reduce((a,x)=>a+(Number(x.correct)||0),0);
const overdue=data.reviews.filter(r=>!r.done&&r.due<=t).length;
$('metrics').innerHTML=[['Hoje',timeText(total(daily))],['Esta semana',timeText(total(weekly))],['Este mês',timeText(total(monthly))],['Acertos',q?Math.round(c/q*100)+'%':'—']].map(x=>'<div class="metric"><span>'+esc(x[0])+'</span><b>'+esc(x[1])+'</b></div>').join('');
renderSummaryCharts();
$('goalSummary').innerHTML=data.subjects.length?data.subjects.map(s=>{const done=total(weekly.filter(x=>x.subjectId===s.id))/60,g=Number(s.weekly)||0,monthDone=total(monthly.filter(x=>x.subjectId===s.id))/60,mg=Number(s.monthly??(g*4.3))||0,dailyDone=total(daily.filter(x=>x.subjectId===s.id))/60,dg=Number(s.daily??(g/7))||0;return '<div class="item"><div class="item-head"><b>'+esc(s.name)+'</b><small>Hoje: '+dailyDone.toFixed(1)+'/'+dg.toFixed(1)+'h · Semana: '+done.toFixed(1)+'/'+g.toFixed(1)+'h · Mês: '+monthDone.toFixed(1)+'/'+mg.toFixed(1)+'h</small></div><div class="progress" style="margin-top:7px"><i style="width:'+Math.min(100,Math.round(done/Math.max(.001,g)*100))+'%"></i></div></div>'}).join(''):'<p class="empty">Cadastre suas disciplinas em Planejamento para definir metas.</p>';
$('performance').innerHTML=data.subjects.map(s=>{const ss=all.filter(x=>x.subjectId===s.id);const questions=ss.reduce((v,x)=>v+(Number(x.questions)||0),0);const correct=ss.reduce((v,x)=>v+(Number(x.correct)||0),0);return questions?'<div class="item"><b>'+esc(s.name)+'</b> · '+correct+'/'+questions+' acertos ('+Math.round(correct/questions*100)+'%)</div>':''}).join('')||'<p class="empty">Registre questões e acertos para visualizar seu desempenho.</p>';
if(overdue)$('metrics').innerHTML+='<div class="metric"><span>Revisões pendentes</span><b>'+overdue+'</b></div>';resize();
}
function renderSubjects(){
$('hoursWeek').value=data.availabilityWeek;$('hoursMonth').value=data.availabilityMonth;
$('subjectRows').innerHTML=data.subjects.map(s=>'<tr><td><span style="color:'+esc(s.color||'#277f79')+'">●</span> '+esc(s.name)+'</td><td><input aria-label="Dificuldade" data-field="difficulty" data-id="'+esc(s.id)+'" type="number" min="1" max="5" value="'+nval(s.difficulty,1,5)+'"></td><td><input aria-label="Peso" data-field="weight" data-id="'+esc(s.id)+'" type="number" min="1" max="5" value="'+nval(s.weight,1,5)+'"></td><td><input aria-label="Questões previstas" data-field="exam" data-id="'+esc(s.id)+'" type="number" min="0" value="'+nval(s.exam,0,10000)+'"></td><td><input aria-label="Meta diária" data-field="daily" data-id="'+esc(s.id)+'" type="number" min="0" step=".25" value="'+nval(s.daily??((s.weekly||0)/7),0,1000)+'"></td><td><input aria-label="Meta semanal" data-field="weekly" data-id="'+esc(s.id)+'" type="number" min="0" step=".25" value="'+nval(s.weekly,0,1000)+'"></td><td><input aria-label="Meta mensal" data-field="monthly" data-id="'+esc(s.id)+'" type="number" min="0" step=".25" value="'+nval(s.monthly??((s.weekly||0)*4.3),0,5000)+'"></td><td><button data-remove-subject="'+esc(s.id)+'" class="danger">Excluir</button></td></tr>').join('')||'<tr><td colspan="8">Nenhuma disciplina cadastrada.</td></tr>';
}
function renderHistory(){
const sid=$('historySubject').value,ty=$('historyType').value,from=$('historyFrom').value,to=$('historyTo').value;
const gf=$('historyGeneral').value.trim().toLocaleLowerCase('pt-BR'),
 sf=$('historySpecific').value.trim().toLocaleLowerCase('pt-BR'),
 uf=$('historySubtopic').value.trim().toLocaleLowerCase('pt-BR');
const a=data.sessions.filter(s=>!s.deletedAt&&(sid==='all'||!sid||s.subjectId===sid)&&(ty==='all'||!ty||s.type===ty)&&(!from||s.date>=from)&&(!to||s.date<=to)&&(!gf||String(s.general||'').toLocaleLowerCase('pt-BR').includes(gf))&&(!sf||String(s.specific||'').toLocaleLowerCase('pt-BR').includes(sf))&&(!uf||String(s.subtopic||'').toLocaleLowerCase('pt-BR').includes(uf))).sort((a,b)=>(b.date+' '+(b.startTime||'')).localeCompare(a.date+' '+(a.startTime||'')));
$('historyCount').textContent=a.length+' sessões · '+timeText(total(a));$('historyRows').innerHTML=a.map(s=>'<tr><td>'+esc(s.date)+' '+esc(s.startTime||'')+'</td><td><b>'+esc(subjectName(s.subjectId))+'</b><div class="muted">'+esc([s.general,s.specific,s.subtopic,s.topic].filter(Boolean).join(' → '))+'</div>'+(s.notes?'<details><summary>Anotações</summary>'+esc(s.notes)+'</details>':'')+'</td><td>'+esc(s.type)+'</td><td>'+esc(timeText(s.minutes))+'</td><td>'+ (s.questions?esc(s.correct)+'/'+esc(s.questions):'—')+'</td><td><button data-edit-session="'+esc(s.id)+'">Editar</button> <button class="danger" data-delete-session="'+esc(s.id)+'">Excluir</button></td></tr>').join('')||'<tr><td colspan="6">Sem atividades para esses filtros.</td></tr>';resize();return a;
}
function renderCycle(){
const c=data.cycle,i=nval(data.cycleIndex,0,1e5),cur=c.length?c[i%c.length]:null;
$('cycleCurrent').innerHTML=cur?'<div class="notice"><b>Próximo bloco:</b> '+esc(subjectName(cur.subjectId))+' · '+esc(cur.minutes)+' min · etapa '+(i%c.length+1)+'/'+c.length+' (ciclo '+(Math.floor(i/c.length)+1)+') <button id="cycleNext" class="primary" style="margin-left:8px">Concluir bloco e avançar</button></div>':'<p class="empty">Gere um ciclo após cadastrar disciplinas.</p>';
$('cycleList').innerHTML=c.map((x,j)=>'<div class="item"><div class="item-head"><div><b>'+(j+1)+'. '+esc(subjectName(x.subjectId))+'</b> · '+esc(x.minutes)+' min '+(cur&&j===i%c.length?'<span class="tag">Atual</span>':'')+'</div><div class="row"><button data-cycle-move="-1" data-cycle-index="'+j+'" aria-label="Mover bloco acima">↑</button><button data-cycle-move="1" data-cycle-index="'+j+'" aria-label="Mover bloco abaixo">↓</button><button data-cycle-delete="'+j+'" class="danger" aria-label="Remover bloco">Excluir</button></div></div></div>').join('');resize();
}
function renderReviews(){
const t=today();root.querySelectorAll('[data-review-filter]').forEach(b=>b.classList.toggle('active',b.dataset.reviewFilter===reviewFilter));
const a=data.reviews.filter(r=>reviewFilter==='all'||reviewFilter==='done'&&r.done||reviewFilter==='due'&&!r.done&&r.due<=t||reviewFilter==='future'&&!r.done&&r.due>t).sort((a,b)=>a.due.localeCompare(b.due));
$('reviewRows').innerHTML=a.map(r=>'<div class="item"><div class="item-head"><div><b>'+esc(r.topic)+'</b> · '+esc(subjectName(r.subjectId))+'<div class="muted">'+esc(r.due)+(r.done?' · concluída':r.due<t?' · atrasada':'')+'</div></div><div class="row">'+(!r.done?'<button data-complete-review="'+esc(r.id)+'" class="primary">Concluir</button>':'<button data-reopen-review="'+esc(r.id)+'">Reabrir</button>')+'<button data-delete-review="'+esc(r.id)+'" class="danger">Excluir</button></div></div></div>').join('')||'<p class="empty">Nenhuma revisão neste filtro.</p>';resize();
}
function renderBackup(){
 $('backupSummary').textContent=data.subjects.length+' disciplinas, '+relevant().length+' sessões ativas, '+data.sessions.filter(x=>x.deletedAt).length+' excluídas recuperáveis, '+data.reviews.length+' revisões, '+data.plans.length+' atividades planejadas e '+data.audit.length+' eventos auditáveis.';
 $('bm240-local-status').textContent='Salvo neste navegador · sincronização remota depende de autenticação e confirmação de leitura pelo Drive. Consulte o indicador do cabeçalho.';
 const deleted=data.sessions.filter(x=>x.deletedAt);
 const events=data.audit.slice(-35).reverse();
 $('bm240-audit').innerHTML=(deleted.length?'<h4>Sessões excluídas recuperáveis</h4>'+deleted.map(x=>'<div class="item"><b>'+esc(x.date)+' · '+esc(subjectName(x.subjectId))+'</b> · '+esc(timeText(x.minutes))+' <button data-restore-session="'+esc(x.id)+'">Restaurar</button></div>').join(''):'<p class="muted">Nenhuma sessão excluída.</p>')+
  '<h4>Últimas alterações</h4>'+(events.map(e=>'<div class="item small">'+esc(e.at)+' · '+esc(e.kind)+' · '+esc(e.event)+' · '+esc(e.entityId)+'</div>').join('')||'<p class="muted">Nenhuma alteração registrada.</p>');
}
function refresh(){refreshOpts();refreshTaxonomy();renderDashboard();renderReports();renderHistory();renderSubjects();renderCycle();renderReviews();renderCalendar();renderBackup();resize()}
function addSession(s,review){if(!subject(s.subjectId))throw Error('Selecione uma disciplina cadastrada.');if(!(Number(s.minutes)>0))throw Error('Duração inválida.');if(!Number.isInteger(s.questions)||!Number.isInteger(s.correct)||s.correct<0||s.questions<0||s.correct>s.questions)throw Error('Acertos não podem exceder as questões.');
if(editId){const old=data.sessions.find(x=>x.id===editId&&!x.deletedAt);if(!old)throw Error('Sessão original não localizada.');Object.assign(old,s);editId=null;}
 else{if(s.id&&data.sessions.some(x=>x.id===s.id))throw Error('Cronômetro já registrado; duplicidade bloqueada.');data.sessions.push({...s,id:s.id||uid(),createdAt:new Date().toISOString()})}
if(!store())throw Error('Não foi possível gravar.');refresh();}
function clearForm(){$('sessionForm').reset();refreshTaxonomy();$('sessionDate').value=today();$('sessionTime').value=new Date().toTimeString().slice(0,5);editId=null;$('sessionSubmit').textContent='Salvar sessão';$('sessionQuestions').value='0';$('sessionCorrect').value='0'}
function runTime(){return Math.max(0,Number(clock.elapsed)||0)+(clock.running?Math.max(0,Date.now()-clock.start):0)}
function showTimer(){if(clock.running&&clock.alarmMinutes>0&&!clock.alarmed&&runTime()>=clock.alarmMinutes*60000){clock.alarmed=true;storeClock();toggleMessage('timerStatus','Alarme: tempo planejado alcançado.');alert('Alarme de estudo: '+clock.alarmMinutes+' minutos líquidos concluídos.')}const sec=Math.floor(runTime()/1000),hh=String(Math.floor(sec/3600)).padStart(2,'0'),mm=String(Math.floor(sec%3600/60)).padStart(2,'0'),ss=String(sec%60).padStart(2,'0');$('timerDisplay').textContent=hh+':'+mm+':'+ss;$('timerSubject').disabled=clock.running||runTime()>0;for(const id of ['timerTopic','timerGeneral','timerSpecific','timerSubtopic'])$(id).disabled=clock.running||runTime()>0;$('timerType').disabled=clock.running||runTime()>0;$('timerAlarm').disabled=clock.running||runTime()>0;$('timerPause').disabled=!clock.running;$('timerSave').disabled=runTime()<1000;$('timerStart').disabled=clock.running}
function saveTimer(){const ms=runTime();if(ms<1000)return;try{const date=today();const s={date,startTime:new Date(clock.firstStartedAt||Date.now()-ms).toTimeString().slice(0,5),subjectId:clock.subject,general:clock.general||'',specific:clock.specific||'',subtopic:clock.subtopic||'',topic:clock.topic,type:clock.type,minutes:Math.max(.02,Math.round(ms/600)/100),questions:0,correct:0,notes:'',id:clock.sessionId||uid()};const previousEdit=editId;editId=null;try{addSession(s,false)}finally{editId=previousEdit}clock={running:false,start:0,elapsed:0,firstStartedAt:0,subject:'',topic:'',type:'Teoria'};storeClock();mirrorTimer();showTimer();toggleMessage('timerStatus','Sessão salva com sucesso. Questões e anotações podem ser adicionadas no Histórico.');}catch(e){toggleMessage('timerStatus',e.message)}}
function weight(s){return Math.max(.1,Number(s.difficulty)||1)*Math.max(.1,Number(s.weight)||1)*Math.max(1,Number(s.exam)||1)}
function dl(name,contents,mime){const blob=new Blob([contents],{type:mime}),url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000)}
function csv(rows){const fields=['date','startTime','subject','general','specific','subtopic','topic','type','minutes','questions','correct','notes'];const cell=x=>'"'+(/^[=+@\-\t\r]/.test(String(x??''))?"'":'')+String(x??'').replace(/"/g,'""')+'"';return [fields.join(';'),...rows.map(s=>[s.date,s.startTime,subjectName(s.subjectId),s.general,s.specific,s.subtopic,s.topic,s.type,s.minutes,s.questions,s.correct,s.notes].map(cell).join(';'))].join('\r\n')}

const cal={mode:'month',date:today(),selected:today()};
function calParse(s){return new Date(s+'T12:00:00')}
function calMove(s,mode,n){
 const d=calParse(s);
 if(mode==='month')return today(new Date(d.getFullYear(),d.getMonth()+n,1,12))
 else d.setDate(d.getDate()+n*(mode==='week'?7:1));
 return today(d);
}
function renderCalendar(){
 if(!$('calGrid'))return;
 const base=calParse(cal.date),mode=cal.mode;
 let dates=[];
 if(mode==='day')dates=[cal.date];
 else if(mode==='week'){
  const w=new Date(base);w.setDate(w.getDate()-(w.getDay()+6)%7);
  dates=Array.from({length:7},(_,i)=>today(new Date(w.getFullYear(),w.getMonth(),w.getDate()+i)));
 }else{
  const y=base.getFullYear(),m=base.getMonth(),first=new Date(y,m,1),offset=(first.getDay()+6)%7,last=new Date(y,m+1,0).getDate();
  dates=Array.from({length:offset+last},(_,i)=>i<offset?'':today(new Date(y,m,1+i-offset)));
 }
 $('calTitle').textContent=mode==='month'?base.toLocaleDateString('pt-BR',{month:'long',year:'numeric'}):mode==='week'?'Semana de '+dates[0]+' a '+dates[6]:'Dia '+cal.date;
 root.querySelectorAll('[data-cal-mode]').forEach(b=>b.classList.toggle('active',b.dataset.calMode===mode));
 $('calGrid').innerHTML=(mode==='month'?'<div class="bm240-weeklabels">'+['Seg','Ter','Qua','Qui','Sex','Sáb','Dom'].map(n=>'<span>'+n+'</span>').join('')+'</div>':'')+
 '<div class="bm240-days">'+dates.map(day=>{
 if(!day)return '<div class="bm240-pad"></div>';
 const done=total(relevant(day,day));
 const plans=data.plans.filter(p=>!p.deletedAt&&p.date===day);
 const pending=plans.filter(p=>!p.doneAt).length;
 const label=calParse(day).toLocaleDateString('pt-BR',{weekday:mode==='day'?'long':'short',day:'2-digit'});
 return '<button type="button" class="bm240-day'+(cal.selected===day?' selected':'')+'" data-cal-day="'+day+'" aria-label="'+esc(day)+'"><b>'+esc(label)+'</b><span>'+esc(timeText(done))+'</span><small>'+plans.length+' previstas · '+pending+' pendentes</small></button>';
 }).join('')+'</div>';
 const when=cal.selected;
 $('calDayTitle').textContent='Atividades de '+calParse(when).toLocaleDateString('pt-BR',{weekday:'long',day:'2-digit',month:'long'});
 $('planDate').value=when;
 const active=relevant(when,when),scheduled=data.plans.filter(p=>p.date===when&&!p.deletedAt);
 $('calDaySummary').textContent=active.length+' sessões realizadas · '+timeText(total(active))+' efetivos · '+scheduled.filter(x=>!x.doneAt).length+' tarefas pendentes';
 $('calPlans').innerHTML=scheduled.map(p=>'<div class="item"><div class="item-head"><div><b>'+esc(subjectName(p.subjectId))+'</b> · '+esc(p.topic)+' <span class="tag">'+esc(p.minutes)+' min previstos</span><div class="muted">'+(p.doneAt?'Planejamento concluído (não gera horas nem SRS)':'Pendente')+'</div></div><div class="row"><button data-cal-toggle="'+esc(p.id)+'">'+(p.doneAt?'Reabrir':'Concluir')+'</button><button class="danger" data-cal-remove="'+esc(p.id)+'">Excluir</button></div></div></div>').join('')||'<p class="muted">Nenhuma tarefa planejada para esta data.</p>';
}


function previewLegacy(){
 const raw=localStorage.getItem('BM184_STUDY_SESSIONS_V1');
 if(!raw)return {valid:[],rejected:[],duplicates:0};
 const values=JSON.parse(raw);if(!Array.isArray(values)||values.length>6000)throw Error('Histórico legado inválido; nada será importado');
 const valid=[],rejected=[];let duplicates=0;
 for(const s of values){
  const match=s&&typeof s.id==='string'&&validDate(s.day)&&String(s.discipline||'').trim()&&
   Number.isInteger(s.minutes)&&s.minutes>=1&&s.minutes<=1440;
  if(!match){rejected.push(s?.id||'(sem ID)');continue}
  const id='BM184:'+s.id,existing=data.sessions.find(x=>x.id===id);
  if(existing){duplicates++;continue}
  valid.push({id,date:s.day,startTime:'',subjectName:String(s.discipline).trim().slice(0,120),
   topic:String(s.subject||'').slice(0,220),type:types.includes(s.activity)?s.activity:'Outros',
   minutes:s.minutes,questions:0,correct:0,notes:String(s.note||'').slice(0,3000),
   provenance:{source:'BM184_STUDY_SESSIONS_V1',sourceId:s.id,verified:'registro local com duração e data'}});
 }
 return {valid,rejected,duplicates};
}
function importActiveControl(){
 const sourceKey='BM_CONTROLE_ESTUDOS_V238',raw=localStorage.getItem(sourceKey);
 if(!raw){$('bm240-import-active-status').textContent='Nenhuma sessão da versão principal foi encontrada neste navegador.';return}
 let source;
 try{source=JSON.parse(raw)}catch{throw Error('Histórico principal corrompido; não foi modificado nem importado')}
 if(!source||source.schema!==1||!Array.isArray(source.subjects)||!Array.isArray(source.sessions))
  throw Error('Histórico principal com formato incompatível. Nada importado.');
 const labels=new Map(source.subjects.filter(x=>x&&typeof x.id==='string'&&typeof x.name==='string').map(x=>[x.id,x.name.trim()]));
 const existingIds=new Set(data.sessions.map(x=>x.id));
 const proposals=[],rejected=[];
 for(const row of source.sessions){
  if(!row||typeof row.id!=='string'||!row.id||row.deletedAt)continue;
  const name=labels.get(row.subjectId);
  if(!name||!validDate(row.date)||!(Number(row.minutes)>0)||Number(row.minutes)>1440||
   !Number.isInteger(row.questions)||row.questions<0||!Number.isInteger(row.correct)||
   row.correct<0||row.correct>row.questions){rejected.push(row.id);continue}
  const id='V239:'+row.id;
  if(existingIds.has(id))continue;
  existingIds.add(id);
  proposals.push({...structuredClone(row),id,sourceId:row.id,sourceSubject:name,
   provenance:{source:'BM_CONTROLE_ESTUDOS_V238',sourceId:row.id,importedAt:new Date().toISOString(),status:'registro local validado'}});
 }
 $('bm240-import-active-status').textContent=proposals.length+' sessões verificáveis novas · '+rejected.length+' ignoradas por falta de evidência.';
 if(!proposals.length)return;
 if(!confirm('Importar '+proposals.length+' sessões do portal anterior para o Controle V245? Os originais e o cronômetro principal não serão modificados.'))return;
 const subjects=new Map(data.subjects.map(x=>[x.name.toLocaleLowerCase('pt-BR'),x.id]));
 for(const record of proposals){
  let subjectId=subjects.get(record.sourceSubject.toLocaleLowerCase('pt-BR'));
  if(!subjectId){
   subjectId=uid();
   data.subjects.push({id:subjectId,name:record.sourceSubject,color:'#277f79',difficulty:3,weight:1,exam:0,daily:0,weekly:0,monthly:0});
   subjects.set(record.sourceSubject.toLocaleLowerCase('pt-BR'),subjectId);
  }
  record.subjectId=subjectId;
  delete record.sourceSubject;
  data.sessions.push(record);
 }
 if(!store())throw Error('Não foi possível salvar a importação na base de testes');
 refresh();
 $('bm240-import-active-status').textContent=proposals.length+' sessões incorporadas ao Controle V245, sem alterar os originais do portal anterior.';
}

function importLegacy(){
 const report=previewLegacy();
 $('bm240-import-preview').textContent=report.valid.length+' sessões verificáveis · '+report.duplicates+' já importadas · '+report.rejected.length+' rejeitadas por falta de dados.';
 if(!report.valid.length)return;
 if(!confirm('Importar '+report.valid.length+' sessões verificáveis do diário V184, sem alterar os originais?'))return;
 const before=localStorage.getItem(KEY);
 localStorage.setItem('BM245_BEFORE_LEGACY_IMPORT_'+new Date().toISOString().replace(/[:.]/g,'-'),before||JSON.stringify(fresh()));
 const names=new Map(data.subjects.map(x=>[x.name.toLocaleLowerCase('pt-BR'),x.id]));
 for(const row of report.valid){
  let id=names.get(row.subjectName.toLocaleLowerCase('pt-BR'));
  if(!id){id=uid();data.subjects.push({id,name:row.subjectName,color:'#277f79',difficulty:3,weight:1,exam:0,daily:0,weekly:0,monthly:0});names.set(row.subjectName.toLocaleLowerCase('pt-BR'),id)}
  const {subjectName,...session}=row;data.sessions.push({...session,subjectId:id});
 }
 if(!store())throw Error('A importação não pôde ser persistida');
 refresh();$('bm240-import-preview').textContent=report.valid.length+' sessões importadas com origem e trilha de auditoria. Originais V184 intactos.';
}

function init(){
load();$('sessionDate').value=today();$('sessionTime').value=new Date().toTimeString().slice(0,5);$('reviewDue').value=shift(today(),1);
for(const b of root.querySelectorAll('#tabs [data-tab]'))b.addEventListener('click',()=>go(b.dataset.tab));for(const b of root.querySelectorAll('[data-goto]'))b.addEventListener('click',()=>go(b.dataset.goto));
$('calGrid').addEventListener('click',e=>{const b=e.target.closest('[data-cal-day]');if(!b)return;cal.selected=b.dataset.calDay;cal.date=b.dataset.calDay;renderCalendar()});
 root.querySelectorAll('[data-cal-mode]').forEach(b=>b.addEventListener('click',()=>{cal.mode=b.dataset.calMode;renderCalendar()}));
 $('calPrev').onclick=()=>{cal.date=calMove(cal.date,cal.mode,-1);cal.selected=cal.date;renderCalendar()};
 $('calNext').onclick=()=>{cal.date=calMove(cal.date,cal.mode,1);cal.selected=cal.date;renderCalendar()};
 $('calToday').onclick=()=>{cal.date=cal.selected=today();renderCalendar()};
 $('bm240-open-srs').addEventListener('click',()=>{
  const panel=document.getElementById('calendario');
  if(!panel||typeof window.section!=='function'){
   $('bm240-srs-status').textContent='Agenda histórica indisponível nesta sessão; SRS preservado.';
   return;
  }
  const c=window.BM141Calendar?.counts?.();
  $('bm240-srs-status').textContent=c&&Number.isFinite(c.verified)?
   c.verified+' datas históricas conhecidas; verifique atualidade. SRS não modificado.':
   'Abrindo planejamento SRS histórico sem alterações.';
  window.section('calendario');
 });
 $('planForm').addEventListener('submit',e=>{e.preventDefault();const date=$('planDate').value,sub=$('planSubject').value,topic=$('planTopic').value.trim(),minutes=Number($('planMinutes').value);if(!validDate(date)||!subject(sub)||!topic||!Number.isInteger(minutes)||minutes<5||minutes>1440){toggleMessage('planStatus','Confira a data, disciplina, assunto e minutos.');return}data.plans.push({id:uid(),date,subjectId:sub,topic,minutes,createdAt:new Date().toISOString()});if(store()){cal.selected=cal.date=date;$('planTopic').value='';toggleMessage('planStatus','Atividade planejada e salva localmente.');renderCalendar()}});
 $('calPlans').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;const id=b.dataset.calToggle||b.dataset.calRemove;const p=data.plans.find(x=>x.id===id&&!x.deletedAt);if(!p)return;if(b.dataset.calRemove){p.deletedAt=new Date().toISOString()}else if(p.doneAt)delete p.doneAt;else p.doneAt=new Date().toISOString();store();renderCalendar()});
 $('timerSubject').value=clock.subject;
 $('timerGeneral').value=clock.general||'';$('timerSpecific').value=clock.specific||'';
 $('timerSubtopic').value=clock.subtopic||'';$('timerTopic').value=clock.topic;
 $('timerType').value=clock.type;$('timerAlarm').value=clock.alarmMinutes||0;
$('timerStart').addEventListener('click',()=>{if(!clock.running){if(clock.transferPending||clock.availableForTransfer){toggleMessage('timerStatus','Transferência bloqueada: sincronize e confirme o Drive antes de continuar.');return}if(!runTime()){if(data.activeTimer&&data.activeTimer.ownerId!==device){toggleMessage('timerStatus','Existe uma sessão em outro dispositivo. Pause e sincronize-a antes de assumir.');return}if(!subject($('timerSubject').value)){toggleMessage('timerStatus','Cadastre e selecione uma disciplina antes de iniciar.');return}clock.sessionId=clock.sessionId||uid();clock.ownerId=device;clock.subject=$('timerSubject').value;
  clock.general=$('timerGeneral').value.trim();
  clock.specific=$('timerSpecific').value.trim();
  clock.subtopic=$('timerSubtopic').value.trim();
  clock.topic=$('timerTopic').value.trim()||[clock.specific,clock.subtopic].filter(Boolean).join(' — ')||clock.general;
  clock.type=$('timerType').value;clock.alarmMinutes=nval($('timerAlarm').value,0,600);clock.alarmed=false}clock.availableForTransfer=false;clock.start=Date.now();if(!clock.firstStartedAt)clock.firstStartedAt=clock.start;clock.running=true;storeClock();mirrorTimer();showTimer()}});
$('timerPause').addEventListener('click',()=>{clock.elapsed=runTime();clock.start=0;clock.running=false;clock.availableForTransfer=false;storeClock();mirrorTimer();showTimer()});
$('timerRelease').addEventListener('click',()=>{
  if(!runTime()){toggleMessage('timerStatus','Nenhum período iniciado para transferir.');return}
  if(clock.running){clock.elapsed=runTime();clock.start=0;clock.running=false}
  if(clock.ownerId&&clock.ownerId!==device){toggleMessage('timerStatus','Este dispositivo não é o proprietário da sessão.');return}
  clock.ownerId=device;clock.sessionId=clock.sessionId||uid();
  clock.availableForTransfer=true;
  storeClock();
  if(!mirrorTimer()){toggleMessage('timerStatus','Falha ao liberar: histórico não salvo.');return}
  showTimer();
  toggleMessage('timerStatus','Sessão pausada e disponível para transferência depois que o Drive confirmar a sincronização.');
 });
 $('timerReclaim').addEventListener('click',async()=>{
  if(!clock.availableForTransfer||clock.ownerId!==device){toggleMessage('timerStatus','Não há transferência local para cancelar.');return}
  const token=window.BM239DriveGlobal?.writeToken?.();
  if(!token){toggleMessage('timerStatus','Para cancelar com segurança, conecte o Drive e confirme a propriedade da sessão.');return}
  toggleMessage('timerStatus','Verificando a propriedade atual da sessão no Drive…');
  try{
   const allowed=await window.BM240ControlDrive?.verifyTimerOwnership(token,clock.sessionId,device);
   if(!allowed)throw Error('A sessão já não pertence exclusivamente a este dispositivo ou ainda não foi confirmada no Drive');
   clock.availableForTransfer=false;clock.transferPending=true;
   storeClock();if(!mirrorTimer())throw Error('Falha no salvamento local');
   toggleMessage('timerStatus','Cancelamento gravado localmente. Sincronize novamente antes de retomar.');
  }catch(e){toggleMessage('timerStatus','Cancelamento não aplicado: '+e.message)}
 });
 $('timerClaim').addEventListener('click',()=>{
 const remote=data.activeTimer;
 if(clock.running||runTime()>0){toggleMessage('timerStatus','Encerre o tempo local antes de transferir.');return}
 if(!remote){toggleMessage('timerStatus','Nenhuma sessão sincronizada para transferir.');return}
 if(!remote.availableForTransfer){toggleMessage('timerStatus','Sessão ainda não foi liberada para transferência. Pause no aparelho de origem e sincronize o Drive.');return}
 if(remote.running){toggleMessage('timerStatus','O cronômetro remoto está em execução. Pause-o e sincronize no aparelho de origem.');return}
 if(!subject(remote.subject)){toggleMessage('timerStatus','A disciplina sincronizada não está cadastrada.');return}
 clock={...remote,ownerId:device,running:false,start:0,availableForTransfer:false,transferPending:true};
 delete clock.updatedAt;
 if(!mirrorTimer()){toggleMessage('timerStatus','Falha ao assumir sessão; dados anteriores preservados.');return}
 storeClock();$('timerSubject').value=clock.subject;
 refreshTaxonomy();$('timerGeneral').value=clock.general||'';
 $('timerSpecific').value=clock.specific||'';$('timerSubtopic').value=clock.subtopic||'';
 $('timerTopic').value=clock.topic;$('timerType').value=clock.type;
 showTimer();toggleMessage('timerStatus','Sessão pausada assumida localmente. Sincronize no Drive antes de retomar.');
 });
 $('timerSave').addEventListener('click',saveTimer);$('timerDiscard').addEventListener('click',()=>{if(!runTime()||window.BM240DiscardConfirmed===true||confirm('Descartar o tempo ainda não salvo?')){clock={running:false,start:0,elapsed:0,subject:'',topic:'',type:'Teoria'};storeClock();mirrorTimer();showTimer()}});
$('sessionForm').addEventListener('submit',e=>{e.preventDefault();try{const s={date:$('sessionDate').value,startTime:$('sessionTime').value,minutes:Number($('sessionMinutes').value),subjectId:$('sessionSubject').value,type:$('sessionType').value,topic:$('sessionTopic').value.trim(),general:$('sessionGeneral').value.trim(),specific:$('sessionSpecific').value.trim(),subtopic:$('sessionSubtopic').value.trim(),questions:Number($('sessionQuestions').value),correct:Number($('sessionCorrect').value),notes:$('sessionNotes').value};if(!validDate(s.date))throw Error('Informe uma data válida.');addSession(s,false);clearForm();toggleMessage('sessionStatus','Sessão salva e indicadores atualizados.')}catch(ex){toggleMessage('sessionStatus',ex.message)}});
$('sessionSubject').addEventListener('change',()=>{$('sessionGeneral').value='';$('sessionSpecific').value='';$('sessionSubtopic').value='';refreshTaxonomy()});
 $('sessionGeneral').addEventListener('input',()=>{$('sessionSpecific').value='';$('sessionSubtopic').value='';refreshTaxonomy()});
 $('sessionSpecific').addEventListener('input',()=>{$('sessionSubtopic').value='';refreshTaxonomy()});
 $('timerSubject').addEventListener('change',()=>{$('timerGeneral').value='';$('timerSpecific').value='';$('timerSubtopic').value='';refreshTaxonomy()});
 $('timerGeneral').addEventListener('change',()=>{$('timerSpecific').value='';$('timerSubtopic').value='';refreshTaxonomy()});
 $('timerSpecific').addEventListener('input',()=>{$('timerSubtopic').value='';refreshTaxonomy()});
 for(const id of ['historySubject','historyGeneral','historySpecific'])$(id).addEventListener('input',refreshTaxonomy);
 $('bm240ImportDisciplines').addEventListener('click',()=>{if(!taxonomy?.disciplines){void loadTaxonomy();return}const added=seedCatalogDisciplines();refresh();refreshTaxonomy();$('bm240TaxStatus').textContent=added+' disciplinas disponíveis, sem duplicar nomes ou substituir registros.'});
 void loadTaxonomy();
 $('sessionCancel').addEventListener('click',()=>{clearForm();toggleMessage('sessionStatus','')});
for(const id of ['reportSubject','reportStart','reportEnd'])$(id).addEventListener('change',renderReports);
for(const id of ['chartSubject','chartTopic','chartPeriod','chartFrom','chartTo'])$(id)?.addEventListener('change',()=>{if(id==='chartSubject')$('chartTopic').value='all';renderSummaryCharts()});
 $('reportClear').addEventListener('click',()=>{$('reportStart').value='';$('reportEnd').value='';$('reportSubject').value='all';renderReports()});
 $('reportCsv').addEventListener('click',()=>dl('banco-mestre-relatorio-'+today()+'.csv',csv(reportRows()),'text/csv;charset=utf-8'));
 for(const id of ['historySubject','historyType','historyFrom','historyTo','historyGeneral','historySpecific','historySubtopic'])$(id).addEventListener('change',renderHistory);
$('historyClear').addEventListener('click',()=>{for(const id of ['historyFrom','historyTo','historyGeneral','historySpecific','historySubtopic'])$(id).value='';$('historySubject').value='all';$('historyType').value='all';renderHistory()});
$('historyCsv').addEventListener('click',()=>dl('controle-estudos-filtrado-'+today()+'.csv',csv(renderHistory()),'text/csv;charset=utf-8'));
$('historyRows').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;const id=b.dataset.editSession||b.dataset.deleteSession;const s=data.sessions.find(x=>x.id===id);if(!s)return;
if(b.dataset.deleteSession){if(confirm('Mover esta sessão para registros excluídos? Ela poderá ser recuperada pelo Histórico de alterações.')){s.deletedAt=new Date().toISOString();store();refresh()}}else{editId=id;go('registro');$('sessionDate').value=s.date;$('sessionTime').value=s.startTime||'';$('sessionMinutes').value=s.minutes;$('sessionSubject').value=s.subjectId;$('sessionType').value=s.type;$('sessionTopic').value=s.topic||'';$('sessionGeneral').value=s.general||'';$('sessionSpecific').value=s.specific||'';$('sessionSubtopic').value=s.subtopic||'';refreshTaxonomy();$('sessionQuestions').value=s.questions||0;$('sessionCorrect').value=s.correct||0;$('sessionNotes').value=s.notes||'';$('sessionReview').value='0';$('sessionSubmit').textContent='Atualizar sessão';$('sessionForm').scrollIntoView({block:'nearest'})}});
$('subjectForm').addEventListener('submit',e=>{e.preventDefault();const name=$('subjectName').value.trim();if(!name)return;if(data.subjects.some(x=>x.name.toLocaleLowerCase('pt-BR')===name.toLocaleLowerCase('pt-BR'))){toggleMessage('subjectStatus','Disciplina já cadastrada.');return}
data.subjects.push({id:uid(),name,color:$('subjectColor').value,difficulty:nval($('subjectDiff').value,1,5),weight:nval($('subjectWeight').value,1,5),exam:nval($('subjectExam').value,0,10000),daily:nval($('subjectDaily').value,0,1000),weekly:nval($('subjectWeekly').value,0,1000),monthly:Math.round(nval($('subjectWeekly').value,0,1000)*4.3*4)/4});store();$('subjectName').value='';toggleMessage('subjectStatus','Disciplina cadastrada.');refresh()});
$('subjectRows').addEventListener('change',e=>{const el=e.target,id=el.dataset.id,field=el.dataset.field;if(!id||!field)return;const s=subject(id);if(!s)return;s[field]=nval(el.value,field==='difficulty'||field==='weight'?1:0,(field==='difficulty'||field==='weight')?5:(field==='weekly'||field==='monthly'||field==='daily')?1000:10000);store();refresh()});
$('subjectRows').addEventListener('click',e=>{const id=e.target.dataset.removeSubject;if(!id)return;if(data.sessions.some(s=>s.subjectId===id)||data.reviews.some(r=>r.subjectId===id)){alert('Disciplina vinculada a sessões ou revisões. Não será excluída para preservar o histórico.');return}
if(confirm('Excluir esta disciplina sem sessões?')){data.subjects=data.subjects.filter(s=>s.id!==id);data.cycle=data.cycle.filter(x=>x.subjectId!==id);data.cycleIndex=0;store();refresh()}});
$('saveAvailability').addEventListener('click',()=>{data.availabilityWeek=nval($('hoursWeek').value,0,1000);data.availabilityMonth=nval($('hoursMonth').value,0,5000);store();refresh()});
$('allocate').addEventListener('click',()=>{if(!data.subjects.length){alert('Cadastre as disciplinas.');return}data.availabilityWeek=nval($('hoursWeek').value,0,1000);data.availabilityMonth=nval($('hoursMonth').value,0,5000);const sum=data.subjects.reduce((a,s)=>a+weight(s),0);
for(const s of data.subjects){s.weekly=Math.round(data.availabilityWeek*weight(s)/sum*4)/4;s.daily=Math.round(s.weekly/7*4)/4;s.monthly=Math.round(data.availabilityMonth*weight(s)/sum*4)/4}store();refresh()});
$('generateCycle').addEventListener('click',()=>{if(!data.subjects.length){alert('Cadastre uma disciplina primeiro.');return}const count=nval($('cycleBlocks').value,1,60),minutes=nval($('cycleMinutes').value,10,240),weights=data.subjects.map(s=>weight(s)),sum=weights.reduce((a,b)=>a+b,0);const remaining=weights.map(w=>w/sum*count),arr=[];let last=null;
for(let k=0;k<count;k++){let best=-1,score=-Infinity;for(let j=0;j<remaining.length;j++){let v=remaining[j]-(data.subjects[j].id===last&&data.subjects.length>1?.55:0);if(v>score){score=v;best=j}}arr.push({subjectId:data.subjects[best].id,minutes});remaining[best]-=1;last=data.subjects[best].id}data.cycle=arr;data.cycleIndex=0;store();renderCycle()});
$('cycleCurrent').addEventListener('click',e=>{if(e.target.id==='cycleNext'){data.cycleIndex++;store();renderCycle()}});
$('resetCycle').addEventListener('click',()=>{data.cycleIndex=0;store();renderCycle()});
$('cycleList').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;const idx=Number(b.dataset.cycleIndex??b.dataset.cycleDelete);if(!Number.isInteger(idx)||idx<0||idx>=data.cycle.length)return;if(b.dataset.cycleDelete!==undefined){data.cycle.splice(idx,1)}else if(b.dataset.cycleMove!==undefined){const j=idx+Number(b.dataset.cycleMove);if(j<0||j>=data.cycle.length)return;[data.cycle[idx],data.cycle[j]]=[data.cycle[j],data.cycle[idx]]}data.cycleIndex=0;store();renderCycle()});
$('bm240-audit').addEventListener('click',e=>{const id=e.target?.dataset?.restoreSession;if(!id)return;const session=data.sessions.find(s=>s.id===id&&s.deletedAt);if(!session)return;delete session.deletedAt;store();refresh()});
 $('reviewForm').addEventListener('submit',e=>{e.preventDefault();if(!subject($('reviewSubject').value)||!validDate($('reviewDue').value))return;data.reviews.push({id:uid(),subjectId:$('reviewSubject').value,topic:$('reviewTopic').value.trim(),due:$('reviewDue').value,done:false});store();$('reviewTopic').value='';renderReviews();renderDashboard()});
root.querySelectorAll('[data-review-filter]').forEach(b=>b.addEventListener('click',()=>{reviewFilter=b.dataset.reviewFilter;renderReviews()}));
$('reviewRows').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;const id=b.dataset.completeReview||b.dataset.reopenReview||b.dataset.deleteReview;const r=data.reviews.find(x=>x.id===id);if(!r)return;if(b.dataset.deleteReview){if(!confirm('Excluir esta revisão de conteúdo?'))return;data.reviews=data.reviews.filter(x=>x.id!==id)}else if(b.dataset.completeReview){r.done=true;r.doneAt=new Date().toISOString()}else{r.done=false;delete r.doneAt}store();renderReviews();renderDashboard()});
$('exportJson').addEventListener('click',()=>dl('controle-estudos-backup-'+today()+'.json',JSON.stringify({format:'BancoMestreControleV238',exportedAt:new Date().toISOString(),data},null,2),'application/json'));
$('exportAllCsv').addEventListener('click',()=>dl('controle-estudos-'+today()+'.csv',csv(data.sessions),'text/csv;charset=utf-8'));
$('bm240-import-legacy').addEventListener('click',()=>{try{importLegacy()}catch(e){$('bm240-import-preview').textContent='Importação não realizada: '+e.message}});
 $('bm240-import-active').addEventListener('click',()=>{try{importActiveControl()}catch(e){$('bm240-import-active-status').textContent='Importação não realizada: '+e.message}});
 $('bm240-inspect-conflict').addEventListener('click',async()=>{
  const status=$('bm240-conflict-status'),items=$('bm240-conflict-items'),button=$('bm240-merge-safe');
  button.disabled=true;items.replaceChildren();
  try{
   const token=window.BM239DriveGlobal?.writeToken?.();
   if(!token)throw Error('Autorize a leitura e a gravação no Drive pelo botão do cabeçalho.');
   status.textContent='Comparando as duas versões e a base verificada…';
   const report=await window.BM240ControlDrive?.inspectConflict(token);
   if(!report)throw Error('Conciliador não inicializado');
   status.textContent=report.message;
   if(report.conflicts?.length){
    for(const message of report.conflicts){
     const row=document.createElement('p');row.textContent=message;items.append(row);
    }
   }
   button.disabled=report.state!=='merge_ready';
  }catch(e){status.textContent='Auditoria não concluída: '+e.message}
 });
 $('bm240-merge-safe').addEventListener('click',async()=>{
  const status=$('bm240-conflict-status'),button=$('bm240-merge-safe');
  const token=window.BM239DriveGlobal?.writeToken?.();
  if(!token){status.textContent='Sem autorização do Drive.';return}
  if(!confirm('Conciliar somente mudanças independentes? Serão criadas e verificadas duas cópias privadas antes do envio. Nenhum cartão SRS nem arquivo da V241 será alterado.'))return;
  button.disabled=true;status.textContent='Verificando cópias e gravando apenas dados conciliáveis…';
  try{
   const result=await window.BM240ControlDrive.mergeSafe(token);
   status.textContent=result.message;
   refresh();
  }catch(e){status.textContent='Conciliação suspensa: '+e.message}
 });
 $('bm240-list-backups').addEventListener('click',async ()=>{
  const status=$('bm240-backup-restore-status');
  try{
   const token=window.BM239DriveGlobal?.writeToken?.();
   if(!token)throw Error('Conecte e autorize a gravação no Drive pelo cabeçalho.');
   status.textContent='Consultando cópias privadas…';
   const list=await window.BM240StudyBackups?.listAvailable(token);
   if(!list)throw Error('Módulo de restauração não disponível.');
   $('bm240-backup-restore-list').innerHTML=list.map(x=>'<div class="item"><b>'+esc(x.day)+'</b> · '+esc(x.period)+' · hash '+esc(String(x.sha256).slice(0,12))+
    ' <button data-restore-id="'+esc(x.id)+'">Restaurar somente neste navegador</button></div>').join('')||'<p class="muted">Nenhuma cópia privada desta versão foi localizada.</p>';
   status.textContent=list.length+' cópias localizadas. A integridade integral será verificada antes de restaurar.';
  }catch(e){status.textContent='Consulta não concluída: '+e.message}
 });
 $('bm240-backup-restore-list').addEventListener('click',async e=>{
  const button=e.target.closest('[data-restore-id]');if(!button)return;
  const token=window.BM239DriveGlobal?.writeToken?.();
  const status=$('bm240-backup-restore-status');
  if(!token){status.textContent='Sem autorização para consultar o Drive.';return}
  if(!confirm('Restaurar esta cópia SOMENTE neste navegador? O estado local atual será preservado em uma cópia de recuperação, mas o envio automático ao mestre ficará BLOQUEADO até conciliação.'))return;
  button.disabled=true;status.textContent='Conferindo integridade SHA-256 e preparando recuperação…';
  try{
   const result=await window.BM240StudyBackups.restoreToLocal(token,button.dataset.restoreId);
   status.textContent=result.message;
   window.dispatchEvent(new CustomEvent('bm240-study-changed',{detail:{pending:true,restore:true}}));
  }catch(err){status.textContent='Restauração suspensa: '+err.message}
  finally{button.disabled=false}
 });
 $('importJson').addEventListener('change',async e=>{
 const f=e.target.files?.[0];if(!f)return;
 const original=structuredClone(data);
 try{
  if(f.size>10_000_000)throw Error('Arquivo acima de 10 MB');
  const obj=JSON.parse(await f.text()),d=obj.data;
  if(obj.format!=='BancoMestreControleV238'||d?.schema!==1||!['subjects','sessions','reviews','cycle'].every(k=>Array.isArray(d[k])))
   throw Error('Backup incompatível');
  if(clock.running||runTime()>0)throw Error('Existe cronômetro não salvo; conclua-o antes de importar');
  const additions=[];
  for(const kind of ['subjects','sessions','reviews','plans']){
   const seen=new Set(),cur=new Map((data[kind]||[]).map(x=>[x.id,x]));
   for(const row of (d[kind]||[])){
    if(!row?.id||seen.has(row.id))throw Error('ID inválido ou duplicado em '+kind);
    seen.add(row.id);
    const same=cur.get(row.id);
    if(same&&JSON.stringify(same)!==JSON.stringify(row))throw Error('Conflito no ID '+row.id+'; importação suspensa');
    if(!same){
     if(kind==='sessions'&&(!(Number(row.minutes)>0)||!validDate(row.date)||!Number.isInteger(row.questions)||!Number.isInteger(row.correct)||row.correct>row.questions||row.correct<0))
      throw Error('Sessão importada inválida: '+row.id);
     additions.push([kind,row]);
    }
   }
  }
  if(!additions.length){toggleMessage('backupStatus','Backup já representado nos registros locais.');return}
  if(!confirm('Adicionar '+additions.length+' registros, preservando os anteriores?'))return;
  localStorage.setItem('BM240_BEFORE_JSON_IMPORT_'+new Date().toISOString().replace(/[:.]/g,'-'),JSON.stringify(original));
  for(const [kind,row] of additions)data[kind].push(structuredClone(row));
  if(!data.cycle.length&&d.cycle.length)data.cycle=structuredClone(d.cycle);
  if(!store())throw Error('Falha no armazenamento; recuperação disponível no backup pré-importação');
  refresh();toggleMessage('backupStatus',additions.length+' novos registros importados sem substituir originais, com histórico auditável.');
 }catch(err){data=original;toggleMessage('backupStatus','Nenhum dado importado: '+err.message)}
 finally{e.target.value=''}
});
refreshOpts();$('historySubject').value='all';$('historyType').value='all';$('reportSubject').value='all';refresh();$('timerSubject').value=clock.subject;$('timerTopic').value=clock.topic;$('timerType').value=clock.type;$('timerAlarm').value=clock.alarmMinutes||0;showTimer();
tick=setInterval(()=>{showTimer();if(clock.running)storeClock()},1000);
document.addEventListener('bm240-control-verified',()=>{
  if(clock.transferPending){
   clock.transferPending=false;
   clock.availableForTransfer=false;
   storeClock();
   mirrorTimer();
   toggleMessage('timerStatus','Transferência confirmada pelo Drive. Você pode retomar o cronômetro.');
   showTimer();
  }
 });
 window.addEventListener('storage',event=>{
  if(event.key===KEY&&event.newValue!==lastReadRaw){
   toggleMessage('sessionStatus','Histórico modificado em outra aba. Gravação bloqueada até reconciliar.');
   toggleMessage('timerStatus','Histórico diferente em outra aba. Pause e verifique antes de continuar.');
  }
 });
 window.addEventListener('pagehide',storeClock);if(typeof ResizeObserver!=='undefined'){new ResizeObserver(resize).observe(root.querySelector('main'))}
}
init();
window.BM240ControlApp=Object.freeze({
 reload(){load();refresh();showTimer()},
 createSubject(name){
  const n=String(name||'').trim();
  if(n.length<2||n.length>80)throw Error('O nome deve conter entre 2 e 80 caracteres');
  const existing=data.subjects.find(x=>x.name.toLocaleLowerCase('pt-BR')===n.toLocaleLowerCase('pt-BR'));
  if(existing)return existing.id;
  const entry={id:uid(),name:n,color:'#277f79',difficulty:3,weight:1,exam:0,daily:0,weekly:0,monthly:0};
  data.subjects.push(entry);
  if(!store()){data.subjects.pop();throw Error('Armazenamento local indisponível')}
  refresh();
  return entry.id;
 },
 catalogForSubject(id){return catalogAreas(id).map(a=>({name:a.name,subjects:a.subjects.map(s=>({name:s.name,subtopics:s.subtopics.slice()}))}))},
 get taxonomyCount(){return taxonomy?.counts||null},
 get timer(){return {running:!!clock.running,elapsedMs:runTime(),subjectId:clock.subject||'',subjectName:subjectName(clock.subject),
  general:clock.general||'',specific:clock.specific||'',subtopic:clock.subtopic||'',
  topic:clock.topic||'',transferPending:!!clock.transferPending,availableForTransfer:!!clock.availableForTransfer,
  subjects:data.subjects.map(s=>({id:s.id,name:s.name}))}},
 get status(){return {sessions:relevant().length,deleted:data.sessions.filter(x=>x.deletedAt).length,audit:data.audit.length}}
});
};
})();
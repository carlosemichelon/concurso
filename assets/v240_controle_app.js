window.BM240ControlInit=(function(){
return function(root){
'use strict';
const KEY='BM_CONTROLE_ESTUDOS_V238', TIMER='BM_CONTROLE_TIMER_V238';
const types=['Teoria','Questões','Revisão','Lei seca','Flashcards','Simulado','Outros'];
const $=id=>root.getElementById(id);
const fresh=()=>({schema:1,subjects:[],sessions:[],reviews:[],plans:[],audit:[],cycle:[],cycleIndex:0,availabilityWeek:15,availabilityMonth:60});
let data, clock, editId=null, reviewFilter='due', tick;
function uid(){return (window.crypto&&crypto.randomUUID)?crypto.randomUUID():String(Date.now())+'-'+Math.random().toString(36).slice(2)}
function validDate(x){return /^\d{4}-\d{2}-\d{2}$/.test(String(x||''))}
function today(d){const z=d||new Date();return z.getFullYear()+'-'+String(z.getMonth()+1).padStart(2,'0')+'-'+String(z.getDate()).padStart(2,'0')}
function shift(date,days){const p=String(date).split('-').map(Number);const d=new Date(p[0],p[1]-1,p[2],12);d.setDate(d.getDate()+days);return today(d)}
function timeText(n){n=Math.round(Math.max(0,Number(n)||0));return Math.floor(n/60)+'h '+String(n%60).padStart(2,'0')+'m'}
function esc(x){return String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function nval(x,min,max){return Math.min(max,Math.max(min,Number(x)||0))}
function store(){
 try{
  const old=JSON.parse(localStorage.getItem(KEY)||'null')||fresh();
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
  localStorage.setItem(KEY,JSON.stringify(data));
  window.dispatchEvent(new CustomEvent('bm240-study-changed',{detail:{pending:true}}));
  return true;
 }catch(e){alert('Erro ao salvar no navegador: '+e.message);return false}
}
function storeClock(){try{localStorage.setItem(TIMER,JSON.stringify(clock))}catch(e){$('timerStatus').textContent='Falha na persistência do cronômetro: '+e.message}}
function load(){try{const d=JSON.parse(localStorage.getItem(KEY)||'null');data=d&&d.schema===1&&Array.isArray(d.subjects)&&Array.isArray(d.sessions)&&Array.isArray(d.reviews)?d:fresh()}catch{data=fresh()}
data.plans=Array.isArray(data.plans)?data.plans:[];
 data.audit=Array.isArray(data.audit)?data.audit:[];
 try{clock=JSON.parse(localStorage.getItem(TIMER)||'null')||null}catch{clock=null}
if(!clock||typeof clock!=='object')clock={running:false,start:0,elapsed:0,subject:'',topic:'',type:'Teoria'};
}
function subject(id){return data.subjects.find(x=>x.id===id)}
function subjectName(id){return subject(id)?.name||'Disciplina não localizada'}
function weekStart(){const d=new Date();d.setDate(d.getDate()-(d.getDay()+6)%7);return today(d)}
function total(arr){return arr.reduce((v,s)=>v+nval(s.minutes,0,1e7),0)}
function relevant(from,to){return data.sessions.filter(s=>!s.deletedAt&&(!from||s.date>=from)&&(!to||s.date<=to))}
function options(id,all){const e=$(id);if(!e)return;const v=e.value;e.replaceChildren();if(all)e.add(new Option('Todas as disciplinas','all'));else e.add(new Option('Selecione',''));for(const s of data.subjects)e.add(new Option(s.name,s.id));if([...e.options].some(o=>o.value===v))e.value=v}
function typeOptions(id,all){const e=$(id),v=e.value;e.replaceChildren();if(all)e.add(new Option('Todos os tipos','all'));for(const t of types)e.add(new Option(t,t));if([...e.options].some(o=>o.value===v))e.value=v}
function refreshOpts(){for(const id of ['timerSubject','sessionSubject','reviewSubject','planSubject'])options(id,false);options('historySubject',true);typeOptions('timerType',false);typeOptions('sessionType',false);typeOptions('historyType',true)}
function go(id){root.querySelectorAll('#tabs button').forEach(b=>b.classList.toggle('active',b.dataset.tab===id));root.querySelectorAll('section.pane').forEach(s=>s.classList.toggle('active',s.id===id));if(id==='painel')renderDashboard();if(id==='historico')renderHistory();if(id==='planejamento')renderSubjects();if(id==='ciclo')renderCycle();if(id==='revisoes')renderReviews();if(id==='backup')renderBackup();if(id==='calendarioControle')renderCalendar();resize()}
function resize(){}
function toggleMessage(id,text){$(id).textContent=text}
function renderDashboard(){
const t=today(),ws=weekStart(),month=t.slice(0,7),all=relevant(),daily=relevant(t,t),weekly=relevant(ws,t),monthly=relevant().filter(s=>s.date.startsWith(month));
const q=all.reduce((a,x)=>a+(Number(x.questions)||0),0),c=all.reduce((a,x)=>a+(Number(x.correct)||0),0);
const overdue=data.reviews.filter(r=>!r.done&&r.due<=t).length;
$('metrics').innerHTML=[['Hoje',timeText(total(daily))],['Esta semana',timeText(total(weekly))],['Este mês',timeText(total(monthly))],['Acertos',q?Math.round(c/q*100)+'%':'—']].map(x=>'<div class="metric"><span>'+esc(x[0])+'</span><b>'+esc(x[1])+'</b></div>').join('');
const days=Array.from({length:14},(_,i)=>shift(t,i-13)),values=days.map(d=>total(relevant().filter(s=>s.date===d)));const max=Math.max(60,...values);
$('timeline').innerHTML=days.map((d,i)=>{const slices=data.subjects.map(sub=>({sub,m:total(relevant().filter(x=>x.date===d&&x.subjectId===sub.id))})).filter(x=>x.m>0);return '<div class="barcol" title="'+esc(d+' · '+timeText(values[i]))+'"><div class="bar" style="height:'+Math.round(values[i]/max*115)+'px;display:flex;flex-direction:column-reverse;overflow:hidden">'+slices.map(x=>'<i title="'+esc(x.sub.name)+'" style="height:'+Math.round(x.m/Math.max(.01,values[i])*100)+'%;background:'+esc(x.sub.color||'#318980')+';width:100%;flex:none"></i>').join('')+'</div><small>'+esc(d.slice(8))+'</small></div>'}).join('');
const by=data.subjects.map(s=>({s,minutes:total(all.filter(x=>x.subjectId===s.id))})).filter(x=>x.minutes>0).sort((a,b)=>b.minutes-a.minutes);
const allMinutes=Math.max(1,total(all));
$('distribution').innerHTML=by.length?by.map(x=>'<div class="type-row"><span style="min-width:115px;max-width:170px;overflow-wrap:anywhere">'+esc(x.s.name)+'</span><div class="progress" style="flex:1"><i style="width:'+Math.round(x.minutes/allMinutes*100)+'%;background:'+esc(x.s.color||'#318980')+'"></i></div><strong>'+esc(timeText(x.minutes))+'</strong></div>').join(''):'<p class="empty">Nenhuma sessão registrada.</p>';
const bytype=types.map(type=>({type,v:total(all.filter(s=>s.type===type))})).filter(x=>x.v>0);
$('types').innerHTML=bytype.length?bytype.map(x=>'<div class="type-row"><span style="min-width:100px">'+esc(x.type)+'</span><div class="progress" style="flex:1"><i style="width:'+Math.round(x.v/allMinutes*100)+'%"></i></div><b>'+Math.round(x.v/allMinutes*100)+'%</b></div>').join(''):'<p class="empty">Sem registros por tipo.</p>';
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
const a=data.sessions.filter(s=>!s.deletedAt&&(sid==='all'||!sid||s.subjectId===sid)&&(ty==='all'||!ty||s.type===ty)&&(!from||s.date>=from)&&(!to||s.date<=to)).sort((a,b)=>(b.date+' '+(b.startTime||'')).localeCompare(a.date+' '+(a.startTime||'')));
$('historyCount').textContent=a.length+' sessões · '+timeText(total(a));$('historyRows').innerHTML=a.map(s=>'<tr><td>'+esc(s.date)+' '+esc(s.startTime||'')+'</td><td><b>'+esc(subjectName(s.subjectId))+'</b><div class="muted">'+esc(s.topic||'')+'</div>'+(s.notes?'<details><summary>Anotações</summary>'+esc(s.notes)+'</details>':'')+'</td><td>'+esc(s.type)+'</td><td>'+esc(timeText(s.minutes))+'</td><td>'+ (s.questions?esc(s.correct)+'/'+esc(s.questions):'—')+'</td><td><button data-edit-session="'+esc(s.id)+'">Editar</button> <button class="danger" data-delete-session="'+esc(s.id)+'">Excluir</button></td></tr>').join('')||'<tr><td colspan="6">Sem atividades para esses filtros.</td></tr>';resize();return a;
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
function refresh(){refreshOpts();renderDashboard();renderHistory();renderSubjects();renderCycle();renderReviews();renderCalendar();renderBackup();resize()}
function addSession(s,review){if(!subject(s.subjectId))throw Error('Selecione uma disciplina cadastrada.');if(!(Number(s.minutes)>0))throw Error('Duração inválida.');if(!Number.isInteger(s.questions)||!Number.isInteger(s.correct)||s.correct<0||s.questions<0||s.correct>s.questions)throw Error('Acertos não podem exceder as questões.');
if(editId){const old=data.sessions.find(x=>x.id===editId&&!x.deletedAt);if(!old)throw Error('Sessão original não localizada.');Object.assign(old,s);editId=null;}
 else{data.sessions.push({...s,id:uid(),createdAt:new Date().toISOString()})}
if(!store())throw Error('Não foi possível gravar.');refresh();}
function clearForm(){$('sessionForm').reset();$('sessionDate').value=today();$('sessionTime').value=new Date().toTimeString().slice(0,5);editId=null;$('sessionSubmit').textContent='Salvar sessão';$('sessionQuestions').value='0';$('sessionCorrect').value='0'}
function runTime(){return Math.max(0,Number(clock.elapsed)||0)+(clock.running?Math.max(0,Date.now()-clock.start):0)}
function showTimer(){if(clock.running&&clock.alarmMinutes>0&&!clock.alarmed&&runTime()>=clock.alarmMinutes*60000){clock.alarmed=true;storeClock();toggleMessage('timerStatus','Alarme: tempo planejado alcançado.');alert('Alarme de estudo: '+clock.alarmMinutes+' minutos líquidos concluídos.')}const sec=Math.floor(runTime()/1000),hh=String(Math.floor(sec/3600)).padStart(2,'0'),mm=String(Math.floor(sec%3600/60)).padStart(2,'0'),ss=String(sec%60).padStart(2,'0');$('timerDisplay').textContent=hh+':'+mm+':'+ss;$('timerSubject').disabled=clock.running||runTime()>0;$('timerTopic').disabled=clock.running||runTime()>0;$('timerType').disabled=clock.running||runTime()>0;$('timerAlarm').disabled=clock.running||runTime()>0;$('timerPause').disabled=!clock.running;$('timerSave').disabled=runTime()<1000;$('timerStart').disabled=clock.running}
function saveTimer(){const ms=runTime();if(ms<1000)return;try{const date=today();const s={date,startTime:new Date(clock.firstStartedAt||Date.now()-ms).toTimeString().slice(0,5),subjectId:clock.subject,topic:clock.topic,type:clock.type,minutes:Math.max(.02,Math.round(ms/600)/100),questions:0,correct:0,notes:''};const previousEdit=editId;editId=null;try{addSession(s,false)}finally{editId=previousEdit}clock={running:false,start:0,elapsed:0,firstStartedAt:0,subject:'',topic:'',type:'Teoria'};storeClock();showTimer();toggleMessage('timerStatus','Sessão salva com sucesso. Questões e anotações podem ser adicionadas no Histórico.');}catch(e){toggleMessage('timerStatus',e.message)}}
function weight(s){return Math.max(.1,Number(s.difficulty)||1)*Math.max(.1,Number(s.weight)||1)*Math.max(1,Number(s.exam)||1)}
function dl(name,contents,mime){const blob=new Blob([contents],{type:mime}),url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000)}
function csv(rows){const fields=['date','startTime','subject','topic','type','minutes','questions','correct','notes'];const cell=x=>'"'+(/^[=+@\-\t\r]/.test(String(x??''))?"'":'')+String(x??'').replace(/"/g,'""')+'"';return [fields.join(';'),...rows.map(s=>[s.date,s.startTime,subjectName(s.subjectId),s.topic,s.type,s.minutes,s.questions,s.correct,s.notes].map(cell).join(';'))].join('\r\n')}

const cal={mode:'month',date:today(),selected:today()};
function calParse(s){return new Date(s+'T12:00:00')}
function calMove(s,mode,n){
 const d=calParse(s);
 if(mode==='month'){d.setMonth(d.getMonth()+n);d.setDate(1)}
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

function init(){
load();$('sessionDate').value=today();$('sessionTime').value=new Date().toTimeString().slice(0,5);$('reviewDue').value=shift(today(),1);
for(const b of root.querySelectorAll('#tabs [data-tab]'))b.addEventListener('click',()=>go(b.dataset.tab));for(const b of root.querySelectorAll('[data-goto]'))b.addEventListener('click',()=>go(b.dataset.goto));
$('calGrid').addEventListener('click',e=>{const b=e.target.closest('[data-cal-day]');if(!b)return;cal.selected=b.dataset.calDay;cal.date=b.dataset.calDay;renderCalendar()});
 root.querySelectorAll('[data-cal-mode]').forEach(b=>b.addEventListener('click',()=>{cal.mode=b.dataset.calMode;renderCalendar()}));
 $('calPrev').onclick=()=>{cal.date=calMove(cal.date,cal.mode,-1);cal.selected=cal.date;renderCalendar()};
 $('calNext').onclick=()=>{cal.date=calMove(cal.date,cal.mode,1);cal.selected=cal.date;renderCalendar()};
 $('calToday').onclick=()=>{cal.date=cal.selected=today();renderCalendar()};
 $('planForm').addEventListener('submit',e=>{e.preventDefault();const date=$('planDate').value,sub=$('planSubject').value,topic=$('planTopic').value.trim(),minutes=Number($('planMinutes').value);if(!validDate(date)||!subject(sub)||!topic||!Number.isInteger(minutes)||minutes<5||minutes>1440){toggleMessage('planStatus','Confira a data, disciplina, assunto e minutos.');return}data.plans.push({id:uid(),date,subjectId:sub,topic,minutes,createdAt:new Date().toISOString()});if(store()){cal.selected=cal.date=date;$('planTopic').value='';toggleMessage('planStatus','Atividade planejada e salva localmente.');renderCalendar()}});
 $('calPlans').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;const id=b.dataset.calToggle||b.dataset.calRemove;const p=data.plans.find(x=>x.id===id&&!x.deletedAt);if(!p)return;if(b.dataset.calRemove){p.deletedAt=new Date().toISOString()}else if(p.doneAt)delete p.doneAt;else p.doneAt=new Date().toISOString();store();renderCalendar()});
 $('timerSubject').value=clock.subject;$('timerTopic').value=clock.topic;$('timerType').value=clock.type;$('timerAlarm').value=clock.alarmMinutes||0;
$('timerStart').addEventListener('click',()=>{if(!clock.running){if(!runTime()){if(!subject($('timerSubject').value)){toggleMessage('timerStatus','Cadastre e selecione uma disciplina antes de iniciar.');return}clock.subject=$('timerSubject').value;clock.topic=$('timerTopic').value.trim();clock.type=$('timerType').value;clock.alarmMinutes=nval($('timerAlarm').value,0,600);clock.alarmed=false}clock.start=Date.now();if(!clock.firstStartedAt)clock.firstStartedAt=clock.start;clock.running=true;storeClock();showTimer()}});
$('timerPause').addEventListener('click',()=>{clock.elapsed=runTime();clock.start=0;clock.running=false;storeClock();showTimer()});
$('timerSave').addEventListener('click',saveTimer);$('timerDiscard').addEventListener('click',()=>{if(!runTime()||confirm('Descartar o tempo ainda não salvo?')){clock={running:false,start:0,elapsed:0,subject:'',topic:'',type:'Teoria'};storeClock();showTimer()}});
$('sessionForm').addEventListener('submit',e=>{e.preventDefault();try{const s={date:$('sessionDate').value,startTime:$('sessionTime').value,minutes:Number($('sessionMinutes').value),subjectId:$('sessionSubject').value,type:$('sessionType').value,topic:$('sessionTopic').value.trim(),questions:Number($('sessionQuestions').value),correct:Number($('sessionCorrect').value),notes:$('sessionNotes').value};if(!validDate(s.date))throw Error('Informe uma data válida.');addSession(s,false);clearForm();toggleMessage('sessionStatus','Sessão salva e indicadores atualizados.')}catch(ex){toggleMessage('sessionStatus',ex.message)}});
$('sessionCancel').addEventListener('click',()=>{clearForm();toggleMessage('sessionStatus','')});
for(const id of ['historySubject','historyType','historyFrom','historyTo'])$(id).addEventListener('change',renderHistory);
$('historyClear').addEventListener('click',()=>{for(const id of ['historyFrom','historyTo'])$(id).value='';$('historySubject').value='all';$('historyType').value='all';renderHistory()});
$('historyCsv').addEventListener('click',()=>dl('controle-estudos-filtrado-'+today()+'.csv',csv(renderHistory()),'text/csv;charset=utf-8'));
$('historyRows').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;const id=b.dataset.editSession||b.dataset.deleteSession;const s=data.sessions.find(x=>x.id===id);if(!s)return;
if(b.dataset.deleteSession){if(confirm('Mover esta sessão para registros excluídos? Ela poderá ser recuperada pelo Histórico de alterações.')){s.deletedAt=new Date().toISOString();store();refresh()}}else{editId=id;go('registro');$('sessionDate').value=s.date;$('sessionTime').value=s.startTime||'';$('sessionMinutes').value=s.minutes;$('sessionSubject').value=s.subjectId;$('sessionType').value=s.type;$('sessionTopic').value=s.topic||'';$('sessionQuestions').value=s.questions||0;$('sessionCorrect').value=s.correct||0;$('sessionNotes').value=s.notes||'';$('sessionReview').value='0';$('sessionSubmit').textContent='Atualizar sessão';$('sessionForm').scrollIntoView({block:'nearest'})}});
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
$('importJson').addEventListener('change',async e=>{const f=e.target.files?.[0];if(!f)return;try{if(f.size>10_000_000)throw Error('Arquivo acima de 10 MB.');const obj=JSON.parse(await f.text());if(obj.format!=='BancoMestreControleV238'||obj.data?.schema!==1||!Array.isArray(obj.data?.subjects)||!Array.isArray(obj.data?.sessions)||!Array.isArray(obj.data?.reviews)||!Array.isArray(obj.data?.cycle))throw Error('Formato de backup inválido.');if(!confirm('Substituir todos os registros locais deste módulo pelo backup importado?'))return;data=obj.data;if(!store())throw Error('Falha ao persistir a importação.');refresh();toggleMessage('backupStatus','Backup importado e conferido estruturalmente.')}catch(err){toggleMessage('backupStatus',err.message)}finally{e.target.value=''}});
refreshOpts();$('historySubject').value='all';$('historyType').value='all';refresh();$('timerSubject').value=clock.subject;$('timerTopic').value=clock.topic;$('timerType').value=clock.type;$('timerAlarm').value=clock.alarmMinutes||0;showTimer();
tick=setInterval(()=>{showTimer();if(clock.running)storeClock()},1000);
window.addEventListener('pagehide',storeClock);if(typeof ResizeObserver!=='undefined'){new ResizeObserver(resize).observe(root.querySelector('main'))}
}
init();
window.BM240ControlApp=Object.freeze({reload(){load();refresh();showTimer()},get status(){return {sessions:relevant().length,deleted:data.sessions.filter(x=>x.deletedAt).length,audit:data.audit.length}}});
};
})();
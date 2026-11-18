/* V241 — cronômetro compacto no cabeçalho e no título/ícone da aba.
   Usa a MESMA sessão do Controle de Estudos; nunca grava eventos SRS. */
(function(){
'use strict';
if(window.BM241TimerHeader)return;
const PREFIX='bm241-',BASE_TITLE=document.title;
const $=id=>document.getElementById(PREFIX+id);
const CLOCK='BM245_CONTROLE_TIMER';
let state=null,subjSignature='',areaSignature='',knownSubjects=[],currentSubject='',pendingSubject='',ready=false;
const examples=[
 'Agregados','Cimento e concreto','Estruturas de aço','Estruturas de madeira','ETE ETA',
 'Gerenciamento Orçamentação','Hidráulica e Hidrologia','Isostática','NBR 10844 Pluvial',
 'NBR 14653','NBR 15575','NBR 5410 Elétrica','NBR 5626 Água','NBR 5674 Manutenção Predial',
 'NBR 6118','NBR 6122 Fundações','NBR 8160 Esgoto','NBR 9050','NBR 9077',
 'Patologia e ensaios','Pontes e obras de arte','PTV Hiperestática','Resistência dos Materiais',
 'Rodovias','Solos','Terraplenagem e Obras de Terra','Topografia'
];
function el(tag,cls,txt){const n=document.createElement(tag);if(cls)n.className=cls;if(txt!==undefined)n.textContent=txt;return n;}
function nativeRoot(){return document.getElementById('bm240-native-host')?.shadowRoot||null}
function request(){
 const t=window.BM240ControlApp?.timer;
 if(!t){ready=false;setStatus();return}
 state={kind:t.running?'running':t.elapsedMs>0?'paused':'idle',elapsedMs:t.elapsedMs,
  sentAt:Date.now(),subjectId:t.subjectId,subjectName:t.subjectName,topic:t.topic,
  general:t.general||'',specific:t.specific||'',subtopic:t.subtopic||'',
  subjects:t.subjects,topics:[],transferPending:t.transferPending,availableForTransfer:t.availableForTransfer};
 ready=true;render();
}
function command(action,fields={}){
 const root=nativeRoot(),app=window.BM240ControlApp;
 if(!root||!app){const msg=$('status');if(msg)msg.textContent='Controle nativo ainda indisponível';return}
 if(action==='request'){request();return}
 if(action==='new-subject'){
  try{const id=app.createSubject(fields.name);pendingSubject=fields.name;
   request();$('subject').value=id;currentSubject=id;updateTopicOptions();}
  catch(e){$('status').textContent='Matéria não cadastrada: '+e.message}
  return;
 }
 const mapping={start:'timerStart',resume:'timerStart',pause:'timerPause',save:'timerSave','discard-confirmed':'timerDiscard'};
 const target=root.getElementById(mapping[action]);
 if(!target){$('status').textContent='Comando do cronômetro indisponível';return}
 if(action==='start'){
  const subject=root.getElementById('timerSubject'),topic=root.getElementById('timerTopic');
  subject.value=fields.subjectId||'';
  const general=root.getElementById('timerGeneral'),specific=root.getElementById('timerSpecific'),
   subtopic=root.getElementById('timerSubtopic');
  const areas=app.catalogForSubject?.(subject.value)||[];
  general.replaceChildren(new Option('Selecione a matéria',''));
  for(const a of areas)general.add(new Option(a.name,a.name));
  general.value=fields.general||'';
  specific.value=String(fields.specific||'').slice(0,220);
  subtopic.value=String(fields.subtopic||'').slice(0,220);
  topic.value=String(fields.topic||fields.specific||'').slice(0,220);
 }
 if(action==='discard-confirmed')window.BM240DiscardConfirmed=true;
 target.click();
 if(action==='discard-confirmed')window.BM240DiscardConfirmed=false;
 request();
 const notice=root.getElementById('timerStatus')?.textContent||'';
 if(/bloquead|pendente|falha|inexistente|outro dispositivo|não foi possível|erro/i.test(notice))
  $('status').textContent=notice;
}

function fmt(ms){
 const s=Math.floor(Math.max(0,Number(ms)||0)/1000);
 const h=Math.floor(s/3600),m=Math.floor(s/60)%60,v=s%60;
 return (h?h+'h ':'')+m+'m '+String(v).padStart(2,'0')+'s';
}
function elapsed(){
 if(!state)return 0;
 return Math.max(0,Number(state.elapsedMs)||0)+(state.running?Math.max(0,Date.now()-Number(state.sentAt||Date.now())):0);
}
function iconSVG(paused){
 const color=paused?'#ae7b30':'#087468';
 const inner=paused?'<rect x="9" y="8" width="2" height="8" rx=".4"/><rect x="13" y="8" width="2" height="8" rx=".4"/>':
  '<path d="m10 8 6 4-6 4z" fill="currentColor" stroke="none"/>';
 return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">'+
  '<circle cx="12" cy="13" r="8" fill="white" stroke="'+color+'" stroke-width="2"/>'+
  '<path d="M10 2h4M12 2v3M18.5 6l1.5-1.5" stroke="'+color+'" stroke-width="2" stroke-linecap="round"/>'+
  '<g fill="'+color+'" stroke="'+color+'">'+inner+'</g></svg>';
}
function updateTab(){
 if(!state||state.kind==='idle'){
  if(document.title!==BASE_TITLE)document.title=BASE_TITLE;
  document.getElementById('bm241-clock-favicon')?.remove();return;
 }
 const sign=state.kind==='running'?'▶':'⏸';
 const label=(state.subjectName||'Estudo')+(state.topic?' - '+state.topic:'');
 const title=sign+' '+fmt(elapsed())+' - '+label.slice(0,75)+' | Banco Mestre';
 if(document.title!==title)document.title=title;
 let link=document.getElementById('bm241-clock-favicon');
 if(!link){link=document.createElement('link');link.id='bm241-clock-favicon';link.rel='icon';link.type='image/svg+xml';document.head.append(link)}
 const next='data:image/svg+xml,'+encodeURIComponent(iconSVG(state.kind==='paused'));
 if(link.href!==next)link.href=next;
}
function setStatus(){
 const msg=$('status');
 if(!msg)return;
 if(!ready){msg.textContent='Carregando Controle de Estudos nativo…';msg.dataset.kind='pending'}
 else if(!state||state.kind==='idle'){msg.textContent='Sem atividade em andamento · registro local';msg.dataset.kind='idle'}
 else if(state.kind==='running'){msg.textContent='Estudando · tempo líquido ativo';msg.dataset.kind='running'}
 else{msg.textContent=state?.transferPending?'Transferência pendente de confirmação no Drive':state?.availableForTransfer?'Sessão liberada para transferência':'Pausado · tempo líquido preservado';msg.dataset.kind='paused'}
}
function updateTopicOptions(){
 const list=$('topic-list'),subList=$('subtopic-list'),area=$('area'),id=$('subject').value;
 if(!list||!area||!subList)return;
 const branches=window.BM240ControlApp?.catalogForSubject?.(id)||[];
 const signature=id+'|'+branches.map(x=>x.name).join('|');
 if(signature!==areaSignature){
  const old=area.value||((state?.subjectId===id)?state.general:'');
  area.replaceChildren(new Option('Matéria / assunto geral',''));
  for(const x of branches)area.add(new Option(x.name,x.name));
  area.value=branches.some(x=>x.name===old)?old:'';
  areaSignature=signature;
 }
 const selected=branches.find(x=>x.name===area.value);
 const subjects=selected?.subjects||[];
 list.replaceChildren();
 for(const value of subjects.map(x=>x.name)){
  const opt=document.createElement('option');opt.value=value;list.append(opt);
 }
 const specific=subjects.find(x=>x.name===$('topic').value);
 subList.replaceChildren();
 for(const value of specific?.subtopics||[]){
  const opt=document.createElement('option');opt.value=value;subList.append(opt);
 }
}
function updateSubjectOptions(){
 const subjects=Array.isArray(state?.subjects)?state.subjects:[];
 const sig=subjects.map(s=>s.id+'|'+s.name).join('\n');
 if(sig===subjSignature)return;
 subjSignature=sig;knownSubjects=subjects;
 const select=$('subject');if(!select)return;
 const previously=select.value||currentSubject;
 select.replaceChildren(new Option('Escolha a disciplina',''));
 for(const s of subjects)select.add(new Option(s.name,s.id));
 let chosen=subjects.some(s=>s.id===previously)?previously:'';
 if(pendingSubject){
  const match=subjects.find(s=>s.name.toLocaleLowerCase('pt-BR')===pendingSubject.toLocaleLowerCase('pt-BR'));
  if(match){chosen=match.id;pendingSubject='';}
 }
 select.value=chosen;currentSubject=chosen;
 updateTopicOptions();
}
function render(){
 if(!state)return;
 updateSubjectOptions();
 const active=state.kind!=='idle';
 const controls=$('choose'),live=$('live');
 controls.hidden=active;live.hidden=!active;
 $('elapsed').textContent=fmt(elapsed());
 $('subject-label').textContent=state.subjectName||'Estudo';
 $('subject-label').title=state.subjectName||'Estudo';
 $('topic-label').textContent=state.topic?' · '+state.topic:'';
 $('topic-label').title=state.topic||'';
 $('run-icon').textContent=state.kind==='running'?'▶':'⏸';
 $('pause').hidden=state.kind!=='running';
 $('resume').hidden=state.kind!=='paused';
 $('save').hidden=state.kind!=='paused';
 $('discard').hidden=state.kind!=='paused';
 setStatus();updateTab();
}
function init(){
 if($('bar'))return;
 const head=document.querySelector('body>header .head');
 if(!head)return;
 const bar=el('div','bm241-timer-bar');bar.id='bm241-bar';
 bar.setAttribute('aria-label','Cronômetro de estudo');
 const idle=el('div','bm241-timer-choose');idle.id='bm241-choose';
 const subject=el('select');subject.id='bm241-subject';subject.setAttribute('aria-label','Disciplina');subject.add(new Option('Escolha a disciplina',''));
 const area=el('select');area.id='bm241-area';area.setAttribute('aria-label','Matéria / assunto geral');area.add(new Option('Matéria / assunto geral',''));
 const topic=el('input');topic.id='bm241-topic';topic.type='text';topic.maxLength=140;topic.placeholder='Conteúdo, ex.: NBR 6118';topic.setAttribute('aria-label','Conteúdo');
 const list=el('datalist');list.id='bm241-topic-list';topic.setAttribute('list',list.id);
 const subtopic=el('input');subtopic.id='bm241-subtopic';subtopic.type='text';subtopic.maxLength=220;
 subtopic.placeholder='Subassunto (opcional)';subtopic.setAttribute('aria-label','Subassunto');
 const subList=el('datalist');subList.id='bm241-subtopic-list';subtopic.setAttribute('list',subList.id);
 const start=el('button','bm241-primary','▶ Iniciar');start.type='button';start.id='bm241-start';
 const add=el('button','bm241-add','+ Nova matéria');add.id='bm241-add';add.type='button';
 const create=el('div','bm241-create');create.id='bm241-create';create.hidden=true;
 const name=el('input');name.id='bm241-new-name';name.placeholder='Nome da matéria';name.maxLength=80;name.setAttribute('aria-label','Nova matéria');
 const createBtn=el('button','','Salvar matéria');createBtn.type='button';createBtn.id='bm241-new-save';
 const cancel=el('button','','Cancelar');cancel.type='button';cancel.id='bm241-new-cancel';
 create.append(name,createBtn,cancel);
 idle.append(subject,area,topic,list,subtopic,subList,start,add,create);
 const live=el('div','bm241-timer-live');live.id='bm241-live';live.hidden=true;
 const label=el('span','bm241-timer-label');
 const ico=el('span','bm241-live-glyph');ico.id='bm241-run-icon';
 const sn=el('strong');sn.id='bm241-subject-label';
 const tn=el('span');tn.id='bm241-topic-label';label.append(ico,sn,tn);
 const clock=el('time','bm241-clock');clock.id='bm241-elapsed';clock.setAttribute('role','timer');clock.textContent='0m 00s';
 const pause=el('button','','⏸ Pausar');pause.id='bm241-pause';
 const resume=el('button','','▶ Continuar');resume.id='bm241-resume';
 const save=el('button','bm241-primary','✓ Salvar');save.id='bm241-save';
 const discard=el('button','bm241-discard','✕ Descartar');discard.id='bm241-discard';
 for(const b of [pause,resume,save,discard])b.type='button';
 live.append(label,clock,pause,resume,save,discard);
 const status=el('small','bm241-timer-status','Carregando Controle de Estudos…');status.id='bm241-status';
 bar.append(idle,live,status);
 head.append(bar);
 document.addEventListener('bm240-study-mounted',()=>{ready=true;request();setStatus()});
 if(window.BM240ControlApp){ready=true;request();}

 window.addEventListener('bm243-catalog-ready',()=>{areaSignature='';request()});
 subject.addEventListener('change',()=>{currentSubject=subject.value;areaSignature='';area.value='';topic.value='';subtopic.value='';updateTopicOptions()});
 area.addEventListener('change',()=>{topic.value='';subtopic.value='';updateTopicOptions()});
 topic.addEventListener('input',()=>{subtopic.value='';updateTopicOptions()});
 start.addEventListener('click',()=>{
  if(!ready){status.textContent='Controle ainda carregando';return}
  if(!subject.value){status.textContent='Selecione uma disciplina ou cadastre uma nova.';return}
  command('start',{subjectId:subject.value,general:area.value,
    specific:topic.value.trim(),subtopic:subtopic.value.trim(),topic:topic.value.trim()});
 });
 pause.addEventListener('click',()=>command('pause'));
 resume.addEventListener('click',()=>command('resume'));
 save.addEventListener('click',()=>command('save'));
 discard.addEventListener('click',()=>{
  if(window.confirm('Descartar o tempo líquido ainda não salvo?'))command('discard-confirmed');
 });
 add.addEventListener('click',()=>{create.hidden=false;name.focus()});
 cancel.addEventListener('click',()=>{create.hidden=true;name.value=''});
 createBtn.addEventListener('click',()=>{
  const n=name.value.trim();
  if(n.length<2){status.textContent='Informe pelo menos 2 caracteres para a matéria.';return}
  pendingSubject=n;command('new-subject',{name:n});
  create.hidden=true;name.value='';
 });
 // Não usa timestamp incremental. Recalcula a partir do instante de início original.
 setInterval(()=>{if(document.visibilityState==='visible')request()},1000);
 window.addEventListener('focus',()=>{request();if(state)render()});
 document.addEventListener('visibilitychange',()=>{if(!document.hidden){request();if(state)render()}});
 window.BM241TimerHeader=Object.freeze({request,get state(){return state&&{...state,elapsedMs:elapsed()}}});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
else init();
})();

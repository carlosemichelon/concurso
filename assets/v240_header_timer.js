/* V240 — cronômetro compacto: SOMENTE controla o cronômetro nativo do Banco Mestre. */
(function(){
'use strict';
if(window.BM240HeaderTimer)return;
const PREFIX='bm240h-',initialTitle=document.title;
const $=id=>document.getElementById(PREFIX+id);
let ready=false,lastSubjects='',busy=false;
function root(){return document.getElementById('bm240-native-host')?.shadowRoot}
function api(){return window.BM240ControlApp}
function node(tag,name,txt){
 const n=document.createElement(tag);if(name)n.id=PREFIX+name;
 if(txt!==undefined)n.textContent=txt;
 return n;
}
function render(){
 const data=api()?.timer;
 const bar=$('bar');
 if(!bar)return;
 const current=Boolean(data);
 const status=$('status');
 if(!current){status.textContent='Controle carregando…';bar.dataset.state='loading';return}
 bar.dataset.state=data.running?'running':data.elapsedMs>0?'paused':'idle';
 const ids=data.subjects.map(s=>s.id+'|'+s.name).join(';');
 const sel=$('subject');
 if(lastSubjects!==ids){
  const chosen=sel.value||data.subjectId;
  sel.replaceChildren(new Option('Matéria…',''));
  for(const s of data.subjects)sel.add(new Option(s.name,s.id));
  sel.value=data.subjects.some(s=>s.id===chosen)?chosen:'';
  lastSubjects=ids;
 }
 const active=data.running||data.elapsedMs>0;
 $('config').hidden=active;$('config').style.display=active?'none':'flex';
 $('live').hidden=!active;$('live').style.display=active?'flex':'none';
 const sec=Math.floor(data.elapsedMs/1000);
 $('clock').textContent=String(Math.floor(sec/3600)).padStart(2,'0')+':'+
  String(Math.floor(sec%3600/60)).padStart(2,'0')+':'+String(sec%60).padStart(2,'0');
 $('label').textContent=data.subjectName||'Estudo';
 $('pause').hidden=!data.running;
 $('resume').hidden=data.running;
 $('save').disabled=data.elapsedMs<1000;
 if(active){
  status.textContent=data.transferPending?'Transferência ainda não verificada no Drive':
   data.availableForTransfer?'Sessão liberada para transferência':
   data.running?'Tempo líquido ativo':'Cronômetro pausado';
  document.title=(data.running?'▶ ':'⏸ ')+$('clock').textContent+' · '+data.subjectName+' | Banco Mestre';
 }else{
  status.textContent='Registro manual · nenhuma sessão ativa';
  if(document.title!==initialTitle)document.title=initialTitle;
 }
}
function send(action){
 const host=root(),status=$('status');
 const button=host?.getElementById('timer'+action);
 if(!button){status.textContent='Controle nativo indisponível';return}
 if(action==='Start'&&!(api()?.timer?.elapsedMs>0)){
  const subject=host.getElementById('timerSubject'),topic=host.getElementById('timerTopic');
  if(!subject)return;
  subject.value=$('subject').value;
  if(!subject.value){status.textContent='Selecione uma matéria no cabeçalho';return}
  topic.value=$('topic').value.trim();
 }
 button.click();
 render();
 const feedback=host.getElementById('timerStatus')?.textContent;
 if(feedback&&/pendente|erro|falha|impossível|bloquead|outro dispositivo/i.test(feedback))
  status.textContent=feedback;
}
function install(){
 if(ready||!root()||!api())return;
 const head=document.querySelector('body>header .head');
 if(!head)return;
 ready=true;
 const style=document.createElement('style');
 style.textContent='#bm240h-bar{display:flex;align-items:center;gap:5px;flex-wrap:wrap;border:1px solid #cadcda;border-radius:8px;padding:4px 7px;font:12px system-ui,sans-serif;max-width:100%;min-width:0;}'+
 '#bm240h-bar select{max-width:130px}#bm240h-bar input{max-width:140px}'+
 '#bm240h-bar button{cursor:pointer;padding:5px 7px;border-radius:6px;font:inherit}'+
 '#bm240h-clock{font-variant-numeric:tabular-nums;font-weight:750}'+
 '#bm240h-label{max-width:130px;white-space:nowrap;text-overflow:ellipsis;overflow:hidden}'+
 '#bm240h-status{font-size:10px;color:#4d6971;flex-basis:100%;line-height:1.15}'+
 '@media(max-width:560px){#bm240h-bar{width:100%;}#bm240h-bar select,#bm240h-bar input{max-width:105px}}';
 document.head.append(style);
 const bar=node('div','bar');bar.setAttribute('aria-label','Cronômetro de estudos no cabeçalho');
 const config=node('div','config');config.style.display='flex';config.style.gap='4px';
 const sub=node('select','subject');sub.setAttribute('aria-label','Disciplina');
 const topic=node('input','topic');topic.placeholder='Assunto';topic.maxLength=200;topic.setAttribute('aria-label','Assunto');
 const start=node('button','start','▶ Iniciar');start.type='button';config.append(sub,topic,start);
 const live=node('div','live');live.style.display='flex';live.style.alignItems='center';live.style.gap='5px';
 const label=node('strong','label'),clock=node('time','clock','00:00:00');
 const pause=node('button','pause','Pausar'),resume=node('button','resume','Continuar'),save=node('button','save','Salvar');
 for(const b of [pause,resume,save])b.type='button';
 live.append(label,clock,pause,resume,save);
 const status=node('span','status','Carregando Controle de Estudos…');
 bar.append(config,live,status);
 const nav=document.querySelector('body>header .head>.bm-v046-header-stats');
 if(nav?.parentElement===head)head.insertBefore(bar,nav);else head.append(bar);
 start.onclick=()=>send('Start');pause.onclick=()=>send('Pause');
 resume.onclick=()=>send('Start');save.onclick=()=>send('Save');
 render();
}
window.BM240HeaderTimer=Object.freeze({install,render});
document.addEventListener('bm240-study-mounted',install);
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{if(root())install()});
else if(root())install();
setInterval(()=>{if(!ready)install();if(ready&&document.visibilityState==='visible')render()},1000);
window.addEventListener('focus',render);
})();

// Original study-control UI; adapters only in the private host.
export function privateStudyBundle(source){
 const i=source.indexOf('/* 117 assets/v245_controle_drive_sync.js */'),j=source.indexOf('/* 119 assets/v242_operational_cards.js */',i);
 if(i<0||j<0||!source.includes('window.BM240ControlInit(root);'))throw Error('Contrato Controle divergente');
 let s=(source.slice(0,i)+"window.BM240ControlDrive=Object.freeze({async sync(){return window.BMVS41StudyControl?.refresh?.()||{state:'error',message:'Controle não carregado'}}});\n;\n"+source.slice(j)).replace('window.BM240ControlInit(root);','await window.BM240ControlInit(root);');
 const start=s.indexOf(" button.addEventListener('click',()=>{",s.indexOf('const mount=async()=>')),end=s.indexOf(' // Rota e seleção',start);
 if(start<0||end<0)throw Error('Contrato navegação do Controle divergente');
 s=s.slice(0,start)+` button.addEventListener('click',event=>{
  event.preventDefault();event.stopImmediatePropagation();
  history.replaceState(null,'','#controle-estudos');
  document.querySelectorAll('main>section').forEach(p=>p.classList.toggle('active',p===section));
  document.querySelectorAll('header nav button[data-page]').forEach(b=>b.classList.toggle('active',b===button));
  section.hidden=false;
 },true);
 `+s.slice(end);
 return s;
}
export function privateStudyApp(source){
 let s=source;
 const replace=(x,y)=>{if(s.split(x).length!==2)throw Error('Contrato Controle divergente: '+x.slice(0,90));s=s.replace(x,y)};
 function block(x,y,v){const i=s.indexOf(x),j=s.indexOf(y,i+x.length);if(i<0||j<0)throw Error('Contrato Controle divergente: '+x);s=s.slice(0,i)+v+'\n'+s.slice(j)}
 replace('return function(root){','return async function(root){');
 block('const DEVICE_KEY=','const $=id=>root.getElementById(id);',`const device=await window.BMVS41Session.contextKey();let verified=null,busy=false,failed=false;
 const emptyClock=()=>({running:false,start:0,elapsed:0,subject:'',topic:'',type:'Teoria'});
 async function mirrorTimer(takeover=false){
  const active=clock&&(clock.running||Number(clock.elapsed)>0);
  data.activeTimer=active?{...clock,ownerId:device,updatedAt:new Date().toISOString()}:null;
  return await store(takeover);
 }`);
 replace('function store(){','async function store(takeover=false){');
 block('  const currentRaw=localStorage.getItem(KEY);','  data.audit=',`  if(busy||failed||!verified)throw Error('Controle não confirmado; sincronize antes de gravar.');
  const old=structuredClone(verified.data);`);
 block('  const nextRaw=JSON.stringify(data);','function subject(id)',`  const snapshot=structuredClone(data),previous=verified.revision,event_id=crypto.randomUUID();
  busy=true;state('Gravando Controle de Estudos…');
  try{
   const reply=await window.BMVS41PrivateStudy.save({event_id,previous,data:snapshot,...(takeover?{takeover:true}:{})});
   if(reply.revision!==event_id||JSON.stringify(reply.data)!==JSON.stringify(snapshot))throw Error('Confirmação divergente');
   verified=reply;data=structuredClone(reply.data);state('Controle de Estudos gravado e conferido no Drive.');
   window.dispatchEvent(new CustomEvent('bm240-study-changed',{detail:{pending:false}}));return true;
  }catch(e){failed=true;data=structuredClone(verified.data);clock=localClock();refresh();showTimer();state('Gravação não confirmada: '+e.message+'. Sincronize para conferir.');return false}
  finally{busy=false}
 }catch(e){state(e.message);return false}
 }
 function state(message){$('bm240-local-status').textContent=message;$('sessionStatus').textContent=message}
 function localClock(){return data.activeTimer?.ownerId===device?structuredClone(data.activeTimer):emptyClock()}
 function restoreTimerFields(){$('timerSubject').value=clock.subject||'';refreshTaxonomy();for(const [id,value] of [['timerGeneral',clock.general],['timerSpecific',clock.specific],['timerSubtopic',clock.subtopic],['timerTopic',clock.topic],['timerType',clock.type],['timerAlarm',clock.alarmMinutes||0]])$(id).value=value||'';}
 function storeClock(){} // No periodic writes: time derives from the confirmed start instant.
 function load(){if(!verified)throw Error('Controle privado indisponível');data=structuredClone(verified.data);clock=localClock()}
 async function reload(){
  if(busy)return {state:'busy',message:'Gravação em andamento'};
  busy=true;
  try{verified=await window.BMVS41PrivateStudy.read();failed=false;load();refresh();restoreTimerFields();showTimer();state('Controle individual conferido no Drive.');return {state:'downloaded',message:'Controle individual conferido'}}
  catch(e){failed=true;state('Consulta não confirmada: '+e.message);return {state:'error',message:e.message}}
  finally{busy=false}
 }`);
 block('async function loadTaxonomy(){','function go(id)',`async function loadTaxonomy(){
  try{
   const p=await window.BMVS41PrivateCards.read(),map=new Map();
   for(const c of p.base.filter(x=>x.active)){
    const name=c.discipline||c.group||'Outros',area=c.subject||'Geral',specific=c.sub||area;
    if(!map.has(name))map.set(name,{id:'priv-'+map.size,name,areas:[]});
    const d=map.get(name);let a=d.areas.find(x=>x.name===area);
    if(!a){a={name:area,subjects:[]};d.areas.push(a)}
    if(!a.subjects.some(x=>x.name===specific))a.subjects.push({name:specific,subtopics:[]});
   }
   taxonomy={disciplines:[...map.values()],counts:{cards:p.base.length,disciplines:map.size,areas:[...map.values()].reduce((n,x)=>n+x.areas.length,0)}};
   seedCatalogDisciplines();refresh();refreshTaxonomy();$('bm240TaxStatus').textContent='Assuntos da conta autenticada carregados.';
  }catch(e){$('bm240TaxStatus').textContent='Assuntos indisponíveis; registro manual preservado.'}
 }`);
 replace(" $('bm240-local-status').textContent='Salvo neste navegador · sincronização remota depende de autenticação e confirmação de leitura pelo Drive. Consulte o indicador do cabeçalho.';"," if(!$('bm240-local-status').textContent)$('bm240-local-status').textContent='Controle individual autenticado.';");
 block('function previewLegacy(){','function init(){','');
 block("$('bm240-import-legacy').addEventListener","refreshOpts();$('historySubject').value='all';",`for(const id of ['bm240-import-legacy','bm240-import-active','bm240-inspect-conflict','bm240-merge-safe','bm240-list-backups','importJson']){
  const e=$(id);if(e){e.disabled=true;e.title='Migração histórica ainda não homologada para esta conta'}
 }`);
 block("$('timerReclaim').addEventListener","$('timerSave').addEventListener",`$('timerReclaim').addEventListener('click',async()=>{
  if(!clock.availableForTransfer||clock.ownerId!==device)return;
  clock.availableForTransfer=false;clock.transferPending=false;await mirrorTimer();showTimer();
 });
 $('timerClaim').addEventListener('click',async()=>{
  const result=await reload();if(result.state!=='downloaded')return;
  const remote=data.activeTimer;if(!remote||remote.ownerId===device||runTime()>0){toggleMessage('timerStatus','Não há sessão de outro dispositivo para recuperar.');return}
  if(!remote.availableForTransfer&&!confirm('Recuperar a sessão anterior e pausá-la agora? O tempo desde o último início será contabilizado. A outra sessão não poderá sobrescrever esta revisão.'))return;
  clock={...remote,elapsed:Number(remote.elapsed)+(remote.running?Math.max(0,Date.now()-remote.start):0),ownerId:device,running:false,start:0,availableForTransfer:false,transferPending:false};
  if(await mirrorTimer(true)){refresh();restoreTimerFields();showTimer();toggleMessage('timerStatus','Cronômetro recuperado e conferido no Drive.')}
 });`);
 replace("$('timerStart').disabled=clock.running}","$('timerStart').disabled=clock.running||!!(data.activeTimer&&data.activeTimer.ownerId!==device);const remote=!!(data.activeTimer&&data.activeTimer.ownerId!==device);$('timerClaim').disabled=!remote;$('timerClaim').textContent='Recuperar sessão de outro dispositivo';$('timerDiscard').disabled=remote;$('timerRelease').disabled=remote||!runTime();$('timerReclaim').disabled=!clock.availableForTransfer;}");
 block('function saveTimer(){','function weight(s)',`async function saveTimer(){
  if(busy||failed||!verified||data.activeTimer?.ownerId!==device)return;
  const ms=runTime();if(ms<1000)return;
  const session={date:today(),startTime:new Date(clock.firstStartedAt||Date.now()-ms).toTimeString().slice(0,5),subjectId:clock.subject,general:clock.general||'',specific:clock.specific||'',subtopic:clock.subtopic||'',topic:clock.topic,type:clock.type,minutes:Math.max(.02,Math.round(ms/600)/100),questions:0,correct:0,notes:'',id:clock.sessionId||uid(),createdAt:new Date().toISOString()};
  if(data.sessions.some(x=>x.id===session.id)){toggleMessage('timerStatus','Sessão já registrada.');return}
  data.sessions.push(session);data.activeTimer=null;clock=emptyClock();
  if(await store()){refresh();showTimer();toggleMessage('timerStatus','Sessão gravada e conferida no Drive.')}
 }`);
 replace("function init(){\nload();","function init(){\nload();for(const event of ['click','submit','change','input'])root.addEventListener(event,e=>{if((busy||failed)&&!e.target.closest?.('#tabs,[data-goto]')){e.preventDefault();e.stopImmediatePropagation();state('Aguarde a confirmação ou sincronize o Controle de Estudos.')}},true);");
 replace("function addSession(s,review){","async function addSession(s,review){");
 replace("if(!store())throw Error('Não foi possível gravar.');refresh();}","if(!await store())throw Error('Gravação não confirmada.');refresh();}");
 replace("addSession(s,false);clearForm();","await addSession(s,false);clearForm();");
 replace(" createSubject(name){"," async createSubject(name){if(busy||failed)throw Error('Controle não confirmado ou ocupado');");
 replace("  if(!store()){data.subjects.pop();throw Error('Armazenamento local indisponível')}","  if(!await store())throw Error('Gravação não confirmada');");
 const ids=['planForm','calPlans','timerStart','timerPause','timerRelease','timerDiscard','sessionForm','historyRows','subjectForm','subjectRows','saveAvailability','allocate','generateCycle','cycleCurrent','resetCycle','cycleList','bm240-audit','reviewForm','reviewRows'];
 for(const id of ids){
  for(const event of ['click','submit','change'])for(const callback of ['()=>','e=>']){
   const x="$('"+id+"').addEventListener('"+event+"',"+callback;
   s=s.replaceAll(x,"$('"+id+"').addEventListener('"+event+"',async "+callback);
  }
 }
 s=s.replace(/(?<!await )(?<!function )\bstore\(\)/g,'await store()').replace(/(?<!await )(?<!function )\bmirrorTimer\(\)/g,'await mirrorTimer()');
 s=s.replaceAll('await store();refresh()','if(await store())refresh()').replaceAll('await store();renderCycle()','if(await store())renderCycle()').replaceAll('await store();renderCalendar()','if(await store())renderCalendar()');
 replace("await store();$('subjectName').value='';","if(!await store())return;$('subjectName').value='';");
 replace("await store();$('reviewTopic').value='';","if(!await store())return;$('reviewTopic').value='';");
 replace("await store();renderReviews();renderDashboard()","if(await store()){renderReviews();renderDashboard()}");
 replace('Sessão salva e indicadores atualizados.','Sessão gravada e conferida no Drive.');
 replace('Atividade planejada e salva localmente.','Atividade planejada e gravada no Drive.');
 replace('Sessão pausada e disponível para transferência depois que o Drive confirmar a sincronização.','Sessão pausada e liberada no Drive.');
 block("tick=setInterval(()=>{showTimer();if(clock.running)storeClock()},1000);","}\ninit();",`tick=setInterval(showTimer,1000);
 if(typeof ResizeObserver!=='undefined')new ResizeObserver(resize).observe(root.querySelector('main'));`);
 replace("}\ninit();","}\nverified=await window.BMVS41PrivateStudy.read();init();restoreTimerFields();showTimer();\nwindow.BMVS41StudyControl=Object.freeze({refresh:reload,get busy(){return busy},get revision(){return verified?.revision},get confirmed(){return !busy&&!failed&&!!verified}});");
 replace(" reload(){load();refresh();showTimer()},"," reload:reload,");
 if(/localStorage\.(?:getItem|setItem|removeItem)/.test(s))throw Error('Persistência legada restante no Controle');
 return s;
}

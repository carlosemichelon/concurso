// Replace the browser OAuth coordinator with the authenticated server session.
function cut(source,start,end,replacement){
 const i=source.indexOf(start),j=source.indexOf(end,i+start.length);
 if(i<0||j<0||source.indexOf(start,i+start.length)>=0)throw Error('Contrato administrativo divergente: '+start);
 return source.slice(0,i)+replacement+'\n;\n'+source.slice(j);
}
export function privateGlobalDrive(source){
 return cut(source,'/* 124 assets/v304_global_drive.js */','/* 125 assets/v266_sync_truth.js */',`(function(){
 'use strict';
 let running=null,lastReport=null;
 const $=id=>document.getElementById(id),connected=()=>window.BMVS41Session?.available()===true;
 function display(message){
  const b=$('bm239-drive-action'),s=$('bm239-sync-details');
  if(b){b.disabled=!!running;b.textContent=running?'Verificando…':'Sincronizar Drive';b.dataset.connected=String(connected());b.setAttribute('aria-busy',String(!!running));b.title='Conferir os registros da conta autenticada';}
  if(s){s.textContent=message;s.title=message;}
 }
 async function sync(){
  if(running)return running;
  running=(async()=>{
   const notes=[],warnings=[];
   try{
    await window.BMVS41Session.check();
    const jobs=[['Controle de Estudos',()=>window.BM240ControlDrive.sync()],['Avaliações',()=>window.BM316SrsJournal.refresh()],['Imagens',()=>window.BancoMestreDriveImagesV182.refresh()],['PDFs',()=>window.BancoMestrePDFSyncV130.refresh()],['Lacunas',()=>window.BM242LacunasDrive.sync()],['Fórmulas',()=>window.BM246Formulas.refresh()]];
    for(const [name,job] of jobs){try{const value=await job();if(value===false||value===null||value?.state==='error'||value?.state==='busy')throw Error('não confirmado');notes.push(name+' consultado')}catch{warnings.push(name+' não confirmado')}}
   }catch{warnings.push('Sessão não confirmada')}
   const pending=['Demais módulos administrativos não homologados'];
   lastReport={at:new Date().toISOString(),notes,warnings,pending,modules:{},summary:'Conta privada: '+notes.length+' consultas concluídas',complete:false,running:false};
   document.dispatchEvent(new CustomEvent('bm239-sync-finished',{detail:{complete:false,errors:warnings.length,pending:pending.length}}));return lastReport;
  })();
  display('Consultando registros privados…');
  try{return await running}finally{running=null;display(lastReport?.summary||'Consulta não confirmada')}
 }
 function init(){
  const b=$('bm239-drive-action');if(b){b.onclick=()=>void sync();b.setAttribute('aria-label','Conferir dados privados no Drive')}
  display('Conta individual autenticada');
 }
 window.BM239DriveGlobal=Object.freeze({get connected(){return connected()},get writeAuthorized(){return false},writeToken:()=>'',sync,get lastReport(){return lastReport},get connectionStatus(){return {ready:true,initialized:true,connected:connected(),writeAuthorized:false,state:'private',message:'Acesso pelo servidor autenticado'}}});
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
 })();`);
}
export function privateCheckpoints(source){
 return cut(source,'/* 82 assets/v202_checkpoints_paths.js */','/* 83 assets/v281_card_sort.js */','/* Checkpoints administrativos indisponíveis no perfil de estudo. */');
}
export function privateReconcile(source){
 return cut(source,'/* 140 assets/v285_private_reconcile.js */','/* 141 assets/v286_study_blue.js */','/* Reconciliação administrativa indisponível no perfil de estudo. */');
}
export const disabledPublicScripts=new Set(['/assets/v325_public_layers_bridge.js','/assets/v327_deferred_10_bridge.js','/assets/v329_minerals_bridge.js','/assets/v368_supplements.js','/assets/v368_private_media.js']);

export function privateTimerHeader(source){
 const first="function command(action,fields={}){",second="const id=app.createSubject(fields.name);pendingSubject=fields.name;";
 if(source.split(first).length!==2||source.split(second).length!==2)throw Error('Contrato cabeçalho do cronômetro divergente');
 let s=source.replace(first,'async function command(action,fields={}){').replace(second,'const id=await app.createSubject(fields.name);pendingSubject=fields.name;');
 const replace=(x,y)=>{if(s.split(x).length!==2)throw Error('Contrato barra divergente: '+x);s=s.replace(x,y)};
 replace("state={kind:t.running?", "state={remote:!!t.remote,kind:t.running?");
 replace("const mapping={start:'timerStart'", "const mapping={claim:'timerClaim',start:'timerStart'");
 replace("controls.hidden=active;live.hidden=!active;", "controls.hidden=active;live.hidden=!active;$('claim').hidden=!state.remote;$('start').disabled=!!state.remote;");
 replace(" idle.append(subject,area,topic,list,subtopic,subList,start,add,create);"," const claim=el('button','','Recuperar sessão');claim.id='bm241-claim';claim.type='button';claim.hidden=true;claim.onclick=()=>void command('claim');\n idle.append(subject,area,topic,list,subtopic,subList,start,claim,add,create);");
 replace(" try{const d=JSON.parse(localStorage.getItem('BM245_CONTROLE_ESTUDOS')||'null');"," try{const d=window.BMVS41StudyControl?.snapshot();");
 const i=s.indexOf('function source(){',s.indexOf('/* 131 assets/v255_study_three_groups.js */')),j=s.indexOf('function getGroup(',i);
 if(i<0||j<0)throw Error('Contrato calendário divergente');
 s=s.slice(0,i)+`function source(){
  const v=window.BMVS41StudyControl?.snapshot();
  return v?{...v,state:'ok'}:{state:'empty',subjects:[],sessions:[],plans:[],reviews:[],cycle:[]};
 }
 `+s.slice(j);
 return s;
}

export function privateStudyCalendarStatus(source){
 const i=source.indexOf('/* 158 assets/v309_calendar_sync_ui.js */'),j=source.indexOf('/* 159 assets/',i);
 if(i<0||j<0)throw Error('Contrato status calendário divergente');
 let s=source.slice(i,j);
 s=s.replace("const d=JSON.parse(localStorage.getItem(KEY)||'null');","const d=window.BMVS41StudyControl?.snapshot();")
  .replace(" revisões neste navegador"," revisões da conta")
  .replace("drive?.writeToken?.()?'Conferir e sincronizar':'Autorizar Drive e sincronizar'","'Conferir e sincronizar'")
  .replace("const drive=window.BM239DriveGlobal,token=drive?.writeToken?.();","const drive=window.BM239DriveGlobal,token=window.BMVS41Session?.available();");
 return source.slice(0,i)+s+source.slice(j);
}

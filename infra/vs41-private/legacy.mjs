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
    const jobs=[['Avaliações',()=>window.BM316SrsJournal.refresh()],['Imagens',()=>window.BancoMestreDriveImagesV182.refresh()],['PDFs',()=>window.BancoMestrePDFSyncV130.refresh()],['Lacunas',()=>window.BM242LacunasDrive.sync()]];
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

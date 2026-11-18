/* V240 — sincronização conservadora do Controle de Estudos.
   Um único arquivo privado no Drive; sem mesclagem destrutiva.
   A base de cartões, SRS, PDFs e originais NÃO são alterados aqui. */
(function(){
'use strict';
if(window.BM240ControlDrive)return;
const KEY='BM245_CONTROLE_ESTUDOS',BASE='BM245_CONTROLE_DRIVE_BASE_SHA256',
 CLOCK='BM245_CONTROLE_TIMER',SNAPSHOT='BM245_CONTROLE_VERIFIED_BASE_DOC',KIND='bm_controle_estudos_v245',
 API='https://www.googleapis.com/drive/v3/files', UPLOAD='https://www.googleapis.com/upload/drive/v3/files',
 MAX=10000000;
const valid=d=>d&&d.schema===1&&['subjects','sessions','reviews','cycle'].every(x=>Array.isArray(d[x]))&&(!d.plans||Array.isArray(d.plans))&&(!d.audit||Array.isArray(d.audit));
const empty=d=>!d.subjects.length&&!d.sessions.length&&!d.reviews.length&&!d.cycle.length&&!(d.plans||[]).length&&
 (!d.cycleIndex)&&Number(d.availabilityWeek??15)===15&&Number(d.availabilityMonth??60)===60;
function localData(){
 const raw=localStorage.getItem(KEY);
 if(!raw)return {schema:1,subjects:[],sessions:[],reviews:[],plans:[],audit:[],cycle:[],cycleIndex:0,availabilityWeek:15,availabilityMonth:60};
 const d=JSON.parse(raw);if(!valid(d))throw Error('Controle local inválido: não substituir o arquivo');return d;
}
async function sha(data){
 const bytes=new TextEncoder().encode(JSON.stringify(data));
 const hash=new Uint8Array(await crypto.subtle.digest('SHA-256',bytes));
 return Array.from(hash,b=>b.toString(16).padStart(2,'0')).join('');
}
function rememberVerified(data,hash){
 const originalSnapshot=localStorage.getItem(SNAPSHOT);
 const originalHash=localStorage.getItem(BASE);
 try{
  localStorage.setItem(SNAPSHOT,JSON.stringify(data));
  localStorage.setItem(BASE,hash);
 }catch(e){
  try{
   if(originalSnapshot===null)localStorage.removeItem(SNAPSHOT);else localStorage.setItem(SNAPSHOT,originalSnapshot);
   if(originalHash===null)localStorage.removeItem(BASE);else localStorage.setItem(BASE,originalHash);
  }catch(_){}
  throw Error('Gravação no Drive verificada, mas marco de sincronização local falhou; preserve o backup: '+e.message);
 }
}
async function req(token,url,options={}){
 if(!token)throw Error('Drive desconectado');
 const r=await fetch(url,{...options,cache:'no-store',headers:{Authorization:'Bearer '+token,...options.headers}});
 if(!r.ok)throw Error('Drive HTTP '+r.status+(r.status===403?' (permissão de gravação ausente)':''));
 return r;
}
async function locate(token){
 const u=new URL(API);
 u.searchParams.set('q',"trashed = false and appProperties has { key='bm_kind' and value='"+KIND+"' }");
 u.searchParams.set('fields','nextPageToken,incompleteSearch,files(id,name,size,version,modifiedTime,appProperties)');
 u.searchParams.set('pageSize','100');
 const q=await (await req(token,u.href)).json();
 if(q.incompleteSearch||q.nextPageToken)throw Error('Busca incompleta; nenhum dado foi gravado');
 const files=(q.files||[]).filter(f=>f.appProperties?.bm_kind===KIND);
 if(files.length>1)throw Error('Dois arquivos mestres encontrados; conflito preservado para auditoria');
 return files[0]||null;
}
async function get(token,file){
 const response=await req(token,API+'/'+encodeURIComponent(file.id)+'?alt=media');
 const raw=await response.text();
 if(raw.length>MAX)throw Error('Arquivo de controle excede 10 MB');
 const doc=JSON.parse(raw);
 if(doc.format!=='BancoMestreControleDriveV245'||!valid(doc.data))throw Error('Mestre remoto com esquema diferente');
 return doc.data;
}
async function confirmRead(token,id,expected){
 const saved=await get(token,{id});
 if(await sha(saved)!==expected)throw Error('A conferência pós-gravação não confirmou os dados');
}
async function create(token,d,hash){
 const payload=JSON.stringify({format:'BancoMestreControleDriveV245',updatedAt:new Date().toISOString(),data:d});
 if(payload.length>MAX)throw Error('Controle local excede 10 MB');
 const meta={name:'BancoMestre_Controle_Estudos_V245.json',mimeType:'application/json',
  appProperties:{bm_kind:KIND,bm_schema:'V245'}};
 const boundary='bm239-'+crypto.randomUUID();
 const body='--'+boundary+'\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n'+JSON.stringify(meta)+
   '\r\n--'+boundary+'\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n'+payload+
   '\r\n--'+boundary+'--';
 const r=await req(token,UPLOAD+'?uploadType=multipart&fields=id,name,version,appProperties',
  {method:'POST',headers:{'Content-Type':'multipart/related; boundary='+boundary},body});
 const out=await r.json();if(!out.id||out.appProperties?.bm_kind!==KIND)throw Error('Criação remota não confirmada');
 await confirmRead(token,out.id,hash);return out;
}
async function update(token,file,d,hash){
 const latest=await (await req(token,API+'/'+encodeURIComponent(file.id)+'?fields=id,version,appProperties')).json();
 if(latest.id!==file.id||String(latest.version)!==String(file.version)||latest.appProperties?.bm_kind!==KIND)
  throw Error('Mestre alterado por outro dispositivo: nenhuma substituição realizada');
 const payload=JSON.stringify({format:'BancoMestreControleDriveV245',updatedAt:new Date().toISOString(),data:d});
 if(payload.length>MAX)throw Error('Controle local excede 10 MB');
 const r=await req(token,UPLOAD+'/'+encodeURIComponent(file.id)+'?uploadType=media&fields=id,version',
  {method:'PATCH',headers:{'Content-Type':'application/json; charset=UTF-8'},body:payload});
 const out=await r.json();if(out.id!==file.id)throw Error('Atualização sem ID confirmado');
 await confirmRead(token,file.id,hash);return out;
}
function safeImport(d){
 let clock=null;try{clock=JSON.parse(localStorage.getItem(CLOCK)||'null')}catch(_){}
 if(clock?.running||Number(clock?.elapsed)>0)throw Error('Cronômetro com tempo não salvo: encerre ou descarte antes de importar o controle remoto');
 const old=localStorage.getItem(KEY);
 if(old){
  const id='BM245_CONTROLE_RECUPERACAO_'+new Date().toISOString().replace(/[:.]/g,'-');
  localStorage.setItem(id,old);
 }
 localStorage.setItem(KEY,JSON.stringify(d));
 // O Controle nativo é atualizado pela sua API, sem iframe.
 window.BM240ControlApp?.reload?.();
}
function status(text){const el=document.getElementById('bm239-sync-details');if(el)el.title=text;}
let running=null,lastResult=null;
async function work(token){
 if(!crypto?.subtle)throw Error('Conferência SHA-256 indisponível neste navegador');
 const original=localData(),localHash=await sha(original),baseline=localStorage.getItem(BASE);
 const file=await locate(token);
 if(!file){
  if(empty(original))return {state:'empty',message:'Controle: sem registros locais para enviar'};
  const before=await locate(token);
  if(before)throw Error('Outro dispositivo criou o mestre durante a consulta');
  await create(token,original,localHash);
  rememberVerified(original,localHash);
  return {state:'uploaded',message:'Controle: mestre privado criado e verificado'};
 }
 const remote=await get(token,file),remoteHash=await sha(remote);
 if(localHash===remoteHash){
  rememberVerified(original,localHash);
  return {state:'unchanged',message:'Controle: dados conferidos, sem diferenças'};
 }
 // Primeiro uso em outro dispositivo: só importar se o Controle local estiver vazio.
 if((baseline&&localHash===baseline)||(!baseline&&empty(original))){
  if(await sha(localData())!==localHash)throw Error('Controle local mudou durante o download');
  safeImport(remote);
  rememberVerified(remote,remoteHash);
  return {state:'downloaded',message:'Controle: registros remotos importados, cópia local anterior preservada'};
 }
 // Alteração local sobre uma base remota conhecida.
 if(baseline&&remoteHash===baseline){
  if(await sha(localData())!==localHash)throw Error('Controle local mudou durante a sincronização');
  await update(token,file,original,localHash);
  rememberVerified(original,localHash);
  return {state:'uploaded',message:'Controle: alterações enviadas e verificadas no Drive'};
 }
 const preview=await inspectConflict(token,{file,remote,local:original,localHash,remoteHash,baseline});
 status(preview.message);
 return preview;
}
async function inspectConflict(token,known){
 const file=known?.file||await locate(token);
 if(!file)return {state:'empty',message:'Ainda não existe arquivo de homologação no Drive'};
 const local=known?.local||localData();
 const remote=known?.remote||await get(token,file);
 const localHash=known?.localHash||await sha(local);
 const remoteHash=known?.remoteHash||await sha(remote);
 const baseline=known?.baseline??localStorage.getItem(BASE);
 if(localHash===remoteHash)return {state:'unchanged',message:'Controle: cópias local e remota idênticas'};
 if(!baseline||baseline==='RESTORE_REQUIRES_RECONCILIATION')
  return {state:'conflict',message:'Controle: não há base comum verificada (ou existe restauração pendente); nenhuma gravação automática',conflicts:['Sem base comum confirmada']};
 const raw=localStorage.getItem(SNAPSHOT);
 if(!raw)return {state:'conflict',message:'Controle: instantâneo-base indisponível. Exporte cópias e reconcilie manualmente.',conflicts:['Sem instantâneo-base']};
 let base;
 try{base=JSON.parse(raw)}catch{return {state:'conflict',message:'Instantâneo-base inválido. Nenhum dado será substituído',conflicts:['Base corrompida']}}
 if(await sha(base)!==baseline)
  return {state:'conflict',message:'Hash do instantâneo-base divergente. Conciliação bloqueada.',conflicts:['Falha de integridade da base']};
 const candidate=window.BM240Reconcile?.reconcile(base,local,remote);
 if(!candidate)return {state:'error',message:'Conciliador de conflitos V240 não carregado'};
 if(!candidate.ok)return {state:'conflict',message:'Controle: '+candidate.conflicts.length+' conflito(s) específicos — nenhuma substituição.',conflicts:candidate.conflicts.slice(0,60)};
 return {state:'merge_ready',message:'Controle: alterações independentes conciliáveis. Confirme a operação na aba Backup antes de gravar.',conflicts:[],localHash,remoteHash};
}
async function mergeSafe(token){
 if(running)throw Error('Sincronização em andamento. Conclua-a antes de conciliar.');
 const file=await locate(token);
 if(!file)throw Error('Mestre de homologação não localizado');
 const local=localData(),remote=await get(token,file);
 const preview=await inspectConflict(token,{file,local,remote});
 if(preview.state!=='merge_ready')throw Error(preview.message);
 const timerRaw=localStorage.getItem(CLOCK);
 if(timerRaw){
  let clock;
  try{clock=JSON.parse(timerRaw)}catch{throw Error('Cronômetro local inválido; conciliação suspensa')}
  if(clock?.running||Number(clock?.elapsed)>0||clock?.transferPending||clock?.availableForTransfer)
   throw Error('Há sessão em curso ou transferência pendente: salve-a antes de conciliar');
 }
 const base=JSON.parse(localStorage.getItem(SNAPSHOT));
 const candidate=window.BM240Reconcile.reconcile(base,local,remote);
 if(!candidate.ok)throw Error('Conflito surgiu na segunda verificação');
 const hash=await sha(candidate.merged),beforeLocal=await sha(local),beforeRemote=await sha(remote);
 if(beforeLocal!==preview.localHash||beforeRemote!==preview.remoteHash)
  throw Error('Os originais mudaram durante a auditoria: operação interrompida');
 const preserved=await window.BM240StudyBackups?.preservePremerge(token,remote,local);
 if(!Array.isArray(preserved)||preserved.length!==2)
  throw Error('Não foi possível verificar os dois backups originais. Nenhum envio realizado.');
 if(await sha(localData())!==beforeLocal)
  throw Error('Registros locais alterados durante backups: nenhum envio realizado.');
 await update(token,file,candidate.merged,hash);
 safeImport(candidate.merged);
 rememberVerified(candidate.merged,hash);
 const report={state:'merged',message:'Controle: alterações independentes conciliadas e verificadas; 2 originais preservados no Drive',backups:preserved.map(x=>x.id)};
 lastResult=report;
 document.dispatchEvent(new CustomEvent('bm240-control-verified',{detail:{state:'merged'}}));
 return report;
}
async function verifyTimerOwnership(token,sessionId,ownerId){
 if(!token||!sessionId||!ownerId)return false;
 const file=await locate(token);
 if(!file)return false;
 const d=await get(token,file),a=d.activeTimer;
 return Boolean(a&&a.sessionId===sessionId&&a.ownerId===ownerId&&a.availableForTransfer&&!a.running);
}
async function sync(token){
 if(running)return running;
 running=work(token).then(r=>{
 lastResult=r;
 if(['uploaded','downloaded','unchanged'].includes(r?.state))
  document.dispatchEvent(new CustomEvent('bm240-control-verified',{detail:{state:r.state}}));
 return r;
 }).catch(e=>{
   lastResult={state:'error',message:'Controle: '+e.message};return lastResult
 }).finally(()=>running=null);
 return running;
}
window.BM240ControlDrive=Object.freeze({sync,inspectConflict,mergeSafe,verifyTimerOwnership,get lastResult(){return lastResult}});
})();
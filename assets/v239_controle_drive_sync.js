/* V239 — sincronização conservadora do Controle de Estudos.
   Um único arquivo privado no Drive; sem mesclagem destrutiva.
   A base de cartões, SRS, PDFs e originais NÃO são alterados aqui. */
(function(){
'use strict';
if(window.BM239ControlDrive)return;
const KEY='BM_CONTROLE_ESTUDOS_V238',BASE='BM239_CONTROLE_DRIVE_BASE_SHA256',
 CLOCK='BM_CONTROLE_TIMER_V238',KIND='bm_controle_estudos_v239',
 API='https://www.googleapis.com/drive/v3/files', UPLOAD='https://www.googleapis.com/upload/drive/v3/files',
 MAX=10000000;
const valid=d=>d&&d.schema===1&&['subjects','sessions','reviews','cycle'].every(x=>Array.isArray(d[x]));
const empty=d=>!d.subjects.length&&!d.sessions.length&&!d.reviews.length&&!d.cycle.length&&
 (!d.cycleIndex)&&Number(d.availabilityWeek??15)===15&&Number(d.availabilityMonth??60)===60;
function localData(){
 const raw=localStorage.getItem(KEY);
 if(!raw)return {schema:1,subjects:[],sessions:[],reviews:[],cycle:[],cycleIndex:0,availabilityWeek:15,availabilityMonth:60};
 const d=JSON.parse(raw);if(!valid(d))throw Error('Controle local inválido: não substituir o arquivo');return d;
}
async function sha(data){
 const bytes=new TextEncoder().encode(JSON.stringify(data));
 const hash=new Uint8Array(await crypto.subtle.digest('SHA-256',bytes));
 return Array.from(hash,b=>b.toString(16).padStart(2,'0')).join('');
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
 if(doc.format!=='BancoMestreControleDriveV239'||!valid(doc.data))throw Error('Mestre remoto com esquema diferente');
 return doc.data;
}
async function confirmRead(token,id,expected){
 const saved=await get(token,{id});
 if(await sha(saved)!==expected)throw Error('A conferência pós-gravação não confirmou os dados');
}
async function create(token,d,hash){
 const payload=JSON.stringify({format:'BancoMestreControleDriveV239',updatedAt:new Date().toISOString(),data:d});
 if(payload.length>MAX)throw Error('Controle local excede 10 MB');
 const meta={name:'BancoMestre_Controle_Estudos_Mestre_V239.json',mimeType:'application/json',
  appProperties:{bm_kind:KIND,bm_schema:'V239'}};
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
 const payload=JSON.stringify({format:'BancoMestreControleDriveV239',updatedAt:new Date().toISOString(),data:d});
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
  const id='BM239_CONTROLE_RECUPERACAO_'+new Date().toISOString().replace(/[:.]/g,'-');
  localStorage.setItem(id,old);
 }
 localStorage.setItem(KEY,JSON.stringify(d));
 const frame=document.getElementById('bm238-study-frame');
 if(frame?.contentDocument?.readyState==='complete')frame.contentWindow.location.reload();
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
  localStorage.setItem(BASE,localHash);
  return {state:'uploaded',message:'Controle: mestre privado criado e verificado'};
 }
 const remote=await get(token,file),remoteHash=await sha(remote);
 if(localHash===remoteHash){
  localStorage.setItem(BASE,localHash);
  return {state:'unchanged',message:'Controle: dados conferidos, sem diferenças'};
 }
 // Primeiro uso em outro dispositivo: só importar se o Controle local estiver vazio.
 if((baseline&&localHash===baseline)||(!baseline&&empty(original))){
  if(await sha(localData())!==localHash)throw Error('Controle local mudou durante o download');
  safeImport(remote);
  localStorage.setItem(BASE,remoteHash);
  return {state:'downloaded',message:'Controle: registros remotos importados, cópia local anterior preservada'};
 }
 // Alteração local sobre uma base remota conhecida.
 if(baseline&&remoteHash===baseline){
  if(await sha(localData())!==localHash)throw Error('Controle local mudou durante a sincronização');
  await update(token,file,original,localHash);
  localStorage.setItem(BASE,localHash);
  return {state:'uploaded',message:'Controle: alterações enviadas e verificadas no Drive'};
 }
 const conflict='Controle: versões divergentes entre dispositivos. Ambos os originais preservados; exporte os dados e reconcilie antes de substituir.';
 status(conflict);
 return {state:'conflict',message:conflict};
}
async function sync(token){
 if(running)return running;
 running=work(token).then(r=>{lastResult=r;return r}).catch(e=>{
   lastResult={state:'error',message:'Controle: '+e.message};return lastResult
 }).finally(()=>running=null);
 return running;
}
window.BM239ControlDrive=Object.freeze({sync,get lastResult(){return lastResult}});
})();
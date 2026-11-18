/* V240 — backups privados 30 diários + 12 mensais, somente após sync verificado. */
(function(){
'use strict';
if(window.BM240StudyBackups)return;
const API='https://www.googleapis.com/drive/v3/files',
UP='https://www.googleapis.com/upload/drive/v3/files',
KEY='BM245_CONTROLE_ESTUDOS',
KIND='bm_controle_estudos_v245_backup',MAX=10_000_000;
let ongoing=null,lastResult=null;
async function request(token,url,options={}){
 if(!token)throw Error('Token de escrita não disponível');
 const r=await fetch(url,{...options,cache:'no-store',
 headers:{Authorization:'Bearer '+token,...options.headers}});
 if(!r.ok)throw Error('Backup Drive HTTP '+r.status);
 return r;
}
async function digest(d){
 const b=new TextEncoder().encode(JSON.stringify(d));
 return [...new Uint8Array(await crypto.subtle.digest('SHA-256',b))].map(x=>x.toString(16).padStart(2,'0')).join('');
}
function local(){
 const raw=localStorage.getItem(KEY);
 if(!raw)return null;
 const d=JSON.parse(raw);
 if(d.schema!==1||!Array.isArray(d.sessions)||!Array.isArray(d.subjects)||!Array.isArray(d.reviews))throw Error('Dados locais inválidos; backup não criado');
 return d;
}
async function list(token){
 const u=new URL(API);
 u.searchParams.set('q',"trashed = false and appProperties has { key='bm_kind' and value='"+KIND+"' }");
 u.searchParams.set('fields','nextPageToken,incompleteSearch,files(id,name,createdTime,appProperties)');
 u.searchParams.set('pageSize','1000');
 const resp=await (await request(token,u.href)).json();
 if(resp.incompleteSearch||resp.nextPageToken)throw Error('Lista de backups incompleta. Exclusão e criação suspensas');
 return (resp.files||[]).filter(f=>f.appProperties?.bm_kind===KIND);
}
async function verified(token,id,hash){
 const r=await request(token,API+'/'+encodeURIComponent(id)+'?alt=media');
 const text=await r.text();
 if(text.length>MAX)throw Error('Backup remoto excede o limite de verificação');
 const doc=JSON.parse(text);
 if(doc.format!=='BancoMestreControleBackupV245'||doc.sha256!==hash||await digest(doc.data)!==hash)
  throw Error('Falha na auditoria SHA-256 da cópia remota');
 if(!doc.data||doc.data.schema!==1||!['subjects','sessions','reviews','cycle'].every(k=>Array.isArray(doc.data[k])))
  throw Error('Cópia remota com estrutura incompatível');
 for(const k of ['subjects','sessions','reviews']){
  const ids=new Set();
  for(const row of doc.data[k]){
   if(!row||typeof row.id!=='string'||ids.has(row.id))throw Error('IDs duplicados ou ausentes na cópia remota: '+k);
   ids.add(row.id);
  }
 }
 return doc.data;
}
async function create(token,data,period,day,hash){
 const payload=JSON.stringify({format:'BancoMestreControleBackupV245',createdAt:new Date().toISOString(),period,day,sha256:hash,data});
 if(payload.length>MAX)throw Error('Backup excede 10MB; exporte uma cópia manual e revise o acervo');
 const meta={name:'BancoMestre_Controle_V245_'+period+'_'+day+'.json',mimeType:'application/json',
 appProperties:{bm_kind:KIND,bm_period:period,bm_day:day,bm_sha256:hash}};
 const boundary='bm240-'+crypto.randomUUID();
 const body='--'+boundary+'\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n'+JSON.stringify(meta)+
 '\r\n--'+boundary+'\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n'+payload+'\r\n--'+boundary+'--';
 const r=await request(token,UP+'?uploadType=multipart&fields=id,name,appProperties',
  {method:'POST',headers:{'Content-Type':'multipart/related; boundary='+boundary},body});
 const out=await r.json();
 if(!out.id||out.appProperties?.bm_kind!==KIND)throw Error('Drive não confirmou a criação');
 await verified(token,out.id,hash);
 return out;
}
async function prune(token,entries,period,limit){
 const group=entries.filter(f=>f.appProperties?.bm_period===period).sort((a,b)=>
  String(b.appProperties?.bm_day||'').localeCompare(String(a.appProperties?.bm_day||''))||
  String(b.createdTime||'').localeCompare(String(a.createdTime||'')));
 const keep=new Set(group.slice(0,limit).map(x=>x.id));
 let removed=0;
 for(const f of group.slice(limit)){
  if(keep.has(f.id))continue;
  // Only backups bearing exact V240 appProperties are rotated. Never touch the master.
  await request(token,API+'/'+encodeURIComponent(f.id),{method:'DELETE'});removed++;
 }
 return removed;
}
function dayKey(){
 const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
}
async function work(token){
 if(!crypto?.subtle)throw Error('SHA-256 indisponível');
 const d=local();
 if(!d)return {state:'empty',message:'Backup: sem controle local para proteger'};
 const hash=await digest(d),day=dayKey(),month=day.slice(0,7);
 const existing=await list(token);
 const added=[];
 for(const [period,key] of [['daily',day],['monthly',month]]){
  const matches=existing.filter(f=>f.appProperties?.bm_period===period&&f.appProperties?.bm_day===key);
  if(matches.length>1)throw Error('Backups duplicados para '+period+' '+key+'; intervenção necessária antes de prosseguir');
  if(matches.length===1){
   // An existing dated backup remains immutable; readback checks integrity.
   await verified(token,matches[0].id,matches[0].appProperties?.bm_sha256||hash);
  }else{
   if(await digest(local())!==hash)throw Error('Dados mudaram durante o backup; tente novamente');
   added.push(await create(token,d,period,key,hash));
  }
 }
 const verifiedList=await list(token);
 if(added.some(x=>!verifiedList.some(f=>f.id===x.id)))throw Error('Backup criado mas não encontrado na conferência');
 const removedDaily=await prune(token,verifiedList,'daily',30);
 const removedMonthly=await prune(token,verifiedList,'monthly',12);
 return {state:'verified',message:'Backups: '+added.length+' novos, diário e mensal conferidos; rotação '+removedDaily+' diários e '+removedMonthly+' mensais'};
}
async function listAvailable(token){
 const files=await list(token);
 return files.map(f=>({
  id:f.id,
  name:f.name,
  period:f.appProperties?.bm_period,
  day:f.appProperties?.bm_day,
  sha256:f.appProperties?.bm_sha256
 })).filter(f=>f.id&&f.sha256&&['daily','monthly','premerge'].includes(f.period))
   .sort((a,b)=>String(b.day).localeCompare(String(a.day)));
}
async function restoreToLocal(token,id){
 if(typeof id!=='string'||!id)throw Error('Identificador do backup inválido');
 const available=await listAvailable(token);
 const chosen=available.find(f=>f.id===id);
 if(!chosen)throw Error('Backup não identificado na lista do Drive; nenhuma alteração aplicada');
 const data=await verified(token,id,chosen.sha256);
 const old=localStorage.getItem(KEY);
 const timerRaw=localStorage.getItem('BM245_CONTROLE_TIMER');
 if(timerRaw){
  let c;
  try{c=JSON.parse(timerRaw)}catch{throw Error('Cronômetro local inválido: preserve-o antes de restaurar')}
  if(c?.running||Number(c?.elapsed)>0||c?.transferPending)
   throw Error('Cronômetro pendente: pause, encerre ou descarte antes de restaurar');
 }
 if(old!==localStorage.getItem(KEY))throw Error('Histórico alterado durante a conferência: restauração suspensa');
 const prefix='BM240_PRE_RESTORE_'+new Date().toISOString().replace(/[:.]/g,'-');
 const previousBaseline=localStorage.getItem('BM245_CONTROLE_DRIVE_BASE_SHA256');
 // Não sobrescrever silenciosamente: uma cópia anterior é persistida primeiro.
 localStorage.setItem(prefix,old===null?JSON.stringify({schema:1,subjects:[],sessions:[],reviews:[],plans:[],audit:[],cycle:[],cycleIndex:0,availabilityWeek:15,availabilityMonth:60}):old);
 try{
  // Marca a origem como divergente para IMPEDIR que o sincronizador envie automaticamente uma restauração antiga sobre o mestre do Drive.
  localStorage.setItem('BM245_CONTROLE_DRIVE_BASE_SHA256','RESTORE_REQUIRES_RECONCILIATION');
  localStorage.setItem(KEY,JSON.stringify(data));
  window.BM240ControlApp?.reload?.();
 }catch(e){
  try{
   if(old===null)localStorage.removeItem(KEY);else localStorage.setItem(KEY,old);
   if(previousBaseline===null)localStorage.removeItem('BM245_CONTROLE_DRIVE_BASE_SHA256');
   else localStorage.setItem('BM245_CONTROLE_DRIVE_BASE_SHA256',previousBaseline);
  }catch(_){}
  throw Error('Restauração local não concluída: '+e.message);
 }
 return {state:'restored-local-only',count:data.sessions.length,backupName:chosen.name,
  message:'Cópia validada e restaurada APENAS neste navegador. Mestre remoto preservado; conciliação pendente antes de sincronizar.'};
}
async function preservePremerge(token,remote,local){
 if(!remote||!local)throw Error('Originais ausentes; nenhuma conciliação permitida');
 const stamp=new Date().toISOString().replace(/[:.]/g,'-')+'_'+crypto.randomUUID();
 const records=[];
 for(const [label,data] of [['remote',remote],['local',local]]){
  const hash=await digest(data);
  const out=await create(token,data,'premerge',stamp+'_'+label,hash);
  records.push({id:out.id,label,hash});
 }
 if(records.length!==2)throw Error('Backups prévios incompletos');
 return records;
}
async function afterSync(token){
 if(ongoing)return ongoing;
 ongoing=work(token).then(r=>(lastResult=r,r)).catch(e=>(lastResult={state:'error',message:'Backup: '+e.message},lastResult)).finally(()=>ongoing=null);
 return ongoing;
}
window.BM240StudyBackups=Object.freeze({afterSync,listAvailable,restoreToLocal,preservePremerge,get lastResult(){return lastResult}});
})();
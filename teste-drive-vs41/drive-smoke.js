// One-command real Drive smoke test. Only newly created test files are ever changed.
const randomUUID=()=>globalThis.crypto.randomUUID();
import {createReader} from './catalog.js';
const PROJECT='bm-portal-multi-v1',API='https://www.googleapis.com/drive/v3/files',UPLOAD='https://www.googleapis.com/upload/drive/v3/files';
export async function runDriveSmoke({getToken,fetcher=fetch,runId=randomUUID().replaceAll('-','')}){
 if(!/^[a-zA-Z0-9_-]{8,80}$/.test(runId))throw Error('Identificador de teste inválido');
 const created=[],sessions=[],expected=new Map(),cleanupErrors=[];
 async function request(url,opts={}){
  const {token}=await getToken();if(typeof token!=='string'||!token)throw Error('OAuth indisponível');
  const res=await fetcher(url,{...opts,headers:{Authorization:'Bearer '+token,...opts.headers},cache:'no-store',redirect:'error'});
  if(!res.ok)throw Error('Operação Drive recusada (HTTP '+res.status+')');
  return res.json();
 }
 async function add(subject,kind,parent,payload){
  const name='BM teste '+runId+' '+kind,appProperties={bmProject:PROJECT,bmOwner:subject,bmKind:kind,bmSmoke:runId};
  const m={name,mimeType:kind==='root'?'application/vnd.google-apps.folder':'application/json',appProperties,...(parent?{parents:[parent]}:{})};
  let result;
  if(kind==='root')result=await request(API+'?fields=id',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(m)});
  else{const boundary='bm_'+randomUUID().replaceAll('-','');const body='--'+boundary+'\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n'+JSON.stringify(m)+'\r\n--'+boundary+'\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n'+JSON.stringify(payload)+'\r\n--'+boundary+'--\r\n';
   result=await request(UPLOAD+'?uploadType=multipart&fields=id',{method:'POST',headers:{'Content-Type':'multipart/related; boundary='+boundary},body});}
  if(typeof result.id!=='string'||!/^[A-Za-z0-9_-]{1,160}$/.test(result.id)||created.some(x=>x.id===result.id))throw Error('Recibo inválido');
  created.push({id:result.id,subject,kind,parent});return result.id;
 }
 let failure=null,passed=false;
 try{
  for(const label of ['A','B']){
   const subject='smoke-'+runId+'-'+label,rootId=await add(subject,'root',null),back='Resposta experimental '+label+' '+runId;
   const records=[{id:'CARD-9901',front:'Pergunta experimental '+label,back,expl:'Cartão fictício de teste',active:true,discipline:'Teste',group:'OUTROS',subject:'Teste',related_card_ids:[]}];
   const cards=await add(subject,'cards',rootId,{schema:'BM-PORTAL-COLLECTION/1',project:PROJECT,owner:subject,kind:'cards',records});
   const profileId=await add(subject,'profile',rootId,{schema:'BM-PORTAL-PROFILE/1',project:PROJECT,owner:subject,catalog:'private-only',collections:{cards}});
   sessions.push({subject,rootId,profileId,sessionId:'smoke-'+label});expected.set(subject,back);
  }
  const read=createReader({getToken,fetcher,resolveSession:async req=>req});
  const views=await Promise.all(sessions.map(read));
  if(views.some((v,i)=>v.records.length!==1||v.records[0].id!=='CARD-9901'||v.records[0].back!==expected.get(sessions[i].subject)))throw Error('Conteúdo divergente');
  let denied=false;try{await read({...sessions[0],profileId:sessions[1].profileId})}catch{denied=true}
  if(!denied)throw Error('Isolamento não confirmado');passed=true;
 }catch(e){failure=e}
 finally{
  // Trash only files returned by this invocation, after re-checking unique tags and ownership.
  for(const f of created.reverse()){
   try{const url=API+'/'+encodeURIComponent(f.id),m=await request(url+'?fields=id,ownedByMe,shared,trashed,parents,appProperties');
    if(m.id!==f.id||m.ownedByMe!==true||m.shared!==false||m.trashed!==false||m.appProperties?.bmSmoke!==runId||m.appProperties?.bmOwner!==f.subject||m.appProperties?.bmProject!==PROJECT||m.appProperties?.bmKind!==f.kind||(f.parent&&(!Array.isArray(m.parents)||m.parents.length!==1||m.parents[0]!==f.parent)))throw Error('Destino temporário divergente');
    const receipt=await request(url+'?fields=id,trashed',{method:'PATCH',headers:{'Content-Type':'application/json'},body:'{"trashed":true}'});
    if(receipt.id!==f.id||receipt.trashed!==true)throw Error('Limpeza não confirmada');
   }catch{cleanupErrors.push(f.id)}
  }
 }
 return {ok:passed&&!failure&&!cleanupErrors.length,profiles:passed?2:0,cardCounts:passed?[1,1]:[],crossAccessDenied:passed,temporaryCreated:created.length,temporaryTrashed:created.length-cleanupErrors.length,cleanupPending:cleanupErrors.length,...(failure?{error:'Teste Drive não concluído'}:{})};
}

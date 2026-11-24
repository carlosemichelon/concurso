import {checkedMarksEnvelope,MARKS_KIND} from './multiaccount-marks-v001.mjs';
import {checkedDiscursive} from './multiaccount-discursive-v001.mjs';
import {checkedReviewEvent} from './multiaccount-review-events-v001.mjs';
/* Drive real, vinculado a uma única identidade OAuth. Sem dados pessoais fixos.
 * Catálogo público é resolvido pelo carregador do portal, nunca pelo perfil como URL arbitrária.
 * Nenhum hash na abertura normal. Nenhuma criação automática de banco.
 */
import {verifiedSubject,privateDriveFile} from './multiaccount-storage-v001.mjs';
import {createBootstrap,PROFILE_KINDS} from './multiaccount-bootstrap-v001.mjs';
export const PORTAL_PROJECT='bm-portal-multi-v1';
export const PORTAL_SCOPE='openid email https://www.googleapis.com/auth/drive.file';
const DRIVE_API='https://www.googleapis.com/drive/v3/files';
const USERINFO='https://openidconnect.googleapis.com/v1/userinfo';
const META='id,name,mimeType,ownedByMe,shared,trashed,parents,appProperties,size,version';
const MAX_JSON=40*1024*1024;
const idOk=x=>typeof x==='string'&&/^[A-Za-z0-9_-]{1,160}$/.test(x);
const quote=x=>{if(!idOk(x))throw Error('Identificador inválido');return "'"+x+"'"};
const onlyOne=(list,kind)=>{if(list.length!==1)throw Error(list.length?'Mais de um '+kind+' encontrado; corrigir conflito de perfil.':'Perfil ainda não preparado: '+kind+' ausente.');return list[0]};
export function createDriveProvider({fetcher=fetch,token,info,expiresAt,loadCatalog}){
 const owner=verifiedSubject(info);if(typeof token!=='string'||!token||!Number.isFinite(expiresAt)||typeof loadCatalog!=='function')throw Error('Sessão Drive inválida');
 let active=true,rootId=null;
 const check=subject=>{if(!active||Date.now()>=expiresAt)throw Error('Sessão Google encerrada ou expirada');if(subject!==owner)throw Error('Conta diferente da sessão autenticada')};
 async function req(url,subject){check(subject);const r=await fetcher(url,{headers:{Authorization:'Bearer '+token},cache:'no-store',redirect:'error'});check(subject);if(!r.ok)throw Error('Drive HTTP '+r.status+' — perfil não carregado');return r}
 async function list(subject,kind,parent=null){check(subject);const q="trashed = false and appProperties has { key='bmProject' and value="+quote(PORTAL_PROJECT)+" } and appProperties has { key='bmOwner' and value="+quote(subject)+" } and appProperties has { key='bmKind' and value="+quote(kind)+" }"+(parent?" and "+quote(parent)+" in parents":"");let page='',all=[],seen=new Set(),pages=0;do{if(++pages>100)throw Error('Limite de páginas excedido');const url=DRIVE_API+'?q='+encodeURIComponent(q)+'&fields='+encodeURIComponent('nextPageToken,incompleteSearch,files('+META+')')+'&pageSize=100'+(page?'&pageToken='+encodeURIComponent(page):'');const d=await (await req(url,subject)).json();if(d.incompleteSearch||!Array.isArray(d.files))throw Error('Busca Drive incompleta');for(const f of d.files){if(seen.has(f.id))throw Error('Resultado Drive duplicado');seen.add(f.id);all.push(privateDriveFile(f,subject,kind,{parent,project:PORTAL_PROJECT}))}if(all.length>10000)throw Error('Excesso de resultados de perfil');const next=d.nextPageToken||'';if(next&&next===page)throw Error('Paginação inválida');page=next}while(page);return all}
 async function metadata(id,subject,kind,parent){if(!idOk(id))throw Error('ID inválido');const f=privateDriveFile(await (await req(DRIVE_API+'/'+encodeURIComponent(id)+'?fields='+encodeURIComponent(META),subject)).json(),subject,kind,{parent,project:PORTAL_PROJECT});if(f.id!==id)throw Error('ID do arquivo divergente');return f}
 async function jsonFile(f,subject){if(f.mimeType!=='application/json'||!Number.isSafeInteger(Number(f.size))||Number(f.size)<=0||Number(f.size)>MAX_JSON)throw Error('Arquivo de perfil inválido ou maior que 40 MB');const response=await req(DRIVE_API+'/'+encodeURIComponent(f.id)+'?alt=media',subject);const text=await response.text();check(subject);if(new TextEncoder().encode(text).length!==Number(f.size))throw Error('Arquivo incompleto: '+f.id);return JSON.parse(text)}
 async function appendEvent(subject,kind,prefix,e,eventId){check(subject);if(!rootId)throw Error('Raiz não carregada');const boundary='bm_event_'+eventId.replaceAll('-','');const meta={name:prefix+eventId+'.json',mimeType:'application/json',parents:[rootId],appProperties:{bmProject:PORTAL_PROJECT,bmOwner:subject,bmKind:kind,bmEvent:eventId}};const body='--'+boundary+'\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n'+JSON.stringify(meta)+'\r\n--'+boundary+'\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n'+JSON.stringify(e)+'\r\n--'+boundary+'--\r\n';const r=await fetcher('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields='+encodeURIComponent(META),{method:'POST',headers:{Authorization:'Bearer '+token,'Content-Type':'multipart/related; boundary='+boundary},body,cache:'no-store',redirect:'error'});check(subject);if(!r.ok)throw Error('Gravação não confirmada (HTTP '+r.status+')');const f=privateDriveFile(await r.json(),subject,kind,{parent:rootId,project:PORTAL_PROJECT});if(f.appProperties?.bmEvent!==eventId)throw Error('Confirmação do evento divergente');return {...e,fileId:f.id}}
 return Object.freeze({
  async findRoot(subject){const f=onlyOne(await list(subject,'root'),'pasta raiz');if(f.mimeType!=='application/vnd.google-apps.folder')throw Error('Raiz inválida');rootId=f.id;return f},
  async findProfile(root,subject){check(subject);if(root!==rootId)throw Error('Raiz diferente da sessão');const f=onlyOne(await list(subject,'profile',root),'manifesto de perfil');return {file:f,payload:await jsonFile(f,subject)}},
  async readCollection(id,subject,kind){check(subject);if(!rootId||!PROFILE_KINDS.includes(kind))throw Error('Coleção inválida');const file=await metadata(id,subject,kind,rootId);return {file,payload:await jsonFile(file,subject)}},
  async readPdf(subject,id){check(subject);if(!rootId)throw Error('Raiz não carregada');const f=await metadata(id,subject,'pdf-source',rootId);if(f.mimeType!=='application/pdf'||!Number.isSafeInteger(Number(f.size))||Number(f.size)<=0||Number(f.size)>120000000)throw Error('PDF inválido ou acima de 120 MB');const r=await req(DRIVE_API+'/'+encodeURIComponent(id)+'?alt=media',subject);const blob=await r.blob();check(subject);if(blob.size!==Number(f.size)||blob.type!=='application/pdf')throw Error('PDF recebido incompleto ou inválido');return blob},
  async readMarksMaster(subject){check(subject);if(!rootId)throw Error('Raiz não carregada');const files=await list(subject,MARKS_KIND,rootId);if(files.length>1)throw Error('Mais de um mestre individual; conciliação necessária');if(!files.length)return null;const f=files[0];if(!/^\d+$/.test(String(f.version)))throw Error('Versão do mestre indisponível');return {id:f.id,version:String(f.version),payload:checkedMarksEnvelope(await jsonFile(f,subject),subject)}},
  async saveMarksMaster(subject,expected,payload){check(subject);if(!rootId)throw Error('Raiz não carregada');const value=checkedMarksEnvelope(payload,subject);const files=await list(subject,MARKS_KIND,rootId);
   if(!expected){if(files.length)throw Error('Mestre criado por outro dispositivo; sincronize novamente');return appendEvent(subject,MARKS_KIND,'BM_PORTAL_MARKS_',value,'master-v104')}
   if(files.length!==1||files[0].id!==expected.id||String(files[0].version)!==String(expected.version))throw Error('Mestre alterado por outro dispositivo; sincronize novamente');
   const url='https://www.googleapis.com/upload/drive/v3/files/'+encodeURIComponent(expected.id)+'?uploadType=media&fields='+encodeURIComponent(META);
   const r=await fetcher(url,{method:'PATCH',headers:{Authorization:'Bearer '+token,'Content-Type':'application/json; charset=UTF-8'},body:JSON.stringify(value),cache:'no-store',redirect:'error'});check(subject);if(!r.ok)throw Error('Gravação do mestre não confirmada (HTTP '+r.status+')');
   const f=privateDriveFile(await r.json(),subject,MARKS_KIND,{parent:rootId,project:PORTAL_PROJECT});if(f.id!==expected.id||! /^\d+$/.test(String(f.version)))throw Error('Confirmação do mestre divergente');return {id:f.id,version:String(f.version)}
  },
  async readReviewEvents(subject){check(subject);if(!rootId)throw Error('Raiz não carregada');const entries=await list(subject,'srs-event',rootId);const events=[];for(const f of entries){const e=checkedReviewEvent(await jsonFile(f,subject),subject);if(f.appProperties?.bmEvent!==e.event_id)throw Error('Identificador do evento divergente');events.push(e)}if(new Set(events.map(e=>e.event_id)).size!==events.length)throw Error('Eventos duplicados');return events},
  async appendReview(subject,event){return appendEvent(subject,'srs-event','BM_PORTAL_SRS_',checkedReviewEvent(event,subject),event.event_id)},
  async readDiscursive(subject){check(subject);if(!rootId)throw Error('Raiz não carregada');const entries=await list(subject,'discursive-event',rootId),events=[];for(const f of entries){const e=checkedDiscursive(await jsonFile(f,subject),subject);if(f.appProperties?.bmEvent!==e.id)throw Error('Identificador discursivo divergente');events.push({...e,fileId:f.id})}if(new Set(events.map(e=>e.id)).size!==events.length)throw Error('Tentativas duplicadas');return events},
  async appendDiscursive(subject,row){return appendEvent(subject,'discursive-event','BM_PORTAL_DISCURSIVE_',checkedDiscursive(row,subject),row.id)},
  async loadCatalog(descriptor){check(owner);const result=await loadCatalog(descriptor);check(owner);return result},
  close(){active=false;rootId=null;token=''}
 });
}
export function createPortalSession({clientId,gis,fetcher=fetch,catalogs,loadCatalog}){
 let generation=0,provider=null,boot=null,phase='locked',identity=null;
 const logout=()=>{generation++;boot?.lock();provider?.close();boot=null;provider=null;identity=null;phase='locked'};
 const ensure=n=>{if(generation!==n)throw Error('Sessão alterada durante autenticação')};
 return Object.freeze({get phase(){return phase},get current(){return phase==='ready'?boot?.current||null:null},get identity(){return phase==='ready'&&identity?{...identity}:null},logout,
 async readPdf(id){if(phase!=='ready')throw Error('Sessão indisponível');const n=generation,result=await provider.readPdf(identity.sub,id);ensure(n);return result},
 async readMarksMaster(){if(phase!=='ready')throw Error('Sessão indisponível');const n=generation,result=await provider.readMarksMaster(identity.sub);ensure(n);return result},
 async saveMarksMaster(expected,payload){if(phase!=='ready')throw Error('Sessão indisponível');const n=generation,result=await provider.saveMarksMaster(identity.sub,expected,payload);ensure(n);return result},
 async readReviewEvents(){if(phase!=='ready')throw Error('Sessão indisponível');const n=generation,result=await provider.readReviewEvents(identity.sub);ensure(n);return result},
 async appendReview(event){if(phase!=='ready')throw Error('Sessão indisponível');const n=generation,result=await provider.appendReview(identity.sub,event);ensure(n);return result},
 async readDiscursive(){if(phase!=='ready')throw Error('Sessão indisponível');const n=generation,result=await provider.readDiscursive(identity.sub);ensure(n);return result},
 async appendDiscursive(row){if(phase!=='ready')throw Error('Sessão indisponível');const n=generation,result=await provider.appendDiscursive(identity.sub,row);ensure(n);return result},
 async login(){logout();const n=generation;phase='loading';let reply=null;
  try{if(!gis?.initTokenClient)throw Error('Google Identity indisponível');
   reply=await new Promise((resolve,reject)=>{const c=gis.initTokenClient({client_id:clientId,scope:PORTAL_SCOPE,include_granted_scopes:false,callback:r=>r.error?reject(Error(r.error_description||r.error)):resolve(r),error_callback:r=>reject(Error(r.message||r.type||'Autorização cancelada'))});c.requestAccessToken({prompt:'select_account'})});ensure(n);
   if(!reply.access_token||!Number.isFinite(Number(reply.expires_in))||Number(reply.expires_in)<=30)throw Error('Autorização Google inválida');
   const response=await fetcher(USERINFO,{headers:{Authorization:'Bearer '+reply.access_token},cache:'no-store',redirect:'error'});ensure(n);if(!response.ok)throw Error('Identidade Google não confirmada');
   const info=await response.json();ensure(n);verifiedSubject(info);
   provider=createDriveProvider({fetcher,token:reply.access_token,info,expiresAt:Date.now()+(Number(reply.expires_in)-30)*1000,loadCatalog});boot=createBootstrap({catalogs,provider});
   const result=await boot.open(info);ensure(n);identity={sub:info.sub,email:info.email};phase='ready';return result;
  }catch(e){if(generation===n){boot?.lock();provider?.close();boot=null;provider=null;identity=null;phase='blocked'}throw e}finally{if(reply)reply.access_token=''}
 }});
}

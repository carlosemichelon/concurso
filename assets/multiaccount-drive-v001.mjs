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
const META='id,name,mimeType,ownedByMe,shared,trashed,parents,appProperties,size';
const MAX_JSON=40*1024*1024;
const idOk=x=>typeof x==='string'&&/^[A-Za-z0-9_-]{1,160}$/.test(x);
const quote=x=>{if(!idOk(x))throw Error('Identificador inválido');return "'"+x+"'"};
const onlyOne=(list,kind)=>{if(list.length!==1)throw Error(list.length?'Mais de um '+kind+' encontrado; corrigir conflito de perfil.':'Perfil ainda não preparado: '+kind+' ausente.');return list[0]};
export function createDriveProvider({fetcher=fetch,token,info,expiresAt,loadCatalog}){
 const owner=verifiedSubject(info);if(typeof token!=='string'||!token||!Number.isFinite(expiresAt)||typeof loadCatalog!=='function')throw Error('Sessão Drive inválida');
 let active=true,rootId=null;
 const check=subject=>{if(!active||Date.now()>=expiresAt)throw Error('Sessão Google encerrada ou expirada');if(subject!==owner)throw Error('Conta diferente da sessão autenticada')};
 async function req(url,subject){check(subject);const r=await fetcher(url,{headers:{Authorization:'Bearer '+token},cache:'no-store',redirect:'error'});check(subject);if(!r.ok)throw Error('Drive HTTP '+r.status+' — perfil não carregado');return r}
 async function list(subject,kind,parent=null){check(subject);const q="trashed = false and appProperties has { key='bmProject' and value="+quote(PORTAL_PROJECT)+" } and appProperties has { key='bmOwner' and value="+quote(subject)+" } and appProperties has { key='bmKind' and value="+quote(kind)+" }"+(parent?" and "+quote(parent)+" in parents":"");let page='',all=[],seen=new Set();do{const url=DRIVE_API+'?q='+encodeURIComponent(q)+'&fields='+encodeURIComponent('nextPageToken,incompleteSearch,files('+META+')')+'&pageSize=100'+(page?'&pageToken='+encodeURIComponent(page):'');const d=await (await req(url,subject)).json();if(d.incompleteSearch||!Array.isArray(d.files))throw Error('Busca Drive incompleta');for(const f of d.files){if(seen.has(f.id))throw Error('Resultado Drive duplicado');seen.add(f.id);all.push(privateDriveFile(f,subject,kind,{parent,project:PORTAL_PROJECT}))}if(all.length>1000)throw Error('Excesso de resultados de perfil');const next=d.nextPageToken||'';if(next&&next===page)throw Error('Paginação inválida');page=next}while(page);return all}
 async function metadata(id,subject,kind,parent){if(!idOk(id))throw Error('ID inválido');const f=privateDriveFile(await (await req(DRIVE_API+'/'+encodeURIComponent(id)+'?fields='+encodeURIComponent(META),subject)).json(),subject,kind,{parent,project:PORTAL_PROJECT});if(f.id!==id)throw Error('ID do arquivo divergente');return f}
 async function jsonFile(f,subject){if(f.mimeType!=='application/json'||!Number.isSafeInteger(Number(f.size))||Number(f.size)<=0||Number(f.size)>MAX_JSON)throw Error('Arquivo de perfil inválido ou maior que 40 MB');const response=await req(DRIVE_API+'/'+encodeURIComponent(f.id)+'?alt=media',subject);const text=await response.text();check(subject);if(new TextEncoder().encode(text).length!==Number(f.size))throw Error('Arquivo incompleto: '+f.id);return JSON.parse(text)}
 return Object.freeze({
  async findRoot(subject){const f=onlyOne(await list(subject,'root'),'pasta raiz');if(f.mimeType!=='application/vnd.google-apps.folder')throw Error('Raiz inválida');rootId=f.id;return f},
  async findProfile(root,subject){check(subject);if(root!==rootId)throw Error('Raiz diferente da sessão');const f=onlyOne(await list(subject,'profile',root),'manifesto de perfil');return {file:f,payload:await jsonFile(f,subject)}},
  async readCollection(id,subject,kind){check(subject);if(!rootId||!PROFILE_KINDS.includes(kind))throw Error('Coleção inválida');const file=await metadata(id,subject,kind,rootId);return {file,payload:await jsonFile(file,subject)}},
  async loadCatalog(descriptor){check(owner);const result=await loadCatalog(descriptor);check(owner);return result},
  close(){active=false;rootId=null;token=''}
 });
}
export function createPortalSession({clientId,gis,fetcher=fetch,catalogs,loadCatalog}){
 let generation=0,provider=null,boot=null,phase='locked',identity=null;
 const logout=()=>{generation++;boot?.lock();provider?.close();boot=null;provider=null;identity=null;phase='locked'};
 const ensure=n=>{if(generation!==n)throw Error('Sessão alterada durante autenticação')};
 return Object.freeze({get phase(){return phase},get current(){return phase==='ready'?boot?.current||null:null},get identity(){return phase==='ready'&&identity?{...identity}:null},logout,
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

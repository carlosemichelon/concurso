// Read-only. Session and folder mapping must be supplied by authenticated server, never request input.
const API='https://www.googleapis.com/drive/v3/files',PROJECT='bm-portal-multi-v1';
const FIELDS='id,mimeType,ownedByMe,shared,trashed,parents,appProperties,size,version';
const idOk=v=>typeof v==='string'&&/^[A-Za-z0-9_-]{1,160}$/.test(v);
const fail=()=>{throw Error('Catálogo privado indisponível ou não autorizado')};
function meta(f,id,subject,kind,parent){
 if(!f||f.id!==id||f.ownedByMe!==true||f.shared!==false||f.trashed!==false||f.appProperties?.bmProject!==PROJECT||f.appProperties?.bmOwner!==subject||f.appProperties?.bmKind!==kind)fail();
 if(parent&&(!Array.isArray(f.parents)||f.parents.length!==1||f.parents[0]!==parent))fail();
 if(kind==='root'?f.mimeType!=='application/vnd.google-apps.folder':f.mimeType!=='application/json')fail();
 if(kind!=='root'&&(!Number.isSafeInteger(Number(f.size))||Number(f.size)<1||Number(f.size)>32*1024*1024))fail();
 return f;
}
export function verifyRecords(records){
 if(!Array.isArray(records)||records.length>20000)fail();const seen=new Set();
 for(const c of records){if(!c||!/^CARD-[0-9]{4,12}$/.test(c.id)||seen.has(c.id)||typeof c.front!=='string'||!c.front.trim()||typeof c.back!=='string'||!c.back.trim()||typeof c.expl!=='string'||typeof c.active!=='boolean'||typeof c.discipline!=='string'||typeof c.group!=='string'||typeof c.subject!=='string')fail();seen.add(c.id)}
 for(const c of records)if(c.related_card_ids!==undefined&&(!Array.isArray(c.related_card_ids)||c.related_card_ids.some(id=>!seen.has(id))))fail();
 return structuredClone(records);
}
export function createReader({resolveSession,getToken,fetcher=fetch}){
 return async request=>{
  const session=await resolveSession(request);if(!session||![session.subject,session.rootId,session.profileId,session.sessionId].every(idOk))fail();
  const {subject,rootId,profileId}=session,{token}=await getToken();if(typeof token!=='string'||!token)fail();
  const get=async(id,query)=>{if(!idOk(id))fail();const r=await fetcher(API+'/'+encodeURIComponent(id)+'?'+query,{headers:{Authorization:'Bearer '+token},cache:'no-store',redirect:'error'});if(!r.ok)fail();return r.json()};
  const readMeta=(id,kind,parent)=>get(id,'fields='+encodeURIComponent(FIELDS)).then(f=>meta(f,id,subject,kind,parent));
  const readJson=async(id,kind,parent)=>{const before=await readMeta(id,kind,parent),raw=await get(id,'alt=media'),after=await readMeta(id,kind,parent);if(!before.version||before.version!==after.version)fail();return raw};
  await readMeta(rootId,'root');
  const profile=await readJson(profileId,'profile',rootId);
  if(profile.schema!=='BM-PORTAL-PROFILE/1'||profile.project!==PROJECT||profile.owner!==subject||profile.catalog!=='private-only'||!idOk(profile.collections?.cards))fail();
  const payload=await readJson(profile.collections.cards,'cards',rootId);
  if(payload.schema!=='BM-PORTAL-COLLECTION/1'||payload.project!==PROJECT||payload.owner!==subject||payload.kind!=='cards')fail();
  const records=verifyRecords(payload.records),current=await resolveSession(request);
  if(!current||['subject','rootId','profileId','sessionId'].some(k=>current[k]!==session[k]))fail();
  return {schema:'BM-VS41-PRIVATE-CARDS/1',records};
 };
}

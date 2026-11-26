// Read-only. Session and folder mapping are supplied by the authenticated server.
import {createHash} from 'node:crypto';
const API='https://www.googleapis.com/drive/v3/files',PROJECT='bm-portal-multi-v1';
const FIELDS='id,mimeType,ownedByMe,shared,trashed,parents,appProperties,size,version,headRevisionId,md5Checksum,sha256Checksum';
const idOk=v=>typeof v==='string'&&/^[A-Za-z0-9_-]{1,160}$/.test(v);
const fail=code=>{const e=Error('Catálogo privado indisponível ou não autorizado');e.code=code;throw e};
function meta(f,id,subject,kind,parent){
 const bad=field=>fail(kind+'-'+field);
 if(!f||f.id!==id)bad('id');
 if(f.ownedByMe!==true)bad('ownership');
 if(f.shared!==false||f.trashed!==false)bad('visibility');
 if(f.appProperties?.bmProject!==PROJECT||f.appProperties?.bmKind!==kind)bad('tags');
 if(f.appProperties?.bmOwner!==subject)bad('owner');
 if(parent&&(!Array.isArray(f.parents)||f.parents.length!==1||f.parents[0]!==parent))bad('parent');
 // MIME parameters are not part of the media type. Accept only JSON and optional UTF-8 charset.
 if(kind==='root'?f.mimeType!=='application/vnd.google-apps.folder':!/^application\/json(?:\s*;\s*charset\s*=\s*(?:utf-8|"utf-8"))?$/i.test(f.mimeType||''))bad('mime');
 if(kind!=='root'&&(!Number.isSafeInteger(Number(f.size))||Number(f.size)<1||Number(f.size)>32*1024*1024))bad('size');
 return f;
}
// Existing public catalog ID families, not a new allocation policy.
export const legacyCardId=id=>typeof id==='string'&&/^(?:PROP-IJUI-[0-9]{3}|TRT0[12]-C[0-9]{3})$/.test(id);
export const readableCardId=id=>typeof id==='string'&&(/^CARD-[0-9]{4,12}$/.test(id)||legacyCardId(id));
export const readableExplanation=c=>typeof c.expl==='string'||(legacyCardId(c.id)&&!Object.hasOwn(c,'expl'));
export function verifyRecords(records){
 if(!Array.isArray(records)||records.length>20000)fail('records-list');const seen=new Set();
 for(const c of records){if(!c||!readableCardId(c.id)||seen.has(c.id)||typeof c.front!=='string'||!c.front.trim()||typeof c.back!=='string'||!c.back.trim()||!readableExplanation(c)||typeof c.active!=='boolean'||typeof c.discipline!=='string'||typeof c.group!=='string'||typeof c.subject!=='string')fail('records-schema');seen.add(c.id)}
 for(const c of records)if(c.related_card_ids!==undefined&&(!Array.isArray(c.related_card_ids)||c.related_card_ids.some(id=>!seen.has(id))))fail('records-links');
 return structuredClone(records);
}
export function createReader({resolveSession,getToken,fetcher=fetch,includeMedia=false,includeFormula=false,nativeSnapshotOnly=false}){
 return async request=>{
  const resolved=await resolveSession(request);if(!resolved||![resolved.subject,resolved.rootId,resolved.profileId,resolved.sessionId].every(idOk))fail('session');
  const session={subject:resolved.subject,rootId:resolved.rootId,profileId:resolved.profileId,sessionId:resolved.sessionId};
  const {subject,rootId,profileId}=session,{token}=await getToken(session);if(typeof token!=='string'||!token)fail('token');
  const get=async(id,query,step,expectedSha)=>{if(!idOk(id))fail(step+'-id');let r;try{r=await fetcher(API+'/'+encodeURIComponent(id)+'?'+query,{headers:{Authorization:'Bearer '+token},cache:'no-store',redirect:'error'})}catch{fail(step+'-network')}if(!r.ok)fail(step+'-http-'+r.status);if(expectedSha){const body=r.body?.getReader();if(!body)fail(step+'-body');const chunks=[];let size=0;try{while(true){const {done,value}=await body.read();if(done)break;size+=value.byteLength;if(size>32*1024*1024){await body.cancel();fail(step+'-size')}chunks.push(value)}}finally{body.releaseLock()}const bytes=Buffer.concat(chunks);if(createHash('sha256').update(bytes).digest('hex')!==expectedSha)fail(step+'-sha256');try{return JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(bytes))}catch{fail(step+'-json')}}try{return await r.json()}catch{fail(step+'-json')}};
  const readMeta=(id,kind,parent)=>get(id,'fields='+encodeURIComponent(FIELDS),kind+'-meta').then(f=>meta(f,id,subject,kind,parent));
  const readJson=async(id,kind,parent,expectedSha)=>{
   // Drive's version tracks all server changes, including metadata changes.
   // Prefer stable binary-content revision/checksum; do not accept changed content.
   for(let attempt=0;attempt<3;attempt++){
    const before=await readMeta(id,kind,parent),raw=await get(id,'alt=media',kind+'-media',expectedSha),after=await readMeta(id,kind,parent);
    const fields=['headRevisionId','md5Checksum','sha256Checksum'];
    const present=fields.filter(k=>before[k]||after[k]);
    const stable=present.length?present.every(k=>typeof before[k]==='string'&&before[k].length>0&&before[k]===after[k]):!!before.version&&before.version===after.version;
    if(stable&&String(before.size)===String(after.size))return raw;
    if(!present.length&&(!before.version||!after.version))fail(kind+'-revision-unavailable');
   }
   fail(kind+'-content-changed');
  };
  await readMeta(rootId,'root');
  const profile=await readJson(profileId,'profile',rootId);
  if(profile?.schema!=='BM-PORTAL-PROFILE/1'||profile.project!==PROJECT||profile.owner!==subject||profile.catalog!=='private-only'||!idOk(profile.collections?.cards))fail('profile-schema');
  // Maintenance-only: read the existing pointer and original private snapshot,
  // not a copy and not the current snapshot-plus-deltas study queue.
  if(nativeSnapshotOnly){
   if(includeMedia||includeFormula||!idOk(profile.collections.pointer))fail('native-pointer');
   const pointer=await readJson(profile.collections.pointer,'pointer',rootId),p=pointer?.private_base;
   if(pointer?.schema!=='banco-mestre-operational-pointer/1'||p?.file_id!==profile.collections.cards||typeof p.version!=='string'||!p.version||!(/^[a-f0-9]{64}$/.test(p.sha256||'')))fail('native-pointer');
   const snapshot=await readJson(p.file_id,'cards',rootId,p.sha256);
   if(snapshot?.format!=='BancoMestrePrivadoV159'||snapshot.schema_version!==1||snapshot.version!==p.version)fail('native-schema');
   for(const [field,key] of [['cards','cards'],['questions','questions'],['images','images'],['srs_records','srs']]){
    if(!Number.isSafeInteger(p[field])||p[field]<0||!Array.isArray(snapshot[key])||snapshot[key].length!==p[field]||snapshot.counts?.[field]!==p[field])fail('native-counts');
   }
   const records=verifyRecords(snapshot.cards),current=await resolveSession(request);
   if(!current||['subject','rootId','profileId','sessionId'].some(k=>current[k]!==session[k]))fail('session-revoked');
   return {schema:'BM-VS41-PRIVATE-CARDS/1',records,scope:'snapshot-only',version:snapshot.version};
  }
  const payload=await readJson(profile.collections.cards,'cards',rootId);
  if(payload?.schema!=='BM-PORTAL-COLLECTION/1'||payload.project!==PROJECT||payload.owner!==subject||payload.kind!=='cards')fail('cards-schema');
  const records=verifyRecords(payload.records);let media=[];
  if(includeMedia&&profile.collections.media){
   if(!idOk(profile.collections.media))fail('media-id');
   const m=await readJson(profile.collections.media,'media',rootId);
   if(m?.schema!=='BM-PORTAL-COLLECTION/1'||m.project!==PROJECT||m.owner!==subject||m.kind!=='media'||!Array.isArray(m.records)||m.records.length>20000)fail('media-schema');
   media=m.records;
  }
  let formula=null;
  if(includeFormula&&profile.collections.formulas){
   const fid=profile.collections.formulas;
   if(!idOk(fid))fail('formula-id');
   const readDocMeta=async()=>{
    const m=await get(fid,'fields='+encodeURIComponent('id,name,mimeType,ownedByMe,shared,trashed,parents,appProperties,version,modifiedTime'),'formula-meta');
    if(m.id!==fid||m.mimeType!=='application/vnd.google-apps.document'||m.ownedByMe!==true||m.shared!==false||m.trashed!==false||m.parents?.length!==1||m.parents[0]!==rootId||m.appProperties?.bmProject!==PROJECT||m.appProperties?.bmOwner!==subject||m.appProperties?.bmKind!=='formulas'||typeof m.version!=='string'||!m.version||typeof m.modifiedTime!=='string'||!Number.isFinite(Date.parse(m.modifiedTime)))fail('formula-owner');
    return m;
   };
   const before=await readDocMeta(),response=await fetcher(API+'/'+encodeURIComponent(fid)+'/export?mimeType=text%2Fplain',{headers:{Authorization:'Bearer '+token},cache:'no-store',redirect:'error'});
   if(!response.ok)fail('formula-export');
   const reader=response.body?.getReader();if(!reader)fail('formula-body');
   const chunks=[];let size=0;
   try{while(true){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>1600000){await reader.cancel();fail('formula-size')}chunks.push(value)}}finally{reader.releaseLock()}
   const raw=new TextDecoder('utf-8',{fatal:true}).decode(Buffer.concat(chunks));
   const after=await readDocMeta();
   if(before.version!==after.version||before.modifiedTime!==after.modifiedTime||!raw.trim()||raw.length>400000)fail('formula-revision');
   formula={text:raw,version:after.version,modifiedTime:after.modifiedTime};
  }
  const current=await resolveSession(request);
  if(!current||['subject','rootId','profileId','sessionId'].some(k=>current[k]!==session[k]))fail('session-revoked');
  return {schema:'BM-VS41-PRIVATE-CARDS/1',records,...(includeMedia?{media}:{}),...(includeFormula?{formula}:{})};
 };
}

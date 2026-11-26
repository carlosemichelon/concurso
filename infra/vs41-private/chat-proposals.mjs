// Immutable, private chat proposal batches. No promotion, allocation or SRS writes.
import {createHash} from 'node:crypto';
import {createReader,readableCardId} from './catalog.mjs';
const PROJECT='bm-portal-multi-v1',API='https://www.googleapis.com/drive/v3/files',UPLOAD='https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id';
const hash=v=>createHash('sha256').update(JSON.stringify(v)).digest('hex');
const uuid=x=>typeof x==='string'&&/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(x);
const idOk=x=>typeof x==='string'&&/^[A-Za-z0-9_-]{1,160}$/.test(x);
const fail=code=>{const e=Error('Lote privado não confirmado');e.code=code;throw e};
const exact=(o,keys)=>o&&typeof o==='object'&&!Array.isArray(o)&&Object.keys(o).length===keys.length&&keys.every(k=>Object.hasOwn(o,k));
const txt=(v,max)=>typeof v==='string'&&v.trim().length>0&&v.length<=max;
export const destinationOf=s=>hash([PROJECT,s.subject,s.rootId,s.profileId]);
export const catalogDigest=records=>hash(records);
export function validateProposal(input,records,session){
 if(!exact(input,['schema','destination','base_sha256','batch_id','proposals'])||input.schema!=='BM-CHAT-PROPOSALS/1'||!uuid(input.batch_id)||!Array.isArray(input.proposals)||input.proposals.length<1||input.proposals.length>50||Buffer.byteLength(JSON.stringify(input))>250000)fail('input');
 if(input.destination!==destinationOf(session))fail('destination');
 if(input.base_sha256!==catalogDigest(records))fail('stale');
 const active=new Set(records.filter(c=>c.active).map(c=>c.id)),keys=new Set(),targets=new Set();
 for(const p of input.proposals){
  if(!exact(p,['key','operation','target_id','front','back','source','modules','related_card_ids'])||!idOk(p.key)||keys.has(p.key)||!['new','evolve'].includes(p.operation)||!txt(p.front,12000)||!txt(p.back,20000)||!txt(p.source,4000)||!Array.isArray(p.modules)||p.modules.length!==11||p.modules.some((m,i)=>!exact(m,['ord','titulo','texto'])||m.ord!==i+1||!txt(m.titulo,300)||!txt(m.texto,20000))||!Array.isArray(p.related_card_ids)||p.related_card_ids.length>100||new Set(p.related_card_ids).size!==p.related_card_ids.length||p.related_card_ids.some(id=>!readableCardId(id)||!active.has(id)))fail('input');
  if(p.operation==='new'?p.target_id!==null:!active.has(p.target_id)||targets.has(p.target_id))fail('input');
  keys.add(p.key);if(p.target_id)targets.add(p.target_id);
 }
 return structuredClone(input);
}
export function createChatProposalStore({resolveSession,getToken,fetcher=fetch,now=Date.now}){
 const read=createReader({resolveSession,getToken,fetcher}),queues=new Map(),uncertain=new Set();
 async function save(req,input){
  const s=await resolveSession(req);if(!s||![s.subject,s.rootId,s.profileId,s.sessionId].every(idOk))fail('session');
  if(!uuid(input?.batch_id))fail('input');
  const key=s.subject+':'+input.batch_id,prior=queues.get(key)||Promise.resolve();
  const work=prior.catch(()=>{}).then(async()=>{
   const live=async()=>{const t=await resolveSession(req);if(!t||['subject','rootId','profileId','sessionId'].some(k=>s[k]!==t[k]))fail('session')};
   await live();const {records}=await read(req),{token}=await getToken(s);if(!token)fail('session');
   if(input.destination!==destinationOf(s))fail('destination');
   const request=async(url,opts={})=>{const r=await fetcher(url,{...opts,headers:{Authorization:'Bearer '+token,...opts.headers},cache:'no-store',redirect:'error'});if(!r.ok)fail('drive');return r.json()};
   const meta=async id=>{
    if(!idOk(id))fail('receipt');
    const m=await request(API+'/'+id+'?fields=id,mimeType,ownedByMe,shared,trashed,parents,appProperties,size,version,headRevisionId,md5Checksum,sha256Checksum');
    if(m.id!==id||m.mimeType!=='application/json'||m.ownedByMe!==true||m.shared!==false||m.trashed!==false||m.parents?.length!==1||m.parents[0]!==s.rootId||m.appProperties?.bmProject!==PROJECT||m.appProperties?.bmOwner!==s.subject||m.appProperties?.bmKind!=='chat-proposal'||m.appProperties?.bmEvent!==input.batch_id||!Number.isSafeInteger(Number(m.size))||Number(m.size)<1||Number(m.size)>260000)fail('receipt');
    return m;
   };
   const verify=async id=>{
    const before=await meta(id),e=await request(API+'/'+id+'?alt=media'),after=await meta(id);
    const fields=['headRevisionId','md5Checksum','sha256Checksum'].filter(k=>before[k]||after[k]);
    if(String(before.size)!==String(after.size)||!(fields.length?fields.every(k=>before[k]&&before[k]===after[k]):before.version&&before.version===after.version)||e?.schema!=='BM-PRIVATE-CHAT-PROPOSAL/1'||e.owner!==s.subject||e.status!=='proposal-only'||e.input?.batch_id!==input.batch_id||e.digest!==hash(e.input)||e.digest!==hash(input)||!Number.isFinite(Date.parse(e.at)))fail('conflict');
    await live();return {batch_id:input.batch_id,digest:e.digest,count:e.input.proposals.length,status:'proposal-only',catalogModified:false,srsModified:false};
   };
   const u=new URL(API);u.searchParams.set('q',"'"+s.rootId+"' in parents and trashed=false and appProperties has { key='bmKind' and value='chat-proposal' } and appProperties has { key='bmEvent' and value='"+input.batch_id+"' }");u.searchParams.set('fields','nextPageToken,incompleteSearch,files(id)');u.searchParams.set('pageSize','100');
   const list=await request(u.href);if(list.incompleteSearch||list.nextPageToken||!Array.isArray(list.files)||list.files.length>1)fail('conflict');
   if(list.files.length===1){const receipt=await verify(list.files[0].id);uncertain.delete(key);return receipt}
   if(uncertain.has(key))fail('conflict');
   const clean=validateProposal(input,records,s),e={schema:'BM-PRIVATE-CHAT-PROPOSAL/1',owner:s.subject,status:'proposal-only',at:new Date(now()).toISOString(),digest:hash(clean),input:clean};
   const m={name:'BM_CHAT_PROPOSAL_'+input.batch_id+'.json',mimeType:'application/json',parents:[s.rootId],appProperties:{bmProject:PROJECT,bmOwner:s.subject,bmKind:'chat-proposal',bmEvent:input.batch_id}};
   const boundary='bm_'+input.batch_id.replaceAll('-',''),body='--'+boundary+'\r\nContent-Type: application/json\r\n\r\n'+JSON.stringify(m)+'\r\n--'+boundary+'\r\nContent-Type: application/json\r\n\r\n'+JSON.stringify(e)+'\r\n--'+boundary+'--\r\n';
   await live();if(uncertain.size>=10000)fail('limit');uncertain.add(key);
   const result=await request(UPLOAD,{method:'POST',headers:{'Content-Type':'multipart/related; boundary='+boundary},body});const receipt=await verify(result.id);uncertain.delete(key);return receipt;
  });
  queues.set(key,work);try{return await work}finally{if(queues.get(key)===work)queues.delete(key)}
 }
 return {save};
}

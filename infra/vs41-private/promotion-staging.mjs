// Stage one immutable private bundle with a Drive-generated file ID.
// Never modify a live pointer, registry, review history or active card collection.
import {createHash,randomBytes} from 'node:crypto';
import {createReader} from './catalog.mjs';
import {destinationOf,catalogDigest} from './chat-proposals.mjs';
import {preparePromotion} from './promotion-plan.mjs';
const API='https://www.googleapis.com/drive/v3/files',UPLOAD='https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id',PROJECT='bm-portal-multi-v1',MAX=32*1024*1024;
const hash=x=>createHash('sha256').update(JSON.stringify(x)).digest('hex');
const idOk=x=>typeof x==='string'&&/^[A-Za-z0-9_-]{1,160}$/.test(x);
const fail=code=>{const e=Error('Pacote candidato não confirmado');e.code=code;throw e};
// Internal only. The trusted caller must obtain the registry from the actual
// authenticated private canonical source; no public HTTP route accepts it.
export function createPromotionStaging({resolveSession,getToken,fetcher=fetch}){
 const read=createReader({resolveSession,getToken,fetcher});
 async function scope(req){
  const s=await resolveSession(req);if(!s||![s.subject,s.rootId,s.profileId,s.sessionId].every(idOk))fail('session');
  const live=async()=>{const t=await resolveSession(req);if(!t||['subject','rootId','profileId','sessionId'].some(k=>s[k]!==t[k]))fail('session')};
  const {records}=await read(req),{token}=await getToken(s);if(!token)fail('session');await live();
  const request=async(url,opts={})=>fetcher(url,{...opts,headers:{...opts.headers,Authorization:'Bearer '+token},cache:'no-store',redirect:'error'});
  return {s,records,live,request};
 }
 async function generate(req){
  const ctx=await scope(req);
  const r=await ctx.request(API+'/generateIds?count=1&space=drive&type=files');if(!r.ok)fail('generate');
  const d=await r.json();if(!Array.isArray(d.ids)||d.ids.length!==1||!idOk(d.ids[0]))fail('generate');
  await ctx.live();return {fileId:d.ids[0],destination:destinationOf(ctx.s),catalog_sha256:catalogDigest(ctx.records)};
 }
 async function stage(req,{registry,input,expectedRegistrySha256,ticket,expectedCandidateSha256}){
  const ctx=await scope(req);
  if(!ticket||!idOk(ticket.fileId)||ticket.destination!==destinationOf(ctx.s)||ticket.catalog_sha256!==catalogDigest(ctx.records))fail('ticket');
  const {bundle,receipt}=preparePromotion({registry,input,records:ctx.records,session:ctx.s,expectedRegistrySha256});
  if(receipt.candidate_sha256!==expectedCandidateSha256)fail('candidate');
  const serialized=JSON.stringify(bundle);
  if(Buffer.byteLength(serialized)>MAX)fail('size');
  const id=ticket.fileId,digest=receipt.candidate_sha256;
  const meta={id,name:'BM_CANDIDATE_'+bundle.batch_id+'.json',mimeType:'application/json',parents:[ctx.s.rootId],appProperties:{bmProject:PROJECT,bmOwner:ctx.s.subject,bmKind:'promotion-candidate',bmEvent:bundle.batch_id,bmDigest:digest}};
  async function metadata(){
   const r=await ctx.request(API+'/'+id+'?fields=id,mimeType,ownedByMe,shared,trashed,parents,appProperties,size,version,headRevisionId,md5Checksum,sha256Checksum');
   if(r.status===404)return null;if(!r.ok)fail('metadata');
   const m=await r.json();
   if(m.id!==id||m.mimeType!=='application/json'||m.ownedByMe!==true||m.shared!==false||m.trashed!==false||m.parents?.length!==1||m.parents[0]!==ctx.s.rootId||Object.keys(meta.appProperties).some(k=>m.appProperties?.[k]!==meta.appProperties[k])||Number(m.size)!==Buffer.byteLength(serialized))fail('ownership');
   return m;
  }
  async function confirm(before){
   if(!before)fail('unconfirmed');
   const r=await ctx.request(API+'/'+id+'?alt=media');if(!r.ok)fail('readback');
   const reader=r.body?.getReader();if(!reader)fail('readback');
   const chunks=[];let size=0;try{while(true){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>MAX){await reader.cancel();fail('size')}chunks.push(value)}}finally{reader.releaseLock()}
   if(Buffer.concat(chunks).toString('utf8')!==serialized)fail('digest');
   const after=await metadata();if(!after)fail('unconfirmed');
   const fields=['headRevisionId','md5Checksum','sha256Checksum'].filter(k=>before[k]||after[k]);
   if(!(fields.length?fields.every(k=>before[k]&&before[k]===after[k]):before.version&&before.version===after.version))fail('revision');
   await ctx.live();return {...receipt,mode:'staged-not-active',persisted:true,readyToPromote:false,fileId:id};
  }
  // A repeated ticket is safe even after a lost upload response or restart.
  const prior=await metadata();if(prior)return confirm(prior);
  const boundary='bm_'+randomBytes(24).toString('hex'),body='--'+boundary+'\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n'+JSON.stringify(meta)+'\r\n--'+boundary+'\r\nContent-Type: application/json\r\n\r\n'+serialized+'\r\n--'+boundary+'--\r\n';
  await ctx.live();let r;
  try{r=await ctx.request(UPLOAD,{method:'POST',headers:{'Content-Type':'multipart/related; boundary='+boundary},body})}catch{fail('uncertain-retry-same-ticket')}
  if(!r.ok&&r.status!==409)fail('uncertain-retry-same-ticket');
  if(r.ok){const result=await r.json();if(result.id!==id)fail('receipt')}
  return confirm(await metadata());
 }
 return {generate,stage};
}

// Read-only experimental generation resolver. Not wired to the active portal.
import {createHash} from 'node:crypto';
import {createReader,verifyRecords} from './catalog.mjs';
import {destinationOf,catalogDigest} from './chat-proposals.mjs';
const API='https://www.googleapis.com/drive/v3/files',PROJECT='bm-portal-multi-v1',MAX=32*1024*1024;
const hash=x=>createHash('sha256').update(JSON.stringify(x)).digest('hex');
const idOk=x=>typeof x==='string'&&/^[A-Za-z0-9_-]{1,160}$/.test(x);
const sha=x=>typeof x==='string'&&/^[a-f0-9]{64}$/.test(x);
const fail=code=>{const e=Error('Geração privada não confirmada');e.code=code;throw e};
export function createGenerationReader({resolveSession,getToken,loadAnchor,verifyHistoricalApproval,fetcher=fetch,maxSteps=50}){
 if(typeof loadAnchor!=='function'||typeof verifyHistoricalApproval!=='function'||!Number.isSafeInteger(maxSteps)||maxSteps<1||maxSteps>100)fail('configuration');
 const read=createReader({resolveSession,getToken,fetcher});
 return async req=>{
  const s=await resolveSession(req);if(!s||![s.subject,s.rootId,s.profileId,s.sessionId].every(idOk))fail('session');
  const live=async()=>{const t=await resolveSession(req);if(!t||['subject','rootId','profileId','sessionId'].some(k=>s[k]!==t[k]))fail('session')};
  const initial=await read(req),{token}=await getToken(s),anchor=await loadAnchor(s),destination=destinationOf(s);
  if(!token||!anchor||anchor.destination!==destination||anchor.catalog_sha256!==catalogDigest(initial.records)||!sha(anchor.registry_sha256)||!idOk(anchor.slotId)||!Number.isSafeInteger(anchor.generation)||anchor.generation<1||!Number.isSafeInteger(anchor.minimumGeneration)||anchor.minimumGeneration<anchor.generation)fail('anchor');
  const request=(url)=>fetcher(url,{headers:{Authorization:'Bearer '+token},cache:'no-store',redirect:'error'});
  async function readFile(id,kind,limit,optional=false){
   if(!idOk(id))fail('id');
   async function meta(){
    const r=await request(API+'/'+id+'?fields=id,mimeType,ownedByMe,shared,trashed,parents,appProperties,size,version,headRevisionId,md5Checksum,sha256Checksum');
    if(optional&&r.status===404)return null;
    if(!r.ok)fail('metadata');
    const m=await r.json();
    if(m.id!==id||m.mimeType!=='application/json'||m.ownedByMe!==true||m.shared!==false||m.trashed!==false||m.parents?.length!==1||m.parents[0]!==s.rootId||m.appProperties?.bmProject!==PROJECT||m.appProperties?.bmOwner!==s.subject||m.appProperties?.bmKind!==kind||!sha(m.appProperties?.bmDigest)||!Number.isSafeInteger(Number(m.size))||Number(m.size)<1||Number(m.size)>limit)fail('ownership');
    return m;
   }
   const before=await meta();if(!before)return null;
   const r=await request(API+'/'+id+'?alt=media');if(!r.ok)fail('readback');
   const reader=r.body?.getReader();if(!reader)fail('readback');
   let size=0;const chunks=[];try{while(true){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>limit){await reader.cancel();fail('size')}chunks.push(value)}}finally{reader.releaseLock()}
   const after=await meta(),fields=['headRevisionId','md5Checksum','sha256Checksum'].filter(k=>before[k]||after?.[k]);
   if(!after||size!==Number(before.size)||String(after.size)!==String(before.size)||before.appProperties.bmDigest!==after.appProperties.bmDigest||!(fields.length?fields.every(k=>before[k]&&before[k]===after[k]):before.version&&before.version===after.version))fail('revision');
   let data;try{data=JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(Buffer.concat(chunks)))}catch{fail('json')}
   if(hash(data)!==before.appProperties.bmDigest)fail('digest');return data;
  }
  let state={destination,generation:anchor.generation,slotId:anchor.slotId,catalog_sha256:anchor.catalog_sha256,registry_sha256:anchor.registry_sha256},records=initial.records,registry=null;
  const visited=new Set(),historyFiles=[];
  for(let step=0;step<=maxSteps;step++){
   await live();if(visited.has(state.slotId))fail('cycle');
   const a=await readFile(state.slotId,'activation-record',16000,true);
   if(!a){
    // A 404 is not proof of non-deletion: trusted minimum is the rollback floor.
    if(state.generation<anchor.minimumGeneration)fail('rollback');
    await live();return {state,records,registry,historyFiles,mode:'experimental-read-only',activeReaderUpdated:false};
   }
   if(step===maxSteps)fail('chain-limit');
   visited.add(state.slotId);
   if(a.schema!=='BM-ACTIVATION/1'||a.destination!==destination||a.generation!==state.generation+1||a.slotId!==state.slotId||a.base_catalog_sha256!==state.catalog_sha256||a.base_registry_sha256!==state.registry_sha256||!idOk(a.fileId)||!idOk(a.nextSlotId)||!idOk(a.approvalId)||!sha(a.candidateSha256)||!sha(a.catalog_sha256)||!sha(a.registry_sha256)||visited.has(a.fileId)||visited.has(a.nextSlotId)||a.fileId===a.nextSlotId)fail('chain');
   const approval={destination,generation:state.generation,slotId:state.slotId,base_catalog_sha256:state.catalog_sha256,base_registry_sha256:state.registry_sha256,fileId:a.fileId,candidateSha256:a.candidateSha256,approvalId:a.approvalId};
   if(await verifyHistoricalApproval(s,approval)!==true)fail('approval');
   const b=await readFile(a.fileId,'promotion-candidate',MAX);
   if(b.schema!=='BM-PRIVATE-PROMOTION-CANDIDATE/1'||b.destination!==destination||hash(b)!==a.candidateSha256||b.base_catalog_sha256!==state.catalog_sha256||b.base_registry_sha256!==state.registry_sha256||b.catalog_sha256!==a.catalog_sha256||b.registry_sha256!==a.registry_sha256||b.catalog_sha256!==catalogDigest(verifyRecords(b.records))||b.registry_sha256!==hash(b.registry)||b.registry?.destination!==destination||b.registry?.catalog_sha256!==b.catalog_sha256)fail('candidate');
   visited.add(a.fileId);records=b.records;registry=b.registry;historyFiles.push(a.fileId);
   state={destination,generation:a.generation,slotId:a.nextSlotId,catalog_sha256:a.catalog_sha256,registry_sha256:a.registry_sha256};
  }
  fail('chain-limit');
 };
}

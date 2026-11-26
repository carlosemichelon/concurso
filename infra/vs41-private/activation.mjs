// Internal experimental single-generation activation protocol.
// The same pre-generated successor slot MUST be supplied by a trusted canonical
// generation loader to every writer. No live reader is redirected by this module.
import {createHash,randomBytes} from 'node:crypto';
import {createReader,verifyRecords} from './catalog.mjs';
import {destinationOf,catalogDigest} from './chat-proposals.mjs';
const API='https://www.googleapis.com/drive/v3/files',UPLOAD='https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id',PROJECT='bm-portal-multi-v1',MAX=32*1024*1024;
const hash=x=>createHash('sha256').update(JSON.stringify(x)).digest('hex');
const idOk=x=>typeof x==='string'&&/^[A-Za-z0-9_-]{1,160}$/.test(x);
const sha=x=>typeof x==='string'&&/^[a-f0-9]{64}$/.test(x);
const fail=code=>{const e=Error('Ativação experimental não confirmada');e.code=code;throw e};
export function createActivation({resolveSession,getToken,loadGeneration,authorize,fetcher=fetch}){
 if(typeof loadGeneration!=='function'||typeof authorize!=='function')fail('configuration');
 const read=createReader({resolveSession,getToken,fetcher});
 async function activate(req,{fileId,candidateSha256,approvalId}={}){
  if(!idOk(fileId)||!sha(candidateSha256)||!idOk(approvalId))fail('input');
  const s=await resolveSession(req);if(!s||![s.subject,s.rootId,s.profileId,s.sessionId].every(idOk))fail('session');
  const live=async()=>{const t=await resolveSession(req);if(!t||['subject','rootId','profileId','sessionId'].some(k=>s[k]!==t[k]))fail('session')};
  const {records}=await read(req),{token}=await getToken(s);if(!token)fail('session');
  const g=await loadGeneration(s),destination=destinationOf(s);
  if(!g||g.destination!==destination||!idOk(g.slotId)||g.slotId===fileId||g.catalog_sha256!==catalogDigest(records)||!sha(g.registry_sha256)||!Number.isSafeInteger(g.generation)||g.generation<1||g.generation>=Number.MAX_SAFE_INTEGER)fail('generation');
  const request=(url,opts={})=>fetcher(url,{...opts,headers:{...opts.headers,Authorization:'Bearer '+token},cache:'no-store',redirect:'error'});
  const readFile=async(id,kind,limit,allowMissing=false)=>{
   const meta=async()=>{
    const r=await request(API+'/'+id+'?fields=id,mimeType,ownedByMe,shared,trashed,parents,appProperties,size,version,headRevisionId,md5Checksum,sha256Checksum');
    if(r.status===404&&allowMissing)return null;if(!r.ok)fail('metadata');
    const m=await r.json();
    if(m.id!==id||m.mimeType!=='application/json'||m.ownedByMe!==true||m.shared!==false||m.trashed!==false||m.parents?.length!==1||m.parents[0]!==s.rootId||m.appProperties?.bmProject!==PROJECT||m.appProperties?.bmOwner!==s.subject||m.appProperties?.bmKind!==kind||!Number.isSafeInteger(Number(m.size))||Number(m.size)<1||Number(m.size)>limit)fail('ownership');
    return m;
   };
   const before=await meta();if(!before)return null;
   const r=await request(API+'/'+id+'?alt=media');if(!r.ok)fail('readback');
   const reader=r.body?.getReader();if(!reader)fail('readback');
   const chunks=[];let size=0;try{while(true){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>limit){await reader.cancel();fail('size')}chunks.push(value)}}finally{reader.releaseLock()}
   const after=await meta(),fields=['headRevisionId','md5Checksum','sha256Checksum'].filter(k=>before[k]||after?.[k]);
   if(!after||size!==Number(before.size)||String(after.size)!==String(before.size)||!(fields.length?fields.every(k=>before[k]&&before[k]===after[k]):before.version&&before.version===after.version))fail('revision');
   let data;try{data=JSON.parse(Buffer.concat(chunks).toString('utf8'))}catch{fail('json')}
   if(hash(data)!==before.appProperties.bmDigest)fail('digest');
   return data;
  };
  const bundle=await readFile(fileId,'promotion-candidate',MAX);
  if(bundle.schema!=='BM-PRIVATE-PROMOTION-CANDIDATE/1'||bundle.destination!==destination||hash(bundle)!==candidateSha256||bundle.base_catalog_sha256!==g.catalog_sha256||bundle.base_registry_sha256!==g.registry_sha256||bundle.catalog_sha256!==catalogDigest(verifyRecords(bundle.records))||bundle.registry_sha256!==hash(bundle.registry)||bundle.registry?.catalog_sha256!==bundle.catalog_sha256||bundle.registry?.destination!==destination)fail('candidate');
  const approval={destination,generation:g.generation,slotId:g.slotId,base_catalog_sha256:g.catalog_sha256,base_registry_sha256:g.registry_sha256,fileId,candidateSha256,approvalId};
  // Authenticated server-side approval must bind the exact candidate and generation.
  if(await authorize(s,approval)!==true)fail('approval');
  const confirm=async r=>{
   if(!r||r.schema!=='BM-ACTIVATION/1'||r.destination!==destination||r.generation!==g.generation+1||r.slotId!==g.slotId||r.base_catalog_sha256!==g.catalog_sha256||r.base_registry_sha256!==g.registry_sha256||r.fileId!==fileId||r.candidateSha256!==candidateSha256||r.approvalId!==approvalId||r.catalog_sha256!==bundle.catalog_sha256||r.registry_sha256!==bundle.registry_sha256||!idOk(r.nextSlotId)||[g.slotId,fileId].includes(r.nextSlotId))fail('conflict');
   await live();return {mode:'activation-record-confirmed',generation:r.generation,activationId:g.slotId,candidateSha256,activeReaderUpdated:false,srsModified:false};
  };
  const existing=await readFile(g.slotId,'activation-record',16000,true);
  if(existing)return confirm(existing);
  const generated=await request(API+'/generateIds?count=1&space=drive&type=files');
  if(!generated.ok)fail('generate');const ids=(await generated.json()).ids;
  if(!Array.isArray(ids)||ids.length!==1||!idOk(ids[0])||[g.slotId,fileId].includes(ids[0]))fail('generate');
  const record={schema:'BM-ACTIVATION/1',...approval,generation:g.generation+1,nextSlotId:ids[0],catalog_sha256:bundle.catalog_sha256,registry_sha256:bundle.registry_sha256};
  const meta={id:g.slotId,name:'BM_ACTIVATION_'+record.generation+'.json',mimeType:'application/json',parents:[s.rootId],appProperties:{bmProject:PROJECT,bmOwner:s.subject,bmKind:'activation-record',bmDigest:hash(record)}};
  const boundary='bm_'+randomBytes(24).toString('hex'),body='--'+boundary+'\r\nContent-Type: application/json\r\n\r\n'+JSON.stringify(meta)+'\r\n--'+boundary+'\r\nContent-Type: application/json\r\n\r\n'+JSON.stringify(record)+'\r\n--'+boundary+'--\r\n';
  await live();if(await authorize(s,approval)!==true)fail('approval');
  let r;try{r=await request(UPLOAD,{method:'POST',headers:{'Content-Type':'multipart/related; boundary='+boundary},body})}catch{fail('uncertain-retry-same-generation')}
  if(!r.ok&&r.status!==409)fail('uncertain-retry-same-generation');
  if(r.ok&&(await r.json()).id!==g.slotId)fail('receipt');
  return confirm(await readFile(g.slotId,'activation-record',16000,true));
 }
 return {activate};
}

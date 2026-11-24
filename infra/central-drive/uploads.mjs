import {createHash,randomUUID} from 'node:crypto';
import {profileCatalog} from '../../assets/multiaccount-srs-v001.mjs';
import {prepareImageUpload} from '../../assets/multiaccount-image-ingest-v001.mjs';
import {IMAGE_MIMES,IMAGE_LIMIT} from '../../assets/multiaccount-images-v001.mjs';
const id=x=>typeof x==='string'&&/^[A-Za-z0-9_-]{1,160}$/.test(x);
const uuid=x=>typeof x==='string'&&/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(x);
const hash=x=>typeof x==='string'&&/^[a-f0-9]{64}$/.test(x);
const fields={title:160,area:120,subject:180,subsubject:180,source:1000,page:80,edition:100,caption:1000,description:4000,note:2500};
const text=(x,n)=>typeof x==='string'&&x.length<=n;
export class UploadRejected extends Error {}
export class UploadUncertain extends Error {}
export function validUploadInput(x){
 const keys=['name','mimeType','size','sha256','origin','subtype','cardIds','questionRefs',...Object.keys(fields)];
 return !!(x&&typeof x==='object'&&!Array.isArray(x)&&Object.keys(x).length===keys.length&&keys.every(k=>Object.hasOwn(x,k))&&text(x.name,240)&&x.name.trim()&&!/[\\/\x00-\x1f\x7f]/.test(x.name)&&IMAGE_MIMES.includes(x.mimeType)&&Number.isSafeInteger(x.size)&&x.size>=1&&x.size<=IMAGE_LIMIT&&hash(x.sha256)&&['ORIGINAL_USUARIO','DERIVADA_AUTORAL','REFERENCIA_EXTERNA'].includes(x.origin)&&['','enunciado','figura','explicacao'].includes(x.subtype)&&[x.cardIds,x.questionRefs].every(a=>Array.isArray(a)&&a.length<=40&&a.every(id)&&new Set(a).size===a.length)&&Object.entries(fields).every(([k,n])=>text(x[k],n)));
}
export const validUploadIntent=uuid;
const digest=b=>createHash('sha256').update(b).digest('hex');
// Header checks catch common mislabeled files; SVG is never executed as HTML.
export function validImageBytes(bytes,mime){
 if(!Buffer.isBuffer(bytes)||!bytes.length)return false;
 if(mime==='image/png')return bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10]));
 if(mime==='image/jpeg')return bytes[0]===255&&bytes[1]===216&&bytes[2]===255;
 if(mime==='image/gif')return ['GIF87a','GIF89a'].includes(bytes.subarray(0,6).toString('ascii'));
 if(mime==='image/webp')return bytes.subarray(0,4).toString()==='RIFF'&&bytes.subarray(8,12).toString()==='WEBP';
 if(mime==='image/svg+xml'){const s=bytes.toString('utf8');return !s.includes('\u0000')&&!/<!DOCTYPE|<!ENTITY/i.test(s)&&/^\s*(?:<\?xml[\s\S]*?\?>\s*)?(?:<!--[\s\S]*?-->\s*)*<svg(?:\s|>)/i.test(s)}
 return false;
}
const projection=r=>({id:r.imageId,title:r.title,mimeType:r.mimeType,cardIds:r.cardIds,subtype:r.subtype,caption:r.caption,phase:'verso',questionRefs:r.questionRefs,technicalStatus:r.technicalStatus,linkStatus:r.linkStatus});
const fingerprint=x=>JSON.stringify(['name','mimeType','size','sha256','origin','subtype','cardIds','questionRefs',...Object.keys(fields)].map(k=>x[k]));
export function createUploadJournal({clock=()=>new Date(),newId=randomUUID}={}){
 const pending=new Map(),busy=new Set();
 return async({provider,profile,operation,guard=()=>true})=>{
  const subject=profile.subject;if(busy.has(subject))throw new UploadRejected('Outro envio em andamento');busy.add(subject);
  try{
   if(!guard())throw new UploadRejected('Sessão encerrada');
   const current=pending.get(subject);
   if(operation.kind==='pending')return current&&!current.done?{intent:current.intent,input:current.input}:null;
   if(operation.kind==='prepare'){
    const input=operation.input;if(!validUploadInput(input))throw new UploadRejected('Metadados inválidos');
    if(current&&!current.done){if(fingerprint(current.input)===fingerprint(input))return {intent:current.intent};throw new UploadRejected('Conclua o envio anterior antes de iniciar outro')}
    const cards=profileCatalog(profile).map(c=>c.id);
    let record;try{record=prepareImageUpload({owner:subject,file:{name:input.name,type:input.mimeType,size:input.size},input,cardIds:cards,uuid:newId(),now:clock()}).record}catch(e){throw new UploadRejected(e.message)}
    // Question references are editorial references only, not permissions or proof of a validated link.
    const reservedId=await provider.reserveReviewFile(subject);if(!guard())throw new UploadRejected('Sessão encerrada');
    const entry={intent:newId(),input:structuredClone(input),record,reservedId,done:false,attempted:false};
    pending.set(subject,entry);return {intent:entry.intent};
   }
   if(operation.kind!=='commit'||!uuid(operation.intent)||!current||current.intent!==operation.intent)throw new UploadRejected('Reserva não encontrada. Consulte o Atlas antes de repetir.');
   const bytes=operation.bytes;
   if(!Buffer.isBuffer(bytes)||bytes.length!==current.record.size||digest(bytes)!==current.input.sha256||!validImageBytes(bytes,current.record.mimeType))throw new UploadRejected('Arquivo diferente do original reservado ou formato inválido');
   if(current.done)return projection(current.record);
   if(!current.attempted&&current.record.cardIds.some(id=>!profileCatalog(profile).some(c=>c.id===id)))throw new UploadRejected('Cartão fora do perfil');
   if(!guard())throw new UploadRejected('Sessão encerrada');
   current.attempted=true;
   try{
    const saved=await provider.uploadImage(subject,{record:current.record,blob:new Blob([bytes],{type:current.record.mimeType})},current.reservedId);
    if(saved.file_id!==current.reservedId||!Object.keys(current.record).every(k=>JSON.stringify(saved[k])===JSON.stringify(current.record[k])))throw Error('Recibo divergente');
    current.done=true;return projection(current.record);
   }catch{throw new UploadUncertain('Envio não confirmado. Repita o mesmo arquivo e a mesma reserva.')}
  }finally{busy.delete(subject)}
 };
}

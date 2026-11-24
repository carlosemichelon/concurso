import {randomUUID} from 'node:crypto';
import {profileCatalog} from '../../assets/multiaccount-srs-v001.mjs';
import {ACCOUNT_RATINGS} from '../../assets/multiaccount-review-events-v001.mjs';
import {checkedDiscursive,newDiscursive,historicalDiscursive,mergeDiscursive} from '../../assets/multiaccount-discursive-v001.mjs';
const id=x=>typeof x==='string'&&/^[A-Za-z0-9_-]{1,160}$/.test(x);
const uuid=x=>typeof x==='string'&&/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(x);
const string=(x,n)=>typeof x==='string'&&x.length<=n;
export class DiscursiveRejected extends Error {}
export class DiscursiveUncertain extends Error {}
export const validDiscursiveInput=x=>x&&typeof x==='object'&&!Array.isArray(x)&&Object.keys(x).length===4&&id(x.cardId)&&string(x.answer,60000)&&string(x.note,12000)&&Object.hasOwn(ACCOUNT_RATINGS,x.rating)&&(x.answer.trim()||x.rating==='Difícil');
export const validDiscursiveCommit=x=>x&&typeof x==='object'&&!Array.isArray(x)&&Object.keys(x).length===1&&uuid(x.intent);
export function discursiveProjection(row){
 return {id:row.id,cardId:row.card_id,front:typeof row.front==='string'?row.front:'',answer:row.answer,note:typeof row.note==='string'?row.note:'',rating:typeof row.rating==='string'?row.rating:'',createdAt:row.created_at,auditStatus:row.audit_status||'histórico',srsStatus:row.srs_status||'histórico'};
}
// Same reserved Drive ID on retry, no formal SRS side effects. In-memory pending
// reservations are for one private homologation instance; restart reconciliation is mandatory.
export function createDiscursiveJournal({clock=()=>new Date(),newId=randomUUID}={}){
 const intents=new Map(),busy=new Set();
 return async({provider,profile,operation,guard=()=>true})=>{
  const subject=profile.subject;
  if(busy.has(subject))throw new DiscursiveRejected('Outra tentativa em andamento');
  busy.add(subject);
  try{
   if(!guard())throw new DiscursiveRejected('Sessão encerrada');
   const current=intents.get(subject),kind=operation.kind;
   if(kind==='pending')return current&&!current.done?{intent:current.intent,attempt:discursiveProjection(current.row)}:null;
   if(kind==='prepare'){
    const input=operation.input;
    if(!validDiscursiveInput(input))throw new DiscursiveRejected('Tentativa inválida');
    if(current&&!current.done){
     if(current.row.card_id===input.cardId&&current.row.answer===input.answer&&current.row.note===input.note&&current.row.rating===input.rating)return {intent:current.intent,attempt:discursiveProjection(current.row)};
     throw new DiscursiveRejected('Conclua a tentativa anterior antes de registrar outra');
    }
    const card=profileCatalog(profile).find(c=>c.active&&c.id===input.cardId);
    if(!card)throw new DiscursiveRejected('Cartão não ativo no perfil');
    mergeDiscursive(historicalDiscursive(profile.privateData.questions),await provider.readDiscursive(subject),subject);
    let row;try{row=newDiscursive({owner:subject,card,answer:input.answer,note:input.note,rating:input.rating,now:clock(),uuid:newId()})}catch(e){throw new DiscursiveRejected(e.message)}
    const reservedId=await provider.reserveReviewFile(subject);
    if(!guard())throw new DiscursiveRejected('Sessão encerrada');
    const entry={intent:newId(),row,reservedId,done:false,attempted:false};
    intents.set(subject,entry);return {intent:entry.intent,attempt:discursiveProjection(row)};
   }
   if(kind!=='commit'||!validDiscursiveCommit(operation.input)||!current||current.intent!==operation.input.intent)throw new DiscursiveRejected('Reserva não encontrada. Consulte o histórico antes de repetir.');
   if(current.done)return discursiveProjection(current.row);
   if(!current.attempted&&!profileCatalog(profile).some(c=>c.active&&c.id===current.row.card_id))throw new DiscursiveRejected('Cartão não ativo no perfil');
   if(!guard())throw new DiscursiveRejected('Sessão encerrada');
   current.attempted=true;
   try{
    const saved=await provider.appendReservedDiscursive(subject,current.row,current.reservedId);
    const checked=checkedDiscursive(saved,subject);
    if(saved.fileId!==current.reservedId||!Object.keys(current.row).every(k=>checked[k]===current.row[k]))throw Error('Recibo divergente');
    current.done=true;return discursiveProjection(current.row);
   }catch{throw new DiscursiveUncertain('Gravação não confirmada. Repita a mesma tentativa reservada.')}
  }finally{busy.delete(subject)}
 };
}

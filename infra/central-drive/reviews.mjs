import {randomUUID} from 'node:crypto';
import {profileCatalog,profileSrs} from '../../assets/multiaccount-srs-v001.mjs';
import {ACCOUNT_RATINGS,checkedReviewEvent,newReviewEvent,mergeReviewRows} from '../../assets/multiaccount-review-events-v001.mjs';
const id=x=>typeof x==='string'&&/^[A-Za-z0-9_-]{1,160}$/.test(x);
const uuid=x=>typeof x==='string'&&/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(x);
export class ReviewRejected extends Error {}
export class ReviewUncertain extends Error {}
export const validReviewInput=x=>x&&typeof x==='object'&&!Array.isArray(x)&&Object.keys(x).length===2&&id(x.cardId)&&Object.hasOwn(ACCOUNT_RATINGS,x.rating);
export const validCommitInput=x=>x&&typeof x==='object'&&!Array.isArray(x)&&Object.keys(x).length===1&&uuid(x.intent);
const active=(profile,id)=>profileCatalog(profile).some(c=>c.id===id&&c.active);
const project=e=>({id:e.id,rating:e.rating,due:e.due,lastReview:e.date_local,intervalDays:e.interval_days,eventId:e.event_id});
const same=(a,b)=>Object.keys(b).every(k=>a[k]===b[k]);
// One server instance during homologation. One unresolved intent per account;
// a retry uses the exact same event AND pre-generated Drive file ID.
export function createReviewJournal({clock=()=>new Date(),newId=randomUUID}={}){
 const intents=new Map(),busy=new Set();
 async function locked(subject,fn){if(busy.has(subject))throw new ReviewRejected('Outra revisão em andamento');busy.add(subject);try{return await fn()}finally{busy.delete(subject)}}
 return async({provider,profile,operation,guard=()=>true})=>locked(profile.subject,async()=>{
  const subject=profile.subject;
  if(!guard())throw new ReviewRejected('Sessão encerrada');
  const history=profile.privateData.srs;
  const current=intents.get(subject);
  if(operation.kind==='prepare'){
   if(!validReviewInput(operation.input))throw new ReviewRejected('Avaliação inválida');
   const {cardId,rating}=operation.input;
   if(current&&!current.done){
    if(current.event.id===cardId&&current.event.rating===rating)return {intent:current.intent,...project(current.event)};
    throw new ReviewRejected('Conclua a avaliação anterior antes de iniciar outra');
   }
   if(!active(profile,cardId))throw new ReviewRejected('Cartão não ativo no perfil');
   const events=await provider.readReviewEvents(subject);
   // Validate historical structure and existing events before creating any new event.
   mergeReviewRows(profileSrs(profile).rows,events,subject);
   let event;try{event=newReviewEvent({owner:subject,id:cardId,rating,history,events,now:clock(),uuid:newId()})}catch(e){throw new ReviewRejected(e.message)}
   const reservedId=await provider.reserveReviewFile(subject);
   if(!guard())throw new ReviewRejected('Sessão encerrada');
   const entry={intent:newId(),event,reservedId,done:false,attempted:false};
   intents.set(subject,entry);
   return {intent:entry.intent,...project(event)};
  }
  if(operation.kind!=='commit'||!validCommitInput(operation.input)||!current||current.intent!==operation.input.intent)throw new ReviewRejected('Reserva não encontrada. Consulte o histórico antes de iniciar nova revisão.');
  if(current.done)return project(current.event);
  if(!current.attempted&&!active(profile,current.event.id))throw new ReviewRejected('Cartão não ativo no perfil');
  // Once a write has been attempted, reconcile the immutable reserved ID even if
  // the active catalog changed. No different payload may replace it.
  if(!guard())throw new ReviewRejected('Sessão encerrada');
  current.attempted=true;
  try{
   const saved=await provider.appendReservedReview(subject,current.event,current.reservedId);
   if(saved.fileId!==current.reservedId||!same(checkedReviewEvent(saved,subject),current.event))throw Error('Recibo divergente');
   current.done=true;return project(current.event);
  }catch{throw new ReviewUncertain('Gravação não confirmada. Repita a mesma reserva, nunca uma avaliação nova.')}
 });
}

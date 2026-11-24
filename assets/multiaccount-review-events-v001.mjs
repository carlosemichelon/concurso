/* Eventos prospectivos SRS: Metodologia Mestre, decisão de 23/11/2026.
 * A coleção histórica permanece intocada. Não recalcular vencimentos antigos.
 */
export const ACCOUNT_RATINGS=Object.freeze({'Difícil':8,Bom:16,'Fácil':24,'Conhecimento preservado':32,'Conhecimento adquirido':64});
export const EVENT_POLICY='SRS-2026-11-23-v2';
const copy=x=>JSON.parse(JSON.stringify(x));
const validCardId=x=>typeof x==='string'&&/^[A-Za-z0-9_-]{1,160}$/.test(x);
const validEventId=x=>typeof x==='string'&&/^[a-f0-9-]{36}$/i.test(x);
export function eventLocalDate(d){const p=Object.fromEntries(new Intl.DateTimeFormat('en-US',{timeZone:'America/Sao_Paulo',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(d).filter(x=>x.type!=='literal').map(x=>[x.type,x.value]));return p.year+'-'+p.month+'-'+p.day}
const eventDue=(day,n)=>{const d=new Date(day+'T12:00:00Z');d.setUTCDate(d.getUTCDate()+n);return d.toISOString().slice(0,10)};
export function checkedReviewEvent(e,owner){
 if(!e||e.schema!=='BM-PORTAL-SRS-EVENT/1'||e.owner!==owner||e.policy!==EVENT_POLICY||!validCardId(e.id)||!validEventId(e.event_id)||!Object.hasOwn(ACCOUNT_RATINGS,e.rating)||!Number.isFinite(Date.parse(e.at_utc))||eventLocalDate(new Date(e.at_utc))!==e.date_local||e.interval_days!==ACCOUNT_RATINGS[e.rating]||e.due!==eventDue(e.date_local,e.interval_days)||e.kind!=='revisao_formal')throw Error('Evento SRS individual inválido.');
 return copy(e)
}
export function formalEasyEvidence(id,history,events,before){
 const stamps=new Set();
 const add=e=>{if(!e||e.rating!=='Fácil'||!['revisao_formal','revisão formal'].includes(e.kind||e.source)||!Number.isFinite(Date.parse(e.at_utc||e.at))||Date.parse(e.at_utc||e.at)>=Date.parse(before))return;stamps.add(new Date(e.at_utc||e.at).toISOString())};
 const row=history.find(r=>r.id===id);
 for(const e of row?.events||[])add(e);
 for(const e of events.filter(e=>e.id===id))add(e);
 return stamps.size
}
export function newReviewEvent({owner,id,rating,history,events,now=new Date(),uuid}){
 if(!validCardId(id)||!Object.hasOwn(ACCOUNT_RATINGS,rating))throw Error('Avaliação inválida');
 const at=now.toISOString();if(rating==='Conhecimento adquirido'&&formalEasyEvidence(id,history,events,at)<2)throw Error('São necessárias duas avaliações formais Fácil distintas anteriores.');
 const day=eventLocalDate(now),interval=ACCOUNT_RATINGS[rating];
 return checkedReviewEvent({schema:'BM-PORTAL-SRS-EVENT/1',owner,policy:EVENT_POLICY,id,event_id:uuid,rating,at_utc:at,date_local:day,interval_days:interval,due:eventDue(day,interval),kind:'revisao_formal'},owner)
}
export function mergeReviewRows(base,events,owner){
 const map=new Map(base.map(r=>[r.id,copy(r)])),seen=new Set();
 for(const e of events.map(e=>checkedReviewEvent(e,owner)).sort((a,b)=>a.at_utc.localeCompare(b.at_utc)||a.event_id.localeCompare(b.event_id))){
  if(seen.has(e.event_id))throw Error('Evento repetido');seen.add(e.event_id);
  const prior=map.get(e.id);
  if(prior?.lastReview&&prior.lastReview>e.date_local)continue;
  if(prior?.atUtc&&Date.parse(prior.atUtc)>Date.parse(e.at_utc))continue;
  map.set(e.id,{id:e.id,due:e.due,rating:e.rating,lastReview:e.date_local,atUtc:e.at_utc,intervalDays:e.interval_days,kind:'revisao',source:'Drive individual — revisão formal',eventId:e.event_id,attempts:(prior?.attempts??0)+1,easyFormalCount:formalEasyEvidence(e.id,[],events,new Date(Date.parse(e.at_utc)+1).toISOString()),consolidated:e.rating==='Conhecimento adquirido'})
 }return [...map.values()]
}

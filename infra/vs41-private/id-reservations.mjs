// Pure reservation planning. No public-max allocation, Drive write, or implicit approval.
import {createHash} from 'node:crypto';
import {readableCardId,verifyRecords} from './catalog.mjs';
import {destinationOf,catalogDigest,buildEditorialCandidates} from './chat-proposals.mjs';
const digest=x=>createHash('sha256').update(JSON.stringify(x)).digest('hex');
const fail=code=>{const e=Error('Reserva privada não confirmada');e.code=code;throw e};
const canonical=id=>typeof id==='string'&&/^CARD-[0-9]{4,12}$/.test(id);
const stableKey=x=>typeof x==='string'&&/^[A-Za-z0-9_-]{1,160}$/.test(x);
const batchId=x=>typeof x==='string'&&/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(x);
const sha=x=>typeof x==='string'&&/^[a-f0-9]{64}$/.test(x);
const exact=(o,keys)=>o&&typeof o==='object'&&!Array.isArray(o)&&Object.keys(o).length===keys.length&&keys.every(k=>Object.hasOwn(o,k));
// Registry must originate from the student's authenticated canonical private source.
// A public occupation list can never substitute for it.
export function planReservation({registry,records,input,session,expectedRegistrySha256}){
 const base=verifyRecords(records);
 if(!exact(registry,['schema','destination','catalog_sha256','revision','occupied_ids','retired_ids','allocatable_ids','reservations'])||registry.schema!=='BM-PRIVATE-ID-REGISTRY/1'||registry.destination!==destinationOf(session)||registry.catalog_sha256!==catalogDigest(base)||!Number.isSafeInteger(registry.revision)||registry.revision<1||!sha(expectedRegistrySha256)||digest(registry)!==expectedRegistrySha256)fail('registry');
 for(const k of ['occupied_ids','retired_ids','allocatable_ids'])if(!Array.isArray(registry[k])||registry[k].length>100000||new Set(registry[k]).size!==registry[k].length||registry[k].some(id=>!(k==='allocatable_ids'?canonical(id):readableCardId(id))))fail('registry');
 const occupied=new Set(registry.occupied_ids),retired=new Set(registry.retired_ids),pool=new Set(registry.allocatable_ids),reserved=new Set(),previous=new Map();
 // Historical aliases can use other ID families; never allocate those or any active/retired IDs.
 for(const c of base){
  if(!occupied.has(c.id)||c.active&&retired.has(c.id))fail('coverage');
  for(const id of c.consolidation?.historical_ids||[])if(canonical(id)&&!occupied.has(id)&&!retired.has(id))fail('coverage');
 }
 if([...retired].some(id=>!occupied.has(id))||[...pool].some(id=>occupied.has(id)||retired.has(id)))fail('registry');
 if(!Array.isArray(registry.reservations)||registry.reservations.length>100000)fail('registry');
 for(const r of registry.reservations){
  if(!exact(r,['batch_id','key','id','batch_sha256'])||!batchId(r.batch_id)||!stableKey(r.key)||!canonical(r.id)||!sha(r.batch_sha256)||!occupied.has(r.id)||retired.has(r.id)||reserved.has(r.id)||previous.has(r.batch_id+':'+r.key))fail('registry');
  reserved.add(r.id);previous.set(r.batch_id+':'+r.key,r);
 }
 const candidates=buildEditorialCandidates(input,base,session);
 if(candidates.some(c=>!c.candidate))fail('legacy');
 const h=digest(input),existing=registry.reservations.filter(r=>r.batch_id===input.batch_id),newKeys=input.proposals.filter(p=>p.operation==='new').map(p=>p.key);
 if(existing.some(r=>r.batch_sha256!==h||!newKeys.includes(r.key))||existing.length&&existing.length!==newKeys.length)fail('conflict');
 const assigned=[],added=[];
 for(const p of input.proposals){
  if(p.operation==='evolve'){assigned.push({key:p.key,id:p.target_id,operation:'evolve'});continue}
  const prior=previous.get(input.batch_id+':'+p.key);let id=prior?.id;
  if(id){if(base.some(c=>c.id===id))fail('conflict')}
  else{ id=pool.values().next().value;if(!id)fail('exhausted');pool.delete(id);occupied.add(id);added.push({batch_id:input.batch_id,key:p.key,id,batch_sha256:h})}
  assigned.push({key:p.key,id,operation:'new'});
 }
 if(added.length&&registry.revision===Number.MAX_SAFE_INTEGER)fail('registry');
 const candidateRegistry={...structuredClone(registry),revision:registry.revision+(added.length?1:0),occupied_ids:[...occupied],allocatable_ids:[...pool],reservations:[...registry.reservations,...added]};
 return {schema:'BM-ID-RESERVATION-PLAN/1',destination:destinationOf(session),batch_id:input.batch_id,batch_sha256:h,base_registry_sha256:expectedRegistrySha256,proposed_registry_sha256:digest(candidateRegistry),assignments:assigned,registryCandidate:candidateRegistry,mode:'plan-only',persisted:false,readyToPromote:false};
}

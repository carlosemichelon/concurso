// Prepare an immutable catalog/registry/history candidate. No Drive write or approval.
import {createHash} from 'node:crypto';
import {verifyRecords} from './catalog.mjs';
import {destinationOf,catalogDigest,buildEditorialCandidates} from './chat-proposals.mjs';
import {planReservation} from './id-reservations.mjs';
const hash=x=>createHash('sha256').update(JSON.stringify(x)).digest('hex');
const fail=code=>{const e=Error('Catálogo candidato não preparado');e.code=code;throw e};
const union=(...lists)=>[...new Set(lists.flat())];
const MAX=32*1024*1024;
export function preparePromotion({registry,records,input,session,expectedRegistrySha256}){
 const base=verifyRecords(records),plan=planReservation({registry,records:base,input,session,expectedRegistrySha256});
 if(registry.revision>=Number.MAX_SAFE_INTEGER)fail('registry');
 const proposals=buildEditorialCandidates(input,base,session),before=new Map(base.map(c=>[c.id,c])),next=new Map(base.map(c=>[c.id,structuredClone(c)]));
 const assignments=new Map(plan.assignments.map(a=>[a.key,a])),changes=new Map(),edges=[];
 for(const p of input.proposals){
  const a=assignments.get(p.key),prepared=proposals.find(c=>c.key===p.key);
  if(!a||!prepared?.candidate)fail('candidate');
  const old=before.get(a.id),candidate=structuredClone(prepared.candidate),profile=candidate.consolidation.profile;
  if(p.operation==='evolve'&&(!old||!old.active||a.id!==p.target_id||prepared.prior_sha256!==hash(old)))fail('conflict');
  if(p.operation==='new'&&old)fail('conflict');
  const priorLinks=union(old?.related_card_ids||[],old?.consolidation?.profile?.related_card_ids||[]);
  if(priorLinks.includes(a.id)||p.related_card_ids.includes(a.id))fail('self-link');
  candidate.id=a.id;candidate.consolidation.primary_id=a.id;profile.id=a.id;
  if(!old){
   candidate.consolidation.historical_ids=[a.id];
   candidate.related_question_ids=[];profile.related_question_ids=[];profile.satellites=[];
  }
  candidate.related_card_ids=union(priorLinks,p.related_card_ids);
  profile.related_card_ids=[...candidate.related_card_ids];
  next.set(a.id,candidate);changes.set(a.id,p.operation);
  // Only explicit selected edges; no global or transitive link expansion.
  for(const id of p.related_card_ids)edges.push([a.id,id]);
 }
 for(const [from,to] of edges){
  const target=next.get(to);
  if(!target?.active||from===to)fail('link');
  const p=target.consolidation?.profile;
  const merged=union(target.related_card_ids||[],p?.related_card_ids||[],[from]);
  if(merged.includes(to))fail('self-link');
  if(hash(merged)!==hash(target.related_card_ids||[])||p&&hash(merged)!==hash(p.related_card_ids||[])){
   target.related_card_ids=merged;if(p)p.related_card_ids=[...merged];
   if(!changes.has(to))changes.set(to,'reciprocal-link');
  }
 }
 const candidateRecords=verifyRecords([...next.values()]);
 const ids=new Set(candidateRecords.map(c=>c.id));
 for(const [id] of changes){
  const c=next.get(id),p=c.consolidation?.profile;
  if(p?.related_card_ids?.some(k=>!ids.has(k)))fail('link');
 }
 const history=[...changes].filter(([id])=>before.has(id)).map(([id,operation])=>({id,operation,prior_sha256:hash(before.get(id)),record:structuredClone(before.get(id))}));
 const nextRegistry={...plan.registryCandidate,catalog_sha256:catalogDigest(candidateRecords),revision:registry.revision+1};
 const bundle={schema:'BM-PRIVATE-PROMOTION-CANDIDATE/1',destination:destinationOf(session),batch_id:input.batch_id,batch_sha256:hash(input),base_catalog_sha256:catalogDigest(base),base_registry_sha256:expectedRegistrySha256,catalog_sha256:catalogDigest(candidateRecords),registry_sha256:hash(nextRegistry),assignments:plan.assignments,changes:[...changes].map(([id,operation])=>({id,operation})),history,records:candidateRecords,registry:nextRegistry};
 if(Buffer.byteLength(JSON.stringify(bundle))>MAX)fail('size');
 return {bundle,receipt:{candidate_sha256:hash(bundle),active:candidateRecords.filter(c=>c.active).length,changed:changes.size,archived:history.length,newCards:plan.assignments.filter(a=>a.operation==='new').length,mode:'prepared-not-written',persisted:false,readyToPromote:false,srsModified:false}};
}

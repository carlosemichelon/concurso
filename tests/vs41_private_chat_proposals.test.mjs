import {test} from 'node:test';import assert from 'node:assert/strict';
import {createChatProposalStore,destinationOf,catalogDigest} from '../infra/vs41-private/chat-proposals.mjs';
import {reviewFixture,profiles,card} from './vs41_private_fixture.mjs';
const uid='12345678-1234-4234-8234-000000000001';
function setup(){const f=reviewFixture(),store=createChatProposalStore({...f,resolveSession:async req=>profiles[req.session]});const batch=s=>({schema:'BM-CHAT-PROPOSALS/1',destination:destinationOf(profiles[s]),base_sha256:catalogDigest(f.files.get('cards'+s).payload.records),batch_id:uid,proposals:[{key:'QUESTION-1',operation:'evolve',target_id:'CARD-9901',front:'Proposta '+s,back:'Resposta '+s,source:'Fonte '+s,modules:card(s).consolidation.profile.modules,related_card_ids:[]}]});return {...f,store,batch}}
test('lote privado por conta, reenvio idempotente, catálogo e SRS intactos',async()=>{
 const f=setup(),a=f.batch('A'),b=f.batch('B'),before=JSON.stringify(f.files.get('cardsA').payload);
 const [x,y]=await Promise.all([f.store.save({session:'A'},a),f.store.save({session:'B'},b)]);
 assert.equal(x.status,'proposal-only');assert.equal(y.status,'proposal-only');assert.notEqual(x.digest,y.digest);
 assert.deepEqual(f.writes.map(w=>w.parent).sort(),['rootA','rootB']);
 assert.deepEqual(await f.store.save({session:'A'},a),x);assert.equal(f.writes.length,2);
 assert.equal(JSON.stringify(f.files.get('cardsA').payload),before);assert.ok(f.writes.every(w=>w.payload.schema==='BM-PRIVATE-CHAT-PROPOSAL/1'));
 await assert.rejects(f.store.save({session:'B'},a),e=>e.code==='destination');
 await assert.rejects(f.store.save({session:'A'},{...a,proposals:[{...a.proposals[0],back:'alterada'}]}),e=>e.code==='conflict');
});
test('recusa lote desatualizado, ID ausente, módulos incompletos, destino adulterado e campos administrativos',async()=>{
 const f=setup(),a=f.batch('A'),r={session:'A'};
 for(const [input,code] of [[{...a,base_sha256:'0'.repeat(64)},'stale'],[{...a,rootId:'rootB'},'input'],[{...a,proposals:[{...a.proposals[0],target_id:'CARD-9999'}]},'input'],[{...a,proposals:[{...a.proposals[0],modules:[]}]},'input'],[{...a,proposals:[{...a.proposals[0],srs:'Fácil'}]},'input']])await assert.rejects(f.store.save(r,input),e=>e.code===code);
 await assert.rejects(f.store.save({session:'X'},a));assert.equal(f.writes.length,0);
});

test('prévia somente de proposta gravada, preserva vínculos, mídia e histórico e não escreve',async()=>{
 const f=setup(),r={session:'A'},records=f.files.get('cardsA').payload.records,c=records[0];
 const other=structuredClone(card('related'));other.id='CARD-9902';other.consolidation.profile.id=other.id;records.push(other);
 c.related_card_ids=[other.id];c.related_question_ids=['Q-1'];c.consolidation.profile.editorial.media=[{id:'IMG-1',private_original:true}];c.consolidation.profile.editorial.formulas=[{id:'F-1'}];
 const a=f.batch('A');await assert.rejects(f.store.preview(r,a),e=>e.code==='missing');assert.equal(f.writes.length,0);
 const before=JSON.stringify(records);await f.store.save(r,a);const p=await f.store.preview(r,a);
 assert.equal(p.mode,'preview-only');assert.equal(p.readyToPromote,false);assert.equal(p.changes[0].preserve.mediaAssociations,1);assert.equal(p.changes[0].preserve.structuredFormulas,1);assert.equal(p.changes[0].preserve.questionLinks,1);assert.deepEqual(p.changes[0].related.union,['CARD-9902']);assert.equal(f.writes.length,1);assert.equal(JSON.stringify(records),before);
 await assert.rejects(f.store.preview({session:'B'},a),e=>e.code==='destination');
 c.back='versão posterior';await assert.rejects(f.store.preview(r,a),e=>e.code==='stale');
});
test('proposta nova não recebe ID nem classificação por inferência',async()=>{
 const f=setup(),r={session:'A'},a=f.batch('A');a.proposals[0].operation='new';a.proposals[0].target_id=null;
 await f.store.save(r,a);const p=await f.store.preview(r,a);
 assert.equal(p.changes[0].target_id,null);assert.ok(p.changes[0].blockers.includes('canonical-id-reservation-required'));assert.ok(p.changes[0].blockers.includes('classification-required'));assert.equal(p.readyToPromote,false);assert.equal(f.writes.length,1);
});

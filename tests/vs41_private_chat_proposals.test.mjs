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

import {test} from 'node:test';import assert from 'node:assert/strict';
import {createChatProposalStore,destinationOf,catalogDigest,buildEditorialCandidates} from '../infra/vs41-private/chat-proposals.mjs';
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

function v2(f){const a=f.batch('A'),p=a.proposals[0],c=f.files.get('cardsA').payload.records[0];a.schema='BM-CHAT-PROPOSALS/2';p.title='Título';p.mnemonic='Macete';p.classification=Object.fromEntries(['discipline','group','subject','sub'].map(k=>[k,c[k]]));p.modules[0].texto=p.front;p.modules[1].texto=p.back;p.editorial={answer_paragraphs:[p.back],highlights:[{text:p.back,kind:'core',color:'#FDE68A',bold:false}],formulas:[],table:null};return a}
test('candidato V2 preserva conteúdo original e referências sem escrever',async()=>{
 const f=setup(),records=f.files.get('cardsA').payload.records,c=records[0];
 c.consolidation.original={back:'original'};c.related_question_ids=['Q-1'];c.consolidation.profile.editorial.media=[{id:'IMG-1',private_original:true}];
 const a=v2(f),p=a.proposals[0];p.editorial.formulas=[{title:'Força',mathml:'<math xmlns="http://www.w3.org/1998/Math/MathML"><mi>F</mi><mo>=</mo><mi>m</mi><mi>a</mi></math>',units:'N'}];p.editorial.table={headers:['A','B'],rows:[['x','y']]};
 const before=JSON.stringify(records),out=buildEditorialCandidates(a,records,profiles.A)[0];
 assert.equal(out.candidate.id,c.id);assert.deepEqual(out.candidate.consolidation.original,c.consolidation.original);assert.deepEqual(out.candidate.related_question_ids,c.related_question_ids);assert.deepEqual(out.candidate.consolidation.profile.editorial.media,c.consolidation.profile.editorial.media);assert.equal(out.candidate.consolidation.profile.editorial.formulas.length,1);assert.equal(JSON.stringify(records),before);
 await f.store.save({session:'A'},a);const view=await f.store.preview({session:'A'},a);assert.match(view.structuredCandidates[0].candidate_sha256,/^[a-f0-9]{64}$/);assert.equal(view.readyToPromote,false);assert.equal(f.writes.length,1);
});
test('V2 rejeita MathML ativo, perda de fórmula e classificação alterada',async()=>{
 const f=setup(),records=f.files.get('cardsA').payload.records,a=v2(f),p=a.proposals[0];
 p.editorial.formulas=[{title:'Insegura',units:'',mathml:'<math xmlns="http://www.w3.org/1998/Math/MathML"><mi onclick="x">x</mi></math>'}];
 assert.throws(()=>buildEditorialCandidates(a,records,profiles.A),e=>e.code==='input');
 p.editorial.formulas=[];records[0].consolidation.profile.editorial.formulas=[{title:'Original'}];a.base_sha256=catalogDigest(records);
 assert.throws(()=>buildEditorialCandidates(a,records,profiles.A),e=>e.code==='preservation');
 records[0].consolidation.profile.editorial.formulas=[];a.base_sha256=catalogDigest(records);p.classification.group='Outro';assert.throws(()=>buildEditorialCandidates(a,records,profiles.A),e=>e.code==='preservation');
});

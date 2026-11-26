import {test} from 'node:test';import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {planReservation} from '../infra/vs41-private/id-reservations.mjs';
import {destinationOf,catalogDigest} from '../infra/vs41-private/chat-proposals.mjs';
import {card,profiles} from './vs41_private_fixture.mjs';
const digest=x=>createHash('sha256').update(JSON.stringify(x)).digest('hex');
function setup(s='A'){
 const session=profiles[s],records=[card(s)],c=records[0];c.consolidation.historical_ids.push('CARD-9900');
 const registry={schema:'BM-PRIVATE-ID-REGISTRY/1',destination:destinationOf(session),catalog_sha256:catalogDigest(records),revision:1,occupied_ids:['CARD-9900','CARD-9901','CARD-9902'],retired_ids:['CARD-9902'],allocatable_ids:['CARD-9904','CARD-9903'],reservations:[]};
 const front='Novo conteúdo',back='Resposta completa',p={key:'QUESTION-1',operation:'new',target_id:null,front,back,source:'Fonte',modules:c.consolidation.profile.modules.map((m,i)=>({...m,texto:i===0?front:i===1?back:m.texto})),related_card_ids:[],title:'Título',mnemonic:'Macete',classification:{discipline:c.discipline,group:c.group,subject:c.subject,sub:c.sub},editorial:{answer_paragraphs:[back],highlights:[],formulas:[],table:null}};
 const input={schema:'BM-CHAT-PROPOSALS/2',destination:destinationOf(session),base_sha256:catalogDigest(records),batch_id:'12345678-1234-4234-8234-000000000001',proposals:[p]};
 return {session,records,registry,input,expectedRegistrySha256:digest(registry)};
}
test('planeja pelo conjunto privado explícito, preserva IDs e repete mapa sem gravar',()=>{
 const f=setup(),before=JSON.stringify(f),r=planReservation(f);
 assert.equal(r.assignments[0].id,'CARD-9904');assert.equal(r.persisted,false);assert.equal(r.readyToPromote,false);assert.equal(r.registryCandidate.revision,2);assert.equal(JSON.stringify(f),before);
 const again=planReservation({...f,registry:r.registryCandidate,expectedRegistrySha256:r.proposed_registry_sha256});
 assert.deepEqual(again.assignments,r.assignments);assert.equal(again.registryCandidate.revision,2);
 const altered=structuredClone(f.input);altered.proposals[0].title='Outro';assert.throws(()=>planReservation({...f,input:altered,registry:r.registryCandidate,expectedRegistrySha256:r.proposed_registry_sha256}),e=>e.code==='conflict');
});
test('bloqueia registro público, histórico omitido, colisões, versão divergente e outro estudante',()=>{
 const f=setup();const mutate=(fn,code)=>{const r=structuredClone(f.registry);fn(r);assert.throws(()=>planReservation({...f,registry:r,expectedRegistrySha256:digest(r)}),e=>e.code===code)};
 mutate(r=>r.schema='PUBLIC_ONLY_NOT_PRIVATE_RESERVATION_REGISTRY','registry');
 mutate(r=>r.occupied_ids=r.occupied_ids.filter(x=>x!=='CARD-9900'),'coverage');
 mutate(r=>r.allocatable_ids.push('CARD-9902'),'registry');
 mutate(r=>r.allocatable_ids=[],'exhausted');
 assert.throws(()=>planReservation({...f,expectedRegistrySha256:'0'.repeat(64)}),e=>e.code==='registry');
 assert.throws(()=>planReservation({...f,session:profiles.B}),e=>e.code==='registry');
});
test('evolução mantém ID e não consome reserva',()=>{
 const f=setup(),p=f.input.proposals[0];p.operation='evolve';p.target_id='CARD-9901';
 const r=planReservation(f);assert.equal(r.assignments[0].id,p.target_id);assert.equal(r.registryCandidate.revision,1);assert.equal(r.registryCandidate.reservations.length,0);
});

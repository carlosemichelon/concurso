import {test} from 'node:test';import assert from 'node:assert/strict';
import {validateProposal,destinationOf,catalogDigest,buildEditorialCandidates} from '../infra/vs41-private/chat-proposals.mjs';
import {reviewFixture,profiles,card} from './vs41_private_fixture.mjs';
const uid='12345678-1234-4234-8234-000000000001';
function setup(){const f=reviewFixture();const batch=s=>({schema:'BM-CHAT-PROPOSALS/1',destination:destinationOf(profiles[s]),base_sha256:catalogDigest(f.files.get('cards'+s).payload.records),batch_id:uid,proposals:[{key:'QUESTION-1',operation:'evolve',target_id:'CARD-9901',front:'Proposta '+s,back:'Resposta '+s,source:'Fonte '+s,modules:card(s).consolidation.profile.modules,related_card_ids:[]}]});return {...f,batch}}
test('validação única recusa destino incorreto, versão desatualizada e estrutura incompleta',()=>{
 const f=setup(),a=f.batch('A'),records=f.files.get('cardsA').payload.records;
 assert.deepEqual(validateProposal(a,records,profiles.A),a);
 assert.throws(()=>validateProposal(a,records,profiles.B),e=>e.code==='destination');
 for(const [input,code] of [[{...a,base_sha256:'0'.repeat(64)},'stale'],[{...a,rootId:'rootB'},'input'],[{...a,proposals:[{...a.proposals[0],target_id:'CARD-9999'}]},'input'],[{...a,proposals:[{...a.proposals[0],modules:[]}]},'input'],[{...a,proposals:[{...a.proposals[0],srs:'Fácil'}]},'input']])assert.throws(()=>validateProposal(input,records,profiles.A),e=>e.code===code);
 assert.equal(f.writes.length,0);
});
function v2(f){const a=f.batch('A'),p=a.proposals[0],c=f.files.get('cardsA').payload.records[0];a.schema='BM-CHAT-PROPOSALS/2';p.title='Título';p.mnemonic='Macete';p.classification=Object.fromEntries(['discipline','group','subject','sub'].map(k=>[k,c[k]]));p.modules[0].texto=p.front;p.modules[1].texto=p.back;p.editorial={answer_paragraphs:[p.back],highlights:[{text:p.back,kind:'core',color:'#FDE68A',bold:false}],formulas:[],table:null};return a}
test('candidato V2 preserva conteúdo original e referências sem escrever',async()=>{
 const f=setup(),records=f.files.get('cardsA').payload.records,c=records[0];
 c.consolidation.original={back:'original'};c.related_question_ids=['Q-1'];c.consolidation.profile.editorial.media=[{id:'IMG-1',private_original:true}];
 const a=v2(f),p=a.proposals[0];p.editorial.formulas=[{title:'Força',mathml:'<math xmlns="http://www.w3.org/1998/Math/MathML"><mi>F</mi><mo>=</mo><mi>m</mi><mi>a</mi></math>',units:'N'}];p.editorial.table={headers:['A','B'],rows:[['x','y']]};
 const before=JSON.stringify(records),out=buildEditorialCandidates(a,records,profiles.A)[0];
 assert.equal(out.candidate.id,c.id);assert.deepEqual(out.candidate.consolidation.original,c.consolidation.original);assert.deepEqual(out.candidate.related_question_ids,c.related_question_ids);assert.deepEqual(out.candidate.consolidation.profile.editorial.media,c.consolidation.profile.editorial.media);assert.equal(out.candidate.consolidation.profile.editorial.formulas.length,1);assert.equal(JSON.stringify(records),before);
 assert.equal(f.writes.length,0);
});
test('V2 rejeita MathML ativo, perda de fórmula e classificação alterada',async()=>{
 const f=setup(),records=f.files.get('cardsA').payload.records,a=v2(f),p=a.proposals[0];
 p.editorial.formulas=[{title:'Insegura',units:'',mathml:'<math xmlns="http://www.w3.org/1998/Math/MathML"><mi onclick="x">x</mi></math>'}];
 assert.throws(()=>buildEditorialCandidates(a,records,profiles.A),e=>e.code==='input');
 p.editorial.formulas=[];records[0].consolidation.profile.editorial.formulas=[{title:'Original'}];a.base_sha256=catalogDigest(records);
 assert.throws(()=>buildEditorialCandidates(a,records,profiles.A),e=>e.code==='preservation');
 records[0].consolidation.profile.editorial.formulas=[];a.base_sha256=catalogDigest(records);p.classification.group='Outro';assert.throws(()=>buildEditorialCandidates(a,records,profiles.A),e=>e.code==='preservation');
});

'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),J=require('../tools/study_batch.cjs');
const draft=()=>({batch_id:'FIXTURE-01',source_version:'TEST',targets:['drive','github','pages'],id_map:{'fixture-a':'CARD-9999'},operations:[{key:'fixture-op-1',kind:'card',payload:{front:'fixture'}}]});
const receipt=(j,ref)=>({digest:j.digest,ref,at:'2026-01-01T00:00:00Z'});
test('checkpoint idempotente e preservação de IDs',()=>{const d=draft(),j=J.checkpoint(null,d);assert.equal(J.checkpoint(j,d),j);const n=structuredClone(d);n.operations.push({key:'fixture-op-2',kind:'srs',event_id:'fixture-event-1',payload:{}});const j2=J.checkpoint(j,n);assert.equal(J.status(j2).operations,2);n.id_map['fixture-a']='CARD-9998';assert.throws(()=>J.checkpoint(j2,n));});
test('retomada sem repetir destinos e sem nova identidade',()=>{let j=J.seal(J.checkpoint(null,draft()));const g=receipt(j,'fixture-commit');assert.throws(()=>J.acknowledge(j,'pages',g));j=J.acknowledge(j,'github',g);assert.equal(J.acknowledge(j,'github',g),j);assert.deepEqual(J.status(j).pending,['drive','pages']);assert.throws(()=>J.acknowledge(j,'github',receipt(j,'outro-commit')));j=J.acknowledge(j,'pages',receipt(j,'fixture-url'));j=J.acknowledge(j,'drive',receipt(j,'fixture-file'));assert.deepEqual(J.status(j).pending,[]);const d=draft();d.operations.push({key:'extra',kind:'card',payload:{}});assert.throws(()=>J.checkpoint(j,d));});
test('evento repetido e recibo de outro conteúdo são rejeitados',()=>{const d=draft();d.operations.push({key:'s1',kind:'srs',event_id:'evt',payload:{}},{key:'s2',kind:'srs',event_id:'evt',payload:{}});assert.throws(()=>J.checkpoint(null,d));const j=J.seal(J.checkpoint(null,draft()));assert.throws(()=>J.acknowledge(j,'drive',{digest:'outro',ref:'fixture',at:'fixture'}));});

test('lote privado não exige GitHub, Pages ou navegador',()=>{
 const d=draft();d.targets=['drive'];d.operations=[{key:'private-event',kind:'srs',event_id:'fixture-private-1',payload:{}}];d.id_map={};
 let j=J.checkpoint(null,d);assert.deepEqual(J.status(j).ready,[]);
 j=J.seal(j);assert.deepEqual(J.status(j).ready,['drive']);
 j=J.acknowledge(j,'drive',receipt(j,'fixture-private-file'));
 assert.deepEqual(J.status(j).pending,[]);assert.deepEqual(J.status(j).ready,[]);
 assert.throws(()=>J.acknowledge(j,'github',receipt(j,'fixture-invalid')));
});
test('retomada oferece apenas etapas elegíveis e não confirmadas',()=>{
 const d=draft();d.targets=['drive','github','pages','browser'];
 let j=J.seal(J.checkpoint(null,d));assert.deepEqual(J.status(j).ready,['drive','github']);
 j=J.acknowledge(j,'github',receipt(j,'fixture-commit'));assert.deepEqual(J.status(j).ready,['drive','pages']);
 j=J.acknowledge(j,'pages',receipt(j,'fixture-public-url'));assert.deepEqual(J.status(j).ready,['drive','browser']);
 j=J.acknowledge(j,'drive',receipt(j,'fixture-private-file'));assert.deepEqual(J.status(j).ready,['browser']);
 j=J.acknowledge(j,'browser',receipt(j,'fixture-browser-proof'));assert.deepEqual(J.status(j).ready,[]);
});

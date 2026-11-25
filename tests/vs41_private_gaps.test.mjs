import {test} from 'node:test';import assert from 'node:assert/strict';import {createGapStore} from '../infra/vs41-private/gaps.mjs';import {reviewFixture,profiles} from './vs41_private_fixture.mjs';
const uid=n=>'12345678-1234-4234-8234-'+String(n).padStart(12,'0'),at='2026-11-25T22:00:00.000Z';
const record=label=>({id:'LAC-TEST',createdAt:at,updatedAt:at,origem:'Questão',questaoId:'Q1',cardIds:['CARD-9901'],disciplina:'Teste',assuntoGeral:'Teste',assuntoEspecifico:'Teste',subassunto:'',tipo:'Conceitual',cobertura:'Não auditada',prioridade:'Normal',etapa:'Identificada',enunciado:'Questão',respostaEstudante:'',gabarito:'',relatoEstudante:'Relato literal '+label,diagnosticoAssistente:'',diagnosticoConfianca:'',diagnosticoEvidencias:'',descricao:'Lacuna privada '+label,fonte:'',pesquisa:'',auditoriaStatus:'Cobertura declarada manualmente; não auditada pelo portal',resolucaoEvidencia:'',historico:[]});
const setup=()=>{const f=reviewFixture();return {...f,store:createGapStore({...f,resolveSession:async req=>profiles[req.session]})}};
test('mesmo ID de lacuna em dois perfis, histórico e autoria preservados, sem escrever SRS',async()=>{
 const f=setup(),a={session:'A'},b={session:'B'},input={event_id:uid(1),previous:null,event:'lacuna_criada',record:record('A')};
 await Promise.all([f.store.save(a,input),f.store.save(b,{...input,record:record('B')})]);
 assert.equal((await f.store.get(a)).data.records[0].relatoEstudante,'Relato literal A');assert.equal((await f.store.get(b)).data.records[0].relatoEstudante,'Relato literal B');
 await f.store.save(a,input);assert.equal(f.writes.length,2);
 const next={...record('A'),etapa:'Explicada',historico:[{at,from:'Identificada',to:'Explicada',evidencia:''}]};
 await f.store.save(a,{event_id:uid(2),previous:uid(1),event:'etapa_atualizada',record:next});
 const data=await f.store.get(a);assert.equal(data.data.records[0].etapa,'Explicada');assert.equal(data.data.log.length,2);
 assert.equal((await f.store.get(b)).data.records[0].etapa,'Identificada');assert.ok(f.writes.every(w=>w.payload.schema==='BM-GAP-EVENT/1'));
});
test('nega autoria adulterada, avanço indevido, vínculo inexistente e raiz cruzada',async()=>{
 const f=setup(),a={session:'A'},input={event_id:uid(1),previous:null,event:'lacuna_criada',record:record('A')};
 await assert.rejects(f.store.save(a,{...input,record:{...input.record,diagnosticoAssistente:'forjado'}}),e=>e.code==='input');
 await assert.rejects(f.store.save(a,{...input,record:{...input.record,cardIds:['CARD-9999']}}),e=>e.code==='input');
 await f.store.save(a,input);
 await assert.rejects(f.store.save(a,{...input,event_id:uid(2),previous:uid(1),event:'etapa_atualizada',record:{...input.record,etapa:'Dominada'}}),e=>e.code==='input');
 await assert.rejects(f.store.save(a,{...input,event_id:uid(2),previous:uid(1),event:'relato_ou_complemento_adicionado',record:{...input.record,relatoEstudante:'substituído'}}),e=>e.code==='input');
 f.files.get(f.writes[0].id).meta.appProperties.bmOwner='B';await assert.rejects(f.store.get(a),e=>e.code==='owner');
});

import {test} from 'node:test';import assert from 'node:assert/strict';
import {createStudyStore} from '../infra/vs41-private/study.mjs';import {reviewFixture,profiles} from './vs41_private_fixture.mjs';
const uid=n=>'12345678-1234-4234-8234-'+String(n).padStart(12,'0');
const setup=()=>{const f=reviewFixture();return {...f,store:createStudyStore({...f,resolveSession:async req=>profiles[req.session]})}};
test('controle independente por perfil, sem sobrescrever sessões ou SRS',async()=>{
 const f=setup(),a={session:'A'},b={session:'B'};
 const base=(await f.store.get(a)).data;
 const d=label=>({...base,subjects:[{id:'DISC-1',name:'Disciplina '+label,color:'#277f79'}],sessions:[{id:'SESSION-1',subjectId:'DISC-1',date:'2026-11-25',minutes:label==='A'?30:45,questions:10,correct:8}],audit:[{id:'AUDIT-1',kind:'sessions',event:'criacao'}]});
 const input={event_id:uid(1),previous:null,data:d('A')};
 await Promise.all([f.store.save(a,input),f.store.save(b,{...input,data:d('B')})]);
 assert.equal((await f.store.get(a)).data.sessions[0].minutes,30);assert.equal((await f.store.get(b)).data.sessions[0].minutes,45);
 assert.deepEqual(f.writes.map(w=>[w.parent,w.payload.schema]).sort(),[['rootA','BM-STUDY-CONTROL/1'],['rootB','BM-STUDY-CONTROL/1']]);
 await f.store.save(a,input);assert.equal(f.writes.length,2);
 const next={...d('A'),sessions:[{...d('A').sessions[0],minutes:60}]};
 const calls=await Promise.allSettled([f.store.save(a,{event_id:uid(2),previous:uid(1),data:next}),f.store.save(a,{event_id:uid(3),previous:uid(1),data:next})]);
 assert.equal(calls.filter(x=>x.status==='fulfilled').length,1);assert.equal(calls.filter(x=>x.status==='rejected'&&x.reason.code==='conflict').length,1);
 const row=await f.store.get(a);assert.equal(row.data.sessions[0].minutes,60);
 await assert.rejects(f.store.save(a,{event_id:uid(4),previous:row.revision,data:{...row.data,sessions:[]}}),e=>e.code==='input');
 await assert.rejects(f.store.save(a,{event_id:uid(5),previous:row.revision,data:{...row.data,audit:[]}}),e=>e.code==='input');
});
test('nega sessão ausente, vínculo inválido e arquivo de outra raiz',async()=>{
 const f=setup(),a={session:'A'},d=(await f.store.get(a)).data;
 await assert.rejects(f.store.get({session:'X'}));await assert.rejects(f.store.save(a,{event_id:uid(1),previous:null,data:{...d,sessions:[{id:'S',subjectId:'OTHER',date:'2026-11-25',minutes:10,questions:0,correct:0}]}}),e=>e.code==='input');
 await f.store.save(a,{event_id:uid(1),previous:null,data:d});
 f.files.get(f.writes[0].id).meta.appProperties.bmOwner='B';await assert.rejects(f.store.get(a),e=>e.code==='owner');
});

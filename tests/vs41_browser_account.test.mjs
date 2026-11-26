import {test} from 'node:test';
import assert from 'node:assert/strict';
import {connectAccount} from '../infra/vs41-private/browser-account.mjs';
import {fixture} from './vs41_browser_account_fixture.mjs';
test('one selected account provides its own cards and study master; two profiles remain isolated',async()=>{
 const a=await connectAccount({token:'A',fetcher:fixture('A')});
 const b=await connectAccount({token:'B',fetcher:fixture('B')});
 assert.equal(a.snapshot.version,'TESTE-A');assert.equal(b.snapshot.version,'TESTE-B');
 assert.equal((await a.study()).data.subjects[0].name,'Disciplina A');
 assert.equal((await b.study()).data.subjects[0].name,'Disciplina B');
 assert.deepEqual(await a.reviews(),[]);assert.deepEqual(await b.pdfs(),[]);
 await assert.rejects(a.readMedia('foreignB'));
 await assert.rejects(connectAccount({token:'A',fetcher:fixture('A',{foreign:true})}));
});

test('ambiguous Drive pointer never activates editorial fallback',async()=>{
 let called=0;
 await assert.rejects(connectAccount({token:'A',fetcher:fixture('A',{duplicatePointer:true}),allowEditorial:()=>{called++;return true}}),/ambígua/);
 assert.equal(called,0);
});

test('explicit writes retain the original V245 master and V001 SRS events, only in selected account',async()=>{
 const writes=[],a=await connectAccount({token:'A',fetcher:fixture('A',{writable:true,writes}),write:true,actor:'actorA'}),b=await connectAccount({token:'B',fetcher:fixture('B')});
 const old=await a.study(),data=structuredClone(old.data);
 data.sessions.push({id:'sessionA',subjectId:'discA',date:'2026-11-26',minutes:30,questions:10,correct:8});
 const first=await a.saveStudy({event_id:'12345678-1234-1234-1234-123456789001',previous:old.revision,data});
 assert.deepEqual(first.data,data);assert.deepEqual((await a.study()).data,data);assert.equal((await b.study()).data.sessions.length,0);
 await assert.rejects(a.saveStudy({event_id:'12345678-1234-1234-1234-123456789002',previous:old.revision,data}),/alterado/);
 const input={event_id:'12345678-1234-1234-1234-123456789003',id:'CARD-9901',rating:'Bom'};
 const ev=await a.recordReview(input);assert.equal(ev.interval_days,16);assert.deepEqual(await a.recordReview(input),ev);assert.equal((await a.reviews()).length,1);assert.equal((await b.reviews()).length,0);
 assert.equal(writes.filter(x=>x.method==='PATCH').length,1);
 assert.equal(writes.filter(x=>x.name?.startsWith('BM_SRS_EVENT_V001_')).length,1);
 assert.ok(writes.every(x=>x.account==='A'));
 await assert.rejects(b.saveStudy({event_id:'12345678-1234-1234-1234-123456789004',previous:'1',data}));
});

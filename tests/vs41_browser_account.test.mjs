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
 assert.deepEqual(await a.reviews(),[]);assert.equal((await b.pdfs())[0].id,'pdfB');
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

test('gaps use the existing V242 master, preserve history and never cross accounts',async()=>{
 const writes=[],a=await connectAccount({token:'A',fetcher:fixture('A',{writable:true,writes}),write:true,actor:'actorA'}),b=await connectAccount({token:'B',fetcher:fixture('B')});
 const rec={id:'LAC-TEST-A',cardIds:['CARD-9901'],relatoEstudante:'Dúvida',diagnosticoAssistente:'',cobertura:'Direta',etapa:'Identificada',historico:[]};
 const first=await a.saveGap({event_id:'12345678-1234-1234-1234-123456789011',previous:null,event:'lacuna_criada',record:rec});
 assert.equal((await a.gaps()).revisions[rec.id],first.revision);
 const second=await a.saveGap({event_id:'12345678-1234-1234-1234-123456789012',previous:first.revision,event:'etapa_atualizada',record:{...rec,etapa:'Explicada'}});
 const d=await a.gaps();assert.equal(d.revisions[rec.id],second.revision);assert.equal(d.data.records[0].etapa,'Explicada');assert.equal(d.data.log.length,2);
 assert.deepEqual((await b.gaps()).data.records,[]);
 await assert.rejects(a.saveGap({event_id:'12345678-1234-1234-1234-123456789013',previous:first.revision,event:'etapa_atualizada',record:rec}),/alterada/);
 assert.ok(writes.every(x=>x.account==='A'));
});

test('PDF annotations reuse V104 master, retain deletions and isolate original files',async()=>{
 const writes=[],a=await connectAccount({token:'A',fetcher:fixture('A',{writable:true,writes}),write:true,actor:'actorA'}),b=await connectAccount({token:'B',fetcher:fixture('B')});
 const original=await a.readAnnotations('pdfA',1);assert.deepEqual(original.marks,[]);
 const mark={id:'mark-test-A',type:'highlight',color:'#ffee00',rects:[[0,0,0.5,0.1]]};
 const first=await a.saveAnnotations('pdfA',1,{event_id:'12345678-1234-1234-1234-123456789021',previous:original.revision,hash:original.hash,marks:[mark]});
 assert.deepEqual((await a.readAnnotations('pdfA',1)).marks,[mark]);assert.deepEqual((await b.readAnnotations('pdfB',1)).marks,[]);
 const second=await a.saveAnnotations('pdfA',1,{event_id:'12345678-1234-1234-1234-123456789022',previous:first.revision,hash:original.hash,marks:[]});
 assert.deepEqual(second.marks,[]);assert.deepEqual((await a.readAnnotations('pdfA',1)).marks,[]);
 await assert.rejects(a.saveAnnotations('pdfA',1,{event_id:'12345678-1234-1234-1234-123456789023',previous:second.revision,hash:original.hash,marks:[mark]}));
 await assert.rejects(a.readAnnotations('pdfB',1));
 assert.ok(writes.every(x=>x.account==='A'&&x.id!=='pdfA'));
});

test('image marks persist only in the selected Drive; original image never changed',async()=>{
 const writes=[],a=await connectAccount({token:'A',fetcher:fixture('A',{writable:true,writes}),write:true}),b=await connectAccount({token:'B',fetcher:fixture('B')});
 const before=await a.readInk('imgA'),other=await b.readInk('imgB');
 assert.equal(before.revision,null);assert.equal(other.revision,null);
 const mark={id:'ink-a',type:'pen',color:'#ff0000',size:3,points:[[0.1,0.2,0.5],[0.3,0.4,0.5]]};
 const input={event_id:'12345678-1234-1234-1234-123456789031',previous:null,hash:before.hash,marks:[mark]};
 const saved=await a.saveInk('imgA',input);assert.deepEqual(saved.marks,[mark]);assert.deepEqual(await a.readInk('imgA'),saved);assert.deepEqual(await a.saveInk('imgA',input),saved);
 assert.deepEqual((await b.readInk('imgB')).marks,[]);assert.equal(writes.length,1);assert.ok(writes[0].account==='A'&&writes[0].id!=='imgA');
 await assert.rejects(a.readInk('imgB'));await assert.rejects(a.saveInk('imgA',{...input,event_id:'12345678-1234-1234-1234-123456789032'}),/outro dispositivo/);
});

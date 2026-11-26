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

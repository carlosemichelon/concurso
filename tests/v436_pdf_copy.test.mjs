import test from 'node:test';import assert from 'node:assert/strict';import {connectAccount} from '../infra/vs41-private/browser-account-v436.mjs';import {fixture} from './v436_pdf_copy_fixture.mjs';
test('copy uses same account, verifies bytes, reopens and updates same ID without listing as original',async()=>{
 const writes=[],a=await connectAccount({token:'A',fetcher:fixture('A',{writable:true,writes}),write:true});
 const b=await connectAccount({token:'B',fetcher:fixture('B',{writable:true}),write:true});
 const {hash}=await a.readAnnotations('pdfA',1),original=await a.readMedia('pdfA'),buf=await original.arrayBuffer();
 assert.equal(await a.getPdfCopy('pdfA',hash),null);
 const first=await a.savePdfCopy('pdfA',hash,new Blob([buf,'\n% annotated 1'],{type:'application/pdf'}));
 assert.notEqual(first.id,'pdfA');assert.equal((await a.getPdfCopy('pdfA',hash)).id,first.id);
 const second=await a.savePdfCopy('pdfA',hash,new Blob([buf,'\n% annotated 2'],{type:'application/pdf'}));
 assert.equal(second.id,first.id);assert.deepEqual(writes.map(w=>w.method),['POST','PATCH']);
 assert.deepEqual(await (await a.readMedia('pdfA')).arrayBuffer(),buf);
 assert.ok(!(await a.pdfs(true)).some(p=>p.id===first.id));
 await assert.rejects(b.getPdfCopy('pdfA',hash));await assert.rejects(a.savePdfCopy('pdfA','0'.repeat(64),original));
});

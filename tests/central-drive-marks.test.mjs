import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {createMarksService,createPdfCopyService,MarksRejected,MarksUncertain,loadMarksCores} from '../infra/central-drive/marks.mjs';
const original=Buffer.from('%PDF-1.7\n'+'x'.repeat(120)),hash=createHash('sha256').update(original).digest('hex');
const profile=subject=>({subject,privateData:{pdf:[{id:'PDF1',file_id:'source'+subject,title:'Norma',hash}],annotations:[]}});
const key='BM030_STROKES_PDF:PDF1:'+hash+':P1';
const snapshot=records=>({schema:'BancoMestreGrifosSyncV103',device:'DEVICE-00001',generated_at:new Date().toISOString(),records});
const mark={id:'mark-one',type:'text_highlight',color:'#FDE68A',rects:[[.1,.1,.2,.2]],text:'regra'};
test('mestre original: isolamento, edição, exclusões e conflito de versão',async()=>{
 const remote=new Map();let writes=0;
 const provider={readMarksMaster:async s=>remote.has(s)?structuredClone(remote.get(s)):null,saveMarksMaster:async(s,expected,payload)=>{assert.equal(payload.owner,s);assert.equal(expected?.version??null,remote.get(s)?.version??null);remote.set(s,{id:'master'+s,version:String(++writes),payload:structuredClone(payload)})}};
 const service=createMarksService(),op=(subject,operation)=>service({provider,profile:profile(subject),operation});
 const a=await op('A',{kind:'read'});assert.equal(a.version,null);
 const b=await op('B',{kind:'read'});assert.equal(b.version,null);assert.equal(writes,0);
 const foreign=snapshot({'BM030_STROKES_PDF:OTHER:'+hash+':P1':JSON.stringify([mark])});
 await assert.rejects(op('A',{kind:'sync',input:{expected:null,snapshot:foreign}}),MarksRejected);
 const snap=snapshot({[key]:JSON.stringify([mark])});const saved=await op('A',{kind:'sync',input:{expected:a.version,snapshot:snap}});
 assert.equal(JSON.parse(saved.master.records[key])[0].color,mark.color);assert.equal((await op('B',{kind:'read'})).master.records[key],undefined);
 await assert.rejects(op('A',{kind:'sync',input:{expected:null,snapshot:snap}}),MarksRejected);
 const {core}=await loadMarksCores();const deleted=snapshot({[core.DELETIONS]:JSON.stringify({[key]:{'id:mark-one':new Date().toISOString()}})});
 const next=await op('A',{kind:'sync',input:{expected:saved.version,snapshot:deleted}});assert.equal(next.master.records[key],undefined);
 const again=await op('A',{kind:'sync',input:{expected:next.version,snapshot:snap}});assert.equal(again.master.records[key],undefined);assert.ok(!JSON.stringify(again.master).includes('regra'));
});
test('cópia PDF usa ID do catálogo e hash real; jamais substitui fonte',async()=>{
 const calls=[];let mismatch=false;const provider={readPdf:async(s,id)=>{assert.equal(id,'source'+s);return new Blob([mismatch?Buffer.from('other'):original],{type:'application/pdf'})},saveAnnotatedPdf:async(s,p)=>{calls.push([s,p.doc.file_id]);return {id:'copy'+s,name:p.name,updated:false}}};
 const service=createPdfCopyService(),op=(subject,docId='PDF1')=>service({provider,profile:profile(subject),operation:{docId,pagesMarked:1,bytes:original}});
 await assert.rejects(op('A','sourceB'),MarksRejected);const [a,b]=await Promise.all([op('A'),op('B')]);assert.equal(a.docId,'PDF1');assert.ok(a.name.endsWith('_BANCO_MESTRE_ANOTADO.pdf'));assert.deepEqual(calls,[['A','sourceA'],['B','sourceB']]);mismatch=true;await assert.rejects(op('A'),MarksRejected);assert.equal(calls.length,2);
});

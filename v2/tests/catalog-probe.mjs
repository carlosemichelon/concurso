import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {validatePdfReferences,classifyPdfMetadata,probePdfReferences,
  buildPdfProbeReport,publicPdfProbeSummary} from '../assets/catalog-probe.js';
const root=resolve(fileURLToPath(new URL('../../',import.meta.url)));
const docs=JSON.parse(readFileSync(resolve(root,'assets/pdf_catalog_v149.json'),'utf8')).documents;
const entries=validatePdfReferences(docs);
assert.equal(entries.length,78);
assert.equal(new Set(entries.map(r=>r.driveId)).size,78);
assert.throws(()=>validatePdfReferences(docs.slice(0,77)),/78/);
assert.throws(()=>validatePdfReferences([...docs.slice(0,77),docs[0]]),/duplicado/);
const make=(reference,metadata)=>{
  return classifyPdfMetadata(reference,{metadata:{id:reference.driveId,name:'Arquivo protegido.pdf',mimeType:'application/pdf',
    size:'4242',parents:['folder_123'],trashed:false,...metadata}});
};
assert.equal(make(entries[0]).status,'verified');
assert.equal(make(entries[0],{mimeType:'image/jpeg'}).status,'incompatible');
assert.equal(make(entries[0],{trashed:true}).status,'incompatible');
assert.equal(make(entries[0],{id:'different_id_123'}).status,'incompatible');
assert.equal(classifyPdfMetadata(entries[0],{status:403,error:'Consulta Google Drive HTTP 403'}).status,'inaccessible');
assert.equal(classifyPdfMetadata(entries[0],{status:404,error:'Consulta Google Drive HTTP 404'}).status,'inaccessible');
assert.equal(classifyPdfMetadata(entries[0],{status:429,error:'Consulta Google Drive HTTP 429'}).status,'temporary_error');
let calls=0,progress=0;
const service={
  connected:true,sessionEpoch:1,
  async probePdfFileMetadata(id){
    calls++;
    assert.ok(entries.some(x=>x.driveId===id));
    if(id===entries[1].driveId)throw Error('Consulta Google Drive HTTP 403');
    if(id===entries[2].driveId)throw Error('Consulta Google Drive HTTP 429');
    return {id,name:'Documento Drive',mimeType:id===entries[3].driveId?'text/plain':'application/pdf',
      size:'15320',parents:['folder_123'],trashed:false};
  }
};
const result=await probePdfReferences(service,docs,{concurrency:3,onProgress:x=>{
 progress++;assert.equal(x.expected,78);
 assert.ok(x.completed>=1&&x.completed<=78);
}});
assert.equal(calls,78);
assert.equal(progress,78);
assert.equal(result.completed,78);
assert.equal(result.complete,true);
assert.deepEqual(result.counts,{
 verified:75,incompatible:1,inaccessible:1,temporary_error:1,invalid_reference:0
});
assert.ok(result.records.every(x=>x.catalogId&&x.driveId&&x.title));
const safe=publicPdfProbeSummary(result);
assert.equal(JSON.stringify(safe).includes(entries[0].driveId),false);
assert.equal(JSON.stringify(safe).includes(entries[0].title),false);
assert.equal(safe.includesPrivateIdentifiers,false);
assert.equal(buildPdfProbeReport(result.records.slice(0,4),{expected:78}).complete,false);
const abortService={
 connected:true,sessionEpoch:1,
 async probePdfFileMetadata(id){
   this.sessionEpoch++;
   this.connected=false;
   return {id,name:'Late response',mimeType:'application/pdf'};
 }
};
await assert.rejects(()=>probePdfReferences(abortService,docs,{concurrency:1}),/cancelada|encerrada/i);
console.log('V2 PDF catalog ID audit OK:',{
 audited:result.completed,verified:result.counts.verified,inaccessible:result.counts.inaccessible,
 temporary:result.counts.temporary_error,incompatible:result.counts.incompatible,
 anonymousReport:true,logoutInvalidates:true
});

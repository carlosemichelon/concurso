import assert from 'node:assert/strict';
import {webcrypto,createHash} from 'node:crypto';
import {sourceHash,pageStorageKey,parsePageKey,inspectLegacyHighlights,legacySnapshot,
  LEGACY_DELETIONS_KEY} from '../assets/pdf-compat.js';
const doc='IJUI-PDF-05';
const input='%PDF-1.4\n1 0 obj\n<< /Type /Catalog >>\nendobj\n%%EOF\n';
const buffer=new TextEncoder().encode(input).buffer;
const hash=await sourceHash(buffer,webcrypto);
assert.equal(hash,createHash('sha256').update(input).digest('hex').slice(0,24));
assert.equal(pageStorageKey(doc,hash,3),'BM030_STROKES_PDF:'+doc+':'+hash+':P3');
assert.equal(parsePageKey(pageStorageKey(doc,hash,3)).page,3);
assert.equal(parsePageKey('BM030_STROKES_PDF:invalid'),null);
assert.throws(()=>pageStorageKey(doc,'not-a-hash',2),/inválida/);
assert.rejects(()=>sourceHash(new TextEncoder().encode('not a PDF').buffer,webcrypto),/%PDF/);
class Storage {
 constructor(init={}){this.data=new Map(Object.entries(init));this.writeCalls=0}
 get length(){return this.data.size}
 key(i){return [...this.data.keys()][i]??null}
 getItem(key){return this.data.get(key)??null}
 setItem(){this.writeCalls++;throw Error('TESTE: nunca escrever em storage')}
 removeItem(){this.writeCalls++;throw Error('TESTE: nunca remover do storage')}
 clear(){this.writeCalls++;throw Error('TESTE: nunca limpar storage')}
}
const page1=pageStorageKey(doc,hash,1);
const page3=pageStorageKey(doc,hash,3);
const oldHash='aaaaaaaaaaaaaaaaaaaaaaaa';
const oldPage=pageStorageKey(doc,oldHash,1);
const foreign=pageStorageKey('IJUI-PDF-09',hash,2);
const fixture=new Storage({
 [page1]:JSON.stringify([
  {id:'valid_mark_123',type:'text_highlight',text:'Trecho privado'},
  {id:'deleted_mark_234',type:'text_highlight',text:'Removido'},
  {id:'stroke_mark_345',type:'pen',points:[[1,2],[3,4]]},
  {id:'archived_mark_456',type:'text_highlight',bm108_deleted_at:'2026-11-17T12:00:00Z'}
 ]),
 [page3]:JSON.stringify([{id:'next_mark_123',type:'text_highlight',text:'Outra página'}]),
 [oldPage]:JSON.stringify([{id:'old_mark_123',type:'text_highlight',text:'Versão antiga'}]),
 [foreign]:JSON.stringify([{id:'foreign_mark_123',type:'text_highlight',text:'Outro documento'}]),
 [LEGACY_DELETIONS_KEY]:JSON.stringify({
  [page1]:{'id:deleted_mark_234':'2026-11-17T12:01:00Z'}
 }),
 BM062_GRIFOS_META:'{"TXT:privado":"não exportar metadado global"}'
});
const result=inspectLegacyHighlights(fixture,doc,hash);
assert.equal(result.documentId,doc);
assert.equal(result.hash,hash);
assert.equal(result.counts.pages,2);
assert.equal(result.counts.marks,3);
assert.equal(result.counts.text,2);
assert.equal(result.counts.other,1);
assert.equal(result.counts.deletedFiltered,2);
assert.deepEqual(result.pages.map(x=>x.page),[1,3]);
assert.deepEqual(result.otherVersions,[{versionHash:oldHash,pageCount:1}]);
assert.equal(fixture.writeCalls,0);
const snapshot=legacySnapshot(fixture,doc,hash);
assert.equal(snapshot.schema,'BancoMestreV2LegacyGrifosBackupV1');
assert.equal(Object.keys(snapshot.records).length,2);
assert.ok(snapshot.records[page1].includes('Trecho privado'));
assert.deepEqual(Object.keys(snapshot.deletedHighlights),[page1]);
assert.equal(JSON.stringify(snapshot).includes('Versão antiga'),false);
assert.equal(JSON.stringify(snapshot).includes('Outro documento'),false);
assert.equal(JSON.stringify(snapshot).includes('não exportar metadado global'),false);
assert.equal(snapshot.includesSrs,false);
assert.equal(snapshot.restored,false);
assert.equal(fixture.writeCalls,0);
const empty=inspectLegacyHighlights(new Storage(),doc,hash);
assert.equal(empty.counts.marks,0);
assert.equal(empty.otherVersions.length,0);
const broken=new Storage({[page1]:'{"bad":"shape"}'});
assert.throws(()=>inspectLegacyHighlights(broken,doc,hash),/lista válida/);
const code=(await import('node:fs')).readFileSync(new URL('../assets/pdf-reader.js',import.meta.url),'utf8');
assert.ok(code.includes("inspectLegacyHighlights(localStorage,api.doc.id,api.identity)"));
assert.ok(!/localStorage\.(setItem|removeItem|clear)/.test(code));
assert.ok(!/indexedDB\.(open|deleteDatabase)/.test(code));
console.log('V2 PDF legacy compatibility OK:',{
 document:doc,pages:result.counts.pages,activeMarks:result.counts.marks,
 deletedFiltered:result.counts.deletedFiltered,otherVersionCount:result.otherVersions.length,
 hashCompatible:true,noStorageWrites:true
});

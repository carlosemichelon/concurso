import {test} from 'node:test';import assert from 'node:assert/strict';
import {assessCatalog,prepareCardCopy} from '../infra/vs41-private/migration.mjs';import {card} from './vs41_private_fixture.mjs';
const contract={format:'snapshot-test',source_head:'test',display_version:'VC49-test',unified:true,active_only:true,counts:{canonical:1,active:1,ijui:0}};
const source=()=>({format:contract.format,source_head:contract.source_head,base:[card('A')],ijui:[]});
test('preparação conserva integralmente IDs, onze módulos, vínculos e conteúdo',()=>{
 const s=source(),raw=JSON.stringify(s),a=assessCatalog(s,contract);
 assert.equal(a.cardCopyReady,true);assert.equal(a.fullMigrationReady,false);assert.equal(a.modulesComplete,1);
 const x=prepareCardCopy(s,contract,'A'),y=prepareCardCopy(s,contract,'B');
 assert.deepEqual(x.payload.records,s.base);assert.deepEqual(y.payload.records,s.base);assert.equal(x.receipt.recordsSha256,y.receipt.recordsSha256);
 assert.notEqual(x.receipt.payloadSha256,y.receipt.payloadSha256);assert.equal(JSON.stringify(s),raw);assert.equal(x.receipt.mode,'prepared-not-uploaded');
});
test('bloqueia perda de módulos, referências e contagem; aponta mídia para migração separada',()=>{
 const s=source(),c=s.base[0];
 c.consolidation.profile.editorial.media.push({id:'IMG',private_original:true});assert.equal(assessCatalog(s,contract).media.requiresMapping,1);
 c.related_card_ids=['CARD-9999'];assert.equal(assessCatalog(s,contract).unresolvedLinks.length,1);assert.throws(()=>prepareCardCopy(s,contract,'A'));
 c.related_card_ids=[];c.consolidation.profile.modules.pop();assert.equal(assessCatalog(s,contract).missingModules.length,1);assert.throws(()=>prepareCardCopy(s,contract,'A'));
 s.base.push(card('B'));assert.throws(()=>assessCatalog(s,contract));
});

test('distingue cartão legado legível, estrutura editorial incompleta e campo incompatível sem alterar fonte',()=>{
 const s=source(),c=s.base[0];
 delete c.consolidation;const raw=JSON.stringify(s);
 let a=assessCatalog(s,contract);
 assert.equal(a.compatibility.legacyWithoutProfile,1);assert.equal(a.compatibility.readerCompatible,1);
 assert.equal(a.compatibility.strictModules,0);assert.equal(a.cardCopyReady,false);
 assert.equal(JSON.stringify(s),raw);assert.throws(()=>prepareCardCopy(s,contract,'A'));
 const p=source();p.base[0].consolidation.profile.modules[2].texto='';
 a=assessCatalog(p,contract);assert.equal(a.compatibility.moduleTextMismatch,1);assert.equal(a.compatibility.readerCompatible,1);
 delete p.base[0].expl;
 a=assessCatalog(p,contract);assert.equal(a.compatibility.fieldFailures.expl,1);assert.equal(a.compatibility.readerIncompatible,1);
});

test('leitura dos formatos Ijuí e TRT não significa promoção ou migração editorial',()=>{
 const s=source(),c=s.base[0];c.id='PROP-IJUI-001';delete c.expl;delete c.consolidation;c.provisional=true;c.canonical=false;
 const raw=JSON.stringify(s),a=assessCatalog(s,contract);
 assert.equal(a.compatibility.legacyIds,1);assert.equal(a.compatibility.legacyWithoutExplanation,1);
 assert.equal(a.technicalReaderReady,true);assert.equal(a.cardCopyReady,false);assert.equal(a.fullMigrationReady,false);
 assert.equal(JSON.stringify(s),raw);assert.throws(()=>prepareCardCopy(s,contract,'A'));
});

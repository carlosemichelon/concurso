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

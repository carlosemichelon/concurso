import {test} from 'node:test';import assert from 'node:assert/strict';
import fs from 'node:fs';import os from 'node:os';import path from 'node:path';
import {assessCatalog,prepareCardCopy,readOfficial,inventoryMedia,createStaticMediaReader,inventoryLegacySources} from '../infra/vs41-private/migration.mjs';import {verifyRecords} from '../infra/vs41-private/catalog.mjs';import {card,fixture,profiles} from './vs41_private_fixture.mjs';
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

test('snapshot oficial passa pelo validador real sem reescrever nenhum registro',()=>{
 const {snapshot,contract}=readOfficial(),a=assessCatalog(snapshot,contract);
 assert.equal(a.technicalReaderReady,true);assert.deepEqual(verifyRecords(snapshot.base),snapshot.base);
});

test('inventário de mídias separa referências locais, externas, privadas e legadas sem buscar rede',()=>{
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'bm-media-'));
 try{
  fs.mkdirSync(path.join(root,'assets'));fs.writeFileSync(path.join(root,'assets','figure.svg'),'<svg xmlns="http://www.w3.org/2000/svg"/>');
  fs.writeFileSync(path.join(root,'outside.svg'),'<svg/>');fs.symlinkSync(path.join(root,'outside.svg'),path.join(root,'assets','escape.svg'));
  const c=card('A');c.related_image_ids=['LEGACY','LOCAL'];c.consolidation.profile.editorial.media=[
   {id:'LOCAL',src:'assets/figure.svg'},{id:'INLINE',inline_svg:'<svg/>'},{id:'PRIVATE',private_original:true,src:'assets/figure.svg'},
   {id:'REMOTE',url:'https://example.invalid/image.svg'},{id:'ESCAPE',src:'assets/escape.svg'},{id:'MISSING',src:'assets/missing.svg'},{id:'NONE'}];
  const raw=JSON.stringify(c),r=inventoryMedia([c],root);
  assert.deepEqual(r.counts,{'local-verified':1,'inline-svg':1,'private-original':1,'external-unverified':1,'local-unverified':2,unresolved:1});
  assert.equal(r.legacyNotInEditorial,1);assert.equal(r.uniqueLocalFiles,1);assert.equal(r.privateMigrationReady,false);assert.equal(JSON.stringify(c),raw);
 }finally{fs.rmSync(root,{recursive:true,force:true})}
});

test('figura local exige vínculo editorial idêntico no catálogo privado e oficial',async()=>{
 const {snapshot}=readOfficial(),original=snapshot.base.find(c=>c.consolidation?.profile?.editorial?.media?.some(m=>!m.private_original&&/^assets\/.*\.svg$/.test(m.src||'')));
 assert.ok(original);const item=original.consolidation.profile.editorial.media.find(m=>!m.private_original&&/^assets\/.*\.svg$/.test(m.src||''));
 const f=fixture();f.files.get('cardsA').payload.records=[{...structuredClone(original),related_card_ids:[]}];
 const read=createStaticMediaReader({...f,resolveSession:async req=>profiles[req.session]});
 const result=await read({session:'A'},original.id,item.id);
 assert.equal(result.mimeType,'image/svg+xml');assert.deepEqual(result.bytes,fs.readFileSync(item.src));
 await assert.rejects(read({session:'B'},original.id,item.id));
 const local=f.files.get('cardsA').payload.records[0].consolidation.profile.editorial.media.find(m=>m.id===item.id);
 local.private_original=true;await assert.rejects(read({session:'A'},original.id,item.id));
 delete local.private_original;local.src='assets/version.json';await assert.rejects(read({session:'A'},original.id,item.id));
});

test('fonte TRT vinculada confirma metadados sem revelar localizadores nem inventar camadas',()=>{
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'bm-trt-'));
 try{
  fs.mkdirSync(path.join(root,'assets'));
  const c={id:'TRT01-C001',trt_source:'assets/trt01_c001_v211.json',related_image_ids:['IMG-1','IMG-2']};
  const d={id:c.id,layers:Array.from({length:11},(_,i)=>({ord:i+1,titulo:'Camada',texto:'Texto original'})),images:[{id:'IMG-1',linked_operational_card_ids:[c.id],sha256:'a'.repeat(64),file_id:'privatefixture',requires_drive_oauth:true,published_binary:false},{id:'IMG-2',linked_operational_card_ids:['TRT01-C002'],sha256:'b'.repeat(64),file_id:'privatefixture2',requires_drive_oauth:true,published_binary:false}]};
  fs.writeFileSync(path.join(root,c.trt_source),JSON.stringify(d));
  const r=inventoryLegacySources([c],root);
  assert.equal(r.sourceVerifiedCards,1);assert.equal(r.elevenLayers,1);assert.equal(r.verifiedPrivateReferences,1);assert.equal(r.unresolvedReferences,1);assert.equal(r.driveBytesVerified,false);assert.ok(!JSON.stringify(r).includes('privatefixture'));
  d.id='TRT01-C002';fs.writeFileSync(path.join(root,c.trt_source),JSON.stringify(d));
  const bad=inventoryLegacySources([c],root);assert.equal(bad.sourceUnverifiedCards,1);assert.equal(bad.unresolvedReferences,2);
 }finally{fs.rmSync(root,{recursive:true,force:true})}
});

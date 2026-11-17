import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {buildImageAssociationAudit,filterImageAssociationAudit,exportAssociationAudit}
 from '../assets/image-associations.js';

const root=resolve(fileURLToPath(new URL('../../',import.meta.url)));
const load=path=>JSON.parse(readFileSync(resolve(root,path),'utf8'));
const e=load('assets/v198_editorial_images_catalog.json').records;
const recovered=load('assets/v180_native_image_additions.json').records;
const recoveredMap=new Map(recovered.map(x=>[x.no,x]));
const meta=load('assets/meta_public_v194.json');
const cards=meta.card_files.flatMap(file=>load('assets/'+file));
assert.equal(cards.length,1518);
assert.equal(recovered.length,93);
assert.equal(e.length,179);
const bare=buildImageAssociationAudit(e,recoveredMap,cards);
assert.equal(bare.publicCards,1518);
assert.equal(bare.records.length,179);
assert.deepEqual({
 doc:bare.stats.documental,didactic:bare.stats.didatica,
 content:bare.stats.conteudo,drive:bare.stats.drivePendente,
 validRefs:bare.stats.publicCardReferences,
 externalHistorical:bare.stats.externalHistoricalReferences,
 missing:bare.stats.missingPublicCardReferences,
 inconsistent:bare.stats.inconsistente
},{doc:9,didactic:76,content:94,drive:0,validRefs:100,
  externalHistorical:1,missing:0,inconsistent:0});
const historical=bare.records.find(x=>x.imageId==='IMG-C14-013');
assert.deepEqual(historical.externalHistoricalRefs,['PETRO14-C017'],
 'um identificador histórico não deve ser convertido em CARD-xxxx');
assert.equal(historical.association,'documental');
assert.equal(historical.publicCardIds.length,0);
const question=bare.records.find(x=>x.questionRefs.length&&!x.publicCardIds.length);
assert.ok(question,'questão original sem cartão tem de continuar como origem, não vínculo inventado');
assert.equal(question.reviewNeeded,true);
assert.equal(bare.stats.questionOriginsWithoutPublicCard>0,true);
assert.equal(filterImageAssociationAudit(bare,{status:'documental'}).length,9);
assert.equal(filterImageAssociationAudit(bare,{status:'didatica'}).length,76);
assert.equal(filterImageAssociationAudit(bare,{status:'conteudo'}).length,94);
assert.equal(filterImageAssociationAudit(bare,{status:'candidate'}).length,0);
assert.equal(filterImageAssociationAudit(bare,{query:'PETRO14-C017'}).length,1);
const known=recovered[0];
const files=[
 {id:known.driveFileId,name:known.name,path:'Atlas oficial',mimeType:'image/png'},
 {id:'new_drive_explicit_card_0001',name:'Questão CARD-1504.pdf.png',
  path:'Atlas privado',mimeType:'image/png',webUrl:'https://drive.google.com/file/d/new_drive_explicit_card_0001/view'},
 {id:'new_drive_explicit_card_0001',name:'Duplicada.png',path:'Originais'},
 {id:'new_drive_missing_card_0002',name:'Enunciado CARD-9999.png',
  path:'Originais',mimeType:'image/png'},
 {id:'new_drive_without_card_0003',name:'Ponte de concreto.png',
  path:'Originais',mimeType:'image/png'}
];
const report=buildImageAssociationAudit(e,recoveredMap,cards,files);
assert.equal(report.stats.driveNew,3,'arquivo já editorial e repetidos devem desaparecer do inventário adicional');
assert.equal(report.records.length,182);
assert.equal(report.stats.drivePendente,3);
assert.equal(report.stats.proposedForReview,1);
const candidate=report.records.find(x=>x.driveId==='new_drive_explicit_card_0001');
assert.ok(candidate);
assert.deepEqual(candidate.candidateIds,['CARD-1504']);
assert.deepEqual(candidate.cardIds,[]);
assert.deepEqual(candidate.publicCardIds,[],
 'nome com CARD válido nunca aprova vínculo');
assert.equal(candidate.association,'drive_pendente');
assert.equal(candidate.provisional,true);
assert.equal(candidate.reviewNeeded,true);
const missing=report.records.find(x=>x.driveId==='new_drive_missing_card_0002');
assert.deepEqual(missing.unmatchedMentions,['CARD-9999']);
assert.deepEqual(missing.candidateIds,[],'ID inexistente não é candidato');
assert.equal(filterImageAssociationAudit(report,{status:'candidate'}).length,1);
assert.equal(filterImageAssociationAudit(report,{status:'drive_pendente'}).length,3);
assert.equal(filterImageAssociationAudit(report,{status:'review'}).length,report.stats.totalReviewNeeded);
assert.equal(filterImageAssociationAudit(report,{query:'new_drive_explicit_card_0001'}).length,1);
const safe=exportAssociationAudit(report);
assert.equal(safe.containsPrivateIdentifiers,false);
assert.equal(JSON.stringify(safe).includes('new_drive_explicit_card_0001'),false);
assert.equal(JSON.stringify(safe).includes('Atlas privado'),false);
assert.equal('records' in safe,false);
const detailed=exportAssociationAudit(report,{includePrivate:true});
assert.equal(detailed.containsPrivateIdentifiers,true);
assert.equal(detailed.records.length,182);
assert.equal(detailed.records.find(x=>x.driveId===candidate.driveId).candidateIds[0],'CARD-1504');
const damaged=e.map(x=>x);
const target=damaged.findIndex(x=>x.type==='cartao');
damaged[target]={...damaged[target],cardIds:['CARD-9999']};
const corrupt=buildImageAssociationAudit(damaged,recoveredMap,cards);
assert.equal(corrupt.stats.missingPublicCardReferences>=1,true);
assert.equal(corrupt.records.some(x=>x.association==='inconsistente'),true);
console.log('V2 image association audit OK:',{
 editorial:bare.stats.documental+bare.stats.didatica+bare.stats.conteudo,
 documental:bare.stats.documental,didactic:bare.stats.didatica,
 content:bare.stats.conteudo,validCardReferences:bare.stats.publicCardReferences,
 externalHistorical:bare.stats.externalHistoricalReferences,
 newDriveWithoutAutoLink:3,candidatesOnlyForReview:report.stats.proposedForReview,
 safeExport:true
});

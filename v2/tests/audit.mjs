import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {resolve} from 'node:path';
import {reconcile,exportPayload,AUDIT_SCHEMA} from '../assets/audit.js';

const root=resolve(fileURLToPath(new URL('../../',import.meta.url)));
const read=name=>JSON.parse(readFileSync(resolve(root,'assets',name),'utf8'));
const recovered=read('v180_native_image_additions.json');
const editorial=read('v198_editorial_images_catalog.json');
const pdf=read('pdf_catalog_v149.json');
const snapshot={recoveredByImageId:new Map(recovered.records.map(x=>[x.no,x])),editorial,pdf};
const knownImage=recovered.records[0];
const knownPdf=pdf.documents[0];

const imageScan={
  kind:'image',checkedAt:'2026-11-17T14:00:00Z',found:2,folderCount:3,pages:3,
  files:[
    {id:knownImage.driveFileId||knownImage.id,name:knownImage.name,mimeType:'image/png',path:'Atlas / Originais'},
    {id:'test_new_image_12345678',name:'Novo arquivo.svg',mimeType:'image/svg+xml',path:'Atlas oficial'}
  ]
};
const pdfScan={
  kind:'pdf',checkedAt:'2026-11-17T14:02:00Z',found:2,folderCount:4,pages:4,
  files:[
    {id:knownPdf.file_id,name:knownPdf.filename,mimeType:'application/pdf',path:'DataBase'},
    {id:'test_new_pdf_12345678',name:'Novo relatório.pdf',mimeType:'application/pdf',path:'Normas'}
  ]
};
const report=reconcile(snapshot,{images:imageScan,pdfs:pdfScan,
  previewedIds:['test_new_image_12345678']});
assert.equal(report.schema,AUDIT_SCHEMA);
assert.equal(report.complete,true);
assert.equal(report.publicCatalog.historicalImagesWithoutMappedDriveId,86);
assert.equal(report.publicCatalog.recoveredImagesWithMappedDriveId,93);
assert.equal(report.images.referenced,93);
assert.equal(report.images.referencedAndListed,1);
assert.equal(report.images.newInDrive,1);
assert.equal(report.images.notObserved,92);
assert.equal(report.images.previewed,1);
assert.equal(report.pdfs.referenced,78);
assert.equal(report.pdfs.referencedAndListed,1);
assert.equal(report.pdfs.newInDrive,1);
assert.equal(report.pdfs.notObserved,77);
assert.equal(report.images.records.find(x=>x.driveId===knownImage.id).status,'listed_and_referenced');
assert.equal(report.images.records.find(x=>x.driveId==='test_new_image_12345678').status,'new_in_drive');
assert.equal(report.images.records.filter(x=>x.status==='not_observed_in_monitored_roots').length,92);

const safe=exportPayload(report);
assert.equal(safe.containsPrivateIdentifiers,false);
assert.equal(safe.uploadPerformed,false);
assert.equal(safe.publishedToGithub,false);
assert.equal(safe.oauthTokenIncluded,false);
assert.equal(safe.images.records,undefined);
assert.equal(JSON.stringify(safe).includes('Novo arquivo.svg'),false);
assert.equal(JSON.stringify(safe).includes('test_new_image_12345678'),false);
const detailed=exportPayload(report,{includeIdentifiers:true});
assert.equal(detailed.containsPrivateIdentifiers,true);
assert.equal(detailed.images.records.length,94);
assert.equal(detailed.pdfs.records.length,79);
assert.ok(detailed.images.records.some(x=>x.driveId==='test_new_image_12345678'));
assert.ok(detailed.images.records.some(x=>x.status==='not_observed_in_monitored_roots'));

const noDrive=reconcile(snapshot);
assert.equal(noDrive.complete,false);
assert.equal(noDrive.images.scanned,false);
assert.equal(noDrive.images.notObserved,null,'não inventar ausência antes de scan');
assert.equal(noDrive.pdfs.newInDrive,null);
assert.equal(exportPayload(noDrive).containsPrivateIdentifiers,false);

assert.throws(()=>reconcile(snapshot,{images:{kind:'image',checkedAt:'2026-11-17',files:[
  {id:'duplicate_id_123456',mimeType:'image/png'},
  {id:'duplicate_id_123456',mimeType:'image/png'}
]}}),/Duplicação/);
assert.throws(()=>reconcile(snapshot,{images:{kind:'pdf',checkedAt:'2026-11-17',files:[]}}),/inconsistente/);
console.log('V2 reconciliation tests OK:',{
  imagesKnown:report.images.referenced,imagesNew:report.images.newInDrive,
  imagesNotObserved:report.images.notObserved,pdfsKnown:report.pdfs.referenced,
  pdfsNew:report.pdfs.newInDrive,nonIdentifyingExport:true
});

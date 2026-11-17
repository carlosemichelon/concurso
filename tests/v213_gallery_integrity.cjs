/* Auditoria V213: arquivos reais, contagem única e preservação da V1. */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const cat=JSON.parse(read('assets/v211_published_images.json'));
const old=JSON.parse(read('assets/v180_native_image_additions.json'));
const ed=JSON.parse(read('assets/v198_editorial_images_catalog.json'));
const version=JSON.parse(read('assets/version.json'));
const home=read('index.html'),page=read('v213.html');
assert.equal(cat.schema,'BancoMestrePublishedDriveImagesV211');
assert.equal(cat.records.length,237);
assert.equal(cat.count,237);
assert.equal(old.records.length,93);
assert.equal(ed.records.length,179);
const existing=new Set(old.records.map(x=>x.driveFileId));
const ids=new Set(),paths=new Set();
let bytes=0,overlap=0,added=0;
for(const [i,r] of cat.records.entries()){
 assert.equal(typeof r.driveFileId,'string');
 assert.ok(!ids.has(r.driveFileId),'Drive ID repetido '+r.driveFileId);
 ids.add(r.driveFileId);
 assert.ok(!paths.has(r.path),'Caminho repetido '+r.path);
 paths.add(r.path);
 assert.match(r.path,/^assets\/drive-images\/v211\/[A-Za-z0-9_.-]+\.(png|jpg|gif|webp|svg)$/);
 const stat=fs.statSync(path.join(root,r.path));
 assert.ok(stat.isFile());
 assert.equal(stat.size,r.bytes,'Tamanho diferente: '+r.path);
 bytes+=r.bytes;
 if(existing.has(r.driveFileId)){overlap++;assert.equal(r.imageId!==null,true,'V180 sem ID de origem');}
 else{added++;assert.equal(r.imageId,null,'Nova imagem com ID V180');}
}
assert.equal(overlap,93);assert.equal(added,144);assert.equal(bytes,53408401);
assert.equal(cat.expectedUnified,323);
assert.equal(version.version,'V213');
assert.equal(version.counts.images,323);
assert.equal(version.release_v213.public_distinct,323);
assert.ok(home.includes("fallback='V213'"));
assert.ok(home.includes('v213.html?versao=V213'));
for(const name of ['v213_drive_gallery_feed.js','v213_library_counter.js',
  'v213_single_image_viewer.js','v213_public_gallery_v1.js',
  'v211_trt01_card.js','v212_trt01_c002.js']){
 assert.ok(page.includes(name),'Módulo ausente: '+name);
 assert.ok(fs.existsSync(path.join(root,'assets',name)),'Arquivo ausente: '+name);
}
for(const name of ['v210.html','v211.html','v212.html']){
 assert.ok(fs.existsSync(path.join(root,name)),'Versão anterior removida');
}
console.log('V213 PASS: 237/237 arquivos; '+overlap+' sobrepostos, '+added+
  ' novos, 323 distintos; '+bytes+' bytes, V1 e módulos TRT mantidos.');

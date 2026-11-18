'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const txt=p=>fs.readFileSync(path.join(root,p),'utf8');
const cat=JSON.parse(txt('assets/v211_published_images.json'));
const native=JSON.parse(txt('assets/v180_native_image_additions.json'));
const editorial=JSON.parse(txt('assets/v198_editorial_images_catalog.json'));
const manifest=JSON.parse(txt('assets/version.json'));
const page=txt('v214.html'),oldPage=txt('v213.html'),index=txt('index.html');
assert.equal(cat.schema,'BancoMestrePublishedDriveImagesV211');
assert.equal(cat.records.length,237);
assert.equal(native.records.length,93);
assert.equal(editorial.records.length,179);
const prior=new Set(native.records.map(x=>x.driveFileId));
const ids=new Set(),paths=new Set();
let bytes=0,overlap=0,newFiles=0;
for(const r of cat.records){
 assert.ok(r.driveFileId&&!ids.has(r.driveFileId));
 ids.add(r.driveFileId);
 assert.ok(!paths.has(r.path));paths.add(r.path);
 assert.match(r.path,/^assets\/drive-images\/v211\/[A-Za-z0-9_.-]+\.(png|jpg|gif|webp|svg)$/);
 const s=fs.statSync(path.join(root,r.path));
 assert.equal(s.size,r.bytes,'Arquivo: '+r.path);
 bytes+=s.size;
 if(prior.has(r.driveFileId)){overlap++;assert.ok(r.imageId);}
 else{newFiles++;assert.equal(r.imageId,null);}
}
assert.equal(overlap,93);assert.equal(newFiles,144);assert.equal(bytes,53408401);
assert.equal(overlap+editorial.records.length+newFiles-overlap,323);
assert.equal(cat.expectedUnified,323);
assert.match(manifest.version,/^V\d{3}$/);assert.ok(Number(manifest.version.slice(1))>=214);
assert.ok(manifest.counts.images>=323);
assert.equal(manifest.release_v214.public_distinct,323);
assert.ok(index.includes('data-bm-portal-version="'+manifest.version+'"'));
assert.ok(index.includes('data-bm-portal-version="'+manifest.version+'"'));
for(const file of ['v213_drive_gallery_feed.js?v=213','v214_library_counter.js?v=214',
 'v214_single_image_viewer.js?v=214','v214_public_gallery_fallback.js?v=214',
 'v211_trt01_card.js?v=211','v212_trt01_c002.js?v=212']){
 assert.ok(page.includes(file),'Injecao ausente: '+file);
 assert.ok(fs.existsSync(path.join(root,'assets',file.split('?')[0])));
}
for(const previous of ['v212.html','v213.html','v210.html'])assert.ok(fs.existsSync(path.join(root,previous)));
assert.ok(oldPage.includes('v213_single_image_viewer.js?v=213')); // V213 fica intacta
const bridge=txt('assets/v214_public_gallery_fallback.js');
assert.ok(bridge.includes("window.BM214PublishedGallery"));
assert.ok(bridge.includes("await ensureCatalog()"));
assert.ok(bridge.includes("origMap[item.no]"));
const viewer=txt('assets/v214_single_image_viewer.js');
assert.ok(viewer.includes("PREF_KEY='BM213_IMAGE_SOURCE_V1'")); // preferencia anterior preservada
assert.ok(viewer.includes("sourcePreference='drive'"));
assert.ok(viewer.includes("publishedMore.click()"));
console.log('PASS: V214 Drive primeiro, alternativa 323, 237 arquivos reais, 93 conhecidos e 144 novos, '+bytes+' bytes');

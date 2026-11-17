const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const read=path=>fs.readFileSync(path,'utf8');
const records211=JSON.parse(read('assets/v211_published_images.json')).records;
const records180=JSON.parse(read('assets/v180_native_image_additions.json')).records;
const page=read('v219.html'),oldPage=read('v218.html');
const helper=read('assets/v218_image_metadata.js');
const gallery=read('assets/v218_drive_gallery_feed.js');
const viewer=read('assets/v218_single_image_viewer.js');
const context={
 window:{},
 fetch:async url=>({
  ok:true,json:async()=>url.includes('v211')?{records:records211}:{records:records180}
 })
};
vm.runInNewContext(helper,context,{filename:'v218_image_metadata.js'});
const labels=context.window.BM218ImageMetadata;
assert.ok(labels);
(async()=>{
 const loaded=await labels.load();
 assert.equal(loaded.count,237,'todos os 237 IDs conhecidos, sem duplicacao dos 93 do V180');
 assert.equal(loaded.classified,93,'nao inventar assunto para os 144 pendentes');
 const saved=records211.find(x=>x.name==='IMG-P12-010_NR17_Organizacao_do_Trabalho_Seis_Fatores.png');
 assert.ok(saved,'imagem documentada de NR17 existente');
 const found=labels.resolve({id:saved.driveFileId,name:saved.name,drivePath:saved.sourceFolder});
 assert.ok(found.classified);
 assert.equal(found.subject,'NR-17 — Ergonomia');
 assert.match(found.displayTitle,/NR-17/,'hifen tecnico NR-17 preservado');
 assert.ok(found.cards.includes('CARD-1416'));
 const recovered=records180.find(x=>String(x.name).startsWith('image(20261110-003627)'));
 assert.ok(recovered,'imagem com nome de data deve existir');
 const resolved=labels.resolve({id:recovered.driveFileId,name:recovered.name,drivePath:'Atlas'});
 assert.equal(resolved.subject,'Licenciamento ambiental');
 assert.match(resolved.displayTitle,/Licenciamento ambiental/i);
 assert.equal(resolved.opaqueName,true);
 const hashed=records211.find(x=>x.name==='a5ccfb079d4a9f1b75ce.png');
 assert.ok(hashed);
 const pending=labels.resolve({id:hashed.driveFileId,name:hashed.name,drivePath:hashed.sourceFolder});
 assert.equal(pending.displayTitle,'Imagem sem título descritivo');
 assert.equal(pending.subject,'');
 assert.equal(pending.classified,false);
 assert.equal(pending.area,'');
 assert.equal(pending.id,hashed.driveFileId,'ID tecnico preservado');
 const descriptive=records211.find(x=>x.name==='PETRO15_Q004_TRELICA_RITTER_CARGA_REAL_E_VIRTUAL.png');
 assert.ok(descriptive);
 const text=labels.resolve({id:descriptive.driveFileId,name:descriptive.name,drivePath:descriptive.sourceFolder});
 assert.ok(!text.displayTitle.startsWith('PETRO15'),'prefixo de maquina nao vira titulo');
 assert.match(text.displayTitle,/Ritter/i);
 assert.equal(text.classified,false,'titulo legivel nao equivale a classificacao validada');
 assert.match(labels.friendly('NR-17 — Ergonomia'),/^NR-17/);
 assert.equal(labels.opaque('f6ee3f7e89aad149c345.png'),true);
 assert.ok(page.includes("tag('v218_image_metadata.js?v=218')+tag('v218_drive_gallery_feed.js?v=218')"),
   'metadata carregada antes da galeria');
 assert.ok(page.includes("tag('v218_single_image_viewer.js?v=218')"));
 assert.ok(!page.includes("tag('v217_drive_gallery_feed.js?v=217')"));
 assert.ok(page.includes("tag('v194_public_layers.js?v=194-direct197')"),'11 camadas preservadas');
 assert.ok(page.includes("tag('v215_trt01_c003.js?v=215')"),'card TRT operacional preservado');
 assert.ok(oldPage.includes("tag('v217_drive_gallery_feed.js?v=217')"),'V218 anterior preservada');
 assert.ok(page.includes("tag('trt01_c004_loader.js?v=c004-1')"),'cartão TRT01-C004 de V218 preservado');
 assert.ok(oldPage.includes("tag('trt01_c004_loader.js?v=c004-1')"),'C004 existente na V218 anterior');
 for(const id of ['bm218-area-filter','bm218-subject-filter','bm218-status-filter']){
  assert.ok(viewer.includes(id),'filtro visual '+id);
  assert.ok(gallery.includes(id),'filtro funcional '+id);
 }
 assert.ok(gallery.includes('Assunto pendente de classificação'));
 assert.ok(gallery.includes('Nome original e identificador'));
 assert.ok(gallery.includes('Assunto identificado no índice')===false||gallery.includes('Assunto pendente'));
 assert.ok(gallery.includes('BM218ImageMetadata'));
 assert.ok(!gallery.includes("fetch(PUBLIC_CATALOG"),'midias originais nao usam catalogo estatico');
 const manifest=JSON.parse(read('assets/version.json'));
 assert.equal(manifest.version,'V219');
 assert.equal(manifest.home,'v219.html');
 assert.equal(manifest.previous_version,'V218');
 assert.ok(read('index.html').includes("var fallback='V219'"));
 console.log('V219: 93 classificacoes conhecidas, 144 pendentes, nomes humanos e TRT01-C004 preservado.');
})().catch(e=>{console.error(e);process.exitCode=1});

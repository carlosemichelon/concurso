const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const read=path=>fs.readFileSync(path,'utf8');
const page=read('v228.html'),prior=read('v227.html');
const editor=read('assets/v228_drive_image_editor.js'),gallery=read('assets/v228_drive_gallery_feed.js');
const records=JSON.parse(read('assets/v211_published_images.json')).records;
const item=records.find(r=>r.imageId==='IMG-C13-020');
assert.ok(item?.driveFileId,'vínculo histórico ao arquivo Drive');
assert.ok(page.includes("tag('v228_drive_gallery_feed.js?v=228')"));
assert.ok(page.includes("tag('v209_image_links_single.js?v=209')+tag('v228_drive_image_editor.js?v=228')"));
assert.ok(page.includes("tag('v228_footer_version.js?v=228')"));
assert.ok(page.includes("tag('trt01_c009_loader.js?v=c009-1')"),'TRT-C009 preservado');
assert.ok(prior.includes("tag('trt01_c009_loader.js?v=c009-1')"),'retorno V227 preservado');
assert.ok(page.includes('bm226BibliotecaGrifosOff'),'Biblioteca de Grifos permanece oculta');
assert.ok(gallery.includes('BM228DriveImageEditor?.meta?.(file)'));
assert.ok(gallery.includes('BM228DriveImageEditor?.decorate'));
assert.ok(gallery.includes('m.description,m.note'),'busca abrange dados editados');
for(const expected of ['Informações','Tipo e cartões','Arquivo e backup','Descrição técnica e conceitos',
 'Observações pessoais e correções','lib?.mountEditorForm','Exportar checkpoint JSON','Importar checkpoint JSON'])
 assert.ok(editor.includes(expected),expected+' deve existir no editor');
assert.ok(editor.includes('BM055_ATLAS_CUSTOM_TITLES'),'preservar títulos anteriores');
assert.ok(editor.includes('BM060_ATLAS_CARD_FIELDS'),'preservar anotações anteriores');
assert.ok(!editor.includes('access_token'),'nunca salvar token Google');
assert.ok(!editor.includes('Authorization:'),'editor não lê nem escreve Drive diretamente');
const store=new Map([
 ['BM055_ATLAS_CUSTOM_TITLES',JSON.stringify({[item.imageId]:'Título antigo personalizado'})],
 ['BM060_ATLAS_CARD_FIELDS',JSON.stringify({[item.imageId]:{subject:'NR 17 — revisão personalizada',description:'Texto anterior preservado'}})]
]);
const localStorage={getItem:key=>store.get(key)||null,setItem:(key,value)=>store.set(key,value)};
const document={head:{append:()=>{}},createElement:tag=>({tagName:tag.toUpperCase(),className:'',append:()=>{},setAttribute:()=>{},style:{}}),getElementById:()=>null};
const context={document,window:{BM218ImageMetadata:{resolve:file=>({
 id:file.id,fileName:file.name,displayTitle:'Título de catálogo',area:'Engenharia Civil',subject:'Ergonomia',
 subsubject:'Organização do trabalho',classified:true,cards:['CARD-1416']})},addEventListener:()=>{}},
 localStorage,console,Date,JSON,Set,Map,Promise,CustomEvent:class CustomEvent{constructor(name,data){this.type=name;this.detail=data?.detail}},
 Event:class Event{constructor(name){this.type=name}},fetch:async()=>({ok:true,json:async()=>({records})})};
vm.runInNewContext(editor,context,{filename:'v228_drive_image_editor.js'});
(async()=>{
 await new Promise(resolve=>setTimeout(resolve,0));
 const api=context.window.BM228DriveImageEditor;
 assert.ok(api);
 const meta=api.meta({id:item.driveFileId,name:item.name});
 assert.equal(meta.displayTitle,'Título antigo personalizado','não perder antigo título');
 assert.equal(meta.subject,'NR 17 — revisão personalizada','não perder assunto editado');
 assert.equal(meta.description,'Texto anterior preservado','não perder descrição editada');
 assert.equal(meta.area,'Engenharia Civil');
 assert.equal(meta.fileName,item.name);
 assert.equal(api.editedCount,0,'nenhum checkpoint novo fabricado');
 const manifest=JSON.parse(read('assets/version.json'));
 assert.equal(manifest.version,'V228');
 assert.equal(manifest.home,'v228.html');
 assert.equal(manifest.previous_version,'V227');
 assert.equal(manifest.release_v228.srs_unchanged,true);
 assert.equal(manifest.release_v228.data_write,'localStorage only with checkpoint JSON export/import; no writes to Drive');
 assert.ok(read('index.html').includes("var fallback='V228'"));
 console.log('V228: editor completo, dados legados recuperados, 3 abas, TRT-C009 e Drive privado preservados.');
})().catch(error=>{console.error(error);process.exitCode=1});
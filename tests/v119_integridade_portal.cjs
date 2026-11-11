/* V119 — teste estático da integração para GitHub Pages, sem navegador.
 * Não substitui teste visual/gestos/OAuth real.
 */
'use strict';
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const read=f=>fs.readFileSync(path.join(root,f),'utf8');
const page=read('v119.html');
const prior=read('v118.html');
assert.ok(page.includes("tag('v119_relacoes_normativas.js?v=119')+grifadorTag"),
 'Novo módulo tem de ser carregado ANTES do grifador');
assert.ok(page.includes("tag('v119_calibrador_ui.js?v=119')"),
 'UI do calibrador deve descrever o alcance real');
assert.ok(page.includes("tag('v118_ui_compact.js?v=118')"),
 'Compactação V118 não pode ser removida');
assert.ok(page.includes("v118_ui_compact.css?v=118"),'CSS V118 perdido');
assert.ok(page.includes('v116_drive_cards_sync.js?v=116'),'Cache privado V116 perdido');
assert.ok(page.includes('v104_drive_master.js?v=104'),'Arquivo mestre de grifos perdido');
assert.ok(page.includes('v077_drive_pdf_sync.js?v=077'),'Catálogo de PDFs perdido');
assert.ok(page.includes('v084_drive_images_sync.js?v=084'),'Atlas perdido');
assert.ok(page.includes('pdf_v111.js?v=111'),'Núcleo PDF anterior perdido');
assert.ok(page.includes('v097_pdf_selection_core.js?v=097'),'Seletor preciso anterior perdido');
assert.ok(page.includes('v104_mobile_gestures.js?v=104'),'Zoom com pinça anterior perdido');
for(const marker of ['v118_ui_compact','v116_drive_cards_sync','pdf_v111','v097_pdf_selection_core'])
 assert.ok(prior.includes(marker)&&page.includes(marker),'Origem V118 não preservada: '+marker);
for(const f of ['assets/v119_relacoes_normativas.js','assets/v119_calibrador_ui.js']){
 const source=read(f);
 new vm.Script(source,{filename:f,timeout:4000});
}
const loader=page.match(/<script>([\s\S]*?)<\/script>/u);
assert.ok(loader,'carregador ausente');
new vm.Script(loader[1],{filename:'v119.html#loader',timeout:4000});
console.log('V119: carregador e módulos sintaticamente válidos; motor PDF, Drive e UI V118 preservados.');

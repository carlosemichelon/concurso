/* V124 — integrity regression: no overwriting the V123 card recovery and V122 PDF stack. */
'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
const root=path.resolve(__dirname,'..'),read=f=>fs.readFileSync(path.join(root,f),'utf8');
const base=read('v123.html'),current=read('v124.html'),manifest=JSON.parse(read('assets/version.json')),index=read('index.html');
assert.equal(manifest.version,'V124');assert.equal(manifest.home,'v124.html');
assert.equal(manifest.counts.cards,1499);assert.equal(manifest.counts.active,1482);
assert.equal(manifest.counts.pdfs,72);assert.equal(manifest.counts.images,270);
assert.ok(index.includes("fallback='V124'")&&index.includes('v124.html?versao=V124'));
const reconstructed=current
 .replaceAll('Banco Mestre V124','Banco Mestre V123')
 .replace('<p><a href="./v123.html">Abrir a versão anterior V123</a></p>',
          '<p><a href="./v122.html">Abrir a versão anterior V122</a></p>')
 .replace("tag('v121_relacoes_normativas.js?v=121')+tag('v124_remissoes.js?v=124')+grifadorTag",
          "tag('v121_relacoes_normativas.js?v=121')+grifadorTag")
 .replaceAll('V124 · base V024 pública','V123 · base V024 pública');
assert.equal(reconstructed,base,'Mudança não autorizada no leitor/base V123');
const required=[
 'v123_cards_recovery.js?v=123','v119_public_cards_ui.js?v=119',
 'v122_grifos_master_core.js?v=122','v122_biblioteca_grifos.js?v=122',
 'v122_grifos_drive.js?v=122','v122_flashcard_ink.js?v=122',
 'v122_visual_compact.js?v=122','assets/pdf_v122.js?v=122',
 'v097_pdf_selection_core.js?v=097','v104_mobile_gestures.js?v=104'
];
for(const p of required)assert.ok(current.includes(p),'Recurso antigo perdido: '+p);
const l=current.match(/<script>([\s\S]+?)<\/script>/u);assert.ok(l);
new vm.Script(l[1],{filename:'v124.html#loader'});
new vm.Script(read('assets/v124_remissoes.js'),{filename:'assets/v124_remissoes.js'});
console.log('Integridade V124: V123 cartões + V122 editor e Drive preservados; 1499/72/270.');

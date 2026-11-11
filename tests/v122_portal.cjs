/* V122 — integridade de carregamento do portal e isolamento da mudança.
 * A V121 é a referência. Não executar testes de OAuth em ambiente simulado.
 */
'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const current=read('v122.html'),prev=read('v121.html'),manifest=JSON.parse(read('assets/version.json'));
assert.equal(manifest.version,'V122');
assert.equal(manifest.home,'v122.html');
assert.equal(manifest.counts.cards,1499);
assert.equal(manifest.counts.pdfs,72);
assert.equal(manifest.counts.images,270);
assert.ok(read('index.html').includes("fallback='V122'"));
assert.ok(read('index.html').includes('v122.html?versao=V122'));
let reconstructed=current
 .replaceAll('Banco Mestre V122','Banco Mestre V121')
 .replace('<p><a href="./v121.html">Abrir a versão anterior V121</a></p>',
 '<p><a href="./v120.html">Abrir a versão anterior V120</a></p>')
 .replace("tag('v121_relacoes_normativas.js?v=121')+tag('v122_remissoes.js?v=122')+grifadorTag",
          "tag('v121_relacoes_normativas.js?v=121')+grifadorTag")
 .replaceAll('V122 · base V024 pública','V121 · base V024 pública');
assert.equal(reconstructed,prev,'Qualquer alteração além do módulo de referências exige revisão');
const idxOld=current.indexOf("tag('v121_relacoes_normativas.js?v=121')"),
 idxNew=current.indexOf("tag('v122_remissoes.js?v=122')"),
 idxEditor=current.indexOf("+grifadorTag");
assert.ok(idxOld>=0&&idxNew>idxOld&&idxEditor>idxNew,'Carregamento em ordem errada');
for(const name of [
 'v120_highlight_groups.js?v=120','v120_biblioteca_grifos.js?v=120',
 'v120_painel_grifos.js?v=120','v119_public_cards_ui.js?v=119',
 'meta_public_v024.json?v=119','v104_drive_master.js?v=104',
 'pdf_v111.js?v=111','v097_pdf_selection_core.js?v=097'
])assert.ok(current.includes(name),'Módulo legado desaparecido '+name);
for(const name of ['assets/v122_remissoes.js','assets/v121_relacoes_normativas.js']){
 new vm.Script(read(name),{filename:name});
}
const script=current.match(/<script>([\s\S]+?)<\/script>/u);
assert.ok(script);
new vm.Script(script[1],{filename:'v122.html#loader'});
console.log('V122: integridade da UI V121, 1499 cartões, 72 PDFs, grifos e scripts confirmada.');

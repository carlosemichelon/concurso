/* V123 — diff integral do HTML publicado e integridade dos dados.
 * Não substitui testes de PDF/OAuth em navegador real.
 */
'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
const root=path.resolve(__dirname,'..'),read=f=>fs.readFileSync(path.join(root,f),'utf8');
const old=read('v122.html'),current=read('v123.html'),m=JSON.parse(read('assets/version.json')),index=read('index.html');
assert.equal(m.version,'V123');
assert.equal(m.home,'v123.html');
assert.equal(m.counts.cards,1499);
assert.equal(m.counts.active,1482);
assert.equal(m.counts.pdfs,72);
assert.equal(m.counts.images,270);
assert.ok(index.includes("fallback='V123'")&&index.includes('v123.html?versao=V123'),'A entrada do portal deve apontar V123');
const reverted=current
 .replaceAll("Banco Mestre V123","Banco Mestre V122")
 .replace('<p><a href="./v122.html">Abrir a versão anterior V122</a></p>','<p><a href="./v121.html">Abrir a versão anterior V121</a></p>')
 .replace("tag('v121_relacoes_normativas.js?v=121')+tag('v123_remissoes.js?v=123')+grifadorTag",
          "tag('v121_relacoes_normativas.js?v=121')+grifadorTag")
 .replaceAll("V123 · base V024 pública","V122 · base V024 pública");
assert.equal(reverted,old,'HTML da V122 foi alterado além do módulo de remissões');
for(const marker of ['v119_public_cards_ui.js?v=119','v120_highlight_groups.js?v=120',
 'v122_biblioteca_grifos.js?v=122','v122_grifos_master_core.js?v=122',
 'v122_grifos_drive.js?v=122','v122_flashcard_ink.js?v=122',
 'v122_visual_compact.js?v=122','assets/pdf_v122.js?v=122',
 'v104_mobile_gestures.js?v=104','v097_pdf_selection_core.js?v=097']){
 assert.ok(current.includes(marker),'Módulo preservado desapareceu: '+marker);
}
const before=current.indexOf("tag('v121_relacoes_normativas.js?v=121')"),
 newModule=current.indexOf("tag('v123_remissoes.js?v=123')"),after=current.indexOf("+grifadorTag",before);
assert.ok(before>=0&&newModule>before&&after>newModule,'A remissão precisa carregar após V121 e antes do grifador');
for(const file of ['assets/v123_remissoes.js','assets/v121_relacoes_normativas.js']){
 new vm.Script(read(file),{filename:file});
}
const htmlScript=current.match(/<script>([\s\S]+?)<\/script>/u);
assert.ok(htmlScript,'HTML loader ausente');
new vm.Script(htmlScript[1],{filename:'v123.html#loader'});
console.log('Integridade V123: HTML V122 preservado, 1499 cartões, 72 PDFs, 270 imagens e módulos de grifos.');

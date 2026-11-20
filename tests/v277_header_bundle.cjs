'use strict';
/* V277: testa equivalência do bundle histórico sem congelar o index atual.
 * V298: bundle CSS auditado; o portal corrente deve respeitar o manifesto. */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const read=p=>fs.readFileSync(p,'utf8');
const historicalFiles=[
  "v263_compact_header.css","v264_header_balance.css",
  "v265_header_readable.css","v266_header_medium.css",
  "v270_header_two_actions.css"
];
const compiled=read('assets/v277_header_compiled.css');
const intro='/* Bundle estrutural do cabeçalho V277 — preserva a cascata V263/V264/V265/V266/V270.\n * Nenhuma regra foi reescrita. Fontes individuais permanecem para rollback. */\n';
const expected=intro+historicalFiles.map(f=>
  '/* INICIO '+f+' */\n'+read('assets/'+f).trimEnd()+'\n/* FIM '+f+' */\n'
).join('\n');
assert.equal(compiled,expected,'O cabeçalho compilado divergiu das cinco fontes históricas');
const styles=html=>[...html.matchAll(/<link\b[^>]*rel="stylesheet"[^>]*href="([^"]+)"/g)].map(m=>m[1]);
const scripts=html=>[...html.matchAll(/<script\b[^>]*src="([^"]+)"/g)].map(m=>m[1]);
const legacy=read('v277.html');
assert.match(legacy,/assets\/v277_header_compiled\.css\?v=277-1/);
for(const f of historicalFiles)assert.ok(!legacy.includes('href="assets/'+f),'Legado V277 carregou CSS individual: '+f);
assert.equal(styles(legacy).length,14,'A versão histórica V277 teve CSS modificados');
assert.equal(scripts(legacy).length,135,'A versão histórica V277 teve scripts modificados');
assert.match(legacy,/data-bm-portal-version="V277"/);

const manifest=JSON.parse(read('assets/version.json'));
const home=manifest.home;
const live=read('index.html');
assert.match(home,/^v\d{3}\.html$/);
assert.equal(live,read(home),'A entrada não corresponde ao arquivo canônico do manifesto');
assert.ok(live.includes('data-bm-portal-version="'+manifest.version+'"'));
assert.equal(manifest.current_versions.portal.version,manifest.version);
assert.equal(manifest.current_versions.portal.home,home);
assert.match(live,/assets\/v277_header_compiled\.css\?v=277-1/);
for(const f of historicalFiles)assert.ok(!live.includes('href="assets/'+f),'Cabeçalho duplicado no portal: '+f);

/* Revisar estes valores sempre que a versão visual mudar. Não mascarar camadas. */
const approved={
  V303:{css:18,js:151,last:'assets/v303_unified_ui.css?v=303-1'},
  V304:{css:19,js:152,last:'assets/v304_pdf_ui.css?v=304-1'},
  V305:{css:20,js:153,last:'assets/v305_cards_clarity.css?v=305-1'},
  V306:{css:21,js:155,last:'assets/v306_card_media.css?v=306-1'},
  V307:{css:22,js:156,last:'assets/v307_card_layout.css?v=307-1'},
  V308:{css:23,js:156,last:'assets/v308_mobile_header.css?v=308-1'}
};
const budget=approved[manifest.version];
assert.ok(budget,'Versão '+manifest.version+' ainda não auditada neste teste');
const css=styles(live),js=scripts(live);
assert.equal(css.length,budget.css,'Número de CSS externos mudou sem auditoria');
assert.equal(js.length,budget.js,'Número de scripts mudou sem auditoria');
assert.equal(css.at(-1),budget.last,'A última camada visual não corresponde à aprovada');
for(const [type,links] of [['CSS',css],['JS',js]]){
  const files=links.map(x=>x.split('?')[0]);
  assert.equal(new Set(files).size,files.length,'Links locais de '+type+' repetidos');
  for(const path of files){
    assert.ok(path.startsWith('assets/'),'Recurso '+type+' fora do diretório: '+path);
    assert.ok(fs.existsSync(path),'Recurso local '+type+' ausente: '+path);
  }
}
console.log('V277_ARCHIVE_PASS + '+manifest.version+'_CURRENT_PASS: '+css.length+' CSS, '+js.length+' JS; ordem e arquivos válidos.');

/* Bundle fiel: reproduzir literalmente a cascata, sem alterar seletor nem ordem. */
const bundledSources=["assets/v278_ui_icons.css","assets/v280_teclike_theme.css","assets/v281_content_hierarchy.css","assets/v283_blue_popup_theme.css","assets/v284_body_heading_blue.css","assets/v286_font_blue.css","assets/v287_global_contrast.css","assets/v288_cards_surface.css","assets/v289_other_sections.css","assets/v291_contrast_square.css","assets/v292_visual_system.css","assets/v293_compact_cards_images.css","assets/v294_reader_ink_font.css","assets/v295_pdf_and_image_trash.css","assets/v297_visual_audit.css"];
const prefix='/* Banco Mestre V298 — bundle fiel (V278..V297).\n * Ordem, conteúdo e linhas originais preservados; folhas originais mantidas\n * no repositório para rollback. NÃO reorganizar seletores manualmente.\n */\n';
const expectedUi=prefix+bundledSources.map(path=>
 '/* ===== INICIO '+path+' ===== */\n'+read(path).trimEnd()+'\n/* ===== FIM '+path+' ===== */\n'
).join('\n');
assert.equal(read('assets/v298_ui_bundle.css'),expectedUi,'CSS consolidados diferem das fontes originais');
for(const name of bundledSources)assert.ok(!live.includes('href="'+name),'CSS importado duplicadamente: '+name);
const legacyBundle='assets/v298_ui_bundle.css?v=298-1';
assert.ok(css.includes(legacyBundle),'Bundle V298 ausente');
assert.ok(css.indexOf(legacyBundle)<css.indexOf(budget.last),'Bundle V298 carregado depois do último CSS aprovado');
assert.equal(styles(read('v298.html')).length,16,'V298 histórica modificada');
assert.equal(styles(read('v297.html')).length,29,'Rollback V297 alterado');
console.log('V298_BUNDLE_PASS: 15 folhas reproduzidas, 29 → 16 CSS, rollback intacto.');

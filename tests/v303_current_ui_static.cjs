'use strict';
/* V305: contrato atual com verificação dos snapshots históricos V303/V304 intactos.
 * Sem escrita nos cartões, mídias, SRS ou Drive. */
const assert=require('node:assert/strict'),fs=require('node:fs');
const read=p=>fs.readFileSync(p,'utf8');
const m=JSON.parse(read('assets/version.json')),index=read('index.html');
const scripts=s=>[...s.matchAll(/<script\b[^>]*src="([^"]+)"/g)].map(x=>x[1]);
const css=s=>[...s.matchAll(/<link\b[^>]*rel="stylesheet"[^>]*href="([^"]+)"/g)].map(x=>x[1]);
assert.equal(m.version,'V305');assert.equal(m.home,'v305.html');
assert.equal(m.previous_version,'V304');
assert.equal(m.current_versions.portal.version,'V305');
assert.equal(m.current_versions.portal.home,'v305.html');
assert.equal(m.current_versions.portal.previous,'V304');
assert.equal(index,read('v305.html'),'Home e arquivo corrente divergentes');
assert.match(index,/data-bm-portal-version="V305"/);
assert.match(read('v304.html'),/data-bm-portal-version="V304"/);
assert.match(read('v303.html'),/data-bm-portal-version="V303"/);
assert.match(read('v302.html'),/data-bm-portal-version="V302"/);
assert.equal(m.counts.cards,1533);assert.equal(m.counts.pdfs,78);
assert.equal(m.counts.card_operational_ijui,22);
const j=scripts(index),c=css(index);
assert.equal(c.length,20);assert.equal(j.length,153);
assert.equal(c.at(-1),'assets/v305_cards_clarity.css?v=305-1');
for(const t of [
 'assets/v304_drive_continuous.js?v=304-1',
 'assets/v304_global_drive.js?v=304-1',
 'assets/v304_private_compare_only.js?v=304-1',
 'assets/v304_pdf_ui.js?v=304-1',
 'assets/v305_card_reader.js?v=305-1',
 'assets/v305_cards_clarity.js?v=305-1',
 'assets/v300_lacunas_ui.js?v=300-1',
 'assets/v303_unified_filters.js?v=303-1',
 'assets/v303_compact_bibliotecas.js?v=303-1',
 'assets/v303_toolbar_reorder.js?v=303-1'
])assert.ok(j.includes(t),'Módulo vigente ausente: '+t);
for(const old of [
 'assets/v302_drive_continuous.js?v=302-1',
 'assets/v301_global_drive.js?v=301-1',
 'assets/v279_card_reader.js?v=279-shared',
 'assets/v280_compact_filters.js?v=280-1',
 'assets/v300_simple_filters.js?v=300-1',
 'assets/v113_compact_bibliotecas.js?v=113',
 'assets/v293_toolbar_reorder.js?v=293-1'
])assert.ok(!j.includes(old),'Legado concorrente carregado: '+old);
const reader=read('assets/v305_card_reader.js'),clarity=read('assets/v305_cards_clarity.js');
assert.match(reader,/sidebarToggle\.setAttribute\('aria-expanded','false'\)/);
assert.match(reader,/panel\.classList\.add\('bm165-sidebar-hidden'\)/);
assert.match(clarity,/Number\(x\?\.ord\)===8/);
assert.match(clarity,/function keepIdOrder\(\)/);
assert.match(clarity,/lookup\(\)\.has\(id\)/);
assert.match(clarity,/general\.value='__pendente__'/);
assert.match(read('assets/v304_drive_continuous.js'),/CYCLE=3\*60\*60\*1000/);
assert.match(read('assets/v303_unified_ui.css'),/details\.bm303-more:not\(\[open\]\)/);
assert.ok(read('assets/v263_grifos_drive.js').includes('BancoMestre_Grifos_Mestre.json'));
assert.ok(read('assets/pdf_v122.js').includes('core.persistPage(localStorage'));
for(const p of [...j,...c].map(x=>x.split('?')[0]))assert.ok(fs.existsSync(p),'Recurso faltante: '+p);
console.log('V305_CURRENT_STATIC_PASS: 20 CSS, 153 scripts, IDs e módulos preservados, Drive 3h, leitor e ordenação conferidos.');

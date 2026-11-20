'use strict';
/* V310: contrato atual, snapshots V303/V304/V305/V306/V307/V308/V309 intactos.
 * Sem escrita nos cartões, mídias, SRS ou Drive. */
const assert=require('node:assert/strict'),fs=require('node:fs');
const read=p=>fs.readFileSync(p,'utf8');
const m=JSON.parse(read('assets/version.json')),index=read('index.html');
const scripts=s=>[...s.matchAll(/<script\b[^>]*src="([^"]+)"/g)].map(x=>x[1]);
const css=s=>[...s.matchAll(/<link\b[^>]*rel="stylesheet"[^>]*href="([^"]+)"/g)].map(x=>x[1]);
assert.equal(m.version,'V310');assert.equal(m.home,'v310.html');
assert.equal(m.previous_version,'V309');
assert.equal(m.current_versions.portal.version,'V310');
assert.equal(m.current_versions.portal.home,'v310.html');
assert.equal(m.current_versions.portal.previous,'V309');
assert.equal(index,read('v310.html'),'Home e arquivo corrente divergentes');
assert.match(index,/data-bm-portal-version="V310"/);
assert.match(read('v309.html'),/data-bm-portal-version="V309"/);
assert.match(read('v308.html'),/data-bm-portal-version="V308"/);
assert.match(read('v307.html'),/data-bm-portal-version="V307"/);
assert.match(read('v306.html'),/data-bm-portal-version="V306"/);
assert.match(read('v305.html'),/data-bm-portal-version="V305"/);
assert.match(read('v304.html'),/data-bm-portal-version="V304"/);
assert.match(read('v303.html'),/data-bm-portal-version="V303"/);
assert.match(read('v302.html'),/data-bm-portal-version="V302"/);
assert.equal(m.counts.cards,1533);assert.equal(m.counts.pdfs,78);
assert.equal(m.counts.card_operational_ijui,22);
const j=scripts(index),c=css(index);
assert.equal(c.length,24);assert.equal(j.length,158);
assert.equal(c.at(-1),'assets/v309_mobile_tabs.css?v=309-2');
assert.ok(j.includes('assets/v218_image_metadata.js?v=310-1'),'Metadados V310 não carregados');
for(const t of [
 'assets/v304_drive_continuous.js?v=304-1',
 'assets/v304_global_drive.js?v=304-1',
 'assets/v304_private_compare_only.js?v=304-1',
 'assets/v304_pdf_ui.js?v=304-1',
 'assets/v305_card_reader.js?v=305-1',
 'assets/v305_cards_clarity.js?v=305-2',
 'assets/v306_drive_gallery_search.js?v=306-2',
 'assets/v306_card_media.js?v=306-1',
 'assets/v306_redacao_theme.js?v=306-1',
 'assets/v307_card_layout.js?v=307-1',
 'assets/v309_mobile_tabs.js?v=309-1',
 'assets/v309_calendar_sync_ui.js?v=309-1',
 'assets/v300_lacunas_ui.js?v=300-1',
 'assets/v303_unified_filters.js?v=303-1',
 'assets/v303_compact_bibliotecas.js?v=303-1',
 'assets/v303_toolbar_reorder.js?v=303-1'
])assert.ok(j.includes(t),'Módulo vigente ausente: '+t);
for(const old of [
 'assets/v302_drive_continuous.js?v=302-1',
 'assets/v301_global_drive.js?v=301-1',
 'assets/v279_card_reader.js?v=279-shared',
 'assets/v296_drive_gallery_open.js?v=296-1',
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
const indexImages=JSON.parse(read('assets/v211_published_images.json'));
const ref=indexImages.records.find(x=>x.imageId==='IMG-C12-030');
assert.ok(ref&&ref.driveFileId==='1gdepf2G5xQfT82pjAA1Rszl9nLdXyuZS'&&ref.cardIds.includes('CARD-1509')&&ref.cardIds.includes('CARD-1518'));
assert.match(read('assets/v306_drive_gallery_search.js'),/alias\?\.imageId/);
assert.match(read('assets/v306_drive_gallery_search.js'),/getImageUrlForCard/);
assert.match(read('assets/v306_card_media.js'),/bm306-explanations/);
assert.match(read('assets/v306_redacao_theme.js'),/bm306-redacao-theme/);
assert.ok(read('assets/v306_redacao_theme.css').includes('--ouro:#176a9f'));
const layout=read('assets/v307_card_layout.js'),theme=read('assets/v307_card_layout.css');
assert.match(layout,/article\.classList\.add\('bm307-card'\)/);
assert.match(layout,/ref\)/);
assert.match(layout,/removeAttribute\('data-bm096-icon'\)/);
assert.match(theme,/\.bm-v050-peek-button/);
assert.match(theme,/min\(100%,350px\)/);
assert.match(read('assets/v308_mobile_header.css'),/grid-template-columns:repeat\(4,minmax\(0,1fr\)\)/);
assert.match(read('assets/v309_mobile_tabs.js'),/aria-expanded/);
assert.match(read('assets/v309_mobile_tabs.css'),/nav\[aria-label="Seções"\]\[hidden\]/);
assert.match(read('assets/v309_calendar_sync_ui.js'),/BM240ControlDrive/);
const taxonomy=JSON.parse(read('assets/v310_image_taxonomy.json'));
const historical=indexImages.records;
assert.equal(taxonomy.schema,'BancoMestreImageTaxonomyV310');
assert.equal(taxonomy.records.length,144);
assert.equal(new Set(taxonomy.records.map(r=>r.driveFileId)).size,144);
assert.equal(historical.filter(r=>r.topic).length,93);
assert.equal(historical.filter(r=>!r.topic).length,144);
assert.ok(taxonomy.records.every(r=>historical.some(p=>p.driveFileId===r.driveFileId&&!p.topic)),'Taxonomia contém imagem fora da fila pendente');
assert.ok(taxonomy.records.every(r=>r.topic&&r.subtopic&&r.group&&r.cardIds===undefined&&r.originalCardIds.length===0));
assert.match(read('assets/v218_image_metadata.js'),/fromV310/);
console.log('V310_CURRENT_STATIC_PASS: 144 novas classificações, V309 preservada e módulos intactos');

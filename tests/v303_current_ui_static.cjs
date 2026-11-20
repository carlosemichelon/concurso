'use strict';
/* V303: contrato do portal corrente sem mutação das bibliotecas. */
const assert=require('node:assert/strict'),fs=require('node:fs');
const read=p=>fs.readFileSync(p,'utf8');
const m=JSON.parse(read('assets/version.json')),index=read('index.html');
const scripts=s=>[...s.matchAll(/<script\b[^>]*src="([^"]+)"/g)].map(x=>x[1]);
const css=s=>[...s.matchAll(/<link\b[^>]*rel="stylesheet"[^>]*href="([^"]+)"/g)].map(x=>x[1]);
assert.equal(m.version,'V303');assert.equal(m.home,'v303.html');
assert.equal(m.previous_version,'V302');
assert.equal(m.current_versions.portal.version,'V303');
assert.equal(m.current_versions.portal.home,'v303.html');
assert.equal(m.current_versions.portal.previous,'V302');
assert.equal(index,read('v303.html'),'Home e arquivo corrente divergentes');
assert.match(index,/data-bm-portal-version="V303"/);
assert.match(read('v302.html'),/data-bm-portal-version="V302"/);
assert.equal(m.counts.cards,1533);assert.equal(m.counts.pdfs,78);
assert.equal(m.counts.card_operational_ijui,22);
const j=scripts(index),c=css(index);
assert.equal(c.length,18);assert.equal(j.length,151);
assert.equal(c.at(-1),'assets/v303_unified_ui.css?v=303-1');
for(const t of [
 'assets/v302_drive_continuous.js?v=302-1',
 'assets/v300_lacunas_ui.js?v=300-1',
 'assets/v303_unified_filters.js?v=303-1',
 'assets/v303_compact_bibliotecas.js?v=303-1',
 'assets/v303_toolbar_reorder.js?v=303-1'
])assert.ok(j.includes(t),'Módulo ausente: '+t);
for(const old of ['assets/v280_compact_filters.js?v=280-1','assets/v300_simple_filters.js?v=300-1',
 'assets/v113_compact_bibliotecas.js?v=113','assets/v293_toolbar_reorder.js?v=293-1'])
 assert.ok(!j.includes(old),'Reorganizador concorrente continua ativo: '+old);
assert.ok(read('assets/v303_unified_filters.js').includes('mountPdf'));
assert.ok(read('assets/v303_unified_ui.css').includes('details.bm303-more:not([open])'),'Detalhes não fecham');
assert.ok(read('assets/v263_grifos_drive.js').includes('BancoMestre_Grifos_Mestre.json'),'Mestre de grifos perdido');
assert.ok(read('assets/pdf_v122.js').includes('core.persistPage(localStorage'),'Persistência local de grifos perdida');
for(const p of [...j,...c].map(s=>s.split('?')[0]))assert.ok(fs.existsSync(p),'Recurso faltante: '+p);
console.log('V303_CURRENT_STATIC_PASS: V302 Drive preservado, filtros únicos, PDF e dados intactos.');

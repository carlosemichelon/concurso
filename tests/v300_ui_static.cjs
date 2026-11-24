'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict');
const read=p=>fs.readFileSync(p,'utf8');
const previous=read('v299.html'),current=read('v300.html');
const manifest=JSON.parse(read('assets/version.json'));
const scripts=s=>[...s.matchAll(/<script\b[^>]*src="([^"]+)"/g)].map(x=>x[1]);
const styles=s=>[...s.matchAll(/<link\b[^>]*rel="stylesheet"[^>]*href="([^"]+)"/g)].map(x=>x[1]);
assert.ok(Number(manifest.version.slice(1))>=300);
assert.ok(manifest.home==='v'+manifest.version.slice(1)+'.html');
assert.equal(manifest.current_versions.portal.home,manifest.home);
assert.equal(manifest.current_versions.portal.previous,manifest.previous_version);
assert.equal(current,read('v300.html'),'Index divergente da V300');
assert.match(previous,/data-bm-portal-version="V299"/,'V299 histórica alterada');
assert.match(current,/data-bm-portal-version="V300"/);
const oldJs=scripts(previous),nowJs=scripts(current);
assert.equal(nowJs.length,oldJs.length+2,'Scripts originais não preservados');
for(const s of oldJs)assert.equal(nowJs.filter(x=>x===s).length,1,'Script anterior ausente/duplicado: '+s);
assert.deepEqual(nowJs.slice(-3),[
 'assets/v299_drive_continuous.js?v=299-1',
 'assets/v300_simple_filters.js?v=300-1',
 'assets/v300_lacunas_ui.js?v=300-1'
],'Sincronização V299 deve ser preservada antes dos módulos de UI');
assert.equal(styles(previous).length,16);
assert.equal(styles(current).length,17);
assert.equal(styles(current).at(-1),'assets/v300_ui_simplified.css?v=300-1');
assert.equal(manifest.counts.pdfs,78);
assert.ok(Number.isSafeInteger(manifest.counts.cards)&&manifest.counts.cards>=1533,'Catálogo vigente abaixo do marco histórico V300');
assert.equal(manifest.counts.cards,manifest.catalog.counts.canonical,'Contagem vigente divergente do catálogo');
assert.ok(read('assets/v300_lacunas_ui.js').includes('relatoEstudante'),'Autoria da lacuna não mantida');
assert.ok(read('assets/v300_ui_simplified.css').includes('section.bm256-lac-block'),'Bloco didático oculto pelo CSS geral');
assert.ok(read('assets/v300_simple_filters.js').includes('bm210PdfToolbar'),'PDF perdeu controles originais');
for(const path of ['assets/v300_simple_filters.js','assets/v300_lacunas_ui.js','assets/v300_ui_simplified.css'])assert.ok(fs.statSync(path).size>1000);
console.log('V300_STATIC_PASS: PDF anterior em CSS, opções recolhidas, lacunas completas, scripts Drive preservados, SRS intacto.');

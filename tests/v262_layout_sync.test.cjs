'use strict';
/* V262 — verificação estática da interface e dos limites dos dados.
 * Testes OAuth privado e visuais em navegador real permanecem separados.
 */
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const read=p=>fs.readFileSync(p,'utf8');
const html=read('v262.html');
const current=read('index.html');
const versioned=read('v262.html');
const manifest=JSON.parse(read('assets/version.json'));
assert.match(manifest.version,/^V\d{3}$/);
assert.ok(Number(manifest.version.slice(1))>=262);
assert.equal(manifest.home,'v'+manifest.version.slice(1)+'.html');
assert.ok(current.includes('data-bm-portal-version="'+manifest.version+'"'));
assert.equal(manifest.release_v262.previous_version,'V261');
assert.equal(manifest.counts.cards,1518);
assert.equal(manifest.counts.card_operational_ijui,22);
assert.equal(manifest.counts.card_entries_combined,1540);
assert.equal(manifest.counts.pdfs,78);
assert.equal(manifest.counts.images_public_v198,179);
assert.equal(html,versioned,'Página histórica V262 precisa permanecer intacta');
const beforeMain=html.slice(0,html.indexOf('<main>'));
const header=beforeMain.slice(beforeMain.indexOf('<header>'),beforeMain.indexOf('</header>'));
assert.equal((header.match(/class="stat(?: bm241-(?:control|grifos))?"/g)||[]).length,5);
assert.ok(header.includes('data-bm241-extra="control"'));
assert.ok(header.includes('data-bm241-extra="grifos"'));
assert.ok(header.includes('id="bm239-drive-action"'));
assert.ok(header.includes('id="bm239-sync-details"'));
assert.ok(header.includes('id="pdfStat"'));
assert.ok(!html.includes('<main><div class="hero">'));
assert.ok(!html.includes('<main><div class="stats">'));
for(const asset of ['v262_layout_stability.css','v262_global_drive.js','v262_sync_truth.js']){
 assert.ok(html.includes('assets/'+asset));
 assert.ok(fs.statSync('assets/'+asset).size>1000);
}
for(const asset of ['v262_global_drive.js','v262_sync_truth.js','v262_ink_ui.js']){
 const source=read('assets/'+asset);
 new vm.Script(source,{filename:asset});
}
const global=read('assets/v262_global_drive.js');
assert.ok(global.includes("existing.onclick=click"),'OAuth perdeu seu handler de clique');
assert.ok(global.includes('backgroundBusy=true;lastRun=Date.now()'),'Sincronização periódica sem bloqueio');
assert.ok(!global.includes('foundPdf===78'),'Total de PDF do Drive não pode ser igualado ao catálogo de 78');
assert.ok(global.includes("pdf?.source==='google_drive_only'"),'Exigir fonte Drive antes de confirmar varredura');
assert.ok(global.includes('historicalPdfIds'),'Auditar cobertura dos 78 IDs sem confundir com total do Drive');
const ink=read('assets/v262_ink_ui.js');
assert.ok(ink.includes("const preview=node('div','bm102-preview-panel')"),'Prévia do marca-texto precisa ser declarada');
assert.ok(!global.includes('?.sync(writeToken()).then('),'Chamada concorrente ou indefinida legada');
const truth=read('assets/v262_sync_truth.js');
assert.ok(truth.includes("'Sem autorização'"),'Falha de permissão não deve ser tratada como perda de dados');
assert.ok(truth.includes("'Conferidos: '"),'Resumo precisa separar confirmados de pendências');
console.log('V262: 5 slots estáveis; 3 módulos CSS/JS; 1518+22; 78 PDFs; 179 catálogo; nenhum dado canônico modificado.');

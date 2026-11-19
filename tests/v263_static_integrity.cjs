'use strict';
/* V263: integridade canônica, JS sintático, rotas e serialização da sincronização */
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const read=p=>fs.readFileSync(p,'utf8');
const index=read('index.html'),page=read('v263.html'),manifest=JSON.parse(read('assets/version.json'));
// O escopo V263 é histórico; a entrada pública deve seguir a versão atual.
assert.match(manifest.version,/^V\\d{3}$/);
assert.ok(Number(manifest.version.slice(1))>=263);
assert.equal(manifest.home,'v'+manifest.version.slice(1)+'.html');
assert.ok(index.includes('data-bm-portal-version="'+manifest.version+'"'));
assert.equal(manifest.current_versions.portal.home,manifest.home);
assert.ok(Number(manifest.previous_version.slice(1))<Number(manifest.version.slice(1)));
assert.ok(page.includes('data-bm-portal-version="V263"'),'V263 histórica preservada');
assert.equal(manifest.counts.cards,1518);
assert.equal(manifest.counts.card_operational_ijui,22);
assert.equal(manifest.counts.card_entries_combined,1540);
assert.equal(manifest.counts.pdfs,78);
assert.equal(manifest.counts.images_public_v198,179);
assert.ok(page.includes('data-bm-portal-version="V263"'));
assert.ok(fs.existsSync('v262.html'),'Rollback V262 removido');
assert.equal((page.match(/class="stat(?: bm241-(?:control|grifos))?"/g)||[]).length,5);
for(const asset of [
 'v263_compact_header.css','v263_media_core.js','v263_drive_pdf_sync.js',
 'v263_drive_gallery_feed.js','v263_grifos_drive.js','v263_global_drive.js',
 'v263_sync_truth.js','v263_sync_diagnostics.js']){
 const filename='assets/'+asset;
 assert.ok(page.includes(filename),'Módulo ausente: '+filename);
 assert.ok(fs.statSync(filename).size>1000);
 if(asset.endsWith('.js'))new vm.Script(read(filename),{filename});
}
const css=read('assets/v263_compact_header.css');
assert.ok(css.includes('grid-template-rows:32px 27px'),'Cabeçalho deve ter duas linhas');
assert.ok(css.includes('height:32px!important'),'Faixa de indicadores compacta');
assert.ok(css.includes('.stat{display:none!important}'),'Esconder indicadores no topo mobile, acessíveis no painel');
const media=read('assets/v263_media_core.js');
assert.ok(media.includes('if(running)return running;'),'Reusar consulta concorrente');
const gallery=read('assets/v263_drive_gallery_feed.js');
const pdf=read('assets/v263_drive_pdf_sync.js');
const ink=read('assets/v263_grifos_drive.js');
for(const [value,name] of [[gallery,'gallery'],[pdf,'pdf'],[ink,'grifos']])
 assert.ok(value.includes('InFlight')&&value.includes('.finally('),name+' sem bloqueio de concorrência');
const global=read('assets/v263_global_drive.js');
assert.ok(global.includes('if(foregroundPromise)return foregroundPromise'),'Sem lock de sincronização global');
assert.ok(global.includes("r?.state==='empty'"),'Sem dados não pode ser contabilizado como erro');
assert.ok(global.includes('const notes=[],warnings=[],pending=[],modules={}'),'Falta relatório categorizado');
assert.ok(global.includes("pdf?.source==='google_drive_only'"),'PDF requer evidência do Drive');
assert.ok(!global.includes("foundPdf===78"),'Catálogo de 78 não deve impedir PDFs novos');
assert.ok(global.includes('window.BM208AtlasUnified?.refresh?.()'),'Ponte do Atlas perdida');
assert.ok(global.includes('writeToken'), 'Autorização de gravação não conferida');
assert.ok(!/localStorage.setItem\([^)]*token/i.test(global),'Não persistir OAuth');
console.log('V263_STATIC_PASS: portal compacto, 7 módulos JS, rollback V262, 1518+22 cartões, 78 PDFs, sem SRS alterado.');

/* Banco Mestre V343 - PETROBRAS 27.
 * Teste estrutural offline, sem alterar conteúdo nem SRS.
 */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const packet=JSON.parse(read('assets/petro27_sync_v343.json'));
const ver=JSON.parse(read('assets/version.json'));
const html=read('index.html'),snapshot=read('v343.html');
assert.equal(packet.format,'BancoMestrePetro27SyncV343');
assert.equal(packet.counts.existing,7);
assert.equal(packet.counts.proposals,11);
assert.equal(packet.srs_modified,false);
assert.equal(packet.private_canonical_modified,false);
assert.equal(packet.originals_overwritten,false);
assert.equal(Object.keys(packet.existing).length,7);
assert.equal(Object.keys(packet.proposals).length,11);
const ids=new Set();
for(const [id,record]of [...Object.entries(packet.existing),...Object.entries(packet.proposals)]){
 assert(!ids.has(id),'ID duplicado: '+id);ids.add(id);
 if(packet.existing[id])assert.match(id,/^CARD-\d{4}$/);
 if(packet.proposals[id])assert(!/^CARD-\d{4}$/.test(id),'Proposta promovida sem aprovacao: '+id);
 assert.equal(record.layers.length,11,'Onze módulos: '+id);
 assert(record.front.length>40&&record.back.length>30,'Frente/verso: '+id);
 record.layers.forEach((m,i)=>{assert.equal(m.ord,i+1);assert(m.titulo.length>2&&m.texto.length>25,'Módulo incompleto: '+id+'/'+(i+1));});
 assert(record.source_url.startsWith('https://docs.google.com/document/d/'),'Fonte rastreavel: '+id);
}
assert.equal(packet.media.length,4);
const urls=new Set();
for(const m of packet.media){
 assert(!urls.has(m.src),'SVG duplicado: '+m.src);urls.add(m.src);
 assert.equal(m.role,'VERSO_APOS_TENTATIVA');
 assert.match(m.src,/^assets\/petro27_v343_figures\/[a-z0-9_]+\.svg$/);
 assert(m.drive_id,'Original autoral SVG sem origem');
 const svg=read(m.src);
 assert(svg.includes('<svg')&&svg.includes('</svg>'),'SVG incompleto: '+m.src);
 assert(!/<script[\s>]|onload\s*=|<foreignObject\b/i.test(svg),'SVG dinamico inseguro: '+m.src);
 for(const id of m.card_ids){assert(packet.existing[id],'Vínculo com cartão inexistente: '+id);}
 for(const id of m.proposal_ids){assert(packet.proposals[id],'Vínculo com proposta inexistente: '+id);}
}
assert.equal(packet.cases.length,12);
for(const c of packet.cases){assert(ids.has(c.card_id),'Questão sem destino: '+c.question_id);assert(c.result);}
assert.equal(ver.version,'V343');
assert.equal(html,snapshot,'index.html diferente do snapshot v343.html');
assert(html.includes('assets/v342_media_integrity.js'),'Auditoria anterior apagada');
assert(html.includes('assets/v343_petro27_renderer.js'),'Camada PETRO27 sem carregamento');
assert(html.includes('assets/v343_petro27.css'),'Estilos ausentes');
assert(html.lastIndexOf('v343_petro27_renderer.js')>html.lastIndexOf('v342_media_integrity.js'),'V343 carregada fora de ordem');
assert(read('v342.html').includes('v342_media_integrity.js'),'Snapshot V342 perdido');
const js=read('assets/v343_petro27_renderer.js');
new Function(js);
assert(js.includes('VERSO_APOS_TENTATIVA'),'Risco de antecipar gabarito');
const independent=read('petro27_v343.html');
assert(independent.includes('provisionalId')&&independent.includes('answer')&&independent.includes('hidden'),'Revisao sem frente oculta');
const inside=independent.match(/<script>([\s\S]*?)<\/script>/);
assert(inside,'Script de propostas ausente');
new Function(inside[1]);
console.log('V343 OK: 7 cartões evoluídos + 11 propostas de estudo; 198 módulos, 12 questões, 4 SVGs. SRS e originais intactos. Teste estrutural, não teste visual/OAuth.');

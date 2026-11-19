/* V274 — Verificação de integridade da sincronização do Drive V164 -> GitHub. */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.join(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const json=p=>JSON.parse(read(p));
const index=read('index.html'),archive=read('v274.html'),reader=read('assets/v242_card_reader.js');
const meta=json('assets/meta_public_v194.json'),manifest=json('assets/version.json'),
      sync=json('assets/cards_drive_sync_v274.json'),layers=json('assets/layers_public_v274_sync.json'),
      adenda=json('assets/estudos_incrementos_v267.json');
const pub=meta.card_files.flatMap(f=>json('assets/'+f)),ids=new Set(pub.map(c=>c.id));
assert.equal(pub.length,1518);
assert.equal(ids.size,1518);
assert.equal(sync.format,'BancoMestrePublicDriveSyncV274');
assert.equal(sync.source_version,'V164');
assert.equal(sync.new_cards.length,14);
assert.equal(sync.updated_explanations.length,9);
assert.equal(layers.records.length,39);
assert.equal(layers.format,'BancoMestrePublic11ModulesV274');
assert.equal(adenda.version,'V267-PETRO17-PETRO20');
assert.equal(adenda.cards.length,19);
for(let k=0;k<14;k++){
 const card=sync.new_cards[k],wanted='CARD-'+String(1520+k).padStart(4,'0');
 assert.equal(card.id,wanted);
 assert.equal(card.active,true);
 assert(!ids.has(card.id),'ID repetido '+card.id);
 for(const k of ['front','back','expl','mnemonic'])assert(card[k]&&card[k].trim());
 ids.add(card.id);
}
assert(!ids.has('CARD-1499'),'ID reservado não deve ser criado');
assert.equal(ids.size,1532);
const modIds=new Set();
for(const row of layers.records){
 assert(ids.has(row.id),'Módulo para ID não publicado');
 assert(!modIds.has(row.id),'Módulo repetido');
 modIds.add(row.id);
 assert.equal(row.layers.length,11);
 row.layers.forEach((l,i)=>{assert.equal(l.ord,i+1);assert(l.titulo.trim());assert(l.texto.trim())});
}
for(const c of sync.new_cards)assert(modIds.has(c.id),'Novo cartão sem 11 módulos '+c.id);
const updatedIds=new Set();
for(const item of sync.updated_explanations){
 assert(ids.has(item.id)&&!updatedIds.has(item.id));
 assert(item.expl.trim());
 updatedIds.add(item.id);
}
const priv=/(?:relato literal|resposta assinalada|avaliação (?:bom|difícil|fácil)|rating srs|evento srs|o estudante|do estudante|o usu[aá]rio|do usu[aá]rio|@gmail\.com|carlosemichelon)/i;
assert(!priv.test(JSON.stringify(sync)),'dados pessoais nos cartões');
assert(!priv.test(JSON.stringify(layers)),'dados pessoais nos módulos');
assert(!/https:\/\/(?:docs|drive)\.google\.com\/(?:document|file)\/d\//i.test(JSON.stringify(sync)+JSON.stringify(layers)));
assert.equal(index,archive,'Página inicial precisa ser idêntica ao snapshot');
assert.match(index,/data-bm-portal-version="V274"/);
assert.match(index,/cards_drive_sync_v274\.json/);
assert.match(index,/1\.554 = 1\.532 \+ 22/);
assert.match(index,/add\.version!=='V267-PETRO17-PETRO20'/,'contrato da V267 deve permanecer');
assert.match(reader,/function bm274Record\(id\)/);
assert.match(reader,/layers_public_v274_sync\.json/);
assert.equal(manifest.version,'V274');
assert.equal(manifest.home,'v274.html');
assert.equal(manifest.counts.cards,1532);
assert.equal(manifest.counts.active,1515);
assert.equal(manifest.counts.cards_public_base,1518);
assert.equal(manifest.counts.card_entries_combined,1554);
console.log('OK: V274 14 novos IDs, 9 explicações, 39 fichas com 11 módulos, privacidade e compatibilidade V267');

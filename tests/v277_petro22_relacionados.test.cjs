/* V277: não-regressão, 11 módulos, privacidade e contagens preservadas. */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.join(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const json=p=>JSON.parse(read(p));
const html=read('index.html'),arc=read('v277.html'),
  manifest=json('assets/version.json'),
  related=json('assets/v277_petro22_relacionados_cards.json'),
  layers=json('assets/v277_petro22_relacionados_layers.json'),
  v276=json('assets/v276_petro22_public_cards.json'),
  v276Layers=json('assets/v276_petro22_public_layers.json'),
  v274=json('assets/cards_drive_sync_v274.json'),
  iju=json('assets/ijui_flashcards_operacionais_v027.json'),
  bridge=read('assets/v276_layers_bridge.js'),
  reader=read('assets/v242_card_reader.js');
assert.equal(html,arc,'A homepage deve reproduzir o arquivo versionado');
assert.equal(manifest.version,'V277');
assert.equal(manifest.home,'v277.html');
assert.equal(manifest.counts.cards,1533);
assert.equal(manifest.counts.active,1516);
assert.equal(manifest.counts.card_entries_combined,1555);
assert.equal(manifest.counts.catalog_entries_unified,1555);
assert.equal(related.format,'BancoMestrePublicPetro22RelatedV277');
assert.equal(related.source_private_version,'V166');
assert.equal(related.base_public_version,'V276');
assert.deepEqual(related.updated_explanations.map(x=>x.id).sort(),['CARD-0578','CARD-0924']);
assert(related.updated_explanations.every(x=>x.expl_append.trim()&&x.expl_append.includes('CARD-1534')));
assert.equal(layers.format,'BancoMestrePublicPetro22RelatedLayersV277');
assert.deepEqual(layers.records.map(x=>x.id).sort(),['CARD-0578','CARD-0924']);
assert(layers.records.every(x=>x.layers.length===11&&x.layers.every((m,i)=>m.ord===i+1&&m.titulo.trim()&&m.texto.trim())));
assert(v276.new_cards.length===1&&v276.new_cards[0].id==='CARD-1534');
assert.deepEqual(v276.updated_explanations.map(x=>x.id),['CARD-1413']);
assert.deepEqual(v276Layers.records.map(x=>x.id).sort(),['CARD-1413','CARD-1534']);
assert.equal(v274.new_cards.length,14);
assert.equal(iju.cards.length,22);
const base=json('assets/meta_public_v194.json').card_files.flatMap(x=>json('assets/'+x));
const ids=[...base,...v274.new_cards,...v276.new_cards,...iju.cards].map(x=>x.id);
assert.equal(ids.length,1555);
assert.equal(new Set(ids).size,1555,'Nenhum ID pode ser duplicado');
assert(!ids.includes('CARD-1499'));
assert.match(html,/v277_petro22_relacionados_cards\.json/);
assert.match(html,/assets\/v276_layers_bridge\.js\?v=277-related/);
assert.match(html,/assets\/v242_card_reader\.js\?v=277-related/);
assert.match(html,/cards=\[\.\.\.base,\.\.\.ijui\]/);
assert.match(reader,/id==='CARD-0578'\|\|id==='CARD-0924'/);
assert.match(reader,/window\.BM276LayerData\?\.get\?\.\(id\)/);
assert.match(bridge,/v277_petro22_relacionados_layers\.json/);
assert.match(bridge,/v276_petro22_public_layers\.json/);
assert.match(bridge,/layers_public_v274_sync\.json/);
const published=JSON.stringify(related)+JSON.stringify(layers);
assert(!/relato(?:s)? literal|o estudante|do estudante|o usuário|do usuário|@gmail\.com|carlosemichelon/i.test(published));
assert(!/https?:\/\/(?:docs|drive)\.google\.com\/(?:file|document)\/d\//i.test(published));
assert(!/"(?:srs|questions|user_report|history_versions|approval_source)"\s*:/.test(published));
assert(!/"J — ORIGINAL V055|"K — ORIGINAL V055/.test(published),'Campos administrativos não publicados');
console.log('V277 OK: 2 IDs × 11 módulos, 0 duplicações, 1.555 fichas, conservação de V276 e dados privados');

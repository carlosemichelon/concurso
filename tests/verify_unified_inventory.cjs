'use strict';
// Current active inventory may shrink only by documented retirement/redirect.
// Keep historical ID conservation, not a brittle minimum of active cards.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
module.exports=function verifyUnifiedCatalog(m,minimum){
 const lookup=read('assets/catalog_lookup/manifest.json'),ledger=read('assets/catalog_lookup/occupied_public_ids.json');
 const old=read('tests/fixtures/vs40-public-id-baseline.json');
 assert.equal(lookup.catalog_git_blob,m.catalog.git_blob);
 assert.equal(ledger.catalog_git_blob,m.catalog.git_blob);
 const occupied=[...ledger.active,...ledger.retired,...ledger.inactive],all=new Set(occupied),active=new Set(ledger.active),retired=new Set(ledger.retired);
 assert.equal(all.size,occupied.length,'ID duplicado no cadastro');
 assert.ok(all.size>=minimum,'Cadastro de IDs abaixo do marco histórico');
 assert.equal(active.size,m.catalog.counts.active);assert.equal(lookup.count,active.size);
 assert.equal(m.counts.cards,m.catalog.counts.canonical);assert.equal(m.counts.card_operational_ijui,m.catalog.counts.ijui);
 assert.ok(Number.isSafeInteger(m.counts.catalog_editorial_pending)&&m.counts.catalog_editorial_pending>=0,'Propostas editoriais inválidas');
 for(const id of old.occupied)assert.ok(all.has(id),'ID da VS40 desapareceu: '+id);
 for(const id of old.active)if(!active.has(id))assert.ok(retired.has(id)&&active.has(ledger.redirects[id]),'ID ativo VS40 sem redirecionamento válido: '+id);
 for(const [id,target] of Object.entries(ledger.redirects))assert.ok(retired.has(id)&&active.has(target),'Redirecionamento inválido: '+id);
 const files=fs.readdirSync(path.join(root,'assets/catalog_lookup/cards')).filter(p=>p.endsWith('.json')).map(p=>p.slice(0,-5));
 assert.deepEqual(new Set(files),active,'Índice individual não corresponde aos cartões ativos');
};

/* V272 — regressão: contrato de versão e integridade dos incrementos Petrobras. */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.join(__dirname,'..');
const file=name=>fs.readFileSync(path.join(root,name),'utf8');
const manifest=JSON.parse(file('assets/version.json'));
const html=file('index.html'),versionHtml=file('v272.html');
const increments=JSON.parse(file('assets/estudos_incrementos_v267.json'));
const all=[];
for(let i=0;i<7;i++){
 const n='assets/cards_public_v194_'+String(i).padStart(3,'0')+'.json';
 const group=JSON.parse(file(n));
 assert.ok(Array.isArray(group),'lote válido '+n);
 all.push(...group);
}
assert.equal(manifest.version,'V272');
assert.equal(manifest.home,'v272.html');
assert.equal(html,versionHtml,'arquivo de entrada deve corresponder à versão');
assert.match(html,/add\.version!=='V267-PETRO17-PETRO20'/);
assert.doesNotMatch(html,/V269-PETRO17-PETRO20/);
assert.equal(increments.version,'V267-PETRO17-PETRO20');
assert.equal(all.length,1518);
assert.equal(new Set(all.map(x=>x.id)).size,1518);
assert.equal(all.filter(x=>x.active===true).length,1501);
assert.equal(increments.cards.length,19);
assert.equal(new Set(increments.cards.map(x=>x.id)).size,19);
const byId=new Map(all.map(c=>[c.id,c]));
for(const inc of increments.cards){
 assert.equal(byId.get(inc.id)?.active,true,'ID alvo existente e ativo: '+inc.id);
 assert.equal(typeof inc.expl_append,'string','adendo textual íntegro');
}
assert.equal(manifest.counts.card_entries_combined,1540);
console.log('V272: versão, HTML, 1.518 IDs, 19 incrementos e contagem pública conciliados');

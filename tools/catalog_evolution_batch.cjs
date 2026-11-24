'use strict';
// Evoluções de IDs existentes; novos IDs/consolidação exigem outro contrato.
const assert=require('node:assert/strict'),crypto=require('node:crypto');
const copy=x=>JSON.parse(JSON.stringify(x));
const digest=x=>crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex');
const nonempty=x=>typeof x==='string'&&x.trim().length>0;
function applyEvolutionBatch(snapshot,packet){
 assert.equal(packet.format,'BancoMestreEvolution1');
 assert.equal(packet.private_content_exported,false);
 assert.ok(Array.isArray(packet.revisions)&&packet.revisions.length>0);
 const p=copy(snapshot),map=new Map(p.base.map(c=>[c.id,c])),seen=new Set();
 for(const r of packet.revisions){
  assert.ok(Object.keys(r).every(k=>['id','title','front','back','source','mnemonic','modules','editorial','related_card_ids','expected_hash'].includes(k)),'Campo não permitido');
  const c=map.get(r.id);assert.ok(c&&c.active!==false&&!c.provisional&&!seen.has(r.id),'ID inválido: '+r.id);seen.add(r.id);
  assert.equal(digest(c),r.expected_hash,'Origem mudou: '+r.id);
  for(const k of ['title','front','back','source','mnemonic'])assert.ok(nonempty(r[k]),r.id+' '+k);
  assert.ok(Array.isArray(r.modules)&&r.modules.length===11);
  r.modules.forEach((m,i)=>assert.ok(m.ord===i+1&&nonempty(m.titulo)&&nonempty(m.texto)));
  assert.equal(new Set(r.modules.map(m=>m.texto.trim())).size,11);
  assert.equal(r.modules[0].texto,r.front);assert.equal(r.modules[1].texto,r.back);
  const prev=c.consolidation,oldProfile=prev?.profile||{},oldEditorial=oldProfile.editorial||{},e=r.editorial;
  assert.ok(e&&Array.isArray(e.answer_paragraphs)&&e.answer_paragraphs.join('\n\n')===r.back,'Verso divergente');
  assert.ok(Array.isArray(e.highlights)&&e.highlights.length>0,'Grifos ausentes');
  assert.ok(Array.isArray(e.media),'Inventário de mídias obrigatório');
  for(const old of oldEditorial.media||[])assert.ok(e.media.some(m=>JSON.stringify(m)===JSON.stringify(old)),'Mídia anterior alterada: '+old.id);
  for(const m of e.media)assert.ok(nonempty(m.id)&&nonempty(m.role)&&nonempty(m.src)&&!m.src.includes('..')&&m.src.startsWith('assets/'),'Mídia pública inválida');
  assert.ok(Array.isArray(r.related_card_ids));const links=[...new Set([...(c.related_card_ids||[]),...r.related_card_ids])];
  for(const id of links)assert.ok(id!==c.id&&map.has(id)&&map.get(id).active!==false,'Vínculo inválido: '+id);
  const previous=copy(c),historical=prev?.historical_ids||[c.id];
  const {expected_hash,...profile}=r;
  c.front=r.front;c.back=r.back;c.expl=r.modules.slice(2).filter(m=>m.ord!==8).map(m=>m.titulo+'\n'+m.texto).join('\n\n');c.mnemonic=r.mnemonic;
  c.related_card_ids=links;c.search_keywords=[...new Set([...(c.search_keywords||[]),r.title])];
  c.consolidation={...prev,primary_id:c.id,historical_ids:historical,original:prev?.original||{front:previous.front,back:previous.back,expl:previous.expl,reference:previous.reference,mnemonic:previous.mnemonic},previous_version:previous,profile:{...oldProfile,...profile,editorial:{...oldEditorial,...e,history_collapsed:true,reveal_after_attempt:true},related_card_ids:links}};
 }
 for(const id of seen){const c=map.get(id);for(const n of c.related_card_ids){const t=map.get(n);t.related_card_ids=[...new Set([...(t.related_card_ids||[]),id])];if(t.consolidation?.profile)t.consolidation.profile.related_card_ids=t.related_card_ids;}}
 if(p.consolidation){for(const k of ['primary_ids','historical_ids'])p.consolidation[k]=[...new Set([...(p.consolidation[k]||[]),...seen])];}
 assert.deepEqual(p.counts,snapshot.counts);assert.deepEqual(p.base.map(c=>c.id),snapshot.base.map(c=>c.id));
 return p;
}
module.exports={applyEvolutionBatch,digest};

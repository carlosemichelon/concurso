'use strict';
const assert=require('node:assert/strict');
const cp=x=>JSON.parse(JSON.stringify(x)),unique=x=>[...new Set(x)],nonempty=x=>typeof x==='string'&&x.trim().length>0;
function applyNewCards(snapshot,packet){
 assert.equal(packet.format,'BancoMestreNewCards1');assert.equal(packet.private_content_exported,false);assert.ok(Array.isArray(packet.new_cards)&&packet.new_cards.length);
 const p=cp(snapshot),map=new Map([...p.base,...p.ijui].map(c=>[c.id,c])),retired=new Set(p.retired_ids||[]),ids=new Set();
 for(const r of packet.new_cards){
  assert.match(r.id,/^CARD-\d{4,}$/);assert.ok(!map.has(r.id)&&!retired.has(r.id)&&!ids.has(r.id),'ID existente ou retirado: '+r.id);ids.add(r.id);
  for(const k of ['group','discipline','subject','sub','front','back','reference','mnemonic','title'])assert.ok(nonempty(r[k]),r.id+' '+k);
  assert.equal(r.active,true);assert.equal(r.modules.length,11);r.modules.forEach((m,i)=>assert.ok(m.ord===i+1&&nonempty(m.titulo)&&nonempty(m.texto)));assert.equal(new Set(r.modules.map(m=>m.texto)).size,11);assert.equal(r.modules[0].texto,r.front);assert.equal(r.modules[1].texto,r.back);assert.equal(r.editorial.answer_paragraphs.join('\n\n'),r.back);assert.ok(r.editorial.highlights.length&&r.editorial.highlights.every(x=>r.back.includes(x.text)));assert.ok(Array.isArray(r.editorial.media));
  assert.ok(!p.base.some(c=>c.active!==false&&c.front.trim()===r.front.trim()),'Frente duplicada '+r.id);
  const {id,group,discipline,subject,sub,front,back,reference,mnemonic,active}=r,expl=r.modules.slice(2).filter(x=>x.ord!==8).map(x=>x.titulo+'\n'+x.texto).join('\n\n');
  const card={id,group,discipline,subject,sub,front,back,expl,mnemonic,reference,active,related_card_ids:unique(r.related_card_ids),search_keywords:[r.title],consolidation:{primary_id:id,historical_ids:[id],original:{front,back,expl,mnemonic,reference},profile:{id,title:r.title,front,back,source:reference,mnemonic,modules:r.modules,editorial:r.editorial,related_card_ids:unique(r.related_card_ids),related_question_ids:[],satellites:[]}}};
  p.base.push(card);map.set(id,card);
 }
 for(const id of ids){const c=map.get(id);for(const n of c.related_card_ids){const t=map.get(n);assert.ok(n!==id&&t&&t.active!==false,'Vínculo inválido: '+id+' -> '+n);t.related_card_ids=unique([...(t.related_card_ids||[]),id]);if(t.consolidation?.profile)t.consolidation.profile.related_card_ids=t.related_card_ids;}}
 if(p.consolidation)for(const k of ['primary_ids','historical_ids'])p.consolidation[k]=unique([...(p.consolidation[k]||[]),...ids]);
 p.counts={canonical:p.base.length,active:p.base.filter(c=>c.active!==false).length,ijui:p.ijui.length};assert.equal(p.base.length,snapshot.base.length+ids.size);
 return p;
}
module.exports={applyNewCards};
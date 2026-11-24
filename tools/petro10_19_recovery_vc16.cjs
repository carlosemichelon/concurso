'use strict';
function applyRecovery16(p,packet){
 const map=new Map(p.base.map(c=>[c.id,c]));
 const ids=packet.revisions.map(r=>r.id);
 if(new Set(ids).size!==ids.length||packet.private_content_exported!==false)throw Error("Pacote inválido");
 for(const r of packet.revisions){
  const c=map.get(r.id);
  if(!c||c.active===false||c.consolidation||r.satellites.length||r.modules.length!==11||r.modules.some((x,i)=>x.ord!==i+1||!x.texto.trim()))throw Error("Evolução inválida "+r.id);
  const original={front:c.front,back:c.back,expl:c.expl,reference:c.reference,mnemonic:c.mnemonic};
  c.front=r.front;c.back=r.back;c.expl=r.modules.slice(2).filter(x=>x.ord!==8).map(x=>x.titulo+"\n"+x.texto).join("\n\n");c.mnemonic=r.mnemonic;
  c.related_card_ids=[...new Set([...(c.related_card_ids||[]),...r.related_card_ids])];
  if(c.related_card_ids.some(id=>id===c.id||!map.has(id)))throw Error("Vínculo inválido "+c.id);
  c.related_question_ids=[...new Set([...(c.related_question_ids||[]),...r.related_question_ids])];
  c.search_keywords=[...new Set([...(c.search_keywords||[]),r.title])];
  c.consolidation={primary_id:r.id,historical_ids:[r.id],source_catalog_blob:packet.source_catalog_blob,original,profile:{...r,related_card_ids:c.related_card_ids,history_ref:{snapshot:packet.source_catalog_blob,ids:[r.id]}}};
 }
 for(const r of packet.revisions){const c=map.get(r.id);for(const id of c.related_card_ids){const t=map.get(id);t.related_card_ids=[...new Set([...(t.related_card_ids||[]),c.id])];if(t.consolidation?.profile)t.consolidation.profile.related_card_ids=t.related_card_ids;}}
 p.consolidation.historical_ids=[...new Set([...p.consolidation.historical_ids,...ids])];
 p.consolidation.primary_ids=[...new Set([...p.consolidation.primary_ids,...ids])];
 p.recovery_vc16={source_catalog_blob:packet.source_catalog_blob,primary_ids:ids,redirects:{},private_srs_changed:false};return p;
}
module.exports={applyRecovery16};

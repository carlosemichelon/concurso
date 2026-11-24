'use strict';
function applyRecovery25(p,packet){
 const map=new Map(p.base.map(c=>[c.id,c])),ids=packet.revisions.map(r=>r.id);
 if(new Set(ids).size!==ids.length||packet.private_content_exported!==false)throw Error("Pacote inválido");
 for(const r of packet.revisions){
  const c=map.get(r.id),prev=c?.consolidation;
  if(!c||!prev||c.active===false||c.provisional||r.modules.length!==11||r.modules.some((x,i)=>x.ord!==i+1||!x.texto.trim()))throw Error("Evolução inválida "+r.id);
  if((prev.profile.editorial.media||[]).some(x=>!r.editorial.media.some(y=>x.id===y.id&&x.role===y.role)))throw Error("Perda de mídia "+r.id);
  const previous={front:c.front,back:c.back,expl:c.expl,mnemonic:c.mnemonic,consolidation:prev};
  c.front=r.front;c.back=r.back;c.expl=r.modules.slice(2).filter(x=>x.ord!==8).map(x=>x.titulo+"\n"+x.texto).join("\n\n");c.mnemonic=r.mnemonic;
  c.related_card_ids=[...new Set([...(c.related_card_ids||[]),...r.related_card_ids])];if(c.related_card_ids.some(id=>id===c.id||!map.has(id)))throw Error("Vínculo inválido "+r.id);
  c.related_question_ids=[...new Set([...(c.related_question_ids||[]),...r.related_question_ids])];
  c.search_keywords=[...new Set([...(c.search_keywords||[]),r.title])];
  c.consolidation={...prev,source_catalog_blob:packet.source_catalog_blob,previous_version:previous,profile:{...r,related_card_ids:c.related_card_ids,history_ref:{snapshot:packet.source_catalog_blob,ids:prev.historical_ids}}};
 }
 for(const r of packet.revisions){const c=map.get(r.id);for(const id of c.related_card_ids){const t=map.get(id);t.related_card_ids=[...new Set([...(t.related_card_ids||[]),c.id])];if(t.consolidation?.profile)t.consolidation.profile.related_card_ids=t.related_card_ids;}}
 p.recovery_vc25={source_catalog_blob:packet.source_catalog_blob,primary_ids:ids,redirects:{},private_srs_changed:false};return p;
}
module.exports={applyRecovery25};

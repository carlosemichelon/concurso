'use strict';
function applyRecovery5(p,packet){
 const old=new Map(p.base.map(c=>[c.id,c])),rev=packet.revisions,all=rev.flatMap(r=>[r.id,...r.satellites]);
 if(new Set(all).size!==all.length||all.some(id=>!old.has(id)||old.get(id).active===false))throw Error("IDs de recuperação inválidos");
 const alias=new Map(rev.flatMap(r=>r.satellites.map(s=>[s,r.id]))),previous=p.consolidation?.redirects||{},canon=id=>alias.get(previous[id]||id)||previous[id]||id;
 const active=new Set(p.base.filter(c=>!alias.has(c.id)).map(c=>c.id)),rewrite=(arr,self)=>[...new Set((arr||[]).map(canon))].filter(id=>id!==self&&active.has(id));
 for(const r of rev){
  const c=old.get(r.id),src=[c,...r.satellites.map(s=>old.get(s))];
  if(r.modules.length!==11||r.modules.some((x,i)=>x.ord!==i+1||!x.texto.trim()))throw Error("Módulos "+r.id);
  const original={front:c.front,back:c.back,expl:c.expl,reference:c.reference,mnemonic:c.mnemonic};
  c.front=r.front;c.back=r.back;c.expl=r.modules.slice(2).filter(x=>x.ord!==8).map(x=>x.titulo+"\n"+x.texto).join("\n\n");c.mnemonic=r.mnemonic;
  c.related_card_ids=rewrite(src.flatMap(x=>x.related_card_ids||[]).concat(r.related_card_ids),r.id);
  c.related_question_ids=[...new Set(src.flatMap(x=>x.related_question_ids||[]).concat(r.related_question_ids))];
  c.search_keywords=[...new Set([...(c.search_keywords||[]),...r.satellites,r.title])];
  c.consolidation={primary_id:r.id,historical_ids:[r.id,...r.satellites],source_catalog_blob:packet.source_catalog_blob,original,profile:{...r,related_card_ids:c.related_card_ids,history_ref:{snapshot:packet.source_catalog_blob,ids:[r.id,...r.satellites]}}};
 }
 p.base=p.base.filter(c=>!alias.has(c.id));
 for(const c of p.base)if(Array.isArray(c.related_card_ids))c.related_card_ids=rewrite(c.related_card_ids,c.id);
 const map=new Map(p.base.map(c=>[c.id,c]));
 for(const r of rev){const c=map.get(r.id);for(const id of c.related_card_ids){const t=map.get(id);t.related_card_ids=[...new Set([...(t.related_card_ids||[]),c.id])];}}
 for(const c of p.base)if(c.consolidation?.profile)c.consolidation.profile.related_card_ids=c.related_card_ids||[];
 p.retired_ids=[...new Set([...(p.retired_ids||[]),...alias.keys()])].sort();
 p.consolidation.redirects={...Object.fromEntries(Object.entries(previous).map(([id,target])=>[id,alias.get(target)||target])),...Object.fromEntries(alias)};
 p.consolidation.historical_ids=[...new Set([...p.consolidation.historical_ids,...all])];p.consolidation.primary_ids=[...new Set([...p.consolidation.primary_ids,...rev.map(x=>x.id)])];
 p.recovery_vc5={source_catalog_blob:packet.source_catalog_blob,primary_ids:rev.map(x=>x.id),redirects:Object.fromEntries(alias),private_srs_changed:false};
 p.counts={canonical:p.base.length,active:p.base.filter(c=>c.active!==false).length,ijui:p.ijui.length};return p;
}
module.exports={applyRecovery5};

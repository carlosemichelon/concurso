'use strict';
function applyTRT(p,records,files){
 const ids=new Set(records.map(r=>r.id)), map=new Map(p.base.map(c=>[c.id,c]));
 if(ids.size!==14||records.length!==14)throw Error("TRT: identidade duplicada ou incompleta");
 for(const [i,r] of records.entries()){
  if(!/^TRT0[12]-C\d{3}$/.test(r.id)||map.has(r.id)||(p.retired_ids||[]).includes(r.id))throw Error("TRT: colisão "+r.id);
  if(!r.front||!r.back||r.layers?.length!==11||r.layers.some((l,n)=>l.ord!==n+1||!l.titulo||!l.texto))throw Error("TRT: conteúdo incompleto "+r.id);
  const related=[...new Set(r.related_operational_card_ids||r.related_card_ids||[])];
  if(related.some(id=>!ids.has(id)))throw Error("TRT: relação não resolvida "+r.id);
  const c={id:r.id,group:"LEGISLACAO",discipline:r.discipline,subject:r.subject,sub:r.sub||r.subject,front:r.front,back:r.back,reference:(r.laws||[]).map(l=>[l.norm,l.article].filter(Boolean).join(" · ")).join("; ")||r.subject,active:true,canonical:true,related_card_ids:related,related_question_ids:[...new Set([r.question_id,...(r.related_question_ids||[])].filter(Boolean))],related_image_ids:(r.images||[]).map(m=>m.id),trt_source:files[i],origin:"TRT"};
  p.base.push(c);map.set(c.id,c);
 }
 for(const id of ids){const c=map.get(id);for(const next of c.related_card_ids){const other=map.get(next);if(!other.related_card_ids.includes(id))other.related_card_ids.push(id)}}
 p.counts={canonical:p.base.length,active:p.base.filter(c=>c.active!==false).length,ijui:p.ijui.length};
 return p;
}
module.exports={applyTRT};

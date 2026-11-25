// Injected only by isolated authenticated test host; not enabled in production.
(function(){'use strict';
 Object.defineProperty(window,'BMVS41PrivateCards',{value:Object.freeze({async read(){
  const r=await fetch('/api/vs41/private-cards',{credentials:'same-origin',cache:'no-store',redirect:'error'});
  if(!r.ok)throw Error('Catálogo privado indisponível (HTTP '+r.status+')');
  const p=await r.json();if(p.schema!=='BM-VS41-PRIVATE-CARDS/1'||!Array.isArray(p.records)||p.records.length>20000)throw Error('Resposta privada inválida');
  const ids=new Set();for(const c of p.records){if(!/^CARD-[0-9]{4,12}$/.test(c.id)||ids.has(c.id)||typeof c.front!=='string'||!c.front.trim()||typeof c.back!=='string'||!c.back.trim()||typeof c.active!=='boolean')throw Error('Cartão privado inválido');ids.add(c.id)}
  return {base:p.records,ijui:[],meta:{card_files:[],image_files:[],groups:[],counts:{}},globals:{},guideData:{questoes:{},cobertura_leis:[],pendencias_pos_checkpoint:[]},generalGuide:{por_id:{}},auditF17:{historico_por_id:{},vinculos_indiretos:[],evolucoes_registradas:[]},answersF17:{por_id:{}},consolidation:{redirects:{}}};
 }})});
})();

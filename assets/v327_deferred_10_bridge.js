/* V327 — 10 módulos didáticos completos por ID existente (V174); não alterar origem, SRS, lacunas e mídias. */
(function(){
  'use strict';
  const previous = window.BM276LayerData;
  const target = new Set(["CARD-0138","CARD-0194","CARD-0248","CARD-0286","CARD-0350","CARD-0424","CARD-0445","CARD-0502","CARD-0509","CARD-0510"]);
  let pending = null;
  async function load(){
    if(!pending){
      pending = fetch('assets/layers_public_v327_deferred_10.json?v=327-1',{cache:'no-store'})
        .then(async r => { if(!r.ok) throw Error('V327: HTTP '+r.status); return await r.json(); })
        .then(obj => {
          if(obj.format!=='BancoMestrePublicLayersV327' || obj.n_records!==10 || !Array.isArray(obj.records) || obj.records.length!==10){
            throw Error('V327: formato ou contagem inválida');
          }
          const map=new Map();
          for(const card of obj.records){
            if(!target.has(card.id) || map.has(card.id) || !Array.isArray(card.layers) || card.layers.length!==11 ||
               card.layers.some((l,i)=>l.ord!==i+1 || !l.titulo?.trim?.() || !l.texto?.trim?.())){
              throw Error('V327: registro inválido '+card.id);
            }
            map.set(card.id,card);
          }
          if(map.size!==target.size)throw Error('V327: cartões ausentes');
          return map;
        }).catch(e=>{pending=null; throw e;});
    }
    return pending;
  }
  async function get(id){
    if(!target.has(id))return previous?.get?.(id) ?? null;
    const map=await load();
    return map.get(id);
  }
  window.BM276LayerData=Object.freeze({
    has:id=>target.has(id)||(previous?.has?.(id)??false),
    get
  });
  window.BM327LayerSync=Object.freeze({status:'publico_sem_srs',count:target.size,source:'V174',pending:['CARD-0693']});
})();

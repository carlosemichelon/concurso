/* V329: complementação didática CARD-0693 (mineralogia); SRS, originais e mídia preservados. */
(function(){
 'use strict';
 const prior=window.BM276LayerData;
 const id='CARD-0693';
 let pending=null;
 async function load(){
  if(!pending){
   pending=fetch('assets/layers_public_v329_0693.json?v=329-1',{cache:'no-store'})
    .then(async r=>{if(!r.ok)throw Error('V329: HTTP '+r.status);return await r.json();})
    .then(d=>{
     if(d.format!=='BancoMestrePublicLayersV329'||d.n_records!==1||
        !Array.isArray(d.records)||d.records.length!==1||d.records[0].id!==id||
        !Array.isArray(d.records[0].layers)||d.records[0].layers.length!==11||
        d.records[0].layers.some((l,i)=>l.ord!==i+1||!l.titulo?.trim?.()||!l.texto?.trim?.())){
       throw Error('V329: card record invalid');
     }
     return d.records[0];
    }).catch(e=>{pending=null;throw e;});
  }
  return pending;
 }
 async function get(k){return k===id ? await load() : (prior?.get?.(k)??null);}
 window.BM276LayerData=Object.freeze({has:k=>k===id||(prior?.has?.(k)??false),get});
 window.BM329MineralsSync=Object.freeze({n:1,source:'V175',primary_official_exam_answer_verified:false,srs:false});
})();

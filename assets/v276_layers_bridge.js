/* V276: complemento por ID dos 11 módulos publicados; leitura sob demanda, sem SRS ou dados privados. */
(function(){
'use strict';
if(window.BM276LayerData)return;
const known=new Set(["CARD-0118","CARD-0175","CARD-0333","CARD-0468","CARD-0480","CARD-0543","CARD-0547","CARD-0548","CARD-0549","CARD-0551","CARD-0552","CARD-0553","CARD-0579","CARD-0621","CARD-0623","CARD-0624","CARD-0625","CARD-0626","CARD-0629","CARD-0631","CARD-0632","CARD-0642","CARD-1033","CARD-1034","CARD-1386","CARD-1520","CARD-1521","CARD-1522","CARD-1523","CARD-1524","CARD-1525","CARD-1526","CARD-1527","CARD-1528","CARD-1529","CARD-1530","CARD-1531","CARD-1532","CARD-1533","CARD-1413","CARD-1534","CARD-0578","CARD-0924"]);
const cache=new Map();
const source=id=>(id==='CARD-0578'||id==='CARD-0924')?'assets/v277_petro22_relacionados_layers.json?v=277-1':(id==='CARD-1413'||id==='CARD-1534')?'assets/v276_petro22_public_layers.json?v=276-1':'assets/layers_public_v274_sync.json?v=274-1';
async function get(id){
 if(!known.has(id))return null;
 const path=source(id);
 if(!cache.has(path)){
  const p=fetch(path,{cache:'default'}).then(r=>{if(!r.ok)throw Error('Camadas adicionais HTTP '+r.status);return r.json()}).then(obj=>{
   if(!Array.isArray(obj.records))throw Error('Camadas adicionais inválidas');
   const map=new Map();
   for(const it of obj.records){
    if(!it.id||map.has(it.id)||!Array.isArray(it.layers)||it.layers.length!==11||it.layers.some((v,i)=>v.ord!==i+1||!v.titulo||!v.texto))throw Error('11 módulos inválidos: '+it.id);
    map.set(it.id,it);
   }return map;
  });
  cache.set(path,p);p.catch(()=>{if(cache.get(path)===p)cache.delete(path)});
 }
 return (await cache.get(path)).get(id)||null;
}
window.BM276LayerData=Object.freeze({has:id=>known.has(id),get});
})();
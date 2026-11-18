/* V242: ponte do cartão existente PETRO14-C014 para leitor único V165.
 * O material íntegro vem de arquivo técnico verificado no Drive; SRS intocado. */
(function(){
'use strict';
if(window.BM242OperationalCards)return;
const FILES=Object.freeze({'PETRO14-C014':'assets/petro14_c014_v242.json'});
const cache=new Map();
function has(id){return Object.prototype.hasOwnProperty.call(FILES,id)}
function getRecord(id){
 if(!has(id))return null;
 return cache.get(id)||{
  id,front:'Carregando pergunta original do cartão '+id+'…',
  back:'Fluência rápida: primeiras 24 horas após o carregamento, parcela irreversível.',
  discipline:'Engenharia Civil',subject:'Estruturas de concreto',sub:'Fluência e retração',
  operational:true,cardSource:'PETRO14'};
}
async function loadRecord(id){
 if(!has(id))throw Error('Cartão operacional inexistente: '+id);
 if(cache.has(id))return cache.get(id);
 const res=await fetch(FILES[id]+'?v=242',{cache:'no-store'});
 if(!res.ok)throw Error('O arquivo do cartão não foi carregado (HTTP '+res.status+')');
 const x=await res.json();
 if(x.id!==id||!Array.isArray(x.layers)||x.layers.length!==11||
 x.layers.some((layer,i)=>layer.ord!==i+1||!String(layer.titulo||'').trim()||!String(layer.texto||'').trim()))
 throw Error('Cartão operacional não contém os 11 módulos integrais');
 cache.set(id,x);return x;
}
window.BM242OperationalCards=Object.freeze({has,getRecord,loadRecord,ids:Object.keys(FILES)});
void loadRecord('PETRO14-C014').catch(e=>console.warn('V242: o cartão será carregado quando aberto',e.message));
})();
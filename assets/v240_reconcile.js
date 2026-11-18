/* V240 — conciliação 3-vias conservadora. NÃO grava Drive, SRS ou outros dados. */
(function(global){
'use strict';
function equal(a,b){return JSON.stringify(a)===JSON.stringify(b)}
function copy(a){return a===undefined?undefined:JSON.parse(JSON.stringify(a))}
const COLLECTIONS=['subjects','sessions','reviews','plans','audit'];
const SCALARS=['cycle','cycleIndex','availabilityWeek','availabilityMonth','activeTimer'];
function validate(doc){
 if(!doc||doc.schema!==1)return 'Esquema inválido';
 for(const key of ['subjects','sessions','reviews','cycle'])
  if(!Array.isArray(doc[key]))return 'Coleção obrigatória inválida: '+key;
 for(const key of ['plans','audit'])
  if(doc[key]!==undefined&&!Array.isArray(doc[key]))return 'Coleção opcional inválida: '+key;
 for(const key of COLLECTIONS){
  const seen=new Set();
  for(const item of doc[key]||[]){
   if(!item||typeof item.id!=='string'||!item.id||seen.has(item.id))return 'ID duplicado ou inválido em '+key;
   seen.add(item.id);
  }
 }
 const subjects=new Set(doc.subjects.map(x=>x.id));
 for(const key of ['sessions','reviews','plans'])
  for(const item of doc[key]||[]){
   if(item.subjectId!==undefined&&!subjects.has(item.subjectId))
    return 'Referência inválida: '+key+'/'+item.id+' → '+item.subjectId;
  }
 return null;
}
function reconcile(base,local,remote){
 const bad=[base,local,remote].map(validate);
 if(bad.some(Boolean))return {ok:false,conflicts:bad.map((x,i)=>x?['base','local','remote'][i]+': '+x:null).filter(Boolean),merged:null};
 const conflicts=[],out={schema:1};
 const sources={base,local,remote};
 for(const key of COLLECTIONS){
  const maps=Object.fromEntries(Object.entries(sources).map(([name,doc])=>[name,new Map((doc[key]||[]).map(x=>[x.id,x]))]));
  const ids=new Set([...maps.base.keys(),...maps.local.keys(),...maps.remote.keys()]);
  out[key]=[];
  for(const id of ids){
   const b=maps.base.get(id),l=maps.local.get(id),r=maps.remote.get(id);
   const changedL=!equal(b,l),changedR=!equal(b,r);
   if(changedL&&changedR&&!equal(l,r)){
    conflicts.push(key+'/'+id+' alterado de maneiras diferentes');continue;
   }
   const chosen=changedL?l:changedR?r:b;
   if(chosen!==undefined)out[key].push(copy(chosen));
  }
 }
 for(const key of SCALARS){
  const b=base[key],l=local[key],r=remote[key];
  const changedL=!equal(b,l),changedR=!equal(b,r);
  if(changedL&&changedR&&!equal(l,r)){
   conflicts.push(key+' modificado de maneiras diferentes');continue;
  }
  const selected=changedL?l:changedR?r:b;
  if(selected!==undefined)out[key]=copy(selected);
 }
 // New optional fields require an explicit schema upgrade; never silently discard.
 const known=new Set(['schema',...COLLECTIONS,...SCALARS]);
 for(const key of new Set([...Object.keys(base),...Object.keys(local),...Object.keys(remote)])){
  if(known.has(key))continue;
  const b=base[key],l=local[key],r=remote[key];
  if(!equal(b,l)||!equal(b,r))conflicts.push('Campo desconhecido divergente: '+key);
  else out[key]=copy(b);
 }
 const invalid=validate(out);
 if(invalid)conflicts.push('Resultado não atende integridade: '+invalid);
 return {ok:conflicts.length===0,conflicts,merged:conflicts.length?null:out,
  summary:conflicts.length?conflicts.length+' conflito(s) impeditivo(s)':'Alterações independentes conciliáveis, mediante verificação do Drive'};
}
global.BM240Reconcile=Object.freeze({reconcile,validate});
})(window);

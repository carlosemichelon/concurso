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
 // Datas de sessões não representam relógios independentes: impedir soma de horas
 // potencialmente simultâneas criadas offline em dois aparelhos distintos.
 function minutesWindow(row){
  if(!row||row.deletedAt||typeof row.date!=='string'||typeof row.startTime!=='string')return null;
  const match=row.startTime.match(/^([01]\\d|2[0-3]):([0-5]\\d)$/);
  const date=row.date.match(/^(\\d{4})-(\\d{2})-(\\d{2})$/);
  const length=Number(row.minutes);
  if(!match||!date||!Number.isFinite(length)||length<=0||length>1440)return null;
  const start=Date.UTC(Number(date[1]),Number(date[2])-1,Number(date[3]),Number(match[1]),Number(match[2]))/60000;
  return {start,end:start+length};
 }
 const baseSessionIds=new Set(base.sessions.map(s=>s.id));
 const newlyLocal=local.sessions.filter(s=>!baseSessionIds.has(s.id)&&!s.deletedAt);
 const newlyRemote=remote.sessions.filter(s=>!baseSessionIds.has(s.id)&&!s.deletedAt);
 for(const l of newlyLocal)for(const r of newlyRemote){
  if(l.id===r.id||!l.date||!r.date)continue;
  const a=minutesWindow(l),b=minutesWindow(r);
  if(a&&b){
   if(a.start<b.end&&b.start<a.end)
    conflicts.push('Sessões potencialmente simultâneas: '+l.id+' / '+r.id+' — contagem dupla bloqueada');
  }else if(l.date===r.date){
   conflicts.push('Horários insuficientes para afastar sobreposição em '+l.date+': '+l.id+' / '+r.id);
  }
 }
 if(out.activeTimer&&(out.activeTimer.running||out.activeTimer.transferPending||out.activeTimer.availableForTransfer))
  conflicts.push('Cronômetro/transferência ainda ativo em um aparelho; conciliação bloqueada');

 const invalid=validate(out);
 if(invalid)conflicts.push('Resultado não atende integridade: '+invalid);
 return {ok:conflicts.length===0,conflicts,merged:conflicts.length?null:out,
  summary:conflicts.length?conflicts.length+' conflito(s) impeditivo(s)':'Alterações independentes conciliáveis, mediante verificação do Drive'};
}
global.BM240Reconcile=Object.freeze({reconcile,validate});
})(window);

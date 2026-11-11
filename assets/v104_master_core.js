/* V104 — núcleo determinístico do ÚNICO mestre ativo.
 * Sem rede. Preserva divergências em conflicts[] e nunca remove marcações.
 * O sync V103 fornece captura segura, escopo das chaves e merge local.
 */
(function(){
'use strict';
if(window.BancoMestreGrifosMasterV104)return;
const legacy=window.BancoMestreGrifosSyncCoreV103;
if(!legacy)return;
const SCHEMA='BancoMestreGrifosMasterV104',MAX_BYTES=legacy.LIMIT_BYTES,
 MAX_CONFLICTS=3000,MAX_RECORDS=10000;
const literal=x=>JSON.stringify(x);
const same=(a,b)=>literal(a)===literal(b);
const identity=m=>m&&typeof m==='object'&&typeof m.id==='string'&&m.id.trim()?
 'id:'+m.id:'legacy:'+literal(m);
const bucket=(key,id)=>key+'\u0000'+id;
function validateRecords(records){
 const fake={schema:legacy.SCHEMA,device:'MASTER-V104-0000',
  generated_at:new Date().toISOString(),records};
 legacy.validate(fake);
 return records;
}
function empty(){
 return {schema:SCHEMA,revision:0,updated_at:new Date().toISOString(),
  records:{},conflicts:[]};
}
function validate(master){
 if(!master||master.schema!==SCHEMA||!Number.isSafeInteger(master.revision)||
    master.revision<0||!master.records||typeof master.records!=='object'||
    Array.isArray(master.records)||!Array.isArray(master.conflicts)||
    master.conflicts.length>MAX_CONFLICTS)throw Error('Mestre de grifos inválido');
 validateRecords(master.records);
 if(literal(master).length>MAX_BYTES)throw Error('Mestre acima de 12 MB');
 for(const c of master.conflicts){
  if(!c||!legacy.validKey(c.key)||typeof c.id!=='string'||
     !Array.isArray(c.variants)||c.variants.length<2||c.variants.length>50||
     c.variants.some(v=>typeof v!=='string'||v.length>400000))
   throw Error('Registro de conflito inválido');
 }
 return master;
}
function merge(master,snapshots){
 const source=master?validate(master):empty();
 if(!Array.isArray(snapshots)||snapshots.length>40)throw Error('Mais de 40 origens; interrompido');
 const records={...source.records},conflictMap=new Map();
 function appendConflict(key,id,values){
  const name=bucket(key,id),entry=conflictMap.get(name)||{key,id,variants:[]};
  for(const v of values){const raw=typeof v==='string'?v:literal(v);
   if(!entry.variants.includes(raw))entry.variants.push(raw);
  }
  if(entry.variants.length>1)conflictMap.set(name,entry);
 }
 for(const c of source.conflicts)appendConflict(c.key,c.id,c.variants);
 let inserted=0;
 function add(key,newText){
  if(!legacy.validKey(key))throw Error('Chave fora do catálogo de grifos');
  // Validate JSON and array shape using the existing V103 parser.
  validateRecords({[key]:newText});
  if(!Object.hasOwn(records,key)){records[key]=newText;inserted++;return}
  const oldVal=JSON.parse(records[key]),newVal=JSON.parse(newText);
  if(key==='BM062_GRIFOS_META'){
   const output={...oldVal};
   for(const [id,value] of Object.entries(newVal)){
    if(!Object.hasOwn(output,id)){output[id]=value;inserted++}
    else if(!same(output[id],value))appendConflict(key,'meta:'+id,[output[id],value]);
   }
   records[key]=literal(output);
   return;
  }
  const output=oldVal.slice(),known=new Map(oldVal.map(m=>[identity(m),m]));
  for(const m of newVal){
   const id=identity(m);
   if(!known.has(id)){known.set(id,m);output.push(m);inserted++}
   else if(!same(known.get(id),m))appendConflict(key,id,[known.get(id),m]);
  }
  records[key]=literal(output);
 }
 for(const snap of snapshots){
  const data=snap?.schema===SCHEMA?validate(snap).records:
   legacy.validate(snap);
  for(const [key,value] of Object.entries(data))add(key,value);
  if(snap?.schema===SCHEMA)
   for(const c of snap.conflicts)appendConflict(c.key,c.id,c.variants);
 }
 const conflicts=[...conflictMap.values()];
 if(conflicts.length>MAX_CONFLICTS)throw Error('Há conflitos demais; exporte backup e revise');
 const result={
  schema:SCHEMA,revision:source.revision,updated_at:source.updated_at,
  records,conflicts
 };
 validate(result);
 return {master:result,inserted,conflicts:conflicts.length,
  changed:!same(source.records,records)||!same(source.conflicts,conflicts)};
}
function contains(master,snapshot){
 validate(master);
 const source=snapshot?.schema===SCHEMA?validate(snapshot).records:legacy.validate(snapshot);
 const conflicts=new Map(master.conflicts.map(c=>[bucket(c.key,c.id),c.variants]));
 let missing=0;
 for(const [key,text] of Object.entries(source)){
  if(!Object.hasOwn(master.records,key)){missing++;continue}
  const canonical=JSON.parse(master.records[key]),items=JSON.parse(text);
  if(key==='BM062_GRIFOS_META'){
   for(const [id,value] of Object.entries(items)){
    if(Object.hasOwn(canonical,id)&&same(canonical[id],value))continue;
    if(!conflicts.get(bucket(key,'meta:'+id))?.includes(literal(value)))missing++;
   }
  }else{
   const known=new Map(canonical.map(m=>[identity(m),literal(m)]));
   for(const mark of items){
    const id=identity(mark),value=literal(mark);
    if(known.get(id)===value||conflicts.get(bucket(key,id))?.includes(value))continue;
    missing++;
   }
  }
 }
 return {ok:missing===0,missing};
}
function final(master){
 const checked=validate(master);
 return {...checked,revision:checked.revision+1,updated_at:new Date().toISOString()};
}
window.BancoMestreGrifosMasterV104=Object.freeze({
 SCHEMA,empty,validate,merge,contains,final
});
})();
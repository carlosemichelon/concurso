/* V122: mestre privado conserva grifos ativos e pequenos IDs de exclusão (sem conteúdo apagado). */
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
const identity=legacy.markId;
const moreRecent=(a,b)=>(Date.parse(b?.bm108_changed_at||'')||0)>(Date.parse(a?.bm108_changed_at||'')||0);
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
 // Reunir primeiro todas as exclusões, inclusive registros arquivados legados.
 let deletions=source.records[legacy.DELETIONS]?
   legacy.parse(legacy.DELETIONS,source.records[legacy.DELETIONS]):{};
 for(const snap of snapshots){
  const data=snap?.schema===SCHEMA?validate(snap).records:legacy.validate(snap);
  if(data[legacy.DELETIONS])
   deletions=legacy.mergeDeletions(deletions,
    legacy.parse(legacy.DELETIONS,data[legacy.DELETIONS]));
  for(const [page,text] of Object.entries(data)){
   if(!page.startsWith('BM030_STROKES_PDF:'))continue;
   for(const mark of legacy.parse(page,text)){
    if(!mark?.bm108_deleted_at)continue;
    deletions=legacy.mergeDeletions(deletions,
     {[page]:{[identity(mark)]:mark.bm108_deleted_at}});
   }
  }
 }

 let inserted=0;
 function add(key,newText){
  if(key===legacy.DELETIONS)return;
  if(!legacy.validKey(key))throw Error('Chave fora do catálogo de grifos');
  // Validate JSON and array shape using the existing V103 parser.
  validateRecords({[key]:newText});
  if(!Object.hasOwn(records,key)){records[key]=newText;inserted++;return}
  const oldVal=JSON.parse(records[key]),newVal=JSON.parse(newText);
  if(key==='BM062_GRIFOS_META'){
   const output={...oldVal};
   for(const [id,value] of Object.entries(newVal)){
    if(!Object.hasOwn(output,id)){output[id]=value;inserted++}
    else if(!same(output[id],value)){
     const earlier=output[id];
     if(moreRecent(earlier,value))output[id]=value;
     appendConflict(key,'meta:'+id,[earlier,value]);
    }
   }
   records[key]=literal(output);
   return;
  }
  const output=oldVal.slice(),known=new Map(oldVal.map((m,i)=>[identity(m),i]));
  for(const m of newVal){
   const id=identity(m),at=known.get(id);
   if(at===undefined){known.set(id,output.length);output.push(m);inserted++}
   else if(!same(output[at],m)){
    const earlier=output[at];
    if(moreRecent(earlier,m))output[at]=m;
    appendConflict(key,id,[earlier,m]);
   }
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

 // Nenhum conteúdo de grifo excluído permanece no arquivo mestre nem em conflitos.
 for(const [page,items] of Object.entries(deletions)){
  if(!page.startsWith('BM030_STROKES_PDF:'))continue;
  if(Object.hasOwn(records,page)){
   const raw=JSON.parse(records[page]);
   const next=legacy.cleanPage(page,raw,deletions);
   if(next.length)records[page]=literal(next);else delete records[page];
  }
  for(const [bucketKey,entry] of conflictMap){
   if(entry.key!==page)continue;
   if(Object.hasOwn(items,entry.id)){conflictMap.delete(bucketKey);continue}
   // Variantes antigas usavam identidades longas para grifos sem texto.
   const matches=entry.variants.some(raw=>{
    try{return Object.hasOwn(items,identity(JSON.parse(raw)))}catch{return false}
   });
   if(matches)conflictMap.delete(bucketKey);
  }
 }
 if(records['BM062_GRIFOS_META']){
  const data=JSON.parse(records['BM062_GRIFOS_META']);
  for(const [page,items] of Object.entries(deletions)){
   const m=/^BM030_STROKES_PDF:(.+):([^:]+):P\d+$/.exec(page);
   if(!m)continue;
   for(const ident of Object.keys(items)){
    if(!ident.startsWith('id:'))continue;
    const k='TXT:'+m[1]+':'+m[2]+':'+ident.slice(3);
    delete data[k];conflictMap.delete(bucket('BM062_GRIFOS_META','meta:'+k));
   }
  }
  records['BM062_GRIFOS_META']=literal(data);
 }
 if(Object.keys(deletions).length)records[legacy.DELETIONS]=literal(deletions);
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
 const deleted=master.records[legacy.DELETIONS]?
  legacy.parse(legacy.DELETIONS,master.records[legacy.DELETIONS]):{};
 let missing=0;
 for(const [key,text] of Object.entries(source)){
  const items=legacy.parse(key,text);
  if(key===legacy.DELETIONS){
   for(const [page,ids] of Object.entries(items))
    for(const id of Object.keys(ids))if(!deleted[page]?.[id])missing++;
   continue;
  }
  if(key==='BM062_GRIFOS_META'){
   const canonical=master.records[key]?JSON.parse(master.records[key]):{};
   for(const [id,value] of Object.entries(items)){
    const deletedMeta=Object.entries(deleted).some(([page,ids])=>{
     const m=/^BM030_STROKES_PDF:(.+):([^:]+):P\d+$/.exec(page);
     return m&&Object.keys(ids).some(x=>x.startsWith('id:')&&id==='TXT:'+m[1]+':'+m[2]+':'+x.slice(3));
    });
    if(deletedMeta)continue;
    if(Object.hasOwn(canonical,id)&&same(canonical[id],value))continue;
    if(!conflicts.get(bucket(key,'meta:'+id))?.includes(literal(value)))missing++;
   }
   continue;
  }
  const canonical=master.records[key]?JSON.parse(master.records[key]):[];
  const known=new Map(canonical.map(m=>[identity(m),literal(m)]));
  for(const mark of items){
   const id=identity(mark),value=literal(mark);
   if(mark?.bm108_deleted_at||deleted[key]?.[id])continue;
   if(known.get(id)===value||conflicts.get(bucket(key,id))?.includes(value))continue;
   missing++;
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
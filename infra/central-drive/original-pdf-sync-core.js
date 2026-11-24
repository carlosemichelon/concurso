/* V122 — sincronização de grifos sem arquivar a marcação removida.
   Exclusão é um ID mínimo no mapa privado; cor, texto, retângulos e notas
   do grifo apagado não são conservados. Impede restauração de cópias antigas. */
(function(){
'use strict';
if(window.BancoMestreGrifosSyncCoreV103)return;
const SCHEMA='BancoMestreGrifosSyncV103';
const META='BM062_GRIFOS_META', DELETIONS='BM122_DELETED_HIGHLIGHT_IDS';
const PREFIXES=['BM030_STROKES_PDF:','BM102_PDF_HIGHLIGHT_JOINS:'];
const LIMIT_BYTES=12000000,LIMIT_KEYS=10000,LIMIT_MARKS=100000;
const isPage=k=>typeof k==='string'&&k.startsWith('BM030_STROKES_PDF:');
const validKey=k=>typeof k==='string'&&k.length<500&&(PREFIXES.some(p=>k.startsWith(p))||k===META||k===DELETIONS);
const literal=x=>JSON.stringify(x);
const now=()=>new Date().toISOString();
const deletedMap=x=>{
 if(!x||typeof x!=='object'||Array.isArray(x))throw Error('Índice de exclusões inválido');
 for(const [page,ids] of Object.entries(x)){
  if(!isPage(page)||page.length>500||!ids||typeof ids!=='object'||Array.isArray(ids))throw Error('Página de exclusão inválida');
  for(const [id,stamp] of Object.entries(ids))
   if(!/^(?:id:[A-Za-z0-9_-]{4,160}|g:[a-f0-9]{16}|l:[a-f0-9]{16})$/.test(id)||
     typeof stamp!=='string'||!Number.isFinite(Date.parse(stamp)))throw Error('Identidade de exclusão inválida');
 }
 return x;
};
function hexHash(input){
 // Estável entre navegadores e não reversível em informações de texto/cor.
 let a=2166136261,b=2246822519;for(let i=0;i<input.length;i++){
  const c=input.charCodeAt(i);
  a=Math.imul(a^c,16777619)>>>0;
  b=Math.imul(b^(c+(i&255)),3266489917)>>>0;
 }
 return a.toString(16).padStart(8,'0')+b.toString(16).padStart(8,'0');
}
function markId(m){
 if(m&&typeof m.id==='string'&&/^[A-Za-z0-9_-]{4,160}$/.test(m.id))return 'id:'+m.id;
 if(m&&typeof m.type==='string'&&(Array.isArray(m.points)||Array.isArray(m.box)||Array.isArray(m.rects)))
  return 'g:'+hexHash(literal([m.type,m.points||m.box||m.rects,m.created_at||'']));
 return 'l:'+hexHash(literal(m));
}
const markTimestamp=m=>Date.parse(m?.bm108_deleted_at||m?.bm108_changed_at||m?.updated_at||'')||0;
function mergeDeletions(a={},b={}){
 deletedMap(a);deletedMap(b);const out={};
 for(const [page,ids] of Object.entries(a))out[page]={...ids};
 for(const [page,ids] of Object.entries(b)){
  if(!out[page])out[page]={};
  for(const [id,stamp] of Object.entries(ids))
   if(!out[page][id]||Date.parse(stamp)>Date.parse(out[page][id]))out[page][id]=stamp;
 }
 return out;
}
function parse(key,text){
 if(typeof text!=='string'||text.length>LIMIT_BYTES)throw Error('Arquivo de grifos excede o limite');
 const value=JSON.parse(text);
 if(key===DELETIONS)return deletedMap(value);
 if(key===META){
  if(!value||typeof value!=='object'||Array.isArray(value))throw Error('Metadados inválidos');
 }else if(!Array.isArray(value)||value.length>LIMIT_MARKS)throw Error('Lista de marcações inválida');
 return value;
}
function readDeletes(storage){
 try{return deletedMap(JSON.parse(storage.getItem(DELETIONS)||'{}'))}
 catch(e){throw Error('Registro mínimo de exclusões inválido: '+e.message)}
}
function cleanMeta(meta,deletions){
 const out={...meta};
 for(const [page,ids] of Object.entries(deletions)){
  const matched=/^BM030_STROKES_PDF:(.+):([^:]+):P\d+$/.exec(page);
  if(!matched)continue;
  for(const id of Object.keys(ids)){
   if(!id.startsWith('id:'))continue;
   delete out['TXT:'+matched[1]+':'+matched[2]+':'+id.slice(3)];
  }
 }
 return out;
}
function cleanPage(key,marks,deletions){
 const ids=deletions[key]||{},output=[];
 for(const mark of marks){
  if(mark?.bm108_deleted_at)continue;
  if(Object.hasOwn(ids,markId(mark)))continue;
  output.push(mark);
 }
 return output;
}
function mergeArray(local,remote){
 const output=local.slice(),known=new Map(),conflicts=[];let additions=0;
 for(let i=0;i<output.length;i++)known.set(markId(output[i]),i);
 for(const mark of remote){
  const id=markId(mark),pos=known.get(id);
  if(pos===undefined){known.set(id,output.length);output.push(mark);additions++;continue}
  if(literal(output[pos])===literal(mark))continue;
  const previous=Date.parse(output[pos]?.bm108_changed_at||'')||0;
  const incoming=Date.parse(mark?.bm108_changed_at||'')||0;
  if(incoming>previous)output[pos]=mark;
  else conflicts.push(id);
 }
 return {merged:output,additions,conflicts};
}
function mergeObject(local,remote){
 const output={...local},conflicts=[];let additions=0;
 for(const [key,value] of Object.entries(remote)){
  if(!Object.hasOwn(output,key)){output[key]=value;additions++;continue}
  if(literal(output[key])!==literal(value)){
   const prev=Date.parse(output[key]?.bm108_changed_at||'')||0;
   if((Date.parse(value?.bm108_changed_at||'')||0)>prev)output[key]=value;
   else conflicts.push(key);
  }
 }
 return {merged:output,additions,conflicts};
}
function migrate(storage){
 const previous=storage.getItem(DELETIONS),deleted=readDeletes(storage),changes=[];
 let count=0;
 for(let i=0;i<storage.length;i++){
  const key=storage.key(i);if(!isPage(key))continue;
  const raw=storage.getItem(key);
  let entries;try{entries=parse(key,raw)}catch{continue}
  const kept=[];
  for(const mark of entries){
   if(mark?.bm108_deleted_at){
    if(!deleted[key])deleted[key]={};
    deleted[key][markId(mark)]=mark.bm108_deleted_at||now();count++;continue;
   }
   if(deleted[key]?.[markId(mark)]){count++;continue}
   kept.push(mark);
  }
  if(kept.length!==entries.length)changes.push({key,before:raw,after:kept.length?literal(kept):null});
 }
 const metaBefore=storage.getItem(META);
 const metaClean=metaBefore?literal(cleanMeta(parse(META,metaBefore),deleted)):null;
 const metaChanged=metaBefore!==null&&metaClean!==metaBefore;
 if(!changes.length&&!metaChanged)return {removed:0};

 try{
  storage.setItem(DELETIONS,literal(deleted));
  if(metaChanged)storage.setItem(META,metaClean);
  for(const c of changes){if(c.after===null)storage.removeItem(c.key);else storage.setItem(c.key,c.after)}
 }catch(e){
  for(const c of changes){try{c.before===null?storage.removeItem(c.key):storage.setItem(c.key,c.before)}catch(_){}}
  try{previous===null?storage.removeItem(DELETIONS):storage.setItem(DELETIONS,previous)}catch(_){}
  if(metaChanged)try{storage.setItem(META,metaBefore)}catch(_){}
  throw Error('Migração interrompida sem apagar originais: '+e.message);
 }
 return {removed:count};
}
function deleteMarks(storage,page,marks,options={}){
 if(!isPage(page))throw Error('Página inválida');
 if(!Array.isArray(marks)||!marks.length)return 0;
 const before=storage.getItem(page),beforeDeletions=storage.getItem(DELETIONS);
 const beforeMeta=storage.getItem(META),beforeJoins=storage.getItem(options.joinKey||'');
 const array=before?parse(page,before):[];
 const ids=new Set(marks.map(markId));
 if(!array.some(m=>ids.has(markId(m))))return 0;
 const remaining=array.filter(m=>!ids.has(markId(m)));
 const deletion=readDeletes(storage);
 if(!deletion[page])deletion[page]={};
 const stamp=now();
 for(const id of ids)deletion[page][id]=stamp;
 let meta;
 if(beforeMeta){meta=parse(META,beforeMeta);meta={...meta};for(const k of options.identities||[])delete meta[k]}
 let joins;
 if(options.joinKey&&beforeJoins){
  joins=parse(options.joinKey,beforeJoins);
  const rawIds=new Set(marks.map(m=>m?.id).filter(Boolean));
  joins=joins.map(x=>({...x,markIds:(x.markIds||[]).filter(id=>!rawIds.has(id))}))
   .filter(x=>x.markIds.length>=2);
 }
 const backup={[page]:before,[DELETIONS]:beforeDeletions};
 if(beforeMeta&&meta)backup[META]=beforeMeta;
 if(options.joinKey&&beforeJoins)backup[options.joinKey]=beforeJoins;
 try{
  storage.setItem(DELETIONS,literal(deletion));
  remaining.length?storage.setItem(page,literal(remaining)):storage.removeItem(page);
  if(beforeMeta&&meta)storage.setItem(META,literal(meta));
  if(options.joinKey&&beforeJoins)joins.length?storage.setItem(options.joinKey,literal(joins)):storage.removeItem(options.joinKey);
 }catch(e){
  for(const [key,value] of Object.entries(backup))
   try{value===null?storage.removeItem(key):storage.setItem(key,value)}catch(_){}
  throw Error('Exclusão não confirmada; registros anteriores preservados: '+e.message);
 }
 return array.length-remaining.length;
}
function persistPage(storage,page,next){
 if(!isPage(page)||!Array.isArray(next))throw Error('Página inválida');
 const before=storage.getItem(page),beforeDeletes=storage.getItem(DELETIONS);
 const current=before?parse(page,before):[];
 const future=new Set(next.map(markId));
 const removed=current.filter(m=>!future.has(markId(m)));
 const deletions=readDeletes(storage);
 if(removed.length){
  if(!deletions[page])deletions[page]={};
  const stamp=now();
  for(const mark of removed)deletions[page][markId(mark)]=stamp;
 }
 const clean=cleanPage(page,next,deletions);
 try{
  if(removed.length)storage.setItem(DELETIONS,literal(deletions));
  clean.length?storage.setItem(page,literal(clean)):storage.removeItem(page);
 }catch(e){
  try{before===null?storage.removeItem(page):storage.setItem(page,before)}catch(_){}
  try{beforeDeletes===null?storage.removeItem(DELETIONS):storage.setItem(DELETIONS,beforeDeletes)}catch(_){}
  throw Error('Grifos não salvos: '+e.message);
 }
 return {saved:clean.length,removed:removed.length};
}
function capture(storage,device){
 migrate(storage);
 const records={};
 if(storage.length>LIMIT_KEYS)throw Error('Limite de registros excedido');
 const deleted=readDeletes(storage);
 for(let i=0;i<storage.length;i++){
  const key=storage.key(i);if(!validKey(key))continue;
  let txt=storage.getItem(key);
  if(typeof txt!=='string')continue;
  const val=parse(key,txt);
  if(isPage(key))txt=literal(cleanPage(key,val,deleted));
  if(isPage(key)&&txt==='[]')continue;
  records[key]=txt;
 }
 const bundle={schema:SCHEMA,device,generated_at:now(),records};
 if(literal(bundle).length>LIMIT_BYTES)throw Error('Backup acima de 12MB');
 return bundle;
}
function validate(bundle){
 if(!bundle||bundle.schema!==SCHEMA||!/^[A-Za-z0-9_-]{8,100}$/.test(bundle.device||'')||
  !bundle.records||typeof bundle.records!=='object'||Array.isArray(bundle.records))
  throw Error('Cópia de grifos inválida');
 const keys=Object.keys(bundle.records);
 if(keys.length>LIMIT_KEYS)throw Error('Cópia excede limite de arquivos');
 for(const key of keys){if(!validKey(key)||typeof bundle.records[key]!=='string')throw Error('Chave de backup não permitida');parse(key,bundle.records[key])}
 return bundle.records;
}
function plan(storage,bundles){
 if(!Array.isArray(bundles)||bundles.length>30)throw Error('Limite de arquivos excedido');
 let mergedDeletions=readDeletes(storage),additions=0;
 const conflicts=[],pending=new Map();
 for(const b of bundles){
  const records=validate(b);
  if(records[DELETIONS])mergedDeletions=mergeDeletions(mergedDeletions,parse(DELETIONS,records[DELETIONS]));
  for(const [key,text] of Object.entries(records)){
   if(!isPage(key))continue;
   for(const item of parse(key,text))if(item?.bm108_deleted_at){
    mergedDeletions=mergeDeletions(mergedDeletions,{[key]:{[markId(item)]:item.bm108_deleted_at}});
   }
  }
 }
 const snapshots=[...bundles.map(b=>b.records)];
 for(const records of snapshots)for(const [key,text] of Object.entries(records)){
  if(key===DELETIONS)continue;
  const before=pending.has(key)?pending.get(key):storage.getItem(key);
  const remote=parse(key,text);
  if(before===null){pending.set(key,text);additions+=Array.isArray(remote)?remote.length:Object.keys(remote).length;continue}
  const local=parse(key,before);
  const r=key===META?mergeObject(local,remote):mergeArray(local,remote);
  additions+=r.additions;
  if(r.conflicts.length)conflicts.push({key,type:'mesmo_id',count:r.conflicts.length});
  pending.set(key,literal(r.merged));
 }
 const rawMeta=pending.has(META)?pending.get(META):storage.getItem(META);
 if(rawMeta){
  const filtered=cleanMeta(parse(META,rawMeta),mergedDeletions);
  if(literal(filtered)!==rawMeta)pending.set(META,literal(filtered));
 }
 const previous=storage.getItem(DELETIONS);
 if(literal(mergedDeletions)!==literal(readDeletes(storage)))pending.set(DELETIONS,literal(mergedDeletions));
 const keys=new Set([...pending.keys()]);
 for(let i=0;i<storage.length;i++){const key=storage.key(i);if(isPage(key))keys.add(key)}
 for(const key of keys)if(isPage(key)){
  const before=pending.has(key)?pending.get(key):storage.getItem(key);
  if(before===null)continue;
  const clean=cleanPage(key,parse(key,before),mergedDeletions);
  pending.set(key,clean.length?literal(clean):null);
 }
 const writes=[];
 for(const [key,value] of pending)if(storage.getItem(key)!==value)writes.push({key,value});
 return {writes,additions,conflicts,files:bundles.length,deleted:mergedDeletions,previous};
}
function apply(storage,result){
 if(!result||!Array.isArray(result.writes))throw Error('Plano inválido');
 const prior=[];
 try{
  for(const {key,value} of result.writes){
   if(!validKey(key))throw Error('Chave inválida');
   prior.push([key,storage.getItem(key)]);
   if(value===null)storage.removeItem(key);else storage.setItem(key,value);
  }
 }catch(e){
  for(const [key,value] of prior.reverse())try{value===null?storage.removeItem(key):storage.setItem(key,value)}catch(_){}
  throw Error('Alterações revertidas: '+e.message);
 }
 return result.writes.length;
}
const api=Object.freeze({SCHEMA,META,DELETIONS,LIMIT_BYTES,validKey,markId,parse,
 mergeArray,mergeObject,mergeDeletions,readDeletes,cleanPage,cleanMeta,deleteMarks,persistPage,
 migrate,capture,validate,plan,apply});
window.BancoMestreGrifosSyncCoreV103=api;
})();

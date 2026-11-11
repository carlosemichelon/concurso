/* V103 — núcleo de sincronização local/Drive, sem rede ou autenticação.
 * Incremental e NÃO DESTRUTIVO: jamais remove marcações locais.
 * Conflitos do mesmo ID permanecem locais e são sinalizados.
 */
(function(){
'use strict';
if(window.BancoMestreGrifosSyncCoreV103)return;
const SCHEMA='BancoMestreGrifosSyncV103',PREFIXES=[
 'BM030_STROKES_PDF:','BM102_PDF_HIGHLIGHT_JOINS:'
],META='BM062_GRIFOS_META';
const LIMIT_BYTES=12000000,LIMIT_KEYS=10000,LIMIT_MARKS=100000;
function validKey(k){
 return typeof k==='string'&&k.length<500&&
 (PREFIXES.some(prefix=>k.startsWith(prefix))||k===META);
}
function parse(key,text){
 if(typeof text!=='string'||text.length>LIMIT_BYTES)throw Error('Arquivo de grifos acima do limite');
 const value=JSON.parse(text);
 if(key===META){
  if(!value||typeof value!=='object'||Array.isArray(value))throw Error('Metadados inválidos');
 }else if(!Array.isArray(value)||value.length>LIMIT_MARKS){
  throw Error('Lista de marcações inválida');
 }
 return value;
}
function capture(storage,device){
 const records={},length=Math.min(Number(storage.length)||0,LIMIT_KEYS+1);
 if(length>LIMIT_KEYS)throw Error('Quantidade de chaves excede o limite');
 for(let i=0;i<length;i++){
  const key=storage.key(i);
  if(!validKey(key))continue;
  const text=storage.getItem(key);
  if(typeof text!=='string')continue;
  parse(key,text);
  records[key]=text;
 }
 const bundle={schema:SCHEMA,device,generated_at:new Date().toISOString(),records};
 if(JSON.stringify(bundle).length>LIMIT_BYTES)throw Error('Dados excedem 12 MB; exporte um backup antes');
 return bundle;
}
function validate(bundle){
 if(!bundle||bundle.schema!==SCHEMA||typeof bundle.device!=='string'||
    !/^[A-Za-z0-9_-]{8,100}$/.test(bundle.device)||
    !bundle.records||typeof bundle.records!=='object'||Array.isArray(bundle.records))throw Error('Backup de sincronização incompatível');
 const keys=Object.keys(bundle.records);
 if(keys.length>LIMIT_KEYS)throw Error('Limite de documentos ultrapassado');
 for(const key of keys){
  if(!validKey(key)||typeof bundle.records[key]!=='string')throw Error('Chave não permitida na sincronização');
  parse(key,bundle.records[key]);
 }
 return bundle.records;
}
function markId(m){
 if(!m||typeof m!=='object')return JSON.stringify(m);
 // Some old freehand strokes do not carry an ID: de-duplicate by full value.
 return m.id&&typeof m.id==='string'?'id:'+m.id:'legacy:'+JSON.stringify(m);
}
function mergeArray(local,remote){
 const merged=local.slice(),known=new Map(),conflicts=[];
 for(const item of local)known.set(markId(item),JSON.stringify(item));
 let additions=0;
 for(const item of remote){
  const id=markId(item),literal=JSON.stringify(item);
  if(known.has(id)){
   if(known.get(id)!==literal)conflicts.push(id);
  }else{
   known.set(id,literal);merged.push(item);additions++;
  }
 }
 return {merged,additions,conflicts};
}
function mergeObject(local,remote){
 const merged={...local},conflicts=[];let additions=0;
 for(const [key,value] of Object.entries(remote)){
  if(Object.hasOwn(merged,key)){
   if(JSON.stringify(merged[key])!==JSON.stringify(value))conflicts.push(key);
  }else {merged[key]=value;additions++}
 }
 return {merged,additions,conflicts};
}
function plan(storage,bundles){
 if(!Array.isArray(bundles)||bundles.length>30)throw Error('Mais de 30 cópias: revisar o acervo antes');
 const pending=new Map(),conflicts=[],seen=new Set();
 let additions=0;
 for(const b of bundles){
  const records=validate(b);
  for(const [key,text] of Object.entries(records)){
   const entry=key+'\u0000'+text;
   if(seen.has(entry))continue;
   seen.add(entry);
   const before=pending.has(key)?pending.get(key):storage.getItem(key);
   if(before===null){pending.set(key,text);additions++;continue}
   let local,remote;
   try{local=parse(key,before);remote=parse(key,text)}
   catch(_){conflicts.push({key,type:'corrompido'});continue}
   const merged=key===META?mergeObject(local,remote):mergeArray(local,remote);
   additions+=merged.additions;
   if(merged.conflicts.length)conflicts.push({key,type:'mesmo_id',count:merged.conflicts.length});
   const next=JSON.stringify(merged.merged);
   if(next!==before)pending.set(key,next);
  }
 }
 const writes=[];
 for(const [key,value] of pending)
  if(storage.getItem(key)!==value)writes.push({key,value});
 return {writes,additions,conflicts,files:bundles.length};
}
function apply(storage,result){
 if(!result||!Array.isArray(result.writes))throw Error('Plano inválido');
 const previous=[];
 try{
  for(const {key,value} of result.writes){
   if(!validKey(key))throw Error('Chave não permitida');
   previous.push([key,storage.getItem(key)]);
   storage.setItem(key,value);
  }
 }catch(e){
  for(const [key,value] of previous.reverse()){
   try{value===null?storage.removeItem(key):storage.setItem(key,value)}catch(_){}
  }
  throw Error('Falha ao aplicar; mudanças anteriores revertidas quando possível: '+e.message);
 }
 return result.writes.length;
}
window.BancoMestreGrifosSyncCoreV103=Object.freeze({
 SCHEMA,LIMIT_BYTES,capture,validate,mergeArray,mergeObject,plan,apply,validKey
});
})();
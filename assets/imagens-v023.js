(function(root){
'use strict';
const DB='BancoMestreImagensV023', STORE='items',VALID=/^IMG-\d{3}$/;
let cache=null;
function ok(id){if(typeof id!=='string'||!VALID.test(id))throw Error('Código IMG inválido')}
function open(){
 if(cache)return cache;
 cache=new Promise((resolve,reject)=>{
  const r=indexedDB.open(DB,1);
  r.onupgradeneeded=()=>{const db=r.result;if(!db.objectStoreNames.contains(STORE))db.createObjectStore(STORE,{keyPath:'id'})};
  r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error||Error('IndexedDB indisponível'));
 });
 return cache;
}
async function transact(mode,fn){
 const db=await open();return new Promise((resolve,reject)=>{
  const t=db.transaction(STORE,mode),store=t.objectStore(STORE),req=fn(store);
  let result;
  req.onsuccess=()=>result=req.result;req.onerror=()=>reject(req.error||Error('Falha de armazenamento'));
  t.oncomplete=()=>resolve(result);t.onerror=()=>reject(t.error||Error('Não foi possível salvar'));
 });
}
const get=async id=>{ok(id);return(await transact('readonly',s=>s.get(id)))||{id,status:'visible'}};
const all=async()=>await transact('readonly',s=>s.getAll());
function notify(){try{localStorage.setItem('BM_IMAGENS_V023_CHANGE',String(Date.now()))}catch(e){}root.dispatchEvent(new Event('bm-imagens-atualizadas'))}
async function put(id,patch){
 ok(id);
 const old=await get(id);
 const next={...old,...patch,id,updatedAt:new Date().toISOString()};
 await transact('readwrite',s=>s.put(next));notify();return next;
}
async function setStatus(id,status,note){
 if(!['visible','hidden','review'].includes(status))throw Error('Status inválido');
 return put(id,{status,note:String(note??'').slice(0,500)});
}
async function replace(id,blob){
 ok(id);
 if(!(blob instanceof Blob)||!/^image\/(png|jpeg|webp)$/.test(blob.type)||blob.size>16000000)throw Error('Imagem PNG/JPG/WEBP válida de até 16 MB necessária');
 return put(id,{replacement:blob,status:'visible'});
}
async function resetImage(id){return put(id,{replacement:null})}
async function removeLocal(id){
 ok(id);await transact('readwrite',s=>s.delete(id));notify();
}
const replacementUrl=async id=>{const d=await get(id);return d.replacement instanceof Blob?URL.createObjectURL(d.replacement):null};
async function backup(){
 const rows=await all();const output=[];
 for(const d of rows){
  const item={id:d.id,status:d.status||'visible',note:d.note||'',updatedAt:d.updatedAt};
  if(d.replacement instanceof Blob)item.replacement=await new Promise((yes,no)=>{const f=new FileReader();f.onload=()=>yes(f.result);f.onerror=()=>no(f.error);f.readAsDataURL(d.replacement)});
  output.push(item);
 }
 return {format:'BancoMestreImagensV023',exportAt:new Date().toISOString(),items:output};
}
async function restore(data){
 if(!data||data.format!=='BancoMestreImagensV023'||!Array.isArray(data.items)||data.items.length>500)throw Error('Backup não reconhecido');
 let count=0;
 for(const i of data.items){
  if(!i||!VALID.test(i.id)||!['visible','hidden','review'].includes(i.status))continue;
  let replacement=null;
  if(i.replacement!==undefined){
   if(typeof i.replacement!=='string'||!/^data:image\/(png|jpeg|webp);base64,/.test(i.replacement)||i.replacement.length>25000000)continue;
   const res=await fetch(i.replacement);replacement=await res.blob();
   if(replacement.size>16000000)continue;
  }
  await put(i.id,{status:i.status,note:String(i.note||'').slice(0,500),...(replacement?{replacement}:{})});count++;
 }
 return count;
}
root.BancoMestreImagens={get,all,setStatus,replace,resetImage,removeLocal,replacementUrl,backup,restore};
})(window);

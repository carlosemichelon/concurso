(function(root){
'use strict';
// Compatível com as exclusões de imagens das versões anteriores.
// Não oferece upload, importação, substituição ou publicação de arquivos.
const DB='BancoMestreImagensV023',STORE='items',VALID=/^IMG-\d{3}$/;
let dbPromise=null;
function db(){
 if(dbPromise)return dbPromise;
 dbPromise=new Promise((ok,fail)=>{
  const r=indexedDB.open(DB,1);
  r.onupgradeneeded=()=>{const d=r.result;if(!d.objectStoreNames.contains(STORE))d.createObjectStore(STORE,{keyPath:'id'})};
  r.onsuccess=()=>ok(r.result);r.onerror=()=>fail(r.error||Error('Armazenamento indisponível'));
 });
 return dbPromise;
}
async function transaction(mode,operate){
 const d=await db();return new Promise((resolve,reject)=>{
  const t=d.transaction(STORE,mode),s=t.objectStore(STORE),r=operate(s);
  let value;
  r.onsuccess=()=>value=r.result;
  r.onerror=()=>reject(r.error||Error('Falha de leitura'));
  t.oncomplete=()=>resolve(value);
  t.onerror=()=>reject(t.error||Error('Falha ao salvar exclusão'));
 });
}
async function all(){return transaction('readonly',s=>s.getAll())}
async function setStatus(id,status){
 if(!VALID.test(id)||!['visible','hidden'].includes(status))throw Error('Operação inválida');
 const old=await transaction('readonly',s=>s.get(id))||{id};
 const next={...old,id,status,updatedAt:new Date().toISOString()};
 await transaction('readwrite',s=>s.put(next));
 try{localStorage.setItem('BM_IMAGENS_V023_CHANGE',String(Date.now()))}catch(_){}
 root.dispatchEvent(new Event('bm-imagens-atualizadas'));
 return next;
}
root.BancoMestreImagens={all,setStatus};
})(window);

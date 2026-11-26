// Local, disposable cache of verified read-only bytes. No credentials or writes to Drive.
const DB='BMVerifiedReadCacheV1',STORE='bytes',META='meta',MAX=128*1024*1024,MAX_AGE=7*86400000;
let dbPromise;
function db(){
 if(!globalThis.indexedDB)return Promise.resolve(null);
 if(dbPromise)return dbPromise;
 dbPromise=new Promise(resolve=>{
  let request;
  try{request=indexedDB.open(DB,2)}catch{resolve(null);return}
  request.onupgradeneeded=()=>{const d=request.result;if(!d.objectStoreNames.contains(STORE))d.createObjectStore(STORE,{keyPath:'key'});if(!d.objectStoreNames.contains(META))d.createObjectStore(META,{keyPath:'key'})};
  request.onsuccess=()=>{const d=request.result;d.onversionchange=()=>{d.close();dbPromise=null};resolve(d)};
  request.onerror=request.onblocked=()=>resolve(null);
 });
 return dbPromise;
}
async function operate(mode,fn){
 const d=await db();if(!d)return null;
 return new Promise(resolve=>{
  try{const t=d.transaction([STORE,META],mode),s=t.objectStore(STORE),m=t.objectStore(META);let result=null;
   t.oncomplete=()=>resolve(result);t.onerror=t.onabort=()=>resolve(null);
   fn(s,v=>{result=v},m);
  }catch{resolve(null)}
 });
}
export const hashBytes=async bytes=>[...new Uint8Array(await crypto.subtle.digest('SHA-256',bytes))].map(n=>n.toString(16).padStart(2,'0')).join('');
export function verifiedCacheKey(account,root,meta,hash){
 if(!account||!root||!meta?.id||!meta.version||!/^[a-f0-9]{64}$/.test(hash||''))return null;
 return JSON.stringify([account,root,meta.id,meta.version,hash]);
}
export const browserByteCache=Object.freeze({
 async get(key){if(!key)return null;
  return operate('readonly',(s,done)=>{const q=s.get(key);q.onsuccess=()=>{const r=q.result;if(r&&Date.now()-r.at<=MAX_AGE&&r.bytes instanceof ArrayBuffer)done(r.bytes)}});
 },
 async put(key,bytes){if(!key||!(bytes instanceof ArrayBuffer)||bytes.byteLength>MAX)return;
  await operate('readwrite',(s,done,m)=>{const q=m.getAll();q.onsuccess=()=>{
   const now=Date.now(),rows=q.result.filter(r=>r.key!==key&&now-r.at<=MAX_AGE);
   for(const r of q.result)if(r.key===key||now-r.at>MAX_AGE){s.delete(r.key);m.delete(r.key)}
   let total=bytes.byteLength+rows.reduce((n,r)=>n+Number(r.size||0),0);
   rows.sort((a,b)=>a.at-b.at);
   for(const r of rows){if(total<=MAX)break;s.delete(r.key);m.delete(r.key);total-=Number(r.size||0)}
   s.put({key,bytes,at:now});m.put({key,size:bytes.byteLength,at:now});done(true);
  }});
 },
 async clear(){return operate('readwrite',(s,done,m)=>{s.clear();m.clear();done(true)})}
});
export async function cachedVerifiedBytes(cache,key,size,hash){
 if(!cache||!key||!hash)return null;
 try{const bytes=await cache.get(key);if(!(bytes instanceof ArrayBuffer)||bytes.byteLength!==size||await hashBytes(bytes)!==hash)return null;return bytes}catch{return null}
}
export async function rememberVerifiedBytes(cache,key,bytes){
 if(cache&&key){try{await cache.put(key,bytes)}catch{}}
}

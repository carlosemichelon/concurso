/* Banco Mestre V240 — Service Worker público, sem guardar respostas privadas. */
'use strict';
const CACHE='bm-v240-static-homologacao-1';
const BOOT=['./v240.html','./v062.html','./controle-estudos-v240.html','./assets/v240_controle_native.js','./assets/v240_controle_app.js','./assets/v240_controle_drive_sync.js','./assets/v240_backup_drive.js','./assets/v240_global_drive.js'];
self.addEventListener('install',event=>{
 event.waitUntil((async()=>{
  const cache=await caches.open(CACHE);
  await Promise.all(BOOT.map(async path=>{try{await cache.add(new Request(path,{cache:'reload'}))}catch(_){}}));
  await self.skipWaiting();
 })());
});
self.addEventListener('activate',event=>{
 event.waitUntil((async()=>{
  const keys=await caches.keys();
  await Promise.all(keys.filter(k=>k.startsWith('bm-v240-')&&k!==CACHE).map(k=>caches.delete(k)));
  await self.clients.claim();
 })());
});
self.addEventListener('fetch',event=>{
 const req=event.request;
 if(req.method!=='GET'||req.headers.has('Authorization'))return;
 const url=new URL(req.url),scope=new URL(self.registration.scope);
 if(url.origin!==scope.origin||!url.pathname.startsWith(scope.pathname))return;
 if(/\.(pdf|zip|xlsx|docx|mp4|webm)$/i.test(url.pathname))return;
 if(!/\.(html|js|css|json|svg|png|webp|jpg|jpeg)$/i.test(url.pathname)&&req.mode!=='navigate')return;
 if(/\/drive_auth_v038\.json$/i.test(url.pathname))return;
 event.respondWith((async()=>{
  const cache=await caches.open(CACHE);
  const key=new Request(url.origin+url.pathname,{method:'GET'});
  try{
   const response=await fetch(req);
   if(response.ok&&response.type==='basic'&&Number(response.headers.get('content-length')||0)<5_000_000){
    await cache.put(key,response.clone());
   }
   return response;
  }catch(error){
   const cached=await cache.match(key);
   if(cached)return cached;
   if(req.mode==='navigate'){
    const fallback=await cache.match(new Request(scope.origin+scope.pathname+'v240.html'));
    if(fallback)return fallback;
   }
   throw error;
  }
 })());
});
/* V180 — acrescenta, sem reformatar, imagens recuperadas ao Atlas original. */
(function(){
 'use strict';
 const FILE='assets/v180_native_image_additions.json?v=180';
 let promise=null;
 async function add(images){
  if(!Array.isArray(images))throw Error('Atlas sem lista de imagens');
  if(images.length===179)return {added:0,total:179,already:true};
  if(images.length!==86)throw Error('Atlas original inesperado: '+images.length);
  if(!promise)promise=(async()=>{
   const response=await fetch(FILE,{cache:'no-store'});
   if(!response.ok)throw Error('Índice de imagens recuperadas HTTP '+response.status);
   const pack=await response.json();
   if(pack.schema!=='BancoMestreNativeImageAdditionsV180'||pack.historical_count!==86||
      pack.records?.length!==93)throw Error('Índice incompleto ou incompatível');
   const current=new Set(images.map(x=>x.no));
   const next=new Set(pack.records.map(x=>x.no));
   if(next.size!==93||[...next].some(x=>current.has(x)))throw Error('IDs de mídia repetidos');
   if(!pack.records.every(x=>/^IMG-C1[1234]-\d{3}$/.test(x.no)&&
      /^https:\/\/drive\.google\.com\/file\/d\/[A-Za-z0-9_-]{15,}\/view$/.test(x.source_url)&&
      x.studySubject&&x.studySub&&x.studyArea&&x.group&&x.external))throw Error('Imagem ou classificação inválida');
   images.push(...pack.records.map(x=>({...x})));
   return {added:93,total:images.length};
  })().catch(e=>{
   promise=null;
   console.warn('Imagens das conversas indisponíveis, acervo antigo preservado:',e);
   const n=document.querySelector('#imagens .notice');
   if(n)n.textContent+=' As imagens recuperadas não puderam ser consultadas neste momento: '+e.message+'.';
   return {added:0,total:images.length,error:e.message};
  });
  return promise;
 }
 window.BM180ImageBridge=Object.freeze({add});
})();
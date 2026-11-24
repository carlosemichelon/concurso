import {createAccountRuntime} from '../../assets/multiaccount-srs-v001.mjs';
function memoryStorage(){const map=new Map();return {get length(){return map.size},key:i=>[...map.keys()][i]??null,getItem:k=>map.get(k)??null,setItem:(k,v)=>map.set(k,String(v)),removeItem:k=>map.delete(k)}}
// Use the original runtime; never provide write methods, disk storage or browser OAuth.
export function projectRuntime({info,profile,events,discursive,uploadedImages}){
 const session={phase:'ready',identity:info,current:profile};
 const runtime=createAccountRuntime({session,storage:memoryStorage(),idb:{open(){throw Error('Banco local desabilitado')},deleteDatabase(){throw Error('Banco local desabilitado')}},reviewEvents:events,discursiveEvents:discursive,uploadedImages});
 try{
  // Explicit projection: no Drive ID, credentials, question history, notes or original URLs.
  const cards=runtime.catalog().map(c=>({id:c.id,front:c.front,back:c.back,expl:typeof c.expl==='string'?c.expl:'',active:c.active}));
  const srs=runtime.srs();
  if(runtime.reviewReady||runtime.discursiveReady||runtime.imageUploadReady||runtime.pdfCopyReady)throw Error('Runtime somente leitura');
  return {catalog:profile.catalog,counts:{cards:cards.length,srs:srs.records.length,questions:profile.privateData.questions.length,pdf:runtime.pdfCatalog().length,images:runtime.imageCatalog().length,annotations:profile.privateData.annotations.length,study:profile.privateData.study.length,discursive:runtime.discursive().length},cards,srs:{records:srs.records.map(r=>({id:r.id,due:r.due,rating:r.rating,lastReview:r.lastReview})),undated:srs.undated,unmatched:srs.unmatched}};
 }finally{runtime.close();session.phase='locked'}
}

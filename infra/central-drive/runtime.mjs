import {createAccountRuntime} from '../../assets/multiaccount-srs-v001.mjs';
function memoryStorage(){const map=new Map();return {get length(){return map.size},key:i=>[...map.keys()][i]??null,getItem:k=>map.get(k)??null,setItem:(k,v)=>map.set(k,String(v)),removeItem:k=>map.delete(k)}}
import {mediaCatalog} from './media.mjs';
import {discursiveProjection} from './discursive.mjs';
import {ACCOUNT_RATINGS} from '../../assets/multiaccount-review-events-v001.mjs';
// Use the original runtime; never provide write methods, disk storage or browser OAuth.
export function projectRuntime({info,profile,events,discursive,uploadedImages}){
 const session={phase:'ready',identity:info,current:profile};
 const runtime=createAccountRuntime({session,storage:memoryStorage(),idb:{open(){throw Error('Banco local desabilitado')},deleteDatabase(){throw Error('Banco local desabilitado')}},reviewEvents:events,discursiveEvents:discursive,uploadedImages});
 try{
  // Explicit projection: no Drive ID, credentials, question history, notes or original URLs.
  const cards=runtime.catalog().map(c=>({id:c.id,front:c.front,back:c.back,expl:typeof c.expl==='string'?c.expl:'',active:c.active,group:typeof c.group==='string'?c.group:'OUTROS',mnemonic:typeof c.mnemonic==='string'?c.mnemonic:'',reference:typeof c.reference==='string'?c.reference:'',search_keywords:typeof c.search_keywords==='string'?c.search_keywords:'',discipline:typeof c.discipline==='string'?c.discipline:'',subject:typeof c.subject==='string'?c.subject:'',sub:typeof c.sub==='string'?c.sub:'',relatedCardIds:Array.isArray(c.related_card_ids)?c.related_card_ids.filter(id=>typeof id==='string'):[],relatedQuestionIds:Array.isArray(c.related_question_ids)?c.related_question_ids.filter(id=>typeof id==='string'&&/^[A-Za-z0-9_-]{1,160}$/.test(id)):[]}));
  const srs=runtime.srs();
  if(runtime.reviewReady||runtime.discursiveReady||runtime.imageUploadReady||runtime.pdfCopyReady)throw Error('Runtime somente leitura');
  return {catalog:profile.catalog,counts:{cards:cards.length,srs:srs.records.length,questions:profile.privateData.questions.length,pdf:runtime.pdfCatalog().length,images:runtime.imageCatalog().length,annotations:profile.privateData.annotations.length,study:profile.privateData.study.length,discursive:runtime.discursive().length},cards,attempts:runtime.discursive().map(discursiveProjection),ratings:ACCOUNT_RATINGS,acquirable:cards.filter(c=>c.active&&runtime.canAcquire(c.id)).map(c=>c.id),media:mediaCatalog(runtime),srs:{records:srs.records.map(r=>({id:r.id,due:r.due,rating:r.rating,lastReview:r.lastReview})),undated:srs.undated,unmatched:srs.unmatched}};
 }finally{runtime.close();session.phase='locked'}
}

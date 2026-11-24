/* Original images and vector SVGs remain in the authenticated owner's Drive.
 * Existing editorial IDs, Drive IDs and explicit direct links are retained. */
export const IMAGE_MIMES=Object.freeze(['image/jpeg','image/png','image/webp','image/gif','image/svg+xml']);
export const IMAGE_LIMIT=15000000;
const id=x=>typeof x==='string'&&/^[A-Za-z0-9_-]{1,160}$/.test(x);
const copy=x=>JSON.parse(JSON.stringify(x));
const text=(x,n)=>typeof x==='string'?x.slice(0,n):'';
export function profileImages(records,cardIds){
 if(!Array.isArray(records))throw Error('Catálogo de imagens individual inválido');
 const seen=new Set(),aliases=new Set(),cards=new Set(cardIds);
 return records.map(r=>{
  const fileId=r?.file_id||r?.driveFileId,editorial=r?.imageId||r?.id||('DRIVE-IMG-'+fileId),mimeType=r?.mimeType;
  if(!id(fileId)||!id(editorial)||!IMAGE_MIMES.includes(mimeType)||seen.has(fileId)||aliases.has(editorial)||typeof r.name!=='string'||!r.name.trim())throw Error('Registro de imagem inválido ou duplicado');
  seen.add(fileId);aliases.add(editorial);
  const allRefs=r.cardIds??r.cards??[];if(!Array.isArray(allRefs)||allRefs.some(x=>!id(x)))throw Error('Vínculo de imagem inválido');
  const refs=[...new Set(allRefs)],linked=refs.filter(x=>cards.has(x)),unresolved=refs.filter(x=>!cards.has(x));
  const type=r.type==='conteudo'?'conteudo':r.type==='cartao'||linked.length?'cartao':'conteudo';
  const subtype=['','enunciado','figura','explicacao'].includes(r.subtype)?r.subtype:'';
  return {id:fileId,imageId:editorial,name:r.name,mimeType,modifiedTime:text(r.modifiedTime,60),drivePath:text(r.drivePath,600)||'Atlas individual',cardIds:linked,unresolvedCardIds:unresolved,type,subtype,
   metadata:{displayTitle:text(r.title||r.name,240),fileName:r.name,area:text(r.area,120),subject:text(r.subject,180),subsubject:text(r.subsubject,180),detail:text(r.detail,180),description:text(r.description,4000),note:text(r.note,2500),cards:linked,classified:Boolean(r.subject),location:text(r.drivePath,600)||'Atlas individual'},
   provenance:{origin:r.origin??null,questionRefs:copy(r.questionRefs??[]),source:r.source??null,page:r.page??null,edition:r.edition??null,caption:r.caption??null,display:r.display??null,technicalStatus:r.technicalStatus??null,linkStatus:r.linkStatus??null}}
 })
}
export function profileImageAccess({session,profile,cardIds}){
 let records=[...(profile.privateData.images||[])],entries=profileImages(records,cardIds),byId=new Map(entries.map(e=>[e.id,e]));
 const add=rows=>{const candidate=[...records],known=new Set(entries.map(e=>e.id));for(const row of rows){if(!known.has(row.file_id)){candidate.push(row);known.add(row.file_id)}}const next=profileImages(candidate,cardIds);records=candidate;entries=next;byId=new Map(next.map(e=>[e.id,e]));};
 const get=fileId=>{const e=byId.get(fileId);if(!e)throw Error('Imagem fora do Atlas individual');return e};
 return Object.freeze({add,catalog:()=>copy(entries),get:fileId=>copy(get(fileId)),async read(fileId){const e=get(fileId),blob=await session.readImage(fileId,e.mimeType);if(blob.size<1||blob.size>IMAGE_LIMIT)throw Error('Imagem inválida ou acima do limite');return blob},links:cardId=>copy(entries.filter(e=>e.cardIds.includes(cardId)))})
}

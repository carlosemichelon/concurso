/* New originals are stored exactly as received. The image record is in the
 * same Drive resource's description, avoiding a binary/catalog split write. */
import {IMAGE_MIMES,IMAGE_LIMIT} from './multiaccount-images-v001.mjs';
export const IMAGE_UPLOAD_SCHEMA='BM-PORTAL-IMAGE-SOURCE/1';
const safeId=x=>typeof x==='string'&&/^[A-Za-z0-9_-]{1,160}$/.test(x);
const uuidOk=x=>typeof x==='string'&&/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(x);
const fields={title:160,area:120,subject:180,subsubject:180,source:1000,page:80,edition:100,caption:1000,description:4000,note:2500};
export function checkedImageRecord(x,owner){
 if(!x||x.schema!==IMAGE_UPLOAD_SCHEMA||x.owner!==owner||!uuidOk(x.uploadId)||x.imageId!=='IMG-'+x.uploadId.toUpperCase()||!IMAGE_MIMES.includes(x.mimeType)||!Number.isSafeInteger(x.size)||x.size<1||x.size>IMAGE_LIMIT||typeof x.name!=='string'||!x.name.trim()||x.name.length>240||!['ORIGINAL_USUARIO','DERIVADA_AUTORAL','REFERENCIA_EXTERNA'].includes(x.origin)||x.technicalStatus!=='PENDENTE'||x.display!=='verso'||!['cartao','conteudo'].includes(x.type)||!['','enunciado','figura','explicacao'].includes(x.subtype)||!Array.isArray(x.cardIds)||x.cardIds.length>40||x.cardIds.some(v=>!safeId(v))||new Set(x.cardIds).size!==x.cardIds.length||!Array.isArray(x.questionRefs)||x.questionRefs.length>40||x.questionRefs.some(v=>!safeId(v))||!Number.isFinite(Date.parse(x.createdAt)))throw Error('Registro de origem inválido');
 if(Object.entries(fields).some(([k,n])=>typeof x[k]!=='string'||x[k].length>n)||!x.title.trim()||!x.area.trim()||!x.subject.trim()||!x.source.trim()||!x.caption.trim()||(x.type==='cartao'&&!x.cardIds.length)||x.linkStatus!==(x.cardIds.length?'VINCULADO':'PENDENTE'))throw Error('Complete fonte, identificação e vínculos');
 return JSON.parse(JSON.stringify(x))
}
export function prepareImageUpload({owner,file,input,cardIds,uuid,now=new Date()}){
 if(!file||!IMAGE_MIMES.includes(file.type)||!Number.isSafeInteger(file.size)||file.size<1||file.size>IMAGE_LIMIT||typeof file.name!=='string')throw Error('Selecione PNG, JPEG, WEBP, GIF ou SVG de até 15 MB');
 const refs=[...new Set(input.cardIds||[])];if(refs.some(id=>!cardIds.includes(id)))throw Error('Cartão não pertence ao perfil');
 const data=Object.fromEntries(Object.keys(fields).map(k=>[k,String(input[k]||'').trim()]));
 const record=checkedImageRecord({schema:IMAGE_UPLOAD_SCHEMA,owner,uploadId:uuid,imageId:'IMG-'+uuid.toUpperCase(),name:file.name,mimeType:file.type,size:file.size,...data,origin:input.origin,type:refs.length?'cartao':'conteudo',subtype:refs.length?(input.subtype||'explicacao'):'',cardIds:refs,questionRefs:[...new Set(input.questionRefs||[])],linkStatus:refs.length?'VINCULADO':'PENDENTE',technicalStatus:'PENDENTE',display:'verso',createdAt:now.toISOString()},owner);
 return {record,blob:file}
}
export function registeredImage(file,owner){
 const r=checkedImageRecord(JSON.parse(file.description||'null'),owner);
 if(file.appProperties?.bmUpload!==r.uploadId||file.mimeType!==r.mimeType||Number(file.size)!==r.size||file.name!==r.name||!safeId(file.id))throw Error('Registro e original divergentes');
 return {...r,file_id:file.id,modifiedTime:file.modifiedTime||r.createdAt,drivePath:'Atlas individual'}
}

import {profileCatalog} from '../../assets/multiaccount-srs-v001.mjs';
import {profileImageAccess,IMAGE_MIMES,IMAGE_LIMIT} from '../../assets/multiaccount-images-v001.mjs';
import {profilePdfAccess} from '../../assets/multiaccount-pdf-v001.mjs';
const valid=x=>typeof x==='string'&&/^[A-Za-z0-9_-]{1,160}$/.test(x);
export const PDF_LIMIT=120000000;
export class MediaNotFound extends Error {}
const deny=()=>{throw new MediaNotFound('Arquivo não disponível no perfil')};
export function mediaCatalog(runtime){
 return {images:runtime.imageCatalog().map(x=>({id:x.imageId,title:x.metadata.displayTitle,mimeType:x.mimeType,cardIds:x.cardIds,subtype:x.subtype,caption:typeof x.provenance.caption==='string'?x.provenance.caption:'',phase:x.subtype==='enunciado'&&x.provenance.display==='frente'?'frente':'verso'})),pdf:runtime.pdfCatalog().map(x=>({id:x.id,title:x.title}))};
}
export async function readProfileMedia({provider,profile,uploadedImages,media}){
 if(!media||!valid(media.id)||!['image','pdf'].includes(media.kind))return deny();
 const subject=profile.subject;
 const session={readImage:(id,mime)=>provider.readImage(subject,id,mime),readPdf:id=>provider.readPdf(subject,id)};
 let blob,filename;
 if(media.kind==='image'){
  const access=profileImageAccess({session,profile,cardIds:profileCatalog(profile).map(x=>x.id)});access.add(uploadedImages);
  const row=access.catalog().find(x=>x.imageId===media.id);if(!row)return deny();
  blob=await access.read(row.id);filename=row.name;
  if(!IMAGE_MIMES.includes(row.mimeType)||blob.size>IMAGE_LIMIT||blob.size<1)throw Error('Mídia inválida');
  // The provider checks the exact original MIME and byte count. Normalize a permitted
  // generic Drive MIME to the verified catalog MIME, not to a caller-supplied value.
  if(blob.type!==row.mimeType)blob=new Blob([blob],{type:row.mimeType});
 }else{
  const access=profilePdfAccess({session,profile,allowedGroups:[]});
  const row=access.catalog().find(x=>x.id===media.id);if(!row)return deny();
  blob=await access.read(row);filename=row.filename;
  if(blob.type!=='application/pdf'||blob.size>PDF_LIMIT||blob.size<1)throw Error('PDF inválido');
 }
 return {blob,filename:typeof filename==='string'?filename:'arquivo'};
}

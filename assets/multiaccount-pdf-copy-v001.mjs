/* An annotated copy belongs to one authenticated source and source edition. */
const id=x=>typeof x==='string'&&/^[A-Za-z0-9_-]{1,100}$/.test(x);
export function checkedPdfCopy(prepared){
 const doc=prepared?.doc,blob=prepared?.blob;
 if(!doc||!id(doc.id)||!id(doc.file_id)||!(/^[a-f0-9]{64}$/i.test(doc.hash||''))||!Number.isInteger(prepared.pagesMarked)||prepared.pagesMarked<1||blob?.type!=='application/pdf'||!Number.isSafeInteger(blob.size)||blob.size<100||blob.size>180000000)throw Error('Cópia anotada ou origem inválida');
 const name=String(prepared.name||'PDF').replace(/[\\/:*?"<>|\x00-\x1f]/g,'_').slice(0,180).replace(/(?:_ANOTADO)?\.pdf$/i,'')+'_BANCO_MESTRE_ANOTADO.pdf';
 return {doc:{id:doc.id,file_id:doc.file_id,hash:doc.hash},blob,name,pagesMarked:prepared.pagesMarked}
}
export function matchingPdfCopy(file,doc){
 const p=file?.appProperties||{};
 return file?.id!==doc.file_id&&file?.mimeType==='application/pdf'&&p.bmSourceId===doc.id&&p.bmSourceFile===doc.file_id&&p.bmSourceHash===doc.hash
}
export function uploadDestination(value){
 const u=new URL(value);
 if(u.origin!=='https://www.googleapis.com'||!/^\/upload\/drive\/v3\/files(?:\/[A-Za-z0-9_-]+)?$/.test(u.pathname)||u.username||u.password||u.hash)throw Error('Sessão de upload inválida');
 return u.href
}

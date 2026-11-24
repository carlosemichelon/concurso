import {checkedPdfCopy} from './multiaccount-pdf-copy-v001.mjs';
/* Adaptador do catálogo privado para o leitor original. IDs de anotação preservados. */
const valid=x=>typeof x==='string'&&/^[A-Za-z0-9_-]{1,160}$/.test(x);
const copyPdf=x=>JSON.parse(JSON.stringify(x));
export function profilePdfs(records,allowedGroups){
 if(!Array.isArray(records))throw Error('Catálogo PDF individual inválido');
 const ids=new Set(),files=new Set();
 return records.map(r=>{if(!r||!valid(r.id)||!valid(r.file_id)||typeof r.title!=='string'||!r.title.trim()||ids.has(r.id)||files.has(r.file_id))throw Error('PDF inválido ou duplicado no perfil');ids.add(r.id);files.add(r.file_id);
  return {...copyPdf(r),title:r.title,filename:r.filename||r.title+'.pdf',section:r.section||'Google Drive',category:r.category||'PDF_DE_ESTUDO',group:allowedGroups.includes(r.group)?r.group:'apoio_drive',url:'https://drive.google.com/file/d/'+encodeURIComponent(r.file_id)+'/view',_driveSynced:true,_driveDynamic:true,source:'Drive individual'}
 })
}
export function profilePdfAccess({session,profile,allowedGroups}){
 const docs=profilePdfs(profile.privateData.pdf||[],allowedGroups);const map=new Map(docs.map(d=>[d.id,d]));
 let copyBusy=false,copyUncertain=false;
 return Object.freeze({catalog:()=>copyPdf(docs),get copyReady(){return typeof session.saveAnnotatedPdf==='function'&&!copyUncertain},async saveCopy(prepared){if(copyBusy||copyUncertain||typeof session.saveAnnotatedPdf!=='function')throw Error('Gravação de cópia indisponível; reabra o perfil.');const p=checkedPdfCopy(prepared),source=map.get(p.doc.id);if(!source||source.file_id!==p.doc.file_id)throw Error('Origem fora do catálogo individual');copyBusy=true;try{const saved=await session.saveAnnotatedPdf(p);if(!valid(saved?.id)||saved.id===source.file_id)throw Error('Destino de cópia inválido');return saved}catch(e){copyUncertain=true;throw Error('Cópia não confirmada; reabra o perfil antes de repetir. '+e.message)}finally{copyBusy=false}},async read(doc){const match=map.get(doc?.id);if(!match||match.file_id!==doc.file_id)throw Error('PDF fora do catálogo individual');const blob=await session.readPdf(match.file_id);if(blob.type!=='application/pdf'||blob.size<=0||blob.size>120000000)throw Error('PDF recebido inválido');return blob}})
}
export function hydrateProfileMarks(storage,records,core){
 const raw=records.filter(x=>x?.schema===core.SCHEMA);
 if(!raw.length)return {additions:0};
 for(const bundle of raw)core.validate(bundle);
 const plan=core.plan(storage,raw);
 core.apply(storage,plan);
 return {additions:plan.additions,conflicts:plan.conflicts}
}

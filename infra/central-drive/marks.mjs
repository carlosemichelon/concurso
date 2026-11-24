import vm from 'node:vm';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {checkedMarksEnvelope} from '../../assets/multiaccount-marks-v001.mjs';
import {profilePdfs} from '../../assets/multiaccount-pdf-v001.mjs';
import {checkedPdfCopy} from '../../assets/multiaccount-pdf-copy-v001.mjs';
export class MarksRejected extends Error {}
export class MarksUncertain extends Error {}
let corePromise;
export function loadMarksCores(){
 if(!corePromise)corePromise=(async()=>{const window={},ctx=vm.createContext({window,Date,Map,Set,JSON,Object,Array,Number,String,Error,Math});
 for(const file of ['v122_grifos_sync_core.js','v122_grifos_master_core.js'])vm.runInContext(await readFile(new URL('../../assets/'+file,import.meta.url),'utf8'),ctx);
 return {core:window.BancoMestreGrifosSyncCoreV103,master:window.BancoMestreGrifosMasterV104};
 })().catch(e=>{corePromise=null;throw e});return corePromise;
}
const hash=x=>typeof x==='string'&&/^[a-f0-9]{64}$/i.test(x);
const sha=x=>createHash('sha256').update(x).digest('hex');
const id=x=>typeof x==='string'&&/^[A-Za-z0-9_-]{1,100}$/.test(x);
const version=current=>current?sha(JSON.stringify([current.id,current.version])):null;
export const validMarksInput=x=>x&&typeof x==='object'&&!Array.isArray(x)&&Object.keys(x).length===2&&(x.expected===null||hash(x.expected))&&x.snapshot&&x.snapshot.schema==='BancoMestreGrifosSyncV103';
function catalog(profile){return profilePdfs(profile.privateData.pdf||[],[])}
// Only marks from the exact catalog document and edition can be imported.
// Unknown historical keys are never discarded or rewritten by a new import.
export function validateSnapshotScope(snapshot,docs,core){
 const records=core.validate(snapshot),prefixes=docs.filter(d=>hash(d.hash)).flatMap(d=>[d.id+':'+d.hash.toLowerCase(),d.id+':'+d.hash.toLowerCase().slice(0,24)]);
 const page=k=>prefixes.some(p=>k.startsWith('BM030_STROKES_PDF:'+p+':P')&&/^\d+$/.test(k.slice(('BM030_STROKES_PDF:'+p+':P').length)));
 const joins=k=>prefixes.some(p=>k==='BM102_PDF_HIGHLIGHT_JOINS:'+p);
 const meta=k=>prefixes.some(p=>k.startsWith('TXT:'+p+':'));
 for(const [key,raw] of Object.entries(records)){
  const value=core.parse(key,raw);
  if(key===core.DELETIONS){if(Object.keys(value).some(k=>!page(k)))throw new MarksRejected('Exclusão fora da edição individual')}
  else if(key===core.META){if(Object.keys(value).some(k=>!meta(k)))throw new MarksRejected('Metadado fora da edição individual')}
  else if(!page(key)&&!joins(key))throw new MarksRejected('Grifo fora do catálogo ou edição individual');
 }
 return snapshot;
}
export function createMarksService({cores=loadMarksCores}={}){
 const busy=new Set();
 return async({provider,profile,operation,guard=()=>true})=>{
  const subject=profile.subject;if(busy.has(subject))throw new MarksRejected('Sincronização em andamento');busy.add(subject);
  try{
   if(!guard())throw new MarksRejected('Sessão encerrada');
   const {core,master}=await cores(),docs=catalog(profile),current=await provider.readMarksMaster(subject);
   if(current){checkedMarksEnvelope(current.payload,subject);master.validate(current.payload.master)}
   const history=(profile.privateData.annotations||[]).filter(x=>x?.schema===core.SCHEMA||x?.schema===master.SCHEMA);
   if(operation.kind==='read'){const result=master.merge(current?.payload.master||null,history);return {version:version(current),master:result.master}}
   if(operation.kind!=='sync'||!validMarksInput(operation.input))throw new MarksRejected('Sincronização inválida');
   if(operation.input.expected!==version(current))throw new MarksRejected('Mestre alterado. Consulte novamente antes de sincronizar.');
   try{validateSnapshotScope(operation.input.snapshot,docs,core)}catch(e){throw new MarksRejected(e.message)}
   const build=master.merge(current?.payload.master||null,[...history,operation.input.snapshot]);
   if(!guard())throw new MarksRejected('Sessão encerrada');
   if(!build.changed&&current)return {version:version(current),master:build.master,changed:false};
   const next=master.final(build.master),payload=checkedMarksEnvelope({schema:'BM-PORTAL-MARKS/1',owner:subject,master:next},subject);
   try{
    await provider.saveMarksMaster(subject,current?{id:current.id,version:current.version}:null,payload);
    const confirmed=await provider.readMarksMaster(subject);
    if(!confirmed||JSON.stringify(confirmed.payload)!==JSON.stringify(payload))throw Error('Recibo divergente');
    return {version:version(confirmed),master:next,changed:true};
   }catch{throw new MarksUncertain('Gravação não confirmada. Releia o mestre e preserve seu arquivo local.')}
  }finally{busy.delete(subject)}
 };
}
export function createPdfCopyService(){
 const busy=new Set();
 return async({provider,profile,operation,guard=()=>true})=>{
  const subject=profile.subject;if(busy.has(subject))throw new MarksRejected('Cópia em andamento');busy.add(subject);
  try{
   if(!guard()||!id(operation.docId)||!Number.isSafeInteger(operation.pagesMarked)||operation.pagesMarked<1||!Buffer.isBuffer(operation.bytes)||operation.bytes.length<100||operation.bytes.length>180000000||operation.bytes.subarray(0,5).toString()!=='%PDF-')throw new MarksRejected('Cópia inválida');
   const doc=catalog(profile).find(d=>d.id===operation.docId);
   if(!doc||!hash(doc.hash))throw new MarksRejected('Origem ou edição não identificada no catálogo individual');
   // Verify actual source bytes against canonical edition hash before saving a derivative.
   const original=await provider.readPdf(subject,doc.file_id);
   if(sha(Buffer.from(await original.arrayBuffer()))!==doc.hash.toLowerCase())throw new MarksRejected('Original divergente da edição cadastrada');
   const prepared=checkedPdfCopy({doc,blob:new Blob([operation.bytes],{type:'application/pdf'}),name:doc.title,pagesMarked:operation.pagesMarked});
   if(!guard())throw new MarksRejected('Sessão encerrada');
   try{const saved=await provider.saveAnnotatedPdf(subject,prepared);if(!saved?.id||saved.id===doc.file_id)throw Error('Destino inválido');return {docId:doc.id,name:saved.name,updated:!!saved.updated}}
   catch{throw new MarksUncertain('Cópia não confirmada. Verifique o Drive antes de repetir; original preservado.')}
  }finally{busy.delete(subject)}
 };
}

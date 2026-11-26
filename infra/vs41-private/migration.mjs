// Read-only migration assessment. Never connect to Drive or write the source snapshot.
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {pathToFileURL} from 'node:url';
import {createReader,verifyRecords,readableCardId,readableExplanation,legacyCardId} from './catalog.mjs';
const sha=b=>createHash('sha256').update(b).digest('hex');
const gitBlob=b=>createHash('sha1').update('blob '+b.length+'\0').update(b).digest('hex');
const idOk=x=>typeof x==='string'&&/^[A-Za-z0-9_-]{1,160}$/.test(x);
const PROJECT='bm-portal-multi-v1';
const MAX=32*1024*1024;
export function assessCatalog(snapshot,contract){
 if(!contract||!snapshot||snapshot.format!==contract.format||snapshot.source_head!==contract.source_head||!Array.isArray(snapshot.base)||!Array.isArray(snapshot.ijui)||snapshot.ijui.length||!contract.unified||!contract.active_only)throw Error('Catálogo não corresponde ao contrato ativo unificado');
 const records=snapshot.base;
 if(records.length!==contract.counts.canonical||records.filter(c=>c.active===true).length!==contract.counts.active||records.some(c=>c.active!==true))throw Error('Contagem do catálogo divergente');
 const ids=new Set(records.map(c=>c.id)),missingModules=[],missingLinks=[],badFields=[],media=[],historicalIds=new Set();
 const compatibility={legacyWithoutProfile:0,profileWithoutEditorial:0,profileWithoutModules:0,moduleCountMismatch:0,moduleOrderMismatch:0,moduleTextMismatch:0,strictModules:0,readerCompatible:0,readerIncompatible:0,legacyIds:0,legacyWithoutExplanation:0,fieldFailures:{},moduleFailures:{}};
 const fieldChecks={id:c=>readableCardId(c.id),front:c=>typeof c.front==='string'&&!!c.front.trim(),back:c=>typeof c.back==='string'&&!!c.back.trim(),expl:c=>readableExplanation(c),active:c=>typeof c.active==='boolean',discipline:c=>typeof c.discipline==='string',group:c=>typeof c.group==='string',subject:c=>typeof c.subject==='string'};
 if(ids.size!==records.length)throw Error('IDs duplicados');
 for(const c of records){
  const p=c.consolidation?.profile;
  if(legacyCardId(c.id)){compatibility.legacyIds++;if(!Object.hasOwn(c,'expl'))compatibility.legacyWithoutExplanation++}
  const failedFields=Object.entries(fieldChecks).filter(([,valid])=>!valid(c)).map(([k])=>k);
  if(failedFields.length){badFields.push(c.id);for(const k of failedFields)compatibility.fieldFailures[k]=(compatibility.fieldFailures[k]||0)+1}
  // The private reader accepts original flat cards; strict editorial completeness is independent.
  const readerOk=!failedFields.length&&(c.related_card_ids===undefined||(Array.isArray(c.related_card_ids)&&c.related_card_ids.every(id=>ids.has(id))));
  compatibility[readerOk?'readerCompatible':'readerIncompatible']++;
  const failures=[];
  if(!p)failures.push('legacyWithoutProfile');
  else{
   if(!p.editorial)failures.push('profileWithoutEditorial');
   if(!Array.isArray(p.modules))failures.push('profileWithoutModules');
   else{
    if(p.modules.length!==11)failures.push('moduleCountMismatch');
    if(p.modules.some((m,i)=>!m||m.ord!==i+1))failures.push('moduleOrderMismatch');
    if(p.modules.some(m=>!m||typeof m.titulo!=='string'||typeof m.texto!=='string'||!m.texto.trim()))failures.push('moduleTextMismatch');
   }
  }
  if(failures.length){missingModules.push(c.id);for(const reason of failures)compatibility[reason]++;const key=failures.join('+');compatibility.moduleFailures[key]=(compatibility.moduleFailures[key]||0)+1}
  else compatibility.strictModules++;
  for(const id of c.consolidation?.historical_ids||[])historicalIds.add(id);
  for(const id of new Set([...(c.related_card_ids||[]),...(p?.related_card_ids||[])])){if(!ids.has(id))missingLinks.push({card:c.id,target:id})}
  for(const m of p?.editorial?.media||[]){media.push({card:c.id,id:m.id||null,private:!!m.private_original,inline:!!m.inline_svg,external:!!(m.src||m.url)})}
 }
 const legacy=Array.isArray(snapshot.retired_ids)?snapshot.retired_ids:[];
 const inactiveTargets=missingLinks.filter(x=>historicalIds.has(x.target)||legacy.includes(x.target)).length;
 const report={catalog:contract.display_version,active:records.length,uniqueIds:ids.size,modulesComplete:records.length-missingModules.length,compatibility,missingModules,invalidFields:badFields,unresolvedLinks:missingLinks,linksToHistoricalIds:inactiveTargets,media:{associations:media.length,inline:media.filter(x=>x.inline).length,privateOriginal:media.filter(x=>x.private).length,externalOrStatic:media.filter(x=>x.external).length,requiresMapping:media.filter(x=>x.private||x.external).length},historicalIds:historicalIds.size,retiredIds:legacy.length,recordBytes:Buffer.byteLength(JSON.stringify(records)),recordsSha256:sha(JSON.stringify(records))};
 report.technicalReaderReady=compatibility.readerIncompatible===0&&!missingLinks.length&&report.recordBytes<MAX-4096;
 report.cardCopyReady=!missingModules.length&&!badFields.length&&!missingLinks.length&&report.recordBytes<MAX-4096;
 report.fullMigrationReady=false; // Histories and private files need their own verified sources.
 return report;
}
export function prepareCardCopy(snapshot,contract,subject){
 if(!idOk(subject))throw Error('Titular de destino inválido');
 const audit=assessCatalog(snapshot,contract);
 if(!audit.cardCopyReady)throw Error('Catálogo requer resolução explícita de pendências; nenhuma cópia preparada');
 const records=verifyRecords(snapshot.base),payload={schema:'BM-PORTAL-COLLECTION/1',project:PROJECT,owner:subject,kind:'cards',records};
 const bytes=Buffer.from(JSON.stringify(payload));
 if(bytes.length>MAX)throw Error('Coleção acima do limite');
 if(sha(JSON.stringify(records))!==audit.recordsSha256)throw Error('Conteúdo alterado durante preparação');
 return {payload,receipt:{owner:subject,catalog:audit.catalog,records:records.length,recordsSha256:audit.recordsSha256,payloadSha256:sha(bytes),bytes:bytes.length,mode:'prepared-not-uploaded'}};
}
// Inventory only: never fetch external URLs, copy originals or serve arbitrary repository files.
export function inventoryMedia(records,root=process.cwd()){
 const assets=fs.realpathSync(path.join(root,'assets')),items=[],legacy=[],byId=new Map(),fileCache=new Map();
 function localFile(src){
  if(typeof src!=='string'||!/^assets\/(?:[A-Za-z0-9_-]+\/)*[A-Za-z0-9_.-]+\.(?:svg|png|jpe?g|webp|gif|pdf)$/i.test(src)||src.split('/').some(p=>p==='.'||p==='..'))return null;
  if(fileCache.has(src))return fileCache.get(src);
  let result=null;
  try{
   const full=fs.realpathSync(path.join(root,src)),st=fs.statSync(full);
   if(full.startsWith(assets+path.sep)&&st.isFile()&&st.size>0&&st.size<=25*1024*1024){
    const bytes=fs.readFileSync(full);
    if(bytes.length===st.size)result={sha256:sha(bytes),bytes:bytes.length};
   }
  }catch{}
  fileCache.set(src,result);return result;
 }
 for(const c of records){
  const media=c.consolidation?.profile?.editorial?.media||[];
  for(const id of new Set(Array.isArray(c.related_image_ids)?c.related_image_ids:[]))legacy.push({card:c.id,id});
  for(const m of media){
   const id=m?.id,src=m?.src||m?.public_src||m?.url;
   let kind='unresolved',digest=null;
   if(m?.private_original)kind='private-original';
   else if(typeof m?.inline_svg==='string'&&m.inline_svg.trim()){kind='inline-svg';digest=sha(m.inline_svg)}
   else if(typeof src==='string'&&src.startsWith('assets/')){
    const local=localFile(src);kind=local?'local-verified':'local-unverified';digest=local?.sha256||null;
   }else if(typeof src==='string'&&/^https?:\/\//i.test(src))kind='external-unverified';
   const entry={card:c.id,id:idOk(id)?id:null,kind,sha256:digest};
   items.push(entry);
   if(entry.id){const v=byId.get(id)||new Set();v.add(JSON.stringify([kind,digest,src||null]));byId.set(id,v)}
  }
 }
 const counts={};for(const m of items)counts[m.kind]=(counts[m.kind]||0)+1;
 const editorialKeys=new Set(items.filter(x=>x.id).map(x=>x.card+'\0'+x.id));
 return {associations:items.length,uniqueEditorialIds:byId.size,counts,missingEditorialIds:items.filter(x=>!x.id).length,conflictingEditorialIds:[...byId.values()].filter(x=>x.size>1).length,legacyImageAssociations:legacy.length,legacyNotInEditorial:legacy.filter(x=>!editorialKeys.has(x.card+'\0'+x.id)).length,uniqueLocalFiles:[...fileCache.values()].filter(Boolean).length,sourceVerificationOnly:true,privateMigrationReady:false};
}
// Explicit public editorial assets only, never a fallback for unavailable private originals.
export function createStaticMediaReader({resolveSession,getToken,fetcher=fetch,root=process.cwd()}){
 const read=createReader({resolveSession,getToken,fetcher}),fail=()=>{throw Error('Figura editorial indisponível')};
 const mime={svg:'image/svg+xml',png:'image/png',jpg:'image/jpeg',jpeg:'image/jpeg',webp:'image/webp',gif:'image/gif'};
 let index=null;
 function source(m){
  if(!m||m.private_original||typeof m.src!=='string'||!/^assets\/(?:[A-Za-z0-9_-]+\/)*[A-Za-z0-9_.-]+\.(?:svg|png|jpe?g|webp|gif)$/i.test(m.src)||m.src.split('/').some(p=>p==='.'||p==='..'))return null;
  return m.src;
 }
 function bytes(src){
  const base=fs.realpathSync(path.join(root,'assets')),full=fs.realpathSync(path.join(root,src));
  if(!full.startsWith(base+path.sep))fail();
  const st=fs.statSync(full);if(!st.isFile()||st.size<1||st.size>25*1024*1024)fail();
  const data=fs.readFileSync(full);if(data.length!==st.size)fail();
  return data;
 }
 function official(){
  if(index)return index;
  const {snapshot}=readOfficial(root),next=new Map();
  for(const c of snapshot.base)for(const m of c.consolidation?.profile?.editorial?.media||[]){
   const src=source(m);if(!src||!idOk(m.id))continue;
   const key=c.id+'\0'+m.id;
   if(next.has(key))fail();
   next.set(key,src);
  }
  index=next;return index;
 }
 return async(req,cardId,mediaId)=>{
  if(!readableCardId(cardId)||!idOk(mediaId))fail();
  const session=await resolveSession(req);if(!session)fail();
  const {records}=await read(req),c=records.find(x=>x.id===cardId&&x.active);
  const matches=(c?.consolidation?.profile?.editorial?.media||[]).filter(m=>m.id===mediaId);
  if(matches.length!==1)fail();
  const src=source(matches[0]);if(!src||official().get(cardId+'\0'+mediaId)!==src)fail();
  const data=bytes(src),live=await resolveSession(req);
  if(!live||['subject','rootId','profileId','sessionId'].some(k=>live[k]!==session[k]))fail();
  return {bytes:data,mimeType:mime[src.split('.').pop().toLowerCase()],sha256:sha(data)};
 };
}
export function readOfficial(root=process.cwd()){
 const manifest=JSON.parse(fs.readFileSync(path.join(root,'assets/version.json'),'utf8')),c=manifest.catalog;
 if(!/^assets\/catalog_snapshot_[A-Za-z0-9_-]+\.json$/.test(c.path))throw Error('Caminho do catálogo inválido');
 const bytes=fs.readFileSync(path.join(root,c.path));
 if(gitBlob(bytes)!==c.git_blob)throw Error('Hash Git do catálogo divergente');
 return {snapshot:JSON.parse(bytes.toString('utf8')),contract:c};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
 try{
  const {snapshot,contract}=readOfficial();
  const report=assessCatalog(snapshot,contract);
  report.mediaInventory=inventoryMedia(snapshot.base);
  // Only aggregate counts in CI logs; no private data or generated collection.
  console.log(JSON.stringify({...report,missingModules:report.missingModules.length,invalidFields:report.invalidFields.length,unresolvedLinks:report.unresolvedLinks.length},null,2));
 }catch(e){console.error('Auditoria não concluída: '+e.message);process.exitCode=1}
}

// Read-only migration assessment. Never connect to Drive or write the source snapshot.
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {pathToFileURL} from 'node:url';
import {verifyRecords} from './catalog.mjs';
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
 if(ids.size!==records.length)throw Error('IDs duplicados');
 for(const c of records){
  const p=c.consolidation?.profile;
  if(!/^CARD-[0-9]{4,12}$/.test(c.id)||typeof c.front!=='string'||!c.front.trim()||typeof c.back!=='string'||!c.back.trim()||typeof c.expl!=='string'||typeof c.discipline!=='string'||typeof c.group!=='string'||typeof c.subject!=='string')badFields.push(c.id);
  if(!p||!p.editorial||!Array.isArray(p.modules)||p.modules.length!==11||p.modules.some((m,i)=>m.ord!==i+1||typeof m.titulo!=='string'||typeof m.texto!=='string'||!m.texto.trim()))missingModules.push(c.id);
  for(const id of c.consolidation?.historical_ids||[])historicalIds.add(id);
  for(const id of new Set([...(c.related_card_ids||[]),...(p?.related_card_ids||[])])){if(!ids.has(id))missingLinks.push({card:c.id,target:id})}
  for(const m of p?.editorial?.media||[]){media.push({card:c.id,id:m.id||null,private:!!m.private_original,inline:!!m.inline_svg,external:!!(m.src||m.url)})}
 }
 const legacy=Array.isArray(snapshot.retired_ids)?snapshot.retired_ids:[];
 const inactiveTargets=missingLinks.filter(x=>historicalIds.has(x.target)||legacy.includes(x.target)).length;
 const report={catalog:contract.display_version,active:records.length,uniqueIds:ids.size,modulesComplete:records.length-missingModules.length,missingModules,invalidFields:badFields,unresolvedLinks:missingLinks,linksToHistoricalIds:inactiveTargets,media:{associations:media.length,inline:media.filter(x=>x.inline).length,privateOriginal:media.filter(x=>x.private).length,externalOrStatic:media.filter(x=>x.external).length,requiresMapping:media.filter(x=>x.private||x.external).length},historicalIds:historicalIds.size,retiredIds:legacy.length,recordBytes:Buffer.byteLength(JSON.stringify(records)),recordsSha256:sha(JSON.stringify(records))};
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
  // Only aggregate counts in CI logs; no private data or generated collection.
  console.log(JSON.stringify({...report,missingModules:report.missingModules.length,invalidFields:report.invalidFields.length,unresolvedLinks:report.unresolvedLinks.length},null,2));
 }catch(e){console.error('Auditoria não concluída: '+e.message);process.exitCode=1}
}

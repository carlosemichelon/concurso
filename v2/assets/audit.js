/* Banco Mestre V2 — conciliação puramente local e somente leitura.
 * "Referenciado no catálogo" NÃO significa que os bytes sejam públicos nem que a imagem abra.
 * "Não observado" NÃO significa exclusão no Drive (permissões, pasta fora do escopo, filtros).
 */
export const AUDIT_SCHEMA='BancoMestreV2ReconciliationV1';
const validId=s=>/^[A-Za-z0-9_-]{10,200}$/.test(String(s||''));
const distinct=values=>[...new Set(values.filter(validId))];
function catalogEntries(snapshot,kind){
  if(kind==='image'){
    const values=[...snapshot.recoveredByImageId.values()];
    const rows=values.map(x=>({
      id:String(x.driveFileId||x.id||''),catalogId:String(x.no||''),
      title:String(x.title||x.name||''),mimeType:String(x.mime||''),source:'V180/V198'
    }));
    if(rows.length!==93 || distinct(rows.map(x=>x.id)).length!==93)
      throw Error('Inventário dos 93 originais de imagem não está íntegro');
    return rows;
  }
  const pdfs=snapshot.pdf?.documents;
  if(!Array.isArray(pdfs)||pdfs.length!==78)throw Error('Catálogo público de PDF V149 incompleto');
  const rows=pdfs.map(x=>({
    id:String(x.file_id||''),catalogId:String(x.id||''),
    title:String(x.title||x.filename||''),mimeType:'application/pdf',source:'V149'
  }));
  if(distinct(rows.map(x=>x.id)).length!==78)throw Error('IDs de Drive duplicados ou ausentes no catálogo PDF');
  return rows;
}
function group(kind,known,scan,previewedIds){
  const byId=new Map(known.map(x=>[x.id,x]));
  const seen=new Set();
  const observations=[];
  if(scan){
    if(scan.kind!==kind||!Array.isArray(scan.files)||!scan.checkedAt)
      throw Error('Resposta de varredura '+kind+' inconsistente');
    for(const file of scan.files){
      if(!validId(file.id))throw Error('ID de arquivo inválido no resultado de varredura');
      if(seen.has(file.id))throw Error('Duplicação de ID no resultado de varredura');
      seen.add(file.id);
      const cataloged=byId.get(file.id);
      observations.push(Object.freeze({
        type:kind,driveId:file.id,catalogId:cataloged?.catalogId||'',
        title:cataloged?.title||file.name||'Sem nome',driveName:file.name||'',
        mimeType:file.mimeType||cataloged?.mimeType||'',sourcePath:file.path||'',
        modifiedTime:file.modifiedTime||'',size:Number(file.size||0),
        status:cataloged?'listed_and_referenced':'new_in_drive',
        previewed:kind==='image'&&previewedIds.has(file.id)
      }));
    }
    // Um catálogo pode referenciar arquivo fora das pastas monitoradas: NÃO chamar "faltante".
    for(const entry of known){
      if(seen.has(entry.id))continue;
      observations.push(Object.freeze({
        type:kind,driveId:entry.id,catalogId:entry.catalogId,title:entry.title,
        driveName:'',mimeType:entry.mimeType,sourcePath:'',modifiedTime:'',size:0,
        status:'not_observed_in_monitored_roots',previewed:false
      }));
    }
  }
  const foundReferenced=observations.filter(x=>x.status==='listed_and_referenced').length;
  const newInDrive=observations.filter(x=>x.status==='new_in_drive').length;
  const notObserved=observations.filter(x=>x.status==='not_observed_in_monitored_roots').length;
  return Object.freeze({
    kind,scanned:Boolean(scan),checkedAt:scan?.checkedAt||null,
    referenced:known.length,listed:scan?.found??null,
    referencedAndListed:scan?foundReferenced:null,
    newInDrive:scan?newInDrive:null,
    notObserved:scan?notObserved:null,
    folders:scan?.folderCount??null,pages:scan?.pages??null,
    previewed:scan?observations.filter(x=>x.previewed).length:null,
    records:observations
  });
}
export function reconcile(snapshot,{images=null,pdfs=null,previewedIds=[]}={}){
  if(!snapshot?.recoveredByImageId||!snapshot?.pdf?.documents||!snapshot?.editorial?.records)
    throw Error('Snapshot público incompleto');
  if(snapshot.editorial.records.length!==179)throw Error('Contagem pública do Atlas divergente');
  const previewed=new Set(previewedIds);
  const imageGroup=group('image',catalogEntries(snapshot,'image'),images,previewed);
  const pdfGroup=group('pdf',catalogEntries(snapshot,'pdf'),pdfs,previewed);
  return Object.freeze({
    schema:AUDIT_SCHEMA,
    generatedAt:new Date().toISOString(),
    scope:'browser_session_authorized_drive_read_only',
    publicCatalog:Object.freeze({
      cards:1518,images:179,
      historicalImagesWithoutMappedDriveId:86,
      recoveredImagesWithMappedDriveId:93,pdfs:78,
      versions:{cards:'V194',images:'V198',pdfs:'V149',storage:'V202'}
    }),
    images:imageGroup,pdfs:pdfGroup,
    complete:imageGroup.scanned&&pdfGroup.scanned,
    interpretation:[
      'Referenciado significa ID no catálogo estático, NÃO hospedagem dos bytes no GitHub.',
      'Não observado na varredura NÃO significa removido, corrompido ou inexistente no Drive.',
      'Arquivos fora do catálogo podem ser antigos; a classificação não comprova data de upload.',
      'Arquivos fora do catálogo exigem classificação, aprovação e publicação separada.',
      'Metadados, permissões, alterações de conteúdo e hashes NÃO foram auditados por esta comparação.'
    ]
  });
}
/** Exportações são criadas apenas mediante clique; não faz fetch, upload ou storage. */
export function exportPayload(audit,{includeIdentifiers=false}={}){
  if(!audit||audit.schema!==AUDIT_SCHEMA)throw Error('Relatório não reconhecido');
  const compact=g=>({
    scanned:g.scanned,checkedAt:g.checkedAt,referenced:g.referenced,
    listed:g.listed,referencedAndListed:g.referencedAndListed,
    newInDrive:g.newInDrive,notObserved:g.notObserved,
    folders:g.folders,pages:g.pages,previewed:g.previewed
  });
  const payload={
    schema:AUDIT_SCHEMA,generatedAt:audit.generatedAt,
    scope:audit.scope,complete:audit.complete,
    containsPrivateIdentifiers:Boolean(includeIdentifiers),
    publicCatalog:audit.publicCatalog,
    images:compact(audit.images),pdfs:compact(audit.pdfs),
    interpretation:audit.interpretation,
    uploadPerformed:false,publishedToGithub:false,oauthTokenIncluded:false
  };
  if(includeIdentifiers){
    for(const type of ['images','pdfs']){
      payload[type].records=audit[type].records.map(x=>({
        type:x.type,driveId:x.driveId,catalogId:x.catalogId,title:x.title,driveName:x.driveName,
        mimeType:x.mimeType,sourcePath:x.sourcePath,modifiedTime:x.modifiedTime,
        size:x.size,status:x.status,previewed:x.previewed
      }));
    }
  }
  return payload;
}

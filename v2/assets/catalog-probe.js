/* V2 — confirmação pontual dos 78 documentos de referência por ID no Drive.
 * Leitura somente após comando manual, sem publicar nomes, tokens ou arquivos.
 * "Não listado em pasta" nunca é equivalente a "não acessível por ID".
 */
const FILE_ID=/^[A-Za-z0-9_-]{10,200}$/;
const PDF_MIME='application/pdf';
export const PROBE_STATUSES=Object.freeze({
  verified:'PDF acessível e identificado',
  incompatible:'ID acessível, mas formato/identidade divergente',
  inaccessible:'Sem acesso confirmado (403/404)',
  temporary_error:'Falha temporária de consulta',
  invalid_reference:'Referência inválida no catálogo'
});
export function validatePdfReferences(documents){
  if(!Array.isArray(documents)||documents.length!==78)
    throw Error('Esperados 78 documentos do catálogo V149');
  const ids=new Set(),catalog=new Set();
  for(const doc of documents){
    if(!doc||typeof doc.id!=='string'||!doc.id.trim()||catalog.has(doc.id))
      throw Error('ID editorial PDF duplicado ou inexistente');
    catalog.add(doc.id);
    if(typeof doc.file_id!=='string'||!FILE_ID.test(doc.file_id)||ids.has(doc.file_id))
      throw Error('ID Drive PDF inválido/duplicado: '+doc.id);
    ids.add(doc.file_id);
  }
  return documents.map(doc=>Object.freeze({
    catalogId:doc.id,driveId:doc.file_id,title:String(doc.title||doc.filename||doc.id).slice(0,260)
  }));
}
export function classifyPdfMetadata(reference,result){
  const input={catalogId:reference.catalogId,driveId:reference.driveId,
    title:reference.title,status:'',driveName:'',mimeType:'',
    size:null,parentCount:null,reason:''};
  if(result?.error){
    const message=String(result.error||'falha desconhecida').slice(0,240);
    const code=Number(result.status||0);
    input.status=code===403||code===404?'inaccessible':'temporary_error';
    input.reason=code?('HTTP '+code):message;
    return Object.freeze(input);
  }
  const item=result?.metadata;
  if(!item||typeof item!=='object'||item.id!==reference.driveId){
    input.status='incompatible';input.reason='Drive retornou ID diferente ou metadados incompletos';
    return Object.freeze(input);
  }
  input.driveName=String(item.name||'').slice(0,260);
  input.mimeType=String(item.mimeType||'').slice(0,160);
  input.size=Number.isFinite(Number(item.size))?Number(item.size):null;
  input.parentCount=Array.isArray(item.parents)?item.parents.length:null;
  input.status=item.mimeType===PDF_MIME&&!item.trashed?'verified':'incompatible';
  if(input.status==='incompatible')
    input.reason=item.trashed?'Arquivo sinalizado como na lixeira':'MIME diferente de application/pdf';
  return Object.freeze(input);
}
export function buildPdfProbeReport(records,{startedAt,finishedAt,expected=78}={}){
  const statuses=['verified','incompatible','inaccessible','temporary_error','invalid_reference'];
  if(!Array.isArray(records)||records.length>expected)throw Error('Resultado de conferência inválido');
  const counts=Object.fromEntries(statuses.map(x=>[x,records.filter(v=>v.status===x).length]));
  const completed=records.length;
  return Object.freeze({
    schema:'BancoMestreV2PdfIdAudit',
    scope:'authenticated_metadata_lookup_by_exact_id_only',
    expected,completed,complete:completed===expected,
    counts,
    checkedAt:finishedAt||new Date().toISOString(),
    startedAt:startedAt||null,
    records,
    disclaimer:'HTTP 403/404 não prova exclusão; pode indicar falta de permissão na conta autorizada. A leitura de metadados não confere integridade SHA-256 do conteúdo.'
  });
}
export async function probePdfReferences(service,documents,{concurrency=3,onProgress=()=>{}}={}){
  const refs=validatePdfReferences(documents);
  if(!service?.connected)throw Error('Conecte o Google Drive para conferir os PDFs por ID');
  if(!Number.isInteger(concurrency)||concurrency<1||concurrency>5)
    throw Error('Limite de consultas simultâneas inválido');
  const startedAt=new Date().toISOString(),generation=service.sessionEpoch;
  const rows=new Array(refs.length);
  let cursor=0,done=0,closed=false;
  async function worker(){
    while(true){
      if(closed)return;
      if(!service.connected||service.sessionEpoch!==generation){
        closed=true;throw Error('Conferência cancelada: autorização Google Drive alterada');
      }
      const i=cursor++;
      if(i>=refs.length)return;
      const reference=refs[i];
      let result;
      try{result={metadata:await service.probePdfFileMetadata(reference.driveId)}}
      catch(error){
        if(!service.connected||service.sessionEpoch!==generation){
          closed=true;throw Error('Conferência cancelada: autorização Google Drive encerrada');
        }
        const code=Number((String(error?.message||'').match(/HTTP\s+(\d{3})/)||[])[1]||0);
        result={error:error?.message||'Não foi possível consultar',status:code};
      }
      if(closed||!service.connected||service.sessionEpoch!==generation){
        closed=true;throw Error('Conferência cancelada: autorização Google Drive encerrada');
      }
      rows[i]=classifyPdfMetadata(reference,result);
      done++;
      onProgress({completed:done,expected:refs.length,
        counts:buildPdfProbeReport(rows.filter(Boolean),{expected:refs.length}).counts});
    }
  }
  try{await Promise.all(Array.from({length:Math.min(concurrency,refs.length)},worker))}
  catch(error){closed=true;throw error}
  if(!service.connected||service.sessionEpoch!==generation)
    throw Error('Conferência descartada: sessão Google encerrada');
  return buildPdfProbeReport(rows,{startedAt,expected:refs.length});
}
export function publicPdfProbeSummary(report){
  if(!report||report.schema!=='BancoMestreV2PdfIdAudit')throw Error('Auditoria PDF inválida');
  return Object.freeze({
    schema:report.schema,
    scope:report.scope,expected:report.expected,completed:report.completed,
    complete:report.complete,counts:report.counts,checkedAt:report.checkedAt,
    includesPrivateIdentifiers:false
  });
}

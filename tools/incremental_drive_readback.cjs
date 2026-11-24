'use strict';
// Adaptador de leitura privada. Usar somente em sessão autorizada/local.
// Nunca enviar resposta do Docs, token, conteúdo do lote ou hash privado ao GitHub.
const assert=require('node:assert/strict');
const {batchHash}=require('./incremental_resume.cjs');
const START='<<<BM_PRIVATE_BATCH_V1>>>';
const END='<<<END_BM_PRIVATE_BATCH_V1>>>';
const index=(text,token)=>text.split(token).length-1;
function docText(doc){
 // Docs API: body legado ou conteúdo de abas. Nunca contar ambos.
 function bodyText(body){
  let out='';
  for(const e of body?.content||[]){
   if(e.paragraph)for(const p of e.paragraph.elements||[])out+=p.textRun?.content||'';
   if(e.table)for(const r of e.table.tableRows||[])for(const c of r.tableCells||[])out+=bodyText(c);
  }
  return out;
 }
 function tabText(t){
  return bodyText(t.documentTab?.body||t.body)+(t.childTabs||[]).map(tabText).join('\n');
 }
 return Array.isArray(doc.tabs)&&doc.tabs.length?doc.tabs.map(tabText).join('\n'):bodyText(doc.body);
}
function inspectDriveDocument(doc,batchId,expectedHash){
 // Ausência em documento narrativo legado não comprova que não existe lote.
 if(!doc||typeof doc.revisionId!=='string'||!doc.revisionId||!doc.documentId)return 'UNKNOWN';
 if(typeof batchId!=='string'||!batchId||!/^[a-f0-9]{64}$/.test(expectedHash||''))return 'UNKNOWN';
 const text=docText(doc),starts=index(text,START),ends=index(text,END);
 if(!starts&&!ends)return 'UNKNOWN';
 if(starts!==ends||starts!==1)return 'CONFLICT'; // um lote por documento ativo
 const a=text.indexOf(START)+START.length,b=text.indexOf(END);
 if(b<a)return 'CONFLICT';
 let delta;
 try{delta=JSON.parse(text.slice(a,b).trim())}catch{return 'CONFLICT'}
 if(!delta||delta.format!=='BancoMestrePrivateBatch1'||delta.state!=='FROZEN'||delta.batch_id!==batchId||delta.content===undefined)return 'CONFLICT';
 if(delta.content_sha256!==expectedHash||batchHash(delta)!==expectedHash)return 'CONFLICT';
 return 'MATCH';
}
// Leitura direta Google Docs; nenhuma operação de escrita, nenhum token em URL.
// Token fornecido exclusivamente pelo ambiente privado já autorizado.
async function readGoogleDoc({documentId,accessToken,fetchImpl=globalThis.fetch}){
 assert.match(documentId,/^[A-Za-z0-9_-]+$/);
 assert.ok(typeof accessToken==='string'&&accessToken.length>0,'OAuth privado obrigatório');
 const r=await fetchImpl('https://docs.googleapis.com/v1/documents/'+documentId+'?includeTabsContent=true',{headers:{Authorization:'Bearer '+accessToken},redirect:'error'});
 if(!r.ok)throw Error('Drive readback unavailable ('+r.status+')');
 const doc=await r.json();
 if(doc.documentId!==documentId)throw Error('Documento divergente');
 return doc;
}
function driveVerifier({documentId,readDocument}){
 assert.ok(typeof readDocument==='function');
 return async request=>{
  if(request.stage!=='drive')return 'UNKNOWN';
  if(request.receipt&&request.receipt.reference!==documentId)return 'CONFLICT';
  const doc=await readDocument(documentId);
  if(doc.documentId!==documentId)return 'CONFLICT';
  return inspectDriveDocument(doc,request.batch_id,request.content_sha256);
 };
}
module.exports={START,END,docText,inspectDriveDocument,readGoogleDoc,driveVerifier};

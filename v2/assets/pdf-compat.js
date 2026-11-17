/* Banco Mestre V2 — compatibilidade somente leitura com grifos legados V122.
 * A V1 usa docId + SHA256(primeiros 12 bytes hex) + Pn.
 * NÃO chama migrate/capture/persistPage, não altera localStorage nem IndexedDB.
 */
export const LEGACY_STROKES_PREFIX='BM030_STROKES_PDF:';
export const LEGACY_DELETIONS_KEY='BM122_DELETED_HIGHLIGHT_IDS';
export const LEGACY_META_KEY='BM062_GRIFOS_META';
export const MAX_PDF_BYTES=120000000;
const PAGE_LIMIT=100000;
const KEY_LIMIT=10000;
const MARK_LIMIT=100000;
const SHA12=/^[a-f0-9]{24}$/;
const DOC_ID=/^[A-Za-z0-9_-]{3,150}$/;
export function pageStorageKey(documentId,hash,page){
  if(!DOC_ID.test(documentId)||!SHA12.test(hash)||!Number.isInteger(page)||page<1||page>PAGE_LIMIT)
    throw Error('Identidade de página PDF inválida');
  return LEGACY_STROKES_PREFIX+documentId+':'+hash+':P'+page;
}
export function parsePageKey(key){
  if(typeof key!=='string'||!key.startsWith(LEGACY_STROKES_PREFIX))return null;
  const m=/^BM030_STROKES_PDF:([^:]+):([^:]+):P(\d+)$/.exec(key);
  if(!m||!DOC_ID.test(m[1]))return null;
  const page=Number(m[3]);
  if(!Number.isInteger(page)||page<1||page>PAGE_LIMIT)return null;
  return {documentId:m[1],hash:m[2],page,key};
}
export async function sourceHash(buffer,cryptoApi=globalThis.crypto){
  if(!(buffer instanceof ArrayBuffer))throw Error('Buffer do PDF não reconhecido');
  if(buffer.byteLength>MAX_PDF_BYTES)throw Error('PDF acima de 120 MB');
  if(buffer.byteLength<5||!new Uint8Array(buffer,0,5).every((n,i)=>n===[37,80,68,70,45][i]))
    throw Error('O arquivo não começa com a assinatura %PDF-');
  if(!cryptoApi?.subtle?.digest)throw Error('SHA-256 não disponível neste contexto seguro');
  const digest=await cryptoApi.subtle.digest('SHA-256',buffer);
  return [...new Uint8Array(digest)].slice(0,12).map(b=>b.toString(16).padStart(2,'0')).join('');
}
function parseDeletionMap(storage){
  const raw=storage.getItem(LEGACY_DELETIONS_KEY);
  if(raw===null)return {};
  if(raw.length>12000000)throw Error('Índice de exclusões acima de 12 MB');
  const parsed=JSON.parse(raw);
  if(!parsed||typeof parsed!=='object'||Array.isArray(parsed))
    throw Error('Índice de exclusões não é um objeto');
  return parsed;
}
export function inspectLegacyHighlights(storage,documentId,hash){
  if(!DOC_ID.test(documentId)||!SHA12.test(hash))throw Error('ID ou hash incompatível com a V1');
  if(!storage||typeof storage.getItem!=='function'||typeof storage.key!=='function')
    throw Error('Armazenamento do navegador indisponível');
  if(storage.length>KEY_LIMIT)throw Error('Mais de 10 mil chaves no armazenamento; auditoria bloqueada');
  const deletions=parseDeletionMap(storage);
  const prefix=LEGACY_STROKES_PREFIX+documentId+':';
  const byVersion=new Map(),pages=[],unknownTombstones=[];
  let ambiguousDeletionIdentity=0;
  for(let i=0;i<storage.length;i++){
    const key=storage.key(i);
    if(!key?.startsWith(prefix))continue;
    const info=parsePageKey(key);
    if(!info||info.documentId!==documentId)continue;
    if(info.hash!==hash){
      byVersion.set(info.hash,(byVersion.get(info.hash)||0)+1);
      continue;
    }
    const raw=storage.getItem(key);
    if(!raw)continue;
    if(raw.length>12000000)throw Error('Página excede o limite de leitura');
    const marks=JSON.parse(raw);
    if(!Array.isArray(marks)||marks.length>MARK_LIMIT)throw Error('Grifos da página não formam uma lista válida');
    const tombstones=deletions[key]||{};
    if(!tombstones||typeof tombstones!=='object'||Array.isArray(tombstones))
      throw Error('Exclusões da página inválidas');
    let active=0,deleted=0,textHighlights=0,otherMarks=0;
    for(const mark of marks){
      if(!mark||typeof mark!=='object'){otherMarks++;continue}
      const itemId=typeof mark.id==='string'?'id:'+mark.id:'';
      const hasLegacyIdentity=!itemId;
      // Identidades g:/l: legadas dependem de hash normalizado, não tentar adivinhar.
      const removed=Boolean(mark.bm108_deleted_at||(itemId&&Object.hasOwn(tombstones,itemId)));
      if(removed){deleted++;continue}
      if(hasLegacyIdentity&&Object.keys(tombstones).some(t=>t.startsWith('g:')||t.startsWith('l:')))
        ambiguousDeletionIdentity++;
      active++;
      if(mark.type==='text_highlight')textHighlights++;else otherMarks++;
    }
    pages.push({page:info.page,active,deleted,textHighlights,otherMarks,rawKey:key});
    if(ambiguousDeletionIdentity)unknownTombstones.push(info.page);
  }
  pages.sort((a,b)=>a.page-b.page);
  const counts={
    pages:pages.length,
    marks:pages.reduce((v,x)=>v+x.active,0),
    text:pages.reduce((v,x)=>v+x.textHighlights,0),
    other:pages.reduce((v,x)=>v+x.otherMarks,0),
    deletedFiltered:pages.reduce((v,x)=>v+x.deleted,0),
    ambiguousLegacyDeletionIdentities:ambiguousDeletionIdentity
  };
  return Object.freeze({
    documentId,hash,scope:'read_only_same_browser_origin',
    counts,
    pages:pages.map(({rawKey,...p})=>p),
    otherVersions:[...byVersion.entries()].map(([versionHash,pageCount])=>({versionHash,pageCount})),
    warning:ambiguousDeletionIdentity>0?
      'Identidades antigas de exclusão sem ID exigem conferência na V1. Contagem potencialmente superior ao número real.':
      null
  });
}
export function legacySnapshot(storage,documentId,hash){
  const inspection=inspectLegacyHighlights(storage,documentId,hash);
  const records={};
  for(const page of inspection.pages){
    const key=pageStorageKey(documentId,hash,page.page);
    const raw=storage.getItem(key);
    if(raw!==null)records[key]=raw;
  }
  const deletions=parseDeletionMap(storage),picked={};
  for(const key of Object.keys(records))if(Object.hasOwn(deletions,key))picked[key]=deletions[key];
  // V1 V122 mantém notas/favoritos em uma chave global. Copiar apenas os
  // registros pertencentes a este documento e hash, nunca o objeto inteiro.
  const rawMeta=storage.getItem(LEGACY_META_KEY);
  const metadata={};
  if(rawMeta){
    if(rawMeta.length>12000000)throw Error('Metadados de grifos acima de 12 MB');
    const all=JSON.parse(rawMeta);
    if(!all||typeof all!=='object'||Array.isArray(all))
      throw Error('Metadados de grifos incompatíveis');
    const textPrefix='TXT:'+documentId+':'+hash+':';
    const legacyPrefix='LEGACY:'+LEGACY_STROKES_PREFIX+documentId+':'+hash+':P';
    for(const [key,value] of Object.entries(all)){
      if(key.startsWith(textPrefix)||key.startsWith(legacyPrefix))metadata[key]=value;
    }
  }
  const joinsKey='BM102_PDF_HIGHLIGHT_JOINS:'+encodeURIComponent(documentId)+':'+hash;
  const rawJoins=storage.getItem(joinsKey);
  let highlightJoins=null;
  if(rawJoins!==null){
    if(rawJoins.length>12000000)throw Error('Uniões de grifos acima de 12 MB');
    const joins=JSON.parse(rawJoins);
    if(!Array.isArray(joins))throw Error('Uniões de grifos incompatíveis');
    highlightJoins={key:joinsKey,records:joins};
  }
  return {
    schema:'BancoMestreV2LegacyGrifosBackupV1',
    exportedAt:new Date().toISOString(),
    documentId,sourceHash:hash,
    scope:'backup_read_only_current_source_hash_no_restore',
    records,deletedHighlights:picked,metadata,highlightJoins,
    includesPdfBytes:false,includesSrs:false,restored:false
  };
}

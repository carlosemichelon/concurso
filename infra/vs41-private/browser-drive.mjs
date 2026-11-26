// Same Drive read-only scope as the existing GIS connection. No server or secret.
import {verifyRecords} from './records.mjs';
import {browserByteCache,verifiedCacheKey,cachedVerifiedBytes,rememberVerifiedBytes,hashBytes} from './verified-cache.mjs?v=1';
export const scope='https://www.googleapis.com/auth/drive.readonly';
const base='https://www.googleapis.com/drive/v3/',limit=32*1024*1024;
const validId=id=>typeof id==='string'&&/^[A-Za-z0-9_-]{1,160}$/.test(id);
export function fileId(value){
 const s=String(value||'').trim();if(validId(s))return s;
 try{const u=new URL(s);if(u.protocol!=='https:'||u.hostname!=='drive.google.com')throw Error();
 const match=u.pathname.match(/^\/file\/d\/([A-Za-z0-9_-]+)(?:\/|$)/);
 const id=match?.[1]||(u.pathname==='/open'?u.searchParams.get('id'):null);
 if(validId(id))return id;}catch{}
 throw Error('Informe o link de um arquivo JSON privado, não de uma pasta.');
}
export const currentPointerName='BANCO_MESTRE_ATUAL.json';
export function sourceSelection(value){
 const s=String(value||'').trim();
 try{const u=new URL(s);const m=u.pathname.match(/^\/drive\/(?:u\/\d+\/)?folders\/([A-Za-z0-9_-]+)(?:\/|$)/);
 if(u.protocol==='https:'&&u.hostname==='drive.google.com'&&validId(m?.[1]))return {kind:'folder',id:m[1]};}catch{}
 return {kind:'file',id:fileId(s)};
}
export async function readBrowserSnapshot({token,source,fetcher=fetch,signal,editorialPreview=false,cache=browserByteCache}){
 if(typeof token!=='string'||!token)throw Error('Conecte sua conta Google.');
 const get=async(path,params)=>{
  const r=await fetcher(base+path+'?'+new URLSearchParams(params),{method:'GET',headers:{Authorization:'Bearer '+token},credentials:'omit',redirect:'error',cache:'no-store',signal});
  if(!r.ok)throw Error('Drive HTTP '+r.status+' — confira a autorização e o arquivo.');
  return r;
 };
 const info=async id=>{
  if(!validId(id))throw Error('Arquivo inválido.');
  const r=await get('files/'+encodeURIComponent(id),{fields:'id,name,mimeType,ownedByMe,shared,trashed,parents,size,version,headRevisionId,sha256Checksum,md5Checksum'});
  const m=await r.json();
  if(m.id!==id||m.ownedByMe!==true||m.shared!==false||m.trashed!==false)throw Error('A origem deve ser privada e pertencer à conta Google conectada.');
  return m;
 };
 const selection=sourceSelection(source);
 const folderMime='application/vnd.google-apps.folder';
 let folderId=null;
 const resolveFolder=async id=>{
  const root=await info(id);
  if(root.mimeType!==folderMime)throw Error('Selecione uma pasta privada do Drive.');
  const listing=await (await get('files',{q:"'"+id+"' in parents and trashed = false and name = '"+currentPointerName+"'",fields:'nextPageToken,incompleteSearch,files(id,name,mimeType,parents)',pageSize:'100'})).json();
  if(listing.nextPageToken||listing.incompleteSearch||!Array.isArray(listing.files)||listing.files.length>1)throw Error('A pasta precisa conter um único ponteiro vigente BANCO_MESTRE_ATUAL.json. Origem ambígua ou consulta incompleta.');
  if(!listing.files.length){const e=Error('A pasta precisa conter um único ponteiro vigente BANCO_MESTRE_ATUAL.json. Nenhuma versão histórica foi selecionada.');e.code='CURRENT_POINTER_MISSING';throw e;}
  const f=listing.files[0];
  if(f.name!==currentPointerName||!validId(f.id)||f.mimeType!=='application/json'||f.parents?.length!==1||f.parents[0]!==id)throw Error('Ponteiro vigente inválido.');
  return f.id;
 };
 const resolveEditorial=async id=>{
  const root=await info(id);
  if(root.mimeType!==folderMime)throw Error('Selecione a pasta privada do Banco Mestre.');
  let parent=id;
  for(const [name,mime] of [['01 - Cartões',folderMime],['Dados privados',folderMime],['VC52_EDITORIAL_CANDIDATA.json','application/json']]){
   const listing=await (await get('files',{q:"'"+parent+"' in parents and trashed = false and name = '"+name+"'",fields:'nextPageToken,incompleteSearch,files(id,name,mimeType,parents)',pageSize:'100'})).json();
   if(listing.nextPageToken||listing.incompleteSearch||listing.files?.length!==1)throw Error('Prévia editorial: caminho ausente ou ambíguo em '+name+'. Use o link direto do arquivo verificado.');
   const f=listing.files[0];
   if(!validId(f.id)||f.name!==name||f.mimeType!==mime||f.parents?.length!==1||f.parents[0]!==parent)throw Error('Caminho editorial inválido.');
   const checked=await info(f.id);
   if(checked.name!==name||checked.mimeType!==mime||checked.parents?.length!==1||checked.parents[0]!==parent)throw Error('Caminho editorial alterado.');
   parent=f.id;
  }
  return parent;
 };
 const assertInside=async parentId=>{
  if(!folderId)return;
  const seen=new Set();
  for(let i=0;i<16;i++){
   if(!validId(parentId)||seen.has(parentId))break;
   seen.add(parentId);
   const p=await info(parentId);
   if(p.mimeType!==folderMime)break;
   if(p.id===folderId)return;
   if(p.parents?.length!==1)break;
   parentId=p.parents[0];
  }
  throw Error('Arquivo fora da pasta individual selecionada.');
 };
 const read=async(id,expectedHash)=>{
  const before=await info(id);
  if(!/^application\/json(?:\s*;.*)?$/i.test(before.mimeType||'')||!Number.isSafeInteger(Number(before.size))||Number(before.size)<1||Number(before.size)>limit||!before.version||before.parents?.length!==1)throw Error('Origem JSON inválida ou acima de 32 MB.');
  const parent=await info(before.parents[0]);
  if(parent.mimeType!=='application/vnd.google-apps.folder')throw Error('Pasta privada inválida.');
  await assertInside(parent.id);
  const hash=expectedHash||before.sha256Checksum;
  if(hash&&!/^[a-f0-9]{64}$/.test(hash))throw Error('Hash da origem inválido.');
  const key=verifiedCacheKey(account.user.permissionId,folderId||selection.id,before,hash);
  let bytes=await cachedVerifiedBytes(cache,key,Number(before.size),hash);
  const hit=!!bytes;
  if(!hit){
  const r=await get('files/'+encodeURIComponent(id),{alt:'media'});
  if(!r.body)throw Error('Arquivo vazio.');
  const reader=r.body.getReader();let size=0;const chunks=[];
  try{while(true){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>limit){await reader.cancel();throw Error('Arquivo acima de 32 MB.')}chunks.push(value);}}finally{reader.releaseLock()}
  if(size!==Number(before.size))throw Error('Tamanho da origem mudou.');
  const combined=new Uint8Array(size);let offset=0;for(const part of chunks){combined.set(part,offset);offset+=part.byteLength;}bytes=combined.buffer;
  }
  const after=await info(id);
  if(before.version!==after.version||before.size!==after.size||before.parents[0]!==after.parents?.[0]||['headRevisionId','sha256Checksum','md5Checksum'].some(k=>before[k]!==after[k]))throw Error('Origem alterada durante leitura; tente novamente.');
  await info(parent.id);
  await assertInside(parent.id);
  if(hash&&!hit&&await hashBytes(bytes)!==hash)throw Error('Hash da origem divergente.');
  const data=JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(bytes));
  if(data?.format==='BM-DRIVE-EDITORIAL-SEED/1'){
   const digest=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes)),b=>b.toString(16).padStart(2,'0')).join('');
   if(digest!=='040e7ebc12e0606870fb8dfa39ac43d8b93b906b7a3532af14557b0f8395f419')throw Error('Candidato editorial VC52 não corresponde à cópia verificada.');
  }
  if(!hit&&!signal?.aborted&&hash)await rememberVerifiedBytes(cache,key,bytes);
  return {data,meta:before,cacheHit:hit};
 };
 const account=await (await get('about',{fields:'user(permissionId)'})).json();
 if(!validId(account?.user?.permissionId))throw Error('Identidade Google não confirmada.');
 if(selection.kind==='folder')folderId=selection.id;
 if(editorialPreview&&!folderId)throw Error('Para o teste pela pasta, informe o link da pasta raiz do Banco Mestre.');
 const selectedId=folderId?await (editorialPreview?resolveEditorial(folderId):resolveFolder(folderId)):selection.id;
 let {data,meta,cacheHit}=await read(selectedId,editorialPreview?'040e7ebc12e0606870fb8dfa39ac43d8b93b906b7a3532af14557b0f8395f419':undefined);let pointer=null;
 if(editorialPreview&&(data?.format!=='BM-DRIVE-EDITORIAL-SEED/1'||await resolveEditorial(folderId)!==selectedId))throw Error('Prévia editorial não confirmada ou caminho alterado.');
 if(folderId&&!editorialPreview&&data?.schema!=='banco-mestre-operational-pointer/1')throw Error('A pasta deve apontar para um snapshot privado por meio do ponteiro vigente.');
 if(data?.schema==='banco-mestre-operational-pointer/1'){
  pointer=data.private_base;
  if(!validId(pointer?.file_id)||typeof pointer.version!=='string'||!/^[a-f0-9]{64}$/.test(pointer.sha256||''))throw Error('Ponteiro privado inválido.');
  const snapshot=await read(pointer.file_id,pointer.sha256);
  if(snapshot.data?.version!==pointer.version)throw Error('Versão do ponteiro divergente.');
  const again=await info(meta.id);if(again.version!==meta.version)throw Error('Ponteiro alterado durante leitura.');
  if(folderId&&await resolveFolder(folderId)!==selectedId)throw Error('Ponteiro vigente mudou durante leitura.');
  ({data,meta,cacheHit}=snapshot);
 }
 if(data?.format==='BM-DRIVE-EDITORIAL-SEED/1'){
  if(pointer||(folderId&&!editorialPreview)||data.migration_status!=='editorial-candidate-only'||data.version!=='VC52'||data.source?.git_blob!=='f8ec08f96a17c990371b31f0db200863fccd1c6e')throw Error('Candidato editorial não pode ser usado como base vigente.');
  const records=verifyRecords(data.cards);
  if(records.length!==1460||records.some(c=>c.active!==true)||data.counts?.cards!==records.length||data.counts?.active!==records.length)throw Error('Contagem do candidato VC52 divergente.');
  return {version:data.version,records,scope:'editorial-candidate-only',sourceName:meta.name,cacheHit};
 }
 if(data?.format!=='BancoMestrePrivadoV159'||data.schema_version!==1||typeof data.version!=='string'||!data.version)throw Error('Formato privado ainda não homologado. Nenhum catálogo público será usado.');
 const records=verifyRecords(data.cards);
 if(data.counts?.cards!==records.length||pointer&&pointer.cards!==records.length)throw Error('Contagem de cartões divergente.');
 return {version:data.version,records,scope:'snapshot-only',sourceName:meta.name,cacheHit,srs:Array.isArray(data.srs)?data.srs:null,updated:typeof data.updated==='string'?data.updated:''};
}

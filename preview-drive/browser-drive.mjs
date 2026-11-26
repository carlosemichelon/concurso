// Same Drive read-only scope as the existing GIS connection. No server or secret.
import {verifyRecords} from './records.mjs';
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
export async function readBrowserSnapshot({token,source,fetcher=fetch,signal}){
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
 const read=async(id,expectedHash)=>{
  const before=await info(id);
  if(!/^application\/json(?:\s*;.*)?$/i.test(before.mimeType||'')||!Number.isSafeInteger(Number(before.size))||Number(before.size)<1||Number(before.size)>limit||!before.version||before.parents?.length!==1)throw Error('Origem JSON inválida ou acima de 32 MB.');
  const parent=await info(before.parents[0]);
  if(parent.mimeType!=='application/vnd.google-apps.folder')throw Error('Pasta privada inválida.');
  const r=await get('files/'+encodeURIComponent(id),{alt:'media'});
  if(!r.body)throw Error('Arquivo vazio.');
  const reader=r.body.getReader();let size=0;const chunks=[];
  try{while(true){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>limit){await reader.cancel();throw Error('Arquivo acima de 32 MB.')}chunks.push(value);}}finally{reader.releaseLock()}
  if(size!==Number(before.size))throw Error('Tamanho da origem mudou.');
  const bytes=new Uint8Array(size);let offset=0;for(const part of chunks){bytes.set(part,offset);offset+=part.byteLength;}
  const after=await info(id);
  if(before.version!==after.version||before.size!==after.size||before.parents[0]!==after.parents?.[0]||['headRevisionId','sha256Checksum','md5Checksum'].some(k=>before[k]!==after[k]))throw Error('Origem alterada durante leitura; tente novamente.');
  await info(parent.id);
  const hash=expectedHash||before.sha256Checksum;
  if(hash){if(!/^[a-f0-9]{64}$/.test(hash))throw Error('Hash da origem inválido.');const digest=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes)),b=>b.toString(16).padStart(2,'0')).join('');if(digest!==hash)throw Error('Hash da origem divergente.');}
  return {data:JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(bytes)),meta:before};
 };
 const account=await (await get('about',{fields:'user(permissionId)'})).json();
 if(!validId(account?.user?.permissionId))throw Error('Identidade Google não confirmada.');
 let {data,meta}=await read(fileId(source));let pointer=null;
 if(data?.schema==='banco-mestre-operational-pointer/1'){
  pointer=data.private_base;
  if(!validId(pointer?.file_id)||typeof pointer.version!=='string'||!/^[a-f0-9]{64}$/.test(pointer.sha256||''))throw Error('Ponteiro privado inválido.');
  const snapshot=await read(pointer.file_id,pointer.sha256);
  if(snapshot.data?.version!==pointer.version)throw Error('Versão do ponteiro divergente.');
  const again=await info(meta.id);if(again.version!==meta.version)throw Error('Ponteiro alterado durante leitura.');
  ({data,meta}=snapshot);
 }
 if(data?.format!=='BancoMestrePrivadoV159'||data.schema_version!==1||typeof data.version!=='string'||!data.version)throw Error('Formato privado ainda não homologado. Nenhum catálogo público será usado.');
 const records=verifyRecords(data.cards);
 if(data.counts?.cards!==records.length||pointer&&pointer.cards!==records.length)throw Error('Contagem de cartões divergente.');
 return {version:data.version,records,scope:'snapshot-only',sourceName:meta.name};
}

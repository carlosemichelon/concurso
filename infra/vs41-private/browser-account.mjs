// Single browser account context for the original portal. Existing Drive formats.
// No IDs of a particular student, no alternate data store, no persisted OAuth.
import {readBrowserSnapshot,scope} from './browser-drive.mjs';
export {scope};
const API='https://www.googleapis.com/drive/v3/files';
const folder='application/vnd.google-apps.folder',doc='application/vnd.google-apps.document';
const fields='id,name,mimeType,ownedByMe,shared,trashed,parents,size,version,headRevisionId,md5Checksum,sha256Checksum,modifiedTime,appProperties';
const validId=id=>typeof id==='string'&&/^[A-Za-z0-9_-]{1,160}$/.test(id);
const owned=f=>validId(f?.id)&&f.ownedByMe===true&&f.shared===false&&f.trashed===false;
const esc=s=>String(s).replaceAll('\\','\\\\').replaceAll("'","\\'");
const emptyStudy=()=>({schema:1,subjects:[],sessions:[],reviews:[],plans:[],audit:[],cycle:[],cycleIndex:0,availabilityWeek:15,availabilityMonth:60,activeTimer:null});
export async function connectAccount({token,fetcher=fetch,signal,allowEditorial=()=>false}){
 if(!token)throw Error('Selecione sua conta Google');
 const get=async(url,params={})=>{const r=await fetcher(url+'?'+new URLSearchParams(params),{method:'GET',headers:{Authorization:'Bearer '+token},cache:'no-store',credentials:'omit',redirect:'error',signal});if(!r.ok)throw Error('Drive HTTP '+r.status);return r};
 const meta=async id=>{if(!validId(id))throw Error('Arquivo inválido');const f=await (await get(API+'/'+id,{fields})).json();if(f.id!==id||!owned(f))throw Error('Arquivo não pertence exclusivamente à conta selecionada');return f};
 const list=async q=>{let pageToken='',out=[];for(let i=0;i<100;i++){
  const r=await (await get(API,{q:"trashed = false and 'me' in owners and ("+q+")",fields:'nextPageToken,incompleteSearch,files('+fields+')',pageSize:'1000',...(pageToken?{pageToken}:{})})).json();
  if(r.incompleteSearch||!Array.isArray(r.files))throw Error('Listagem incompleta');
  if(r.files.some(f=>!owned(f)))throw Error('Resultado não privado; consulta suspensa');
  out.push(...r.files);if(!r.nextPageToken)return out;pageToken=r.nextPageToken;
 }throw Error('Listagem excedeu limite seguro')};
 const unique=async(q,label,optional=false)=>{const a=await list(q);if(a.length===0&&optional)return null;if(a.length!==1)throw Error(label+' ausente ou duplicado');return meta(a[0].id)};
 const raw=async(id,max=10000000)=>{const a=await meta(id);if(!Number.isSafeInteger(Number(a.size))||Number(a.size)<1||Number(a.size)>max||!a.version)throw Error('Tamanho ou versão inválida: '+a.name);
  const r=await get(API+'/'+id,{alt:'media'}),bytes=await r.arrayBuffer(),b=await meta(id);
  if(bytes.byteLength!==Number(a.size)||['version','size','headRevisionId','md5Checksum','sha256Checksum'].some(k=>a[k]!==b[k]))throw Error('Arquivo mudou durante leitura: '+a.name);
  if(a.sha256Checksum){const digest=[...new Uint8Array(await crypto.subtle.digest('SHA-256',bytes))].map(n=>n.toString(16).padStart(2,'0')).join('');if(digest!==a.sha256Checksum)throw Error('Hash divergente: '+a.name);}
  return {bytes,meta:a}};
 const json=async(id,max)=>{const r=await raw(id,max);return {data:JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(r.bytes)),meta:r.meta}};
 const root=await unique("mimeType = '"+folder+"' and name = 'DataBase_Concurso'","Pasta individual DataBase_Concurso");
 const rootUrl='https://drive.google.com/drive/folders/'+root.id;
 let snapshot;try{snapshot=await readBrowserSnapshot({token,source:rootUrl,fetcher,signal})}catch(e){if(!String(e.message).includes('único ponteiro vigente')||!await allowEditorial())throw e;snapshot=await readBrowserSnapshot({token,source:rootUrl,fetcher,signal,editorialPreview:true})}
 const records=snapshot.records;
 const master=async(kind,name,format)=>{const f=await unique("mimeType = 'application/json' and (appProperties has { key='bm_kind' and value='"+kind+"' } or name = '"+esc(name)+"')",name,true);
  if(!f)return null;const r=await json(f.id);if(r.data.format!==format)throw Error('Formato incompatível: '+name);return {data:r.data.data,revision:r.meta.version}};
 const study=async()=>{const p=await master('bm_controle_estudos_v245','BancoMestre_Controle_Estudos_V245.json','BancoMestreControleDriveV245');
  if(!p)return {data:emptyStudy(),revision:null};const d=p.data;if(d?.schema!==1||!['subjects','sessions','reviews','cycle'].every(k=>Array.isArray(d[k]))||['plans','audit'].some(k=>d[k]!==undefined&&!Array.isArray(d[k])))throw Error('Controle de Estudos inválido');return {...p,data:{...d,plans:d.plans||[],audit:d.audit||[]}}};
 const gaps=async()=>{const p=await master('bm_lacunas_v242','BancoMestre_Lacunas_Mestre_V242.json','BancoMestreLacunasDriveV242');
  if(!p)return {data:{schema:1,records:[],log:[],updatedAt:null},revisions:{}};const d=p.data;if(d?.schema!==1||!Array.isArray(d.records)||!Array.isArray(d.log)||d.records.some(r=>!validId(r.id)))throw Error('Cadastro de lacunas inválido');return {data:d,revisions:Object.fromEntries(d.records.map(r=>[r.id,p.revision]))}};
 const reviews=async()=>{const files=await list("mimeType = 'application/json' and name contains 'BM_SRS_EVENT_V001_'"),events=[],seen=new Set();
  for(const f of files){const {data:e}=await json(f.id,200000);if(e.schema!=='bm-srs-formal-event/1'||f.name!=='BM_SRS_EVENT_V001_'+e.id+'_'+e.event_id+'.json'||seen.has(e.event_id))throw Error('Evento de revisão inválido');seen.add(e.event_id);events.push(e)}return events};
 const formulas=async()=>{const f=await unique("mimeType = '"+doc+"' and name = 'Estruturas – Fórmulas, Vigas e Análise Estrutural'","Guia de fórmulas",true);if(!f)return null;
  const r=await get(API+'/'+f.id+'/export',{mimeType:'text/plain'}),text=await r.text(),again=await meta(f.id);if(f.version!==again.version||!text.trim()||text.length>400000)throw Error('Guia alterado ou inválido');return {text,version:f.version,modifiedTime:f.modifiedTime}};
 // List media only below the selected private Banco Mestre root. No personal fixed folder IDs.
 let mediaIndex=null;
 const media=async()=>{if(mediaIndex)return mediaIndex;const out=new Map(),queue=[{id:root.id,path:[]}],seen=new Set();
  while(queue.length){const p=queue.shift();if(seen.has(p.id)||seen.size>=2000)throw Error('Árvore de mídias inválida ou extensa');seen.add(p.id);
   const children=await list("'"+p.id+"' in parents");
   for(const f of children){if(f.parents?.length!==1||f.parents[0]!==p.id)throw Error('Arquivo fora da pasta selecionada');const path=[...p.path,f.name];
    if(f.mimeType===folder){if(!/^(?:09 - Backups|08 - Auditorias|02 - Histórico|Excluídos|Excluídas|Backups)$/i.test(f.name))queue.push({id:f.id,path});continue;}
    if(f.mimeType==='application/pdf'||/^image\/(?:png|jpeg|webp|gif)$/.test(f.mimeType))out.set(f.id,{id:f.id,title:f.name,section:p.path.at(-1)||'Materiais',category:'PDF',area:p.path[0]||'Materiais',subject:p.path.at(-1)||'',subsubject:'',description:'',card_ids:[],mimeType:f.mimeType,path});
   }
  }mediaIndex=out;return out};
 const readMedia=async id=>{const item=(await media()).get(id);if(!item)throw Error('Mídia fora da pasta individual');const r=await raw(id,100000000);if(r.meta.mimeType!==item.mimeType)throw Error('Tipo de mídia alterado');return new Blob([r.bytes],{type:item.mimeType})};
 return Object.freeze({root:root.id,snapshot,study,gaps,reviews,formulas,async pdfs(){return [...(await media()).values()].filter(m=>m.mimeType==='application/pdf')},async images(){return [...(await media()).values()].filter(m=>m.mimeType.startsWith('image/'))},readMedia});
}

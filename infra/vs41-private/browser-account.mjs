// Single browser account context for the original portal. Existing Drive formats.
// No IDs of a particular student, no alternate data store, no persisted OAuth.
import {readBrowserSnapshot,scope as readScope} from './browser-drive.mjs';
export const scope=readScope+' https://www.googleapis.com/auth/drive.file';
const API='https://www.googleapis.com/drive/v3/files',UPLOAD='https://www.googleapis.com/upload/drive/v3/files';
const folder='application/vnd.google-apps.folder',doc='application/vnd.google-apps.document';
const fields='id,name,mimeType,ownedByMe,shared,trashed,parents,size,version,headRevisionId,md5Checksum,sha256Checksum,modifiedTime,appProperties';
const validId=id=>typeof id==='string'&&/^[A-Za-z0-9_-]{1,160}$/.test(id);
const owned=f=>validId(f?.id)&&f.ownedByMe===true&&f.shared===false&&f.trashed===false;
const esc=s=>String(s).replaceAll('\\','\\\\').replaceAll("'","\\'");
const emptyStudy=()=>({schema:1,subjects:[],sessions:[],reviews:[],plans:[],audit:[],cycle:[],cycleIndex:0,availabilityWeek:15,availabilityMonth:60,activeTimer:null});
export async function connectAccount({token,fetcher=fetch,signal,allowEditorial=()=>false,write=false,actor=''}){
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
 let snapshot;try{snapshot=await readBrowserSnapshot({token,source:rootUrl,fetcher,signal})}catch(e){if(e.code!=='CURRENT_POINTER_MISSING'||!await allowEditorial())throw e;snapshot=await readBrowserSnapshot({token,source:rootUrl,fetcher,signal,editorialPreview:true})}
 const records=snapshot.records;
 const master=async(kind,name,format)=>{const f=await unique("mimeType = 'application/json' and (appProperties has { key='bm_kind' and value='"+kind+"' } or name = '"+esc(name)+"')",name,true);
  if(!f)return null;const r=await json(f.id);if(r.data.format!==format)throw Error('Formato incompatível: '+name);return {data:r.data.data,revision:r.meta.version,file:r.meta}};
 const STUDY_KIND='bm_controle_estudos_v245',STUDY_NAME='BancoMestre_Controle_Estudos_V245.json',STUDY_FORMAT='BancoMestreControleDriveV245';
 const studyMaster=()=>master(STUDY_KIND,STUDY_NAME,STUDY_FORMAT);
 const study=async()=>{const p=await studyMaster();
  if(!p)return {data:emptyStudy(),revision:null};const d=p.data;if(d?.schema!==1||!['subjects','sessions','reviews','cycle'].every(k=>Array.isArray(d[k]))||['plans','audit'].some(k=>d[k]!==undefined&&!Array.isArray(d[k])))throw Error('Controle de Estudos inválido');return {revision:p.revision,data:{...d,plans:d.plans||[],audit:d.audit||[]}}};
 const GAP_KIND='bm_lacunas_v242',GAP_NAME='BancoMestre_Lacunas_Mestre_V242.json',GAP_FORMAT='BancoMestreLacunasDriveV242';
 const gapMaster=()=>master(GAP_KIND,GAP_NAME,GAP_FORMAT);
 const emptyGaps=()=>({schema:1,records:[],log:[],updatedAt:null});
 function validateGaps(d){
  if(d?.schema!==1||!Array.isArray(d.records)||!Array.isArray(d.log)||new Set(d.records.map(r=>r?.id)).size!==d.records.length||new TextEncoder().encode(JSON.stringify(d)).length>5000000)throw Error('Cadastro de lacunas inválido');
  for(const r of d.records){
   if(!validId(r?.id)||!r.id.startsWith('LAC-')||!Array.isArray(r.cardIds)||r.cardIds.some(x=>typeof x!=='string')||typeof r.relatoEstudante!=='string'||typeof r.diagnosticoAssistente!=='string'||!['Não auditada','Direta','Indireta','Parcial','Ausente'].includes(r.cobertura)||!['Identificada','Explicada','Em reforço','Dominada'].includes(r.etapa)||!Array.isArray(r.historico))throw Error('Registro de lacuna inválido');
  }
  return d;
 }
 async function gapRevision(d,r){
  // The last confirmed event is the revision used by the existing UI.
  const last=d.log.filter(x=>x?.lacunaId===r.id&&typeof x.id==='string').at(-1);
  if(last)return last.id;
  return [...new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(JSON.stringify(r))))].map(x=>x.toString(16).padStart(2,'0')).join('');
 }
 const gaps=async()=>{const p=await gapMaster(),d=validateGaps(p?.data||emptyGaps());return {data:d,revisions:Object.fromEntries(await Promise.all(d.records.map(async r=>[r.id,await gapRevision(d,r)])))}};
 const reviews=async()=>{const files=await list("mimeType = 'application/json' and name contains 'BM_SRS_EVENT_V001_'"),events=[],seen=new Set();
  for(const f of files){const {data:e}=await json(f.id,200000);if(e.schema!=='bm-srs-formal-event/1'||f.name!=='BM_SRS_EVENT_V001_'+e.id+'_'+e.event_id+'.json'||seen.has(e.event_id))throw Error('Evento de revisão inválido');seen.add(e.event_id);events.push(e)}return events};
 // Reuse the V245 master and V001 SRS events, never write the catalog snapshot.
 const uuid=x=>typeof x==='string'&&/^[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}$/i.test(x);
 const eq=(x,y)=>JSON.stringify(x)===JSON.stringify(y);
 const guard=()=>{if(!write||signal?.aborted)throw Error('Gravação não autorizada nesta conta')};
 const fail=(message,status=400)=>{const e=Error(message);e.status=status;throw e};
 let pending=Promise.resolve(),uncertain=false;
 function serialize(fn){const next=pending.catch(()=>{}).then(()=>{guard();if(uncertain)fail('Envio anterior não confirmado; reconecte e confira o Drive antes de repetir',409);return fn()});pending=next;return next}
 const send=async(url,options)=>{guard();let res;try{res=await fetcher(url,{...options,headers:{Authorization:'Bearer '+token,...options.headers},cache:'no-store',credentials:'omit',redirect:'error',signal})}catch(e){uncertain=true;throw e}if(!res.ok){if(![400,401,403,404,409,412,413].includes(res.status))uncertain=true;fail('Drive HTTP '+res.status,res.status===412?409:res.status)}return res.json()};
 async function create(name,data,props={}){
  const payload=JSON.stringify(data);if(new TextEncoder().encode(payload).length>10000000)fail('Arquivo excede 10 MB');
  const metadata={name,mimeType:'application/json',...(Object.keys(props).length?{appProperties:props}:{})};
  const boundary='bm_'+crypto.randomUUID().replaceAll('-','');
  const body='--'+boundary+'\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n'+JSON.stringify(metadata)+'\r\n--'+boundary+'\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n'+payload+'\r\n--'+boundary+'--\r\n';
  const result=await send(UPLOAD+'?uploadType=multipart&fields=id',{method:'POST',headers:{'Content-Type':'multipart/related; boundary='+boundary},body});
  try{const r=await json(result.id);if(r.meta.name!==name||!eq(r.data,data))throw Error('Conteúdo gravado divergente');return r}catch(e){uncertain=true;throw e}
 }
 function validateStudy(d,old,takeover){
  if(!d||d.schema!==1||!['subjects','sessions','reviews','plans','audit','cycle'].every(k=>Array.isArray(d[k])))fail('Controle de Estudos inválido');
  if(new TextEncoder().encode(JSON.stringify(d)).length>10000000)fail('Controle de Estudos excede 10 MB');
  for(const k of ['subjects','sessions','reviews','plans','audit']){
   if(d[k].some(x=>!x||typeof x.id!=='string'||!x.id)||new Set(d[k].map(x=>x.id)).size!==d[k].length)fail('IDs inválidos no Controle: '+k);
  }
  const subjects=new Set(d.subjects.map(x=>x.id));
  for(const k of ['sessions','reviews','plans','cycle'])if(d[k].some(x=>!subjects.has(x.subjectId)))fail('Disciplina inexistente em '+k);
  if(!eq((old.audit||[]),d.audit.slice(0,(old.audit||[]).length))||(old.sessions||[]).some(x=>!d.sessions.some(y=>x.id===y.id)))fail('Histórico anterior deve ser preservado');
  const before=old.activeTimer||null,after=d.activeTimer||null;
  if(!eq(before,after)){
   if(after&&(!actor||after.ownerId!==actor||!after.sessionId||!subjects.has(after.subject)||!Number.isFinite(after.elapsed)||after.elapsed<0||typeof after.running!=='boolean'))fail('Cronômetro inválido');
   if(before&&before.ownerId!==actor&&(!takeover||!after||after.sessionId!==before.sessionId||after.running||after.elapsed<before.elapsed))fail('Cronômetro pertence a outra sessão',409);
  }
 }
 const studyRevisions=new Map();
 const saveStudy=input=>serialize(async()=>{
  if(!input||!uuid(input.event_id))fail('Identificador de gravação inválido');
  const current=await studyMaster(),previous=current?.revision||null,expected=studyRevisions.get(input.previous)||input.previous;
  if(expected!==previous)fail('Controle alterado em outro dispositivo; atualize antes de gravar',409);
  const old=current?.data||emptyStudy();validateStudy(input.data,old,input.takeover===true);
  const payload={format:STUDY_FORMAT,updatedAt:new Date().toISOString(),data:input.data};
  let saved;
  if(!current){
   if(await studyMaster())fail('Controle já criado em outro dispositivo',409);
   saved=await create(STUDY_NAME,payload,{bm_kind:STUDY_KIND,bm_schema:'V245'});
  }else{
   // Original V245 format and in-place file identity. Preserve old data before replacing.
   if(current.file.appProperties?.bm_kind!==STUDY_KIND)fail('Arquivo mestre sem identificação de gravação; não será substituído',409);
   await create('BancoMestre_Controle_Recuperacao_'+input.event_id+'.json',{format:STUDY_FORMAT,updatedAt:new Date().toISOString(),data:old},{bm_kind:'bm_controle_recovery_v245'});
   const latest=await studyMaster();
   if(!latest||latest.file.id!==current.file.id||latest.revision!==previous||!eq(latest.data,old))fail('Mestre alterado durante a conferência',409);
   const check=await get(API+'/'+current.file.id,{fields}),m=await check.json(),etag=check.headers.get('etag');
   if(!owned(m)||m.version!==previous)fail('Mestre alterado antes da gravação',409);
   const result=await send(UPLOAD+'/'+current.file.id+'?uploadType=media&fields=id',{method:'PATCH',headers:{'Content-Type':'application/json; charset=UTF-8',...(etag?{'If-Match':etag}:{})},body:JSON.stringify(payload)});
   try{if(result.id!==current.file.id)throw Error('ID do Controle divergente');saved=await json(result.id);if(!eq(saved.data,payload))throw Error('Conteúdo do Controle não confirmado')}catch(e){uncertain=true;throw e}
  }
  studyRevisions.clear();studyRevisions.set(input.event_id,saved.meta.version);
  return {revision:input.event_id,data:saved.data.data};
 });
 const saveGap=input=>serialize(async()=>{
  if(!input||!uuid(input.event_id)||!validId(input.record?.id)||!['lacuna_criada','relato_ou_complemento_adicionado','complemento_adicionado','etapa_atualizada'].includes(input.event))fail('Evento de lacuna inválido');
  const current=await gapMaster(),old=validateGaps(current?.data||emptyGaps()),record=structuredClone(input.record),idx=old.records.findIndex(r=>r.id===record.id);
  const previous=idx<0?null:await gapRevision(old,old.records[idx]);
  if(old.log.some(x=>x.id===input.event_id)){
   const event=old.log.find(x=>x.id===input.event_id);
   if(event.lacunaId!==record.id||event.event!==input.event||idx<0||!eq(old.records[idx],record)||previous!==input.event_id)fail('Evento de lacuna divergente',409);
   return {revision:input.event_id,record:old.records[idx],at:event.at};
  }
  if(input.previous!==previous||((idx<0)!==(input.event==='lacuna_criada')))fail('Lacuna alterada em outro dispositivo',409);
  if(idx>=0){
   const before=old.records[idx];
   if(!Array.isArray(record.historico)||!eq(before.historico,record.historico.slice(0,before.historico.length)))fail('Histórico anterior deve ser preservado');
  }
  const next=structuredClone(old),at=new Date().toISOString();
  if(idx<0)next.records.push(record);else next.records[idx]=record;
  next.updatedAt=at;next.log.push({id:input.event_id,at,event:input.event,lacunaId:record.id});validateGaps(next);
  const payload={format:GAP_FORMAT,updatedAt:at,data:next};
  if(!current){
   if(await gapMaster())fail('Cadastro já criado em outro dispositivo',409);
   await create(GAP_NAME,payload,{bm_kind:GAP_KIND,bm_schema:'V242'});
  }else{
   if(current.file.appProperties?.bm_kind!==GAP_KIND)fail('Cadastro sem identificação de gravação',409);
   await create('BancoMestre_Lacunas_Recuperacao_'+input.event_id+'.json',{format:'BancoMestreLacunasV242',backupAt:at,backupReason:'Antes de atualização',data:old},{bm_kind:'bm_lacunas_recovery_v242'});
   const latest=await gapMaster();
   if(!latest||latest.file.id!==current.file.id||latest.revision!==current.revision||!eq(latest.data,old))fail('Cadastro alterado durante conferência',409);
   const check=await get(API+'/'+current.file.id,{fields}),m=await check.json(),etag=check.headers.get('etag');
   if(!owned(m)||m.version!==current.revision)fail('Cadastro alterado antes de gravar',409);
   const result=await send(UPLOAD+'/'+current.file.id+'?uploadType=media&fields=id',{method:'PATCH',headers:{'Content-Type':'application/json; charset=UTF-8',...(etag?{'If-Match':etag}:{})},body:JSON.stringify(payload)});
   try{if(result.id!==current.file.id||!eq((await json(result.id)).data,payload))throw Error('Gravação de lacuna divergente')}catch(e){uncertain=true;throw e}
  }
  const confirmed=await gapMaster();
  if(!confirmed||!eq(confirmed.data,next)){uncertain=true;throw Error('Cadastro de lacunas não confirmado')}
  return {revision:input.event_id,record,at};
 });
 const RATINGS=Object.freeze({'Difícil':8,Bom:16,'Fácil':24,'Conhecimento preservado':32,'Conhecimento adquirido':64});
 const recordReview=input=>serialize(async()=>{
  if(!input||!uuid(input.event_id)||!Object.hasOwn(RATINGS,input.rating)||!records.some(x=>x.id===input.id&&x.active))fail('Avaliação ou cartão inválido');
  const history=await reviews(),prior=history.find(x=>x.event_id===input.event_id);
  if(prior){if(prior.id!==input.id||prior.rating!==input.rating)fail('Evento divergente',409);return prior}
  const previous=history.filter(x=>x.id===input.id),baseline=Math.max(0,...previous.map(x=>Number(x.baseline_easy?.count)||0));
  if(input.rating==='Conhecimento adquirido'&&baseline+new Set(previous.filter(x=>x.rating==='Fácil').map(x=>x.event_id)).size<2)fail('São necessárias duas avaliações Fácil comprovadas');
  const at=new Date(),day=new Intl.DateTimeFormat('en-CA',{timeZone:'America/Sao_Paulo',year:'numeric',month:'2-digit',day:'2-digit'}).format(at);
  const parts=Object.fromEntries(new Intl.DateTimeFormat('en-US',{timeZone:'America/Sao_Paulo',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(at).map(x=>[x.type,x.value]));
  const date=parts.year+'-'+parts.month+'-'+parts.day,interval_days=RATINGS[input.rating],due=new Date(date+'T12:00:00Z');due.setUTCDate(due.getUTCDate()+interval_days);
  const event={schema:'bm-srs-formal-event/1',source:'Banco Mestre — revisão formal no site',event_id:input.event_id,id:input.id,rating:input.rating,at_utc:at.toISOString(),date_local:date,timezone:'America/Sao_Paulo',kind:'revisao_formal',interval_days,due:due.toISOString().slice(0,10),validation:'Avaliação explícita selecionada após revelar o verso; sem comprovação automática da resposta'};
  if(baseline)event.baseline_easy={count:baseline,proof:'Prova de revisão anterior preservada em evento já confirmado',date:previous.find(x=>x.baseline_easy?.date)?.baseline_easy.date||null};
  return (await create('BM_SRS_EVENT_V001_'+event.id+'_'+event.event_id+'.json',event)).data;
 });
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
 return Object.freeze({root:root.id,snapshot,study,saveStudy,gaps,saveGap,reviews,recordReview,formulas,write,async pdfs(){return [...(await media()).values()].filter(m=>m.mimeType==='application/pdf')},async images(){return [...(await media()).values()].filter(m=>m.mimeType.startsWith('image/'))},readMedia});
}

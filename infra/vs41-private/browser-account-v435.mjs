// Single browser account context for the original portal. Existing Drive formats.
// No IDs of a particular student, no alternate data store, no persisted OAuth.
import {readBrowserSnapshot,scope as readScope} from './browser-drive.mjs?v=verified-cache-1';
import {browserByteCache,verifiedCacheKey,cachedVerifiedBytes,rememberVerifiedBytes,hashBytes} from './verified-cache.mjs?v=1';
export {browserByteCache};
import {grifosCore,grifosMaster} from './browser-grifos-core.mjs';
export const scope=readScope+' https://www.googleapis.com/auth/drive.file';
const API='https://www.googleapis.com/drive/v3/files',UPLOAD='https://www.googleapis.com/upload/drive/v3/files';
const folder='application/vnd.google-apps.folder',doc='application/vnd.google-apps.document';
const fields='id,name,mimeType,ownedByMe,shared,trashed,parents,size,version,headRevisionId,md5Checksum,sha256Checksum,modifiedTime,appProperties,properties,description';
const validId=id=>typeof id==='string'&&/^[A-Za-z0-9_-]{1,160}$/.test(id);
const owned=f=>validId(f?.id)&&f.ownedByMe===true&&f.shared===false&&f.trashed===false;
const esc=s=>String(s).replaceAll('\\','\\\\').replaceAll("'","\\'");
const emptyStudy=()=>({schema:1,subjects:[],sessions:[],reviews:[],plans:[],audit:[],cycle:[],cycleIndex:0,availabilityWeek:15,availabilityMonth:60,activeTimer:null});
export async function connectAccount({token,fetcher=fetch,signal,allowEditorial=()=>false,write=false,actor='',rootId='',readEditorialIndex=null,cache=null}){
 if(!token)throw Error('Selecione sua conta Google');
 const get=async(url,params={})=>{const r=await fetcher(url+'?'+new URLSearchParams(params),{method:'GET',headers:{Authorization:'Bearer '+token},cache:'no-store',credentials:'omit',redirect:'error',signal});if(!r.ok)throw Error('Drive HTTP '+r.status);return r};
 const meta=async id=>{if(!validId(id))throw Error('Arquivo inválido');const f=await (await get(API+'/'+id,{fields})).json();if(f.id!==id||!owned(f))throw Error('Arquivo não pertence exclusivamente à conta selecionada');return f};
 const list=async(q,{skipNonPrivate=false,onPage=null}={})=>{let pageToken='',out=[];for(let i=0;i<100;i++){
  const r=await (await get(API,{q:"trashed = false and 'me' in owners and ("+q+")",fields:'nextPageToken,incompleteSearch,files('+fields+')',pageSize:'1000',...(pageToken?{pageToken}:{})})).json();
  if(r.incompleteSearch||!Array.isArray(r.files))throw Error('Listagem incompleta');
  if(!skipNonPrivate&&r.files.some(f=>!owned(f)))throw Error('Resultado não privado; consulta suspensa');
  out.push(...r.files.filter(owned));if(onPage)onPage({page:i+1,more:Boolean(r.nextPageToken)});if(!r.nextPageToken)return out;pageToken=r.nextPageToken;
 }throw Error('Listagem excedeu limite seguro')};
 const unique=async(q,label,optional=false)=>{const a=await list(q);if(a.length===0&&optional)return null;if(a.length!==1)throw Error(label+' ausente ou duplicado');return meta(a[0].id)};
 const raw=async(id,max=10000000,cacheMedia=false)=>{const a=await meta(id);if(!Number.isSafeInteger(Number(a.size))||Number(a.size)<1||Number(a.size)>max||!a.version)throw Error('Tamanho ou versão inválida: '+a.name);
  const key=cacheMedia&&Number(a.size)<=8*1024*1024?verifiedCacheKey(profile.permissionId,root.id,a,a.sha256Checksum):null;
  let bytes=await cachedVerifiedBytes(cache,key,Number(a.size),a.sha256Checksum);const hit=!!bytes;
  if(!hit){const r=await get(API+'/'+id,{alt:'media'});bytes=await r.arrayBuffer();}
  const b=await meta(id);
  if(bytes.byteLength!==Number(a.size)||['version','size','headRevisionId','md5Checksum','sha256Checksum'].some(k=>a[k]!==b[k]))throw Error('Arquivo mudou durante leitura: '+a.name);
  if(a.sha256Checksum&&!hit&&await hashBytes(bytes)!==a.sha256Checksum)throw Error('Hash divergente: '+a.name);
  if(!hit&&key&&!signal?.aborted)await rememberVerifiedBytes(cache,key,bytes);
  return {bytes,meta:a}};
 const json=async(id,max)=>{const r=await raw(id,max);return {data:JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(r.bytes)),meta:r.meta}};
 const profile=(await (await get('https://www.googleapis.com/drive/v3/about',{fields:'user(displayName,emailAddress,permissionId)'})).json()).user;
 if(!validId(profile?.permissionId))throw Error('Identidade Google não confirmada');
 const identity=Object.freeze({name:String(profile.displayName||profile.emailAddress||'Conta Google').slice(0,160),email:String(profile.emailAddress||'').slice(0,254)});
 const root=rootId?await meta(rootId):await unique("mimeType = '"+folder+"' and name = 'DataBase_Concurso'","Pasta individual DataBase_Concurso");
 if(root.mimeType!==folder)throw Error('A configuração precisa indicar uma pasta privada do Drive');
 const rootUrl='https://drive.google.com/drive/folders/'+root.id;
 let snapshot;try{snapshot=await readBrowserSnapshot({token,source:rootUrl,fetcher,signal,cache})}catch(e){if(e.code!=='CURRENT_POINTER_MISSING'||!await allowEditorial())throw e;snapshot=await readBrowserSnapshot({token,source:rootUrl,fetcher,signal,editorialPreview:true,cache})}
 const records=snapshot.records;
 // Preserve the original account-wide masters created by older portal versions in My Drive.
 // Never select a file belonging to a different bank merely because its name matches.
 async function locateMaster(kind,name){
  const candidates=await list("mimeType = 'application/json' and (appProperties has { key='bm_kind' and value='"+kind+"' } or name = '"+esc(name)+"')",{skipNonPrivate:true});
  const inside=[],outside=[];
  for(const f of candidates){(await belongsToRoot(f)?inside:outside).push(f)}
  const legacy=[];
  if(outside.length&&root.name==='DataBase_Concurso'){
   const myDrive=await (await get(API+'/root',{fields:'id,mimeType,ownedByMe,shared,trashed'})).json();
   if(!validId(myDrive.id)||myDrive.mimeType!==folder||myDrive.trashed===true)throw Error('Raiz histórica não confirmada');
   for(const f of outside)if(f.parents?.length===1&&f.parents[0]===myDrive.id&&f.appProperties?.bm_kind===kind)legacy.push(f);
  }
  const eligible=[...inside,...legacy];
  if(eligible.length>1)fail(name+' duplicado; concilie os mestres sem sobrescrever',409);
  if(!eligible.length&&outside.length)fail(name+' localizado fora da pasta selecionada; restauração necessária',409);
  if(!eligible.length)return null;
  const f=await meta(eligible[0].id);
  if(f.parents?.length!==eligible[0].parents?.length||f.parents?.[0]!==eligible[0].parents?.[0])fail(name+' mudou de pasta durante a consulta',409);
  return f;
 }
 const master=async(kind,name,format)=>{const f=await locateMaster(kind,name);
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
 async function create(name,data,props={},parentId=''){
  // Explicit future writes only; never create a file in an unrelated bank or My Drive root.
  parentId=parentId||root.id;const destination=await meta(parentId);if(destination.mimeType!==folder||!await belongsToRoot(destination))fail('Destino de gravação fora da pasta selecionada',409);
  const payload=JSON.stringify(data);if(new TextEncoder().encode(payload).length>10000000)fail('Arquivo excede 10 MB');
  const metadata={name,mimeType:'application/json',...(parentId?{parents:[parentId]}:{}),...(Object.keys(props).length?{appProperties:props}:{})};
  const boundary='bm_'+crypto.randomUUID().replaceAll('-','');
  const body='--'+boundary+'\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n'+JSON.stringify(metadata)+'\r\n--'+boundary+'\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n'+payload+'\r\n--'+boundary+'--\r\n';
  const result=await send(UPLOAD+'?uploadType=multipart&fields=id',{method:'POST',headers:{'Content-Type':'multipart/related; boundary='+boundary},body});
  try{const r=await json(result.id);if(r.meta.name!==name||r.meta.parents?.length!==1||r.meta.parents[0]!==parentId||!eq(r.data,data))throw Error('Conteúdo ou destino gravado divergente');return r}catch(e){uncertain=true;throw e}
 }
 // Redação: state saved only on explicit user request; no secrets or guest transfer.
 const WRITING_NAME='BancoMestre_Redacao_V296.json',WRITING_KIND='bm_redacao_v296',WRITING_FORMAT='BancoMestreRedacaoDriveV296';
 const writingFolder=async()=>{
  const f=await unique("mimeType = '"+folder+"' and (name = '05 - Revisões' or name = '05_REVISOES_SRS') and '"+root.id+"' in parents",'Pasta individual de revisões');
  if(f.parents?.length!==1||f.parents[0]!==root.id)fail('Pasta de Redação fora do banco individual',409);
  return f.id;
 };
 const writingKey=k=>k==='pe_tutor_historico'||k==='treino_indice'||/^treino_[^\u0000-\u001f]{1,100}$/u.test(k);
 function validateWriting(data){
  if(!data||typeof data!=='object'||Array.isArray(data)||Object.keys(data).length>2000)fail('Progresso de Redação inválido');
  for(const [k,v] of Object.entries(data)){
   if(!writingKey(k)||typeof v!=='string')fail('Chave de Redação não autorizada');
   try{JSON.parse(v)}catch{fail('Registro de Redação inválido')}
  }
  if(new TextEncoder().encode(JSON.stringify(data)).length>5000000)fail('Progresso de Redação excede 5 MB');
  return data;
 }
 async function writingMaster(){
  const parentId=await writingFolder();
  const f=await unique("mimeType = 'application/json' and '"+parentId+"' in parents and (appProperties has { key='bm_kind' and value='"+WRITING_KIND+"' } or name = '"+WRITING_NAME+"')",WRITING_NAME,true);
  if(!f)return {parentId,file:null,data:{},revision:null};
  const r=await json(f.id,6000000);
  if(r.meta.parents?.length!==1||r.meta.parents[0]!==parentId||r.data.format!==WRITING_FORMAT)fail('Arquivo de Redação incompatível',409);
  return {parentId,file:r.meta,data:validateWriting(r.data.data),revision:r.meta.version};
 }
 const writing=async()=>{const p=await writingMaster();return {revision:p.revision,data:p.data}};
 const saveWriting=input=>serialize(async()=>{
  if(!input||!uuid(input.event_id))fail('Gravação de Redação inválida');
  const data=validateWriting(input.data),p=await writingMaster();
  if(input.previous!==p.revision)fail('Redação alterada em outro dispositivo; exporte o rascunho antes de reconectar',409);
  if(eq(data,p.data))return {revision:p.revision,data:p.data};
  const payload={format:WRITING_FORMAT,updatedAt:new Date().toISOString(),data};
  let saved;
  if(!p.file){
   if((await writingMaster()).file)fail('Redação já criada em outro dispositivo',409);
   saved=await create(WRITING_NAME,payload,{bm_kind:WRITING_KIND,bm_schema:'V296'},p.parentId);
  }else{
   if(p.file.appProperties?.bm_kind!==WRITING_KIND)fail('Arquivo histórico sem autorização de substituição',409);
   await create('BancoMestre_Redacao_Recuperacao_'+input.event_id+'.json',{format:WRITING_FORMAT,updatedAt:payload.updatedAt,data:p.data},{bm_kind:'bm_redacao_recovery_v296'},p.parentId);
   const latest=await writingMaster();
   if(latest.file?.id!==p.file.id||latest.revision!==p.revision||!eq(latest.data,p.data))fail('Redação alterada durante a conferência',409);
   const check=await get(API+'/'+p.file.id,{fields}),m=await check.json(),etag=check.headers.get('etag');
   if(!owned(m)||m.version!==p.revision||m.parents?.length!==1||m.parents[0]!==p.parentId)fail('Arquivo de Redação alterado',409);
   const result=await send(UPLOAD+'/'+p.file.id+'?uploadType=media&fields=id',{method:'PATCH',headers:{'Content-Type':'application/json; charset=UTF-8',...(etag?{'If-Match':etag}:{})},body:JSON.stringify(payload)});
   try{if(result.id!==p.file.id)throw Error('ID divergente');saved=await json(result.id);if(!eq(saved.data,payload))throw Error('Redação não confirmada')}catch(e){uncertain=true;throw e}
  }
  return {revision:saved.meta.version,data:saved.data.data};
 });
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
 // The same account owns and supplies the current operational documents. Never embed
 // another user's Drive IDs or choose a version merely because its timestamp is newer.
 // Match the selected bank, not similarly named copies in other folders or accounts.
 async function scopedDocuments(q){
  const candidates=await list("mimeType = '"+doc+"' and ("+q+")",{skipNonPrivate:true}),inside=[];
  for(const f of candidates){if(await belongsToRoot(f))inside.push(f)}
  return inside;
 }
 const normalizedName=v=>String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
 const currentDocName=(name,prefix)=>String(name||'').startsWith(prefix)&&!/(?:\bhistoric[oa]\b|\bcopia\b|nao usar|substituid[oa]|\barquivad[oa]\b)/.test(normalizedName(name));
 async function operationalDoc(prefix,label){
  const candidates=await scopedDocuments("name contains '"+esc(prefix)+"'");
  const exact=candidates.filter(f=>currentDocName(f.name,prefix));
  if(exact.length!==1)throw Error(label+' ausente ou ambíguo na pasta individual (históricos ignorados)');
  const f=await meta(exact[0].id);
  if(f.mimeType!==doc||!currentDocName(f.name,prefix)||!f.version||!await belongsToRoot(f))throw Error(label+' inválido');
  const r=await get(API+'/'+f.id+'/export',{mimeType:'text/plain'}),text=await r.text(),again=await meta(f.id);
  if(f.version!==again.version||f.name!==again.name||!await belongsToRoot(again)||!text.trim()||new TextEncoder().encode(text).length>10000000)throw Error(label+' alterado ou acima do limite de exportação');
  return {name:f.name,version:f.version,modifiedTime:f.modifiedTime||null,url:'https://docs.google.com/document/d/'+f.id+'/edit',text};
 }
 const methodology=()=>operationalDoc('00_METODOLOGIA_MESTRE_VIGENTE','Metodologia Mestre vigente');
 const operationalGuide=()=>operationalDoc('00_GUIA_OPERACIONAL_DE_ESTUDO','Guia Operacional vigente');
 const formulas=async()=>{
  const name='Estruturas – Fórmulas, Vigas e Análise Estrutural',candidates=await scopedDocuments("name = '"+esc(name)+"'");
  if(!candidates.length)return null;if(candidates.length!==1)throw Error('Guia de fórmulas ambíguo na pasta individual');
  const f=await meta(candidates[0].id);if(!await belongsToRoot(f))throw Error('Guia de fórmulas fora da pasta selecionada');
  const r=await get(API+'/'+f.id+'/export',{mimeType:'text/plain'}),text=await r.text(),again=await meta(f.id);if(f.version!==again.version||f.name!==again.name||!await belongsToRoot(again)||!text.trim()||text.length>400000)throw Error('Guia alterado ou inválido');return {text,version:f.version,modifiedTime:f.modifiedTime};
 };
 // Read existing dated study events without regrading or manufacturing a formal review.
 const validDay=v=>typeof v==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(v)&&!isNaN(new Date(v+'T12:00:00Z'))&&new Date(v+'T12:00:00Z').toISOString().slice(0,10)===v;
 const day=v=>{if(typeof v!=='string')return '';const x=v.trim().slice(0,10);if(validDay(x))return x;const m=v.trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);if(!m)return '';const d=m[3]+'-'+m[2].padStart(2,'0')+'-'+m[1].padStart(2,'0');return validDay(d)?d:''};
 const normalizedRating=v=>{const k=String(v||'').trim().normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();return ({errei:'Errei',dificil:'Difícil',bom:'Bom',facil:'Fácil','conhecimento preservado':'Conhecimento preservado','conhecimento adquirido':'Conhecimento adquirido'})[k]||''};
 async function belongsToRoot(f){
  let p=f;const seen=new Set([p.id]);
  for(let i=0;i<40;i++){
   if(p.id===root.id)return true;
   if(p.parents?.length!==1||seen.has(p.parents[0]))return false;
   const id=p.parents[0];seen.add(id);if(id===root.id)return true;
   try{p=await meta(id)}catch{return false}
  }
  return false;
 }
 function agendaBlocks(text){
  const out=[],start=/\{\s*"format"\s*:\s*"BancoMestrePrivateStudyAgenda1"/g;let m;
  while((m=start.exec(text))){
   let depth=0,quoted=false,escape=false,end=-1;
   for(let i=m.index;i<text.length;i++){
    const ch=text[i];
    if(quoted){if(escape)escape=false;else if(ch==='\\')escape=true;else if(ch==='"')quoted=false;continue}
    if(ch==='"'){quoted=true;continue}if(ch==='{')depth++;else if(ch==='}'&&--depth===0){end=i+1;break}
   }
   if(end<0)throw Error('Bloco de agenda incompleto');
   const data=JSON.parse(text.slice(m.index,end));
   if(!Array.isArray(data.records))throw Error('Registros de agenda inválidos');
   out.push(...data.records);start.lastIndex=end;
  }
  return out;
 }
 // Historical fallback is read-only and never becomes the current card catalog.
 // Historical family pointers are provenance, not authorization to roll back the current catalog.
 async function historicalPointerSchedule(){
  const candidates=await list("mimeType = 'application/json' and name contains '00_FONTE_ATUAL_POR_FAMILIA_V'",{skipNonPrivate:true}),matches=[];
  for(const f of candidates){
   const m=f.name.match(/^00_FONTE_ATUAL_POR_FAMILIA_V(\d+)(?:_.*)?\.json$/i);
   if(m&&await belongsToRoot(f))matches.push({f,n:Number(m[1])});
  }
  matches.sort((a,b)=>b.n-a.n);
  if(!matches.length)return null;
  if(matches.length>1&&matches[0].n===matches[1].n)throw Error('Ponteiro histórico mais recente ambíguo');
  const {f,n}=matches[0],p=await json(f.id,1000000),v=p.data,ref=v?.private_base;
  if(!await belongsToRoot(p.meta)||p.meta.name!==f.name||v?.schema!=='banco-mestre-operational-pointer/1'||Number(String(v.pointer_version).replace(/^V/,''))!==n||!validId(ref?.file_id)||typeof ref.version!=='string'||!/^[a-f0-9]{64}$/.test(ref.sha256||''))throw Error('Ponteiro histórico inválido');
  const r=await raw(ref.file_id,32*1024*1024);
  if(!await belongsToRoot(r.meta)||await hashBytes(r.bytes)!==ref.sha256)throw Error('Origem histórica fora do banco ou hash divergente');
  const d=JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(r.bytes)),again=await meta(f.id);
  if(again.version!==p.meta.version||again.name!==p.meta.name||!await belongsToRoot(again)||d?.format!=='BancoMestrePrivadoV159'||d.schema_version!==1||d.version!==ref.version||!Array.isArray(d.cards)||!Array.isArray(d.srs)||d.cards.length!==ref.cards||d.counts?.cards!==d.cards.length||d.counts?.srs_records!==d.srs.length)throw Error('Snapshot histórico vinculado incompatível');
  const historic=new Map(d.cards.map(c=>[c.id,c]));
  if(historic.size!==d.cards.length||new Set(d.srs.map(x=>x.id)).size!==d.srs.length||d.srs.some(x=>!historic.has(x.id)))throw Error('Identidade histórica divergente');
  // Same active ID and stable classification; no remapping of retired IDs or reassignment of ratings.
  const active=new Map(records.filter(c=>c.active).map(c=>[c.id,c]));
  const srs=d.srs.filter(x=>{const a=active.get(x.id),old=historic.get(x.id);return a&&old.active!==false&&['group','discipline','subject','sub'].every(k=>a[k]===old[k]);});
  return {version:d.version,updated:typeof d.updated==='string'?d.updated:'',srs,pointer:v.pointer_version};
 }
 async function historicalSchedule(){
  const anchored=await historicalPointerSchedule();if(anchored)return anchored;
  const candidates=await list("mimeType = 'application/json' and name contains 'BANCO_MESTRE_PRIVADO_V'");
  const matches=[],parentsChecked=new Map();
  for(const f of candidates){
   const m=f.name.match(/^BANCO_MESTRE_PRIVADO_V(\d+)(?:_.*)?\.json$/i);
   if(!m||f.parents?.length!==1)continue;
   const parent=f.parents[0];if(!parentsChecked.has(parent))parentsChecked.set(parent,belongsToRoot(f));
   if(await parentsChecked.get(parent))matches.push({f,n:Number(m[1])});
  }
  matches.sort((a,b)=>b.n-a.n);
  if(!matches.length)return null;
  if(matches.length>1&&matches[0].n===matches[1].n)throw Error('Versão histórica SRS mais alta ambígua; conciliação necessária');
  const {f,n}=matches[0],r=await json(f.id,32*1024*1024),d=r.data;
  if(r.meta.name!==f.name||!await belongsToRoot(r.meta)||d?.format!=='BancoMestrePrivadoV159'||d.schema_version!==1||d.version!=='V'+n||!Array.isArray(d.srs)||!Array.isArray(d.cards)||d.counts?.cards!==d.cards.length||d.counts?.srs_records!==d.srs.length)throw Error('Snapshot histórico SRS incompatível');
  const historicalIds=new Set(d.cards.map(c=>c.id));
  if(historicalIds.size!==d.cards.length||d.srs.some(x=>!historicalIds.has(x?.id))||new Set(d.srs.map(x=>x.id)).size!==d.srs.length)throw Error('IDs do histórico SRS divergentes');
  return {version:d.version,updated:typeof d.updated==='string'?d.updated:'',srs:d.srs};
 }
 async function schedule(){
  const ids=new Set(records.filter(c=>c.active).map(c=>c.id)),byId=new Map(),seen=new Map();
  const source=snapshot.scope==='snapshot-only'&&Array.isArray(snapshot.srs),warnings=[];
  let historical=null;
  if(!source){
   warnings.push('Snapshot SRS canônico não confirmado');
   try{historical=await historicalSchedule();if(historical)warnings.push('Histórico '+historical.version+(historical.pointer?' (ponteiro histórico '+historical.pointer+' verificado por SHA-256)':' (arquivo histórico sem ponteiro)')+' consultado somente por ID ativo idêntico; sem transferir avaliações de IDs consolidados.');}
   catch(e){warnings.push('Histórico não confirmado: '+e.message);}
  }
  const historySource=source?snapshot:historical;
  for(const r of historySource?.srs||[]){
   if(!ids.has(r?.id))continue;
   const due=day(r.next_review||r.proxima_revisao||r.due);if(!due)continue;
   const rating=normalizedRating(r.rating)||normalizedRating(r.last_date)||normalizedRating(r.grade)||normalizedRating(r.avaliacao);
   const lastReview=day(r.last_review_at)||day(r.review_date)||day(r.grade)||day(r.last_date);
   if(byId.has(r.id))throw Error('ID SRS duplicado no snapshot');
   byId.set(r.id,{id:r.id,due,rating,lastReview,kind:rating?'revisao':'agendamento',source:(source?'Snapshot privado ':'Histórico privado ')+historySource.version+' — vencimento registrado'});
  }
  const files=await list("mimeType = '"+doc+"' and name contains 'Delta de estudo e cartões aprovados'");
  let documents=0;
  for(const file of files){
   if(!await belongsToRoot(file))continue;
   const f=await meta(file.id),res=await get(API+'/'+f.id+'/export',{mimeType:'text/plain'}),text=await res.text(),again=await meta(f.id);
   if(f.version!==again.version||f.name!==again.name||!await belongsToRoot(again))throw Error('Delta alterado durante leitura');
   documents++;
   for(const e of agendaBlocks(text)){
    if(!ids.has(e?.id))continue;
    if(typeof e.event_id!=='string'||!e.event_id||e.method!=='v015'||!['questao_distinta','avaliacao_explicita'].includes(e.kind)||!validDay(e.date_local)||!validDay(e.due)||![8,16,24,32,64].includes(e.interval_days))throw Error('Agendamento de estudo inválido para '+e.id);
    const expected=new Date(e.date_local+'T12:00:00Z');expected.setUTCDate(expected.getUTCDate()+e.interval_days);
    if(expected.toISOString().slice(0,10)!==e.due||e.rating!=null&&!normalizedRating(e.rating)||e.kind==='avaliacao_explicita'&&!normalizedRating(e.rating))throw Error('Data ou avaliação divergente em '+e.id);
    if(seen.has(e.event_id)&&!eq(seen.get(e.event_id),e))throw Error('Evento de estudo divergente');
    seen.set(e.event_id,e);
   }
  }
  const ordered=[...seen.values()].sort((a,b)=>a.date_local.localeCompare(b.date_local)||Number(a.kind==='avaliacao_explicita')-Number(b.kind==='avaliacao_explicita')||a.event_id.localeCompare(b.event_id));
  for(const e of ordered){
   const p=byId.get(e.id);
   if(p?.lastReview&&p.lastReview>e.date_local)continue;
   if(p?.lastReview===e.date_local&&p.kind==='revisao'&&e.kind!=='avaliacao_explicita')continue;
   byId.set(e.id,{id:e.id,due:e.due,rating:normalizedRating(e.rating),lastReview:e.date_local,kind:e.kind,intervalDays:e.interval_days,eventId:e.event_id,source:'Delta privado — data registrada'});
  }
  return {records:[...byId.values()],complete:source,warnings,documents,events:seen.size,version:historySource?.version||snapshot.version,updated:historySource?.updated||'',historical:historical?.version||null};
 }
 // List media only below the selected private Banco Mestre root. No personal fixed folder IDs.
 // Read-only compatibility for indexed PDFs used by VS40. A catalog ID alone never grants access:
 // require the selected canonical bank, authenticated ownership, private file and approved legacy ancestry.
 const legacyPdfRootNames=new Set(['CONCURSOS – ENGENHARIA CIVIL','Normas Regulamentadoras','Licenciamento Ambiental','BANCO_MESTRE_PRIVADO_TESTES_F17_2026-11-07'].map(normalizedName));
 const excludedMediaFolder=name=>/^(?:09 - Backups|08 - Auditorias|02 - Histórico|09_EXPORTACOES|08_AUDITORIAS|02_HISTORICOS|Excluídos|Excluídas|Backups)$/i.test(name||'');
 async function legacyPdfPath(file,folderMemo=new Map()){
  if(root.name!=='DataBase_Concurso'||!owned(file)||file.mimeType!=='application/pdf')return null;
  let current=file;const seen=new Set(),path=[file.name];
  for(let depth=0;depth<40;depth++){
   if(current.parents?.length!==1||seen.has(current.parents[0]))return null;
   const id=current.parents[0];seen.add(id);
   if(!folderMemo.has(id))folderMemo.set(id,meta(id).catch(()=>null));
   const p=await folderMemo.get(id);if(!p||p.mimeType!==folder||excludedMediaFolder(p.name))return null;
   path.unshift(p.name);
   if(legacyPdfRootNames.has(normalizedName(p.name)))return path;
   if(p.id===root.id)return null;
   current=p;
  }
  return null;
 }

 // Atlas scope restored from VS40/V202. IDs already published in the storage contract
 // are recognized only while traversing the selected owned private bank.
 const historicalAtlasIds=new Set(['1ksSVWrmRaRlDoG4iDtTGvfr2OnPnhnY6','1pp1CL9oMYVFHPPzv117DZpy1kA-wyJQo']);
 const atlasRoot=(f)=>historicalAtlasIds.has(f.id)||/^(?:\d+\s*[-–—]\s*)?atlas de imagens(?:\s*\(sincronizacao\))?$|^originais[ _-]+recuperados(?:[ _-]+conversas(?:[ _-]+[0-9]+)*)?$/i.test(normalizedName(f.name).trim());
 function atlasImagePolicy(f,path,inAtlas){
  if(!inAtlas)return {visible:false,reason:'fora do Atlas'};
  const declared=String(f.properties?.origin||f.properties?.origem||f.appProperties?.origin||f.appProperties?.origem||'').trim().toUpperCase();
  const desc=String(f.description||'');
  const original=declared==='ORIGINAL_USUARIO'||/(?:^|\n)\s*(?:origem|origin)\s*[:=]\s*ORIGINAL_USUARIO\s*(?:\n|$)/i.test(desc);
  const derivative=/DERIVADA|ASSISTENTE|MANUTENCAO|MANUTENÇÃO|MINIATURA/.test(declared)||/(?:^|\n)\s*(?:origem|origin)\s*[:=]\s*(?:DERIVADA_AUTORAL|SVG_DIDATICO_ASSISTENTE|CAPTURA_MANUTENCAO_SITE|IMAGEM_GERADA_ASSISTENTE)\b/i.test(desc);
  if(derivative||(!original&&/(?:^|[\s_\/-])(?:DERIVADAS?|MINIATURAS?|SVG_AUTORAL|CAPTURAS?_MANUTENCAO|PREVIAS_SVG_SITE)(?:[\s_\/.\-]|$)/i.test(normalizedName(path.join(' / ')))))return {visible:false,reason:'derivada ou manutenção'};
  if(f.mimeType==='image/svg+xml'&&!original)return {visible:false,reason:'SVG sem origem de usuário'};
  if(Number(f.size||0)>15000000)return {visible:false,reason:'acima de 15 MB'};
  return {visible:true,originVerified:original};
 }
 let mediaIndex=null,mediaPending=null,mediaAudit={indexedPdfs:0,foundIndexedPdfs:0,legacyPdfs:0};
 const media=async(fresh=false)=>{if(mediaPending)return mediaPending;if(mediaIndex&&!fresh)return mediaIndex;mediaPending=scanMedia();try{return await mediaPending}finally{mediaPending=null}};
 // Query Google's indexed metadata once, instead of opening each folder.
 // Other account files are never returned or retained in the bank index.
 const scanMedia=async()=>{
  const out=new Map();
  const reportProgress=(phase,extra={})=>{if(signal?.aborted)return;const doc=globalThis.document;if(doc&&typeof globalThis.CustomEvent==='function')doc.dispatchEvent(new CustomEvent('bm-private-media-progress',{detail:{phase,files:out.size,...extra}}))};
  reportProgress('index',{page:0});
  const rows=await list("mimeType = '"+folder+"' or mimeType = 'application/pdf' or mimeType contains 'image/'",{skipNonPrivate:true,onPage:page=>reportProgress('index',page)});
  if(signal?.aborted)throw Error('Sessão encerrada');
  const byId=new Map(rows.map(f=>[f.id,f]));byId.set(root.id,root);
  // Resolve actual ancestry by stable IDs; names alone never authorize access.
  // The historical exception remains limited to already-catalogued PDFs.
  const ancestry=(file,legacy=false)=>{
   const path=[file.name],seen=new Set([file.id]);let current=file,inAtlas=false;
   for(let depth=0;depth<40;depth++){
    if(current.parents?.length!==1||seen.has(current.parents[0]))return null;
    const id=current.parents[0];seen.add(id);
    if(id===root.id)return legacy?null:{path,inAtlas};
    const parent=byId.get(id);
    if(!owned(parent)||parent.mimeType!==folder||excludedMediaFolder(parent.name))return null;
    path.unshift(parent.name);inAtlas=inAtlas||atlasRoot(parent);
    if(legacy&&legacyPdfRootNames.has(normalizedName(parent.name)))return {path,inAtlas:false};
    current=parent;
   }
   return null;
  };
  for(const f of rows){
   if(f.mimeType!=='application/pdf'&&!/^image\/(?:png|jpeg|webp|gif|svg\+xml)$/.test(f.mimeType))continue;
   const location=ancestry(f);if(!location)continue;
   const {path,inAtlas}=location,parent=path.at(-2)||'';
   const policy=f.mimeType.startsWith('image/')?atlasImagePolicy(f,path,inAtlas):null;
   out.set(f.id,{id:f.id,title:f.name,section:parent||'Materiais',category:'PDF',area:path.length>1?path[0]:'Materiais',subject:parent,subsubject:'',description:'',card_ids:[],mimeType:f.mimeType,path,...(policy?{atlasVisible:policy.visible,atlasReason:policy.reason||'',originVerified:policy.originVerified===true}:{})});
  }
  reportProgress('classification');
  // The historical editorial catalog is not a source of file authorization.
  // Join only by exact Drive ID after the private, owned-tree scan above.
  if(readEditorialIndex){
   const sources=[
    ['assets/v211_published_images.json','schema','BancoMestrePublishedDriveImagesV211'],
    ['assets/v180_native_image_additions.json','schema','BancoMestreNativeImageAdditionsV180'],
    ['assets/v310_image_taxonomy.json','schema','BancoMestreImageTaxonomyV310'],
    ['assets/pdf_catalog_v149.json','format','BancoMestrePDFCatalogV140'],
    ['assets/pdf_grupos_v149.json','format','BancoMestrePDFGroupsV140']
   ];
   const packs=await Promise.all(sources.map(async ([path,key,schema])=>{try{const p=await readEditorialIndex(path);return p?.[key]===schema?p:null}catch{return null}}));
   const pdfRows=Array.isArray(packs[3]?.documents)?packs[3].documents:[];
   const legacyCandidates=[...new Set(pdfRows.map(row=>row.file_id).filter(id=>validId(id)&&!out.has(id)))];
   let legacyCount=0;
   if(root.name==='DataBase_Concurso')for(const id of legacyCandidates){
    const f=byId.get(id);if(!owned(f)||f.mimeType!=='application/pdf'||out.has(id))continue;
    const location=ancestry(f,true);if(!location)continue;const {path}=location;
    out.set(id,{id,title:f.name,section:path.at(-2)||'Acervo histórico',category:'PDF',area:path[0],subject:path.at(-2)||'',subsubject:'',description:'',card_ids:[],mimeType:f.mimeType,path,legacyReadOnly:true});legacyCount++;
   }
   const indexedIds=new Set(pdfRows.map(row=>row.file_id).filter(validId));mediaAudit={indexedPdfs:indexedIds.size,foundIndexedPdfs:[...indexedIds].filter(id=>out.has(id)).length,legacyPdfs:legacyCount};
   const groupNames={eng_seguranca:'Engenharia Civil · Segurança do Trabalho',eng_hidraulica:'Engenharia Civil · Hidráulica e Saneamento',eng_estruturas:'Engenharia Civil · Estruturas',eng_ambiental:'Engenharia Civil · Meio Ambiente',eng_geotecnia:'Engenharia Civil · Geotecnia',eng_materiais:'Engenharia Civil · Materiais',eng_outros:'Engenharia Civil',leg_geral:'Legislação',met_portal:'Metodologia e interface'};
   const ids=new Set(records.filter(c=>c.active).map(c=>c.id));
   const str=x=>typeof x==='string'?x.trim():'';
   const links=a=>Array.isArray(a)?a.filter(x=>ids.has(x)):[];
   for(const item of out.values()){
    item.filename=item.title;item.editorialId='';item.classified=false;item.indexed=false;item.card_ids=[];
    if(item.mimeType.startsWith('image/')){item.category='Imagem';item.folderArea=item.area;item.folderSubject=item.subject;item.area='';item.subject='';}
   }
   for(let i=0;i<3;i++){
    for(const row of Array.isArray(packs[i]?.records)?packs[i].records:[]){
     const item=out.get(row.driveFileId);
     if(!item?.mimeType.startsWith('image/'))continue;
     item.indexed=true;
     const topic=str(i===1?row.studySubject:row.topic),area=str(i===1?row.studyArea:groupNames[row.group]);
     const label=str(i===1?row.studyTitle||row.title:row.title);
     if(i!==2||!item.classified){
      if(label)item.title=label;
      if(topic&&area){item.area=area;item.subject=topic;item.subsubject=str(i===1?row.studySub:row.subtopic);item.classified=true;item.editorialGroup=str(row.group);}
      if(i!==2)item.editorialId=str(row.imageId||row.no)||item.editorialId;
     }
     item.card_ids=[...new Set([...item.card_ids,...links(i===0?row.cardIds:i===1?row.cards:row.originalCardIds)])];
    }
   }
   const pdfGroups=new Map((packs[4]?.groups||[]).map(x=>[x.id,x]));
   const pdfAreas=new Map((packs[4]?.areas||[]).map(x=>[x.id,x]));
   const assignments=new Map((packs[4]?.assigned||[]).map(x=>[x.id,x.group]));
   for(const row of packs[3]?.documents||[]){
    const item=out.get(row.file_id);
    if(item?.mimeType!=='application/pdf')continue;
    const g=pdfGroups.get(assignments.get(row.id)),a=pdfAreas.get(g?.area);
    item.title=str(row.title)||item.title;item.editorialId=str(row.id);
    item.category=str(row.category)||item.category;item.section=str(row.section)||item.section;
    if(Array.isArray(row.pages)&&row.pages.length===2)item.pages=row.pages;
    if(g&&a){item.classified=true;item.catalogGroup={id:g.id,label:g.label,subtitle:g.subtitle,order:g.order,area:g.area,areaLabel:a.label,areaDescription:a.description};}
   }
  }
  mediaIndex=out;reportProgress('complete');return out};
 // SVG is consumed only as an image URL; preserve original bytes for annotation hashes.
 // Reject active content, external resources, and XML entities before any rendering.
 function validateSvgImage(bytes){
  const text=new TextDecoder('utf-8',{fatal:true}).decode(bytes);
  if(/<!DOCTYPE|<!ENTITY|<\?xml-stylesheet/i.test(text)||typeof DOMParser!=='function')throw Error('SVG não pode ser conferido com segurança');
  const doc=new DOMParser().parseFromString(text,'image/svg+xml'),svg=doc.documentElement;
  if(svg?.localName!=='svg'||svg.namespaceURI!=='http://www.w3.org/2000/svg'||doc.querySelector('parsererror'))throw Error('SVG inválido');
  const unsafe=/^(?:script|foreignobject|iframe|object|embed|audio|video|animate|animatemotion|animatetransform|set|use|a)$/i;
  const cssUnsafe=v=>/@import|javascript:|url\(\s*(?!['"]?#)[^)]*\)/i.test(v);
  for(const node of [svg,...svg.querySelectorAll('*')]){
   if(unsafe.test(node.localName)||node.namespaceURI!=='http://www.w3.org/2000/svg'||(node.localName==='style'&&cssUnsafe(node.textContent||'')))throw Error('SVG contém conteúdo ativo ou externo');
   for(const attr of node.attributes){const name=attr.name.toLowerCase(),value=attr.value.trim();if(name.startsWith('on')||cssUnsafe(value)||((name==='href'||name==='xlink:href'||name==='src')&&!value.startsWith('#')&&!/^data:image\/(?:png|jpe?g|webp|gif);base64,[A-Za-z0-9+/=]+$/i.test(value)))throw Error('SVG contém referência não autorizada');}
  }
 }
 const readMedia=async id=>{const item=(await media()).get(id);if(!item)throw Error('Mídia fora da biblioteca individual');const before=await meta(id);const authorized=()=>item.legacyReadOnly?legacyPdfPath(before):belongsToRoot(before);if(!await authorized())throw Error('Original não pertence mais a uma fonte autorizada');const r=await raw(id,100000000,true);if(r.meta.mimeType!==item.mimeType||r.meta.parents?.[0]!==before.parents?.[0])throw Error('Tipo ou pasta da mídia alterados');if(item.mimeType==='image/svg+xml')validateSvgImage(r.bytes);return new Blob([r.bytes],{type:item.mimeType})};
 const GRIF_KIND='bm_grifos_sync_v104_master',GRIF_NAME='BancoMestre_Grifos_Mestre.json';
 const digest=async data=>[...new Uint8Array(await crypto.subtle.digest('SHA-256',data))].map(n=>n.toString(16).padStart(2,'0')).join('');
 const grifos=async()=>{
  const f=await locateMaster(GRIF_KIND,GRIF_NAME);
  if(!f){
   const legacy=await list("mimeType = 'application/json' and appProperties has { key='bm_kind' and value='bm_grifos_sync_v103' }");
   if(legacy.length)fail('Existem grifos históricos sem mestre V104. Preserve-os e conclua a migração pelo site original.',409);
   return {file:null,data:grifosMaster.empty()};
  }
  const q=await json(f.id,12000000);return {file:q.meta,data:grifosMaster.validate(q.data)};
 };
 // Resolve the existing PDF identity by its actual content hash. Legacy PDF keys use the first 24 hex digits.
 const hashes=new Map();
 const pdfIdentity=async(id,page)=>{
  if(!validId(id)||!Number.isSafeInteger(page)||page<1||page>100000)fail('PDF ou página inválida');
  const item=(await media()).get(id);if(item?.mimeType!=='application/pdf')fail('PDF fora da biblioteca individual');
  const m=await meta(id),previous=hashes.get(id);
  if(previous&&previous.version===m.version)return previous.hash;
  const bytes=await readMedia(id),hash=await digest(await bytes.arrayBuffer()),again=await meta(id);
  if(again.version!==m.version)fail('PDF alterado durante conferência',409);
  hashes.set(id,{version:m.version,hash});return hash;
 };
 function pageKey(data,id,hash,page){
  const short=hash.slice(0,24),prefix='BM030_STROKES_PDF:',suffix=':'+short+':P'+page;
  const keys=new Set([...Object.keys(data.records),...Object.keys(JSON.parse(data.records[grifosCore.DELETIONS]||'{}'))]);
  const ids=new Set([...keys].map(k=>/^BM030_STROKES_PDF:(.+):([a-f0-9]{24,64}):P[1-9]\d*$/.exec(k)).filter(m=>m&&(m[2]===short||m[2]===hash)).map(m=>m[1]));
  if(ids.size>1)fail('PDF possui mais de uma identificação histórica; não será mesclado automaticamente',409);
  const doc=[...ids][0]||id;
  const exact=[...keys].filter(k=>k===prefix+doc+suffix||k===prefix+doc+':'+hash+':P'+page);
  if(exact.length>1)fail('Página possui chaves históricas duplicadas',409);
  return exact[0]||prefix+doc+suffix;
 }
 async function pdfView(id,page,current,hash){
  const key=pageKey(current.data,id,hash,page),marks=JSON.parse(current.data.records[key]||'[]'),deleted=JSON.parse(current.data.records[grifosCore.DELETIONS]||'{}')[key]||{};
  if(current.data.conflicts.some(x=>x.key===key))fail('Há divergência de grifos nesta página; preserve o mestre até reconciliar',409);
  const clean=marks.filter(x=>!x?.bm108_deleted_at&&!Object.hasOwn(deleted,grifosCore.markId(x)));
  const revision=await digest(new TextEncoder().encode(JSON.stringify([key,marks,deleted])));
  return {pdfId:id,page,hash,revision,marks:clean,key};
 }
 const readAnnotations=async(id,page)=>{const hash=await pdfIdentity(id,page),view=await pdfView(id,page,await grifos(),hash);delete view.key;return view};
 const saveAnnotations=(id,page,input)=>serialize(async()=>{
  if(!input||!uuid(input.event_id)||!Array.isArray(input.marks)||input.marks.length>2000||new TextEncoder().encode(JSON.stringify(input.marks)).length>240000||input.marks.some(x=>!x||typeof x.type!=='string'))fail('Marcações inválidas');
  const hash=await pdfIdentity(id,page),current=await grifos(),view=await pdfView(id,page,current,hash);
  if(input.hash!==hash||input.previous!==view.revision)fail('PDF ou grifos alterados; reabra a página',409);
  const local=new Map(Object.entries(current.data.records)),storage={get length(){return local.size},key:i=>[...local.keys()][i]??null,getItem:k=>local.get(k)??null,setItem:(k,v)=>local.set(k,String(v)),removeItem:k=>local.delete(k)};
  const prior=new Map(view.marks.map(m=>[grifosCore.markId(m),m])),stamp=new Date().toISOString();
  const next=input.marks.map(m=>{const before=prior.get(grifosCore.markId(m));return before&&!eq(before,m)?{...m,bm108_changed_at:stamp}:m});
  grifosCore.persistPage(storage,view.key,next);
  const snapshot=grifosCore.capture(storage,'MASTER-V104-0000');
  // Replace only this verified page. Retain the existing master format and delete tombstones.
  const staged={...current.data,records:{...snapshot.records}};
  const candidate=grifosMaster.final(grifosMaster.merge(staged,[snapshot]).master);
  const expected=(await pdfView(id,page,{data:candidate},hash)).marks;
  if(!eq(expected,next.filter(x=>!x.bm108_deleted_at)))fail('Marcação excluída ou divergente; nenhuma gravação efetuada',409);
  if(new TextEncoder().encode(JSON.stringify(candidate)).length>10000000)fail('Mestre de grifos acima de 10 MB; preserve o arquivo existente');
  if(!current.file){
   if((await grifos()).file)fail('Mestre já criado em outro dispositivo',409);
   await create(GRIF_NAME,candidate,{bm_kind:GRIF_KIND,bm_schema:'V104'});
  }else{
   if(current.file.appProperties?.bm_kind!==GRIF_KIND)fail('Mestre de grifos sem identificação de gravação',409);
   const latest=await grifos();
   if(latest.file?.id!==current.file.id||latest.file?.version!==current.file.version||!eq(latest.data,current.data))fail('Mestre de grifos alterado por outro dispositivo',409);
   const check=await get(API+'/'+current.file.id,{fields}),m=await check.json(),etag=check.headers.get('etag');
   if(!owned(m)||m.version!==current.file.version)fail('Mestre alterado antes da gravação',409);
   const saved=await send(UPLOAD+'/'+current.file.id+'?uploadType=media&fields=id',{method:'PATCH',headers:{'Content-Type':'application/json; charset=UTF-8',...(etag?{'If-Match':etag}:{})},body:JSON.stringify(candidate)});
   if(saved.id!==current.file.id){uncertain=true;throw Error('Mestre de grifos não confirmado')}
  }
  const confirmed=await grifos();if(!eq(confirmed.data,candidate)){uncertain=true;throw Error('Grifos não confirmados no Drive')}
  const row=await pdfView(id,page,confirmed,hash);delete row.key;
  // The UI expects the event ID on acknowledgement, while persistent concurrency uses the page hash.
  return {...row,revision:input.event_id,verifiedRevision:row.revision};
 });
 const annotationRevisions=new Map();
 const annotationWrite=async(id,page,input)=>{const key=id+':'+page,prior=annotationRevisions.get(key);const row=await saveAnnotations(id,page,{...input,previous:prior?.event===input.previous?prior.revision:input.previous});annotationRevisions.set(key,{event:row.revision,revision:row.verifiedRevision});return row};
 // Image ink was browser-local in the legacy editor. Persist explicit edits as small,
 // private versioned files keyed to the authenticated Drive image and its actual bytes.
 const imageIdentity=async id=>{
  if(!validId(id)||!/^image\/(?:png|jpeg|webp|gif|svg\+xml)$/.test((await media()).get(id)?.mimeType||''))fail('Imagem fora da biblioteca individual');
  const m=await meta(id),previous=hashes.get(id);
  if(previous&&previous.version===m.version)return previous.hash;
  const blob=await readMedia(id),hash=await digest(await blob.arrayBuffer()),again=await meta(id);
  if(again.version!==m.version)fail('Imagem alterada durante conferência',409);
  hashes.set(id,{version:m.version,hash});return hash;
 };
 const normalizedPoint=x=>typeof x==='number'&&Number.isFinite(x)&&x>=0&&x<=1;
 function validInk(marks){
  return Array.isArray(marks)&&marks.length<=2000&&new TextEncoder().encode(JSON.stringify(marks)).length<=240000&&marks.every(m=>m&&['pen','highlighter','rect'].includes(m.type)&&/^#[0-9a-f]{6}$/i.test(m.color||'')&&typeof m.size==='number'&&m.size>=1&&m.size<=40&&
   (m.type==='rect'?Array.isArray(m.box)&&m.box.length===4&&m.box.every(normalizedPoint):Array.isArray(m.points)&&m.points.length>0&&m.points.length<20000&&m.points.every(p=>Array.isArray(p)&&p.length===3&&p.every(normalizedPoint))));
 }
 async function imageHistory(id,hash){
  const key=await digest(new TextEncoder().encode(id+'\n'+hash)),prefix='BM_IMAGE_INK_'+key+'_';
  const files=await list("mimeType = 'application/json' and appProperties has { key='bm_kind' and value='bm_image_ink_v1' } and appProperties has { key='bm_image_key' and value='"+key+"' }");
  const events=new Map(),children=new Map();
  for(const f of files){
   const r=await json(f.id,300000),e=r.data;
   if(e.schema!=='BM-IMAGE-INK/1'||e.pdfId!==id||e.hash!==hash||e.page!==1||!uuid(e.event_id)||!(e.previous===null||uuid(e.previous))||f.name!==prefix+e.event_id+'.json'||r.meta.appProperties?.bm_image_key!==key||r.meta.appProperties?.bm_kind!=='bm_image_ink_v1'||!validInk(e.marks)||events.has(e.event_id)||children.has(e.previous))fail('Histórico de imagem inválido ou concorrente',409);
   events.set(e.event_id,e);children.set(e.previous,e);
  }
  let latest=null,n=0;while(children.has(latest?.event_id||null)){latest=children.get(latest?.event_id||null);if(++n>events.size)fail('Histórico circular',409)}
  if(n!==events.size)fail('Histórico de imagem incompleto',409);
  return {key,prefix,events,latest};
 }
 const imageView=(id,hash,e)=>({pdfId:id,page:1,hash,revision:e?.event_id||null,marks:e?.marks||[]});
 const readInk=async id=>{const hash=await imageIdentity(id);return imageView(id,hash,(await imageHistory(id,hash)).latest)};
 const saveInk=(id,input)=>serialize(async()=>{
  if(!input||!uuid(input.event_id)||!validInk(input.marks))fail('Marcações de imagem inválidas');
  const hash=await imageIdentity(id),h=await imageHistory(id,hash);
  if(input.hash!==hash)fail('Versão da imagem alterada',409);
  const existing=h.events.get(input.event_id);
  if(existing){if(existing.previous!==input.previous||!eq(existing.marks,input.marks)||h.latest.event_id!==existing.event_id)fail('Evento de imagem divergente',409);return imageView(id,hash,existing)}
  if((h.latest?.event_id||null)!==input.previous)fail('Imagem editada em outro dispositivo',409);
  const e={schema:'BM-IMAGE-INK/1',pdfId:id,page:1,hash,event_id:input.event_id,previous:input.previous,at_utc:new Date().toISOString(),marks:input.marks};
  await create(h.prefix+input.event_id+'.json',e,{bm_kind:'bm_image_ink_v1',bm_image_key:h.key});
  const confirmed=await imageHistory(id,hash);if(!eq(confirmed.latest,e)){uncertain=true;fail('Marcações de imagem não confirmadas',409)}
  return imageView(id,hash,e);
 });
 // Complete study handoff. A manifest makes absent or failed sources explicit.
 // Originals remain at their private Drive links: never encode an entire PDF library into JSON.
 const exportStudy=async (objective='')=>{
  const goal=String(objective||'').trim();if(goal.length>10000)throw Error('Objetivo excede 10.000 caracteres.');
  if(!identity.email)throw Error('O Google não confirmou o e-mail da conta. Reconecte antes de exportar.');
  const data={},sources={},capture=async(key,fn,optional=false)=>{
   try{const value=await fn();data[key]=value;sources[key]={status:value===null?'ausente':'confirmado'};if(value===null&&!optional)sources[key].detail='Não localizado na conta.'}
   catch(e){data[key]=null;sources[key]={status:'falha',detail:String(e.message||e)}}
  };
  await capture('methodology',methodology);
  await capture('operational_guide',operationalGuide);
  await capture('cards',async()=>snapshot.records);
  await capture('study',async()=>{const p=await studyMaster();return p?{revision:p.revision,data:p.data}:null});
  await capture('reviews',reviews);
  await capture('review_schedule',schedule);
  if(data.review_schedule?.complete===false)sources.review_schedule={status:'parcial',detail:data.review_schedule.warnings.join('; ')};
  await capture('writing',writing,true);
  await capture('gaps',async()=>{const p=await gapMaster();return p?{revision:p.revision,data:validateGaps(p.data)}:null});
  await capture('formulas',formulas,true);
  await capture('pdf_highlights',async()=>{const p=await grifos();return p.file?{revision:p.file.version,data:p.data}:null},true);
  await capture('image_ink',async()=>{
   const files=await list("mimeType = 'application/json' and appProperties has { key='bm_kind' and value='bm_image_ink_v1' }"),out=[],ids=new Set();
   for(const f of files){const r=await json(f.id,300000),e=r.data;if(e.schema!=='BM-IMAGE-INK/1'||!validId(e.pdfId)||!uuid(e.event_id)||!validInk(e.marks)||ids.has(e.event_id)||r.meta.appProperties?.bm_kind!=='bm_image_ink_v1'||!/^[a-f0-9]{64}$/.test(e.hash)||!(/^[a-f0-9]{64}$/.test(r.meta.appProperties?.bm_image_key||'')))throw Error('Evento de marcação inválido');const key=await digest(new TextEncoder().encode(e.pdfId+'\n'+e.hash));if(key!==r.meta.appProperties.bm_image_key||f.name!=='BM_IMAGE_INK_'+key+'_'+e.event_id+'.json')throw Error('Identificação de marcação divergente');ids.add(e.event_id);out.push(e)}
   return out;
  });
  await capture('media',async()=>[...(await media()).values()].map(x=>({...x,url:'https://drive.google.com/open?id='+x.id})));
  const incomplete=Object.entries(sources).filter(([k,s])=>['falha','parcial'].includes(s.status)||(['methodology','operational_guide'].includes(k)&&s.status!=='confirmado')).map(([k,s])=>({section:k,...s}));
  return {format:'BancoMestreChatGPTExport',schema_version:2,generated_at:new Date().toISOString(),source:'Google Drive da conta selecionada',account:{name:identity.name,email:identity.email},drive:{root_url:rootUrl,root_id:root.id},study_objective:goal||null,instructions:'Leia a Metodologia Mestre vigente e o Guia Operacional vigentes incluídos neste pacote antes de estudar. O objetivo do estudo será informado na conversa do ChatGPT. Use a base individual e preserve IDs, versões, módulos, vínculos e histórico. Consulte o Drive indicado para os originais quando necessário e autorizado. Não invente dados ausentes; verifique o manifesto de fontes e solicite o que faltar. Não publique dados pessoais no GitHub.',catalog:{version:snapshot.version,scope:snapshot.scope,count:snapshot.records.length,source_name:snapshot.sourceName},sections:Object.keys(data),sources,complete:incomplete.length===0,incomplete,data,limitations:['Exportação de continuidade de estudos, não backup integral: PDFs e imagens originais estão referenciados por links privados; os arquivos binários e cópias históricas do Drive não foram incorporados.','Dados locais legados ainda não migrados para o Drive não fazem parte deste pacote.']};
 };

 // Read-only diagnostics of the authenticated account; no export, write or rotation.
 const verifyDrive=async()=>{
  const modules={},notes=[],pending=[],warnings=[];
  const set=(key,state,message)=>{modules[key]={state,message};(state==='verified'?notes:state==='pending'?pending:warnings).push(message)};
  const check=async(key,fn)=>{try{const result=await fn();set(key,result.state||'verified',result.message)}catch(e){set(key,e.status===409?'conflict':'error',String(e.message||e).slice(0,350))}};
  await check('connection',async()=>{await meta(root.id);return {message:'Pasta individual consultada; '+(write?'escopo de gravação autorizado (sem teste de escrita)':'somente leitura')}});
  await check('pdfs',async()=>{const items=await media(true);const detail=mediaAudit.indexedPdfs?' · '+mediaAudit.foundIndexedPdfs+' de '+mediaAudit.indexedPdfs+' IDs do catálogo localizados; '+mediaAudit.legacyPdfs+' originais históricos recuperados':'';return {message:'PDFs: '+[...items.values()].filter(x=>x.mimeType==='application/pdf').length+' arquivos listados'+detail+' (conteúdo não baixado)'}});
  await check('atlas',async()=>{if(modules.pdfs.state!=='verified')throw Error('Consulta de mídias não confirmada');const all=[...(await media()).values()].filter(x=>x.mimeType.startsWith('image/')),visible=all.filter(x=>x.atlasVisible===true);return {message:visible.length+' imagens no Atlas e originais recuperados; '+(all.length-visible.length)+' arquivos fora do acervo de estudo ou filtrados (preservados no Drive)'}});
  await check('control',async()=>{const p=await study();return p.revision===null?{state:'pending',message:'Controle: não existe arquivo mestre; nenhum registro gravado pela conferência'}:{message:'Controle: '+p.data.sessions.length+' sessões; mestre lido e validado'}});
  await check('backup',async()=>{
   const files=await list("mimeType = 'application/json' and appProperties has { key='bm_kind' and value='bm_controle_estudos_v245_backup' }");
   if(!files.length)return {state:'pending',message:'Nenhum backup V245 identificado; nenhuma cópia criada pelo diagnóstico'};
   const groups=['daily','monthly'],checked=[];
   for(const period of groups){
    const group=files.filter(f=>f.appProperties?.bm_period===period).sort((a,b)=>String(b.appProperties?.bm_day||'').localeCompare(String(a.appProperties?.bm_day||'')));
    if(!group.length)continue;
    const f=group[0],d=(await json(f.id,10000000)).data;
    if(d.format!=='BancoMestreControleBackupV245'||d.period!==period||d.sha256!==f.appProperties?.bm_sha256||!d.data||d.data.schema!==1||!['subjects','sessions','reviews','cycle'].every(k=>Array.isArray(d.data[k]))||await digest(new TextEncoder().encode(JSON.stringify(d.data)))!==d.sha256)throw Error('Integridade do backup '+period+' não confirmada');
    for(const k of ['subjects','sessions','reviews'])if(d.data[k].some(row=>!row||typeof row.id!=='string')||new Set(d.data[k].map(row=>row.id)).size!==d.data[k].length)throw Error('IDs inválidos no backup '+period);
    checked.push(period==='daily'?'diário':'mensal');
   }
   return {state:checked.length===2?'verified':'pending',message:files.length+' backups identificados; '+(checked.length?'últimos '+checked.join(' e ')+' validados por SHA-256':'nenhuma cópia diária ou mensal válida')+'. Sem criação ou rotação.'};
  });
  await check('lacunas',async()=>{const p=await gapMaster();return p?{message:'Lacunas: '+validateGaps(p.data).records.length+' registros; mestre lido e validado'}:{state:'pending',message:'Lacunas: arquivo mestre não localizado'}});
  await check('grifos',async()=>{const p=await grifos();return p.file?{message:'Grifos: mestre V104 lido e validado; sem alteração das marcações'}:{state:'pending',message:'Grifos: nenhum arquivo mestre V104 localizado'}});
  return {at:new Date().toISOString(),modules,notes,pending,warnings,complete:!pending.length&&!warnings.length,summary:'Conferência de leitura da conta individual; gravações somente por módulo'};
 };
 return Object.freeze({verifyDrive,root:root.id,rootUrl,identity,snapshot,study,saveStudy,writing,saveWriting,gaps,saveGap,reviews,recordReview,schedule,formulas,methodology,operationalGuide,exportStudy,write,readAnnotations,saveAnnotations:annotationWrite,readInk,saveInk,async pdfs(fresh=false){return [...(await media(fresh===true)).values()].filter(m=>m.mimeType==='application/pdf')},async images(fresh=false){return [...(await media(fresh===true)).values()].filter(m=>m.mimeType.startsWith('image/')&&m.atlasVisible===true)},readMedia});
}

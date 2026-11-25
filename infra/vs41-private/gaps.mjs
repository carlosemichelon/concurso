// Isolated append-only gap journal. One revision per changed record, not a copy of the entire catalog.
import {createReader} from './catalog.mjs';
const API='https://www.googleapis.com/drive/v3/files',UPLOAD='https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id',PROJECT='bm-portal-multi-v1';
const idOk=x=>typeof x==='string'&&/^[A-Za-z0-9_-]{1,160}$/.test(x),gid=x=>typeof x==='string'&&/^LAC-[A-Za-z0-9_-]{1,120}$/.test(x);
const uuid=x=>typeof x==='string'&&/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(x);
const stages=['Identificada','Explicada','Em reforço','Dominada'],coverage=['Não auditada','Direta','Indireta','Parcial','Ausente'],types=['Conceitual','Memorização','Aplicação','Interpretação','Desatenção','Pesquisa'];
const events=['lacuna_criada','relato_ou_complemento_adicionado','complemento_adicionado','etapa_atualizada'];
const stringFields=['createdAt','updatedAt','origem','questaoId','disciplina','assuntoGeral','assuntoEspecifico','subassunto','tipo','cobertura','prioridade','etapa','enunciado','respostaEstudante','gabarito','relatoEstudante','diagnosticoAssistente','diagnosticoConfianca','diagnosticoEvidencias','descricao','fonte','pesquisa','auditoriaStatus','resolucaoEvidencia'];
const fail=code=>{const e=Error('Lacuna privada não confirmada');e.code=code;throw e};
const eq=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
function validate(r){
 if(!r||!gid(r.id)||Object.keys(r).some(k=>!['id','cardIds','historico',...stringFields].includes(k))||!stringFields.every(k=>typeof r[k]==='string'&&r[k].length<=50000)||!Array.isArray(r.cardIds)||r.cardIds.length>100||r.cardIds.some(x=>!/^CARD-\d{4,12}$/.test(x))||new Set(r.cardIds).size!==r.cardIds.length||!Array.isArray(r.historico)||r.historico.length>2000||!stages.includes(r.etapa)||!coverage.includes(r.cobertura)||!types.includes(r.tipo)||!['Normal','Alta','Baixa'].includes(r.prioridade)||!['Questão','Dúvida','Pesquisa','Leitura','Revisão'].includes(r.origem)||r.descricao.trim().length<5||!Number.isFinite(Date.parse(r.createdAt))||!Number.isFinite(Date.parse(r.updatedAt))||Buffer.byteLength(JSON.stringify(r))>240000)fail('input');
 for(const h of r.historico)if(!h||Object.keys(h).some(k=>!['at','evento','nota','from','to','evidencia'].includes(k))||Object.values(h).some(v=>typeof v!=='string'||v.length>50000)||!Number.isFinite(Date.parse(h.at)))fail('input');
 return r;
}
function transition(old,r,event){
 if(!events.includes(event))fail('input');
 if(!old){
  if(event!=='lacuna_criada'||r.etapa!=='Identificada'||r.historico.length||r.diagnosticoAssistente||r.diagnosticoConfianca||r.diagnosticoEvidencias||r.resolucaoEvidencia||r.auditoriaStatus!=='Cobertura declarada manualmente; não auditada pelo portal')fail('input');
  return;
 }
 if(event==='lacuna_criada')fail('conflict');
 const allowed=['updatedAt','historico'];
 if(event==='relato_ou_complemento_adicionado')allowed.push('relatoEstudante');
 if(event==='etapa_atualizada')allowed.push('etapa','resolucaoEvidencia');
 if(Object.keys(old).some(k=>!allowed.includes(k)&&!eq(old[k],r[k])))fail('input');
 if(old.relatoEstudante&&old.relatoEstudante!==r.relatoEstudante)fail('input');
 if(!eq(old.historico,r.historico.slice(0,old.historico.length)))fail('input');
 const extra=r.historico.slice(old.historico.length);
 if(event==='relato_ou_complemento_adicionado'&&!old.relatoEstudante&&r.relatoEstudante.trim()){if(extra.length)fail('input');return}
 if(extra.length!==1)fail('input');
 const h=extra[0];
 if(event==='relato_ou_complemento_adicionado'&&(h.evento!=='complemento_estudante'||!h.nota?.trim()))fail('input');
 if(event==='complemento_adicionado'&&(h.evento!=='complemento'||!h.nota?.trim()))fail('input');
 if(event==='etapa_atualizada'&&(stages.indexOf(r.etapa)!==stages.indexOf(old.etapa)+1||h.from!==old.etapa||h.to!==r.etapa||(r.etapa==='Dominada'?(r.resolucaoEvidencia.trim().length<12||h.evidencia!==r.resolucaoEvidencia):r.resolucaoEvidencia!==old.resolucaoEvidencia)))fail('input');
}
export function createGapStore({resolveSession,getToken,fetcher=fetch,now=Date.now}){
 const read=createReader({resolveSession,getToken,fetcher}),queues=new Map(),uncertain=new Set();
 async function scope(req){
  const s=await resolveSession(req);if(!s||![s.subject,s.rootId,s.profileId,s.sessionId].every(idOk))fail('session');
  const {records}=await read(req),{token}=await getToken();if(!token)fail('session');
  const live=async()=>{const t=await resolveSession(req);if(!t||['subject','rootId','profileId','sessionId'].some(k=>s[k]!==t[k]))fail('session')};
  const request=async(url,opts={})=>{const r=await fetcher(url,{...opts,headers:{Authorization:'Bearer '+token,...opts.headers},cache:'no-store',redirect:'error'});if(!r.ok)fail('drive');return r.json()};
  const meta=async(id)=>{if(!idOk(id))fail('metadata');const m=await request(API+'/'+id+'?fields=id,mimeType,ownedByMe,shared,trashed,parents,appProperties,size,version,headRevisionId,md5Checksum,sha256Checksum');
   if(m.id!==id||m.ownedByMe!==true||m.shared!==false||m.trashed!==false||m.parents?.length!==1||m.parents[0]!==s.rootId||m.appProperties?.bmProject!==PROJECT||m.appProperties?.bmOwner!==s.subject||m.appProperties?.bmKind!=='gap-event'||!/^application\/json(?:\s*;\s*charset\s*=\s*utf-8)?$/i.test(m.mimeType||'')||!Number.isSafeInteger(Number(m.size))||Number(m.size)<1||Number(m.size)>300000)fail('owner');return m};
  await live();return {s,request,meta,live,ids:new Set(records.map(c=>c.id))};
 }
 async function getEvent(ctx,id){
  const before=await ctx.meta(id),e=await ctx.request(API+'/'+id+'?alt=media'),after=await ctx.meta(id);
  const fields=['headRevisionId','md5Checksum','sha256Checksum'].filter(k=>before[k]||after[k]);
  if(String(before.size)!==String(after.size)||!(fields.length?fields.every(k=>before[k]&&before[k]===after[k]):before.version&&before.version===after.version))fail('revision');
  if(e?.schema!=='BM-GAP-EVENT/1'||e.owner!==ctx.s.subject||!uuid(e.event_id)||e.event_id!==before.appProperties.bmEvent||!events.includes(e.event)||!(e.previous===null||uuid(e.previous))||!Number.isFinite(Date.parse(e.at)))fail('event');
  validate(e.record);if(e.record.id!==before.appProperties.bmGap)fail('event');return e;
 }
 async function journal(ctx,only){
  const byId=new Map(),all=new Map();let page='',pages=0;
  do{
   if(++pages>25)fail('limit');
   const q="'"+ctx.s.rootId+"' in parents and trashed=false and appProperties has { key='bmKind' and value='gap-event' }"+(only?" and appProperties has { key='bmGap' and value='"+only+"' }":"");
   const u=new URL(API);u.searchParams.set('q',q);u.searchParams.set('fields','nextPageToken,incompleteSearch,files(id)');u.searchParams.set('pageSize','1000');if(page)u.searchParams.set('pageToken',page);
   const d=await ctx.request(u.href);if(d.incompleteSearch||!Array.isArray(d.files))fail('list');
   for(const f of d.files){if(all.size>=10000)fail('limit');const e=await getEvent(ctx,f.id);if(all.has(e.event_id)||only&&e.record.id!==only)fail('conflict');all.set(e.event_id,e);const list=byId.get(e.record.id)||new Map();if(list.has(e.previous))fail('conflict');list.set(e.previous,e);byId.set(e.record.id,list)}
   page=d.nextPageToken||'';
  }while(page);
  const latest=new Map();
  for(const [id,list] of byId){let e=null,n=0;while(list.has(e?.event_id||null)){const next=list.get(e?.event_id||null);transition(e?.record,next.record,next.event);e=next;if(++n>list.size)fail('conflict')}if(n!==list.size)fail('conflict');latest.set(id,e)}
  await ctx.live();return {all,latest};
 }
 async function get(req){const ctx=await scope(req),j=await journal(ctx),log=[...j.all.values()].sort((a,b)=>a.at.localeCompare(b.at)).map(e=>({id:e.event_id,at:e.at,event:e.event,lacunaId:e.record.id}));return {data:{schema:1,records:[...j.latest.values()].map(e=>e.record).sort((a,b)=>a.createdAt.localeCompare(b.createdAt)),log,updatedAt:log.at(-1)?.at||null},revisions:Object.fromEntries([...j.latest].map(([id,e])=>[id,e.event_id]))}}
 async function save(req,input){
  if(!input||!uuid(input.event_id)||!(input.previous===null||uuid(input.previous))||!events.includes(input.event))fail('input');
  const r=validate(input.record),ctx=await scope(req),key=ctx.s.subject+':'+r.id,prior=queues.get(key)||Promise.resolve();
  const work=prior.catch(()=>{}).then(async()=>{
   await ctx.live();const j=await journal(ctx,r.id),old=j.latest.get(r.id),existing=j.all.get(input.event_id),attempt=key+':'+input.event_id;
   if(existing){if(existing.previous!==input.previous||existing.event!==input.event||!eq(existing.record,r))fail('conflict');return {record:old.record,revision:old.event_id,at:old.at}}
   if(uncertain.has(attempt)||(old?.event_id||null)!==input.previous)fail('conflict');
   transition(old?.record,r,input.event);if(r.cardIds.some(id=>!ctx.ids.has(id)))fail('input');
   const e={schema:'BM-GAP-EVENT/1',owner:ctx.s.subject,event_id:input.event_id,previous:input.previous,event:input.event,at:new Date(now()).toISOString(),record:r};
   const m={name:'BM_GAP_'+r.id+'_'+e.event_id+'.json',mimeType:'application/json',parents:[ctx.s.rootId],appProperties:{bmProject:PROJECT,bmOwner:ctx.s.subject,bmKind:'gap-event',bmGap:r.id,bmEvent:e.event_id}};
   const boundary='bm_'+e.event_id.replaceAll('-',''),body='--'+boundary+'\r\nContent-Type: application/json\r\n\r\n'+JSON.stringify(m)+'\r\n--'+boundary+'\r\nContent-Type: application/json\r\n\r\n'+JSON.stringify(e)+'\r\n--'+boundary+'--\r\n';
   await ctx.live();if(uncertain.size>=10000)fail('limit');uncertain.add(attempt);
   const f=await ctx.request(UPLOAD,{method:'POST',headers:{'Content-Type':'multipart/related; boundary='+boundary},body}),confirmed=await getEvent(ctx,f.id);
   if(!eq(confirmed,e))fail('receipt');await ctx.live();return {record:r,revision:e.event_id,at:e.at};
  });
  queues.set(key,work);try{return await work}finally{if(queues.get(key)===work)queues.delete(key)}
 }
 return {get,save};
}

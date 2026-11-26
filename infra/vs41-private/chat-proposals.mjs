// Immutable, private chat proposal batches. No promotion, allocation or SRS writes.
import {createHash} from 'node:crypto';
import {createReader,readableCardId} from './catalog.mjs';
const PROJECT='bm-portal-multi-v1',API='https://www.googleapis.com/drive/v3/files',UPLOAD='https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id';
const hash=v=>createHash('sha256').update(JSON.stringify(v)).digest('hex');
const uuid=x=>typeof x==='string'&&/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(x);
const idOk=x=>typeof x==='string'&&/^[A-Za-z0-9_-]{1,160}$/.test(x);
const fail=code=>{const e=Error('Lote privado não confirmado');e.code=code;throw e};
const exact=(o,keys)=>o&&typeof o==='object'&&!Array.isArray(o)&&Object.keys(o).length===keys.length&&keys.every(k=>Object.hasOwn(o,k));
const txt=(v,max)=>typeof v==='string'&&v.trim().length>0&&v.length<=max;
export const destinationOf=s=>hash([PROJECT,s.subject,s.rootId,s.profileId]);
export const catalogDigest=records=>hash(records);

// Version 2 adds explicit editorial structure. New media are not accepted until
// ownership and byte verification are implemented; existing media remain intact.
const colors={core:'#FDE68A',agent:'#BBF7D0',condition:'#BAE6FD',exception:'#FECDD3'};
function safeMathML(s){
 if(!txt(s,16000)||!s.startsWith('<math xmlns="http://www.w3.org/1998/Math/MathML">')||!s.endsWith('</math>'))return false;
 const stack=[],allowed=new Set(['math','mrow','mi','mn','mo','mtext','msub','msup','msubsup','mfrac','msqrt','mroot','munder','mover','munderover','mtable','mtr','mtd']);
 const tokens=s.match(/<[^>]*>|[^<]+/g)||[];
 if(tokens.join('')!==s)return false;
 for(const t of tokens){
  if(t.startsWith('<')){
   if(t==='<math xmlns="http://www.w3.org/1998/Math/MathML">'){if(stack.length||t!==tokens[0])return false;stack.push('math');continue}
   const m=t.match(/^<(\/?)([a-z]+)>$/);if(!m||!allowed.has(m[2])||!stack.length)return false;
   if(m[1]){if(stack.pop()!==m[2])return false;if(!stack.length&&t!==tokens.at(-1))return false}
   else{if(m[2]==='math'||stack.length>=40)return false;stack.push(m[2])}
  }else if(!stack.length||/&(?!amp;|lt;|gt;|quot;|apos;|#[0-9]+;|#x[0-9a-fA-F]+;)/.test(t)||t.includes('>'))return false;
 }
 return stack.length===0;
}
function validateEditorial(p,old){
 const e=p.editorial;
 if(!exact(e,['answer_paragraphs','highlights','formulas','table'])||!Array.isArray(e.answer_paragraphs)||e.answer_paragraphs.length<1||e.answer_paragraphs.length>50||e.answer_paragraphs.some(t=>!txt(t,20000))||e.answer_paragraphs.join('\n\n')!==p.back||!Array.isArray(e.highlights)||e.highlights.length>100||e.highlights.some(h=>!exact(h,['text','kind','color','bold'])||!txt(h.text,500)||!Object.hasOwn(colors,h.kind)||colors[h.kind]!==h.color||typeof h.bold!=='boolean'||!p.back.includes(h.text))||!Array.isArray(e.formulas)||e.formulas.length>30)fail('input');
 for(const f of e.formulas)if(!exact(f,['title','mathml','units'])||!txt(f.title,300)||!safeMathML(f.mathml)||typeof f.units!=='string'||f.units.length>300)fail('input');
 const t=e.table;
 if(t!==null&&(!exact(t,['headers','rows'])||!Array.isArray(t.headers)||t.headers.length<2||t.headers.length>12||t.headers.some(x=>!txt(x,300))||!Array.isArray(t.rows)||t.rows.length<1||t.rows.length>100||t.rows.some(r=>!Array.isArray(r)||r.length!==t.headers.length||r.some(x=>!txt(x,3000)))))fail('input');
 if(!exact(p.classification,['discipline','group','subject','sub'])||Object.values(p.classification).some(x=>!txt(x,300))||!txt(p.title,500)||!txt(p.mnemonic,5000))fail('input');
 if(p.modules[0].texto!==p.front||p.modules[1].texto!==p.back)fail('input');
 // No silent deletion or change to pre-existing structured items in this first contract.
 const prev=old?.consolidation?.profile?.editorial;
 if(prev?.formulas?.some(f=>!e.formulas.some(x=>JSON.stringify(x)===JSON.stringify(f))))fail('preservation');
 if(prev?.table&&JSON.stringify(prev.table)!==JSON.stringify(t))fail('preservation');
 if(old&&Object.keys(p.classification).some(k=>old[k]!==p.classification[k]))fail('preservation');
}
export function buildEditorialCandidates(input,records,session){
 const clean=validateProposal(input,records,session);
 if(clean.schema!=='BM-CHAT-PROPOSALS/2')fail('input');
 const byId=new Map(records.map(c=>[c.id,c]));
 return clean.proposals.map(p=>{
  const old=byId.get(p.target_id),profile=old?.consolidation?.profile;
  if(old&&!profile)return {key:p.key,target_id:p.target_id,candidate:null,blockers:['legacy-source-recovery-required']};
  const base=old?structuredClone(old):{...p.classification,id:null,active:true};
  const related=[...new Set([...(base.related_card_ids||[]),...(profile?.related_card_ids||[]),...p.related_card_ids])].filter(id=>id!==p.target_id);
  const editorial={...structuredClone(profile?.editorial||{}),...structuredClone(p.editorial),media:structuredClone(profile?.editorial?.media||[]),reveal_after_attempt:true,history_collapsed:true,status:'PROPOSTA_NAO_PUBLICADA'};
  const next={...base,front:p.front,back:p.back,expl:p.modules.slice(2).map(m=>m.titulo+'\n'+m.texto).join('\n\n'),mnemonic:p.mnemonic,reference:p.source,related_card_ids:related};
  const prior=structuredClone(base.consolidation||{});
  next.consolidation={...prior,primary_id:p.target_id,profile:{...structuredClone(profile||{}),id:p.target_id,title:p.title,front:p.front,back:p.back,source:p.source,mnemonic:p.mnemonic,modules:structuredClone(p.modules),related_card_ids:related,editorial}};
  return {key:p.key,target_id:p.target_id,candidate:next,prior_sha256:old?hash(old):null,blockers:['editorial-authorization-required','atomic-promotion-required',...(!old?['canonical-id-reservation-required']:[]),...(p.related_card_ids.some(id=>!base.related_card_ids?.includes(id))?['reciprocal-link-update-required']:[])]};
 });
}

export function validateProposal(input,records,session){
 if(!exact(input,['schema','destination','base_sha256','batch_id','proposals'])||!['BM-CHAT-PROPOSALS/1','BM-CHAT-PROPOSALS/2'].includes(input.schema)||!uuid(input.batch_id)||!Array.isArray(input.proposals)||input.proposals.length<1||input.proposals.length>50||Buffer.byteLength(JSON.stringify(input))>250000)fail('input');
 if(input.destination!==destinationOf(session))fail('destination');
 if(input.base_sha256!==catalogDigest(records))fail('stale');
 const byId=new Map(records.map(c=>[c.id,c])),v2=input.schema==='BM-CHAT-PROPOSALS/2',active=new Set(records.filter(c=>c.active).map(c=>c.id)),keys=new Set(),targets=new Set();
 for(const p of input.proposals){
  if(!exact(p,['key','operation','target_id','front','back','source','modules','related_card_ids',...(v2?['editorial','classification','title','mnemonic']:[])])||!idOk(p.key)||keys.has(p.key)||!['new','evolve'].includes(p.operation)||!txt(p.front,12000)||!txt(p.back,20000)||!txt(p.source,4000)||!Array.isArray(p.modules)||p.modules.length!==11||p.modules.some((m,i)=>!exact(m,['ord','titulo','texto'])||m.ord!==i+1||!txt(m.titulo,300)||!txt(m.texto,20000))||!Array.isArray(p.related_card_ids)||p.related_card_ids.length>100||new Set(p.related_card_ids).size!==p.related_card_ids.length||p.related_card_ids.some(id=>!readableCardId(id)||!active.has(id)))fail('input');
  if(p.operation==='new'?p.target_id!==null:!active.has(p.target_id)||targets.has(p.target_id))fail('input');
  if(v2)validateEditorial(p,byId.get(p.target_id));
  keys.add(p.key);if(p.target_id)targets.add(p.target_id);
 }
 return structuredClone(input);
}
// Read-only editorial impact: never manufacture missing structured content or reserve an ID.
export function previewProposal(input,records,session){
 const clean=validateProposal(input,records,session),byId=new Map(records.map(c=>[c.id,c]));
 const changes=clean.proposals.map(p=>{
  const old=p.target_id?byId.get(p.target_id):null,profile=old?.consolidation?.profile;
  const priorLinks=[...new Set([...(old?.related_card_ids||[]),...(profile?.related_card_ids||[])])];
  const questions=[...new Set([...(old?.related_question_ids||[]),...(profile?.related_question_ids||[])])];
  const media=Array.isArray(profile?.editorial?.media)?profile.editorial.media:[];
  const historic=old?.consolidation?.historical_ids||[];
  const links=[...new Set([...priorLinks,...p.related_card_ids])].filter(id=>id!==p.target_id);
  const added=links.filter(id=>!priorLinks.includes(id));
  const blockers=['editorial-authorization-required',...(clean.schema==='BM-CHAT-PROPOSALS/1'?['structured-editorial-content-required']:['atomic-promotion-required'])];
  if(!old){blockers.push('canonical-id-reservation-required');if(clean.schema==='BM-CHAT-PROPOSALS/1')blockers.push('classification-required')}
  else if(!profile)blockers.push('legacy-source-recovery-required');
  if(priorLinks.includes(p.target_id)||p.related_card_ids.includes(p.target_id))blockers.push('self-link-requires-review');
  return {key:p.key,operation:p.operation,target_id:p.target_id,frontChanged:!old||old.front!==p.front,backChanged:!old||old.back!==p.back,sourceChanged:!profile||profile.source!==p.source,modulesChanged:p.modules.filter((m,i)=>JSON.stringify(m)!==JSON.stringify(profile?.modules?.[i])).map(m=>m.ord),preserve:{original:!!old,historicalIds:historic.length,questionLinks:questions.length,mediaAssociations:media.length,legacyImages:Array.isArray(old?.related_image_ids)?old.related_image_ids.length:0,structuredFormulas:profile?.editorial?.formulas?.length||0,structuredTable:!!profile?.editorial?.table,reviewHistory:true},related:{preserved:priorLinks,added,union:links,reciprocalReview:added},blockers};
 });
 return {batch_id:clean.batch_id,digest:hash(clean),base_sha256:catalogDigest(records),changes,structuredCandidates:clean.schema==='BM-CHAT-PROPOSALS/2'?buildEditorialCandidates(clean,records,session).map(c=>({key:c.key,target_id:c.target_id,candidate_sha256:c.candidate?hash(c.candidate):null,prior_sha256:c.prior_sha256||null,blockers:c.blockers})):[],readyToPromote:false,mode:'preview-only',catalogModified:false,srsModified:false};
}
export function createChatProposalStore({resolveSession,getToken,fetcher=fetch,now=Date.now}){
 const read=createReader({resolveSession,getToken,fetcher}),queues=new Map(),uncertain=new Set();
 async function process(req,input,previewOnly=false){
  const s=await resolveSession(req);if(!s||![s.subject,s.rootId,s.profileId,s.sessionId].every(idOk))fail('session');
  if(!uuid(input?.batch_id))fail('input');
  const key=s.subject+':'+input.batch_id,prior=queues.get(key)||Promise.resolve();
  const work=prior.catch(()=>{}).then(async()=>{
   const live=async()=>{const t=await resolveSession(req);if(!t||['subject','rootId','profileId','sessionId'].some(k=>s[k]!==t[k]))fail('session')};
   await live();const {records}=await read(req),{token}=await getToken(s);if(!token)fail('session');
   if(input.destination!==destinationOf(s))fail('destination');
   const request=async(url,opts={})=>{const r=await fetcher(url,{...opts,headers:{Authorization:'Bearer '+token,...opts.headers},cache:'no-store',redirect:'error'});if(!r.ok)fail('drive');return r.json()};
   const meta=async id=>{
    if(!idOk(id))fail('receipt');
    const m=await request(API+'/'+id+'?fields=id,mimeType,ownedByMe,shared,trashed,parents,appProperties,size,version,headRevisionId,md5Checksum,sha256Checksum');
    if(m.id!==id||m.mimeType!=='application/json'||m.ownedByMe!==true||m.shared!==false||m.trashed!==false||m.parents?.length!==1||m.parents[0]!==s.rootId||m.appProperties?.bmProject!==PROJECT||m.appProperties?.bmOwner!==s.subject||m.appProperties?.bmKind!=='chat-proposal'||m.appProperties?.bmEvent!==input.batch_id||!Number.isSafeInteger(Number(m.size))||Number(m.size)<1||Number(m.size)>260000)fail('receipt');
    return m;
   };
   const verify=async id=>{
    const before=await meta(id),e=await request(API+'/'+id+'?alt=media'),after=await meta(id);
    const fields=['headRevisionId','md5Checksum','sha256Checksum'].filter(k=>before[k]||after[k]);
    if(String(before.size)!==String(after.size)||!(fields.length?fields.every(k=>before[k]&&before[k]===after[k]):before.version&&before.version===after.version)||e?.schema!=='BM-PRIVATE-CHAT-PROPOSAL/1'||e.owner!==s.subject||e.status!=='proposal-only'||e.input?.batch_id!==input.batch_id||e.digest!==hash(e.input)||e.digest!==hash(input)||!Number.isFinite(Date.parse(e.at)))fail('conflict');
    await live();return {batch_id:input.batch_id,digest:e.digest,count:e.input.proposals.length,status:'proposal-only',catalogModified:false,srsModified:false};
   };
   const u=new URL(API);u.searchParams.set('q',"'"+s.rootId+"' in parents and trashed=false and appProperties has { key='bmKind' and value='chat-proposal' } and appProperties has { key='bmEvent' and value='"+input.batch_id+"' }");u.searchParams.set('fields','nextPageToken,incompleteSearch,files(id)');u.searchParams.set('pageSize','100');
   const list=await request(u.href);if(list.incompleteSearch||list.nextPageToken||!Array.isArray(list.files)||list.files.length>1)fail('conflict');
   if(list.files.length===1){const receipt=await verify(list.files[0].id);uncertain.delete(key);return previewOnly?previewProposal(input,records,s):receipt}
   if(previewOnly)fail('missing');
   if(uncertain.has(key))fail('conflict');
   const clean=validateProposal(input,records,s),e={schema:'BM-PRIVATE-CHAT-PROPOSAL/1',owner:s.subject,status:'proposal-only',at:new Date(now()).toISOString(),digest:hash(clean),input:clean};
   const m={name:'BM_CHAT_PROPOSAL_'+input.batch_id+'.json',mimeType:'application/json',parents:[s.rootId],appProperties:{bmProject:PROJECT,bmOwner:s.subject,bmKind:'chat-proposal',bmEvent:input.batch_id}};
   const boundary='bm_'+input.batch_id.replaceAll('-',''),body='--'+boundary+'\r\nContent-Type: application/json\r\n\r\n'+JSON.stringify(m)+'\r\n--'+boundary+'\r\nContent-Type: application/json\r\n\r\n'+JSON.stringify(e)+'\r\n--'+boundary+'--\r\n';
   await live();if(uncertain.size>=10000)fail('limit');uncertain.add(key);
   const result=await request(UPLOAD,{method:'POST',headers:{'Content-Type':'multipart/related; boundary='+boundary},body});const receipt=await verify(result.id);uncertain.delete(key);return receipt;
  });
  queues.set(key,work);try{return await work}finally{if(queues.get(key)===work)queues.delete(key)}
 }
 return {save:(req,input)=>process(req,input),preview:(req,input)=>process(req,input,true)};
}

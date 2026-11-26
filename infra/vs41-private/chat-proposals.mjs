// Pure editorial validation and candidate construction; no parallel proposal store.
import {createHash} from 'node:crypto';
import {readableCardId} from './catalog.mjs';
const PROJECT='bm-portal-multi-v1';
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

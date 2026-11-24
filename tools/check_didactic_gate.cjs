'use strict';
const fs=require('node:fs'),crypto=require('node:crypto'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const J=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const hash=x=>crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex');
const {execFileSync}=require('node:child_process');
const categories=['core','agent','condition','exception'];
const criteria=['front','answer','mechanism','transfer','sources','semantic_marks','formula','table','media','history','review_modes','visual','coverage'];
const generic=/^(?:consultar o fundamento|não confundir grandezas[.!]?$|verificar a norma[.!]?$|não se aplica[.!]?$|revisar o conteúdo[.!]?$)/i;
const nonempty=x=>typeof x==='string'&&x.trim().length>0;
function inspect(r,c,p,model){
 const faults=[];const ck=(ok,msg)=>{if(!ok)faults.push(msg)};
 ck(c&&p,'cartão/perfil ausente');if(!c||!p)return faults;
 ck(nonempty(c.front)&&nonempty(c.back),'frente/verso ausentes');
 ck(Array.isArray(p.layers)&&p.layers.length===11&&p.layers.every((m,i)=>m.ord===i+1&&nonempty(m.titulo)&&nonempty(m.texto)&&!generic.test(m.texto.trim())),'11 critérios ausentes ou preenchimento genérico');
 const a=p.learning_model;
 ck(a&&Array.isArray(a.paragraphs)&&a.paragraphs.length>0&&a.paragraphs.every(nonempty),'resposta-modelo contínua ausente');
 if(a){
  const body=(a.paragraphs||[]).join('\n');
  ck(nonempty(a.renderer)&&a.renderer===model.renderer,'renderizador não corresponde ao modelo homologado');
  ck(a.history_collapsed===true&&a.reveal_after_attempt===true,'histórico/revelação fora do padrão');
  ck(Array.isArray(a.marks)&&a.marks.length>0&&a.marks.some(m=>m.kind==='core'),'grifos semânticos ausentes');
  for(const m of a.marks||[]){ck(categories.includes(m.kind)&&nonempty(m.text)&&body.includes(m.text),'grifo inválido ou fora do texto');ck(!m.bold||nonempty(m.error_evidence),'negrito sem evidência de erro real');}
  for(const k of ['formula','table','media']){
   const x=a[k];ck(x&&['APLICAVEL','NAO_APLICAVEL'].includes(x.applicability),'aplicabilidade sem decisão: '+k);
   if(x?.applicability==='NAO_APLICAVEL')ck(nonempty(x.reason),'justificativa ausente: '+k);
   if(x?.applicability==='APLICAVEL'){
    ck(Array.isArray(x.items)&&x.items.length>0,'recurso necessário ausente: '+k);
    for(const i of x.items||[]){
     if(k==='formula')ck(nonempty(i.mathml)&&/<math[\s>]/.test(i.mathml)&&!/<script\b/i.test(i.mathml)&&nonempty(i.units),'fórmula sem MathML/unidades');
     if(k==='table')ck(Array.isArray(i.headers)&&i.headers.length>=2&&Array.isArray(i.rows)&&i.rows.length>0&&i.rows.every(row=>Array.isArray(row)&&row.length===i.headers.length),'tabela sem células reais');
     if(k==='media')ck(nonempty(i.id)&&['FRONT_ENUNCIADO','VERSO_APOS_TENTATIVA'].includes(i.role)&&nonempty(i.caption)&&nonempty(i.evidence),'mídia sem identificação/fase/evidência');
    }
   }
  }
  ck(nonempty(a.mnemonic)&&!/\?\s*$/.test(a.mnemonic),'macete ausente ou substituído por pergunta');
 }
 ck(model.status==='APROVADO'&&nonempty(model.approval_ref)&&nonempty(model.renderer),'modelo visual não homologado');
 ck(r.status==='APROVADO_PEDAGOGICO','cartão sem aprovação editorial');
 ck(r.content_sha256===hash({card:c,profile:p}),'aprovação não corresponde aos dados atuais');
 for(const k of criteria){const e=r.evidence?.[k];ck(e&&['VERIFICADO','NAO_APLICAVEL'].includes(e.status)&&nonempty(e.ref)&&!(e.status==='NAO_APLICAVEL'&&!['formula','table','media'].includes(k)),'evidência editorial ausente: '+k);}
 return faults;
}
function audit(registry=J('assets/didactic_gate_current.json'),read=J){
 const results=[];const seen=new Set();
 for(const r of registry.records){const key=r.id+'|'+r.source;if(seen.has(key))throw Error('ID/fonte repetido '+key);seen.add(key);const d=read(r.source);const p=d[r.profile_key]?.[r.id];const c=d.new_cards?.find(x=>x.id===r.id)??d.updates?.find(x=>x.id===r.id)??d.existing_updates?.find(x=>x.id===r.id)??p;results.push({id:r.id,part:r.part,faults:inspect(r,c,p,registry.model)});}
 return {total:results.length,approved:results.filter(x=>!x.faults.length).length,blocked:results.filter(x=>x.faults.length).length,results};
}

function packetIDs(d){
 const out=new Map();
 for(const k of ['profiles','approved','existing','cards','notes','relations']){
  if(d[k]&&!Array.isArray(d[k])&&typeof d[k]==='object')for(const [id,val] of Object.entries(d[k]))if(/^CARD-\d{4,}$/.test(id)){if(!out.has(id))out.set(id,{});out.get(id)[k]=val;}
 }
 for(const k of ['new_cards','updates','existing_updates','related_updates','cards']){
  if(Array.isArray(d[k]))for(const c of d[k])if(/^CARD-\d{4,}$/.test(c?.id||'')){if(!out.has(c.id))out.set(c.id,{});out.get(c.id)[k]=c;}
 }
 return out;
}
function inventoryDiff(before,after){const a=packetIDs(before||{}),b=packetIDs(after||{});return [...new Set([...a.keys(),...b.keys()])].filter(id=>hash(a.get(id)??null)!==hash(b.get(id)??null));}
function coverageErrors(registry,changes){
 const errors=[];for(const item of changes)for(const id of inventoryDiff(item.before,item.after)){
  const matches=registry.records.filter(r=>r.id===id&&r.source===item.path);
  if(matches.length!==1)errors.push({id,part:'INCREMENTO',faults:['alteração didática não cadastrada: '+item.path]});
 }
 return errors;
}
function changedPackets(registry){
 const base=registry.baseline_commit;if(!/^[a-f0-9]{40}$/.test(base||''))throw Error('baseline inválida');
 const list=execFileSync('git',['diff','--name-only',base,'--','assets'],{cwd:root,encoding:'utf8'}).split('\n').filter(p=>p.endsWith('.json')&&!p.endsWith('didactic_gate_current.json'));
 return list.map(p=>{
  let before={},after={};try{before=JSON.parse(execFileSync('git',['show',base+':'+p],{cwd:root,encoding:'utf8',maxBuffer:64*1024*1024,stdio:['ignore','pipe','ignore']}));}catch(e){if(e.status!==128)throw e;}
  if(fs.existsSync(path.join(root,p)))after=J(p);
  return {path:p,before,after};
 });
}
function releaseAudit(registry=J('assets/didactic_gate_current.json')){
 const a=audit(registry),additional=coverageErrors(registry,changedPackets(registry));
 const results=[...a.results,...additional];return {total:results.length,approved:results.filter(x=>!x.faults.length).length,blocked:results.filter(x=>x.faults.length).length,results};
}

if(require.main===module){const a=releaseAudit();console.log(JSON.stringify(a,null,2));if(process.argv.includes('--release')&&a.blocked)process.exitCode=1;}
module.exports={inspect,audit,hash,criteria,inventoryDiff,coverageErrors,releaseAudit};

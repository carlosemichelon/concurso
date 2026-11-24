'use strict';
const fs=require('node:fs'),crypto=require('node:crypto'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const J=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const hash=x=>crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex');
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
 for(const r of registry.records){if(seen.has(r.id))throw Error('ID repetido '+r.id);seen.add(r.id);const d=read(r.source);const c=d.new_cards?.find(x=>x.id===r.id)??d.updates?.find(x=>x.id===r.id);const p=d[r.profile_key]?.[r.id];results.push({id:r.id,part:r.part,faults:inspect(r,c,p,registry.model)});}
 return {total:results.length,approved:results.filter(x=>!x.faults.length).length,blocked:results.filter(x=>x.faults.length).length,results};
}
if(require.main===module){const a=audit();console.log(JSON.stringify(a,null,2));if(process.argv.includes('--release')&&a.blocked)process.exitCode=1;}
module.exports={inspect,audit,hash,criteria};

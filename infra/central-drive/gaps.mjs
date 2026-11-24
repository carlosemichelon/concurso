import {createHash} from 'node:crypto';
import {emptyGaps,checkedGapsData,checkedGapsEnvelope,stages} from '../../assets/multiaccount-gaps-v001.mjs';
import {profileCatalog} from '../../assets/multiaccount-srs-v001.mjs';
export class GapsRejected extends Error {}
export class GapsUncertain extends Error {}
const hash=x=>createHash('sha256').update(JSON.stringify(x)).digest('hex');
const equal=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const prefix=(old,next)=>old.length<=next.length&&old.every((x,i)=>equal(x,next[i]));
export const validGapsInput=x=>!!(x&&typeof x==='object'&&!Array.isArray(x)&&Object.keys(x).length===2&&/^[a-f0-9]{64}$/.test(x.expected||'')&&x.data?.schema===1);
export function verifyEvolution(old,next,ids){
 if(!prefix(old.log,next.log))throw new GapsRejected('Diário original deve permanecer integral');
 const previous=new Map(old.records.map(r=>[r.id,r])),current=new Map(next.records.map(r=>[r.id,r]));
 for(const [id,r] of previous){
  const n=current.get(id);if(!n)throw new GapsRejected('Não é permitido remover lacuna histórica');
  for(const field of Object.keys(r))if(!['updatedAt','relatoEstudante','historico','etapa','resolucaoEvidencia'].includes(field)&&!equal(r[field],n[field]))throw new GapsRejected('Registro original e autoria devem permanecer intactos: '+id);
  if(r.relatoEstudante&&n.relatoEstudante!==r.relatoEstudante)throw new GapsRejected('Relato literal não pode ser substituído');
  if(!prefix(r.historico,n.historico))throw new GapsRejected('Histórico de evolução não pode ser removido');
  let stage=r.etapa;for(const event of n.historico.slice(r.historico.length)){if(event.to!==undefined){if(event.from!==stage||stages.indexOf(event.to)!==stages.indexOf(stage)+1||event.to==='Dominada'&&(typeof event.evidencia!=='string'||event.evidencia.trim().length<12))throw new GapsRejected('Transição sem evidência ou fora da sequência');stage=event.to}}
  if(stage!==n.etapa||n.etapa==='Dominada'&&String(n.resolucaoEvidencia||'').trim().length<12)throw new GapsRejected('Evolução sem evidência');
 }
 for(const r of next.records)if(!previous.has(r.id)){if(r.cardIds.some(id=>!ids.has(id))||r.etapa!=='Identificada'||r.diagnosticoAssistente!==''||r.diagnosticoConfianca||r.diagnosticoEvidencias||r.historico.length)throw new GapsRejected('Nova lacuna deve ter vínculos do perfil e autoria manual, sem diagnóstico inventado')}
}
export function createGapsService(){
 const busy=new Set();
 return async({provider,profile,operation,guard=()=>true})=>{
  const subject=profile.subject;if(busy.has(subject))throw new GapsRejected('Sincronização em andamento');busy.add(subject);
  try{
   if(!guard())throw new GapsRejected('Sessão encerrada');
   const remote=await provider.readGaps(subject),seeds=(profile.privateData.study||[]).filter(x=>x?.format==='BancoMestreLacunasV242');
   if(seeds.length>1)throw new GapsRejected('Mais de um histórico inicial de lacunas; conciliação necessária');
   const current=checkedGapsData(remote?checkedGapsEnvelope(remote.payload,subject).data:seeds[0]?.data||emptyGaps()),version=hash(current);
   if(operation.kind==='read')return {version,data:current};
   if(operation.kind!=='sync'||!validGapsInput(operation.input))throw new GapsRejected('Cadastro inválido');
   let next;try{next=checkedGapsData(operation.input.data)}catch(e){throw new GapsRejected(e.message)}
   if(hash(next)===version)return {version,data:current,changed:false};
   if(operation.input.expected!==version)throw new GapsRejected('Lacunas alteradas em outro dispositivo. Exporte o backup local e concilie antes de gravar.');
   verifyEvolution(current,next,new Set(profileCatalog(profile).map(c=>c.id)));
   const envelope=data=>checkedGapsEnvelope({schema:'BM-PORTAL-GAPS/1',owner:subject,data},subject);
   if(!guard())throw new GapsRejected('Sessão encerrada');
   try{
    if(remote||seeds.length)await provider.archiveGaps(subject,version,envelope(current));
    if(!guard())throw new GapsRejected('Sessão encerrada');
    await provider.saveGaps(subject,remote?{id:remote.id,version:remote.version}:null,envelope(next));
    const confirmed=await provider.readGaps(subject);
    if(!confirmed||!equal(checkedGapsEnvelope(confirmed.payload,subject).data,next))throw Error('Recibo divergente');
    return {version:hash(next),data:next,changed:true};
   }catch(e){if(e instanceof GapsRejected)throw e;throw new GapsUncertain('Gravação não confirmada; preserve o backup e repita a sincronização.')}
  }finally{busy.delete(subject)}
 };
}

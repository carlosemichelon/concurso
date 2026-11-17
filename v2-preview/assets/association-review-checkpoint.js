/* Banco Mestre V2 — decisões de associação propostas, sem alterar o catálogo.
 * Histórico append-only em MEMÓRIA. Exportação/importação manual com SHA-256.
 * Nunca envia dados ao Drive, GitHub, localStorage, IndexedDB ou telemetria.
 */
export const REVIEW_CHECKPOINT_SCHEMA='BancoMestreV2AssociationReviewCheckpointV1';
const AUDIT_SCHEMA='BancoMestreV2ImageAssociationAudit';
const CARD=/^CARD-\d{4,}$/;
const FILE=/^[A-Za-z0-9_-]{10,200}$/;
const ACTIONS=new Set(['vincular_cartao','manter_conteudo','rejeitar_candidato','adiar']);
const EVIDENCE=new Set([
  'enunciado_original_conferido','imagem_explicativa_no_cartao',
  'documento_origem_conferido','sem_correspondencia_confirmada',
  'outra_evidencia_descrita'
]);
const ISO=s=>typeof s==='string'&&/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d\.\d{3}Z$/.test(s)&&Number.isFinite(Date.parse(s));
const plain=x=>x!==null&&typeof x==='object'&&!Array.isArray(x)&&Object.getPrototypeOf(x)===Object.prototype;
const validNote=s=>typeof s==='string'&&s.trim().length>=15&&s.length<=1200;
const keyOf=item=>String(item?.key||'');
const expectedId=item=>String(item?.driveId||'');
const clone=entry=>Object.freeze({...entry});
const coreFields=Object.freeze({cards:'V194',images:'V198',storage:'V202'});
function mustAudit(report){
  if(report?.schema!==AUDIT_SCHEMA||!Array.isArray(report.records))
    throw Error('Auditoria de imagens não carregada');
}
function normalizeItem(report,key){
  mustAudit(report);
  const found=report.records.find(x=>x.key===key);
  if(!found)throw Error('Imagem não localizada na auditoria atual');
  if(!['editorial','drive'].includes(found.kind))throw Error('Tipo de imagem não reconhecido');
  return found;
}
function validateEvent(entry,index){
  if(!plain(entry)||entry.seq!==index+1||typeof entry.imageKey!=='string'||
    entry.imageKey.length<5||entry.imageKey.length>250||
    typeof entry.driveId!=='string'||(entry.driveId!==''&&!FILE.test(entry.driveId))||
    !ACTIONS.has(entry.action)||!EVIDENCE.has(entry.evidence)||
    !validNote(entry.reason)||!ISO(entry.recordedAt))
    throw Error('Evento inválido ou fora da sequência na posição '+(index+1));
  if(typeof entry.cardId!=='string')throw Error('ID de cartão inválido');
  if(['vincular_cartao','rejeitar_candidato'].includes(entry.action)){
    if(!CARD.test(entry.cardId))throw Error('Ação de vínculo exige CARD-xxxx válido');
  }else if(entry.cardId!=='')throw Error('Ação sem cartão não pode conter CARD');
  if(entry.action==='vincular_cartao'&&entry.evidence==='sem_correspondencia_confirmada')
    throw Error('Não é possível aprovar vínculo com evidência de ausência');
  if(entry.action==='manter_conteudo'&&entry.evidence!=='sem_correspondencia_confirmada'&&
    entry.evidence!=='outra_evidencia_descrita')
    throw Error('Evidência incompatível com manutenção como conteúdo');
  if(entry.action==='rejeitar_candidato'&&entry.evidence!=='sem_correspondencia_confirmada'&&
    entry.evidence!=='outra_evidencia_descrita')
    throw Error('Evidência incompatível com rejeição de candidato');
  return clone({
    seq:entry.seq,imageKey:entry.imageKey,driveId:entry.driveId,
    action:entry.action,cardId:entry.cardId,
    evidence:entry.evidence,reason:entry.reason.trim(),recordedAt:entry.recordedAt
  });
}
export function newReviewLedger(){return Object.freeze({schema:REVIEW_CHECKPOINT_SCHEMA,events:Object.freeze([])})}
export function appendReviewEvent(ledger,report,publicCards,{
  imageKey,action,cardId='',evidence,reason,confirmed=false
}={}){
  mustAudit(report);
  if(!confirmed)throw Error('Confirmação explícita obrigatória para registrar decisão');
  if(!ACTIONS.has(action))throw Error('Decisão desconhecida');
  if(!EVIDENCE.has(evidence))throw Error('Selecione a evidência examinada');
  if(!validNote(reason))throw Error('Justificativa deve ter 15 a 1.200 caracteres');
  if(!Array.isArray(publicCards)||!publicCards.length)throw Error('Base de cartões indisponível');
  const item=normalizeItem(report,imageKey);
  const validCards=new Set(publicCards.map(x=>typeof x==='string'?x:x?.id));
  if(action==='vincular_cartao'||action==='rejeitar_candidato'){
    if(!CARD.test(cardId)||!validCards.has(cardId))
      throw Error('ID informado não existe nos cartões públicos V194');
  }else if(cardId)throw Error('A decisão escolhida não admite número de cartão');
  if(action==='vincular_cartao'&&evidence==='sem_correspondencia_confirmada')
    throw Error('Aprovação incompatível com evidência negativa');
  if(action==='manter_conteudo'&&
    !['sem_correspondencia_confirmada','outra_evidencia_descrita'].includes(evidence))
    throw Error('Para manter como conteúdo, informe ausência verificada ou outra evidência');
  if(action==='rejeitar_candidato'&&
    !['sem_correspondencia_confirmada','outra_evidencia_descrita'].includes(evidence))
    throw Error('Para rejeitar candidato, informe ausência verificada ou outra evidência');
  if(action==='vincular_cartao'&&item.publicCardIds.includes(cardId))
    throw Error('Vínculo já existe no catálogo editorial; não criar duplicata');
  if(action==='rejeitar_candidato'&&item.publicCardIds.includes(cardId))
    throw Error('Não rejeitar associação editorial existente nesta fila de propostas');
  if(action==='manter_conteudo'&&item.publicCardIds.length)
    throw Error('O catálogo já possui vínculo de cartão; abra auditoria específica antes de alterar a classificação');
  if(ledger?.schema!==REVIEW_CHECKPOINT_SCHEMA||!Array.isArray(ledger.events))
    throw Error('Histórico de decisões inválido');
  if(ledger.events.length>=10000)throw Error('Limite de eventos do checkpoint atingido');
  const entry=validateEvent({
    seq:ledger.events.length+1,imageKey:item.key,driveId:expectedId(item),
    action,cardId:cardId||'',evidence,reason:reason.trim(),
    recordedAt:new Date().toISOString()
  },ledger.events.length);
  return Object.freeze({
    schema:REVIEW_CHECKPOINT_SCHEMA,
    events:Object.freeze([...ledger.events,entry])
  });
}
function canonical(ledger){
  if(ledger?.schema!==REVIEW_CHECKPOINT_SCHEMA||!Array.isArray(ledger.events)||
    ledger.events.length>10000)throw Error('Histórico de decisões não reconhecido');
  return {schema:REVIEW_CHECKPOINT_SCHEMA,versions:coreFields,
    events:ledger.events.map((e,i)=>validateEvent(e,i))};
}
async function hash(content){
  if(!globalThis.crypto?.subtle)throw Error('Web Crypto indisponível para proteger o checkpoint');
  const buffer=await globalThis.crypto.subtle.digest('SHA-256',new TextEncoder().encode(content));
  return [...new Uint8Array(buffer)].map(x=>x.toString(16).padStart(2,'0')).join('');
}
export async function sealReviewCheckpoint(ledger){
  const core=canonical(ledger);
  const signature=await hash(JSON.stringify(core));
  return Object.freeze({...core,integrity:Object.freeze({algorithm:'SHA-256',digest:signature})});
}
export async function openReviewCheckpoint(value){
  const data=typeof value==='string'?JSON.parse(value):value;
  if(!plain(data)||data.schema!==REVIEW_CHECKPOINT_SCHEMA||!plain(data.versions)||
    data.versions.cards!==coreFields.cards||data.versions.images!==coreFields.images||
    data.versions.storage!==coreFields.storage||
    !Array.isArray(data.events)||data.events.length>10000||
    data.integrity?.algorithm!=='SHA-256'||!/^[a-f0-9]{64}$/.test(String(data.integrity.digest||'')))
    throw Error('Checkpoint de vínculos ausente, incompatível ou inválido');
  const normalized={schema:REVIEW_CHECKPOINT_SCHEMA,versions:coreFields,
    events:data.events.map((x,i)=>validateEvent(x,i))};
  const verified=await hash(JSON.stringify(normalized));
  if(verified!==data.integrity.digest)throw Error('Checkpoint adulterado ou corrompido (SHA-256 divergente)');
  return Object.freeze({schema:REVIEW_CHECKPOINT_SCHEMA,
    events:Object.freeze(normalized.events)});
}
export function reconcileReviewLedger(ledger,report,publicCards){
  const core=canonical(ledger);
  mustAudit(report);
  const validCards=new Set((publicCards||[]).map(x=>typeof x==='string'?x:x?.id));
  const current=new Map(report.records.map(x=>[x.key,x]));
  const latest=new Map();
  for(const ev of core.events)latest.set(ev.imageKey,ev);
  const items=[...latest.values()].map(ev=>{
    const match=current.get(ev.imageKey);
    let status='aplicavel';
    if(!match)status='imagem_nao_observada';
    else if(expectedId(match)!==ev.driveId)status='arquivo_original_divergente';
    else if(ev.cardId&&!validCards.has(ev.cardId))status='cartao_nao_encontrado';
    else if(ev.cardId&&match.publicCardIds.includes(ev.cardId))status='ja_documentado';
    return Object.freeze({event:ev,status});
  });
  return Object.freeze({
    events:core.events.length,images:items.length,
    applicable:items.filter(x=>x.status==='aplicavel').length,
    unresolved:items.filter(x=>x.status!=='aplicavel').length,
    items:Object.freeze(items)
  });
}

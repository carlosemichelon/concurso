'use strict';
// Planejamento privado, somente em memória. Nenhum acesso remoto ou escrita.
// NUNCA fornecer o delta privado ao GitHub Actions ou gravá-lo no repositório.
const assert=require('node:assert/strict'),crypto=require('node:crypto');
const {publicPreflight}=require('./catalog_snapshot.cjs');
const hash=v=>crypto.createHash('sha256').update(JSON.stringify(v)).digest('hex');
const clone=v=>JSON.parse(JSON.stringify(v));
const sha=v=>typeof v==='string'&&/^[a-f0-9]{64}$/.test(v);
const nonempty=v=>typeof v==='string'&&v.trim().length>0;
const STAGES=['drive','github','pages','authenticated'];
function batchHash(delta){return hash({batch_id:delta.batch_id,content:delta.content,publication:delta.publication,requires_authenticated:delta.requires_authenticated===true})}
function verifyFrozen(delta){
 assert.ok(delta&&delta.format==='BancoMestrePrivateBatch1'&&delta.state==='FROZEN','Lote deve estar congelado');
 assert.ok(nonempty(delta.batch_id)&&sha(delta.content_sha256)&&delta.content!==undefined,'Identidade/hash privado obrigatório');
 assert.equal(delta.content_sha256,batchHash(delta),'Conteúdo congelado alterado');
}
// Somente a projeção explicitamente autorizada, nunca campos do lote privado.
function prepare(delta,snapshot,contract){
 verifyFrozen(delta);
 assert.ok(delta.publication&&delta.publication.approval==='APPROVED','Projeção sem autorização');
 const p=clone(delta.publication.packet);
 const proof=publicPreflight(p,snapshot,contract);
 assert.equal(delta.publication.approved_sha256,proof.packet_sha256,'Projeção mudou após aprovação');
 return {packet:p,preflight:proof,batch_id:delta.batch_id};
}
// Comprovantes precisam ser conferidos externamente. Esta função não confia no
// estado "salvo" escrito no documento, nem gera recibos de gravações inexistentes.
// Os callbacks de verificação devem apenas ler o destino e comparar a evidência.
// Ausência/erro é indeterminado, nunca autorização para repetir uma escrita.
async function resumePlan(delta,verify){
 verifyFrozen(delta);
 assert.ok(typeof verify==='function','Verificador externo obrigatório');
 const receipts=delta.receipts||{},states={},requireAuth=delta.requires_authenticated===true;
 let upstream=true;
 for(const stage of STAGES){
  if(stage==='authenticated'&&!requireAuth){states[stage]='NOT_APPLICABLE';continue}
  if(!upstream){states[stage]='WAITING_UPSTREAM';continue}
  const r=receipts[stage];
  // Mesmo sem recibo, consultar o destino pela chave estável antes de permitir tentativa.
  if(r&&(r.batch_id!==delta.batch_id||r.content_sha256!==delta.content_sha256||r.stage!==stage||!nonempty(r.reference))){
   states[stage]='CONFLICT';upstream=false;continue;
  }
  let answer;
  try{answer=await verify({stage,batch_id:delta.batch_id,content_sha256:delta.content_sha256,receipt:r?clone(r):null})}catch{answer='UNKNOWN'}
  if(answer==='MATCH'){states[stage]='VERIFIED';continue}
  if(answer==='ABSENT'&&!r){states[stage]='READY';upstream=false;continue}
  states[stage]=answer==='CONFLICT'||(answer==='ABSENT'&&r)?'CONFLICT':'UNKNOWN';
  upstream=false;
 }
 return {states,next:STAGES.find(k=>states[k]==='READY')||null,complete:STAGES.every(k=>['VERIFIED','NOT_APPLICABLE'].includes(states[k]))};
}
module.exports={prepare,resumePlan,hash,batchHash};

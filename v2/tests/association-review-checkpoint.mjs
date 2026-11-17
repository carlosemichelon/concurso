import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {buildImageAssociationAudit} from '../assets/image-associations.js';
import {newReviewLedger,appendReviewEvent,sealReviewCheckpoint,openReviewCheckpoint,
  reconcileReviewLedger,REVIEW_CHECKPOINT_SCHEMA} from '../assets/association-review-checkpoint.js';

const root=resolve(fileURLToPath(new URL('../../',import.meta.url)));
const load=path=>JSON.parse(readFileSync(resolve(root,path),'utf8'));
const editor=load('assets/v198_editorial_images_catalog.json').records;
const recoveredMap=new Map(load('assets/v180_native_image_additions.json').records.map(x=>[x.no,x]));
const cards=load('assets/meta_public_v194.json').card_files.flatMap(x=>load('assets/'+x));
const privateFile={
 id:'review_private_image_0001',name:'Enunciado CARD-1504.png',mimeType:'image/png',
 path:'Atlas oficial / Pasta de revisão',webUrl:'https://drive.google.com/file/d/review_private_image_0001/view'
};
const report=buildImageAssociationAudit(editor,recoveredMap,cards,[privateFile]);
const item=report.records.find(x=>x.driveId===privateFile.id);
assert.ok(item&&item.provisional);
assert.equal(item.association,'drive_pendente');
const base=newReviewLedger();
assert.equal(base.events.length,0);
assert.equal(base.schema,REVIEW_CHECKPOINT_SCHEMA);
const request={
 imageKey:item.key,action:'vincular_cartao',cardId:'CARD-1504',
 evidence:'enunciado_original_conferido',
 reason:'Imagem visualmente conferida: corresponde ao enunciado original da questão do cartão CARD-1504.',
 confirmed:true
};
assert.throws(()=>appendReviewEvent(base,report,cards,{...request,confirmed:false}),/Confirmação explícita/);
assert.throws(()=>appendReviewEvent(base,report,cards,{...request,cardId:'CARD-9999'}),/não existe/);
assert.throws(()=>appendReviewEvent(base,report,cards,{...request,reason:'curto'}),/15 a 1.200/);
assert.throws(()=>appendReviewEvent(base,report,cards,{...request,evidence:'sem_correspondencia_confirmada'}),/incompatível/);
assert.throws(()=>appendReviewEvent(base,report,cards,{...request,imageKey:'DRIVE-IMG-id_desconhecido_001'}),/não localizada/);
const first=appendReviewEvent(base,report,cards,request);
assert.equal(first.events.length,1);
assert.equal(first.events[0].seq,1);
assert.equal(first.events[0].imageKey,item.key);
assert.equal(first.events[0].driveId,privateFile.id);
assert.equal(first.events[0].cardId,'CARD-1504');
assert.equal(base.events.length,0,'registro append-only nunca altera o estado anterior');
const again=appendReviewEvent(first,report,cards,{
 imageKey:item.key,action:'adiar',evidence:'outra_evidencia_descrita',
 reason:'Ainda falta comparar o gabarito com a versão original antes da consolidação.',
 confirmed:true
});
assert.deepEqual(again.events.map(x=>x.seq),[1,2]);
const statuses=reconcileReviewLedger(again,report,cards);
assert.equal(statuses.events,2);
assert.equal(statuses.images,1);
assert.equal(statuses.applicable,1);
assert.equal(statuses.unresolved,0);
assert.equal(statuses.items[0].event.action,'adiar','último evento decide o estado sem apagar histórico');
const doc=report.records.find(x=>x.publicCardIds.length);
assert.ok(doc);
assert.throws(()=>appendReviewEvent(base,report,cards,{
 imageKey:doc.key,action:'vincular_cartao',cardId:doc.publicCardIds[0],
 evidence:'documento_origem_conferido',
 reason:'A referência original documentada já possui vínculo no banco vigente.',
 confirmed:true
}),/já existe/);
assert.throws(()=>appendReviewEvent(base,report,cards,{
 imageKey:doc.key,action:'manter_conteudo',cardId:'',
 evidence:'sem_correspondencia_confirmada',
 reason:'Não é possível apagar vínculo documental diretamente na fila.',
 confirmed:true
}),/já possui vínculo/);
const saved=await sealReviewCheckpoint(again);
assert.equal(saved.schema,REVIEW_CHECKPOINT_SCHEMA);
assert.equal(saved.integrity.algorithm,'SHA-256');
assert.match(saved.integrity.digest,/^[a-f0-9]{64}$/);
const json=JSON.stringify(saved);
assert.equal(json.includes('Bearer'),false);
assert.equal(json.includes('access_token'),false);
assert.equal(json.includes(privateFile.id),true,
  'checkpoint local deliberadamente inclui a identidade privada para conciliação');
const restored=await openReviewCheckpoint(json);
assert.deepEqual(restored.events,again.events);
assert.equal((await sealReviewCheckpoint(restored)).integrity.digest,saved.integrity.digest);
const tampered=JSON.parse(json);
tampered.events[0].reason='Alteração ilícita com justificativa sintaticamente válida.';
await assert.rejects(()=>openReviewCheckpoint(tampered),/SHA-256 divergente/);
const swapped=JSON.parse(json);
swapped.versions.cards='V195';
await assert.rejects(()=>openReviewCheckpoint(swapped),/incompatível ou inválido/);
const reordered=JSON.parse(json);
reordered.events.reverse();
await assert.rejects(()=>openReviewCheckpoint(reordered),/fora da sequência/);
const noDrive=buildImageAssociationAudit(editor,recoveredMap,cards);
const pending=reconcileReviewLedger(restored,noDrive,cards);
assert.equal(pending.unresolved,1);
assert.equal(pending.items[0].status,'imagem_nao_observada');
const changedId=buildImageAssociationAudit(editor,recoveredMap,cards,[{
 ...privateFile,id:'review_other_image_0002'
}]);
const pendingChanged=reconcileReviewLedger(restored,changedId,cards);
assert.equal(pendingChanged.items[0].status,'imagem_nao_observada');
const knownContent=report.records.find(x=>x.association==='conteudo');
assert.ok(knownContent);
const contentDecision=appendReviewEvent(base,report,cards,{
 imageKey:knownContent.key,action:'manter_conteudo',
 evidence:'sem_correspondencia_confirmada',
 reason:'Imagem de explicação genérica sem enunciado ou ligação documental específica.',
 confirmed:true
});
assert.equal(contentDecision.events[0].action,'manter_conteudo');
console.log('V2 association decision checkpoint OK:',{
 events:again.events.length,historyPreserved:true,
 sha256Verified:true,tamperRejected:true,
 importedWithoutDriveIsPending:true,cardIdsValidated:true,
 noAutomaticCatalogWrites:true
});

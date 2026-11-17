/* Banco Mestre V2 — auditoria CRUZADA, somente leitura.
 * Distingue evidência documental, aproximação didática, origem de questão e
 * arquivo novo. Só uma referência CARD-xxxx explícita e existente vira candidato
 * para REVISÃO; nunca é associada automaticamente.
 */
import {buildAtlasInventory} from './image-inventory.js';

const CARD=/^CARD-\d{4,}$/;
const FILE_CARD=/(?:^|[^A-Z0-9])CARD[-_ ]?(\d{4,})(?!\d)/gi;
const DOCUMENTAL=new Set(['associacao_documental_existente',
  'questao_documentada_conciliada_com_cartao']);
const DIDATIC='correspondencia_didatica_especifica';
export const ASSOCIATION_LABELS=Object.freeze({
  documental:'Vínculo documental registrado',
  didatica:'Correspondência didática',
  conteudo:'Imagem de conteúdo sem cartão associado',
  drive_pendente:'Imagem nova do Drive — conteúdo provisório',
  inconsistente:'Referência pública precisa de conferência'
});
function unique(list){return [...new Set((Array.isArray(list)?list:[]).map(String).filter(Boolean))]}
function fileMentions(filename){
  if(typeof filename!=='string')return [];
  const out=new Set();FILE_CARD.lastIndex=0;
  for(const match of filename.matchAll(FILE_CARD)){
    if(match[1].length<=12)out.add('CARD-'+match[1]);
  }
  return [...out];
}
export function buildImageAssociationAudit(editorialRecords,recoveredByImageId,publicCards,driveFiles=[]){
  if(!Array.isArray(publicCards)||publicCards.length<1)throw Error('Banco público de cartões ainda não carregado');
  const ids=new Set(publicCards.map(x=>typeof x==='string'?x:x?.id).filter(Boolean));
  if(ids.size!==publicCards.length)throw Error('IDs de cartões públicos ausentes ou repetidos');
  const inventory=buildAtlasInventory(editorialRecords,recoveredByImageId,driveFiles);
  const records=inventory.records.map(item=>{
    const recovered=recoveredByImageId.get(item.imageId);
    const cardRefs=unique(item.cardIds);
    const publicIds=cardRefs.filter(x=>ids.has(x));
    const externalHistoricalRefs=cardRefs.filter(x=>!CARD.test(x));
    const missingCardRefs=cardRefs.filter(x=>CARD.test(x)&&!ids.has(x));
    const questionRefs=unique(recovered?.questions);
    const mentionRefs=item.kind==='drive'?fileMentions(item.driveFile?.name):[];
    const candidateIds=mentionRefs.filter(x=>ids.has(x));
    const unmatchedMentions=mentionRefs.filter(x=>!ids.has(x));
    const inconsistent=missingCardRefs.length>0||(item.type==='cartao'&&!cardRefs.length);
    const association=item.kind==='drive'?'drive_pendente':
      inconsistent?'inconsistente':
      DOCUMENTAL.has(item.basis)?'documental':
      item.basis===DIDATIC?'didatica':'conteudo';
    // Ter enunciado original (ID da questão) NÃO demonstra que existe cartão na
    // base. Mantém o caso visível para revisão humana, sem promover o vínculo.
    const reviewNeeded=item.kind==='drive'||inconsistent||
      (questionRefs.length>0&&publicIds.length===0);
    return Object.freeze({
      key:item.key,imageId:item.imageId,driveId:item.driveId,
      title:item.title,kind:item.kind,type:item.type,
      association,provisional:item.provisional,
      cardIds:Object.freeze(cardRefs),publicCardIds:Object.freeze(publicIds),
      externalHistoricalRefs:Object.freeze(externalHistoricalRefs),
      missingCardRefs:Object.freeze(missingCardRefs),
      questionRefs:Object.freeze(questionRefs),
      candidateIds:Object.freeze(candidateIds),
      unmatchedMentions:Object.freeze(unmatchedMentions),
      reviewNeeded,basis:item.basis,
      sourceStatus:String(recovered?.status||''),
      // Caminhos e nomes privados ficam apenas na sessão do navegador.
      sourcePath:String(item.driveFile?.path||'')
    });
  });
  const count=type=>records.filter(x=>x.association===type).length;
  const stats=Object.freeze({
    editorial:inventory.editorialCount,driveNew:inventory.additionalCount,
    documental:count('documental'),didatica:count('didatica'),
    conteudo:count('conteudo'),drivePendente:count('drive_pendente'),
    inconsistente:count('inconsistente'),
    publicCardReferences:records.reduce((sum,x)=>sum+x.publicCardIds.length,0),
    externalHistoricalReferences:records.reduce((sum,x)=>sum+x.externalHistoricalRefs.length,0),
    missingPublicCardReferences:records.reduce((sum,x)=>sum+x.missingCardRefs.length,0),
    questionOriginsWithoutPublicCard:records.filter(x=>x.questionRefs.length&&!x.publicCardIds.length).length,
    proposedForReview:records.filter(x=>x.candidateIds.length>0).length,
    totalReviewNeeded:records.filter(x=>x.reviewNeeded).length
  });
  return Object.freeze({
    schema:'BancoMestreV2ImageAssociationAudit',
    checkedAt:new Date().toISOString(),
    publicCards:ids.size,
    stats,records:Object.freeze(records),
    disclaimer:'IDs de questões e candidatos em nomes NÃO estabelecem vínculo confirmado. Nenhuma associação, classificação ou SRS é modificada.'
  });
}
export function filterImageAssociationAudit(report,{status='review',query=''}={}){
  if(report?.schema!=='BancoMestreV2ImageAssociationAudit')throw Error('Relatório de vínculos inválido');
  if(!['review','all','documental','didatica','conteudo','drive_pendente','inconsistente','candidate'].includes(status))
    throw Error('Filtro de vínculos inválido');
  const q=String(query||'').trim().toLocaleLowerCase('pt-BR');
  return report.records.filter(x=>{
    if(status==='review'&&!x.reviewNeeded)return false;
    if(status==='candidate'&&!x.candidateIds.length)return false;
    if(!['review','all','candidate'].includes(status)&&x.association!==status)return false;
    return !q||[x.imageId,x.key,x.title,x.basis,x.sourceStatus,x.sourcePath,
      ...x.cardIds,...x.questionRefs,...x.candidateIds,...x.unmatchedMentions]
      .some(z=>String(z||'').toLocaleLowerCase('pt-BR').includes(q));
  });
}
/** Exportação: por padrão, somente estatísticas sem identificadores de arquivos privados. */
export function exportAssociationAudit(report,{includePrivate=false}={}){
  if(report?.schema!=='BancoMestreV2ImageAssociationAudit')throw Error('Relatório de vínculos inválido');
  const payload={schema:report.schema,checkedAt:report.checkedAt,
    publicCards:report.publicCards,stats:report.stats,
    containsPrivateIdentifiers:Boolean(includePrivate),
    disclaimer:report.disclaimer};
  if(includePrivate)payload.records=report.records.map(x=>({
    key:x.key,imageId:x.imageId,driveId:x.driveId,title:x.title,sourcePath:x.sourcePath,
    association:x.association,provisional:x.provisional,cardIds:x.cardIds,
    publicCardIds:x.publicCardIds,externalHistoricalRefs:x.externalHistoricalRefs,
    missingCardRefs:x.missingCardRefs,questionRefs:x.questionRefs,
    candidateIds:x.candidateIds,unmatchedMentions:x.unmatchedMentions,
    reviewNeeded:x.reviewNeeded
  }));
  return payload;
}

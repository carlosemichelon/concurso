import {
  newReviewLedger,appendReviewEvent,sealReviewCheckpoint,
  openReviewCheckpoint,reconcileReviewLedger
} from './association-review-checkpoint.js';

/* Revisão humana de associações: nenhuma alteração em catálogos, Drive ou SRS.
 * As decisões só sobrevivem entre sessões por checkpoint JSON exportado pelo titular.
 */
const el=(tag,cls='',label)=>{
 const x=document.createElement(tag);if(cls)x.className=cls;
 if(label!==undefined)x.textContent=String(label);
 return x;
};
const fmt=n=>Number(n||0).toLocaleString('pt-BR');
function field(label,element){
 const wrap=el('label','v2-review-field');
 wrap.append(el('span','',label),element);return wrap;
}
function downloadCheckpoint(value){
 const blob=new Blob([JSON.stringify(value,null,2)+'\n'],{type:'application/json'});
 const url=URL.createObjectURL(blob);
 try{
  const a=el('a');a.href=url;
  a.download='Banco_Mestre_V2_Checkpoint_Vinculos_'+new Date().toISOString().slice(0,10)+'.json';
  document.body.append(a);a.click();a.remove();
 }finally{setTimeout(()=>URL.revokeObjectURL(url),4000)}
}
const actionLabel={
 vincular_cartao:'Propor vínculo com cartão',
 manter_conteudo:'Aprovar como conteúdo',
 rejeitar_candidato:'Rejeitar vínculo candidato',
 adiar:'Manter pendente para revisão'
};
const evidenceLabel={
 enunciado_original_conferido:'Enunciado original conferido',
 imagem_explicativa_no_cartao:'Explicação incorporada ao cartão',
 documento_origem_conferido:'Documento ou checkpoint de origem conferido',
 sem_correspondencia_confirmada:'Ausência de correspondência confirmada',
 outra_evidencia_descrita:'Outra evidência descrita na justificativa'
};
export function mountReviewDecisionWorkbench(target,{getReport,getCards,service}={}){
 if(!target||typeof getReport!=='function'||typeof getCards!=='function')
  throw Error('Bancada de revisão exige auditoria e banco de cartões');
 let ledger=newReviewLedger(),savedCount=0,selected='',busy=false;
 const section=el('section','v2-review-workbench');
 section.id='v2ReviewWorkbench';
 const heading=el('h4','','Decisões de classificação e vínculo — checkpoint');
 const lead=el('p','helper',
  'Registre decisões fundamentadas sem modificar a biblioteca oficial. '+
  'Para preservar as decisões entre sessões, baixe o checkpoint e importe-o nesta página depois. '+
  'O site NÃO armazena essas decisões no Drive nem no navegador.');
 const banner=el('p','helper',
  'Nenhuma decisão registrada. O checkpoint será gerado somente quando solicitado.');
 banner.id='v2ReviewNotice';banner.setAttribute('role','status');
 const picker=el('select');picker.id='v2ReviewImage';picker.disabled=true;
 const action=el('select');action.id='v2ReviewAction';
 for(const [value,text] of Object.entries(actionLabel)){
  const option=el('option','',text);option.value=value;action.append(option);
 }
 const card=el('input');card.id='v2ReviewCard';card.type='text';
 card.placeholder='CARD-1504 (quando houver vínculo)';card.autocomplete='off';
 card.maxLength=32;
 const evidence=el('select');evidence.id='v2ReviewEvidence';
 const placeholder=el('option','','Escolha uma evidência verificada');
 placeholder.value='';evidence.append(placeholder);
 for(const [value,text] of Object.entries(evidenceLabel)){
  const option=el('option','',text);option.value=value;evidence.append(option);
 }
 const reason=el('textarea');reason.id='v2ReviewReason';
 reason.rows=3;reason.maxLength=1200;
 reason.placeholder='Descreva a evidência, a origem e por que a decisão é apropriada (mínimo de 15 caracteres)';
 const consent=el('input');consent.id='v2ReviewConfirm';consent.type='checkbox';
 const consentLabel=field('Confirmo que verifiquei a evidência e quero registrar esta proposta, sem alterar a base oficial',consent);
 const save=el('button','','Registrar decisão na sessão');
 save.id='v2ReviewRecord';save.type='button';save.disabled=true;
 const form=el('div','v2-review-form');
 form.append(field('Imagem em revisão',picker),field('Decisão',action),
  field('Cartão público (somente ações de vínculo)',card),
  field('Evidência',evidence),field('Justificativa',reason),consentLabel,save);
 const actions=el('div','audit-export');
 const exportButton=el('button','','Baixar checkpoint das decisões');
 exportButton.id='v2ReviewExport';exportButton.type='button';exportButton.disabled=true;
 const uploadLabel=el('label','v2-review-import-label','Restaurar checkpoint (.json)');
 const upload=el('input');upload.id='v2ReviewImport';upload.type='file';
 upload.accept='.json,application/json';uploadLabel.append(upload);
 const clear=el('button','','Descartar decisões desta sessão');
 clear.id='v2ReviewClear';clear.type='button';clear.disabled=true;
 actions.append(exportButton,uploadLabel,clear);
 const privacy=el('p','helper',
  'Atenção: o checkpoint contém IDs de imagens/arquivos privados, cartões, data e justificativas. '+
  'Guarde o arquivo em local privado. O SHA-256 detecta alteração acidental, não autentica quem assinou o arquivo. '+
  'Nenhum evento será incorporado automaticamente ao catálogo V198.');
 const counters=el('p','helper');counters.id='v2ReviewCounts';
 const history=el('div','item-list');history.id='v2ReviewHistory';
 section.append(heading,lead,banner,form,actions,privacy,counters,history);
 target.append(section);

 function fillPicker(){
  const report=getReport();
  const retain=picker.value||selected;
  picker.replaceChildren();
  if(!report){
   picker.append(el('option','','Execute a auditoria de vínculos primeiro'));
   picker.disabled=true;selected='';return;
  }
  const items=report.records.filter(x=>x.reviewNeeded||x.kind==='drive'||x.association==='conteudo');
  if(!items.length){
   picker.append(el('option','','Nenhuma imagem com revisão pendente'));
   picker.disabled=true;selected='';return;
  }
  for(const item of items){
   const option=el('option','',(item.imageId||item.key)+' — '+item.title.slice(0,70));
   option.value=item.key;picker.append(option);
  }
  const chosen=items.some(x=>x.key===retain)?retain:items[0].key;
  picker.value=chosen;picker.disabled=false;selected=chosen;
 }
 function paint(){
  const report=getReport(),cards=getCards();
  const ready=Boolean(report&&Array.isArray(cards)&&cards.length);
  const reconciliation=ready?reconcileReviewLedger(ledger,report,cards):null;
  const unsaved=Math.max(0,ledger.events.length-savedCount);
  counters.textContent=fmt(ledger.events.length)+' evento(s) registrados · '+
   fmt(unsaved)+' evento(s) sem checkpoint exportado'+
   (reconciliation?' · '+fmt(reconciliation.applicable)+' última(s) decisão(ões) conferíveis'+
    (reconciliation.unresolved?' · '+fmt(reconciliation.unresolved)+' pendente(s) por divergência/ausência':''):
    ' · executar auditoria para verificar as referências');
  save.disabled=!ready||picker.disabled||busy;
  exportButton.disabled=!ledger.events.length||busy;
  clear.disabled=!ledger.events.length||busy;
  upload.disabled=busy;
  const needsCard=['vincular_cartao','rejeitar_candidato'].includes(action.value);
  card.disabled=!needsCard;
  if(!needsCard)card.value='';
  history.replaceChildren();
  for(const event of ledger.events.slice(-8).reverse()){
   const row=el('div','v2-review-event');
   const last=reconciliation?.items.find(x=>x.event.imageKey===event.imageKey);
   row.append(
    el('strong','',fmt(event.seq)+'. '+event.imageKey+' — '+actionLabel[event.action]),
    el('p','muted',(event.cardId?event.cardId+' · ':'')+event.evidence.replaceAll('_',' ')+
      ' · '+event.recordedAt.slice(0,16).replace('T',' ')+' UTC'),
    el('p','helper',event.reason)
   );
   if(last?.event.seq===event.seq&&last.status!=='aplicavel')
    row.append(el('p','v2-review-flag','Pendente de reconciliação: '+last.status));
   history.append(row);
  }
  if(!ledger.events.length)history.append(el('p','helper','Nenhuma decisão nesta sessão.'));
 }
 function refresh(){
  fillPicker();paint();
 }
 function select(imageKey){
  const report=getReport();
  if(!report?.records.some(x=>x.key===imageKey))return;
  fillPicker();
  const option=[...picker.options].some(x=>x.value===imageKey);
  if(!option)return;
  picker.value=imageKey;selected=imageKey;paint();
  section.scrollIntoView({behavior:'smooth',block:'start'});
  picker.focus();
 }
 picker.addEventListener('change',()=>{selected=picker.value;paint()});
 action.addEventListener('change',paint);
 save.addEventListener('click',()=>{
  if(busy)return;
  try{
   ledger=appendReviewEvent(ledger,getReport(),getCards(),{
    imageKey:picker.value,action:action.value,cardId:card.value.trim(),
    evidence:evidence.value,reason:reason.value,
    confirmed:consent.checked
   });
   banner.textContent='Decisão registrada na sessão. Para preservá-la, clique em Baixar checkpoint.';
   reason.value='';consent.checked=false;evidence.value='';card.value='';
   paint();
  }catch(error){
   banner.textContent='Não registrado: '+String(error?.message||error).slice(0,260);
  }
 });
 exportButton.addEventListener('click',async()=>{
  if(!ledger.events.length||busy)return;
  busy=true;paint();
  try{
   const checkpoint=await sealReviewCheckpoint(ledger);
   downloadCheckpoint(checkpoint);
   savedCount=ledger.events.length;
   banner.textContent='Checkpoint SHA-256 gerado para download. Confira se o arquivo foi salvo antes de sair.';
  }catch(error){
   banner.textContent='Falha ao exportar: '+String(error?.message||error).slice(0,240);
  }finally{busy=false;paint()}
 });
 upload.addEventListener('change',async()=>{
  const file=upload.files?.[0];if(!file)return;
  if(file.size>2_000_000){
   banner.textContent='Arquivo acima do limite de 2 MB; importação recusada.';
   upload.value='';return;
  }
  if(ledger.events.length>savedCount&&
     !confirm('Existem decisões não exportadas. Substituir o histórico desta sessão pelo arquivo importado?')){
   upload.value='';return;
  }
  busy=true;paint();
  try{
   const imported=await openReviewCheckpoint(await file.text());
   ledger=imported;savedCount=imported.events.length;
   const report=getReport(),cards=getCards();
   const reconciliation=report&&cards?reconcileReviewLedger(imported,report,cards):null;
   banner.textContent='Checkpoint íntegro restaurado: '+fmt(imported.events.length)+
    ' evento(s). '+(reconciliation?
       fmt(reconciliation.unresolved)+' última(s) decisão(ões) requer(em) reconciliação.' :
       'Execute a auditoria para reconciliar as imagens e os cartões.');
  }catch(error){
   banner.textContent='Importação recusada, sem alterar decisões anteriores: '+
    String(error?.message||error).slice(0,250);
  }finally{busy=false;upload.value='';paint()}
 });
 clear.addEventListener('click',()=>{
  if(!ledger.events.length)return;
  if(!confirm('Descartar todas as decisões desta sessão? Faça backup antes, se necessário.'))return;
  ledger=newReviewLedger();savedCount=0;
  banner.textContent='Decisões desta sessão descartadas. Arquivos de checkpoint previamente baixados permanecem no dispositivo.';
  paint();
 });
 service?.onChange(event=>{
  if(['expired','disconnected','connected'].includes(event.type)){
   const had=ledger.events.length;
   ledger=newReviewLedger();savedCount=0;
   banner.textContent=had?
    'Sessão Google alterada: decisões privadas retiradas da memória. Restaure um checkpoint salvo para recuperá-las.':
    'Sessão Google alterada. Nenhuma decisão permanece em memória.';
   refresh();
  }
 });
 refresh();
 return Object.freeze({refresh,select,
  count:()=>ledger.events.length,
  hasUnsaved:()=>ledger.events.length>savedCount});
}

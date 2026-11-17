import {loadPublicCards} from './data.js';
import {mountReviewDecisionWorkbench} from './association-review-ui.js';
import {buildImageAssociationAudit,filterImageAssociationAudit,
  exportAssociationAudit,ASSOCIATION_LABELS} from './image-associations.js';

/* Painel privado e opcional: audita os IDs documentais contra os 1518 cartões.
 * O resultado não modifica o V198, o SRS, nem qualquer arquivo do Drive.
 */
const el=(tag,cls='',value)=>{
  const n=document.createElement(tag);if(cls)n.className=cls;
  if(value!==undefined)n.textContent=String(value);return n;
};
const fmt=n=>Number(n||0).toLocaleString('pt-BR');
function save(payload,suffix){
  const content=JSON.stringify(payload,null,2)+'\n';
  const url=URL.createObjectURL(new Blob([content],{type:'application/json'}));
  try{
    const a=el('a');a.href=url;
    a.download='Banco_Mestre_V2_Auditoria_Imagens_'+suffix+'_'+new Date().toISOString().slice(0,10)+'.json';
    document.body.append(a);a.click();a.remove();
  }finally{setTimeout(()=>URL.revokeObjectURL(url),2000)}
}
export function mountImageAssociationAudit(snapshot,service,target){
  if(!target||!snapshot?.editorial?.records||!snapshot?.recoveredByImageId)
    throw Error('Fontes do Atlas indisponíveis para auditoria');
  let report=null,busy=false,limit=30,generation=0,cachedCards=null;
  const section=el('section','panel image-association-audit');
  section.id='v2ImageAssociationAudit';
  const title=el('h3','','Auditoria de vínculos — imagens × cartões');
  const description=el('p','helper',
    'Compara as 179 imagens editoriais, os 93 originais recuperados e as imagens adicionais da sessão com os 1.518 cartões públicos. '+
    'Diferencia vínculo documental, correspondência didática e referências históricas. Não associa imagens automaticamente.');
  const controls=el('div','audit-export');
  const auditButton=el('button','','Conferir vínculos com os 1.518 cartões');
  auditButton.id='v2ImageAuditStart';auditButton.type='button';
  const summaryButton=el('button','','Baixar resumo sem IDs');
  summaryButton.id='v2ImageAuditSummary';summaryButton.type='button';summaryButton.disabled=true;
  const detailButton=el('button','','Baixar inventário com IDs (privado)');
  detailButton.id='v2ImageAuditDetails';detailButton.type='button';detailButton.disabled=true;
  controls.append(auditButton,summaryButton,detailButton);
  const notice=el('p','helper',
    'A verificação trabalha apenas com dados da sessão; nenhum vínculo novo é gravado. '+
    'O inventário detalhado pode conter nomes e IDs privados do Drive e exige confirmação.');
  const status=el('p','helper','Auditoria ainda não executada.');
  status.id='v2ImageAuditStatus';status.setAttribute('role','status');
  status.setAttribute('aria-live','polite');
  const stats=el('div','audit-stats');stats.id='v2ImageAuditStats';
  const filters=el('div','audit-filters');
  const filterLabel=el('label','','Mostrar');filterLabel.htmlFor='v2ImageAuditFilter';
  const filter=el('select');filter.id='v2ImageAuditFilter';
  for(const [key,label] of [
    ['review','Para revisão'],
    ['candidate','Candidatos pelo ID explícito (não vinculados)'],
    ['documental','Vínculo documental registrado'],
    ['didatica','Correspondência didática'],
    ['conteudo','Conteúdo sem cartão'],
    ['drive_pendente','Arquivos adicionais do Drive'],
    ['inconsistente','Referências que precisam conferência'],
    ['all','Todas as imagens']
  ]){
    const opt=el('option','',label);opt.value=key;filter.append(opt);
  }
  const searchLabel=el('label','','Buscar imagem, cartão ou questão');searchLabel.htmlFor='v2ImageAuditQuery';
  const search=el('input');search.id='v2ImageAuditQuery';search.type='search';
  search.placeholder='IMG-C12, CARD-1504 ou PETRO12-Q007';
  filters.append(filterLabel,filter,searchLabel,search);
  const count=el('p','muted','');
  const rows=el('div','item-list');rows.id='v2ImageAuditRows';
  const more=el('button','drive-more','Mostrar mais');
  more.type='button';more.hidden=true;
  section.append(title,description,controls,notice,status,stats,filters,count,rows,more);
  target.append(section);
  const review=mountReviewDecisionWorkbench(section,{
    getReport:()=>report,getCards:()=>cachedCards,service
  });

  function entries(){
    if(!report)return [];
    return filterImageAssociationAudit(report,{status:filter.value,query:search.value});
  }
  function openAtlas(item){
    const q=item.imageId||item.driveId;
    if(!q)return;
    const input=document.getElementById('imageQuery'),type=document.getElementById('imageType');
    if(!input||!type)return;
    input.value=q;type.value='all';
    document.querySelector('[data-view="images"]')?.click();
    // A visualização Atlas filtra pelo ID literal sem importar o tipo editorial.
    input.dispatchEvent(new Event('input',{bubbles:true}));
    input.focus();
  }
  function renderRows(){
    const matches=entries();
    rows.replaceChildren();
    count.textContent=report?
      fmt(matches.length)+' imagem(ns) neste filtro · '+fmt(report.records.length)+' no inventário':
      'Clique em Conferir vínculos para iniciar';
    if(!matches.length)rows.append(el('p','helper',report?
      'Nenhuma imagem corresponde ao filtro.':'O banco ainda não foi analisado nesta sessão.'));
    for(const item of matches.slice(0,limit)){
      const article=el('article','item audit-record image-audit-record');
      const header=el('div','item-header');
      header.append(el('strong','meta',item.imageId||item.key),
        el('span','tag',ASSOCIATION_LABELS[item.association]));
      article.append(header,el('div','item-title',item.title));
      if(item.publicCardIds.length)
        article.append(el('p','muted','Cartões da base pública: '+item.publicCardIds.join(', ')));
      if(item.externalHistoricalRefs.length)
        article.append(el('p','helper',
          'Referência histórica fora da numeração pública: '+item.externalHistoricalRefs.join(', ')+
          ' — preservar a origem, sem criar novo CARD.'));
      if(item.missingCardRefs.length)
        article.append(el('p','helper','IDs de cartões não encontrados no banco: '+item.missingCardRefs.join(', ')));
      if(item.questionRefs.length)
        article.append(el('p','muted','Questão(ões) de origem: '+item.questionRefs.join(', ')+
          ' (origem não comprova cartão correspondente)'));
      if(item.candidateIds.length)
        article.append(el('p','helper','Candidato para revisão humana por ID no nome: '+
          item.candidateIds.join(', ')+'. Associação NÃO aprovada.'));
      if(item.unmatchedMentions.length)
        article.append(el('p','helper','ID mencionado no nome sem cartão público: '+
          item.unmatchedMentions.join(', ')));
      if(item.provisional)
        article.append(el('p','muted','Arquivo de conteúdo provisório; não foi criada associação.'));
      const actions=el('div','item-actions');
      const open=el('button','','Localizar no Atlas');open.type='button';
      open.addEventListener('click',()=>openAtlas(item));
      actions.append(open);
      if(item.reviewNeeded||item.kind==='drive'||item.association==='conteudo'){
        const decide=el('button','','Revisar associação');decide.type='button';
        decide.addEventListener('click',()=>review.select(item.key));
        actions.append(decide);
      }
      article.append(actions);rows.append(article);
    }
    more.hidden=matches.length<=limit;
    if(!more.hidden)more.textContent='Mostrar mais ('+fmt(matches.length-limit)+' restantes)';
  }
  function makeStat(title,value,note){
    const e=el('div','audit-stat');
    e.append(el('strong','',fmt(value)),el('span','',title),el('small','',note));
    return e;
  }
  function render(){
    auditButton.disabled=busy;
    summaryButton.disabled=busy||!report;
    detailButton.disabled=busy||!report||!service?.connected;
    stats.replaceChildren();
    if(report){
      const s=report.stats;
      stats.append(
        makeStat('Vínculos documentais',s.documental,'Evidência registrada, não inferência'),
        makeStat('Correspondências didáticas',s.didatica,'Associação editorial, não vínculo original'),
        makeStat('Imagens de conteúdo',s.conteudo,'Sem cartão associado'),
        makeStat('Drive provisório',s.drivePendente,'Não publicado; somente sessão'),
        makeStat('Referências a CARD válidos',s.publicCardReferences,'Total de referências, não cartões únicos'),
        makeStat('Referências históricas externas',s.externalHistoricalReferences,'Não criar CARD automaticamente'),
        makeStat('Para revisão',s.totalReviewNeeded,'Questões de origem, arquivos novos ou inconsistências')
      );
    }
    renderRows();
  }
  function invalidate(reason){
    ++generation;report=null;busy=false;limit=30;
    status.textContent=reason||'Relatório invalidado após mudança da sessão. Execute a auditoria novamente.';
    review.refresh();render();
  }
  auditButton.addEventListener('click',async()=>{
    if(busy)return;
    const serial=++generation;
    busy=true;report=null;status.textContent='Lendo os sete lotes públicos e comparando as referências...';
    render();
    try{
      const cards=await loadPublicCards(snapshot.meta);
      if(serial!==generation)return;
      cachedCards=cards;
      const driveFiles=service?.connected?service.lastImages?.files||[]:[];
      report=buildImageAssociationAudit(snapshot.editorial.records,
        snapshot.recoveredByImageId,cards,driveFiles);
      review.refresh();
      status.textContent='Auditoria concluída: '+fmt(report.records.length)+
        ' imagens, '+fmt(report.publicCards)+' cartões consultados. '+
        'Nenhuma classificação ou associação foi gravada.';
    }catch(error){
      if(serial!==generation)return;
      report=null;
      status.textContent='Falha na auditoria: '+String(error?.message||error).slice(0,250);
    }finally{
      if(serial===generation){busy=false;render()}
    }
  });
  summaryButton.addEventListener('click',()=>{
    if(report&&!busy)save(exportAssociationAudit(report),'Resumo');
  });
  detailButton.addEventListener('click',()=>{
    if(!report||busy||!service?.connected)return;
    if(!confirm('O arquivo detalhado pode incluir IDs e nomes privados de imagens do Drive. Baixar somente neste dispositivo?'))return;
    save(exportAssociationAudit(report,{includePrivate:true}),'Inventario_Privado');
  });
  filter.addEventListener('change',()=>{limit=30;renderRows()});
  search.addEventListener('input',()=>{limit=30;renderRows()});
  more.addEventListener('click',()=>{limit+=30;renderRows()});
  service?.onChange(event=>{
    if(['disconnected','expired','connected'].includes(event.type))
      invalidate('Sessão Drive alterada; relatório antigo descartado.');
    else if(event.type==='scan-done'&&event.kind==='image')
      invalidate('Novas imagens detectadas no Drive; execute a auditoria para atualizar os vínculos.');
  });
  render();
  return Object.freeze({refresh:render,invalidate,
    hasPendingReview:()=>review.hasUnsaved()});
}

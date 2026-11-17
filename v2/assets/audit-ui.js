import {reconcile,exportPayload} from './audit.js';

/* Painel de auditoria privado: nenhum dado sai da sessão, exceto download
 * disparado pelo titular; exportação de IDs exige confirmação explícita.
 */
const $=id=>document.getElementById(id);
const element=(name,cls='',text='')=>{
  const e=document.createElement(name);if(cls)e.className=cls;e.textContent=text;return e;
};
const fmt=value=>value===null||value===undefined?'Não conferido':Number(value).toLocaleString('pt-BR');
const STATUS={
  listed_and_referenced:'No Drive e referenciado no catálogo',
  new_in_drive:'Localizado no Drive, fora do catálogo',
  not_observed_in_monitored_roots:'Não observado nas pastas monitoradas'
};
function textDate(value){
  if(!value)return 'Pendente';
  const date=new Date(value);
  return Number.isNaN(date.getTime())?'Data indisponível':date.toLocaleString('pt-BR');
}
function stat(label,note,value){
  const e=element('div','audit-stat');
  e.append(element('strong','',fmt(value)),element('span','',label),element('small','',note));
  return e;
}
function download(payload,suffix){
  const stamp=new Date().toISOString().slice(0,19).replaceAll(':','-');
  const json=JSON.stringify(payload,null,2)+'\n';
  const blob=new Blob([json],{type:'application/json'});
  const url=URL.createObjectURL(blob);
  try{
    const a=document.createElement('a');
    a.href=url;a.download='Banco_Mestre_V2_Auditoria_'+suffix+'_'+stamp+'.json';
    document.body.append(a);
    a.click();a.remove();
  }finally{
    // O navegador consome o blob de forma assíncrona após o clique.
    setTimeout(()=>URL.revokeObjectURL(url),2000);
  }
}
export function mountReconciliation(snapshot,service,target){
  if(!target||!service)return null;
  let viewed=new Set();
  let audit=null,limit=30;
  const section=element('section','panel reconciliation-panel');
  section.id='v2AuditPanel';
  section.setAttribute('aria-labelledby','v2AuditTitle');
  const title=element('h3','','Conciliação Drive × catálogos');
  title.id='v2AuditTitle';
  const desc=element('p','helper',
    'Compara IDs públicos dos 93 originais recuperados e dos 78 PDFs com arquivos vistos nesta sessão. Não verifica alterações de conteúdo, não faz upload e não identifica automaticamente o que foi excluído.');
  const stats=element('div','audit-stats');stats.id='v2AuditStats';
  const filters=element('div','audit-filters');
  const label=element('label','','Mostrar');
  label.htmlFor='v2AuditFilter';
  const select=element('select');select.id='v2AuditFilter';
  for(const [key,value] of [
    ['new_in_drive','Fora do catálogo público'],
    ['not_observed_in_monitored_roots','Não observados nas pastas'],
    ['listed_and_referenced','Referenciados e localizados'],
    ['all','Todos os resultados']
  ]){
    const option=document.createElement('option');
    option.value=key;option.textContent=value;select.append(option);
  }
  const searchLabel=element('label','','Buscar por ID ou título');
  searchLabel.htmlFor='v2AuditSearch';
  const search=document.createElement('input');search.type='search';search.id='v2AuditSearch';
  search.placeholder='IMG, PDF, ID ou tema';
  filters.append(label,select,searchLabel,search);
  const results=element('div','audit-results');
  const resultCount=element('span','muted','');
  const records=element('div','item-list');
  const more=element('button','drive-more','Mostrar mais');more.type='button';more.hidden=true;
  more.addEventListener('click',()=>{limit+=30;renderRecords()});
  results.append(resultCount,records,more);
  const tools=element('div','audit-export');
  const exportSummary=element('button','','Exportar resumo sem IDs');
  exportSummary.type='button';exportSummary.disabled=true;
  const exportDetails=element('button','','Exportar inventário com IDs');
  exportDetails.type='button';exportDetails.disabled=true;
  const note=element('p','helper','Relatórios são gerados neste dispositivo. O arquivo com IDs e nomes do Drive pode conter informações privadas; não é enviado ao site.');
  const foot=element('div','audit-footnote','Apenas catálogos de referência; ausência na consulta não comprova remoção.');
  tools.append(exportSummary,exportDetails);
  section.append(title,desc,stats,filters,results,tools,note,foot);
  target.append(section);
  function report(){
    return reconcile(snapshot,{
      images:service.connected?service.lastImages:null,
      pdfs:service.connected?service.lastPdfs:null,
      previewedIds:service.connected?[...viewed]:[]
    });
  }
  function selectedRows(){
    if(!audit)return [];
    const all=[...audit.images.records,...audit.pdfs.records];
    const wanted=select.value;
    const query=search.value.trim().toLocaleLowerCase('pt-BR');
    return all.filter(x=>{
      if(wanted!=='all'&&x.status!==wanted)return false;
      if(!query)return true;
      return [x.driveId,x.catalogId,x.title,x.driveName,x.sourcePath,x.mimeType]
        .some(t=>String(t||'').toLocaleLowerCase('pt-BR').includes(query));
    });
  }
  function renderRecords(){
    const matched=selectedRows();
    records.replaceChildren();
    resultCount.textContent=fmt(matched.length)+' registro(s) neste filtro';
    if(!matched.length){
      records.append(element('p','helper',
        audit&&(audit.images.scanned||audit.pdfs.scanned)?
          'Nenhum registro encontrado com estes filtros.':'Aguarde a consulta autenticada para comparar arquivos.'));
    }
    for(const item of matched.slice(0,limit)){
      const e=element('article','item audit-record');
      const header=element('div','item-header');
      header.append(element('strong','meta',item.catalogId||item.driveId),
        element('span','tag '+(item.status==='new_in_drive'?'card':''),STATUS[item.status]||item.status));
      e.append(header,element('div','item-title',item.title));
      const detail=element('p','muted',
        (item.type==='image'?'Imagem':'PDF')+' · '+(item.driveName||'Somente no catálogo de referência')+
        (item.mimeType?' · '+item.mimeType:''));
      e.append(detail);
      if(item.sourcePath)e.append(element('p','muted','Pasta monitorada: '+item.sourcePath));
      if(item.previewed)e.append(element('p','muted','Prévia exibida nesta sessão.'));
      if(item.status==='not_observed_in_monitored_roots')
        e.append(element('p','helper','Não comprova arquivo excluído: pode estar fora das pastas, sem permissão ou não ter sido listado.'));
      records.append(e);
    }
    more.hidden=matched.length<=limit;
    if(!more.hidden)more.textContent='Mostrar mais ('+fmt(matched.length-limit)+' restantes)';
  }
  function render(){
    audit=report();
    const i=audit.images,p=audit.pdfs;
    stats.replaceChildren(
      stat('Imagens fora do catálogo','Listadas no Drive sem referência entre os 93 IDs',i.newInDrive),
      stat('Imagens não observadas','Não significa exclusão',i.notObserved),
      stat('PDFs fora do catálogo','Listados no Drive sem referência entre os 78 IDs',p.newInDrive),
      stat('PDFs não observados','Não significa exclusão',p.notObserved),
      stat('Imagens visualizadas','Prévia carregada nesta sessão',i.previewed)
    );
    exportSummary.disabled=!(i.scanned||p.scanned);
    exportDetails.disabled=exportSummary.disabled;
    const incomplete=!i.scanned||!p.scanned;
    foot.textContent=(incomplete?'Auditoria parcial: ainda falta pelo menos uma varredura. ':'Duas categorias consultadas. ')+
      'Itens referenciados não observados não são declarados removidos. Nenhuma sincronização GitHub foi realizada. Última consulta — imagens: '+
      textDate(i.checkedAt)+'; PDFs: '+textDate(p.checkedAt)+'.';
    renderRecords();
  }
  exportSummary.addEventListener('click',()=>{
    if(!service.connected||!audit||exportSummary.disabled)return;
    download(exportPayload(audit),'Resumo');
  });
  exportDetails.addEventListener('click',()=>{
    if(!service.connected||!audit||exportDetails.disabled)return;
    if(!confirm('O inventário contém IDs, nomes e caminhos de arquivos privados do Drive. Deseja baixar este JSON somente no seu dispositivo?'))return;
    download(exportPayload(audit,{includeIdentifiers:true}),'Inventario_IDs_Privados');
  });
  select.addEventListener('change',()=>{limit=30;renderRecords()});
  search.addEventListener('input',()=>{limit=30;renderRecords()});
  render();
  return Object.freeze({
    refresh:render,
    markPreviewed(id){
      if(!service.connected)return;
      viewed.add(id);render();
    },
    clear(){
      viewed.clear();audit=null;render();
    }
  });
}

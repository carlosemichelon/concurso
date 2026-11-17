import {probePdfReferences,PROBE_STATUSES,publicPdfProbeSummary} from './catalog-probe.js';

/* Painel de homologação manual da biblioteca pública V149.
 * Metadados em memória somente durante login. Sem gravação, sem sincronização.
 */
const el=(tag,cls='',content)=>{
  const e=document.createElement(tag);
  if(cls)e.className=cls;
  if(content!==undefined)e.textContent=String(content);
  return e;
};
const fmt=n=>Number(n||0).toLocaleString('pt-BR');
const statusLabel=code=>PROBE_STATUSES[code]||'Situação não reconhecida';
function downloadSummary(report){
  const payload=publicPdfProbeSummary(report);
  const blob=new Blob([JSON.stringify(payload,null,2)+'\n'],{type:'application/json'});
  const url=URL.createObjectURL(blob);
  const a=el('a');a.href=url;
  a.download='Banco_Mestre_V2_PDFs_Conferencia_IDs_Resumo_'+new Date().toISOString().slice(0,10)+'.json';
  document.body.append(a);a.click();a.remove();
  setTimeout(()=>URL.revokeObjectURL(url),2000);
}
export function mountPdfIdProbe(snapshot,service,target){
  if(!target||!service||!snapshot?.pdf?.documents)return null;
  let report=null,busy=false,limit=30;
  const section=el('section','panel v2-pdf-id-probe');
  section.id='v2PdfIdProbe';
  const title=el('h3','','Conferência direta dos 78 PDFs por ID');
  const desc=el('p','helper',
    'Ao clicar, consulta os metadados de cada ID V149 no Drive autorizado. '+
    'Diferencia documentos acessíveis, formato divergente e acesso não confirmado. '+
    'Não lê o conteúdo dos PDFs nem altera arquivos. A varredura por pastas é uma verificação separada.');
  const controls=el('div','v2-pdf-probe-controls');
  const button=el('button','','Conferir 78 IDs no Drive');
  button.id='v2PdfIdProbeStart';button.type='button';button.disabled=true;
  const summary=el('button','','Baixar resumo sem identificadores');
  summary.id='v2PdfIdProbeExport';summary.type='button';summary.disabled=true;
  const status=el('p','helper','Conecte o Google Drive para habilitar esta verificação manual.');
  status.id='v2PdfIdProbeStatus';status.setAttribute('role','status');status.setAttribute('aria-live','polite');
  controls.append(button,summary);
  const stats=el('div','audit-stats');stats.id='v2PdfIdProbeStats';
  const filters=el('div','audit-filters');
  const filterLabel=el('label','','Mostrar');filterLabel.htmlFor='v2PdfIdProbeFilter';
  const filter=el('select');filter.id='v2PdfIdProbeFilter';
  for(const [code,title] of [
    ['problems','Somente pendências'],
    ['all','Todos os 78 PDFs'],
    ['verified','Confirmados no Drive'],
    ['inaccessible','Não confirmados (403/404)'],
    ['incompatible','Formato/identidade divergente'],
    ['temporary_error','Falha temporária']
  ]){const opt=el('option','',title);opt.value=code;filter.append(opt)}
  const queryLabel=el('label','','Buscar no relatório');queryLabel.htmlFor='v2PdfIdProbeSearch';
  const search=el('input');search.type='search';search.id='v2PdfIdProbeSearch';
  search.placeholder='ID, título ou nome';
  filters.append(filterLabel,filter,queryLabel,search);
  const count=el('p','muted','Nenhuma conferência por ID realizada nesta sessão');
  const records=el('div','item-list');records.id='v2PdfIdProbeRecords';
  const more=el('button','drive-more','Mostrar mais');
  more.type='button';more.hidden=true;
  section.append(title,desc,controls,status,stats,filters,count,records,more);
  target.append(section);
  function currentRows(){
    if(!report)return [];
    const wanted=filter.value,needle=search.value.trim().toLocaleLowerCase('pt-BR');
    return report.records.filter(row=>{
      if(wanted==='problems'&&row.status==='verified')return false;
      if(!['problems','all'].includes(wanted)&&row.status!==wanted)return false;
      return !needle||[row.catalogId,row.title,row.driveId,row.driveName,row.mimeType,row.reason]
        .some(value=>String(value||'').toLocaleLowerCase('pt-BR').includes(needle));
    });
  }
  function render(){
    button.disabled=busy||!service.connected;
    summary.disabled=busy||!service.connected||!report?.complete;
    const values=report?.counts;
    stats.replaceChildren();
    for(const [name,label] of [
      ['verified','PDFs confirmados pelo ID'],
      ['inaccessible','Sem acesso confirmado (403/404)'],
      ['incompatible','Formatos/identidades divergentes'],
      ['temporary_error','Falhas de consulta']
    ]){
      const item=el('div','audit-stat');
      item.append(el('strong','',report?fmt(values[name]):'—'),
        el('span','',label));
      stats.append(item);
    }
    const rows=currentRows();
    count.textContent=report?fmt(rows.length)+' registro(s) neste filtro · '+report.completed+
      '/'+report.expected+' consultados':'Nenhum documento auditado por ID';
    records.replaceChildren();
    if(!report)records.append(el('p','helper',
      'Esta verificação só será executada após o clique e autorização Google.'));
    else if(!rows.length)records.append(el('p','helper','Nenhum resultado para os filtros atuais.'));
    for(const row of rows.slice(0,limit)){
      const card=el('article','item audit-record');
      const header=el('div','item-header');
      header.append(el('strong','meta',row.catalogId),el('span','tag',statusLabel(row.status)));
      card.append(header,el('div','item-title',row.title));
      const detail=el('p','muted',
        (row.driveName||'Metadados não obtidos')+
        (row.mimeType?' · '+row.mimeType:'')+
        (row.size!==null?' · '+fmt(row.size)+' bytes':''));
      card.append(detail);
      if(row.reason)card.append(el('p','helper',row.reason));
      records.append(card);
    }
    more.hidden=rows.length<=limit;
    if(!more.hidden)more.textContent='Mostrar mais ('+fmt(rows.length-limit)+' restantes)';
  }
  function clear(reason='disconnected'){
    report=null;busy=false;limit=30;
    status.textContent=reason==='connected'?
      'Drive conectado. Clique em “Conferir 78 IDs no Drive” para verificar os documentos desta conta.':
      'Autorização encerrada. Relatório privado descartado; conecte para repetir.';
    render();
  }
  button.addEventListener('click',async()=>{
    if(busy||!service.connected)return;
    busy=true;report=null;limit=30;render();
    status.textContent='Conferindo 0 de 78 PDFs diretamente pelos IDs, com acesso somente leitura...';
    try{
      const result=await probePdfReferences(service,snapshot.pdf.documents,{
        concurrency:3,
        onProgress:p=>{if(service.connected)
          status.textContent='Conferindo '+p.completed+' de '+p.expected+' PDFs por ID. Nenhum PDF baixado.'}
      });
      if(!service.connected)return;
      report=result;
      status.textContent='Conferência por IDs concluída: '+fmt(result.counts.verified)+' confirmados; '+
        fmt(result.counts.inaccessible)+' sem acesso confirmado; '+
        fmt(result.counts.incompatible)+' divergentes; '+
        fmt(result.counts.temporary_error)+' falhas temporárias. '+
        'HTTP 403/404 não comprova exclusão. Nenhum arquivo enviado ao GitHub.';
    }catch(error){
      report=null;
      status.textContent='Conferência não concluída: '+String(error.message||error).slice(0,220)+
        '. Resultados parciais descartados.';
    }finally{busy=false;render()}
  });
  summary.addEventListener('click',()=>{
    if(service.connected&&report?.complete&&!busy)downloadSummary(report);
  });
  more.addEventListener('click',()=>{limit+=30;render()});
  filter.addEventListener('change',()=>{limit=30;render()});
  search.addEventListener('input',()=>{limit=30;render()});
  service.onChange(event=>{
    if(['disconnected','expired','connected'].includes(event.type))clear(event.type);
  });
  render();
  return Object.freeze({refresh:render,clear});
}

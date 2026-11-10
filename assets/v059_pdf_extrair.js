/* Banco Mestre V059 — extrair e consultar o texto sob grifos do leitor PDF.
   Não altera PDF, SRS, flashcards, conteúdo original ou anotações armazenadas. */
(function(){
 'use strict';
 const $=id=>document.getElementById(id);
 const dialog=$('pdfDialog'),toolbar=dialog?.querySelector(':scope > .dbody > .toolbar');
 if(!dialog||!toolbar||$('bmV059ExtractPanel'))return;
 const pdfApi=()=>window.BancoMestrePDFV042;
 const b=(label,id)=>{
  const e=document.createElement('button');e.type='button';e.id=id;e.textContent=label;return e;
 };
 const option=b('▤ Extrair textos grifados','bmV059ExtractMenu');
 option.title='Extrair as palavras presentes nas posições dos grifos do PDF digital';
 toolbar.append(option);
 const panel=document.createElement('section');
 panel.id='bmV059ExtractPanel';panel.hidden=true;
 panel.setAttribute('role','dialog');panel.setAttribute('aria-modal','false');
 panel.setAttribute('aria-labelledby','bmV059ExtractTitle');
 const head=document.createElement('div');head.className='bm-v059-panel-head';
 const title=document.createElement('strong');title.id='bmV059ExtractTitle';
 title.textContent='Extrair textos grifados';
 const close=b('×','bmV059Close');close.setAttribute('aria-label','Fechar painel de extração');
 head.append(title,close);
 const description=document.createElement('p');
 description.className='bm-v059-description';
 description.textContent='Reconhece trechos da camada digital de texto nas posições dos grifos. A seleção de caracteres é aproximada: confira o resultado antes de estudar ou criar flashcards.';
 const controls=document.createElement('div');controls.className='bm-v059-controls';
 const scopeLabel=document.createElement('label');
 scopeLabel.htmlFor='bmV059Scope';scopeLabel.textContent='Extrair de';
 const scope=document.createElement('select');scope.id='bmV059Scope';
 scope.add(new Option('Todas as páginas grifadas','all'));
 scope.add(new Option('Somente página atual','current'));
 const extract=b('Extrair agora','bmV059Run');extract.className='primary';
 controls.append(scopeLabel,scope,extract);
 const status=document.createElement('p');status.id='bmV059Status';
 status.setAttribute('aria-live','polite');status.className='bm-v059-status';
 const summary=document.createElement('div');summary.id='bmV059Summary';
 summary.className='bm-v059-summary';
 const preview=document.createElement('div');preview.id='bmV059Results';
 preview.className='bm-v059-results';
 const exportRow=document.createElement('div');exportRow.className='bm-v059-export';
 const copy=b('Copiar texto','bmV059Copy');
 const saveTxt=b('Baixar TXT','bmV059TXT');
 const saveJson=b('Baixar JSON','bmV059JSON');
 for(const el of [copy,saveTxt,saveJson])el.disabled=true;
 exportRow.append(copy,saveTxt,saveJson);
 const help=document.createElement('p');help.className='bm-v059-note';
 help.textContent='A extração não modifica o Banco Mestre nem cria flashcards. PDFs escaneados sem texto digital precisam de OCR, que não está incluído nesta função.';
 panel.append(head,description,controls,status,summary,preview,exportRow,help);
 dialog.append(panel);
 let result=null,working=false,generation=0;
 const text=(tag,value,cls)=>{
  const el=document.createElement(tag);el.textContent=value;
  if(cls)el.className=cls;return el;
 };
 function serialize(data){
  if(!data)return '';
  const lines=[
   'BANCO MESTRE — TEXTOS GRIFADOS',
   'Documento: '+data.document_title,
   'ID: '+data.document_id,
   'Arquivo: '+data.source_filename,
   'Versão (hash): '+data.source_hash,
   'Escopo: '+(data.scope==='pagina_ativa'?'Somente página ativa':'Todas as páginas grifadas'),
   'Trechos detectados: '+data.extracted_count+' de '+data.highlight_count+' grifo(s)',
   'Método: extração geométrica aproximada; revisar o texto',
   ''
  ];
  if(!data.entries.length)lines.push('Nenhum grifo encontrado no escopo selecionado.');
  for(const entry of data.entries){
   lines.push('PÁGINA '+entry.page+' — GRIFO '+entry.mark);
   if(entry.text)lines.push(entry.text);
   else lines.push('['+({
    sem_texto_digital:'Sem camada de texto digital — OCR necessário',
    sem_correspondencia_geometrica:'Sem texto correspondente à posição do grifo',
    erro_de_leitura:'Erro ao ler a camada de texto'
   }[entry.status]||'Trecho não encontrado')+']');
   lines.push('');
  }
  if(data.warnings.length){
   lines.push('OBSERVAÇÕES');
   for(const warning of data.warnings)lines.push('- '+warning);
  }
  return lines.join('\n');
 }
 function render(data){
  summary.replaceChildren();preview.replaceChildren();
  const metrics=text('p',data.extracted_count+' trecho(s) recuperado(s) de '+
   data.highlight_count+' grifo(s), em '+data.highlighted_pages+' página(s).',
   'bm-v059-metrics');
  summary.append(metrics);
  for(const warning of data.warnings)summary.append(text('p',warning,'bm-v059-warning'));
  if(!data.entries.length){
   preview.append(text('p','Não há marcações de grifo no escopo escolhido. Primeiro grife um trecho no editor do PDF.','bm-v059-empty'));
  }
  for(const entry of data.entries){
   const item=document.createElement('article');item.className='bm-v059-result';
   item.append(text('strong','Página '+entry.page+' · Grifo '+entry.mark));
   if(entry.text){
    const content=text('p',entry.text);content.style.whiteSpace='pre-wrap';
    item.append(content);
   }else{
    const label={
     sem_texto_digital:'PDF sem texto digital detectável — OCR necessário.',
     sem_correspondencia_geometrica:'Nenhum texto coincidiu com esta marcação.',
     erro_de_leitura:'Ocorreu um erro ao ler esta página.'
    }[entry.status]||'Texto não identificado.';
    item.append(text('p',label,'bm-v059-warning'));
   }
   preview.append(item);
  }
 }
 function updateAvailability(){
  const allowed=!!pdfApi()?.editing;
  extract.disabled=!allowed||working;
  scope.disabled=working;
  if(!allowed&&!working){
   status.textContent='Abra o documento no editor PDF para extrair os grifos. A prévia do Google Drive não fornece as posições da página nem as marcações locais.';
  }else if(allowed&&!result&&!working){
   status.textContent='Pronto para analisar os grifos deste PDF. Escolha o escopo e clique em Extrair agora.';
  }
 }
 function open(){
  panel.hidden=false;option.setAttribute('aria-expanded','true');
  updateAvailability();
 }
 function hide(){
  panel.hidden=true;option.setAttribute('aria-expanded','false');
 }
 option.setAttribute('aria-expanded','false');
 option.setAttribute('aria-controls','bmV059ExtractPanel');
 option.onclick=()=>panel.hidden?open():hide();
 close.onclick=hide;
 function setExportAvailability(on){
  for(const el of [copy,saveTxt,saveJson])el.disabled=!on;
 }
 extract.onclick=async()=>{
  if(working||!pdfApi()?.editing)return;
  const id=pdfApi().currentId,hash=pdfApi().sourceHash,run=++generation;
  working=true;result=null;setExportAvailability(false);
  summary.replaceChildren();preview.replaceChildren();
  updateAvailability();
  try{
   status.textContent='Lendo as páginas grifadas...';
   const data=await pdfApi().extractHighlights({
    scope:scope.value,
    onProgress:(current,total,page)=>{
     if(run!==generation)return;
     status.textContent='Lendo grifos: página '+page+' ('+current+' de '+total+' páginas com grifos)...';
    }
   });
   if(run!==generation||!dialog.open||!pdfApi()?.editing||
     pdfApi().currentId!==id||pdfApi().sourceHash!==hash)return;
   result=data;render(data);setExportAvailability(true);
   status.textContent='Concluído. Revise os trechos antes de copiar ou utilizar no estudo.';
  }catch(error){
   if(run!==generation)return;
   status.textContent='Extração não concluída: '+String(error.message||error);
  }finally{
   if(run===generation){working=false;updateAvailability()}
  }
 };
 async function copyText(){
  if(!result)return;
  const body=serialize(result);
  try{
   if(navigator.clipboard?.writeText)await navigator.clipboard.writeText(body);
   else{
    const textarea=document.createElement('textarea');
    textarea.value=body;textarea.style.cssText='position:fixed;left:-10000px;top:0';
    document.body.append(textarea);textarea.select();
    const ok=document.execCommand('copy');textarea.remove();
    if(!ok)throw Error('Área de transferência indisponível');
   }
   status.textContent='Texto copiado. Confira os trechos antes de utilizá-los.';
  }catch(error){status.textContent='Não foi possível copiar automaticamente. Exporte o TXT. '+error.message}
 }
 function download(mime,ext,body){
  if(!result)return;
  const blob=new Blob([body],{type:mime});
  const url=URL.createObjectURL(blob);
  const link=document.createElement('a');
  link.href=url;
  const safe=String(result.document_id||'documento').replace(/[^A-Za-z0-9_-]/g,'_');
  link.download='Banco_Mestre_Grifos_'+safe+'_'+result.scope+'.'+ext;
  document.body.append(link);link.click();link.remove();
  setTimeout(()=>URL.revokeObjectURL(url),12000);
 }
 copy.onclick=copyText;
 saveTxt.onclick=()=>download('text/plain;charset=utf-8','txt',serialize(result));
 saveJson.onclick=()=>download('application/json;charset=utf-8','json',JSON.stringify(result,null,2));
 dialog.addEventListener('close',()=>{
  generation++;working=false;result=null;setExportAvailability(false);hide();
  summary.replaceChildren();preview.replaceChildren();status.textContent='';
 });
 window.BancoMestrePDFExtracaoV059={
  get ready(){return !!$('bmV059ExtractMenu')},
  get open(){return !panel.hidden},
  get lastResult(){return result?{...result,entries:result.entries.map(x=>({...x}))}:null},
  openPanel:open
 };
})();
/* Banco Mestre V079 — diagnóstico de versão e catálogo dinâmico, somente leitura. */
/* Preserva V067/V077 nos arquivos históricos. */
(function BancoMestreV067Diagnostico(){
 'use strict';
 const $=id=>document.getElementById(id);
 function versionStatus(v,currentPath){
  const version=String(v?.version||''),home=String(v?.home||'');
  const expected=/^V\d{3}$/.test(version)?'v'+version.slice(1)+'.html':'';
  const page=String(currentPath||'').split(/[?#]/)[0].split('/').pop();
  const verified=!!expected&&home===expected,isCurrent=!page||page==='index.html'||page===home;
  const kind=!verified?'problem':isCurrent?'ok':'warning';
  return {kind,version,home,page,details:'Manifesto: '+(version||'?')+' / '+(home||'?')+
   '. Página: '+(page||'index.html')+
   (!verified?'. Versão e arquivo de entrada divergentes.':isCurrent?'. Versão publicada coerente.':'. Página histórica preservada.')};
 }
 window.BancoMestreVersionCheckV079=versionStatus;
 const lib=$('grifos'),host=lib?.querySelector('.bm062-panel');
 if(!host||$('bm067Audit'))return;
 const section=document.createElement('section');
 section.id='bm067Audit';
 section.setAttribute('aria-label','Diagnóstico local do Banco Mestre');
 section.innerHTML=`
 <h3>Diagnóstico de funcionamento — V067</h3>
 <p>Verifica esta instalação, os grifos locais, o catálogo e as interfaces disponíveis. A análise <strong>não altera dados</strong>, não envia informações ao servidor e não executa migração.</p>
 <div class="bm067-actions">
  <button id="bm067Run" type="button">Verificar agora</button>
  <button id="bm067Copy" type="button" disabled>Copiar relatório sem dados privados</button>
 </div>
 <p id="bm067Status" role="status" aria-live="polite">Ainda não executado.</p>
 <div id="bm067Results" class="bm067-results"></div>
 <small>Para testar a sobreposição do Cartão rápido e a seleção de palavras, abra um PDF local e utilize o botão “Diagnóstico do leitor”. Testes OAuth e de gravação no Drive não são realizados sem autorização separada.</small>`;
 const stats=host.querySelector('#bm062Stats');
 if(stats)stats.before(section);else host.prepend(section);
 let report='',busy=false;
 const out=$('bm067Results'),status=$('bm067Status');
 function append(kind,name,details){
  const row=document.createElement('div');
  row.className='bm067-result bm067-'+kind;
  const symbol=kind==='ok'?'✓':kind==='problem'?'!':kind==='warning'?'△':'–';
  const label=document.createElement('strong');label.textContent=symbol+' '+name;
  const small=document.createElement('span');small.textContent=String(details||'');
  row.append(label,small);out.append(row);
  return {kind,name,details:String(details||'')};
 }
 const r=()=>[];
 const validRect=b=>Array.isArray(b)&&b.length===4&&b.every(v=>Number.isFinite(v)&&v>=0&&v<=1)&&b[0]<b[2]&&b[1]<b[3];
 const visible=e=>!!e&&!e.hidden&&getComputedStyle(e).display!=='none'&&e.getBoundingClientRect().width>0&&e.getBoundingClientRect().height>0;
 const collides=(a,b)=>!!a&&!!b&&a.left<b.right&&a.right>b.left&&a.top<b.bottom&&a.bottom>b.top;
 async function inspect(){
  let expectedPdfCount=72;
  const found=[],add=(kind,name,details)=>found.push({kind,name,details:String(details||'')});
  try{
   const s=await fetch('assets/version.json',{cache:'no-store'});
   if(!s.ok)throw Error('HTTP '+s.status);
   const v=await s.json();
   const checked=versionStatus(v,location.pathname);
   expectedPdfCount=Number(v?.counts?.pdfs)||72;
   add(checked.kind,'Versão publicada',checked.details);
  }catch(e){add('problem','Manifesto de versão','Indisponível: '+e.message)}
  try{
   const s=await fetch('assets/pdf_catalog_v077.json',{cache:'no-store'});
   if(!s.ok)throw Error('HTTP '+s.status);
   const pdf=await s.json();
   const length=pdf?.documents?.length||0;
   add(length===expectedPdfCount?'ok':'problem','Catálogo de PDFs',length+' documentos encontrados; esperado: '+expectedPdfCount+'.');
  }catch(e){add('problem','Catálogo de PDFs','Indisponível: '+e.message)}
  const pdfApi=window.BancoMestrePDFV042;
  add(pdfApi?.addTextHighlight&&pdfApi?.getCurrentPdfPage&&pdfApi?.goToPage?'ok':'problem',
   'Grifador e navegação',pdfApi?'API de texto e página '+(pdfApi.addTextHighlight?'disponível.':'incompleta.'):'API do PDF ausente.');
  add($('bm064HighlightPanel')&&$('bm064TogglePanel')?'ok':'problem','Painel de grifos',
   $('bm064HighlightPanel')?'Estrutura do painel e botão de abertura encontrada.':'Painel de grifos não localizado.');
  add($('bm062Backup')&&$('bm066Prepare')&&$('bm066Download')?'ok':'problem','Backup local',
   $('bm066Prepare')?'Preparação e exportação JSON disponíveis.':'Controles de backup não encontrados.');
  add(!!globalThis.crypto?.subtle?'ok':'warning','Verificação SHA-256',
   globalThis.crypto?.subtle?'Web Crypto disponível em contexto seguro.':'A verificação precisa de HTTPS/navegador compatível.');
  let count=0,incorrect=0,badAnchors=0,duplicate=0;
  const ids=new Set();
  try{
   for(let i=0;i<localStorage.length;i++){
    const key=localStorage.key(i);
    if(!key?.startsWith('BM030_STROKES_PDF:'))continue;
    count++;
    let array;try{array=JSON.parse(localStorage.getItem(key)||'[]')}catch{incorrect++;continue}
    if(!Array.isArray(array)){incorrect++;continue}
    for(const m of array){
     if(m?.type!=='text_highlight')continue;
     if(!m?.id||!Array.isArray(m.rects)||!m.rects.length||!m.rects.every(validRect))badAnchors++;
     if(m.id){const tag=key.split(':').slice(0,3).join(':')+'|'+m.id;
      if(ids.has(tag))duplicate++;ids.add(tag)}
    }
   }
   add(incorrect===0?'ok':'problem','Integridade dos dados locais',
    count+' registro(s) de página; '+incorrect+' estrutura(s) ilegível(is). Os conteúdos não são exibidos nem enviados.');
   add(badAnchors===0&&duplicate===0?'ok':'warning','Âncoras e identificadores',
    badAnchors+' grifo(s) textuais com retângulos inválidos; '+duplicate+' possível(is) ID(s) repetido(s).');
  }catch(e){add('problem','Leitura de grifos locais','O navegador impediu a consulta: '+e.message)}
  const imageApi=window.BancoMestreImagens;
  if(!imageApi?.all){add('problem','Estados de exclusão de imagens','API de visibilidade ausente.')}
  else{
   try{
    const entries=await imageApi.all();
    const removed=new Set(entries.filter(x=>x?.status==='hidden').map(x=>String(x.id).toUpperCase()));
    const items=[...document.querySelectorAll('#topicMedia .topicVisualCard')];
    const exposed=items.filter(card=>[...card.querySelectorAll('button.media-ref')].some(b=>removed.has(String(b.textContent||'').trim().toUpperCase())));
    add(exposed.length?'problem':'ok','Imagens excluídas em Assuntos',
     removed.size+' excluída(s) no estado local; '+exposed.length+' imagem(ns) excluída(s) ainda presente(s) no assunto carregado.');
   }catch(e){add('warning','Visibilidade de imagens','Não foi possível concluir a leitura: '+e.message)}
  }
  if(!pdfApi?.editing){add('skip','PDF em edição','Nenhum PDF está aberto no editor; abra um PDF e execute o diagnóstico do leitor.')}
  else{
   add(pdfApi.currentId&&pdfApi.sourceHash?'ok':'problem','Identidade do PDF',
    pdfApi.currentId&&pdfApi.sourceHash?'Documento e hash da versão disponíveis.':'Fonte incompleta: não transferir grifos.');
   const layer=document.querySelector('#pdfPageWrap .bm-v061-text-layer');
   add(pdfApi.currentTool!=='select'?'skip':layer?'ok':'warning','Camada de seleção',
    pdfApi.currentTool!=='select'?'Ferramenta Selecionar texto não está ativa.':
    layer?'Camada de palavras localizada nesta página.':'Sem camada de texto nesta página (escaneamento, carregamento ou falha).');
   const quick=$('pdfQuickPanelV047'),float=$('bmV056FloatingControls');
   if(!visible(quick))add('skip','Cabeçalho do Cartão rápido','Abra o Cartão rápido antes de repetir o diagnóstico para conferir sobreposição.');
   else{
    const header=quick.querySelector('.bm-v047-card-header');
    const hit=visible(float)&&visible(header)&&collides(float.getBoundingClientRect(),header.getBoundingClientRect());
    add(hit?'problem':'ok','Cabeçalho do Cartão rápido',
     hit?'Cabeçalho está sobreposto aos controles do PDF.':'Nenhuma sobreposição detectada no tamanho atual da janela.');
   }
  }
  add('skip','Google Drive','Nenhum acesso nem upload foi executado; envio depende de autorização explícita.');
  return found;
 }
 async function run(forReader=false){
  if(busy)return;busy=true;
  $('bm067Run').disabled=true;$('bm067Copy').disabled=true;
  status.textContent='Executando verificações locais, sem alterar os registros...';
  out.replaceChildren();let results=[];
  try{
   results=await inspect();
   for(const x of results)append(x.kind,x.name,x.details);
   const counts={ok:0,problem:0,warning:0,skip:0};
   for(const x of results)counts[x.kind]=(counts[x.kind]||0)+1;
   status.textContent=`Concluído: ${counts.ok} OK, ${counts.problem} problema(s), ${counts.warning} alerta(s), ${counts.skip} não testado(s).`;
   report='Banco Mestre — diagnóstico V067\nData: '+new Date().toISOString()+'\n'+
    'Resumo: '+status.textContent+'\n'+
    results.map(x=>`[${x.kind.toUpperCase()}] ${x.name}: ${x.details}`).join('\n')+
    '\nNenhum texto de grifo, ID de documento privado, token ou conteúdo de PDF está incluído.\n';
   $('bm067Copy').disabled=false;
   if(forReader){const mini=$('bm067ReaderStatus');if(mini)mini.textContent=status.textContent;
    if(counts.problem)window.alert(status.textContent+'\n\nAbra a Biblioteca de Grifos para ver as verificações detalhadas.');
   }
  }catch(e){
   status.textContent='Diagnóstico interrompido: '+e.message;
  }finally{busy=false;$('bm067Run').disabled=false}
 }
 $('bm067Run').addEventListener('click',()=>run(false));
 $('bm067Copy').addEventListener('click',async()=>{
  if(!report)return;
  try{await navigator.clipboard.writeText(report);status.textContent='Relatório sem conteúdo privado copiado.'}
  catch{status.textContent='O navegador bloqueou a cópia. Selecione os resultados exibidos para copiar.'}
 });
 const tools=$('pdfLocalTools');
 if(tools){
  const button=document.createElement('button');button.id='bm067ReaderRun';button.type='button';
  button.textContent='✓ Diagnóstico do leitor';
  button.title='Executa verificações de integridade sem alterar os grifos';
  const caption=document.createElement('small');caption.id='bm067ReaderStatus';
  caption.textContent='Verifique seleção de texto, prévia do cartão e grifos.';
  tools.append(button,caption);
  button.addEventListener('click',()=>run(true));
 }
 window.BancoMestreDiagnosticoV067={run:()=>run(false)};
})();

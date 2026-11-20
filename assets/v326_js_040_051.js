/* V315 IIFE modules 40–51 unchanged */

;
/* 40 assets/v206_diagnostico_local.js */
/* Banco Mestre V206 — diagnóstico read-only; nenhum dado alterado. */
(function BancoMestreV067Diagnostico(){
 'use strict';
 const $=id=>document.getElementById(id);
 const lib=$('grifos'),host=lib?.querySelector('.bm062-panel');
 if(!host||$('bm067Audit'))return;
 const section=document.createElement('div');
 section.id='bm067Audit';
 section.setAttribute('aria-label','Diagnóstico local do Banco Mestre');
 section.innerHTML=`
 <h3>Diagnóstico de funcionamento — edição atual</h3>
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
  const found=[],add=(kind,name,details)=>found.push({kind,name,details:String(details||'')});
  try{
   const s=await fetch('assets/version.json',{cache:'no-store'});
   if(!s.ok)throw Error('HTTP '+s.status);
   const v=await s.json();
   add(v.version==='V206'&&v.home==='v206.html'&&v.previous_version==='V205'?'ok':'problem','Versão publicada',
    'Manifesto: '+String(v.version||'?')+' / '+String(v.home||'?')+'; anterior: '+String(v.previous_version||'?')+'. Esperado: V206 / v206.html; anterior: V205.');
  }catch(e){add('problem','Manifesto de versão','Indisponível: '+e.message)}
  try{
   const s=await fetch('assets/pdf_catalog_v149.json',{cache:'no-store'});
   if(!s.ok)throw Error('HTTP '+s.status);
   const pdf=await s.json();
   const length=pdf?.documents?.length||0;
   add(length===78?'ok':'problem','Catálogo de PDFs',length+' documentos do catálogo base; esperado: 78.');
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
   report='Banco Mestre — diagnóstico V206\nData: '+new Date().toISOString()+'\n'+
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
 window.BancoMestreDiagnosticoV193=window.BancoMestreDiagnosticoV067;
 window.BancoMestreDiagnosticoV200=window.BancoMestreDiagnosticoV067;
 window.BancoMestreDiagnosticoV201=window.BancoMestreDiagnosticoV067;
 window.BancoMestreDiagnosticoV202=window.BancoMestreDiagnosticoV067;
 window.BancoMestreDiagnosticoV203=window.BancoMestreDiagnosticoV067;
 window.BancoMestreDiagnosticoV204=window.BancoMestreDiagnosticoV067;
 window.BancoMestreDiagnosticoV205=window.BancoMestreDiagnosticoV067;
 window.BancoMestreDiagnosticoV206=window.BancoMestreDiagnosticoV067;
})();


;
/* 41 assets/v269_drive_pdf_sync.js */
/* V269 — PDF Drive autenticado e verificado antes de apresentar catálogo. */
/* V268: catálogo PDF persistente sem tokens OAuth; históricos visíveis. */
/* V259: distingue referencias historicas, PDFs verificados e consulta pendente.
 * A lista local do catalogo e apenas referencia, nao comprovacao de acesso.
 * Nunca altera PDF, grifo, ID, permissao ou Drive canonico. */
/* V217: PDFs apenas confirmados no Drive entram na biblioteca; IDs históricos preservados. */
/* V215: PDFs compartilham um login Drive; sem OAuth por documento. */
/* Banco Mestre V201 — consulta incremental de PDFs somente na sessão, sem publicação no GitHub.
 * Banco Mestre V150 — sincronização abrangente de PDFs do acervo do Drive.
 * Consulta os dois repositórios principais, incluindo subpastas, e os dois acervos
 * especializados. Nunca publica bytes ou links privados no GitHub.
 * Somente metadados são adicionados à lista na sessão autenticada.
 * Arquivos e grifos originais, IDs canônicos, SRS e cartões não são alterados.
 */
(function(){
'use strict';
if(window.BancoMestrePDFSyncV130)return;
const ROOTS=[
 {id:'1yvwhb-W-vMUMu5DmikE3hR-i01cnrWdK',name:'DataBase_Concurso',group:''},
 {id:'1squNqRXuxfT1YRjT3i4nw8TRnFtLOcuE',name:'CONCURSOS – ENGENHARIA CIVIL',group:''},
 {id:'1_IgIlki_2ZlMmOaKmYuzhiMSjyLa-cnV',name:'Normas Regulamentadoras',group:'eng_seguranca'},
 {id:'18MsuWSayX7xpBhNmGjSvFmiiv1hF6YZk',name:'Licenciamento ambiental',group:'eng_ambiental'}
];
const API='https://www.googleapis.com/drive/v3/files';
const SCOPE='https://www.googleapis.com/auth/drive.readonly';
const FOLDER='application/vnd.google-apps.folder';
// V150: ocultar arquivos históricos ao sincronizar; sem removê-los do Drive.
const ARCHIVED_MANUSCRIPT_FILE_IDS=new Set(["1Ao1el9VmOiZpI-IktzrtgcNvfOM_WAb8","1XmcWxJgj9tO9_Do4vb7iBf2-SvBVHdqZ","1QL0B5GA2mlGmCIiD3YP8TKYLpSjUoze7","1ahXHdkH25nrLjLHrrxM0qfwVT8hL-DAs","1SEhbYlcBkyDjHIQk20bgcweuPTEdQ0BT","1oWZIpUbTdC1mBgt-R3XiU_vUfFB0z1wX","1JBuwirmsLn27lGjEp4uDNe_MRzVapGwU","1OvZ_tU0WtyuGqnEgvuB5LTTMqvg6Gb6f","1oUVOSIhWvtQ-PUfeWx8slkaIf1cHdOot","1s4ovip5kXwe2_sVSnTXITOhop-Zj_txK","1RN2_X5URRMtRdG7Kmo2-U1_t0CsGXdhv","1q6jN6HZU5rrBSDhn5N3fzF3qk8QiPJ0z","1KzNlM1O32Xkuv2Y8udTSB5JI5_b_d662","1oAL_IKGpMCnbhyLxFGRhfUfZvk9SEB7i","1tUgv3BB4kbj0M1PEWE6ekJIamOBpUaKO","1kfOAB-W_7rV3gXTZGvbVZj01X3y011Xc","1P6cvyJsa-S8UmGMYWYLARjGfLWW-Cd-p","1RgEPslkeaSJD6bGhIc5b-V3a53F15bMj","1LEjZB0MQ-O833d54cJ2_JSYqv7s9REYa","14rU5v5wnOPHndmUgE7FApEwBlnO2Xcxk","1bUlE8MNZiwRwgIbHLBgrXIJlSzRs8DGT","1pUbdKVoXFXBSp3_ijE-p-yak54DrLDbR","1Xn_dBjk8kQf7mRfTDlERRVBaMv_iLohT","13UM-AycIKd2tcQv5Pr_eY-lykItM_u0X","1x312878dIZpmLFX18PEK5lfxFo5dlTL-","1pBxnxZzRhUmNB5aCCXmOg3ilN-HR3gcm","1H5a3cJIdJz-GNiNMb-w3813AF_HaPoZp","1UK6Ah-Ylcumpg2rXGZzjrA4I4BhrwMs5","1-yV23LZePzrRYonq2S8e_5vQ-OWgWRp9","1DCJSSU4aoiqnffPZs5cHXxPd7w4cy3BY","17cML_TVyYNUvt3t1suE3vGCxkQpN5IZg","1o1z_ICrt7UJq7VsaJT1De-MEGVHvPzmj","1CQT3WqJmu2fRt49yACOvAkkCjz8dpt0g","1ARoe-uFCUvRHoH3Pl8mpJYXeyvpAdvtE","1zKnBs90_3ESx2H_YslEAnoqro9sTczHE","1mqExDssXXFVM6MRX7ORfRs3vTiUU6N8n"]);
function isArchivedManuscript(f){
 if(ARCHIVED_MANUSCRIPT_FILE_IDS.has(f.id))return true;
 const n=norm(f.name);
 return /eng[ _-]*civil[ _-]*estudo[ _-]*geral[^\n]*261022/.test(n);
}
const MAX_FOLDERS=1500,MAX_PDFS=30000,CONCURRENCY=5;
const LOCAL_CATALOG_KEY='BM268_LAST_DRIVE_PDF_CATALOG_V1';
let token='',expires=0,client=null,scanning=false,lastResult=null;
let automaticScanTimer=0,lastScanStartedAt=0,legacyCatalog=null;
// A lista antiga preserva IDs/grifos; disponibilidade vem do Drive.
const $=id=>document.getElementById(id);
const norm=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const label=s=>String(s||'Documento PDF').replace(/\.pdf$/i,'').replace(/[_]+/g,' ').replace(/\s+/g,' ').trim().slice(0,180);
function status(message,error){
 const e=$('bm-pdf-sync-status');if(!e)return;
 e.textContent=message;e.style.color=error?'#993b32':'#355960';
}
function ui(){
 const panel=$('pdfs')?.querySelector('.panel');if(!panel||$('bm-pdf-sync'))return;
 const bar=document.createElement('div');bar.id='bm-pdf-sync';
 bar.style.cssText='display:flex;align-items:center;flex-wrap:wrap;gap:8px;padding:10px;margin:10px 0;border:1px solid #c7d8d5;border-radius:9px;background:#f0f6f4';
 const heading=document.createElement('strong');heading.textContent='PDFs do Google Drive';heading.style.fontSize='13px';
 const connect=document.createElement('button');connect.id='bm-pdf-sync-connect';connect.type='button';connect.disabled=true;connect.textContent='Conectar Google Drive';
 const sync=document.createElement('button');sync.id='bm-pdf-sync-refresh';sync.type='button';sync.disabled=true;sync.textContent='Verificar PDFs das pastas monitoradas';
 const state=document.createElement('span');state.id='bm-pdf-sync-status';state.setAttribute('role','status');state.setAttribute('aria-live','polite');
 state.style.cssText='flex-basis:100%;font-size:12px';
 state.textContent='Referências históricas catalogadas; disponibilidade no Drive ainda não verificada. Conecte e consulte as pastas monitoradas.';
 bar.append(heading,connect,sync,state);
 panel.insertBefore(bar,$('pdfAreaNavV036')||panel.firstChild);
 connect.onclick=()=>authorize();
 sync.onclick=()=>{if(scanning)return;if(authorized())void refresh();else authorize();};
}
function activeToken(){return (token&&Date.now()<expires?token:'')||window.BancoMestreMediaSyncV182?.token?.()||'';}
function authorized(){return !!activeToken();}
function authorize(){
 if(authorized()){void refresh();return;}
 if(window.BancoMestreDriveV042?.ready){
  status('Conectando ao Drive pelo acesso único do Banco Mestre…');
  window.BancoMestreDriveV042.authorize();return;
 }
 status('A conexão com o Google ainda não está pronta. Tente novamente.',true);
}
function gis(){
 if(window.google?.accounts?.oauth2?.initTokenClient)return Promise.resolve();
 return new Promise((resolve,reject)=>{
  const el=document.createElement('script');el.src='https://accounts.google.com/gsi/client';el.async=true;
  el.onload=resolve;el.onerror=()=>reject(new Error('Serviço de autenticação Google indisponível'));
  document.head.append(el);
 });
}
async function initialize(){
 ui();
 const restored=await restoreCached();
 try{
  const response=await fetch('assets/drive_auth_v038.json',{cache:'no-store'});
  if(!response.ok)throw Error('Configuração Google não encontrada');
  const conf=await response.json();
  if(!/\.apps\.googleusercontent\.com$/.test(conf.client_id||''))throw Error('Client ID OAuth inválido');
  await gis();
  client=google.accounts.oauth2.initTokenClient({
   client_id:conf.client_id,scope:SCOPE,
   callback:r=>{
    if(r.error||!r.access_token){status('Drive não autorizado. O catálogo anterior foi preservado.',true);return;}
    token=r.access_token;
    expires=Date.now()+Math.max(60,Number(r.expires_in||3600)-90)*1000;
    window.BancoMestreMediaSyncV182?.publishToken(token,Number(r.expires_in||3600));
    void refresh();
   },
   error_callback:()=>status('Falha na autorização Google. Nenhum PDF foi alterado.',true)
  });
  $('bm-pdf-sync-connect').disabled=false;
  $('bm-pdf-sync-refresh').disabled=false;
  document.addEventListener('bm-media-drive-authorized',()=>{
   status('Drive autorizado. Conferindo PDFs novos e alterados do acervo…');
   // Um acesso concedido por QUALQUER módulo ativa a mesma biblioteca.
   // Coalesce os múltiplos eventos OAuth para evitar varreduras concorrentes.
   if(automaticScanTimer)clearTimeout(automaticScanTimer);
   automaticScanTimer=setTimeout(()=>{
    automaticScanTimer=0;
    if(authorized()&&!scanning&&Date.now()-lastScanStartedAt>10000){const b=$('bm-pdf-sync-connect');if(b)b.textContent='Drive conectado';void refresh();}
   },400);
  });
  if(authorized()){
   status('Drive já autorizado. Iniciando conferência dos PDFs das pastas monitoradas…');
   if(!scanning)void refresh();
  }else{
   if(!restored)status('Referências históricas não verificadas. Conecte o Drive e confira os PDFs das pastas monitoradas.');
  }
 }catch(e){status('Sincronização indisponível: '+e.message+'. PDFs anteriores preservados.',true);}
}
async function fetchPage(url){
 for(let attempt=0;attempt<3;attempt++){
  const r=await fetch(url,{headers:{Authorization:'Bearer '+activeToken()},cache:'no-store'});
  if(r.status===401){token='';expires=0;
   document.documentElement.dataset.bm217PdfVerified='expired';
   window.BM269PdfGate?.refresh?.();
   throw Error('sessão Google expirada; reconecte o Drive');}
  if(r.status===403)throw Error('acesso negado a uma pasta do acervo');
  if(r.status===429||r.status>=500){
   if(attempt===2)throw Error('Drive temporariamente indisponível (HTTP '+r.status+')');
   await new Promise(ok=>setTimeout(ok,450*(attempt+1)));
   continue;
  }
  if(!r.ok)throw Error('Drive HTTP '+r.status);
  return r.json();
 }
 throw Error('Falha ao consultar o Drive');
}
async function children(id){
 let next='',all=[],pages=0;
 do{
  if(++pages>80)throw Error('pasta com excesso de páginas; auditoria necessária');
  const q=new URLSearchParams({
   q:"'"+id+"' in parents and trashed = false",
   fields:'nextPageToken,files(id,name,mimeType,size,modifiedTime,parents)',
   pageSize:'1000',supportsAllDrives:'true',includeItemsFromAllDrives:'true'
  });
  if(next)q.set('pageToken',next);
  const data=await fetchPage(API+'?'+q.toString());
  all.push(...(Array.isArray(data.files)?data.files:[]));
  next=data.nextPageToken||'';
 }while(next);
 return all;
}
async function crawl(){
 const queue=ROOTS.map(r=>({...r,path:r.name}));
 const visited=new Set(),found=new Map();
 let checked=0;
 while(queue.length){
  const batch=[];
  while(queue.length&&batch.length<CONCURRENCY){
   const folder=queue.shift();
   if(visited.has(folder.id))continue;
   visited.add(folder.id);
   if(visited.size>MAX_FOLDERS)throw Error('mais de '+MAX_FOLDERS+' pastas; a consulta foi interrompida sem alterar o catálogo');
   batch.push(folder);
  }
  if(!batch.length)continue;
  const pages=await Promise.all(batch.map(async f=>({folder:f,items:await children(f.id)})));
  for(const {folder,items} of pages){
   checked++;
   for(const file of items){
    if(!file||!file.id||!file.name)continue;
    if(file.mimeType===FOLDER){
     if(!visited.has(file.id))queue.push({id:file.id,name:file.name,path:folder.path+' / '+file.name,group:folder.group});
    }else if(file.mimeType==='application/pdf'&&/^[A-Za-z0-9_-]{15,}$/.test(file.id)){
     if(!found.has(file.id))found.set(file.id,{file,path:folder.path,rootGroup:folder.group});
     if(found.size>MAX_PDFS)throw Error('mais de '+MAX_PDFS+' PDFs; a consulta foi interrompida sem alterar o catálogo');
    }
   }
  }
  if(checked===ROOTS.length||checked%10===0)
   status('Lendo Drive: '+checked+' pasta(s), '+found.size+' PDF(s) localizados…');
 }
 return {found,checked};
}
function inferGroup(rec){
 if(rec.rootGroup)return rec.rootGroup;
 const file=norm(rec.file.name), path=norm(rec.path), all=file+' '+path;
 // Regras específicas têm precedência sobre a área principal da pasta.
 if(/ijui|iju[ií]/.test(all)&&/lei|estatuto|codigo|plano diretor|tribut|servidor|municip/.test(all))return 'leg_ijui';
 if(/(?:edital|prova|gabarito|questoes|concurso anterior)/.test(file)||
    /(?:editais e provas|03_questoes_provas|05.*editais.*provas|questoes provas e gabaritos)/.test(path))return 'apoio_provas';
 if(/(?:vade.?mecum|constitui[cç][aã]o|codigo (?:civil|penal|eleitoral|tributario)|lei (?:seca|federal)|licitac|improbidade|legislacao geral|lei 1[045]\.|lgpd|estatuto da cidade|lrf)/.test(all))return 'leg_geral';
 if(/(?:legislacao municipal|lei organica|plano diretor municipal|codigo de obras|municipal)/.test(all))return 'leg_outros';
 if(/(?:\bnr[-_ ]?0?[15789]\b|\bnr[-_ ]?1[078]\b|cipa|pcms[oó]|seguranca|sst|epi|ergonomia|acessibilidade)/.test(all))return 'eng_seguranca';
 if(/(?:conama|licenciamento|ambiental|eia.?rima|residuos|aterro sanitario)/.test(all))return 'eng_ambiental';
 if(/(?:geotecn|mecanica dos solos|fundac|sondagem|sapata|estacas|taludes|aterros)/.test(all))return 'eng_geotecnia';
 if(/(?:estrutur|resistencia dos materiais|concreto armado|nbr.?6118|nbr.?8800|trelica|metalica)/.test(all))return 'eng_estruturas';
 if(/(?:cimento|agregados|argamass|alvenaria|tecnologia do concreto|materiais de construcao)/.test(all))return 'eng_materiais';
 if(/(?:instalac.*eletric|nbr.?5410|fator de potencia)/.test(all))return 'eng_instalacoes';
 if(/(?:hidraulic|saneamento|agua fria|esgoto|drenagem|tratamento de agua|estacao de tratamento|eta ete|nbr.?8160|nbr.?5626)/.test(all))return 'eng_hidraulica';
 if(/(?:rodovia|paviment|pontes|trafego|transporte viario)/.test(all))return 'eng_rodovias';
 if(/(?:topograf|poligonal|cartografia|geodesia)/.test(all))return 'eng_topografia';
 if(/(?:patolog|manutencao predial|inspecao predial)/.test(all))return 'eng_patologias';
 if(/(?:desempenho|nbr.?15575)/.test(all))return 'eng_desempenho';
 if(/(?:orcament|planejamento|curva.?s|bdi|cronograma|avaliacao de bens|nbr.?14653)/.test(all))return 'eng_planejamento';
 if(/(?:portugues|gramatica|sintaxe|morfologia|redacao|ortografia|concordancia|crase)/.test(all))return 'lang_port';
 if(/(?:matemat|raciocinio logico|tabela verdade|algebra|geometria|probabilidade|estatistica)/.test(all))return 'lang_math';
 if(/(?:obras completas|manuscrito completo|engenharia civil completo)/.test(all))return 'completo';
 if(/(?:legislacao|normas legais|direito)/.test(all))return 'leg_outros';
 if(/(?:engenharia civil|_eng_|estruturas|construcao)/.test(all))return 'eng_outros';
 if(/(?:matematica|portugues)/.test(all))return 'lang_outros';
 return 'apoio_drive';
}
function driveUrl(id){return 'https://drive.google.com/file/d/'+encodeURIComponent(id)+'/view';}
async function canonicalLegacy(){
 if(window.BM169PdfInitPromise)await window.BM169PdfInitPromise;
 if(!Array.isArray(docs))throw Error('Leitor PDF indisponível');
 if(!legacyCatalog)legacyCatalog=docs.filter(p=>!p._driveDynamic).map(p=>({...p}));
 return legacyCatalog;
}

/* Apenas metadados são guardados no perfil local. Sem token, bytes de PDF ou grifos. */
function saveCached(records,folders,found){
 try{
  if(records.length>2000)return false;
  const items=records.map(p=>({
   file_id:String(p.file_id||''),title:String(p.title||'Documento PDF').slice(0,240),
   filename:String(p.filename||'').slice(0,300),
   section:String(p.section||'').slice(0,600),
   group:String(p.group||'apoio_drive'),
   category:String(p.category||'PDF_DE_ESTUDO').slice(0,60),
   size:Math.max(0,Number(p.size)||0),
   modifiedTime:String(p.modifiedTime||'').slice(0,60),
   archived:Boolean(p._driveArchive)
  }));
  localStorage.setItem(LOCAL_CATALOG_KEY,JSON.stringify({schema:1,at:new Date().toISOString(),folders,found,items}));
  return true;
 }catch(e){console.warn('Catálogo PDF não persistido:',e);return false}
}
async function restoreCached(){
 try{
  const saved=JSON.parse(localStorage.getItem(LOCAL_CATALOG_KEY)||'null');
  if(saved?.schema!==1||!Array.isArray(saved.items)||!saved.items.length||saved.items.length>2000||
     !Number.isFinite(Date.parse(saved.at||'')))return false;
  const baseline=await canonicalLegacy();
  const api=window.BancoMestrePDFGruposV036;
  if(!api?.ready||!api?.registerExternal)return false;
  await api.ready();
  const known=new Map(baseline.filter(p=>p.file_id).map(p=>[p.file_id,p]));
  const list=[],extra=[],seen=new Set();
  for(const p of saved.items){
   if(!p||!/^[A-Za-z0-9_-]{15,}$/.test(p.file_id)||seen.has(p.file_id))return false;
   seen.add(p.file_id);
   const original=known.get(p.file_id);
   if(original){
    list.push({...original,_driveSynced:true,_driveArchive:Boolean(p.archived)});
   }else{
    const entry={
     id:'DRIVE-PDF-'+p.file_id,file_id:p.file_id,
     title:String(p.title||'PDF do Drive').slice(0,240),
     filename:String(p.filename||'').slice(0,300),
     section:String(p.section||'Google Drive').slice(0,600),
     drivePath:String(p.section||'Google Drive').slice(0,600),
     url:driveUrl(p.file_id),
     category:String(p.category||'PDF_DE_ESTUDO').slice(0,60),
     source:'Google Drive (última lista salva)',
     size:Math.max(0,Number(p.size)||0),
     modifiedTime:String(p.modifiedTime||'').slice(0,60),
     group:String(p.group||'apoio_drive'),
     _driveDynamic:true,_driveSynced:true,_driveArchive:Boolean(p.archived),
     origin:'Visto no Drive anteriormente; requer reconexão para validar acesso atual'
    };
    list.push(entry);extra.push(entry);
   }
  }
  api.registerExternal(extra);
  docs.splice(0,docs.length,...list);
  if($('pdfStat'))$('pdfStat').textContent=String(list.length);
  document.documentElement.dataset.bm217PdfVerified='cached';
  pdfRender();
  status('Catálogo salvo neste navegador: '+list.length+' PDFs (última conferência '+new Date(saved.at).toLocaleString('pt-BR')+'). Não revalidado nesta visita; conecte o Drive para verificar alterações.');
  return true;
 }catch(e){console.warn('Não foi possível restaurar catálogo de PDFs:',e);return false}
}
let bm263InFlight=null;
 function refresh(){
  if(bm263InFlight)return bm263InFlight;
  bm263InFlight=refreshInner().finally(()=>{bm263InFlight=null});
  return bm263InFlight;
 }
 async function refreshInner(){
 if(scanning)return lastResult;
 if(!authorized()){status('Conecte o Google Drive para consultar as pastas monitoradas.',true);return null;}
 lastScanStartedAt=Date.now();
 scanning=true;
 const sync=$('bm-pdf-sync-refresh'),connect=$('bm-pdf-sync-connect');
 if(sync)sync.disabled=true;
 if(connect)connect.disabled=true;
 try{
  if(typeof pdfInit!=='function'||typeof pdfRender!=='function'||!Array.isArray(docs))
   throw Error('biblioteca PDF não carregada');
  const baseline=await canonicalLegacy();
  const api=window.BancoMestrePDFGruposV036;
  if(!api?.ready||!api?.registerExternal)throw Error('grupos da biblioteca indisponíveis');
  await api.ready();
  status('Consultando as pastas e subpastas dos acervos no Drive…');
  const {found,checked}=await crawl();
  const previousDynamic=new Set(docs.filter(p=>p._driveDynamic).map(p=>p.id));
  const known=new Map(baseline.filter(p=>p.file_id).map(p=>[p.file_id,p]));
  const verifiedStatic=[],extra=[];
  let refreshed=0;
  for(const rec of found.values()){
   const f=rec.file;
   const archived=isArchivedManuscript(f);
   const knownStatic=known.get(f.id);
   if(knownStatic){
    knownStatic._driveSynced=true;
    knownStatic._driveArchive=archived;
    knownStatic.modifiedTime=f.modifiedTime||'';
    knownStatic.url=driveUrl(f.id);
    verifiedStatic.push(knownStatic);
    refreshed++;
    continue;
   }
   extra.push({
    id:'DRIVE-PDF-'+f.id,title:label(f.name),filename:f.name,file_id:f.id,
    url:driveUrl(f.id),section:rec.path,drivePath:rec.path,
    category:'PDF_DE_ESTUDO',source:'Google Drive (OAuth)',
    size:Number(f.size||0),modifiedTime:f.modifiedTime||'',group:inferGroup(rec),
    _driveDynamic:true,_driveSynced:true,_driveArchive:archived,
    origin:'PDF identificado no Drive; original e anotações não foram alterados'
   });
  }
  extra.sort((x,y)=>x.title.localeCompare(y.title,'pt-BR'));
  // Somente arquivos verificados no Drive entram na biblioteca ativa.
  // Referências históricas são preservadas nos backups, sem exclusão de originais/grifos.
  const verified=[...verifiedStatic,...extra];
  api.registerExternal(extra);
  docs.splice(0,docs.length,...verified);
  if($('pdfStat'))$('pdfStat').textContent=String(docs.length);
  const newlyAdded=extra.filter(p=>!previousDynamic.has(p.id)).length;
  if(newlyAdded&&$('pdfSearch')&&$('pdfFilter')){
   $('pdfSearch').value='';$('pdfFilter').value='all';
  }
  document.documentElement.dataset.bm217PdfVerified='true';
  pdfRender();
  const archivedCount=verified.filter(p=>p._driveArchive).length;
  let hiddenLocal=0;
  try{
   const excluded=JSON.parse(localStorage.getItem('BM026_EXCLUDE_PDF')||'[]');
   if(Array.isArray(excluded)){const keys=new Set(excluded);hiddenLocal=verified.filter(p=>keys.has(p.id)).length}
  }catch(_){}
  const persisted=saveCached(verified,checked,found.size);
  const summary=checked+' pastas verificadas; '+found.size+' PDFs únicos encontrados; '+
    verified.length+' na biblioteca ('+archivedCount+' históricos, '+hiddenLocal+' ocultos por escolha local); '+
    verifiedStatic.length+' dos 78 IDs históricos conferidos.';
  status('Biblioteca sincronizada diretamente do Google Drive: '+summary+
    (persisted?' Lista salva neste navegador para reabertura.':' Lista não pôde ser salva localmente; sessão atual preservada.'));
  lastResult={folders:checked,found:found.size,listed:verified.length,archived:archivedCount,
    hiddenLocal,cacheSaved:persisted,added:newlyAdded,dynamic:extra.length,
    static:verifiedStatic.length,matchedStatic:refreshed,source:'google_drive_only'};
  document.dispatchEvent(new CustomEvent('bm269-pdf-verification-finished',{detail:{found:found.size,listed:verified.length}}));
  return lastResult;
 }catch(e){
  status('Consulta do Drive incompleta: '+e.message+'. Lista anterior preservada; tente novamente.',true);
  return null;
 }finally{
  scanning=false;
  if(sync)sync.disabled=!client;
  if(connect)connect.disabled=!client;
 }
}
window.BancoMestrePDFSyncV130={refresh,get connected(){return authorized()},get lastResult(){return lastResult},roots:ROOTS.map(r=>r.name),syncVersion:'V269',scope:'drive_only_after_auth_readonly'};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',initialize,{once:true});
else void initialize();
})();

;
/* 42 assets/v218_image_metadata.js */
/* Banco Mestre V310 (motor V218): classificação temática aditiva.
 * Lê V211+V180 históricos e V310 (66 conteúdos inspecionados visualmente,
 * mais 40 classificações por nome descritivo). Imagens originais só no Drive.
 * Sem novas associações a cartão, sem perda de dados locais, sem gravação no Drive. */
(function(){
'use strict';
if(window.BM218ImageMetadata)return;
const CATALOGS=[
 {url:'assets/v211_published_images.json?v=211',schema:'BancoMestrePublishedImagesV211',key:'V211'},
 {url:'assets/v180_native_image_additions.json?v=180',schema:'BancoMestreNativeImageAdditionsV180',key:'V180'},
 {url:'assets/v310_image_taxonomy.json?v=310-1',schema:'BancoMestreImageTaxonomyV310',key:'V310'}
];
const GROUPS=Object.freeze({
 eng_seguranca:'Engenharia Civil · Segurança do Trabalho',
 eng_hidraulica:'Engenharia Civil · Hidráulica e Saneamento',
 eng_estruturas:'Engenharia Civil · Estruturas',
 eng_ambiental:'Engenharia Civil · Meio Ambiente',
 eng_geotecnia:'Engenharia Civil · Geotecnia',
 eng_materiais:'Engenharia Civil · Materiais',
 eng_outros:'Engenharia Civil',
 leg_geral:'Legislação',
 met_portal:'Metodologia e interface'
});
const ID=/^[A-Za-z0-9_-]{15,}$/;
let index=new Map(),promise=null,lastError='';
const str=v=>String(v==null?'':v).trim();
const stripExtension=name=>str(name).replace(/\.(png|jpe?g|webp|gif|svg)$/i,'');
const canon=s=>str(s).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
function opaque(value){
 const s=stripExtension(value).trim().replace(/[\s_-]/g,'');
 return !s||/^(?:[a-f0-9]{16,}|[0-9]{10,}|(?:image|img|foto|screenshot|capture|captura)\(?[0-9()_-]+\)?)$/i.test(s)||
  /^IMG[-_](?:C|P)\d+[-_]\d+$/i.test(str(value))||!/[A-Za-zÀ-ÿ]{3}/.test(s);
}
function friendly(value){
 let s=stripExtension(value)
  .replace(/^IMG[-_](?:C|P)\d+[-_]\d+[-_\s]*/i,'')
  .replace(/^PETRO(?:BRAS)?[-_\s]?\d+[-_\s]+Q\d{1,4}[-_\s]+/i,'')
  .replace(/^Q\d{1,4}[-_\s]+/i,'')
  .replace(/[_]+/g,' ').replace(/\s+[-–—]+\s+/g,' — ')
  .replace(/\s+/g,' ').trim();
 if(!s||opaque(s))return '';
 const words=s.split(' ');
 const upperAcronyms=new Set(['NR','NBR','PCMSO','PGR','GRO','EIA','RIMA','RAP','RQD','LSF','ELU','ELS','BDI','PVC','AET','EPC','EPI','CIPA','SESMT','SPT']);
 s=words.map((w,i)=>{
  const clean=w.replace(/[^A-Za-zÀ-ÿ]/g,'');
  if(clean.toUpperCase()==='NRS')return 'NRs';
  if(upperAcronyms.has(clean.toUpperCase())||/^(?:NR|NBR)\d+$/i.test(w)||/^[A-Z]{2,6}(?:\/[A-Z]{2,6})+$/.test(w))return w.toUpperCase().replace(/^NR(?=\d)/,'NR-').replace(/^NBR(?=\d)/,'NBR ');
  if(/^\d+$/.test(w)||w==='—')return w;
  const low=w.toLocaleLowerCase('pt-BR');
  return i===0?low.slice(0,1).toLocaleUpperCase('pt-BR')+low.slice(1):low;
 }).join(' ');
 return s.slice(0,170);
}
function fromV211(rec){
 const title=str(rec.title);
 return {
  title:opaque(title)?'':title,
  area:GROUPS[rec.group]||'',
  subject:str(rec.topic),
  subsubject:str(rec.subtopic),
  group:str(rec.group),
  cards:Array.isArray(rec.cardIds)?rec.cardIds.filter(x=>/^CARD-\d{4,}$/.test(x)):[],
  status:str(rec.sourceStatus),
  basis:str(rec.classificationBasis),
  origin:'V211'
 };
}
function fromV180(rec,previous){
 const prior=previous||{};
 return {
  ...prior,
  title:str(rec.studyTitle||rec.title)||prior.title||'',
  area:str(rec.studyArea)||prior.area||'',
  subject:str(rec.studySubject)||prior.subject||'',
  subsubject:str(rec.studySub)||prior.subsubject||'',
  group:str(rec.group)||prior.group||'',
  cards:prior.cards||[],
  status:str(rec.studyValidation||rec.studyStatus)||prior.status||'',
  origin:'V180 + V211'
 };
}
function fromV310(rec,previous){
 const prior=previous||{};
 // Nunca rebaixar classificação existente, nem mudar vínculos já documentados.
 if(str(prior.subject))return prior;
 if(!str(rec.topic)||!GROUPS[str(rec.group)])return prior;
 const label=str(rec.title);
 return {
  ...prior,
  title:label&&!opaque(label)?label:prior.title||'',
  area:GROUPS[str(rec.group)],
  subject:str(rec.topic),
  subsubject:str(rec.subtopic),
  group:str(rec.group),
  cards:prior.cards||[],
  status:str(rec.sourceStatus),
  basis:str(rec.classificationBasis),
  origin:'V310 — '+(str(rec.classificationBasis).startsWith('inspecao_visual')?'inspeção visual':'nome e pasta')
 };
}
async function load(){
 if(promise)return promise;
 promise=(async()=>{
  const next=new Map(),failed=[];
  const out=await Promise.allSettled(CATALOGS.map(async c=>{
   const r=await fetch(c.url,{cache:'no-store'});
   if(!r.ok)throw Error(c.key+' HTTP '+r.status);
   const data=await r.json();
   if(!Array.isArray(data.records)||data.records.length<70)throw Error(c.key+' sem registros suficientes');
   if(c.key==='V310'&&(data.schema!=='BancoMestreImageTaxonomyV310'||data.records.length!==144))
    throw Error('V310: esquema ou contagem de auditoria divergente');
   return data.records;
  }));
  for(let k=0;k<out.length;k++){
   const got=out[k];
   if(got.status!=='fulfilled'){failed.push(CATALOGS[k].key);continue}
   for(const rec of got.value){
    const id=str(rec.driveFileId);
    if(!ID.test(id))continue;
    if(k===0)next.set(id,fromV211(rec));
    else if(k===1)next.set(id,fromV180(rec,next.get(id)));
    else if(next.has(id))next.set(id,fromV310(rec,next.get(id)));
    // IDs não presentes no catálogo histórico precisam de auditoria antes da inserção.
   }
  }
  if(!next.size)throw Error('Indices de titulos nao puderam ser lidos');
  index=next;lastError=failed.join(', ');
  return {count:index.size,classified:[...index.values()].filter(x=>x.subject).length,partial:failed.length>0};
 })().catch(e=>{promise=null;lastError=e.message;return {count:index.size,error:lastError}});
 return promise;
}
function resolve(file){
 const saved=index.get(str(file?.id))||{};
 const filename=str(file?.name),fallback=friendly(filename);
 const curated=str(saved.title)&&!opaque(saved.title)?friendly(saved.title):'';
 const displayTitle=curated||fallback||'Imagem sem título descritivo';
 const subject=str(saved.subject),subsubject=str(saved.subsubject),area=str(saved.area);
 const classified=Boolean(subject);
 return Object.freeze({
  id:str(file?.id),displayTitle,fileName:filename,
  area,subject,subsubject,group:str(saved.group),
  cards:saved.cards||[],classified,opaqueName:opaque(filename),
  status:classified?'Assunto identificado no índice':'Assunto ainda não classificado',
  origin:str(saved.origin),basis:str(saved.basis),
  sourceStatus:str(saved.status),
  location:str(file?.drivePath)
 });
}
function describe(file){return resolve(file).displayTitle}
window.BM218ImageMetadata=Object.freeze({
 load,resolve,describe,opaque,friendly,
 get error(){return lastError},get count(){return index.size},
 get classifiedCount(){return [...index.values()].filter(x=>x.subject).length}
});
})();


;
/* 43 assets/v306_drive_gallery_search.js */
/* V306: IDs editoriais na busca e prévias privadas nos cartões. */
/* V296: links para gerenciar/excluir no Drive, sem permissão de exclusão no portal. */
/* V228: editor completo de informações acionado em cada original Drive. */
/* V218: nomes legíveis, classificação existente por ID e pendências explícitas. */
/* V217: pasta Drive é a fonte de imagens; nenhuma dependência de catálogo de mídia publicado. */
/* V215: galeria usa a autorização única do leitor, preservando layout da V1. */
/* Banco Mestre V213 — Drive como fonte visual principal, sem publicar fotos no GitHub.
 * Banco Mestre V084 — Imagens privadas do Google Drive, somente leitura.
   Descoberta por pasta após consentimento do proprietário; não publica imagens
   nem substitui os 270 registros históricos do Atlas. */
(function(){
'use strict';
if(window.BancoMestreDriveImagesV182)return;
const FOLDER_ID='1ksSVWrmRaRlDoG4iDtTGvfr2OnPnhnY6';
const ROOTS=[
 {id:FOLDER_ID,path:'Atlas de Imagens'},
 {id:'1pp1CL9oMYVFHPPzv117DZpy1kA-wyJQo',path:'Originais recuperados das conversas P11–P14'}
];
const INTERVAL=120000;
const SCOPE='https://www.googleapis.com/auth/drive.readonly';
const API='https://www.googleapis.com/drive/v3/files';
const MIME=new Set(['image/jpeg','image/png','image/webp','image/gif']);
const SVG='image/svg+xml';
const PREVIEW_MIME=new Set([...MIME,SVG]);
let alreadyPublic=0,expandedOnce=false;
const MAX_BYTES=15000000;
const CONTRACT='assets/v202_storage_contract.json?v=202';
let contractReady=false;
async function assertPaths(){
 const response=await fetch(CONTRACT,{cache:'no-store'});
 if(!response.ok)throw Error('Contrato de pastas indisponível; consulta de imagens bloqueada');
 const c=await response.json();
 const read=c.runtime_scan_roots?.images;
 if(c.schema!=='BancoMestreStorageContractV202'||c.canonical_write_destinations?.images?.folder_id!==FOLDER_ID||
 !Array.isArray(read)||read.length!==ROOTS.length||ROOTS.some((x,i)=>x.id!==read[i]))
  throw Error('Pastas de imagens divergentes entre portal e contrato. Nenhuma lista será substituída.');
 contractReady=true;return c;
}
let access='',expires=0,oauth=null,checking=false,photos=[],visible=24;
let lastGoodAt=0,lastAttemptAt=0,lastSyncError='';
const normalize=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const blobs=new Map(); // URLs somente em memória do navegador
const aliases=new Map();let aliasPromise=null;
function loadAliases(){
 if(aliasPromise)return aliasPromise;
 aliasPromise=fetch('assets/v211_published_images.json?v=211',{cache:'default'})
 .then(r=>{if(!r.ok)throw Error('Índice de IDs de imagens indisponível');return r.json()})
 .then(data=>{
  if(data.schema!=='BancoMestrePublishedDriveImagesV211'||!Array.isArray(data.records)||data.records.length<200)throw Error('Índice de imagens incompatível');
  for(const x of data.records)if(/^[A-Za-z0-9_-]{15,}$/.test(x.driveFileId||'')&&/^IMG-[A-Z0-9_-]+$/.test(x.imageId||''))aliases.set(x.driveFileId,x);
  render();return aliases;
 }).catch(e=>{console.warn('Índice editorial:',e);return aliases});
 return aliasPromise;
}
const $=id=>document.getElementById(id);
function msg(s,error){const el=$('bm084-status');if(el){el.textContent=s;el.style.color=error?'#953b32':'#315e57';}}
function el(tag,cls,text){const x=document.createElement(tag);if(cls)x.className=cls;if(text!==undefined)x.textContent=text;return x;}
function currentToken(){return (access&&Date.now()<expires?access:'')||window.BancoMestreMediaSyncV182?.token?.()||'';}
function validToken(){return Boolean(currentToken());}
function idOf(file){return 'DRIVE-IMG-'+file.id;}
function fileLink(file){return 'https://drive.google.com/file/d/'+encodeURIComponent(file.id)+'/view';}
function info(file){return window.BM228DriveImageEditor?.meta?.(file)||window.BM218ImageMetadata?.resolve?.(file)||{displayTitle:String(file.name||'Imagem').replace(/\.(png|jpe?g|webp|gif|svg)$/i,'').replace(/_/g,' '),fileName:file.name||'',area:'',subject:'',subsubject:'',group:'',cards:[],classified:false,status:'Assunto ainda não classificado',location:file.drivePath||''};}
function title(file){return info(file).displayTitle;}
function moveToAtlas(box){
 const dir=$('bm153Directory');if(!dir)return false;
 const heading=dir.querySelector('.bm153Heading');
 if(heading)heading.after(box);else dir.prepend(box);
 return true;
}
function ui(){
 const host=$('imagens')?.querySelector('.panel');if(!host||$('bm084-sync'))return;
 const box=el('details','bm153Group bm205DriveGroup');box.id='bm084-sync';
 const summary=el('summary','bm205DriveSummary');summary.id='bm205-drive-summary';
 const title=el('strong','','Google Drive · imagens novas no Atlas');
 const badge=el('span','','Conecte o Drive');badge.id='bm205-drive-count';
 summary.append(title,badge);
 const body=el('div','bm153GroupBody bm205DriveBody');
 const help=el('p','','Originais das pastas autorizadas do Drive. Para excluir uma imagem, clique em Abrir no Drive e escolha Mover para a lixeira no Google Drive. Nenhum original é publicado no GitHub.');
 help.style.cssText='font-size:12px;margin:0 0 9px;color:#526c6a';
 const controls=el('div','');controls.style.cssText='display:flex;flex-wrap:wrap;align-items:center;gap:7px';
 const connect=el('button','','Conectar Drive');connect.type='button';connect.id='bm084-connect';connect.disabled=true;
 const refresh=el('button','','Atualizar imagens');refresh.type='button';refresh.id='bm084-refresh';refresh.disabled=true;
 const folder=el('a','','Pasta oficial');folder.href='https://drive.google.com/drive/folders/'+FOLDER_ID;folder.target='_blank';folder.rel='noopener noreferrer';
 const recovered=el('a','','Originais históricos');recovered.href='https://drive.google.com/drive/folders/'+ROOTS[1].id;recovered.target='_blank';recovered.rel='noopener noreferrer';
 const search=el('input','');search.id='bm084-search';search.type='search';search.placeholder='Filtrar imagens do Drive';search.setAttribute('aria-label','Buscar imagens autenticadas no Atlas');search.style.cssText='padding:7px 9px;border:1px solid #bacdc7;border-radius:6px;max-width:210px';
 controls.append(connect,refresh,folder,recovered,search);
 const status=el('p','','Aguardando conexão. As imagens públicas continuam disponíveis.');
 const syncTime=el('small','','Nenhuma consulta autorizada nesta sessão.');syncTime.id='bm207-sync-time';syncTime.style.cssText='display:block;font-size:11px;color:#516a68;margin:4px 0 9px';status.id='bm084-status';status.setAttribute('role','status');status.style.cssText='font-size:12px;margin:9px 0';
 const grid=el('div','');grid.id='bm084-grid';grid.style.cssText='display:grid;grid-template-columns:repeat(auto-fill,minmax(min(100%,180px),1fr));gap:10px';
 const more=el('button','','Mostrar mais imagens');more.type='button';more.id='bm084-more';more.hidden=true;more.style.marginTop='10px';
 body.append(help,controls,status,syncTime,grid,more);box.append(summary,body);
 if(!moveToAtlas(box)){
  host.append(box);
  const observer=new MutationObserver(()=>{if(moveToAtlas(box))observer.disconnect()});
  observer.observe(host,{childList:true,subtree:true});
 }
 connect.onclick=()=>{
  if(validToken()){void refreshList(true);return;}
  if(window.BancoMestreDriveV042?.ready){window.BancoMestreDriveV042.authorize();return;}
  msg('Conexão Google ainda não está pronta. Tente novamente.',true);
 }; // V215: uma autorização compartilhada pelo leitor Drive; sem popup próprio por imagem.
 refresh.onclick=()=>{void refreshList(true);};
 search.oninput=()=>{visible=24;render();};
 more.onclick=()=>{visible+=24;render();};
 $('imageSearch')?.addEventListener('input',()=>{visible=24;render()});
 document.addEventListener('bm218-image-filter-change',()=>{visible=24;render();});
 document.addEventListener('bm153-drive-filter-change',()=>{visible=24;render();});
 for(const id of ['imageFilter','imageAreaV044','bm155DisciplinaImagem','bm155AssuntoGeralImagem','bm155AssuntoEspecificoImagem','bm155SubassuntoImagem'])
  $(id)?.addEventListener('change',()=>{visible=24;render()});
}
function loadGIS(){return new Promise((resolve,reject)=>{
 if(window.google?.accounts?.oauth2){resolve();return;}
 const js=document.createElement('script');js.src='https://accounts.google.com/gsi/client';js.async=true;js.onload=resolve;js.onerror=()=>reject(Error('Google Identity Services indisponível'));document.head.append(js);
});}
async function init(){
 ui();if(!$('bm084-sync'))return;
 try{
  await assertPaths();
  await window.BM218ImageMetadata?.load?.(); // Metadados textuais, sem arquivos de imagem do GitHub.
   void loadAliases();
  const response=await fetch('assets/drive_auth_v038.json',{cache:'no-store'});
  if(!response.ok)throw Error('Configuração OAuth indisponível');
  const conf=await response.json();if(!conf.client_id||!conf.client_id.endsWith('.apps.googleusercontent.com'))throw Error('OAuth Client ID inválido');
   if(conf.authorized_javascript_origin&&location.origin!==conf.authorized_javascript_origin)throw Error('Origem divergente da registrada no OAuth: '+location.origin);
  await loadGIS();
  oauth=google.accounts.oauth2.initTokenClient({client_id:conf.client_id,scope:SCOPE,callback:result=>{
   if(result.error||!result.access_token){lastSyncError=String(result.error_description||result.error||'sem token');msg('Autorização Google não concluída: '+lastSyncError+'. Verifique permissões e origem OAuth; imagens preservadas.',true);return;}
   access=result.access_token;expires=Date.now()+Math.max(60,Number(result.expires_in||3600)-90)*1000;
   window.BancoMestreMediaSyncV182?.publishToken(access,Number(result.expires_in||3600));
   $('bm084-refresh').disabled=false;void refreshList(true);
  },error_callback:e=>{lastSyncError=String(e?.message||e?.type||e?.error||'janela de acesso bloqueada');msg('Falha ao autorizar o Drive: '+lastSyncError+'. Se aparecer origin_mismatch, cadastre https://carlosemichelon.github.io no Google Cloud.',true);}});
  $('bm084-connect').disabled=false;
  document.addEventListener('bm-media-drive-authorized',()=>{
   if(validToken()&&!checking&&(!lastGoodAt||!photos.length)){$('bm084-refresh').disabled=false;const button=$('bm084-connect');if(button)button.textContent='Drive conectado';void refreshList(false)}
  });
  if(validToken())void refreshList(false);
  else msg('Conecte o Drive uma vez ao abrir o site para consultar imagens e PDFs sem autorizar cada arquivo.');
  // V326: sem buscar novamente o Atlas por foco, retorno à aba ou intervalo.
  // Expiração remove apenas prévias privadas em memória, sem consultar o Drive.
  const expirePrivatePreviews=()=>{
   if(validToken()||!(access||photos.length||blobs.size))return;
   access='';expires=0;
   for(const data of blobs.values())URL.revokeObjectURL(data.url);
   blobs.clear();photos=[];alreadyPublic=0;lastGoodAt=0;
   if($('bm084-refresh'))$('bm084-refresh').disabled=true;
   render();
   msg('Sessão expirada. Pré-visualizações privadas foram retiradas desta página; reconecte para consultar o Drive.',true);
  };
  window.addEventListener('focus',expirePrivatePreviews);
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)expirePrivatePreviews()});
  setInterval(expirePrivatePreviews,INTERVAL);
 }catch(e){msg('Sincronização indisponível: '+e.message,true);}
}
async function authorized(url){
 if(!validToken())throw Error('Conexão expirada; reconecte o Google Drive');
 const r=await fetch(url,{headers:{Authorization:'Bearer '+currentToken()},cache:'no-store'});
 if(r.status===401)throw Error('Autorização expirada');
 if(r.status===403)throw Error('Conta conectada não possui acesso à pasta/imagem');
 if(!r.ok)throw Error('Google Drive HTTP '+r.status);
 return r;
}
function historicalDriveIds(){
 // Metadados opcionais de vínculos dos cartões; não impedem novas imagens no Drive.
 const ids=new Set();
 if(typeof imgs!=='undefined'&&Array.isArray(imgs)){
  for(const item of imgs){
   const id=item.driveFileId;
   if(typeof id==='string'&&/^[A-Za-z0-9_-]{15,}$/.test(id))ids.add(id);
  }
 }
 return ids;
}
async function listImages(){
 if(!contractReady)await assertPaths();
 // V184: a pasta Atlas contém coleções P11–P14 em SUBPASTAS.
 // A antiga varredura consultava apenas arquivos diretamente na raiz.
 const FOLDER='application/vnd.google-apps.folder';
 const queue=ROOTS.map(x=>({...x}));
 const visited=new Set(),unique=new Map();
 let skippedSvg=0,skippedLarge=0;
 for(let offset=0;offset<queue.length;offset++){
  const folder=queue[offset];
  if(visited.has(folder.id))continue;
  visited.add(folder.id);
  if(visited.size>300)throw Error('Mais de 300 pastas no Atlas; varredura interrompida e acervo preservado');
  let next='',pages=0;
  do{
   if(++pages>20)throw Error('Pasta com paginação excessiva');
   const q=new URLSearchParams({
    q:"'"+folder.id+"' in parents and trashed = false",
    fields:'nextPageToken,files(id,name,mimeType,size,modifiedTime)',
    pageSize:'1000',supportsAllDrives:'true',includeItemsFromAllDrives:'true'
   });
   if(next)q.set('pageToken',next);
   const response=await authorized(API+'?'+q.toString());
   const data=await response.json();
   for(const f of data.files||[]){
    if(!f?.id||!f.name)continue;
    if(f.mimeType===FOLDER){
     if(!visited.has(f.id))queue.push({id:f.id,path:folder.path+' / '+f.name});
     continue;
    }
    if(!/^[A-Za-z0-9_-]{15,}$/.test(f.id))continue;
    if(!PREVIEW_MIME.has(f.mimeType))continue;
    if(f.mimeType===SVG)skippedSvg++;
    if(Number(f.size||0)>MAX_BYTES){skippedLarge++;continue;}
    if(!unique.has(f.id))unique.set(f.id,{...f,drivePath:folder.path});
    if(unique.size>1500)throw Error('Mais de 1500 imagens; divida o acervo antes de sincronizar');
   }
   next=data.nextPageToken||'';
  }while(next);
 }
 const publicIds=historicalDriveIds();
 const allFiles=[...unique.values()]; // A fonte é o Drive: não descartar as imagens já catalogadas no site.
 return {files:allFiles.sort((a,b)=>
  a.drivePath.localeCompare(b.drivePath,'pt-BR')||a.name.localeCompare(b.name,'pt-BR')),
  alreadyPublic:[...unique.keys()].filter(id=>publicIds.has(id)).length,
  skippedSvg,skippedLarge,folders:visited.size};
}
/* A resposta alt=media pode chegar como application/octet-stream ou text/plain.
 * SVG é verificado e exibido como imagem, sem injetar HTML no documento.
 */
async function safeSvgPreview(raw){
 const xmlText=await raw.text();
 const doc=new DOMParser().parseFromString(xmlText,'image/svg+xml');
 const root=doc.documentElement;
 if(!root||String(root.localName||'').toLowerCase()!=='svg'||doc.querySelector('parsererror'))
  throw Error('Arquivo SVG inválido ou não é um desenho SVG');
 const banned=new Set(['script','foreignobject','iframe','object','embed','audio','video','animate','animatemotion','animatetransform','set']);
 for(const node of [root,...root.querySelectorAll('*')]){
  const tag=String(node.localName||'').toLowerCase();
  if(banned.has(tag)){node.remove();continue;}
  if(tag==='style'){
   node.textContent=String(node.textContent||'')
    .replace(/@import[^;]*;/gi,'')
    .replace(/url\(\s*(?!['"]?#)[^)]*\)/gi,'none');
  }
  for(const attr of [...node.attributes]){
   const name=attr.name.toLowerCase(),value=attr.value.trim();
   const internalRef=value.startsWith('#')||
     /^data:image\/(?:png|jpe?g|webp|gif);base64,[A-Za-z0-9+/=]+$/i.test(value);
   if(name.startsWith('on')||/javascript:/i.test(value)||
      ((name==='href'||name==='xlink:href')&&!internalRef)||
      /@import/i.test(value)||
      /url\(\s*(?!['"]?#)[^)]*\)/i.test(value))node.removeAttribute(attr.name);
  }
 }
 const xml=new XMLSerializer().serializeToString(root);
 return new Blob([xml],{type:SVG});
}
async function getImageUrl(file){
 if(!validToken())throw Error('Reconecte o Drive para abrir a imagem');
 const prior=blobs.get(file.id);
 if(prior&&prior.modified===file.modifiedTime)return prior.url;
 if(!PREVIEW_MIME.has(file.mimeType))throw Error('Formato não suportado nesta imagem');
 const r=await authorized(API+'/'+encodeURIComponent(file.id)+'?alt=media');
 const blob=await r.blob();
 if(blob.size>MAX_BYTES)throw Error('Imagem maior que 15 MB');
 const contentType=String(blob.type||'').toLowerCase();
 const compatible=contentType===file.mimeType||!contentType||
   contentType==='application/octet-stream'||
   (file.mimeType===SVG&&['text/plain','text/xml','application/xml'].includes(contentType));
 if(!compatible)throw Error('Conteúdo diferente do arquivo do Drive ('+contentType+')');
 const previewBlob=file.mimeType===SVG?await safeSvgPreview(blob):
  (contentType===file.mimeType?blob:new Blob([blob],{type:file.mimeType}));
 const url=URL.createObjectURL(previewBlob);
 if(prior)URL.revokeObjectURL(prior.url);
 blobs.set(file.id,{url,modified:file.modifiedTime});
 return url;
}
async function openImage(file){
 try{
  msg('Abrindo imagem '+title(file)+'...');
  const src=await getImageUrl(file);
  const image=new Image();image.src=src;await image.decode();
  if(typeof BancoMestreEditorV030?.open==='function'){
   await BancoMestreEditorV030.open({image,imageId:idOf(file),title:title(file),
    quality:'Arquivo original autenticado do Google Drive — '+file.mimeType,
    sourceUrl:fileLink(file),
    warning:'Grifos deste ID são salvos apenas neste navegador. O Drive e os IDs dos registros existentes permanecem intactos.'});
  }else window.open(src,'_blank','noopener,noreferrer');
  msg('Imagem aberta. Marcações locais preservadas pelo ID '+idOf(file)+'.');
 }catch(e){msg('Não foi possível abrir: '+e.message+'. Use Original no Drive.',true);}
}
function loadPreview(img,file){
 if(!validToken())return;
 getImageUrl(file).then(url=>{if(img.isConnected)img.src=url;}).catch(e=>{
  if(img.isConnected){img.alt='Prévia indisponível: '+e.message;img.title=e.message+' · Abrir original no Drive';}
 });
}
function syncMetaFilters(){
 const area=$('bm218-area-filter'),subject=$('bm218-subject-filter');
 if(!area||!subject)return;
 const metas=photos.map(info);
 const areas=[...new Set(metas.filter(m=>m.classified&&m.area).map(m=>m.area))].sort((a,b)=>a.localeCompare(b,'pt-BR'));
 const selectedArea=area.value,selectedSubject=subject.value;
 area.replaceChildren(new Option('Todas as disciplinas','all'),...areas.map(x=>new Option(x,x)));
 if(areas.includes(selectedArea))area.value=selectedArea;
 const subjects=[...new Set(metas.filter(m=>m.classified&&m.subject&&(area.value==='all'||m.area===area.value)).map(m=>m.subject))]
  .sort((a,b)=>a.localeCompare(b,'pt-BR'));
 subject.replaceChildren(new Option('Todos os assuntos','all'),...subjects.map(x=>new Option(x,x)));
 if(subjects.includes(selectedSubject))subject.value=selectedSubject;
}
function legacyFilterMatch(m){
 // Never compare public Atlas classification IDs with Drive metadata labels.
 return window.BM153ImageLibrary?.driveMatches?.(m)!==false;
}
function render(){
 const grid=$('bm084-grid');if(!grid)return;grid.replaceChildren();
 if(lastGoodAt||photos.length)window.BM153ImageLibrary?.setDriveRecords?.(photos.map(info));
 syncMetaFilters();
 const q=normalize($('bm084-search')?.value||''),mainQuery=normalize($('imageSearch')?.value||'');
 const selectedArea=$('bm218-area-filter')?.value||'all';
 const selectedSubject=$('bm218-subject-filter')?.value||'all';
 const selectedStatus=$('bm218-status-filter')?.value||'all';
 const onlyFavorites=$('imageFavoriteV055')?.value==='favorites';
 const items=photos.filter(f=>{
  const m=info(f),alias=aliases.get(f.id);
  const hay=normalize([f.id,f.name,f.drivePath,idOf(f),alias?.imageId,alias?.title,...(alias?.cardIds||[]),...(alias?.questionRefs||[]),m.displayTitle,m.area,m.subject,m.subsubject,m.detail,m.description,m.note,...m.cards].join(' '));
  // Um ID editorial completo tem precedência sobre filtros auxiliares recolhidos.
  // Continua exigindo o arquivo original na lista autenticada do Drive.
  if(mainQuery&&alias&&normalize(alias.imageId)===mainQuery)return !q||hay.includes(q);
  if(onlyFavorites)return false;
  if(selectedArea!=='all'&&m.area!==selectedArea)return false;
  if(selectedSubject!=='all'&&m.subject!==selectedSubject)return false;
  if(selectedStatus==='classified'&&!m.classified)return false;
  if(selectedStatus==='pending'&&m.classified)return false;
  if(!legacyFilterMatch(m))return false;
  if(window.BM197MediaLinks?.matchesDrive?.(f)===false)return false;
  return hay.includes(q)&&hay.includes(mainQuery);
 });
 for(const file of items.slice(0,visible)){
  const m=info(file);
  const card=el('article','');
  card.style.cssText='background:white;border:1px solid #d5e2dd;border-radius:9px;padding:10px;min-width:0';
  card.dataset.bm218Classified=String(m.classified);
  const pic=el('img','');
  pic.loading='lazy';pic.alt='Prévia de '+m.displayTitle;
  pic.style.cssText='width:100%;height:140px;object-fit:contain;background:#f8faf8;border-radius:5px;cursor:zoom-in';
  pic.onclick=()=>{void openImage(file)};
  const h=el('h4','',m.displayTitle);h.style.cssText='font-size:13px;line-height:1.3;margin:7px 0;overflow-wrap:anywhere';
  const category=el('div','',m.classified?[m.area,m.subject,m.subsubject].filter(Boolean).join(' / '):'Assunto pendente de classificação');
  category.style.cssText='font-size:11px;color:#436469;margin:5px 0;overflow-wrap:anywhere';
  const actions=el('div','');actions.style.cssText='display:flex;gap:8px;flex-wrap:wrap;margin-top:8px';
  const open=el('button','','Abrir imagem');open.type='button';open.style.fontSize='12px';open.onclick=()=>{void openImage(file)};
  const link=el('a','','Abrir no Drive');link.href=fileLink(file);link.target='_blank';link.rel='noopener noreferrer';link.title='Abrir o original no Google Drive para gerenciar ou mover para a lixeira';link.setAttribute('aria-label','Abrir '+m.displayTitle+' no Google Drive para gerenciar ou excluir pela lixeira');link.style.fontSize='12px';
  actions.append(open,link);
  const details=el('details','');
  details.style.cssText='font-size:10px;color:#62787b;margin-top:7px;overflow-wrap:anywhere';
  const summary=el('summary','','Nome original e identificador');
  const technical=el('div','','Arquivo: '+m.fileName+' | ID Drive: '+file.id+' | Pasta: '+(file.drivePath||'Atlas'));
  details.append(summary,technical);
  const linked=m.cards.length?el('small','',m.cards.length+' cartão(ões) relacionado(s) no índice'):null;
  if(linked)linked.style.cssText='display:block;font-size:10px;color:#52666a;margin-top:4px';
  const alias=aliases.get(file.id);
  const editorial=alias?.imageId?el('small','',alias.imageId+' · ID editorial do arquivo no Drive'):null;
  if(editorial)editorial.style.cssText='display:block;font-size:11px;color:#235c80;font-weight:700;margin:3px 0';
  card.append(pic,h,...(editorial?[editorial]:[]),category,...(linked?[linked]:[]),actions,details);
  if(window.BM228DriveImageEditor?.decorate)window.BM228DriveImageEditor.decorate(card,file);else window.BM197MediaLinks?.decorateDrive?.(card,file);
  grid.append(card);
  loadPreview(pic,file);
 }
 const more=$('bm084-more');if(more)more.hidden=items.length<=visible;
 const badge=$('bm205-drive-count');if(badge){
  const n=photos.filter(f=>info(f).classified).length;
  badge.textContent=validToken()?photos.length+' imagens · '+n+' com assunto · '+(photos.length-n)+' pendentes':'Conecte o Drive';
 }
 document.dispatchEvent(new CustomEvent('bm209-drive-render',{detail:{
  shown:Math.min(items.length,visible),matching:items.length,available:photos.length,
  classified:photos.filter(f=>info(f).classified).length
 }}));
}
let bm263InFlight=null;
 function refreshList(force){
  if(bm263InFlight)return bm263InFlight;
  bm263InFlight=refreshListInner(force).finally(()=>{bm263InFlight=null});
  return bm263InFlight;
 }
 async function refreshListInner(force){
 if(checking)return;if(!validToken()){msg('Conecte sua conta Google para sincronizar imagens.',true);return;}
 checking=true;lastAttemptAt=Date.now();const button=$('bm084-refresh');if(button)button.disabled=true;
 try{
  msg('Consultando Atlas e originais recuperados no Drive autorizado…');
  const {files:incoming,alreadyPublic:publicCount,skippedSvg,skippedLarge,folders}=await listImages();
  alreadyPublic=publicCount;
  const old=new Map(photos.map(x=>[x.id,x.modifiedTime]));
  const current=new Set(incoming.map(x=>x.id));
  let newCount=incoming.filter(x=>!old.has(x.id)).length;
  let edits=incoming.filter(x=>old.has(x.id)&&old.get(x.id)!==x.modifiedTime).length;
  for(const [id,data] of blobs)if(!current.has(id)||incoming.find(x=>x.id===id)?.modifiedTime!==data.modified){URL.revokeObjectURL(data.url);blobs.delete(id);}
  photos=incoming;
  lastGoodAt=Date.now();lastSyncError=''; // Só ativar modo Drive após consulta bem-sucedida.
  render();
  const group=$('bm084-sync');if(group&&!expandedOnce&&incoming.length){group.open=true;expandedOnce=true;}const stamp=$('bm207-sync-time');if(stamp)stamp.textContent='Última atualização validada: '+new Date(lastGoodAt).toLocaleString('pt-BR')+' · '+folders+' pastas lidas';
   msg('Drive consultado: '+photos.length+' imagens originais; '+newCount+' novas desde a última consulta; '+edits+' alteradas; '+folders+' pastas verificadas. '+skippedSvg+' SVG(s), '+skippedLarge+' imagens acima de 15 MB omitidas. Nenhuma imagem é copiada ao GitHub.');
  return {found:photos.length,alreadyPublic:publicCount,added:newCount,updated:edits,skippedSvg,skippedLarge,folders,scope:'atlas_authenticated_session_only'};
 }catch(e){lastSyncError=e.message;const stamp=$('bm207-sync-time');if(stamp)stamp.textContent='Erro atual: '+lastSyncError+(lastGoodAt?' · consulta anterior: '+new Date(lastGoodAt).toLocaleString('pt-BR'):'');msg('Falha na sincronização: '+e.message+'. Imagens carregadas anteriormente preservadas.',true);return null;}
 finally{checking=false;if(button&&validToken())button.disabled=false;}
}
async function getLinkedImageUrl(fileId){
 if(!/^[A-Za-z0-9_-]{15,}$/.test(fileId))throw Error('ID Drive da imagem inválido');
 if(!validToken())throw Error('Conecte o Google Drive para carregar a imagem dentro do cartão.');
 let file=photos.find(x=>x.id===fileId);
 if(!file){
  await loadAliases();
  if(!aliases.has(fileId))throw Error('Imagem não consta do índice editorial do portal');
  const response=await authorized(API+'/'+encodeURIComponent(fileId)+'?fields=id,name,mimeType,size,modifiedTime,trashed');
  const meta=await response.json();
  if(meta.trashed||!PREVIEW_MIME.has(meta.mimeType)||Number(meta.size||0)>MAX_BYTES)throw Error('Original indisponível ou formato incompatível');
  file=meta;
 }
 return getImageUrl(file);
}
window.BancoMestreDriveImagesV182=Object.freeze({
 refresh:()=>refreshList(true),get connected(){return validToken()},
 getImageUrlForCard:getLinkedImageUrl,getEditorialId:fileId=>aliases.get(fileId)?.imageId||'',
 syncVersion:'V306',get lastSuccess(){return lastGoodAt?new Date(lastGoodAt).toISOString():null},
 get lastError(){return lastSyncError},get roots(){return ROOTS.map(x=>x.path)},
 get lastCount(){return photos.length},get alreadyPublic(){return alreadyPublic},get atlasMode(){return 'drive_only'}
});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{void init()},{once:true});else void init();
})();

;
/* 44 assets/v180_image_bridge.js */
/* V180 — acrescenta, sem reformatar, imagens recuperadas ao Atlas original. */
(function(){
 'use strict';
 const FILE='assets/v180_native_image_additions.json?v=180';
 let promise=null;
 async function add(images){
  if(!Array.isArray(images))throw Error('Atlas sem lista de imagens');
  if(images.length===179)return {added:0,total:179,already:true};
  if(images.length!==86)throw Error('Atlas original inesperado: '+images.length);
  if(!promise)promise=(async()=>{
   const response=await fetch(FILE,{cache:'no-store'});
   if(!response.ok)throw Error('Índice de imagens recuperadas HTTP '+response.status);
   const pack=await response.json();
   if(pack.schema!=='BancoMestreNativeImageAdditionsV180'||pack.historical_count!==86||
      pack.records?.length!==93)throw Error('Índice incompleto ou incompatível');
   const current=new Set(images.map(x=>x.no));
   const next=new Set(pack.records.map(x=>x.no));
   if(next.size!==93||[...next].some(x=>current.has(x)))throw Error('IDs de mídia repetidos');
   if(!pack.records.every(x=>/^IMG-C1[1234]-\d{3}$/.test(x.no)&&
      /^https:\/\/drive\.google\.com\/file\/d\/[A-Za-z0-9_-]{15,}\/view$/.test(x.source_url)&&
      x.studySubject&&x.studySub&&x.studyArea&&x.group&&x.external))throw Error('Imagem ou classificação inválida');
   images.push(...pack.records.map(x=>({...x})));
   return {added:93,total:images.length};
  })().catch(e=>{
   promise=null;
   console.warn('Imagens das conversas indisponíveis, acervo antigo preservado:',e);
   const n=document.querySelector('#imagens .notice');
   if(n)n.textContent+=' As imagens recuperadas não puderam ser consultadas neste momento: '+e.message+'.';
   return {added:0,total:images.length,error:e.message};
  });
  return promise;
 }
 window.BM180ImageBridge=Object.freeze({add});
})();

;
/* 45 assets/v097_pdf_selection_core.js */
/* V097 — unificação conservadora de palavras fragmentadas em PDF digital. */
/* Banco Mestre V089 — selection precision engine.
 * Geometry from PDF textContent, not browser DOM selection. Never crosses detected columns.
 * Pure functions, no localStorage, no mutation of PDF/marks. */
(function(){
'use strict';
if(window.BancoMestrePreciseCoreV089)return;
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const finite=x=>Number.isFinite(x);
const validBox=w=>[w.x0,w.x1,w.y0,w.y1].every(finite)&&w.x0<w.x1&&w.y0<w.y1;
function buildWords(content,viewport,util,canvas){
 if(!Array.isArray(content?.items)||!viewport?.width||!viewport?.height||!util?.transform)return [];
 const measure=canvas?.getContext?.('2d'),words=[];
 for(const [runIndex,item] of content.items.entries()){
  if(!item?.str||!Array.isArray(item.transform)||item.transform.length!==6||!finite(item.width))continue;
  const mat=util.transform(viewport.transform,item.transform);
  const fontHeight=Math.hypot(mat[2],mat[3]);
  if(!finite(fontHeight)||fontHeight<2||fontHeight>viewport.height*.15||Math.abs(mat[1])>fontHeight*.15)continue;
  const style=content.styles?.[item.fontName]||{};
  const ascent=finite(style.ascent)?style.ascent:finite(style.descent)?1+style.descent:.8;
  const left=mat[4],top=mat[5]-clamp(ascent,.35,1.2)*fontHeight;
  const width=item.width*viewport.scale;
  if(!finite(width)||width<=0||width>viewport.width*.9)continue;
  // Remover caracteres invisíveis que dividem palavras na transcrição.
  const line=item.str.replace(/\u00a0/gu,' ').replace(/[\u200b\u200c\u200d\u2060\ufeff]/gu,'');
  if(!line.trim())continue;
  let widths=null,total=0;
  if(measure){
   try{
    measure.font=fontHeight+'px '+(style.fontFamily||'sans-serif');
    total=measure.measureText(line).width;
    if(total>0){
     widths=Array(line.length+1);widths[0]=0;
     for(let k=1;k<=line.length;k++)widths[k]=measure.measureText(line.slice(0,k)).width;
    }
   }catch{widths=null}
  }
  for(const match of line.matchAll(/\S+/gu)){
   const a=match.index,b=a+match[0].length;
   const x0=left+width*(widths?widths[a]/total:a/line.length);
   const x1=left+width*(widths?widths[b]/total:b/line.length);
   if(x1-x0<.45||x0>viewport.width||x1<0||top>viewport.height||top+fontHeight<0)continue;
   const word={text:match[0],x0:clamp(x0,0,viewport.width),x1:clamp(x1,0,viewport.width),
    y0:clamp(top,0,viewport.height),y1:clamp(top+fontHeight*1.05,0,viewport.height),
    runIndex,fontHeight,
    openLeft:a===0&&!/^\s/u.test(line),
    openRight:b===line.length&&!/\s$/u.test(line)&&item.hasEOL!==true};
   if(validBox(word))words.push(word);
   if(words.length>6000)return [];
  }
 }
 // Unir fragmentos da MESMA palavra, apenas quando os runs são contíguos.
 // Preserva as fronteiras de colunas e o comportamento de clique/arrasto.
 const merged=[];
 for(const word of words){
  const prev=merged[merged.length-1],h=Math.min(prev?.fontHeight||0,word.fontHeight||0);
  const gap=prev?word.x0-prev.x1:Infinity;
  const sameBaseline=prev&&Math.abs((prev.y0+prev.y1)-(word.y0+word.y1))/2<=h*.20;
  if(prev&&prev.runIndex!==word.runIndex&&prev.openRight&&word.openLeft&&
    /[\p{L}\p{N}]$/u.test(prev.text)&&/^[\p{L}\p{N}]/u.test(word.text)&&
    Math.abs(prev.fontHeight-word.fontHeight)<=h*.12&&sameBaseline&&
    gap>=-h*.035&&gap<=Math.min(.75,h*.07)&&prev.text.length+word.text.length<=80){
    prev.text+=word.text;prev.x1=word.x1;prev.y0=Math.min(prev.y0,word.y0);
    prev.y1=Math.max(prev.y1,word.y1);prev.openRight=word.openRight;
  }else merged.push({...word});
 }
 return merged;
}
function detectColumns(words,width,height){
 if(!words?.length||width<120)return [0,width];
 const usable=words.filter(w=>validBox(w)&&w.y0>height*.16&&w.y1<height*.95&&
  w.x1-w.x0<width*.24);
 if(usable.length<75)return [0,width];
 // Occupancy by text line, tolerant of a few long PDF font runs.
 const heights=usable.map(w=>w.y1-w.y0).sort((a,b)=>a-b);
 const median=heights[Math.floor(heights.length/2)],rows=[];
 for(const word of [...usable].sort((a,b)=>(a.y0+a.y1)-(b.y0+b.y1))){
  const y=(word.y0+word.y1)/2,last=rows.at(-1);
  if(last&&Math.abs(y-last.y)<=Math.max(2,median*.52)){
   last.words.push(word);last.y=(last.y*(last.words.length-1)+y)/last.words.length;
  }else rows.push({y,words:[word]});
 }
 const bins=new Uint16Array(Math.ceil(width)+1);
 for(const row of rows){
  const active=new Uint8Array(bins.length);
  for(const word of row.words){
   const x0=clamp(Math.floor(word.x0),0,bins.length-1),
    x1=clamp(Math.ceil(word.x1),0,bins.length-1);
   active.fill(1,x0,x1);
  }
  for(let i=0;i<bins.length;i++)bins[i]+=active[i];
 }
 const allowedNoise=Math.floor(rows.length*.24);
 const gaps=[];let start=-1;
 for(let x=0;x<=width+1;x++){
  const occupied=x>=bins.length||bins[x]>allowedNoise;
  if(!occupied&&start<0)start=x;
  if(occupied&&start>=0){
   if(x-start>=Math.max(5,width*.012)&&start>width*.16&&x<width*.84)gaps.push({start,end:x,center:(start+x)/2});
   start=-1;
  }
 }
 // Real column gutters must separate substantial vertical reading bands.
 const best=[];
 for(const gap of gaps){
  const c=gap.center;
  if(best.some(x=>Math.abs(x-c)<width*.14))continue;
  const minRegion=width*.18;
  const candidates=[...best,c].sort((a,b)=>a-b);
  const cuts=[0,...candidates,width];
  if(cuts.some((x,i)=>i&&x-cuts[i-1]<minRegion))continue;
  const sizes=cuts.slice(1).map((right,i)=>usable.filter(w=>(w.x0+w.x1)/2>=cuts[i]&&
    (w.x0+w.x1)/2<right).length);
  if(sizes.some(n=>n<45))continue;
  best.push(c);
  if(best.length===3)break;
 }
 return [0,...best.sort((a,b)=>a-b),width];
}
function columnIndex(word,cuts){
 const x=(word.x0+word.x1)/2;
 for(let i=0;i<cuts.length-1;i++)if(x>=cuts[i]&&x<cuts[i+1])return i;
 return cuts.length-2;
}
function readingOrder(words,cuts){
 const result=[],columns=cuts.length-1;
 for(let col=0;col<columns;col++){
  const arr=words.filter(w=>columnIndex(w,cuts)===col).sort((a,b)=>
    ((a.y0+a.y1)-(b.y0+b.y1))||a.x0-b.x0);
  if(!arr.length)continue;
  const median=[...arr].map(x=>x.y1-x.y0).sort((a,b)=>a-b)[Math.floor(arr.length/2)];
  const lines=[];
  for(const w of arr){
   const mid=(w.y0+w.y1)/2,last=lines.at(-1);
   if(last&&Math.abs(mid-last.y)<=Math.max(1.75,median*.55)){
    last.words.push(w);last.y=(last.y*(last.words.length-1)+mid)/last.words.length;
   }else lines.push({y:mid,words:[w]});
  }
  for(let li=0;li<lines.length;li++){
   const line=lines[li];
   line.words.sort((a,b)=>a.x0-b.x0);
   for(const w of line.words)result.push({...w,column:col,line:li});
  }
 }
 return result;
}
function nearest(words,x,y,col=null){
 let best=null,score=Infinity;
 for(const w of words){
  if(col!==null&&w.column!==col)continue;
  const dx=Math.max(0,w.x0-x,x-w.x1),dy=Math.max(0,w.y0-y,y-w.y1),h=w.y1-w.y0;
  if(dx>Math.max(14,h*2.2)||dy>Math.max(9,h*1.6))continue;
  const candidate=dy*dy*2.5+dx*dx;
  if(candidate<score){score=candidate;best=w}
 }
 return best;
}
function selectRange(ordered,start,end,limits={}){
 if(!Array.isArray(ordered)||!start||!end||start.column!==end.column)return {ok:false,error:'Selecione o início e o fim dentro da mesma coluna.'};
 const candidates=ordered.filter(w=>w.column===start.column);
 const i=candidates.findIndex(w=>w===start||w.x0===start.x0&&w.y0===start.y0&&w.text===start.text);
 const j=candidates.findIndex(w=>w===end||w.x0===end.x0&&w.y0===end.y0&&w.text===end.text);
 if(i<0||j<0)return {ok:false,error:'As palavras não pertencem à seleção atual.'};
 const arr=candidates.slice(Math.min(i,j),Math.max(i,j)+1);
 if(!arr.length||arr.length>(limits.maxWords||180))return {ok:false,error:'Seleção muito extensa; marque uma frase ou parágrafo de cada vez.'};
 for(let n=1;n<arr.length;n++){
  if(arr[n].line===arr[n-1].line&&arr[n].x0<arr[n-1].x1-2.4)
   return {ok:false,error:'Geometria sobreposta no PDF: seleção imprecisa. Nenhum grifo será criado.'};
 }
 const width=limits.width||1,height=limits.height||1;
 let text='',prev=null;const boxes=[];
 for(const w of arr){
  const sep=!prev?'':w.line!==prev.line?'\n':' ';
  text+=sep+w.text;
  boxes.push([w.x0/width,w.y0/height,w.x1/width,w.y1/height]);
  prev=w;
 }
 if(!text||text.length>12000)return {ok:false,error:'Trecho muito extenso.'};
 const join=window.BancoMestreMulticorV081?.joinRects;
 const merged=typeof join==='function'?join(boxes):boxes;
 if(!merged?.length||merged.length>250||merged.some(r=>r.some(x=>!finite(x)||x<0||x>1)))
  return {ok:false,error:'Posicionamento impreciso; selecione novamente.'};
 return {ok:true,text,rects:merged,words:arr,first:arr[0],last:arr[arr.length-1],
  anchor:{quote:text,prefix:'',suffix:''}};
}
window.BancoMestrePreciseCoreV089=Object.freeze({buildWords,detectColumns,columnIndex,readingOrder,nearest,selectRange});
})();

;
/* 46 assets/v104_precise_touch.js */
/* V104 — cancelar seleção pendente quando zoom usa dois dedos. */
/* V103 — TOQUE EM DUAS ETAPAS NO CELULAR, MANTENDO SELETOR GEOMÉTRICO V089.
 * V094 — APENAS seletor V089 por coordenadas, acoplado ao menu original V070.
 * Nenhuma paleta, barra, classificação ou escrita nova; tudo continua no V070.
 */
(function(){
 'use strict';
 if(window.BancoMestrePreciseSelectV094)return;
 const root=document.getElementById('pdfDialog'),
       wrap=document.getElementById('pdfPageWrap'),
       canvas=document.getElementById('pdfLocalCanvas'),
       engine=window.BancoMestrePreciseCoreV089,
       api=()=>window.BancoMestrePDFV042,
       grifos=()=>window.BancoMestreGrifadorV068;
 if(!root||!wrap||!canvas||!engine||!grifos()?.acceptPreciseSelection)return;
 const overlay=document.createElement('div');
 overlay.id='bm094WordPointer';overlay.hidden=true;
 overlay.setAttribute('aria-label','Seleção precisa: toque na primeira e na última palavra da mesma coluna ou arraste.');
 const preview=document.createElement('div');preview.id='bm094RectPreview';
 preview.setAttribute('aria-hidden','true');overlay.append(preview);
 wrap.append(overlay);
 let source=null,ordered=[],start=null,down=null,ticket=0;
 const mobile=window.matchMedia?.('(pointer:coarse)')||{matches:false};
 const statusLine=document.createElement('div');statusLine.id='bm103SelectStage';
 statusLine.setAttribute('role','status');statusLine.setAttribute('aria-live','polite');
 const stageText=document.createElement('span');stageText.id='bm103SelectStageText';
 const cancelButton=document.createElement('button');cancelButton.type='button';
 cancelButton.id='bm103CancelSelection';cancelButton.textContent='Cancelar';
 cancelButton.setAttribute('aria-label','Cancelar o ponto inicial de seleção');
 statusLine.append(stageText,cancelButton);
 const content=root.querySelector('.bm-v046-pdf-content');
 if(content)content.append(statusLine);else root.append(statusLine);
 function stage(){
  const show=mobile.matches&&active();
  statusLine.hidden=!show;
  stageText.textContent=start?'2/2 · Toque na última palavra':'1/2 · Toque na primeira palavra';
  cancelButton.hidden=!start;
 }
 cancelButton.addEventListener('click',()=>{reset();message('Seleção cancelada. Toque na primeira palavra.');stage()});
 const hint=()=>document.getElementById('bm068ModeHint');
 const message=s=>{if(hint())hint().textContent=String(s)};
 function active(){
  const a=api();return !!(source&&root.open&&a?.editing&&
   a.currentTool==='select'&&a.currentId===source.documentId&&
   a.currentPage===source.page&&a.sourceHash===source.hash);
 }
 function draw(words,focus){
  preview.replaceChildren();
  if(!source||!words)return;
  for(const w of words.slice(0,180)){
   const s=document.createElement('span');
   s.className=focus?'bm094-focus-word':'bm094-word-rect';
   s.style.left=(w.x0/source.width*100)+'%';
   s.style.top=(w.y0/source.height*100)+'%';
   s.style.width=((w.x1-w.x0)/source.width*100)+'%';
   s.style.height=((w.y1-w.y0)/source.height*100)+'%';
   preview.append(s);
  }
 }
 function reset(){start=null;down=null;draw([]);stage()}
 function clear(){
  ++ticket;source=null;ordered=[];reset();overlay.hidden=true;
  root.classList.remove('bm094-precise');statusLine.hidden=true;
 }
 function toggle(){
  const on=active();
  overlay.hidden=!on;
  root.classList.toggle('bm094-precise',on);
  if(!on)reset();
  stage();
  if(on)message('Clique na primeira e na última palavra da mesma coluna, ou arraste para selecionar.');
 }
 function point(e){
  if(!source)return null;
  const box=wrap.getBoundingClientRect();
  if(!box.width||!box.height)return null;
  return {x:(e.clientX-box.left)*source.width/box.width,
          y:(e.clientY-box.top)*source.height/box.height};
 }
 function nearest(e){
  const p=point(e);if(!p)return null;
  return engine.nearest(ordered,p.x,p.y,start?.column??null);
 }
 function selected(end){
  if(!start||!end||!source)return null;
  return engine.selectRange(ordered,start,end,{width:source.width,height:source.height});
 }
 function finish(end,e){
  const value=selected(end);
  if(!value?.ok){message(value?.error||'Seleção inválida. Escolha palavras da mesma coluna.');return}
  const adopted=grifos()?.acceptPreciseSelection({...value,ok:true,
    width:source.width,height:source.height},{x:e.clientX,y:e.clientY});
  if(!adopted){message('A seleção não pôde ser aplicada: tente selecionar novamente.');return}
  reset();
 }
 function existing(e){
  const p=point(e);if(!p)return false;
  const x=p.x/source.width,y=p.y/source.height;
  const old=(api()?.currentMarks||[]).slice().reverse().find(m=>
   m.type==='text_highlight'&&Array.isArray(m.rects)&&
   m.rects.some(r=>Array.isArray(r)&&r.length===4&&
    x>=r[0]-.003&&x<=r[2]+.003&&y>=r[1]-.005&&y<=r[3]+.005));
  if(!old?.id)return false;
  reset();grifos()?.openMark?.(old.id);
  message('Grifo existente aberto para editar na interface V070.');
  return true;
 }
 overlay.addEventListener('pointerdown',e=>{
  if(!active()||e.button!==0||e.isPrimary===false)return;
  const p=nearest(e);
  if(!p){message('Toque sobre uma palavra para definir a seleção.');return}
  const isTouch=e.pointerType==='touch'||(mobile.matches&&e.pointerType!=='mouse');
  down={x:e.clientX,y:e.clientY,pointerType:e.pointerType,wasSet:!!start,candidate:p};
  if(isTouch){
   // O ponto só é aceito quando o dedo é levantado sem movimento:
   // deslizar verticalmente continua rolando a página naturalmente.
   return;
  }
  if(start&&start.column!==p.column){
   reset();message('Selecione uma coluna por vez. Comece novamente.');return;
  }
  if(!start){start=p;draw([p],true);
   message('Primeira palavra: '+p.text+'. Clique na última palavra ou arraste.');
  }
  try{overlay.setPointerCapture(e.pointerId)}catch{}
  stage();e.preventDefault();
 });
 overlay.addEventListener('pointermove',e=>{
  if(!down||!active())return;
  if(down.pointerType==='touch'||(mobile.matches&&down.pointerType!=='mouse'))return;
  if(Math.hypot(e.clientX-down.x,e.clientY-down.y)<7)return;
  const w=nearest(e),value=selected(w);
  if(value?.ok){draw(value.words);message('Prévia: '+value.words.length+' palavras.')}
 });
 overlay.addEventListener('pointerup',e=>{
  if(!down||!active())return;
  const old=down;down=null;
  try{if(overlay.hasPointerCapture(e.pointerId))overlay.releasePointerCapture(e.pointerId)}catch{}
  const moved=Math.hypot(e.clientX-old.x,e.clientY-old.y)>10;
  const isTouch=old.pointerType==='touch'||(mobile.matches&&old.pointerType!=='mouse');
  const w=nearest(e);
  if(isTouch){
   if(moved){stage();return} // rolagem, não seleção acidental
   if(!w){message('Toque diretamente em uma palavra.');return}
   if(start&&start.column!==w.column){
    reset();message('A seleção deve ficar na mesma coluna. Comece novamente.');return;
   }
   if(old.wasSet){finish(w,e);stage();return}
   if(existing(e)){stage();return}
   start=w;draw([w],true);stage();
   message('Início definido: '+w.text+'. Toque na última palavra da mesma coluna.');
   return;
  }
  if(moved){if(w)finish(w,e);else message('Fim fora da coluna. Selecione novamente.');return}
  if(old.wasSet){if(w)finish(w,e);return}
  if(existing(e))return;
  stage();
 });
 overlay.addEventListener('pointercancel',()=>{down=null});
 overlay.addEventListener('contextmenu',e=>{e.preventDefault();reset();message('Seleção cancelada.')});
 window.addEventListener('bm-pdf-tool-change',toggle);
 window.addEventListener('bm-pdf-active-page-rendered',async e=>{
  const t=++ticket;
  source=null;ordered=[];reset();overlay.hidden=true;
  root.classList.remove('bm094-precise');
  const c=e.detail||{},a=api();
  if(!a?.editing||a.currentId!==c.documentId||a.currentPage!==c.page||
    a.sourceHash!==c.sourceHash)return;
  try{
   const page=await a.getCurrentPdfPage();
   if(t!==ticket||!page)return;
   const content=await page.getTextContent({normalizeWhitespace:false});
   if(t!==ticket)return;
   const viewport=page.getViewport({scale:c.viewportScale});
   const words=engine.buildWords(content,viewport,window.pdfjsLib?.Util,canvas);
   if(!words.length){message('Este PDF não disponibiliza palavras posicionadas para seleção precisa.');return}
   const cuts=engine.detectColumns(words,viewport.width,viewport.height);
   const list=engine.readingOrder(words,cuts);
   if(t!==ticket||a.currentId!==c.documentId||a.currentPage!==c.page)return;
   ordered=list;
   source={page:c.page,documentId:c.documentId,hash:c.sourceHash,
           width:viewport.width,height:viewport.height};
   toggle();
  }catch(err){
   if(t===ticket){console.warn('V094 seletor de texto',err);
    message('Não foi possível preparar seleção precisa neste PDF.')}
  }
 });
 root.addEventListener('close',clear);
 if(mobile.addEventListener)mobile.addEventListener('change',stage);
 window.BancoMestrePreciseSelectV094=Object.freeze({
  ready:true,cancelPending(){reset();return true},get words(){return ordered.length},
  get columns(){return source?Math.max(1,new Set(ordered.map(w=>w.column)).size):0}
 });
})();

;
/* 47 assets/v096_icons.js */
/* V096 — Iconografia original em linha, sem bibliotecas externas.
   Site: navegação discreta tipo plataforma de questões.
   Editores: ferramentas de contorno arredondado tipo caderno digital.
   Não substitui nós, eventos, classes funcionais ou armazenamento. */
(function(){
'use strict';
if(window.BancoMestreIconsV096)return;
const paths={
 'book-open':'<path d="M12 7a8 8 0 0 0-8-2v14a8 8 0 0 1 8 2"/><path d="M12 7a8 8 0 0 1 8-2v14a8 8 0 0 0-8 2"/><path d="M12 7v14"/>',
 'file-text':'<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M8 13h8M8 17h8"/>',
 'layers':'<path d="m12 2 9 5-9 5-9-5zM3 12l9 5 9-5M3 17l9 5 9-5"/>',
 'images':'<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 16-5-5L5 21"/>',
 'highlighter':'<path d="m9 11-6 6 4 4 6-6M12 8l4-4a3 3 0 0 1 4 4l-6 6-5-5z"/><path d="m3 21 4-4M3 23h18"/>',
 'pen-line':'<path d="m12 19 7-7 3 3-7 7-5 1zM19 12l-4-4 2-2a2.8 2.8 0 0 1 4 4z"/><path d="M2 8h9M2 13h6"/>',
 'eraser':'<path d="m20 20 2-2-9-9-9 9a2 2 0 0 0 0 3l1 1h15"/><path d="m8 14 7 7"/>',
 'hand':'<path d="M8 12V6a1.5 1.5 0 0 1 3 0v4-6a1.5 1.5 0 0 1 3 0v6-5a1.5 1.5 0 0 1 3 0v6-3a1.5 1.5 0 0 1 3 0v7c0 5-3 7-7 7h-2c-2 0-4-2-5-4l-3-4a1.8 1.8 0 0 1 3-2l2 2"/>',
 'lasso':'<path d="M14 21c-4-1-7-3-7-6 0-3 3-5 7-5 5 0 8 2 8 5 0 2-1 4-4 5M12 21c0 2-3 2-3 0 0-2 3-2 3 0z"/><path d="M3 3l7 6M4 11l-1-8 8 1"/>',
 'undo':'<path d="M9 14 4 9l5-5"/><path d="M4 9h11a6 6 0 0 1 0 12h-2"/>',
 'redo':'<path d="m15 14 5-5-5-5"/><path d="M20 9H9a6 6 0 0 0 0 12h2"/>',
 'chevron-left':'<path d="m15 18-6-6 6-6"/>',
 'chevron-right':'<path d="m9 18 6-6-6-6"/>',
 'zoom-in':'<circle cx="10.8" cy="10.8" r="7.2"/><path d="m16 16 5 5M8 11h6M11 8v6"/>',
 'zoom-out':'<circle cx="10.8" cy="10.8" r="7.2"/><path d="m16 16 5 5M8 11h6"/>',
 'download':'<path d="M12 3v12m-4-4 4 4 4-4"/><path d="M4 17v4h16v-4"/>',
 'save':'<path d="M4 3h14l3 3v15H3V3z"/><path d="M7 3v7h10V3M7 21v-7h10v7"/>',
 'folder':'<path d="M3 6a2 2 0 0 1 2-2h5l2 3h7a2 2 0 0 1 2 2v11H3z"/>',
 'settings':'<circle cx="12" cy="12" r="3"/><path d="M12 2v2M12 20v2M4 12H2M22 12h-2M5 5l2 2m10 10 2 2M19 5l-2 2M7 17l-2 2"/>',
 'x':'<path d="M5 5l14 14M19 5 5 19"/>',
 'note':'<path d="M5 3h14v18H5zM9 8h6M9 12h6M9 16h3"/>',
 'copy':'<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3"/>',
 'trash':'<path d="M4 7h16M9 7V4h6v3M6 7l1 14h10l1-14M10 11v6M14 11v6"/>',
 'ruler':'<path d="m3 16 13-13 5 5-13 13zM12 7l3 3M9 10l3 3M6 13l3 3"/>',
 'eye':'<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>',
 'more':'<circle cx="4" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="20" cy="12" r="1"/>',
 'star':'<path d="m12 2 3 7 7 .7-5.3 4.8 1.6 7.5-6.3-4-6.3 4 1.6-7.5L2 9.7 9 9z"/>',
 'search':'<circle cx="11" cy="11" r="7"/><path d="m16 16 5 5"/>',
 'shield':'<path d="m12 2 9 4v6c0 6-4 9-9 10-5-1-9-4-9-10V6z"/><path d="m8 12 3 3 5-6"/>',
 'scale':'<path d="M12 3v18M5 21h14M3 7h18"/><path d="m6 7-3 6h6zM18 7l-3 6h6z"/>',
 'calculator':'<rect x="4" y="2" width="16" height="20" rx="2"/><rect x="7" y="5" width="10" height="4" rx="1"/><path d="M8 13h1M13 13h1M8 17h1M13 17h1"/>',
 'building':'<path d="M3 22V7l9-5 9 5v15M9 22v-6h6v6M7 9h2M15 9h2M7 13h2M15 13h2"/>',
 'graduation':'<path d="m2 9 10-5 10 5-10 5zM6 12v5c4 4 8 4 12 0v-5M22 9v7"/>',
 'droplet':'<path d="M12 2C9 6 5 10 5 15a7 7 0 0 0 14 0c0-5-4-9-7-13z"/>',
 'hardhat':'<path d="M3 18h18M6 18v-5a6 6 0 0 1 12 0v5M12 7v6M3 21h18"/>',
 'type':'<path d="M3 5h18M12 5v14M8 19h8M7 5v3M17 5v3"/>',
 'clipboard':'<rect x="5" y="4" width="14" height="18" rx="2"/><rect x="9" y="2" width="6" height="4" rx="1"/><path d="M9 11h6M9 15h6"/>',
 'maximize':'<path d="M4 9V4h5M15 4h5v5M20 15v5h-5M9 20H4v-5"/>',
 'rotate':'<path d="M20 5v6h-6M4 19v-6h6"/><path d="M5 10a8 8 0 0 1 14-5M19 14a8 8 0 0 1-14 5"/>',
 'arrow-right':'<path d="M4 12h16m-6-6 6 6-6 6"/>',
 'underline':'<path d="M6 3v7a6 6 0 0 0 12 0V3M3 21h18"/>',
 'strikethrough':'<path d="M4 12h16M17 6c-1-2-3-3-5-3-4 0-6 2-6 5 0 5 12 3 12 9 0 3-3 5-6 5-3 0-5-1-6-3"/>',
 'sliders':'<path d="M3 6h18M3 12h18M3 18h18"/><circle cx="8" cy="6" r="2"/><circle cx="16" cy="12" r="2"/><circle cx="10" cy="18" r="2"/>',
 'palette':'<path d="M12 3a9 9 0 1 0 0 18h2a2 2 0 0 0 2-2c0-1-.8-1.5-.8-2.5 0-1.5 1.3-2.5 2.8-2.5H20a3 3 0 0 0 3-3 9 9 0 0 0-11-8z"/><circle cx="7" cy="10" r="1"/><circle cx="11" cy="7" r="1"/><circle cx="16" cy="8" r="1"/><circle cx="8" cy="15" r="1"/>',
 'link':'<path d="M10 13a5 5 0 0 0 8 .5l3-3a5 5 0 0 0-7-7l-2 2M14 11a5 5 0 0 0-8-.5l-3 3a5 5 0 0 0 7 7l2-2"/>'
};
function svg(name){
 const content=paths[name]||paths['file-text'];
 return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#000" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">'+content+'</svg>';
}
function assign(el,name,context,label){
 if(!el||!paths[name])return false;
 if(context)el.dataset.bm096Context=context;
 el.dataset.bm096Icon=name;
 const uri='url("data:image/svg+xml,'+encodeURIComponent(svg(name))+'")';
 el.style.setProperty('--bm096-mask',uri);
 if(label&&el.dataset.bm096Label!=='1'){
  el.textContent=label;el.dataset.bm096Label='1';
 }
 if(el.tagName==='BUTTON'&&!el.hasAttribute('title'))el.title=(label||el.textContent||'Ferramenta').trim();
 return true;
}
const stable=[
 ['#pdfDraw','pen-line','Caneta'],['#pdfMarker','highlighter','Grifo livre'],
 ['#pdfEraser','eraser','Borracha'],['#pdfPan','hand','Mover'],
 ['#bm068SelectTool','lasso','Grifar palavras'],
 ['#pdfPrev','chevron-left','Anterior'],['#pdfNext','chevron-right','Próxima'],
 ['#pdfZoomOut','zoom-out','Zoom −'],['#pdfZoomIn','zoom-in','Zoom +'],
 ['#pdfUndo','undo','Desfazer'],['#pdfRedo','redo','Refazer'],
 ['#pdfClearPage','trash','Limpar página'],['#pdfExportPDF','download','Exportar PDF'],
 ['#pdfExportPNG','images','Exportar PNG'],['#pdfChangeFile','folder','Trocar PDF'],
 ['#pdfClose','x','Fechar'],['#pdfChooseLocal','pen-line','Editar PDF'],
 ['#pdfSaveDriveV042','save',null],['#bmV057GoPage','arrow-right',null],
 ['#bm068QuickToggle','highlighter',null],['#bm068OpenPanel','layers',null],
 ['#bm068Settings','settings',null],['#bm070Smart','palette',null],
 ['#bm068FloatClose','x',null],['#bm068Apply','highlighter',null],
 ['#bm070ApplyAuto','palette',null],['#bm068Note','note',null],
 ['#bm068Cards','graduation',null],['#bm068Copy','copy',null],
 ['#bm068Resize','lasso',null],['#bm068Delete','trash',null],
 ['#bm068Underline','underline',null],['#bm068DoubleUnderline','underline',null],
 ['#bm068Strike','strikethrough',null],['#bm068Hide','eye',null],
 ['#bm068EditorClose','x',null],['#bm068SettingsCancel','x',null],
 ['#bm068SettingsSave','save',null],['#pdfOriginal','link',null],
 ['#pdfSaveDriveV042','save',null]
];
const imageTools=[
 ['[data-ink-tool="pen"]','pen-line','Caneta'],
 ['[data-ink-tool="highlighter"]','highlighter','Marca-texto'],
 ['[data-ink-tool="eraser"]','eraser','Borracha'],
 ['[data-ink-tool="select"]','lasso','Selecionar'],
 ['[data-ink-tool="pan"]','hand','Mover'],
 ['#undo','undo','Desfazer'],['#redo','redo','Refazer'],
 ['#deleteSelected','trash',null],['#zoomOutImage','zoom-out',null],
 ['#zoomWidthImage','maximize',null],['#zoomFitImage','maximize',null],
 ['#zoomActualImage','ruler',null],['#zoomInImage','zoom-in',null],
 ['#hideOpened','eye',null],['#imgClose','x','Fechar'],
 ['#v034SelectOriginal','folder',null],['#originalDriveLink','link',null]
];
const navIcons={assuntos:'book-open',pdfs:'file-text',cartoes:'graduation',imagens:'images',grifos:'highlighter'};
const topical=[
 [/portugu[eê]s|gram[aá]tica|redac[aã]o/i,'type'],
 [/matem[aá]tica|l[oó]gica|c[aá]lculo/i,'calculator'],
 [/legisla[cç][aã]o|lei|direito|norma/i,'scale'],
 [/estrutura|edifica[cç][aã]o|concreto|a[cç]o/i,'building'],
 [/geotecnia|funda[cç][aã]o|solo/i,'layers'],
 [/hidraul|hidr[aá]ul|saneamento|[aá]gua|esgoto/i,'droplet'],
 [/seguran[cç]a|nr[- ]|trabalho/i,'shield'],
 [/obra|rodov|pavimenta/i,'hardhat']
];
function topicIcon(text){
 const normalized=String(text||'');
 for(const [re,icon] of topical)if(re.test(normalized))return icon;
 return 'book-open';
}
function decorateSite(){
 document.querySelectorAll('header nav button[data-page]').forEach(btn=>
  assign(btn,navIcons[btn.dataset.page]||'book-open','site'));
 for(const rootId of ['areaRows','topicRows']){
  const root=document.getElementById(rootId);
  if(!root)return;
  root.querySelectorAll('.topicCard').forEach(card=>{
   if(rootId==='topicRows'&&card.dataset.bm096Icon)return;
   assign(card,topicIcon(card.textContent),rootId==='areaRows'?'area':'topic');
  });
 }
 for(const [id,icon] of [['topicGoCards','graduation'],['bm062Refresh','rotate'],['bm062Backup','download'],['moreCards','more'],['moreImages','more'],['topicBack','chevron-left']])
  assign(document.getElementById(id),icon,'site');
 for(const id of ['topicSearch','pdfSearch','cardSearch','imageSearch']){
  const el=document.getElementById(id);if(!el)return;
  el.classList.add('bm096-search');
  el.style.backgroundImage='url("data:image/svg+xml,'+encodeURIComponent(svg('search'))+'")';
 }
}
function decorateEditors(){
 const pdf=document.getElementById('pdfDialog');
 if(pdf){
  for(const [selector,icon,label] of stable)assign(pdf.querySelector(selector),icon,'notes',label);
 }
 const image=document.getElementById('imageDialog');
 if(image)for(const [selector,icon,label] of imageTools)
  assign(image.querySelector(selector),icon,'notes',label);
}
function refresh(){decorateSite();decorateEditors();}
function observeNames(){
 for(const id of ['bm068QuickToggle','bm070Smart']){
  const node=document.getElementById(id);if(!node||node.dataset.bm096Watch==='1')continue;
  node.dataset.bm096Watch='1';
  const ob=new MutationObserver(()=>{
   const s=node.textContent||'';
   const clean=s.replace(/^[◈⚡✎🖍]\s*/u,'');
   if(clean!==s)node.textContent=clean;
  });
  ob.observe(node,{childList:true,characterData:true});
 }
}
function init(){
 refresh();observeNames();
 for(const id of ['areaRows','topicRows']){
  const n=document.getElementById(id);if(!n)continue;
  const obs=new MutationObserver(()=>decorateSite());
  obs.observe(n,{childList:true,subtree:true});
 }
 window.addEventListener('bm-pdf-tool-change',()=>{decorateEditors();observeNames()});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
window.BancoMestreIconsV096=Object.freeze({refresh,hasIcon:name=>!!paths[name]});
})();

;
/* 48 assets/v192_portal_text.js */
/* V192 — revisão editorial de textos estáticos do portal.
   Só substitui textos conhecidos; não altera IDs, conteúdo dos cartões, dados,
   busca, leitores, grifos, histórico nem nomes dos documentos. */
(function(){
 'use strict';
 const changes=[
  ['header .head .version:last-child',
   'Assuntos, PDFs, cartões e Atlas para revisão técnica',
   'Conteúdos, PDFs, flashcards e pranchas organizados para estudo'],
  ['.hero h1',
   'O que deseja estudar?',
   'Sua área de estudos'],
  ['.hero p',
   'As áreas e os assuntos originais estão de volta. Selecione o tema para encontrar flashcards, imagens e PDFs relacionados, com guias de estudo quando disponíveis.',
   'Encontre conteúdos por disciplina, abra PDFs para grifar e consulte flashcards e pranchas técnicas no mesmo lugar.'],
  ['#assuntos .panel > h2:first-child',
   'Comece por uma área',
   'Escolha uma área de estudo'],
  ['#assuntos .panel > h2:nth-of-type(2)',
   'Disciplinas, assuntos e subassuntos',
   'Assuntos e subassuntos'],
  ['#assuntos .panel > p.intro',
   'Selecione uma área e explore os assuntos. Cada tema reúne conceitos, imagens e documentos relacionados quando disponíveis.',
   'Explore os conteúdos da sua área. Os assuntos reúnem explicações, cartões, imagens e PDFs relacionados quando disponíveis.'],
  ['#pdfs .panel > h2',
   'PDFs para estudo',
   'Biblioteca de PDFs'],
  ['#pdfs .panel > p.intro',
   'Consulte normas, apostilas e materiais organizados por área. Abra um PDF para ler, fazer grifos e associar cartões às páginas. Arquivos já guardados neste navegador podem ser reabertos sem novo envio.',
   'Consulte normas e materiais por assunto. Leia, grife e anote no editor; as cópias locais e os documentos originais permanecem separados.'],
  ['#cartoes .panel > p.intro',
   'Leia a pergunta e use 👁 Ver cartão para consultar a resposta, a explicação e o macete sem iniciar uma revisão. Para estudar com mais detalhes, abra o cartão completo em outra aba. A consulta não altera o SRS.',
   'Consulte os cartões e seus versos integrais nesta biblioteca. A prática, as respostas discursivas, as correções e as avaliações SRS são feitas no ChatGPT, conforme a metodologia.'],
  ['#imagens .panel > h2',
   'Imagens e pranchas',
   'Atlas de imagens e pranchas'],
  ['#imagens .panel > p.intro',
   'Encontre cada prancha por tema, leia o resumo do conteúdo e amplie a imagem para estudar. Exclusões são reversíveis.',
   'Localize imagens e pranchas por assunto. Anotações no navegador são locais; ocultar uma imagem não exclui seu arquivo original no Drive.']
 ];
 function revise(){
  for(const [selector,before,after] of changes){
   const node=document.querySelector(selector);
   if(node&&node.textContent.trim()===before)node.textContent=after;
  }
  for(const [selector,text] of [
   ['#pdfSearch','Buscar norma, capítulo ou assunto'],
   ['#topicSearch','Buscar assunto, norma ou conceito'],
   ['#cardSearch','Buscar ID, questão ou conteúdo'],
   ['#imageSearch','Buscar imagem, assunto ou descrição']
  ]){
   const el=document.querySelector(selector);
   if(el&&el.placeholder)el.placeholder=text;
  }
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',revise,{once:true});
 else revise();
 window.BancoMestrePortalTextV098={refresh:revise};
 window.BancoMestrePortalTextV192=window.BancoMestrePortalTextV098;
})();

;
/* 49 assets/v106_assuntos_compactos.js */
/* V106 — textos de navegação em Assuntos mais curtos, sem alterar disciplinas. */
(function(){
 'use strict';
 function edit(){
  const root=document.getElementById('assuntos');
  if(!root)return;
  const heading=root.querySelector('.panel > h2:first-child');
  const intro=root.querySelector('.panel > p.intro');
  const subjects=root.querySelector('.panel > h2:nth-of-type(2)');
  if(heading)heading.textContent='Áreas de estudo';
  if(intro)intro.textContent='Escolha uma área e abra um assunto.';
  if(subjects)subjects.textContent='Assuntos';
  for(const node of root.querySelectorAll('p')){
   if(node===intro)continue;
   const text=node.textContent?.trim()||'';
   if(text.startsWith('Abra cada assunto para ler explicações, consultar imagens e PDFs'))
    node.textContent='Abra o assunto para ver PDFs, imagens e cartões.';
  }
  const hero=document.querySelector('main > .hero');
  if(hero){
   const h=hero.querySelector('h1'),p=hero.querySelector('p');
   if(h&&/^(Sua área de estudos|O que deseja estudar\?)$/.test(h.textContent.trim()))h.textContent='Estudar';
   if(p&&(/Encontre conteúdos por disciplina|As áreas e os assuntos originais/.test(p.textContent)))
    p.textContent='Assuntos, PDFs, imagens e cartões em um só lugar.';
  }
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',edit,{once:true});
 else edit();
 window.BancoMestreTextoAssuntosV106=Object.freeze({refresh:edit});
})();

;
/* 50 assets/v099_legenda_grifos.js */
/* V099 — legenda acessível do estudo ativo, sem alterar eventos do grifador */
(function(){
'use strict';
function init(){
 const bar=document.getElementById('bm068QuickBar');
 if(!bar||document.getElementById('bm099LawLegend'))return;
 const details=document.createElement('details');details.id='bm099LawLegend';
 const summary=document.createElement('summary');summary.textContent='Lei seca · código das 4 cores';
 details.append(summary);
 const rows=[
  ['#FDE68A','Amarelo — O quê?','Regra, inclusive proibição'],
  ['#BBF7D0','Verde — Quem?','Sujeito e competência'],
  ['#BAE6FD','Azul — Quando?','Prazo, número e condição'],
  ['#FECDD3','Rosa — Salvo o quê?','Exceção e ressalva']
 ];
 for(const [color,title,desc] of rows){
  const row=document.createElement('div');row.className='bm099-legend-row';
  const swatch=document.createElement('span');swatch.className='bm099-legend-swatch';
  swatch.style.backgroundColor=color;swatch.setAttribute('aria-hidden','true');
  const content=document.createElement('div');
  const strong=document.createElement('strong');strong.textContent=title;
  const small=document.createElement('small');small.textContent=desc;
  content.append(strong,small);row.append(swatch,content);details.append(row);
 }
 const hint=document.createElement('small');hint.className='bm099-legend-hint';
 hint.textContent='Liste só o núcleo. Negrito: apenas palavra que você já errou. Revise as sugestões antes de aplicar.';
 details.append(hint);bar.append(details);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
else init();
})();

;
/* 51 assets/v100_pdf_tools.js */
/* V100 — organização da barra do editor PDF a partir do DOM real fornecido
 * pelo estudante em 11/11/2026. Não criar cópias dos botões nem substituir
 * listeners; mover os mesmos nós, preservar IDs, estado, form e ARIA.
 */
(function(){
'use strict';
if(window.BancoMestrePdfToolsV100)return;
const $=id=>document.getElementById(id);
const icons={
 note:'<path d="M5 3h12l3 3v15H5zM17 3v4h3M9 11h7M9 15h7"/>',
 card:'<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M12 4v16M7 8h2M15 8h2"/>',
 coverage:'<circle cx="12" cy="12" r="9"/><path d="m8 12 3 3 5-6"/>',
 more:'<circle cx="4.5" cy="12" r="1.1"/><circle cx="12" cy="12" r="1.1"/><circle cx="19.5" cy="12" r="1.1"/>',
 audit:'<path d="m12 2 8 4v6c0 5-3 8-8 10-5-2-8-5-8-10V6z"/><path d="m8 12 3 3 5-6"/>'
};
function decorate(id,key,label){
 const b=$(id);if(!b||!icons[key])return;
 const svg='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="black" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round">'+icons[key]+'</svg>';
 b.style.setProperty('--bm096-mask','url("data:image/svg+xml,'+encodeURIComponent(svg)+'")');
 b.dataset.bm096Context='notes';b.dataset.bm096Icon=key;
 b.textContent=label;
 if(!b.title)b.title=label;
}
function section(name,label){
 const el=document.createElement('div');
 el.className='pdfGroup bm100-section';el.dataset.bm100Group=name;
 el.setAttribute('role','group');el.setAttribute('aria-label',label);
 const heading=document.createElement('h3');heading.className='bm100-heading';
 heading.textContent=label;el.append(heading);return el;
}
function heading(el,label,name){
 el.classList.add('bm100-section');el.dataset.bm100Group=name;
 el.setAttribute('role','group');el.setAttribute('aria-label',label);
 const h=document.createElement('h3');h.className='bm100-heading';h.textContent=label;
 el.prepend(h);
}
function row(kind,ids){
 const el=document.createElement('div');el.className='bm100-row bm100-'+kind;
 for(const id of ids){const b=$(id);if(b)el.append(b)}
 return el;
}
function init(){
 const dialog=$('pdfDialog'),root=$('pdfLocalTools'),main=$('pdfMainV043');
 if(!dialog||!root||!main||root.dataset.bm100Ready==='1')return false;
 const find=id=>Array.from(main.children).find(x=>x.classList?.contains('pdfGroup')&&x.querySelector('#'+id));
 const nav=find('pdfPrev'),draw=find('pdfDraw'),history=find('pdfUndo'),files=find('pdfExportPDF');
 const select=$('bm068SelectTool'),dock=$('bmV057PdfDock');
 if(!nav||!draw||!history||!files||!select||!dock)return false;
 // Todos os comandos existem antes de mudar a árvore DOM.
 const required=['pdfPrev','pdfNext','pdfPager','pdfZoomOut','pdfZoomIn',
  'pdfDraw','pdfMarker','pdfEraser','pdfPan','pdfUndo','pdfRedo',
  'pdfExportPDF','pdfSaveDriveV042','pdfNoteV037','pdfCardV037','pdfStatusV037'];
 if(required.some(id=>!$(id)))return false;
 heading(nav,'Navegação','navigation');
 heading(draw,'Desenho livre','drawing');
 heading(history,'Histórico','history');
 heading(files,'Salvar e exportar','save');
 const selection=section('selection','Grifar texto');
 const annotations=section('annotations','Anotações');
 main.insertBefore(selection,draw);
 draw.after(annotations);
 selection.append(select);
 // Estrutura por duas colunas; o contador de página permanece no meio.
 nav.append(row('pages',['pdfPrev','pdfPager','pdfNext']));
 nav.append(row('zoom',['pdfZoomOut','pdfZoomIn']));
 nav.append(dock); // Mesma form, handlers intactos; no grupo de navegação.
 draw.append(row('draw',['pdfDraw','pdfMarker','pdfEraser','pdfPan']));
 const ink=document.createElement('div');ink.className='bm100-ink';
 const allLabels=Array.from(draw.children).filter(n=>n.tagName==='LABEL');
 allLabels.forEach(label=>ink.append(label));draw.append(ink);
 annotations.append(row('annotations',['pdfNoteV037','pdfCardV037','pdfStatusV037']));
 history.append(row('history',['pdfUndo','pdfRedo']));
 files.append(row('save',['pdfExportPDF','pdfSaveDriveV042']));
 // Ícones ausentes no legado V043; não alterar o desenho dos SVGs existentes.
 decorate('pdfNoteV037','note','Nota');
 decorate('pdfCardV037','card','Cartão');
 decorate('pdfStatusV037','coverage','Cobertura');
 decorate('pdfMoreV043','more','Mais opções');
 decorate('bm067ReaderRun','audit','Diagnóstico');
 const drive=$('pdfSaveDriveV042');if(drive&&/^\s*☁\s*Drive\s*$/u.test(drive.textContent||''))
  drive.textContent='Salvar no Drive';
 const shortcuts=$('bm068QuickBar');
 if(shortcuts){
  shortcuts.classList.add('bm100-shortcuts');
  const panel=$('bm068OpenPanel'),settings=$('bm068Settings');
  if(panel)panel.textContent='Meus grifos';
  if(settings)settings.textContent='Atalhos';
 }
 main.setAttribute('aria-label','Ferramentas de PDF organizadas: navegação, seleção de texto, desenho, anotações, histórico e salvamento.');
 root.dataset.bm100Ready='1';
 window.dispatchEvent(new CustomEvent('bm-pdf-tools-organized',{detail:{version:'V100',groups:6}}));
 return true;
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
else init();
window.addEventListener('bm-pdf-tool-change',()=>{if($('pdfLocalTools')?.dataset.bm100Ready!=='1')init()});
window.BancoMestrePdfToolsV100=Object.freeze({refresh:init,get ready(){return $('pdfLocalTools')?.dataset.bm100Ready==='1'}});
})();

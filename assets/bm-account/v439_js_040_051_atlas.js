/* V371 — cache incremental de listagens, somente na sessão autorizada. */
function BM371FolderCache({roots,token,request,now=()=>Date.now(),maxAge=600000}){
 const API='https://www.googleapis.com/drive/v3/',FOLDER='application/vnd.google-apps.folder';
 let state=null;
 function reset(){state=null}
 async function json(path,params,auth){
  if(token()!==auth)throw Error('Sessão Drive mudou');
  const data=await request(API+path+'?'+new URLSearchParams(params).toString(),auth);
  if(token()!==auth)throw Error('Sessão Drive mudou');
  return data;
 }
 async function start(auth){
  // O log do usuário não substitui o log específico de um drive compartilhado.
  for(const id of roots){
   const f=await json('files/'+encodeURIComponent(id),{fields:'id,mimeType,trashed,driveId',supportsAllDrives:'true'},auth);
   if(f?.id!==id||f.mimeType!==FOLDER||f.trashed||f.driveId)return null;
  }
  const r=await json('changes/startPageToken',{supportsAllDrives:'true'},auth);
  if(typeof r?.startPageToken!=='string'||!r.startPageToken)return null;
  return r.startPageToken;
 }
 async function changes(previous,auth){
  const dirty=new Set(),knownFolders=new Set(previous.folders.keys()),parents=new Map();
  for(const [id,items] of previous.folders)for(const f of items){
   if(!parents.has(f.id))parents.set(f.id,new Set());
   parents.get(f.id).add(id);
  }
  let cursor=previous.cursor;const visited=new Set();
  for(let n=0;n<25;n++){
   if(visited.has(cursor))throw Error('Cursor repetido');
   visited.add(cursor);
   const r=await json('changes',{
    pageToken:cursor,pageSize:'1000',supportsAllDrives:'true',includeItemsFromAllDrives:'true',
    includeRemoved:'true',includeCorpusRemovals:'true',restrictToMyDrive:'false',spaces:'drive',
    fields:'nextPageToken,newStartPageToken,changes(changeType,fileId,removed,file(id,mimeType,parents,trashed,driveId))'
   },auth);
   if(!r||!Array.isArray(r.changes))throw Error('Histórico incompleto');
   for(const c of r.changes){
    const id=c?.fileId,f=c?.file,old=parents.get(id);
    if(c?.changeType!=='file'||!id||knownFolders.has(id)||f?.mimeType===FOLDER||f?.driveId)
     return null;
    if(c.removed===true||f?.trashed===true){
     if(!old)return null; // remoção desconhecida pode representar perda de acesso
     for(const p of old)dirty.add(p);
     continue;
    }
    if(!f||f.id!==id||!f.mimeType||!Array.isArray(f.parents))return null;
    for(const p of old||[])dirty.add(p);
    for(const p of f.parents)if(knownFolders.has(p))dirty.add(p);
   }
   if(r.nextPageToken){cursor=r.nextPageToken;continue}
   if(typeof r.newStartPageToken!=='string'||!r.newStartPageToken)throw Error('Cursor final ausente');
   return {cursor:r.newStartPageToken,dirty};
  }
  throw Error('Histórico excede limite seguro');
 }
 async function run(scan,load){
  const auth=token();if(!auth){reset();throw Error('Drive não autorizado')}
  let previous=state,mode='full',cursor=null,reusable=new Map(),fullAt=now();
  if(previous&&previous.auth===auth&&now()-previous.fullAt<maxAge){
   try{
    const delta=await changes(previous,auth);
    if(delta){mode='incremental';cursor=delta.cursor;fullAt=previous.fullAt;
     reusable=new Map([...previous.folders].filter(([id])=>!delta.dirty.has(id)))}
   }catch(_){/* fallback conservador; não reutilizar listagem parcial */}
  }
  if(mode==='full'){
   try{cursor=await start(auth)}catch(_){cursor=null}
  }
  if(token()!==auth){reset();throw Error('Sessão Drive mudou')}
  const folders=new Map();let fetched=0,reused=0,shared=false;
  const get=async id=>{
   if(token()!==auth)throw Error('Sessão Drive mudou');
   const saved=reusable.get(id);
   const items=saved!==undefined?(reused++,saved):(fetched++,await load(id));
   if(!Array.isArray(items)||items.some(f=>!f?.id||!f.mimeType))throw Error('Listagem de pasta incompleta');
   if(token()!==auth)throw Error('Sessão Drive mudou');
   if(items.some(f=>f.driveId))shared=true;
   folders.set(id,items);
   return items;
  };
  try{
   const result=await scan(get);
   if(token()!==auth)throw Error('Sessão Drive mudou');
   state=cursor&&!shared?{auth,cursor,folders,fullAt}:null;
   return {...result,scanMode:mode,foldersFetched:fetched,foldersReused:reused};
  }catch(e){reset();throw e}
 }
 return {run,reset};
}

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
/* Experimental private PDF list, no global folder scans. */
 (function(){
 'use strict';
 const $=id=>document.getElementById(id);
 let pending=null,scanning=false,lastResult=null,renderedDocs=null;
 const authorized=()=>window.BMVS41PrivateReviews?.available()===true;
 const status=(message)=>{const e=$('bm-pdf-sync-status');if(e)e.textContent=message;};
 const authorize=()=>void refresh();
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
 sync.onclick=()=>{if(scanning)return;if(authorized())void refresh(true);else authorize();};
}

 async function refresh(force=false){
  if(pending)return pending;
  if(!force&&lastResult&&authorized()&&document.documentElement.dataset.bm217PdfVerified==='true'){
   if(renderedDocs!==docs&&$('pdfs')?.classList.contains('active')){pdfRender();renderedDocs=docs;}
   return lastResult;
  }
  scanning=true;
  pending=(async()=>{
   document.documentElement.dataset.bm217PdfVerified='false';
   try{
    const result=await window.BMVS41PrivatePdfs.list(force===true);
    docs=result;document.documentElement.dataset.bm217PdfVerified='true';$('pdfStat').textContent=docs.length;
    status('Biblioteca privada confirmada: '+docs.length+' PDFs vinculados.');
    lastResult={count:docs.length};renderedDocs=null;
    if($('pdfs')?.classList.contains('active')){pdfRender();renderedDocs=docs;}
    return lastResult;
   }catch(e){docs=[];lastResult=null;renderedDocs=null;pdfRender();status(e.message);return null}
   finally{scanning=false;pending=null}
  })();return pending;
 }
 function initialize(){ui();$('bm-pdf-sync-connect').disabled=false;$('bm-pdf-sync-refresh').disabled=false;status('Consulte os PDFs do perfil autenticado.');if(location.hash==='#pdfs')void refresh();}
 window.BancoMestrePDFSyncV130={refresh,async refreshAfterMove(){if(pending)await pending;return refresh(true)},get connected(){return authorized()},get lastResult(){return lastResult},topicRecords(){return authorized()&&document.documentElement.dataset.bm217PdfVerified==='true'?docs.slice():null}};
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',initialize,{once:true});else initialize();
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
 {url:'assets/v211_published_images.json?v=211',schema:'BancoMestrePublishedDriveImagesV211',key:'V211'},
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
  cards:[...new Set([...(prior.cards||[]),...(Array.isArray(rec.cards)?rec.cards.filter(x=>typeof x==='string'&&/^CARD-\d{4,}$/.test(x)):[])])],
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
  cards:[...new Set([...(prior.cards||[]),...(Array.isArray(rec.originalCardIds)?rec.originalCardIds.filter(x=>typeof x==='string'&&/^CARD-\d{4,}$/.test(x)):[])])],
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
(function(){
 'use strict';
 const $=id=>document.getElementById(id),normalize=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
 const el=(tag,cls,text)=>{const x=document.createElement(tag);if(cls)x.className=cls;if(text!==undefined)x.textContent=text;return x};
 let photos=[],visible=24,lastGoodAt=0,lastError='',pending=null,generation=0,renderedRecords=null,renderedView=null;
 const aliases=new Map(),urls=new Map(),downloads=new Map(),thumbs=new Map(),thumbFlights=new Map();
 const previewQueue=[];let previewActive=0;const PREVIEW_CONCURRENCY=3;
 const validToken=()=>window.BMVS41Session?.available()===true;
 const idOf=f=>f.id,title=f=>f.title;
 const info=f=>({displayTitle:f.classified?f.title:(window.BM218ImageMetadata?.friendly(f.filename||f.title)||'Imagem sem título descritivo'),fileName:f.filename||f.title,area:f.area,subject:f.subject,subsubject:f.subsubject,group:f.editorialGroup||f.area,description:f.description,detail:'',note:'',cards:f.card_ids,classified:f.classified===true,indexed:f.indexed===true});
 function msg(s,error){const x=$('bm084-status');if(x){x.textContent=s;x.style.color=error?'#953b32':'#315e57'}}
 function release(){generation++;for(const x of [...urls.values(),...thumbs.values()])URL.revokeObjectURL(x);urls.clear();downloads.clear();thumbs.clear();thumbFlights.clear();previewQueue.length=0;}
 async function getImageUrl(file){
  if(!validToken()||!photos.includes(file))throw Error('Imagem fora da sessão');
  if(urls.has(file.id))return urls.get(file.id);
  if(downloads.has(file.id))return downloads.get(file.id);
  const ticket=generation,task=(async()=>{
   const blob=await window.BMVS41PrivateMedia.read(file.card_ids?.[0]||'biblioteca',file.id);
   if(ticket!==generation||!validToken()||!photos.includes(file)||!/^image\/(png|jpeg|webp|gif|svg\+xml)$/.test(blob.type))throw Error('Imagem ou sessão alterada');
   const url=URL.createObjectURL(blob);urls.set(file.id,url);return url;
  })();downloads.set(file.id,task);
  try{return await task}finally{if(downloads.get(file.id)===task)downloads.delete(file.id)}
 }
 async function openImage(file){
  try{if(!validToken()||!photos.includes(file))throw Error('Imagem fora da sessão');await window.BMVS41PrivateImageEditor.open(file)}
  catch(e){msg(e.message,true)}
 }
 // Generate small local previews from authorized originals, without changing them.
 async function thumbnail(file){
  if(!validToken()||!photos.includes(file))throw Error('Imagem fora da sessão');
  if(thumbs.has(file.id))return thumbs.get(file.id);
  if(thumbFlights.has(file.id))return thumbFlights.get(file.id);
  const ticket=generation;
  const task=(async()=>{
   const original=await getImageUrl(file);
   if(ticket!==generation||!validToken())throw Error('Sessão alterada');
   const image=new Image();image.src=original;await image.decode();
   if(ticket!==generation||!validToken()||!photos.includes(file))throw Error('Sessão alterada');
   const scale=Math.min(1,360/Math.max(image.naturalWidth,image.naturalHeight));
   if(scale>=1)return original;
   const canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(image.naturalWidth*scale));canvas.height=Math.max(1,Math.round(image.naturalHeight*scale));
   const ctx=canvas.getContext('2d');if(!ctx)return original;
   ctx.drawImage(image,0,0,canvas.width,canvas.height);
   const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/webp',.82));
   canvas.width=canvas.height=0;
   if(ticket!==generation||!validToken()||!photos.includes(file))throw Error('Sessão alterada');
   if(!blob||blob.type!=='image/webp')return original;
   const url=URL.createObjectURL(blob);thumbs.set(file.id,url);return url;
  })();
  thumbFlights.set(file.id,task);
  try{return await task}finally{if(thumbFlights.get(file.id)===task)thumbFlights.delete(file.id);}
 }
 function pumpPreviews(){
  while(previewActive<PREVIEW_CONCURRENCY&&previewQueue.length){
   const {img,file,ticket}=previewQueue.shift();
   if(ticket!==generation||!img.isConnected||!validToken())continue;
   previewActive++;
   void thumbnail(file).catch(error=>{if(ticket!==generation||!validToken())throw error;return getImageUrl(file)}).then(url=>{if(ticket===generation&&validToken()&&img.isConnected)img.src=url}).catch(e=>{if(ticket===generation&&img.isConnected)img.alt=e.message}).finally(()=>{previewActive--;pumpPreviews()});
  }
 }
 function loadPreview(img,file){
  const load=()=>{previewQueue.push({img,file,ticket:generation});pumpPreviews()};
  if(!('IntersectionObserver' in window)){load();return}
  const watcher=new IntersectionObserver(items=>{if(items.some(x=>x.isIntersecting)){watcher.disconnect();load()}},{rootMargin:'150px'});watcher.observe(img);
 }
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
 const help=el('p','','Originais do perfil autenticado. Nenhum arquivo é alterado nesta consulta.');
 help.style.cssText='font-size:12px;margin:0 0 9px;color:#526c6a';
 const controls=el('div','');controls.style.cssText='display:flex;flex-wrap:wrap;align-items:center;gap:7px';
 const connect=el('button','','Conectar Drive');connect.type='button';connect.id='bm084-connect';connect.disabled=true;
 const refresh=el('button','','Atualizar imagens');refresh.type='button';refresh.id='bm084-refresh';refresh.disabled=true;
 const folder=el('span','','Acervo individual');
 const recovered=el('span','','');
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
 connect.disabled=false;refresh.disabled=false;connect.onclick=()=>void refreshList();
 refresh.onclick=()=>{void refreshList(true);};
 search.oninput=()=>{visible=24;render();};
 more.onclick=()=>{visible+=24;render();};
 $('imageSearch')?.addEventListener('input',()=>{visible=24;render()});
 document.addEventListener('bm218-image-filter-change',()=>{visible=24;render();});
 document.addEventListener('bm153-drive-filter-change',()=>{visible=24;render();});
 for(const id of ['imageFilter','imageAreaV044','bm155DisciplinaImagem','bm155AssuntoGeralImagem','bm155AssuntoEspecificoImagem','bm155SubassuntoImagem'])
  $(id)?.addEventListener('change',()=>{visible=24;render()});
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
 if((lastGoodAt||photos.length)&&renderedRecords!==photos){window.BM153ImageLibrary?.setDriveRecords?.(photos.map(info));renderedRecords=photos;}
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
  if(selectedStatus==='indexed'&&!m.indexed)return false;
  if(selectedStatus==='unindexed'&&m.indexed)return false;
  if(selectedStatus==='classified'&&!m.classified)return false;
  if(selectedStatus==='pending'&&m.classified)return false;
  // The private area and subject filters above are authoritative.
  // Classification only from this profile.
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
  actions.className='bm422-image-actions';actions.append(open);
  const frame=el('div','bm422-thumb');frame.append(pic);
  const linked=m.cards.length?el('small','',m.cards.length+' cartão(ões) relacionado(s) no índice'):null;
  if(linked)linked.style.cssText='display:block;font-size:10px;color:#52666a;margin-top:4px';
  const alias=aliases.get(file.id);
  const editorial=alias?.imageId?el('small','',alias.imageId):null;
  if(editorial)editorial.style.cssText='display:block;font-size:11px;color:#235c80;font-weight:700;margin:3px 0';
  card.append(frame,h,...(editorial?[editorial]:[]),category,...(linked?[linked]:[]),actions);
  card.dataset.privateImageId=file.id;
  grid.append(card);
  loadPreview(pic,file);
 }
 const more=$('bm084-more');if(more)more.hidden=items.length<=visible;
 const badge=$('bm205-drive-count');if(badge){
  const n=photos.filter(f=>f.indexed===true).length;
  badge.textContent=validToken()?n+' no índice · '+(photos.length-n)+' outros arquivos':'Conecte o Drive';
 }
 renderedView={shown:Math.min(items.length,visible),matching:items.length,available:photos.length,classified:photos.filter(f=>info(f).classified).length};
 document.dispatchEvent(new CustomEvent('bm209-drive-render',{detail:renderedView}));
}

 async function refreshList(force=false){
  if(pending)return pending;
  if(force!==true&&lastGoodAt&&validToken()){
   if($('imagens')?.classList.contains('active')){
    if(renderedRecords!==photos||!renderedView||renderedView.shown>0&&!$('imageRows')?.querySelector('article.bm209ImageFromDrive'))render();
    else window.BM209SingleImageViewer?.refresh?.();
   }
   return {found:photos.length,scope:'authenticated-profile'};
  }
  pending=(async()=>{
   try{msg('Consultando imagens privadas…');const list=await window.BMVS41PrivateImages.list(force===true);const next=list.map(x=>({...x,name:x.title}));const unchanged=JSON.stringify(photos)===JSON.stringify(next);if(!unchanged||force===true){release();photos=next;aliases.clear();}lastGoodAt=Date.now();lastError='';
    for(const f of photos)aliases.set(f.id,{imageId:f.editorialId||'',title:f.title,cardIds:f.card_ids});if($('imagens')?.classList.contains('active')&&(!unchanged||force===true||!renderedView||renderedRecords!==photos))render();
    $('imageCount').textContent=photos.length+' imagens';msg('Atlas e originais recuperados: '+photos.length+' imagens; '+photos.filter(f=>f.indexed===true).length+' nos índices históricos. Derivadas, miniaturas e demais pastas não entram na contagem.');$('bm207-sync-time').textContent='Consulta validada nesta sessão';
    // Visible previews are loaded by the bounded queue; don't download originals at login.
    return {found:photos.length,scope:'authenticated-profile'};
   }catch(e){release();photos=[];aliases.clear();lastGoodAt=0;lastError=e.message;renderedView=null;render();msg(e.message,true);return null}
   finally{pending=null}
  })();return pending;
 }
 function topicRecords(){return !validToken()||!lastGoodAt?null:photos.map(f=>({id:f.id,editorialId:f.editorialId||'',title:info(f).displayTitle,subject:f.subject,subsubject:f.subsubject,group:f.editorialGroup||f.area,cardIds:f.card_ids,description:f.description,name:f.filename||f.title,filename:f.filename||f.title,path:Array.isArray(f.path)?f.path.join(' / '):f.path,folderSubject:f.folderSubject,folderArea:f.folderArea,preview:()=>thumbnail(f),open:()=>openImage(f)}))}
 window.BancoMestreDriveImagesV182=Object.freeze({refresh:refreshList,async refreshAfterMove(){if(pending)await pending;return refreshList(true)},prepareTopicMetadata:async()=>{},topicRecords,
  get connected(){return validToken()},get lastSuccess(){return lastGoodAt?new Date(lastGoodAt).toISOString():null},get lastError(){return lastError},get lastCount(){return photos.length},get unverifiedCount(){return photos.filter(f=>f.indexed!==true).length},get alreadyPublic(){return 0},get atlasMode(){return 'drive_only'},get roots(){return []},getEditorialId:id=>photos.find(f=>f.id===id)?.editorialId||'',getImageUrlForCard:async id=>{if(!validToken())throw Error('Sessão não confirmada');const f=photos.find(x=>x.id===id);if(f)return getImageUrl(f);if(urls.has(id))return urls.get(id);if(downloads.has(id))return downloads.get(id);const ticket=generation,task=(async()=>{const blob=await window.BMVS41PrivateMedia.read('biblioteca',id);if(ticket!==generation||!validToken()||!/^image\/(png|jpeg|webp|gif|svg\+xml)$/.test(blob.type))throw Error('Imagem ou sessão alterada');const url=URL.createObjectURL(blob);urls.set(id,url);return url;})();downloads.set(id,task);try{return await task}finally{if(downloads.get(id)===task)downloads.delete(id)}}
 });
 function init(){ui();const section=$('imagens');let wasActive=section?.classList.contains('active');
  const enter=()=>{if(validToken())void refreshList(false);};
  if(section)new MutationObserver(()=>{const active=section.classList.contains('active');if(active===wasActive)return;wasActive=active;if(active)enter();}).observe(section,{attributes:true,attributeFilter:['class']});
  document.addEventListener('bm-vs41-session-ready',enter);document.addEventListener('bm-account-connected',enter);
  if(location.hash==='#imagens')enter();
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
 window.addEventListener('pagehide',release);
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
 ['#originalDriveLink','link',null]
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

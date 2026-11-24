/* V315 módulos IIFE originais 124–135, preservados */

;
/* 124 assets/v304_global_drive.js */
/* V304: ciclo automático Drive de 3 horas; OAuth, SRS e rotinas de segurança da V301 preservados. */
/* V268: relatório inclui PDFs listados, históricos e ocultos localmente. */
/* V263 — conexão Drive única no cabeçalho: biblioteca de imagens, PDFs,
   mestre de grifos e Controle de Estudos. A base pública e o SRS canônico não são gravados.
   Nenhum access token é persistido em localStorage, cookies ou GitHub. */
(function(){
'use strict';
if(window.BM239DriveGlobal)return;
const READ='https://www.googleapis.com/auth/drive.readonly',
 WRITE='https://www.googleapis.com/auth/drive.file';
let client=null,token='',expires=0,write=false,busy=false,ready=false,initialized=false,lastRun=0,
 lastReport=null,backgroundBusy=false,foregroundPromise=null,lastUiState={type:'loading',message:'Preparando conexão segura…'};
const $=id=>document.getElementById(id);
const media=()=>window.BancoMestreMediaSyncV182;
function active(){return token&&Date.now()<expires?token:''}
function writeToken(){return write?active():''}
function state(message,type='idle'){
 lastUiState={type,message:String(message||'')};
 const el=$('bm239-sync-details');
 if(el){el.textContent=message;el.dataset.state=type;el.title=message}
 const b=$('bm239-drive-action');
 if(b){b.dataset.connected=String(Boolean(active()||media()?.token?.()));b.disabled=busy||(!ready&&!initialized);
  b.textContent=busy?'Verificando…':active()?'Sincronizar Drive':!ready&&initialized?'Tentar conexão':'Conectar Drive';
  b.setAttribute('aria-busy',String(busy));
 }
}
function install(){
 const existing=$('bm239-drive-action');
 if(existing){
  existing.onclick=click;
  existing.title='Uma autorização para imagens, PDFs, grifos e Controle de Estudos. O SRS canônico permanece inalterado.';
  existing.type='button';
  const currentDetail=$('bm239-sync-details');
  if(currentDetail){
   currentDetail.setAttribute('role','status');
   currentDetail.setAttribute('aria-live','polite');
  }
  return;
 }
 const host=document.querySelector('body>header .head>.bm-v046-header-stats')||
            document.querySelector('body>header .head>.stats');
 if(!host)return;
 const btn=document.createElement('button');
 btn.id='bm239-drive-action';btn.type='button';
 btn.textContent='Conectar e sincronizar Drive';
 btn.disabled=true;
 btn.title='Uma autorização para imagens, PDFs, grifos e Controle de Estudos. O SRS canônico permanece inalterado.';
 btn.onclick=click;
 const detail=document.createElement('span');
 detail.id='bm239-sync-details';detail.setAttribute('role','status');
 detail.setAttribute('aria-live','polite');detail.textContent='Preparando conexão segura…';
 host.append(btn,detail);
}
async function gis(){
 if(window.google?.accounts?.oauth2?.initTokenClient)return;
 await new Promise((resolve,reject)=>{
  const old=document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
  if(old){
   let tries=0;const timeout=setInterval(()=>{
    if(window.google?.accounts?.oauth2?.initTokenClient){clearInterval(timeout);resolve()}
    else if(++tries>60){clearInterval(timeout);reject(Error('Google Identity Services não respondeu'))}
   },150);
   return;
  }
  const s=document.createElement('script');s.async=true;s.src='https://accounts.google.com/gsi/client';
  s.onload=resolve;s.onerror=()=>reject(Error('Não foi possível carregar o Google Identity Services'));document.head.append(s);
 });
}
async function prepare(){
 try{
  const response=await fetch('assets/drive_auth_v038.json',{cache:'no-store'});
  if(!response.ok)throw Error('Configuração OAuth não encontrada');
  const config=await response.json();
  if(!/^[A-Za-z0-9_.-]+\.apps\.googleusercontent\.com$/.test(config.client_id||''))
   throw Error('Client ID OAuth inválido');
  if(config.authorized_javascript_origin&&location.origin!==config.authorized_javascript_origin)
   throw Error('Esta origem não está registrada no OAuth do projeto');
  await gis();
  client=google.accounts.oauth2.initTokenClient({
   client_id:config.client_id,
   scope:READ+' '+WRITE,
   include_granted_scopes:true,
   callback:r=>{
    if(r?.error||!r?.access_token){busy=false;state('Conexão não autorizada. Nenhum dado foi modificado.','error');return;}
    token=r.access_token;expires=Date.now()+Math.max(60,Number(r.expires_in||3600)-90)*1000;
    // Conferir escopo concedido antes de enviar dados privados.
    const scopes=String(r.scope||'').split(/\s+/);
    write=scopes.includes(WRITE);
    media()?.publishToken(token,Number(r.expires_in||3600));
    void syncAll();
   },
   error_callback:e=>{busy=false;state('Falha na autorização: '+String(e?.type||e?.message||'indisponível'),'error')}
  });
  ready=true;initialized=true;
  document.documentElement.classList.add('bm239-global-ready');
  state(media()?.token?.()?'Drive conectado para leitura; clique no botão para habilitar a sincronização privada.':'Drive desconectado · conecte uma vez para consultar e sincronizar.','idle');
 }catch(e){ready=false;initialized=true;document.documentElement.classList.remove('bm239-global-ready');state('Conexão central indisponível: '+e.message+' · clique em Tentar conexão.','error')}
}
function click(){
 if(busy)return;
 if(!ready){initialized=false;state('Preparando nova tentativa de conexão…','loading');void prepare();return;}
 if(active()&&write){void syncAll();return}
 // Invocar o Google diretamente no gesto do clique, não após um await.
 busy=true;state('Aguardando autorização do Google…');
 try{client.requestAccessToken({prompt:active()?'':'consent'})}
 catch(e){busy=false;state('Não foi possível abrir a autorização: '+e.message,'error')}
}
function syncAll(){
 if(foregroundPromise)return foregroundPromise;
 foregroundPromise=runSyncAll().finally(()=>{foregroundPromise=null});
 return foregroundPromise;
}
async function runSyncAll(){
 busy=true;lastReport={running:true};state('Conferindo Drive…','syncing');
 const notes=[],warnings=[],pending=[],modules={};
 const confirmed=(key,text)=>{modules[key]={state:'verified',message:text};notes.push(text)};
 const awaiting=(key,text)=>{modules[key]={state:'pending',message:text};pending.push(text)};
 const failed=(key,text)=>{modules[key]={state:'error',message:text};warnings.push(text)};
 const conflict=(key,text)=>{modules[key]={state:'conflict',message:text};warnings.push(text)};
 const classify=(key,r,label)=>{
  const text=String(r?.message||label+': não conferido');
  if(['uploaded','downloaded','unchanged','verified'].includes(r?.state))confirmed(key,text);
  else if(r?.state==='empty'||r?.state==='pending'||!r)awaiting(key,text);
  else if(['conflict','merge_ready'].includes(r?.state))conflict(key,text);
  else failed(key,text);
 };
 try{
  const m=media();
  if(!m?.token?.())throw Error('Token de leitura não foi disponibilizado ao portal');
  const started=Date.now();
  // O núcleo V263 compartilha a mesma Promise entre consultas concorrentes.
  const result=await m.syncAll();
  const fresh=Number.isFinite(Date.parse(result?.at||''))&&Date.parse(result.at)>=started-10000;
  const pdf=fresh?result?.pdf:null,img=fresh?result?.img:null;
  const pdfFolders=pdf?.folders==null?NaN:Number(pdf.folders);
  const pdfFound=pdf?.found==null?NaN:Number(pdf.found);
  const historical=pdf?.static==null?NaN:Number(pdf.static);
  if(pdf?.source==='google_drive_only'&&Number.isSafeInteger(pdfFolders)&&pdfFolders>0&&
     Number.isSafeInteger(pdfFound)&&pdfFound>=0&&Number.isSafeInteger(historical)&&historical>=0&&historical<=78){
   const listed=Number(pdf.listed),archived=Number(pdf.archived),hiddenLocal=Number(pdf.hiddenLocal);
    confirmed('pdfs','PDFs: '+pdfFound+' encontrados em '+pdfFolders+' pastas; '+
      (Number.isSafeInteger(listed)?listed:pdfFound)+' listados, '+
      (Number.isSafeInteger(archived)?archived:0)+' históricos e '+
      (Number.isSafeInteger(hiddenLocal)?hiddenLocal:0)+' ocultos localmente; '+
      historical+' dos 78 IDs históricos conferidos');
  }else{
   const text=String($('bm-pdf-sync-status')?.textContent||'');
   if(/incompleta|erro|falha|não foi possível/i.test(text))failed('pdfs','PDFs: '+text.slice(0,270));
   else awaiting('pdfs','PDFs: nenhuma varredura concluída nesta ação; catálogo de 78 referências mantido');
  }
  const gallery=window.BancoMestreDriveImagesV182;
  const imgFound=img?.found==null?NaN:Number(img.found);
  const galleryCount=gallery?.lastCount==null?NaN:Number(gallery.lastCount);
  const freshGallery=Date.parse(gallery?.lastSuccess||'')>=started-10000;
  if(img?.scope==='atlas_authenticated_session_only'&&Number.isSafeInteger(imgFound)&&imgFound>=0&&
     Number.isSafeInteger(galleryCount)&&galleryCount===imgFound&&freshGallery&&!gallery?.lastError)
   confirmed('atlas','Atlas: '+imgFound+' originais únicos verificados no Drive');
  else if(gallery?.lastError)failed('atlas','Atlas: '+String(gallery.lastError).slice(0,270));
  else awaiting('atlas','Atlas: consulta dos originais não concluída nesta ação; catálogo público preservado');
  if(writeToken()){
   const tokenNow=writeToken();
   const controlApi=window.BM240ControlDrive;
   const ctl=controlApi?.sync?await controlApi.sync(tokenNow):null;
   classify('control',ctl,'Controle');
   if(['uploaded','downloaded','unchanged'].includes(ctl?.state)){
    const backupApi=window.BM240StudyBackups;
    const backup=backupApi?.afterSync?await backupApi.afterSync(tokenNow):null;
    classify('backup',backup,'Backup');
   }else awaiting('backup','Backup: não executado; Controle ainda não confirmado');
   const lacunasApi=window.BM242LacunasDrive;
   const gaps=lacunasApi?.sync?await lacunasApi.sync(tokenNow):null;
   classify('lacunas',gaps,'Lacunas');
   const g=window.BancoMestreGrifosDriveSyncV104;
   if(g?.sync){
    try{
     const before=Number(g.lastSync)||0;
     await g.sync();
     const resultText=String(g.lastStatus||'');
     const now=Number(g.lastSync)||0;
     if(now>before&&/^Cores\/grifos confirmados no Drive:/.test(resultText)&&
        /Sem divergências detectadas\./.test(resultText))
      confirmed('grifos','Grifos: mestre privado conferido sem divergências');
     else if(/Existem \d+ divergência\(s\)/i.test(resultText))conflict('grifos','Grifos: '+resultText.slice(0,270));
     else if(/^Não sincronizado|não foi possível|falha|erro/i.test(resultText))failed('grifos','Grifos: '+resultText.slice(0,270));
     else awaiting('grifos',/Feche o PDF/i.test(resultText)?'Grifos: feche o PDF para sincronizar':
      'Grifos: nenhuma nova conferência confirmada; dados locais preservados');
    }catch(e){failed('grifos','Grifos: '+String(e?.message||e))}
   }else awaiting('grifos','Grifos: módulo de sincronização não inicializado');
  }else{
   for(const key of ['control','backup','lacunas','grifos'])
    awaiting(key,'Permissão de escrita Drive não concedida para '+key+'; nenhuma transferência presumida');
  }
  lastRun=Date.now();
  try{window.BM208AtlasUnified?.refresh?.()}catch(e){}
  const complete=warnings.length===0&&pending.length===0;
  const summary=warnings.length?'Drive: '+notes.length+' conferidos · '+warnings.length+' erro(s) · '+pending.length+' pendentes':
    pending.length?'Drive: '+notes.length+' conferidos · '+pending.length+' pendentes':
    'Drive: '+notes.length+' módulos conferidos';
  lastReport={at:new Date().toISOString(),notes,warnings,pending,modules,summary,complete,running:false};
  state(summary,warnings.length?'partial':pending.length?'pending':'ok');
  document.dispatchEvent(new CustomEvent('bm239-sync-finished',{detail:{complete,at:lastReport.at,errors:warnings.length,pending:pending.length}}));
  return lastReport;
 }catch(e){
  const message='Conexão: '+String(e?.message||e);
  failed('connection',message);
  lastReport={at:new Date().toISOString(),notes,warnings,pending,modules,
    summary:'Drive: erro de conexão · ver detalhes',complete:false,running:false};
  state(lastReport.summary,'error');
  document.dispatchEvent(new CustomEvent('bm239-sync-finished',{detail:{complete:false,at:lastReport.at,errors:warnings.length,pending:pending.length}}));
  return lastReport;
 }finally{
  busy=false;
  const b=$('bm239-drive-action');
  if(b){b.disabled=!ready;b.textContent=active()?'Sincronizar Drive':'Conectar Drive';b.setAttribute('aria-busy','false')}
 }
}

function init(){
 install();
 document.addEventListener('bm-media-drive-authorized',()=>{
  if(!busy&&!active())state('Drive autorizado para arquivos de leitura. Use o botão único para sincronizar também dados privados.');
 });
 // V326: a conferência inicial já é executada ao autorizar o Drive.
 // Depois dela, Controle e Lacunas só gravam após mudança local confirmada,
 // preservando a verificação de conflitos e os backups existentes.
 const pendingKinds=new Set();
 let pendingTimer=null;
 async function flushPending(){
  pendingTimer=null;
  if(!pendingKinds.size||!writeToken())return;
  if(busy||foregroundPromise||backgroundBusy){
   pendingTimer=setTimeout(()=>{void flushPending()},2500);return;
  }
  backgroundBusy=true;
  const keys=new Set(pendingKinds);pendingKinds.clear();
  const tokenNow=writeToken();
  try{
   if(keys.has('control')){
    const ctl=window.BM240ControlDrive;
    const result=ctl?.sync?await ctl.sync(tokenNow):null;
    if(['uploaded','downloaded','unchanged'].includes(result?.state)){
     const backups=window.BM240StudyBackups;
     if(backups?.afterSync){
      const b=await backups.afterSync(tokenNow);
      if(b&&!['verified','unchanged','empty'].includes(b.state))
       state(b.message||'Backup: verificação necessária','partial');
     }
    }else state(result?.message||'Controle: alteração local ainda pendente','partial');
   }
   if(keys.has('lacunas')){
    const lacunas=window.BM242LacunasDrive;
    const result=lacunas?.sync?await lacunas.sync(tokenNow):null;
    if(!result||['conflict','error','partial'].includes(result.state))
     state(result?.message||'Lacunas: alteração local ainda pendente','partial');
   }
  }catch(e){state('Salvamento após edição: '+String(e?.message||e),'partial')}
  finally{
   backgroundBusy=false;
   if(pendingKinds.size&&!pendingTimer)pendingTimer=setTimeout(()=>{void flushPending()},4000);
  }
 }
 function changed(kind){
  pendingKinds.add(kind);
  if(pendingTimer)clearTimeout(pendingTimer);
  pendingTimer=setTimeout(()=>{void flushPending()},5000);
 }
 window.addEventListener('bm240-study-changed',()=>changed('control'));
 document.addEventListener('bm242-lacunas-change',()=>changed('lacunas'));
 void prepare();
}
window.BM239DriveGlobal=Object.freeze({
 get connected(){return Boolean(active()||media()?.token?.())},
 get writeAuthorized(){return Boolean(writeToken())},writeToken,
 sync:()=>syncAll(),get lastReport(){return lastReport},
 get connectionStatus(){return {ready,initialized,connected:Boolean(active()||media()?.token?.()),writeAuthorized:Boolean(writeToken()),state:lastUiState.type,message:lastUiState.message};}
});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
else init();
})();

;
/* 125 assets/v266_sync_truth.js */
/* V263 — indicadores de VERIFICAÇÃO, distintos de contagens de catálogo.
   Nunca qualifica SRS, cartões, nem grifos divergentes como sincronizados. */
(function(){
'use strict';
if(window.BM241SyncTruth)return;
const $=id=>document.getElementById(id);
const TYPES=[
 {key:'pdfs',label:'PDFs',evidence:/^PDFs: consulta do Drive concluída,/i,warn:/^PDFs:|^Consulta de mídias/i},
 {key:'cards',label:'Cartões',excluded:true},
 {key:'atlas',label:'Imagens',evidence:/\d+ imagens originais consultadas no Drive/i,warn:/^Atlas:|^Consulta de mídias/i},
 {key:'control',label:'Controle',evidence:/^Controle:/i,warn:/^Controle:|^Permissão drive\.file/i},
 {key:'grifos',label:'Grifos',evidence:/Grifos: mestre privado conferido, sem divergências/i,warn:/^Grifos:|^Permissão drive\.file/i}
];
let nodes=new Map();
function makeStat(host,key){
 const stat=document.createElement('div');
 stat.className='stat bm241-'+key;
 stat.dataset.bm241Extra=key;
 const count=document.createElement('b');count.textContent=key==='control'?'0':'—';
 const caption=document.createElement('span');
 caption.textContent=key==='control'?'sessões locais':'grifos privados';
 stat.append(count,caption);host.insertBefore(stat,$('bm239-drive-action'));
 return stat;
}
function attach(){
 const host=document.querySelector('body>header .head>.bm-v046-header-stats');
 if(!host)return;
 const orig=Array.from(host.querySelectorAll(':scope > .stat')).filter(e=>!e.dataset.bm241Extra);
 if(orig.length<3)return;
 const dest={pdfs:orig[0],cards:orig[1],atlas:orig[2],
  control:host.querySelector('[data-bm241-extra="control"]')||makeStat(host,'control'),
  grifos:host.querySelector('[data-bm241-extra="grifos"]')||makeStat(host,'grifos')};
 for(const t of TYPES){
  const node=dest[t.key];if(!node)continue;
  const old=node.querySelector('.bm240-sync-state');old?.remove();
  let status=node.querySelector('.bm241-verification');
  if(!status){status=document.createElement('small');status.className='bm241-verification';node.append(status)}
  nodes.set(t.key,{node,status});
 }
}
function icon(key,label,state,detail){
 const entry=nodes.get(key);if(!entry)return;
 const {node,status}=entry;
 if(status.textContent!==label)status.textContent=label;
 status.title=detail;
 node.dataset.syncStatus=state;node.dataset.bm241Verification=state;
 node.title=detail;
 const cnt=node.querySelector('b')?.textContent||'';
 const caption=node.querySelector('span')?.textContent||'';
 node.setAttribute('aria-label',cnt+' — '+caption+'. '+detail);
}
function localSessions(){
 try{const d=JSON.parse(localStorage.getItem('BM245_CONTROLE_ESTUDOS')||'null');
  return Array.isArray(d?.sessions)?d.sessions.length:0;
 }catch(_){return null}
}
function refresh(){
 if(nodes.size<5){attach();if(nodes.size<5)return}
 const control=nodes.get('control').node,local=localSessions();
 control.querySelector('b').textContent=local==null?'—':String(local);
 const global=window.BM239DriveGlobal,report=global?.lastReport;
 const connected=Boolean(global?.connected);
 const running=$('bm239-drive-action')?.getAttribute('aria-busy')==='true';
 const live=Boolean(report?.at&&Array.isArray(report?.notes)&&Array.isArray(report?.warnings));
 const modules=live?(report.modules||{}):{};
 icon('cards',window.BM184Header?.counts?.cardsLoaded?'Catálogo carregado':'Aguardando catálogo','excluded',
  'Catálogo oficial '+BM_CATALOG.display_version+' · '+BM_CATALOG.counts.active.toLocaleString('pt-BR')+' ativos. A conexão não publica cartões nem altera eventos SRS.');
 for(const t of TYPES.filter(t=>!t.excluded)){
  if(running){icon(t.key,'Verificando','syncing',t.label+': conferência em execução');continue}
  const status=modules[t.key];
  if(status){
   const detail=t.label+': '+String(status.message||'').slice(0,1000);
   if(status.state==='verified')
    icon(t.key,connected?'✓ Conferido':'Última conferência',connected?'verified':'pending',detail);
   else if(status.state==='conflict')
    icon(t.key,'Conflito','partial',detail+'. Originais não substituídos.');
   else if(status.state==='error')
    icon(t.key,'Falha','error',detail+'. Originais preservados.');
   else if(status.state==='pending')
    icon(t.key,t.key==='control'&&/sem registros locais|não existe arquivo/i.test(detail)?'Sem dados':'Pendente','pending',detail);
   else icon(t.key,'Não verificado','pending',detail);
  }else icon(t.key,connected?'Não verificado':'Drive desconectado','pending',
   t.label+': nenhuma conferência atual nesta sessão.'+
   (t.key==='control'?' Histórico local: '+(local==null?'indisponível':local+' sessões'):''));
 }
 const grifos=window.BancoMestreGrifosDriveSyncV104;
 const grifosText=String(grifos?.lastStatus||'');
 const match=grifosText.match(/^Cores\/grifos confirmados no Drive:\s*(\d+)\s*registro/);
 if(match){
  const node=nodes.get('grifos')?.node;
  if(node){node.querySelector('b').textContent=match[1];
   node.querySelector('span').textContent='páginas';}
 }
 const info=$('bm239-sync-details');
 if(info){
  if(running){info.textContent='Verificando…';info.dataset.state='syncing'}
  else if(live){
   const errors=report.warnings.length,pending=(report.pending||[]).length,okay=report.notes.length;
   info.textContent=errors?errors+' erro(s) · detalhes':pending?pending+' pendente(s) · detalhes':okay+' conferidos · detalhes';
   info.dataset.state=errors?'partial':pending?'pending':'ok';
   info.title=report.summary||info.textContent;
  }else{
   // Não encobrir o estado OAuth comunicado pelo módulo central.
   const connection=global?.connectionStatus;
   const message=String(connection?.message||'');
   if(message){info.textContent=message;info.dataset.state=connection.state||'idle';}
   else if(!String(info.textContent||'').trim()){
    info.textContent=connected?'Drive autorizado · verifique os módulos':'Drive desconectado · clique em Conectar Drive';
    info.dataset.state='idle';
   }
  }
 }
}

function init(){
 attach();refresh();
 document.addEventListener('bm239-sync-finished',refresh);
 document.addEventListener('bm-media-drive-authorized',refresh);
 window.addEventListener('focus',refresh);
 document.addEventListener('visibilitychange',()=>{if(!document.hidden)refresh()});
 // V326: status atualizado por eventos, não a cada 2,5 segundos.
}
window.BM241SyncTruth=Object.freeze({refresh,get snapshot(){
 return Object.fromEntries([...nodes].map(([k,v])=>[k,{state:v.node.dataset.syncStatus,text:v.status.textContent}]));
}});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
else init();
})();


;
/* 126 assets/v268_sync_diagnostics.js */
/* V268: diagnóstico informa conexão ativa como verificada. */
/* V263 — painel de diagnósticos, somente leitura, sem tokens e sem modificar dados. */
(function(){
'use strict';
if(window.BM263SyncPanel)return;
const $=id=>document.getElementById(id);
const labels={pdfs:'PDFs',atlas:'Imagens/Atlas',control:'Controle de Estudos',
 backup:'Backup do Controle',lacunas:'Lacunas',grifos:'Grifos',connection:'Conexão Google'};
const keys=Object.keys(labels);
function summary(){
 const rep=window.BM239DriveGlobal?.lastReport;
 const connection=window.BM239DriveGlobal?.connectionStatus;
 const entries=keys.map(key=>{
  const info=rep?.modules?.[key];
  if(key==='connection'&&!info){
   const active=Boolean(connection?.ready&&connection?.connected);
   const state=active?'verified':connection?.state==='error'?'error':'not_checked';
   const message=active
     ?(connection?.writeAuthorized?'Drive conectado: leitura e escrita autorizadas nesta sessão':'Drive conectado: leitura autorizada nesta sessão')
     :String(connection?.message||'Nenhuma autorização iniciada nesta sessão');
   return {key,label:labels[key],state,message};
  }
  return {key,label:labels[key],state:String(info?.state||'not_checked'),
   message:String(info?.message||'Nenhuma verificação recente deste módulo')};
 });
 return {version:document.documentElement.dataset.bmPortalVersion||'V263',
  connection:{ready:Boolean(connection?.ready),connected:Boolean(connection?.connected),
   writeAuthorized:Boolean(connection?.writeAuthorized),state:String(connection?.state||'not_initialized'),
   message:String(connection?.message||'Conexão não inicializada')},
  at:rep?.at||null,complete:rep?.complete===true,
  checked:Array.isArray(rep?.notes)?rep.notes.length:0,
  pending:Array.isArray(rep?.pending)?rep.pending.length:0,
  errors:Array.isArray(rep?.warnings)?rep.warnings.length:0,
  modules:entries,srs:'Canônico preservado; não sincronizado por esta ação'};
}
function make(tag,text,className){
 const el=document.createElement(tag);if(text!==undefined)el.textContent=text;
 if(className)el.className=className;return el;
}
function build(){
 if($('bm263-sync-panel'))return $('bm263-sync-panel');
 const panel=make('aside');panel.id='bm263-sync-panel';panel.hidden=true;
 panel.setAttribute('role','region');panel.setAttribute('aria-label','Diagnóstico da sincronização Drive');
 const row=make('div',undefined,'bm263-actions');
 const copy=make('button','Copiar diagnóstico');copy.id='bm263-copy-diagnostic';copy.type='button';
 const close=make('button','Fechar');close.id='bm263-close-diagnostic';close.type='button';
 row.append(copy,close);
 panel.append(make('h3','Sincronização do Google Drive'),row);
 const summaryEl=make('p');summaryEl.id='bm263-report-summary';panel.append(summaryEl);
 const list=make('dl');list.id='bm263-report-list';panel.append(list);
 const note=make('p','Catálogos e SRS não representam transferência. Erros e conflitos não sobrescrevem originais.');panel.append(note);
 document.body.append(panel);
 close.onclick=()=>toggle(false);
 copy.onclick=async()=>{
  const report=summary();
  const message=JSON.stringify(report,null,2);
  try{await navigator.clipboard.writeText(message);copy.textContent='Copiado';}
  catch(_){copy.textContent='Use o painel para relatar o erro';}
 };
 return panel;
}
function render(){
 const panel=$('bm263-sync-panel');if(!panel||panel.hidden)return;
 const report=summary(),at=report.at?new Date(report.at).toLocaleString('pt-BR'):'nenhuma execução confirmada';
 const status=!report.at?'nenhuma verificação executada':report.errors?report.errors+' erro(s)':report.pending?report.pending+' pendência(s)':'sem erros registrados';
 $('bm263-report-summary').textContent='Última conferência: '+at+' · '+report.checked+
  ' módulo(s) confirmado(s) · '+status+'. '+report.connection.message;
 const dl=$('bm263-report-list');dl.replaceChildren();
 for(const r of report.modules){
  dl.append(make('dt',r.label+' — '+({verified:'Conferido',pending:'Pendente',error:'Erro',conflict:'Conflito'}[r.state]||'Não verificado')),
   make('dd',r.message));
 }
 dl.append(make('dt','Cartões e SRS'),make('dd',report.srs));
}
function toggle(force){
 const panel=build();
 const open=typeof force==='boolean'?force:panel.hidden;
 panel.hidden=!open;
 const trigger=$('bm239-sync-details');
 if(trigger)trigger.setAttribute('aria-expanded',String(open));
 if(open)render();
}
function init(){
 const el=$('bm239-sync-details');if(!el)return;
 el.setAttribute('role','button');el.setAttribute('tabindex','0');
 el.setAttribute('aria-controls','bm263-sync-panel');el.setAttribute('aria-expanded','false');
 el.title='Abrir relatório dos módulos do Google Drive sem expor dados de autorização';
 el.addEventListener('click',()=>toggle());
 el.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();toggle()}});
 document.addEventListener('bm239-sync-finished',render);
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!$('bm263-sync-panel')?.hidden)toggle(false)});
 build();
}
window.BM263SyncPanel=Object.freeze({open:()=>toggle(true),close:()=>toggle(false),get diagnostic(){return summary()}});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();


;
/* 127 assets/v245_timer_bridge.js */
/* V241 — cronômetro compacto no cabeçalho e no título/ícone da aba.
   Usa a MESMA sessão do Controle de Estudos; nunca grava eventos SRS. */
(function(){
'use strict';
if(window.BM241TimerHeader)return;
const PREFIX='bm241-',BASE_TITLE=document.title;
const $=id=>document.getElementById(PREFIX+id);
const CLOCK='BM245_CONTROLE_TIMER';
let state=null,subjSignature='',areaSignature='',knownSubjects=[],currentSubject='',pendingSubject='',ready=false;
const examples=[
 'Agregados','Cimento e concreto','Estruturas de aço','Estruturas de madeira','ETE ETA',
 'Gerenciamento Orçamentação','Hidráulica e Hidrologia','Isostática','NBR 10844 Pluvial',
 'NBR 14653','NBR 15575','NBR 5410 Elétrica','NBR 5626 Água','NBR 5674 Manutenção Predial',
 'NBR 6118','NBR 6122 Fundações','NBR 8160 Esgoto','NBR 9050','NBR 9077',
 'Patologia e ensaios','Pontes e obras de arte','PTV Hiperestática','Resistência dos Materiais',
 'Rodovias','Solos','Terraplenagem e Obras de Terra','Topografia'
];
function el(tag,cls,txt){const n=document.createElement(tag);if(cls)n.className=cls;if(txt!==undefined)n.textContent=txt;return n;}
function nativeRoot(){return document.getElementById('bm240-native-host')?.shadowRoot||null}
function request(){
 const t=window.BM240ControlApp?.timer;
 if(!t){ready=false;setStatus();return}
 state={kind:t.running?'running':t.elapsedMs>0?'paused':'idle',elapsedMs:t.elapsedMs,
  sentAt:Date.now(),subjectId:t.subjectId,subjectName:t.subjectName,topic:t.topic,
  general:t.general||'',specific:t.specific||'',subtopic:t.subtopic||'',
  subjects:t.subjects,topics:[],transferPending:t.transferPending,availableForTransfer:t.availableForTransfer};
 ready=true;render();
}
function command(action,fields={}){
 const root=nativeRoot(),app=window.BM240ControlApp;
 if(!root||!app){const msg=$('status');if(msg)msg.textContent='Controle nativo ainda indisponível';return}
 if(action==='request'){request();return}
 if(action==='new-subject'){
  try{const id=app.createSubject(fields.name);pendingSubject=fields.name;
   request();$('subject').value=id;currentSubject=id;updateTopicOptions();}
  catch(e){$('status').textContent='Matéria não cadastrada: '+e.message}
  return;
 }
 const mapping={start:'timerStart',resume:'timerStart',pause:'timerPause',save:'timerSave','discard-confirmed':'timerDiscard'};
 const target=root.getElementById(mapping[action]);
 if(!target){$('status').textContent='Comando do cronômetro indisponível';return}
 if(action==='start'){
  const subject=root.getElementById('timerSubject'),topic=root.getElementById('timerTopic');
  subject.value=fields.subjectId||'';
  const general=root.getElementById('timerGeneral'),specific=root.getElementById('timerSpecific'),
   subtopic=root.getElementById('timerSubtopic');
  const areas=app.catalogForSubject?.(subject.value)||[];
  general.replaceChildren(new Option('Selecione a matéria',''));
  for(const a of areas)general.add(new Option(a.name,a.name));
  general.value=fields.general||'';
  specific.value=String(fields.specific||'').slice(0,220);
  subtopic.value=String(fields.subtopic||'').slice(0,220);
  topic.value=String(fields.topic||fields.specific||'').slice(0,220);
 }
 if(action==='discard-confirmed')window.BM240DiscardConfirmed=true;
 target.click();
 if(action==='discard-confirmed')window.BM240DiscardConfirmed=false;
 request();
 const notice=root.getElementById('timerStatus')?.textContent||'';
 if(/bloquead|pendente|falha|inexistente|outro dispositivo|não foi possível|erro/i.test(notice))
  $('status').textContent=notice;
}

function fmt(ms){
 const s=Math.floor(Math.max(0,Number(ms)||0)/1000);
 const h=Math.floor(s/3600),m=Math.floor(s/60)%60,v=s%60;
 return (h?h+'h ':'')+m+'m '+String(v).padStart(2,'0')+'s';
}
function elapsed(){
 if(!state)return 0;
 return Math.max(0,Number(state.elapsedMs)||0)+(state.running?Math.max(0,Date.now()-Number(state.sentAt||Date.now())):0);
}
function iconSVG(paused){
 const color=paused?'#ae7b30':'#087468';
 const inner=paused?'<rect x="9" y="8" width="2" height="8" rx=".4"/><rect x="13" y="8" width="2" height="8" rx=".4"/>':
  '<path d="m10 8 6 4-6 4z" fill="currentColor" stroke="none"/>';
 return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">'+
  '<circle cx="12" cy="13" r="8" fill="white" stroke="'+color+'" stroke-width="2"/>'+
  '<path d="M10 2h4M12 2v3M18.5 6l1.5-1.5" stroke="'+color+'" stroke-width="2" stroke-linecap="round"/>'+
  '<g fill="'+color+'" stroke="'+color+'">'+inner+'</g></svg>';
}
function updateTab(){
 if(!state||state.kind==='idle'){
  if(document.title!==BASE_TITLE)document.title=BASE_TITLE;
  document.getElementById('bm241-clock-favicon')?.remove();return;
 }
 const sign=state.kind==='running'?'▶':'⏸';
 const label=(state.subjectName||'Estudo')+(state.topic?' - '+state.topic:'');
 const title=sign+' '+fmt(elapsed())+' - '+label.slice(0,75)+' | Banco Mestre';
 if(document.title!==title)document.title=title;
 let link=document.getElementById('bm241-clock-favicon');
 if(!link){link=document.createElement('link');link.id='bm241-clock-favicon';link.rel='icon';link.type='image/svg+xml';document.head.append(link)}
 const next='data:image/svg+xml,'+encodeURIComponent(iconSVG(state.kind==='paused'));
 if(link.href!==next)link.href=next;
}
function setStatus(){
 const msg=$('status');
 if(!msg)return;
 if(!ready){msg.textContent='Carregando Controle de Estudos nativo…';msg.dataset.kind='pending'}
 else if(!state||state.kind==='idle'){msg.textContent='Sem atividade em andamento · registro local';msg.dataset.kind='idle'}
 else if(state.kind==='running'){msg.textContent='Estudando · tempo líquido ativo';msg.dataset.kind='running'}
 else{msg.textContent=state?.transferPending?'Transferência pendente de confirmação no Drive':state?.availableForTransfer?'Sessão liberada para transferência':'Pausado · tempo líquido preservado';msg.dataset.kind='paused'}
}
function updateTopicOptions(){
 const list=$('topic-list'),subList=$('subtopic-list'),area=$('area'),id=$('subject').value;
 if(!list||!area||!subList)return;
 const branches=window.BM240ControlApp?.catalogForSubject?.(id)||[];
 const signature=id+'|'+branches.map(x=>x.name).join('|');
 if(signature!==areaSignature){
  const old=area.value||((state?.subjectId===id)?state.general:'');
  area.replaceChildren(new Option('Matéria / assunto geral',''));
  for(const x of branches)area.add(new Option(x.name,x.name));
  area.value=branches.some(x=>x.name===old)?old:'';
  areaSignature=signature;
 }
 const selected=branches.find(x=>x.name===area.value);
 const subjects=selected?.subjects||[];
 list.replaceChildren();
 for(const value of subjects.map(x=>x.name)){
  const opt=document.createElement('option');opt.value=value;list.append(opt);
 }
 const specific=subjects.find(x=>x.name===$('topic').value);
 subList.replaceChildren();
 for(const value of specific?.subtopics||[]){
  const opt=document.createElement('option');opt.value=value;subList.append(opt);
 }
}
function updateSubjectOptions(){
 const subjects=Array.isArray(state?.subjects)?state.subjects:[];
 const sig=subjects.map(s=>s.id+'|'+s.name).join('\n');
 if(sig===subjSignature)return;
 subjSignature=sig;knownSubjects=subjects;
 const select=$('subject');if(!select)return;
 const previously=select.value||currentSubject;
 select.replaceChildren(new Option('Escolha a disciplina',''));
 for(const s of subjects)select.add(new Option(s.name,s.id));
 let chosen=subjects.some(s=>s.id===previously)?previously:'';
 if(pendingSubject){
  const match=subjects.find(s=>s.name.toLocaleLowerCase('pt-BR')===pendingSubject.toLocaleLowerCase('pt-BR'));
  if(match){chosen=match.id;pendingSubject='';}
 }
 select.value=chosen;currentSubject=chosen;
 updateTopicOptions();
}
function render(){
 if(!state)return;
 updateSubjectOptions();
 const active=state.kind!=='idle';
 const controls=$('choose'),live=$('live');
 controls.hidden=active;live.hidden=!active;
 $('elapsed').textContent=fmt(elapsed());
 $('subject-label').textContent=state.subjectName||'Estudo';
 $('subject-label').title=state.subjectName||'Estudo';
 $('topic-label').textContent=state.topic?' · '+state.topic:'';
 $('topic-label').title=state.topic||'';
 $('run-icon').textContent=state.kind==='running'?'▶':'⏸';
 $('pause').hidden=state.kind!=='running';
 $('resume').hidden=state.kind!=='paused';
 $('save').hidden=state.kind!=='paused';
 $('discard').hidden=state.kind!=='paused';
 setStatus();updateTab();
}
function init(){
 if($('bar'))return;
 const head=document.querySelector('body>header .head');
 if(!head)return;
 const bar=el('div','bm241-timer-bar');bar.id='bm241-bar';
 bar.setAttribute('aria-label','Cronômetro de estudo');
 const idle=el('div','bm241-timer-choose');idle.id='bm241-choose';
 const subject=el('select');subject.id='bm241-subject';subject.setAttribute('aria-label','Disciplina');subject.add(new Option('Escolha a disciplina',''));
 const area=el('select');area.id='bm241-area';area.setAttribute('aria-label','Matéria / assunto geral');area.add(new Option('Matéria / assunto geral',''));
 const topic=el('input');topic.id='bm241-topic';topic.type='text';topic.maxLength=140;topic.placeholder='Conteúdo, ex.: NBR 6118';topic.setAttribute('aria-label','Conteúdo');
 const list=el('datalist');list.id='bm241-topic-list';topic.setAttribute('list',list.id);
 const subtopic=el('input');subtopic.id='bm241-subtopic';subtopic.type='text';subtopic.maxLength=220;
 subtopic.placeholder='Subassunto (opcional)';subtopic.setAttribute('aria-label','Subassunto');
 const subList=el('datalist');subList.id='bm241-subtopic-list';subtopic.setAttribute('list',subList.id);
 const start=el('button','bm241-primary','▶ Iniciar');start.type='button';start.id='bm241-start';
 const add=el('button','bm241-add','+ Nova matéria');add.id='bm241-add';add.type='button';
 const create=el('div','bm241-create');create.id='bm241-create';create.hidden=true;
 const name=el('input');name.id='bm241-new-name';name.placeholder='Nome da matéria';name.maxLength=80;name.setAttribute('aria-label','Nova matéria');
 const createBtn=el('button','','Salvar matéria');createBtn.type='button';createBtn.id='bm241-new-save';
 const cancel=el('button','','Cancelar');cancel.type='button';cancel.id='bm241-new-cancel';
 create.append(name,createBtn,cancel);
 idle.append(subject,area,topic,list,subtopic,subList,start,add,create);
 const live=el('div','bm241-timer-live');live.id='bm241-live';live.hidden=true;
 const label=el('span','bm241-timer-label');
 const ico=el('span','bm241-live-glyph');ico.id='bm241-run-icon';
 const sn=el('strong');sn.id='bm241-subject-label';
 const tn=el('span');tn.id='bm241-topic-label';label.append(ico,sn,tn);
 const clock=el('time','bm241-clock');clock.id='bm241-elapsed';clock.setAttribute('role','timer');clock.textContent='0m 00s';
 const pause=el('button','','⏸ Pausar');pause.id='bm241-pause';
 const resume=el('button','','▶ Continuar');resume.id='bm241-resume';
 const save=el('button','bm241-primary','✓ Salvar');save.id='bm241-save';
 const discard=el('button','bm241-discard','✕ Descartar');discard.id='bm241-discard';
 for(const b of [pause,resume,save,discard])b.type='button';
 live.append(label,clock,pause,resume,save,discard);
 const status=el('small','bm241-timer-status','Carregando Controle de Estudos…');status.id='bm241-status';
 bar.append(idle,live,status);
 head.append(bar);
 document.addEventListener('bm240-study-mounted',()=>{ready=true;request();setStatus()});
 if(window.BM240ControlApp){ready=true;request();}

 window.addEventListener('bm243-catalog-ready',()=>{areaSignature='';request()});
 subject.addEventListener('change',()=>{currentSubject=subject.value;areaSignature='';area.value='';topic.value='';subtopic.value='';updateTopicOptions()});
 area.addEventListener('change',()=>{topic.value='';subtopic.value='';updateTopicOptions()});
 topic.addEventListener('input',()=>{subtopic.value='';updateTopicOptions()});
 start.addEventListener('click',()=>{
  if(!ready){status.textContent='Controle ainda carregando';return}
  if(!subject.value){status.textContent='Selecione uma disciplina ou cadastre uma nova.';return}
  command('start',{subjectId:subject.value,general:area.value,
    specific:topic.value.trim(),subtopic:subtopic.value.trim(),topic:topic.value.trim()});
 });
 pause.addEventListener('click',()=>command('pause'));
 resume.addEventListener('click',()=>command('resume'));
 save.addEventListener('click',()=>command('save'));
 discard.addEventListener('click',()=>{
  if(window.confirm('Descartar o tempo líquido ainda não salvo?'))command('discard-confirmed');
 });
 add.addEventListener('click',()=>{create.hidden=false;name.focus()});
 cancel.addEventListener('click',()=>{create.hidden=true;name.value=''});
 createBtn.addEventListener('click',()=>{
  const n=name.value.trim();
  if(n.length<2){status.textContent='Informe pelo menos 2 caracteres para a matéria.';return}
  pendingSubject=n;command('new-subject',{name:n});
  create.hidden=true;name.value='';
 });
 // Não usa timestamp incremental. Recalcula a partir do instante de início original.
 setInterval(()=>{if(document.visibilityState==='visible')request()},1000);
 window.addEventListener('focus',()=>{request();if(state)render()});
 document.addEventListener('visibilitychange',()=>{if(!document.hidden){request();if(state)render()}});
 window.BM241TimerHeader=Object.freeze({request,get state(){return state&&{...state,elapsedMs:elapsed()}}});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
else init();
})();


;
/* 128 assets/v242_timer_dock.js */
/* V242 — realoca a barra existente do cronômetro para o rodapé fixo.
   Não cria timer, não duplica IDs, não altera sessões, Drive, cartões ou SRS. */
(function(){
 'use strict';
 if(window.BM242TimerDock)return;
 let dock=null,observer=null;
 function layout(){
  if(!dock||!dock.isConnected)return;
  const height=Math.ceil(dock.getBoundingClientRect().height);
  document.documentElement.style.setProperty('--bm242-dock-height',height+'px');
 }
 function installMobileToggle(bar){
  if(document.getElementById('bm242-mobile-toggle'))return;
  const style=document.createElement('style');
  style.id='bm242-mobile-toggle-style';
  style.textContent=`
  body>.bm241-timer-bar.bm242-bottom-dock #bm242-mobile-toggle{display:none}
  @media(max-width:760px){
   body>.bm241-timer-bar.bm242-bottom-dock #bm242-mobile-toggle{
    display:flex!important;align-items:center;justify-content:space-between;
    width:100%!important;min-width:0!important;min-height:40px!important;
    flex:1 1 100%;border:1px solid #b9d1cb!important;border-radius:8px!important;
    background:#eaf5f2!important;color:#155e62!important;font-size:13px!important;
    font-weight:750!important;text-align:left!important;padding:8px 12px!important;
    touch-action:manipulation;
   }
   body>.bm241-timer-bar.bm242-bottom-dock.bm242-mobile-collapsed>.bm241-timer-choose,
   body>.bm241-timer-bar.bm242-bottom-dock.bm242-mobile-collapsed>.bm241-timer-live,
   body>.bm241-timer-bar.bm242-bottom-dock.bm242-mobile-collapsed>.bm241-timer-status{
    display:none!important;
   }
   body>.bm241-timer-bar.bm242-bottom-dock.bm242-mobile-collapsed{
    max-height:none!important;overflow:hidden!important;
   }
  }`;
  document.head.append(style);
  const toggle=document.createElement('button');
  toggle.type='button';
  toggle.id='bm242-mobile-toggle';
  toggle.setAttribute('aria-controls','bm241-choose bm241-live');
  toggle.setAttribute('aria-label','Recolher ou expandir o cronômetro');
  bar.prepend(toggle);
  const preferenceKey='BM242_MOBILE_TIMER_COLLAPSED_V1';
  let collapsed=false;
  try{collapsed=localStorage.getItem(preferenceKey)==='1'}catch{}
  const media=window.matchMedia('(max-width:760px)');
  function sync(){
   const isClosed=media.matches&&collapsed;
   bar.classList.toggle('bm242-mobile-collapsed',isClosed);
   toggle.setAttribute('aria-expanded',String(!isClosed));
   if(isClosed){
    const live=document.getElementById('bm241-live');
    const active=live&&!live.hidden;
    const time=document.getElementById('bm241-elapsed')?.textContent||'0m 00s';
    const subject=document.getElementById('bm241-subject-label')?.textContent||'Estudo';
    const running=active&&!document.getElementById('bm241-pause')?.hidden;
    toggle.textContent=active
      ? (running?'▶ ':'⏸ ')+time+' · '+subject.slice(0,26)+'  ▴'
      : '⏱ Cronômetro · toque para iniciar  ▴';
   }else{
    toggle.textContent='▾ Recolher cronômetro';
   }
   layout();
  }
  toggle.addEventListener('click',()=>{
   collapsed=!collapsed;
   try{localStorage.setItem(preferenceKey,collapsed?'1':'0')}catch{}
   sync();
  });
  if(media.addEventListener)media.addEventListener('change',sync);
  else media.addListener(sync);
  setInterval(()=>{if(media.matches&&collapsed)sync()},1000);
  sync();
 }
 function install(){
  const bar=document.getElementById('bm241-bar');
  if(!bar)return false;
  dock=bar;
  bar.classList.add('bm242-bottom-dock');
  installMobileToggle(bar);
  bar.setAttribute('aria-label','Cronômetro de estudo — barra inferior fixa');
  bar.setAttribute('role','region');
  if(bar.parentElement!==document.body)document.body.appendChild(bar);
  document.documentElement.classList.add('bm242-dock-enabled');
  if(typeof ResizeObserver!=='undefined'){
   observer=new ResizeObserver(layout);
   observer.observe(bar);
  }
  window.addEventListener('resize',layout,{passive:true});
  window.visualViewport?.addEventListener('resize',layout,{passive:true});
  layout();
  return true;
 }
 function start(){
  if(install())return;
  // O portal injeta os módulos no DOM e pode montar o cronômetro após o script.
  const watcher=new MutationObserver(()=>{
   if(install())watcher.disconnect();
  });
  watcher.observe(document.body,{childList:true,subtree:true});
 }
 window.BM242TimerDock=Object.freeze({refresh:layout,get attached(){return Boolean(dock?.isConnected&&dock.parentElement===document.body)}});
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});
 else start();
})();


;
/* 129 assets/v243_lacunas_smoke.js */
/* V243 / Homologação local de interface. Não altera cartões, SRS ou Drive. */
(function(){
'use strict';
if(window.BM243LacunasSmoke)return;
const $=id=>document.getElementById(id), checks=[];
function add(name,ok,reason=''){checks.push({name,ok:!!ok,reason:String(reason||'')})}
function show(){
 const list=$('bm243-smoke-list'),summary=$('bm243-smoke-summary');if(!list||!summary)return;
 list.replaceChildren();
 for(const c of checks){
  const li=document.createElement('li');li.className=c.ok?'bm243-smoke-ok':'bm243-smoke-fail';
  li.textContent=(c.ok?'PASSOU: ':'FALHOU: ')+c.name+(c.reason?' — '+c.reason:'');list.append(li);
 }
 const failed=checks.filter(x=>!x.ok).length;
 summary.textContent=checks.length+' verificações locais: '+(checks.length-failed)+' aprovadas e '+failed+' com falha. '+(failed?'Não liberar em produção.':'Resultado local favorável; OAuth/segundo dispositivo ainda precisam de teste real.');
}
async function runUI(){
 checks.length=0;
 const api=window.BM242Lacunas,source=window.BM242OperationalCards,reader=window.BancoMestreVisualizarCardV050;
 add('Biblioteca de lacunas está montada',!!$('lacunas')&&!!$('bm242-nav'));
 add('Quatro filtros hierárquicos presentes',['bm242-discipline','bm242-general','bm242-specific','bm242-sub'].every(x=>!!$(x)));
 add('Formulário e campos autorais separados',!!$('bm242-form')&&!!$('bm242-form')?.elements?.relatoEstudante&&!!$('bm242-form')?.elements?.descricao);
 add('Controle de Estudos disponível',!!$('bm238-study-tab')&&!!$('bm238-study-frame'));
 add('Fonte do iframe de estudos preservada',($('bm238-study-frame')?.getAttribute('src')||'').includes('controle-estudos-v242.html'));
 add('Validador de dados de lacunas carregado',typeof api?.validate==='function');
 add('Sincronizador Drive carregado (sem executar)',typeof window.BM242LacunasDrive?.sync==='function');
 add('Rotação de backups diária/mensal conectada ao botão Drive',window.BM243LacunasRetention?.ready===true);
 add('Leitor único com API de consulta carregado',typeof reader?.showId==='function');
 add('Formatador dos 11 módulos carregado',typeof window.BM198Format?.render==='function');
 try{api.validate(api.data);add('Dados locais passam na validação',true)}
 catch(e){add('Dados locais passam na validação',false,e.message)}
 let card=null;
 try{
  card=await source.loadRecord('PETRO14-C014');
  add('Arquivo original PETRO14-C014 carregado',card.id==='PETRO14-C014');
  add('11 módulos completos e em ordem',card.layers.length===11&&card.layers.every((m,i)=>m.ord===i+1&&m.titulo&&m.texto));
  add('Fonte original mantida',card.original_full_source.includes('1lV1VrH_1E5B1SEssNX6dcA102lesL4BI'));
 }catch(e){add('Arquivo original PETRO14-C014 carregado',false,e.message)}
 if(reader?.visible){add('Leitor disponível para testar revelação',false,'Feche o cartão já aberto e execute novamente');show();return}
 if(card&&reader?.showId&&window.BM198Format?.render){
  let opened=false;
  try{
   opened=reader.showId('PETRO14-C014');
   const overlay=$('bmCardPeekV050');
   add('Cartão abre no leitor original',opened&&overlay&&!overlay.hidden&&reader.currentId==='PETRO14-C014');
   const answer=overlay?.querySelector('.bm-v050-peek-answer');
   add('Resposta começa oculta',!!answer&&answer.hidden===true);
   const reveal=overlay?.querySelector('.bm-v050-peek-reveal');
   if(!reveal)throw Error('Controle de revelação não localizado');
   reveal.click();
   for(let attempt=0;attempt<40;attempt++){
    if((answer?.querySelectorAll('.bm198-module').length||0)===11||answer?.querySelector('.bm197-error'))break;
    await new Promise(resolve=>setTimeout(resolve,200));
   }
   const modules=answer?.querySelectorAll('.bm198-module')||[];
   add('Revelação mostra 11 módulos',modules.length===11);
   const last=answer?.querySelector('.bm198-module:last-child');
   const gallery=answer?.querySelector('.bm242-gallery'),admin=answer?.querySelector('.bm198-overview');
   add('Galeria e quadro administrativo aparecem ao final',!!gallery&&!!admin&&
    modules.length===11&&last.compareDocumentPosition(gallery)&Node.DOCUMENT_POSITION_FOLLOWING&&
    gallery.compareDocumentPosition(admin)&Node.DOCUMENT_POSITION_FOLLOWING);
   add('Link para original presente',!!gallery?.querySelector('a[href*="drive.google.com/file/d/1lV1VrH"]'));
  }catch(e){add('Navegação e revelação do cartão',false,e.message)}
  finally{if(opened)reader.close?.()}
 }
 add('Nenhuma gravação/SRS solicitada pelo teste',true,'Teste apenas de consulta; não executou sincronização');
 show();
}
function install(){
 if($('bm243-smoke'))return;
 const target=$('lacunas')?.querySelector('.bm242-shell')||$('lacunas')||document.querySelector('main');
 if(!target)return;
 const panel=document.createElement('details');panel.id='bm243-smoke';panel.className='bm243-smoke';
 const head=document.createElement('summary');head.textContent='Homologação técnica da biblioteca (teste de leitura)';
 const summary=document.createElement('p');summary.id='bm243-smoke-summary';summary.textContent='Execute os testes locais. Não serão gravadas avaliações SRS nem feitas alterações no Drive.';
 const button=document.createElement('button');button.type='button';button.textContent='Executar verificação funcional local';
 button.addEventListener('click',()=>void runUI());
 const list=document.createElement('ol');list.id='bm243-smoke-list';
 const foot=document.createElement('p');foot.textContent='Este diagnóstico não substitui testes autenticados do Google Drive nem a conferência visual em computador e celular.';
 panel.append(head,summary,button,list,foot);target.append(panel);
}
window.BM243LacunasSmoke=Object.freeze({run:runUI,get results(){return checks.slice()}});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();

;
/* 130 assets/v250_formulas_drive.js */
/* V250 — Assuntos > Fórmulas. Fonte privada: Google Doc, leitura OAuth em memória.
 * Não publica conteúdo do documento no GitHub, não grava no navegador/Drive,
 * não altera cartões, SRS, calendário ou guia original. */
(function(){
'use strict';
if(window.BM246Formulas)return;
const DOC_ID='1eOla5S9In1LTB6IJkJPLmP8mQfM2P2urk33jgCYam5M';
const DOC_URL='https://docs.google.com/document/d/'+DOC_ID+'/edit';
const DOC_PREVIEW='https://docs.google.com/document/d/'+DOC_ID+'/preview';
const MIME='application/vnd.google-apps.document';
let sections=[],revision='',sourceVersion='',loadedAt='',inflight=null,loaded=false;
const $=id=>document.getElementById(id);
const fold=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('pt-BR');
function status(message,kind){
 const el=$('bm246FormulaStatus');if(!el)return;
 el.textContent=message;el.dataset.state=kind||'idle';
}
function category(number,title){
 const n=Number(number);
 if([9,16,28].includes(n))return 'Fontes e evolução';
 if([10,23].includes(n))return 'Concreto armado';
 if([11,12,18].includes(n))return 'Resistência e propriedades das seções';
 if([14,24,25].includes(n))return 'Estruturas de aço e estabilidade';
 if([15,27].includes(n))return 'Relações físicas e aplicações';
 if([1,2,4,5,6,13,19,20,21,22].includes(n))return 'Vigas, treliças e análise estrutural';
 if([3,7,8,17,26].includes(n))return 'Resistência dos materiais';
 return /concreto|fissura/i.test(title)?'Concreto armado':
 /aço|flambagem|estabilidade/i.test(title)?'Estruturas de aço e estabilidade':
 /viga|treliça|matricial|isostática|hiperestática|cross|ritter/i.test(title)?'Vigas, treliças e análise estrutural':
 /geometria|inércia|seções/i.test(title)?'Resistência e propriedades das seções':
 /mohr|tensões|resistência dos materiais/i.test(title)?'Resistência dos materiais':
 /temperatura|fluência|retração|dilatação/i.test(title)?'Relações físicas e aplicações':'Outros assuntos';
}
function parseDocument(raw){
 const clean=String(raw||'').replace(/^\uFEFF/,'').replace(/\r\n?/g,'\n');
 const lines=clean.split('\n'),items=[];let current=null,introduction=[],nextNumber=1;
 const head=/^\s*(\d{1,2})\.\s+(.{4,})\s*$/;
 for(const line of lines){
  const match=line.match(head);
  if(match && Number(match[1])===nextNumber && nextNumber<=99){
   nextNumber++;
   if(current)items.push(current);
   current={number:Number(match[1]),title:match[2].trim(),category:category(match[1],match[2]),lines:[]};
  }else if(current)current.lines.push(line);
  else introduction.push(line);
 }
 if(current)items.push(current);
 if(!items.length)return [{number:0,title:'Conteúdo integral do guia',category:'Documento',body:clean}];
 const pre=introduction.join('\n').trim();
 if(pre)items.unshift({number:0,title:'Apresentação do documento',category:'Documento',body:pre});
 return items.map(x=>({number:x.number,title:x.title,category:x.category,body:x.body===undefined?x.lines.join('\n').trim():x.body}));
}
function setFilterOptions(){
 const sel=$('bm246FormulaCategory');if(!sel)return;
 const previous=sel.value;
 sel.replaceChildren(new Option('Todos os tópicos','all'));
 const cats=[...new Set(sections.map(x=>x.category))];
 cats.forEach(x=>sel.add(new Option(x,x)));
 sel.value=cats.includes(previous)?previous:'all';
}
function sectionLineKind(line){
 const s=String(line||'').trim();
 if(!s)return 'space';
 if(/^(O QUE DECORAR|NÃO CONFUNDIR|PEGADINHA|REVISÃO DE \d+ SEGUNDOS)$/iu.test(s))return 'subhead';
 if(/^(FONTE|FÓRMULA-MESTRE|EXEMPLO DIMENSIONAL|ESTÁDIO [IVX]+|LIGAÇÕES|ATENÇÃO|PROTOCOLO|ESTADO DO GUIA|ESCOPO DESTA|NÃO CONFUNDIR|PEGADINHA|NBR \d)/iu.test(s))return /^(FÓRMULA-MESTRE|EXEMPLO DIMENSIONAL|ATENÇÃO|PEGADINHA|NÃO CONFUNDIR)/iu.test(s)?'caution':'metadata';
 if(/^(?:\d+\)|[•–-])\s+/u.test(s))return 'step';
 if(s.length<=175&&s.includes('=')&&/^[\p{L}\p{N}\s\p{S}\p{P}]+$/u.test(s)&&!/^([A-ZÀ-Ü]{4,}\s)/u.test(s))return 'equation';
 if(s.length<=75&&/^[A-ZÀ-Ü][A-ZÀ-Ü\s\/–—-]{4,}$/.test(s))return 'subhead';
 return 'paragraph';
}
function makeBody(body){
 const host=document.createElement('div');host.className='bm249-body';
 const lines=String(body||'').replace(/\r\n?/g,'\n').split('\n');
 for(let i=0;i<lines.length;i++){
  const sourceLine=lines[i],kind=sectionLineKind(sourceLine);
  if(kind==='space'){
   if(host.lastElementChild?.classList.contains('bm249-blockgap'))continue;
   const space=document.createElement('div');space.className='bm249-blockgap';space.setAttribute('aria-hidden','true');host.append(space);continue;
  }
  const line=document.createElement(kind==='subhead'?'h4':'p');
  line.className='bm249-line bm249-'+kind;
  line.textContent=sourceLine;
  if(kind==='equation')line.setAttribute('aria-label','Fórmula: '+sourceLine);
  host.append(line);
 }
 return host;
}
function setJumpOptions(){
 const jump=$('bm249Jump');if(!jump)return;
 jump.replaceChildren(new Option('Ir diretamente para uma seção…',''));
 for(const item of sections){
  const label=item.number?item.number+'. '+item.title:item.title;
  jump.add(new Option(label,label.startsWith('0.')?'0':String(item.number)));
 }
 jump.value='';
}
function render(){
 const root=$('bm246FormulaSections'),count=$('bm246FormulaCount');
 if(!root)return;
 const opened=new Set([...root.querySelectorAll('details.bm246-formula-entry[open]')].map(d=>d.dataset.formulaSection));
 root.replaceChildren();
 const search=fold($('bm246FormulaSearch')?.value.trim()||''),filter=$('bm246FormulaCategory')?.value||'all';
 if(!loaded){
  count.textContent='O conteúdo é carregado do documento privado somente após autorização Google.';
  return;
 }
 const results=sections.filter(x=>(filter==='all'||filter===x.category)&&
   (!search||fold(x.title+' '+x.body+' '+x.category).includes(search)));
 count.textContent=results.length+' seção(ões) exibida(s) de '+sections.length+
   ' · Fonte: documento do Google Drive · leitura sem gravação';
 if(!results.length){
  const p=document.createElement('p');p.className='bm246-empty';
  p.textContent='Nenhum resultado. Tente outra expressão ou limpe os filtros.';root.append(p);return;
 }
 for(const item of results){
  const entry=document.createElement('details');entry.className='bm246-formula-entry';
  entry.dataset.formulaSection=String(item.number);
  entry.open=Boolean(search)||opened.has(String(item.number));
  const sum=document.createElement('summary');
  const title=document.createElement('strong');title.textContent=item.number?item.number+'. '+item.title:item.title;
  const group=document.createElement('span');group.className='bm246-formula-group';group.textContent=item.category;
  sum.append(title,group);entry.append(sum,makeBody(item.body||'(Seção sem conteúdo no arquivo original)'));
  root.append(entry);
 }
}
function token(){
 const media=window.BancoMestreMediaSyncV182;
 return typeof media?.token==='function'?media.token():'';
}
async function load(force){
 if(inflight)return inflight;
 if(loaded&&!force){render();return;}
 const auth=token();
 if(!auth){
  status('Conecte sua conta Google pelo botão do portal para consultar as fórmulas privadas. O material permanece no Drive.','pending');
  render();return;
 }
 status('Lendo a edição atual do guia no Google Drive…','loading');
 inflight=(async()=>{
  const meta=await fetch('https://www.googleapis.com/drive/v3/files/'+encodeURIComponent(DOC_ID)+
   '?fields=id,name,mimeType,modifiedTime,version,trashed',{
   headers:{Authorization:'Bearer '+auth},cache:'no-store'});
  if(meta.status===401)throw Error('Autorização expirada. Conecte novamente o Google Drive.');
  if(meta.status===403||meta.status===404)throw Error('Guia inacessível nesta conta Google.');
  if(!meta.ok)throw Error('Não foi possível verificar o documento (HTTP '+meta.status+').');
  const m=await meta.json();
  if(m.id!==DOC_ID||m.mimeType!==MIME||m.trashed===true)throw Error('A origem mudou ou não é o documento esperado; leitura interrompida.');
  const currentRevision=String(m.modifiedTime||'');
  const currentVersion=String(m.version||'');
  if(loaded&&currentRevision&&currentVersion&&revision===currentRevision&&sourceVersion===currentVersion){
   status('Guia conferido no Drive em '+new Date().toLocaleString('pt-BR')+' · sem alterações desde a leitura anterior.','ok');
   return;
  }
  const url='https://www.googleapis.com/drive/v3/files/'+encodeURIComponent(DOC_ID)+
   '/export?mimeType='+encodeURIComponent('text/plain');
  const response=await fetch(url,{headers:{Authorization:'Bearer '+auth},cache:'no-store'});
  if(!response.ok)throw Error('Não foi possível ler o conteúdo (HTTP '+response.status+').');
  const payload=await response.text();
  if(!payload.trim()||payload.length>400000)throw Error('Conteúdo vazio ou acima do limite de segurança; original preservado.');
  const parsed=parseDocument(payload);
  sections=parsed;loaded=true;revision=currentRevision;sourceVersion=currentVersion;loadedAt=new Date().toLocaleString('pt-BR');
  setFilterOptions();setJumpOptions();render();
  const modified=revision?new Date(revision).toLocaleString('pt-BR'):'não informada';
  status('Guia consultado no Drive em '+loadedAt+' · modificação da origem: '+modified+
    '. Ao retornar à aba, o portal confere se houve nova revisão.','ok');
 })().catch(e=>{
  status('Leitura não confirmada: '+e.message+' Use “Abrir no Drive” ou tente conectar novamente.','error');
  if(!loaded)render();
 }).finally(()=>{inflight=null});
 return inflight;
}
function navActive(){
 const nav=document.querySelector('header nav[aria-label="Seções"]')||document.querySelector('header nav');
 if(!nav)return;
 nav.querySelectorAll('button[data-page]').forEach(b=>b.classList.toggle('active',b.dataset.page==='assuntos'));
}
function open(){
 if(typeof window.section==='function')window.section('formulas');
 else{
  document.querySelectorAll('main>section').forEach(s=>s.classList.toggle('active',s.id==='formulas'));
  history.replaceState(null,'','#formulas');
 }
 navActive();
 // Revalida a revisão ao voltar à aba, sem recarregar o conteúdo quando nada mudou.
 void load(true);
}
function install(){
 if($('formulas'))return;
 const panel=document.querySelector('#assuntos>.panel'),assuntos=$('assuntos');
 if(!panel||!assuntos||!assuntos.parentElement)return;
 const shortcut=document.createElement('div');shortcut.className='bm246-formula-shortcut';
 const text=document.createElement('div');
 const eyebrow=document.createElement('small');eyebrow.textContent='Assuntos › Fórmulas';
 const title=document.createElement('strong');title.textContent='Guia de Fórmulas';
 const detail=document.createElement('span');detail.textContent='Consulta da versão atual em elaboração no Google Drive';
 text.append(eyebrow,title,detail);
 const button=document.createElement('button');button.id='bm246OpenFormulas';button.type='button';
 button.textContent='Abrir fórmulas';button.addEventListener('click',open);
 shortcut.append(text,button);panel.prepend(shortcut);
 const section=document.createElement('section');section.id='formulas';section.className='bm246-formulas-page';
 section.innerHTML=[
 '<div class="panel bm246-formulas-panel">',
 '<div class="bm246-formula-breadcrumb"><button type="button" id="bm246Back">← Assuntos</button><span>Assuntos › Fórmulas</span></div>',
 '<h2>Guia de Fórmulas</h2>',
 '<p class="intro">Leitura do documento original do Drive, com organização por seção e pesquisa. As alterações do guia aparecem após uma nova consulta; o portal não modifica o material.</p>',
 '<div class="bm246-formula-toolbar">',
 '<button type="button" id="bm246Connect">Conectar Google Drive</button>',
 '<button type="button" id="bm246Reload">Atualizar do Drive</button>',
 '<button type="button" id="bm246ShowPreview">Ver original nesta página</button>',
 '<a id="bm246Source" class="action" target="_blank" rel="noopener noreferrer">Abrir no Drive</a>',
 '</div>',
 '<p id="bm246FormulaStatus" class="bm246-formula-status" role="status" aria-live="polite">Aguardando consulta autorizada ao Drive.</p>',
 '<div class="bm246-formula-filters"><input id="bm246FormulaSearch" type="search" placeholder="Buscar fórmula, conceito, símbolo ou cartão" aria-label="Pesquisar no guia de fórmulas">',
 '<select id="bm246FormulaCategory" aria-label="Filtrar seção de fórmulas"><option value="all">Todos os tópicos</option></select></div>',
 '<div class="bm249-jump"><label for="bm249Jump">Navegação pelas seções</label>',
 '<select id="bm249Jump" aria-label="Abrir uma seção específica do guia"><option value="">Ir diretamente para uma seção…</option></select></div>',
 '<p class="bm249-editions">Atenção às edições: este guia combina referências históricas (por exemplo, NBR 6118:2014) com fórmulas gerais. Confira a edição normativa correspondente antes de aplicar uma expressão de projeto.</p>',
 '<p id="bm246FormulaCount" class="small muted"></p>',
 '<div id="bm246FormulaSections"></div>',
 '<div id="bm246FormulaPreview" hidden><p class="small muted">Prévia do Google Docs. Se o navegador bloquear a visualização autenticada, use Abrir no Drive.</p><iframe id="bm246FormulaFrame" title="Guia de Fórmulas original no Google Drive" referrerpolicy="no-referrer" loading="lazy"></iframe></div>',
 '<p class="notice">Fórmulas, hipóteses, unidades e referências normativas refletem o texto da fonte. Revisão técnica e validação de edições normativas serão realizadas separadamente; não há integração automática com cartões ou SRS.</p>',
 '</div>'
 ].join('');
 assuntos.after(section);
 $('bm246Source').href=DOC_URL;
 $('bm246Back').addEventListener('click',()=>{
  if(typeof window.section==='function')window.section('assuntos');
  else location.hash='#assuntos';
 });
 $('bm246Connect').addEventListener('click',()=>{
  const b=$('bm239-drive-action');
  if(b&&!b.disabled)b.click();
  else status('A conexão Google ainda não está disponível. Use Abrir no Drive.','pending');
 });
 $('bm246Reload').addEventListener('click',()=>{void load(true)});
 $('bm246ShowPreview').addEventListener('click',()=>{
  const holder=$('bm246FormulaPreview'),frame=$('bm246FormulaFrame');
  holder.hidden=!holder.hidden;
  if(!holder.hidden&&!frame.getAttribute('src'))frame.src=DOC_PREVIEW;
  $('bm246ShowPreview').textContent=holder.hidden?'Ver original nesta página':'Ocultar prévia';
 });
 $('bm249Jump').addEventListener('change',()=>{
  const chosen=$('bm249Jump').value;
  if(!chosen)return;
  $('bm246FormulaSearch').value='';
  $('bm246FormulaCategory').value='all';
  render();
  const item=[...$('bm246FormulaSections').querySelectorAll('details.bm246-formula-entry')].find(e=>e.dataset.formulaSection===chosen);
  if(item){
   item.open=true;
   item.scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'});
  }
  $('bm249Jump').value='';
 });
 $('bm246FormulaSearch').addEventListener('input',render);
 $('bm246FormulaCategory').addEventListener('change',render);
 document.addEventListener('bm-media-drive-authorized',()=>{
  if(location.hash==='#formulas')void load(true);
 });
 window.addEventListener('hashchange',()=>{
  if(location.hash==='#formulas')open();
 });
 if(location.hash==='#formulas'||window.BM250FormulaEntryRequested){
  setTimeout(()=>{
   if(location.hash==='#formulas'||window.BM249FormulaEntryRequested){
    window.BM249FormulaEntryRequested=false;
    open();
   }
  },0);
 }
}
window.BM246Formulas=Object.freeze({
 open,refresh:()=>load(true),
 get status(){return {loaded,sectionCount:sections.length,sourceModified:revision,loadedAt}}
});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});
else install();
})();


;
/* 131 assets/v255_study_three_groups.js */
/* V255 — Fluxo de estudos em 3 abas (camada de leitura e navegação).
   Fonte: armazenamento local do Controle V245. Sem gravacoes, sem eventos SRS. */
(function(){
'use strict';
if(window.BM252StudyFlow)return;
const KEY='BM245_CONTROLE_ESTUDOS';
const GROUPS=[
 {id:'ver',label:'Ver estudado',first:'calendarioControle',modules:[['calendarioControle','Calendário'],['historico','Histórico completo']]},
 {id:'organizar',label:'Organizar',first:'planejamento',modules:[['planejamento','Metas e disciplinas'],['registro','Registro manual'],['revisoes','Revisões de conteúdo'],['ciclo','Ciclo de estudos'],['backup','Dados e backup']]},
 {id:'relatorios',label:'Resumo e relatórios',first:'painel',modules:[['painel','Resumo'],['relatorios','Relatórios detalhados']]}
];
const allModules=GROUPS.flatMap(g=>g.modules.map(x=>x[0]));
let root=null,installed=false,mainNav=null,moduleNav=null;
const $=id=>root?.getElementById(id);
const el=(tag,cl,txt)=>{const x=document.createElement(tag);if(cl)x.className=cl;if(txt!==undefined)x.textContent=txt;return x};
const localDate=()=>{const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')};
const duration=n=>{const m=Math.round(Math.max(0,Number(n)||0));return Math.floor(m/60)+'h '+String(m%60).padStart(2,'0')+'min'};
const shortDuration=n=>{const m=Math.round(Math.max(0,Number(n)||0));return m>=60?Math.floor(m/60)+'h'+(m%60?String(m%60).padStart(2,'0'):''):m+'m'};
const prettyDay=x=>/^\d{4}-\d\d-\d\d$/.test(x)?x.split('-').reverse().join('/'):(x||'');
function source(){
 try{
  const txt=localStorage.getItem(KEY);
  if(!txt)return {state:'empty',subjects:[],sessions:[],plans:[],reviews:[],cycle:[]};
  const v=JSON.parse(txt);
  if(v?.schema!==1||!Array.isArray(v.subjects)||!Array.isArray(v.sessions)||!Array.isArray(v.reviews))return {state:'invalid',subjects:[],sessions:[],plans:[],reviews:[],cycle:[]};
  return {...v,plans:Array.isArray(v.plans)?v.plans:[],cycle:Array.isArray(v.cycle)?v.cycle:[],state:'ok'};
 }catch{return {state:'invalid',subjects:[],sessions:[],plans:[],reviews:[],cycle:[]}}
}
function getGroup(moduleId){return GROUPS.find(g=>g.modules.some(x=>x[0]===moduleId))}
function currentModule(){return root?.querySelector('section.pane.active')?.id||''}
function navTo(moduleId){
 if(!allModules.includes(moduleId))return;
 const b=root.querySelector('#tabs button[data-tab="'+moduleId+'"]');
 if(b)b.click();
 syncNavigation();
}
function openGroup(groupId){
 const group=GROUPS.find(x=>x.id===groupId);
 if(group)navTo(group.first);
}
function syncNavigation(){
 if(!installed)return;
 const current=currentModule();
 const g=getGroup(current)||GROUPS[0];
 for(const b of mainNav.querySelectorAll('button[data-group]')){
  const active=b.dataset.group===g.id;
  b.setAttribute('aria-selected',String(active));
  b.classList.toggle('active',active);
 }
 const expected=g.modules.map(x=>x[0]).join('|');
 if(moduleNav.dataset.modules!==expected){
  moduleNav.replaceChildren(el('span','','Dentro de '+g.label+':'));
  for(const [id,label] of g.modules){
   const b=el('button','',label);
   b.type='button';b.dataset.bm252Module=id;
   b.addEventListener('click',()=>navTo(id));
   moduleNav.append(b);
  }
  moduleNav.dataset.modules=expected;
 }
 for(const b of moduleNav.querySelectorAll('button')){
  const active=b.dataset.bm252Module===current;
  if(active)b.setAttribute('aria-current','page');
  else b.removeAttribute('aria-current');
 }
 if(current==='calendarioControle')refreshCalendar();
}
function byDate(data,day){
 return {
  done:data.sessions.filter(s=>!s.deletedAt&&s.date===day),
  planned:data.plans.filter(p=>!p.deletedAt&&p.date===day)
 };
}
const nsum=(arr,key)=>arr.reduce((n,x)=>n+(Number(x[key])||0),0);
function subjectName(data,id){return data.subjects.find(s=>s.id===id)?.name||'Disciplina não identificada'}
function addChip(host,label){host.append(el('span','',label))}
function decorateCalendar(data){
 const grid=$('calGrid');if(!grid)return;
 const mode=root.querySelector('[data-cal-mode].active')?.dataset.calMode||'month';
 const days=grid.querySelector('.bm240-days');
 if(days)days.dataset.bm252Mode=mode;
 for(const b of grid.querySelectorAll('button[data-cal-day]')){
  const date=b.dataset.calDay,records=byDate(data,date),done=records.done,planned=records.planned;
  const st=done.length&&planned.length?'both':done.length?'done':planned.length?'planned':'none';
  b.dataset.bm252State=st;
  b.setAttribute('aria-label',prettyDay(date)+' — '+done.length+' sessão(ões) registrada(s), '+planned.length+' atividade(s) planejada(s)');
  const label=b.querySelector('b');
  if(label)label.textContent=String(Number(date.slice(8)));
  const time=b.querySelector('span:not(.bm252-dots)');
  if(time)time.textContent=done.length?shortDuration(nsum(done,'minutes')):'—';
  const small=b.querySelector('small');
  if(small)small.textContent=(done.length?done.length+' realizada(s)':'')+(done.length&&planned.length?' · ':'')+(planned.length?planned.length+' planejada(s)':'');
  const dots=el('span','bm252-dots');dots.setAttribute('aria-hidden','true');
  if(done.length)dots.append(el('i','done'));
  if(planned.length)dots.append(el('i','planned'));
  b.querySelector('.bm252-dots')?.remove();
  b.append(dots);
 }
}
function renderDay(data){
 const host=$('bm252-realized'),summary=$('bm252-day-meta');
 if(!host||!summary)return;
 const when=$('planDate')?.value||localDate();
 const {done,planned}=byDate(data,when);
 host.replaceChildren();
 const h=el('h3','','Realizado em '+prettyDay(when));
 host.append(h);
 if(data.state==='invalid'){
  host.append(el('p','bm252-warning','Os registros locais não puderam ser validados. Nenhum dado foi alterado.'));return;
 }
 const questions=nsum(done,'questions'),correct=nsum(done,'correct');
 summary.replaceChildren();
 addChip(summary,done.length+' sessão(ões) realizadas');
 addChip(summary,planned.length+' atividade(s) planejadas');
 addChip(summary,duration(nsum(done,'minutes'))+' registradas');
 if(questions)addChip(summary,correct+'/'+questions+' acertos');
 if(!done.length){
  host.append(el('p','bm252-day-empty','Nenhum estudo registrado para este dia no Controle de Estudos. Questões de outros chats ou cartões não são importados automaticamente.'));
 }else{
  for(const r of done.slice().sort((a,b)=>String(a.startTime||'').localeCompare(String(b.startTime||'')))){
   const card=el('article','bm252-record');
   card.append(el('strong','',subjectName(data,r.subjectId)+' · '+duration(r.minutes)));
   const path=[r.general,r.specific,r.subtopic,r.topic].map(x=>String(x||'').trim()).filter(Boolean);
   if(path.length)card.append(el('p','',path.join(' → ')));
   const detail=[r.startTime?'Início '+r.startTime:'',r.type||'',r.questions?String(r.correct||0)+'/'+r.questions+' acertos':''].filter(Boolean);
   if(detail.length)card.append(el('small','',detail.join(' · ')));
   if(r.notes){const note=el('p','',String(r.notes));card.append(note);}
   host.append(card);
  }
 }
}
function renderSummary(data){
 const host=$('bm252-month-stats');if(!host)return;
 host.replaceChildren();
 if(data.state==='invalid'){host.append(el('span','','Dados locais inválidos — nenhuma contagem exibida'));return}
 const current=$('calTitle')?.textContent||'',date=$('planDate')?.value||localDate();
 const mode=root.querySelector('[data-cal-mode].active')?.dataset.calMode||'month';
 let periodDates=new Set([...$('calGrid').querySelectorAll('button[data-cal-day]')].map(x=>x.dataset.calDay));
 if(!periodDates.size)periodDates=new Set([date]);
 const done=data.sessions.filter(s=>!s.deletedAt&&periodDates.has(s.date));
 const planned=data.plans.filter(p=>!p.deletedAt&&periodDates.has(p.date));
 addChip(host,duration(nsum(done,'minutes'))+' realizadas no período');
 addChip(host,done.length+' sessões');
 addChip(host,planned.length+' planejadas ('+planned.filter(x=>!x.doneAt).length+' pendentes)');
 const q=nsum(done,'questions');if(q)addChip(host,nsum(done,'correct')+'/'+q+' acertos');
}
function refreshCalendar(){
 if(!installed||!$('calGrid'))return;
 const data=source();
 renderSummary(data);decorateCalendar(data);renderDay(data);
}
function scheduleCalendarRefresh(){
 if(typeof queueMicrotask==='function')queueMicrotask(refreshCalendar);
 else Promise.resolve().then(refreshCalendar);
}
function install(){
 if(installed)return;
 const holder=document.getElementById('bm240-native-host'),target=holder?.shadowRoot;
 if(!target?.getElementById('tabs')||!target?.getElementById('calGrid')||!window.BM240ControlApp)return;
 root=target;
 const header=root.querySelector('header'),orig=$('tabs'),main=root.querySelector('main');
 if(!header||!orig||!main||allModules.some(id=>!orig.querySelector('button[data-tab="'+id+'"]')))return;
 const s=el('style');s.textContent="/* V252 — controle de estudos com tres areas principais. Estilos encapsulados no Shadow DOM. */\n:host{display:block;color:#17363d}\nheader{padding:13px 15px 10px!important}\nheader h1{font-size:21px!important;line-height:1.2;margin:0 0 4px!important}\nheader>p{font-size:12px!important;margin:0 0 12px!important;color:#54747b}\n#tabs{display:none!important}\n#bm252-main-nav{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:7px;margin:0}\n#bm252-main-nav button{min-width:0;min-height:46px;border:1px solid #c6dcda;border-radius:9px;background:#f6faf9;color:#325960;font-weight:750;font-size:13px;padding:8px 6px;white-space:normal}\n#bm252-main-nav button[aria-selected=\"true\"]{background:#16685f;border-color:#16685f;color:#fff;box-shadow:inset 0 -3px #115046}\n#bm252-main-nav button:focus-visible,#bm252-module-nav button:focus-visible{outline:3px solid #e6ad44;outline-offset:2px}\n#bm252-module-nav{display:flex;align-items:center;flex-wrap:wrap;gap:6px;margin:0 0 13px;padding:8px 10px;background:#edf4f3;border:1px solid #d6e4e1;border-radius:9px}\n#bm252-module-nav>span{font-size:11px;font-weight:750;color:#5b7478;margin-right:3px}\n#bm252-module-nav button{min-height:36px;font-size:11.5px;padding:7px 10px;background:#fff}\n#bm252-module-nav button[aria-current=\"page\"]{border-color:#388f84;color:#0e6258;background:#e2f1ec}\n#calendarioControle h2{font-size:18px!important}\n#bm252-calendar-head{padding:12px 14px 8px;background:#f7fbf9;border:1px solid #d8e9e2;border-radius:10px;margin:0 0 13px}\n#bm252-calendar-head h3{font-size:14px;margin:0 0 4px}\n#bm252-calendar-head p{font-size:11px;color:#587178;margin:0}\n#bm252-month-stats{display:flex;gap:6px;flex-wrap:wrap;margin:9px 0 6px}\n#bm252-month-stats span{font-size:11px;border:1px solid #d9e7e2;background:#fff;border-radius:7px;padding:5px 9px;line-height:1.3}\n#bm252-legend{display:flex;gap:14px;align-items:center;flex-wrap:wrap;margin-top:9px;font-size:11px;color:#4c6769}\n#bm252-legend b{display:inline-flex;align-items:center;gap:5px;font-weight:700}\n#bm252-legend i{display:inline-block;width:9px;height:9px;border-radius:50%;background:#237c67}\n#bm252-legend .plan i{background:#cf9241}\n#bm252-legend .both i{background:linear-gradient(90deg,#237c67 50%,#cf9241 50%)}\n#calendarioControle .bm240-day{position:relative;min-width:0}\n#calendarioControle .bm240-day[data-bm252-state=\"done\"]{border-color:#7db79f;background:#f4faf6}\n#calendarioControle .bm240-day[data-bm252-state=\"planned\"]{border-color:#dcbf82;background:#fdf9ef}\n#calendarioControle .bm240-day[data-bm252-state=\"both\"]{border-color:#9dbda7;background:linear-gradient(135deg,#f5fbf7,#fdf9ed)}\n#calendarioControle .bm240-day.selected{outline:2px solid #146b65;outline-offset:0;border-color:#146b65!important}\n#calendarioControle .bm252-dots{display:flex;justify-content:center;gap:4px;width:100%;align-items:center;margin-top:auto}\n#calendarioControle .bm252-dots i{display:inline-block;width:7px;height:7px;border-radius:50%}\n#calendarioControle .bm252-dots .done{background:#238165}\n#calendarioControle .bm252-dots .planned{background:#d2943b}\n#bm252-realized{margin:12px 0 16px}\n#bm252-realized h3,#bm252-planned-title{font-size:15px!important;margin:10px 0}\n.bm252-day-totals{display:flex;flex-wrap:wrap;gap:6px;margin:7px 0 10px}\n.bm252-day-totals span{font-size:11px;border:1px solid #dce8e5;padding:5px 8px;border-radius:7px}\n.bm252-record{padding:10px 12px;border:1px solid #e0e9e7;border-left:3px solid #237c67;background:#f8fbfa;border-radius:8px;margin-bottom:7px}\n.bm252-record strong{display:block;font-size:13px;color:#254f50}\n.bm252-record p{margin:3px 0;font-size:11px;color:#526f72;overflow-wrap:anywhere}\n.bm252-record small{font-size:10.5px;color:#547578}\n#bm252-plan-add{padding:0 12px 11px;border:1px solid #dce9e6;background:#fafdfb;border-radius:9px;margin-top:12px}\n#bm252-plan-add>summary{cursor:pointer;padding:12px 0;min-height:44px;font-size:12px;font-weight:700;color:#23675c}\n#bm252-plan-add form{padding-bottom:5px}\n#bm252-day-empty{font-size:12px;color:#647d7e}\n#calendarioControle .bm240-weeklabels span{text-align:center;font-size:10px;padding:5px 0}\n#calendarioControle .bm240-days{gap:5px}\n#calendarioControle .bm240-day{min-height:76px;gap:4px;align-items:center;padding:7px 4px}\n#calendarioControle .bm240-day b{font-size:12px}\n#calendarioControle .bm240-day>span:not(.bm252-dots){font-size:11px}\n#calendarioControle .bm240-day small{font-size:9px;text-align:center}\n#calendarioControle .bm240-days[data-bm252-mode=\"day\"]{grid-template-columns:1fr!important}\n#calendarioControle .bm240-days[data-bm252-mode=\"day\"] .bm240-day{min-height:82px;max-width:340px}\n@media(max-width:680px){\n header{padding:11px 9px 8px!important}\n header h1{font-size:19px!important}\n header>p{font-size:11px!important}\n #bm252-main-nav{gap:5px}\n #bm252-main-nav button{font-size:11px;min-height:44px;padding:8px 4px}\n #bm252-module-nav{overflow-x:auto;display:flex;flex-wrap:nowrap;gap:5px;padding:7px 6px;scrollbar-width:thin}\n #bm252-module-nav>span{display:none}\n #bm252-module-nav button{white-space:nowrap;flex:0 0 auto;min-height:39px;font-size:11px}\n main{padding:9px 8px 28px!important}\n #calendarioControle .panel{padding:10px 7px}\n #calendarioControle .bm240-weeklabels{display:grid!important;grid-template-columns:repeat(7,minmax(0,1fr));gap:2px}\n #calendarioControle .bm240-days{display:grid!important;grid-template-columns:repeat(7,minmax(0,1fr))!important;gap:3px}\n #calendarioControle .bm240-pad{display:block!important;min-height:49px;border-radius:5px}\n #calendarioControle .bm240-day{min-height:61px!important;max-width:100%;gap:2px;padding:5px 1px!important;border-radius:7px;overflow:hidden}\n #calendarioControle .bm240-day b{font-size:11px;line-height:1.15}\n #calendarioControle .bm240-day>span:not(.bm252-dots){font-size:9px;line-height:1.1;white-space:nowrap}\n #calendarioControle .bm240-day small{display:none!important}\n #calendarioControle .bm252-dots{gap:3px}\n #calendarioControle .bm252-dots i{width:6px;height:6px}\n #calendarioControle .bm240-days[data-bm252-mode=\"day\"]{grid-template-columns:1fr!important}\n #calendarioControle #calGrid+div{max-width:100%}\n #bm252-calendar-head{padding:9px 10px}\n #bm252-month-stats span{font-size:10px;padding:4px 6px}\n #calendarioControle #calTitle{display:block;width:100%;font-size:12px}\n .item-head{flex-wrap:wrap}\n .scroll{overflow-x:auto}\n}\n@media(prefers-reduced-motion:reduce){#bm252-module-nav{scroll-behavior:auto!important}}\n\n/* V254 — manter o cronômetro nativo no DOM para o relógio inferior,\n   mas NÃO exibir seu painel duplicado ao usuário. */\n#registro>.twocol{display:block!important;grid-template-columns:minmax(0,1fr)!important;max-width:100%!important}\n#registro>.twocol>.panel:first-child{display:none!important}\n#registro>.twocol>.panel:nth-child(2){display:block!important;width:100%!important;max-width:none!important}\n#registro>.twocol>.panel:nth-child(2)>h2{font-size:17px!important}\n#bm252-main-nav{grid-template-columns:repeat(3,minmax(0,1fr))!important}\n#bm252-module-nav>span{font-size:10px!important}\n@media(max-width:680px){\n #registro>.twocol{display:block!important}\n #registro>.twocol>.panel:nth-child(2){padding:11px!important}\n #bm252-main-nav button{min-height:41px!important}\n}\n\n/* V255 — tres abas principais, com titulos legiveis e sem alterar o conteudo. */\n#bm252-main-nav{grid-template-columns:repeat(3,minmax(0,1fr))!important}\n#bm252-main-nav button{white-space:normal!important;line-height:1.2!important;min-width:0!important}\n@media(max-width:680px){\n #bm252-main-nav{gap:4px!important}\n #bm252-main-nav button{font-size:10.5px!important;min-height:43px!important;padding:7px 3px!important;overflow-wrap:break-word!important}\n}\n@media(max-width:375px){#bm252-main-nav button{font-size:10px!important;padding:6px 2px!important}}\n";root.prepend(s);
 orig.style.display='none';orig.setAttribute('aria-hidden','true');
 orig.setAttribute('aria-label','Navegação interna preservada para compatibilidade');
 mainNav=el('nav');mainNav.id='bm252-main-nav';mainNav.setAttribute('role','tablist');mainNav.setAttribute('aria-label','Três áreas principais do Controle de Estudos');
 for(const g of GROUPS){
  const b=el('button','',g.label);
  b.type='button';b.dataset.group=g.id;b.setAttribute('role','tab');
  b.addEventListener('click',()=>openGroup(g.id));
  mainNav.append(b);
 }
 header.append(mainNav);
 moduleNav=el('nav');moduleNav.id='bm252-module-nav';moduleNav.setAttribute('aria-label','Conteúdos dentro da área');
 main.prepend(moduleNav);
 const h1=header.querySelector('h1');if(h1)h1.textContent='Controle de Estudos';
 const subtitle=header.querySelector('p');
 if(subtitle)subtitle.textContent='Consulte o calendário em Ver estudado, planeje em Organizar e acompanhe o desempenho em Resumo e relatórios. Cronômetro único na barra inferior.';
 const manualPanel=$('registro')?.querySelector(':scope > .twocol > .panel:nth-child(2)');
 if(manualPanel&&!manualPanel.querySelector('#bm254-manual-help')){
  const tip=el('p','', 'O cronômetro já está disponível na barra inferior. Aqui você pode registrar manualmente uma sessão sem duplicar o relógio.');
  tip.id='bm254-manual-help';tip.style.cssText='font-size:11px;color:#53727a;margin:2px 0 12px;line-height:1.4';
  manualPanel.querySelector('h2')?.after(tip);
 }
 const pane=$('calendarioControle');
 const topPanel=pane.querySelector('.panel');
 if(topPanel){
  const hero=el('div');hero.id='bm252-calendar-head';
  hero.append(el('h3','','Calendário: realizado e planejado'));
  hero.append(el('p','','Selecione qualquer dia para ver sessões registradas e atividades planejadas. O calendário não presume estudos não registrados.'));
  const metrics=el('div');metrics.id='bm252-month-stats';hero.append(metrics);
  const legend=el('div');legend.id='bm252-legend';
  for(const [name,label] of [['done','Realizado'],['plan','Planejado'],['both','Ambos']]){
   const item=el('b',name);item.append(el('i'),document.createTextNode(label));legend.append(item);
  }
  hero.append(legend);topPanel.prepend(hero);
  const oldTitle=topPanel.querySelector('h2');if(oldTitle)oldTitle.textContent='Veja o que estudou';
 }
 const dayPanel=$('calDayTitle')?.closest('.panel');
 if(dayPanel){
  const sum=$('calDaySummary');
  const meta=el('div','bm252-day-totals');meta.id='bm252-day-meta';
  sum?.after(meta);
  const studied=el('div');studied.id='bm252-realized';
  meta.after(studied);
  const planned=$('calPlans');
  if(planned){
   const title=el('h3');title.id='bm252-planned-title';title.textContent='Planejado para este dia';
   planned.before(title);
  }
  const form=$('planForm');
  if(form){
   const wrap=el('details');wrap.id='bm252-plan-add';
   const summ=el('summary','','Adicionar atividade planejada');
   form.before(wrap);wrap.append(summ,form);if(planned)planned.after(wrap);
  }
 }
 const previousCal=$('calGrid');
 const gridObs=new MutationObserver(scheduleCalendarRefresh);
 gridObs.observe(previousCal,{childList:true,subtree:false});
 const plans=$('calPlans');
 if(plans)new MutationObserver(scheduleCalendarRefresh).observe(plans,{childList:true,subtree:false});
 const title=$('calDayTitle');
 if(title)new MutationObserver(scheduleCalendarRefresh).observe(title,{childList:true,characterData:true,subtree:true});
 const paneObs=new MutationObserver(syncNavigation);
 for(const sec of root.querySelectorAll('section.pane'))
  paneObs.observe(sec,{attributes:true,attributeFilter:['class']});
 window.addEventListener('bm240-study-changed',scheduleCalendarRefresh);
 window.addEventListener('storage',e=>{if(e.key===KEY)scheduleCalendarRefresh()});
 document.addEventListener('visibilitychange',()=>{if(!document.hidden)scheduleCalendarRefresh()});
 // O motor V245 continua responsavel por editar e salvar. Esta camada so consulta.
 installed=true;
 navTo('calendarioControle');
 syncNavigation();scheduleCalendarRefresh();
 document.dispatchEvent(new CustomEvent('bm252-study-ready',{detail:{topLevelTabs:3,source:'local_control_v245',writes:false}}));
}
function ready(){install()}
document.addEventListener('bm240-study-mounted',ready);
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',ready,{once:true});
else ready();
window.BM252StudyFlow=Object.freeze({refresh:scheduleCalendarRefresh,get ready(){return installed}});
})();

;
/* 132 assets/v253_calendar_compact.js */
/* Banco Mestre V253 — calendário em evidência. Apenas rearranjo visual,
   preservando handlers, IDs, sessões, calendário e motor de dados V245. */
(function(){
'use strict';
if(window.BM253CalendarCompact)return;
let installed=false,root=null;
function create(tag,text){
 const e=document.createElement(tag);if(text!==undefined)e.textContent=text;return e;
}
function install(){
 if(installed)return;
 const host=document.getElementById('bm240-native-host');
 const target=host?.shadowRoot;
 if(!target?.getElementById('bm252-main-nav')||!target.getElementById('calGrid')||!window.BM252StudyFlow?.ready)return;
 root=target;
 const pane=root.getElementById('calendarioControle');
 const panel=pane?.querySelector(':scope > .panel');
 const grid=root.getElementById('calGrid');
 const toolbar=panel?.querySelector(':scope > .actions');
 const hero=root.getElementById('bm252-calendar-head');
 const heading=panel?.querySelector(':scope > h2');
 const srs=panel?.querySelector(':scope > .notice');
 const help=panel?.querySelector(':scope > p.muted');
 if(!panel||!grid||!toolbar||!hero||!heading||!srs){return;}
 const style=create('style');style.id='bm253-compact-style';style.textContent="/* V253 — prioridade visual: calendario. CSS no Shadow DOM do Controle. */\n:host{line-height:1.4}\nheader{padding:7px 10px 5px!important}\nheader h1{font-size:17px!important;line-height:1.2!important;margin:0 0 2px!important}\nheader>p{display:none!important}\nmain{padding:6px 9px 22px!important}\n#bm252-main-nav{gap:4px!important;margin:2px 0 0!important}\n#bm252-main-nav button{min-height:40px!important;padding:6px 6px!important;font-size:12px!important;border-radius:7px!important}\n#bm252-module-nav{gap:5px!important;margin:0 0 7px!important;padding:4px 7px!important;border-radius:7px!important}\n#bm252-module-nav>span{font-size:10px!important}\n#bm252-module-nav button{min-height:38px!important;padding:5px 9px!important;font-size:11px!important;border-radius:6px!important}\n#calendarioControle>.panel{padding:8px 10px!important;margin:0 0 8px!important;border-radius:9px!important}\n#calendarioControle>.panel>h2{font-size:16px!important;line-height:1.3!important;margin:0 0 5px!important}\n#calendarioControle>.panel>.actions{display:flex;align-items:center;gap:4px!important;margin:0 0 6px!important}\n#calendarioControle>.panel>.actions button{min-height:38px!important;padding:6px 9px!important;font-size:11px!important;border-radius:6px!important;line-height:1.1!important}\n#calTitle{font-size:13px!important;font-weight:750;min-width:100px;line-height:1.2;margin:0 5px 0 0!important;color:#185960}\n#calGrid{margin:0!important}\n#calendarioControle .bm240-weeklabels{display:grid!important;grid-template-columns:repeat(7,minmax(0,1fr))!important;gap:3px;margin:0 0 2px!important}\n#calendarioControle .bm240-weeklabels span{text-align:center;font-size:10px!important;padding:2px 0!important}\n#calendarioControle .bm240-days{gap:4px!important}\n#calendarioControle .bm240-day{min-height:49px!important;padding:4px 3px!important;gap:1px!important;border-radius:6px!important}\n#calendarioControle .bm240-day b{font-size:11px!important;line-height:1.1!important}\n#calendarioControle .bm240-day>span:not(.bm252-dots){font-size:10px!important;line-height:1.2!important}\n#calendarioControle .bm240-day small{font-size:9px!important;line-height:1.1!important}\n#calendarioControle .bm240-pad{min-height:45px!important}\n#calendarioControle .bm252-dots{margin-top:1px!important;gap:3px!important}\n#calendarioControle .bm252-dots i{width:6px!important;height:6px!important}\n#bm252-calendar-head{display:flex;flex-wrap:wrap;align-items:center;gap:5px 12px;border:0!important;border-top:1px solid #e1ebe8!important;background:transparent!important;border-radius:0!important;padding:7px 0 0!important;margin:6px 0 0!important}\n#bm252-calendar-head>h3,#bm252-calendar-head>p{display:none!important}\n#bm252-month-stats{display:flex;flex-wrap:wrap;gap:4px!important;margin:0!important;align-items:center}\n#bm252-month-stats span{font-size:10px!important;line-height:1.2!important;padding:3px 6px!important;border-radius:5px!important}\n#bm252-legend{display:flex;gap:9px!important;margin:0!important;align-items:center;font-size:10px!important;line-height:1.3!important}\n#bm252-legend i{width:7px!important;height:7px!important}\n#bm253-srs-details{margin:6px 0 0;border-top:1px solid #e2ebe8;padding:3px 0 0}\n#bm253-srs-details>summary{font-size:11px;color:#4b6569;font-weight:650;cursor:pointer;min-height:34px;display:flex;align-items:center}\n#bm253-srs-details>.notice{margin:2px 0 5px!important;padding:7px 9px!important;font-size:11px!important}\n#bm253-srs-details>p{font-size:11px!important;margin:2px 0 6px!important;color:#637779!important}\n#bm253-srs-details .actions{margin:4px 0 0!important}\n#bm253-srs-details button{min-height:38px!important;font-size:11px!important;padding:5px 8px!important}\n#calendarioControle>.panel:nth-of-type(2){padding:9px 11px!important}\n#calDayTitle{font-size:14px!important;margin:0 0 5px!important}\n#calDaySummary{font-size:11px!important;line-height:1.35!important}\n#bm252-realized{margin:6px 0 9px!important}\n#bm252-realized h3,#bm252-planned-title{font-size:13px!important;margin:7px 0 5px!important}\n.bm252-day-totals{margin:5px 0 7px!important;gap:4px!important}\n.bm252-day-totals span{font-size:10px!important;padding:3px 6px!important}\n.bm252-record{padding:7px 9px!important;margin-bottom:5px!important;border-radius:6px!important}\n.bm252-record strong{font-size:12px!important}\n.bm252-record p,.bm252-record small{font-size:10px!important;margin:2px 0!important}\n#bm252-plan-add{margin-top:7px!important;padding:0 9px 6px!important}\n#bm252-plan-add>summary{min-height:40px!important;padding:8px 0!important;font-size:11px!important}\n#bm252-plan-add .fields{gap:7px!important}\n#bm252-plan-add input,#bm252-plan-add select{min-height:38px!important}\n@media(max-width:800px){\n header{padding:6px 7px 5px!important}\n header h1{font-size:16px!important}\n main{padding:5px 6px 18px!important}\n #bm252-main-nav button{min-height:40px!important;font-size:11px!important}\n #bm252-module-nav{margin-bottom:5px!important;padding:3px 5px!important}\n #bm252-module-nav>span{display:none!important}\n #bm252-module-nav button{min-height:39px!important;font-size:10.5px!important;padding:5px 8px!important}\n #calendarioControle>.panel{padding:6px!important;margin:0 0 7px!important}\n #calendarioControle>.panel>h2{font-size:14px!important;margin:0 0 4px!important}\n #calendarioControle>.panel>.actions{gap:3px!important;margin:0 0 5px!important}\n #calendarioControle>.panel>.actions button{min-height:39px!important;padding:6px 7px!important;font-size:10px!important}\n #calTitle{font-size:12px!important;min-width:120px}\n #calendarioControle .bm240-days{grid-template-columns:repeat(7,minmax(0,1fr))!important;gap:3px!important}\n #calendarioControle .bm240-weeklabels{gap:3px}\n #calendarioControle .bm240-day{min-height:47px!important;padding:3px 1px!important;gap:1px!important}\n #calendarioControle .bm240-day b{font-size:10px!important}\n #calendarioControle .bm240-day>span:not(.bm252-dots){font-size:8.5px!important;white-space:nowrap}\n #calendarioControle .bm240-day small{display:none!important}\n #calendarioControle .bm240-pad{min-height:42px!important}\n #bm252-calendar-head{gap:4px 8px;padding:6px 0 0!important}\n #bm252-month-stats span{font-size:9.5px!important;padding:3px 5px!important}\n #bm252-legend{font-size:9.5px!important;gap:7px!important}\n #bm253-srs-details>summary{min-height:33px!important;font-size:10.5px}\n}\n@media(max-width:380px){\n #calendarioControle>.panel>.actions button{padding:5px 6px!important;font-size:9.5px!important}\n #calTitle{flex:1 1 100%;margin:0!important}\n #calendarioControle .bm240-day{min-height:45px!important}\n}\n@media(prefers-reduced-motion:reduce){#calendarioControle *{scroll-behavior:auto!important}}\n";root.append(style);
 // Order: heading -> compact period controls -> month grid -> summary/legend -> optional SRS help.
 heading.textContent='Calendário';
 panel.prepend(heading);
 const title=root.getElementById('calTitle');
 if(title)toolbar.prepend(title);
 heading.after(toolbar);
 toolbar.after(grid);
 grid.after(hero);
 const info=create('details');info.id='bm253-srs-details';
 const summary=create('summary','Informações de revisões SRS (consulta)');
 info.append(summary);
 info.append(srs);
 if(help)info.append(help);
 hero.after(info);
 // Keep a clean one-line interpretation; textual context remains in the collapsible area.
 const intro=hero.querySelector('p');
 if(intro)intro.textContent='Toque em um dia para consultar estudos e planejamento.';
 const h=hero.querySelector('h3');if(h)h.textContent='Resumo e legenda';
 // The native V245 renderer and V252 calendar decorators continue running unchanged.
 installed=true;
 document.dispatchEvent(new CustomEvent('bm253-calendar-compact-ready',{
  detail:{layout:'calendar_first',srs_notice:'collapsible_below_calendar',written_study_data:false}
 }));
}
function ready(){install()}
document.addEventListener('bm252-study-ready',ready);
document.addEventListener('bm240-study-mounted',ready);
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',ready,{once:true});
else ready();
window.BM253CalendarCompact=Object.freeze({get ready(){return installed}});
})();

;
/* 133 assets/v256_math_display.js */
/* V256 — equações em MathML nativo. Mudança somente de apresentação. */
(function(){
'use strict';if(window.BM256MathDisplay)return;
const ns='http://www.w3.org/1998/Math/MathML',selector='.bm249-equation,.bm198-equation,[data-bm-math]';
const greek={alpha:'α',beta:'β',gamma:'γ',delta:'δ',Delta:'Δ',epsilon:'ε',theta:'θ',lambda:'λ',mu:'μ',pi:'π',rho:'ρ',sigma:'σ',Sigma:'Σ',tau:'τ',phi:'φ',omega:'ω',Omega:'Ω'};
const ops={cdot:'·',times:'×',leq:'≤',geq:'≥',neq:'≠',approx:'≈',pm:'±',to:'→',sum:'∑',int:'∫'};
const sub={'₀':'0','₁':'1','₂':'2','₃':'3','₄':'4','₅':'5','₆':'6','₇':'7','₈':'8','₉':'9'};
const sup={'⁰':'0','¹':'1','²':'2','³':'3','⁴':'4','⁵':'5','⁶':'6','⁷':'7','⁸':'8','⁹':'9'};
const e=(tag,value)=>{const x=document.createElementNS(ns,tag);if(value!==undefined)x.textContent=String(value);return x};
const row=nodes=>{const x=e('mrow');nodes.forEach(n=>x.append(n));return x};
function asTex(raw){
 let s=String(raw||'').trim().replace(/^\s*(?:\\\[|\$\$)/,'').replace(/(?:\\\]|\$\$)\s*$/,'').replace(/^\\\(|\\\)$/g,'');
 s=s.replace(/([A-Za-z][A-Za-z0-9]*(?:_[A-Za-z][A-Za-z0-9]*)?)\s*\/\s*([A-Za-z][A-Za-z0-9]*(?:_[A-Za-z][A-Za-z0-9]*)?|\d+(?:[.,]\d+)?)/g,'\\frac{$1}{$2}');
 s=s.replace(/\b([A-Za-z][A-Za-z0-9]*)_([A-Za-z0-9]+)/g,'$1_{$2}');
 s=s.replace(/([A-Za-z0-9])\^([A-Za-z0-9]+)/g,'$1^{$2}');
 const chars={'α':'\\alpha ','β':'\\beta ','γ':'\\gamma ','δ':'\\delta ','ε':'\\epsilon ','θ':'\\theta ','λ':'\\lambda ','μ':'\\mu ','π':'\\pi ','ρ':'\\rho ','σ':'\\sigma ','τ':'\\tau ','φ':'\\phi ','ω':'\\omega ','Δ':'\\Delta ','Σ':'\\Sigma ','Ω':'\\Omega '};
 s=s.replace(/[αβγδεθλμπρστφωΔΣΩ]/g,c=>chars[c]);
 return s.replace(/·/g,'\\cdot ').replace(/×/g,'\\times ').replace(/≤/g,'\\leq ').replace(/≥/g,'\\geq ').replace(/≈/g,'\\approx ').replace(/≠/g,'\\neq ').replace(/²/g,'^{2}').replace(/³/g,'^{3}').replace(/⁴/g,'^{4}').replace(/−/g,'-').replace(/[.]$/,'');
}
function mathml(tex,source){
 const toks=String(tex).match(/\\[a-zA-Z]+|\d+(?:[.,]\d+)?|[a-zA-ZÀ-ÿ]+|[₀-₉⁰-⁹²³¹]|[^\s]/gu)||[];
 let i=0,steps=0;
 function group(){if(toks[i]==='{'){i++;return sequence('}')}return atom()}
 function atom(){
  if(++steps>1600)throw Error('Expressão muito longa');
  const t=toks[i++];if(!t)return e('mtext','');
  let n;
  if(t==='\\frac'){const a=group(),b=group();n=e('mfrac');n.append(a,b)}
  else if(t==='\\sqrt'){n=e('msqrt');n.append(group())}
  else if(t==='{'||t==='('||t==='['){const close=t==='{'?'}':t==='('?')':']',part=sequence(close);n=t==='{'?part:row([e('mo',t),part,e('mo',close)])}
  else if(t.startsWith('\\')){const k=t.slice(1);n=greek[k]?e('mi',greek[k]):e('mo',ops[k]||t)}
  else if(/^\d+(?:[,.]\d+)?$/.test(t))n=e('mn',t);
  else if(/[A-Za-zÀ-ÿα-ωΑ-Ω]/u.test(t))n=e('mi',t);
  else n=e('mo',t);
  let low=null,high=null;
  while(i<toks.length){
   const next=toks[i];
   if(next==='_'||next==='^'){i++;if(next==='_')low=group();else high=group()}
   else if(sub[next]||sup[next]){i++;if(sub[next])low=e('mn',sub[next]);else high=e('mn',sup[next])}
   else break;
  }
  if(low&&high){const x=e('msubsup');x.append(n,low,high);n=x}
  else if(low){const x=e('msub');x.append(n,low);n=x}
  else if(high){const x=e('msup');x.append(n,high);n=x}
  return n;
 }
 function sequence(stop){
  const nodes=[];
  while(i<toks.length&&(!stop||toks[i]!==stop)){
   if(toks[i]==='/'&&nodes.length){
    i++;const top=nodes.pop(),bottom=atom(),frac=e('mfrac');frac.append(top,bottom);nodes.push(frac);
   }else if(['}',')',']'].includes(toks[i])){i++;break}
   else nodes.push(atom());
  }
  if(stop&&toks[i]===stop)i++;
  return row(nodes);
 }
 const root=e('math');root.setAttribute('display','block');root.setAttribute('aria-label',source||tex);root.append(sequence());return root;
}
function convert(node){
 if(node.dataset.bm256Math)return;
 const original=node.textContent.trim();
 if(!original||original.length>240||/https?:\/\//i.test(original)||!/[=≈≤≥]|\\(?:frac|sqrt)/.test(original))return;
 try{
  const tex=asTex(original),visual=document.createElement('span'),raw=document.createElement('span');
  visual.className='bm256-math-visual';visual.setAttribute('role','img');visual.setAttribute('aria-label','Equação: '+original);visual.append(mathml(tex,original));
  raw.className='bm256-math-source';raw.textContent=original;
  node.replaceChildren(visual,raw);node.dataset.bm256Math='rendered';node.dataset.bm256Original=original;
 }catch(err){console.warn('V256: preservada a fórmula textual',err);node.dataset.bm256Math='fallback'}
}
let pending=false;
function scan(){pending=false;document.querySelectorAll(selector).forEach(convert)}
function schedule(){if(!pending){pending=true;queueMicrotask(scan)}}
function start(){
 schedule();
 const observer=new MutationObserver(ms=>{
  if(ms.some(m=>Array.from(m.addedNodes).some(n=>n.nodeType===1&&(n.matches?.(selector)||n.querySelector?.(selector)))))schedule();
 });
 observer.observe(document.body,{childList:true,subtree:true});
}
window.BM256MathDisplay=Object.freeze({asTex,mathml,scan,version:'V256',sourcePreserved:true});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();

;
/* 134 assets/v256_lacunas_layout.js */
/* V256 — ficha de lacuna com hierarquia, relato intacto e histórico legível. */
(function(){
'use strict';if(window.BM256LacunasLayout)return;
const make=(tag,cls,value)=>{const x=document.createElement(tag);if(cls)x.className=cls;if(value!==undefined)x.textContent=value;return x};
function section(p,title,style){
 const anchor=document.createComment('posição da lacuna');p.replaceWith(anchor);
 const group=make('section','bm256-lac-block '+style);group.append(make('h4','',title),p);
 anchor.replaceWith(group);return group;
}
function enhance(item){
 if(item.dataset.bm256Layout)return;
 const head=item.querySelector(':scope > strong'),id=item.querySelector(':scope > code');
 if(!head||!id)return;
 const h=make('header','bm256-lac-header'),title=make('h3'),label=make('div','bm256-lac-id');
 title.append(head);label.append(id);h.append(title,label);item.prepend(h);
 const p=[...item.children].filter(x=>x.tagName==='P');
 const trail=p.find(x=>x.textContent.includes(' › '));
 if(trail){trail.classList.add('bm256-lac-path');trail.setAttribute('aria-label','Disciplina, assunto, tema e subassunto')}
 const metadata=p.find(x=>x.classList.contains('bm242-muted')&&x.textContent.includes(' · '));
 if(metadata){
  const values=metadata.textContent.split(' · ');
  if(values.length===4){
   const dl=make('dl','bm256-lac-meta');
   ['Tipo','Cobertura','Situação','Prioridade'].forEach((name,i)=>{const d=make('div');d.append(make('dt','',name),make('dd','',values[i]));dl.append(d)});
   metadata.replaceWith(dl);
  }
 }
 const blocks=[
  ['Relato literal:','Minha dúvida, nas minhas palavras','bm256-lac-student'],
  ['Diagnóstico do assistente','Diagnóstico e grau de certeza','bm256-lac-analysis'],
  ['Origem:','Questão ou pesquisa de origem','bm256-lac-origin'],
  ['Pesquisa:','Pesquisa e reforço','bm256-lac-research']
 ];
 for(const [prefix,title,style] of blocks){
  const n=[...item.children].find(x=>x.tagName==='P'&&x.firstElementChild?.tagName==='B'&&x.firstElementChild.textContent.startsWith(prefix));
  if(!n)continue;
  const confidence=prefix==='Diagnóstico do assistente'?n.firstElementChild.textContent.replace(/^Diagnóstico do assistente\s*/,'').replace(/:\s*$/,'').trim():'';
  const s=section(n,title,style);
  if(confidence){const detail=make('p','bm256-lac-confidence','Certeza informada: '+confidence);s.insertBefore(detail,n)}
 }
 const actions=item.querySelector(':scope > .bm242-actions');
 if(actions){actions.classList.add('bm256-lac-actions');actions.setAttribute('aria-label','Ações desta lacuna');
  const stage=actions.querySelector('[data-stage]');if(stage){stage.classList.add('bm256-lac-stage');stage.title='A mudança de situação não substitui evidência de domínio nem altera o SRS';}
 }
 const history=[...item.children].find(x=>x.tagName==='DETAILS'&&x.querySelector('summary')?.textContent==='Fonte, auditoria e histórico');
 if(history){
  history.classList.add('bm256-lac-history');history.querySelector('summary').textContent='Fontes, auditoria e linha do tempo';
  history.querySelectorAll(':scope > p').forEach(line=>{
   const raw=line.textContent,match=raw.match(/^(\S+T\S+)\s+·\s+([^·]+)\s+·\s*(.*)$/);
   if(!match)return;
   const date=new Date(match[1]);if(!Number.isFinite(+date))return;
   const pt=new Intl.DateTimeFormat('pt-BR',{timeZone:'America/Sao_Paulo',dateStyle:'short',timeStyle:'short'}).format(date);
   line.textContent=pt+' · '+match[2].trim()+(match[3]?' · '+match[3]:'');
   line.title=raw;line.classList.add('bm256-lac-event');
  });
 }
 item.dataset.bm256Layout='1';
}
let pending=false;
function render(){pending=false;document.querySelectorAll('#bm242-list > article.bm242-item').forEach(enhance)}
function schedule(){if(!pending){pending=true;queueMicrotask(render)}}
function start(){
 schedule();const observer=new MutationObserver(changes=>{
  if(changes.some(m=>m.target.id==='bm242-list'||Array.from(m.addedNodes).some(n=>n.nodeType===1&&(n.matches?.('.bm242-item,#bm242-list')||n.querySelector?.('.bm242-item')))))schedule();
 });
 observer.observe(document.body,{childList:true,subtree:true});
}
window.BM256LacunasLayout=Object.freeze({render,version:'V256',doesNotSave:true});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();

;
/* 135 assets/v258_math_refinement.js */
/* V258 — Corrige linhas mistas (prosa + fórmulas) sem modificar a fonte Drive. */
(function(){
'use strict';
if(window.BM258MathRefinement)return;
const selector='.bm249-equation,.bm198-equation,[data-bm-math]';
const el=(name,cls,value)=>{
 const n=document.createElement(name);
 if(cls)n.className=cls;
 if(value!==undefined)n.textContent=String(value);
 return n;
};
function isNarrative(fragment){
 const s=String(fragment||'').trim();
 const idx=s.indexOf('=');
 if(idx<0)return true;
 const lhs=s.slice(0,idx).trim(),rhs=s.slice(idx+1).trim();
 if(/^\[.*\]$/.test(lhs))return true;
 if(/^[\p{L}À-ÿ]{5,}(?:\b|$)/u.test(rhs)&&!/[·×*+−-]/.test(rhs.slice(0,15)))return true;
 if(/[\p{L}]{4,}\s+(?:[\p{L}]{1,3}\s+)?[\p{L}]{4,}/u.test(rhs))return true;
 // A left-hand description ("M nos engastes") is not an algebraic symbol.
 const lhsWords=lhs.split(/\s+/).filter(Boolean);
 if(/^[\p{L}À-ÿ]{6,}(?:-[\p{L}À-ÿ]{3,})*$/u.test(lhs)&&lhs===lhs.toLocaleLowerCase('pt-BR'))return true;
 if(lhsWords.length>=2&&lhsWords.some(x=>/^[\p{L}À-ÿ]{3,}$/u.test(x)))return true;
 // Explanatory clauses or units must never become invisible-spaced MathML identifiers.
 if(/(?:^|[\s,;])(?:para|quando|onde|conforme|com|sendo|então|depois|somente|sinais|definida|definido|dependem|depende|inclusive|exceto|porque|aquecimento|resfriamento|impedida|considerando|respectivamente|sob|medido|extremidade|oposta|engastada|articulada|equilíbrio|convenção|definição|nos|nas|aplicáveis|compatíveis)\b/iu.test(rhs))return true;
 if(/(?:[.!?]\s+[\p{L}]{3,})/u.test(rhs))return true;
 if(/\[[^\]]*(?:\s+[\p{L}]{2,}){2,}[^\]]*\]/u.test(rhs))return true;
 return false;
}
function separate(raw){
 const source=String(raw||'').trim();
 if(!source||!source.includes('=')||source.length>1600||/https?:\/\//i.test(source))return null;
 let remainder=source,context='';
 const firstEq=source.indexOf('='),colon=source.indexOf(':');
 if(colon>0&&colon<firstEq){
  const candidate=source.slice(0,colon).trim();
  // Colon before equality divides explanation from equations.
  if(candidate.length>2&&/[\p{L}]/u.test(candidate)){
   context=source.slice(0,colon+1).trim();
   remainder=source.slice(colon+1).trim();
  }
 }
 const fields=remainder.split(/\s*;\s*/).filter(Boolean);
 const unitGlossary=/^\s*\[[^\]]+\]\s*=/.test(remainder);
 const parts=fields.map(value=>({value,kind:unitGlossary||isNarrative(value)?'text':'math'}));
 const needsRepair=Boolean(context)||parts.length>1||parts.some(x=>x.kind==='text');
 if(!needsRepair)return null;  // A simple, pure formula stays with the established V256 renderer.
 return {source,context,parts};
}
function render(node){
 if(node.dataset.bm258Math)return;
 const original=node.dataset.bm256Original||node.textContent||'';
 const plan=separate(original);
 if(!plan){node.dataset.bm258Math='unchanged';return;}
 const wrapper=el('div','bm258-composed-math');
 if(plan.context)wrapper.append(el('p','bm258-context',plan.context));
 const core=window.BM256MathDisplay;
 for(const part of plan.parts){
  if(part.kind==='math'&&core?.asTex&&core?.mathml){
   try{
    const m=core.mathml(core.asTex(part.value),part.value);
    const equation=el('div','bm258-equation');
    equation.setAttribute('role','group');
    equation.setAttribute('aria-label','Expressão matemática: '+part.value);
    equation.append(m);wrapper.append(equation);
   }catch(err){
    console.warn('V258: expressão textual preservada',err);
    wrapper.append(el('p','bm258-prose',part.value));
   }
  }else wrapper.append(el('p','bm258-prose',part.value));
 }
 // Retain the entire literal source in accessible DOM without changing stored records.
 const source=el('span','bm258-original-source',plan.source);
 source.setAttribute('aria-hidden','true');
 node.replaceChildren(wrapper,source);
 node.dataset.bm258Math='composed';
 node.dataset.bm258Original=plan.source;
}
let pending=false;
function scan(){
 pending=false;
 document.querySelectorAll(selector).forEach(render);
}
function schedule(){if(!pending){pending=true;queueMicrotask(scan);}}
function start(){
 schedule();
 const mo=new MutationObserver(ms=>{
  if(ms.some(m=>Array.from(m.addedNodes).some(n=>
   n.nodeType===1&&(n.matches?.(selector)||n.querySelector?.(selector)))))schedule();
 });
 mo.observe(document.body,{childList:true,subtree:true});
}
window.BM258MathRefinement=Object.freeze({separate,scan,version:'V258',writesStudyData:false});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});
else start();
})();

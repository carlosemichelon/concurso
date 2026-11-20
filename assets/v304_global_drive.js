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
 // Módulos próprios já atualizam PDF/imagens automaticamente quando conectados.
 // Controle local é enviado periodicamente com verificação de conflitos, sem alterar o SRS.
 setInterval(()=>{
  if(busy||backgroundBusy||foregroundPromise||!writeToken()||document.visibilityState!=='visible'||Date.now()-lastRun<10800000)return;
  backgroundBusy=true;lastRun=Date.now();
  void (async()=>{
   try{
    const tokenNow=writeToken();
    const controlApi=window.BM240ControlDrive;
    if(controlApi?.sync){
     const r=await controlApi.sync(tokenNow);
     if(r&&['uploaded','downloaded','unchanged'].includes(r.state)){
      try{
       const backupApi=window.BM240StudyBackups;
       if(backupApi?.afterSync){
        const b=await backupApi.afterSync(tokenNow);
        if(b&&!['verified','unchanged','empty'].includes(b.state))state(b.message||'Backup: revisão necessária','partial');
       }else if(r.state!=='empty')state('Backup do Controle indisponível; nenhuma cópia foi presumida','partial');
      }catch(e){state('Backup do Controle: '+e.message,'partial')}
     }else if(r?.state==='conflict'||r?.state==='error'||r?.state==='merge_ready')
      state(r.message||'Controle: conferência pendente','partial');
    }else state('Controle: módulo de sincronização indisponível','partial');
    const lacunasApi=window.BM242LacunasDrive;
    if(lacunasApi?.sync){
     const r=await lacunasApi.sync(tokenNow);
     if(r?.state==='conflict'||r?.state==='error')state(r.message||'Lacunas: conferência pendente','partial');
    }
   }catch(e){state('Sincronização periódica: '+e.message,'partial')}
   finally{backgroundBusy=false}
  })();
 },10800000);
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
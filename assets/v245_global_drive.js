/* V242 — conexão Drive única no cabeçalho: biblioteca de imagens, PDFs,
   mestre de grifos e Controle de Estudos. A base pública e o SRS canônico não são gravados.
   Nenhum access token é persistido em localStorage, cookies ou GitHub. */
(function(){
'use strict';
if(window.BM239DriveGlobal)return;
const READ='https://www.googleapis.com/auth/drive.readonly',
 WRITE='https://www.googleapis.com/auth/drive.file';
let client=null,token='',expires=0,write=false,busy=false,ready=false,lastRun=0,
 lastReport=null;
const $=id=>document.getElementById(id);
const media=()=>window.BancoMestreMediaSyncV182;
function active(){return token&&Date.now()<expires?token:''}
function writeToken(){return write?active():''}
function state(message,type='idle'){
 const el=$('bm239-sync-details');
 if(el){el.textContent=message;el.dataset.state=type;el.title=message}
 const b=$('bm239-drive-action');
 if(b){b.dataset.connected=String(Boolean(active()||media()?.token?.()));b.disabled=busy||!ready;
  b.textContent=busy?'Sincronizando Drive…':active()?'Sincronizar Drive':'Conectar e sincronizar Drive';
  b.setAttribute('aria-busy',String(busy));
 }
}
function install(){
 if($('bm239-drive-action'))return;
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
  ready=true;
  document.documentElement.classList.add('bm239-global-ready');
  state(media()?.token?.()?'Drive conectado para leitura; clique no botão para habilitar a sincronização privada.':'Drive desconectado · conecte uma vez para consultar e sincronizar.','idle');
 }catch(e){ready=false;document.documentElement.classList.remove('bm239-global-ready');state('Conexão central indisponível: '+e.message,'error')}
}
function click(){
 if(busy||!ready)return;
 if(active()&&write){void syncAll();return}
 // Invocar o Google diretamente no gesto do clique, não após um await.
 busy=true;state('Aguardando autorização do Google…');
 try{client.requestAccessToken({prompt:''})}
 catch(e){busy=false;state('Não foi possível abrir a autorização: '+e.message,'error')}
}
async function syncAll(){
 if(busy&&lastReport?.running)return;
 busy=true;lastReport={running:true};state('Sincronizando imagens, PDFs, grifos e Controle…');
 const notes=[],warnings=[];
 try{
  const m=media();
  if(!m?.token?.())throw Error('Token de leitura não foi disponibilizado ao portal');
  // O core não grava mídias; confirma diretamente a fonte do Drive.
  const started=Date.now();
  const result=await m.syncAll();
  const fresh=Number.isFinite(Date.parse(result?.at||''))&&Date.parse(result.at)>=started-1000;
  const pdf=fresh?result?.pdf:null;
  const img=fresh?result?.img:null;
  const gallery=window.BancoMestreDriveImagesV182;
  if(!fresh)warnings.push('Consulta de mídias sem confirmação desta execução');
  const foundPdf=pdf?.found==null?NaN:Number(pdf.found);
  if(Number.isSafeInteger(foundPdf)&&foundPdf===78)notes.push('78 PDFs consultados no Drive');
  else warnings.push('PDFs: '+(Number.isSafeInteger(foundPdf)?foundPdf+' de 78 localizados':'consulta não confirmada'));
  const imgFound=img?.found==null?NaN:Number(img.found),galleryCount=gallery?.lastCount==null?NaN:Number(gallery.lastCount);
  if(Number.isSafeInteger(imgFound)&&imgFound>0&&Number.isSafeInteger(galleryCount)&&galleryCount===imgFound&&gallery?.lastSuccess)
   notes.push(imgFound+' imagens originais consultadas no Drive');
  else warnings.push('Atlas: consulta dos originais não confirmada');
  if(writeToken()){
   const control=window.BM240ControlDrive?.sync?
    await window.BM240ControlDrive.sync(writeToken()):null;
   if(!control||!['uploaded','downloaded','unchanged'].includes(control.state))
    warnings.push(control?.message||'Controle: não conferido');
   else{
    notes.push(control.message);
    try{
     const backup=await window.BM240StudyBackups?.afterSync(writeToken());
     if(backup&&!['verified','unchanged'].includes(backup.state))
      warnings.push(backup.message||'Backup do Controle não confirmado');
     else if(backup)notes.push(backup.message||'Backup do Controle verificado');
     else warnings.push('Backup do Controle não inicializado');
    }catch(e){warnings.push('Backup do Controle: '+e.message)}
   }
   const gaps=window.BM242LacunasDrive?.sync?await window.BM242LacunasDrive.sync(writeToken()):null;
   if(!gaps||!['uploaded','downloaded','unchanged'].includes(gaps.state))warnings.push(gaps?.message||'Lacunas: mestre privado não conferido');
   else notes.push(gaps.message);
   const g=window.BancoMestreGrifosDriveSyncV104;
   if(g?.sync){
    try{
     const previous=Number(g.lastSync)||0;
     await g.sync();
     const status=String(g.lastStatus||'');
     const freshGrifos=(Number(g.lastSync)||0)>previous;
     if(freshGrifos&&/^Cores\/grifos confirmados no Drive:/.test(status)&&/Sem divergências detectadas\./.test(status))
      notes.push('Grifos: mestre privado conferido, sem divergências');
     else if(/divergência\(s\)|Não sincronizado|feche o PDF|não foi possível/i.test(status))
      warnings.push('Grifos: '+status.slice(0,155));
     else warnings.push('Grifos: confirmação recente e sem divergências indisponível');
    }catch(e){warnings.push('Grifos: '+e.message)}
   }else warnings.push('Grifos: mestre não inicializado');
  }else{
   warnings.push('Permissão drive.file não concedida: Controle e grifos não foram enviados');
  }
  lastRun=Date.now();
  window.BM208AtlasUnified?.refresh?.();
  const summary=(warnings.length?'Sincronização parcial: ':'Drive verificado: ')+
   (notes.length?notes.join(' · '):'nenhum módulo confirmado')+
   (warnings.length?' · Pendências: '+warnings.join(' | '):'')+
   '. SRS canônico preservado.';
  lastReport={at:new Date().toISOString(),notes,warnings,summary,complete:warnings.length===0};
  state(summary,warnings.length?'partial':'ok');
  document.dispatchEvent(new CustomEvent('bm239-sync-finished',{detail:{complete:lastReport.complete,at:lastReport.at}}));
  return lastReport;
 }catch(e){
  lastReport={at:new Date().toISOString(),notes,warnings:[e.message],complete:false};
  state('Falha na sincronização: '+e.message+'. Dados originais preservados.','error');
  return lastReport;
 }finally{busy=false;const b=$('bm239-drive-action');if(b){b.disabled=!ready;b.textContent=active()?'Sincronizar Drive':'Conectar e sincronizar Drive';b.setAttribute('aria-busy','false')}}
}
function init(){
 install();
 document.addEventListener('bm-media-drive-authorized',()=>{
  if(!busy&&!active())state('Drive autorizado para arquivos de leitura. Use o botão único para sincronizar também dados privados.');
 });
 // Módulos próprios já atualizam PDF/imagens automaticamente quando conectados.
 // Controle local é enviado periodicamente com verificação de conflitos, sem alterar o SRS.
 setInterval(()=>{
  if(!busy&&writeToken()&&document.visibilityState==='visible'&&Date.now()-lastRun>=120000){
   void window.BM240ControlDrive?.sync(writeToken()).then(async r=>{
    if(r&&['uploaded','downloaded','unchanged'].includes(r.state)){
     try{
      const b=await window.BM240StudyBackups?.afterSync(writeToken());
      if(b&&!['verified','unchanged'].includes(b.state))state(b.message,'partial');
     }catch(e){state('Backup do Controle: '+e.message,'partial')}
    }else if(r?.state==='conflict'||r?.state==='error'||r?.state==='merge_ready')state(r.message,'partial');
   });
   void window.BM242LacunasDrive?.sync(writeToken()).then(r=>{
    if(r?.state==='conflict'||r?.state==='error')state(r.message,'partial');
   });
  }
 },120000);
 void prepare();
}
window.BM239DriveGlobal=Object.freeze({
 get connected(){return Boolean(active()||media()?.token?.())},
 get writeAuthorized(){return Boolean(writeToken())},writeToken,
 sync:()=>syncAll(),get lastReport(){return lastReport}
});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
else init();
})();
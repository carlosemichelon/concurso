/* V239 — conexão Drive única no cabeçalho: biblioteca de imagens, PDFs,
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
  const result=await m.syncAll();
  const pdf=window.BancoMestrePDFSyncV130?.lastResult||result?.pdf;
  const gallery=window.BancoMestreDriveImagesV182;
  if(pdf)notes.push((pdf.found??'—')+' PDFs consultados');
  else warnings.push('PDFs sem conferência concluída');
  if(gallery?.lastSuccess)notes.push((gallery.lastCount??'—')+' imagens originais consultadas');
  else warnings.push('Atlas ainda não confirmado');
  if(writeToken()){
   const control=window.BM239ControlDrive?.sync?
    await window.BM239ControlDrive.sync(writeToken()):null;
   if(control?.state==='conflict'||control?.state==='error'||!control)
    warnings.push(control?.message||'Controle de Estudos sem verificação');
   else notes.push(control.message);
   const g=window.BancoMestreGrifosDriveSyncV104;
   if(g?.sync){
    try{
     await g.sync();
     const result=String(g.lastStatus||'');
     if(/confirmados no Drive|arquivo mestre único|sincronizadas|sem divergências/i.test(result))
      notes.push('Grifos: mestre privado conferido');
     else if(/não sincronizado|feche o PDF|não foi possível/i.test(result))
      warnings.push('Grifos: '+result.slice(0,140));
     else warnings.push('Grifos: confira o estado no módulo de PDFs');
    }catch(e){warnings.push('Grifos: '+e.message)}
   }else warnings.push('Mestre de grifos não inicializado');
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
   void window.BM239ControlDrive?.sync(writeToken()).then(r=>{
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
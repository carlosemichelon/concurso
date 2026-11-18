/* V240 — conexão Drive única no cabeçalho: biblioteca de imagens, PDFs,
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
const integrity={pdfs:'Não conferido',imagens:'Não conferido',controle:'Não conferido',grifos:'Não conferido',backups:'Não conferido'};
function renderIntegrity(){
 const panel=$('bm240-integrity');
 if(!panel)return;
 panel.replaceChildren();
 for(const [name,value] of Object.entries(integrity)){
  const row=document.createElement('p');row.style.margin='6px 0';
  const strong=document.createElement('strong');strong.textContent=name.toUpperCase()+': ';
  const text=document.createElement('span');text.textContent=value;row.append(strong,text);panel.append(row);
 }
}
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
 const more=document.createElement('details');more.id='bm240-integrity-panel';
 more.style.cssText='font-size:12px;min-width:190px;max-width:320px;padding:6px 9px;border:1px solid #d6e4e0;border-radius:9px';
 const summary=document.createElement('summary');summary.textContent='Integridade por módulo';
 const statuses=document.createElement('div');statuses.id='bm240-integrity';more.append(summary,statuses);
 host.append(btn,detail,more);renderIntegrity();
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
 const reportModule=(name,value)=>{integrity[name]=value;renderIntegrity()};
 try{
  // Cada módulo falha independentemente: indisponibilidade do catálogo NÃO bloqueia o backup das sessões.
  const m=media();
  let pdf=null;
  const gallery=window.BancoMestreDriveImagesV182;
  try{
   if(!m?.token?.()||typeof m.syncAll!=='function')throw Error('Leitura do Drive indisponível');
   const result=await m.syncAll();
   pdf=window.BancoMestrePDFSyncV130?.lastResult||result?.pdf;
   if(pdf){notes.push((pdf.found??'—')+' PDFs consultados');reportModule('pdfs','Consulta de '+(pdf.found??'—')+' documentos concluída; abertura individual não comprovada');}
   else{warnings.push('PDFs sem conferência concluída');reportModule('pdfs','Consulta pendente');}
   if(gallery?.lastSuccess){notes.push((gallery.lastCount??'—')+' imagens originais consultadas');reportModule('imagens','Consulta de '+(gallery.lastCount??'—')+' originais concluída; prévia individual não verificada');}
   else{warnings.push('Atlas ainda não confirmado');reportModule('imagens','Consulta pendente');}
  }catch(error){
   warnings.push('Consulta PDFs/imagens: '+error.message);
   reportModule('pdfs','Falha na consulta; sem confirmação');
   reportModule('imagens','Consulta não confirmada');
  }
  if(writeToken()){
   const control=window.BM240ControlDrive?.sync?
    await window.BM240ControlDrive.sync(writeToken()):null;
   reportModule('controle',control?.message||'Sem confirmação');
   if(control?.state==='conflict'||control?.state==='merge_ready'||control?.state==='error'||!control)
    warnings.push(control?.message||'Controle de Estudos sem verificação');
   else notes.push(control.message);
   if(control&&['uploaded','downloaded','unchanged'].includes(control.state)){
    const backup=await window.BM240StudyBackups?.afterSync(writeToken());
    reportModule('backups',backup?.message||'Cópias ainda não confirmadas');
    if(backup?.state==='verified')notes.push(backup.message);
    else warnings.push(backup?.message||'Backups: módulo não disponível');
   }
   const g=null; // STAGING: writes of canonical highlights are intentionally disabled
   if(g?.sync){
    try{
     await g.sync();
     const result=String(g.lastStatus||'');reportModule('grifos',result||'Verificação inconclusiva');
     if(/confirmados no Drive|arquivo mestre único|sincronizadas|sem divergências/i.test(result))
      notes.push('Grifos: mestre privado conferido');
     else if(/não sincronizado|feche o PDF|não foi possível/i.test(result))
      warnings.push('Grifos: '+result.slice(0,140));
     else warnings.push('Grifos: confira o estado no módulo de PDFs');
    }catch(e){warnings.push('Grifos: '+e.message);reportModule('grifos','Erro: '+e.message)}
   }else{warnings.push('Grifos: sincronização canônica desativada na homologação para proteger os originais');reportModule('grifos','Somente leitura no ambiente de teste; dados canônicos preservados');}
  }else{
   warnings.push('Permissão drive.file não concedida: Controle e grifos não foram enviados');reportModule('controle','Permissão de gravação ausente');reportModule('grifos','Permissão de gravação ausente');reportModule('backups','Permissão de gravação ausente');
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
 window.addEventListener('bm240-study-changed',()=>{
  integrity.controle='Registros locais alterados; verificação remota pendente';renderIntegrity();
  state('Controle salvo localmente; sincronização remota pendente.','partial');
 });
 document.addEventListener('bm-media-drive-authorized',()=>{
  if(!busy&&!active())state('Drive autorizado para arquivos de leitura. Use o botão único para sincronizar também dados privados.');
 });
 // Módulos próprios já atualizam PDF/imagens automaticamente quando conectados.
 // Controle local é enviado periodicamente com verificação de conflitos, sem alterar o SRS.
 setInterval(()=>{
  if(!busy&&writeToken()&&document.visibilityState==='visible'&&Date.now()-lastRun>=120000){
   void window.BM240ControlDrive?.sync(writeToken()).then(async r=>{
    if(r?.state==='conflict'||r?.state==='merge_ready'||r?.state==='error'){
      integrity.controle=r.message;renderIntegrity();state(r.message,'partial');
     }else if(r&&['unchanged','uploaded','downloaded'].includes(r.state)){
      integrity.controle=r.message;
      const backup=await window.BM240StudyBackups?.afterSync(writeToken());
      integrity.backups=backup?.message||'Backup não confirmado';
      renderIntegrity();
      if(backup?.state==='error')state(backup.message,'partial');
     }
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
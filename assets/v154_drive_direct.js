/* V154 — Correção de rede/CORS no download Drive, com rota alternativa e entrada local segura.
 * Base V048 preservada: sem transferir nem modificar PDFs, grifos, IDs ou autorizações.
 * V048 — Drive PDF direto com OAuth autorizado e reabertura guiada. Nenhum PDF privado é publicado.
 * O GitHub Pages não obtém cookies/bytes de iframes Google Drive por CORS;
 * quando configurado, GIS + Drive API lê os bytes para o PDF.js do navegador.
 */
(function(){
'use strict';
const API='https://www.googleapis.com/drive/v3/files/';
const API_FALLBACK='https://content.googleapis.com/drive/v3/files/';
const SCOPE='https://www.googleapis.com/auth/drive.readonly';
let token=null,expires=0,client=null,config=null,pending=null,ready=null,busy=false,waitingDoc=null;
// Uma autorização anterior pode ser lembrada, mas o access token expira; nunca gravar tokens.
const CONSENT_KEY='BM_DRIVE_READ_CONSENT_V048';
let consentRemembered=false;
try{consentRemembered=localStorage.getItem(CONSENT_KEY)==='1'}catch(_){}
function rememberConsent(){consentRemembered=true;try{localStorage.setItem(CONSENT_KEY,'1')}catch(_){}}
function hasLocalPDF(doc){try{return localStorage.getItem('BM_PDF_HAS_SOURCE_V037:'+doc.id)==='1'}catch(_){return false}}

const editBar=document.getElementById('pdfChooseLocal')?.parentElement;
const inlineButton=document.createElement('button');
inlineButton.id='driveConnectInPdfV042';inlineButton.type='button';inlineButton.className='primary';
inlineButton.hidden=true;inlineButton.style.display='none';inlineButton.textContent='Conectar Drive e editar esta lei';
inlineButton.title='Autorizar leitura do Drive para abrir a lei diretamente no editor';
if(editBar)editBar.insertBefore(inlineButton,document.getElementById('pdfChooseLocal'));
function showConnect(on){inlineButton.hidden=!on;inlineButton.style.display=on?'':'none';}
// Alternativa explícita, somente após falha; permite escolher uma cópia autorizada no
// computador, mantendo a mesma identidade de PDF e os mesmos grifos no leitor.
const localFallback=document.createElement('button');
localFallback.id='driveLocalFallbackV147';
localFallback.type='button';
localFallback.className='primary';
localFallback.textContent='Abrir cópia local do PDF';
localFallback.hidden=true;localFallback.style.display='none';
localFallback.style.cssText+=';background:#edf5fa;color:#1b5a79;border:1px solid #a8cadb;';
if(editBar)editBar.insertBefore(localFallback,document.getElementById('pdfChooseLocal').nextSibling);
function showFallback(on){localFallback.hidden=!on;localFallback.style.display=on?'':'none';}
localFallback.onclick=()=>{
 // O seletor local mantém o mesmo ID do documento aberto; não faz upload.
 const input=document.getElementById('pdfFileInput');
 if(!input){notify('Seletor de arquivo local indisponível nesta versão.');return;}
 notify('Selecione a cópia PDF deste documento que está no seu computador. Nenhum arquivo será enviado ao site.');
 input.click();
};
const $=id=>document.getElementById(id);
function notify(message){
 const el=$('driveDirectStatusV038');if(el)el.textContent=message;
 const p=$('pdfLocalStatus');if(p)p.textContent=message;
}
async function loadScript(url){
 if(window.google?.accounts?.oauth2)return;
 await new Promise((resolve,reject)=>{
  const script=document.createElement('script');
  script.src=url;script.async=true;script.onload=resolve;script.onerror=()=>reject(Error('Biblioteca Google Identity Services indisponível'));
  document.head.append(script);
 });
}
async function prepare(){
 if(ready)return ready;
 ready=(async()=>{
  const r=await fetch('assets/drive_auth_v038.json',{cache:'no-store'});
  if(!r.ok)throw Error('Configuração de conexão Google Drive não encontrada');
  config=await r.json();
  if(!config.client_id||!/\.apps\.googleusercontent\.com$/.test(config.client_id))return false;
  await loadScript('https://accounts.google.com/gsi/client');
  if(!window.google?.accounts?.oauth2?.initTokenClient)throw Error('Autorização Google indisponível');
  client=google.accounts.oauth2.initTokenClient({
   client_id:config.client_id,
   scope:SCOPE,
   callback:response=>{
    if(response.error||!response.access_token){
     token=null;expires=0;notify('Acesso Google Drive não autorizado: '+(response.error||'sem token'));return;
    }
    token=response.access_token;
    expires=Date.now()+Math.max(1,Number(response.expires_in||3600)-90)*1000;
    rememberConsent();
    notify('Drive autorizado nesta sessão. PDFs já abertos ficam guardados neste navegador para acesso posterior sem nova conexão.');
    const b=$('driveConnectV038');if(b)b.textContent='Google Drive conectado';
    if(waitingDoc){const request=waitingDoc;waitingDoc=null;showConnect(false);openAndEdit(request.doc,request.options)}
   },
   error_callback:e=>notify('Falha na autorização do Google Drive: '+(e?.type||'desconhecida'))
  });
  return true;
 })().catch(e=>{ready=null;notify('Conexão Google Drive indisponível: '+e.message);return false});
 return ready;
}
function authorize(){
 if(!client){notify('Google Drive ainda está inicializando. Tente novamente após a conexão ficar pronta.');return}
 // O fluxo OAuth requer interação explícita do titular; nunca solicita senha neste site.
 client.requestAccessToken({prompt:consentRemembered?'':'consent'});
}
const ui=document.createElement('div');ui.id='driveDirectV038';ui.className='v038-drive-direct';
ui.innerHTML='<strong>PDFs do Drive no editor</strong><p>Depois da primeira autorização, PDFs abertos podem ser retomados neste navegador com os grifos preservados. Se a sessão Google expirar, uma nova autorização de acesso poderá ser exigida para arquivos ainda não guardados.</p><button id="driveConnectV038" type="button">'+(consentRemembered?'Renovar acesso ao Drive':'Conectar Google Drive')+'</button><small id="driveDirectStatusV038" role="status">Verificando conexão…</small>';
const root=$('pdfAreaNavV036');
if(root)root.before(ui);
const button=$('driveConnectV038');if(button){button.onclick=authorize;button.disabled=true}
inlineButton.onclick=authorize;inlineButton.disabled=true;
// Na V042, "Editar PDF" deve usar o Drive, não abrir o seletor/baixar o original.
// O seletor local continua disponível para PDFs importados sem file_id.
const mainEdit=$('pdfChooseLocal'),localEdit=mainEdit?.onclick;
if(mainEdit){
 mainEdit.onclick=()=>{
  const doc=window.BancoMestrePDFV042?.currentDoc;
  if(doc?.file_id){
   if(window.BancoMestrePDFV042?.editing){
    notify('O PDF já está aberto para grifar nesta janela.');
    return;
   }
   if(hasLocalPDF(doc)){
    void openAndEdit(doc);
    return;
   }
   if(!client){
    waitingDoc=waitingDoc?.doc?.id===doc.id?waitingDoc:{doc,options:{}};
    notify('O Google Drive ainda está inicializando. Aguarde o botão Conectar Drive ficar disponível.');
    showConnect(true);
    return;
   }
   if(!token||expires<=Date.now()){
    waitingDoc=waitingDoc?.doc?.id===doc.id?waitingDoc:{doc,options:{}};
    notify('Autorizando leitura para editar o PDF diretamente neste site, sem download...');
    authorize(); // clique real: preserva gesto do usuário exigido pelo OAuth.
    return;
   }
   openAndEdit(doc);return;
  }
  if(typeof localEdit==='function')localEdit();
 };
}
prepare().then(ok=>{
 if(!button)return;
 if(ok){button.disabled=false;inlineButton.disabled=false;notify(consentRemembered?'Acesso anterior reconhecido. PDFs armazenados abrem sem nova conexão; para arquivos novos, renove a autorização se necessário.':'Conexão Google pronta. Autorize a leitura para abrir PDFs do Drive.')}
 else{button.disabled=true;notify('Leitura direta dos PDFs privados ainda não está habilitada: falta cadastrar o client ID OAuth do aplicativo no portal. Os PDFs permanecem privados; nenhuma permissão foi alterada.')}
});
async function fetchPDF(doc){
 if(!doc?.file_id||!/^[A-Za-z0-9_-]{15,}$/.test(doc.file_id))
  throw Error('PDF sem ID válido no catálogo');
 const encoded=encodeURIComponent(doc.file_id);
 const hosts=[API,API_FALLBACK];
 let networkFailures=0;
 for(let i=0;i<hosts.length;i++){
  const uri=hosts[i]+encoded+'?alt=media&supportsAllDrives=true';
  let res;
  try{
   res=await fetch(uri,{
    method:'GET',mode:'cors',redirect:'follow',
    headers:{Authorization:'Bearer '+token},cache:'no-store'
   });
  }catch(e){
   // Erro de transporte: não veio resposta HTTP, portanto não é possível
   // diagnosticar permissão 403, validade do ID ou resposta CORS apenas pelo erro.
   networkFailures++;
   if(i===0)notify('O download pela rota principal falhou antes da resposta HTTP. Tentando a rota alternativa do Google Drive…');
   continue;
  }
  if(res.status===401){
   token=null;expires=0;
   throw Error('HTTP 401: sessão do Google expirada. Clique em Conectar Drive e autorize novamente.');
  }
  if(res.status===403)throw Error('HTTP 403: a conta Google autorizada não pode baixar este PDF ou há restrição de acesso.');
  if(res.status===404)throw Error('HTTP 404: arquivo não encontrado na conta Google autorizada.');
  if((res.status===429||res.status>=500)&&i===0){
   notify('Google Drive respondeu HTTP '+res.status+'. Tentando a rota alternativa…');continue;
  }
  if(!res.ok)throw Error('Download do Google Drive retornou HTTP '+res.status+'.');
  const blob=await res.blob();
  if(!blob.size)throw Error('Drive devolveu um arquivo vazio.');
  // Não confundir página de erro HTML (status 200) com bytes de PDF.
  const head=await blob.slice(0,1024).text();
  if(!head.includes('%PDF-')){
   throw Error('Google Drive retornou conteúdo que não começa como PDF. Abra o original no Drive para conferir o formato.');
  }
  return blob;
 }
 throw Error(networkFailures===hosts.length
  ? 'Falha de rede ao buscar o PDF nas duas rotas do Google Drive. Pode ser bloqueio de rede/CORS, extensão do navegador ou indisponibilidade do serviço. Use “Abrir cópia local do PDF” ou “Abrir no Drive”; seus grifos permanecem preservados.'
  : 'Google Drive indisponível nas duas rotas. Tente novamente ou use uma cópia local autorizada.');
}
async function openAndEdit(doc,options={}){
 if(doc?.id==='VADE-SENADO-2026-GUIA'&&!options.forceDrive){
  // Nunca abrir cópia obsoleta do Vade pela opção genérica Editar PDF.
  options={...options,forceDrive:true,expectedSha256:'2c836a11dcdae84e62e3e4cac8e449de760f82d9acd13278da50c5634f296a90'};
 }
 if(!doc||busy)return false;
 busy=true;showFallback(false);
 try{
  // Anotações + cópia autorizada já guardadas: um clique, sem login nem seleção.
  if(!options.forceDrive&&await window.BancoMestrePDFV038.openStored(doc)){waitingDoc=null;showConnect(false);notify('PDF-guia restaurado. Suas marcações antigas permanecem nas páginas originais.');return true}
  if(!client){
   if($('pdfChooseLocal'))$('pdfChooseLocal').textContent='✎ Editar aqui (Drive)';
   window.BancoMestrePDFV038.openPreview(doc);
   waitingDoc={doc,options};showConnect(true);
   notify('Espere carregar o Google e clique em “Conectar Drive e editar esta lei” nesta janela.');
   return;
  }
  if(!token||expires<=Date.now()){
   if($('pdfChooseLocal'))$('pdfChooseLocal').textContent='✎ Editar aqui (Drive)';
   window.BancoMestrePDFV038.openPreview(doc);
   waitingDoc={doc,options};showConnect(true);
   notify('Esta página precisa de autorização de leitura. Clique em “Conectar Drive e editar esta lei” nesta janela; após autorizar, a lei abrirá automaticamente.');
   return;
  }
  notify('Carregando o PDF original autorizado diretamente para o editor…');
  const blob=await fetchPDF(doc);
  if(options.forceDrive&&options.expectedSha256){
   if(!globalThis.crypto?.subtle)throw Error('Não é possível conferir o PDF do Drive sem HTTPS.');
   const digest=new Uint8Array(await crypto.subtle.digest('SHA-256',await blob.arrayBuffer()));
   const hash=Array.from(digest,b=>b.toString(16).padStart(2,'0')).join('');
   if(hash!==options.expectedSha256)
    throw Error('O arquivo do Google Drive não corresponde à versão anteriormente anotada. PDF não foi substituído e suas marcações locais estão preservadas.');
  }
  await window.BancoMestrePDFV038.openFromDrive(doc,blob);
  if($('pdfChooseLocal'))$('pdfChooseLocal').textContent='✎ Edição ativa';
  waitingDoc=null;showConnect(false);showFallback(false);
  notify('PDF do Google Drive aberto no editor. Grifos e vínculos CARD permanecem salvos neste navegador. Original preservado.');
  return true;
 }catch(e){
  if(!$('pdfDialog').open)window.BancoMestrePDFV038.openPreview(doc);
  showFallback(true);
  if(!token||expires<=Date.now())showConnect(true);
  notify('Não foi possível abrir a edição direta: '+e.message);
  return false;
 }finally{busy=false}
}
window.BancoMestreDriveV038={prepare,authorize,openAndEdit,get ready(){return !!client},get connected(){return !!token&&expires>Date.now()},get previouslyAuthorized(){return consentRemembered}};
window.BancoMestreDriveV042={prepare,authorize,openAndEdit,get ready(){return !!client},get connected(){return !!token&&expires>Date.now()},get previouslyAuthorized(){return consentRemembered}};
})();
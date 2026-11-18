/* V240: indicadores exibem somente consultas/verificações realmente concluídas.
   78, 1.540 e 179 são números de catálogos, NÃO de arquivos sincronizados. */
(function(){
'use strict';
if(window.BM240Status)return;
const $=id=>document.getElementById(id);
const statKeys=['pdf','cards','images'];
let lastText='', lastTitle='', states={};
function statusFor(key,value,kind,detail){
 const node=states[key];if(!node)return;
 const text=String(value);
 if(node.textContent!==text)node.textContent=text;
 node.parentElement.dataset.syncStatus=kind;
 node.title=detail;
 node.parentElement.dataset.bm240Verification=kind;
 node.parentElement.setAttribute('aria-label',node.parentElement.querySelector('b')?.textContent+
 ' — '+(node.parentElement.querySelector('span')?.textContent||'')+'. '+detail);
 // Não alterar o número da biblioteca; não confundir catálogo com arquivos consultados.
 node.parentElement.title=detail;
}
function fmt(n){return Number(n).toLocaleString('pt-BR')}
function attach(){
 const stats=document.querySelectorAll('body>header .head>.bm-v046-header-stats>.stat');
 if(stats.length<3)return;
 stats.forEach((stat,i)=>{
  if(i>2)return;
  const key=statKeys[i];
  let node=stat.querySelector('.bm240-sync-state');
  if(!node){node=document.createElement('small');node.className='bm240-sync-state';stat.append(node)}
  states[key]=node;
 });
}
function refresh(){
 if(!states.pdf){attach();if(!states.pdf)return}
 const core=window.BancoMestreMediaSyncV182;
 const connected=Boolean(core?.token?.());
 const global=window.BM239DriveGlobal;
 const running=$('bm239-drive-action')?.getAttribute('aria-busy')==='true';
 const pdf=window.BancoMestrePDFSyncV130?.lastResult;
 const pdfMessage=String($('bm-pdf-sync-status')?.textContent||'');
 const pdfFailed=/consulta do Drive incompleta|falha na sincronização|não foi possível consultar|não foi possível verificar/i.test(pdfMessage);
 const images=window.BancoMestreDriveImagesV182;
 if(pdfFailed){
  statusFor('pdf','Falha na consulta','error','PDFs: '+pdfMessage+'. Resultados anteriores não provam sucesso na atualização.');
 }else if(running&&connected)statusFor('pdf','⟳ consultando','syncing',
  'PDFs: consulta ao Google Drive em andamento; não existe confirmação desta varredura.');
 else if(pdf&&Number.isFinite(Number(pdf.found))&&Number(pdf.found)>=0){
  const n=fmt(pdf.found);
  const text=connected?'✓ '+n+' consultados':'Última: '+n;
  statusFor('pdf',text,connected?'verified':'pending',
   'PDFs: '+n+' arquivos localizados na última varredura concluída do Google Drive nesta visita.'+
   (pdf.folders!==undefined?' '+fmt(pdf.folders)+' pastas verificadas.':'')+
   (connected?' Conexão de leitura ativa.':' Conexão expirada ou ausente; resultado não é uma verificação atual.'));
 }else statusFor('pdf','Drive não verificado','pending',
  'PDFs: 78 registros no catálogo público, mas nenhuma varredura autorizada foi concluída nesta sessão.');
 statusFor('cards','Sem SRS no Drive','pending',
  'Cartões: 1.518 IDs públicos canônicos e 22 registros operacionais Ijuí disponíveis no portal. Não foi confirmada sincronização de alterações de cartões nem de eventos SRS com o Google Drive.');
 if(images?.lastError){
  statusFor('images','Falha na consulta','error',
   'Imagens: erro ao consultar o Drive: '+String(images.lastError)+
   (images.lastSuccess?' A consulta anterior desta visita não representa a atualização atual.':''));
 }else if(images?.lastSuccess){
  const n=Number(images.lastCount);
  if(Number.isSafeInteger(n)&&n>=0)
   statusFor('images',connected?'✓ '+fmt(n)+' originais':'Última: '+fmt(n),
     connected?'verified':'pending',
    'Atlas: '+fmt(n)+' imagens originais únicas localizadas no Drive na última consulta concluída em '+
    new Date(images.lastSuccess).toLocaleString('pt-BR')+
    '. Não somar aos 179 registros catalogados.'+
    (connected?' Autorização ainda ativa.':' A conexão não está ativa.'));
  else statusFor('images','Sem contagem válida','error',
    'Atlas: o provedor não informou uma contagem de originais válida.');
 }else if(running&&connected)statusFor('images','⟳ consultando','syncing',
  'Atlas: consulta de originais no Drive iniciada, ainda sem confirmação de conclusão.');
 else statusFor('images','Drive não verificado','pending',
  'Atlas: 179 registros catalogados. Nenhum original foi confirmado pelo Drive nesta sessão.');
 const ctl=window.BM239ControlDrive?.lastResult;
 const grifos=window.BancoMestreGrifosDriveSyncV104;
 const grifosText=String(grifos?.lastStatus||'');
 const grifosVerified=Number(grifos?.lastSync)>0&&/^Cores\/grifos confirmados no Drive:/.test(grifosText);
 const ctlOK=['uploaded','downloaded','unchanged'].includes(ctl?.state);
 const ctlConflict=ctl?.state==='conflict';
 const ctlError=ctl?.state==='error';
 const controlInfo=ctlOK?'Controle (última conferência): '+(ctl.state==='uploaded'?'gravado e relido':
   ctl.state==='downloaded'?'recebido e salvo localmente':'conferido sem diferenças'):
   ctlConflict?'Controle: conflito preservado':
   ctlError?'Controle: falha':ctl?.state==='empty'?'Controle: sem dados locais a enviar':
   'Controle: não conferido';
 const grifosInfo=grifosVerified?'Grifos: última verificação do mestre concluída':
   /^Não sincronizado com o mestre:/.test(grifosText)?'Grifos: falha':'Grifos: não conferidos';
 const goodPdf=Boolean(pdf&&connected&&!pdfFailed&&!running);
 const goodImages=Boolean(images?.lastSuccess&&connected&&!images?.lastError&&!running);
 const allGood=goodPdf&&goodImages&&ctlOK&&grifosVerified;
 const partial=Boolean(ctlConflict||ctlError||images?.lastError||(!allGood&&(goodPdf||goodImages||ctlOK||grifosVerified)));
 const button=$('bm239-drive-action');
 if(button){
  button.title='Ação única do Google Drive. Estado real: '+(goodPdf?'PDFs consultados':'PDFs não confirmados')+
   '; '+(goodImages?'imagens consultadas':'imagens não confirmadas')+
   '; '+controlInfo+'; '+grifosInfo+'. Base de cartões e SRS não sincronizados por este botão.';
 }
 const text=running?'Verificando os módulos…':
  !connected?'Drive desconectado · '+controlInfo+' · '+grifosInfo:
  allGood?'Consultas concluídas · Controle e grifos conferidos':
  partial?'Parcial · '+controlInfo+' · '+grifosInfo:
  'Drive conectado · ainda sem sincronização completa';
 const details=$('bm239-sync-details');
 if(details){
  // Preservar a mensagem de erro explícita da conexão se o OAuth falhar.
  const oldError=details.dataset.state==='error'&&
    /autorização|OAuth|indisponível|falha na conexão|não foi possível abrir/i.test(details.textContent||'');
  if(!oldError||connected){
   if(details.textContent!==text)details.textContent=text;
   details.dataset.state=running?'syncing':allGood?'ok':partial?'partial':'idle';
   details.title=[
    goodPdf?'PDFs: consulta concluída, '+fmt(pdf.found)+' arquivos':'PDFs: consulta não confirmada',
    goodImages?'Atlas: consulta concluída, '+fmt(images.lastCount)+' originais':'Atlas: consulta não confirmada',
    controlInfo,grifosInfo,
    'Cartões e SRS: não sincronizados por este botão'
   ].join(' | ');
  }
 }
}
function init(){
 attach();refresh();
 for(const event of ['bm-media-drive-authorized','bm209-drive-render','bm239-sync-finished'])
  document.addEventListener(event,refresh);
 window.addEventListener('focus',refresh);
 document.addEventListener('visibilitychange',()=>{if(!document.hidden)refresh()});
 setInterval(()=>{if(!document.hidden)refresh()},3500);
}
window.BM240Status=Object.freeze({refresh,get snapshot(){return{
 pdf:states.pdf?.textContent||null,cards:states.cards?.textContent||null,
 images:states.images?.textContent||null,
 drive:document.getElementById('bm239-sync-details')?.textContent||null
 }}});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
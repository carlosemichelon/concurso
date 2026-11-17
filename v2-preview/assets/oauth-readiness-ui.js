import {assessOAuthReadiness,manualOAuthChecklist} from './oauth-readiness.js';

/* Diagnóstico de OAuth e teste pontual de acesso à biblioteca PDF V149.
 * Não lê token, não lista contas, não grava em armazenamento e não envia ao GitHub.
 */
const el=(tag,cls='',label)=>{
 const x=document.createElement(tag);if(cls)x.className=cls;
 if(label!==undefined)x.textContent=String(label);
 return x;
};
const stateSummary=value=>{
 if(value==='verified')return 'Acesso confirmado: um PDF da biblioteca respondeu com ID e formato corretos.';
 if(value==='denied')return 'Acesso ao PDF de amostra não confirmado (HTTP 403/404). A existência do arquivo não foi negada.';
 if(value==='unexpected')return 'O arquivo de amostra respondeu com identidade ou formato divergente.';
 if(value==='error')return 'O teste do PDF não foi concluído; verifique a mensagem e tente novamente.';
 return 'Acesso a um PDF real ainda não testado nesta sessão.';
};
function safeText(error){
 const message=String(error?.message||'Falha na consulta');
 if(/HTTP\s*(403|404)/i.test(message))return 'HTTP 403/404: conta sem acesso confirmado ou referência indisponível.';
 if(/HTTP\s*429/i.test(message))return 'HTTP 429: limite temporário de consultas do Google Drive.';
 if(/HTTP\s*401/i.test(message))return 'HTTP 401: sessão expirada; reconecte.';
 return 'Consulta não concluída. Verifique conectividade e permissões e tente novamente.';
}
export function mountOAuthDiagnostics(service,sampleDocument,target){
 if(!service||!target)throw Error('Painel OAuth exige serviço e elemento de destino');
 const fileId=String(sampleDocument?.file_id||'');
 let sampleStatus='untested',sampleMessage='',busy=false,probeSerial=0,authMessage='';
 const section=el('section','panel oauth-readiness');
 section.id='v2OAuthReadiness';
 section.setAttribute('aria-labelledby','v2OAuthTitle');
 const title=el('h3','','Homologação Google — origem e permissões');
 title.id='v2OAuthTitle';
 const description=el('p','helper',
  'O Client ID é público, mas a configuração no Google Cloud só é comprovada pelo login real. '+
  'Este painel não salva credenciais nem faz testes automáticos de acesso.');
 const summary=el('p','helper','Aguardando verificação de configurações.');
 summary.id='v2OAuthSummary';summary.setAttribute('role','status');
 const rows=el('div','checks');rows.id='v2OAuthChecks';
 const controls=el('div','v2-oauth-controls');
 const test=el('button','','Testar acesso a 1 PDF');
 test.id='v2OAuthTestPdf';test.type='button';test.disabled=true;
 const copy=el('button','','Copiar roteiro de homologação');
 copy.id='v2OAuthCopy';copy.type='button';
 const outcome=el('p','helper',stateSummary(sampleStatus));
 outcome.id='v2OAuthSampleResult';outcome.setAttribute('role','status');
 controls.append(test,copy);
 const cloud=el('p','helper',
  'O Google Cloud pode exigir adicionar a origem JavaScript exata e autorizar usuários de teste. '+
  'Este diagnóstico não altera as configurações do Cloud nem publica a V2.');
 const consoleLink=el('a','','Ver credenciais do Google Cloud');
 consoleLink.href='https://console.cloud.google.com/apis/credentials';
 consoleLink.target='_blank';consoleLink.rel='noopener noreferrer';
 cloud.append(' ',consoleLink);
 section.append(title,description,summary,rows,controls,outcome,cloud);
 target.append(section);

 function assessment(){
  return assessOAuthReadiness(service.authConfig,{
   origin:location.origin,secureContext:globalThis.isSecureContext,
   identityApi:Boolean(globalThis.google?.accounts?.oauth2?.initTokenClient),
   connected:service.connected
  });
 }
 function render(){
  const r=assessment();
  rows.replaceChildren();
  const items=[
   ['Origem atual',r.currentOrigin||'indisponível'],
   ['Origem nominal do projeto',r.declaredOrigin||'não informada'],
   ['Client ID público',r.clientValid?'Formato válido · autorização Cloud não verificada':'Inválido ou ausente'],
   ['Escopo Drive',r.scopeValid?'Somente leitura (drive.readonly)':'Pendente ou incorreto'],
   ['HTTPS / contexto seguro',r.secure?'Verificado':'Pendente'],
   ['Biblioteca Google Identity Services',r.identityApi?'Carregada':'Não disponível'],
   ['Sessão da conta',r.connected?'Autorizada neste navegador':'Não conectada'],
   ['Acesso real a documento',stateSummary(sampleStatus)]
  ];
  for(const [key,value] of items){
   const item=el('div','check');
   item.append(el('strong','',key),el('span','',value));rows.append(item);
  }
  const notes=r.notes;
  summary.textContent=authMessage||
   (r.connected?'Sessão OAuth ativa; teste um PDF para confirmar o acesso aos arquivos.':
    r.appReady?'Configuração local consistente. Clique em Conectar para verificar a autorização real.':
    'Pré-requisitos precisam de conferência. A origem registrada no código não comprova aprovação no Google Cloud.');
  if(notes.length)summary.textContent+=' '+notes.join(' ');
  test.disabled=!r.connected||busy||!fileId;
  outcome.textContent=(sampleMessage?sampleMessage+' ':'')+stateSummary(sampleStatus);
 }
 function clearState(eventType){
  probeSerial++;busy=false;sampleStatus='untested';sampleMessage='';
  if(eventType==='expired')authMessage='Sessão Google expirada. Reconecte para repetir as verificações.';
  else if(eventType==='disconnected')authMessage='Sessão encerrada e resultado da prova de acesso descartado.';
  else if(eventType==='connected')authMessage='Login Google recebido. Para homologar o acesso, teste um PDF desta conta.';
  render();
 }
 test.addEventListener('click',async()=>{
  if(busy||!service.connected||!fileId)return;
  busy=true;sampleStatus='untested';sampleMessage='Consultando os metadados de um único PDF...';
  const serial=++probeSerial,epoch=service.sessionEpoch;
  render();
  try{
   const item=await service.probePdfFileMetadata(fileId);
   if(serial!==probeSerial||epoch!==service.sessionEpoch||!service.connected)return;
   sampleStatus=item?.id===fileId&&item?.mimeType==='application/pdf'&&!item.trashed?
     'verified':'unexpected';
   sampleMessage='';
  }catch(error){
   if(serial!==probeSerial||epoch!==service.sessionEpoch||!service.connected)return;
   sampleStatus=/HTTP\s*(403|404)/i.test(String(error?.message||''))?'denied':'error';
   sampleMessage=safeText(error);
  }finally{
   if(serial===probeSerial){busy=false;render()}
  }
 });
 copy.addEventListener('click',async()=>{
  const value=manualOAuthChecklist(assessment());
  try{
   await navigator.clipboard.writeText(value);
   authMessage='Roteiro copiado para a área de transferência.';
  }catch{
   // Sem permissão para clipboard, usar seleção manual: nada é salvo em disco.
   const text=el('textarea');text.value=value;text.readOnly=true;
   text.style.cssText='width:100%;min-height:120px';
   section.append(text);text.focus();text.select();
   authMessage='A cópia automática não foi autorizada. Selecione e copie o roteiro exibido.';
  }
  render();
 });
 service.onChange(event=>{
  if(['connected','expired','disconnected'].includes(event.type))clearState(event.type);
  else if(event.type==='auth-error'){
   authMessage=String(event.message||'Login Google não concluído.').slice(0,240);
   render();
  }else if(['ready','config-ready','prepare-error'].includes(event.type)){
   if(event.type==='prepare-error')authMessage='Falha ao preparar o Google Identity Services. Veja a mensagem da barra Drive.';
   render();
  }
 });
 render();
 return Object.freeze({render});
}

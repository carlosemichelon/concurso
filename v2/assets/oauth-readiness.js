/* Diagnóstico local de preparo OAuth da V2 — nunca inspeciona nem grava token. */
const ID=/^[0-9A-Za-z_-]+\.apps\.googleusercontent\.com$/;
export const EXPECTED_SCOPE='https://www.googleapis.com/auth/drive.readonly';
const validOrigin=input=>{
 try{const url=new URL(input);return url.origin===input&&url.protocol==='https:'?url.origin:''}
 catch{return ''}
};
export function assessOAuthReadiness(config,{origin='',secureContext=false,identityApi=false,connected=false}={}){
 const clientValid=ID.test(String(config?.client_id||''));
 const scopeValid=config?.scope===EXPECTED_SCOPE;
 const declared=validOrigin(config?.authorized_javascript_origin);
 const actual=String(origin||'');
 const isLoopback=/^http:\/\/(?:localhost|127\.0\.0\.1)(?::\d+)?$/.test(actual);
 const originMatches=Boolean(declared&&actual===declared);
 const secure=Boolean(secureContext);
 const notes=[];
 if(!clientValid)notes.push('Client ID público ausente ou inválido.');
 if(!scopeValid)notes.push('Escopo Drive não corresponde a drive.readonly.');
 if(!declared)notes.push('Origem nominal no arquivo de configuração está ausente ou inválida.');
 if(!secure)notes.push('A página não está em contexto seguro HTTPS/localhost.');
 if(!originMatches)notes.push(isLoopback?
   'Esta prévia usa localhost. Para autenticação real, a origem local também precisa estar autorizada no Google Cloud.':
   'A origem atual difere da origem nominal do projeto; confirme a lista de origens autorizadas no Google Cloud.');
 if(!identityApi)notes.push('Biblioteca Google Identity Services ainda não foi carregada.');
 const appReady=clientValid&&scopeValid&&Boolean(declared)&&secure&&originMatches&&identityApi;
 return Object.freeze({
  clientValid,scopeValid,secure,declaredOrigin:declared,currentOrigin:actual,
  originMatches,isLoopback,identityApi:Boolean(identityApi),connected:Boolean(connected),
  appReady,googleCloudOriginVerified:false,
  assessment:connected?'sessao_autorizada':appReady?'apta_a_teste_manual':'verificar_configuracao',
  notes:Object.freeze(notes),
  caveat:'A origem configurada no repositório não comprova que ela foi autorizada no Google Cloud. Apenas um login real, seguido de files.get, valida a sessão.'
 });
}
export function friendlyOauthError(event){
 const code=String(event?.type||event?.error||'').toLowerCase().slice(0,90);
 if(code==='popup_failed_to_open')return 'O navegador bloqueou a janela Google. Permita pop-ups e tente novamente.';
 if(code==='popup_closed')return 'A janela do Google foi fechada antes da autorização. Nenhum acesso foi concedido.';
 if(code==='access_denied')return 'A autorização de leitura foi recusada. Conecte novamente se desejar.';
 if(code==='origin_mismatch'||code==='redirect_uri_mismatch')
  return 'Origem do site não autorizada no Google Cloud. Confira o endereço exato e as origens JavaScript do Client ID.';
 if(code==='invalid_client'||code==='unauthorized_client')
  return 'Client ID não autorizado para este domínio. Revise o tipo de aplicativo e a configuração no Google Cloud.';
 if(code==='interaction_required')return 'O Google exige nova interação. Clique em Conectar novamente.';
 return 'A autorização Google não foi concluída. Confira a origem, as permissões e o bloqueio de janelas.';
}
export function manualOAuthChecklist(report){
 const origin=report?.currentOrigin||'(origem indisponível)';
 const clientState=report?.clientValid?'Client ID: formato válido (não prova aprovação)':'Client ID: revisar';
 return [
  'HOMOLOGAÇÃO GOOGLE DRIVE — BANCO MESTRE V2',
  'Origem aberta no navegador: '+origin,
  clientState,
  'Escopo necessário: '+EXPECTED_SCOPE,
  'No Google Cloud Console, confira OAuth Client ID do tipo Aplicativo da Web.',
  'Confirme se esta ORIGEM EXATA consta em Origens JavaScript autorizadas.',
  'Verifique a tela de consentimento e usuários de teste quando o app ainda estiver em modo Testing.',
  'Clique em Conectar na V2 e autorize somente leitura.',
  'Use o botão Testar acesso a 1 PDF para comprovar files.get da conta autorizada.',
  'Depois use Conferir 78 IDs no Drive e confira os quatro resultados do relatório.',
  'Saia da conta pelo botão Sair e confirme que dados privados e prévias desapareceram.',
  'Sem sucesso no login real, não declare OAuth homologado nem publique a V2.',
  'Nenhum token, segredo, ID de arquivo privado ou resultado pessoal acompanha esta lista.'
 ].join('\n');
}

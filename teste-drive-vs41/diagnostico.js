import {runDriveSmoke} from './drive-smoke.js';
const button=document.getElementById('run'),status=document.getElementById('status'),results=document.getElementById('results');
const scope='https://www.googleapis.com/auth/drive.file';
let client=null,busy=false;
function message(value){status.textContent=value}
function finish(value){busy=false;button.disabled=false;message(value)}
function display(r){
 results.replaceChildren();results.hidden=false;
 for(const [label,value] of [['Perfis validados',r.profiles],['Cartões por perfil',r.cardCounts.join(', ')||'Não confirmado'],['Acesso cruzado bloqueado pelo adaptador',r.crossAccessDenied?'Sim':'Não confirmado'],['Arquivos temporários criados',r.temporaryCreated],['Arquivos enviados à lixeira',r.temporaryTrashed],['Limpeza pendente',r.cleanupPending],...(r.ok?[]:[['Etapa da falha',r.stage||'limpeza'],['Código de diagnóstico',r.reason||'cleanup-pending']])]){const li=document.createElement('li');li.textContent=label+': '+value;results.append(li)}
}
async function authorized(response){
 if(!busy)return;
 if(response?.error||typeof response?.access_token!=='string'||!response.access_token||!google.accounts.oauth2.hasGrantedAllScopes(response,scope)){finish('Autorização não concedida. Nenhum arquivo foi criado.');return}
 let token=response.access_token;
 response=null;
 const runId=crypto.randomUUID().replaceAll('-','');
 message('Testando a conexão real e dois catálogos fictícios…');
 try{const r=await runDriveSmoke({getToken:async()=>({token}),runId});display(r);finish(r.ok?'Teste real aprovado. Nenhum cartão existente foi alterado.':'Teste incompleto. Consulte o código de diagnóstico abaixo.'+(r.cleanupPending?' Arquivos não limpos: BM teste '+runId:' Limpeza confirmada.'));}
 catch{finish('Teste interrompido. Consulte somente os arquivos com o prefixo BM teste '+runId+' no Drive.');}
 finally{token=''}
}
try{
 const cfg=await fetch('../assets/drive_auth_v038.json',{cache:'no-store'}).then(r=>{if(!r.ok)throw Error();return r.json()});
 if(!/^[A-Za-z0-9_-]+\.apps\.googleusercontent\.com$/.test(cfg.client_id)||location.origin!==cfg.authorized_javascript_origin)throw Error();
 for(let i=0;i<100&&!globalThis.google?.accounts?.oauth2?.initTokenClient;i++)await new Promise(r=>setTimeout(r,100));
 if(!globalThis.google?.accounts?.oauth2?.initTokenClient)throw Error();
 client=google.accounts.oauth2.initTokenClient({client_id:cfg.client_id,scope,include_granted_scopes:false,callback:authorized,error_callback:()=>finish('Autorização cancelada ou indisponível. Nenhum arquivo foi criado.')});
 button.disabled=false;message('Clique para autorizar o aplicativo Google existente e executar o teste.');
 button.onclick=()=>{if(busy)return;busy=true;button.disabled=true;results.hidden=true;results.replaceChildren();message('Aguardando autorização do Google…');try{client.requestAccessToken({prompt:'select_account'})}catch{finish('Não foi possível abrir a autorização Google.')}};
}catch{message('Configuração OAuth indisponível nesta origem. Abra a página no domínio autorizado do Banco Mestre.');}

/* V295 — Mover imagens autenticadas para a lixeira do Google Drive.
 * Fluxo reversível e individual. Escopo de gerenciamento solicitado somente
 * após confirmação do titular. Tokens mantidos somente na memória.
 * Sem DELETE permanente, sem mexer em IDs/links de cartões, SRS ou GitHub.
 */
(function(){
'use strict';
if(window.BM295DriveImageTrash)return;
const ROOTS=new Set([
 '1ksSVWrmRaRlDoG4iDtTGvfr2OnPnhnY6',
 '1pp1CL9oMYVFHPPzv117DZpy1kA-wyJQo'
]);
const API='https://www.googleapis.com/drive/v3/files';
const SCOPE='https://www.googleapis.com/auth/drive';
const ALLOWED=new Set(['image/jpeg','image/png','image/webp','image/gif','image/svg+xml']);
const FILE_ID=/^[A-Za-z0-9_-]{15,}$/;
let client=null,token='',expiresAt=0,preparing=null,pending=null,busy=false;
function setStatus(x,message,error=false){
 if(!x)return;x.textContent=message;x.dataset.error=String(!!error);
 x.setAttribute('role','status');
}
function make(tag,className,text){
 const x=document.createElement(tag);
 if(className)x.className=className;
 if(text!==undefined)x.textContent=text;
 return x;
}
function connected(){return !!token&&Date.now()<expiresAt;}
async function gis(){
 if(window.google?.accounts?.oauth2?.initTokenClient)return;
 await new Promise((resolve,reject)=>{
  let n=0;
  const wait=()=>{
   if(window.google?.accounts?.oauth2?.initTokenClient){resolve();return}
   if(++n>70){reject(Error('Autorização Google indisponível'));return}
   setTimeout(wait,150);
  };
  wait();
 });
}
function prepare(){
 if(client)return Promise.resolve(true);
 if(preparing)return preparing;
 preparing=(async()=>{
  const r=await fetch('assets/drive_auth_v038.json',{cache:'no-store'});
  if(!r.ok)throw Error('Configuração de autorização indisponível');
  const c=await r.json();
  if(!/^[A-Za-z0-9_.-]+\.apps\.googleusercontent\.com$/.test(c.client_id||''))
   throw Error('Identificador OAuth inválido');
  if(c.authorized_javascript_origin&&c.authorized_javascript_origin!==location.origin)
   throw Error('Origem não autorizada para operação no Drive');
  await gis();
  client=google.accounts.oauth2.initTokenClient({
   client_id:c.client_id,
   scope:SCOPE,
   include_granted_scopes:false,
   callback:reply=>{
    if(!pending)return;
    if(reply?.error||!reply?.access_token){
     finishError('Permissão de exclusão não concedida; nenhum arquivo foi alterado.');
     return;
    }
    if(!String(reply.scope||'').split(/\s+/).includes(SCOPE)){
     finishError('A permissão de gerenciamento do Drive não foi concedida. Nenhum arquivo foi alterado.');
     return;
    }
    token=reply.access_token;
    expiresAt=Date.now()+Math.max(30,Number(reply.expires_in||3600)-90)*1000;
    void execute(pending);
   },
   error_callback:e=>{
    if(pending)finishError('Falha ao autorizar o Drive: '+String(e?.type||e?.message||'indisponível'));
   }
  });
  return true;
 })().catch(e=>{preparing=null;throw e});
 return preparing;
}
function finishError(message){
 const p=pending;
 if(p){p.button.disabled=false;setStatus(p.status,message,true)}
 pending=null;busy=false;
}
async function request(url,init={}){
 if(!connected())throw Error('Permissão de exclusão expirada; autorize novamente.');
 const r=await fetch(url,{
  ...init,
  headers:{Authorization:'Bearer '+token,...(init.headers||{})},
  cache:'no-store'
 });
 if(r.status===401)throw Error('Sessão de exclusão expirada; reconecte.');
 if(r.status===403)throw Error('Sem permissão para mover esta imagem; abra o arquivo no Drive.');
 if(!r.ok)throw Error('Google Drive retornou HTTP '+r.status);
 return r;
}
function endpoint(id,fields){
 if(!FILE_ID.test(id))throw Error('ID de imagem inválido');
 const params=new URLSearchParams({fields,supportsAllDrives:'true'});
 return API+'/'+encodeURIComponent(id)+'?'+params;
}
async function withinAtlas(start){
 const queue=[...(start||[])],visited=new Set();let steps=0;
 while(queue.length){
  const id=queue.shift();
  if(ROOTS.has(id))return true;
  if(!FILE_ID.test(id)||visited.has(id))continue;
  visited.add(id);
  if(++steps>35)throw Error('Hierarquia de pastas extensa; operação cancelada.');
  const r=await request(endpoint(id,'id,name,mimeType,parents,trashed'));
  const folder=await r.json();
  if(folder.trashed||folder.mimeType!=='application/vnd.google-apps.folder')continue;
  for(const parent of folder.parents||[])if(!visited.has(parent))queue.push(parent);
 }
 return false;
}
async function execute(ctx){
 const {file,button,status,refresh}=ctx;
 try{
  setStatus(status,'Validando original e permissões no Google Drive…');
  const r=await request(endpoint(file.id,'id,name,mimeType,modifiedTime,parents,trashed,capabilities(canTrash)'));
  const meta=await r.json();
  if(meta.id!==file.id||!ALLOWED.has(meta.mimeType)||meta.trashed)
   throw Error('Arquivo não corresponde a uma imagem ativa do catálogo.');
  if(meta.name!==file.name||(file.modifiedTime&&meta.modifiedTime!==file.modifiedTime))
   throw Error('Imagem modificada desde a consulta. Atualize o catálogo e tente novamente.');
  if(!(await withinAtlas(meta.parents)))
   throw Error('O arquivo não está mais nas pastas autorizadas do Atlas. Nenhuma alteração realizada.');
  if(meta.capabilities?.canTrash!==true)
   throw Error('A conta conectada não tem permissão para mover este arquivo para a lixeira.');
  const patched=await request(endpoint(file.id,'id,name,trashed'),{
   method:'PATCH',
   headers:{'Content-Type':'application/json'},
   body:JSON.stringify({trashed:true})
  });
  const result=await patched.json();
  if(result.id!==file.id||result.trashed!==true)
   throw Error('O Google Drive não confirmou a movimentação para a lixeira.');
  button.textContent='Na lixeira';
  setStatus(status,'Imagem movida para a lixeira do Drive. É possível restaurá-la no Google Drive.');
  pending=null;busy=false;
  try{await refresh?.()}catch(_){
   setStatus(status,'Imagem na lixeira. A atualização da lista não pôde ser confirmada; use Atualizar imagens.');
  }
 }catch(e){
  finishError('Imagem preservada. '+e.message);
 }
}
function onClick(file,button,status,refresh,linked){
 if(busy)return;
 if(!FILE_ID.test(file?.id)||!ALLOWED.has(file?.mimeType)){
  setStatus(status,'O original não é uma imagem válida do Atlas.',true);return;
 }
 const n=Array.isArray(linked)?linked.length:0;
 const question='Mover para a LIXEIRA do Google Drive a imagem "'+
  String(file.name||'').slice(0,190)+'"?\n\n'+
  'A imagem poderá ser restaurada no Drive. O site não apagará seus cartões, IDs ou grifos.\n'+
  'Será solicitada permissão de gerenciamento do Drive somente para esta ação.';
 if(!window.confirm(question))return;
 if(n&& !window.confirm(
  'ATENÇÃO: esta imagem tem '+n+' cartão(ões) relacionado(s). '+
  'Os vínculos NÃO serão apagados automaticamente e poderão apontar para um arquivo na lixeira.\n\nConfirmar a movimentação?'
 ))return;
 busy=true;button.disabled=true;pending={file,button,status,refresh};
 if(connected()){void execute(pending);return;}
 if(!client){
  finishError('Autorização Google ainda não está pronta. Tente novamente após a conexão do site.');
  void prepare().catch(e=>setStatus(status,e.message,true));
  return;
 }
 setStatus(status,'Aguardando autorização específica de gerenciamento do Drive…');
 try{
  // Iniciado diretamente pelo clique após confirmação explícita.
  client.requestAccessToken({prompt:'consent'});
 }catch(e){finishError('Não foi possível abrir a autorização do Google: '+e.message)}
}
function decorate(card,actions,file,options={}){
 if(!card||!actions||!file||!FILE_ID.test(file.id)||card.querySelector('.bm295-trash-button'))return;
 const button=make('button','bm295-trash-button','Mover para lixeira');
 button.type='button';
 button.title='Mover apenas este original para a lixeira do Google Drive (ação reversível)';
 const status=make('div','bm295-trash-status','');
 actions.append(button);
 card.append(status);
 button.addEventListener('click',()=>onClick(file,button,status,options.refresh,options.linked));
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{
 void prepare().catch(()=>{/* A galeria permanece somente leitura se OAuth não estiver pronto. */});
},{once:true});
else void prepare().catch(()=>{});
window.BM295DriveImageTrash=Object.freeze({decorate,get ready(){return !!client}});
})();

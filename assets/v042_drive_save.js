/* Banco Mestre V042 — salvar cópia anotada no Google Drive (OAuth drive.file).
   O original NUNCA é destino de escrita. Uma cópia criada por este app pode ser atualizada
   somente depois de verificar ID e appProperties; tokens ficam apenas em memória. */
(function(){
'use strict';
const SCOPE='https://www.googleapis.com/auth/drive.file';
const API='https://www.googleapis.com/drive/v3/files';
const UPLOAD='https://www.googleapis.com/upload/drive/v3/files';
const STORE_PREFIX='BM042_DRIVE_COPIA_ANOTADA:';
const $=id=>document.getElementById(id);
const toolbar=$('pdfLocalTools')?.querySelector('.pdfGroup:last-of-type');
if(!toolbar||$('pdfSaveDriveV042'))return;
const button=document.createElement('button');
button.id='pdfSaveDriveV042';button.type='button';button.disabled=true;
button.textContent='☁ Salvar cópia no Drive';
button.title='Criar ou atualizar uma cópia anotada no seu Google Drive — nunca modifica o PDF original.';
const box=document.createElement('div');box.className='bm-drive-save-status';
const label=document.createElement('small');label.id='driveSaveStatusV042';label.setAttribute('role','status');label.setAttribute('aria-live','polite');
label.textContent='Preparando autorização de gravação (somente na cópia)...';
const link=document.createElement('a');link.id='driveSaveLinkV042';link.target='_blank';link.rel='noopener noreferrer';link.hidden=true;
link.textContent='Abrir cópia anotada no Google Drive';
box.append(label,link);
toolbar.append(button);$('pdfLocalTools').append(box);
const say=s=>{label.textContent=s};
const keyFor=doc=>STORE_PREFIX+doc.id+':'+doc.hash;
let client=null,writeToken='',expires=0,authPending=null,preparing=null,busy=false,everAuthorized=false;
const validId=id=>typeof id==='string'&&/^[A-Za-z0-9_-]{10,}$/.test(id);
async function prepare(){
 if(preparing)return preparing;
 preparing=(async()=>{
  const cfg=await fetch('assets/drive_auth_v038.json',{cache:'no-store'}).then(r=>{
   if(!r.ok)throw Error('Configuração OAuth indisponível');return r.json();
  });
  if(!cfg.client_id||!/^[A-Za-z0-9_-]+\.apps\.googleusercontent\.com$/.test(cfg.client_id))
   throw Error('Client ID OAuth não configurado.');
  if(!window.google?.accounts?.oauth2?.initTokenClient)throw Error('Google Identity Services ainda não foi carregado. Recarregue a página.');
  client=google.accounts.oauth2.initTokenClient({
   client_id:cfg.client_id,
   scope:SCOPE,
   callback:response=>{
    const current=authPending;authPending=null;
    if(!response?.access_token||response.error){
     if(current)current.reject(Error('Autorização de gravação não concedida ('+(response?.error||'sem token')+').'));
     return;
    }
    if(response.scope&& !response.scope.split(/\s+/).includes(SCOPE)){
     if(current)current.reject(Error('O Google não concedeu a permissão drive.file.'));
     return;
    }
    writeToken=response.access_token;
    expires=Date.now()+Math.max(1,Number(response.expires_in||3600)-90)*1000;
    everAuthorized=true;
    if(current)current.resolve(writeToken);
   },
   error_callback:response=>{
    const current=authPending;authPending=null;
    if(current)current.reject(Error('Autorização Google cancelada ou bloqueada ('+(response?.type||'desconhecida')+').'));
   }
  });
  button.disabled=false;
  say('Pronto. Clique em Salvar cópia no Drive para autorizar a gravação apenas quando necessário.');
  return true;
 })().catch(err=>{button.disabled=true;say('Gravação indisponível: '+err.message);return false});
 return preparing;
}
function requestToken(){
 if(writeToken&&expires>Date.now())return Promise.resolve(writeToken);
 if(!client)throw Error('Permissão de gravação ainda não está pronta.');
 if(authPending)throw Error('Há uma autorização Google em andamento.');
 // OAuth é solicitado no clique, antes de qualquer operação demorada de exportação.
 return new Promise((resolve,reject)=>{
  authPending={resolve,reject};
  try{client.requestAccessToken({prompt:everAuthorized?'':'consent'})}
  catch(e){authPending=null;reject(Error('Não foi possível abrir autorização Google: '+e.message))}
 });
}
function safeMessage(response,msg){
 if(response.status===401)return Error('Sessão Google expirada. Tente salvar novamente e autorize a conta.');
 if(response.status===403)return Error('Sua conta não autorizou criação/edição de arquivos (drive.file), ou não possui espaço/permissão.');
 if(response.status===404)return Error('Cópia anotada não encontrada no Google Drive.');
 return Error(msg+' (HTTP '+response.status+').');
}
async function metadata(fileId,token){
 if(!validId(fileId))throw Error('ID da cópia anotada inválido.');
 const url=API+'/'+encodeURIComponent(fileId)+'?fields=id,name,mimeType,appProperties,webViewLink,trashed';
 const response=await fetch(url,{headers:{Authorization:'Bearer '+token},cache:'no-store'});
 if(!response.ok)throw safeMessage(response,'Não foi possível verificar o destino');
 const data=await response.json();
 if(data.id!==fileId)throw Error('A API retornou outro identificador de arquivo.');
 return data;
}
function mapping(doc){
 try{
  const item=JSON.parse(localStorage.getItem(keyFor(doc))||'null');
  if(item&&validId(item.id)&&item.source_id===doc.id&&item.source_hash===doc.hash)return item;
 }catch{}
 return null;
}
function saveMapping(doc,result){
 try{
  localStorage.setItem(keyFor(doc),JSON.stringify({
   id:result.id,name:result.name,source_id:doc.id,source_hash:doc.hash,
   updated_at:new Date().toISOString()
  }));
 }catch{say('Cópia criada no Drive; mapeamento local não pôde ser salvo. Guarde o link.')}
}
async function checkOwnedCopy(item,doc,token){
 if(item.id===doc.file_id)throw Error('Proteção acionada: ID da cópia coincide com o PDF original.');
 const remote=await metadata(item.id,token);
 if(remote.trashed||remote.mimeType!=='application/pdf')throw Error('Destino não é uma cópia PDF válida.');
 const p=remote.appProperties||{};
 if(p.bm_format!=='BancoMestreV042'||p.bm_source_id!==doc.id||p.bm_source_hash!==doc.hash)
  throw Error('A cópia remota não pertence a este documento. Nada foi alterado.');
 return remote;
}
function legalName(name){
 const safe=String(name||'PDF').replace(/[\\/:*?"<>|\x00-\x1f]/g,'_').slice(0,180);
 return safe.replace(/\.pdf$/i,'')+'_BANCO_MESTRE_ANOTADO.pdf';
}
function validateSession(url){
 const u=new URL(url);
 if(u.origin!=='https://www.googleapis.com'||!u.pathname.startsWith('/upload/drive/v3/files'))
  throw Error('Sessão de upload rejeitada: endereço não autorizado.');
 return u.href;
}
async function resumable({blob,token,existing,doc,name}){
 if(blob.type!=='application/pdf'||blob.size<100||blob.size>180000000)
  throw Error('Arquivo anotado inválido ou maior que 180 MB.');
 if(existing?.id&&existing.id===doc.file_id)throw Error('Não é permitido modificar o arquivo original.');
 const initUrl=existing?.id
  ?UPLOAD+'/'+encodeURIComponent(existing.id)+'?uploadType=resumable&fields=id,name,mimeType,webViewLink,appProperties'
  :UPLOAD+'?uploadType=resumable&fields=id,name,mimeType,webViewLink,appProperties';
 const props={bm_format:'BancoMestreV042',bm_source_id:doc.id,bm_source_hash:doc.hash};
 if(doc.file_id)props.bm_source_drive_id=doc.file_id;
 const meta=existing?.id?{}:{
  name, mimeType:'application/pdf',
  description:'Cópia PDF anotada no Banco Mestre. Arquivo original preservado.',
  appProperties:props
 };
 const initial=await fetch(initUrl,{
  method:existing?.id?'PATCH':'POST',
  headers:{Authorization:'Bearer '+token,'Content-Type':'application/json; charset=UTF-8',
   'X-Upload-Content-Type':'application/pdf','X-Upload-Content-Length':String(blob.size)},
  body:JSON.stringify(meta),cache:'no-store'
 });
 if(!initial.ok)throw safeMessage(initial,'Não foi possível iniciar o envio ao Drive');
 const location=initial.headers.get('Location');
 if(!location)throw Error('Drive não informou a sessão de upload; não é seguro repetir automaticamente.');
 const destination=validateSession(location);
 const uploaded=await fetch(destination,{
  method:'PUT',headers:{Authorization:'Bearer '+token,'Content-Type':'application/pdf'},
  body:blob,cache:'no-store'
 });
 if(!uploaded.ok)throw safeMessage(uploaded,'O envio não foi confirmado pelo Drive');
 const saved=await uploaded.json();
 if(!validId(saved.id)||saved.id===(doc.file_id||null))
  throw Error('O Drive não retornou um ID de cópia válido. Verifique seu Drive antes de reenviar.');
 if(existing?.id&&saved.id!==existing.id)throw Error('O Drive respondeu com ID diferente da cópia. Verifique seu Drive.');
 return saved;
}
async function save(){
 if(busy)return;
 const editor=window.BancoMestrePDFV042;
 if(!editor?.editing){say('Abra uma lei no editor antes de salvar a cópia no Drive.');return}
 busy=true;button.disabled=true;link.hidden=true;
 try{
  const token=await requestToken();
  say('Preparando todas as páginas marcadas do PDF...');
  const prepared=await editor.buildAnnotated();
  const doc=prepared.doc;
  if(prepared.pagesMarked===0)throw Error('Nenhuma página anotada. Faça pelo menos um grifo ou nota antes de salvar.');
  if(!doc?.id||!doc.hash)throw Error('Origem PDF não identificada.');
  const existing=mapping(doc);
  if(existing) {
   say('Conferindo a cópia existente antes de atualizar. O original não será modificado...');
   await checkOwnedCopy(existing,doc,token);
  }else{
   say('Criando nova cópia anotada no Meu Drive (arquivo original preservado)...');
  }
  const result=await resumable({
   blob:prepared.blob,token,existing,doc,name:existing?.name||legalName(prepared.name)
  });
  saveMapping(doc,result);
  const url='https://drive.google.com/file/d/'+encodeURIComponent(result.id)+'/view';
  link.href=url;link.hidden=false;
  say((existing?'Cópia atualizada':'Nova cópia criada')+' no Google Drive: '+(result.name||legalName(prepared.name))+
      ' · '+prepared.pagesMarked+' página(s) marcada(s). PDF original preservado.');
 }catch(e){say('Não foi possível confirmar o salvamento no Drive: '+e.message+
   ' O PDF original e as marcações locais permanecem intactos.');}
 finally{busy=false;button.disabled=false}
}
button.addEventListener('click',save);
prepare();
window.BancoMestreDriveSaveV042={
 get ready(){return !!client},
 get busy(){return busy}
};
})();
/* Banco Mestre V066 — backup local verificável e cópia consentida para Drive (sem sobrescrita). */
(function BancoMestreV066DriveBackup(){
 'use strict';
 const $=id=>document.getElementById(id);
 const library=$('grifos');
 if(!library||$('bm066DriveBackup'))return;
 const host=library.querySelector('.bm062-panel');
 if(!host)return;
 const box=document.createElement('section');
 box.id='bm066DriveBackup';box.className='bm066-drive-section';
 box.setAttribute('aria-label','Backup de grifos e envio consentido ao Drive');
 box.innerHTML=`
 <h3>Backup verificável e cópia privada no Google Drive</h3>
 <p>Faça uma cópia local antes de enviar dados. O Google Drive recebe <strong>uma nova cópia JSON privada somente quando você autorizar</strong>; nunca substitui PDFs, grifos, cartões ou SRS. A sincronização bidirecional ainda não está ativa.</p>
 <div class="bm066-actions">
  <button type="button" id="bm066Prepare">1. Preparar backup</button>
  <button type="button" id="bm066Download" disabled>2. Baixar JSON</button>
 </div>
 <p id="bm066Digest" class="bm066-hash" aria-live="polite"></p>
 <label class="bm066-consent"><input type="checkbox" id="bm066Confirmed" disabled> Confirmei que salvei o JSON no meu computador e autorizo enviar esta cópia ao meu Google Drive.</label>
 <div class="bm066-actions">
  <button type="button" id="bm066Upload" disabled>3. Autorizar e enviar cópia ao Drive</button>
  <a id="bm066DriveLink" target="_blank" rel="noopener noreferrer" hidden>Abrir arquivo salvo no Drive</a>
 </div>
 <p class="bm066-status" id="bm066Status" role="status" aria-live="polite">Preparação do Google Drive em andamento; a exportação local funciona independentemente do Google.</p>
 <p class="bm066-foot">Escopo do backup: apenas chaves <code>BM030_STROKES_PDF:*</code> e metadados <code>BM062_GRIFOS_META</code>. Não inclui PDFs, IndexedDB, dados do SRS ou tokens Google. Nenhuma importação automática é realizada.</p>`;
 const first=host.querySelector('.notice');
 if(first)first.after(box);else host.prepend(box);
 const status=message=>$('bm066Status').textContent=String(message||'');
 const digest=message=>$('bm066Digest').textContent=String(message||'');
 const MIME='application/json';
 const SCOPE='https://www.googleapis.com/auth/drive.file';
 const MAX=60*1024*1024;
 let prepared=null,downloaded=false,busy=false,client=null,authPending=null,everAuthorized=false,oauthReady=false;
 try{everAuthorized=localStorage.getItem('BM066_DRIVE_GRIFOS_APPROVED')==='1'}catch{}
 const enable=()=>{
  $('bm066Prepare').disabled=busy;
  $('bm066Download').disabled=busy||!prepared;
  $('bm066Confirmed').disabled=busy||!downloaded;
  $('bm066Upload').disabled=busy||!prepared||!downloaded||!$('bm066Confirmed').checked||!oauthReady;
 };
 function readLocal(){
  const records=[];let malformed=0;
  for(let i=0;i<localStorage.length;i++){
   const key=localStorage.key(i);
   if(!key?.startsWith('BM030_STROKES_PDF:'))continue;
   const value=localStorage.getItem(key);
   records.push({key,value});
   try{if(!Array.isArray(JSON.parse(value||'[]')))malformed++}catch{malformed++}
  }
  records.sort((a,b)=>a.key.localeCompare(b.key));
  return {annotation_keys:records,metadata_key:'BM062_GRIFOS_META',
   metadata_raw:localStorage.getItem('BM062_GRIFOS_META'),malformed};
 }
 const isSame=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
 async function sha256(bytes){
  if(!globalThis.crypto?.subtle)throw Error('A verificação SHA-256 requer HTTPS e um navegador compatível.');
  const digest=await crypto.subtle.digest('SHA-256',bytes);
  return [...new Uint8Array(digest)].map(n=>n.toString(16).padStart(2,'0')).join('');
 }
 const filename=()=> 'BancoMestre_Grifos_Backup_'+new Date().toISOString().replace(/[:.]/g,'-')+'.json';
 async function prepare(){
  if(busy)return;busy=true;enable();prepared=null;downloaded=false;
  $('bm066Confirmed').checked=false;$('bm066DriveLink').hidden=true;
  try{
   const raw=readLocal();
   if(!raw.annotation_keys.length&&raw.metadata_raw===null){
    digest('Nenhum grifo foi encontrado neste navegador.');
    status('Abra um PDF e crie grifos para preparar o backup.');return;
   }
   const data={format:'BancoMestreBackupGrifosV066',schema_version:1,
    exported_at:new Date().toISOString(),source_origin:location.origin,
    scope:'grifos_pdf_e_metadados_localStorage',contains_pdfs:false,
    contains_indexeddb:false,contains_srs:false,contains_oauth_tokens:false,
    count_keys:raw.annotation_keys.length,unreadable_keys:raw.malformed,
    annotation_keys:raw.annotation_keys,metadata_key:raw.metadata_key,metadata_raw:raw.metadata_raw};
   const source=JSON.stringify(data,null,2)+'\n',bytes=new TextEncoder().encode(source);
   if(bytes.byteLength>MAX)throw Error('Backup acima de 60 MB. Exporte por documento ou reduza o tamanho de forma assistida, sem apagar as marcações.');
   const sha=await sha256(bytes);
   prepared={bytes,sha,raw,name:filename(),blob:new Blob([bytes],{type:MIME})};
   digest('Cópia preparada: '+raw.annotation_keys.length+' página(s) de anotações · '+bytes.length+
    ' bytes · SHA-256: '+sha+(raw.malformed?' · Atenção: '+raw.malformed+' registro(s) com formato irregular (conteúdo bruto preservado).':''));
   status('Clique em “Baixar JSON”. O envio ao Drive só ficará disponível depois da sua confirmação.');
  }catch(e){status('Backup não preparado: '+e.message);digest('')}
  finally{busy=false;enable()}
 }
 function download(){
  if(!prepared||busy)return;
  const url=URL.createObjectURL(prepared.blob),a=document.createElement('a');
  a.href=url;a.download=prepared.name;document.body.append(a);a.click();a.remove();
  setTimeout(()=>URL.revokeObjectURL(url),45000);
  downloaded=true;status('Download solicitado. Confira o arquivo JSON na pasta de downloads e marque a confirmação somente depois de salvá-lo.');
  enable();
 }
 async function initGoogle(){
  try{
   const cfg=await fetch('assets/drive_auth_v038.json',{cache:'no-store'}).then(r=>{
    if(!r.ok)throw Error('Configuração Google não encontrada');return r.json();
   });
   if(!/^[A-Za-z0-9_-]+\.apps\.googleusercontent\.com$/.test(cfg.client_id||''))throw Error('ID Google OAuth inválido');
   if(!window.google?.accounts?.oauth2?.initTokenClient){
    await new Promise((resolve,reject)=>{
     const sc=document.createElement('script');
     sc.src='https://accounts.google.com/gsi/client';sc.async=true;
     sc.onload=resolve;sc.onerror=()=>reject(Error('Google Identity Services não carregou'));
     document.head.append(sc);
    });
   }
   if(!window.google?.accounts?.oauth2?.initTokenClient)throw Error('OAuth indisponível');
   client=google.accounts.oauth2.initTokenClient({
    client_id:cfg.client_id,scope:SCOPE,
    callback:reply=>{
     const pending=authPending;authPending=null;
     if(!pending)return;
     if(reply?.error||!reply?.access_token){
      pending.reject(Error('Autorização Google negada: '+(reply?.error||'token não recebido')));return;
     }
     if(reply.scope&&!reply.scope.split(/\s+/).includes(SCOPE)){
      pending.reject(Error('A permissão drive.file não foi concedida'));return;
     }
     everAuthorized=true;
     try{localStorage.setItem('BM066_DRIVE_GRIFOS_APPROVED','1')}catch{}
     pending.resolve(reply.access_token);
    },
    error_callback:err=>{
     const pending=authPending;authPending=null;
     if(pending)pending.reject(Error('Autorização Google cancelada: '+String(err?.type||'indisponível')));
    }
   });
   oauthReady=true;status('Google Drive pronto. Primeiro prepare e baixe um backup local para habilitar o envio consentido.');
  }catch(e){
   oauthReady=false;status('Google Drive indisponível neste navegador: '+e.message+'. O backup local continua disponível.');
  }finally{enable()}
 }
 function authorize(){
  if(!client||!oauthReady)throw Error('A autenticação do Google Drive não está pronta.');
  if(authPending)throw Error('Uma autorização já está em andamento');
  return new Promise((resolve,reject)=>{
   authPending={resolve,reject};
   try{client.requestAccessToken({prompt:everAuthorized?'':'consent'})}
   catch(e){authPending=null;reject(Error('Falha ao abrir autorização do Drive: '+e.message))}
  });
 }
 async function createPrivateCopy(token,record){
  const endpoint='https://www.googleapis.com/upload/drive/v3/files';
  const props={bm_product:'BancoMestre',bm_kind:'grifos_backup_manual',
   bm_format:'BancoMestreBackupGrifosV066',bm_sha256:record.sha};
  const init=await fetch(endpoint+'?uploadType=resumable&fields=id,name,mimeType,size,webViewLink,appProperties',{
   method:'POST',headers:{Authorization:'Bearer '+token,'Content-Type':'application/json; charset=UTF-8',
   'X-Upload-Content-Type':MIME,'X-Upload-Content-Length':String(record.blob.size)},
   body:JSON.stringify({name:record.name,mimeType:MIME,appProperties:props}),cache:'no-store'
  });
  if(!init.ok)throw Error('O Drive rejeitou a criação de uma cópia (HTTP '+init.status+')');
  const loc=init.headers.get('Location');
  if(!loc)throw Error('O Drive não retornou endereço de upload. Não foi feito reenvio automático.');
  const url=new URL(loc);
  if(url.origin!=='https://www.googleapis.com'||!url.pathname.startsWith('/upload/drive/v3/files'))
   throw Error('Endereço de upload inesperado; envio bloqueado');
  const uploaded=await fetch(url.href,{method:'PUT',
   headers:{Authorization:'Bearer '+token,'Content-Type':MIME},body:record.blob,cache:'no-store'});
  if(!uploaded.ok)throw Error('Envio não confirmado pelo Drive (HTTP '+uploaded.status+'). Verifique sua pasta antes de tentar outra cópia.');
  const response=await uploaded.json();
  if(!/^[A-Za-z0-9_-]{12,}$/.test(response.id||''))throw Error('O Drive não confirmou um ID de arquivo válido.');
  const check=await fetch('https://www.googleapis.com/drive/v3/files/'+encodeURIComponent(response.id)+
   '?fields=id,name,mimeType,size,appProperties,trashed',{headers:{Authorization:'Bearer '+token},cache:'no-store'});
  if(!check.ok)throw Error('Arquivo enviado, porém a conferência de metadados não foi possível. Verifique seu Drive antes de reenviar.');
  const info=await check.json();
  if(info.trashed||info.id!==response.id||info.mimeType!==MIME||
   Number(info.size)!==record.blob.size||info.appProperties?.bm_sha256!==record.sha)
   throw Error('A verificação de tamanho/metadados não corresponde ao backup local. Verifique o Drive antes de reenviar.');
  return {id:response.id,name:info.name};
 }
 async function upload(){
  if(busy||!prepared||!downloaded||!$('bm066Confirmed').checked||!oauthReady)return;
  busy=true;enable();
  const current=prepared;
  try{
   if(!isSame(readLocal(),current.raw)){
    prepared=null;downloaded=false;$('bm066Confirmed').checked=false;
    digest('Os grifos mudaram desde o backup anterior. Prepare e baixe uma nova cópia.');
    throw Error('O estado local mudou; não é seguro enviar a cópia antiga');
   }
   status('Solicitando autorização específica para criar uma cópia no seu Google Drive...');
   // A solicitação do Google deve ocorrer diretamente durante o clique.
   const promise=authorize();
   const token=await promise;
   status('Permissão concedida. Criando nova cópia JSON privada no Meu Drive...');
   const result=await createPrivateCopy(token,current);
   const link=$('bm066DriveLink');
   link.href='https://drive.google.com/file/d/'+encodeURIComponent(result.id)+'/view';
   link.textContent='Abrir cópia: '+result.name;link.hidden=false;
   try{localStorage.setItem('BM066_DRIVE_GRIFOS_LAST_COPY',JSON.stringify({
    id:result.id,sha256:current.sha,uploaded_at:new Date().toISOString(),name:result.name}))}catch{}
   status('Cópia privada no Drive confirmada pelo tamanho e metadados. Nenhuma marcação local, PDF, cartão ou SRS foi alterado.');
  }catch(e){
   status('Não foi possível confirmar o backup no Drive: '+e.message+
    '. Nenhuma informação local foi apagada e o sistema não fará reenvios automáticos.');
  }finally{busy=false;enable()}
 }
 $('bm066Prepare').addEventListener('click',prepare);
 $('bm066Download').addEventListener('click',download);
 $('bm066Confirmed').addEventListener('change',enable);
 $('bm066Upload').addEventListener('click',upload);
 enable();initGoogle();
 window.BancoMestreGrifosDriveV066={get ready(){return oauthReady},get hasSnapshot(){return !!prepared}};
})();

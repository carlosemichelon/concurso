/* V104 — um mestre ativo no Drive, legado V103 somente leitura, merge sem perda silenciosa. */
/* V103 — sincronização conservadora de grifos em arquivos PRIVADOS no Drive.
 * Um arquivo JSON por dispositivo, sem substituir o arquivo de outro aparelho.
 * Nenhum token é salvo em localStorage; sem upload sem autenticação/autorização.
 * O core aplica somente importações aditivas e informa alterações conflitantes.
 */
(function(){
'use strict';
if(window.BancoMestreGrifosDriveSyncV104)return;
const core=window.BancoMestreGrifosSyncCoreV103,
      masterCore=window.BancoMestreGrifosMasterV104,
      library=document.getElementById('grifos');
if(!core||!masterCore||!library)return;
const API='https://www.googleapis.com/drive/v3/files',
      UPLOAD='https://www.googleapis.com/upload/drive/v3/files',
      SCOPE='https://www.googleapis.com/auth/drive.file',
      KIND='bm_grifos_sync_v104_master',LEGACY_KIND='bm_grifos_sync_v103',
      DEVICE_KEY='BM103_GRIFOS_DEVICE_ID',
      AUTO_KEY='BM103_GRIFOS_AUTO_SYNC',
      INTERVAL=120000;
let token='',expiry=0,client=null,pendingConsent=null,busy=false,
    lastRun=0,scheduled=null,auto=false;
try{auto=localStorage.getItem(AUTO_KEY)!=='0'}catch(_){auto=true}
function deviceId(){
 let id;try{id=localStorage.getItem(DEVICE_KEY)}catch(_){}
 if(!/^[A-Za-z0-9_-]{8,100}$/.test(id||'')){
  id=globalThis.crypto?.randomUUID?.()||
   'local-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,14);
  try{localStorage.setItem(DEVICE_KEY,id)}catch(_){}
 }
 return id;
}
const device=deviceId(),el=(tag,text)=>{const e=document.createElement(tag);if(text)e.textContent=text;return e};
const section=el('section');section.id='bm103DriveSync';section.className='bm103-drive-sync';
section.setAttribute('aria-label','Compartilhar grifos entre celular e computador');
const title=el('h3','Arquivo mestre único — grifos');
const explain=el('p','Um único arquivo mestre ativo no Google Drive para celular e computador. O navegador guarda sua cópia local; versões divergentes são preservadas para conferência. PDFs e SRS não são enviados.');
const controls=el('div');controls.className='bm103-sync-actions';
const connect=el('button','Conectar Google Drive');connect.id='bm103SyncConnect';connect.type='button';connect.disabled=true;
const sync=el('button','Sincronizar agora');sync.id='bm103SyncNow';sync.type='button';sync.disabled=true;
const backup=el('button','Baixar backup local');backup.id='bm103SyncBackup';backup.type='button';
controls.append(connect,sync,backup);
const label=el('label');label.className='bm103-sync-auto';
const check=el('input');check.id='bm103SyncAuto';check.type='checkbox';check.checked=auto;
const info=el('span','Sincronizar automaticamente após editar e a cada 2 minutos (site aberto e Google conectado)');
label.append(check,info);
const status=el('p','Preparando a conexão Google…');status.id='bm103SyncStatus';
status.setAttribute('role','status');status.setAttribute('aria-live','polite');
const note=el('p','Segurança: só um arquivo mestre é atualizado. Conflitos ficam registrados como variantes; nenhuma exclusão é propagada. Arquivos V103 são lidos como recuperação e não são apagados. Não há garantia absoluta de perda zero; faça backups periódicos.');
note.className='bm103-sync-note';
section.append(title,explain,controls,label,status,note);
library.querySelector('.bm062-panel')?.append(section);
function say(text,error=false){
 status.textContent=text;status.classList.toggle('bm103-sync-error',error);
}
function authorized(){return !!token&&Date.now()<expiry-60000}
function ui(){
 connect.disabled=!client||busy;
 sync.disabled=!authorized()||busy;
 backup.disabled=busy;
 check.disabled=busy;
 connect.textContent=authorized()?'Reconectar conta Google':'Conectar Google Drive';
}
async function bootGoogle(){
 try{
  const conf=await fetch('assets/drive_auth_v038.json',{cache:'no-store'}).then(r=>r.ok?r.json():Promise.reject(Error('Configuração OAuth não encontrada')));
  if(!/^[A-Za-z0-9_.-]+\.apps\.googleusercontent\.com$/.test(conf.client_id||''))throw Error('Client ID Google incompleto');
  if(!window.google?.accounts?.oauth2){
   await new Promise((resolve,reject)=>{
    const pre=document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
    if(pre){let waited=0;const wait=setInterval(()=>{
     if(window.google?.accounts?.oauth2){clearInterval(wait);resolve()}
     else if(++waited>50){clearInterval(wait);reject(Error('Biblioteca Google indisponível'))}
    },120);return}
    const sc=document.createElement('script');sc.src='https://accounts.google.com/gsi/client';
    sc.async=true;sc.onload=resolve;sc.onerror=()=>reject(Error('Não foi possível carregar Google Identity Services'));
    document.head.append(sc);
   });
  }
  client=window.google.accounts.oauth2.initTokenClient({
   client_id:conf.client_id,scope:SCOPE,callback:r=>{
    if(!pendingConsent)return;
    const pending=pendingConsent;pendingConsent=null;
    if(r?.error||!r?.access_token){pending.reject(Error(r?.error||'Autorização não concedida'));return}
    token=r.access_token;expiry=Date.now()+Math.max(300,Number(r.expires_in)||3600)*1000;
    pending.resolve();
   }
  });
  say('Pronto. Conecte a mesma conta Google em cada aparelho para começar.');
 }catch(e){say('Conexão Google indisponível: '+e.message+'. Backup local permanece disponível.',true)}
 ui();
}
function consent(){
 if(!client)throw Error('Autenticação ainda não está pronta');
 if(pendingConsent)throw Error('Uma autorização já está em andamento');
 // Called synchronously from a real button click to avoid popup blockers.
 return new Promise((resolve,reject)=>{
  pendingConsent={resolve,reject};
  try{client.requestAccessToken({prompt:'consent'})}
  catch(e){pendingConsent=null;reject(e)}
 });
}
async function request(url,options={}){
 if(!authorized())throw Error('Sessão Google expirada; reconecte sua conta');
 const headers={Authorization:'Bearer '+token,...options.headers};
 const r=await fetch(url,{...options,headers,cache:'no-store'});
 if(!r.ok){
  if(r.status===401||r.status===403){token='';expiry=0;ui()}
  const body=await r.text().catch(()=>'');
  throw Error('Google Drive HTTP '+r.status+(body.includes('insufficientPermissions')?' (permissão insuficiente)':''));
 }
 return r;
}
async function findFiles(kind){
 const result=[];let next='',pages=0;
 const q="trashed = false and appProperties has { key='bm_kind' and value='"+kind+"' }";
 do{
  const url=new URL(API);
  url.searchParams.set('q',q);url.searchParams.set('spaces','drive');
  url.searchParams.set('pageSize','100');
  url.searchParams.set('fields','nextPageToken,incompleteSearch,files(id,name,size,mimeType,appProperties,modifiedTime,version)');
  if(next)url.searchParams.set('pageToken',next);
  const data=await (await request(url.toString())).json();
  if(data.incompleteSearch)throw Error('Pesquisa do Drive incompleta; nenhuma alteração aplicada');
  for(const f of data.files||[])
   if(f.appProperties?.bm_kind===kind)result.push(f);
  next=data.nextPageToken||'';pages++;
 }while(next&&pages<5);
 if(next)throw Error('Pesquisa incompleta; não é seguro gravar');
 if(result.length>30)throw Error('Há mais de 30 arquivos antigos; é necessária auditoria');
 return result;
}
async function readFile(file,kind){
 if(Number(file.size)>core.LIMIT_BYTES)throw Error('Arquivo Drive maior que 12 MB: '+file.name);
 if(!/^[A-Za-z0-9_-]{10,}$/.test(file.id||''))throw Error('Identificador do Drive inválido');
 const r=await request(API+'/'+encodeURIComponent(file.id)+'?alt=media');
 const text=await r.text();
 if(text.length>core.LIMIT_BYTES)throw Error('Arquivo mestre excede 12 MB');
 const data=JSON.parse(text);
 if(kind===KIND){
  masterCore.validate(data);
 }else{
  core.validate(data);
  if(data.device!==file.appProperties?.bm_device)
   throw Error('Backup antigo associado a dispositivo diferente');
 }
 return data;
}
async function fileMeta(file){
 const url=API+'/'+encodeURIComponent(file.id)+'?fields=id,version,size,appProperties';
 const result=await (await request(url)).json();
 if(result.id!==file.id||result.appProperties?.bm_kind!==KIND)
  throw Error('O arquivo mestre mudou de identificação');
 return result;
}
async function createMaster(snapshot){
 const metadata={
  name:'BancoMestre_Grifos_Mestre.json',mimeType:'application/json',
  appProperties:{bm_kind:KIND,bm_schema:'V104'}
 };
 const boundary='bm104-'+(globalThis.crypto?.randomUUID?.()||Date.now());
 const body='--'+boundary+'\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n'+
  JSON.stringify(metadata)+'\r\n--'+boundary+
  '\r\nContent-Type: application/json\r\n\r\n'+JSON.stringify(snapshot)+
  '\r\n--'+boundary+'--';
 const r=await request(UPLOAD+'?uploadType=multipart&fields=id,name,size,appProperties,version',{
  method:'POST',headers:{'Content-Type':'multipart/related; boundary='+boundary},body
 });
 const result=await r.json();
 if(!result.id||result.appProperties?.bm_kind!==KIND)
  throw Error('Criação do arquivo mestre não confirmada');
 return result.id;
}
async function updateMaster(file,snapshot){
 const url=UPLOAD+'/'+encodeURIComponent(file.id)+'?uploadType=media&fields=id,size,modifiedTime,version';
 const response=await request(url,{method:'PATCH',
  headers:{'Content-Type':'application/json; charset=UTF-8'},body:JSON.stringify(snapshot)});
 const result=await response.json();
 if(result.id!==file.id)throw Error('Atualização do mestre sem identificação confirmada');
 return result;
}
async function syncOnce(manual=false){
 if(busy||!authorized())return;
 if(window.BancoMestrePDFV042?.editing){
  if(manual)say('Feche o PDF antes de sincronizar. Os grifos permanecem salvos localmente.');
  return;
 }
 busy=true;ui();
 try{
  say('Lendo o arquivo mestre e os backups antigos, sem apagar nada…');
  const masters=await findFiles(KIND);
  if(masters.length>1)
   throw Error('Foram encontrados dois arquivos mestres. Pare e revise antes de continuar');
  const legacyFiles=await findFiles(LEGACY_KIND);
  // User retains their own device files as read-only migration/restore material.
  const oldBundles=[];
  for(const file of legacyFiles){
   if(!/^[A-Za-z0-9_-]{8,100}$/.test(file.appProperties?.bm_device||''))continue;
   oldBundles.push(await readFile(file,LEGACY_KIND));
  }
  const ownSnapshot=core.capture(localStorage,device);
  const selected=masters[0]||null;
  const remote=selected?await readFile(selected,KIND):null;
  // Preserve alternatives for edited IDs inside the single master file.
  const build=masterCore.merge(remote,[...oldBundles,ownSnapshot]);
  const candidate=masterCore.final(build.master);
  let id=selected?.id;
  if(!selected){
   // Recheck before creating to avoid an obvious double-master race.
   if((await findFiles(KIND)).length)throw Error('Outro aparelho criou o mestre. Sincronize novamente');
   id=await createMaster(candidate);
  }else if(build.changed){
   // Best-effort optimistic concurrency: recheck the Drive version before PATCH.
   // Drive v3 does not document an atomic compare-and-swap for media updates.
   const latest=await fileMeta(selected);
   if(String(latest.version)!==String(selected.version))
    throw Error('O mestre foi alterado por outro aparelho. Clique novamente para mesclar');
   await updateMaster(selected,candidate);
  }
  const confirmed=await readFile({id,size:core.LIMIT_BYTES},KIND);
  const mine=masterCore.contains(confirmed,ownSnapshot);
  const expected=masterCore.contains(confirmed,candidate);
  if(!mine.ok||!expected.ok)throw Error('Conferência pós-gravação não confirmou todos os grifos; sua cópia local foi preservada');
  // The merge applies only additions to the local browser, never deletions.
  const remoteSnapshot={
   schema:core.SCHEMA,device:'MASTER-V104-0000',
   generated_at:confirmed.updated_at,records:confirmed.records
  };
  const additions=core.plan(localStorage,[remoteSnapshot]);
  if(additions.writes.length){
   core.apply(localStorage,additions);
   window.dispatchEvent(new CustomEvent('bm-pdf-storage-changed',{detail:{action:'master-import'}}));
  }
  lastRun=Date.now();
  const issues=confirmed.conflicts.length;
  say('Mestre confirmado no Drive: '+Object.keys(confirmed.records).length+
    ' registro(s) de páginas/metadados; '+additions.additions+
    ' acréscimo(s) neste aparelho.'+
    (issues?' Existem '+issues+' divergência(s) preservada(s) para revisão.':' Sem divergências detectadas.')+
    ' Arquivo único ativo.');
  status.classList.toggle('bm103-sync-warning',!!issues);
 }catch(e){
  say('Não sincronizado com o mestre: '+e.message+'. Grifos locais mantidos; não apague o navegador.',true);
 }finally{busy=false;ui()}
}
const runSync=syncOnce;
function backupLocal(){
 try{
  const bundle=core.capture(localStorage,device);
  const blob=new Blob([JSON.stringify(bundle,null,2)],{type:'application/json'});
  const url=URL.createObjectURL(blob),a=document.createElement('a');
  a.href=url;a.download='BancoMestre_Grifos_'+new Date().toISOString().slice(0,10)+'.json';
  document.body.append(a);a.click();a.remove();
  setTimeout(()=>URL.revokeObjectURL(url),2000);
  say('Download do backup solicitado. Confira se o arquivo foi salvo.');
 }catch(e){say('Não foi possível preparar backup: '+e.message,true)}
}
connect.addEventListener('click',()=>{
 if(!client||busy)return;
 say('Abrindo a autorização do Google…');
 consent().then(()=>{ui();say('Conta conectada. Iniciando a conferência privada dos grifos…');return runSync(true)})
 .catch(e=>{say('Autorização não concluída: '+e.message,true);ui()});
});
sync.addEventListener('click',()=>runSync(true));
backup.addEventListener('click',backupLocal);
check.addEventListener('change',()=>{
 auto=check.checked;try{localStorage.setItem(AUTO_KEY,auto?'1':'0')}catch(_){}
 say(auto?'Sincronização periódica habilitada enquanto a sessão Google estiver válida.':'Sincronização automática pausada; botão manual disponível.');
 if(auto&&authorized())void runSync();
});
// When the reader closes, upload changes made during this study session.
const reader=document.getElementById('pdfDialog');
if(reader)reader.addEventListener('close',()=>{
 if(auto&&authorized()&&!busy)
  setTimeout(()=>{if(document.visibilityState==='visible')void runSync()},800);
});
window.addEventListener('bm-pdf-storage-changed',()=>{
 if(!auto||!authorized()||busy||scheduled)return;
 scheduled=setTimeout(()=>{scheduled=null;if(document.visibilityState==='visible')void runSync()},20000);
});
document.addEventListener('visibilitychange',()=>{
 if(document.visibilityState==='visible'&&auto&&authorized()&&!busy&&Date.now()-lastRun>INTERVAL)
  void runSync();
});
setInterval(()=>{
 if(auto&&authorized()&&document.visibilityState==='visible'&&!busy&&Date.now()-lastRun>INTERVAL)
  void runSync();
},INTERVAL);
window.BancoMestreGrifosDriveSyncV104=Object.freeze({
 get connected(){return authorized()},get deviceId(){return device},
 get lastSync(){return lastRun},sync:()=>runSync(true)
});
bootGoogle();
})();
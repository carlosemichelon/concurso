/* V103 — sincronização conservadora de grifos em arquivos PRIVADOS no Drive.
 * Um arquivo JSON por dispositivo, sem substituir o arquivo de outro aparelho.
 * Nenhum token é salvo em localStorage; sem upload sem autenticação/autorização.
 * O core aplica somente importações aditivas e informa alterações conflitantes.
 */
(function(){
'use strict';
if(window.BancoMestreGrifosDriveSyncV103)return;
const core=window.BancoMestreGrifosSyncCoreV103,
      library=document.getElementById('grifos');
if(!core||!library)return;
const API='https://www.googleapis.com/drive/v3/files',
      UPLOAD='https://www.googleapis.com/upload/drive/v3/files',
      SCOPE='https://www.googleapis.com/auth/drive.file',
      KIND='bm_grifos_sync_v103',
      DEVICE_KEY='BM103_GRIFOS_DEVICE_ID',
      AUTO_KEY='BM103_GRIFOS_AUTO_SYNC',
      INTERVAL=120000;
let token='',expiry=0,client=null,pendingConsent=null,busy=false,
    lastRun=0,scheduled=null,auto=false;
try{auto=localStorage.getItem(AUTO_KEY)==='1'}catch(_){}
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
const title=el('h3','Sincronizar grifos entre dispositivos');
const explain=el('p','Use a mesma conta Google nos dois aparelhos. Os grifos ficam também neste navegador e são copiados para arquivos privados do seu Drive. PDFs, flashcards e SRS não são enviados.');
const controls=el('div');controls.className='bm103-sync-actions';
const connect=el('button','Conectar Google Drive');connect.id='bm103SyncConnect';connect.type='button';connect.disabled=true;
const sync=el('button','Sincronizar agora');sync.id='bm103SyncNow';sync.type='button';sync.disabled=true;
const backup=el('button','Baixar backup local');backup.id='bm103SyncBackup';backup.type='button';
controls.append(connect,sync,backup);
const label=el('label');label.className='bm103-sync-auto';
const check=el('input');check.id='bm103SyncAuto';check.type='checkbox';check.checked=auto;
const info=el('span','Sincronizar a cada 2 minutos enquanto o site estiver aberto e autorizado');
label.append(check,info);
const status=el('p','Preparando a conexão Google…');status.id='bm103SyncStatus';
status.setAttribute('role','status');status.setAttribute('aria-live','polite');
const note=el('p','Segurança: alterações diferentes no mesmo ID são sinalizadas, nunca substituídas automaticamente. Exclusões entre aparelhos ainda não são propagadas. A primeira conexão exige autorização no Google.');
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
async function files(){
 const result=[];let next='',pages=0;
 const q="trashed = false and appProperties has { key='bm_kind' and value='"+KIND+"' }";
 do{
  const url=new URL(API);
  url.searchParams.set('q',q);url.searchParams.set('spaces','drive');
  url.searchParams.set('pageSize','100');
  url.searchParams.set('fields','nextPageToken,incompleteSearch,files(id,name,size,mimeType,appProperties,modifiedTime)');
  if(next)url.searchParams.set('pageToken',next);
  const data=await (await request(url.toString())).json();
  if(data.incompleteSearch)throw Error('Pesquisa do Drive incompleta; nenhum dado foi aplicado');
  for(const f of data.files||[]){
   if(f.appProperties?.bm_kind!==KIND||
      !/^[A-Za-z0-9_-]{8,100}$/.test(f.appProperties?.bm_device||''))continue;
   result.push(f);
  }
  if(result.length>30)throw Error('Mais de 30 dispositivos no Drive; revisão necessária');
  next=data.nextPageToken||'';pages++;
 }while(next&&pages<5);
 if(next)throw Error('Não foi possível conferir todas as páginas de arquivos do Drive');
 return result;
}
async function readFile(file){
 if(Number(file.size)>core.LIMIT_BYTES)throw Error('Backup remoto grande demais: '+file.name);
 if(!/^[A-Za-z0-9_-]{10,}$/.test(file.id||''))throw Error('ID remoto inválido');
 const response=await request(API+'/'+encodeURIComponent(file.id)+'?alt=media');
 const body=await response.text();
 if(body.length>core.LIMIT_BYTES)throw Error('Backup remoto maior que 12 MB');
 const data=JSON.parse(body);
 core.validate(data);
 if(data.device!==file.appProperties.bm_device)throw Error('Identificação do dispositivo remoto inconsistente');
 return data;
}
async function createCopy(snapshot){
 const metadata={name:'BancoMestre_Grifos_'+device+'.json',mimeType:'application/json',
  appProperties:{bm_kind:KIND,bm_device:device,bm_schema:'V103'}};
 const boundary='bm103-'+(globalThis.crypto?.randomUUID?.()||Date.now());
 const body='--'+boundary+'\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n'+
  JSON.stringify(metadata)+'\r\n--'+boundary+
  '\r\nContent-Type: application/json\r\n\r\n'+JSON.stringify(snapshot)+
  '\r\n--'+boundary+'--';
 const response=await request(UPLOAD+'?uploadType=multipart&fields=id,name,size,appProperties',{
  method:'POST',headers:{'Content-Type':'multipart/related; boundary='+boundary},body
 });
 const result=await response.json();
 if(!result.id||result.appProperties?.bm_device!==device)throw Error('Criação do backup remoto sem confirmação completa');
 return result.id;
}
async function updateCopy(file,snapshot){
 const url=UPLOAD+'/'+encodeURIComponent(file.id)+'?uploadType=media&fields=id,size,modifiedTime';
 const response=await request(url,{method:'PATCH',
  headers:{'Content-Type':'application/json; charset=UTF-8'},body:JSON.stringify(snapshot)});
 const result=await response.json();
 if(result.id!==file.id)throw Error('Não foi possível conferir o arquivo atualizado');
 return file.id;
}
async function runSync(manual=false){
 if(busy||!authorized())return;
 if(window.BancoMestrePDFV042?.editing){
  if(manual)say('Feche o editor PDF antes de sincronizar para proteger a página ativa.');
  return;
 }
 busy=true;ui();
 try{
  say('Conferindo as cópias privadas no Google Drive…');
  const listed=await files(),remotes=[];
  for(const f of listed)remotes.push(await readFile(f));
  // Every device writes only to its own file; never overwrites another device.
  const merge=core.plan(localStorage,remotes);
  if(merge.writes.length){
   say('Mesclando '+merge.additions+' novos registros sem remover os locais…');
   core.apply(localStorage,merge);
   window.dispatchEvent(new CustomEvent('bm-pdf-storage-changed',{detail:{action:'cross-device-sync'}}));
  }
  const snapshot=core.capture(localStorage,device);
  const own=listed.filter(f=>f.appProperties?.bm_device===device);
  if(own.length>1)throw Error('Cópias duplicadas deste aparelho; nenhuma será substituída');
  if(own.length)await updateCopy(own[0],snapshot);
  else await createCopy(snapshot);
  lastRun=Date.now();
  const problems=merge.conflicts.reduce((n,e)=>n+(e.count||1),0);
  say('Sincronizado: '+merge.additions+' registro(s) novo(s) incorporado(s), '+
    listed.length+' dispositivo(s) consultado(s).'+
    (problems?' Atenção: '+problems+' divergência(s) no mesmo ID; versões diferentes preservadas nos dispositivos, sem sobrescrita.':' Nenhum conflito identificado.'));
  if(problems)status.classList.add('bm103-sync-warning');
  else status.classList.remove('bm103-sync-warning');
 }catch(e){say('Sincronização não concluída: '+e.message+'. Seus dados locais foram preservados.',true)}
 finally{busy=false;ui()}
}
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
window.BancoMestreGrifosDriveSyncV103=Object.freeze({
 get connected(){return authorized()},get deviceId(){return device},
 get lastSync(){return lastRun},sync:()=>runSync(true)
});
bootGoogle();
})();
/* Banco Mestre V086 — importação reversível das 184 exclusões do Atlas.
 * Fonte: JSON privado no Drive. Não publica a lista de IDs no GitHub.
 * Ações em IndexedDB do navegador somente após OAuth + confirmação do titular.
 * NÃO exclui originais no Drive; ignorar associações por nome não verificadas. */
(function(){
 'use strict';
 const SOURCE='1PLYugdUTxtpDmoxOe56LtCG-a1cDKGej';
 const EXPECTED=184;
 const SCOPE='https://www.googleapis.com/auth/drive.readonly';
 const BACKUP='BM086_EXCLUSOES_BACKUP_V1';
 const DB='BancoMestreImagensV023',STORE='items';
 const VALID=/^IMG-\d{3}$/;
 let token='',expires=0,oauth=null,proposed=null,busy=false;
 const $=id=>document.getElementById(id);
 function msg(s,error){const n=$('bm086-status');if(n){n.textContent=s;n.style.color=error?'#943a32':'#315951';}}
 function e(tag,text){const n=document.createElement(tag);if(text!==undefined)n.textContent=text;return n;}
 function authorized(){return Boolean(token&&Date.now()<expires);}
 function initUi(){
  const panel=$('imagens')?.querySelector('.panel');if(!panel||$('bm086-import'))return;
  const box=e('section');box.id='bm086-import';box.style.cssText='margin:12px 0 18px;padding:14px;border:1px solid #c7d9d3;border-radius:10px;background:#f4f9f7';
  const title=e('h3','Recuperar exclusões anteriores do Atlas');title.style.margin='0 0 7px';
  const p=e('p','Lista privada no Google Drive: 184 imagens excluídas na versão anterior. Importação reversível apenas neste navegador, sem apagar originais nem modificar seus grifos.');p.style.cssText='font-size:13px;margin:0 0 12px';
  const line=e('div');line.style.cssText='display:flex;flex-wrap:wrap;gap:8px;align-items:center';
  const connect=e('button','Conectar Drive e conferir lista');connect.type='button';connect.id='bm086-connect';connect.disabled=true;
  const apply=e('button','Aplicar exclusões verificadas');apply.type='button';apply.id='bm086-apply';apply.disabled=true;
  const revert=e('button','Desfazer última importação');revert.type='button';revert.id='bm086-revert';revert.disabled=true;
  line.append(connect,apply,revert);
  const status=e('p','Preparando acesso seguro à lista privada.');status.id='bm086-status';status.setAttribute('role','status');status.style.cssText='font-size:12px;margin:10px 0 0';
  box.append(title,p,line,status);
  const anchor=panel.querySelector('#bm084-sync')||panel.querySelector('.notice')||panel.querySelector('.controls');
  if(anchor)anchor.after(box);else panel.prepend(box);
  connect.onclick=()=>{if(oauth)oauth.requestAccessToken({prompt:authorized()?'':'consent'});};
  apply.onclick=()=>{void applyList();};
  revert.onclick=()=>{void revertImport();};
  revert.disabled=!haveBackup();
 }
 function haveBackup(){try{const b=JSON.parse(localStorage.getItem(BACKUP)||'null');return Boolean(b?.batch&&Array.isArray(b?.changed)&&b.changed.length);}catch{return false}}
 function gis(){return new Promise((resolve,reject)=>{
  if(window.google?.accounts?.oauth2){resolve();return}
  const js=document.createElement('script');js.src='https://accounts.google.com/gsi/client';js.async=true;js.onload=resolve;js.onerror=()=>reject(Error('Google Identity Services indisponível'));document.head.append(js);
 });}
 async function boot(){
  initUi();if(!$('bm086-import'))return;
  try{
   const r=await fetch('assets/drive_auth_v038.json',{cache:'no-store'});if(!r.ok)throw Error('Configuração Google não localizada');
   const conf=await r.json();if(!conf.client_id?.endsWith('.apps.googleusercontent.com'))throw Error('OAuth Client ID inválido');
   await gis();
   oauth=google.accounts.oauth2.initTokenClient({client_id:conf.client_id,scope:SCOPE,callback:result=>{
    if(result.error||!result.access_token){msg('Autorização não concluída. Nenhuma exclusão foi alterada.',true);return;}
    token=result.access_token;expires=Date.now()+Math.max(60,Number(result.expires_in||3600)-90)*1000;
    void inspect();
   },error_callback:()=>msg('Falha de autorização. Nenhuma exclusão foi alterada.',true)});
   $('bm086-connect').disabled=false;
   msg('Conecte seu Drive para conferir a lista e decidir se deseja aplicar as 184 exclusões.');
  }catch(err){msg('Importação indisponível: '+err.message,true)}
 }
 async function getSource(){
  if(!authorized())throw Error('Autorização expirada; reconecte o Drive');
  const r=await fetch('https://www.googleapis.com/drive/v3/files/'+encodeURIComponent(SOURCE)+'?alt=media',{
   headers:{Authorization:'Bearer '+token},cache:'no-store'});
  if(!r.ok)throw Error('Leitura do JSON privado falhou (Drive HTTP '+r.status+')');
  const s=await r.text();if(s.length>350000)throw Error('Arquivo de exclusões excessivamente grande');
  let j;try{j=JSON.parse(s)}catch{throw Error('Arquivo do Drive não é um JSON válido')}
  if(j?.format!=='BancoMestreExcluirImagensDriveV046'||j?.count!==EXPECTED||!Array.isArray(j.items)||j.items.length!==EXPECTED)
   throw Error('Formato/quantidade da lista não corresponde às 184 exclusões exportadas');
  const ids=j.items.map(x=>x?.id);
  if(ids.some(id=>typeof id!=='string'||!VALID.test(id))||new Set(ids).size!==EXPECTED)
   throw Error('Lista contém IDs de imagens inválidos ou repetidos');
  const m=await loadMeta();const known=new Set((m.images||[]).map(i=>i.no));
  const missing=ids.filter(id=>!known.has(id));if(missing.length)throw Error('Existem '+missing.length+' IDs não encontrados no Atlas: importação cancelada');
  // NÃO utilizar drive_file_id, drive_url, mapping, nem título para apagar ou associar imagens.
  return ids;
 }
 function openDB(){return new Promise((resolve,reject)=>{
  const r=indexedDB.open(DB,1);r.onupgradeneeded=()=>{const db=r.result;if(!db.objectStoreNames.contains(STORE))db.createObjectStore(STORE,{keyPath:'id'})};
  r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error||Error('IndexedDB indisponível'));
 });}
 async function allStates(){
  const db=await openDB();try{return await new Promise((resolve,reject)=>{
   const tx=db.transaction(STORE,'readonly'),r=tx.objectStore(STORE).getAll();
   r.onsuccess=()=>resolve(r.result||[]);r.onerror=()=>reject(r.error);tx.onerror=()=>reject(tx.error);
  });}finally{db.close()}
 }
 async function atomic(operate){
  const db=await openDB();try{return await new Promise((resolve,reject)=>{
   const tx=db.transaction(STORE,'readwrite'),store=tx.objectStore(STORE);
   try{operate(store)}catch(e){tx.abort();reject(e);return;}
   tx.oncomplete=()=>resolve();tx.onerror=()=>reject(tx.error||Error('Falha ao salvar exclusões'));tx.onabort=()=>reject(tx.error||Error('Gravação cancelada'));
  });}finally{db.close()}
 }
 async function inspect(){
  if(busy)return;busy=true;$('bm086-apply').disabled=true;
  try{
   msg('Conferindo o JSON privado do Drive e os 270 IDs do catálogo...');
   const ids=await getSource();const present=new Map((await allStates()).map(x=>[x.id,x]));
   const already=ids.filter(id=>present.get(id)?.status==='hidden').length;
   proposed=ids;
   msg('Arquivo verificado: 184 IDs distintos; '+already+' já ocultos neste navegador e '+(ids.length-already)+' a ocultar. Os 36 vínculos candidatos com arquivos do Drive NÃO serão utilizados. Clique em “Aplicar exclusões verificadas”.');
   $('bm086-apply').disabled=false;
  }catch(err){proposed=null;msg('Conferência interrompida: '+err.message+'. Nenhuma alteração realizada.',true)}
  finally{busy=false}
 }
 async function refreshUI(){
  try{localStorage.setItem('BM_IMAGENS_V023_CHANGE',String(Date.now()))}catch{}
  window.dispatchEvent(new Event('bm-imagens-atualizadas'));
  try{await window.BancoMestreV064Imagens?.refresh?.()}catch(err){console.warn('Atualização dos assuntos pendente',err)}
  try{if(typeof imgRender==='function')await imgRender()}catch(err){console.warn('Atualização do Atlas pendente',err)}
 }
 async function applyList(){
  if(busy||!proposed?.length)return;
  const before=new Map((await allStates()).map(x=>[x.id,x]));
  const ids=proposed.filter(id=>before.get(id)?.status!=='hidden');
  if(!ids.length){msg('As 184 imagens já estão excluídas neste navegador. Nada foi alterado.');return;}
  if(!confirm('Ocultar '+ids.length+' imagens adicionais neste navegador? As imagens do Drive e os seus grifos serão preservados. Esta operação pode ser desfeita.'))return;
  busy=true;$('bm086-apply').disabled=true;
  const changedAt=new Date().toISOString();
  const batch='bm086-'+changedAt;
  const changed=ids.map(id=>({id,prior:before.has(id)?before.get(id):null}));
  try{
   // Backup prévio é obrigatório: se falhar (quota, modo privado), não aplicar.
   localStorage.setItem(BACKUP,JSON.stringify({batch,changedAt,createdAt:changedAt,source:SOURCE,changed}));
   await atomic(store=>{
    for(const {id,prior} of changed)store.put({...prior,id,status:'hidden',updatedAt:changedAt,bmImportBatch:batch});
   });
   await refreshUI();$('bm086-revert').disabled=false;
   msg('Importação concluída: '+ids.length+' exclusões aplicadas; '+(EXPECTED-ids.length)+' já estavam ocultas. 184 IDs preservados; nada foi apagado do Drive. É possível restaurar pelo filtro “Imagens excluídas”.');
  }catch(err){msg('Falha ao aplicar: '+err.message+'. Confira o Atlas; não houve exclusão de arquivos no Drive.',true);}
  finally{busy=false;$('bm086-apply').disabled=false}
 }
 async function revertImport(){
  if(busy)return;
  let backup;try{backup=JSON.parse(localStorage.getItem(BACKUP)||'null')}catch{}
  if(!backup?.batch||!Array.isArray(backup.changed)||!backup.changed.length){msg('Nenhum backup de importação disponível.',true);return;}
  if(!confirm('Desfazer apenas as exclusões feitas pela última importação? Alterações manuais posteriores serão respeitadas.'))return;
  busy=true;$('bm086-revert').disabled=true;
  try{
   const states=new Map((await allStates()).map(x=>[x.id,x]));
   const restorable=backup.changed.filter(x=>states.get(x.id)?.bmImportBatch===backup.batch&&states.get(x.id)?.status==='hidden'&&states.get(x.id)?.updatedAt===backup.changedAt);
   await atomic(store=>{for(const {id,prior} of restorable){if(prior)store.put(prior);else store.delete(id)}});
   localStorage.removeItem(BACKUP);
   await refreshUI();
   msg('Importação revertida para '+restorable.length+' imagens. As alterações manuais posteriores foram preservadas.');
  }catch(err){msg('Falha ao reverter: '+err.message,true);$('bm086-revert').disabled=false}
  finally{busy=false}
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{void boot()},{once:true});else void boot();
})();
/* Banco Mestre V203 (formato histórico V195): resposta discursiva opcional no leitor de cartões.
 * IndexedDB local + envio EXPLÍCITO ao Drive do titular. Não altera o SRS canônico.
 * O ID da pasta compartilhada não é publicado no GitHub: configure-o no navegador.
 */
(function(){
 'use strict';
 if(window.BM195Discursivas)return;
 const ID_RE=/^(?:CARD-\d{4,}|PROP-IJUI-\d+|IJUI-[A-Za-z0-9_-]+)$/;
 const FILE_ID=/^[A-Za-z0-9_-]{10,}$/;
 const DB_NAME='BancoMestreDiscursivasV195';
 const FOLDER_KEY='BM195_RESPOSTAS_DRIVE_FOLDER_ID';
 const DRAFT_PREFIX='BM195_DISCURSIVA_RASCUNHO:';
 const SCOPE='https://www.googleapis.com/auth/drive';
 const API='https://www.googleapis.com/drive/v3/files';
 const UPLOAD='https://www.googleapis.com/upload/drive/v3/files';
 const FORMAT='BancoMestreRespostaDiscursivaV195';
 let dbP=null,client=null,token='',expires=0,oauthPending=false,connected=false,syncing=false;
 let cardId='',rating='',writing=false,lastUploaded='';
 const el=(type,cls,text)=>{const n=document.createElement(type);if(cls)n.className=cls;if(text!==undefined)n.textContent=String(text);return n;};
 function openDb(){
  if(dbP)return dbP;
  dbP=new Promise((resolve,reject)=>{
   if(!window.indexedDB){reject(Error('IndexedDB indisponível neste navegador.'));return;}
   const req=indexedDB.open(DB_NAME,1);
   req.onupgradeneeded=()=>{if(!req.result.objectStoreNames.contains('attempts'))req.result.createObjectStore('attempts',{keyPath:'id'});};
   req.onsuccess=()=>resolve(req.result);
   req.onerror=()=>reject(req.error||Error('Não foi possível abrir o histórico.'));
   req.onblocked=()=>reject(Error('O histórico está bloqueado por outra aba.'));
  });
  return dbP;
 }
 async function all(){
  const d=await openDb();
  return new Promise((resolve,reject)=>{
   const t=d.transaction('attempts','readonly'),r=t.objectStore('attempts').getAll();
   r.onsuccess=()=>resolve(r.result.sort((a,b)=>String(b.created_at).localeCompare(String(a.created_at))));
   r.onerror=()=>reject(r.error||Error('Falha na leitura.'));
  });
 }
 async function put(row){
  const d=await openDb();
  return new Promise((resolve,reject)=>{
   const t=d.transaction('attempts','readwrite');
   t.objectStore('attempts').put(row);
   t.oncomplete=()=>resolve(row);
   t.onerror=()=>reject(t.error||Error('Não foi possível gravar a tentativa.'));
   t.onabort=()=>reject(t.error||Error('Tentativa não gravada.'));
  });
 }
 function folderOf(raw){
  const v=String(raw||'').trim();
  const match=v.match(/(?:drive\.google\.com\/drive\/(?:u\/\d+\/)?folders\/)([A-Za-z0-9_-]{10,})/);
  const id=match?match[1]:v;
  return FILE_ID.test(id)?id:'';
 }
 function configuredFolder(){try{return folderOf(localStorage.getItem(FOLDER_KEY)||'')}catch{return ''}}
 function draftKey(){return DRAFT_PREFIX+cardId;}
 function getCard(){
  try{return typeof cards!=='undefined'&&Array.isArray(cards)?cards.find(c=>c.id===cardId):null;}catch{return null}
 }
 let modal,controlButton,editor,area,observedTitle;
 function say(text,isError){
  if(!editor)return;
  const s=editor.querySelector('[data-bm195-status]');if(!s)return;
  s.textContent=String(text||'');s.dataset.error=isError?'yes':'no';
 }
 function updateFolder(){
  const input=editor?.querySelector('[data-bm195-folder]');
  if(input&&!input.value)input.value=configuredFolder();
 }
 async function history(){
  if(!editor||editor.hidden||!ID_RE.test(cardId))return;
  const out=editor.querySelector('[data-bm195-history]');if(!out)return;
  out.replaceChildren(el('p','','Carregando tentativas…'));
  try{
   const rows=(await all()).filter(r=>r.card_id===cardId);
   out.replaceChildren();
   out.append(el('p','','Tentativas registradas neste cartão: '+rows.length));
   for(const r of rows.slice(0,30)){
    const details=el('details','bm195-entry');
    const date=new Date(r.created_at).toLocaleString('pt-BR');
    const tag=r.sync_status==='synced'?' · Drive confirmado':' · pendente de Drive';
    details.append(el('summary','',date+' · '+r.rating+tag));
    details.append(el('pre','',r.answer||'(Sem resposta escrita: Errei)'));
    if(r.note)details.append(el('p','','Observações: '+r.note));
    if(r.drive_file_id&&FILE_ID.test(r.drive_file_id)){
     const link=el('a','','Abrir registro no Drive');link.href='https://drive.google.com/file/d/'+encodeURIComponent(r.drive_file_id)+'/view';link.target='_blank';link.rel='noopener noreferrer';details.append(link);
    }
    out.append(details);
   }
   if(rows.length>30)out.append(el('small','','Exibindo as 30 tentativas mais recentes; a exportação inclui todas.'));
  }catch(error){out.replaceChildren(el('p','','Não foi possível ler o histórico: '+error.message));}
 }
 async function exportJson(){
  try{
   const rows=await all();
   const payload={format:'BancoMestreRespostasDiscursivasBackupV195',exported_at:new Date().toISOString(),count:rows.length,attempts:rows};
   const blob=new Blob([JSON.stringify(payload,null,2)],{type:'application/json'});
   const url=URL.createObjectURL(blob),a=el('a');
   a.href=url;a.download='BancoMestre_Respostas_Discursivas_'+new Date().toISOString().slice(0,10)+'.json';
   document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),2000);
   say('Backup exportado: '+rows.length+' tentativas. Guarde o arquivo em segurança.');
  }catch(e){say('Falha ao exportar: '+e.message,true)}
 }
 function selectedRate(v){
  rating=v;editor.querySelectorAll('[data-bm195-rate]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.bm195Rate===v)));
 }
 function setCard(){
  const next=window.BancoMestreVisualizarCardV050?.currentId||'';
  if(!ID_RE.test(next)){
   if(editor)editor.hidden=true;return;
  }
  if(next===cardId)return;
  cardId=next;rating='';selectedRate('');
  if(editor)editor.hidden=true;
  if(controlButton)controlButton.textContent='Responder discursivamente';
  if(area){
   let saved='';try{saved=localStorage.getItem(draftKey())||''}catch{}
   area.value=saved;
  }
 }
 function saveFolder(){
  const input=editor.querySelector('[data-bm195-folder]');
  const id=folderOf(input.value);
  if(!id){say('Cole um link de pasta do Google Drive ou um ID válido.',true);return}
  try{localStorage.setItem(FOLDER_KEY,id);input.value=id;say('Pasta configurada neste navegador. O ID não será publicado no GitHub.');}
  catch(e){say('Não foi possível salvar a configuração local: '+e.message,true)}
 }
 async function save(){
  if(writing||!ID_RE.test(cardId))return;
  const text=area.value;
  if(!rating){say('Escolha Errei, Difícil, Bom ou Fácil antes de salvar.',true);return}
  if(!text.trim()&&rating!=='Errei'){say('Escreva a resposta ou marque Errei para registrar que não soube responder.',true);return}
  const c=getCard();if(!c){say('ID não encontrado na base carregada. Nenhum registro foi criado.',true);return}
  writing=true;
  const button=editor.querySelector('[data-bm195-save]');button.disabled=true;
  try{
   const now=new Date(),rid='BM195-'+(window.crypto?.randomUUID?.()||Date.now()+'-'+Math.random().toString(36).slice(2));
   const row={
    format:FORMAT,id:rid,card_id:cardId,front:String(c.front||''),
    discipline:String(c.discipline||''),subject:String(c.subject||''),sub:String(c.sub||''),
    answer:text,rating,note:String(editor.querySelector('[data-bm195-note]').value||''),
    created_at:now.toISOString(),timezone_offset_min:now.getTimezoneOffset(),
    site_version:'V203',base_version:'V194',mode:'resposta_discursiva',
    audit_status:'pendente_de_confronto_com_base',srs_status:'nao_integrado_ao_srs_canonico',
    sync_status:'pending',drive_file_id:null
   };
   await put(row);
   try{localStorage.removeItem(draftKey())}catch{}
   say('Tentativa salva integralmente neste navegador. '+(connected?'Enviando cópia para o Drive…':'Conecte o Google Drive para confirmar a cópia na pasta.'));
   await history();
   if(connected&&configuredFolder())void syncPending();
  }catch(e){say('A tentativa NÃO foi salva: '+e.message,true)}
  finally{writing=false;button.disabled=false}
 }
 async function readyGoogle(){
  const cfg=await fetch('assets/drive_auth_v038.json',{cache:'no-store'}).then(r=>{if(!r.ok)throw Error('Configuração OAuth indisponível');return r.json()});
  if(!/^[A-Za-z0-9_-]+\.apps\.googleusercontent\.com$/.test(cfg.client_id||''))throw Error('Client ID OAuth inválido');
  if(!window.google?.accounts?.oauth2?.initTokenClient){
   await new Promise((resolve,reject)=>{const script=document.createElement('script');script.src='https://accounts.google.com/gsi/client';script.async=true;script.onload=resolve;script.onerror=()=>reject(Error('Biblioteca de login Google indisponível'));document.head.append(script)});
  }
  client=google.accounts.oauth2.initTokenClient({
   client_id:cfg.client_id,scope:SCOPE,
   callback:resp=>{
    oauthPending=false;
    if(!resp?.access_token||resp.error){say('Autorização Google não concedida: '+(resp?.error||'sem token'),true);return}
    if(resp.scope&&!resp.scope.split(/\s+/).includes(SCOPE)){say('O Google não concedeu a permissão de gravação necessária.',true);return}
    token=resp.access_token;expires=Date.now()+Math.max(60,Number(resp.expires_in||3600)-90)*1000;connected=true;
    say('Google Drive conectado. Sincronizando as tentativas pendentes…');
    void syncPending();
   },
   error_callback:err=>{oauthPending=false;say('Conexão Google cancelada ou indisponível: '+String(err?.type||''),true)}
  });
  editor.querySelector('[data-bm195-connect]').disabled=false;
  say('Pronto para registrar respostas. A primeira conexão ao Drive exige autorização Google.');
 }
 function connect(){
  if(!client){say('A autorização Google ainda não está pronta.',true);return}
  if(oauthPending)return;
  if(connected&&token&&expires>Date.now()){void syncPending();return}
  oauthPending=true;
  try{client.requestAccessToken({prompt:'consent'});}catch(e){oauthPending=false;say('Não foi possível solicitar autorização: '+e.message,true)}
 }
 async function responseJson(resp,label){
  if(!resp.ok){
   if(resp.status===401){token='';connected=false}
   let detail='';try{const d=await resp.json();detail=d.error?.message||''}catch{}
   throw Error(label+' (HTTP '+resp.status+')'+(detail?': '+detail.slice(0,300):''));
  }
  return resp.json();
 }
 async function apiGet(url){
  const r=await fetch(url,{headers:{Authorization:'Bearer '+token},cache:'no-store'});
  return responseJson(r,'Falha ao consultar o Drive');
 }
 function fileName(row){return 'BM195_'+row.card_id+'_'+row.id+'.json';}
 async function existingFile(folder,row){
  const q="'"+folder+"' in parents and name = '"+fileName(row)+"' and trashed = false";
  const url=API+'?'+new URLSearchParams({q,fields:'files(id,name,parents,appProperties),nextPageToken',page_size:'20'}).toString();
  const found=(await apiGet(url)).files||[];
  if(found.length>1)throw Error('Há cópias duplicadas deste evento no Drive; auditoria manual necessária.');
  if(!found.length)return null;
  const file=found[0];
  if(file.appProperties?.bm_attempt_id!==row.id||file.appProperties?.bm_format!==FORMAT)
   throw Error('Arquivo homônimo encontrado sem vínculo válido; não será sobrescrito.');
  return file;
 }
 async function uploadOne(folder,row){
  let remote=await existingFile(folder,row);
  if(!remote){
   const document={format:FORMAT,id:row.id,card_id:row.card_id,front:row.front,
    discipline:row.discipline,subject:row.subject,sub:row.sub,
    answer:row.answer,rating:row.rating,note:row.note,
    created_at:row.created_at,timezone_offset_min:row.timezone_offset_min,
    site_version:row.site_version,base_version:row.base_version,
    audit_status:row.audit_status,srs_status:row.srs_status};
   const blob=new Blob([JSON.stringify(document,null,2)],{type:'application/json'});
   const meta={name:fileName(row),mimeType:'application/json',parents:[folder],
    description:'Resposta discursiva e autoavaliação do cartão '+row.card_id,
    appProperties:{bm_format:FORMAT,bm_attempt_id:row.id,bm_card_id:row.card_id}};
   const init=await fetch(UPLOAD+'?uploadType=resumable&fields=id,name,parents,appProperties',{
    method:'POST',headers:{Authorization:'Bearer '+token,'Content-Type':'application/json; charset=UTF-8',
     'X-Upload-Content-Type':'application/json','X-Upload-Content-Length':String(blob.size)},
    body:JSON.stringify(meta),cache:'no-store'});
   if(!init.ok)await responseJson(init,'Não foi possível iniciar envio ao Drive');
   const loc=init.headers.get('Location');if(!loc)throw Error('O Drive não confirmou a sessão de upload.');
   const dest=new URL(loc);
   if(dest.origin!=='https://www.googleapis.com'||!dest.pathname.startsWith('/upload/drive/v3/files'))
    throw Error('Destino da sessão de upload inesperado; envio interrompido.');
   const sent=await fetch(dest.href,{method:'PUT',headers:{Authorization:'Bearer '+token,'Content-Type':'application/json'},body:blob,cache:'no-store'});
   remote=await responseJson(sent,'O Drive não confirmou o arquivo enviado');
  }
  if(!FILE_ID.test(remote.id))throw Error('ID de arquivo inválido recebido do Drive.');
  const check=await apiGet(API+'/'+encodeURIComponent(remote.id)+'?fields=id,name,parents,appProperties,trashed');
  if(check.id!==remote.id||check.trashed||(check.parents||[]).indexOf(folder)<0||
    check.appProperties?.bm_format!==FORMAT||check.appProperties?.bm_attempt_id!==row.id)
   throw Error('A conferência do arquivo salvo no Drive falhou.');
  await put({...row,sync_status:'synced',drive_file_id:check.id,synced_at:new Date().toISOString()});
  lastUploaded=check.id;
 }
 async function syncPending(){
  if(syncing)return;
  const folder=configuredFolder();
  if(!folder){say('Configure a pasta RESPOSTAS_DISCURSIVAS antes de sincronizar.',true);return}
  if(!token||expires<=Date.now()){connected=false;say('Conecte novamente sua conta Google para salvar as respostas no Drive.',true);return}
  syncing=true;
  try{
   const rows=(await all()).filter(r=>r.sync_status!=='synced');
   if(!rows.length){say('Nenhuma tentativa pendente. Todas as respostas deste navegador já foram confirmadas no Drive.');await history();return}
   let sent=0;
   for(const row of rows){
    say('Enviando '+(sent+1)+' de '+rows.length+' tentativas…');
    try{await uploadOne(folder,row);sent++}
    catch(e){say('Sincronização interrompida após '+sent+' arquivos: '+e.message+'. As tentativas locais foram preservadas.',true);return}
   }
   say('Drive confirmado: '+sent+' tentativa(s) sincronizada(s). O SRS oficial não foi alterado.');
   await history();
  }catch(e){say('Falha na sincronização: '+e.message,true)}
  finally{syncing=false}
 }
 function mount(){
  modal=document.getElementById('bmCardPeekV050');if(!modal)return false;
  const controls=modal.querySelector('.bm163-preview-controls');
  if(!controls)return false;
  if(document.getElementById('bm195Discursive'))return true;
  controlButton=el('button','bm195-open','Responder discursivamente');controlButton.type='button';controls.append(controlButton);
  editor=el('section','bm195-editor');editor.id='bm195Discursive';editor.hidden=true;
  editor.innerHTML=[
   '<h3>Resposta discursiva · <span data-bm195-card></span></h3>',
   '<p>Responda antes de revelar o verso. A tentativa original e sua classificação são preservadas sem substituir o cartão.</p>',
   '<label class="bm195-label">Sua resposta completa<textarea data-bm195-answer rows="7" placeholder="Explique com suas palavras; fórmulas, normas, exemplos e exceções quando necessários."></textarea></label>',
   '<label class="bm195-label">Observações (opcional)<textarea data-bm195-note rows="2" placeholder="Dificuldades, pegadinhas ou pontos para revisar."></textarea></label>',
   '<div class="bm195-label">Sua classificação</div>',
   '<div class="bm195-rates" role="group" aria-label="Autoavaliação">',
   '<button type="button" data-bm195-rate="Errei" aria-pressed="false">Errei</button>',
   '<button type="button" data-bm195-rate="Difícil" aria-pressed="false">Difícil</button>',
   '<button type="button" data-bm195-rate="Bom" aria-pressed="false">Bom</button>',
   '<button type="button" data-bm195-rate="Fácil" aria-pressed="false">Fácil</button></div>',
   '<div class="bm195-actions"><button type="button" data-bm195-save class="bm195-primary">Registrar classificação e resposta</button>',
   '<button type="button" data-bm195-reveal>Conferir verso original</button></div>',
   '<details class="bm195-drive"><summary>Google Drive · configuração e sincronização</summary>',
   '<p>As respostas ficam primeiro no navegador. Para copiá-las para a pasta RESPOSTAS_DISCURSIVAS, cole o link da pasta uma vez, conecte sua conta e sincronize. Não publica respostas no GitHub.</p>',
   '<label class="bm195-label">Link ou ID da pasta de respostas no Drive<input data-bm195-folder placeholder="https://drive.google.com/drive/folders/…"></label>',
   '<div class="bm195-actions"><button type="button" data-bm195-folder-save>Salvar destino</button>',
   '<button type="button" data-bm195-connect disabled>Conectar Google Drive</button>',
   '<button type="button" data-bm195-sync>Sincronizar pendentes</button></div>',
   '<small>A conexão pode solicitar permissão ampla de arquivos do Drive para gravar na pasta existente; nunca armazena o token de acesso.</small></details>',
   '<div class="bm195-actions"><button type="button" data-bm195-export>Exportar todas as tentativas (.json)</button>',
   '<button type="button" data-bm195-history-toggle>Mostrar histórico deste cartão</button></div>',
   '<p data-bm195-status role="status" aria-live="polite">Preparando armazenamento local…</p>',
   '<div data-bm195-history hidden></div>',
   '<small>Auditoria posterior pelo ChatGPT, mediante leitura dos arquivos no Drive. A nota não recalcula o SRS canônico automaticamente.</small>'
  ].join('');
  controls.insertAdjacentElement('afterend',editor);
  area=editor.querySelector('[data-bm195-answer]');
  controlButton.addEventListener('click',()=>{
   setCard();
   editor.hidden=!editor.hidden;
   controlButton.textContent=editor.hidden?'Responder discursivamente':'Fechar resposta discursiva';
   if(!editor.hidden){editor.querySelector('[data-bm195-card]').textContent=cardId;updateFolder();area.focus();void history();}
  });
  area.addEventListener('input',()=>{try{localStorage.setItem(draftKey(),area.value)}catch{}});
  editor.querySelectorAll('[data-bm195-rate]').forEach(b=>b.addEventListener('click',()=>selectedRate(b.dataset.bm195Rate)));
  editor.querySelector('[data-bm195-save]').addEventListener('click',save);
  editor.querySelector('[data-bm195-reveal]').addEventListener('click',()=>modal.querySelector('.bm-v050-peek-reveal')?.click());
  editor.querySelector('[data-bm195-folder-save]').addEventListener('click',saveFolder);
  editor.querySelector('[data-bm195-connect]').addEventListener('click',connect);
  editor.querySelector('[data-bm195-sync]').addEventListener('click',syncPending);
  editor.querySelector('[data-bm195-export]').addEventListener('click',exportJson);
  editor.querySelector('[data-bm195-history-toggle]').addEventListener('click',()=>{
   const target=editor.querySelector('[data-bm195-history]');target.hidden=!target.hidden;
   editor.querySelector('[data-bm195-history-toggle]').textContent=target.hidden?'Mostrar histórico deste cartão':'Ocultar histórico deste cartão';
   if(!target.hidden)void history();
  });
  observedTitle=modal.querySelector('#bmCardPeekTitleV050');
  const obs=new MutationObserver(setCard);
  if(observedTitle)obs.observe(observedTitle,{childList:true,characterData:true,subtree:true});
  obs.observe(modal,{attributes:true,attributeFilter:['hidden']});
  void openDb().then(()=>say('Armazenamento de respostas pronto. Conecte o Drive para criar cópias na pasta.')).catch(e=>say('Não foi possível habilitar o armazenamento: '+e.message,true));
  void readyGoogle().catch(e=>say('A conexão ao Drive está indisponível: '+e.message+'. Exportação local ainda disponível.',true));
  setCard();
  return true;
 }
 window.BM195Discursivas=Object.freeze({version:'V195',get modalReady(){return !!editor},get linkedFolder(){return !!configuredFolder()},exportar:exportJson,sincronizar:syncPending});
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{if(!mount()){const m=new MutationObserver(()=>{if(mount())m.disconnect()});m.observe(document.body,{childList:true,subtree:true})}},{once:true});
 else if(!mount()){const m=new MutationObserver(()=>{if(mount())m.disconnect()});m.observe(document.body,{childList:true,subtree:true})}
})();
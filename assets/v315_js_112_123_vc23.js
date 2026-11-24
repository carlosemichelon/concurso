/* V315 · IIFE módulos preservados · índices 112–123 */

;
/* 114 assets/v225_drive_reconnect.js */
/* V225 — uma ação clara para renovar Google Drive.
 * Token OAuth permanece apenas em memória: nunca copiar para localStorage/cookie/GitHub. */
(function(){
'use strict';
if(window.BM225DriveConnection)return;
const $=id=>document.getElementById(id);
let mounted=false;
const core=()=>window.BancoMestreMediaSyncV182;
const driver=()=>window.BancoMestreDriveV042||window.BancoMestreDriveV038;
const connected=()=>Boolean(core()?.token?.());
function update(){
 for(const x of document.querySelectorAll('.bm225-drive-auth')){
  const span=x.querySelector('[data-state]'),button=x.querySelector('button');
  if(!span||!button)continue;
  const yes=connected();
  x.dataset.connected=yes?'yes':'no';
  span.textContent=yes
   ?'Google Drive conectado nesta visita · imagens e PDFs compartilham o acesso'
   :'Google Drive desconectado · os arquivos privados exigem autorização';
  button.hidden=yes;button.disabled=yes;
  button.textContent='Conectar / renovar Drive';
 }
}
function promptForDrive(){
 const d=driver();
 if(d?.ready&&typeof d.authorize==='function'){
  d.authorize();update();return true;
 }
 if(d?.prepare){
  const p=d.prepare();
  Promise.resolve(p).finally(()=>{
   for(const box of document.querySelectorAll('.bm225-drive-auth [data-state]'))
    if(!connected())box.textContent='Google pronto. Clique novamente em Conectar / renovar Drive.';
  });
 }
 return false;
}
function mountTo(panel,position){
 if(!panel||panel.querySelector('.bm225-drive-auth'))return;
 const wrap=document.createElement('div');wrap.className='bm225-drive-auth';
 wrap.setAttribute('aria-label','Conexão de imagens e PDFs');
 const text=document.createElement('span');text.dataset.state='1';text.setAttribute('role','status');
 const button=document.createElement('button');button.type='button';
 button.textContent='Conectar / renovar Drive';button.onclick=promptForDrive;
 wrap.append(text,button);
 const anchor=panel.querySelector(position);
 if(anchor)anchor.before(wrap);else panel.prepend(wrap);
}
function init(){
 if(mounted)return;mounted=true;
 const style=document.createElement('style');
 style.textContent=[
 '.bm225-drive-auth{display:flex;gap:8px;flex-wrap:wrap;align-items:center;justify-content:space-between;border:1px solid #cadbd9;border-radius:8px;background:#f7faf9;padding:8px 10px;margin:8px 0;font-size:12px;color:#405d61}',
 '.bm225-drive-auth[data-connected="no"]{background:#fffdf9}',
 '.bm225-drive-auth button{font-size:12px;padding:6px 10px;border-radius:7px;min-height:32px}',
 '.bm225-drive-auth button[hidden]{display:none!important}'
 ].join('\n');document.head.append(style);
 mountTo($('cartoes')?.querySelector('.panel'),'.controls');
 mountTo($('imagens')?.querySelector('.panel'),'.controls');
 mountTo($('pdfs')?.querySelector('.panel'),'.controls');
 document.addEventListener('bm-media-drive-authorized',update);
 window.addEventListener('focus',update);
 document.addEventListener('visibilitychange',()=>{if(!document.hidden)update();});
 setInterval(update,30000);
 update();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
window.BM225DriveConnection=Object.freeze({update,promptForDrive,get connected(){return connected()}});
})();

;
/* 115 assets/v245_controle_native.js */
/* Banco Mestre V240 — aba NATIVA; montagem em Shadow DOM, sem iframe, dados privados locais. */
(function(){
'use strict';
if(window.BM240NativeStudy)return;
let installing=null;
function installMobileRegisterCollapse(root){
 const form=root.getElementById('sessionForm');
 const panel=form?.closest('.panel');
 const heading=panel?.querySelector('h2');
 if(!form||!heading||root.getElementById('bm311-manual-toggle'))return;
 const style=document.createElement('style');
 style.textContent=`
 @media(max-width:760px){
  #registro #bm311-manual-toggle{display:block;width:100%;min-height:42px;margin:9px 0 2px;
   text-align:left;border:1px solid #b8d4d1;border-radius:9px;padding:10px 12px;
   font-weight:750;color:#185d63;background:#f1f8f7;touch-action:manipulation}
  #registro .bm311-manual-closed #sessionForm{display:none!important}
 }
 @media(min-width:761px){#registro #bm311-manual-toggle{display:none!important}}
 `;
 root.append(style);
 const toggle=document.createElement('button');
 toggle.type='button';
 toggle.id='bm311-manual-toggle';
 toggle.setAttribute('aria-controls','sessionForm');
 heading.after(toggle);
 let expanded=false;
 const media=window.matchMedia('(max-width:760px)');
 const sync=()=>{
  const closed=media.matches&&!expanded;
  panel.classList.toggle('bm311-manual-closed',closed);
  toggle.textContent=closed?'▾ Mostrar registro manual':'▴ Recolher registro manual';
  toggle.setAttribute('aria-expanded',String(!closed));
 };
 toggle.addEventListener('click',()=>{expanded=!expanded;sync()});
 // Editar uma sessão histórica abre o formulário antes de navegar até ele.
 root.addEventListener('click',event=>{
  if(event.target.closest('[data-edit-session]')){expanded=true;sync()}
 },true);
 if(media.addEventListener)media.addEventListener('change',sync);
 else media.addListener(sync);
 sync();
}
const mount=async()=>{
 const nav=document.querySelector('header nav[aria-label="Seções"]')||document.querySelector('header nav');
 const main=document.querySelector('main');
 if(!nav||!main)throw Error('Menu principal indisponível');
 if(document.getElementById('bm240-study-tab'))return;
 const button=document.createElement('button');
 button.type='button';button.id='bm240-study-tab';button.dataset.page='controle-estudos';
 button.textContent='Controle de Estudos';
 button.title='Cronômetro manual, calendário, planejamentos e relatórios';
 nav.insertBefore(button,nav.firstElementChild);
 const section=document.createElement('section');
 section.id='controle-estudos';section.className='bm240-study-section';
 const host=document.createElement('div');host.id='bm240-native-host';host.style.cssText='background:#f6f9f9;border:1px solid #d7e5e4;border-radius:12px;overflow:hidden;min-height:360px';
 section.append(host);main.append(section);
 const root=host.attachShadow({mode:'open'});
 const loading=document.createElement('p');loading.textContent='Carregando Controle de Estudos...';loading.style.padding='25px';
 root.append(loading);
 button.addEventListener('click',()=>{
   // A base relativa ../ do staging exige manter o caminho aninhado ao navegar.
   // Não chamar o roteador legado nesta aba de homologação: sua URL hash é resolvida na raiz.
   if(typeof window.section==='function'&&!location.pathname.includes('/homologacao-v243/')){
    window.section('controle-estudos');
   }else{
    document.querySelectorAll('main>section').forEach(s=>s.classList.toggle('active',s===section));
    document.querySelectorAll('header nav button[data-page]').forEach(b=>b.classList.toggle('active',b===button));
    location.hash='controle-estudos';
   }
 });
 // Rota e seleção precisam coincidir: o bootstrap da V242 pode reativar "Assuntos"
 // depois da montagem nativa. Vigiar somente as classes das seções de topo.
 const alignNativeRoute=()=>{
  if(location.hash!=='#controle-estudos')return;
  const active=document.querySelector('main>section.active');
  if(active===section&&button.classList.contains('active'))return;
  document.querySelectorAll('main>section').forEach(s=>s.classList.toggle('active',s===section));
  document.querySelectorAll('header nav button[data-page]').forEach(b=>b.classList.toggle('active',b===button));
 };
 const routeObserver=new MutationObserver(alignNativeRoute);
 for(const page of main.querySelectorAll(':scope>section')){
  routeObserver.observe(page,{attributes:true,attributeFilter:['class']});
 }
 window.addEventListener('hashchange',alignNativeRoute);

 try{
  const response=await fetch('./controle-estudos-v245.html?ref=245',{cache:'no-cache'});
  if(!response.ok)throw Error('Interface indisponível ('+response.status+')');
  const doc=new DOMParser().parseFromString(await response.text(),'text/html');
  if(!doc.getElementById('tabs')||!doc.getElementById('sessionForm')||!doc.getElementById('calGrid'))throw Error('Estrutura de interface incompleta');
  const style=document.createElement('style');
  style.textContent=doc.querySelector('style')?.textContent||'';

  root.replaceChildren(style);
  for(const element of [...doc.body.children]){
   if(element.tagName!=='SCRIPT')root.append(element);
  }
  await new Promise((resolve,reject)=>{
   if(typeof window.BM240ControlInit==='function')return resolve();
   const script=document.createElement('script');
   script.src='assets/v245_controle_app.js?v=245';
   script.onload=resolve;script.onerror=()=>reject(Error('Módulo de estudos não carregou'));
   document.head.append(script);
  });
  window.BM240ControlInit(root);
  installMobileRegisterCollapse(root);
  window.BancoMestreIconsV096?.refresh?.();
  document.dispatchEvent(new CustomEvent('bm240-study-mounted'));
 }catch(e){
  root.replaceChildren(loading);loading.textContent='Não foi possível carregar o Controle de Estudos: '+e.message;
  loading.setAttribute('role','alert');console.error('V240 Controle:',e);
 }
 const hash=location.hash;
 const explicit=Boolean(hash&&hash!=='#');
 const q=new URLSearchParams(location.search);
 const deep=q.has('cartao')||q.has('tema')||q.has('pdf');
 if(window.BM240OpenStudyDefault===true||hash==='#controle-estudos'||(!explicit&&!deep))button.click();
};
function start(){if(!installing)installing=mount().catch(e=>console.error('V240 montagem:',e));return installing}
window.BM240NativeStudy=Object.freeze({start});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();

;
/* 116 assets/v245_reconcile.js */
/* V240 — conciliação 3-vias conservadora. NÃO grava Drive, SRS ou outros dados. */
(function(global){
'use strict';
function equal(a,b){return JSON.stringify(a)===JSON.stringify(b)}
function copy(a){return a===undefined?undefined:JSON.parse(JSON.stringify(a))}
const COLLECTIONS=['subjects','sessions','reviews','plans','audit'];
const SCALARS=['cycle','cycleIndex','availabilityWeek','availabilityMonth','activeTimer'];
function validate(doc){
 if(!doc||doc.schema!==1)return 'Esquema inválido';
 for(const key of ['subjects','sessions','reviews','cycle'])
  if(!Array.isArray(doc[key]))return 'Coleção obrigatória inválida: '+key;
 for(const key of ['plans','audit'])
  if(doc[key]!==undefined&&!Array.isArray(doc[key]))return 'Coleção opcional inválida: '+key;
 for(const key of COLLECTIONS){
  const seen=new Set();
  for(const item of doc[key]||[]){
   if(!item||typeof item.id!=='string'||!item.id||seen.has(item.id))return 'ID duplicado ou inválido em '+key;
   seen.add(item.id);
  }
 }
 const subjects=new Set(doc.subjects.map(x=>x.id));
 for(const key of ['sessions','reviews','plans'])
  for(const item of doc[key]||[]){
   if(item.subjectId!==undefined&&!subjects.has(item.subjectId))
    return 'Referência inválida: '+key+'/'+item.id+' → '+item.subjectId;
  }
 return null;
}
function reconcile(base,local,remote){
 const bad=[base,local,remote].map(validate);
 if(bad.some(Boolean))return {ok:false,conflicts:bad.map((x,i)=>x?['base','local','remote'][i]+': '+x:null).filter(Boolean),merged:null};
 const conflicts=[],out={schema:1};
 const sources={base,local,remote};
 for(const key of COLLECTIONS){
  const maps=Object.fromEntries(Object.entries(sources).map(([name,doc])=>[name,new Map((doc[key]||[]).map(x=>[x.id,x]))]));
  const ids=new Set([...maps.base.keys(),...maps.local.keys(),...maps.remote.keys()]);
  out[key]=[];
  for(const id of ids){
   const b=maps.base.get(id),l=maps.local.get(id),r=maps.remote.get(id);
   const changedL=!equal(b,l),changedR=!equal(b,r);
   if(changedL&&changedR&&!equal(l,r)){
    conflicts.push(key+'/'+id+' alterado de maneiras diferentes');continue;
   }
   const chosen=changedL?l:changedR?r:b;
   if(chosen!==undefined)out[key].push(copy(chosen));
  }
 }
 for(const key of SCALARS){
  const b=base[key],l=local[key],r=remote[key];
  const changedL=!equal(b,l),changedR=!equal(b,r);
  if(changedL&&changedR&&!equal(l,r)){
   conflicts.push(key+' modificado de maneiras diferentes');continue;
  }
  const selected=changedL?l:changedR?r:b;
  if(selected!==undefined)out[key]=copy(selected);
 }
 // New optional fields require an explicit schema upgrade; never silently discard.
 const known=new Set(['schema',...COLLECTIONS,...SCALARS]);
 for(const key of new Set([...Object.keys(base),...Object.keys(local),...Object.keys(remote)])){
  if(known.has(key))continue;
  const b=base[key],l=local[key],r=remote[key];
  if(!equal(b,l)||!equal(b,r))conflicts.push('Campo desconhecido divergente: '+key);
  else out[key]=copy(b);
 }
 const invalid=validate(out);
 if(invalid)conflicts.push('Resultado não atende integridade: '+invalid);
 return {ok:conflicts.length===0,conflicts,merged:conflicts.length?null:out,
  summary:conflicts.length?conflicts.length+' conflito(s) impeditivo(s)':'Alterações independentes conciliáveis, mediante verificação do Drive'};
}
global.BM240Reconcile=Object.freeze({reconcile,validate});
})(window);


;
/* 117 assets/v245_controle_drive_sync.js */
/* V240 — sincronização conservadora do Controle de Estudos.
   Um único arquivo privado no Drive; sem mesclagem destrutiva.
   A base de cartões, SRS, PDFs e originais NÃO são alterados aqui. */
(function(){
'use strict';
if(window.BM240ControlDrive)return;
const KEY='BM245_CONTROLE_ESTUDOS',BASE='BM245_CONTROLE_DRIVE_BASE_SHA256',
 CLOCK='BM245_CONTROLE_TIMER',SNAPSHOT='BM245_CONTROLE_VERIFIED_BASE_DOC',KIND='bm_controle_estudos_v245',
 API='https://www.googleapis.com/drive/v3/files', UPLOAD='https://www.googleapis.com/upload/drive/v3/files',
 MAX=10000000;
const valid=d=>d&&d.schema===1&&['subjects','sessions','reviews','cycle'].every(x=>Array.isArray(d[x]))&&(!d.plans||Array.isArray(d.plans))&&(!d.audit||Array.isArray(d.audit));
const empty=d=>!d.subjects.length&&!d.sessions.length&&!d.reviews.length&&!d.cycle.length&&!(d.plans||[]).length&&
 (!d.cycleIndex)&&Number(d.availabilityWeek??15)===15&&Number(d.availabilityMonth??60)===60;
function localData(){
 const raw=localStorage.getItem(KEY);
 if(!raw)return {schema:1,subjects:[],sessions:[],reviews:[],plans:[],audit:[],cycle:[],cycleIndex:0,availabilityWeek:15,availabilityMonth:60};
 const d=JSON.parse(raw);if(!valid(d))throw Error('Controle local inválido: não substituir o arquivo');return d;
}
async function sha(data){
 const bytes=new TextEncoder().encode(JSON.stringify(data));
 const hash=new Uint8Array(await crypto.subtle.digest('SHA-256',bytes));
 return Array.from(hash,b=>b.toString(16).padStart(2,'0')).join('');
}
function rememberVerified(data,hash){
 const originalSnapshot=localStorage.getItem(SNAPSHOT);
 const originalHash=localStorage.getItem(BASE);
 try{
  localStorage.setItem(SNAPSHOT,JSON.stringify(data));
  localStorage.setItem(BASE,hash);
 }catch(e){
  try{
   if(originalSnapshot===null)localStorage.removeItem(SNAPSHOT);else localStorage.setItem(SNAPSHOT,originalSnapshot);
   if(originalHash===null)localStorage.removeItem(BASE);else localStorage.setItem(BASE,originalHash);
  }catch(_){}
  throw Error('Gravação no Drive verificada, mas marco de sincronização local falhou; preserve o backup: '+e.message);
 }
}
async function req(token,url,options={}){
 if(!token)throw Error('Drive desconectado');
 const r=await fetch(url,{...options,cache:'no-store',headers:{Authorization:'Bearer '+token,...options.headers}});
 if(!r.ok)throw Error('Drive HTTP '+r.status+(r.status===403?' (permissão de gravação ausente)':''));
 return r;
}
async function locate(token){
 const u=new URL(API);
 u.searchParams.set('q',"trashed = false and appProperties has { key='bm_kind' and value='"+KIND+"' }");
 u.searchParams.set('fields','nextPageToken,incompleteSearch,files(id,name,size,version,modifiedTime,appProperties)');
 u.searchParams.set('pageSize','100');
 const q=await (await req(token,u.href)).json();
 if(q.incompleteSearch||q.nextPageToken)throw Error('Busca incompleta; nenhum dado foi gravado');
 const files=(q.files||[]).filter(f=>f.appProperties?.bm_kind===KIND);
 if(files.length>1)throw Error('Dois arquivos mestres encontrados; conflito preservado para auditoria');
 return files[0]||null;
}
async function get(token,file){
 const response=await req(token,API+'/'+encodeURIComponent(file.id)+'?alt=media');
 const raw=await response.text();
 if(raw.length>MAX)throw Error('Arquivo de controle excede 10 MB');
 const doc=JSON.parse(raw);
 if(doc.format!=='BancoMestreControleDriveV245'||!valid(doc.data))throw Error('Mestre remoto com esquema diferente');
 return doc.data;
}
async function confirmRead(token,id,expected){
 const saved=await get(token,{id});
 if(await sha(saved)!==expected)throw Error('A conferência pós-gravação não confirmou os dados');
}
async function create(token,d,hash){
 const payload=JSON.stringify({format:'BancoMestreControleDriveV245',updatedAt:new Date().toISOString(),data:d});
 if(payload.length>MAX)throw Error('Controle local excede 10 MB');
 const meta={name:'BancoMestre_Controle_Estudos_V245.json',mimeType:'application/json',
  appProperties:{bm_kind:KIND,bm_schema:'V245'}};
 const boundary='bm239-'+crypto.randomUUID();
 const body='--'+boundary+'\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n'+JSON.stringify(meta)+
   '\r\n--'+boundary+'\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n'+payload+
   '\r\n--'+boundary+'--';
 const r=await req(token,UPLOAD+'?uploadType=multipart&fields=id,name,version,appProperties',
  {method:'POST',headers:{'Content-Type':'multipart/related; boundary='+boundary},body});
 const out=await r.json();if(!out.id||out.appProperties?.bm_kind!==KIND)throw Error('Criação remota não confirmada');
 await confirmRead(token,out.id,hash);return out;
}
async function update(token,file,d,hash){
 const latest=await (await req(token,API+'/'+encodeURIComponent(file.id)+'?fields=id,version,appProperties')).json();
 if(latest.id!==file.id||String(latest.version)!==String(file.version)||latest.appProperties?.bm_kind!==KIND)
  throw Error('Mestre alterado por outro dispositivo: nenhuma substituição realizada');
 const payload=JSON.stringify({format:'BancoMestreControleDriveV245',updatedAt:new Date().toISOString(),data:d});
 if(payload.length>MAX)throw Error('Controle local excede 10 MB');
 const r=await req(token,UPLOAD+'/'+encodeURIComponent(file.id)+'?uploadType=media&fields=id,version',
  {method:'PATCH',headers:{'Content-Type':'application/json; charset=UTF-8'},body:payload});
 const out=await r.json();if(out.id!==file.id)throw Error('Atualização sem ID confirmado');
 await confirmRead(token,file.id,hash);return out;
}
function safeImport(d){
 let clock=null;try{clock=JSON.parse(localStorage.getItem(CLOCK)||'null')}catch(_){}
 if(clock?.running||Number(clock?.elapsed)>0)throw Error('Cronômetro com tempo não salvo: encerre ou descarte antes de importar o controle remoto');
 const old=localStorage.getItem(KEY);
 if(old){
  const id='BM245_CONTROLE_RECUPERACAO_'+new Date().toISOString().replace(/[:.]/g,'-');
  localStorage.setItem(id,old);
 }
 localStorage.setItem(KEY,JSON.stringify(d));
 // O Controle nativo é atualizado pela sua API, sem iframe.
 window.BM240ControlApp?.reload?.();
}
function status(text){const el=document.getElementById('bm239-sync-details');if(el)el.title=text;}
let running=null,lastResult=null;
async function work(token){
 if(!crypto?.subtle)throw Error('Conferência SHA-256 indisponível neste navegador');
 const original=localData(),localHash=await sha(original),baseline=localStorage.getItem(BASE);
 const file=await locate(token);
 if(!file){
  if(empty(original))return {state:'empty',message:'Controle: sem registros locais para enviar'};
  const before=await locate(token);
  if(before)throw Error('Outro dispositivo criou o mestre durante a consulta');
  await create(token,original,localHash);
  rememberVerified(original,localHash);
  return {state:'uploaded',message:'Controle: mestre privado criado e verificado'};
 }
 const remote=await get(token,file),remoteHash=await sha(remote);
 if(localHash===remoteHash){
  rememberVerified(original,localHash);
  return {state:'unchanged',message:'Controle: dados conferidos, sem diferenças'};
 }
 // Primeiro uso em outro dispositivo: só importar se o Controle local estiver vazio.
 if((baseline&&localHash===baseline)||(!baseline&&empty(original))){
  if(await sha(localData())!==localHash)throw Error('Controle local mudou durante o download');
  safeImport(remote);
  rememberVerified(remote,remoteHash);
  return {state:'downloaded',message:'Controle: registros remotos importados, cópia local anterior preservada'};
 }
 // Alteração local sobre uma base remota conhecida.
 if(baseline&&remoteHash===baseline){
  if(await sha(localData())!==localHash)throw Error('Controle local mudou durante a sincronização');
  await update(token,file,original,localHash);
  rememberVerified(original,localHash);
  return {state:'uploaded',message:'Controle: alterações enviadas e verificadas no Drive'};
 }
 const preview=await inspectConflict(token,{file,remote,local:original,localHash,remoteHash,baseline});
 status(preview.message);
 return preview;
}
async function inspectConflict(token,known){
 const file=known?.file||await locate(token);
 if(!file)return {state:'empty',message:'Ainda não existe arquivo de homologação no Drive'};
 const local=known?.local||localData();
 const remote=known?.remote||await get(token,file);
 const localHash=known?.localHash||await sha(local);
 const remoteHash=known?.remoteHash||await sha(remote);
 const baseline=known?.baseline??localStorage.getItem(BASE);
 if(localHash===remoteHash)return {state:'unchanged',message:'Controle: cópias local e remota idênticas'};
 if(!baseline||baseline==='RESTORE_REQUIRES_RECONCILIATION')
  return {state:'conflict',message:'Controle: não há base comum verificada (ou existe restauração pendente); nenhuma gravação automática',conflicts:['Sem base comum confirmada']};
 const raw=localStorage.getItem(SNAPSHOT);
 if(!raw)return {state:'conflict',message:'Controle: instantâneo-base indisponível. Exporte cópias e reconcilie manualmente.',conflicts:['Sem instantâneo-base']};
 let base;
 try{base=JSON.parse(raw)}catch{return {state:'conflict',message:'Instantâneo-base inválido. Nenhum dado será substituído',conflicts:['Base corrompida']}}
 if(await sha(base)!==baseline)
  return {state:'conflict',message:'Hash do instantâneo-base divergente. Conciliação bloqueada.',conflicts:['Falha de integridade da base']};
 const candidate=window.BM240Reconcile?.reconcile(base,local,remote);
 if(!candidate)return {state:'error',message:'Conciliador de conflitos V240 não carregado'};
 if(!candidate.ok)return {state:'conflict',message:'Controle: '+candidate.conflicts.length+' conflito(s) específicos — nenhuma substituição.',conflicts:candidate.conflicts.slice(0,60)};
 return {state:'merge_ready',message:'Controle: alterações independentes conciliáveis. Confirme a operação na aba Backup antes de gravar.',conflicts:[],localHash,remoteHash};
}
async function mergeSafe(token){
 if(running)throw Error('Sincronização em andamento. Conclua-a antes de conciliar.');
 const file=await locate(token);
 if(!file)throw Error('Mestre de homologação não localizado');
 const local=localData(),remote=await get(token,file);
 const preview=await inspectConflict(token,{file,local,remote});
 if(preview.state!=='merge_ready')throw Error(preview.message);
 const timerRaw=localStorage.getItem(CLOCK);
 if(timerRaw){
  let clock;
  try{clock=JSON.parse(timerRaw)}catch{throw Error('Cronômetro local inválido; conciliação suspensa')}
  if(clock?.running||Number(clock?.elapsed)>0||clock?.transferPending||clock?.availableForTransfer)
   throw Error('Há sessão em curso ou transferência pendente: salve-a antes de conciliar');
 }
 const base=JSON.parse(localStorage.getItem(SNAPSHOT));
 const candidate=window.BM240Reconcile.reconcile(base,local,remote);
 if(!candidate.ok)throw Error('Conflito surgiu na segunda verificação');
 const hash=await sha(candidate.merged),beforeLocal=await sha(local),beforeRemote=await sha(remote);
 if(beforeLocal!==preview.localHash||beforeRemote!==preview.remoteHash)
  throw Error('Os originais mudaram durante a auditoria: operação interrompida');
 const preserved=await window.BM240StudyBackups?.preservePremerge(token,remote,local);
 if(!Array.isArray(preserved)||preserved.length!==2)
  throw Error('Não foi possível verificar os dois backups originais. Nenhum envio realizado.');
 if(await sha(localData())!==beforeLocal)
  throw Error('Registros locais alterados durante backups: nenhum envio realizado.');
 await update(token,file,candidate.merged,hash);
 safeImport(candidate.merged);
 rememberVerified(candidate.merged,hash);
 const report={state:'merged',message:'Controle: alterações independentes conciliadas e verificadas; 2 originais preservados no Drive',backups:preserved.map(x=>x.id)};
 lastResult=report;
 document.dispatchEvent(new CustomEvent('bm240-control-verified',{detail:{state:'merged'}}));
 return report;
}
async function verifyTimerOwnership(token,sessionId,ownerId){
 if(!token||!sessionId||!ownerId)return false;
 const file=await locate(token);
 if(!file)return false;
 const d=await get(token,file),a=d.activeTimer;
 return Boolean(a&&a.sessionId===sessionId&&a.ownerId===ownerId&&a.availableForTransfer&&!a.running);
}
async function sync(token){
 if(running)return running;
 running=work(token).then(r=>{
 lastResult=r;
 if(['uploaded','downloaded','unchanged'].includes(r?.state))
  document.dispatchEvent(new CustomEvent('bm240-control-verified',{detail:{state:r.state}}));
 return r;
 }).catch(e=>{
   lastResult={state:'error',message:'Controle: '+e.message};return lastResult
 }).finally(()=>running=null);
 return running;
}
window.BM240ControlDrive=Object.freeze({sync,inspectConflict,mergeSafe,verifyTimerOwnership,get lastResult(){return lastResult}});
})();

;
/* 118 assets/v245_backup_drive.js */
/* V240 — backups privados 30 diários + 12 mensais, somente após sync verificado. */
(function(){
'use strict';
if(window.BM240StudyBackups)return;
const API='https://www.googleapis.com/drive/v3/files',
UP='https://www.googleapis.com/upload/drive/v3/files',
KEY='BM245_CONTROLE_ESTUDOS',
KIND='bm_controle_estudos_v245_backup',MAX=10_000_000;
let ongoing=null,lastResult=null;
async function request(token,url,options={}){
 if(!token)throw Error('Token de escrita não disponível');
 const r=await fetch(url,{...options,cache:'no-store',
 headers:{Authorization:'Bearer '+token,...options.headers}});
 if(!r.ok)throw Error('Backup Drive HTTP '+r.status);
 return r;
}
async function digest(d){
 const b=new TextEncoder().encode(JSON.stringify(d));
 return [...new Uint8Array(await crypto.subtle.digest('SHA-256',b))].map(x=>x.toString(16).padStart(2,'0')).join('');
}
function local(){
 const raw=localStorage.getItem(KEY);
 if(!raw)return null;
 const d=JSON.parse(raw);
 if(d.schema!==1||!Array.isArray(d.sessions)||!Array.isArray(d.subjects)||!Array.isArray(d.reviews))throw Error('Dados locais inválidos; backup não criado');
 return d;
}
async function list(token){
 const u=new URL(API);
 u.searchParams.set('q',"trashed = false and appProperties has { key='bm_kind' and value='"+KIND+"' }");
 u.searchParams.set('fields','nextPageToken,incompleteSearch,files(id,name,createdTime,appProperties)');
 u.searchParams.set('pageSize','1000');
 const resp=await (await request(token,u.href)).json();
 if(resp.incompleteSearch||resp.nextPageToken)throw Error('Lista de backups incompleta. Exclusão e criação suspensas');
 return (resp.files||[]).filter(f=>f.appProperties?.bm_kind===KIND);
}
async function verified(token,id,hash){
 const r=await request(token,API+'/'+encodeURIComponent(id)+'?alt=media');
 const text=await r.text();
 if(text.length>MAX)throw Error('Backup remoto excede o limite de verificação');
 const doc=JSON.parse(text);
 if(doc.format!=='BancoMestreControleBackupV245'||doc.sha256!==hash||await digest(doc.data)!==hash)
  throw Error('Falha na auditoria SHA-256 da cópia remota');
 if(!doc.data||doc.data.schema!==1||!['subjects','sessions','reviews','cycle'].every(k=>Array.isArray(doc.data[k])))
  throw Error('Cópia remota com estrutura incompatível');
 for(const k of ['subjects','sessions','reviews']){
  const ids=new Set();
  for(const row of doc.data[k]){
   if(!row||typeof row.id!=='string'||ids.has(row.id))throw Error('IDs duplicados ou ausentes na cópia remota: '+k);
   ids.add(row.id);
  }
 }
 return doc.data;
}
async function create(token,data,period,day,hash){
 const payload=JSON.stringify({format:'BancoMestreControleBackupV245',createdAt:new Date().toISOString(),period,day,sha256:hash,data});
 if(payload.length>MAX)throw Error('Backup excede 10MB; exporte uma cópia manual e revise o acervo');
 const meta={name:'BancoMestre_Controle_V245_'+period+'_'+day+'.json',mimeType:'application/json',
 appProperties:{bm_kind:KIND,bm_period:period,bm_day:day,bm_sha256:hash}};
 const boundary='bm240-'+crypto.randomUUID();
 const body='--'+boundary+'\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n'+JSON.stringify(meta)+
 '\r\n--'+boundary+'\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n'+payload+'\r\n--'+boundary+'--';
 const r=await request(token,UP+'?uploadType=multipart&fields=id,name,appProperties',
  {method:'POST',headers:{'Content-Type':'multipart/related; boundary='+boundary},body});
 const out=await r.json();
 if(!out.id||out.appProperties?.bm_kind!==KIND)throw Error('Drive não confirmou a criação');
 await verified(token,out.id,hash);
 return out;
}
async function prune(token,entries,period,limit){
 const group=entries.filter(f=>f.appProperties?.bm_period===period).sort((a,b)=>
  String(b.appProperties?.bm_day||'').localeCompare(String(a.appProperties?.bm_day||''))||
  String(b.createdTime||'').localeCompare(String(a.createdTime||'')));
 const keep=new Set(group.slice(0,limit).map(x=>x.id));
 let removed=0;
 for(const f of group.slice(limit)){
  if(keep.has(f.id))continue;
  // Only backups bearing exact V240 appProperties are rotated. Never touch the master.
  await request(token,API+'/'+encodeURIComponent(f.id),{method:'DELETE'});removed++;
 }
 return removed;
}
function dayKey(){
 const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
}
async function work(token){
 if(!crypto?.subtle)throw Error('SHA-256 indisponível');
 const d=local();
 if(!d)return {state:'empty',message:'Backup: sem controle local para proteger'};
 const hash=await digest(d),day=dayKey(),month=day.slice(0,7);
 const existing=await list(token);
 const added=[];
 for(const [period,key] of [['daily',day],['monthly',month]]){
  const matches=existing.filter(f=>f.appProperties?.bm_period===period&&f.appProperties?.bm_day===key);
  if(matches.length>1)throw Error('Backups duplicados para '+period+' '+key+'; intervenção necessária antes de prosseguir');
  if(matches.length===1){
   // An existing dated backup remains immutable; readback checks integrity.
   await verified(token,matches[0].id,matches[0].appProperties?.bm_sha256||hash);
  }else{
   if(await digest(local())!==hash)throw Error('Dados mudaram durante o backup; tente novamente');
   added.push(await create(token,d,period,key,hash));
  }
 }
 const verifiedList=await list(token);
 if(added.some(x=>!verifiedList.some(f=>f.id===x.id)))throw Error('Backup criado mas não encontrado na conferência');
 const removedDaily=await prune(token,verifiedList,'daily',30);
 const removedMonthly=await prune(token,verifiedList,'monthly',12);
 return {state:'verified',message:'Backups: '+added.length+' novos, diário e mensal conferidos; rotação '+removedDaily+' diários e '+removedMonthly+' mensais'};
}
async function listAvailable(token){
 const files=await list(token);
 return files.map(f=>({
  id:f.id,
  name:f.name,
  period:f.appProperties?.bm_period,
  day:f.appProperties?.bm_day,
  sha256:f.appProperties?.bm_sha256
 })).filter(f=>f.id&&f.sha256&&['daily','monthly','premerge'].includes(f.period))
   .sort((a,b)=>String(b.day).localeCompare(String(a.day)));
}
async function restoreToLocal(token,id){
 if(typeof id!=='string'||!id)throw Error('Identificador do backup inválido');
 const available=await listAvailable(token);
 const chosen=available.find(f=>f.id===id);
 if(!chosen)throw Error('Backup não identificado na lista do Drive; nenhuma alteração aplicada');
 const data=await verified(token,id,chosen.sha256);
 const old=localStorage.getItem(KEY);
 const timerRaw=localStorage.getItem('BM245_CONTROLE_TIMER');
 if(timerRaw){
  let c;
  try{c=JSON.parse(timerRaw)}catch{throw Error('Cronômetro local inválido: preserve-o antes de restaurar')}
  if(c?.running||Number(c?.elapsed)>0||c?.transferPending)
   throw Error('Cronômetro pendente: pause, encerre ou descarte antes de restaurar');
 }
 if(old!==localStorage.getItem(KEY))throw Error('Histórico alterado durante a conferência: restauração suspensa');
 const prefix='BM240_PRE_RESTORE_'+new Date().toISOString().replace(/[:.]/g,'-');
 const previousBaseline=localStorage.getItem('BM245_CONTROLE_DRIVE_BASE_SHA256');
 // Não sobrescrever silenciosamente: uma cópia anterior é persistida primeiro.
 localStorage.setItem(prefix,old===null?JSON.stringify({schema:1,subjects:[],sessions:[],reviews:[],plans:[],audit:[],cycle:[],cycleIndex:0,availabilityWeek:15,availabilityMonth:60}):old);
 try{
  // Marca a origem como divergente para IMPEDIR que o sincronizador envie automaticamente uma restauração antiga sobre o mestre do Drive.
  localStorage.setItem('BM245_CONTROLE_DRIVE_BASE_SHA256','RESTORE_REQUIRES_RECONCILIATION');
  localStorage.setItem(KEY,JSON.stringify(data));
  window.BM240ControlApp?.reload?.();
 }catch(e){
  try{
   if(old===null)localStorage.removeItem(KEY);else localStorage.setItem(KEY,old);
   if(previousBaseline===null)localStorage.removeItem('BM245_CONTROLE_DRIVE_BASE_SHA256');
   else localStorage.setItem('BM245_CONTROLE_DRIVE_BASE_SHA256',previousBaseline);
  }catch(_){}
  throw Error('Restauração local não concluída: '+e.message);
 }
 return {state:'restored-local-only',count:data.sessions.length,backupName:chosen.name,
  message:'Cópia validada e restaurada APENAS neste navegador. Mestre remoto preservado; conciliação pendente antes de sincronizar.'};
}
async function preservePremerge(token,remote,local){
 if(!remote||!local)throw Error('Originais ausentes; nenhuma conciliação permitida');
 const stamp=new Date().toISOString().replace(/[:.]/g,'-')+'_'+crypto.randomUUID();
 const records=[];
 for(const [label,data] of [['remote',remote],['local',local]]){
  const hash=await digest(data);
  const out=await create(token,data,'premerge',stamp+'_'+label,hash);
  records.push({id:out.id,label,hash});
 }
 if(records.length!==2)throw Error('Backups prévios incompletos');
 return records;
}
async function afterSync(token){
 if(ongoing)return ongoing;
 ongoing=work(token).then(r=>(lastResult=r,r)).catch(e=>(lastResult={state:'error',message:'Backup: '+e.message},lastResult)).finally(()=>ongoing=null);
 return ongoing;
}
window.BM240StudyBackups=Object.freeze({afterSync,listAvailable,restoreToLocal,preservePremerge,get lastResult(){return lastResult}});
})();

;
/* 119 assets/v242_operational_cards.js */
/* V242: ponte do cartão existente PETRO14-C014 para leitor único V165.
 * O material íntegro vem de arquivo técnico verificado no Drive; SRS intocado. */
(function(){
'use strict';
if(window.BM242OperationalCards)return;
const FILES=Object.freeze({'PETRO14-C014':'assets/petro14_c014_v242.json'});
const cache=new Map();
function has(id){return Object.prototype.hasOwnProperty.call(FILES,id)}
function getRecord(id){
 if(!has(id))return null;
 return cache.get(id)||{
  id,front:'Carregando pergunta original do cartão '+id+'…',
  back:'Fluência rápida: primeiras 24 horas após o carregamento, parcela irreversível.',
  discipline:'Engenharia Civil',subject:'Estruturas de concreto',sub:'Fluência e retração',
  operational:true,cardSource:'PETRO14'};
}
async function loadRecord(id){
 if(!has(id))throw Error('Cartão operacional inexistente: '+id);
 if(cache.has(id))return cache.get(id);
 const res=await fetch(FILES[id]+'?v=242',{cache:'no-store'});
 if(!res.ok)throw Error('O arquivo do cartão não foi carregado (HTTP '+res.status+')');
 const x=await res.json();
 if(x.id!==id||!Array.isArray(x.layers)||x.layers.length!==11||
 x.layers.some((layer,i)=>layer.ord!==i+1||!String(layer.titulo||'').trim()||!String(layer.texto||'').trim()))
 throw Error('Cartão operacional não contém os 11 módulos integrais');
 cache.set(id,x);return x;
}
window.BM242OperationalCards=Object.freeze({has,getRecord,loadRecord,ids:Object.keys(FILES)});
void loadRecord('PETRO14-C014').catch(e=>console.warn('V242: o cartão será carregado quando aberto',e.message));
})();

;
/* 120 assets/v242_lacunas.js */
/* V242 | Lacunas vinculadas a flashcards; dados privados, sem alteracao de SRS. */
(function(){
'use strict';
if(window.BM242Lacunas)return;
const KEY='BM_LACUNAS_V242',types=['Conceitual','Memorização','Aplicação','Interpretação','Desatenção','Pesquisa'],
 coverage=['Não auditada','Direta','Indireta','Parcial','Ausente'],
 stages=['Identificada','Explicada','Em reforço','Dominada'];
const $=id=>document.getElementById(id), blank=()=>({schema:1,records:[],log:[],updatedAt:null});
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const norm=s=>String(s??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
function validate(d){
 if(!d||d.schema!==1||!Array.isArray(d.records)||!Array.isArray(d.log))throw Error('Esquema inválido');
 const ids=new Set();
 for(const r of d.records){
  if(typeof r.id!=='string'||!/^LAC-/.test(r.id)||ids.has(r.id))throw Error('ID inválido ou repetido');
  ids.add(r.id);
  if(!Array.isArray(r.cardIds)||r.cardIds.some(x=>typeof x!=='string'))throw Error('Cartões inválidos');
  if(typeof r.relatoEstudante!=='string'||typeof r.diagnosticoAssistente!=='string')throw Error('Autoria inválida');
  if(!coverage.includes(r.cobertura)||!stages.includes(r.etapa)||!Array.isArray(r.historico))throw Error('Estado ou histórico inválido');
 }
 return d;
}
function load(){
 try{const s=localStorage.getItem(KEY);return s?validate(JSON.parse(s)):blank()}
 catch(e){console.error('Lacunas V242: bloqueio seguro de dados ilegíveis',e);return null}
}
let data=load(),persisted=data?JSON.stringify(data):null,
 persistedRaw=localStorage.getItem(KEY),syncState='Local: Drive ainda não conferido';
function write(event,r){
 if(!data)throw Error('Dados inválidos: escrita bloqueada');
 const current=localStorage.getItem(KEY);
 // A imagem persistida é o ponto de recuperação; callbacks já podem ter alterado data.
 if(current!==persistedRaw){
  data=load();persisted=data?JSON.stringify(data):null;persistedRaw=current;render();
  throw Error('Outra aba modificou as lacunas. Atualizamos a leitura, sem sobrescrever alterações concorrentes.');
 }
 const at=new Date().toISOString();
 try{
  data.updatedAt=at;data.log.push({id:crypto.randomUUID(),at,event,lacunaId:r?.id||null});
  validate(data);
  const encoded=JSON.stringify(data);
  localStorage.setItem(KEY,encoded);
  persisted=encoded;persistedRaw=encoded;
 }catch(e){
  data=persisted?JSON.parse(persisted):blank();
  render();
  throw Error('Gravação local cancelada e restaurada: '+e.message);
 }
 syncState='Lacunas: alterações locais ainda não verificadas no Drive';
 render();document.dispatchEvent(new CustomEvent('bm242-lacunas-change',{detail:{at}}));
}
function applyRemote(d){
 validate(d);const old=localStorage.getItem(KEY);
 if(old)localStorage.setItem('BM242_LACUNAS_RECUPERACAO_'+new Date().toISOString().replace(/[:.]/g,'-'),old);
 const encoded=JSON.stringify(d);
 localStorage.setItem(KEY,encoded);data=structuredClone(d);persisted=encoded;persistedRaw=encoded;
 syncState='Lacunas: importação concluída localmente; confirmação Drive pendente';render();
}
function cards(raw){
 const v=[...new Set(String(raw||'').split(/[;,\s]+/).map(x=>x.trim()).filter(Boolean))];
 if(v.some(x=>!(/^[a-z0-9][a-z0-9_-]{2,45}$/i.test(x))))throw Error('IDs de cartões inválidos');
 return v;
}
function install(){
 if($('lacunas'))return;
 const nav=document.querySelector('header nav[aria-label="Seções"]')||document.querySelector('header nav'),main=document.querySelector('main');
 if(!nav||!main)return;
 const button=document.createElement('button');button.id='bm242-nav';button.type='button';button.dataset.page='lacunas';button.textContent='Lacunas';
 const related=[...nav.querySelectorAll('button')].find(x=>x.dataset.page==='cartoes');if(related)related.after(button);else nav.append(button);
 const section=document.createElement('section');section.id='lacunas';
 section.innerHTML=[
 '<div class="bm242-shell"><h2>Lacunas de conhecimento e cartões</h2>',
 '<p class="bm242-muted">Registre o motivo do erro ou da dúvida; o flashcard continua sendo a unidade de revisão. Consulta sem alteração de SRS.</p>',
 '<p class="bm242-status" id="bm242-state" role="status"></p>',
 '<div class="bm242-filters">',
 '<label>Pesquisar assunto, fórmula, dúvida ou cartão<input id="bm242-search" type="search" placeholder="Ex.: fluência pós-carga; PETRO14-C014"></label>',
 '<label>Disciplina<select id="bm242-discipline"><option value="">Todas</option></select></label>',
 '<label>Assunto geral<select id="bm242-general"><option value="">Todos</option></select></label>',
 '<label>Assunto específico<select id="bm242-specific"><option value="">Todos</option></select></label>',
 '<label>Subassunto<select id="bm242-sub"><option value="">Todos</option></select></label>',
 '<label>Prioridade<select id="bm242-priority"><option value="">Todas</option></select></label>',
 '<label>Tipo<select id="bm242-type"><option value="">Todos</option></select></label>',
 '<label>Cobertura<select id="bm242-cover"><option value="">Todas</option></select></label>',
 '<label>Situação<select id="bm242-stage"><option value="">Todas</option></select></label>',
 '</div><p class="bm242-muted" id="bm242-count"></p><div id="bm242-list"></div>',
 '<details id="bm242-new" class="bm242-form"><summary>Registrar lacuna de questão, pesquisa ou dúvida</summary>',
 '<form id="bm242-form"><div class="bm242-fields">',
 '<label>Origem<select name="origem"><option>Questão</option><option>Dúvida</option><option>Pesquisa</option><option>Leitura</option><option>Revisão</option></select></label>',
 '<label>ID da questão<input name="questaoId" maxlength="100" placeholder="Se houver"></label>',
 '<label>IDs dos cartões relacionados<input name="cardIds" maxlength="500" placeholder="Separados por vírgula"></label>',
 '<label>Disciplina<input name="disciplina" maxlength="150"></label>',
 '<label>Assunto geral<input name="assuntoGeral" maxlength="150"></label>',
 '<label>Assunto específico<input name="assuntoEspecifico" maxlength="150"></label>',
 '<label>Subassunto<input name="subassunto" maxlength="150"></label>',
 '<label>Tipo<select name="tipo"></select></label><label>Cobertura<select name="cobertura"></select></label>',
 '<label>Prioridade<select name="prioridade"><option>Normal</option><option>Alta</option><option>Baixa</option></select></label>',
 '</div>',
 '<label>Enunciado da questão (opcional; preservação textual)<textarea rows="3" name="enunciado"></textarea></label>',
 '<label>Minha resposta / alternativa marcada (opcional)<textarea rows="2" name="respostaEstudante"></textarea></label>',
 '<label>Gabarito oficial (opcional)<input name="gabarito" maxlength="400" placeholder="Sem resposta, deixe vazio"></label>',
 '<label>Por que errei? / O que não compreendi? — relato literal do estudante<textarea rows="3" name="relatoEstudante"></textarea></label>',
 '<label>Descrição da lacuna ou conhecimento a pesquisar<textarea rows="2" name="descricao" required></textarea></label>',
 '<label>Fontes, normas, edições e páginas<textarea rows="2" name="fonte"></textarea></label>',
 '<label>Pesquisa complementar ou proposta de cartão (não cria cartão automaticamente)<textarea rows="2" name="pesquisa"></textarea></label>',
 '<p class="bm242-muted">O relato será preservado literalmente. O diagnóstico do assistente só será apresentado quando existir um registro auditado com autoria própria; cobertura selecionada manualmente não equivale a auditoria.</p>',
 '<button type="submit">Salvar lacuna localmente</button></form></details>',
 '<div class="bm242-actions"><button id="bm242-export" type="button">Exportar JSON</button>',
 '<label>Importar backup JSON<input id="bm242-import" type="file" accept=".json,application/json"></label></div>',
 '<p id="bm242-form-msg" role="status"></p>',
 '<p class="bm242-muted">Sincronização privada somente após autorização e confirmação pelo botão único do Drive. Dados pessoais não vão ao GitHub.</p></div>'
 ].join('');
 main.append(section);
 button.onclick=()=>{if(typeof window.section==='function')window.section('lacunas');else{main.querySelectorAll('section').forEach(x=>x.classList.toggle('active',x===section));nav.querySelectorAll('button').forEach(x=>x.classList.toggle('active',x===button));location.hash='lacunas'}};
 for(const id of ['bm242-search','bm242-discipline','bm242-general','bm242-specific','bm242-sub','bm242-type','bm242-cover','bm242-stage','bm242-priority']){
  $(id).addEventListener('input',render);$(id).addEventListener('change',render);
 }
 for(const t of types)$('bm242-form').elements.tipo.add(new Option(t,t));
 for(const c of coverage)$('bm242-form').elements.cobertura.add(new Option(c,c));
 $('bm242-form').addEventListener('submit',e=>{
  e.preventDefault();
  try{
   const f=e.currentTarget,v=new FormData(f),g=k=>String(v.get(k)||'').trim();
   if(!data)throw Error('Cadastro indisponível');
   if(g('descricao').length<5)throw Error('Descreva a lacuna com pelo menos cinco caracteres');
   const now=new Date().toISOString(),linked=cards(g('cardIds'));
   const r={id:'LAC-'+now.replace(/[-:.TZ]/g,'')+'-'+crypto.randomUUID().slice(0,8).toUpperCase(),
    createdAt:now,updatedAt:now,origem:g('origem'),questaoId:g('questaoId'),cardIds:linked,
    disciplina:g('disciplina'),assuntoGeral:g('assuntoGeral'),assuntoEspecifico:g('assuntoEspecifico'),subassunto:g('subassunto'),
    tipo:g('tipo'),cobertura:g('cobertura'),prioridade:g('prioridade'),etapa:'Identificada',
    enunciado:String(v.get('enunciado')||''),respostaEstudante:String(v.get('respostaEstudante')||''),gabarito:g('gabarito'),
    relatoEstudante:String(v.get('relatoEstudante')||''),diagnosticoAssistente:'',diagnosticoConfianca:'',diagnosticoEvidencias:'',
    descricao:g('descricao'),fonte:g('fonte'),pesquisa:g('pesquisa'),auditoriaStatus:'Cobertura declarada manualmente; não auditada pelo portal',
    resolucaoEvidencia:'',historico:[]};
   const key=x=>norm(x.questaoId)+'|'+norm(x.descricao)+'|'+x.cardIds.slice().sort().join(',');
   if(data.records.some(x=>key(x)===key(r)))throw Error('Registro equivalente já existe; duplicação evitada');
   data.records.push(r);write('lacuna_criada',r);f.reset();$('bm242-new').open=false;
   $('bm242-form-msg').textContent=r.id+' gravada no navegador; sincronização Drive não presumida';
  }catch(err){$('bm242-form-msg').textContent=err.message}
 });
 $('bm242-list').addEventListener('click',e=>{
  const open=e.target.closest('button[data-open]');
  if(open){
   if(!window.BancoMestreVisualizarCardV050?.showId?.(open.dataset.open,open))
    $('bm242-form-msg').textContent='Cartão '+open.dataset.open+' não disponível no leitor atual; vínculo preservado como pendente.';
   return;
  }
  const fill=e.target.closest('button[data-fill]');
  if(fill&&data){
   const r=data.records.find(x=>x.id===fill.dataset.fill);if(!r)return;
   const note=prompt(r.relatoEstudante?'Acrescente uma observação posterior (o relato literal original será preservado):':'Registre com suas palavras por que errou ou não compreendeu:');
   if(note===null||!note.trim())return;
   r.updatedAt=new Date().toISOString();
   if(!r.relatoEstudante)r.relatoEstudante=note;
   else r.historico.push({at:r.updatedAt,evento:'complemento_estudante',nota:note});
   write('relato_ou_complemento_adicionado',r);return;
  }
  const noteBtn=e.target.closest('button[data-note]');
  if(noteBtn&&data){
   const r=data.records.find(x=>x.id===noteBtn.dataset.note);if(!r)return;
   const note=prompt('Acrescente uma pesquisa, evidência, observação ou fonte (não altera o relato original):');
   if(note===null||!note.trim())return;
   r.updatedAt=new Date().toISOString();
   r.historico.push({at:r.updatedAt,evento:'complemento',nota:note});
   write('complemento_adicionado',r);return;
  }
  const change=e.target.closest('button[data-stage]');if(!change||!data)return;
  const r=data.records.find(x=>x.id===change.dataset.stage);if(!r)return;
  const next=change.dataset.next;if(!stages.includes(next))return;
  let ev='';
  if(next==='Dominada'){
   ev=prompt('Qual evidência de recuperação ativa ou aplicação correta justifica o domínio?');
   if(ev===null)return;
   if(ev.trim().length<12){alert('Registre evidência concreta; leitura isolada não comprova domínio');return}
  }
  const previous=r.etapa;r.etapa=next;r.updatedAt=new Date().toISOString();
  if(ev)r.resolucaoEvidencia=ev.trim();
  r.historico.push({at:r.updatedAt,from:previous,to:next,evidencia:ev.trim()});
  write('etapa_atualizada',r);
 });
 $('bm242-export').onclick=()=>{
  if(!data)return;
  const blob=new Blob([JSON.stringify({format:'BancoMestreLacunasV242',data},null,2)],{type:'application/json'});
  const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='BancoMestre_Lacunas_V242.json';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),500);
 };
 $('bm242-import').onchange=async e=>{
  const file=e.target.files?.[0];if(!file)return;
  try{
   if(file.size>5000000)throw Error('Backup excede 5 MB');
   const o=JSON.parse(await file.text());
   if(o.format!=='BancoMestreLacunasV242')throw Error('Formato de backup inválido');
   validate(o.data);
   if(!confirm('Substituir cadastro local, preservando a cópia anterior para recuperação?'))return;
   applyRemote(o.data);$('bm242-form-msg').textContent='Backup importado localmente';
  }catch(err){$('bm242-form-msg').textContent=err.message}
  finally{e.target.value=''}
 };
 document.addEventListener('bm242-lacunas-drive-status',e=>{syncState=e.detail?.message||syncState;render()});
 window.addEventListener('storage',e=>{if(e.key===KEY){data=load();persisted=data?JSON.stringify(data):null;persistedRaw=e.newValue;render()}});
 document.addEventListener('bm242-open-lacuna',()=>{button.click();$('bm242-new').open=true;$('bm242-new').scrollIntoView({block:'start'})});
 window.addEventListener('message',e=>{
  if(e.origin!==location.origin||e.data?.type!=='bm242-open-lacuna'||e.source!==$('bm238-study-frame')?.contentWindow)return;
  document.dispatchEvent(new Event('bm242-open-lacuna'));
  const context=e.data.context||{},f=$('bm242-form');
  if(f&&context.discipline&&!/^escolha/i.test(context.discipline))f.elements.disciplina.value=String(context.discipline).slice(0,150);
  if(f&&context.topic)f.elements.subassunto.value=String(context.topic).slice(0,150);
 });
 if(location.hash==='#lacunas')button.click();
 render();
}
function render(){
 if(!$('bm242-state'))return;
 $('bm242-state').textContent=data?syncState:'Dados locais inválidos: escrita bloqueada e originais preservados';
 if(!data){$('bm242-list').textContent='Importe uma cópia válida para recuperar o cadastro';return}
 function select(id,values,all){
  const el=$(id),keep=el.value;el.replaceChildren(new Option(all,''));
  for(const v of values)el.add(new Option(v,v));
  el.value=[...el.options].some(x=>x.value===keep)?keep:'';
 }
 select('bm242-discipline',[...new Set(data.records.map(x=>x.disciplina).filter(Boolean))].sort(),'Todas');
 const discipline=$('bm242-discipline').value;
 const byDisc=data.records.filter(x=>!discipline||x.disciplina===discipline);
 select('bm242-general',[...new Set(byDisc.map(x=>x.assuntoGeral).filter(Boolean))].sort(),'Todos');
 const gen=$('bm242-general').value;
 const byGeneral=byDisc.filter(x=>!gen||x.assuntoGeral===gen);
 select('bm242-specific',[...new Set(byGeneral.map(x=>x.assuntoEspecifico).filter(Boolean))].sort(),'Todos');
 const specific=$('bm242-specific').value;
 const bySpecific=byGeneral.filter(x=>!specific||x.assuntoEspecifico===specific);
 select('bm242-sub',[...new Set(bySpecific.map(x=>x.subassunto).filter(Boolean))].sort(),'Todos');
 select('bm242-priority',[...new Set(data.records.map(x=>x.prioridade).filter(Boolean))].sort(),'Todas');
 select('bm242-type',types.filter(x=>data.records.some(r=>r.tipo===x)),'Todos');
 select('bm242-cover',coverage.filter(x=>data.records.some(r=>r.cobertura===x)),'Todas');
 select('bm242-stage',stages.filter(x=>data.records.some(r=>r.etapa===x)),'Todas');
 const q=norm($('bm242-search').value),d=$('bm242-discipline').value,t=$('bm242-type').value,
 g=$('bm242-general').value,sp=$('bm242-specific').value,sub=$('bm242-sub').value,p=$('bm242-priority').value,
 c=$('bm242-cover').value,s=$('bm242-stage').value;
 const filtered=data.records.filter(r=>(!d||r.disciplina===d)&&(!g||r.assuntoGeral===g)&&(!sp||r.assuntoEspecifico===sp)&&(!sub||r.subassunto===sub)&&(!p||r.prioridade===p)&&(!t||r.tipo===t)&&(!c||r.cobertura===c)&&(!s||r.etapa===s)&&
 (!q||norm([r.id,r.descricao,r.relatoEstudante,r.diagnosticoAssistente,r.enunciado,r.respostaEstudante,r.gabarito,r.questaoId,...r.cardIds,r.disciplina,r.assuntoGeral,r.assuntoEspecifico,r.subassunto,r.fonte,r.pesquisa].join(' ')).includes(q)));
 $('bm242-count').textContent=filtered.length+' de '+data.records.length+' lacunas · '+data.log.length+' eventos de histórico';
 $('bm242-list').innerHTML=filtered.length?filtered.slice().reverse().map(r=>{
  const links=r.cardIds.map(id=>'<button data-open="'+esc(id)+'" type="button">Abrir '+esc(id)+' no leitor</button>').join(' ')||'<em>Cartão a auditar</em>';
  const next=r.etapa==='Identificada'?'Explicada':r.etapa==='Explicada'?'Em reforço':r.etapa==='Em reforço'?'Dominada':'';
  return '<article class="bm242-item"><strong>'+esc(r.descricao)+'</strong> <code>'+esc(r.id)+'</code>'+
  '<p>'+esc([r.disciplina,r.assuntoGeral,r.assuntoEspecifico,r.subassunto].filter(Boolean).join(' › '))+'</p>'+
  '<p class="bm242-muted">'+esc(r.tipo)+' · '+esc(r.cobertura)+' · '+esc(r.etapa)+' · '+esc(r.prioridade)+'</p>'+
  (r.enunciado?'<details><summary>Enunciado e tentativa</summary><p>'+esc(r.enunciado)+'</p><p><b>Resposta registrada:</b> '+esc(r.respostaEstudante||'não informada')+'</p><p><b>Gabarito:</b> '+esc(r.gabarito||'não informado')+'</p></details>':'')+
  (r.relatoEstudante?'<p><b>Relato literal:</b> '+esc(r.relatoEstudante)+'</p>':'')+
  (r.diagnosticoAssistente?'<p><b>Diagnóstico do assistente ('+esc(r.diagnosticoConfianca||'não confirmado')+'):</b> '+esc(r.diagnosticoAssistente)+'</p>':'')+
  '<p><b>Origem:</b> '+esc(r.origem)+(r.questaoId?' · '+esc(r.questaoId):'')+'</p>'+
  (r.pesquisa?'<p><b>Pesquisa:</b> '+esc(r.pesquisa)+'</p>':'')+
  '<div class="bm242-actions">'+links+'<button type="button" data-fill="'+esc(r.id)+'">'+(r.relatoEstudante?'Complementar relato':'Informar por que errei')+'</button>'+'<button type="button" data-note="'+esc(r.id)+'">Adicionar nota/fonte</button>'+(next?'<button type="button" data-stage="'+esc(r.id)+'" data-next="'+esc(next)+'">Avançar para '+esc(next)+'</button>':'')+'</div>'+
  '<details><summary>Fonte, auditoria e histórico</summary><p>'+esc(r.fonte||'Sem fonte cadastrada')+'</p><p>'+esc(r.auditoriaStatus)+'</p><p>Origem: '+esc(r.createdAt)+'</p><p>Evidência de domínio: '+esc(r.resolucaoEvidencia||'nenhuma')+'</p>'+r.historico.map(h=>'<p>'+esc(h.at||'')+' · '+esc(h.evento||h.to||'registro')+' · '+esc(h.nota||h.evidencia||'')+'</p>').join('')+'</details></article>';
 }).join(''):'<p class="bm242-muted">Nenhuma lacuna cadastrada ou localizada com estes filtros.</p>';
}
window.BM242Lacunas=Object.freeze({get data(){return data?structuredClone(data):null},validate,applyRemote,render,openForm(){document.dispatchEvent(new Event('bm242-open-lacuna'))}});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();

;
/* 121 assets/v276_lacunas_delta_import.js */
/* V276 — mesclagem PRIVADA de incrementos de lacunas com proteção contra regressão.
 * Nenhum dado de lacuna é publicado no GitHub ou gravado no Drive sem ação do usuário.
 * Não altera cartões ou SRS. Falhas mantêm a base local intacta.
 */
(function(){
'use strict';
if(window.BM276LacunasImport)return;
const KEY='BM_LACUNAS_V242';
const note='Mescla as lacunas privadas ao cadastro local sem substituir as existentes. Salvar no Drive exige usar Sincronizar com OAuth após conferir.';
function normalize(v){return String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();}
function signature(r){return [normalize(r.questaoId),normalize(r.descricao),[...r.cardIds].sort().join(',')].join('|');}
function mount(){
 const root=document.getElementById('lacunas');if(!root||document.getElementById('bm276-import-delta'))return;
 const top=root.querySelector('.bm242-shell')||root;
 const box=document.createElement('div');box.id='bm276-import-delta';box.className='notice';
 const label=document.createElement('label');label.textContent='Mesclar incremento privado de lacunas (arquivo JSON): ';
 const input=document.createElement('input');input.type='file';input.accept='.json,application/json';input.setAttribute('aria-label','Selecionar incremento privado de lacunas');
 const desc=document.createElement('p');desc.style.fontSize='12px';desc.textContent=note;
 const status=document.createElement('p');status.setAttribute('role','status');status.style.fontSize='12px';
 label.append(input);box.append(label,desc,status);
 top.insertBefore(box,top.firstChild?.nextSibling||null);
 input.addEventListener('change',async()=>{
  const file=input.files?.[0];if(!file)return;status.textContent='Conferindo IDs e histórico…';
  try{
   if(file.size>2_000_000)throw Error('Incremento excede 2 MB.');
   const obj=JSON.parse(await file.text());
   if(obj.format!=='BancoMestreLacunasIncrementalPrivadoV001'||obj.private!==true||!obj.data?.records||!Array.isArray(obj.data.records))throw Error('Arquivo não é incremento privado reconhecido.');
   const api=window.BM242Lacunas;if(!api?.data||!api?.applyRemote||!api?.validate)throw Error('Cadastro Lacunas ainda não inicializado.');
   const before=api.data;api.validate(before);api.validate(obj.data);
   const byId=new Map(before.records.map(r=>[r.id,r]));
   const keys=new Set(before.records.map(signature));const merged=structuredClone(before);let added=0,skipped=0;
   for(const r of obj.data.records){
    const old=byId.get(r.id);
    if(old){if(JSON.stringify(old)!==JSON.stringify(r))throw Error('Conflito no mesmo ID '+r.id+': nenhuma gravação feita.');skipped++;continue}
    if(keys.has(signature(r)))throw Error('Lacuna equivalente já existe sob outro ID: '+r.questaoId+'; conferir manualmente.');
    merged.records.push(structuredClone(r));byId.set(r.id,r);keys.add(signature(r));added++;
   }
   if(!added){status.textContent='Nenhum registro novo; '+skipped+' já presente(s).';return}
   const approval=window.confirm('Mesclar '+added+' lacuna(s) ao cadastro LOCAL? A cópia anterior será preservada. A sincronização com Drive permanece separada.');
   if(!approval){status.textContent='Mesclagem cancelada; nada alterado.';return}
   merged.updatedAt=new Date().toISOString();merged.log.push({id:'BM276-IMPORT-'+Date.now(),at:merged.updatedAt,event:'mesclagem_incremental_privada_por_id',added,skipped,source:'arquivo selecionado pelo usuário'});
   api.validate(merged);api.applyRemote(merged);
   status.textContent=added+' lacuna(s) incorporada(s) localmente; '+skipped+' já presente(s). Use Sincronizar para verificar gravação privada no Drive.';
  }catch(error){status.textContent='Mesclagem bloqueada sem sobrescrita: '+String(error?.message||error)}
  finally{input.value=''}
 });
}
window.BM276LacunasImport=Object.freeze({mount});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else mount();
})();

;
/* 122 assets/v242_lacunas_drive.js */
/* V242 | Sincronização privada de lacunas com Google Drive drive.file.
   Protege contra sobrescrita concorrente. Nao modifica cartoes ou SRS. */
(function(){
'use strict';
if(window.BM242LacunasDrive)return;
const KEY='BM_LACUNAS_V242',BASE='BM242_LACUNAS_REMOTE_SHA256',
 KIND='bm_lacunas_v242',PRIVATE_PARENT='1cDkoy-QgXYdzhOzi8SMSr7g4eB4oskBD',
 API='https://www.googleapis.com/drive/v3/files',
 UPLOAD='https://www.googleapis.com/upload/drive/v3/files',MAX=5000000;
let running=null,lastResult=null;
function local(){
 const raw=localStorage.getItem(KEY);
 const obj=raw?JSON.parse(raw):{schema:1,records:[],log:[],updatedAt:null};
 window.BM242Lacunas?.validate?.(obj);return obj;
}
async function hash(obj){
 const bytes=new TextEncoder().encode(JSON.stringify(obj));
 return [...new Uint8Array(await crypto.subtle.digest('SHA-256',bytes))].map(x=>x.toString(16).padStart(2,'0')).join('');
}
async function req(token,url,opt={}){
 if(!token)throw Error('OAuth de gravação indisponível');
 const res=await fetch(url,{...opt,cache:'no-store',headers:{Authorization:'Bearer '+token,...opt.headers}});
 if(!res.ok)throw Error('Drive HTTP '+res.status);
 return res;
}
async function locate(token){
 const url=new URL(API);
 url.searchParams.set('q',"trashed = false and appProperties has { key='bm_kind' and value='"+KIND+"' }");
 url.searchParams.set('fields','nextPageToken,incompleteSearch,files(id,name,version,appProperties)');
 url.searchParams.set('pageSize','100');
 const d=await(await req(token,url.href)).json();
 if(d.incompleteSearch||d.nextPageToken)throw Error('Busca de lacunas no Drive incompleta');
 const files=(d.files||[]).filter(x=>x.appProperties?.bm_kind===KIND);
 if(files.length>1)throw Error('Foram encontrados dois cadastros mestres; nenhum será substituído');
 return files[0]||null;
}

/* O registro histórico de PETRO16 foi preparado no Drive pelo chat.
   A localização é read-only, exclusiva para inicialização de um mestre vazio;
   o arquivo original jamais será alterado. */
async function locateSeed(token){
 const url=new URL(API);
 const parent=PRIVATE_PARENT;
 const name='PROPOSTA_LACUNA_PETRO14_C014_2026-11-18.json';
 url.searchParams.set('q',"trashed = false and name = '"+name+"' and '"+parent+"' in parents");
 url.searchParams.set('fields','nextPageToken,incompleteSearch,files(id,name,mimeType,parents)');
 url.searchParams.set('pageSize','100');
 const listing=await(await req(token,url.href)).json();
 if(listing.incompleteSearch||listing.nextPageToken)throw Error('Busca inicial de fichas incompleta');
 const found=(listing.files||[]).filter(x=>x.name===name&&x.mimeType==='application/json'&&x.parents?.includes(parent));
 if(found.length>1)throw Error('Fichas históricas duplicadas: importação automática bloqueada');
 return found[0]||null;
}
async function seedData(token,source){
 const text=await(await req(token,API+'/'+encodeURIComponent(source.id)+'?alt=media')).text();
 if(text.length>MAX)throw Error('Ficha de lacuna inicial excede 5 MB');
 const obj=JSON.parse(text);
 if(obj.format!=='BancoMestreLacunasV242')throw Error('Ficha histórica não possui formato de importação esperado');
 window.BM242Lacunas.validate(obj.data);
 if(obj.data.records.length!==1||obj.data.records[0].id!=='LAC-PETRO16-FLUENCIA-20261118-01')
  throw Error('Registro inicial diferente da ficha auditada, importação bloqueada');
 return obj.data;
}
async function fetchData(token,id){
 const s=await(await req(token,API+'/'+encodeURIComponent(id)+'?alt=media')).text();
 if(s.length>MAX)throw Error('Cadastro remoto excede limite');
 const d=JSON.parse(s);
 if(d.format!=='BancoMestreLacunasDriveV242')throw Error('Formato remoto desconhecido');
 window.BM242Lacunas?.validate?.(d.data);
 return d.data;
}
async function confirmed(token,id,expected){
 const d=await fetchData(token,id);
 if(await hash(d)!==expected)throw Error('Leitura pós-gravação divergente');
}
// Escrita antecipada e imutável para permitir recuperação após corrida de atualização.
// A versão de backup é importável pela própria interface, sem alterar o mestre.
async function archive(token,d,reason,expected){
 const payload=JSON.stringify({format:'BancoMestreLacunasV242',backupAt:new Date().toISOString(),backupReason:reason,data:d},null,2);
 if(payload.length>MAX)throw Error('Backup privado excede limite');
 const boundary='bm242-backup-'+crypto.randomUUID();
 const meta={name:'BancoMestre_Lacunas_Recuperacao_'+new Date().toISOString().replace(/[:.]/g,'-')+'_'+crypto.randomUUID().slice(0,8)+'.json',
   mimeType:'application/json',parents:[PRIVATE_PARENT],
   appProperties:{bm_kind:'bm_lacunas_recovery_v242',bm_schema:'V242',bm_reason:reason}};
 const body='--'+boundary+'\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n'+JSON.stringify(meta)+
  '\r\n--'+boundary+'\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n'+payload+
  '\r\n--'+boundary+'--';
 const res=await req(token,UPLOAD+'?uploadType=multipart&fields=id,parents,appProperties',{
  method:'POST',headers:{'Content-Type':'multipart/related; boundary='+boundary},body});
 const out=await res.json();
 if(!out.id||!out.parents?.includes(PRIVATE_PARENT)||out.appProperties?.bm_kind!=='bm_lacunas_recovery_v242')
  throw Error('Cópia de recuperação não foi confirmada na pasta privada');
 const raw=await(await req(token,API+'/'+encodeURIComponent(out.id)+'?alt=media')).text();
 if(raw.length>MAX)throw Error('Cópia de recuperação ultrapassou o limite');
 const back=JSON.parse(raw);
 if(back.format!=='BancoMestreLacunasV242')throw Error('Formato de recuperação incorreto');
 window.BM242Lacunas.validate(back.data);
 if(await hash(back.data)!==expected)throw Error('Cópia de recuperação não corresponde aos dados originais');
 return out.id;
}
async function create(token,d,expected){
 const check=await locate(token);if(check)throw Error('Outro cadastro surgiu no Drive durante a sincronização');
 const payload=JSON.stringify({format:'BancoMestreLacunasDriveV242',updatedAt:new Date().toISOString(),data:d});
 if(payload.length>MAX)throw Error('Cadastro muito grande');
 await archive(token,d,'antes_criacao_mestre',expected);
 if(await locate(token))throw Error('Outro mestre apareceu após o snapshot; nenhuma criação duplicada será tentada');
 const boundary='bm242-'+crypto.randomUUID(),meta={name:'BancoMestre_Lacunas_Mestre_V242.json',mimeType:'application/json',
  parents:[PRIVATE_PARENT],appProperties:{bm_kind:KIND,bm_schema:'V242'}};
 const body='--'+boundary+'\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n'+JSON.stringify(meta)+
  '\r\n--'+boundary+'\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n'+payload+
  '\r\n--'+boundary+'--';
 const res=await req(token,UPLOAD+'?uploadType=multipart&fields=id,appProperties,parents',
  {method:'POST',headers:{'Content-Type':'multipart/related; boundary='+boundary},body});
 const out=await res.json();
 if(!out.id||out.appProperties?.bm_kind!==KIND||!out.parents?.includes(PRIVATE_PARENT))throw Error('Gravação no diretório privado não confirmada');
 await confirmed(token,out.id,expected);return out;
}
async function update(token,file,d,expected,remote,remoteHash){
 await archive(token,remote,'antes_atualizacao_remoto',remoteHash);
 await archive(token,d,'candidato_local_pre_envio',expected);
 const latest=await(await req(token,API+'/'+encodeURIComponent(file.id)+'?fields=id,version,appProperties')).json();
 if(latest.id!==file.id||String(latest.version)!==String(file.version)||latest.appProperties?.bm_kind!==KIND)
  throw Error('Alteração concorrente do cadastro remoto; original preservado');
 const payload=JSON.stringify({format:'BancoMestreLacunasDriveV242',updatedAt:new Date().toISOString(),data:d});
 if(payload.length>MAX)throw Error('Cadastro muito grande');
 const res=await req(token,UPLOAD+'/'+encodeURIComponent(file.id)+'?uploadType=media&fields=id,version',
  {method:'PATCH',headers:{'Content-Type':'application/json; charset=UTF-8'},body:payload});
 const out=await res.json();
 if(out.id!==file.id)throw Error('Resposta remota sem ID válido');
 await confirmed(token,file.id,expected);return out;
}
function status(r){
 lastResult=r;document.dispatchEvent(new CustomEvent('bm242-lacunas-drive-status',{detail:r}));return r;
}
async function work(token){
 if(!crypto?.subtle||!window.BM242Lacunas?.validate)throw Error('Módulo de integridade de lacunas indisponível');
 const d=local(),localHash=await hash(d),baseline=localStorage.getItem(BASE),file=await locate(token);
 if(!file){
  if(!d.records.length){
   const seed=await locateSeed(token);
   if(!seed)return status({state:'empty',message:'Lacunas: nenhum registro privado encontrado para sincronizar'});
   const initial=await seedData(token,seed),seedHash=await hash(initial);
   if(await hash(local())!==localHash)throw Error('Cadastro local alterado durante busca do histórico');
   await create(token,initial,seedHash);
   window.BM242Lacunas.applyRemote(initial);
   localStorage.setItem(BASE,seedHash);
   return status({state:'uploaded',message:'Lacunas: ficha PETRO16 auditada importada e mestre Drive criado e conferido'});
  }
  if(await hash(local())!==localHash)throw Error('Dados locais alterados durante consulta');
  await create(token,d,localHash);
  localStorage.setItem(BASE,localHash);
  return status({state:'uploaded',message:'Lacunas: cadastro privado criado e conferido no Drive'});
 }
 const remote=await fetchData(token,file.id),remoteHash=await hash(remote);
 if(localHash===remoteHash){
  localStorage.setItem(BASE,localHash);
  return status({state:'unchanged',message:'Lacunas: cadastro local e Drive idênticos e conferidos'});
 }
 if((baseline&&baseline===localHash)||(!baseline&&!d.records.length)){
  if(await hash(local())!==localHash)throw Error('Dados locais foram alterados durante leitura');
  window.BM242Lacunas.applyRemote(remote);
  localStorage.setItem(BASE,remoteHash);
  return status({state:'downloaded',message:'Lacunas: dados remotos importados e cópia anterior preservada'});
 }
 if(baseline&&baseline===remoteHash){
  if(await hash(local())!==localHash)throw Error('Dados locais alterados durante envio');
  await update(token,file,d,localHash,remote,remoteHash);
  localStorage.setItem(BASE,localHash);
  return status({state:'uploaded',message:'Lacunas: alterações gravadas e verificadas no Drive'});
 }
 return status({state:'conflict',message:'Lacunas: conflito entre dispositivos; dados locais e Drive preservados sem sobrescrita'});
}
async function sync(token){
 if(running)return running;
 running=work(token).catch(e=>status({state:'error',message:'Lacunas: '+e.message})).finally(()=>{running=null});
 return running;
}
window.BM242LacunasDrive=Object.freeze({sync,get lastResult(){return lastResult}});
})();

;
/* 123 assets/v243_lacunas_retention.js */
/* Banco Mestre V243 — rotacao verificada de backups diarios e mensais no Drive. */
(function(){
'use strict';
if(window.BM243LacunasRetention)return;
const previous=window.BM242LacunasDrive;
if(!previous?.sync){console.error('V243 backups: sincronizador de lacunas não está carregado');return}
const API='https://www.googleapis.com/drive/v3/files',UPLOAD='https://www.googleapis.com/upload/drive/v3/files',
 FOLDER='1cDkoy-QgXYdzhOzi8SMSr7g4eB4oskBD',KIND='bm_lacunas_periodic_v242',
 KEY='BM_LACUNAS_V242',BASE='BM242_LACUNAS_REMOTE_SHA256',MAX=5000000;
let active=null,latest=null;
function copy(v){return JSON.parse(JSON.stringify(v))}
async function digest(d){const b=new TextEncoder().encode(JSON.stringify(d));return [...new Uint8Array(await crypto.subtle.digest('SHA-256',b))].map(x=>x.toString(16).padStart(2,'0')).join('')}
async function req(token,url,options={}){
 if(!token)throw Error('OAuth Drive indisponível');
 const r=await fetch(url,{...options,cache:'no-store',headers:{Authorization:'Bearer '+token,...options.headers}});
 if(!r.ok)throw Error('Drive HTTP '+r.status+' ao auditar backup');return r;
}
function keys(){
 const t=new Intl.DateTimeFormat('en-US',{timeZone:'America/Sao_Paulo',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date());
 const m=Object.fromEntries(t.map(x=>[x.type,x.value]));
 if(!/^\d{4}$/.test(m.year)||!/^\d{2}$/.test(m.month)||!/^\d{2}$/.test(m.day))throw Error('Data local inconsistente');
 return {daily:m.year+'-'+m.month+'-'+m.day,monthly:m.year+'-'+m.month};
}
function validKey(period,key){
 if(period==='monthly'){
  if(!/^\d{4}-\d{2}$/.test(key||''))return false;
  const [year,month]=key.split('-').map(Number);
  return year>=2000&&year<=9999&&month>=1&&month<=12;
 }
 if(period==='daily'){
  if(!/^\d{4}-\d{2}-\d{2}$/.test(key||''))return false;
  const [year,month,day]=key.split('-').map(Number);
  if(year<2000||year>9999||month<1||month>12||day<1||day>31)return false;
  const date=new Date(Date.UTC(year,month-1,day));
  return date.getUTCFullYear()===year&&date.getUTCMonth()+1===month&&date.getUTCDate()===day;
 }
 return false;
}
async function list(token){
 const url=new URL(API);
 url.searchParams.set('q',"trashed = false and '"+FOLDER+"' in parents and appProperties has { key='bm_kind' and value='"+KIND+"' }");
 url.searchParams.set('fields','nextPageToken,incompleteSearch,files(id,name,parents,appProperties,createdTime)');
 url.searchParams.set('pageSize','1000');
 const d=await(await req(token,url.href)).json();
 if(d.incompleteSearch||d.nextPageToken)throw Error('Listagem de backups incompleta');
 const files=(d.files||[]).filter(x=>x.parents?.includes(FOLDER)&&x.appProperties?.bm_kind===KIND);
 if(files.some(x=>!x.id||!validKey(x.appProperties?.bm_period,x.appProperties?.bm_period_key)))
  throw Error('Metadados de backup inesperados: retenção bloqueada');
 return files;
}
async function create(token,data,period,key,hash){
 const payload=JSON.stringify({format:'BancoMestreLacunasV242',backupReason:'backup_rotativo_'+period,backupAt:new Date().toISOString(),data},null,2);
 if(payload.length>MAX)throw Error('Backup ultrapassa 5 MB');
 const boundary='bm243-backup-'+crypto.randomUUID();
 const meta={name:'BancoMestre_Lacunas_Backup_'+period+'_'+key+'_'+crypto.randomUUID().slice(0,8)+'.json',
  mimeType:'application/json',parents:[FOLDER],appProperties:{bm_kind:KIND,bm_schema:'V242',bm_period:period,bm_period_key:key}};
 const body='--'+boundary+'\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n'+JSON.stringify(meta)+
  '\r\n--'+boundary+'\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n'+payload+'\r\n--'+boundary+'--';
 const res=await req(token,UPLOAD+'?uploadType=multipart&fields=id,parents,appProperties',{
  method:'POST',headers:{'Content-Type':'multipart/related; boundary='+boundary},body});
 const o=await res.json();
 if(!o.id||!o.parents?.includes(FOLDER)||o.appProperties?.bm_kind!==KIND||o.appProperties?.bm_period_key!==key)
  throw Error('Gravação de backup não confirmada na pasta privada');
 const raw=await(await req(token,API+'/'+encodeURIComponent(o.id)+'?alt=media')).text();
 if(raw.length>MAX)throw Error('Cópia de backup excede limite');
 const got=JSON.parse(raw);
 if(got.format!=='BancoMestreLacunasV242')throw Error('Backup não é importável pela biblioteca');
 window.BM242Lacunas.validate(got.data);
 if(await digest(got.data)!==hash)throw Error('Leitura de backup não corresponde ao arquivo mestre');
 return o.id;
}
async function deleteOld(token,f,current){
 const p=f.appProperties||{},period=p.bm_period,key=p.bm_period_key;
 if(key===current[period])throw Error('Não excluir backup corrente');
 const v=await(await req(token,API+'/'+encodeURIComponent(f.id)+'?fields=id,parents,appProperties,trashed')).json();
 if(v.id!==f.id||v.trashed||!v.parents?.includes(FOLDER)||v.appProperties?.bm_kind!==KIND||
  v.appProperties?.bm_period!==period||v.appProperties?.bm_period_key!==key)
  throw Error('Backup modificado externamente: exclusão cancelada');
 await req(token,API+'/'+encodeURIComponent(f.id),{method:'DELETE'});
}
async function keepPeriods(token,data,hash){
 const current=keys(),before=await list(token);
 for(const p of ['daily','monthly']){
  if(!before.some(x=>x.appProperties.bm_period===p&&x.appProperties.bm_period_key===current[p]))
   await create(token,data,p,current[p],hash);
 }
 const existing=await list(token);
 for(const p of ['daily','monthly'])if(!existing.some(x=>x.appProperties.bm_period===p&&x.appProperties.bm_period_key===current[p]))
  throw Error('O backup corrente '+p+' não consta na conferência do Drive');
 let pruned=0;
 for(const [period,limit] of [['daily',30],['monthly',12]]){
  const group=existing.filter(x=>x.appProperties.bm_period===period);
  const distinct=[...new Set(group.map(x=>x.appProperties.bm_period_key))].sort().reverse();
  const keep=new Set(distinct.slice(0,limit));
  for(const file of group){
   if(keep.has(file.appProperties.bm_period_key))continue;
   await deleteOld(token,file,current);pruned++;
  }
 }
 const verified=await list(token);
 for(const [period,limit] of [['daily',30],['monthly',12]]){
  const group=verified.filter(x=>x.appProperties.bm_period===period);
  const keep=new Set([...new Set(group.map(x=>x.appProperties.bm_period_key))].sort().reverse().slice(0,limit));
  if(group.some(x=>!keep.has(x.appProperties.bm_period_key)))throw Error('Retenção de backups '+period+' não concluída');
 }
 const count=p=>new Set(verified.filter(x=>x.appProperties.bm_period===p).map(x=>x.appProperties.bm_period_key)).size;
 return {daily:count('daily'),monthly:count('monthly'),pruned};
}
async function confirmMasterCurrent(token,expected){
 const u=new URL(API);
 u.searchParams.set('q',"trashed = false and appProperties has { key='bm_kind' and value='bm_lacunas_v242' }");
 u.searchParams.set('fields','nextPageToken,incompleteSearch,files(id,appProperties)');
 u.searchParams.set('pageSize','100');
 const listing=await(await req(token,u.href)).json();
 if(listing.incompleteSearch||listing.nextPageToken)throw Error('Busca do mestre após backups incompleta');
 const masters=(listing.files||[]).filter(x=>x.appProperties?.bm_kind==='bm_lacunas_v242');
 if(masters.length!==1||!masters[0].id)throw Error('Mestre privado duplicado ou ausente após backups');
 const raw=await(await req(token,API+'/'+encodeURIComponent(masters[0].id)+'?alt=media')).text();
 if(raw.length>MAX)throw Error('Mestre remoto excede limite');
 const body=JSON.parse(raw);
 if(body.format!=='BancoMestreLacunasDriveV242')throw Error('Mestre remoto com formato inválido');
 window.BM242Lacunas.validate(body.data);
 if(await digest(body.data)!==expected)throw Error('Mestre modificado por outro dispositivo durante o backup');
}
function state(r){latest=r;document.dispatchEvent(new CustomEvent('bm242-lacunas-drive-status',{detail:r}));return r}
async function sync(token){
 if(active)return active;
 active=(async()=>{
  const r=await previous.sync(token);
  if(!['uploaded','downloaded','unchanged'].includes(r?.state))return state(r);
  try{
   const raw=localStorage.getItem(KEY),d=raw?JSON.parse(raw):{schema:1,records:[],log:[],updatedAt:null};
   window.BM242Lacunas.validate(d);
   const expected=await digest(d);
   if(localStorage.getItem(BASE)!==expected)throw Error('Dados locais diferem da última confirmação do mestre');
   const result=await keepPeriods(token,d,expected);
   const finalRaw=localStorage.getItem(KEY);
   if(!finalRaw||await digest(JSON.parse(finalRaw))!==expected)
    throw Error('Cadastro local modificado enquanto backups eram verificados');
   await confirmMasterCurrent(token,expected);
   return state({...r,message:r.message+' · backups verificados: '+result.daily+' datas diárias e '+result.monthly+' meses'+(result.pruned?' · '+result.pruned+' cópias antigas depuradas':'')});
  }catch(e){return state({state:'partial',message:r.message+' · backup rotativo pendente: '+e.message})}
 })().finally(()=>{active=null});return active;
}
window.BM242LacunasDrive=Object.freeze({sync,get lastResult(){return latest||previous.lastResult}});
window.BM243LacunasRetention=Object.freeze({get ready(){return true},get lastResult(){return latest}});
})();


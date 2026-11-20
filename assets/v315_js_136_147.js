/* V315 · IIFE scripts 136–147 em ordem */

;
/* 136 assets/v261_images_load_more.js */
/* Banco Mestre V261 — continuidade de imagens no Atlas do Drive.
 * Reposiciona o botão já existente de paginação para junto da galeria visível;
 * não muda filtros, contagem, autenticação, originais, cartões nem grifos.
 */
(function(){
'use strict';
if(window.BM261ImagePaging)return;
const $=id=>document.getElementById(id);
let installed=false,listenersReady=false,shown=0,matching=0,lastEvent=false;
const format=n=>Number(n).toLocaleString('pt-BR');
function driveReady(){
 const s=window.BancoMestreDriveImagesV182;
 return Boolean(s?.connected&&s?.lastSuccess);
}
function mount(){
 const section=$('imagens'),grid=$('imageRows'),driveMore=$('bm084-more');
 if(!section||!grid||!driveMore)return false;
 let viewport=$('bm221DriveViewport');
 if(!viewport){
  const parent=grid.parentElement;
  if(!parent||parent.closest('#bm153Results:not(.bm153Browsing)'))return false;
  viewport=parent;
 }
 let button=$('bm209More');
 if(!button){
  button=document.createElement('button');button.id='bm209More';button.type='button';
  button.textContent='Mostrar mais imagens';
  button.onclick=()=>{if(driveReady()&&!driveMore.hidden&&!driveMore.disabled)driveMore.click()};
 }
 // O módulo V209 deixava esse botão no #bm153Results, que continua oculto
 // pelo diretório V153 mesmo após a grade ser transferida ao viewport V221.
 if(button.parentElement!==viewport)viewport.append(button);
 let progress=$('bm261ImageProgress');
 if(!progress){
  progress=document.createElement('p');progress.id='bm261ImageProgress';
  progress.setAttribute('role','status');progress.setAttribute('aria-live','polite');
  progress.style.cssText='text-align:center;font-size:12px;color:#4e6d70;margin:5px 0 9px';
 }
 if(progress.parentElement!==viewport)viewport.insertBefore(progress,button);
 let style=$('bm261ImagePagingStyle');
 if(!style){
  style=document.createElement('style');style.id='bm261ImagePagingStyle';
  style.textContent=[
   '#imagens #bm221DriveViewport #bm209More{display:block!important;position:relative!important;min-height:44px;max-width:100%;padding:9px 16px;margin:9px auto 15px!important;font-size:12px!important;border-radius:8px;visibility:visible!important}',
   '#imagens #bm221DriveViewport #bm209More[hidden]{display:none!important}',
   '#imagens #bm221DriveViewport #bm261ImageProgress{display:block!important;max-width:100%;overflow-wrap:anywhere}',
   '#imagens #bm221DriveViewport{overflow:visible}',
   '@media(max-width:600px){#imagens #bm221DriveViewport #bm209More{width:min(100%,320px);min-height:44px}}'
  ].join('\n');
  document.head.append(style);
 }
 installed=true;
 return true;
}
function update(){
 if(!mount())return false;
 const button=$('bm209More'),native=$('bm084-more'),progress=$('bm261ImageProgress');
 if(!button||!native||!progress)return false;
 const ready=driveReady();
 const canMore=ready&&!native.hidden&&!native.disabled;
 button.hidden=!canMore;
 button.disabled=!canMore;
 if(lastEvent&&ready){
  button.textContent='Mostrar mais 24 imagens ('+format(shown)+' de '+format(matching)+')';
  progress.textContent=matching
   ?'Exibindo '+format(shown)+' de '+format(matching)+' imagens para os filtros atuais.'
   :'Nenhuma imagem corresponde aos filtros atuais.';
  if(shown>=matching)button.hidden=true;
 }else{
  button.textContent='Mostrar mais imagens';
  progress.textContent=ready?'Atualizando imagens filtradas…':'Conecte o Drive para consultar as imagens originais.';
 }
 return true;
}
function receive(ev){
 const d=ev?.detail||{};
 if(Number.isSafeInteger(d.shown)&&Number.isSafeInteger(d.matching)&&d.shown>=0&&d.matching>=0){
  shown=d.shown;matching=d.matching;lastEvent=true;
 }
 update();
}
function init(){
 if(listenersReady)return;
 // O V221 monta o viewport em DOMContentLoaded; este módulo é carregado por último.
 if(!mount())return;
 listenersReady=true;
 const native=$('bm084-more');
 if(native)new MutationObserver(update).observe(native,{attributes:true,attributeFilter:['hidden','disabled']});
 document.addEventListener('bm-media-drive-authorized',update);
 document.addEventListener('bm218-image-filter-change',()=>{lastEvent=false;update()});
 document.addEventListener('bm153-drive-filter-change',()=>{lastEvent=false;update()});
 window.addEventListener('hashchange',()=>{if(location.hash==='#imagens')update()});
 update();
}
document.addEventListener('bm209-drive-render',receive);
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
else init();
window.BM261ImagePaging=Object.freeze({refresh:update,get attached(){return installed},get shown(){return shown},get matching(){return matching}});
})();

;
/* 137 assets/v278_ui_icons_shadow.js */
/* V278 — mesma folha CSS no Controle isolado; sem alterar dados. */
(function(){'use strict';const id='bm278-light-icons-shadow';let n=0;
function apply(){const root=document.getElementById('bm240-native-host')?.shadowRoot;if(!root)return false;
if(!root.getElementById(id)){const link=document.createElement('link');link.id=id;link.rel='stylesheet';link.href='assets/v278_ui_icons.css?v=278-1';root.appendChild(link)}return true}
function retry(){if(apply()||n++>=36)return;setTimeout(retry,250)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',retry,{once:true});else retry()})();


;
/* 138 assets/v280_study_theme.js */
/* V280: paleta na interface isolada do Controle de Estudos, apenas CSS. */
(function(){'use strict';let count=0;
function add(){const root=document.getElementById('bm240-native-host')?.shadowRoot;
 if(!root)return false;if(root.getElementById('bm280-study-style'))return true;
 const style=document.createElement('style');style.id='bm280-study-style';
 style.textContent=`:host{--bg:#edf0f1;--paper:#fff;--ink:#344551;--accent:#1687d8;--line:#dfe5e8}
 header{background:#343d44!important;color:#eaf2f6!important}
 header h1{color:#eaf2f6!important}
 .panel{border-radius:5px!important;border-color:#e0e6ea!important;box-shadow:none!important}
 #bm252-main-nav button,#bm252-module-nav button{border-radius:4px!important}
 #bm252-main-nav button.active,#bm252-module-nav button.active{background:#1687d8!important;color:#fff!important}
 input,select{border-radius:4px!important;border-color:#cbd7de!important}
 `;root.append(style);return true}
function tick(){if(add()||count++>=45)return;setTimeout(tick,250)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',tick,{once:true});else tick();
})();


;
/* 139 assets/v283_popup_shadow_theme.js */
/* Banco Mestre V283 — harmonização de popups no Controle isolado. */
(function(){'use strict';let attempts=0;const id='bm283-popup-theme';
function apply(){
 const root=document.getElementById('bm240-native-host')?.shadowRoot;
 if(!root)return false;if(root.getElementById(id))return true;
 const s=document.createElement('style');s.id=id;
 s.textContent=`
 :host{--accent:#1687d8;--bg:#edf0f1;--paper:#fff;--ink:#344b5a;--sub:#6c7f8d;--line:#dce5ea}
 dialog,[role="dialog"],.modal,.popup,.popover{
  font-family:"Segoe UI",Arial,system-ui,sans-serif!important;
  color:#344b5a!important;background:#fff!important;border-color:#dce5ea!important;
  box-shadow:0 16px 52px #102c3c31!important
 }
 dialog :is(h2,h3,strong),[role="dialog"] :is(h2,h3,strong){color:#325a76!important}
 dialog :is(button,input,select,textarea),[role="dialog"] :is(button,input,select,textarea){
  font-family:"Segoe UI",Arial,sans-serif!important;border-radius:5px!important
 }
 dialog :is(input,select,textarea),[role="dialog"] :is(input,select,textarea){
  border-color:#ccdee8!important;background:#fff!important;color:#344b5a!important
 }
 dialog :is(button.primary,button.active),[role="dialog"] :is(button.primary,button.active){
  background:#1687d8!important;border-color:#1687d8!important;color:#fff!important
 }
 dialog :is(button,input,select,textarea):focus-visible,[role="dialog"] :is(button,input,select,textarea):focus-visible{
  outline:2px solid #65aee0!important;outline-offset:2px!important
 }
 `;root.append(s);return true
}
function retry(){if(apply()||attempts++>40)return;setTimeout(retry,250)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',retry,{once:true});else retry();
})();


;
/* 140 assets/v285_private_reconcile.js */
/* V285: reconciliação privada e aditiva. OAuth do titular obrigatório.
 * Não publica conteúdo do Drive, histórico SRS nem lacunas no GitHub.
 * Não sobrescreve frente/verso ou versões didáticas públicas. */
(function(){
'use strict';
if(window.BM285PrivateReconcile)return;
const ROOT='1cDkoy-QgXYdzhOzi8SMSr7g4eB4oskBD';
const API='https://www.googleapis.com/drive/v3/files';
const GAP='LACUNAS_PETRO22_INCREMENTO_PRIVADO_V001_2026-11-19.json';
const ENRICH=new Set(['CARD-0578','CARD-1028','CARD-1528','CARD-1532','CARD-0610']);
const $=id=>document.getElementById(id);
const token=()=>window.BM239DriveGlobal?.writeToken?.()||'';
let busy=false,last=null;
const fold=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim().toLowerCase();
const sig=r=>[fold(r.questaoId),fold(r.descricao),[...(r.cardIds||[])].sort().join(',')].join('|');
function status(msg,error){const x=$('bm285-result');if(x){x.textContent=msg;x.style.color=error?'#a33d39':'#42646a';}}
async function request(url){
 const t=token();if(!t)throw Error('Conecte o Google Drive pelo cabeçalho antes de sincronizar.');
 const r=await fetch(url,{headers:{Authorization:'Bearer '+t},cache:'no-store'});
 if(r.status===401)throw Error('A sessão Google expirou. Reconecte o Drive.');
 if(r.status===403)throw Error('Sem acesso ao arquivo privado do Google Drive.');
 if(!r.ok)throw Error('Drive HTTP '+r.status);
 return r;
}
async function list(query){
 let page='',out=[],count=0;
 do{
  if(++count>12)throw Error('A listagem de fontes privadas não terminou; operação cancelada.');
  const qs=new URLSearchParams({q:query,fields:'nextPageToken,incompleteSearch,files(id,name,mimeType,parents)',pageSize:'100'});
  if(page)qs.set('pageToken',page);
  const d=await(await request(API+'?'+qs)).json();
  if(d.incompleteSearch)throw Error('Listagem privada incompleta.');
  out.push(...(d.files||[]));page=d.nextPageToken||'';
 }while(page);
 return out.filter(x=>x.parents?.includes(ROOT)&&x.mimeType==='application/json');
}
async function named(name){
 const files=await list("trashed=false and name = '"+name+"' and '"+ROOT+"' in parents");
 const found=files.filter(f=>f.name===name);
 if(found.length!==1)throw Error('Arquivo privado ausente ou duplicado: '+name);
 return found[0];
}
async function current(){
 const found=(await list("trashed=false and name contains '00_FONTE_ATUAL_POR_FAMILIA_V' and '"+ROOT+"' in parents"))
  .filter(f=>/^00_FONTE_ATUAL_POR_FAMILIA_V\d{3}_[\w-]+\.json$/.test(f.name))
  .map(f=>({...f,n:+f.name.match(/_V(\d{3})_/)[1]})).sort((a,b)=>b.n-a.n);
 if(!found.length||(found[1]&&found[0].n===found[1].n))throw Error('Ponteiro atual do Banco Mestre não é único.');
 return found[0];
}
async function json(id,max=35000000){
 if(!/^[\w-]{15,}$/.test(id))throw Error('ID de arquivo privado inválido.');
 const r=await request(API+'/'+encodeURIComponent(id)+'?alt=media&supportsAllDrives=true');
 if(+r.headers.get('Content-Length')>max)throw Error('Pacote privado excede o limite de leitura.');
 const text=await r.text();
 if(text.length>max)throw Error('Pacote privado excede o limite de leitura.');
 return {data:JSON.parse(text),text};
}
async function digest(text){
 const bytes=new TextEncoder().encode(text);
 return [...new Uint8Array(await crypto.subtle.digest('SHA-256',bytes))].map(v=>v.toString(16).padStart(2,'0')).join('');
}
const valid11=c=>Array.isArray(c?.evolutive?.layers)&&c.evolutive.layers.length===11&&c.evolutive.layers.every((l,i)=>l.ord===i+1&&typeof l.titulo==='string'&&l.titulo.trim()&&typeof l.texto==='string'&&l.texto.trim());
async function cardsSync(){
 const pointer=await current(),p=(await json(pointer.id,60000)).data;
 if(p.schema!=='banco-mestre-operational-pointer/1'||p.pointer_version!=='V'+String(pointer.n).padStart(3,'0'))
  throw Error('O ponteiro da fonte canônica não corresponde ao arquivo.');
 const info=p.private_base||{},source=await json(info.file_id);
 if(await digest(source.text)!==info.sha256)throw Error('O SHA-256 do arquivo privado não confere.');
 const data=source.data;
 if(!/^BancoMestrePrivadoV\d+$/.test(data.format)||data.version!==info.version||
    !Array.isArray(data.cards)||data.cards.length!==info.cards||data.counts?.cards!==info.cards||
    !Array.isArray(data.srs)||data.srs.length!==info.srs_records)throw Error('Base privada com esquema ou contagem divergente.');
 const byId=new Map();
 for(const c of data.cards){
  if(!/^CARD-\d{4,}$/.test(c?.id)||typeof c.front!=='string'||!c.front.trim()||
     typeof c.back!=='string'||!c.back.trim()||byId.has(c.id))throw Error('ID inválido ou repetido: '+c?.id);
  byId.set(c.id,c);
 }
 if(data.srs.some(e=>!byId.has(e.id)))throw Error('Referência SRS inválida; nenhuma alteração aplicada.');
 if(typeof loadCards!=='function'||typeof cardRender!=='function'||!Array.isArray(cards))throw Error('Biblioteca pública ainda indisponível.');
 await loadCards();
 const publicCards=cards.filter(c=>/^CARD-\d{4,}$/.test(c.id));
 const absent=publicCards.filter(c=>!byId.has(c.id));
 if(absent.length)throw Error(absent.length+' IDs já publicados ausentes da fonte; bloqueado para não regredir.');
 const known=new Set(cards.map(c=>c.id)),extra=data.cards.filter(c=>!known.has(c.id));
 const targetIds=new Set([...ENRICH,...extra.map(c=>c.id)]);
 const approved=new Map();
 for(const id of targetIds){
  const c=byId.get(id);
  if(c&&valid11(c))approved.set(id,{id,layers:c.evolutive.layers});
  else if(c)throw Error('Cartão '+id+' sem os 11 módulos completos.');
 }
 // Sobreposição limitada aos IDs explicitamente afetados; demais módulos públicos intactos.
 const prior=window.BM276LayerData;
 window.BM276LayerData=Object.freeze({
  has:id=>approved.has(id)||!!prior?.has?.(id),
  get:id=>approved.get(id)||prior?.get?.(id)||null
 });
 const upgraded=cards.map(c=>{
  const r=byId.get(c.id);
  if(!r||!ENRICH.has(c.id))return c;
  return {...c,related_card_ids:r.related_card_ids||c.related_card_ids,
   related_image_ids:r.related_image_ids||c.related_image_ids,media_links:r.media_links||c.media_links,
   related_question_ids:r.related_question_ids||c.related_question_ids};
 });
 cards=[...upgraded,...extra];
 cardRender();
 document.dispatchEvent(new CustomEvent('bm-v185-cards-synced',{detail:{version:data.version,count:data.cards.length,source:'Drive private V285',srsApplied:false}}));
 return {version:data.version,added:extra.map(c=>c.id),modules:approved.size,images:data.images?.length||0,cardCount:data.cards.length};
}
async function gapsSync(){
 const ui=window.BM242Lacunas,api=window.BM242LacunasDrive;
 if(!ui?.validate||!ui?.applyRemote||!api?.sync)throw Error('Sincronizador das lacunas indisponível.');
 // Primeiro concilia a base local com o Drive sem apagar alterações concorrentes.
 const state=await api.sync(token());
 if(!['unchanged','downloaded','uploaded'].includes(state?.state))throw Error('Cadastro mestre não conciliado: '+(state?.message||'conflito'));
 const delta=(await json((await named(GAP)).id,2000000)).data;
 if(delta.format!=='BancoMestreLacunasIncrementalPrivadoV001'||delta.private!==true||delta.data?.schema!==1)
  throw Error('Incremento privado de lacunas em formato inesperado.');
 ui.validate(delta.data);
 const base=ui.data;ui.validate(base);
 const byId=new Map(base.records.map(r=>[r.id,r])),bySig=new Map(base.records.map(r=>[sig(r),r.id]));
 const merged=structuredClone(base);
 let added=0;
 for(const r of delta.data.records){
  const old=byId.get(r.id);
  if(old){if(JSON.stringify(old)!==JSON.stringify(r))throw Error('Conflito no ID '+r.id);continue;}
  const key=sig(r);if(bySig.has(key))throw Error('Lacuna equivalente já cadastrada sob '+bySig.get(key));
  merged.records.push(structuredClone(r));byId.set(r.id,r);bySig.set(key,r.id);added++;
 }
 if(added){
  for(const e of delta.data.log||[])if(e?.id&&!merged.log.some(x=>x.id===e.id))merged.log.push(structuredClone(e));
  const now=new Date().toISOString();
  merged.updatedAt=now;merged.log.push({id:'BM285-INCREMENTO-'+now,at:now,event:'mesclagem_privada_petro22_por_id',added});
  ui.validate(merged);ui.applyRemote(merged); // preserva cópia de recuperação local
  const finish=await api.sync(token());
  if(!['uploaded','unchanged'].includes(finish?.state))
   throw Error('Mesclagem local feita, mas Drive não confirmou a gravação: '+(finish?.message||'pendente'));
 }
 return {added,total:merged.records.length,verified:true};
}
async function execute(){
 if(busy)return;busy=true;const button=$('bm285-button');if(button)button.disabled=true;
 let result=null;
 try{
  if(!token())throw Error('Conecte o Drive no cabeçalho e tente novamente.');
  status('Verificando a fonte canônica mais recente e a integridade dos cartões…');
  result=await cardsSync();
  status(result.version+' conferida; conciliando lacunas privadas…');
  const gaps=await gapsSync();
  last={cards:result,gaps,at:new Date().toISOString()};
  status(result.cardCount+' cartões da '+result.version+' disponíveis nesta sessão; '+result.added.length+
   ' novo(s), '+result.modules+' módulos atualizados por ID; '+gaps.added+' lacuna(s) integradas e verificadas no Drive. SRS intacto.');
 }catch(e){
  status((result?'Cartões carregados, mas lacunas pendentes: ':'Não sincronizado: ')+e.message,true);
 }finally{busy=false;if(button)button.disabled=false;}
}
function mount(){
 const panel=$('cartoes')?.querySelector('.panel');if(!panel||$('bm285-button'))return;
 const host=document.createElement('div');host.className='notice';host.style.cssText='margin:10px 0;padding:10px 12px';
 const button=document.createElement('button');button.id='bm285-button';button.type='button';
 button.textContent='Sincronizar cartões e lacunas do Drive';button.addEventListener('click',execute);
 const line=document.createElement('p');line.id='bm285-result';line.style.cssText='font-size:12px;margin:6px 0 0';
 line.setAttribute('role','status');line.textContent='Autorização Google necessária. Dados privados não são publicados no GitHub.';
 host.append(button,line);panel.insertBefore(host,panel.querySelector('.controls')||panel.firstChild);
}
window.BM285PrivateReconcile=Object.freeze({sync:execute,get lastResult(){return last;}});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else mount();
})();

;
/* 141 assets/v286_study_blue.js */
/* V286 — mesmíssima fonte e azul no Controle isolado, inclusive calendário.
   A folha visual é colocada após as camadas V252/V253 quando são montadas.
   Sem observação contínua, escrita de dados ou mudanças no SRS. */
(function(){
'use strict';
if(window.BM286StudyBlue)return;
const id='bm286-blue-ui';
const rules=`
:host{
 --bm-ui-font:"Segoe UI",Arial,system-ui,sans-serif;--accent:#1687d8;
 --bg:#edf0f1;--paper:#fff;--ink:#344b5a;--sub:#6c7f8d;--line:#dce5eb;
 font:13px/1.5 var(--bm-ui-font)!important;color:#344b5a!important;background:#edf0f1!important
}
:host :is(header,main,section,article,.panel,.metric,.row,.item,.actions,.fields,.grid,.twocol,.notice,.hint,.status,.tag),
:host :is(h1,h2,h3,h4,h5,h6,p,span,small,strong,b,label,legend,summary,button,a,input,select,textarea,option,table,th,td,li){
 font-family:var(--bm-ui-font)!important
}
:host :is(pre,code,kbd,samp,math,math *){font-family:revert!important}
:host header{background:#fff!important;color:#344b5a!important;border-bottom-color:#e1e8ed!important}
:host header h1,:host main :is(h2,h3){color:#315f7f!important}
:host .panel,:host .metric{background:#fff!important;border-color:#dfe8ee!important;border-radius:5px!important;box-shadow:none!important}
:host button:not(.danger){
 color:#236b98!important;background:#fff!important;border-color:#c7d9e6!important;
 border-radius:5px!important;box-shadow:none!important
}
:host button:not(.danger):hover{color:#126da8!important;background:#f0f8fe!important}
:host button.primary:not(.danger),
:host #bm252-main-nav button[aria-selected="true"],
:host #bm252-main-nav button.active,:host .subtabs button.active{
 color:#fff!important;background:#1687d8!important;border-color:#1687d8!important;box-shadow:none!important
}
:host #bm252-main-nav button[aria-selected="true"]:hover,
:host button.primary:not(.danger):hover{color:#fff!important;background:#116ea9!important;border-color:#116ea9!important}
:host #bm252-main-nav button:not([aria-selected="true"]){
 color:#326a91!important;background:#f8fbfd!important;border-color:#c9dce8!important
}
:host #bm252-module-nav{background:#f1f7fb!important;border-color:#d9e6ef!important;border-radius:5px!important}
:host #bm252-module-nav button[aria-current="page"],:host #bm252-module-nav button.active{
 color:#126ba0!important;background:#e2f1fb!important;border-color:#1687d8!important
}
:host #bm252-calendar-head{border-color:#dce8f0!important}
:host #calTitle,:host .bm240-weeklabels span{color:#285f85!important}
:host #calendarioControle .bm240-day{color:#2c5875!important;background:#fff!important;border-color:#c8d9e5!important;border-radius:5px!important}
:host #calendarioControle .bm240-day[data-bm252-state="done"]{border-color:#78bbe7!important;background:#edf7fe!important}
:host #calendarioControle .bm240-day[data-bm252-state="planned"]{border-color:#d9bd80!important;background:#fffaf0!important}
:host #calendarioControle .bm240-day[data-bm252-state="both"]{border-color:#9db9d8!important;background:linear-gradient(135deg,#ebf6ff,#fff9ef)!important}
:host #calendarioControle .bm240-day.selected,
:host #calendarioControle .bm240-day[aria-selected="true"]{
 outline:2px solid #1687d8!important;outline-offset:0!important;
 border-color:#1687d8!important;background:#e5f3fc!important
}
:host #calendarioControle .bm252-dots .done,:host #bm252-legend .done i{background:#1687d8!important}
:host #bm252-legend .both i{background:linear-gradient(90deg,#1687d8 50%,#cf9241 50%)!important}
:host .progress>i,:host .bar{background:#1687d8!important}
:host .notice{background:#f1f7fc!important;border-left-color:#1687d8!important;color:#395971!important}
:host .tag{background:#eaf4fb!important;color:#2b6c96!important}
:host :is(input,select,textarea){font-family:var(--bm-ui-font)!important;color:#344b5a!important;background:#fff!important;border:1px solid #c5d9e7!important;border-radius:5px!important}
:host :is(input[type="checkbox"],input[type="radio"]){accent-color:#1687d8!important}
:host :is(button,input,select,textarea,[role="tab"],summary):focus-visible{outline:2px solid #63b1e5!important;outline-offset:2px!important}
:host :is(button,summary,[role="tab"])>svg:not([data-technical]),
:host :is(button,summary,[role="tab"]) .icon svg{
 width:15px!important;height:15px!important;stroke-width:1.5!important;
 stroke-linecap:round!important;stroke-linejoin:round!important
}
:host :is(button,summary,[role="tab"]){font-variant-emoji:text}
:host :is(dialog,[role="dialog"],.modal,.popup){
 font-family:var(--bm-ui-font)!important;color:#344b5a!important;background:#fff!important;border-color:#cbdfe9!important
}
:host :is(dialog,[role="dialog"],.modal,.popup) :is(h2,h3,strong){color:#326f98!important}
:host :is(dialog,[role="dialog"],.modal,.popup) :is(button,input,select,textarea){
 font-family:var(--bm-ui-font)!important;border-radius:5px!important
}
:host :is(dialog,[role="dialog"],.modal,.popup) button.primary:not(.danger){
 background:#1687d8!important;color:#fff!important;border-color:#1687d8!important
}
@media(max-width:680px){
 :host #bm252-main-nav button{font-size:11px!important;min-width:0!important}
 :host #bm252-module-nav button{font-size:11px!important}
}
`;
let inserted=false;
function refresh(){
 const root=document.getElementById('bm240-native-host')?.shadowRoot;if(!root)return false;
 let style=root.getElementById(id);
 if(!style){style=document.createElement('style');style.id=id;style.textContent=rules}
 if(root.lastElementChild!==style)root.append(style);
 inserted=true;return true;
}
for(const e of ['bm240-study-mounted','bm252-study-ready','bm253-calendar-compact-ready']){
 document.addEventListener(e,refresh);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',refresh,{once:true});
else refresh();
window.BM286StudyBlue=Object.freeze({refresh,get ready(){return inserted}});
})();


;
/* 142 assets/v287_study_consistency.js */
/* V287: reforço visual do Controle — azul consistente, sem escrever estado. */
(function(){
'use strict';
if(window.BM287Theme)return;
const key='bm287-theme';
const css=`
:host{--accent:#1687d8;--bg:#edf0f1;--paper:#fff;--ink:#344b5a;
 --sub:#5d7584;--line:#dce6ed;--bmfont:"Segoe UI",Arial,system-ui,sans-serif;
 font-family:var(--bmfont)!important;color:#344b5a!important}
:host :is(header,main,section,article,.panel,.metric,.notice,.row,.fields),
:host :is(h1,h2,h3,h4,h5,p,button,summary,label,input,select,textarea,li,span,small,th,td){
 font-family:var(--bmfont)!important}
:host #bm252-main-nav button[aria-selected="true"],
:host #bm252-main-nav button.active,:host button.primary:not(.danger),:host .subtabs button.active{
 background:#1687d8!important;border-color:#1687d8!important;color:#fff!important;box-shadow:none!important}
:host #bm252-main-nav button:not([aria-selected="true"]){
 background:#f8fbfe!important;border-color:#cadce8!important;color:#2d6b95!important}
:host #bm252-module-nav{background:#f0f7fc!important;border-color:#d8e6ee!important}
:host #bm252-module-nav button[aria-current="page"],
:host #bm252-module-nav button.active,
:host button[aria-pressed="true"]:not(.primary):not(.danger){
 background:#e8f4fc!important;border-color:#1687d8!important;color:#166eaa!important}
:host #calTitle,:host #calendarioControle>.panel>h2{color:#316486!important}
:host #calendarioControle .bm240-day.selected,
:host #calendarioControle .bm240-day[aria-selected="true"]{
 background:#e8f5fd!important;border-color:#1687d8!important;outline:2px solid #1687d8!important}
:host #calendarioControle .bm240-day[data-bm252-state="done"]{
 background:#eff8fe!important;border-color:#84bde5!important}
:host #calendarioControle .bm240-day[data-bm252-state="planned"]{
 background:#fff8ed!important;border-color:#d6ba84!important}
:host #calendarioControle .bm240-day[data-bm252-state="both"]{
 background:linear-gradient(135deg,#eff8fe,#fff8ed)!important;border-color:#b3c6d6!important}
:host #calendarioControle .bm252-dots .done,
:host #bm252-legend .done i,:host .bar,:host .progress>i{background:#1687d8!important}
:host .panel,:host .metric{border-color:#dce6ed!important;box-shadow:none!important}
:host .panel :is(p,li,td),:host .metric{color:#344b5a!important}
:host .notice{background:#f0f7fc!important;border-left-color:#1687d8!important}
:host :is(input[type="checkbox"],input[type="radio"],input[type="range"]){accent-color:#1687d8!important}
:host :is(button,input,select,textarea,summary):focus-visible{
 outline:2px solid #6bb8e8!important;outline-offset:2px!important}
:host :is(dialog,[role="dialog"],.modal,.popup){font-family:var(--bmfont)!important;
 color:#344b5a!important;background:#fff!important;border-color:#dce6ed!important}
:host :is(button,summary,[role="tab"])>svg:not([data-technical]){
 width:15px!important;height:15px!important;stroke-width:1.5!important}
`;
function apply(){
 const root=document.getElementById('bm240-native-host')?.shadowRoot;if(!root)return false;
 let style=root.getElementById(key);
 if(!style){style=document.createElement('style');style.id=key;style.textContent=css}
 if(root.lastElementChild!==style)root.append(style);
 return true
}
for(const event of ['bm240-study-mounted','bm252-study-ready','bm253-calendar-compact-ready']){
 document.addEventListener(event,apply)
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',apply,{once:true});
else apply();
window.BM287Theme=Object.freeze({refresh:apply});
})();


;
/* 143 assets/v288_surface_shadow.js */
/* V288 — superfícies do Controle nativo com o padrão do portal.
   Overlay somente de CSS, sem alterar calendário, registros, SRS ou cores semânticas. */
(function(){
'use strict';
if(window.BM288Surface)return;
const key='bm288-surface';
const rules=`
:host{--bm-paper:#fff;--bm-soft:#f8fafc;--bm-line:#dae5eb;--bm-ink:#2b3f4d;
 font-family:"Segoe UI",Arial,system-ui,sans-serif!important;color:#2b3f4d!important}
:host main{background:#edf0f1!important}
:host .panel,:host .metric{
 background:#fff!important;color:#2b3f4d!important;
 border:1px solid #dae5eb!important;border-radius:6px!important;
 box-shadow:0 1px 2px #1e3a4a0c!important
}
:host .panel :is(p,li,td),:host .metric :is(span,small){color:#344b5a!important}
:host :is(input:not([type="checkbox"]):not([type="radio"]),select,textarea){
 background:#fff!important;border:1px solid #c5d8e5!important;color:#2b3f4d!important;
 border-radius:5px!important
}
:host #bm252-module-nav{background:#f6f9fc!important;border-color:#dce8f0!important}
:host #bm252-module-nav button[aria-current="page"]{
 color:#176ca3!important;background:#eaf5fc!important;border-color:#1687d8!important
}
:host #calendarioControle .bm240-day:not([data-bm252-state="done"]):not([data-bm252-state="planned"]):not([data-bm252-state="both"]):not(.selected){
 background:#fff!important;border-color:#cbdce8!important
}
:host .bm252-month-stats span,:host #bm252-month-stats span{
 background:#fff!important;border-color:#dce8ee!important;color:#365d74!important
}
:host .notice{border-color:#dce8ee!important}
:host :is(dialog,[role="dialog"],.modal,.popup){background:#fff!important;color:#2b3f4d!important}
`;
function apply(){
 const root=document.getElementById('bm240-native-host')?.shadowRoot;
 if(!root)return false;
 let style=root.getElementById(key);
 if(!style){style=document.createElement('style');style.id=key;style.textContent=rules}
 if(root.lastElementChild!==style)root.append(style);
 return true;
}
for(const event of ['bm240-study-mounted','bm252-study-ready','bm253-calendar-compact-ready'])document.addEventListener(event,apply);
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',apply,{once:true});else apply();
window.BM288Surface=Object.freeze({refresh:apply});
})();


;
/* 144 assets/v312_private_compare_with_log.js */
/* V312: comparação SOMENTE LEITURA com LOG LOCAL de execução, carimbo de hora e exportação .txt. SHA conferido quando previsto; sem SHA, não certificado.
 * Sem escrita, importação, SRS, localStorage ou publicação.
 * A V285 mantém seu legado para rollback, mas o botão visível é substituído. */
(function(){
'use strict';
const ROOT='1cDkoy-QgXYdzhOzi8SMSr7g4eB4oskBD',API='https://www.googleapis.com/drive/v3/files';
const GAP='LACUNAS_PETRO22_INCREMENTO_PRIVADO_V001_2026-11-19.json';
const MASTER='BancoMestre_Lacunas_Mestre_V242.json';
const ID=/^CARD-\d{4,}$/,FILE=/^00_FONTE_ATUAL_POR_FAMILIA_V(\d{3})_[\w-]+\.json$/;
let busy=false,previous=null;
const $=id=>document.getElementById(id);
const norm=s=>String(s??'').replace(/\r\n?/g,'\n').trim();
const array=v=>Array.isArray(v)?v:[];
const eq=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const token=()=>window.BM239DriveGlobal?.writeToken?.()||window.BancoMestreMediaSyncV182?.token?.()||'';
async function drive(url){
 const t=token();if(!t)throw Error('Conecte o Google Drive no cabeçalho para consultar a base privada.');
 const r=await fetch(url,{headers:{Authorization:'Bearer '+t},cache:'no-store'});
 if(r.status===401)throw Error('Autorização Google expirada; reconecte o Drive.');
 if(r.status===403)throw Error('Permissão de leitura insuficiente para o Drive.');
 if(!r.ok)throw Error('Falha de leitura do Drive: HTTP '+r.status);
 return r;
}
async function files(q){
 let out=[],page='',n=0;
 do{
  if(++n>15)throw Error('Listagem incompleta: páginas demais.');
  const s=new URLSearchParams({q,fields:'nextPageToken,incompleteSearch,files(id,name,parents,mimeType)',pageSize:'100',supportsAllDrives:'true',includeItemsFromAllDrives:'true'});
  if(page)s.set('pageToken',page);
  const j=await(await drive(API+'?'+s)).json();
  if(j.incompleteSearch)throw Error('Listagem do Drive incompleta; não concluir a comparação.');
  out.push(...array(j.files));page=j.nextPageToken||'';
 }while(page);
 return out.filter(f=>f.parents?.includes(ROOT)&&f.mimeType==='application/json');
}
async function exact(name){
 const x=(await files("trashed=false and name = '"+name+"' and '"+ROOT+"' in parents")).filter(f=>f.name===name);
 if(x.length!==1)throw Error('Arquivo ausente ou duplicado no Drive: '+name);
 return x[0];
}
async function pointer(){
 const x=(await files("trashed=false and name contains '00_FONTE_ATUAL_POR_FAMILIA_V' and '"+ROOT+"' in parents"))
  .map(f=>({...f,n:+(f.name.match(FILE)||[])[1]})).filter(f=>Number.isInteger(f.n)).sort((a,b)=>b.n-a.n);
 if(!x.length||(x[1]&&x[0].n===x[1].n))throw Error('Ponteiro canônico não encontrado ou ambíguo.');
 return x[0];
}
async function read(id,max=35000000){
 if(!/^[\w-]{15,}$/.test(id))throw Error('ID inválido na fonte privada.');
 const r=await drive(API+'/'+encodeURIComponent(id)+'?alt=media&supportsAllDrives=true');
 if(Number(r.headers.get('Content-Length')||0)>max)throw Error('Arquivo excede o limite de conferência.');
 const rawBytes=await r.arrayBuffer();
 if(rawBytes.byteLength>max)throw Error('Arquivo excede o limite de conferência.');
 const raw=new TextDecoder('utf-8',{fatal:true}).decode(rawBytes);
 return {value:JSON.parse(raw),raw,rawBytes};
}
async function sha(rawBytes){
 const d=await crypto.subtle.digest('SHA-256',rawBytes);
 return [...new Uint8Array(d)].map(x=>x.toString(16).padStart(2,'0')).join('');
}
function valid11(c){return array(c?.evolutive?.layers).length===11&&c.evolutive.layers.every((m,i)=>m.ord===i+1&&norm(m.titulo)&&norm(m.texto));}
function layerSignature(c){return array(c?.layers).map(x=>[x.ord,norm(x.titulo),norm(x.texto)]);}
async function publicLayer(id){
 if(window.BM276LayerData?.has?.(id))return await window.BM276LayerData.get(id);
 return await window.BM194VersosPublicos?.load?.(id)||null;
}
const push=(a,id)=>{if(!a.includes(id))a.push(id)};
const msg=(str,isError=false)=>{const x=$('bm290-result');if(x){x.textContent=str;x.style.color=isError?'#9c3636':'#355b68';}};

/* O log é temporário na memória desta aba. Somente IDs, metadados e diagnósticos;
   nunca tokens OAuth, conteúdos dos cartões ou registros SRS pessoais. */
const LOG_LIMIT=10;let logRuns=[],logSerial=0,logCurrent=null,logSelected=null;
const localTimestamp=()=>new Date().toLocaleString('pt-BR',{timeZone:'America/Sao_Paulo',hour12:false});
function logText(run){
 if(!run)return 'Nenhuma execução registrada nesta aba.';
 const lines=[
  'BANCO MESTRE — LOG PRIVADO DE CONFERÊNCIA DRIVE × GITHUB',
  'Execução #'+run.id+' | Início: '+run.startLocal+' | Fim: '+(run.endLocal||'em andamento'),
  'Situação: '+run.status+' | Duração: '+(run.durationMs===null?'em andamento':(run.durationMs/1000).toFixed(2)+' s'),
  'Somente consulta. Nenhum dado foi sincronizado, importado ou publicado.',
  'Arquivo contém identificadores de cartões e informações de diagnóstico: não compartilhe publicamente.',
  ''
 ];
 for(const x of run.events)lines.push('['+x.at+'] ['+x.level+'] '+x.message);
 if(run.report){
  const r=run.report;
  lines.push('', '--- RESUMO VERIFICADO ---',
   'Drive: '+r.drive+' | GitHub: '+r.github+' | Integridade: '+r.integrity,
   'Cartões privados: '+r.privateCount+' | Cartões públicos: '+r.publicCount);
  for(const [title,ids] of Object.entries(r.categories)){
   lines.push(title+': '+ids.length);
   if(ids.length)lines.push('IDs: '+ids.join(', '));
  }
  if(r.gap){
   if(r.gap.error)lines.push('Lacunas: '+r.gap.error);
   else{
    lines.push('Lacunas: mestre='+r.gap.master+', incremento='+r.gap.delta+', pendentes no mestre='+r.gap.pending.length+', ausentes nesta sessão='+r.gap.localPending.length);
    if(r.gap.pending.length)lines.push('IDs de lacunas pendentes no mestre: '+r.gap.pending.join(', '));
   }
  }
 }
 return lines.join('\n')+'\n';
}
function displayLog(){
 const select=$('bm290-log-choose'),pre=$('bm290-log-output'),summary=$('bm290-log-summary');
 if(!select||!pre)return;
 const run=logRuns.find(x=>x.id===logSelected)||logRuns[0]||null;
 const value=logText(run);
 pre.textContent=value.length>50000?value.slice(0,50000)+'\n\n[Prévia limitada a 50.000 caracteres. Baixe o TXT para consultar o log completo.]':value;
 if(summary)summary.textContent=run?'Log da execução #'+run.id+' — '+run.status+' ('+run.events.length+' eventos)':'Log de verificação — nenhuma execução';
 for(const id of ['bm290-log-copy','bm290-log-save','bm290-log-clear']){
  const b=$(id);if(b)b.disabled=!run;
 }
}
function syncLogChooser(){
 const sel=$('bm290-log-choose');if(!sel)return;
 sel.replaceChildren();
 for(const run of logRuns){
  const opt=document.createElement('option');opt.value=String(run.id);
  opt.textContent='#'+run.id+' — '+run.startLocal+' — '+run.status;
  sel.append(opt);
 }
 sel.value=String(logSelected??'');
 displayLog();
}
function beginLog(){
 const run={id:++logSerial,startMs:Date.now(),startLocal:localTimestamp(),
  endLocal:null,durationMs:null,status:'Executando',events:[],report:null};
 logRuns.unshift(run);if(logRuns.length>LOG_LIMIT)logRuns.length=LOG_LIMIT;
 logCurrent=run;logSelected=run.id;syncLogChooser();
 trace('INÍCIO','Iniciada verificação somente de leitura. Origem: botão bm290-button.');
 const pane=$('bm290-log-panel');if(pane)pane.open=true;
 return run;
}
function trace(level,message){
 if(!logCurrent)return;
 logCurrent.events.push({at:localTimestamp(),level,message:String(message??'').slice(0,3000)});
 if(logSelected===logCurrent.id)displayLog();
}
function finishLog(status){
 if(!logCurrent)return;
 const run=logCurrent;run.status=status;run.endLocal=localTimestamp();
 run.durationMs=Math.max(0,Date.now()-run.startMs);
 trace('FIM','Execução '+status+' em '+(run.durationMs/1000).toFixed(2)+' segundos. Nenhuma escrita no Drive ou GitHub.');
 logCurrent=null;syncLogChooser();
}
function makeLogPanel(){
 const details=document.createElement('details');details.id='bm290-log-panel';
 details.style.cssText='margin-top:12px;border:1px solid #cbdce0;border-radius:8px;padding:10px;background:#f8fbfc';
 const summary=document.createElement('summary');summary.id='bm290-log-summary';
 summary.textContent='Log da verificação — nenhuma execução';
 summary.style.cssText='cursor:pointer;font-weight:650';
 details.append(summary);
 const note=document.createElement('p');note.style.cssText='font-size:12px;line-height:1.4';
 note.textContent='Histórico das últimas 10 execuções nesta aba. Não enviado ao Drive/GitHub; perdido ao recarregar, salvo se você baixar o TXT.';
 details.append(note);
 const bar=document.createElement('div');bar.style.cssText='display:flex;align-items:center;flex-wrap:wrap;gap:6px;margin:8px 0';
 const select=document.createElement('select');select.id='bm290-log-choose';
 select.setAttribute('aria-label','Selecionar execução do log');
 select.addEventListener('change',()=>{logSelected=Number(select.value);displayLog()});
 bar.append(select);
 const button=(id,label,fn)=>{
  const b=document.createElement('button');b.type='button';b.id=id;
  b.textContent=label;b.addEventListener('click',fn);bar.append(b);return b;
 };
 button('bm290-log-copy','Copiar log',async()=>{
  const run=logRuns.find(x=>x.id===logSelected);if(!run)return;
  try{
   if(!navigator.clipboard?.writeText)throw Error('Área de transferência indisponível');
   await navigator.clipboard.writeText(logText(run));
   const b=$('bm290-log-copy');if(b)b.textContent='Copiado';
  }catch(e){const b=$('bm290-log-copy');if(b)b.textContent='Use Baixar TXT';}
 });
 button('bm290-log-save','Baixar TXT',()=>{
  const run=logRuns.find(x=>x.id===logSelected);if(!run)return;
  const blob=new Blob(['\ufeff'+logText(run)],{type:'text/plain;charset=utf-8'});
  const url=URL.createObjectURL(blob),a=document.createElement('a');
  a.href=url;a.download='Banco_Mestre_Log_Comparacao_'+new Date(run.startMs).toISOString().slice(0,10)+'_exec-'+String(run.id).padStart(2,'0')+'.txt';
  document.body.append(a);a.click();a.remove();
  setTimeout(()=>URL.revokeObjectURL(url),1500);
 });
 button('bm290-log-clear','Limpar logs',()=>{
  if(busy)return;
  logRuns=[];logCurrent=null;logSelected=null;syncLogChooser();
 });
 details.append(bar);
 const pre=document.createElement('pre');pre.id='bm290-log-output';
 pre.style.cssText='white-space:pre-wrap;overflow-wrap:anywhere;overflow:auto;max-height:300px;border:1px solid #d6e4ea;background:white;padding:10px;font:12px/1.5 ui-monospace,Consolas,monospace';
 pre.setAttribute('aria-live','polite');
 details.append(pre);syncLogChooser();return details;
}

function putList(host,title,items,max=100){
 const details=document.createElement('details');details.style.cssText='padding:8px 0;border-top:1px solid #d8e2e8';
 const sum=document.createElement('summary');sum.textContent=title+' ('+items.length+')';sum.style.cssText='cursor:pointer;font-weight:650';
 details.append(sum);
 const content=document.createElement('p');content.style.cssText='font-size:12px;line-height:1.65;overflow-wrap:anywhere;margin:6px 0';
 content.textContent=items.length?(items.slice(0,max).join(' · ')+(items.length>max?' · … (mais '+(items.length-max)+')':'')):'Nenhuma diferença detectada';
 details.append(content);host.append(details);
}
async function compare(){
 if(busy)return;
 const btn=$('bm290-button');busy=true;if(btn)btn.disabled=true;
 const view=$('bm290-diff');if(view)view.replaceChildren();previous=null;
 beginLog();
 try{
  msg('Consultando o ponteiro vigente do Drive (somente leitura)…');
  const p=await pointer(),meta=(await read(p.id,80000)).value;
  trace('FONTE','Ponteiro encontrado: '+p.name+' (versão V'+String(p.n).padStart(3,'0')+').');
  if(meta.schema!=='banco-mestre-operational-pointer/1'||meta.pointer_version!=='V'+String(p.n).padStart(3,'0'))
   throw Error('Versão do ponteiro e seu arquivo não coincidem.');
  const source=meta.private_base||{};
  trace('FONTE','Origem privada indicada: '+String(source.version||'não informada')+'. Consultando bytes e esquema.');
  const r=await read(source.file_id);
  const expected=String(source.sha256||'').trim().toLowerCase();
  const withoutHash=expected==='';
  if(!withoutHash&&!/^[0-9a-f]{64}$/.test(expected))throw Error('Ponteiro contém SHA-256 malformado: comparação bloqueada.');
  // Sem SHA no ponteiro, NÃO declarar integridade certificada; permitir apenas relatório de leitura.
  const observed=await sha(r.rawBytes);
  trace('INTEGRIDADE',withoutHash?'Ponteiro sem assinatura SHA-256: relatório NÃO certificado. SHA calculado: '+observed:'Assinatura SHA-256 calculada sobre bytes recebidos; conferindo com ponteiro.');
  if(!withoutHash&&observed!==expected){
   const integrity=new Error('SHA-256 da fonte privada diverge; comparação cancelada.');
   integrity.details={
    pointerName:p.name,pointerId:p.id,sourceId:source.file_id,
    version:source.version||'não informada',expected,observed
   };
   throw integrity;
  }
  const data=r.value;
  if(!/^BancoMestrePrivadoV\d+$/.test(data.format)||data.version!==source.version||
   !Array.isArray(data.cards)||data.cards.length!==source.cards||data.counts?.cards!==source.cards||
   !Array.isArray(data.srs)||data.srs.length!==source.srs_records)throw Error('Contagens/esquema do Banco Mestre divergentes.');
  trace('VALIDAÇÃO','Esquema validado: '+data.cards.length+' cartões, '+data.srs.length+' registros SRS na fonte '+data.version+'.');
  const priv=new Map();
  for(const c of data.cards){
   if(!ID.test(c?.id||'')||!norm(c.front)||!norm(c.back)||priv.has(c.id))throw Error('Cartão privado inválido ou duplicado: '+c?.id);
   priv.set(c.id,c);
  }
  msg((withoutHash?'Ponteiro sem SHA-256: fonte '+data.version+' lida, relatório NÃO certificado. ':'Fonte '+data.version+' conferida. ')+'Comparando cartões e módulos públicos…');
  if(typeof loadCards!=='function'||!Array.isArray(cards))throw Error('Biblioteca pública não foi carregada.');
  await loadCards();
  const pub=new Map(cards.filter(c=>ID.test(c?.id||'')).map(c=>[c.id,c]));
  trace('CATÁLOGO','Biblioteca pública carregada: '+pub.size+' cartões canônicos; '+priv.size+' cartões privados.');
  const out={newIds:[],missingPrivate:[],frontBack:[],explanation:[],relations:[],modules:[],noPublicModule:[],deferred:[]};
  for(const [id,c] of pub)if(!priv.has(id))push(out.missingPrivate,id);
  let checked=0;
  for(const [id,c] of priv){
   const old=pub.get(id);
   if(!old){push(out.newIds,id);continue;}
   if(norm(c.front)!==norm(old.front)||norm(c.back)!==norm(old.back))push(out.frontBack,id);
   if(norm(c.expl)!==norm(old.expl)||norm(c.mnemonic)!==norm(old.mnemonic))push(out.explanation,id);
   for(const key of ['related_card_ids','related_question_ids','related_image_ids']){
    if(c[key]!==undefined && !eq(array(c[key]).map(String).sort(),array(old[key]).map(String).sort())){push(out.relations,id);break;}
   }
   if(!valid11(c)){push(out.deferred,id);continue;}
   const oldLayers=await publicLayer(id);
   if(!oldLayers||array(oldLayers.layers).length!==11){push(out.noPublicModule,id);continue;}
   if(!eq(layerSignature({layers:c.evolutive.layers}),layerSignature(oldLayers)))push(out.modules,id);
   checked++;
   if(checked%125===0){msg('Comparando os 11 módulos: '+checked+' cartões conferidos…');trace('PROGRESSO',checked+' cartões com 11 módulos comparados.')}
  }
  let gapReport=null;
  try{
   const [master,delta]=await Promise.all([exact(MASTER),exact(GAP)]);
   const [m,d]=await Promise.all([read(master.id,4000000),read(delta.id,4000000)]);
   const masterRecords=array(m.value?.data?.records),deltaRecords=array(d.value?.data?.records);
   if(!masterRecords.length||!deltaRecords.length)throw Error('cadastro sem registros válidos');
   const known=new Set(masterRecords.map(x=>x.id));
   const localIds=new Set(array(window.BM242Lacunas?.data?.records).map(x=>x.id));
   gapReport={master:masterRecords.length,delta:deltaRecords.length,
     pending:deltaRecords.map(x=>x.id).filter(id=>!known.has(id)),
     localPending:deltaRecords.map(x=>x.id).filter(id=>!localIds.has(id))};
   trace('LACUNAS','Mestre: '+gapReport.master+'; incremento: '+gapReport.delta+'; pendentes no mestre: '+gapReport.pending.length+'; ausentes nesta sessão: '+gapReport.localPending.length+'.');
  }catch(e){gapReport={error:'Não foi possível comparar o cadastro de lacunas: '+e.message};trace('AVISO',gapReport.error)}
  const site=await fetch('assets/version.json?compare=290',{cache:'no-store'}).then(r=>r.ok?r.json():null).catch(()=>null);
  const ver=site?.version||document.documentElement.dataset.bmPortalVersion||'não informada';
  trace('VERSÕES','Comparação: Drive '+data.version+' × GitHub '+ver+'.');
  msg((withoutHash?'Comparação de leitura concluída SEM certificação SHA-256 do ponteiro: ':'Conferência SHA-256 concluída: ')+'Drive '+data.version+' × GitHub '+ver+'. Nenhuma alteração realizada.');
  if(view){
   if(withoutHash){
    const warn=document.createElement('p');warn.style.cssText='font-size:12px;line-height:1.6;padding:8px;border-left:3px solid #aa7a25;background:#fffaf0;color:#684d20';
    warn.textContent='ATENÇÃO: o ponteiro '+p.name+' não possui SHA-256. O relatório abaixo compara dados lidos, mas NÃO certifica integridade da fonte. SHA-256 calculado dos bytes recebidos: '+observed+'. Corrija o ponteiro privado para uma verificação certificada.';
    view.append(warn);
   }
   const head=document.createElement('p');head.style.cssText='margin:6px 0 9px;font-size:12px;line-height:1.5';
   head.textContent='Drive '+data.version+': '+priv.size+' cartões · GitHub '+ver+': '+pub.size+' cartões canônicos. Diferenças não significam autorização automática de publicação.';
   view.append(head);
   putList(view,'Cartões ausentes no GitHub',out.newIds);
   putList(view,'Frente ou verso diferentes',out.frontBack);
   putList(view,'Explicações ou macetes diferentes',out.explanation);
   putList(view,'Vínculos/metadados relacionados diferentes',out.relations);
   putList(view,'11 módulos diferentes',out.modules);
   putList(view,'11 módulos públicos não conferíveis',out.noPublicModule);
   putList(view,'Cartões sem 11 módulos completos na fonte',out.deferred);
   if(out.missingPrivate.length)putList(view,'IDs publicados ausentes da fonte privada (bloqueio)',out.missingPrivate);
   if(gapReport.error){
    const w=document.createElement('p');w.textContent=gapReport.error;w.style.color='#9c3636';view.append(w);
   }else{
    const l=document.createElement('p');l.style.cssText='font-size:12px;margin:8px 0';
    l.textContent='Lacunas privadas: '+gapReport.master+' no mestre do Drive; '+gapReport.delta+' no incremento Petrobras 22; '+gapReport.pending.length+' IDs do incremento ausentes no mestre; '+gapReport.localPending.length+' não encontrados na biblioteca desta sessão. Sem gravar nenhum registro.';
    view.append(l);if(gapReport.pending.length)putList(view,'Lacunas pendentes no mestre',gapReport.pending);
   }
   const note=document.createElement('p');note.style.cssText='font-size:12px;color:#566a77;margin:8px 0 0';
   note.textContent='Verificação exclusivamente de leitura. Para integrar alterações aprovadas ao GitHub, solicite no ChatGPT. SRS e histórico privado não são publicados.';
   view.append(note);
  }
  previous={source:data.version,site:ver,integrity:withoutHash?'uncertified_missing_pointer_sha256':'sha256_confirmed',counts:Object.fromEntries(Object.entries(out).map(([k,a])=>[k,a.length])),gapReport,at:new Date().toISOString()};
  if(logCurrent)logCurrent.report={
   drive:data.version,github:ver,integrity:previous.integrity,
   privateCount:priv.size,publicCount:pub.size,
   categories:{
    'Cartões ausentes no GitHub':out.newIds,
    'IDs publicados ausentes da fonte privada':out.missingPrivate,
    'Frente ou verso diferentes':out.frontBack,
    'Explicações ou macetes diferentes':out.explanation,
    'Vínculos/metadados relacionados diferentes':out.relations,
    '11 módulos diferentes':out.modules,
    '11 módulos públicos não conferíveis':out.noPublicModule,
    '11 módulos incompletos na fonte privada':out.deferred
   },gap:gapReport
  };
  trace('RESULTADO',Object.entries(out).map(([k,v])=>k+': '+v.length).join(' | '));
  finishLog(withoutHash?'CONCLUÍDA SEM CERTIFICAÇÃO SHA-256':'CONCLUÍDA COM SHA-256 CONFIRMADO');
 }catch(e){
  trace('ERRO','Verificação interrompida: '+e.message);
  if(e.details)trace('INTEGRIDADE','SHA-256 esperado: '+e.details.expected+'; calculado: '+e.details.observed+'.');
  finishLog('FALHOU — '+e.message);
  msg('Verificação não concluída: '+e.message,true);
  if(view&&e.details){
   const info=e.details;
   const heading=document.createElement('h4');heading.textContent='Diagnóstico de integridade (somente leitura)';
   heading.style.cssText='font-size:13px;margin:10px 0 6px;color:#253e50';
   const explanation=document.createElement('p');
   explanation.style.cssText='font-size:12px;line-height:1.65;margin:0 0 8px;color:#334d60';
   explanation.textContent='O ponteiro vigente indica uma assinatura diferente dos bytes efetivamente recebidos do Drive. Isso pode ocorrer por fonte substituída, ponteiro desatualizado ou mudança de bytes do arquivo. Nenhuma comparação, integração ou alteração de SRS foi realizada.';
   const versions=document.createElement('p');
   versions.style.cssText='font-size:12px;line-height:1.5;margin:0 0 7px';
   versions.textContent='Ponteiro: '+info.pointerName+' · Fonte: '+info.version+' · ID da fonte: '+info.sourceId;
   const detail=document.createElement('details');
   const summary=document.createElement('summary');summary.textContent='Ver assinaturas SHA-256 para auditoria';
   detail.append(summary);
   const raw=document.createElement('pre');
   raw.style.cssText='font-size:11px;white-space:pre-wrap;overflow-wrap:anywhere;background:#f5f8fa;border:1px solid #d6e4ea;padding:8px';
   raw.textContent='Esperado no ponteiro: '+info.expected+'\nCalculado sobre os bytes: '+info.observed;
   detail.append(raw);
   const links=document.createElement('p');links.style.cssText='font-size:12px;margin:8px 0';
   const sourceLink=document.createElement('a');sourceLink.textContent='Abrir fonte no Drive';
   sourceLink.href='https://drive.google.com/file/d/'+encodeURIComponent(info.sourceId)+'/view';
   sourceLink.target='_blank';sourceLink.rel='noopener noreferrer';
   const pointerLink=document.createElement('a');pointerLink.textContent='Abrir ponteiro no Drive';
   pointerLink.href='https://drive.google.com/file/d/'+encodeURIComponent(info.pointerId)+'/view';
   pointerLink.target='_blank';pointerLink.rel='noopener noreferrer';
   links.append(sourceLink,document.createTextNode(' · '),pointerLink);
   const note=document.createElement('p');note.style.cssText='font-size:12px;color:#955050';
   note.textContent='Não atualize o SHA automaticamente para fazer a verificação passar. Confira o arquivo correto e o histórico de versões do Drive antes de corrigir o ponteiro.';
   view.append(heading,explanation,versions,detail,links,note);
  }
 }
 finally{if(logCurrent)finishLog('INTERROMPIDA');busy=false;if(btn)btn.disabled=false;}
}
function mount(){
 const old=$('bm285-button');if(!old||$('bm290-button'))return;
 const b=old.cloneNode(true);b.id='bm290-button';b.textContent='Verificar diferenças Drive × GitHub';
 b.title='Somente consulta: não importa, sincroniza nem publica cartões ou lacunas.';
 old.replaceWith(b);
 const state=$('bm285-result');if(state){state.id='bm290-result';state.textContent='Comparador de leitura: nenhuma alteração será aplicada.';}
 const box=document.createElement('div');box.id='bm290-diff';box.style.cssText='margin-top:9px;max-height:340px;overflow:auto;border-top:1px solid #d8e2e8';box.setAttribute('aria-live','polite');
 const host=state?.parentElement||b.parentElement;
 if(host){host.append(box,makeLogPanel());}
 b.addEventListener('click',compare);
 window.BM285PrivateReconcile=Object.freeze({verify:compare,get lastResult(){return previous;},mode:'read-only',get logRuns(){return logRuns.length;}});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else mount();
})();


;
/* 145 assets/v291_study_square.js */
/* V291 — contraste e contornos retos no Controle isolado; sem escrita. */
(function(){'use strict';
if(window.BM291StudyContrast)return;
const id='bm291-study-contrast';
const rules=`
:host{--ink:#1c2730;--sub:#354653;--line:#bdccd5;color:#1c2730!important;
 font-family:"Segoe UI",Arial,system-ui,sans-serif!important}
:host :is(.panel,.metric,.item,.row,.notice,.bm240-day,.bm240-pad){
 border-radius:0!important;box-shadow:none!important;border-color:#bdccd5!important}
:host .panel,:host .metric{background:#fff!important}
:host .panel :is(p,li,td,th),:host .metric :is(span,small),
:host #calendarioControle .bm240-day :is(b,span,small){color:#1c2730!important}
:host :is(input:not([type="checkbox"]):not([type="radio"]),select,textarea,button){border-radius:0!important}
:host #bm252-main-nav button[aria-selected="true"]{
 background:#1687d8!important;color:#fff!important;border-color:#1687d8!important}
:host #bm252-module-nav button[aria-current="page"]{
 background:#e9f5fc!important;color:#196a9c!important;border-color:#1687d8!important}
:host :is(dialog,[role="dialog"],.popup,.modal){border-radius:0!important;color:#1c2730!important}
`;
function apply(){const root=document.getElementById('bm240-native-host')?.shadowRoot;if(!root)return false;
let s=root.getElementById(id);if(!s){s=document.createElement('style');s.id=id;s.textContent=rules}
if(root.lastElementChild!==s)root.append(s);return true}
for(const ev of ['bm240-study-mounted','bm252-study-ready','bm253-calendar-compact-ready'])document.addEventListener(ev,apply);
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',apply,{once:true});else apply();
window.BM291StudyContrast=Object.freeze({refresh:apply});
})();

;
/* 146 assets/v292_study_visual.js */
/* V292 — mesma hierarquia tipográfica nas telas encapsuladas do Controle.
 * Camada de CSS apenas; não modifica calendário, SRS, eventos, Drive ou estados. */
(function(){
'use strict';
if(window.BM292VisualSystem)return;
const id='bm292-visual-system';
const stylesheet=`
:host{
 --bm-ui-font:"Segoe UI",Arial,system-ui,sans-serif;
 --accent:#1687d8;--ink:#1c2730;--sub:#445967;--bg:#edf0f1;
 --paper:#fff;--line:#b9c9d3;
 color:#1c2730!important;font:400 13px/1.55 var(--bm-ui-font)!important
}
:host :is(header,main,section,article,.panel,.metric,.row,.fields,.notice,.subtabs),
:host :is(h1,h2,h3,h4,h5,h6,button,input,select,textarea,summary,label,
 p,span,small,strong,li,td,th){
 font-family:var(--bm-ui-font)!important
}
:host header h1{color:#203440!important;font-size:16px!important;font-weight:700!important}
:host main :is(h2,h3){color:#203440!important;font-weight:700!important;line-height:1.4!important}
:host main h2{font-size:16px!important}
:host main h3{font-size:14px!important}
:host .panel :is(p,li,td,th),:host .metric :is(span,small){
 color:#1c2730!important;font-size:12.5px!important;line-height:1.55!important
}
:host #bm252-main-nav button,:host #bm252-module-nav button,
:host .subtabs button,:host button{
 font:600 12px/1.4 var(--bm-ui-font)!important
}
:host #bm252-main-nav button[aria-selected="true"],
:host #bm252-main-nav button.active,:host button.primary:not(.danger),
:host .subtabs button.active{
 color:#fff!important;background:#1687d8!important;border-color:#1687d8!important
}
:host #bm252-module-nav button[aria-current="page"],
:host #bm252-module-nav button.active{
 color:#176c9b!important;background:#e9f5fc!important;border-color:#1687d8!important
}
:host :is(input:not([type="checkbox"]):not([type="radio"]),select,textarea){
 color:#1c2730!important;font:400 12.5px/1.45 var(--bm-ui-font)!important
}
:host .bm240-weeklabels span,:host #calTitle{
 font-family:var(--bm-ui-font)!important;color:#334e62!important
}
:host .bm240-weeklabels span{font-size:11px!important}
:host #calTitle{font-size:14px!important;font-weight:700!important}
:host #calendarioControle .bm240-day :is(b,span,small){
 font-family:var(--bm-ui-font)!important;font-size:11px!important;color:#1c2730!important
}
:host :is(dialog,[role="dialog"],.modal,.popup){
 color:#1c2730!important;font:400 13px/1.55 var(--bm-ui-font)!important
}
:host :is(dialog,[role="dialog"],.modal,.popup) :is(h2,h3){
 color:#203440!important;font-weight:700!important
}
:host :is(dialog,[role="dialog"],.modal,.popup) :is(p,label,button,select,input,textarea){
 font-family:var(--bm-ui-font)!important
}
@media(max-width:700px){
 :host #bm252-main-nav button,:host #bm252-module-nav button{font-size:11px!important}
 :host main h2{font-size:15px!important}
}
`;
function apply(){
 const root=document.getElementById('bm240-native-host')?.shadowRoot;
 if(!root)return false;
 let style=root.getElementById(id);
 if(!style){style=document.createElement('style');style.id=id;style.textContent=stylesheet}
 if(root.lastElementChild!==style)root.append(style);
 return true;
}
for(const event of ['bm240-study-mounted','bm252-study-ready','bm253-calendar-compact-ready']){
 document.addEventListener(event,apply);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',apply,{once:true});
else apply();
window.BM292VisualSystem=Object.freeze({refresh:apply});
})();


;
/* 147 assets/v303_toolbar_reorder.js */
/* V293: mesmos elementos e listeners da biblioteca; botão legado PDF apenas removido da UI. */
(function(){'use strict';
if(window.BM293CompactLayout)return;
const $=id=>document.getElementById(id);
let imageReady=false;
function removeOldPdfButton(){
 const root=$('pdfs');if(!root)return false;
 let removed=false;
 for(const btn of root.querySelectorAll('#bm151-pdf-check button,#bm210PdfToolbar button')){
  const name=(btn.textContent||'')+' '+(btn.title||'');
  if(/Verificar\s*(?:78\s*)?PDFs/i.test(name)){btn.remove();removed=true}
 }
 return removed;
}
function reorder(){
 const bar=document.querySelector('#imagens #bm209SyncBar.bm210ImageToolbar');
 const search=$('imageSearch'),filters=$('bm155ImageFilters');
 const ids=['bm155DisciplinaImagem','bm155AssuntoGeralImagem','bm155AssuntoEspecificoImagem','bm155SubassuntoImagem'];
 const fields=ids.map(id=>$(id)?.closest('label'));
 if(!bar||!search||!filters||fields.some(x=>!x))return false;
 const prevSearch=$('bm293ImageSearchRow'),prevActions=$('bm293ImageActions');
 if(bar.dataset.bm293Reordered==='yes'&&prevSearch?.contains(search)&&
    filters.parentElement===bar&&fields.every(x=>x.parentElement===filters)){
  imageReady=true;return true;
 }
 const searchRow=prevSearch||document.createElement('div');
 searchRow.id='bm293ImageSearchRow';
 const actions=prevActions||document.createElement('div');
 actions.id='bm293ImageActions';
 const details=$('bm210ImageInfo'),extra=details?.querySelector('.bm210StatusBody');
 searchRow.append(search);
 for(const field of fields)filters.append(field);
 for(const node of [...bar.children]){
  if(node===searchRow||node===filters||node===actions||node===details)continue;
  if(node===search||fields.includes(node))continue;
  const label=((node.textContent||'')+' '+(node.getAttribute('aria-label')||'')).toLowerCase();
  const secondary=node.tagName==='SELECT'||(node.tagName==='LABEL'&&
    !!node.querySelector('select')&&!/tipo|mostrar|classificar/.test(label));
  if(secondary&&extra)extra.append(node);
  else actions.append(node);
 }
 bar.prepend(searchRow);searchRow.after(filters);filters.after(actions);
 if(details)actions.after(details);
 const foot=filters.querySelector('.bm155Foot');
 if(foot&&!foot.querySelector('button,input,select')&&!foot.textContent.trim())foot.hidden=true;
 bar.dataset.bm293Reordered='yes';imageReady=true;return true;
}
function init(){
 removeOldPdfButton();
 if(reorder())return;
 let attempts=0;
 const retry=()=>{
  removeOldPdfButton();
  if(reorder()||++attempts>=20)return;
  setTimeout(retry,250);
 };
 setTimeout(retry,250);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
else init();
// A V303 monta um toolbar estável; não remova os filtros de seu local após trocar de aba.
document.querySelector('header nav button[data-page="imagens"]')?.addEventListener('click',()=>setTimeout(()=>{
 if(!window.BM303UnifiedFilters?.ready)reorder();
},0));
window.BM293CompactLayout=Object.freeze({reorder,removeOldPdfButton,get imageReady(){return imageReady}});
})();

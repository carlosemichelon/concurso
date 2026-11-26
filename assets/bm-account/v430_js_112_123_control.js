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
const connected=()=>Boolean(window.BMAccountInfo?.());
function update(){
 for(const x of document.querySelectorAll('.bm225-drive-auth')){
  const span=x.querySelector('[data-state]'),button=x.querySelector('button');
  if(!span||!button)continue;
  const yes=connected();
  x.dataset.connected=yes?'yes':'no';
  span.textContent=yes
   ?'Google Drive conectado nesta visita · imagens e PDFs compartilham o acesso'
   :'Entre com Google para consultar os seus dados';
  button.hidden=yes;button.disabled=yes;
  button.textContent='Usuário / Login';
 }
}
function promptForDrive(){document.getElementById('bm239-drive-action')?.click();return true;}
function mountTo(panel,position){
 if(!panel||panel.querySelector('.bm225-drive-auth'))return;
 const wrap=document.createElement('div');wrap.className='bm225-drive-auth';
 wrap.setAttribute('aria-label','Conexão de imagens e PDFs');
 const text=document.createElement('span');text.dataset.state='1';text.setAttribute('role','status');
 const button=document.createElement('button');button.type='button';
 button.textContent='Usuário / Login';button.onclick=promptForDrive;
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
 section.append(host);const footer=main.querySelector(':scope > footer');if(footer)main.insertBefore(section,footer);else main.append(section);
 const root=host.attachShadow({mode:'open'});
 const loading=document.createElement('p');loading.textContent='Carregando Controle de Estudos...';loading.style.padding='25px';
 root.append(loading);
 button.addEventListener('click',event=>{
  event.preventDefault();event.stopImmediatePropagation();
  history.replaceState(null,'','#controle-estudos');
  document.querySelectorAll('main>section').forEach(p=>p.classList.toggle('active',p===section));
  document.querySelectorAll('header nav button[data-page]').forEach(b=>b.classList.toggle('active',b===button));
  section.hidden=false;
  window.scrollTo({top:0,behavior:'instant'});
 },true);
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
 // No automatic dashboard on entry. Only explicit navigation or a deep link.
 if(location.hash==='#controle-estudos')button.click();

 try{
  const response=await fetch('./controle-estudos-v415.html?ref=415',{cache:'no-cache'});
  if(!response.ok)throw Error('Interface indisponível ('+response.status+')');
  const doc=new DOMParser().parseFromString(await response.text(),'text/html');
  if(!doc.getElementById('tabs')||!doc.getElementById('sessionForm')||!doc.getElementById('calGrid'))throw Error('Estrutura de interface incompleta');
  const style=document.createElement('style');
  style.textContent=doc.querySelector('style')?.textContent||'';

  // Before login, use the same compact access gate as the other private sections.
  // The original dashboard is mounted only after the verified account is available.
  const template=[...doc.body.children].filter(e=>e.tagName!=='SCRIPT');
  const mountTemplate=()=>{
   const content=template.map(e=>e.cloneNode(true));
   root.replaceChildren(style,...content);
   return content;
  };
  const gate=document.createElement('div');gate.className='panel';gate.style.cssText='margin:0;padding:20px;border:0;background:#fff';
  const heading=document.createElement('h2');heading.textContent='Controle de Estudos';
  const msg=document.createElement('p');msg.setAttribute('role','status');msg.textContent='Conecte sua conta Google para acessar o Controle de Estudos e o histórico individual no Drive.';
  const login=document.createElement('button');login.type='button';login.textContent='Entrar com Google';login.onclick=()=>document.getElementById('bm239-drive-action')?.click();
  gate.append(heading,msg,login);root.replaceChildren(style,gate);
  if(!window.BMVS41Session?.available()){
   await new Promise(resolve=>{
    const ready=()=>{document.removeEventListener('bm-vs41-session-ready',ready);resolve()};
    document.addEventListener('bm-vs41-session-ready',ready);
    if(window.BMVS41Session?.available())ready();
   });
  }
  msg.textContent='Conferindo Controle de Estudos no Drive individual…';login.hidden=true;
  await new Promise((resolve,reject)=>{
   if(typeof window.BM240ControlInit==='function')return resolve();
   const script=document.createElement('script');
   script.src='assets/v415_controle_app.js?v=session-planning-2';
   script.onload=resolve;script.onerror=()=>reject(Error('Módulo de estudos não carregou'));
   document.head.append(script);
  });
  // Fresh nodes remove all guest handlers; private app owns its real controls.
  const content=mountTemplate();for(const element of content)element.inert=true;
  await window.BM240ControlInit(root);
  for(const element of content)element.inert=false;
  installMobileRegisterCollapse(root);
  window.BancoMestreIconsV096?.refresh?.();
  document.dispatchEvent(new CustomEvent('bm240-study-mounted'));
 }catch(e){
  root.replaceChildren(loading);loading.textContent='Não foi possível carregar o Controle de Estudos: '+e.message;
  loading.setAttribute('role','alert');console.error('V240 Controle:',e);
 }
 // Preserve the section chosen by the student during authentication.
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
window.BM240ControlDrive=Object.freeze({async sync(){return window.BMVS41StudyControl?.refresh?.()||{state:'error',message:'Controle não carregado'}}});
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
let data=null,persisted=null,revisions=Object.create(null),syncState='Consultando cadastro privado',busy=false,refreshing=null,lastResult=null;
 function accept(p){
  validate(p.data);if(!p.revisions||p.data.records.some(r=>!Object.hasOwn(p.revisions,r.id)||typeof p.revisions[r.id]!=='string'))throw Error('Revisões inválidas');
  data=structuredClone(p.data);persisted=JSON.stringify(data);revisions={...p.revisions};bm430GapVerified=true;
  syncState='Lacunas privadas conferidas no Drive';lastResult={state:'downloaded',message:syncState};render();
 }
 async function sync(force=false){
  if(busy)return {state:'busy',message:'Aguarde a gravação'};
  if(refreshing)return refreshing;
   if(force!==true&&bm430GapVerified&&data&&lastResult?.state==='downloaded')return lastResult;
  refreshing=(async()=>{try{accept(await window.BMVS41PrivateGaps.read());return lastResult}
   catch(e){data=null;persisted=null;revisions=Object.create(null);bm430GapVerified=false;lastResult={state:'error',message:e.message};syncState=e.message;render();return lastResult}
   finally{refreshing=null;render()}})();render();return refreshing;
 }
 async function write(event,r){
  if(!data||!persisted||busy||refreshing||!bm430GapVerified){if(persisted)data=JSON.parse(persisted);throw Error('Cadastro privado não confirmado ou ocupado')}
  const record=structuredClone(r),previous=revisions[r.id]||null,event_id=crypto.randomUUID();
  // Keep the visible list on the last confirmed revision until the server acknowledges the write.
  data=JSON.parse(persisted);busy=true;syncState='Gravando lacuna privada…';render();
  try{
   const p=await window.BMVS41PrivateGaps.save({event_id,previous,event,record});
   if(p.revision!==event_id||p.record?.id!==record.id||!p.at)throw Error('Confirmação divergente');
   const idx=data.records.findIndex(x=>x.id===record.id);
   if(idx<0)data.records.push(p.record);else data.records[idx]=p.record;
   data.log.push({id:event_id,at:p.at,event,lacunaId:record.id});data.updatedAt=p.at;revisions[record.id]=p.revision;
   validate(data);persisted=JSON.stringify(data);syncState='Lacunas privadas conferidas no Drive';lastResult={state:'downloaded',message:syncState};
   document.dispatchEvent(new CustomEvent('bm-vs41-gap-confirmed',{detail:{id:record.id,event}}));
  }catch(e){data=JSON.parse(persisted);bm430GapVerified=false;lastResult={state:'error',message:e.message};syncState='Gravação não confirmada: '+e.message;throw e}
  finally{busy=false;render()}
 }
 function applyRemote(){throw Error('Importação histórica ainda não homologada para perfis privados')}
 window.BM242LacunasDrive=Object.freeze({sync,get lastResult(){return lastResult}});
 
function cards(raw){
 const v=[...new Set(String(raw||'').split(/[;,\s]+/).map(x=>x.trim()).filter(Boolean))];
 if(v.some(x=>!(/^[a-z0-9][a-z0-9_-]{2,45}$/i.test(x))))throw Error('IDs de cartões inválidos');
 return v;
}
let bm430GapVerified=false,renderedGapData=null,renderedGapFilters=null;
const gapFilterIds=['bm242-search','bm242-discipline','bm242-general','bm242-specific','bm242-sub','bm242-priority','bm242-type','bm242-cover','bm242-stage'];
const gapFilterKey=()=>JSON.stringify(gapFilterIds.map(id=>$(id)?.value||''));
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
 '<button type="submit">Salvar lacuna</button></form></details>',
 '<div class="bm242-actions"><button id="bm242-refresh" type="button">Atualizar lacunas do Drive</button><button id="bm242-export" type="button">Exportar JSON</button>',
 '<label>Importar backup JSON<input id="bm242-import" type="file" accept=".json,application/json"></label></div>',
 '<p id="bm242-form-msg" role="status"></p>',
 '<p class="bm242-muted">Dados privados gravados na conta autenticada. Dados pessoais não vão ao GitHub.</p></div>'
 ].join('');
 main.append(section);
 button.onclick=()=>{if(!bm430GapVerified&&!refreshing&&!busy)void sync();if(typeof window.section==='function')window.section('lacunas');else{main.querySelectorAll('section').forEach(x=>x.classList.toggle('active',x===section));nav.querySelectorAll('button').forEach(x=>x.classList.toggle('active',x===button));location.hash='lacunas'}};
 for(const id of ['bm242-search','bm242-discipline','bm242-general','bm242-specific','bm242-sub','bm242-type','bm242-cover','bm242-stage','bm242-priority']){
  $(id).addEventListener('input',render);$(id).addEventListener('change',render);
 }
 for(const t of types)$('bm242-form').elements.tipo.add(new Option(t,t));
 for(const c of coverage)$('bm242-form').elements.cobertura.add(new Option(c,c));
 $('bm242-form').addEventListener('submit',async e=>{
  e.preventDefault();
  try{
   const f=e.currentTarget,v=new FormData(f),g=k=>String(v.get(k)||'').trim();
   if(!data||busy||refreshing||!bm430GapVerified)throw Error('Cadastro indisponível ou ocupado');
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
   data.records.push(r);await write('lacuna_criada',r);f.reset();$('bm242-new').open=false;
   $('bm242-form-msg').textContent=r.id+' gravada e conferida no Drive';
  }catch(err){$('bm242-form-msg').textContent=err.message}
 });
 $('bm242-list').addEventListener('click',async e=>{
 if(busy||refreshing||!bm430GapVerified)return;
 try{
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
   await write('relato_ou_complemento_adicionado',r);return;
  }
  const noteBtn=e.target.closest('button[data-note]');
  if(noteBtn&&data){
   const r=data.records.find(x=>x.id===noteBtn.dataset.note);if(!r)return;
   const note=prompt('Acrescente uma pesquisa, evidência, observação ou fonte (não altera o relato original):');
   if(note===null||!note.trim())return;
   r.updatedAt=new Date().toISOString();
   r.historico.push({at:r.updatedAt,evento:'complemento',nota:note});
   await write('complemento_adicionado',r);return;
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
  await write('etapa_atualizada',r);
 }catch(err){$('bm242-form-msg').textContent=err.message}
 });
 $('bm242-export').onclick=()=>{
  if(!data)return;
  const blob=new Blob([JSON.stringify({format:'BancoMestreLacunasV242',data},null,2)],{type:'application/json'});
  const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='BancoMestre_Lacunas_V242.json';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),500);
 };
 $('bm242-refresh').onclick=()=>{if(!busy&&!refreshing)void sync(true)};
 $('bm242-import').disabled=true;$('bm242-import').title='Importação histórica ainda não homologada para perfis privados';
 let wasActive=section.classList.contains('active');
 new MutationObserver(()=>{const active=section.classList.contains('active');if(active===wasActive)return;wasActive=active;if(active){if(!bm430GapVerified&&!refreshing&&!busy)void sync();render()}}).observe(section,{attributes:true,attributeFilter:['class']});
 
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
 const pane=$('lacunas');if(!pane?.classList.contains('active'))return;
 const ready=bm430GapVerified&&!!data;
 $('bm242-refresh').disabled=busy||refreshing!==null;
 pane.classList.toggle('bm430-gap-wait',!ready);
 if(!ready){$('bm242-state').hidden=false;$('bm242-state').textContent=syncState;if($('bm242-list').childElementCount)$('bm242-list').replaceChildren();renderedGapData=null;renderedGapFilters=null;return;}
 $('bm242-form').querySelector('button[type=submit]').disabled=busy||refreshing!==null;
 $('bm242-state').textContent=data?syncState:'Dados locais inválidos: escrita bloqueada e originais preservados';$('bm242-state').hidden=Boolean(data&&/conferid|verificad|idêntic/i.test(syncState)&&!/falha|erro|pendente|conflito/i.test(syncState));
 if(!data){$('bm242-list').textContent='Importe uma cópia válida para recuperar o cadastro';return}
 // Preserve expanded records, selection and the existing DOM on a tab revisit.
 if(renderedGapData===persisted&&renderedGapFilters===gapFilterKey())return;
 function select(id,values,all,rows,field){
  const el=$(id),keep=el.value,counts=new Map();
  for(const r of rows)if(r[field])counts.set(r[field],(counts.get(r[field])||0)+1);
  el.replaceChildren(new Option(all+' ('+rows.length+')',''));
  for(const v of values)el.add(new Option(v+' ('+(counts.get(v)||0)+')',v));
  el.value=[...el.options].some(x=>x.value===keep)?keep:'';
 }
 select('bm242-discipline',[...new Set(data.records.map(x=>x.disciplina).filter(Boolean))].sort(),'Todas',data.records,'disciplina');
 const discipline=$('bm242-discipline').value;
 const byDisc=data.records.filter(x=>!discipline||x.disciplina===discipline);
 select('bm242-general',[...new Set(byDisc.map(x=>x.assuntoGeral).filter(Boolean))].sort(),'Todos',byDisc,'assuntoGeral');
 const gen=$('bm242-general').value;
 const byGeneral=byDisc.filter(x=>!gen||x.assuntoGeral===gen);
 select('bm242-specific',[...new Set(byGeneral.map(x=>x.assuntoEspecifico).filter(Boolean))].sort(),'Todos',byGeneral,'assuntoEspecifico');
 const specific=$('bm242-specific').value;
 const bySpecific=byGeneral.filter(x=>!specific||x.assuntoEspecifico===specific);
 select('bm242-sub',[...new Set(bySpecific.map(x=>x.subassunto).filter(Boolean))].sort(),'Todos',bySpecific,'subassunto');
 select('bm242-priority',[...new Set(data.records.map(x=>x.prioridade).filter(Boolean))].sort(),'Todas',data.records,'prioridade');
 select('bm242-type',types.filter(x=>data.records.some(r=>r.tipo===x)),'Todos',data.records,'tipo');
 select('bm242-cover',coverage.filter(x=>data.records.some(r=>r.cobertura===x)),'Todas',data.records,'cobertura');
 select('bm242-stage',stages.filter(x=>data.records.some(r=>r.etapa===x)),'Todas',data.records,'etapa');
 const q=norm($('bm242-search').value),d=$('bm242-discipline').value,t=$('bm242-type').value,
 g=$('bm242-general').value,sp=$('bm242-specific').value,sub=$('bm242-sub').value,p=$('bm242-priority').value,
 c=$('bm242-cover').value,s=$('bm242-stage').value;
 const filtered=data.records.filter(r=>(!d||r.disciplina===d)&&(!g||r.assuntoGeral===g)&&(!sp||r.assuntoEspecifico===sp)&&(!sub||r.subassunto===sub)&&(!p||r.prioridade===p)&&(!t||r.tipo===t)&&(!c||r.cobertura===c)&&(!s||r.etapa===s)&&
 (!q||norm([r.id,r.descricao,r.relatoEstudante,r.diagnosticoAssistente,r.enunciado,r.respostaEstudante,r.gabarito,r.questaoId,...r.cardIds,r.disciplina,r.assuntoGeral,r.assuntoEspecifico,r.subassunto,r.fonte,r.pesquisa].join(' ')).includes(q)));
 $('bm242-count').textContent=filtered.length+' de '+data.records.length+' lacunas · '+data.log.length+' eventos de histórico';
 renderedGapData=persisted;renderedGapFilters=gapFilterKey();
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

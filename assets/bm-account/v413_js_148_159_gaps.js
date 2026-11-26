/* V315 · IIFE modules 148–159 exact order */

;
/* 148 assets/v296_study_theme.js */
/* Banco Mestre V296 — tipografia e superfícies do Controle de Estudos.
 * Shadow DOM isolado: somente CSS, sem mudar estado, SRS ou registros.
 */
(function(){
'use strict';
if(window.BM296UnifiedStudyTheme)return;
const id='bm296-unified-study-theme';
const rules=`
:host{
 --bm-ui-font:"Segoe UI",Arial,system-ui,sans-serif;
 --accent:#147fbf;--bg:#edf0f2;--paper:#fff;
 --ink:#111a22;--sub:#334a5a;--line:#bfcfd9;
 color:#111a22!important;
 font:400 14px/1.55 var(--bm-ui-font)!important;
}
:host :is(header,main,section,article,.panel,.metric,.notice,.row,.fields,.subtabs),
:host :is(h1,h2,h3,h4,h5,h6,p,span,small,strong,button,a,summary,
 label,input,select,textarea,li,th,td){
 font-family:var(--bm-ui-font)!important;
}
:host main{background:#edf0f2!important}
:host :is(.panel,.metric,.item){
 background:#fff!important;border:1px solid #bfcfd9!important;
 border-radius:0!important;box-shadow:none!important;
}
:host header{
 background:#fff!important;border-bottom:1px solid #d5e2e9!important;
 color:#111a22!important;
}
:host header h1,:host main h2,:host main h3{
 color:#15222d!important;font-weight:700!important;line-height:1.4!important;
}
:host header h1,:host main h2{font-size:16px!important}
:host main h3{font-size:14px!important}
:host .panel :is(p,li,th,td),:host .metric :is(span,small){
 color:#111a22!important;font-size:13px!important;line-height:1.6!important
}
:host .metric strong{
 font-family:var(--bm-ui-font)!important;color:#15222d!important;
 font-size:21px!important;font-weight:700!important;line-height:1.3!important
}
:host button:not(.danger),:host select,:host input:not([type="checkbox"]),:host textarea{
 border-radius:0!important;
 font-family:var(--bm-ui-font)!important;
 font-size:12.5px!important;line-height:1.4!important
}
:host :is(input:not([type="checkbox"]):not([type="radio"]),select,textarea){
 color:#111a22!important;background:#fff!important;
 border:1px solid #bfcfd9!important;min-height:34px!important
}
:host #bm252-main-nav button,:host #bm252-module-nav button{
 font:650 12.5px/1.45 var(--bm-ui-font)!important
}
:host #bm252-main-nav button[aria-selected="true"],
:host #bm252-main-nav button.active,
:host button.primary:not(.danger),:host .subtabs button.active{
 background:#147fbf!important;border-color:#147fbf!important;color:#fff!important
}
:host #bm252-main-nav button:not([aria-selected="true"]){
 background:#f8fbfd!important;border-color:#cbd9e2!important;color:#20587b!important
}
:host #bm252-module-nav{
 background:#f6f9fb!important;border-color:#d2e0e9!important;border-radius:0!important
}
:host #bm252-module-nav button[aria-current="page"],
:host #bm252-module-nav button.active{
 color:#125e94!important;background:#eaf4fb!important;border-color:#147fbf!important
}
:host #calTitle,:host .bm240-weeklabels span{
 font-family:var(--bm-ui-font)!important;color:#233e50!important
}
:host #calTitle{font-size:14px!important;font-weight:700!important}
:host .bm240-weeklabels span{font-size:12px!important}
:host #calendarioControle .bm240-day{
 background:#fff!important;border-color:#bdcfdc!important;border-radius:0!important
}
:host #calendarioControle .bm240-day :is(b,span,small){
 color:#162a37!important;font:550 12px/1.4 var(--bm-ui-font)!important
}
:host #calendarioControle .bm240-day.selected,
:host #calendarioControle .bm240-day[aria-selected="true"]{
 background:#eaf4fb!important;border-color:#147fbf!important;outline:2px solid #147fbf!important
}
:host #calendarioControle .bm240-day[data-bm252-state="done"]{
 background:#ecf6fc!important;border-color:#85c0e6!important
}
:host #calendarioControle .bm240-day[data-bm252-state="planned"]{
 background:#fff9ef!important;border-color:#d8bb7c!important
}
:host #calendarioControle .bm240-day[data-bm252-state="both"]{
 background:linear-gradient(135deg,#ecf6fc,#fff9ef)!important;border-color:#9bbccf!important
}
:host :is(input[type="checkbox"],input[type="radio"],input[type="range"]){
 accent-color:#147fbf!important
}
:host .progress>i,:host .bar{background:#147fbf!important}
:host .notice{background:#f7fafc!important;border-color:#d3e1e9!important;color:#334a5a!important}
:host :is(dialog,[role="dialog"],.modal,.popup){
 color:#111a22!important;background:#fff!important;border:1px solid #bfcfd9!important;
 border-radius:0!important;font-family:var(--bm-ui-font)!important
}
:host :is(dialog,[role="dialog"],.modal,.popup) :is(h2,h3){
 color:#15222d!important;font-weight:700!important
}
:host :is(button,input,select,textarea,summary,a):focus-visible{
 outline:2px solid #299ad5!important;outline-offset:2px!important
}
:host :is(code,pre,kbd,samp,math,math *){font-family:revert!important}
@media(max-width:700px){
 :host #bm252-main-nav button,:host #bm252-module-nav button{
  font-size:11.5px!important
 }
 :host main h2{font-size:15.5px!important}
 :host .panel :is(p,li,td,th){font-size:12.5px!important}
}
`;
function apply(){
 const root=document.getElementById('bm240-native-host')?.shadowRoot;
 if(!root)return false;
 let style=root.getElementById(id);
 if(!style){style=document.createElement('style');style.id=id;style.textContent=rules}
 if(root.lastElementChild!==style)root.append(style);
 return true;
}
for(const event of ['bm240-study-mounted','bm252-study-ready','bm253-calendar-compact-ready']){
 document.addEventListener(event,apply);
}
if(document.readyState==='loading'){
 document.addEventListener('DOMContentLoaded',apply,{once:true});
}else apply();
window.BM296UnifiedStudyTheme=Object.freeze({refresh:apply});
})();

;
/* 149 assets/v304_drive_continuous.js */
/* V304 — conexão Drive mantida entre todas as abas internas, ciclo de 3 horas.
 * NUNCA persiste access/refresh tokens, nem inicia OAuth fora de um gesto do usuário.
 * Renova leituras e reconciliações já autorizadas; conflitos permanecem bloqueados
 * pelos módulos originais. Com a aba fechada ou token vencido, pausa claramente.
 */
(function(){
'use strict';
if(window.BM302DriveContinuous)return;
let lastAttempt=0,running=false,everAuthorized=false,indicator=null;
const globalDrive=()=>window.BM239DriveGlobal;
const openTab=()=>document.visibilityState==='visible'&&navigator.onLine!==false;
const authorized=()=>Boolean(globalDrive()?.writeAuthorized&&globalDrive()?.connected);
const status=()=>{
 const d=globalDrive(),isAuthorized=authorized();
 if(isAuthorized)everAuthorized=true;
 return !d?.connectionStatus?.ready?'aguardando':isAuthorized?'ligado':everAuthorized?'reconectar':'conectar';
};
function ensureIndicator(){
 if(indicator?.isConnected)return indicator;
 const action=document.getElementById('bm239-drive-action');
 const details=document.getElementById('bm239-sync-details');
 if(!action||!details)return null;
 indicator=document.getElementById('bm299-drive-continuous');
 if(!indicator){
  indicator=document.createElement('small');
  indicator.id='bm299-drive-continuous';
  indicator.setAttribute('role','status');
  indicator.style.cssText='font-size:11px;white-space:nowrap;max-width:100%;color:#4b626b';
  details.insertAdjacentElement('afterend',indicator);
 }
 return indicator;
}
function refresh(){
 const indicator=ensureIndicator();if(!indicator)return;
 const current=status();
 if(current==='ligado'){
  indicator.textContent='Drive conectado · sincronização sob demanda';
  indicator.title='A carga inicial já ocorreu. Nova consulta somente ao sincronizar manualmente ou depois de alterações locais.';
 }else if(current==='reconectar'){
  indicator.textContent='Drive expirado · reconectar para sincronizar';
  indicator.title='A autorização Google expirou. Clique em Conectar Drive para retomar as atualizações automáticas.';
 }else{
  indicator.textContent='Aguardando login';
  indicator.title='A sincronização automática começa após autorizar o Google Drive pelo botão do cabeçalho.';
 }
}
function tick(){refresh();} // V326: apenas atualização visual, sem acessar o Drive.
function init(){
 ensureIndicator();refresh();
 // O fluxo OAuth já efetua a primeira verificação: evita operações concorrentes.
 document.addEventListener('bm-media-drive-authorized',()=>{lastAttempt=Date.now();refresh();});
 document.addEventListener('bm239-sync-finished',()=>{lastAttempt=Date.now();refresh();});document.addEventListener('bm-account-connected',refresh);
 // Trocar entre abas internas não modifica lastAttempt, token OAuth ou permissão.
 document.querySelector('header nav')?.addEventListener('click',()=>queueMicrotask(refresh),true);
 document.addEventListener('bm302-section-changed',refresh);
 window.addEventListener('focus',refresh);
 window.addEventListener('online',refresh);
 document.addEventListener('visibilitychange',()=>{if(!document.hidden)refresh()});
}
window.BM302DriveContinuous=Object.freeze({get active(){return authorized()},refresh,tick});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
else init();
})();


;
/* 150 assets/v300_lacunas_ui.js */
/* V300 — organização de Lacunas por aprendizado, sem alterar registros nem SRS.
 * Os elementos originais, formulários e listeners são preservados. */
(function(){
'use strict';
if(window.BM300LacunasUI)return;
const $=id=>document.getElementById(id);
const el=(tag,cls,txt)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(txt!==undefined)n.textContent=txt;return n};
const byName=(form,name)=>form?.querySelector('[name="'+name+'"]')?.closest('label');
const statuses={'Identificada':0,'Explicada':1,'Em reforço':2,'Dominada':3};
const opened=new Set();
let scheduled=false,observer=null;
function makeDetail(id,title){
 let d=$(id);if(d)return d;
 d=el('details','bm299-lac-more');d.id=id;
 d.append(el('summary','',title),el('div','bm299-lac-more-body'));
 return d;
}
function filterBar(){
 const source=document.querySelector('#lacunas .bm242-filters');
 if(!source||$('bm299-lac-filter-main'))return;
 const before=el('div','bm299-lac-filter-main');before.id='bm299-lac-filter-main';
 const advanced=makeDetail('bm299-lac-filter-more','Mais filtros');
 for(const id of ['bm242-search','bm242-discipline','bm242-stage']){
  const n=$(id)?.closest('label');if(n)before.append(n);
 }
 for(const label of [...source.children])advanced.lastElementChild.append(label);
 source.replaceChildren(before,advanced);
 const reset=el('button','bm299-lac-reset','Limpar filtros');reset.type='button';reset.id='bm299-lac-reset';
 reset.onclick=()=>{
  for(const input of source.querySelectorAll('input,select')){
   if(input.tagName==='SELECT')input.value='';
   else if(input.type==='search')input.value='';
   else if(input.type==='checkbox')input.checked=false;
  }
  $('bm242-search')?.dispatchEvent(new Event('input',{bubbles:true}));
  advanced.open=false;
 };
 before.append(reset);
 const refresh=$('bm242-refresh');if(refresh)before.append(refresh);
 const update=()=>{
  const count=[...advanced.querySelectorAll('select')].filter(x=>x.value).length;
  advanced.querySelector(':scope>summary').textContent='Mais filtros'+(count?' · '+count+' ativos':'');
 };
 source.addEventListener('change',update);update();
}
function organization(){
 const shell=document.querySelector('#lacunas .bm242-shell');if(!shell)return;
 const count=$('bm242-count');
 if(count&&!$('bm299-lac-stats')){
  const bar=el('div','bm299-lac-stats');bar.id='bm299-lac-stats';count.after(bar);
 }
 const form=$('bm242-form'),popup=$('bm242-new');
 if(form&&popup&&!$('bm299-lac-form-basics')){
  popup.querySelector('summary').textContent='Registrar nova lacuna';
  const essentials=el('div','bm299-lac-form-basics');essentials.id='bm299-lac-form-basics';
  for(const name of ['descricao','relatoEstudante','cardIds','disciplina']){
   const label=byName(form,name);if(label)essentials.append(label);
  }
  form.prepend(essentials);
  const extra=makeDetail('bm299-lac-form-more','Questão, classificação e fontes (opcional)');
  const target=extra.lastElementChild;
  const fields=form.querySelector('.bm242-fields');if(fields)target.append(fields);
  for(const name of ['enunciado','respostaEstudante','gabarito','fonte','pesquisa']){
   const label=byName(form,name);if(label)target.append(label);
  }
  essentials.after(extra);
 }
 if(!$('bm299-lac-backups')){
  const actions=shell.querySelector(':scope>.bm242-actions');
  const delta=$('bm276-import-delta');
  if(actions||delta){
   const back=makeDetail('bm299-lac-backups','Backup, importação e recuperação');
   const target=back.lastElementChild;
   if(actions)target.append(actions);
   if(delta)target.append(delta);
   shell.append(back);
  }
 }
}
function stats(){
 const host=$('bm299-lac-stats');if(!host)return;
 const rec=window.BM242Lacunas?.data?.records;
 if(!Array.isArray(rec)){host.textContent='Cadastro indisponível';return}
 const pending=rec.filter(r=>r.etapa!=='Dominada').length,
   reinforcement=rec.filter(r=>r.etapa==='Em reforço').length,
   done=rec.filter(r=>r.etapa==='Dominada').length;
 host.replaceChildren();
 for(const [value,name] of [[pending,'Para estudar'],[reinforcement,'Em reforço'],[done,'Dominadas']]){
  const metric=el('div','bm299-lac-stat');
  metric.append(el('strong','',String(value)),el('span','',name));host.append(metric);
 }
}

function openGap(article,record,origin){
 if(!record)return;
 let dialog=document.getElementById('bm411-gap-reader');
 if(!dialog){dialog=document.createElement('dialog');dialog.id='bm411-gap-reader';dialog.setAttribute('aria-labelledby','bm413-gap-title');document.body.append(dialog);
 dialog.addEventListener('click',e=>{if(e.target===dialog)dialog.close()});
 dialog.addEventListener('close',()=>{if(!dialog.open){dialog.replaceChildren();dialog.bmGapOrigin?.focus?.();dialog.bmGapOrigin=null;}});}
 dialog.bmGapOrigin=origin;
 const current=()=>window.BM242Lacunas?.data?.records?.find(x=>x.id===record.id)||record;
 const makeButton=(label,cls,fn)=>{const b=el('button',cls,label);b.type='button';b.onclick=fn;return b;};
 const draw=(expanded=false)=>{
  const r=current(),shell=el('div','bm411-gap-shell'),head=el('div','bm411-gap-head bm-v050-peek-header'),headTitle=el('div','bm163-header-title');
  headTitle.append(el('small','bm163-kicker','ESTUDO DA LACUNA'));const title=el('strong','',r.id);title.id='bm413-gap-title';headTitle.append(title);
  head.append(headTitle,makeButton('Fechar','bm-v050-peek-close',()=>dialog.close()));
  const scroll=el('div','bm411-gap-scroll');scroll.tabIndex=0;scroll.setAttribute('aria-label','Conteúdo da lacuna');
  const front=el('div','bm411-gap-question');front.append(el('small','bm163-section-overline','PERGUNTA / LACUNA'),el('h2','bm-v050-peek-front',r.descricao),el('p','bm-v050-peek-meta',[r.disciplina,r.assuntoGeral,r.assuntoEspecifico,r.subassunto].filter(Boolean).join(' › ')),el('p','bm-v050-provenance',[r.etapa,r.prioridade,r.cobertura].filter(Boolean).join(' · ')));
  if(r.enunciado)front.append(el('h3','','Enunciado'),el('p','bm411-gap-text',r.enunciado));
  front.append(el('p','bm-v050-peek-guidance','Tente recordar antes de revelar a análise. A consulta não altera o SRS.'));
  const controls=el('div','bm163-preview-controls');
  const answer=el('div','bm411-gap-answer bm-v050-peek-answer');answer.id='bm413-gap-answer';
  const reveal=makeButton('Revelar análise e resposta','bm411-gap-reveal bm-v050-peek-reveal',()=>setExpanded(answer.hidden));reveal.setAttribute('aria-controls',answer.id);
  function setExpanded(show){answer.hidden=!show;reveal.setAttribute('aria-expanded',String(show));reveal.textContent=show?'Ocultar análise e resposta':'Revelar análise e resposta';}
  setExpanded(expanded);controls.append(reveal);
  const reading=el('div','bm349-reading');reading.append(el('small','bm163-section-overline','RESPOSTA E ANÁLISE'));
  const fields=[['Minha dificuldade',r.relatoEstudante],['Resposta registrada',r.respostaEstudante],['Gabarito',r.gabarito],['Análise',r.diagnosticoAssistente],['Pesquisa',r.pesquisa],['Fonte',r.fonte],['Evidência de domínio',r.resolucaoEvidencia]];
  for(const [label,value] of fields)if(value)reading.append(el('h3','bm413-gap-subheading',label),el('p','bm411-gap-text',value));
  if(!fields.some(x=>x[1]))reading.append(el('p','','Ainda não há análise ou resposta registrada nesta lacuna. Consulte os cartões relacionados.'));
  if(r.historico?.length){const h=el('details','');h.append(el('summary','','Histórico'));for(const e of r.historico)h.append(el('p','bm411-gap-text',[e.at,e.evento||e.to,e.nota||e.evidencia].filter(Boolean).join(' · ')));reading.append(h);}
  const actions=el('div','bm411-gap-links');const live=[...document.querySelectorAll('#bm242-list>article')].find(a=>a.dataset.bm299LacId===r.id)||article;
  for(const original of live.querySelectorAll('button[data-fill],button[data-note],button[data-stage]'))actions.append(makeButton(original.textContent,'',()=>{original.click();draw(true)}));
  reading.append(actions);answer.append(reading);
  const links=el('div','bm411-gap-links');for(const id of r.cardIds||[])links.append(makeButton('Abrir '+id,'',async()=>{dialog.close();try{const api=window.BancoMestreVisualizarCardV050;if(!api?.showId?.(id,origin)){await window.loadCards?.();api?.showId?.(id,origin);}}catch(e){console.warn('Cartão relacionado indisponível',id,e);}}));
  const related=el('div','bm413-gap-related');related.append(el('small','bm163-section-overline','CARTÕES RELACIONADOS'),links);
  const footer=el('div','bm411-gap-footer');footer.append(el('small','bm-v050-peek-note','Consulta sem avaliação · não registra revisão SRS.'),makeButton('Voltar às lacunas','bm165-footer-close',()=>dialog.close()));
  scroll.append(front,controls,answer,related);shell.append(head,scroll,footer);dialog.replaceChildren(shell);
 };
 draw();if(!dialog.open)dialog.showModal();
}
function present(article,record){
 if(article.dataset.bm299LacOrganized==='yes')return;
 const h=article.querySelector(':scope>.bm256-lac-header');
 if(!h)return;
 const id=article.querySelector('code')?.textContent||'';
 const path=article.querySelector(':scope>.bm256-lac-path');
 const meta=article.querySelector(':scope>.bm256-lac-meta');
 const action=article.querySelector(':scope>.bm242-actions');
 const block=el('div','bm299-lac-badges');
 const status=record?.etapa||meta?.querySelector('dd')?.textContent||'';
 const priority=record?.prioridade||'';
 if(status)block.append(el('span','bm299-lac-state',status));
 if(priority==='Alta')block.append(el('span','bm299-lac-priority','Prioridade alta'));
 if(record?.cobertura==='Ausente')block.append(el('span','bm299-lac-coverage','Sem cartão correspondente'));
 h.after(block);
 const det=makeDetail('','Ver questão, análise, fontes e histórico');
 det.classList.add('bm299-lac-entry-details');
 if(opened.has(id))det.open=true;
 det.addEventListener('toggle',()=>{if(det.open)opened.add(id);else opened.delete(id)});
 const slot=det.lastElementChild;
 const extraButtons=el('div','bm299-lac-secondary-actions');
 if(action){
  for(const btn of [...action.querySelectorAll('button')]){
   if(btn.hasAttribute('data-open'))continue;
   extraButtons.append(btn);
  }
  if(extraButtons.childElementCount)slot.append(extraButtons);
  action.classList.add('bm299-lac-main-actions');
 }
 const retained=new Set([h,block,path,action]);
 for(const child of [...article.children]){
  if(retained.has(child)||child===det)continue;
  slot.append(child);
 }
 if(meta&&!slot.contains(meta))slot.prepend(meta);
 if(record?.relatoEstudante){
  const preview=el('p','bm299-lac-preview');
  preview.append(el('b','','Minha dificuldade: '),document.createTextNode(record.relatoEstudante));
  if(path)path.after(preview);else block.after(preview);
 }
 article.append(det);
 article.dataset.bm299LacOrganized='yes';
 article.dataset.bm299LacId=id;
 const trigger=el('button','bm411-gap-open','Abrir lacuna');trigger.type='button';trigger.onclick=()=>openGap(article,record,trigger);h.append(trigger);
 article.addEventListener('click',e=>{if(e.target.closest('button,a,summary,details,input,select,textarea')||window.getSelection()?.toString())return;openGap(article,record,trigger)});
}
function organize(){
 scheduled=false;
 const list=$('bm242-list');if(!list)return;
 stats();
 const articles=[...list.querySelectorAll(':scope>article.bm242-item')];
 if(!articles.some(a=>a.dataset.bm299LacOrganized!=='yes'))return;
 const data=window.BM242Lacunas?.data?.records||[];
 const lookup=new Map(data.map(r=>[r.id,r]));
 for(const a of articles)present(a,lookup.get(a.querySelector('code')?.textContent||''));
 const sorted=articles.map(article=>{
   const record=lookup.get(article.dataset.bm299LacId)||{};
   const route=[record.disciplina||'Sem disciplina',record.assuntoGeral||'Assunto ainda não classificado'];
   return {article,record,key:route.join(' • ')};
 }).sort((a,b)=>a.key.localeCompare(b.key,'pt-BR')||
    (statuses[a.record.etapa]??0)-(statuses[b.record.etapa]??0)||
    (a.record.prioridade==='Alta'?-1:0)-(b.record.prioridade==='Alta'?-1:0));
 const fragment=document.createDocumentFragment();let group='',number=0;
 for(const line of sorted){
  if(line.key!==group){
   group=line.key;number=sorted.filter(x=>x.key===group).length;
   const heading=el('h3','bm299-lac-group',group);
   heading.append(el('span','',number+' lacuna'+(number===1?'':'s')));
   fragment.append(heading);
  }
  fragment.append(line.article);
 }
 list.replaceChildren(fragment);
}
function schedule(){
 if(scheduled)return;
 scheduled=true;setTimeout(organize,35);
}
function start(){
 const root=$('lacunas'),list=$('bm242-list');
 if(!root||!list)return;
 filterBar();organization();schedule();
 if(!observer){
  observer=new MutationObserver(records=>{
   if(records.some(r=>[...r.addedNodes].some(n=>n.nodeType===1&&
      (n.matches?.('article.bm242-item:not([data-bm299-lac-organized="yes"])')||
       n.querySelector?.('article.bm242-item:not([data-bm299-lac-organized="yes"])')))))schedule();
  });
  observer.observe(list,{childList:true});
 }
}
let tries=0;
function init(){if(!$('bm242-list')&&tries++<22){setTimeout(init,250);return}start();}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
window.BM299LacunasUI=Object.freeze({refresh:()=>{filterBar();organization();schedule()}});
})();

;
/* 151 assets/v303_unified_filters.js */
/* V303 — uma única barra por biblioteca; reutiliza controles e listeners existentes.
 * Somente reorganização do DOM. Não lê ou grava cartões, grifos, SRS ou Drive. */
(function(){
'use strict';
if(window.BM303UnifiedFilters)return;
const $=id=>document.getElementById(id);
const create=(tag,klass,text)=>{const n=document.createElement(tag);if(klass)n.className=klass;if(text!==undefined)n.textContent=text;return n};
const section=id=>document.querySelector('#'+id+'>.panel');
const own=(root,selector)=>root?.querySelector(selector);
const wrap=id=>{const n=$(id);return n?.closest('label')||n||null};
function put(parent,node){if(node&&parent&&!parent.contains(node))parent.append(node);return node}
function field(input,text,cls){
 if(!input)return null;
 const existing=input.closest('label');
 if(existing){existing.classList.add('bm303-field');if(cls)existing.classList.add(cls);return existing}
 const label=create('label','bm303-field '+(cls||''));
 const title=create('span','bm303-label',text);
 input.before(label);label.append(title,input);return label;
}
function toolbar(root,id,title){
 const old=$(id);if(old)return old;
 const node=create('div','bm303-toolbar');node.id=id;node.setAttribute('aria-label',title);
 const main=create('div','bm303-primary');
 const actions=create('div','bm303-actions');
 const more=create('details','bm303-more');
 const label=create('summary','', 'Mais filtros e opções');
 label.setAttribute('aria-label','Abrir filtros e opções secundárias');
 const inner=create('div','bm303-more-body');
 more.append(label,inner);node.append(main,actions,more);
 const heading=own(root,':scope>h2');
 if(heading)heading.after(node);else root.prepend(node);
 return node;
}
const parts=(id)=>{const node=$(id);return {root:node,main:own(node,'.bm303-primary'),actions:own(node,'.bm303-actions'),more:own(node,'.bm303-more'),body:own(node,'.bm303-more-body')}};
function activeCounter(details){
 if(!details||details.dataset.bm303Counter)return;
 details.dataset.bm303Counter='yes';
 const label=details.querySelector(':scope>summary');
 const prefix=label.textContent;
 const update=()=>{
  let n=0;
  for(const el of details.querySelectorAll('input,select')){
   if(el.disabled||el.type==='hidden'||el.type==='file')continue;
   if(el.tagName==='SELECT'&&el.selectedIndex>0&&el.value&&el.value!=='all')n++;
  }
  label.textContent=prefix+(n?' · '+n+' ativo'+(n>1?'s':''):'');
 };
 details.addEventListener('change',update);
 details.addEventListener('input',update);
 update();
}
function moveControls(root,destination,selector){
 const el=root?.querySelector(selector);
 if(el&&!destination.contains(el))put(destination,el);
}
function mountAssuntos(){
 const root=section('assuntos');
 if(!root||$('bm303-assuntos-toolbar'))return !!$('bm303-assuntos-toolbar');
 if(!$('topicSearch')||!$('topicArea'))return false;
 const t=toolbar(root,'bm303-assuntos-toolbar','Busca de assuntos'),x=parts(t.id);
 put(x.main,field($('topicSearch'),'Pesquisar assuntos','bm303-search'));
 put(x.main,field($('topicArea'),'Área','bm303-group'));
 put(x.main,$('topicCount'));
 const legacy=own(root,':scope>.controls');
 if(legacy&&legacy.childElementCount)put(x.body,legacy);
 else if(legacy)legacy.hidden=true;
 const empty=own(root,':scope>.bm280-advanced');if(empty)put(x.body,empty);
 if(!x.body.children.length)x.more.remove();
 else activeCounter(x.more);
 x.actions.remove();return true;
}
function mountPdf(){
 const root=section('pdfs');
 if(!root||$('bm303-pdf-toolbar'))return !!$('bm303-pdf-toolbar');
 const search=$('pdfSearch'),select=$('pdfFilter');
 const oldbar=$('bm210PdfToolbar');
 if(!search||!select||!oldbar)return false;
 const t=toolbar(root,'bm303-pdf-toolbar','Pesquisar e consultar arquivos PDF'),x=parts(t.id);
 // H2 acompanha a barra: o compositor legado reordena filhos do painel com CSS.
 const title=[...root.querySelectorAll('h2')].find(x=>x.textContent.trim()==='PDFs para estudo');
 if(title)t.prepend(title);
 put(x.main,field(search,'Pesquisar PDF','bm303-search'));
 put(x.main,field(select,'Grupo','bm303-group'));
 put(x.main,$('pdfCount'));
 // Autorização é acionada exclusivamente pelos botões originais com listeners OAuth.
 for(const id of ['driveConnectV038','bm-pdf-sync-refresh']){
  const b=$(id);if(b)put(x.actions,b);
 }
 // A ferramenta de Vade Mecum e as verificações continuam acessíveis, mas recolhidas.
 put(x.body,$('pdfAreaNavV036'));
 put(x.body,wrap('pdfHidden'));
 put(x.body,oldbar);
 put(x.body,$('driveDirectV038'));
 put(x.body,$('bm-pdf-sync'));
 const controls=own(root,':scope>.controls');
 if(controls&&controls.childElementCount)put(x.body,controls);
 else if(controls)controls.hidden=true;
 const old280=own(root,':scope>.bm280-advanced');if(old280)put(x.body,old280);
 put(x.body,$('v037LocalGuides'));
 const extra=root.querySelector(':scope>p.intro');if(extra)put(x.body,extra);
 x.more.querySelector('summary').textContent='Áreas, PDFs locais e ferramentas';
 activeCounter(x.more);
 return true;
}
function mountCards(){
 const root=section('cartoes');
 if(!root||$('bm303-card-toolbar'))return !!$('bm303-card-toolbar');
 if(!$('cardSearch')||!$('bm152Discipline')||!$('bm152Filters'))return false;
 const t=toolbar(root,'bm303-card-toolbar','Busca de flashcards'),x=parts(t.id);
 put(x.main,field($('cardSearch'),'Buscar por ID, conceito ou pergunta','bm303-search'));
 put(x.main,wrap('bm152Discipline'));
 put(x.main,$('cardCount'));
 const hierarchy=$('bm152Filters');put(x.body,hierarchy);
 for(const id of ['bm281IdOrder','bm281LastCards']){
  const n=wrap(id);if(n)put(x.body,n);
 }
 const original=own(root,':scope>.controls');
 if(original&&original.childElementCount)put(x.body,original);
 else if(original)original.hidden=true;
 const old280=own(root,':scope>.bm280-advanced');if(old280)put(x.body,old280);
 put(x.body,$('bm273Versoes'));
 put(x.body,$('bm186CheckpointPanel'));
 const comparator=$('bm290-button')?.closest('.notice');if(comparator)put(x.body,comparator);
 const intro=own(root,':scope>p.intro');if(intro)put(x.body,intro);
 // Outros filtros de legado permanecem acessíveis no mesmo painel.
 for(const id of ['bm109FiltersCards','bm279CardFilters'])put(x.body,$(id));
 x.more.querySelector('summary').textContent='Assuntos, ordenação e opções';
 activeCounter(x.more);
 x.actions.remove();
 return true;
}
function mountImages(){
 const root=section('imagens');
 if(!root||$('bm303-image-toolbar'))return !!$('bm303-image-toolbar');
 const bar=$('bm209SyncBar'),search=$('imageSearch'),discipline=$('bm155DisciplinaImagem');
 if(!bar||!search||!discipline||!$('bm155ImageFilters'))return false;
 const t=toolbar(root,'bm303-image-toolbar','Buscar imagens e pranchas'),x=parts(t.id);
 put(x.main,field(search,'Pesquisar imagens','bm303-search'));
 put(x.main,wrap('bm155DisciplinaImagem'));
 put(x.main,$('imageCount'));
 // Antigo botão V300 duplicava o recolhível; não contém dados nem filtros.
 const toggle=$('bm299-image-toggle');if(toggle)toggle.remove();
 const fields=$('bm155ImageFilters');
 fields.classList.remove('bm299-image-expanded');
 for(const label of fields.querySelectorAll('.bm299-image-extra'))label.classList.remove('bm299-image-extra');
 put(x.body,bar);
 const original=own(root,':scope>.controls');
 if(original&&original.childElementCount)put(x.body,original);
 else if(original)original.hidden=true;
 const old280=own(root,':scope>.bm280-advanced');if(old280)put(x.body,old280);
 const help=root.querySelector(':scope>.originalHelp');if(help)put(x.body,help);
 x.more.querySelector('summary').textContent='Assuntos, classificação e opções';
 activeCounter(x.more);x.actions.remove();
 return true;
}
function mountLacunas(){
 const root=$('lacunas'),main=document.querySelector('body>main');
 if(!root)return false;
 // A biblioteca injetada originalmente depois do rodapé deve permanecer dentro do fluxo.
 const footer=main?.querySelector(':scope>footer');if(footer&&root.nextElementSibling!==footer)main.insertBefore(root,footer);
 const source=root.querySelector('.bm242-filters');
 if(!source)return false;
 source.classList.add('bm303-lacunas-filter');
 const details=$('bm299-lac-filter-more');
 if(details)details.classList.add('bm303-lacunas-more');
 return true;
}
let count=0;
function mount(){
 const done=[mountAssuntos(),mountPdf(),mountCards(),mountImages(),mountLacunas()].every(Boolean);
 if(!done&&++count<45)setTimeout(mount,260);
 return done;
}
let pending=false;
function refresh(){
 if(pending)return;
 pending=true;setTimeout(()=>{pending=false;mount()},80);
}
function begin(){
 mount();
 document.querySelector('header nav[aria-label="Seções"]')?.addEventListener('click',refresh);
 document.addEventListener('bm239-sync-finished',refresh);
}
window.BM303UnifiedFilters=Object.freeze({refresh,get ready(){return !!$('bm303-pdf-toolbar')&&!!$('bm303-card-toolbar')&&!!$('bm303-image-toolbar')}});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',begin,{once:true});
else begin();
})();


;
/* 152 assets/v304_pdf_ui.js */
/* Portal V304: cabeçalhos de áreas PDF recolhíveis, sem duplicar o catálogo.
 * Preserva os nós originais dos grupos, seus listeners e editores de PDF. */
(function(){
'use strict';
if(window.BM304PdfAreas)return;
const openByArea=new Map();
let observer=null;
function enhance(){
 const host=document.getElementById('pdfRows');
 if(!host)return;
 for(const block of host.querySelectorAll(':scope > div.v036-pdf-area')){
  const head=block.querySelector(':scope > .v036-area-head');
  if(!head)continue;
  const title=head.querySelector('h3')?.textContent?.trim()||'Área';
  const details=document.createElement('details');
  details.className=block.className+' bm304-pdf-area';
  details.dataset.bm304Area=title;
  const summary=document.createElement('summary');
  summary.className=head.className;
  while(head.firstChild)summary.append(head.firstChild);
  head.remove();
  details.append(summary);
  while(block.firstChild)details.append(block.firstChild);
  details.open=openByArea.has(title)?openByArea.get(title):true;
  details.addEventListener('toggle',()=>{
   if(details.isConnected)openByArea.set(title,details.open);
  });
  block.replaceWith(details);
 }
}
function init(){
 const host=document.getElementById('pdfRows');
 if(!host)return;
 enhance();
 observer=new MutationObserver(()=>enhance());
 observer.observe(host,{childList:true});
}
window.BM304PdfAreas=Object.freeze({enhance, get ready(){return Boolean(observer)}});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
else init();
})();

;
/* 153 assets/v305_cards_clarity.js */
/* Portal V305: frente didática com vínculos comprovados, contagens transparentes e fila de imagens pendentes.
 * Dados públicos e fonte autenticada já disponível no navegador, sem publicar origem privada.
 * Não altera IDs, SRS, 11 módulos, imagens ou cartão de lei seca. */
(function(){
'use strict';
if(window.BM305CardClarity)return;
const $=id=>document.getElementById(id);
const ID=/^CARD-\d{4,}$/;
let cardSet=null,cardArray=null,observer=null,io=null,scheduled=false;
const processed=new WeakSet(),requests=new Map();
function lookup(){
 const records=typeof cards!=='undefined'&&Array.isArray(cards)?cards:[];
 if(records!==cardArray||!cardSet){
  cardArray=records;cardSet=new Map(records.filter(x=>x&&typeof x.id==='string').map(x=>[x.id,x]));
 }
 return cardSet;
}
function extract(record,extra){
 const found=[],add=id=>{
  if(typeof id==='string'&&ID.test(id)&&id!==record.id&&!found.includes(id)&&lookup().has(id))found.push(id);
 };
 for(const list of [record.related_card_ids,record.related_cards,record.relatedCardIds,extra?.related_card_ids]){
  if(Array.isArray(list))for(const item of list)add(typeof item==='string'?item:item?.id||item?.cartao);
 }
 const layers=[record?.evolutive?.layers,record?.layers,extra?.layers,extra?.evolutive?.layers];
 for(const items of layers){
  if(!Array.isArray(items))continue;
  const layer=items.find(x=>Number(x?.ord)===8);
  if(!layer)continue;
  const body=String(layer.texto||layer.text||'');
  for(const line of body.split(/\r?\n/)){
   if(!/CARD-\d{4,}/.test(line))continue;
   for(const m of line.matchAll(/CARD-\d{4,}/g))add(m[0]);
  }
 }
 return found;
}
async function enrichment(id){
 if(requests.has(id))return requests.get(id);
 const work=(async()=>{
  if(window.BM276LayerData?.has?.(id))return await window.BM276LayerData.get(id);
  const publicRead=window.BM194VersosPublicos?.load;
  if(typeof publicRead==='function')return await publicRead(id);
  return null;
 })().catch(()=>null);
 requests.set(id,work);return work;
}
function label(c){
 const subject=String(c.sub||c.subject||'').trim();
 return subject.length>46?subject.slice(0,45)+'…':subject||'Abrir cartão';
}
function insertLinks(host,record,ids){
 if(!host?.isConnected||!ids.length)return;
 let footer=host.querySelector(':scope > .bm305-relations');
 if(!footer){footer=document.createElement('div');footer.className='bm305-relations';footer.setAttribute('aria-label','Cartões diretamente relacionados');}
 const compact=host.matches('#cartoes #cardRows article.card');
 const wasOpen=compact&&footer.querySelector('.bm305-more-links')?.getAttribute('aria-expanded')==='true';
 const initial=compact?0:4;
 const title=document.createElement('strong');title.textContent='Cartões relacionados';
 const row=document.createElement('div');row.className='bm305-relations-row';
 ids.forEach((id,index)=>{
  const dest=lookup().get(id);if(!dest)return;
  const b=document.createElement('button');b.type='button';b.className='bm305-relation-link';
  b.textContent=id+' · '+label(dest);
  b.title='Abrir '+id+': '+String(dest.front||'').slice(0,140);
  if(index>=initial&&!wasOpen)b.hidden=true;
  b.addEventListener('click',e=>{
   e.preventDefault();e.stopPropagation();
   if(window.BancoMestreVisualizarCardV050?.showId?.(id,b))return;
   const search=$('cardSearch');
   if(search){search.value=id;search.dispatchEvent(new Event('input',{bubbles:true}));}
  });
  row.append(b);
 });
 if(!row.children.length)return;
 footer.replaceChildren(title,row);
 if(row.children.length>initial){
  const more=document.createElement('button');more.type='button';more.className='bm305-more-links';
  const closedLabel=compact?'▸ Cartões relacionados ('+row.children.length+')':'Ver mais ('+(row.children.length-initial)+')';
  const openLabel=compact?'▾ Cartões relacionados ('+row.children.length+')':'Ver menos';
  more.textContent=wasOpen?openLabel:closedLabel;more.setAttribute('aria-expanded',String(!!wasOpen));
  if(compact){title.remove();row.hidden=!wasOpen;footer.prepend(more);}
  else footer.append(more);
  more.addEventListener('click',()=>{
   const open=more.getAttribute('aria-expanded')!=='true';
   [...row.children].slice(initial).forEach(b=>{b.hidden=!open});
   if(compact)row.hidden=!open;
   more.setAttribute('aria-expanded',String(open));more.textContent=open?openLabel:closedLabel;
  });
 }
 const details=host.querySelector(':scope > details');
 const buttons=host.querySelector(':scope > .buttons');
 // A faixa permanece na frente, antes de revelar o verso e os 11 módulos.
 if(details)details.before(footer);else if(buttons)buttons.before(footer);else host.append(footer);
}
async function decorateRecord(host,id){
 const rec=lookup().get(id);if(!rec||!host?.isConnected)return;
 const explicit=extract(rec,null);
 if(explicit.length)insertLinks(host,rec,explicit);
 const enriched=await enrichment(id);
 if(!host?.isConnected||lookup().get(id)!==rec)return;
 insertLinks(host,rec,extract(rec,enriched));
}
function decorateCard(article){
 if(processed.has(article))return;
 const tag=article.querySelector(':scope > .tag');
 const id=String(tag?.textContent||'').trim();
 if(!ID.test(id))return;
 const c=lookup().get(id);
 if(!c)return;
 processed.add(article);
 article.dataset.bm305Id=id;
 if(c.sub&&c.sub!==c.subject&&!article.querySelector('.bm305-card-sub')){
  const sub=document.createElement('p');sub.className='bm305-card-sub';sub.textContent='Subassunto: '+c.sub;
  const subtitle=article.querySelector(':scope > p');if(subtitle)subtitle.after(sub);else article.append(sub);
 }
 if(io)io.observe(article);else void decorateRecord(article,id);
}

function keepIdOrder(){
 const root=$('cardRows'),sorting=window.BM281CardSort;
 if(!root||!sorting||!['asc','desc'].includes(sorting.order))return;
 const items=[...root.querySelectorAll('article.card')];
 if(items.length<2)return;
 // Ordenar TODOS os cartões renderizados, mesmo quando o compositor legado já
 // achatou os grupos em ordem temática: isso causava 1529 → 1524 → 1523.
 const numeric=a=>{
  const m=/^CARD-(\d+)$/.exec(a.querySelector(':scope > .tag')?.textContent?.trim()||'');
  return m?Number(m[1]):null;
 };
 const sign=sorting.order==='asc'?1:-1;
 const ordered=items.slice().sort((a,b)=>{
  const x=numeric(a),y=numeric(b);
  if(x===null)return y===null?0:1;
  if(y===null)return -1;
  return sign*(x-y);
 });
 // A igualdade é obrigatória: impede loop MutationObserver e movimentação inútil.
 const flat=root.children.length===items.length&&items.every((node,i)=>root.children[i]===node);
 if(flat&&items.every((node,i)=>node===ordered[i]))return;
 root.replaceChildren(...ordered);
 root.classList.add('bm191-all-grid');
}

function decorateCards(){
 const root=$('cardRows');if(!root)return;
 keepIdOrder();
 for(const node of root.querySelectorAll('article.card'))decorateCard(node);
 refreshCounts();
}
function refreshCounts(){
 const root=$('cartoes'),count=$('cardCount'),data=lookup();
 if(!root||!count||!data.size)return;
 let result=$('bm305-count-detail');
 if(!result){result=document.createElement('small');result.id='bm305-count-detail';result.className='bm305-count-detail';count.after(result);}
 const fmt=n=>n.toLocaleString('pt-BR');
 const active=[...data.values()].filter(c=>c.active!==false).length;
 const official=new Set(),external=new Set();
 for(const article of $('cardRows')?.querySelectorAll('article.card')||[]){
  if(article.hidden||article.closest('details:not([open])'))continue;
  const id=article.dataset.bm221Id||article.querySelector(':scope > .tag')?.textContent?.trim();
  if(!id)continue;
  if(data.has(id))official.add(id);
  else if(/^TRT0[12]-C\d{3}$/.test(id))external.add(id);
 }
 const selected=Number(count.dataset.bmOfficialSelection||0);
 const loadedExternal=(window.BM225LegalTaxonomy?.all?.()||[]).filter(c=>!data.has(c.id)).length;
 const account=window.BMAccountInfo?.();const officialLabel=account?'Drive · '+account.version+' · '+fmt(active)+' cartões ativos':'Entre com Google';
 if(count.textContent!==officialLabel)count.textContent=officialLabel;
 const label='Exibidos: '+fmt(official.size)+' de '+fmt(selected)+' do catálogo'+(external.size?' + '+fmt(external.size)+' TRT':'')+' · Base carregada: '+fmt(active)+' ativos'+(loadedExternal?' · '+fmt(loadedExternal)+' TRT externos (fora do total oficial)':'');
 if(result.textContent!==label)result.textContent=label;
 const old=$('bm191CardCount');if(old)old.hidden=true;
}
function reader(){
 const root=$('bmCardPeekV050'),title=$('bmCardPeekTitleV050');
 if(!root||!title)return;
 const run=()=>{
  if(root.hidden)return;
  const id=window.BancoMestreVisualizarCardV050?.currentId;
  if(!id||!ID.test(id))return;
  const question=root.querySelector('.bm163-question');
  if(!question)return;
  let holder=question.querySelector(':scope > .bm305-modal-links');
  if(!holder){holder=document.createElement('div');holder.className='bm305-modal-links';question.append(holder);}
  if(holder.dataset.cardId===id)return;
  holder.dataset.cardId=id;holder.replaceChildren();
  const c=lookup().get(id);if(!c)return;
  const fill=async()=>{
   const e=await enrichment(id);
   if(root.hidden||holder.dataset.cardId!==id)return;
   const rel=extract(c,e);
   if(rel.length)insertLinks(holder,c,rel);
  };
  void fill();
 };
 const monitor=new MutationObserver(run);monitor.observe(title,{childList:true,subtree:true});run();
}
function mountImageQueue(){
 const root=$('imagens'),top=$('bm303-image-toolbar');
 if(!root||!top||$('bm305-image-pending'))return;
 const actions=top.querySelector('.bm303-actions')||top;
 const button=document.createElement('button');
 button.type='button';button.id='bm305-image-pending';button.className='bm305-pending-button';
 button.textContent='Ver imagens sem assunto';
 button.title='Filtra somente imagens sem assunto geral cadastrado; outras classificações incompletas continuam nos filtros existentes. Não atribui cartões automaticamente.';
 button.onclick=()=>{
  const general=$('bm155AssuntoGeralImagem'),disc=$('bm155DisciplinaImagem');
  const reset=$('bm155Reset');
  if(!general||!disc){button.title='Os filtros de imagens ainda não terminaram de carregar';return;}
  if(reset)reset.click();
  const option=[...general.options].find(x=>x.value==='__pendente__');
  if(!option){
   button.textContent='Conecte o Drive para consultar pendentes';
   button.title='Autorize o Drive e atualize o Atlas; nenhuma classificação é inferida sem os arquivos';
   return;
  }
  general.value='__pendente__';general.dispatchEvent(new Event('change',{bubbles:true}));
  const place=$('imageRows')||$('bm153Directory');
  place?.scrollIntoView?.({behavior:'smooth',block:'start'});
 };
 actions.append(button);
 const status=$('bm155FilterSummary');
 if(status&&typeof MutationObserver==='function'){
  const refresh=()=>{
   const m=String(status.textContent||'').match(/(\d+)\s+sem classificação completa/i);
   if(m)button.title='Há '+m[1]+' imagens com algum campo incompleto no acervo. Este atalho filtra apenas as que não têm assunto geral cadastrado.';
  };
  new MutationObserver(refresh).observe(status,{childList:true,subtree:true,characterData:true});refresh();
 }
}
function schedule(){if(scheduled)return;scheduled=true;requestAnimationFrame(()=>{scheduled=false;decorateCards();mountImageQueue();});}
function init(){
 io=typeof IntersectionObserver==='function'?new IntersectionObserver(items=>{
  for(const item of items)if(item.isIntersecting){
   io.unobserve(item.target);void decorateRecord(item.target,item.target.dataset.bm305Id);
  }
 },{rootMargin:'280px'}):null;
 const root=$('cardRows');
 if(root){observer=new MutationObserver(schedule);observer.observe(root,{childList:true,subtree:true});}
 reader();schedule();
 document.addEventListener('bm239-sync-finished',schedule);
 document.querySelector('header nav')?.addEventListener('click',schedule);
}
window.BM305CardClarity=Object.freeze({refresh:schedule,get ready(){return Boolean(observer)}});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
else init();
})();

;
/* 154 assets/v306_card_media.js */
/* Banco Mestre V306 — imagens originais diretamente nos flashcards.
 * Somente vínculos por ID explícitos; OAuth de leitura, sem copiar bytes para o GitHub.
 * Enunciados e figuras na frente; imagens de explicação em <details> fechado.
 */
(function(){
'use strict';
if(window.BM306CardMedia)return;
const $=id=>document.getElementById(id);
const CARD=/^(?:CARD-\d{4,}|PETRO\d+-C\d{3})$/i,FILE=/^[A-Za-z0-9_-]{15,}$/;
const LOCAL='BM197_IMAGENS_TIPO_VINCULOS_V1',META='BM228_DRIVE_IMAGE_INFO_V1';
let index=null,loadPromise=null,observer=null,intersection=null,scheduled=false,processed=new WeakMap();
const tracked=new Set(),requests=new WeakMap();
function local(key){try{const x=JSON.parse(localStorage.getItem(key)||'{}');return x&&typeof x==='object'&&!Array.isArray(x)?x:{}}catch{return {}}}
async function load(){
 if(index)return index;if(loadPromise)return loadPromise;
 loadPromise=Promise.all([
  fetch('assets/v211_published_images.json?v=211').then(r=>{if(!r.ok)throw Error('Índice V211 indisponível');return r.json()}),
  fetch('assets/v198_editorial_images_catalog.json?v=198').then(r=>{if(!r.ok)throw Error('Índice V198 indisponível');return r.json()})
 ]).then(([d,e])=>{
  if(d.schema!=='BancoMestrePublishedDriveImagesV211'||d.records?.length!==237||e.schema!=='BancoMestreImageEditorialCatalogV198'||e.records?.length!==179)throw Error('Catálogo de imagens incompatível');
  const editorial=new Map(e.records.map(x=>[x.imageId,x])),map=new Map();
  for(const r of d.records){
   const id=String(r.imageId||''),file=String(r.driveFileId||'');
   if(!/^IMG-[A-Z0-9_-]+$/.test(id)||!FILE.test(file))continue;
   const e=editorial.get(id),ids=Array.isArray(e?.cardIds)?e.cardIds:r.cardIds;
   map.set(id,{
    id,file,title:String(r.title||id).slice(0,150),
    type:e?.type||r.type||'conteudo',subtype:e?.subtype||r.subtype||'',
    cardIds:Array.isArray(ids)?ids.filter(v=>typeof v==='string'&&CARD.test(v)):[],
    basis:e?.basis||r.classificationBasis||''
   });
  }
  index=map;return map;
 }).catch(err=>{loadPromise=null;console.warn('V306 imagens de cartões:',err);return null});
 return loadPromise;
}
function linked(cardId){
 if(!index)return [];
 const overrides=local(LOCAL),notes=local(META),out=[];
 for(const r of index.values()){
  const edit=overrides[r.id]||overrides['DRIVE-IMG-'+r.file];
  const type=edit?.type||r.type,ids=Array.isArray(edit?.cardIds)?edit.cardIds:r.cardIds;
  if(type!=='cartao'||!ids.includes(cardId))continue;
  out.push({...r,title:String(notes[r.file]?.title||r.title).slice(0,150),
    subtype:edit?.subtype||r.subtype,basis:edit?'manual_local':r.basis});
 }
 return out.sort((a,b)=>a.id.localeCompare(b.id,'pt-BR'));
}
function provider(){const p=window.BancoMestreDriveImagesV182;return p?.connected&&typeof p.getImageUrlForCard==='function'?p:null}
function preview(img,file,figure){
 const run=async()=>{
  if(!img.isConnected)return;
  const p=provider();
  if(!p){img.hidden=true;img.dataset.state='unavailable';return;}
  if(img.dataset.state==='loading'||img.dataset.state==='ready')return;
  img.dataset.state='loading';
  try{
   const promise=p.getImageUrlForCard(file);
   const url=await (window.BM316DriveProgress?.track?.(promise,'imagem do cartão')||promise);
   if(!img.isConnected)return;
   img.onload=()=>{img.dataset.state='ready';img.onload=null;img.onerror=null;
    figure.querySelector('.bm306-image-status').textContent='Imagem original carregada · clique para ampliar';};
   img.onerror=()=>{img.dataset.state='failed';img.hidden=true;img.onerror=null;img.onload=null;
    figure.querySelector('.bm306-image-status').textContent='Não foi possível mostrar a imagem. Use o link original ou reconecte o Drive.';};
   img.loading=figure.closest('#bmCardPeekV050')?'eager':'lazy';
   img.src=url;img.hidden=false;
   figure.querySelector('.bm306-image-status').textContent='Preparando imagem para exibição…';
   if(img.complete&&img.naturalWidth>0)img.onload?.();
  }catch(e){
   img.hidden=true;img.dataset.state='unavailable';
   figure.querySelector('.bm306-image-status').textContent='Prévia indisponível nesta sessão. Original preservado.';
  }
 };
 requests.set(figure,run);tracked.add(figure);
 if(intersection)intersection.observe(figure);else void run();
}
function item(r){
 const fig=document.createElement('figure');fig.className='bm306-image-item';fig.dataset.imageId=r.id;
 const img=document.createElement('img');img.className='bm306-preview';img.alt=r.title+' ('+r.id+')';img.loading='lazy';img.decoding='async';img.hidden=true;
 const cap=document.createElement('figcaption');
 const title=document.createElement('strong');title.textContent=r.title;
 const id=document.createElement('span');id.textContent=r.id;
 const status=document.createElement('small');status.className='bm306-image-status';status.textContent='Conecte o Drive para exibir o original';
 const link=document.createElement('a');link.href='https://drive.google.com/file/d/'+encodeURIComponent(r.file)+'/view';
 link.target='_blank';link.rel='noopener noreferrer';link.textContent='Abrir original no Drive';
 cap.append(title,id,status,link);
 if(r.basis==='correspondencia_didatica_especifica'){
  const note=document.createElement('small');note.textContent='Associação didática registrada · conferir vínculo';note.className='bm306-image-basis';cap.append(note);
 }
 fig.append(img,cap);preview(img,r.file,fig);return fig;
}
function gallery(recs){
 const root=document.createElement('div');root.className='bm306-card-images';
 const direct=recs.filter(r=>r.subtype==='enunciado'||r.subtype==='figura');
 const explanations=recs.filter(r=>r.subtype!=='enunciado'&&r.subtype!=='figura');
 if(direct.length){
  const fold=document.createElement('details');fold.className='bm306-original-fold bm316-original-fold';
  const sum=document.createElement('summary');sum.textContent='Figura ou enunciado original ('+direct.length+') — mostrar';
  fold.append(sum,...direct.slice(0,10).map(item));root.append(fold);
 }
 if(explanations.length){
  const fold=document.createElement('details');fold.className='bm306-explanations';
  const sum=document.createElement('summary');sum.textContent='Imagens explicativas ('+explanations.length+') — abrir após responder';
  fold.append(sum,...explanations.slice(0,12).map(item));root.append(fold);
 }
 return root;
}
function cards(){
 if(!index)return;
 for(const article of $('cardRows')?.querySelectorAll('article.card')||[]){
  const id=String(article.querySelector(':scope > .tag')?.textContent||'').trim();
  if(!CARD.test(id)||processed.get(article)===id)continue;
  processed.set(article,id);
  const recs=linked(id);if(!recs.length)continue;
  const g=gallery(recs),answer=article.querySelector(':scope > details');
  if(answer)answer.before(g);else article.append(g);
 }
}
function modal(){
 if(!index)return;
 const root=$('bmCardPeekV050'),question=root?.querySelector('.bm163-question');
 if(!root||root.hidden||!question)return;
 const id=window.BancoMestreVisualizarCardV050?.currentId;if(!CARD.test(id))return;
 let slot=question.querySelector(':scope > .bm306-modal-gallery');
 if(!slot){slot=document.createElement('div');slot.className='bm306-modal-gallery';question.append(slot)}
 if(slot.dataset.card===id)return;
 slot.dataset.card=id;slot.replaceChildren();
 const recs=linked(id);if(recs.length)slot.append(gallery(recs));
}
function retry(){
 for(const fig of tracked){
  if(!fig.isConnected){tracked.delete(fig);continue}
  const img=fig.querySelector('img');
  if(!fig.getClientRects().length||fig.closest('details:not([open])'))continue;
  if(provider()&&['unavailable',''].includes(img.dataset.state||''))void requests.get(fig)?.();
 }
}
function update(){cards();modal();retry()}
function schedule(){if(scheduled)return;scheduled=true;requestAnimationFrame(()=>{scheduled=false;update()})}
function rebuild(){
 processed=new WeakMap();
 $('cardRows')?.querySelectorAll('.bm306-card-images').forEach(x=>x.remove());
 const slot=$('bmCardPeekV050')?.querySelector('.bm306-modal-gallery');if(slot)slot.dataset.card='';
 schedule();
}
async function init(){
 intersection=typeof IntersectionObserver==='function'?new IntersectionObserver(entries=>{
  for(const e of entries)if(e.isIntersecting){
   intersection.unobserve(e.target);
   void requests.get(e.target)?.();
  }
 },{rootMargin:'240px'}):null;
 if(!await load())return;
 observer=new MutationObserver(schedule);
 const root=$('cardRows'),modal=$('bmCardPeekV050'),title=$('bmCardPeekTitleV050');
 if(root)observer.observe(root,{childList:true,subtree:true});
 if(title)observer.observe(title,{childList:true,subtree:true});
 if(modal)observer.observe(modal,{attributes:true,attributeFilter:['hidden']});
 document.addEventListener('bm209-drive-render',schedule);
 document.addEventListener('bm-media-drive-authorized',()=>{
  for(const fig of tracked){
   const img=fig.querySelector('img');
   if(img&&img.dataset.state==='failed')img.dataset.state='unavailable';
  }
  schedule();
 });
 document.addEventListener('bm228-image-info-changed',rebuild);
 window.addEventListener('bm197-links-changed',rebuild);
 schedule();
}
window.BM306CardMedia=Object.freeze({refresh:()=>{if(index)schedule();else void load().then(schedule)},get ready(){return !!index},linked:id=>linked(id).map(r=>({imageId:r.id,driveFileId:r.file,role:r.subtype})),get sourceCount(){return index?.size||0}});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{void init()},{once:true});else void init();
})();

;
/* 155 assets/v306_redacao_theme.js */
/* Portal V306: injeta apenas CSS no documento histórico do iframe de Redação.
 * Não modifica scripts, histórico de exercícios, armazenamento ou OAuth.
 */
(function(){
'use strict';
if(window.BM306RedacaoTheme)return;
const CSS='assets/v306_redacao_theme.css?v=306-1';
let observer=null;
function apply(frame){
 if(!frame)return;
 frame.style.setProperty('border','0','important');
 frame.style.setProperty('background','#f5f8fb','important');
 frame.style.setProperty('min-height','760px','important');
 frame.style.setProperty('height','max(760px, calc(100vh - 155px))','important');
 frame.style.setProperty('border-radius','0','important');
 try{
  const doc=frame.contentDocument;
  if(!doc?.head||doc.getElementById('bm306-redacao-theme'))return;
  const link=doc.createElement('link');link.id='bm306-redacao-theme';link.rel='stylesheet';link.href=new URL(CSS,location.href).href;
  doc.head.append(link);
  doc.documentElement.dataset.bm306Theme='portal';
 }catch(e){console.warn('Tema da Redação depende de iframe na mesma origem:',e);}
}
function boot(){
 const iframe=document.getElementById('bm302-redacao-original');
 if(!iframe)return false;
 if(iframe.dataset.bm306Attached!=='1'){
  iframe.dataset.bm306Attached='1';iframe.addEventListener('load',()=>apply(iframe));
 }
 apply(iframe);return true;
}
function init(){
 if(boot())return;
 const main=document.querySelector('main');if(!main)return;
 observer=new MutationObserver(()=>{if(boot())observer.disconnect()});
 observer.observe(main,{childList:true,subtree:true});
}
window.BM306RedacaoTheme=Object.freeze({refresh:boot});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();


;
/* 156 assets/v307_card_layout.js */
/* Banco Mestre V307 — acabamento visual não destrutivo dos cartões.
 * Mantém o ID e a pergunta como filhos diretos para compatibilidade com busca,
 * modal, ordenação, módulos, imagens do Drive e SRS.
 * Apenas o parágrafo de referência é recolhido no seu próprio details.
 */
(function(){
'use strict';
if(window.BM307CardLayout)return;
const $=id=>document.getElementById(id);
let observer=null,areaObserver=null,scheduled=false;
const normalized=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim().toLowerCase();
function cleanAreas(){
 const root=$('areaRows');if(!root)return;
 for(const b of root.querySelectorAll('.topicCard')){
  b.classList.add('bm307-area');
  // A marca era decorativa e recriava ícone gigante por ::before.
  b.removeAttribute('data-bm096-icon');
  b.removeAttribute('data-bm096-context');
  b.style.removeProperty('--bm096-mask');
 }
}
function decorateCard(article){
 const h3=article.querySelector(':scope > h3');
 const id=article.querySelector(':scope > .tag')?.textContent?.trim();
 const ribbon=article.querySelector(':scope > .bm163-card-ribbon');
 const peek=article.querySelector(':scope > .bm-v050-peek-button');
 if(!h3||!id||!ribbon||!peek)return;
 article.classList.add('bm307-card');
 article.dataset.bm307Layout='ready';
 const badge=ribbon.querySelector('.bm163-area');
 if(badge&&!badge.dataset.bm307Clean){
  badge.textContent=badge.textContent.replace(/^[▤▦∑⚖⌘✎]\s*/u,'').trim();
  badge.dataset.bm307Clean='1';
 }
 peek.title='Abrir leitura de '+id;
 const caption=[...article.children].find(n=>n.tagName==='P'&&!n.classList.contains('bm163-card-ref')&&!n.classList.contains('bm305-card-sub')&&!n.classList.contains('bm307-hint'));
 if(caption&&!caption.classList.contains('bm307-legacy-caption')){
  const a=normalized(badge?.textContent||'');
  const sub=normalized(caption.textContent||'');
  if(sub.includes(' · ')||a&&sub.startsWith(a))caption.classList.add('bm307-legacy-caption');
 }
 const ref=article.querySelector(':scope > .bm163-card-ref');
 if(ref&&!article.querySelector(':scope > details.bm307-source')){
  const fold=document.createElement('details');
  fold.className='bm307-source';
  const heading=document.createElement('summary');
  heading.textContent='Fonte, referência e edição';
  heading.title='Exibir a referência integral cadastrada sem alterar o texto original';
  fold.append(heading,ref);
  const answer=article.querySelector(':scope > details:not(.bm307-source)');
  if(answer)answer.before(fold);else article.append(fold);
 }
 const buttons=article.querySelector(':scope > .buttons');
 if(buttons){
  buttons.classList.add('bm307-actions');
  for(const b of buttons.querySelectorAll('button')){
   const label=normalized(b.textContent);
   if(label.includes('excluir da visualizacao')||label.includes('restaurar')){
    b.classList.add('bm307-visibility-action');
    if(label.includes('excluir'))b.title='Ocultar nesta visualização, sem apagar o cartão original nem o SRS';
   }
   if(label.includes('grifar')||label.includes('escrever'))b.classList.add('bm307-annotation-action');
  }
 }
}
function run(){
 cleanAreas();
 const root=$('cardRows');
 if(!root)return;
 for(const card of root.querySelectorAll('article.card'))decorateCard(card);
}
function queue(){
 if(scheduled)return;
 scheduled=true;
 requestAnimationFrame(()=>{scheduled=false;run()});
}
function init(){
 run();
 const cards=$('cardRows'),areas=$('areaRows');
 if(cards){observer=new MutationObserver(queue);observer.observe(cards,{childList:true,subtree:true});}
 if(areas){
  areaObserver=new MutationObserver(queue);
  areaObserver.observe(areas,{childList:true,subtree:true,attributes:true,attributeFilter:['data-bm096-icon']});
 }
 document.addEventListener('bm302-section-changed',queue);
}
window.BM307CardLayout=Object.freeze({
 refresh:queue,
 get ready(){return Boolean(observer)},
 get decorated(){return $('cardRows')?.querySelectorAll('article.card.bm307-card').length||0}
});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
else init();
})();


;
/* 157 assets/v309_mobile_tabs.js */
/* V309 — menu de abas recolhível apenas no celular.
 * Não substitui botões nem handlers originais. Preserva foco/teclado, hash e navegação de desktop.
 */
(function(){
'use strict';
if(window.BM309MobileTabs)return;
const MQ='(max-width:620px)';
let btn=null,nav=null,mql=null,open=false,observer=null;
function activeName(){
 const active=nav?.querySelector('button[data-page].active');
 const s=String(active?.textContent||'Assuntos').trim();
 if(active?.dataset.page==='redacao')return 'Redação';
 if(active?.dataset.page==='controle-estudos')return 'Controle de Estudos';
 return s.length>33?s.slice(0,32)+'…':s;
}
function apply(){
 if(!btn||!nav)return;
 const mobile=Boolean(mql?.matches);
 if(!mobile)open=false;
 const expanded=mobile&&open;
 btn.hidden=!mobile;
 btn.setAttribute('aria-expanded',String(expanded));
 btn.setAttribute('aria-label',(expanded?'Recolher':'Abrir')+' abas de navegação. Atual: '+activeName());
 nav.hidden=mobile&&!expanded;
 document.documentElement.dataset.bm309MenuOpen=String(expanded);
 const label=btn.querySelector('.bm309-menu-label');
 if(label)label.textContent=expanded?'Recolher abas':'Abas';
 const current=btn.querySelector('.bm309-menu-current');
 if(current)current.textContent=activeName();
 const symbol=btn.querySelector('.bm309-menu-symbol');
 if(symbol)symbol.textContent=expanded?'×':'☰';
}
function hide(){if(!open)return;open=false;apply()}
function setup(){
 nav=document.querySelector('body>header .head>nav[aria-label="Seções"]');
 if(!nav)return;
 if(document.getElementById('bm309-mobile-tabs-toggle'))return;
 nav.id=nav.id||'bm309-main-sections';
 btn=document.createElement('button');
 btn.type='button';btn.id='bm309-mobile-tabs-toggle';btn.className='bm309-mobile-tabs-toggle';
 btn.setAttribute('aria-controls',nav.id);btn.setAttribute('aria-expanded','false');
 const icon=document.createElement('span');icon.className='bm309-menu-symbol';icon.setAttribute('aria-hidden','true');icon.textContent='☰';
 const label=document.createElement('strong');label.className='bm309-menu-label';label.textContent='Abas';
 const current=document.createElement('span');current.className='bm309-menu-current';current.textContent=activeName();
 const chevron=document.createElement('span');chevron.className='bm309-menu-chevron';chevron.setAttribute('aria-hidden','true');chevron.textContent='⌄';
 btn.append(icon,label,current,chevron);
 nav.before(btn);
 btn.addEventListener('click',()=>{open=!open;apply()});
 nav.addEventListener('click',e=>{
  if(e.target.closest?.('button[data-page]')){
   hide();
   queueMicrotask(apply);
  }
 });
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&open){hide();btn.focus()}});
 window.addEventListener('hashchange',()=>{hide();queueMicrotask(apply)});
 window.addEventListener('popstate',()=>{hide();queueMicrotask(apply)});
 mql=window.matchMedia(MQ);
 mql.addEventListener?.('change',()=>{open=false;apply()});
 observer=new MutationObserver(()=>{if(btn?.isConnected)apply()});
 observer.observe(nav,{subtree:true,attributes:true,attributeFilter:['class']});
 apply();
}
window.BM309MobileTabs=Object.freeze({get ready(){return Boolean(btn)},get open(){return open},close:hide});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',setup,{once:true});else setup();
})();

;
/* 158 assets/v309_calendar_sync_ui.js */
/* V309 — linha de conferência do Calendário no Controle de Estudos.
   Reutiliza a comparação SHA-256 e a proteção de conflitos existentes.
   Nenhuma leitura ou gravação direta de dados privados fora de BM240ControlDrive. */
(function(){
'use strict';
if(window.BM309CalendarSync)return;
const KEY='BM245_CONTROLE_ESTUDOS';
let installed=false,button=null,summary=null,status=null,running=false;
function localCount(){
 try{
  const d=window.BMVS41StudyControl?.snapshot();
  return (d?.sessions?.filter(x=>!x.deletedAt).length||0)+' sessões · '+
   (d?.plans?.length||0)+' atividades planejadas · '+
   (d?.reviews?.length||0)+' revisões da conta';
 }catch(_){return 'Dados locais não disponíveis para contagem'}
}
function explain(r){
 if(!r)return 'Ainda não houve conferência do Calendário com o Drive nesta sessão.';
 const t=String(r.message||'').trim();
 if(t)return t;
 return ({uploaded:'Dados enviados e conferidos no Drive',downloaded:'Dados do Drive importados',
 unchanged:'Cópias verificadas e idênticas',empty:'Sem registros locais para envio',
 conflict:'Conflito: nenhuma cópia foi substituída',merge_ready:'Conciliação pendente na aba Dados e backup',
 error:'Erro na conferência: originais preservados'})[r.state]||'Conferência pendente';
}
function update(){
 if(!installed)return;
 const api=window.BM240ControlDrive,drive=window.BM239DriveGlobal;
 summary.textContent=localCount();
 const r=api?.lastResult;
 const report=drive?.lastReport?.modules?.control;
 status.textContent=r?explain(r):report?.message||explain(null);
 status.dataset.state=r?.state||report?.state||'pending';
 if(!running){button.disabled=false;button.textContent='Conferir e sincronizar'}
}
async function run(){
 if(running)return;
 const drive=window.BM239DriveGlobal,token=window.BMVS41Session?.available();
 if(!token){
  const main=document.getElementById('bm239-drive-action');
  if(!main||main.disabled){status.textContent='A conexão ainda não está preparada. Autorize o Drive pelo cabeçalho e tente novamente.';return}
  status.textContent='Conclua a autorização de escrita do Google; o calendário só será transferido após a conferência.';
  main.click(); // clique encadeado diretamente a um gesto do usuário
  return;
 }
 const api=window.BM240ControlDrive;
 if(!api?.sync){status.textContent='Motor de sincronização do Calendário ainda indisponível; dados locais preservados.';return}
 running=true;button.disabled=true;button.textContent='Conferindo…';
 status.textContent='Comparando cópias local e remota, com proteção contra conflitos…';
 try{
  const r=await api.sync(token);
  status.textContent=explain(r);status.dataset.state=r?.state||'pending';
 }catch(e){
  status.textContent='Falha ao conferir o Calendário: '+String(e?.message||e);
  status.dataset.state='error';
 }finally{running=false;update()}
}
function mount(){
 if(installed)return;
 const root=document.getElementById('bm240-native-host')?.shadowRoot;
 const panel=root?.getElementById('calendarioControle')?.querySelector(':scope > .panel');
 if(!panel||!root.getElementById('calGrid')||!window.BM240ControlApp)return;
 const style=document.createElement('style');style.id='bm309-calendar-sync-css';
 style.textContent=[
 '#bm309-calendar-sync{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:4px 8px;align-items:center;margin:6px 0 9px;padding:8px 9px;border:1px solid #d5e5ee;border-radius:5px;background:#f5faff;font-family:"Segoe UI",Arial,sans-serif}',
 '#bm309-calendar-sync strong{font-size:11.5px;color:#1d628d}',
 '#bm309-calendar-sync .bm309-count{font-size:11px;color:#4a697c;line-height:1.4;min-width:0}',
 '#bm309-calendar-sync button{grid-column:2;grid-row:1/3;min-height:38px;max-width:178px;padding:6px 10px!important;background:#e9f5fc!important;border:1px solid #a6cce4!important;border-radius:4px!important;color:#1d658c!important;font:700 11px/1.3 "Segoe UI",Arial,sans-serif!important;white-space:normal;text-align:center}',
 '#bm309-calendar-sync .bm309-status{grid-column:1/-1;font-size:11px;line-height:1.5;color:#5d7180;overflow-wrap:anywhere}',
 '#bm309-calendar-sync .bm309-status[data-state="uploaded"],#bm309-calendar-sync .bm309-status[data-state="downloaded"],#bm309-calendar-sync .bm309-status[data-state="unchanged"]{color:#226c59}',
 '#bm309-calendar-sync .bm309-status[data-state="error"],#bm309-calendar-sync .bm309-status[data-state="conflict"]{color:#9f4a4a}',
 '@media(max-width:500px){#bm309-calendar-sync{grid-template-columns:minmax(0,1fr)}#bm309-calendar-sync button{grid-column:1;grid-row:auto;max-width:none;width:100%}#bm309-calendar-sync .bm309-status{grid-column:1}}'
 ].join('\n');root.append(style);
 const holder=document.createElement('div');holder.id='bm309-calendar-sync';
 const heading=document.createElement('strong');heading.textContent='Calendário e Drive';
 summary=document.createElement('div');summary.className='bm309-count';
 button=document.createElement('button');button.type='button';button.id='bm309-calendar-sync-action';button.textContent='Sincronizar calendário';button.addEventListener('click',()=>{void run()});
 status=document.createElement('div');status.className='bm309-status';status.setAttribute('role','status');status.setAttribute('aria-live','polite');
 holder.append(heading,summary,button,status);
 const title=panel.querySelector(':scope > h2');if(title)title.after(holder);else panel.prepend(holder);
 installed=true;update();
 document.addEventListener('bm240-control-verified',update);
 document.addEventListener('bm239-sync-finished',update);
 window.addEventListener('bm240-study-changed',update);
 window.addEventListener('storage',e=>{if(e.key===KEY)update()});
}
function init(){
 mount();
 document.addEventListener('bm240-study-mounted',mount);
 document.addEventListener('bm253-calendar-compact-ready',mount);
}
window.BM309CalendarSync=Object.freeze({get ready(){return installed},refresh:update,sync:run});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();


;
/* 159 assets/v314_srs_layout.js */
/* Banco Mestre V314 — interface enxuta do Planejamento SRS.
 * Apresentação somente; preserva os handlers e os dados do calendário V313.
 */
(function(){
'use strict';
if(window.BM314SrsLayout)return;
let mounted=false;
function create(tag,className,text){
 const e=document.createElement(tag);
 if(className)e.className=className;
 if(text!==undefined)e.textContent=text;
 return e;
}
function mount(){
 if(mounted)return;
 const root=document.getElementById('calendario');
 const wrap=root?.querySelector('.c141-wrap');
 const queue=root?.querySelector('#c313-panel');
 const calendar=root?.querySelector('.c141-board');
 const importPane=root?.querySelector('.c141-import');
 const source=root?.querySelector('.c141-private-source');
 if(!wrap||!queue||!calendar||!importPane||!source)return;
 mounted=true;root.classList.add('bm314-organized');

 const css=create('style');css.id='bm314-srs-layout-style';
 css.textContent=`
 #calendario.bm314-organized{--bm314-ink:#233f4b;--bm314-muted:#506775;--bm314-line:#d5e2e6}
 #calendario.bm314-organized .c141-wrap{max-width:1220px;margin:auto;min-width:0}
 #calendario.bm314-organized .c141-title{margin:0 0 12px;align-items:start}
 #calendario.bm314-organized .c141-title h2{font-size:clamp(21px,2.5vw,27px);line-height:1.25;margin:0 0 4px}
 #calendario.bm314-organized .c141-title p{font-size:13px;line-height:1.48;max-width:790px}
 #calendario.bm314-organized .c141-stats{margin:9px 0 12px;gap:9px}
 #calendario.bm314-organized .c141-stat{padding:12px 14px;box-shadow:none}
 #calendario.bm314-organized .c141-stat strong{font-size:24px;line-height:1.2}
 #calendario.bm314-organized .c141-stat span{line-height:1.35}
 #calendario.bm314-organized .c141-private-source{margin:0 0 14px!important;padding:12px 14px!important;border:1px solid #cbdde0!important;background:#f5faf9!important;display:flex;align-items:center;gap:12px;flex-wrap:wrap}
 #calendario.bm314-organized .c141-private-source button{flex:none;max-width:100%}
 #calendario.bm314-organized .c141-private-source span{flex:1 1 250px;min-width:0;color:#455e69;font-size:12px;line-height:1.5;margin:0!important}
 #calendario .c314-tabs{display:flex;gap:6px;flex-wrap:wrap;margin:0 0 12px;border-bottom:1px solid #cadbe0;padding-bottom:7px}
 #calendario .c314-tab{border:1px solid transparent!important;border-radius:7px!important;background:transparent!important;color:#3e6472!important;font-size:13px!important;min-height:40px;font-weight:750;padding:9px 14px!important}
 #calendario .c314-tab:hover{background:#eaf2f3!important}
 #calendario .c314-tab[aria-selected="true"]{background:#e8f2f1!important;border-color:#bdd7d4!important;color:#165c61!important}
 #calendario .c314-tab:focus-visible{outline:2px solid #267f84!important;outline-offset:2px}
 #calendario .c314-pane{min-width:0;background:#fff;border:1px solid var(--bm314-line,#d5e2e6);border-radius:11px;padding:14px;margin:0 0 12px}
 #calendario .c314-pane[hidden]{display:none!important}
 #calendario .c314-pane-title{font-size:16px;font-weight:800;color:var(--bm314-ink,#233f4b);margin:0 0 5px}
 #calendario .c314-pane-desc{font-size:12px;color:var(--bm314-muted,#506775);margin:0 0 12px;line-height:1.5}
 #calendario.bm314-organized #c313-panel{border:0!important;border-radius:0!important;background:transparent!important;padding:0!important;margin:0!important;min-width:0}
 #calendario.bm314-organized #c313-panel>h3{display:none}
 #calendario.bm314-organized #c313-panel>div:nth-of-type(1){margin-bottom:11px!important}
 #calendario.bm314-organized #c313-panel label{font-size:12px;font-weight:700;color:#456674}
 #calendario.bm314-organized #c313-panel select,#calendario.bm314-organized #c313-panel input{padding:8px 10px;border-radius:7px;min-height:38px}
 #calendario.bm314-organized #c313-count{font-size:12px;color:#536f79;margin:6px 0 9px!important}
 #calendario.bm314-organized #c313-panel .c141-scroll{border:1px solid #dce7ea;border-radius:8px}
 #calendario.bm314-organized #c313-panel table{min-width:830px;table-layout:fixed;font-size:12px;line-height:1.42}
 #calendario.bm314-organized #c313-panel th{position:sticky;top:0;z-index:1;background:#edf4f5;padding:9px 10px}
 #calendario.bm314-organized #c313-panel td{padding:10px;vertical-align:top;overflow-wrap:anywhere}
 #calendario.bm314-organized #c313-panel th:first-child{width:115px}
 #calendario.bm314-organized #c313-panel th:nth-child(2){width:28%}
 #calendario.bm314-organized #c313-panel th:nth-child(3){width:110px}
 #calendario.bm314-organized #c313-panel th:nth-child(4){width:100px}
 #calendario.bm314-organized #c313-panel th:nth-child(5){width:110px}
 #calendario.bm314-organized #c313-panel th:last-child{width:110px}
 #calendario.bm314-organized #c313-panel td:nth-child(2) strong{display:block;font-size:12px;font-weight:750;margin-bottom:4px}
 #calendario.bm314-organized #c313-panel td:nth-child(2) small{display:block;font-size:11px;color:#59717a;line-height:1.4;max-height:58px;overflow:hidden}
 #calendario.bm314-organized #c313-panel tbody tr:hover{background:#f2f8f8}
 #calendario.bm314-organized #c313-panel .c141-today{background:#fff8f5}
 #calendario.bm314-organized .c141-settings{margin-bottom:12px;max-width:100%}
 #calendario.bm314-organized .c141-board{margin:0;max-width:100%}
 #calendario.bm314-organized .c141-board .c141-scroll{max-height:490px;overflow:auto}
 #calendario.bm314-organized .c141-status{font-size:12px;margin:10px 0 0}
 #calendario.bm314-organized .c141-import{margin:0;border:0;padding:0}
 #calendario.bm314-organized .c141-import p{font-size:12px;line-height:1.55}
 #calendario.bm314-organized .c314-method{border:1px solid #dce5e7;border-radius:8px;padding:10px 12px;margin-top:12px}
 #calendario.bm314-organized .c314-method>summary{font-weight:750;font-size:12px}
 #calendario.bm314-organized .c141-note{font-size:12px;line-height:1.55;margin:10px 0 0}
 #calendario.bm314-organized .c141-limit{font-size:12px;font-weight:650;padding:8px 10px;margin:10px 0;display:inline-block}
 @media(max-width:700px){
  #calendario.bm314-organized .c141-stats{grid-template-columns:repeat(2,minmax(0,1fr))}
  #calendario.bm314-organized .c141-stat{padding:10px}
  #calendario.bm314-organized .c141-stat strong{font-size:21px}
  #calendario .c314-pane{padding:10px}
  #calendario .c314-tabs{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:5px}
  #calendario .c314-tab{padding:9px 5px!important;font-size:11px!important;line-height:1.3}
  #calendario.bm314-organized .c141-private-source button{width:100%}
  #calendario.bm314-organized .c141-private-source span{flex:1 1 100%}
  #calendario.bm314-organized #c313-panel label{flex:1 1 100%}
  #calendario.bm314-organized #c313-panel select,#calendario.bm314-organized #c313-panel input{width:100%!important;max-width:none}
 }
 `;
 document.head.append(css);

 const title=root.querySelector('.c141-title');
 const subtitle=title?.querySelector('p');
 if(subtitle)subtitle.textContent='Veja os atrasados, os próximos vencimentos e o histórico disponível. A consulta não registra respostas nem altera o SRS.';
 const indicator=root.querySelector('.c141-limit');
 const note=root.querySelector('.c141-note');
 const status=root.querySelector('.c141-status');
 const settings=root.querySelector('.c141-settings');

 const nav=create('div','c314-tabs');nav.setAttribute('role','tablist');
 nav.setAttribute('aria-label','Visualizações do Planejamento de revisões');
 const panes=[
  create('div','c314-pane'),create('div','c314-pane'),create('div','c314-pane')
 ];
 const specs=[
  {id:'fila',name:'Fila de revisão',heading:'Cartões por prioridade',desc:'Atrasados primeiro. Pesquise por ID ou assunto, confira a data e abra o cartão.'},
  {id:'calendario',name:'Calendário',heading:'Calendário de revisões',desc:'Organize os próximos dias; mover uma revisão aqui não altera o agendamento SRS.'},
  {id:'dados',name:'Importar e regras',heading:'Importação e metodologia',desc:'Dados de revisão ficam no seu navegador. Confira as regras antes de importar.'}
 ];
 const tabs=[];
 function selectTab(index,focus=false){
  for(let i=0;i<panes.length;i++){
   const selected=i===index;
   panes[i].hidden=!selected;
   tabs[i].setAttribute('aria-selected',String(selected));
   tabs[i].tabIndex=selected?0:-1;
  }
  root.dataset.bm314Tab=specs[index].id;
  if(focus)tabs[index].focus();
 }
 specs.forEach((spec,i)=>{
  const tab=create('button','c314-tab',spec.name);tab.type='button';
  tab.id='c314-tab-'+spec.id;tab.setAttribute('role','tab');
  tab.setAttribute('aria-controls','c314-pane-'+spec.id);
  tab.addEventListener('click',()=>selectTab(i));
  tab.addEventListener('keydown',e=>{
   if(!['ArrowRight','ArrowLeft','Home','End'].includes(e.key))return;
   e.preventDefault();
   const next=e.key==='Home'?0:e.key==='End'?tabs.length-1:e.key==='ArrowRight'?(i+1)%tabs.length:(i+tabs.length-1)%tabs.length;
   selectTab(next,true);
  });
  tabs.push(tab);nav.append(tab);
  const pane=panes[i];pane.id='c314-pane-'+spec.id;
  pane.setAttribute('role','tabpanel');pane.setAttribute('aria-labelledby',tab.id);
  pane.append(create('h3','c314-pane-title',spec.heading));
  pane.append(create('p','c314-pane-desc',spec.desc));
 });
 const wrapSource=source;
 // Move existing interface nodes; event handlers and ID references remain intact.
 panes[0].append(queue);
 if(settings)panes[1].append(settings);
 if(indicator)panes[1].append(indicator);
 panes[1].append(calendar);
 if(status)panes[1].append(status);
 panes[2].append(importPane);
 if(note){
  const method=create('details','c314-method');
  method.append(create('summary','', 'Regras SRS e segurança da fonte'),note);
  panes[2].append(method);
 }
 wrap.append(nav,...panes);
 // Source stays under statistics and above sub-tabs.
 const stat=root.querySelector('.c141-stats');
 if(stat)stat.after(wrapSource);
 selectTab(0);
 window.BM314SrsLayout=Object.freeze({
  get mounted(){return mounted},
  show:(name)=>{const idx=specs.findIndex(s=>s.id===name);if(idx<0)return false;selectTab(idx);return true},
  get active(){return root.dataset.bm314Tab}
 });
 document.dispatchEvent(new CustomEvent('bm314-srs-ready'));
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});
else mount();
})();

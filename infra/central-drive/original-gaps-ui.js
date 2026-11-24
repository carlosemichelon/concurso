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
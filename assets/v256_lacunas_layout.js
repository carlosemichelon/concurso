/* V256 — ficha de lacuna com hierarquia, relato intacto e histórico legível. */
(function(){
'use strict';if(window.BM256LacunasLayout)return;
const make=(tag,cls,value)=>{const x=document.createElement(tag);if(cls)x.className=cls;if(value!==undefined)x.textContent=value;return x};
function section(p,title,style){
 const anchor=document.createComment('posição da lacuna');p.replaceWith(anchor);
 const group=make('section','bm256-lac-block '+style);group.append(make('h4','',title),p);
 anchor.replaceWith(group);return group;
}
function enhance(item){
 if(item.dataset.bm256Layout)return;
 const head=item.querySelector(':scope > strong'),id=item.querySelector(':scope > code');
 if(!head||!id)return;
 const h=make('header','bm256-lac-header'),title=make('h3'),label=make('div','bm256-lac-id');
 title.append(head);label.append(id);h.append(title,label);item.prepend(h);
 const p=[...item.children].filter(x=>x.tagName==='P');
 const trail=p.find(x=>x.textContent.includes(' › '));
 if(trail){trail.classList.add('bm256-lac-path');trail.setAttribute('aria-label','Disciplina, assunto, tema e subassunto')}
 const metadata=p.find(x=>x.classList.contains('bm242-muted')&&x.textContent.includes(' · '));
 if(metadata){
  const values=metadata.textContent.split(' · ');
  if(values.length===4){
   const dl=make('dl','bm256-lac-meta');
   ['Tipo','Cobertura','Situação','Prioridade'].forEach((name,i)=>{const d=make('div');d.append(make('dt','',name),make('dd','',values[i]));dl.append(d)});
   metadata.replaceWith(dl);
  }
 }
 const blocks=[
  ['Relato literal:','Minha dúvida, nas minhas palavras','bm256-lac-student'],
  ['Diagnóstico do assistente','Diagnóstico e grau de certeza','bm256-lac-analysis'],
  ['Origem:','Questão ou pesquisa de origem','bm256-lac-origin'],
  ['Pesquisa:','Pesquisa e reforço','bm256-lac-research']
 ];
 for(const [prefix,title,style] of blocks){
  const n=[...item.children].find(x=>x.tagName==='P'&&x.firstElementChild?.tagName==='B'&&x.firstElementChild.textContent.startsWith(prefix));
  if(!n)continue;
  const confidence=prefix==='Diagnóstico do assistente'?n.firstElementChild.textContent.replace(/^Diagnóstico do assistente\s*/,'').replace(/:\s*$/,'').trim():'';
  const s=section(n,title,style);
  if(confidence){const detail=make('p','bm256-lac-confidence','Certeza informada: '+confidence);s.insertBefore(detail,n)}
 }
 const actions=item.querySelector(':scope > .bm242-actions');
 if(actions){actions.classList.add('bm256-lac-actions');actions.setAttribute('aria-label','Ações desta lacuna');
  const stage=actions.querySelector('[data-stage]');if(stage){stage.classList.add('bm256-lac-stage');stage.title='A mudança de situação não substitui evidência de domínio nem altera o SRS';}
 }
 const history=[...item.children].find(x=>x.tagName==='DETAILS'&&x.querySelector('summary')?.textContent==='Fonte, auditoria e histórico');
 if(history){
  history.classList.add('bm256-lac-history');history.querySelector('summary').textContent='Fontes, auditoria e linha do tempo';
  history.querySelectorAll(':scope > p').forEach(line=>{
   const raw=line.textContent,match=raw.match(/^(\S+T\S+)\s+·\s+([^·]+)\s+·\s*(.*)$/);
   if(!match)return;
   const date=new Date(match[1]);if(!Number.isFinite(+date))return;
   const pt=new Intl.DateTimeFormat('pt-BR',{timeZone:'America/Sao_Paulo',dateStyle:'short',timeStyle:'short'}).format(date);
   line.textContent=pt+' · '+match[2].trim()+(match[3]?' · '+match[3]:'');
   line.title=raw;line.classList.add('bm256-lac-event');
  });
 }
 item.dataset.bm256Layout='1';
}
let pending=false;
function render(){pending=false;document.querySelectorAll('#bm242-list > article.bm242-item').forEach(enhance)}
function schedule(){if(!pending){pending=true;queueMicrotask(render)}}
function start(){
 schedule();const observer=new MutationObserver(changes=>{
  if(changes.some(m=>m.target.id==='bm242-list'||Array.from(m.addedNodes).some(n=>n.nodeType===1&&(n.matches?.('.bm242-item,#bm242-list')||n.querySelector?.('.bm242-item')))))schedule();
 });
 observer.observe(document.body,{childList:true,subtree:true});
}
window.BM256LacunasLayout=Object.freeze({render,version:'V256',doesNotSave:true});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
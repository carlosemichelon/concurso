/* Banco Mestre V163 — metadados de estudo e ícones discretos nos cartões.
   Apenas apresentação, sem tocar em IDs, textos, registros e SRS. */
(function(){
'use strict';
if(window.BM163CardPolish)return;
const root=document.getElementById('cardRows');if(!root)return;
const titleIcons={
 'LEGISLACAO':'⚖','PORTUGUES':'✎','MATEMATICA':'∑','INFORMATICA':'⌘'
};
const el=(tag,cls,text)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=text;return n};
const idOf=a=>a.querySelector(':scope > .tag')?.textContent?.trim()||'';
const lookup=()=>new Map((typeof cards!=='undefined'&&Array.isArray(cards)?cards:[]).map(c=>[c.id,c]));
function badge(text,type){const n=el('span','bm163-card-badge '+(type||''),text);return n}
function decorate(){
 const byId=lookup();
 for(const article of root.querySelectorAll('article.card')){
  if(article.dataset.bm163Polish==='ready')continue;
  const c=byId.get(idOf(article));if(!c)continue;
  const heading=article.querySelector(':scope > h3');
  if(!heading)continue;
  const ribbon=el('div','bm163-card-ribbon');
  const code=c.provisional?'LEGISLACAO':String(c.group||'');
  const area=c.provisional?'Legislação de Ijuí':(c.discipline||'Outros');
  const symbol=code.startsWith('ENG_')?'▤':titleIcons[code]||'▦';
  ribbon.append(badge(symbol+'  '+area,'bm163-area'),badge(c.provisional?'Cópia operacional':'Base original',c.provisional?'bm163-provisional':'bm163-canonical'));
  heading.before(ribbon);
  const line=el('div','bm163-card-info');
  if(c.subject)line.append(badge(c.subject,'bm163-topic'));
  if(c.sub)line.append(badge(c.sub,'bm163-sub'));
  const guide=c.origin_question_id&&typeof guideData!=='undefined'?guideData?.questoes?.[c.origin_question_id]:null;
  if(guide)line.append(badge('Guia aprofundado','bm163-guide'));
  const path=article.querySelector(':scope > .v036-card-path');
  if(path)path.after(line);else heading.after(line);
  if(c.reference){
   const ref=el('p','bm163-card-ref');
   const icon=el('span','bm163-ref-icon','§');icon.setAttribute('aria-hidden','true');
   const tag=el('span','', 'Referência cadastrada: '+c.reference);
   ref.append(icon,tag);line.after(ref);
  }
  const peek=article.querySelector(':scope > .bm-v050-peek-button');
  if(peek)peek.title='Abrir leitura aprofundada com rolagem nesta página';
  article.dataset.bm163Polish='ready';
 }
}
let queued=false;const run=()=>{if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;decorate()})};
new MutationObserver(run).observe(root,{childList:true,subtree:true});run();
window.BM163CardPolish=Object.freeze({refresh:run});
})();
/* V280: move os controles existentes para um recolhível — não recria dados ou eventos. */
(function(){'use strict';if(window.BM280CompactFilters)return;
function init(id){
 const sec=document.getElementById(id),panel=sec?.querySelector(':scope > .panel');
 const controls=panel?.querySelector(':scope > .controls');
 if(!panel||!controls||panel.querySelector('.bm280-advanced'))return;
 const details=document.createElement('details');details.className='bm280-advanced';details.id='bm280-'+id+'-advanced';
 const summary=document.createElement('summary');summary.setAttribute('aria-label','Mais filtros');
 const name=document.createElement('span');name.textContent='Mais filtros';
 const active=document.createElement('span');active.className='bm280-active';active.hidden=true;
 summary.append(name,active);
 const body=document.createElement('div');body.className='bm280-advanced-body';details.append(summary,body);
 const keep=new Set({assuntos:['topicSearch','topicCount'],pdfs:['pdfSearch','pdfCount'],
  cartoes:['cardSearch','cardCount'],imagens:['imageSearch','imageCount']}[id]||[]);
 for(const node of [...controls.children]){
  if(keep.has(node.id)||(id==='cartoes'&&node.classList.contains('bm279-recent-label')))continue;
  if(node.matches('input[type="search"]'))continue;
  body.append(node);
 }
 const insert=ids=>{for(const item of ids){const n=document.getElementById(item);if(n)body.append(n)}};
 if(id==='cartoes'){
  const f=document.getElementById('bm152Filters');if(f)body.prepend(f);
  insert(['bm273Versoes']);
 }
 if(id==='pdfs'){
  const a=document.getElementById('pdfAreaNavV036');if(a)body.prepend(a);
 }
 if(id==='imagens'){
  const help=panel.querySelector(':scope > .originalHelp');if(help)body.append(help);
  const notice=panel.querySelector(':scope > .notice');if(notice)body.append(notice);
 }
 controls.classList.add('bm280-main-controls');controls.after(details);
 const update=()=>{
  let n=0;
  for(const el of body.querySelectorAll('input,select')){
   if(el.disabled||el.type==='hidden')continue;
   if(el.type==='checkbox'||el.type==='radio'){if(el.checked)n++}
   else if(el.tagName==='SELECT'&&el.value&&el.value!=='all')n++;
  }
  active.hidden=n===0;active.textContent=n+' ativo'+(n===1?'':'s');
 };
 details.addEventListener('change',update);details.addEventListener('input',update);
 const reset=document.getElementById('bm152Reset');
 if(id==='cartoes'&&reset)reset.addEventListener('click',()=>queueMicrotask(update));
 setTimeout(update,0);
}
function start(){['assuntos','pdfs','cartoes','imagens'].forEach(init)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
window.BM280CompactFilters=Object.freeze({refresh:start});
})();

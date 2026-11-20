/* V300 — controles essenciais por aba. Move nós reais e preserva listeners/valores. */
(function(){
'use strict';
if(window.BM300Filters)return;
const $=id=>document.getElementById(id);
const el=(tag,cls,text)=>{const x=document.createElement(tag);if(cls)x.className=cls;if(text!==undefined)x.textContent=text;return x};
function wrap(id){const input=$(id);return input?.closest('label')||input||null}
function panel(sec){return document.querySelector('#'+sec+' > .panel')}
function more(id,title){
 let d=$(id);if(d)return d;
 d=el('details','bm299-more');d.id=id;
 const summary=el('summary','',title);summary.setAttribute('aria-label',title);
 const inner=el('div','bm299-more-body');
 d.append(summary,inner);return d;
}
function body(d){return d.querySelector('.bm299-more-body')}
function add(container,id){const x=wrap(id);if(x&&container&&!container.contains(x))container.append(x);return !!x}
function bury280(sec,where){
 const d=$('bm280-'+sec+'-advanced');if(!d)return;
 const b=d.querySelector('.bm280-advanced-body');
 if(b)for(const child of [...b.children])where.append(child);
 d.hidden=true;
}
function counter(details){
 if(details.dataset.bm299Counter)return;
 details.dataset.bm299Counter='1';
 const s=details.querySelector(':scope>summary'),base=s.textContent.trim();
 function update(){
  let n=0;
  for(const x of body(details).querySelectorAll('input,select')){
   if(x.disabled||x.type==='hidden'||x.type==='file')continue;
   if(x.type==='checkbox'||x.type==='radio'){if(x.checked)n++;}
   else if(x.tagName==='SELECT'&&x.value&&x.value!=='all')n++;
  }
  s.textContent=base+(n?' · '+n+' ativo'+(n>1?'s':''):'');
 }
 details.addEventListener('change',update);
 details.addEventListener('input',update);
 update();
}
function subjects(){
 const root=panel('assuntos');if(!root||$('bm299-assuntos-quick'))return true;
 const search=$('topicSearch'),area=$('topicArea'),count=$('topicCount');
 if(!search||!area)return false;
 const row=el('div','bm299-quick');row.id='bm299-assuntos-quick';
 row.append(search,area);if(count)row.append(count);
 const old=root.querySelector(':scope>.controls');
 (old||root).after(row);
 bury280('assuntos',row);
 if(old&&old.childElementCount===0)old.hidden=true;
 return true;
}
function pdfs(){
 const root=panel('pdfs');if(!root||$('bm299-pdf-quick'))return true;
 const search=$('pdfSearch'),group=$('pdfFilter'),bar=$('bm210PdfToolbar');
 if(!search||!group||!bar)return false;
 const row=el('div','bm299-quick');row.id='bm299-pdf-quick';
 row.append(search,group);if($('pdfCount'))row.append($('pdfCount'));
 bar.before(row);
 const d=more('bm299-pdf-more','Ferramentas e filtros adicionais'),b=body(d);
 for(const x of ['pdfHidden'])add(b,x);
 const nav=$('pdfAreaNavV036');if(nav)b.append(nav);
 bury280('pdfs',b);
 const actions=$('bm210PdfActions');
 if(actions){
  const essential=new Set(['driveConnectV038','bm-pdf-sync-refresh']);
  for(const child of [...actions.children]){
   if(essential.has(child.id))continue;
   b.append(child);
  }
 }
 const controls=root.querySelector(':scope>.controls');
 if(controls&&controls.childElementCount===0)controls.hidden=true;
 bar.after(d);counter(d);
 return true;
}
function cards(){
 const root=panel('cartoes');if(!root||$('bm299-card-quick'))return true;
 const search=$('cardSearch'),discipline=$('bm152Discipline'),filters=$('bm152Filters');
 if(!search||!discipline||!filters)return false;
 const row=el('div','bm299-quick');row.id='bm299-card-quick';
 row.append(search,wrap('bm152Discipline'));
 if($('cardCount'))row.append($('cardCount'));
 const d=more('bm299-card-more','Filtros e opções adicionais');
 const anchor=root.querySelector(':scope > h2')||root.firstElementChild;
 if(anchor)anchor.after(row);else root.prepend(row);
 row.after(d);
 body(d).append(filters);
 bury280('cartoes',body(d));
 counter(d);return true;
}
function images(){
 const root=panel('imagens'),bar=$('bm209SyncBar'),fields=$('bm155ImageFilters');
 const search=$('bm293ImageSearchRow')||$('imageSearch');
 if(!root||!bar||!fields||!search)return false;
 if(!$('bm299-image-options')){
  const d=more('bm299-image-options','Outras ações e informações');
  const b=body(d);
  for(const id of ['bm293ImageActions','bm210ImageInfo']){
   const x=$(id);if(x)b.append(x);
  }
  bury280('imagens',b);
  bar.append(d);counter(d);
 }
 const selectIds=['bm155DisciplinaImagem','bm155AssuntoGeralImagem','bm155AssuntoEspecificoImagem','bm155SubassuntoImagem'];
 const all=selectIds.map(id=>$(id)?.closest('label'));
 if(all.some(x=>!x))return false;
 all.forEach((x,i)=>x.classList.toggle('bm299-image-extra',i>0));
 if(!$('bm299-image-toggle')){
  const btn=el('button','bm299-toggle','Mais filtros');btn.type='button';btn.id='bm299-image-toggle';btn.setAttribute('aria-expanded','false');
  btn.onclick=()=>{
   const open=fields.classList.toggle('bm299-image-expanded');
   btn.setAttribute('aria-expanded',String(open));
   btn.textContent=open?'Menos filtros':'Mais filtros';
  };
  fields.append(btn);
 }
 bar.classList.add('bm299-image-compact');
 return true;
}
let attempts=0;
function mount(){
 const done=[subjects(),pdfs(),cards(),images()].every(Boolean);
 if(!done&&++attempts<22)setTimeout(mount,250);
}
function start(){
 mount();
 document.querySelector('header nav')?.addEventListener('click',e=>{
  if(!e.target.closest('[data-page="imagens"]'))return;
  setTimeout(images,35);
 });
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
window.BM299Filters=Object.freeze({refresh:mount});
})();
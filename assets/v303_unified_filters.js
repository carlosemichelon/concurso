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

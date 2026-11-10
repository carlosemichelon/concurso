
/* Banco Mestre V038 — biblioteca PDF organizada por assunto.
 * Catálogo e arquivos originais são preservados. */
(function(){
'use strict';
const byId=id=>document.getElementById(id);
const normalize=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const node=(tag,cls,content)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(content!==undefined)e.textContent=String(content);return e};
const button=(label,fn,cls)=>{const b=node('button',cls,label);b.type='button';b.onclick=fn;return b};
let data=null,lookup=null,groups=null,areas=null,pending=null;
async function ready(){
 if(data)return data;
 if(!pending)pending=fetch('assets/pdf_grupos_v036.json',{cache:'no-store'}).then(async r=>{
  if(!r.ok)throw Error('Índice de PDFs indisponível');
  const d=await r.json();if(d.format!=='BancoMestrePDFGroupsV036'||d.assigned?.length!==63)throw Error('Índice incompatível');
  if(new Set(d.assigned.map(x=>x.id)).size!==63)throw Error('IDs de PDFs repetidos');
  data=d;groups=new Map(d.groups.map(g=>[g.id,g]));areas=new Map(d.areas.map(a=>[a.id,a]));
  lookup=new Map(d.assigned.map(x=>[x.id,groups.get(x.group)]));
  return d;
 }).catch(err=>{pending=null;throw err});
 return pending;
}
function updateFilters(){
 const sel=byId('pdfFilter');if(!sel||sel.dataset.bm036==='1')return;
 sel.replaceChildren(new Option('Todos os grupos','all'));
 for(const area of data.areas){
  sel.add(new Option(area.label,'area:'+area.id));
  for(const g of data.groups.filter(x=>x.area===area.id).sort((a,b)=>a.order-b.order))
   sel.add(new Option('   — '+g.label,'group:'+g.id));
 }
 sel.dataset.bm036='1';sel.value='all';
 const n=byId('pdfAreaNavV036');if(n){
  n.replaceChildren();
  n.append(button('Todos',()=>choose('all'),'v036-pdf-pill'));
  for(const area of data.areas)n.append(button(area.label,()=>choose('area:'+area.id),'v036-pdf-pill'));
 }
}
function choose(value){
 byId('pdfFilter').value=value;pdfRender();
 byId('pdfRows').scrollIntoView({block:'start',behavior:'smooth'});
}
function sourceType(p){
 if(p.id.startsWith('IJUI-PDF-'))return 'Norma ou lei';
 if(p.id.startsWith('CAP-'))return 'Capítulo do manuscrito';
 if(p.id.startsWith('GUIA-'))return 'Guia de estudo';
 if(p.id.startsWith('PETRO10-'))return 'Licenciamento / Petrobras';
 return 'Manuscrito integral';
}
function pdfCard(p,off){
 const a=node('article','v036-pdf-card');
 const meta=node('div','v036-pdf-meta');
 meta.append(node('span','v036-pdf-id',p.id),node('span','',sourceType(p)));
 if(p.pages?.length===2)meta.append(node('span','', 'Páginas '+p.pages[0]+'–'+p.pages[1]));
 if(off)meta.append(node('span','v036-muted','Oculto'));
 const title=node('h4','v036-pdf-title',p.title);
 title.tabIndex=0;title.setAttribute('role','button');title.title='Ler '+p.id;
 title.onclick=()=>window.BancoMestreDriveV038.openAndEdit(p);
 title.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();window.BancoMestreDriveV038.openAndEdit(p)}};
 const actions=node('div','v036-pdf-actions');
 actions.append(button('Ler e editar no site',()=>window.BancoMestreDriveV038.openAndEdit(p),'v036-primary'));
 const link=node('a','v036-pdf-link','Abrir no Drive');
 link.href=p.url;link.target='_blank';link.rel='noopener noreferrer';actions.append(link);
 // V035 confirma qualquer exclusão antes de realizar esta ação.
 actions.append(button(off?'Restaurar':'Excluir',()=>{if(exclude('PDF',p.id,!off))pdfRender()},off?'v036-soft':'v036-danger'));
 a.append(meta,title,actions);return a;
}
function matched(p,filter,search){
 const group=lookup.get(p.id);if(!group)return false;
 const area=areas.get(group.area);
 if(filter.startsWith('area:')&&group.area!==filter.slice(5))return false;
 if(filter.startsWith('group:')&&group.id!==filter.slice(6))return false;
 const text=normalize([p.title,p.id,p.section,p.category,group.label,group.subtitle,area?.label].join(' '));
 return !search||text.includes(search);
}
function render(){
 const root=byId('pdfRows');if(!root)return;
 const search=normalize(byId('pdfSearch').value).trim(),f=byId('pdfFilter').value;
 const off=hidden('PDF'),show=byId('pdfHidden').checked;
 const selected=docs.filter(p=>(show||!off.has(p.id))&&matched(p,f,search));
 root.replaceChildren();
 const visibleGroups=new Set(selected.map(p=>lookup.get(p.id)?.id));
 const compact=search.length>0||f!=='all';
 byId('pdfCount').textContent=selected.length+' PDF(s) em '+visibleGroups.size+' grupo(s)';
 const tabs=byId('pdfAreaNavV036');
 if(tabs){for(const b of tabs.querySelectorAll('button')){
  const id=b.textContent==='Todos'?'all':'area:'+(data.areas.find(x=>x.label===b.textContent)?.id||'');
  b.classList.toggle('selected',f===id);
 }}
 if(!selected.length){root.append(node('p','v036-empty','Nenhum PDF localizado. Altere o filtro ou o termo pesquisado.'));return}
 for(const area of data.areas){
  const areaDocs=selected.filter(p=>lookup.get(p.id).area===area.id);
  if(!areaDocs.length)continue;
  const block=node('div','v036-pdf-area');
  const head=node('div','v036-area-head');
  head.append(node('h3','',area.label),node('span','v036-count',areaDocs.length+' documentos'));
  block.append(head,node('p','v036-area-desc',area.description));
  const groupList=data.groups.filter(g=>g.area===area.id).sort((a,b)=>a.order-b.order);
  for(const group of groupList){
   const items=areaDocs.filter(p=>lookup.get(p.id).id===group.id);if(!items.length)continue;
   const detail=node('details','v036-pdf-group');
   detail.open=false; // V055: todos os grupos começam recolhidos, inclusive com busca/filtro.
   const summary=node('summary','v036-pdf-summary');
   const left=node('span','v036-pdf-heading');
   left.append(node('strong','',group.label),node('small','',group.subtitle));
   summary.append(left,node('span','v036-count',items.length+' PDF'+(items.length>1?'s':'')));
   detail.append(summary);
   const grid=node('div','v036-pdf-grid');
   for(const p of items)grid.append(pdfCard(p,off.has(p.id)));
   detail.append(grid);block.append(detail);
  }
  root.append(block);
 }
}
const oldPdfRender=pdfRender;
pdfRender=function(){
 if(!docs.length)return;
 ready().then(()=>{
  if(data.assigned.some(a=>!docs.some(p=>p.id===a.id)))throw Error('Catálogo PDF incompleto');
  updateFilters();render();
 }).catch(e=>{console.warn('Grupos PDF V036:',e);oldPdfRender()});
};
byId('pdfSearch').placeholder='Pesquisar título, norma, assunto ou código';
byId('pdfSearch').oninput=()=>pdfRender();
byId('pdfFilter').onchange=()=>pdfRender();
byId('pdfHidden').onchange=()=>pdfRender();
window.BancoMestrePDFGruposV036={ready,render,getGroup:id=>lookup?.get(id)};
if(docs.length)pdfRender();

/* PDFs locais: usar sempre a mesma cópia no IndexedDB, sem publicar no repositório. */
const LOCAL_KEY='BM_PDFS_GUIAS_LOCAIS_V037';
function listLocal(){try{const x=JSON.parse(localStorage.getItem(LOCAL_KEY)||'[]');return Array.isArray(x)?x:[]}catch{return []}}
function saveLocal(arr){localStorage.setItem(LOCAL_KEY,JSON.stringify(arr))}
function buildLocal(){
 const panel=byId('v037LocalGuides');if(!panel)return;
 const list=panel.querySelector('.v037-local-list');list.replaceChildren();
 for(const doc of listLocal()){
  const art=node('article','v037-local-card');
  art.append(node('strong','',doc.title),node('small','',doc.filename+' · cópia guardada neste navegador'));
  art.append(button('Continuar marcações',()=>window.BancoMestrePDFV037.openAndEdit(doc),'v036-primary'));
  list.append(art);
 }
 if(!list.children.length)list.append(node('p','v036-muted','Nenhum PDF-guia próprio importado neste navegador.'));
}
function addLocalFile(file){
 if(!file||(!/\.pdf$/i.test(file.name)&&file.type!=='application/pdf')){alert('Selecione um documento PDF.');return}
 if(file.size>120000000){alert('Este editor aceita PDFs de até 120 MB.');return}
 const title=file.name.replace(/\.pdf$/i,'').replace(/[_-]+/g,' ');
 const slug=file.name.toLowerCase().replace(/[^a-z0-9.-]+/g,'_').slice(0,80);
 const id='LOCAL-'+slug;
 const docs=listLocal(),existing=docs.find(x=>x.id===id);
 if(existing&&!confirm('Esta lei já possui um guia neste navegador. Reimportar a fonte pode deslocar marcações se a paginação mudou. Confirma que é o MESMO PDF original?'))return;
 const record={id,title,filename:file.name,file_id:'',url:''};
 if(!existing){docs.push(record);saveLocal(docs)}
 buildLocal();window.BancoMestrePDFV037.openLocalFile(record,file);
}
function initLocal(){
 const target=byId('pdfAreaNavV036');if(!target||byId('v037LocalGuides'))return;
 const panel=node('div','v037-local-panel');panel.id='v037LocalGuides';
 const h=node('h3','', 'Leis complementares fora do catálogo');
 const help=node('p','v036-muted','Importe uma vez o PDF original da lei. A posição dos dispositivos e suas marcações serão preservadas neste navegador. Exporte o PDF anotado para backup.');
 const input=node('input');input.type='file';input.accept='.pdf,application/pdf';input.hidden=true;
 input.onchange=e=>{const f=e.target.files?.[0];e.target.value='';if(f)addLocalFile(f)};
 panel.append(h,help,button('Adicionar lei não catalogada',()=>input.click(),'v036-primary'),input,node('div','v037-local-list'));
 target.before(panel);buildLocal();
}
initLocal();
})();

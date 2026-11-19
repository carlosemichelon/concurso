/* V269 — PDFs privados: navegação somente após sessão Drive e varredura atual; arquivos locais seguem independentes. */
/* V268: bibliotecas até 200 PDFs abertas, totais transparentes, cache distinguido. */

/* Banco Mestre V260 — grupos de PDF renderizados sob demanda, 24 cartões por lote.
 * Mantém a lógica de catálogo/Drive V259 e originais intactos. */
/* Banco Mestre V259 — compatibilidade entre catálogo histórico e PDFs confirmados.
 * Grupo de categorias V149, sem alteração de IDs ou links privados. */
/* Banco Mestre V140 — biblioteca PDF com grupos dinâmicos adicionais do Drive.
 * Catálogo e arquivos originais são preservados. */
(function(){
'use strict';
const byId=id=>document.getElementById(id);
function driveValid(){
 const core=window.BancoMestreMediaSyncV182?.token?.();
 const fromPdf=window.BancoMestrePDFSyncV130?.connected;
 return Boolean(core||fromPdf);
}
function accessGate(){
 const loggedIn=driveValid(),verified=document.documentElement.dataset.bm217PdfVerified==='true';
 const active=loggedIn&&verified;
 document.documentElement.dataset.bm269PdfAuth=active?'authorized':loggedIn?'scanning':'locked';
 const notice=byId('bm269PdfLocked');
 if(notice)notice.textContent=active?''
   :loggedIn
   ?'Drive conectado. Aguardando a conferência dos PDFs antes de abrir a biblioteca privada.'
   :'Conecte o Google Drive para consultar a biblioteca de PDFs privados. Arquivos importados do seu computador continuam disponíveis localmente.';
 if(!active){
  const count=byId('pdfCount'),head=byId('pdfStat'),rows=byId('pdfRows');
  if(count)count.textContent='Biblioteca privada — Drive não conferido nesta sessão';
  if(head)head.textContent='—';
  if(rows)rows.replaceChildren();
 }
 return active;
}
const normalize=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const node=(tag,cls,content)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(content!==undefined)e.textContent=String(content);return e};
const button=(label,fn,cls)=>{const b=node('button',cls,label);b.type='button';b.onclick=fn;return b};
let data=null,lookup=null,groups=null,areas=null,pending=null;
async function ready(){
 if(data)return data;
 if(!pending)pending=fetch('assets/pdf_grupos_v149.json',{cache:'no-store'}).then(async r=>{
  if(!r.ok)throw Error('Índice de PDFs indisponível');
  const d=await r.json();if(d.format!=='BancoMestrePDFGroupsV140'||d.assigned?.length!==78)throw Error('Índice incompatível');
  if(new Set(d.assigned.map(x=>x.id)).size!==78)throw Error('IDs de PDFs repetidos');
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
 if(p.id.startsWith('BMPDF-20261112-'))return 'PDF integrado ao Banco Mestre';
 if(p.id.startsWith('DRIVE-PDF-'))return 'PDF sincronizado do Drive';
 if(p.id.startsWith('IJUI-PDF-'))return 'Norma ou lei';
 if(p.id.startsWith('NR-'))return 'Norma Regulamentadora';
 if(p.id.startsWith('CAP-'))return 'Capítulo do manuscrito';
 if(p.id.startsWith('GUIA-'))return 'Guia de estudo';
 if(p.id.startsWith('PETRO10-'))return 'Licenciamento / Petrobras';
 return 'Manuscrito integral';
}

/* V271: somente nomes EXIBIDOS dos PDFs do Drive, sem renomear fonte/ID/grifos. */
function prettyPdfTitle(p){
 if(!p._driveDynamic) return p.title||'Documento PDF';
 const raw=String(p.filename||p.title||'Documento PDF');
 let name=raw.replace(/\.pdf$/i,'')
  .replace(/([a-zà-ÿ])([A-Z])/g,'$1 $2')
  .replace(/_+/g,' ')
  .replace(/\s+/g,' ')
  .replace(/(?:\s+(?:20\d{6}|\d{6,8})\s+\d{4,6})+$/,'')
  .replace(/^(?:pdf\s+file|arquivo\s+pdf)\s+/i,'')
  .replace(/\s+arquivo\s+fornecido(?=\s|$)/gi,'')
  .trim();
 const acronyms=new Set(['ABNT','NBR','NR','DNIT','CONAMA','EIA','RIMA','ETA','ETE','CREA','CONFEA','PCMSO','LGPD','SRS','PDF','PRF','TRT','BIM','CAD','BDI','SPT','RQD','GRO']);
 const spelling={resumao:'Resumão',raciocinio:'Raciocínio',mecanica:'Mecânica',fundacoes:'Fundações',instalacoes:'Instalações',legislacao:'Legislação',portugues:'Português',tecnologico:'Tecnológico',edificacoes:'Edificações',protecao:'Proteção',avaliacao:'Avaliação',resolucoes:'Resoluções',construcao:'Construção',paginas:'páginas',pagina:'página',eletricas:'Elétricas',hidraulica:'Hidráulica',informacao:'Informação',questoes:'Questões',orcamento:'Orçamento',publicas:'Públicas',praticas:'Práticas',situacoes:'Situações',previsao:'Previsão',trafego:'Tráfego',informatica:'Informática',seguranca:'Segurança',comentarios:'Comentários',organizacao:'Organização',organica:'Orgânica',fisica:'Física',autocad:'AutoCAD',sintaxe:'Sintaxe',tecnica:'Técnica',tecnicas:'Técnicas',educacao:'Educação',administracao:'Administração',licencas:'Licenças',especificacoes:'Especificações',utilizacao:'Utilização',producao:'Produção'};
 const joiners=new Set(['de','da','do','das','dos','e','em','para','com','por','ao','a','o','na','no']);
 name=name.split(' ').map((token,i)=>{
  if(/^\d+ed$/i.test(token))return token.toLowerCase();
  const word=token.match(/[A-Za-zÀ-ÿ]+/);
  if(!word)return token;
  const key=word[0].normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
  const replacement=acronyms.has(key.toUpperCase())?key.toUpperCase()
   :spelling[key]||(i>0&&joiners.has(key)?key:key.charAt(0).toLocaleUpperCase('pt-BR')+key.slice(1));
  return token.slice(0,word.index)+replacement+token.slice(word.index+word[0].length);
 }).join(' ').replace(/\s+/g,' ').trim();
 if(/^backup\s+/i.test(name))name=name.replace(/^backup\s+/i,'Backup — ');
 else if(/^fonte\s+/i.test(name))name=name.replace(/^fonte\s+/i,'Fonte — ');
 return name.slice(0,190)||'Documento PDF';
}

function pdfCard(p,off){
 const a=node('article','v036-pdf-card');
 const meta=node('div','v036-pdf-meta');
 meta.append(node('span','v036-pdf-id',p.id),node('span','',sourceType(p)));
 if(p.pages?.length===2)meta.append(node('span','', 'Páginas '+p.pages[0]+'–'+p.pages[1]));
 if(off)meta.append(node('span','v036-muted','Oculto'));
 if(p._driveArchive)meta.append(node('span','v036-muted','Histórico — original preservado'));
 const displayTitle=prettyPdfTitle(p);
 const view=(displayTitle===p.title)?p:{...p,title:displayTitle};
 const read=()=>window.BancoMestreDriveV038.openAndEdit(view,p._driveSynced?{forceDrive:true}:{});
 const title=node('h4','v036-pdf-title',displayTitle);
 title.tabIndex=0;title.setAttribute('role','button');
 title.title=p.filename?'Ler '+displayTitle+' (original: '+p.filename+')':'Ler '+p.id;
 title.onclick=read;
 title.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();read()}};
 const actions=node('div','v036-pdf-actions');
 actions.append(button('Ler e editar no site',read,'v036-primary'));
 const link=node('a','v036-pdf-link','Abrir no Drive');
 link.href=p.url;link.target='_blank';link.rel='noopener noreferrer';actions.append(link);
 // V035 confirma qualquer exclusão antes de realizar esta ação.
 actions.append(button(off?'Restaurar':'Excluir',()=>{if(exclude('PDF',p.id,!off))pdfRender()},off?'v036-soft':'v036-danger'));
 if(p._driveDynamic&&p.filename){
  const original=node('small','v271-pdf-origin','Nome original no Drive: '+p.filename);
  original.title='Caminho no Drive: '+(p.drivePath||p.section||'não informado');
  a.append(meta,title,original,actions);
 }else a.append(meta,title,actions);
 return a;
}
function matched(p,filter,search){
 const group=lookup.get(p.id);if(!group)return false;
 const area=areas.get(group.area);
 if(filter.startsWith('area:')&&group.area!==filter.slice(5))return false;
 if(filter.startsWith('group:')&&group.id!==filter.slice(6))return false;
 const text=normalize([prettyPdfTitle(p),p.title,p.id,p.section,p.category,p.drivePath,p.filename,group.label,group.subtitle,area?.label].join(' '));
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
 // Atualizar contagens mesmo quando o Drive retorna zero PDFs confirmados.
 const archived=docs.filter(p=>p._driveArchive).length,excludedCount=docs.filter(p=>off.has(p.id)).length;
 byId('pdfCount').textContent=selected.length+' de '+docs.length+' PDFs listados · '+visibleGroups.size+
   ' grupos · '+archived+' históricos · '+excludedCount+' ocultos localmente';
 const tabs=byId('pdfAreaNavV036');
 if(tabs){for(const b of tabs.querySelectorAll('button')){
  const id=b.textContent==='Todos'?'all':'area:'+(data.areas.find(x=>x.label===b.textContent)?.id||'');
  b.classList.toggle('selected',f===id);
 }}
 if(!selected.length){
  root.append(node('p','v036-empty','Nenhum PDF localizado. Altere o filtro ou o termo pesquisado; se a consulta ao Drive foi concluída, confira a mensagem de sincronização.'));
  return;
 }
 let openedAny=false;
 for(const area of data.areas){
  const areaDocs=selected.filter(p=>lookup.get(p.id).area===area.id);
  if(!areaDocs.length)continue;
  const block=node('div','v036-pdf-area');
  const head=node('div','v036-area-head');
  head.append(node('h3','',area.label),node('span','v036-count',areaDocs.length+' documentos'));
  block.append(head,node('p','v036-area-desc',area.description));
  const groupList=data.groups.filter(g=>g.area===area.id).sort((a,b)=>a.order-b.order);
  for(const group of groupList){
   const items=areaDocs.filter(p=>lookup.get(p.id).id===group.id);
   if(!items.length)continue;
   const detail=node('details','v036-pdf-group');
   detail.open=compact||selected.length<=200||!openedAny;
   openedAny=true;
   const summary=node('summary','v036-pdf-summary');
   const left=node('span','v036-pdf-heading');
   left.append(node('strong','',group.label),node('small','',group.subtitle));
   summary.append(left,node('span','v036-count',items.length+' PDF'+(items.length>1?'s':'')));
   detail.append(summary);
   const grid=node('div','v036-pdf-grid');
   detail.append(grid);
   const more=button('Mostrar mais documentos',()=>appendNext(),'v036-pdf-more');
   more.style.cssText='min-height:40px;padding:7px 12px;margin:8px 0;border:1px solid #b2d1c9;border-radius:7px;background:#eff7f4;color:#1a6059';
   detail.append(more);
   let shown=0;
   function appendNext(){
    const end=Math.min(shown+(selected.length<=200?items.length:24),items.length);
    const fragment=document.createDocumentFragment();
    for(let i=shown;i<end;i++)fragment.append(pdfCard(items[i],off.has(items[i].id)));
    grid.append(fragment);
    shown=end;
    more.hidden=shown>=items.length;
    if(!more.hidden)more.textContent='Mostrar mais ('+shown+' de '+items.length+' exibidos)';
   }
   const ensureVisible=()=>{if(detail.open&&shown===0)appendNext()};
   detail.addEventListener('toggle',ensureVisible);
   if(detail.open)ensureVisible();
   block.append(detail);
  }
  root.append(block);
 }
}
const oldPdfRender=pdfRender;
pdfRender=function(){
 if(!accessGate())return;
 // O catálogo histórico V149 (78 IDs) e a lista VERIFICADA do Drive V217 são
 // estados distintos. A lista verificada pode legitimamente conter um subconjunto.
 // Não bloquear a biblioteca por faltarem IDs históricos não localizados.
 const verified=['true','cached'].includes(document.documentElement.dataset.bm217PdfVerified);
 ready().then(()=>{
  if(!verified&&docs.length>0&&
     data.assigned.filter(a=>!/^DRIVE-PDF-/.test(a.id))
       .some(a=>!docs.some(p=>p.id===a.id)))
   throw Error('Catálogo histórico de PDFs incompleto antes da verificação do Drive');
  updateFilters();render();
 }).catch(e=>{
  console.warn('Grupos PDF V259:',e);
  // Se os grupos estiverem indisponíveis, mostrar os registros presentes,
  // sem certificar o Drive nem apagar referências ou dados.
  oldPdfRender();
 });
};
byId('pdfSearch').placeholder='Pesquisar título, norma, assunto ou código';
byId('pdfSearch').oninput=()=>pdfRender();
byId('pdfFilter').onchange=()=>pdfRender();
byId('pdfHidden').onchange=()=>pdfRender();
window.BancoMestrePDFGruposV036={
 ready,render,getGroup:id=>lookup?.get(id),
 registerExternal(records){
  if(!data||!lookup||!groups)throw Error('Índice de PDFs não iniciado');
  for(const rec of records){
   if(!rec||!/^DRIVE-PDF-[A-Za-z0-9_-]{15,}$/.test(rec.id))throw Error('ID de PDF externo inválido');
   const group=groups.get(rec.group);
   if(!group)throw Error('Grupo desconhecido: '+rec.group);
   if(!lookup.has(rec.id)){lookup.set(rec.id,group);data.assigned.push({id:rec.id,group:rec.group,confidence:'Metadados do Drive autenticado'});}
  }
 }
};
if(docs.length)pdfRender();
function updateGate(){if(typeof pdfRender==='function')pdfRender()}
document.addEventListener('bm-media-drive-authorized',updateGate);
document.addEventListener('bm269-pdf-verification-finished',updateGate);
document.addEventListener('visibilitychange',()=>{if(!document.hidden)updateGate()});
window.addEventListener('focus',updateGate);
window.addEventListener('pageshow',updateGate);
setInterval(()=>{
 if(document.visibilityState==='visible' &&
  document.documentElement.dataset.bm269PdfAuth==='authorized' && !driveValid())updateGate();
},30000);
window.BM269PdfGate=Object.freeze({get access(){return accessGate()},refresh:updateGate});

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

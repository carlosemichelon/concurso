/* V246 — Assuntos > Fórmulas. Fonte privada: Google Doc, leitura OAuth em memória.
 * Não publica conteúdo do documento no GitHub, não grava no navegador/Drive,
 * não altera cartões, SRS, calendário ou guia original. */
(function(){
'use strict';
if(window.BM246Formulas)return;
const DOC_ID='1eOla5S9In1LTB6IJkJPLmP8mQfM2P2urk33jgCYam5M';
const DOC_URL='https://docs.google.com/document/d/'+DOC_ID+'/edit';
const DOC_PREVIEW='https://docs.google.com/document/d/'+DOC_ID+'/preview';
const MIME='application/vnd.google-apps.document';
let sections=[],revision='',loadedAt='',inflight=null,loaded=false;
const $=id=>document.getElementById(id);
const fold=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('pt-BR');
function status(message,kind){
 const el=$('bm246FormulaStatus');if(!el)return;
 el.textContent=message;el.dataset.state=kind||'idle';
}
function category(number,title){
 const n=Number(number);
 if(n===9||n===16)return 'Fontes e evolução';
 if(n===10)return 'Concreto armado';
 if(n===11||n===12)return 'Resistência e propriedades das seções';
 if(n===14)return 'Estruturas de aço e estabilidade';
 if(n===15)return 'Relações físicas e aplicações';
 if(n===1||n===2||n===5||n===6||n===13)return 'Vigas, treliças e análise estrutural';
 if(n===3||n===4||n===7||n===8)return 'Resistência dos materiais';
 return /concreto/i.test(title)?'Concreto armado':'Outros assuntos';
}
function parseDocument(raw){
 const clean=String(raw||'').replace(/^\uFEFF/,'').replace(/\r\n?/g,'\n');
 const lines=clean.split('\n'),items=[];let current=null,introduction=[];
 const head=/^\s*(\d{1,2})\.\s+(.{4,})\s*$/;
 for(const line of lines){
  const match=line.match(head);
  if(match && Number(match[1])>=1 && Number(match[1])<=99){
   if(current)items.push(current);
   current={number:Number(match[1]),title:match[2].trim(),category:category(match[1],match[2]),lines:[]};
  }else if(current)current.lines.push(line);
  else introduction.push(line);
 }
 if(current)items.push(current);
 if(!items.length)return [{number:0,title:'Conteúdo integral do guia',category:'Documento',body:clean}];
 const pre=introduction.join('\n').trim();
 if(pre)items.unshift({number:0,title:'Apresentação do documento',category:'Documento',body:pre});
 return items.map(x=>({number:x.number,title:x.title,category:x.category,body:x.body===undefined?x.lines.join('\n').trim():x.body}));
}
function setFilterOptions(){
 const sel=$('bm246FormulaCategory');if(!sel)return;
 const previous=sel.value;
 sel.replaceChildren(new Option('Todos os tópicos','all'));
 const cats=[...new Set(sections.map(x=>x.category))];
 cats.forEach(x=>sel.add(new Option(x,x)));
 sel.value=cats.includes(previous)?previous:'all';
}
function render(){
 const root=$('bm246FormulaSections'),count=$('bm246FormulaCount');
 if(!root)return;
 root.replaceChildren();
 const search=fold($('bm246FormulaSearch')?.value.trim()||''),filter=$('bm246FormulaCategory')?.value||'all';
 if(!loaded){
  count.textContent='O conteúdo é carregado do documento privado somente após autorização Google.';
  return;
 }
 const results=sections.filter(x=>(filter==='all'||filter===x.category)&&
   (!search||fold(x.title+' '+x.body+' '+x.category).includes(search)));
 count.textContent=results.length+' seção(ões) exibida(s) de '+sections.length+
   ' · Fonte: documento do Google Drive · leitura sem gravação';
 if(!results.length){
  const p=document.createElement('p');p.className='bm246-empty';
  p.textContent='Nenhum resultado. Tente outra expressão ou limpe os filtros.';root.append(p);return;
 }
 for(const item of results){
  const entry=document.createElement('details');entry.className='bm246-formula-entry';
  entry.open=Boolean(search);
  const sum=document.createElement('summary');
  const title=document.createElement('strong');title.textContent=item.number?item.number+'. '+item.title:item.title;
  const group=document.createElement('span');group.className='bm246-formula-group';group.textContent=item.category;
  sum.append(title,group);entry.append(sum);
  const pre=document.createElement('pre');pre.className='bm246-formula-raw';
  pre.textContent=item.body||'(Seção sem conteúdo no arquivo original)';
  entry.append(pre);root.append(entry);
 }
}
function token(){
 const media=window.BancoMestreMediaSyncV182;
 return typeof media?.token==='function'?media.token():'';
}
async function load(force){
 if(inflight)return inflight;
 if(loaded&&!force){render();return;}
 const auth=token();
 if(!auth){
  status('Conecte sua conta Google pelo botão do portal para consultar as fórmulas privadas. O material permanece no Drive.','pending');
  render();return;
 }
 status('Lendo a edição atual do guia no Google Drive…','loading');
 inflight=(async()=>{
  const meta=await fetch('https://www.googleapis.com/drive/v3/files/'+encodeURIComponent(DOC_ID)+
   '?fields=id,name,mimeType,modifiedTime,version,trashed',{
   headers:{Authorization:'Bearer '+auth},cache:'no-store'});
  if(meta.status===401)throw Error('Autorização expirada. Conecte novamente o Google Drive.');
  if(meta.status===403||meta.status===404)throw Error('Guia inacessível nesta conta Google.');
  if(!meta.ok)throw Error('Não foi possível verificar o documento (HTTP '+meta.status+').');
  const m=await meta.json();
  if(m.id!==DOC_ID||m.mimeType!==MIME||m.trashed===true)throw Error('A origem mudou ou não é o documento esperado; leitura interrompida.');
  const url='https://www.googleapis.com/drive/v3/files/'+encodeURIComponent(DOC_ID)+
   '/export?mimeType='+encodeURIComponent('text/plain');
  const response=await fetch(url,{headers:{Authorization:'Bearer '+auth},cache:'no-store'});
  if(!response.ok)throw Error('Não foi possível ler o conteúdo (HTTP '+response.status+').');
  const payload=await response.text();
  if(!payload.trim()||payload.length>400000)throw Error('Conteúdo vazio ou acima do limite de segurança; original preservado.');
  const parsed=parseDocument(payload);
  sections=parsed;loaded=true;revision=String(m.modifiedTime||'');loadedAt=new Date().toLocaleString('pt-BR');
  setFilterOptions();render();
  const modified=revision?new Date(revision).toLocaleString('pt-BR'):'não informada';
  status('Guia consultado no Drive em '+loadedAt+' · modificação da origem: '+modified+
    '. Recarregue para conferir edições feitas durante o estudo.','ok');
 })().catch(e=>{
  status('Leitura não confirmada: '+e.message+' Use “Abrir no Drive” ou tente conectar novamente.','error');
  if(!loaded)render();
 }).finally(()=>{inflight=null});
 return inflight;
}
function navActive(){
 const nav=document.querySelector('header nav[aria-label="Seções"]')||document.querySelector('header nav');
 if(!nav)return;
 nav.querySelectorAll('button[data-page]').forEach(b=>b.classList.toggle('active',b.dataset.page==='assuntos'));
}
function open(){
 if(typeof window.section==='function')window.section('formulas');
 else{
  document.querySelectorAll('main>section').forEach(s=>s.classList.toggle('active',s.id==='formulas'));
  history.replaceState(null,'','#formulas');
 }
 navActive();
 void load(false);
}
function install(){
 if($('formulas'))return;
 const panel=document.querySelector('#assuntos>.panel'),assuntos=$('assuntos');
 if(!panel||!assuntos||!assuntos.parentElement)return;
 const shortcut=document.createElement('div');shortcut.className='bm246-formula-shortcut';
 const text=document.createElement('div');
 const eyebrow=document.createElement('small');eyebrow.textContent='Assuntos › Fórmulas';
 const title=document.createElement('strong');title.textContent='Guia de Fórmulas';
 const detail=document.createElement('span');detail.textContent='Consulta da versão atual em elaboração no Google Drive';
 text.append(eyebrow,title,detail);
 const button=document.createElement('button');button.id='bm246OpenFormulas';button.type='button';
 button.textContent='Abrir fórmulas';button.addEventListener('click',open);
 shortcut.append(text,button);panel.prepend(shortcut);
 const section=document.createElement('section');section.id='formulas';section.className='bm246-formulas-page';
 section.innerHTML=[
 '<div class="panel bm246-formulas-panel">',
 '<div class="bm246-formula-breadcrumb"><button type="button" id="bm246Back">← Assuntos</button><span>Assuntos › Fórmulas</span></div>',
 '<h2>Guia de Fórmulas</h2>',
 '<p class="intro">Leitura do documento original do Drive, com organização por seção e pesquisa. As alterações do guia aparecem após uma nova consulta; o portal não modifica o material.</p>',
 '<div class="bm246-formula-toolbar">',
 '<button type="button" id="bm246Connect">Conectar Google Drive</button>',
 '<button type="button" id="bm246Reload">Atualizar do Drive</button>',
 '<button type="button" id="bm246ShowPreview">Ver original nesta página</button>',
 '<a id="bm246Source" class="action" target="_blank" rel="noopener noreferrer">Abrir no Drive</a>',
 '</div>',
 '<p id="bm246FormulaStatus" class="bm246-formula-status" role="status" aria-live="polite">Aguardando consulta autorizada ao Drive.</p>',
 '<div class="bm246-formula-filters"><input id="bm246FormulaSearch" type="search" placeholder="Buscar fórmula, conceito, símbolo ou cartão" aria-label="Pesquisar no guia de fórmulas">',
 '<select id="bm246FormulaCategory" aria-label="Filtrar seção de fórmulas"><option value="all">Todos os tópicos</option></select></div>',
 '<p id="bm246FormulaCount" class="small muted"></p>',
 '<div id="bm246FormulaSections"></div>',
 '<div id="bm246FormulaPreview" hidden><p class="small muted">Prévia do Google Docs. Se o navegador bloquear a visualização autenticada, use Abrir no Drive.</p><iframe id="bm246FormulaFrame" title="Guia de Fórmulas original no Google Drive" referrerpolicy="no-referrer" loading="lazy"></iframe></div>',
 '<p class="notice">Fórmulas, hipóteses, unidades e referências normativas refletem o texto da fonte. Revisão técnica e validação de edições normativas serão realizadas separadamente; não há integração automática com cartões ou SRS.</p>',
 '</div>'
 ].join('');
 assuntos.after(section);
 $('bm246Source').href=DOC_URL;
 $('bm246Back').addEventListener('click',()=>{
  if(typeof window.section==='function')window.section('assuntos');
  else location.hash='#assuntos';
 });
 $('bm246Connect').addEventListener('click',()=>{
  const b=$('bm239-drive-action');
  if(b&&!b.disabled)b.click();
  else status('A conexão Google ainda não está disponível. Use Abrir no Drive.','pending');
 });
 $('bm246Reload').addEventListener('click',()=>{void load(true)});
 $('bm246ShowPreview').addEventListener('click',()=>{
  const holder=$('bm246FormulaPreview'),frame=$('bm246FormulaFrame');
  holder.hidden=!holder.hidden;
  if(!holder.hidden&&!frame.getAttribute('src'))frame.src=DOC_PREVIEW;
  $('bm246ShowPreview').textContent=holder.hidden?'Ver original nesta página':'Ocultar prévia';
 });
 $('bm246FormulaSearch').addEventListener('input',render);
 $('bm246FormulaCategory').addEventListener('change',render);
 document.addEventListener('bm-media-drive-authorized',()=>{
  if(location.hash==='#formulas')void load(true);
 });
 window.addEventListener('hashchange',()=>{
  if(location.hash==='#formulas')open();
 });
 if(location.hash==='#formulas'){
  setTimeout(()=>{if(location.hash==='#formulas')open()},0);
 }
}
window.BM246Formulas=Object.freeze({
 open,refresh:()=>load(true),
 get status(){return {loaded,sectionCount:sections.length,sourceModified:revision,loadedAt}}
});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});
else install();
})();

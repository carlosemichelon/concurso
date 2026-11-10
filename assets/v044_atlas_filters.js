/* V044 — Atlas: índice auditado 254 IMG-001...IMG-254 e filtros multifatoriais.
   Os 16 P10 NÃO constam do meta_v021.json; nenhum registro é inventado.
   Reutiliza IDs, miniaturas, editor, estado de ocultação e arquivos originais. */
(function(){
 'use strict';
 const $=id=>document.getElementById(id);
 const root=$('imagens'),search=$('imageSearch'),category=$('imageFilter'),count=$('imageCount'),more=$('moreImages');
 if(!root||!search||!category||!count||!more)return;
 const controls=search.closest('.controls');
 const filters=document.createElement('div');filters.className='bm-v044-atlas-controls';
 const select=(id,opts,aria)=>{
  const el=document.createElement('select');el.id=id;el.setAttribute('aria-label',aria);
  for(const [name,value] of opts)el.add(new Option(name,value));
  return el;
 };
 const area=select('imageAreaV044',[['Todas as áreas','all']],'Filtrar imagens por área');
 const source=select('imageSourceV044',[
  ['Todas as fontes','all'],['Com imagem disponível','visual'],['Sem imagem vinculada','missing'],['Original verificado','verified']
 ],'Filtrar imagens por disponibilidade do arquivo');
 const sort=select('imageSortV044',[
  ['ID crescente (IMG-001…)','id-asc'],['ID decrescente','id-desc'],['Título A–Z','title'],['Assunto A–Z','category']
 ],'Ordenar imagens');
 const reset=document.createElement('button');reset.type='button';reset.textContent='Limpar filtros';reset.title='Mostrar todas as imagens por ID';
 filters.append(area,source,sort,reset);
 controls.after(filters);
 const summary=document.createElement('p');summary.id='imageIndexV044';summary.className='bm-v044-atlas-summary';
 filters.after(summary);
 let indexed=false;
 const norm=v=>String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
 const num=x=>Number(String(x.no||'').match(/(\d+)$/)?.[1]||0);
 const discipline=x=>{
  const name=String(x.category||'');
  if(/^engenharia civil/i.test(name))return 'Engenharia Civil';
  if(/^portugu[eê]s/i.test(name))return 'Português';
  if(/^matem[aá]tica/i.test(name))return 'Matemática';
  if(/^legisla[cç][aã]o/i.test(name))return 'Legislação';
  return name.split(/[\/—]/)[0].trim()||'Outras';
 };
 const hasVisual=x=>Number.isInteger(x.shard)&&!!meta?.image_files?.[x.shard]||!!origMap[x.no]?.preview_url;
 const isVerified=x=>origMap[x.no]?.verified===true;
 function setup(){
  if(indexed||!Array.isArray(imgs)||!imgs.length)return;
  indexed=true;
  const ids=imgs.map(num).sort((a,b)=>a-b);
  const unique=new Set(imgs.map(x=>x.no));
  const continuous=ids.length===254&&unique.size===254&&ids.every((n,i)=>n===i+1);
  const areaNames=[...new Set(imgs.map(discipline))].sort((a,b)=>a.localeCompare(b,'pt-BR'));
  areaNames.forEach(x=>area.add(new Option(x,x)));
  buildCategories();
  const heading=root.querySelector('.notice');
  if(heading)heading.textContent=
   'Atlas principal: '+imgs.length+' imagens identificadas'+(continuous?' (IMG-001 a IMG-254, sem lacunas)':' (há divergências no índice; conferir auditoria)')+
   '. Os 16 registros P10 são um acervo complementar separado, ainda não presente neste índice. O original e as marcações de cada imagem permanecem vinculados ao ID.';
  const stat=document.querySelector('main > .stats .stat:nth-child(3) b');
  if(stat)stat.textContent=String(imgs.length);
 }
 function buildCategories(){
  const val=category.value,selectedArea=area.value;
  const cats=[...new Set(imgs.filter(x=>selectedArea==='all'||discipline(x)===selectedArea).map(x=>x.category))]
   .sort((a,b)=>a.localeCompare(b,'pt-BR'));
  category.replaceChildren(new Option('Todos os assuntos','all'));
  for(const item of cats){
   const x=imgs.find(a=>a.category===item);
   const tail=item.split('/').pop().trim();
   const areaPart=discipline(x);
   const label=(selectedArea==='all'?areaPart+' · ':'')+tail+' ('+imgs.filter(i=>i.category===item).length+')';
   category.add(new Option(label,item));
  }
  category.value=cats.includes(val)?val:'all';
 }
 function queryMatches(x,raw){
  if(!raw)return true;
  const query=norm(raw).trim();
  const exact=query.match(/^(?:img[-\s]?)?0*(\d{1,3})$/);
  if(exact){
   const n=Number(exact[1]);
   if(num(x)===n)return true;
  }
  return norm([x.no,x.title,x.category,x.group,x.source,x.status].filter(Boolean).join(' ')).includes(query);
 }
 async function enhancedRender(){
  if(!Array.isArray(imgs)||!imgs.length)return;
  setup();
  const records=await api.all();
  const hidden=new Map(records.map(x=>[x.id,x.status]));
  const show=$('imageHidden').checked,raw=search.value;
  const areaVal=area.value,categoryVal=category.value,sourceVal=source.value,order=sort.value;
  const selected=imgs.filter(x=>
   (show||hidden.get(x.no)!=='hidden')&&
   (areaVal==='all'||discipline(x)===areaVal)&&
   (categoryVal==='all'||x.category===categoryVal)&&
   (sourceVal==='all'||(sourceVal==='visual'&&hasVisual(x))||(sourceVal==='missing'&&!hasVisual(x))||(sourceVal==='verified'&&isVerified(x)))&&
   queryMatches(x,raw)
  );
  const byId=(a,b)=>num(a)-num(b);
  selected.sort(order==='id-desc'?(a,b)=>byId(b,a):order==='title'?(a,b)=>a.title.localeCompare(b.title,'pt-BR')||byId(a,b):order==='category'?(a,b)=>a.category.localeCompare(b.category,'pt-BR')||byId(a,b):byId);
  const visible=selected.slice(0,imgLimit);
  count.textContent=selected.length+' de '+imgs.length+' imagens no índice principal';
  summary.textContent='Exibindo '+visible.length+' de '+selected.length+' resultado(s). Índice principal: '+imgs.length+' IDs únicos. P10: 16 registros separados. Filtros não alteram nem excluem arquivos.';
  const out=$('imageRows');out.replaceChildren();
  if(!selected.length){out.append(el('p','Nenhuma imagem corresponde aos filtros.','muted'))}
  for(const x of visible){
   const off=hidden.get(x.no)==='hidden';
   const c=card(x.title,x.no,x.category+(off?' · oculta':''));
   const preview=el('img',null,'thumb');preview.loading='lazy';
   preview.alt='Abrir '+x.no+' em tela cheia';preview.title='Clique para ampliar, grifar e consultar a fonte';
   preview.tabIndex=0;preview.setAttribute('role','button');preview.style.cursor='zoom-in';
   preview.onclick=()=>imgOpen(x);
   preview.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();imgOpen(x)}};
   c.c.insertBefore(preview,c.c.querySelector('h3'));
   const sourceData=origMap[x.no]?.verified===true?origMap[x.no]:null;
   const fallback=()=>thumb(x).then(src=>{
    if(!preview.isConnected)return;
    if(src)preview.src=src;else preview.replaceWith(el('p','Prévia não publicada.','muted'));
   });
   if(sourceData){
    preview.onerror=fallback;
    preview.src=sourceData.preview_url;
    preview.title='Fonte associada ao ID e verificada';
   }else fallback();
   if(hasVisual(x))c.buttons.append(action('Abrir em tela cheia',()=>imgOpen(x),'primary'));
   c.buttons.append(action(off?'Restaurar':'Excluir',async()=>{
    try{await api.setStatus(x.no,off?'visible':'hidden');await imgRender()}
    catch(e){alert(e.message)}
   },off?'':'danger'));
   out.append(c.c);
  }
  more.disabled=visible.length>=selected.length;
 }
 // A V041 chama imgRender() após montar as categorias. Substituímos apenas
 // a apresentação e a seleção: todos os registros mantêm seus IDs e ações.
 imgRender=enhancedRender;
 area.onchange=()=>{imgLimit=24;buildCategories();imgRender()};
 source.onchange=()=>{imgLimit=24;imgRender()};
 sort.onchange=()=>{imgLimit=24;imgRender()};
 reset.onclick=()=>{
  search.value='';area.value='all';buildCategories();category.value='all';source.value='all';sort.value='id-asc';$('imageHidden').checked=false;
  imgLimit=24;imgRender();
 };
 window.BancoMestreAtlasV044={
  get indexed(){return indexed},
  get total(){return Array.isArray(imgs)?imgs.length:0},
  get filtered(){return count.textContent},
  get sourceCount(){return Array.isArray(imgs)?imgs.filter(hasVisual).length:0}
 };
})();
/* V050 — Atlas: 254 IMG-001...254 e 16 IMG-P10-01...16 com filtros multifatoriais.
   Os 16 P10 são adicionados por v034_boot.js ao meta em execução; IDs preservados.
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
 const visibility=select('imageVisibilityV045',[
  ['Imagens ativas','visible'],['Imagens excluídas','hidden'],['Todas (inclusive excluídas)','all']
 ],'Escolher imagens ativas, excluídas ou todas');
 const sort=select('imageSortV044',[
  ['ID crescente (IMG-001…)','id-asc'],['ID decrescente','id-desc'],['Título A–Z','title'],['Assunto A–Z','category']
 ],'Ordenar imagens');
 const reset=document.createElement('button');reset.type='button';reset.textContent='Limpar filtros';reset.title='Mostrar todas as imagens por ID';
 const favoriteFilter=select('imageFavoriteV055',[
  ['Todas as imagens','all'],['★ Somente favoritas','favorites']
 ],'Mostrar todas as imagens ou apenas as favoritas');
 filters.append(area,visibility,sort,favoriteFilter,reset);
 // Mantém a opção de versão anterior no DOM, mas substitui pela seleção clara
 // "Ativas / Excluídas / Todas"; os estados IndexedDB/localStorage ficam intactos.
 const legacyToggle=$('imageHidden');
 if(legacyToggle?.closest('label'))legacyToggle.closest('label').style.display='none';
 controls.after(filters);
 const summary=document.createElement('p');summary.id='imageIndexV044';summary.className='bm-v044-atlas-summary';
 filters.after(summary);
 // Preferências locais por ID: preservam títulos e metadados oficiais do Atlas.
 const favKey='BM055_ATLAS_FAVORITES',titlesKey='BM055_ATLAS_CUSTOM_TITLES';
 function readStore(key,fallback){try{const raw=localStorage.getItem(key);return raw?JSON.parse(raw):fallback}catch(e){console.warn('Preferência local indisponível',e);return fallback}}
 let favorites=new Set((Array.isArray(readStore(favKey,[]))?readStore(favKey,[]):[])
   .filter(id=>/^IMG-(?:\d{3}|P10-\d{2})$/.test(id)));
 const savedTitles=readStore(titlesKey,{});
 let customTitles=Object.create(null);
 if(savedTitles&&typeof savedTitles==='object'&&!Array.isArray(savedTitles))
  for(const [id,value] of Object.entries(savedTitles))
   if(/^IMG-(?:\d{3}|P10-\d{2})$/.test(id)&&typeof value==='string'&&value.trim())
    customTitles[id]=value.trim().slice(0,160);
 // V060: campos textuais personalizados somente neste navegador, por ID.
 // Os dados canônicos, a fonte, as advertências e o status editorial não são alterados.
 const fieldsKey='BM060_ATLAS_CARD_FIELDS';
 const rawFields=readStore(fieldsKey,{});
 let customFields=Object.create(null);
 const fieldLimits={area:120,subject:180,description:4000,note:2500};
 if(rawFields&&typeof rawFields==='object'&&!Array.isArray(rawFields)){
  for(const [id,data] of Object.entries(rawFields)){
   if(!/^IMG-(?:\d{3}|P10-\d{2})$/.test(id)||!data||typeof data!=='object'||Array.isArray(data))continue;
   const normalized={};
   for(const [field,max] of Object.entries(fieldLimits))
    if(typeof data[field]==='string')normalized[field]=data[field].slice(0,max);
   if(Object.keys(normalized).length)customFields[id]=normalized;
  }
 }
 const displayTitle=x=>customTitles[x.no]||x.studyTitle||x.title;
 const displayArea=x=>customFields[x.no]?.area??baseDiscipline(x);
 const displaySubject=x=>customFields[x.no]?.subject??(x.studySubject||x.category);
 const displayDescription=x=>customFields[x.no]?.description??(x.studyDescription||'');
 const displayNote=x=>customFields[x.no]?.note??'';

 function persist(key,value){try{localStorage.setItem(key,JSON.stringify(value));return true}
  catch(e){alert('Não foi possível salvar esta preferência no navegador: '+e.message);return false}}
 let indexed=false,descriptionsReady=false,loadingDescriptions=null;
 async function enrich(){
  if(descriptionsReady)return;
  if(!loadingDescriptions)loadingDescriptions=(async()=>{
   try{
    const res=await fetch('assets/imagens_descritivas_v050.json',{cache:'no-store'});
    if(!res.ok)throw Error('Catálogo descritivo indisponível');
    const data=await res.json();
    if(data.format!=='BancoMestreDescricaoAtlasV050'||data.records?.length!==270)throw Error('Catálogo descritivo incompatível');
    const byId=new Map(data.records.map(x=>[x.id,x]));
    for(const x of imgs){
     const item=byId.get(x.no);if(!item)continue;
     x.studyArea=item.area;x.studySubject=item.subject;
     x.studyTitle=item.title;x.studyDescription=item.description;
     x.studyEvidence=item.evidence;x.studyStatus=item.status;
     x.studyValidation=item.validationNote||'';
     // Informações derivadas para exibição; preservar os metadados originais.
    }
   }catch(e){console.warn('Descrição do Atlas não carregada:',e)}
   descriptionsReady=true;
  })();
  await loadingDescriptions;
 }

 const norm=v=>String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
 const num=x=>{
  const id=String(x.no||'');
  const p10=id.match(/^IMG-P10-(\d{2})$/);
  if(p10)return 254+Number(p10[1]);
  return Number(id.match(/^IMG-(\d{3})$/)?.[1]||0);
 };
 const baseDiscipline=x=>{
  if(x.studyArea)return x.studyArea;
  const name=String(x.category||'');
  if(/^engenharia civil/i.test(name))return 'Engenharia Civil';
  if(/^portugu[eê]s/i.test(name))return 'Português';
  if(/^matem[aá]tica/i.test(name))return 'Matemática';
  if(/^legisla[cç][aã]o/i.test(name))return 'Legislação';
  return name.split(/[\/—]/)[0].trim()||'Outras';
 };
 const discipline=displayArea;
 const hasVisual=x=>!!(Number.isInteger(x.shard)&&meta?.image_files?.[x.shard]||origMap[x.no]?.preview_url||x.external&&x.preview_url);
 const isVerified=x=>origMap[x.no]?.verified===true;
 function setup(){
  if(indexed||!Array.isArray(imgs)||!imgs.length)return;
  indexed=true;
  const ids=imgs.map(num).sort((a,b)=>a-b);
  const unique=new Set(imgs.map(x=>x.no));
  const legacy=imgs.filter(x=>/^IMG-\d{3}$/.test(x.no));
  const petro=imgs.filter(x=>/^IMG-P10-\d{2}$/.test(x.no));
  const continuous=ids.length===270&&unique.size===270&&legacy.length===254&&petro.length===16&&ids.every((n,i)=>n===i+1);
  const areaNames=[...new Set(imgs.map(discipline))].sort((a,b)=>a.localeCompare(b,'pt-BR'));
  areaNames.forEach(x=>area.add(new Option(x,x)));
  const heading=root.querySelector('.notice');
  if(heading)heading.textContent=
   'Atlas de '+imgs.length+' imagens, organizado por área e assunto. Abra a prancha para estudar os esquemas e fórmulas; títulos e descrições editoriais não substituem a conferência da imagem original.'+
   (continuous?'':' Confira os IDs do catálogo.');
  const stat=(document.querySelector('header .bm-v046-header-stats .stat:nth-child(3) b')||document.querySelector('main > .stats .stat:nth-child(3) b'));
  if(stat)stat.textContent=String(imgs.length);
 }
 function buildCategories(hidden,mode){
  const val=category.value,selectedArea=area.value;
  const matchesStatus=x=>mode==='all'||(hidden.get(x.no)==='hidden')===(mode==='hidden');
  const allowed=imgs.filter(x=>(selectedArea==='all'||discipline(x)===selectedArea)&&matchesStatus(x));
  const cats=[...new Set(allowed.map(displaySubject))].sort((a,b)=>a.localeCompare(b,'pt-BR'));
  category.replaceChildren(new Option('Todos os assuntos','all'));
  for(const item of cats){
   const x=allowed.find(a=>displaySubject(a)===item);
   const tail=item.split('/').pop().trim(),areaPart=discipline(x);
   const n=allowed.filter(a=>displaySubject(a)===item).length;
   category.add(new Option((selectedArea==='all'?areaPart+' · ':'')+tail+' ('+n+')',item));
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
  return norm([x.no,displayTitle(x),displayArea(x),displaySubject(x),displayDescription(x),displayNote(x),x.studyTitle,x.studySubject,x.studyDescription,x.title,x.category,x.group,x.status].filter(Boolean).join(' ')).includes(query);
 }
 async function enhancedRender(){
  if(!Array.isArray(imgs)||!imgs.length)return;
  await enrich();setup();
  // Atualizar a lista de áreas quando a classificação textual for personalizada.
  const selectedArea=area.value;
  const areasNow=[...new Set(imgs.map(displayArea))].sort((a,b)=>a.localeCompare(b,'pt-BR'));
  area.replaceChildren(new Option('Todas as áreas','all'));
  for(const name of areasNow)area.add(new Option(name,name));
  area.value=areasNow.includes(selectedArea)?selectedArea:'all';
  const records=await api.all();
  const hidden=new Map(records.map(x=>[x.id,x.status]));
  const activeCount=imgs.filter(x=>hidden.get(x.no)!=='hidden').length;
  const hiddenCount=imgs.length-activeCount;
  const mode=visibility.value,raw=search.value;
  if(legacyToggle)legacyToggle.checked=mode!=='visible';
  buildCategories(hidden,mode);
  const stat=(document.querySelector('header .bm-v046-header-stats .stat:nth-child(3)')||document.querySelector('main > .stats .stat:nth-child(3)'));
  if(stat){
   const n=stat.querySelector('b'),label=stat.querySelector('span');
   if(n)n.textContent=String(activeCount);
   if(label)label.textContent='Imagens visíveis · '+hiddenCount+' excluída(s) ('+imgs.length+' no catálogo)';
   stat.title=activeCount+' visíveis, '+hiddenCount+' ocultas; '+imgs.length+' IDs preservados, incluindo 16 P10';
  }
  const areaVal=area.value,categoryVal=category.value,order=sort.value;
  const selected=imgs.filter(x=>
   (mode==='all'||(hidden.get(x.no)==='hidden')===(mode==='hidden'))&&
   (areaVal==='all'||discipline(x)===areaVal)&&
   (categoryVal==='all'||displaySubject(x)===categoryVal)&&
   queryMatches(x,raw)&&(favoriteFilter.value!=='favorites'||favorites.has(x.no))
  );
  const byId=(a,b)=>num(a)-num(b);
  selected.sort(order==='id-desc'?(a,b)=>byId(b,a):order==='title'?(a,b)=>displayTitle(a).localeCompare(displayTitle(b),'pt-BR')||byId(a,b):order==='category'?(a,b)=>displaySubject(a).localeCompare(displaySubject(b),'pt-BR')||byId(a,b):byId);
  const visible=selected.slice(0,imgLimit);
  const scopeCount=mode==='visible'?activeCount:mode==='hidden'?hiddenCount:imgs.length;
  count.textContent=selected.length+' de '+scopeCount+' imagens '+(mode==='hidden'?'excluídas':mode==='visible'?'visíveis':'catalogadas');
  summary.textContent='Exibindo '+visible.length+' de '+selected.length+' resultado(s). '+
   activeCount+' ativos · '+hiddenCount+' excluídos · '+favorites.size+' favorita(s) neste navegador. Exclusão reversível: restaure pelo filtro “Imagens excluídas”.';
  const out=$('imageRows');out.replaceChildren();
  if(!selected.length){out.append(el('p','Nenhuma imagem corresponde aos filtros.','muted'))}
  for(const x of visible){
   const off=hidden.get(x.no)==='hidden';
   const c=card(displayTitle(x),x.no,
    displayArea(x)+' › '+displaySubject(x)+(off?' · oculta':''));
   if(x.studyValidation)c.c.title=x.studyValidation;
   const star=document.createElement('button');star.type='button';
   star.className='bm-v055-favorite';star.textContent=favorites.has(x.no)?'★ Favorita':'☆ Favoritar';
   star.setAttribute('aria-pressed',String(favorites.has(x.no)));
   star.title='Marcar ou desmarcar '+x.no+' como favorita';
   star.onclick=e=>{
    e.stopPropagation();
    const was=favorites.has(x.no);
    if(was)favorites.delete(x.no);else favorites.add(x.no);
    if(!persist(favKey,[...favorites])){if(was)favorites.add(x.no);else favorites.delete(x.no);return}
    imgRender();
   };
   c.buttons.prepend(star);
   const titleElement=c.c.querySelector(':scope > h3');
   const subtitleElement=c.c.querySelector(':scope > p');
   const descriptionElement=el('p',displayDescription(x),'bm-v048-image-description');
   if(displayDescription(x))subtitleElement?.after(descriptionElement);
   const personalNoteElement=el('p',displayNote(x),'bm-v060-image-note');
   if(displayNote(x)){
    (descriptionElement.isConnected?descriptionElement:subtitleElement)?.after(personalNoteElement);
   }
   const form=document.createElement('form');
   form.className='bm-v055-title-form bm-v060-card-form';form.hidden=true;
   form.setAttribute('aria-label','Editar textos do cartão de imagem '+x.no);
   form.addEventListener('click',e=>e.stopPropagation());
   const makeField=(field,label,multiline,max,initial,required)=>{
    const wrapper=document.createElement('label');wrapper.className='bm-v060-field';
    const heading=document.createElement('span');heading.textContent=label;
    const control=document.createElement(multiline?'textarea':'input');
    if(!multiline)control.type='text';else control.rows=3;
    control.name=field;control.maxLength=max;
    control.value=initial;control.required=!!required;
    control.setAttribute('aria-label',label+' de '+x.no);
    wrapper.append(heading,control);return {wrapper,control};
   };
   const titleField=makeField('title','Título',false,160,displayTitle(x),true);
   const areaField=makeField('area','Área / disciplina',false,120,displayArea(x),true);
   const subjectField=makeField('subject','Assunto / categoria',false,180,displaySubject(x),true);
   const descriptionField=makeField('description','Descrição do cartão',true,4000,displayDescription(x),false);
   const noteField=makeField('note','Observações pessoais e correções',true,2500,displayNote(x),false);
   form.append(titleField.wrapper,areaField.wrapper,subjectField.wrapper,
    descriptionField.wrapper,noteField.wrapper);
   const actions=document.createElement('div');actions.className='bm-v060-form-actions';
   const save=document.createElement('button');save.type='submit';save.textContent='Salvar cartão';
   const cancel=document.createElement('button');cancel.type='button';cancel.textContent='Cancelar';
   cancel.onclick=()=>{form.hidden=true;edit.setAttribute('aria-expanded','false')};
   const restore=document.createElement('button');restore.type='button';
   restore.textContent='Restaurar textos originais';
   const explanation=document.createElement('small');
   explanation.textContent='Textos personalizados ficam só neste navegador. ID, arquivo de origem, alertas técnicos e dados canônicos permanecem intactos.';
   form.append(explanation,actions);actions.append(save,cancel,restore);
   const originalText=()=>({
    title:x.studyTitle||x.title,
    area:baseDiscipline(x),
    subject:x.studySubject||x.category,
    description:x.studyDescription||'',
    note:''
   });
   const persistChanges=(nextTitle,nextFields)=>{
    const previousTitle=customTitles,previousFields=customFields;
    customTitles=nextTitle;customFields=nextFields;
    if(!persist(titlesKey,customTitles)||!persist(fieldsKey,customFields)){
     customTitles=previousTitle;customFields=previousFields;
     persist(titlesKey,previousTitle);persist(fieldsKey,previousFields);
     return false;
    }
    return true;
   };
   restore.onclick=()=>{
    const nextTitles={...customTitles};delete nextTitles[x.no];
    const nextFields={...customFields};delete nextFields[x.no];
    if(persistChanges(nextTitles,nextFields))imgRender();
   };
   form.onsubmit=e=>{
    e.preventDefault();e.stopPropagation();
    const values={
     title:titleField.control.value.trim(),
     area:areaField.control.value.trim(),
     subject:subjectField.control.value.trim(),
     description:descriptionField.control.value.trim(),
     note:noteField.control.value.trim()
    };
    if(!values.title||!values.area||!values.subject){
     const missing=!values.title?titleField.control:!values.area?areaField.control:subjectField.control;
     missing.focus();return;
    }
    const original=originalText(),nextTitles={...customTitles},nextFields={...customFields};
    if(values.title===original.title)delete nextTitles[x.no];
    else nextTitles[x.no]=values.title;
    const stored={};
    for(const field of ['area','subject','description','note'])
     if(values[field]!==original[field])stored[field]=values[field];
    if(Object.keys(stored).length)nextFields[x.no]=stored;
    else delete nextFields[x.no];
    if(persistChanges(nextTitles,nextFields))imgRender();
   };
   const edit=document.createElement('button');edit.type='button';
   edit.className='bm-v055-edit-title bm-v060-edit-card';
   edit.textContent='✎ Editar cartão';
   edit.title='Editar título, área, assunto, descrição e observações de '+x.no;
   edit.setAttribute('aria-expanded','false');
   edit.onclick=e=>{
    e.preventDefault();e.stopPropagation();form.hidden=!form.hidden;
    edit.setAttribute('aria-expanded',String(!form.hidden));
    if(!form.hidden)titleField.control.focus();
   };
   c.buttons.append(edit);
   titleElement?.after(form);
   if(['pendente','reprovada'].includes(x.studyStatus)){
    const flag=el('small',x.studyStatus==='reprovada'?'Revisão técnica necessária':'Identificação específica pendente','bm-v048-image-warning');
    c.c.querySelector(':scope > h3')?.after(flag);
   }
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
   if(x.external){
    const edit=action('Abrir e grifar',()=>imgOpen(x),'primary');edit.classList.add('v032-open');
    c.buttons.append(edit);
    if(x.source_url)c.buttons.append(link('Original no Drive',x.source_url));
   }else if(hasVisual(x))c.buttons.append(action('Abrir em tela cheia',()=>imgOpen(x),'primary'));
   c.buttons.append(action(off?'Restaurar':'Excluir',async()=>{
    try{await api.setStatus(x.no,off?'visible':'hidden')}
    catch(e){alert(e.message)}
   },off?'':'danger'));
   out.append(c.c);
  }
  more.disabled=visible.length>=selected.length;
 }
 // A V041 chama imgRender() após montar as categorias. Substituímos apenas
 // a apresentação e a seleção: todos os registros mantêm seus IDs e ações.
 imgRender=enhancedRender;
 area.onchange=()=>{imgLimit=24;imgRender()};
 visibility.onchange=()=>{imgLimit=24;imgRender()};
 sort.onchange=()=>{imgLimit=24;imgRender()};
 favoriteFilter.onchange=()=>{imgLimit=24;imgRender()};
 reset.onclick=()=>{
  search.value='';area.value='all';category.value='all';visibility.value='visible';sort.value='id-asc';favoriteFilter.value='all';if(legacyToggle)legacyToggle.checked=false;
  imgLimit=24;imgRender();
 };
 // Atualizar índices após exclusões/restaurações, também se outro componente
 // alterar um registro. Não transmite nem publica os IDs excluídos.
 let refreshQueued=false;
 const refresh=()=>{
  if(refreshQueued)return;refreshQueued=true;
  Promise.resolve().then(()=>{refreshQueued=false;if(indexed)imgRender()});
 };
 // A camada P10 grava em localStorage e não emite o evento das imagens
 // antigas. Envolvemos a função existente para atualizar ambos os grupos.
 const originalSetStatus=api.setStatus.bind(api);
 api.setStatus=async function(id,status){
  const result=await originalSetStatus(id,status);
  if(indexed)await enhancedRender();
  return result;
 };
 window.addEventListener('storage',e=>{
  if(e.key==='BM_IMAGENS_V023_CHANGE'||e.key?.startsWith('BM032_VIS_'))refresh();
 });
 // O título personalizado também acompanha a abertura do editor, sem alterar o cadastro.
 const priorImgOpenV055=imgOpen;
 imgOpen=async function(x){return priorImgOpenV055({...x,title:displayTitle(x)})};
 window.BancoMestreAtlasV060={
  get cardTextCount(){return Object.keys(customFields).length},
  get titleCount(){return Object.keys(customTitles).length},
  textFor:x=>({title:displayTitle(x),area:displayArea(x),
   subject:displaySubject(x),description:displayDescription(x),note:displayNote(x)})
 };
 window.BancoMestreAtlasV055={
  get favoriteCount(){return favorites.size},
  get favorites(){return [...favorites]},
  get customTitleCount(){return Object.keys(customTitles).length},
  titleFor:displayTitle
 };
 window.BancoMestreAtlasV045={
  get view(){return visibility.value},
  async getIndexStatus(){
   const records=await api.all();
   const excluded=new Set(records.filter(x=>x.status==='hidden').map(x=>x.id));
   return {total:imgs.length,visible:imgs.length-imgs.filter(x=>excluded.has(x.no)).length,
    hidden:imgs.filter(x=>excluded.has(x.no)).map(x=>x.no)};
  },

  get indexed(){return indexed},
  get total(){return Array.isArray(imgs)?imgs.length:0},
  get filtered(){return count.textContent},
  get sourceCount(){return Array.isArray(imgs)?imgs.filter(hasVisual).length:0}
 };
})();
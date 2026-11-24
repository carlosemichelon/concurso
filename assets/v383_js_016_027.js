/* V315 IIFE scripts 16–27 original execution */

;
/* 16 assets/v044_ui.js */
/* Banco Mestre V044: apresentação. Sem alterar SRS, IDs, PDFs ou registros locais. */
(function(){
 'use strict';
 const $=id=>document.getElementById(id);
 const pdfs=$('pdfs');
 // Mantenha apenas a ação Google Drive no cabeçalho da seção PDFs.
 const drive=$('driveConnectV038');
 const title=pdfs?.querySelector('.panel > h2');
 if(drive&&title){
  const bar=document.createElement('div');bar.className='bm-v044-pdf-heading';
  title.before(bar);bar.append(title,drive);
  drive.setAttribute('aria-label','Conectar ou verificar a autorização do Google Drive');
  drive.title='Autorizar leitura dos documentos do Google Drive';
  const status=$('driveDirectStatusV038');
  if(status){
   bar.after(status);
   status.classList.add('bm-v044-drive-status');
   const refresh=()=>{
    const message=status.textContent||'';
    status.title=message;
    status.classList.toggle('bm-v044-drive-warning',/erro|falha|bloquead|não autorizado|indisponível|expirad|permissão|não foi possível/i.test(message));
   };
   new MutationObserver(refresh).observe(status,{subtree:true,childList:true,characterData:true});
   refresh();
  }
  $('driveDirectV038')?.remove();
 }
 // O usuário prefere cadastrar leis novas pela conversa, não por upload na página.
 // Remove somente a superfície de importação, nunca o IndexedDB ou PDFs locais.
 $('v037LocalGuides')?.remove();
 const outdatedNotice=pdfs?.querySelector('.notice');
 if(outdatedNotice&&/PDFs privados|selecionados uma vez/i.test(outdatedNotice.textContent||'')){
  outdatedNotice.textContent='Abra as leis do Google Drive diretamente no editor. As marcações ficam no navegador; use “Salvar cópia no Drive” quando desejar guardar o PDF anotado. O original permanece intacto.';
 }
 const sectionHeading=document.querySelector('#tema h3.sectionTitle');
 if(sectionHeading&&/Conceitos e explicações cadastradas/i.test(sectionHeading.textContent||'')){
  sectionHeading.textContent='Cartões cadastrados';
 }
 const intro=document.querySelector('#tema p.intro');
 if(intro&&/Leia cada explicação/i.test(intro.textContent||'')){
  intro.textContent='Consulte os cartões deste assunto, com pergunta, explicação, fonte e vínculos disponíveis. Para revisar com SRS, use “Praticar flashcards”.';
 }
 // 270 IDs no Atlas em execução: 254 originais + 16 IMG-P10 (via v034_boot.js).
 const third=document.querySelector('main > .stats .stat:nth-child(3)');
 if(third){
  const b=third.querySelector('b'),note=third.querySelector('span');
  if(b)b.textContent='270';
  if(note)note.textContent='Imagens indexadas · 254 + 16 P10';
 }
 const statLabels=document.querySelectorAll('main > .stats .stat');
 statLabels.forEach((card,i)=>{
  const label=card.querySelector('span');
  if(label)card.title=['Quantidade de PDFs no catálogo','Base canônica e cartões adicionais de Ijuí (cópia de estudo)','270 imagens: IMG-001 a IMG-254 e IMG-P10-01 a IMG-P10-16'][i]||'';
 });
 window.BancoMestreUiV044={get ready(){return !!drive&&!!title},get driveHeader(){return !!document.querySelector('.bm-v044-pdf-heading #driveConnectV038')}};
})();

;
/* 17 assets/v206_atlas_editor.js */
/* V204 — um único botão: editor compacto com abas de dados e tipo/cartões (V197 preservada).
   Os 16 P10 são adicionados por v034_boot.js ao meta em execução; IDs preservados.
   Reutiliza IDs, miniaturas, editor, estado de ocultação e arquivos originais. */
(function(){
 'use strict';
 const $=id=>document.getElementById(id);
 let activeAtlasDialog=null;
 function closeAtlasDialog(){if(!activeAtlasDialog)return;const d=activeAtlasDialog;activeAtlasDialog=null;if(d.open&&typeof d.close==='function')d.close();d.remove();}
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
   .filter(id=>/^IMG-(?:\d{3}|P10-\d{2}|C1[1234]-\d{3})$/.test(id)));
 const savedTitles=readStore(titlesKey,{});
 let customTitles=Object.create(null);
 if(savedTitles&&typeof savedTitles==='object'&&!Array.isArray(savedTitles))
  for(const [id,value] of Object.entries(savedTitles))
   if(/^IMG-(?:\d{3}|P10-\d{2}|C1[1234]-\d{3})$/.test(id)&&typeof value==='string'&&value.trim())
    customTitles[id]=value.trim().slice(0,160);
 // V060: campos textuais personalizados somente neste navegador, por ID.
 // Os dados canônicos, a fonte, as advertências e o status editorial não são alterados.
 const fieldsKey='BM060_ATLAS_CARD_FIELDS';
 const rawFields=readStore(fieldsKey,{});
 let customFields=Object.create(null);
 const fieldLimits={area:120,subject:180,description:4000,note:2500};
 if(rawFields&&typeof rawFields==='object'&&!Array.isArray(rawFields)){
  for(const [id,data] of Object.entries(rawFields)){
   if(!/^IMG-(?:\d{3}|P10-\d{2}|C1[1234]-\d{3})$/.test(id)||!data||typeof data!=='object'||Array.isArray(data))continue;
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
    const res=await fetch('assets/imagens_descritivas_v180.json',{cache:'no-store'});
    if(!res.ok)throw Error('Catálogo descritivo indisponível');
    const data=await res.json();
    if(data.format!=='BancoMestreDescricaoAtlasV156'||data.records?.length!==179)throw Error('Catálogo descritivo incompatível');
    const byId=new Map(data.records.map(x=>[x.id,x]));
    for(const x of imgs){
     const item=byId.get(x.no);if(!item)continue;
     x.studyArea=item.area;x.studyGeneral=item.generalSubject;x.studySubject=item.subject;x.studySub=item.subsubject;
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
  const chat=id.match(/^IMG-C(1[1234])-(\d{3})$/);
  if(chat)return 300+(Number(chat[1])-11)*100+Number(chat[2]);
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
  const continuous=(unique.size===86||unique.size===179)&&legacy.length===70&&petro.length===16;
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
  await window.BM153ImageLibrary?.beforeCards?.(hidden,mode);
  const selected=imgs.filter(x=>
   (window.BM197MediaLinks?.matches?.(x)!==false)&&
   (window.BM153ImageLibrary?.matches?.(x)!==false)&&
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
    displayArea(x)+' › '+(x.studyGeneral?x.studyGeneral+' › ':'')+displaySubject(x)+(x.studySub?' › '+x.studySub:'')+(off?' · oculta':''));
   if(x.studyValidation)c.c.title=x.studyValidation;
   if(x.studyStatus==='reprovada'||x.studyStatus==='revisao_pendente'){
    const warning=document.createElement('p');
    warning.className='bm-v156-audit-warning';
    warning.textContent=x.studyStatus==='reprovada'?
      'ATENÇÃO — material sinalizado com erro técnico; não usar como gabarito.':
      'Classificação visual parcial — verificar o assunto no arquivo original.';
    warning.style.cssText='border-left:3px solid currentColor;padding:7px 10px;font-size:12px;font-weight:650;margin:8px 0;background:#fff5eb;color:#7d3f19';
    c.buttons.before(warning);
   }
   const star=document.createElement('button');star.type='button';
   star.className='bm-v055-favorite';star.textContent=favorites.has(x.no)?'★ Favorita':'☆ Favoritar';
   star.setAttribute('aria-pressed',String(favorites.has(x.no)));
   star.title='Marcar ou desmarcar '+x.no+' como favorita';
   star.onclick=e=>{
    e.stopPropagation();
    const was=favorites.has(x.no);
    if(was)favorites.delete(x.no);else favorites.add(x.no);
    if(!persist(favKey,[...favorites])){if(was)favorites.add(x.no);else favorites.delete(x.no);return}
    closeAtlasDialog();imgRender();
   };
   /* Favoritos ajustados dentro do diálogo de edição, nunca no cartão visível. */
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
   cancel.onclick=()=>{closeAtlasDialog();edit.setAttribute('aria-expanded','false')};
   const restore=document.createElement('button');restore.type='button';
   restore.textContent='Restaurar textos originais';
   const explanation=document.createElement('small');
   explanation.textContent='Textos personalizados ficam só neste navegador. ID, arquivo de origem, alertas técnicos e dados canônicos permanecem intactos.';
   form.append(explanation,actions);actions.append(save,cancel,restore,star);
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
    if(persistChanges(nextTitles,nextFields)){closeAtlasDialog();imgRender();}
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
    if(persistChanges(nextTitles,nextFields)){closeAtlasDialog();imgRender();}
   };
   const edit=document.createElement('button');edit.type='button';
   edit.className='bm-v055-edit-title bm-v060-edit-card';
   edit.textContent='Editar imagem';
   edit.title='Editar título, área, assunto, descrição e observações de '+x.no;
   edit.setAttribute('aria-expanded','false');
   edit.onclick=e=>{
    e.preventDefault();e.stopPropagation();closeAtlasDialog();
    const dialog=document.createElement('dialog');dialog.className='bm202-atlas-dialog bm203-atlas-dialog bm206-editor-dialog';
    dialog.setAttribute('aria-label','Editar imagem '+x.no);
    const heading=document.createElement('div');heading.className='bm202-dialog-heading';
    const h=document.createElement('h2');h.textContent='Editar imagem · '+x.no;
    const dismiss=document.createElement('button');dismiss.type='button';dismiss.textContent='Fechar ✕';dismiss.className='bm202-modal-close';
    dismiss.addEventListener('click',closeAtlasDialog);
    heading.append(h,dismiss);
    dialog.append(heading);
    /* A prévia fica na coluna esquerda; os campos e abas seguem na direita. */
    const layout=document.createElement('div');layout.className='bm206-editor-layout';
    const visual=document.createElement('div');visual.className='bm206-editor-visual';
    const fields=document.createElement('div');fields.className='bm206-editor-fields';
    window.BM197MediaLinks?.mountImagePreview?.(visual,c.c,x.no,dialog);
    const tabs=document.createElement('div');tabs.className='bm203-modal-tabs';tabs.setAttribute('role','tablist');
    const tabData=document.createElement('button');tabData.type='button';tabData.textContent='Dados';tabData.setAttribute('role','tab');
    const tabLinks=document.createElement('button');tabLinks.type='button';tabLinks.textContent='Tipo e cartões';tabLinks.setAttribute('role','tab');
    tabData.id='bm203-data-'+x.no;tabLinks.id='bm203-links-'+x.no;
    tabs.append(tabData,tabLinks);
    const linksPanel=document.createElement('div');linksPanel.className='bm203-links-panel';linksPanel.hidden=true;
    linksPanel.setAttribute('role','tabpanel');linksPanel.setAttribute('aria-labelledby',tabLinks.id);
    form.hidden=false;form.setAttribute('role','tabpanel');form.setAttribute('aria-labelledby',tabData.id);
    let linksMounted=false;
    function selectTab(type){
     const related=type==='links';
     if(related&&!linksMounted){
      const api=window.BM197MediaLinks;
      if(typeof api?.mountEditorForm==='function'){
       api.mountEditorForm(linksPanel,x.no,x,closeAtlasDialog);linksMounted=true;
      }else{
       linksPanel.textContent='Editor de vínculos ainda não carregado. Atualize esta página.';
      }
     }
     form.hidden=related;linksPanel.hidden=!related;
     tabData.setAttribute('aria-selected',String(!related));tabLinks.setAttribute('aria-selected',String(related));
     if(related&&linksMounted)linksPanel.querySelector('select')?.focus();
     else if(!related)titleField.control.focus();
    }
    tabData.addEventListener('click',()=>selectTab('data'));
    tabLinks.addEventListener('click',()=>selectTab('links'));
    tabData.setAttribute('aria-selected','true');tabLinks.setAttribute('aria-selected','false');
    fields.append(tabs,form,linksPanel);layout.append(visual,fields);dialog.append(layout);
    dialog.addEventListener('close',()=>{if(activeAtlasDialog===dialog)activeAtlasDialog=null;dialog.remove();if(edit.isConnected)edit.focus();edit.setAttribute('aria-expanded','false');});
    document.body.append(dialog);activeAtlasDialog=dialog;
    edit.setAttribute('aria-expanded','true');
    if(typeof dialog.showModal==='function')dialog.showModal();else dialog.setAttribute('open','');
    titleField.control.focus();
   };
   c.buttons.append(edit);
   /* Formulário não é anexado à imagem: será aberto em um diálogo sob demanda. */
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
   const sourceData=x.external&&x.preview_url?{preview_url:x.preview_url,source_url:x.source_url,verified:true}:origMap[x.no]?.verified===true?origMap[x.no]:null;
   const fallback=()=>thumb(x).then(src=>{
    if(!preview.isConnected)return;
    if(src)preview.src=src;else if(x.external&&x.source_url){const a=document.createElement('a');a.href=x.source_url;a.target='_blank';a.rel='noopener noreferrer';a.textContent='Prévia indisponível — abrir original no Drive';preview.replaceWith(a);}else preview.replaceWith(el('p','Prévia não publicada.','muted'));
   });
   if(sourceData){
    preview.onerror=fallback;
    preview.src=sourceData.preview_url;
    preview.title='Fonte associada ao ID e verificada';
   }else fallback();
   if(x.external){
    const edit=action(x.driveFileId?'Abrir imagem original':'Abrir e grifar',()=>imgOpen(x),'primary');edit.classList.add('v032-open');
    c.buttons.append(edit);
    if(x.source_url)c.buttons.append(link('Original no Drive',x.source_url));
   }else if(hasVisual(x))c.buttons.append(action('Abrir em tela cheia',()=>imgOpen(x),'primary'));
   const visibilityAction=action(off?'Restaurar imagem':'Ocultar imagem',async()=>{
    try{await api.setStatus(x.no,off?'visible':'hidden');closeAtlasDialog()}
    catch(e){alert(e.message)}
   },off?'':'danger');
   visibilityAction.type='button';
   actions.append(visibilityAction);
   window.BM197MediaLinks?.decorate?.(c.c,x);
   out.append(c.c);
  }
  more.disabled=visible.length>=selected.length;
  window.BM153ImageLibrary?.afterCards?.(selected.length,visible.length,scopeCount);
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
 imgOpen=async function(x){
  if(x.driveFileId&&x.source_url){
   const win=window.open(x.source_url,'_blank','noopener,noreferrer');
   if(!win)location.href=x.source_url;
   return;
  }
  return priorImgOpenV055({...x,title:displayTitle(x)});
 };
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

;
/* 18 assets/v046_layout.js */
/* V046 — alterações na interface; nenhum dado é apagado. */
(function(){
 'use strict';
 const $=id=>document.getElementById(id);
 const head=document.querySelector('header .head'),stats=document.querySelector('main > .stats'),nav=head?.querySelector('nav');
 if(head&&stats){
  head.insertBefore(stats,nav||null);
  stats.classList.add('bm-v046-header-stats');
 }
 document.querySelector('main > .hero')?.remove();

 // PDF: manter elementos originais com IDs/listeners e apenas deslocar a barra
 // existente para a lateral. A prévia mantém largura total sem ferramentas.
 const dialog=$('pdfDialog'),body=dialog?.querySelector('.dbody'),tools=$('pdfLocalTools');
 if(body&&tools&&!$('pdfWorkspaceV046')){
  const workspace=document.createElement('div');
  workspace.id='pdfWorkspaceV046';workspace.className='bm-v046-pdf-workspace';
  const side=document.createElement('aside');side.className='bm-v046-pdf-side';side.setAttribute('aria-label','Barra lateral de edição de PDF');
  const content=document.createElement('div');content.className='bm-v046-pdf-content';
  workspace.append(side,content);
  body.appendChild(workspace);
  side.appendChild(tools);
  for(const id of ['pdfLocalStatus','pdfIntro','pdfFrame','pdfLocalMode']){
   const el=$(id);if(el)content.appendChild(el);
  }
 }

 // Imagens: a versão anterior tinha ferramentas laterais no desktop,
 // mas voltava a barra superior em telas pequenas. A V046 mantém a lateral.
 const img=$('imageDialog');
 if(img){
  img.classList.add('bm-v046-image-side');
  for(const b of img.querySelectorAll('.editor-tools [data-ink-tool]')){
   const title=b.title||b.textContent.trim();
   b.setAttribute('aria-label',title);
   const icon=b.textContent.trim().split(/\s+/)[0];
   b.textContent=icon;
  }
 }

 // Excluir do Atlas não identifica com segurança os arquivos Drive das imagens
 // históricas: nenhuma das 76 correspondências candidatas foi verificada.
 // A ação prepara a lista dos IDs excluídos para revisão/removal no chat.
 const filters=$('imageVisibilityV045')?.parentElement;
 if(filters&&!$('exportExcludedV046')){
  const b=document.createElement('button');
  b.id='exportExcludedV046';b.type='button';
  b.textContent='Copiar excluídas p/ Drive';
  b.title='Copiar os IDs excluídos e seus possíveis arquivos no Google Drive; nenhuma exclusão será executada sem conferência.';
  const note=document.createElement('span');
  note.id='exportExcludedStatusV046';note.setAttribute('role','status');note.setAttribute('aria-live','polite');
  note.className='bm-v046-export-status';
  filters.append(b,note);

  async function buildReport(){
   if(typeof imgs==='undefined'||!imgs.length)await loadImages();
   const states=new Map((await api.all()).map(x=>[x.id,x.status]));
   const matches=imgs.filter(x=>states.get(x.no)==='hidden');
   return {
    format:'BancoMestreExcluirImagensDriveV046',
    origin:'Exclusões do navegador local. Esta lista não apaga arquivos.',
    count:matches.length,
    items:matches.map(x=>{
     const candidate=origMap?.[x.no]||null;
     const verified=!!(x.external&&x.file_id)||candidate?.verified===true;
     const id=x.external?x.file_id||null:candidate?.file_id||null;
     return {
      id:x.no,title:x.title,category:x.category,
      drive_file_id:id,drive_url:id?'https://drive.google.com/file/d/'+encodeURIComponent(id)+'/view':null,
      mapping:!id?'sem arquivo do Drive associado':
       verified?'arquivo explicitamente catalogado':'candidato por nome, identidade não verificada',
      needs_identity_check:!verified
     };
    })
   };
  }
  b.onclick=async()=>{
   b.disabled=true;
   try{
    const report=await buildReport();
    if(!report.items.length){note.textContent='Nenhuma imagem excluída neste navegador.';return;}
    const message=JSON.stringify(report,null,2);
    if(navigator.clipboard?.writeText){
     await navigator.clipboard.writeText(message);
     note.textContent=report.count+' imagens copiadas. Cole a lista no chat para conferirmos e removermos os arquivos correspondentes do Drive.';
    }else{
     const blob=new Blob([message],{type:'application/json'});
     const url=URL.createObjectURL(blob),link=document.createElement('a');
     link.href=url;link.download='Banco_Mestre_Imagens_Excluidas_Para_Drive.json';link.click();
     setTimeout(()=>URL.revokeObjectURL(url),12000);
     note.textContent='Arquivo de exclusões gerado. Envie-o pelo chat para conferência antes de apagar no Drive.';
    }
   }catch(e){note.textContent='Não foi possível preparar a lista: '+e.message}
   finally{b.disabled=false}
  };
  window.BancoMestreDriveExclusionsV046={preview:buildReport};
 }
 window.BancoMestreLayoutV046={
  get ready(){return !!head?.querySelector('.bm-v046-header-stats')&&!!$('pdfWorkspaceV046')&&!!img?.classList.contains('bm-v046-image-side')},
  get heroRemoved(){return !document.querySelector('main > .hero')},
  get pdfSidebar(){return !!document.querySelector('#pdfWorkspaceV046 .bm-v046-pdf-side #pdfLocalTools')},
  get imageSidebar(){return !!document.querySelector('#imageDialog.bm-v046-image-side .editor-tools')}
 };
})();

;
/* 19 assets/v048_card_preview.js */
/* V048 — painel de pré-visualização de flashcards no leitor PDF.
   Prévia somente leitura: não avalia nem altera o SRS, não antecipa gabarito. */
(function(){
 'use strict';
 const $=id=>document.getElementById(id);
 const pdf=$('pdfDialog');
 const toolbar=pdf?.querySelector('.toolbar');
 const content=pdf?.querySelector('.bm-v046-pdf-content')||pdf?.querySelector('.dbody');
 if(!toolbar||!content||!pdf)return;

 const button=document.createElement('button');
 button.id='pdfQuickCardV047';button.type='button';button.className='bm-v043-icon bm-v047-card-icon';
 button.textContent='▣ Cartão';button.title='Visualizar flashcards da página ativa, sem responder ou avaliar';
 button.setAttribute('aria-label','Visualização rápida do flashcard');
 button.setAttribute('aria-controls','pdfQuickPanelV047');button.setAttribute('aria-expanded','false');
 toolbar.append(button);

 const panel=document.createElement('aside');panel.id='pdfQuickPanelV047';panel.className='bm-v047-card-panel';panel.hidden=true;
 panel.setAttribute('aria-label','Pré-visualização de flashcards');
 const heading=document.createElement('div');heading.className='bm-v047-card-header';
 const title=document.createElement('strong');title.textContent='Cartão rápido';
 const close=document.createElement('button');close.type='button';close.textContent='×';close.title='Fechar prévia do cartão';close.setAttribute('aria-label','Fechar prévia do flashcard');
 heading.append(title,close);
 const notice=document.createElement('p');notice.className='bm-v047-card-hint';
 notice.textContent='Somente visualização: consulte os cartões vinculados à página ativa, sem registrar resposta ou SRS.';
 const linked=document.createElement('div');linked.id='pdfQuickLinkedV047';linked.className='bm-v047-linked';
 const searchRow=document.createElement('div');searchRow.className='bm-v047-card-search';
 const input=document.createElement('input');input.id='pdfQuickIdV047';input.type='text';input.placeholder='CARD-0001 / PROP-IJUI-001';input.setAttribute('aria-label','ID do flashcard a visualizar');
 const find=document.createElement('button');find.type='button';find.textContent='Ver';
 searchRow.append(input,find);
 const result=document.createElement('div');result.id='pdfQuickResultV047';result.setAttribute('aria-live','polite');result.className='bm-v047-card-result';
 panel.append(heading,notice,linked,searchRow,result);
 content.append(panel);

 const valid=/^(?:CARD-\d{4,}|PROP-IJUI-\d+)$/;
 let cache=null,promise=null,lastId='';
 function show(){
  panel.hidden=false;button.setAttribute('aria-expanded','true');
  updateLinked();
 }
 function hide(){panel.hidden=true;button.setAttribute('aria-expanded','false')}
 button.onclick=()=>panel.hidden?show():hide();
 close.onclick=hide;
 pdf.addEventListener('close',hide);
 function idsInPage(){
  const marks=window.BancoMestrePDFV042?.currentMarks||[];
  const ids=[];
  for(const mark of marks){
   if(mark?.type!=='card')continue;
   for(const word of String(mark.text||'').toUpperCase().match(/(?:CARD-\d{4,}|PROP-IJUI-\d+)/g)||[]){
    if(valid.test(word)&&!ids.includes(word))ids.push(word);
   }
  }
  return ids;
 }
 function updateLinked(){
  const page=window.BancoMestrePDFV042?.currentPage||0;
  const ids=idsInPage();
  const editing=!!window.BancoMestrePDFV042?.editing;
  lastId='';
  linked.replaceChildren();
  const p=document.createElement('small');
  p.textContent=!editing?'Abra o PDF no editor para identificar a página ativa. A busca por ID continua disponível.':ids.length?ids.length+' cartão(ões) na página '+page+':':'Nenhum vínculo CARD nesta página '+page+'. Busque pelo ID ou vincule um cartão à página.';
  linked.append(p);
  for(const id of ids){
   const b=document.createElement('button');b.type='button';b.textContent=id;b.title='Abrir prévia do '+id;
   b.onclick=()=>view(id);linked.append(b);
  }
  result.replaceChildren();
  if(ids.length)void view(ids[0]);
 }
 async function catalog(){
  if(cache)return cache;
  if(!promise)promise=(async()=>{
   const meta=await fetch('assets/meta_v021.json',{cache:'no-store'}).then(r=>{if(!r.ok)throw Error('Metadados do Banco Mestre indisponíveis');return r.json()});
   const raw=await Promise.all(meta.card_files.map(async name=>{
    const r=await fetch('assets/'+name);if(!r.ok)throw Error('Catálogo de cartões indisponível: '+name);return r.json();
   }));
   const ij=await fetch('assets/ijui_flashcards_operacionais_v027.json',{cache:'no-store'}).then(r=>{if(!r.ok)throw Error('Cartões Ijuí indisponíveis');return r.json()});
   const all=[...raw.flat(),...ij.cards];
   const idx=new Map();
   for(const c of all)if(valid.test(c.id)&&!idx.has(c.id))idx.set(c.id,c);
   cache=idx;return idx;
  })().catch(e=>{promise=null;throw e});
  return promise;
 }
 function line(root,label,value){
  if(value===undefined||value===null||String(value).trim()==='')return;
  const b=document.createElement('div');const s=document.createElement('small');s.textContent=label;
  const p=document.createElement('p');p.textContent=String(value);
  b.append(s,p);root.append(b);
 }
 async function view(id){
  id=String(id||'').trim().toUpperCase();
  if(!valid.test(id)){result.textContent='Informe um ID como CARD-0028 ou PROP-IJUI-001.';return}
  input.value=id;lastId=id;result.textContent='Carregando '+id+'...';
  try{
   const db=await catalog();
   if(!panel.isConnected||!pdf.open||lastId!==id)return;
   const card=db.get(id);
   result.replaceChildren();
   if(!card){result.textContent='Cartão '+id+' não encontrado na base carregada.';return}
   line(result,id+' · '+(card.subject||card.discipline||'Banco Mestre'),card.front);
   const reveal=document.createElement('button');reveal.type='button';reveal.className='bm-v047-reveal';
   reveal.textContent='Mostrar resposta';reveal.setAttribute('aria-expanded','false');
   const answer=document.createElement('div');answer.className='bm-v047-answer';answer.hidden=true;
   line(answer,'Resposta original',card.back||'Resposta não cadastrada');
   line(answer,'Explicação',card.expl);
   line(answer,'Macete',card.mnemonic);
   const full=document.createElement('a');full.className='bm-v047-full';
   const url=new URL('v040.html',location.href);url.searchParams.set('cartao',id);url.hash='cartoes';
   full.href=url.href;full.target='_blank';full.rel='noopener noreferrer';full.textContent='Abrir cartão completo';
   reveal.onclick=()=>{
    answer.hidden=!answer.hidden;
    reveal.setAttribute('aria-expanded',String(!answer.hidden));
    reveal.textContent=answer.hidden?'Mostrar resposta':'Ocultar resposta';
   };
   result.append(reveal,answer,full);
  }catch(e){result.textContent='Falha na consulta do cartão: '+e.message}
 }
 find.onclick=()=>view(input.value);
 input.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();view(input.value)}});
 // Mudança de página durante leitura: atualizar lista quando o painel estiver aberto.
 const pager=$('pdfPager');
 if(pager)new MutationObserver(()=>{if(!panel.hidden)updateLinked()})
  .observe(pager,{childList:true,subtree:true,characterData:true});
 window.BancoMestreCardPreviewV048={
  get ready(){return !!$('pdfQuickCardV047')&&!!$('pdfQuickPanelV047')},
  get open(){return !panel.hidden},
  get visibleId(){return lastId},
  openId(id){show();return view(id)}
 };
})();

;
/* 20 assets/v198_evolutive_format.js */
/* Banco Mestre V198: quadro informativo para os 1490 cartões e tipografia dos 11 módulos.
 * APENAS apresentação; JSON, verso original, ID e SRS permanecem intactos. */
(function(){
'use strict';if(window.BM198Format)return;
const roles=[
 ['Resposta essencial',/resposta.m[ií]nim|resposta exig[ií]vel|n[uú]cleo/i,1,'check'],
 ['Fundamento e fonte',/fundament|fonte|norma seca|edi[cç][ãa]o/i,2,'book'],
 ['Fórmulas e unidades',/f[oó]rmul|equa[cç]|vari[aá]ve|unidade/i,4,'sigma'],
 ['Aplicação prática',/aplica[cç][ãa]o|transfer[eê]ncia|resolu[cç][ãa]o|exemplo/i,6,'layers'],
 ['Condições e exceções',/exce[cç]|condi[cç]|limite|hip[oó]tese/i,8,'shield'],
 ['Pegadinhas e erros',/pegadinha|erro|risco|diverg[eê]ncia/i,9,'alert'],
 ['Macete de memória',/macete|memoriza[cç]/i,10,'light']
];
const icons={
 book:'M4 19.5A2.5 2.5 0 0 1 6.5 17H20 M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z',
 check:'M20 6 9 17l-5-5',sigma:'M18 6H6l7 6-7 6h12',
 layers:'m12 2 9 5-9 5-9-5 9-5 M3 12l9 5 9-5 M3 17l9 5 9-5',
 shield:'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z M9 12l2 2 4-4',
 alert:'M10.3 3.9 2 18a2 2 0 0 0 1.7 3h16.6A2 2 0 0 0 22 18L13.7 3.9a2 2 0 0 0-3.4 0z M12 9v4 M12 17h.01',
 light:'M9 18h6 M10 22h4 M12 2a7 7 0 0 0-4 12.7c.8.6 1 1.3 1 2.3h6c0-1 .2-1.7 1-2.3A7 7 0 0 0 12 2',
 target:'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20 M12 18a6 6 0 1 0 0-12 6 6 0 0 0 0 12 M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4',
 file:'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6 M8 13h8 M8 17h8'
};
const e=(tag,cls,text)=>{const v=document.createElement(tag);if(cls)v.className=cls;if(text!==undefined)v.textContent=String(text);return v};
function icon(name){const svg=document.createElementNS('http://www.w3.org/2000/svg','svg'),p=document.createElementNS('http://www.w3.org/2000/svg','path');svg.setAttribute('viewBox','0 0 24 24');svg.setAttribute('aria-hidden','true');svg.classList.add('bm198-icon');p.setAttribute('d',icons[name]||icons.file);svg.append(p);return svg}
function clean(s){return String(s||'').replace(/\*\*([^*]+)\*\*/g,'$1').replace(/\\\|/g,'|').replace(/\s+/g,' ').trim()}
function pipeCells(line){
 const result=[];let current='',escaped=false;
 for(const ch of String(line)){
  if(escaped){current+=ch==='|'?'|':'\\'+ch;escaped=false;continue}
  if(ch==='\\'){escaped=true;continue}
  if(ch==='|'){result.push(current.trim());current='';continue}
  current+=ch;
 }
 if(escaped)current+='\\';result.push(current.trim());
 if(result[0]==='')result.shift();if(result[result.length-1]==='')result.pop();
 return result;
}
function isSep(line){const c=pipeCells(line);return c.length>=2&&c.every(x=>/^:?-{3,}:?$/.test(x))}
function isTable(lines,i){return i+1<lines.length&&lines[i].trim().startsWith('|')&&isSep(lines[i+1].trim())}
function inline(parent,value){
 const s=String(value||''),re=/\*\*([^*\n]+)\*\*|https?:\/\/[^\s<>()]+/g;
 let last=0,m;
 while((m=re.exec(s))){
  if(m.index>last)parent.append(document.createTextNode(s.slice(last,m.index).replace(/\\\|/g,'|')));
  if(m[1])parent.append(e('strong','',m[1]));
  else {
   const url=m[0].replace(/[.,;]+$/,'');const a=e('a','bm198-url',url);
   a.href=url;a.target='_blank';a.rel='noopener noreferrer';parent.append(a);
   if(url!==m[0])parent.append(document.createTextNode(m[0].slice(url.length)));
  }
  last=m.index+m[0].length;
 }
 if(last<s.length)parent.append(document.createTextNode(s.slice(last).replace(/\\\|/g,'|')));
}
function nativeTable(host,lines,i){
 const headers=pipeCells(lines[i]),t=e('table','bm198-native-table'),thead=e('thead'),tr=e('tr'),body=e('tbody');
 headers.forEach(x=>{const th=e('th');inline(th,x);tr.append(th)});thead.append(tr);
 i+=2;while(i<lines.length&&lines[i].trim().startsWith('|')){
  const values=pipeCells(lines[i]),row=e('tr');
  headers.forEach((_,n)=>{const td=e('td');inline(td,values[n]||'');row.append(td)});body.append(row);i++;
 }
 t.append(thead,body);const wrap=e('div','bm198-table-scroll');wrap.append(t);host.append(wrap);return i;
}
function isLabel(s){
 if(s.length<5||s.length>110||!s.endsWith(':'))return false;
 const x=s.replace(/[^A-Za-zÀ-ÿ]/g,'');return x.length>3&&x===x.toLocaleUpperCase('pt-BR');
}
function drawText(host,raw){
 const lines=String(raw||'').replace(/\r/g,'').split('\n');let i=0,buffer=[];
 function flush(){
  if(!buffer.length)return;
  const value=buffer.join('\n'),para=e('p','bm198-paragraph');
  if(buffer.length===1&&value.length<155&&/[=≤≥≈≠]/.test(value)&&!value.includes('http'))para.classList.add('bm198-equation');
  inline(para,value);host.append(para);buffer=[];
 }
 while(i<lines.length){
  const line=lines[i],t=line.trim();
  if(!t){flush();i++;continue}
  if(isTable(lines,i)){flush();i=nativeTable(host,lines,i);continue}
  if(isLabel(t)){flush();host.append(e('p','bm198-label',t.slice(0,-1)));i++;continue}
  if(/^\s*(?:[-*•]|\d+[.)])\s+\S/.test(line)){
   flush();const numbered=/^\s*\d+[.)]\s+/.test(line),list=e(numbered?'ol':'ul','bm198-list');
   while(i<lines.length&&(numbered?/^\s*\d+[.)]\s+\S/.test(lines[i]):/^\s*[-*•]\s+\S/.test(lines[i]))){
    const li=e('li');inline(li,lines[i].replace(numbered?/^\s*\d+[.)]\s+/:/^\s*[-*•]\s+/,''));list.append(li);i++;
   }host.append(list);continue;
  }
  if(/^#{2,5}\s+\S/.test(t)){flush();host.append(e('h5','bm198-subheading',t.replace(/^#{2,5}\s+/,'')));i++;continue}
  buffer.push(line);i++;
 }
 flush();
}
function sectionName(layer,index){
 return String(layer.titulo||'Módulo').trim().replace(/^\s*\d{1,2}\s*(?:[—–.:\-·])\s*/,'')||'Módulo '+(index+1);
}
function sectionIcon(t){
 const s=String(t||'').toLocaleLowerCase('pt-BR');
 if(/pergunta|recupera|frente/.test(s))return 'target';
 if(/resposta|verso/.test(s))return 'check';
 if(/fundament|fonte|norma/.test(s))return 'book';
 if(/f[oó]rmul|equa[cç]|vari[aá]ve/.test(s))return 'sigma';
 if(/pegadinha|erro/.test(s))return 'alert';
 if(/macete/.test(s))return 'light';
 if(/exce[cç]|condi[cç]|limite/.test(s))return 'shield';
 if(/cobertura|transfer|aplica|distin[cç]/.test(s))return 'layers';
 return 'file';
}
function excerpt(text,role){
 const lines=String(text||'').split(/\r?\n/).map(s=>s.trim()).filter(Boolean);
 const tableLine=lines[0]?.startsWith('|')&&isTable(lines,0)?lines[2]:null;
 let chosen=tableLine?pipeCells(tableLine).filter(Boolean).join(' · '):'';
 if(!chosen){
  const good=lines.filter(x=>!x.startsWith('|')&&!/^#{1,4}\s/.test(x)&&
   !/^(?:VERSO(?: ORIGINAL| HIST[ÓO]RICO)|RESPOSTA M[ÍI]NIMA|F[ÓO]RMULAS?, VARI[ÁA]VEIS|MACETE(?: ORIGINAL| HIST[ÓO]RICO)|FONTE HIST[ÓO]RICA|PARECER(?: FINAL)?|FUNDAMENTO E EDI[ÇC][ÃA]O)[^:]{0,90}:\s*$/i.test(x)&&
   !/^(?:CON-\d[\w-]*|H\d{2}-[\w-]*|CARD-\d{4}|V0?\d{2,3})$/i.test(x));
  // Não usar apenas códigos internos de rastreabilidade como se fossem o fundamento.
  if(role==='Fundamento e fonte')
   chosen=good.find(x=>/ABNT|NBR|NR[-– ]\d|Lei\s+\d|Resolu[cç][ãa]o|[Mm]atem[aá]tica|[Ee]quil[ií]brio|[Mm]ec[aâ]nica|[Ff]undament|[Ff]onte\/editoria/i.test(x))||good[0]||'';
  else chosen=good[0]||'';
  if(!chosen)chosen=lines[0]||'';
 }
 const v=clean(chosen);
 if(v.length<=260)return v;
 const chunk=v.slice(0,250),lastSpace=chunk.lastIndexOf(' ');
 return chunk.slice(0,lastSpace>160?lastSpace:250)+'…';
}
function render(host,record,id){
 const layers=record?.layers;
 if(!Array.isArray(layers)||layers.length!==11||layers.some((x,i)=>x.ord!==i+1||!String(x.titulo||'').trim()||!String(x.texto||'').trim()))throw Error('Cartão '+id+' sem 11 módulos íntegros');
 const frag=document.createDocumentFragment(),overview=e('section','bm198-overview');
 const top=e('div','bm198-overview-top'),ic=e('span','bm198-overview-icon');ic.append(icon('book'));
 const labels=e('div');labels.append(e('h4','','Quadro informativo do cartão'),e('p','','Resumo consultivo dos 11 módulos apresentados acima'));
 top.append(ic,labels);overview.append(top);
 const scroll=e('div','bm198-table-scroll'),table=e('table','bm198-overview-table'),thead=e('thead'),tr=e('tr');
 ['Ponto de revisão','Informação do cartão','Seção'].forEach(x=>tr.append(e('th','',x)));
 thead.append(tr);const tbody=e('tbody'),jump=[];
 for(const [role,re,fallback,symbol] of roles){
  let idx=layers.findIndex(x=>re.test(x.titulo));if(idx<0)idx=fallback;
  const row=e('tr'),head=e('th','bm198-topic'),cell=e('td'),link=e('td');
  head.append(icon(symbol),document.createTextNode(role));cell.textContent=excerpt(layers[idx].texto,role);
  const b=e('button','bm198-jump','Mód. '+String(idx+1).padStart(2,'0'));b.type='button';
  b.setAttribute('aria-label','Ir para '+sectionName(layers[idx],idx));
  link.append(b);row.append(head,cell,link);tbody.append(row);jump.push({idx,b});
 }
 table.append(thead,tbody);scroll.append(table);overview.append(scroll);
 overview.append(e('p','bm198-note','Trechos dos módulos, sem substituir a explicação integral ou a consulta às fontes.'));
 const sections=[],moduleGroup=e('div','bm198-modules');
 for(const [i,layer] of layers.entries()){
  const n=e('section','bm198-module'),bar=e('div','bm198-module-head'),num=e('span','bm198-number',String(i+1).padStart(2,'0'));
  const ico=e('span','bm198-section-icon'),name=sectionName(layer,i);ico.append(icon(sectionIcon(name)));
  bar.append(num,ico,e('h4','bm198-module-title',name));const body=e('div','bm198-module-body');
  drawText(body,layer.texto);n.append(bar,body);moduleGroup.append(n);sections.push(n);
 }
 // Regra permanente: onze módulos primeiro; quadro informativo somente no final.
 frag.append(moduleGroup,overview);host.replaceChildren(frag);
 jump.forEach(({idx,b})=>b.addEventListener('click',()=>sections[idx]?.scrollIntoView?.({behavior:'smooth',block:'start'})));
 return {modules:sections.length,tableRows:roles.length};
}
window.BM198Format=Object.freeze({render,version:'V198',source:'Quadro por excertos literais; textos completos preservados'});
})();

;
/* 21 assets/v305_card_reader.js */
/* Portal V305 — leitor inicia com Outros cartões recolhidos; demais comportamentos do V279 preservados. */
/* Banco Mestre V242 — leitor único V165 com cartão PETRO14-C014. */
/* Banco Mestre V165 — leitura integral com outros cartões no mesmo pop-up dos cartões, sem reescrever a base.
 * A leitura é local; não registra tentativa, domínio, avaliação ou evento SRS.
 * Preserva API V050 para integração com anotações V122 e outras interfaces. */
(function(){
'use strict';
if(window.BancoMestreVisualizarCardV050)return;
const root=document.getElementById('cardRows');
if(!root)return;
const idOf=article=>article?.querySelector(':scope > .tag')?.textContent?.trim()||'';
const pattern=/^(?:CARD-\d{4,}|PROP-IJUI-\d+|IJUI-[A-Za-z0-9_-]+|TRT0[12]-C\d{3}|PETRO\d+-C\d{3})$/;
const create=(tag,cls,text)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=String(text);return n};
const svgPaths={
 book:'<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>',
 eye:'<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>',
 pen:'<path d="m16 5 3 3M4 20l4-.8L20 7a2.1 2.1 0 0 0-3-3L4.8 16z"/>',
 file:'<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M8 13h8M8 17h8"/>',
 x:'<path d="M18 6 6 18M6 6l12 12"/>',
 link:'<path d="M7 17 17 7M7 7h10v10"/>',
 alert:'<path d="M12 3 2 21h20L12 3zM12 9v4M12 17h.01"/>',
 scroll:'<path d="M8 21h12a2 2 0 0 0 2-2V7h-7V3H5a2 2 0 0 0-2 2v12a4 4 0 0 0 4 4Z"/><path d="M7 17h8M7 12h8"/>',
 layers:'<path d="m12 2 9 5-9 5-9-5 9-5ZM3 12l9 5 9-5M3 17l9 5 9-5"/>',
 check:'<path d="m20 6-11 11-5-5"/>',
 clock:'<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>'
};
function icon(name){
 const i=create('span','bm163-ic');i.setAttribute('aria-hidden','true');
 const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');
 svg.setAttribute('width','17');svg.setAttribute('height','17');svg.setAttribute('viewBox','0 0 24 24');
 svg.setAttribute('fill','none');svg.setAttribute('stroke','currentColor');svg.setAttribute('stroke-width','1.8');
 svg.setAttribute('stroke-linecap','round');svg.setAttribute('stroke-linejoin','round');
 svg.innerHTML=svgPaths[name]||svgPaths.file;i.append(svg);return i;
}
function btn(label,ic,cls){
 const b=create('button',cls||'');
 b.type='button';b.append(icon(ic),document.createTextNode(label));return b;
}
function getCard(id){const c=typeof cards!=='undefined'&&Array.isArray(cards)?cards.find(c=>c.id===id):null;return c||(/^TRT0[12]-C\d{3}$/.test(id)?window.BM236TrtCardsGrid?.getRecord?.(id):null)||window.BM242OperationalCards?.getRecord?.(id)||null}
function getGuide(c){return c?.origin_question_id&&typeof guideData!=='undefined'?guideData?.questoes?.[c.origin_question_id]:null}
function getAudit(id){return typeof auditF17!=='undefined'?auditF17?.historico_por_id?.[id]:null}
const overlay=create('div','bm-v050-peek bm163-peek');overlay.id='bmCardPeekV050';overlay.hidden=true;overlay.setAttribute('role','presentation');
const backdrop=create('div','bm-v050-peek-backdrop');
const panel=create('div','bm-v050-peek-panel bm163-panel');
panel.classList.add('bm165-panel','bm165-sidebar-hidden');
panel.setAttribute('role','dialog');panel.setAttribute('aria-modal','true');panel.setAttribute('aria-labelledby','bmCardPeekTitleV050');panel.tabIndex=-1;
const header=create('div','bm-v050-peek-header bm163-header');
const headerLeft=create('div','bm163-header-title');
const kicker=create('small','bm163-kicker','REVISÃO DO CARTÃO');
const title=create('strong');title.id='bmCardPeekTitleV050';title.textContent='Consulta do cartão';
headerLeft.append(kicker,title);
const close=btn('Fechar','x','bm-v050-peek-close bm163-close');
close.setAttribute('aria-label','Fechar visualização do flashcard');close.title='Fechar (Esc)';
const previous=btn('Anterior','layers','bm165-prev'),next=btn('Próximo','layers','bm165-next');
const sidebarToggle=btn('Outros cartões','layers','bm165-toggle-sidebar');
sidebarToggle.setAttribute('aria-expanded','false');sidebarToggle.title='Mostrar ou ocultar lista de cartões relacionados';
const navHeader=create('div','bm165-header-nav');navHeader.append(sidebarToggle,previous,next,close);
header.append(headerLeft,navHeader);
const scroll=create('div','bm163-scroll');scroll.tabIndex=0;scroll.setAttribute('aria-label','Conteúdo do cartão: role para ler todas as seções');
const questionBlock=create('div','bm163-question');
const frontLabel=create('small','bm163-section-overline','PERGUNTA');
const front=create('h2','bm-v050-peek-front');
const meta=create('p','bm-v050-peek-meta');
const provenance=create('p','bm-v050-provenance');
const guidance=create('p','bm-v050-peek-guidance','Tente responder antes de consultar o verso. A consulta não altera seu SRS.');
questionBlock.append(frontLabel,front,meta,provenance,guidance);
const controls=create('div','bm163-preview-controls');
const reveal=btn('Revelar resposta','eye','bm-v050-peek-reveal');reveal.setAttribute('aria-expanded','false');
const lawButton=btn('Mostrar lei seca','book','bm163-legal-button');
lawButton.setAttribute('aria-expanded','false');lawButton.hidden=true;
controls.append(reveal,lawButton);
const lawPanel=create('section','bm163-legal-panel');lawPanel.hidden=true;lawPanel.setAttribute('aria-label','Texto literal da legislação');
const answer=create('div','bm-v050-peek-answer bm163-answer');answer.hidden=true;
const status=create('div','bm163-reader-status');status.setAttribute('role','status');status.textContent='Rolar para ler todo o material, inclusive macetes e histórico.';
const aside=create('aside','bm165-related');aside.setAttribute('aria-label','Outros cartões');
const asideTitle=create('h3','bm165-related-title','Outros cartões');
const asideCount=create('small','bm165-related-count','');
const asideSearch=create('input','bm165-related-search');asideSearch.type='search';
asideSearch.placeholder='Buscar cartão por ID ou assunto';asideSearch.setAttribute('aria-label','Buscar nos cartões');
const allLabel=create('label','bm165-all-label');
const allCheck=create('input');allCheck.type='checkbox';
allLabel.append(allCheck,document.createTextNode('Pesquisar toda a base'));
const asideList=create('nav','bm165-related-list');asideList.setAttribute('aria-label','Escolher outro cartão');
aside.append(asideTitle,asideCount,asideSearch,allLabel,asideList);
const layout=create('div','bm165-layout');layout.append(aside,scroll);
const footer=create('div','bm163-footer bm165-footer');
const note=create('small','bm-v050-peek-note','Consulta sem avaliação · não registra revisão nem altera intervalos SRS.');
const footerClose=btn('Voltar aos cartões','x','bm165-footer-close');
footer.append(note,footerClose);
scroll.append(questionBlock,controls,lawPanel,answer,status);
panel.append(header,layout,footer);overlay.append(backdrop,panel);document.body.append(overlay);
// VS6: a mesma recuperação ativa para qualquer origem; API antiga permanece compatível.
const readerMode='review';
function applyReaderMode(){
 overlay.dataset.readerMode=readerMode;
 kicker.textContent='ESTUDO DO CARTÃO';
 guidance.textContent='Tente lembrar antes de revelar o verso. A resposta escrita e a avaliação são opcionais.';
 note.textContent='Consulta sem avaliação não altera a agenda SRS.';
}
let focusedBefore=null,currentId='',previousOverflow='',asideQuery='',asideAll=false;const trtUrls=[];function freeTrtUrls(){while(trtUrls.length)URL.revokeObjectURL(trtUrls.pop())}
function allCards(){return (typeof cards!=='undefined'&&Array.isArray(cards)?cards:[]).concat(window.BM225LegalTaxonomy?.all?.()||[])}
function norm(value){return String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase()}
function sameArea(a,b){if(a.provisional||b.provisional)return !!(a.provisional&&b.provisional);
 return !!(a.group&&a.group===b.group)||(a.discipline&&a.discipline===b.discipline)}
function related(){
 const c=getCard(currentId),all=allCards(),query=norm(asideQuery.trim());
 if(query)return all.filter(x=>norm([x.id,x.front,x.subject,x.discipline,x.sub].join(' ')).includes(query));
 if(asideAll||!c)return all;
 const nearby=all.filter(x=>sameArea(x,c));
 return nearby.length?nearby:all;
}
function renderRelated(){
 const all=related(),index=all.findIndex(c=>c.id===currentId);
 const start=all.length>60&&index>=0?Math.max(0,Math.min(all.length-60,index-12)):0;
 const visible=all.slice(start,start+60);
 asideCount.textContent=all.length+' cartões'+(all.length>60?' · exibindo '+visible.length:'');
 asideList.replaceChildren();
 for(const c of visible){
  const b=create('button','bm165-related-item');b.type='button';
  b.append(create('span','bm165-related-id',c.id),create('span','bm165-related-front',c.front));
  if(c.id===currentId){b.classList.add('bm165-active');b.setAttribute('aria-current','true')}
  b.addEventListener('click',()=>show(c.id,b));
  asideList.append(b);
 }
 if(!visible.length)asideList.append(create('p','bm165-empty','Nenhum cartão encontrado'));
 previous.disabled=index<=0;next.disabled=index<0||index>=all.length-1;
}
function moveCard(delta){
 if(overlay.dataset.bm382Queue==='true')return;
 const a=related(),i=a.findIndex(c=>c.id===currentId),c=a[i+delta];
 if(c)show(c.id);
}
asideSearch.addEventListener('input',()=>{asideQuery=asideSearch.value;renderRelated()});
allCheck.addEventListener('change',()=>{asideAll=allCheck.checked;renderRelated()});
previous.addEventListener('click',()=>moveCard(-1));next.addEventListener('click',()=>moveCard(1));
footerClose.addEventListener('click',()=>hide());
sidebarToggle.addEventListener('click',()=>{
 const hidden=panel.classList.toggle('bm165-sidebar-hidden');
 sidebarToggle.setAttribute('aria-expanded',String(!hidden));
 sidebarToggle.title=hidden?'Mostrar outros cartões':'Ocultar outros cartões';
});
function visibleElement(el){return el&&!(el.closest('[hidden]'))&&!el.disabled}
function hide(){
 if(overlay.hidden)return;
 freeTrtUrls();overlay.hidden=true;document.body.classList.remove('bm-v050-peek-open');
 document.body.style.overflow=previousOverflow;
 const restore=focusedBefore;focusedBefore=null;currentId='';
 restore?.focus?.({preventScroll:true});
}
function piece(title,text,cls){
 if(text===undefined||text===null||String(text).trim()==='')return null;
 const box=create('section','bm163-piece'+(cls?' '+cls:''));
 box.append(create('h3','bm163-piece-title',title),create('p','bm163-piece-text',text));
 return box;
}
function listPiece(title,items,format){
 if(!Array.isArray(items)||!items.length)return null;
 const box=create('section','bm163-piece');
 box.append(create('h3','bm163-piece-title',title));
 const ul=create('ul','bm163-rich-list');
 for(const item of items){const li=create('li','',format(item));ul.append(li)}
 box.append(ul);return box;
}
function group(title,ic,sections,open=false){
 const children=sections.filter(Boolean);
 if(!children.length)return null;
 const d=create('details','bm163-deep-group');d.open=open;
 const summary=create('summary');summary.append(icon(ic),document.createTextNode(title),create('span','bm163-group-count',String(children.length)));
 d.append(summary);
 const inside=create('div','bm163-group-body');inside.append(...children);d.append(inside);return d;
}
function appendAnswer(c){
 const original=[...root.querySelectorAll('article.card')].find(a=>idOf(a)===c.id)?.querySelector(':scope > details > .answer');
 if(original&&original.querySelector(':scope > .richSection')){
  answer.replaceChildren();
  const chunks={study:[],fix:[],sources:[],history:[],related:[],other:[]};
  let direct=null;
  for(const child of Array.from(original.children)){
   if(child.matches('.richSection')){
    const title=child.querySelector('h4')?.textContent?.trim()||'';
    const copy=child.cloneNode(true);copy.classList.add('bm165-source-piece');
    if(/^(resposta registrada|resposta exata do cartão)/i.test(title)&&!direct){copy.classList.add('bm165-essential');direct=copy;continue}
    const k=/(conhecimento mínimo|resposta-modelo|explicação da base|evoluções complementares)/i.test(title)?'study':
     /(macete|pegadinha|lacuna|pontos a corrigir|já foi compreendido|erros corrigidos)/i.test(title)?'fix':
     /(fundamento|fonte|pdf original|referência|situação editorial|prioridade histórica|subassunto)/i.test(title)?'sources':
     /(histórico|tentativa|revisão|conhecimentos demonstrados|conhecimentos parciais|resposta discursiva arquivada|precisão|observações|classificação histórica)/i.test(title)?'history':
     /(interconex|cobertura|vínculo)/i.test(title)?'related':'other';
    chunks[k].push(copy);
   }else if(child.matches('details.answerFold')){
    const copy=child.cloneNode(true);copy.classList.add('bm165-original-fold');
    const label=child.querySelector('summary')?.textContent||'';
    chunks[/(histórico|correç)/i.test(label)?'history':'sources'].push(copy);
   }else if(child.matches('a[href]'))chunks.sources.push(child.cloneNode(true));
  }
  answer.append(direct||piece('Resposta original preservada',c.back,'bm163-essential'));
  for(const [k,title,ic,open] of [
   ['study','Conhecimento mínimo e resposta-modelo','file',!(/^CARD-\d{4}$/.test(c.id)&&!bm197Reserved.has(c.id))],
   ['fix','Macetes, pegadinhas e lacunas','check',false],
   ['sources','Fundamentos, fontes e rastreabilidade','book',false],
   ['history','Histórico de tentativas e correções','clock',false],
   ['related','Interconexões e cobertura cruzada','layers',false],
   ['other','Outras informações da base','file',false]]){
   const fold=group(title,ic,chunks[k],open);if(fold)answer.append(fold);
  }
  return;
 }

 answer.replaceChildren();
 const g=getGuide(c);
 const direct=piece('Verso original — resposta exata preservada',c.back||'Sem resposta cadastrada','bm163-essential');
 if(direct)answer.append(direct);
 const summary=group('Resposta aprofundada e compreensão','file',[
  piece('Conhecimento mínimo para acertar',g?.resposta_minima),
  piece('Resposta-modelo após correção',g?.resposta_modelo),
  piece('Explicação da base',c.expl),
  piece('Aprofundamento da base geral',typeof generalGuide!=='undefined'?
    generalGuide?.por_id?.[c.id]?.ref:null)
 ],!(/^CARD-\d{4}$/.test(c.id)&&!bm197Reserved.has(c.id)));
 if(summary)answer.append(summary);
 const mn=group('Macetes, pegadinhas e lacunas','check',[
  piece('Macete original',c.mnemonic),
  listPiece('Macetes associados à questão',g?.macetes,m=>m.id+' — '+m.frase+' · '+m.interpretacao+(m.alerta?' · Atenção: '+m.alerta:'')),
  piece('Pegadinhas e exceções',g?.pegadinhas),
  listPiece('Lacunas de fixação',g?.lacunas,l=>l.id+' ('+l.prioridade+'; '+l.estado+') — '+l.fixar),
  piece('Pontos a corrigir da resposta anterior',g?.lacunas_do_estudo),
  piece('O que já foi compreendido',g?.acertos_do_estudo)
 ]);
 if(mn)answer.append(mn);
 const refs=group('Fundamentação e referências','book',[
  piece('Referência original cadastrada',c.reference),
  piece('Fundamento detalhado registrado na correção',g?.dispositivo),
  piece('Origem da questão',c.origin_question_id),
  piece('PDF original e páginas',g?.fonte),
  piece('Situação editorial',c.provisional?'Cartão integrado ao catálogo; origem Ijuí, registro editorial histórico preservado.':/^TRT0[12]-C\d{3}$/.test(c.id)?'Cartão TRT operacional preservado separadamente, sem promoção para a base canônica.':'Cartão original da base canônica.')
 ]);
 if(refs)answer.append(refs);
 const rel=group('Relações e histórico de estudo','layers',[
  listPiece('Interconexões com outros cartões',g?.vinculos_cartoes,v=>v.cartao+' — '+v.tema+' ('+v.tratamento+')'),
  piece('Cobertura metodológica',g?.aviso_srs),
  piece('Tentativa anterior da questão — não é revisão do cartão',
   g?.tentativa_registrada?('Data: '+(g.tentativa_data||'não informada')+' · avaliação registrada: '+(g.avaliacao_informada||'não informada')+' · previsão no checkpoint: '+(g.revisao_prevista_no_checkpoint||'não informada')):null),
  piece('Histórico formal do cartão (F17)',getAudit(c.id)?
   ('Tentativa '+getAudit(c.id).tentativa+' · '+getAudit(c.id).avaliacao+' · '+getAudit(c.id).data_local+' · próxima revisão registrada: '+(getAudit(c.id).proxima_revisao_existente_v015||'não informada')):null),
  piece('Observações da correção formal F17',getAudit(c.id)?.observacoes_da_correcao)
 ]);
 if(rel)answer.append(rel);
 const recovered=typeof answersF17!=='undefined'?answersF17?.por_id?.[c.id]:null;
 if(recovered){
  const archive=group('Resposta discursiva e correções F17','clock',[
   piece('Resposta discursiva arquivada',recovered.resposta_original_arquivada),
   piece('Conhecimentos demonstrados',recovered.conhecimentos_demonstrados),
   piece('Conhecimentos parciais',recovered.conhecimentos_parciais),
   piece('Erros corrigidos',recovered.erros_corrigidos),
   piece('Lacunas identificadas',recovered.lacunas_em_relacao_ao_enunciado),
   piece('Complementações da correção',recovered.informacoes_novas_de_complementacao),
   piece('Macete da revisão',recovered.macete),
   piece('Cobertura cruzada informada',recovered.cobertura_cruzada_ids_informados),
   piece('Referência PDF registrada',recovered.referencia_pdf_confirmada_no_csv),
   piece('Classificação histórica (não SRS)',recovered.classificacao_historica_csv),
   piece('Rastreabilidade',recovered.observacao_de_rastreabilidade)
  ]);
  if(archive)answer.append(archive);
 }
 const gg=typeof generalGuide!=='undefined'?generalGuide?.por_id?.[c.id]:null;
 if(gg?.evolucoes?.length){
  const old=group('Evoluções complementares da base','layers',[
    listPiece('Evoluções P08',gg.evolucoes,e=>e.id+' — '+e.pergunta+' | '+e.resposta_complementar+' · '+e.origem)
  ]);if(old)answer.append(old);
 }
 if(c.provisional&&typeof guideData!=='undefined'&&/^https:\/\//.test(String(guideData?.link_fonte_privada||''))){
  const a=create('a','bm165-source-link','Consultar planilha original da resposta discursiva');
  a.href=guideData.link_fonte_privada;a.target='_blank';a.rel='noopener noreferrer';answer.append(a);
 }
 if(!summary&&!mn&&!refs&&!rel)answer.append(create('p','bm163-missing-guide','Não há guia complementar auditado para este ID; o verso original permanece disponível.'));
}

/* V197 — renderizador direto no leitor do gabarito.
 * O título aparece sincronicamente; dados e SRS nunca são modificados. */
const bm197Cache=new Map();
const bm197Reserved=new Set(['CARD-0138','CARD-0194','CARD-0248','CARD-0286','CARD-0350','CARD-0424','CARD-0445','CARD-0502','CARD-0509','CARD-0510','CARD-0693']);
function bm197Shard(id){
 if(!/^CARD-\d{4}$/.test(id))return -1;
 const n=Number(id.slice(5));return n>=1&&n<=1519?Math.floor((n-1)/250):-1;
}
/* V274 — Módulos didáticos publicados por ID a partir do snapshot privado V164.
 * O JSON público contém somente texto técnico, sem histórico pessoal ou SRS.
 * Arquivos V194/V199 permanecem intactos como histórico e fallback. */
const bm274Audited=new Set(["CARD-0118","CARD-0175","CARD-0333","CARD-0468","CARD-0480","CARD-0543","CARD-0547","CARD-0548","CARD-0549","CARD-0551","CARD-0552","CARD-0553","CARD-0579","CARD-0621","CARD-0623","CARD-0624","CARD-0625","CARD-0626","CARD-0629","CARD-0631","CARD-0632","CARD-0642","CARD-1033","CARD-1034","CARD-1386","CARD-1520","CARD-1521","CARD-1522","CARD-1523","CARD-1524","CARD-1525","CARD-1526","CARD-1527","CARD-1528","CARD-1529","CARD-1530","CARD-1531","CARD-1532","CARD-1533"]);
let bm274RecordsPromise=null;
async function bm274Record(id){
 if(!bm274Audited.has(id))return null;
 if(!bm274RecordsPromise){
  bm274RecordsPromise=fetch('assets/layers_public_v274_sync.json?v=274-1',{cache:'no-store'})
   .then(r=>{if(!r.ok)throw Error('V274: módulos ausentes (HTTP '+r.status+')');return r.json()})
   .then(data=>{
    if(data.format!=='BancoMestrePublic11ModulesV274'||data.source_version!=='V164'||!Array.isArray(data.records)||data.records.length!==39)throw Error('V274: módulos incompatíveis');
    const m=new Map();
    for(const row of data.records){
     if(m.has(row.id)||!bm274Audited.has(row.id)||!Array.isArray(row.layers)||row.layers.length!==11||
         row.layers.some((l,i)=>l.ord!==i+1||!String(l.titulo||'').trim()||!String(l.texto||'').trim()))throw Error('V274: integridade dos 11 módulos inválida');
     m.set(row.id,row);
    }
    if(m.size!==39)throw Error('V274: faltam módulos aprovados');
    return m;
   });
  bm274RecordsPromise.catch(()=>{bm274RecordsPromise=null});
 }
 return (await bm274RecordsPromise).get(id)||null;
}
async function bm197Record(id){
 // V279: o leitor e a grade compartilham a fonte/cache dos 11 módulos por ID.
 // V274/V276/V277 priorizados; fallback preserva a base técnica original.
 if(window.BM276LayerData?.has?.(id)){
  const related=await window.BM276LayerData.get(id);
  if(related)return related;
 }
 const revised=await bm274Record(id);
 if(revised)return revised;
 if(window.BM194VersosPublicos?.load){
  const shared=await window.BM194VersosPublicos.load(id);
  if(shared)return await bm199Enrich(id,shared);
 }
 const batch=bm197Shard(id);
 if(batch<0)return null;
 if(!bm197Cache.has(batch)){
  const uri='assets/layers_public_v194_'+String(batch).padStart(3,'0')+'.json?v=197-direct';
  const pending=(async()=>{
   const controller=new AbortController();
   const timer=setTimeout(()=>controller.abort(),30000);
   let response;
   try{response=await fetch(uri,{cache:'no-store',signal:controller.signal})}
   finally{clearTimeout(timer)}
   if(!response.ok)throw Error('HTTP '+response.status+' ao abrir '+uri);
   const parsed=await response.json();
   if(!Array.isArray(parsed))throw Error('Formato inválido do arquivo de aprofundamento');
   return new Map(parsed.map(row=>[row.id,row]));
  })();
  bm197Cache.set(batch,pending);
  pending.catch(()=>{if(bm197Cache.get(batch)===pending)bm197Cache.delete(batch)});
 }
 const original=(await bm197Cache.get(batch)).get(id)||null;
 if(!original)return null;
 // V199: adendos auditados só para IDs cotejados. Histórico original permanece literal.
 return await bm199Enrich(id,original);
}
/* V199 — enriquecimentos documentados, sem alterar o JSON histórico. */
const bm199Audited=new Set(['CARD-0751','CARD-0752','CARD-0753','CARD-0754','CARD-1001']);
let bm199OverlayPromise=null;
async function bm199Enrich(id,original){
 if(!bm199Audited.has(id))return original;
 try{
  if(!bm199OverlayPromise){
   bm199OverlayPromise=fetch('assets/v199_reauditoria_adenda_5_cartoes.json?v=199-01',{cache:'no-store'})
    .then(r=>{if(!r.ok)throw Error('Adendo V199: HTTP '+r.status);return r.json()})
    .then(data=>{
     if(data?.schema!=='BancoMestreReauditoriaAdendaV199'||!Array.isArray(data.records))
      throw Error('Adendo V199 incompatível');
     const m=new Map();
     for(const card of data.records){
      if(!bm199Audited.has(card.id)||m.has(card.id)||!card.addenda||typeof card.addenda!=='object')
       throw Error('ID repetido ou não homologado no adendo');
      for(const [num,val] of Object.entries(card.addenda))
       if(!/^(?:[1-9]|10|11)$/.test(num)||!String(val||'').trim())throw Error('Seção inválida no adendo: '+card.id);
      m.set(card.id,card);
     }
     return m;
    });
   bm199OverlayPromise.catch(()=>{bm199OverlayPromise=null});
  }
  const map=await bm199OverlayPromise,adendo=map.get(id);
  if(!adendo)throw Error('Adendo não contém '+id);
  if(!Array.isArray(original.layers)||original.layers.length!==11)throw Error('11 módulos originais indisponíveis');
  const layers=original.layers.map((x,i)=>{
   const addition=adendo.addenda[String(i+1)];
   return addition?{...x,texto:x.texto+'\n\nREANÁLISE DOCUMENTADA V199 — COMPLEMENTO NÃO SUBSTITUTIVO:\n'+addition}:x;
  });
  return {...original,layers,v199_status:adendo.status};
 }catch(error){
  console.warn('Reauditoria complementar indisponível:',id,error);
  return {...original,v199_warning:'Complemento V199 não foi carregado ('+String(error?.message||error)+'). Os 11 módulos históricos continuam disponíveis.'};
 }
}
window.BM199Reauditoria=Object.freeze({enrich:bm199Enrich,ids:[...bm199Audited],status:'Adendos técnicos com cotejo pontual; originais preservados'});
function bm197RenderText(host,raw){
 const lines=String(raw||'').split(/\r?\n/);
 for(let i=0;i<lines.length;){
  if(!lines[i].trim()){i++;continue}
  if(lines[i].trim().startsWith('|')&&i+1<lines.length&&/^\s*\|?\s*:?-{3,}/.test(lines[i+1])){
   const table=create('table','bm197-table'),thead=create('thead'),tbody=create('tbody');
   const labels=lines[i].trim().replace(/^\||\|$/g,'').split('|').map(x=>x.trim());
   const row=create('tr');labels.forEach(x=>row.append(create('th','',x)));thead.append(row);
   i+=2;
   while(i<lines.length&&lines[i].trim().startsWith('|')){
    const cells=lines[i].trim().replace(/^\||\|$/g,'').split('|'),tr=create('tr');
    labels.forEach((_,k)=>tr.append(create('td','',(cells[k]||'').trim())));tbody.append(tr);i++;
   }
   table.append(thead,tbody);const scroll=create('div','bm197-table-scroll');scroll.append(table);host.append(scroll);continue;
  }
  let chunk=[];
  while(i<lines.length&&lines[i].trim()&&!(lines[i].trim().startsWith('|')&&i+1<lines.length&&/^\s*\|?\s*:?-{3,}/.test(lines[i+1])))chunk.push(lines[i++]);
  if(chunk.length)host.append(create('p','bm197-paragraph',chunk.join('\n')));
 }
}
function bm197ShowEvolution(c){
 if(!c||!/^CARD-\d{4}$/.test(c.id)||answer.hidden)return;
 if(answer.querySelector('.bm197-evolutive'))return;
 const pane=create('section','bm197-evolutive'),heading=create('h3','bm197-title','📖 Resposta evolutiva integral · 11 seções');
 const state=create('div','bm197-state','Carregando os textos completos do cartão '+c.id+'…');
 pane.dataset.cardId=c.id;pane.append(heading,state);
 const primary=answer.querySelector(':scope > .bm163-essential, :scope > .bm165-essential');
 if(primary)primary.after(pane);else answer.prepend(pane);
 if(bm197Reserved.has(c.id)){
  state.replaceChildren(create('p','bm197-pending','Cartão reservado para homologação. O verso original continua disponível acima.'));
  return;
 }
 const load=async()=>{
  state.replaceChildren(create('p','bm197-loading','Carregando 11 seções do '+c.id+'…'));
  try{
   const record=await bm197Record(c.id);
   if(!pane.isConnected||pane.dataset.cardId!==currentId)return;
   if(!record)throw Error('ID '+c.id+' não encontrado no lote público.');
   if(!Array.isArray(record.layers)||record.layers.length!==11||
      record.layers.some((x,i)=>x.ord!==i+1||!String(x.titulo||'').trim()||!String(x.texto||'').trim()))
    throw Error('Registro sem as 11 seções completas.');
   if(window.BM198Format?.render){
    // Mesmo renderizador para modal e grade: quadro informativo + 11 módulos por extenso.
    window.BM198Format.render(state,record,c.id);
   }else{
    // Fallback fiel: manter conteúdo visível mesmo se o estilo opcional falhar.
    const fragment=document.createDocumentFragment();
    record.layers.forEach((layer,i)=>{
     const item=create('section','bm197-layer');
     const title=String(layer.titulo).trim();
     item.append(create('h4','bm197-layer-title',/^\d{1,2}\s*[-—–.:]/.test(title)?title:String(i+1).padStart(2,'0')+' · '+title));
     bm197RenderText(item,layer.texto);fragment.append(item);
    });
    state.replaceChildren(create('p','bm197-pending','O quadro informativo não carregou; exibindo os 11 textos originais.'),fragment);
   }
   if(record.v199_status)heading.textContent='📖 Resposta evolutiva integral · 11 seções · '+c.id+' · reauditoria V199';
   else heading.textContent='📖 Resposta evolutiva integral · 11 seções · '+c.id;
   if(record.v199_warning)state.prepend(create('p','bm197-pending',record.v199_warning));
  }catch(e){
   if(!pane.isConnected||pane.dataset.cardId!==currentId)return;
   const err=create('p','bm197-error','Não foi possível mostrar a resposta evolutiva: '+String(e?.message||e));
   const retry=create('button','bm197-retry','Tentar carregar novamente');retry.type='button';retry.addEventListener('click',load);
   state.replaceChildren(err,retry);
  }
 };
 void load();
}

// TRT shares the original reader and its V198 renderer. No SRS writes.
async function trtLaw(id){
 lawPanel.replaceChildren(create('p','bm163-law-warning','Carregando referências…'));
 try{
  const data=await window.BM236TrtCardsGrid.loadRecord(id);
  if(currentId!==id||lawPanel.hidden)return;
  lawPanel.replaceChildren(create('h3','bm163-piece-title','Fontes normativas do cartão'),
   create('p','bm163-law-warning','A íntegra literal não foi certificada: consulte os dispositivos diretamente nas fontes oficiais.'));
  for(const item of data.laws||[]){
   if(!/^https:\/\//.test(item.source_url||''))continue;
   const a=create('a','bm163-law-source',(item.norm||'Norma')+' · '+(item.article||'dispositivo'));
   a.href=item.source_url;a.target='_blank';a.rel='noopener noreferrer';lawPanel.append(a);
  }
 }catch(e){if(currentId===id&&!lawPanel.hidden)lawPanel.replaceChildren(create('p','bm163-law-warning','Fonte indisponível: '+String(e.message||e)));}
}
function trtMedia(images){
 const zone=create('section','bm211-media bm165-trt-media');
 const title=create('h3','','Imagens originais vinculadas');
 const button=btn('Carregar prévias do Drive','file','bm211-fetch');
 const status=create('p','bm211-status','As prévias exigem autorização na aba Imagens. Links originais disponíveis abaixo.');
 const grid=create('div','bm211-grid');zone.append(title,button,status,grid);
 const list=[];
 for(const [i,item] of images.entries()){
  const fig=create('figure','bm211-figure'),frame=create('div','bm211-frame');
  const placeholder=create('div','bm211-placeholder','Prévia privada');
  const pic=create('img','bm211-image');pic.hidden=true;pic.loading='lazy';pic.alt=item.title||'Imagem original';
  frame.append(placeholder,pic);
  const caption=create('figcaption','bm211-figcaption');
  caption.append(create('strong','',(i+1)+' — '+(item.title||'Imagem original')));
  if(/^https:\/\//.test(item.drive_url||'')){
   const link=create('a','bm211-link','Abrir original no Drive');link.href=item.drive_url;link.target='_blank';link.rel='noopener noreferrer';caption.append(link);
  }
  fig.append(frame,caption);grid.append(fig);list.push({item,placeholder,pic});
 }
 button.addEventListener('click',async()=>{
  const token=window.BancoMestreMediaSyncV182?.token?.()||'';
  if(!token){status.textContent='Conecte o Google Drive na aba Imagens antes de carregar as prévias.';return;}
  button.disabled=true;status.textContent='Carregando prévias autorizadas…';
  let ok=0;
  await Promise.all(list.map(async ({item,pic,placeholder})=>{
   if(pic.dataset.loaded==='1'){ok++;return;}
   if(!/^[A-Za-z0-9_-]{15,}$/.test(item.file_id||''))return;
   try{
    const r=await fetch('https://www.googleapis.com/drive/v3/files/'+encodeURIComponent(item.file_id)+'?alt=media',{headers:{Authorization:'Bearer '+token},cache:'no-store'});
    if(!r.ok)throw Error('HTTP '+r.status);
    const blob=await r.blob();
    if(blob.size>15000000||!/^image\/(png|jpeg|webp|gif)$/.test(blob.type))throw Error('tipo/tamanho inválido');
    const url=URL.createObjectURL(blob);trtUrls.push(url);pic.src=url;pic.hidden=false;pic.dataset.loaded='1';placeholder.hidden=true;ok++;
   }catch(e){placeholder.textContent='Prévia indisponível ('+String(e.message||e)+')';}
  }));
  if(zone.isConnected)status.textContent=ok+' de '+images.length+' imagens carregadas.';
  button.disabled=false;
 });
 return zone;
}
async function trtStudy(id){
 const pane=create('section','bm197-evolutive bm165-trt-study');
 const heading=create('h3','bm197-title','Conteúdo TRT · 11 seções');
 const state=create('div','bm197-state','Carregando conteúdo…');pane.append(heading,state);answer.append(pane);
 try{
  const data=await window.BM236TrtCardsGrid.loadRecord(id);
  if(currentId!==id||!pane.isConnected||answer.hidden)return;
  if(data.layers.some((x,i)=>x.ord!==i+1||!String(x.titulo||'').trim()||!String(x.texto||'').trim()))throw Error('Módulos incompletos');
  if(!window.BM198Format?.render)throw Error('Leitor aprofundado indisponível');
  window.BM198Format.render(state,data,id);
  if(data.images?.length){
   const mods=state.querySelectorAll('.bm198-module'),gallery=trtMedia(data.images);
   if(mods[5])mods[5].after(gallery);else state.querySelector('.bm198-overview')?.before(gallery);
  }
  const info=create('details','bm221-trt-info');
  info.append(create('summary','','Informações do cartão e histórico operacional'),
    create('p','','Questão: '+(data.question_id||id)),
    create('p','','Tentativa: '+(data.student_answer||'não registrada')),
    create('p','','Abertura de leitura: não cria evento SRS.'));
  (state.querySelector('.bm198-overview')||state).append(info);
  heading.textContent='Resposta aprofundada TRT · '+id+' · 11 seções';
 }catch(e){
  if(currentId!==id||!pane.isConnected)return;
  const retry=btn('Tentar novamente','file','bm197-retry');
  retry.addEventListener('click',()=>{pane.remove();void trtStudy(id);});
  state.replaceChildren(create('p','bm197-error','Falha ao carregar o cartão: '+String(e.message||e)),retry);
 }
}
async function bm242OperationalStudy(id){
 const pane=create('section','bm197-evolutive bm165-trt-study');
 const heading=create('h3','bm197-title','Conteúdo original de '+id+' · 11 módulos');
 const state=create('div','bm197-state','Carregando material…');
 pane.append(heading,state);answer.append(pane);
 try{
  const rec=await window.BM242OperationalCards.loadRecord(id);
  if(currentId!==id||!pane.isConnected||answer.hidden)return;
  if(!window.BM198Format?.render)throw Error('Formatador de 11 módulos indisponível');
  window.BM198Format.render(state,rec,id);
  const sections=state.querySelectorAll('.bm198-module');
  if(sections.length!==11)throw Error('O leitor não exibiu 11 módulos');
  const gallery=create('section','bm242-gallery');
  gallery.append(create('h4','','Galeria de imagens'),
   create('p','','Nenhum arquivo original de imagem vinculado com verificação a este cartão. O arquivo de origem cita um SVG ainda não localizado; nenhuma imagem foi inventada.'));
  const source=create('a','','Consultar cartão original no Drive');
  source.href=rec.original_full_source;source.target='_blank';source.rel='noopener noreferrer';
  gallery.append(source);
  const overview=state.querySelector('.bm198-overview');
  if(!overview)throw Error('Quadro informativo final não localizado');
  overview.before(gallery);
  const history=create('details','bm221-trt-info');
  history.append(create('summary','','Rastreabilidade e situação administrativa'),
   create('p','','ID original: '+id+' · Origem: '+(rec.question_id||'não informada')),
   create('p','','Arquivo fonte do Google Drive preservado. Publicação operacional não corresponde a alteração do Banco Mestre canônico.'),
   create('p','','Abertura de leitura não registra avaliação ou evento SRS.'));
  const linked=(window.BM242Lacunas?.data?.records||[]).filter(x=>x.cardIds?.includes(id));
  history.append(create('p','',linked.length+' lacuna(s) relacionada(s) no cadastro privado.'));
  const see=btn('Ver lacunas vinculadas','link','bm242-related-gaps');
  see.addEventListener('click',()=>{
   hide();document.getElementById('bm242-nav')?.click();
   const query=document.getElementById('bm242-search');
   if(query){query.value=id;window.BM242Lacunas?.render?.();query.focus();}
  });
  history.append(see);
  overview.append(history);
  heading.textContent='Material original '+id+' · 11 módulos';
 }catch(e){
  if(currentId!==id||!pane.isConnected)return;
  const retry=btn('Tentar novamente','file','bm197-retry');
  retry.addEventListener('click',()=>{pane.remove();void bm242OperationalStudy(id)});
  state.replaceChildren(create('p','bm197-error','Falha ao carregar cartão: '+String(e.message||e)),retry);
 }
}
function renderLaw(rec,c){
 lawPanel.replaceChildren();
 if(rec){
  lawPanel.append(
   create('h3','bm163-piece-title','Lei seca — transcrição do dispositivo'),
   create('p','bm163-law-meta',rec.law+' · '+rec.article),
   create('p','bm163-law-text',rec.text)
  );
  if(rec.notice)lawPanel.append(create('p','bm163-law-warning','Referência a conferir: '+rec.notice));
  if(rec.scope)lawPanel.append(create('p','bm163-law-scope','Trecho apresentado: '+rec.scope));
  if(/^https:\/\//.test(rec.source_url||'')){
   const a=create('a','bm163-law-source','Consultar norma na fonte');a.href=rec.source_url;a.target='_blank';a.rel='noopener noreferrer';
   a.append(icon('link'));lawPanel.append(a);
  }
 }else{
  lawPanel.append(create('h3','bm163-piece-title','Lei seca ainda não conferida'));
  lawPanel.append(create('p','bm163-law-warning','A resposta conceitual não será apresentada como se fosse a redação literal da lei. Confira a norma correspondente antes de memorizar.'));
  if(c.reference)lawPanel.append(create('p','bm163-law-scope','Referência original: '+c.reference));
 }
}
function isLegal(c){return !!c&&(c.provisional||String(c.group||'')==='LEGISLACAO'||/legisla|direito|jur[ií]dic|constitucional/i.test(String(c.discipline||'')))}
function show(id,origin){
 const c=getCard(id);if(!c)return false;
 // Inicia cada cartão sem a lateral; o usuário pode reabri-la no botão original.
 panel.classList.add('bm165-sidebar-hidden');
 sidebarToggle.setAttribute('aria-expanded','false');
 sidebarToggle.title='Mostrar outros cartões';
 if(overlay.hidden){
  focusedBefore=origin||document.activeElement;
  previousOverflow=document.body.style.overflow;
  document.body.style.overflow='hidden';
  overlay.hidden=false;document.body.classList.add('bm-v050-peek-open');
  panel.focus({preventScroll:true});
 }
 freeTrtUrls();currentId=id;title.textContent='Cartão '+id;
 front.textContent=c.front||'Pergunta não cadastrada';
 const restored=window.BM349?.has(id);const oldFront=questionBlock.querySelector('.bm349-front-media');if(oldFront)oldFront.remove();answer.classList.toggle('bm349-restored-answer',!!restored);
 if(restored){const f=create('div','bm349-front-media');front.after(f);void window.BM349.load(id).then(()=>{if(currentId!==id||overlay.hidden)return;front.textContent=window.BM349.get(id).front;void window.BM349.renderFront(f,id);}).catch(e=>{if(currentId===id)f.textContent='Pergunta restaurada indisponível: '+e.message});}
 meta.textContent=(window.BM349?.has(id)?[c.discipline,c.subject]:[c.discipline,c.subject,c.sub]).filter(Boolean).join(' › ');
 provenance.textContent=/^TRT0[12]-C\d{3}$/.test(id)?'TRT · registro operacional · não modifica SRS':c.provisional?'Cartão integrado · origem Ijuí':'Cartão da base original · ID preservado';
 if(window.BM163LeiSeca?.getRecord(id)?.notice)provenance.textContent+=' · referência normativa divergente';
 reveal.setAttribute('aria-expanded','false');
 reveal.replaceChildren(icon('eye'),document.createTextNode('Revelar resposta'));
 answer.hidden=true;answer.replaceChildren();
 lawButton.hidden=!isLegal(c);lawButton.setAttribute('aria-expanded','false');
 lawButton.replaceChildren(icon('book'),document.createTextNode('Mostrar lei seca'));
 lawPanel.hidden=true;lawPanel.replaceChildren();
 status.textContent='Resposta e lei seca iniciam ocultas. Escolha outros cartões na lista lateral.';
 if(window.BM242OperationalCards?.has?.(id)){
  void window.BM242OperationalCards.loadRecord(id).then(rec=>{
   if(currentId!==id||overlay.hidden)return;
   front.textContent=rec.front;
   meta.textContent=[rec.discipline,rec.subject,rec.sub].filter(Boolean).join(' › ');
   provenance.textContent='Cartão operacional de origem PETRO14 · ID original preservado · sem evento SRS';
  }).catch(e=>{if(currentId===id)provenance.textContent='Falha ao consultar cartão original: '+e.message});
 }
 applyReaderMode();scroll.scrollTop=0;renderRelated();return true;
}
reveal.addEventListener('click',()=>{
 const c=getCard(currentId);if(!c)return;
 answer.hidden=!answer.hidden;
 if(!answer.hidden){
  if(window.BM349?.has(c.id)){void window.BM349.renderAnswer(answer,c.id);}else{
  appendAnswer(c);
  // A seção nasce no próprio leitor, antes da requisição remota.
  if(/^TRT0[12]-C\d{3}$/.test(c.id))void trtStudy(c.id);else if(window.BM242OperationalCards?.has?.(c.id))void bm242OperationalStudy(c.id);else bm197ShowEvolution(c);}
 }
 reveal.setAttribute('aria-expanded',String(!answer.hidden));
 reveal.replaceChildren(icon('eye'),document.createTextNode(answer.hidden?'Revelar resposta':'Ocultar resposta'));
 status.textContent=answer.hidden?'Resposta ocultada novamente.':'Resposta e materiais complementares disponíveis abaixo, com seções recolhíveis.';
});
lawButton.addEventListener('click',()=>{
 const c=getCard(currentId);if(!c)return;
 lawPanel.hidden=!lawPanel.hidden;
 lawButton.setAttribute('aria-expanded',String(!lawPanel.hidden));
 lawButton.replaceChildren(icon('book'),document.createTextNode(lawPanel.hidden?'Mostrar lei seca':'Ocultar lei seca'));
 if(!lawPanel.hidden){
  if(/^TRT0[12]-C\d{3}$/.test(c.id))void trtLaw(c.id);else renderLaw(window.BM163LeiSeca?.getRecord(currentId),c);
  const wanted=currentId;
  const ready=window.BM163LeiSeca?.whenReady;
  if(ready&&typeof ready.then==='function')void ready.then(()=>{
   if(currentId===wanted&&!lawPanel.hidden)renderLaw(window.BM163LeiSeca?.getRecord(wanted),c);
  }).catch(()=>{});
 }
});
answer.addEventListener('click',e=>{
 const b=e.target.closest('button.media-ref');if(!b)return;
 const id=b.textContent.trim();
 if(pattern.test(id)&&getCard(id)){e.preventDefault();show(id,b)}
});
close.addEventListener('click',hide);backdrop.addEventListener('click',hide);
document.addEventListener('keydown',e=>{
 if(overlay.hidden)return;
 if(e.key==='Escape'){e.preventDefault();hide();return}
 if((e.altKey||e.ctrlKey)&&e.key==='ArrowRight'){e.preventDefault();moveCard(1);return}
 if((e.altKey||e.ctrlKey)&&e.key==='ArrowLeft'){e.preventDefault();moveCard(-1);return}
 if(e.key!=='Tab')return;
 const focusable=Array.from(panel.querySelectorAll('a[href],button,summary,textarea,input,select,[tabindex="0"]')).filter(el=>visibleElement(el)&&el.getClientRects().length>0);
 if(!focusable.length)return;
 const first=focusable[0],last=focusable[focusable.length-1];
 if(e.shiftKey&&(document.activeElement===first||document.activeElement===panel)){e.preventDefault();last.focus()}
 else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}
});
function decorate(){
 for(const article of root.querySelectorAll('article.card')){
  const heading=article.querySelector(':scope > h3');
  if(heading&&!article.dataset.bm163HeadingReady){article.insertBefore(heading,article.firstElementChild);article.dataset.bm163HeadingReady='yes';}
  const train=article.querySelector(':scope > .v037-train');
  if(train&&!article.querySelector(':scope > details.bm-v055-trainfold')){
   const fold=create('details','bm-v055-trainfold');
   const s=create('summary','', 'Responder discursiva');s.title='Abrir espaço de resposta deste cartão';
   fold.append(s,train);article.insertBefore(fold,article.querySelector(':scope > .buttons'));
  }
  if(article.querySelector(':scope > .bm-v050-peek-button'))continue;
  const id=idOf(article);if(!pattern.test(id))continue;
  const b=btn('Abrir leitura','eye','bm-v050-peek-button');
  b.title='Abrir leitura detalhada de '+id+' na mesma página, sem registrar revisão';
  b.setAttribute('aria-label','Ler '+id+' em janela com rolagem');
  b.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();show(id,b)});
  if(heading)heading.after(b);else article.prepend(b);
 }
}
let scheduled=false;
const observer=new MutationObserver(()=>{
 if(scheduled)return;scheduled=true;requestAnimationFrame(()=>{scheduled=false;decorate()});
});
observer.observe(root,{childList:true,subtree:true});decorate();
window.BancoMestreVisualizarCardV050={
 get ready(){return !!document.getElementById('bmCardPeekV050')},
 get visible(){return !overlay.hidden},
 get currentId(){return currentId},
 get relatedCount(){return related().length},
 setMode(){applyReaderMode()},
 get mode(){return readerMode},
 next(){moveCard(1)},previous(){moveCard(-1)},
 showId(id,from){const article=[...root.querySelectorAll('article.card')].find(a=>idOf(a)===id);
  return show(id,from||article||document.activeElement)},
 close:hide
};
})();

;
/* 22 assets/v056_pdf_controls.js */
/* V056 — tela inteira para PDF, controles compactos flutuantes.
   Não substitui o leitor: os botões originais continuam com seus handlers. */
(function(){
 'use strict';
 const dialog=document.getElementById('pdfDialog');
 const body=dialog?.querySelector(':scope > .dbody');
 const toolbar=body?.querySelector(':scope > .toolbar');
 const title=document.getElementById('docTitle');
 const oldClose=document.getElementById('pdfClose');
 const side=dialog?.querySelector('.bm-v046-pdf-side');
 const localTools=document.getElementById('pdfLocalTools');
 if(!dialog||!body||!toolbar||!oldClose)return;
 if(document.getElementById('bmV056FloatingControls'))return;

 toolbar.id='bmV056Toolbar';
 const caption=document.createElement('strong');
 caption.id='bmV056PdfCaption';caption.textContent=title?.textContent||'Documento PDF';
 toolbar.prepend(caption);
 const syncCaption=()=>{caption.textContent=title?.textContent||'Documento PDF'};
 if(title)new MutationObserver(syncCaption).observe(title,{subtree:true,characterData:true,childList:true});

 const showAnnotations=document.createElement('button');
 showAnnotations.type='button';showAnnotations.id='bmV056ShowAnnotations';
 showAnnotations.textContent='✎ Ferramentas de grifo';
 showAnnotations.title='Mostrar as ferramentas de grifo, página, zoom e salvamento';
 showAnnotations.setAttribute('aria-controls','pdfLocalTools');
 showAnnotations.setAttribute('aria-expanded','false');
 toolbar.append(showAnnotations);

 const floating=document.createElement('div');
 floating.id='bmV056FloatingControls';
 floating.setAttribute('role','toolbar');
 floating.setAttribute('aria-label','Comandos compactos do leitor PDF');
 const menuButton=document.createElement('button');
 menuButton.type='button';menuButton.id='bmV056OpenPdfMenu';
 menuButton.textContent='⋮';menuButton.title='Abrir opções do PDF';
 menuButton.setAttribute('aria-label','Abrir opções do PDF');
 menuButton.setAttribute('aria-expanded','false');
 menuButton.setAttribute('aria-controls','bmV056Toolbar');
 const closeButton=document.createElement('button');
 closeButton.type='button';closeButton.id='bmV056ClosePDF';
 closeButton.textContent='×';closeButton.title='Fechar o leitor PDF';
 closeButton.setAttribute('aria-label','Fechar o leitor PDF');
 floating.append(menuButton,closeButton);
 dialog.append(floating);

 let closeAnnotationsButton=null;
 if(side&&localTools){
  closeAnnotationsButton=document.createElement('button');
  closeAnnotationsButton.type='button';closeAnnotationsButton.id='bmV056CloseAnnotations';
  closeAnnotationsButton.textContent='× Recolher ferramentas';
  closeAnnotationsButton.title='Esconder ferramentas e ampliar novamente a área de leitura';
  side.prepend(closeAnnotationsButton);
 }
 const isEditing=()=>!!localTools&&!localTools.hidden;
 const syncTools=()=>{
  showAnnotations.hidden=!isEditing();
  if(!isEditing())hideAnnotations();
 };
 function hideMenu(){
  dialog.classList.remove('bm-v056-menu-open');
  menuButton.setAttribute('aria-expanded','false');
 }
 function hideAnnotations(){
  dialog.classList.remove('bm-v056-annotation-open');
  showAnnotations.setAttribute('aria-expanded','false');
 }
 menuButton.onclick=()=>{
  const opening=!dialog.classList.contains('bm-v056-menu-open');
  if(opening){hideAnnotations();syncCaption()}
  dialog.classList.toggle('bm-v056-menu-open',opening);
  menuButton.setAttribute('aria-expanded',String(opening));
 };
 closeButton.onclick=()=>oldClose.click();
 showAnnotations.onclick=()=>{
  if(!isEditing())return;
  const opening=!dialog.classList.contains('bm-v056-annotation-open');
  hideMenu();
  dialog.classList.toggle('bm-v056-annotation-open',opening);
  showAnnotations.setAttribute('aria-expanded',String(opening));
 };
 if(closeAnnotationsButton)closeAnnotationsButton.onclick=hideAnnotations;
 toolbar.addEventListener('click',event=>{
  if(event.target.closest('a,button')&&event.target!==showAnnotations)hideMenu();
 });
 dialog.addEventListener('pointerdown',event=>{
  const node=event.target;
  if(dialog.classList.contains('bm-v056-menu-open')&&!toolbar.contains(node)&&!floating.contains(node))hideMenu();
  if(dialog.classList.contains('bm-v056-annotation-open')&&side&&!side.contains(node)&&!floating.contains(node))hideAnnotations();
 },true);
 function reset(){
  hideMenu();hideAnnotations();syncCaption();syncTools();
 }
 dialog.addEventListener('close',reset);
 dialog.addEventListener('cancel',event=>{
  if(dialog.classList.contains('bm-v056-menu-open')||dialog.classList.contains('bm-v056-annotation-open')){
   event.preventDefault();hideMenu();hideAnnotations();
  }
 });
 if(localTools)new MutationObserver(syncTools).observe(localTools,{attributes:true,attributeFilter:['hidden']});
 new MutationObserver(()=>{
  if(dialog.open)reset();
 }).observe(dialog,{attributes:true,attributeFilter:['open']});
 reset();
 window.BancoMestrePDFV056={
  get fullscreen(){return dialog.open&&dialog.classList.contains('bm-v056-pdf-fullscreen')},
  get menuOpen(){return dialog.classList.contains('bm-v056-menu-open')},
  get annotationsOpen(){return dialog.classList.contains('bm-v056-annotation-open')},
  close:()=>oldClose.click()
 };
 dialog.classList.add('bm-v056-pdf-fullscreen');
})();

;
/* 23 assets/v058_pdf_dock.js */
/* Banco Mestre V057 — controle compacto fixo no leitor PDF.
   Reaproveita os IDs e funções do editor já carregado.
   Sem alterar documentos, grifos existentes, SRS ou o catálogo. */
(function(){
 'use strict';
 const $=id=>document.getElementById(id);
 const dialog=$('pdfDialog'),originalMarker=$('pdfMarker'),originalPan=$('pdfPan');
 const originalUndo=$('pdfUndo'),originalRedo=$('pdfRedo'),pager=$('pdfPager');
 const originalTools=$('pdfLocalTools'),canvas=$('pdfInkCanvas');
 if(!dialog||!originalMarker||!pager||!originalTools||$('bmV057PdfDock'))return;
 const api=()=>window.BancoMestrePDFV042;
 const dock=document.createElement('form');
 dock.id='bmV057PdfDock';dock.setAttribute('role','group');
 dock.setAttribute('aria-label','Grifos e navegação por página no PDF');
 dock.noValidate=true;
 function button(text,title){
  const b=document.createElement('button');
  b.type='button';b.textContent=text;b.title=title;
  b.setAttribute('aria-label',title);return b;
 }
 const marker=button('▤ Grifar','Grifar reto: clique no início e depois no fim da linha. Arraste para grifo livre.');
 marker.id='bmV057Marker';
 marker.setAttribute('aria-pressed','false');
 marker.dataset.bmAlwaysVisible='true';
 const hint=document.createElement('span');
 hint.id='bmV058MarkerHint';hint.hidden=true;
 hint.textContent='Clique no fim da mesma linha · Esc cancela';
 hint.setAttribute('role','status');
 const pan=button('✥','Mover e rolar o PDF');
 pan.id='bmV057Pan';pan.setAttribute('aria-pressed','false');
 const undo=button('↶','Desfazer último grifo ou anotação desta página (Ctrl+Z)');
 undo.id='bmV057Undo';
 const redo=button('↷','Refazer última alteração desfeita (Ctrl+Shift+Z ou Ctrl+Y)');
 redo.id='bmV057Redo';
 const separator=document.createElement('span');separator.className='bm-v057-separator';
 separator.setAttribute('aria-hidden','true');
 const pgLabel=document.createElement('label');pgLabel.htmlFor='bmV057PageNumber';pgLabel.textContent='Pág.';
 const page=document.createElement('input');
 page.id='bmV057PageNumber';page.type='number';page.min='1';page.step='1';
 page.inputMode='numeric';page.autocomplete='off';
 page.setAttribute('aria-label','Número da página PDF desejada');
 const total=document.createElement('span');total.id='bmV057PageTotal';
 total.textContent='/ —';total.setAttribute('aria-label','Total de páginas do PDF');
 const go=document.createElement('button');
 go.type='submit';go.id='bmV057GoPage';go.textContent='Ir';
 go.title='Abrir diretamente a página informada';
 const alert=document.createElement('span');alert.id='bmV057DockStatus';
 alert.setAttribute('role','status');alert.setAttribute('aria-live','polite');
 alert.className='bm-v057-visually-hidden';
 dock.append(marker,pan,undo,redo,separator,pgLabel,page,total,go,alert,hint);
 dialog.append(dock);
 let jumping=false;
 const edit=()=>!!api()?.editing;
 function refresh(){
  const ready=edit(),pdf=api(),pages=ready?pdf.totalPages:0;
  // O botão de grifar também abre o editor a partir da prévia do Drive.
  marker.disabled=false;
  marker.setAttribute('aria-pressed',String(ready&&pdf.currentTool==='marker'));
  hint.hidden=!(ready&&pdf.straightHighlightPending);
  marker.title=ready?(pdf.straightHighlightPending?
   'Grifo iniciado: clique no ponto final da mesma linha. Esc cancela.':
   'Sempre visível: clique início e fim para grifo reto; arraste para grifar livre.') :
   'Abra a cópia do PDF no editor para ativar o grifo.';
  pan.disabled=!ready;pan.setAttribute('aria-pressed',String(ready&&pdf.currentTool==='pan'));
  undo.disabled=!ready||!pdf.canUndo;
  redo.disabled=!ready||!pdf.canRedo;
  page.disabled=!ready||jumping;go.disabled=!ready||jumping;
  page.max=pages?String(pages):'1';
  page.placeholder=ready?'1':'—';
  if(document.activeElement!==page)page.value=ready?String(pdf.currentPage):'';
  total.textContent=ready?'/ '+pages:'/ —';
  const unavailable='Abra a cópia do PDF no editor para escolher uma página.';
  page.title=ready?'Digite um número entre 1 e '+pages:unavailable;
  go.title=ready?'Ir para a página digitada':unavailable;
 }
 function alertUser(text){alert.textContent=text;dock.title=text}
 marker.onclick=()=>{
  if(edit()){originalMarker.click();refresh();return}
  const b=$('pdfChooseLocal');
  if(b){b.click();alertUser('Abra a cópia autorizada no editor para grifar.')}
  else alertUser('Editor PDF indisponível neste documento.');
 };
 pan.onclick=()=>{if(edit()){originalPan.click();refresh()}};
 undo.onclick=()=>{if(edit()){api().undoLast();refresh()}};
 redo.onclick=()=>{if(edit()){api().redoLast();refresh()}};
 dock.addEventListener('submit',async e=>{
  e.preventDefault();
  if(!edit()||jumping)return;
  const n=Number(page.value),pages=api().totalPages;
  if(!page.value.trim()||!Number.isInteger(n)||n<1||n>pages){
   alertUser('Digite uma página válida entre 1 e '+pages+'.');
   page.focus();page.select();return;
  }
  jumping=true;refresh();
  try{
   const ok=await api().goToPage(n);
   alertUser(ok?'Página '+n+' de '+pages+'.':'Não foi possível abrir a página informada.');
   if(ok){page.blur();$('pdfLocalMode')?.focus({preventScroll:true})}
  }catch(err){alertUser('Falha ao abrir página: '+err.message)}
  finally{jumping=false;refresh()}
 });
 const watchButtons=[originalMarker,originalPan,$('pdfDraw'),$('pdfEraser')].filter(Boolean);
 for(const b of watchButtons)new MutationObserver(refresh).observe(b,{attributes:true,attributeFilter:['aria-pressed']});
 new MutationObserver(refresh).observe(originalTools,{attributes:true,attributeFilter:['hidden']});
 new MutationObserver(refresh).observe(pager,{childList:true,characterData:true,subtree:true});
 window.addEventListener('bm-pdf-marker-state',refresh);
 dialog.addEventListener('close',()=>{jumping=false;alertUser('');refresh()});
 const recheck=e=>{
  if(e.target?.closest?.('#bmV057PdfDock'))return;
  queueMicrotask(refresh);
 };
 dialog.addEventListener('click',recheck);
 canvas?.addEventListener('pointerdown',()=>queueMicrotask(refresh));
 canvas?.addEventListener('pointerup',()=>queueMicrotask(refresh));
 canvas?.addEventListener('pointercancel',()=>queueMicrotask(refresh));
 document.addEventListener('keydown',e=>{
  if(!dialog.open||!edit()||!(e.ctrlKey||e.metaKey))return;
  if(!['z','y'].includes(String(e.key).toLowerCase()))return;
  queueMicrotask(refresh);
 },false);
 refresh();
 window.BancoMestrePDFDockV057={
  get ready(){return !!$('bmV057PdfDock')},
  get page(){return api()?.currentPage||0},
  get enabled(){return edit()},
  refresh
 };
})();

;
/* 24 assets/v061_pdf_extrair.js */
/* Banco Mestre V059 — extrair e consultar o texto sob grifos do leitor PDF.
   Não altera PDF, SRS, flashcards, conteúdo original ou anotações armazenadas. */
(function(){
 'use strict';
 const $=id=>document.getElementById(id);
 const dialog=$('pdfDialog'),toolbar=dialog?.querySelector(':scope > .dbody > .toolbar');
 if(!dialog||!toolbar||$('bmV059ExtractPanel'))return;
 const pdfApi=()=>window.BancoMestrePDFV042;
 const b=(label,id)=>{
  const e=document.createElement('button');e.type='button';e.id=id;e.textContent=label;return e;
 };
 const option=b('▤ Extrair textos grifados','bmV059ExtractMenu');
 option.title='Extrair as palavras presentes nas posições dos grifos do PDF digital';
 toolbar.append(option);
 const panel=document.createElement('section');
 panel.id='bmV059ExtractPanel';panel.hidden=true;
 panel.setAttribute('role','dialog');panel.setAttribute('aria-modal','false');
 panel.setAttribute('aria-labelledby','bmV059ExtractTitle');
 const head=document.createElement('div');head.className='bm-v059-panel-head';
 const title=document.createElement('strong');title.id='bmV059ExtractTitle';
 title.textContent='Extrair textos grifados';
 const close=b('×','bmV059Close');close.setAttribute('aria-label','Fechar painel de extração');
 head.append(title,close);
 const description=document.createElement('p');
 description.className='bm-v059-description';
 description.textContent='Reconhece trechos da camada digital de texto nas posições dos grifos. A seleção de caracteres é aproximada: confira o resultado antes de estudar ou criar flashcards.';
 const controls=document.createElement('div');controls.className='bm-v059-controls';
 const scopeLabel=document.createElement('label');
 scopeLabel.htmlFor='bmV059Scope';scopeLabel.textContent='Extrair de';
 const scope=document.createElement('select');scope.id='bmV059Scope';
 scope.add(new Option('Todas as páginas grifadas','all'));
 scope.add(new Option('Somente página atual','current'));
 const extract=b('Extrair agora','bmV059Run');extract.className='primary';
 controls.append(scopeLabel,scope,extract);
 const status=document.createElement('p');status.id='bmV059Status';
 status.setAttribute('aria-live','polite');status.className='bm-v059-status';
 const summary=document.createElement('div');summary.id='bmV059Summary';
 summary.className='bm-v059-summary';
 const preview=document.createElement('div');preview.id='bmV059Results';
 preview.className='bm-v059-results';
 const exportRow=document.createElement('div');exportRow.className='bm-v059-export';
 const copy=b('Copiar texto','bmV059Copy');
 const saveTxt=b('Baixar TXT','bmV059TXT');
 const saveJson=b('Baixar JSON','bmV059JSON');
 for(const el of [copy,saveTxt,saveJson])el.disabled=true;
 exportRow.append(copy,saveTxt,saveJson);
 const help=document.createElement('p');help.className='bm-v059-note';
 help.textContent='A extração não modifica o Banco Mestre nem cria flashcards. PDFs escaneados sem texto digital precisam de OCR, que não está incluído nesta função.';
 panel.append(head,description,controls,status,summary,preview,exportRow,help);
 dialog.append(panel);
 let result=null,working=false,generation=0;
 const text=(tag,value,cls)=>{
  const el=document.createElement(tag);el.textContent=value;
  if(cls)el.className=cls;return el;
 };
 function serialize(data){
  if(!data)return '';
  const lines=[
   'BANCO MESTRE — TEXTOS GRIFADOS',
   'Documento: '+data.document_title,
   'ID: '+data.document_id,
   'Arquivo: '+data.source_filename,
   'Versão (hash): '+data.source_hash,
   'Escopo: '+(data.scope==='pagina_ativa'?'Somente página ativa':'Todas as páginas grifadas'),
   'Trechos detectados: '+data.extracted_count+' de '+data.highlight_count+' grifo(s)',
   'Método: seleção exata nos grifos novos; aproximação geométrica nos grifos antigos',
   ''
  ];
  if(!data.entries.length)lines.push('Nenhum grifo encontrado no escopo selecionado.');
  for(const entry of data.entries){
   lines.push('PÁGINA '+entry.page+' — GRIFO '+entry.mark);
   if(entry.text)lines.push(entry.text);
   else lines.push('['+({
    sem_texto_digital:'Sem camada de texto digital — OCR necessário',
    sem_correspondencia_geometrica:'Sem texto correspondente à posição do grifo',
    erro_de_leitura:'Erro ao ler a camada de texto'
   }[entry.status]||'Trecho não encontrado')+']');
   lines.push('');
  }
  if(data.warnings.length){
   lines.push('OBSERVAÇÕES');
   for(const warning of data.warnings)lines.push('- '+warning);
  }
  return lines.join('\n');
 }
 function render(data){
  summary.replaceChildren();preview.replaceChildren();
  const metrics=text('p',data.extracted_count+' trecho(s) recuperado(s) de '+
   data.highlight_count+' grifo(s), em '+data.highlighted_pages+' página(s).',
   'bm-v059-metrics');
  summary.append(metrics);
  for(const warning of data.warnings)summary.append(text('p',warning,'bm-v059-warning'));
  if(!data.entries.length){
   preview.append(text('p','Não há marcações de grifo no escopo escolhido. Primeiro grife um trecho no editor do PDF.','bm-v059-empty'));
  }
  for(const entry of data.entries){
   const item=document.createElement('article');item.className='bm-v059-result';
   item.append(text('strong','Página '+entry.page+' · Grifo '+entry.mark));
   if(entry.text){
    const content=text('p',entry.text);content.style.whiteSpace='pre-wrap';
    item.append(content);
   }else{
    const label={
     sem_texto_digital:'PDF sem texto digital detectável — OCR necessário.',
     sem_correspondencia_geometrica:'Nenhum texto coincidiu com esta marcação.',
     erro_de_leitura:'Ocorreu um erro ao ler esta página.'
    }[entry.status]||'Texto não identificado.';
    item.append(text('p',label,'bm-v059-warning'));
   }
   preview.append(item);
  }
 }
 function updateAvailability(){
  const allowed=!!pdfApi()?.editing;
  extract.disabled=!allowed||working;
  scope.disabled=working;
  if(!allowed&&!working){
   status.textContent='Abra o documento no editor PDF para extrair os grifos. A prévia do Google Drive não fornece as posições da página nem as marcações locais.';
  }else if(allowed&&!result&&!working){
   status.textContent='Pronto para analisar os grifos deste PDF. Escolha o escopo e clique em Extrair agora.';
  }
 }
 function open(){
  panel.hidden=false;option.setAttribute('aria-expanded','true');
  updateAvailability();
 }
 function hide(){
  panel.hidden=true;option.setAttribute('aria-expanded','false');
 }
 option.setAttribute('aria-expanded','false');
 option.setAttribute('aria-controls','bmV059ExtractPanel');
 option.onclick=()=>panel.hidden?open():hide();
 close.onclick=hide;
 function setExportAvailability(on){
  for(const el of [copy,saveTxt,saveJson])el.disabled=!on;
 }
 extract.onclick=async()=>{
  if(working||!pdfApi()?.editing)return;
  const id=pdfApi().currentId,hash=pdfApi().sourceHash,run=++generation;
  working=true;result=null;setExportAvailability(false);
  summary.replaceChildren();preview.replaceChildren();
  updateAvailability();
  try{
   status.textContent='Lendo as páginas grifadas...';
   const data=await pdfApi().extractHighlights({
    scope:scope.value,
    onProgress:(current,total,page)=>{
     if(run!==generation)return;
     status.textContent='Lendo grifos: página '+page+' ('+current+' de '+total+' páginas com grifos)...';
    }
   });
   if(run!==generation||!dialog.open||!pdfApi()?.editing||
     pdfApi().currentId!==id||pdfApi().sourceHash!==hash)return;
   result=data;render(data);setExportAvailability(true);
   status.textContent='Concluído. Revise os trechos antes de copiar ou utilizar no estudo.';
  }catch(error){
   if(run!==generation)return;
   status.textContent='Extração não concluída: '+String(error.message||error);
  }finally{
   if(run===generation){working=false;updateAvailability()}
  }
 };
 async function copyText(){
  if(!result)return;
  const body=serialize(result);
  try{
   if(navigator.clipboard?.writeText)await navigator.clipboard.writeText(body);
   else{
    const textarea=document.createElement('textarea');
    textarea.value=body;textarea.style.cssText='position:fixed;left:-10000px;top:0';
    document.body.append(textarea);textarea.select();
    const ok=document.execCommand('copy');textarea.remove();
    if(!ok)throw Error('Área de transferência indisponível');
   }
   status.textContent='Texto copiado. Confira os trechos antes de utilizá-los.';
  }catch(error){status.textContent='Não foi possível copiar automaticamente. Exporte o TXT. '+error.message}
 }
 function download(mime,ext,body){
  if(!result)return;
  const blob=new Blob([body],{type:mime});
  const url=URL.createObjectURL(blob);
  const link=document.createElement('a');
  link.href=url;
  const safe=String(result.document_id||'documento').replace(/[^A-Za-z0-9_-]/g,'_');
  link.download='Banco_Mestre_Grifos_'+safe+'_'+result.scope+'.'+ext;
  document.body.append(link);link.click();link.remove();
  setTimeout(()=>URL.revokeObjectURL(url),12000);
 }
 copy.onclick=copyText;
 saveTxt.onclick=()=>download('text/plain;charset=utf-8','txt',serialize(result));
 saveJson.onclick=()=>download('application/json;charset=utf-8','json',JSON.stringify(result,null,2));
 dialog.addEventListener('close',()=>{
  generation++;working=false;result=null;setExportAvailability(false);hide();
  summary.replaceChildren();preview.replaceChildren();status.textContent='';
 });
 window.BancoMestrePDFExtracaoV059={
  get ready(){return !!$('bmV059ExtractMenu')},
  get open(){return !panel.hidden},
  get lastResult(){return result?{...result,entries:result.entries.map(x=>({...x}))}:null},
  openPanel:open
 };
})();

;
/* 25 assets/v060_pdf_lateral.js */
/* Banco Mestre V060 — controles PDF permanentes na lateral.
   Reutiliza a barra v043 e o campo de página v057 sem criar botões duplicados. */
(function(){
 'use strict';
 const dialog=document.getElementById('pdfDialog');
 const side=dialog?.querySelector('.bm-v046-pdf-side');
 const tools=document.getElementById('pdfLocalTools');
 const main=document.getElementById('pdfMainV043');
 const dock=document.getElementById('bmV057PdfDock');
 if(!dialog||!side||!tools||!main)return;
 if(dialog.classList.contains('bm-v060-pdf-permanent-sidebar'))return;
 dialog.classList.add('bm-v060-pdf-permanent-sidebar');
 main.setAttribute('aria-label','Ferramentas de PDF sempre disponíveis na lateral durante a edição. Role a barra para ver todos os controles.');
 if(dock&&dock.parentElement!==tools)main.after(dock);
 // Os handlers do PDF e os registros de anotação continuam nos elementos
 // originais; trocar de página não recolhe a barra.
 const sync=()=>{
  if(!dialog.open)return;
  const available=!tools.hidden;
  side.setAttribute('aria-hidden',String(!available));
  dialog.classList.toggle('bm-v060-editor-active',available);
  if(available)dialog.classList.remove('bm-v056-annotation-open');
 };
 new MutationObserver(sync).observe(tools,{attributes:true,attributeFilter:['hidden']});
 dialog.addEventListener('close',()=>{
  dialog.classList.remove('bm-v060-editor-active','bm-v056-annotation-open');
  side.setAttribute('aria-hidden','true');
 });
 sync();
 window.BancoMestrePDFLateralV060={
  get ready(){return !!main&&side.contains(main)},
  get visible(){return dialog.open&&!tools.hidden},
  get pageInputInSidebar(){return !!dock&&side.contains(dock)}
 };
})();

;
/* 26 assets/v060_imagem_sidebar.js */
/* Banco Mestre V060 — imagem sem cabeçalho superior.
   Move os elementos DOM existentes, mantendo IDs e listeners originais. */
(function(){
 'use strict';
 const dialog=document.getElementById('imageDialog');
 const body=dialog?.querySelector(':scope > .dbody');
 const side=body?.querySelector(':scope > .editor-tools');
 const head=dialog?.querySelector(':scope > .dhead');
 const meta=body?.querySelector(':scope > .editor-meta');
 if(!dialog||!side||!head||!meta||dialog.classList.contains('bm-v060-image-side-only'))return;
 // Mesmo título e mesmo botão Fechar usados pelo editor anterior.
 // Nenhuma cópia ou handler paralelo é criado.
 dialog.classList.add('bm-v060-image-side-only');
 head.classList.add('bm-v060-image-sidebar-header');
 side.prepend(head);
 meta.classList.add('bm-v060-image-sidebar-meta');
 head.after(meta);
 const title=document.getElementById('imgTitle');
 if(title)title.setAttribute('title','Título/ID da imagem aberta; use o Atlas para editar a descrição');
 window.BancoMestreImageSideV060={
  get active(){return dialog.classList.contains('bm-v060-image-side-only')},
  get titleInSidebar(){return side.contains(document.getElementById('imgTitle'))},
  get closeInSidebar(){return side.contains(document.getElementById('imgClose'))},
  get zoomInSidebar(){return side.contains(document.getElementById('zoomInImage'))}
 };
})();

;
/* 27 assets/v109_classificador_lei_seca.js */
/* V109 — lei seca, quatro cores, análise sintática local com evidência e revisão.
 * LC 95/1998 arts.10-11: caput, parágrafo, inciso e alínea têm papéis diferentes.
 * SUGESTÕES, nunca interpretação normativa ou gabarito confirmado.
 */
(function(){
'use strict';
const COLORS=Object.freeze({
 regra:{color:'#FDE68A',label:'Amarelo · O quê? Regra'},
 agente:{color:'#BBF7D0',label:'Verde · Quem? Sujeito e competência'},
 condicao:{color:'#BAE6FD',label:'Azul · Em que condição? Prazo e número'},
 excecao:{color:'#FECDD3',label:'Rosa · Salvo o quê? Exceção'}
});
const plain=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'')
 .replace(/[\u2010-\u2015]/g,'-').toLowerCase();
const compact=s=>String(s||'').replace(/\s+/g,' ').trim();
const lexical=s=>plain(s).replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu,'');
const EXC=/^(?:exceto|salvo|salva|ressalvado|ressalvada|ressalvados|ressalvadas|excetuado|excetuada|excetuados|excetuadas|excepcionalmente)$/u;
const MOD=/^(?:deve|devem|devera|deverao|pode|podem|podera|poderao|vedado|vedada|vedados|vedadas|proibido|proibida|proibidos|proibidas|permitido|permitida|permitidos|permitidas|obrigatorio|obrigatoria|obrigatorios|obrigatorias|constitui|constituem|estabelece|estabelecem|institui|instituem|garante|garantem|assegura|asseguram|autoriza|autorizam|exige|exigem|respondera|responderao|sujeita|sujeitam|caracteriza|configura|consiste|inviolavel|assegurado|assegurada)$/u;
const AGENT=/^(?:orgao|orgaos|autoridade|autoridades|servidor|servidores|administracao|prefeitura|municipio|municipios|uniao|estado|estados|conselho|conselhos|autarquia|autarquias|fundacao|fundacoes|empresa|empresas|juiz|tribunal|profissional|profissionais|engenheiro|engenheiros|interessado|interessada|interessados|interessadas|candidato|candidata|candidatos|empregado|empregador|empregadores|contratante|contratado|contratada|contratados|contratadas|comissao|comissoes|cipa|fiscal|fiscais|presidente|prefeito|prefeita|diretor|diretora|titular|titulares|beneficiario|beneficiarios|pessoa|pessoas|agente|agentes|entidade|entidades|proprietario|proprietarios|empreendedor|empreendedores)$/u;
const ADJ=/^(?:publica|publico|publicos|publicas|competente|competentes|municipal|municipais|estadual|estaduais|federal|federais|responsavel|responsaveis|legal|legais|tecnico|tecnica|ambiental|ambientais|juridica|juridico|fisica|fisico|civil|civis)$/u;
const ARTICLE=/^(?:o|a|os|as|ao|aos|do|da|dos|das|pela|pelo|um|uma)$/u;
const UNIT=/^(?:dia|dias|hora|horas|minuto|minutos|mes|meses|ano|anos|semana|semanas|metro|metros|cm|mm|km|kg|g|m2|m3|reais|salario|salarios|vez|vezes|vagas|graus)$/u;
const number=w=>/^\d+(?:[.,]\d+)?(?:%|º|°)?$/u.test(w);
const EXTENTS=/^(?:zero|um|uma|dois|duas|tres|quatro|cinco|seis|sete|oito|nove|dez|onze|doze|treze|quatorze|catorze|quinze|dezesseis|dezessete|dezoito|dezenove|vinte|trinta|quarenta|cinquenta|sessenta|setenta|oitenta|noventa|cem|cento|mil)$/u;
const STRUCT=/^(?:art|arts|inciso|paragrafo|capitulo|secao|titulo|livro)$/u;
function analyzeWords(tokens){
 if(!Array.isArray(tokens)||!tokens.length||tokens.length>180||
    tokens.some(t=>!t||typeof t.text!=='string'||!Array.isArray(t.rects)||!t.rects.length||
    t.rects.some(r=>!Array.isArray(r)||r.length!==4||!r.every(Number.isFinite))))
  return {segments:[],suggestions:[],review:[],recognized:0,total:0,coverage:0,reason:'Seleção não estruturada'};
 const raw=tokens.map(t=>t.text),w=raw.map(lexical),N=w.length,used=new Array(N).fill(false),proposals=[];
 const eq=(i,...p)=>p.every((x,j)=>w[i+j]===x);
 const dotted=i=>/[;.!?]$/u.test(raw[i])&&!STRUCT.test(w[i]);
 const reference=i=>STRUCT.test(w[i])||/^§/u.test(raw[i])||/^[IVXLCDM]{1,7}[.)-]$/u.test(raw[i]);
 const cue=i=>{
  const x=w[i],y=w[i+1]||'';
  return EXC.test(x)||['quando','mediante','caso','compete','incumbe','cabera'].includes(x)||
   eq(i,'desde','que')||eq(i,'no','prazo')||eq(i,'a','partir','de')||
   eq(i,'na','hipotese','de')||eq(i,'em','caso','de')||
   x==='nao'&&/^(?:pode|podem|podera|poderao|deve|devem|devera|deverao)$/u.test(y);
 };
 function endAt(i,max,{comma=true,stopCue=true}={}){
  const maxEnd=Math.min(N-1,i+max-1);let end=i;
  for(let j=i;j<=maxEnd;j++){
   if(j>i&&(used[j]||stopCue&&cue(j)||reference(j)))break;
   end=j;if(dotted(j)||comma&&/,$/u.test(raw[j])&&j>i)break;
  }
  return end;
 }
 function claim(kind,a,b,confidence,evidence){
  if(a<0||b<a||b>=N||proposals.length>=45)return false;
  while(a<=b&&used[a])a++;
  if(a>b)return false;
  for(let j=a;j<=b;j++)if(used[j]){b=j-1;break}
  if(a>b||b-a>13||a===b&&['condicao','excecao'].includes(kind))return false;
  for(let j=a;j<=b;j++)used[j]=true;
  proposals.push({kind,a,b,confidence,evidence});return true;
 }
 // Exceção requer uma palavra/expressão de ressalva: NUNCA classificar alínea apenas por "(a)".
 for(let i=0;i<N;i++){
  if(used[i])continue;
  if(EXC.test(w[i])){
   if((w[i]==='salvo'||w[i]==='salva')&&/^(?:foi|sera|estava|esta|documento|arquivo|registro|dados|conteudo)$/u.test(w[i-1]||''))continue;
   claim('excecao',i,endAt(i,10,{stopCue:false}),'alta','ressalva expressa');
  }else if(eq(i,'serao','dispensados')||eq(i,'serao','dispensadas')||
   eq(i,'sao','dispensados')||eq(i,'sao','dispensadas')||
   eq(i,'e','dispensavel')&&/^[Éé]$/u.test(raw[i])||
   eq(i,'fica','isento')||eq(i,'fica','isenta')||
   eq(i,'a','menos','que')||eq(i,'fora','dos','casos')||
   eq(i,'nao','se','aplica')||eq(i,'nao','se','aplicam')||
   eq(i,'fica','dispensado')||eq(i,'fica','dispensada')||
   eq(i,'estao','dispensados')||eq(i,'sem','exigencia','de')){
   claim('excecao',i,endAt(i,9,{stopCue:false}),'alta','dispensa ou não aplicação expressa');
  }
 }
 // Condição (azul): prazos, hipóteses, mínimos/máximos e parâmetros de incidência.
 for(let i=0;i<N;i++){
  if(used[i])continue;
  const x=w[i],y=w[i+1]||'';
  let length=0,reason='';
  if(eq(i,'no','prazo','de')||eq(i,'dentro','do','prazo')||
   eq(i,'a','partir','de')||eq(i,'prazo','maximo','de')||
   eq(i,'prazo','minimo','de')||eq(i,'na','hipotese','de')||
   eq(i,'em','caso','de')||eq(i,'sob','condicao','de')){
   length=9;reason='marco, prazo ou hipótese';
  }else if(eq(i,'desde','que')||eq(i,'contanto','que')||
   eq(i,'somente','se')||eq(i,'apenas','se')||
   eq(i,'observado','o')||eq(i,'observada','a')||
   eq(i,'observadas','as')||eq(i,'conforme','previsto')){
   length=8;reason='condição ou observância expressa';
  }else if(['quando','mediante','apos','durante'].includes(x)||
    x==='caso'&&(i===0||/[,;:]$/u.test(raw[i-1]||''))&&
      !(y==='a'&&w[i+2]==='caso')){
   length=8;reason='condição temporal ou requisito';
  }else if(x==='se'&&(i===0||/[,;:]$/u.test(raw[i-1]||''))&&
      /^(?:o|a|os|as)$/u.test(y)){
   length=8;reason='hipótese condicional expressa';
  }else if(x==='se'&&/^(?:houver|existir|forem|for|haja|ocorrer|comprovado|comprovada|atendido|atendida|apresentado|apresentada|decorrido|decorridos|couber|necessario|cumprido|verificada|constatada)$/u.test(y)){
   length=8;reason='hipótese condicional';
  }else if(eq(i,'pelo','menos')||eq(i,'no','minimo')||
   eq(i,'no','maximo')||eq(i,'superior','a')||
   eq(i,'inferior','a')||eq(i,'igual','a')||
   x==='ate'&&number(y)){
   length=6;reason='limite mínimo/máximo';
  }else if((number(x)||EXTENTS.test(x))&&UNIT.test(y)&&!reference(i-1)||
   /^\d+(?:[.,]\d+)?%$/u.test(raw[i])&&!reference(i-1)){
   length=2;reason='prazo, percentual ou quantidade expressa';
  }
  if(length)claim('condicao',i,endAt(i,length),'alta',reason);
 }
 // Sujeito/competência: nomes isolados sem verbo ou relação jurídica exigem revisão.
 for(let i=0;i<N;i++){
  if(used[i])continue;
  if((eq(i,'e','de','competencia')||eq(i,'e','atribuicao'))&&/^[Éé]$/u.test(raw[i])){
   claim('agente',i,Math.min(N-1,i+4+(ADJ.test(w[i+5]||'')?1:0)),'alta','competência ou atribuição expressa');
   continue;
  }
  if(['compete','incumbe','cabera'].includes(w[i])&&/^(?:a|ao|aos|as|o|os)$/u.test(w[i+1]||'')){
   let end=Math.min(N-1,i+2);
   if(ADJ.test(w[end+1]||''))end++;
   claim('agente',i,Math.min(endAt(i,6),end),'alta','competência expressa');
   continue;
  }
  let at=i;if(ARTICLE.test(w[i])&&AGENT.test(w[i+1]||''))at=i+1;
  if(!AGENT.test(w[at]||'')||reference(at))continue;
  let right=at;
  if(ADJ.test(w[at+1]||''))right=at+1;
  else if(w[at+1]==='de'&&ADJ.test(w[at+2]||''))right=at+2;
  const neighborhood=w.slice(Math.max(0,i-3),Math.min(N,right+12));
  const inCommand=neighborhood.some(v=>MOD.test(v)||['compete','incumbe','cabera','direito'].includes(v));
  if(!inCommand)continue;
  claim('agente',i,right,at!==i||right!==at?'alta':'media','agente ou destinatário provável');
 }
 // Comando: preservar "não", e só classificar "é/será" quando o predicado for normativo.
 const predicate=/^(?:facultado|facultada|facultados|facultadas|decidido|decidida|decididos|decididas|aprovado|aprovada|aprovados|aprovadas|revogado|revogada|anulado|anulada|deferido|deferidos|indeferido|indeferidos|indeferida|indeferidas|obrigado|obrigada|obrigados|obrigadas|vedado|vedada|proibido|proibida|permitido|permitida|exigido|exigida|garantido|garantida|instituido|instituida|considerado|considerada|aplicado|aplicada|responsavel)$/u;
 for(let i=0;i<N;i++){
  if(used[i])continue;
  const x=w[i],y=w[i+1]||'';
  let evidence='',confidence='alta';
  if(x==='nao'&&/^(?:pode|podem|podera|poderao|deve|devem|devera|deverao|sera|serao)$/u.test(y))
   evidence='negação obrigatória preservada';
  else if(eq(i,'fica','vedado')||eq(i,'fica','vedada')||
   eq(i,'fica','proibido')||eq(i,'fica','proibida')||
   eq(i,'tera','direito')||eq(i,'terao','direito')||
   eq(i,'tem','direito')||eq(i,'entende-se','por')||
   eq(i,'considera-se')||eq(i,'fica','instituido')||eq(i,'fica','instituida'))
   evidence='regra, proibição ou definição explícita';
  else if(x==='tera'&&/^(?:resposta|validade|efeito|efeitos|prioridade|preferencia|duracao)$/u.test(y)){
   evidence='efeito da norma provável';confidence='media';
  }
  else if(MOD.test(x))evidence='verbo normativo explícito';
  else if(['sera','serao','sao'].includes(x)||x==='e'&&/^[Éé]$/u.test(raw[i])){
   if(predicate.test(y))evidence='predicado normativo explícito';
  }
  if(evidence)claim('regra',i,endAt(i,9),confidence,evidence);
 }
 proposals.sort((a,b)=>a.a-b.a);
 const segments=proposals.slice(0,35).map((p,i)=>{
  const span=tokens.slice(p.a,p.b+1),text=compact(span.map(x=>x.text).join(' '));
  const label=COLORS[p.kind];
  return {kind:p.kind,confidence:p.confidence,evidence:p.evidence,reason:p.evidence,
   requires_review:p.confidence!=='alta',text,
   rects:span.flatMap(x=>x.rects).slice(0,250),
   color:label.color,color_label:label.label,
   anchor:{quote:text,prefix:String(span[0]?.prefix||'').slice(-100),
    suffix:String(span.at(-1)?.suffix||'').slice(0,100)},
   classification_status:'sugestao',classification_kind:p.kind,
   segment_index:i+1,segment_total:Math.min(35,proposals.length)};
 }).filter(x=>x.text&&x.rects.length);
 const review=segments.filter(x=>x.requires_review);
 const recognized=used.filter(Boolean).length;
 return {segments,suggestions:segments,review,recognized,total:N,
   coverage:N?recognized/N:0,
   reason:segments.length?'':'Nenhum núcleo normativo identificado com evidência suficiente'};
}
function classifyWords(tokens){return analyzeWords(tokens).segments}
 const subjects=[
  // Normas reconhecidas pelo número ou nome inequívoco; nenhuma referência
  // vaga a "artigo" ou "parágrafo" atribui lei automaticamente.
  {re:/\b(?:lc\s*95(?:\/1998)?|lei complementar\s*(?:n(?:o|°|º)?\s*)?95|tecnica legislativa)\b/u,discipline:'Legislação geral',topic:'Técnica legislativa',subtopic:'LC 95/1998'},
  {re:/\b(?:constituicao federal|constituicao da republica|art\.?\s*37\s*(?:da\s*)?cf)\b/u,discipline:'Legislação geral',topic:'Constituição Federal',subtopic:'Administração pública e direitos fundamentais'},
  {re:/\b(?:lei\s*(?:n[º°o]?\s*)?8[.\s]?429|improbidade administrativa)\b/u,discipline:'Legislação geral',topic:'Improbidade administrativa',subtopic:'Lei 8.429/1992'},
  {re:/\b(?:lei\s*(?:n[º°o]?\s*)?9[.\s]?784|processo administrativo federal)\b/u,discipline:'Legislação geral',topic:'Processo administrativo',subtopic:'Lei 9.784/1999'},
  {re:/\b(?:lei complementar\s*(?:n[º°o]?\s*)?101|lei de responsabilidade fiscal|lrf\b)/u,discipline:'Legislação geral',topic:'Finanças públicas',subtopic:'LC 101/2000'},
  {re:/\b(?:lei\s*(?:n[º°o]?\s*)?12[.\s]?527|lei de acesso a informacao)\b/u,discipline:'Legislação geral',topic:'Transparência pública',subtopic:'Lei 12.527/2011'},
  {re:/\b(?:lei\s*(?:n[º°o]?\s*)?13[.\s]?709|lei geral de protecao de dados|lgpd\b)/u,discipline:'Legislação geral',topic:'Proteção de dados',subtopic:'LGPD'},
  {re:/\b(?:lei\s*(?:n[º°o]?\s*)?8[.\s]?112|regime juridico unico dos servidores federais)\b/u,discipline:'Legislação geral',topic:'Servidores públicos',subtopic:'Lei 8.112/1990'},
  {re:/\b(?:lei\s*(?:n[º°o]?\s*)?13[.\s]?460|direitos dos usuarios dos servicos publicos)\b/u,discipline:'Legislação geral',topic:'Serviços públicos',subtopic:'Lei 13.460/2017'},
  {re:/\b(?:lei\s*(?:n[º°o]?\s*)?13[.\s]?146|estatuto da pessoa com deficiencia|lei brasileira de inclusao)\b/u,discipline:'Legislação geral',topic:'Acessibilidade e inclusão',subtopic:'Lei 13.146/2015'},
  {re:/\b(?:lei\s*(?:n[º°o]?\s*)?6[.\s]?938|politica nacional do meio ambiente)\b/u,discipline:'Legislação geral',topic:'Meio ambiente',subtopic:'Lei 6.938/1981'},
  {re:/\b(?:lei\s*(?:n[º°o]?\s*)?9[.\s]?605|crimes ambientais)\b/u,discipline:'Legislação geral',topic:'Direito ambiental',subtopic:'Lei 9.605/1998'},
  {re:/\b(?:lei\s*(?:n[º°o]?\s*)?12[.\s]?651|codigo florestal)\b/u,discipline:'Legislação geral',topic:'Proteção da vegetação',subtopic:'Lei 12.651/2012'},
  {re:/\b(?:lei\s*(?:n[º°o]?\s*)?11[.\s]?445|diretrizes nacionais para o saneamento basico)\b/u,discipline:'Engenharia Civil',topic:'Saneamento básico',subtopic:'Lei 11.445/2007'},
  {re:/\b(?:lei\s*(?:n[º°o]?\s*)?12[.\s]?305|politica nacional de residuos solidos)\b/u,discipline:'Engenharia Civil',topic:'Resíduos sólidos',subtopic:'Lei 12.305/2010'},
  {re:/\b(?:nbr[\s-]?9050|acessibilidade a edificacoes)\b/u,discipline:'Engenharia Civil',topic:'Acessibilidade',subtopic:'NBR 9050'},
  {re:/\b(?:nr[\s-]?1\b|gerenciamento de riscos ocupacionais|gro\b)/u,discipline:'Engenharia Civil',topic:'Segurança do trabalho',subtopic:'NR-1'},
  {re:/\b(?:nr[\s-]?17|ergonomia)\b/u,discipline:'Engenharia Civil',topic:'Segurança do trabalho',subtopic:'NR-17'},

  {re:/\b(?:conama|licenciamento ambiental|eia\/?rima|estudo de impacto ambiental)\b/,discipline:'Legislação geral',topic:'Licenciamento ambiental',subtopic:'Resoluções CONAMA'},
  {re:/\b(?:nr[\s-]?18|canteiro de obra|seguranca na construcao)\b/,discipline:'Engenharia Civil',topic:'Segurança do trabalho',subtopic:'NR-18'},
  {re:/\b(?:nr[\s-]?5|cipa)\b/,discipline:'Engenharia Civil',topic:'Segurança do trabalho',subtopic:'NR-5 / CIPA'},
  {re:/\b(?:nr[\s-]?7|pcms o|pcmso)\b/,discipline:'Engenharia Civil',topic:'Segurança do trabalho',subtopic:'NR-7 / PCMSO'},
  {re:/\b(?:nbr[\s-]?6118|concreto armado|estrutura de concreto)\b/,discipline:'Engenharia Civil',topic:'Estruturas de concreto',subtopic:'NBR 6118'},
  {re:/\b(?:nbr[\s-]?6122|estacas?|sapatas?|fundac(?:ao|oes))\b/,discipline:'Engenharia Civil',topic:'Geotecnia e fundações',subtopic:'Fundações'},
  {re:/\b(?:nbr[\s-]?9649|esgoto sanitario|po[cç]o de visita)\b/,discipline:'Engenharia Civil',topic:'Sistemas de esgoto',subtopic:'Redes coletoras'},
  {re:/\b(?:nbr[\s-]?8800|estrutura de aco|estruturas metalicas)\b/,discipline:'Engenharia Civil',topic:'Estruturas de aço',subtopic:'NBR 8800'},
  {re:/\b(?:estatuto da cidade|lei 10257|plano diretor|zoneamento)\b/,discipline:'Legislação geral',topic:'Política urbana',subtopic:'Estatuto da Cidade'},
  {re:/\b(?:lei 14133|licitacao|contratacao publica)\b/,discipline:'Legislação geral',topic:'Licitações e contratos',subtopic:'Lei 14.133/2021'}
 ];
 function suggestSubject(text,documentTitle='',prior={}){
  const source=plain(documentTitle),fragment=plain(text);
  // Títulos dos PDFs são evidência melhor que palavras isoladas comuns.
  const matched=subjects.find(x=>x.re.test(source))||subjects.find(x=>x.re.test(fragment));
  return {
   discipline:String(prior.discipline||matched?.discipline||''),
   topic:String(prior.topic||matched?.topic||''),
   subtopic:String(prior.subtopic||matched?.subtopic||''),
   basis:prior.topic?'classificacao_existente':matched?'termos_detectados':'indefinida',
   status:'sugestao'
  };
 }
 function suggestNote(segment){
  const text=compact(segment?.text||'').slice(0,280);
  const category=segment?.kind||'',normalized=plain(text);
  const limit=normalized.match(/\b\d+(?:[.,]\d+)?\s*(?:dias?|horas?|mes(?:es)?|anos?|semanas?|%|metros?|cm|mm)\b/);
  const actor=normalized.match(/\b(?:orgao(?:\s+ambiental)?|autoridade(?:\s+competente)?|prefeitura|municipio|conselho|engenheiro(?:\s+responsavel)?)\b/);
  let intro;
  if(category==='condicao'){
   intro=limit?'Prazo/limite indicado: '+limit[0]+'. Verificar marco inicial, hipótese e exceções':
    'Identificar o requisito e a situação em que esta condição se aplica';
  }else if(category==='agente'){
   intro=actor?'Sujeito identificado: '+actor[0]+'. Conferir competência e alcance':'Identificar quem decide, autoriza ou é alcançado pela norma';
  }else if(category==='excecao'){
   intro='Exceção ou ressalva: identificar a regra afastada e sua extensão';
  }else if(category==='regra'){
   intro='Regra principal: identificar obrigação, proibição, permissão ou direito; preservar negações e alcance';
  }else intro='Trecho sem classificação segura; revisar a fonte antes de atribuir cor e assunto';
  return {text:intro+(text?'. Trecho-fonte: “'+text+'”':''),status:'sugestao_nao_confirmada'};
 }
 window.BancoMestreClassificadorV070={COLORS,analyzeWords,classifyWords,suggestSubject,suggestNote,plain};
})();

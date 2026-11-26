/* V315 IIFE 88–99 order preserved */

;
/* 88 assets/v196_abas_recolhidas.js */
/* Banco Mestre V196 — abas informativas recolhidas em todos os cartões.
 * Apenas comportamento visual: não modifica respostas, armazenamento, Drive ou SRS.
 * Abas abertas pelo estudante permanecem abertas até ele fechar ou trocar de cartão.
 */
(function BancoMestreV196AbasRecolhidas(){
 'use strict';
 if(window.BM196AbasRecolhidas)return;
 const seen=new WeakSet();
 const isDetails=node=>node&&node.nodeType===1&&node.tagName==='DETAILS';
 const childrenDetails=node=>{
  if(!node||node.nodeType!==1)return [];
  return (isDetails(node)?[node]:[]).concat(Array.from(node.querySelectorAll('details')));
 };
 // A resposta evolutiva é o conteúdo principal, NÃO uma aba informativa.
 // A abertura manual da resposta na grade também não deve ser desfeita.
 const isMainAnswer=d=>isDetails(d)&&(
  d.classList.contains('bm194-public-layers')||
  d.parentElement?.matches?.('article.card')
 );
 function closeAll(root){
  for(const d of childrenDetails(root)){seen.add(d);if(!isMainAnswer(d)&&d.open)d.open=false;}
 }
 function closeNew(root){
  for(const d of childrenDetails(root)){
   if(seen.has(d))continue;
   seen.add(d);
   if(!isMainAnswer(d)&&d.open)d.open=false;
  }
 }
 function accordion(event){
  const current=event.target;
  if(!isDetails(current)||!current.open||isMainAnswer(current))return;
  const parent=current.parentElement;
  if(!parent)return;
  // Apenas abas irmãs. Nunca fecha a seção ancestral de uma subaba interna.
  for(const sibling of parent.children){
   if(sibling!==current&&isDetails(sibling)&&!isMainAnswer(sibling)&&sibling.open)sibling.open=false;
  }
 }
 function mount(){
  const modal=document.getElementById('bmCardPeekV050');
  const rows=document.getElementById('cardRows');
  if(!modal||!rows)return false;
  const answer=modal.querySelector('.bm-v050-peek-answer');
  if(!answer)return false;
  let previousKey='';
  function resetOnCardChange(){
   const currentId=window.BancoMestreVisualizarCardV050?.currentId||'';
   const key=(modal.hidden?'fechado:':'aberto:')+currentId;
   if(previousKey===key)return;
   previousKey=key;
   // Gabarito e lei seca seguem o fluxo original: só fecha DETAILS informativos.
   if(!modal.hidden){
    closeAll(answer);
    closeAll(modal.querySelector('#bm195Discursive'));
   }
  }
  closeAll(answer);
  closeAll(modal.querySelector('#bm195Discursive'));
  for(const article of rows.querySelectorAll('article.card'))closeAll(article);
  // Abas que um renderizador criou abertas são fechadas somente na primeira inserção.
  // Não observa o atributo open, preservando o clique voluntário do estudante.
  const addObserver=new MutationObserver(records=>{
   for(const record of records){
    for(const n of record.addedNodes){
     if(n.nodeType!==1)continue;
     if(n.closest?.('#bmCardPeekV050')||n.closest?.('article.card')||
        n.querySelector?.('article.card')||n.querySelector?.('details'))closeNew(n);
    }
   }
  });
  addObserver.observe(answer,{childList:true,subtree:true});
  addObserver.observe(rows,{childList:true,subtree:true});
  const observer=new MutationObserver(resetOnCardChange);
  observer.observe(modal,{attributes:true,attributeFilter:['hidden']});
  const title=modal.querySelector('#bmCardPeekTitleV050');
  if(title)observer.observe(title,{childList:true,characterData:true,subtree:true});
  modal.addEventListener('toggle',accordion,true);
  rows.addEventListener('toggle',event=>{
   if(event.target.closest?.('article.card'))accordion(event);
  },true);
  resetOnCardChange();
  window.BM196AbasRecolhidas=Object.freeze({
   version:'V196',status:'abas informativas recolhidas; resposta evolutiva visível',scope:'apresentação',
   preserveSRS:true
  });
  return true;
 }
 if(!mount()){
  const wait=new MutationObserver(()=>{
   if(mount())wait.disconnect();
  });
  wait.observe(document.documentElement,{childList:true,subtree:true});
 }
})();

;
/* 89 assets/v209_image_links_single.js */
/* Banco Mestre V209 — editor unificado por abas com um botão visível por imagem (catálogo editorial V198) de imagem e vínculo explícito com cartão.
 * Independente da classificação temática V180. Sem alterar SRS, originais ou Drive.
 * Dados locais exportáveis/importáveis por ID estável; importação exige ação do titular.
 */
(function(){
'use strict';
if(window.BM197MediaLinks)return;
const STORAGE='BM197_IMAGENS_TIPO_VINCULOS_V1';
const CANONICAL_SOURCE='assets/v198_editorial_images_catalog.json?v=198';
let canonicalRecords=new Map(),canonicalReady=false;
const SCHEMA='BancoMestreMediaCardLinksV1';
const VALID_CARD=/^(?:CARD-\d{4,}|PROP-IJUI-\d+|TRT0[12]-C\d{3}|IJUI-[A-Z0-9_-]+)$/i;
const VALID_REF=/^(?:CARD-\d{4,}|PROP-IJUI-\d+|TRT0[12]-C\d{3}|IJUI-[A-Z0-9_-]+|PETRO\d+-C\d{3})$/i;
const VALID_IMAGE=/^(?:IMG-[A-Z0-9_-]+|DRIVE-IMG-[A-Z0-9_-]{15,})$/i;
const $=id=>document.getElementById(id);
let saved=Object.create(null),filter='todas';
let message=null;
function say(s,error=false){if(message){message.textContent=s;message.style.color=error?'#9a382f':'#456b65';}}
function make(tag,txt,cls){const n=document.createElement(tag);if(txt!==undefined&&txt!==null)n.textContent=txt;if(cls)n.className=cls;return n;}
function validItem(id,x){
 if(!VALID_IMAGE.test(id)||id.length>100||!x||!['conteudo','cartao'].includes(x.type))return false;
 if(!Array.isArray(x.cardIds)||x.cardIds.length>40||x.cardIds.some(v=>typeof v!=='string'||!VALID_REF.test(v)))return false;
 if(!['','enunciado','figura','explicacao'].includes(x.subtype||''))return false;
 return true;
}
function load(){
 try{
  const x=JSON.parse(localStorage.getItem(STORAGE)||'{}');
  if(!x||typeof x!=='object'||Array.isArray(x))return;
  for(const [id,value] of Object.entries(x))if(validItem(id,value))saved[id]=value;
 }catch(err){console.warn('Classificação local indisponível:',err);}
}
load();
function persist(next){
 try{localStorage.setItem(STORAGE,JSON.stringify(next));saved=next;window.dispatchEvent(new Event('bm197-links-changed'));return true;}
 catch(err){say('Falha ao gravar classificação: '+err.message,true);return false;}
}
function sourceIds(x){
 return Array.isArray(x?.cards)?[...new Set(x.cards.filter(v=>typeof v==='string'&&VALID_REF.test(v)))].slice(0,40):[];
}
function dataOf(id,x){
 const override=saved[id];
 if(override)return {type:override.type,subtype:override.subtype||'',cardIds:override.cardIds||[],origin:'local'};
 const official=canonicalRecords.get(id);
 if(official)return {type:official.type,subtype:official.subtype||'',cardIds:official.cardIds||[],origin:official.basis==='associacao_documental_existente'?'documentado':official.type==='conteudo'?'catalogo_conteudo':'curadoria',evidence:official.evidence||'',basis:official.basis||''};
 const refs=sourceIds(x);
 return {type:refs.length?'cartao':'conteudo',subtype:refs.length?'explicacao':'',cardIds:refs,origin:refs.length?'documentado':'conteudo_sem_vinculo'};
}
function matchType(d){
 return filter==='todas'||(filter==='pendente'?d.type==='pendente':d.type===filter);
}
function matches(x){return matchType(dataOf(x.no,x));}
function matchesDrive(file){return matchType(dataOf('DRIVE-IMG-'+file.id,null));}
function rerender(){
 if(typeof imgRender==='function'&&typeof imgs!=='undefined'&&Array.isArray(imgs)&&imgs.length)void imgRender();
 else if(typeof loadImages==='function'&&$('imagens')?.classList.contains('active'))void loadImages();
 const search=$('bm084-search');if(search)search.dispatchEvent(new Event('input',{bubbles:false}));
}
function parseRefs(text){
 const ids=[...new Set(String(text).split(/[\s,;]+/).map(x=>x.trim().toUpperCase()).filter(Boolean))];
 if(ids.length>40)throw Error('Limite de 40 IDs por imagem.');
 const invalid=ids.filter(x=>!VALID_REF.test(x));
 if(invalid.length)throw Error('ID inválido: '+invalid.slice(0,3).join(', ')+'. Consulte o ID exato do cartão.');
 return ids;
}
async function openCard(id,feedback){
 if(!VALID_CARD.test(id)){
  feedback.textContent='Referência histórica '+id+' ainda sem cartão navegável com esse ID.';return;
 }
 try{
  if(typeof section==='function')section('cartoes');
  if(typeof loadCards==='function')await loadCards();
  const ok=window.BM165CardsNavigation?.open?.(id)||
            window.BancoMestreVisualizarCardV050?.showId?.(id);
  if(!ok){
   if(typeof section==='function')section('imagens');
   feedback.textContent='O cartão '+id+' não foi localizado no leitor público. Vínculo preservado para conferência.';
  }
 }catch(err){feedback.textContent='Não foi possível abrir '+id+': '+err.message;}
}
let activeEditor=null;
function closeEditor(){
 if(!activeEditor)return;
 const dialog=activeEditor;activeEditor=null;
 if(dialog.open&&typeof dialog.close==='function')dialog.close();
 dialog.remove();
}
/* V206: a imagem fica à esquerda do formulário. Reutiliza a miniatura do cartão.
 * Acompanha carregamentos tardios (thumb assíncrono / Drive OAuth) e preserva URLs exatas.
 */
function mountImagePreview(host,card,id,lifecycle){
 const frame=make('figure',null,'bm204-editor-preview');
 const visual=make('img');visual.alt='Prévia da imagem '+id;visual.loading='eager';visual.decoding='async';
 const caption=make('figcaption','Carregando prévia…','bm204-preview-state');caption.setAttribute('role','status');
 const origin=card?.querySelector('img.thumb, img')||null;
 visual.addEventListener('load',()=>{caption.hidden=true;});
 visual.addEventListener('error',()=>{caption.hidden=false;caption.textContent='Prévia indisponível nesta sessão; imagem original preservada.';visual.removeAttribute('src');});
 frame.append(visual,caption);host.append(frame);
 if(!origin){caption.textContent='Prévia não encontrada neste cartão.';return frame;}
 const sync=()=>{
  const next=origin.currentSrc||origin.getAttribute('src')||'';
  if(!next)return;
  if(visual.getAttribute('src')!==next){caption.hidden=false;caption.textContent='Carregando prévia…';visual.src=next;}
 };
 origin.addEventListener('load',sync);
 const observer=new MutationObserver(sync);
 observer.observe(origin,{attributes:true,attributeFilter:['src','srcset']});
 (lifecycle||host).addEventListener('close',()=>{origin.removeEventListener('load',sync);observer.disconnect();},{once:true});
 sync();
 return frame;
}

/* Editor reutilizável: nos cartões públicos vive dentro da janela principal; no Drive abre janela própria. */
function mountEditorForm(host,id,source,onSaved){
 const d=dataOf(id,source);
 const provenance=make('p',d.origin==='documentado'?'Vínculo documentado no catálogo':d.origin==='local'?'Ajuste manual neste navegador':d.origin==='curadoria'?'Associação didática V198':d.origin==='catalogo_conteudo'?'Conteúdo · auditoria V198':'Aguardando classificação','bm197-origin');
 host.append(provenance);
 if(d.evidence)host.append(make('small',d.evidence,'bm203-editor-evidence'));
 const form=make('form',null,'bm203-link-form');
 const fields=make('div',null,'bm197-fields');
 const kindLabel=make('label','Tipo');
 const kind=make('select');kind.setAttribute('aria-label','Tipo de '+id);
 [['pendente','Restaurar definição do catálogo'],['conteudo','Imagem de conteúdo'],['cartao','Imagem de cartão']].forEach(([v,label])=>kind.add(new Option(label,v)));
 kind.value=d.type==='pendente'?'pendente':d.type;kindLabel.append(kind);
 const roleLabel=make('label','Função no cartão');
 const role=make('select');role.setAttribute('aria-label','Função no cartão '+id);
 [['','Não especificada'],['enunciado','Enunciado original'],['figura','Figura da questão'],['explicacao','Explicação ou resolução']].forEach(([v,label])=>role.add(new Option(label,v)));
 role.value=d.subtype||'';roleLabel.append(role);
 const idsLabel=make('label','IDs dos cartões vinculados');
 const ids=make('input');ids.type='text';ids.value=d.cardIds.join(', ');ids.maxLength=1200;
 ids.placeholder='CARD-0001, CARD-0002';ids.setAttribute('aria-label','IDs dos cartões de '+id);idsLabel.append(ids);
 const adjust=()=>{role.disabled=kind.value!=='cartao';ids.disabled=kind.value!=='cartao'};
 kind.addEventListener('change',adjust);adjust();
 fields.append(kindLabel,roleLabel,idsLabel);
 const feedback=make('p','','bm197-feedback');feedback.setAttribute('role','status');feedback.setAttribute('aria-live','polite');
 const actions=make('div',null,'bm202-modal-actions');
 const save=make('button','Salvar classificação e vínculos','primary');save.type='submit';actions.append(save);
 form.append(fields,feedback,actions);
 form.addEventListener('submit',e=>{
  e.preventDefault();e.stopPropagation();feedback.textContent='';
  try{
   if(kind.value==='pendente'){
    const next=Object.assign(Object.create(null),saved);delete next[id];
    if(persist(next)){
     say('Ajuste local de '+id+' retirado; classificação oficial preservada.');
     if(typeof onSaved==='function')onSaved();
     rerender();
    }
    return;
   }
   const refs=kind.value==='cartao'?parseRefs(ids.value):[];
   const entry={type:kind.value,subtype:kind.value==='cartao'?role.value:'',cardIds:refs,updatedAt:new Date().toISOString()};
   if(!validItem(id,entry))throw Error('Classificação inválida.');
   const next=Object.assign(Object.create(null),saved,{[id]:entry});
   if(persist(next)){
    say('Classificação de '+id+' salva neste navegador. Inclua o JSON no próximo checkpoint.');
    if(typeof onSaved==='function')onSaved();
    rerender();
   }
  }catch(err){feedback.textContent=err.message;}
 });
 host.append(form);
 return form;
}
function openEditorDialog(id,source,trigger){
 closeEditor();
 const dialog=make('dialog',null,'bm202-image-dialog bm206-editor-dialog');
 dialog.id='bm203-image-dialog';
 dialog.setAttribute('aria-labelledby','bm203-image-dialog-title');
 const head=make('div',null,'bm202-dialog-heading');
 const title=make('h2','Editar imagem · '+id);title.id='bm203-image-dialog-title';
 const close=make('button','Fechar ✕','bm202-modal-close');close.type='button';close.setAttribute('aria-label','Fechar edição');
 close.addEventListener('click',closeEditor);
 head.append(title,close);dialog.append(head);
 const layout=make('div',null,'bm206-editor-layout');
 const visual=make('div',null,'bm206-editor-visual');
 const fields=make('div',null,'bm206-editor-fields');
 mountImagePreview(visual,trigger?.closest('article'),id,dialog);
 mountEditorForm(fields,id,source,closeEditor);
 layout.append(visual,fields);dialog.append(layout);
 dialog.addEventListener('close',()=>{if(activeEditor===dialog)activeEditor=null;dialog.remove();if(trigger?.isConnected)trigger.focus();});
 document.body.append(dialog);activeEditor=dialog;
 if(typeof dialog.showModal==='function')dialog.showModal();else dialog.setAttribute('open','');
 const field=dialog.querySelector('select');if(field)field.focus();
}
function decorateUI(card,id,source){
 if(card.querySelector('.bm202-image-actions'))return;
 const d=dataOf(id,source);
 const existing=card.querySelector('.bm-v060-edit-card');
 const wrap=make('div',null,'bm202-image-actions');
 const feedback=make('span','','bm202-card-status');feedback.setAttribute('role','status');
 /* Atlas público: já possui Editar imagem; não inserir um segundo botão.
    Drive privado: não há editor de metadados Atlas, então mantém um único editor de classificação. */
 if(!existing){
  const editable=make('button','Editar imagem','bm202-edit-image');editable.type='button';
  editable.title='Abrir janela para editar tipo e cartões vinculados';
  editable.setAttribute('aria-label','Editar tipo e vínculos da imagem '+id);
  editable.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();openEditorDialog(id,source,editable)});
  wrap.append(editable);
 }
 const usable=d.cardIds.filter(x=>VALID_CARD.test(x));
 for(const cardId of usable){
  const button=make('button',usable.length===1?'Mostrar cartão':'Mostrar '+cardId,'bm197-open-card');button.type='button';
  button.title='Abrir '+cardId+' no leitor';
  button.setAttribute('aria-label','Mostrar cartão '+cardId+' relacionado à imagem '+id);
  button.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();void openCard(cardId,feedback)});
  wrap.append(button);
 }
 wrap.append(feedback);card.append(wrap);
}
function decorate(card,x){if(!x?.no)return;decorateUI(card,x.no,x);}
function decorateDrive(card,file){if(!file?.id)return;decorateUI(card,'DRIVE-IMG-'+file.id,null);}
function openManageDialog(trigger){
 closeEditor();
 const dialog=make('dialog',null,'bm202-image-dialog');
 dialog.setAttribute('aria-label','Gerenciar classificações e checkpoints de imagens');
 const header=make('div',null,'bm202-dialog-heading');
 const heading=make('h2','Gerenciar classificações e checkpoints');
 const exit=make('button','Fechar ✕','bm202-modal-close');exit.type='button';exit.addEventListener('click',closeEditor);
 header.append(heading,exit);dialog.append(header);
 dialog.append(make('p','Exporte os ajustes locais e inclua o JSON no checkpoint oficial do Drive. Importar afeta somente este navegador. O Drive e o catálogo publicado não são sobrescritos.','bm202-dialog-note'));
 const exportBtn=make('button','Exportar JSON para checkpoint');exportBtn.type='button';exportBtn.addEventListener('click',exportJson);
 const label=make('label','Importar JSON de um checkpoint','bm202-import');
 const inp=make('input');inp.type='file';inp.accept='.json,application/json';
 inp.addEventListener('change',()=>{void importJson(inp.files?.[0]);inp.value='';});
 label.append(inp);dialog.append(exportBtn,label);
 dialog.addEventListener('close',()=>{if(activeEditor===dialog)activeEditor=null;dialog.remove();if(trigger?.isConnected)trigger.focus();});
 document.body.append(dialog);activeEditor=dialog;
 if(typeof dialog.showModal==='function')dialog.showModal();else dialog.setAttribute('open','');
}
function exportJson(){
 const records=Object.entries(saved).sort(([a],[b])=>a.localeCompare(b,'pt-BR')).map(([imageId,x])=>({imageId,...x}));
 const pack={schema:SCHEMA,version:1,createdAt:new Date().toISOString(),scope:'classificacoes_e_vinculos_locais_apenas',count:records.length,records};
 const blob=new Blob([JSON.stringify(pack,null,2)+'\n'],{type:'application/json'});
 const url=URL.createObjectURL(blob);
 const a=make('a');a.href=url;a.download='BANCO_MESTRE_IMAGENS_TIPOS_VINCULOS_CHECKPOINT_'+new Date().toISOString().slice(0,10)+'.json';
 document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1500);
 say('Backup gerado: '+records.length+' classificações locais. Inclua o arquivo no checkpoint; o Drive não foi alterado.');
}
async function importJson(file){
 if(!file)return;
 if(file.size>1024*1024){say('Arquivo excede 1 MB.',true);return;}
 try{
  const obj=JSON.parse(await file.text());
  if(obj?.schema!==SCHEMA||obj.version!==1||!Array.isArray(obj.records)||obj.records.length>10000||obj.count!==obj.records.length)throw Error('Arquivo ou versão de checkpoint inválida.');
  const next=Object.assign(Object.create(null),saved),seen=new Set();
  let conflicts=0;
  for(const item of obj.records){
   if(!item||typeof item.imageId!=='string'||seen.has(item.imageId)||!validItem(item.imageId,item))throw Error('Imagem repetida, tipo ou vínculo inválido no arquivo.');
   seen.add(item.imageId);
   if(saved[item.imageId]&&JSON.stringify(saved[item.imageId])!==JSON.stringify({type:item.type,subtype:item.subtype||'',cardIds:item.cardIds,updatedAt:item.updatedAt}))conflicts++;
   next[item.imageId]={type:item.type,subtype:item.subtype||'',cardIds:item.cardIds,updatedAt:item.updatedAt||new Date().toISOString()};
  }
  if(conflicts&&!confirm('A importação substituirá '+conflicts+' registros locais de classificação. Confirma?')){say('Importação cancelada; registros preservados.');return;}
  if(persist(next)){say('Importação concluída: '+obj.records.length+' registros examinados; '+Object.keys(saved).length+' classificações locais.');rerender();}
 }catch(err){say('Importação recusada: '+err.message,true);}
}
/* Navegação reversa: cartão -> imagens explicitamente relacionadas. */
let sourcePromise=null;
function sourceRecords(){
 if(!sourcePromise)sourcePromise=fetch('assets/v180_native_image_additions.json?v=180',{cache:'default'})
  .then(r=>{if(!r.ok)throw Error('Catálogo recuperado indisponível');return r.json();})
  .then(d=>d.schema==='BancoMestreNativeImageAdditionsV180'&&Array.isArray(d.records)?d.records:[])
  .catch(e=>{console.warn('Associações históricas de imagens:',e);return []});
 return sourcePromise;
}
function imageEntries(cardId,source){
 const byId=new Map();
 for(const x of source){
  if(!x.no||!VALID_IMAGE.test(x.no))continue;
  const rel=dataOf(x.no,x);
  if(rel.cardIds.includes(cardId))byId.set(x.no,{id:x.no,title:String(x.studyTitle||x.title||x.no).slice(0,130)});
 }
 if(typeof imgs!=='undefined'&&Array.isArray(imgs)){
  for(const x of imgs){
   if(!x.no||!VALID_IMAGE.test(x.no))continue;
   const rel=dataOf(x.no,x);
   if(rel.cardIds.includes(cardId))byId.set(x.no,{id:x.no,title:String(x.studyTitle||x.title||x.no).slice(0,130)});
   else byId.delete(x.no);
  }
 }
 for(const [id,rec] of Object.entries(saved)){
  if(rec.cardIds.includes(cardId)&&!byId.has(id))byId.set(id,{id,title:id});
  else if(!rec.cardIds.includes(cardId))byId.delete(id);
 }
 return [...byId.values()].sort((a,b)=>a.id.localeCompare(b.id,'pt-BR'));
}
async function goToImage(imageId){
 window.BancoMestreVisualizarCardV050?.close?.();
 filter='todas';if($('bm197-type-filter'))$('bm197-type-filter').value='todas';
 if(typeof section==='function')section('imagens');
 if(imageId.startsWith('DRIVE-IMG-')){
  const q=$('imageSearch');if(q){q.value=imageId;q.dispatchEvent(new Event('input',{bubbles:true}));}
 }else{
  if(typeof loadImages==='function')await loadImages();
  const q=$('imageSearch');if(q){q.value=imageId;q.dispatchEvent(new Event('input',{bubbles:true}));}
 }
}
function initReverse(){
 const root=$('bmCardPeekV050'),scroller=root?.querySelector('.bm163-scroll');
 const title=$('bmCardPeekTitleV050');
 if(!scroller||!title||$('bm197-related-images'))return;
 const panel=make('div',null,'bm197-related-images');panel.id='bm197-related-images';
 const h=make('strong','Imagens relacionadas ao cartão');
 const body=make('div',null,'bm197-related-image-list');
 panel.append(h,body);scroller.append(panel);
 panel.hidden=true;
 let seq=0;
 async function refreshReverse(){
  const id=window.BancoMestreVisualizarCardV050?.currentId||'';
  const token=++seq;
  if(!VALID_CARD.test(id)){panel.hidden=true;return;}
  const records=await sourceRecords();
  if(token!==seq)return;
  const matches=imageEntries(id,records);
  body.replaceChildren();
  panel.hidden=!matches.length;
  for(const x of matches){
   const btn=make('button',x.id+' · '+x.title);btn.type='button';
   btn.className='bm197-reverse-link';
   btn.addEventListener('click',()=>{void goToImage(x.id)});
   body.append(btn);
  }
 }
 new MutationObserver(()=>{void refreshReverse()}).observe(title,{childList:true,characterData:true,subtree:true});
 window.addEventListener('bm197-links-changed',()=>{void refreshReverse()});
 const css=make('style');css.textContent=[
  '#bm197-related-images{margin:12px 0;padding:11px;border:1px solid #c9dedb;border-radius:10px;background:#f7fbfa}',
  '#bm197-related-images strong{display:block;font-size:13px;margin-bottom:8px}',
  '#bm197-related-images .bm197-related-image-list{display:grid;gap:6px}',
  '#bm197-related-images button{font-size:12px;text-align:left;white-space:normal;overflow-wrap:anywhere;border-radius:7px;padding:8px 10px}'
 ].join('\n');document.head.append(css);
 if(window.BancoMestreVisualizarCardV050?.currentId)void refreshReverse();
}

async function loadCanonical(){
 try{
  const response=await fetch(CANONICAL_SOURCE,{cache:'no-store'});
  if(!response.ok)throw Error('Catálogo editorial V198 não disponível (HTTP '+response.status+')');
  const data=await response.json();
  if(data.schema!=='BancoMestreImageEditorialCatalogV198'||data.counts?.total!==179||!Array.isArray(data.records)||data.records.length!==179)throw Error('Catálogo editorial inválido ou incompleto');
  const map=new Map();
  for(const record of data.records){
   if(!VALID_IMAGE.test(record.imageId)||map.has(record.imageId)||!validItem(record.imageId,record))throw Error('Tipo editorial/ID inválido em '+record.imageId);
   map.set(record.imageId,record);
  }
  canonicalRecords=map;canonicalReady=true;
  say('Catálogo editorial V198 carregado: '+data.counts.cartao+' imagens de cartão, '+data.counts.conteudo+' de conteúdo; '+Object.keys(saved).length+' ajuste(s) deste navegador. Exportar JSON inclui apenas ajustes manuais.');
  rerender();
 }catch(err){say('Catálogo V198 indisponível: '+err.message+'. Classificação anterior preservada.',true);console.warn('Catálogo editorial V198:',err);}
}
function init(){
 const root=$('imagens'),parent=root?.querySelector('.panel');
 if(!parent||$('bm197-classification-controls'))return;
 const area=make('div',null,'bm197-controls');area.id='bm197-classification-controls';
 const h=make('h3','Classificação editorial: Conteúdo × Cartão');
 const help=make('p','Os cartões de imagem exibem somente os botões Mostrar cartão e Editar imagem. Títulos, textos, tipo e vínculos são editados em janelas próprias; a classificação por assunto permanece separada.');
 const toolbar=make('div',null,'bm197-toolbar');
 const label=make('label','Mostrar');
 const choose=make('select');choose.id='bm197-type-filter';choose.setAttribute('aria-label','Filtrar imagens por tipo editorial');
 [['todas','Todos os tipos'],['conteudo','Imagens de conteúdo'],['cartao','Imagens de cartão'],['pendente','A classificar']].forEach(([v,t])=>choose.add(new Option(t,v)));
 choose.value=filter;label.append(choose);
 choose.addEventListener('change',()=>{filter=choose.value;rerender();});
 const manage=make('button','Gerenciar classificações');manage.type='button';manage.addEventListener('click',()=>openManageDialog(manage));
 toolbar.append(label,manage);
 message=make('p','O catálogo V198 é a referência publicada. Alterações manuais só entram em outros dispositivos depois de exportar e importar o JSON de checkpoint.','bm197-message');
 message.setAttribute('role','status');message.setAttribute('aria-live','polite');
 area.append(h,help,toolbar,message);
 const anchor=$('bm153Directory')||$('imageIndexV044')||$('imageRows');
 anchor.before(area);
 const css=make('style');css.textContent=[
  '#imagens .bm197-controls{border:1px solid #c5d8d5;background:#f8fbfa;border-radius:12px;padding:13px;margin:12px 0}',
  '#imagens .bm197-controls h3{margin:0 0 4px;font-size:16px}',
  '#imagens .bm197-controls p{font-size:12px;color:#516b70;margin:4px 0 10px}',
  '#imagens .bm197-toolbar,#imagens .bm197-actions,#imagens .bm197-card-links{display:flex;align-items:center;flex-wrap:wrap;gap:8px}',
  '#imagens .bm197-toolbar label{font-size:12px;font-weight:700}',
  '#imagens .bm197-toolbar select{margin-left:7px;max-width:235px}',
  '#imagens .bm197-import-label{display:inline-flex;align-items:center;gap:7px;padding:8px 12px;background:#fff;border:1px solid #bbcfcc;border-radius:8px;cursor:pointer}',
  '#imagens .bm197-import-label input{max-width:190px;font-size:11px;font-weight:400}',
  '#imagens .bm197-editor{border-top:1px solid #d3e2df;margin-top:12px;padding-top:10px;display:grid;gap:7px}',
  '#imagens .bm197-editor-head{display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap}',
  '#imagens .bm197-editor-head strong{font-size:12px}',
  '#imagens .bm197-origin,#imagens .bm197-feedback,#imagens .bm197-pending{font-size:11px;color:#5c7779}',
  '#imagens .bm197-fields{display:grid;gap:7px}',
  '#imagens .bm197-fields label{display:flex;flex-direction:column;gap:3px;font-size:11px;font-weight:700}',
  '#imagens .bm197-fields select,#imagens .bm197-fields input{width:100%;min-width:0;max-width:100%;padding:7px;border:1px solid #b6cecc;border-radius:7px;background:white;font-size:12px;font-weight:400}',
  '#imagens .bm197-editor button{font-size:11px;padding:7px 9px;white-space:normal}',
  '#imagens .bm197-open-card{border-color:#80b4ae;background:#ecf6f3;color:#145d5b}',
  '@media(max-width:680px){#imagens .bm197-toolbar{align-items:stretch;flex-direction:column}#imagens .bm197-toolbar label{display:flex;flex-direction:column;gap:4px}#imagens .bm197-toolbar select{margin-left:0;max-width:none}}'
 ].join('\n');
 document.head.append(css);
}
init();
initReverse();
window.BM197MediaLinks=Object.freeze({matches,matchesDrive,decorate,decorateDrive,openEditor:openEditorDialog,mountEditorForm,mountImagePreview,exportJson,filterActive:()=>filter!=='todas',get catalogReady(){return canonicalReady;},get catalogSize(){return canonicalRecords.size;},get:(imageId)=>dataOf(imageId,typeof imgs!=='undefined'?imgs.find(x=>x.no===imageId):null)});
void loadCanonical();
})();

;
/* 90 assets/v228_drive_image_editor.js */
/* V228 — editor de imagem Drive restaurado: previa, dados, tipo/cartoes, arquivo e checkpoint.
   Imagens originais e SRS intocados. Edicoes de texto ficam no navegador. */
(function(){
'use strict';
if(window.BM228DriveImageEditor)return;
const KEY='BM228_DRIVE_IMAGE_INFO_V1',FORMAT='BancoMestreDriveImageInfoV1';
const FIELDS={title:160,area:120,subject:180,subsubject:180,detail:180,description:4000,note:2500};
const VALID=/^[A-Za-z0-9_-]{15,}$/,$=id=>document.getElementById(id);
const el=(tag,cls,text)=>{const v=document.createElement(tag);if(cls)v.className=cls;if(text!=null)v.textContent=text;return v;};
let saved=Object.create(null),current=null;
function valid(id,entry){return VALID.test(id)&&entry&&typeof entry==='object'&&!Array.isArray(entry)&&Object.entries(FIELDS).every(([k,n])=>entry[k]===undefined||(typeof entry[k]==='string'&&entry[k].length<=n));}
function load(){try{const x=JSON.parse(localStorage.getItem(KEY)||'{}');if(x&&typeof x==='object'&&!Array.isArray(x))for(const [id,v] of Object.entries(x))if(valid(id,v))saved[id]=v;}catch(err){console.warn('Metadados locais de imagens:',err);}}
load();
const legacyByDrive=new Map();
let legacyTitles={},legacyFields={};
try{legacyTitles=JSON.parse(localStorage.getItem('BM055_ATLAS_CUSTOM_TITLES')||'{}')||{};}catch(_){}
try{legacyFields=JSON.parse(localStorage.getItem('BM060_ATLAS_CARD_FIELDS')||'{}')||{};}catch(_){}
function previousEdit(fileId){
 const id=legacyByDrive.get(fileId);
 if(!id)return {};
 const fields=legacyFields[id]||{};
 return {title:legacyTitles[id]||'',area:fields.area||'',subject:fields.subject||'',
  description:fields.description||'',note:fields.note||''};
}
void fetch('assets/v211_published_images.json?v=211',{cache:'no-store'}).then(r=>{
 if(!r.ok)throw Error('Índice legado indisponível');
 return r.json();
}).then(catalog=>{
 for(const row of catalog.records||[])
  if(typeof row.driveFileId==='string'&&typeof row.imageId==='string')legacyByDrive.set(row.driveFileId,row.imageId);
 $('bm084-search')?.dispatchEvent(new Event('input'));
}).catch(e=>console.warn('Migração visual de edições anteriores:',e.message));
function base(file){return window.BM218ImageMetadata?.resolve?.(file)||{displayTitle:file.name||'Imagem sem título descritivo',fileName:file.name||'',area:'',subject:'',subsubject:'',classified:false,cards:[]};}
function meta(file){
 const x=base(file),e=saved[file.id]||{},previous=previousEdit(file.id);
 const get=(k,original)=>Object.prototype.hasOwnProperty.call(e,k)?e[k]:(previous[k]||original||'');
 const subject=get('subject',x.subject);
 return {...x,displayTitle:get('title',x.displayTitle)||'Imagem sem título descritivo',
  area:get('area',x.area),subject,subsubject:get('subsubject',x.subsubject),detail:get('detail',''),
  description:get('description',''),note:get('note',''),classified:Boolean(subject),
  classificationOrigin:saved[file.id]?'Edição manual neste navegador':legacyByDrive.has(file.id)&&(legacyTitles[legacyByDrive.get(file.id)]||legacyFields[legacyByDrive.get(file.id)])?'Edição anterior recuperada':x.classified?'Catálogo editorial':'Pendente',
  fileName:x.fileName||file.name||'',editedLocally:Boolean(saved[file.id])};
}
function update(fileId){
 window.dispatchEvent(new CustomEvent('bm228-image-info-changed',{detail:{fileId}}));
 $('bm084-search')?.dispatchEvent(new Event('input'));
}
function persist(fileId,entry){
 if(!valid(fileId,entry))throw Error('Campos de imagem inválidos.');
 if(Object.keys(saved).length>1500&&!saved[fileId])throw Error('Limite de registros excedido.');
 const next={...saved,[fileId]:entry};localStorage.setItem(KEY,JSON.stringify(next));saved=next;update(fileId);
}
function restore(fileId){const next={...saved};delete next[fileId];localStorage.setItem(KEY,JSON.stringify(next));saved=next;update(fileId);}
function close(){if(!current)return;const d=current;current=null;if(d.open&&d.close)d.close();d.remove();}
function input(form,k,label,value,multi=false){
 const box=el('label','bm228-field'),t=el('span','',label),v=el(multi?'textarea':'input');
 if(!multi)v.type='text';else v.rows=k==='description'?4:3;
 v.name=k;v.maxLength=FIELDS[k];v.value=value||'';v.setAttribute('aria-label',label);
 box.append(t,v);form.append(box);return v;
}
function exportJson(){
 const records=Object.entries(saved).map(([fileId,x])=>({fileId,...x}));
 const blob=new Blob([JSON.stringify({format:FORMAT,version:1,count:records.length,exportedAt:new Date().toISOString(),scope:'ajustes_locais',records},null,2)+'\n'],{type:'application/json'});
 const url=URL.createObjectURL(blob),a=el('a');a.href=url;a.download='BANCO_MESTRE_INFO_IMAGENS_'+new Date().toISOString().slice(0,10)+'.json';
 document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1200);
}
async function importJson(file){
 if(!file)return false;
 if(file.size>3*1024*1024)throw Error('Checkpoint maior que 3 MB.');
 const p=JSON.parse(await file.text());
 if(p.format!==FORMAT||p.version!==1||!Array.isArray(p.records)||p.count!==p.records.length||p.records.length>1500)throw Error('Formato de checkpoint inválido.');
 const next={...saved},seen=new Set();
 for(const r of p.records){
  const {fileId,...entry}=r||{};
  if(!valid(fileId,entry)||seen.has(fileId))throw Error('ID ou informações inválidas ou repetidas.');
  seen.add(fileId);next[fileId]=entry;
 }
 if(Object.keys(next).length>1500)throw Error('Limite de imagens locais excedido.');
 if([...seen].some(id=>saved[id])&&!confirm('Substituir os registros locais de imagem coincidentes?'))return false;
 localStorage.setItem(KEY,JSON.stringify(next));saved=next;update('');return true;
}
function open(file,card,trigger){
 if(!VALID.test(file.id))return;
 close();const m=meta(file),old=base(file);
 const dialog=el('dialog','bm202-image-dialog bm206-editor-dialog bm228-dialog bm426-info-editor');current=dialog;
 const header=el('div','bm202-dialog-heading'),title=el('h2','','Editar informações · '+m.displayTitle);
 const exit=el('button','bm202-modal-close','Fechar ×');exit.type='button';exit.onclick=close;
 header.append(title,exit);dialog.append(header);
 const layout=el('div','bm228-layout'),visual=el('div','bm228-visual'),right=el('div','bm228-right');
 const picture=el('img');picture.alt='Prévia da imagem';picture.loading='eager';
 const original=card.querySelector('img'),preview=()=>{const src=original?.currentSrc||original?.src||'';if(src&&picture.src!==src)picture.src=src;};
 preview();
 if(original){
  original.addEventListener('load',preview);
  const observer=new MutationObserver(preview);
  observer.observe(original,{attributes:true,attributeFilter:['src','srcset']});
  dialog.addEventListener('close',()=>{observer.disconnect();original.removeEventListener('load',preview);},{once:true});
 }
 const link=el('a','','Ver original no Google Drive');link.href='https://drive.google.com/file/d/'+encodeURIComponent(file.id)+'/view';
 link.target='_blank';link.rel='noopener noreferrer';
 const bar=el('div','bm419-preview-toolbar'),stage=el('div','bm419-preview-stage'),status=el('span','bm419-preview-scale','Ajustar');
 stage.tabIndex=0;stage.setAttribute('aria-label','Arraste a imagem para mover; use os botões para ampliar');stage.append(picture);
 let zoom=1,dx=0,dy=0,drag=null;
 picture.draggable=false;
 function repaint(){picture.style.transform='translate('+dx+'px,'+dy+'px) scale('+zoom+')';status.textContent=Math.round(zoom*100)+'%'}
 function fitPreview(){zoom=1;dx=dy=0;repaint()}
 function resizeZoom(f){zoom=Math.max(.4,Math.min(6,zoom*f));repaint()}
 function ctl(label,title,fn){const b=el('button','',label);b.type='button';b.title=title;b.setAttribute('aria-label',title);b.onclick=fn;return b}
 const pan=ctl('✋ Mover','Arrastar imagem',()=>stage.focus());pan.setAttribute('aria-pressed','true');bar.append(pan,ctl('−','Reduzir imagem',()=>resizeZoom(1/1.25)),status,ctl('+','Ampliar imagem',()=>resizeZoom(1.25)),ctl('Ajustar','Ajustar à área de visualização',fitPreview),link);
 stage.addEventListener('pointerdown',e=>{if(e.button!==0||e.target.closest?.('button'))return;e.preventDefault();drag={id:e.pointerId,x:e.clientX,y:e.clientY,dx,dy};stage.setPointerCapture(e.pointerId);stage.classList.add('dragging')});
 stage.addEventListener('pointermove',e=>{if(!drag||e.pointerId!==drag.id)return;dx=drag.dx+e.clientX-drag.x;dy=drag.dy+e.clientY-drag.y;repaint()});
 const stop=e=>{if(drag?.id===e.pointerId){drag=null;stage.classList.remove('dragging')}};stage.addEventListener('pointerup',stop);stage.addEventListener('pointercancel',stop);stage.addEventListener('lostpointercapture',stop);
 stage.addEventListener('wheel',e=>{if(!e.ctrlKey)return;e.preventDefault();resizeZoom(e.deltaY<0?1.15:1/1.15)},{passive:false});
 picture.addEventListener('load',fitPreview);visual.append(bar,stage);fitPreview();
 const remove=ctl('Excluir','Mover imagem para Excluídas no Drive',()=>window.BM421PdfArchive?.requestImage(file,remove));remove.dataset.bmArchiveAction='true';bar.append(remove);
 const tabs=el('div','bm228-tabs'),panels={},buttons={};
 for(const [name,label] of [['data','Informações'],['links','Tipo e cartões'],['tech','Arquivo e backup']]){
  const b=el('button','',label);b.type='button';b.setAttribute('role','tab');
  const p=el('div','bm228-panel');p.id='bm426-image-panel-'+name;p.setAttribute('role','tabpanel');p.setAttribute('aria-labelledby','bm426-image-tab-'+name);p.hidden=name!=='data';b.id='bm426-image-tab-'+name;b.setAttribute('aria-controls',p.id);
  buttons[name]=b;panels[name]=p;tabs.append(b);
 }
 tabs.setAttribute('role','tablist');let linksReady=false;
 function select(name){
  if(name==='links'&&!linksReady){
   const lib=window.BM197MediaLinks;
   if(lib?.mountEditorForm){lib.mountEditorForm(panels.links,'DRIVE-IMG-'+file.id,null,()=>{close();update(file.id)});linksReady=true;}
   else panels.links.append(el('p','','Editor de vínculos indisponível; vínculos originais preservados.'));
  }
  for(const k of Object.keys(panels)){panels[k].hidden=k!==name;buttons[k].setAttribute('aria-selected',String(k===name));}
 }
 for(const k of Object.keys(buttons))buttons[k].onclick=()=>select(k);
 const form=el('form','bm228-form');
 form.append(el('p','bm228-hint','Mesmo editor de organização do Atlas: descrição, assunto e correções. O original do Drive não é alterado.'));
 const fields={};
 fields.title=input(form,'title','Título de estudo',m.displayTitle==='Imagem sem título descritivo'?'':m.displayTitle);
 const taxonomy=el('div','bm228-tax');
 fields.area=input(taxonomy,'area','1. Disciplina',m.area);
 fields.subject=input(taxonomy,'subject','2. Assunto geral',m.subject);
 fields.subsubject=input(taxonomy,'subsubject','3. Assunto específico',m.subsubject);
 fields.detail=input(taxonomy,'detail','4. Subassunto',m.detail);
 form.append(taxonomy);
 fields.description=input(form,'description','Descrição técnica e conceitos',m.description,true);
 fields.note=input(form,'note','Observações pessoais e correções',m.note,true);
 const hint=el('small','bm228-hint','Origem: '+m.classificationOrigin+'. Os dados ficam neste navegador até exportar o checkpoint.');
 const feedback=el('p','bm228-feedback');feedback.setAttribute('role','status');
 const actions=el('div','bm228-actions');
 const save=el('button','primary','Salvar informações');save.type='submit';
 const reset=el('button','','Restaurar textos originais');reset.type='button';
 const cancel=el('button','','Cancelar');cancel.type='button';cancel.onclick=close;
 reset.onclick=()=>{if(!saved[file.id]){feedback.textContent='Nenhum ajuste manual encontrado.';return;}
  if(confirm('Restaurar os textos do catálogo? Os vínculos dos cartões serão preservados.')){
   try{restore(file.id);close();}catch(e){feedback.textContent=e.message;}
  }
 };
 actions.append(save,reset,cancel);form.append(hint,feedback,actions);
 form.onsubmit=e=>{
  e.preventDefault();e.stopPropagation();
  const data=Object.fromEntries(Object.entries(fields).map(([k,v])=>[k,v.value.trim()]));
  if(!data.title||data.title==='Imagem sem título descritivo'){feedback.textContent='Informe um título descritivo.';fields.title.focus();return;}
  try{persist(file.id,{...data,modifiedAt:new Date().toISOString()});close();}
  catch(err){feedback.textContent='Falha ao salvar: '+err.message;}
 };
 panels.data.append(form);
 panels.links.append(el('p','bm228-hint','Classifique como imagem de conteúdo ou cartão e relacione IDs. Salve esta aba separadamente.'));
 panels.tech.append(el('p','bm228-hint','Arquivo original preservado. Os ajustes e vínculos são locais neste navegador até entrarem em um checkpoint.'));
 const dl=el('dl','bm228-tech');
 for(const [a,b] of [['Nome no Drive',file.name],['ID permanente',file.id],['Pasta',file.drivePath||'Atlas'],['Classificação do catálogo',old.classified?old.subject:'Pendente'],['Origem',m.classificationOrigin]]){
  dl.append(el('dt','',a),el('dd','',b||'Não informado'));
 }
 panels.tech.append(dl);
 const backup=el('div','bm228-actions');
 const exp=el('button','','Exportar checkpoint JSON');exp.type='button';exp.onclick=exportJson;
 const imp=el('label','bm228-import','Importar checkpoint JSON'),choose=el('input'),msg=el('span','bm228-hint');
 choose.type='file';choose.accept='.json,application/json';
 choose.onchange=async()=>{
  const f=choose.files?.[0];choose.value='';
  try{msg.textContent=await importJson(f)?'Checkpoint restaurado. Reabra a imagem para ver os dados.':'Importação cancelada.';}
  catch(err){msg.textContent=err.message;}
 };
 imp.append(choose);backup.append(exp,imp);panels.tech.append(backup,msg);
 right.append(tabs,...Object.values(panels));layout.append(visual,right);dialog.append(layout);
 dialog.addEventListener('close',()=>{if(current===dialog)current=null;dialog.remove();if(trigger?.isConnected)trigger.focus();},{once:true});
 document.body.append(dialog);select('data');if(dialog.showModal)dialog.showModal();else dialog.setAttribute('open','');
 fields.title.focus({preventScroll:true});
}
function decorate(card,file){
 if(!card||!VALID.test(file?.id))return;
 card.dataset.bm228DriveFileId=file.id;
 window.BM197MediaLinks?.decorateDrive?.(card,file);
 const container=card.querySelector('.bm202-image-actions')||card;
 const previous=container.querySelector('.bm202-edit-image');
 const btn=el('button','bm202-edit-image','Editar informações');btn.type='button';
 btn.setAttribute('aria-label','Editar informações da imagem '+meta(file).displayTitle);
 btn.onclick=e=>{e.preventDefault();e.stopPropagation();open(file,card,btn);};
 if(previous)previous.replaceWith(btn);else container.prepend(btn);
}
const css=el('style');css.id='bm228-drive-image-editor-style';
css.textContent=[
'.bm228-dialog{box-sizing:border-box;width:min(1100px,96vw);max-width:96vw;max-height:94vh;padding:0;border:1px solid #c7dad4;border-radius:13px;overflow:auto;background:#fff;color:#17353b}',
'.bm228-dialog::backdrop{background:rgba(16,39,43,.52)}',
'.bm228-dialog .bm202-dialog-heading{display:flex;justify-content:space-between;align-items:center;gap:12px;padding:13px 18px;background:#eff7f4;border-bottom:1px solid #d4e5de;position:sticky;top:0;z-index:3}',
'.bm228-dialog .bm202-dialog-heading h2{font-size:17px;line-height:1.3;margin:0;overflow-wrap:anywhere}',
'.bm228-layout{display:grid;grid-template-columns:minmax(0,42%) minmax(0,58%);align-items:start}',
'.bm228-visual{position:sticky;top:62px;padding:18px;background:#f7faf9;min-width:0;display:grid;gap:10px}',
'.bm228-visual img{width:100%;height:auto;max-height:68vh;object-fit:contain;background:#fff;border:1px solid #d9e5e1;border-radius:8px}',
'.bm228-visual a{font-size:12px;overflow-wrap:anywhere}',
'.bm228-right{padding:16px;min-width:0}',
'.bm228-tabs{display:flex;flex-wrap:wrap;gap:7px;margin:0 0 15px}',
'.bm228-tabs button{font-size:12px;padding:8px 10px;border:1px solid #c4d5d2;border-radius:8px;background:#f3f8f7;color:#194850}',
'.bm228-tabs button[aria-selected=true]{background:#dcefeb;font-weight:800;border-color:#88b6ac}',
'.bm228-panel[hidden]{display:none!important}',
'.bm228-form{display:grid;gap:12px}',
'.bm228-field{display:grid;gap:4px;min-width:0;font-size:12px;font-weight:650;color:#25464b}',
'.bm228-field input,.bm228-field textarea{box-sizing:border-box;display:block;width:100%;min-width:0;border:1px solid #baccce;border-radius:7px;padding:9px 10px;background:#fff;color:#17353b;font:400 13px/1.45 system-ui,sans-serif}',
'.bm228-tax{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}',
'.bm228-hint{font-size:12px;line-height:1.5;color:#577274;margin:2px 0}',
'.bm228-feedback{font-size:12px;color:#983b33;min-height:10px}',
'.bm228-actions{display:flex;flex-wrap:wrap;gap:9px}',
'.bm228-actions button,.bm228-import{font-size:12px;padding:9px 11px;border:1px solid #a9c6c1;border-radius:8px;cursor:pointer}',
'.bm228-import input{display:block;margin-top:5px;font-size:11px}',
'.bm228-tech{display:grid;grid-template-columns:minmax(100px,1fr) minmax(0,2fr);gap:7px;font-size:12px;overflow-wrap:anywhere}',
'.bm228-tech dt{font-weight:700;color:#577274}.bm228-tech dd{margin:0}',
'#imagens .bm202-edit-image{white-space:normal;font-weight:650;line-height:1.3}',
'@media(max-width:700px){.bm228-layout{grid-template-columns:1fr}.bm228-visual{position:static;padding:10px}.bm228-visual img{max-height:230px}.bm228-tax{grid-template-columns:1fr}}'
].join('\n');
document.head.append(css);
window.BM228DriveImageEditor=Object.freeze({decorate,meta,open,exportJson,importJson,get editedCount(){return Object.keys(saved).length}});
})();

;
/* 91 assets/v239_library_counter.js */
/* V239: o catálogo conhecido não é zero quando a autenticação ainda não ocorreu. */
/* V217: contador mostra apenas imagens realmente verificadas no Drive. */
/* Banco Mestre V213 — contagem da fonte visível, sem somar originais Drive e catálogo.
 * 323 imagens públicas no catálogo alternativo (179 históricas e 144 novas V211); Drive mantém prioridade.
 * Não grava em Drive, não altera imagens, cartões, IDs ou histórico de classificações.
 */
(function(){
 'use strict';
 if(window.BM208AtlasUnified)return;
 // Contador apresenta apenas a fonte autorizada.
 const $=id=>document.getElementById(id);
 const fmt=n=>n.toLocaleString('pt-BR');
 let lastKey='',lastSnapshot=null,countWatcher=null,summaryWatcher=null;
 function snapshot(){
   const provider=window.BancoMestreDriveImagesV182;
   const authenticated=Boolean(provider?.connected && provider?.lastSuccess);
   const raw=authenticated?Number(provider?.lastCount):0;
   const drive=Number.isSafeInteger(raw)&&raw>=0?raw:0;
   const unverified=authenticated?Number(provider?.unverifiedCount||0):0;
   const direct=authenticated&&$('imagens')?.dataset.bm213Source==='drive';
   return {public:179,drive,unverified,total:authenticated?drive:179,direct:authenticated,authenticated,
     lastSuccess:authenticated?String(provider.lastSuccess):null,
     error:provider?.lastError||''};
 }
 function setText(node,value){if(node&&node.textContent!==value)node.textContent=value;}
 function apply(){
   const data=snapshot();
   const key=[data.total,data.unverified,data.direct,data.authenticated,data.lastSuccess,data.error].join('|');
   lastKey=key;lastSnapshot=data;
   const stat=document.querySelector('.stats .stat:nth-child(3)');
   setText(stat?.querySelector('b'),fmt(data.total));
   if(stat){stat.title=data.authenticated?'Arquivos de imagem consultados: '+fmt(data.drive)+'; nos índices históricos: '+fmt(data.drive-data.unverified)+'; fora dos índices: '+fmt(data.unverified):'Catálogo integrado: 179 registros; Drive ainda não consultado';stat.setAttribute('aria-label',stat.title);}
   const description=data.authenticated
    ?fmt(data.drive-data.unverified)+' indexadas · '+fmt(data.unverified)+' outros arquivos'
    :'179 registros catalogados · conecte o Drive para consultar os originais';
  setText(stat?.querySelector('span'),description);
   const count=$('imageCount');
   const totalText=data.authenticated
    ?fmt(data.drive-data.unverified)+' no índice · '+fmt(data.unverified)+' outros ('+fmt(data.drive)+' no Drive)'
    :'179 registros catalogados · originais disponíveis após conexão';
  setText(count,totalText);
   if(count)count.title=data.lastSuccess?'Drive consultado em '+new Date(data.lastSuccess).toLocaleString('pt-BR'):'Drive não consultado nesta sessão';
   const filterSummary=$('bm155FilterSummary');
   if(filterSummary&&filterSummary.textContent){
     const base=filterSummary.textContent.replace(/ · Total na biblioteca: [\d.]+ imagens$/,'');
     const target=data.authenticated?base+' · Total na biblioteca: '+fmt(data.total)+' imagens':base;
     setText(filterSummary,target);
   }
   const countBadge=$('bm205-drive-count');
   if(data.authenticated)setText(countBadge,fmt(data.drive-data.unverified)+' no índice · '+fmt(data.unverified)+' outros arquivos');
   const group=$('bm084-sync');
   if(group&&data.authenticated)group.dataset.bmUnifiedAtlasTotal=String(data.total);
 }
 function observeCounts(){
   const counter=$('imageCount');
   if(counter&&!countWatcher){
     countWatcher=new MutationObserver(apply);
     countWatcher.observe(counter,{childList:true,characterData:true,subtree:true});
   }
   const summary=$('bm155FilterSummary');
   if(summary&&!summaryWatcher){
     summaryWatcher=new MutationObserver(apply);
     summaryWatcher.observe(summary,{childList:true,characterData:true,subtree:true});
   }
 }
 function refresh(){observeCounts();apply();}
 function init(){
   refresh();
   document.addEventListener('bm-media-drive-authorized',refresh);
   document.addEventListener('bm209-drive-render',refresh);
   document.addEventListener('bm213-source-change',refresh);
   document.addEventListener('visibilitychange',()=>{if(!document.hidden)refresh()});
   window.addEventListener('focus',refresh);
   window.addEventListener('pageshow',refresh);
   // Observa mudanças que o renderizador legado faz nos contadores;
   // o intervalo apenas acompanha o resultado do sincronizador Drive V207.
   // V326: atualização dos contadores já é acionada pelos eventos e MutationObservers.
 }
 window.BM208AtlasUnified=Object.freeze({refresh,get snapshot(){return snapshot()}});
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
 else init();
})();


;
/* 92 assets/v218_single_image_viewer.js */
/* V218: barra de filtros por disciplina, assunto e pendências no Atlas Drive. */
/* V217: imagens visíveis exclusivamente do Drive, sem seletor de catálogo estático. */
/* Banco Mestre V213 — visualizador V1 com prioridade nos originais autenticados do Drive.
 * Reutiliza cartões publicos do motor historico e cartões Drive autenticados.
 * Nao altera arquivos, IDs, grifos, checkpoints, SRS ou classificacoes.
 */
(function(){
'use strict';
if(window.BM209SingleImageViewer)return;
const $=id=>document.getElementById(id);
// Sem preferência de catálogo estático (V217).
let privateCards=[],rowsObserver=null,mounted=false,scheduled=false;
function driveReady(){
 const p=window.BancoMestreDriveImagesV182;
 return Boolean(p?.connected&&p?.lastSuccess);
}
function useDrive(){return driveReady();}
function applySource(){
 const area=$('imagens');if(!area)return;
 const direct=useDrive();
 area.dataset.bm213Source='drive';
 const info=$('bm213SourceInfo');
 if(info)info.textContent=direct?'Fonte: Google Drive autorizado · imagens originais':
  'Conecte o Google Drive para visualizar as imagens originais';
 updateMore();
 document.dispatchEvent(new Event('bm213-source-change'));
}
function queueReconcile(){
 if(scheduled)return;
 scheduled=true;
 queueMicrotask(()=>{scheduled=false;reconcile()});
}
function reconcile(){
 const rows=$('imageRows');
 if(!rows)return;
 if(privateCards.length){
  for(const node of [...rows.children]){
   if(node.tagName==='P'&&/Nenhuma imagem corresponde aos filtros/i.test(node.textContent||''))node.remove();
  }
 }
 for(const card of privateCards){
  if(!card.isConnected||card.parentElement!==rows)rows.append(card);
 }
 applySource();
}
function updateMore(){
 const btn=$('bm209More'),drive=$('bm084-more');
 if(!btn)return;
 const canLoad=Boolean(useDrive()&&drive&&!drive.hidden);
 btn.hidden=!canLoad;btn.disabled=!canLoad;
 btn.title='Carregar mais imagens diretamente do Google Drive';
}

function receiveDrive(event){
 const grid=$('bm084-grid');
 if(!grid)return;
 const children=[...grid.children].filter(x=>x.tagName==='ARTICLE');
 // O evento também é enviado com busca sem resultado: limpar cartões antigos.
 for(const card of privateCards)card.remove();
 privateCards=children;
 for(const card of privateCards){
  card.classList.add('card','bm209ImageFromDrive');
  card.dataset.bm209ImageOrigin='drive';
  card.setAttribute('aria-label','Imagem: '+String(card.querySelector('h4')?.textContent||'arquivo sincronizado'));
  const heading=card.querySelector('h4');
  if(heading){heading.style.fontSize='13px';heading.style.margin='6px 0';}
  const preview=card.querySelector('img');
  if(preview){preview.setAttribute('role','button');preview.tabIndex=0;
   preview.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();preview.click();}});
  }
 }
 reconcile();
}
function observeMainGrid(){
 const rows=$('imageRows');
 if(!rows||rowsObserver)return;
 rowsObserver=new MutationObserver(records=>{
  if(privateCards.some(card=>card.parentElement!==rows)||records.some(record=>[...record.addedNodes,...record.removedNodes].some(node=>
    !(node.nodeType===1&&node.classList?.contains('bm209ImageFromDrive')))))queueReconcile();
 });
 rowsObserver.observe(rows,{childList:true,subtree:false});
}
function css(){
 const style=document.createElement('style');style.id='bm209SingleImageViewerStyle';
 style.textContent=[
 '#imagens #bm084-sync{display:none!important}',
 '#imagens #imageRows>article:not(.bm209ImageFromDrive){display:none!important}',
 '#imagens #bm153Directory .bm153Heading,#imagens #bm153AreaNav,#imagens .bm153Toolbar,#imagens #bm153GroupListing{display:none!important}',
 '#imagens .bm153Directory{background:transparent;border:0;padding:0;margin:8px 0}',
 '#imagens #bm153Results{display:block!important}',
 '#imagens #imageRows{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(100%,240px),1fr));gap:10px;align-items:start}',
 '#imagens #imageRows>article{margin:0;min-width:0;box-sizing:border-box}',
 '#imagens #imageRows>article.bm209ImageFromDrive{overflow:hidden;border-radius:10px;box-shadow:none}',
 '#imagens #imageRows>article.bm209ImageFromDrive img{height:150px!important;max-height:150px;object-fit:contain}',
 '#imagens #imageRows>article.bm209ImageFromDrive .bm202-image-actions{margin-top:8px}',
 '#imagens #bm209SyncBar{display:flex;align-items:center;gap:7px;flex-wrap:wrap;padding:7px 0;margin:3px 0 8px;border-bottom:1px solid #dce8e4}',
 '#imagens #bm209SyncBar button{font-size:12px;padding:6px 10px;min-height:30px}',
 '#imagens #bm209SyncBar #bm205-drive-count{font-size:11px;color:#4c716b}',
 '#imagens #bm209SyncBar #bm207-sync-time{margin:0!important;font-size:11px!important}',
 '#imagens #bm209SyncBar #bm084-status{margin:0!important;min-width:0;max-width:340px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:11px!important}',
 '#imagens #bm209More{display:block;margin:10px auto;font-size:12px;min-height:36px}',
 '#imagens #bm209More[hidden]{display:none!important}',
 '#imagens #moreImages{display:none!important}',
 '#imagens #bm213-more{display:none!important}',
 '@media(max-width:680px){#imagens #imageRows{grid-template-columns:repeat(auto-fill,minmax(min(100%,165px),1fr));gap:8px}#imagens #bm209SyncBar{gap:6px}}'
 ].join('\n');
 document.head.append(style);
}
function init(){
 if(mounted)return;
 const host=$('imagens')?.querySelector('.panel'),privatePanel=$('bm084-sync');
 const connect=$('bm084-connect'),refresh=$('bm084-refresh');
 const legacyMore=$('moreImages'),rows=$('imageRows');
 if(!host||!privatePanel||!connect||!refresh||!legacyMore||!rows)return;
 mounted=true;css();
 const title=host.querySelector('h2');if(title)title.textContent='Biblioteca de imagens';
 const intro=host.querySelector('p.intro');if(intro)intro.textContent=
  'Arquivos de imagem no Drive individual. Os índices históricos identificam o acervo já catalogado; os demais arquivos podem incluir originais, cópias, recortes e materiais de apoio.';
 const bar=document.createElement('div');bar.id='bm209SyncBar';
 connect.textContent='Conectar imagens';
 refresh.textContent='Atualizar Drive';
 const sourceInfo=document.createElement('small');sourceInfo.id='bm213SourceInfo';
 sourceInfo.style.cssText='color:#527076;font-size:11px';
 const filterSelect=(id,description,options)=>{
  const select=document.createElement('select');select.id=id;
  select.setAttribute('aria-label',description);
  select.style.cssText='max-width:min(100%,220px);min-width:100px;font-size:12px;padding:6px;border:1px solid #cadad5;border-radius:6px';
  for(const [label,value] of options)select.add(new Option(label,value));
  select.addEventListener('change',()=>{
   if(id==='bm218-area-filter'){
    const subject=$('bm218-subject-filter');if(subject)subject.value='all';
   }
   document.dispatchEvent(new Event('bm218-image-filter-change'));
  });
  return select;
 };
 const areaFilter=filterSelect('bm218-area-filter','Filtrar disciplina das imagens',[['Todas as disciplinas','all']]);
 const subjectFilter=filterSelect('bm218-subject-filter','Filtrar assunto das imagens',[['Todos os assuntos','all']]);
 const statusFilter=filterSelect('bm218-status-filter','Situação da classificação das imagens',[
  ['Todos os arquivos de imagem','all'],['Nos índices históricos','indexed'],['Fora dos índices históricos','unindexed'],['Com assunto identificado','classified'],['A classificar','pending']
 ]);
 bar.append(connect,refresh,areaFilter,subjectFilter,statusFilter,sourceInfo);
 for(const id of ['bm205-drive-count','bm207-sync-time','bm084-status']){
  const node=$(id);if(node)bar.append(node);
 }
 const oldControls=host.querySelector('.controls');
 if(oldControls)oldControls.after(bar);else host.prepend(bar);
 privatePanel.hidden=true;
 privatePanel.style.display='none';
 const more=document.createElement('button');more.type='button';more.id='bm209More';
 more.textContent='Mostrar mais imagens';
 more.onclick=()=>{
  const driveMore=$('bm084-more');
  if(useDrive()&&driveMore&&!driveMore.hidden)driveMore.click();
  queueReconcile();
 };
 const results=$('bm153Results')||rows.parentElement;
 results?.append(more);
 observeMainGrid();
 document.addEventListener('bm209-drive-render',receiveDrive);
 const search=$('imageSearch');
 search?.addEventListener('input',()=>{queueReconcile()});
 for(const id of ['imageFilter','bm197-type-filter','bm155DisciplinaImagem',
  'bm155AssuntoGeralImagem','bm155AssuntoEspecificoImagem','bm155SubassuntoImagem']){
  $(id)?.addEventListener('change',queueReconcile);
 }
 const statuses=$('bm084-status');
 if(statuses)new MutationObserver(()=>{statuses.title=statuses.textContent||''}).observe(statuses,{childList:true,characterData:true,subtree:true});
 const originalMore=legacyMore;
 new MutationObserver(updateMore).observe(originalMore,{attributes:true,attributeFilter:['disabled','hidden']});
 const other=$('bm084-more');
 if(other)new MutationObserver(updateMore).observe(other,{attributes:true,attributeFilter:['disabled','hidden']});
 applySource();
 queueReconcile();
}
window.BM209SingleImageViewer=Object.freeze({get ready(){return mounted},refresh:queueReconcile,
 get displayedPrivate(){return privateCards.length},get mode(){return 'drive_only_named_by_v218'},get selectedSource(){return 'drive'}});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();

;
/* 93 assets/v210_compact_sections.js */
/* Banco Mestre V210 — barra compacta dos três painéis fotografados.
 * Move apenas nós existentes; mantém handlers, IDs, seletores e estados.
 * Sem alteração de dados, sync, HTML canônico, cartões ou originais.
 */
(function(){
'use strict';
if(window.BM210CompactLayout)return;
const $=id=>document.getElementById(id);
let pdfReady=false,imageReady=false,cardsReady=false;
const one=(s,scope=document)=>scope?.querySelector(s)||null;
function element(tag,id,cls){const n=document.createElement(tag);if(id)n.id=id;if(cls)n.className=cls;return n;}
function appendNode(host,node,shortTitle){
 if(!host||!node)return false;
 if(shortTitle){node.title=node.title||node.textContent?.trim()||'';if(node.tagName==='BUTTON')node.textContent=shortTitle;}
 host.append(node);return true;
}
function compactStatusDetails(id,title){
 const box=element('details',id,'bm210StatusDetails');
 const summary=element('summary');summary.textContent=title;
 const body=element('div',null,'bm210StatusBody');
 box.append(summary,body);
 return {box,body};
}
function prepPdf(){
 if(pdfReady)return true;
 const panel=one('#pdfs .panel');
 const sync=$('bm-pdf-sync'),pdfAreas=$('pdfAreaNavV036');
 const legacy=$('bm182-status-pdf')?.parentElement,check=$('bm151-pdf-check');
 if(!panel||!sync||!pdfAreas||!check||!legacy)return false;
 const bar=element('div','bm210PdfToolbar','bm210Toolbar');
 bar.setAttribute('aria-label','Ferramentas e filtros dos PDFs');
 const actions=element('div','bm210PdfActions','bm210Actions');
 const filters=element('div','bm210PdfFilters','bm210Filters');
 const ext=compactStatusDetails('bm210PdfStatus','Estado e opções');
 const syncAll=one('button',legacy);
 appendNode(actions,syncAll,'Conferir tudo');
 const direct=$('driveConnectV038');
 appendNode(actions,direct,'Conectar Drive');
 appendNode(actions,$('bm-pdf-sync-refresh'),'Sincronizar PDFs');
 appendNode(actions,one('button',check),'Verificar 78 PDFs');
 const vade=$('bmVade041');
 if(vade)appendNode(actions,vade);
 // O segundo login do catálogo é mantido em opções como caminho alternativo.
 const alt=$('bm-pdf-sync-connect');
 appendNode(ext.body,alt,'Conectar catálogo');
 for(const status of [$('bm182-status-pdf'),$('bm-pdf-sync-status'),
  one('span',check),$('driveDirectStatusV038')])appendNode(ext.body,status);
 actions.append(ext.box);
 bar.append(actions,filters);
 const controls=one(':scope > .controls',panel);
 // Em telas pequenas, a V113 gerencia os filtros PDF em seu próprio painel.
 // No desktop, movemos o mesmo DOM/handlers para uma barra compartilhada.
 if(!window.matchMedia?.('(max-width:760px)').matches){
  appendNode(filters,one('#pdfAreaNavV036'));
  appendNode(filters,controls);
 }
 const heading=one('h2',panel);
 if(heading)heading.after(bar);else panel.prepend(bar);
 pdfReady=true;return true;
}
function prepImages(){
 if(imageReady)return true;
 const panel=one('#imagens .panel'),bar=$('bm209SyncBar');
 const hierarchy=$('bm155ImageFilters'),editor=$('bm197-classification-controls');
 if(!panel||!bar||!hierarchy||!editor)return false;
 bar.classList.add('bm210Toolbar','bm210ImageToolbar');
 bar.setAttribute('aria-label','Busca, filtros, classificação e sincronização das imagens');
 const search=$('imageSearch');
 if(search){search.placeholder='Buscar imagem, cartão, assunto ou ID';search.setAttribute('aria-label','Buscar imagens da biblioteca');bar.prepend(search);}
 for(const id of ['bm155DisciplinaImagem','bm155AssuntoGeralImagem',
  'bm155AssuntoEspecificoImagem','bm155SubassuntoImagem']){
  const select=$(id);const wrap=select?.closest('label');if(wrap)appendNode(bar,wrap);
 }
 const editorToolbar=one('.bm197-toolbar',editor);
 const editorial=one('label',editorToolbar);
 const manager=one('button',editorToolbar);
 if(editorial)appendNode(bar,editorial);
 if(manager)appendNode(bar,manager,'Classificar');
 const reset=$('bm155Reset');if(reset)appendNode(bar,reset,'Limpar filtros');
 const total=$('imageCount');if(total)appendNode(bar,total);
 const legacy=$('bm182-status-img')?.parentElement;
 if(legacy){const global=one('button',legacy);if(global)appendNode(bar,global,'Conferir mídia');}
 const extra=compactStatusDetails('bm210ImageInfo','Mais opções');
 for(const node of [$('bm155FilterSummary'),$('bm197-message'),$('bm182-status-img'),
  one('p.intro',panel),one('p.notice',panel),one('.originalHelp',panel)])appendNode(extra.body,node);
 const more=$('bm159AtlasOptions');if(more)appendNode(extra.body,more);
 bar.append(extra.box);
 // Ocultar a categoria antiga, redundante com a hierarquia atual, mantendo o ID.
 const legacyCategory=$('imageFilter');if(legacyCategory&&legacyCategory.value!=='all'){
  legacyCategory.value='all';legacyCategory.dispatchEvent(new Event('change',{bubbles:false}));
 }
 const title=one('h2',panel);if(title)title.after(bar);
 imageReady=true;return true;
}
function prepCards(){
 if(cardsReady)return true;
 const panel=one('#cartoes .panel'),filters=$('bm152Filters');
 const controls=one(':scope > .controls',panel),search=$('cardSearch');
 if(!panel||!filters||!controls||!search)return false;
 filters.classList.add('bm210CardToolbar');
 filters.setAttribute('aria-label','Busca e filtros compactos dos flashcards');
 const quick=element('div','bm210CardQuick','bm210Quick');
 search.placeholder='Buscar ID, enunciado ou conteúdo';
 appendNode(quick,search);
 for(const id of ['cardHidden','cardReviewedOnly','cardRecoveredOnly']){
  const checkbox=$(id),label=checkbox?.closest('label');
  if(label)appendNode(quick,label);
 }
 const inactive=$('bm119InactiveLabel');if(inactive)appendNode(quick,inactive);
 const footer=one('.bm152FilterFooter',filters);
 if(footer)filters.insertBefore(quick,footer);else filters.append(quick);
 const badge=$('cardCount');if(badge&&footer)footer.append(badge);
 const extra=$('bm191CardCount');if(extra&&footer)footer.append(extra);
 cardsReady=true;return true;
}
function init(){
 prepPdf();prepImages();prepCards();
 if(pdfReady&&imageReady&&cardsReady)return;
 // Componentes PDF e de classificação podem concluir inicialização após
 // o documento: tentativas limitadas, sem observadores permanentes.
 let tries=0;
 const retry=()=>{prepPdf();prepImages();prepCards();if((pdfReady&&imageReady&&cardsReady)||++tries>=16)return;setTimeout(retry,250);};
 setTimeout(retry,250);
}
window.BM210CompactLayout=Object.freeze({
 get pdf(){return pdfReady},get images(){return imageReady},get cards(){return cardsReady},
 get ready(){return pdfReady&&imageReady&&cardsReady}
});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
else init();
})();

;
/* 97 assets/v217_media_policy.js */
/* V217 — politica hibrida: cartoes/estrutura no GitHub, imagens/PDFs somente do Drive.
 * Metadados antigos de imagem ficam disponiveis para correlacoes, SEM montar previews estaticas.
 * Nao salva dados pessoais no GitHub nem escreve nas pastas do Drive. */
(function(){
 'use strict';
 if(window.BM217MediaPolicy)return;
 const $=id=>document.getElementById(id);
 if(typeof loadImages!=='function'||typeof imgRender!=='function')return;
 const originalLoad=loadImages;
 // Evita que a V1 solicite miniaturas publicadas enquanto a biblioteca Drive esta ativa.
 loadImages=async function(){
  // The authenticated provider owns the visible library. Legacy metadata is not a prerequisite.
  if(window.BancoMestreDriveImagesV182?.connected)return window.BancoMestreDriveImagesV182.refresh(false);
  window.BM209SingleImageViewer?.refresh?.();
 };
 imgRender=async function(){
  // A galeria autenticada administra a grade, a busca e as miniaturas.
  window.BM209SingleImageViewer?.refresh?.();
 };
 const queueStatus=()=>{
  const current=window.BancoMestreDriveImagesV182;
  const connected=Boolean(current?.connected);
  const imgCount=$('imageCount');
  if(imgCount)imgCount.textContent=connected
   ?String(current?.lastCount||0)+' imagens consultadas no Drive'
   :'Conecte o Google Drive para consultar imagens';
 };
 document.addEventListener('bm209-drive-render',queueStatus);
 document.addEventListener('bm-media-drive-authorized',queueStatus);
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',queueStatus,{once:true});
 else queueStatus();
 window.BM217MediaPolicy=Object.freeze({
  source:{cards:'github_public',images:'google_drive_private',pdfs:'google_drive_private',srs:'local_private'},
  get driveConnected(){return Boolean(window.BancoMestreMediaSyncV182?.token?.())},
  refresh:()=>{queueStatus();window.BM209SingleImageViewer?.refresh?.();}
 });
})();


;

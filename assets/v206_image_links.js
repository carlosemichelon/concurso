/* Banco Mestre V204 — editor unificado por abas com um botão visível por imagem (catálogo editorial V198) de imagem e vínculo explícito com cartão.
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
const VALID_CARD=/^(?:CARD-\d{4,}|PROP-IJUI-\d+|IJUI-[A-Z0-9_-]+)$/i;
const VALID_REF=/^(?:CARD-\d{4,}|PROP-IJUI-\d+|IJUI-[A-Z0-9_-]+|PETRO\d+-C\d{3})$/i;
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
 return {type:refs.length?'cartao':'pendente',subtype:refs.length?'explicacao':'',cardIds:refs,origin:refs.length?'documentado':'pendente'};
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
  const q=$('bm084-search');if(q){q.value=imageId.slice('DRIVE-IMG-'.length);q.dispatchEvent(new Event('input'));}
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
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
 const dialog=el('dialog','bm202-image-dialog bm206-editor-dialog bm228-dialog');current=dialog;
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
 link.target='_blank';link.rel='noopener noreferrer';visual.append(picture,link);
 const tabs=el('div','bm228-tabs'),panels={},buttons={};
 for(const [name,label] of [['data','Informações'],['links','Tipo e cartões'],['tech','Arquivo e backup']]){
  const b=el('button','',label);b.type='button';b.setAttribute('role','tab');
  const p=el('section','bm228-panel');p.hidden=name!=='data';
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
 fields.title.focus();
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
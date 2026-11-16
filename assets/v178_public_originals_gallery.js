/* V178: Galeria de imagens compartilhadas das conversas 11-14, sem OAuth.
   Arquivos privados antigos e SRS inalterados. */
(function(){
'use strict';
const CAT='assets/v178_conversation_images_catalog.json?v=178';
const folders={
 '11':'1xTlMDBfdg_aDD6cnQJAsmY7aSw4WIhhq',
 '12':'11V6tryYHfomdwBRjtRHJnzhz0skpQtOq',
 '13':'1fHM4lyFaTj0Fr4UEMkCDlNhtT6ArgTTx',
 '14':'1_ycZC8GiM2jMYEP74DL2FAH_E2-_P8E9'
};
let records=[],limit=24;
const $=id=>document.getElementById(id);
const el=(tag,cls,txt)=>{const o=document.createElement(tag);if(cls)o.className=cls;if(txt!==undefined)o.textContent=txt;return o};
const norm=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const validId=id=>/^[A-Za-z0-9_-]{15,}$/.test(String(id||''));
const url=f=>'https://drive.google.com/file/d/'+encodeURIComponent(f.id)+'/view';
function setup(){
 const section=$('imagens'),panel=section?.querySelector('.panel');
 if(!panel||$('bm178-gallery'))return;
 section.classList.add('bm178-new-main');
 const style=el('style');style.textContent=[
 '#imagens.bm178-new-main:not(.bm178-show-legacy)>.panel>:not(#bm178-gallery){display:none!important}',
 '#imagens #bm178-gallery{margin:0 0 20px;padding:4px 0}',
 '#bm178-gallery h2{font-size:clamp(19px,3vw,24px);margin:0 0 8px;color:#254850}',
 '#bm178-gallery .bm178-intro{font-size:13px;line-height:1.5;color:#556a6d;margin:6px 0 10px}',
 '#bm178-gallery .bm178-controls{display:flex;flex-wrap:wrap;align-items:center;gap:8px;margin:12px 0}',
 '#bm178-gallery .bm178-controls input,#bm178-gallery .bm178-controls select{box-sizing:border-box;font:13px system-ui;padding:9px;min-height:40px;max-width:100%;border:1px solid #c4d2cf;border-radius:7px;background:#fff;color:#26434a}',
 '#bm178-gallery .bm178-controls input{width:min(320px,100%)}',
 '#bm178-gallery .bm178-folderlinks{display:flex;flex-wrap:wrap;gap:8px;margin:8px 0 14px}',
 '#bm178-gallery .bm178-folderlinks a{font-size:12px;padding:7px 9px;border:1px solid #d2e0dd;border-radius:7px;text-decoration:none;background:#f7faf8;color:#31545c}',
 '#bm178-gallery .bm178-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(100%,210px),1fr));gap:12px}',
 '#bm178-gallery .bm178-card{min-width:0;background:#fff;border:1px solid #d7e3df;border-radius:9px;overflow:hidden}',
 '#bm178-gallery .bm178-picture{display:flex;align-items:center;justify-content:center;aspect-ratio:4/3;background:#f5f8f7;text-align:center;overflow:hidden}',
 '#bm178-gallery .bm178-picture img{display:block;width:100%;height:100%;object-fit:contain}',
 '#bm178-gallery .bm178-body{padding:10px 11px}',
 '#bm178-gallery .bm178-name{font-size:13px;font-weight:650;line-height:1.3;overflow-wrap:anywhere;color:#23434b;margin:7px 0}',
 '#bm178-gallery .bm178-small{font-size:11px;line-height:1.5;color:#526b70;margin:5px 0;overflow-wrap:anywhere}',
 '#bm178-gallery .bm178-view{display:block;font-size:12px;color:#176c67;font-weight:650;margin-top:8px}',
 '#bm178-gallery .bm178-status{font-size:12px;color:#526b70;margin:9px 0}',
 '#bm178-gallery button{border:1px solid #c2d2d0;border-radius:8px;background:#fff;padding:9px 12px;min-height:40px;color:#294e56;font:600 13px system-ui;cursor:pointer}',
 '#bm178-gallery #bm178-old{display:block;margin-top:13px}',
 '#bm178-gallery button:focus-visible,#bm178-gallery a:focus-visible{outline:2px solid #337d81;outline-offset:2px}',
 '@media(max-width:540px){#bm178-gallery .bm178-grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}#bm178-gallery .bm178-body{padding:8px}#bm178-gallery .bm178-name{font-size:12px}}'
 ].join('');
 document.head.append(style);
 const host=el('div');host.id='bm178-gallery';
 host.append(el('h2','', 'Imagens novas — enviadas nas conversas 11, 12, 13 e 14'));
 host.append(el('p','bm178-intro','Acesse aqui as imagens sem conectar o Google Drive: 93 arquivos compartilhados (84 recuperados e 9 cópias de referência). Os originais permanecem preservados.'));
 host.append(el('p','bm178-intro','Organização inicial pela data de cada arquivo. As relações com questões e cartões aparecem apenas quando documentadas.'));
 const tools=el('div','bm178-controls');
 const search=el('input');search.id='bm178-search';search.type='search';search.placeholder='Buscar imagem, questão ou cartão';search.setAttribute('aria-label','Buscar imagem');
 const part=el('select');part.id='bm178-part';part.setAttribute('aria-label','Filtrar parte');part.append(new Option('Todas as partes — 93 arquivos','all'));
 for(const k of Object.keys(folders))part.append(new Option('Parte '+k,k));
 const kind=el('select');kind.id='bm178-kind';kind.setAttribute('aria-label','Filtrar imagens');
 kind.append(new Option('Recuperados e cópias','all'),new Option('84 recuperados','arquivo_recuperado'),new Option('9 cópias de referência','copia_de_referencia'),new Option('Com questão identificada','linked'));
 tools.append(search,part,kind);host.append(tools);
 const fl=el('div','bm178-folderlinks');
 for(const k of Object.keys(folders)){const a=el('a','', 'Pasta '+k);a.href='https://drive.google.com/drive/folders/'+folders[k];a.target='_blank';a.rel='noopener noreferrer';fl.append(a)}
 host.append(fl);
 const status=el('p','bm178-status','Carregando catálogo de 93 imagens…');status.id='bm178-status';status.setAttribute('role','status');host.append(status);
 const grid=el('div','bm178-grid');grid.id='bm178-grid';host.append(grid);
 const more=el('button','', 'Mostrar mais imagens');more.id='bm178-more';more.type='button';more.hidden=true;host.append(more);
 const old=el('button','', 'Mostrar as 86 imagens antigas');old.id='bm178-old';old.type='button';old.setAttribute('aria-expanded','false');host.append(old);
 panel.prepend(host);
 const rerender=()=>{limit=24;render()};
 search.addEventListener('input',rerender);part.addEventListener('change',rerender);kind.addEventListener('change',rerender);
 more.addEventListener('click',()=>{limit+=24;render()});
 old.addEventListener('click',()=>{const show=section.classList.toggle('bm178-show-legacy');old.textContent=show?'Recolher as imagens antigas':'Mostrar as 86 imagens antigas';old.setAttribute('aria-expanded',String(show))});
}
function preview(f){
 const a=el('a','bm178-picture');a.href=url(f);a.target='_blank';a.rel='noopener noreferrer';a.title='Abrir imagem completa no Drive';
 const img=el('img');img.loading='lazy';img.decoding='async';img.alt=f.name;
 let tries=0;
 img.onerror=()=>{if(tries++===0){img.src='https://lh3.googleusercontent.com/d/'+encodeURIComponent(f.id)+'=w820';return;}img.remove();a.textContent='Prévia indisponível. Toque para abrir no Drive.';a.style.cssText='font-size:12px;padding:10px;color:#365a60'};
 img.src='https://drive.google.com/thumbnail?id='+encodeURIComponent(f.id)+'&sz=w820';
 a.append(img);return a;
}
function render(){
 const grid=$('bm178-grid');if(!grid)return;
 const part=$('bm178-part')?.value||'all',kind=$('bm178-kind')?.value||'all',q=norm($('bm178-search')?.value);
 const selected=records.filter(f=>(part==='all'||f.part===part)&&(kind==='all'||(kind==='linked'?(f.questions||[]).length>0:f.kind===kind))&&norm([f.name,f.part,f.image_id,(f.questions||[]).join(' '),(f.cards||[]).join(' ')].join(' ')).includes(q));
 grid.replaceChildren();
 for(const f of selected.slice(0,limit)){
  const card=el('article','bm178-card');card.append(preview(f));
  const body=el('div','bm178-body');
  body.append(el('p','bm178-small','Parte '+f.part+' · '+(f.kind==='copia_de_referencia'?'cópia de referência':'arquivo recuperado')));
  body.append(el('p','bm178-name',f.name));
  if(f.image_id)body.append(el('p','bm178-small','ID: '+f.image_id));
  if(f.questions?.length)body.append(el('p','bm178-small','Questão: '+f.questions.join(', ')));
  if(f.cards?.length)body.append(el('p','bm178-small','Cartão: '+f.cards.join(', ')));
  if(f.status?.includes('nao_aprovada'))body.append(el('p','bm178-small','Referência histórica — não homologada como material didático'));
  if(f.status==='associacao_documental_pendente')body.append(el('p','bm178-small','Vínculo com questão pendente'));
  const link=el('a','bm178-view','Abrir imagem completa');link.href=url(f);link.target='_blank';link.rel='noopener noreferrer';body.append(link);
  card.append(body);grid.append(card);
 }
 $('bm178-more').hidden=selected.length<=limit;
 $('bm178-status').textContent=selected.length+' imagem(ns) encontrada(s); '+Math.min(limit,selected.length)+' exibida(s). Sem autenticação Google.';
}
async function start(){
 setup();if(!$('bm178-gallery'))return;
 try{
  const response=await fetch(CAT,{cache:'no-store'});if(!response.ok)throw Error('HTTP '+response.status);
  const c=await response.json();if(c.schema!=='BancoMestreImagensPublicasV178'||c.records?.length!==93)throw Error('catálogo incompatível');
  if(!c.records.every(f=>validId(f.id)&&folders[f.part]&&/^image\/(png|jpeg|gif|webp)$/.test(f.mime)))throw Error('arquivo inválido');
  records=c.records;render();
 }catch(e){$('bm178-status').textContent='Não foi possível mostrar as miniaturas ('+e.message+'). Abra as pastas acima ou mostre a galeria antiga.'}
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{void start()},{once:true});else void start();
})();
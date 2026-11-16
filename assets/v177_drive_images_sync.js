/* Banco Mestre V177 — Imagens privadas do Google Drive, somente leitura.
   Descoberta por pasta após consentimento do proprietário; não publica imagens
   nem substitui os 270 registros históricos do Atlas. */
(function(){
'use strict';
const FOLDER_ID='1ksSVWrmRaRlDoG4iDtTGvfr2OnPnhnY6';
const CHAT_MEDIA_ID='1jeN1EJepn86wUI9Tfgm21L--aUI48e9H';
const INTERVAL=120000;
const PUBLIC_COUNT=86; // Somente histórico público, sem mídias privadas.
const REGISTERED_PRIVATE=15; // 1 P11, 11 P12, 3 P13 verificados em 15/11/2026.
function groupOf(file){
 if(file.origin==='chat'){
  const path=String(file.folderLabel||'');
  if(/ORIGINAIS_RECUPERADOS_CONVERSAS_11_12_13_14/i.test(path)){
   if(/COPIAS_FIEIS_IDENTIFICADAS_EM_CARTOES/i.test(path))return 'Cópias fiéis documentadas — Parte 14';
   const match=path.match(/PARTE_(1[1234])_/);
   return match?'Originais enviados — parte '+match[1]+' (data a conferir)':'Originais enviados — partes 11 a 14';
  }
  if(/01_ENG_CIVIL_ESTRUTURAS/i.test(path))return 'Conversas — Estruturas, treliças e vigas';
  if(/02_ENG_CIVIL_GEOTECNIA/i.test(path))return 'Conversas — Geotecnia';
  if(/03_ENG_CIVIL_HIDRAULICA/i.test(path))return 'Conversas — Hidráulica e saneamento';
  if(/04_ENG_CIVIL_MATERIAIS/i.test(path))return 'Conversas — Materiais e obras';
  if(/05_ENG_CIVIL_SEGURANCA/i.test(path))return 'Conversas — Segurança e normas';
  if(/06_PORTUGUES/i.test(path))return 'Conversas — Português';
  if(/07_MATEMATICA/i.test(path))return 'Conversas — Matemática';
  if(/09_ENG_CIVIL_TOPOGRAFIA/i.test(path))return 'Conversas — Topografia';
  if(/08_QUESTOES/i.test(path))return 'Conversas — Questões e diagramas';
  if(/90_TEMA_NAO_VERIFICADO/i.test(path))return 'Conversas — Assunto não verificado';
  if(/RECORTES_MARCADOS/i.test(path))return 'Conversas — Recortes normativos';
  if(/EM_AUDITORIA/i.test(path))return 'Conversas — Auditoria pendente';
  if(/NR17_PETRO12/i.test(path))return 'Conversas — Petrobras 12 / NR-17';
  return 'Conversas — Outras mídias';
 }
 const code=String(file.name||'').match(/^IMG-(P\d{2})-/i)?.[1]?.toUpperCase();
 if(code==='P11')return 'Petrobras 11 — Segurança do Trabalho';
 if(code==='P12')return /_NR17_/i.test(file.name)?'Petrobras 12 — NR-17 (Ergonomia)':'Petrobras 12 — NR-7 (PCMSO)';
 if(code==='P13')return 'Petrobras 13 — Normas Regulamentadoras';
 return file.folderLabel||'Outras imagens do Drive';
}
const SCOPE='https://www.googleapis.com/auth/drive.readonly';
const API='https://www.googleapis.com/drive/v3/files';
const MIME=new Set(['image/jpeg','image/png','image/webp','image/gif']);
const MAX_BYTES=15000000;
const INDEX_NAME='INDICE_VINCULOS_IMAGENS_P11_P14_2026-11-16_V002.json';
const RECOVERY_ID='1pp1CL9oMYVFHPPzv117DZpy1kA-wyJQo';
let indexMap=new Map();
function isRecovered(file){return file.origin==='chat'&&/ORIGINAIS_RECUPERADOS_CONVERSAS_11_12_13_14/i.test(file.folderLabel||'')&&!/COPIAS_FIEIS_IDENTIFICADAS_EM_CARTOES/i.test(file.folderLabel||'');}
function isDocumentedCopy(file){return /COPIAS_FIEIS_IDENTIFICADAS_EM_CARTOES/i.test(file.folderLabel||'');}
function linked(file){return indexMap.get(file.name)||null;}
function priorityOrder(file){return isRecovered(file)?0:isDocumentedCopy(file)?1:linked(file)?2:file.origin==='chat'?3:4;}
function linkDetails(file){
 const entry=linked(file);
 if(!entry)return null;
 return {id:entry.image_id||'',questions:entry.questions||[],candidate_questions:entry.candidate_questions||[],cards:entry.cards||[],status:entry.status||'',source:entry.source||''};
}
const salientName=/usuario|usu[aá]rio|quest[aã]o|questao|original|enunciado|diagrama|treli[cç]a|poligonal|tabela/i;
function prominent(file){
 if(file.origin!=='chat')return false;
 if(/ORIGINAIS_RECUPERADOS_CONVERSAS_11_12_13_14/i.test(file.folderLabel||''))return true;
 return salientName.test(file.name||'');
}
const legacyIds={'1PrQYQ5Y7vAy5MCCAJ4q2KzpoH_xJaNBh':'IMG-030'};
let access='',expires=0,oauth=null,checking=false,photos=[],visible=24;
const blobs=new Map(); // URLs somente em memória do navegador
const $=id=>document.getElementById(id);
function msg(s,error){const el=$('bm084-status');if(el){el.textContent=s;el.style.color=error?'#953b32':'#315e57';}}
function el(tag,cls,text){const x=document.createElement(tag);if(cls)x.className=cls;if(text!==undefined)x.textContent=text;return x;}
function validToken(){return Boolean(access&&Date.now()<expires);}
function idOf(file){return 'DRIVE-IMG-'+file.id;}
function fileLink(file){return 'https://drive.google.com/file/d/'+encodeURIComponent(file.id)+'/view';}
function title(file){return String(file.name||'Imagem').replace(/\.(png|jpe?g|webp|gif)$/i,'').replace(/_/g,' ').slice(0,170);}
function ui(){
 const host=$('imagens')?.querySelector('.panel');if(!host||$('bm084-sync'))return;
 const box=el('section','bm084-drive-images');box.id='bm084-sync';
 box.style.cssText='margin:14px 0 22px;padding:15px;border:1px solid #c9d9d5;border-radius:12px;background:#f3f8f6';
 const h=el('h3','','IMAGENS NOVAS — enviadas nas conversas 11, 12, 13 e 14');h.style.margin='0 0 8px';
 const desc=el('p','','As 84 imagens enviadas por você já foram recuperadas, mas são privadas e NÃO aparecem entre as 86 antigas. Para ver as miniaturas aqui, toque em Conectar Drive e autorize a leitura. Se não funcionar, abra uma das quatro pastas abaixo. A divisão por conversa ainda é provisória, por data.');
 desc.style.cssText='font-size:13px;margin:0 0 10px';
 const controls=el('div','');controls.style.cssText='display:flex;flex-wrap:wrap;align-items:center;gap:9px';
 const connect=el('button','','Conectar Drive e sincronizar imagens');connect.type='button';connect.id='bm084-connect';connect.disabled=true;
 const refresh=el('button','','Atualizar imagens novas');refresh.type='button';refresh.id='bm084-refresh';refresh.disabled=true;
 const folder=el('a','','Abrir pasta de imagens no Drive');folder.href='https://drive.google.com/drive/folders/'+FOLDER_ID;folder.target='_blank';folder.rel='noopener noreferrer';
 const search=el('input','');search.id='bm084-search';search.type='search';search.placeholder='Buscar Q018, CARD-1416, NR-7, imagem…';search.setAttribute('aria-label','Buscar imagens sincronizadas');search.style.cssText='padding:7px 10px;border:1px solid #bacdc7;border-radius:6px;max-width:230px';
 const group=el('select','');
 group.id='bm172-group';group.setAttribute('aria-label','Filtrar imagens recentes por prova');
 group.style.cssText='padding:7px 10px;border:1px solid #bacdc7;border-radius:6px;max-width:300px';
 group.append(new Option('Todas as imagens recentes','all'));
 const archiveLink=el('a','','Abrir acervo de conversas no Drive');
 archiveLink.href='https://drive.google.com/drive/folders/'+CHAT_MEDIA_ID;archiveLink.target='_blank';archiveLink.rel='noopener noreferrer';
 const origin=el('select','');origin.id='bm173-origin';origin.setAttribute('aria-label','Origem das imagens');
 origin.append(new Option('Imagens das conversas','chat'),new Option('Imagens recentes do Atlas','atlas'),new Option('Todas as imagens privadas','all'));
 origin.style.cssText='padding:7px 10px;border:1px solid #bacdc7;border-radius:6px';
 const priority=el('select','');priority.id='bm173-priority';priority.setAttribute('aria-label','Prioridade das imagens');
 priority.append(new Option('Originais, questões e diagramas prioritários','priority'),new Option('Todas as mídias recuperadas','all'));
 priority.style.cssText='padding:7px 10px;border:1px solid #bacdc7;border-radius:6px';
 controls.append(connect,refresh,origin,priority,search,group);
 const foldersNav=el('div','');foldersNav.style.cssText='display:flex;flex-wrap:wrap;gap:8px;margin:12px 0';
 const folderList=[
  ['Parte 11 — 23 arquivos','1xTlMDBfdg_aDD6cnQJAsmY7aSw4WIhhq'],
  ['Parte 12 — 25 arquivos','11V6tryYHfomdwBRjtRHJnzhz0skpQtOq'],
  ['Parte 13 — 18 arquivos','1fHM4lyFaTj0Fr4UEMkCDlNhtT6ArgTTx'],
  ['Parte 14 — 18 arquivos','1_ycZC8GiM2jMYEP74DL2FAH_E2-_P8E9']
 ];
 for(const [label,folderId] of folderList){
  const a=el('a','',label);a.href='https://drive.google.com/drive/folders/'+folderId;
  a.target='_blank';a.rel='noopener noreferrer';
  a.style.cssText='padding:9px 12px;background:#fff;border:1px solid #c7d1d2;border-radius:8px;color:#234b56;font-weight:650;font-size:12px;text-decoration:none';
  foldersNav.append(a);
 }
 const otherLinks=el('div','');otherLinks.style.cssText='display:flex;flex-wrap:wrap;gap:12px;font-size:12px';
 otherLinks.append(folder,archiveLink);
 const status=el('p','','Miniaturas privadas ainda não carregadas. Toque em “Conectar Drive e sincronizar imagens” ou abra diretamente as pastas 11–14 abaixo.');
 status.id='bm084-status';status.setAttribute('role','status');status.style.cssText='font-size:12px;margin:10px 0';
 const grid=el('div','');grid.id='bm084-grid';grid.style.cssText='display:grid;grid-template-columns:repeat(auto-fill,minmax(min(100%,190px),1fr));gap:12px';
 const more=el('button','','Mostrar mais imagens do Drive');more.type='button';more.id='bm084-more';more.hidden=true;more.style.marginTop='12px';
 const oldToggle=el('button','','Mostrar também as 86 imagens antigas');
 oldToggle.type='button';oldToggle.id='bm177-old-toggle';oldToggle.setAttribute('aria-expanded','false');
 oldToggle.style.cssText='margin-top:14px;padding:9px 12px;border:1px solid #bbcbd0;background:#fff;color:#24414a;border-radius:8px;font-weight:600';
 const oldHint=el('p','','O catálogo antigo está recolhido. Ele continua disponível, sem alterações.');
 oldHint.id='bm177-old-hint';oldHint.style.cssText='font-size:12px;color:#536b74;margin:8px 0 0';
 box.append(h,desc,controls,status,foldersNav,grid,more,otherLinks,oldToggle,oldHint);
 const section=$('imagens');section.classList.add('bm177-new-first');
 const styles=el('style','');
 styles.textContent=`
 #imagens.bm177-new-first:not(.bm177-show-old) :is(#bm153Results,#bm153GroupListing,#bm153Directory,#bm159AtlasOptions,.bm153Directory,.bm155ImageFilters,.bm153Toolbar,.bm-v044-atlas-controls,#imageRows,#imageCount,#moreImages,.originalHelp,#imageIndexV044){display:none!important}
 #imagens.bm177-new-first:not(.bm177-show-old) .panel>.controls{display:none!important}
 #imagens #bm084-sync{margin:0 0 22px!important;position:relative;box-sizing:border-box}
 #imagens #bm084-grid:empty{display:none!important}
 #imagens #bm084-sync button:focus-visible,#imagens #bm084-sync a:focus-visible{outline:2px solid #2c6872;outline-offset:2px}
 `;
 document.head.append(styles);
 host.prepend(box);
 oldToggle.onclick=()=>{
  const show=section.classList.toggle('bm177-show-old');
  oldToggle.textContent=show?'Ocultar as 86 imagens antigas':'Mostrar também as 86 imagens antigas';
  oldToggle.setAttribute('aria-expanded',String(show));
  oldHint.textContent=show?'Catálogo histórico aberto abaixo. As imagens novas continuam acima.':'O catálogo antigo está recolhido. Ele continua disponível, sem alterações.';
 };
 connect.onclick=()=>{if(oauth)oauth.requestAccessToken({prompt:validToken()?'':'consent'});};
 refresh.onclick=()=>{void refreshList(true);};
 search.oninput=()=>{visible=24;render();};
 group.onchange=()=>{visible=24;render();};
 origin.onchange=()=>{visible=24;render();};
 priority.onchange=()=>{visible=24;render();};
 more.onclick=()=>{visible+=24;render();};
}
function loadGIS(){return new Promise((resolve,reject)=>{
 if(window.google?.accounts?.oauth2){resolve();return;}
 const js=document.createElement('script');js.src='https://accounts.google.com/gsi/client';js.async=true;js.onload=resolve;js.onerror=()=>reject(Error('Google Identity Services indisponível'));document.head.append(js);
});}
async function init(){
 ui();if(!$('bm084-sync'))return;
 try{
  const response=await fetch('assets/drive_auth_v038.json',{cache:'no-store'});
  if(!response.ok)throw Error('Configuração OAuth indisponível');
  const conf=await response.json();if(!conf.client_id||!conf.client_id.endsWith('.apps.googleusercontent.com'))throw Error('OAuth Client ID inválido');
  await loadGIS();
  oauth=google.accounts.oauth2.initTokenClient({client_id:conf.client_id,scope:SCOPE,callback:result=>{
   if(result.error||!result.access_token){msg('Autorização recusada; imagens anteriores preservadas.',true);return;}
   access=result.access_token;expires=Date.now()+Math.max(60,Number(result.expires_in||3600)-90)*1000;
   $('bm084-refresh').disabled=false;void refreshList(true);
  },error_callback:()=>msg('Não foi possível autorizar o Drive; imagens anteriores preservadas.',true)});
  $('bm084-connect').disabled=false;
  msg('Miniaturas ainda não carregadas. Clique em Conectar Drive e autorize a leitura; depois aparecerão nesta seção, acima das imagens antigas.');
  setInterval(()=>{
   if(validToken()){void refreshList(false);return;}
   if(access){access='';$('bm084-refresh').disabled=true;msg('Sessão expirada. Reconecte para continuar a sincronização.',true);}
  },INTERVAL);
 }catch(e){msg('Sincronização indisponível: '+e.message,true);}
}
async function authorized(url){
 if(!validToken())throw Error('Conexão expirada; reconecte o Google Drive');
 const r=await fetch(url,{headers:{Authorization:'Bearer '+access},cache:'no-store'});
 if(r.status===401)throw Error('Autorização expirada');
 if(r.status===403)throw Error('Conta conectada não possui acesso à pasta/imagem');
 if(!r.ok)throw Error('Google Drive HTTP '+r.status);
 return r;
}
async function listImages(){
 // Busca recursiva: mudanças de pasta não removem imagens do Atlas privado.
 let privateIndexId='';
 const queue=[
  {id:FOLDER_ID,path:'Atlas recente',origin:'atlas'},
  {id:CHAT_MEDIA_ID,path:'04_MIDIAS',origin:'chat'}
 ],seen=new Set(),unique=new Map();
 while(queue.length){
  const folder=queue.shift();
  if(seen.has(folder.id))continue;
  seen.add(folder.id);
  if(seen.size>100)throw Error('Excesso de subpastas: revisar catálogo');
  let next='',pages=0;
  do{
   if(++pages>20)throw Error('Paginação excessiva em '+folder.path);
   const args=new URLSearchParams({q:"'"+folder.id+"' in parents and trashed = false",fields:'nextPageToken,files(id,name,mimeType,size,modifiedTime)',pageSize:'1000'});
   if(next)args.set('pageToken',next);
   const r=await authorized(API+'?'+args.toString()),data=await r.json();
   for(const file of data.files||[]){
    if(!/^[A-Za-z0-9_-]{15,}$/.test(file.id))continue;
    if(folder.id===RECOVERY_ID&&file.name===INDEX_NAME){
     privateIndexId=file.id;
     continue;
    }
    if(file.mimeType==='application/vnd.google-apps.folder'){
     queue.push({id:file.id,path:folder.path?folder.path+' / '+file.name:file.name,origin:folder.origin});
    }else if(MIME.has(file.mimeType)&&Number(file.size||0)<=MAX_BYTES){
     unique.set(file.id,{...file,origin:folder.origin,folderLabel:folder.path||'Atlas'});
    }
   }
   next=data.nextPageToken||'';
  }while(next);
  if(unique.size>1500)throw Error('Excesso de imagens: rever limite');
 }
 const updated=new Map();
 if(privateIndexId){
  try{
   const response=await authorized(API+'/'+encodeURIComponent(privateIndexId)+'?alt=media');
   const data=await response.json();
   if(data.schema!=='banco-mestre-imagens-vinculos-v1'||!Array.isArray(data.records)||data.records.length>500)throw Error('Formato do índice inválido');
   for(const item of data.records){
    if(typeof item.filename!=='string'||item.filename.length>250||updated.has(item.filename))continue;
    updated.set(item.filename,item);
   }
  }catch(error){console.warn('Índice privado dos vínculos não carregado:',error);}
 }
 indexMap=updated;
 return [...unique.values()].sort((a,b)=>
  priorityOrder(a)-priorityOrder(b)||
  groupOf(a).localeCompare(groupOf(b),'pt-BR')||
  a.name.localeCompare(b.name,'pt-BR'));
}
async function getImageUrl(file){
 const prior=blobs.get(file.id);
 if(prior&&prior.modified===file.modifiedTime)return prior.url;
 if(!validToken())throw Error('Reconecte o Drive para abrir a imagem');
 const r=await authorized(API+'/'+encodeURIComponent(file.id)+'?alt=media');
 const blob=await r.blob();if(!MIME.has(blob.type))throw Error('Formato não suportado');if(blob.size>MAX_BYTES)throw Error('Imagem maior que 15 MB');
 const url=URL.createObjectURL(blob);
 if(prior)URL.revokeObjectURL(prior.url);
 blobs.set(file.id,{url,modified:file.modifiedTime});
 return url;
}
async function openImage(file){
 try{
  msg('Abrindo imagem '+title(file)+'...');
  const src=await getImageUrl(file);
  const image=new Image();image.src=src;await image.decode();
  if(typeof window.BancoMestreEditorV030?.open==='function'){
   await window.BancoMestreEditorV030.open({image,imageId:idOf(file),title:title(file),
    quality:'Arquivo original autenticado do Google Drive — '+file.mimeType,
    sourceUrl:fileLink(file),
    warning:'Grifos deste ID são salvos apenas neste navegador. O Drive e os 270 IDs anteriores permanecem intactos.'});
  }else window.open(src,'_blank','noopener,noreferrer');
  msg('Imagem aberta. Marcações locais preservadas pelo ID '+idOf(file)+'.');
 }catch(e){msg('Não foi possível abrir: '+e.message+'. Use Original no Drive.',true);}
}
function loadPreview(img,file){
 if(!validToken())return;
 getImageUrl(file).then(url=>{if(img.isConnected)img.src=url;}).catch(()=>{if(img.isConnected)img.alt='Prévia indisponível. Abra no Drive.';});
}
function render(){
 const grid=$('bm084-grid');if(!grid)return;grid.replaceChildren();
 const q=($('bm084-search')?.value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
 const chosen=$('bm172-group')?.value||'all';
 const origin=$('bm173-origin')?.value||'chat';
 const priority=$('bm173-priority')?.value||'priority';
 const items=photos.filter(f=>
  (origin==='all'||f.origin===origin)&&
  (origin!=='chat'||priority==='all'||prominent(f))&&
  (chosen==='all'||groupOf(f)===chosen)&&
  [f.name,groupOf(f),f.folderLabel,linked(f)?.image_id,...(linked(f)?.questions||[]),...(linked(f)?.cards||[]),...(linked(f)?.candidate_questions||[])].join(' ').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().includes(q));
 for(const file of items.slice(0,visible)){
  const card=el('article','');card.style.cssText='background:white;border:1px solid #d5e2dd;border-radius:9px;padding:10px;min-width:0';
  const pic=el('img','');pic.loading='lazy';pic.alt='Prévia de '+title(file);pic.style.cssText='width:100%;height:140px;object-fit:contain;background:#f8faf8;border-radius:5px;cursor:zoom-in';
  pic.onclick=()=>{void openImage(file)};
  const h=el('h4','',title(file));h.style.cssText='font-size:13px;line-height:1.3;margin:7px 0;overflow-wrap:anywhere';
  const area=el('small','',groupOf(file));area.style.cssText='display:block;color:#34615d;font-size:11px;margin:4px 0';
  const details=linkDetails(file);
  const id=el('small','',(details?.id||legacyIds[file.id]||'ID a conferir')+' · '+idOf(file));id.style.cssText='display:block;color:#52656a;font-size:10px;overflow-wrap:anywhere';
  const actions=el('div','');actions.style.cssText='display:flex;gap:8px;flex-wrap:wrap;margin-top:8px';
  const open=el('button','','Abrir e grifar');open.type='button';open.style.fontSize='12px';open.onclick=()=>{void openImage(file)};
  const link=el('a','','Original no Drive');link.href=fileLink(file);link.target='_blank';link.rel='noopener noreferrer';link.style.fontSize='12px';
  actions.append(open,link);
  const detailBox=el('div','');
  if(details){
   const caption=el('small','',[
    details.questions.length?'Questão: '+details.questions.join(' / '):'',
    details.cards.length?'Cartão: '+details.cards.join(' / '):''
   ].filter(Boolean).join(' · '));
   caption.style.cssText='display:block;font-weight:650;font-size:11px;margin:5px 0;color:#214b53';
   if(details.candidate_questions.length){
    const cand=el('small','','Possível questão: '+details.candidate_questions.join(' / ')+' — associação NÃO confirmada');
    cand.style.cssText='display:block;color:#845a23;font-size:11px;margin:5px 0';
    detailBox.append(cand);
   }
   detailBox.append(caption);
   const warning=el('small','',details.status==='associacao_provavel_nao_confirmada'?'Questão possível, não vincular ao cartão sem confirmação.':
   details.status==='referencia_historica_nao_aprovada_para_atlas'?
    'Referência histórica: não autorizada no catálogo ativo do Atlas.':
    details.status.startsWith('copia_fiel_')?'Cópia fiel documentada; não confundir com o anexo original.':
    details.status.includes('norma_verificar')?'Vínculo documentado; conteúdo normativo a verificar.':
    'Vínculo documentado em checkpoint; questão/cartão não necessariamente publicado.');
   warning.style.cssText='display:block;font-size:11px;margin:5px 0;color:#845a23';
   detailBox.append(warning);
   for(const cardId of details.cards){
    if(/^CARD-\d{4,}$/.test(cardId)&&Number(cardId.slice(5))<=1499){
     const cardLink=el('a','','Abrir '+cardId);
     cardLink.href='./?cartao='+encodeURIComponent(cardId);
     cardLink.style.cssText='display:inline-block;margin:3px 8px 3px 0;font-size:12px';
     detailBox.append(cardLink);
    }
   }
  }
  if(file.origin==='chat'){
   const warning=el('small','', /ORIGINAIS_RECUPERADOS_CONVERSAS/i.test(file.folderLabel||'')?
    'Arquivo enviado e recuperado; parte agrupada por data, vínculo exato com conversa/cartão a conferir':
    'Imagem recuperada das conversas — vínculo com cartão e validação técnica pendentes');
   warning.style.cssText='display:block;color:#845a23;font-size:11px;margin-top:5px';
   card.append(pic,h,area,id,detailBox,warning,actions);
  }else card.append(pic,h,area,id,detailBox,actions);
  grid.append(card);
  loadPreview(pic,file);
 }
 const more=$('bm084-more');if(more)more.hidden=items.length<=visible;
}
async function refreshList(force){
 if(checking)return;if(!validToken()){msg('Conecte sua conta Google para sincronizar imagens.',true);return;}
 checking=true;const button=$('bm084-refresh');if(button)button.disabled=true;
 try{
  msg('Carregando as imagens originais das conversas pelo Drive…');
  const incoming=await listImages();
  const old=new Map(photos.map(x=>[x.id,x.modifiedTime]));
  const current=new Set(incoming.map(x=>x.id));
  let newCount=incoming.filter(x=>!old.has(x.id)).length;
  let edits=incoming.filter(x=>old.has(x.id)&&old.get(x.id)!==x.modifiedTime).length;
  for(const [id,data] of blobs)if(!current.has(id)||incoming.find(x=>x.id===id)?.modifiedTime!==data.modified){URL.revokeObjectURL(data.url);blobs.delete(id);}
  photos=incoming;
  const sel=$('bm172-group');
  if(sel){
   const previous=sel.value;
   const groups=[...new Set(photos.map(groupOf))].sort((a,b)=>a.localeCompare(b,'pt-BR'));
   sel.replaceChildren(new Option('Todas as imagens recentes','all'));
   for(const key of groups)sel.add(new Option(key+' ('+photos.filter(f=>groupOf(f)===key).length+')',key));
   sel.value=groups.includes(previous)?previous:'all';
  }
  render();
  msg('Imagens novas disponíveis acima: '+photos.filter(x=>isRecovered(x)).length+' arquivos recuperados das partes 11–14; '+[...indexMap.values()].filter(x=>x.status!=='associacao_provavel_nao_confirmada').length+' vínculos documentados e '+[...indexMap.values()].filter(x=>x.status==='associacao_provavel_nao_confirmada').length+' possíveis não confirmados; '+photos.length+' mídias privadas acessíveis no total'+(force?'':'; '+newCount+' nova(s), '+edits+' atualizada(s)')+'. Verificação a cada 2 minutos enquanto conectado. Os 270 registros originais continuam separados.');
 }catch(e){msg('Falha na sincronização: '+e.message+'. Imagens carregadas anteriormente preservadas.',true);}
 finally{checking=false;if(button&&validToken())button.disabled=false;}
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{void init()},{once:true});else void init();
})();
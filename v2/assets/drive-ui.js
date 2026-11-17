import {loadSnapshot} from './data.js';
import {updateDriveAtlas} from './app.js';
import {DriveReadonly} from './drive.js';
import {mountReconciliation} from './audit-ui.js';
import {mountPdfIdProbe} from './catalog-probe-ui.js';
import {mountOAuthDiagnostics} from './oauth-readiness-ui.js';
import {mountImageAssociationAudit} from './image-associations-ui.js';
import {attachPdfReaderAction,registerPdfDrive} from './pdf-reader.js';

/* UI privada do Drive, isolada da V1 e do estado SRS/IndexedDB.
   O grupo de imagens adicionais aparece DENTRO da aba Atlas, não como galeria externa. */
const $=id=>document.getElementById(id);
const format=n=>Number(n||0).toLocaleString('pt-BR');
const dom=(tag,cls='',label='')=>{
  const item=document.createElement(tag);if(cls)item.className=cls;
  if(label!==undefined)item.textContent=String(label);return item;
};
let service=null,busy=false,connected=false,lastScan=0,prepared=false;
let auditPanel=null;
let pdfLimit=30;
const previews=new Map();
const timeString=iso=>{
  if(!iso)return 'não verificado';
  const d=new Date(iso);
  return Number.isNaN(d.getTime())?'não verificado':d.toLocaleString('pt-BR');
};
function previewClear(){
  for(const url of previews.values())URL.revokeObjectURL(url);
  previews.clear();
  document.querySelectorAll('.bm-v2-drive-preview').forEach(img=>img.remove());
}
function message(value,error=false){
  const x=$('v2DriveNote');
  if(!x)return;
  x.textContent=value;x.classList.toggle('is-error',error);
}
function addToolbar(){
  const toolbar=dom('section','drive-toolbar');
  toolbar.setAttribute('aria-label','Google Drive');
  toolbar.id='v2DriveToolbar';
  const label=dom('strong','', 'Google Drive');
  const connect=dom('button','drive-connect','Conectar');
  connect.type='button';connect.id='v2DriveConnect';connect.disabled=true;
  const scan=dom('button','drive-refresh','Atualizar acervo');
  scan.type='button';scan.id='v2DriveRefresh';scan.disabled=true;
  const disconnect=dom('button','drive-disconnect','Sair');
  disconnect.type='button';disconnect.id='v2DriveDisconnect';disconnect.disabled=true;
  const dot=dom('span','drive-state','Não conectado');
  dot.id='v2DriveState';
  const note=dom('div','drive-note','Preparando autenticação de leitura...');
  note.id='v2DriveNote';note.setAttribute('role','status');note.setAttribute('aria-live','polite');
  toolbar.append(label,dot,connect,scan,disconnect,note);
  $('notice').insertAdjacentElement('afterend',toolbar);
  connect.addEventListener('click',()=>{
    if(!prepared||!service)return;
    try{service.connect()}catch(error){message(error.message,true)}
  });
  scan.addEventListener('click',()=>{void scanBoth(true)});
  disconnect.addEventListener('click',()=>{
    if(auditPanel?.hasPendingReview?.()&&
      !confirm('Existem decisões de vínculos sem checkpoint exportado. Sair apagará essas decisões da memória. Deseja continuar?'))return;
    service?.disconnect();
    message('Drive desconectado. Metadados privados e prévias retirados desta página.');
    renderPrivate();
  });
}
function addRegion(parentId,afterId,descriptionId,kind){
  const parent=$(parentId),anchor=$(afterId);
  if(!parent||!anchor)return;
  const box=dom('section','drive-region');
  box.id=kind==='image'?'v2PrivateImages':'v2PrivatePdfs';
  const top=dom('div','drive-region-head');
  const heading=dom('h3','',kind==='image'?'Imagens adicionais do Drive':'PDFs adicionais do Drive');
  const count=dom('span','meta','Não consultados');count.id=kind==='image'?'v2ImageSyncCount':'v2PdfSyncCount';
  top.append(heading,count);
  const desc=dom('p','helper',kind==='image'?
    'Arquivos novos encontrados nas pastas oficiais após autorização, sem duplicar os 93 originais recuperados do Atlas V198. Sem curadoria comprovada, o tipo permanece pendente.':
    'Documentos localizados no Drive que ainda não constam dos 78 IDs do catálogo público V149. A lista é temporária e não altera o GitHub.');
  const list=dom('div','item-list');list.id=kind==='image'?'v2DriveImagesList':'v2DrivePdfsList';
  const more=dom('button','drive-more','Mostrar mais');
  more.type='button';more.id=kind==='image'?'v2DriveMoreImages':'v2DriveMorePdfs';more.hidden=true;
  more.addEventListener('click',()=>{
    if(kind==='image'){imageLimit+=30;renderImages()}else{pdfLimit+=30;renderPdfs()}
  });
  box.append(top,desc,list,more);
  // Complementos privados aparecem no Atlas antes da lista pública extensa.
  anchor.insertAdjacentElement(kind==='image'?'beforebegin':'afterend',box);
}
function updateControls(){
  if(!service)return;
  connected=service.connected;
  $('v2DriveConnect').disabled=!prepared||busy;
  $('v2DriveRefresh').disabled=!connected||busy;
  $('v2DriveDisconnect').disabled=!connected||busy;
  $('v2DriveConnect').hidden=connected;
  $('v2DriveDisconnect').hidden=!connected;
  const state=$('v2DriveState');state.textContent=connected?'Conectado · leitura':'Não conectado';
  state.classList.toggle('is-connected',connected);
}
async function scanBoth(manual=false){
  if(!service||busy||!service.connected)return;
  busy=true;updateControls();
  message('Consultando imagens e PDFs do Drive. Nenhum arquivo será enviado ou publicado.');
  try{
    let errors=[];
    for(const kind of ['image','pdf']){
      if(!service.connected)break;
      try{
        const result=await service.scan(kind);
        if(kind==='pdf')renderPdfs();
        message((kind==='image'?'Atlas':'PDFs')+': '+format(result.found)+' arquivos localizados em '+
          format(result.folderCount)+' pastas. Verificando '+(kind==='image'?'PDFs...':'conclusão...'));
      }catch(e){errors.push((kind==='image'?'Atlas':'PDFs')+': '+e.message);}
    }
    lastScan=Date.now();
    const i=service.lastImages,p=service.lastPdfs;
    const fragments=[];
    if(i)fragments.push('Imagens: '+format(i.found)+' listadas, '+format(i.newFiles)+' fora do catálogo público');
    if(p)fragments.push('PDFs: '+format(p.found)+' listados, '+format(p.newFiles)+' fora do catálogo público');
    if(errors.length)message(fragments.join(' · ')+' · Falhas: '+errors.join(' / '),true);
    else message(fragments.join(' · ')+'. Leitura de sessão; publicação GitHub não realizada.');
  }finally{
    busy=false;updateControls();showSyncStatus();
  }
}
function infoChip(label){return dom('span','tag',label)}
function previewButton(file,outer){
  if(!file.previewAllowed)return;
  const button=dom('button','','Ver prévia');
  button.type='button';
  button.addEventListener('click',async()=>{
    if(!service?.connected){message('Reconecte o Drive para carregar a imagem.',true);return}
    button.disabled=true;button.textContent='Carregando imagem...';
    try{
      const blob=await service.preview(file);
      if(!service.connected)throw Error('Sessão Drive encerrada');
      const url=URL.createObjectURL(blob);
      const old=previews.get(file.id);if(old)URL.revokeObjectURL(old);
      previews.set(file.id,url);
      outer.querySelector('.bm-v2-drive-preview')?.remove();
      const img=dom('img','bm-v2-drive-preview');
      img.alt='Prévia autorizada: '+file.name;
      img.loading='lazy';img.decoding='async';
      img.addEventListener('load',()=>auditPanel?.markPreviewed(file.id),{once:true});
      img.src=url;
      img.addEventListener('error',()=>{img.remove();message('Formato não pôde ser exibido; use Abrir original.',true)},{once:true});
      outer.append(img);
      button.textContent='Atualizar prévia';
    }catch(e){message('Prévia '+file.name+': '+e.message,true);button.textContent='Ver prévia'}
    finally{button.disabled=false}
  });
  return button;
}
function renderImages(){
  // Uma única lista Atlas: esta camada só entrega os metadados autorizados
  // ao renderizador principal. As miniaturas são carregadas após clique.
  previewClear();
  const result=service?.connected?service.lastImages:null;
  updateDriveAtlas(result?.files||[],result?previewButton:null);
  publishAtlasCount();
}
function renderPdfs(){
  const list=$('v2DrivePdfsList');if(!list||!service)return;
  list.replaceChildren();
  const result=service.connected?service.lastPdfs:null;
  $('v2PdfSyncCount').textContent=result?
    format(result.newFiles)+' adicionais · '+format(result.alreadyCataloged)+' conhecidos · '+timeString(result.checkedAt):
    'Não consultado nesta sessão';
  if(!result){list.append(dom('p','helper','Conecte sua conta Google para consultar PDFs adicionais. A biblioteca pública permanece disponível acima.'));return}
  const query=$('pdfQuery').value.trim().toLocaleLowerCase('pt-BR');
  const pending=result.files.filter(f=>!f.isInPublicCatalog).filter(f=>
    !query||[f.id,f.name,f.path].some(x=>String(x).toLocaleLowerCase('pt-BR').includes(query)));
  if(!pending.length){list.append(dom('p','helper','Nenhum PDF adicional encontrado para o filtro atual.'));$('v2DriveMorePdfs').hidden=true;return}
  for(const file of pending.slice(0,pdfLimit)){
    const item=dom('article','item drive-private-item');
    item.append(dom('div','meta','ID Drive: '+file.id),
      dom('h3','item-title',file.name),dom('p','muted',file.path+' · '+timeString(file.modifiedTime)));
    const actions=dom('div','item-actions');
    const link=dom('a','','Abrir PDF original no Drive');
    link.href=file.webUrl;link.target='_blank';link.rel='noopener noreferrer';
    actions.append(link,infoChip('Não publicado no catálogo V149'));
    attachPdfReaderAction(actions,{id:'DRIVE-PDF-'+file.id,file_id:file.id,filename:file.name,title:file.name});
    item.append(actions);list.append(item);
  }
  const more=$('v2DriveMorePdfs');more.hidden=pending.length<=pdfLimit;
  if(!more.hidden)more.textContent='Mostrar mais ('+format(pending.length-pdfLimit)+' restantes)';
}
function renderPrivate(){renderImages();renderPdfs();updateControls();showSyncStatus();auditPanel?.refresh()}
function publishAtlasCount(){
  document.dispatchEvent(new CustomEvent('v2-drive-images-updated',{
    detail:service?.connected&&service.lastImages?{
      newFiles:service.lastImages.newFiles,found:service.lastImages.found,
      alreadyCataloged:service.lastImages.alreadyCataloged,checkedAt:service.lastImages.checkedAt
    }:null
  }));
}
function showSyncStatus(){
  const target=$('v2DriveDetails');if(!target||!service)return;
  target.replaceChildren();
  const i=service.lastImages,p=service.lastPdfs;
  const lines=[
    ['Autorização',service.connected?'Ativa apenas nesta sessão do navegador':'Sem autorização ativa'],
    ['Última atualização de imagens',i?timeString(i.checkedAt):'Não realizada'],
    ['Imagens já catalogadas / adicionais',i?format(i.alreadyCataloged)+' / '+format(i.newFiles):'Não verificado'],
    ['Última atualização de PDFs',p?timeString(p.checkedAt):'Não realizada'],
    ['PDFs catalogados / adicionais',p?format(p.alreadyCataloged)+' / '+format(p.newFiles):'Não verificado'],
    ['Publicação no GitHub','Não realizada: esta etapa somente consulta o Drive']
  ];
  for(const [key,value] of lines){
    const item=dom('div','check');
    item.append(dom('strong','',key),dom('span','',value));target.append(item);
  }
}
function attachEvents(){
  $('pdfQuery').addEventListener('input',()=>{pdfLimit=30;renderPdfs()});
}
async function initialize(){
  addToolbar();
  addRegion('view-pdfs','pdfsList','pdfs-title','pdf');
  const sync=dom('section','panel');
  const heading=dom('h3','','Relatório da leitura privada');
  const details=dom('div','checks');details.id='v2DriveDetails';
  sync.append(heading,details);
  $('view-sync')?.append(sync);
  attachEvents();
  try{
    const snapshot=await loadSnapshot();
    const publicImageIds=[...snapshot.recoveredByImageId.values()].map(x=>x.driveFileId||x.id).filter(Boolean);
    const publicPdfIds=snapshot.pdf.documents.map(x=>x.file_id).filter(Boolean);
    service=new DriveReadonly({contract:snapshot.storage,publicImageIds,publicPdfIds});
    registerPdfDrive(service);
    mountOAuthDiagnostics(service,snapshot.pdf.documents[0],$('view-sync'));
    auditPanel=mountReconciliation(snapshot,service,$('view-sync'));
    mountImageAssociationAudit(snapshot,service,$('view-sync'));
    mountPdfIdProbe(snapshot,service,$('view-sync'));

    service.onChange(event=>{
      if(event.type==='connected'){
        // Uma nova conta/token nunca herda miniaturas ou títulos da anterior.
        renderPrivate();
        message('Drive autorizado somente para leitura. Iniciando consulta das pastas monitoradas.');
        updateControls();void scanBoth();
      }else if(['expired','disconnected'].includes(event.type)){
        auditPanel?.clear();
        renderPrivate();
        if(event.type==='expired')message('Autorização expirada; reconecte para consultar mídias privadas.',true);
      }else if(event.type==='scan-done'){
        auditPanel?.refresh();
        if(event.kind==='image')renderImages();
      }
      else if(event.type==='auth-error')message(event.message,true);
      else if(event.type==='scan-error')message('Falha na varredura: '+event.message,true);
    });
    renderPrivate();
    await service.prepare();
    prepared=true;message('Pronto. Clique em Conectar para autorizar leitura das pastas do Drive.');
    updateControls();
    setInterval(()=>{
      if(!document.hidden&&service?.connected&&!busy&&Date.now()-lastScan>=120000)void scanBoth();
      else if(service&&!service.connected)updateControls();
    },120000);
    document.addEventListener('visibilitychange',()=>{
      if(!document.hidden&&service?.connected&&!busy&&Date.now()-lastScan>=120000)void scanBoth();
    });
  }catch(e){
    service?.emit('prepare-error');
    message('Drive indisponível nesta prévia: '+e.message,true);
    $('v2DriveState').textContent='Indisponível';
  }
}
void initialize();

import {sourceHash,inspectLegacyHighlights,legacySnapshot,MAX_PDF_BYTES} from './pdf-compat.js';

/* V2 PDF preview — browser-local or OAuth Drive, read-only.
 * NEVER imports, migrates, merges or edits historical highlights.
 * Original bytes and token remain in memory; no IndexedDB/localStorage writes.
 */
const api={drive:null,dialog:null,doc:null,url:'',abort:null,identity:'',inspected:null,remote:false};
const el=(tag,cls='',label)=>{
  const x=document.createElement(tag);
  if(cls)x.className=cls;
  if(label!==undefined)x.textContent=String(label);
  return x;
};
const isDriveId=id=>/^[A-Za-z0-9_-]{10,200}$/.test(String(id||''));
const isDocumentId=id=>/^[A-Za-z0-9_-]{3,150}$/.test(String(id||''));
function note(value,error=false){
 const target=document.getElementById('v2PdfReaderNote');
 if(!target)return;
 target.textContent=value;target.classList.toggle('is-error',error);
}
function clearBytes(){
 api.abort?.abort();api.abort=null;
 if(api.url){URL.revokeObjectURL(api.url);api.url=''}
 const frame=document.getElementById('v2PdfReaderFrame');
 if(frame)frame.removeAttribute('src');
 const identity=document.getElementById('v2PdfReaderIdentity');
 if(identity)identity.textContent='Nenhum PDF carregado';
 const notes=document.getElementById('v2PdfReaderMarks');
 if(notes)notes.replaceChildren();
 const exportButton=document.getElementById('v2PdfExportHighlights');
 if(exportButton)exportButton.disabled=true;
 api.identity='';api.inspected=null;api.remote=false;
}
export function closePdfReader(){
 if(!api.dialog)return;
 clearBytes();api.doc=null;
 if(api.dialog.open)api.dialog.close();
}
function buildModal(){
 if(api.dialog)return api.dialog;
 const dialog=el('dialog','v2-pdf-dialog');dialog.id='v2PdfDialog';
 dialog.setAttribute('aria-label','Leitor de PDF — somente leitura');
 const panel=el('div','v2-pdf-shell');
 const top=el('div','v2-pdf-top');
 const title=el('h2','','Leitor PDF · somente leitura');title.id='v2PdfReaderTitle';
 const close=el('button','v2-pdf-close','Fechar');close.type='button';
 close.addEventListener('click',closePdfReader);
 top.append(title,close);
 const buttons=el('div','v2-pdf-controls');
 const local=el('button','','Escolher PDF local');local.type='button';local.id='v2PdfLocal';
 const input=el('input');input.type='file';input.accept='.pdf,application/pdf';input.hidden=true;input.id='v2PdfInput';
 local.addEventListener('click',()=>input.click());
 input.addEventListener('change',async()=>{
  const file=input.files?.[0];input.value='';
  if(!file)return;
  if(file.size>MAX_PDF_BYTES){note('Arquivo acima de 120 MB: abertura local bloqueada.',true);return}
  try{await openBuffer(await file.arrayBuffer(),file.name,false)}
  catch(e){note('Falha ao abrir PDF local: '+e.message,true)}
 });
 const remote=el('button','','Ler do Drive autorizado');remote.type='button';remote.id='v2PdfRemote';
 remote.addEventListener('click',()=>{void openRemote()});
 const inspect=el('button','','Conferir grifos desta versão');inspect.type='button';
 inspect.id='v2PdfInspect';inspect.disabled=true;
 inspect.addEventListener('click',inspectMarks);
 const download=el('button','','Backup dos grifos deste PDF');download.type='button';
 download.id='v2PdfExportHighlights';download.disabled=true;
 download.addEventListener('click',backupMarks);
 buttons.append(local,input,remote,inspect,download);
 const help=el('p','helper',
  'Este leitor apenas exibe os bytes escolhidos. Grifos da V1 dependem do mesmo ID e hash de conteúdo; a V2 não os redesenha nem altera. Para edição, use a V1.');
 const status=el('p','v2-pdf-note','Escolha um arquivo local ou autorize o Google Drive.');
 status.id='v2PdfReaderNote';status.setAttribute('role','status');status.setAttribute('aria-live','polite');
 const signature=el('p','v2-pdf-identity','Nenhum PDF carregado');signature.id='v2PdfReaderIdentity';
 const markContainer=el('div','v2-pdf-marks');markContainer.id='v2PdfReaderMarks';
 const frame=el('iframe','v2-pdf-frame');frame.id='v2PdfReaderFrame';
 frame.title='Visualização somente leitura do PDF';frame.referrerPolicy='no-referrer';
 frame.setAttribute('loading','lazy');
 panel.append(top,buttons,help,status,signature,markContainer,frame);
 dialog.append(panel);document.body.append(dialog);
 dialog.addEventListener('cancel',e=>{e.preventDefault();closePdfReader()});
 dialog.addEventListener('close',()=>{clearBytes();api.doc=null});
 api.dialog=dialog;return dialog;
}
async function openBuffer(buffer,filename,remote=false){
 clearBytes();
 const digest=await sourceHash(buffer);
 if(!api.doc||!isDocumentId(api.doc.id))throw Error('Documento sem ID canônico');
 const blob=new Blob([buffer],{type:'application/pdf'});
 const url=URL.createObjectURL(blob);
 api.url=url;api.identity=digest;api.inspected=null;api.remote=remote;
 const frame=document.getElementById('v2PdfReaderFrame');
 frame.src=url+'#toolbar=1&navpanes=0';
 document.getElementById('v2PdfReaderIdentity').textContent=
  'ID: '+api.doc.id+' · SHA-256 (12 bytes iniciais): '+digest+
  ' · Tamanho: '+(buffer.byteLength/1048576).toFixed(2)+' MiB';
 document.getElementById('v2PdfInspect').disabled=false;
 note('PDF '+filename+' aberto em modo de visualização ('+(remote?'Drive autorizado':'arquivo local')+
  '). Não foi gravado no navegador, Drive ou GitHub. Os grifos históricos ainda não foram lidos.');
}
async function openRemote(){
 if(!api.doc?.fileId||!isDriveId(api.doc.fileId)){note('Este item não possui ID de arquivo Drive válido.',true);return}
 if(!api.drive?.connected){note('Conecte o Google Drive pela barra principal; nenhuma autorização automática será solicitada.',true);return}
 api.abort?.abort();api.abort=new AbortController();
 const controller=api.abort;
 const button=document.getElementById('v2PdfRemote');button.disabled=true;
 note('Lendo o PDF pela autorização atual do Google Drive...');
 try{
  const endpoint='https://www.googleapis.com/drive/v3/files/'+encodeURIComponent(api.doc.fileId)+'?alt=media';
  const response=await api.drive.authorized(endpoint,{signal:controller.signal});
  const size=Number(response.headers.get('content-length')||0);
  if(size>MAX_PDF_BYTES)throw Error('PDF acima do limite de leitura de 120 MB');
  const buffer=await response.arrayBuffer();
  if(api.abort!==controller||!api.dialog?.open)return;
  await openBuffer(buffer,api.doc.filename||api.doc.title||api.doc.id,true);
 }catch(error){
  if(error?.name!=='AbortError')note('Leitura do Drive não concluída: '+error.message,true);
 }finally{
  button.disabled=false;
  if(api.abort===controller)api.abort=null;
 }
}
function inspectMarks(){
 if(!api.doc||!api.identity)return;
 try{
  const report=inspectLegacyHighlights(localStorage,api.doc.id,api.identity);
  api.inspected=report;
  const box=document.getElementById('v2PdfReaderMarks');box.replaceChildren();
  const total=el('p','',
    'Grifos nesta revisão (estimativa): '+report.counts.marks+' · Texto: '+report.counts.text+
    ' · Outros traços: '+report.counts.other+' · Páginas: '+report.counts.pages);
  box.append(total);
  if(report.otherVersions.length){
   const versions=el('p','v2-pdf-warning',
    'Existem grifos registrados para '+report.otherVersions.length+
    ' outra(s) versão(ões) deste mesmo ID. Os hashes são diferentes: nenhum grifo será transferido automaticamente.');
   box.append(versions);
  }
  if(report.warning)box.append(el('p','v2-pdf-warning',report.warning));
  if(report.pages.length){
   const table=el('table','v2-pdf-mark-table'),thead=el('thead'),hr=el('tr');
   for(const label of ['Página','Grifos estimados','Texto','Outros']){
    hr.append(el('th','',label));
   }thead.append(hr);table.append(thead);
   const tbody=el('tbody');
   for(const page of report.pages){
    const row=el('tr');
    for(const value of [page.page,page.active,page.textHighlights,page.otherMarks])row.append(el('td','',value));
    tbody.append(row);
   }
   table.append(tbody);box.append(table);
   document.getElementById('v2PdfExportHighlights').disabled=false;
  }
  note('Auditoria local concluída, somente leitura. Grifos não foram modificados nem importados.');
 }catch(e){api.inspected=null;note('Não foi possível auditar grifos: '+e.message,true)}
}
function backupMarks(){
 if(!api.doc||!api.identity||!api.inspected)return;
 if(!confirm('O backup inclui conteúdo privado de grifos desta revisão de PDF. Salvar somente neste dispositivo?'))return;
 try{
  const payload=legacySnapshot(localStorage,api.doc.id,api.identity);
  const bytes=new Blob([JSON.stringify(payload,null,2)],{type:'application/json'});
  const url=URL.createObjectURL(bytes);
  const a=el('a');a.href=url;a.download='BM_V2_Grifos_'+api.doc.id+'_'+api.identity+'.json';
  document.body.append(a);a.click();a.remove();
  setTimeout(()=>URL.revokeObjectURL(url),2000);
  note('Cópia local exportada. Nenhum dado importado, apagado ou transmitido.');
 }catch(e){note('Falha ao gerar backup: '+e.message,true)}
}
export function registerPdfDrive(service){
 api.drive=service||null;
 if(service){
  service.onChange(event=>{
   if(['disconnected','expired'].includes(event.type)&&api.remote)closePdfReader();
  });
 }
}
export function attachPdfReaderAction(host,doc){
 if(!host||!isDocumentId(doc?.id))return;
 const action=el('button','v2-pdf-action','Ler PDF na V2');
 action.type='button';
 action.addEventListener('click',()=>{
  closePdfReader();
  api.doc={
   id:doc.id,title:String(doc.title||doc.filename||doc.id),
   filename:String(doc.filename||doc.title||''),fileId:String(doc.file_id||doc.fileId||'')
  };
  const dialog=buildModal();
  document.getElementById('v2PdfReaderTitle').textContent='PDF · '+api.doc.title;
  document.getElementById('v2PdfRemote').disabled=!isDriveId(api.doc.fileId);
  document.getElementById('v2PdfInspect').disabled=true;
  document.getElementById('v2PdfExportHighlights').disabled=true;
  note('Escolha um PDF local correspondente a este ID ou use uma sessão Google Drive já autorizada.');
  dialog.showModal();
 });
 host.append(action);
}

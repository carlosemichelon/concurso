/* V221 — abrir PDFs diretamente no editor da V1, sem passagem obrigatória
 * pelo iframe Google Drive; atualizar a lista após reconectar/voltar à aba. */
(function(){
'use strict';
if(window.BM221PdfEditorRoute)return;
const $=id=>document.getElementById(id);
const ID=/^[A-Za-z0-9_-]{15,}$/;
const original=typeof pdfOpen==='function'?pdfOpen:null;
let refreshAt=0;
function source(doc){
 if(!doc||typeof doc!=='object')return null;
 const fileId=String(doc.file_id||'');
 if(ID.test(fileId))return doc;
 const url=String(doc.url||'');
 const hit=url.match(/^https:\/\/drive\.google\.com\/file\/d\/([A-Za-z0-9_-]{15,})\/(?:view|preview)(?:[?#].*)?$/);
 if(hit)return {...doc,file_id:hit[1]};
 return null;
}
function reader(){return window.BancoMestreDriveV042||window.BancoMestreDriveV038;}
function open(doc){
 const managed=source(doc);
 const connect=reader();
 if(!managed||!connect?.openAndEdit){
  if(original)return original(doc);
  return false;
 }
 // Se o PDF já está aberto com anotações, não perder os grifos ao pressionar novamente.
 if(window.BancoMestrePDFV042?.editing&&
    window.BancoMestrePDFV042?.currentDoc?.id===managed.id)return true;
 const response=connect.openAndEdit(managed);
 if(!connect.connected&&connect.ready)connect.authorize();
 Promise.resolve(response).then(ok=>{
  const status=$('bm-pdf-sync-status');
  if(ok===true&&status)status.textContent='PDF aberto no editor: grifos, notas e anotações disponíveis nesta página.';
 }).catch(error=>{
  const status=$('bm-pdf-sync-status');
  if(status)status.textContent='Não foi possível abrir o PDF no editor: '+String(error?.message||error);
 });
 return response;
}
function update(force=false){
 const provider=window.BancoMestrePDFSyncV130,connected=!!window.BancoMestreMediaSyncV182?.token?.();
 if(!connected||!provider?.refresh)return false;
 const now=Date.now();
 if(!force&&now-refreshAt<120000)return false;
 refreshAt=now;
 Promise.resolve(provider.refresh()).catch(error=>{
  const box=$('bm-pdf-sync-status');
  if(box)box.textContent='Consulta de PDFs indisponível: '+String(error?.message||error);
 });
 return true;
}
function init(){
 if(typeof pdfOpen==='function')pdfOpen=open;
 document.addEventListener('bm-media-drive-authorized',()=>{
  // O módulo de PDF já programou a varredura inicial após a autorização.
  const status=$('bm-pdf-sync-status');
  if(status)status.textContent='Drive conectado. Conferindo PDFs para edição nesta página…';
 });
 document.addEventListener('visibilitychange',()=>{if(!document.hidden)update();});
 window.addEventListener('focus',()=>update());
 window.addEventListener('online',()=>update());
 const nav=document.querySelector('nav button[data-page="pdfs"]');
 nav?.addEventListener('click',()=>update());
 // Abrir PDF é uma operação de leitura: o original do Drive não é sobrescrito.
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
else init();
window.BM221PdfEditorRoute=Object.freeze({open,source,update,get installed(){return typeof pdfOpen==='function'&&pdfOpen===open}});
})();
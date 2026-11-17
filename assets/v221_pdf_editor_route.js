/* V221 — clique da biblioteca abre PDFs diretamente no editor, sem passagem obrigatória
 * pelo iframe Google Drive; atualizar a lista após reconectar/voltar à aba. */
(function(){
'use strict';
if(window.BM221PdfEditorRoute)return;
const $=id=>document.getElementById(id);
const ID=/^[A-Za-z0-9_-]{15,}$/;
// Não sobrescrever pdfOpen: o próprio renderizador PDF usa esta função internamente.
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
 if(!managed||!connect?.openAndEdit)return false;
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
 const list=$('pdfRows');
 // Captura apenas o gesto "Ler / editar PDF" na biblioteca.
 // Deixa pdfOpen intocado para o próprio PDF.js inicializar a tela sem recursão.
 list?.addEventListener('click',event=>{
  const button=event.target.closest?.('button');
  if(!button||!/^Ler\s*\/\s*editar\s+PDF$/i.test(button.textContent?.trim()||''))return;
  const article=button.closest('article.card'),id=article?.querySelector(':scope > .tag')?.textContent?.trim();
  if(!id||typeof docs==='undefined'||!Array.isArray(docs))return;
  const record=docs.find(x=>x.id===id);
  if(!source(record)||!reader()?.openAndEdit)return;
  event.preventDefault();event.stopImmediatePropagation();
  void open(record);
 },true);
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
window.BM221PdfEditorRoute=Object.freeze({open,source,update,get installed(){return Boolean($('pdfRows'))}});
})();
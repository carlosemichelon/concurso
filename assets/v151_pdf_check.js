/* Banco Mestre V151 — verificação correta do catálogo PDF vigente V149.
   Exige os 78 PDFs ativos, incluindo 34 capítulos V002. Não altera arquivos nem grifos. */
(function(){
'use strict';
if(window.BancoMestrePDFCheckV151)return;
const EXPECTED=78;
const CATALOG='assets/pdf_catalog_v149.json';
const root=document.querySelector('#pdfs .panel');
if(!root)return;
const line=document.createElement('div');line.id='bm151-pdf-check';
line.style.cssText='display:flex;align-items:center;flex-wrap:wrap;gap:8px;padding:8px 0';
const status=document.createElement('span');status.setAttribute('role','status');
status.setAttribute('aria-live','polite');
status.textContent='Catálogo atual: 78 PDFs, incluindo 34 capítulos do manuscrito V002.';
const button=document.createElement('button');button.type='button';
button.textContent='↻ Verificar PDFs';
line.append(status,button);
root.insertBefore(line,document.getElementById('pdfAreaNavV036')||root.firstChild);
function currentDocs(){
 try{return typeof docs!=='undefined'&&Array.isArray(docs)?docs:null;}
 catch(_){return null;}
}
function rowsReady(){
 const rows=document.getElementById('pdfRows');
 return !!(rows&&(rows.children.length>0||rows.textContent.trim()));
}
function waitForRows(){
 if(rowsReady())return Promise.resolve(true);
 const rows=document.getElementById('pdfRows');
 if(!rows)return Promise.resolve(false);
 return new Promise(resolve=>{
  let done=false;let observer;
  const finish=ok=>{if(done)return;done=true;if(observer)observer.disconnect();resolve(ok)};
  observer=new MutationObserver(()=>{if(rowsReady())finish(true)});
  observer.observe(rows,{childList:true,subtree:true,characterData:true});
  setTimeout(()=>finish(rowsReady()),5000);
 });
}
let running=null;
function verify(){
 if(running)return running;
 running=(async()=>{
  button.disabled=true;
  status.textContent='Conferindo o catálogo e montando a lista de PDFs…';
  try{
   const response=await fetch(CATALOG,{cache:'no-store'});
   if(!response.ok)throw Error('catálogo indisponível (HTTP '+response.status+')');
   const catalog=await response.json();
   if(catalog.format!=='BancoMestrePDFCatalogV140'||
      catalog.documents?.length!==EXPECTED||
      new Set(catalog.documents.map(d=>d.id)).size!==EXPECTED||
      catalog.documents.filter(d=>/^CAP-V002-\d{2}$/.test(d.id)).length!==34)
    throw Error('catálogo vigente incompleto ou incompatível');
   const needed=new Set(catalog.documents.map(d=>d.id));
   let loaded=currentDocs();
   if(!loaded||![...needed].every(id=>loaded.some(d=>d.id===id))){
    if(typeof pdfInit!=='function')throw Error('inicialização da biblioteca não disponível');
    await pdfInit();
    loaded=currentDocs();
   }
   if(!loaded||![...needed].every(id=>loaded.some(d=>d.id===id)))
    throw Error('os 78 PDFs não entraram na biblioteca');
   if(typeof pdfRender==='function')pdfRender();
   const displayed=await waitForRows();
   if(!displayed)throw Error('a lista não foi desenhada; use Verificar PDFs novamente');
   const rows=document.getElementById('pdfRows');
   const errors=rows?.textContent||'';
   if(/^(?:Erro ao carregar PDFs|Catálogo incompatível|Erro na biblioteca PDF)/i.test(errors.trim()))
    throw Error(errors.trim().slice(0,150));
   status.textContent='✓ 78 PDFs carregados, incluindo 34 capítulos V002. Se não vir itens, limpe os filtros ou expanda os grupos.';
   line.dataset.ok='yes';
  }catch(error){
   status.textContent='Falha na biblioteca PDF: '+error.message;
   line.dataset.ok='no';
   console.warn('Verificação PDFs V151:',error);
  }finally{button.disabled=false}
 })().finally(()=>{running=null});
 return running;
}
button.onclick=()=>{void verify()};
document.querySelector('header nav [data-page="pdfs"]')?.addEventListener('click',()=>{void verify()});
window.BancoMestrePDFCheckV151={verify};
})();
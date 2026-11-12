/* V145 — catálogo PDF verificado; nenhum PDF ou grifo é alterado. */
(function(){
'use strict';
const root=document.querySelector('#pdfs .panel');if(!root||document.getElementById('bm145-pdf-check'))return;
const line=document.createElement('div');line.id='bm145-pdf-check';
const status=document.createElement('span');status.setAttribute('role','status');status.textContent='Verificando a lista de PDFs…';
const button=document.createElement('button');button.type='button';button.textContent='↻ Verificar PDFs';
line.append(status,button);root.insertBefore(line,document.getElementById('pdfAreaNavV036')||root.firstChild);
async function verify(){
 button.disabled=true;
 try{
  const r=await fetch('assets/pdf_catalog_v140.json',{cache:'no-store'});
  if(!r.ok)throw Error('catálogo indisponível (HTTP '+r.status+')');
  const d=await r.json();if(d.format!=='BancoMestrePDFCatalogV140'||d.documents?.length!==79)throw Error('catálogo incompleto');
  if(typeof docs!=='undefined'&&docs.length!==79&&typeof pdfInit==='function')await pdfInit();
  const n=(typeof docs!=='undefined')?docs.length:0;
  status.textContent=n===79?'✓ 79 PDFs catalogados. Arquivos privados exigem acesso à conta do Drive.':'Catálogo disponível, mas os PDFs ainda não foram exibidos. Atualize a página.';
  line.dataset.ok=n===79?'yes':'no';
 }catch(e){status.textContent='Erro na biblioteca PDF: '+e.message;line.dataset.ok='no'}
 finally{button.disabled=false}
}
button.onclick=verify;
document.querySelector('header nav [data-page="pdfs"]')?.addEventListener('click',()=>setTimeout(verify,100));
window.BancoMestrePDFCheckV145={verify};
})();
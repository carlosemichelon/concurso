/* Portal V304: cabeçalhos de áreas PDF recolhíveis, sem duplicar o catálogo.
 * Preserva os nós originais dos grupos, seus listeners e editores de PDF. */
(function(){
'use strict';
if(window.BM304PdfAreas)return;
const openByArea=new Map();
let observer=null;
function enhance(){
 const host=document.getElementById('pdfRows');
 if(!host)return;
 for(const block of host.querySelectorAll(':scope > div.v036-pdf-area')){
  const head=block.querySelector(':scope > .v036-area-head');
  if(!head)continue;
  const title=head.querySelector('h3')?.textContent?.trim()||'Área';
  const details=document.createElement('details');
  details.className=block.className+' bm304-pdf-area';
  details.dataset.bm304Area=title;
  const summary=document.createElement('summary');
  summary.className=head.className;
  while(head.firstChild)summary.append(head.firstChild);
  head.remove();
  details.append(summary);
  while(block.firstChild)details.append(block.firstChild);
  details.open=openByArea.has(title)?openByArea.get(title):true;
  details.addEventListener('toggle',()=>{
   if(details.isConnected)openByArea.set(title,details.open);
  });
  block.replaceWith(details);
 }
}
function init(){
 const host=document.getElementById('pdfRows');
 if(!host)return;
 enhance();
 observer=new MutationObserver(()=>enhance());
 observer.observe(host,{childList:true});
}
window.BM304PdfAreas=Object.freeze({enhance, get ready(){return Boolean(observer)}});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
else init();
})();
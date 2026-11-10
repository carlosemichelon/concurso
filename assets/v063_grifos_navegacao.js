/* Banco Mestre V063 — abertura de PDFs a partir da Biblioteca de Grifos.
   Preserva identidade documento/hash e não move grifos entre versões. */
(function(){
 'use strict';
 window.BancoMestreV062OpenPdf=function(docId,page,hash){
  try{
   if(typeof docs==='undefined'||!Array.isArray(docs))return false;
   const entry=docs.find(d=>String(d.id)===String(docId));
   if(!entry||typeof pdfOpen!=='function')return false;
   window.BM062PendingGo={docId:String(docId),page:Number(page),hash:String(hash||'')};
   pdfOpen(entry);
   return true;
  }catch(e){
   console.warn('V063: não foi possível abrir fonte do grifo',e);
   return false;
  }
 };
})();
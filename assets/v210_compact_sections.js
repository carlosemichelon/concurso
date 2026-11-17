/* Banco Mestre V210 — barra compacta dos três painéis fotografados.
 * Move apenas nós existentes; mantém handlers, IDs, seletores e estados.
 * Sem alteração de dados, sync, HTML canônico, cartões ou originais.
 */
(function(){
'use strict';
if(window.BM210CompactLayout)return;
const $=id=>document.getElementById(id);
let pdfReady=false,imageReady=false,cardsReady=false;
const one=(s,scope=document)=>scope?.querySelector(s)||null;
function element(tag,id,cls){const n=document.createElement(tag);if(id)n.id=id;if(cls)n.className=cls;return n;}
function appendNode(host,node,shortTitle){
 if(!host||!node)return false;
 if(shortTitle){node.title=node.title||node.textContent?.trim()||'';if(node.tagName==='BUTTON')node.textContent=shortTitle;}
 host.append(node);return true;
}
function compactStatusDetails(id,title){
 const box=element('details',id,'bm210StatusDetails');
 const summary=element('summary');summary.textContent=title;
 const body=element('div',null,'bm210StatusBody');
 box.append(summary,body);
 return {box,body};
}
function prepPdf(){
 if(pdfReady)return true;
 const panel=one('#pdfs .panel');
 const sync=$('bm-pdf-sync'),pdfAreas=$('pdfAreaNavV036');
 const legacy=$('bm182-status-pdf')?.parentElement,check=$('bm151-pdf-check');
 if(!panel||!sync||!pdfAreas||!check||!legacy)return false;
 const bar=element('div','bm210PdfToolbar','bm210Toolbar');
 bar.setAttribute('aria-label','Ferramentas e filtros dos PDFs');
 const actions=element('div','bm210PdfActions','bm210Actions');
 const filters=element('div','bm210PdfFilters','bm210Filters');
 const ext=compactStatusDetails('bm210PdfStatus','Estado e opções');
 const syncAll=one('button',legacy);
 appendNode(actions,syncAll,'Conferir tudo');
 const direct=$('driveConnectV038');
 appendNode(actions,direct,'Conectar Drive');
 appendNode(actions,$('bm-pdf-sync-refresh'),'Sincronizar PDFs');
 appendNode(actions,one('button',check),'Verificar 78 PDFs');
 const vade=$('bmVade041');
 if(vade)appendNode(actions,vade);
 // O segundo login do catálogo é mantido em opções como caminho alternativo.
 const alt=$('bm-pdf-sync-connect');
 appendNode(ext.body,alt,'Conectar catálogo');
 for(const status of [$('bm182-status-pdf'),$('bm-pdf-sync-status'),
  one('span',check),$('driveDirectStatusV038')])appendNode(ext.body,status);
 actions.append(ext.box);
 bar.append(actions,filters);
 const controls=one(':scope > .controls',panel);
 // Em telas pequenas, a V113 gerencia os filtros PDF em seu próprio painel.
 // No desktop, movemos o mesmo DOM/handlers para uma barra compartilhada.
 if(!window.matchMedia?.('(max-width:760px)').matches){
  appendNode(filters,one('#pdfAreaNavV036'));
  appendNode(filters,controls);
 }
 const heading=one('h2',panel);
 if(heading)heading.after(bar);else panel.prepend(bar);
 pdfReady=true;return true;
}
function prepImages(){
 if(imageReady)return true;
 const panel=one('#imagens .panel'),bar=$('bm209SyncBar');
 const hierarchy=$('bm155ImageFilters'),editor=$('bm197-classification-controls');
 if(!panel||!bar||!hierarchy||!editor)return false;
 bar.classList.add('bm210Toolbar','bm210ImageToolbar');
 bar.setAttribute('aria-label','Busca, filtros, classificação e sincronização das imagens');
 const search=$('imageSearch');
 if(search){search.placeholder='Buscar imagem, cartão, assunto ou ID';search.setAttribute('aria-label','Buscar imagens da biblioteca');bar.prepend(search);}
 for(const id of ['bm155DisciplinaImagem','bm155AssuntoGeralImagem',
  'bm155AssuntoEspecificoImagem','bm155SubassuntoImagem']){
  const select=$(id);const wrap=select?.closest('label');if(wrap)appendNode(bar,wrap);
 }
 const editorToolbar=one('.bm197-toolbar',editor);
 const editorial=one('label',editorToolbar);
 const manager=one('button',editorToolbar);
 if(editorial)appendNode(bar,editorial);
 if(manager)appendNode(bar,manager,'Classificar');
 const reset=$('bm155Reset');if(reset)appendNode(bar,reset,'Limpar filtros');
 const total=$('imageCount');if(total)appendNode(bar,total);
 const legacy=$('bm182-status-img')?.parentElement;
 if(legacy){const global=one('button',legacy);if(global)appendNode(bar,global,'Conferir mídia');}
 const extra=compactStatusDetails('bm210ImageInfo','Mais opções');
 for(const node of [$('bm155FilterSummary'),$('bm197-message'),$('bm182-status-img'),
  one('p.intro',panel),one('p.notice',panel),one('.originalHelp',panel)])appendNode(extra.body,node);
 const more=$('bm159AtlasOptions');if(more)appendNode(extra.body,more);
 bar.append(extra.box);
 // Ocultar a categoria antiga, redundante com a hierarquia atual, mantendo o ID.
 const legacyCategory=$('imageFilter');if(legacyCategory&&legacyCategory.value!=='all'){
  legacyCategory.value='all';legacyCategory.dispatchEvent(new Event('change',{bubbles:false}));
 }
 const title=one('h2',panel);if(title)title.after(bar);
 imageReady=true;return true;
}
function prepCards(){
 if(cardsReady)return true;
 const panel=one('#cartoes .panel'),filters=$('bm152Filters');
 const controls=one(':scope > .controls',panel),search=$('cardSearch');
 if(!panel||!filters||!controls||!search)return false;
 filters.classList.add('bm210CardToolbar');
 filters.setAttribute('aria-label','Busca e filtros compactos dos flashcards');
 const quick=element('div','bm210CardQuick','bm210Quick');
 search.placeholder='Buscar ID, enunciado ou conteúdo';
 appendNode(quick,search);
 for(const id of ['cardHidden','cardReviewedOnly','cardRecoveredOnly']){
  const checkbox=$(id),label=checkbox?.closest('label');
  if(label)appendNode(quick,label);
 }
 const inactive=$('bm119InactiveLabel');if(inactive)appendNode(quick,inactive);
 const footer=one('.bm152FilterFooter',filters);
 if(footer)filters.insertBefore(quick,footer);else filters.append(quick);
 const badge=$('cardCount');if(badge&&footer)footer.append(badge);
 const extra=$('bm191CardCount');if(extra&&footer)footer.append(extra);
 cardsReady=true;return true;
}
function init(){
 prepPdf();prepImages();prepCards();
 if(pdfReady&&imageReady&&cardsReady)return;
 // Componentes PDF e de classificação podem concluir inicialização após
 // o documento: tentativas limitadas, sem observadores permanentes.
 let tries=0;
 const retry=()=>{prepPdf();prepImages();prepCards();if((pdfReady&&imageReady&&cardsReady)||++tries>=16)return;setTimeout(retry,250);};
 setTimeout(retry,250);
}
window.BM210CompactLayout=Object.freeze({
 get pdf(){return pdfReady},get images(){return imageReady},get cards(){return cardsReady},
 get ready(){return pdfReady&&imageReady&&cardsReady}
});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
else init();
})();
/* Banco Mestre V118 — reduz detalhes visuais sem remover eventos.
   Vade: move nos existentes (preserva listeners e input de backup).
   PDF: distingue catalogo Drive de conexao ao editor PDF. */
(function(){
 'use strict';
 if(window.BancoMestreCompactSyncV118)return;
 const $=id=>document.getElementById(id);
 function init(){
  const vade=$('bmVade041');
  if(vade&&!vade.classList.contains('bm118-ready')){
   const actions=vade.querySelector('.bm-vade-actions');
   const opener=actions?.querySelector('button:not(.bm-vade-secondary)');
   const intro=vade.querySelector(':scope > p:not(.bm-vade-status)');
   const status=vade.querySelector(':scope > .bm-vade-status');
   if(actions&&opener&&intro&&status){
    const details=document.createElement('details');
    details.className='bm118-vade-more';
    const summary=document.createElement('summary');
    summary.textContent='Backups e informações';
    summary.setAttribute('aria-label','Mostrar opções de backup e informações do Vade Mecum');
    const body=document.createElement('div');
    body.className='bm118-vade-body';
    // Move itens reais; nunca clones, para preservar funcao de importar e salvar.
    body.append(intro);
    for(const child of [...actions.children]){
     if(child!==opener)body.append(child);
    }
    body.append(status);
    details.append(summary,body);
    actions.append(details);
    vade.classList.add('bm118-ready');
    const update=()=>{
      const message=(status.textContent||'').replace(/\s+/g,' ').trim();
      summary.title=message;
      status.title=message;
      const urgent=/erro|falha|não foi possível|incompatível|corrompid|atenção/i.test(message);
      details.dataset.attention=urgent?'1':'0';
      summary.textContent=urgent?'Backups e aviso':'Backups e informações';
    };
    update();
    if(typeof MutationObserver==='function')
     new MutationObserver(update).observe(status,{childList:true,subtree:true,characterData:true});
   }
  }
  const pdfSync=$('bm-pdf-sync');
  const catalogButton=$('bm-pdf-sync-connect');
  if(pdfSync&&catalogButton){
   const label=pdfSync.querySelector(':scope > strong');
   if(label)label.textContent='Catálogo PDF do Drive';
   catalogButton.textContent='Sincronizar catálogo';
   catalogButton.title='Atualizar a lista de documentos das pastas NRs e Licenciamento. A autorização para abrir PDFs no editor é separada.';
   const editButton=$('driveConnectV038');
   if(editButton)editButton.title='Autorizar acesso aos arquivos para abrir os PDFs privados no editor';
  }
  for(const id of ['bm-v075-status','bm-v114-home-status','bm-v116-home-status','bm-pdf-sync-status']){
   const el=$(id);
   if(!el||el.dataset.bm118Title==='1')continue;
   el.dataset.bm118Title='1';
   const update=()=>{el.title=(el.textContent||'').replace(/\s+/g,' ').trim();};
   update();
   if(typeof MutationObserver==='function')
    new MutationObserver(update).observe(el,{childList:true,subtree:true,characterData:true});
  }
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
 else init();
 window.BancoMestreCompactSyncV118=Object.freeze({refresh:init});
})();
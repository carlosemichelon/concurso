/* V046 — alterações na interface; nenhum dado é apagado. */
(function(){
 'use strict';
 const $=id=>document.getElementById(id);
 const head=document.querySelector('header .head'),stats=document.querySelector('main > .stats'),nav=head?.querySelector('nav');
 if(head&&stats){
  head.insertBefore(stats,nav||null);
  stats.classList.add('bm-v046-header-stats');
 }
 document.querySelector('main > .hero')?.remove();

 // PDF: manter elementos originais com IDs/listeners e apenas deslocar a barra
 // existente para a lateral. A prévia mantém largura total sem ferramentas.
 const dialog=$('pdfDialog'),body=dialog?.querySelector('.dbody'),tools=$('pdfLocalTools');
 if(body&&tools&&!$('pdfWorkspaceV046')){
  const workspace=document.createElement('div');
  workspace.id='pdfWorkspaceV046';workspace.className='bm-v046-pdf-workspace';
  const side=document.createElement('aside');side.className='bm-v046-pdf-side';side.setAttribute('aria-label','Barra lateral de edição de PDF');
  const content=document.createElement('div');content.className='bm-v046-pdf-content';
  workspace.append(side,content);
  body.appendChild(workspace);
  side.appendChild(tools);
  for(const id of ['pdfLocalStatus','pdfIntro','pdfFrame','pdfLocalMode']){
   const el=$(id);if(el)content.appendChild(el);
  }
 }

 // Imagens: a versão anterior tinha ferramentas laterais no desktop,
 // mas voltava a barra superior em telas pequenas. A V046 mantém a lateral.
 const img=$('imageDialog');
 if(img){
  img.classList.add('bm-v046-image-side');
  for(const b of img.querySelectorAll('.editor-tools [data-ink-tool]')){
   const title=b.title||b.textContent.trim();
   b.setAttribute('aria-label',title);
   const icon=b.textContent.trim().split(/\s+/)[0];
   b.textContent=icon;
  }
 }

 // Excluir do Atlas não identifica com segurança os arquivos Drive das imagens
 // históricas: nenhuma das 76 correspondências candidatas foi verificada.
 // A ação prepara a lista dos IDs excluídos para revisão/removal no chat.
 const filters=$('imageVisibilityV045')?.parentElement;
 if(filters&&!$('exportExcludedV046')){
  const b=document.createElement('button');
  b.id='exportExcludedV046';b.type='button';
  b.textContent='Copiar excluídas p/ Drive';
  b.title='Copiar os IDs excluídos e seus possíveis arquivos no Google Drive; nenhuma exclusão será executada sem conferência.';
  const note=document.createElement('span');
  note.id='exportExcludedStatusV046';note.setAttribute('role','status');note.setAttribute('aria-live','polite');
  note.className='bm-v046-export-status';
  filters.append(b,note);

  async function buildReport(){
   if(typeof imgs==='undefined'||!imgs.length)await loadImages();
   const states=new Map((await api.all()).map(x=>[x.id,x.status]));
   const matches=imgs.filter(x=>states.get(x.no)==='hidden');
   return {
    format:'BancoMestreExcluirImagensDriveV046',
    origin:'Exclusões do navegador local. Esta lista não apaga arquivos.',
    count:matches.length,
    items:matches.map(x=>{
     const candidate=origMap?.[x.no]||null;
     const verified=!!(x.external&&x.file_id)||candidate?.verified===true;
     const id=x.external?x.file_id||null:candidate?.file_id||null;
     return {
      id:x.no,title:x.title,category:x.category,
      drive_file_id:id,drive_url:id?'https://drive.google.com/file/d/'+encodeURIComponent(id)+'/view':null,
      mapping:!id?'sem arquivo do Drive associado':
       verified?'arquivo explicitamente catalogado':'candidato por nome, identidade não verificada',
      needs_identity_check:!verified
     };
    })
   };
  }
  b.onclick=async()=>{
   b.disabled=true;
   try{
    const report=await buildReport();
    if(!report.items.length){note.textContent='Nenhuma imagem excluída neste navegador.';return;}
    const message=JSON.stringify(report,null,2);
    if(navigator.clipboard?.writeText){
     await navigator.clipboard.writeText(message);
     note.textContent=report.count+' imagens copiadas. Cole a lista no chat para conferirmos e removermos os arquivos correspondentes do Drive.';
    }else{
     const blob=new Blob([message],{type:'application/json'});
     const url=URL.createObjectURL(blob),link=document.createElement('a');
     link.href=url;link.download='Banco_Mestre_Imagens_Excluidas_Para_Drive.json';link.click();
     setTimeout(()=>URL.revokeObjectURL(url),12000);
     note.textContent='Arquivo de exclusões gerado. Envie-o pelo chat para conferência antes de apagar no Drive.';
    }
   }catch(e){note.textContent='Não foi possível preparar a lista: '+e.message}
   finally{b.disabled=false}
  };
  window.BancoMestreDriveExclusionsV046={preview:buildReport};
 }
 window.BancoMestreLayoutV046={
  get ready(){return !!head?.querySelector('.bm-v046-header-stats')&&!!$('pdfWorkspaceV046')&&!!img?.classList.contains('bm-v046-image-side')},
  get heroRemoved(){return !document.querySelector('main > .hero')},
  get pdfSidebar(){return !!document.querySelector('#pdfWorkspaceV046 .bm-v046-pdf-side #pdfLocalTools')},
  get imageSidebar(){return !!document.querySelector('#imageDialog.bm-v046-image-side .editor-tools')}
 };
})();
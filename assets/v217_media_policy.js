/* V217 — politica hibrida: cartoes/estrutura no GitHub, imagens/PDFs somente do Drive.
 * Metadados antigos de imagem ficam disponiveis para correlacoes, SEM montar previews estaticas.
 * Nao salva dados pessoais no GitHub nem escreve nas pastas do Drive. */
(function(){
 'use strict';
 if(window.BM217MediaPolicy)return;
 const $=id=>document.getElementById(id);
 if(typeof loadImages!=='function'||typeof imgRender!=='function')return;
 const originalLoad=loadImages;
 // Evita que a V1 solicite miniaturas publicadas enquanto a biblioteca Drive esta ativa.
 loadImages=async function(){
  if(loadedImages)return;
  loadedImages=true;
  try{
   const metadata=await loadMeta();
   imgs=Array.isArray(metadata?.images)?metadata.images.map(x=>({...x})):[];
   if(window.BM180ImageBridge?.add)await window.BM180ImageBridge.add(imgs);
   window.BM209SingleImageViewer?.refresh?.();
  }catch(error){
   loadedImages=false;
   const status=$('bm084-status');
   if(status)status.textContent='Falha ao recuperar vinculos historicos de imagens: '+error.message+'. Tente atualizar.';
  }
 };
 imgRender=async function(){
  // A galeria autenticada administra a grade, a busca e as miniaturas.
  window.BM209SingleImageViewer?.refresh?.();
 };
 const queueStatus=()=>{
  const current=window.BancoMestreDriveImagesV182;
  const connected=Boolean(current?.connected);
  const imgCount=$('imageCount');
  if(imgCount)imgCount.textContent=connected
   ?String(current?.lastCount||0)+' imagens consultadas no Drive'
   :'Conecte o Google Drive para consultar imagens';
 };
 document.addEventListener('bm209-drive-render',queueStatus);
 document.addEventListener('bm-media-drive-authorized',queueStatus);
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',queueStatus,{once:true});
 else queueStatus();
 window.BM217MediaPolicy=Object.freeze({
  source:{cards:'github_public',images:'google_drive_private',pdfs:'google_drive_private',srs:'local_private'},
  get driveConnected(){return Boolean(window.BancoMestreMediaSyncV182?.token?.())},
  refresh:()=>{queueStatus();window.BM209SingleImageViewer?.refresh?.();}
 });
})();

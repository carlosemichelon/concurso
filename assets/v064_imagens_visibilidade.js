/* V064 — não exibir imagens excluídas em Assuntos ou vínculos da base. */
(function BancoMestreV064Imagens(){
 'use strict';
 const api=window.BancoMestreImagens;
 const index=()=>window.BM032VisualIndex;
 if(!api||!document.getElementById('topicRows'))return;
 let hiddenIds=new Set(),ready=false,unavailable=false,lastTopic=null,busy=false;
 const idRe=/^IMG-(?:P10-)?\d{1,4}$/i;
 async function read(){
  try{
   const statuses=await api.all();
   if(!Array.isArray(statuses))throw Error('Estado indisponível');
   hiddenIds=new Set(statuses.filter(x=>x?.status==='hidden').map(x=>String(x.id).toUpperCase()));
   ready=true;unavailable=false;
  }catch(e){
   unavailable=true;ready=false;
   console.warn('V064: estados de imagens indisponíveis; ocultando imagens de assunto por precaução',e);
  }
 }
 const visible=id=>ready&&!hiddenIds.has(String(id||'').toUpperCase());
 function countFor(topic){
  if(!ready)return 0;
  return (index()?.records||[]).filter(r=>
   visible(r.id)&&r.status!=='pendente'&&r.status!=='reprovada'&&
   (r.relations||[]).some(t=>t.group===topic.group&&t.subject===topic.subject)).length;
 }
 function updateTopicData(){
  if(typeof topicRows==='undefined'||!Array.isArray(topicRows))return;
  for(const t of topicRows)t.imgCount=countFor(t);
  // Ocultar visualOnly cuja única razão de existir eram imagens excluídas.
  // O original do índice de imagens não é alterado.
  topicRows=topicRows.filter(t=>!t.visualOnly||t.imgCount>0||t.count>0);
  for(const tile of document.querySelectorAll('#areaRows button.topicCard')){
   const name=tile.querySelector('strong')?.textContent;
   const items=topicRows.filter(t=>t.area===name);
   const count=tile.querySelector('small');
   if(count)count.textContent=items.length+' assuntos · '+items.reduce((n,t)=>n+(t.imgCount||0),0)+' imagens visíveis';
  }
  if(typeof topicRender==='function')topicRender();
 }
 function suppressHiddenRefs(root){
  if(!root)return;
  for(const b of root.querySelectorAll('button.media-ref')){
   const token=b.textContent?.trim()?.toUpperCase();
   if(idRe.test(token)&&!visible(token))b.remove();
  }
 }
 function pruneTopic(topic){
  const root=document.getElementById('topicMedia');
  if(!root)return;
  for(const card of root.querySelectorAll('.topicVisualCard')){
   const id=[...card.querySelectorAll('button.media-ref')].map(x=>x.textContent?.trim()?.toUpperCase()).find(x=>idRe.test(x||''));
   if(!id||!visible(id))card.remove();
  }
  const cards=root.querySelectorAll('.topicVisualCard').length;
  const panel=root.querySelector('.topicVisualGrid');
  if(panel&&!cards)panel.remove();
  const note=root.querySelector('p.contextNote');
  if(note){
   note.textContent=cards?cards+' imagem(ns) visível(is) para este assunto; arquivos excluídos não são exibidos.':
    'Nenhuma imagem visível vinculada a este assunto. Imagens excluídas permanecem arquivadas para restauração no Atlas.';
  }
  const overview=document.querySelector('#topicOverview');
  if(overview)for(const stat of overview.querySelectorAll('.v034TopicSummary span')){
   if(/imagem\(ns\) identificada/i.test(stat.textContent||''))stat.textContent=cards+' imagem(ns) identificada(s)';
  }
  suppressHiddenRefs(document.getElementById('tema'));
 }
 async function updateStats(){
  const total=Array.isArray(meta?.images)?meta.images.length:270;
  const visibleCount=ready?Math.max(0,total-meta.images.filter(x=>hiddenIds.has(String(x.no).toUpperCase())).length):0;
  const b=document.querySelector('.stats .stat:nth-child(3) b');
  const caption=document.querySelector('.stats .stat:nth-child(3) span');
  if(b)b.textContent=ready?String(visibleCount):'—';
  if(caption)caption.textContent=ready?'Imagens visíveis no Atlas (catálogo: '+total+')':'Visibilidade não verificada';
 }
 async function sync(){
  if(busy)return;busy=true;
  try{
   await read();
   if(typeof loadMeta==='function')await loadMeta();
   updateTopicData();
   updateStats();
   if(lastTopic)pruneTopic(lastTopic);
  }finally{busy=false}
 }
 const priorOpen=window.BancoMestreV034?.openTopic;
 if(priorOpen){
  window.BancoMestreV034.openTopic=async function(topic){
   lastTopic=topic;
   const panel=document.getElementById('tema');
   panel?.classList.add('bm064-auditing-images');
   try{
    await read();
    const result=await priorOpen.call(this,topic);
    pruneTopic(topic);
    return result;
   }finally{panel?.classList.remove('bm064-auditing-images')}
  };
 }
 // Recalcular contagens e impedir visualOnly excluído após reindexação.
 if(typeof loadTopics==='function'){
  const old=loadTopics;
  loadTopics=async function(){
   const area=document.getElementById('assuntos');
   area?.classList.add('bm064-auditing-images');
   try{
    const result=await old();
    await read();
    updateTopicData();
    updateStats();
    return result;
   }finally{area?.classList.remove('bm064-auditing-images')}
  };
 }
 // Um cartão antigo pode conter um botão gerado de IMG; não abrir se foi excluído.
 if(typeof imgOpen==='function'){
  const previous=imgOpen;
  imgOpen=async function(x){
   await read();
   if(!x||!visible(x.no)){
    alert('Esta imagem foi excluída do acervo visível. Para restaurá-la, use a opção “Mostrar excluídos” no Atlas.');
    return;
   }
   return previous.apply(this,arguments);
  };
 }
 // Após exclusão/restauração pelo editor ou Atlas, atualizar as exibições.
 const priorStatus=api.setStatus.bind(api);
 api.setStatus=async function(id,status){
  const result=await priorStatus(id,status);
  await read();
  // Não alterar os registros originais, apenas a vista.
  if(typeof loadTopics==='function')await loadTopics();
  if(lastTopic)pruneTopic(lastTopic);
  return result;
 };
 // Quando a navegação por histórico retorna ao assunto, revalidar filtros.
 document.addEventListener('click',e=>{
  if(e.target?.closest?.('button[data-page="assuntos"]'))sync().catch(console.warn);
 });
 sync().catch(e=>console.warn('V064: filtro de imagens',e));
 window.BancoMestreV064Imagens={refresh:sync,isVisible:visible,get hiddenCount(){return hiddenIds.size}};
})();

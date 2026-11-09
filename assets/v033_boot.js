
/* Banco Mestre V033 — índice auditado de mídias por assunto.
   Todo o trabalho acontece como camada visual: não modifica os originais, os
   cartões canônicos, a rotina SRS ou o histórico local já armazenado. */
(function(){
'use strict';
const INDEX_PATH='assets/imagens_assuntos_v032.json';
const priorSetStatus=api.setStatus.bind(api),priorAllStatus=api.all.bind(api);
const validP10=/^IMG-P10-\d{2}$/;
api.setStatus=async function(id,status){
 if(!validP10.test(id))return priorSetStatus(id,status);
 if(status!=='visible'&&status!=='hidden')throw Error('Situação inválida');
 localStorage.setItem('BM032_VIS_'+id,status);
 return {id,status,updatedAt:new Date().toISOString()};
};
api.all=async function(){
 const a=await priorAllStatus();
 const r=[];
 for(let n=1;n<=16;n++){const id='IMG-P10-'+String(n).padStart(2,'0');const status=localStorage.getItem('BM032_VIS_'+id);if(status)r.push({id,status})}
 return [...a,...r];
};
let sourcePromise=null,applied=false;
const validKey=/^IMG-(?:P10-)?[0-9]{1,4}$/;
async function getIndex(){
 if(!sourcePromise)sourcePromise=fetch(INDEX_PATH,{cache:'no-store'}).then(async r=>{
   if(!r.ok)throw Error('Índice de vínculos indisponível');
   const d=await r.json();
   if(d.format!=='BancoMestreImagemAssuntoIndexV032'||d.counts.legacy!==254||d.counts.new!==16)throw Error('Catálogo de imagens incompatível');
   window.BM032VisualIndex=d;
   return d;
 }).catch(e=>{sourcePromise=null;throw e});
 return sourcePromise;
}
const previousLoadMeta=loadMeta;
loadMeta=async function(){
 const m=await previousLoadMeta();
 const idx=await getIndex();
 if(!applied){
  const byId=new Map(idx.records.map(r=>[r.id,r]));
  for(const im of m.images){
   const record=byId.get(im.no);if(!record)continue;
   if(record.group!==im.group){
    im.original_group=im.group;im.group=record.group;
    im.category=im.no==='IMG-044'||im.no==='IMG-045'||im.no==='IMG-046'?
      'Engenharia Civil / Estruturas / Aço e NBR 8800':im.category;
   }
   im.subject_links=record.relations;
   im.link_evidence=record.status;
  }
  for(const rec of idx.records.filter(r=>/^IMG-P10-/.test(r.id))){
   if(!validKey.test(rec.id))throw Error('ID de imagem inválido');
   m.images.push({
    no:rec.id,title:rec.title,group:rec.group,
    category:'Engenharia Civil / Licenciamento Ambiental / Petrobras 10',
    status:rec.status==='pendente'?'Assunto do recorte pendente de auditoria':'Documento preservado no Drive; verifique a vigência técnica',
    source:rec.source,restricted:false,type:'Recorte normativo original',external:true,
    preview_url:rec.thumbnail,source_url:rec.url,file_id:rec.file_id,
    subject_links:rec.relations,link_evidence:rec.status
   });
  }
  m.image_counts_v032={original:254,petrobras10:16,total:m.images.length};
  const badge=document.querySelector('#imagens .intro');
  if(badge)badge.textContent='Atlas com 254 registros anteriores + 16 recortes Petrobras 10. Associações por evidência, sem atribuição automática ao cartão por grupo. Clique em qualquer imagem/ID para ampliar.';
  const stat=document.querySelector('.stats .stat:nth-child(3) b');
  if(stat)stat.textContent=String(m.images.length);
  applied=true;
 }
 return m;
};
const previousLoadTopics=loadTopics;
loadTopics=async function(){
 try{
  await previousLoadTopics();
  const idx=await getIndex(),base=await loadMeta();
  let topicSet=new Set(topicRows.map(t=>t.group+'|'+t.subject));
  for(const rec of idx.records){
   if(rec.status==='pendente'||rec.status==='reprovada')continue;
   for(const rel of rec.relations||[]){
    const key=rel.group+'|'+rel.subject;if(topicSet.has(key))continue;
    const g=base.groups.find(x=>x.id===rel.group);
    topicRows.push({group:rel.group,subject:rel.subject,count:0,area:topicAreaOf(rel.group),label:g?.title||rel.group,visualOnly:true});
    topicSet.add(key);
   }
  }
  topicRows.sort((a,b)=>a.area.localeCompare(b.area,'pt-BR')||a.subject.localeCompare(b.subject,'pt-BR'));
  const imagePerTopic=new Map();
  for(const rec of idx.records){
   if(rec.status==='pendente'||rec.status==='reprovada')continue;
   for(const rel of rec.relations||[]){
    const key=rel.group+'|'+rel.subject;
    imagePerTopic.set(key,(imagePerTopic.get(key)||0)+1);
   }
  }
  for(const t of topicRows)t.imgCount=imagePerTopic.get(t.group+'|'+t.subject)||0;
  for(const button of document.querySelectorAll('#areaRows button.topicCard')){
    const area=button.querySelector('strong')?.textContent;
    const a=topicRows.filter(t=>t.area===area);
    const sum=a.reduce((n,t)=>n+(t.imgCount||0),0);
    const count=button.querySelector('small');
    if(count)count.textContent=a.length+' assuntos · '+sum+' associações visuais; clique para explorar.';
  }
  const caption=document.querySelector('#assuntos .intro');
  if(caption)caption.textContent='Abra cada assunto para ler explicações, consultar imagens e PDFs e, quando houver, praticar os cartões. Alguns assuntos possuem imagens mesmo sem flashcards.';
  topicRender();
 }catch(e){console.warn('Falha na classificação temática:',e);const root=document.getElementById('topicRows');if(root&&!root.children.length)root.textContent='Erro ao carregar vínculos de assuntos: '+e.message;}
};
const previousThumb=thumb;
thumb=async function(x){if(x.external)return x.preview_url;return previousThumb(x)};
const previousImgOpen=imgOpen;
imgOpen=async function(x){
 if(!x?.external)return previousImgOpen(x);
 try{
  const image=await picture(x.preview_url);
  await BancoMestreEditorV030.open({
   image,imageId:x.no,title:x.title,
   quality:'Imagem original catalogada no Google Drive (prévia ampliada; edição gráfica depende da disponibilidade da prévia)',
   sourceUrl:x.source_url,
   warning:'Esta imagem vem do Drive. Grifos e riscos são salvos apenas neste navegador; não modificam o arquivo do Google Drive. Consulte a fonte e a vigência.',
   onExclude:async id=>{await api.setStatus(id,'hidden');await imgRender()}
  });
 }catch(e){
  alert('A prévia da imagem não abriu. Será aberto o arquivo original no Google Drive para leitura.');
  window.open(x.source_url,'_blank','noopener,noreferrer');
 }
};
const priorImgRenderV032=imgRender;
imgRender=async function(){
 await priorImgRenderV032();
 for(const a of document.querySelectorAll('#imageRows article.card')){
  const id=a.querySelector(':scope > .tag')?.textContent?.trim();
  const im=imgs.find(x=>x.no===id);if(!im?.external)continue;
  const target=a.querySelector('.buttons');
  if(target&&!target.querySelector('.v032-open')){const b=action('Abrir e grifar',()=>imgOpen(im),'primary');b.classList.add('v032-open');target.prepend(b);target.append(link('Original no Drive',im.source_url))}
  const preview=a.querySelector('img.thumb');if(preview)preview.onerror=()=>{preview.alt='Prévia indisponível; abra pelo botão Original no Drive';preview.title=preview.alt};
 }
};
const route=location.hash.slice(1);
if(['assuntos','pdfs','cartoes','imagens','auditoria'].includes(route))section(route);
else section('assuntos');
window.BancoMestreMediaV033={getIndex};
})();

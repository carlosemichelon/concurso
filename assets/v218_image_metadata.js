/* Banco Mestre V310 (motor V218): classificação temática aditiva.
 * Lê V211+V180 históricos e V310 (66 conteúdos inspecionados visualmente,
 * mais 40 classificações por nome descritivo). Imagens originais só no Drive.
 * Sem novas associações a cartão, sem perda de dados locais, sem gravação no Drive. */
(function(){
'use strict';
if(window.BM218ImageMetadata)return;
const CATALOGS=[
 {url:'assets/v211_published_images.json?v=211',schema:'BancoMestrePublishedImagesV211',key:'V211'},
 {url:'assets/v180_native_image_additions.json?v=180',schema:'BancoMestreNativeImageAdditionsV180',key:'V180'},
 {url:'assets/v310_image_taxonomy.json?v=310-1',schema:'BancoMestreImageTaxonomyV310',key:'V310'}
];
const GROUPS=Object.freeze({
 eng_seguranca:'Engenharia Civil · Segurança do Trabalho',
 eng_hidraulica:'Engenharia Civil · Hidráulica e Saneamento',
 eng_estruturas:'Engenharia Civil · Estruturas',
 eng_ambiental:'Engenharia Civil · Meio Ambiente',
 eng_geotecnia:'Engenharia Civil · Geotecnia',
 eng_materiais:'Engenharia Civil · Materiais',
 eng_outros:'Engenharia Civil',
 leg_geral:'Legislação',
 met_portal:'Metodologia e interface'
});
const ID=/^[A-Za-z0-9_-]{15,}$/;
let index=new Map(),promise=null,lastError='';
const str=v=>String(v==null?'':v).trim();
const stripExtension=name=>str(name).replace(/\.(png|jpe?g|webp|gif|svg)$/i,'');
const canon=s=>str(s).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
function opaque(value){
 const s=stripExtension(value).trim().replace(/[\s_-]/g,'');
 return !s||/^(?:[a-f0-9]{16,}|[0-9]{10,}|(?:image|img|foto|screenshot|capture|captura)\(?[0-9()_-]+\)?)$/i.test(s)||
  /^IMG[-_](?:C|P)\d+[-_]\d+$/i.test(str(value))||!/[A-Za-zÀ-ÿ]{3}/.test(s);
}
function friendly(value){
 let s=stripExtension(value)
  .replace(/^IMG[-_](?:C|P)\d+[-_]\d+[-_\s]*/i,'')
  .replace(/^PETRO(?:BRAS)?[-_\s]?\d+[-_\s]+Q\d{1,4}[-_\s]+/i,'')
  .replace(/^Q\d{1,4}[-_\s]+/i,'')
  .replace(/[_]+/g,' ').replace(/\s+[-–—]+\s+/g,' — ')
  .replace(/\s+/g,' ').trim();
 if(!s||opaque(s))return '';
 const words=s.split(' ');
 const upperAcronyms=new Set(['NR','NBR','PCMSO','PGR','GRO','EIA','RIMA','RAP','RQD','LSF','ELU','ELS','BDI','PVC','AET','EPC','EPI','CIPA','SESMT','SPT']);
 s=words.map((w,i)=>{
  const clean=w.replace(/[^A-Za-zÀ-ÿ]/g,'');
  if(clean.toUpperCase()==='NRS')return 'NRs';
  if(upperAcronyms.has(clean.toUpperCase())||/^(?:NR|NBR)\d+$/i.test(w)||/^[A-Z]{2,6}(?:\/[A-Z]{2,6})+$/.test(w))return w.toUpperCase().replace(/^NR(?=\d)/,'NR-').replace(/^NBR(?=\d)/,'NBR ');
  if(/^\d+$/.test(w)||w==='—')return w;
  const low=w.toLocaleLowerCase('pt-BR');
  return i===0?low.slice(0,1).toLocaleUpperCase('pt-BR')+low.slice(1):low;
 }).join(' ');
 return s.slice(0,170);
}
function fromV211(rec){
 const title=str(rec.title);
 return {
  title:opaque(title)?'':title,
  area:GROUPS[rec.group]||'',
  subject:str(rec.topic),
  subsubject:str(rec.subtopic),
  group:str(rec.group),
  cards:Array.isArray(rec.cardIds)?rec.cardIds.filter(x=>/^CARD-\d{4,}$/.test(x)):[],
  status:str(rec.sourceStatus),
  basis:str(rec.classificationBasis),
  origin:'V211'
 };
}
function fromV180(rec,previous){
 const prior=previous||{};
 return {
  ...prior,
  title:str(rec.studyTitle||rec.title)||prior.title||'',
  area:str(rec.studyArea)||prior.area||'',
  subject:str(rec.studySubject)||prior.subject||'',
  subsubject:str(rec.studySub)||prior.subsubject||'',
  group:str(rec.group)||prior.group||'',
  cards:prior.cards||[],
  status:str(rec.studyValidation||rec.studyStatus)||prior.status||'',
  origin:'V180 + V211'
 };
}
function fromV310(rec,previous){
 const prior=previous||{};
 // Nunca rebaixar classificação existente, nem mudar vínculos já documentados.
 if(str(prior.subject))return prior;
 if(!str(rec.topic)||!GROUPS[str(rec.group)])return prior;
 const label=str(rec.title);
 return {
  ...prior,
  title:label&&!opaque(label)?label:prior.title||'',
  area:GROUPS[str(rec.group)],
  subject:str(rec.topic),
  subsubject:str(rec.subtopic),
  group:str(rec.group),
  cards:prior.cards||[],
  status:str(rec.sourceStatus),
  basis:str(rec.classificationBasis),
  origin:'V310 — '+(str(rec.classificationBasis).startsWith('inspecao_visual')?'inspeção visual':'nome e pasta')
 };
}
async function load(){
 if(promise)return promise;
 promise=(async()=>{
  const next=new Map(),failed=[];
  const out=await Promise.allSettled(CATALOGS.map(async c=>{
   const r=await fetch(c.url,{cache:'no-store'});
   if(!r.ok)throw Error(c.key+' HTTP '+r.status);
   const data=await r.json();
   if(!Array.isArray(data.records)||data.records.length<70)throw Error(c.key+' sem registros suficientes');
   if(c.key==='V310'&&(data.schema!=='BancoMestreImageTaxonomyV310'||data.records.length!==144))
    throw Error('V310: esquema ou contagem de auditoria divergente');
   return data.records;
  }));
  for(let k=0;k<out.length;k++){
   const got=out[k];
   if(got.status!=='fulfilled'){failed.push(CATALOGS[k].key);continue}
   for(const rec of got.value){
    const id=str(rec.driveFileId);
    if(!ID.test(id))continue;
    if(k===0)next.set(id,fromV211(rec));
    else if(k===1)next.set(id,fromV180(rec,next.get(id)));
    else if(next.has(id))next.set(id,fromV310(rec,next.get(id)));
    // IDs não presentes no catálogo histórico precisam de auditoria antes da inserção.
   }
  }
  if(!next.size)throw Error('Indices de titulos nao puderam ser lidos');
  index=next;lastError=failed.join(', ');
  return {count:index.size,classified:[...index.values()].filter(x=>x.subject).length,partial:failed.length>0};
 })().catch(e=>{promise=null;lastError=e.message;return {count:index.size,error:lastError}});
 return promise;
}
function resolve(file){
 const saved=index.get(str(file?.id))||{};
 const filename=str(file?.name),fallback=friendly(filename);
 const curated=str(saved.title)&&!opaque(saved.title)?friendly(saved.title):'';
 const displayTitle=curated||fallback||'Imagem sem título descritivo';
 const subject=str(saved.subject),subsubject=str(saved.subsubject),area=str(saved.area);
 const classified=Boolean(subject);
 return Object.freeze({
  id:str(file?.id),displayTitle,fileName:filename,
  area,subject,subsubject,group:str(saved.group),
  cards:saved.cards||[],classified,opaqueName:opaque(filename),
  status:classified?'Assunto identificado no índice':'Assunto ainda não classificado',
  origin:str(saved.origin),basis:str(saved.basis),
  sourceStatus:str(saved.status),
  location:str(file?.drivePath)
 });
}
function describe(file){return resolve(file).displayTitle}
window.BM218ImageMetadata=Object.freeze({
 load,resolve,describe,opaque,friendly,
 get error(){return lastError},get count(){return index.size},
 get classifiedCount(){return [...index.values()].filter(x=>x.subject).length}
});
})();

/* Banco Mestre V321 — classificação complementar do Atlas sincronizado.
 * Chave por nome EXATO do arquivo: sem publicar IDs privados do Drive e sem vínculos inventados.
 * Não modifica originals, banco de cartões, SRS, credenciais ou editor do Drive.
 */
(function(){
'use strict';
if(window.BM321ImageTopicCompletion)return;
const native=window.BM218ImageMetadata;
if(!native||typeof native.resolve!=='function'||typeof native.load!=='function')return;
const uri='assets/v321_drive_image_topics.json?v=321-1';
const groups=Object.freeze({
 eng_geotecnia:'Engenharia Civil · Geotecnia',
 eng_estruturas:'Engenharia Civil · Estruturas',
 leg_geral:'Legislação'
});
const key=v=>String(v||'').trim().normalize('NFC').toLocaleLowerCase('pt-BR');
let names=new Map(),loading=null,lastError='';
async function records(){
 if(loading)return loading;
 loading=(async()=>{
  const r=await fetch(uri,{cache:'no-store'});
  if(!r.ok)throw Error('Catálogo Atlas V321: HTTP '+r.status);
  const json=await r.json();
  if(json.schema!=='BancoMestreDriveImageTopicCompletionV321'||
     json.records?.length!==71||
     json.counts?.total!==71||
     new Set(json.records.map(x=>key(x.fileName))).size!==71)
   throw Error('Catálogo de temas V321 incompatível');
  names=new Map(json.records.filter(x=>x.fileName&&x.topic&&groups[x.group]).map(x=>[key(x.fileName),x]));
  lastError='';
  // Recalcula a lista exibida quando o índice assíncrono termina de carregar.
  document.getElementById('bm084-search')?.dispatchEvent(new Event('input',{bubbles:true}));
  window.dispatchEvent(new CustomEvent('bm321-atlas-topics-ready',{detail:{classified:names.size}}));
  return names;
 })().catch(e=>{loading=null;lastError=String(e?.message||e);return names});
 return loading;
}
async function load(){
 const [base]=await Promise.all([native.load(),records()]);
 return {...base,atlasExtraNames:names.size,atlasCompletionPending:names.size!==71};
}
function resolve(file){
 const base=native.resolve(file);
 if(base.classified)return base;
 const rec=names.get(key(file?.name||file?.title));
 if(!rec)return base;
 return Object.freeze({...base,
  displayTitle:rec.title||base.displayTitle,
  area:groups[rec.group],subject:rec.topic,subsubject:rec.subtopic,
  group:rec.group,classified:true,
  basis:rec.classificationBasis,
  sourceStatus:rec.warning?'Material descartado — não utilizar':rec.sourceStatus,
  status:rec.warning?'Classificado; material descartado — não utilizar':'Assunto identificado na classificação V321',
  origin:'V321 · '+(rec.classificationBasis==='inspecao_visual_do_original'?'inspeção visual':'nome descritivo')
 });
}
const api=Object.freeze({
 load,resolve,describe:file=>resolve(file).displayTitle,
 opaque:native.opaque,friendly:native.friendly,
 get error(){return lastError||native.error},
 get count(){return native.count},
 get classifiedCount(){return native.classifiedCount},
 get extraClassifiedNames(){return names.size},
 get ready(){return names.size===71}
});
window.BM218ImageMetadata=api;
window.BM321ImageTopicCompletion=api;
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{void load()},{once:true});
else void load();
})();
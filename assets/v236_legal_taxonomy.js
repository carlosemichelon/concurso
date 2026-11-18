/* V225 — organização jurídica a partir da disciplina/assunto já cadastrados.
 * TRT operacionais são somente índices de apresentação, SEM integração indevida no SRS. */
(function(){
'use strict';
if(window.BM225LegalTaxonomy)return;
const norm=x=>String(x||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const paths=[
 ['TRT01-C001','assets/trt01_c001_v211.json?v=211'],
 ['TRT01-C002','assets/trt01_c002_v212.json?v=212'],
 ['TRT01-C003','assets/trt01_c003_v215.json?v=215'],
 ['TRT01-C004','assets/trt01_c004_v217.json?v=217'],
 ['TRT01-C005','assets/trt01_c005_v220.json?v=220'],
 ['TRT01-C006','assets/trt01_c006_v221.json?v=221'],
 ['TRT01-C007','assets/trt01_c007_v222.json?v=222'],
 ['TRT01-C008','assets/trt01_c008_v224.json?v=224'],
 ['TRT01-C009','assets/trt01_c009_v227.json?v=227'],
 ['TRT02-C001','assets/trt02_c001_v230.json?v=230'],
 ['TRT02-C002','assets/trt02_c002_v231.json?v=231'],
 ['TRT02-C004','assets/trt02_c004_v232.json?v=232'],
 ['TRT02-C005','assets/trt02_c005_v235.json?v=235'],
 ['TRT02-C006','assets/trt02_c006_v236.json?v=236']
];
const CATS=Object.freeze([
 {id:'leg_constitucional',label:'Direito Constitucional'},
 {id:'leg_administrativo',label:'Direito Administrativo e servidores'},
 {id:'leg_etica',label:'Ética profissional — Confea'},
 {id:'leg_urbanistico',label:'Legislação urbanística e fundiária'},
 {id:'leg_ambiental',label:'Legislação ambiental'},
 {id:'leg_licitacoes',label:'Licitações e contratos'},
 {id:'leg_local',label:'Legislação estadual e municipal'},
 {id:'leg_saneamento',label:'Regulação de saneamento'},
 {id:'leg_outras',label:'Outras leis gerais e garantias'}
]);
function isLegal(c){return c?.group==='LEGISLACAO'||/^TRT0[12]-C\d{3}$/.test(c?.id||'')||/legisl|direito/i.test(c?.discipline||'');}
function general(c){
 if(!isLegal(c))return null;
 // O campo antigo de disciplina é genérico (ex.: 'Legislação / Ética').
 // Classificar pelo assunto/subassunto documentados, não por esse rótulo herdado.
 const s=norm([c.subject,c.sub].join(' '));
 if(/^TRT02-C\d{3}$/.test(c.id||''))return 'leg_administrativo';
 if(/^TRT01-C\d{3}$/.test(c.id||'')||/direito constitucional|constitui(c|ç)ao|cf\/?88|principios fundamentais|preambulo/.test(s))return 'leg_constitucional';
 if(/codigo municipal|municipal|decreto rs|legislacao local|legislacao estadual|diretrizes urbanisticas municipais/.test(s))return 'leg_local';
 if(/lei 14\.133|licitac|contrato administrativo|projeto executivo/.test(s))return 'leg_licitacoes';
 if(/licenciamento ambiental|conama|eia|rima|meio ambiente|ambiental/.test(s))return 'leg_ambiental';
 if(/confea|crea|etica/.test(s))return 'leg_etica';
 if(/estatuto da cidade|reurb|regularizacao fundiaria|parcelamento do solo|plano diretor|mobilidade urbana|urbanistic/.test(s))return 'leg_urbanistico';
 if(/saneamento basico|lei 11\.445/.test(s))return 'leg_saneamento';
 if(/improbidade|transparencia|servidor|regime juridico|jurisprudencia.*concurso|agente publico|administrativ|acumulacao/.test(s))return 'leg_administrativo';
 return 'leg_outras';
}
const records=new Map();
let loadPromise=null;
async function load(){
 if(loadPromise)return loadPromise;
 loadPromise=(async()=>{
  const results=await Promise.allSettled(paths.map(async ([id,path])=>{
   const resp=await fetch(path,{cache:'no-store'});
   if(!resp.ok)throw Error(path+' HTTP '+resp.status);
   const c=await resp.json();
   if(c.id!==id||!Array.isArray(c.layers)||c.layers.length!==11)throw Error('TRT inconsistente: '+id);
   return Object.freeze({id,group:'LEGISLACAO',discipline:c.discipline||'Direito Constitucional',
    subject:c.subject||'',sub:c.sub||'',front:c.front||'',back:c.back||'',active:true,
    operational:true,source:'trt_catalog_public',images:c.images?.length||0});
  }));
  let errorCount=0;
  for(const r of results){if(r.status==='fulfilled')records.set(r.value.id,r.value);else errorCount++;}
  document.dispatchEvent(new CustomEvent('bm225-legal-records',{detail:{count:records.size,errors:errorCount}}));
  return {count:records.size,errors:errorCount};
 })();
 return loadPromise;
}
const api=Object.freeze({
 general,isLegal,load,categories:CATS,
 byId:id=>records.get(id)||null,
 all:()=>[...records.values()],
 get loaded(){return records.size},
 get expected(){return paths.length}
});
window.BM225LegalTaxonomy=api;
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{void load()},{once:true});else void load();
})();
/* V126 — metricas de intervalos por cor em semente pequena e NÃO homologada.
 * Diagnostico apenas: esses textos podem ter influenciado as regras e NÃO
 * constituem teste cego nem demonstram confiabilidade jurídica geral.
 */
'use strict';
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),w={},sandbox=vm.createContext({window:w,console});
function load(p){vm.runInContext(fs.readFileSync(path.join(root,p),'utf8'),sandbox,{filename:p,timeout:8000})}
for(const f of ['assets/v109_classificador_lei_seca.js','assets/v112_perfis_lei_seca.js',
 'assets/v114_ia_lei_seca.js','assets/v114_cf_artigo1.js',
 'assets/v121_relacoes_normativas.js','assets/v124_remissoes.js'])load(f);
const baseline=w.BancoMestreCalibradoresV110;
load('assets/v126_qualidade_clausulas.js');
const candidate=w.BancoMestreCalibradoresV110;
const data=JSON.parse(fs.readFileSync(path.join(root,'tests/v126_semente_bio_lei_seca.json'),'utf8'));
assert.equal(data.status,'proposta_sem_homologacao_humana');
function norm(x){return String(x||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'')
 .toLowerCase().replace(/[;.,:!?]+$/gu,'').replace(/\s+/gu,' ').trim()}
function words(text){return (text.match(/\S+/gu)||[]).map((piece,i)=>({
 text:piece,rects:[[.001+i*.002,.1,.0027+i*.002,.125]],line:Math.floor(i/17)
 }))}
function evaluate(model){
 const byLaw={},color={regra:{gold:0,pred:0,exact:0},agente:{gold:0,pred:0,exact:0},
 condicao:{gold:0,pred:0,exact:0},excecao:{gold:0,pred:0,exact:0}};
 let documents=0,goldSpans=0,predSpans=0,exact=0,partialOnly=0,unmatched=0,review=0;
 const samples=[];
 for(const item of data.examples){
  const p={cf88:'cf88',LC95:'lc95',LEI9784:'processo',LEI8429:'improbidade',LEI14133:'licitacoes'}[item.law];
  assert.ok(p,'Lei sem perfil reconhecido: '+item.law);
  const prediction=model.analyzeWords(words(item.text),p);
  const gold=item.spans.map(s=>({kind:s.kind,text:norm(s.quote)}));
  const pred=(prediction.segments||[]).filter(s=>s.confidence==='alta'&&!s.requires_review)
   .map(s=>({kind:s.kind,text:norm(s.text)}));
  const seen=new Set();
  for(const g of gold)color[g.kind].gold++;
  for(const x of pred)color[x.kind].pred++;
  for(let i=0;i<pred.length;i++){
   const x=pred[i];const index=gold.findIndex((g,j)=>!seen.has(j)&&g.kind===x.kind&&g.text===x.text);
   if(index>=0){seen.add(index);color[x.kind].exact++;exact++}
   else if(gold.some(g=>g.kind===x.kind&&(g.text.includes(x.text)||x.text.includes(g.text)))){
    partialOnly++;
   }else unmatched++;
  }
  documents++;goldSpans+=gold.length;predSpans+=pred.length;
  review+=(prediction.review||[]).filter(s=>s.requires_review).length;
  (byLaw[item.law]??={documents:0,gold:0,pred:0,exact:0}).documents++;
  byLaw[item.law].gold+=gold.length;
  byLaw[item.law].pred+=pred.length;
  byLaw[item.law].exact+=seen.size;
  samples.push({id:item.id,law:item.law,gold:gold.length,pred:pred.length,exact:seen.size,
   proposed:pred.map(x=>x.kind+':'+x.text.slice(0,82))});
 }
 return {documents,goldSpans,predSpans,exact,
  strictPrecision:predSpans?Number((exact/predSpans).toFixed(4)):null,
  strictRecall:goldSpans?Number((exact/goldSpans).toFixed(4)):null,
  partialOnly,unmatched,review,byLaw,color,samples};
}
const old=evaluate(baseline),updated=evaluate(candidate);
assert.equal(old.documents,7);assert.equal(old.goldSpans,13);assert.equal(updated.goldSpans,13);
console.log(JSON.stringify({
 dataset:'7 dispositivos/5 normas; rótulos propostos, NÃO homologados',
 baseline:{...old,samples:undefined},candidate:{...updated,samples:undefined},
 comparison:{exactDelta:updated.exact-old.exact,predictionDelta:updated.predSpans-old.predSpans},
 releaseStatus:'NAO APROVADO — corpus ainda minúsculo, não homologado e não cego',
 missingTests:['corpus ouro amplo','treino e teste por lei/edição','análise de falsos positivos','PDF real móvel e persistência']
},null,2));

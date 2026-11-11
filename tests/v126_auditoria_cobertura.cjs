/* V126 — auditoria de cobertura comparando produção e filtro experimental.
 * Relatório diagnóstico: a base V112 inclui frases propositalmente parciais.
 * Não confundir "categoria detectada" com correspondência exata por palavra.
 */
'use strict';
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),w={},context=vm.createContext({window:w,console});
function load(p){vm.runInContext(fs.readFileSync(path.join(root,p),'utf8'),context,{filename:p,timeout:9000})}
for(const p of ['assets/v109_classificador_lei_seca.js','assets/v112_perfis_lei_seca.js',
 'assets/v114_ia_lei_seca.js','assets/v114_cf_artigo1.js',
 'assets/v121_relacoes_normativas.js','assets/v124_remissoes.js',
 'assets/v112_qa_trechos_oficiais.js'])load(p);
const baseline=w.BancoMestreCalibradoresV110;
const official=w.BancoMestreCalibradorQAOflV112;
const before=official.run(baseline);
assert.equal(before.ok,true,'O comparador V124 deve satisfazer a regressão antiga.');
assert.equal(before.stats.passed,216);
load('assets/v126_qualidade_clausulas.js');
const newResult=official.run(w.BancoMestreCalibradoresV110,{strict:false});
const drop=before.stats.passed-newResult.stats.passed;
const audit={
 status:'experimental_not_ready_for_release',
 baseline:{passes:before.stats.passed,total:before.stats.cases},
 candidate:{passes:newResult.stats.passed,total:newResult.stats.cases,failed:newResult.stats.failed},
 lostCategoryChecks:drop,
 failedByLaw:Object.fromEntries(Object.entries(newResult.stats.byLaw)
   .map(([law,record])=>[law,record.failed]).filter(([,n])=>n>0)),
 releaseGate:{
  passed:newResult.stats.failed===0,
  reason:'A regressão V112 de categorias falhou. Necessária anotação ouro de spans e classificação de erros antes de habilitar novos grifos.'
 },
 importantQualification:'Estas 216 provas verificam presença de categorias em trechos, não precisão jurídica por palavra nem avaliação cega.'
};
assert.ok(newResult.stats.passed<=before.stats.passed);
console.log(JSON.stringify(audit,null,2));
// This audit intentionally does NOT fail CI: experimental behavior is not shipped.

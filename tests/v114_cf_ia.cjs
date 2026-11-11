/* Banco Mestre V114 — validação de classificação jurídica em GitHub Actions.
 * Node nativo, sem npm, sem rede, sem acesso a dados privados ou Drive.
 */
'use strict';
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const w={};
const sandbox=vm.createContext({window:w,console});
function load(file){
 const source=fs.readFileSync(path.join(root,file),'utf8');
 vm.runInContext(source,sandbox,{filename:file,timeout:4500});
}
[
 'assets/v109_classificador_lei_seca.js',
 'assets/v112_perfis_lei_seca.js',
 'assets/v114_ia_lei_seca.js',
 'assets/v114_cf_artigo1.js',
 'assets/v111_calibrador_qa.js',
 'assets/v112_qa_trechos_oficiais.js',
 'assets/v112_qa_negacoes.js',
 'assets/v114_qa_cf_artigo1.js'
].forEach(load);
const profile=w.BancoMestreCalibradoresV110;
const results={
 old:w.BancoMestreCalibradorQAV111.run(profile,true),
 official:w.BancoMestreCalibradorQAOflV112.run(profile),
 negative:w.BancoMestreCalibradorQANegV112.run(profile),
 article:w.BancoMestreQAV114.run(w)
};
for(const [name,result] of Object.entries(results)){
 if(!result.ok){
  console.error('FALHA '+name,JSON.stringify(result.failures||result.errors||result.structuralIssues||[],null,2));
 }
 assert.equal(result.ok,true,'Audit failed: '+name);
}
assert.equal(w.BancoMestreIALeiSecaV114.examples,154);
assert.equal(w.BancoMestreCalibradoresV110.profiles.length,13);
assert.equal(results.old.totals.passed,200);
assert.equal(results.official.stats.passed,216);
assert.equal(results.negative.stats.passed,411);
assert.equal(results.article.tests.full,10);
assert.equal(results.article.tests.denials,10);
assert.equal(results.article.tests.heldOut,19);
console.log('V114 PASSOU: 827 verificações herdadas; art. 1º em 10 variantes;');
console.log('10 rejeições seguras; paleta e geometria conferidas; modelo com 154 exemplos.');
console.log('Holdout exploratório: '+results.article.holdout.correct+'/'+results.article.holdout.count+
 ' exemplos. NÃO converter esse número em confiabilidade legal do modelo.');

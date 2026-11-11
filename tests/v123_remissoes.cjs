/* V123 — cross-law reference resolution, with explicit abstention.
 * Test suite uses synthetic legal prose and does not certify actual validity
 * of laws or the edition of a user's PDF.
 */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..'),w={},sandbox=vm.createContext({window:w,console});
function load(pathname){vm.runInContext(fs.readFileSync(path.join(root,pathname),'utf8'),sandbox,{filename:pathname,timeout:7500})}
for(const f of ['assets/v109_classificador_lei_seca.js','assets/v112_perfis_lei_seca.js',
 'assets/v114_ia_lei_seca.js','assets/v114_cf_artigo1.js','assets/v121_relacoes_normativas.js'])load(f);
const previousAnalyze=w.BancoMestreCalibradoresV110.analyzeWords;
load('assets/v123_remissoes.js');
const engine=w.BancoMestreReferenciasV123;
assert.equal(typeof engine.legalReference,'function');
const tokenize=text=>(String(text).match(/\S+/gu)||[]).map((v,i)=>({
 text:v,line:Math.floor(i/12),rects:[[.1,.2,.2,.3]]
}));
let cases=0,unsafePrevented=0,colorsPreserved=0;
const examples=[
 {profile:'processo',text:'Art. 10. Cabe decidir conforme o art. 37 da Constituição Federal.',
  target:'CF88:art37',resolution:'explicit_law',source:'LEI9784:art10'},
 {profile:'processo',text:'Art. 10. O pedido respeitará os requisitos do art. 5º desta Lei.',
  target:null,resolution:'profile_dependent_internal',suggested:'LEI9784:art5'},
 {profile:'processo',text:'Art. 10. O pedido observará nos termos do art. 7º.',
  target:null,resolution:'contextual_unverified',suggested:'LEI9784:art7'},
 {profile:'processo',text:'Art. 10. Observar o art. 50 da Lei nº 14.133/2021.',
  target:'LEI14133:art50',resolution:'explicit_law'},
 {profile:'processo',text:'Art. 10. Aplicar o art. 9º da Lei 16.999/2024.',
  target:null,resolution:'unsupported_law',suggested:null},
 {profile:'licitacoes',text:'Art. 20. Conforme o art. 12 da Lei nº 9.784/1999.',
  target:'LEI9784:art12',resolution:'explicit_law'},
 {profile:'cf88',text:'Art. 20. Nos termos do art. 5º desta Constituição.',
  target:null,resolution:'profile_dependent_internal',suggested:'CF88:art5'},
 {profile:'geral',text:'Segundo o art. 37 da Constituição Federal, a decisão será motivada.',
  target:'CF88:art37',resolution:'explicit_law'},
 {profile:'processo',text:'Art. 12. A regra depende do art. 2º da Lei Complementar nº 95/1998.',
  target:'LC95:art2',resolution:'explicit_law'},
 {profile:'licitacoes',text:'Art. 11. Observado o art. 5º da LC 101/2000.',
  target:'LC101:art5',resolution:'explicit_law'},
 {profile:'lgpd',text:'Art. 20. Nos termos do art. 31 da Lei 12.527/2011.',
  target:'LEI12527:art31',resolution:'explicit_law'},
 {profile:'processo',text:'Art. 4º O pedido observa o art. 5º da Lei 9.784 e o art. 37 da CF.',
  multiple:['LEI9784:art5','CF88:art37']}
];
for(const ex of examples){
 const words=tokenize(ex.text),a=engine.legalReference(words,ex.profile);
 assert.equal(a.length,ex.multiple?.length||1,ex.text+' — num. remissões');
 const subjects=ex.multiple||[ex.target];
 assert.deepEqual(Array.from(a,x=>x.target),subjects,ex.text+' — destino');
 assert.ok(a.every(x=>x.verified_source===false),'Não afirmar vigência');
 if(ex.resolution)assert.equal(a[0].resolution,ex.resolution,ex.text+' — status');
 if(ex.source)assert.equal(a[0].source_article,ex.source,ex.text+' — origem');
 if('suggested' in ex)assert.equal(a[0].suggested_target,ex.suggested,ex.text+' — sugestão');
 if(ex.target===null)unsafePrevented++;
 const original=previousAnalyze(words,ex.profile);
 const upgraded=w.BancoMestreCalibradoresV110.analyzeWords(words,ex.profile);
 assert.equal(upgraded.legal_structure?.references?.length,a.length,'Referências não integradas');
 function signatures(r){return (r.segments||[]).map(y=>[y.kind,y.start,y.end,y.color,y.text]).sort()}
 assert.equal(JSON.stringify(signatures(upgraded)),JSON.stringify(signatures(original)),
  'V123 não pode alterar nenhuma cor/posição de grifo');
 colorsPreserved++;cases++;
}
for(const [label,text,expected] of [
 ['frase seguinte com Constituicao',
  'Art. 10. Nos termos do art. 5º. A Constituição Federal será estudada depois.',null],
 ['frase seguinte com Lei 14.133',
  'Art. 10. Nos termos do art. 5º; a Lei nº 14.133 terá aplicação diferente.',null],
 ['abreviatura n. da Lei 9.784',
  'Art. 10. Segundo o art. 5º da Lei n. 9.784/1999, cabe recurso.','LEI9784:art5']
]){
 const refs=engine.legalReference(tokenize(text),'processo');
 assert.equal(refs.length,1,'Delimitador de frase: '+label);
 assert.equal(refs[0].target,expected,'Norma de outra frase nao pode contaminar remissao: '+label);
 cases++;
 if(expected===null)unsafePrevented++;
}

for(const [label,text,expected] of [
 ['menção sem vínculo a Constituição',
  'Art. 10. Conforme art. 5º, a Constituição é estudada em outro contexto.',null],
 ['menção sem vínculo a Lei',
  'Art. 10. Conforme art. 5º, a Lei 14.133 é mencionada no comentário.',null],
 ['vínculo por inciso intermediário',
  'Art. 10. Conforme art. 5º, inciso II, da Constituição Federal, segue a regra.','CF88:art5']
]){
 const refs=engine.legalReference(tokenize(text),'processo');
 assert.equal(refs.length,1,'Artigo perdido: '+label);
 assert.equal(refs[0].target,expected,'Lei sem ligação gramatical não pode ser destino: '+label);
 cases++;
 if(expected===null)unsafePrevented++;
}

for(const [profile,text] of [
 ['processo','Art. 10. O pedido será encaminhado.'],
 ['processo','a autoridade recebeu o documento.'],
 ['geral','uma referência genérica sem número de artigo']
]){
 assert.equal(engine.legalReference(tokenize(text),profile).length,0,'Falso positivo '+text);
 cases++;
}
const raw='Art. 25. Nos termos do art. 5º, a decisão cabe à autoridade.';
const snap=tokenize(raw),before=JSON.stringify(snap);
w.BancoMestreCalibradoresV110.analyzeWords(snap,'processo');
assert.equal(JSON.stringify(snap),before,'Analisador não pode reescrever tokens do PDF');
// V121 was ambiguous: old resolver used the active law as target even for an
// explicit external citation. V123 MUST NOT repeat that behavior.
const external=tokenize('Art. 10. Conforme art. 37 da Constituição Federal.');
const v121=w.BancoMestreRelacoesNormativasV121.inspectDocument(external,'processo');
assert.equal(v121.references[0]?.target,'LEI9784:art37','Fixture de regressão histórica alterada');
const safe=engine.legalReference(external,'processo');
assert.equal(safe[0]?.target,'CF88:art37','Corrigir lei de destino');
// Reassert no network, storage, or hidden personal data access in new file.
const source=fs.readFileSync(path.join(root,'assets/v123_remissoes.js'),'utf8');
for(const dangerous of ['fetch(','XMLHttpRequest','localStorage','indexedDB','drive.file','document.cookie'])
 assert.ok(!source.includes(dangerous),'Dependência proibida: '+dangerous);
console.log(JSON.stringify({ok:true,cases,unsafePrevented,colorsPreserved,
 note:'Testes sintéticos de links e regressões; não medem precisão no universo de leis.'},null,2));

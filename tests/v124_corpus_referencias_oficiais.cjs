/* V124 — corpus jurídico de avaliação (não é dado de treinamento).
 * Oficiais: transcrições parciais de normas disponíveis nas URLs abaixo,
 * acessadas em 11/11/2026. Sintéticos: perturbações adversariais escritas
 * para testar vínculos entre leis. Não publicar dados privados do usuário.
 * Mede somente RESOLUÇÃO DE REMISSÕES, não acerto das quatro cores.
 */
'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),w={};
const sandbox=vm.createContext({window:w,console});
function load(p){vm.runInContext(fs.readFileSync(path.join(root,p),'utf8'),sandbox,{filename:p,timeout:6000})}
for(const p of ['assets/v109_classificador_lei_seca.js','assets/v112_perfis_lei_seca.js',
 'assets/v114_ia_lei_seca.js','assets/v114_cf_artigo1.js','assets/v121_relacoes_normativas.js',
 'assets/v124_remissoes.js'])load(p);
const texts={
 CF:'https://www4.planalto.gov.br/legislacao/legis-federal/constituicao',
 LC95:'https://www2.camara.leg.br/legin/fed/leicom/1998/leicomplementar-95-26-fevereiro-1998-363948-normaatualizada-pl.html',
 LIA:'https://www2.camara.leg.br/legin/fed/lei/1992/lei-8429-2-junho-1992-357452-normaatualizada-pl.html',
 L9784:'https://www2.camara.leg.br/legin/fed/lei/1999/lei-9784-29-janeiro-1999-322239-normaatualizada-pl.html',
 L14133:'https://www.planalto.gov.br/ccivil_03/_ato2019-2022/2021/lei/l14133.htm'
};
const gold=[
 // The official fixtures are held out from the V114 lexical examples.
 {source:'LIA',profile:'improbidade',text:'Dispõe sobre as sanções aplicáveis em virtude da prática de atos de improbidade administrativa, de que trata o § 4º do art. 37 da Constituição Federal; e dá outras providências.',want:['CF88:art37']},
 {source:'LIA',profile:'improbidade',text:'Art. 1º O sistema de responsabilização por atos de improbidade administrativa tutelará a probidade na organização do Estado e no exercício de suas funções, como forma de assegurar a integridade do patrimônio público e social, nos termos desta Lei.',want:[]},
 {source:'LIA',profile:'improbidade',text:'§ 1º Consideram-se atos de improbidade administrativa as condutas dolosas tipificadas nos arts. 9º, 10 e 11 desta Lei, ressalvados tipos previstos em leis especiais.',want:[],note:'Plural de artigos: ainda não interpretado; não inventar vínculo'},
 {source:'L9784',profile:'processo',text:'Art. 1º Esta Lei estabelece normas básicas sobre o processo administrativo no âmbito da Administração Federal direta e indireta, visando, em especial, à proteção dos direitos dos administrados e ao melhor cumprimento dos fins da Administração.',want:[]},
 {source:'L9784',profile:'processo',text:'§ 1º Os preceitos desta Lei também se aplicam aos órgãos dos Poderes Legislativo e Judiciário da União, quando no desempenho de função administrativa.',want:[]},
 {source:'L9784',profile:'processo',text:'Art. 3º O administrado tem os seguintes direitos perante a Administração, sem prejuízo de outros que lhe sejam assegurados:',want:[]},
 {source:'L9784',profile:'processo',text:'IV - fazer-se assistir, facultativamente, por advogado, salvo quando obrigatória a representação, por força de lei.',want:[]},
 {source:'L9784',profile:'processo',text:'Art. 50. Os atos administrativos deverão ser motivados, com indicação dos fatos e dos fundamentos jurídicos, quando:',want:[]},
 {source:'LC95',profile:'lc95',text:'Art. 1º A elaboração, a redação, a alteração e a consolidação das leis obedecerão ao disposto nesta Lei Complementar.',want:[]},
 {source:'LC95',profile:'lc95',text:'Parágrafo único. As disposições desta Lei Complementar aplicam-se, ainda, às medidas provisórias e demais atos normativos referidos no art. 59 da Constituição Federal, bem como, no que couber, aos decretos e aos demais atos de regulamentação expedidos por órgãos do Poder Executivo.',want:['CF88:art59']},
 {source:'LC95',profile:'lc95',text:'Art. 10. Os textos legais serão articulados com observância dos seguintes princípios:',want:[]},
 {source:'LC95',profile:'lc95',text:'I - a unidade básica de articulação será o artigo, indicado pela abreviatura "Art.", seguida de numeração ordinal até o nono e cardinal a partir deste;',want:[]},
 {source:'LC95',profile:'lc95',text:'II - os artigos desdobrar-se-ão em parágrafos ou em incisos; os parágrafos em incisos, os incisos em alíneas e as alíneas em itens;',want:[]},
 {source:'L14133',profile:'licitacoes',text:'Art. 1º Esta Lei estabelece normas gerais de licitação e contratação para as Administrações Públicas diretas, autárquicas e fundacionais da União, dos Estados, do Distrito Federal e dos Municípios, e abrange:',want:[]},
 {source:'L14133',profile:'licitacoes',text:'§ 1º Não são abrangidas por esta Lei as empresas públicas, as sociedades de economia mista e as suas subsidiárias, regidas pela Lei nº 13.303, de 30 de junho de 2016, ressalvado o disposto no art. 178 desta Lei.',want:[null],status:['profile_dependent_internal']},
 {source:'CF',profile:'cf88',text:'Art. 1º A República Federativa do Brasil, formada pela união indissolúvel dos Estados e Municípios e do Distrito Federal, constitui-se em Estado Democrático de Direito e tem como fundamentos:',want:[]},
 {source:'CF',profile:'cf88',text:'Art. 2º São Poderes da União, independentes e harmônicos entre si, o Legislativo, o Executivo e o Judiciário.',want:[]},
 {source:'CF',profile:'cf88',text:'Art. 3º Constituem objetivos fundamentais da República Federativa do Brasil:',want:[]},
 {source:'CF',profile:'cf88',text:'Art. 4º A República Federativa do Brasil rege-se nas suas relações internacionais pelos seguintes princípios:',want:[]},
 {source:'CF',profile:'cf88',text:'Art. 5º Todos são iguais perante a lei, sem distinção de qualquer natureza, garantindo-se aos brasileiros e aos estrangeiros residentes no País a inviolabilidade do direito à vida, à liberdade, à igualdade, à segurança e à propriedade, nos termos seguintes:',want:[]}
];
const adversarial=[
 ['processo','Art. 10. Conforme o art. 37 da Constituição Federal.', ['CF88:art37']],
 ['processo','Art. 10. Conforme o art. 37 da Constituição Estadual.', [null]],
 ['processo','Art. 10. Conforme o art. 37 da Constituição.', [null]],
 ['processo','Art. 10. Conforme o art. 37 desta Constituição.', [null]],
 ['cf88','Art. 10. Conforme o art. 5º desta Constituição.', [null]],
 ['processo','Art. 10. O pedido observará o art. 5º desta Lei.', [null]],
 ['geral','Art. 10. O pedido observará o art. 5º desta Lei.', [null]],
 ['processo','Art. 10. O pedido observará o art. 5º.', [null]],
 ['processo','Art. 10. Conforme art. 5º, a Constituição é objeto de estudos.', [null]],
 ['processo','Art. 10. Conforme art. 5º, a Lei 14.133 é objeto de estudo.', [null]],
 ['processo','Art. 10. Conforme o art. 5º. A Constituição Federal é mencionada no parágrafo seguinte.', [null]],
 ['processo','Art. 10. Conforme o art. 5º; a Lei nº 14.133 trata de outra matéria.', [null]],
 ['processo','Art. 10. Conforme o art. 5º, inciso II, da Constituição Federal.', ['CF88:art5']],
 ['processo','Art. 10. Conforme o art. 50 da Lei nº 14.133/2021.', ['LEI14133:art50']],
 ['processo','Art. 10. Conforme o art. 10 da Lei 8.429/1992.', ['LEI8429:art10']],
 ['processo','Art. 10. Conforme o art. 2º da Lei Complementar nº 95/1998.', ['LC95:art2']],
 ['licitacoes','Art. 5º O ato observará o art. 9º da LC 101/2000.', ['LC101:art9']],
 ['processo','Art. 5º O ato observará o art. 31 da Lei 12.527/2011.', ['LEI12527:art31']],
 ['lgpd','Art. 12. O tratamento observa o art. 5º da Lei 13.709/2018.', ['LEI13709:art5']],
 ['licitacoes','Art. 12. A medida observa o art. 15 da Lei 16.999/2024.', [null]],
 ['processo','Art. 3º De acordo com o art. 4º do Código Civil.', [null]],
 ['geral','Segundo o art. 37 da CF, os agentes atuarão.', ['CF88:art37']],
 ['processo','Art. 1º Requisitos. Art. 2º Nos termos do art. 5º da Constituição Federal.', ['CF88:art5']],
 ['processo','Art. 6º O art. 7º da Lei 14.133 é diferente do art. 37 da CF.', ['LEI14133:art7','CF88:art37']],
 ['processo','Art. 1º O caput deste artigo tem cinco incisos e três parágrafos.', []],
 ['processo','Arts. 9º, 10 e 11 desta Lei são mencionados.', []],
 ['processo','A sigla ART é usada em engenharia civil e não identifica a norma.', []],
 ['processo','O arquivo digitalizado apresenta a Lei 14.133, sem remissões.', []],
 ['processo','Art. 10. Verificar o inciso IV, da Constituição Federal, sem artigo citado.', []],
 ['geral','Revisar o PDF antes de grifar: a lei não foi identificada.', []],
 ['processo','Art. 10. Conforme art. 30 da CF.', ['CF88:art30']],
 ['processo','Art. 10. Conforme art. 30 da Constituição da República.', ['CF88:art30']]
];
const tokenize=text=>(text.match(/\S+/gu)||[]).map((t,i)=>({text:t,line:Math.floor(i/13),rects:[[.1,.1,.2,.2]]}));
let correct=0,incorrect=0,abstention=0,fullyResolved=0,expectedResolvable=0;
const errors=[],bySource={};
for(const rec of [...gold,...adversarial.map(([profile,text,want])=>({source:'SINTETICO',profile,text,want}))]){
 const actual=w.BancoMestreReferenciasV124.legalReference(tokenize(rec.text),rec.profile);
 const target=actual.map(r=>r.target);
 const expected=rec.want;
 const source=rec.source;
 bySource[source]??={cases:0,passed:0};
 bySource[source].cases++;
 const statuses=actual.map(r=>r.resolution);
 const passed=JSON.stringify(target)===JSON.stringify(expected)&&
  (!rec.status||JSON.stringify(statuses)===JSON.stringify(rec.status));
 if(passed){correct++;bySource[source].passed++}
 else {incorrect++;errors.push({source,profile:rec.profile,text:rec.text,
  expected,actual:target,statuses})}
 abstention+=actual.filter(r=>r.target===null).length;
 fullyResolved+=actual.filter(r=>r.target!==null).length;
 expectedResolvable+=expected.filter(x=>x!==null).length;
 // a resolved target must always have evidence of the law, not just a profile.
 for(const mark of actual)if(mark.target){
  assert.equal(mark.resolution,'explicit_law','Non-explicit target silently promoted');
  assert.equal(mark.verified_source,false,'Legal edition was not checked');
 }
}
const report={ok:incorrect===0,total:correct+incorrect,correct,incorrect,
 abstention,fullyResolved,expectedResolvable,bySource,errors,
 methodology:'Development test. 20 official passage checks plus 32 constructed adversarial cases. No blind-heldout accuracy claim.'};
if(!report.ok)console.error(JSON.stringify(errors,null,2));
console.log(JSON.stringify({...report,errors:report.errors.slice(0,8)},null,2));
assert.equal(incorrect,0,'Corpus de remissões falhou: não publicar.');

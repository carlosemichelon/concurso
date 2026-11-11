/* V126 — QA de abstenção de fragmentos e preservação de núcleos oficiais.
 * A V126 nunca propõe nova cor; somente retém ou rebaixa as sugestões V124.
 */
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const root=path.resolve(__dirname,'..'),w={};
const sandbox=vm.createContext({window:w,console});
function load(f){vm.runInContext(fs.readFileSync(path.join(root,f),'utf8'),sandbox,{filename:f,timeout:5000})}
for(const f of [
 'assets/v109_classificador_lei_seca.js','assets/v112_perfis_lei_seca.js',
 'assets/v114_ia_lei_seca.js','assets/v114_cf_artigo1.js',
 'assets/v121_relacoes_normativas.js','assets/v124_remissoes.js',
 'assets/v114_qa_cf_artigo1.js'
])load(f);
const previous=w.BancoMestreCalibradoresV110;
load('assets/v126_qualidade_clausulas.js');
const upgraded=w.BancoMestreCalibradoresV110;
const guard=w.BancoMestreQualidadeNormativaV126;
const tokens=t=>(t.match(/\S+/gu)||[]).map((word,i)=>({
 text:word,line:Math.floor(i/15),rects:[[.001+(i%100)*.009,.05+Math.floor(i/100)*.04,
 .007+(i%100)*.009,.079+Math.floor(i/100)*.04]]
}));
const examples=[
 {p:'cf88',text:'Art. 5º IV - é livre a manifestação do pensamento, sendo vedado o anonimato;',
   safe:['é livre a manifestação do pensamento,','vedado o anonimato;'],review:0},
 {p:'cf88',text:'Art. 5º VIII - ninguém será privado de direitos por motivo de crença religiosa ou de convicção filosófica ou política, salvo se as invocar para eximir-se de obrigação legal a todos imposta e recusar-se a cumprir prestação alternativa, fixada em lei;',
   safe:[],review:2},
 {p:'cf88',text:'Art. 5º IX - é livre a expressão da atividade intelectual, artística, científica e de comunicação, independentemente de censura ou licença;',
   safe:[],review:1},
 {p:'lc95',text:'Art. 10. Os textos legais serão articulados com observância dos seguintes princípios: I - a unidade básica de articulação será o artigo, indicado pela abreviatura "Art.", seguida de numeração ordinal até o nono e cardinal a partir deste;',
   safe:[],review:2},
 {p:'processo',text:'Art. 50. Os atos administrativos deverão ser motivados, com indicação dos fatos e dos fundamentos jurídicos, quando: III - decidam processos administrativos de concurso ou seleção pública; IV - dispensem ou declarem a inexigibilidade de processo licitatório;',
   safe:[],review:2},
 {p:'licitacoes',text:'Art. 1º § 1º Não são abrangidas por esta Lei as empresas públicas, as sociedades de economia mista e as suas subsidiárias, regidas pela Lei nº 13.303, de 30 de junho de 2016, ressalvado o disposto no art. 178 desta Lei.',
   safe:[],review:1},
 {p:'improbidade',text:'Art. 1º § 1º Consideram-se atos de improbidade administrativa as condutas dolosas tipificadas nos arts. 9º, 10 e 11 desta Lei, ressalvados tipos previstos em leis especiais.',
   safe:['Consideram-se atos de improbidade administrativa','ressalvados tipos previstos em leis especiais.'],review:0}
];
let gated=0,blocked=0,baseTotal=0,retained=0;
for(const [index,row] of examples.entries()){
 const t=tokens(row.text),input=JSON.stringify(t);
 const baseline=previous.analyzeWords(t,row.p),a=upgraded.analyzeWords(t,row.p);
 const actual=a.segments.map(s=>s.text);
 assert.deepEqual(Array.from(actual),row.safe,'Cores aprovadas inesperadas no caso '+index);
 assert.equal(a.quality_gate.rejected,row.review,'Bloqueios incorretos no caso '+index);
 // The only permissible V126 change is lowering a V124 decision to review.
 const baseIDs=new Set(baseline.segments.map(s=>[s.text,s.kind,s.color].join('|')));
 for(const s of a.segments)assert.ok(baseIDs.has([s.text,s.kind,s.color].join('|')),
   'V126 criou uma cor/núcleo novo: '+s.text);
 for(const s of a.review.filter(s=>s.quality_gate)){
  assert.equal(s.requires_review,true,'Blocked segment must require review');
  assert.equal(s.confidence,'baixa','Blocked segment must not retain high confidence');
 }
 assert.equal(JSON.stringify(t),input,'V126 modificou tokens do PDF');
 baseTotal+=baseline.segments.length;retained+=a.segments.length;blocked+=a.quality_gate.rejected;gated++;
}
const cf1=w.BancoMestreQAV114.officialArticle;
const art1=upgraded.analyzeWords(tokens(cf1),'cf88');
assert.equal(art1.constitutional_context,'art1','Artigo 1º perdeu vínculo de origem');
assert.equal(art1.segments.filter(s=>s.confidence==='alta'&&!s.requires_review).length,13,'Artigo 1º perdeu núcleos');
const cf2=upgraded.analyzeWords(tokens('Art. 2º São Poderes da União, independentes e harmônicos entre si, o Legislativo, o Executivo e o Judiciário.'),'cf88');
assert.equal(cf2.segments.length,3,'Artigo 2º perdeu fontes literais');
const cf3='Art. 3º Constituem objetivos fundamentais da República Federativa do Brasil:\n'+
 'I - construir uma sociedade livre, justa e solidária;\nII - garantir o desenvolvimento nacional;\n'+
 'III - erradicar a pobreza e a marginalização e reduzir as desigualdades sociais e regionais;\n'+
 'IV - promover o bem de todos, sem preconceitos de origem, raça, sexo, cor, idade e quaisquer outras formas de discriminação.';
assert.equal(upgraded.analyzeWords(tokens(cf3),'cf88').segments.length,5,'Artigo 3º perdeu objetivos');
const source=fs.readFileSync(path.join(root,'assets/v126_qualidade_clausulas.js'),'utf8');
for(const bad of ['fetch(','localStorage','indexedDB','XMLHttpRequest','Drive','addTextHighlights('])
 assert.ok(!source.includes(bad),'Módulo de qualidade não deve escrever ou acessar rede: '+bad);
console.log(JSON.stringify({ok:true,examples:gated,before:baseTotal,safe:retained,blocked,
 certifiedArticles:'CF arts. 1º–3º sem regressão',status:'bloqueio de falsos grifos, não prova de acerto em todo o Direito'},null,2));

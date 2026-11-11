/* Banco Mestre V119 — auditoria reproduzível da classificação artigo-aware.
 * Testa separação por artigo, 4 cores, remissões, falsos positivos e regressão.
 * Sem serviços externos e sem usar grifos, tokens privados ou dados do Drive.
 */
'use strict';
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),w={};
const sandbox=vm.createContext({window:w,console});
function load(f){vm.runInContext(fs.readFileSync(path.join(root,f),'utf8'),sandbox,{filename:f,timeout:7000})}
[
 'assets/v109_classificador_lei_seca.js','assets/v112_perfis_lei_seca.js',
 'assets/v114_ia_lei_seca.js','assets/v114_cf_artigo1.js',
 'assets/v119_relacoes_normativas.js',
 'assets/v111_calibrador_qa.js','assets/v112_qa_trechos_oficiais.js',
 'assets/v112_qa_negacoes.js','assets/v114_qa_cf_artigo1.js'
].forEach(load);
const CF2='Art. 2º São Poderes da União, independentes e harmônicos entre si, o Legislativo, o Executivo e o Judiciário.';
const CF3='Art. 3º Constituem objetivos fundamentais da República Federativa do Brasil:\n'+
 'I - construir uma sociedade livre, justa e solidária;\n'+
 'II - garantir o desenvolvimento nacional;\n'+
 'III - erradicar a pobreza e a marginalização e reduzir as desigualdades sociais e regionais;\n'+
 'IV - promover o bem de todos, sem preconceitos de origem, raça, sexo, cor, idade e quaisquer outras formas de discriminação.';
const CF4='Art. 4º A República Federativa do Brasil rege-se nas suas relações internacionais pelos seguintes princípios:\n'+
 'I - independência nacional;\nII - prevalência dos direitos humanos;\n'+
 'III - autodeterminação dos povos;\nIV - não-intervenção;\n'+
 'V - igualdade entre os Estados;\nVI - defesa da paz;\n'+
 'VII - solução pacífica dos conflitos;\nVIII - repúdio ao terrorismo e ao racismo;\n'+
 'IX - cooperação entre os povos para o progresso da humanidade;\nX - concessão de asilo político.\n'+
 'Parágrafo único. A República Federativa do Brasil buscará a integração econômica, política, social e cultural dos povos da América Latina, visando à formação de uma comunidade latino-americana de nações.';
const ARTICLE1='Art. 1º A República Federativa do Brasil, formada pela união indissolúvel dos Estados e Municípios e do Distrito Federal, constitui-se em Estado Democrático de Direito e tem como fundamentos:\nI - a soberania;\nII - a cidadania;\nIII - a dignidade da pessoa humana;\nIV - os valores sociais do trabalho e da livre iniciativa;\nV - o pluralismo político.\nParágrafo único. Todo o poder emana do povo, que o exerce por meio de representantes eleitos ou diretamente, nos termos desta Constituição.';
function tokens(text,opt={}){
 return (text.match(/\S+/gu)||[]).map((part,i)=>({
  text:part,rects:[[.001+(i%90)*.01,.02+Math.floor(i/90)*.04,.008+(i%90)*.01,.048+Math.floor(i/90)*.04]],
  line:Math.floor(i/18)
 }));
}
function audit(text,profile='cf88'){
 const t=tokens(text);return w.BancoMestreRelacoesNormativasV119.inspect(t,profile);
}
function validate(result,num,wanted,title){
 assert.equal(result.recognized,true,title+' sem reconhecimento');
 assert.deepEqual(Array.from(result.articles,a=>a.number),[num],title+' artigo errado');
 assert.equal(result.segments.length,wanted,title+' núcleos incorretos');
 const rectangles=new Set();
 const colors={regra:'#FDE68A',agente:'#BBF7D0',condicao:'#BAE6FD',excecao:'#FECDD3'};
 for(const s of result.segments){
  assert.equal(s.color,colors[s.kind],title+' cor errada');
  assert.equal(s.confidence,'alta',title+' confiança errada');
  assert.equal(s.requires_review,false,title+' revisão forçada');
  assert.equal(s.classification_status,'sugestao',title+' gravou como confirmado');
  assert.equal(s.legal_article,'CF88:art'+num,title+' vínculo do artigo errado');
  assert.ok(s.legal_source_url.includes('camara.leg.br'),title+' fonte ausente');
  assert.ok(!s.text.match(/^\s*(I|II|III|IV|V|VI|VII|VIII|IX|X)\s*[-–—]/),title+' numeral invadiu grifo');
  for(const r of s.rects){const id=r.join('|');assert.ok(!rectangles.has(id),title+' sobreposição');rectangles.add(id)}
 }
 assert.equal(result.relations.length,wanted,title+' relações não rastreadas');
}
const transforms=[
 ['oficial',s=>s],
 ['caixa alta',s=>s.toUpperCase()],
 ['caixa baixa',s=>s.toLowerCase()],
 ['unicode NFD',s=>s.normalize('NFD')],
 ['espaco NBSP',s=>s.replace(/ /g,'\u00a0')],
 ['espacos multiplos',s=>s.replace(/ /g,'   ')],
 ['linha unica',s=>s.replace(/\s*\n\s*/g,' ')],
 ['sem cabecalho',s=>s.replace(/^Art\.\s*\d+º\s*/u,'')],
 ['titulo colado',s=>s.replace(/^Art\.\s*/u,'Art.')],
 ['travessao',s=>s.replace(/([IVX]+) - /g,'$1 — ')],
 ['algarismo parentese',s=>s.replace(/([IVX]+) - /g,'$1) ')],
 ['hifen verbo separado',s=>s.replace(/rege-se/gi,'rege - se').replace(/não-intervenção/gi,'não - intervenção')]
];
let positive=0,negative=0,source=0,graph=0,legacy=0,adversarial=0;
for(const [n,text,count] of [[2,CF2,3],[3,CF3,5],[4,CF4,13]]){
 for(const [kind,fn] of transforms){
  const result=audit(fn(text));
  validate(result,n,count,'art'+n+'/'+kind);
  positive++;
  if(result.segments.every(s=>s.legal_source_key==='CF88'))source++;
  if(result.relations.every(r=>r.source==='CF88:art'+n))graph++;
 }
}
for(const [label,text] of [
 ['art. 7 com caput do 3',CF3.replace('Art. 3º','Art. 7º')],
 ['art. 5 com caput do 4',CF4.replace('Art. 4º','Art. 5º')],
 ['art. 1 com caput do 2',CF2.replace('Art. 2º','Art. 1º')],
 ['art. 33 com caput do 3',CF3.replace('Art. 3º','Art. 33º')],
 ['caput 3 modificado',CF3.replace('Constituem objetivos fundamentais','Mencionam alguns objetivos fundamentais')],
 ['caput 4 modificado',CF4.replace('rege-se nas suas relações internacionais','estuda nas suas relações internacionais')],
 ['caput 2 modificado',CF2.replace('São Poderes','Foram Poderes')],
 ['incisos avulsos','I - independência nacional; II - prevalência dos direitos humanos;'],
 ['relação narrativa','O capítulo explica os objetivos da República em exercícios comentados.'],
 ['frase avulsa','Parágrafo único. A República Federativa buscará integração.'],
 ['texto simples','O arquivo foi salvo e a autoridade conferiu a pasta.']
]){
 const result=audit(text);
 assert.equal(result.recognized,false,'ativação indevida: '+label);
 negative++;
}
for(const [article,text,blocked] of [
 [3,CF3.replace('II - garantir','II garantir'),2],
 [3,CF3.replace('I - construir','A - construir'),1],
 [4,CF4.replace('VI - defesa','VI defesa'),8],
 [4,CF4.replace('III - autodeterminação','III autodeterminação'),5]
]){
 const r=audit(text);
 assert.equal(r.articles[0]?.number,article,'caput nao identificado');
 assert.equal(r.segments.length,blocked,'não bloqueou inciso inseguro '+article);
 adversarial++;
}
for(const text of [CF2,CF3,CF4,ARTICLE1]){
 const r=audit(text,'geral');
 assert.equal(r.recognized,false,'ativou sem perfil CF');
 negative++;
}
const union=ARTICLE1+'\n'+CF2+'\n'+CF3+'\n'+CF4;
const all=tokens(union);
const scan=w.BancoMestreRelacoesNormativasV119.inspect(all,'cf88');
assert.deepEqual(Array.from(scan.articles,a=>a.number),[2,3,4]);
assert.equal(scan.segments.length,21,'segmentos dos artigos 2–4 devem coexistir');
const complete=w.BancoMestreCalibradoresV110.analyzeWords(all,'cf88');
assert.equal(complete.constitutional_context,'art1','V114 art1 deve permanecer');
assert.ok(complete.segments.length>=21,'não perdeu novo módulo');
const copied=JSON.stringify(all);w.BancoMestreCalibradoresV110.analyzeWords(all,'cf88');
assert.equal(JSON.stringify(all),copied,'não pode mutar tokens do PDF');
const ref='Art. 7º O direito será exercido nos termos do art. 5º desta Constituição.';
const links=audit(ref);
assert.equal(links.references.length,1,'remissão constitucional não reconhecida');
assert.equal(links.references[0].target,'CF88:art5');
graph++;
// Herança: mesmas 827 verificações funcionais anteriores e 154 exemplos da IA local.
const suites={
 old:w.BancoMestreCalibradorQAV111.run(w.BancoMestreCalibradoresV110,true),
 official:w.BancoMestreCalibradorQAOflV112.run(w.BancoMestreCalibradoresV110),
 negative:w.BancoMestreCalibradorQANegV112.run(w.BancoMestreCalibradoresV110),
 art1:w.BancoMestreQAV114.run(w)
};
for(const [name,suite] of Object.entries(suites)){
 if(!suite.ok)console.error(name,JSON.stringify(suite.failures||suite.errors||suite.structuralIssues||[],null,2));
 assert.equal(suite.ok,true,'Regressão anterior: '+name);
 legacy++;
}
assert.equal(suites.old.totals.passed,200);
assert.equal(suites.official.stats.passed,216);
assert.equal(suites.negative.stats.passed,411);
assert.equal(suites.art1.tests.full,10);
assert.equal(suites.art1.tests.denials,10);
assert.equal(w.BancoMestreIALeiSecaV114.examples,154);
console.log(JSON.stringify({ok:true,positive,negative,adversarial,source,graph,legacy,
 supported:[2,3,4],notes:'Métricas são cenários de regressão controlados, não precisão estatística em leis novas.'},null,2));

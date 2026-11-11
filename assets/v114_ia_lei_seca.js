/* V114 — protótipo supervisionado local, transparente e sem rede:
 * Multinomial Naive Bayes com unigramas/bigramas normalizados.
 * Treino pequeno, exemplos MANUALMENTE rotulados de redação jurídica.
 * NÃO é BERT, não é LLM, não equivale a certeza; não cria grifos por conta própria.
 */
(function(){
'use strict';
if(window.BancoMestreIALeiSecaV114)return;
const DATA={"regra":["constitui-se em Estado Democrático de Direito","tem como fundamentos","formada pela união indissolúvel","a soberania","a cidadania","a dignidade da pessoa humana","os valores sociais do trabalho e da livre iniciativa","o pluralismo político","Todo o poder emana","que o exerce por meio de representantes eleitos ou diretamente","São Poderes da União","independentes e harmônicos entre si","Constituem objetivos fundamentais","construir uma sociedade livre justa e solidária","garantir o desenvolvimento nacional","erradicar a pobreza e a marginalização","reduzir as desigualdades sociais e regionais","promover o bem de todos","independência nacional","prevalência dos direitos humanos","autodeterminação dos povos","não intervenção","igualdade entre os Estados","defesa da paz","solução pacífica dos conflitos","repúdio ao terrorismo e ao racismo","cooperação entre os povos para o progresso da humanidade","concessão de asilo político","é inviolável o direito","é livre a manifestação do pensamento","é assegurado o direito de resposta","ninguém será obrigado a fazer ou deixar de fazer alguma coisa","se constitui em Estado de Direito","possui como seus fundamentos","o princípio constitucional da dignidade da pessoa humana","a união indissolúvel","fundamentos da República","é competência comum da União","é dever dos órgãos garantir","são objetivos da República","é vedado o anonimato","o poder pertence ao povo","o povo exerce o poder político"],"agente":["A República Federativa do Brasil","a República Federativa","a União","a Câmara dos Deputados","o Senado Federal","o Congresso Nacional","o Poder Executivo","o Poder Legislativo","o Poder Judiciário","os Estados","os Municípios","o Distrito Federal","o povo","do povo","a autoridade competente","os órgãos públicos","as pessoas naturais","a administração pública","o titular do direito","os representantes eleitos","a Federação brasileira","o Estado brasileiro","o cidadão","o Poder Público","os entes federativos","o titular do poder","o servidor público","o município responsável","a República","o titular","a pessoa","o conjunto dos entes federados","o Poder Constituinte"],"condicao":["nos termos desta Constituição","na forma da lei","nos termos da lei","mediante decisão judicial","por meio de representantes eleitos","até o limite previsto","no prazo de trinta dias","desde que cumpridos os requisitos","quando for necessário","por maioria absoluta","em dois turnos","com a aprovação de dois terços","nos casos previstos nesta Constituição","somente nas hipóteses estabelecidas","a partir da publicação","durante o estado de defesa","mediante autorização prévia","sob as condições estabelecidas","de acordo com a lei","para todos os efeitos legais","nos limites definidos em lei","se forem preenchidos os requisitos","observada a disposição constitucional","em caso de necessidade"],"excecao":["salvo se as invocar","ressalvado o disposto nesta Constituição","exceto nas hipóteses previstas","não se aplica o disposto","será dispensada a exigência","em caráter excepcional","salvo nas condições previstas","excluídos os casos","ressalvadas as exceções expressas","independentemente de autorização","dispensado o requisito","exceto se houver autorização","não configura infração","afasta a responsabilidade","salvo em caso de flagrante delito","sem prejuízo das exceções","ressalvado direito adquirido","fica excluído do campo de incidência","salvo por determinação judicial","não será aplicável à hipótese"],"nenhum":["Art. 1º","Art. 2º","TÍTULO I","DOS PRINCÍPIOS FUNDAMENTAIS","I","II","III","IV","V","Parágrafo único","à","do","de","em","que","nos","com","ou","a República foi mencionada","o documento foi salvo","anotações no material","trecho sem dispositivo","cinco fundamentos listados no resumo","a lei foi digitalizada","capa da constituição","legenda do índice","Municípios e Estados","o arquivo contém artigos","documento de estudo","o capítulo apresenta exemplos","exercícios comentados","seleção de palavras","informação adicional","sumário da Constituição"]};
const LABELS=Object.freeze(['regra','agente','condicao','excecao','nenhum']);
const norm=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'')
 .toLowerCase().replace(/[\u2010-\u2015]/g,'-');
function features(value){
 const tokens=norm(value).match(/[\p{L}\p{N}]+(?:-[\p{L}\p{N}]+)?/gu)||[];
 const bag=new Map();function add(key){bag.set(key,(bag.get(key)||0)+1)}
 for(let i=0;i<tokens.length;i++){
  add('w:'+tokens[i]);
  if(i+1<tokens.length)add('b:'+tokens[i]+'_'+tokens[i+1]);
 }
 return bag;
}
function train(dataset=DATA){
 const counts=new Map(),sizes=new Map(),sizesDoc=new Map();
 const vocab=new Set();
 for(const label of LABELS){counts.set(label,new Map());sizes.set(label,0);sizesDoc.set(label,0)}
 for(const label of LABELS){
  for(const line of dataset[label]||[]){
   const f=features(line);
   sizesDoc.set(label,sizesDoc.get(label)+1);
   for(const [key,freq] of f){
    vocab.add(key);
    counts.get(label).set(key,(counts.get(label).get(key)||0)+freq);
    sizes.set(label,sizes.get(label)+freq);
   }
  }
 }
 const model={
  vocab:[...vocab].sort(),samples:Object.fromEntries(sizesDoc),labels:LABELS,
  counts:Object.fromEntries(LABELS.map(k=>[k,Object.fromEntries(counts.get(k))])),
  totals:Object.fromEntries(sizes),size:[...sizesDoc.values()].reduce((a,b)=>a+b,0)
 };
 return model;
}
const model=train();
function predict(text,ref=model){
 const bag=features(text),total=ref.size,lex=ref.vocab.length||1;
 const scores=ref.labels.map(label=>{
  const freq=ref.counts[label],prior=(ref.samples[label]+1)/(total+ref.labels.length);
  let score=Math.log(prior);
  for(const [key,n] of bag){
   // Unknown words are safely ignored: do not invent a color.
   if(!Object.prototype.hasOwnProperty.call(freq,key)&&!ref.vocab.includes(key))continue;
   score+=n*Math.log(((freq[key]||0)+1)/(ref.totals[label]+lex));
  }
  return {label,log:score};
 });
 const peak=Math.max(...scores.map(s=>s.log));
 const probs=scores.map(s=>({...s,prob:Math.exp(s.log-peak)}));
 const denom=probs.reduce((n,x)=>n+x.prob,0)||1;
 probs.forEach(x=>x.prob/=denom);
 probs.sort((a,b)=>b.prob-a.prob);
 const top=probs[0],margin=top.prob-(probs[1]?.prob||0);
 return {label:top.label,score:Number(top.prob.toFixed(4)),
  margin:Number(margin.toFixed(4)),alternatives:probs.slice(0,3).map(x=>({
   label:x.label,score:Number(x.prob.toFixed(4))})),
  advisoryOnly:true,trainedExamples:ref.size};
}
window.BancoMestreIALeiSecaV114=Object.freeze({
 version:'V114-NB-local-prototype',labels:LABELS,examples:model.size,
 predict,train,features,trainingSamples:Object.freeze(
  Object.fromEntries(LABELS.map(k=>[k,(DATA[k]||[]).length]))),
 get snapshot(){return {labels:model.labels,samples:model.samples,features:model.vocab.length}}
});
})();

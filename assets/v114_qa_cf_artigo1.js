/* V114 — auditoria de CF art. 1º e do classificador lexical local.
 * O corpus de avaliação não modifica grifos/SRS e não faz rede.
 */
(function(){
'use strict';
const OFFICIAL="Art. 1º A República Federativa do Brasil, formada pela união indissolúvel dos Estados e Municípios e do Distrito Federal, constitui-se em Estado Democrático de Direito e tem como fundamentos:\nI - a soberania;\nII - a cidadania;\nIII - a dignidade da pessoa humana;\nIV - os valores sociais do trabalho e da livre iniciativa;\nV - o pluralismo político.\nParágrafo único. Todo o poder emana do povo, que o exerce por meio de representantes eleitos ou diretamente, nos termos desta Constituição.";
const HOLDOUT=[["regra","constitui a estrutura do Estado Democrático de Direito"],["regra","o princípio do pluralismo político"],["regra","a ordem constitucional protege a cidadania"],["regra","a união indissolúvel define a Federação"],["regra","a soberania popular é um fundamento"],["agente","os representantes políticos"],["agente","o povo soberano"],["agente","a República federativa brasileira"],["agente","os órgãos do Estado"],["agente","o titular constitucional do direito"],["condicao","nos limites desta constituição"],["condicao","observados os requisitos da lei"],["condicao","por intermédio de representantes eleitos"],["condicao","segundo as condições legais"],["condicao","com autorização prévia"],["excecao","ressalvadas as hipóteses constitucionais"],["excecao","não se aplica a regra"],["excecao","dispensa da exigência prevista"],["excecao","salvo nos casos expressos"],["excecao","excetuada a situação especial"],["nenhum","CAPÍTULO DOS FUNDAMENTOS"],["nenhum","anotações manuscritas"],["nenhum","o texto foi convertido"],["nenhum","a lei foi estudada"],["nenhum","artigo primeiro da apostila"]];
function tokens(text){
 return (String(text).match(/\S+/gu)||[]).map((word,i)=>({
  text:word,rects:[[i*.002,.11,i*.002+.0017,.145]],line:Math.floor(i/15)
 }));
}
function run(w=window){
 const failures=[],cf=w.BancoMestreCalibradoresV110,model=w.BancoMestreIALeiSecaV114;
 const expected=13;
 if(!cf||!model)return {ok:false,failures:[{error:'Required models missing'}]};
 const transforms=[
  ['oficial',OFFICIAL],['maiusculas',OFFICIAL.toUpperCase()],
  ['minusculas',OFFICIAL.toLowerCase()],['unicode NFD',OFFICIAL.normalize('NFD')],
  ['espacos',OFFICIAL.replace(/ /g,'   ')],
  ['espacos fixos',OFFICIAL.replace(/ /g,'\u00a0')],
  ['caixa mista',OFFICIAL.split(/\s+/u).map((t,i)=>i%2?t.toUpperCase():t.toLowerCase()).join(' \n ')],
  ['uma linha',OFFICIAL.replace(/\s*\n\s*/gu,' ')],
  ['sem titulo',OFFICIAL.replace(/^Art\.\s*1º\s*/u,'')],
  ['titulo sem espaço',OFFICIAL.replace('Art. 1º','Art.1º')]
 ];
 const tests={full:0,denials:0,palette:0,overlap:0,training:0,heldOut:0};
 for(const [variant,text] of transforms){
  const r=cf.analyzeWords(tokens(text),'cf88');
  const safe=r.segments.filter(s=>s.confidence==='alta'&&!s.requires_review);
  const f=safe.filter(s=>s.kind==='regra'&&/^(?:a soberania|a cidadania|a dignidade|os valores sociais|o pluralismo)/iu.test(s.text));
  if(r.constitutional_context!=='art1'||safe.length!==expected||f.length!==5)
   failures.push({variant,issue:'expected 13 nuclei and 5 foundations',actual:safe.length,foundations:f.length});
  else tests.full++;
  const occupied=new Set();
  for(const s of safe){
   const expectedColor={regra:'#FDE68A',agente:'#BBF7D0',condicao:'#BAE6FD',excecao:'#FECDD3'}[s.kind];
   if(s.color!==expectedColor)failures.push({variant,issue:'wrong color',kind:s.kind,color:s.color});
   else tests.palette++;
   if(!s.calibration_evidence?.includes('art. 1º'))failures.push({variant,issue:'missing evidence'});
   for(const r of s.rects){
    const tag=r.join('|');
    if(occupied.has(tag))failures.push({variant,issue:'overlap',text:s.text});
    occupied.add(tag);
   }
  }
  tests.overlap++;
 }
 const negative=[
  ['artigo 3',OFFICIAL.replace('Art. 1º','Art. 3º')],
  ['artigo 5',OFFICIAL.replace('Art. 1º','Art. 5º')],
  ['fundamentos ausentes',OFFICIAL.replace('tem como fundamentos','é apresentado em resumo')],
  ['inciso isolado','I - a soberania;'],
  ['termo isolado','a soberania'],
  ['só parágrafo','Parágrafo único. Todo o poder emana do povo.'],
  ['sem relação','A República Federativa do Brasil discute outros artigos.'],
  ['título simples','TÍTULO I - Dos Princípios Fundamentais'],
  ['definição inventada','Art. 7º A República Federativa do Brasil tem como fundamentos a lista abaixo.'],
  ['documento não jurídico','O arquivo possui referências à Constituição em suas páginas.']
 ];
 for(const [label,text] of negative){
  const result=cf.analyzeWords(tokens(text),'cf88');
  if(result.constitutional_context==='art1')failures.push({negative:label,issue:'false article1 context'});
  else tests.denials++;
 }
 const again=model.train();
 const again2=model.train();
 const snap=JSON.stringify(again)===JSON.stringify(again2);
 if(!snap||again.size!==model.examples||model.examples!==154)
  failures.push({issue:'training not deterministic',samples:again.size});
 else tests.training++;
 const held=HOLDOUT.map(([trueLabel,text])=>({
  trueLabel,text,predicted:model.predict(text).label
 }));
 tests.heldOut=held.filter(x=>x.trueLabel===x.predicted).length;
 return {ok:!failures.length,tests,failures,holdout:{
  count:held.length,correct:tests.heldOut,mistakes:held.filter(x=>x.trueLabel!==x.predicted)
 },note:'Holdout small/curated; not a statistically representative legal accuracy measure.'};
}
window.BancoMestreQAV114=Object.freeze({run,officialArticle:OFFICIAL});
})();

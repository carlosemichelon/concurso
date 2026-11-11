/* V114 — interpretação ESTRUTURAL do art. 1º da CF/1988.
 * Usa contexto do caput, lista de fundamentos e parágrafo único.
 * O modelo supervisionado V114 fornece apenas uma segunda opinião.
 * Nenhum aprendizado a partir de grifos privados. Sem rede, sem armazenamento.
 */
(function(){
'use strict';
if(window.BancoMestreCFArtigo1V114)return;
const base=window.BancoMestreCalibradoresV110;
const ai=window.BancoMestreIALeiSecaV114;
const colors=window.BancoMestreClassificadorV070?.COLORS;
if(!base?.analyzeWords||!colors||!ai)return;
const plain=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'')
 .replace(/[\u2010-\u2015]/g,'-').toLowerCase().trim();
const token=s=>plain(s).replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu,'');
const phrase=s=>String(s).split(/\s+/u).map(token);
const isArt1=(w,i)=>w[i]==='art'&&/^1(?:º|°|o)?$/u.test(w[i+1]||'');
const isArtLater=(w,i)=>w[i]==='art'&&/^[2-9]\d*(?:º|°|o)?$/u.test(w[i+1]||'');
function indices(words,expr,after=0,until=words.length){
 const target=phrase(expr);
 outer:for(let i=after;i<=Math.min(until,words.length)-target.length;i++){
  for(let j=0;j<target.length;j++)if(words[i+j]!==target[j])continue outer;
  return [i,i+target.length-1];
 }
 return null;
}
function validGeometry(tokens,a,b){
 if(a<0||b>=tokens.length||b<a||b-a>20)return false;
 const r=tokens.slice(a,b+1);
 return r.every(t=>Array.isArray(t.rects)&&t.rects.length&&
  t.rects.every(x=>Array.isArray(x)&&x.length===4&&x.every(n=>Number.isFinite(n)&&n>=0&&n<=1)&&x[0]<x[2]&&x[1]<x[3]));
}
function artifact(tokens,kind,a,b,reason){
 if(!validGeometry(tokens,a,b)||!colors[kind])return null;
 const chosen=tokens.slice(a,b+1),text=chosen.map(x=>String(x.text||'')).join(' ').replace(/\s+/gu,' ').trim();
 if(!text)return null;
 const reading=ai.predict(text);
 const opinion=reading.label===kind?'Apoio do modelo lexical treinado':'O modelo lexical divergiu ou é inconclusivo';
 const annotation='CF/88 art. 1º, dispositivo expresso: '+reason+'. '+opinion+'; interpretação deve ser conferida.';
 return {kind,color:colors[kind].color,color_label:colors[kind].label,
  confidence:'alta',requires_review:false,classification_status:'sugestao',
  classification_kind:kind,calibration_profile:'cf88',
  calibration_evidence:annotation.slice(0,218),
  evidence:annotation.slice(0,218),text,
  rects:chosen.flatMap(t=>t.rects),anchor:{quote:text,prefix:'',suffix:''},
  start:a,end:b,ai_advisory:reading.label,ai_support:reading.label===kind};
}
function analyzeArticle(tokens){
 if(!Array.isArray(tokens)||tokens.length<6)return {recognized:false,segments:[],stop:0};
 const words=tokens.map(t=>token(t.text)),full=words.join(' ');
 const art1=words.findIndex((w,i)=>i<12&&isArt1(words,i));
 const explicitArt=words.findIndex((w,i)=>i<12&&w==='art'&&/^\d+(?:º|°|o)?$/u.test(words[i+1]||''));
 // An explicit number other than 1º wins over any lexical resemblance.
 if(explicitArt>=0&&art1<0)return {recognized:false,segments:[],stop:0,reason:'Dispositivo diferente do art. 1º'};
 const caputId=indices(words,'a republica federativa do brasil',0,Math.min(42,words.length));
 const foundation=indices(words,'tem como fundamentos',0,Math.min(48,words.length));
 // The generic "povo" or isolated "soberania" without art. 1º context
 // never creates a confident automatic highlight.
 const trusted=(art1>=0||caputId)&&foundation&&
   (caputId||full.includes('uniao indissoluvel'));
 if(!trusted)return {recognized:false,segments:[],stop:0,reason:'Sem contexto do art. 1º'};
 let stop=words.length;
 for(let i=Math.max(8,art1+2);i<words.length-1;i++)if(isArtLater(words,i)){stop=i;break}
 const segments=[],busy=new Set();
 function append(kind,r,reason){
  if(!r||r[1]>=stop)return;
  const [a,b]=r;if(Array.from({length:b-a+1},(_,j)=>j+a).some(i=>busy.has(i)))return;
  const out=artifact(tokens,kind,a,b,reason);
  if(!out)return;
  for(let i=a;i<=b;i++)busy.add(i);
  segments.push(out);
 }
 append('agente',caputId,'sujeito da definição da República');
 const formations=[
  'formada pela uniao indissoluvel dos estados e municipios e do distrito federal',
  'formada pela uniao indissoluvel dos estados e municipios',
  'uniao indissoluvel dos estados e municipios e do distrito federal'
 ];
 for(const f of formations){const range=indices(words,f,0,Math.min(stop,45));if(range){append('regra',range,'definição da formação federativa');break}}
 for(const f of ['constitui-se em estado democratico de direito','constitui se em estado democratico de direito']){
  const r=indices(words,f,0,Math.min(stop,55));if(r){append('regra',r,'definição do Estado Democrático de Direito');break}
 }
 append('regra',foundation,'anúncio do rol taxativo de fundamentos constitucionais');
 // Each inciso is a FOUNDATIONAL NORM (yellow), not an exception.
 // Only match sequence I,II,III,IV,V after "tem como fundamentos".
 const roman=['i','ii','iii','iv','v'];let after=foundation[1]+1;
 const unique=words.findIndex((w,i)=>i>after&&w==='paragrafo'&&words[i+1]==='unico');
 const limit=unique>=0?Math.min(unique,stop):stop;
 for(const number of roman){
  let marker=-1;
  for(let i=after;i<limit;i++){
   if(words[i]!==number)continue;
   if(words[i+1]!==''&&words[i+1]!=='a'&&words[i+1]!=='o'&&words[i+1]!=='os')continue;
   if(words[i+1]!==''&&token(tokens[i+1]?.text||'')!=='')continue;
   marker=i;break;
  }
  if(marker<0)break;
  const from=marker+2;let end=from;
  while(end<limit&&end-from<13&&
   !/[;.]$/u.test(String(tokens[end]?.text||''))&&
   !(words[end]==='paragrafo'&&words[end+1]==='unico'))end++;
  if(end>=limit)end=limit-1;
  // Trim editorial reference text; punctuation stays part of the last word.
  while(end>=from&&!words[end])end--;
  if(end>=from)append('regra',[from,end],'fundamento constitucional do inciso '+number.toUpperCase());
  after=end+1;
 }
 const pStart=unique>=0?unique+2:Math.max(0,foundation[1]+1);
 append('regra',indices(words,'todo o poder emana',pStart,stop),'origem do poder político');
 append('agente',indices(words,'do povo',pStart,stop),'titularidade popular do poder');
 append('regra',indices(words,'que o exerce por meio de representantes eleitos ou diretamente',pStart,stop),
  'formas constitucionalmente previstas para exercer o poder');
 append('condicao',indices(words,'nos termos desta constituicao',pStart,stop),
  'remissão expressa ao texto constitucional');
 segments.sort((a,b)=>a.start-b.start);
 return {recognized:true,segments,stop,reason:'Art. 1º e fundamentos reconhecidos pelo contexto'};
}
function analyzeWords(tokens,profileId='geral'){
 const generic=base.analyzeWords(tokens,profileId);
 if(profileId!=='cf88')return generic;
 const result=analyzeArticle(tokens);
 if(!result.recognized||!result.segments.length)return generic;
 const normalizeRects=s=>new Set((s.rects||[]).map(r=>r.join('|')));
 const owned=new Set(result.segments.flatMap(s=>(s.rects||[]).map(r=>r.join('|'))));
 const existing=(generic.segments||[]).filter(s=>![...normalizeRects(s)].some(x=>owned.has(x)));
 const review=(generic.review||[]).filter(s=>![...normalizeRects(s)].some(x=>owned.has(x)));
 const combined=[...result.segments,...existing].sort((a,b)=>{
  const x=a.start??0,y=b.start??0;return x-y;
 });
 // Keep complete, non-overlapping words, no fifth color.
 combined.forEach((s,i)=>{s.segment_index=i+1;s.segment_total=combined.length});
 return {...generic,profileId:'cf88',segments:combined,
  suggestions:combined,review,constitutional_context:'art1',ai_explanation:
  'Modelo Naive Bayes local treinado com '+ai.examples+' exemplos; somente segunda opinião',
  coverage:tokens.length?result.segments.reduce((n,s)=>n+(s.end-s.start+1),0)/tokens.length:0};
}
window.BancoMestreCalibradoresV110=Object.freeze({...base,analyzeWords});
window.BancoMestreCFArtigo1V114=Object.freeze({analyzeArticle,
 model:'hybrid-contextual-supervised-advisory',rulesVersion:'CF_ART1_2026_01'});
})();

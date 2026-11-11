/* V119 — articulação normativa com proveniência verificável.
 * Não é um LLM. Reconhece literalmente trechos dos arts. 2º–4º da CF/88,
 * vincula incisos ao caput e extrai remissões entre artigos. Mantém a camada
 * V114 (art. 1º) e a IA lexical como apoio, jamais como decisora de cor.
 * Sem acesso a grifos privados, Drive, localStorage ou qualquer rede.
 */
(function(){
'use strict';
if(window.BancoMestreRelacoesNormativasV119)return;
const previous=window.BancoMestreCalibradoresV110;
const palette=window.BancoMestreClassificadorV070?.COLORS;
if(!previous?.analyzeWords||!palette)return;
const SOURCE='https://www2.camara.leg.br/legin/fed/consti/1988/constituicao-1988-5-outubro-1988-322142-normaatualizada-pl.html';
const SPECS=[
 {number:2,head:'sao poderes da uniao independentes e harmonicos entre si o legislativo o executivo e o judiciario',
  parts:[
   ['regra','sao poderes da uniao','Identificação constitucional dos Poderes'],
   ['regra','independentes e harmonicos entre si','Separação e harmonia dos Poderes'],
   ['agente','o legislativo o executivo e o judiciario','Poderes da União expressamente enumerados']
  ],items:[]},
 {number:3,head:'constituem objetivos fundamentais da republica federativa do brasil',
  parts:[['regra','constituem objetivos fundamentais da republica federativa do brasil',
   'Caput que qualifica o rol como objetivos fundamentais']],
  items:[
   ['i','construir uma sociedade livre justa e solidaria'],
   ['ii','garantir o desenvolvimento nacional'],
   ['iii','erradicar a pobreza e a marginalizacao e reduzir as desigualdades sociais e regionais'],
   ['iv','promover o bem de todos sem preconceitos de origem raca sexo cor idade e quaisquer outras formas de discriminacao']
  ]},
 {number:4,head:'a republica federativa do brasil rege se nas suas relacoes internacionais pelos seguintes principios',
  parts:[
   ['agente','a republica federativa do brasil','Sujeito da diretriz constitucional internacional'],
   ['regra','rege se nas suas relacoes internacionais pelos seguintes principios',
    'Caput do rol de princípios das relações internacionais']
  ],items:[
   ['i','independencia nacional'],
   ['ii','prevalencia dos direitos humanos'],
   ['iii','autodeterminacao dos povos'],
   ['iv','nao intervencao'],
   ['v','igualdade entre os estados'],
   ['vi','defesa da paz'],
   ['vii','solucao pacifica dos conflitos'],
   ['viii','repudio ao terrorismo e ao racismo'],
   ['ix','cooperacao entre os povos para o progresso da humanidade'],
   ['x','concessao de asilo politico']
  ],soleParagraph:'a republica federativa do brasil buscara a integracao economica politica social e cultural dos povos da america latina visando a formacao de uma comunidade latino americana de nacoes'}
];
const LEX=/[\p{L}\p{N}º°]+/gu;
function normalize(s){return String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'')
 .replace(/[\u2010-\u2015]/g,'-').toLowerCase()}
function lex(text){return normalize(text).match(LEX)||[]}
function flatten(tokens){
 const flat=[];
 tokens.forEach((t,index)=>lex(t.text).forEach(word=>flat.push({word,index})));
 return flat;
}
function phrase(flat,words,from=0,until=flat.length){
 const target=Array.isArray(words)?words:lex(words);
 if(!target.length)return null;
 search:for(let i=from;i<=Math.min(until,flat.length)-target.length;i++){
  for(let j=0;j<target.length;j++)if(flat[i+j].word!==target[j])continue search;
  return {begin:i,end:i+target.length-1,start:flat[i].index,stop:flat[i+target.length-1].index};
 }
 return null;
}
function geometry(tokens,a,b){
 if(a<0||b<a||b>=tokens.length||b-a>55)return false;
 return tokens.slice(a,b+1).every(t=>Array.isArray(t.rects)&&t.rects.length&&
  t.rects.every(r=>Array.isArray(r)&&r.length===4&&
   r.every(x=>typeof x==='number'&&Number.isFinite(x)&&x>=0&&x<=1)&&r[0]<r[2]&&r[1]<r[3]));
}
function isHeader(flat,i,tokens){
 if(flat[i]?.word!=='art'||!/^\d+(?:º|°)?$/.test(flat[i+1]?.word||''))return false;
 const origin=flat[i].index,raw=String(tokens[origin]?.text||'');
 const prev=flat[i-1]?.word||'';
 if(/^(?:do|da|de|no|na|ao|aos|pelo|conforme|artigo|previsto)$/u.test(prev))return false;
 // An explicit Art./ART. is a header only at a fresh textual clause or line.
 if(!/^art\.?$/iu.test(raw)&&!/^art\.\d+/iu.test(raw))return false;
 const before=String(tokens[origin-1]?.text||'');
 const newLine=origin===0||
  (tokens[origin]?.line!=null&&tokens[origin-1]?.line!=null&&tokens[origin].line!==tokens[origin-1].line);
 return newLine||/[;:.!?]$/u.test(before)||origin<3;
}
function headers(flat,tokens){
 const found=[];
 for(let i=0;i<flat.length-1;i++)if(isHeader(flat,i,tokens))
  found.push({begin:i,num:parseInt(flat[i+1].word,10),start:flat[i].index});
 return found;
}
function scopeFor(head,spec,heads,flat){
 const closest=heads.filter(h=>h.begin<=head.begin&&head.begin-h.begin<=14).at(-1);
 if(closest&&closest.num!==spec.number)return null;
 let until=flat.length;
 for(const h of heads){if(h.begin>head.begin){until=h.begin;break}}
 return {from:head.begin,until,article:spec.number,header:closest||null};
}
function hasMarker(flat,roman,from,to,tokens){
 // Accept I -, II – and III) as ordinal markers, but never a word matching
 // a roman numeral in body prose without punctuation/line transition.
 const wanted=roman.toLowerCase();
 for(let i=to-1;i>=Math.max(from,to-7);i--){
  if(flat[i].word!==wanted)continue;
  const a=flat[i].index,b=flat[i+1]?.index??a;
  const raw=tokens.slice(a,Math.min(b+1,tokens.length)).map(t=>t.text).join(' ');
  const delim=/[-–—).]/u.test(raw.replace(/^[^\p{L}\p{N}]+/u,''));
  const differentLine=tokens[a]?.line!=null&&tokens[flat[to].index]?.line!=null&&
   tokens[a].line!==tokens[flat[to].index].line;
  if(delim||differentLine)return i;
 }
 return -1;
}
function segment(tokens,kind,found,reason,article,role){
 if(!found||!geometry(tokens,found.start,found.stop)||!palette[kind])return null;
 const text=tokens.slice(found.start,found.stop+1).map(t=>String(t.text||'')).join(' ').replace(/\s+/g,' ').trim();
 if(!text)return null;
 const reference='CF/88 art. '+article+'º — '+reason+'; fonte: Câmara dos Deputados; classificação sugerida, conferir edição do PDF.';
 return {kind,color:palette[kind].color,color_label:palette[kind].label,text,
  confidence:'alta',requires_review:false,classification_status:'sugestao',
  classification_kind:kind,calibration_profile:'cf88',
  calibration_evidence:reference.slice(0,220),evidence:reference.slice(0,220),
  legal_article:'CF88:art'+article,legal_role:role,legal_source_key:'CF88',
  legal_source_url:SOURCE,rects:tokens.slice(found.start,found.stop+1).flatMap(t=>t.rects).slice(0,220),
  anchor:{quote:text,prefix:'',suffix:''},start:found.start,end:found.stop};
}
function rangesOverlap(a,b){return !(a.end<b.start||b.end<a.start)}
function legalReferences(flat,tokens,heads){
 const links=[];
 for(let i=0;i<flat.length-1;i++){
  if(flat[i].word!=='art'||!/^\d+(?:º|°)?$/u.test(flat[i+1].word))continue;
  if(heads.some(h=>h.begin===i))continue;
  const num=parseInt(flat[i+1].word,10);
  const prefix=flat.slice(Math.max(0,i-5),i).map(t=>t.word).join(' ');
  const r=/(?:nos termos|na forma|conforme|previsto|disposto|observado|referido|definido)/u.test(prefix);
  if(!r)continue;
  links.push({type:'remissao_expressa',target:'CF88:art'+num,
   text:tokens.slice(flat[i].index,flat[i+1].index+1).map(x=>x.text).join(' '),
   token_start:flat[i].index,token_end:flat[i+1].index});
 }
 return links;
}
function inspect(tokens,profileId='geral'){
 const empty={recognized:false,segments:[],relations:[],articles:[],references:[],source_url:null};
 if(profileId!=='cf88'||!Array.isArray(tokens)||tokens.length<3)return empty;
 const flat=flatten(tokens),heads=headers(flat,tokens);
 const segments=[],relations=[],articles=[],occupied=new Set();
 function add(kind,found,reason,number,role,parent){
  const out=segment(tokens,kind,found,reason,number,role);
  if(!out)return;
  for(let i=out.start;i<=out.end;i++)if(occupied.has(i))return;
  for(let i=out.start;i<=out.end;i++)occupied.add(i);
  segments.push(out);
  relations.push({type:role,source:'CF88:art'+number,
   target:'span:'+out.start+':'+out.end,parent:parent||'CF88:art'+number,
   text:out.text});
 }
 for(const spec of SPECS){
  const head=phrase(flat,spec.head);
  if(!head)continue;
  const scope=scopeFor(head,spec,heads,flat);
  if(!scope)continue;
  articles.push({id:'CF88:art'+spec.number,number:spec.number,
   header_detected:!!scope.header,source_url:SOURCE});
  for(const [kind,text,reason] of spec.parts){
   const hit=phrase(flat,text,head.begin,Math.min(scope.until,head.end+1));
   add(kind,hit,reason,spec.number,'qualifica_caput');
  }
  let cursor=head.end+1;
  for(const [roman,text] of spec.items){
   const hit=phrase(flat,text,cursor,scope.until);
   if(!hit)break;
   const ordinal=hasMarker(flat,roman,cursor,hit.begin,tokens);
   if(ordinal<0)break;
   add('regra',hit,'Núcleo literal do inciso '+roman.toUpperCase(),spec.number,'inciso_de',roman);
   cursor=hit.end+1;
  }
  if(spec.soleParagraph){
   const para=phrase(flat,'paragrafo unico',head.end+1,scope.until);
   const content=para&&phrase(flat,spec.soleParagraph,para.end+1,scope.until);
   if(content)add('regra',content,'Diretriz do parágrafo único',spec.number,'paragrafo_de','único');
  }
 }
 segments.sort((a,b)=>a.start-b.start);
 const refs=legalReferences(flat,tokens,heads);
 return {recognized:segments.length>0,segments,relations,articles,references:refs,
  source_url:SOURCE,model:'literal-structure-graph-v119'};
}
function analyzeWords(tokens,profileId='geral'){
 const general=previous.analyzeWords(tokens,profileId);
 const scan=inspect(tokens,profileId);
 if(!scan.recognized)return general;
 const owned=new Set(scan.segments.flatMap(s=>Array.from({length:s.end-s.start+1},(_,i)=>s.start+i)));
 function overlapping(s){
  if(Number.isInteger(s.start)&&Number.isInteger(s.end))
   return Array.from({length:s.end-s.start+1},(_,i)=>s.start+i).some(i=>owned.has(i));
  const loc=new Set((s.rects||[]).map(r=>r.map(n=>Number(n).toFixed(6)).join('|')));
  return scan.segments.some(x=>x.rects.some(r=>loc.has(r.map(n=>Number(n).toFixed(6)).join('|'))));
 }
 const remain=(general.segments||[]).filter(x=>!overlapping(x));
 const warnings=(general.review||[]).filter(x=>!overlapping(x));
 const all=[...scan.segments,...remain].sort((a,b)=>(a.start??0)-(b.start??0));
 all.forEach((s,i)=>{s.segment_index=i+1;s.segment_total=all.length});
 const scannedCoverage=scan.segments.reduce((n,s)=>n+s.end-s.start+1,0);
 return {...general,profileId:'cf88',segments:all,suggestions:all,
  review:warnings,legal_structure:{
   articles:scan.articles,relations:scan.relations,references:scan.references,
   source_url:SOURCE,automatic_span_count:scan.segments.length},
  coverage:tokens.length?scannedCoverage/tokens.length:0,
  structural_evidence:'Texto constitucional e articulação dos arts. 2º–4º'};
}
window.BancoMestreCalibradoresV110=Object.freeze({...previous,analyzeWords});
window.BancoMestreRelacoesNormativasV119=Object.freeze({
 inspect,sourceUrl:SOURCE,version:'V119-CF-ART2-4',supportedArticles:[2,3,4],
 legalReferences
});
})();

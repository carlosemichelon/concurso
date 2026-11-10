/* V072 — melhoria contextual conservadora do grifador.
 * Adiciona reconhecimento de dispositivos normativos e escopo de frases,
 * preservando as 6 cores, o classificador anterior e os grifos armazenados.
 */
(function(){
'use strict';
const previous=window.BancoMestreClassificadorV071;
if(!previous||window.BancoMestreClassificadorV072)return;
const COLORS=previous.COLORS;
const normalize=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const word=s=>{
 const str=normalize(s).trim();
 if(/^§/.test(str))return '§';
 return str.replace(/^[^\p{L}\d]+|[^\p{L}\dºª%/]+$/gu,'');
};
const compact=s=>String(s||'').replace(/\s+/g,' ').trim();
const numeric=/^\d+(?:(?:[.,:/-])\d+)*(?:%|º|ª)?$/;
const roman=/^[ivxlcdm]+$/;
const P=[
 ['proibicao',['nao','sera','permitido']],['proibicao',['nao','sera','permitida']],
 ['proibicao',['nao','podera']],['proibicao',['nao','poderao']],
 ['proibicao',['nao','pode']],['proibicao',['nao','podem']],
 ['proibicao',['nao','devera']],['proibicao',['nao','deverao']],
 ['proibicao',['e','vedado']],['proibicao',['e','vedada']],
 ['proibicao',['e','proibido']],['proibicao',['e','proibida']],
 ['proibicao',['fica','proibido']],['proibicao',['fica','proibida']],
 ['excecao',['nao','se','aplica']],['excecao',['salvo','disposicao','em','contrario']],
 ['excecao',['com','excecao','de']],['excecao',['com','excecao']],
 ['excecao',['salvo','se']],['excecao',['exceto','quando']],
 ['excecao',['desde','que']],['excecao',['contanto','que']],
 ['excecao',['a','menos','que']],['excecao',['somente','se']],
 ['obrigacao',['tem','a','obrigacao']],['obrigacao',['tem','o','dever']],
 ['obrigacao',['e','obrigatorio']],['obrigacao',['e','obrigatoria']],
 ['prazo_numero',['no','prazo','de']],['prazo_numero',['em','ate']],
 ['prazo_numero',['dentro','de']],['prazo_numero',['no','prazo']]
];
const W=[
 ['proibicao',/^(?:vedad[oa]s?|proibid[oa]s?|vedar|proibir)$/],
 ['obrigacao',/^(?:dever(?:a|ao)|deve(?:m)?|dever|compete|competem|competira|competirao|obrigator(?:io|ia|ios|ias|iamente)|incumb(?:e|em)|exig(?:e|em))$/],
 ['excecao',/^(?:salvo|exceto|ressalvad[oa]s?|ressalva(?:s)?|excepcional(?:mente)?)$/],
 ['banca',/^(?:exclusivamente|sempre|jamais|somente|apenas|unicamente|necessariamente|nunca|invariavelmente)$/],
 ['prazo_numero',/^(?:prazo|prazos|dias?|horas?|mes(?:es)?|anos?|semanas?|ate|vencimento|vigencia)$/]
];
function referenceAt(words,i){
 const head=words[i],next=words[i+1],more=words[i+2];
 if(/^(?:art\.?\d+(?:º|ª)?|§\d+(?:º|ª)?)$/.test(head))return 1;
 if(/^(?:paragrafo|§)$/.test(head)&&next==='unico')return 2;
 if(!next)return 0;
 if(/^(?:art|artigo|artigos|§|paragrafo|paragrafos|inciso|incisos|alinea|alineas|lei|leis|decreto|decretos|resolucao|resolucoes|nbr|nr)$/.test(head)){
  if(numeric.test(next))return 2;
  if(/^(?:inciso|incisos)$/.test(head)&&roman.test(next))return 2;
  if(/^(?:alinea|alineas)$/.test(head)&&/^[a-z]$/.test(next))return 2;
  if(/^(?:lei|leis|decreto|decretos|resolucao|resolucoes|nbr|nr)$/.test(head)&&
   /^(?:nº|no|n|numero)$/.test(next)&&numeric.test(more||''))return 3;
 }
 return 0;
}
function end(s){
 const v=String(s||'').trim();
 if(/^(?:art\.|arts\.|n\.|inc\.)$/i.test(v))return false;
 return /[;.!?:]$/.test(v);
}
function classifyWords(tokens,options={}){
 if(!Array.isArray(tokens)||!tokens.length||tokens.length>180)return [];
 const words=tokens.map(t=>word(t.text)),hit=Array(tokens.length).fill(null);
 function mark(at,count,kind,detail,confidence='alta'){
  for(let j=0;j<count;j++)hit[at+j]={kind,confidence,detail};
 }
 for(let i=0;i<words.length;i++){
  const len=referenceAt(words,i);if(len){mark(i,len,'prazo_numero','referencia_normativa');i+=len-1}
 }
 for(let i=0;i<words.length;i++){
  if(hit[i])continue;
  const phrase=P.find(([,seq])=>seq.every((w,j)=>words[i+j]===w&&!hit[i+j]));
  if(phrase){mark(i,phrase[1].length,phrase[0],'expressao');i+=phrase[1].length-1}
 }
 for(let i=0;i<words.length;i++){
  if(hit[i])continue;
  if(numeric.test(words[i])){mark(i,1,'prazo_numero',/%$/.test(words[i])?'percentual':'numero');continue}
  for(const [kind,re] of W)if(re.test(words[i])){mark(i,1,kind,'palavra','media');break}
 }
 let active='regra',quality='baixa',span=0;
 const tagged=tokens.map((t,i)=>{
  if(i&&end(tokens[i-1].text)){active='regra';quality='baixa';span=0}
  const h=hit[i];let kind=active,confidence=quality,detail=null;
  if(h?.kind==='banca'){kind='banca';confidence=h.confidence;detail=h.detail}
  else if(h){active=kind=h.kind;quality=confidence=h.confidence;detail=h.detail;span=0}
  else if(active!=='regra'){
   const bound=active==='prazo_numero'?3:active==='excecao'?8:14;
   if(++span>bound){active='regra';quality='baixa';span=0}
   kind=active;confidence=quality;
  }
  if(end(t.text)){active='regra';quality='baixa';span=0}
  return {token:t,kind,confidence,detail};
 });
 const groups=[];
 for(const item of tagged){
  const last=groups.at(-1);
  if(last&&last.kind===item.kind&&last.tokens.length<24&&
    !end(last.tokens.at(-1).text)){
    last.tokens.push(item.token);
    if(item.detail==='referencia_normativa')last.detail='referencia_normativa';
  }else groups.push({kind:item.kind,confidence:item.confidence,detail:item.detail,tokens:[item.token]});
 }
 // Artigos iniciais sem significado isolado podem integrar a próxima categoria.
 for(let i=groups.length-2;i>=0;i--){
  const a=groups[i],b=groups[i+1];
  if(a.kind==='regra'&&b.kind!=='regra'&&a.tokens.length<=2&&
   a.tokens.every(t=>/^(?:a|o|as|os|ao|aos|um|uma|uns|umas)$/.test(word(t.text)))){
   b.tokens.unshift(...a.tokens);groups.splice(i,1);
  }
 }
 if(groups.length>40)return [];
 return groups.map((g,i)=>{
  const text=compact(g.tokens.map(t=>t.text).join(' ')),color=COLORS[g.kind]||COLORS.regra;
  return {
   kind:g.kind,confidence:g.confidence,detail:g.detail||null,text,
   rects:g.tokens.flatMap(t=>Array.isArray(t.rects)?t.rects:[]).slice(0,250),
   color:color.color,color_label:color.label,
   anchor:{quote:text,prefix:String(g.tokens[0]?.prefix||'').slice(-100),
    suffix:String(g.tokens.at(-1)?.suffix||'').slice(0,100)},
   classification_status:'sugestao',classification_kind:g.kind,
   segment_index:i+1,segment_total:groups.length
  };
 });
}
function suggestNote(segment){
 const snippet=compact(segment?.text||'').slice(0,280),norm=normalize(snippet),kind=segment?.kind;
 const ref=segment?.detail==='referencia_normativa'||/^(?:art\.?\s*\d+|§\s*\d+|inciso\s+[ivxlcdm]+|alinea\s+[a-z]|(?:lei|decreto|nbr|nr)\s*(?:n[ºo]\s*)?\d+)/i.test(norm);
 const value=norm.match(/\b\d+(?:[.,]\d+)?\s*(?:dias?|horas?|mes(?:es)?|anos?|semanas?|%|metros?|cm|mm)\b/);
 const messages={
  proibicao:'Proibição: identificar conduta vedada, destinatário e possíveis ressalvas',
  obrigacao:'Obrigação: identificar quem deve cumprir, ação exigida e consequência',
  prazo_numero:ref?'Referência normativa: conferir o dispositivo integral e a edição vigente':
   value?'Prazo ou valor identificado: '+value[0]+'. Conferir unidade, termo inicial e exceções':
   'Número ou prazo: verificar seu papel e unidade no contexto',
  excecao:'Ressalva/condição: identificar a regra geral modificada e quando se aplica',
  banca:'Palavra-chave da banca: verificar se o termo absoluto restringe ou amplia o enunciado',
  regra:'Regra principal: identificar o alcance do enunciado e sua aplicação'
 };
 return {text:(messages[kind]||'Trecho a revisar')+
   (snippet?'. Trecho-fonte: “'+snippet+'”':''),status:'sugestao_nao_confirmada'};
}
window.BancoMestreClassificadorV072={
 COLORS,classifyWords,suggestNote,suggestSubject:previous.suggestSubject,plain:previous.plain
};
window.BancoMestreClassificadorV071=window.BancoMestreClassificadorV072;
})();

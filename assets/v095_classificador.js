/* V095: revisão de quatro cores com motor V070 mantido. */
/* Banco Mestre V070 — regras locais, conservadoras e auditáveis.
 * Propostas de cores/assuntos/notas nunca constituem interpretação normativa validada.
 * Não lê outros PDFs, não usa IA remota e não altera dados existentes.
 */
(function(){
 'use strict';
 const COLORS=Object.freeze({
  importante:{color:'#ffe04d',label:'Importante'},
  proibicao:{color:'#ff8f96',label:'Proibição / exceção restritiva'},
  obrigacao:{color:'#86dcaa',label:'Obrigação / prazo / número'},
  excecao:{color:'#89c7ff',label:'Exceção / palavra-chave'}
 });
 const plain=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[\u2010-\u2015]/g,'-');
 const compact=s=>String(s||'').replace(/\s+/g,' ').trim();
 // Exceção restritiva (vermelho) versus ressalva geral (azul).
 const signals=[
  {kind:'proibicao',re:/^(?:proibid[oa]s?|vedad[oa]s?|vedacao|impedid[oa]s?|impedimento|nao|nunca|inadmissivel|descumprimento|dispensad[oa]s?|excetuad[oa]s?)\b/},
  {kind:'obrigacao',re:/^(?:\d+(?:[.,]\d+)?|dever(?:a|ao)|deve(?:m)?|obrigator(?:io|ia|ios|ias)|obrigacao|exig(?:e|em|encia|ir)|prazo|prazos|dias?|horas?|semanas?|mes(?:es)?|anos?|ate|limite|percentual|porcentagem|%|requisit(?:o|os)|condic(?:ao|oes)|necessari[oa]s?)\b/},
  {kind:'excecao',re:/^(?:exceto|salvo|ressalvad[oa]s?|excepcional(?:mente)?|exce(?:cao|coes)|ressalva(?:s)?|exclusiv(?:o|a|amente)|apenas|somente|contudo|entretanto|observacao|palavra[s-]?chave)\b/},
  {kind:'importante',re:/^(?:importante|principal|fundamental|essencial|relevante|destaque|conceito|regra|define|considera(?:-se)?)\b/}
 ];
 const phraseSignals=[
  {kind:'proibicao',seq:['nao','se','aplica']},
  {kind:'proibicao',seq:['e','vedado']},
  {kind:'proibicao',seq:['fica','proibido']},
  {kind:'proibicao',seq:['nao','sera','permitido']},
  {kind:'excecao',seq:['salvo','disposicao','em','contrario']},
  {kind:'excecao',seq:['desde','que']},
  {kind:'excecao',seq:['somente','se']},
  {kind:'obrigacao',seq:['no','prazo']},
  {kind:'obrigacao',seq:['em','ate']},
  {kind:'obrigacao',seq:['e','obrigatorio']},
  {kind:'obrigacao',seq:['deve','ser']},
  {kind:'importante',seq:['regra','geral']}
 ];
 function classifyWords(tokens,options={}){
  if(!Array.isArray(tokens)||!tokens.length)return [];
  if(tokens.length>180)return [];
  const words=tokens.map(t=>plain(t.text).replace(/^[^\p{L}\d]+|[^\p{L}\d]+$/gu,''));
  const detected=words.map((w,i)=>{
   for(const phrase of phraseSignals){
    if(phrase.seq.every((p,j)=>words[i+j]===p))return {kind:phrase.kind,confidence:'alta'};
   }
   for(const signal of signals)if(signal.re.test(w))return {kind:signal.kind,confidence:'media'};
   return null;
  });
  // Propagar um início de exceção, condição ou competência até a próxima mudança
  // de categoria, vírgula/semicolón, ou 18 palavras — e não por páginas inteiras.
  let kind=null,confidence='baixa',run=0;
  const tagged=tokens.map((t,i)=>{
   if(i&&/[;.!?]$/.test(tokens[i-1].text||'')){kind=null;confidence='baixa';run=0}
   if(detected[i]){kind=detected[i].kind;confidence=detected[i].confidence;run=0}
   if(kind&&++run>18){kind=null;confidence='baixa'}
   const current=kind;
   if(/[,;]$/.test(t.text||'')){kind=null;run=0}
   return {token:t,kind:current,confidence:current?confidence:'indefinida'};
  });
  const grouped=[];
  for(const item of tagged){
   const last=grouped[grouped.length-1];
   if(last&&last.kind===item.kind&&last.tokens.length<24&&
      !/[;.!?]$/.test(last.tokens[last.tokens.length-1].text||'')){
    last.tokens.push(item.token);
    if(last.confidence==='indefinida')last.confidence=item.confidence;
   }else grouped.push({kind:item.kind,confidence:item.confidence,tokens:[item.token]});
  }
  // Artigos curtos no início de uma classificação pertencem ao trecho seguinte:
  // "A autoridade" é uma única sequência verde, e não "A" solto em amarelo.
  for(let i=grouped.length-2;i>=0;i--){
   const left=grouped[i],right=grouped[i+1];
   if(left.kind===null&&right.kind&&left.tokens.length<=2&&
      left.tokens.every(t=>/^(?:a|o|as|os|ao|aos|um|uma|uns|umas)$/i.test(plain(t.text)))){
    right.tokens.unshift(...left.tokens);grouped.splice(i,1);
   }
  }
  if(grouped.length>40)return []; // nunca produzir centenas de registros em uma seleção
  return grouped.map((g,i)=>({
   kind:g.kind,confidence:g.confidence,
   text:compact(g.tokens.map(t=>t.text).join(' ')),
   rects:g.tokens.flatMap(t=>Array.isArray(t.rects)?t.rects:[]).slice(0,250),
   color:g.kind?COLORS[g.kind].color:(options.fallbackColor||'#ffe04d'),
   color_label:g.kind?COLORS[g.kind].label:'Sem classificação confirmada',
   anchor:{quote:compact(g.tokens.map(t=>t.text).join(' ')),
    prefix:String(g.tokens[0]?.prefix||'').slice(-100),
    suffix:String(g.tokens[g.tokens.length-1]?.suffix||'').slice(0,100)},
   classification_status:'sugestao',classification_kind:g.kind||'nao_classificado',
   segment_index:i+1,segment_total:grouped.length
  }));
 }
 const subjects=[
  {re:/\b(?:conama|licenciamento ambiental|eia\/?rima|estudo de impacto ambiental)\b/,discipline:'Legislação geral',topic:'Licenciamento ambiental',subtopic:'Resoluções CONAMA'},
  {re:/\b(?:nr[\s-]?18|canteiro de obra|seguranca na construcao)\b/,discipline:'Engenharia Civil',topic:'Segurança do trabalho',subtopic:'NR-18'},
  {re:/\b(?:nr[\s-]?5|cipa)\b/,discipline:'Engenharia Civil',topic:'Segurança do trabalho',subtopic:'NR-5 / CIPA'},
  {re:/\b(?:nr[\s-]?7|pcms o|pcmso)\b/,discipline:'Engenharia Civil',topic:'Segurança do trabalho',subtopic:'NR-7 / PCMSO'},
  {re:/\b(?:nbr[\s-]?6118|concreto armado|estrutura de concreto)\b/,discipline:'Engenharia Civil',topic:'Estruturas de concreto',subtopic:'NBR 6118'},
  {re:/\b(?:nbr[\s-]?6122|estacas?|sapatas?|fundac(?:ao|oes))\b/,discipline:'Engenharia Civil',topic:'Geotecnia e fundações',subtopic:'Fundações'},
  {re:/\b(?:nbr[\s-]?9649|esgoto sanitario|po[cç]o de visita)\b/,discipline:'Engenharia Civil',topic:'Sistemas de esgoto',subtopic:'Redes coletoras'},
  {re:/\b(?:nbr[\s-]?8800|estrutura de aco|estruturas metalicas)\b/,discipline:'Engenharia Civil',topic:'Estruturas de aço',subtopic:'NBR 8800'},
  {re:/\b(?:estatuto da cidade|lei 10257|plano diretor|zoneamento)\b/,discipline:'Legislação geral',topic:'Política urbana',subtopic:'Estatuto da Cidade'},
  {re:/\b(?:lei 14133|licitacao|contratacao publica)\b/,discipline:'Legislação geral',topic:'Licitações e contratos',subtopic:'Lei 14.133/2021'}
 ];
 function suggestSubject(text,documentTitle='',prior={}){
  const source=plain(documentTitle),fragment=plain(text);
  // Títulos dos PDFs são evidência melhor que palavras isoladas comuns.
  const matched=subjects.find(x=>x.re.test(source))||subjects.find(x=>x.re.test(fragment));
  return {
   discipline:String(prior.discipline||matched?.discipline||''),
   topic:String(prior.topic||matched?.topic||''),
   subtopic:String(prior.subtopic||matched?.subtopic||''),
   basis:prior.topic?'classificacao_existente':matched?'termos_detectados':'indefinida',
   status:'sugestao'
  };
 }
 function suggestNote(segment){
  const text=compact(segment?.text||'').slice(0,280);
  const category=segment?.kind||'',normalized=plain(text);
  const limit=normalized.match(/\b\d+(?:[.,]\d+)?\s*(?:dias?|horas?|mes(?:es)?|anos?|semanas?|%|metros?|cm|mm)\b/);
  const actor=normalized.match(/\b(?:orgao(?:\s+ambiental)?|autoridade(?:\s+competente)?|prefeitura|municipio|conselho|engenheiro(?:\s+responsavel)?)\b/);
  let intro;
  if(category==='obrigacao'){
   intro=limit?'Prazo/limite indicado: '+limit[0]+'. Verificar marco inicial, hipótese e exceções':
    'Identificar o requisito e a situação em que esta condição se aplica';
  }else if(category==='proibicao'){
   intro='Proibição ou exceção restritiva: conferir hipótese, alcance e fundamento';
  }else if(category==='excecao'){
   intro='Exceção, ressalva ou palavra-chave: verificar sentido e contexto';
  }else if(category==='importante'){
   intro='Importante: identificar a ideia central e suas consequências';
  }else intro='Trecho sem classificação segura; revisar a fonte antes de atribuir cor e assunto';
  return {text:intro+(text?'. Trecho-fonte: “'+text+'”':''),status:'sugestao_nao_confirmada'};
 }
 window.BancoMestreClassificadorV070={COLORS,classifyWords,suggestSubject,suggestNote,plain};
})();

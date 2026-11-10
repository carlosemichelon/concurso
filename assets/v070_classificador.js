/* Banco Mestre V070 — regras locais, conservadoras e auditáveis.
 * Propostas de cores/assuntos/notas nunca constituem interpretação normativa validada.
 * Não lê outros PDFs, não usa IA remota e não altera dados existentes.
 */
(function(){
 'use strict';
 const COLORS=Object.freeze({
  regra:{color:'#ffe04d',label:'Regra principal'},
  agente:{color:'#92e8c0',label:'Agente / autoridade / competência'},
  excecao:{color:'#ffb3c5',label:'Exceção / ressalva'},
  condicao:{color:'#a6d7ff',label:'Condição / limitação / prazo'}
 });
 const plain=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[\u2010-\u2015]/g,'-');
 const compact=s=>String(s||'').replace(/\s+/g,' ').trim();
 const signals=[
  {kind:'excecao',re:/^(?:exceto|salvo|ressalvad[oa]s?|excepcional(?:mente)?|dispensad[oa]s?|ressalva(?:s)?|excetuad[oa]s?)\b/},
  {kind:'condicao',re:/^(?:prazo|prazos|dias?|horas?|mes(?:es)?|anos?|ate|mediante|quando|se|somente|apenas|caso|condic(?:ao|oes)|requisit(?:o|os)|limit(?:e|es)|maxim[oa]s?|minim[oa]s?|superior(?:es)?|inferior(?:es)?)\b/},
  {kind:'agente',re:/^(?:orgaos?|autoridad(?:e|es)|competencia|compet(?:e|em|ira|irao)|conselho|prefeitura|municipio|municipalidade|administracao|engenheir[oa]s?|responsavel|tecnic[oa]s?|licenciador(?:es)?|fiscalizacao|fiscal|caber(?:a|ao)|poderao?|autoriz(?:ar|a|acao|acoes)|incumb(?:e|ira))\b/},
  {kind:'regra',re:/^(?:dever(?:a|ao)|deve(?:m)?|obrigator(?:io|ia|ios|ias)|proibid[oa]s?|vedad[oa]s?|sera(?:o)?|constitu(?:i|em)|estabelec(?:e|em)|exig(?:e|em)|observ(?:a|ar)|aplic(?:a|am)|permitid[oa]s?)\b/}
 ];
 const phraseSignals=[
  {kind:'excecao',seq:['nao','se','aplica']},{kind:'excecao',seq:['salvo','disposicao','em','contrario']},
  {kind:'condicao',seq:['desde','que']},{kind:'condicao',seq:['no','prazo']},
  {kind:'condicao',seq:['somente','se']},{kind:'condicao',seq:['em','ate']},
  {kind:'agente',seq:['orgao','competente']},{kind:'agente',seq:['autoridade','competente']},
  {kind:'regra',seq:['e','obrigatorio']},{kind:'regra',seq:['e','vedado']}
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
  if(grouped.length>40)return []; // nunca produzir centenas de registros em uma seleção
  return grouped.map((g,i)=>({
   kind:g.kind,confidence:g.confidence,
   text:compact(g.tokens.map(t=>t.text).join(' ')),
   rects:g.tokens.flatMap(t=>Array.isArray(t.rects)?t.rects:[]).slice(0,250),
   color:g.kind?COLORS[g.kind].color:(options.fallbackColor||'#ffe04d'),
   color_label:g.kind?COLORS[g.kind].label:'Sem classificação confirmada',
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
  const category=segment?.kind||'';
  const intro={
   regra:'Regra principal a conferir no contexto da fonte',
   agente:'Verificar quem possui competência para agir e em quais limites',
   excecao:'Ressalva à regra geral; identificar a hipótese e seus efeitos',
   condicao:'Condição, prazo ou requisito; identificar quando se aplica'
  }[category]||'Trecho a classificar após leitura do contexto';
  return {text:intro+(text?': “'+text+'”':''),status:'sugestao_nao_confirmada'};
 }
 window.BancoMestreClassificadorV070={COLORS,classifyWords,suggestSubject,suggestNote,plain};
})();

/* Banco Mestre V071 — seis cores metodológicas, conservadoras e auditáveis.
 * Propostas de cores/assuntos/notas nunca constituem interpretação normativa validada.
 * Não lê outros PDFs, não usa IA remota e não altera dados existentes.
 */
(function(){
 'use strict';
 const COLORS=Object.freeze({
  proibicao:{color:'#FF8F96',label:'Proibições e vedações'},
  obrigacao:{color:'#86DCAA',label:'Obrigações e deveres'},
  prazo_numero:{color:'#FFEA70',label:'Prazos e números'},
  excecao:{color:'#89C7FF',label:'Exceções e ressalvas'},
  banca:{color:'#CCA7FF',label:'Palavras-chave da banca'},
  regra:{color:'#FFB86B',label:'Regra principal'}
 });
 const plain=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[\u2010-\u2015]/g,'-');
 const compact=s=>String(s||'').replace(/\s+/g,' ').trim();
 const word=s=>plain(s).replace(/^[^\p{L}\d]+|[^\p{L}\d]+$/gu,'');
 const PHRASES=[
  {kind:'proibicao',words:['e','vedado']},
  {kind:'proibicao',words:['e','vedada']},
  {kind:'proibicao',words:['nao','podera']},
  {kind:'proibicao',words:['nao','poderao']},
  {kind:'proibicao',words:['nao','pode']},
  {kind:'proibicao',words:['nao','podem']},
  {kind:'proibicao',words:['fica','proibido']},
  {kind:'proibicao',words:['fica','proibida']},
  {kind:'proibicao',words:['e','proibido']},
  {kind:'proibicao',words:['e','proibida']},
  {kind:'obrigacao',words:['e','obrigatorio']},
  {kind:'obrigacao',words:['e','obrigatoria']},
  {kind:'obrigacao',words:['tem','o','dever']},
  {kind:'obrigacao',words:['tem','a','obrigacao']},
  {kind:'prazo_numero',words:['em','ate']},
  {kind:'prazo_numero',words:['no','prazo']},
  {kind:'prazo_numero',words:['dentro','de']},
  {kind:'excecao',words:['com','excecao']},
  {kind:'excecao',words:['ressalvado','o']},
  {kind:'banca',words:['em','hipotese','alguma']}
 ];
 const MATCHERS=[
  {kind:'proibicao',re:/^(?:vedad[oa]s?|proibid[oa]s?|proibir|vedar|impedid[oa]s?)$/},
  {kind:'obrigacao',re:/^(?:dever(?:a|ao)|deve(?:m)?|dever|compete|competem|competira|competirao|obrigator(?:io|ia|ios|ias)|incumb(?:e|em)|exig(?:e|em)|responsabiliza(?:-se)?)$/},
  {kind:'excecao',re:/^(?:salvo|exceto|ressalvad[oa]s?|ressalva(?:s)?|excepcional(?:mente)?|excetuad[oa]s?)$/},
  {kind:'banca',re:/^(?:exclusivamente|sempre|jamais|somente|apenas|unicamente|necessariamente|obrigatoriamente|nunca)$/},
  {kind:'prazo_numero',re:/^(?:prazo|prazos|dias?|horas?|mes(?:es)?|anos?|semanas?|ate|vencimento|periodo|duracao|vigencia)$/}
 ];
 const number=/^\d+(?:(?:[.,:/-])\d+)*(?:%|º|ª)?$/;
 function classifyWords(tokens,options={}){
  if(!Array.isArray(tokens)||!tokens.length||tokens.length>180)return [];
  const words=tokens.map(t=>word(t.text)),direct=Array(tokens.length).fill(null);
  // Priorizar expressões completas; "não poderá" é vermelho desde "não".
  for(let i=0;i<tokens.length;i++){
   for(const phrase of PHRASES){
    if(!phrase.words.every((w,j)=>words[i+j]===w))continue;
    for(let j=0;j<phrase.words.length;j++)direct[i+j]={kind:phrase.kind,confidence:'alta'};
    i+=phrase.words.length-1;break;
   }
  }
  for(let i=0;i<tokens.length;i++){
   if(direct[i])continue;
   const w=words[i];
   if(number.test(w)){direct[i]={kind:'prazo_numero',confidence:'alta'};continue}
   for(const signal of MATCHERS)if(signal.re.test(w)){
    direct[i]={kind:signal.kind,confidence:'media'};break;
   }
  }
  // Propagar a regra somente em pequenas sequências, até nova categoria ou pontuação.
  // Palavras-chave da banca são pontuais e não recolorem toda a oração.
  let active='regra',confidence='baixa',span=0,prevActive='regra';
  const tagged=tokens.map((token,i)=>{
   if(i&&/[;.!?]$/.test(tokens[i-1].text||'')){active='regra';confidence='baixa';span=0}
   const hit=direct[i];let kind=active,quality=confidence;
   if(hit?.kind==='banca'){
    kind='banca';quality=hit.confidence;span=0;
   }else if(hit){
    active=hit.kind;confidence=hit.confidence;span=0;
    kind=active;quality=confidence;
   }else if(active!=='regra'){
    span++;
    const max=active==='prazo_numero'?5:active==='excecao'?11:16;
    if(span>max){active='regra';confidence='baixa';span=0}
    kind=active;quality=confidence;
   }
   if(/[,;.!?]$/.test(token.text||'')){active='regra';confidence='baixa';span=0}
   return {token,kind,confidence:quality};
  });
  const grouped=[];
  for(const item of tagged){
   const last=grouped[grouped.length-1];
   if(last&&last.kind===item.kind&&last.tokens.length<24&&
      !/[;.!?]$/.test(last.tokens[last.tokens.length-1].text||'')){
    last.tokens.push(item.token);
   }else grouped.push({kind:item.kind,confidence:item.confidence,tokens:[item.token]});
  }
  // "A autoridade deverá" -> agrupar o artigo inicial curto com o segmento seguinte
  // apenas quando a primeira categoria é genérica e não há uma oração própria.
  for(let i=grouped.length-2;i>=0;i--){
   const left=grouped[i],right=grouped[i+1];
   if(left.kind==='regra'&&right.kind!=='regra'&&left.tokens.length<=2&&
      left.tokens.every(t=>/^(?:a|o|as|os|ao|aos|um|uma|uns|umas)$/i.test(word(t.text)))){
    right.tokens.unshift(...left.tokens);grouped.splice(i,1);
   }
  }
  if(grouped.length>40)return [];
  return grouped.map((g,i)=>{
   const text=compact(g.tokens.map(t=>t.text).join(' ')),meta=COLORS[g.kind]||COLORS.regra;
   return {
    kind:g.kind,confidence:g.confidence,text,
    rects:g.tokens.flatMap(t=>Array.isArray(t.rects)?t.rects:[]).slice(0,250),
    color:meta.color,color_label:meta.label,
    anchor:{quote:text,prefix:String(g.tokens[0]?.prefix||'').slice(-100),
     suffix:String(g.tokens[g.tokens.length-1]?.suffix||'').slice(0,100)},
    classification_status:'sugestao',classification_kind:g.kind,
    segment_index:i+1,segment_total:grouped.length
   };
  });
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
  const kind=segment?.kind||'',normalized=plain(text);
  const limit=normalized.match(/\b\d+(?:[.,]\d+)?\s*(?:dias?|horas?|mes(?:es)?|anos?|semanas?|%|metros?|cm|mm)\b/);
  const rule={
   proibicao:'Proibição/vedação: verificar conduta proibida, destinatário e eventuais exceções',
   obrigacao:'Obrigação/dever: verificar quem deve cumprir, ação exigida e consequência',
   prazo_numero:limit?'Prazo ou valor encontrado: '+limit[0]+'. Conferir termo inicial, unidade e exceções':
    'Número ou prazo: conferir unidade, condição e referência no documento',
   excecao:'Exceção/ressalva: identificar a regra geral afastada e a condição de aplicação',
   banca:'Palavra-chave de prova: verificar se o termo absoluto altera o alcance da afirmação',
   regra:'Regra principal: identificar o enunciado geral e sua aplicação'
  };
  return {text:(rule[kind]||'Revisar categoria e contexto antes de confirmar')+
   (text?'. Trecho-fonte: “'+text+'”':''),status:'sugestao_nao_confirmada'};
 }
 window.BancoMestreClassificadorV071={COLORS,classifyWords,suggestSubject,suggestNote,plain};
 window.BancoMestreClassificadorV070=window.BancoMestreClassificadorV071;
})();

/* Banco Mestre V099 — Lei seca, 4 perguntas; referência V008/V010 do Drive.
   Classificação local heurística: só núcleos reconhecidos, nunca lei validada. */
(function(){
'use strict';
const COLORS=Object.freeze({
 regra:{color:'#FDE68A',label:'Amarelo · O quê? Regra'},
 agente:{color:'#BBF7D0',label:'Verde · Quem? Sujeito e competência'},
 condicao:{color:'#BAE6FD',label:'Azul · Em que condição? Prazo e número'},
 excecao:{color:'#FECDD3',label:'Rosa · Salvo o quê? Exceção'}
});
const plain=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[\u2010-\u2015]/g,'-').toLowerCase();
const compact=s=>String(s||'').replace(/\s+/g,' ').trim();
const lexical=s=>plain(s).replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu,'');
const cue=w=>/^(?:exceto|salvo|ressalvad[oa]s?|quando|desde|durante|mediante|observado|estende-se|abrange|aplica-se|compete|devera|deverao|deve|devem|podera|poderao|vedad[oa]s?|proibid[oa]s?)$/u.test(w);
function classifyWords(tokens){
 if(!Array.isArray(tokens)||!tokens.length||tokens.length>180||
    tokens.some(t=>!t||typeof t.text!=='string'||!Array.isArray(t.rects)||!t.rects.length))return [];
 const raw=tokens.map(t=>String(t.text)),words=raw.map(lexical),
  owned=new Array(tokens.length).fill(false),found=[];
 const phrase=(i,...seq)=>seq.every((x,j)=>words[i+j]===x);
 function put(kind,start,end,confidence='media'){
  if(start<0||end<start||end>=tokens.length||found.length>=35)return false;
  for(let j=start;j<=end;j++)if(owned[j])return false;
  for(let j=start;j<=end;j++)owned[j]=true;
  found.push({kind,start,end,confidence});return true;
 }
 function until(start,max,opts={}){
  let end=Math.min(tokens.length-1,start+max-1);
  for(let j=start;j<=end;j++){
   if(j>start&&owned[j])return j-1;
   if(j>start+1&&opts.stops!==false&&(cue(words[j])||
       words[j]==='e'&&cue(words[j+1]||'')))return j-1;
   if(j>start&&opts.singleLine&&Number.isInteger(tokens[start].line)&&
      Number.isInteger(tokens[j].line)&&tokens[start].line!==tokens[j].line)return j-1;
   if(/[;.!?]$/u.test(raw[j]))return j;
   if(opts.comma!==false&&/,$/u.test(raw[j]))return j;
  }
  return end;
 }
 // EXCEÇÕES DE LISTA — só o núcleo de cada alínea.
 for(let i=0;i<tokens.length;i++){
  if(!/^\(?[a-e]\)[.:]?$/iu.test(raw[i]))continue;
  let start=i+1;
  while(start<i+4&&/^(?:a|o|as|os|de|da|do)$/u.test(words[start]||''))start++;
  if(start<tokens.length)put('excecao',start,until(start,13,{comma:false,stops:false}),'alta');
 }
 // ROSA — exceção/ressalva; "exceto" nunca vira azul.
 for(let i=0;i<tokens.length;i++){
  const w=words[i];
  if(/^(?:exceto|salvo|ressalvad[oa]s?|excepcionalmente|excetuad[oa]s?)$/u.test(w)){
   put('excecao',i,Math.min(tokens.length-1,i+(phrase(i,'salvo','disposicao','em','contrario')?3:0)),'alta');
  }
 }
 // AZUL — limite numérico/temporal e condição de incidência.
 for(let i=0;i<tokens.length;i++){
  const w=words[i],next=words[i+1]||'';
  if(w==='quando'||phrase(i,'desde','que')||phrase(i,'durante','o')||
     phrase(i,'no','prazo')||phrase(i,'em','ate')||phrase(i,'observado','em')||
     w==='mediante'||w==='somente'&&next==='se'||
     w==='ate'&&/^\d/u.test(next)||w==='se'&&/^(?:houver|existir|atendida)$/u.test(next)){
   put('condicao',i,until(i,w==='observado'?11:9),'alta');
  }else if(/^\d+(?:[.,]\d+)?$/u.test(w)&&/^(?:dias?|horas?|mes|meses|anos?|semanas?|%|porcento)$/u.test(next)){
   put('condicao',i,i+1,'alta');
  }
 }
 // VERDE — sujeito da competência e alcance pessoal/institucional.
 const role=/^(?:orgao|orgaos|autoridade|autoridades|prefeitura|municipio|municipios|uniao|estado|estados|servidor|servidores|conselho|conselhos|autarquias|fundacao|fundacoes|empresas|sociedades|juiz|tribunal|morador|administracao|profissionais)$/u;
 for(let i=0;i<tokens.length;i++){
  const w=words[i];
  if(['estende-se','abrange','alcanca','aplica-se'].includes(w))
   put('agente',i,until(i,12,{comma:false}),'alta');
  else if(role.test(w))put('agente',i,until(i,5),'media');
  else if(w==='competencia'&&/^(?:da|do|de)$/u.test(words[i+1]||''))
   put('agente',i,until(i,6),'media');
 }
 // AMARELO — núcleo da regra, inclusive obrigação ou PROIBIÇÃO.
 const verb=/^(?:deve|devem|devera|deverao|obrigatorio|obrigatoria|proibido|proibida|vedado|vedada|permitido|permitida|podera|poderao|pode|podem|sera|serao|constitui|estabelece|inviolavel)$/u;
 for(let i=0;i<tokens.length;i++){
  const w=words[i],next=words[i+1]||'';
  if(w==='e'&&verb.test(next)||w==='fica'&&/^(?:vedada|vedado|proibido|proibida)$/u.test(next)||
     w==='nao'&&/^(?:pode|podera|poderao|podem|deve|devera)$/u.test(next)||
     phrase(i,'asilo','inviolavel')){
   put('regra',i,until(i,11),'alta');
  }else if(verb.test(w))put('regra',i,until(i,10),'media');
 }
 if(!found.length)return [];
 found.sort((a,b)=>a.start-b.start);
 return found.map((s,i)=>{
  const parts=tokens.slice(s.start,s.end+1),text=compact(parts.map(t=>t.text).join(' '));
  const rects=parts.flatMap(t=>t.rects).slice(0,250);
  return {kind:s.kind,confidence:s.confidence,text,rects,
   color:COLORS[s.kind].color,color_label:COLORS[s.kind].label,
   anchor:{quote:text,prefix:String(parts[0]?.prefix||'').slice(-100),
    suffix:String(parts.at(-1)?.suffix||'').slice(0,100)},
   classification_status:'sugestao',classification_kind:s.kind,
   segment_index:i+1,segment_total:found.length};
 }).filter(s=>s.text&&s.rects.length);
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
  if(category==='condicao'){
   intro=limit?'Prazo/limite indicado: '+limit[0]+'. Verificar marco inicial, hipótese e exceções':
    'Identificar o requisito e a situação em que esta condição se aplica';
  }else if(category==='agente'){
   intro=actor?'Sujeito identificado: '+actor[0]+'. Conferir competência e alcance':'Identificar quem decide, autoriza ou é alcançado pela norma';
  }else if(category==='excecao'){
   intro='Exceção ou ressalva: identificar a regra afastada e sua extensão';
  }else if(category==='regra'){
   intro='Regra principal: identificar obrigação, proibição, permissão ou direito; preservar negações e alcance';
  }else intro='Trecho sem classificação segura; revisar a fonte antes de atribuir cor e assunto';
  return {text:intro+(text?'. Trecho-fonte: “'+text+'”':''),status:'sugestao_nao_confirmada'};
 }
 window.BancoMestreClassificadorV070={COLORS,classifyWords,suggestSubject,suggestNote,plain};
})();

/* V109 — lei seca, quatro cores, análise sintática local com evidência e revisão.
 * LC 95/1998 arts.10-11: caput, parágrafo, inciso e alínea têm papéis diferentes.
 * SUGESTÕES, nunca interpretação normativa ou gabarito confirmado.
 */
(function(){
'use strict';
const COLORS=Object.freeze({
 regra:{color:'#FDE68A',label:'Amarelo · O quê? Regra'},
 agente:{color:'#BBF7D0',label:'Verde · Quem? Sujeito e competência'},
 condicao:{color:'#BAE6FD',label:'Azul · Em que condição? Prazo e número'},
 excecao:{color:'#FECDD3',label:'Rosa · Salvo o quê? Exceção'}
});
const plain=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'')
 .replace(/[\u2010-\u2015]/g,'-').toLowerCase();
const compact=s=>String(s||'').replace(/\s+/g,' ').trim();
const lexical=s=>plain(s).replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu,'');
const EXC=/^(?:exceto|salvo|salva|ressalvado|ressalvada|ressalvados|ressalvadas|excetuado|excetuada|excetuados|excetuadas|excepcionalmente)$/u;
const MOD=/^(?:deve|devem|devera|deverao|pode|podem|podera|poderao|vedado|vedada|vedados|vedadas|proibido|proibida|proibidos|proibidas|permitido|permitida|permitidos|permitidas|obrigatorio|obrigatoria|obrigatorios|obrigatorias|constitui|constituem|estabelece|estabelecem|institui|instituem|garante|garantem|assegura|asseguram|autoriza|autorizam|exige|exigem|respondera|responderao|sujeita|sujeitam|caracteriza|configura|consiste|inviolavel|assegurado|assegurada)$/u;
const AGENT=/^(?:orgao|orgaos|autoridade|autoridades|servidor|servidores|administracao|prefeitura|municipio|municipios|uniao|estado|estados|conselho|conselhos|autarquia|autarquias|fundacao|fundacoes|empresa|empresas|juiz|tribunal|profissional|profissionais|engenheiro|engenheiros|interessado|interessada|interessados|interessadas|candidato|candidata|candidatos|empregado|empregador|empregadores|contratante|contratado|contratada|contratados|contratadas|comissao|comissoes|cipa|fiscal|fiscais|presidente|prefeito|prefeita|diretor|diretora|titular|titulares|beneficiario|beneficiarios|pessoa|pessoas|agente|agentes|entidade|entidades|proprietario|proprietarios|empreendedor|empreendedores)$/u;
const ADJ=/^(?:publica|publico|publicos|publicas|competente|competentes|municipal|municipais|estadual|estaduais|federal|federais|responsavel|responsaveis|legal|legais|tecnico|tecnica|ambiental|ambientais|juridica|juridico|fisica|fisico|civil|civis)$/u;
const ARTICLE=/^(?:o|a|os|as|ao|aos|do|da|dos|das|pela|pelo|um|uma)$/u;
const UNIT=/^(?:dia|dias|hora|horas|minuto|minutos|mes|meses|ano|anos|semana|semanas|metro|metros|cm|mm|km|kg|g|m2|m3|reais|salario|salarios|vez|vezes|vagas|graus)$/u;
const number=w=>/^\d+(?:[.,]\d+)?(?:%|º|°)?$/u.test(w);
const EXTENTS=/^(?:zero|um|uma|dois|duas|tres|quatro|cinco|seis|sete|oito|nove|dez|onze|doze|treze|quatorze|catorze|quinze|dezesseis|dezessete|dezoito|dezenove|vinte|trinta|quarenta|cinquenta|sessenta|setenta|oitenta|noventa|cem|cento|mil)$/u;
const STRUCT=/^(?:art|arts|inciso|paragrafo|capitulo|secao|titulo|livro)$/u;
function analyzeWords(tokens){
 if(!Array.isArray(tokens)||!tokens.length||tokens.length>180||
    tokens.some(t=>!t||typeof t.text!=='string'||!Array.isArray(t.rects)||!t.rects.length||
    t.rects.some(r=>!Array.isArray(r)||r.length!==4||!r.every(Number.isFinite))))
  return {segments:[],suggestions:[],review:[],recognized:0,total:0,coverage:0,reason:'Seleção não estruturada'};
 const raw=tokens.map(t=>t.text),w=raw.map(lexical),N=w.length,used=new Array(N).fill(false),proposals=[];
 const eq=(i,...p)=>p.every((x,j)=>w[i+j]===x);
 const dotted=i=>/[;.!?]$/u.test(raw[i])&&!STRUCT.test(w[i]);
 const reference=i=>STRUCT.test(w[i])||/^§/u.test(raw[i])||/^[IVXLCDM]{1,7}[.)-]$/u.test(raw[i]);
 const cue=i=>{
  const x=w[i],y=w[i+1]||'';
  return EXC.test(x)||['quando','mediante','caso','compete','incumbe','cabera'].includes(x)||
   eq(i,'desde','que')||eq(i,'no','prazo')||eq(i,'a','partir','de')||
   eq(i,'na','hipotese','de')||eq(i,'em','caso','de')||
   x==='nao'&&/^(?:pode|podem|podera|poderao|deve|devem|devera|deverao)$/u.test(y);
 };
 function endAt(i,max,{comma=true,stopCue=true}={}){
  const maxEnd=Math.min(N-1,i+max-1);let end=i;
  for(let j=i;j<=maxEnd;j++){
   if(j>i&&(used[j]||stopCue&&cue(j)||reference(j)))break;
   end=j;if(dotted(j)||comma&&/,$/u.test(raw[j])&&j>i)break;
  }
  return end;
 }
 function claim(kind,a,b,confidence,evidence){
  if(a<0||b<a||b>=N||proposals.length>=45)return false;
  while(a<=b&&used[a])a++;
  if(a>b)return false;
  for(let j=a;j<=b;j++)if(used[j]){b=j-1;break}
  if(a>b||b-a>13||a===b&&['condicao','excecao'].includes(kind))return false;
  for(let j=a;j<=b;j++)used[j]=true;
  proposals.push({kind,a,b,confidence,evidence});return true;
 }
 // Exceção requer uma palavra/expressão de ressalva: NUNCA classificar alínea apenas por "(a)".
 for(let i=0;i<N;i++){
  if(used[i])continue;
  if(EXC.test(w[i])){
   if((w[i]==='salvo'||w[i]==='salva')&&/^(?:foi|sera|estava|esta|documento|arquivo|registro|dados|conteudo)$/u.test(w[i-1]||''))continue;
   claim('excecao',i,endAt(i,10,{stopCue:false}),'alta','ressalva expressa');
  }else if(eq(i,'serao','dispensados')||eq(i,'serao','dispensadas')||
   eq(i,'sao','dispensados')||eq(i,'sao','dispensadas')||
   eq(i,'e','dispensavel')&&/^[Éé]$/u.test(raw[i])||
   eq(i,'fica','isento')||eq(i,'fica','isenta')||
   eq(i,'a','menos','que')||eq(i,'fora','dos','casos')||
   eq(i,'nao','se','aplica')||eq(i,'nao','se','aplicam')||
   eq(i,'fica','dispensado')||eq(i,'fica','dispensada')||
   eq(i,'estao','dispensados')||eq(i,'sem','exigencia','de')){
   claim('excecao',i,endAt(i,9,{stopCue:false}),'alta','dispensa ou não aplicação expressa');
  }
 }
 // Condição (azul): prazos, hipóteses, mínimos/máximos e parâmetros de incidência.
 for(let i=0;i<N;i++){
  if(used[i])continue;
  const x=w[i],y=w[i+1]||'';
  let length=0,reason='';
  if(eq(i,'no','prazo','de')||eq(i,'dentro','do','prazo')||
   eq(i,'a','partir','de')||eq(i,'prazo','maximo','de')||
   eq(i,'prazo','minimo','de')||eq(i,'na','hipotese','de')||
   eq(i,'em','caso','de')||eq(i,'sob','condicao','de')){
   length=9;reason='marco, prazo ou hipótese';
  }else if(eq(i,'desde','que')||eq(i,'contanto','que')||
   eq(i,'somente','se')||eq(i,'apenas','se')||
   eq(i,'observado','o')||eq(i,'observada','a')||
   eq(i,'observadas','as')||eq(i,'conforme','previsto')){
   length=8;reason='condição ou observância expressa';
  }else if(['quando','mediante','apos','durante'].includes(x)||
    x==='caso'&&(i===0||/[,;:]$/u.test(raw[i-1]||''))&&
      !(y==='a'&&w[i+2]==='caso')){
   length=8;reason='condição temporal ou requisito';
  }else if(x==='se'&&(i===0||/[,;:]$/u.test(raw[i-1]||''))&&
      /^(?:o|a|os|as)$/u.test(y)){
   length=8;reason='hipótese condicional expressa';
  }else if(x==='se'&&/^(?:houver|existir|forem|for|haja|ocorrer|comprovado|comprovada|atendido|atendida|apresentado|apresentada|decorrido|decorridos|couber|necessario|cumprido|verificada|constatada)$/u.test(y)){
   length=8;reason='hipótese condicional';
  }else if(eq(i,'pelo','menos')||eq(i,'no','minimo')||
   eq(i,'no','maximo')||eq(i,'superior','a')||
   eq(i,'inferior','a')||eq(i,'igual','a')||
   x==='ate'&&number(y)){
   length=6;reason='limite mínimo/máximo';
  }else if((number(x)||EXTENTS.test(x))&&UNIT.test(y)&&!reference(i-1)||
   /^\d+(?:[.,]\d+)?%$/u.test(raw[i])&&!reference(i-1)){
   length=2;reason='prazo, percentual ou quantidade expressa';
  }
  if(length)claim('condicao',i,endAt(i,length),'alta',reason);
 }
 // Sujeito/competência: nomes isolados sem verbo ou relação jurídica exigem revisão.
 for(let i=0;i<N;i++){
  if(used[i])continue;
  if((eq(i,'e','de','competencia')||eq(i,'e','atribuicao'))&&/^[Éé]$/u.test(raw[i])){
   claim('agente',i,Math.min(N-1,i+4+(ADJ.test(w[i+5]||'')?1:0)),'alta','competência ou atribuição expressa');
   continue;
  }
  if(['compete','incumbe','cabera'].includes(w[i])&&/^(?:a|ao|aos|as|o|os)$/u.test(w[i+1]||'')){
   let end=Math.min(N-1,i+2);
   if(ADJ.test(w[end+1]||''))end++;
   claim('agente',i,Math.min(endAt(i,6),end),'alta','competência expressa');
   continue;
  }
  let at=i;if(ARTICLE.test(w[i])&&AGENT.test(w[i+1]||''))at=i+1;
  if(!AGENT.test(w[at]||'')||reference(at))continue;
  let right=at;
  if(ADJ.test(w[at+1]||''))right=at+1;
  else if(w[at+1]==='de'&&ADJ.test(w[at+2]||''))right=at+2;
  const neighborhood=w.slice(Math.max(0,i-3),Math.min(N,right+12));
  const inCommand=neighborhood.some(v=>MOD.test(v)||['compete','incumbe','cabera','direito'].includes(v));
  if(!inCommand)continue;
  claim('agente',i,right,at!==i||right!==at?'alta':'media','agente ou destinatário provável');
 }
 // Comando: preservar "não", e só classificar "é/será" quando o predicado for normativo.
 const predicate=/^(?:facultado|facultada|facultados|facultadas|decidido|decidida|decididos|decididas|aprovado|aprovada|aprovados|aprovadas|revogado|revogada|anulado|anulada|deferido|deferidos|indeferido|indeferidos|indeferida|indeferidas|obrigado|obrigada|obrigados|obrigadas|vedado|vedada|proibido|proibida|permitido|permitida|exigido|exigida|garantido|garantida|instituido|instituida|considerado|considerada|aplicado|aplicada|responsavel)$/u;
 for(let i=0;i<N;i++){
  if(used[i])continue;
  const x=w[i],y=w[i+1]||'';
  let evidence='',confidence='alta';
  if(x==='nao'&&/^(?:pode|podem|podera|poderao|deve|devem|devera|deverao|sera|serao)$/u.test(y))
   evidence='negação obrigatória preservada';
  else if(eq(i,'fica','vedado')||eq(i,'fica','vedada')||
   eq(i,'fica','proibido')||eq(i,'fica','proibida')||
   eq(i,'tera','direito')||eq(i,'terao','direito')||
   eq(i,'tem','direito')||eq(i,'entende-se','por')||
   eq(i,'considera-se')||eq(i,'fica','instituido')||eq(i,'fica','instituida'))
   evidence='regra, proibição ou definição explícita';
  else if(x==='tera'&&/^(?:resposta|validade|efeito|efeitos|prioridade|preferencia|duracao)$/u.test(y)){
   evidence='efeito da norma provável';confidence='media';
  }
  else if(MOD.test(x))evidence='verbo normativo explícito';
  else if(['sera','serao','sao'].includes(x)||x==='e'&&/^[Éé]$/u.test(raw[i])){
   if(predicate.test(y))evidence='predicado normativo explícito';
  }
  if(evidence)claim('regra',i,endAt(i,9),confidence,evidence);
 }
 proposals.sort((a,b)=>a.a-b.a);
 const segments=proposals.slice(0,35).map((p,i)=>{
  const span=tokens.slice(p.a,p.b+1),text=compact(span.map(x=>x.text).join(' '));
  const label=COLORS[p.kind];
  return {kind:p.kind,confidence:p.confidence,evidence:p.evidence,reason:p.evidence,
   requires_review:p.confidence!=='alta',text,
   rects:span.flatMap(x=>x.rects).slice(0,250),
   color:label.color,color_label:label.label,
   anchor:{quote:text,prefix:String(span[0]?.prefix||'').slice(-100),
    suffix:String(span.at(-1)?.suffix||'').slice(0,100)},
   classification_status:'sugestao',classification_kind:p.kind,
   segment_index:i+1,segment_total:Math.min(35,proposals.length)};
 }).filter(x=>x.text&&x.rects.length);
 const review=segments.filter(x=>x.requires_review);
 const recognized=used.filter(Boolean).length;
 return {segments,suggestions:segments,review,recognized,total:N,
   coverage:N?recognized/N:0,
   reason:segments.length?'':'Nenhum núcleo normativo identificado com evidência suficiente'};
}
function classifyWords(tokens){return analyzeWords(tokens).segments}
 const subjects=[
  // Normas reconhecidas pelo número ou nome inequívoco; nenhuma referência
  // vaga a "artigo" ou "parágrafo" atribui lei automaticamente.
  {re:/\b(?:lc\s*95(?:\/1998)?|lei complementar\s*(?:n(?:o|°|º)?\s*)?95|tecnica legislativa)\b/u,discipline:'Legislação geral',topic:'Técnica legislativa',subtopic:'LC 95/1998'},
  {re:/\b(?:constituicao federal|constituicao da republica|art\.?\s*37\s*(?:da\s*)?cf)\b/u,discipline:'Legislação geral',topic:'Constituição Federal',subtopic:'Administração pública e direitos fundamentais'},
  {re:/\b(?:lei\s*(?:n[º°o]?\s*)?8[.\s]?429|improbidade administrativa)\b/u,discipline:'Legislação geral',topic:'Improbidade administrativa',subtopic:'Lei 8.429/1992'},
  {re:/\b(?:lei\s*(?:n[º°o]?\s*)?9[.\s]?784|processo administrativo federal)\b/u,discipline:'Legislação geral',topic:'Processo administrativo',subtopic:'Lei 9.784/1999'},
  {re:/\b(?:lei complementar\s*(?:n[º°o]?\s*)?101|lei de responsabilidade fiscal|lrf\b)/u,discipline:'Legislação geral',topic:'Finanças públicas',subtopic:'LC 101/2000'},
  {re:/\b(?:lei\s*(?:n[º°o]?\s*)?12[.\s]?527|lei de acesso a informacao)\b/u,discipline:'Legislação geral',topic:'Transparência pública',subtopic:'Lei 12.527/2011'},
  {re:/\b(?:lei\s*(?:n[º°o]?\s*)?13[.\s]?709|lei geral de protecao de dados|lgpd\b)/u,discipline:'Legislação geral',topic:'Proteção de dados',subtopic:'LGPD'},
  {re:/\b(?:lei\s*(?:n[º°o]?\s*)?8[.\s]?112|regime juridico unico dos servidores federais)\b/u,discipline:'Legislação geral',topic:'Servidores públicos',subtopic:'Lei 8.112/1990'},
  {re:/\b(?:lei\s*(?:n[º°o]?\s*)?13[.\s]?460|direitos dos usuarios dos servicos publicos)\b/u,discipline:'Legislação geral',topic:'Serviços públicos',subtopic:'Lei 13.460/2017'},
  {re:/\b(?:lei\s*(?:n[º°o]?\s*)?13[.\s]?146|estatuto da pessoa com deficiencia|lei brasileira de inclusao)\b/u,discipline:'Legislação geral',topic:'Acessibilidade e inclusão',subtopic:'Lei 13.146/2015'},
  {re:/\b(?:lei\s*(?:n[º°o]?\s*)?6[.\s]?938|politica nacional do meio ambiente)\b/u,discipline:'Legislação geral',topic:'Meio ambiente',subtopic:'Lei 6.938/1981'},
  {re:/\b(?:lei\s*(?:n[º°o]?\s*)?9[.\s]?605|crimes ambientais)\b/u,discipline:'Legislação geral',topic:'Direito ambiental',subtopic:'Lei 9.605/1998'},
  {re:/\b(?:lei\s*(?:n[º°o]?\s*)?12[.\s]?651|codigo florestal)\b/u,discipline:'Legislação geral',topic:'Proteção da vegetação',subtopic:'Lei 12.651/2012'},
  {re:/\b(?:lei\s*(?:n[º°o]?\s*)?11[.\s]?445|diretrizes nacionais para o saneamento basico)\b/u,discipline:'Engenharia Civil',topic:'Saneamento básico',subtopic:'Lei 11.445/2007'},
  {re:/\b(?:lei\s*(?:n[º°o]?\s*)?12[.\s]?305|politica nacional de residuos solidos)\b/u,discipline:'Engenharia Civil',topic:'Resíduos sólidos',subtopic:'Lei 12.305/2010'},
  {re:/\b(?:nbr[\s-]?9050|acessibilidade a edificacoes)\b/u,discipline:'Engenharia Civil',topic:'Acessibilidade',subtopic:'NBR 9050'},
  {re:/\b(?:nr[\s-]?1\b|gerenciamento de riscos ocupacionais|gro\b)/u,discipline:'Engenharia Civil',topic:'Segurança do trabalho',subtopic:'NR-1'},
  {re:/\b(?:nr[\s-]?17|ergonomia)\b/u,discipline:'Engenharia Civil',topic:'Segurança do trabalho',subtopic:'NR-17'},

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
 window.BancoMestreClassificadorV070={COLORS,analyzeWords,classifyWords,suggestSubject,suggestNote,plain};
})();
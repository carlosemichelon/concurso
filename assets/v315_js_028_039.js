/* V315 IIFE scripts 28–39 order preserved */

;
/* 28 assets/v112_perfis_lei_seca.js */
/* V112 — validated legal excerpts: LIA definitions/exclusions and LC 95 text-articulation. */
/* Banco Mestre V111 — calibração com contexto negativo, pontuação e perfis adicionais.
 * Mantém API V110 e 4 cores; critérios incertos não autorizam grifo automático.
 */
/* Banco Mestre V110 — calibradores de lei seca por diploma normativo.
 * Quatro cores FIXAS. Especializações conservadoras em cima do classificador V109.
 * Evidência lexical NÃO confirma vigência, validade ou interpretação jurídica.
 */
(function(){
'use strict';
if(window.BancoMestreCalibradoresV110)return;
const base=window.BancoMestreClassificadorV070;
if(!base?.analyzeWords) return;
const normalize=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'')
 .replace(/[\u2010-\u2015]/g,'-').toLowerCase().replace(/\s+/g,' ').trim();
const token=s=>normalize(s).replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu,'');
const specs=[
 {id:'geral',label:'Geral · 4 cores',desc:'Regras gerais: quem, o quê, condição e exceção.',topic:'',
  detect:[],rules:[],question:'Quem? O quê? Em que condição? Qual exceção?'},
 {id:'cf88',label:'Constituição Federal (CF/88)',desc:'Direitos/garantias; competências; reserva legal, quóruns e ressalvas.',topic:'Constituição Federal',
  discipline:'Legislação geral',
  detect:[/\bconstituicao\s+(?:da\s+republica|federal|brasileira)\b/,/\bcf[\s/-]*88\b/,/\bconstituicao\s+de\s+1988\b/],
  question:'Qual direito? Quem é o titular? Qual ente tem competência? Em que condições e com quais ressalvas?',
  rules:[
   ['regra','e livre',6,'Liberdade expressamente assegurada'],
   ['regra','e assegurado',7,'Garantia expressamente assegurada'],
   ['regra','e assegurada',7,'Garantia expressamente assegurada'],
   ['regra','sao direitos',7,'Enumeração de direitos'],
   ['regra','ninguem sera',7,'Garantia ou vedação dirigida a todos'],
   ['regra','a lei punira',6,'Comando constitucional de sanção'],
   ['regra','e inviolavel',7,'Direito ou garantia de inviolabilidade'],
   ['agente','compete privativamente a uniao',0,'Competência privativa expressa da União'],
   ['agente','compete a uniao',0,'Competência expressa da União'],
   ['agente','compete aos municipios',0,'Competência expressa dos Municípios'],
   ['agente','e competencia comum da uniao',0,'Competência comum — verificar demais entes'],
   ['agente','e competencia concorrente da uniao',0,'Competência concorrente — verificar demais entes'],
   ['condicao','nos termos da lei',0,'Reserva ou remissão à lei'],
   ['condicao','na forma da lei',0,'Exercício condicionado à forma legal'],
   ['condicao','mediante autorizacao',3,'Exigência expressa de autorização'],
   ['condicao','maioria absoluta',0,'Quórum constitucional expresso'],
   ['condicao','dois tercos',0,'Quórum ou fração — verificar contexto'],
   ['agente','compete privativamente ao senado federal',0,'Competência privativa expressa do Senado'],
   ['agente','e da competencia exclusiva do congresso nacional',0,'Competência exclusiva expressa do Congresso'],
   ['agente','compete a camara dos deputados',0,'Competência expressa da Câmara'],
   ['regra','sao inviolaveis',7,'Inviolabilidade constitucional expressa'],
   ['condicao','mediante decisao judicial',4,'Condição por decisão judicial'],
   ['condicao','por maioria absoluta',0,'Quórum de maioria absoluta'],
   ['condicao','por dois tercos',0,'Quórum constitucional de dois terços'],
   ['excecao','ressalvado o disposto',4,'Ressalva constitucional expressa']
  ]},
 {id:'licitacoes',label:'Lei 14.133/2021 · Licitações',desc:'Agentes, regras de contratação, condições, dispensa e inexigibilidade.',topic:'Licitações e contratos',subtopic:'Lei 14.133/2021',discipline:'Legislação geral',
  detect:[/\blei\s*(?:n(?:o|º|°)?\s*)?14[.\s]?133\b/,/\bnova lei de licitacoes\b/,/\blei de licitacoes e contratos administrativos\b/],
  question:'Qual agente? Qual procedimento? A licitação é regra, dispensável ou inexigível? Qual condição?',
  rules:[
   ['agente','agente de contratacao',0,'Agente de contratação explicitamente nomeado'],
   ['agente','comissao de contratacao',0,'Comissão de contratação explicitamente nomeada'],
   ['agente','autoridade competente',0,'Autoridade responsável'],
   ['regra','constituem infracoes administrativas',4,'Tipificação de infração administrativa'],
   ['regra','constituem infracoes',4,'Tipificação administrativa'],
   ['excecao','e inexigivel a licitacao',0,'Inexigibilidade expressa'],
   ['excecao','e dispensavel a licitacao',0,'Dispensa expressa'],
   ['excecao','serao dispensadas de licitacao',0,'Dispensa expressa'],
   ['condicao','mediante justificativa',3,'Exigência expressa de justificativa'],
   ['regra','o contrato devera',6,'Dever contratual expresso'],
   ['agente','gestor do contrato',0,'Responsável pela gestão contratual'],
   ['condicao','mediante comprovacao',4,'Comprovação expressa como condição'],
   ['excecao','sera dispensavel a licitacao',0,'Dispensabilidade expressa'],
   ['condicao','sob pena de nulidade',0,'Condição/consequência vinculada à validade']
  ]},
 {id:'improbidade',label:'Lei 8.429/1992 · Improbidade',desc:'Sujeitos, tipificação, dolo, sanções e hipóteses de não aplicação.',topic:'Improbidade administrativa',subtopic:'Lei 8.429/1992',discipline:'Legislação geral',
  detect:[/\blei\s*(?:n(?:o|º|°)?\s*)?8[.\s]?429\b/,/\blei de improbidade administrativa\b/],
  question:'Quem é o sujeito? Qual conduta tipificada? Qual elemento subjetivo e consequência? Há exclusão?',
  rules:[
   ['agente','agente publico',0,'Sujeito normativo expressamente identificado'],
   ['regra','consideram-se atos de improbidade administrativa',0,'Definição expressa dos atos tipificados'],
   ['regra','consideram-se',0,'Comando de definição jurídica'],
   ['regra','constitui ato de improbidade',4,'Tipificação expressa de improbidade'],
   ['regra','constitui ato de improbidade administrativa',3,'Tipificação expressa de improbidade'],
   ['regra','importa enriquecimento ilicito',3,'Enriquecimento ilícito como núcleo normativo'],
   ['condicao','mediante dolo',2,'Elemento subjetivo expresso'],
   ['condicao','comprovado dolo',2,'Exigência expressa de dolo'],
   ['excecao','nao configura improbidade',5,'Não caracterização expressa'],
   ['excecao','nao se configurara improbidade',5,'Hipótese expressa de não caracterização'],
   ['excecao','afasta a responsabilidade por ato de improbidade',2,'Afastamento expresso de responsabilidade'],
   ['condicao','sem comprovacao de ato doloso',5,'Ausência de prova do dolo'],
   ['excecao','nao configura ato de improbidade',3,'Ausência de tipificação expressa'],
   ['regra','sao atos de improbidade administrativa',4,'Rol de atos de improbidade expressos'],
   ['condicao','quando comprovado o dolo',4,'Comprovação do dolo expressa'],
   ['excecao','nao configura improbidade administrativa',3,'Não caracterização expressa'],
   ['excecao','nao caracteriza improbidade administrativa',3,'Não caracterização expressa'],
   ['excecao','nao caracteriza ato de improbidade',3,'Hipótese de não caracterização']
  ]},
 {id:'estatuto',label:'Lei 10.257/2001 · Estatuto da Cidade',desc:'Plano diretor, política urbana, competência municipal, instrumentos e condições.',topic:'Política urbana',subtopic:'Estatuto da Cidade',discipline:'Legislação geral',
  detect:[/\blei\s*(?:n(?:o|º|°)?\s*)?10[.\s]?257\b/,/\bestatuto da cidade\b/],
  question:'Quem executa? Qual instrumento urbanístico? Qual requisito, prazo ou limite? Qual exceção?',
  rules:[
   ['agente','poder publico municipal',0,'Ente responsável pela política urbana'],
   ['agente','proprietario do imovel',0,'Destinatário expresso da disciplina urbana'],
   ['regra','o plano diretor e',5,'Definição ou função do plano diretor'],
   ['regra','funcao social da propriedade',2,'Função social: verificar comando na íntegra'],
   ['condicao','mediante lei municipal',4,'Instrumento legal municipal exigido'],
   ['condicao','aprovado por lei municipal',0,'Forma de aprovação do plano diretor'],
   ['regra','o plano diretor e parte integrante',4,'Plano diretor como parte do planejamento municipal'],
   ['condicao','na forma da lei municipal',4,'Forma exigida por lei municipal'],
   ['condicao','mediante contrapartida',4,'Contrapartida exigida']
  ]},
 {id:'servidores',label:'Lei 8.112/1990 · Servidores',desc:'Provimento, direitos, deveres, proibições, penalidades e prazos.',topic:'Servidores públicos',subtopic:'Lei 8.112/1990',discipline:'Legislação geral',
  detect:[/\blei\s*(?:n(?:o|º|°)?\s*)?8[.\s]?112\b/,/\bregime juridico dos servidores publicos civis da uniao\b/],
  question:'Quem está abrangido? Qual dever/proibição? Qual hipótese? Qual prazo/exceção?',
  rules:[
   ['agente','servidor publico',0,'Servidor identificado'],
   ['agente','autoridade competente',0,'Competência disciplinar ou funcional'],
   ['regra','sao deveres do servidor',0,'Rol de deveres funcional'],
   ['regra','ao servidor e proibido',4,'Proibição disciplinar expressa'],
   ['regra','sao requisitos basicos',5,'Requisitos de ingresso/provimento'],
   ['condicao','sem previa autorizacao',4,'Falta de autorização prévia como condição'],
   ['condicao','mediante previa autorizacao',3,'Exigência de autorização prévia'],
   ['regra','e assegurado ao servidor',5,'Direito funcional expressamente assegurado'],
   ['excecao','exceto quando manifestamente ilegais',0,'Exceção expressa ao cumprimento de ordem']
  ]},
 {id:'processo',label:'Lei 9.784/1999 · Processo adm.',desc:'Interessados, autoridade, motivação, prazos e recursos.',topic:'Processo administrativo',subtopic:'Lei 9.784/1999',discipline:'Legislação geral',
  detect:[/\blei\s*(?:n(?:o|º|°)?\s*)?9[.\s]?784\b/,/\bprocesso administrativo(?:\s+federal)?\b/],
  question:'Quem decide? Qual dever de motivação? Qual prazo ou requisito? Quando cabe recurso?',
  rules:[
   ['agente','autoridade competente',0,'Autoridade responsável'],
   ['agente','os interessados',0,'Interessados no processo'],
   ['regra','deverao ser motivados',5,'Dever de motivação'],
   ['regra','deverao ser motivadas',5,'Dever de motivação'],
   ['regra','e obrigatoria a motivacao',5,'Obrigação de motivação expressa'],
   ['regra','devera ser motivada',5,'Dever de motivação'],
   ['excecao','independe de caucao',3,'Dispensa expressa de caução'],
   ['condicao','mediante motivacao',3,'Motivação como condição expressa']
  ]},
 {id:'lgpd',label:'Lei 13.709/2018 · LGPD',desc:'Titular, controlador, operador, hipóteses de tratamento e exceções.',topic:'Proteção de dados',subtopic:'LGPD',discipline:'Legislação geral',
  detect:[/\blei\s*(?:n(?:o|º|°)?\s*)?13[.\s]?709\b/,/\blei geral de protecao de dados\b/,/\blgpd\b/],
  question:'Quem é o titular/controlador? Qual tratamento? Qual base legal, condição ou exceção?',
  rules:[
   ['agente','titular dos dados pessoais',0,'Titular de dados pessoais'],
   ['agente','agente de tratamento',0,'Agente de tratamento de dados'],
   ['agente','agentes de tratamento',0,'Agentes de tratamento de dados'],
   ['condicao','mediante consentimento',3,'Consentimento como hipótese indicada'],
   ['excecao','dispensado o consentimento',3,'Dispensa expressa de consentimento'],
   ['agente','o titular dos dados pessoais',0,'Titular expressamente identificado'],
   ['agente','o controlador',0,'Controlador expressamente identificado'],
   ['condicao','mediante o fornecimento de consentimento',3,'Consentimento como hipótese legal'],
   ['condicao','quando necessario para',5,'Hipótese de necessidade de tratamento'],
   ['excecao','independe do consentimento',3,'Hipótese sem exigência de consentimento']
  ]},

 {id:'lai',label:'Lei 12.527/2011 · Acesso à Informação',
  desc:'Transparência ativa e passiva, dever de informação, prazos e sigilo expresso.',
  topic:'Transparência pública',subtopic:'Lei 12.527/2011',discipline:'Legislação geral',
  detect:[/\blei\s*(?:n(?:o|º|°)?\s*)?12[.\s]?527\b/,/\blei de acesso a informacao\b/,/\blai\s*12[.\s]?527\b/],
  question:'Quem deve informar? Qual informação? Em que prazo? Existe restrição expressa de acesso?',
  rules:[
   ['regra','e dever',0,'Dever legal expresso de informação'],
   ['agente','do estado',0,'Sujeito do dever expresso de informação'],
   ['regra','e dever do estado garantir',7,'Dever estatal de garantir acesso à informação'],
   ['regra','o acesso a informacao compreende',5,'Conteúdo do direito de acesso'],
   ['regra','independentemente de requerimentos',4,'Transparência ativa expressa'],
   ['agente','os orgaos e entidades publicas',0,'Destinatários da obrigação de transparência'],
   ['condicao','no prazo nao superior a',4,'Limite máximo de prazo de atendimento'],
   ['condicao','em prazo nao superior a',4,'Limite máximo de prazo de atendimento'],
   ['condicao','nao sendo possivel conceder o acesso imediato',0,'Condição alternativa à concessão imediata'],
   ['condicao','mediante pedido de acesso',3,'Exigência de requerimento'],
   ['excecao','ressalvadas as hipoteses de sigilo',3,'Ressalva expressa de sigilo']
  ]},
 {id:'lrf',label:'LC 101/2000 · Responsabilidade Fiscal',
  desc:'Metas, limites, condições, controles e vedações orçamentárias.',
  topic:'Finanças públicas',subtopic:'LC 101/2000',discipline:'Legislação geral',
  detect:[/\b(?:lei complementar|lc)\s*(?:n(?:o|º|°)?\s*)?101(?:\/2000)?\b/,/\blei de responsabilidade fiscal\b/,/\blrf\b/],
  question:'Qual ente? Qual limite ou condição fiscal? Qual dever e qual vedação?',
  rules:[
   ['regra','e nulo de pleno direito',6,'Nulidade expressa de ato'],
   ['regra','sao instrumentos de transparencia',5,'Instrumentos de transparência fiscal'],
   ['regra','devera ser acompanhada',5,'Dever de instrução/controle'],
   ['agente','poder executivo',0,'Agente público responsável'],
   ['condicao','observadas as seguintes condicoes',0,'Condições legais expressas'],
   ['condicao','nos limites estabelecidos',4,'Limites fiscais expressos'],
   ['condicao','desde que atendidas',4,'Hipótese condicionada'],
   ['excecao','ressalvada a hipotese',4,'Ressalva expressa de incidência']
  ]},
 {id:'lbi',label:'Lei 13.146/2015 · Inclusão',
  desc:'Direitos, atendimento, acessibilidade, obrigações e igualdade de condições.',
  topic:'Acessibilidade e inclusão',subtopic:'Lei 13.146/2015',discipline:'Legislação geral',
  detect:[/\blei\s*(?:n(?:o|º|°)?\s*)?13[.\s]?146\b/,/\blei brasileira de inclusao\b/,/\bestatuto da pessoa com deficiencia\b/],
  question:'Qual direito? Quem é titular? Qual acessibilidade é exigida e em que condição?',
  rules:[
   ['regra','e assegurado a pessoa com deficiencia',6,'Direito assegurado à pessoa com deficiência'],
   ['regra','e proibida qualquer forma de discriminacao',3,'Proibição expressa de discriminação'],
   ['agente','pessoa com deficiencia',0,'Titular de direito protegido'],
   ['condicao','em igualdade de condicoes',4,'Condição expressa de igualdade'],
   ['condicao','mediante atendimento prioritario',3,'Forma de atendimento expressa']
  ]},
 {id:'pnma',label:'Lei 6.938/1981 · Meio Ambiente',
  desc:'Licenciamento, instrumentos, órgãos do SISNAMA e condicionantes.',
  topic:'Meio ambiente',subtopic:'Lei 6.938/1981',discipline:'Legislação geral',
  detect:[/\blei\s*(?:n(?:o|º|°)?\s*)?6[.\s]?938\b/,/\bpolitica nacional do meio ambiente\b/,/\bpnma\s*6[.\s]?938\b/],
  question:'Qual órgão? Qual instrumento/obrigação? Que condição de licenciamento se exige?',
  rules:[
   ['regra','sao instrumentos da politica nacional do meio ambiente',0,'Instrumentos de política ambiental'],
   ['agente','conselho nacional do meio ambiente',0,'Órgão ambiental nomeado'],
   ['agente','orgao ambiental competente',0,'Agente competente expresso'],
   ['condicao','previo licenciamento ambiental',3,'Licenciamento prévio exigido'],
   ['condicao','mediante licenciamento ambiental',4,'Condição de licenciamento'],
   ['excecao','ressalvados os casos previstos em lei',0,'Ressalva ambiental expressa']
  ]},
 {id:'lc95',label:'LC 95/1998 · Técnica legislativa',desc:'Estrutura artigo/parágrafo/inciso/alínea; separar enumeração de ressalva.',topic:'Técnica legislativa',subtopic:'LC 95/1998',discipline:'Legislação geral',
  detect:[/\blei complementar\s*(?:n(?:o|º|°)?\s*)?95\b/,/\blc\s*95(?:\/1998)?\b/,/\btecnica legislativa\b/],
  question:'O dispositivo é caput, parágrafo, inciso ou alínea? Contém regra, sujeito, condição ou exceção expressa?',
  rules:[
   ['regra','os textos legais serao articulados',3,'Comando legal expresso de articulação dos textos'],
   ['regra','a unidade basica de articulacao sera o artigo',0,'Definição expressa da unidade de articulação'],
   ['regra','a lei sera estruturada em tres partes basicas',0,'Estrutura legal expressa'],
   ['regra','a clausula de revogacao devera enumerar',4,'Dever expresso da cláusula de revogação'],
   ['regra','a vigencia da lei sera indicada',5,'Indicação de vigência obrigatória'],
   ['regra','os artigos desdobrar-se-ao',5,'Regra de desdobramento normativo']
  ]}
];
const byId=new Map(specs.map(p=>[p.id,p]));
const profiles=Object.freeze(specs.map(({id,label,desc,topic,subtopic,discipline,question})=>
 Object.freeze({id,label,desc,topic:topic||'',subtopic:subtopic||'',discipline:discipline||'',question})));
function detectDocument(title){
 // PDF filenames often use underscores/hyphens instead of spaces.
 // This normalization affects only title detection, never original legal text.
 const t=normalize(title).replace(/[_\u2010-\u2015-]/gu,' ').replace(/\s+/g,' ');
 if(!t)return null;
 const matched=specs.filter(p=>p.id!=='geral'&&p.detect.some(re=>re.test(t)));
 return matched.length===1?matched[0].id:null;
}
function rectId(r){return Array.isArray(r)?r.map(n=>Number(n).toFixed(6)).join('|'):''}
function indicesFor(segment,tokens){
 const keys=new Set((segment.rects||[]).map(rectId));
 const set=new Set();
 for(let i=0;i<tokens.length;i++){
  if((tokens[i].rects||[]).some(r=>keys.has(rectId(r))))set.add(i);
 }
 return set;
}
function mergeSegments(tokens,baseResult,extras,profile,extraReview=[]){
 const existing=baseResult.segments.map(x=>({...x}));
 const review=[...(baseResult.review||[]),...extraReview];
 const generated=[];
 for(const p of extras){
  const intended=new Set(Array.from({length:p.end-p.start+1},(_,k)=>k+p.start));
  const colliding=existing.filter(s=>{
   const ids=indicesFor(s,tokens);return [...intended].some(x=>ids.has(x));
  });
  const highSame=colliding.some(s=>s.kind===p.kind&&s.confidence==='alta');
  const conflict=colliding.some(s=>s.kind!==p.kind);
  const explicitExclusion=p.kind==='excecao'&&
   /^(?:não configura|não se configurará|não caracteriza|afasta a responsabilidade|é inexigível|é dispensável|serão dispensadas|não se aplica|independe do consentimento)/iu.test(p.text);
  // An unequivocal, prefixed negative/dispensa should replace a generic verb
  // that starts later in the same clause. Otherwise require manual review.
  if(conflict&&!explicitExclusion){
   review.push({...p,requires_review:true,reason:'Cores concorrentes: confirmação manual necessária'});
   continue;
  }
  if(highSame&&!conflict){
   const fullyCovers=colliding.every(s=>{
    const ids=indicesFor(s,tokens);
    return [...ids].every(i=>intended.has(i));
   });
   if(!fullyCovers)continue;
  }
  // Replace only the segments intersected by a higher-specificity, explicit
  // phrase. Never manufacture a legal conclusion from a heading alone.
  for(const s of colliding){const k=existing.indexOf(s);if(k>=0)existing.splice(k,1)}
  generated.push(p);
 }
 const all=[...existing,...generated].sort((a,b)=>{
  const aa=Math.min(...indicesFor(a,tokens)),bb=Math.min(...indicesFor(b,tokens));
  return aa-bb;
 }).slice(0,35);
 for(let i=0;i<all.length;i++){
  all[i].segment_index=i+1;all[i].segment_total=all.length;
  all[i].calibration_profile=profile.id;
  if(!all[i].calibration_evidence)all[i].calibration_evidence=
   all[i].evidence||'Reconhecimento pelo classificador geral';
 }
 const unresolved=review.filter(x=>{
  if(!x.requires_review)return false;
  const ids=indicesFor(x,tokens);
  if(!ids.size)return true;
  // A complete, more specific negative/dispensa removes an obsolete
  // positive suggestion it superseded; don't warn twice for the same words.
  return !all.some(y=>{
   if(y.confidence!=='alta'||y.kind===x.kind)return false;
   const covered=indicesFor(y,tokens);
   return [...ids].every(i=>covered.has(i));
  });
 });
 return {segments:all,suggestions:all,review:unresolved,total:tokens.length,
  recognized:new Set(all.flatMap(x=>[...indicesFor(x,tokens)])).size,
  coverage:tokens.length?new Set(all.flatMap(x=>[...indicesFor(x,tokens)])).size/tokens.length:0,
  profileId:profile.id,reason:all.length?'':'Nenhuma expressão segura reconhecida'};
}
const negators=new Set(['nao','nem','nunca','jamais','tampouco']);
const normative=new Set(['deve','devem','devera','deverao','pode','podem','podera','poderao',
 'compete','incumbe','cabera','vedado','vedada','proibido','proibida','assegurado',
 'assegurada','garantido','garantida','direito','direitos','constituem','constitui',
 'autoriza','autorizada','autorizado','responsavel','obrigatorio','obrigatoria',
 'assegura','asseguram','implica','ficara','ficarao','sera','serao','sao',
 'considera-se','consideram-se','considera','consideram','afasta','afastam','configura']);
function negatedBefore(words,tokens,start){
 const low=Math.max(0,start-3);
 for(let j=start-1;j>=low;j--){
  const v=words[j];
  if(negators.has(v))return true;
  if(/[;.!?]$/u.test(String(tokens[j]?.text||'')))break;
 }
 return false;
}
function phraseCrossesBoundary(tokens,start,end){
 for(let i=start;i<end;i++)if(/[;.!?]$/u.test(String(tokens[i]?.text||'')))return true;
 return false;
}
function ambiguousPassive(words,index){
 const w=words[index]||'';
 return /^(?:assegurado|assegurada|garantido|garantida|autorizado|autorizada)$/u.test(w)&&
   /^(?:foi|foram|havia|estava|estavam)$/u.test(words[index-1]||'');
}
function cleanGeneric(general,tokens,words){
 const removed=[];
 const good=(general.segments||[]).filter(segment=>{
  const ids=indicesFor(segment,tokens),indices=[...ids];
  if(!indices.length)return false;
  const first=Math.min(...indices);
  const firstWord=words[first]||'';
  const includesOwnNegative=indices.some(i=>negators.has(words[i]));
  const unsafe=!includesOwnNegative&&negatedBefore(words,tokens,first);
  const past=ambiguousPassive(words,first);
  const previous=String(tokens[first-1]?.text||'');
  const previousLex=words[first-1]||'';
  const splitCompetence=segment.kind==='agente'&&
   (firstWord==='compete'&&/[;.!?]$/u.test(String(tokens[first]?.text||''))||
    previousLex==='compete'&&/[;.!?]$/u.test(previous));
  const brokenPredicate=/^(?:assegurado|assegurada|garantido|garantida|vedado|vedada|permitido|permitida)$/u.test(firstWord)&&
   /[;.!?]$/u.test(previous)&&/^(?:e|foi|eram|esta|estao)$/u.test(previousLex);
  if(unsafe||past||splitCompetence||brokenPredicate){
   removed.push({...segment,requires_review:true,confidence:'baixa',
    reason:unsafe?'Negação anterior ao núcleo: revisão necessária':
     'Expressão narrativa ou separada por pontuação: conferir manualmente'});
   return false;
  }
  return true;
 });
 return {...general,segments:good,review:[...(general.review||[]),...removed]};
}
function analyzeWords(tokens,profileId='geral'){
 const profile=byId.get(profileId)||byId.get('geral');
 const general=base.analyzeWords(tokens);
 if(!Array.isArray(tokens)||!tokens.length||!Array.isArray(general.segments)||!general.total)
  return {...general,profileId:'geral',segments:(general.segments||[]).map(s=>({...s,calibration_profile:'geral'}))};
 const words=tokens.map(t=>token(t.text)),used=new Set(),extras=[],extraReview=[];
 const cleaned=cleanGeneric(general,tokens,words);
 if(profile.id==='geral')
  return {...cleaned,profileId:'geral',segments:cleaned.segments.map(s=>({...s,calibration_profile:'geral'}))};
 for(const [kind,phrase,extraWords,evidence] of profile.rules){
  const match=phrase.split(' ');
  for(let i=0;i<=words.length-match.length;i++){
   if(!match.every((part,j)=>words[i+j]===part))continue;
   // "do Estado" only identifies the responsible actor in this calibrated
   // expression when immediately preceded by "É dever"; isolated headings
   // and references to the State are not enough.
   if(phrase==='do estado'&&!(words[i-2]==='e'&&words[i-1]==='dever'))continue;
   const start=i;let end=i+match.length-1;
   // Never combine words from two articles or distinct sentences.
   if(phraseCrossesBoundary(tokens,start,end))continue;
   // A scoped negative reverses the legal meaning of a positive pattern.
   // The full negative expression can still be entered manually.
   if(!match.some(t=>negators.has(t))&&negatedBefore(words,tokens,start)){
    extraReview.push({kind,requires_review:true,confidence:'baixa',
     text:tokens.slice(Math.max(0,start-2),end+1).map(t=>t.text).join(' '),
     reason:'Negação anterior: não aplicar afirmação oposta',calibration_profile:profile.id});
    continue;
   }
   for(let extra=0;extra<extraWords&&end+1<words.length;extra++){
    const next=words[end+1],current=String(tokens[end].text||'');
    if(/[;.!?]$/u.test(current)||/,$/u.test(current))break;
    // Stop before another distinct rule/negative/condition.
    if(/^(?:nao|nem|nunca|jamais|tampouco|sera|serao|devera|deverao|deve|devem|podera|poderao|pode|podem|fica|ficara|compete|incumbe|salvo|exceto|ressalvado|ressalvada|quando|mediante|desde)$/u.test(next))break;
    if(next==='no'&&words[end+2]==='prazo')break;
    if(next==='em'&&words[end+2]==='caso')break;
    end++;
    if(/[;.!?]$/u.test(String(tokens[end].text||'')))break;
   }
   if([...Array.from({length:end-start+1},(_,j)=>start+j)].some(n=>used.has(n)))continue;
   const selected=tokens.slice(start,end+1);
   if(selected.some(t=>!Array.isArray(t.rects)||!t.rects.length))continue;
   const text=selected.map(t=>String(t.text)).join(' ').replace(/\s+/g,' ').trim();
   const b=base.COLORS[kind];
   if(!b||!text)continue;
   const actorOnly=kind==='agente'&&!/^(?:compete|e competencia|e da competencia)/u.test(phrase);
   const nearby=words.slice(Math.max(0,start-5),Math.min(words.length,end+12));
   const actorContext=(nearby.some(x=>normative.has(x))||
    (phrase==='do estado'&&words[start-2]==='e'&&words[start-1]==='dever'))&&
     !negatedBefore(words,tokens,start);
   const nominalRule=kind==='regra'&&/^(?:funcao social da propriedade)$/u.test(phrase);
   const confidence=(actorOnly&&!actorContext||nominalRule&&!actorContext)?'media':'alta';
   if(confidence==='media')extraReview.push({kind,confidence,requires_review:true,text,
    reason:'Expressão nominal sem comando próximo',calibration_profile:profile.id});
   extras.push({kind,confidence,evidence:'Perfil '+profile.label+': '+evidence,
    calibration_evidence:evidence,requires_review:confidence!=='alta',start,end,
    text,rects:selected.flatMap(t=>t.rects).slice(0,250),color:b.color,color_label:b.label,
    anchor:{quote:text,prefix:String(selected[0].prefix||'').slice(-100),
     suffix:String(selected.at(-1).suffix||'').slice(0,100)},
    classification_status:'sugestao',classification_kind:kind});
   for(let j=start;j<=end;j++)used.add(j);
  }
 }
 return mergeSegments(tokens,cleaned,extras,profile,extraReview);
}
function suggestSubject(text,title,profileId,prior={}){
 const p=byId.get(profileId)||byId.get('geral');
 if(p.id==='geral')return base.suggestSubject(text,title,prior);
 return {discipline:prior.discipline||p.discipline||'',topic:prior.topic||p.topic||'',
  subtopic:prior.subtopic||p.subtopic||'',basis:'perfil_selecionado_revisar',status:'sugestao'};
}
function question(profileId){return byId.get(profileId)?.question||specs[0].question}
window.BancoMestreCalibradoresV110=Object.freeze({
 profiles,detectDocument,analyzeWords,suggestSubject,question,
 validProfile:id=>byId.has(id),getProfile:id=>profiles.find(p=>p.id===id)||profiles[0]
});
})();


;
/* 29 assets/v114_ia_lei_seca.js */
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


;
/* 30 assets/v114_cf_artigo1.js */
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


;
/* 31 assets/v121_relacoes_normativas.js */
/* V121 — articulação normativa com proveniência verificável.
 * Não é um LLM. Reconhece literalmente trechos dos arts. 2º–4º da CF/88,
 * vincula incisos ao caput e extrai remissões entre artigos. Mantém a camada
 * V114 (art. 1º) e a IA lexical como apoio, jamais como decisora de cor.
 * Sem acesso a grifos privados, Drive, localStorage ou qualquer rede.
 */
(function(){
'use strict';
if(window.BancoMestreRelacoesNormativasV121)return;
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
function legalReferences(flat,tokens,heads,lawKey='CF88'){
 const links=[];
 for(let i=0;i<flat.length-1;i++){
  if(flat[i].word!=='art'||!/^\d+(?:º|°)?$/u.test(flat[i+1].word))continue;
  if(heads.some(h=>h.begin===i))continue;
  const num=parseInt(flat[i+1].word,10);
  const prefix=flat.slice(Math.max(0,i-5),i).map(t=>t.word).join(' ');
  const r=/(?:nos termos|na forma|conforme|previsto|disposto|observado|referido|definido)/u.test(prefix);
  if(!r)continue;
  links.push({type:'remissao_expressa',target:lawKey+':art'+num,
   text:tokens.slice(flat[i].index,flat[i+1].index+1).map(x=>x.text).join(' '),
   token_start:flat[i].index,token_end:flat[i+1].index});
 }
 return links;
}

const REGISTRY=Object.freeze({
 cf88:'CF88',licitacoes:'LEI14133',improbidade:'LEI8429',
 estatuto:'LEI10257',servidores:'LEI8112',processo:'LEI9784',
 lgpd:'LEI13709',lai:'LEI12527',lrf:'LC101',lbi:'LEI13146',
 pnma:'LEI6938',lc95:'LC95'
});
function inspectDocument(tokens,profileId='geral'){
 const code=REGISTRY[profileId];
 const empty={profile:profileId,document_key:code||null,
  verified_source:false,articles:[],devices:[],references:[],
  warning:'A associação à lei depende do perfil selecionado; vigência e edição do PDF não foram cotejadas.'};
 if(!code||!Array.isArray(tokens)||!tokens.length)return empty;
 const flat=flatten(tokens),headings=headers(flat,tokens),devices=[],articleKeys=[];
 const refs=legalReferences(flat,tokens,headings,code);
 let art=null,paragraph=null,inciso=null;
 const headerAt=new Map(headings.map(h=>[h.start,h]));
 const roman=/^(?:i|ii|iii|iv|v|vi|vii|viii|ix|x|xi|xii|xiii|xiv|xv|xvi|xvii|xviii|xix|xx)$/iu;
 for(let i=0;i<tokens.length;i++){
  if(headerAt.has(i)){
   const head=headerAt.get(i);
   art=code+':art'+head.num;paragraph=null;inciso=null;
   articleKeys.push({id:art,number:head.num,token_start:i});
   devices.push({type:'artigo',id:art,token_start:i,parent:code,verified_literal:false});
   continue;
  }
  if(!art)continue;
  const raw=String(tokens[i].text||'').trim();
  const next=String(tokens[i+1]?.text||'').trim();
  if(normalize(raw)==='paragrafo'&&lex(next)[0]==='unico'){
   paragraph=art+':p-unico';inciso=null;
   devices.push({type:'paragrafo',id:paragraph,token_start:i,parent:art,verified_literal:false});
   continue;
  }
  if(/^§(?:\d+(?:[º°])?)?$/u.test(raw)){
   const numeral=(raw.match(/\d+/)||next.match(/^\d+/u)||[])[0];
   if(numeral){
    paragraph=art+':p'+numeral;inciso=null;
    devices.push({type:'paragrafo',id:paragraph,token_start:i,parent:art,verified_literal:false});
   }
   continue;
  }
  const marker=raw.match(/^(I|II|III|IV|V|VI|VII|VIII|IX|X|XI|XII|XIII|XIV|XV|XVI|XVII|XVIII|XIX|XX)[.)\-–—]?$/iu);
  const newline=i>0&&tokens[i].line!=null&&tokens[i-1].line!=null&&
   tokens[i].line!==tokens[i-1].line;
  const punctuation=/[.)\-–—]$/u.test(raw)||/^[-–—]$/u.test(next);
  if(marker&&roman.test(marker[1])&&(punctuation||newline)){
   inciso=(paragraph||art)+':inc'+marker[1].toUpperCase();
   devices.push({type:'inciso',id:inciso,token_start:i,parent:paragraph||art,
    verified_literal:false});
   continue;
  }
  if(/^[a-z][)]$/u.test(raw)){
   devices.push({type:'alinea',id:(inciso||paragraph||art)+':al'+raw[0],
    token_start:i,parent:inciso||paragraph||art,verified_literal:false});
  }
 }
 return {...empty,articles:articleKeys,devices,references:refs};
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
  source_url:SOURCE,document_structure:inspectDocument(tokens,profileId),model:'literal-structure-graph-v120'};
}
function analyzeWords(tokens,profileId='geral'){
 const general=previous.analyzeWords(tokens,profileId);
 const scan=inspect(tokens,profileId);
 if(!scan.recognized){
  const structure=inspectDocument(tokens,profileId);
  return structure.articles.length||structure.references.length?
   {...general,legal_structure:{...structure,automatic_span_count:0}}:general;
 }
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
   source_url:SOURCE,document_structure:scan.document_structure,
   automatic_span_count:scan.segments.length},
  coverage:tokens.length?scannedCoverage/tokens.length:0,
  structural_evidence:'Texto constitucional e articulação dos arts. 2º–4º'};
}
window.BancoMestreCalibradoresV110=Object.freeze({...previous,analyzeWords});
window.BancoMestreRelacoesNormativasV121=Object.freeze({
 inspect,sourceUrl:SOURCE,version:'V121-CF-ART2-4',supportedArticles:[2,3,4],
 legalReferences,inspectDocument,registry:REGISTRY
});
})();


;
/* 32 assets/v124_remissoes.js */
/* V124 — resolucao conservadora de remissoes legais, SEM alterar grifos.
 * No browser, no network, no storage, no access to user annotations.
 * An internal reference without an explicit target stays unresolved.
 * This layer wraps V121; it never classifies colors or interprets legal validity.
 */
(function(){
'use strict';
if(window.BancoMestreReferenciasV124)return;
const previous=window.BancoMestreCalibradoresV110;
const structural=window.BancoMestreRelacoesNormativasV121;
if(!previous?.analyzeWords||!structural?.inspectDocument)return;
const LAW_KEYS=Object.freeze({
 cf88:'CF88',licitacoes:'LEI14133',improbidade:'LEI8429',
 estatuto:'LEI10257',servidores:'LEI8112',processo:'LEI9784',
 lgpd:'LEI13709',lai:'LEI12527',lrf:'LC101',lbi:'LEI13146',
 pnma:'LEI6938',lc95:'LC95'
});
const KNOWN=Object.freeze({
 '14133':'LEI14133','8429':'LEI8429','10257':'LEI10257',
 '8112':'LEI8112','9784':'LEI9784','13709':'LEI13709',
 '12527':'LEI12527','13146':'LEI13146','6938':'LEI6938'
});
const COMPLEMENTARY=Object.freeze({'95':'LC95','101':'LC101'});
const normal=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/gu,'')
 .toLowerCase().replace(/[º°]/gu,'').replace(/[\u2010-\u2015]/gu,'-');
function flatten(tokens){
 const output=[];
 tokens.forEach((t,index)=>{
  const words=normal(t.text).match(/[\p{L}\p{N}]+/gu)||[];
  for(const value of words)output.push({word:value,index});
 });
 return output;
}
const supportsRel=/\b(?:conforme|previsto|prevista|disposto|disposta|referido|referida|observado|observada|observa|observara|observarao|observar|segundo|citado|citada|referencia|remete|aplica|aplicar)\b/u;
function relationContext(flat,i){
 const before=flat.slice(Math.max(0,i-9),i).map(x=>x.word).join(' ');
 return supportsRel.test(before)||/\b(?:nos termos|na forma|de acordo|em cumprimento|em conformidade|em observancia)\b/u.test(before);
}
function lawsInPhrase(phrase){
 const found=[];
 const mark=(key,evidence)=>{if(!found.some(x=>x.key===key&&x.evidence===evidence))found.push({key,evidence})};
 // A later mention of "a Constituição" or "a Lei" is NOT an attribution
 // to the cited article. Only an attached prepositional expression counts.
 const attachment='(?:da|do|na|no|pela|pelo|desta|deste)';
 const constitution=new RegExp('\\b(?:da|do|na|no|pela|pelo)'+
  '\\s+(?:constituicao\\s+(?:da\\s+republica|federal)|cf(?:\\s*88)?)\\b','gu');
 // "desta Constituição" or "da Constituição" does not prove it is the
 // Brazilian federal constitution. It may be a state or foreign constitution.
 if(constitution.test(phrase))mark('CF88','referencia expressa a CF/88');
 const pattern=new RegExp('\\b'+attachment+
  '\\s+(?:lei\\s+complementar|lc|lei)\\s+(?:n(?:o|umero)?\\s+)?'+
  '(\\d{1,6})(?:\\s+(\\d{3}))?(?:\\s+(\\d{4}))?\\b','gu');
 let match;
 while((match=pattern.exec(phrase))){
  const head=match[0],parts=[match[1],match[2]].filter(Boolean),number=parts.join('');
  const complementary=/\b(?:lei complementar|lc)\b/u.test(head);
  const code=(complementary?COMPLEMENTARY:KNOWN)[number];
  mark(code||null,(complementary?'lei complementar ':'lei ')+number);
 }
 return found;
}
function afterReference(flat,i,tokens){
 // A law cited in a later sentence must never be used to assign this
 // article. A bare "art. 5º." has no explicit target.
 let upper=Math.min(flat.length,i+24);
 for(let j=i+2;j<upper;j++){
  if(flat[j].word==='art'&&/^\d+$/u.test(flat[j+1]?.word||'')){
   upper=j;break;
  }
  if(flat[j].index===flat[j-1].index)continue;
  const raw=String(tokens[flat[j-1].index]?.text||'').trim();
  // "Lei n. 9.784" uses an abbreviation, not a sentence boundary.
  const abbreviation=/^(?:n|no|nr|art)\.$/iu.test(raw);
  if(!abbreviation&&/[;.!?]$/u.test(raw)){
   upper=j;break;
  }
 }
 return flat.slice(i+2,upper).map(x=>x.word).join(' ');
}
function legalReference(tokens,profileId='geral'){
 if(!Array.isArray(tokens)||!tokens.length)return [];
 const flat=flatten(tokens);
 const active=LAW_KEYS[profileId]||null;
 const structure=structural.inspectDocument(tokens,profileId);
 const headings=new Set((structure.devices||[]).filter(x=>x.type==='artigo').map(x=>x.token_start));
 const out=[];
 let activeArticle=null,headPosition=-1;
 const headingsSorted=(structure.articles||[]).map(x=>({index:x.token_start,id:x.id})).sort((a,b)=>a.index-b.index);
 for(let i=0;i<flat.length-1;i++){
  if(flat[i].word!=='art'||!/^\d+$/u.test(flat[i+1].word))continue;
  const number=Number(flat[i+1].word);
  if(!Number.isSafeInteger(number)||number<1||number>999999)continue;
  const begin=flat[i].index,end=flat[i+1].index;
  if(headings.has(begin))continue;
  const prefixOK=relationContext(flat,i);
  const following=afterReference(flat,i,tokens);
  const evidence=lawsInPhrase(following);
  const selfRef=/\b(?:desta|deste|da presente|do presente|dessa|desse)\s+(?:lei|diploma|codigo|constituicao)\b/u.test(following);
  const explicit=!!evidence.length||selfRef;
  if(!prefixOK&&!explicit)continue;
  let target=null,resolution='unresolved',basis='Sem lei de destino expressa',suggested_target=null;
  if(evidence.length>1){
   resolution='ambiguous';basis='Mais de uma norma mencionada no contexto da remissao';
  }else if(evidence.length===1){
   const item=evidence[0];
   if(item.key){target=item.key+':art'+number;resolution='explicit_law';basis=item.evidence}
   else {resolution='unsupported_law';basis=item.evidence+' fora do catalogo reconhecido'}
  }else if(selfRef&&active){
   // "desta Lei" is internally explicit but the selected PDF profile may be wrong.
   // Do not certify a reference to an unverified document identity.
   suggested_target=active+':art'+number;resolution='profile_dependent_internal';
   basis='Referência interna expressa; identidade da lei depende do perfil escolhido e não foi cotejada';
  }else{
   suggested_target=active?active+':art'+number:null;
   resolution=selfRef?'document_unknown':'contextual_unverified';
   basis=selfRef?'Sem perfil selecionado para referencia interna':'A norma citada nao foi identificada explicitamente';
  }
  for(const h of headingsSorted)if(h.index<begin&&h.index>=headPosition){
   headPosition=h.index;activeArticle=h.id;
  }
  const text=tokens.slice(begin,end+1).map(t=>String(t.text||'')).join(' ');
  out.push({type:'remissao_expressa',text,token_start:begin,token_end:end,
   number,source_article:activeArticle,target,resolution,basis,
   suggested_target,verified_source:false,profile:profileId});
 }
 return out;
}
function analyzeWords(tokens,profileId='geral'){
 const r=previous.analyzeWords(tokens,profileId);
 const refs=legalReference(tokens,profileId);
 if(!refs.length)return r;
 const original=r.legal_structure||{};
 const nest=original.document_structure||null;
 return {...r,legal_structure:{
  ...original,
  references:refs,document_structure:nest?{...nest,references:refs}:undefined,
  reference_policy:'v122-explicit-or-unresolved',verified_source:false
 }};
}
window.BancoMestreCalibradoresV110=Object.freeze({...previous,analyzeWords});
window.BancoMestreReferenciasV124=Object.freeze({
 legalReference,version:'V124-REFERENCES-EXPLICIT',policy:'do-not-assume-cited-law',
 keys:LAW_KEYS
});
})();

;
/* 33 assets/v111_grifador.js */
/* V111 — count suppressed/mismatched legal nuclei and preserve manual fallback. */
/* V110 — selectable legal calibration per PDF; 4 colors and explicit manual controls preserved. */
/* V109 — classificação estrita: só alta confiança automática; dúvidas ficam manuais. */
/* V108 — classificação insegura: escolha manual de cor ou nova seleção. */
/* V104 — classificação automática salva sem abrir repetidamente o menu flutuante. */
/* V099 — Lei seca: 4 cores canônicas, sem modificar os grifos V095/V097 salvos. */
/* V097 — group one multicolor selection logically while preserving all its colors. */
/* V095 — paleta fixa, fluxo original V070 e seletor preciso V089 preservados. */
/* V070: grifador rápido com classificação por palavra/trecho e sugestão de nota. */
/* V069: seleção e menu de grifos estabilizados. */
/* Banco Mestre V068 — grifador completo inspirado no fluxo funcional da Bússola Highlights. */
(function BancoMestreGrifadorV068(){
'use strict';
const $=id=>document.getElementById(id);
const dlg=$('pdfDialog'),wrap=$('pdfPageWrap'),pageCanvas=$('pdfLocalCanvas'),tools=$('pdfLocalTools'),marker=$('pdfMarker');
const api=()=>window.BancoMestrePDFV042;
if(!dlg||!wrap||!pageCanvas||!marker||!tools||$('bm068SelectTool'))return;
const names=[
 {kind:'regra',color:'#FDE68A',label:'Amarelo · O quê? Regra e proibição'},
 {kind:'agente',color:'#BBF7D0',label:'Verde · Quem? Sujeito e competência'},
 {kind:'condicao',color:'#BAE6FD',label:'Azul · Em que condição? Prazo e número'},
 {kind:'excecao',color:'#FECDD3',label:'Rosa · Salvo o quê? Exceção'}
];
const KEY_COLOR='BM_PDF_TEXT_COLOR_V061',KEY_QUICK='BM068_GRIFO_RAPIDO',KEY_HOTKEYS='BM068_HOTKEYS',KEY_LABELS='BM068_COLOR_LABELS',KEY_SMART='BM070_CLASSIFICACAO_RAPIDA',META='BM062_GRIFOS_META';
const allowed=['highlight','underline','double-underline','strike','conceal'];
let activeLayer=null,serial=0,context=null,activeId=null,reselection=null,popupEnabled=true,lastAt={x:240,y:120};
let mutationVersion=0,pendingUndo=null;
window.addEventListener('bm-pdf-mark-changed',()=>{mutationVersion++});
let quick=false,smart=true,lastColor='#FDE68A',lastStyle='highlight',toastTimer=0,keys={quick:'Alt+Q',panel:'Alt+W'};
try{quick=localStorage.getItem(KEY_QUICK)==='1';smart=localStorage.getItem(KEY_SMART)!=='0';lastColor=localStorage.getItem(KEY_COLOR)||lastColor;
 const from=JSON.parse(localStorage.getItem(KEY_HOTKEYS)||'null');
 if(from?.quick&&from?.panel)keys=from;
}catch{}
const goodColor=x=>/^#[0-9a-f]{6}$/i.test(x||'');
if(!goodColor(lastColor)||!names.some(x=>x.color.toLowerCase()===lastColor.toLowerCase()))lastColor='#FDE68A';
// Nomes da paleta V095 fixos, sem alterar registros antigos.
const selectBtn=document.createElement('button');selectBtn.id='bm068SelectTool';selectBtn.type='button';
selectBtn.textContent='🖍 Grifar palavras';selectBtn.title='Selecionar texto diretamente no PDF';
selectBtn.setAttribute('aria-pressed','false');marker.parentNode.insertBefore(selectBtn,marker);
selectBtn.onclick=()=>api()?.selectTextMode?.();
const topBar=document.createElement('div');topBar.id='bm068QuickBar';topBar.className='bm068-reader-shortcuts';
topBar.innerHTML='<div class="bm068-brand"><span class="bm068-symbol">◈</span><strong>Grifador</strong><small>texto + notas</small></div>'+
 '<div class="bm068-reader-actions"><button type="button" id="bm068QuickToggle">Rápido</button>'+
 '<button type="button" id="bm068OpenPanel">☰ Meus grifos</button>'+
 '<button type="button" id="bm068Settings">⚙ Atalhos</button>'+
 '<button type="button" id="bm070Smart" aria-pressed="true" title="Sugerir cores para palavras e trechos separados">◈ Cores por trecho</button></div>'+
 '<small id="bm068ModeHint" role="status">Arraste para selecionar palavras</small>';
tools.prepend(topBar);
const popup=document.createElement('div');popup.id='bm068Palette';popup.hidden=true;
popup.setAttribute('role','group');popup.setAttribute('aria-label','Ferramentas do trecho selecionado');
popup.innerHTML='<div class="bm068-floating-head"><span id="bm068CurrentText">Grifo</span><button id="bm068FloatClose" type="button" title="Fechar menu" aria-label="Fechar menu">×</button></div>'+
 '<div id="bm068Colors" class="bm068-colors" aria-label="Cores de grifo"></div>'+
 '<div class="bm068-commands"><button id="bm068Apply" type="button" hidden>Grifar selecionado</button>'+
 '<button id="bm070ApplyAuto" type="button" hidden>◈ Aplicar cores sugeridas</button>'+
 '<button id="bm068Underline" type="button" title="Sublinhar trecho">U̲</button>'+
 '<button id="bm068DoubleUnderline" type="button" title="Sublinhar duas vezes">U̳</button>'+
 '<button id="bm068Strike" type="button" title="Tachar trecho">S̶</button>'+
 '<button id="bm068Hide" type="button" title="Ocultar texto na leitura">⋯ Ocultar</button>'+
 '<button id="bm068Note" type="button">✎ Nota</button>'+
 '<button id="bm068Cards" type="button">▣ Cartão</button>'+
 '<button id="bm068Copy" type="button">⧉ Copiar</button>'+
 '<button id="bm068Resize" type="button">↔ Trecho</button>'+
 '<button id="bm068Delete" type="button">⌫ Excluir</button></div>';
const fallback=document.createElement('div');fallback.id='bm108ManualFallback';
fallback.hidden=true;fallback.setAttribute('role','status');
fallback.innerHTML='<strong>Sem núcleo reconhecido</strong>'+
 '<p>Não foi possível classificar esse trecho com segurança. Escolha uma cor acima e toque em Grifar seleção, ou tente selecionar somente a expressão essencial.</p>'+
 '<button type="button" id="bm108RechooseSelection">Refazer seleção</button>';
popup.append(fallback);
dlg.append(popup);
const editor=document.createElement('section');editor.id='bm068Editor';editor.hidden=true;
editor.setAttribute('role','dialog');editor.setAttribute('aria-modal','true');editor.setAttribute('aria-label','Anotações do trecho selecionado');
editor.innerHTML='<div class="bm068-editor-card"><header><div><strong>✎ Notas do grifo</strong><small id="bm068NoteExcerpt"></small></div>'+
 '<button type="button" id="bm068EditorClose" aria-label="Fechar editor de notas">×</button></header>'+
 '<form id="bm068Form"><p id="bm070Suggestion" class="bm070-suggestion" hidden></p><div class="bm068-form-grid">'+
 '<label class="bm068-wide">Nota rápida<textarea name="note" rows="2" maxlength="12000"></textarea></label>'+
 '<label>Disciplina<input name="discipline" maxlength="120"></label>'+
 '<label>Assunto<input name="topic" maxlength="140"></label>'+
 '<label>Subassunto<input name="subtopic" maxlength="140"></label>'+
 '<label>Tags (vírgulas)<input name="tags" maxlength="600"></label>'+
 '<label>IDs de flashcards existentes<input name="cards" placeholder="CARD-0028, CARD-0078"></label>'+
 '<label class="bm068-wide">Explicação<textarea name="explicacao" rows="2"></textarea></label>'+
 '<label class="bm068-wide">Dúvida<textarea name="duvida" rows="2"></textarea></label>'+
 '<label class="bm068-wide">Correção<textarea name="correcao" rows="2"></textarea></label>'+
 '<label class="bm068-wide">Macete<textarea name="macete" rows="2"></textarea></label>'+
 '<label class="bm068-wide">Pegadinha de prova<textarea name="pegadinha" rows="2"></textarea></label>'+
 '<label class="bm068-wide">Fundamento normativo<textarea name="fundamento" rows="2"></textarea></label>'+
 '<label class="bm068-wide">Fonte complementar<textarea name="fonte" rows="2"></textarea></label>'+
 '</div><div class="bm068-editor-footer"><label><input type="checkbox" name="favorite"> ★ Favorito</label>'+
 '<button type="button" id="bm068Cancel">Cancelar</button><button type="submit" class="bm068-primary">Salvar nota</button></div></form></div>';
dlg.append(editor);
const settings=document.createElement('section');settings.id='bm068SettingsBox';settings.hidden=true;settings.setAttribute('role','dialog');
settings.innerHTML='<div class="bm068-settings-card"><strong>⚙ Atalhos de teclado</strong><p>Configure atalhos sem conflito com o navegador. Use Alt+letra ou Alt+Shift+letra.</p>'+
 '<label>Marcador rápido<input id="bm068KeyQuick" type="text" maxlength="18" value="Alt+Q"></label>'+
 '<label>Painel de grifos<input id="bm068KeyPanel" type="text" maxlength="18" value="Alt+W"></label>'+
 '<button type="button" id="bm068EditColors">Editar significados das cores</button><p id="bm068SettingsMessage" role="status"></p><div class="bm068-settings-actions"><button type="button" id="bm068SettingsCancel">Cancelar</button><button type="button" id="bm068SettingsSave">Salvar</button></div></div>';
dlg.append(settings);
const toast=document.createElement('div');toast.id='bm068Toast';toast.hidden=true;
toast.innerHTML='<span id="bm068ToastMessage"></span><button id="bm068ToastUndo" type="button" hidden>Desfazer</button>';
dlg.append(toast);
function status(msg,withUndo=false){
 toast.hidden=false;$('bm068ToastMessage').textContent=msg;$('bm068ToastUndo').hidden=!withUndo;
 clearTimeout(toastTimer);toastTimer=setTimeout(()=>toast.hidden=true,withUndo?8500:4000);
}
$('bm068ToastUndo').onclick=()=>{
 const u=pendingUndo;
 pendingUndo=null;toast.hidden=true;
 const a=api();
 if(!u||!a?.editing||a.currentId!==u.docId||a.sourceHash!==u.hash||a.currentPage!==u.page||
   mutationVersion!==u.version||a.currentMarks?.some(m=>m.id===u.id)||!a.canUndo){
  status('Não é seguro desfazer: outra edição ou mudança de página ocorreu.');return;
 }
 a.undoLast();closeMenu();
 status('Última exclusão desfeita.');
};
function safeRead(k){try{return localStorage.getItem(k)}catch{return null}}
function safeWrite(k,v){try{localStorage.setItem(k,v);return true}catch{return false}}
function colorName(color){return names.find(x=>x.color.toLowerCase()===String(color).toLowerCase())?.label||'Personalizado'}
function current(){return api()?.currentMarks?.find(m=>m?.type==='text_highlight'&&m.id===activeId)||null}
function inSelect(){return !!(api()?.editing&&api()?.currentTool==='select'&&dlg.open)}
function closeMenu(){popup.hidden=true;activeId=null}
function closeEditor(){editor.hidden=true}
function updateMode(){
 const active=inSelect();
 dlg.classList.toggle('bm-v061-text-mode',active);
 dlg.classList.toggle('bm068-selecting',active);
 selectBtn.setAttribute('aria-pressed',String(active));
 $('bm068QuickToggle').setAttribute('aria-pressed',String(quick));
 $('bm070Smart').setAttribute('aria-pressed',String(smart));
 $('bm070Smart').textContent=smart?'◈ Sugestões por trecho: ligadas':'◈ Sugestões por trecho: desligadas';
 $('bm068QuickToggle').textContent=quick?'⚡ Rápido ligado':'⚡ Rápido desligado';
 $('bm068ModeHint').textContent=!active?'Ative Grifar palavras para selecionar texto':
  reselection?'Selecione outro trecho para atualizar o grifo existente':
  quick?(smart?'Arraste o trecho: sugestão das 4 cores por palavra ou frase':'Arraste: use a cor escolhida sem classificação'):'Selecione o texto e escolha a cor ou a sugestão';
 if(!active)closeMenu();
}
window.addEventListener('bm-pdf-tool-change',updateMode);
$('bm068QuickToggle').onclick=()=>{quick=!quick;safeWrite(KEY_QUICK,quick?'1':'0');updateMode();status(quick?'Marcador rápido ativado':'Marcador rápido desativado')};
$('bm070Smart').onclick=()=>{smart=!smart;safeWrite(KEY_SMART,smart?'1':'0');updateMode();
 status(smart?'Cores por trecho ligadas. Classificações e notas serão sugeridas.':'Classificação automática desligada. Nenhum grifo anterior foi alterado.')};
$('bm068OpenPanel').onclick=()=>{const panel=$('bm064TogglePanel');if(panel)panel.click();else status('O painel de grifos ainda não carregou')};
$('bm068Settings').onclick=()=>{$('bm068KeyQuick').value=keys.quick;$('bm068KeyPanel').value=keys.panel;settings.hidden=false;$('bm068KeyQuick').focus()};
$('bm068SettingsCancel').onclick=()=>settings.hidden=true;
$('bm068EditColors').onclick=()=>{
 const colorLabels={};try{Object.assign(colorLabels,JSON.parse(safeRead(KEY_LABELS)||'{}'))}catch{}
 for(const item of names){
  const chosen=prompt('Nome de estudo para a cor '+item.color+':',item.label);
  if(chosen===null)break;
  if(chosen.trim()){
   item.label=chosen.trim().slice(0,45);colorLabels[item.color]=item.label;
  }
 }
 if(safeWrite(KEY_LABELS,JSON.stringify(colorLabels))){
  for(const b of $('bm068Colors').querySelectorAll('button[data-color]')){
   const item=names.find(x=>x.color===b.dataset.color);
   if(item){b.title=item.label;b.setAttribute('aria-label',item.label+' ('+item.color+')')}
  }
  $('bm068SettingsMessage').textContent='Legendas de cores salvas neste navegador.';
 }else $('bm068SettingsMessage').textContent='Não foi possível salvar a legenda das cores.';
};
function validKey(s){return /^Alt\+(?:Shift\+)?[A-Z]$/.test(s)&&!['Alt+F','Alt+E','Alt+D','Alt+H','Alt+L','Alt+S','Alt+P','Alt+Shift+F'].includes(s)}
$('bm068SettingsSave').onclick=()=>{
 const a=$('bm068KeyQuick').value.trim().toUpperCase().replace('ALT+SHIFT+','Alt+Shift+').replace('ALT+','Alt+');
 const b=$('bm068KeyPanel').value.trim().toUpperCase().replace('ALT+SHIFT+','Alt+Shift+').replace('ALT+','Alt+');
 if(!validKey(a)||!validKey(b)||a===b){$('bm068SettingsMessage').textContent='Escolha dois atalhos diferentes, no formato Alt+Q ou Alt+Shift+Q, sem conflitos comuns do navegador.';return}
 keys={quick:a,panel:b};safeWrite(KEY_HOTKEYS,JSON.stringify(keys));settings.hidden=true;status('Atalhos personalizados salvos neste navegador');
};
function findOnPage(x,y){
 const marks=api()?.currentMarks||[],pt=wrap.getBoundingClientRect();
 if(!pt.width||!pt.height)return null;
 const px=(x-pt.left)/pt.width,py=(y-pt.top)/pt.height;
 return marks.slice().reverse().find(m=>m.type==='text_highlight'&&Array.isArray(m.rects)&&m.rects.some(b=>Array.isArray(b)&&b.length===4&&px>=b[0]-.003&&px<=b[2]+.003&&py>=b[1]-.005&&py<=b[3]+.005));
}
function popupAt(x,y){
 popup.hidden=false;const bounds=dlg.getBoundingClientRect();
 const width=popup.offsetWidth||356,height=popup.offsetHeight||170;
 popup.style.left=Math.round(Math.max(8,Math.min(bounds.width-width-8,x-bounds.left-30)))+'px';
 popup.style.top=Math.round(Math.max(49,Math.min(bounds.height-height-8,y-bounds.top+9)))+'px';
}
function show(mark,x,y,pending=false){
 fallback.hidden=true;
 $('bm068Apply').textContent='Grifar seleção';
 activeId=mark?.id||null;lastAt={x,y};
 $('bm068CurrentText').textContent=mark?.text?.slice(0,85)||'Seleção de texto';
 $('bm068Apply').hidden=!pending;
 $('bm070ApplyAuto').hidden=!pending||!window.BancoMestreClassificadorV070;
 $('bm068Resize').disabled=!mark?.id;$('bm068Delete').disabled=!mark?.id;
 $('bm068Hide').textContent=mark?.style==='conceal'?'◉ Mostrar':'⋯ Ocultar';
 $('bm068Cards').disabled=!mark?.id;$('bm068Note').disabled=!mark?.id;
 for(const b of $('bm068Colors').querySelectorAll('button[data-color]')){
  b.setAttribute('aria-pressed',String((mark?.color||lastColor).toLowerCase()===b.dataset.color));
 }
 popupAt(x,y);
}
for(const item of names){
 const b=document.createElement('button');b.type='button';b.className='bm068-swatch';
 b.dataset.color=item.color;b.style.setProperty('--swatch',item.color);
 b.setAttribute('aria-label',item.label+' ('+item.color+')');b.title=item.label;
 b.innerHTML='<span aria-hidden="true">✓</span>';
 b.addEventListener('click',()=>{
  lastColor=item.color;lastStyle='highlight';safeWrite(KEY_COLOR,lastColor);
  if(activeId){
   if(api()?.updateTextHighlight(activeId,{color:lastColor,color_label:item.label,style:'highlight',classification_kind:item.kind,classification_status:'confirmada'}))status('Cor: '+item.label);
  }else if(!quick)commitPending(lastColor,'highlight',false);
  updateMode();
 });
 $('bm068Colors').append(b);
}
// Quatro cores apenas; nenhuma quinta cor livre no novo menu.
function applyStyle(style){
 if(!allowed.includes(style))return;
 lastStyle=style;
 if(activeId){if(api()?.updateTextHighlight(activeId,{style}))status('Estilo atualizado')}
 else if(!quick)commitPending(lastColor,style,false);
}
$('bm068Underline').onclick=()=>applyStyle('underline');
$('bm068DoubleUnderline').onclick=()=>applyStyle('double-underline');
$('bm068Strike').onclick=()=>applyStyle('strike');
$('bm068Hide').onclick=()=>applyStyle(current()?.style==='conceal'?'highlight':'conceal');
$('bm068FloatClose').onclick=closeMenu;
let pending=null;
function commitPending(color=lastColor,style=lastStyle,auto=smart){
 if(!pending||!matches(pending.context)){status('Seleção expirada. Selecione o texto novamente.');return}
 const original=pending;pending=null;
 const classifier=window.BancoMestreClassificadorV070;
 if(auto&&classifier&&Array.isArray(original.words)&&original.words.length){
  const calibrator=window.BancoMestreCalibradoresV110;
  const selectedProfile=window.BancoMestreCalibradorUIV110?.getActiveProfileId?.()||'geral';
  const audit=calibrator?.analyzeWords?
   calibrator.analyzeWords(original.words,selectedProfile):
   (typeof classifier.analyzeWords==='function'?classifier.analyzeWords(original.words):null);
  const suggestions=audit?.segments||classifier.classifyWords(original.words,{fallbackColor:color});
  // V109: one uncertain subject word must not become an automatic assertion.
  const pieces=suggestions.filter(x=>x.confidence==='alta'&&!x.requires_review);
  const uncertain=new Set([
   ...suggestions.filter(x=>x.confidence!=='alta'||x.requires_review),
   ...(audit?.review||[])
  ].map(x=>String(x.kind||'')+'|'+String(x.text||x.reason||''))).size;
  if(pieces.length){
   const docName=api()?.currentDoc?.title||api()?.currentDoc?.name||'';
   const groupId=pieces.length>1?'BM-GRP-'+(globalThis.crypto?.randomUUID?.()||
    Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,13)):null;
   const entries=pieces.map((x,i)=>{
    const subject=calibrator?.suggestSubject?
     calibrator.suggestSubject(x.text,docName,selectedProfile):
     classifier.suggestSubject(x.text,docName);
    const pedagogic=calibrator?.question&&selectedProfile!=='geral'?
     ' Pergunta de revisão: '+calibrator.question(selectedProfile):'';
    return {...original,...x,style,color:x.color,color_label:x.color_label,
     anchor:x.anchor||original.anchor,
     segment_index:i+1,segment_total:pieces.length,
     selection_group_id:groupId,
     selection_group_text:groupId&&i===0?original.text:'',
     subject_suggestion:subject,
     classification_confidence:x.confidence,classification_evidence:x.evidence||'',
     calibration_profile:selectedProfile,
     calibration_evidence:String(x.calibration_evidence||x.evidence||'').slice(0,220),
     note_suggestion:(classifier.suggestNote(x).text+pedagogic).slice(0,1400),
     classification_status:'sugestao'};
   });
   const res=api()?.addTextHighlights?.(entries);
   if(res){
    const last=res.marks?.at(-1)||api()?.currentMarks?.find(x=>res.duplicates?.includes(x.id));
    // V104: saving a classified highlight must NOT reopen the floating editor.
    // Manual note/cor editing remains accessible by tapping the saved mark.
    if(last)closeMenu();
    status((res.marks?.length?
     res.marks.length+' núcleo(s) de alta confiança grifado(s). Confira o painel.':
     'Os núcleos seguros já estavam grifados; nenhum duplicado criado.')+
     (uncertain?' '+uncertain+' sugestão(ões) incerta(s) NÃO marcadas: revise manualmente.':''));
    return;
   }
   // Rejeitar em vez de gravar parcialmente se algum retângulo for inválido.
   status('Não foi possível salvar os trechos. Nenhum novo grifo foi incorporado.');return;
  }
  // Sem evidência textual suficiente: nunca transformar um parágrafo inteiro
  // em amarelo automaticamente. O ESTUDANTE escolhe o núcleo e confirma.
  pending=original;
  show({text:original.text,color:lastColor},lastAt.x,lastAt.y,true);
  fallback.hidden=false;
  const fbHeading=fallback.querySelector('strong'),fbText=fallback.querySelector('p');
  if(fbHeading)fbHeading.textContent=uncertain?
   'Classificação insegura — revisão manual':'Nenhum núcleo reconhecido';
  if(fbText)fbText.textContent=uncertain?
   uncertain+' expressão(ões) parecem relevantes, mas sem evidência suficiente para grifar automaticamente. Escolha uma cor manualmente ou selecione um trecho menor.':
   'Não há evidência suficiente para classificar. Use uma das quatro cores manualmente ou selecione somente a expressão essencial.';
  $('bm070ApplyAuto').hidden=true;
  $('bm068Apply').hidden=false;
  status(uncertain?'Classificação incerta: escolha manualmente a cor ou selecione trecho menor.':
   'Sem núcleo seguro: escolha manualmente uma cor ou selecione trecho menor.');
  return;
 }
 const profileId=window.BancoMestreCalibradorUIV110?.getActiveProfileId?.()||'geral';
 const chosen=names.find(x=>x.color.toLowerCase()===String(color).toLowerCase());
 const docTitle=api()?.currentDoc?.title||'';
 const subject=window.BancoMestreCalibradoresV110?.suggestSubject?.(original.text,docTitle,profileId)||
   classifier?.suggestSubject(original.text,docTitle);
 const mark=api().addTextHighlight({...original,color,style,color_label:colorName(color),
  subject_suggestion:subject,
  note_suggestion:classifier?.suggestNote({text:original.text,kind:chosen?.kind||null})?.text||'',
  classification_kind:chosen?.kind||'nao_classificado',classification_status:chosen?'confirmada':'sugestao',
  calibration_profile:profileId,calibration_evidence:'Cor escolhida manualmente pelo estudante'});
 if(mark){
   if(quick)closeMenu();else show(mark,lastAt.x,lastAt.y);
   status(mark.duplicate?'Este trecho já estava grifado.':'Grifo manual salvo; cor e nota podem ser revisadas.');
  }
 else status('Não foi possível salvar o grifo; confira o armazenamento.');
}
$('bm108RechooseSelection').onclick=()=>{
  pending=null;fallback.hidden=true;closeMenu();
  status('Selecione uma expressão menor, preservando negações, prazos e exceções.');
 };
 $('bm068Apply').onclick=()=>commitPending(lastColor,lastStyle,false);
$('bm070ApplyAuto').onclick=()=>commitPending(lastColor,lastStyle,true);
$('bm068Note').onclick=()=>{
 const mark=current();if(!mark){status('Selecione um grifo já salvo.');return}
 closeEditor();const form=$('bm068Form'),extra=mark.note_structured||{};
 const meta=readMeta(),d=meta[identity(mark)]||{},suggested=mark.subject_suggestion||{};
 const hint=$('bm070Suggestion');
 const needsColor=mark.classification_status!=='confirmada',
  needsSubject=!!suggested.topic&&!d.topic,
  needsNote=!!mark.note_suggestion&&!mark.note;
 hint.hidden=!(needsColor||needsSubject||needsNote);
 hint.textContent=hint.hidden?'':('REVISÃO NECESSÁRIA · '+
  [needsColor?'Cor sugerida':null,needsSubject?'Assunto sugerido':null,
   needsNote?'Nota pré-preenchida, ainda não confirmada':null].filter(Boolean).join(' • ')+
  '. Confira a fonte e clique em Salvar nota para aceitar suas alterações.');
 const read=(name,value)=>{form.elements[name].value=value||''};
 read('note',mark.note||mark.note_suggestion||'');
 read('discipline',d.discipline||suggested.discipline);
 read('topic',d.topic||suggested.topic);
 read('subtopic',d.subtopic||suggested.subtopic);
 read('tags',(mark.tags||[]).join(', ')||d.tags);
 read('cards',(mark.card_ids||[]).join(', '));
 for(const name of ['explicacao','duvida','correcao','macete','pegadinha','fundamento','fonte'])read(name,extra[name]);
 form.elements.favorite.checked=mark.favorite||!!d.favorite;
 $('bm068NoteExcerpt').textContent=mark.text.slice(0,155);
 editor.hidden=false;form.elements.note.focus();popup.hidden=true;
};
$('bm068EditorClose').onclick=closeEditor;$('bm068Cancel').onclick=closeEditor;
function identity(mark){return 'TXT:'+api().currentId+':'+api().sourceHash+':'+mark.id}
function readMeta(){try{const obj=JSON.parse(localStorage.getItem(META)||'{}');return obj&&typeof obj==='object'&&!Array.isArray(obj)?obj:{}}catch{return{}}}
$('bm068Form').onsubmit=e=>{
 e.preventDefault();
 const mark=current();if(!mark){status('O grifo foi alterado. Abra-o novamente.');return}
 const form=e.currentTarget,fields=form.elements;
 const raw=fields.cards.value.trim().toUpperCase().split(/[,;\s]+/).filter(Boolean);
 if(raw.some(id=>!/^(CARD-\d{4,}|PROP-IJUI-\d+)$/.test(id))){status('Confira os IDs de flashcards: CARD-0028, CARD-0078.');return}
 const structured={};
 for(const k of ['explicacao','duvida','correcao','macete','pegadinha','fundamento','fonte'])structured[k]=fields[k].value;
 const tags=fields.tags.value.split(',').map(x=>x.trim()).filter(Boolean);
 const patch={note:fields.note.value,note_structured:structured,tags,favorite:fields.favorite.checked,card_ids:raw,classification_status:'confirmada'};
 if(!api()?.updateTextHighlight(activeId,patch)){status('Falha ao gravar a nota. Seus dados anteriores foram mantidos.');return}
 const meta=readMeta(),id=identity(mark);
 meta[id]={...(meta[id]||{}),discipline:fields.discipline.value.trim().slice(0,120),
  topic:fields.topic.value.trim().slice(0,140),subtopic:fields.subtopic.value.trim().slice(0,140),
  tags:fields.tags.value.trim().slice(0,600),
  favorite:fields.favorite.checked};
 const ok=safeWrite(META,JSON.stringify(meta));
 editor.hidden=true;status(ok?'Nota estruturada salva; grifo atualizado':'Grifo salvo, mas a classificação da biblioteca não pôde ser atualizada');
 window.BancoMestreGrifosV062?.reload?.();window.BancoMestreV064PainelGrifos?.refresh?.();
};
$('bm068Cards').onclick=()=>$('bm068Note').click();
$('bm068Copy').onclick=async()=>{
 const text=current()?.text||pending?.text;
 if(!text)return;
 try{await navigator.clipboard.writeText(text);status('Trecho copiado')}catch{status('Não foi possível copiar o trecho')}
};
$('bm068Resize').onclick=()=>{
 if(!current())return;
 reselection={id:activeId,page:api().currentPage,documentId:api().currentId,hash:api().sourceHash};
 closeMenu();status('Selecione novamente o trecho completo no PDF para atualizar o mesmo grifo');updateMode();
};
$('bm068Delete').onclick=()=>{
 const id=activeId;if(!id)return;
 if(api()?.removeTextHighlight(id)){
   const a=api();
   pendingUndo={id,version:mutationVersion,docId:a.currentId,hash:a.sourceHash,page:a.currentPage};
   closeMenu();status('Grifo excluído. Use Desfazer para recuperar.',true);
  }
 else status('Falha ao excluir; grifo preservado');
};
function matches(c){return !!(c&&api()?.editing&&api().currentId===c.documentId&&api().currentPage===c.page&&api().sourceHash===c.sourceHash)}
function makeLayer(){
 const layer=document.createElement('div');layer.className='textLayer bm-v061-text-layer';
 layer.setAttribute('aria-label','Texto selecionável do PDF');
 return layer;
}
window.addEventListener('bm-pdf-active-page-rendered',async event=>{
 const c=event.detail,ticket=++serial;
 closeMenu();pending=null;reselection=null;
 if(activeLayer){activeLayer.remove();activeLayer=null}context=null;
 if(!matches(c))return;
 const layer=makeLayer();
 try{
  const page=await api().getCurrentPdfPage();
  if(ticket!==serial||!matches(c)||!page)return;
  const content=await page.getTextContent();
  if(ticket!==serial||!matches(c))return;
  if(!content.items?.some(item=>String(item.str||'').trim())){
   $('bm068ModeHint').textContent='PDF sem texto selecionável; use grifo livre ou OCR em etapa futura';return;
  }
  const viewport=page.getViewport({scale:c.viewportScale});
  layer.style.width=pageCanvas.style.width;layer.style.height=pageCanvas.style.height;
  layer.style.setProperty('--scale-factor',String(c.viewportScale));
  if(!window.pdfjsLib?.renderTextLayer)throw Error('Camada de texto PDF.js indisponível');
  const task=window.pdfjsLib.renderTextLayer({textContentSource:content,container:layer,viewport,textDivs:[]});
  await task.promise;
  if(ticket!==serial||!matches(c))return;
  wrap.append(layer);activeLayer=layer;context=c;updateMode();
 }catch(err){
  if(ticket===serial){$('bm068ModeHint').textContent='Não foi possível selecionar texto nesta página. O grifador livre continua disponível.';console.warn('V068 seleção',err)}
 }
});
const clamp=x=>Math.max(0,Math.min(1,x));
const inLayer=x=>!!(activeLayer&&x&&activeLayer.contains(x.nodeType===3?x.parentNode:x));
function rects(range){
 const area=wrap.getBoundingClientRect(),out=[];
 if(area.width<1||area.height<1)return [];
 for(const r of range.getClientRects()){
  const left=clamp((Math.max(area.left,r.left)-area.left)/area.width);
  const top=clamp((Math.max(area.top,r.top)-area.top)/area.height);
  const right=clamp((Math.min(area.right,r.right)-area.left)/area.width);
  const bottom=clamp((Math.min(area.bottom,r.bottom)-area.top)/area.height);
  if(right-left>.0007&&bottom-top>.001)out.push([left,top,right,bottom]);
 }
 out.sort((a,b)=>a[1]-b[1]||a[0]-b[0]);
 const joined=[];
 for(const b of out){
  const p=joined[joined.length-1];
  if(p&&Math.abs(p[1]-b[1])<.003&&Math.abs(p[3]-b[3])<.004&&b[0]<=p[2]+.003){p[2]=Math.max(p[2],b[2]);p[3]=Math.max(p[3],b[3])}
  else joined.push(b.slice());
 }
 return joined.slice(0,250);
}

function wordsFromRange(range){
 const words=[],walker=document.createTreeWalker(activeLayer,NodeFilter.SHOW_TEXT);
 let node;
 while((node=walker.nextNode())){
  if(!range.intersectsNode(node))continue;
  const content=node.textContent||'';
  const from=node===range.startContainer?range.startOffset:0;
  const to=node===range.endContainer?range.endOffset:content.length;
  if(to<=from||from<0||to>content.length)continue;
  const selection=content.slice(from,to),regex=/\S+/gu;
  let match;
  while((match=regex.exec(selection))){
   const first=from+match.index,last=first+match[0].length,part=document.createRange();
   part.setStart(node,first);part.setEnd(node,last);
   const box=rects(part);
   if(!box.length)continue;
   words.push({text:match[0],rects:box,
    prefix:content.slice(Math.max(0,first-60),first),
    suffix:content.slice(last,last+60)});
   if(words.length>180)return [];
  }
 }
 return words;
}

 // V094: use the exact V070 highlight logic with V089 geometry, not DOM ranges.
 function acceptPreciseSelection(result,screen){
  const a=api();
  const c={documentId:a?.currentId,page:a?.currentPage,sourceHash:a?.sourceHash};
  if(!inSelect()||!matches(c)||!result?.ok||
     !Array.isArray(result.rects)||!result.rects.length||
     !Array.isArray(result.words)||!result.words.length||
     !Number.isFinite(result.width)||result.width<=0||
     !Number.isFinite(result.height)||result.height<=0)return false;
  const words=result.words.map(w=>({
   text:w.text,
   rects:[[w.x0/result.width,w.y0/result.height,w.x1/result.width,w.y1/result.height]],
   line:Number.isInteger(w.line)?w.line:null,
   column:Number.isInteger(w.column)?w.column:null,
   prefix:'',suffix:''
  }));
  const all=words.flatMap(w=>w.rects);
  if(all.some(r=>r.some(v=>!Number.isFinite(v)||v<0||v>1)||r[0]>=r[2]||r[1]>=r[3]))return false;
  const box=wrap.getBoundingClientRect();
  const at={x:Number.isFinite(screen?.x)?screen.x:box.right,
            y:Number.isFinite(screen?.y)?screen.y:box.bottom};
  lastAt=at;
  const anchor=result.anchor||{quote:result.text,prefix:'',suffix:''};
  if(reselection){
   const target=reselection;reselection=null;
   if(target.page!==c.page||target.documentId!==c.documentId||target.hash!==c.sourceHash){
    status('A página de origem mudou. A edição foi cancelada.');return false;
   }
   if(a.updateTextHighlight(target.id,{text:result.text,rects:result.rects,anchor})){
    const mark=a.currentMarks.find(m=>m.id===target.id);
    show(mark,at.x,at.y);status('Trecho ajustado sem alterar o ID do grifo');
   }else status('Não foi possível alterar o trecho; original preservado');
   updateMode();return true;
  }
  pending={text:result.text,rects:result.rects,anchor,words,
           page:c.page,documentId:c.documentId,sourceHash:c.sourceHash,context:c};
  if(quick)commitPending(lastColor,lastStyle,smart);
  else show({text:result.text,color:lastColor},at.x,at.y,true);
  return true;
 }

 function readSelection(){
  if(window.BancoMestrePreciseSelectV094?.ready)return;
 if(!inSelect()||!activeLayer||!matches(context))return;
 const selection=window.getSelection();
 if(!selection||selection.isCollapsed||selection.rangeCount!==1||!inLayer(selection.anchorNode)||!inLayer(selection.focusNode))return;
 const range=selection.getRangeAt(0),text=String(selection.toString()||'').replace(/\u00a0/g,' ').trim();
 if(!text||text.length>20000)return;
 const boxes=rects(range);if(!boxes.length)return;
 const words=wordsFromRange(range);
 const end=range.getBoundingClientRect(),at={x:end.right,y:end.bottom};
 // Usar os limites normalizados do Range (inclusive seleções reversas).
 const anchor={prefix:range.startContainer?.textContent?.slice(Math.max(0,range.startOffset-60),range.startOffset)||'',
  suffix:range.endContainer?.textContent?.slice(range.endOffset,range.endOffset+60)||''};
 selection.removeAllRanges();lastAt=at;
 if(reselection){
  const target=reselection;reselection=null;
  if(target.page!==api().currentPage||target.documentId!==api().currentId||target.hash!==api().sourceHash){
   status('A página de origem mudou. A edição foi cancelada.');return;
  }
  if(api().updateTextHighlight(target.id,{text,rects:boxes,anchor})){
   const mark=api().currentMarks.find(m=>m.id===target.id);show(mark,at.x,at.y);
   status('Trecho ajustado sem alterar o ID do grifo');
  }else status('Não foi possível alterar o trecho; original preservado');
  updateMode();return;
 }
 pending={text,rects:boxes,anchor,words,page:context.page,documentId:context.documentId,sourceHash:context.sourceHash,context};
 if(quick)commitPending(lastColor,lastStyle,smart);
 else show({text,color:lastColor},at.x,at.y,true);
}
document.addEventListener('mouseup',e=>{
 if(e.button!==0||!inSelect()||!activeLayer||editor.hidden===false||settings.hidden===false)return;
 setTimeout(readSelection,0);
},true);
wrap.addEventListener('click',e=>{
 if(!inSelect()||!activeLayer||!matches(context)||!inLayer(e.target))return;
 const selection=window.getSelection();
 if(selection&&!selection.isCollapsed)return;
 const m=findOnPage(e.clientX,e.clientY);
 if(m){pending=null;show(m,e.clientX,e.clientY)}
},true);
document.addEventListener('keydown',e=>{
 if(!dlg.open)return;
 if(e.key==='Escape'){
  if(!editor.hidden){closeEditor();e.preventDefault();e.stopPropagation();return}
  if(!settings.hidden){settings.hidden=true;e.preventDefault();e.stopPropagation();return}
  if(!popup.hidden){closeMenu();e.preventDefault();e.stopPropagation();return}
   if(reselection){reselection=null;updateMode();status('Ajuste do trecho cancelado.');e.preventDefault();e.stopPropagation();return}
 }
 const target=e.target?.closest?.('input,textarea,[contenteditable="true"],select');
 if(target||e.repeat)return;
 const pressed='Alt+'+(e.shiftKey?'Shift+':'')+String(e.key||'').toUpperCase();
 if(e.altKey&&!e.ctrlKey&&!e.metaKey&&(pressed===keys.quick||pressed===keys.panel)){
  e.preventDefault();
  if(pressed===keys.quick)$('bm068QuickToggle').click();
  else $('bm068OpenPanel').click();
 }
},true);
$('bm068FloatClose').onclick=closeMenu;
dlg.addEventListener('close',()=>{serial++;if(activeLayer){activeLayer.remove();activeLayer=null}context=null;pending=null;reselection=null;closeMenu();closeEditor();settings.hidden=true;toast.hidden=true});
updateMode();
window.BancoMestreGrifadorV068={acceptPreciseSelection,get active(){return inSelect()},get quick(){return quick},get semanticColors(){return smart},get layerReady(){return !!activeLayer},openNotes(id){const mark=api()?.currentMarks?.find(m=>m.id===id);if(mark){show(mark,Math.max(100,innerWidth*.5),Math.max(80,innerHeight*.2));$('bm068Note').click()}},openMark(id){const mark=api()?.currentMarks?.find(m=>m.id===id);if(mark)show(mark,Math.max(100,innerWidth*.5),Math.max(80,innerHeight*.2))}};
})();


;
/* 34 assets/v063_grifos_navegacao.js */
/* Banco Mestre V063 — abertura de PDFs a partir da Biblioteca de Grifos.
   Preserva identidade documento/hash e não move grifos entre versões. */
(function(){
 'use strict';
 window.BancoMestreV062OpenPdf=function(docId,page,hash){
  try{
   if(typeof docs==='undefined'||!Array.isArray(docs))return false;
   const entry=docs.find(d=>String(d.id)===String(docId));
   if(!entry||typeof pdfOpen!=='function')return false;
   window.BM062PendingGo={docId:String(docId),page:Number(page),hash:String(hash||'')};
   pdfOpen(entry);
   return true;
  }catch(e){
   console.warn('V063: não foi possível abrir fonte do grifo',e);
   return false;
  }
 };
})();

;
/* 35 assets/v122_grifos_sync_core.js */
/* V122 — sincronização de grifos sem arquivar a marcação removida.
   Exclusão é um ID mínimo no mapa privado; cor, texto, retângulos e notas
   do grifo apagado não são conservados. Impede restauração de cópias antigas. */
(function(){
'use strict';
if(window.BancoMestreGrifosSyncCoreV103)return;
const SCHEMA='BancoMestreGrifosSyncV103';
const META='BM062_GRIFOS_META', DELETIONS='BM122_DELETED_HIGHLIGHT_IDS';
const PREFIXES=['BM030_STROKES_PDF:','BM102_PDF_HIGHLIGHT_JOINS:'];
const LIMIT_BYTES=12000000,LIMIT_KEYS=10000,LIMIT_MARKS=100000;
const isPage=k=>typeof k==='string'&&k.startsWith('BM030_STROKES_PDF:');
const validKey=k=>typeof k==='string'&&k.length<500&&(PREFIXES.some(p=>k.startsWith(p))||k===META||k===DELETIONS);
const literal=x=>JSON.stringify(x);
const now=()=>new Date().toISOString();
const deletedMap=x=>{
 if(!x||typeof x!=='object'||Array.isArray(x))throw Error('Índice de exclusões inválido');
 for(const [page,ids] of Object.entries(x)){
  if(!isPage(page)||page.length>500||!ids||typeof ids!=='object'||Array.isArray(ids))throw Error('Página de exclusão inválida');
  for(const [id,stamp] of Object.entries(ids))
   if(!/^(?:id:[A-Za-z0-9_-]{4,160}|g:[a-f0-9]{16}|l:[a-f0-9]{16})$/.test(id)||
     typeof stamp!=='string'||!Number.isFinite(Date.parse(stamp)))throw Error('Identidade de exclusão inválida');
 }
 return x;
};
function hexHash(input){
 // Estável entre navegadores e não reversível em informações de texto/cor.
 let a=2166136261,b=2246822519;for(let i=0;i<input.length;i++){
  const c=input.charCodeAt(i);
  a=Math.imul(a^c,16777619)>>>0;
  b=Math.imul(b^(c+(i&255)),3266489917)>>>0;
 }
 return a.toString(16).padStart(8,'0')+b.toString(16).padStart(8,'0');
}
function markId(m){
 if(m&&typeof m.id==='string'&&/^[A-Za-z0-9_-]{4,160}$/.test(m.id))return 'id:'+m.id;
 if(m&&typeof m.type==='string'&&(Array.isArray(m.points)||Array.isArray(m.box)||Array.isArray(m.rects)))
  return 'g:'+hexHash(literal([m.type,m.points||m.box||m.rects,m.created_at||'']));
 return 'l:'+hexHash(literal(m));
}
const markTimestamp=m=>Date.parse(m?.bm108_deleted_at||m?.bm108_changed_at||m?.updated_at||'')||0;
function mergeDeletions(a={},b={}){
 deletedMap(a);deletedMap(b);const out={};
 for(const [page,ids] of Object.entries(a))out[page]={...ids};
 for(const [page,ids] of Object.entries(b)){
  if(!out[page])out[page]={};
  for(const [id,stamp] of Object.entries(ids))
   if(!out[page][id]||Date.parse(stamp)>Date.parse(out[page][id]))out[page][id]=stamp;
 }
 return out;
}
function parse(key,text){
 if(typeof text!=='string'||text.length>LIMIT_BYTES)throw Error('Arquivo de grifos excede o limite');
 const value=JSON.parse(text);
 if(key===DELETIONS)return deletedMap(value);
 if(key===META){
  if(!value||typeof value!=='object'||Array.isArray(value))throw Error('Metadados inválidos');
 }else if(!Array.isArray(value)||value.length>LIMIT_MARKS)throw Error('Lista de marcações inválida');
 return value;
}
function readDeletes(storage){
 try{return deletedMap(JSON.parse(storage.getItem(DELETIONS)||'{}'))}
 catch(e){throw Error('Registro mínimo de exclusões inválido: '+e.message)}
}
function cleanMeta(meta,deletions){
 const out={...meta};
 for(const [page,ids] of Object.entries(deletions)){
  const matched=/^BM030_STROKES_PDF:(.+):([^:]+):P\d+$/.exec(page);
  if(!matched)continue;
  for(const id of Object.keys(ids)){
   if(!id.startsWith('id:'))continue;
   delete out['TXT:'+matched[1]+':'+matched[2]+':'+id.slice(3)];
  }
 }
 return out;
}
function cleanPage(key,marks,deletions){
 const ids=deletions[key]||{},output=[];
 for(const mark of marks){
  if(mark?.bm108_deleted_at)continue;
  if(Object.hasOwn(ids,markId(mark)))continue;
  output.push(mark);
 }
 return output;
}
function mergeArray(local,remote){
 const output=local.slice(),known=new Map(),conflicts=[];let additions=0;
 for(let i=0;i<output.length;i++)known.set(markId(output[i]),i);
 for(const mark of remote){
  const id=markId(mark),pos=known.get(id);
  if(pos===undefined){known.set(id,output.length);output.push(mark);additions++;continue}
  if(literal(output[pos])===literal(mark))continue;
  const previous=Date.parse(output[pos]?.bm108_changed_at||'')||0;
  const incoming=Date.parse(mark?.bm108_changed_at||'')||0;
  if(incoming>previous)output[pos]=mark;
  else conflicts.push(id);
 }
 return {merged:output,additions,conflicts};
}
function mergeObject(local,remote){
 const output={...local},conflicts=[];let additions=0;
 for(const [key,value] of Object.entries(remote)){
  if(!Object.hasOwn(output,key)){output[key]=value;additions++;continue}
  if(literal(output[key])!==literal(value)){
   const prev=Date.parse(output[key]?.bm108_changed_at||'')||0;
   if((Date.parse(value?.bm108_changed_at||'')||0)>prev)output[key]=value;
   else conflicts.push(key);
  }
 }
 return {merged:output,additions,conflicts};
}
function migrate(storage){
 const previous=storage.getItem(DELETIONS),deleted=readDeletes(storage),changes=[];
 let count=0;
 for(let i=0;i<storage.length;i++){
  const key=storage.key(i);if(!isPage(key))continue;
  const raw=storage.getItem(key);
  let entries;try{entries=parse(key,raw)}catch{continue}
  const kept=[];
  for(const mark of entries){
   if(mark?.bm108_deleted_at){
    if(!deleted[key])deleted[key]={};
    deleted[key][markId(mark)]=mark.bm108_deleted_at||now();count++;continue;
   }
   if(deleted[key]?.[markId(mark)]){count++;continue}
   kept.push(mark);
  }
  if(kept.length!==entries.length)changes.push({key,before:raw,after:kept.length?literal(kept):null});
 }
 const metaBefore=storage.getItem(META);
 const metaClean=metaBefore?literal(cleanMeta(parse(META,metaBefore),deleted)):null;
 const metaChanged=metaBefore!==null&&metaClean!==metaBefore;
 if(!changes.length&&!metaChanged)return {removed:0};

 try{
  storage.setItem(DELETIONS,literal(deleted));
  if(metaChanged)storage.setItem(META,metaClean);
  for(const c of changes){if(c.after===null)storage.removeItem(c.key);else storage.setItem(c.key,c.after)}
 }catch(e){
  for(const c of changes){try{c.before===null?storage.removeItem(c.key):storage.setItem(c.key,c.before)}catch(_){}}
  try{previous===null?storage.removeItem(DELETIONS):storage.setItem(DELETIONS,previous)}catch(_){}
  if(metaChanged)try{storage.setItem(META,metaBefore)}catch(_){}
  throw Error('Migração interrompida sem apagar originais: '+e.message);
 }
 return {removed:count};
}
function deleteMarks(storage,page,marks,options={}){
 if(!isPage(page))throw Error('Página inválida');
 if(!Array.isArray(marks)||!marks.length)return 0;
 const before=storage.getItem(page),beforeDeletions=storage.getItem(DELETIONS);
 const beforeMeta=storage.getItem(META),beforeJoins=storage.getItem(options.joinKey||'');
 const array=before?parse(page,before):[];
 const ids=new Set(marks.map(markId));
 if(!array.some(m=>ids.has(markId(m))))return 0;
 const remaining=array.filter(m=>!ids.has(markId(m)));
 const deletion=readDeletes(storage);
 if(!deletion[page])deletion[page]={};
 const stamp=now();
 for(const id of ids)deletion[page][id]=stamp;
 let meta;
 if(beforeMeta){meta=parse(META,beforeMeta);meta={...meta};for(const k of options.identities||[])delete meta[k]}
 let joins;
 if(options.joinKey&&beforeJoins){
  joins=parse(options.joinKey,beforeJoins);
  const rawIds=new Set(marks.map(m=>m?.id).filter(Boolean));
  joins=joins.map(x=>({...x,markIds:(x.markIds||[]).filter(id=>!rawIds.has(id))}))
   .filter(x=>x.markIds.length>=2);
 }
 const backup={[page]:before,[DELETIONS]:beforeDeletions};
 if(beforeMeta&&meta)backup[META]=beforeMeta;
 if(options.joinKey&&beforeJoins)backup[options.joinKey]=beforeJoins;
 try{
  storage.setItem(DELETIONS,literal(deletion));
  remaining.length?storage.setItem(page,literal(remaining)):storage.removeItem(page);
  if(beforeMeta&&meta)storage.setItem(META,literal(meta));
  if(options.joinKey&&beforeJoins)joins.length?storage.setItem(options.joinKey,literal(joins)):storage.removeItem(options.joinKey);
 }catch(e){
  for(const [key,value] of Object.entries(backup))
   try{value===null?storage.removeItem(key):storage.setItem(key,value)}catch(_){}
  throw Error('Exclusão não confirmada; registros anteriores preservados: '+e.message);
 }
 return array.length-remaining.length;
}
function persistPage(storage,page,next){
 if(!isPage(page)||!Array.isArray(next))throw Error('Página inválida');
 const before=storage.getItem(page),beforeDeletes=storage.getItem(DELETIONS);
 const current=before?parse(page,before):[];
 const future=new Set(next.map(markId));
 const removed=current.filter(m=>!future.has(markId(m)));
 const deletions=readDeletes(storage);
 if(removed.length){
  if(!deletions[page])deletions[page]={};
  const stamp=now();
  for(const mark of removed)deletions[page][markId(mark)]=stamp;
 }
 const clean=cleanPage(page,next,deletions);
 try{
  if(removed.length)storage.setItem(DELETIONS,literal(deletions));
  clean.length?storage.setItem(page,literal(clean)):storage.removeItem(page);
 }catch(e){
  try{before===null?storage.removeItem(page):storage.setItem(page,before)}catch(_){}
  try{beforeDeletes===null?storage.removeItem(DELETIONS):storage.setItem(DELETIONS,beforeDeletes)}catch(_){}
  throw Error('Grifos não salvos: '+e.message);
 }
 return {saved:clean.length,removed:removed.length};
}
function capture(storage,device){
 migrate(storage);
 const records={};
 if(storage.length>LIMIT_KEYS)throw Error('Limite de registros excedido');
 const deleted=readDeletes(storage);
 for(let i=0;i<storage.length;i++){
  const key=storage.key(i);if(!validKey(key))continue;
  let txt=storage.getItem(key);
  if(typeof txt!=='string')continue;
  const val=parse(key,txt);
  if(isPage(key))txt=literal(cleanPage(key,val,deleted));
  if(isPage(key)&&txt==='[]')continue;
  records[key]=txt;
 }
 const bundle={schema:SCHEMA,device,generated_at:now(),records};
 if(literal(bundle).length>LIMIT_BYTES)throw Error('Backup acima de 12MB');
 return bundle;
}
function validate(bundle){
 if(!bundle||bundle.schema!==SCHEMA||!/^[A-Za-z0-9_-]{8,100}$/.test(bundle.device||'')||
  !bundle.records||typeof bundle.records!=='object'||Array.isArray(bundle.records))
  throw Error('Cópia de grifos inválida');
 const keys=Object.keys(bundle.records);
 if(keys.length>LIMIT_KEYS)throw Error('Cópia excede limite de arquivos');
 for(const key of keys){if(!validKey(key)||typeof bundle.records[key]!=='string')throw Error('Chave de backup não permitida');parse(key,bundle.records[key])}
 return bundle.records;
}
function plan(storage,bundles){
 if(!Array.isArray(bundles)||bundles.length>30)throw Error('Limite de arquivos excedido');
 let mergedDeletions=readDeletes(storage),additions=0;
 const conflicts=[],pending=new Map();
 for(const b of bundles){
  const records=validate(b);
  if(records[DELETIONS])mergedDeletions=mergeDeletions(mergedDeletions,parse(DELETIONS,records[DELETIONS]));
  for(const [key,text] of Object.entries(records)){
   if(!isPage(key))continue;
   for(const item of parse(key,text))if(item?.bm108_deleted_at){
    mergedDeletions=mergeDeletions(mergedDeletions,{[key]:{[markId(item)]:item.bm108_deleted_at}});
   }
  }
 }
 const snapshots=[...bundles.map(b=>b.records)];
 for(const records of snapshots)for(const [key,text] of Object.entries(records)){
  if(key===DELETIONS)continue;
  const before=pending.has(key)?pending.get(key):storage.getItem(key);
  const remote=parse(key,text);
  if(before===null){pending.set(key,text);additions+=Array.isArray(remote)?remote.length:Object.keys(remote).length;continue}
  const local=parse(key,before);
  const r=key===META?mergeObject(local,remote):mergeArray(local,remote);
  additions+=r.additions;
  if(r.conflicts.length)conflicts.push({key,type:'mesmo_id',count:r.conflicts.length});
  pending.set(key,literal(r.merged));
 }
 const rawMeta=pending.has(META)?pending.get(META):storage.getItem(META);
 if(rawMeta){
  const filtered=cleanMeta(parse(META,rawMeta),mergedDeletions);
  if(literal(filtered)!==rawMeta)pending.set(META,literal(filtered));
 }
 const previous=storage.getItem(DELETIONS);
 if(literal(mergedDeletions)!==literal(readDeletes(storage)))pending.set(DELETIONS,literal(mergedDeletions));
 const keys=new Set([...pending.keys()]);
 for(let i=0;i<storage.length;i++){const key=storage.key(i);if(isPage(key))keys.add(key)}
 for(const key of keys)if(isPage(key)){
  const before=pending.has(key)?pending.get(key):storage.getItem(key);
  if(before===null)continue;
  const clean=cleanPage(key,parse(key,before),mergedDeletions);
  pending.set(key,clean.length?literal(clean):null);
 }
 const writes=[];
 for(const [key,value] of pending)if(storage.getItem(key)!==value)writes.push({key,value});
 return {writes,additions,conflicts,files:bundles.length,deleted:mergedDeletions,previous};
}
function apply(storage,result){
 if(!result||!Array.isArray(result.writes))throw Error('Plano inválido');
 const prior=[];
 try{
  for(const {key,value} of result.writes){
   if(!validKey(key))throw Error('Chave inválida');
   prior.push([key,storage.getItem(key)]);
   if(value===null)storage.removeItem(key);else storage.setItem(key,value);
  }
 }catch(e){
  for(const [key,value] of prior.reverse())try{value===null?storage.removeItem(key):storage.setItem(key,value)}catch(_){}
  throw Error('Alterações revertidas: '+e.message);
 }
 return result.writes.length;
}
const api=Object.freeze({SCHEMA,META,DELETIONS,LIMIT_BYTES,validKey,markId,parse,
 mergeArray,mergeObject,mergeDeletions,readDeletes,cleanPage,cleanMeta,deleteMarks,persistPage,
 migrate,capture,validate,plan,apply});
window.BancoMestreGrifosSyncCoreV103=api;
})();


;
/* 36 assets/v120_highlight_groups.js */
/* V120: mesmo agrupador de parágrafos no PDF e na biblioteca; correção de normalização de espaços. */
/* V097 — agrupamento de apresentação de grifos multicoloridos.
   Não reescreve registros, IDs, notas nem o localStorage; agrupamento legado
   exige sequência completa, contígua, mesma página e carimbo de tempo próximo.
*/
(function(){
 'use strict';
 if(window.BancoMestreHighlightGroupsV097)return;
 const validId=x=>typeof x==='string'&&/^BM-GRP-[0-9A-Za-z-]{10,100}$/.test(x);
 const isText=e=>e?.mark?.type==='text_highlight';
 const sameDoc=(a,b)=>a?.docId===b?.docId&&a?.hash===b?.hash&&a?.page===b?.page;
 function legacySequence(rows,i){
  const first=rows[i],m=first?.mark;
  const n=m?.segment_total;
  if(!isText(first)||validId(m.selection_group_id)||
     !Number.isInteger(n)||n<2||n>40||m.segment_index!==1||
     !m.id||typeof m.created_at!=='string')return null;
  const stamp=Date.parse(m.created_at);
  if(!Number.isFinite(stamp)||i+n>rows.length)return null;
  const parts=rows.slice(i,i+n);
  const used=new Set();
  for(let j=0;j<n;j++){
   const p=parts[j],mark=p?.mark,at=Date.parse(mark?.created_at||'');
   if(!isText(p)||!sameDoc(p,first)||validId(mark.selection_group_id)||
      mark.segment_index!==j+1||mark.segment_total!==n||
      !mark.id||used.has(mark.id)||!Number.isFinite(at)||
      Math.abs(at-stamp)>1500)return null;
   used.add(mark.id);
  }
  return parts;
 }
 function autoGroupRows(rows){
  if(!Array.isArray(rows))return [];
  const out=[],byId=new Map();
  for(let i=0;i<rows.length;i++){
   const e=rows[i],id=e?.mark?.selection_group_id;
   if(isText(e)&&validId(id)){
    const key=[e.docId,e.hash,e.page,id].join('|');
    let group=byId.get(key);
    if(!group){
     group={parts:[],groupId:id,legacy:false};
     byId.set(key,group);out.push(group);
    }
    group.parts.push(e);continue;
   }
   const legacy=legacySequence(rows,i);
   if(legacy){
    out.push({parts:legacy,groupId:null,legacy:true});
    i+=legacy.length-1;continue;
   }
   out.push({parts:[e],groupId:null,legacy:false});
  }
  // Não impor ordem arbitrária: novos segmentos incluem segment_index no lote.
  for(const g of out)if(g.groupId&&g.parts.length>1)
   g.parts.sort((a,b)=>(a.mark.segment_index||999)-(b.mark.segment_index||999));
  return out;
 }

 // The user can join existing highlights in the SAME PDF and SAME page.
 // Manual groups are an independent presentation map, never a rewrite of marks.
 function groupRows(rows,customGroups=[]){
  const base=autoGroupRows(rows);
  if(!Array.isArray(customGroups)||!customGroups.length)return base;
  const byMark=new Map(),byGroup=new Map();
  for(const entry of customGroups){
   if(!entry||!/^BM-JOIN-[A-Za-z0-9-]{8,100}$/.test(String(entry.id||''))||
      !Number.isSafeInteger(entry.page)||entry.page<1||
      !Array.isArray(entry.markIds)||entry.markIds.length<2||entry.markIds.length>250)continue;
   const ids=[...new Set(entry.markIds.filter(x=>typeof x==='string'&&/^BM-TXT-[A-Za-z0-9-]{6,120}$/.test(x)))];
   if(ids.length!==entry.markIds.length)continue;
   byGroup.set(entry.id,{...entry,markIds:ids});
   for(const id of ids)if(!byMark.has(id))byMark.set(id,entry.id);
  }
  const out=[],manual=new Map();
  for(const g of base){
   const ids=g.parts.map(e=>isText(e)?e.mark.id:null);
   const distinct=ids.length&&ids.every(id=>id&&byMark.has(id))?
    new Set(ids.map(id=>byMark.get(id))):null;
   const target=distinct?.size===1?byGroup.get(byMark.get(ids[0])):null;
   const fits=target&&g.parts.every(e=>isText(e)&&e.page===target.page);
   if(!fits){out.push(g);continue}
   let item=manual.get(target.id);
   if(!item){
    item={parts:[],groupId:target.id,manualId:target.id,manual:true,manualTexts:[],legacy:false};
    manual.set(target.id,item);out.push(item);
   }
   item.parts.push(...g.parts);
   const phrase=paragraphText(g);
   if(phrase)item.manualTexts.push(phrase);
  }
  return out;
 }
 function paragraphText(group){
  if(!group?.parts?.length)return '';
  if(group.manual&&Array.isArray(group.manualTexts)&&group.manualTexts.length)
   return group.manualTexts.join(' … ').replace(/\s+/g,' ').trim();
  const preferred=group.parts.find(e=>typeof e.mark.selection_group_text==='string'&&e.mark.selection_group_text.trim());
  if(preferred)return preferred.mark.selection_group_text.trim();
  return group.parts.map(e=>String(e.mark?.text||'').trim()).filter(Boolean).join(' ').replace(/\s+/g,' ').trim();
 }
 window.BancoMestreHighlightGroupsV097=Object.freeze({groupRows,paragraphText});
})();

;
/* 37 assets/v064_imagens_visibilidade.js */
/* V064 — não exibir imagens excluídas em Assuntos ou vínculos da base. */
(function BancoMestreV064Imagens(){
 'use strict';
 const api=window.BancoMestreImagens;
 const index=()=>window.BM032VisualIndex;
 if(!api||!document.getElementById('topicRows'))return;
 let hiddenIds=new Set(),ready=false,unavailable=false,lastTopic=null,busy=false;
 const idRe=/^IMG-(?:P10-)?\d{1,4}$/i;
 async function read(){
  try{
   const statuses=await api.all();
   if(!Array.isArray(statuses))throw Error('Estado indisponível');
   hiddenIds=new Set(statuses.filter(x=>x?.status==='hidden').map(x=>String(x.id).toUpperCase()));
   ready=true;unavailable=false;
  }catch(e){
   unavailable=true;ready=false;
   console.warn('V064: estados de imagens indisponíveis; ocultando imagens de assunto por precaução',e);
  }
 }
 const visible=id=>ready&&!hiddenIds.has(String(id||'').toUpperCase());
 function countFor(topic){
  if(!ready)return 0;
  return (index()?.records||[]).filter(r=>
   visible(r.id)&&r.status!=='pendente'&&r.status!=='reprovada'&&
   (r.relations||[]).some(t=>t.group===topic.group&&t.subject===topic.subject)).length;
 }
 function updateTopicData(){
  if(typeof topicRows==='undefined'||!Array.isArray(topicRows))return;
  for(const t of topicRows)t.imgCount=countFor(t);
  // Ocultar visualOnly cuja única razão de existir eram imagens excluídas.
  // O original do índice de imagens não é alterado.
  topicRows=topicRows.filter(t=>!t.visualOnly||t.imgCount>0||t.count>0);
  for(const tile of document.querySelectorAll('#areaRows button.topicCard')){
   const name=tile.querySelector('strong')?.textContent;
   const items=topicRows.filter(t=>t.area===name);
   const count=tile.querySelector('small');
   if(count)count.textContent=items.length+' assuntos · '+items.reduce((n,t)=>n+(t.imgCount||0),0)+' imagens visíveis';
  }
  if(typeof topicRender==='function')topicRender();
 }
 function suppressHiddenRefs(root){
  if(!root)return;
  for(const b of root.querySelectorAll('button.media-ref')){
   const token=b.textContent?.trim()?.toUpperCase();
   if(idRe.test(token)&&!visible(token))b.remove();
  }
 }
 function pruneTopic(topic){
  const root=document.getElementById('topicMedia');
  if(!root)return;
  for(const card of root.querySelectorAll('.topicVisualCard')){
   const id=[...card.querySelectorAll('button.media-ref')].map(x=>x.textContent?.trim()?.toUpperCase()).find(x=>idRe.test(x||''));
   if(!id||!visible(id))card.remove();
  }
  const cards=root.querySelectorAll('.topicVisualCard').length;
  const panel=root.querySelector('.topicVisualGrid');
  if(panel&&!cards)panel.remove();
  const note=root.querySelector('p.contextNote');
  if(note){
   note.textContent=cards?cards+' imagem(ns) visível(is) para este assunto; arquivos excluídos não são exibidos.':
    'Nenhuma imagem visível vinculada a este assunto. Imagens excluídas permanecem arquivadas para restauração no Atlas.';
  }
  const overview=document.querySelector('#topicOverview');
  if(overview)for(const stat of overview.querySelectorAll('.v034TopicSummary span')){
   if(/imagem\(ns\) identificada/i.test(stat.textContent||''))stat.textContent=cards+' imagem(ns) identificada(s)';
  }
  suppressHiddenRefs(document.getElementById('tema'));
 }
 async function updateStats(){
  const total=Array.isArray(meta?.images)?meta.images.length:270;
  const visibleCount=ready?Math.max(0,total-meta.images.filter(x=>hiddenIds.has(String(x.no).toUpperCase())).length):0;
  const b=document.querySelector('.stats .stat:nth-child(3) b');
  const caption=document.querySelector('.stats .stat:nth-child(3) span');
  if(b)b.textContent=ready?String(visibleCount):'—';
  if(caption)caption.textContent=ready?'Imagens visíveis no Atlas (catálogo: '+total+')':'Visibilidade não verificada';
 }
 async function sync(){
  if(busy)return;busy=true;
  try{
   await read();
   if(typeof loadMeta==='function')await loadMeta();
   updateTopicData();
   updateStats();
   if(lastTopic)pruneTopic(lastTopic);
  }finally{busy=false}
 }
 const priorOpen=window.BancoMestreV034?.openTopic;
 if(priorOpen){
  window.BancoMestreV034.openTopic=async function(topic){
   lastTopic=topic;
   const panel=document.getElementById('tema');
   panel?.classList.add('bm064-auditing-images');
   try{
    await read();
    const result=await priorOpen.call(this,topic);
    pruneTopic(topic);
    return result;
   }finally{panel?.classList.remove('bm064-auditing-images')}
  };
 }
 // Recalcular contagens e impedir visualOnly excluído após reindexação.
 if(typeof loadTopics==='function'){
  const old=loadTopics;
  loadTopics=async function(){
   const area=document.getElementById('assuntos');
   area?.classList.add('bm064-auditing-images');
   try{
    const result=await old();
    await read();
    updateTopicData();
    updateStats();
    return result;
   }finally{area?.classList.remove('bm064-auditing-images')}
  };
 }
 // Um cartão antigo pode conter um botão gerado de IMG; não abrir se foi excluído.
 if(typeof imgOpen==='function'){
  const previous=imgOpen;
  imgOpen=async function(x){
   await read();
   if(!x||!visible(x.no)){
    alert('Esta imagem foi excluída do acervo visível. Para restaurá-la, use a opção “Mostrar excluídos” no Atlas.');
    return;
   }
   return previous.apply(this,arguments);
  };
 }
 // Após exclusão/restauração pelo editor ou Atlas, atualizar as exibições.
 const priorStatus=api.setStatus.bind(api);
 api.setStatus=async function(id,status){
  const result=await priorStatus(id,status);
  await read();
  // Não alterar os registros originais, apenas a vista.
  if(typeof loadTopics==='function')await loadTopics();
  if(lastTopic)pruneTopic(lastTopic);
  return result;
 };
 // Quando a navegação por histórico retorna ao assunto, revalidar filtros.
 document.addEventListener('click',e=>{
  if(e.target?.closest?.('button[data-page="assuntos"]'))sync().catch(console.warn);
 });
 sync().catch(e=>console.warn('V064: filtro de imagens',e));
 window.BancoMestreV064Imagens={refresh:sync,isVisible:visible,get hiddenCount(){return hiddenIds.size}};
})();


;
/* 38 assets/v120_painel_grifos.js */
/* V120: painel PDF e biblioteca mostram somente grifos ativos por padrão. */
/* V102 — unificação manual reversível no painel e menos chips repetidos. */
/* V097 — grupos no painel, sem modificar cores, IDs nem grifos existentes. */
/* V070: painel exibe nota/assunto propostos como revisão pendente. */
/* V069: atualização imediata após persistência de grifos. */
/* V068 — painel de grifos avançado do documento no leitor PDF. */
(function BancoMestreV064PainelGrifos(){
 'use strict';
 const $=id=>document.getElementById(id);
 const dialog=$('pdfDialog'),content=dialog?.querySelector('.bm-v046-pdf-content'),
  mode=$('pdfLocalMode'),tools=$('pdfLocalTools'),api=window.BancoMestrePDFV042;
 if(!dialog||!content||!mode||!tools||!api||$('bm064HighlightPanel'))return;
 const META='BM062_GRIFOS_META';
 const grouping=()=>window.BancoMestreHighlightGroupsV097;
 const reader=document.createElement('div');reader.id='bm064Reader';reader.className='bm064-reader';
 mode.replaceWith(reader);reader.append(mode);
 const grip=document.createElement('div');grip.id='bm064PanelGrip';grip.className='bm064-grip';
 grip.setAttribute('role','separator');grip.setAttribute('aria-label','Redimensionar painel de grifos');
 grip.setAttribute('aria-orientation','vertical');grip.tabIndex=0;
 const panel=document.createElement('aside');panel.id='bm064HighlightPanel';panel.className='bm064-highlight-panel';
 panel.setAttribute('aria-label','Grifos e anotações deste PDF');
 panel.innerHTML='<div class="bm064-head"><strong>Grifos deste PDF</strong><button id="bm064Close" type="button" title="Recolher painel">×</button></div>'+
 '<p id="bm064PanelCaption" class="bm064-caption" aria-live="polite">Abra um PDF local para consultar marcações.</p>'+
 '<div class="bm064-panel-controls"><input id="bm064Search" type="search" placeholder="Pesquisar texto, nota, página" aria-label="Pesquisar grifos neste PDF"><button id="bm064Refresh" type="button" title="Recarregar grifos">↻</button></div>'+
 '<div class="bm102-merge-controls" role="group" aria-label="Organizar grifos deste PDF">'+
 '<button id="bm102MergeToggle" type="button">Unir grifos</button>'+
 '<span id="bm102MergeCounter" hidden aria-live="polite">0 selecionados</span>'+
 '<button id="bm102MergeSave" type="button" hidden disabled>Unir selecionados</button>'+
 '<button id="bm102MergeCancel" type="button" hidden>Cancelar</button></div>'+
 '<div id="bm064PanelList" class="bm064-list"></div>'+
 '<small class="bm064-footer">Grifos antigos não são convertidos automaticamente em texto.</small>';
 reader.append(grip,panel);
 const toggle=document.createElement('button');toggle.id='bm064TogglePanel';toggle.type='button';
 toggle.textContent='☰ Grifos do PDF';toggle.title='Mostrar ou recolher a lista de grifos do documento';
 toggle.setAttribute('aria-controls','bm064HighlightPanel');toggle.setAttribute('aria-expanded','false');
 tools.prepend(toggle);
 let open=false,rows=[],lastKey='',lastId='',onAction=false,refreshPending=false;
 let mergeMode=false,chosenGroups=new Set();
 const MERGES='BM102_PDF_HIGHLIGHT_JOINS:';
 const joinKey=()=>MERGES+encodeURIComponent(String(api.currentId||''))+':'+String(api.sourceHash||'');
 function loadJoins(){
  if(!api.editing||!api.currentId||!api.sourceHash)return [];
  try{const data=JSON.parse(localStorage.getItem(joinKey())||'[]');
   return Array.isArray(data)?data.slice(0,250):[]}
  catch{return []}
 }
 function saveJoins(joins){
  try{if(joins.length>250)throw Error('Limite de grupos atingido');
   localStorage.setItem(joinKey(),JSON.stringify(joins));return true}
  catch(err){$('bm064PanelCaption').textContent='Não foi possível salvar a união: '+err.message;return false}
 }
 const groupKey=g=>g.manualId||g.groupId||g.parts.map(e=>e.mark?.id||e.key+':'+e.index).join('|');
 const canJoin=g=>g?.parts?.length>0&&g.parts.every(e=>e?.mark?.type==='text_highlight'&&
  typeof e.mark.id==='string'&&e.mark.id.startsWith('BM-TXT-'));
 function updateJoinControls(){
  const count=chosenGroups.size;
  $('bm102MergeToggle').hidden=mergeMode;
  $('bm102MergeCounter').hidden=!mergeMode;
  $('bm102MergeSave').hidden=!mergeMode;
  $('bm102MergeCancel').hidden=!mergeMode;
  $('bm102MergeCounter').textContent=count+' seleção(ões)';
  $('bm102MergeSave').disabled=count<2;
 }
 function finishJoining(){
  mergeMode=false;chosenGroups.clear();updateJoinControls();
 }
 function startJoining(){
  if(!api.editing||!api.sourceHash)return;
  mergeMode=true;chosenGroups.clear();render();
 }
 function cancelJoining(){finishJoining();render()}
 function separateJoin(id){
  if(!id||!api.editing)return;
  const next=loadJoins().filter(entry=>entry.id!==id);
  if(!saveJoins(next))return;
  chosenGroups.clear();refresh();
 }
 function joinChosen(){
  if(!api.editing||!api.currentId||!api.sourceHash)return;
  const all=grouping()?.groupRows(rows,loadJoins())||[];
  const selected=all.filter(g=>chosenGroups.has(groupKey(g))&&canJoin(g));
  if(selected.length<2){$('bm064PanelCaption').textContent='Selecione pelo menos dois grifos ou grupos.';return}
  const reference=selected[0].parts[0];
  if(selected.some(g=>g.parts.some(e=>e.docId!==reference.docId||
     e.hash!==reference.hash||e.page!==reference.page))){
   $('bm064PanelCaption').textContent='Para preservar a leitura, una apenas grifos da mesma página.';return;
  }
  const allIds=[...new Set(selected.flatMap(g=>g.parts.map(e=>e.mark.id)))];
  if(allIds.length>250){$('bm064PanelCaption').textContent='A seleção excede 250 trechos; divida em grupos menores.';return}
  const removed=new Set(selected.map(g=>g.manualId).filter(Boolean));
  const oldJoins=loadJoins();
  const joins=oldJoins.filter(g=>!removed.has(g.id));
  joins.push({
   id:'BM-JOIN-'+(globalThis.crypto?.randomUUID?.()||Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,14)),
   page:reference.page,markIds:allIds,created_at:new Date().toISOString()
  });
  if(!saveJoins(joins))return;
  finishJoining();refresh();
 }
 function joinSelector(node,g){
  if(!mergeMode||!canJoin(g))return node;
  const wrapper=document.createElement('div');wrapper.className='bm102-select-wrap';
  const label=document.createElement('label');label.className='bm102-select-label';
  const cb=document.createElement('input');cb.type='checkbox';
  cb.checked=chosenGroups.has(groupKey(g));
  cb.setAttribute('aria-label','Selecionar grifo da página '+g.parts[0].page+' para união');
  cb.addEventListener('change',()=>{
   const k=groupKey(g);if(cb.checked)chosenGroups.add(k);else chosenGroups.delete(k);
   updateJoinControls();wrapper.classList.toggle('bm102-checked',cb.checked);
  });
  const text=document.createElement('span');text.textContent='Selecionar para unir';
  label.append(cb,text);wrapper.append(label,node);
  wrapper.classList.toggle('bm102-checked',cb.checked);
  return wrapper;
 }

 const safe=s=>String(s??'');
 const norm=s=>safe(s).replace(/\s+/g,' ').trim();
 const formatText=x=>norm(x).slice(0,450);
 function getMeta(){
  try{return JSON.parse(localStorage.getItem(META)||'{}')||{}}catch{return{}}
 }
 function saveMeta(meta){
  try{localStorage.setItem(META,JSON.stringify(meta));return true}
  catch(e){$('bm064PanelCaption').textContent='Não foi possível salvar a nota: '+e.message;return false}
 }
 function identity(e){
  if(e.mark.type==='text_highlight'&&e.mark.id)
   return 'TXT:'+e.docId+':'+e.hash+':'+e.mark.id;
  return 'LEGACY:'+e.key+':'+e.index;
 }
 const isText=m=>m?.type==='text_highlight';
 const getNote=(e,meta)=>{
  const d=meta[identity(e)]||{};
  return isText(e.mark)?safe(e.mark.note||''):safe(d.note||'');
 };
 function scan(){
  if(!api.editing||!api.currentId||!api.sourceHash)return [];
  const docId=String(api.currentId),hash=String(api.sourceHash),prefix='BM030_STROKES_PDF:'+docId+':'+hash+':P';
  const result=[];
  for(let i=0;i<localStorage.length;i++){
   const key=localStorage.key(i);
   if(!key||!key.startsWith(prefix))continue;
   const n=key.slice(prefix.length);
   if(!/^[1-9]\d*$/.test(n))continue;
   let arr;try{arr=JSON.parse(localStorage.getItem(key)||'[]')}catch{continue}
   if(!Array.isArray(arr))continue;
   arr.forEach((mark,index)=>{
    if(mark?.bm108_deleted_at)return; // Arquivados restauráveis só aparecem na Biblioteca quando solicitado.
    if(!['text_highlight','highlighter','rect'].includes(mark?.type))return;
    result.push({docId,hash,key,page:Number(n),index,mark});
   });
  }
  return result.sort((a,b)=>a.page-b.page||a.index-b.index);
 }
 function position(e){
  const m=e.mark;
  if(isText(m)&&Array.isArray(m.rects)&&m.rects[0])return Math.max(0,Math.min(1,(m.rects[0][1]+m.rects[0][3])/2));
  if(m.type==='rect'&&Array.isArray(m.box))return Math.max(0,Math.min(1,(m.box[1]+m.box[3])/2));
  if(Array.isArray(m.points)&&m.points[0])return Math.max(0,Math.min(1,m.points[0][1]));
  return .12;
 }
 function centerMark(e){
  const pane=mode,wrap=$('pdfPageWrap');
  if(!wrap||!pane)return;
  const paneRect=pane.getBoundingClientRect(),wrapRect=wrap.getBoundingClientRect();
  const top=pane.scrollTop+wrapRect.top-paneRect.top+position(e)*wrapRect.height;
  pane.scrollTo({top:Math.max(0,top-pane.clientHeight*.4),behavior:'smooth'});
 }
 async function navigate(e){
  if(!api.editing||api.currentId!==e.docId||api.sourceHash!==e.hash)return;
  try{
   await api.goToPage(e.page);
   requestAnimationFrame(()=>centerMark(e));
  }catch(err){$('bm064PanelCaption').textContent='Erro ao abrir a página: '+err.message}
 }
 function updateNote(e){
  const meta=getMeta(),before=getNote(e,meta);
  const typed=prompt(isText(e.mark)?'Nota vinculada ao trecho selecionado:':'Observação deste grifo visual:',before);
  if(typed===null)return;
  const text=typed.slice(0,12000);
  if(isText(e.mark)){
   if(api.currentId!==e.docId||api.sourceHash!==e.hash)return;
   if(api.currentPage===e.page){
    if(!api.updateTextHighlight(e.mark.id,{note:text})){
     $('bm064PanelCaption').textContent='Nota não salva. Reabra a página e tente novamente.';return;
    }
   }else{
    try{
     const marks=JSON.parse(localStorage.getItem(e.key)||'[]');
     const i=marks.findIndex(m=>m?.id===e.mark.id&&m.type==='text_highlight');
     if(i<0)throw Error('Grifo não encontrado');
     marks[i]={...marks[i],note:text,updated_at:new Date().toISOString()};
     localStorage.setItem(e.key,JSON.stringify(marks));
    }catch(err){$('bm064PanelCaption').textContent='Nota não salva: '+err.message;return}
   }
  }else{
   const id=identity(e);meta[id]={...(meta[id]||{}),note:text};if(!saveMeta(meta))return;
  }
  refresh();
 }
 function markNode(e,meta){
  const row=document.createElement('article');row.className='bm064-mark';
  if(e.page===api.currentPage)row.classList.add('bm064-mark-active-page');
  const color=/^#[0-9a-f]{6}$/i.test(e.mark.color||'')?e.mark.color:'#ffd400';
  row.style.setProperty('--bm064-mark-color',color);
  const header=document.createElement('div');header.className='bm064-mark-head';
  const location=document.createElement('span');location.textContent='Pág. '+e.page+' · '+(isText(e.mark)?'Texto':'Grifo livre');
  const edit=document.createElement('button');edit.type='button';edit.textContent='✎ Nota';
  edit.title='Adicionar ou editar a nota deste grifo';
  edit.addEventListener('click',async()=>{
   if(isText(e.mark)&&window.BancoMestreGrifadorV068){
    await navigate(e);
    window.BancoMestreGrifadorV068.openNotes(e.mark.id);
   }else updateNote(e);
  });
  header.append(location,edit);
  const preview=document.createElement('button');preview.type='button';preview.className='bm064-preview';
  preview.textContent=isText(e.mark)?formatText(e.mark.text)||'[Trecho sem texto]':'Marcação visual — texto ainda não identificado';
  preview.title='Ir ao grifo na página '+e.page;preview.addEventListener('click',()=>navigate(e));
  const note=getNote(e,meta);row.append(header,preview);
  if(note){const n=document.createElement('p');n.className='bm064-note';n.textContent='Nota: '+note;row.append(n)}
  if(isText(e.mark)&&e.mark.classification_status==='sugestao'){
   const noteBox=document.createElement('p');noteBox.className='bm064-note bm070-panel-suggestion';
   const info=e.mark.subject_suggestion||{};
   noteBox.textContent='◈ SUGESTÃO NÃO CONFIRMADA — '+(e.mark.color_label||'Sem categoria')+
    (info.topic?' · '+info.topic:'')+
    (info.subtopic?' / '+info.subtopic:'');
   row.append(noteBox);
   if(!note&&e.mark.note_suggestion){
    const text=document.createElement('p');text.className='bm064-note bm070-panel-suggestion';
    text.textContent='Nota proposta: '+e.mark.note_suggestion;row.append(text);
   }
  }
  if(isText(e.mark)&&e.mark.note_structured){
   const labels={explicacao:'Explicação',duvida:'Dúvida',correcao:'Correção',macete:'Macete',pegadinha:'Pegadinha',fundamento:'Fundamento',fonte:'Fonte'};
   for(const [k,val] of Object.entries(e.mark.note_structured)){
    if(!labels[k]||!String(val||'').trim())continue;
    const n=document.createElement('p');n.className='bm064-note';n.textContent=labels[k]+': '+val;row.append(n);
   }
  }
  if(isText(e.mark)&&(e.mark.tags||[]).length){
   const tag=document.createElement('small');tag.textContent='Tags: '+e.mark.tags.join(', ');row.append(tag);
  }
  const cards=Array.isArray(e.mark.card_ids)?e.mark.card_ids.filter(Boolean):[];
  if(cards.length){const c=document.createElement('small');c.textContent='Cartões: '+cards.join(', ');row.append(c)}
  return row;
 }
 // Um parágrafo com várias cores aparece como um único item, mas mantém
 // os registros e comandos próprios de cada trecho nos detalhes.
 function groupedNode(group,meta){
  const parts=group.parts||[],first=parts[0];
  if(!first)return document.createElement('div');
  if(parts.length===1&&!group.manual)return markNode(first,meta);
  const article=document.createElement('article');
  article.className='bm064-mark bm097-paragraph';
  if(first.page===api.currentPage)article.classList.add('bm064-mark-active-page');
  const header=document.createElement('div');header.className='bm064-mark-head';
  const name=document.createElement('span');name.textContent='Pág. '+first.page+(group.manual?' · Grifos unidos':' · Seleção multicolorida');
  const count=document.createElement('small');count.textContent=parts.length+' trechos';
  header.append(name,count);
  if(group.manualId){
   const separate=document.createElement('button');separate.type='button';
   separate.className='bm102-separate';
   separate.textContent='Separar';
   separate.title='Desfazer esta união sem apagar cores, notas ou grifos';
   separate.addEventListener('click',()=>separateJoin(group.manualId));
   header.append(separate);
  }
  const preview=document.createElement('button');preview.className='bm064-preview';preview.type='button';
  preview.textContent=formatText(grouping()?.paragraphText(group)||parts.map(e=>e.mark.text||'').join(' '));
  preview.title='Ir ao parágrafo na página '+first.page;
  preview.addEventListener('click',()=>navigate(first));
  const details=document.createElement('details');details.className='bm097-details';
  const summary=document.createElement('summary');
  summary.textContent='Ver ou editar os '+parts.length+' trechos coloridos';
  details.append(summary);
  for(const e of parts)details.append(markNode(e,meta));
  article.append(header,preview,details);
  return article;
 }
 function render(){
  const list=$('bm064PanelList'),caption=$('bm064PanelCaption');
  list.replaceChildren();
  const query=norm($('bm064Search').value).toLowerCase(),meta=getMeta();
  const displayed=grouping()?.groupRows(rows,loadJoins())||rows.map(e=>({parts:[e]}));
  updateJoinControls();
  const selected=displayed.filter(group=>!query||norm([
   group.parts[0]?.page,grouping()?.paragraphText(group),
   ...group.parts.flatMap(e=>[
    e.mark.text,getNote(e,meta),e.mark.type,e.mark.note_suggestion,
    e.mark.color_label,e.mark.subject_suggestion?.topic,e.mark.subject_suggestion?.subtopic,
    (e.mark.card_ids||[]).join(' ')
   ])
  ].join(' ')).toLowerCase().includes(query));
  const total=displayed.length;
  caption.textContent=total+' seleção(ões)/grifo(s) neste PDF · '+
   rows.length+' trecho(s) armazenado(s) · '+selected.length+' visíveis · página '+(api.currentPage||'—');
  if(!selected.length){
   const p=document.createElement('p');p.className='bm064-empty';
   p.textContent=total?'Nenhum grifo corresponde à busca.':'Nenhum grifo salvo nesta cópia do PDF.';
   list.append(p);return;
  }
  let previousPage=-1;
  for(const group of selected.slice(0,600)){
   const e=group.parts[0];if(!e)continue;
   if(e.page!==previousPage){
    previousPage=e.page;const title=document.createElement('h4');title.textContent='Página '+e.page;
    list.append(title);
   }
   list.append(joinSelector(groupedNode(group,meta),group));
  }
  if(selected.length>600){
   const extra=document.createElement('p');
   extra.textContent='Mostrando as primeiras 600 seleções; refine a busca.';
   list.append(extra);
  }
 }
 function refresh(){
  try{
   if(!api.editing){rows=[];lastKey='';$('bm064PanelList').replaceChildren();$('bm064PanelCaption').textContent='Abra um PDF editável para consultar grifos.';return}
   const current=String(api.currentId)+'|'+String(api.sourceHash);
   if(lastKey!==current){lastKey=current;$('bm064Search').value='';finishJoining()}
   rows=scan();render();
  }catch(e){$('bm064PanelCaption').textContent='Falha ao consultar grifos: '+e.message}
 }
 function setOpen(next){
  open=!!next;
  reader.classList.toggle('bm064-show-grifos',open);
  toggle.setAttribute('aria-expanded',String(open));
  panel.setAttribute('aria-hidden',String(!open));
  grip.setAttribute('aria-hidden',String(!open));
  toggle.textContent=open?'☰ Ocultar grifos':'☰ Grifos do PDF';
  if(open)refresh();
 }
 toggle.addEventListener('click',()=>setOpen(!open));
 $('bm064Close').addEventListener('click',()=>setOpen(false));
 $('bm064Refresh').addEventListener('click',refresh);
 $('bm102MergeToggle').addEventListener('click',startJoining);
 $('bm102MergeCancel').addEventListener('click',cancelJoining);
 $('bm102MergeSave').addEventListener('click',joinChosen);
 $('bm064Search').addEventListener('input',render);
 let resizing=null;
 grip.addEventListener('pointerdown',e=>{
  if(e.button!==0)return;
  resizing={x:e.clientX,width:panel.getBoundingClientRect().width};
  grip.setPointerCapture(e.pointerId);e.preventDefault();
 });
 grip.addEventListener('pointermove',e=>{
  if(!resizing||!grip.hasPointerCapture(e.pointerId))return;
  const maximum=Math.min(620,Math.max(245,reader.getBoundingClientRect().width-200));
  const width=Math.round(Math.max(245,Math.min(maximum,resizing.width+resizing.x-e.clientX)));
  reader.style.setProperty('--bm064-panel-width',width+'px');
 });
 grip.addEventListener('pointerup',e=>{
  if(!resizing)return;
  resizing=null;
  if(grip.hasPointerCapture(e.pointerId))grip.releasePointerCapture(e.pointerId);
 });
 grip.addEventListener('pointercancel',()=>{resizing=null});
 grip.addEventListener('keydown',e=>{
  if(!['ArrowLeft','ArrowRight'].includes(e.key))return;
  e.preventDefault();
  const current=panel.getBoundingClientRect().width;
  const width=Math.max(245,Math.min(620,current+(e.key==='ArrowLeft'?15:-15)));
  reader.style.setProperty('--bm064-panel-width',Math.round(width)+'px');
 });
 window.addEventListener('bm-pdf-active-page-rendered',()=>{if(open)refresh()});
 window.addEventListener('bm-pdf-mark-changed',()=>{if(open)refresh()});
 window.addEventListener('bm-pdf-storage-changed',()=>{if(open)refresh()});
 const observer=new MutationObserver(()=>{
  if(mode.classList.contains('active')){if(open)refresh();}
  else $('bm064PanelCaption').textContent='Abra um PDF editável para consultar grifos.';
 });
 observer.observe(mode,{attributes:true,attributeFilter:['class']});
 const previousAdd=api.addTextHighlight.bind(api),previousUpdate=api.updateTextHighlight.bind(api),
  previousRemove=api.removeTextHighlight.bind(api);
 api.addTextHighlight=function(...args){const value=previousAdd(...args);if(value&&open)refresh();return value};
 api.updateTextHighlight=function(...args){const value=previousUpdate(...args);if(value&&open)refresh();return value};
 api.removeTextHighlight=function(...args){const value=previousRemove(...args);if(value&&open)refresh();return value};
 // Grifos livres são salvos na camada legada. Atualizar após o pointerup e comandos de desfazer.
 const ink=$('pdfInkCanvas');
 ink?.addEventListener('pointerup',()=>{if(open)setTimeout(refresh,30)});
 for(const id of ['pdfUndo','pdfRedo','pdfClearPage','pdfEraser']){
  $(id)?.addEventListener('click',()=>{if(open)setTimeout(refresh,30)});
 }
 window.addEventListener('storage',e=>{
  if(open&&(e.key?.startsWith('BM030_STROKES_PDF:')||e.key===META||e.key?.startsWith(MERGES)))refresh();
 });
 dialog.addEventListener('close',()=>{lastKey='';rows=[];finishJoining();setOpen(false)});
 setOpen(false);
 window.BancoMestreV064PainelGrifos={refresh,open:()=>setOpen(true),close:()=>setOpen(false)};
})();


;
/* 39 assets/v066_backup_drive_grifos.js */
/* Banco Mestre V066 — backup local verificável e cópia consentida para Drive (sem sobrescrita). */
(function BancoMestreV066DriveBackup(){
 'use strict';
 const $=id=>document.getElementById(id);
 const library=$('grifos');
 if(!library||$('bm066DriveBackup'))return;
 const host=library.querySelector('.bm062-panel');
 if(!host)return;
 const box=document.createElement('section');
 box.id='bm066DriveBackup';box.className='bm066-drive-section';
 box.setAttribute('aria-label','Backup de grifos e envio consentido ao Drive');
 box.innerHTML=`
 <h3>Backup verificável e cópia privada no Google Drive</h3>
 <p>Faça uma cópia local antes de enviar dados. O Google Drive recebe <strong>uma nova cópia JSON privada somente quando você autorizar</strong>; nunca substitui PDFs, grifos, cartões ou SRS. A sincronização bidirecional ainda não está ativa.</p>
 <div class="bm066-actions">
  <button type="button" id="bm066Prepare">1. Preparar backup</button>
  <button type="button" id="bm066Download" disabled>2. Baixar JSON</button>
 </div>
 <p id="bm066Digest" class="bm066-hash" aria-live="polite"></p>
 <label class="bm066-consent"><input type="checkbox" id="bm066Confirmed" disabled> Confirmei que salvei o JSON no meu computador e autorizo enviar esta cópia ao meu Google Drive.</label>
 <div class="bm066-actions">
  <button type="button" id="bm066Upload" disabled>3. Autorizar e enviar cópia ao Drive</button>
  <a id="bm066DriveLink" target="_blank" rel="noopener noreferrer" hidden>Abrir arquivo salvo no Drive</a>
 </div>
 <p class="bm066-status" id="bm066Status" role="status" aria-live="polite">Preparação do Google Drive em andamento; a exportação local funciona independentemente do Google.</p>
 <p class="bm066-foot">Escopo do backup: apenas chaves <code>BM030_STROKES_PDF:*</code> e metadados <code>BM062_GRIFOS_META</code>. Não inclui PDFs, IndexedDB, dados do SRS ou tokens Google. Nenhuma importação automática é realizada.</p>`;
 const first=host.querySelector('.notice');
 if(first)first.after(box);else host.prepend(box);
 const status=message=>$('bm066Status').textContent=String(message||'');
 const digest=message=>$('bm066Digest').textContent=String(message||'');
 const MIME='application/json';
 const SCOPE='https://www.googleapis.com/auth/drive.file';
 const MAX=60*1024*1024;
 let prepared=null,downloaded=false,busy=false,client=null,authPending=null,everAuthorized=false,oauthReady=false;
 try{everAuthorized=localStorage.getItem('BM066_DRIVE_GRIFOS_APPROVED')==='1'}catch{}
 const enable=()=>{
  $('bm066Prepare').disabled=busy;
  $('bm066Download').disabled=busy||!prepared;
  $('bm066Confirmed').disabled=busy||!downloaded;
  $('bm066Upload').disabled=busy||!prepared||!downloaded||!$('bm066Confirmed').checked||!oauthReady;
 };
 function readLocal(){
  const records=[];let malformed=0;
  for(let i=0;i<localStorage.length;i++){
   const key=localStorage.key(i);
   if(!key?.startsWith('BM030_STROKES_PDF:'))continue;
   const value=localStorage.getItem(key);
   records.push({key,value});
   try{if(!Array.isArray(JSON.parse(value||'[]')))malformed++}catch{malformed++}
  }
  records.sort((a,b)=>a.key.localeCompare(b.key));
  return {annotation_keys:records,metadata_key:'BM062_GRIFOS_META',
   metadata_raw:localStorage.getItem('BM062_GRIFOS_META'),malformed};
 }
 const isSame=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
 async function sha256(bytes){
  if(!globalThis.crypto?.subtle)throw Error('A verificação SHA-256 requer HTTPS e um navegador compatível.');
  const digest=await crypto.subtle.digest('SHA-256',bytes);
  return [...new Uint8Array(digest)].map(n=>n.toString(16).padStart(2,'0')).join('');
 }
 const filename=()=> 'BancoMestre_Grifos_Backup_'+new Date().toISOString().replace(/[:.]/g,'-')+'.json';
 async function prepare(){
  if(busy)return;busy=true;enable();prepared=null;downloaded=false;
  $('bm066Confirmed').checked=false;$('bm066DriveLink').hidden=true;
  try{
   const raw=readLocal();
   if(!raw.annotation_keys.length&&raw.metadata_raw===null){
    digest('Nenhum grifo foi encontrado neste navegador.');
    status('Abra um PDF e crie grifos para preparar o backup.');return;
   }
   const data={format:'BancoMestreBackupGrifosV066',schema_version:1,
    exported_at:new Date().toISOString(),source_origin:location.origin,
    scope:'grifos_pdf_e_metadados_localStorage',contains_pdfs:false,
    contains_indexeddb:false,contains_srs:false,contains_oauth_tokens:false,
    count_keys:raw.annotation_keys.length,unreadable_keys:raw.malformed,
    annotation_keys:raw.annotation_keys,metadata_key:raw.metadata_key,metadata_raw:raw.metadata_raw};
   const source=JSON.stringify(data,null,2)+'\n',bytes=new TextEncoder().encode(source);
   if(bytes.byteLength>MAX)throw Error('Backup acima de 60 MB. Exporte por documento ou reduza o tamanho de forma assistida, sem apagar as marcações.');
   const sha=await sha256(bytes);
   prepared={bytes,sha,raw,name:filename(),blob:new Blob([bytes],{type:MIME})};
   digest('Cópia preparada: '+raw.annotation_keys.length+' página(s) de anotações · '+bytes.length+
    ' bytes · SHA-256: '+sha+(raw.malformed?' · Atenção: '+raw.malformed+' registro(s) com formato irregular (conteúdo bruto preservado).':''));
   status('Clique em “Baixar JSON”. O envio ao Drive só ficará disponível depois da sua confirmação.');
  }catch(e){status('Backup não preparado: '+e.message);digest('')}
  finally{busy=false;enable()}
 }
 function download(){
  if(!prepared||busy)return;
  const url=URL.createObjectURL(prepared.blob),a=document.createElement('a');
  a.href=url;a.download=prepared.name;document.body.append(a);a.click();a.remove();
  setTimeout(()=>URL.revokeObjectURL(url),45000);
  downloaded=true;status('Download solicitado. Confira o arquivo JSON na pasta de downloads e marque a confirmação somente depois de salvá-lo.');
  enable();
 }
 async function initGoogle(){
  try{
   const cfg=await fetch('assets/drive_auth_v038.json',{cache:'no-store'}).then(r=>{
    if(!r.ok)throw Error('Configuração Google não encontrada');return r.json();
   });
   if(!/^[A-Za-z0-9_-]+\.apps\.googleusercontent\.com$/.test(cfg.client_id||''))throw Error('ID Google OAuth inválido');
   if(!window.google?.accounts?.oauth2?.initTokenClient){
    await new Promise((resolve,reject)=>{
     const sc=document.createElement('script');
     sc.src='https://accounts.google.com/gsi/client';sc.async=true;
     sc.onload=resolve;sc.onerror=()=>reject(Error('Google Identity Services não carregou'));
     document.head.append(sc);
    });
   }
   if(!window.google?.accounts?.oauth2?.initTokenClient)throw Error('OAuth indisponível');
   client=google.accounts.oauth2.initTokenClient({
    client_id:cfg.client_id,scope:SCOPE,
    callback:reply=>{
     const pending=authPending;authPending=null;
     if(!pending)return;
     if(reply?.error||!reply?.access_token){
      pending.reject(Error('Autorização Google negada: '+(reply?.error||'token não recebido')));return;
     }
     if(reply.scope&&!reply.scope.split(/\s+/).includes(SCOPE)){
      pending.reject(Error('A permissão drive.file não foi concedida'));return;
     }
     everAuthorized=true;
     try{localStorage.setItem('BM066_DRIVE_GRIFOS_APPROVED','1')}catch{}
     pending.resolve(reply.access_token);
    },
    error_callback:err=>{
     const pending=authPending;authPending=null;
     if(pending)pending.reject(Error('Autorização Google cancelada: '+String(err?.type||'indisponível')));
    }
   });
   oauthReady=true;status('Google Drive pronto. Primeiro prepare e baixe um backup local para habilitar o envio consentido.');
  }catch(e){
   oauthReady=false;status('Google Drive indisponível neste navegador: '+e.message+'. O backup local continua disponível.');
  }finally{enable()}
 }
 function authorize(){
  if(!client||!oauthReady)throw Error('A autenticação do Google Drive não está pronta.');
  if(authPending)throw Error('Uma autorização já está em andamento');
  return new Promise((resolve,reject)=>{
   authPending={resolve,reject};
   try{client.requestAccessToken({prompt:everAuthorized?'':'consent'})}
   catch(e){authPending=null;reject(Error('Falha ao abrir autorização do Drive: '+e.message))}
  });
 }
 async function createPrivateCopy(token,record){
  const endpoint='https://www.googleapis.com/upload/drive/v3/files';
  const props={bm_product:'BancoMestre',bm_kind:'grifos_backup_manual',
   bm_format:'BancoMestreBackupGrifosV066',bm_sha256:record.sha};
  const init=await fetch(endpoint+'?uploadType=resumable&fields=id,name,mimeType,size,webViewLink,appProperties',{
   method:'POST',headers:{Authorization:'Bearer '+token,'Content-Type':'application/json; charset=UTF-8',
   'X-Upload-Content-Type':MIME,'X-Upload-Content-Length':String(record.blob.size)},
   body:JSON.stringify({name:record.name,mimeType:MIME,appProperties:props}),cache:'no-store'
  });
  if(!init.ok)throw Error('O Drive rejeitou a criação de uma cópia (HTTP '+init.status+')');
  const loc=init.headers.get('Location');
  if(!loc)throw Error('O Drive não retornou endereço de upload. Não foi feito reenvio automático.');
  const url=new URL(loc);
  if(url.origin!=='https://www.googleapis.com'||!url.pathname.startsWith('/upload/drive/v3/files'))
   throw Error('Endereço de upload inesperado; envio bloqueado');
  const uploaded=await fetch(url.href,{method:'PUT',
   headers:{Authorization:'Bearer '+token,'Content-Type':MIME},body:record.blob,cache:'no-store'});
  if(!uploaded.ok)throw Error('Envio não confirmado pelo Drive (HTTP '+uploaded.status+'). Verifique sua pasta antes de tentar outra cópia.');
  const response=await uploaded.json();
  if(!/^[A-Za-z0-9_-]{12,}$/.test(response.id||''))throw Error('O Drive não confirmou um ID de arquivo válido.');
  const check=await fetch('https://www.googleapis.com/drive/v3/files/'+encodeURIComponent(response.id)+
   '?fields=id,name,mimeType,size,appProperties,trashed',{headers:{Authorization:'Bearer '+token},cache:'no-store'});
  if(!check.ok)throw Error('Arquivo enviado, porém a conferência de metadados não foi possível. Verifique seu Drive antes de reenviar.');
  const info=await check.json();
  if(info.trashed||info.id!==response.id||info.mimeType!==MIME||
   Number(info.size)!==record.blob.size||info.appProperties?.bm_sha256!==record.sha)
   throw Error('A verificação de tamanho/metadados não corresponde ao backup local. Verifique o Drive antes de reenviar.');
  return {id:response.id,name:info.name};
 }
 async function upload(){
  if(busy||!prepared||!downloaded||!$('bm066Confirmed').checked||!oauthReady)return;
  busy=true;enable();
  const current=prepared;
  try{
   if(!isSame(readLocal(),current.raw)){
    prepared=null;downloaded=false;$('bm066Confirmed').checked=false;
    digest('Os grifos mudaram desde o backup anterior. Prepare e baixe uma nova cópia.');
    throw Error('O estado local mudou; não é seguro enviar a cópia antiga');
   }
   status('Solicitando autorização específica para criar uma cópia no seu Google Drive...');
   // A solicitação do Google deve ocorrer diretamente durante o clique.
   const promise=authorize();
   const token=await promise;
   status('Permissão concedida. Criando nova cópia JSON privada no Meu Drive...');
   const result=await createPrivateCopy(token,current);
   const link=$('bm066DriveLink');
   link.href='https://drive.google.com/file/d/'+encodeURIComponent(result.id)+'/view';
   link.textContent='Abrir cópia: '+result.name;link.hidden=false;
   try{localStorage.setItem('BM066_DRIVE_GRIFOS_LAST_COPY',JSON.stringify({
    id:result.id,sha256:current.sha,uploaded_at:new Date().toISOString(),name:result.name}))}catch{}
   status('Cópia privada no Drive confirmada pelo tamanho e metadados. Nenhuma marcação local, PDF, cartão ou SRS foi alterado.');
  }catch(e){
   status('Não foi possível confirmar o backup no Drive: '+e.message+
    '. Nenhuma informação local foi apagada e o sistema não fará reenvios automáticos.');
  }finally{busy=false;enable()}
 }
 $('bm066Prepare').addEventListener('click',prepare);
 $('bm066Download').addEventListener('click',download);
 $('bm066Confirmed').addEventListener('change',enable);
 $('bm066Upload').addEventListener('click',upload);
 enable();initGoogle();
 window.BancoMestreGrifosDriveV066={get ready(){return oauthReady},get hasSnapshot(){return !!prepared}};
})();


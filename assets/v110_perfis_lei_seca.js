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
   ['condicao','sob pena de nulidade',0,'Condição/consequência vinculada à validade']
  ]},
 {id:'improbidade',label:'Lei 8.429/1992 · Improbidade',desc:'Sujeitos, tipificação, dolo, sanções e hipóteses de não aplicação.',topic:'Improbidade administrativa',subtopic:'Lei 8.429/1992',discipline:'Legislação geral',
  detect:[/\blei\s*(?:n(?:o|º|°)?\s*)?8[.\s]?429\b/,/\blei de improbidade administrativa\b/],
  question:'Quem é o sujeito? Qual conduta tipificada? Qual elemento subjetivo e consequência? Há exclusão?',
  rules:[
   ['agente','agente publico',0,'Sujeito normativo expressamente identificado'],
   ['regra','constitui ato de improbidade',4,'Tipificação expressa de improbidade'],
   ['regra','constitui ato de improbidade administrativa',3,'Tipificação expressa de improbidade'],
   ['regra','importa enriquecimento ilicito',3,'Enriquecimento ilícito como núcleo normativo'],
   ['condicao','mediante dolo',2,'Elemento subjetivo expresso'],
   ['condicao','comprovado dolo',2,'Exigência expressa de dolo'],
   ['excecao','nao configura ato de improbidade',3,'Ausência de tipificação expressa'],
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
   ['excecao','independe do consentimento',3,'Hipótese sem exigência de consentimento']
  ]},
 {id:'lc95',label:'LC 95/1998 · Técnica legislativa',desc:'Estrutura artigo/parágrafo/inciso/alínea; separar enumeração de ressalva.',topic:'Técnica legislativa',subtopic:'LC 95/1998',discipline:'Legislação geral',
  detect:[/\blei complementar\s*(?:n(?:o|º|°)?\s*)?95\b/,/\blc\s*95(?:\/1998)?\b/,/\btecnica legislativa\b/],
  question:'O dispositivo é caput, parágrafo, inciso ou alínea? Contém regra, sujeito, condição ou exceção expressa?',
  rules:[
   ['regra','a unidade basica de articulacao sera o artigo',0,'Definição expressa da unidade de articulação'],
   ['regra','os artigos desdobrar-se-ao',5,'Regra de desdobramento normativo']
  ]}
];
const byId=new Map(specs.map(p=>[p.id,p]));
const profiles=Object.freeze(specs.map(({id,label,desc,topic,subtopic,discipline,question})=>
 Object.freeze({id,label,desc,topic:topic||'',subtopic:subtopic||'',discipline:discipline||'',question})));
function detectDocument(title){
 const t=normalize(title);
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
function mergeSegments(tokens,baseResult,extras,profile){
 const existing=baseResult.segments.map(x=>({...x}));
 const review=baseResult.review.slice();
 const generated=[];
 for(const p of extras){
  const intended=new Set(Array.from({length:p.end-p.start+1},(_,k)=>k+p.start));
  const colliding=existing.filter(s=>{
   const ids=indicesFor(s,tokens);return [...intended].some(x=>ids.has(x));
  });
  const highSame=colliding.some(s=>s.kind===p.kind&&s.confidence==='alta');
  const conflict=colliding.some(s=>s.kind!==p.kind);
  const explicitExclusion=p.kind==='excecao'&&
   /^(?:não configura|não caracteriza|é inexigível|é dispensável|serão dispensadas|não se aplica|independe do consentimento)/iu.test(p.text);
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
 return {segments:all,suggestions:all,review:review.filter(x=>x.requires_review),total:tokens.length,
  recognized:new Set(all.flatMap(x=>[...indicesFor(x,tokens)])).size,
  coverage:tokens.length?new Set(all.flatMap(x=>[...indicesFor(x,tokens)])).size/tokens.length:0,
  profileId:profile.id,reason:all.length?'':'Nenhuma expressão segura reconhecida'};
}
function analyzeWords(tokens,profileId='geral'){
 const profile=byId.get(profileId)||byId.get('geral');
 const general=base.analyzeWords(tokens);
 if(profile.id==='geral'||!Array.isArray(tokens)||!tokens.length||
  !Array.isArray(general.segments)||!general.total)
  return {...general,profileId:'geral',segments:(general.segments||[]).map(s=>({...s,calibration_profile:'geral'}))};
 const words=tokens.map(t=>token(t.text)),used=new Set(),extras=[];
 for(const [kind,phrase,extraWords,evidence] of profile.rules){
  const match=phrase.split(' ');
  for(let i=0;i<=words.length-match.length;i++){
   if(!match.every((part,j)=>words[i+j]===part))continue;
   const start=i;let end=i+match.length-1;
   for(let extra=0;extra<extraWords&&end+1<words.length;extra++){
    const next=words[end+1],current=String(tokens[end].text||'');
    if(/[;.!?]$/u.test(current)||/,$/u.test(current))break;
    if(/^(?:salvo|exceto|ressalvado|ressalvada|quando|mediante|desde)$/u.test(next))break;
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
   extras.push({kind,confidence:'alta',evidence:'Perfil '+profile.label+': '+evidence,
    calibration_evidence:evidence,requires_review:false,start,end,
    text,rects:selected.flatMap(t=>t.rects).slice(0,250),color:b.color,color_label:b.label,
    anchor:{quote:text,prefix:String(selected[0].prefix||'').slice(-100),
     suffix:String(selected.at(-1).suffix||'').slice(0,100)},
    classification_status:'sugestao',classification_kind:kind});
   for(let j=start;j<=end;j++)used.add(j);
  }
 }
 return mergeSegments(tokens,general,extras,profile);
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

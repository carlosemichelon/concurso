/* V126 — bloqueio de fragmentos normativos incompletos antes do grifo automático.
 * NUNCA cria uma marca, nem grava dados. Rebaixa sugestões genéricas inseguras.
 * Não aplica às frases literais da CF/88 arts. 1º–4º, validadas com contexto;
 * essas permanecem no classificador V114/V121.
 */
(function(){
'use strict';
if(window.BancoMestreQualidadeNormativaV126)return;
const previous=window.BancoMestreCalibradoresV110;
if(!previous?.analyzeWords)return;
const normal=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/gu,'')
 .toLowerCase().replace(/\s+/gu,' ').trim();
const rom=/\b(?:I|II|III|IV|V|VI|VII|VIII|IX|X|XI|XII|XIII|XIV|XV)\s*[-–—.)]/u;
const dangling=/\b(?:do|da|de|dos|das|no|na|nos|nas|o|a|os|as|e|ou|com|para|que|em|sob|por|ate|mediante|se|quando|cujo|cuja|conforme)$/u;
const completeNominals=new Set([
 'nos termos da lei','nos termos desta constituicao','na forma da lei',
 'por maioria absoluta','maioria absoluta','dois tercos','por dois tercos',
 'em igualdade de condicoes','mediante decisao judicial','mediante autorizacao previa'
]);
function cleanEnding(text){
 return normal(text).replace(/[\s,;:.!?]+$/gu,'').trim();
}
function certified(segment){
 // These parsers additionally verified the source article + literal context.
 return !!(segment?.legal_article&&segment?.legal_source_key==='CF88')||
  /CF\/88 art\. 1º/u.test(String(segment?.calibration_evidence||''));
}
function nextTokenAfter(segment,tokens){
 let last=Number.isInteger(segment.end)?segment.end:-1;
 if(last<0){
  const rs=new Set((segment.rects||[]).map(r=>Array.isArray(r)?
   r.map(x=>Number(x).toFixed(6)).join('|'):''));
  for(let i=0;i<tokens.length;i++)if((tokens[i].rects||[]).some(r=>
   Array.isArray(r)&&rs.has(r.map(x=>Number(x).toFixed(6)).join('|'))))last=i;
 }
 return last>=0?normal(tokens[last+1]?.text||'').replace(/[^\p{L}\p{N}]+$/gu,''):'';
}
const newClauseStarts=new Set([
 'sendo','salvo','ressalvado','ressalvada','exceto','quando',
 'desde','ficando','cabendo','observado','observada'
]);

function inspectSegment(segment,tokens){
 if(certified(segment))return {safe:true,reason:'literal_contextual'};
 const text=String(segment?.text||'').trim(),norm=cleanEnding(text);
 if(!text)return {safe:false,reason:'trecho_vazio'};
 if(rom.test(text))return {safe:false,reason:'marcador_de_inciso_dentro_do_trecho'};
 if(/(?:^|\s)(?:art\.|§|parágrafo)\s*\d/iu.test(text))
  return {safe:false,reason:'referencia_legal_embutida_em_nucleo'};
 if(dangling.test(norm))return {safe:false,reason:'frase_termina_em_conector'};
 if(/(?:quando|desde que|se|salvo|ressalvado|exceto)\s*:/iu.test(text))
  return {safe:false,reason:'cabecalho_de_condicao_sem_inciso'};
 if(/^(?:quando|se|salvo|exceto|ressalvado)$/u.test(norm))
  return {safe:false,reason:'operador_sem_complemento'};
 const words=norm.match(/[\p{L}\p{N}]+/gu)||[];
 if(words.length<2)return {safe:false,reason:'nucleo_sem_contexto'};
 if(/,$/u.test(text)&&!newClauseStarts.has(nextTokenAfter(segment,tokens)))
  return {safe:false,reason:'virgula_nao_encerra_nucleo'};
 if(/[.,;!?]$/u.test(text)||completeNominals.has(norm))
  return {safe:true,reason:'oracao_delimitada'};
 // Short keywords can be a complete *nucleus* even without the full clause:
 // blocking every unpunctuated match caused 180/216 V112 regressions.
 // A long, unpunctuated match with subsequent words is riskier.
 if(words.length>=9&&nextTokenAfter(segment,tokens))
  return {safe:false,reason:'nucleo_longo_sem_limite_textual'};
 return {safe:true,reason:'nucleo_curto_explicito'};
}
function evaluate(tokens,profileId='geral'){
 const baseline=previous.analyzeWords(tokens,profileId);
 if(!Array.isArray(tokens)||!Array.isArray(baseline?.segments))return baseline;
 const accepted=[],rejected=[];
 for(const s of baseline.segments){
  const check=inspectSegment(s,tokens);
  if(check.safe||s.confidence!=='alta'||s.requires_review){
   accepted.push({...s,quality_gate:check.reason});
  }else{
   rejected.push({...s,confidence:'baixa',requires_review:true,
    quality_gate:check.reason,original_confidence:s.confidence,
    reason:'Trecho não suficientemente completo para grifo automático: '+check.reason});
  }
 }
 accepted.forEach((s,i)=>{s.segment_index=i+1;s.segment_total=accepted.length});
 return {...baseline,segments:accepted,suggestions:accepted,
  review:[...(baseline.review||[]),...rejected],
  quality_gate:{version:'v125-safe-clause-v1',accepted:accepted.length,rejected:rejected.length,
   policy:'suspender_grifo_automatico_de_fragmentos_sem_limite_claro'},
  // Coverage from baseline must not be presented as safe auto coverage.
  coverage:tokens.length?Math.min(1,accepted.reduce((n,s)=>{
   if(Number.isInteger(s.start)&&Number.isInteger(s.end))
    return n+s.end-s.start+1;
   return n+(String(s.text||'').match(/\S+/gu)||[]).length;
  },0)/tokens.length):0};
}
window.BancoMestreCalibradoresV110=Object.freeze({...previous,analyzeWords:evaluate});
window.BancoMestreQualidadeNormativaV126=Object.freeze({
 inspectSegment,evaluate,version:'V126-SAFE-CLAUSE',mode:'fail-closed'
});
})();
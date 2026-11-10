/* Banco Mestre V075 — uma seleção = um grifo.
 * Analisa sinais da metodologia de seis cores sem segmentar o texto para gravação.
 * Conflitos e falta de evidência exigem escolha humana; nenhum grifo é salvo aqui.
 */
(function(){
'use strict';
if(window.BancoMestreAnaliseSelecaoV075)return;
const LABELS={
 proibicao:'Proibições e vedações',
 obrigacao:'Obrigações e deveres',
 prazo_numero:'Prazos e números',
 excecao:'Exceções e ressalvas',
 banca:'Palavras-chave da banca',
 destaque:'Conteúdo importante a destacar'
};
const CATEGORIES=['proibicao','obrigacao','prazo_numero','excecao','banca','destaque'];
const wordsOf=input=>String(input||'').trim().split(/\s+/u).filter(Boolean)
 .map(text=>({text,rects:[]}));
function analyze(tokens,selectionText){
 const engine=window.BancoMestreClassificadorV072||window.BancoMestreClassificadorV071;
 const text=String(selectionText||tokens?.map(x=>x?.text||'').join(' ')||'').replace(/\s+/gu,' ').trim();
 if(!engine||!text)return {status:'indefinida',kind:null,reason:'Sem texto selecionável para classificar.',candidates:[],confidence:'indefinida',text};
 const parsed=engine.classifyWords(Array.isArray(tokens)&&tokens.length?tokens:wordsOf(text));
 if(!Array.isArray(parsed)||!parsed.length)return {status:'indefinida',kind:null,reason:'Trecho extenso ou sem pistas seguras. Escolha uma cor.',candidates:[],confidence:'indefinida',text};
 // Considerar somente sinais explícitos (alta/média); a categoria laranja genérica
 // que preenche outras palavras não deve vencer a categoria detectada.
 const evidence=parsed.filter(p=>p&&CATEGORIES.includes(p.kind)&&p.kind!=='destaque'&&
  ['alta','media'].includes(p.confidence));
 const candidates=[...new Set(evidence.map(x=>x.kind))];
 // Uma nova oração autônoma separada por ponto e com texto substantivo não pode
 // receber automaticamente a cor de um pequeno sinal da oração anterior.
 const normalizedSentenceBoundaries=text.replace(/\b(?:Art|arts|n|inc)\.(?=\s*\d)/giu,m=>m.slice(0,-1));
 const sentences=normalizedSentenceBoundaries.split(/(?<=[.!?])\s+(?=[\p{Lu}§\d])/u);
 const otherClauses=sentences.length>1&&
  parsed.some(p=>p.kind==='destaque'&&p.text.trim().length>12);
 const uncertain=candidates.length===0||otherClauses;
 if(candidates.length>1||otherClauses){
  return {
   status:'ambigua',kind:null,confidence:'indefinida',candidates,
   reason:'A seleção contém '+(candidates.length>1?
    candidates.map(k=>LABELS[k]||k).join(' + '):'orações de categorias diferentes')+
    '. Escolha uma única cor para todo o trecho; não haverá divisão.',
   text,segments_analyzed:parsed.length
  };
 }
 if(uncertain){
  return {status:'indefinida',kind:null,confidence:'indefinida',candidates:[],
   reason:'Não há indicação suficiente para garantir uma cor. Escolha a categoria do trecho inteiro.',
   text,segments_analyzed:parsed.length};
 }
 const kind=candidates[0],color=engine.COLORS?.[kind]?.color;
 const sources=evidence.filter(x=>x.kind===kind);
 const hasStrong=sources.some(x=>x.confidence==='alta');
 const basis=sources.find(x=>x.detail==='referencia_normativa')?.detail||
  sources.find(x=>['expressao','numero','percentual','palavra'].includes(x.detail))?.detail||
  'regra_local';
 return {
  status:'clara',kind,color,confidence:hasStrong?'alta':'media',
  detail:basis,label:engine.COLORS?.[kind]?.label||LABELS[kind],
  candidates:[kind],reason:'Sinal '+(hasStrong?'explícito':'reconhecido')+
   ' de '+(LABELS[kind]||kind)+'. Será criado um único grifo para a seleção inteira.',
  text,segments_analyzed:parsed.length
 };
}
function planOneHighlight(selection,analysis,manualChoice,style='highlight'){
 if(!selection||typeof selection.text!=='string'||!selection.text.trim()||
  !Array.isArray(selection.rects)||!selection.rects.length)return {status:'invalid'};
 const manual=!!manualChoice;
 if(!manual&&analysis?.status!=='clara')return {status:'review'};
 const kind=manual?CATEGORIES.includes(manualChoice.kind)?manualChoice.kind:'nao_classificado':analysis.kind;
 const color=manual?manualChoice.color:analysis.color;
 if(!/^#[0-9a-f]{6}$/i.test(color||''))return {status:'invalid'};
 const mark={
  text:selection.text,rects:selection.rects,anchor:selection.anchor,
  page:selection.page,documentId:selection.documentId,sourceHash:selection.sourceHash,
  color,color_label:manual?String(manualChoice.label||'Personalizado'):String(analysis.label),
  style,classification_kind:kind,classification_status:manual?'confirmada':'sugestao',
  confidence:manual?'indefinida':analysis.confidence,
  detail:manual?'escolha_manual':analysis.detail,
  segment_index:null,segment_total:1
 };
 return {status:'ready',mark,manual};
}
window.BancoMestreAnaliseSelecaoV075={analyze,planOneHighlight,CATEGORIES,LABELS};
})();

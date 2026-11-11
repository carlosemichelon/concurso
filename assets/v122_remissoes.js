/* V122 — resolucao conservadora de remissoes legais, SEM alterar grifos.
 * No browser, no network, no storage, no access to user annotations.
 * An internal reference without an explicit target stays unresolved.
 * This layer wraps V121; it never classifies colors or interprets legal validity.
 */
(function(){
'use strict';
if(window.BancoMestreReferenciasV122)return;
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
const supportsRel=/\b(?:conforme|previsto|prevista|disposto|disposta|referido|referida|observado|observada|segundo|citada|citado|referencia)\b/u;
function relationContext(flat,i){
 const before=flat.slice(Math.max(0,i-9),i).map(x=>x.word).join(' ');
 return supportsRel.test(before)||/\b(?:nos termos|na forma|de acordo|em cumprimento|em conformidade|em observancia)\b/u.test(before);
}
function lawsInPhrase(phrase){
 const found=[];
 const mark=(key,evidence)=>{if(!found.some(x=>x.key===key&&x.evidence===evidence))found.push({key,evidence})};
 if(/\b(?:constituicao(?: da republica| federal)?|cf(?:\s*88)?)\b/u.test(phrase))
  mark('CF88','referencia expressa a Constituicao/CF');
 const pattern=/\b(?:lei\s+complementar|lc|lei)\s+(?:n(?:o|umero)?\s+)?(\d{1,6})(?:\s+(\d{3}))?(?:\s+(\d{4}))?\b/gu;
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
   target=active+':art'+number;resolution='explicit_internal';
   basis='Remissao textual a esta lei/Constituicao, com perfil escolhido';
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
window.BancoMestreReferenciasV122=Object.freeze({
 legalReference,version:'V122-REFERENCES-EXPLICIT',policy:'do-not-assume-cited-law',
 keys:LAW_KEYS
});
})();
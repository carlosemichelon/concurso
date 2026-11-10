/* Banco Mestre V075 — seis cores fixas, com laranja somente para conteúdo importante.
 * Não converte marcações já existentes; apenas muda rótulos e sugestões futuras.
 */
(function(){
 'use strict';
 if(window.BancoMestreClassificadorV075)return;
 const previous=window.BancoMestreClassificadorV072;
 if(!previous)return;
 const colors=Object.freeze({
  proibicao:Object.freeze({color:'#FF8F96',label:'Proibições e vedações'}),
  obrigacao:Object.freeze({color:'#86DCAA',label:'Obrigações e deveres'}),
  prazo_numero:Object.freeze({color:'#FFEA70',label:'Prazos e números'}),
  excecao:Object.freeze({color:'#89C7FF',label:'Exceções e ressalvas'}),
  banca:Object.freeze({color:'#CCA7FF',label:'Palavras-chave da banca'}),
  destaque:Object.freeze({color:'#FFB86B',label:'Conteúdo importante a destacar'})
 });
 function classifyWords(tokens,options={}){
  const parts=previous.classifyWords(tokens,options);
  if(!Array.isArray(parts))return [];
  return parts.map(p=>p?.kind==='regra'?{
   ...p,kind:'destaque',classification_kind:'destaque',
   color:colors.destaque.color,color_label:colors.destaque.label,
   confidence:'baixa',detail:'contexto_geral'
  }:p);
 }
 function suggestNote(part){
  if(part?.kind==='destaque'){
   const raw=String(part.text||'').replace(/\s+/g,' ').trim().slice(0,280);
   return {text:'Conteúdo importante selecionado: registrar por que merece revisão, qual seu alcance e a fonte'+
    (raw?'. Trecho-fonte: “'+raw+'”':''),status:'sugestao_nao_confirmada'};
  }
  return previous.suggestNote(part);
 }
 const next=Object.freeze({
  COLORS:colors,classifyWords,suggestNote,
  suggestSubject:previous.suggestSubject,plain:previous.plain
 });
 window.BancoMestreClassificadorV075=next;
 // A análise V075 e o grifador leem a referência V072; substituir somente
 // a referência em memória preserva os scripts V071/V072 e todos os registros.
 window.BancoMestreClassificadorV072=next;
})();

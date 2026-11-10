/* Banco Mestre V084 — seleção textual validada, sem enviar chave nem alterar PDFs. */
(function(){
'use strict';
if(window.BancoMestreSelectionEngineV084)return;
const COLORS=Object.freeze({
 proibicao:{color:'#FF8F96',label:'Proibições e vedações'},
 obrigacao:{color:'#86DCAA',label:'Obrigações e deveres'},
 prazo_numero:{color:'#FFEA70',label:'Prazos e números'},
 excecao:{color:'#89C7FF',label:'Exceções e ressalvas'},
 banca:{color:'#CCA7FF',label:'Palavras-chave da banca'},
 destaque:{color:'#FFB86B',label:'Conteúdo importante'}
}),LIMIT=16;
const validRect=r=>Array.isArray(r)&&r.length===4&&r.every(n=>Number.isFinite(n)&&n>=0&&n<=1)&&r[0]<r[2]&&r[1]<r[3];
function validSource(s){
 if(typeof s?.text!=='string'||!s.text.trim()||s.text.length>16000||!Array.isArray(s.positionedWords)||s.positionedWords.length>180)return false;
 const matches=[...s.text.matchAll(/\S+/gu)];
 return matches.length>0&&matches.length===s.positionedWords.length&&matches.every((m,i)=>{
  const w=s.positionedWords[i];return w?.text===m[0]&&w.start===m.index&&w.end===m.index+m[0].length&&w.rects?.length&&w.rects.every(validRect);
 });
}
function create(s,start,end,kind,reason='',origin='manual'){
 if(!validSource(s)||!Object.hasOwn(COLORS,kind)||!Number.isInteger(start)||!Number.isInteger(end)||start<0||end>s.text.length||end<=start)return {error:'Trecho ou categoria inválida.'};
 const sub=s.text.slice(start,end);start+=(sub.match(/^\s*/u)||[''])[0].length;end-=(sub.match(/\s*$/u)||[''])[0].length;
 if(start>=end)return {error:'Seleção vazia.'};
 const a=s.positionedWords.findIndex(w=>w.start===start),b=s.positionedWords.findIndex(w=>w.end===end);
 if(a<0||b<a)return {error:'Trecho corta palavras ou sua geometria não corresponde ao PDF.'};
 const merge=window.BancoMestreMulticorV081?.joinRects;
 if(typeof merge!=='function')return {error:'Geometria indisponível.'};
 const rects=merge(s.positionedWords.slice(a,b+1).flatMap(w=>w.rects));
 if(!rects?.length||rects.length>250||!rects.every(validRect))return {error:'Retângulos inválidos.'};
 return {start,end,text:s.text.slice(start,end),rects,kind,color:COLORS[kind].color,label:COLORS[kind].label,
  reason:String(reason).slice(0,450),origin:['manual','claude','local'].includes(origin)?origin:'manual'};
}
function verify(s,segments){
 if(!validSource(s)||!Array.isArray(segments)||segments.length>LIMIT)return {ok:false,error:'Seleção ou lista inválida.',segments:[]};
 const sorted=[...segments].sort((a,b)=>a.start-b.start||a.end-b.end);let prev=-1;
 for(const item of sorted){
  if(item?.error||item.start<prev||s.text.slice(item.start,item.end)!==item.text||item.color!==COLORS[item.kind]?.color)
   return {ok:false,error:'Trechos sobrepostos ou diferentes do texto original.',segments:[]};
  const recreated=create(s,item.start,item.end,item.kind,item.reason,item.origin);
  if(recreated.error||JSON.stringify(recreated.rects)!==JSON.stringify(item.rects))
   return {ok:false,error:'Falha de alinhamento com o PDF.',segments:[]};
  prev=item.end;
 }
 return {ok:true,segments:sorted};
}
function fromAI(s,data){
 if(!Array.isArray(data?.segments)||data.segments.length>LIMIT)return {ok:false,error:'Resposta da IA fora do formato esperado.',segments:[]};
 const items=[];
 for(const x of data.segments){
  const item=create(s,x?.start,x?.end,x?.kind,x?.reason,'claude');
  if(item.error||item.text!==x?.quote)return {ok:false,error:'A IA sugeriu texto alterado ou palavra cortada.',segments:[]};
  items.push(item);
 }
 return verify(s,items);
}
function fromLocal(s){
 const p=window.BancoMestreMulticorV081?.prepare?.(s?.positionedWords,s?.text);
 if(p?.status!=='ready')return {ok:false,error:p?.reason||'Sem sugestões locais.',segments:[]};
 return verify(s,p.segments.map(x=>create(s,x.start,x.end,x.kind,'Regra local','local')));
}
function records(s,parts){
 const v=verify(s,parts);if(!v.ok)return v;
 return {ok:true,records:v.segments.map((x,i)=>({
  text:x.text,rects:x.rects,anchor:{quote:x.text,prefix:s.text.slice(Math.max(0,x.start-90),x.start),suffix:s.text.slice(x.end,x.end+90)},
  page:s.page,documentId:s.documentId,sourceHash:s.sourceHash,
  color:x.color,color_label:x.label,style:'highlight',
  classification_kind:x.kind,classification_status:'confirmada',
  confidence:'indefinida',detail:'escolha_manual',
  note_suggestion:(x.origin==='claude'?'Revisão de sugestão Claude: ':x.origin==='local'?'Revisão de sugestão local: ':'Marcação manual: ')+x.reason,
  segment_index:i+1,segment_total:v.segments.length
 }))};
}
window.BancoMestreSelectionEngineV084=Object.freeze({COLORS,LIMIT,validSource,create,verify,fromAI,fromLocal,records});
})();
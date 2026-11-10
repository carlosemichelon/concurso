/* Banco Mestre V081 — multicolor por cláusulas. Planejamento puro, sem escrita.
 * Aceita apenas palavras completas com geometria correspondente ao PDF.
 * Evidência explícita, máximo 12 trechos. Laranja nunca automático.
 */
(function(){
'use strict';
if(window.BancoMestreMulticorV081)return;
const C=['proibicao','obrigacao','prazo_numero','excecao','banca'];
const okRect=r=>Array.isArray(r)&&r.length===4&&r.every(n=>Number.isFinite(n)&&n>=0&&n<=1)&&r[0]<r[2]&&r[1]<r[3];
const compact=s=>String(s||'').replace(/\s+/gu,' ').trim();
function joinRects(input){
 const boxes=input.filter(okRect).map(x=>x.slice()).sort((a,b)=>a[1]-b[1]||a[0]-b[0]),output=[];
 for(const b of boxes){
  const a=output.at(-1);
  if(a&&Math.abs(a[1]-b[1])<.005&&Math.abs(a[3]-b[3])<.008&&b[0]<=a[2]+.017&&b[2]>=a[0]){
   a[0]=Math.min(a[0],b[0]);a[1]=Math.min(a[1],b[1]);a[2]=Math.max(a[2],b[2]);a[3]=Math.max(a[3],b[3]);
  }else output.push(b);
 }
 return output.length<=250?output:[];
}
function prepare(words,selectedText){
 const e=window.BancoMestreClassificadorV075||window.BancoMestreClassificadorV072;
 const fail=reason=>({status:'review',reason,segments:[]});
 const text=String(selectedText||'').replace(/\u00a0/g,' ');
 if(!e?.classifyWords)return fail('Classificador não carregado.');
 if(!text.trim()||text.length>20000||!Array.isArray(words)||!words.length||words.length>180)
  return fail('Seleção acima dos limites de segurança.');
 const expected=[...text.matchAll(/\S+/gu)];
 if(words.length!==expected.length)return fail('Não foi possível associar todas as palavras a retângulos.');
 for(let i=0;i<words.length;i++){
  const w=words[i],m=expected[i];
  if(!w||w.text!==m[0]||w.start!==m.index||w.end!==m.index+m[0].length||
     !Array.isArray(w.rects)||!w.rects.length||!w.rects.every(okRect))
   return fail('Geometria incompatível: nenhuma cor aplicada.');
 }
 const groups=e.classifyWords(words);
 if(!Array.isArray(groups)||!groups.length)return fail('Sem grupos de palavras reconhecidos.');
 const segments=[];let cursor=0;
 for(const group of groups){
  const count=compact(group?.text).split(/\s+/gu).length;
  if(!count||cursor+count>words.length||compact(words.slice(cursor,cursor+count).map(w=>w.text).join(' '))!==compact(group.text))
   return fail('Classificação fora da ordem do texto; operação bloqueada.');
  const first=words[cursor],last=words[cursor+count-1],covered=words.slice(cursor,cursor+count);
  cursor+=count;
  if(!C.includes(group.kind)||!['alta','media'].includes(group.confidence)||!group.detail)continue;
  const excerpt=text.slice(first.start,last.end);
  if(!excerpt.trim()||excerpt.length>260)continue;
  const rects=joinRects(covered.flatMap(w=>w.rects));
  if(!rects.length)return fail('Não foi possível posicionar o trecho.');
  const color=e.COLORS?.[group.kind];if(!color?.color)continue;
  const prev=segments.at(-1),sep=prev?text.slice(prev.end,first.start):'';
  if(prev&&prev.kind===group.kind&&prev.end<=first.start&&!/[.;:!?]/.test(sep)&&prev.text.length+excerpt.length+sep.length<=260){
   const combined=joinRects([...prev.rects,...rects]);
   if(!combined.length)return fail('Limite geométrico excedido.');
   prev.end=last.end;prev.text=text.slice(prev.start,prev.end);prev.rects=combined;
   if(group.confidence==='alta')prev.confidence='alta';
  }else{
   segments.push({kind:group.kind,color:color.color,label:color.label,
    confidence:group.confidence,detail:group.detail,start:first.start,end:last.end,text:excerpt,rects});
  }
 }
 if(cursor!==words.length)return fail('Trecho não foi coberto integralmente pelo classificador.');
 if(!segments.length)return fail('Sem pistas claras. Trecho não grifado automaticamente.');
 if(segments.length>12)return fail('Mais de 12 trechos: reduza a seleção.');
 for(let i=1;i<segments.length;i++)if(segments[i].start<segments[i-1].end)return fail('Trechos sobrepostos.');
 return {status:'ready',text,segments:segments.map((s,i)=>({...s,segment_index:i+1,segment_total:segments.length})),
  word_count:words.length,selection_exact:segments.length===1&&compact(segments[0].text)===compact(text),
  reason:segments.length+' trecho(s) identificados; confira a prévia antes de aplicar.'};
}
function intersectsExisting(segments,marks){
 const old=(Array.isArray(marks)?marks:[]).filter(m=>m?.type==='text_highlight'&&Array.isArray(m.rects));
 for(const s of segments)for(const a of s.rects)for(const m of old)for(const b of m.rects){
  if(!okRect(b))continue;
  const x=Math.max(0,Math.min(a[2],b[2])-Math.max(a[0],b[0]));
  const y=Math.max(0,Math.min(a[3],b[3])-Math.max(a[1],b[1]));
  const area=Math.min((a[2]-a[0])*(a[3]-a[1]),(b[2]-b[0])*(b[3]-b[1]));
  if(area>0&&x*y/area>.24)return true;
 }
 return false;
}
window.BancoMestreMulticorV081=Object.freeze({prepare,joinRects,intersectsExisting});
})();
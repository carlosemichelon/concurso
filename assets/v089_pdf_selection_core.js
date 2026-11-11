/* Banco Mestre V089 — selection precision engine.
 * Geometry from PDF textContent, not browser DOM selection. Never crosses detected columns.
 * Pure functions, no localStorage, no mutation of PDF/marks. */
(function(){
'use strict';
if(window.BancoMestrePreciseCoreV089)return;
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const finite=x=>Number.isFinite(x);
const validBox=w=>[w.x0,w.x1,w.y0,w.y1].every(finite)&&w.x0<w.x1&&w.y0<w.y1;
function buildWords(content,viewport,util,canvas){
 if(!Array.isArray(content?.items)||!viewport?.width||!viewport?.height||!util?.transform)return [];
 const measure=canvas?.getContext?.('2d'),words=[];
 for(const item of content.items){
  if(!item?.str||!Array.isArray(item.transform)||item.transform.length!==6||!finite(item.width))continue;
  const mat=util.transform(viewport.transform,item.transform);
  const fontHeight=Math.hypot(mat[2],mat[3]);
  if(!finite(fontHeight)||fontHeight<2||fontHeight>viewport.height*.15||Math.abs(mat[1])>fontHeight*.15)continue;
  const style=content.styles?.[item.fontName]||{};
  const ascent=finite(style.ascent)?style.ascent:finite(style.descent)?1+style.descent:.8;
  const left=mat[4],top=mat[5]-clamp(ascent,.35,1.2)*fontHeight;
  const width=item.width*viewport.scale;
  if(!finite(width)||width<=0||width>viewport.width*.9)continue;
  const line=item.str.replace(/\u00a0/gu,' ');
  if(!line.trim())continue;
  let widths=null,total=0;
  if(measure){
   try{
    measure.font=fontHeight+'px '+(style.fontFamily||'sans-serif');
    total=measure.measureText(line).width;
    if(total>0){
     widths=Array(line.length+1);widths[0]=0;
     for(let k=1;k<=line.length;k++)widths[k]=measure.measureText(line.slice(0,k)).width;
    }
   }catch{widths=null}
  }
  for(const match of line.matchAll(/\S+/gu)){
   const a=match.index,b=a+match[0].length;
   const x0=left+width*(widths?widths[a]/total:a/line.length);
   const x1=left+width*(widths?widths[b]/total:b/line.length);
   if(x1-x0<.45||x0>viewport.width||x1<0||top>viewport.height||top+fontHeight<0)continue;
   const word={text:match[0],x0:clamp(x0,0,viewport.width),x1:clamp(x1,0,viewport.width),
    y0:clamp(top,0,viewport.height),y1:clamp(top+fontHeight*1.05,0,viewport.height)};
   if(validBox(word))words.push(word);
   if(words.length>6000)return [];
  }
 }
 return words;
}
function detectColumns(words,width,height){
 if(!words?.length||width<120)return [0,width];
 const usable=words.filter(w=>validBox(w)&&w.y0>height*.16&&w.y1<height*.95&&
  w.x1-w.x0<width*.24);
 if(usable.length<75)return [0,width];
 // Occupancy by text line, tolerant of a few long PDF font runs.
 const heights=usable.map(w=>w.y1-w.y0).sort((a,b)=>a-b);
 const median=heights[Math.floor(heights.length/2)],rows=[];
 for(const word of [...usable].sort((a,b)=>(a.y0+a.y1)-(b.y0+b.y1))){
  const y=(word.y0+word.y1)/2,last=rows.at(-1);
  if(last&&Math.abs(y-last.y)<=Math.max(2,median*.52)){
   last.words.push(word);last.y=(last.y*(last.words.length-1)+y)/last.words.length;
  }else rows.push({y,words:[word]});
 }
 const bins=new Uint16Array(Math.ceil(width)+1);
 for(const row of rows){
  const active=new Uint8Array(bins.length);
  for(const word of row.words){
   const x0=clamp(Math.floor(word.x0),0,bins.length-1),
    x1=clamp(Math.ceil(word.x1),0,bins.length-1);
   active.fill(1,x0,x1);
  }
  for(let i=0;i<bins.length;i++)bins[i]+=active[i];
 }
 const allowedNoise=Math.floor(rows.length*.24);
 const gaps=[];let start=-1;
 for(let x=0;x<=width+1;x++){
  const occupied=x>=bins.length||bins[x]>allowedNoise;
  if(!occupied&&start<0)start=x;
  if(occupied&&start>=0){
   if(x-start>=Math.max(5,width*.012)&&start>width*.16&&x<width*.84)gaps.push({start,end:x,center:(start+x)/2});
   start=-1;
  }
 }
 // Real column gutters must separate substantial vertical reading bands.
 const best=[];
 for(const gap of gaps){
  const c=gap.center;
  if(best.some(x=>Math.abs(x-c)<width*.14))continue;
  const minRegion=width*.18;
  const candidates=[...best,c].sort((a,b)=>a-b);
  const cuts=[0,...candidates,width];
  if(cuts.some((x,i)=>i&&x-cuts[i-1]<minRegion))continue;
  const sizes=cuts.slice(1).map((right,i)=>usable.filter(w=>(w.x0+w.x1)/2>=cuts[i]&&
    (w.x0+w.x1)/2<right).length);
  if(sizes.some(n=>n<45))continue;
  best.push(c);
  if(best.length===3)break;
 }
 return [0,...best.sort((a,b)=>a-b),width];
}
function columnIndex(word,cuts){
 const x=(word.x0+word.x1)/2;
 for(let i=0;i<cuts.length-1;i++)if(x>=cuts[i]&&x<cuts[i+1])return i;
 return cuts.length-2;
}
function readingOrder(words,cuts){
 const result=[],columns=cuts.length-1;
 for(let col=0;col<columns;col++){
  const arr=words.filter(w=>columnIndex(w,cuts)===col).sort((a,b)=>
    ((a.y0+a.y1)-(b.y0+b.y1))||a.x0-b.x0);
  if(!arr.length)continue;
  const median=[...arr].map(x=>x.y1-x.y0).sort((a,b)=>a-b)[Math.floor(arr.length/2)];
  const lines=[];
  for(const w of arr){
   const mid=(w.y0+w.y1)/2,last=lines.at(-1);
   if(last&&Math.abs(mid-last.y)<=Math.max(1.75,median*.55)){
    last.words.push(w);last.y=(last.y*(last.words.length-1)+mid)/last.words.length;
   }else lines.push({y:mid,words:[w]});
  }
  for(let li=0;li<lines.length;li++){
   const line=lines[li];
   line.words.sort((a,b)=>a.x0-b.x0);
   for(const w of line.words)result.push({...w,column:col,line:li});
  }
 }
 return result;
}
function nearest(words,x,y,col=null){
 let best=null,score=Infinity;
 for(const w of words){
  if(col!==null&&w.column!==col)continue;
  const dx=Math.max(0,w.x0-x,x-w.x1),dy=Math.max(0,w.y0-y,y-w.y1),h=w.y1-w.y0;
  if(dx>Math.max(14,h*2.2)||dy>Math.max(9,h*1.6))continue;
  const candidate=dy*dy*2.5+dx*dx;
  if(candidate<score){score=candidate;best=w}
 }
 return best;
}
function selectRange(ordered,start,end,limits={}){
 if(!Array.isArray(ordered)||!start||!end||start.column!==end.column)return {ok:false,error:'Selecione o início e o fim dentro da mesma coluna.'};
 const candidates=ordered.filter(w=>w.column===start.column);
 const i=candidates.findIndex(w=>w===start||w.x0===start.x0&&w.y0===start.y0&&w.text===start.text);
 const j=candidates.findIndex(w=>w===end||w.x0===end.x0&&w.y0===end.y0&&w.text===end.text);
 if(i<0||j<0)return {ok:false,error:'As palavras não pertencem à seleção atual.'};
 const arr=candidates.slice(Math.min(i,j),Math.max(i,j)+1);
 if(!arr.length||arr.length>(limits.maxWords||180))return {ok:false,error:'Seleção muito extensa; marque uma frase ou parágrafo de cada vez.'};
 for(let n=1;n<arr.length;n++){
  if(arr[n].line===arr[n-1].line&&arr[n].x0<arr[n-1].x1-2.4)
   return {ok:false,error:'Geometria sobreposta no PDF: seleção imprecisa. Nenhum grifo será criado.'};
 }
 const width=limits.width||1,height=limits.height||1;
 let text='',prev=null;const boxes=[];
 for(const w of arr){
  const sep=!prev?'':w.line!==prev.line?'\n':' ';
  text+=sep+w.text;
  boxes.push([w.x0/width,w.y0/height,w.x1/width,w.y1/height]);
  prev=w;
 }
 if(!text||text.length>12000)return {ok:false,error:'Trecho muito extenso.'};
 const join=window.BancoMestreMulticorV081?.joinRects;
 const merged=typeof join==='function'?join(boxes):boxes;
 if(!merged?.length||merged.length>250||merged.some(r=>r.some(x=>!finite(x)||x<0||x>1)))
  return {ok:false,error:'Posicionamento impreciso; selecione novamente.'};
 return {ok:true,text,rects:merged,words:arr,first:arr[0],last:arr[arr.length-1],
  anchor:{quote:text,prefix:'',suffix:''}};
}
window.BancoMestrePreciseCoreV089=Object.freeze({buildWords,detectColumns,columnIndex,readingOrder,nearest,selectRange});
})();
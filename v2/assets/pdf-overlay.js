/* Banco Mestre V2 — visualização geométrica SOMENTE LEITURA dos grifos PDF V122.
 * Geometria normalizada 0..1; alinha com stroke(ctx,m,w,h) do pdf_v122.js.
 * Identidade de exclusão reproduz exatamente v122_grifos_sync_core.js.
 * Não importa, cria, mescla, restaura nem edita registros locais.
 */
import {pageStorageKey,LEGACY_DELETIONS_KEY} from './pdf-compat.js';
import {legacyMarkId} from './pdf-identity.js';
export {legacyMarkId} from './pdf-identity.js';

const MAX_MARKS=100000;
const MAX_BYTES=12000000;
const validColor=color=>/^#[0-9a-f]{6}$/i.test(String(color||''))?color:'#FDE68A';
const num=x=>typeof x==='number'&&Number.isFinite(x);
const point=p=>Array.isArray(p)&&p.length>=2&&num(p[0])&&num(p[1]);
const rect=b=>Array.isArray(b)&&b.length===4&&b.every(num);
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
function deletionMap(storage){
  const raw=storage.getItem(LEGACY_DELETIONS_KEY);
  if(raw===null)return {};
  if(raw.length>MAX_BYTES)throw Error('Exclusões acima de 12 MB');
  const parsed=JSON.parse(raw);
  if(!parsed||Array.isArray(parsed)||typeof parsed!=='object')
    throw Error('Índice de exclusões inválido');
  return parsed;
}
export function readLegacyPage(storage,documentId,hash,pageNo){
  const key=pageStorageKey(documentId,hash,pageNo);
  const raw=storage.getItem(key);
  if(raw!==null&&raw.length>MAX_BYTES)throw Error('Página de grifos excede 12 MB');
  const list=JSON.parse(raw||'[]');
  if(!Array.isArray(list)||list.length>MAX_MARKS)throw Error('Lista de grifos inválida');
  const entries=deletionMap(storage)[key]||{};
  if(!entries||typeof entries!=='object'||Array.isArray(entries))
    throw Error('Exclusões desta página inválidas');
  const marks=[];
  let removed=0,unsupported=0;
  for(const m of list){
    if(m?.bm108_deleted_at||Object.hasOwn(entries,legacyMarkId(m))){removed++;continue}
    if(!m||typeof m!=='object'){unsupported++;continue}
    if(!(['text_highlight','rect','pen','marker','note','card','status'].includes(m.type)||
      Array.isArray(m.points))){unsupported++;continue}
    marks.push(m);
  }
  return Object.freeze({documentId,hash,page:pageNo,marks,
    active:marks.length,removed,unsupported,source:'same-origin-localStorage-read-only'});
}
function drawHighlight(ctx,m,w,h){
  const style=String(m.style||'highlight');
  const boxes=(m.rects||[]).filter(rect);
  if(!boxes.length)return 0;
  ctx.save();
  const color=validColor(m.color),opacity=clamp(num(m.opacity)?m.opacity:.25,.08,.65);
  let drawn=0;
  for(const b of boxes){
    const x=clamp(b[0],0,1)*w,y=clamp(b[1],0,1)*h;
    const width=Math.max(0,(clamp(b[2],0,1)-clamp(b[0],0,1))*w);
    const height=Math.max(0,(clamp(b[3],0,1)-clamp(b[1],0,1))*h);
    if(!width||!height)continue;
    if(style==='underline'||style==='double-underline'||style==='strike'){
      ctx.globalAlpha=.92;ctx.strokeStyle=color;
      ctx.lineWidth=Math.max(1.5,height*(style==='strike'?.075:.08));
      const yLine=style==='strike'?y+height*.55:y+height-1;
      ctx.beginPath();ctx.moveTo(x,yLine);ctx.lineTo(x+width,yLine);ctx.stroke();
      if(style==='double-underline'){
        ctx.beginPath();ctx.moveTo(x,y+height-4);ctx.lineTo(x+width,y+height-4);ctx.stroke();
      }
    }else if(style==='conceal'){
      ctx.globalCompositeOperation='source-over';
      ctx.globalAlpha=.97;ctx.fillStyle='#ffffff';ctx.fillRect(x,y,width,height);
      ctx.globalAlpha=1;ctx.fillStyle='#6d7b84';ctx.font=Math.max(8,Math.min(16,height*.78))+'px sans-serif';
      ctx.fillText('⋯',x+3,y+height*.76,Math.max(0,width-4));
    }else{
      // Correspondência com V1: grifo legível multiplica cor e mantém texto escuro.
      ctx.globalCompositeOperation='multiply';
      ctx.globalAlpha=.38;
      ctx.fillStyle=color;ctx.fillRect(x,y,width,height);
    }
    drawn++;
  }
  ctx.restore();
  return drawn;
}
function drawStroke(ctx,m,w,h){
  const pts=Array.isArray(m.points)?m.points.filter(point):[];
  if(!pts.length)return 0;
  ctx.save();
  const pen=m.type==='pen';
  const opacity=pen?1:clamp(num(m.opacity)?m.opacity:.25,.1,.65);
  ctx.globalAlpha=opacity;
  ctx.lineCap='round';ctx.lineJoin='round';
  ctx.strokeStyle=validColor(m.color);
  ctx.fillStyle=ctx.strokeStyle;
  const thick=Math.max(1,Math.min(w,h)*(num(m.size)?m.size:3)/1000*(pen?1:1.7));
  const coord=p=>[clamp(p[0],0,1)*w,clamp(p[1],0,1)*h];
  if(pts.length===1){
    const p=coord(pts[0]);ctx.beginPath();ctx.arc(p[0],p[1],thick/2,0,Math.PI*2);ctx.fill();
  }else if(!pen){
    ctx.lineWidth=thick;ctx.beginPath();
    const first=coord(pts[0]);ctx.moveTo(first[0],first[1]);
    for(let i=1;i<pts.length;i++){const p=coord(pts[i]);ctx.lineTo(p[0],p[1])}
    ctx.stroke();
  }else{
    for(let i=1;i<pts.length;i++){
      const a=coord(pts[i-1]),b=coord(pts[i]);
      const pressureA=num(pts[i-1][2])?pts[i-1][2]:.65;
      const pressureB=num(pts[i][2])?pts[i][2]:.65;
      ctx.lineWidth=thick*(.55+.3*(pressureA+pressureB));
      ctx.beginPath();ctx.moveTo(a[0],a[1]);ctx.lineTo(b[0],b[1]);ctx.stroke();
    }
  }
  ctx.restore();return 1;
}
export function renderLegacyAnnotations(ctx,marks,width,height){
  if(!ctx||!Number.isFinite(width)||!Number.isFinite(height)||width<=0||height<=0)
    throw Error('Canvas de visualização inválido');
  if(!Array.isArray(marks)||marks.length>MAX_MARKS)throw Error('Conjunto de grifos inválido');
  let drawn=0,skipped=0;
  for(const m of marks){
    if(!m||typeof m!=='object'){skipped++;continue}
    if(m.type==='text_highlight'){
      const boxes=drawHighlight(ctx,m,width,height);
      if(boxes)drawn++;else skipped++;
    }else if(m.type==='rect'&&rect(m.box)){
      const b=m.box;ctx.save();
      ctx.globalAlpha=clamp(num(m.opacity)?m.opacity:.25,.1,.65);
      ctx.fillStyle=validColor(m.color);
      const x=clamp(Math.min(b[0],b[2]),0,1)*width;
      const y=clamp(Math.min(b[1],b[3]),0,1)*height;
      const w=Math.abs(clamp(b[2],0,1)-clamp(b[0],0,1))*width;
      const h=Math.abs(clamp(b[3],0,1)-clamp(b[1],0,1))*height;
      ctx.fillRect(x,y,w,h);ctx.restore();drawn++;
    }else if(['note','card','status'].includes(m.type)&&point(m.pos)){
      ctx.save();ctx.globalAlpha=1;ctx.fillStyle=validColor(m.color);
      const font=Math.max(10,Math.min(width,height)*.025);
      ctx.font='bold '+font+'px sans-serif';
      const p=m.pos;let y=clamp(p[1],0,1)*height;
      for(const line of String(m.text||'').split('\n').slice(0,5)){
        ctx.fillText(line.slice(0,110),clamp(p[0],0,1)*width,y);y+=font*1.25;
      }
      ctx.restore();drawn++;
    }else if(Array.isArray(m.points)){
      if(drawStroke(ctx,m,width,height))drawn++;else skipped++;
    }else skipped++;
  }
  return Object.freeze({drawn,skipped,total:marks.length});
}

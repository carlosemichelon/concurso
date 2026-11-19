/* V281 — ordenação explícita por ID e seleção de últimos cartões.
 * Leitura apenas. Não altera registros, IDs, versões, eventos SRS ou Drive. */
(function(){
'use strict';
if(window.BM281CardSort)return;
const toolbar=document.querySelector('#cartoes .controls');
if(!toolbar)return;
function field(id,title,choices,selected){
 const wrap=document.createElement('label');
 wrap.className='bm279-recent-label bm281-toolbar-field';
 wrap.htmlFor=id;
 const caption=document.createElement('span');caption.textContent=title;wrap.append(caption);
 const select=document.createElement('select');select.id=id;select.setAttribute('aria-label',title);
 for(const [value,label] of choices)select.add(new Option(label,value));
 select.value=selected;wrap.append(select);
 return {wrap,select};
}
const ordering=field('bm281IdOrder','Ordenar por ID',[
 ['desc','ID decrescente (novos primeiro)'],
 ['asc','ID crescente (antigos primeiro)'],
 ['original','Ordem original do catálogo']
],'desc');
const recent=field('bm281LastCards','Últimos cartões',[
 ['all','Mostrar todos'],
 ['last10','Últimos 10'],
 ['last25','Últimos 25'],
 ['last50','Últimos 50'],
 ['last100','Últimos 100'],
 ['v274v276','15 novos confirmados (V274/V276)'],
 ['v276','1 novo da V276'],
 ['v274','14 novos da V274']
],'all');
const search=document.getElementById('cardSearch');
if(search&&search.parentElement===toolbar)search.after(ordering.wrap,recent.wrap);
else toolbar.prepend(ordering.wrap,recent.wrap);
const hint=document.createElement('small');hint.id='bm281ChronologyHint';
hint.className='bm279-recent-note';
hint.textContent='Os IDs numéricos indicam a ordem de numeração, não comprovam a data real de criação de cada cartão. As inclusões V274 e V276 estão documentadas; cartões antigos apenas atualizados não entram como novos.';
toolbar.append(hint);
const num=id=>{const m=/^CARD-(\d+)$/.exec(String(id||''));return m?Number(m[1]):null};
const numberFor=c=>num(c?.id);
const isCanonical=c=>numberFor(c)!==null&&!c.provisional;
const release=c=>c?.id==='CARD-1534'?'v276':(numberFor(c)>=1520&&numberFor(c)<=1533?'v274':'legacy');
const limitFor=()=>({last10:10,last25:25,last50:50,last100:100})[recent.select.value]||0;
function byId(a,b){
 const an=numberFor(a),bn=numberFor(b);
 if(an!==null&&bn!==null)return ordering.select.value==='asc'?an-bn:bn-an;
 if(an!==null)return -1;
 if(bn!==null)return 1;
 return String(a.id||'').localeCompare(String(b.id||''),'pt-BR',{numeric:true});
}
function filterAndSort(input){
 const mode=recent.select.value;
 let rows=Array.isArray(input)?input.slice():[];
 if(mode!=='all'){
  rows=rows.filter(isCanonical);
  if(mode==='v276'||mode==='v274')rows=rows.filter(c=>release(c)===mode);
  if(mode==='v274v276')rows=rows.filter(c=>release(c)!=='legacy');
  // Seleção dos últimos N considera primeiramente os IDs mais altos
  // dentro do resultado dos filtros de busca/assunto, independentemente
  // da ordenação escolhida para exibição.
  const n=limitFor();
  if(n)rows.sort((a,b)=>numberFor(b)-numberFor(a)).splice(n);
 }
 if(ordering.select.value!=='original'||mode!=='all'){
  if(ordering.select.value==='original'){
   // Para últimas seleções, ainda é importante mostrar primeiro os mais novos.
   rows.sort((a,b)=>byNewest(a,b));
  }else rows.sort(byId);
 }
 return rows;
}
function byNewest(a,b){
 const an=numberFor(a),bn=numberFor(b);
 if(an!==null&&bn!==null)return bn-an;
 if(an!==null)return -1;
 if(bn!==null)return 1;
 return String(a.id||'').localeCompare(String(b.id||''),'pt-BR',{numeric:true});
}
function redraw(){
 if(typeof focusGroup!=='undefined')focusGroup='';
 if(typeof cardLimit!=='undefined')cardLimit=24;
 if(typeof cardRender==='function')cardRender();
}
ordering.select.addEventListener('change',redraw);
recent.select.addEventListener('change',redraw);
const api=Object.freeze({
 filterAndSort,
 get active(){return ordering.select.value!=='original'||recent.select.value!=='all'},
 get limited(){return recent.select.value!=='all'},
 get limit(){return limitFor()||15},
 get order(){return ordering.select.value},
 get recent(){return recent.select.value},
 get orderControl(){return ordering.select},
 get recentControl(){return recent.select}
});
window.BM281CardSort=api;
if(typeof cards!=='undefined'&&Array.isArray(cards)&&cards.length&&typeof cardRender==='function')cardRender();
})();

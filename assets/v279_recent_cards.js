/* V279 — filtro de cartões adicionados, sem reordenação da base original.
   V276 e V274 possuem origem temporal documental; IDs anteriores funcionam como aproximação,
   sem inferir a data de criação. Fichas PROP-IJUI não são cartões canônicos. */
(function(){
'use strict';
if(window.BM279RecentCards)return;
const host=document.querySelector('#cartoes .controls');if(!host)return;
const wrap=document.createElement('label');wrap.className='bm279-recent-label';wrap.htmlFor='bm279Recent';
wrap.textContent='Adicionados recentemente';
const select=document.createElement('select');select.id='bm279Recent';
select.setAttribute('aria-label','Filtrar por cartões adicionados recentemente');
const options=[
 ['all','Todos (ordem original)'],
 ['latest10','Últimos 10 cartões'],
 ['latest25','Últimos 25 cartões'],
 ['latest50','Últimos 50 cartões'],
 ['latest100','Últimos 100 cartões'],
 ['new15','Adicionados nas versões V274 e V276 (15)'],
 ['v276','Novos V276 (1)'],
 ['v274','Novos V274 (14)']
];
for(const [value,label]of options)select.add(new Option(label,value));
wrap.append(select);
const note=document.createElement('small');note.id='bm279RecentStatus';note.className='bm279-recent-note';
note.textContent='Inclusões confirmadas: V276 (1) e V274 (14). Nos registros anteriores, a ordem decrescente de ID é uma aproximação, não uma data.';
const css=document.createElement('style');css.id='bm279RecentStyle';css.textContent=[
 '#cartoes .bm279-recent-label{display:flex;flex-direction:column;gap:3px;font-size:11px;font-weight:700;color:#365963;min-width:200px;flex:0 1 255px}',
 '#cartoes #bm279Recent{width:100%;max-width:100%;min-height:39px;padding:7px 10px;font:12px system-ui,sans-serif;border:1px solid #bdcfcd;border-radius:8px;background:#fff;color:#17353b}',
 '#cartoes .bm279-recent-note{display:block;width:100%;font-size:11px;line-height:1.45;color:#597078}',
 '@media(max-width:650px){#cartoes .bm279-recent-label{flex:1 1 100%}}'
].join('\n');document.head.append(css);
const search=document.getElementById('cardSearch');
if(search&&search.parentElement===host)search.after(wrap);else host.prepend(wrap);
host.append(note);
const number=id=>{const m=/^CARD-(\d{4,})$/.exec(String(id||''));return m?Number(m[1]):null;};
const release=id=>id==='CARD-1534'?3:((number(id)>=1520&&number(id)<=1533)?2:1);
const count=()=>({latest10:10,latest25:25,latest50:50,latest100:100}[select.value]||0);
const canonical=c=>number(c?.id)!==null&&!c.provisional;
function latest(a){
 const val=select.value;
 if(val==='all')return a;
 const rows=a.filter(c=>canonical(c));
 if(val==='new15')return rows.filter(c=>release(c.id)>=2).sort(order);
 if(val==='v276')return rows.filter(c=>release(c.id)===3).sort(order);
 if(val==='v274')return rows.filter(c=>release(c.id)===2).sort(order);
 const n=count();
 return n?rows.sort(order).slice(0,n):rows;
}
function order(a,b){return release(b.id)-release(a.id)||number(b.id)-number(a.id);}
select.addEventListener('change',()=>{
 if(typeof focusGroup!=='undefined')focusGroup='';
 if(typeof cardLimit!=='undefined')cardLimit=24;
 if(typeof cardRender==='function')cardRender();
});
window.BM279RecentCards=Object.freeze({
 filterAndSort:latest,
 get active(){return select.value!=='all'},
 get limit(){return count()||15},
 get mode(){return select.value},
 get control(){return select}
});
if(typeof cardRender==='function'&&typeof cards!=='undefined'&&cards.length)cardRender();
})();

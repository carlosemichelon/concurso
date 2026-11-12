/* Banco Mestre V152 — filtros encadeados de flashcards.
 * Somente apresentação: preserva IDs, texto, grifos e SRS.
 */
(function(){
'use strict';
if(window.BM152FlashFilters)return;
const byId=id=>document.getElementById(id);
const norm=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const DISC=[
 {id:'eng',label:'Engenharia Civil'},
 {id:'port',label:'Português'},
 {id:'math',label:'Matemática, Lógica e Estatística'},
 {id:'leg',label:'Legislação geral e municipal'},
 {id:'info',label:'Informática'}
];
const CAT=window.BM128General?.categories||[];
const state={disc:'all',general:'all',subject:'all',sub:'all'};
let lastLegacy=byId('bm128CardGeneral')?.value||'all';
function subject(c){return c.provisional?'Ijuí — legislação FUNDATEC':String(c.subject||'Outros')}
function sub(c){return String(c.sub||'').trim()||'Sem subassunto informado'}
function area(c){
 const g=String(c.group||'');
 if(c.provisional||g==='LEGISLACAO')return 'leg';
 if(g==='MATEMATICA')return 'math';
 if(g==='PORTUGUES')return 'port';
 if(g==='INFORMATICA')return 'info';
 if(g==='ENG_GERAL'||g.startsWith('ENG_'))return 'eng';
 const d=norm(c.discipline);
 if(/engenharia|estrutura|geotecnia|materiais|saneamento|seguranca|planejamento|topografia/.test(d))return'eng';
 if(/legislacao|direito/.test(d))return'leg';
 if(/matematica|estatistica/.test(d))return'math';
 if(/portugues/.test(d))return'port';
 return'info';
}
function general(c){return window.BM128General?.classificationOf?.(c)||'eng_outros'}
function exact(){return /^(?:CARD-\d{4}|IJUI-[A-Za-z0-9_-]+|PROP-IJUI-\d+)$/i.test(byId('cardSearch')?.value.trim()||'')}
function matches(c){
 if(exact()||(typeof focusGroup!=='undefined'&&focusGroup))return true;
 return (state.disc==='all'||area(c)===state.disc)&&
  (state.general==='all'||general(c)===state.general)&&
  (state.subject==='all'||subject(c)===state.subject)&&
  (state.sub==='all'||sub(c)===state.sub);
}
const controls=byId('cartoes')?.querySelector('.controls');
if(!controls)return;
const panel=document.createElement('div');panel.id='bm152Filters';panel.className='bm152Filters';panel.setAttribute('aria-label','Filtros encadeados de flashcards');
function makeField(id,label){
 const wrap=document.createElement('label');wrap.className='bm152Field';
 const span=document.createElement('span');span.textContent=label;
 const sel=document.createElement('select');sel.id=id;sel.setAttribute('aria-label',label);
 wrap.append(span,sel);panel.append(wrap);return sel;
}
const discSel=makeField('bm152Discipline','1. Disciplina');
const generalSel=makeField('bm152General','2. Assunto geral');
const subjectSel=makeField('bm152Subject','3. Assunto específico');
const subSel=makeField('bm152Sub','4. Subassunto');
const footer=document.createElement('div');footer.className='bm152FilterFooter';
const status=document.createElement('div');status.id='bm152FilterStatus';status.setAttribute('role','status');status.setAttribute('aria-live','polite');
const reset=document.createElement('button');reset.type='button';reset.id='bm152Reset';reset.textContent='Limpar filtros';
footer.append(status,reset);panel.append(footer);controls.before(panel);
const css=document.createElement('style');
css.textContent=[
 '#cartoes #cardFilter,#cartoes #bm128CardGeneral,#cartoes .bm128FineRefine{display:none!important}',
 '#cartoes .bm152Filters{box-sizing:border-box;border:1px solid #d2dfde;background:#f8fbfa;border-radius:12px;padding:14px;margin:12px 0;display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px}',
 '#cartoes .bm152Field{display:flex;min-width:0;flex-direction:column;gap:5px;font-weight:700;color:#244751;font-size:12px}',
 '#cartoes .bm152Field select{box-sizing:border-box;width:100%;min-width:0;max-width:100%;border:1px solid #b9cbce;background:#fff;color:#183c45;border-radius:8px;padding:9px;font:500 13px system-ui,Arial,sans-serif;min-height:42px}',
 '#cartoes .bm152Field select:focus-visible{outline:3px solid #55aab1;outline-offset:2px}',
 '#cartoes .bm152Field select:disabled{opacity:.58;background:#eef2f2}',
 '#cartoes .bm152FilterFooter{grid-column:1/-1;display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;border-top:1px solid #e0e9e8;padding-top:11px;margin-top:2px}',
 '#cartoes #bm152FilterStatus{color:#526a70;font-size:12px;line-height:1.5;flex:1;min-width:190px}',
 '#cartoes #bm152Reset{min-height:37px;font-size:12px;padding:8px 12px;white-space:nowrap}',
 '@media(max-width:990px){#cartoes .bm152Filters{grid-template-columns:repeat(2,minmax(0,1fr))}}',
 '@media(max-width:570px){#cartoes .bm152Filters{grid-template-columns:1fr;padding:11px;gap:9px}#cartoes .bm152FilterFooter{align-items:stretch}#cartoes #bm152Reset{width:100%}}'
].join('\n');
document.head.append(css);
function available(){
 if(typeof cards==='undefined'||!Array.isArray(cards))return[];
 let excluded=new Set();
 try{if(!byId('cardHidden')?.checked&&typeof hidden==='function')excluded=hidden('CARD')}catch(_){}
 const showInactive=!!byId('bm119ShowInactive')?.checked;
 return cards.filter(c=>c&&(showInactive||c.provisional||c.active!==false)&&!excluded.has(c.id));
}
function counter(arr,fn){
 const m=new Map();for(const x of arr){const id=fn(x);m.set(id,(m.get(id)||0)+1)}return m;
}
function option(text,value){return new Option(text,value)}
function fill(sel,all,arr,selected){
 sel.replaceChildren(option(all,'all'));
 for(const item of arr)sel.add(option(item.label+' ('+item.count+')',item.value));
 sel.value=arr.some(x=>x.value===selected)?selected:'all';
 return sel.value;
}
function sorted(map,labels){
 return [...map].filter(([key,value])=>value>0).map(([key,value])=>({value:key,count:value,label:labels?.get(key)||key}))
 .sort((a,b)=>b.count-a.count||a.label.localeCompare(b.label,'pt-BR'));
}
function syncTopicLink(){
 const current=byId('bm128CardGeneral')?.value||'all';
 if(current!==lastLegacy){
  if(current!=='all'&&CAT.some(c=>c.id===current)){
   state.disc='all';state.general=current;state.subject='all';state.sub='all';
  }else if(lastLegacy!=='all'){
   state.general='all';state.subject='all';state.sub='all';
  }
  lastLegacy=current;
 }
}
function updateOptions(){
 const all=available();
 const dc=counter(all,area);
 state.disc=fill(discSel,'Todas as disciplinas ('+all.length+')',
  DISC.filter(x=>dc.has(x.id)).map(x=>({...x,value:x.id,count:dc.get(x.id)})),state.disc);
 const a=all.filter(c=>state.disc==='all'||area(c)===state.disc);
 const labels=new Map(CAT.map(x=>[x.id,x.label]));
 state.general=fill(generalSel,'Todos os assuntos gerais ('+a.length+')',sorted(counter(a,general),labels),state.general);
 const b=a.filter(c=>state.general==='all'||general(c)===state.general);
 state.subject=fill(subjectSel,'Todos os assuntos específicos ('+b.length+')',sorted(counter(b,subject)),state.subject);
 const c=b.filter(x=>state.subject==='all'||subject(x)===state.subject);
 if(state.subject==='all'){
  state.sub='all';subSel.replaceChildren(option('Escolha primeiro um assunto específico','all'));subSel.disabled=true;
 }else{
  state.sub=fill(subSel,'Todos os subassuntos ('+c.length+')',sorted(counter(c,sub)),state.sub);
  subSel.disabled=false;
 }
 for(const sel of [discSel,generalSel,subjectSel,subSel])sel.title=sel.selectedOptions[0]?.textContent||'';
 const chosen=[];
 if(state.disc!=='all')chosen.push(DISC.find(x=>x.id===state.disc)?.label||state.disc);
 if(state.general!=='all')chosen.push(labels.get(state.general)||state.general);
 if(state.subject!=='all')chosen.push(state.subject);
 if(state.sub!=='all')chosen.push(state.sub);
 const title=chosen.length?chosen.join(' › '):'Todas as disciplinas e assuntos';
 const count=byId('cardCount')?.textContent.match(/^\d+ cartões/)?.[0]||'';
 status.textContent=title+' · '+(count||all.length+' cartões no acervo')+(exact()?' · busca direta por ID':'');
}
function apply(){
 if(byId('cardFilter'))byId('cardFilter').value='all';
 if(byId('cardTopicFilter'))byId('cardTopicFilter').value='all';
 const old=byId('bm128CardGeneral');if(old)old.value='all';lastLegacy='all';
 if(typeof focusGroup!=='undefined')focusGroup='';
 if(typeof cardLimit!=='undefined')cardLimit=24;
 cardRender();
}
discSel.onchange=()=>{state.disc=discSel.value;state.general='all';state.subject='all';state.sub='all';apply()};
generalSel.onchange=()=>{state.general=generalSel.value;state.subject='all';state.sub='all';apply()};
subjectSel.onchange=()=>{state.subject=subjectSel.value;state.sub='all';apply()};
subSel.onchange=()=>{state.sub=subSel.value;apply()};
reset.onclick=()=>{
 state.disc='all';state.general='all';state.subject='all';state.sub='all';
 if(byId('cardSearch'))byId('cardSearch').value='';
 for(const id of ['cardReviewedOnly','cardRecoveredOnly'])if(byId(id))byId(id).checked=false;
 apply();
};
const previousRender=cardRender;
cardRender=function(){syncTopicLink();updateOptions();previousRender();updateOptions()};
window.BM152FlashFilters=Object.freeze({matches,get selection(){return {...state}},reset:()=>reset.click()});
cardRender();
})();
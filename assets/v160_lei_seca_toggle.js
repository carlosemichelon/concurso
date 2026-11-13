/* Banco Mestre V160 — ocultação/revelação independente do verso e da lei seca.
   Camada exclusivamente visual: não altera cards, IDs, dados canônicos, SRS,
   histórico, anotações, PDF, Drive ou armazenamento local. */
(function(){
 'use strict';
 if(window.BM160LeiSecaToggle)return;
 const root=document.getElementById('cardRows');
 if(!root)return;
 const states=new Map(); // apenas em memória desta página
 const byId=id=>document.getElementById(id);
 const legalDiscipline=/legisla[cç][aã]o|direito|jur[ií]dic|constitucional/i;
 const fields=['texto_lei_seca','lei_seca_texto','lei_seca','legal_text','law_text','legal_excerpt'];
 const cardId=article=>article.querySelector(':scope > .tag')?.textContent?.trim()||'';
 const isLegal=c=>!!c&&(c.provisional===true||String(c.group||'').toUpperCase()==='LEGISLACAO'||legalDiscipline.test(String(c.discipline||'')));
 const explicitLaw=c=>{
  for(const key of fields)if(typeof c[key]==='string'&&c[key].trim())return c[key];
  return '';
 };
 const declaredLiteral=(c,law)=>!!law||c.lei_seca_literal===true||
  (/lei seca/i.test(String(c.expl||''))&&/(literal|integral|transcri[cç][aã]o)/i.test(String(c.expl||'')));
 const css=document.createElement('style');
 css.id='bm160LeiSecaCSS';
 css.textContent=[
  '#cartoes #bm160LawToolbar{border:1px solid #d3dedc;border-radius:10px;background:#f8fbfa;padding:11px 13px;margin:10px 0 14px;display:flex;align-items:center;gap:9px;flex-wrap:wrap;font-size:13px}',
  '#cartoes #bm160LawToolbar label{display:inline-flex;align-items:center;gap:8px;font-weight:700;cursor:pointer}',
  '#cartoes #bm160LawToolbar input{width:17px;height:17px;accent-color:#226e70}',
  '#cartoes #bm160LawToolbar small{color:#556b70;flex-basis:100%;line-height:1.45}',
  '#cartoes details.bm160-law{border:1px solid #c9d8d5;background:#f8faf9;border-radius:9px;margin:10px 0 12px;overflow:hidden}',
  '#cartoes details.bm160-law>summary{padding:10px 12px;cursor:pointer;font-weight:750;color:#215c61;list-style-position:inside}',
  '#cartoes details.bm160-law>summary:focus-visible{outline:3px solid #58a7ad;outline-offset:-3px}',
  '#cartoes details.bm160-law[open]>summary{border-bottom:1px solid #d7e3df;background:#edf5f2}',
  '#cartoes details.bm160-law>.richSection{margin:0;padding:12px 14px}',
  '#cartoes details.bm160-law>.bm160-law-text{white-space:pre-wrap;padding:12px 14px;margin:0;overflow-wrap:anywhere}',
  '#cartoes .bm160-law-note{font-size:12px;color:#586b70;margin:-5px 0 10px;line-height:1.4}',
  'html.bm-single-card #bm160LawToolbar{display:none!important}',
  '@media(max-width:620px){#cartoes #bm160LawToolbar{padding:10px}#cartoes details.bm160-law>summary{padding:12px}}'
 ].join('\n');
 document.head.append(css);
 let hideByDefault=true;
 const toolbar=document.createElement('div');
 toolbar.id='bm160LawToolbar';toolbar.setAttribute('role','group');
 toolbar.setAttribute('aria-label','Preferência de revelação dos versos de legislação');
 const label=document.createElement('label');label.htmlFor='bm160HideLaw';
 const toggle=document.createElement('input');toggle.id='bm160HideLaw';toggle.type='checkbox';toggle.checked=true;
 label.append(toggle,document.createTextNode('Ocultar texto da lei seca / verso legal por padrão'));
 const note=document.createElement('small');
 note.textContent='Use o controle de cada cartão para revelar ou ocultar novamente. Cartões sem transcrição literal identificada mostram o verso original, sem inventar o texto da lei.';
 toolbar.append(label,note);
 const cardsPanel=byId('cartoes')?.querySelector('.panel');
 const controls=cardsPanel?.querySelector('.controls');
 if(controls)controls.before(toolbar);
 else root.before(toolbar);
 function collection(){
  return (typeof cards!=='undefined'&&Array.isArray(cards))?cards:[];
 }
 function decorate(){
  const lookup=new Map(collection().filter(isLegal).map(c=>[String(c.id),c]));
  for(const article of root.querySelectorAll('article.card')){
   const id=cardId(article),card=lookup.get(id);
   if(!card||article.dataset.bm160Law==='ready')continue;
   const outer=article.querySelector(':scope > details');
   const answer=outer?.querySelector(':scope > .answer');
   const original=answer?.querySelector(':scope > .richSection');
   if(!answer||!original)continue;
   const law=explicitLaw(card),back=String(card.back||'');
   const literal=declaredLiteral(card,law);
   const distinct=!!law&&!back.includes(law.trim());
   const disclosure=document.createElement('details');
   disclosure.className='bm160-law';disclosure.dataset.cardId=id;
   disclosure.dataset.contentType=literal?'lei-seca':'verso-original';
   const summary=document.createElement('summary');
   const showLabel=literal?'Revelar texto da lei seca':'Revelar verso original (não identificado como lei seca literal)';
   const hideLabel=literal?'Ocultar texto da lei seca':'Ocultar verso original';
   disclosure.append(summary);
   // Se a fonte possui campo textual de lei seca distinto da resposta,
   // a explicação original permanece visível, e somente a lei é ocultada.
   if(distinct){
    const text=document.createElement('p');
    text.className='bm160-law-text';
    text.textContent=law;
    disclosure.append(text);
    original.after(disclosure);
   }else{
    // Reutilizar o nó existente preserva exatamente o texto do verso e
    // impede que uma cópia continue visível fora do painel.
    disclosure.append(original);
    answer.prepend(disclosure);
   }
   const initiallyOpen=states.has(id)?states.get(id):!hideByDefault;
   disclosure.open=!!initiallyOpen;
   const updateSummary=()=>{summary.textContent=disclosure.open?hideLabel:showLabel};
   updateSummary();
   disclosure.addEventListener('toggle',()=>{
    states.set(id,disclosure.open);
    updateSummary();
   });
   if(!literal){
    const warning=document.createElement('p');
    warning.className='bm160-law-note';
    warning.textContent='Este cartão não identifica transcrição literal de lei seca na base; o texto exibido é o verso original preservado.';
    disclosure.after(warning);
   }
   article.dataset.bm160Law='ready';
  }
 }
 toggle.addEventListener('change',()=>{
  hideByDefault=toggle.checked;
  for(const d of root.querySelectorAll('details.bm160-law')){
   d.open=!hideByDefault;
   states.set(d.dataset.cardId,d.open);
   const s=d.querySelector(':scope > summary');
   if(s)s.textContent=d.open?(d.dataset.contentType==='lei-seca'?'Ocultar texto da lei seca':'Ocultar verso original'):(d.dataset.contentType==='lei-seca'?'Revelar texto da lei seca':'Revelar verso original (não identificado como lei seca literal)');
  }
 });
 let scheduled=false;
 const refresh=()=>{
  if(scheduled)return;
  scheduled=true;
  requestAnimationFrame(()=>{scheduled=false;decorate()});
 };
 const observer=new MutationObserver(refresh);
 observer.observe(root,{childList:true,subtree:true});
 refresh();
 window.BM160LeiSecaToggle=Object.freeze({
  version:'V160',refresh,legalCount:()=>collection().filter(isLegal).length,
  get initiallyHidden(){return hideByDefault}
 });
})();
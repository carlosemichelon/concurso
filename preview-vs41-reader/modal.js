/* 21 assets/v305_card_reader.js */
/* Portal V305 — leitor inicia com Outros cartões recolhidos; demais comportamentos do V279 preservados. */
/* Banco Mestre V242 — leitor único V165 com cartão PETRO14-C014. */
/* Banco Mestre V165 — leitura integral com outros cartões no mesmo pop-up dos cartões, sem reescrever a base.
 * A leitura é local; não registra tentativa, domínio, avaliação ou evento SRS.
 * Preserva API V050 para integração com anotações V122 e outras interfaces. */
(function(){
'use strict';
if(window.BancoMestreVisualizarCardV050)return;
const root=document.getElementById('cardRows');
if(!root)return;
const idOf=article=>article?.querySelector(':scope > .tag')?.textContent?.trim()||'';
const pattern=/^(?:CARD-\d{4,}|PROP-IJUI-\d+|IJUI-[A-Za-z0-9_-]+|TRT0[12]-C\d{3}|PETRO\d+-C\d{3})$/;
const create=(tag,cls,text)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=String(text);return n};
const svgPaths={
 book:'<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>',
 eye:'<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>',
 pen:'<path d="m16 5 3 3M4 20l4-.8L20 7a2.1 2.1 0 0 0-3-3L4.8 16z"/>',
 file:'<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M8 13h8M8 17h8"/>',
 x:'<path d="M18 6 6 18M6 6l12 12"/>',
 link:'<path d="M7 17 17 7M7 7h10v10"/>',
 alert:'<path d="M12 3 2 21h20L12 3zM12 9v4M12 17h.01"/>',
 scroll:'<path d="M8 21h12a2 2 0 0 0 2-2V7h-7V3H5a2 2 0 0 0-2 2v12a4 4 0 0 0 4 4Z"/><path d="M7 17h8M7 12h8"/>',
 layers:'<path d="m12 2 9 5-9 5-9-5 9-5ZM3 12l9 5 9-5M3 17l9 5 9-5"/>',
 check:'<path d="m20 6-11 11-5-5"/>',
 clock:'<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>'
};
function icon(name){
 const i=create('span','bm163-ic');i.setAttribute('aria-hidden','true');
 const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');
 svg.setAttribute('width','17');svg.setAttribute('height','17');svg.setAttribute('viewBox','0 0 24 24');
 svg.setAttribute('fill','none');svg.setAttribute('stroke','currentColor');svg.setAttribute('stroke-width','1.8');
 svg.setAttribute('stroke-linecap','round');svg.setAttribute('stroke-linejoin','round');
 svg.innerHTML=svgPaths[name]||svgPaths.file;i.append(svg);return i;
}
function btn(label,ic,cls){
 const b=create('button',cls||'');
 b.type='button';b.append(icon(ic),document.createTextNode(label));return b;
}
function getCard(id){return window.BMPrivateReadSession?.active()?window.cards.find(c=>c.active&&c.id===id)||null:null;}
const overlay=create('div','bm-v050-peek bm163-peek');overlay.id='bmCardPeekV050';overlay.hidden=true;overlay.setAttribute('role','presentation');
const backdrop=create('div','bm-v050-peek-backdrop');
const panel=create('div','bm-v050-peek-panel bm163-panel');
panel.classList.add('bm165-panel','bm165-sidebar-hidden');
panel.setAttribute('role','dialog');panel.setAttribute('aria-modal','true');panel.setAttribute('aria-labelledby','bmCardPeekTitleV050');panel.tabIndex=-1;
const header=create('div','bm-v050-peek-header bm163-header');
const headerLeft=create('div','bm163-header-title');
const kicker=create('small','bm163-kicker','REVISÃO DO CARTÃO');
const title=create('strong');title.id='bmCardPeekTitleV050';title.textContent='Consulta do cartão';
headerLeft.append(kicker,title);
const close=btn('Fechar','x','bm-v050-peek-close bm163-close');
close.setAttribute('aria-label','Fechar visualização do flashcard');close.title='Fechar (Esc)';
const previous=btn('Anterior','layers','bm165-prev'),next=btn('Próximo','layers','bm165-next');
previous.title='Cartão anterior (←)';next.title='Próximo cartão (→)';
previous.setAttribute('aria-keyshortcuts','ArrowLeft');next.setAttribute('aria-keyshortcuts','ArrowRight');
const sidebarToggle=btn('Outros cartões','layers','bm165-toggle-sidebar');
sidebarToggle.setAttribute('aria-expanded','false');sidebarToggle.title='Mostrar ou ocultar lista de cartões relacionados';
const navHeader=create('div','bm165-header-nav');navHeader.append(sidebarToggle,previous,next,close);
header.append(headerLeft,navHeader);
const scroll=create('div','bm163-scroll');scroll.tabIndex=0;scroll.setAttribute('aria-label','Conteúdo do cartão: role para ler todas as seções');
const questionBlock=create('div','bm163-question');
const frontLabel=create('small','bm163-section-overline','PERGUNTA');
const front=create('h2','bm-v050-peek-front');
const meta=create('p','bm-v050-peek-meta');
const provenance=create('p','bm-v050-provenance');
const guidance=create('p','bm-v050-peek-guidance','Tente responder antes de consultar o verso. A consulta não altera seu SRS.');
questionBlock.append(frontLabel,front,meta,provenance,guidance);
const controls=create('div','bm163-preview-controls');
const reveal=btn('Revelar resposta','eye','bm-v050-peek-reveal');reveal.setAttribute('aria-expanded','false');
const lawButton=btn('Mostrar lei seca','book','bm163-legal-button');
lawButton.setAttribute('aria-expanded','false');lawButton.hidden=true;
controls.append(reveal,lawButton);
const lawPanel=create('section','bm163-legal-panel');lawPanel.hidden=true;lawPanel.setAttribute('aria-label','Texto literal da legislação');
const answer=create('div','bm-v050-peek-answer bm163-answer');answer.hidden=true;
const status=create('div','bm163-reader-status');status.setAttribute('role','status');status.textContent='Rolar para ler todo o material, inclusive macetes e histórico.';
const aside=create('aside','bm165-related');aside.setAttribute('aria-label','Outros cartões');
const asideTitle=create('h3','bm165-related-title','Outros cartões');
const asideCount=create('small','bm165-related-count','');
const asideSearch=create('input','bm165-related-search');asideSearch.type='search';
asideSearch.placeholder='Buscar cartão por ID ou assunto';asideSearch.setAttribute('aria-label','Buscar nos cartões');
const allLabel=create('label','bm165-all-label');
const allCheck=create('input');allCheck.type='checkbox';
allLabel.append(allCheck,document.createTextNode('Pesquisar toda a base'));
const asideList=create('nav','bm165-related-list');asideList.setAttribute('aria-label','Escolher outro cartão');
aside.append(asideTitle,asideCount,asideSearch,allLabel,asideList);
const layout=create('div','bm165-layout');layout.append(aside,scroll);
const footer=create('div','bm163-footer bm165-footer');
const note=create('small','bm-v050-peek-note','Consulta sem avaliação · não registra revisão nem altera intervalos SRS.');
const footerClose=btn('Voltar aos cartões','x','bm165-footer-close');
footer.append(note,footerClose);
scroll.append(questionBlock,controls,lawPanel,answer,status);
panel.append(header,layout,footer);overlay.append(backdrop,panel);document.body.append(overlay);
// VS6: a mesma recuperação ativa para qualquer origem; API antiga permanece compatível.
const readerMode='review';
function applyReaderMode(){
 overlay.dataset.readerMode=readerMode;
 kicker.textContent='ESTUDO DO CARTÃO';
 guidance.textContent='Tente lembrar antes de revelar o verso. Consulta privada sem avaliação nesta prévia.';
 note.textContent='Consulta sem avaliação não altera a agenda SRS.';
}
let focusedBefore=null,currentId='',previousOverflow='',asideQuery='',asideAll=false;const trtUrls=[];function freeTrtUrls(){while(trtUrls.length)URL.revokeObjectURL(trtUrls.pop())}
function allCards(){return window.BMPrivateReadSession?.active()?window.cards.filter(c=>c.active):[];}
function norm(value){return String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase()}
function sameArea(a,b){if(a.provisional||b.provisional)return !!(a.provisional&&b.provisional);
 return !!(a.group&&a.group===b.group)||(a.discipline&&a.discipline===b.discipline)}
function related(){
 const c=getCard(currentId),all=allCards(),query=norm(asideQuery.trim());
 if(query)return all.filter(x=>norm([x.id,x.front,x.subject,x.discipline,x.sub].join(' ')).includes(query));
 if(asideAll||!c)return all;
 const nearby=all.filter(x=>sameArea(x,c));
 return nearby.length?nearby:all;
}
function renderRelated(){
 const all=related(),index=all.findIndex(c=>c.id===currentId);
 const start=all.length>60&&index>=0?Math.max(0,Math.min(all.length-60,index-12)):0;
 const visible=all.slice(start,start+60);
 asideCount.textContent=all.length+' cartões'+(all.length>60?' · exibindo '+visible.length:'');
 asideList.replaceChildren();
 for(const c of visible){
  const b=create('button','bm165-related-item');b.type='button';
  b.append(create('span','bm165-related-id',c.id),create('span','bm165-related-front',c.front));
  if(c.id===currentId){b.classList.add('bm165-active');b.setAttribute('aria-current','true')}
  b.addEventListener('click',()=>show(c.id,b));
  asideList.append(b);
 }
 if(!visible.length)asideList.append(create('p','bm165-empty','Nenhum cartão encontrado'));
 previous.disabled=index<=0;next.disabled=index<0||index>=all.length-1;
}
function moveCard(delta){
 if(overlay.dataset.bm382Queue==='true')return;
 const a=related(),i=a.findIndex(c=>c.id===currentId),c=a[i+delta];
 if(c)show(c.id);
}
asideSearch.addEventListener('input',()=>{asideQuery=asideSearch.value;renderRelated()});
allCheck.addEventListener('change',()=>{asideAll=allCheck.checked;renderRelated()});
previous.addEventListener('click',()=>moveCard(-1));next.addEventListener('click',()=>moveCard(1));
footerClose.addEventListener('click',()=>hide());
sidebarToggle.addEventListener('click',()=>{
 const hidden=panel.classList.toggle('bm165-sidebar-hidden');
 sidebarToggle.setAttribute('aria-expanded',String(!hidden));
 sidebarToggle.title=hidden?'Mostrar outros cartões':'Ocultar outros cartões';
});
function visibleElement(el){return el&&!(el.closest('[hidden]'))&&!el.disabled}
function hide(){
 if(overlay.hidden)return;
 freeTrtUrls();overlay.hidden=true;document.body.classList.remove('bm-v050-peek-open');
 document.body.style.overflow=previousOverflow;
 const restore=focusedBefore;focusedBefore=null;currentId='';
 restore?.focus?.({preventScroll:true});
}

function show(id,origin){
 const c=getCard(id);if(!c)return false;
 panel.classList.add('bm165-sidebar-hidden');sidebarToggle.setAttribute('aria-expanded','false');sidebarToggle.title='Mostrar outros cartões';
 if(overlay.hidden){focusedBefore=origin||document.activeElement;previousOverflow=document.body.style.overflow;document.body.style.overflow='hidden';overlay.hidden=false;document.body.classList.add('bm-v050-peek-open');panel.focus({preventScroll:true});}
 currentId=id;title.textContent='Cartão '+id;front.textContent=c.front;
 questionBlock.querySelector('.bm349-front-media')?.remove();
 if(window.BM349.has(id)){const f=create('div','bm349-front-media');front.after(f);window.BM349.renderFront(f,id);}
 answer.classList.toggle('bm349-restored-answer',window.BM349.has(id));
 meta.textContent=[c.discipline,c.subject].filter(Boolean).join(' › ');provenance.textContent='Consulta privada · ID preservado';
 reveal.setAttribute('aria-expanded','false');reveal.replaceChildren(icon('eye'),document.createTextNode('Revelar resposta'));
 answer.hidden=true;answer.replaceChildren();lawButton.hidden=true;lawPanel.hidden=true;lawPanel.replaceChildren();
 status.textContent='Resposta inicia oculta. Escolha outros cartões na lista lateral.';applyReaderMode();scroll.scrollTop=0;renderRelated();return true;
}
reveal.addEventListener('click',()=>{
 const c=getCard(currentId);if(!c)return;answer.hidden=!answer.hidden;
 if(!answer.hidden){answer.replaceChildren();try{if(window.BM349.has(c.id)){window.BM349.renderAnswer(answer,c.id);}else{answer.append(create('p','bm163-piece-text',c.back),create('p','bm163-piece-text',c.expl||''));}}catch{answer.replaceChildren(create('p','bm163-piece-text',c.back));}}
 reveal.setAttribute('aria-expanded',String(!answer.hidden));reveal.replaceChildren(icon('eye'),document.createTextNode(answer.hidden?'Revelar resposta':'Ocultar resposta'));
 status.textContent=answer.hidden?'Resposta ocultada novamente.':'Resposta e materiais complementares disponíveis abaixo.';
});
close.addEventListener('click',hide);backdrop.addEventListener('click',hide);
document.addEventListener('keydown',e=>{
 if(overlay.hidden)return;
 if(e.key==='Escape'){e.preventDefault();hide();return}
 if(e.key==='ArrowRight'||e.key==='ArrowLeft'){
  // Setas simples na leitura; preservar edição de texto e controles interativos.
  const target=e.target;
  if(e.defaultPrevented||e.isComposing||e.repeat||e.shiftKey||e.metaKey||
     !overlay.contains(target)||target.closest?.('input,textarea,select,[contenteditable]:not([contenteditable="false"]),[role="textbox"],[role="combobox"],[role="slider"],[role="tablist"],[role="grid"],[role="listbox"],[role="tree"],[role="radiogroup"]')||
     target.isContentEditable||!window.getSelection()?.isCollapsed||overlay.dataset.bm382Queue==='true')return;
  const direction=e.key==='ArrowRight'?1:-1,button=direction===1?next:previous;
  if(!button.disabled){e.preventDefault();moveCard(direction);}
  return;
 }
 if(e.key!=='Tab')return;
 const focusable=Array.from(panel.querySelectorAll('a[href],button,summary,textarea,input,select,[tabindex="0"]')).filter(el=>visibleElement(el)&&el.getClientRects().length>0);
 if(!focusable.length)return;
 const first=focusable[0],last=focusable[focusable.length-1];
 if(e.shiftKey&&(document.activeElement===first||document.activeElement===panel)){e.preventDefault();last.focus()}
 else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}
});

window.BancoMestreVisualizarCardV050=Object.freeze({
 get visible(){return !overlay.hidden},get currentId(){return currentId},
 showId:show,close:hide,
 reset(){hide();currentId='';focusedBefore=null;title.textContent='Consulta do cartão';front.textContent='';meta.textContent='';provenance.textContent='';questionBlock.querySelector('.bm349-front-media')?.remove();answer.replaceChildren();answer.hidden=true;lawPanel.replaceChildren();lawPanel.hidden=true;asideQuery='';asideAll=false;asideSearch.value='';allCheck.checked=false;asideList.replaceChildren();asideCount.textContent='';status.textContent='';}
});
})();
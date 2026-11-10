/* Banco Mestre V049 — visualização local de flashcards.
 * Uma prévia independente para cada cartão, sem avaliações, escrita ou SRS.
 * Mantém os IDs e os cartões existentes; não altera a base canônica. */
(function(){
 'use strict';
 const root=document.getElementById('cardRows');
 if(!root||document.getElementById('bmCardPeekV049'))return;
 const $=id=>document.getElementById(id);
 const idOf=article=>article?.querySelector(':scope > .tag')?.textContent?.trim()||'';
 const cardPattern=/^(?:CARD-\d{4,}|PROP-IJUI-\d+)$/;
 const overlay=document.createElement('div');overlay.id='bmCardPeekV049';
 overlay.className='bm-v049-peek';overlay.hidden=true;overlay.setAttribute('role','presentation');
 const backdrop=document.createElement('div');backdrop.className='bm-v049-peek-backdrop';
 const panel=document.createElement('div');panel.className='bm-v049-peek-panel';
 panel.setAttribute('role','dialog');panel.setAttribute('aria-modal','true');
 panel.setAttribute('aria-labelledby','bmCardPeekTitleV049');panel.tabIndex=-1;
 const head=document.createElement('div');head.className='bm-v049-peek-header';
 const title=document.createElement('strong');title.id='bmCardPeekTitleV049';
 title.textContent='Visualização do flashcard';
 const close=document.createElement('button');close.type='button';
 close.textContent='✕';close.className='bm-v049-peek-close';close.title='Fechar visualização';
 close.setAttribute('aria-label','Fechar visualização do flashcard');
 head.append(title,close);
 const meta=document.createElement('p');meta.className='bm-v049-peek-meta';
 const frontLabel=document.createElement('small');frontLabel.textContent='FRENTE';
 const front=document.createElement('p');front.className='bm-v049-peek-front';
 const reveal=document.createElement('button');reveal.type='button';
 reveal.className='bm-v049-peek-reveal';reveal.textContent='Mostrar verso';
 reveal.setAttribute('aria-expanded','false');
 const answer=document.createElement('div');answer.className='bm-v049-peek-answer';answer.hidden=true;
 const backLabel=document.createElement('small');backLabel.textContent='VERSO';
 const back=document.createElement('p');
 const explLabel=document.createElement('small');explLabel.textContent='EXPLICAÇÃO';
 const expl=document.createElement('p');
 const mnemonicLabel=document.createElement('small');mnemonicLabel.textContent='MACETE';
 const mnemonic=document.createElement('p');
 answer.append(backLabel,back,explLabel,expl,mnemonicLabel,mnemonic);
 const note=document.createElement('p');note.className='bm-v049-peek-note';
 note.textContent='Somente consulta: não registra resposta, nota ou revisão SRS.';
 panel.append(head,meta,frontLabel,front,reveal,answer,note);
 overlay.append(backdrop,panel);document.body.append(overlay);
 let focusReturn=null;
 function hide(){
  overlay.hidden=true;
  document.body.classList.remove('bm-v049-peek-open');
  focusReturn?.focus?.({preventScroll:true});
  focusReturn=null;
 }
 function show(id,button){
  const collection=typeof cards!=='undefined'&&Array.isArray(cards)?cards:[];
  const record=collection.find(c=>c.id===id);
  if(!record){button.title='Cartão '+id+' não encontrado no catálogo carregado';return}
  focusReturn=button;
  title.textContent='👁 Visualização · '+id;
  meta.textContent=[record.discipline,record.subject,record.sub].filter(Boolean).join(' › ');
  front.textContent=record.front||'Sem frente cadastrada';
  back.textContent=record.back||'Resposta ainda não cadastrada';
  expl.textContent=record.expl||'Sem explicação complementar cadastrada';
  mnemonic.textContent=record.mnemonic||'Sem macete cadastrado';
  explLabel.hidden=expl.hidden=!record.expl;
  mnemonicLabel.hidden=mnemonic.hidden=!record.mnemonic;
  answer.hidden=true;
  reveal.textContent='Mostrar verso';
  reveal.setAttribute('aria-expanded','false');
  overlay.hidden=false;
  document.body.classList.add('bm-v049-peek-open');
  panel.focus({preventScroll:true});
 }
 reveal.onclick=()=>{
  answer.hidden=!answer.hidden;
  reveal.textContent=answer.hidden?'Mostrar verso':'Ocultar verso';
  reveal.setAttribute('aria-expanded',String(!answer.hidden));
 };
 close.onclick=hide;backdrop.onclick=hide;
 document.addEventListener('keydown',e=>{
  if(overlay.hidden)return;
  if(e.key==='Escape'){e.preventDefault();hide()}
  if(e.key==='Tab'){
   const list=[close,reveal];const current=list.indexOf(document.activeElement);
   if(e.shiftKey&&current===0){e.preventDefault();reveal.focus()}
   else if(!e.shiftKey&&current===1){e.preventDefault();close.focus()}
   else if(current<0){e.preventDefault();close.focus()}
  }
 });
 function decorate(){
  for(const article of root.querySelectorAll('article.card')){
   if(article.querySelector(':scope > .bm-v049-peek-button'))continue;
   const id=idOf(article);if(!cardPattern.test(id))continue;
   const button=document.createElement('button');
   button.type='button';button.className='bm-v049-peek-button';
   button.textContent='👁 Visualizar';
   button.title='Visualizar '+id+' nesta página, sem abrir outra aba e sem alterar o SRS';
   button.setAttribute('aria-label','Visualizar '+id+' nesta página sem avaliar');
   button.onclick=e=>{e.preventDefault();e.stopPropagation();show(id,button)};
   const heading=article.querySelector(':scope > h3');
   if(heading)heading.before(button);
   else article.insertBefore(button,article.firstChild);
  }
 }
 let pending=false;
 const observer=new MutationObserver(()=>{
  if(pending)return;
  pending=true;
  requestAnimationFrame(()=>{pending=false;decorate()});
 });
 observer.observe(root,{childList:true,subtree:true});
 decorate();
 window.BancoMestreVisualizarCardV049={
  get ready(){return !!document.getElementById('bmCardPeekV049')},
  get visible(){return !overlay.hidden},
  showId(id){const button=[...root.querySelectorAll('.bm-v049-peek-button')]
    .find(b=>b.closest('article.card')&&idOf(b.closest('article.card'))===id);
   if(button)show(id,button);return !!button},
  close:hide
 };
})();
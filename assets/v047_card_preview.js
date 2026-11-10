/* V047 — painel de pré-visualização de flashcards no leitor PDF.
   Prévia somente leitura: não avalia nem altera o SRS, não antecipa gabarito. */
(function(){
 'use strict';
 const $=id=>document.getElementById(id);
 const main=$('pdfMainV043'),content=document.querySelector('#pdfDialog .bm-v046-pdf-content'),pdf=$('pdfDialog');
 if(!main||!content||!pdf)return;

 const button=document.createElement('button');
 button.id='pdfQuickCardV047';button.type='button';button.className='bm-v043-icon bm-v047-card-icon';
 button.textContent='▣';button.title='Ver rapidamente o flashcard vinculado à página do PDF';
 button.setAttribute('aria-label','Visualização rápida do flashcard');
 button.setAttribute('aria-controls','pdfQuickPanelV047');button.setAttribute('aria-expanded','false');
 main.append(button);

 const panel=document.createElement('aside');panel.id='pdfQuickPanelV047';panel.className='bm-v047-card-panel';panel.hidden=true;
 panel.setAttribute('aria-label','Pré-visualização de flashcards');
 const heading=document.createElement('div');heading.className='bm-v047-card-header';
 const title=document.createElement('strong');title.textContent='Cartão rápido';
 const close=document.createElement('button');close.type='button';close.textContent='×';close.title='Fechar prévia do cartão';close.setAttribute('aria-label','Fechar prévia do flashcard');
 heading.append(title,close);
 const notice=document.createElement('p');notice.className='bm-v047-card-hint';
 notice.textContent='Cartões vinculados a esta página ou consulta por ID. Nenhuma avaliação SRS é registrada.';
 const linked=document.createElement('div');linked.id='pdfQuickLinkedV047';linked.className='bm-v047-linked';
 const searchRow=document.createElement('div');searchRow.className='bm-v047-card-search';
 const input=document.createElement('input');input.id='pdfQuickIdV047';input.type='text';input.placeholder='CARD-0001 / PROP-IJUI-001';input.setAttribute('aria-label','ID do flashcard a visualizar');
 const find=document.createElement('button');find.type='button';find.textContent='Ver';
 searchRow.append(input,find);
 const result=document.createElement('div');result.id='pdfQuickResultV047';result.setAttribute('aria-live','polite');result.className='bm-v047-card-result';
 panel.append(heading,notice,linked,searchRow,result);
 content.append(panel);

 const valid=/^(?:CARD-\d{4,}|PROP-IJUI-\d+)$/;
 let cache=null,promise=null,lastId='';
 function show(){
  panel.hidden=false;button.setAttribute('aria-expanded','true');
  updateLinked();
 }
 function hide(){panel.hidden=true;button.setAttribute('aria-expanded','false')}
 button.onclick=()=>panel.hidden?show():hide();
 close.onclick=hide;
 pdf.addEventListener('close',hide);
 function idsInPage(){
  const marks=window.BancoMestrePDFV042?.currentMarks||[];
  const ids=[];
  for(const mark of marks){
   if(mark?.type!=='card')continue;
   for(const word of String(mark.text||'').toUpperCase().match(/(?:CARD-\d{4,}|PROP-IJUI-\d+)/g)||[]){
    if(valid.test(word)&&!ids.includes(word))ids.push(word);
   }
  }
  return ids;
 }
 function updateLinked(){
  const page=window.BancoMestrePDFV042?.currentPage||0;
  const ids=idsInPage();
  linked.replaceChildren();
  const p=document.createElement('small');
  p.textContent=ids.length?ids.length+' cartão(ões) na página '+page+':':'Nenhum vínculo CARD nesta página '+page+'. Informe um ID abaixo.';
  linked.append(p);
  for(const id of ids){
   const b=document.createElement('button');b.type='button';b.textContent=id;b.title='Abrir prévia do '+id;
   b.onclick=()=>view(id);linked.append(b);
  }
  if(ids.length)void view(ids[0]);
  else if(lastId)void view(lastId);
  else result.replaceChildren();
 }
 async function catalog(){
  if(cache)return cache;
  if(!promise)promise=(async()=>{
   const meta=await fetch('assets/meta_v021.json',{cache:'no-store'}).then(r=>{if(!r.ok)throw Error('Metadados do Banco Mestre indisponíveis');return r.json()});
   const raw=await Promise.all(meta.card_files.map(async name=>{
    const r=await fetch('assets/'+name);if(!r.ok)throw Error('Catálogo de cartões indisponível: '+name);return r.json();
   }));
   const ij=await fetch('assets/ijui_flashcards_operacionais_v027.json',{cache:'no-store'}).then(r=>{if(!r.ok)throw Error('Cartões Ijuí indisponíveis');return r.json()});
   const all=[...raw.flat(),...ij.cards];
   const idx=new Map();
   for(const c of all)if(valid.test(c.id)&&!idx.has(c.id))idx.set(c.id,c);
   cache=idx;return idx;
  })().catch(e=>{promise=null;throw e});
  return promise;
 }
 function line(root,label,value){
  if(value===undefined||value===null||String(value).trim()==='')return;
  const b=document.createElement('div');const s=document.createElement('small');s.textContent=label;
  const p=document.createElement('p');p.textContent=String(value);
  b.append(s,p);root.append(b);
 }
 async function view(id){
  id=String(id||'').trim().toUpperCase();
  if(!valid.test(id)){result.textContent='Informe um ID como CARD-0028 ou PROP-IJUI-001.';return}
  input.value=id;lastId=id;result.textContent='Carregando '+id+'...';
  try{
   const db=await catalog();
   if(!panel.isConnected||!pdf.open||lastId!==id)return;
   const card=db.get(id);
   result.replaceChildren();
   if(!card){result.textContent='Cartão '+id+' não encontrado na base carregada.';return}
   line(result,id+' · '+(card.subject||card.discipline||'Banco Mestre'),card.front);
   const reveal=document.createElement('button');reveal.type='button';reveal.className='bm-v047-reveal';
   reveal.textContent='Mostrar resposta';reveal.setAttribute('aria-expanded','false');
   const answer=document.createElement('div');answer.className='bm-v047-answer';answer.hidden=true;
   line(answer,'Resposta original',card.back||'Resposta não cadastrada');
   line(answer,'Explicação',card.expl);
   line(answer,'Macete',card.mnemonic);
   const full=document.createElement('a');full.className='bm-v047-full';
   const url=new URL('v040.html',location.href);url.searchParams.set('cartao',id);url.hash='cartoes';
   full.href=url.href;full.target='_blank';full.rel='noopener noreferrer';full.textContent='Abrir cartão completo';
   reveal.onclick=()=>{
    answer.hidden=!answer.hidden;
    reveal.setAttribute('aria-expanded',String(!answer.hidden));
    reveal.textContent=answer.hidden?'Mostrar resposta':'Ocultar resposta';
   };
   result.append(reveal,answer,full);
  }catch(e){result.textContent='Falha na consulta do cartão: '+e.message}
 }
 find.onclick=()=>view(input.value);
 input.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();view(input.value)}});
 // Mudança de página durante leitura: atualizar lista quando o painel estiver aberto.
 const pager=$('pdfPager');
 if(pager)new MutationObserver(()=>{if(!panel.hidden)updateLinked()})
  .observe(pager,{childList:true,subtree:true,characterData:true});
 window.BancoMestreCardPreviewV047={
  get ready(){return !!$('pdfQuickCardV047')&&!!$('pdfQuickPanelV047')},
  get open(){return !panel.hidden},
  get visibleId(){return lastId},
  openId(id){show();return view(id)}
 };
})();
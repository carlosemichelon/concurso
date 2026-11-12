/* V135 — ajuste da interface em tela inteira, preservando dados e motores anteriores. */
(function(){
'use strict';
const $=(selector,base=document)=>base.querySelector(selector);
const header=$('.hdr'),privacy=$('.bm134-privacy');
if(header&&privacy){
  const badge=$('.hdr-badge',header);if(badge)badge.textContent='BANCO MESTRE';
  const title=$('.hdr-title',header);if(title)title.textContent='Redação';
  header.append(privacy);
}
const back=$('.hdr-back');if(back){back.href='./index.html';back.textContent='← Voltar ao portal'}
const privacyLink=$('.bm132-notice-title a');if(privacyLink)privacyLink.href='./index.html';
const training=$('#aba-treino'),guide=$('#fttd-conteudo')?.closest('.card'),fields=$('#treino-campos');
if(training&&guide&&fields){
 const editorCard=fields.closest('.card');
 if(editorCard&&guide!==editorCard){
   guide.classList.add('bm135-guide');
   editorCard.insertBefore(guide,fields);
 }
 const save=$('#btn-salvar-treino');
 const toolbar=save?.parentElement;
 if(toolbar&&toolbar.querySelector('#btn-seletor-tema')){
   const btns=Array.from(toolbar.children).filter(x=>x.tagName==='BUTTON');
   const target={theme:btns.slice(0,2),support:btns.slice(2,5),files:btns.slice(5)};
   const sections=[['theme','Tema'],['support','Planejamento e referências'],['files','Progresso e arquivos']];
   toolbar.classList.add('bm135-action-grid');
   for(const [key,label]of sections){
     const group=document.createElement('div');group.className='bm135-action-group';
     const title=document.createElement('h3');title.textContent=label;group.append(title);
     target[key].forEach(x=>group.append(x));
     toolbar.append(group);
   }
 }
}
const topics=$('#lista-temas');
if(topics){
 function decorateCards(){
   topics.querySelectorAll('.tema-card').forEach(card=>{
     if(card.querySelector('.bm135-theme-action'))return;
     const action=document.createElement('span');action.className='bm135-theme-action';action.textContent='Treinar este tema';
     const metadata=card.querySelector('.tema-meta');
     if(metadata)metadata.after(action);else card.append(action);
   });
 }
 new MutationObserver(decorateCards).observe(topics,{childList:true});
 decorateCards();
}
const previous=window.setTab;
if(typeof previous==='function'){
 window.setTab=function(id){
   const before=document.querySelector('.aba.ativo')?.id;
   const result=previous(id);
   const after=document.querySelector('.aba.ativo')?.id;
   if(before!==after&&after&&(id==='temas'||id==='treino'||id==='flashcards')){
     try{window.scrollTo({top:0,behavior:'instant'})}catch(e){window.scrollTo(0,0)}
   }
   return result;
 };
}
window.BancoMestreTelaInteiraV135={fullPage:window===window.top,temas:!!topics,treino:!!fields};
})();
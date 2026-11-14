/* Banco Mestre V168 — gaveta móvel de Outros cartões para o leitor V165.
 * Camada de apresentação: não lê nem grava SRS/localStorage/IndexedDB. */
(function(){
 'use strict';
 function init(){
  const overlay=document.getElementById('bmCardPeekV050');
  const panel=overlay?.querySelector('.bm165-panel');
  const layout=panel?.querySelector('.bm165-layout');
  const aside=panel?.querySelector('.bm165-related');
  const list=aside?.querySelector('.bm165-related-list');
  const toggle=panel?.querySelector('.bm165-toggle-sidebar');
  const title=aside?.querySelector('.bm165-related-title');
  const count=aside?.querySelector('.bm165-related-count');
  if(!overlay||!panel||!layout||!aside||!list||!toggle||!title||!count)return;
  if(panel.dataset.bm168Ready==='true')return;
  panel.dataset.bm168Ready='true';
  const mobile=window.matchMedia('(max-width:760px)');
  const drawerId='bm168-mobile-related';
  aside.id=aside.id||drawerId;
  toggle.setAttribute('aria-controls',aside.id);
  const head=document.createElement('div');head.className='bm168-drawer-head';
  const titleWrap=document.createElement('div');titleWrap.className='bm168-drawer-heading';
  titleWrap.append(title,count);
  const closeButton=document.createElement('button');closeButton.type='button';
  closeButton.className='bm168-drawer-close';closeButton.textContent='Fechar';
  closeButton.setAttribute('aria-label','Fechar lista de outros cartões');
  head.append(titleWrap,closeButton);aside.prepend(head);
  const scrim=document.createElement('button');scrim.type='button';
  scrim.className='bm168-drawer-scrim';scrim.hidden=true;
  scrim.setAttribute('aria-label','Fechar lista de outros cartões');
  layout.insertBefore(scrim,aside);
  function sync(){
   const hidden=panel.classList.contains('bm165-sidebar-hidden');
   const open=mobile.matches&&!hidden&&!overlay.hidden;
   panel.classList.toggle('bm168-drawer-open',open);
   scrim.hidden=!open;
   closeButton.hidden=!mobile.matches;
   toggle.setAttribute('aria-expanded',String(!hidden));
   toggle.title=hidden?'Mostrar outros cartões':'Ocultar outros cartões';
  }
  function hideDrawer(restoreFocus){
   panel.classList.add('bm165-sidebar-hidden');
   sync();
   if(restoreFocus&&mobile.matches)toggle.focus({preventScroll:true});
  }
  if(mobile.matches)hideDrawer(false);else sync();
  toggle.addEventListener('click',sync);
  closeButton.addEventListener('click',()=>hideDrawer(true));
  scrim.addEventListener('click',()=>hideDrawer(true));
  list.addEventListener('click',event=>{
   if(!mobile.matches||!event.target.closest('button.bm165-related-item'))return;
   // O leitor V165 abre o cartão no botão antes de este evento chegar à lista.
   hideDrawer(false);
   panel.querySelector('.bm163-scroll')?.focus({preventScroll:true});
  });
  const nav=panel.querySelector('.bm165-header-nav');
  nav?.addEventListener('click',event=>{
   if(!mobile.matches)return;
   if(event.target.closest('.bm165-prev,.bm165-next'))hideDrawer(false);
  });
  new MutationObserver(()=>{
   if(overlay.hidden&&mobile.matches)hideDrawer(false);
   else sync();
  }).observe(overlay,{attributes:true,attributeFilter:['hidden']});
  const resized=()=>{
   panel.classList.toggle('bm165-sidebar-hidden',mobile.matches);
   sync();
  };
  if(mobile.addEventListener)mobile.addEventListener('change',resized);
  else mobile.addListener(resized);
  document.addEventListener('keydown',event=>{
   if(event.key!=='Escape'||!panel.classList.contains('bm168-drawer-open'))return;
   event.preventDefault();event.stopImmediatePropagation();hideDrawer(true);
  },true);
  sync();
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
 else init();
})();

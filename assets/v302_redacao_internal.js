/* V302 — Redação integrada à navegação do Banco Mestre.
 * A página original V296 continua intacta, dentro do portal. Ao mudar de
 * seção, a janela principal não recarrega e o token OAuth em memória permanece.
 * Nenhuma credencial é enviada ou copiada para o iframe.
 */
(function(){
'use strict';
if(window.BM302RedacaoDentroPortal)return;
const TARGET='./redacao_temas_treino_v296.html?versao=V296';
const HASH='#redacao-oficina';
let host=null,iframe=null;
const $=id=>document.getElementById(id);
function ensure(){
 if(host?.isConnected)return host;
 const main=document.querySelector('main');
 if(!main)return null;
 host=$('bm302-redacao-shell');
 if(!host){
  host=document.createElement('section');host.id='bm302-redacao-shell';
  host.className='bm302-redacao-section';
  host.style.cssText='display:none;max-width:100%;padding:0';
  iframe=document.createElement('iframe');
  iframe.id='bm302-redacao-original';
  iframe.title='Oficina completa de Redação — Banco Mestre';
  iframe.loading='lazy';
  iframe.referrerPolicy='same-origin';
  iframe.style.cssText='border:1px solid #cad4dc;background:#fff;width:100%;height:calc(100vh - 180px);min-height:570px;display:block';
  iframe.addEventListener('load',()=>{
   // Links de retorno da página original levam à seção Assuntos do portal pai,
   // em vez de carregar um segundo Banco Mestre dentro do iframe.
   try{
    const doc=iframe.contentDocument;
    doc?.addEventListener('click',event=>{
     const anchor=event.target.closest?.('a[href]');
     if(!anchor)return;
     const url=new URL(anchor.getAttribute('href'),iframe.contentWindow.location.href);
     if(url.origin===location.origin&&/\/(?:index\.html)?$/.test(url.pathname)){
      event.preventDefault();
      showSection('assuntos');
     }
    },true);
   }catch(_){/* O portal pai permanece conectado mesmo se não for possível inspecionar o iframe. */}
  });
  host.append(iframe);main.append(host);
 }
 iframe=$('bm302-redacao-original');
 return host;
}
function showSection(id){
 const nav=document.querySelector('header nav[aria-label="Seções"]')||document.querySelector('header nav');
 const main=document.querySelector('main');
 if(!main||!nav)return;
 main.querySelectorAll(':scope > section').forEach(s=>s.classList.toggle('active',s.id===id));
 nav.querySelectorAll('button[data-page]').forEach(b=>b.classList.toggle('active',b.dataset.page===(id==='bm302-redacao-shell'?'redacao':id)));
 if(id!=='bm302-redacao-shell'){
  const target=nav.querySelector('button[data-page="'+id+'"]');
  if(target){target.click();return;}
 }
}
function show(){
 const shell=ensure();if(!shell)return;
 const main=document.querySelector('main'),nav=document.querySelector('header nav');
 if(!main||!nav)return;
 main.querySelectorAll(':scope > section').forEach(s=>s.classList.toggle('active',s===shell));
 nav.querySelectorAll('button[data-page]').forEach(b=>b.classList.toggle('active',b.dataset.page==='redacao'));
 shell.style.display='block';
 if(iframe&&!iframe.getAttribute('src'))iframe.setAttribute('src',TARGET);
 if(location.hash!==HASH)history.replaceState(history.state,'',location.pathname+location.search+HASH);
 document.dispatchEvent(new CustomEvent('bm302-section-changed',{detail:{section:'redacao',oauthUnchanged:true}}));
 window.scrollTo({top:0,behavior:'instant'});
}
function hideOnOtherSection(){
 if(!host)return;
 const active=host.classList.contains('active');
 host.style.display=active?'block':'none';
}
function init(){
 const nav=document.querySelector('header nav');
 if(!nav)return;
 ensure();
 // Captura antes dos onclick legados que navegavam para uma nova página.
 nav.addEventListener('click',e=>{
  const button=e.target.closest?.('button[data-page]');
  if(button?.dataset.page==='redacao'){
   e.preventDefault();e.stopImmediatePropagation();show();return;
  }
  // Toda navegação normal conserva o documento e o gerenciador de Drive.
  if(button)queueMicrotask(hideOnOtherSection);
 },true);
 window.addEventListener('hashchange',()=>{
  if(location.hash==='#redacao'||location.hash===HASH)show();
  else queueMicrotask(hideOnOtherSection);
 });
 window.addEventListener('popstate',()=>{
  if(location.hash==='#redacao'||location.hash===HASH)show();
  else queueMicrotask(hideOnOtherSection);
 });
 if(location.hash==='#redacao'||location.hash===HASH)show();
}
window.BM302RedacaoDentroPortal=Object.freeze({open:show});
window.BancoMestreRedacaoV146=Object.freeze({abrir:show});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
else init();
})();

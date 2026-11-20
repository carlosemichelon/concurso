/* Banco Mestre V240 — aba NATIVA; montagem em Shadow DOM, sem iframe, dados privados locais. */
(function(){
'use strict';
if(window.BM240NativeStudy)return;
let installing=null;
function installMobileRegisterCollapse(root){
 const form=root.getElementById('sessionForm');
 const panel=form?.closest('.panel');
 const heading=panel?.querySelector('h2');
 if(!form||!heading||root.getElementById('bm311-manual-toggle'))return;
 const style=document.createElement('style');
 style.textContent=`
 @media(max-width:760px){
  #registro #bm311-manual-toggle{display:block;width:100%;min-height:42px;margin:9px 0 2px;
   text-align:left;border:1px solid #b8d4d1;border-radius:9px;padding:10px 12px;
   font-weight:750;color:#185d63;background:#f1f8f7;touch-action:manipulation}
  #registro .bm311-manual-closed #sessionForm{display:none!important}
 }
 @media(min-width:761px){#registro #bm311-manual-toggle{display:none!important}}
 `;
 root.append(style);
 const toggle=document.createElement('button');
 toggle.type='button';
 toggle.id='bm311-manual-toggle';
 toggle.setAttribute('aria-controls','sessionForm');
 heading.after(toggle);
 let expanded=false;
 const media=window.matchMedia('(max-width:760px)');
 const sync=()=>{
  const closed=media.matches&&!expanded;
  panel.classList.toggle('bm311-manual-closed',closed);
  toggle.textContent=closed?'▾ Mostrar registro manual':'▴ Recolher registro manual';
  toggle.setAttribute('aria-expanded',String(!closed));
 };
 toggle.addEventListener('click',()=>{expanded=!expanded;sync()});
 // Editar uma sessão histórica abre o formulário antes de navegar até ele.
 root.addEventListener('click',event=>{
  if(event.target.closest('[data-edit-session]')){expanded=true;sync()}
 },true);
 if(media.addEventListener)media.addEventListener('change',sync);
 else media.addListener(sync);
 sync();
}
const mount=async()=>{
 const nav=document.querySelector('header nav[aria-label="Seções"]')||document.querySelector('header nav');
 const main=document.querySelector('main');
 if(!nav||!main)throw Error('Menu principal indisponível');
 if(document.getElementById('bm240-study-tab'))return;
 const button=document.createElement('button');
 button.type='button';button.id='bm240-study-tab';button.dataset.page='controle-estudos';
 button.textContent='Controle de Estudos';
 button.title='Cronômetro manual, calendário, planejamentos e relatórios';
 nav.insertBefore(button,nav.firstElementChild);
 const section=document.createElement('section');
 section.id='controle-estudos';section.className='bm240-study-section';
 const host=document.createElement('div');host.id='bm240-native-host';host.style.cssText='background:#f6f9f9;border:1px solid #d7e5e4;border-radius:12px;overflow:hidden;min-height:360px';
 section.append(host);main.append(section);
 const root=host.attachShadow({mode:'open'});
 const loading=document.createElement('p');loading.textContent='Carregando Controle de Estudos...';loading.style.padding='25px';
 root.append(loading);
 button.addEventListener('click',()=>{
   // A base relativa ../ do staging exige manter o caminho aninhado ao navegar.
   // Não chamar o roteador legado nesta aba de homologação: sua URL hash é resolvida na raiz.
   if(typeof window.section==='function'&&!location.pathname.includes('/homologacao-v243/')){
    window.section('controle-estudos');
   }else{
    document.querySelectorAll('main>section').forEach(s=>s.classList.toggle('active',s===section));
    document.querySelectorAll('header nav button[data-page]').forEach(b=>b.classList.toggle('active',b===button));
    location.hash='controle-estudos';
   }
 });
 // Rota e seleção precisam coincidir: o bootstrap da V242 pode reativar "Assuntos"
 // depois da montagem nativa. Vigiar somente as classes das seções de topo.
 const alignNativeRoute=()=>{
  if(location.hash!=='#controle-estudos')return;
  const active=document.querySelector('main>section.active');
  if(active===section&&button.classList.contains('active'))return;
  document.querySelectorAll('main>section').forEach(s=>s.classList.toggle('active',s===section));
  document.querySelectorAll('header nav button[data-page]').forEach(b=>b.classList.toggle('active',b===button));
 };
 const routeObserver=new MutationObserver(alignNativeRoute);
 for(const page of main.querySelectorAll(':scope>section')){
  routeObserver.observe(page,{attributes:true,attributeFilter:['class']});
 }
 window.addEventListener('hashchange',alignNativeRoute);

 try{
  const response=await fetch('./controle-estudos-v245.html?ref=245',{cache:'no-cache'});
  if(!response.ok)throw Error('Interface indisponível ('+response.status+')');
  const doc=new DOMParser().parseFromString(await response.text(),'text/html');
  if(!doc.getElementById('tabs')||!doc.getElementById('sessionForm')||!doc.getElementById('calGrid'))throw Error('Estrutura de interface incompleta');
  const style=document.createElement('style');
  style.textContent=doc.querySelector('style')?.textContent||'';

  root.replaceChildren(style);
  for(const element of [...doc.body.children]){
   if(element.tagName!=='SCRIPT')root.append(element);
  }
  await new Promise((resolve,reject)=>{
   if(typeof window.BM240ControlInit==='function')return resolve();
   const script=document.createElement('script');
   script.src='assets/v245_controle_app.js?v=245';
   script.onload=resolve;script.onerror=()=>reject(Error('Módulo de estudos não carregou'));
   document.head.append(script);
  });
  window.BM240ControlInit(root);
  installMobileRegisterCollapse(root);
  window.BancoMestreIconsV096?.refresh?.();
  document.dispatchEvent(new CustomEvent('bm240-study-mounted'));
 }catch(e){
  root.replaceChildren(loading);loading.textContent='Não foi possível carregar o Controle de Estudos: '+e.message;
  loading.setAttribute('role','alert');console.error('V240 Controle:',e);
 }
 const hash=location.hash;
 const explicit=Boolean(hash&&hash!=='#');
 const q=new URLSearchParams(location.search);
 const deep=q.has('cartao')||q.has('tema')||q.has('pdf');
 if(window.BM240OpenStudyDefault===true||hash==='#controle-estudos'||(!explicit&&!deep))button.click();
};
function start(){if(!installing)installing=mount().catch(e=>console.error('V240 montagem:',e));return installing}
window.BM240NativeStudy=Object.freeze({start});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
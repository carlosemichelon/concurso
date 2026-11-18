/* Banco Mestre V240 — aba NATIVA; montagem em Shadow DOM, sem iframe, dados privados locais. */
(function(){
'use strict';
if(window.BM240NativeStudy)return;
let installing=null;
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
 try{
  const response=await fetch('./controle-estudos-v240.html?ref=240',{cache:'no-cache'});
  if(!response.ok)throw Error('Interface indisponível ('+response.status+')');
  const doc=new DOMParser().parseFromString(await response.text(),'text/html');
  if(!doc.getElementById('tabs')||!doc.getElementById('sessionForm')||!doc.getElementById('calGrid'))throw Error('Estrutura de interface incompleta');
  const style=document.createElement('style');
  style.textContent=doc.querySelector('style')?.textContent||'';
  style.textContent+='\n.bm243-homologation{padding:9px 14px;background:#edf2f2;color:#41575b;border-bottom:1px solid #cbd6d5;font:650 12px/1.5 system-ui}';
  root.replaceChildren(style);
  const banner=document.createElement('div');
  banner.className='bm243-homologation';
  banner.setAttribute('role','status');
  banner.textContent='HOMOLOGAÇÃO V243 · Dados de teste separados do Banco Mestre oficial; não registre horas reais nesta versão.';
  root.append(banner);
  for(const element of [...doc.body.children]){
   if(element.tagName!=='SCRIPT')root.append(element);
  }
  await new Promise((resolve,reject)=>{
   if(typeof window.BM240ControlInit==='function')return resolve();
   const script=document.createElement('script');
   script.src='assets/v240_controle_app.js?v=240';
   script.onload=resolve;script.onerror=()=>reject(Error('Módulo de estudos não carregou'));
   document.head.append(script);
  });
  window.BM240ControlInit(root);
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
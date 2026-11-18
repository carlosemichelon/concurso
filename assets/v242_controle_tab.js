/* Banco Mestre V242: nova aba de controle de estudos, isolada do SRS. */
(function(){
'use strict';
function install(){
 if(document.getElementById('bm238-study-tab'))return;
 const nav=document.querySelector('header nav[aria-label="Seções"]')||document.querySelector('header nav');
 const main=document.querySelector('main');
 if(!nav||!main){console.warn('V242: menu principal indisponível');return}
 const button=document.createElement('button');
 button.id='bm238-study-tab';button.type='button';button.dataset.page='controle-estudos';
 button.textContent='Controle de Estudos';button.title='Horas líquidas, planejamento, exercícios e revisões de conteúdo';
 nav.insertBefore(button,nav.firstElementChild);
 const sectionNode=document.createElement('section');sectionNode.id='controle-estudos';
 const panel=document.createElement('div');panel.className='panel';
 panel.style.cssText='padding:0!important;overflow:hidden;border-radius:13px';
 const frame=document.createElement('iframe');
 frame.id='bm238-study-frame';frame.title='Controle de Estudos — Banco Mestre';
 frame.loading='eager';frame.src='./controle-estudos-v242.html?v=241';
 frame.style.cssText='border:0;width:100%;height:1020px;display:block;background:#f6f9f9';
 panel.appendChild(frame);sectionNode.appendChild(panel);main.appendChild(sectionNode);
 button.onclick=function(){if(typeof window.section==='function'){window.section('controle-estudos')}else{document.querySelectorAll('main section').forEach(x=>x.classList.toggle('active',x===sectionNode));document.querySelectorAll('header nav button').forEach(x=>x.classList.toggle('active',x===button));location.hash='controle-estudos'}};
 window.addEventListener('message',function(e){if(e.origin!==location.origin||e.source!==frame.contentWindow||e.data?.type!=='bm238-size')return;
 const h=Number(e.data.height);if(Number.isFinite(h)&&h>=600&&h<=30000)frame.style.height=Math.ceil(h+25)+'px'});
 window.BancoMestreIconsV096?.refresh?.();
 button.setAttribute('aria-label','Controle de Estudos — página inicial');
 // Primeiro ícone e página inicial padrão; links diretos explícitos têm prioridade.
 const explicitSection=Boolean(location.hash&&location.hash!=='#');
 const params=new URLSearchParams(location.search);
 const deepLink=params.has('cartao')||params.has('tema')||params.has('pdf');
 if(location.hash==='#controle-estudos'||(!explicitSection&&!deepLink))button.click();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();
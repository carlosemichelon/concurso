/* V106 — textos de navegação em Assuntos mais curtos, sem alterar disciplinas. */
(function(){
 'use strict';
 function edit(){
  const root=document.getElementById('assuntos');
  if(!root)return;
  const heading=root.querySelector('.panel > h2:first-child');
  const intro=root.querySelector('.panel > p.intro');
  const subjects=root.querySelector('.panel > h2:nth-of-type(2)');
  if(heading)heading.textContent='Áreas de estudo';
  if(intro)intro.textContent='Escolha uma área e abra um assunto.';
  if(subjects)subjects.textContent='Assuntos';
  for(const node of root.querySelectorAll('p')){
   if(node===intro)continue;
   const text=node.textContent?.trim()||'';
   if(text.startsWith('Abra cada assunto para ler explicações, consultar imagens e PDFs'))
    node.textContent='Abra o assunto para ver PDFs, imagens e cartões.';
  }
  const hero=document.querySelector('main > .hero');
  if(hero){
   const h=hero.querySelector('h1'),p=hero.querySelector('p');
   if(h&&/^(Sua área de estudos|O que deseja estudar\?)$/.test(h.textContent.trim()))h.textContent='Estudar';
   if(p&&(/Encontre conteúdos por disciplina|As áreas e os assuntos originais/.test(p.textContent)))
    p.textContent='Assuntos, PDFs, imagens e cartões em um só lugar.';
  }
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',edit,{once:true});
 else edit();
 window.BancoMestreTextoAssuntosV106=Object.freeze({refresh:edit});
})();
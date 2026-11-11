/* V098 — revisão editorial de textos estáticos do portal.
   Só substitui textos conhecidos; não altera IDs, conteúdo dos cartões, dados,
   busca, leitores, grifos, histórico nem nomes dos documentos. */
(function(){
 'use strict';
 const changes=[
  ['header .head .version:last-child',
   'Assuntos, PDFs, cartões e Atlas para revisão técnica',
   'Conteúdos, PDFs, flashcards e pranchas organizados para estudo'],
  ['.hero h1',
   'O que deseja estudar?',
   'Sua área de estudos'],
  ['.hero p',
   'As áreas e os assuntos originais estão de volta. Selecione o tema para encontrar flashcards, imagens e PDFs relacionados, com guias de estudo quando disponíveis.',
   'Encontre conteúdos por disciplina, abra PDFs para grifar e consulte flashcards e pranchas técnicas no mesmo lugar.'],
  ['#assuntos .panel > h2:first-child',
   'Comece por uma área',
   'Escolha uma área de estudo'],
  ['#assuntos .panel > h2:nth-of-type(2)',
   'Disciplinas, assuntos e subassuntos',
   'Assuntos e subassuntos'],
  ['#assuntos .panel > p.intro',
   'Selecione uma área e explore os assuntos. Cada tema reúne conceitos, imagens e documentos relacionados quando disponíveis.',
   'Explore os conteúdos da sua área. Os assuntos reúnem explicações, cartões, imagens e PDFs relacionados quando disponíveis.'],
  ['#pdfs .panel > h2',
   'PDFs para estudo',
   'Biblioteca de PDFs'],
  ['#pdfs .panel > p.intro',
   'Consulte normas, apostilas e materiais organizados por área. Abra um PDF para ler, fazer grifos e associar cartões às páginas. Arquivos já guardados neste navegador podem ser reabertos sem novo envio.',
   'Consulte normas e materiais por assunto. Leia, grife e anote no editor; as cópias locais e os documentos originais permanecem separados.'],
  ['#cartoes .panel > p.intro',
   'Leia a pergunta e use 👁 Ver cartão para consultar a resposta, a explicação e o macete sem iniciar uma revisão. Para estudar com mais detalhes, abra o cartão completo em outra aba. A consulta não altera o SRS.',
   'Busque por ID, disciplina ou assunto. Consulte perguntas, explicações e macetes sem modificar o calendário de revisão espaçada (SRS).'],
  ['#imagens .panel > h2',
   'Imagens e pranchas',
   'Atlas de imagens e pranchas'],
  ['#imagens .panel > p.intro',
   'Encontre cada prancha por tema, leia o resumo do conteúdo e amplie a imagem para estudar. Exclusões são reversíveis.',
   'Localize pranchas por assunto, amplie para estudar e use o editor para anotações. Ocultar uma imagem não exclui o arquivo original.']
 ];
 function revise(){
  for(const [selector,before,after] of changes){
   const node=document.querySelector(selector);
   if(node&&node.textContent.trim()===before)node.textContent=after;
  }
  for(const [selector,text] of [
   ['#pdfSearch','Buscar norma, capítulo ou assunto'],
   ['#topicSearch','Buscar assunto, norma ou conceito'],
   ['#cardSearch','Buscar ID, questão ou conteúdo'],
   ['#imageSearch','Buscar imagem, assunto ou descrição']
  ]){
   const el=document.querySelector(selector);
   if(el&&el.placeholder)el.placeholder=text;
  }
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',revise,{once:true});
 else revise();
 window.BancoMestrePortalTextV098={refresh:revise};
})();
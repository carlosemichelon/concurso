/* Banco Mestre V282 — somente estrutura de apresentação do corpo.
 * Preserva todos os painéis, nós, controles, listeners, dados e eventos SRS. */
(function(){
'use strict';
if(window.BM282BodyLayout)return;
const pages=[
 {id:'assuntos',context:'Meus Estudos',quick:[['Flashcards','cartoes'],['Documentos PDF','pdfs'],['Imagens e pranchas','imagens']],
  info:'Selecione uma área na lista principal para localizar conceitos e materiais. Use os filtros para refinar por disciplina e assunto.',
  notice:'Bibliotecas privadas e originais do Drive requerem autenticação. Os materiais já publicados permanecem acessíveis.'},
 {id:'pdfs',context:'Meus Estudos  /  PDFs',quick:[['Explorar assuntos','assuntos'],['Revisar flashcards','cartoes'],['Abrir imagens','imagens']],
  info:'Pesquise documentos por norma ou assunto. Os arquivos privados exigem acesso autorizado ao Google Drive; documentos locais continuam neste navegador.',
  notice:'Grifos e anotações não são apagados ao mudar a apresentação. A confirmação de sincronização depende de verificação no Drive.'},
 {id:'cartoes',context:'Meus Estudos  /  Flashcards',quick:[['Explorar assuntos','assuntos'],['Consultar PDFs','pdfs'],['Imagens e pranchas','imagens']],
  info:'Use Ordenar por ID e Últimos cartões acima da lista. A resposta original e os 11 módulos permanecem disponíveis ao abrir a ficha.',
  notice:'Consultar um cartão não equivale a uma avaliação SRS. Cartões novos e cartões antigos aprimorados permanecem distintos.'},
 {id:'imagens',context:'Meus Estudos  /  Imagens',quick:[['Explorar assuntos','assuntos'],['Revisar flashcards','cartoes'],['Documentos PDF','pdfs']],
  info:'Localize diagramas, cortes e pranchas por assunto. Abra a imagem para leitura ampliada.',
  notice:'Os arquivos originais e as marcações existentes são preservados. Nenhuma imagem técnica é alterada por este tema.'}
];
function node(tag,klass,text){const el=document.createElement(tag);if(klass)el.className=klass;if(text!==undefined)el.textContent=text;return el}
function navigate(id){
 const item=document.querySelector('body>header nav button[data-page="'+id+'"]');
 if(item){item.click();return}
 const fn=window.BMPortal?.goToPage;
 if(typeof fn==='function')fn(id);
}
function init(){
 for(const page of pages){
  const section=document.getElementById(page.id);
  if(!section||section.classList.contains('bm282-two-column'))continue;
  const panel=section.querySelector(':scope > .panel');
  if(!panel)continue;
  const context=node('div','bm282-context',page.context);
  section.insertBefore(context,panel);
  const sidebar=node('aside','bm282-sidebar');
  sidebar.setAttribute('aria-label','Navegação complementar');
  const quick=node('div','bm282-side-panel');
  quick.append(node('h3','bm282-side-heading','Acesso rápido'));
  const links=node('div','bm282-links');
  for(const [label,target] of page.quick){
   const btn=node('button','bm282-quicklink',label);
   btn.type='button';btn.addEventListener('click',()=>navigate(target));
   links.append(btn);
  }
  quick.append(links);
  const note=node('div','bm282-side-panel');
  note.append(node('h3','bm282-side-heading','Orientações de estudo'));
  note.append(node('p','bm282-side-text',page.info));
  const notice=node('div','bm282-side-panel');
  notice.append(node('h3','bm282-side-heading','Avisos'));
  notice.append(node('p','bm282-side-text',page.notice));
  sidebar.append(quick,note,notice);
  section.append(sidebar);
  section.classList.add('bm282-two-column');
 }
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
else init();
window.BM282BodyLayout=Object.freeze({refresh:init});
})();

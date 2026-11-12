/* V137 — recuperar posição dos filtros de exercícios quando o cabeçalho vem antes da ficha. */
(function(){
'use strict';
const practice=document.getElementById('aba-flashcards');
const layout=practice?.querySelector('.bm136-practice-layout');
const sidebar=layout?.querySelector('.bm136-practice-tools');
const question=layout?.querySelector('.bm136-practice-question');
if(!sidebar||!question)return;
const controls=practice.querySelector(':scope > .card');
if(controls)sidebar.appendChild(controls);
const ex=document.getElementById('fc-card'),fb=document.getElementById('fc-feedback');
if(ex&&ex.parentNode!==question)question.appendChild(ex);
if(fb&&fb.parentNode!==question)question.appendChild(fb);
window.BancoMestreQAVisualV137={filterLocated:!!sidebar.querySelector('.card'),questionLocated:!!question.querySelector('#fc-card'),feedbackLocated:!!question.querySelector('#fc-feedback')};
})();
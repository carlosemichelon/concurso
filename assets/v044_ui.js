/* Banco Mestre V044: apresentação. Sem alterar SRS, IDs, PDFs ou registros locais. */
(function(){
 'use strict';
 const $=id=>document.getElementById(id);
 const pdfs=$('pdfs');
 // Mantenha apenas a ação Google Drive no cabeçalho da seção PDFs.
 const drive=$('driveConnectV038');
 const title=pdfs?.querySelector('.panel > h2');
 if(drive&&title){
  const bar=document.createElement('div');bar.className='bm-v044-pdf-heading';
  title.before(bar);bar.append(title,drive);
  drive.setAttribute('aria-label','Conectar ou verificar a autorização do Google Drive');
  drive.title='Autorizar leitura dos documentos do Google Drive';
  const status=$('driveDirectStatusV038');
  if(status){
   bar.after(status);
   status.classList.add('bm-v044-drive-status');
   const refresh=()=>{
    const message=status.textContent||'';
    status.title=message;
    status.classList.toggle('bm-v044-drive-warning',/erro|falha|bloquead|não autorizado|indisponível|expirad|permissão|não foi possível/i.test(message));
   };
   new MutationObserver(refresh).observe(status,{subtree:true,childList:true,characterData:true});
   refresh();
  }
  $('driveDirectV038')?.remove();
 }
 // O usuário prefere cadastrar leis novas pela conversa, não por upload na página.
 // Remove somente a superfície de importação, nunca o IndexedDB ou PDFs locais.
 $('v037LocalGuides')?.remove();
 const outdatedNotice=pdfs?.querySelector('.notice');
 if(outdatedNotice&&/PDFs privados|selecionados uma vez/i.test(outdatedNotice.textContent||'')){
  outdatedNotice.textContent='Abra as leis do Google Drive diretamente no editor. As marcações ficam no navegador; use “Salvar cópia no Drive” quando desejar guardar o PDF anotado. O original permanece intacto.';
 }
 const sectionHeading=document.querySelector('#tema h3.sectionTitle');
 if(sectionHeading&&/Conceitos e explicações cadastradas/i.test(sectionHeading.textContent||'')){
  sectionHeading.textContent='Cartões cadastrados';
 }
 const intro=document.querySelector('#tema p.intro');
 if(intro&&/Leia cada explicação/i.test(intro.textContent||'')){
  intro.textContent='Consulte os cartões deste assunto, com pergunta, explicação, fonte e vínculos disponíveis. Para revisar com SRS, use “Praticar flashcards”.';
 }
 // 270 IDs no Atlas em execução: 254 originais + 16 IMG-P10 (via v034_boot.js).
 const third=document.querySelector('main > .stats .stat:nth-child(3)');
 if(third){
  const b=third.querySelector('b'),note=third.querySelector('span');
  if(b)b.textContent='270';
  if(note)note.textContent='Imagens indexadas · 254 + 16 P10';
 }
 const statLabels=document.querySelectorAll('main > .stats .stat');
 statLabels.forEach((card,i)=>{
  const label=card.querySelector('span');
  if(label)card.title=['Quantidade de PDFs no catálogo','Base canônica e cartões adicionais de Ijuí (cópia de estudo)','270 imagens: IMG-001 a IMG-254 e IMG-P10-01 a IMG-P10-16'][i]||'';
 });
 window.BancoMestreUiV044={get ready(){return !!drive&&!!title},get driveHeader(){return !!document.querySelector('.bm-v044-pdf-heading #driveConnectV038')}};
})();
/* V043 — apenas apresentação compacta dos controles PDF. 
   Reaproveita os elementos, IDs, listeners e permissões da V042 sem alterar SRS,
   armazenamento local ou as operações de edição e salvamento. */
(function(){
 'use strict';
 const $=id=>document.getElementById(id);
 const tools=$('pdfLocalTools'),dialog=$('pdfDialog'),status=$('pdfLocalStatus');
 if(!tools||!dialog||tools.dataset.bmCompactV043==='1')return;
 tools.dataset.bmCompactV043='1';
 const groups=Array.from(tools.children).filter(e=>e.classList.contains('pdfGroup'));
 if(groups.length!==4)return;

 const advanced=document.createElement('div');
 advanced.id='pdfAdvancedV043';
 advanced.className='bm-v043-advanced';
 advanced.hidden=true;
 advanced.setAttribute('aria-label','Ferramentas adicionais do PDF');
 for(const id of ['pdfClearPage','pdfExportPNG','pdfChangeFile']){
  const element=$(id);
  if(element)advanced.appendChild(element);
 }
 const main=document.createElement('div');
 main.id='pdfMainV043';
 main.className='bm-v043-main';
 main.setAttribute('role','group');
 main.setAttribute('aria-label','Ferramentas do PDF. Em telas pequenas, deslize horizontalmente para ver todos os comandos.');
 tools.prepend(main);
 groups.forEach(g=>main.appendChild(g));

 // Troca apenas texto/apresentação; todas as ações continuam nos controles originais.
 const compact={
  pdfPrev:['‹','Página anterior',true],
  pdfNext:['›','Próxima página',true],
  pdfZoomOut:['−','Diminuir zoom',true],
  pdfZoomIn:['+','Aumentar zoom',true],
  pdfDraw:['✎','Caneta livre',true],
  pdfMarker:['▤','Grifar texto',true],
  pdfEraser:['⌫','Borracha',true],
  pdfPan:['✥','Mover página',true],
  pdfUndo:['↶','Desfazer marcação',true],
  pdfRedo:['↷','Refazer marcação',true],
  pdfNoteV037:['▣','Adicionar nota à página',true],
  pdfCardV037:['CARD','Vincular cartão à página',false],
  pdfStatusV037:['✓','Registrar cobertura da página',true],
  pdfExportPDF:['↓ PDF','Baixar cópia PDF anotada',false],
  pdfSaveDriveV042:['☁ Drive','Salvar cópia anotada no Google Drive',false],
  pdfClearPage:['Limpar página','Apagar todas as marcações da página',false],
  pdfExportPNG:['Salvar PNG','Baixar imagem da página anotada',false],
  pdfChangeFile:['Trocar PDF','Escolher outro arquivo PDF local',false]
 };
 for(const [id,[label,description,icon]] of Object.entries(compact)){
  const b=$(id);
  if(!b)continue;
  b.textContent=label;
  b.setAttribute('aria-label',description);
  b.title=description;
  if(icon)b.classList.add('bm-v043-icon');
  if(id==='pdfSaveDriveV042'||id==='pdfExportPDF')b.classList.add('bm-v043-save');
 }

 const more=document.createElement('button');
 more.id='pdfMoreV043';more.type='button';
 more.textContent='⋯';more.className='bm-v043-icon';
 more.title='Mostrar ou recolher ferramentas adicionais';
 more.setAttribute('aria-label','Mais ferramentas de edição');
 more.setAttribute('aria-controls','pdfAdvancedV043');
 more.setAttribute('aria-expanded','false');
 more.onclick=()=>{
  const opening=advanced.hidden;
  advanced.hidden=!opening;
  more.setAttribute('aria-expanded',String(opening));
  more.title=opening?'Recolher ferramentas adicionais':'Mostrar ferramentas adicionais';
 };
 main.appendChild(more);
 tools.appendChild(advanced);

 // A informação longa do nome já está no cabeçalho; o texto original permanece
 // no DOM para leitores de tela, evitando uma segunda linha visual de toolbar.
 const filename=$('pdfFileName');
 if(filename){filename.setAttribute('aria-live','polite')}

 const updateGeneralStatus=()=>{
  if(!status)return;
  const message=(status.textContent||'').trim();
  status.title=message;
  status.classList.toggle('bm-v043-error',/^(não foi possível|falha|erro|acesso google drive não autorizado)/i.test(message));
 };
 if(status){
  new MutationObserver(updateGeneralStatus).observe(status,{characterData:true,childList:true,subtree:true});
  updateGeneralStatus();
 }
 
 // Um sucesso ou falha da gravação deve ficar visível. Estado inicial neutro
 // permanece oculto, de modo que a área do PDF não perca uma linha à toa.
 const saveBox=tools.querySelector('.bm-drive-save-status');
 if(saveBox&&status){
  status.after(saveBox);
  const saveLabel=$('driveSaveStatusV042'),saveLink=$('driveSaveLinkV042');
  const updateSaveStatus=()=>{
   const message=(saveLabel?.textContent||'').trim();
   if(saveLabel)saveLabel.title=message;
   const idle=message===''||/^pronto\b/i.test(message)||/^preparando autorização/i.test(message);
   saveBox.classList.toggle('bm-v043-notice',!idle);
   saveBox.title=message;
  };
  if(saveLabel){
   new MutationObserver(updateSaveStatus).observe(saveLabel,{childList:true,characterData:true,subtree:true});
  }
  if(saveLink){
   new MutationObserver(updateSaveStatus).observe(saveLink,{attributes:true,attributeFilter:['hidden','href']});
  }
  updateSaveStatus();
 }
 window.BancoMestreCompactV043={
  get ready(){return !!$('pdfMainV043')},
  get expanded(){return !advanced.hidden},
  get toolbar(){return main},
  get mainCount(){return main.querySelectorAll('button').length}
 };
})();
/* V106 — legibilidade nítida, ajuste apenas visual e transparência salva intacta. */
/* V102 — editor de tinta e legibilidade; DOM existente e listeners preservados. */
(function(){
'use strict';
const $=id=>document.getElementById(id);
if(window.BancoMestreInkUiV102)return;
function node(tag,className,text){
 const x=document.createElement(tag);
 if(className)x.className=className;
 if(text)x.textContent=text;
 return x;
}
function init(){
 const editor=$('pdfDialog'),ink=editor?.querySelector('.bm100-ink'),
  nativeColor=$('pdfInkColor'),opacity=$('pdfMarkerOpacityV046'),
  api=window.BancoMestrePDFV042;
 if(!editor||!ink||!nativeColor||!opacity||!api||
    $('bm102InkPalette'))return false;
 const group=node('section','bm102-ink-palette');group.id='bm102InkPalette';
 group.setAttribute('aria-label','Cor, transparência e legibilidade');
 const title=node('h4','bm102-ink-title','Cor do desenho e grifo livre');
 const desc=node('p','bm102-ink-desc',
  'Escolha um tom rápido ou use o seletor de cor personalizada.');
 const palette=node('div','bm102-colors');palette.setAttribute('role','group');
 palette.setAttribute('aria-label','Cores rápidas para desenho');
 const presets=[
  {color:'#FDE68A',label:'Amarelo'},
  {color:'#BBF7D0',label:'Verde'},
  {color:'#BAE6FD',label:'Azul'},
  {color:'#FECDD3',label:'Rosa'}
 ];
 const buttons=[];
 for(const p of presets){
  const b=node('button','bm102-color-choice',p.label);b.type='button';
  b.style.setProperty('--bm102-color',p.color);
  b.title='Usar '+p.label.toLowerCase()+' no desenho ou grifo livre';
  b.setAttribute('aria-label',b.title);
  b.addEventListener('click',()=>{
   nativeColor.value=p.color.toLowerCase();
   nativeColor.dispatchEvent(new Event('input',{bubbles:true}));
   nativeColor.dispatchEvent(new Event('change',{bubbles:true}));
   updatePreview();
  });
  buttons.push(b);palette.append(b);
 }
 const sample=node('div','bm102-sample');
 sample.setAttribute('aria-label','Prévia da cor e transparência');
 const samplePrefix=node('span','bm102-sample-label','Exemplo: ');
 const sampleText=node('span','bm102-sample-text','texto legível');
 sample.append(samplePrefix,sampleText);
 const message=node('p','bm102-ink-hint','Quanto menor a porcentagem, mais transparente será o próximo grifo.');
 const readableLabel=node('label','bm102-readable-label');
 const readableInput=document.createElement('input');
 readableInput.type='checkbox';readableInput.id='bm102ReadableHighlights';
 readableInput.checked=api.readableHighlights!==false;
 readableInput.setAttribute('aria-label','Grifos nítidos: preservar contraste das letras no PDF');
 const readableText=node('span','',
  'Grifo nítido (sem apagar as letras)');
 readableLabel.append(readableInput,readableText);
 const readableInfo=node('p','bm102-ink-hint',
  'Mistura a cor com a página, mantendo as letras escuras. Só muda a tela, não altera os grifos ou o PDF exportado.');
 const tintControl=node('label','bm106-tint-label');
 tintControl.id='bm106TintControl';
 const tintTitle=node('span','','Intensidade da cor na tela');
 const tintSlider=document.createElement('input');
 tintSlider.type='range';tintSlider.min='30';tintSlider.max='80';
 tintSlider.step='5';tintSlider.id='bm106TintStrength';
 tintSlider.value=String(Math.round((api.screenHighlightIntensity||.55)*100));
 tintSlider.setAttribute('aria-label','Intensidade visual dos grifos textuais, sem modificar arquivos');
 const tintOutput=document.createElement('output');
 tintOutput.id='bm106TintValue';tintOutput.htmlFor='bm106TintStrength';
 tintOutput.textContent=tintSlider.value+'%';
 tintControl.append(tintTitle,tintSlider,tintOutput);
 tintControl.hidden=!readableInput.checked;
 const tintNote=node('p','bm102-ink-hint','Ajuste apenas a aparência do grifo. As cores e transparências gravadas permanecem intactas.');
 tintNote.id='bm106TintNote';tintNote.hidden=!readableInput.checked;
 tintSlider.addEventListener('input',()=>{
  const result=api.setScreenHighlightIntensity?.(Number(tintSlider.value)/100);
  tintOutput.textContent=Math.round((result??.55)*100)+'%';
 });

 preview.className='bm102-preview-panel';preview.append(sample,message);
 function updatePreview(){
  const hex=nativeColor.value||'#17616a';
  const r=parseInt(hex.slice(1,3),16)||0,g=parseInt(hex.slice(3,5),16)||0,
   b=parseInt(hex.slice(5,7),16)||0;
  const alpha=Math.max(.1,Math.min(.65,Number(opacity.value)/100||.25));
  sampleText.style.backgroundColor='rgba('+r+','+g+','+b+','+alpha+')';
  for(const button of buttons){
   const active=button.style.getPropertyValue('--bm102-color').toLowerCase()===hex.toLowerCase();
   button.setAttribute('aria-pressed',String(active));
  }
 }
 palette.addEventListener('keydown',e=>{
  if(!['ArrowRight','ArrowLeft'].includes(e.key))return;
  const active=buttons.indexOf(document.activeElement);
  if(active<0)return;
  e.preventDefault();
  const next=buttons[(active+(e.key==='ArrowRight'?1:buttons.length-1))%buttons.length];
  next.focus();next.click();
 });
 group.append(title,desc,palette);
 // Keep both native controls in place: neither listeners nor input nodes are replaced.
 ink.prepend(group);ink.append(preview,readableLabel,tintControl,tintNote,readableInfo);
 nativeColor.setAttribute('aria-label','Cor personalizada do desenho e grifo livre');
 nativeColor.addEventListener('input',updatePreview);
 opacity.addEventListener('input',updatePreview);
 readableInput.addEventListener('change',()=>{
  api.setReadableHighlights?.(readableInput.checked);
  tintControl.hidden=!readableInput.checked;
  tintNote.hidden=!readableInput.checked;
 });
 const coverage=$('pdfStatusV037');
 if(coverage){
  coverage.textContent='Cobertura dos cartões';
  coverage.title='Marcar a situação dos flashcards para o conteúdo da página (Integral, Parcial, Sem cartão ou Não auditado)';
  coverage.setAttribute('aria-label',coverage.title);
  const annotations=editor.querySelector('[data-bm100-group="annotations"]');
  if(annotations&&!$('bm102CoverageHint')){
   const hint=node('p','bm102-coverage-hint',
    'Cobertura: selecione a ferramenta e clique no dispositivo para registrar Integral, Parcial, Sem cartão ou Não auditado. Não altera o SRS.');
   hint.id='bm102CoverageHint';annotations.append(hint);
  }
 }
 updatePreview();
 return true;
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
else init();
window.addEventListener('bm-pdf-tools-organized',init);
window.BancoMestreInkUiV102=Object.freeze({refresh:init});
})();
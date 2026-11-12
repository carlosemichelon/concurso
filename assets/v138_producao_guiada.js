/* V138 — reorganização não destrutiva da Produção guiada FTTD/TEEC. */
(function(){
'use strict';
const training=document.getElementById('aba-treino');
const fields=document.getElementById('treino-campos');
const theme=document.getElementById('treino-tema-display');
const topicPicker=document.getElementById('treino-seletor');
if(!training||!fields||!theme||!topicPicker)return;
const editor=fields.closest('.card');
const toolbar=document.getElementById('btn-seletor-tema')?.closest('.bm135-action-grid');
const guide=document.getElementById('fttd-conteudo')?.closest('.card');
const next=editor?.querySelector('button[onclick="treinoProxNivel()"]');
const review=editor?.querySelector('button[onclick="treinoAvaliar()"]');
const save=document.getElementById('btn-salvar-treino');
const level=document.getElementById('treino-nivel-badge');
if(!editor||!toolbar||!guide||!next||!review||!save||!level)return;
const ui=(tag,cls,text)=>{const el=document.createElement(tag);if(cls)el.className=cls;if(text!==undefined)el.textContent=text;return el;};
const header=training.querySelector('.bm134-hero');
const bar=training.querySelector(':scope > .progresso-bar');
const steps=training.querySelector(':scope > .bm134-steps');
const progress=ui('section','bm138-progress');
const progressHead=ui('div','bm138-progress-top'),caption=ui('div','bm138-progress-caption');
caption.append(ui('span','bm138-kicker','ETAPA DO TREINO'),level);progressHead.append(caption);
progress.append(progressHead);if(bar)progress.append(bar);if(steps)progress.append(steps);
if(header)header.after(progress);else training.prepend(progress);
const workspace=ui('section','bm138-workspace'),main=ui('main','bm138-main'),aside=ui('aside','bm138-sidebar');
workspace.append(aside,main);progress.after(workspace);
aside.append(ui('div','bm138-theme-box'),toolbar,guide);
const themeBox=aside.querySelector('.bm138-theme-box');
themeBox.append(ui('div','bm138-tag','Tema escolhido'),theme);
const meta=document.getElementById('treino-tema-meta');if(meta)themeBox.append(meta);
themeBox.append(topicPicker);
toolbar.classList.add('bm138-tools');
const groups=Array.from(toolbar.querySelectorAll(':scope > .bm135-action-group'));
groups.forEach((group,index)=>{
 if(index===0)return;
 const h=group.querySelector('h3');const label=h?.textContent||(index===1?'Ferramentas de apoio':'Histórico e sincronização');
 const detail=ui('details','bm138-tools-detail'),summary=ui('summary','',label),body=ui('div','bm138-tools-buttons');
 Array.from(group.querySelectorAll(':scope > button')).forEach(b=>body.append(b));
 detail.append(summary,body);group.replaceWith(detail);
});
const frame=editor.querySelector(':scope > .card-titulo');
if(frame)frame.textContent='ESCRITA GUIADA';
editor.classList.add('bm138-editor');main.append(editor);
const editHeader=ui('div','bm138-editor-heading'),heading=ui('div',''),small=ui('span','bm138-small','PREENCHA OS CAMPOS DA ETAPA');
const title=ui('h3','bm138-stage-title','Planejamento e tese');
const instr=ui('p','');instr.id='treino-instrucao';
heading.append(small,title,instr);
const filled=ui('span','bm138-filled','0 de 0 campos preenchidos');filled.id='bm138-filled';
editHeader.append(heading,filled);
if(frame)frame.after(editHeader);else editor.prepend(editHeader);
const expand=ui('div','bm138-expansions');editor.insertBefore(expand,fields);
const drawerIds=['treino-brainstorm-painel','treino-eixos-painel','treino-salvos-card','treino-contexto','treino-sync-painel'];
const panels=drawerIds.map(id=>document.getElementById(id)).filter(Boolean);
panels.forEach(p=>expand.append(p));
function drawStatus(){
 const visible=panels.some(p=>p.style.display!=='none');
 expand.hidden=!visible;
}
function panelOpened(panel){
 drawStatus();
 if(panel.style.display!=='none'&&panel.style.display!==''){
   panel.scrollIntoView({behavior:'smooth',block:'nearest'});
 }
}
panels.forEach(p=>new MutationObserver(()=>panelOpened(p)).observe(p,{attributes:true,attributeFilter:['style']}));
drawStatus();
const bottom=editor.querySelector(':scope > .btns');
if(bottom){
 bottom.classList.add('bm138-footer');
 const previous=ui('button','btn btn-ghost','← Etapa anterior');previous.type='button';
 previous.setAttribute('onclick','treinoVoltarNivel()');
 bottom.insertBefore(previous,bottom.firstChild);
 bottom.insertBefore(save,review);
 const hint=ui('p','bm138-save-hint','O progresso só fica registrado quando você clica em Salvar progresso.');
 bottom.append(hint);
}
const output=document.getElementById('treino-ia-out'),progressCard=document.getElementById('treino-progresso-card');
if(output)main.append(output);
if(progressCard)main.append(progressCard);
function decorateHints(){
 if(fields.querySelector(':scope > .bm138-guidance'))return;
 const children=Array.from(fields.children);
 const firstWork=children.findIndex(node=>node.classList.contains('field')||node.classList.contains('axis-heading'));
 if(firstWork<=1)return;
 const introNodes=children.slice(0,firstWork);
 if(introNodes.length<2)return;
 introNodes[0].classList.add('bm138-mini-map');
 const details=ui('details','bm138-guidance'),summary=ui('summary','', 'Dicas e modelos desta etapa'),body=ui('div','bm138-guidance-body');
 introNodes.slice(1).forEach(node=>body.append(node));details.append(summary,body);
 introNodes[0].after(details);
}
function formStatus(){
 const areas=Array.from(fields.querySelectorAll(':scope > .field textarea[id^="treino-campo-"]'));
 const filledCount=areas.filter(el=>el.value.trim()).length;
 filled.textContent=filledCount+' de '+areas.length+' campos preenchidos';
 filled.classList.toggle('is-complete',areas.length>0&&filledCount===areas.length);
 areas.forEach(el=>{
  const label=el.closest('.field')?.querySelector('label');
  if(label&&!label.htmlFor)label.htmlFor=el.id;
 });
}
const descriptions={
 1:{title:'Planejamento e tese',help:'Defina o contexto, delimite o tema e construa dois eixos diferentes para a tese.'},
 2:{title:'Argumentação e desenvolvimento',help:'Estruture cada eixo com TEEC e desenvolva os parágrafos §2 e §3.'},
 3:{title:'Introdução, conclusão e texto final',help:'Escreva os parágrafos de abertura e conclusão, depois revise a redação completa.'}
};
function refreshStage(){
 const levelNum=Number((level.textContent.match(/NÍVEL\s+([123])\/3/i)||[])[1]||1),config=descriptions[levelNum];
 title.textContent=config.title;
 if(!instr.textContent.trim())instr.textContent=config.help;
 const prev=bottom?.querySelector('button[onclick="treinoVoltarNivel()"]');
 if(prev)prev.disabled=levelNum===1;
 next.disabled=levelNum===3;
 next.textContent=levelNum===3?'✓ Última etapa':'Próxima etapa →';
 formStatus();
}
fields.addEventListener('input',formStatus);
new MutationObserver(()=>{decorateHints();formStatus()}).observe(fields,{childList:true});
new MutationObserver(refreshStage).observe(level,{childList:true});
decorateHints();refreshStage();
window.BancoMestreProducaoGuiadaV138={
  get etapa(){return Number((level.textContent.match(/NÍVEL\s+([123])\/3/i)||[])[1]||1)},
  get quantidadeCampos(){return fields.querySelectorAll(':scope > .field textarea').length},
  get paineisPreservados(){return panels.length}
};
})();
/* V119 — explicação da vinculação normativa de artigos, incisos e remissões. */
/* Preserva o calibrador por PDF/hash e a seleção explicitamente confirmada. */
/* V111 — mismatch warning, safe persistence and cross-tab preference update. */
/* V110 — Calibrador da lei no editor PDF. Escolha confirmada por documento + hash.
 * Preferência local do aparelho. Cada novo grifo registra o perfil no mestre.
 * Não toca nos grifos previamente existentes.
 */
(function(){
'use strict';
if(window.BancoMestreCalibradorUIV110)return;
const model=window.BancoMestreCalibradoresV110,dialog=document.getElementById('pdfDialog'),
 tools=document.getElementById('pdfLocalTools');
if(!model||!dialog||!tools)return;
const $=id=>document.getElementById(id);
const shell=document.createElement('div');
shell.className='bm110-calibrator';shell.id='bm110Calibrador';
shell.setAttribute('role','group');
shell.setAttribute('aria-label','Calibrador da lei selecionada');
const label=document.createElement('label');label.htmlFor='bm110Profile';
label.textContent='Calibrador da lei';
const select=document.createElement('select');select.id='bm110Profile';
select.setAttribute('aria-label','Escolher a lei para calibrar os grifos');
for(const p of model.profiles){
 const opt=document.createElement('option');opt.value=p.id;opt.textContent=p.label;
 select.append(opt);
}
const suggestion=document.createElement('button');suggestion.id='bm110Suggestion';
suggestion.type='button';suggestion.hidden=true;
const hint=document.createElement('small');hint.id='bm110Hint';
hint.setAttribute('role','status');
const details=document.createElement('details');details.className='bm110-help';
const summary=document.createElement('summary');summary.textContent='Como este perfil grifa?';
const description=document.createElement('p');details.append(summary,description);
shell.append(label,select,suggestion,hint,details);
const bar=$('bm068QuickBar');
if(bar?.parentNode===tools)bar.after(shell);
else tools.prepend(shell);
let currentKey='',selectedId='geral',suggestedId=null;
function current(){
 const pdf=window.BancoMestrePDFV042;
 if(!pdf?.editing||!pdf.currentDoc)return null;
 const doc=pdf.currentDoc,hash=String(pdf.sourceHash||'').slice(0,70);
 if(!doc.id||!hash)return null;
 return {doc,hash,key:'BM110_PROFILE_DOC:'+encodeURIComponent(String(doc.id)).slice(0,180)+':'+encodeURIComponent(hash)};
}
function load(id){
 try{
  const value=localStorage.getItem(id);
  return model.validProfile(value)?value:'geral';
 }catch{return 'geral'}
}
function update(){
 const ctx=current();
 if(!ctx){
  currentKey='';selectedId='geral';suggestedId=null;
  select.value='geral';select.disabled=true;suggestion.hidden=true;
  hint.textContent='Abra um PDF para selecionar o perfil.';
  description.textContent='Sem novas cores: regra, agente, condição e exceção.';
  return;
 }
 if(currentKey!==ctx.key){
  currentKey=ctx.key;selectedId=load(ctx.key);
 }
 select.disabled=false;select.value=selectedId;
 suggestedId=model.detectDocument([ctx.doc.title,ctx.doc.filename,ctx.doc.name].filter(Boolean).join(' '));
 // Suggestions are never activated without the student's explicit click.
 suggestion.hidden=!suggestedId||suggestedId===selectedId;
 if(!suggestion.hidden)suggestion.textContent='Usar sugestão: '+model.getProfile(suggestedId).label;
 const p=model.getProfile(selectedId);
 hint.textContent=selectedId==='geral'?
  'Quatro cores gerais. '+(suggestedId?'Foi reconhecida uma lei: confirme a sugestão.':'Selecione uma lei, se desejar.') :
  (suggestedId&&suggestedId!==selectedId?
   'Confira o perfil: o título sugere '+model.getProfile(suggestedId).label+
    ', mas você escolheu '+p.label+'. A classificação continuará com a sua escolha.':
   'Perfil ativo neste PDF: '+p.label+'.');
 const art1AI=selectedId==='cf88'&&window.BancoMestreCFArtigo1V114&&
  window.BancoMestreIALeiSecaV114?
  ' Art. 1º: formação da República, fundamentos (I–V) e poder do povo. '+
  'IA local supervisionada ('+window.BancoMestreIALeiSecaV114.examples+
  ' exemplos rotulados), somente segunda opinião; a estrutura do artigo decide os grifos seguros.':'';
 const linkage=window.BancoMestreRelacoesNormativasV119?
  ' Relações por lei: artigos, parágrafos, incisos, alíneas e remissões no perfil escolhido. '+
  'No CF/88, os arts. 2º–4º têm trechos literais adicionais. '+
  'A estrutura não comprova a vigência nem a identidade real do PDF.':'';
 description.textContent=p.desc+' Pergunta de revisão: '+p.question+
  ' O reconhecimento é heurístico; confira o dispositivo e a versão da lei.'+art1AI+linkage;
}
function choose(id){
 const ctx=current();
 if(!ctx||!model.validProfile(id))return false;
 // Persist only the preference. It does not edit historical annotations.
 try{localStorage.setItem(ctx.key,id)}
 catch(_){
  select.value=selectedId;
  hint.textContent='Não foi possível salvar o perfil neste navegador; confira o armazenamento.';
  return false;
 }
 currentKey=ctx.key;selectedId=id;update();
 window.dispatchEvent(new CustomEvent('bm-pdf-calibration-changed',{
  detail:{id,documentId:ctx.doc.id,hash:ctx.hash}
 }));
 return true;
}
select.addEventListener('change',()=>choose(select.value));
suggestion.addEventListener('click',()=>{if(suggestedId)choose(suggestedId)});
window.addEventListener('bm-pdf-active-page-rendered',update);
window.addEventListener('bm-pdf-tool-change',update);
window.addEventListener('bm-pdf-tools-organized',update);
window.addEventListener('storage',e=>{
 if(e.key===currentKey){selectedId=load(currentKey);update()}
});
dialog.addEventListener('close',()=>{currentKey='';update()});
update();
window.BancoMestreCalibradorUIV110=Object.freeze({
 refresh:update,choose,getActiveProfileId(){
  const ctx=current();
  if(!ctx)return 'geral';
  return ctx.key===currentKey?selectedId:load(ctx.key);
 },get suggestion(){return suggestedId},get documentKey(){return currentKey}
});
})();

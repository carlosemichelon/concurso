/* V145 — autosave local e progresso. Não altera registros anteriores. */
(function(){
'use strict';
const training=document.getElementById('aba-treino'),fields=document.getElementById('treino-campos');
const editor=training?.querySelector('.bm138-editor'),heading=editor?.querySelector('.bm138-editor-heading');
if(!editor||!heading||!fields||typeof NIVEIS==='undefined')return;
const PREFIX='BM145_DRAFT_',LATEST='BM145_LAST_DRAFT',VERSIONS='BM145_MANUAL_HISTORY';
let active=false,paused=false,timer=null;
const create=(tag,cls,value)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(value!==undefined)n.textContent=value;return n};
const box=create('section','bm145-save'),head=create('div','bm145-head');
const label=create('div');label.append(create('strong','','Salvamento e progresso'),create('small','','Rascunho automático neste navegador'));
const status=create('span','bm145-status','Pronto para escrever');status.setAttribute('role','status');status.setAttribute('aria-live','polite');
head.append(label,status);box.append(head);
const progress=create('div','bm145-progress');box.append(progress);
const controls=create('div','bm145-buttons');
const manual=create('button','bm145-primary','💾 Salvar agora'),download=create('button','','↓ Backup JSON'),historyButton=create('button','','Versões anteriores'),resume=create('button','','📂 Salvos');
for(const b of [manual,download,historyButton,resume]){b.type='button';controls.append(b)}
box.append(controls);
const historyPanel=create('div','bm145-history');historyPanel.hidden=true;box.append(historyPanel);
heading.after(box);
const current=()=>typeof treinoTemaAtual==='undefined'?null:treinoTemaAtual;
function hashKey(title){let h=2166136261;for(const c of title){h^=c.charCodeAt(0);h=Math.imul(h,16777619)}return PREFIX+(h>>>0).toString(16)}
function copyFields(){if(!current())return;for(const el of fields.querySelectorAll('textarea[id^="treino-campo-"]'))treinoRespostas[el.id.slice(13)]=el.value}
function snapshot(){
 if(!current()?.titulo)return null;copyFields();
 const ctx=document.getElementById('treino-contexto');
 return{version:145,tema:current(),respostas:{...treinoRespostas},nivel:Math.min(3,Math.max(1,Number(nivelTreino)||1)),date:new Date().toISOString(),contextoNoticias:ctx?.innerHTML?.trim().slice(0,140000)||null};
}
function nonempty(x){return !!x&&(Object.values(x.respostas||{}).some(v=>typeof v==='string'&&v.trim())||x.contextoNoticias)}
function read(key){try{const x=JSON.parse(localStorage.getItem(key)||'null');return x?.tema?.titulo&&x.respostas?x:null}catch{return null}}
function setStatus(text,type=''){status.textContent=text;status.dataset.type=type}
function display(){
 if(!active||!current())return;
 copyFields();progress.replaceChildren();let filled=0,total=0;
 for(const n of NIVEIS){
  const got=n.campos.filter(k=>String(treinoRespostas[k]||'').trim()).length;filled+=got;total+=n.campos.length;
  const tile=create('div','bm145-step'+(nivelTreino===n.num?' is-active':'')),line=create('div','bm145-step-line');
  line.append(create('b','','Etapa '+n.num),create('span','',got+'/'+n.campos.length));
  const track=create('div','bm145-track'),bar=create('div','bm145-fill');bar.style.width=(got/n.campos.length*100)+'%';track.append(bar);tile.append(line,track);progress.append(tile);
 }
 label.querySelector('small').textContent=filled+'/'+total+' campos preenchidos · quantidade não mede qualidade';
}
function write(){
 if(!active||paused)return null;
 const x=snapshot();if(!x)return null;
 const key=hashKey(x.tema.titulo);
 if(!nonempty(x)&&!read(key))return null;
 try{
  localStorage.setItem(key,JSON.stringify(x));localStorage.setItem(LATEST,key);
  setStatus('✓ Rascunho salvo às '+new Date().toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'}),'ok');
 }catch(e){setStatus('Erro no salvamento automático: '+e.message,'error')}
 return x;
}
function schedule(){
 if(!active||paused)return;
 clearTimeout(timer);setStatus('Gravando alterações…','pending');display();timer=setTimeout(write,650);
}
function flush(){clearTimeout(timer);timer=null;return write()}
function restore(x){
 if(!x?.tema?.titulo||!x.respostas)return;
 paused=true;
 try{
  treinoTemaAtual=x.tema;treinoRespostas={...x.respostas};nivelTreino=Math.min(3,Math.max(1,Number(x.nivel)||1));
  _treinoAtualizarDisplay();
  const ctx=document.getElementById('treino-contexto');if(ctx){ctx.innerHTML=x.contextoNoticias||'';ctx.style.display=x.contextoNoticias?'block':'none'}
  renderNivelCampos();atualizarPainelProgresso();
 }finally{paused=false}
 display();
}
function downloadData(x,tag){
 if(!x)return;
 const safe=String(x.tema?.titulo||'redacao').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-zA-Z0-9]+/g,'_').slice(0,35);
 const url=URL.createObjectURL(new Blob([JSON.stringify(x,null,2)],{type:'application/json;charset=utf-8'}));
 const a=create('a');a.href=url;a.download='Redacao_'+safe+'_'+tag+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
function recordManual(){
 const x=snapshot();if(!x)return;
 try{
  let history=JSON.parse(localStorage.getItem(VERSIONS)||'[]');if(!Array.isArray(history))history=[];
  if(history[0]?.tema?.titulo!==x.tema.titulo||JSON.stringify(history[0].respostas)!==JSON.stringify(x.respostas)){
   history.unshift(x);const byName=new Map();
   history=history.filter(a=>{const k=a.tema?.titulo||'',n=byName.get(k)||0;if(n>=6)return false;byName.set(k,n+1);return true}).slice(0,30);
   localStorage.setItem(VERSIONS,JSON.stringify(history));
  }
 }catch(e){console.warn('Histórico adicional não salvo:',e)}
}
function renderHistory(){
 historyPanel.replaceChildren();
 let arr=[];try{arr=JSON.parse(localStorage.getItem(VERSIONS)||'[]')}catch{}
 if(!Array.isArray(arr))arr=[];
 arr=arr.filter(x=>x.tema?.titulo===current()?.titulo).slice(0,6);
 if(!arr.length){historyPanel.append(create('p','','Ainda não há versões manuais deste tema.'));return}
 for(const x of arr){
  const line=create('div','bm145-history-item'),stamp=create('span','',new Date(x.date).toLocaleString('pt-BR')+' · etapa '+x.nivel);
  const apply=create('button','','Restaurar'),save=create('button','','↓ Backup');
  apply.type=save.type='button';
  apply.onclick=()=>{if(!confirm('Restaurar esta versão? O rascunho atual será preservado antes de abrir a versão anterior.'))return;flush();restore(x);write();setStatus('Versão anterior recuperada no editor.','ok')};
  save.onclick=()=>downloadData(x,'versao');
  line.append(stamp,apply,save);historyPanel.append(line);
 }
}
fields.addEventListener('input',e=>{
 const el=e.target;if(!el.matches?.('textarea[id^="treino-campo-"]'))return;
 treinoRespostas[el.id.slice(13)]=el.value;schedule();
});
for(const name of ['treinoNovoTema','treino_selecionarTema','treinoCarregar','treinoVoltarNivel','treinoProxNivel','treinoAplicarEixos']){
 const original=window[name];if(typeof original!=='function')continue;
 window[name]=function(...args){
  if(active&&!paused)flush();
  const result=original.apply(this,args);
  if(active&&!paused){display();if(name==='treinoCarregar')schedule()}
  return result;
 };
}
const oldManual=window.treinoSalvar;
if(typeof oldManual==='function'){
 window.treinoSalvar=async function(...args){
  flush();
  const key=current()?'treino_'+current().titulo.replace(/\s+/g,'_').substring(0,40):'';
  try{
   const result=oldManual.apply(this,args);
   if(key&&localStorage.getItem(key)){recordManual();setStatus('✓ Progresso salvo manualmente no navegador.','ok')}
   await Promise.resolve(result);
  }catch(e){setStatus(key&&localStorage.getItem(key)?'Salvo localmente; sincronização remota não concluída.':'Falha no salvamento manual: '+e.message,'error')}
 };
}
const stage=document.getElementById('treino-nivel-badge');
if(stage)new MutationObserver(()=>{if(active&&!paused)schedule()}).observe(stage,{childList:true});
training.addEventListener('click',e=>{
 if(!active||paused)return;
 const target=e.target.closest('[onclick]');if(!target)return;
 if(/^(?:teecAplicarFormula|usarSugestao|brainstorm|treinoAplicarEixos)/.test(target.getAttribute('onclick')||''))setTimeout(schedule,80);
});
window.addEventListener('pagehide',flush);
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden')flush()});
manual.onclick=()=>window.treinoSalvar?.();
download.onclick=()=>downloadData(flush()||snapshot(),'rascunho');
historyButton.onclick=()=>{historyPanel.hidden=!historyPanel.hidden;if(!historyPanel.hidden)renderHistory()};
resume.onclick=()=>{if(window.BancoMestreConsultaV143?.open)window.BancoMestreConsultaV143.open('saved');else window.treinoCarregarMenu?.()};
window.addEventListener('load',()=>setTimeout(()=>{
 active=true;let recovered=false;
 try{const pointer=localStorage.getItem(LATEST),x=pointer&&read(pointer);if(nonempty(x)){restore(x);recovered=true;setStatus('✓ Rascunho anterior recuperado neste navegador.','ok')}}catch(e){console.warn('Recuperação de rascunho:',e)}
 if(!recovered)setStatus('Pronto: o rascunho será salvo automaticamente.');
 display();
},0));
window.BancoMestreRedacaoSalvarV145={flush,progress:display,restore};
})();
/* V263 — painel de diagnósticos, somente leitura, sem tokens e sem modificar dados. */
(function(){
'use strict';
if(window.BM263SyncPanel)return;
const $=id=>document.getElementById(id);
const labels={pdfs:'PDFs',atlas:'Imagens/Atlas',control:'Controle de Estudos',
 backup:'Backup do Controle',lacunas:'Lacunas',grifos:'Grifos',connection:'Conexão Google'};
const keys=Object.keys(labels);
function summary(){
 const rep=window.BM239DriveGlobal?.lastReport;
 const entries=keys.map(key=>{
  const info=rep?.modules?.[key];
  return {key,label:labels[key],state:String(info?.state||'not_checked'),
   message:String(info?.message||'Nenhuma verificação recente deste módulo')};
 });
 return {version:document.documentElement.dataset.bmPortalVersion||'V263',at:rep?.at||null,complete:rep?.complete===true,
  checked:Array.isArray(rep?.notes)?rep.notes.length:0,
  pending:Array.isArray(rep?.pending)?rep.pending.length:0,
  errors:Array.isArray(rep?.warnings)?rep.warnings.length:0,
  modules:entries,srs:'Canônico preservado; não sincronizado por esta ação'};
}
function make(tag,text,className){
 const el=document.createElement(tag);if(text!==undefined)el.textContent=text;
 if(className)el.className=className;return el;
}
function build(){
 if($('bm263-sync-panel'))return $('bm263-sync-panel');
 const panel=make('aside');panel.id='bm263-sync-panel';panel.hidden=true;
 panel.setAttribute('role','region');panel.setAttribute('aria-label','Diagnóstico da sincronização Drive');
 const row=make('div',undefined,'bm263-actions');
 const copy=make('button','Copiar diagnóstico');copy.id='bm263-copy-diagnostic';copy.type='button';
 const close=make('button','Fechar');close.id='bm263-close-diagnostic';close.type='button';
 row.append(copy,close);
 panel.append(make('h3','Sincronização do Google Drive'),row);
 const summaryEl=make('p');summaryEl.id='bm263-report-summary';panel.append(summaryEl);
 const list=make('dl');list.id='bm263-report-list';panel.append(list);
 const note=make('p','Catálogos e SRS não representam transferência. Erros e conflitos não sobrescrevem originais.');panel.append(note);
 document.body.append(panel);
 close.onclick=()=>toggle(false);
 copy.onclick=async()=>{
  const report=summary();
  const message=JSON.stringify(report,null,2);
  try{await navigator.clipboard.writeText(message);copy.textContent='Copiado';}
  catch(_){copy.textContent='Use o painel para relatar o erro';}
 };
 return panel;
}
function render(){
 const panel=$('bm263-sync-panel');if(!panel||panel.hidden)return;
 const report=summary(),at=report.at?new Date(report.at).toLocaleString('pt-BR'):'nenhuma execução confirmada';
 const status=report.errors?report.errors+' erro(s)':report.pending?report.pending+' pendência(s)':'sem erros registrados';
 $('bm263-report-summary').textContent='Última conferência: '+at+' · '+report.checked+
  ' módulo(s) confirmado(s) · '+status+'.';
 const dl=$('bm263-report-list');dl.replaceChildren();
 for(const r of report.modules){
  dl.append(make('dt',r.label+' — '+({verified:'Conferido',pending:'Pendente',error:'Erro',conflict:'Conflito'}[r.state]||'Não verificado')),
   make('dd',r.message));
 }
 dl.append(make('dt','Cartões e SRS'),make('dd',report.srs));
}
function toggle(force){
 const panel=build();
 const open=typeof force==='boolean'?force:panel.hidden;
 panel.hidden=!open;
 const trigger=$('bm239-sync-details');
 if(trigger)trigger.setAttribute('aria-expanded',String(open));
 if(open)render();
}
function init(){
 const el=$('bm239-sync-details');if(!el)return;
 el.setAttribute('role','button');el.setAttribute('tabindex','0');
 el.setAttribute('aria-controls','bm263-sync-panel');el.setAttribute('aria-expanded','false');
 el.title='Abrir relatório dos módulos do Google Drive sem expor dados de autorização';
 el.addEventListener('click',()=>toggle());
 el.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();toggle()}});
 document.addEventListener('bm239-sync-finished',render);
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!$('bm263-sync-panel')?.hidden)toggle(false)});
 build();
}
window.BM263SyncPanel=Object.freeze({open:()=>toggle(true),close:()=>toggle(false),get diagnostic(){return summary()}});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();

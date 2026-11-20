/* Banco Mestre V314 — interface enxuta do Planejamento SRS.
 * Apresentação somente; preserva os handlers e os dados do calendário V313.
 */
(function(){
'use strict';
if(window.BM314SrsLayout)return;
let mounted=false;
function create(tag,className,text){
 const e=document.createElement(tag);
 if(className)e.className=className;
 if(text!==undefined)e.textContent=text;
 return e;
}
function mount(){
 if(mounted)return;
 const root=document.getElementById('calendario');
 const wrap=root?.querySelector('.c141-wrap');
 const queue=root?.querySelector('#c313-panel');
 const calendar=root?.querySelector('.c141-board');
 const importPane=root?.querySelector('.c141-import');
 const source=root?.querySelector('.c141-private-source');
 if(!wrap||!queue||!calendar||!importPane||!source)return;
 mounted=true;root.classList.add('bm314-organized');

 const css=create('style');css.id='bm314-srs-layout-style';
 css.textContent=`
 #calendario.bm314-organized{--bm314-ink:#233f4b;--bm314-muted:#506775;--bm314-line:#d5e2e6}
 #calendario.bm314-organized .c141-wrap{max-width:1220px;margin:auto;min-width:0}
 #calendario.bm314-organized .c141-title{margin:0 0 12px;align-items:start}
 #calendario.bm314-organized .c141-title h2{font-size:clamp(21px,2.5vw,27px);line-height:1.25;margin:0 0 4px}
 #calendario.bm314-organized .c141-title p{font-size:13px;line-height:1.48;max-width:790px}
 #calendario.bm314-organized .c141-stats{margin:9px 0 12px;gap:9px}
 #calendario.bm314-organized .c141-stat{padding:12px 14px;box-shadow:none}
 #calendario.bm314-organized .c141-stat strong{font-size:24px;line-height:1.2}
 #calendario.bm314-organized .c141-stat span{line-height:1.35}
 #calendario.bm314-organized .c141-private-source{margin:0 0 14px!important;padding:12px 14px!important;border:1px solid #cbdde0!important;background:#f5faf9!important;display:flex;align-items:center;gap:12px;flex-wrap:wrap}
 #calendario.bm314-organized .c141-private-source button{flex:none;max-width:100%}
 #calendario.bm314-organized .c141-private-source span{flex:1 1 250px;min-width:0;color:#455e69;font-size:12px;line-height:1.5;margin:0!important}
 #calendario .c314-tabs{display:flex;gap:6px;flex-wrap:wrap;margin:0 0 12px;border-bottom:1px solid #cadbe0;padding-bottom:7px}
 #calendario .c314-tab{border:1px solid transparent!important;border-radius:7px!important;background:transparent!important;color:#3e6472!important;font-size:13px!important;min-height:40px;font-weight:750;padding:9px 14px!important}
 #calendario .c314-tab:hover{background:#eaf2f3!important}
 #calendario .c314-tab[aria-selected="true"]{background:#e8f2f1!important;border-color:#bdd7d4!important;color:#165c61!important}
 #calendario .c314-tab:focus-visible{outline:2px solid #267f84!important;outline-offset:2px}
 #calendario .c314-pane{min-width:0;background:#fff;border:1px solid var(--bm314-line,#d5e2e6);border-radius:11px;padding:14px;margin:0 0 12px}
 #calendario .c314-pane[hidden]{display:none!important}
 #calendario .c314-pane-title{font-size:16px;font-weight:800;color:var(--bm314-ink,#233f4b);margin:0 0 5px}
 #calendario .c314-pane-desc{font-size:12px;color:var(--bm314-muted,#506775);margin:0 0 12px;line-height:1.5}
 #calendario.bm314-organized #c313-panel{border:0!important;border-radius:0!important;background:transparent!important;padding:0!important;margin:0!important;min-width:0}
 #calendario.bm314-organized #c313-panel>h3{display:none}
 #calendario.bm314-organized #c313-panel>div:nth-of-type(1){margin-bottom:11px!important}
 #calendario.bm314-organized #c313-panel label{font-size:12px;font-weight:700;color:#456674}
 #calendario.bm314-organized #c313-panel select,#calendario.bm314-organized #c313-panel input{padding:8px 10px;border-radius:7px;min-height:38px}
 #calendario.bm314-organized #c313-count{font-size:12px;color:#536f79;margin:6px 0 9px!important}
 #calendario.bm314-organized #c313-panel .c141-scroll{border:1px solid #dce7ea;border-radius:8px}
 #calendario.bm314-organized #c313-panel table{min-width:830px;table-layout:fixed;font-size:12px;line-height:1.42}
 #calendario.bm314-organized #c313-panel th{position:sticky;top:0;z-index:1;background:#edf4f5;padding:9px 10px}
 #calendario.bm314-organized #c313-panel td{padding:10px;vertical-align:top;overflow-wrap:anywhere}
 #calendario.bm314-organized #c313-panel th:first-child{width:115px}
 #calendario.bm314-organized #c313-panel th:nth-child(2){width:28%}
 #calendario.bm314-organized #c313-panel th:nth-child(3){width:110px}
 #calendario.bm314-organized #c313-panel th:nth-child(4){width:100px}
 #calendario.bm314-organized #c313-panel th:nth-child(5){width:110px}
 #calendario.bm314-organized #c313-panel th:last-child{width:110px}
 #calendario.bm314-organized #c313-panel td:nth-child(2) strong{display:block;font-size:12px;font-weight:750;margin-bottom:4px}
 #calendario.bm314-organized #c313-panel td:nth-child(2) small{display:block;font-size:11px;color:#59717a;line-height:1.4;max-height:58px;overflow:hidden}
 #calendario.bm314-organized #c313-panel tbody tr:hover{background:#f2f8f8}
 #calendario.bm314-organized #c313-panel .c141-today{background:#fff8f5}
 #calendario.bm314-organized .c141-settings{margin-bottom:12px;max-width:100%}
 #calendario.bm314-organized .c141-board{margin:0;max-width:100%}
 #calendario.bm314-organized .c141-board .c141-scroll{max-height:490px;overflow:auto}
 #calendario.bm314-organized .c141-status{font-size:12px;margin:10px 0 0}
 #calendario.bm314-organized .c141-import{margin:0;border:0;padding:0}
 #calendario.bm314-organized .c141-import p{font-size:12px;line-height:1.55}
 #calendario.bm314-organized .c314-method{border:1px solid #dce5e7;border-radius:8px;padding:10px 12px;margin-top:12px}
 #calendario.bm314-organized .c314-method>summary{font-weight:750;font-size:12px}
 #calendario.bm314-organized .c141-note{font-size:12px;line-height:1.55;margin:10px 0 0}
 #calendario.bm314-organized .c141-limit{font-size:12px;font-weight:650;padding:8px 10px;margin:10px 0;display:inline-block}
 @media(max-width:700px){
  #calendario.bm314-organized .c141-stats{grid-template-columns:repeat(2,minmax(0,1fr))}
  #calendario.bm314-organized .c141-stat{padding:10px}
  #calendario.bm314-organized .c141-stat strong{font-size:21px}
  #calendario .c314-pane{padding:10px}
  #calendario .c314-tabs{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:5px}
  #calendario .c314-tab{padding:9px 5px!important;font-size:11px!important;line-height:1.3}
  #calendario.bm314-organized .c141-private-source button{width:100%}
  #calendario.bm314-organized .c141-private-source span{flex:1 1 100%}
  #calendario.bm314-organized #c313-panel label{flex:1 1 100%}
  #calendario.bm314-organized #c313-panel select,#calendario.bm314-organized #c313-panel input{width:100%!important;max-width:none}
 }
 `;
 document.head.append(css);

 const title=root.querySelector('.c141-title');
 const subtitle=title?.querySelector('p');
 if(subtitle)subtitle.textContent='Veja os atrasados, os próximos vencimentos e o histórico disponível. A consulta não registra respostas nem altera o SRS.';
 const indicator=root.querySelector('.c141-limit');
 const note=root.querySelector('.c141-note');
 const status=root.querySelector('.c141-status');
 const settings=root.querySelector('.c141-settings');

 const nav=create('div','c314-tabs');nav.setAttribute('role','tablist');
 nav.setAttribute('aria-label','Visualizações do Planejamento de revisões');
 const panes=[
  create('div','c314-pane'),create('div','c314-pane'),create('div','c314-pane')
 ];
 const specs=[
  {id:'fila',name:'Fila de revisão',heading:'Cartões por prioridade',desc:'Atrasados primeiro. Pesquise por ID ou assunto, confira a data e abra o cartão.'},
  {id:'calendario',name:'Calendário',heading:'Calendário de revisões',desc:'Organize os próximos dias; mover uma revisão aqui não altera o agendamento SRS.'},
  {id:'dados',name:'Importar e regras',heading:'Importação e metodologia',desc:'Dados de revisão ficam no seu navegador. Confira as regras antes de importar.'}
 ];
 const tabs=[];
 function selectTab(index,focus=false){
  for(let i=0;i<panes.length;i++){
   const selected=i===index;
   panes[i].hidden=!selected;
   tabs[i].setAttribute('aria-selected',String(selected));
   tabs[i].tabIndex=selected?0:-1;
  }
  root.dataset.bm314Tab=specs[index].id;
  if(focus)tabs[index].focus();
 }
 specs.forEach((spec,i)=>{
  const tab=create('button','c314-tab',spec.name);tab.type='button';
  tab.id='c314-tab-'+spec.id;tab.setAttribute('role','tab');
  tab.setAttribute('aria-controls','c314-pane-'+spec.id);
  tab.addEventListener('click',()=>selectTab(i));
  tab.addEventListener('keydown',e=>{
   if(!['ArrowRight','ArrowLeft','Home','End'].includes(e.key))return;
   e.preventDefault();
   const next=e.key==='Home'?0:e.key==='End'?tabs.length-1:e.key==='ArrowRight'?(i+1)%tabs.length:(i+tabs.length-1)%tabs.length;
   selectTab(next,true);
  });
  tabs.push(tab);nav.append(tab);
  const pane=panes[i];pane.id='c314-pane-'+spec.id;
  pane.setAttribute('role','tabpanel');pane.setAttribute('aria-labelledby',tab.id);
  pane.append(create('h3','c314-pane-title',spec.heading));
  pane.append(create('p','c314-pane-desc',spec.desc));
 });
 const wrapSource=source;
 // Move existing interface nodes; event handlers and ID references remain intact.
 panes[0].append(queue);
 if(settings)panes[1].append(settings);
 if(indicator)panes[1].append(indicator);
 panes[1].append(calendar);
 if(status)panes[1].append(status);
 panes[2].append(importPane);
 if(note){
  const method=create('details','c314-method');
  method.append(create('summary','', 'Regras SRS e segurança da fonte'),note);
  panes[2].append(method);
 }
 wrap.append(nav,...panes);
 // Source stays under statistics and above sub-tabs.
 const stat=root.querySelector('.c141-stats');
 if(stat)stat.after(wrapSource);
 selectTab(0);
 window.BM314SrsLayout=Object.freeze({
  get mounted(){return mounted},
  show:(name)=>{const idx=specs.findIndex(s=>s.id===name);if(idx<0)return false;selectTab(idx);return true},
  get active(){return root.dataset.bm314Tab}
 });
 document.dispatchEvent(new CustomEvent('bm314-srs-ready'));
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});
else mount();
})();
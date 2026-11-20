/* Banco Mestre V320 — dois grupos em Organizar (apenas apresentação).
 * Reaproveita panes e handlers V245/V252. Não lê/grava localStorage, Drive ou SRS.
 * Reversão: retirar esta inclusão HTML e retornar à V319.
 */
(function(){
'use strict';
if(window.BM320Organizar)return;
const VIEWS=[
 {id:'metas',label:'Metas, disciplinas e revisões',first:'planejamento',items:['planejamento','revisoes']},
 {id:'execucao',label:'Ciclo, registros e dados',first:'registro',items:['registro','ciclo','backup']}
];
let installed=false,root=null,host=null,nav=null,last='metas',pending=false;
function current(){
 return root?.querySelector('section.pane.active')?.id||'';
}
function schedule(){
 if(pending)return;
 pending=true;
 queueMicrotask(()=>{pending=false;sync()});
}
function viewFor(id){
 const v=VIEWS.find(v=>v.items.includes(id));
 return v?.id||last;
}
function sync(){
 if(!installed||!host?.isConnected)return;
 const organizer=root.getElementById('bm252-main-nav')?.querySelector('[data-group="organizar"]');
 const on=organizer?.getAttribute('aria-selected')==='true';
 nav.hidden=!on;
 if(!on){host.removeAttribute('data-bm320-organizar');return;}
 const view=viewFor(current());
 last=view;host.setAttribute('data-bm320-organizar',view);
 for(const b of nav.querySelectorAll('button[data-view]')){
  const active=b.dataset.view===view;
  b.setAttribute('aria-selected',String(active));
  b.classList.toggle('active',active);
  b.tabIndex=active?0:-1;
 }
}
function go(view){
 const cfg=VIEWS.find(v=>v.id===view);if(!cfg||!root)return;
 const original=root.querySelector('#tabs button[data-tab="'+cfg.first+'"]');
 if(!original)return;
 last=view;
 original.click(); // Motor original conserva todos os formulários, ações e dados.
 sync();
}
function install(){
 if(installed)return;
 host=document.getElementById('bm240-native-host');
 root=host?.shadowRoot||null;
 const native=root?.getElementById('bm252-module-nav');
 const main=root?.getElementById('bm252-main-nav');
 if(!root||!native||!main||!root.getElementById('registro')||!window.BM252StudyFlow?.ready)return;
 const style=document.createElement('style');
 style.id='bm320-organizar-style';
 style.textContent=[
  ':host([data-bm320-organizar]) #bm252-module-nav{display:none!important}',
  ':host([data-bm320-organizar="metas"]) #revisoes{display:block!important}',
  ':host([data-bm320-organizar="execucao"]) #ciclo,',
  ':host([data-bm320-organizar="execucao"]) #backup{display:block!important}',
  '#bm320-organizar-nav{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:6px;margin:0 0 12px;padding:5px;border:1px solid #d6e4e1;border-radius:9px;background:#edf4f3}',
  '#bm320-organizar-nav[hidden]{display:none!important}',
  '#bm320-organizar-nav button{min-width:0;min-height:44px;white-space:normal;font-size:12px;line-height:1.3;padding:8px;border:1px solid #c4d7d8;border-radius:7px;background:#fff;color:#28565d;font-weight:700}',
  '#bm320-organizar-nav button[aria-selected="true"]{background:#e2f1ec;border-color:#388f84;color:#0e6258;box-shadow:inset 0 -2px #388f84}',
  '#bm320-organizar-nav button:focus-visible{outline:3px solid #e6ad44;outline-offset:2px}',
  '@media(max-width:560px){#bm320-organizar-nav{gap:4px;margin-bottom:8px;padding:4px}#bm320-organizar-nav button{font-size:11px;min-height:46px;padding:7px 5px}}'
 ].join('\n');
 root.append(style);
 nav=document.createElement('nav');
 nav.id='bm320-organizar-nav';
 nav.hidden=true;
 nav.setAttribute('role','tablist');
 nav.setAttribute('aria-label','Organização do estudo em dois grupos');
 for(const item of VIEWS){
  const b=document.createElement('button');
  b.type='button';b.dataset.view=item.id;b.textContent=item.label;
  b.setAttribute('role','tab');
  b.setAttribute('aria-selected','false');
  b.addEventListener('click',()=>go(item.id));
  nav.append(b);
 }
 native.after(nav);
 for(const pane of root.querySelectorAll('section.pane'))
  new MutationObserver(schedule).observe(pane,{attributes:true,attributeFilter:['class']});
 const organizeBtn=main.querySelector('[data-group="organizar"]');
 if(organizeBtn)new MutationObserver(schedule).observe(organizeBtn,{attributes:true,attributeFilter:['aria-selected']});
 installed=true;sync();
 document.dispatchEvent(new CustomEvent('bm320-organizar-ready',{detail:{groups:2,layoutOnly:true}}));
}
document.addEventListener('bm252-study-ready',install);
document.addEventListener('bm240-study-mounted',()=>queueMicrotask(install));
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});
else install();
window.BM320Organizar=Object.freeze({get ready(){return installed},open:go});
})();
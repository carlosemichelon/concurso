/* V309 — linha de conferência do Calendário no Controle de Estudos.
   Reutiliza a comparação SHA-256 e a proteção de conflitos existentes.
   Nenhuma leitura ou gravação direta de dados privados fora de BM240ControlDrive. */
(function(){
'use strict';
if(window.BM309CalendarSync)return;
const KEY='BM245_CONTROLE_ESTUDOS';
let installed=false,button=null,summary=null,status=null,running=false;
function localCount(){
 try{
  const d=JSON.parse(localStorage.getItem(KEY)||'null');
  return (d?.sessions?.filter(x=>!x.deletedAt).length||0)+' sessões · '+
   (d?.plans?.length||0)+' atividades planejadas · '+
   (d?.reviews?.length||0)+' revisões neste navegador';
 }catch(_){return 'Dados locais não disponíveis para contagem'}
}
function explain(r){
 if(!r)return 'Ainda não houve conferência do Calendário com o Drive nesta sessão.';
 const t=String(r.message||'').trim();
 if(t)return t;
 return ({uploaded:'Dados enviados e conferidos no Drive',downloaded:'Dados do Drive importados',
 unchanged:'Cópias verificadas e idênticas',empty:'Sem registros locais para envio',
 conflict:'Conflito: nenhuma cópia foi substituída',merge_ready:'Conciliação pendente na aba Dados e backup',
 error:'Erro na conferência: originais preservados'})[r.state]||'Conferência pendente';
}
function update(){
 if(!installed)return;
 const api=window.BM240ControlDrive,drive=window.BM239DriveGlobal;
 summary.textContent=localCount();
 const r=api?.lastResult;
 const report=drive?.lastReport?.modules?.control;
 status.textContent=r?explain(r):report?.message||explain(null);
 status.dataset.state=r?.state||report?.state||'pending';
 if(!running){button.disabled=false;button.textContent=drive?.writeToken?.()?'Conferir e sincronizar':'Autorizar Drive e sincronizar'}
}
async function run(){
 if(running)return;
 const drive=window.BM239DriveGlobal,token=drive?.writeToken?.();
 if(!token){
  const main=document.getElementById('bm239-drive-action');
  if(!main||main.disabled){status.textContent='A conexão ainda não está preparada. Autorize o Drive pelo cabeçalho e tente novamente.';return}
  status.textContent='Conclua a autorização de escrita do Google; o calendário só será transferido após a conferência.';
  main.click(); // clique encadeado diretamente a um gesto do usuário
  return;
 }
 const api=window.BM240ControlDrive;
 if(!api?.sync){status.textContent='Motor de sincronização do Calendário ainda indisponível; dados locais preservados.';return}
 running=true;button.disabled=true;button.textContent='Conferindo…';
 status.textContent='Comparando cópias local e remota, com proteção contra conflitos…';
 try{
  const r=await api.sync(token);
  status.textContent=explain(r);status.dataset.state=r?.state||'pending';
 }catch(e){
  status.textContent='Falha ao conferir o Calendário: '+String(e?.message||e);
  status.dataset.state='error';
 }finally{running=false;update()}
}
function mount(){
 if(installed)return;
 const root=document.getElementById('bm240-native-host')?.shadowRoot;
 const panel=root?.getElementById('calendarioControle')?.querySelector(':scope > .panel');
 if(!panel||!root.getElementById('calGrid')||!window.BM240ControlApp)return;
 const style=document.createElement('style');style.id='bm309-calendar-sync-css';
 style.textContent=[
 '#bm309-calendar-sync{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:4px 8px;align-items:center;margin:6px 0 9px;padding:8px 9px;border:1px solid #d5e5ee;border-radius:5px;background:#f5faff;font-family:"Segoe UI",Arial,sans-serif}',
 '#bm309-calendar-sync strong{font-size:11.5px;color:#1d628d}',
 '#bm309-calendar-sync .bm309-count{font-size:11px;color:#4a697c;line-height:1.4;min-width:0}',
 '#bm309-calendar-sync button{grid-column:2;grid-row:1/3;min-height:38px;max-width:178px;padding:6px 10px!important;background:#e9f5fc!important;border:1px solid #a6cce4!important;border-radius:4px!important;color:#1d658c!important;font:700 11px/1.3 "Segoe UI",Arial,sans-serif!important;white-space:normal;text-align:center}',
 '#bm309-calendar-sync .bm309-status{grid-column:1/-1;font-size:11px;line-height:1.5;color:#5d7180;overflow-wrap:anywhere}',
 '#bm309-calendar-sync .bm309-status[data-state="uploaded"],#bm309-calendar-sync .bm309-status[data-state="downloaded"],#bm309-calendar-sync .bm309-status[data-state="unchanged"]{color:#226c59}',
 '#bm309-calendar-sync .bm309-status[data-state="error"],#bm309-calendar-sync .bm309-status[data-state="conflict"]{color:#9f4a4a}',
 '@media(max-width:500px){#bm309-calendar-sync{grid-template-columns:minmax(0,1fr)}#bm309-calendar-sync button{grid-column:1;grid-row:auto;max-width:none;width:100%}#bm309-calendar-sync .bm309-status{grid-column:1}}'
 ].join('\n');root.append(style);
 const holder=document.createElement('div');holder.id='bm309-calendar-sync';
 const heading=document.createElement('strong');heading.textContent='Calendário e Drive';
 summary=document.createElement('div');summary.className='bm309-count';
 button=document.createElement('button');button.type='button';button.id='bm309-calendar-sync-action';button.textContent='Sincronizar calendário';button.addEventListener('click',()=>{void run()});
 status=document.createElement('div');status.className='bm309-status';status.setAttribute('role','status');status.setAttribute('aria-live','polite');
 holder.append(heading,summary,button,status);
 const title=panel.querySelector(':scope > h2');if(title)title.after(holder);else panel.prepend(holder);
 installed=true;update();
 document.addEventListener('bm240-control-verified',update);
 document.addEventListener('bm239-sync-finished',update);
 window.addEventListener('bm240-study-changed',update);
 window.addEventListener('storage',e=>{if(e.key===KEY)update()});
}
function init(){
 mount();
 document.addEventListener('bm240-study-mounted',mount);
 document.addEventListener('bm253-calendar-compact-ready',mount);
}
window.BM309CalendarSync=Object.freeze({get ready(){return installed},refresh:update,sync:run});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();

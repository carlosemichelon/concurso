/* V263 — indicadores de VERIFICAÇÃO, distintos de contagens de catálogo.
   Nunca qualifica SRS, cartões, nem grifos divergentes como sincronizados. */
(function(){
'use strict';
if(window.BM241SyncTruth)return;
const $=id=>document.getElementById(id);
const TYPES=[
 {key:'pdfs',label:'PDFs',evidence:/^PDFs: consulta do Drive concluída,/i,warn:/^PDFs:|^Consulta de mídias/i},
 {key:'cards',label:'Cartões',excluded:true},
 {key:'atlas',label:'Imagens',evidence:/\d+ imagens originais consultadas no Drive/i,warn:/^Atlas:|^Consulta de mídias/i},
 {key:'control',label:'Controle',evidence:/^Controle:/i,warn:/^Controle:|^Permissão drive\.file/i},
 {key:'grifos',label:'Grifos',evidence:/Grifos: mestre privado conferido, sem divergências/i,warn:/^Grifos:|^Permissão drive\.file/i}
];
let nodes=new Map();
function makeStat(host,key){
 const stat=document.createElement('div');
 stat.className='stat bm241-'+key;
 stat.dataset.bm241Extra=key;
 const count=document.createElement('b');count.textContent=key==='control'?'0':'—';
 const caption=document.createElement('span');
 caption.textContent=key==='control'?'sessões locais':'grifos privados';
 stat.append(count,caption);host.insertBefore(stat,$('bm239-drive-action'));
 return stat;
}
function attach(){
 const host=document.querySelector('body>header .head>.bm-v046-header-stats');
 if(!host)return;
 const orig=Array.from(host.querySelectorAll(':scope > .stat')).filter(e=>!e.dataset.bm241Extra);
 if(orig.length<3)return;
 const dest={pdfs:orig[0],cards:orig[1],atlas:orig[2],
  control:host.querySelector('[data-bm241-extra="control"]')||makeStat(host,'control'),
  grifos:host.querySelector('[data-bm241-extra="grifos"]')||makeStat(host,'grifos')};
 for(const t of TYPES){
  const node=dest[t.key];if(!node)continue;
  const old=node.querySelector('.bm240-sync-state');old?.remove();
  let status=node.querySelector('.bm241-verification');
  if(!status){status=document.createElement('small');status.className='bm241-verification';node.append(status)}
  nodes.set(t.key,{node,status});
 }
}
function icon(key,label,state,detail){
 const entry=nodes.get(key);if(!entry)return;
 const {node,status}=entry;
 if(status.textContent!==label)status.textContent=label;
 status.title=detail;
 node.dataset.syncStatus=state;node.dataset.bm241Verification=state;
 node.title=detail;
 const cnt=node.querySelector('b')?.textContent||'';
 const caption=node.querySelector('span')?.textContent||'';
 node.setAttribute('aria-label',cnt+' — '+caption+'. '+detail);
}
function localSessions(){
 try{const d=JSON.parse(localStorage.getItem('BM245_CONTROLE_ESTUDOS')||'null');
  return Array.isArray(d?.sessions)?d.sessions.length:0;
 }catch(_){return null}
}
function refresh(){
 if(nodes.size<5){attach();if(nodes.size<5)return}
 const control=nodes.get('control').node,local=localSessions();
 control.querySelector('b').textContent=local==null?'—':String(local);
 const global=window.BM239DriveGlobal,report=global?.lastReport;
 const connected=Boolean(global?.connected);
 const running=$('bm239-drive-action')?.getAttribute('aria-busy')==='true';
 const live=Boolean(report?.at&&Array.isArray(report?.notes)&&Array.isArray(report?.warnings));
 const modules=live?(report.modules||{}):{};
 icon('cards','SRS preservado','excluded',
  '1.518 cartões públicos + 22 Ijuí; esta ação não sincroniza cartões nem eventos do SRS canônico.');
 for(const t of TYPES.filter(t=>!t.excluded)){
  if(running){icon(t.key,'Verificando','syncing',t.label+': conferência em execução');continue}
  const status=modules[t.key];
  if(status){
   const detail=t.label+': '+String(status.message||'').slice(0,1000);
   if(status.state==='verified')
    icon(t.key,connected?'✓ Conferido':'Última conferência',connected?'verified':'pending',detail);
   else if(status.state==='conflict')
    icon(t.key,'Conflito','partial',detail+'. Originais não substituídos.');
   else if(status.state==='error')
    icon(t.key,'Falha','error',detail+'. Originais preservados.');
   else if(status.state==='pending')
    icon(t.key,t.key==='control'&&/sem registros locais|não existe arquivo/i.test(detail)?'Sem dados':'Pendente','pending',detail);
   else icon(t.key,'Não verificado','pending',detail);
  }else icon(t.key,connected?'Não verificado':'Drive desconectado','pending',
   t.label+': nenhuma conferência atual nesta sessão.'+
   (t.key==='control'?' Histórico local: '+(local==null?'indisponível':local+' sessões'):''));
 }
 const grifos=window.BancoMestreGrifosDriveSyncV104;
 const grifosText=String(grifos?.lastStatus||'');
 const match=grifosText.match(/^Cores\/grifos confirmados no Drive:\s*(\d+)\s*registro/);
 if(match){
  const node=nodes.get('grifos')?.node;
  if(node){node.querySelector('b').textContent=match[1];
   node.querySelector('span').textContent='páginas';}
 }
 const info=$('bm239-sync-details');
 if(info){
  if(running){info.textContent='Verificando…';info.dataset.state='syncing'}
  else if(live){
   const errors=report.warnings.length,pending=(report.pending||[]).length,okay=report.notes.length;
   info.textContent=errors?errors+' erro(s) · detalhes':pending?pending+' pendente(s) · detalhes':okay+' conferidos · detalhes';
   info.dataset.state=errors?'partial':pending?'pending':'ok';
   info.title=report.summary||info.textContent;
  }else{
   // Não encobrir o estado OAuth comunicado pelo módulo central.
   const connection=global?.connectionStatus;
   const message=String(connection?.message||'');
   if(message){info.textContent=message;info.dataset.state=connection.state||'idle';}
   else if(!String(info.textContent||'').trim()){
    info.textContent=connected?'Drive autorizado · verifique os módulos':'Drive desconectado · clique em Conectar Drive';
    info.dataset.state='idle';
   }
  }
 }
}

function init(){
 attach();refresh();
 document.addEventListener('bm239-sync-finished',refresh);
 document.addEventListener('bm-media-drive-authorized',refresh);
 window.addEventListener('focus',refresh);
 document.addEventListener('visibilitychange',()=>{if(!document.hidden)refresh()});
 setInterval(()=>{if(!document.hidden)refresh()},2500);
}
window.BM241SyncTruth=Object.freeze({refresh,get snapshot(){
 return Object.fromEntries([...nodes].map(([k,v])=>[k,{state:v.node.dataset.syncStatus,text:v.status.textContent}]));
}});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
else init();
})();

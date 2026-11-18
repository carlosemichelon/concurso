/* V241 — indicadores de VERIFICAÇÃO, distintos de contagens de catálogo.
   Nunca qualifica SRS, cartões, nem grifos divergentes como sincronizados. */
(function(){
'use strict';
if(window.BM241SyncTruth)return;
const $=id=>document.getElementById(id);
const TYPES=[
 {key:'pdfs',label:'PDFs',evidence:/78 PDFs consultados no Drive/i,warn:/PDFs:|consulta de mídias/i},
 {key:'cards',label:'Cartões',excluded:true},
 {key:'atlas',label:'Imagens',evidence:/\d+ imagens originais consultadas no Drive/i,warn:/Atlas:|consulta de mídias/i},
 {key:'control',label:'Controle',evidence:/^Controle:.*(verificad|conferid|importad)/i,warn:/^Controle:|permissão drive.file/i},
 {key:'grifos',label:'Grifos',evidence:/Grifos: mestre privado conferido, sem divergências/i,warn:/Grifos:|permissão drive.file/i}
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
 const global=window.BM239DriveGlobal;
 const report=global?.lastReport;
 const connected=Boolean(global?.connected);
 const running=$('bm239-drive-action')?.getAttribute('aria-busy')==='true';
 const live=report&&Array.isArray(report.notes)&&Array.isArray(report.warnings)&&!!report.at;
 const notes=live?report.notes:[],warnings=live?report.warnings:[];
 const at=live?new Date(report.at).toLocaleString('pt-BR'):'';
 icon('cards','SRS canônico preservado','excluded',
  '1.518 cartões canônicos + 22 operacionais Ijuí. Nenhum evento SRS ou atualização de cartão foi sincronizado por esta ação.');
 for(const t of TYPES.filter(t=>!t.excluded)){
  if(running){
   icon(t.key,'⟳ Verificando','syncing',t.label+': consulta em execução; sem confirmação ainda.');
   continue;
  }
  const failure=warnings.find(w=>t.warn.test(String(w)));
  const success=notes.find(n=>t.evidence.test(String(n)));
  if(failure){
   icon(t.key,/conflito|divergênc/i.test(String(failure))?'Conflito':'Parcial / falha',
    /conflito|divergênc/i.test(String(failure))?'partial':'error',
    t.label+': '+String(failure)+'; nenhum original canônico foi substituído.');
  }else if(success){
   icon(t.key,connected?'✓ Conferido':'Último: conferido',
    connected?'verified':'pending',
    t.label+': '+String(success)+' em '+at+'. '+(connected?'Conexão ativa.':'Conexão já não está ativa; exige nova conferência.'));
  }else{
   const message=!connected?'Drive não conectado':'Sem verificação atual';
   icon(t.key,'Não verificado','pending',t.label+': '+message+
    (t.key==='control'?' · '+(local==null?'histórico local indisponível':local+' sessões no navegador'):'')+
    '. Contagem de catálogo não comprova transferência para o Drive.');
  }
 }
 const grifos=window.BancoMestreGrifosDriveSyncV104;
 const grifosText=String(grifos?.lastStatus||'');
 const match=grifosText.match(/^Cores\/grifos confirmados no Drive:\s*(\d+)\s*registro/);
 if(match){
  const node=nodes.get('grifos')?.node;
  if(node){node.querySelector('b').textContent=match[1];
   node.querySelector('span').textContent='registros de páginas';}
 }
 const info=$('bm239-sync-details');
 if(info){
  const nGood=notes.filter(x=>/PDFs consultados|imagens originais|Controle:|Grifos:/.test(String(x))).length;
  info.title=report?.summary||'Sincronização ainda não verificada nesta sessão';
  if(running){info.textContent='Verificando os módulos…';info.dataset.state='syncing'}
  else if(live){
   info.textContent=warnings.length?'Parcial: '+nGood+' módulo(s) · ver detalhes':
    'Conferência: '+nGood+' módulos; SRS separado';
   info.dataset.state=warnings.length?'partial':'ok';
  } else if(!connected&&!/erro|falha|indisponível|não autorizada/i.test(info.textContent||'')){
   info.textContent='Drive não conectado';info.dataset.state='idle';
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

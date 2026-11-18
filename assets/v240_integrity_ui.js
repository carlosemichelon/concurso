/* V240 — painel verificável de integridade, sem segundo botão de autenticação. */
(function(){
 'use strict';
 function init(){
  const origin=document.getElementById('bm239-sync-details');
  if(!origin||document.getElementById('bm240-integrity'))return;
  const panel=document.createElement('details');
  panel.id='bm240-integrity';
  const summary=document.createElement('summary');
  summary.textContent='Integridade da sincronização por módulo';
  const list=document.createElement('ul');
  list.className='bm240-module-list';
  const entries=[
   ['PDFs',/PDFs|mídias/i],
   ['Imagens/Atlas',/imagens|Atlas|mídias/i],
   ['Grifos',/Grifos/i],
   ['Controle de Estudos',/Controle/i]
  ];
  const rows=entries.map(([title])=>{
   const li=document.createElement('li');
   const label=document.createElement('strong');label.textContent=title;
   const result=document.createElement('span');result.textContent='Pendente de conferência';
   result.dataset.result='pending';
   li.append(label,result);list.append(li);
   return result;
  });
  const srs=document.createElement('li');
  const srsLabel=document.createElement('strong');srsLabel.textContent='Cartões e SRS canônico';
  const srsValue=document.createElement('span');srsValue.textContent='Não incluídos neste sincronizador; dados preservados';
  srsValue.dataset.result='excluded';srs.append(srsLabel,srsValue);list.append(srs);
  const stamp=document.createElement('p');stamp.className='bm240-audit-stamp';
  stamp.textContent='Nenhuma sincronização autenticada verificada nesta sessão.';
  panel.append(summary,list,stamp);origin.after(panel);
  function refresh(){
   const report=window.BM239DriveGlobal?.lastReport;
   if(!report||!report.at)return;
   const notes=Array.isArray(report.notes)?report.notes:[];
   const warnings=Array.isArray(report.warnings)?report.warnings:[];
   let okCount=0,issueCount=0;
   entries.forEach((entry,index)=>{
    const [,test]=entry;
    const problem=warnings.find(value=>test.test(String(value)));
    const good=notes.find(value=>test.test(String(value)));
    const row=rows[index];
    if(problem){row.dataset.result='warning';row.textContent='Pendente: '+problem;issueCount++}
    else if(good){row.dataset.result='ok';row.textContent='Conferido: '+good;okCount++}
    else{row.dataset.result='pending';row.textContent='Sem comprovação nesta execução';issueCount++}
   });
   const globalWarning=warnings.find(value=>/consulta de mídias sem atualização/i.test(String(value)));
   if(globalWarning){rows[0].dataset.result='warning';rows[1].dataset.result='warning';
    rows[0].textContent='Pendente: '+globalWarning;rows[1].textContent='Pendente: '+globalWarning;
   }
   const outcome=report.complete&&okCount===4&&!globalWarning?'4 de 4 módulos conferidos':
    okCount+' de 4 módulos com conferência registrada';
   summary.textContent='Integridade: '+outcome;
   try{stamp.textContent='Última tentativa: '+new Date(report.at).toLocaleString('pt-BR')+
     '. '+(warnings.length?'Existem pendências.':'Sem pendências relatadas pelos quatro módulos.')+
     ' A autorização Google e a persistência entre dispositivos exigem teste real no navegador.'}
   catch(_){stamp.textContent='Auditoria registrada nesta sessão.'}
   origin.title=report.summary||origin.title;
  }
  document.addEventListener('bm239-sync-finished',refresh);
  refresh();
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();

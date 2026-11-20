
/* V313 — Fila completa de cartões e vencimentos SRS com filtros, atraso e fonte explícita.
 * Calendário derivado e reversível. Histórico canônico intocado; fallback F17 identificado. */
(function(){
'use strict';
const nav=document.querySelector('header nav'),main=document.querySelector('main');
if(!nav||!main||document.getElementById('calendario'))return;
const root=document.createElement('section');root.id='calendario';
root.innerHTML=[
'<div class="c141-wrap">',
'<div class="c141-title"><div><span class="c141-kicker">BANCO MESTRE · ORGANIZAÇÃO SRS</span><h2>Planejamento de revisões SRS</h2><p>Simulação de uma fila de cartões com até 60 minutos de capacidade estimada por dia. Não mede horas estudadas, não registra respostas nem modifica o SRS canônico; a prática acontece no ChatGPT.</p></div><div class="c141-limit">Até 60 min/dia estimados</div></div>',
'<div class="c141-stats"><div class="c141-stat"><strong id="c141-known">—</strong><span>Cartões com vencimento conhecido</span></div><div class="c141-stat"><strong id="c141-overdue">—</strong><span>Atrasados (antes de hoje)</span></div><div class="c141-stat"><strong id="c141-unplanned">—</strong><span>Ativos sem data SRS disponível</span></div><div class="c141-stat"><strong id="c141-today">—</strong><span>Vencem hoje</span></div></div>',
'<div id="c313-panel" style="margin:14px 0 20px;border:1px solid #cfdddf;border-radius:10px;padding:14px;background:#fff">',
'<h3 style="font-size:17px;margin:0 0 6px">Fila de cartões e prazos de revisão</h3>',
'<p id="c313-source" role="status" style="font-size:12px;line-height:1.6;color:#576b73;margin:4px 0 12px">Aguardando leitura dos registros SRS.</p>',
'<div style="display:flex;flex-wrap:wrap;gap:9px;align-items:end;margin-bottom:10px">',
'<label for="c313-filter">Situação <select id="c313-filter" style="display:block;margin-top:3px;padding:8px"><option value="overdue">Atrasados</option><option value="today">Vencem hoje</option><option value="upcoming">Próximos vencimentos</option><option value="undated">Sem data SRS</option><option value="all">Todos os cartões</option></select></label>',
'<label for="c313-search">Pesquisar cartão <input id="c313-search" type="search" placeholder="ID, assunto ou pergunta" style="display:block;width:min(340px,78vw);margin-top:3px;padding:8px"></label>',
'<button id="c313-export" type="button">Exportar lista CSV</button>',
'</div>',
'<p style="font-size:12px;margin:6px 0" id="c313-count">Carregando...</p>',
'<div class="c141-scroll" style="max-height:440px;overflow:auto"><table style="min-width:850px"><thead><tr><th>Cartão</th><th>Assunto / pergunta</th><th>Classificação</th><th>Vencimento</th><th>Situação</th><th>Origem</th><th>Abrir</th></tr></thead><tbody id="c313-body"><tr><td colspan="7">Aguardando dados...</td></tr></tbody></table></div>',
'<button id="c313-more" type="button" style="display:none;margin-top:9px">Mostrar mais 50 cartões</button>',
'<p style="font-size:12px;color:#576b73;margin:9px 0 0">O calendário não registra revisões: somente respostas avaliadas e eventos SRS documentados podem alterar vencimentos. Sem data não significa atrasado. Dados privados permanecem no navegador.</p>',
'</div>',
'<div class="c141-settings"><label for="c141-min">Tempo por cartão</label><select id="c141-min"><option value="1.5">1,5 min — até 40/dia</option><option value="2" selected>2 min — até 30/dia</option><option value="3">3 min — até 20/dia</option><option value="4">4 min — até 15/dia</option></select><label class="c141-check"><input id="c141-new" type="checkbox">Preencher tempo livre com cartões novos, sem data SRS</label><button class="c141-primary" id="c141-export">Exportar CSV</button></div>',
'<p class="c141-note">Escala atual: <strong>Errei 4d · Difícil 8d · Bom 16d · Fácil 32d · Consolidado 64d</strong>, este último somente após duas avaliações formais Fácil comprovadas. Fonte preferencial: SRS privado autorizado no Drive. Sem conexão, a fila é <strong>parcial</strong> (F17 histórico). Importações locais explícitas podem sobrescrever o planejamento, mas não o SRS canônico. Cartões sem data não são considerados atrasados.</p>',
'<p id="c141-status" class="c141-status" role="status">Selecione Planejamento de revisões SRS para carregar os registros históricos disponíveis.</p>',
'<div class="c141-board"><div class="c141-boardhead"><h3 id="c141-range">Próximos 14 dias</h3><div class="c141-actions"><button id="c141-prev">← Antes</button><button id="c141-reset">Hoje</button><button id="c141-next">Depois →</button></div></div><div class="c141-scroll"><table><thead><tr><th>Data</th><th>Vencem / atrasados</th><th>Previstos</th><th>Tempo</th><th>Disponível</th><th>Cartões</th></tr></thead><tbody id="c141-body"><tr><td colspan="6">Carregando...</td></tr></tbody></table></div></div>',
'<div class="c141-import"><h3>Importar datas SRS para esta simulação local</h3><p>Importe CSV ou JSON com as colunas <code>id;proxima_revisao;avaliacao</code> (por exemplo <code>CARD-0001;18/11/2026;Errei</code>). Os dados ficam <strong>somente neste navegador</strong>. Não são enviados ao GitHub ou Drive e não substituem o histórico canônico de revisões do ChatGPT.</p><input id="c141-file" type="file" accept=".csv,.json" hidden><button id="c141-pick">Importar SRS (CSV/JSON)</button> <button id="c141-clear">Limpar importação local</button><p id="c141-result" class="c141-result" role="status"></p></div>',
'</div>'].join('');
const footer=main.querySelector('footer');if(footer)footer.before(root);else main.append(root);
const navBtn=document.createElement('button');navBtn.type='button';navBtn.textContent='Planejamento de revisões SRS';navBtn.dataset.page='calendario';
const cardBtn=nav.querySelector('[data-page="cartoes"]');if(cardBtn)cardBtn.after(navBtn);else nav.append(navBtn);
const $=id=>document.getElementById(id);
const importKey='BM141_CALENDAR_IMPORT_V1',prefKey='BM141_CALENDAR_PREF_V1';
let cards=[],map=new Map(),history=[],imported=[],privateRecords=[],privateInfo=null,schedule=[],page=0,loaded=false,loading=false,driveBusy=false,queueShown=50;
const today=()=>{const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')};
const shift=(base,n)=>{const d=new Date(base+'T12:00:00');d.setDate(d.getDate()+n);return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')};
const norm=v=>String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]/g,'');
const due=v=>{const t=String(v||'').trim();let d=null;if(/^\d{4}-\d{2}-\d{2}/.test(t))d=t.slice(0,10);else{const m=t.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);if(m)d=m[3]+'-'+m[2].padStart(2,'0')+'-'+m[1].padStart(2,'0')}if(!d||! /^\d{4}-\d{2}-\d{2}$/.test(d))return null;const test=new Date(d+'T12:00:00');return !isNaN(test)&&shift(d,0)===d?d:null};
const rank=v=>({errei:0,dificil:1,bom:2,facil:3})[norm(v)]??4;
const dayText=d=>new Date(d+'T12:00:00').toLocaleDateString('pt-BR',{day:'2-digit',month:'2-digit',year:'numeric'});
const weekday=d=>new Date(d+'T12:00:00').toLocaleDateString('pt-BR',{weekday:'short'});
const timeLabel=n=>(Number.isInteger(n)?String(n):String(n).replace('.',','))+' min';
const create=(tag,text,cls)=>{const node=document.createElement(tag);if(text!==null)node.textContent=text;if(cls)node.className=cls;return node};
try{imported=JSON.parse(localStorage.getItem(importKey)||'[]').filter(x=>x&&x.id&&due(x.due))}catch{}
try{const p=JSON.parse(localStorage.getItem(prefKey)||'{}');if([1.5,2,3,4].includes(Number(p.minutes)))$('c141-min').value=String(p.minutes);$('c141-new').checked=p.addNew===true}catch{}
async function json(path){const r=await fetch(path,{cache:'no-store'});if(!r.ok)throw Error('Fonte indisponível: '+path);return r.json()}
const source=document.createElement('div');source.className='c141-private-source';source.style.cssText='margin:10px 0;padding:11px;border:1px solid #cad9dd;border-radius:8px';
const driveAction=document.createElement('button');driveAction.type='button';driveAction.className='c141-primary';driveAction.textContent='Atualizar fila pelo SRS privado do Drive';
const driveNote=document.createElement('span');driveNote.style.cssText='display:block;font-size:12px;margin-top:7px';driveNote.textContent='Fila parcial: apenas histórico F17. Conecte o Google Drive e carregue os dados privados; nenhuma nota será inventada.';
source.append(driveAction,driveNote);root.querySelector('.c141-import').before(source);
async function refreshPrivate(){
 if(driveBusy||!loaded)return false;
 if(!window.BMSRSV311?.latestPrivate){driveNote.textContent='Motor V311 indisponível. Fila histórica preservada.';return false}
 driveBusy=true;driveAction.disabled=true;driveNote.textContent='Conferindo fonte privada do Drive…';
 try{
  const remote=await window.BMSRSV311.latestPrivate();
  const next=remote.records.filter(x=>map.has(x.id)&&due(x.due));
  if(next.length<20)throw Error('Poucos IDs reconhecidos; a fila anterior foi preservada.');
  privateRecords=next;privateInfo={version:remote.version,updated:remote.updated,count:next.length,sourceId:remote.driveFileId};
  driveNote.textContent='SRS privado '+remote.version+' ('+(remote.updated||'data não informada')+'): '+next.length+' vencimentos derivados, incluindo os agendamentos iniciais. Histórico anterior preservado. Não é leitura de avaliações posteriores à data do arquivo.';
  calculate();return true;
 }catch(e){
  driveNote.textContent='Fila parcial sem atualização privada: '+e.message+'. Conecte o Drive e tente novamente; as datas locais não foram apagadas.';
  return false;
 }finally{driveBusy=false;driveAction.disabled=false}
}
driveAction.onclick=()=>void refreshPrivate();
document.addEventListener('bm-media-drive-authorized',()=>{if(loaded)void refreshPrivate()});

async function load(){
 const [meta,f17]=await Promise.all([json('assets/meta_public_v194.json'),json('assets/f17_historico_auditado_v029.json')]);
 if(f17.format!=='BancoMestreF17AuditoriaV029'||Object.keys(f17.historico_por_id||{}).length!==21)throw Error('Histórico F17 incompatível');
 const [files,ijui,synced,petro22]=await Promise.all([
  Promise.all(meta.card_files.map(f=>json('assets/'+f))),
  json('assets/ijui_flashcards_operacionais_v027.json'),
  json('assets/cards_drive_sync_v274.json'),
  json('assets/v276_petro22_public_cards.json')]);
 if(ijui.cards?.length!==22||synced.format!=='BancoMestrePublicDriveSyncV274'||
  synced.base_count!==1518||synced.new_cards?.length!==14||
  petro22.format!=='BancoMestrePublicPetro22DeltaV276'||
  petro22.new_cards?.length!==1)throw Error('Catálogo público de cartões V311 inconsistente');
 const published=[...files.flat(),...synced.new_cards,...petro22.new_cards,...ijui.cards];
 if(published.length!==1555||new Set(published.map(x=>x.id)).size!==1555)
  throw Error('Catálogo V311 não possui os 1.555 IDs publicados');
 cards=published.filter(c=>c&&c.active!==false&&c.id);
 map=new Map(cards.map(c=>[c.id,c]));
 history=Object.entries(f17.historico_por_id).map(([id,e])=>({id,due:due(e.proxima_revisao_existente_v015),rating:e.avaliacao||'',source:'F17/V015'})).filter(x=>x.due&&map.has(x.id));
 loaded=true;
}
function records(){
 const all=new Map((privateInfo?[]:history).map(x=>[x.id,x]));
 for(const x of privateRecords)if(map.has(x.id))all.set(x.id,x);
 for(const x of imported)if(map.has(x.id))all.set(x.id,{id:x.id,due:x.due,rating:x.rating,consolidated:x.consolidated===true,easyFormalCount:Number(x.easyFormalCount)||0,intervalDays:Number(x.intervalDays)||null,source:'Importação SRS local'});
 return [...all.values()].filter(x=>due(x.due));
}
function calculate(){
 if(!loaded)return;
 const all=records(),start=today(),last=shift(start,179),known=new Set(all.map(x=>x.id));
 const candidates=all.filter(x=>x.due<=last).sort((a,b)=>a.due.localeCompare(b.due)||rank(a.rating)-rank(b.rating)||a.id.localeCompare(b.id));
 const minute=Number($('c141-min').value)||2,capacity=Math.floor(60/minute),addNew=$('c141-new').checked;
 const newCards=addNew?cards.filter(c=>!known.has(c.id)).sort((a,b)=>String(a.prior||'P9').localeCompare(String(b.prior||'P9'))||a.id.localeCompare(b.id)):[];
 let position=0,newPosition=0,pending=[];
 schedule=[];
 for(let i=0;i<180;i++){
  const date=shift(start,i);let deadlineCount=0;
  while(position<candidates.length&&candidates[position].due<=date){
   if(candidates[position].due===date)deadlineCount++;
   pending.push(candidates[position++]);
  }
  pending.sort((a,b)=>rank(a.rating)-rank(b.rating)||a.due.localeCompare(b.due)||a.id.localeCompare(b.id));
  const items=pending.splice(0,capacity).map(x=>Object.assign({},x,{kind:'revisao'}));
  while(addNew&&items.length<capacity&&newPosition<newCards.length)items.push({id:newCards[newPosition++].id,due:'',rating:'',source:'Sem data SRS',kind:'novo'});
  schedule.push({date,items,dueToday:deadlineCount,minutes:Math.round(items.length*minute*10)/10});
 }
 $('c141-known').textContent=all.length.toLocaleString('pt-BR');
 $('c141-overdue').textContent=all.filter(x=>x.due<start).length;
 $('c141-unplanned').textContent=Math.max(0,cards.length-all.length).toLocaleString('pt-BR');
 $('c141-today').textContent=all.filter(x=>x.due===start).length;
 $('c141-status').textContent=all.length+' datas SRS conhecidas ('+(privateInfo?'privado '+privateInfo.version:'somente F17 histórico')+'), '+imported.length+' importações locais. Ordenação: Errei → Difícil → Bom → Fácil; Consolidado só com 2 avaliações Fácil comprovadas. Nenhuma revisão é lançada automaticamente.';
 try{localStorage.setItem(prefKey,JSON.stringify({minutes:minute,addNew}))}catch{}
 render();
 renderQueue();
}
let cardOpenRequest=0;
async function openCard(id,origin){
 const request=++cardOpenRequest;
 const sourceButton=origin||document.activeElement;
 const status=$('c141-status');
 if(origin)origin.disabled=true;
 try{
  let reader=window.BancoMestreVisualizarCardV050;
  if(!reader||typeof reader.showId!=='function')throw Error('Leitor do popup indisponível.');
  let opened=reader.showId(id,sourceButton);
  if(!opened){
   if(typeof window.loadCards!=='function')throw Error('Carregador de cartões indisponível.');
   await window.loadCards();
   if(request!==cardOpenRequest)return;
   reader=window.BancoMestreVisualizarCardV050;
   opened=!!reader?.showId?.(id,sourceButton);
  }
  if(!opened)throw Error('ID '+id+' não encontrado na biblioteca carregada.');
  // O popup é aberto SOBRE o planejamento; fechar retorna à tabela sem alterar filtros.
  const modal=$('bmCardPeekV050'),back=modal?.querySelector('.bm165-footer-close');
  const label=back&&Array.from(back.childNodes).find(n=>n.nodeType===3);
  if(label){
   if(typeof modal.bmSrsBackCleanup==='function')modal.bmSrsBackCleanup();
   const previous=label.textContent;
   label.textContent='Voltar ao planejamento SRS';
   const watcher=new MutationObserver(()=>{if(modal.hidden)restore()});
   function restore(){
    watcher.disconnect();label.textContent=previous;delete modal.bmSrsBackCleanup;
   }
   modal.bmSrsBackCleanup=restore;
   watcher.observe(modal,{attributes:true,attributeFilter:['hidden']});
  }
 }catch(error){
  console.warn('Falha ao abrir cartão no Planejamento SRS:',id,error);
  if(status)status.textContent='Não foi possível abrir '+id+': '+error.message;
 }finally{
  if(origin)origin.disabled=false;
 }
}
function render(){
 if(!loaded)return;
 const from=page*14,to=Math.min(from+14,schedule.length),start=today();
 $('c141-prev').disabled=page===0;$('c141-next').disabled=to>=schedule.length;
 $('c141-range').textContent=dayText(schedule[from].date)+' a '+dayText(schedule[to-1].date)+' · até 60 min por dia';
 const tbody=$('c141-body');tbody.replaceChildren();
 const overdue=records().filter(x=>x.due<start).length;
 for(let i=from;i<to;i++){
  const d=schedule[i],tr=create('tr');if(d.date===start)tr.className='c141-today';
  const date=create('td');const dateInner=create('span',dayText(d.date),'c141-date');dateInner.append(create('small',weekday(d.date)+(d.date===start?' · hoje':'')));date.append(dateInner);tr.append(date);
  const n=d.dueToday+(i===0?overdue:0);const cell=create('td');cell.append(create('span',n?n+' cartão(ões)':'Nenhum',n?(i===0?'c141-tag late':'c141-tag'):'c141-muted'));tr.append(cell);
  tr.append(create('td',String(d.items.length)+(d.items.some(x=>x.kind==='novo')?' (incl. novos)':'')));
  tr.append(create('td',timeLabel(d.minutes),'c141-planned'));
  tr.append(create('td',timeLabel(Math.max(0,60-d.minutes)),'c141-muted'));
  const detailCell=create('td');
  if(!d.items.length)detailCell.append(create('span','Sem cartões agendados','c141-muted'));
  else{
   const det=create('details'),sum=create('summary','Ver '+d.items.length+' cartões'),ul=create('ul',null,'c141-items');
   for(const item of d.items){
    const card=map.get(item.id);if(!card)continue;
    const li=create('li'),info=create('div');
    info.append(create('b',item.id+' · '+(item.consolidated?'Consolidado (2× Fácil)':item.kind==='novo'?'Novo':item.kind==='agendamento'?'Agendamento':(item.rating||'Revisão'))));
    info.append(create('p',card.front||'Pergunta'));
    info.append(create('small',(card.discipline||'')+' · '+(card.subject||'')+(item.due?' · Venc.: '+dayText(item.due):'')+(item.intervalDays?' · Intervalo '+item.intervalDays+'d':'')+(item.rating==='Fácil'&&!item.consolidated?' · Fácil, ainda não consolidado':'')+' · '+item.source));
    const button=create('button','Ver cartão');button.type='button';button.onclick=()=>void openCard(item.id,button);
  li.append(info,button);ul.append(li);
   }
   det.append(sum,ul);detailCell.append(det);
  }
  tr.append(detailCell);tbody.append(tr);
 }
}

/* V313: tabela SRS completa. Não consulta Drive por conta própria; reutiliza
   a fonte privada autorizada do motor V311. Nunca grava notas nem avaliações. */
const DAY_MS=86400000;
const diffDays=(a,b)=>Math.round((Date.parse(b+'T12:00:00Z')-Date.parse(a+'T12:00:00Z'))/DAY_MS);
const queuedStatus=(entry,now)=>{
 if(!entry?.due)return {key:'undated',text:'Sem data SRS',days:null};
 const delta=diffDays(entry.due,now);
 if(delta>0)return {key:'overdue',text:delta+' dia'+(delta===1?'':'s')+' em atraso',days:delta};
 if(delta===0)return {key:'today',text:'Vence hoje',days:0};
 return {key:'upcoming',text:'Em '+(-delta)+' dia'+(delta===-1?'':'s'),days:delta};
};
function queueData(){
 const dated=new Map(records().map(x=>[x.id,x])),now=today();
 const order={overdue:0,today:1,upcoming:2,undated:3};
 return cards.map(card=>{
  const rec=dated.get(card.id)||null,status=queuedStatus(rec,now);
  return {id:card.id,card,rec,status};
 }).sort((a,b)=>order[a.status.key]-order[b.status.key]||
  (a.rec?.due||'9999-12-31').localeCompare(b.rec?.due||'9999-12-31')||
  rank(a.rec?.rating)-rank(b.rec?.rating)||a.id.localeCompare(b.id));
}
function filteredQueue(){
 const value=$('c313-filter')?.value||'overdue',q=norm($('c313-search')?.value||'');
 return queueData().filter(x=>(value==='all'||x.status.key===value)&&
  (!q||norm([x.id,x.card.discipline,x.card.subject,x.card.sub,x.card.front].join(' ')).includes(q)));
}
function renderQueue(){
 if(!loaded)return;
 const source=$('c313-source'),rows=filteredQueue(),start=today();
 if(source){
  source.textContent=(privateInfo?
   'Fonte SRS privada '+privateInfo.version+' de '+(privateInfo.updated||'data não informada')+' (leitura OAuth nesta sessão).':
   'Fonte parcial e histórica F17/V015; conecte o Drive e clique em Atualizar fila pelo SRS privado do Drive.')+
   ' Referência dos cálculos: '+dayText(start)+
   '. As datas só refletem revisões documentadas na fonte consultada; respostas posteriores não confirmadas não foram consideradas.';
 }
 $('c313-count').textContent=rows.length.toLocaleString('pt-BR')+
  ' cartões no filtro · '+Math.min(queueShown,rows.length)+' exibidos · '+cards.length.toLocaleString('pt-BR')+
  ' ativos no catálogo. Intervalos: Errei 4 / Difícil 8 / Bom 16 / Fácil 32 / 2× Fácil formal 64 dias.';
 const body=$('c313-body');if(!body)return;body.replaceChildren();
 if(!rows.length){
  const tr=create('tr'),td=create('td','Nenhum cartão nesta situação.','c141-muted');td.colSpan=7;tr.append(td);body.append(tr);
 }
 for(const x of rows.slice(0,queueShown)){
  const tr=create('tr');
  if(x.status.key==='overdue')tr.className='c141-today';
  const id=create('td',x.id);tr.append(id);
  const concept=create('td');
  concept.append(create('strong',x.card.subject||x.card.discipline||'Assunto não informado'));
  concept.append(create('small',x.card.front||'Pergunta sem texto'));
  tr.append(concept);
  const label=x.rec?.consolidated?'Consolidado — 2× Fácil':x.rec?.rating||(x.rec?.kind==='agendamento'?'Agendado sem revisão formal':'Não iniciado');
  tr.append(create('td',label));
  tr.append(create('td',x.rec?.due?dayText(x.rec.due):'—'));
  tr.append(create('td',x.status.text,x.status.key==='overdue'?'c141-tag late':''));
  tr.append(create('td',x.rec?.source||'Sem registro SRS'));
  const action=create('td'),btn=create('button','Abrir cartão');btn.type='button';
  btn.onclick=()=>void openCard(x.id,btn);action.append(btn);tr.append(action);
  body.append(tr);
 }
 const more=$('c313-more');if(more){more.style.display=rows.length>queueShown?'inline-block':'none';
  more.textContent='Mostrar mais 50 ('+(rows.length-queueShown)+' restantes)';}
}
function exportQueue(){
 if(!loaded)return;
 const rows=[['id','disciplina','assunto','pergunta','classificacao','proxima_revisao','situacao','dias_em_atraso','intervalo_dias','origem_srs','consolidado']];
 for(const x of filteredQueue()){
  rows.push([x.id,x.card.discipline,x.card.subject,x.card.front,
   x.rec?.consolidated?'Consolidado':x.rec?.rating||'',x.rec?.due||'',x.status.text,
   x.status.days>0?x.status.days:0,x.rec?.intervalDays||'',x.rec?.source||'',x.rec?.consolidated?'Sim':'Não']);
 }
 const safe=x=>{
  let v=String(x??'');
  if(/^[\s]*[=+\-@\t\r]/.test(v))v="'"+v; // protege contra fórmulas CSV
  return '"'+v.replace(/"/g,'""')+'"';
 };
 const csv='\ufeff'+rows.map(r=>r.map(safe).join(';')).join('\r\n');
 const url=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'}));
 const a=document.createElement('a');a.href=url;
 a.download='Banco_Mestre_Fila_SRS_'+($('c313-filter').value||'todos')+'_'+today()+'.csv';
 document.body.append(a);a.click();a.remove();
 setTimeout(()=>URL.revokeObjectURL(url),1500);
}
$('c313-filter').onchange=()=>{queueShown=50;renderQueue()};
$('c313-search').oninput=()=>{queueShown=50;renderQueue()};
$('c313-more').onclick=()=>{queueShown+=50;renderQueue()};
$('c313-export').onclick=exportQueue;

function parseCSV(input){
 const header=(input.split(/\r?\n/)[0]||'');const delim=[';',',','\t'].sort((a,b)=>header.split(b).length-header.split(a).length)[0];
 const rows=[];let data='',cell='',row=[],quoted=false;
 for(let i=0;i<input.length;i++){
  const c=input[i];if(c==='"'){if(quoted&&input[i+1]==='"'){cell+='"';i++}else quoted=!quoted}
  else if(c===delim&&!quoted){row.push(cell);cell=''}
  else if((c==='\r'||c==='\n')&&!quoted){if(c==='\r'&&input[i+1]==='\n')i++;row.push(cell);cell='';if(row.some(x=>x.trim()))rows.push(row);row=[]}
  else cell+=c;
 }
 row.push(cell);if(row.some(x=>x.trim()))rows.push(row);
 if(rows.length<2)throw Error('CSV vazio ou sem cabeçalho');
 const keys=rows.shift().map(norm);
 const find=names=>keys.findIndex(k=>names.includes(k));
 const a=find(['id','cardid','cartao','idcartao','cartaoid']),b=find(['proximarevisao','dataproximarevisao','proximarevisaoexistentev015','nextreview','duedate','due']),c=find(['avaliacao','classificacao','rating','dificuldade']);
 if(a<0||b<0)throw Error('CSV precisa de id e proxima_revisao');
 return rows.map(r=>({id:r[a],due:r[b],rating:c<0?'':r[c]}));
}
function parseJSON(obj){
 let arr;
 if(Array.isArray(obj))arr=obj;
 else if(Array.isArray(obj.cards))arr=obj.cards;
 else if(Array.isArray(obj.registros))arr=obj.registros;
 else if(Array.isArray(obj.revisoes))arr=obj.revisoes;
 else if(Array.isArray(obj.srs))arr=obj.srs.map(x=>{const v=window.BMSRSV311?.fromSrs?.(x);return v?{...v,__verifiedSrs:true}:{id:x.id,due:x.next_review,rating:''}});
 else{const map=obj.por_id||obj.historico_por_id||obj.srs||obj;arr=Object.entries(map).map(([key,val])=>Object.assign({},val&&typeof val==='object'?val:{},{id:(val&&val.id)||key}))}
 const pick=(x,names)=>Object.entries(x||{}).find(([k])=>names.includes(norm(k)))?.[1];
 return arr.map(x=>({id:pick(x,['id','cardid','cartaoid','idcartao']),due:pick(x,['proximarevisao','dataproximarevisao','proximarevisaoexistentev015','nextreview','duedate','due']),rating:pick(x,['avaliacao','classificacao','rating','dificuldade']),verifiedSrs:x.__verifiedSrs===true,consolidated:x.__verifiedSrs===true&&x.consolidated===true&&Number(x.easyFormalCount)>=2,intervalDays:x.__verifiedSrs===true?Number(x.intervalDays)||null:null,easyFormalCount:x.__verifiedSrs===true?Number(x.easyFormalCount)||0:0}));
}
async function upload(file){
 if(!file||file.size>15*1024*1024)throw Error('Arquivo ausente ou maior que 15MB');
 const content=await file.text();
 const rows=content.trim().startsWith('{')||content.trim().startsWith('[')?parseJSON(JSON.parse(content)):parseCSV(content);
 const valid=new Map();let ignored=0;
 for(const row of rows){const id=String(row.id||'').trim(),date=due(row.due);if(!map.has(id)||!date){ignored++;continue}valid.set(id,{id,due:date,rating:String(row.rating||'').trim(),consolidated:row.verifiedSrs===true&&row.consolidated===true,easyFormalCount:row.verifiedSrs===true?row.easyFormalCount:0,intervalDays:row.verifiedSrs===true?row.intervalDays:null})}
 if(!valid.size)throw Error('Nenhuma linha com ID ativo e data válida. Formato: CARD-0001;18/11/2026;Errei');
 const update=new Map(imported.map(x=>[x.id,x]));for(const [id,val]of valid)update.set(id,val);
 imported=[...update.values()];localStorage.setItem(importKey,JSON.stringify(imported));
 $('c141-result').className='c141-result';$('c141-result').textContent=valid.size+' cartões importados; '+ignored+' linhas ignoradas. Somente o planejamento local foi atualizado.';calculate();
}
function exportCSV(){
 if(!loaded)return;
 const rows=[['data_planejada','cartao_id','tipo','vencimento_original','avaliacao','disciplina','tempo_min','origem']];
 for(const day of schedule)for(const x of day.items){const c=map.get(x.id)||{};rows.push([day.date,x.id,x.kind,x.due,x.rating,c.discipline,Number($('c141-min').value),x.source])}
 const csv='\ufeff'+rows.map(row=>row.map(x=>'"'+String(x||'').replace(/"/g,'""')+'"').join(';')).join('\r\n');
 const url=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'})),link=document.createElement('a');link.href=url;link.download='Planejamento_SRS_Estimado_'+today()+'.csv';link.click();setTimeout(()=>URL.revokeObjectURL(url),1500);
}
async function open(){
 if(typeof window.section==='function')window.section('calendario');
 if(loaded){calculate();return}
 if(loading)return;loading=true;$('c141-status').textContent='Carregando os cartões e histórico auditado...';
 try{await load();calculate();if(window.BancoMestreMediaSyncV182?.token?.())void refreshPrivate()}catch(e){$('c141-status').textContent='Erro: '+e.message}finally{loading=false}
}
navBtn.onclick=open;
$('c141-min').onchange=()=>loaded&&calculate();
$('c141-new').onchange=()=>loaded&&calculate();
$('c141-prev').onclick=()=>{page=Math.max(0,page-1);render()};
$('c141-next').onclick=()=>{page=Math.min(12,page+1);render()};
$('c141-reset').onclick=()=>{page=0;render()};
$('c141-export').onclick=()=>loaded?exportCSV():open();
$('c141-pick').onclick=()=>loaded?$('c141-file').click():open();
$('c141-file').onchange=async function(){const file=this.files?.[0];this.value='';if(!file)return;try{await upload(file)}catch(e){$('c141-result').className='c141-result error';$('c141-result').textContent=e.message}};
$('c141-clear').onclick=()=>{if(!imported.length)return;if(!confirm('Limpar apenas as datas importadas para este calendário? O SRS original não será alterado.'))return;imported=[];localStorage.removeItem(importKey);$('c141-result').textContent='Importação local limpa, histórico F17 mantido.';if(loaded)calculate()};
window.BM141Calendar={open,refreshPrivate,plan:()=>schedule.slice(),rows:queueData,records:()=>records().map(x=>({...x})),counts:()=>({active:cards.length,verified:records().length,overdue:records().filter(x=>x.due<today()).length,today:records().filter(x=>x.due===today()).length,undated:cards.length-records().length,imported:imported.length,private:privateRecords.length,privateInfo})};
if(location.hash==='#calendario')void open();
})();
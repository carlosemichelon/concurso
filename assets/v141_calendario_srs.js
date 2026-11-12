
/* V141 — calendario de revisão: planejamento local, nunca grava SRS. */
(function(){
'use strict';
const nav=document.querySelector('header nav'),main=document.querySelector('main');
if(!nav||!main||document.getElementById('calendario'))return;
const root=document.createElement('section');root.id='calendario';
root.innerHTML=[
'<div class="c141-wrap">',
'<div class="c141-title"><div><span class="c141-kicker">BANCO MESTRE · ORGANIZAÇÃO SRS</span><h2>Calendário de revisões</h2><p>Distribua as revisões por vencimento e dificuldade com limite de 1 hora por dia. O planejamento não altera suas datas SRS nem registra avaliações.</p></div><div class="c141-limit">⏱ 60 minutos/dia</div></div>',
'<div class="c141-stats"><div class="c141-stat"><strong id="c141-known">—</strong><span>Cartões com vencimento conhecido</span></div><div class="c141-stat"><strong id="c141-overdue">—</strong><span>Vencidos até hoje</span></div><div class="c141-stat"><strong id="c141-unplanned">—</strong><span>Ativos sem data SRS disponível</span></div><div class="c141-stat"><strong id="c141-today">—</strong><span>Revisões planejadas para hoje</span></div></div>',
'<div class="c141-settings"><label for="c141-min">Tempo por cartão</label><select id="c141-min"><option value="1.5">1,5 min — até 40/dia</option><option value="2" selected>2 min — até 30/dia</option><option value="3">3 min — até 20/dia</option><option value="4">4 min — até 15/dia</option></select><label class="c141-check"><input id="c141-new" type="checkbox">Preencher tempo livre com cartões novos, sem data SRS</label><button class="c141-primary" id="c141-export">Exportar CSV</button></div>',
'<p class="c141-note">Datas conhecidas: histórico <strong>F17/V015 (21 eventos)</strong>, sujeito a revisões posteriores que ainda não estão no site. Cartões sem data não são considerados atrasados. Uma importação recente de SRS atualiza somente este calendário. Remanejar uma sessão não altera seu vencimento original.</p>',
'<p id="c141-status" class="c141-status" role="status">Selecione Calendário SRS para carregar os registros.</p>',
'<div class="c141-board"><div class="c141-boardhead"><h3 id="c141-range">Próximos 14 dias</h3><div class="c141-actions"><button id="c141-prev">← Antes</button><button id="c141-reset">Hoje</button><button id="c141-next">Depois →</button></div></div><div class="c141-scroll"><table><thead><tr><th>Data</th><th>Vencem / atrasados</th><th>Previstos</th><th>Tempo</th><th>Disponível</th><th>Cartões</th></tr></thead><tbody id="c141-body"><tr><td colspan="6">Carregando...</td></tr></tbody></table></div></div>',
'<div class="c141-import"><h3>Sincronizar sua agenda com o progresso recente</h3><p>Importe CSV ou JSON com as colunas <code>id;proxima_revisao;avaliacao</code> (por exemplo <code>CARD-0001;18/11/2026;Errei</code>). Os dados ficam <strong>somente neste navegador</strong>. Não são enviados ao GitHub ou Drive e não substituem o registro de revisões.</p><input id="c141-file" type="file" accept=".csv,.json" hidden><button id="c141-pick">Importar SRS (CSV/JSON)</button> <button id="c141-clear">Limpar importação local</button><p id="c141-result" class="c141-result" role="status"></p></div>',
'</div>'].join('');
const footer=main.querySelector('footer');if(footer)footer.before(root);else main.append(root);
const navBtn=document.createElement('button');navBtn.type='button';navBtn.textContent='Calendário SRS';navBtn.dataset.page='calendario';
const cardBtn=nav.querySelector('[data-page="cartoes"]');if(cardBtn)cardBtn.after(navBtn);else nav.append(navBtn);
const $=id=>document.getElementById(id);
const importKey='BM141_CALENDAR_IMPORT_V1',prefKey='BM141_CALENDAR_PREF_V1';
let cards=[],map=new Map(),history=[],imported=[],schedule=[],page=0,loaded=false,loading=false;
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
async function load(){
 const [meta,f17]=await Promise.all([json('assets/meta_v021.json'),json('assets/f17_historico_auditado_v029.json')]);
 if(f17.format!=='BancoMestreF17AuditoriaV029'||Object.keys(f17.historico_por_id||{}).length!==21)throw Error('Histórico F17 incompatível');
 const files=await Promise.all(meta.card_files.map(f=>json('assets/'+f)));
 cards=files.flat().filter(c=>c&&c.active!==false&&c.id);map=new Map(cards.map(c=>[c.id,c]));
 history=Object.entries(f17.historico_por_id).map(([id,e])=>({id,due:due(e.proxima_revisao_existente_v015),rating:e.avaliacao||'',source:'F17/V015'})).filter(x=>x.due&&map.has(x.id));
 loaded=true;
}
function records(){
 const all=new Map(history.map(x=>[x.id,x]));
 for(const x of imported)if(map.has(x.id))all.set(x.id,{id:x.id,due:x.due,rating:x.rating,source:'Importação local'});
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
 $('c141-overdue').textContent=all.filter(x=>x.due<=start).length;
 $('c141-unplanned').textContent=Math.max(0,cards.length-all.length).toLocaleString('pt-BR');
 $('c141-today').textContent=schedule[0].items.filter(x=>x.kind==='revisao').length+' revisões';
 $('c141-status').textContent=all.length+' datas SRS conhecidas, '+imported.length+' registros importados. Prioridade na fila: Errei → Difícil → Bom → Fácil; nenhuma revisão é lançada automaticamente.';
 try{localStorage.setItem(prefKey,JSON.stringify({minutes:minute,addNew}))}catch{}
 render();
}
function openCard(id){
 const input=$('cardSearch');if(input){input.value=id;input.dispatchEvent(new Event('input',{bubbles:true}))}
 if(typeof window.section==='function')window.section('cartoes');
 const job=typeof window.loadCards==='function'?window.loadCards():null;
 Promise.resolve(job).then(()=>{if(input){input.value=id;input.dispatchEvent(new Event('input',{bubbles:true}))}}).catch(console.warn);
 window.scrollTo(0,0);
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
    info.append(create('b',item.id+' · '+(item.kind==='novo'?'Novo':item.rating||'Revisão')));
    info.append(create('p',card.front||'Pergunta'));
    info.append(create('small',(card.discipline||'')+' · '+(card.subject||'')+(item.due?' · Venc.: '+dayText(item.due):'')+' · '+item.source));
    const button=create('button','Ver cartão');button.onclick=()=>openCard(item.id);li.append(info,button);ul.append(li);
   }
   det.append(sum,ul);detailCell.append(det);
  }
  tr.append(detailCell);tbody.append(tr);
 }
}
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
 else{const map=obj.por_id||obj.historico_por_id||obj.srs||obj;arr=Object.entries(map).map(([key,val])=>Object.assign({},val&&typeof val==='object'?val:{},{id:(val&&val.id)||key}))}
 const pick=(x,names)=>Object.entries(x||{}).find(([k])=>names.includes(norm(k)))?.[1];
 return arr.map(x=>({id:pick(x,['id','cardid','cartaoid','idcartao']),due:pick(x,['proximarevisao','dataproximarevisao','proximarevisaoexistentev015','nextreview','duedate','due']),rating:pick(x,['avaliacao','classificacao','rating','dificuldade'])}));
}
async function upload(file){
 if(!file||file.size>15*1024*1024)throw Error('Arquivo ausente ou maior que 15MB');
 const content=await file.text();
 const rows=content.trim().startsWith('{')||content.trim().startsWith('[')?parseJSON(JSON.parse(content)):parseCSV(content);
 const valid=new Map();let ignored=0;
 for(const row of rows){const id=String(row.id||'').trim(),date=due(row.due);if(!map.has(id)||!date){ignored++;continue}valid.set(id,{id,due:date,rating:String(row.rating||'').trim()})}
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
 const url=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'})),link=document.createElement('a');link.href=url;link.download='Calendario_SRS_1h_'+today()+'.csv';link.click();setTimeout(()=>URL.revokeObjectURL(url),1500);
}
async function open(){
 if(typeof window.section==='function')window.section('calendario');
 if(loaded){calculate();return}
 if(loading)return;loading=true;$('c141-status').textContent='Carregando os cartões e histórico auditado...';
 try{await load();calculate()}catch(e){$('c141-status').textContent='Erro: '+e.message}finally{loading=false}
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
window.BM141Calendar={open,plan:()=>schedule.slice(),counts:()=>({active:cards.length,verified:records().length,imported:imported.length})};
if(location.hash==='#calendario')void open();
})();
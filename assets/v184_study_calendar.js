/* V184 — diário mensal de estudos: data, disciplina, horas reais, notas e backup. */
(function(){
'use strict';
if(window.BM184StudyCalendar)return;
const db=window.BM184StudyStore,section=document.getElementById('calendario');
if(!db||!section)return;
const $=id=>document.getElementById(id),p=n=>String(n).padStart(2,'0'),fmt=n=>Math.floor(n/60)+'h'+p(n%60);
const disciplines=['Engenharia Civil','Português','Matemática','Legislação Geral','Legislação Municipal','Informática','Redação','Outros','Múltiplas disciplinas'];
const activities=['Teoria','Questões','Flashcards','Revisão','Lei seca','Simulado','Redação','Outros'];
const host=document.createElement('div');host.className='bm184-diary';
host.innerHTML=[
 '<div class="bm184-top"><div><span class="bm184-kicker">DIÁRIO DE ESTUDO · REGISTRO REAL</span><h2>Calendário de horas estudadas</h2>',
 '<p>Registre disciplina, duração e anotações. As horas realizadas são diferentes das revisões previstas pelo SRS.</p></div>',
 '<button type="button" id="bm184-go-practice">Praticar cartões</button></div>',
 '<div class="bm184-totals"><div><strong id="bm184-today">0h00</strong><span>Hoje</span></div>',
 '<div><strong id="bm184-week">0h00</strong><span>Últimos 7 dias</span></div>',
 '<div><strong id="bm184-month">0h00</strong><span>Mês exibido</span></div>',
 '<div><strong id="bm184-records">0</strong><span>Sessões registradas</span></div></div>',
 '<div class="bm184-goal"><label>Meta diária (minutos) <input id="bm184-goal-min" type="number" min="10" max="1440" step="10" value="120"></label>',
 '<div class="bm184-goal-track"><div id="bm184-goal-progress"></div></div><span id="bm184-goal-status"></span></div>',
 '<div class="bm184-calendar"><div class="bm184-month-nav">',
 '<button id="bm184-prev" type="button" aria-label="Mês anterior">‹</button><strong id="bm184-range"></strong>',
 '<button id="bm184-next" type="button" aria-label="Próximo mês">›</button><button id="bm184-now" type="button">Hoje</button></div>',
 '<div id="bm184-days" class="bm184-days" aria-label="Calendário mensal de horas estudadas"></div></div>',
 '<div class="bm184-under"><form id="bm184-form" class="bm184-form"><h3 id="bm184-form-title">Registrar estudo</h3>',
 '<div class="bm184-fields">',
 '<label>Data <input type="date" id="bm184-date" required></label>',
 '<label>Disciplina <select id="bm184-discipline"></select></label>',
 '<label>Assunto <input id="bm184-subject" type="text" maxlength="220" placeholder="Ex.: NBR 6118, Crase, Licitações"></label>',
 '<label>Atividade <select id="bm184-type"></select></label>',
 '<label>Horas <input id="bm184-hours" type="number" min="0" max="24" step="1" value="1" required></label>',
 '<label>Minutos <input id="bm184-minutes" type="number" min="0" max="59" step="1" value="0" required></label></div>',
 '<label>Observações, dificuldades e próximo passo<textarea id="bm184-notes" rows="3" maxlength="3000" placeholder="O que estudei? Onde tive dificuldade?"></textarea></label>',
 '<div class="bm184-actions"><button type="submit" class="bm184-primary" id="bm184-save">Salvar estudo</button>',
 '<button type="button" id="bm184-cancel" hidden>Cancelar edição</button><span id="bm184-feedback" role="status"></span></div></form>',
 '<div class="bm184-summary"><h3 id="bm184-selected-label">Sessões deste dia</h3><div id="bm184-day-sessions"></div>',
 '<h3>Disciplinas no mês</h3><div id="bm184-breakdown"></div></div></div>',
 '<details class="bm184-backup"><summary>Backup, importação e exportação</summary>',
 '<p>Registros apenas neste navegador. Para usar outro aparelho, exporte o JSON e importe nele. O backup inclui também tentativas e avaliações da prática local; não altera o SRS canônico.</p>',
 '<div class="bm184-actions"><button type="button" id="bm184-json">Exportar backup JSON</button>',
 '<button type="button" id="bm184-csv">Exportar horas CSV</button>',
 '<button type="button" id="bm184-review-csv">Exportar previsões de revisão CSV</button>',
 '<button type="button" id="bm184-import-button">Importar backup JSON</button>',
 '<input type="file" id="bm184-import" accept=".json,application/json" hidden></div>',
 '<p id="bm184-backup-status" role="status"></p></details>'
].join('');
(section.querySelector('.panel')||section).prepend(host);
const choice=(id,values)=>{for(const val of values){const o=document.createElement('option');o.value=o.textContent=val;$(id).append(o)}};
choice('bm184-discipline',disciplines);choice('bm184-type',activities);
const today=db.localDay();let selected=today,display=new Date(Number(today.slice(0,4)),Number(today.slice(5,7))-1,1),editing='';
$('bm184-date').value=today;
const nameDay=s=>new Date(s+'T12:00:00').toLocaleDateString('pt-BR',{day:'2-digit',month:'short',year:'numeric'});
const monthDay=(yr,mo,d)=>yr+'-'+p(mo+1)+'-'+p(d);
const goalKey='BM184_STUDY_GOAL_V1';
try{let g=Number(localStorage.getItem(goalKey));if(Number.isInteger(g)&&g>=10&&g<=1440)$('bm184-goal-min').value=g}catch(_){}
function goal(){const n=Number($('bm184-goal-min').value);return Number.isInteger(n)&&n>=10&&n<=1440?n:120}
function drawDays(){
 const node=$('bm184-days');node.replaceChildren();
 const y=display.getFullYear(),m=display.getMonth();
 $('bm184-range').textContent=display.toLocaleDateString('pt-BR',{month:'long',year:'numeric'});
 for(const day of ['Seg','Ter','Qua','Qui','Sex','Sáb','Dom']){const e=document.createElement('span');e.className='bm184-weekday';e.textContent=day;node.append(e)}
 const offset=(new Date(y,m,1).getDay()+6)%7,nDays=new Date(y,m+1,0).getDate(),values=db.totals().byDay;
 for(let i=0;i<offset;i++){const e=document.createElement('span');e.className='bm184-pad';node.append(e)}
 for(let i=1;i<=nDays;i++){
  const day=monthDay(y,m,i),minutes=values[day]||0;
  const e=document.createElement('button');e.type='button';e.className='bm184-day';
  if(day===selected){e.classList.add('selected');e.setAttribute('aria-pressed','true')}
  if(day===today)e.classList.add('today');
  const n=document.createElement('b');n.textContent=i;
  const t=document.createElement('small');t.textContent=minutes?fmt(minutes):'—';
  e.append(n,t);e.title=nameDay(day)+' · '+fmt(minutes)+' de estudo';
  e.onclick=()=>{selected=day;$('bm184-date').value=day;resetForm(false);paint()};node.append(e);
 }
}
function showSessions(){
 const parent=$('bm184-day-sessions');parent.replaceChildren();
 $('bm184-selected-label').textContent='Sessões de '+nameDay(selected);
 const rows=db.listSessions().filter(x=>x.day===selected);
 if(!rows.length){const p=document.createElement('p');p.textContent='Nenhum lançamento neste dia.';parent.append(p)}
 for(const row of rows){
  const item=document.createElement('article');item.className='bm184-session';
  const body=document.createElement('div'),t=document.createElement('strong');t.textContent=row.discipline+' · '+fmt(row.minutes);
  const sub=document.createElement('p');sub.textContent=row.activity+(row.subject?' · '+row.subject:'');body.append(t,sub);
  if(row.note){const note=document.createElement('p');note.className='bm184-session-note';note.textContent=row.note;body.append(note)}
  const actions=document.createElement('div');actions.className='bm184-item-actions';
  const edit=document.createElement('button');edit.type='button';edit.textContent='Editar';edit.onclick=()=>editRow(row);
  const del=document.createElement('button');del.type='button';del.textContent='Excluir';
  del.onclick=()=>{if(!confirm('Excluir esta sessão de '+fmt(row.minutes)+'?'))return;
   try{db.deleteSession(row.id);if(editing===row.id)resetForm();$('bm184-feedback').textContent='Sessão excluída.';paint()}
   catch(e){$('bm184-feedback').textContent=e.message}};
  actions.append(edit,del);item.append(body,actions);parent.append(item);
 }
}
function showBreakdown(){
 const parent=$('bm184-breakdown');parent.replaceChildren();
 const y=display.getFullYear(),m=display.getMonth();
 const sum=db.totals(monthDay(y,m,1),monthDay(y,m,new Date(y,m+1,0).getDate()));
 $('bm184-month').textContent=fmt(sum.minutes);
 const entries=Object.entries(sum.byDiscipline).sort((a,b)=>b[1]-a[1]);
 for(const [name,mins] of entries){
  const row=document.createElement('div');row.className='bm184-breakdown-row';
  const label=document.createElement('div');label.className='bm184-breakdown-label';
  const a=document.createElement('span');a.textContent=name;const b=document.createElement('strong');b.textContent=fmt(mins);label.append(a,b);
  const track=document.createElement('div');track.className='bm184-breakdown-track';
  const bar=document.createElement('div');bar.style.width=Math.round(100*mins/sum.minutes)+'%';track.append(bar);
  row.append(label,track);parent.append(row);
 }
 if(!entries.length){const e=document.createElement('p');e.textContent='Nenhum estudo registrado neste mês.';parent.append(e)}
}
function paint(){
 const t=db.totals(),mins=t.byDay[today]||0,g=goal();
 $('bm184-today').textContent=fmt(mins);$('bm184-records').textContent=t.sessions;
 $('bm184-week').textContent=fmt(db.totals(db.shift(today,-6),today).minutes);
 $('bm184-goal-progress').style.width=Math.min(100,Math.round(mins/g*100))+'%';
 $('bm184-goal-status').textContent=fmt(mins)+' de '+fmt(g)+' da meta de hoje';
 drawDays();showSessions();showBreakdown();
}
function resetForm(changeDate=true){
 editing='';$('bm184-form-title').textContent='Registrar estudo';$('bm184-save').textContent='Salvar estudo';$('bm184-cancel').hidden=true;
 $('bm184-discipline').value=disciplines[0];$('bm184-type').value=activities[0];
 $('bm184-subject').value='';$('bm184-hours').value=1;$('bm184-minutes').value=0;$('bm184-notes').value='';
 if(changeDate)$('bm184-date').value=selected;
}
function editRow(row){
 editing=row.id;selected=row.day;display=new Date(Number(row.day.slice(0,4)),Number(row.day.slice(5,7))-1,1);
 $('bm184-date').value=row.day;
 if(!disciplines.includes(row.discipline)){const o=document.createElement('option');o.value=o.textContent=row.discipline;$('bm184-discipline').append(o)}
 $('bm184-discipline').value=row.discipline;
 $('bm184-subject').value=row.subject;$('bm184-type').value=row.activity;
 $('bm184-hours').value=Math.floor(row.minutes/60);$('bm184-minutes').value=row.minutes%60;$('bm184-notes').value=row.note;
 $('bm184-form-title').textContent='Editar sessão';$('bm184-save').textContent='Salvar alterações';$('bm184-cancel').hidden=false;
 paint();$('bm184-form').scrollIntoView({block:'nearest',behavior:'smooth'});
}
$('bm184-form').onsubmit=e=>{
 e.preventDefault();
 try{
  const h=Number($('bm184-hours').value),m=Number($('bm184-minutes').value);
  if(!Number.isInteger(h)||!Number.isInteger(m)||h<0||h>24||m<0||m>59)throw Error('Horas e minutos precisam ser inteiros válidos.');
  const row=db.saveSession({id:editing||undefined,day:$('bm184-date').value,
   discipline:$('bm184-discipline').value,subject:$('bm184-subject').value,
   activity:$('bm184-type').value,minutes:h*60+m,note:$('bm184-notes').value});
  selected=row.day;display=new Date(Number(selected.slice(0,4)),Number(selected.slice(5,7))-1,1);
  resetForm();$('bm184-feedback').textContent='Salvo: '+fmt(row.minutes)+' em '+nameDay(row.day);paint();
 }catch(error){$('bm184-feedback').textContent=error.message}
};
$('bm184-cancel').onclick=()=>resetForm();
$('bm184-prev').onclick=()=>{display.setMonth(display.getMonth()-1);drawDays();showBreakdown()};
$('bm184-next').onclick=()=>{display.setMonth(display.getMonth()+1);drawDays();showBreakdown()};
$('bm184-now').onclick=()=>{selected=today;display=new Date(Number(today.slice(0,4)),Number(today.slice(5,7))-1,1);$('bm184-date').value=today;paint()};
$('bm184-goal-min').onchange=()=>{const val=goal();$('bm184-goal-min').value=val;try{localStorage.setItem(goalKey,String(val))}catch(_){}paint()};
$('bm184-go-practice').onclick=()=>window.BM184Practice?.open?.();
function download(blob,name){const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),2500)}
$('bm184-json').onclick=()=>{try{download(new Blob([JSON.stringify(db.exportData(),null,2)],{type:'application/json'}),'BancoMestre_Estudos_Praticas_'+today+'.json');$('bm184-backup-status').textContent='Download solicitado. Confirme que o backup foi salvo.'}catch(e){$('bm184-backup-status').textContent=e.message}};
const csv=s=>'"'+(/^[=+\-@\t\r]/.test(String(s))?"'":'')+String(s??'').replace(/"/g,'""')+'"';
$('bm184-csv').onclick=()=>{
 const lines=[['data','disciplina','assunto','atividade','minutos','horas','anotacoes']];
 for(const e of db.listSessions().sort((a,b)=>a.day.localeCompare(b.day)))lines.push([e.day,e.discipline,e.subject,e.activity,e.minutes,(e.minutes/60).toFixed(2),e.note]);
 download(new Blob(['\ufeff'+lines.map(x=>x.map(csv).join(';')).join('\r\n')],{type:'text/csv;charset=utf-8'}),'BancoMestre_Horas_'+today+'.csv');
 $('bm184-backup-status').textContent='CSV gerado; use o JSON para preservar também o histórico de prática.';
};
$('bm184-review-csv').onclick=()=>{
 const rows=[['id','proxima_revisao','avaliacao','data_tentativa','intervalo_dias','disciplina','assunto','observacao']];
 for(const e of db.nextReviews().sort((a,b)=>a.cardId.localeCompare(b.cardId)))
  rows.push([e.cardId,e.due,e.rating,e.day,e.interval,e.discipline,e.subject,e.note]);
 const text='\ufeff'+rows.map(row=>row.map(csv).join(';')).join('\r\n');
 download(new Blob([text],{type:'text/csv;charset=utf-8'}),'BancoMestre_Previsoes_Praticas_'+today+'.csv');
 $('bm184-backup-status').textContent='Previsões locais exportadas. Não são eventos SRS canônicos; confira-as antes de importar para outro sistema.';
};
$('bm184-import-button').onclick=()=>$('bm184-import').click();
$('bm184-import').onchange=async e=>{
 const file=e.target.files?.[0];e.target.value='';if(!file)return;
 try{if(file.size>10*1024*1024)throw Error('Arquivo maior que 10 MB.');
  const result=db.importData(JSON.parse(await file.text()));paint();
  $('bm184-backup-status').textContent='Importados '+result.sessionsAdded+' estudos e '+result.reviewsAdded+' tentativas; os registros existentes foram preservados.';
 }catch(error){$('bm184-backup-status').textContent='Importação não aplicada: '+error.message}
};
window.addEventListener('bm184-study-updated',paint);paint();
window.BM184StudyCalendar=Object.freeze({openDay(day){if(!db.validDay(day))return false;selected=day;display=new Date(Number(day.slice(0,4)),Number(day.slice(5,7))-1,1);$('bm184-date').value=day;paint();return true},refresh:paint});
})();
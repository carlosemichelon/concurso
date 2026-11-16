/* Banco Mestre V184 — Prática ativa, um cartão por vez, sem alterar SRS canônico. */
(function(){
'use strict';
if(window.BM184Practice)return;
const db=window.BM184StudyStore,nav=document.querySelector('header nav'),main=document.querySelector('main');
if(!db||!nav||!main)return;
const $=id=>document.getElementById(id),p=n=>String(n).padStart(2,'0');
const formatTime=sec=>Math.floor(sec/3600)+'h'+p(Math.floor(sec%3600/60))+'m';
const root=document.createElement('section');root.id='pratica';root.className='bm184-practice';
root.innerHTML=[
 '<div class="panel"><span class="bm184-kicker">BANCO MESTRE · RECUPERAÇÃO ATIVA</span>',
 '<h2>Praticar cartões</h2><p>Uma pergunta por vez. Escreva primeiro sua resposta; só depois revele o verso original, compare e escolha Errei / Difícil / Bom / Fácil.</p>',
 '<p class="bm184-warning">As tentativas e as próximas revisões calculadas aqui são <b>registros locais operacionais</b>. Não substituem os eventos SRS oficiais nem são enviados ao Drive.</p>',
 '<div class="bm184-practice-config">',
 '<label>Disciplina <select id="bm184-pr-discipline"><option value="all">Todas as disciplinas</option></select></label>',
 '<label>Assunto <select id="bm184-pr-subject"><option value="all">Todos os assuntos</option></select></label>',
 '<label>Fila <select id="bm184-pr-mode">',
 '<option value="due">Vencidos e ainda não estudados</option>',
 '<option value="new">Somente ainda não estudados</option>',
 '<option value="all">Todos os cartões ativos</option></select></label>',
 '<label>Cartões por sessão <select id="bm184-pr-limit"><option value="10">10 cartões</option><option value="20" selected>20 cartões</option><option value="30">30 cartões</option><option value="50">50 cartões</option><option value="100">100 cartões</option></select></label>',
 '<button class="bm184-primary" id="bm184-pr-start" type="button">Iniciar prática</button></div>',
 '<div class="bm184-pr-metrics"><span id="bm184-pr-progress">Nenhuma sessão iniciada</span>',
 '<span id="bm184-pr-time">0h00m de prática visível</span><span id="bm184-pr-history">0 tentativas locais</span></div>',
 '<div id="bm184-pr-card" class="bm184-pr-card" hidden>',
 '<div><small id="bm184-pr-id"></small><h3 id="bm184-pr-front"></h3><p id="bm184-pr-meta"></p></div>',
 '<label>Sua resposta discursiva <textarea id="bm184-pr-answer" rows="6" maxlength="12000" placeholder="Responda com suas palavras antes de conferir o verso."></textarea></label>',
 '<div class="bm184-actions"><button id="bm184-pr-reveal" type="button" class="bm184-primary">Conferir resposta</button>',
 '<button id="bm184-pr-dontknow" type="button">Não sei responder</button></div>',
 '<div id="bm184-pr-back-box" hidden><h4>Verso original preservado — resposta exata do cartão</h4>',
 '<div id="bm184-pr-back" class="bm184-pr-back"></div>',
 '<details id="bm184-pr-extra"><summary>Explicação, macete e referência</summary><div id="bm184-pr-explanation"></div></details>',
 '<button id="bm184-pr-full" type="button">Abrir aprofundamento no leitor completo</button>',
 '<label>Observações sobre o erro ou dificuldade<textarea id="bm184-pr-note" maxlength="3000" rows="3" placeholder="Exceção esquecida, fórmula, pegadinha, próximo reforço..."></textarea></label>',
 '<h4>Avaliação da tentativa</h4><div id="bm184-pr-ratings" class="bm184-ratings">',
 '<button type="button" data-rating="Errei">Errei</button><button type="button" data-rating="Difícil">Difícil</button>',
 '<button type="button" data-rating="Bom">Bom</button><button type="button" data-rating="Fácil">Fácil</button></div></div>',
 '<p id="bm184-pr-feedback" role="status"></p>',
 '<div class="bm184-actions"><button id="bm184-pr-next" type="button" hidden>Próximo cartão</button>',
 '<button id="bm184-pr-finish" type="button">Encerrar e registrar tempo</button>',
 '<button id="bm184-pr-stop" type="button">Encerrar sem lançar horas</button></div></div>',
 '<div class="bm184-pr-end" id="bm184-pr-end" hidden>',
 '<h3>Sessão concluída</h3><p id="bm184-pr-end-text"></p>',
 '<label>Observações gerais da sessão<textarea id="bm184-pr-session-note" rows="3" maxlength="3000" placeholder="Síntese dos erros e prioridades para a próxima sessão."></textarea></label>',
 '<div class="bm184-actions"><button class="bm184-primary" id="bm184-pr-save-time" type="button">Registrar horas no calendário</button>',
 '<button id="bm184-pr-no-time" type="button">Não registrar tempo (já anotei)</button></div></div>',
 '<div class="bm184-actions"><button id="bm184-pr-calendar" type="button">Abrir calendário e horas</button>',
 '<span id="bm184-pr-status" role="status"></span></div>',
 '<details class="bm184-pr-journal"><summary>Histórico de tentativas e próximas revisões</summary>',
 '<div id="bm184-pr-history-list"></div></details></section>'
].join('');
const footer=main.querySelector('footer');if(footer)footer.before(root);else main.append(root);
const navBtn=document.createElement('button');navBtn.type='button';navBtn.dataset.page='pratica';navBtn.textContent='Praticar cartões';
const calBtn=nav.querySelector('[data-page="calendario"]'),cardsBtn=nav.querySelector('[data-page="cartoes"]');
if(calBtn)calBtn.before(navBtn);else if(cardsBtn)cardsBtn.after(navBtn);else nav.append(navBtn);
let all=[],queue=[],current=null,active=false,done=0,queuePos=0,seen=new Set(),questionAt=0;
let clockMs=0,clockStart=0,clockTick=0,selectedDisc='all',selectedSubject='all',lastReview=null,finished=false;
function currentMs(){return clockMs+(clockStart?Math.max(0,Date.now()-clockStart):0)}
function beginClock(){if(!clockStart&&document.visibilityState!=='hidden'&&root.classList.contains('active'))clockStart=Date.now()}
function stopClock(){if(clockStart){clockMs+=Math.max(0,Date.now()-clockStart);clockStart=0}}
document.addEventListener('visibilitychange',()=>{if(!active)return;if(document.visibilityState==='hidden')stopClock();else beginClock()});
function showTime(){
 $('bm184-pr-time').textContent=formatTime(Math.round(currentMs()/1000))+' de prática visível';
 $('bm184-pr-history').textContent=db.counts.reviews+' tentativas locais';
}
function displayHistory(){
 const host=$('bm184-pr-history-list');host.replaceChildren();
 const list=db.listReviews().slice(0,30);
 if(!list.length){const p=document.createElement('p');p.textContent='Nenhuma tentativa registrada nesta conta do navegador.';host.append(p);return}
 for(const row of list){
  const item=document.createElement('article');item.className='bm184-session';
  const info=document.createElement('div');
  const title=document.createElement('strong');title.textContent=row.cardId+' · '+row.rating+' · '+row.day;
  const details=document.createElement('p');details.textContent=row.discipline+
    (row.subject?' › '+row.subject:'')+' · próxima revisão local: '+row.due;
  info.append(title,details);
  const text=document.createElement('details');const summary=document.createElement('summary');summary.textContent='Resposta e anotação';
  text.append(summary);
  const attempt=document.createElement('p');attempt.style.whiteSpace='pre-wrap';attempt.textContent='Sua resposta: '+row.answer;
  const note=document.createElement('p');note.style.whiteSpace='pre-wrap';note.textContent='Observação: '+(row.note||'—');
  text.append(attempt,note);info.append(text);
  item.append(info);host.append(item);
 }
}
function sources(){
 return typeof cards!=='undefined'&&Array.isArray(cards)?cards.filter(c=>c&&(c.active!==false||c.provisional)&&
 /^(CARD-\d{4,}|PROP-IJUI-\d+|IJUI-[A-Za-z0-9_-]+)$/.test(String(c.id||''))):[];
}
function fillTopics(){
 const discipline=$('bm184-pr-discipline').value,sel=$('bm184-pr-subject'),previous=sel.value;
 sel.replaceChildren(new Option('Todos os assuntos','all'));
 const topics=[...new Set(all.filter(c=>discipline==='all'||c.discipline===discipline).map(c=>c.subject).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'pt-BR'));
 for(const topic of topics)sel.add(new Option(topic,topic));
 sel.value=topics.includes(previous)?previous:'all';
}
async function load(){
 if(typeof loadCards!=='function')throw Error('Biblioteca de cartões indisponível.');
 await loadCards();all=sources();
 if(!all.length)throw Error('Nenhum cartão ativo disponível. Confira a biblioteca.');
 const disciplines=[...new Set(all.map(c=>c.discipline||'Outros'))].sort((a,b)=>a.localeCompare(b,'pt-BR'));
 const sel=$('bm184-pr-discipline'),previous=sel.value;
 sel.replaceChildren(new Option('Todas as disciplinas','all'));
 for(const d of disciplines)sel.add(new Option(d,d));
 sel.value=disciplines.includes(previous)?previous:'all';fillTopics();showTime();
}
function plannedQueue(){
 const discipline=$('bm184-pr-discipline').value,subject=$('bm184-pr-subject').value,mode=$('bm184-pr-mode').value,today=db.localDay();
 const candidates=all.filter(c=>(discipline==='all'||c.discipline===discipline)&&(subject==='all'||c.subject===subject));
 const records=candidates.map(c=>({card:c,last:db.latest(c.id)}));
 return records.filter(x=>mode==='all'?true:mode==='new'?!x.last:
    (!x.last||x.last.due<=today))
  .sort((a,b)=>{
   if(mode==='all')return a.card.id.localeCompare(b.card.id);
   const pa=a.last?0:1,pb=b.last?0:1;if(pa!==pb)return pa-pb;
   if(a.last&&b.last){const due=a.last.due.localeCompare(b.last.due);if(due)return due;
    const priority={Errei:0,'Difícil':1,Bom:2,'Fácil':3};
    const rank=(priority[a.last.rating]??4)-(priority[b.last.rating]??4);if(rank)return rank}
   return a.card.id.localeCompare(b.card.id);
  }).map(x=>x.card).slice(0,Number($('bm184-pr-limit').value)||20);
}
function renderCard(){
 $('bm184-pr-feedback').textContent='';
 $('bm184-pr-next').hidden=true;
 $('bm184-pr-back-box').hidden=true;
 $('bm184-pr-reveal').disabled=false;$('bm184-pr-dontknow').disabled=false;
 $('bm184-pr-ratings').querySelectorAll('button').forEach(button=>button.disabled=false);
 $('bm184-pr-answer').value='';$('bm184-pr-note').value='';
 $('bm184-pr-end').hidden=true;
 if(!current){$('bm184-pr-card').hidden=true;$('bm184-pr-feedback').textContent='Todos os cartões desta fila foram concluídos. Encerre a sessão para registrar o tempo.';return}
 questionAt=currentMs();
 $('bm184-pr-card').hidden=false;
 $('bm184-pr-id').textContent=current.id+(current.provisional?' · Ijuí operacional':'');
 $('bm184-pr-front').textContent=current.front||'Pergunta ausente';
 $('bm184-pr-meta').textContent=[current.discipline,current.subject,current.sub].filter(Boolean).join(' › ');
 $('bm184-pr-progress').textContent='Cartão '+(done+1)+' de '+queue.length+' · '+done+' concluído(s)';
 $('bm184-pr-answer').focus({preventScroll:true});
}
function reveal(){
 if(!current)return;
 const input=$('bm184-pr-answer');
 if(!input.value.trim()){$('bm184-pr-feedback').textContent='Responda primeiro ou clique em “Não sei responder”.';input.focus();return}
 $('bm184-pr-reveal').disabled=true;$('bm184-pr-dontknow').disabled=true;
 $('bm184-pr-back-box').hidden=false;
 $('bm184-pr-back').textContent=current.back||'Verso original não cadastrado; não considere este registro gabarito validado.';
 $('bm184-pr-explanation').replaceChildren();
 for(const [label,value] of [['Explicação complementar',current.expl],['Macete específico',current.mnemonic],['Fonte / referência',current.reference]]){
  if(!value)continue;const p=document.createElement('p');const b=document.createElement('strong');b.textContent=label+': ';
  p.append(b,document.createTextNode(String(value)));$('bm184-pr-explanation').append(p);
 }
 $('bm184-pr-feedback').textContent='Compare sua resposta com o verso original e registre a avaliação. A classificação é manual.';
}
async function start(){
 if(active||finished){$('bm184-pr-status').textContent=finished?'Finalize o registro de horas da sessão anterior antes de iniciar outra.':'Já existe uma sessão em andamento. Conclua-a antes de iniciar outra.';return}
 $('bm184-pr-start').disabled=true;
 try{
  await load();queue=plannedQueue();
  if(!queue.length){$('bm184-pr-status').textContent='Nenhum cartão corresponde a esta fila. Altere a disciplina ou selecione Todos os cartões.';return}
  selectedDisc=$('bm184-pr-discipline').value;selectedSubject=$('bm184-pr-subject').value;
  clockMs=0;clockStart=0;beginClock();active=true;finished=false;seen=new Set();queuePos=0;done=0;
  current=queue[0];$('bm184-pr-end').hidden=true;$('bm184-pr-status').textContent='Prática iniciada. Os registros só são salvos após sua avaliação.';
  renderCard();if(clockTick)clearInterval(clockTick);clockTick=setInterval(showTime,1000);showTime();
 }catch(e){$('bm184-pr-status').textContent='Falha ao iniciar: '+e.message}
 finally{$('bm184-pr-start').disabled=false}
}
function grade(rating){
 if(!active||!current||$('bm184-pr-back-box').hidden||seen.has(current.id))return;
 try{
  const review=db.saveReview({cardId:current.id,rating,
   answer:$('bm184-pr-answer').value,note:$('bm184-pr-note').value,
   discipline:current.discipline||'Outros',subject:current.subject||'',
   seconds:Math.round(Math.max(0,currentMs()-questionAt)/1000)});
  seen.add(current.id);lastReview=review;done++;
  $('bm184-pr-ratings').querySelectorAll('button').forEach(b=>b.disabled=true);
  $('bm184-pr-feedback').textContent='Tentativa registrada: '+rating+
   ' · previsão local de revisão em '+review.due+' ('+review.interval+' dias). Não foi lançado no SRS canônico.';
  $('bm184-pr-next').hidden=false;$('bm184-pr-progress').textContent=done+' de '+queue.length+' cartões avaliados';
  showTime();displayHistory();
 }catch(error){$('bm184-pr-feedback').textContent='Não foi possível salvar a tentativa: '+error.message}
}
function nextCard(){
 if(!active||!current||!seen.has(current.id))return;
 queuePos++;current=queue[queuePos]||null;
 $('bm184-pr-ratings').querySelectorAll('button').forEach(b=>b.disabled=false);
 renderCard();
}
function finish(){
 if(!active){$('bm184-pr-status').textContent='Nenhuma prática em andamento.';return}
 if(current&&$('bm184-pr-answer').value.trim()&&!seen.has(current.id)&&
 !confirm('Existe resposta não avaliada. Encerrar sem registrar esta tentativa?'))return;
 stopClock();active=false;clearInterval(clockTick);clockTick=0;finished=true;
 $('bm184-pr-card').hidden=true;$('bm184-pr-end').hidden=false;
 $('bm184-pr-end-text').textContent=done+' cartão(ões) avaliados · '+formatTime(Math.round(clockMs/1000))+
  ' de estudo com a página visível. Escolha se deseja lançar esse tempo no calendário.';
 $('bm184-pr-progress').textContent='Sessão encerrada · '+done+' tentativas';
}
function logTime(){
 if(!finished)return;
 try{
  if(!done)throw Error('Nenhum cartão foi avaliado. Não foi lançado tempo.');
  const mins=Math.max(1,Math.ceil(clockMs/60000));
  const row=db.saveSession({day:db.localDay(),discipline:selectedDisc==='all'?'Múltiplas disciplinas':selectedDisc,
   subject:selectedSubject==='all'?'Prática de cartões':selectedSubject,activity:'Flashcards',minutes:mins,
   note:$('bm184-pr-session-note').value||done+' cartão(ões) avaliados no modo de prática V184.'});
  $('bm184-pr-end').hidden=true;finished=false;
  $('bm184-pr-status').textContent='Registradas '+mins+' minuto(s) em '+row.discipline+' no calendário. Evite lançar o mesmo tempo manualmente.';
  window.BM184StudyCalendar?.refresh?.();
 }catch(e){$('bm184-pr-status').textContent='Não foi possível lançar horas: '+e.message}
}
function open(){
 if(typeof section==='function')section('pratica');
 else{document.querySelectorAll('main > section').forEach(x=>x.classList.toggle('active',x===root))}
 if(active)beginClock();
 displayHistory();
 void load().catch(e=>{$('bm184-pr-status').textContent=e.message});
}
nav.addEventListener('click',e=>{if(!active)return;const btn=e.target.closest('button[data-page]');if(!btn)return;if(btn.dataset.page==='pratica')beginClock();else stopClock()},true);
navBtn.onclick=open;
$('bm184-pr-discipline').onchange=fillTopics;
$('bm184-pr-start').onclick=()=>{void start()};
$('bm184-pr-reveal').onclick=reveal;
$('bm184-pr-dontknow').onclick=()=>{$('bm184-pr-answer').value='Não soube responder.';reveal()};
$('bm184-pr-ratings').onclick=e=>{const b=e.target.closest('button[data-rating]');if(b&&!b.disabled)grade(b.dataset.rating)};
$('bm184-pr-next').onclick=nextCard;
$('bm184-pr-finish').onclick=finish;
$('bm184-pr-stop').onclick=()=>{if(active&&done&&!confirm('Encerrar sem registrar horas? As tentativas avaliadas continuam salvas.'))return;stopClock();active=false;finished=false;current=null;clearInterval(clockTick);clockTick=0;$('bm184-pr-end').hidden=true;$('bm184-pr-card').hidden=true;$('bm184-pr-status').textContent='Prática encerrada. Tentativas já avaliadas permanecem armazenadas.'};
$('bm184-pr-save-time').onclick=logTime;
$('bm184-pr-no-time').onclick=()=>{finished=false;$('bm184-pr-end').hidden=true;$('bm184-pr-status').textContent='Tempo não lançado. Tentativas permanecem salvas.'};
$('bm184-pr-full').onclick=()=>{if(current)window.BancoMestreVisualizarCardV050?.showId?.(current.id)};
$('bm184-pr-calendar').onclick=()=>{stopClock();window.BM141Calendar?.open?.();if(typeof section==='function')section('calendario')};
function startCard(id){
 if(active||finished){$('bm184-pr-status').textContent='Encerre e finalize as horas da sessão atual antes de iniciar pelo cartão '+id+'.';return}
 open();
 void load().then(()=>{
  const c=all.find(x=>x.id===id);if(!c)throw Error('Cartão não encontrado: '+id);
  queue=[c];queuePos=0;done=0;clockMs=0;clockStart=0;active=true;beginClock();current=c;
  selectedDisc=c.discipline||'Outros';selectedSubject=c.subject||'';seen=new Set();finished=false;
  $('bm184-pr-ratings').querySelectorAll('button').forEach(b=>b.disabled=false);
  renderCard();clearInterval(clockTick);clockTick=setInterval(showTime,1000);
  $('bm184-pr-status').textContent='Prática iniciada pelo cartão '+id+'.';
 }).catch(e=>{$('bm184-pr-status').textContent=e.message});
}

function attachReaderButton(){
 const c=document.querySelector('#bmCardPeekV050 .bm163-preview-controls');
 if(!c||document.getElementById('bm184-reader-practice'))return;
 const button=document.createElement('button');button.type='button';button.id='bm184-reader-practice';
 button.textContent='Praticar este cartão';
 button.onclick=()=>{const id=window.BancoMestreVisualizarCardV050?.currentId;
  if(!id)return;window.BancoMestreVisualizarCardV050.close();
  startCard(id);
 };
 c.append(button);
}
attachReaderButton();displayHistory();
window.BM184Practice=Object.freeze({open,start,startCard,finish,get active(){return active},get reviewed(){return done},get lastReview(){return lastReview}});
if(location.hash==='#pratica')open();
})();
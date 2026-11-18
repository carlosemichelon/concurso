/* V242 | Lacunas vinculadas a flashcards; dados privados, sem alteracao de SRS. */
(function(){
'use strict';
if(window.BM242Lacunas)return;
const KEY='BM_LACUNAS_V242',types=['Conceitual','Memorização','Aplicação','Interpretação','Desatenção','Pesquisa'],
 coverage=['Não auditada','Direta','Indireta','Parcial','Ausente'],
 stages=['Identificada','Explicada','Em reforço','Dominada'];
const $=id=>document.getElementById(id), blank=()=>({schema:1,records:[],log:[],updatedAt:null});
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const norm=s=>String(s??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
function validate(d){
 if(!d||d.schema!==1||!Array.isArray(d.records)||!Array.isArray(d.log))throw Error('Esquema inválido');
 const ids=new Set();
 for(const r of d.records){
  if(typeof r.id!=='string'||!/^LAC-/.test(r.id)||ids.has(r.id))throw Error('ID inválido ou repetido');
  ids.add(r.id);
  if(!Array.isArray(r.cardIds)||r.cardIds.some(x=>typeof x!=='string'))throw Error('Cartões inválidos');
  if(typeof r.relatoEstudante!=='string'||typeof r.diagnosticoAssistente!=='string')throw Error('Autoria inválida');
  if(!coverage.includes(r.cobertura)||!stages.includes(r.etapa)||!Array.isArray(r.historico))throw Error('Estado ou histórico inválido');
 }
 return d;
}
function load(){
 try{const s=localStorage.getItem(KEY);return s?validate(JSON.parse(s)):blank()}
 catch(e){console.error('Lacunas V242: bloqueio seguro de dados ilegíveis',e);return null}
}
let data=load(),persisted=data?JSON.stringify(data):null,
 persistedRaw=localStorage.getItem(KEY),syncState='Local: Drive ainda não conferido';
function write(event,r){
 if(!data)throw Error('Dados inválidos: escrita bloqueada');
 const current=localStorage.getItem(KEY);
 // A imagem persistida é o ponto de recuperação; callbacks já podem ter alterado data.
 if(current!==persistedRaw){
  data=load();persisted=data?JSON.stringify(data):null;persistedRaw=current;render();
  throw Error('Outra aba modificou as lacunas. Atualizamos a leitura, sem sobrescrever alterações concorrentes.');
 }
 const at=new Date().toISOString();
 try{
  data.updatedAt=at;data.log.push({id:crypto.randomUUID(),at,event,lacunaId:r?.id||null});
  validate(data);
  const encoded=JSON.stringify(data);
  localStorage.setItem(KEY,encoded);
  persisted=encoded;persistedRaw=encoded;
 }catch(e){
  data=persisted?JSON.parse(persisted):blank();
  render();
  throw Error('Gravação local cancelada e restaurada: '+e.message);
 }
 syncState='Lacunas: alterações locais ainda não verificadas no Drive';
 render();document.dispatchEvent(new CustomEvent('bm242-lacunas-change',{detail:{at}}));
}
function applyRemote(d){
 validate(d);const old=localStorage.getItem(KEY);
 if(old)localStorage.setItem('BM242_LACUNAS_RECUPERACAO_'+new Date().toISOString().replace(/[:.]/g,'-'),old);
 const encoded=JSON.stringify(d);
 localStorage.setItem(KEY,encoded);data=structuredClone(d);persisted=encoded;persistedRaw=encoded;
 syncState='Lacunas: importação concluída localmente; confirmação Drive pendente';render();
}
function cards(raw){
 const v=[...new Set(String(raw||'').split(/[;,\s]+/).map(x=>x.trim()).filter(Boolean))];
 if(v.some(x=>!(/^[a-z0-9][a-z0-9_-]{2,45}$/i.test(x))))throw Error('IDs de cartões inválidos');
 return v;
}
function install(){
 if($('lacunas'))return;
 const nav=document.querySelector('header nav[aria-label="Seções"]')||document.querySelector('header nav'),main=document.querySelector('main');
 if(!nav||!main)return;
 const button=document.createElement('button');button.id='bm242-nav';button.type='button';button.dataset.page='lacunas';button.textContent='Lacunas';
 const related=[...nav.querySelectorAll('button')].find(x=>x.dataset.page==='cartoes');if(related)related.after(button);else nav.append(button);
 const section=document.createElement('section');section.id='lacunas';
 section.innerHTML=[
 '<div class="bm242-shell"><h2>Lacunas de conhecimento e cartões</h2>',
 '<p class="bm242-muted">Registre o motivo do erro ou da dúvida; o flashcard continua sendo a unidade de revisão. Consulta sem alteração de SRS.</p>',
 '<p class="bm242-status" id="bm242-state" role="status"></p>',
 '<div class="bm242-filters">',
 '<label>Pesquisar assunto, fórmula, dúvida ou cartão<input id="bm242-search" type="search" placeholder="Ex.: fluência pós-carga; PETRO14-C014"></label>',
 '<label>Disciplina<select id="bm242-discipline"><option value="">Todas</option></select></label>',
 '<label>Assunto geral<select id="bm242-general"><option value="">Todos</option></select></label>',
 '<label>Assunto específico<select id="bm242-specific"><option value="">Todos</option></select></label>',
 '<label>Subassunto<select id="bm242-sub"><option value="">Todos</option></select></label>',
 '<label>Prioridade<select id="bm242-priority"><option value="">Todas</option></select></label>',
 '<label>Tipo<select id="bm242-type"><option value="">Todos</option></select></label>',
 '<label>Cobertura<select id="bm242-cover"><option value="">Todas</option></select></label>',
 '<label>Situação<select id="bm242-stage"><option value="">Todas</option></select></label>',
 '</div><p class="bm242-muted" id="bm242-count"></p><div id="bm242-list"></div>',
 '<details id="bm242-new" class="bm242-form"><summary>Registrar lacuna de questão, pesquisa ou dúvida</summary>',
 '<form id="bm242-form"><div class="bm242-fields">',
 '<label>Origem<select name="origem"><option>Questão</option><option>Dúvida</option><option>Pesquisa</option><option>Leitura</option><option>Revisão</option></select></label>',
 '<label>ID da questão<input name="questaoId" maxlength="100" placeholder="Se houver"></label>',
 '<label>IDs dos cartões relacionados<input name="cardIds" maxlength="500" placeholder="Separados por vírgula"></label>',
 '<label>Disciplina<input name="disciplina" maxlength="150"></label>',
 '<label>Assunto geral<input name="assuntoGeral" maxlength="150"></label>',
 '<label>Assunto específico<input name="assuntoEspecifico" maxlength="150"></label>',
 '<label>Subassunto<input name="subassunto" maxlength="150"></label>',
 '<label>Tipo<select name="tipo"></select></label><label>Cobertura<select name="cobertura"></select></label>',
 '<label>Prioridade<select name="prioridade"><option>Normal</option><option>Alta</option><option>Baixa</option></select></label>',
 '</div>',
 '<label>Enunciado da questão (opcional; preservação textual)<textarea rows="3" name="enunciado"></textarea></label>',
 '<label>Minha resposta / alternativa marcada (opcional)<textarea rows="2" name="respostaEstudante"></textarea></label>',
 '<label>Gabarito oficial (opcional)<input name="gabarito" maxlength="400" placeholder="Sem resposta, deixe vazio"></label>',
 '<label>Por que errei? / O que não compreendi? — relato literal do estudante<textarea rows="3" name="relatoEstudante"></textarea></label>',
 '<label>Descrição da lacuna ou conhecimento a pesquisar<textarea rows="2" name="descricao" required></textarea></label>',
 '<label>Fontes, normas, edições e páginas<textarea rows="2" name="fonte"></textarea></label>',
 '<label>Pesquisa complementar ou proposta de cartão (não cria cartão automaticamente)<textarea rows="2" name="pesquisa"></textarea></label>',
 '<p class="bm242-muted">O relato será preservado literalmente. O diagnóstico do assistente só será apresentado quando existir um registro auditado com autoria própria; cobertura selecionada manualmente não equivale a auditoria.</p>',
 '<button type="submit">Salvar lacuna localmente</button></form></details>',
 '<div class="bm242-actions"><button id="bm242-export" type="button">Exportar JSON</button>',
 '<label>Importar backup JSON<input id="bm242-import" type="file" accept=".json,application/json"></label></div>',
 '<p id="bm242-form-msg" role="status"></p>',
 '<p class="bm242-muted">Sincronização privada somente após autorização e confirmação pelo botão único do Drive. Dados pessoais não vão ao GitHub.</p></div>'
 ].join('');
 main.append(section);
 button.onclick=()=>{if(typeof window.section==='function')window.section('lacunas');else{main.querySelectorAll('section').forEach(x=>x.classList.toggle('active',x===section));nav.querySelectorAll('button').forEach(x=>x.classList.toggle('active',x===button));location.hash='lacunas'}};
 for(const id of ['bm242-search','bm242-discipline','bm242-general','bm242-specific','bm242-sub','bm242-type','bm242-cover','bm242-stage','bm242-priority']){
  $(id).addEventListener('input',render);$(id).addEventListener('change',render);
 }
 for(const t of types)$('bm242-form').elements.tipo.add(new Option(t,t));
 for(const c of coverage)$('bm242-form').elements.cobertura.add(new Option(c,c));
 $('bm242-form').addEventListener('submit',e=>{
  e.preventDefault();
  try{
   const f=e.currentTarget,v=new FormData(f),g=k=>String(v.get(k)||'').trim();
   if(!data)throw Error('Cadastro indisponível');
   if(g('descricao').length<5)throw Error('Descreva a lacuna com pelo menos cinco caracteres');
   const now=new Date().toISOString(),linked=cards(g('cardIds'));
   const r={id:'LAC-'+now.replace(/[-:.TZ]/g,'')+'-'+crypto.randomUUID().slice(0,8).toUpperCase(),
    createdAt:now,updatedAt:now,origem:g('origem'),questaoId:g('questaoId'),cardIds:linked,
    disciplina:g('disciplina'),assuntoGeral:g('assuntoGeral'),assuntoEspecifico:g('assuntoEspecifico'),subassunto:g('subassunto'),
    tipo:g('tipo'),cobertura:g('cobertura'),prioridade:g('prioridade'),etapa:'Identificada',
    enunciado:String(v.get('enunciado')||''),respostaEstudante:String(v.get('respostaEstudante')||''),gabarito:g('gabarito'),
    relatoEstudante:String(v.get('relatoEstudante')||''),diagnosticoAssistente:'',diagnosticoConfianca:'',diagnosticoEvidencias:'',
    descricao:g('descricao'),fonte:g('fonte'),pesquisa:g('pesquisa'),auditoriaStatus:'Cobertura declarada manualmente; não auditada pelo portal',
    resolucaoEvidencia:'',historico:[]};
   const key=x=>norm(x.questaoId)+'|'+norm(x.descricao)+'|'+x.cardIds.slice().sort().join(',');
   if(data.records.some(x=>key(x)===key(r)))throw Error('Registro equivalente já existe; duplicação evitada');
   data.records.push(r);write('lacuna_criada',r);f.reset();$('bm242-new').open=false;
   $('bm242-form-msg').textContent=r.id+' gravada no navegador; sincronização Drive não presumida';
  }catch(err){$('bm242-form-msg').textContent=err.message}
 });
 $('bm242-list').addEventListener('click',e=>{
  const open=e.target.closest('button[data-open]');
  if(open){
   if(!window.BancoMestreVisualizarCardV050?.showId?.(open.dataset.open,open))
    $('bm242-form-msg').textContent='Cartão '+open.dataset.open+' não disponível no leitor atual; vínculo preservado como pendente.';
   return;
  }
  const fill=e.target.closest('button[data-fill]');
  if(fill&&data){
   const r=data.records.find(x=>x.id===fill.dataset.fill);if(!r)return;
   const note=prompt(r.relatoEstudante?'Acrescente uma observação posterior (o relato literal original será preservado):':'Registre com suas palavras por que errou ou não compreendeu:');
   if(note===null||!note.trim())return;
   r.updatedAt=new Date().toISOString();
   if(!r.relatoEstudante)r.relatoEstudante=note;
   else r.historico.push({at:r.updatedAt,evento:'complemento_estudante',nota:note});
   write('relato_ou_complemento_adicionado',r);return;
  }
  const noteBtn=e.target.closest('button[data-note]');
  if(noteBtn&&data){
   const r=data.records.find(x=>x.id===noteBtn.dataset.note);if(!r)return;
   const note=prompt('Acrescente uma pesquisa, evidência, observação ou fonte (não altera o relato original):');
   if(note===null||!note.trim())return;
   r.updatedAt=new Date().toISOString();
   r.historico.push({at:r.updatedAt,evento:'complemento',nota:note});
   write('complemento_adicionado',r);return;
  }
  const change=e.target.closest('button[data-stage]');if(!change||!data)return;
  const r=data.records.find(x=>x.id===change.dataset.stage);if(!r)return;
  const next=change.dataset.next;if(!stages.includes(next))return;
  let ev='';
  if(next==='Dominada'){
   ev=prompt('Qual evidência de recuperação ativa ou aplicação correta justifica o domínio?');
   if(ev===null)return;
   if(ev.trim().length<12){alert('Registre evidência concreta; leitura isolada não comprova domínio');return}
  }
  const previous=r.etapa;r.etapa=next;r.updatedAt=new Date().toISOString();
  if(ev)r.resolucaoEvidencia=ev.trim();
  r.historico.push({at:r.updatedAt,from:previous,to:next,evidencia:ev.trim()});
  write('etapa_atualizada',r);
 });
 $('bm242-export').onclick=()=>{
  if(!data)return;
  const blob=new Blob([JSON.stringify({format:'BancoMestreLacunasV242',data},null,2)],{type:'application/json'});
  const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='BancoMestre_Lacunas_V242.json';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),500);
 };
 $('bm242-import').onchange=async e=>{
  const file=e.target.files?.[0];if(!file)return;
  try{
   if(file.size>5000000)throw Error('Backup excede 5 MB');
   const o=JSON.parse(await file.text());
   if(o.format!=='BancoMestreLacunasV242')throw Error('Formato de backup inválido');
   validate(o.data);
   if(!confirm('Substituir cadastro local, preservando a cópia anterior para recuperação?'))return;
   applyRemote(o.data);$('bm242-form-msg').textContent='Backup importado localmente';
  }catch(err){$('bm242-form-msg').textContent=err.message}
  finally{e.target.value=''}
 };
 document.addEventListener('bm242-lacunas-drive-status',e=>{syncState=e.detail?.message||syncState;render()});
 window.addEventListener('storage',e=>{if(e.key===KEY){data=load();persisted=data?JSON.stringify(data):null;persistedRaw=e.newValue;render()}});
 document.addEventListener('bm242-open-lacuna',()=>{button.click();$('bm242-new').open=true;$('bm242-new').scrollIntoView({block:'start'})});
 window.addEventListener('message',e=>{
  if(e.origin!==location.origin||e.data?.type!=='bm242-open-lacuna'||e.source!==$('bm238-study-frame')?.contentWindow)return;
  document.dispatchEvent(new Event('bm242-open-lacuna'));
  const context=e.data.context||{},f=$('bm242-form');
  if(f&&context.discipline&&!/^escolha/i.test(context.discipline))f.elements.disciplina.value=String(context.discipline).slice(0,150);
  if(f&&context.topic)f.elements.subassunto.value=String(context.topic).slice(0,150);
 });
 if(location.hash==='#lacunas')button.click();
 render();
}
function render(){
 if(!$('bm242-state'))return;
 $('bm242-state').textContent=data?syncState:'Dados locais inválidos: escrita bloqueada e originais preservados';
 if(!data){$('bm242-list').textContent='Importe uma cópia válida para recuperar o cadastro';return}
 function select(id,values,all){
  const el=$(id),keep=el.value;el.replaceChildren(new Option(all,''));
  for(const v of values)el.add(new Option(v,v));
  el.value=[...el.options].some(x=>x.value===keep)?keep:'';
 }
 select('bm242-discipline',[...new Set(data.records.map(x=>x.disciplina).filter(Boolean))].sort(),'Todas');
 const discipline=$('bm242-discipline').value;
 const byDisc=data.records.filter(x=>!discipline||x.disciplina===discipline);
 select('bm242-general',[...new Set(byDisc.map(x=>x.assuntoGeral).filter(Boolean))].sort(),'Todos');
 const gen=$('bm242-general').value;
 const byGeneral=byDisc.filter(x=>!gen||x.assuntoGeral===gen);
 select('bm242-specific',[...new Set(byGeneral.map(x=>x.assuntoEspecifico).filter(Boolean))].sort(),'Todos');
 const specific=$('bm242-specific').value;
 const bySpecific=byGeneral.filter(x=>!specific||x.assuntoEspecifico===specific);
 select('bm242-sub',[...new Set(bySpecific.map(x=>x.subassunto).filter(Boolean))].sort(),'Todos');
 select('bm242-priority',[...new Set(data.records.map(x=>x.prioridade).filter(Boolean))].sort(),'Todas');
 select('bm242-type',types.filter(x=>data.records.some(r=>r.tipo===x)),'Todos');
 select('bm242-cover',coverage.filter(x=>data.records.some(r=>r.cobertura===x)),'Todas');
 select('bm242-stage',stages.filter(x=>data.records.some(r=>r.etapa===x)),'Todas');
 const q=norm($('bm242-search').value),d=$('bm242-discipline').value,t=$('bm242-type').value,
 g=$('bm242-general').value,sp=$('bm242-specific').value,sub=$('bm242-sub').value,p=$('bm242-priority').value,
 c=$('bm242-cover').value,s=$('bm242-stage').value;
 const filtered=data.records.filter(r=>(!d||r.disciplina===d)&&(!g||r.assuntoGeral===g)&&(!sp||r.assuntoEspecifico===sp)&&(!sub||r.subassunto===sub)&&(!p||r.prioridade===p)&&(!t||r.tipo===t)&&(!c||r.cobertura===c)&&(!s||r.etapa===s)&&
 (!q||norm([r.id,r.descricao,r.relatoEstudante,r.diagnosticoAssistente,r.enunciado,r.respostaEstudante,r.gabarito,r.questaoId,...r.cardIds,r.disciplina,r.assuntoGeral,r.assuntoEspecifico,r.subassunto,r.fonte,r.pesquisa].join(' ')).includes(q)));
 $('bm242-count').textContent=filtered.length+' de '+data.records.length+' lacunas · '+data.log.length+' eventos de histórico';
 $('bm242-list').innerHTML=filtered.length?filtered.slice().reverse().map(r=>{
  const links=r.cardIds.map(id=>'<button data-open="'+esc(id)+'" type="button">Abrir '+esc(id)+' no leitor</button>').join(' ')||'<em>Cartão a auditar</em>';
  const next=r.etapa==='Identificada'?'Explicada':r.etapa==='Explicada'?'Em reforço':r.etapa==='Em reforço'?'Dominada':'';
  return '<article class="bm242-item"><strong>'+esc(r.descricao)+'</strong> <code>'+esc(r.id)+'</code>'+
  '<p>'+esc([r.disciplina,r.assuntoGeral,r.assuntoEspecifico,r.subassunto].filter(Boolean).join(' › '))+'</p>'+
  '<p class="bm242-muted">'+esc(r.tipo)+' · '+esc(r.cobertura)+' · '+esc(r.etapa)+' · '+esc(r.prioridade)+'</p>'+
  (r.enunciado?'<details><summary>Enunciado e tentativa</summary><p>'+esc(r.enunciado)+'</p><p><b>Resposta registrada:</b> '+esc(r.respostaEstudante||'não informada')+'</p><p><b>Gabarito:</b> '+esc(r.gabarito||'não informado')+'</p></details>':'')+
  (r.relatoEstudante?'<p><b>Relato literal:</b> '+esc(r.relatoEstudante)+'</p>':'')+
  (r.diagnosticoAssistente?'<p><b>Diagnóstico do assistente ('+esc(r.diagnosticoConfianca||'não confirmado')+'):</b> '+esc(r.diagnosticoAssistente)+'</p>':'')+
  '<p><b>Origem:</b> '+esc(r.origem)+(r.questaoId?' · '+esc(r.questaoId):'')+'</p>'+
  (r.pesquisa?'<p><b>Pesquisa:</b> '+esc(r.pesquisa)+'</p>':'')+
  '<div class="bm242-actions">'+links+'<button type="button" data-fill="'+esc(r.id)+'">'+(r.relatoEstudante?'Complementar relato':'Informar por que errei')+'</button>'+'<button type="button" data-note="'+esc(r.id)+'">Adicionar nota/fonte</button>'+(next?'<button type="button" data-stage="'+esc(r.id)+'" data-next="'+esc(next)+'">Avançar para '+esc(next)+'</button>':'')+'</div>'+
  '<details><summary>Fonte, auditoria e histórico</summary><p>'+esc(r.fonte||'Sem fonte cadastrada')+'</p><p>'+esc(r.auditoriaStatus)+'</p><p>Origem: '+esc(r.createdAt)+'</p><p>Evidência de domínio: '+esc(r.resolucaoEvidencia||'nenhuma')+'</p>'+r.historico.map(h=>'<p>'+esc(h.at||'')+' · '+esc(h.evento||h.to||'registro')+' · '+esc(h.nota||h.evidencia||'')+'</p>').join('')+'</details></article>';
 }).join(''):'<p class="bm242-muted">Nenhuma lacuna cadastrada ou localizada com estes filtros.</p>';
}
window.BM242Lacunas=Object.freeze({get data(){return data?structuredClone(data):null},validate,applyRemote,render,openForm(){document.dispatchEvent(new Event('bm242-open-lacuna'))}});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();
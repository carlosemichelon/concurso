/* Banco Mestre V166 — leitor único e independente, com resposta e classificação local.
   Não altera JSON canônico, SRS oficial, histórico F17, Drive nem IDs. */
(function(){
'use strict';
if(window.BM166Reader)return;
const root=document.getElementById('cardRows');
if(!root){console.error('BM166: #cardRows ausente');return}
const valid=/^(?:CARD-\d{4,}|PROP-IJUI-\d+|IJUI-[a-z0-9_-]+)$/i;
const storagePrefix='BM_V037_CARTAO_GUIA_';
const ratingsKey='BM_V166_AVALIACOES_LOCAIS_V1';
const days={Errei:4,'Difícil':8,Bom:16,'Fácil':28};
const newEl=(t,cls,text)=>{const x=document.createElement(t);if(cls)x.className=cls;if(text!==undefined)x.textContent=String(text);return x};
const btn=(txt,cls)=>{const x=newEl('button',cls,txt);x.type='button';return x};
const cardsList=()=>typeof cards!=='undefined'&&Array.isArray(cards)?cards:[];
const get=id=>cardsList().find(x=>x.id===id)||null;
const idOf=a=>a?.querySelector(':scope > .tag')?.textContent?.trim()||'';
const norm=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const legal=c=>!!c&&(c.provisional||c.group==='LEGISLACAO'||/legisla|direito|jur[ií]dic|constitucional/i.test(c.discipline||''));
function readLocal(key,defaultValue){try{const o=JSON.parse(localStorage.getItem(key)||'null');return o===null?defaultValue:o}catch{return defaultValue}}
function saveLocal(key,value){try{localStorage.setItem(key,JSON.stringify(value));return true}catch(e){status.textContent='Falha ao salvar neste navegador: '+e.message;return false}}
function responseRecord(id){const x=readLocal(storagePrefix+id,{id,history:[],answer:''});if(!x||typeof x!=='object')return{id,history:[],answer:''};if(!Array.isArray(x.history))x.history=[];return x}
const surface=newEl('div','bm166-overlay');surface.id='bm166-overlay';surface.hidden=true;
const backdrop=newEl('div','bm166-backdrop');
const modal=newEl('section','bm166-dialog');modal.tabIndex=-1;modal.setAttribute('role','dialog');modal.setAttribute('aria-modal','true');modal.setAttribute('aria-labelledby','bm166-title');
const header=newEl('header','bm166-header');
const titleBox=newEl('div','bm166-titlebox');titleBox.append(newEl('small','bm166-eyebrow','BANCO MESTRE · ESTUDO'),newEl('strong','bm166-title','Cartão'));
const title=titleBox.querySelector('strong');title.id='bm166-title';
const headerButtons=newEl('div','bm166-header-buttons');
const toggleAside=btn('Outros cartões','bm166-toggle-aside');toggleAside.setAttribute('aria-expanded','false');
const prev=btn('← Anterior','bm166-prev'),next=btn('Próximo →','bm166-next'),closeButton=btn('Fechar ✕','bm166-close');
headerButtons.append(toggleAside,prev,next,closeButton);header.append(titleBox,headerButtons);
const layout=newEl('div','bm166-layout');
const aside=newEl('aside','bm166-aside');aside.setAttribute('aria-label','Outros cartões');
const asideHead=newEl('div','bm166-aside-head');
const asideTitle=newEl('strong','','Outros cartões'),asideCount=newEl('small','bm166-aside-count','');
const search=newEl('input','bm166-search');search.type='search';search.placeholder='Buscar ID, pergunta ou assunto';search.setAttribute('aria-label','Buscar cartão');
asideHead.append(asideTitle,asideCount,search);
const fullLabel=newEl('label','bm166-all-label');
const fullCheck=newEl('input');fullCheck.type='checkbox';
fullLabel.append(fullCheck,document.createTextNode('Pesquisar toda a base'));
const list=newEl('nav','bm166-card-list');list.setAttribute('aria-label','Selecionar outro cartão');
aside.append(asideHead,fullLabel,list);
const content=newEl('main','bm166-content');content.tabIndex=0;
const eyebrow=newEl('small','bm166-overline','PERGUNTA');
const question=newEl('h2','bm166-question');
const subject=newEl('p','bm166-subject');
const guide=newEl('p','bm166-guide','Tente responder antes de consultar. Esta visualização não cria revisões automaticamente.');
const form=newEl('section','bm166-write');
const formTitle=newEl('h3','','Minha resposta');
const textarea=newEl('textarea','bm166-textarea');
textarea.rows=5;textarea.placeholder='Responda com suas palavras antes de revelar o verso...';
textarea.setAttribute('aria-label','Minha resposta discursiva');
const formActions=newEl('div','bm166-write-actions');
const record=btn('Registrar e comparar','bm166-submit'),consult=btn('Consultar sem registrar','bm166-consult'),copy=btn('Copiar para avaliação no ChatGPT','bm166-copy');
formActions.append(record,consult,copy);form.append(formTitle,textarea,formActions);
const status=newEl('p','bm166-status','Resposta ainda não registrada neste leitor.');status.setAttribute('role','status');
const compare=newEl('section','bm166-compare');
const compareHead=newEl('div','bm166-compare-head');
const answerBtn=btn('Revelar resposta original','bm166-show-answer');
const lawBtn=btn('Mostrar lei seca','bm166-show-law');
compareHead.append(answerBtn,lawBtn);
const answer=newEl('div','bm166-answer');answer.hidden=true;
const law=newEl('div','bm166-law');law.hidden=true;
compare.append(compareHead,law,answer);
const grade=newEl('section','bm166-grade');grade.hidden=true;
const gradeHeading=newEl('h3','','Classificar minha revisão');
const gradeHelp=newEl('p','','Avalie após comparar. A nota e o vencimento sugerido ficam somente neste navegador até exportação/conciliação com a base mestre.');
const gradeButtons=newEl('div','bm166-grade-buttons');
const gradeFeedback=newEl('p','bm166-grade-feedback');gradeFeedback.setAttribute('role','status');
grade.append(gradeHeading,gradeHelp,gradeButtons,gradeFeedback);
const trace=newEl('details','bm166-trace');
const traceSummary=newEl('summary','','Cadastro, fontes e rastreabilidade');const traceBody=newEl('div','bm166-trace-body');trace.append(traceSummary,traceBody);
const history=newEl('details','bm166-history');
const historySummary=newEl('summary','','Histórico local deste cartão');const historyBody=newEl('div','bm166-history-body');history.append(historySummary,historyBody);
content.append(eyebrow,question,subject,guide,form,status,compare,grade,history,trace);
layout.append(aside,content);
const footer=newEl('footer','bm166-footer');
const footerInfo=newEl('small','','Respostas e notas locais · não sincronizadas automaticamente com o Drive/SRS oficial.');
const exportButton=btn('Exportar respostas e classificações','bm166-export'),footerClose=btn('Voltar à biblioteca','bm166-back');
footer.append(footerInfo,exportButton,footerClose);
modal.append(header,layout,footer);surface.append(backdrop,modal);document.body.append(surface);
let selected='',query='',scopeAll=false,priorFocus=null,originalOverflow='',activeAttempt=null;
function displayRelated(){
 const all=cardsList(),c=get(selected);
 if(query.trim()){const q=norm(query.trim());return all.filter(x=>norm([x.id,x.front,x.discipline,x.subject,x.sub].join(' ')).includes(q))}
 if(scopeAll||!c)return all;
 const list=all.filter(x=>(c.provisional&&x.provisional)||(!c.provisional&&!x.provisional&&((c.group&&c.group===x.group)||(c.discipline&&c.discipline===x.discipline))));
 return list.length?list:all;
}
function refreshRelated(){
 const options=displayRelated(),currentIndex=options.findIndex(c=>c.id===selected);
 asideCount.textContent=options.length+' cartões';
 list.replaceChildren();
 let start=0;
 if(options.length>55&&currentIndex>=0)start=Math.max(0,Math.min(options.length-55,currentIndex-12));
 for(const c of options.slice(start,start+55)){
  const b=btn('','bm166-related');
  b.append(newEl('span','bm166-related-id',c.id),newEl('span','bm166-related-text',c.front||'Sem pergunta'));
  if(c.id===selected){b.classList.add('bm166-current');b.setAttribute('aria-current','true')}
  b.addEventListener('click',()=>open(c.id));
  list.append(b);
 }
 if(!options.length)list.append(newEl('p','bm166-empty','Nenhum cartão encontrado.'));
 prev.disabled=currentIndex<=0;next.disabled=currentIndex<0||currentIndex===options.length-1;
}
function go(delta){const l=displayRelated(),idx=l.findIndex(c=>c.id===selected),target=l[idx+delta];if(target)open(target.id)}
function traceLine(k,v){if(v===null||v===undefined||!String(v).trim())return;const p=newEl('p','bm166-trace-row');p.append(newEl('strong','',k+' '),document.createTextNode(String(v)));traceBody.append(p)}
function piece(label,text){if(text===null||text===undefined||!String(text).trim())return null;const x=newEl('section','bm166-piece');x.append(newEl('h4','',label),newEl('p','',text));return x}
function listPiece(label,items,formatter){if(!Array.isArray(items)||!items.length)return null;const x=newEl('section','bm166-piece');x.append(newEl('h4','',label));const ul=newEl('ul');for(const y of items)ul.append(newEl('li','',formatter(y)));x.append(ul);return x}
function group(label,items,expanded=false){const ok=items.filter(Boolean);if(!ok.length)return null;const d=newEl('details','bm166-answer-group');d.open=expanded;d.append(newEl('summary','',label));const b=newEl('div','bm166-answer-body');b.append(...ok);d.append(b);return d}
function renderAnswer(){
 const c=get(selected);if(!c)return;
 answer.replaceChildren();
 const existing=[...root.querySelectorAll('article.card')].find(a=>idOf(a)===selected)?.querySelector(':scope > details > .answer');
 if(existing?.querySelector('.richSection')){
  const buckets={study:[],fix:[],reference:[],history:[],other:[]};let primary=null;
  for(const child of existing.children){
   if(child.matches('.richSection')){
    const title=child.querySelector('h4')?.textContent||'';
    const duplicate=child.cloneNode(true);duplicate.classList.add('bm166-source-piece');
    if(!primary&&/resposta (registrada|exata do cartão)/i.test(title)){primary=duplicate;primary.classList.add('bm166-answer-primary');continue}
    const dest=/(conhecimento mínimo|resposta-modelo|explicação|cobertura|evoluções)/i.test(title)?'study':
      /(pegadinha|macete|lacuna|corrigir|compreendido|erro)/i.test(title)?'fix':
      /(fundamento|fonte|pdf|referência|versão|situação editorial)/i.test(title)?'reference':
      /(histórico|tentativa|revisão|resposta discursiva arquivada)/i.test(title)?'history':'other';
    buckets[dest].push(duplicate);
   }else if(child.matches('details.answerFold')){
    const copy=child.cloneNode(true);
    buckets[/(histórico|correç)/i.test(child.querySelector('summary')?.textContent||'')?'history':'reference'].push(copy);
   }else if(child.matches('a[href]'))buckets.reference.push(child.cloneNode(true));
  }
  answer.append(primary||piece('Verso original preservado',c.back||'Sem resposta cadastrada.'));
  for(const [k,t,expanded] of [
   ['study','Conhecimento mínimo e resposta-modelo',true],['fix','Macetes, pegadinhas e lacunas',false],
   ['reference','Fundamentos e fontes',false],['history','Histórico original e correções',false],['other','Outras informações',false]]){
   const d=group(t,buckets[k],expanded);if(d)answer.append(d);
  }
  return;
 }
 answer.append(piece('Verso original (exato)',c.back||'Sem resposta cadastrada.'));
 const g=typeof guideData!=='undefined'&&c.origin_question_id?guideData?.questoes?.[c.origin_question_id]:null;
 const learned=group('Conhecimento mínimo, resposta-modelo e explicações',[
  piece('Conhecimento mínimo',g?.resposta_minima),piece('Resposta-modelo',g?.resposta_modelo),piece('Explicação da base',c.expl)],true);
 if(learned)answer.append(learned);
 const tricks=group('Macetes, pegadinhas e lacunas',[
  piece('Macete original',c.mnemonic),piece('Pegadinhas',g?.pegadinhas),
  listPiece('Macetes relacionados',g?.macetes,m=>[m.id,m.frase,m.interpretacao,m.alerta].filter(Boolean).join(' — ')),
  listPiece('Lacunas',g?.lacunas,l=>[l.id,l.prioridade,l.fixar].filter(Boolean).join(' — '))]);
 if(tricks)answer.append(tricks);
 const f17=typeof answersF17!=='undefined'?answersF17?.por_id?.[c.id]:null;
 const audit=typeof auditF17!=='undefined'?auditF17?.historico_por_id?.[c.id]:null;
 const related=group('Histórico e fontes',[
  piece('Dispositivo',g?.dispositivo||c.reference),piece('PDF original',g?.fonte),
  piece('Tentativa histórica registrada',audit?[audit.data_local,audit.avaliacao,audit.origem_evento].filter(Boolean).join(' · '):null),
  piece('Resposta histórica F17',f17?.resposta_original_arquivada),
  listPiece('Interconexões',g?.vinculos_cartoes,v=>[v.cartao,v.tema,v.tratamento].filter(Boolean).join(' — '))]);
 if(related)answer.append(related);
}
function renderLaw(c,id){
 if(selected!==id||law.hidden)return;
 law.replaceChildren();
 const rec=window.BM163LeiSeca?.getRecord?.(id);
 if(!rec){
  law.append(newEl('strong','','Transcrição literal ainda não comprovada.'));
  law.append(newEl('p','','A resposta resumida não será exibida como lei seca.'));
  return;
 }
 law.append(newEl('h3','','Lei seca — '+rec.law+' · '+rec.article),newEl('p','bm166-law-text',rec.text));
 if(rec.notice)law.append(newEl('p','bm166-warning',rec.notice));
 if(rec.scope)law.append(newEl('small','', 'Abrangência: '+rec.scope));
 if(/^https:\/\//.test(rec.source_url||'')){
  const a=newEl('a','','Conferir dispositivo na fonte');a.href=rec.source_url;a.rel='noopener noreferrer';a.target='_blank';law.append(a);
 }
}
function renderHistory(){
 historyBody.replaceChildren();
 const saved=responseRecord(selected);
 const rows=(saved.history||[]).filter(x=>x&&typeof x.answer==='string');
 const grades=readLocal(ratingsKey,[]).filter(x=>x.id===selected);
 historySummary.textContent='Histórico local · '+rows.length+' resposta(s), '+grades.length+' classificação(ões)';
 if(!rows.length&&!grades.length){historyBody.append(newEl('p','','Nenhuma resposta ou classificação local anterior.'));return}
 for(const rec of rows.slice(-15).reverse()){
  const d=newEl('details','bm166-local-event');
  d.append(newEl('summary','',new Date(rec.at).toLocaleString('pt-BR')+' · '+(rec.rating||'Sem classificação')));
  d.append(newEl('p','',rec.answer));historyBody.append(d);
 }
}
function open(id,focus){
 if(!valid.test(id))return false;
 const c=get(id);if(!c)return false;
 if(surface.hidden){
  priorFocus=focus||document.activeElement;originalOverflow=document.body.style.overflow;
  surface.hidden=false;document.body.style.overflow='hidden';
  modal.focus({preventScroll:true});
 }
 selected=id;title.textContent='Cartão '+id;question.textContent=c.front||'Sem pergunta cadastrada';
 subject.textContent=(c.discipline||'Sem disciplina')+(c.subject?' · '+c.subject:'');
 const saved=responseRecord(id);
 textarea.value=saved.answer||'';activeAttempt=null;
 status.textContent=saved.answer?'Existe resposta anterior neste navegador; uma nova tentativa exige novo registro.':'Escreva e registre a resposta antes de classificar.';
 answer.hidden=true;answer.replaceChildren();answerBtn.textContent='Revelar resposta original';
 law.hidden=true;law.replaceChildren();lawBtn.textContent='Mostrar lei seca';lawBtn.hidden=!legal(c);
 grade.hidden=true;gradeFeedback.textContent='';
 history.open=false;trace.open=false;traceBody.replaceChildren();
 traceLine('ID:',id);traceLine('Área:',c.discipline);traceLine('Assunto:',c.subject);traceLine('Subassunto:',c.sub);
 traceLine('Referência cadastrada:',c.reference);traceLine('Questão de origem:',c.origin_question_id);
 traceLine('Natureza:',c.provisional?'Cópia operacional de Ijuí · não canônica':'Registro original da base');
 renderHistory();refreshRelated();content.scrollTop=0;return true;
}
function close(){
 if(surface.hidden)return;
 surface.hidden=true;document.body.style.overflow=originalOverflow;
 const el=priorFocus;priorFocus=null;selected='';el?.focus?.({preventScroll:true});
}
function unlock(){
 answer.hidden=false;renderAnswer();answerBtn.textContent='Ocultar resposta original';
 grade.hidden=false;
}
function attempt(){
 if(!selected)return;
 const value=textarea.value.trim();
 if(!value){status.textContent='Escreva uma resposta antes de registrar. Para consultar, use o botão específico.';textarea.focus();return}
 const data=responseRecord(selected),at=new Date().toISOString();
 const rec={id:selected,answer:value,at,type:'resposta_discursiva_nao_avaliada',attempt_id:selected+'-'+at};
 data.answer=value;data.history.push(rec);if(data.history.length>100)data.history=data.history.slice(-100);
 if(!saveLocal(storagePrefix+selected,data))return;
 activeAttempt=rec;
 status.textContent='Resposta registrada somente neste navegador, em '+new Date(at).toLocaleString('pt-BR')+'. Compare e classifique.';
 unlock();renderHistory();
}
function rate(label){
 if(!activeAttempt){gradeFeedback.textContent='Registre uma nova resposta antes de classificar esta revisão.';return}
 const interval=days[label],date=new Date();date.setDate(date.getDate()+interval);
 const due=[date.getFullYear(),String(date.getMonth()+1).padStart(2,'0'),String(date.getDate()).padStart(2,'0')].join('-');
 const data=responseRecord(selected);
 const event=data.history.find(x=>x.attempt_id===activeAttempt.attempt_id);
 if(!event){gradeFeedback.textContent='Tentativa não encontrada no histórico local; nenhum SRS lançado.';return}
 const assessments=readLocal(ratingsKey,[]);
 const prior=assessments.findIndex(x=>x.attempt_id===event.attempt_id);
 const rating={id:selected,attempt_id:event.attempt_id,answer:event.answer,answered_at:event.at,at:new Date().toISOString(),rating:label,base_interval_days:interval,proposed_due:due,status:'local_pendente_conciliacao',source:'V166'};
 if(prior<0)assessments.push(rating);else assessments[prior]=rating;
 if(!saveLocal(ratingsKey,assessments))return;
 event.rating=label;event.rating_at=rating.at;event.proposed_due=due;
 if(!saveLocal(storagePrefix+selected,data))return;
 activeAttempt=event;
 gradeFeedback.textContent=label+' registrado localmente. Prazo-base sugerido: '+interval+' dias (até '+date.toLocaleDateString('pt-BR')+'). Calendário oficial/SRS ainda não alterados.';
 renderHistory();
}
record.addEventListener('click',attempt);
consult.addEventListener('click',()=>{status.textContent='Consulta sem registrar tentativa ou SRS.';unlock()});
answerBtn.addEventListener('click',()=>{answer.hidden=!answer.hidden;if(!answer.hidden)renderAnswer();answerBtn.textContent=answer.hidden?'Revelar resposta original':'Ocultar resposta original';if(activeAttempt)grade.hidden=false});
lawBtn.addEventListener('click',()=>{
 const c=get(selected);if(!c)return;
 law.hidden=!law.hidden;lawBtn.textContent=law.hidden?'Mostrar lei seca':'Ocultar lei seca';
 if(!law.hidden){
  const id=selected;renderLaw(c,id);
  const ready=window.BM163LeiSeca?.whenReady;
  if(ready?.then)void ready.then(()=>renderLaw(c,id)).catch(()=>{});
 }
});
for(const label of ['Errei','Difícil','Bom','Fácil']){
 const b=btn(label+' · '+days[label]+'d','bm166-rating bm166-rating-'+norm(label));
 b.addEventListener('click',()=>rate(label));gradeButtons.append(b);
}
async function copyForChatGPT(){
 const c=get(selected);if(!c)return;
 const response=textarea.value.trim()||responseRecord(selected).answer;
 if(!response){status.textContent='Escreva sua resposta primeiro, para solicitar correção.';return}
 const prompt='Corrija a resposta deste cartão do Banco Mestre conforme minha Metodologia Mestre. Não registre SRS nem altere o ID automaticamente. Avalie o conhecimento mínimo, a precisão, a escrita, as lacunas, as pegadinhas e a cobertura cruzada; preserve o verso original em seção separada.\\n\\nID: '+c.id+'\\nPergunta: '+c.front+'\\nMinha resposta: '+response+'\\nVerso original: '+(c.back||'')+'\\nReferência: '+(c.reference||'');
 try{await navigator.clipboard.writeText(prompt);status.textContent='Pedido de correção copiado. Cole em uma conversa do ChatGPT para receber a avaliação detalhada.'}
 catch{status.textContent='Cópia automática indisponível. Exporte o histórico ou copie sua resposta manualmente.'}
}
copy.addEventListener('click',()=>{void copyForChatGPT()});
function exportData(){
 const answers=[];
 try{for(let i=0;i<localStorage.length;i++){const key=localStorage.key(i);if(key?.startsWith(storagePrefix))answers.push(readLocal(key,{}))}}catch(e){status.textContent='Acesso ao histórico local indisponível: '+e.message;return}
 const payload={format:'BancoMestreTentativasLocaisV166',exported_at:new Date().toISOString(),canonical_srs_modified:false,source:'navegador_local',answers,assessments:readLocal(ratingsKey,[]),revisoes:readLocal(ratingsKey,[]).map(x=>({id:x.id,due:x.proposed_due,rating:x.rating,at:x.at,source:x.source}))};
 const blob=new Blob([JSON.stringify(payload,null,2)],{type:'application/json'});
 const url=URL.createObjectURL(blob);const a=newEl('a');a.href=url;a.download='Banco_Mestre_Tentativas_e_Classificacoes_'+new Date().toISOString().slice(0,10)+'.json';
 document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
 status.textContent='Exportação solicitada. Guarde este arquivo para conciliar respostas e avaliações com o Banco Mestre.';
}
exportButton.addEventListener('click',exportData);
search.addEventListener('input',()=>{query=search.value;refreshRelated()});
fullCheck.addEventListener('change',()=>{scopeAll=fullCheck.checked;refreshRelated()});
prev.addEventListener('click',()=>go(-1));next.addEventListener('click',()=>go(1));
toggleAside.addEventListener('click',()=>{const hidden=modal.classList.toggle('bm166-aside-hidden');toggleAside.setAttribute('aria-expanded',String(!hidden));toggleAside.textContent=hidden?'Mostrar cartões':'Outros cartões'});
closeButton.addEventListener('click',close);footerClose.addEventListener('click',close);backdrop.addEventListener('click',close);
document.addEventListener('keydown',e=>{
 if(surface.hidden)return;
 if(e.key==='Escape'){e.preventDefault();close()}
 if((e.altKey||e.ctrlKey)&&e.key==='ArrowRight'){e.preventDefault();go(1)}
 if((e.altKey||e.ctrlKey)&&e.key==='ArrowLeft'){e.preventDefault();go(-1)}
});
function decorate(){
 for(const article of root.querySelectorAll('article.card')){
  const id=idOf(article);if(!valid.test(id))continue;
  article.tabIndex=0;article.title='Clique para estudar '+id+' nesta página';
  // O formulário antigo continua no HTML, mas é ocultado na biblioteca V166.
  const oldPeek=article.querySelector(':scope > .bm-v050-peek-button');if(oldPeek)oldPeek.remove();
  if(!article.querySelector(':scope > .bm166-open')){
   const b=btn('Abrir estudo','bm166-open');
   b.title='Ler e responder '+id;
   b.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();open(id,b)});
   const h=article.querySelector(':scope > h3');if(h)h.after(b);else article.prepend(b);
  }
  if(!article.querySelector(':scope > .bm166-extra')){
   const d=newEl('details','bm166-extra');
   d.append(newEl('summary','','Cadastro e referências'));
   const x=newEl('div','bm166-extra-body');
   const c=get(id);
   if(c){x.append(newEl('p','','Disciplina: '+(c.discipline||'')));x.append(newEl('p','','Assunto: '+(c.subject||'')));
    if(c.reference)x.append(newEl('p','','Referência cadastrada: '+c.reference))}
   const path=article.querySelector(':scope > .v036-card-path');
   if(path)x.append(path.cloneNode(true));
   d.append(x);const actions=article.querySelector(':scope > .buttons');if(actions)actions.before(d);else article.append(d);
  }
  for(const old of article.querySelectorAll(':scope > .bm-open-card,:scope > .bm-open-hint'))old.remove();
 }
}
let queued=false;
const schedule=()=>{if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;decorate()})};
new MutationObserver(schedule).observe(root,{childList:true,subtree:true});
schedule();
root.addEventListener('click',e=>{
 if(surface.contains(e.target)||e.defaultPrevented)return;
 const article=e.target.closest('article.card');if(!article||!root.contains(article))return;
 if(e.target.closest('a,button,input,textarea,select,label,summary,details,form,[contenteditable="true"]'))return;
 const id=idOf(article);if(!valid.test(id))return;
 e.preventDefault();e.stopPropagation();open(id,article);
},true);
root.addEventListener('keydown',e=>{
 if(e.target.tagName!=='ARTICLE'||!['Enter',' '].includes(e.key))return;
 e.preventDefault();const id=idOf(e.target);if(valid.test(id))open(id,e.target);
});
async function openLink(){
 const id=new URLSearchParams(location.search).get('cartao');
 if(!id||!valid.test(id))return;
 try{if(typeof section==='function')section('cartoes');if(typeof loadCards==='function')await loadCards();}catch(e){console.warn('Cartão de link direto:',e)}
 let count=0;
 const retry=()=>{
  if(open(id))return;
  if(count++<20)setTimeout(retry,200);
  else {const p=newEl('p','bm166-link-error','Cartão '+id+' não localizado no catálogo carregado.');root.prepend(p)}
 };
 retry();
}
window.BM166Reader=Object.freeze({version:'V166',open,close,get visible(){return !surface.hidden},get current(){return selected},get ratingRecords(){return readLocal(ratingsKey,[]).length},export:exportData});
window.BancoMestreVisualizarCardV050={get ready(){return true},get visible(){return !surface.hidden},showId:open,close};
void openLink();
})();
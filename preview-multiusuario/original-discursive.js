/* Banco Mestre V206 (formato histórico V195): resposta discursiva opcional no leitor de cartões.
 * IndexedDB local + envio EXPLÍCITO ao Drive do titular. Não altera o SRS canônico.
 * O ID da pasta compartilhada não é publicado no GitHub: configure-o no navegador.
 */
(function(){
 'use strict';
 if(window.BM195Discursivas)return;
 const account=window.BMAccountRuntime;if(account?.mode!=='central')throw Error('Perfil autenticado obrigatório');
 const localStorage=account.local,valid=id=>account.catalog().some(c=>c.id===id&&c.active),DRAFT_PREFIX='BM195_DISCURSIVA_RASCUNHO:';
 let cardId='',rating='',writing=false;
 const el=(type,cls,text)=>{const n=document.createElement(type);if(cls)n.className=cls;if(text!==undefined)n.textContent=String(text);return n};
 const draftKey=()=>DRAFT_PREFIX+cardId;
 function preserveDraft(){if(!valid(cardId))return;const answer=area.value,note=String(editor.querySelector('[data-bm195-note]').value||'');if(answer||note||rating)localStorage.setItem(draftKey(),JSON.stringify({answer,note,rating}));else localStorage.removeItem(draftKey())}
 const all=async()=>account.attempts().map(r=>({id:r.id,card_id:r.cardId,front:r.front,answer:r.answer,note:r.note,rating:r.rating,created_at:r.createdAt,audit_status:r.auditStatus,srs_status:r.srsStatus,sync_status:'synced'})).sort((a,b)=>String(b.created_at).localeCompare(String(a.created_at)));

 let modal,controlButton,editor,area,observedTitle;
 function say(text,isError){
  if(!editor)return;
  const s=editor.querySelector('[data-bm195-status]');if(!s)return;
  s.textContent=String(text||'');s.dataset.error=isError?'yes':'no';
 }

 async function history(){
  if(!editor||editor.hidden||!valid(cardId))return;
  const out=editor.querySelector('[data-bm195-history]');if(!out)return;
  out.replaceChildren(el('p','','Carregando tentativas…'));
  try{
   const rows=(await all()).filter(r=>r.card_id===cardId);
   out.replaceChildren();
   out.append(el('p','','Tentativas registradas neste cartão: '+rows.length));
   for(const r of rows.slice(0,30)){
    const details=el('details','bm195-entry');
    const date=new Date(r.created_at).toLocaleString('pt-BR');
    const tag=' · Registro confirmado';
    details.append(el('summary','',date+' · '+r.rating+tag));
    details.append(el('pre','',r.answer||'(Sem resposta escrita)'));
    if(r.note)details.append(el('p','','Observações: '+r.note));

    out.append(details);
   }
   if(rows.length>30)out.append(el('small','','Exibindo as 30 tentativas mais recentes; a exportação inclui todas.'));
  }catch(error){out.replaceChildren(el('p','','Não foi possível ler o histórico: '+error.message));}
 }
 async function exportJson(){
  try{
   const rows=await all();
   const payload={format:'BancoMestreRespostasDiscursivasBackupV195',exported_at:new Date().toISOString(),count:rows.length,attempts:rows};
   const blob=new Blob([JSON.stringify(payload,null,2)],{type:'application/json'});
   const url=URL.createObjectURL(blob),a=el('a');
   a.href=url;a.download='BancoMestre_Respostas_Discursivas_'+new Date().toISOString().slice(0,10)+'.json';
   document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),2000);
   say('Backup exportado: '+rows.length+' tentativas. Guarde o arquivo em segurança.');
  }catch(e){say('Falha ao exportar: '+e.message,true)}
 }
 function selectedRate(v){
  rating=v;editor.querySelectorAll('[data-bm195-rate]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.bm195Rate===v)));
 }
 function setCard(){
  const next=window.BancoMestreVisualizarCardV050?.currentId||'';
  if(!valid(next)){
   if(editor)editor.hidden=true;return;
  }
  if(next===cardId)return;
  if(area&&cardId)preserveDraft();
  cardId=next;rating='';selectedRate('');
  if(editor)editor.hidden=true;
  if(controlButton)controlButton.textContent='Responder discursivamente';
  if(area){
   editor.querySelector('[data-bm195-note]').value='';
   let saved={};try{const raw=localStorage.getItem(draftKey());if(raw){try{saved=JSON.parse(raw)}catch{saved={answer:raw}}}}catch{}
   area.value=typeof saved.answer==='string'?saved.answer:'';editor.querySelector('[data-bm195-note]').value=typeof saved.note==='string'?saved.note:'';if(Object.hasOwn(account.ratings,saved.rating))selectedRate(saved.rating);
  }
 }
 async function save(){
  if(writing||!valid(cardId))return;
  const id=cardId,text=area.value,note=String(editor.querySelector('[data-bm195-note]').value||'');
  if(!Object.hasOwn(account.ratings,rating)){say('Selecione uma classificação.',true);return}
  if(!text.trim()&&rating!=='Difícil'){say('Escreva a resposta ou marque Difícil.',true);return}
  preserveDraft();writing=true;const button=editor.querySelector('[data-bm195-save]');const fields=[...editor.querySelectorAll('textarea,[data-bm195-rate]')];button.disabled=true;fields.forEach(e=>e.disabled=true);
  try{const saved=await account.recordDiscursive({cardId:id,answer:text,note,rating});if(saved.cardId!==id)throw Error('Recibo divergente');localStorage.removeItem(DRAFT_PREFIX+id);say('Tentativa fictícia confirmada nesta aba. Esta autoavaliação não altera o SRS formal.');area.value='';editor.querySelector('[data-bm195-note]').value='';selectedRate('');await history()}
  catch(e){say(e.message+' — mantenha o texto e repita a mesma tentativa.',true)}
  finally{writing=false;button.disabled=false;fields.forEach(e=>e.disabled=false)}
 }
 async function restorePending(){
  const requested=cardId,view=window.BancoMestreVisualizarCardV050?.viewSequence,initial=JSON.stringify([area.value,editor.querySelector('[data-bm195-note]').value,rating]);
  try{const p=await account.pendingDiscursive();if(!p||p.attempt.cardId!==requested||requested!==cardId||view!==window.BancoMestreVisualizarCardV050?.viewSequence||writing||editor.hidden)return;
   if(initial!==JSON.stringify([area.value,editor.querySelector('[data-bm195-note]').value,rating])){say('Há uma tentativa pendente. Seu rascunho não foi substituído. Reabra o cartão para recuperar a reserva.',true);return}
   const r=p.attempt;area.value=r.answer;editor.querySelector('[data-bm195-note]').value=r.note||'';selectedRate(r.rating);preserveDraft();say('Tentativa pendente recuperada. Registre novamente para confirmar a mesma reserva.');
  }catch(e){say(e.message,true)}
 }

 function mount(){
  modal=document.getElementById('bmCardPeekV050');if(!modal)return false;
  const controls=modal.querySelector('.bm163-preview-controls');
  if(!controls)return false;
  if(document.getElementById('bm195Discursive'))return true;
  controlButton=el('button','bm195-open','Responder discursivamente');controlButton.type='button';controls.append(controlButton);
  editor=el('section','bm195-editor');editor.id='bm195Discursive';editor.hidden=true;
  editor.innerHTML=[
   '<h3>Resposta discursiva · <span data-bm195-card></span></h3>',
   '<p>Responda antes de revelar o verso. A tentativa original e sua classificação são preservadas sem substituir o cartão.</p>',
   '<label class="bm195-label">Sua resposta completa<textarea data-bm195-answer rows="7" placeholder="Explique com suas palavras; fórmulas, normas, exemplos e exceções quando necessários."></textarea></label>',
   '<label class="bm195-label">Observações (opcional)<textarea data-bm195-note rows="2" placeholder="Dificuldades, pegadinhas ou pontos para revisar."></textarea></label>',
   '<div class="bm195-label">Sua classificação</div>',
   '<div class="bm195-rates" role="group" aria-label="Autoavaliação">',
   ...Object.keys(account.ratings).map(r=>'<button type="button" data-bm195-rate="'+r+'" aria-pressed="false">'+r+'</button>'),'</div>',
   '<div class="bm195-actions"><button type="button" data-bm195-save class="bm195-primary">Registrar classificação e resposta</button>',
   '<button type="button" data-bm195-reveal>Conferir verso original</button></div>',
   '<p>Registro individual no servidor central. O rascunho permanece apenas nesta sessão; o SRS formal é separado.</p>',
   '<div class="bm195-actions"><button type="button" data-bm195-export>Exportar todas as tentativas (.json)</button>',
   '<button type="button" data-bm195-history-toggle>Mostrar histórico deste cartão</button></div>',
   '<p data-bm195-status role="status" aria-live="polite">Perfil individual pronto.</p>',
   '<div data-bm195-history hidden></div>',
   '<small>Auditoria posterior pelo ChatGPT, mediante consulta às tentativas individuais. A nota não recalcula o SRS canônico automaticamente.</small>'
  ].join('');
  controls.insertAdjacentElement('afterend',editor);
  area=editor.querySelector('[data-bm195-answer]');
  controlButton.addEventListener('click',()=>{
   setCard();
   editor.hidden=!editor.hidden;
   controlButton.textContent=editor.hidden?'Responder discursivamente':'Fechar resposta discursiva';
   if(!editor.hidden){editor.querySelector('[data-bm195-card]').textContent=cardId;area.focus();void history();void restorePending();}
  });
  area.addEventListener('input',preserveDraft);editor.querySelector('[data-bm195-note]').addEventListener('input',preserveDraft);
  editor.querySelectorAll('[data-bm195-rate]').forEach(b=>b.addEventListener('click',()=>{selectedRate(b.dataset.bm195Rate);preserveDraft()}));
  editor.querySelector('[data-bm195-save]').addEventListener('click',save);
  editor.querySelector('[data-bm195-reveal]').addEventListener('click',()=>modal.querySelector('.bm-v050-peek-reveal')?.click());

  editor.querySelector('[data-bm195-export]').addEventListener('click',exportJson);
  editor.querySelector('[data-bm195-history-toggle]').addEventListener('click',()=>{
   const target=editor.querySelector('[data-bm195-history]');target.hidden=!target.hidden;
   editor.querySelector('[data-bm195-history-toggle]').textContent=target.hidden?'Mostrar histórico deste cartão':'Ocultar histórico deste cartão';
   if(!target.hidden)void history();
  });
  observedTitle=modal.querySelector('#bmCardPeekTitleV050');
  const obs=new MutationObserver(setCard);
  if(observedTitle)obs.observe(observedTitle,{childList:true,characterData:true,subtree:true});
  obs.observe(modal,{attributes:true,attributeFilter:['hidden']});
  say('Pronto para registrar tentativas no perfil individual.');
  setCard();
  return true;
 }
 window.BM195Discursivas=Object.freeze({version:'V195',get modalReady(){return !!editor},get linkedFolder(){return false},exportar:exportJson});
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{if(!mount()){const m=new MutationObserver(()=>{if(mount())m.disconnect()});m.observe(document.body,{childList:true,subtree:true})}},{once:true});
 else if(!mount()){const m=new MutationObserver(()=>{if(mount())m.disconnect()});m.observe(document.body,{childList:true,subtree:true})}
})();
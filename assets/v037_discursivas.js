/* Banco Mestre V037 — resposta discursiva, lacunas e resposta-guia para todos os cartões.
   Registro local voluntário; não inventar correção por IA nem eventos SRS. */
(function(){
'use strict';
const $=id=>document.getElementById(id);
const STORE='BM_V037_CARTAO_GUIA_';
const norm=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
function val(id){try{return JSON.parse(localStorage.getItem(STORE+id)||'null')||{id,answer:'',gaps:'',guide:'',notes:'',updated:null,history:[]}}catch{return{id,answer:'',gaps:'',guide:'',notes:'',history:[]}}}
function keep(id,record){record.updated=new Date().toISOString();try{localStorage.setItem(STORE+id,JSON.stringify(record));return true}catch(e){alert('Não foi possível salvar localmente. Exporte seu registro antes de sair: '+e.message);return false}}
function el(tag,cls,text){const e=document.createElement(tag);if(cls)e.className=cls;if(text!==undefined)e.textContent=String(text);return e}
function button(name,fn,cls){const b=el('button',cls,name);b.type='button';b.onclick=fn;return b}
function guideSource(c){
 const g=c.origin_question_id?guideData?.questoes?.[c.origin_question_id]:null;
 const rec=answersF17?.por_id?.[c.id];
 const legal=c.provisional||c.group==='LEGISLACAO'||/legisla/i.test(c.discipline||'');
 return {
  g,rec,legal,
  minimum:g?.resposta_minima||c.back||'Verso original não cadastrado.',
  developed:g?.resposta_modelo||'Ainda não há resposta-guia aprofundada e auditada para este ID. A resposta mínima e a explicação histórica abaixo não equivalem a uma resposta-guia desenvolvida. Use o campo de trabalho para registrar a correção após avaliação.',
  source:g?.dispositivo||c.reference||'Fundamento normativo específico ainda não auditado para este cartão.',
  pdf:g?.fonte||'Vínculo exato do PDF original e página ainda não confirmado.',
  risks:g?.pegadinhas||c.expl||'Condições, exceções, aplicação prática e comparações exigem auditoria individual.',
  gaps:g?.lacunas?.map(x=>x.id+' — '+x.fixar).join('\n')||rec?.lacunas_em_relacao_ao_enunciado||'Lacunas pessoais ainda não avaliadas. A ausência de registro não é evidência de domínio.',
  cross:g?.vinculos_cartoes?.map(x=>x.cartao+' — '+x.tema+' ('+x.tratamento+')').join('\n')||rec?.cobertura_cruzada_ids_informados||'Cobertura cruzada ainda não demonstrada.'
 };
}
function para(root,title,value){
 if(value===undefined||value===null||value==='')return;
 const section=el('section','v037-guide-piece');
 section.append(el('h4','',title),el('p','',value));root.append(section);
}
function copyText(t,feedback){
 if(navigator.clipboard?.writeText){navigator.clipboard.writeText(t).then(()=>feedback('Conteúdo copiado. Cole no ChatGPT para correção discursiva completa.')).catch(()=>fallback())}
 else fallback();
 function fallback(){const ta=el('textarea');ta.value=t;document.body.append(ta);ta.select();try{document.execCommand('copy');feedback('Conteúdo copiado.')}catch{feedback('Cópia automática indisponível; selecione o texto.')}ta.remove()}
}
function makeWorkspace(article,c){
 if(article.querySelector('.v037-train'))return;
 const ref=guideSource(c),memory=val(c.id);
 const answer=article.querySelector(':scope > details');
 if(!answer)return;
 // A pergunta continua visível. O verso permanece oculto até a tentativa ou abertura explícita.
 answer.hidden=true;
 const panel=el('div','v037-train');
 panel.append(el('h4','v037-train-title','Resposta discursiva · '+c.id));
 const intro=el('p','v037-help',ref.legal?
  'Lei seca: responda antes de consultar o texto. Na correção, diferencie sua redação da literalidade legal verificada.':
  'Responda livremente, sem consultar o verso. A comparação distingue mínimo necessário, aprofundamento e lacunas.');
 panel.append(intro);
 const textarea=el('textarea','v037-answer');textarea.rows=4;textarea.placeholder='Escreva aqui sua resposta antes de revelar o cartão...';textarea.value=memory.answer||'';
 panel.append(textarea);
 const actions=el('div','v037-actions'),status=el('small','v037-message',memory.updated?'Último registro local: '+new Date(memory.updated).toLocaleString('pt-BR'):'Sem tentativa registrada neste navegador');
 function msg(s){status.textContent=s}
 const unlock=()=>{
  answer.hidden=false;answer.open=true;
  if(!answer.querySelector('.v037-guide')){
   const root=el('div','v037-guide');
   root.append(el('h3','','Correção metodológica do cartão'));
   para(root,'1 · Resposta mínima necessária (verso canônico)',ref.minimum);
   para(root,'2 · Resposta-guia aprofundada',memory.guide||ref.developed);
   para(root,'3 · Fundamento e literalidade',ref.source+(ref.legal?'\nVerifique o texto vigente, artigo, parágrafos, incisos, exceções e versão oficial. Não atribuir literalidade à paráfrase histórica.':''));
   para(root,'4 · PDF original e página',ref.pdf);
   para(root,'5 · Lacunas documentadas',ref.gaps);
   para(root,'6 · Condições, distinções e pegadinhas',ref.risks);
   para(root,'7 · Cobertura cruzada',ref.cross);
   if(c.mnemonic)para(root,'8 · Macete exclusivamente deste cartão',c.mnemonic);
   const edit=el('div','v037-edit');
   edit.append(el('h4','','Registro evolutivo da sua correção'));
   const gap=el('textarea');gap.rows=3;gap.placeholder='Lacunas que você realmente demonstrou na resposta';gap.value=memory.gaps||'';
   const guide=el('textarea');guide.rows=5;guide.placeholder='Cole ou escreva a resposta-guia completa após a correção';guide.value=memory.guide||'';
   const note=el('textarea');note.rows=3;note.placeholder='Exceções, comparações, exemplos, dúvidas e fundamentação';note.value=memory.notes||'';
   for(const [label,field] of [['Lacunas pessoais',gap],['Resposta-guia desenvolvida',guide],['Aprofundamento complementar',note]]){edit.append(el('label','v037-field-label',label),field)}
   edit.append(button('Salvar guia e lacunas',()=>{
    const r=val(c.id);r.gaps=gap.value;r.guide=guide.value;r.notes=note.value;keep(c.id,r);msg('Guia e lacunas salvos somente neste navegador; a base canônica não foi alterada.');
    const developed=root.querySelectorAll('.v037-guide-piece')[1]?.querySelector('p');if(developed)developed.textContent=r.guide||ref.developed;
   },'v037-primary'));
   root.append(edit);answer.append(root);
  }
 };
 actions.append(button('Registrar minha resposta e comparar',()=>{
  if(!textarea.value.trim()){msg('Escreva sua resposta antes de comparar ou use o botão de consulta sem tentativa.');textarea.focus();return}
  const r=val(c.id);r.answer=textarea.value;r.history=r.history||[];r.history.push({answer:textarea.value,at:new Date().toISOString(),type:'resposta_discursiva_nao_avaliada'});
  if(r.history.length>25)r.history=r.history.slice(-25);
  keep(c.id,r);memory.answer=r.answer;unlock();msg('Tentativa registrada localmente, SEM avaliação automática e SEM lançamento no SRS.');
 },'v037-primary'));
 actions.append(button('Consultar sem registrar tentativa',()=>{unlock();msg('Consulta liberada sem registrar avaliação, acerto ou evento SRS.')})); 
 actions.append(button('Copiar pedido de correção',()=>{
  const r=val(c.id),body=textarea.value||r.answer;
  if(!body.trim()){msg('Escreva primeiro sua resposta para solicitar avaliação.');return}
  const prompt='Corrija esta resposta discursiva conforme minha Metodologia Mestre do Banco Mestre. Não cadastre SRS sem minha avaliação. Diferencie núcleo mínimo, gabarito original literal, resposta-guia aprofundada, fundamento legal/normativo vigente quando comprovado, lacunas efetivamente demonstradas, condições e exceções, pegadinhas, macete, escrita e cobertura cruzada. Não crie novo cartão sem aprovação.\n\nCartão: '+c.id+'\nDisciplina: '+c.discipline+'\nAssunto: '+c.subject+'\nPergunta original: '+c.front+'\nMinha resposta: '+body+'\nVerso original para correção pós-tentativa: '+c.back+'\nExplicação histórica: '+(c.expl||'')+'\nReferência existente: '+ref.source;
  copyText(prompt,msg);
 }));
 panel.append(actions,status);
 answer.before(panel);
 // Se já havia resposta salva, permitir retorno sem transformar o registro em novo evento.
 if(memory.answer){const back=button('Reabrir a correção registrada',()=>{unlock();msg('Correção anterior aberta. Nenhum novo evento foi criado.');});panel.append(back)}
}
function update(){
 const lookup=new Map(cards.map(c=>[c.id,c]));
 for(const article of document.querySelectorAll('#cardRows article.card')){
  const id=article.querySelector(':scope > .tag')?.textContent?.trim();
  if(!id)continue;const c=lookup.get(id);if(c)makeWorkspace(article,c);
 }
}
const previous=cardRender;
cardRender=function(){previous();update()};
function backup(){
 const records=[];for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(k?.startsWith(STORE)){try{records.push(JSON.parse(localStorage.getItem(k)))}catch(e){}}}
 const data={format:'BancoMestreRespostasDiscursivasV037',exportedAt:new Date().toISOString(),cards:records};
 const u=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:'application/json'}));
 const a=el('a');a.href=u;a.download='Banco_Mestre_Respostas_Discursivas_Local_'+new Date().toISOString().slice(0,10)+'.json';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),30000);
}
const bar=document.querySelector('#cartoes .controls');
if(bar){const b=button('Exportar respostas e guias locais',backup);b.title='Backup das anotações discursivas deste navegador, sem modificar Banco Mestre';bar.append(b)}
window.BancoMestreDiscursivasV037={backup,guideSource};
if(cards.length)cardRender();
})();
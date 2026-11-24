
'use strict';
if(!window.BMAccountRuntime||window.BMAccountRuntime.mode!=='central')throw Error('Perfil autenticado obrigatório');
const $=id=>document.getElementById(id),fold=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const api=window.BancoMestreImagens;let docs=[],meta=null,cards=[],imgs=[],cardLimit=24,imgLimit=24,loadedCards=false,loadedImages=false;
let guideData=null,generalGuide=null,auditF17=null,answersF17=null,origMap={},focusGroup='',topicRows=[],imgScale=1,imgW=0,imgH=0;
let shards={},opened=null,marks=[],draft=null;
function el(tag,text,cls){const x=document.createElement(tag);if(text!==null)x.textContent=text;if(cls)x.className=cls;return x}
function action(label,fn,cl){const b=el('button',label,cl||'');b.onclick=fn;return b}
function link(label,url){const a=el('a',label,'action');a.href=url;a.target='_blank';a.rel='noopener noreferrer';return a}
function hidden(type){try{return new Set(JSON.parse(window.BMAccountRuntime.local.getItem('BM026_EXCLUDE_'+type)||'[]'))}catch{return new Set()}}
function exclude(type,id,yes){const ids=hidden(type);yes?ids.add(id):ids.delete(id);try{window.BMAccountRuntime.local.setItem('BM026_EXCLUDE_'+type,JSON.stringify([...ids]));return true}catch(e){alert('Não foi possível gravar no navegador: '+e.message);return false}}
function card(title,tag,subtitle){const c=el('article',null,'card');c.append(el('span',tag,'tag'),el('h3',title),el('p',subtitle));const buttons=el('div',null,'buttons');c.append(buttons);return {c,buttons}}
function section(name){
 const previous=document.querySelector('main section.active')?.id||'assuntos';
 document.querySelectorAll('nav button').forEach(b=>b.classList.toggle('active',b.dataset.page===name));
 document.querySelectorAll('main section').forEach(s=>s.classList.toggle('active',s.id===name));
 if(!window.BM054HistoryRestoring){
  if(name==='tema'&&window.BM054PendingTopic){
   const t=window.BM054PendingTopic;
   const route='#tema?g='+encodeURIComponent(t.group)+'&s='+encodeURIComponent(t.subject);
   if(location.hash!==route){
    history.replaceState({...history.state,bmSection:previous,bmScrollY:window.scrollY},'',location.href);
    history.pushState({bmTopic:true,bmReturnInternal:true},'',route);
   }
  }else history.replaceState(null,'','#'+name);
 }
 if(name==='cartoes')void loadCards().catch(e=>console.warn('Carregamento dos cartões V194:',e));
 if(name==='imagens')loadImages();
 if(name==='assuntos')loadTopics();
}
document.querySelectorAll('nav button').forEach(b=>b.onclick=()=>section(b.dataset.page));
async function pdfInit(){docs=window.BMAccountRuntime.pdfCatalog();$('pdfStat').textContent=docs.length;$('bm269PdfLocked').textContent='Biblioteca demonstrativa. Edição visual em homologação.';for(const g of [...new Set(docs.map(x=>x.section))])$('pdfFilter').add(new Option(g,g));pdfRender()}
function pdfRender(){const q=fold($('pdfSearch').value),f=$('pdfFilter').value,show=$('pdfHidden').checked,h=hidden('PDF');let a=docs.filter(x=>(show||!h.has(x.id))&&(f==='all'||x.section===f)&&fold(x.title+' '+x.section+' '+x.id+' '+x.category).includes(q));$('pdfCount').textContent=a.length+' PDFs';const out=$('pdfRows');out.replaceChildren();for(const group of [...new Set(a.map(x=>x.section))]){out.append(el('h3',group,'group'));const grid=el('div',null,'grid');for(const p of a.filter(x=>x.section===group)){const off=h.has(p.id),pages=p.pages?' · págs. '+p.pages.join('–'):'',size=p.size?' · '+(p.size/1048576).toFixed(1)+' MB':'';const x=card(p.title,p.id,'Arquivo de exemplo'+pages+size+(off?' · excluído localmente':''));x.buttons.append(action('Ler PDF',()=>pdfOpen(p),'primary'),action(off?'Restaurar':'Excluir',()=>{if(exclude('PDF',p.id,!off))pdfRender()},off?'':'danger'));grid.append(x.c)}out.append(grid)}if(!a.length)out.append(el('p','Nenhum PDF encontrado.','muted'))}
function pdfOpen(p){if(!window.BMAccountRuntime.pdfCatalog().some(x=>x.id===p.id))throw Error('PDF fora do perfil');$('docTitle').textContent=p.title;$('pdfOriginal').hidden=true;$('pdfFrame').hidden=true;$('pdfIntro').textContent='Baixe o PDF fictício; integração do editor original ainda pendente.';$('pdfChooseLocal').textContent='Baixar PDF original';$('pdfChooseLocal').onclick=()=>window.BMAccountRuntime.downloadPdf(p.id,p.title).catch(e=>alert(e.message));$('pdfDialog').showModal()}
$('pdfClose').onclick=()=>$('pdfDialog').close();$('pdfDialog').addEventListener('close',()=>{$('pdfFrame').src='about:blank'});
$('pdfSearch').oninput=pdfRender;$('pdfFilter').onchange=pdfRender;$('pdfHidden').onchange=pdfRender;

function topicAreaOf(g){
 if(g==='PORTUGUES')return 'Português';
 if(g==='MATEMATICA')return 'Matemática';
 if(g==='LEGISLACAO')return 'Legislação';
 if(g==='INFORMATICA')return 'Informática';
 if(g&&g.startsWith('ENG_'))return 'Engenharia Civil';
 return 'Outros';
}
async function loadTopics(){
 try{
  await loadCards();const m=await loadMeta();
  const cardsByGroup=new Map();
  for(const c of cards.filter(c=>c.provisional||c.active!==false)){const g=c.group||'OUTROS';if(!cardsByGroup.has(g))cardsByGroup.set(g,[]);cardsByGroup.get(g).push(c)}
  const labels=new Map(m.groups.map(g=>[g.id,g.title]));
  const areas=['Engenharia Civil','Português','Matemática','Legislação','Informática'];
  const areaRoot=$('areaRows');areaRoot.replaceChildren();
  for(const area of areas){
   const count=[...cardsByGroup].filter(([g])=>topicAreaOf(g)===area).reduce((a,[,v])=>a+v.length,0);
   const b=el('button',null,'topicCard');b.append(el('strong',area),el('small',count+' cartões, agrupados por assuntos'));b.onclick=()=>{$('topicArea').value=area;topicRender()};areaRoot.append(b);
  }
  topicRows=[];
  for(const [group,arr] of cardsByGroup){
   const grouped=new Map();
   for(const c of arr){const k=c.subject||'Outros';if(!grouped.has(k))grouped.set(k,0);grouped.set(k,grouped.get(k)+1)}
   for(const [subject,count] of grouped){topicRows.push({group,subject,count,area:topicAreaOf(group),label:labels.get(group)||group})}
  }
  topicRows.sort((a,b)=>a.area.localeCompare(b.area,'pt-BR')||a.subject.localeCompare(b.subject,'pt-BR'));
  if($('topicArea').options.length===1)for(const a of areas)$('topicArea').add(new Option(a,a));
  topicRender();
 }catch(e){$('topicRows').textContent='Falha ao carregar assuntos: '+e.message}
}
function topicRender(){
 const q=fold($('topicSearch').value),area=$('topicArea').value;
 const visible=topicRows.filter(x=>(area==='all'||x.area===area)&&fold(x.subject+' '+x.label+' '+x.area).includes(q));
 $('topicCount').textContent=visible.length+' assuntos';const out=$('topicRows');out.replaceChildren();
 for(const t of visible){
  const b=el('button',null,'topicCard');b.append(el('span',t.area,'tag'),el('strong',t.subject),el('small',t.count+' cartão(ões) · '+(t.imgCount?t.imgCount+' imagem(ns) · ':'')+t.label));
  b.onclick=async()=>{focusGroup=t.group;const query=t.subject;$('cardSearch').value=query;$('cardFilter').value='all';cardLimit=24;section('cartoes');cardRender()};
  out.append(b);
 }
 if(!visible.length)out.textContent='Nenhum assunto localizado; tente outro termo.';
}
$('topicSearch').oninput=topicRender;$('topicArea').onchange=topicRender;

async function loadMeta(){const list=window.BMAccountRuntime.catalog();return {groups:[...new Set(list.map(c=>c.group||'OUTROS'))].map(id=>({id,title:id})),images:[],card_files:[]}}
let bm123CardsPromise=null;
function loadCards(){if(bm123CardsPromise)return bm123CardsPromise;bm123CardsPromise=(async()=>{cards=window.BMAccountRuntime.catalog();guideData=generalGuide=auditF17=answersF17=null;loadedCards=true;const counter=document.querySelector('.stats .stat:nth-child(2) b');if(counter)counter.textContent=cards.length.toLocaleString('pt-BR');for(const g of [...new Set(cards.map(c=>c.discipline||'Outros'))].sort())$('cardFilter').add(new Option(g,g));for(const s of [...new Set(cards.map(c=>c.subject||'Outros'))].sort())$('cardTopicFilter').add(new Option(s,s));$('cardRecoveredOnly').disabled=$('cardReviewedOnly').disabled=true;$('cardTopicFilter').onchange=cardRender;cardRender()})();return bm123CardsPromise}
function infoBlock(parent,title,text){
 if(text===undefined||text===null||text==='')return;
 const section=el('div',null,'richSection');
 section.append(el('h4',title),el('p',String(text)));
 parent.append(section);
}
function infoList(parent,title,items,format){
 if(!items?.length)return;const block=el('div',null,'richSection');block.append(el('h4',title));const ul=el('ul');
 for(const x of items){const li=el('li',format(x));ul.append(li)}block.append(ul);parent.append(block);
}
function linkedQuestions(cardId){
 if(!guideData)return [];
 return Object.values(guideData.questoes).filter(q=>q.vinculos_cartoes.some(x=>x.cartao===cardId));
}
function legalCoverage(){
 const root=$('coverageSummary');root.replaceChildren();if(!guideData)return;
 const wrap=el('details');const summary=el('summary','Cobertura das 25 normas estudadas em Ijuí (planejamento, não domínio)');
 wrap.append(summary);const grid=el('div',null,'grid');grid.style.marginTop='15px';
 for(const x of guideData.cobertura_leis){
  const b=card(x.lei,x.lei_id,'PDF: '+x.pdf);
  b.c.append(el('p','Núcleos previstos: '+x.nucleos_planejados+' · com questões liberadas: '+x.nucleos_cobertos));
  b.c.append(el('p','Situação: '+x.dominio));
  grid.append(b.c);
 }wrap.append(grid);root.append(wrap);
 for(const item of guideData.pendencias_pos_checkpoint||[]){
   const n=el('div',null,'notice');
   n.append(el('strong',item.questao_id+' — '+item.tema),el('p',item.evento+' · '+item.estado));
   root.append(n);
 }
}
function cardRender(){
 const h=hidden('CARD'),show=$('cardHidden').checked,q=fold($('cardSearch').value),f=$('cardFilter').value;
 let a=cards.filter(c=>(c.provisional||c.active!==false||document.getElementById("bm119ShowInactive")?.checked)&&(c.provisional||c.active!==false)&&(!$('cardRecoveredOnly').checked||!!answersF17?.por_id?.[c.id])&&(!$('cardReviewedOnly').checked||!!auditF17?.historico_por_id?.[c.id])&&(show||!h.has(c.id))&&(f==='all'||c.discipline===f)&&(window.BM152FlashFilters?.matches?.(c)!==false)&&($('cardTopicFilter').value==='all'||(c.subject||'Outros')===$('cardTopicFilter').value)&&(!focusGroup||c.group===focusGroup)&&fold([c.id,c.front,c.back,c.discipline,c.subject,c.sub,c.search_keywords,c.reference].filter(Boolean).join(' ')).includes(q));
 if(window.BM281CardSort){a=window.BM281CardSort.filterAndSort(a);if(window.BM281CardSort.limited)cardLimit=Math.max(cardLimit,window.BM281CardSort.limit)}
 $('cardCount').textContent=a.length+' cartões · frente/verso com guia metodológico quando disponível';
 const out=$('cardRows');out.replaceChildren();if(!a.length)out.textContent='Nenhum cartão corresponde à busca ou aos filtros. Limpe os filtros para ver toda a base.';
 for(const c of a.slice(0,cardLimit)){
  const off=h.has(c.id),x=card(c.front,c.id,c.discipline+' · '+c.subject+(off?' · oculto':'')),d=el('details');
  d.append(el('summary','Revelar resposta, fundamento, guia e cobertura'));
  const ans=el('div',null,'answer');
  infoBlock(ans,c.provisional?'Resposta da ficha em validação editorial':'Resposta exata do cartão original',c.back||'Sem resposta cadastrada');
  infoBlock(ans,'Explicação da base',c.expl);
  infoBlock(ans,'Macete original',c.mnemonic);
  const gg=generalGuide?.por_id?.[c.id];
  if(gg?.ref)infoBlock(ans,'Referência da base geral V015',gg.ref);
  if(gg?.evolucoes?.length)infoList(ans,'Evoluções complementares registradas em P08',gg.evolucoes,e=>e.id+' — '+e.pergunta+' | '+e.resposta_complementar+' · '+e.origem);
  if(c.sub)infoBlock(ans,'Subassunto',c.sub);
  if(c.prior)infoBlock(ans,'Prioridade histórica na base (não é nota SRS)',c.prior);
  if(c.provisional){
   infoBlock(ans,'Situação editorial','PROP-IJUI — cópia operacional, sem promoção canônica. ID anterior proposto: '+(c.legacy_proposed_card_id||'não informado')+'. O ID original conflita com a V015 e não pode ser reutilizado.');
   infoBlock(ans,'Fundamento da proposta',c.reference);
   infoBlock(ans,'Origem da questão',c.origin_question_id);
   const g=guideData?.questoes?.[c.origin_question_id];
   if(g){
    infoBlock(ans,'Conhecimento mínimo para acertar',g.resposta_minima);
    infoBlock(ans,'Resposta-modelo pós-correção',g.resposta_modelo);
    infoBlock(ans,'Fundamento legal',g.dispositivo);
    infoBlock(ans,'PDF original / páginas',g.fonte);
    infoBlock(ans,'Pegadinhas e exceções',g.pegadinhas);
    if(g.tentativa_registrada)infoBlock(ans,'Tentativa anterior registrada (questão, não flashcard)','Data: '+g.tentativa_data+' · avaliação informada: '+g.avaliacao_informada+' · revisão prevista no checkpoint: '+g.revisao_prevista_no_checkpoint+'. O texto integral permanece na planilha privada.');
    infoBlock(ans,'O que já foi compreendido',g.acertos_do_estudo);
    infoBlock(ans,'Pontos a corrigir da resposta anterior',g.lacunas_do_estudo);
    infoList(ans,'Macetes associados',g.macetes,m=>m.id+' — '+m.frase+' | '+m.interpretacao+(m.alerta?' | Alerta: '+m.alerta:''));
    infoList(ans,'Lacunas de fixação',g.lacunas,l=>l.id+' ('+l.prioridade+'; '+l.estado+') — '+l.fixar);
    infoList(ans,'Interconexões com o Banco Mestre',g.vinculos_cartoes,v=>v.cartao+' — '+v.tema+' · '+v.tratamento+' (domínio não demonstrado)');
    infoBlock(ans,'Cobertura e método','A questão '+g.questao_id+' possui guia pós-tentativa. Cobertura direta do núcleo não equivale a domínio. '+g.aviso_srs);
   }else infoBlock(ans,'Auditoria de cobertura','Ainda não há resposta-modelo desta questão na planilha auditada; não completar a partir de suposição.');
  }else{
   const links=linkedQuestions(c.id);
   if(links.length)infoList(ans,'Cobertura cruzada com questões de Ijuí',links,q=>q.questao_id+' — '+q.tema+' (associação histórica; não comprova domínio)');
   
   const evF17=auditF17?.historico_por_id?.[c.id];
   if(evF17){
    infoBlock(ans,'Tentativa F17 preservada','Tentativa '+evF17.tentativa+' · '+evF17.avaliacao+' · '+evF17.data_local+(evF17.hora_local?' às '+evF17.hora_local+' (fuso -03:00)':' (hora não comprovada)')+' · fonte: '+evF17.origem_evento);
    infoBlock(ans,'Observações originais sobre sua resolução',evF17.observacoes_da_correcao);
    infoBlock(ans,'Precisão do registro',evF17.precisao_temporal);
    infoBlock(ans,'Próxima revisão já registrada na V015',evF17.proxima_revisao_existente_v015||'Não registrada');
    
    ans.append(link('Consultar auditoria F17 no Drive','#'));
   }else infoBlock(ans,'Histórico formal','Consulte o diário individual; a consulta não altera o SRS.');
   const recovered=answersF17?.por_id?.[c.id];
   if(recovered){
    infoBlock(ans,'RESPOSTA DISCURSIVA ARQUIVADA — CSV F14/F16',recovered.resposta_original_arquivada);
    infoBlock(ans,'Conhecimentos demonstrados no estudo',recovered.conhecimentos_demonstrados);
    infoBlock(ans,'Conhecimentos parciais',recovered.conhecimentos_parciais);
    infoBlock(ans,'Erros corrigidos',recovered.erros_corrigidos);
    infoBlock(ans,'Lacunas identificadas',recovered.lacunas_em_relacao_ao_enunciado);
    infoBlock(ans,'Complementações da correção',recovered.informacoes_novas_de_complementacao);
    infoBlock(ans,'Macete da revisão',recovered.macete);
    infoBlock(ans,'Cobertura cruzada informada (não lançar SRS)',recovered.cobertura_cruzada_ids_informados);
    infoBlock(ans,'Referência de PDF registrada no CSV',recovered.referencia_pdf_confirmada_no_csv);
    infoBlock(ans,'Classificação histórica do CSV (não sobrescreve V015)',recovered.classificacao_historica_csv);
    infoBlock(ans,'Observação de rastreabilidade',recovered.observacao_de_rastreabilidade);
    if(recovered.conflitos_pendentes?.length)infoList(ans,'Pendências de conciliação — NÃO resolver automaticamente',recovered.conflitos_pendentes,x=>String(x));
    infoBlock(ans,'Precisão da fonte','Texto preservado no campo do CSV F14/F16; não é certificação de transcrição literal completa do chat. Sem alteração do SRS.');
   }else if(evF17)infoBlock(ans,'Resposta discursiva integral','Não localizada nos checkpoints consultados para este ID; nenhuma resposta foi inventada.');
   const crossed=auditF17?.vinculos_indiretos?.filter(x=>x.cartao===c.id||x.origem===c.id)||[];
   if(crossed.length)infoList(ans,'Cobertura cruzada F17 sem tentativa adicional',crossed,x=>x.origem+' → '+x.cartao+' · '+x.status+' · '+x.evidencia);
   const evos=auditF17?.evolucoes_registradas?.filter(x=>x.ids_relacionados.includes(c.id))||[];
   if(evos.length)infoList(ans,'Perguntas evolutivas F17 — vinculadas, sem SRS',evos,x=>x.proposta+' | '+x.pergunta+' | '+x.resposta_fonte);
   const relatedI=[]; // V031: grupo em comum NÃO comprova vínculo imagem-cartão.
   if(relatedI.length)infoList(ans,'Imagens relacionadas por grupo — vínculo de ID ainda não confirmado',relatedI.slice(0,6),i=>i.no+' — '+i.title);
   const relatedP=[]; // V031: categoria em comum NÃO comprova vínculo PDF-cartão.
   if(relatedP.length)infoList(ans,'PDFs relacionados por categoria — vínculo temático',relatedP.slice(0,6),p=>p.title+(p.pages?' (páginas '+p.pages.join('–')+')':''));
   infoBlock(ans,'Cobertura do assunto','O cadastro deste cartão não comprova que todas as condições, exceções e aplicações do assunto foram revisadas. A análise aprofundada permanece vinculada às fontes e aos registros originais.');
  }
  if(c.provisional&&guideData?.link_fonte_privada){
   const a=link('Ver planilha original com a resposta discursiva privada',guideData.link_fonte_privada);
   ans.append(a);
  }
  d.addEventListener('toggle',()=>{if(d.open&&!ans.dataset.individual){ans.dataset.individual='1';window.BMAccountRuntime.renderCardExtras(c,ans);}});d.append(ans);x.c.insertBefore(d,x.buttons);
  x.buttons.append(action(off?'Restaurar':'Excluir da visualização',()=>{if(exclude('CARD',c.id,!off))cardRender()},off?'':'danger'));
  out.append(x.c);
 }
 $('moreCards').disabled=a.length<=cardLimit;
 legalCoverage();
}

$('cardSearch').oninput=()=>{focusGroup='';cardLimit=24;cardRender()};$('cardFilter').onchange=()=>{focusGroup='';cardRender()};$('cardHidden').onchange=cardRender;$('cardReviewedOnly').onchange=()=>{cardLimit=24;cardRender()};$('cardRecoveredOnly').onchange=()=>{cardLimit=24;cardRender()};$('moreCards').onclick=()=>{cardLimit+=24;cardRender()};
async function loadImages(){if(loadedImages)return;loadedImages=true;imgs=window.BMAccountRuntime.imageCatalog().map(x=>({no:x.id,title:x.title,category:x.category||'Atlas individual',caption:x.caption}));for(const g of [...new Set(imgs.map(x=>x.category))].sort())$('imageFilter').add(new Option(g,g));await imgRender()}
async function thumb(x){return null}
async function imgRender(){const h=hidden('IMAGE'),show=$('imageHidden').checked,q=fold($('imageSearch').value),f=$('imageFilter').value;const a=imgs.filter(x=>(show||!h.has(x.no))&&(f==='all'||x.category===f)&&fold(x.no+' '+x.title+' '+x.category+' '+x.caption).includes(q));$('imageCount').textContent=a.length+' imagens';const out=$('imageRows');out.replaceChildren();for(const x of a.slice(0,imgLimit)){const off=h.has(x.no),c=card(x.title,x.no,x.category+(off?' · oculta':''));if(x.caption)c.c.append(el('p',x.caption));c.buttons.append(action('Abrir em tela cheia',()=>imgOpen(x),'primary'),action(off?'Restaurar':'Excluir da visualização',()=>{exclude('IMAGE',x.no,!off);void imgRender()},off?'':'danger'));out.append(c.c)}$('moreImages').disabled=a.length<=imgLimit}
$('imageSearch').oninput=()=>{imgLimit=24;imgRender()};$('imageFilter').onchange=imgRender;$('imageHidden').onchange=imgRender;$('moreImages').onclick=()=>{imgLimit+=24;imgRender()};
function picture(src){return new Promise((resolve,reject)=>{const im=new Image();im.onload=()=>resolve(im);im.onerror=()=>reject(Error('Imagem não carregada'));im.src=src})}
async function imgOpen(x){try{await window.BMAccountRuntime.openImage(x.no,x.title)}catch(e){alert(e.message)}}
window.BM169PdfInitPromise=pdfInit();void loadTopics();

/* Banco Mestre V343 — Petrobras 27. Publica 7 evoluções em IDs existentes.
 * 11 propostas ficam em página apartada, sem SRS; originais privados não são expostos.
 * Preserva renderizadores V342 e anteriores, inclusive todos os históricos.
 */
(function(){
'use strict';
if(window.BM343Petro27)return;
const previousRenderer=window.BM198Format, previousLayers=window.BM276LayerData;
if(!previousRenderer?.render||!previousLayers?.get)throw Error('V343: leitor de cartões indisponível');
const path='assets/petro27_sync_v343.json?v=343-1';
const ids=new Set(['CARD-0199','CARD-0388','CARD-0454','CARD-0731','CARD-1320','CARD-1304','CARD-1319']);
let data=null,promise=null;
const mediaStatus=new Map();
const el=(name,cls,value)=>{
 const e=document.createElement(name);
 if(cls)e.className=cls;
 if(value!==undefined)e.textContent=String(value);
 return e;
};
function load(){
 if(!promise)promise=fetch(path,{cache:'no-store'}).then(r=>{
  if(!r.ok)throw Error('V343: pacote de estudos indisponível');
  return r.json();
 }).then(p=>{
  if(p.format!=='BancoMestrePetro27SyncV343'||Object.keys(p.existing||{}).length!==7||
     Object.keys(p.proposals||{}).length!==11)throw Error('V343: inventário não corresponde aos 18 registros');
  for(const [id,o] of Object.entries({...p.existing,...p.proposals})){
   if(o.layers?.length!==11||o.layers.some((m,i)=>m.ord!==i+1||!m.titulo||!m.texto)||
      !o.front||!o.back)throw Error('V343: conteúdo didático incompleto '+id);
  }
  data=p;return p;
 }).catch(e=>{promise=null;throw e});
 return promise;
}
const oldGet=previousLayers.get.bind(previousLayers);
window.BM276LayerData=Object.freeze({...previousLayers,
 has(id){return ids.has(id)||previousLayers.has?.(id)===true},
 async get(id){
  if(!ids.has(id))return oldGet(id);
  const [p,old]=await Promise.all([load(),oldGet(id)]);
  return {id,layers:p.existing[id].layers,prior_layers:old?.layers||[],
    prior_technical_record:old||null,updated:'2026-11-23',
    petro27_published_v343:true};
 }
});
const patterns={
 'CARD-0199':[['dois paralelos','core'],['quatro locais','condition'],['four-way','agent'],['interruptor simples','exception']],
 'CARD-0388':[['viajantes','core'],['3 bornes','condition'],['four-way','agent'],['não','exception']],
 'CARD-0454':[['retorno','core'],['F2','condition',true],['V1','agent'],['neutro','exception']],
 'CARD-0731':[['potência reativa','core'],['corrente','condition'],['capacitor','agent'],['não','exception']],
 'CARD-1320':[['diâmetro interno','core'],['espessura','condition'],['PN','agent'],['não','exception']],
 'CARD-1304':[['agregado','core'],['Amsler','exception',true],['Los Angeles','agent'],['não','exception']],
 'CARD-1319':[['umidade crítica','core',true],['3,7%','condition'],['areia','agent'],['não','exception']]
};
function marked(raw,id){
 const p=el('p','bm330-para');
 const text=String(raw).replace(/\*\*/g,'');
 const found=[];
 for(const [t,k,b] of patterns[id]||[]){
  const offset=text.toLocaleLowerCase('pt-BR').indexOf(t.toLocaleLowerCase('pt-BR'));
  if(offset>=0)found.push({a:offset,z:offset+t.length,k,b:!!b});
 }
 found.sort((a,b)=>a.a-b.a||b.z-a.z);
 let cursor=0;
 for(const m of found){
  if(m.a<cursor)continue;
  p.append(document.createTextNode(text.slice(cursor,m.a)));
  const mark=el('mark','bm343-highlight bm343-'+m.k);
  if(m.b)mark.append(el('strong','',text.slice(m.a,m.z)));
  else mark.textContent=text.slice(m.a,m.z);
  p.append(mark);cursor=m.z;
 }
 p.append(document.createTextNode(text.slice(cursor)));
 return p;
}
const tables={
 'CARD-0199':{headers:['Locais','Paralelos','Intermediários'],rows:[['1','0 (1 simples)','0'],['2','2','0'],['3','2','1'],['4','2','2'],['5','2','3']]},
 'CARD-0388':{headers:['Chave','Terminais','Função'],rows:[['Three-way','3 (um comum)','Seleciona um de dois viajantes'],['Four-way','4','Conecta viajantes em direto ou cruzado']]},
 'CARD-0454':{headers:['Trecho da questão Q54','Condutores'],rows:[['Tomada existente','F1 + N1'],['Novo three-way','F2 + V1 + V2'],['Total do trecho','5 condutores (sem PE na questão)']]},
 'CARD-0731':{headers:['Grandeza','FP = 0,80','FP = 0,96'],rows:[['P ativa','30 kW','30 kW'],['S aparente','37,50 kVA','31,25 kVA'],['Q da fonte','22,50 kvar','8,75 kvar'],['Qc necessário','—','13,75 kvar']]},
 'CARD-1320':{headers:['Grandeza','PE100 PN10 / SDR17','PE100 PN16 / SDR11'],rows:[['De','110 mm','110 mm'],['Parede e','6,6 mm','10,0 mm'],['Di','96,8 mm','90,0 mm'],['Velocidade Q=10 L/s','1,36 m/s','1,57 m/s']]},
 'CARD-1304':{headers:['Objeto de ensaio','Ensaio característico'],rows:[['Agregado graúdo','Los Angeles; absorção; sanidade'],['Agregado com ligante','Adesividade'],['Placa rochosa','Amsler'],['Mistura compactada','Marshall; tração indireta conforme método']]},
 'CARD-1319':{headers:['Conceito','Interpretação do caso'],rows:[['Coeficiente de inchamento','V_úmido / V_seco; exemplo máximo ≈ 1,34'],['Umidade crítica','Projeção do ponto U → ≈ 3,7%'],['Região do máximo','Próxima a 7%; não confundir com umidade crítica']]}
};
function tableFor(id){
 const definition=tables[id];if(!definition)return null;
 const wrap=el('div','bm343-table-wrap'),table=el('table','bm343-table'),head=el('thead'),hr=el('tr');
 for(const h of definition.headers){const th=el('th','',h);th.scope='col';hr.append(th);}
 head.append(hr);table.append(head);
 const body=el('tbody');
 for(const row of definition.rows){const tr=el('tr');row.forEach((v,i)=>{const cell=el(i?'td':'th','',v);if(i===0)cell.scope='row';tr.append(cell);});body.append(tr);}
 table.append(body);wrap.append(table);return wrap;
}
function appendMedia(root,p,id){
 for(const med of data.media.filter(m=>m.card_ids.includes(id))){
  const fig=el('figure','bm343-figure');fig.dataset.mediaId=med.media_id;fig.dataset.mediaRole='VERSO_APOS_TENTATIVA';
  const a=el('a');a.href=med.src;a.target='_blank';a.rel='noopener noreferrer';
  const img=el('img');img.src=med.src;img.loading='lazy';img.decoding='async';img.alt='Diagrama técnico vetorial relacionado a '+p.title;
  a.append(img);fig.append(a,el('figcaption','',med.source));
  const badge=el('small','bm343-media-status','Verificando carregamento da figura…');
  badge.dataset.status='PENDENTE';
  const check=()=>{
   const state=img.complete?(img.naturalWidth>0?'CARREGADA':'FALHA'):'CARREGANDO';
   mediaStatus.set(id+'|'+med.media_id,state);
   badge.dataset.status=state;
   badge.textContent=state==='CARREGADA'?'Imagem efetivamente carregada no leitor':
    state==='FALHA'?'Falha na imagem: use o link do SVG':'Carregando SVG…';
  };
  img.addEventListener('load',check);img.addEventListener('error',check);
  fig.append(badge);root.append(fig);check();
 }
 if(p.media_original_pending){
  root.append(el('p','bm343-warning',
   'Gráfico original preservado na ficha de estudo; a cópia íntegra no Atlas e a exibição no cartão ainda exigem verificação. Não substituir por imagem derivada imprecisa.'));
 }
}
function mainFor(id,p){
 const root=el('article','bm330-learning bm343-reading');root.dataset.bm343Id=id;
 root.append(el('div','bm343-caption','RESPOSTA-MODELO • '+id),el('h3','',p.title));
 const essay=el('div','bm343-essay');
 for(const para of p.paragraphs||[p.back])essay.append(marked(para,id));
 root.append(essay);
 const table=tableFor(id);if(table)root.append(table);
 if(id==='CARD-0454'){
  const caseTitle=el('details','bm343-evolution');caseTitle.append(el('summary','','Duas questões de aplicação: três lâmpadas e cinco condutores'));
  caseTitle.append(el('p','', 'Q39: três lâmpadas ligadas em paralelo recebem o RETORNO comum a partir do último three-way; os dois viajantes estão entre os comutadores. Gabarito E.'));
  caseTitle.append(el('p','', 'Q54: entre tomada e teto, mantêm-se F1+N1 e entram F2+V1+V2 para o novo three-way: cinco condutores, sob as hipóteses do croqui e sem contabilizar PE. Gabarito D.'));
  root.append(caseTitle);
 }
 appendMedia(root,p,id);
 root.append(el('p','bm343-related','Relacionados (cobertura editorial): '+(p.related_card_ids||[]).join(' · ')));
 const note=el('p','bm343-source','Origem didática: Petrobras 27. ');
 const source=el('a','', 'Abrir ficha de origem no Drive');
 source.href=p.source_url;source.target='_blank';source.rel='noopener noreferrer';note.append(source);root.append(note);
 return root;
}
function foldFor(id,p,record){
 const box=el('details','bm330-evolution bm343-evolution');
 box.append(el('summary','','Resposta evolutiva integral — 11 módulos e histórico'));
 const body=el('div');
 const question=el('details');question.append(el('summary','','Pergunta adicional para recuperação ativa'));
 question.append(el('p','',p.front));body.append(question);
 const modules=el('details');modules.append(el('summary','','Onze módulos didáticos atualizados'));
 for(const mod of p.layers){const row=el('section','bm343-module');row.append(el('h4','',mod.ord+'. '+mod.titulo),el('p','',mod.texto));modules.append(row);}
 body.append(modules);
 const older=record?.prior_layers?.length===11?record.prior_layers:record?.prior_technical_record?.layers;
 if(Array.isArray(older)&&older.length){
  const historic=el('details');historic.append(el('summary','','Módulos anteriores preservados'));
  for(const mod of older){const row=el('section','bm343-module');row.append(el('h4','',mod.ord+'. '+mod.titulo),el('p','',mod.texto));historic.append(row);}
  body.append(historic);
 }
 const links=el('details','bm343-evolution');
 links.append(el('summary','','Cartões relacionados (vínculos editoriais)'));
 const relList=el('div','bm343-proposal-controls');
 for(const target of p.related_card_ids||[]){
  const b=el('button','',target);b.type='button';b.dataset.referenceCardId=target;
  b.addEventListener('click',event=>{
   event.preventDefault();
   if(window.BM317RelatedNavigator?.openReferenced){
    window.BM317RelatedNavigator.openReferenced(target);
   }else{
    const message=el('small','bm343-warning','Navegador de relacionados indisponível nesta sessão.');
    relList.append(message);b.disabled=true;
   }
  });
  relList.append(b);
 }
 links.append(relList);body.append(links);
 const footer=el('p','bm343-source','Original do cartão, respostas anteriores e SRS não foram substituídos por esta camada.');
 body.append(footer);box.append(body);return box;
}
function render(host,record,id){
 if(!ids.has(id))return previousRenderer.render(host,record,id);
 if(!data){
  host.replaceChildren(el('p','bm343-reading','Carregando evolução didática…'));
  load().then(()=>{
   if(host.isConnected&&(!host.closest('#bmCardPeekV050')||
       window.BancoMestreVisualizarCardV050?.currentId===id))render(host,record,id);
  }).catch(e=>{if(host.isConnected)host.replaceChildren(el('p','bm343-warning','Falha ao abrir ficha: '+e.message));});
  return{loading:true,modules:11,srsChanged:false};
 }
 const p=data.existing[id],main=mainFor(id,p),history=foldFor(id,p,record);
 const pane=host.closest('.bm197-evolutive'),modal=host.closest('#bmCardPeekV050');
 if(modal&&pane&&window.BancoMestreVisualizarCardV050?.currentId===id){
  const parent=pane.parentElement;
  for(const old of parent.querySelectorAll('article[data-bm343-id]'))old.remove();
  pane.before(main);host.replaceChildren(history);pane.classList.add('bm343-evolution-pane');
 }else host.replaceChildren(main,history);
 return{modules:11,visuals:data.media.filter(x=>x.card_ids.includes(id)).length,
  version:'V343-PETRO27',srsChanged:false};
}
window.BM198Format=Object.freeze({...previousRenderer,render,version:'V343-PETRO27'});
function mountLink(){
 const where=document.querySelector('header .head nav')||document.querySelector('header .head');
 if(!where||document.querySelector('[data-bm343-proposals]'))return;
 const a=el('a','bm343-launch','Petrobras 27 • propostas');
 a.href='petro27_v343.html';a.dataset.bm343Proposals='yes';where.append(a);
}
// Atalho histórico removido do cabeçalho no modo Drive individual.
window.BM343Petro27=Object.freeze({ids:[...ids],load,
 proposals_url:'petro27_v343.html',srs_changed:false,private_originals_published:false,
 inspect:(id)=>data?data.media.filter(x=>x.card_ids.includes(id)).map(m=>({
  media_id:m.media_id,status:mediaStatus.get(id+'|'+m.media_id)||'SEM_TESTE_DE_CARREGAMENTO'})):[]});
load().catch(e=>console.warn('V343 pacote Petrobras 27',e));
})();
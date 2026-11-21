/* Banco Mestre V336 — correção editorial da V335 conforme Metodologia Mestre v014 e padrão V333.
   14 cartões: 3 novos e 11 relacionados. Dados didáticos versionados em JSON externo.
   Renderizador único, sem alteração do SRS ou publicação de mídias privadas.
*/
(function(){
 'use strict';
 if(window.BM336Editorial) return;
 const previous=window.BM198Format;
 if(!previous||typeof previous.render!=='function')return;
 const target=new Set(['CARD-1539','CARD-1540','CARD-1541','CARD-0230','CARD-0404',
 'CARD-0521','CARD-0857','CARD-0858','CARD-0479','CARD-1212','CARD-1385',
 'CARD-1432','CARD-1434','CARD-1435']);
 const dataUrl='assets/petro25_editorial_v336.json?v=336-2';
 let promise=null, editorial=null;
 function el(tag,cl,txt){
  const e=document.createElement(tag);
  if(cl)e.className=cl;
  if(txt!==undefined)e.textContent=String(txt);
  return e;
 }
 function load(){
  if(!promise)promise=fetch(dataUrl,{cache:'no-store'}).then(r=>{
   if(!r.ok)throw Error('V336: respostas-modelo indisponíveis '+r.status);
   return r.json();
  }).then(d=>{
   if(d.format!=='BancoMestreV333CompliantEditorialV336'||
     !d.items||Object.keys(d.items).length!==14||
     [...target].some(id=>!d.items[id]||d.items[id].paragraphs?.length<2||
       d.items[id].paragraphs.some(p=>!p.trim())))
      throw Error('V336: corpus editorial incompleto');
   for(const x of Object.values(d.items)){
    for(const key of x.formulas||[])if(!formulae[key])throw Error('V336: fórmula não definida: '+key);
    if(x.table&&(x.table.headers.length<2||x.table.rows.some(row=>row.length!==x.table.headers.length)))
     throw Error('V336: quadro técnico inconsistente');
   }
   editorial=d;return d;
  }).catch(err=>{promise=null;throw err;});
  return promise;
 }
 // Nós matemáticos nativos (MathML), com frações e índices estruturados.
 const n=x=>'<mn>'+x+'</mn>',t=x=>'<mtext>'+x+'</mtext>',o=x=>'<mo>'+x+'</mo>';
 const v=x=>'<mi>'+x+'</mi>',s=(base,index)=>'<msub><mi>'+base+'</mi><mtext>'+index+'</mtext></msub>';
 const row=(...items)=>'<mrow>'+items.join('')+'</mrow>';
 const f=(a,b)=>'<mfrac>'+a+b+'</mfrac>';
 const times=o('×'),eq=o('='),plus=o('+'),minus=o('−'),approx=o('≈');
 const formulae={
  inclination_cut:['Inclinações de corte (vertical/horizontal)',
   row(s('y','2'),eq,n(4),times,f(n(3),n(2)),eq,n(6),t(' m'),o(';'),s('y','1'),eq,n(6),times,f(n(3),n(2)),eq,n(9),t(' m'))],
  inclination_fill:['Declividade do aterro e valor de x',
   row(f(n(4),row(n(2),plus,v('x'))),eq,f(n(2),n(3)),o('⇒'),v('x'),eq,n(4),t(' m'))],
  area_e322_cut:['Corte: triângulo maior menos áreas excluídas',
   row(s('A','c'),eq,f(row(n(29),times,n(15)),n(2)),minus,o('('),n(48),plus,n(36),plus,n(27),o(')'),eq,n('106,5'),t(' m²'))],
  area_e322_fill:['Aterro: dois triângulos auxiliares',
   row(s('A','a'),eq,f(row(n(6),times,n(4)),n(2)),minus,f(row(n(2),times,n(4)),n(2)),eq,n(8),t(' m²'))],
  avg_areas:['Método das áreas médias para trecho homogêneo',
   row(v('V'),eq,f(row(s('A','1'),plus,s('A','2')),n(2)),times,v('L'))],
  excavation:['Volume da escavação',
   row(s('V','esc'),eq,n(2),times,n(2),times,o('('),n('0,7'),plus,n('1,2'),plus,n('0,1'),o(')'),eq,n(8),t(' m³'))],
  reearth:['Volume de reaterro geométrico',
   row(s('V','reaterro'),eq,n(8),minus,n('0,4'),minus,n('1,2'),minus,n('0,028'),eq,n('6,372'),t(' m³'))],
  reearth_check:['Conferência: prisma acima do concreto magro',
   row(s('V','reaterro'),eq,n('7,6'),minus,n('1,2'),minus,n('0,028'),eq,n('6,372'),t(' m³'))],
  passage_dc:['Distância de corte até a seção nula',
   row(s('d','c'),eq,f(row(n(5),times,n(50)),row(n(50),plus,n(85))),approx,n('1,852'),t(' m'))],
  passage_da:['Distância de aterro desde a seção nula',
   row(s('d','a'),eq,f(row(n(5),times,n(85)),row(n(50),plus,n(85))),approx,n('3,148'),t(' m'))],
  passage_cut:['Volume geométrico do subtrecho de corte',
   row(s('V','c'),eq,f(row(n(50),plus,n(0)),n(2)),times,s('d','c'),approx,n('46,30'),t(' m³'))],
  passage_fill:['Volume geométrico do subtrecho de aterro',
   row(s('V','a'),eq,f(row(n(0),plus,n(85)),n(2)),times,s('d','a'),approx,n('133,80'),t(' m³'))],
  passage_usable:['Corte efetivamente compensável',
   row(s('V','útil'),eq,n('0,70'),times,n('46,2963'),approx,n('32,41'),t(' m³'))],
  passage_shortfall:['Déficit de aterro sob hipóteses compatíveis',
   row(s('V','déficit'),eq,n('133,7963'),minus,n('32,4074'),approx,n('101,39'),t(' m³'))],
  gc:['Definição física do grau de compactação',
   row(v('GC'),eq,f(s('ρ','d,campo'),s('ρ','d,máx')),times,n(100),t(' %'))],
  swelling_k:['Fator direto de empolamento',
   row(s('V','solto'),eq,v('k'),times,s('V','natural'),eq,n('1,25'),times,n(55),eq,n('68,75'),t(' m³'))],
  swelling_phi:['Fator inverso definido no outro enunciado',
   row(s('V','natural'),eq,v('φ'),times,s('V','solto'),eq,n('0,85'),times,n(360),eq,n(306),t(' m³'))],
  swelling_depth:['Profundidade do corte',
   row(v('h'),eq,f(n(306),n(200)),eq,n('1,53'),t(' m'))],
  swelling_pct:['Empolamento percentual relativo ao volume natural',
   row(v('E'),eq,f(row(n(360),minus,n(306)),n(306)),times,n(100),approx,n('17,65'),t(' %'))],
  shrinkage_ratio:['Contração relativa ao volume original',
   row(v('C'),eq,o('('),n(1),minus,f(n('45,65'),n(55)),o(')'),times,n(100),eq,n(17),t(' %'))],
  shrinkage_factor:['Fator natural/compactado',
   row(s('V','natural'),eq,n('1,20'),times,s('V','compactado'),eq,n('1,20'),times,n(150),eq,n(180),t(' m³'))],
  linear_excavation:['Largura vezes profundidade média linear vezes comprimento',
   row(v('V'),eq,v('b'),times,v('L'),times,f(row(s('h','1'),plus,s('h','2')),n(2)))],
  linear_excavation_example:['Exemplo de profundidades extremas distintas',
   row(v('V'),eq,n(4),times,n(20),times,f(row(n('0,5'),plus,n('1,5')),n(2)),eq,n(80),t(' m³'))],
  dry_mass:['Conservação da massa seca sem perda de sólidos',
   row(s('ρ','d,n'),times,s('V','n'),eq,s('ρ','d,s'),times,s('V','s'),eq,s('ρ','d,c'),times,s('V','c'))]
 };
 function richParagraph(text){
  const p=el('p','bm330-para');
  // **ênfase** e ==grifo== são marcações editoriais seguras; sem HTML arbitrário.
  const token=/(\*\*[^*]+\*\*|==[^=]+==)/g;
  let pos=0,match,hasMark=false;
  while((match=token.exec(text))){
   if(match.index>pos)p.append(document.createTextNode(text.slice(pos,match.index)));
   const word=match[0].slice(2,-2);
   const highlighted=match[0].startsWith('==')||!hasMark;
   const node=el(highlighted?'mark':'strong',highlighted?'bm330-highlight':'',word);
   if(highlighted)hasMark=true;
   p.append(node);pos=token.lastIndex;
  }
  if(pos<text.length)p.append(document.createTextNode(text.slice(pos)));
  return p;
 }
 function createMath(key){
  const pair=formulae[key];
  const item=el('div','bm332-formula-item bm336-formula-item');
  item.append(el('span','',pair[0]));
  const box=el('div','bm330-equation');
  // Fórmulas compostas exclusivamente de fragmentos MathML constantes deste módulo.
  box.innerHTML='<math xmlns="http://www.w3.org/1998/Math/MathML" display="block" aria-label="'+pair[0]+'">'+pair[1]+'</math>';
  item.append(box);return item;
 }
 function createTable(d){
  if(!d)return null;
  const group=el('section','bm330-information bm336-information');
  group.append(el('h4','','Quadro de referência · grandezas e comparações'));
  const sc=el('div','bm330-table-wrap');
  const table=el('table','bm330-table');
  const head=document.createElement('thead'),hr=document.createElement('tr');
  for(const h of d.headers){const th=el('th','',h);th.scope='col';hr.append(th);}
  head.append(hr);table.append(head);
  const body=document.createElement('tbody');
  for(const rowValues of d.rows){
   const tr=document.createElement('tr');
   rowValues.forEach((value,i)=>{const cell=el(i===0?'th':'td','',value);if(i===0)cell.scope='row';tr.append(cell);});
   body.append(tr);
  }
  table.append(body);sc.append(table);group.append(sc);return group;
 }
 function createMain(id,d){
  const main=el('article','bm330-learning bm336-learning');
  main.setAttribute('data-bm336-id',id);
  main.append(el('div','bm330-caption','RESPOSTA-MODELO · '+id));
  main.append(el('h3','',d.title));
  const essay=el('div','bm330-essay');
  for(const p of d.paragraphs)essay.append(richParagraph(p));
  main.append(essay);
  if(d.formulas?.length){
   const area=el('section','bm330-formula-area');
   area.append(el('h4','','Equações essenciais · hipóteses indicadas no texto'));
   for(const key of d.formulas)area.append(createMath(key));
   area.append(el('p','bm330-legend','Áreas em m², distâncias em m e volumes em m³. Cada fórmula exige as hipóteses da resposta-modelo.'));
   main.append(area);
  }
  const table=createTable(d.table);if(table)main.append(table);
  if(d.note)main.append(el('p','bm330-note',d.note));
  return main;
 }
 function foldedHistory(host,record,id,main){
  const historic=el('div','bm330-legacy');
  previous.render(historic,record,id);
  const evolution=el('details','bm330-evolution bm332-evolution bm336-evolution');
  const summary=el('summary','bm332-evolution-summary');
  summary.append(el('span','','Resposta evolutiva integral'),
    el('small','','Verso original, versões anteriores, 11 módulos e histórico'));
  evolution.append(summary);
  const inside=el('div','bm332-evolution-inside');
  const oldQuestion=editorial?.items?.[id]?.front_history_v335;
  if(oldQuestion){
   const frontHistory=el('details','bm332-inner-accordion');
   frontHistory.append(el('summary','','Frente anterior · V335 preservada'));
   frontHistory.append(el('p','bm336-oldfront',oldQuestion));
   inside.append(frontHistory);
  }
  const modal=host.closest('#bmCardPeekV050');
  const pane=host.closest('.bm197-evolutive');
  if(modal&&pane&&window.BancoMestreVisualizarCardV050?.currentId===id){
   const answer=modal.querySelector('.bm-v050-peek-answer');
   const essential=answer?.querySelector(':scope > .bm165-essential, :scope > .bm163-essential');
   const all=[...(answer?.querySelectorAll(':scope > details.bm163-deep-group')||[])];
   const heading=x=>x.querySelector(':scope > summary')?.textContent?.toLocaleLowerCase('pt-BR')||'';
   const take=(pattern,target)=>{
    const node=all.find(x=>!x.dataset.bm336Moved&&pattern.test(heading(x)));
    if(node){node.dataset.bm336Moved='1';node.open=false;target.append(node);}
   };
   if(essential){
    const literal=el('details','bm332-inner-accordion');
    literal.append(el('summary','','Verso literal original · preservado'),essential);
    inside.append(literal);
   }
   take(/conhecimento mínimo|resposta.modelo/i,inside);
   const modules=el('details','bm332-inner-accordion bm332-complete-modules');
   modules.append(el('summary','','11 módulos didáticos completos · registro versionado'),historic);
   inside.append(modules);
   take(/histórico de tentativas|correções/i,inside);
   const extras=el('div','bm332-complements');
   take(/macetes|pegadinhas|lacunas/i,extras);
   take(/fundamentos|fontes|rastreabilidade/i,extras);
   take(/interconex|cobertura|outras informações/i,extras);
   evolution.append(inside);
   pane.before(main,extras);
   host.replaceChildren(evolution);
   pane.classList.add('bm330-evolution-pane','bm332-evolution-pane','bm336-evolution-pane');
  }else{
   const modules=el('details','bm332-inner-accordion bm332-complete-modules');
   modules.append(el('summary','','11 módulos didáticos completos · histórico'),historic);
   inside.append(modules);evolution.append(inside);
   host.replaceChildren(main,evolution);
  }
 }
 function render(host,record,id){
  if(!target.has(id))return previous.render(host,record,id);
  if(record?.layers?.length!==11||
   record.layers.some((x,i)=>x.ord!==i+1||!x.titulo?.trim?.()||!x.texto?.trim?.()))
   throw Error('V336: 11 módulos completos obrigatórios: '+id);
  if(!editorial){
   host.replaceChildren(el('p','bm336-loading','Carregando resposta-modelo atualizada…'));
   load().then(()=>{
    if(!host.isConnected)return;
    if(host.closest('#bmCardPeekV050')&&window.BancoMestreVisualizarCardV050?.currentId!==id)return;
    render(host,record,id);
   }).catch(err=>{
    if(host.isConnected)host.replaceChildren(el('p','bm336-error','Não foi possível carregar a resposta-modelo: '+err.message));
   });
   return {modules:11,loading:true,srsChanged:false};
  }
  const d=editorial.items[id];
  if(!d)throw Error('V336: cartão sem resposta editorial '+id);
  const main=createMain(id,d);
  foldedHistory(host,record,id,main);
  return {modules:11,paragraphs:d.paragraphs.length,folded:true,presentation:'V336 conforme V333',srsChanged:false};
 }
 window.BM198Format=Object.freeze({...previous,render,version:'V336-compliant-editorial'});
 const api={ids:Object.freeze([...target]),load,srs_changed:false,private_media_exposed:false};
 window.BM336Editorial=Object.freeze(api);
 load().catch(err=>console.warn('V336: carregamento inicial',err));
})();
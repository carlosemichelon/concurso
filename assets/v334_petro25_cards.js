/* V334 — PETRO25-C001. Único novo CARD-1538; evolução legítima dos relacionados.
   Registro didático separado do CSS e do SRS. Históricos e 11 módulos preservados. */
(function(){
 'use strict';
 const oldLayers=window.BM276LayerData;
 const oldFormat=window.BM198Format;
 const ID='CARD-1538';
 const file='assets/petro25_c001_card1538_v334.json?v=334-1';
 let loadOnce=null;
 function loadData(){
   if(!loadOnce)loadOnce=fetch(file,{cache:'no-store'}).then(function(r){
     if(!r.ok)throw Error('V334: conteúdo didático indisponível '+r.status);return r.json();
   }).then(function(d){
     if(d.format!=='BancoMestrePetro25IncrementV334'||d.new_cards.length!==1||
        d.new_cards[0].id!==ID||d.related_updates.length!==4||
        d.new_layers.length!==11||d.new_layers.some(function(l,i){return l.ord!==i+1||!l.texto;}))
        throw Error('V334: incremento inconsistente');
     return d;
   });
   return loadOnce;
 }
 if(oldLayers?.get){
   window.BM276LayerData=Object.freeze({
     has:function(id){return id===ID||oldLayers.has?.(id)||false;},
     get:async function(id){
       if(id!==ID&&['CARD-1155','CARD-0529','CARD-0697','CARD-1065'].indexOf(id)<0)return oldLayers.get(id);
       const d=await loadData();
       if(id===ID)return {id:ID,layers:d.new_layers.map(function(l){return {...l};})};
       const historic=await oldLayers.get(id);
       if(!historic||!Array.isArray(historic.layers)||historic.layers.length!==11)return historic;
       const delta=d.related_updates.find(function(x){return x.id===id;});
       if(!delta)return historic;
       return {...historic,layers:historic.layers.map(function(l){
         const add=delta.layers_add[String(l.ord)];
         return add?{...l,texto:l.texto+'\n\nCOMPLEMENTO PETRO25-C001 — '+add}:l;
       })};
     }
   });
 }
 if(oldFormat?.render){
   const mainHTML=[
     '<div class="bm330-caption">RESPOSTA-MODELO · CARD-1538</div>',
     '<h3>Solos expansivos, colapsíveis e viabilidade das fundações rasas</h3>',
     '<div class="bm330-essay" aria-label="Resposta discursiva em texto contínuo">',
     '<p class="bm330-para">O comportamento de um solo com o aumento da umidade depende de sua <strong>mineralogia, estrutura, estado de tensões e condição inicial</strong>. Os <mark class="bm330-highlight">solos expansivos</mark> podem <strong>aumentar de volume</strong> ao umedecer, especialmente pela ação de argilominerais suscetíveis à expansão. O movimento pode provocar <strong>levantamento da fundação</strong> e distorções diferenciais. O projeto deve considerar potencial e pressão de expansão, umidade, confinamento e medidas de controle; nem toda argila é expansiva.</p>',
     '<p class="bm330-para">Nos <mark class="bm330-highlight">solos colapsíveis</mark>, frequentemente <strong>porosos e não saturados</strong>, a estrutura pode estar em condição metaestável, sustentada parcialmente por <strong>sucção matricial</strong> e ligações entre partículas. Durante o encharcamento, essa sustentação pode diminuir e a estrutura pode se rearranjar, resultando em <mark class="bm330-condition">redução de volume e recalque sob tensão adequada</mark>. A palavra <strong>“potencialmente”</strong> é decisiva: porosidade alta e não saturação não comprovam o colapso, que demanda investigação e, quando apropriado, ensaios edométricos com inundação.</p>',
     '<p class="bm330-para">A existência de <strong>areias fofas ou aterros</strong> não constitui <mark class="bm330-condition">proibição absoluta de fundações superficiais</mark>. O projetista deve investigar a resistência e a deformabilidade do terreno, avaliar os <strong>recalques totais e diferenciais</strong>, considerar variações de água e heterogeneidade e indicar melhoria, substituição ou outro sistema se necessário. Para carga vertical centrada, <i>q</i> = <i>N</i>/<i>A</i> fornece a pressão média inicial, mas a comparação com a tensão admissível não elimina as verificações de desempenho em serviço. Assim, o raciocínio correto é: <strong>expansivo pode levantar; colapsível pode recalcar; solo fofo ou aterro exige estudo</strong>.</p>',
     '</div>',
     '<section class="bm330-information"><h4>Quadro comparativo · informações técnicas</h4>',
     '<div class="bm330-table-wrap"><table class="bm330-table"><thead><tr><th>Condição do solo</th><th>Mecanismo no molhamento</th><th>Efeito e verificação principal</th></tr></thead><tbody>',
     '<tr><th>Expansivo</th><td>Aumento volumétrico potencial por interação água–argilominerais.</td><td>Levantamento; avaliar potencial/pressão de expansão e tensões.</td></tr>',
     '<tr><th>Colapsível</th><td>Perda da estrutura metaestável ao molhar sob tensão.</td><td>Recalque; investigar com ensaios apropriados, inclusive inundação.</td></tr>',
     '<tr><th>Areia fofa / aterro</th><td>Compacidade reduzida ou material heterogêneo com deformabilidade relevante.</td><td>Não há veto automático; verificar ruptura e recalques e necessidade de tratamento.</td></tr>',
     '</tbody></table></div></section>',
     '<section class="bm330-formula-area"><h4>Expressões de apoio · sem substituir a análise geotécnica</h4>',
     '<p class="bm330-legend"><strong>Sucção matricial:</strong> <i>s</i> = <i>u</i><sub>a</sub> − <i>u</i><sub>w</sub>, em kPa. <strong>Pressão média inicial de sapata centrada:</strong> <i>q</i> = <i>N</i>/<i>A</i>, com <i>N</i> em kN e <i>A</i> em m², resultando em kPa. A magnitude de expansão ou colapso não decorre dessas fórmulas isoladamente.</p></section>',
     '<p class="bm330-note">Fontes de estudo: ABNT NBR 6122:2022, itens 7.5.2 e 7.5.3; origem PETRO25-C001. Relações: CARD-1155, CARD-0529, CARD-0697 e CARD-1065. Link TEC e edição exata da prova não informados.</p>'
   ].join('');
   function el(tag,cls,text){
     const n=document.createElement(tag);
     if(cls)n.className=cls;
     if(text!==undefined)n.textContent=text;
     return n;
   }
   function render(host,record,id){
     if(id!==ID)return oldFormat.render(host,record,id);
     if(!Array.isArray(record?.layers)||record.layers.length!==11)
       throw Error('V334: CARD-1538 precisa conter os 11 módulos');
     const main=el('article','bm330-learning');main.innerHTML=mainHTML;
     const history=el('div','bm330-legacy');
     oldFormat.render(history,record,id);
     const full=el('details','bm330-evolution bm332-evolution');
     const summary=el('summary','bm332-evolution-summary');
     summary.append(el('span','', 'Resposta evolutiva integral'),el('small','','Verso inicial, 11 módulos, fontes e histórico'));
     full.append(summary);
     const inside=el('div','bm332-evolution-inside');
     const modules=el('details','bm332-inner-accordion bm332-complete-modules');
     modules.append(el('summary','','11 módulos didáticos completos · texto e rastreabilidade'),history);
     inside.append(modules);full.append(inside);
     const pane=host.closest('.bm197-evolutive');
     const modal=host.closest('#bmCardPeekV050');
     if(pane&&modal&&window.BancoMestreVisualizarCardV050?.currentId===ID){
       pane.before(main);
       host.replaceChildren(full);
       pane.classList.add('bm330-evolution-pane','bm332-evolution-pane');
     }else{
       host.replaceChildren(main,full);
     }
     return {modules:11,folded:true,presentation:'V334, padrão V333',srsChanged:false};
   }
   window.BM198Format=Object.freeze({...oldFormat,render,version:'V334-PETRO25-C001'});
 }
 window.BM334Petro25=Object.freeze({id:ID,related_ids:['CARD-1155','CARD-0529','CARD-0697','CARD-1065'],load:loadData,srs_changed:false});
})();

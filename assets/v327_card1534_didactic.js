/* V327 — CARD-1534: apresentação didática flexível, sem alterar conteúdo canônico ou SRS.
   Integra os critérios 01, 02, 04, 05 e 06; mantém os 11 módulos históricos consultáveis. */
(function(){
 'use strict';
 if(window.BM327Card1534||!window.BM198Format?.render)return;
 const previous=window.BM198Format, ID='CARD-1534';
 const node=(tag,cls,txt)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(txt!==undefined)e.textContent=String(txt);return e};
 function math(parent,html,accessible){
  const wrap=node('div','bm327-equation');wrap.innerHTML='<math xmlns="http://www.w3.org/1998/Math/MathML" display="block" aria-label="'+accessible+'">'+html+'</math>';
  parent.append(wrap);
 }
 function lesson(record){
  const root=node('article','bm327-learning');
  root.innerHTML=[
   '<header class="bm327-lesson-head"><span class="bm327-eyebrow">RESPOSTA-MODELO · CARD-1534</span><h3>Emendas por traspasse — o que medir, calcular e comparar</h3><p>Três conceitos diferentes são cobrados na NBR 6118. Primeiro, entenda como a força passa de uma barra para outra; depois separe <strong>comprimento da emenda</strong>, <strong>distância entre emendas</strong> e <strong>percentual de barras emendadas</strong>.</p></header>',
   '<div class="bm327-body">',
   '<h4>1. O mecanismo: duas barras formam uma emenda</h4>',
   '<p>Na emenda por traspasse, as duas barras ficam sobrepostas por um comprimento <i>ℓ</i><sub>0</sub>. A força é transferida por <mark class="bm327-key">aderência aço–concreto–aço</mark>, e não por contato direto entre as pontas. Por isso, entram no dimensionamento o comprimento necessário de ancoragem, as condições de aderência e a possibilidade de fendilhamento do concreto.</p>',
   '<p>Já a distância <i>x</i> é medida <strong>entre duas emendas distintas</strong>. A regra dos 20% serve para decidir se elas serão <mark class="bm327-key">contadas na mesma seção transversal</mark>; não estabelece o comprimento mínimo de sobreposição de duas barras.</p>',
   '<h4>2. Quadro de comparação — três conceitos que não podem ser confundidos</h4>',
   '<div class="bm327-table-wrap"><table class="bm327-table"><thead><tr><th>Conceito</th><th>O que representa</th><th>Regra de decisão</th></tr></thead><tbody>',
   '<tr><th>Comprimento <i>ℓ</i><sub>0</sub></th><td>Trecho em que <strong>duas barras</strong> se sobrepõem e formam <strong>uma emenda</strong>.</td><td>Dimensionamento pela ancoragem/aderência e pelos mínimos normativos.</td></tr>',
   '<tr><th>Distância <i>x</i></th><td>Intervalo longitudinal entre <strong>duas emendas distintas</strong>.</td><td>Podem ser tratadas na mesma seção se os trechos se sobrepõem ou se <i>x</i> é <mark class="bm327-condition">inferior a 20%</mark> do comprimento de referência.</td></tr>',
   '<tr><th>Percentual de barras</th><td>Fração das barras principais tracionadas emendadas na região considerada.</td><td>Aplicar limites da <strong>Tabela 9.3</strong>, conforme tipo de barra, camadas e natureza da ação.</td></tr>',
   '</tbody></table></div>',
   '<h4>3. Aplicação direta da questão de 80 cm</h4>',
   '<p>A questão informa duas emendas de <strong>80 cm cada</strong>. Como não há sobreposição entre elas, a distância que as faz contar na mesma seção deve satisfazer:</p>',
   '<div data-bm327-math="distance"></div>',
   '<p>Portanto, <mark class="bm327-value"><strong>x &lt; 16 cm</strong></mark> — alternativa D. <strong>x = 16 cm</strong> não atende à expressão estrita “inferior a” (se não houver sobreposição). Os <strong>80 cm</strong> são dados geométricos da questão, e os <strong>16 cm</strong> são apenas o limiar da distância entre emendas, <strong>não</strong> o comprimento exigido de traspasse.</p>',
   '<h4>4. Como calcular o comprimento de traspasse tracionado</h4>',
   '<p>Para barras <strong>tracionadas isoladas</strong>, com distância livre entre as barras emendadas de 0 a 4 diâmetros, o comprimento deve atender à expressão resistente e ao mínimo normativo:</p>',
   '<div data-bm327-math="main"></div><div data-bm327-math="minimum"></div>',
   '<p><strong>Variáveis:</strong> <i>ℓ</i><sub>b,nec</sub> é o comprimento necessário de ancoragem; <i>ℓ</i><sub>b</sub> é o comprimento básico de ancoragem; <i>φ</i> é o diâmetro da barra; <i>α</i><sub>0t</sub> é o coeficiente que depende da proporção de barras emendadas. Os comprimentos e o diâmetro devem estar em <strong>unidades coerentes (mm)</strong>.</p>',
   '<p><mark class="bm327-condition">Importante:</mark> o mínimo calculado não substitui a fórmula principal. O comprimento adotado deve satisfazer <strong>ambas</strong> as exigências. Não há um comprimento máximo universal em centímetros; há outras restrições normativas de aplicação.</p>',
   '<h4>5. Limites percentuais da seção — Tabela 9.3</h4>',
   '<div class="bm327-table-wrap"><table class="bm327-table"><thead><tr><th>Barras tracionadas</th><th>Ação estática</th><th>Ação dinâmica</th></tr></thead><tbody>',
   '<tr><th>Alta aderência, uma camada</th><td><strong>100%</strong></td><td><strong>100%</strong></td></tr>',
   '<tr><th>Alta aderência, mais de uma camada</th><td><strong>50%</strong></td><td><strong>50%</strong></td></tr>',
   '<tr><th>Lisas, φ &lt; 16 mm</th><td><strong>50%</strong></td><td><strong>25%</strong></td></tr>',
   '<tr><th>Lisas, φ ≥ 16 mm</th><td><strong>25%</strong></td><td><strong>25%</strong></td></tr>',
   '</tbody></table></div>',
   '<p class="bm327-caption">Quadro de estudo transcrito do módulo 06 do cartão. Percentuais excepcionais e casos de armaduras comprimidas/de distribuição exigem leitura das ressalvas normativas.</p>',
   '<h4>6. Coeficiente <i>α</i><sub>0t</sub> — Tabela 9.4</h4>',
   '<div class="bm327-table-wrap"><table class="bm327-table bm327-table-compact"><thead><tr><th>Barras emendadas na seção</th><th>Até 20%</th><th>25%</th><th>33%</th><th>50%</th><th>Mais de 50%</th></tr></thead><tbody><tr><th><i>α</i><sub>0t</sub></th><td>1,2</td><td>1,4</td><td>1,6</td><td>1,8</td><td>2,0</td></tr></tbody></table></div>',
   '<p><strong>Exemplo independente:</strong> para φ = 20 mm, <i>ℓ</i><sub>b</sub> = 600 mm, <i>ℓ</i><sub>b,nec</sub> = 500 mm e 50% de barras emendadas, <i>α</i><sub>0t</sub> = 1,8. A fórmula principal fornece <strong>900 mm</strong>; o mínimo é o maior entre 324 mm, 300 mm e 200 mm, isto é, <strong>324 mm</strong>. Logo, neste exemplo, a condição determinante é <mark class="bm327-value">900 mm</mark>, não 324 mm.</p>',
   '<div class="bm327-recall"><strong>Fixação ativa</strong><p>Duas barras → uma emenda → comprimento <i>ℓ</i><sub>0</sub>. Duas emendas → distância <i>x</i>. Várias barras emendadas → percentual na mesma seção. <strong>20% agrupa emendas; a Tabela 9.3 limita a proporção; o maior valor de cálculo e mínimo governa <i>ℓ</i><sub>0t</sub>.</strong></p></div>',
   '<div class="bm327-mini"><strong>Atenção à edição normativa</strong><p>O material histórico do cartão distingue a escolha da bitola de referência em emendas entre barras de diâmetros diferentes: <strong>maior diâmetro</strong> na edição 2014 e <strong>menor diâmetro</strong> na edição 2023. Para aplicação atual, cotejar a edição consolidada com a Emenda 1/2026.</p></div>',
   '<div class="bm327-mini bm327-sources"><strong>Origem e aprofundamento</strong><p>ABNT NBR 6118, seção 9.5.2; Figura 9.3, Tabelas 9.3 e 9.4. Questão Petrobras 22 — PETRO22-Q003. Cartões relacionados: CARD-0578 (ancoragem) e CARD-0924 (taxa de armadura).</p></div>',
   '</div>'
  ].join('');
  const mathBlocks={
    distance:'<mrow><mi>x</mi><mo>&lt;</mo><mn>0,20</mn><mo>×</mo><msub><mi>ℓ</mi><mrow><mn>0</mn><mo>,</mo><mi>ref</mi></mrow></msub><mo>=</mo><mn>0,20</mn><mo>×</mo><mn>80</mn><mtext> cm </mtext><mo>=</mo><mn>16</mn><mtext> cm</mtext></mrow>',
    main:'<mrow><msub><mi>ℓ</mi><mrow><mn>0</mn><mi>t</mi></mrow></msub><mo>=</mo><msub><mi>α</mi><mrow><mn>0</mn><mi>t</mi></mrow></msub><mo>·</mo><msub><mi>ℓ</mi><mrow><mi>b</mi><mo>,</mo><mi>nec</mi></mrow></msub><mspace width="0.65em"/><mo>≥</mo><mspace width="0.3em"/><msub><mi>ℓ</mi><mrow><mn>0</mn><mi>t</mi><mo>,</mo><mi>mín</mi></mrow></msub></mrow>',
    minimum:'<mrow><msub><mi>ℓ</mi><mrow><mn>0</mn><mi>t</mi><mo>,</mo><mi>mín</mi></mrow></msub><mo>=</mo><mi mathvariant="normal">max</mi><mo>(</mo><mn>0,3</mn><mo>·</mo><msub><mi>α</mi><mrow><mn>0</mn><mi>t</mi></mrow></msub><mo>·</mo><msub><mi>ℓ</mi><mi>b</mi></msub><mo>;</mo><mn>15</mn><mi>φ</mi><mo>;</mo><mn>200</mn><mtext> mm</mtext><mo>)</mo></mrow>'
  };
  root.querySelectorAll('[data-bm327-math]').forEach(el=>math(el,mathBlocks[el.dataset.bm327Math]||'','Expressão matemática de traspasse'));
  // Arquivos originais permanecem textualmente intactos; esta é só a vista didática.
  return root;
 }
 function render(host,record,id){
  if(id!==ID)return previous.render(host,record,id);
  if(!Array.isArray(record?.layers)||record.layers.length!==11||record.layers.some((l,i)=>l.ord!==i+1||!l.titulo||!l.texto))throw Error('Módulos históricos incompletos');
  const root=lesson(record),history=node('details','bm327-history'),histTitle=node('summary','','Consultar os 11 módulos originais completos (histórico preservado)');
  const raw=node('div','bm327-history-content');
  previous.render(raw,record,id);
  history.append(histTitle,raw);
  const modal=host.closest('#bmCardPeekV050');
  if(modal&&window.BancoMestreVisualizarCardV050?.currentId===ID){
   const answer=modal.querySelector('.bm-v050-peek-answer');
   const original=answer?.querySelector(':scope > .bm165-essential,:scope > .bm163-essential');
   if(original){
    const literal=node('details','bm327-original'),sum=node('summary','','Ler texto literal do verso original (sem alterações)');
    literal.append(sum,original);
    root.append(literal);
   }
   host.closest('.bm197-evolutive')?.classList.add('bm327-lesson-pane');
  }
  root.append(history);
  host.replaceChildren(root);
  return {modules:11,integrated:true};
 }
 window.BM198Format=Object.freeze({...previous,render,version:'V327-card1534'});
 window.BM327Card1534=Object.freeze({id:ID,mode:'estudo-integrado',source:'11 módulos públicos preservados'});
})();
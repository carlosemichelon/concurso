/* V330 — CARD-1534: resposta integrada em três parágrafos, quadro somente informativo;
   resposta evolutiva integral recolhida. Preserva módulos, originais, IDs e SRS. */
(function(){
 'use strict';
 if(window.BM330Card1534||!window.BM198Format?.render)return;
 const prior=window.BM198Format, ID='CARD-1534';
 const el=(tag,cls,txt)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(txt!==undefined)e.textContent=String(txt);return e;};
 const M={
  dist:'<mrow><mi>x</mi><mo>&lt;</mo><mn>0,20</mn><mo>·</mo><msub><mi>ℓ</mi><mrow><mn>0</mn><mo>,</mo><mi>ref</mi></mrow></msub><mo>=</mo><mn>0,20</mn><mo>·</mo><mn>80</mn><mtext> cm</mtext><mo>=</mo><mn>16</mn><mtext> cm</mtext></mrow>',
  main:'<mrow><msub><mi>ℓ</mi><mrow><mn>0</mn><mi>t</mi></mrow></msub><mo>=</mo><msub><mi>α</mi><mrow><mn>0</mn><mi>t</mi></mrow></msub><mo>·</mo><msub><mi>ℓ</mi><mrow><mi>b</mi><mo>,</mo><mi>nec</mi></mrow></msub><mspace width="0.55em"/><mo>≥</mo><mspace width="0.2em"/><msub><mi>ℓ</mi><mrow><mn>0</mn><mi>t</mi><mo>,</mo><mi>mín</mi></mrow></msub></mrow>',
  min:'<mrow><msub><mi>ℓ</mi><mrow><mn>0</mn><mi>t</mi><mo>,</mo><mi>mín</mi></mrow></msub><mo>=</mo><mi mathvariant="normal">max</mi><mo>(</mo><mn>0,3</mn><mo>·</mo><msub><mi>α</mi><mrow><mn>0</mn><mi>t</mi></mrow></msub><mo>·</mo><msub><mi>ℓ</mi><mi>b</mi></msub><mo>;</mo><mn>15</mn><mi>φ</mi><mo>;</mo><mn>200</mn><mtext> mm</mtext><mo>)</mo></mrow>'
 };
 const data=[
  '<div class="bm330-caption">RESPOSTA-MODELO · CARD-1534</div>',
  '<h3>Emendas por traspasse: três conceitos, uma explicação completa</h3>',
  '<div class="bm330-essay" aria-label="Explicação integrada em três parágrafos">',
  '<p class="bm330-para"><span class="bm330-parano">01</span> A <mark class="bm330-highlight">emenda por traspasse</mark> é formada pela sobreposição de <strong>duas barras</strong> durante um comprimento <i>ℓ</i><sub>0</sub>. A transferência de esforços ocorre pela <strong>aderência entre aço e concreto</strong>: a força passa de uma barra ao concreto e deste à outra, com possibilidade de tensões transversais de fendilhamento. Portanto, o comprimento da emenda é dimensionado pelas condições de ancoragem e resistência; ele não deve ser confundido com a distância entre duas emendas distintas nem com a porcentagem de barras emendadas em uma região.</p>',
  '<p class="bm330-para"><span class="bm330-parano">02</span> Quando <strong>duas emendas distintas</strong> se sobrepõem longitudinalmente, ou quando a distância <i>x</i> entre as extremidades mais próximas é <mark class="bm330-condition">inferior a 20% do comprimento de referência</mark>, elas são consideradas na mesma seção para a contagem de barras emendadas. Na questão, cada emenda mede <strong>80 cm</strong>, de modo que o limite geométrico é <mark class="bm330-value"><i>x</i> &lt; 16 cm</mark> (alternativa D). Em <i>x</i> = 16 cm, sem superposição, o critério estrito “inferior a” não é satisfeito. Os 80 cm são o dado da emenda, enquanto 16 cm é o limite de proximidade <strong>entre emendas</strong>. A <strong>proporção máxima de barras</strong> na mesma seção é outro assunto, tratado separadamente na Tabela 9.3 da NBR 6118.</p>',
  '<p class="bm330-para"><span class="bm330-parano">03</span> Para <strong>barras tracionadas isoladas</strong>, nas condições previstas de distância livre entre barras emendadas de 0 a 4<i>φ</i>, o comprimento de traspasse <i>ℓ</i><sub>0t</sub> é obtido com o fator <i>α</i><sub>0t</sub> aplicado ao comprimento necessário de ancoragem <i>ℓ</i><sub>b,nec</sub> e <mark class="bm330-condition">não pode ser inferior ao mínimo normativo</mark>, calculado pelo maior valor entre 0,3<i>α</i><sub>0t</sub><i>ℓ</i><sub>b</sub>, 15<i>φ</i> e 200 mm. Assim, existe <strong>comprimento mínimo calculado</strong>, mas não um comprimento máximo universal em centímetros; prevalecem a expressão de cálculo e as restrições aplicáveis. Para barras de diâmetros diferentes, o registro histórico distingue a bitola de referência <strong>maior na edição 2014</strong> e <strong>menor na edição 2023</strong>, exigindo conferência da edição normativa adotada.</p>',
  '</div>',
  '<div class="bm330-formula-area"><h4>Equações essenciais · módulo 05</h4>',
  '<div class="bm330-equation" data-eq="dist"></div>',
  '<div class="bm330-equation" data-eq="main"></div>',
  '<div class="bm330-equation" data-eq="min"></div>',
  '<p class="bm330-legend"><i>ℓ</i><sub>b</sub> = ancoragem básica; <i>ℓ</i><sub>b,nec</sub> = ancoragem necessária; <i>φ</i> = diâmetro da barra; <i>α</i><sub>0t</sub> = coeficiente da proporção emendada (adimensional). Comprimentos e diâmetro em unidades consistentes, usualmente <strong>mm</strong>.</p>',
  '</div>',
  '<div class="bm330-information"><h4>Quadro 06 — informações de referência</h4>',
  '<div class="bm330-table-wrap"><table class="bm330-table"><thead><tr><th>Elemento</th><th>Significado técnico</th><th>Grandeza / referência</th></tr></thead><tbody>',
  '<tr><th>Uma emenda</th><td>Duas barras sobrepostas, com transferência por aderência.</td><td>Comprimento <i>ℓ</i><sub>0</sub> (cm ou mm)</td></tr>',
  '<tr><th>Duas emendas</th><td>Trechos de traspasse distintos cuja proximidade pode fazê-los pertencer à mesma seção de contagem.</td><td>Distância longitudinal <i>x</i>; referência de 20% de <i>ℓ</i><sub>0,ref</sub></td></tr>',
  '<tr><th>Barras na seção</th><td>Quantidade relativa de barras principais tracionadas emendadas em uma mesma região.</td><td>Proporção em %; Tabela 9.3</td></tr>',
  '<tr><th>Comprimento calculado</th><td>Comprimento de traspasse em barras tracionadas isoladas.</td><td><i>ℓ</i><sub>0t</sub>, <i>ℓ</i><sub>0t,mín</sub>; coeficiente da Tabela 9.4</td></tr>',
  '</tbody></table></div>',
  '<div class="bm330-tables-mini"><div><strong>Tabela 9.3 · alta aderência</strong><p>Uma camada: 100% para ações estáticas e dinâmicas. Mais de uma camada: 50% em ambas.</p></div>',
  '<div><strong>Tabela 9.3 · barras lisas</strong><p>φ &lt; 16 mm: 50% estática / 25% dinâmica. φ ≥ 16 mm: 25% / 25%.</p></div>',
  '<div><strong>Tabela 9.4 · coeficiente α<sub>0t</sub></strong><p>Até 20%: 1,2; 25%: 1,4; 33%: 1,6; 50%: 1,8; acima de 50%: 2,0.</p></div></div>',
  '</div>',
  '<p class="bm330-note">Fonte de estudo: NBR 6118, seção 9.5.2, Figura 9.3, Tabelas 9.3 e 9.4. Questão PETRO22-Q003. Vínculos: CARD-0578 e CARD-0924. Aplicação profissional: conferir edição normativa consolidada.</p>'
 ];
 function formula(host,kind){
  const caption=kind==='dist'?'Distância inferior a dezesseis centímetros':kind==='main'?'Comprimento de traspasse calculado superior ao mínimo':'Mínimo é o maior entre três parcelas';
  host.innerHTML='<math xmlns="http://www.w3.org/1998/Math/MathML" display="block" aria-label="'+caption+'">'+M[kind]+'</math>';
 }
 function build(){
  const root=el('article','bm330-learning');root.innerHTML=data.join('');
  root.querySelectorAll('[data-eq]').forEach(n=>formula(n,n.dataset.eq));return root;
 }
 function render(host,record,id){
  if(id!==ID)return prior.render(host,record,id);
  if(!Array.isArray(record?.layers)||record.layers.length!==11||record.layers.some((l,i)=>l.ord!==i+1||!l.titulo?.trim?.()||!l.texto?.trim?.()))throw Error('CARD-1534: módulos históricos inválidos');
  const main=build(), historical=el('div','bm330-legacy');
  prior.render(historical,record,id);
  const collapse=el('details','bm330-evolution'),sum=el('summary','','Resposta evolutiva integral · consultar os 11 módulos e o verso literal');
  collapse.append(sum);
  const modal=host.closest('#bmCardPeekV050'),pane=host.closest('.bm197-evolutive');
  if(modal&&pane&&window.BancoMestreVisualizarCardV050?.currentId===ID){
   const answer=modal.querySelector('.bm-v050-peek-answer');
   const original=answer?.querySelector(':scope > .bm165-essential, :scope > .bm163-essential');
   if(original){
    const source=el('details','bm330-original'),sourceSummary=el('summary','','Verso literal original · texto preservado sem modificações');
    source.append(sourceSummary,original);collapse.append(source);
   }
   collapse.append(historical);host.replaceChildren(collapse);
   pane.classList.add('bm330-evolution-pane');
   pane.before(main);
  }else{
   collapse.append(historical);
   host.replaceChildren(main,collapse);
  }
  return {modules:11,integratedParagraphs:3,folded:true};
 }
 window.BM198Format=Object.freeze({...prior,render,version:'V330-card1534'});
 window.BM330Card1534=Object.freeze({id:ID,paragraphs:3,fullHistory:true,srsChanged:false});
})();
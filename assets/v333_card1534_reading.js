/* V333 — CARD-1534: resposta integrada em três parágrafos, quadro somente informativo;
   resposta evolutiva integral recolhida. Preserva módulos, originais, IDs e SRS. */
(function(){
 'use strict';
 if(window.BM333Card1534||!window.BM198Format?.render)return;
 const prior=window.BM198Format, ID='CARD-1534';
 const el=(tag,cls,txt)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(txt!==undefined)e.textContent=String(txt);return e;};
 const M={
  dist:'<mrow><mi>x</mi><mo>&lt;</mo><mn>0,20</mn><mo>·</mo><msub><mi>ℓ</mi><mrow><mn>0</mn><mo>,</mo><mi>ref</mi></mrow></msub><mo>=</mo><mn>0,20</mn><mo>·</mo><mn>80</mn><mtext> cm</mtext><mo>=</mo><mn>16</mn><mtext> cm</mtext></mrow>',
  main:'<mrow><msub><mi>ℓ</mi><mrow><mn>0</mn><mi>t</mi></mrow></msub><mo>=</mo><msub><mi>α</mi><mrow><mn>0</mn><mi>t</mi></mrow></msub><mo>·</mo><msub><mi>ℓ</mi><mrow><mi>b</mi><mo>,</mo><mi>nec</mi></mrow></msub><mspace width="0.55em"/><mo>≥</mo><mspace width="0.2em"/><msub><mi>ℓ</mi><mrow><mn>0</mn><mi>t</mi><mo>,</mo><mi>mín</mi></mrow></msub></mrow>',
  min:'<mrow><msub><mi>ℓ</mi><mrow><mn>0</mn><mi>t</mi><mo>,</mo><mi>mín</mi></mrow></msub><mo>=</mo><mi mathvariant="normal">max</mi><mo>(</mo><mn>0,3</mn><mo>·</mo><msub><mi>α</mi><mrow><mn>0</mn><mi>t</mi></mrow></msub><mo>·</mo><msub><mi>ℓ</mi><mi>b</mi></msub><mo>;</mo><mn>15</mn><mi>φ</mi><mo>;</mo><mn>200</mn><mtext> mm</mtext><mo>)</mo></mrow>'
 };
 const data=[
  '<div class="bm330-caption">RESPOSTA-MODELO · CARD-1534</div>',
  '<h3>Emendas por traspasse: comprimento, distância e proporção de barras</h3>',
  '<div class="bm330-essay" aria-label="Resposta discursiva integrada em texto contínuo">',
  '<p class="bm330-para">A <mark class="bm330-highlight">emenda por traspasse</mark> é formada pela sobreposição de <strong>duas barras</strong> durante um comprimento <i>ℓ</i><sub>0</sub>. A transferência de esforços ocorre pela <strong>aderência entre aço e concreto</strong>: a força passa de uma barra ao concreto e deste à outra, com possibilidade de tensões transversais de fendilhamento. Portanto, o comprimento da emenda é dimensionado pelas condições de ancoragem e resistência; ele não deve ser confundido com a distância entre duas emendas distintas nem com a porcentagem de barras emendadas em uma região.</p>',
  '<p class="bm330-para">Quando <strong>duas emendas distintas</strong> se sobrepõem longitudinalmente, ou quando a distância <i>x</i> entre as extremidades mais próximas é <mark class="bm330-condition">inferior a 20% do comprimento de referência</mark>, elas são consideradas na mesma seção para a contagem de barras emendadas. Na questão, cada emenda mede <strong>80 cm</strong>, de modo que o limite geométrico é <mark class="bm330-value"><i>x</i> &lt; 16 cm</mark> (alternativa D). Em <i>x</i> = 16 cm, sem superposição, o critério estrito “inferior a” não é satisfeito. Os 80 cm são o dado da emenda, enquanto 16 cm é o limite de proximidade <strong>entre emendas</strong>. A <strong>proporção máxima de barras</strong> na mesma seção é outro assunto, tratado separadamente na Tabela 9.3 da NBR 6118.</p>',
  '<p class="bm330-para">Para <strong>barras tracionadas isoladas</strong>, nas condições previstas de distância livre entre barras emendadas de 0 a 4<i>φ</i>, o comprimento de traspasse <i>ℓ</i><sub>0t</sub> é obtido com o fator <i>α</i><sub>0t</sub> aplicado ao comprimento necessário de ancoragem <i>ℓ</i><sub>b,nec</sub> e <mark class="bm330-condition">não pode ser inferior ao mínimo normativo</mark>, calculado pelo maior valor entre 0,3<i>α</i><sub>0t</sub><i>ℓ</i><sub>b</sub>, 15<i>φ</i> e 200 mm. Assim, existe <strong>comprimento mínimo calculado</strong>, mas não um comprimento máximo universal em centímetros; prevalecem a expressão de cálculo e as restrições aplicáveis. Para barras de diâmetros diferentes, o registro histórico distingue a bitola de referência <strong>maior na edição 2014</strong> e <strong>menor na edição 2023</strong>, exigindo conferência da edição normativa adotada.</p>',
  '</div>',
  '<div class="bm330-formula-area"><h4>Equações essenciais · módulo 05</h4>',
  '<div class="bm332-formula-item"><span>Distância entre duas emendas</span><div class="bm330-equation" data-eq="dist"></div></div>',
  '<div class="bm332-formula-item"><span>Comprimento de traspasse tracionado</span><div class="bm330-equation" data-eq="main"></div></div>',
  '<div class="bm332-formula-item"><span>Comprimento mínimo normativo</span><div class="bm330-equation" data-eq="min"></div></div>',
  '<p class="bm330-legend"><i>ℓ</i><sub>b</sub> = ancoragem básica; <i>ℓ</i><sub>b,nec</sub> = ancoragem necessária; <i>φ</i> = diâmetro da barra; <i>α</i><sub>0t</sub> = coeficiente da proporção emendada (adimensional). Comprimentos e diâmetro em unidades consistentes, usualmente <strong>mm</strong>.</p>',
  '</div>',
  '<div class="bm330-information"><h4>Quadro 06 — informações de referência</h4>',
  '<div class="bm330-table-wrap"><table class="bm330-table"><thead><tr><th>Elemento</th><th>Significado técnico</th><th>Grandeza / referência</th></tr></thead><tbody>',
  '<tr><th>Uma emenda</th><td>Duas barras sobrepostas, com transferência por aderência.</td><td>Comprimento <i>ℓ</i><sub>0</sub> (cm ou mm)</td></tr>',
  '<tr><th>Duas emendas</th><td>Trechos de traspasse distintos cuja proximidade pode fazê-los pertencer à mesma seção de contagem.</td><td>Distância longitudinal <i>x</i>; referência de 20% de <i>ℓ</i><sub>0,ref</sub></td></tr>',
  '<tr><th>Barras na seção</th><td>Quantidade relativa de barras principais tracionadas emendadas em uma mesma região.</td><td>Proporção em %; Tabela 9.3</td></tr>',
  '<tr><th>Comprimento calculado</th><td>Comprimento de traspasse em barras tracionadas isoladas.</td><td><i>ℓ</i><sub>0t</sub>, <i>ℓ</i><sub>0t,mín</sub>; coeficiente da Tabela 9.4</td></tr>',
  '</tbody></table></div>',
  '<div class="bm332-reference-grid">',
  '<div class="bm332-reference-section"><strong>Tabela 9.3 · proporção máxima de barras tracionadas emendadas</strong>',
  '<div class="bm330-table-wrap"><table class="bm330-table bm332-small-table"><thead><tr><th>Tipo e disposição das barras</th><th>Estática</th><th>Dinâmica</th></tr></thead><tbody>',
  '<tr><th>Alta aderência · uma camada</th><td>100%</td><td>100%</td></tr>',
  '<tr><th>Alta aderência · mais de uma camada</th><td>50%</td><td>50%</td></tr>',
  '<tr><th>Lisas · φ &lt; 16 mm</th><td>50%</td><td>25%</td></tr>',
  '<tr><th>Lisas · φ ≥ 16 mm</th><td>25%</td><td>25%</td></tr>',
  '</tbody></table></div></div>',
  '<div class="bm332-reference-section"><strong>Tabela 9.4 · coeficiente α<sub>0t</sub></strong>',
  '<div class="bm330-table-wrap"><table class="bm330-table bm332-small-table"><thead><tr><th>Barras emendadas</th><th>α<sub>0t</sub></th></tr></thead><tbody>',
  '<tr><th>Até 20%</th><td>1,2</td></tr><tr><th>25%</th><td>1,4</td></tr><tr><th>33%</th><td>1,6</td></tr><tr><th>50%</th><td>1,8</td></tr><tr><th>Mais de 50%</th><td>2,0</td></tr>',
  '</tbody></table></div></div></div>',
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
  if(!Array.isArray(record?.layers)||record.layers.length!==11||
     record.layers.some((l,i)=>l.ord!==i+1||!l.titulo?.trim?.()||!l.texto?.trim?.()))
    throw Error('CARD-1534: os onze módulos históricos precisam estar íntegros');
  const main=build(), historical=el('div','bm330-legacy');
  prior.render(historical,record,id);
  const evolution=el('details','bm330-evolution bm332-evolution');
  const summary=el('summary','bm332-evolution-summary');
  summary.append(el('span','','Resposta evolutiva integral'),el('small','','Verso literal, versões anteriores, 11 módulos e histórico'));
  evolution.append(summary);
  const inside=el('div','bm332-evolution-inside');
  const modal=host.closest('#bmCardPeekV050'),pane=host.closest('.bm197-evolutive');
  if(modal&&pane&&window.BancoMestreVisualizarCardV050?.currentId===ID){
    const answer=modal.querySelector('.bm-v050-peek-answer');
    const essential=answer?.querySelector(':scope > .bm165-essential, :scope > .bm163-essential');
    const allGroups=[...(answer?.querySelectorAll(':scope > details.bm163-deep-group')||[])];
    const heading=d=>d.querySelector(':scope > summary')?.textContent?.toLocaleLowerCase('pt-BR')||'';
    const moveGroup=(pattern,into)=>{
      const match=allGroups.find(d=>!d.dataset.bm332Moved&&pattern.test(heading(d)));
      if(match){
        match.dataset.bm332Moved='1';match.open=false;into.append(match);
      }
      return match;
    };
    if(essential){
      const literal=el('details','bm332-inner-accordion');
      literal.append(el('summary','','Verso literal original · sem alterações'),essential);
      inside.append(literal);
    }
    moveGroup(/conhecimento mínimo|resposta.modelo/i,inside);
    const modules=el('details','bm332-inner-accordion bm332-complete-modules');
    modules.append(el('summary','','11 módulos didáticos completos · histórico preservado'),historical);
    inside.append(modules);
    moveGroup(/histórico de tentativas|correções/i,inside);
    evolution.append(inside);
    const extras=el('div','bm332-complements');
    moveGroup(/macetes|pegadinhas|lacunas/i,extras);
    moveGroup(/fundamentos|fontes|rastreabilidade/i,extras);
    moveGroup(/interconex|cobertura|outras informações/i,extras);
    pane.before(main,extras);
    host.replaceChildren(evolution);
    pane.classList.add('bm330-evolution-pane','bm332-evolution-pane');
    // Nenhum conteúdo do Banco Mestre é apagado: os componentes antigos são
    // transferidos como nós DOM para a apresentação histórica/recolhível.
  }else{
    const modules=el('details','bm332-inner-accordion bm332-complete-modules');
    modules.append(el('summary','','11 módulos didáticos completos · histórico preservado'),historical);
    inside.append(modules);evolution.append(inside);
    host.replaceChildren(main,evolution);
  }
  return {modules:11,integratedParagraphs:3,folded:true,presentation:'V333 texto corrido branco'};
 }
 window.BM198Format=Object.freeze({...prior,render,version:'V333-card1534'});
 window.BM333Card1534=Object.freeze({id:ID,paragraphs:3,fullHistory:true,srsChanged:false});
})();
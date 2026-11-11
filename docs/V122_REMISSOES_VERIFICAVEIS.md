# V122 — Remissões jurídicas com destino explícito e abstenção segura

Data: 11/11/2026. Base de comparação: V121 publicada em `gh-pages`. A V121 não é editada.

## Defeito corrigido

Na V121, a referência `art. 37 da Constituição Federal` lida dentro de PDF com perfil **Lei 9.784/1999** era associada a `LEI9784:art37`. O classificador atribuía o número do artigo à lei ativa, sem verificar qual norma era citada.

A nova camada `assets/v122_remissoes.js` só atribui destino quando existe um indício textual explícito de identidade da norma. Exemplos **sintéticos** de teste:

| Trecho | Resultado |
| --- | --- |
| Art. 37 da Constituição Federal | `target=CF88:art37`; `resolution=explicit_law` |
| Art. 50 da Lei 14.133/2021 | `target=LEI14133:art50`; `resolution=explicit_law` |
| Art. 5º desta Lei (perfil Lei 9.784) | `target=LEI9784:art5`; `resolution=explicit_internal` |
| Nos termos do art. 7º (sem lei identificada) | `target=null`; `suggested_target=LEI9784:art7`; `resolution=contextual_unverified` |
| Art. 9º da Lei 16.999/2024 (fora do catálogo) | `target=null`; `resolution=unsupported_law` |

Em todos os casos, `verified_source=false`. O modelo identifica a **referência escrita**, não certifica a redação oficial, a vigência, revogação, contexto do PDF nem jurisprudência.

## Isolamento e não regressão

O módulo é carregado após `assets/v121_relacoes_normativas.js`, antes do grifador V111. Ele muda **somente os metadados de referências em resultados novos**, sem editar, migrar ou recolorir grifos anteriores e sem escrever localStorage/IndexedDB/Drive.

As quatro cores continuam intactas, bem como SRS, flashcards, nomes e IDs, `v120_highlight_groups.js`, `v120_biblioteca_grifos.js`, `v120_painel_grifos.js`, cache/índice público dos 1.499 cartões, 22 cartões Ijuí, 72 PDFs e 270 imagens.

Uma referência ambígua pode ter `suggested_target`, mas nunca deve ser mostrada como `target` confirmado. Trechos com normas fora do catálogo não são vinculados à lei ativa. A busca da norma citada é limitada à frase para que a Constituição mencionada depois de um ponto ou ponto e vírgula não contamine a referência anterior. Abreviaturas jurídicas como `n.` continuam aceitas.

## Auditoria reproduzível

- `tests/v122_remissoes.cjs`: casos internos, externos, sem identificação, normas não catalogadas, múltiplas referências, limites de frase, abreviaturas, ausência de perfil, imutabilidade dos tokens e comparação das cores com o classificador V121 original.
- `tests/v122_portal.cjs`: comparação **byte a byte reconstruída** do carregador V122 com a V121, além de manifesto/entrada e módulos obrigatórios.
- Workflow `.github/workflows/validar-remissoes-v122.yml`: mantém os testes V114 e V121, roda os dois testes V122 com Node 22 sem dependências novas.

**Limite dos testes:** as frases de referência são cenários sintéticos e verificações de regressão. Não estimam precisão estatística em um corpus de leis reais e não substituem homologação visual em um navegador com PDF/OAuth real.

## Próximo estágio recomendado — treinamento de fato

1. Coleção ouro de dispositivos e remissões **com fonte oficial, lei, artigo, edição e redação**, anotada com intervalos por palavra.
2. Separo treino/validação/teste **por documento e norma**, evitando vazamento de artigos semelhantes.
3. Avaliar precisão por cor e por vínculo (destino, origem e abstenção), não somente taxa de acerto lexical. Incluir adversariais de alteração, revogação, exceção e leis não catalogadas.
4. Apenas depois comparar BERTimbau ou modelo jurídico português ajustado com o classificador determinístico, sem habilitar grifo automático se aumentar falsos positivos.

Fontes estruturais: Constituição Federal oficial da Câmara dos Deputados, https://www2.camara.leg.br/legin/fed/consti/1988/constituicao-1988-5-outubro-1988-322142-normaatualizada-pl.html ; Lei Complementar 95/1998, https://www2.camara.leg.br/legin/fed/leicom/1998/leicomplementar-95-26-fevereiro-1998-363948-normaatualizada-pl.html .

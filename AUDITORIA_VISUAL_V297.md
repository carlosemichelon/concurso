# Auditoria V297 — Banco Mestre (19/11/2026)

## Evidências no código
- CSS V296: `#imagens #bm209SyncBar :is(input,select,button,summary)` impunha cor escura em botões de fundo azul. Corrigido.
- CSS V296: seletor de etiquetas `.tag,.chip,.pill` abrangia indicadores funcionais. Estilo neutro restrito a `.tag`.
- CSS V296: regra geral dos botões nos cartões abrangia classes `.primary` e `.danger`; agora excluídas.
- CSS V296: título do cartão no celular reduzido para 15 px, corpo para 14 px; agora 16 px / 15 px.
- HTML V296: texto orientava a clicar em uma ação de verificação de PDFs removida na V293. Atualizado.
- Relatórios de SHA podem trazer textos longos; área de relatório agora quebra texto sem mudar cálculo/resultado.

## Garantias e limites
- `index.html` e `v297.html` idênticos no commit.
- Fonte anterior `v296.html`/CSS V296 preservada.
- Não houve alteração nos JSON de cartões, IDs, 11 módulos, Drive, imagens, SRS, PDFs ou mecanismo de SHA.
- Validação de código e manifesto: **estática**, sem confirmação da renderização mobile/desktop nem OAuth no navegador real.

## Correção de metadados pós-CI
- O teste V216 revelou que `current_versions.portal` preservava o ponteiro histórico V277, divergindo da entrada V297. Corrigidos `version`, `home`, `previous` e `previous_version` no manifesto; demais catálogos de conteúdo não foram tocados.
- A falha do teste era de consistência de versão, **não demonstra falha OAuth**. Reexecução de CI é necessária para confirmar o conserto.

## Teste V277 × portal corrente V297
- O teste `tests/v277_header_bundle.cjs` fixava 14 CSS e 135 JS tanto em `v277.html` quanto no `index.html`, mesmo após mudanças de versão. Isso causou falso negativo no workflow V263.
- Arquivo histórico V277 permanece validado com contagens rígidas originais (14/135). No portal atual, a validação usa o manifesto e **orçamento explícito V297 de 29 CSS e 149 JS**, conferindo duplicações, existência de cada recurso, ordem da última camada e identidade entre `index.html` e `v297.html`.
- **Dívida técnica registrada:** os 29 CSS carregados incluem camadas históricas; não removê-las sem teste visual/funcional autenticado e comparação da cascata. O teste não declara que a consolidação física já foi feita.

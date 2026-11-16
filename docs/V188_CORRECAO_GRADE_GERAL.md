# V188 — Grade de cartões do agrupamento Geral (16/11/2026)

## Problema reproduzido
Em `assets/v128_assuntos_gerais.js`, a classe `.bm128CardsGrid` recebe `display:grid` e `grid-template-columns:repeat(auto-fit,minmax(min(100%,310px),1fr))`. Quando o grupo contém somente um cartão — exemplo trazido pelo usuário: CARD-0001 em **Instalações e Edificações** — o `auto-fit` colapsa as trilhas vazias e a única célula ocupa a largura inteira, parecendo um cartão destacado.

## Correção
Novo arquivo `assets/v188_general_cards_grid.css`, referenciado por `v188.html`, usa seletor mais específico `#cartoes .bm128CardsGroup > .bm128CardsGrid` e `repeat(auto-fill,minmax(min(100%,310px),1fr))`. Assim as trilhas vazias permanecem e o cartão mantém largura semelhante aos demais cartões da grade. Até 680 px, a grade continua em uma coluna. Nenhum campo, ID, grupo, conteúdo, mídia ou SRS foi alterado.

## Conferência
Teste de reprodução do HTML do usuário com 1, 2 e 5 cartões, no Chromium headless via `page.set_content` (o ambiente bloqueia navegação externa e `file://`).

- 1440 px: grupo 1180 px, 3 colunas; cartão isolado ~381 px;
- 900 px: grupo 870 px, 2 colunas; cartão isolado ~422 px;
- 620 px: uma coluna, layout mobile;
- 390 px: uma coluna, layout mobile.

O teste reinjetou deliberadamente a regra V128 *depois* da V188 para conferir precedência por especificidade. Todos passaram. **Validação da interface real no navegador do usuário ainda é recomendada**, pois o teste usa uma reprodução do trecho HTML e não toda a aplicação.

## Preservação e rollback
V187 original preservada em `v187.html`, backup de código `backup/v187-before-general-cards-grid-v188-20261116`. Manifesto e página inicial apontam V188; a correção é exclusivamente CSS. Não altera a janela de leitura V165, a integração privada V187, os 11 adiados, checkpoints V186, sincronizadores V185, diário V184, PDFs, imagens ou SRS.

Para reverter, abrir `v187.html` diretamente ou recolocar V187 no manifesto/entrada após conferência.
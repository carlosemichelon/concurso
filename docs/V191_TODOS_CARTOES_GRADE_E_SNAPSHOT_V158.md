# V191 — Todos os cartões em grade, base privada V158 (16/11/2026)

## Por que a grade parecia incompleta
O `cardRender` da base V062 exibía inicialmente só `a.slice(0,cardLimit)`, e `cardLimit` iniciava em 24. A V128 agrupava as cartas renderizadas em `<details class="bm128CardsGroup">`, produzindo grupos separados mesmo com **Todos** selecionado. A correção V188 impediu uma única célula de ocupar a linha, mas não resolveu a limitação de 24 ou os agrupamentos no filtro Todos.

## Solução V191
- Novo JS `assets/v191_all_cards_grid.js` e CSS `assets/v191_all_cards_grid.css`, carregados ao fim da V190.
- Com os quatro filtros em **Todos** e nenhum link de grupo específico selecionado: carregar **todos** os cartões disponíveis no catálogo em uma única grade plana, sem grupos `<details>` separados; ocultar botão legado "Mais".
- Com filtro específico ativo: restaurar o limite inicial de 24 cartões e a organização por grupo; manter a paginação existente.
- Inativos continuam fora da fila de estudo até marcar **Mostrar 17 inativos**; cartões ocultados pelo usuário permanecem sujeitos ao controle próprio.
- Todos os nós `article.card` são **movidos**, nunca recriados ou reescritos pelo complemento da grade. Seu conteúdo, IDs, histórico e listeners permanecem.
- Em celular a grade permanece em uma coluna; no desktop, colunas responsivas.
- Sem alteração de histórico/SRS, Drive, PDFs, imagens ou conteúdo técnico.
- Preserva a V190 como `v190.html` e a branch de backup `backup/v190-before-grade-todos-v191-20261116`.

## Base privada atualizada
O arquivo privado `BANCO_MESTRE_PRIVADO_V158_SYNC_2026-11-16.json` foi criado **a partir da V045** e do overlay V157, com conferência:
- 1.518 IDs únicos (1.501 ativos, 17 inativos), sem CARD-1499;
- Frentes, versos originais, estados, 19 questões, 11 imagens, 4 avaliações pendentes e os 1.518 registros SRS preservados literalmente;
- 11 camadas nos 1.501 ativos na V157; 1.490 aprofundamentos disponíveis no snapshot V158; 11 cartões críticos separados para homologação posterior;
- SHA-256 após upload/readback de Drive: `9a7c6b88a2442fbdb525d57c6b81030dd44c13e431876bd11ea061c5d85b7319`;
- Acesso restrito ao proprietário no Drive. A V045 original não foi sobrescrita.

**Importante:** as 11 camadas indicam completude **estrutural**, não homologação normativa; a conciliação completa de eventos de estudo/SRS entre conversas e navegadores ainda não está comprovada. Em V045 há campos SRS históricos com nomes aparentemente trocados (`last_date` por rótulo Errei/Bom/Fácil e `grade` por data); foram mantidos sem modificação à espera de exame de proveniência.

O site **não publica** o JSON privado. A biblioteca pública ainda contém 1.499 IDs e 22 cartões operacionais de Ijuí. Para exibir os 1.518 registros privados, o usuário deve entrar em Flashcards, autenticar o Drive, escolher o snapshot **V158** e carregar. A grade Todos então lista os 1.501 ativos mais os 22 operacionais (ou os 1.518 +22 se o controle de inativos estiver marcado).

## Testes executados
Chromium em HTML sintético com 1.518 registros +22 operacionais: larguras 1.440, 900 e 390 px. Em cada largura:
- Todos: 1.523 `article.card`, sem `details.bm128CardsGroup` na raiz;
- filtro específico: 24 cartões e agrupamento legado;
- retorno a Todos: 1.523;
- com inativos marcados: 1.540;
- sem desabilitar botão/seletores do leitor; CSS responsivo 3/2/1 colunas conforme largura.

**Pendência:** teste da renderização completa e do OAuth real no navegador do usuário. O ensaio sintético verifica a lógica, não substitui testes end-to-end no site autenticado.

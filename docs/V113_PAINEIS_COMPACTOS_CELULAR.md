# V113 — Compactação dos painéis acima dos cartões, PDFs, imagens e grifos

Data: 11/11/2026. Backup anterior: `backup/v112-before-compact-panels-v113-2026-11-11`.

## Solicitação
Reduzir a altura e o número de painéis **antes de**:
1. `#cardRows .v036-card-group-summary` — agrupador de cartões (ex.: Ijuí — legislação FUNDATEC).
2. `#pdfRows .v036-area-head` — cabeçalho de área PDF (ex.: Engenharia Civil — 44 documentos).
3. `#imageRows` — primeira imagem catalogada.
4. `#bm062Results > article.bm062-item` — primeiro grifo da Biblioteca de Grifos.

## Comportamento no celular (até 760 px)
**Flashcards**
- Busca e contagem sempre visíveis. Filtros já recolhíveis da V109 permanecem acessíveis.
- Introdução do painel é movida para dentro dos filtros; cabeçalhos de grupos reduzem altura, margem e padding.
- Subtítulo redundante dos grupos fica visualmente escondido, mas continua no DOM para tecnologias assistivas.
- Perguntas, respostas, IDs, botões de consulta e lógica de SRS não são alterados.

**PDFs**
- Busca e total ficam à vista. Um único `Filtros, áreas e PDFs locais` reúne orientação, importação, navegação por áreas, filtro de grupo e opção de mostrar excluídos.
- Cabeçalhos de área (`.v036-area-head`), subtítulos e agrupadores PDF (`.v036-pdf-summary`) ficam menores, com botões ainda utilizáveis por toque.
- Importação de arquivos PDF mantém seu fluxo e seus IDs. Os PDFs originais não são movidos nem reimportados.

**Imagens**
- Busca e contagem visíveis; filtros, instrução e orientação sobre originais/revisão técnica acessíveis no painel recolhível.
- `#imageRows` e todas as pranchas técnicas permanecem com IDs e conteúdo originais. Miniaturas seguem com `object-fit:contain`, sem corte.

**Biblioteca de Grifos**
- Título, botão Atualizar, resumo dos grifos, busca, filtro recolhível e contagem ficam visíveis.
- Painel `Sincronização, backups e ferramentas` recolhe a conexão com o arquivo mestre. O resumo inclui **texto atualizado do status real**, com aviso visual de erro/atenção.
- Dentro do painel principal, `Backup, exportação e diagnóstico` contém a exportação, backup legado, diagnóstico read-only, aviso e instrução; aberto sob demanda.
- `Filtrar grifos` guarda disciplina, assunto, PDF, cor, tipo, favoritos e excluídos. O resumo indica quantos filtros estão ativos.
- Todos os botões de editar, excluir, restaurar, copiar, favoritar e abrir PDF continuam na listagem. A localização original do histórico/grifos locais não é alterada.
- Os cartões de grifo são ligeiramente menores no celular, mas o texto-fonte, a nota e o formulário mantêm seu conteúdo completo.

**Cabeçalho geral**
- Marca e menu horizontal são mais baixos, com scroll horizontal dos destinos. A descrição secundária da marca é omitida apenas visualmente em telas pequenas.

## Preservação do desktop e prevenção de perdas
`assets/v113_compact_bibliotecas.js` faz *reparenting reversível de nós DOM*, guardando posições originais com marcadores internos `Comment`. Não clona elementos com ID ou handlers de evento. Ao passar de celular para desktop, devolve filtros, botões, painéis, estatísticas e notas às suas posições. No desktop os controles continuam na apresentação original, com ajustes visuais leves de densidade dos grupos.
- Não usa `localStorage.setItem`, nem `IndexedDB`, nem modifica grifos, cartões ou SRS.
- O próprio Drive V104 continua operacional e seus controles reais são apenas realocados para um `details`. Nenhuma autorização Google é acionada por abrir/fechar um painel.
- O status de sincronização é espelhado visualmente via `MutationObserver`, sem enviar dados ou ler tokens.
- Listas `#cardRows`, `#pdfRows`, `#imageRows`, `#bm062Results` permanecem fixas nos containers existentes.
- Adaptação ao tamanho: `matchMedia('(max-width:760px)')`. Os grupos recolhidos iniciam fechados no celular e são acessíveis por resumo com altura mínima próxima de 39px.

## Arquivos adicionados
- `assets/v113_compact_bibliotecas.js`: quatro painéis novos, marcações de posição, restauração de DOM e status.
- `assets/v113_compact_bibliotecas.css`: responsividade, menos margens e paddings, títulos menores, sem corte de imagens e com links/botões tocáveis.
- `v113.html`: inclui os dois módulos por último, depois de Drive V104, Biblioteca de Grifos V108, bibliotecas móveis V109 e calibrador V111. `index.html` e `assets/version.json` apontam para a V113.

## Testes
1. Sintaxe JS e CSS; composição do HTML com scripts e estilos em ordem.
2. Simulação DOM de celular, computador e retorno a celular. Verificados: menus recolhidos, pesquisa e contagem visíveis, conteúdo preservado, nós originais retornando às posições de origem, ferramentas de sincronização e botões mantidos, 4 painéis acessíveis.
3. Integridade dos grupos de flashcards e PDFs, sem mexer no catálogo ou dados.
4. Verificar que o motor de PDF com zoom por pinça, rolamento lateral, edição reversível, arquivo mestre e SRS permanece carregado.
5. Testes em Android/iOS visual e OAuth real **não realizados**, devem ser conferidos nos aparelhos para homologação final.

## Nota de segurança
O histórico dos grifos e todos os registros antigos foram mantidos. Sincronização depende de autorização e acesso real ao Google Drive; compactar o painel não comprova que essa configuração esteja operacional.

# Banco Mestre V257 — Consolidação CSS (fase segura de desempenho)

Data: 18/11/2026. Origem: solicitação para simplificar o frontend pesado que carrega sucessivas versões de CSS. Base técnica: V256 atual, que já continha as mudanças de MathML e lacunas; V255 é o último layout de Controle de Estudos e permanece preservado.

## Auditoria objetiva

- O `v256.html` carregava **94 referências de CSS externo** quando seu bootstrap montava `v062.html`: **26** arquivos herdados de `v062.html`, **66** arquivos adicionados pela shell e **2** específicos para lacunas/leitura.
- O `v257.html` monta **11 referências CSS externas**: **8 bundles CSS** (`assets/v256_css_01_base.css` até `assets/v256_css_08_layers.css`), **1 CSS legado isolado** (`assets/v051_tema_tec.css`, porque tem `@import` de fonte Google) e **2 CSS complementares** preservados (`v242_lacunas.css` e `v256_readability.css`).
- **83 referências removidas = redução de 88,3% da quantidade de requisições CSS por montagem sem cache**, mantendo o volume total de regras próximo do original. Não confundir redução de requisições com redução medida de tempo, bytes ou memória.
- Cada CSS bundle mantém as declarações dos arquivos originais **na mesma ordem**; comentários identificam o arquivo de origem. A verificação reconstruiu a sequência **exata dos 92 CSS** de base + camadas, respeitando o CSS importador V051 em seu ponto original. Nenhum arquivo antigo foi apagado.
- O carregador `v257.html` guarda a estrutura de links de `v062.html` e interrompe a substituição se qualquer URL/posição divergir, preservando invariantes antes de renderizar.

## Confirmações de integridade

- **Teste isolado de montagem**: `v256.html` e `v257.html` processados com a mesma fonte `v062.html`, usando simulação de `fetch`/DOM somente para produzir o HTML final; ambas montagens concluídas sem erro.
- **Equivalência dos scripts**: **130 tags externas em cada montagem, em ordem idêntica**; `v245_controle_native.js`, `v255_study_three_groups.js`, `v256_math_display.js`, `v256_lacunas_layout.js`, relógio inferior, calendário e visualização de Fórmulas preservados.
- **Teste negativo**: alteração deliberada de um link de CSS legado levou à interrupção de montagem da V257, como previsto pelo guard de integridade, sem escrever HTML final.
- Nenhum registro de sessão, planejamento, Flashcard ID, SRS, fonte de estudo Google Drive ou documento foi alterado.

## Limitações e sequência técnica

- **Não foi medido** tempo de carregamento, LCP, INP, CLS, download de rede ou uso de CPU no Android. A homologação visual/funcional em navegador autenticado permanece pendente.
- O portal ainda contém **130 tags externas de JS** e continua dependendo da shell dinâmica `v062.html` e de `document.write()`. Esse é o próximo conjunto de gargalos a investigar, **sem** concatenação ingênua de scripts ou mudança na ordem de execução que possa quebrar cartões, editores, PDFs, Drive e SRS.
- Os bundles foram publicados como arquivos independentes. Versão anterior `v256.html` preservada para rollback.
- O `@import` de fonte externa continua sendo um possível custo de rede e deve ser avaliado separadamente.

## Testes pendentes para certificação

1. Abrir as rotas principais com autenticação em aparelho móvel.
2. Verificar estilos específicos de PDF, grifos, atlas, leitura de questões, três abas de Controle, relógio inferior e cartões.
3. Medir com DevTools o waterfall (HTTP/2), transferências efetivas após cache e métricas de responsividade.
4. Investigar carregamento condicional e redução de JS com mapa de dependências antes de mudar a infraestrutura de scripts.

**Estados independentes:** bundle salvo no GitHub ✓; `v257.html` criado ✓; teste isolado de montagem ✓; testes em navegador real ✗; certificação de desempenho ✗.

# V098 — Ícones alinhados e nova identidade visual do portal

## Evidência e objetivo
O projeto V096 acrescentou um ícone `::before` aos botões de edição. Barras laterais V060 possuem 170px no desktop / 112px no celular (imagem: 172px/105px), sem espaço para rótulos antigos, ícones extras e botões horizontais compactos. A V098 corrige exclusivamente o layout, mantendo o mesmo componente e listener: botões em largura total, ícone em coluna fixa e rótulo flexível; grupos organizados em coluna com scroll; paleta de cores do editor, caixa de nota e zoom otimizados para telas estreitas.

## Estilo do portal
Referência visual genérica de plataforma de questões, **não clonagem do TecConcursos**: barra escura, navegação de contraste elevado e destaque azul; fundo cinza-claro, superfícies brancas, bordas discretas, espaçamento consistente, fontes do sistema e textos de interface mais claros. Ícones SVG originais V096 preservados. Arquivos novos `assets/v098_tec_visual.css`, `assets/v098_pdf_image_icons_fix.css` e `assets/v098_portal_text.js`.

## Cores dos grifos
**Não há mudança na paleta semântica V095 nem nos grifos existentes.** A metodologia anterior V070 era amarelo regra principal, verde agente/competência, rosa exceção e azul condição/limite/prazo; merece decisão separada do usuário porque a paleta V095 repete exceções em vermelho e azul. O design geral não deve interferir com essas quatro cores funcionais.

## PDF.js
A versão ativa é 3.11.174. Existe PDF.js 6.5.438 (lançado em 1º/11/2026), mas atualização major não foi aplicada por risco às dependências e seletor preciso V094/V097. Evolução sugerida: projeto experimental isolado com comparação em artigos, várias linhas e colunas, preservando produção.

## Proteções
Nenhuma alteração no core V097, agrupamento do painel de grifos, PDF.js, seletores, callbacks, dados, flashcards, SRS, sincronização Drive/Atlas, IDs ou documentos. Arquivos V097 anteriores preservados. Backup `backup/v097-before-ui-refinement-v098-2026-11-10`.

## Validação
Sintaxe de loader e módulo de textos, CSS estruturado; análise estática dos seletores e módulos. Testes de aparência em browser real desktop/Android ainda necessários antes de homologação completa.

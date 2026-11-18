# V254 — Controle de Estudos: duas abas, cronômetro único no rodapé

**Data:** 18/11/2026. Pedido: remover a aba principal «Estudar», incorporando-a a «Organizar», pois o cronômetro de horas líquidas já está disponível no relógio inferior. Manter «Ver estudado» em primeiro lugar, com calendário de atividades realizadas e planejadas.

## Organização implementada

- **Ver estudado** (primeira e padrão): **Calendário** realizado/planejado, **Histórico completo**.
- **Organizar**: **Metas e disciplinas** (tela padrão da aba), **Registro manual de sessões**, **Revisões de conteúdo** (independentes do SRS), **Ciclo de estudos**, **Resumo**, **Relatórios** e **Dados e backup**.
- Todas as nove seções originais V245 permanecem no DOM e disponíveis por navegação interna, com os mesmos IDs e event handlers.
- A seção **Registro manual** mostra apenas o formulário manual. Seu painel nativo de cronômetro é **ocultado por CSS**, não removido. O cronômetro V245 e o conector `v245_timer_bridge.js` continuam operacionais no DOM para a barra persistente `v242_timer_dock.js` no rodapé.
- O texto de ajuda no Registro manual explica que o relógio fixo inferior serve para cronometrar, não sendo necessário duplicar.
- O calendário compacto V253 e o módulo de fórmulas V250 continuam ativos.

## Arquivos versionados

- `assets/v254_study_two_tabs.js`: nova versão do orquestrador visual V252, preservando o contrato `window.BM252StudyFlow` e o evento `bm252-study-ready` necessários ao módulo V253 do calendário compacto.
- `v254.html`: carregador V254 sem o antigo script `v252_study_three_tabs.js`, que continua recuperável pelo arquivo histórico V253.
- `assets/version.json` e `index.html`: rota principal V254 e histórico de release.
- Documentos originais V253, V252 e versões anteriores não modificados.

## Integridade e certificação

- **Não houve escrita nem migração** de sessões, planos, calendários, cartões, lacunas, SRS, guias ou arquivos privados do Google Drive.
- O orquestrador V254 utiliza o motor V245 e não chama `localStorage.setItem`, `localStorage.removeItem`, exclusão de DOM funcional, ou gravações no Drive.
- A verificação estática cobre sintaxe JS, duas áreas, nove seções preservadas, formulário manual em largura completa, ocultação somente visual do cronômetro nativo, manutenção do relógio inferior, integração com V253 e leitor de fórmulas, manifesto, `index.html` e leitura de volta dos arquivos.
- **Pendências:** teste ponta a ponta em navegador real com estado local do usuário; sincronização Drive autenticada; teste visual e toque no Android; confirmar a transmissão de iniciar/pausar/salvar pelo dock em aparelho real. A verificação estrutural não equivale a essa homologação.

## Regressão evitada

Não remover IDs `timerStart`, `timerPause`, `timerSave` ou o conteúdo da primeira coluna do módulo `registro`: o relógio inferior usa esses botões nativos e os comandos da aplicação V245. Por isso, o painel de cronômetro foi apenas ocultado, mantendo acessíveis os elementos internos à ponte JavaScript.

# Banco Mestre V252 — Controle de Estudos em três abas, calendário realizado/planejado e cabeçalho móvel

**Data:** 2026-11-18. **Origem:** solicitação expressa de reorganizar o Controle em apenas três abas, com “Ver estudado” em primeiro lugar e seu calendário exibindo **estudo realizado e estudo planejado**. Alterações restritas à interface pública do ramo `gh-pages`; sem escrita em registros particulares.

## Estrutura publicada

- **Ver estudado** (primeiro): **Calendário** (tela inicial) e **Histórico completo** (conteúdo interno). No calendário, marcadores **verdes** significam sessões realizadas e registradas, **amarelos** significam atividades planejadas e dois marcadores significam coexistência. Dia selecionado mostra **sessões realizadas primeiro**, com disciplina, cadeia de assuntos, tipo, horas líquidas, questões e acertos, seguidas por atividades planejadas, status e formulário recolhível de novo planejamento.
- **Estudar**: cronômetro/registro manual e agenda de revisões de conteúdo (não SRS).
- **Organizar**: metas/disciplinas, ciclo, resumo, relatórios e dados/backup.

São **três abas no nível principal**; os nove módulos V245 permanecem tecnicamente presentes, dentro de navegação contextual, com os mesmos IDs, ações, formulários, verificações e event handlers.

## Correções de celular

- Cabeçalho externo: ícones de navegação e indicadores reduzidos a aproximadamente 11–12 px, sem diminuir o tamanho de toque dos botões.
- Calendário mensal e semanal: **7 colunas reais** (segunda a domingo) também em telefone, com dia, tempo registrado se existente e marcadores discretos. Modo Dia usa uma coluna para preservar legibilidade.
- Áreas principais: três botões amplos e iguais. Subconteúdos utilizam barra horizontal, sem nove abas concorrentes.

## Dados e verdade de sincronização

- Apenas **sessões efetivamente gravadas em `BM245_CONTROLE_ESTUDOS`** contam como estudo realizado. Registros de questões externas, cartões, outros chats e arquivos não são presumidos como sessões importadas.
- **Atividades planejadas** vêm da coleção `plans` da mesma base. Cumprimento de tarefa planejada é diferente de registro de horas.
- O novo módulo **lê** localStorage; não executa `setItem`, `removeItem`, criação de eventos SRS ou alterações no Drive. O motor existente V245 permanece responsável pelas gravações e controles de concorrência.
- Calendário, histórico, planejamento, ciclos, relatórios, backup, cronômetro e o leitor de fórmulas do Drive não foram substituídos nem seus IDs apagados.

## Arquivos

- `assets/v251_mobile_header.css` — ajustes de tamanho visual e toque no cabeçalho móvel.
- `assets/v252_study_three_tabs.js` — orquestração das três abas, navegação interna, leitura do calendário e estilos encapsulados no Shadow DOM.
- `v252.html` — nova página agregadora, derivada da V250 com módulos de fórmulas e controles existentes.
- `index.html` e `assets/version.json` — roteamento e manifesto de versão.

## Verificação e limites

- **Aprovados (estáticos/isolados)**: sintaxe JS; três áreas principais; mapa completo dos nove IDs de módulos V245; calendário como abertura; leitura independente de `sessions` e `plans`; preservação do formulário; exibição da cadeia de assuntos; CSS do calendário de sete colunas e redução de ícones; carregamento do motor e sincronização preexistentes; ausência de escrita em localStorage pelo novo módulo; retorno das referências do GitHub.
- **Ainda não homologados**: autenticação e sincronização Drive do usuário no navegador real; interação ponta a ponta com dados pessoais; medição visual efetiva no Android e largura de todos os rótulos em aparelhos de diferentes dimensões. Não interpretar testes estáticos como aprovação visual no celular.
- **Sem alteração**: 1.518 IDs da base pública, SRS, cartões, originais, questões, registros privados no Drive e eventos de estudo.

**Risco residual identificado:** o calendário nativo V245 foi criado antes desta reorganização; a V252 o decora sem alterar funções de persistência. Testes completos em navegador após autenticação continuam necessários, especialmente transferência de cronômetro entre dispositivos e dados do Drive.

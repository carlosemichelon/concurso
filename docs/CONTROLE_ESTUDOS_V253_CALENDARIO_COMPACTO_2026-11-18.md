# V253 — Controle de Estudos: calendário em evidência e compactação máxima

**Data:** 18/11/2026. **Origem:** captura de tela da V252 enviada pelo usuário, demonstrando espaço vertical excessivo antes do calendário, seguida de autorização expressa para executar a compactação.

## Mudanças visuais executadas

1. **Calendário aparece antes dos avisos**: título compacto → controles de período → grade de dias → resumo/legenda → aviso SRS recolhível.
2. Aviso “Revisões do Banco Mestre — somente leitura” **preservado integralmente**, com botão para abrir planejamento SRS, mas movido para `<details>` após a grade; fica recolhido por padrão.
3. Texto explicativo repetitivo do topo reduzido visualmente, sem excluir a informação de legenda.
4. Cabeçalho, três abas, navegação interna, cartões de indicadores e paineis com paddings e margens menores. O título principal permanece visível e as três abas de navegação permanecem reconhecíveis.
5. Calendário continua com **7 colunas no celular**; dias com tempo registrado e marcadores de realizado/planejado.
6. Botões interativos mantêm altura de toque de aproximadamente **38–40 px**; células de dia **45–49 px**. A redução ocorre prioritariamente em espaço ocioso, texto duplicado e ícones.

## Garantias e escopo

- `assets/v253_calendar_compact.js`: **apenas rearranja nós existentes** da interface V252, com os mesmos IDs e event handlers; injeta CSS no Shadow DOM após a folha original.
- `v253.html`: usa o motor V245, o calendário V252, o leitor Fórmulas V250 e CSS móvel V251.
- `v252.html` e versões anteriores preservadas para recuperação.
- Não escreve em localStorage, Google Drive, cartões, sessões, planejamento ou SRS; fontes e eventos originais permanecem sob responsabilidade dos módulos preexistentes.
- Não mistura sessões realizadas com tarefas planejadas; marcações de ambos permanecem distintas.

## Auditoria

- **15 verificações estáticas aprovadas** antes de atualizar o arquivo principal (sintaxe JS, ordem dos módulos, elementos presentes, preservação de IDs, posição do calendário, recolhimento do aviso, ausência de operações de escrita, sete colunas, referência de versão anterior).
- Pós-publicação: conferir `assets/version.json`, `index.html`, `v253.html`, JS novo, log e a versão V252 preservada.
- Limite: os testes estáticos **não equivalem** a inspeção visual real em Android/navegador ou a teste autenticado com Google Drive. Tamanho efetivo pode variar conforme CSS legado, dispositivo e zoom.

## Estado dos dados

- Original do guia de fórmulas no Drive: **não alterado nesta operação**.
- Banco de cartões e SRS: **não alterados**.
- Sessões/planejamentos: **não editados nem importados nesta operação**.

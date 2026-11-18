# Banco Mestre V255 — Resumo e Relatórios em aba própria

**Data:** 18/11/2026. **Pedido:** manter a aba «Ver estudado» e a aba «Organizar» da V254, mas destacar «Resumo» e «Relatórios» em uma terceira aba específica. Nenhuma migração de conteúdo ou mudança no modelo de dados.

## Navegação final

| Aba principal | Conteúdos internos | Entrada inicial |
|---|---|---|
| **Ver estudado** | Calendário de estudos realizados e planejados; Histórico completo | Calendário |
| **Organizar** | Metas e disciplinas; Registro manual; Revisões de conteúdo; Ciclo de estudos; Dados e backup | Metas e disciplinas |
| **Resumo e relatórios** | Resumo (painel de indicadores); Relatórios detalhados | Resumo |

Total: **3 abas principais e os mesmos 9 módulos de estudo V245**, sem remoções de IDs, formulários, eventos, calendários, sincronização ou registros.

## Preservações

- A interface mantém a grade de calendário compacta da V253 como primeira visualização em «Ver estudado», incluindo distinção realizado/planejado e aviso SRS recolhível.
- O cronômetro inferior continua único e persistente; o painel duplicado de cronômetro no módulo «Registro manual» permanece apenas ocultado por CSS, com botões internos intactos para a ponte entre cronômetro e rodapé.
- O módulo de resumo `painel` e os relatórios `relatorios` são os existentes no motor V245. Cálculos, filtros, métricas, horas líquidas e exportação CSV preservados, apenas relocados na navegação.
- `assets/v255_study_three_groups.js` é um orquestrador de apresentação baseado na V254 e apenas lê registros locais; não grava `localStorage`, Drive nem avaliações SRS.
- `v254.html` e versões anteriores mantidas como checkpoints de recuperação.

## Verificação e limites

- Conferência estática de grupos, 9 IDs únicos, três colunas responsivas, ordem de carregamento, integração com o calendário compacto, manutenção do motor V245 e do relógio inferior, ausência de operações de gravação na camada nova.
- Salvamento no ramo `gh-pages`, atualização de `index.html` e `assets/version.json`, leitura de volta dos arquivos.
- Pendente: autenticação em navegador real, teste visual Android e teste ponta a ponta dos controles após navegar entre abas. Não interpretar conferência estática como homologação funcional completa.
- Nenhum cartão, SRS, histórico privado, sessão, planejamento ou documento canônico foi editado por esta alteração.

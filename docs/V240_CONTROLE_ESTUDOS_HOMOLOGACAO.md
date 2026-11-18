# Controle de Estudos V240 — homologação separada

**Estado:** PROPOSTO / STAGING. NÃO PUBLICADO em produção. A versão principal segue V238 conforme `gh-pages/assets/version.json`.

## Governança

Origem: decisões 1–18 aprovadas pelo estudante nesta conversa de 18/11/2026. Fonte normativa do projeto: Metodologia Mestre v014 (e adendos posteriores contidos no documento), Drive ID `1HXpal_7FFV4_yJsvfhEAEKpB36ym4LEzpb4t1PXHmcc`. Não alterar a planilha canônica de cartões, eventos SRS, PDFs, imagens, grifos ou mídias privadas. Publicação somente após homologação prática.

## Entrega nesta branch

- `v240.html`: carregador de portal de **homologação**, herdando o conteúdo-base V239 sem modificar `v062.html`.
- `assets/v240_controle_native.js`: aba nativa por Shadow DOM, sem iframe.
- `controle-estudos-v240.html` + `assets/v240_controle_app.js`: cronômetro manual, histórico de sessões, questões/acertos, metas, gráficos, ciclo flexível, calendário dia/semana/mês, tarefas agendadas, revisão manual separada do SRS, exclusão recuperável e log auditável com pré/pós-estado.
- Importação V184 somente de horas/documentação com data e duração verificáveis, ID de proveniência; importação JSON aditiva com detecção de colisão.
- `assets/v240_controle_drive_sync.js`: controle privado, SHA-256, leitura de volta, bloqueio conservador de conflito e token transitório. Mantém compatibilidade V239 com os nomes de arquivo mestre privado.
- `assets/v240_global_drive.js`: botão único com estados por módulo; autenticação depende de OAuth do titular no navegador.
- `assets/v240_backup_drive.js`: backups privados por período com leitura de volta e rotação máxima 30 diários/12 mensais; histórico de alterações incorporado aos snapshots; ainda sem restauração guiada dos backups remotos.
- `sw-v240.js` + `assets/v240_offline.js`: cache exclusivamente de estáticos públicos no navegador, sem credenciais ou dados privados.
- `tests/v240_controle.test.cjs`: testes sintéticos, sem Drive real.

## Situação por requisito

| Requisito | Estado | Evidência |
| --- | --- | --- |
| Aba nativa e interface responsiva | Implementado; validação visual pendente | DOM ShadowRoot, CSS e código |
| Sessões, questões/acertos, metas e ciclo | Teste sintético concluído; navegador pendente | 75 min, 20 questões, 15 acertos |
| Calendário dia/semana/mês e tarefas | Implementado; navegador pendente | 50 min previstos e registro auditado |
| Histórico recuperável | Teste sintético concluído | criação, exclusão lógica, restauração |
| Separação SRS formal | Aderência estática; regressão real pendente | sem eventos SRS disparados pelo Controle |
| Sincronização Drive e conflito | Teste de API simulada concluído; OAuth real pendente | criação, atualização e conflito sem perda |
| Transferência do cronômetro | Protocolo de pausa + confirmação; teste real pendente | não garante bloqueio distribuído quando aparelho de origem permanece offline |
| Backup 30+12 com restauração | Criação/verificação/rotação implementadas; restauração GUIADA pendente | sem teste de Drive real |
| Offline computador/celular | Cache implementado; inspeção e teste real pendentes | Service Worker sem dados privados |
| Importação histórica auditada | Rotina parcial implementada; fontes não enumeradas no Drive | V184 local no navegador |
| Hierarquia completa de assuntos/filtros | PENDENTE | controle atual tem disciplina e campo livre, não as quatro listas reais |
| Painel de integridade por módulo | Parcial | mensagens no cabeçalho; não contém contadores completos de pendências |
| Histórico entre dispositivos / prevenção absoluta de concorrência offline | PENDENTE | conflito detectado e não sobrescrito; sem transação distribuída |

## Testes realizados

1. Sintaxe ECMAScript conferida sobre os arquivos V240 pela execução de V8.
2. Template com 96 identificadores únicos e nenhuma referência `$()` ausente.
3. Teste de interface simulada: cadastrar disciplina, criar sessão 75min 20/15, excluir/restaurar, criar planejamento 50min, rejeitar acertos acima do total. **PASSOU**.
4. Simulação de API Drive com SHA e estados remoto/local: criar mestre, atualizar e detectar conflito preservando ambas as versões. **PASSOU**.

**Não realizadas:** navegação autenticada real, uso entre celular e computador, app em modo avião, contingência com OAuth expirado, restauração privada, renderização visual em produção. A criação do branch/PR é somente produção de código, não implantação.

## Critérios para homologação e futura publicação

1. Testar cenário offline após primeira carga e reabertura do site em celular e computador.
2. Testar botão Google real, gravação, readback, conflitos, consulta de imagens/PDFs/grifos e reprodução dos estados por módulo.
3. Testar a transição do cronômetro pausado entre dispositivos, inclusive o conflito ao ficar offline.
4. Restaurar efetivamente um backup real em ambiente isolado, comparar hashes, contagens e IDs.
5. Garantir tela responsiva e preservar os 11 módulos de cada cartão, filtros, leitor, originais e SRS.
6. Concluir a hierarquia real de quatro níveis e o painel detalhado de integridade.
7. Somente após testes e aprovação: criar versão de lançamento e atualizar `index.html`, manifesto da `gh-pages` e `VERSAO_ATUAL.md`, mantendo rollback.

### Registro de integridade

A branch de homologação conserva o `gh-pages/index.html`, `gh-pages/assets/version.json`, arquivos PDF, cartões, planilha de Drive e SRS intactos. Não declarar cópia ou sincronização de dados privados sem a autorização e leitura de volta realizadas no navegador.

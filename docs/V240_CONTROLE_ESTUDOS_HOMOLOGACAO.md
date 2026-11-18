# Controle de Estudos V240 — homologação separada

**Estado:** PROPOSTO / STAGING. NÃO PUBLICADO em produção. A versão principal estava em V238 no início deste trabalho, mas avançou para **V239** durante a execução, confirmado por leitura de `gh-pages/assets/version.json` e `gh-pages/index.html` em 18/11/2026. A branch de homologação foi criada do estado anterior e está 4 commits atrás de `gh-pages`; revisar/atualizar a base antes de eventual merge.

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
| Backup 30+12 com restauração | Código de cópias e restauração local implementado; teste simulado aprovado | sem OAuth real |
| Offline computador/celular | Cache público isolado no caminho de homologação, teste real pendente | não controla produção |
| Importação histórica auditada | Rotina parcial implementada; fontes não enumeradas no Drive | V184 local no navegador |
| Hierarquia de disciplinas/assuntos | Parcial | catálogo público V194 importado, 3 campos + subassunto livre; falta quarta camada canônica |
| Painel de integridade por módulo | Parcial | mensagens no cabeçalho; não contém contadores completos de pendências |
| Histórico entre dispositivos / prevenção absoluta de concorrência offline | PENDENTE | conflito detectado e não sobrescrito; sem transação distribuída |

## Testes realizados

1. Sintaxe ECMAScript conferida sobre os arquivos V240 pela execução de V8.
2. Template com 96 identificadores únicos e nenhuma referência `$()` ausente.
3. Teste de interface simulada: cadastrar disciplina, criar sessão 75min 20/15, excluir/restaurar, criar planejamento 50min, rejeitar acertos acima do total. **PASSOU**.
4. Simulação de API Drive com SHA e estados remoto/local: criar mestre, atualizar e detectar conflito preservando ambas as versões. **PASSOU**.

**Não realizadas:** navegação autenticada real, uso entre celular e computador, app em modo avião, contingência com OAuth expirado, restauração privada, renderização visual em produção. A criação do branch/PR é somente produção de código, não implantação.


## Evolução de 18/11/2026 — isolamento e recuperação

- **Isolamento completo do ensaio:** `BM240_HOMOLOGACAO_CONTROLE`, `BM240_HOMOLOGACAO_TIMER` e `BM240_HOMOLOGACAO_DRIVE_BASE_SHA256` não são chaves de produção. O arquivo mestre Drive tem `bm_kind=bm_controle_estudos_v240_homologacao`, e backups `bm_kind=bm_controle_estudos_v240_homologacao_backup`. O mestre V239 e `BM_CONTROLE_ESTUDOS_V238` são somente lidos pela rotina de importação explícita, **nunca modificados** pelo Controle V240.
- **Importação read-only:** com confirmação, sessões válidas V239 são copiadas para V240 com prefixo de ID `V239:` e proveniência; acertos não excedem resolvidas e dados sem data/duração adequada são rejeitados. Os originais, o cronômetro principal e SRS não são alterados.
- **Falha segura:** histórico local JSON malformado ou esquema incompatível impede inicialização em vez de limpar dados. Gravações de aba desatualizada são bloqueadas sem sobrescrever a versão persistida.
- **Backup remoto:** inventário e restauração SHA-256 via interface; restaura somente na base de homologação do navegador, guardando o estado anterior. Após restauração, o marcador `RESTORE_REQUIRES_RECONCILIATION` impede envio automático ao mestre privado.
- **Cronômetro:** pausar normalmente permanece disponível offline; a transferência exige liberação explícita e confirmação no Drive. O cancelamento exige conferir a propriedade remota. Duas sessões simultâneas offline não têm exclusão distribuída garantida e devem ser reconciliadas antes da consolidação.
- **Service Worker isolado:** `homologacao-v240/sw.js` só controla clientes da rota `homologacao-v240/`. O antigo `sw-v240.js` de raiz foi desativado, e o registro não é acionado na página principal. A instalação prepara cache apenas de assets públicos, sem armazenar tokens nem registros privados.
- **Hierarquia extraída dos cartões públicos V194:** 22 disciplinas, 336 assuntos gerais e 1.411 ocorrências de assuntos específicos. Subassunto é um campo livre complementar até existir catálogo canônico de 4 níveis; não inventar a quarta camada.
- **Integridade visual:** painel por módulo já apresenta consulta PDFs/imagens, estado do Controle, grifos e backups; acompanhamento por objeto, contadores de pendências e confirmação visual final ainda requerem testes reais.
- **Testes simulados executados:** 111 identificadores DOM sem duplicação/referência ausente, cadastro, sessão 75min 20/15, exclusão/restauração, plano 50min, importação V239 preservando fonte e bloqueio de sobrescrita em aba desatualizada. Mock Drive: 2 cópias criadas/verificadas (diária/mensal), restauração local e trava de conciliação. São testes de lógica, **não** homologação real OAuth ou mobile.
- **Concorrência editorial:** outra branch `homologacao/v241-cronometro-cabecalho-2026-11-18` propõe alterações que podem se sobrepor à V240 (PR #33). Ambas são rascunhos separados; não integrar automaticamente, comparar antes da publicação.

### Estado de disponibilidade

**Homologação automática em Chromium (CI):** execução [44331510447](https://github.com/carlosemichelon/concurso/actions/runs/44331510447) passou nos jobs `static-and-smoke` e `browser-smoke`, com navegador Chromium, formulários, histórico e calendário em viewports desktop e celular emulados. Evidências `v240-desktop.png` e `v240-mobile.png` foram anexadas ao job. Não é teste em hardware físico nem autenticação OAuth.

**Calendário SRS:** conexão de consulta ao planejamento já existente do Banco Mestre. O Controle não calcula nem grava previsões SRS próprias; o histórico F17/importações pode estar defasado em relação à fonte canônica.

**Código de homologação armazenado no GitHub, PR #32 aberto como rascunho.** Não mesclado, não exposto pelo endereço principal do portal, não homologado em navegadores reais. O manifesto principal consultado foi atualizado para V242. Não foram salvos registros reais do usuário no Drive nesta interação.


## Incremento técnico após publicação da V241 (18/11/2026)

O manifesto principal foi verificado em `gh-pages/assets/version.json`: **V241**, não V239. Esta branch V240 permanece isolada e defasada da branch publicada; deve ser rebaseada ou integrada de forma auditada **sem reverter a V241**. Também existe trabalho em paralelo na PR #33. Nenhuma mesclagem automática está autorizada.

**Conciliação 3-vias implementada em homologação:**
- `assets/v240_reconcile.js` compara um instantâneo-base SHA-256 previamente confirmado, o estado local e o estado remoto por ID de disciplina, sessão, revisão manual, atividade planejada e evento de auditoria, além de dados escalares, inclusive `activeTimer`.
- Alteração concorrente do mesmo item, exclusão versus edição, campo desconhecido divergente e referências quebradas produzem conflito bloqueante. Nenhum item é removido ou atualizado automaticamente nesses casos.
- Divergências **independentes** geram proposta, mas não acionam gravação automática. Na aba Backup o usuário pode inspecionar e confirmar a conciliação; dois instantâneos privados são criados, lidos de volta e verificados por SHA-256 antes da atualização do mestre V240 de testes.
- O sincronizador mantém `BM240_HOMOLOGACAO_VERIFIED_BASE_DOC` como base conferida. O fluxo de restauração mantém `RESTORE_REQUIRES_RECONCILIATION` e **não permite** reconciliar automaticamente uma restauração histórica sem base confiável.
- Há riscos residuais de concorrência de rede entre a última consulta de versão e o PATCH do Google Drive; a homologação entre dois aparelhos e a verificação posterior são indispensáveis antes de afirmar exclusão distribuída de conflitos.

**Cronômetro no cabeçalho implementado:**
- `assets/v240_header_timer.js` mostra a mesma sessão da aba nativa, delegando ações aos controles existentes em seu Shadow DOM, sem contar tempo paralelamente.
- Mostra disciplina, assunto, tempo líquido, pausa/retomada, salvar e estado de transferência pendente.
- Não registra SRS ou horas por simples navegação. O código foi incluído no cache público isolado e na suíte de navegador Chromium.

**Verificação recente:** testes estáticos, integridade de DOM, dados sintéticos e cenários simulados de conflito passaram no GitHub Actions. A suite Chromium de cabeçalho e o simulado fim-a-fim de conciliação devem ser conferidos pelo run mais recente antes de afirmar sucesso dessa ampliação.

**Não realizados nesta interação:** autenticação OAuth verdadeira do titular, publicação em gh-pages, sincronização efetiva de registros reais, teste com celular físico, acesso do visitante à branch de homologação no GitHub Pages.


## Checkpoint de verificação — 18/11/2026

**Teste automatizado concluído com sucesso:** [GitHub Actions V240, run 44338113789](https://github.com/carlosemichelon/concurso/actions/runs/44338113789). Os jobs `static-and-smoke` (Node.js, dados sintéticos, prova de conciliação com API Drive simulada) e `browser-smoke` (Chromium em formatos desktop e celular) concluíram com êxito.

Foram corrigidos e novamente testados: aba **Controle de Estudos** como página inicial quando não existe link profundo, cronômetro único do cabeçalho integrado aos controles nativos e navegação de meses sem pular fevereiro nos dias 29–31.

**Limites:** integração com V241 publicada deve ser feita sem retroceder a versão de produção; OAuth real, transferência entre aparelhos físicos, recuperação de backup privado no Drive real e integridade ponta a ponta permanecem pendentes de homologação. O site principal não foi modificado neste incremento e o PR #32 continua em rascunho.



## Atualização de compatibilidade — produção V242 (18/11/2026)

Nova conferência em `gh-pages/assets/version.json`: **V242** está ativa; `v242.html` declara cronômetro na barra inferior. A V240 de homologação contém cronômetro compacto no cabeçalho controlando a sessão nativa. **Não mesclar ambos sem resolver a sobreposição**, garantindo um único contador por sessão e preservando as melhorias V242. Na última comparação, a branch V240 estava 52 commits atrás da `gh-pages`; rebase/cópia auditada em base V242 é impeditivo de publicação.

As alterações desta branch V240 continuam salvas em GitHub PR #32, **não** integradas à versão oficial. Último workflow de código V240 comprovadamente aprovado: run 44338113789 (Chromium e Node). O run de documentação/estado posterior deve ser verificado separadamente.

## Critérios para homologação e futura publicação

1. Testar cenário offline após primeira carga e reabertura do site em celular e computador.
2. Testar botão Google real, gravação, readback, conflitos, consulta de imagens/PDFs/grifos e reprodução dos estados por módulo.
3. Testar a transição do cronômetro pausado entre dispositivos, inclusive o conflito ao ficar offline.
4. Restaurar efetivamente um backup real em ambiente isolado, comparar hashes, contagens e IDs.
5. Garantir tela responsiva e preservar os 11 módulos de cada cartão, filtros, leitor, originais e SRS.
6. Concluir a hierarquia real de quatro níveis e o painel detalhado de integridade.
7. Somente após testes e aprovação: criar versão de lançamento e atualizar `index.html`, manifesto da `gh-pages` e `VERSAO_ATUAL.md`, mantendo rollback.

### Registro de integridade

A branch de homologação não modifica o `gh-pages/index.html`, `gh-pages/assets/version.json`, arquivos PDF, cartões, planilha de Drive e SRS intactos. Não declarar cópia ou sincronização de dados privados sem a autorização e leitura de volta realizadas no navegador.

## Nova branch de homologação a partir da V242 (18/11/2026)

A branch `feature/controle-estudos-v242-integracao-20261118` foi criada diretamente de `gh-pages` na V242 e recebeu os módulos auditados do PR #32, sem sobrescrever arquivos de produção. A página `homologacao-v240/compat-v242.html` é a referência de integração. O cronômetro V241 e o dock V242 originais **não são montados neste ambiente**; seu layout inferior é reaproveitado no único cronômetro nativo do Controle. O arquivo histórico `v240.html` no site principal foi mantido intacto. Testes da branch nova devem ser considerados separadamente dos resultados da branch antiga.

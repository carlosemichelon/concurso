# Controle de Estudos V243 — compatibilização auditada com portal V242

**Estado:** HOMOLOGAÇÃO / PROPOSTO / NÃO PUBLICADO. Data: 18/11/2026.

## Referência e escopo

Base real: `gh-pages` no instante de criação desta branch, com manifesto `assets/version.json` marcando **V242** e carregador `v242.html`. Requisitos: 18 decisões expressamente aprovadas do Controle de Estudos; Metodologia Mestre v014 e adendos; 33 decisões PMS-1. Não alteramos o SRS, cartões, PDFs, imagens, arquivo mestre de grifos nem o portal oficial.

A branch `homologacao/v243-controle-nativo-compat-v242-20261118` deriva diretamente da produção V242. A PR anterior #32, baseada em versão antiga, **não deve ser mesclada cegamente**.

## Compatibilidade de cronômetro

A arquitetura oficial V242 possui:

- `assets/v241_timer_header.js`: interface `#bm241-bar`, operando a partir de `iframe#bm238-study-frame`.
- `assets/v242_timer_dock.js`: reposiciona a **mesma barra** para o rodapé, sem criar outro cronômetro.

A homologação V243:

1. **Não carrega** `v241_controle_tab.js`, `v241_timer_header.js`, `v239_controle_drive_sync.js` ou `v241_global_drive.js`.
2. Carrega `assets/v240_controle_native.js`, que monta a aba nativa em Shadow DOM, sem iframe.
3. Carrega `assets/v243_timer_bridge.js`, adaptado do controlador V241, com **a mesma barra `#bm241-bar` e IDs de botões**, mas delegando start/pause/resume/save/discard/new-subject para a API do Controle nativo.
4. Mantém integralmente `assets/v242_timer_dock.js`, `assets/v241_timer_header.css` e `assets/v242_timer_dock.css` para preservar a interface oficial de rodapé.
5. A API `window.BM240ControlApp.timer` é apenas de consulta. Nenhum cronômetro independente é iniciado no adaptador; o cálculo de tempo líquido continua no Controle nativo.

O teste de navegador deve confirmar apenas um `#bm241-bar`, nenhum `#bm238-study-frame`, nenhuma barra secundária `#bm240h-bar` e exatamente **uma sessão** salva.

## Dados, sincronização e governança

- `BM240_HOMOLOGACAO_CONTROLE`, `BM240_HOMOLOGACAO_TIMER` e arquivos Drive com `bm_kind=bm_controle_estudos_v240_homologacao` são exclusivos da homologação.
- Sincronização V240 de testes: hash SHA-256, leitura de volta, deteção de conflitos, instantâneo-base, conciliação de alterações independentes e cópias pré-merge de ambos os lados.
- Backups diários/mensais: 30 + 12 de retenção em código, com rota de restauração **somente local** e bloqueio até conciliação.
- Não carrega o sincronizador de grifos canônico `v239_grifos_drive.js`; o botão de Drive do teste não grava no mestre de cartões/SRS ou no mestre real de grifos.
- Importação de histórico V239 explícita e auditada, **somente leitura do original**.
- O módulo de estudos não gera eventos SRS nem agendamentos arbitrários 1/7/30. Agenda de revisões existente apenas para consulta.
- `homologacao-v243/sw.js` registra Service Worker apenas no escopo `/homologacao-v243/`, mantendo a página principal fora de seus controles.

## Evidência de testes

- O script `.github/workflows/v243-controle.yml` testa sintaxe JS, integridade DOM, dados fictícios e cenários simulados de conflito/backup.
- A suíte Chromium verifica computador, viewport de celular, registro 75min/20 questões/15 acertos, histórico e calendário, além da barra única fixa da V242 comandando uma sessão nativa.
- Testes no CI são simulados; apenas relatório de job `success` confirma que efetivamente passaram. Não confundir Chromium emulação com dispositivo físico.

## Impedimentos para publicar

1. Comprovar no navegador do titular autenticação OAuth real, Drive test namespace, gravação/leitura e restauração.
2. Comprovar transferência com pausa entre **dois dispositivos físicos**, inclusive desconexão e conflitos reais de rede.
3. Confirmar cache offline após primeira carga e reabertura sem internet em celular/computador.
4. Conferir integridade de SRS, cartões, imagens, PDF e grifos originais depois de uso prolongado.
5. Comparar `gh-pages` novamente (pode ter avançado além da V242); jamais reverter modificações recentes de produção.
6. Aprovação de homologação completa antes de substituir `index.html` ou `assets/version.json`.

**Separações importantes:** código salvo no GitHub ≠ integração publicada; conexão Google ≠ sincronização verificada; teste simulado ≠ escrita real.

# Instruções de edição para agentes — Banco Mestre

**Leia `VERSAO_ATUAL.md` antes de qualquer alteração.**

Este repositório tem duas branches que podem conter portais de versões diferentes:
- A **única branch de publicação do site é `gh-pages`**, mesmo quando o acesso padrão do GitHub mostra `main`.
- A versão atualmente registrada em 10/11/2026 é **V066** em `gh-pages`; `main` mostra **V031 legado**.

## Preflight obrigatório

Antes de editar, execute na branch `gh-pages`:
1. Ler `assets/version.json` (campos `version` e `home`);
2. Conferir `index.html` e a existência do HTML apontado pelo manifesto;
3. Se o estado divergir do documento, adotar o estado *verificado* de `gh-pages` e investigar antes de gravar;
4. **Nunca** escrever em `main` para uma solicitação sobre a versão atual publicada, nem editar versões antigas sem instrução expressa.

Ao lançar versão nova, mantenha a anterior intacta, atualize manifesto, entrada e `VERSAO_ATUAL.md` em `gh-pages`; preserve dados, IDs, SRS, leitores, PDFs e Atlas, exceto quando o pedido exigir.

Este arquivo contém uma **regra operacional**, não substitui conferir os arquivos no GitHub a cada tarefa.

## Evolução de grifos

- Antes da V061, foi criada a branch de backup `backup/v060-before-text-selection-2026-11-10`.
- Regras de produto e etapas em `gh-pages/PLANO_GRIFOS_2026_11_10.md`.
- Não apresentar as 21 decisões de alinhamento como implementadas: a V061 contém só o primeiro estágio de grifos por seleção de texto.
- O GitHub não armazena automaticamente os grifos/SRS que o usuário tem em localStorage/IndexedDB. Não substituir essas bases nem realizar migrações sem cópia e confirmação.

## Biblioteca V063
- A versão V063 foi publicada com apontamento para `v063.html`; hoje o manifesto e a entrada apontam para V064.
- `v063.html` carrega, em tempo de execução, o HTML preservado `v062.html` (65 PDFs, dois CONAMA originais) e adiciona os módulos `assets/v063_grifos_navegacao.js`, `assets/v062_biblioteca_grifos.js` e seu CSS. O carregador deve ser testado em navegador antes de ser considerado plenamente validado.
- V062 preservada como HTML estático. Backup de código `backup/v062-before-grifos-v063-2026-11-10`.
- A Biblioteca lê dados de grifos no **navegador do usuário**; GitHub não guarda grifos privados. Nenhuma migração ou sincronização automática permitida. O botão backup exporta somente localStorage das anotações; avisar que não inclui PDFs, IndexedDB, cartões ou SRS.

## V064 — filtro de imagens excluídas e painel lateral de grifos
- Manifesto e `gh-pages/index.html` apontavam para `v064.html`; desde V066 apontam para `v066.html`.
- V064 preserva HTML V062 (65 PDFs e resoluções CONAMA originais), com módulos da Biblioteca V063 mais `assets/v064_imagens_visibilidade.js`, `assets/v064_painel_grifos.js` e `assets/v064_painel_grifos.css`.
- Imagens com status `hidden` não podem ser mostradas nos assuntos, sumários e atalhos de imagem da base. Atlas conserva a opção `Mostrar excluídos` para restauração.
- Painel de grifos é local por documento/hash; não transferir entre versões, não alterar originais.
- Backup V063: `backup/v063-before-image-filter-and-pdf-panel-2026-11-10`.
- Testar imagens previamente excluídas e painel em PDF real antes de considerar validação de interface definitiva.

## V065 — prévia Cartão rápido
- `assets/v065_cartao_rapido_header.css` corrige apenas a janela `#pdfQuickPanelV047` e o cabeçalho `.bm-v047-card-header` sob o botão flutuante Fechar PDF. Preservar controles, cartões e SRS.
- Backup `backup/v064-before-quick-card-header-fix-2026-11-10`.

## V066 — backup consentido de grifos no Drive
- `v066.html` carrega a base V062 preservada e módulos V063, V064, a correção V065 e `assets/v066_backup_drive_grifos.js` + seu CSS.
- O usuário deve primeiro preparar e baixar um JSON com hash SHA-256, confirmar que salvou e clicar para autorizar upload. Criar **nova cópia** no Google Drive via OAuth drive.file; token em memória e nada de substituições remotas, reenvios automáticos ou importação silenciosa.
- O JSON contém somente `BM030_STROKES_PDF:*` e `BM062_GRIFOS_META`. **Não** inclui PDFs/IndexedDB/flashcards/SRS. Apresentar limitações e nunca dizer que dados locais foram copiados ao GitHub.
- Backup de código: `backup/v065-before-drive-grifos-2026-11-10`.
- Testes visuais/OAuth/envio real pendentes. Nunca presumir operação no Google Drive sem confirmação da API após consentimento do usuário no navegador.

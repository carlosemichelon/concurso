# Instruções de edição para agentes — Banco Mestre

**Leia `VERSAO_ATUAL.md` antes de qualquer alteração.**

Este repositório tem duas branches que podem conter portais de versões diferentes:
- A **única branch de publicação do site é `gh-pages`**, mesmo quando o acesso padrão do GitHub mostra `main`.
- A versão atualmente registrada em 10/11/2026 é **V063** em `gh-pages`; `main` mostra **V031 legado**.

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
- O manifesto `gh-pages/assets/version.json` e `gh-pages/index.html` devem apontar para `v063.html`.
- `v063.html` carrega, em tempo de execução, o HTML preservado `v062.html` (65 PDFs, dois CONAMA originais) e adiciona os módulos `assets/v063_grifos_navegacao.js`, `assets/v062_biblioteca_grifos.js` e seu CSS. O carregador deve ser testado em navegador antes de ser considerado plenamente validado.
- V062 preservada como HTML estático. Backup de código `backup/v062-before-grifos-v063-2026-11-10`.
- A Biblioteca lê dados de grifos no **navegador do usuário**; GitHub não guarda grifos privados. Nenhuma migração ou sincronização automática permitida. O botão backup exporta somente localStorage das anotações; avisar que não inclui PDFs, IndexedDB, cartões ou SRS.

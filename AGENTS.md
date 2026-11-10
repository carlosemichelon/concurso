# Instruções de edição para agentes — Banco Mestre

**Leia `VERSAO_ATUAL.md` antes de qualquer alteração.**

Este repositório tem duas branches que podem conter portais de versões diferentes:
- A **única branch de publicação do site é `gh-pages`**, mesmo quando o acesso padrão do GitHub mostra `main`.
- A versão atualmente registrada em 10/11/2026 é **V061** em `gh-pages`; `main` mostra **V031 legado**.

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

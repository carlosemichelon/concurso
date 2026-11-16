# Banco Mestre V196 — abas de informações recolhidas por padrão

Conferência: 16/11/2026. Branch: `gh-pages`. Versionamento a partir da V195; `v195.html` e seus dados permanecem intactos.

## Requisito aplicado
- Ao abrir qualquer flashcard, a pergunta fica visível e o verso continua oculto.
- As abas de informações dentro da janela do cartão — conhecimento mínimo, explicações, macetes, pegadinhas, fundamentos, fontes, histórico, interconexões, resposta evolutiva com 11 camadas e configurações da resposta discursiva — começam fechadas.
- Se o usuário trocar de cartão ou fechar e reabrir a janela, todas as abas informativas voltam a ficar fechadas.
- Ao clicar numa aba, somente ela abre entre as abas irmãs; subabas internas não fecham a aba-mãe.
- Detalhes de cartões recém-renderizados na grade também são inicializados fechados, sem interferir nos filtros, nas seções gerais da biblioteca ou na navegação da página.
- A regra não reage ao atributo `open` alterado pelo clique do estudante, evitando reencolher indevidamente uma aba durante a leitura; limita-se às novas estruturas e aos momentos de abertura/troca de cartão.

## Integridade
- Não modifica os módulos antigos V165, V194 ou V195: apenas injeta `assets/v196_abas_recolhidas.js` ao final da montagem de `v196.html`.
- Não altera perguntas, respostas originais, 11 camadas, informações didáticas, imagens, PDFs, Drive, dados do IndexedDB, classificações nem histórico SRS.
- Módulos V184 de prática e V189 de agenda não foram reativados.
- Testes estáticos: sintaxe JavaScript, presença de asset na página e conferência dos arquivos/manifesto. A renderização final no navegador com dados do titular ainda requer inspeção visual.

## Arquivos
- Novo: `assets/v196_abas_recolhidas.js`
- Novo: `v196.html`
- Atualizados somente para publicação: `index.html`, `assets/version.json`, `VERSAO_ATUAL.md`
- Este relatório: `docs/V196_ABAS_CARTOES_RECOLHIDAS.md`

## Rollback
Reapontar o manifesto/entrada para `v195.html` preservado. Não remover ou alterar os dados locais ou a pasta de respostas discursivas no Drive.

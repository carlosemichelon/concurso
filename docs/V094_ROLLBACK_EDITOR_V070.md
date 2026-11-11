# V094 — rollback estrito do editor PDF para a V070

Solicitação: restaurar completamente **formatação, layout, painel, cores e fluxo do editor PDF da V070**. Única exceção: preservar a seleção aprimorada da V089.

## Fonte exata e escopo
- HTML/estilo do editor: `v070.html`, `assets/pdf_v070.js`, `assets/v068_grifador.css`, `assets/v070_cores_metodologia.css` e a coleção de CSS até V070.
- Grifador: cópia isolada do `assets/v070_grifador.js` em `assets/v094_grifador_v070.js`, sem mudanças de interface. A única adaptação aceita é `acceptPreciseSelection` para receber `text/rects/words` do seletor V089 e desativar sua seleção nativa pelo DOM.
- Seletor: `assets/v089_pdf_selection_core.js` permanece **intacto**; `assets/v094_precise_selector.js` adapta cliques/arrasto em palavras, respeita colunas, valida coordenadas e transfere ao grifador original.
- O CSS novo `assets/v094_precise_selector.css` cobre **apenas** a camada invisível de seleção e a prévia dos retângulos; não modifica paleta, barra ou layout.
- Biblioteca e painel históricos: `assets/v070_biblioteca_grifos.js` e `assets/v070_painel_grifos.js`.
- Nenhum script do editor V071–V092, nem CSS ou barra novos, é carregado.

## O que é mantido fora do editor
O portal preserva a leitura privada de cartões V093, os catálogos de 72 PDFs V077, sincronização autorizada das imagens V084 e a exclusão reversível/global do Atlas V086/V087. Não é feito rollback, migração ou exclusão de dados do usuário, SRS, IDs, grifos e PDFs privados.

## Segurança
- Cada clique isolado apenas define a primeira palavra; não grava. O segundo clique ou arrasto somente produz seleção válida dentro de uma mesma coluna.
- Após seleção válida, o grifador conserva o modo rápido e as regras/cores V070 originais; a classificação heurística é uma sugestão, não interpretação jurídica validada.
- Se PDF não tem palavras posicionadas com confiança, rejeitar a seleção; não recuperar a seleção DOM que atravessava colunas.
- Branch de backup do código V093: `backup/v093-before-strict-editor-v070-2026-11-10`.
- Verificação estática de integridade do loader, presença/ausência de módulos e JSON aplicada. Homologação visual com PDF real no navegador permanece pendente.

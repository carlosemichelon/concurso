# V097 — parágrafo multicolorido único no painel

## Comportamento
Um parágrafo selecionado com várias cores aparece como **uma única entrada** em `bm064HighlightPanel` (resumo integral, cores usadas, detalhes recolhíveis para editar cada trecho). Cada pedaço colorido mantém ID, texto, cor, notas, ligações e histórico. O armazenamento do lote continua atômico: uma escrita e um desfazer. A identidade de seleção `selection_group_id` aparece em cada trecho novo; `selection_group_text` é armazenado só no primeiro segmento.

## Retrocompatibilidade
Nenhum grifo antigo é regravado. Grifos V070 anteriores com `segment_index/segment_total` só são agrupados visualmente se a sequência for completa e contígua, com mesmos documento/página, IDs distintos, carimbo de criação até 1,5 segundo. Grupos parciais ou sem certeza permanecem separados. Não há migração.

## Reconhecimento textual
O motor geométrico V089/V094 permanece como estava para cliques e arrasto. Refino conservador nos itens PDF.js: remover caracteres invisíveis (não OCR); recompor fragmentos de palavra de runs vizinhos quase sem lacuna, mesma linha e altura de fonte, sem unir colunas nem palavras separadas por espaços.

## Limitações e testes
A leitura real no navegador Chrome/Android, zoom, PDFs digitalizados e sequência multi-coluna ainda precisa de teste end-to-end. PDFs sem camada de texto continuam sem OCR. Testes sintáticos e de componentes foram aplicados. Preservados 72 PDFs, Drive privado V093, acervo, SRS, flashcards, demais interfaces V096. Backup: `backup/v096-before-paragraph-grouping-v097-2026-11-10`.

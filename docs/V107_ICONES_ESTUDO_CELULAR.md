# V107 — Ícones de estudo menores no celular

**Solicitação:** “No celular diminua os icones de estudo.”

## Alteração
- `assets/v107_mobile_study_icons.css`: a grade `#assuntos #areaRows.topicCards` passa a duas colunas no celular (até 760 px), com botões de área compactos.
- O desenho dos ícones de área diminui de 22 × 22 px para **16 × 16 px**; em telas de até 360 px, **14 × 14 px**. Títulos em 12 px e detalhes em 9 px (11,5 e 8,7 px em telas estreitas). O botão permanece com altura mínima de 64 px (62 px em telas estreitas), acima de 44 px para facilitar o toque.
- Ícones da navegação do cabeçalho diminuem de 17 para 15 px, sem reduzir o tamanho dos botões.
- A lista detalhada de assuntos, documentos, leitores de PDF/imagens, SRS, sincronização e grifos não são modificados. Arquivos legados preservados.

## Testes e limites
- Sintaxe e contagem de chaves CSS, ordem do stylesheet na montagem da versão e manutenção de módulos do PDF/Drive/Flashcards auditadas.
- Sem teste visual real em Android: conferir duas colunas no celular, nomes das áreas e alvos de toque antes de considerar homologado.
- Backup do código: `backup/v106-before-mobile-study-icons-v107-2026-11-11`.

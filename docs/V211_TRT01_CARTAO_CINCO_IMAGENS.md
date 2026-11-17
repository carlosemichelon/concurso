# V211 — cartão TRT01-C001 com cinco imagens originais incorporadas

**Data:** 17/11/2026 · **Anterior:** V210 preservada em `v210.html`.

## Solicitação e escopo

O estudante solicitou que todas as cinco imagens de apoio da questão de eficácia das normas constitucionais fossem vinculadas e inseridas ao cartão. Também dispensou a exigência de página exata do PDF, bastando norma, dispositivo e link.

## Imagens preservadas

Originais PNG armazenados no Google Drive na pasta canônica `1ksSVWrmRaRlDoG4iDtTGvfr2OnPnhnY6` e verificados um a um por metadados e parents:

1. `TRT01-Q001-IMG01`: fluxograma — `1lhrN-WFlVBnnlr4xVATc-DY0fHBd3KGO`.
2. `TRT01-Q001-IMG02`: quadro comparativo — `1PwW1gXEBQQHSP7zGHN6lZu94kSNe8pOq`.
3. `TRT01-Q001-IMG03`: tabela detalhada — `1fRIa8iXaJ8m_LzAGvT2_KR802XfOQT1W`.
4. `TRT01-Q001-IMG04`: mapa mental — `10twy1reKru5ztL0MhorZoEXmjhGsIk_T`.
5. `TRT01-Q001-IMG05`: mnemônico — `1pcBWbbTLxcC8IpDIcjxhnOgrBNzBsJl0`.

Tipologia editorial: **imagem de cartão**; subtipos explicação incorporada (01–04) e macete incorporado (05). Vínculos `TRT01-Q001 ↔ TRT01-C001 ↔ IMG01…IMG05` com hashes no manifesto. Nenhuma imagem foi tornada pública no repositório; a sessão OAuth do usuário fornece prévias temporárias com acesso controlado. Botões de abrir arquivo original permanecem disponíveis.

## Cartão e interface

- `assets/trt01_c001_v211.json`: cartão operacional `TRT01-C001`, 11 módulos, lei seca literal, interpretação, fundamentação, ressalvas e cinco IDs de imagens.
- `assets/v211_trt01_card.js`: incorpora o cartão no topo da seção **Flashcards**, abre automaticamente com a rota `?cartao=TRT01-C001`, carrega imagens pelo Drive API apenas após consentimento OAuth no site e adiciona a ação de retorno ao cartão nas miniaturas Drive de mesmo nome.
- `assets/v211_trt01_card.css`: adapta estilo e visibilidade de seções e galeria em desktop e celular.
- `v211.html`: deriva da V210 e acrescenta somente os módulos TRT, preservando o carregador anterior, ícones, filtros, PDFs, Atlas e eventos SRS.
- `index.html` e `assets/version.json`: manifesto e fallback de navegação atualizados para V211.

## Rastreabilidade e checkpoint

- Índice `TRT01_C001_MEDIA_V211.json` salvo no Drive tanto na pasta Atlas quanto na pasta oficial Checkpoints.
- ZIP `TRT01_C001_CHECKPOINT_V001_2026-11-17.zip` salvo na pasta canônica Checkpoints Banco Mestre, ID `1348cILBcxFG9p2cfPJ3WubmHswPRbD24`, contendo cinco originais e inventário de hashes.
- A metodologia mestre no Drive recebeu orientação de que paginação exata de PDFs é facultativa. Lei seca: norma, dispositivo e fonte jurídica permanecem obrigatórios.

## Limites de validação

- Verificados: 5/5 originais no Drive com pasta correta; cartão JSON de 11 módulos/5 mídias; scripts JavaScript sintaticamente válidos; presença de arquivos na branch `gh-pages`; integridade ZIP sem erros.
- **Não verificados em navegador real:** cache/deploy do GitHub Pages, OAuth da conta proprietária, renderização das cinco prévias em cartão e funcionamento de todos os botões no desktop e celular.
- A base pública **V194 mantém 1.518 IDs**, Atlas público V198 mantém 179 imagens e PDFs V149 mantém 78 documentos. Cartão TRT separado não altera contagem canônica, verso original ou SRS.
- **Rollback:** `https://carlosemichelon.github.io/concurso/v210.html`.

## Auditoria Drive ↔ Site

**Drive:** cinco arquivos + índice + ZIP confirmados. **GitHub:** estrutura V211 e vínculo lógico inscritos, com manifesto V211. **Navegador:** teste OAuth real pendente; não tratar URL pública ou commit como prova de exibição de imagens privadas. 

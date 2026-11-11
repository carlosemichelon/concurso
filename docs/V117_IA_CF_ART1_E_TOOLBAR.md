# V117 — IA local para grifo constitucional e barra PDF, preservando Base Técnica V116

**Publicação prevista:** 11/11/2026. Código base **V116**, mantido em `backup/v116-before-cf-ai-toolbar-v117-2026-11-11`.

O usuário solicitou aprofundar o grifador no **art. 1º da Constituição Federal** e corrigir ícones fora da posição na interface web. A atualização foi preparada sobre a **V116 publicada por outro trabalho**, preservando a sincronização privada e o cache IndexedDB da Base Técnica.

## Arquitetura
- `assets/v114_ia_lei_seca.js`: classificador supervisionado Naive Bayes executado localmente, treinável de modo determinístico com **154 exemplos rotulados**, sem leitura/transmissão de grifos, tokens ou SRS. **Somente segunda opinião**.
- `assets/v114_cf_artigo1.js`: parser contextual do art. 1º da CF/88: **13 segmentos** quando o artigo completo é selecionado; fundamentos I–V em amarelo, sujeito da República e povo em verde, remissão constitucional em azul, nenhuma rosa forçada. Requer contexto do art. 1º e evita ativação com outros artigos numerados.
- `assets/v114_calibrador_ui.js`: explica esse recurso no painel do perfil CF/88.
- `assets/v114_pdf_controls_position.css`: resolve especificidade CSS que exibia `#bm103ToggleTools` no desktop; no celular limita largura e ancora barra flutuante ao canto superior direito.
- `assets/v114_qa_cf_artigo1.js`, `tests/v114_cf_ia.cjs` e `.github/workflows/validar-ia-cf-v114.yml`: testes reproduzíveis; workflow GitHub Actions com Node sem npm nem rede do usuário.
- `docs/V114_IA_CF_ARTIGO1_TESTES_ICONES.md`: explicação detalhada, fontes oficiais e projetos semelhantes.

## Auditoria
- V113: art. 1º reconhecia zero núcleos de alta confiança.
- Parser novo: 10/10 variações do art. 1º, **13 marcações cada**, 5 fundamentos como regras, sem colisões; 10/10 casos adversariais que não devem ativar o artigo.
- Integração simulada do grifador: 13 grifos criados, não reabre janela; perfil Geral e inciso isolado conservadores.
- IA independente: 19/25 exemplos pequenos de avaliação separada, com seis erros. **Não confiar na predição numérica como decisão automática**.
- Regressões anteriores V112: 200 + 216 + 411 verificações funcionais e 190 estruturais. Não há quinta cor.
- Pré-montagem: 61 scripts, 53 estilos, `v116_drive_cards_sync.js`, arquivo mestre privado de grifos, atlas, SRS, PDF V111, edição de grifos, zoom com pinça e deslocamento lateral preservados. Totais publicados: 1.494 cartões da base pública, 72 PDFs e 270 imagens. O estado da Base Técnica privada depende de autorização real do usuário.
- Limite: sem homologação visual em navegador Android/iOS real, sem autenticação OAuth real entre dispositivos. A execução futura do workflow GitHub Actions também depende do status de Actions após o push.

## Referências
- Constituição atualizada: https://www2.camara.leg.br/legin/fed/consti/1988/constituicao-1988-5-outubro-1988-322142-normaatualizada-pl.html
- BERTimbau: https://github.com/neuralmind-ai/portuguese-bert
- LexNLP: https://github.com/LexPredict/lexpredict-lexnlp
- LexGLUE: https://github.com/coastalcph/lex-glue
- Transformers.js: https://github.com/huggingface/transformers.js

## Segurança
A V116 não foi sobrescrita; nenhum grifo histórico, cartão, cache privado, PDF, imagem ou evento SRS foi modificado. A publicação requer update não forçado de `gh-pages` e backup criado previamente.

# V114 — Grifador constitucional híbrido (estrutura + IA local) e correção da barra PDF

**Data:** 11/11/2026. **Origem:** V113. **Backup:** `backup/v113-before-cf-ai-icons-v114-2026-11-11`.

## 1. Problema reproduzido
Ao selecionar integralmente o **art. 1º da Constituição Federal de 1988**, inclusive cinco incisos e parágrafo único, com calibrador `cf88`, o classificador V113 apresentava “Classificação incerta: escolha manualmente a cor ou selecione trecho menor.”

Teste do V113 com 82 tokens selecionados: **nenhum núcleo de alta confiança**, apenas “Municípios” e “Estado” como potenciais agentes de confiança média; ao selecionar `I - a soberania;`, o classificador retornava vazio.

A razão técnica: os perfis anteriores reconheciam permissões, proibições, competências e condições, mas não **definições constitucionais**, **rol de fundamentos** nem **titularidade popular do poder**.

## 2. Fonte primária e análise do art. 1º
Texto constitucional vigente do art. 1º, Caput, I–V e parágrafo único:

- República Federativa do Brasil, formada pela união indissolúvel dos Estados, Municípios e Distrito Federal
- Estado Democrático de Direito e cinco fundamentos: soberania, cidadania, dignidade da pessoa humana, valores sociais do trabalho/livre iniciativa e pluralismo político
- Origem popular do poder, exercício direto ou por representantes, nos termos da Constituição.

Fonte oficial atualizada: https://www2.camara.leg.br/legin/fed/consti/1988/constituicao-1988-5-outubro-1988-322142-normaatualizada-pl.html

Mapeamento didático das **mesmas quatro cores**:

| Cor | Núcleos do art. 1º |
|---|---|
| **Verde** — sujeito/titular | “A República Federativa do Brasil”; “do povo” |
| **Amarelo** — definições/fundamentos | formação federativa; Estado Democrático de Direito; “tem como fundamentos”; os cinco fundamentos; origem e forma de exercício do poder |
| **Azul** — condição/remissão | “nos termos desta Constituição” |
| **Rosa** — exceção | **nenhuma exceção expressa no art. 1º**; não inventar rosa |

São **13 segmentos** de alta confiança para seleção do artigo completo. Os incisos não são coloridos por sua numeração: apenas quando os dispositivos, art. 1º e a expressão “tem como fundamentos”, estão no contexto da seleção. Uma frase isolada “I — a soberania” permanece manual por falta de contexto.

## 3. Arquitetura de IA local/híbrida
- `assets/v114_ia_lei_seca.js`: classificador **Multinomial Naive Bayes**, treinado em JavaScript com 154 exemplos **manualmente rotulados** em cinco classes: quatro cores e `nenhum`. Extrai unigramas e bigramas. Expõe `train()`, `predict()` e dados agregados, permitindo treinamento determinístico/reprodução no navegador. Todos os exemplos são públicos e escritos para estudo; nenhum dado privado de grifos é usado, enviado ou publicado.
- `assets/v114_cf_artigo1.js`: parser específico para o art. 1º constitucional. Localiza caput/expressão “tem como fundamentos”, incisos I–V e parágrafo único, valida retângulos de palavras, distribui 13 núcleos não sobrepostos e preserva as quatro cores. Usa a IA como **segunda opinião** e registra a evidência no novo grifo, **sem delegar decisões automáticas apenas ao modelo**. Títulos com outro número explícito (art. 2º, 3º, 5º...) não ativam o parser. A seleção de incisos sem o contexto do art. 1º permanece manual. As regras de outras leis continuam V112.
- `assets/v114_calibrador_ui.js`: mostra no painel constitucional que a análise do art. 1º usa estrutura + modelo estatístico de 154 exemplos; explica que é apenas uma segunda opinião.
- `assets/v114_qa_cf_artigo1.js`: testes reproduzíveis do art. 1º, com 10 formatos de extração, 10 cenários de não ativação, 130 verificações de cores, geometria e treinamento determinístico.
- `tests/v114_cf_ia.cjs`: teste Node sem dependências para GitHub Actions. `.github/workflows/validar-ia-cf-v114.yml`: execução automatizada no GitHub quando scripts/testes pertinentes mudarem e por disparo manual.

**Não foi instalado BERT ou LLM no site.** O modelo é pequeno, transparente e barato para o celular. Um caminho futuro seria treinamento de BERTimbau para rotular intervalos BIO (começo/dentro/fora de entidades), com anotação manual de centenas ou milhares de trechos de leis e avaliação em documentos jamais usados no treino. Para inferência em GitHub Pages pode-se empregar Transformers.js/ONNX, mas não convém baixar centenas de MB sem testes de desempenho móvel e privacidade.

## 4. Medições e limitações da IA
- Contexto art. 1º: **10/10 formatos** com 13 núcleos e todos os cinco fundamentos reconhecidos.
- **10/10 casos negativos** sem ativação indevida (outro número de artigo, excerto isolado, título sem conteúdo, falta de contexto etc).
- Integração do editor: 13 marcações criadas sem reabrir janela flutuante, 5 fundamentos amarelos, 2 agentes verdes, remissão azul, sem cor rosa artificial; fluxo Geral e inciso isolado continuam manuais.
- Modelo supervisionado estatístico: **19/25** exemplos curtos de avaliação separada (seis erros). Esses dados são minúsculos, a amostra foi elaborada manualmente e alguns padrões se sobrepõem aos do treino; **não representam precisão estatística geral** e demonstram por que a inferência sozinha não pode comandar grifos. Não é correto alegar “76% de precisão real em Direito”.
- Mantidas todas as regressões V112: 200 cenários funcionais antigos, 216 combinações de trechos de 12 leis, 411 adversariais/títulos e 190 verificações estruturais. **Nenhuma quinta cor**.
- PDFs digitalizados apenas como imagem e extração com fragmentação anormal continuam sem interpretação segura; nesses casos segue o modo manual.

## 5. Botão ☰ Ferramentas fora de posição
- Causa reproduzida em CSS: a regra antiga `#pdfDialog #bmV056FloatingControls button { display:inline-flex }` tinha especificidade maior que `#pdfDialog #bm103ToggleTools { display:none }`, tornando o botão mobile visível em desktop, onde não tinha largura própria.
- `assets/v114_pdf_controls_position.css`: esconde **Ferramentas**, **Grifar** e indicador de página em tela desktop usando especificidade + `!important`, sem ocultar controles originais do leitor. No celular, ancora a barra no canto superior direito do próprio diálogo, com dimensões explícitas e no máximo a largura visível. Trata larguras ≤390px sem deixar texto invadir os botões de desfazer, menu e fechar.
- A correção de CSS é visual: **não modifica handlers, zoom, rolagem lateral, marcas, histórico nem dados sincronizados**.

## 6. Projetos similares pesquisados
1. [BERTimbau](https://github.com/neuralmind-ai/portuguese-bert): encoder pré-treinado para português. Pode servir como base futura para identificação de trechos, depois de rotulação e *fine-tuning* próprios.
2. [LexNLP](https://github.com/LexPredict/lexpredict-lexnlp): segmentação e extração jurídica; o código tem licença AGPLv3, o que merece revisão antes de incorporar diretamente.
3. [LexGLUE](https://github.com/coastalcph/lex-glue): benchmark jurídico **em inglês**. Métricas não transferem diretamente para lei seca brasileira.
4. [Transformers.js](https://github.com/huggingface/transformers.js): inferência ONNX em navegador, inclusive texto e entidades. Relevante a eventual modelo BERTimbau especializado e quantizado para celular; **não** usado nesta V114.

## 7. Garantias
- O script de IA **não lê localStorage**, IndexedDB ou Google Drive e não envia dados à rede.
- Apenas grifos criados **após a atualização** usam o contexto novo; nenhum histórico, cor, ID, comentário, PDF, flashcard ou SRS é migrado.
- Os dados mestres do Drive continuam privados e usam o mecanismo anterior. A validação da autenticação real do Google entre dispositivos permanece pendente.
- A página pública do GitHub Pages e o comportamento real em Android/iOS exigem homologação visual; testes de código não são prova de layout em todos os aparelhos.

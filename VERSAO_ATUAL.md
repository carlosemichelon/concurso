# Banco Mestre — versão atual e política de alterações

**Registro conferido em 10/11/2026.**

- **Site publicado:** V063.
- **Branch de publicação:** `gh-pages` (**não** `main`).
- **Arquivo de entrada:** `gh-pages/index.html`.
- **Fonte de verdade da versão em execução:** `gh-pages/assets/version.json` — conferir os campos `version` e `home` **em toda nova solicitação**.
- **Arquivo HTML correspondente no momento do registro:** `gh-pages/v063.html`.
- **Versão anterior preservada:** `gh-pages/v062.html` (V061 e V060 igualmente preservadas; anteriores intactas).
- **Branch `main`:** contém código legado, cujo `assets/version.json` indica V031. **Não utilizar a versão da branch `main` para identificar a versão publicada.**

## V062 — inclusão de dois PDFs “ORIGINAL” da CONAMA (10/11/2026)

- Catálogo V062: `assets/pdf_catalog_v062.json` com **65 PDFs**, mantendo os 63 anteriores e respectivos IDs.
- Duas entradas adicionais, distintas das apostilas TEC Concursos: `PETRO10-CONAMA-001-ORIGINAL` (texto da resolução CONAMA 001/1986, 5 páginas) e `PETRO10-CONAMA-237-ORIGINAL` (CONAMA 237/1997, 11 páginas).
- “ORIGINAL” significa cópia do texto da norma fornecida pelo estudante, **não** certificação de consolidação/vigência. Validar atos posteriores ao estudar lei seca.
- Arquivos no Drive: `1NXA2iF85ngyuY4dqQo5mcldbQgk12lpY` e `1qwRg_qaNa7Vin6yTZUIYeYeXjC35FJLj`.
- Editor de PDF V061 mantido sem mudanças; origem dos grifos é o próprio estudante; preservar anotações locais, IDs canônicos, SRS e apostilas já cadastradas.
- `v061.html` e `assets/pdf_catalog_v027.json` preservados como versão anterior. Nova página `v062.html` lê exclusivamente `assets/pdf_catalog_v062.json`.

## Procedimento obrigatório antes de editar o site

1. Consultar **explicitamente a branch `gh-pages`** e ler `assets/version.json` na mesma branch. Não depender de memória, histórico de chat, nome de arquivos ou branch padrão do conector.
2. Verificar se `index.html` remete à versão indicada no manifesto e se o arquivo `vNNN.html` existe em `gh-pages`.
3. Caso haja divergência, alteração simultânea ou versão diferente da registrada aqui, **interromper a edição**, investigar e reconciliar, sem sobrescrever o trabalho mais novo.
4. Modificar somente a versão atual conferida ou criar uma versão sucessora, preservando a versão anterior, conforme a solicitação do usuário. **Nunca modificar V031, V050 ou outra versão anterior por engano.**
5. Em mudanças exclusivamente visuais, manter scripts, conteúdos, dados, IDs dos cartões, PDFs, imagens, históricos, SRS e leitores sem alterações.
6. Após publicar a nova versão, atualizar `gh-pages/assets/version.json`, o redirecionamento de `gh-pages/index.html` e este documento; conferir as alterações e informar a versão publicada.
7. A referência deste documento é um **registro histórico**: a autoridade operacional é sempre o `version.json` da branch `gh-pages`, checado de novo antes de cada edição.

**Regra prioritária:** nunca assumir que a branch padrão `main` representa a versão online; nela o manifesto pode estar muitas versões atrás.

## Backup e etapa do grifador V061

- Código V060 preservado também na branch `backup/v060-before-text-selection-2026-11-10`, commit de origem `a4c6be8198f028b3ac5f35d0f8dcb70363d88f85`.
- V061 inicia o grifo por seleção textual PDF.js: seleção automática de palavras, menu de cor/nota/ID de cartão/desfazer; grifo livre anterior permanece.
- O armazenamento local de grifos `BM030_STROKES_PDF` continua compatível. Originais, flashcards, SRS, IDs, Drive, PDFs e V060 não foram modificados por essa etapa.
- O **backup GitHub não cobre localStorage nem IndexedDB do navegador**. Sincronização Drive, OCR, biblioteca de grifos e extensão Chrome ainda são etapas futuras.
- Consulte `gh-pages/PLANO_GRIFOS_2026_11_10.md` para as 21 decisões aprovadas e o escopo preciso.
- A sintaxe e os arquivos foram verificados; falta conferir interação visual em navegador com PDF real.

## V063 — Biblioteca de Grifos local, Etapa 2 (10/11/2026)

- A **V062 de 65 PDFs permanece intacta**, inclusive as duas resoluções CONAMA originais; a V063 usa seu HTML como base e injeta módulos independentes de navegação e Biblioteca de Grifos em tempo de execução (arquivo `v063.html`).
- Módulos novos: `assets/v062_biblioteca_grifos.js`, `assets/v062_biblioteca_grifos.css`, `assets/v063_grifos_navegacao.js`.
- Biblioteca: busca, filtros (disciplina, assunto, PDF, cor, tipo e favorito), categorias/notas locais; marcas V060 antigas são exibidas como marcações visuais, **sem reconhecimento automático de texto**.
- Exportação manual filtrada em TXT, Markdown, JSON e relatório imprimível; backup manual **integral dos registros de grifo** em localStorage prefixo `BM030_STROKES_PDF:` e metadados `BM062_GRIFOS_META`.
- Backup do código anterior: `backup/v062-before-grifos-v063-2026-11-10`, de origem `3f0824c48481a23fda70dac35db47943e8d14d08`.
- Segurança: nenhuma migração automática; backup **não inclui PDFs, IndexedDB, flashcards nem SRS**. Google Drive continua sem sincronização de grifos.
- **Validação:** sintaxe JS verificada; é necessário teste de uso com PDF real e inspeção visual. PDF V061/V062 e marcações originais não foram modificados.

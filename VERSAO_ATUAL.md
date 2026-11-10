# Banco Mestre — versão atual e política de alterações

**Registro conferido em 10/11/2026.**

- **Site publicado:** V072.
- **Branch de publicação:** `gh-pages` (**não** `main`).
- **Arquivo de entrada:** `gh-pages/index.html`.
- **Fonte de verdade da versão em execução:** `gh-pages/assets/version.json` — conferir os campos `version` e `home` **em toda nova solicitação**.
- **Arquivo HTML correspondente no momento do registro:** `gh-pages/v072.html`.
- **Versão anterior preservada:** `gh-pages/v071.html` (V070, V069, V068, V067, V066, V065, V064, V063, V062, V061 e V060 preservadas).
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

## V064 — consistência das imagens excluídas e painel de grifos (10/11/2026)

- Publicação: `gh-pages/v064.html`; carregador usa `v062.html` imutável com 65 PDFs e injeta os módulos V063 e V064. Não altera versões anteriores.
- Código novo: `assets/v064_imagens_visibilidade.js`, `assets/v064_painel_grifos.js`, `assets/v064_painel_grifos.css`. Biblioteca V063 intacta.
- **Imagens excluídas:** nas páginas de assuntos, imagens com status `hidden` são ocultadas da grade, dos atalhos IMG e das contagens. Assuntos exclusivamente visuais sem imagens disponíveis não aparecem. O Atlas conserva a opção `Mostrar excluídos` para restauração, sem apagar os IDs, arquivos, marcações ou a classificação original.
- **Painel de grifos:** retrátil, redimensionável, ao lado do PDF editável. Mostra todas as marcações locais da versão/hash em uso por página; permite pesquisar texto/notas, clicar para navegar ao trecho e editar notas. Grifos visuais antigos são identificados como `texto não identificado`, sem OCR automático.
- Backup antes da etapa: `backup/v063-before-image-filter-and-pdf-panel-2026-11-10`, origem `4fb2ab187684e85a50a5d4acfe2314a5408ef60f`.
- Nenhuma limpeza de `localStorage` ou `IndexedDB`, migração automática, escrita em Drive, exclusão de mídia, criação de flashcard ou alteração SRS foi implementada.
- **Validação:** JavaScript e estrutura conferidos. Exige teste com imagens realmente excluídas e documento PDF real no navegador do usuário; não assumir validação visual definitiva.

## V065 — ajuste visual da janela Cartão rápido (10/11/2026)

- Corrigida a sobreposição entre o cabeçalho `bm-v047-card-header` e o botão flutuante de fechar PDF: `assets/v065_cartao_rapido_header.css` afasta a janela do topo, fixa o cabeçalho e mantém o × próprio da prévia acessível.
- Modificação somente visual; sem alterações aos flashcards/IDs/SRS, PDFs, grifos e controles funcionais.
- Backup anterior: `backup/v064-before-quick-card-header-fix-2026-11-10`.

## V066 — backup verificável e envio consentido de grifos ao Drive (10/11/2026)

- `v066.html` mantém o catálogo de 65 PDFs e todas as camadas V062–V065, adicionando `assets/v066_backup_drive_grifos.js` e `assets/v066_backup_drive_grifos.css`.
- Biblioteca de Grifos: botão **Preparar backup**, cálculo SHA-256 e tamanho dos dados, **Baixar JSON** e somente após confirmação explícita do usuário botão **Autorizar e enviar cópia ao Drive**.
- OAuth Google `drive.file` com token somente em memória; cria **novo arquivo privado** em `Meu Drive`, jamais sobrescreve um arquivo existente. Verifica ID, tamanho e metadados após upload; não repete automaticamente em caso de resultado ambíguo.
- A cópia inclui somente `BM030_STROKES_PDF:*` e `BM062_GRIFOS_META`; não inclui PDFs, dados IndexedDB, cartões nem SRS. A exportação pode ser guardada offline.
- **Não é sincronização bidirecional**, nem importação: não houve mescla/remoção de dados nem abertura de arquivos privados do usuário pelo assistente. A ferramenta GitHub não tem acesso ao navegador.
- Backup do código anterior: `backup/v065-before-drive-grifos-2026-11-10`.
- **Validação:** código JS, referências e estrutura checados. Teste real de autenticação, upload, interface e segurança depende de ação autorizada no navegador do usuário; não presumir que já foi realizado.

## V067 — diagnóstico funcional sem alterações de dados (10/11/2026)

- A **V066 foi preservada integralmente**. Backup de código: `backup/v066-before-diagnostics-2026-11-10` (branch de `gh-pages` criada antes da V067).
- Nova versão `v067.html`, com dois arquivos independentes: `assets/v067_diagnostico_local.js` e `assets/v067_diagnostico_local.css`.
- Na **Biblioteca de Grifos**, botão **Verificar agora** lista OK, problemas, alertas e verificações não executadas; botão **Copiar relatório sem dados privados** permite compartilhar somente status e totais agregados.
- No leitor de PDF, botão **Diagnóstico do leitor** permite conferir camada de seleção, identidade da fonte e sobreposição do cabeçalho Cartão rápido aos controles flutuantes quando a prévia está aberta.
- Confere manifesto, catálogo de **65 PDFs**, APIs do leitor/painel, backup, WebCrypto, leitura estrutural dos grifos em localStorage, âncoras e possíveis IDs duplicados, e imagens excluídas que eventualmente ainda apareçam na página de assunto carregada.
- **Privacidade e preservação:** nenhuma gravação em localStorage/IndexedDB nem upload ao Drive; a verificação de imagens usa `BancoMestreImagens.all()` apenas para leitura. O relatório não inclui texto de grifos, IDs de documentos ou tokens.
- **Não é substituto do teste real:** em páginas sem PDF aberto o diagnóstico marca testes como não executados; as operações de OAuth e upload **não são exercitadas**.
- Validação até agora: sintaxe e integração estática. Execução do diagnóstico sobre dados reais depende do clique do usuário no site.

## V068 — grifador avançado no PDF, inspirado no fluxo da Bússola Highlights (10/11/2026)

- Nova versão `v068.html`, publicada na `gh-pages`, preservando integralmente a V067 e o HTML-base V062 com **65 PDFs**.
- Backup do código antes do desenvolvimento: `backup/v067-before-complete-highlighter-2026-11-10` (não inclui armazenamento privado do navegador).
- Motor de PDF `assets/pdf_v068.js` (cópia evolutiva do V061): continua usando `BM030_STROKES_PDF` por documento, hash e página; salva texto, âncora com prefixo/sufixo, retângulos normalizados, cores, estilos, notas estruturadas, tags, favoritos, IDs e histórico incremental.
- Menu flutuante e seleção `assets/v068_grifador.js`: **grifo rápido** por seleção, alternância manual, paleta de seis cores semânticas com legendas personalizáveis, cor livre, sublinhado, sublinhado duplo (motor), tachado e ocultação visual com opção de mostrar; ajuste do trecho por nova seleção mantendo o mesmo ID; exclusão com desfazer imediato.
- O editor de notas inclui nota curta, disciplina, assunto, tags, IDs de cartões **já existentes**, explicação, dúvida, correção, macete, pegadinha, fundamento normativo, fonte e favorito. **Não cria flashcards nem altera SRS.**
- Atalhos padrão: Alt+Q marcador rápido e Alt+W painel; configurações locais, com rejeição dos conflitos de navegador mais comuns. Página com texto digital selecionável é necessária; PDF escaneado mantém grifo livre, sem OCR automático.
- Biblioteca `assets/v068_biblioteca_grifos.js` e painel `assets/v068_painel_grifos.js`: mostram notas estruturadas e tags, exportam metadados completos e possibilitam navegação/edição. `assets/v068_grifador.css` aplica visual suave, paleta compacta e notas em janela grande com identidade própria.
- Preservados: PDFs/Drive originais, dados existentes do localStorage/IndexedDB, imagens excluídas da exibição, cartões, SRS, V060–V067 e backup de código V067. **Não há migração automática de grifos antigos.**
- **Limites:** a funcionalidade opera no editor PDF do Banco Mestre, **não como extensão Chrome**. Google Drive V066 continua backup manual consentido; sincronização bidirecional, importação, OCR e conector ChatGPT permanecem pendentes.
- **Verificações feitas:** sintaxe dos novos módulos, integração no loader V068, renderização de estilos com canvas simulado, edição com mesma identidade/retângulos validados/histórico incremental em testes isolados. O teste de seleção, anotação, escala, OCR, OAuth e visual no navegador real continua pendente.

## V069 — estabilização do grifador de PDF (10/11/2026)

- Publicado `v069.html` como nova versão de `gh-pages`; V068 permanece intacta. Backup de código: `backup/v068-before-highlighter-stability-v069-2026-11-10`.
- Corrigida a temporização da seleção: o evento de página pronta é emitido **após** renderizar a página e vizinhas e liberar o estado `painting`, evitando tentar gravar quando o editor ainda está bloqueado.
- Emite `bm-pdf-storage-changed` somente após escrita bem-sucedida de `BM030_STROKES_PDF`; Biblioteca e painel agora escutam a gravação para atualizar as listas.
- **Desfazer exclusão protegido**: somente reverte a exclusão se o documento, hash, página e versão de mutação ainda forem os mesmos. Não desfaz sem querer uma edição posterior.
- **Seleção reversa corrigida**: prefixo e sufixo da âncora vêm dos limites do `Range`, independentemente do sentido do arraste. O sublinhado duplo ganhou botão na paleta.
- Ao trocar apenas o estilo do grifo, a cor anteriormente escolhida é preservada.
- Arquivos: `assets/pdf_v069.js`, `assets/v069_grifador.js`, `assets/v069_biblioteca_grifos.js`, `assets/v069_painel_grifos.js`.
- Preservados: catálogo de 65 PDFs, V068, grifos legados, cartões, IDs, SRS e imagens já excluídas da exibição. Não houve migração de dados ou gravação no Drive.
- **Validação:** sintaxe, integração estática e casos isolados de gravação/duplicação/edição/remoção; ainda pendem testes reais de PDF e interface.

## V070 — cores oficiais por palavra/trecho e proposta de nota (10/11/2026)

- **Quatro cores metodológicas vigentes:** amarelo = regra principal; verde = agente/autoridade/competência; rosa = exceção/ressalva; azul = condição/limitação/requisito/prazo. As seis legendas provisórias V068 não prevalecem; grifos antigos permanecem como estavam.
- O usuário seleciona palavras ou frases no PDF. Com a opção `Cores automáticas` ligada, um classificador **local e heurístico** tenta separar a seleção em trechos semanticamente distintos, atribui cores sugeridas e cria registros individuais com IDs e âncoras próprios.
- **Atomicidade:** os trechos de uma mesma seleção são salvos juntos em `BM030_STROKES_PDF`, com um único ponto para desfazer; qualquer falha invalida o lote e preserva o estado anterior.
- As marcações geram **propostas** de disciplina, assunto/subassunto e nota curta, inferidas de termos e título do PDF quando há evidência. São sinalizadas `classification_status: sugestao`, e só são confirmadas quando o usuário escolhe manualmente uma cor ou salva a revisão da nota.
- Classificações ambíguas mantêm estado não classificado e precisam de revisão. **Não há interpretação normativa por IA ou precisão garantida**.
- Biblioteca/painel indicam explicitamente `Sugestão não confirmada`, permitem revisão e exportam a distinção entre registro consolidado e proposta. Não são gerados flashcards automaticamente.
- Nova base `v070.html` com arquivos `assets/pdf_v070.js`, `assets/v070_classificador.js`, `assets/v070_grifador.js`, `assets/v070_biblioteca_grifos.js`, `assets/v070_painel_grifos.js` e `assets/v070_cores_metodologia.css`.
- Backup antes da implementação: `backup/v069-before-semantic-colors-2026-11-10`. Não contém dados privados do navegador.
- **Teste:** sintaxe e fluxo estático, casos de regra/autoridade/prazo/exceção e palavras isoladas, gravação atômica, IDs independentes, prevenção de duplicata e rollback simulado. Falta validar seleção real em PDF e zoom no navegador do usuário.

## V071 — atualização da metodologia de cores, com regra principal laranja (10/11/2026)

- A metodologia passa a ter **seis cores**: **vermelho** (`#FF8F96`) para proibições/vedações; **verde** (`#86DCAA`) para obrigações/deveres; **amarelo** (`#FFEA70`) para prazos/números; **azul** (`#89C7FF`) para exceções/ressalvas; **roxo** (`#CCA7FF`) para palavras-chave da banca; **laranja** (`#FFB86B`) para regra principal.
- A versão `v071.html` aponta para `assets/pdf_v071.js`, `assets/v071_classificador.js`, `assets/v071_grifador.js` e `assets/v071_cores.css`, mantendo Biblioteca e painel V070.
- O classificador separa sequências ou palavras isoladas conforme termos identificados, com marcadores coloridos e notas/assuntos sugeridos **não confirmados**. Ex.: "é vedado" vermelho, "deverá" verde, "em até 30 dias" amarelo, "exceto" azul, "exclusivamente" roxo, enunciado geral laranja.
- Cores antigas e registros já grifados **não são recoloridos ou migrados**. As categorias históricas `agente` e `condicao` ainda podem ser lidas e editadas na nova versão.
- O grifador permite escolher a cor diretamente, inclusive uma cor livre. A revisão das notas, cores e do assunto continua sob controle do usuário.
- Backup de código: `backup/v070-before-six-colors-2026-11-10`; não inclui grifos privados no navegador.
- **Validação:** sintaxe do JavaScript, integração dos arquivos e testes isolados de frases; seleção visual e persistência real ainda requerem teste no navegador com PDF aberto.

## V072 — identificação contextual de dispositivos normativos (10/11/2026)

- A `v072.html` preserva o HTML-base V062 e os **65 PDFs**, a paleta de seis cores V071 e os módulos de imagens excluídas/Cartão rápido/backup/diagnóstico.
- Novo classificador `assets/v072_contexto_normativo.js`, carregado **depois** do classificador V071 e **antes** do grifador. Acrescenta reconhecimento de `Art. 5º`, `Art.5º`, `§ 2º`, `§2º`, `parágrafo único`, `inciso IV`, `alínea a`, `Lei nº 14.133/2021` e NBRs.
- O amarelo mantém o significado **prazos e números**: referências normativas numéricas também são amarelas, porém recebem justificativa e nota sugerida de **referência normativa**, não de prazo.
- Diferencia expressões de proibição (`não poderá`, `é vedado`), obrigação (`deverá`), exceção/condição (`salvo`, `desde que`) e palavras absolutas de banca (`sempre`, `exclusivamente`). A propagação da cor encerra na vírgula, evitando colorir cláusulas independentes.
- `assets/pdf_v072.js` grava somente em **grifo novo** dois campos adicionais, `classification_confidence` e `classification_basis`. Biblioteca e painel, via `assets/v072_biblioteca_grifos.js` e `assets/v072_painel_grifos.js`, exibem motivo e confiança, sempre como **sugestão não confirmada**.
- CSS adicional `assets/v072_contexto_normativo.css` e testes de regressão em `tests/v072_classificacao_contextual.json`.
- **Validação:** 33/33 casos isolados, uma frase mista com cinco categorias, notas distintas de dispositivo e de prazo, sintaxe dos arquivos. **Pendente:** teste completo no navegador com PDF real, zoom, salvamento e reprodução da seleção.
- Backup de código V071: `backup/v071-before-contextual-legal-highlights-v072-2026-11-10`. Nenhum grifo pessoal, PDF, cartão, SRS ou status de imagem excluída foi migrado ou apagado.

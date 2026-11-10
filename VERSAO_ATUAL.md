# Banco Mestre — versão atual e política de alterações

**Registro conferido em 10/11/2026.**

- **Site publicado:** V081.
- **Branch de publicação:** `gh-pages` (**não** `main`).
- **Arquivo de entrada:** `gh-pages/index.html`.
- **Fonte de verdade da versão em execução:** `gh-pages/assets/version.json` — conferir os campos `version` e `home` **em toda nova solicitação**.
- **Arquivo HTML correspondente no momento do registro:** `gh-pages/v081.html`.
- **Versão anterior preservada:** `gh-pages/v080.html` (V075, V074, V073, V072, V071, V070, V069, V068, V067, V066, V065, V064, V063, V062, V061 e V060 preservadas).
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

## V073 — seleção PDF e histórico transacional (10/11/2026)

- Nova versão `v073.html`, preservando `v072.html` e o HTML-base V062 com **65 PDFs**.
- Backup do código V072: `backup/v072-before-selection-stability-v073-2026-11-10`; o backup GitHub não guarda grifos privados do navegador.
- Motor evolutivo `assets/pdf_v073.js`: evento `bm-pdf-render-start` avisa que uma troca de página ou zoom começou; desfazer/refazer restaura anotações e pilhas de histórico em qualquer falha de persistência; criações individuais/lotes, edições e exclusões restauram as pilhas anteriores se o localStorage falhar.
- Grifador `assets/v073_grifador.js`: ao iniciar renderização, remove seleção/âncora antiga; ao renderizar camada PDF.js, **anexa a camada antes de calcular medidas**, impede cliques até ficar pronta, remove versões obsoletas e só então permite marcar palavras; mantém seis cores e classificação contextual V072.
- Diagnóstico sob demanda `assets/v073_teste_grifador.js` + CSS: botão **Verificar grifos** no leitor PDF; confere se a camada selecionável está alinhada, marcações locais são legíveis, IDs e retângulos válidos e se existem grifos multilinha; orienta teste de zoom e reabertura sem alterar o documento.
- **Testes isolados:** 10 cenários de criação multilinha em lote, undo/redo, falhas simuladas de criação/edição/exclusão e recuperação das pilhas de histórico; sintaxe e integração checadas. **Ainda não é teste end-to-end real:** zoom, seleção com mouse, recuperação após reabrir e precisão visual dependem de execução no navegador do usuário.
- Preservados PDF/IDs/SRS e marcações históricas, incluindo exclusões de imagens. OCR, reancoragem assistida entre versões PDF, extensão Chrome e Drive bidirecional permanecem pendentes.

## V074 — um grifo por seleção, sem dividir em segmentos (10/11/2026)

- **Nova regra do usuário:** cada seleção inteira, de uma ou de várias linhas, cria **uma anotação, um ID e uma cor única**. A base de dados NÃO recebe um registro diferente por palavra ou sequência.
- O classificador ainda consegue examinar sinais de cores diferentes dentro do texto, mas essa análise serve apenas para decidir **se há uma cor única defensável**. Nunca chama `addTextHighlights` pelo grifador V074.
- **Cor manual tem prioridade absoluta.** Ao escolher um dos seis botões, grava o trecho inteiro com aquela cor; se o mesmo trecho já está marcado, atualiza a cor mantendo o ID e as notas existentes.
- Automático: um único sinal de categoria confiável aplica **uma cor sugerida para todo o trecho**; sinais conflitantes (ex.: obrigação + prazo) ou ausência de evidência deixam a seleção pendente no menu até escolha manual. Não usa silenciosamente a última cor.
- Notas e assuntos sugeridos continuam não confirmados até revisão. Mudança de cor pelo usuário confirma somente a cor, não a nota/assunto.
- Mantém as seis cores: vermelho `#FF8F96`, verde `#86DCAA`, amarelo `#FFEA70`, azul `#89C7FF`, roxo `#CCA7FF`, laranja `#FFB86B`.
- Arquivos: `assets/pdf_v074.js`, `assets/v074_analise_selecao.js`, `assets/v074_grifador.js`, `assets/v074_grifo_unico.css`; HTML `v074.html`; regressão `tests/v074_selecao_unica_cores.json`.
- Backup anterior: `backup/v073-before-unified-highlights-v074-2026-11-10`. Todos os grifos segmentados *existentes* permanecem sem migração e sem mescla automática; nenhuma anotação é apagada ou recolorida.
- **Testes:** reconhecimento de cinco cores com gatilhos explícitos, bloqueio de seleção ambígua, criação única multilinha, prioridade da cor manual e alteração com ID preservado foram simulados e passaram. **Pendente:** teste no navegador do usuário com PDF real, reabertura, zoom e interface mobile.

## V075 — exatamente seis cores fixas na metodologia (10/11/2026)

- **Vermelho `#FF8F96`:** Proibições e vedações (é vedado, não poderá).
- **Verde `#86DCAA`:** Obrigações e deveres (deverá, compete).
- **Amarelo `#FFEA70`:** Prazos e números (em até 30 dias, 2 anos).
- **Azul `#89C7FF`:** Exceções e ressalvas (salvo, exceto, ressalvada).
- **Roxo `#CCA7FF`:** Palavras-chave da banca (exclusivamente, sempre, jamais).
- **Laranja `#FFB86B`:** Conteúdo importante a destacar, **escolhido manualmente**; substitui o significado de "regra principal" nas marcações NOVAS.
- Paleta do novo grifador tem somente essas seis cores: retirados o seletor de cor livre e a opção de alterar o significado das categorias. Configurações históricas de cores não são apagadas, apenas não alteram a nova paleta.
- Cores sugeridas continuam disponíveis para as cinco categorias objetivas. Seleção neutra ou ambígua solicita escolha manual; não é automaticamente destacada em laranja.
- Mantida V074: **uma seleção = um grifo, um ID e uma cor**, inclusive multilinha. Grifos antigos (inclusive `regra`, `agente`, `condicao` e cores personalizadas históricas) permanecem intactos.
- Arquivos novos: `assets/pdf_v075.js`, `assets/v075_seis_cores.js`, `assets/v075_analise_selecao.js`, `assets/v075_grifador.js`, `assets/v075_paleta_fixa.css`; página `v075.html`; testes `tests/v075_seis_cores_fixas.json`.
- Backup do código anterior: `backup/v074-before-fixed-six-colors-v075-2026-11-10`. Não equivale a backup de dados privados do navegador.
- Sintaxe, classificação, seleção ambígua e preservação das categorias legadas testadas isoladamente. Ainda falta validar a operação visual em PDF real no navegador.

## V076 — flashcards sincronizados com planilha privada do Google Drive (10/11/2026)

- Publicada a página `gh-pages/v076.html`, derivada da V075 **sem alterar o grifador, seis cores, 65 PDFs, imagens, SRS ou o armazenamento local**. Backup de código: `backup/v075-before-drive-sync-v076-2026-11-10`.
- Módulo independente `assets/v075_drive_cards_sync.js`: botão de consentimento Google OAuth `drive.readonly` na área Flashcards. Lê diretamente o arquivo XLSX privado no Drive, ID `1SA-PKBrlaovuNLFMPBx7BByH3BH0Tcsr` (aba `Cartoes_V015`) e valida 1.497 IDs, após autorização do titular. O XLSX e as respostas privadas NÃO são publicados no repositório.
- Atualização automática a cada 120 segundos **somente enquanto a página estiver aberta e o token OAuth estiver válido**. Fora dessas condições não há sincronização do lado do servidor. Alterações futuras devem ser gravadas no mesmo ID de arquivo no Drive; novas cópias requerem reconfiguração do ID. O sistema é de **consulta somente leitura**, não envia alterações do site de volta à planilha.
- Falhas de rede, autenticação ou leitura conservam os cartões já disponíveis e não alteram ID, SRS, PDFs, grifos ou respostas. Os 1.494 cartões V015 permanecem como fallback estático, acrescidos dos 22 Ijuí provisórios.
- Teste JavaScript, leitura/validação do XLSX e fluxo de autorização em navegador simulado passaram (1.497 cartões e IDs CARD-1495 a CARD-1497). **Autorização OAuth real no navegador do usuário e implantação visual ainda pendentes de confirmação**; não apresentar como teste real completo.
- Contrato metodológico: todos os cartões usam a estrutura de lei seca (frente concisa, verso exato e verificável, explicação/macete/fontes separados). Literalidade jurídica apenas para dispositivos legais; demais disciplinas exigem correção técnica e contexto. Cartões antigos preservados até auditoria de atualização. Metodologia oficial atualizada no Google Doc vigente, 10/11/2026.

## V077 — Catálogo completo de PDFs e sincronização por pastas privadas (10/11/2026)

- Manifesto `assets/version.json` e entrada do site apontam para `v077.html`, derivada da V076, sem substituir o grifador de seis cores V075 nem a sincronização de cartões. Branch backup `backup/v076-before-pdf-sync-v077-2026-11-10`.
- Catálogo `assets/pdf_catalog_v077.json` possui **72 PDFs**, preservando 65 anteriores e acrescentando seis PDFs NR fornecidos (01, 05, 06, 07, 17 e 18) e a Lei 15.190/2025 (30 páginas, Câmara dos Deputados). Todos os sete arquivos novos estão na pasta `06 – PDFs e Materiais` do Google Drive, em subpastas NRs e Licenciamento Ambiental. Os PDFs permanecem no Drive; apenas metadados/referências no GitHub. A vigência integral dos PDFs NR não foi revalidada para novembro/2026, e seus títulos identificam versão do arquivo fornecido.
- Índice `assets/pdf_grupos_v077.json` atribui **72/72 IDs** a um grupo de consulta. Corrige omissão de ambos os PDF originais CONAMA 001/1986 e 237/1997 no agrupamento anterior. `assets/v077_pdfs_recolhidos.js` mantém os grupos recolhidos por padrão e permite registros dinâmicos detectados no Drive.
- `assets/v077_drive_pdf_sync.js` acrescenta conexão Google OAuth `drive.readonly` somente mediante ação explícita do titular na aba PDFs. Após consentimento, lista PDFs existentes nas pastas do Drive identificadas por IDs `1_IgIlki_2ZlMmOaKmYuzhiMSjyLa-cnV` (NRs) e `18MsuWSayX7xpBhNmGjSvFmiiv1hF6YZk` (Licenciamento), deduplica IDs/nomes estáticos e revalida a cada **120 s** enquanto a página e o token estiverem ativos. Arquivos novos nessas pastas surgem somente na sessão autorizada, sem a necessidade de atualizar o GitHub. Novas pastas fora dessas duas NÃO são monitoradas. Não há serviço de sincronização em segundo plano nem publicação pública dos bytes.
- Falha de rede/autorização conserva catálogo/grifos/IDs SRS; imagens e flashcards intactos. `assets/v077_diagnostico_local.js` confere manifesto e 72 PDFs. A origem PDF no Drive não é modificada pelo site.
- Verificações: catálogo e grupos 72/72 sem IDs duplicados; arquivos originais de PDF presentes no Drive, permissões privadas verificadas em amostras NR-01/Lei 15.190; scripts estáticos e referências conferidos no GitHub. OAuth real e visualização PDF no navegador do titular **ainda precisam de teste em sessão autenticada**.


## V078 — comparação privada dos grifos sem restauração (10/11/2026)

- Nova publicação `v078.html` preserva a V077, seu catálogo de **72 PDFs**, grupos, pastas privadas no Drive, 6 cores, sincronização consentida de PDFs/cartões, SRS, IDs, imagens e grifos históricos.
- Integra os módulos isolados `assets/v078_pre_sync_grifos.js` e `assets/v078_pre_sync_grifos.css`. Aba Biblioteca de Grifos recebe o botão **Testar cores** (16 casos locais, somente leitura) e **Comparar backup Drive**.
- Comparação exige consentimento Google `drive.file` no navegador do titular; localiza o backup V066 acessível, confere tamanho e SHA-256 antes de ler, valida o esquema e confronta strings brutas por chave de página e metadados. Exibe totais iguais, exclusivos e divergentes. Diferença de formato/ordem em JSON pode ser sinalizada de modo conservador.
- **Proibida nesta etapa:** qualquer importação, restauração, sincronização bidirecional, mesclagem, escrita ou exclusão de grifos. Nada é enviado pela interface de comparação; a proteção da metodologia permanece.
- Testes automatizados: 23/23 casos de classificação V075, 16/16 do autoteste V078, além de simulação de dados iguais/divergentes e rejeição de backups com formato, chaves ou JSON incorretos. **Não houve teste OAuth real ou PDF real com anotações pessoais no navegador.**
- Backup anterior criado: `backup/v077-before-grifos-pre-sync-v078-2026-11-10`. Módulos V078 foram previamente desenvolvidos em branch separada, com documentação e PR #15.


## V079 — diagnóstico de versão e catálogo sem falsos alertas (10/11/2026)

- O módulo `assets/v079_diagnostico_local.js` substitui somente no loader V079 a referência a V077, preservando arquivos e versões anteriores.
- Em vez de exigir sempre `V077 / v077.html`, confere a correspondência entre `version`, `home` e página aberta. Em páginas históricas mostra aviso, não erro; manifesto inconsistente é problema.
- Contagem esperada de PDFs vem de `assets/version.json` com fallback 72. Catálogo e PDFs da V077 continuam sendo os **72 documentos atuais**. A V078 com autoteste das cores e comparação consentida de grifos segue preservada.
- Testes de lógica: **6/6 cenários aprovados**, sintaxe e manutenção de módulos V075/V077/V078 conferidas. Sem escrita de dados pelo diagnóstico. Falta validação no navegador real.
- Backup do código V078: `backup/v078-before-version-diagnostics-v079-2026-11-10`.


## V080 — correção da cor seletiva do grifador (10/11/2026)

- Teste reproduziu falha: quando PDF.js divide uma palavra entre dois ou mais spans (ex.: `ve` + `dado`), a classificação V075 tratava a seleção como indefinida mesmo que o usuário tivesse selecionado `É vedado`. **Correção:** `assets/v080_analise_selecao.js` classifica palavras a partir do texto integral selecionado, mantendo os retângulos originais e as âncoras sem migração.
- Em V075, modo manual com grifo rápido aplicava a última cor sem esperar escolha. **Correção:** `assets/v080_grifador.js` mostra o menu de seis cores antes de gravar; o automático continua colorindo diretamente quando há uma categoria inequívoca, e ambiguidades continuam pedindo escolha.
- CSS `assets/v080_grifador_cores.css` impede que botões com atributo `hidden` apareçam por estilo anterior e torna as cores selecionadas mais claras visualmente.
- Respeita **uma seleção → um grifo/ID/cor**; a cor manual prevalece. Laranja continua apenas manual. Grifos antigos, notas, IDs, SRS, 72 PDFs da V077, biblioteca, Drive, diagnóstico e todas as versões anteriores intactos.
- Backup de código: `backup/v079-before-selective-colors-fix-v080-2026-11-10`.
- Testes isolados de regressão 21/21 e de fragmentação/controle manual 10/10 passaram. **Pendente:** homologação no navegador com PDF real; não afirmar que a seleção física do usuário já foi testada.


## V081 — seleção multicolorida por parágrafo (10/11/2026)

- Pedido do usuário substitui a antiga regra **uma seleção/uma cor** no novo fluxo automático: **uma seleção gera vários trechos coloridos**, cada um com ID próprio, mas com **salvamento e Desfazer conjuntos**; o modo manual continua produzindo um único grifo.
- Novo planejador `assets/v081_multicor.js` reconhece proibições, obrigações, prazos/números, exceções e palavras da banca, preservando palavras completas e limites visuais do PDF. Laranja permanece **exclusivamente manual**. Não colore conteúdo neutro sem evidência.
- `assets/v081_grifador.js` integra seleção de texto em spans PDF.js com offsets/Ranges reais, mostra uma **prévia obrigatória** e botão `Aplicar trechos coloridos`, bloqueia sobreposição a marcações antigas. Limite conservador de 12 grifos por seleção. O usuário pode editar posteriormente cada grifo sem alterar os demais.
- `assets/pdf_v081.js` reexpõe a operação `addTextHighlights` já existente no núcleo, com **uma escrita em localStorage e um desfazer** para o lote; falhas restauram o estado anterior sem gravação parcial. Anotações antigas não sofrem migração.
- Arquivos independentes `assets/v081_multicor.css`, `tests/v081_multicor.json` e `docs/V081_GRIFOS_MULTICOR.md`. Versão V080 e backups preservados em `backup/v080-before-paragraph-multicolor-v081-2026-11-10`.
- **Testes concluídos:** classificação sintética 13/13, palavra fragmentada em spans, bloqueio de palavra parcial, atomicidade e rollback. **Ainda pendente:** homologação com PDF real, zoom e reabertura no Chrome/Android do titular; classificação local é heurística, não interpretação normativa confiável.

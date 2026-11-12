# Instruções de edição para agentes — Banco Mestre

**Leia `VERSAO_ATUAL.md` antes de qualquer alteração.**

Este repositório tem duas branches que podem conter portais de versões diferentes:
- A **única branch de publicação do site é `gh-pages`**, mesmo quando o acesso padrão do GitHub mostra `main`.
- Em 11/11/2026, após uma publicação concorrente, o manifesto da branch `gh-pages` passou a registrar **V128**; `main` continha **V031 legado**. Não assumir que estes números continuam vigentes: verificar `gh-pages/assets/version.json` e `gh-pages/index.html` antes de cada edição. Consulte [o mapa de governança](docs/GOVERNANCA_VERSOES_DRIVE_GITHUB_2026-11-11.md).

## Preflight obrigatório

Antes de editar, execute na branch `gh-pages`:
1. Ler `assets/version.json` (campos `version` e `home`);
2. Conferir `index.html` e a existência do HTML apontado pelo manifesto;
3. Se o estado divergir do documento, adotar o estado *verificado* de `gh-pages` e investigar antes de gravar;
4. **Nunca** escrever em `main` para uma solicitação sobre a versão atual publicada, nem editar versões antigas sem instrução expressa.

Ao lançar versão nova, mantenha a anterior intacta, atualize manifesto, entrada e `VERSAO_ATUAL.md` em `gh-pages`; preserve dados, IDs, SRS, leitores, PDFs e Atlas, exceto quando o pedido exigir.

Este arquivo contém uma **regra operacional**, não substitui conferir os arquivos no GitHub a cada tarefa.

## Evolução de grifos

- Antes da V061, foi criada a branch de backup `backup/v060-before-text-selection-2026-11-10`.
- Regras de produto e etapas em `gh-pages/PLANO_GRIFOS_2026_11_10.md`.
- Não apresentar as 21 decisões de alinhamento como implementadas: a V061 contém só o primeiro estágio de grifos por seleção de texto.
- O GitHub não armazena automaticamente os grifos/SRS que o usuário tem em localStorage/IndexedDB. Não substituir essas bases nem realizar migrações sem cópia e confirmação.

## Biblioteca V063
- A versão V063 foi publicada com apontamento para `v063.html`; hoje o manifesto e a entrada apontam para V064.
- `v063.html` carrega, em tempo de execução, o HTML preservado `v062.html` (65 PDFs, dois CONAMA originais) e adiciona os módulos `assets/v063_grifos_navegacao.js`, `assets/v062_biblioteca_grifos.js` e seu CSS. O carregador deve ser testado em navegador antes de ser considerado plenamente validado.
- V062 preservada como HTML estático. Backup de código `backup/v062-before-grifos-v063-2026-11-10`.
- A Biblioteca lê dados de grifos no **navegador do usuário**; GitHub não guarda grifos privados. Nenhuma migração ou sincronização automática permitida. O botão backup exporta somente localStorage das anotações; avisar que não inclui PDFs, IndexedDB, cartões ou SRS.

## V064 — filtro de imagens excluídas e painel lateral de grifos
- Manifesto e `gh-pages/index.html` apontavam para `v064.html`; desde V066 apontam para `v066.html`.
- V064 preserva HTML V062 (65 PDFs e resoluções CONAMA originais), com módulos da Biblioteca V063 mais `assets/v064_imagens_visibilidade.js`, `assets/v064_painel_grifos.js` e `assets/v064_painel_grifos.css`.
- Imagens com status `hidden` não podem ser mostradas nos assuntos, sumários e atalhos de imagem da base. Atlas conserva a opção `Mostrar excluídos` para restauração.
- Painel de grifos é local por documento/hash; não transferir entre versões, não alterar originais.
- Backup V063: `backup/v063-before-image-filter-and-pdf-panel-2026-11-10`.
- Testar imagens previamente excluídas e painel em PDF real antes de considerar validação de interface definitiva.

## V065 — prévia Cartão rápido
- `assets/v065_cartao_rapido_header.css` corrige apenas a janela `#pdfQuickPanelV047` e o cabeçalho `.bm-v047-card-header` sob o botão flutuante Fechar PDF. Preservar controles, cartões e SRS.
- Backup `backup/v064-before-quick-card-header-fix-2026-11-10`.

## V066 — backup consentido de grifos no Drive
- `v066.html` carrega a base V062 preservada e módulos V063, V064, a correção V065 e `assets/v066_backup_drive_grifos.js` + seu CSS.
- O usuário deve primeiro preparar e baixar um JSON com hash SHA-256, confirmar que salvou e clicar para autorizar upload. Criar **nova cópia** no Google Drive via OAuth drive.file; token em memória e nada de substituições remotas, reenvios automáticos ou importação silenciosa.
- O JSON contém somente `BM030_STROKES_PDF:*` e `BM062_GRIFOS_META`. **Não** inclui PDFs/IndexedDB/flashcards/SRS. Apresentar limitações e nunca dizer que dados locais foram copiados ao GitHub.
- Backup de código: `backup/v065-before-drive-grifos-2026-11-10`.
- Testes visuais/OAuth/envio real pendentes. Nunca presumir operação no Google Drive sem confirmação da API após consentimento do usuário no navegador.

## V067 — diagnóstico local não destrutivo
- Versão publicada: `v067.html`, manifesto e entrada apontam para V067. V066 e versões anteriores preservadas.
- `assets/v067_diagnostico_local.js` e `assets/v067_diagnostico_local.css` acrescentam diagnóstico manual na Biblioteca e no leitor PDF.
- Diagnóstico verifica estrutura, versão, catálogo de 65 PDFs, imagens excluídas, integridade/âncoras dos grifos, SHA-256, painel e sobreposição da prévia do cartão. Não escreve dados nem acessa Drive; relatório inclui somente resultados e totais agregados.
- Backup de código: `backup/v066-before-diagnostics-2026-11-10`.
- Testes com PDF real, páginas de assunto com exclusões e OAuth continuam pendentes; não confundir presença de código com execução validada.

## V068 — grifador avançado e visual de seleção
- A versão atual `gh-pages/v068.html` modifica **somente na montagem dinâmica** os scripts legados de seleção/core do HTML-base V062, apontando para `assets/pdf_v068.js` e `assets/v068_grifador.js`. Biblioteca e painel usam `assets/v068_biblioteca_grifos.js` e `assets/v068_painel_grifos.js`; CSS `assets/v068_grifador.css`. As versões anteriores permanecem imutáveis.
- Backup do código anterior: `backup/v067-before-complete-highlighter-2026-11-10`. Isso **não** copia grifos, PDFs guardados no navegador nem SRS.
- Preservar IDs `BM-TXT-*`, chave `BM030_STROKES_PDF:<id>:<hash>:P<n>`, âncoras textuais e coordenadas e histórico incremental. Não mudar grifos legados ao abrir.
- O menu de seleção permite cores semânticas/edição do significado, sublinhar, tachar, ocultar/mostrar, notas estruturadas, tags e favorito; vinculando IDs apenas, sem criar flashcards. Toda proposta de criação de flashcard deve respeitar as regras de erros/dificuldade e aprovação expressa do usuário.
- A exclusão é direta com desfazer imediatamente (sem lixeira) e as edições preservam ID e histórico. As notas classificadas também atualizam `BM062_GRIFOS_META` sem migrar os registros antigos.
- Atalhos configuráveis (Alt+Q/Alt+W), evitando conflitos comuns de navegador; não enviar dados sem consentimento. O envio manual de backups V066 permanece independente.
- **Testes manuais pendentes:** seleção real sobre PDF, zoom e troca de página, exportação PDF anotado, menu mobile, PDF escaneado, ocultar/mostrar, biblioteca/painel e atalhos.
- OCR, sincronização bidirecional Drive, Chrome extension e conector ChatGPT continuam projetos distintos. Não alegar conclusão dessas funcionalidades.

## V069 — estabilidade e preservação
- Entrada e manifesto devem apontar para `v069.html`; motor PDF `assets/pdf_v069.js`, paleta `assets/v069_grifador.js`, Biblioteca `assets/v069_biblioteca_grifos.js` e painel `assets/v069_painel_grifos.js`. CSS V068 e scripts de outras áreas preservados.
- **Não** editar os arquivos V068 anteriores nem converter grifos legados automaticamente.
- Emitir evento `bm-pdf-active-page-rendered` apenas após renderização e liberação do estado de edição. Informar `bm-pdf-storage-changed` somente após persistência bem-sucedida.
- Desfazer exclusão imediata só quando o ID removido for o último evento de edição no mesmo documento/hash/página. Nunca desfazer outra alteração em seu lugar.
- Backup de código antes de V069: `backup/v068-before-highlighter-stability-v069-2026-11-10`. Não confundir com backup de grifos privados.
- Teste no navegador, inclusive PDF com múltiplas linhas/zoom e janela pequena, ainda necessário. Não inferir validação completa por testes isolados.

## V070 — cores metodológicas e confirmação de sugestões
- `v070.html` é a versão atual. V069 intacta em backup `backup/v069-before-semantic-colors-2026-11-10`.
- Quatro cores oficiais: amarelo regra; verde agente/autoridade/competência; rosa exceção/ressalva; azul condições/limitações/requisitos/prazos. Respeitar cores personalizadas e não remapear grifos históricos automaticamente.
- `assets/v070_classificador.js` é um classificador heurístico local **de sugestões**: ele não faz interpretação legal validada e não deve criar cartões, modificar SRS nem gravar notas formais automaticamente.
- Cada trecho deve reter ID, texto, âncora própria e retângulos. Em seleção com múltiplos trechos usar `addTextHighlights` (transação única com rollback), nunca salvar parcialmente uma classificação.
- Metadados `classification_status: sugestao` indicam não confirmado. Confirmar manualmente através de cor ou salvamento de nota. Mostrar sempre o status em Biblioteca/painel/exportação.
- Nenhuma importação automática, OCR, extensão Chrome, conector ChatGPT ou sincronização bidirecional Drive foi adicionada.
- Arquivos V069 e anteriores são imutáveis; script, CSS e núcleo V070 ficam isolados.

## V071 — seis cores oficiais de grifo
- `v071.html` é a versão atual. Preserve V070 e as anteriores; backup `backup/v070-before-six-colors-2026-11-10`.
- Nova correspondência: `proibicao=#FF8F96` vermelho, `obrigacao=#86DCAA` verde, `prazo_numero=#FFEA70` amarelo, `excecao=#89C7FF` azul, `banca=#CCA7FF` roxo, `regra=#FFB86B` laranja.
- Não recolorir nem migrar automaticamente grifos antigos. Aceitar categorias legadas `agente`, `condicao` e `nao_classificado`.
- O classificador é heurístico e local; a cor, o assunto e a nota sugeridos não dispensam revisão e confirmação humana. Não gerar flashcards automaticamente, nem alterar SRS.
- Scripts exclusivos V071: `assets/pdf_v071.js`, `assets/v071_classificador.js`, `assets/v071_grifador.js`, `assets/v071_cores.css`. Manter catálogo V062 de 65 PDFs.

## V072 — classificador contextual normativo
- Versão: `v072.html`. Backup de código antes das alterações: `backup/v071-before-contextual-legal-highlights-v072-2026-11-10`.
- Os scripts mantêm a sequência: V071 classificador -> V072 contexto normativo -> V071 grifador, com núcleo de PDF `assets/pdf_v072.js`. Não reescrever V071.
- Reconhecer referência normativa numérica como amarela, mas **nunca** confundi-la com prazo na nota sugerida. Encerrar propagação de categorias na vírgula e em pontuação de oração, exceto abreviaturas de dispositivo `Art.`.
- Persistir `classification_confidence` e `classification_basis` apenas em novos grifos; Biblioteca/painel exibem justificativa e ressalvam que a classificação é provisória.
- Manter cores V071, registros existentes, IDs, flashcards, SRS, imagens ocultas e 65 PDFs. Nenhuma reclassificação histórica silenciosa.
- Testes de regressão: `tests/v072_classificacao_contextual.json`. A validação real no navegador com PDFs continua necessária; não afirmar conclusão de OCR, sincronização bidirecional ou migração assistida.

## V073 — ciclo de seleção seguro e diagnóstico
- Manifesto e portal devem apontar para `v073.html`. Backup do código V072 `backup/v072-before-selection-stability-v073-2026-11-10`.
- Motor `assets/pdf_v073.js`: evento `bm-pdf-render-start` invalida seleção antiga ao iniciar renderização; `bm-pdf-active-page-rendered` só é emitido quando o PDF está pronto.
- `assets/v073_grifador.js`: anexar textLayer antes de executar `pdfjsLib.renderTextLayer` para medições válidas; manter `pointer-events:none!important` na camada até a promessa concluir e retirar camada obsoleta se o ticket de renderização mudar.
- Snapshot de grifos, pilhas undo/redo e anotações devem ser restaurados se persistência local falhar; nunca anunciar um desfazer como bem-sucedido quando localStorage não gravou.
- Diagnóstico de grifos `assets/v073_teste_grifador.js` é apenas leitura: não altera o PDF nem o banco, não transmite dados privados.
- Não migrar/recolorir grifos históricos; preservar as seis cores, 65 PDFs, flashcards/IDs/SRS e política de imagens excluídas.
- Verificação manual real com PDF (multilinha, zoom, reabertura, exportação) ainda obrigatória antes de chamar o leitor de validado integralmente.

## V074 — UMA seleção = UM grifo e UMA cor
- Versão atual `v074.html`; backup do código `backup/v073-before-unified-highlights-v074-2026-11-10`; V073 e anteriores intactas.
- Não criar vários registros por palavras ou sequências identificadas dentro de uma seleção. Use `BancoMestreAnaliseSelecaoV074.analyze` só para sugerir **uma** categoria e `planOneHighlight` para construir **um** registro por seleção inteira.
- A API pública em `assets/pdf_v074.js` não expõe `addTextHighlights`; chamadas do grifador usam exclusivamente `addTextHighlight`. Grifos antigos segmentados são preservados sem mescla ou reclassificação.
- Se houver categorias conflitantes ou texto sem pista suficiente, **não salvar automaticamente**: apresentar paleta e aguardar cor escolhida pelo usuário. Cor manual prevalece, inclusive sobre a sugestão.
- Uma seleção de várias linhas terá vários retângulos de posição, mas um único ID e uma única entrada na Biblioteca.
- Recolorir a mesma seleção deve atualizar o ID existente, não criar outro registro. Não excluir notas nem flashcards associados.
- `classification_status:confirmada` da escolha manual se aplica à cor, não à nota ou ao assunto sugerido. Não criar flashcards nem alterar SRS.
- Testes isolados e fixture de regressão `tests/v074_selecao_unica_cores.json`; teste real no navegador com PDF e reabertura permanece pendente.

## V075 — seis categorias de cores fixas
- `v075.html` é a versão atual. Backup do código `backup/v074-before-fixed-six-colors-v075-2026-11-10`; preservar V074 e anteriores.
- Cores fixas: `proibicao=#FF8F96` vermelho, `obrigacao=#86DCAA` verde, `prazo_numero=#FFEA70` amarelo, `excecao=#89C7FF` azul, `banca=#CCA7FF` roxo, `destaque=#FFB86B` laranja.
- **Laranja significa conteúdo importante escolhido pelo usuário**, não regra principal. Não destacar automaticamente frases comuns sem indício de categoria.
- Não oferecer seletor livre de novas cores nem alteração dos rótulos de categoria no grifador. Preservar as configurações e cores já gravadas nos históricos sem migrá-las.
- Conservar `regra`, `agente`, `condicao` e outras categorias legadas para leitura e edição dos grifos antigos; somente novos registros laranja levam `classification_kind:destaque`.
- Uma seleção = um registro + um ID + uma cor. Em conflito de categorias exigir cor manual; nota e assunto continuam sugestões sem confirmação automática.
- Scripts V075 carregam após o classificador V072: `assets/v075_seis_cores.js` -> `assets/v075_analise_selecao.js` -> `assets/v075_grifador.js`; motor `assets/pdf_v075.js`. Regressão `tests/v075_seis_cores_fixas.json`.
- Teste de visual e gravação real com PDF ainda pendente; não alegar validação completa.

## V076 — sincronização privada de flashcards
- Publicação de referência: `assets/version.json` com `version=V076` e `home=v076.html`. Verificar estado atual antes de futuras alterações. A versão V075 e o grifador de seis cores são preservados.
- Fonte privada: XLSX do Drive `1SA-PKBrlaovuNLFMPBx7BByH3BH0Tcsr`, aba `Cartoes_V015`. A página nova carrega cartões do Excel via OAuth somente após consentimento e enquanto token válido, verificando alterações a cada 120 segundos. Novas cópias de XLSX NÃO são capturadas automaticamente; preservar ID de arquivo ou atualizar configuração explicitamente.
- Sem token, usar dados estáticos V015; não anunciar atualização recente. O consentimento real ainda precisa ser testado no navegador da conta dona, inclusive configuração da origem no Google Cloud.
- O módulo de sincronização não escreve no Drive, no GitHub, no SRS nem no armazenamento local, não envia grifos e não migra respostas. Não tornar público o XLSX, credenciais, histórico privado ou tokens.
- Metodologia de todos os flashcards: estrutura-base de lei seca; versos literais apenas para texto normativo verificável; explicação, macete, fonte e exceções separados; não reescrever em massa cartões históricos; gatilho erro + Difícil e aprovação se aplica a novos cartões.

## DECISÃO DE BASE ÚNICA — 10/11/2026
- Não gerar V017/V018 ou planilha nova como destino operacional de cartões aprovados. O único arquivo mestre de flashcards é o XLSX do Google Drive ID `1SA-PKBrlaovuNLFMPBx7BByH3BH0Tcsr`, aba `Cartoes_V015`; o sincronizador do portal V076 depende deste ID fixo.
- Para cada cartão aprovado, auditar duplicatas e IDs, consultar o mestre atual, produzir atualização incremental com os demais registros preservados, validar conteúdo e SRS; guardar backup recuperável antes de substituir. Usar `mcp__Google_Drive__update_file` com `file_uri` **no mesmo fileId**, nunca `upload_file`/`import_spreadsheet` como nova fonte ativa. Confirmar ID e conteúdo após a operação.
- Se existir alteração concorrente ou faltar uma referência de arquivo válida para o `update_file`, não alegar sincronização; preservar o mestre e avisar a pendência. Checkpoints e backups são cópias históricas, não novas bases operacionais.
- O site lê essa planilha via autorização OAuth; consulta de 120 s somente com site aberto e token ativo. A gravação pelo ChatGPT na base mestre e a leitura pelo navegador são operações distintas, ambas devem ser verificadas separadamente.

## V077 — catálogo e sincronização autenticada de PDFs
- O manifesto V077 aponta `v077.html`; sempre verificar `gh-pages/assets/version.json` antes de editar. V076 e V075, grifos, PDF.js, SRS, cartões e IDs anteriores preservados.
- Fonte estática: `assets/pdf_catalog_v077.json` (72/72 PDFs). Índice de navegação por assunto: `assets/pdf_grupos_v077.json` (72/72 entradas); leitor: `assets/v077_pdfs_recolhidos.js`. Ambos os PDF originais CONAMA aparecem no índice, não apenas no catálogo.
- Novas fontes: NRs 01, 05, 06, 07, 17, 18 e Lei 15.190/2025, todos com arquivos intactos e metadados no Drive. Não confundir edição fornecida de uma NR com certificação de vigência em 2026.
- Módulo `assets/v077_drive_pdf_sync.js`: busca PDFs exclusivamente em `06 – PDFs e Materiais/Normas Regulamentadoras` e `/Licenciamento Ambiental` após autorização OAuth `drive.readonly`; verifica a cada 120 s enquanto aberto/token válido. Inclusões futuras em outras pastas exigem expandir a configuração ou atualizar catálogo por novo deploy. Não existe sincronização irrestrita de todo o Drive.
- Não subir arquivos privados à branch pública, somente IDs, títulos e metadados mínimos. O leitor original e os grifos locais não são reescritos; sem OAuth, catálogo estático de 72 documentos continua disponível para titulares com acesso ao Drive.
- Se novos PDFs forem aprovados e enviados ao Drive, preservar IDs existentes e deduplicar por file_id/nome. Atualização automática de novos PDFs em pastas monitoradas ocorre apenas na sessão Google autorizada; alterações no catálogo estático exigem revisão e deploy. Novos grupos precisam ser adicionados ao índice correspondente.
- Validação real do OAuth/visualização em navegador autenticado permanece pendente; não alegar sucesso definitivo de rede privada até testado.

## V084 — Imagens do Drive (Atlas autenticado)
- Página principal `v084.html`, manifesto V084, preservando V083 e todas as alterações do grifador/cores.
- Monitorar SOMENTE a pasta de imagens do projeto `07 – Atlas de Imagens (sincronização)`, Drive ID `1ksSVWrmRaRlDoG4iDtTGvfr2OnPnhnY6`; a inclusão de imagens nessa pasta deve ser feita pelo usuário. Pasta recém-criada inicialmente vazia. Outras pastas e subpastas não são monitoradas.
- Script `assets/v084_drive_images_sync.js` adiciona ao Atlas seção separada dos 270 registros anteriores. Google OAuth `drive.readonly` com token em memória, consulta a cada 120 s enquanto site aberto, exibição de JPEG/PNG/WEBP/GIF até 15 MB. Imagens privadas não são publicadas como arquivo no GitHub; miniaturas via download autorizado com blob URL temporária.
- IDs novos = `DRIVE-IMG-<fileId>`, sem criar `IMG-###`, sem modificar base F17, histórico de imagens, aprovação temática, SRS ou grifos legados. Grifos de novas imagens são locais com ID específico no editor. Não classificar automaticamente por conteúdo, sem auditoria.
- Consentimento OAuth real e abertura de imagem real ainda precisam de teste no navegador; não reportar esse teste como concluído.

## V086 — Exclusões privadas e reversíveis do Atlas
- Fonte privada JSON `BancoMestreExcluirImagensDriveV046` (184 IDs antigos IMG-###) no Drive ID `1PLYugdUTxtpDmoxOe56LtCG-a1cDKGej`. NÃO colocar o conteúdo da lista no repositório público. A solicitação refere-se a exclusões do acervo visual **no navegador**, nunca a exclusão de arquivos no Drive.
- 36 `drive_file_id` são apenas candidatos por nome, identidade não verificada; 148 registros não têm vínculo. Ignore esses campos ao aplicar exclusões. Todos 184 IDs foram confirmados no catálogo original de 254.
- `v086.html` carrega `assets/v086_exclusoes_atlas_privadas.js` após os scripts da V085. O usuário clica conectar Google e confirma a aplicação. Escrita atômica em `IndexedDB/BancoMestreImagensV023`, com backup prévio `BM086_EXCLUSOES_BACKUP_V1` e opção desfazer último lote; preservar alterações manuais posteriores. Sem acesso OAuth ou sem confirmação, os 184 estados não são aplicados automaticamente.
- Arquivos do Drive, imagens estáticas, 270 IDs legados, legendas, PDFs, grifos, cartões e SRS intactos. Evitar publicar chaves, tokens, títulos privados e lista de exclusões no GitHub.
- OAuth real e operação no navegador ainda não testadas; verificar importação e reversão com a conta do titular antes de considerar conclusão funcional completa.

## V088 — Visibilidade global das exclusões
- A solicitação de sincronizar as imagens já excluídas foi atendida como **snapshot global reversível** de 184 IDs IMG-###, sem excluir os arquivos Drive. O JSON original detalhado permanece privado (Drive `1PLYugdUTxtpDmoxOe56LtCG-a1cDKGej`).
- `assets/v087_atlas_visibilidade_global.js` carrega imediatamente após `visibilidade-v026.js` em `v088.html`, antes da construção do Atlas. O código público contém somente os 70 IDs legados ativos; 184 ausentes ficam ocultos por padrão via API `BancoMestreImagens.all()`. Os 16 Petrobras P10 permanecem inalterados; total 270 IDs preservados.
- Estados locais explícitos de restauração/ocultação têm prioridade; o comportamento padrão NÃO escreve no IndexedDB e não toca nos grifos. Não converter 36 links candidatos do Drive em operações de exclusão. Preservar a V087 e sua nova lógica de grifador.
- Novas exclusões feitas no navegador NÃO serão sincronizadas automaticamente para todos até atualizar a fonte pública novamente. Não afirmar sincronização bidirecional contínua; é apenas um retrato global da lista exportada.

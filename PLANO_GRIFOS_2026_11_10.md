# Banco Mestre — grifador e integração, decisões aprovadas (10/11/2026)

## Regras de trabalho
- Alinhamento encerrado a pedido do usuário após **21 decisões aprovadas**. Não considerar a pergunta 22 (importação), que não recebeu resposta.
- Implementar em etapas, com backup do estado anterior, preservando a V060 estática e seus dados. Nunca sobrescrever versões históricas.
- Branch oficial de publicação: `gh-pages`; V060 foi preservada como `backup/v060-before-text-selection-2026-11-10` a partir do commit `a4c6be8198f028b3ac5f35d0f8dcb70363d88f85`.
- O backup Git **não acessa dados privados localStorage/IndexedDB do navegador**. Tratar sua exportação como operação separada, iniciada pelo usuário. Nunca limpar nem migrar automaticamente dados.

## Decisões aprovadas
1. **A** — seleção de texto como modo padrão, com grifo livre como alternativa.
2. **B** — grifo automático após seleção e menu flutuante (cor, nota, vínculo com cartão, desfazer).
3. **B** — grifos no PDF e biblioteca pesquisável, retornando ao trecho.
4. **B** — armazenamento local e sincronização consentida com Google Drive; detectar conflitos.
5. **B** — vinculação com cartões existentes e propostas de novos, apenas após aprovação.
6. **B** — remapear grifos quando o documento mudar, com revisão e preservação de origem.
7. **B** — biblioteca completa com categorias, tags, cores, favoritos, busca e filtros.
8. **B** — extensão Chrome para grifar sites externos e enviar à biblioteca mediante permissão.
9. **B** — conector próprio com ChatGPT para leitura e propostas, sem mutação sem aprovação.
10. **B** — resumos evolutivos por assunto, atualizações aprovadas.
11. **B** — detecção de grifos duplicados/relacionados, sem apagamento ou mescla automática.
12. **B** — cores livres e categorias personalizáveis.
13. **B** — OCR sob demanda para documentos digitalizados, com conferência.
14. **B** — migração assistida dos grifos V060, sem modificar originais.
15. **B** — painel lateral retrátil/redimensionável de grifos durante a leitura.
16. **B** — anotações estruturadas opcionais por grifo (dúvidas, correção, explicação, macete, pegadinha, fonte).
17. **B** — ancoragem híbrida: texto + posição para seleção; coordenadas para grifo livre.
18. **B** — edição do grifo no PDF, mantendo identidade e histórico.
19. **A** — exclusão direta com desfazer imediato, sem lixeira permanente.
20. **B** — atalhos configuráveis sem conflitos com navegador.
21. **B** — exportação seletiva TXT, Markdown, JSON e PDF com metadados e IDs.

## V061 — Etapa 1 (implementada)
- Mantém V060 intacta e os registros `BM030_STROKES_PDF` existentes.
- Cria camada de seleção textual PDF.js, ativa por padrão no PDF editável com texto digital; modo grifo livre da V058 permanece.
- Salva o texto selecionado exatamente, retângulos normalizados, cor, opacidade, documento, hash, página, ID, nota e vínculos opcionais de IDs de cartão. Mesmo armazenamento local por página/hash, sem alteração de SRS.
- Aplica grifo automaticamente quando a seleção por arraste termina; menu flutuante permite cor, nota, IDs de flashcard e desfazer o grifo.
- Reutiliza desfazer/refazer, borracha e PDF anotado; extração V059 reconhece o novo registro, distinguindo seleção exata de geometria antiga.
- Não migra dados, não grava PDF de origem, não altera flashcards/IDs/SRS, não faz upload.
- PDFs escaneados sem camada textual permanecem com grifo livre; OCR é etapa futura.
- **Limite de validação:** sintaxe/integridade estática conferida; seleção e alinhamento da camada de texto ainda exigem teste manual com PDF real.

## Etapas futuras (não implementadas na V061)
Biblioteca de grifos, painel lateral, sincronização Drive, exportação ampla/backup local, OCR, migração V060, sugestões de flashcards/resumos, extensão, conector, gestão de duplicatas, atalhos e edição avançada. Não declarar nenhuma delas concluída antes de testada.

## V063 — Etapa 2, Biblioteca local de Grifos (publicada em 10/11/2026)
- Antes da integração, conferida V062 publicada com 65 PDFs (incluindo CONAMA 001 e 237 originais) e criada a branch `backup/v062-before-grifos-v063-2026-11-10`.
- A Biblioteca foi implementada como módulo de leitura de `BM030_STROKES_PDF`, incluindo grifos V061 e grifos visuais antigos sem migração.
- Busca e filtros: texto, PDF, disciplina, assunto, cor, tipo, favoritos; edição local de classificações e notas e vínculo ao documento para navegar à página.
- Exportação selecionável TXT, Markdown, JSON e relatório imprimível (Salvar como PDF). Backup JSON manual integral das chaves de marcação PDF no localStorage e seus metadados.
- Site: `v063.html` carrega a base estática `v062.html` preservada e acrescenta `assets/v062_biblioteca_grifos.js`, `assets/v062_biblioteca_grifos.css` e `assets/v063_grifos_navegacao.js`. Manifesto, entrada e versão documentada apontam para V063.
- Não há exclusão, migração automática, sincronização Drive ou alteração de flashcards, IDs e SRS.
- Limitações: backup não inclui PDFs, IndexedDB, flashcards nem SRS; grifos antigos ainda não têm correspondência de texto verificada; painel lateral no leitor PDF e integração Drive permanecem futuros.
- Validação feita: sintaxe das rotinas, integridade estrutural e apontadores de versão; teste sintético de carregamento dinâmico em Chromium. Não há confirmação de navegação/grifo com PDF real no navegador do estudante.
- A pergunta 22 sobre importação não foi aprovada; **não implementar importação automática** sem decisão expressa.

## V064 — painel lateral de grifos e imagens excluídas (10/11/2026)
- Nova versão `v064.html` lançada mantendo a V062 como base imutável e preservando a Biblioteca V063.
- Backup do código anterior: `backup/v063-before-image-filter-and-pdf-panel-2026-11-10`, origem `4fb2ab187684e85a50a5d4acfe2314a5408ef60f`. O backup GitHub não contém anotações privadas do navegador.
- **Correção de exclusões:** ler os status `hidden` de `BancoMestreImagens.all()` (legado/IndexedDB e Petrobras 10/localStorage), retirar miniaturas e botões IMG dos assuntos, recalcular contagens visíveis e retirar assuntos apenas visuais sem mídia disponível. Não apagar imagens; restaurar via Atlas.
- **Painel do leitor PDF:** lista marcas `text_highlight`, `highlighter` e `rect` por número de página; busca texto/nota/página, navegação ao trecho (fonte preservada por ID + hash), edição de notas e painel retrátil/redimensionável. O painel fica associado ao PDF editável atual, não à prévia de terceiros.
- Arquivos: `assets/v064_imagens_visibilidade.js`, `assets/v064_painel_grifos.js`, `assets/v064_painel_grifos.css`.
- **Não foi feito:** migração automática de grifos anteriores, reconhecimento OCR, sincronização com Drive, alteração dos flashcards, SRS ou documentos originais. A importação da pergunta 22 permanece sem aprovação.
- Verificado por inspeção de repositório e sintaxe JavaScript. Faltam testes de interação no navegador com PDFs e imagens ocultas reais.

## V065 — correção da prévia Cartão rápido
- Correção visual para a janela `#pdfQuickPanelV047` e cabeçalho `.bm-v047-card-header`: afastar do botão flutuante Fechar PDF, manter título e × internos acessíveis.
- CSS independente `assets/v065_cartao_rapido_header.css`. Backup de código `backup/v064-before-quick-card-header-fix-2026-11-10`. Sem alteração de dados e SRS.

## V066 — cópia segura de grifos no Google Drive (etapa progressiva)
- Backup local de grifos `BM030_STROKES_PDF:*` + `BM062_GRIFOS_META` em JSON, SHA-256 do arquivo, transferência local por botão manual.
- O usuário confirma que salvou o backup e explicitamente clica para autorizar um **novo** upload privado no Drive usando OAuth `drive.file`. Não utilizar tokens persistentes ou sobrescrever arquivo.
- Upload resumable com confirmação de tamanho e metadados; erro não implica reenvio automático (evitar duplicatas).
- **Não é sincronização bidirecional:** restauração, conflitos, mescla, vigência OCR e conector ChatGPT continuam futuros. Não inclui PDF, IndexedDB, flashcards ou SRS.
- Arquivos de código: `assets/v066_backup_drive_grifos.js`, `assets/v066_backup_drive_grifos.css` e `v066.html`.
- Backup anterior: `backup/v065-before-drive-grifos-2026-11-10`. Não houve acesso ou upload de dados particulares do usuário pelo assistente.
- Verificação estática realizada; operação OAuth/Drive requer ação e conferência no navegador do usuário.

## V067 — auditoria funcional em modo somente leitura (10/11/2026)
- Código V066 preservado em `backup/v066-before-diagnostics-2026-11-10`.
- Site `v067.html` integra `assets/v067_diagnostico_local.js` e CSS. Botões sob demanda em Biblioteca de Grifos e no leitor PDF.
- Relatórios com estados OK/problema/alerta/não testado: versão, catálogo 65 PDFs, grifos locais/IDs/âncoras, exclusões de imagens em assuntos carregados, tela de Cartão rápido, texto PDF e existência dos controles Drive.
- O diagnóstico não modifica registros, arquivos nem dados privados; não inclui texto dos grifos/IDs privados, não pede autorização Drive, não executa upload.
- Continua pendente teste no navegador com PDF real, exclusões, salvamento/recuperação e OAuth. Não ativar sincronização bidirecional ou migração V060 antes de validação.

## V068 — grifador de PDF avançado, visual inspirado na Bússola (10/11/2026)
- Publicação `v068.html`, preservando `v067.html` e `v062.html`. Backup de código `backup/v067-before-complete-highlighter-2026-11-10`.
- Grifo por seleção textual e cores semânticas: seis opções editáveis, cor personalizada, marcador rápido Alt+Q, painel Alt+W, atalhos configuráveis, menu flutuante com aparência compacta de estudo.
- Novos estilos de anotação: grifo opaco, sublinhado, sublinhado duplo suportado no motor, tachado e ocultação visual/mostrar. Grifo livre e desenho V060 preservados.
- Opções avançadas: ajustar trecho grifado por seleção mantendo ID; histórico incremental (máximo 20 versões locais recentes); impedir duplicação exata de trecho e coordenadas; exclusão direta com desfazer; copiar texto; cartões vinculados somente por ID.
- Notas estruturadas: nota, explicação, dúvida, correção, macete, pegadinha, fundamento normativo e fonte; disciplina, assunto, tags e favorito. Integração com Biblioteca e painel PDF para consulta/exportação.
- Armazenamento compatível com `BM030_STROKES_PDF` e metadados `BM062_GRIFOS_META`; grifos antigos não são regravados nem submetidos a OCR automático.
- **NÃO foram implementados**: OCR, remapeamento entre versões do PDF, extensão Chrome, sincronização bidirecional com Drive nem conector ChatGPT. Backup consentido V066 permanece.
- Arquivos novos: `assets/pdf_v068.js`, `assets/v068_grifador.js`, `assets/v068_grifador.css`, `assets/v068_biblioteca_grifos.js`, `assets/v068_painel_grifos.js`.
- Verificação de sintaxe dos arquivos, integração do loader, testes isolados de alterações de registros e desenho dos estilos. Teste com PDF real no navegador e acesso real Drive pendentes.

## V069 — estabilização e auditoria de regressão (10/11/2026)
- Backup de código V068: `backup/v068-before-highlighter-stability-v069-2026-11-10`.
- Novos scripts `assets/pdf_v069.js`, `assets/v069_grifador.js`, `assets/v069_biblioteca_grifos.js`, `assets/v069_painel_grifos.js`. HTML `v069.html`; a base V062 com 65 PDFs permanece preservada.
- Corrigida a janela de tempo em que a camada de texto podia ser usada antes do término da pintura da página.
- Inclusão de evento após persistência das anotações locais para sincronizar a vista da Biblioteca e do painel.
- Desfazer após excluir foi condicionado a contexto estável, sem novas edições; âncora textual de seleção reversa ajustada; sublinhado duplo ganhou comando; mudança de estilo preserva a cor.
- Testes estáticos e unitários isolados; teste end-to-end no navegador, importação, OCR, reancoragem de versões e sincronização bidirecional com Drive continuam pendentes.

## V070 — sugestão de cores, assunto e nota por sequência/palavra
- Preservado `backup/v069-before-semantic-colors-2026-11-10`.
- Base V070 aplica padrão oficial de quatro cores por trecho, sem recolorir dados antigos.
- Classificador em JavaScript local identifica palavras-gatilho (ex.: `salvo`, `autoridade`, `desde que`, `no prazo`) e agrupa sequências por categoria; segmentos podem ser corrigidos manualmente. Ambiguidades permanecem propostas.
- Identificação de disciplina/assunto/subassunto baseada em palavras-chave e título do PDF; nota curta sugerida por categoria com trecho-fonte, sem afirmar interpretação legal validada.
- O usuário seleciona pessoalmente o texto para gerar os grifos. A classificação e a nota são propostas até confirmação explícita, sem novo flashcard nem mudança do SRS.
- `addTextHighlights` salva vários registros independentes em uma operação atômica, mantendo undo único, posição, ID e rastreabilidade.
- Scripts `assets/pdf_v070.js`, `assets/v070_classificador.js`, `assets/v070_grifador.js`, `assets/v070_biblioteca_grifos.js`, `assets/v070_painel_grifos.js`, `assets/v070_cores_metodologia.css`. HTML `v070.html`.
- Testado estaticamente e por simulação de duplicata/falha de armazenamento. Revisão manual em PDF real e avaliação de acurácia por temas ainda pendentes.

## V071 — atualização das cores a pedido do usuário (10/11/2026)
- Seis cores atualizadas: vermelho (proibição), verde (dever), amarelo (prazo/número), azul (exceção), roxo (palavra absoluta/pegadinha de banca), laranja (regra principal).
- Evitar confusão: "é vedado" e "não poderá" vermelhos; "deverá" e "compete" verdes; "em até 30 dias" amarelo; "salvo" azul; "exclusivamente" e "jamais" roxo; regras gerais laranja.
- Criados `assets/v071_classificador.js`, `assets/v071_grifador.js`, `assets/pdf_v071.js`, `assets/v071_cores.css`, integrados em `v071.html`.
- Backup do código V070: `backup/v070-before-six-colors-2026-11-10`. Grifos existentes e SRS não são alterados/recoloridos.
- Mantém a segmentação em trechos atômicos, a revisão manual de notas e assuntos e os demais recursos das versões anteriores. O classificador não produz interpretação normativa garantida.
- Testes estáticos e do classificador concluídos; teste visual em navegador real pendente.

## V072 — contexto de artigo, parágrafo, inciso, prazo e exceção
- Backup anterior: `backup/v071-before-contextual-legal-highlights-v072-2026-11-10`.
- Classificador por regras locais `assets/v072_contexto_normativo.js`, com reconhecimento da estrutura normativa: `Art.`, `§`, parágrafo único, inciso, alínea, Lei, Decreto, NBR e NR.
- Um mesmo amarelo recebe **notas diferentes**: prazo / termo inicial quando há unidade temporal; conferência do dispositivo integral e edição vigente em referência normativa.
- Regra contextual para finalizar cor automática na vírgula/fecho de oração. Preserva segmentação e decisão manual em trechos de interpretação ambígua.
- Núcleo `assets/pdf_v072.js` registra motivo e confiança nos novos grifos; Biblioteca e painel V072 mostram e exportam a justificativa.
- Testes `tests/v072_classificacao_contextual.json` com 33 verificações isoladas e frase de cinco segmentos; sintaxe e loader verificados. Teste manual com PDF real ainda pendente.
- Preservados histórico, IDs, 65 PDFs, SRS, imagens excluídas e as versões V071 anteriores. Nenhuma sincronização remota nem migração automática.

## V073 — recuperação e estabilidade do leitor PDF (10/11/2026)
- Backup de código `backup/v072-before-selection-stability-v073-2026-11-10`.
- Seleção e zoom: invalidar texto antigo ao iniciar a pintura; medir camada de texto PDF.js dentro do DOM e não capturar cliques até concluir.
- Histórico: operação de criar (simples/lote), editar, excluir, desfazer e refazer tem rollback de pilhas e estado em caso de falha de gravação; preservação de IDs e grifos originais.
- Novo botão somente leitura **Verificar grifos**, mostra alinhamento, grifos multilinha, validade de âncoras e armazenamento local.
- Código `assets/pdf_v073.js`, `assets/v073_grifador.js`, `assets/v073_teste_grifador.js`, CSS e `v073.html`.
- Testes isolados com falhas simuladas passaram; não foi possível testar seleção e aparência com PDF real no navegador do estudante. Prosseguir com validação prática antes de OCR ou sincronização bidirecional.

## V074 — grifos unificados (uma cor por seleção)
- Em pedido explícito do usuário, a V074 substitui a divisão de uma seleção em várias marcações por um único registro com cor única, um ID e a seleção integral, inclusive multilinha.
- Classificador V072 continua reconhecendo termos internamente, mas o novo `assets/v074_analise_selecao.js` usa isso apenas para avaliar se a categoria é unívoca. Se obrigação + prazo etc. coexistirem, nenhuma cor automática é aplicada até confirmação manual.
- Nova interface `assets/v074_grifador.js` usa somente `addTextHighlight` e mantém cor manual prioritária; selecionar novamente o mesmo trecho para trocar a cor atualiza o ID existente, com notas preservadas.
- Núcleo `assets/pdf_v074.js` preserva leitura de dados antigos e não expõe criação em lote no objeto público. CSS `assets/v074_grifo_unico.css` mostra aviso de ambiguidade no menu.
- Testes de regressão `tests/v074_selecao_unica_cores.json` e simulações de frase mista, seleção multilinha e cor manual. Grifos históricos segmentados NÃO são mesclados ou recoloridos.
- Backup de código anterior: `backup/v073-before-unified-highlights-v074-2026-11-10`; teste visual e de persistência real ainda pendente.

## V075 — seis cores fixas por solicitação do usuário
- Paleta definitiva: vermelho=proibições, verde=obrigações, amarelo=prazos/números, azul=exceções, roxo=palavras-chave da banca, laranja=conteúdo importante a destacar.
- Laranja exige escolha humana; frase sem pista semântica não deve receber cor automaticamente. As outras categorias podem ser sugeridas quando a detecção é unívoca.
- Removidos do novo grifador o seletor livre e a alteração de nomes das cores. Os valores guardados previamente não são apagados.
- Mantida a V074: texto de uma ou várias linhas continua uma marcação com um ID e uma cor; conflito entre categorias exige escolha manual.
- Histórico já salvo com regra principal/cores antigas é mantido sem migração, conversão ou recoloração.
- Arquivos `assets/pdf_v075.js`, `assets/v075_seis_cores.js`, `assets/v075_analise_selecao.js`, `assets/v075_grifador.js`, `assets/v075_paleta_fixa.css`, HTML `v075.html`, regressão `tests/v075_seis_cores_fixas.json`.
- Backup de código `backup/v074-before-fixed-six-colors-v075-2026-11-10`; testes de classificação e integração estática realizados. Teste em PDF real pendente.


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


## V082 — testes com Vade Mecum real e correção de falsos grifos (10/11/2026)

- Auditoria com duas versões reais do **Vade Mecum Senado Federal 3ª edição** (809 páginas cada). Texto digital de ambas as versões coincide nas 809 páginas. PDFs originais privados no Google Drive, não migrados e sem qualquer escrita/alteração.
- Páginas verificadas: **17** (CF art. 19), **126** (CC art. 315), **137** (CC art. 584), **643** (ECA art. 185), **728** (Lei 14.133 art. 25) e **768** (LRF art. 38). Reconhecimento com os trechos extraídos do PDF: seis casos avaliados e aprovados após correção.
- Falha real 1: o planejador multicolorido V081 unia dois segmentos da mesma cor separados por muitas palavras sem categoria, criando grifo amarelo excessivo. `assets/v082_multicor.js` só une os segmentos quando existe **apenas espaço em branco** entre eles e a expressão anterior não termina em pontuação forte.
- Falha real 2: `Selection.toString()` insere quebra de linha virtual de elementos `<br>` em PDF.js; o `Range.toString()` não a inclui. `assets/v082_grifador.js` mapeia as palavras aos caracteres DOM mesmo nessa condição e **não salva automaticamente** se o alinhamento não é seguro.
- Falha real 3: o classificador não identificava `não será autorizada` como proibição. `assets/v082_contexto_normativo.js` acrescenta variantes de autorização e mantém as demais expressões normativas.
- Motor atômico de grifos `assets/pdf_v081.js`, seis cores fixas, laranja manual, 72 PDFs no catálogo, flashcards, SRS e Drive preservados.
- Backup anterior: `backup/v081-before-vade-test-fixes-v082-2026-11-10`. V081 também permanece disponível. **Pendente:** homologação do PDF real pelo leitor V082 em navegador Chrome/Android com conta do titular.

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

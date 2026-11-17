# Banco Mestre V217 — Cartões no GitHub; imagens e PDFs no Google Drive

Data: 17/11/2026 · Mantém V1. Firebase e V2 não são utilizados.

## Decisão aprovada
O site e os cartões (frente, verso, conteúdo, 11 camadas de explicação e índice editorial) ficam no GitHub Pages. A autorização para que esses cartões sejam públicos foi expressamente concedida pelo usuário. **Imagens e PDFs originais ficam no Google Drive**. O histórico pessoal de estudo, notas e SRS deve continuar privado; nenhuma migração nem escrita desse histórico foi autorizada nesta atualização.

**Fluxo de rotina:** publicar no GitHub somente quando o programa/site ou os cartões forem alterados; adicionar imagem ou PDF somente ao Google Drive, nas pastas já monitoradas. O site pesquisa o Drive ao conectar e pode atualizar enquanto a página permanecer aberta, sem novo commit GitHub para novas mídias.

## Implementação de exibição (V217)
- Galeria Drive `assets/v217_drive_gallery_feed.js`: lista arquivos nas duas raízes monitoradas e suas subpastas, busca miniaturas via Google Drive API com token em memória, sem depender da publicação do catálogo estático V180. Se o Drive não responder, mostra erro: não substitui silenciosamente por cópias antigas.
- Visualizador `assets/v217_single_image_viewer.js`: fonte fixa Drive; sem botão de alternância para catálogo público. Arquivos históricos do GitHub não aparecem como alternativa visual.
- Política `assets/v217_media_policy.js`: mantém apenas metadados/associações históricas para funcionalidades da V1, mas impede que o renderizador original monte miniaturas do catálogo público.
- PDFs `assets/v217_drive_pdf_sync.js`: após consulta autenticada, exibe somente PDFs confirmados nas quatro raízes monitoradas; conserva IDs históricos quando o arquivo ainda existe. A lista antiga não fica visível antes da consulta. Não exclui nem move documentos.
- Contadores `assets/v217_library_counter.js`: mostram as imagens reais encontradas, não uma soma de arquivos publicados anteriormente.
- O portal continua carregando os cartões públicos V194 e o cartão operacional TRT01-C003 acrescentado na V215, com suas mesmas respostas, estilo e ações.
- O login Google Drive V216 é reutilizado para imagens e PDFs: uma autorização por visita, nova conexão se a autorização expirar.

## Limites e ressalvas
- As antigas cópias de imagens/PDFs **ainda existem fisicamente no histórico e em arquivos legados públicos do GitHub**. Elas não devem ser usadas como fonte na biblioteca V217, mas a remoção definitiva exige auditoria e prova de paridade para evitar perda de conteúdo. Esta versão **não garante que os bytes legados foram despublicados**.
- Algumas imagens históricas não têm `driveFileId` ou relações editoriais inequívocas. O atlas direto encontra originais, mas filtros temáticos e associações automáticas desses casos continuam incompletos; não inferir vínculos apenas pelo nome da pasta.
- A consulta do Drive abrange **somente** as pastas configuradas e subpastas. Novos arquivos fora delas não são descobertos.
- O Google Drive precisa estar conectado na visita. Não há backend, Firebase nem serviço que trabalhe com o site fechado.
- As gravações SRS, grifos pessoais e anotações **não foram migradas**. Devem ser preservadas localmente e conferidas antes de qualquer mecanismo novo de sincronização.
- As verificações automatizadas validam sintaxe e integração estática, não simulam consentimento OAuth, dezenas de arquivos reais ou todos os fluxos de edição. O teste no navegador com a conta do proprietário ainda é necessário antes de remover arquivos legados.
- Alterar *cartões* continua exigindo atualizar o GitHub; alterar/adicionar uma *imagem ou PDF* não exige subir mídia ao GitHub.

## Auditoria de regressão
V216 preservada em `v216.html`. Testes `tests/v217_hybrid_drive_media.cjs` + workflow `validar-v217-hibrido.yml`.

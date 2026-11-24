# V371 — sincronização incremental de bibliotecas
- Consulta inicial: verificar raízes e capturar startPageToken antes de percorrer pastas.
- Consultas seguintes da mesma sessão: paginar changes.list, invalidar listagens da origem/destino dos arquivos alterados e reconstruir a biblioteca com as listagens restantes.
- Inclusão, modificação, exclusão e movimentação de arquivo são tratadas; alteração de pasta, perda de acesso desconhecida, feed inválido ou indisponível exigem varredura integral. Drives compartilhados permanecem em modo integral.
- Após 10 minutos desde a varredura completa, a próxima consulta faz nova varredura. Não cria timer novo. Cursor e cache são exclusivamente em memória.
- Contadores distinguem pastas consultadas na rede e reaproveitadas. Falha de consulta não confirma resultado parcial.
- Nenhuma nova autorização ou escrita Drive; nenhuma alteração em cartões, SRS, PDFs, originais, catálogo público ou critérios editoriais.
- Referência: https://developers.google.com/workspace/drive/api/guides/manage-changes
- Testes simulados e publicação dependem de CI; desempenho e OAuth real ainda não homologados.

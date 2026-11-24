# Sincronização incremental de leitores privados — candidato V1

O portal consulta um manifesto nativo Google Docs chamado `BANCO_MESTRE_MANIFESTO_LEITORES_PRIVADOS_V1` por nome exato, MIME e proprietário da conta Drive autorizada. O conteúdo é JSON exportado como texto. O manifesto possui `schema: 1`, `active` e `studies`; cada entrada possui `key`, `session`, `version`, `fileId`, `filename`, `size` em bytes e `counts` (`items`, `reviewed`, `proposals`, `media`, `agenda`). Identificadores e conteúdo privados não devem ser publicados no GitHub.

Fluxo: salvar e verificar novo leitor no Drive; atualizar apenas a entrada correspondente no manifesto, preservando as outras; apontar `active` para a sessão vigente. O leitor valida propriedade, nome, tamanho, tipo, estrutura, contagens, chaves únicas e onze critérios, mantendo iframe isolado e CSP. Nenhuma dessas verificações comprova qualidade pedagógica, revisão formal ou integração ao SRS oficial. Não alterar registros históricos ou IDs em conflito. O manifesto somente deve apontar para material autorizado segundo a metodologia e seu estado editorial.

Validação pré-implantação: `node --test tests/private_study_manifest.test.cjs`; executar o portão didático vigente se aplicável, verificar paridade com outras entradas HTML realmente usadas pelo portal, testar abertura do arquivo real com login Google, troca de sessão, logout e ausência de manifesto. Não fundir com gh-pages até essas verificações. A arquitetura atual é por conta OAuth do Drive, não por usuário do site; isolamento de múltiplos usuários sob uma única conta Drive depende de implementação separada.

Após implantação verificada, atualizações de estudos compatíveis com o esquema não precisam de novo commit HTML. A integração ao catálogo único e ao calendário foi implementada na candidata; a implantação depende da homologação autenticada.

## Checkpoint incremental — 2026-11-24 (base V352)

- Produção V352 incorporada sem substituir o catálogo, vínculos recíprocos, scripts de mídia ou prévia multiusuário. Merge `d9b9aba430dd475b1fef18b5c2c7872cb631986f`.
- Agenda privada carregada automaticamente na autorização Drive, por sessão, com verificação da fonte e da identidade do cartão. Fechar o leitor não remove a agenda; logout/troca de conta e pagehide limpam os dados. Atualizar Drive recarrega o manifesto e revoga autorizações removidas. Sessões com conflito de validação ficam isoladas. Nenhum evento privado é publicado no GitHub.
- Commit funcional `a3f56858cede7ef426c1a35801cda5775f61d89e`. 12/12 verificações de conciliação e 11/11 de manifesto executadas com harness JavaScript; sintaxe do bridge e calendário validada. Cache dos três scripts alterados invalidado na entrada candidata. Não equivale a teste em navegador nem execução oficial do Node.
- Pendências: conciliar identidades conflitantes por fonte e conceito, sem criar novos IDs por presunção; conferir os eventos autorizados no calendário com OAuth real, testar fechamento do leitor, troca de sessão, desconexão e ausência do manifesto. Verificar política SRS vigente e gate didático quando houver alteração de cartões. Só depois promover a candidata para produção, com verificação de novos commits concorrentes.

### Complemento de retomada — V353

A produção recebeu complementos didáticos V353 após o checkpoint V352. A candidata incorpora essa atualização (commit de produção `ebb6c172ce826b98e6cb7f9638eaf3af23a8464a`) preservando todos os sete arquivos da integração e os testes já verificados; nenhuma nova aprovação privada foi inferida. Conferir apenas incrementos concorrentes posteriores e executar homologação OAuth antes de publicação.

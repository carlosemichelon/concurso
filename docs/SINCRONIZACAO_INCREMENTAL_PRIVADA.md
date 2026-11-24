# Sincronização incremental de leitores privados — candidato V1

O portal consulta um manifesto nativo Google Docs chamado `BANCO_MESTRE_MANIFESTO_LEITORES_PRIVADOS_V1` por nome exato, MIME e proprietário da conta Drive autorizada. O conteúdo é JSON exportado como texto. O manifesto possui `schema: 1`, `active` e `studies`; cada entrada possui `key`, `session`, `version`, `fileId`, `filename`, `size` em bytes e `counts` (`items`, `reviewed`, `proposals`, `media`, `agenda`). Identificadores e conteúdo privados não devem ser publicados no GitHub.

Fluxo: salvar e verificar novo leitor no Drive; atualizar apenas a entrada correspondente no manifesto, preservando as outras; apontar `active` para a sessão vigente. O leitor valida propriedade, nome, tamanho, tipo, estrutura, contagens, chaves únicas e onze critérios, mantendo iframe isolado e CSP. Nenhuma dessas verificações comprova qualidade pedagógica, revisão formal ou integração ao SRS oficial. Não alterar registros históricos ou IDs em conflito. O manifesto somente deve apontar para material autorizado segundo a metodologia e seu estado editorial.

Validação pré-implantação: `node --test tests/private_study_manifest.test.cjs`; executar o portão didático vigente se aplicável, verificar paridade com outras entradas HTML realmente usadas pelo portal, testar abertura do arquivo real com login Google, troca de sessão, logout e ausência de manifesto. Não fundir com gh-pages até essas verificações. A arquitetura atual é por conta OAuth do Drive, não por usuário do site; isolamento de múltiplos usuários sob uma única conta Drive depende de implementação separada.

Após implantação verificada, atualizações de estudos compatíveis com o esquema não precisam de novo commit HTML. O candidato integra a leitura do catálogo único e a projeção de agendamentos autorizados no calendário, sem criar avaliações formais. A integração efetiva no portal publicado ainda depende da homologação.


## Checkpoint técnico — 24/11/2026
- Candidato recomposto sobre o commit V351 e830eeba044ddab17d5f93c3d39d19a22ed93c61; preservados os vínculos V350 e o módulo de mídias V351. Ramificação anterior preservada como referência.
- Política prospectiva SRS-2026-11-23: Difícil 8, Bom 16, Fácil 24, Conhecimento preservado 32, Conhecimento adquirido 64. Não há promoção automática; aquisição formal explícita exige prova de duas avaliações Fácil. Eventos e datas legados permanecem legíveis.
- O manifesto privado pode conter approvedAgenda por sessão: somente eventos com identidade exata, origem verificável e intervalo de 8/16 dias. Conflitos, propostas, avaliações e dados pessoais não são publicados neste repositório.
- Regressões executadas sobre os arquivos desta ramificação em ambiente JavaScript isolado: 11 manifesto, 10 conciliação, 10 política SRS; 31/31 aprovadas. Para repetir em Node: `node --test tests/private_study_manifest.test.cjs tests/private_increment_reconcile.test.cjs tests/srs_policy_20261123.test.cjs`. Isso não substitui homologação real OAuth, renderização e sincronização no navegador.
- Próximo passo: comparar apenas divergências de identidade com versões e conceitos, sem renumerar por coincidência; manter propostas pendentes e mídia não homologada. Antes de publicar, reconciliar novamente com a ponta de gh-pages, verificar as entradas HTML efetivamente utilizadas, testar login, abertura do manifesto real, calendário, logout e ausência de duplicatas. Não promover sem evidências. O checkpoint privado e as aprovações permanecem no Drive.

## Candidato sobre V352 — 24/11/2026
Recomposto a partir da publicação V352, preservando seus vínculos e mídias e a base de produção. Homologação OAuth real e validação editorial ainda pendentes. Não publicar antes do teste de regressão e da conferência do manifesto privado.

## Candidato V354 sobre V353 — 24/11/2026
A V353 acrescenta 16 complementos contextuais em dez cartões; preservados seus arquivos e snapshot. A candidata V354 tem index e snapshot idênticos, com metadados de versão coerentes. Portão editorial, registro de mídia, orçamento CSS legado e homologação OAuth permanecem bloqueantes; não publicar. O catálogo de mídias não deve ser preenchido por coincidência de nome ou ID. O portão didático não deve receber aprovações automáticas sem evidência.

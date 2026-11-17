# V205 — Atlas incorpora imagens novas do Drive na sessão autenticada
Data: 17/11/2026 · Branch: `gh-pages` · Rollback: `v204.html`.

## Por que não apareciam no Atlas
O motor público `v180_image_bridge.js` acrescenta exatamente 93 registros já curados às 86 imagens históricas (total 179). Seu contrato não aceita registros adicionais não auditados. O módulo privado `v202_drive_images_paths.js` varria duas pastas do Google Drive depois de OAuth, mas apresentava os arquivos em uma grade separada (seção `bm084-sync`), sem ingressar na navegação do Atlas, nem atualizar o catálogo GitHub.

**Upload no Drive não equivale à publicação no site.** Essa separação preserva a privacidade, mas não correspondia à expectativa de consulta integrada do usuário.

## Integração V205
- O módulo `assets/v205_drive_atlas_integration.js` monta um novo grupo **Google Drive · imagens novas no Atlas** dentro do `bm153Directory` da aba Imagens, junto à navegação do Atlas. Não há uma galeria paralela fora da biblioteca.
- A conexão Google continua sendo de **leitura OAuth**. Após autenticar, o grupo exibe suas imagens novas no próprio Atlas, inclusive botão **Editar imagem** (tipo/vínculos locais), miniatura, **Mostrar cartão** quando o ID já tiver sido associado no navegador e botão **Abrir e grifar** para formatos compatíveis.
- O leitor percorre recursivamente duas árvores permitidas pelo contrato `assets/v202_storage_contract.json`: a pasta oficial de novos originais `1ksSVWrmRaRlDoG4iDtTGvfr2OnPnhnY6` e a pasta histórica de recuperação `1pp1CL9oMYVFHPPzv117DZpy1kA-wyJQo` (somente leitura).
- **Eliminação de duplicatas por `driveFileId`**: importa IDs do catálogo público V180 (93 arquivos; todos com ID único confirmado), acrescenta IDs Drive explícitos das demais imagens do Atlas carregadas e mostra no grupo privado só os arquivos ainda não contemplados. O grupo indica separadamente quantos já estão na biblioteca pública e quantos são novos na sessão.
- Suporta miniatura de arquivos JPEG, PNG, WebP, GIF e SVG usando dados autenticados. O SVG abre o original no Drive (não é enviado ao editor de grifos, que não oferece esse formato).
- A pesquisa geral da aba Imagens também filtra os itens novos do Drive; a busca interna do grupo continua disponível. Cada mídia conserva seu ID Drive e seu caminho original. A lista é atualizada pelo botão Atualizar imagens e pela varredura periódica enquanto o token estiver válido.
- O grupo abre automaticamente na primeira sincronização que encontrar itens novos, sem forçar reabertura quando o usuário fechá-lo.

## Fronteira de segurança e de publicação
- **179 imagens públicas continuam estáticas**, sem reescrever os catálogos V180/V198 ou inserir imagens privadas no repositório aberto.
- **N mídias novas do Drive integram somente a sessão autenticada**. Não há acesso antes de conceder a autorização Google; sessão expirada pode exigir reconexão e uma nova varredura.
- Não há atualização automática da base pública de cartões (V194), do SRS, dos PDFs nem da classificação editorial oficial; edições manuais continuam locais e exportáveis para checkpoint.
- Publicar uma imagem de modo permanente e anônimo no GitHub Pages exige **aprovação editorial**, atualização de catálogo/recursos e verificação do deploy; não pode ser inferida do mero fato de o arquivo estar em uma pasta do Drive.
- Mantidos os destinos únicos: novas imagens em `1ksSVWrmRaRlDoG4iDtTGvfr2OnPnhnY6` e novos ZIP/manifestos em `1348cILBcxFG9p2cfPJ3WubmHswPRbD24`.

## Verificações 17/11/2026
1. Leitura direta do código V204 identificou a grade separada e o limite fixo de 179.
2. Montagem sintética de `v205.html` com a base `v062.html`: 86 scripts e 75 estilos, sem caminhos faltantes ou nomes repetidos.
3. `assets/v205_drive_atlas_integration.js`: sintaxe JavaScript válida.
4. Teste determinístico simulado da varredura: duas árvores, cinco arquivos de entrada (incluindo duplicatas entre pastas), **3 imagens privadas novas**, **2 já catalogadas** e **1 SVG**; os três resultados novos retornaram IDs únicos.
5. Validado o contrato de folder_id existente sem trocar destinos.

**Pendente:** OAuth real, renderização visual do grupo e das miniaturas em navegador, publicação GitHub Pages efetiva e acessibilidade dos SVG em cada conta. Não chamar esses passos de homologados antes do teste.

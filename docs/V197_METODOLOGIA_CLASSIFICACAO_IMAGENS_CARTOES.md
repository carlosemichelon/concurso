# PMS-1 — Adendo V197: imagens de conteúdo × imagens de cartão
**Data:** 17/11/2026. **Status:** tipologia aprovada pelo estudante; implementação de interface com validação estática. **Módulo:** Atlas/Banco Mestre. **Não substitui** a metodologia-mestre nem os arquivos de checkpoints anteriores.

## 1. Regra principal (aprovada)
A classificação editorial de uma imagem tem dois tipos:
- **Imagem de conteúdo:** guia, prancha A4, corte, esquema, tabela, visualização ou conteúdo técnico destinado à compreensão e ao estudo. Pode possuir ligações opcionais com vários cartões.
- **Imagem de cartão:** imagem original do enunciado, figura utilizada na questão **ou** imagem explicativa, resolução e outro elemento visual incorporado a um cartão de estudo. Pode servir a um ou vários cartões.
- **Pendente de classificação:** estado transitório, quando ainda não há confirmação suficiente. **Não é um terceiro tipo** nem pode ser presumido como imagem de conteúdo.

Classificação temática por área/assunto/subassunto não deve ser confundida com a editorial. O status técnico (correto, reprovado, revisão pendente) é independente; classificar como imagem de cartão **não valida** fórmula, norma nem gabarito.

## 2. Relações e rastreabilidade
- Guardar por ID estável da imagem: \`IMG-...\` no Atlas ou \`DRIVE-IMG-<fileId>\` para itens sincronizados do Drive.
- Guardar zero ou mais IDs de cartões, sem criar IDs nem atribuir por similaridade textual. Podem existir vários registros de mídia para o mesmo cartão e vários cartões vinculados à mesma imagem (N:N).
- Na imagem de cartão, subtipo opcional: \`enunciado\`, \`figura\`, \`explicacao\`. A segunda opção aprovada inclui os três.
- Referências históricas que não correspondam a um ID navegável são preservadas para auditoria, mas não ganham link falso.
- Origem/proveniência da associação deve ser explícita: documentado no catálogo ou classificado manualmente. Separar vínculo **documental** de mera coincidência de tema.
- Preservar fontes originais, arquivos, hashes confirmados, auditorias, alertas, visibilidade, favoritos, grifos, textos, versões, histórico e eventos SRS.

## 3. Portal V197
- A aba **Imagens** permite filtrar por: Todas / Conteúdo / Cartão / A classificar, mantendo os filtros por assunto e visibilidade.
- Em cada cartão de imagem, selecionar tipo, subtipo e IDs; salvar no **navegador atual**, com efeito imediato nos filtros.
- Para vínculos com cartão público válido, o botão **Abrir CARD-...** abre a janela do leitor de flashcards, após carregar a base. Se o destino não existir, registrar erro e manter o vínculo para conferência.
- É possível retirar uma classificação manual escolhendo **Pendente**, retornando à classificação de origem; links históricos documentados não são apagados.
- As imagens privadas recém-sincronizadas do Google Drive recebem o mesmo editor, usando o ID do arquivo do Drive. O filtro também incide sobre sua grade.

## 4. Checkpoint, sincronização e restauração
- Chave de armazenamento do navegador: \`BM197_IMAGENS_TIPO_VINCULOS_V1\`; registros JSON \`{type,subtype,cardIds,updatedAt}\` por ID. Não contém bytes das imagens nem dados pessoais dos cartões.
- **Exportar para checkpoint** cria arquivo JSON versionado \`BancoMestreMediaCardLinksV1\` com classificações e vínculos **manuais**; evidências documentais de origem permanecem no catálogo versionado do Atlas.
- Anexar o JSON ao pacote do checkpoint, junto do inventário dos arquivos de imagem, identificadores, hash SHA-256 **somente quando verificado**, fonte do original, ID(s) do(s) cartão(ões) e estado de classificação. Registro de importação deve indicar data e origem.
- **Importar classificação (JSON)** mescla por ID após validar esquema, tamanho, formato e duplicatas. Conflitos exigem confirmação explícita. Não cria/apaga cartões nem regrava SRS.
- **Sincronizar imagens do Drive** permanece consulta **somente leitura**. A sincronização de imagens **não** envia automaticamente os vínculos locais nem substitui o JSON do checkpoint. Em outro navegador/dispositivo, importar o JSON depois de sincronizar as imagens.
- Exemplo de ciclo: classificar e vincular -> exportar JSON -> anexar ao checkpoint -> sincronizar acervo de imagem -> importar JSON no novo navegador -> conferir 3–5 IDs e links de cartão -> registrar conclusão.
- Não afirmar que checkpoint/Drive/GitHub estão integrados até confronto de contagens, IDs e validação do titular.

## 5. Dados anteriores e status de migração
O catálogo V180 lista **179 imagens** no Atlas (86 históricas + 93 recuperadas); a publicação V196 usa esse acervo. O arquivo \`v180_native_image_additions.json\` documenta cinco imagens recuperadas com campo \`cards\` explícito:
- \`IMG-C12-025\` -> \`CARD-1504\`
- \`IMG-C12-026\` -> \`CARD-1504\`
- \`IMG-C12-029\` -> \`CARD-1416\`
- \`IMG-C12-030\` -> \`CARD-1509\`, \`CARD-1518\`
- \`IMG-C14-013\` -> referência histórica \`PETRO14-C017\`, **ainda não navegável** como cartão público.

A interface apresenta associações documentadas quando o campo \`cards\` existe. Outras imagens **não** são declaradas como conteúdo, cartão ou associadas sem evidência; começam pendentes, salvo alteração manual. Nenhum conjunto canônico de imagens foi reclassificado silenciosamente.

## 6. Testes e limites
- Analisar sintaxe dos módulos e anchors do wrapper, contagem do catálogo e links documentados antes de publicar.
- Testar no navegador titular: filtros temáticos cruzados com tipo, álbum oculto/restaurado, vínculo para cartão existente, cartão ausente, importação, exportação, imagens Drive, celular e persistência depois de atualizar.
- O GitHub não armazena automaticamente o localStorage do usuário. Sem OAuth de gravação explícito, não alegar que o JSON foi sincronizado com Drive.
- Rollback sem perda: abrir a versão anterior \`v196.html\`; os metadados particulares V197 permanecem na chave isolada de armazenamento do navegador.

**Regra de aprovação:** qualquer migração em massa, criação de cartão ou ligação baseada em similaridade requer auditoria e autorização adicional do estudante.

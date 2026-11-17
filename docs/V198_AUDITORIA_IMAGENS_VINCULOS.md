# Banco Mestre — V198: auditoria editorial e associação imagem ↔ cartão
Data: 17/11/2026. Escopo: **179 registros do Atlas V180**. Versões anteriores preservadas (V197/V196).

## Resultado aplicado ao catálogo público
| Indicador | Quantidade |
|---|---:|
| Imagens avaliadas/classificadas | 179 |
| Classificadas como Imagem de cartão | 85 |
| Classificadas como Imagem de conteúdo | 94 |
| Relações imagem–ID de cartão registradas | 101 |
| Imagens com vínculo documental \`cards\` preexistente (preservadas) | 5 |
| Imagens ligadas por referência cruzada imagem/questão/cartão | 4 |
| Imagens ligadas por correspondência didática específica entre título/descrição e pergunta | 76 |
| Referência histórica sem cartão navegável na base publicada | 1 |

Arquivo de dados: \`assets/v198_editorial_images_catalog.json\` (formato \`BancoMestreImageEditorialCatalogV198\`). A classificação foi feita por **cotejo dos catálogos textuais V180 e os 1.518 cartões JSON V194**, não por inspeção manual integral dos bytes das 179 imagens. Isto sustenta *associações didáticas de navegação*, não prova que toda imagem estava originalmente incorporada ao verso de cada cartão.

## Critérios e graus de evidência
- \`associacao_documental_existente\`: campo \`cards\` já fornecido pelo índice de mídia recuperada. Mantido sem substituição. Exemplo: \`IMG-C12-025\` ↔ \`CARD-1504\`.
- \`questao_documentada_conciliada_com_cartao\`: a mídia registra uma questão e o cartão registra a mesma referência no campo \`reference\`. Exemplo: \`IMG-C12-024\` ↔ \`CARD-1506\`, ambos com \`PETRO12-Q004\`.
- \`correspondencia_didatica_especifica\`: nova associação por correspondência precisa de tema/título e núcleo da pergunta (ex.: \`IMG-080\` — ligação inferior da coluna de ventilação ↔ \`CARD-0326\`). Trata-se de uma **associação nova para estudo**, não de comprovação de vínculo anterior nem homologação da validade técnica da imagem.
- \`sem_cartao_correspondente\`: imagem classificada como **conteúdo**, com \`cardIds: []\`, inclusive quando o tema aparece na base, mas a questão ou imagem não é identificável de modo suficientemente específico.

O tipo \`conteudo\` aqui significa **sem vínculo suficientemente estabelecido com cartão**, como o usuário autorizou, não atestado de validade científica. Reclassificações manuais permanecem possíveis. Subtipos \`enunciado\`, \`figura\`, \`explicacao\` descrevem o papel provável no cartão e não constituem auditoria por imagem.

## Exemplos de associações
- \`IMG-038\` ↔ \`CARD-0128\`, \`CARD-0543\`: larguras de viga-parede.
- \`IMG-040\` ↔ \`CARD-0609\`, \`CARD-0610\`: bielas e tirantes em regiões D.
- \`IMG-080\` ↔ \`CARD-0326\`: coluna de ventilação do esgoto.
- \`IMG-085\` ↔ \`CARD-1176\`: degrau e tubo de queda em poço de visita.
- \`IMG-P10-15\` ↔ \`CARD-1335\`: validade de LP, LI e LO.
- \`IMG-C11-022\` ↔ \`CARD-1398\`: PFF1, PFF2 e PFF3.
- \`IMG-C12-025\` ↔ \`CARD-1504\`: exames ocupacionais (documentado na origem).
- \`IMG-C12-029\` ↔ \`CARD-1416\`: organização do trabalho (documentado na origem).
- \`IMG-C14-013\` → \`PETRO14-C017\`: cartão histórico explícito; **não localizado entre os 1.518 cartões públicos**, portanto SEM abrir ficticiamente outro cartão.

## Preservação e cautelas
- As quatro imagens \`IMG-001\`, \`IMG-C11-007\`, \`IMG-C11-009\`, \`IMG-C11-010\` mantêm seus status de atenção técnica ou **não aprovação anterior para Atlas** e **não foram promovidas** por esta auditoria; ficaram como conteúdo sem vínculo.
- O Atlas V180 (179 entradas), campos históricos, arquivos originais, hash preexistente, visibilidade, grifos, favoritos, versos, cartões e SRS não foram modificados.
- O documento editorial V198 adiciona somente metadados públicos de IDs e perguntas já publicadas. As imagens privadas novas descobertas dinamicamente pelo Drive ficam fora da contagem de 179: sem ler cada imagem e seus registros, não se presumiu vínculo e não se publicou seus IDs.
- O editor e exportador JSON de ajustes manuais V197 seguem ativos, com precedência sobre os vínculos publicados. Em outro dispositivo, a classificação V198 vem do catálogo versionado no GitHub; o JSON local continua sendo necessário para transportar **ajustes manuais** particulares.
- Imagens com \`questionRefs\` mas sem cartão publicado que corresponda ao problema específico foram mantidas como conteúdo; referências históricas de questão foram preservadas sem criar novos cartões.
- Resumo de modalidades: **85 imagens de cartão**, **94 de conteúdo**. A categoria pendente foi eliminada **neste catálogo de 179 registros**; pode ainda aparecer para imagens privadas adicionais que não pertencem ao Atlas público.

## Validação
1. Contagem 179/179 sem IDs duplicados; todos os 93 IDs recuperados e os 86 históricos presentes.
2. Todas as 101 relações preservam IDs publicados existentes, exceto a referência histórica sinalizada \`PETRO14-C017\`.
3. Abrir a aba Imagens: filtro Cartão → 85 registros; Conteúdo → 94; Todas → 179, respeitada visibilidade.
4. No cartão \`CARD-1504\`: seção imagens relacionadas deverá listar \`IMG-C12-025\`, \`IMG-C12-026\` e outros vínculos didáticos cadastrados.
5. No Atlas \`IMG-080\`: botão abrir \`CARD-0326\` deverá levar ao leitor e permitir voltar à imagem.
6. Conferir também exclusão/reativação, exportação/importação, edições locais, filtros de assunto, dispositivo móvel e imagem de Drive autorizada.

**Estado da auditoria:** verificação estrutural do catálogo e sintaxe dos módulos; a validação em navegador real do titular (JavaScript/Cloud OAuth/Drive/abertura de pop-up) permanece necessária. O resultado não afirma que 85 imagens foram verificadas visualmente no original.

**Rollback:** V197 permanece intacta. Não recriar IDs, não sincronizar silenciosamente dados do navegador com Drive e não modificar o SRS.

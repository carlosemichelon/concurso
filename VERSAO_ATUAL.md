## V364 — Retomada incremental e busca em cache (24/11/2026)

Cache de texto de busca por cartão com invalidação por mudança de campos; catálogo V362 preservado. Ferramenta auxiliar local de lote privado e recibos idempotentes, com testes e documentação. Não constitui sincronização automática do Drive. V363 preservada.

## V363 — Contrato de catálogo e manutenção reproduzível (24/11/2026)

A versão visual reutiliza o catálogo V362 sem alteração dos dados. Metadados com cache e promessa compartilhada; busca vazia não normaliza todos os textos. Gerador e verificador determinísticos em `tools/catalog_snapshot.cjs`; testes históricos separados dos testes da versão vigente e verificação dos bytes publicados. Regras em `docs/ARQUITETURA_OPERACIONAL.md`. Drive privado e SRS intocados; testes CI e navegador real ainda não confirmados.

## V362 — Carregamento rápido da biblioteca (24/11/2026)

A rotina de montagem da V361 foi executada sobre os 32 arquivos públicos de conteúdo e o manifesto de metadados, gerando `assets/catalog_snapshot_v362.json` com 1.632 cartões canônicos (1.615 ativos), 22 fichas de Ijuí, guias e estados de compatibilidade. O fluxo normal faz uma única requisição versionada com cache; a rotina `loadCardsLegacy` permanece como contingência. Nenhum conteúdo, ID, módulo, vínculo, grifo ou SRS foi modificado. O teste isolado do carregador confirmou 1.654 registros, uma requisição, compartilhamento da promessa e fallback em falha. Teste no navegador real pendente. V361 preservada.

**Regra para futuras publicações de cartões:** aplicar os incrementos na rotina de montagem, gerar novo snapshot a partir dela antes de publicar, atualizar URL/versão/contagens do carregador e testar. Não modificar o snapshot de uma versão existente nem acumular requisições sequenciais no fluxo normal. A manutenção do catálogo não exige auditoria histórica de identidade. Para mudanças somente visuais, reutilizar o snapshot existente.

## V361 — Biblioteca unificada sem bloco destacado Petrobras 29 (24/11/2026)

Removido o painel de acesso especial da interface e seus scripts exclusivos, conforme solicitação do estudante. Os 31 cartões CARD-1603 a CARD-1633 permanecem no catálogo normal, com módulos e vínculos intactos. Nenhum arquivo privado, dado didático ou SRS foi alterado. V360 preservada.

## V360 — Acesso direto aos cartões Petrobras 29 (24/11/2026)

Portal público: https://carlosemichelon.github.io/concurso/v360.html. Os 31 cartões remapeados na V359 (CARD-1603 a CARD-1633) possuem acesso direto, independente de OAuth. O arquivo histórico do Drive permanece disponível separadamente, sem ser confundido com a biblioteca pública. Conteúdo, módulos, vínculos, IDs e SRS não alterados. Conciliação do manifesto privado permanece pendente; sem teste em navegador autenticado. V359 preservada.

## Fechamento Petrobras 26 — V341 (21/11/2026)

**Portal público:** https://carlosemichelon.github.io/concurso/v341.html (snapshot V340 preservado). **Checkpoint privado salvo:** https://drive.google.com/file/d/14TeHrfybGUg9CJVOALefMN9MpPWZtpxu/view?usp=drivesdk.

**Conteúdo da conversa:** os incrementos V337, V338 e V340 somam 18 novos cartões (CARD-1542 a CARD-1559) e 23 operações de evolução em 22 IDs distintos. A V339 introduziu anotações visuais, 9 SVGs derivados, tabelas e fórmulas nos 18 perfis correspondentes; V340 vinculou o original do quadro de peneiras aos CARD-0751/0752/0753 e um desenho A4 àqueles três e ao CARD-1559. V341 não modifica o conteúdo: restabelece e associa 3 imagens ORIGINAIS identificadas no histórico, com 10 vínculos no verso dos cartões pertinentes, sem divulgar bytes privados:

- Tabela 4 NBR 16697: https://drive.google.com/file/d/1ysw1Atx5uSnxBfS9SsnC7GMd4JD7ded4/view?usp=drivesdk, relacionada aos cartões 1557/0567/0186/1546/1555.
- Quadro histórico da composição CP II/III/IV: https://drive.google.com/file/d/1Vg6ql38pQcwhTTsaQT0kpNYAS-MRr7J_/view?usp=drivesdk, relacionado aos cartões 1122/0052/0168. ATENÇÃO: imagem contém CP II-F 6–10% (histórico), enquanto NBR 16697:2018 estabelece 11–25%.
- Tabela NBR 15575 de mobiliário: https://drive.google.com/file/d/1PIoi2glAHHC-OlBAY6Du_HLQ_E-GWVkm/view?usp=drivesdk, relacionada aos cartões 1542/0190.
- Tabela de peneiras NBR NM248 previamente salva na V340: https://drive.google.com/file/d/1FQBIKei7Se63h8ps2kS0qvr037sfMhru/view?usp=drivesdk, relacionada aos cartões 0751/0752/0753.

**Estado de sincronização:** site e registro editorial no Drive sincronizados; quatro originais preservados no Atlas e com vínculo de cartão documentado. Verificação estática passou, sem teste em navegador autenticado. A base privada canônica identificada é a V175, com 1.536 cartões e 1.519 ativos em 20/11/2026; NÃO foi conciliada com os incrementos públicos V337–V341. O SRS permanece intocado. O checkpoint torna essa pendência explícita, evitando perda ou falsa alegação de sincronização privada completa. Petrobras 26 encerrado pedagogicamente e pronto para continuidade em Petrobras 27.

## Atualização 21/11/2026 — V340 · Escala granulométrica e auditoria metodológica Petrobras 20–26

**Site principal:** https://carlosemichelon.github.io/concurso/v340.html | Versão anterior `v339.html` preservada.

**1 novo cartão:** CARD-1559 — frações granulométricas NBR 6502:2022 (pedregulho fino 2–6, médio 6–20, grosso 20–60, pedra-de-mão 60–200, matacão 200–1.000 mm). Erro real do estudante: alternativa E pedra-de-mão; correta D pedregulho grosso para 20–60 mm. **3 evoluções no mesmo ID:** CARD-0751, CARD-0752 e CARD-0753 — séries de peneiras NBR NM248:2003/NBR17054:2022, normal 10 e intermediária 6, conjunto completo, aplicação na DMC/MF. Total público 1.558 cartões únicos, 1.541 ativos; SRS sem modificação.

**Imagem original do estudante:** PETRO26_NM248_TABELA1_ORIGINAL_USUARIO_20261122.png, salva no Atlas privado do Drive, ID `1FQBIKei7Se63h8ps2kS0qvr037sfMhru`; hash SHA-256 `6d742f1adfa0dce2fd0428f2503f00845f5c58fbb8b2e25b376c0acebfc7baa4`. Associada aos IDs CARD-0751/0752/0753 e questão `PETRO26-GRAN-02`. O arquivo original **não foi publicado em bytes** no site, para não expor mídia privada; link ao arquivo restrito no verso.

**Desenho autoral associado:** guia A4 vertical P&B, `assets/card_visuals_v340/escala_granulometrica_A4.svg`, SHA-256 `372b20f2345c3e0d54bec64a52137cbf203d60f92491ed553e7aba0af19d13df`. Arquivos SVG e PNG também salvos no Atlas privado; vinculado diretamente aos quatro cartões, exibido no verso junto à explicação, com fonte e legenda. Não é cópia da imagem original. Estilos `assets/v340_granulometry.css` e leitor `assets/v340_granulometry_renderer.js`; duas fórmulas MathML.

**Auditoria histórica pelo método v014:** `assets/auditoria_petro20_v340.json` e relatório de leitura `AUDITORIA_PETRO20_A_V340.md`. Universo de 124 IDs tocados desde Petrobras 20 (V267 a V340); V339/V340 demonstram grifos e desenhos associados em 21 IDs, 103 aguardam cotejo de mídia por questão/camadas, o que não significa ausência de toda mídia. Imagem original rastreada a três IDs no incremento atual. Não declarar auditoria global concluída. Testes reais de navegador, sincronização SRS privado e conciliação da planilha canônica privada continuam pendentes.

**Controle permanente:** adendo vinculante inserido na Metodologia Mestre v014 no Google Drive. `quality_gate` no manifesto atual e verificador `tools/check_metodologia_v340.js` com workflow `.github/workflows/verificar-metodologia-cartoes.yml`: valida estruturalmente cartões do release, 11 critérios, semântica declarada, arquivo SVG existente, original/questão/IDs/hash e snapshot. Os arquivos da automação foram publicados; **execução de GitHub Actions e proteção de branch não foram comprovadas**, portanto isto não é garantia absoluta contra publicações não conformes. Não substituir inspeção visual no navegador.

**Validação executada com leituras pós-gravação:** `index.html` = `v340.html`; manifesto V340 com 1.558/1.541; 1 novo + 3 evoluídos, quatro perfis com 11 critérios, três vínculos ao original privado, quatro vínculos ao SVG, ligações recíprocas, 35 scripts inline com sintaxe válida. Nenhum evento SRS criado por erro/acerto de prova.

## Atualização 21/11/2026 — V339 · Grifos semânticos, imagens e rigor visual dos cartões

Portal atual: https://carlosemichelon.github.io/concurso/v339.html · versão anterior preservada: `v338.html`.

**Motivo:** auditoria solicitada pelo estudante identificou que os 18 perfis didáticos Petrobras 26/V338 exibiam apenas destaques em negrito e não traziam imagens diretamente incorporadas ao verso. Isso não satisfazia integralmente a Metodologia Mestre vigente. A prioridade máxima é que cada cartão siga o método completo, não apenas que exista no banco.

**Correção implementada na V339:** 18/18 cartões do último incremento agora têm marcações estruturadas em `assets/v339_visual_methodology.json`; 73 anotações textuais coloridas nos quatro sentidos originais (conceito amarelo, sujeito/componente verde, condição/número azul, exceção rosa), com negrito aplicado apenas a quatro expressões de erro real nos IDs 1551, 1554, 1555 e 1556. As cores não são gravações em PDFs; são uma apresentação derivada sem modificar a redação histórica.

**Imagens realmente anexadas ao verso:** nove diagramas técnicos vetoriais em `assets/card_visuals_v339/` vinculados semanticamente aos 18 cartões por ID e mostrados no próprio cartão **após a revelação**, próximos da explicação causal. Esquemas de coleta representativa, quarteamento, sobrecarga de peneiras, vazios entre grãos, Vicat, reciclagem, empilhamento, ensaios do cimento e minerais pesados/leves. Cada figura tem legenda, descrição acessível, identificador, fonte derivada e link direto à imagem SVG. Figuras autorais derivadas NÃO substituem ou falsificam fotos/recortes originais do estudante. As sete imagens do assunto “Materiais / Concreto e agregados” localizadas no catálogo F17 foram somente inventariadas; suas URLs/IDs de original não foram identificados e validados individualmente, portanto não foram publicadas como original de cartão.

**Outros elementos úteis:** cinco tabelas HTML reais (quantidades de amostragem, reciclagem, métodos de massa unitária, CP V-ARI e classificação de agregados) e seis conjuntos de equações MathML para assuntos com cálculos e unidades. A resposta discursiva em fundo branco V333 e o histórico recolhido de 11 módulos foram preservados.

**Arquivos:** `assets/v339_semantic_visual_renderer.js`, `assets/v339_semantic_visual.css`, `assets/v339_visual_methodology.json` e nove `.svg`. Sem novos IDs: permanecem 1.557 únicos, 1.540 ativos e 22 registros operacionais Ijuí. `index.html` e `v339.html` idênticos. Conferência ESTÁTICA: 18 perfis, 73 marcações, 9 SVG encontrados, 5 tabelas, 6 cartões com fórmulas, 34 scripts inline parseáveis, integridade dos vínculos e manifesto V339. Navegador real/autenticado, impressão/visibilidade e SRS privado continuam NÃO testados. Não foram alterados SRS, dados privados, originais de imagens, Atlas nem conteúdo técnico de V338.

**Limite declarado:** a V339 corrige especificamente a apresentação dos 18 cartões V338. Não é correto extrapolar que todos os outros 1.539 cartões públicos tenham passado por auditoria visual ou que as fotos históricas tenham sido associadas. Ampliações futuras devem aplicar os critérios como preflight pontual, sem reprocessar a base integral durante o estudo.

## Atualização 21/11/2026 — V338 · Consolidação das questões e amostragem de agregados

Entrada publicada: https://carlosemichelon.github.io/concurso/ · snapshot imutável: https://carlosemichelon.github.io/concurso/v338.html · versão anterior preservada: `v337.html`.

**Publicação efetiva:** 11 cartões novos CARD-1548 a CARD-1558 e 7 cartões existentes evoluídos sem trocar IDs (CARD-0186, 0567, 1546, 0949, 0694, 0751, 0755). Total **1.557 cartões únicos**, dos quais **1.540 ativos**, além de 22 cartões operacionais de Ijuí (1.579 entradas combinadas). Arquivo versionado `assets/petro26_study_sync_v338.json`, leitor `assets/v338_editorial_renderer.js`. Padrão V333 de resposta-modelo discursiva, 11 critérios internos de aprendizagem, versões anteriores preservadas em histórico recolhível e vínculos bidirecionais. V337 e anteriores intactos.

**Três cartões completos de amostragem (NBR 16915:2021):** CARD-1548 coleta representativa em pilhas, caminhões e correias; CARD-1549 redução de amostra de campo por separador e quarteamento; CARD-1550 lotes, três parciais, massas mínimas de 40/75/150 kg (Tabela 1) e valores distintos para dosagem (Tabela 2). Antes, não havia cartão direto de amostragem de agregados na base pública nem na fotografia XLSX V016; o CARD-0425 usa a palavra 'amostragem' para NBR 15575 e foi corretamente preservado sem vínculo indevido.

**Reciclagem e beneficiamento:** CARD-1551 diferencia reciclagem após transformação, reutilização sem transformação e beneficiamento como processamento, com registro de erro real por leitura de enunciado. CARD-1552 separa as limitações da NBR 15116:2004 das hipóteses estruturais condicionadas da NBR 15116:2021; não generaliza autorização para concreto estrutural.

**Outros conhecimentos agora integrados:** CARD-1553 massa unitária NM45/16972 e três determinações; CARD-1554 limite 7 kg/m² abaixo de 4,75 mm NM248/17054; CARD-1555 consistência Vicat 6 ±1 mm; CARD-1556 sacos de cimento 15/10 por duração e prazo 90 dias; CARD-1557 pega ≥60 min, expansão ≤5 mm, CP V-ARI 14/24/34 MPa; CARD-1558 barita/hematita/magnetita/limonita versus agregados leves. Evoluções substantivas nos sete IDs citados. Norma Seca de Engenharia tem prioridade BAIXA; referência normativa preservada e respostas priorizam mecanismos, cálculo e recuperação.

**Segurança e limites de sincronização:** Publicação da camada pública do GitHub concluída, entrada `index.html` atualizada. O **XLSX canônico privado** `1SA-PKBrlaovuNLFMPBx7BByH3BH0Tcsr` foi verificado, mas é fotografia V016 antiga com 1.497 registros e não contém atualizações posteriores do portal. Portanto NÃO foi sobrescrito por risco de perda das versões privadas mais novas. O Drive recebe registro editorial dos incrementos e este manifesto público rastreia o conteúdo; **sincronização da base privada e SRS/OAuth ainda pendentes**. Não houve inferência de avaliação SRS por gabarito de prova, nem alterações em PDFs/imagens privados. Validação estática de HTML/JS; navegador autenticado e OAuth ainda não testados.

## Atualização 21/11/2026 — V337 · Petrobras 26

Acesso principal: https://carlosemichelon.github.io/concurso/ · snapshot preservado: `v337.html` · retorno: `v336.html`.

**Atualização efetiva do catálogo público:** 13 cartões existentes evoluídos nos mesmos IDs (CARD-0082, 0190, 0424, 0587, 0052, 0168, 0381, 1122, 1140, 1141, 1142, 1143 e 1364) e 6 novos IDs consecutivos (CARD-1542 a CARD-1547). Catálogo: **1.546 únicos, 1.529 ativos**, além de 22 operacionais de Ijuí. Cada um dos 19 perfis recebeu frente, resposta-modelo contínua e 11 módulos didáticos; histórico literal e 11 módulos anteriores permanecem acessíveis no recolhível. Vínculos recíprocos para os cartões envolvidos, questões vinculadas a PETRO26, origem e fonte registrados em `assets/petro26_delta_v337.json`. Renderização no leitor pelo módulo `assets/v337_editorial_renderer.js`.

**Assuntos:** dimensões funcionais de NBR 15575 (sala 2,40 m, sofá 0,50 m, mesa 0,75 m) versus NBR 9050; plantas de fôrmas versus memória de cálculo; IA/TO/TP e ressalva sobre pavimentos desiguais; chapas drywall ST/RU/RF; CP III e CP II-E, CP II-F da NBR 16697:2018 (11–25%, corrigindo quadro anterior); frasco/aparelho Le Chatelier, expansão e autoclave; CaO/MgO, DEF/etringita, RAA, diagnóstico DRX/MEV-EDS. O CARD-0064 foi preservado sem fusão devido à duplicidade parcial já conhecida.

**Segurança e rastreabilidade:** V336 intacta, alterações em overlay separado. A V337 também elimina uma redeclaração `const extra` que impedia sintaxe do código herdado, sem afetar os dados V335. Não houve importação de dados privados, criação de avaliação de revisão, alteração de SRS, imagens, PDFs ou grifos. Publicação de arquivos estáticos não constitui prova de que a sincronização privada do navegador tenha ocorrido. Teste sintático dos scripts inline realizado; integração privada e homologação com OAuth dependem de verificação específica.

## Atualização 20/11/2026 — V333

Acesso: https://carlosemichelon.github.io/concurso/?v=333 · snapshot: v333.html · anterior: v332.html.

**CARD-1534 — Experimento de formatação aprovado para teste visual:** resposta em fundo branco com três parágrafos naturais de texto contínuo, sem indicadores numerados 01–03, caixas ou linhas divisórias dentro da resposta discursiva. O conteúdo permanece exatamente igual à V332. Preservados destaques semânticos, fórmulas MathML com títulos, quadros HTML informativos e os recolhíveis históricos, incluindo "Resposta evolutiva integral".

Assets versionados `assets/v333_card1534_reading.js` e `assets/v333_card1534_reading.css`; demais cartões, bases e SRS intocados. Checagens estáticas realizadas; aspecto no navegador ainda não verificado.

## Atualização 20/11/2026 — V332

Acesso: https://carlosemichelon.github.io/concurso/?v=332 (index.html) · snapshot: v332.html · versão anterior para retorno: v331.html.

O CARD-1534 mantém os três parágrafos integrados, os realces semânticos e as fórmulas MathML. Cada fórmula ganhou seu rótulo técnico. Os dados da Tabela 9.3 (tipo/disposição e percentuais estático/dinâmico) e da Tabela 9.4 (percentual e α0t) aparecem em duas tabelas HTML reais. O Quadro 06 reúne exclusivamente informação, não decisões.

Os recolhíveis foram organizados para reduzir repetições: (1) macetes, pegadinhas e lacunas; (2) fundamentos e fontes; (3) **Resposta evolutiva integral**, fechada inicialmente, contendo verso literal original, seção histórica de conhecimento mínimo/resposta-modelo, os 11 módulos completos e registros de tentativas/correções. Os textos são movidos no DOM, nunca excluídos. Leituras e movimentações não alteram o SRS.

Cabeçalho, título e rodapé passaram à versão V332. Corrigida a estatística estática antiga 1.555 para 1.558 fichas: 1.536 IDs canônicos (1.519 ativos; 17 inativos) + 22 propostas editoriais. Valores apoiados nos contadores existentes no manifesto, sem confundir fichas com eventos SRS.

Os arquivos V331, JS/CSS V330, dados de cartões e pontes V327/V329 permanecem preservados. Scripts V332: `assets/v332_card1534_didactic.js`, `assets/v332_card1534_didactic.css`. Verificações estruturais e de sintaxe foram realizadas, mas a apresentação em navegador real ainda precisa de confirmação do usuário.

## Atualização 20/11/2026 — V330

Acesso: https://carlosemichelon.github.io/concurso/ (index.html) · snapshot: v330.html · rollback: v329.html.

**CARD-1534**: resposta-modelo integrada em um único quadro, composta por **três parágrafos completos**, derivados dos critérios de recuperação, resposta, mecanismo, fórmulas e comparação (01, 02, 04, 05 e 06). Esta sequência foi escolhida por resultar em uma resposta didática lógica, não por impor cinco módulos fixos a outros cartões. Os parágrafos foram organizados com indicadores 01–03, espaçamento próprio, títulos de apoio, destaques seletivos e quebra de texto legível.

**Quadro 06**: tabela nativa com dados técnicos (elemento, significado e grandeza/referência), **sem coluna de decisão**, complementada por informações numéricas das Tabelas 9.3/9.4. Equações apresentadas em MathML, preservando grandezas e unidades.

**Resposta evolutiva integral**: inicia recolhida por padrão; ao expandir, disponibiliza os 11 módulos históricos completos e, em detalhe aninhado, o verso literal original. Não foram alterados os registros canônicos, fontes, imagens, links, aprovações, SRS nem dados privados. V329 (mineralogia e todos os módulos completos) preservada.

Nova versão visual independente: `assets/v330_card1534_didactic.js` e `assets/v330_card1534_didactic.css`. Testes estáticos de sintaxe e referências: verificados; teste funcional real no navegador autenticado do usuário ainda pendente.

## Atualização 20/11/2026 — V328

Acesso: https://carlosemichelon.github.io/concurso/ (index.html) · snapshot: v328.html · retorno: v327.html.

**CARD-1534 — Emendas por traspasse:** o leitor passa a apresentar uma única resposta-modelo integrada, com as informações essenciais dos critérios históricos 01 (pergunta), 02 (resposta), 04 (mecanismo), 05 (cálculo) e 06 (comparações). Fórmulas foram renderizadas por MathML nativo, com tabelas comparativas reais (três conceitos; limites da Tabela 9.3; coeficientes da Tabela 9.4), grifos seletivos, exemplo 80 cm/16 cm, exemplo de cálculo e alertas normativos. A vista literal antiga e os 11 módulos históricos continuam íntegros e disponíveis em controles recolhidos; o conteúdo canônico não foi reescrito.

**Cartões relacionados:** abertura na lateral sempre inicia com o verso recolhido. A pergunta é exibida primeiro e o estudante decide quando revelar; o cartão principal não é substituído por navegar na lateral.

As três novas mídias locais de UI são `assets/v327_card1534_didactic.js`, `assets/v327_card1534_didactic.css` e `assets/v327_related_navigator.js`; o prefixo v327 identifica o desenvolvimento do arquivo, não a versão de publicação V328. A ponte `v327_deferred_10_bridge.js`, os dez cartões integrados na V327, os arquivos históricos e o SRS foram preservados. Teste de sintaxe e verificação estática efetuados; teste autenticado em navegador permanece pendente.

## Atualização 20/11/2026 — V326

Acesso: https://carlosemichelon.github.io/concurso/ (index.html) · snapshot: v326.html · retorno: v325.html.

**Sincronização por necessidade**: a conexão inicial do Google Drive carrega PDFs, Atlas, checkpoints, Controle/Lacunas e grifos autorizados. Depois da conferência, o portal não realiza novas varreduras periódicas de pastas por tempo, foco ou troca de seção. O botão "Sincronizar Drive" e os botões específicos continuam permitindo atualização manual. Grifos, Controle de Estudos e Lacunas continuam sincronizando após alterações locais (com proteção contra conflitos e verificações). O SRS formal permanece separado e não foi alterado.

As sete partes de JavaScript modificadas foram publicadas sob nomes exclusivos `assets/v326_js_*.js`; os sete scripts antigos foram restaurados exatamente aos hashes da V325. Os registros de cartões, 11 módulos, SRS, PDFs, imagens e documentos privados não foram escritos na atualização. Sintaxe JavaScript e referências HTML verificadas; teste de autorização OAuth e tráfego real no navegador do proprietário ainda pendente.

---



## Atualização 20/11/2026 — V325

Fonte publicada: gh-pages, arquivo v325.html e index.html; manifesto assets/version.json. Base V173 privada verificada por SHA-256; transportados somente 3 cartões aprovados CARD-1535 a CARD-1537, 35 explicações, 40 vínculos e 681 registros de 11 módulos (678 diferentes + 3 novos), com 28 incompletos preservados para auditoria. Dados SRS, lacunas, mídias privadas e propostas não aprovadas permaneceram fora do GitHub. V324 foi preservada para rollback. Histórico anterior deste documento permanece abaixo.

# V324 — Painel lateral único para pesquisa e leitura de cartões (20/11/2026)

- **Nova navegação:** a lateral esquerda alterna entre a lista de pesquisa e a leitura completa do cartão selecionado. Os dois blocos deixam de aparecer empilhados.
- **Voltar à busca:** o botão “← Pesquisa” restaura busca digitada, filtros, resultados e posição de rolagem.
- **Selecionar outro cartão:** vínculos da prévia abrem o próximo cartão na mesma área, sem criar um segundo painel e sem substituir o leitor principal. A seta ↗ mantém sua função de abrir no painel principal.
- **Escopo:** apenas apresentação e navegação; respostas, IDs, 11 módulos, vínculos, SRS, Drive, PDFs, imagens, grifos e versões anteriores preservados.
- **Testes:** parser JavaScript e referências da página verificados estaticamente. Uso no navegador autenticado do estudante e validação responsiva final ainda pendentes.
- **Publicação:** branch `gh-pages`; página `v324.html`; entrada `index.html`; manifesto `assets/version.json`. Retorno: `v323.html`.

# V323 — Correção do cartão relacionado invisível na lateral (20/11/2026)

- **Falha identificada:** a regra global `section{display:none}` ocultava a prévia lateral, os vínculos e os módulos apresentados como `<section>`, dando aparência de travamento após o clique.
- **Correção:** quatro contêineres exclusivos da lateral passaram a `<div>`; CSS específico garante `display:block` e preserva a navegação consecutiva da V322, sem reconstruir a lista.
- **Preservação:** cartões, textos originais, relações, 11 módulos, SRS, Drive, grifos, imagens e PDFs intactos; V322 preservada para rollback.
- **Verificação:** análise de código e sintaxe JavaScript; teste final no navegador autenticado do estudante ainda pendente.
- **Publicação:** `gh-pages` / `v323.html` / `assets/version.json`.

# V322 — Correção da seleção consecutiva de cartões relacionados (20/11/2026)

- **Defeito reportado:** após abrir a primeira prévia lateral, outro clique em cartão relacionado não atualizava corretamente a seleção.
- **Correção:** seleção lateral mantém a lista e os elementos clicáveis estáveis; atualiza somente `aria-current` e a prévia, conservando a posição de rolagem. Links documentados do cartão visualizado na prévia também abrem a próxima prévia, sem substituir a janela principal.
- **Promoção:** apenas a ação ↗ abre o cartão selecionado na janela principal. Dados, IDs, históricos, 11 módulos, filtros, imagens, Drive e SRS preservados.
- **Teste de regressão em lógica de interface:** sequência CARD-0002 → CARD-0003 sobre os mesmos botões passou; seleção ativa acompanhou o segundo clique, sem reconstruir a lista nem perder a rolagem. Teste visual com o navegador real do usuário permanece pendente.
- **Publicação:** `gh-pages/v322.html`, `gh-pages/index.html`, `assets/v322_related_navigator.js`, `assets/v322_related_preview.css` e `assets/version.json`. V321 preservada.

# V321 — Navegação de cartões, classificação de imagens e anotação (20/11/2026)

- Publicação: `gh-pages`, `index.html` e `v321.html`; fonte operacional `assets/version.json`.
- **Cartões relacionados:** clicar no vínculo exibe pergunta, verso, referências e 11 módulos sob demanda na lateral; a seta ↗ promove o cartão selecionado à janela principal. O cartão de origem permanece até essa ação; retorno reversível preservado.
- **Atlas:** 71 imagens da pasta de sincronização do Drive classificadas em `assets/v321_drive_image_topics.json`: 7 por inspeção visual direta e 64 por nome descritivo. A edição descartada foi marcada como material não utilizável. O integrador `assets/v321_image_topic_completion.js` associa por nome exato, sem expor novos IDs privados, sem alterar originais e sem inventar vínculos com flashcards. Os 237 arquivos do catálogo V211 já classificados pela V310 permanecem intactos.
- **Anotar flashcard:** a ferramenta de anotação passa a iniciar sempre em **Ler / selecionar** texto, mantendo caneta, marca-texto e borracha disponíveis; armazenamento local e registros anteriores não mudam.
- Preservados cartões, IDs, 11 módulos, SRS, Drive, PDFs, imagens e arquivos das versões anteriores, inclusive V320. Sintaxe dos scripts conferida. Teste real no navegador do usuário ainda não realizado; classificações feitas por nome não significam validação técnica do conteúdo.

# V310 — Taxonomia visual auditada de imagens do Atlas (20/11/2026)

- **Escopo auditado:** 237 arquivos do catálogo público V211; antes havia 93 classificados e 144 sem tema. O novo índice `assets/v310_image_taxonomy.json` registra 144 itens (104 arquivos vinculados a 66 conteúdos visuais distintos inspecionados em originais/prévias, 40 com nome e pasta descritivos). Total **237/237 com classificação temática no catálogo V211**. Não confundir esse total com as **307 imagens relatadas em sessão privada do Google Drive**, que podem ter outro recorte ou novos originais.
- **Evidência rastreável:** cada linha nova preserva o ID original do Drive já publicado, nome/pasta de origem, grupo, tema, subtema, título, base de evidência, confiança e situação. Uma classificação por nome permanece sinalizada como `tema_indicado_pelo_nome_aguarda_inspecao`; não equivale à verificação visual nem à validação técnica da norma.
- **Categorias:** Engenharia Civil — Estruturas, Hidráulica e Saneamento, Geotecnia, Materiais e Segurança do Trabalho. Foram identificados, entre outros, Mohr, treliças, torção, flechas, esgoto sanitário/NBR 8160, ventilação, solos, Los Angeles/agregados e NR-7/NR-17.
- **Preservação:** as 93 classificações anteriores do V211/V180 não foram alteradas. O motor `assets/v218_image_metadata.js` carrega o novo índice apenas para arquivos anteriormente sem assunto, conserva classificação de maior prioridade e mantém os vínculos documentados com flashcards. **Não foram criados cartões ou associações a cartões por similaridade temática.** SRS, 11 módulos, PDFs, grifos, autorizações e originais Drive intactos.
- **Busca e UI:** biblioteca de imagens usa o mesmo motor de metadados do Drive; novo catálogo é lido a cada sessão e passa a classificar originais cujo Drive ID esteja no V211. A nova classificação funciona no celular e computador, sem sincronização privada de escrita, mas é necessário autenticar para listar os originais Drive no portal.
- **Reversão:** `v309.html` e todo o material histórico preservados. Página atual `v310.html`; CSS e menu V309 mantidos.
- **Validação:** `tests/v310_image_taxonomy.cjs` checa em execução cobertura, preservação de vínculos e de temas anteriores, 66 conteúdos/104 arquivos visuais e 40 por nome; CI de layout e não-regressão ainda exigido para homologação. A sincronização real dos demais originais privados do Drive não foi acionada nesta alteração.

---

# V309 — Abas recolhíveis no celular e conferência do Calendário (20/11/2026)

- **Cabeçalho móvel:** menu **Abas** fechado por padrão até 620 px, com seção atual identificada; toque abre todas as abas existentes, escolha de aba fecha novamente. Acessibilidade: `aria-expanded`, `aria-controls`, Escape recolhe; desktop permanece inalterado. Todos os botões e seus eventos originais permanecem no DOM.
- **Calendário/Controle de Estudos:** cada navegador mantém registros em `localStorage["BM245_CONTROLE_ESTUDOS"]`. O computador e o celular não compartilham esse armazenamento. Um arquivo privado separado no Drive, chamado `BancoMestre_Controle_Estudos_V245.json`, é utilizado pela rotina `BM240ControlDrive.sync` quando há OAuth com escopo de escrita `drive.file`; PDFs/imagens de leitura não confirmam essa permissão.
- **Correção de usabilidade:** a tela Calendário passa a mostrar contagem de registros locais e botão **Autorizar Drive e sincronizar** / **Conferir e sincronizar**. Esse botão usa a rotina V245 de comparação criptográfica, backups e bloqueio de conflitos, sem sobrescrita forçada e sem alterar SRS. Distingue enviado, importado, idêntico, conflito, pendência ou falha.
- **Por que os aparelhos diferiam:** o agendamento automático é de 3 horas, mas o token OAuth tem validade temporária, tipicamente inferior a 3 horas; não existe renovação silenciosa com refresh token persistido. Logo, a periodicidade NÃO garante a transferência se o Drive estiver desconectado, o navegador fechado, sem permissão de escrita, ou houver conflito. Verificar **no computador primeiro** o retorno `Controle: mestre privado criado e verificado` ou `alterações enviadas e verificadas`; **no celular depois**, conferir `registros remotos importados`. Não igualar "Drive conectado" a dados confirmados.
- **Localização no Drive conectado:** uma busca pelo nome exato do mestre e pelo marcador de app `bm_controle_estudos_v245` não retornou arquivo nesta conexão. Isso **não comprova ausência** no escopo `drive.file` do OAuth próprio do portal, pois as conexões têm permissões e visibilidade diferentes; não apagar nem criar arquivo em nome do usuário sem confirmação.
- **Preservação:** V308 mantida em `v308.html` como reversão, 11 módulos, cartões, SRS, PDFs, imagens, grifos e dados do Controle inalterados. Nenhum registro remoto foi gravado nesta publicação; somente interface e diagnóstico.
- **Teste:** matriz responsiva e testes de integridade adicionados. Verificação autenticada com contas reais do computador e celular requer ação do titular e não é possível simular em CI.

---

# V308 — Cabeçalho para celular (20/11/2026)

- **Correção isolada:** alterados somente os estilos móveis do cabeçalho (até 620 px). O conteúdo dos cartões, PDFs, imagens, páginas, 11 módulos, SRS e autorização Drive permanece inalterado.
- **Navegação:** botões em grade de quatro colunas de largura igual, sem ícones grandes, com rótulos legíveis, estado ativo azul e área de toque de pelo menos 39 px. Redação usa rótulo visual curto, mantendo o nome acessível original.
- **Drive:** botões **Sincronizar** e **Diagnóstico** nivelados, com área de toque de 38 px e sem texto cortado. A sincronização permanece em 3 horas.
- **Celular horizontal:** cabeçalho deixa de ser fixo em paisagem baixa para não ocupar demasiada área de leitura.
- **Validação:** matriz de seis larguras (320, 360, 390, 412, 480, 667 px) verifica corte, sobreposição, rolagem interna, botões e regressões de cartões. Conexão OAuth real não faz parte do teste.
- **Reversão:** `v307.html` e os estilos anteriores foram preservados. A V308 usa `assets/v308_mobile_header.css` isolado.

---

# V307 — Frente de flashcards e áreas de estudo (20/11/2026)

- **Áreas de estudo:** removido o pseudo-ícone decorativo dos cinco botões principais. Preservados títulos, quantidades, função de clique, disciplina e consulta de assuntos. Botões compactos e com tipografia consistente.
- **Frente dos cartões:** ampliada a largura-alvo da grade para 350 px; faixa superior mostra disciplina/origem à esquerda e **Abrir leitura** à direita, sem se sobrepor ao enunciado. ID visível acima da pergunta. Pergunta em tipografia de 16 px (15 px no celular) com entrelinha estável.
- **Metadados:** disciplina, assunto e subassunto repetidos foram reduzidos visualmente; a referência exata original, quando cadastrada, continua integral em **Fonte, referência e edição**, um painel recolhido por padrão. O texto original não foi alterado, e o leitor completo com 11 módulos continua acessível.
- **Mídia e relações:** mantidas figuras de enunciado/questão no cartão e no leitor, explicações visuais recolhidas e links auditáveis de cartões relacionados; nenhuma associação presumida adicionada.
- **Ações:** Grifar/escrever e Excluir da visualização alinhados no rodapé, com tamanho/cores moderados. Excluir da visualização não apaga dados ou arquivos originais.
- **Persistência e segurança:** fontes privadas, IDs, SRS, PDFs, grifos, sincronização Drive de 3 horas, histórico, V306 e anteriores preservados. Mudança apenas de interface e localização visual das referências.
- **Validação:** testes de DOM, visual mobile/desktop, versão atual e rollback; não é uma auditoria de conteúdo de todos os cartões. Teste real da sessão Google Drive e auditoria dos registros de imagens sem classificação continuam tarefas separadas.

---

# V306 — Imagens no próprio flashcard, busca editorial e Redação (20/11/2026)

- **Busca de imagem por ID:** a consulta `IMG-C12-030` agora reconhece o identificador editorial publicado em V211/V198/V180. O original no Drive se chama `IMG-P12-011_NR17_Medidas_de_Prevencao_Pausas_Alternancia.png` e tem Drive ID `1gdepf2G5xQfT82pjAA1Rszl9nLdXyuZS`; vínculos comprovados com `CARD-1509` e `CARD-1518`. A busca aceita ID editorial, arquivo original, nome, questão e IDs vinculados, sem inferir temas.
- **No cartão:** o portal monta imagens com vínculos explícitos de cartão usando os catálogos V198/V211. Figuras/enunciados aparecem junto da frente; materiais de explicação ficam recolhidos para evitar revelar a resposta antes de tentar. O leitor detalhado mostra as imagens na mesma janela, e a aba de Imagens continua para pesquisa e classificação. Quando autorizado, a imagem é buscada do Drive como URL de blob na sessão; sem OAuth, o cartão oferece link do original, sem publicar cópia no GitHub.
- **Vínculos em edição:** mudanças manuais no editor de mídia (armazenadas localmente) podem substituir o conjunto de IDs vinculados sem alterar arquivos canônicos nem SRS. Não criar relações por mera proximidade de assunto. Classificações históricas explicitamente didáticas continuam identificadas como tal.
- **Redação:** a oficina original `redacao_temas_treino_v296.html` permanece intacta (10 abas, exercícios, rascunhos, históricos). O iframe no portal recebe tema azul, branco e cinza, componentes retangulares e tipografia semelhante às outras abas, via `assets/v306_redacao_theme.css`. O script pai só injeta a folha depois do carregamento.
- **Exclusão:** o login OAuth de imagens e PDFs é `drive.readonly`. O botão do portal apenas oculta registros da visualização, sem excluir arquivos. O link direto `Abrir no Drive` pode permitir mover o original para a lixeira se a conta Google tiver permissão de exclusão sobre aquele arquivo; apenas possuir link de leitura não autoriza. Acesso a pasta não é requisito universal quando já há permissão direta no arquivo.
- **Proteção:** V305 histórica preservada; nenhuma alteração em originais, IDs de cartões, 11 módulos, SRS, históricos de grifos, PDFs ou permissões Drive.
- **Limite da auditoria:** o teste automatizado usa Chromium sem autorização OAuth real do usuário. A integridade dos vínculos e a montagem visual podem ser validadas, mas a exibição de bytes privados durante sessão real deve ser conferida separadamente.

---

# V305 — Cartões relacionados, contagem de IDs, assuntos e imagens (20/11/2026)

- **Frente dos cartões:** exibir subassunto quando cadastrado e cartões relacionados na parte inferior **antes do verso**, com links diretos. Até quatro vínculos inicialmente e expansão discreta para os demais; somente vínculos reais presentes em campos de IDs ou módulo 8 de cobertura cruzada, nunca somente por grupo/assunto. A fonte privada nunca é publicada pelo script.
- **Leitor:** a lateral **Outros cartões** abre recolhida por padrão a cada cartão; mantém comando explícito de reabrir, anteriores/próximos, resposta oculta e 11 módulos completos.
- **Ordenação:** compositor antigo agrupava cartões por assunto após a ordenação e fazia a grade começar por IDs como 1529/1524. Com filtro geral e ordenação por ID ativa, os nós originais são apresentados globalmente por ID, preservando listeners e sem reescrever os cartões. Novos primeiro = maior ID público disponível.
- **Contagem:** o catálogo público V304/V305 agrega 1.533 cartões canônicos (1.516 ativos, 17 inativos), mais 22 fichas operacionais de Ijuí; total carregado 1.555 e ativos/operacionais 1.538. “Todos” e filtros dependem também de ocultações locais, seleção, ordenação e paginação. A aba agora distingue quantos são de fato exibidos versus total selecionado.
- **Fontes diferentes:** a fonte privada V173 no Drive tem 1.536 cartões canônicos (1519 ativos), inclui **CARD-1535, CARD-1536 e CARD-1537** que ainda não constam do catálogo público e reserva o **CARD-1499**; isso não é falha de contagem nem autorização para publicar materiais privados. Não houve alteração do Drive ou dos cartões.
- **Assuntos:** ocultados os ícones grandes decorativos nos cartões das disciplinas; nomes e números continuam visíveis.
- **Imagens:** atalho “Imagens sem classificação” aplica a seleção existente do assunto geral pendente sobre registros efetivamente lidos do Drive. A contagem de 214 é observação do navegador do estudante, não total revalidado nesta publicação. Não inferir vínculos imagem–cartão sem evidência, nem gravar classificação automaticamente.
- **Imagem do enunciado:** a Metodologia Mestre v014 já a reconhece como “imagem da questão” e “imagem do cartão” simultaneamente quando necessária. Guardar original, referência, ID, função, hash quando disponível e verificar vínculo, evitando duplicatas; não exigir nova regra para isso.
- **Proteção:** V304 preservada para reversão, assim como IDs, respostas literais, 11 módulos, SRS, PDF, grifos, OAuth e originais do Drive.
- **Testes:** avaliação estática + integração pública automatizada; inspeção visual e OAuth reais no dispositivo do estudante ainda devem ser conferidos antes de homologação total.

---

# V304 — Flashcards, PDFs e sincronização Drive a cada 3 horas (19/11/2026)

- **SHA-256 confirmado no Drive:** ponteiro operacional privado **V010** criado com SHA-256 calculado dos bytes reais da base privada V173; leitura de retorno confirmou ID da fonte, 1.536 cartões, 1.520 registros SRS e assinatura. O V009 original foi preservado; a verificação autenticada no navegador ainda precisa ser exercitada.
- **Prioridade Flashcards:** a fonte privada V173 foi conferida (1.536 cartões / 1.520 SRS). O ponteiro V009 do Drive omite SHA-256; o comparador V304 permite inspeção **somente leitura não certificada**, sem confundir falta de metadado com falha no cartão. Quando há SHA no ponteiro, comparação criptográfica continua obrigatória e divergência bloqueia.
- **PDFs:** o painel duplicado “Estado e opções” e o aviso histórico sobre 78 PDFs deixam de poluir a interface; contagem real da biblioteca continua disponível. Cada área, como “Engenharia Civil”, passa a abrir/recolher pelo próprio cabeçalho, com a contagem preservada. Os arquivos e editores continuam intactos.
- **Drive:** ciclo automático passa a **3 horas** enquanto a autorização OAuth continua válida e a página está aberta. Sincronização manual e reconexão permanecem disponíveis; as abas não reiniciam o relógio.
- **Rastreabilidade:** V303 anterior preservada em `v303.html`; novos módulos isolados V304 e os existentes não alterados. Nenhum cartão, SRS, conteúdo pedagógico, PDF, imagem ou grifo original foi modificado.
- **Validação:** verificações estáticas de código e presença de recursos concluídas. Teste autenticado no navegador do estudante permanece pendente.

---

# V303 — Reconstrução da aba PDFs e filtros das bibliotecas (19/11/2026)

- **Problema reproduzido visualmente:** a aba PDFs dividia a barra e os botões em colunas desconexas, gerando um espaço vazio alto. Em Flashcards, filtros de ordenação continuavam expostos; em Imagens, filtros duplicados; painéis recolhidos podiam mostrar controles mesmo fechados porque regras `display:flex!important` prevaleciam.
- **PDFs:** layout de fluxo vertical em largura total, uma barra de busca/grupo/contagem, botões OAuth/sincronização originais e um único painel de áreas/PDFs locais/ferramentas. Os 78 PDFs e marcações não são alterados.
- **Assuntos, Flashcards, Imagens e Lacunas:** somente filtros centrais abertos; hierarquias, ordenação, classificação, catálogo e histórico continuam acessíveis em detalhes. Corrige semântica de `details:not([open])`.
- **Scripts em conflito:** retirado o reorganizador V280 e o V300 da inicialização da V303; V113 e V293 têm variantes de compatibilidade V303 que evitam mover de novo filtros após a criação da barra única. Originais históricos preservados no repositório.
- **Manifesto:** sincroniza `version`, `home`, `current_versions.portal` e histórico V302. O sincronizador Drive V302 (intervalo de 1 h e sessão ao trocar abas) fica intacto.
- **Segurança:** não muda conteúdo das fichas, arquivos do Drive, SRS, 11 módulos ou banco privado. PDF original não recebe grifos embutidos automaticamente; grifos privados só são confirmados no Drive após sincronização.
- **Auditoria visual:** capturas reais de V302 em desktop/mobile guardadas antes do ajuste; V303 será homologada no Chromium com dados de teste e sem autenticação privada.

# V302 — Preservar sincronização ao alternar abas internas (19/11/2026)

- A navegação entre **Assuntos, PDFs, Flashcards, Imagens, Controle de Estudos, Lacunas, SRS e Redação** mantém o mesmo documento principal e sua sessão OAuth em memória; não exige nova autenticação por troca de seção.
- A oficina Redação V296 agora é aberta em um iframe dentro da seção do portal, sem substituir seu HTML histórico. O link de retorno dentro da oficina volta para Assuntos sem recarregar o portal principal.
- O gerenciador central mantém o **intervalo de 1 hora** da V301; navegar não reinicia o cronômetro ou dispara uma sincronização forçada. Indicador de conexão fica no cabeçalho em todas as abas.
- Expiração/revogação do OAuth, fechamento da aba e recarga completa continuam exigindo nova autorização pelo Google. Não armazenar tokens em disco nem contornar bloqueios.
- Nenhuma modificação nos cartões, SRS, 11 módulos, PDFs originais, grifos e arquivos privados. V301 e Redação original preservadas. Testes estáticos realizados; teste em navegador autenticado ainda pendente.

# V301 — Sincronização do Google Drive a cada 1 hora (19/11/2026)

- Alterado intervalo de conferência automática principal de 5 minutos para **60 minutos** com aba visível e sessão OAuth autorizada.
- Alterada rotina periódica de Controle de Estudos/Lacunas de 2 minutos para **60 minutos**, evitando frequência superior à escolhida.
- Autorização inicial e botão de sincronização manual permanecem imediatos; verificações sem gravação, bloqueio de conflitos e preservação de tokens em memória mantidos.
- Sem alterações em conteúdo dos cartões, 11 módulos, SRS, grifos, PDFs originais ou imagens. V300 preservada em `v300.html`. Homologação OAuth real pendente.

# V300 — PDFs anteriores, Lacunas reorganizadas e filtros essenciais (19/11/2026)

- **PDFs:** retorno à aparência de títulos, agrupamentos e textos da V297, sem substituir PDFs, leitores ou grifos.
- **Lacunas:** agrupamento por disciplina/assunto e situação, prioridade e cartões no primeiro plano; todos os conteúdos, relatórios, origens e históricos acessíveis em detalhes. Correção de `section` didática ocultada pela regra de navegação global.
- **Filtros:** pesquisa e disciplina/grupo/situação em destaque; opções secundárias e ações administrativas recolhidas em Assuntos, PDFs, Flashcards, Imagens e Lacunas, mantendo IDs/eventos originais.
- **Drive:** preservado o módulo de sincronização contínua autorizado da V299, sem modificar tokens, intervalos ou ações.
- **Manifesto:** versão/home/portal rearmonizados, pois o manifesto V299 declarava V299 porém apontava para V298.
- **Segurança:** não altera dados locais/privados, SRS, cartões, módulos didáticos ou originais. V299 preservada para reversão.

# V299 — Drive automaticamente sincronizado durante sessão autorizada (19/11/2026)

- Sincronização periódica a cada 5 minutos na aba aberta e visível, após autorização expressa OAuth de leitura e escrita pelo usuário; ativação automática em visitas futuras após nova autorização.
- Indicador compacto “Automático ligado”, “aguardando autorização” ou “reconectar Drive”; não exibe estado verificado se sessão vencer.
- Não há sincronização em segundo plano com o site fechado: GitHub Pages não possui servidor privado para manter/renovar credenciais. Não guardar access token, refresh token ou credenciais em localStorage, cookies, GitHub ou arquivos públicos.
- Utiliza a API existente BM239DriveGlobal.sync para PDFs, imagens, Controle, lacunas e grifos, preservando bloqueios de conflito, política de comparação SHA-256 e autorização exigida. Não modifica Banco Mestre canônico, cartões, 11 módulos, SRS, PDFs originais nem dados anteriores.
- V298 íntegra em v298.html; verificações estáticas após publicação; fluxo OAuth real exige homologação no navegador autenticado.

# V298 — CSS unificado em bundle e tipografia mobile (19/11/2026)

- **29 → 16 folhas CSS externas**: 15 folhas consecutivas V278–V297 agrupadas fielmente em arquivo único, preservando ordem e arquivos de origem.
- Aprimoramentos de tipografia, contraste dos botões, filtros de imagens e alvos de toque de 40px.
- Testes em navegador Chromium planejados no CI em 1366px e 390px, sem autorização privada.
- V297 intacta para reversão. Dados dos cartões, 11 módulos, SRS, PDFs, imagens, grifos, OAuth e SHA-256 inalterados.
- A consolidação não remove declarações históricas, apenas diminui carregamentos; auditoria semântica adicional permanece possível.

# V297 — Auditoria de contraste e leitura mobile (19/11/2026)

- **Imagens:** não forçar letras escuras em botões de fundo azul; botões primários mantêm texto branco.
- **Cartões:** estilo neutro aplica-se ao identificador, não às pílulas funcionais; botões com estados primário/perigo preservados.
- **Mobile:** título do cartão 16 px, conteúdo 15 px, frente do leitor 18,5 px e 11 módulos 15 px.
- **PDFs:** instrução obsoleta para usar botão removido foi corrigida; 78 PDFs e o bloqueio de integridade permanecem.
- **SHA:** melhoria somente de quebra de linha dos diagnósticos; nenhum cálculo ou ponteiro alterado.
- **Reversibilidade:** `v296.html` e CSS V296 continuam intactos; V297 usa uma única folha final de CSS que substitui a V296. Testes autenticados e visuais no navegador ainda pendentes.

# V296 — Sistema visual unificado em todo o Banco Mestre (19/11/2026)

- **Título dos cartões preto forte**: #101820, 16 px, peso 700, fundo branco, borda quadrada.
- **Conteúdo dos 11 módulos**: #111a22, 15 px. Títulos auxiliares e botões azuis escuros, secundários cinza legível.
- **Escala do portal**: mesmo padrão de Segoe UI, superfícies brancas e azul funcional em Assuntos, PDFs, Imagens, Lacunas, SRS, Controle, popups e Redação. Não alterar informação técnica ou semântica de estados.
- **Excluir imagens**: clicar em **Abrir no Drive** e usar **Mover para a lixeira** no Google Drive. Não há mais solicitação de permissão de gerenciamento/exclusão dentro do portal; a conta é a mesma usada para ler os originais.
- A antiga comparação SHA-256 permanece bloqueante quando as assinaturas divergirem; verificação de integridade não foi bypassada.
- Versões anteriores arquivadas. Nenhuma modificação de cartão/ID/SRS/Drive/arquivo foi realizada durante o deploy.
- Auditoria de classes, scripts, links e CSS, sem homologação em navegador real autenticado.

# V295 — PDFs padronizados, diagnóstico de SHA privado e lixeira de imagens (19/11/2026)

- PDFs: barra de ferramentas com linha de ações, busca e filtros prioritários, categorias secundárias e listagem em cartões com bordas retas, texto mais escuro e elementos responsivos.
- Comparador Drive × GitHub: ao receber SHA divergente, agora calcula SHA-256 sobre **bytes exatos** do arquivo (ArrayBuffer) e mostra ponteiro, versão, ID, SHA esperado e calculado. O erro permanece **bloqueante**: não tenta corrigir ponteiro, importar dados ou modificar SRS. Correção da origem só após auditoria efetiva dos arquivos do Drive.
- Imagens autenticadas: botão **Mover para lixeira** por imagem, sem DELETE permanente. Dupla confirmação quando vinculada a cartões. Solicitação específica do escopo OAuth de gerenciamento somente ao clicar; verificação de integridade do original, permissões `canTrash`, pasta autorizada e estado atualizado; só então `files.update` com `trashed:true`. O catálogo é atualizado após confirmação do Drive; os vínculos dos cartões não são apagados. Possíveis bloqueios de permissão OAuth devem ser resolvidos no Google.
- Somente código e estilos foram publicados, **nenhum arquivo foi movido para a lixeira** durante o deploy. Base, PDFs, imagens, grifos, IDs, SRS, 11 módulos e vínculos mantidos. V294 preservada.
- Compilação de JavaScript e verificações estáticas concluídas; ainda não houve teste interativo autenticado no navegador.

# V294 — Fonte maior e quase preta nos cartões (19/11/2026)

- Pedido: letra maior e mais escura na grade de Flashcards e na exibição integral do cartão.
- Grade: enunciado ~15,5 px, textos auxiliares do cartão 14,5 px; #101820 como texto principal; etiquetas e metadados separados em tons mais legíveis.
- Leitor ampliado: pergunta 19 px; conteúdo dos 11 módulos 15 px, títulos 14,5 px, tabelas 14 px, metadados 12,5 px. Fundo branco e bordas quadradas, azul apenas para elementos de navegação e títulos.
- Somente nova folha de estilos; nenhum script foi alterado. IDs, respostas originais, 11 módulos, SRS, Drive, PDFs, imagens, grifos, históricos e sincronização preservados.
- V293 mantida em `v293.html` para reversão; testes estáticos, sem validação visual em navegador real.

# V293 — PDFs compactos, cartões mais claros e filtros de Imagens organizados (19/11/2026)

- Removido da interface o botão duplicado **Verificar 78 PDFs**. Sua rotina interna e verificação automática permanecem. Barra PDF com menos espaços verticais.
- Cartões com fundo branco, perguntas em #18252f, informações secundárias escuras e detalhes/ações azuis. Contornos quadrados preservados.
- Popup de cartões com espaçamento menor, mantendo integralmente as **11 seções** e todas as respostas/explicações.
- Imagens: pesquisa acima dos filtros de disciplina, assunto geral, assunto específico e subassunto; tipo e ações em seguida. Nós e listeners existentes reutilizados; opções adicionais preservadas.
- Responsivo em desktop e celular. Sem alterar o SRS, Drive, IDs, grifos, figuras ou PDFs. Página anterior V292 mantida para rollback.
- Checagem de sintaxe e integridade dos scripts realizada; teste visual autenticado ainda pendente.

# V292 — Uma lógica tipográfica e de cores em todo o Banco Mestre (19/11/2026)

- Correção baseada na comparação visual feita pelo usuário com a interface Tec Concursos: o cabeçalho e o body precisam seguir papéis coerentes, não apenas compartilhar uma fonte.
- Escala tipográfica centralizada: cabeçalho 16 px, navegação 11,5 px, título de seção 16 px, subtítulos 14 px, conteúdo 13–13,5 px, metadata 11,5–12 px. Fonte Segoe UI em todas as áreas, inclusive Controle Shadow DOM e popups.
- Texto principal #1c2730 e títulos neutros #203440. Azul #1687d8 fica reservado principalmente a navegação, links e ações; secundários em #445967.
- Layout de coluna única, fundo cinza, cartões de alto contraste e bordas quadradas mantidos. Estados de alerta/erro/acerto, PDFs, gráficos e grifos preservados.
- Rótulos de versão que estavam desatualizados na interface foram corrigidos sem modificar fatos didáticos ou registros privados.
- Sem alterações em lógica de questões, filtros, IDs, SRS, Drive, sincronização e comparador. V291 disponível para reversão. Inspeção gráfica real ainda pendente.

# V291 — Contraste alto e bordas retas (19/11/2026)

- Texto principal #1c2730, perguntas #14212b e texto secundário #354653, com alta legibilidade.
- Cartões cinza-claro (#f5f7f8); módulos internos brancos; bordas retas sem cantos arredondados em painéis, formulários e popups.
- Preservados o comparador Drive × GitHub da V290, SRS, autenticação, conteúdos e 11 módulos. Sem alterar os grifos, imagens técnicas, PDFs ou estados semânticos.
- Publicação validada estaticamente; inspeção visual real do navegador pendente.

# V290 — Verificar diferenças Drive × GitHub sem sincronizar (19/11/2026)

- Na aba Flashcards, o botão anterior de sincronização privada é substituído por **Verificar diferenças Drive × GitHub**.
- O botão realiza somente GET de arquivos do Drive autenticado, lê o catálogo público, valida SHA-256 e apresenta os IDs novos ou divergentes; **não integra, grava, altera SRS nem publica nada**.
- Compara frente/verso, explicações, vínculos, os 11 módulos e as lacunas privadas identificadas por ID; preserva propostas não aprovadas fora do catálogo canônico.
- A ação de integração ao GitHub continua exclusiva do pedido no ChatGPT; a versão V289 permanece como rollback.
- Checagem estática; teste real no navegador com OAuth ainda pendente.

# V289 — Correção dos painéis de PDFs, Assuntos, Lacunas, SRS e Imagens (19/11/2026)

- Motivo: os seletores genéricos da V288 cobriam os cartões, mas não todos os componentes próprios das demais telas. A V289 usa os seletores efetivos inspecionados nos scripts/folhas originais.
- **PDFs:** barra `bm210PdfToolbar`, botões, filtros e área de resultados em branco com texto legível e bordas discretas.
- **Assuntos:** atalho de Fórmulas `bm246-formula-shortcut`, áreas, agrupamentos `v036-topic-*` e filtros padronizados.
- **Lacunas:** a estrutura `bm242-shell`, sem `.panel`, recebe painel branco, campos, fichas e botões coerentes.
- **SRS:** a estrutura autônoma `c141-*` recebe superfícies, métricas e tabela com a mesma linguagem visual, preservando sinais de atraso e planejamento.
- **Imagens:** barra `bm209SyncBar.bm210ImageToolbar`, seletores `bm155Field` e catálogo recebem espaços, cores e tipografia no padrão.
- Estilos adicionados após V288, sem mudar scripts, dados, SRS, grifos, PDF canvas ou pranchas. V288 preservada para retorno; visual real ainda pendente.

# V288 — Cartões brancos e superfícies padronizadas (19/11/2026)

- Fundo da página cinza (`#edf0f1`), cartões brancos e bordas cinza-azuladas com sombra discreta; texto dos cartões `#2b3f4d` para maior legibilidade.
- Ajustes restritos a superfícies e filtros: Assuntos, PDFs, Imagens, Flashcards, Lacunas, Planejamento SRS, leitores e Controle isolado. Sem segunda coluna.
- Preservados os estados de erro, prazos, planejamentos e grifos, além das imagens, canvas e fórmulas técnicas. Nenhuma alteração nos dados, IDs, 11 módulos, SRS, Drive ou sincronização.
- V287 disponível para reversão. Verificações estáticas executadas; homologação visual real pendente.

# V287 — Azul em todo o portal e textos de cartões mais escuros (19/11/2026)

- Mesmo padrão visual (Segoe UI e azul #1687d8) em Assuntos, PDFs, Flashcards, Imagens, filtros, controles e janelas. O Controle de Estudos recebe ajustes finais na camada isolada Shadow DOM.
- A cor do texto de perguntas, respostas, explicações e módulos foi escurecida levemente para #2b3f4d, preservando o fundo branco e os títulos azuis.
- Mantidos os significados de alerta e planejamento, as cores de grifo, os documentos e as figuras técnicas; sem modificação de conteúdos, SRS, integração Drive ou contadores.
- A V286 permanece acessível como reversão. Validações estáticas e leitura dos arquivos publicados; teste visual real ainda pendente.

# V286 — Fonte única e azul no site inteiro (19/11/2026)

- Todo o body, cartões, popups e Controle de Estudos utilizam a mesma família de fontes do cabeçalho: Segoe UI, Arial e system-ui. Sem carregamento externo.
- Abas selecionadas, botões primários, elementos de seleção, ícones, calendário e marcadores de estudo realizado em azul. Planejamentos em âmbar, perigos em vermelho, conteúdos matemáticos e diagramas técnicos preservados.
- A interface do Controle está em Shadow DOM; novo estilo é anexado após os eventos de montagem V252/V253, sem monitor permanente.
- Mantida integralmente a V285, inclusive seu complemento de sincronização, cartões e SRS; layout V284 de coluna única preservado.
- Verificações estáticas concluídas; teste visual real e OAuth pendentes.

# V285 — Sincronização privada de cartões e lacunas (19/11/2026)

- Mantém integralmente o layout V284, todas as páginas e CSS; botão adicional na aba Flashcards.
- Após autenticação Google pelo titular, verifica o ponteiro operacional mais recente e SHA-256 da base privada; os conteúdos privados são carregados somente nesta sessão.
- Preserva os versos públicos e o SRS. Atualiza 11 módulos por ID nos cartões PETRO23 afetados e adiciona os IDs ainda ausentes apenas ao navegador autenticado.
- Concilia o delta PETRO22 de três lacunas na base privada do Drive, com proteção contra conflito e verificação de retorno.
- Os arquivos JSON privados, SRS e histórico nunca são publicados no GitHub. Sem autenticação, a base pública da V284 permanece intacta.
- Teste real do OAuth depende de autenticação do proprietário; não afirmar que a mesclagem remota já ocorreu.

# V284 — Cabeçalhos compactos e azul no corpo (19/11/2026)

- Ajuste pontual no **body**: cabeçalhos H2 de páginas mais compactos, menor espaçamento entre título, descrição e controles; subtítulos com o mesmo azul da identidade adotada; cartões com títulos ligeiramente mais discretos.
- Mantida a coluna inteira e o fundo cinza da V283, botões principais azuis, tipografia e layout mobile.
- Sem ajustes no cabeçalho superior, no posicionamento dos filtros, no funcionamento de popups, nas figuras técnicas ou no conteúdo original.
- Cartões, 11 módulos completos, referências, PDFs, grifos, SRS e Drive preservados.
- Testes estáticos e conferência de arquivos publicados; renderização real pendente.

# V283 — Retorno à V281, com fundo cinza, azul e popups uniformes (19/11/2026)

- **Solicitação:** o layout de duas colunas V282 não agradou. Retornar à coluna inteira V281 e manter seus filtros, conteúdo, tipografia e espaçamento.
- **Implementação:** arquivo `v283.html` derivado de `v281.html` diretamente, sem CSS/script da V282; fundo cinza-claro e cor de destaque azul em lugar do verde.
- **Janelas popup:** estilos uniformes para leitor de flashcards, PDFs, imagens, diálogos de edição, diagnóstico e modais do Controle de Estudos (Shadow DOM). As cores técnicas desenhadas nas páginas/pranchas e paletas de grifo não foram adulteradas.
- **Responsividade:** permanece a versão de uma coluna V281 em desktop/celular; ajustes tipográficos para janelas pequenas sem alterar ações.
- **Integridade:** IDs, 11 módulos, frente/verso, complementos, SRS, Drive, PDF, Atlas, grifos, cronômetro, conteúdos e versões V281/V282 intocados.
- Validação de código e referências; **teste visual em navegador real e OAuth autenticado pendentes**.

# V282 — Layout do body com composição semelhante à captura Tec Concursos (19/11/2026)

- Corpo do portal com faixa 'Meus Estudos', coluna principal ampla e faixa lateral estreita, no desktop. Painéis brancos de cantos discretos, espaçamento pequeno, fundo cinza-claro e links azuis.
- Home: áreas de estudo apresentadas em linhas leves, como a lista de cadernos da referência; assuntos abaixo na mesma lógica. As bibliotecas PDFs/Flashcards/Imagens recebem a mesma composição. O leitor técnico de assuntos, modais de cartões e PDFs ampliados não são estreitados.
- Lateral: atalhos operantes para as outras abas, orientações e avisos verificáveis. Nenhum caderno, resultado de estudo, progresso ou calendário foi inventado.
- A atualização é visual e aditiva: mantém nós originais, campos, handlers, filtros por ID, cartões, 11 módulos didáticos completos, SRS, grifos, originais Drive e versões históricas.
- V281 preservada para reversão; homologação real em desktop/celular e OAuth não executada.

# V281 — Ordenação explícita por ID e padronização do conteúdo (19/11/2026)

- Dois seletores permanentes na barra dos Flashcards: **Ordenar por ID** (decrescente, crescente, original) e **Últimos cartões** (todos, 10, 25, 50, 100, lote de 15 novos V274/V276). Ordenação decrescente padrão. Inclusões históricas sem data por cartão usam ID como aproximação; não confundir cartão antigo enriquecido com recém-criado.
- Seleção dos últimos N ocorre entre resultados de busca/filtros existentes, usando o ID numérico mais alto, e depois é exibida na ordem pedida. Provisórios PROP-IJUI continuam separados das inclusões canônicas, mas aparecem ao escolher Todos e ordem por ID. Seletor carregado ANTES do invólucro da grade V191, para evitar desenhar o catálogo completo e depois redesenhar.
- Conteúdo com padrão editorial uniforme em páginas, painéis, leitores e módulos: títulos, subtítulos, respostas originais, seções, listas, tabelas e fontes. Nenhum texto eliminado ou condensado. Todo complemento permanece disponível; 11 módulos íntegros.
- Não se editam cartões/IDs, SRS, avaliações, Drive, PDFs, grifos, Atlas, figuras técnicas, versões anteriores. V280 como retorno.
- Validações automáticas estáticas e de ordenação; homologação visual em navegador autenticado pendente.

# V280 — Interface azul/grafite e filtros simplificados (19/11/2026)

- Referência estética: imagem do Tec Concursos, com barra grafite, navegação pequena, links azuis, superfícies brancas e fundo cinza-claro, sem reproduzir marcas ou anúncios.
- Busca e últimos cartões continuam visíveis. Filtros secundários recolhidos sob 'Mais filtros', mantendo os mesmos elementos, IDs, valores e eventos.
- Nas páginas Assuntos, PDFs, Flashcards e Imagens, a informação auxiliar também permanece acessível sem poluir a vista inicial; no Controle, aplica-se apenas a paleta no Shadow DOM.
- Todos os complementos originais, 11 módulos didáticos, SRS, cartões/IDs, PDF, imagens, grifos e Drive mantidos integralmente. V279 preservada como rollback.
- Validação estática; navegação real e OAuth privado não homologados.

# V279 — Últimos cartões e leitura sem repetição desnecessária (19/11/2026)

- Aba Flashcards recebe seletor **Adicionados recentemente**: últimos 10/25/50/100 e lotes confirmados V274/V276 (15 cartões). Permite combinar com filtros de disciplina, assunto e busca.
- Ordem confirmada por lançamento V276 e V274; para cartões mais antigos sem data de inclusão publicada, ordenação por ID decrescente é apenas **aproximação**. Cartões atualizados (CARD-0578, CARD-0924, CARD-1413) não são falsamente tratados como novos; fichas PROP-IJUI não entram nos recentes canônicos.
- Leitor único: quando possível, a grade e o leitor compartilham o carregador de módulos; grupos complementares anteriores ficam fechados por padrão para cartões que já apresentam 11 módulos, mas continuam presentes e podem ser expandidos.
- Nenhuma mudança de conteúdo, SRS, histórico, PDFs, grifos, Drive ou IDs. V278 preservada. Teste estático feito; validação de navegador real/OAuth pendente.

# V278 — Ícones de interface simplificados (19/11/2026)

- Ícones SVG da interface com traços de 1,35 e dimensões contidas (15–16 px); caixas decorativas menos chamativas.
- Solicitação de glifos monocromáticos nos símbolos de texto, quando suportada pelo navegador.
- Mesmo CSS aplicado à interface encapsulada do Controle; sem biblioteca, fonte, imagens ou mudanças de scripts de dados.
- Figuras técnicas, 11 módulos, IDs, cartões, SRS, PDFs, grifos e dados do Drive preservados.
- Página `v278.html`, versão anterior `v277.html` preservada. Validado estaticamente; inspeção real de navegador pendente.

# V277 — Conciliação do estudo Petrobras 22: cartões relacionados (19/11/2026)

**Contexto de concorrência:** PR #47 já havia publicado V276 com CARD-1534 (novo), CARD-1413 (reforço térmico) e um mecanismo próprio de 11 módulos. O PR #48 concorrente também tentava integrar CARD-1534, sendo conflitante. A V277 NÃO replica o cartão ou modifica os recursos da V276: contém somente o delta didático ainda ausente, CARD-0578 e CARD-0924.

**Fonte privada:** reconciliadas duas variantes distintas V165, ambas válidas em aspectos diferentes. A versão apontada como atual continha 1.533 cartões, 39 questões e 1.518 SRS, além do reforço CARD-1413; a segunda variante continha complementos V165 integrais para CARD-0578 e CARD-0924. O snapshot privado V166 foi obtido preservando os 39 registros de questões, o CARD-1413, CARD-1534 e todos os outros 1.531 cartões, acrescentando apenas os aprofundamentos dos 2 cartões relacionados nos seus 11 módulos, sem alterar frente, verso, originais nem SRS. Fonte V166 mantida exclusivamente no Google Drive privado; identificadores privados não devem constar de arquivos públicos. O manifesto privado de fonte passou a V002, mantendo V001 para auditoria.

**Projeção pública:** `assets/v277_petro22_relacionados_cards.json` contém explicações incrementais de CARD-0578 e CARD-0924, sem substituir as explicações anteriores; `assets/v277_petro22_relacionados_layers.json` apresenta 11 módulos técnicos por ID, omitindo as informações administrativas privadas da versão completa. O leitor evolutivo compartilha o roteamento por ID `assets/v276_layers_bridge.js`; o leitor direto foi adaptado somente nesses dois IDs. O catálogo permanece único, com 1.533 cartões canônicos + 22 propostas editoriais pré-existentes = 1.555 fichas. Nenhum cartão novo foi criado na V277 e nenhum evento SRS foi lançado.

**Salvaguardas:** O portal GitHub Pages e os dados do Google Drive continuam separados por privacidade. Arquivos originais V194/V267/V274/V275/V276 e variantes V165 foram conservados. Teste estático `tests/v277_petro22_relacionados.test.cjs` inclui contagens, módulos, ausência de duplicações, preservação dos conteúdos V276 e ausência de relatos/dados privados. Leitura no navegador real, comportamento de cache/CDN e OAuth não foram homologados por esse teste.

---

# Portal V275 — Biblioteca única sem separação por concurso (19/11/2026)

A pedido do estudante, as 22 fichas originadas do estudo de Ijuí passam a ser apresentadas na **mesma biblioteca** dos 1.532 cartões canônicos, classificadas por disciplina **Legislação** e pelo assunto real da lei, sem subgrupo exclusivo «Ijuí — legislação FUNDATEC», sem contagem destacada «+22 Ijuí» no cabeçalho e sem isolamento no início da listagem. Total da biblioteca de estudo: **1.554 fichas únicas**.

**Integridade/PMS-1:** Os 22 registros da fonte `assets/ijui_flashcards_operacionais_v027.json` possuem IDs estáveis `PROP-IJUI-...` e `canonical=false`. Os antigos IDs candidatos CARD-1430..1451 estão ocupados; não foi autorizada uma migração canônica nem criação de IDs, e esses itens continuam em validação editorial. A ficha aberta conserva a identificação da origem e não cria revisão SRS. Todos os 1.532 cartões canônicos, 11 módulos, adendos V267/V274, PDFs, imagens, SRS, Drive privado e o histórico de versões permanecem intactos.

**Implementação:** `index.html` e `v275.html` (entrada e rollback); `assets/version.json` (metadados de contagem); teste `tests/v275_catalogo_unico_ijui.test.cjs`. É uma unificação visual/de navegação com disciplina e assuntos comuns, não um ato de integração de propostas à base privada.

---

# Banco Mestre V274 — Sincronização técnica Drive V164 → GitHub (19/11/2026)

- **Fonte confirmada:** snapshot privado V164, hash SHA-256 `fed9209436b2cc89e2d067bc53b55253b5153a2bc2fc8ee392e0b025cdeb44b8`, 1.532 cartões, 36 questões, 13 imagens, 1.518 registros SRS. Fonte original e histórico no Drive preservados, sem escrita no snapshot.
- **Publicação incremental:** `assets/cards_drive_sync_v274.json` com CARD-1520..CARD-1533 (14 novos IDs, já integrados no privado) e explicações técnicas de 9 IDs existentes: CARD-0022, 0097, 0269, 0432, 0500, 0603, 0917, 1049, 1413. Arquivos V194 inalterados.
- **11 módulos:** `assets/layers_public_v274_sync.json` traz 11 módulos para 39 cartões: 25 cartões já evoluídos na linhagem privada V162 mais 14 novos da V164. O leitor consulta o incremento para esses IDs e mantém V194/V199 para os demais. Foram tratadas 4 passagens com indicadores de relato/pessoal, mantendo os originais intactos no Drive; a cópia pública não é arquivo privado integral.
- **Contagens:** 1.518 IDs históricos V194 + 14 novos V274 = 1.532 cartões publicados (1.515 ativos, 17 inativos); mais 22 registros de Ijuí = 1.554 entradas exibidas. Os 19 adendos V267 modificam IDs existentes e não acrescentam cartões. ID CARD-1499 permanece reservado.
- **Privacidade:** não publicar os 36 registros de questões do privado, SRS, relatos literais, avaliações, metadados administrativos, documentos privados ou imagens privadas. Somente campos técnicos visíveis no portal são sincronizados. Não pressupor atualização automática: esta é publicação pontual.
- **Arquitetura preservada:** GitHub Pages continua hospedando site e dados técnicos públicos; Drive continua canônico e privado; nenhum Google Apps Script/migração.
- **Reversibilidade:** `v273.html` e todos os JSONs V194/V267 permanecem disponíveis; módulos V274 são overlay versionado. Teste de integridade `tests/v274_drive_sync.test.cjs`; validação OAuth e navegador real continua pendente.
- **Metodologia PMS-1:** 33 decisões, frequência do índice, aprovações, originais, 11 módulos, eventos/calendário SRS e trilha de autoria não alterados.

---

# Banco Mestre V273 — Taxonomia das versões e contagens sem confundir origens (19/11/2026)

- **Publicação proposta:** `index.html`, `v273.html`, `assets/version.json`; V272 permanece intacta para reversão. Não há alteração em flashcards, PDFs ou SRS.
- **Motivo:** V272 indica interface; base pública V194, seus 19 adendos V267, registros Ijuí, snapshot canônico privado e índice privado seguem trilhas de versão distintas. O arquivo `estudos_incrementos_v267.json` contém versão interna V267, não V269; o bug da validação foi corrigido na V272.
- **Contagem publicada:** 1.518 cartões da base V194 (1.501 ativos, 17 inativos) + 22 registros Ijuí = 1.540. Os 19 adendos V267 não são novos IDs, não elevam essa soma e não indicam calendário de revisão SRS.
- **Interface:** novo aviso expansível na aba Flashcards e atualização de cabeçalho/rodapé. A seção explica as famílias «interface», «cartões públicos», «adendos», «Ijuí», «base privada», «índice», «lacunas» e «SRS» sem revelar IDs privados no HTML público.
- **Atualização da Metodologia Mestre:** adendo operacional de 19/11/2026 no documento privado ID `1HXpal_7FFV4_yJsvfhEAEKpB36ym4LEzpb4t1PXHmcc`, consolidando as regras de nomenclatura. O índice operacional V166 deriva da base privada V162 (1.524 cartões), enquanto o snapshot privado V164 confirmado registra 1.532; a defasagem exige consultar incrementos, e a regra de 50 cartões para consolidação segue inalterada.
- **Lacunas dos chats:** registro em Docs ou no snapshot privado não comprova sincronização com o cadastro operacional V242, que possui storage/OAuth próprios. Nunca anunciar integração ou SRS sem comprovante técnico.
- **Integridade:** original V272 conservado; 33 decisões PMS-1, IDs, 11 módulos, histórico, fonte canônica, autoria, PDFs, lacunas e SRS não são alterados pela atualização editorial.
- **Validação:** inspecionar HTML/manifesto, contrato de contagem e integridade do leitor após publicação; testes com navegador e OAuth do usuário permanecem pendentes.

---

# Banco Mestre V272 — correção do carregamento dos cartões públicos (19/11/2026)

- **Falha relatada:** `Falha ao carregar cartões: Incrementos V269 inválidos`.
- **Causa comprovada:** `index.html` / `v271.html` procuravam o arquivo `assets/estudos_incrementos_v267.json`, mas exigiam incorretamente o valor `V269-PETRO17-PETRO20` no campo `version`. O JSON efetivamente publicado tem `version=V267-PETRO17-PETRO20` e 19 adendos.
- **Solução publicada:** `v272.html` e `index.html` validam o valor real V267, com contagem de 19 adendos e validações anteriores de IDs; os rótulos do carregador foram ajustados de V269 para V267. O leitor de 11 módulos já tinha a validação V267 correta.
- **Auditoria direcionada:** arquivos de 7 lotes públicos totalizam 1.518 IDs únicos (1.501 ativos); todos os 19 incrementos possuem IDs únicos e apontam para cartões existentes/ativos. Conjunto de 22 cartões Ijuí separado e contador de publicação 1.540 preservados.
- **Proteção:** nenhum registro V194/V267, ID, 11 módulos, frente, verso, SRS, PDF, grifo, imagem, Drive ou base privada foi alterado. V271 fica disponível para rollback.
- **Status de validação:** análise de conteúdo publicado e testes locais de contrato aprovados; teste de navegação real do titular pendente.

---

# Banco Mestre V271 — Títulos legíveis dos PDFs encontrados no Drive (19/11/2026)

- **Página de publicação:** `gh-pages/v271.html` e `index.html`; manifesto em `assets/version.json`. `v270.html` e módulos V269 continuam preservados para rollback.
- **Mudança:** arquivo `assets/v271_pdfs_progressive.js` melhora apenas títulos **visuais** da biblioteca para PDFs descobertos por OAuth: separa palavras, remove sufixos de digitalização identificáveis, respeita siglas e aplica acentuação comum quando segura. O nome original permanece visível e pesquisável, assim como o título padronizado. O leitor recebe o título visual sem alterar o ID.
- **Preservação:** não renomeou, moveu, copiou nem alterou PDFs ou permissões no Google Drive; sem alteração de hash, vinculação de grifos, categorias do catálogo de 78, imagens, cartões, ID, versões, 11 módulos e SRS.
- **Indicador:** o valor 1.540 refere-se a soma de **1.518 registros públicos + 22 de Ijuí**, e não ao total privado de cartões sincronizados nem ao SRS. O cabeçalho continua com a ocultação visual de indicadores aprovada na V270.
- **Verificação:** JavaScript compilado sem erro e seis casos automáticos de nomes/imutabilidade passaram. Varredura OAuth e aparência no navegador autenticado ainda requerem validação real; nenhuma sincronização de conteúdo foi executada.

---

# Banco Mestre V258 — Fórmulas com contexto textual preservado (18/11/2026)

- **Página ativa:** `v258.html`, por `gh-pages/index.html` e `assets/version.json`. Rollback: `v257.html`, preservada.
- **Correção:** texto explicativo que antecede ou acompanha equações deixa de ser interpretado como identificadores matemáticos; fórmulas isoladas continuam em MathML com frações verticais e índices. Linhas com várias expressões são separadas visualmente quando seguro.
- **Fonte canônica:** Guia de Fórmulas no Google Drive permanece intacto, assim como 11 módulos, lacunas, autoria, dados privados, cards e SRS.
- **Auditoria:** 128 linhas inicialmente classificadas como equação; 96 reorganizadas e 32 mantidas no renderizador anterior. Seis testes unitários em DOM simulado passaram; HTTP público, navegador real, OAuth e sincronização continuam pendentes de homologação separada.
- **Arquivos:** `assets/v258_math_refinement.js`, `assets/v258_math_refinement.css`, `tests/v258_math_refinement.test.cjs`. Log: `docs/V258_FORMATACAO_MISTA_FORMULAS_2026-11-18.md`.

---

# Banco Mestre V244 — Biblioteca de Lacunas integrada (18/11/2026)

- **Versão principal:** `v244.html`, acionada por `index.html` e `assets/version.json`. A V242 permanece disponível em `v242.html` como retorno seguro.
- **Escopo integrado:** aba nativa **Lacunas** (pesquisa, registro de questões, origem do erro, relato literal do estudante, diagnóstico independente do assistente, filtros hierárquicos reais, origem/fonte/histórico, cartões relacionados); ponte entre Controle de Estudos e Lacunas; cartão original `PETRO14-C014` no leitor V165 em 11 módulos com pergunta visível e resposta oculta até revelação; sem lançamento SRS automático.
- **Drive:** botão global da V242 substituído na V244 por camada que inclui sincronização privada de lacunas, snapshots de recuperação verificados antes de gravar e backups rotativos (30 datas diárias, 12 competências mensais), sem misturar dados privados ao GitHub.
- **Teste verificado nesta integração:** montagem integral do HTML a partir da fonte V062 reproduzida em ambiente controlado, 123 scripts externos (biblioteca de diagnóstico incluída), leitor único sem duplicação, dependências carregadas na ordem correta; SHA dos arquivos publicados conferido no GitHub, manifestos e homepage encaminhando para V244.
- **Atenção:** **testes de navegador público, OAuth real de Drive, restauração interdispositivos, visuais no celular/computador e atomicidade concorrente ainda pendentes**. Integração no site ≠ sincronização do Drive comprovada. Não certificar estes itens sem evidência.
- **Preservação:** frontend V242, cronômetro de rodapé, cartões públicos V194, ID das lacunas, fontes, SRS, PDF, Atlas, Grifos e documentos canônicos não foram substituídos. O PR #34 permanece histórico e não deve ser mesclado cegamente, pois os arquivos próprios da prévia foram publicados separadamente.
- **Rollback:** o arquivo `v242.html` está preservado; os SHAs anteriores de `index.html` e `assets/version.json` estão na história GitHub (respectivamente `bde35766ef147afbf06bc88957b5e98c8c958ed6` e `6ecb1955f8caab2170ab52e5fc0a65d29dcf4c83`).

---

# Banco Mestre V242 — cronômetro fixo no rodapé (18/11/2026)

- **Versão publicada:** `v242.html` por `index.html` e `assets/version.json`, preservando `v241.html` e versões anteriores.
- **Mudança:** a mesma barra do cronômetro foi deslocada do cabeçalho para a borda inferior fixa do navegador, permanecendo visível ao rolar a página. Espaço de conteúdo ajustado à altura real do rodapé para não ocultar formulários, com ajustes de celular e áreas seguras.
- **Funcionalidade preservada:** matéria, conteúdo, iniciar/pausar/continuar/salvar/descartar, nova matéria, histórico de sessão única, tempo na aba/favicon, dados locais e sincronia já existente.
- **Integridade:** não alterados cartão canônico, SRS, PDFs, grifos, imagens, bases e chaves de persistência. Sem comprovação de OAuth Google nem de transferência de relógio ativo entre dispositivos.
- **Testes:** 7 verificações estáticas + 8 testes Chromium, todos aprovados, inclusive rolagem fixa, compensação de espaço e ampliação da barra no celular.
- **Versão/LOG:** [PR #35](https://github.com/carlosemichelon/concurso/pull/35), merge `fb3469a8ad649e92c481cf7058940492cee40de5`.

---
# Banco Mestre V241 — Controle de Estudos, cronômetro de aba e indicadores auditáveis (18/11/2026)

- **Publicação:** código V241 integrado em `gh-pages` após aprovação explícita, preservando `v239.html` e anteriores. Entrada `index.html` e manifesto `assets/version.json` devem apontar para V241.
- **Página inicial:** `#controle-estudos` por padrão, com as rotas diretas `#pdfs`, `#imagens`, `#cartoes`, `#assuntos`, `#tema?...` e parâmetros profundos preservados. Corrigida disputa do bootstrap que inicialmente forçava `#assuntos`.
- **Cabeçalho:** ícones e indicadores menores, incluindo estado por PDFs, imagens, Controle, grifos, cartões/SRS; não equivale a confirmação de sincronização por catálogo.
- **Cronômetro:** matéria, conteúdo, iniciar/pausar/continuar/salvar/descartar e cadastro de matéria no cabeçalho; tempo líquido e título/favicone da aba refletindo a sessão única do Controle. Persistência local no relógio original `BM_CONTROLE_TIMER_V238`; histórico no `BM_CONTROLE_ESTUDOS_V238`.
- **Sincronização:** ferramenta tenta verificação dos módulos Drive; não pode declarar sucesso após divergência, ausência de permissão ou falha. Cartões canônicos/SRS não estão incluídos no botão. Cronômetro ativo transferido entre dispositivos e concorrência offline ainda não homologados.
- **Testes:** 6 testes de contrato + 6 testes em Chromium, incluindo navegador móvel, início/pausa/retomada/salvamento/recarregamento, página inicial e simulação de estados. Testes aprovados em [GitHub Actions](https://github.com/carlosemichelon/concurso/actions/runs/44332004736); novo ciclo após correção também aprovado. Simulação dos estados NÃO valida OAuth real.
- **Pendências:** testes OAuth no navegador do titular, leitura de volta autenticada de PDFs/imagens/grifos/Controle, dois dispositivos e colisões offline. Nenhum original, ID canônico, evento SRS ou backup foi modificado na promoção.
- **Origem e rastreabilidade:** [PR #33](https://github.com/carlosemichelon/concurso/pull/33), merge `3a2624bb64664f1fd171cb24b3cf610beab33937`. Documentação de homologação: `docs/V241_CRONOMETRO_CABECALHO_HOMOLOGACAO.md`.

---
# Banco Mestre V239 — Controle de Estudos como início e Drive central (18/11/2026)

- **Versão ativa:** `v239.html`, entrada `index.html`, manifesto `assets/version.json` na branch `gh-pages`. V238 e anteriores preservadas.
- **Página inicial:** o primeiro botão do menu é **Controle de Estudos**; acesso sem hash e sem deep link abre `#controle-estudos`. URL com `#assuntos`, `#cartoes`, `#pdfs`, `#imagens`, rota de assunto ou `?cartao=` conserva o destino explícito.
- **Layout:** indicadores compactos com ícones e descrições legíveis em desktop/celular. Atlas distingue **179 registros catalogados** de **originais únicos efetivamente consultados** no Drive, sem mostrar zero catalogado ao desconectar.
- **Drive:** botão central **Conectar e sincronizar Drive** compartilha leitura de Atlas, PDFs e miniaturas e tenta sincronizar grifos e Controle de Estudos em arquivo mestre privado. A permissão `drive.file` é solicitada no mesmo OAuth do botão, sem armazenar token no navegador em disco.
- **Controle de Estudos:** `controle-estudos-v239.html` preserva os dados locais em `BM_CONTROLE_ESTUDOS_V238`. Sincronizador `assets/v239_controle_drive_sync.js` usa conferência SHA-256, restauração cautelosa e cópia de recuperação, bloqueando divergências entre dispositivos; não considera prova de sincronização entre dispositivos sem teste real.
- **Limites:** sincronização do **SRS canônico**, respostas e alterações de cartões não é reivindicada; nenhum evento SRS foi produzido. PDF/imagem original não é regravado pelo sincronizador. Conexão, permissão de escrita, visualização OAuth, propagação de grifos e recuperação entre dispositivos precisam de testes autenticados no navegador do proprietário.
- **Auditoria feita:** HTML, sintaxe JS, referências, manifesto, versão e redirecionamento verificados; não há atestado de teste visual nem de deploy concluído sem consulta pública.

---

# Banco Mestre V227 — TRT C009: fundamentos, democracia e dois mapas (17/11/2026)

- **Versão ativa:** `v227.html`, derivada da `v226.html` com melhorias de apresentação de grifos e filtros TRT preservadas.
- **Cartão operacional:** `TRT01-C009`, fonte `TRT01-Q009`. Resposta original A incorreta; correta B, com erro na palavra "exclusivamente": art. 1º admite poder por representantes eleitos **ou diretamente**.
- **11 módulos completos:** lei seca integral dos arts. 1º–4º, arts. 14 e 127, cinco fundamentos (SO–CI–DI–VA–PLU), três Poderes, MP não é quarto Poder, integração cultural e não intervenção.
- **Duas imagens originais:** Drive Atlas ids `1w-o0i1uM-tA8TikcsPlRg08nV1VyqI36` e `1hBQSdoeqanyfSP8W32ND18neAJXj8SC-`, preservadas e vinculadas como imagens de cartão. Ressalva registrada para afirmação generalizada incorreta sobre eficácia limitada.
- **SRS:** nenhuma avaliação Errei/Difícil/Bom/Fácil foi informada; nenhum evento e nenhuma data de revisão criados. Base pública V194 de 1.518 cartões e SRS canônico F17 inalterados.
- **Grade TRT:** nove cartões operacionais, C001–C009. Checkpoint ZIP no Drive oficial: `1xOLMwRvd0W2bkcxSWaVp-z7sv3LXkZ3f`.
- **Limite:** teste em navegador com Google OAuth das imagens privadas permanece pendente. [Relatório V227](docs/V227_TRT01_C009_FUNDAMENTOS.md).

---

## V226 — Biblioteca de Grifos desativada na interface (17/11/2026)

- Publicação em `gh-pages/v226.html` com atualização atômica de `index.html`, `assets/version.json` e deste histórico; V225 preservada.
- Aba **Grifos**, a tela **Biblioteca de Grifos** e seus links internos `#grifos` ocultos. Acesso inicial direto a `#grifos` redirecionado a PDFs.
- Biblioteca mantém apenas a inicialização técnica necessária às rotinas de sincronização; nenhum grifo, PDF, metadado ou registro foi apagado do navegador ou do Drive.
- O **grifador e o painel dentro do PDF** continuam ativos, como também flashcards/SRS, imagens/Atlas e Drive.
- Verificações estáticas realizadas; teste visual no navegador autenticado pendente.

# Banco Mestre V224 — TRT01-C008, preâmbulo da CF/88 (17/11/2026)

- **Portal:** `v224.html`; V223 e melhorias anteriores preservadas. [Abrir cartão](https://carlosemichelon.github.io/concurso/?cartao=TRT01-C008).
- **11 módulos completos:** preâmbulo literal, pegadinhas "justiça social" e "direitos sociais e coletivos", STF ADI 2076, ADCT, elementos constitucionais e análise das alternativas. Questão TRT01-Q008: C marcada corretamente.
- **3 imagens originais:** verificadas no Drive Atlas, sem modificar originais ou torná-los públicos. Galeria vinculada por OAuth. Ressalvas corrigem imprecisão na imagem sobre ADCT e natureza normativa do preâmbulo.
- **SRS:** nenhum rating atribuído (Errei/Difícil/Bom/Fácil); F17 e 1.518 cartões canônicos permanecem inalterados, oito cartões TRT operacionais agora disponíveis.
- **Checkpoint:** ZIP com originais, resumo/questão/lei seca e manifesto salvo no Drive canônico, id `1Q1CTlIW1z9ABesCKNMWdB8VNhmB5ZaDH`. JSON de 11 módulos está no GitHub (referenciado no ZIP).
- **Status de autenticação:** teste real OAuth de visualização das imagens no navegador segue pendente. [Relatório V224](docs/V224_TRT01_C008_PREAMBULO.md).

---

# Banco Mestre V223 — TRT C007, autodeterminação dos povos (17/11/2026)

- **Portal ativo:** `v223.html`, V222 anterior preservada integralmente, inclusive melhorias da interface.
- **Cartão operacional:** `TRT01-C007`, fonte `TRT01-Q007`, Direito Constitucional. Alternativa B correta (art. 4º, III, da CF/88).
- **11 módulos completos:** lei seca literal dos arts. 3º e 4º, dez princípios de relações internacionais, quatro objetivos fundamentais, integração latino-americana no parágrafo único, análise das alternativas, ressalvas e mnemônicos.
- **Imagem original:** PNG dos objetivos e relações externas, verificada no Drive Atlas, id `1Qa4UlGm0Yc7fCGylRmch3xNO-gnh7QA_`, preservada e vinculada como imagem de cartão.
- **Checkpoint:** ZIP com imagem original, enunciado, manifesto e README, id `1sS5tnQaZTtYgVkznvjgPo4oICYQAxP75` no Drive, pasta oficial de Checkpoints. Texto integral do cartão no GitHub.
- **Grade de cartões TRT:** sete cartões operacionais separados da base pública V194; SRS F17 e os seis cartões anteriores preservados. Não há avaliação SRS atribuída à questão 007.
- **Limitação:** visualização OAuth da imagem no navegador do usuário ainda não testada.
- [Relatório V223](docs/V223_TRT01_C007_AUTODETERMINACAO.md).

---

# Banco Mestre V221 — TRT Parte 01, cartão 006 e imagem-macete (17/11/2026)

- **Portal:** `v221.html`; `v220.html` preservada.
- **Cartão operacional:** `TRT01-C006` da questão `TRT01-Q006`, gabarito A correto: contida (CF art. 5º XIII), limitada (art. 7º XI), limitada (art. 37 VII).
- **11 módulos completos:** lei seca literal, diferenças entre restringir/integrar, Lei 10.101/2000 e STF ADO 85, exemplos, pegadinhas e ressalvas. Vínculos cruzados a C001–C005 sem novas revisões indiretas.
- **Imagem original:** um PNG privado em Drive Atlas, id `1LoJnBAEfckAVHBdxCNPuT-IGSVhoReYg`; macete preservado com alerta de que expressões legais isoladas não são critério universal de eficácia.
- **Checkpoint:** ZIP e manifesto no Drive oficial de Checkpoints; imagem verificada por SHA-256 e CRC. Módulos integrais mantidos em JSON no GitHub.
- **SRS:** não foi informada classificação Errei/Difícil/Bom/Fácil; nenhum evento SRS criado, F17 canônico inalterado.
- **Integração:** política híbrida GitHub/Drive preservada; teste de OAuth de imagem real permanece pendente.
- [Relatório V221](docs/V221_TRT01_C006_EFICACIA_TRES_ARTIGOS.md).

---

# Banco Mestre V220 — TRT Parte 01, cartão 005 e 2 imagens (17/11/2026)

- **Versão ativa:** `v220.html`, mantendo `v219.html` intacta.
- **Cartão operacional aprovado:** `TRT01-C005`, questão `TRT01-Q005`; alternativa C correta. Onze módulos com lei seca, explicação, MI × MS × HD e duas imagens originais.
- **Mídias:** dois PNGs privados verificados na pasta Atlas canônica do Drive `1ksSVWrmRaRlDoG4iDtTGvfr2OnPnhnY6`. Vínculos nos metadados do cartão, sem publicar binários.
- **Checkpoint:** originais + manifesto + README em `TRT01_C005_CHECKPOINT_V001_2026-11-17.zip`, salvo na pasta oficial Checkpoints do Drive.
- **SRS:** nenhuma avaliação nova foi dada neste turno. Não houve gravação no SRS canônico F17 nem marcação de revisão cruzada dos cartões C001–C004.
- **Rastreabilidade:** [Relatório V220](docs/V220_TRT01_C005_MANDADO_INJUNCAO.md).
- **Limite da verificação:** publicação e exibição autenticada do Google Drive são auditorias distintas; o teste OAuth real ainda depende de navegação com a conta proprietária.

---

# Banco Mestre V218 — TRT01-C004, eficácia plena / direito de resposta (17/11/2026)

- **Cartão operacional:** `TRT01-C004` (questão `TRT01-Q004`), 11 módulos completos, enunciado reexplicado, art. 5º, V e §1º, ADPF 130 e Lei 13.188/2015; resposta original A incorreta, gabarito E.
- **SRS:** avaliação explícita **Difícil**, intervalo de oito dias e próxima revisão operacional **25/11/2026**. SRS F17 canônico não alterado.
- **Imagem:** original salvo e verificado no Drive na pasta Atlas canônica, id `1Ts7WCczYjI9hV-L1aqoue0Hm-v-UFVxU`; galeria de imagem do cartão usa autorização OAuth.
- **Checkpoint:** ZIP e índice SRS/mídia no Drive, pasta Checkpoints canônica. A cópia ZIP contém original e metadados, enquanto os 11 módulos permanecem no GitHub.
- **Portal:** `v218.html` (V217 preservada); 1.518 cartões canônicos preservados, PDFs, Atlas, rotas TRT C001–C003 e política híbrida não substituídos. GitHub Pages publicado; teste de imagem com OAuth real ainda pendente.
- [Relatório de auditoria V218](docs/V218_TRT01_C004_EFICACIA_PLENA.md).

---

# Banco Mestre V213 — Google Drive como fonte principal das imagens na V1 (17/11/2026)

- **Portal V1 preservado:** `v213.html` herda o layout da V212 e o leitor PDF, os cartões, grifos, SRS, bases e abas existentes. **V2 pausada** no PR #29.
- **Biblioteca de imagens:** após uma consulta OAuth válida, exibe diretamente os originais de duas raízes canônicas do Drive, inclusive os 93 arquivos que já tinham referências editoriais públicas; a deduplicação é por `fileId`, sem copiar imagens ao GitHub.
- **Alternativa:** botão `Ver catálogo salvo` permite consultar as 179 imagens públicas V198 se o Drive não estiver autorizado ou por escolha do usuário; o modo preferido é salvo somente como `drive`/`catalog` no navegador.
- **Acesso:** solicitação GIS `prompt:''` ao clicar em Conectar, evitando forçar consentimento repetido; o Google ainda pode pedir login/permissão. Tokens ficam somente em memória e não oferecem login persistente entre visitas. Para isso é necessário servidor seguro.
- **Atualização automática enquanto aberto:** varredura a cada 120 segundos na sessão válida, com reaproveitamento dos `Blob URLs` para arquivos não alterados. Não trabalha quando o site está fechado.
- **Testes:** sintaxe JS e bootstrap, alternância do visualizador, contagem sem soma duplicada e preservação dos IDs/cartões antigos; testes V213 aprovados em GitHub Actions. Login OAuth real, privacidade entre contas e abertura com arquivos privados no navegador do proprietário ainda precisam de homologação.
- [Relatório técnico V213](docs/V213_DRIVE_FONTE_PRINCIPAL.md). Backup do código: `backup/v212-before-v213-drive-primary-publish-2026-11-17`.

---

# Banco Mestre V212 — TRT Parte 01, eficácia contida com três imagens (17/11/2026)

- **Nova página:** `v212.html`; a V211 permanece intacta em `v211.html`, assim como a V210 em `v210.html`.
- **Cartão operacional aprovado:** `TRT01-C002`, fonte `TRT01-Q002`, art. 5º, XIII, da CF/88; resposta E incorreta, gabarito A. Eleven módulos didáticos com lei seca, ressalvas, análise das alternativas, enunciado reexplicado e ligação cruzada com `TRT01-C001`.
- **Imagens originais:** três PNGs no Drive, pasta canônica `1ksSVWrmRaRlDoG4iDtTGvfr2OnPnhnY6`, classificados como **imagem de cartão**. Galeria usa OAuth autorizado, preservando privacidade dos originais.
- **Checkpoint:** ZIP contendo três imagens byte a byte e manifesto SHA-256 na pasta `1348cILBcxFG9p2cfPJ3WubmHswPRbD24`.
- **Bases preservadas:** 1.518 cartões públicos V194, 179 imagens públicas V198, 78 PDFs V149; sem novos eventos SRS e sem gerar ID `CARD-XXXX` canônico até reconciliação da base privada.
- **Limite:** publicação no GitHub não comprova exibição autenticada no navegador do usuário. [Relatório V212](docs/V212_TRT01_C002_EFICACIA_CONTIDA.md).

---

# Banco Mestre V211 — TRT Parte 01, cartão com cinco imagens (17/11/2026)

- **Edição online:** `v211.html`, publicada na branch `gh-pages` com `assets/version.json.version=V211`; V210 preservada em `v210.html`.
- **Cartão operacional:** `TRT01-C001` da questão `TRT01-Q001`, 11 módulos e lei seca vinculada à Constituição Federal; cinco imagens originais classificadas como **imagem de cartão** e associadas aos IDs `TRT01-Q001-IMG01…IMG05`.
- **Drive:** todos os cinco originais verificados na pasta `1ksSVWrmRaRlDoG4iDtTGvfr2OnPnhnY6`. ZIP e índice do checkpoint salvos na pasta `1348cILBcxFG9p2cfPJ3WubmHswPRbD24`.
- **Exibição:** galeria no cartão usa sessão OAuth existente do site; links individuais abrem os originais no Drive. **Teste de exibição autenticada no navegador ainda pendente**; não declarar sincronização visual completa.
- **Bases preservadas:** cartão público V194 = **1.518 IDs** (1.501 ativos), Atlas público V198 = **179 imagens**, catálogo PDFs V149 = **78 documentos**; SRS inalterado. Cartão TRT operacional separado não soma à base canônica.
- **Norma metodológica:** página exata do PDF é opcional para vínculos jurídicos; norma, dispositivo e URL/fonte oficial permanecem necessários.
- **Relatório e rastreabilidade:** [V211 TRT01-C001](docs/V211_TRT01_CARTAO_CINCO_IMAGENS.md).

---

# Banco Mestre V206 — imagem à esquerda e edição à direita; SVG corrigido (17/11/2026)

- **Edição de imagens:** no computador, pop-up com imagem à **esquerda (44%)** e campos/abas à **direita (56%)**, largura máxima 640px e altura máxima 64vh. A área de campos tem rolagem interna. Em telas pequenas (até 590px), a imagem passa para cima por legibilidade. Continua um botão **Editar imagem**; **Mostrar cartão** permanece no cartão quando associado.
- **Correção da prévia SVG do Drive:** valida o arquivo como SVG/XML, aceita resposta de mídia com MIME genérico quando o Drive indica SVG e gera um `Blob image/svg+xml` de prévia em memória, removendo código ativo e referências externas. O original permanece no Drive e o SVG ainda não entra no grifador.
- **Arquitetura:** Drive como armazenamento dos originais, Atlas como interface didática. A cada 120 segundos enquanto o site permanecer aberto e autorizado pelo Google, atualiza a consulta privada de imagens; sem publicação automática de imagens no catálogo público GitHub.
- Pastas canônicas Drive, 1.518 cartões V194, 179 imagens públicas V198, 78 PDFs V149, checkpoints e SRS preservados.
- Validação estrutural estática: 86 JS e 75 CSS, sem faltas ou duplicados; **teste real de OAuth/SVG e disposição visual ainda pendente**.
- [Relatório V206](docs/V206_LAYOUT_LATERAL_PREVIA_SVG_SYNC_DRIVE.md).

---

# Banco Mestre V205 — imagens novas do Drive no Atlas (17/11/2026)

- **Causa corrigida:** a V204 mantinha os 179 registros do Atlas público em uma biblioteca e as imagens do Drive em uma grade isolada. O upload no Drive não fazia parte da navegação do Atlas.
- **Nova visualização:** um grupo **Google Drive · imagens novas no Atlas** aparece na organização da aba Imagens. Conecte o Google Drive para incorporar na sessão os arquivos privados não contemplados nas 179 imagens publicadas. A pesquisa geral também filtra esses itens.
- A V205 compara o `driveFileId` com as 93 imagens públicas recuperadas V180 e demais IDs Drive presentes no Atlas, evitando mostrar os mesmos arquivos duplicados.
- Formatos privados compatíveis: JPEG, PNG, WebP, GIF e SVG. SVG abre a fonte no Drive, sem suporte a grifos.
- **Permanente × sessão:** o Atlas público permanece em 179 registros; o grupo de imagens extras depende de OAuth da conta autorizada e não publica imagens privadas no GitHub Pages. Publicação permanente requer aprovação e atualização dos catálogos.
- Caminhos canônicos para novas imagens, checkpoints/ZIP e arquivos originais mantidos (contrato V202). Cartões V194, SRS e PDFs V149 intactos.
- Validação estrutural: 86 scripts e 75 folhas de estilo, sem arquivos ausentes ou duplicados. Scanner testado com duas raízes e imagens simuladas. OAuth e visualização real ainda pendentes.
- [Relatório da integração V205](docs/V205_ATLAS_INTEGRACAO_IMAGENS_DRIVE.md).

---

# Banco Mestre V204 — janela muito menor e imagem visível (17/11/2026)

- Pop-up de edição reduzido de 450 px / 74vh para **320 px / 56vh** (teto 500 px), com rolagem interna. No celular, altura máxima 68vh.
- A imagem **do próprio cartão** agora aparece no topo da janela, em quadro de 104 px com `object-fit: contain`; mantém proporção e não altera a origem. A prévia acompanha o carregamento assíncrono, inclusive de imagens privadas com OAuth.
- Mantida a janela única `Editar imagem`, com abas **Dados** e **Tipo e cartões**; o botão **Mostrar cartão** permanece na imagem quando houver vínculo.
- Os caminhos canônicos do Drive, o contrato de pastas V202, o Atlas V198, cartões V194, PDFs V149 e SRS permanecem inalterados.
- Validação estrutural estática: **86 scripts e 74 estilos**, todos presentes sem duplicados. Teste de navegador/OAuth ainda pendente.
- [Relatório V204](docs/V204_JANELA_MENOR_PREVIA_IMAGEM.md).

---

# Banco Mestre V203 — um só botão Editar imagem e pop-up compacto (17/11/2026)

- **Causa dos dois botões:** V202 inseria separadamente `Editar imagem` em `v202_atlas_editor_dialog.js` (dados/textos) e `v202_image_links_modal.js` (tipo/vínculos). Não eram dois arquivos de imagem, mas duas ações concorrentes.
- **Correção:** o cartão público possui apenas **um** botão `Editar imagem`. Sua **única janela** contém as abas **Dados** (título, descrição, assunto, favorito e visibilidade) e **Tipo e cartões** (Conteúdo/Cartão, função e IDs). `Mostrar cartão` continua visível junto à imagem quando houver vínculo.
- Para imagens privadas Drive que não têm editor textual do Atlas, a classificação é acessada por um único botão próprio.
- Pop-up menor: **450 px de largura máxima**, **74% da altura da janela** (teto 690px), rolagem interna e dimensões responsivas no celular.
- Nenhum original, tipo canônico V198, cartão V194, PDF V149, SRS ou pasta de Drive foi alterado. O contrato V202 de destinos continua vigente.
- V203 publicada na branch `gh-pages` como `v203.html`, com V202 preservada para rollback. **86 scripts e 74 CSS** referenciados, todos presentes, sem duplicação. Teste visual real pendente.
- [Auditoria e correção V203](docs/V203_EDITOR_UNIFICADO_POPUP_COMPACTO.md).

---

# Banco Mestre V202 — janelas de edição e pastas fixas (17/11/2026)

- A seção extensa **Tipo de imagem e cartões vinculados** saiu da face visível de cada imagem. Os botões **Mostrar cartão** e **Editar imagem** continuam disponíveis. O tipo Conteúdo/Cartão, função, IDs e evidência são editados somente em diálogo, sem reescrever a classificação V198.
- Título, área, assunto, descrição, observações, favoritos e ocultação/restauração também foram movidos para janela de edição. Edição de grifos/desenhos mantém o editor próprio.
- Contrato único de caminhos: `assets/v202_storage_contract.json`. **Novas imagens originais:** Drive `07 – Atlas de Imagens (sincronização)`, ID `1ksSVWrmRaRlDoG4iDtTGvfr2OnPnhnY6`; **novos ZIPs/manifestos de checkpoint:** Drive `Checkpoints Banco Mestre`, ID `1348cILBcxFG9p2cfPJ3WubmHswPRbD24`.
- Pastas históricas de imagens recuperadas e checkpoints permanecem disponíveis para consulta, mas **não** são destinos de novas gravações.
- Registro de checkpoint pelo site é limitado a **manifesto JSON**, verifica contrato/pasta/parents e relê o conteúdo. Envio do ZIP continua sendo etapa externa do ChatGPT/Drive e exige conferência do folder_id após upload. Nenhuma publicação GitHub implícita.
- A V202 utiliza `v202.html`, mantém V201 intacta para rollback, 1.518 cartões V194, 179 imagens editoriais V198, 78 PDFs V149 e SRS privado inalterado.
- Montagem estática: **86 scripts + 74 estilos**, sem faltantes ou duplicados. Teste visual do navegador e gravação real no Drive **pendentes**.
- [Relatório e metodologia V202](docs/V202_METODOLOGIA_IMAGENS_CHECKPOINTS_PASTAS_FIXAS.md).

---

# Banco Mestre V201 — caminhos e sincronização Drive ↔ site (17/11/2026)

- **Escopo confirmado diretamente:** 93/93 imagens recuperadas P11–P14 localizadas por ID, nome, MIME e pasta; **78/78 PDFs** do catálogo V149 existentes e com `application/pdf`; 7 PDFs de NRs/licenciamento já incluídos entre os 78.
- **Cartões:** cópia pública V194 de 1.518 cartões (1.501 ativos e 17 inativos) cotejada com arquivo privado V045 de 12/11/2026. IDs e 11 campos agregados coincidem; 1.518 registros SRS privados não são publicados. **Não há carregamento automático do XLSX/feed privado na página V201**: a fonte de cartões operacionais no site é o JSON GitHub V194, e novas alterações precisam de publicação auditada.
- **Imagens do Drive:** o módulo V201 consulta, sob OAuth somente leitura, a pasta do Atlas **e** a pasta de originais recuperados P11–P14, recursivamente, durante a sessão. Imagens SVG não entram automaticamente no editor: sua quantidade é informada. O painel foi tornado visível contra a regra CSS antiga `section{display:none}`. As 179 imagens catalogadas publicamente continuam estáticas, com URLs de arquivos do Drive; a consulta privada não publica novos originais no GitHub.
- **PDFs do Drive:** quatro raízes, incluindo DataBase_Concurso, Concursos–Engenharia Civil, NRs e Licenciamento; atualização por leitura autenticada na sessão, sem escrever catálogo público nem grifos. Mensagem de êxito não deve sugerir publicação.
- **Manifesto corrigido:** `sync` deixa de reivindicar atualizações automáticas de cartões por XLSX e registra o módulo legado separadamente; `pdf_sync` e `image_sync` refletem os caminhos efetivamente percorridos.
- **Limites:** sem verificação de OAuth e renderização em navegador real nem comprovação de deploy live; permissões do Drive, dados e originais intactos. A V200 está preservada para retorno.
- [Auditoria detalhada V201](docs/V201_AUDITORIA_DRIVE_GITHUB_SITE.md).

---

# Banco Mestre V200 — correção dos números de versão (17/11/2026)

- Portal atual **V200** (`v200.html`, `gh-pages`), anterior **V199**. Atualização restrita a metadados e camada de apresentação/diagnóstico: cartões, originais, PDF, imagem, SRS e grifos intactos.
- Rótulo explícito no portal: **Portal V200 · cartões V194 · Atlas V198**. V194 = 1.518 cartões (1.501 ativos/17 inativos), mais 22 Ijuí à parte; V198 = 179 imagens (85 cartão/94 conteúdo).
- Corrigidas discrepâncias anteriores: `assets/version.json` tinha `home=v196.html` e `previous_version=V195` com `version=V199`; `base` e `cache_policy` descreviam 1.499/1.482 da V024, e o README apresentava V131 histórico como referência principal.
- O diagnóstico carregado era V193 e exigia que o portal atual fosse V193. Criado módulo V200 com expectativa correta do manifesto e sem falsear alertas. Corrigida API pública antiga de cartões que declarava 1.499/1.482, embora a base V194 tivesse 1.518/1.501.
- Mensagem de carregamento agora menciona **base pública V194**, e novas respostas discursivas registram `site_version=V200`, mantendo formato de registro e IndexedDB **V195** sem conversão nem perda de históricos antigos.
- V200 introduz somente `v200.html`, `v200_site_info.js`, `v200_diagnostico_local.js`, `v200_public_cards_ui.js` e `v200_discursive.js`. Preservadas as páginas V199 e anteriores, rotas, filtros, imagens, dados, grifos e SRS.
- Foram cotejados **86 scripts + 73 folhas de estilo** na montagem simulada; nenhum nome de asset ausente ou duplicado. A verificação visual em navegador real continua pendente.
- [Relatório de auditoria V200](docs/V200_AUDITORIA_NUMERACAO_VERSOES.md). Rollback: `v199.html`.

---

# Banco Mestre V199 — auditoria de ícones, textos, layout e versões (17/11/2026)

- Foi simulada com sucesso a montagem do portal sobre `v062.html`; foram encontrados **159/159 assets** referenciados no repositório, sem duplicação dos 86 scripts e 73 CSS. Os ícones principais têm caminhos SVG cadastrados.
- Não conformidades corrigidas na interface: cabeçalho/rodapé que identificavam o portal V198 como **V194**; `section.bm198-overview` sem `display:block` frente ao CSS global V062 que oculta `section`; indicadores de cabeçalho em **9–10 px** (até 8 px no celular); alinhamento e área de toque dos ícones/controles.
- **Portal V199** identifica versões distintas de modo transparente: **cartões públicos V194 / Atlas editorial V198**, com variante adequada quando um pacote privado do Drive está ativo.
- Implementação aditiva: `assets/v199_site_info.js`, `assets/v199_ui_audit.css`, `v199.html`. Preservados base, grifos, SRS, originais, classificações V198 e `v198.html` para retorno.
- **Auditoria de código e montagem, não homologação visual do site ao vivo**: nesta sessão, o endereço GitHub Pages não pôde ser renderizado em navegador real. [Relatório V199](docs/V199_AUDITORIA_INTERFACE_ICONES_TEXTOS_VERSOES.md).

---

# Banco Mestre V198 — imagens pendentes classificadas e relacionadas a cartões (17/11/2026)

- Auditoria textual cruzada de **179 registros do Atlas V180** com os **1.518 cartões JSON publicados**. Classificação: **85 imagens de cartão** e **94 imagens de conteúdo**, sem registros pendentes nesse acervo. Foram catalogadas 101 relações de ID (100 links navegáveis e uma referência histórica sem cartão público).
- Das 85 imagens vinculadas, 5 já tinham campo de cartão explícito, 4 foram conciliadas por questão documental presente no cartão e 76 receberam **novas associações didáticas específicas**. Estas últimas não constituem prova de incorporação histórica ao cartão nem de correção técnica verificada pixel a pixel.
- Arquivo auditável `assets/v198_editorial_images_catalog.json`: IDs, tipo/subtipo, ID(s) de cartão, base de associação, título, referências de questão e status técnico histórico preservado.
- Novo módulo `assets/v198_image_links.js` carrega o catálogo, mantém filtros, editor local e navegação de mão dupla. Os ajustes particulares continuam no armazenamento V197 do navegador; exportação/importação de checkpoint só transporta esses ajustes, não substitui o catálogo público.
- Mantidos originais e alertas de erros ou de imagens anteriormente não aprovadas. `IMG-C14-013` conserva `PETRO14-C017` como referência histórica indisponível no leitor público, sem inventar um CARD equivalente.
- Não examinadas para reclassificação automática as imagens privadas adicionais trazidas apenas pela autorização do Drive, fora dos 179 registros. V197 permanece preservada para rollback. Cartões, respostas, SRS e grifos não alterados.
- [Auditoria de imagens V198](docs/V198_AUDITORIA_IMAGENS_VINCULOS.md). Testes estruturais de JSON, IDs e sintaxe passaram; validação completa em navegador do titular permanece pendente.

---

# Banco Mestre V197 — classificação editorial de imagens e navegação até cartões (17/11/2026)

- Metodologia aprovada: **Imagem de conteúdo** (guia/prancha/tabela/esquema) × **Imagem de cartão** (enunciado, figura ou explicação incorporada); estado pendente não é terceiro tipo. Classificação temática V180 permanece independente.
- Aba Imagens: filtro por tipo sobre o Atlas de 179 imagens e a grade de imagens privadas sincronizadas; editor individual de tipo, subtipo e IDs de cartões, com botão para abrir cartão existente em pop-up. No leitor, **Imagens relacionadas ao cartão** oferece retorno ao Atlas a partir de IDs documentados ou salvos.
- Preserva evidências já documentadas em `cards` do catálogo (cinco registros recuperados, um com ID histórico ainda sem rota); itens sem evidência não recebem ligação inventada.
- Registros manuais em chave isolada do navegador, com exportação e importação JSON versionada para checkpoints. Drive continua **somente leitura**; não afirmar que os vínculos locais foram sincronizados automaticamente.
- Mantém HTML V196, ativos anteriores, imagens originais, PDFs, SRS, grifos, favoritos e checkpoints. Arquivos criados: `v197.html`, `assets/v197_image_links.js`, `assets/v197_atlas_edicao_completa.js`, `assets/v197_image_classified_library.js`, `assets/v197_drive_images_sync.js`.
- Auditoria de sintaxe e presença de referências realizada; uso real do Google Drive, importação no navegador do titular e navegação até pop-up precisam de validação adicional.
- [Metodologia e procedimento de checkpoint V197](docs/V197_METODOLOGIA_CLASSIFICACAO_IMAGENS_CARTOES.md). Rollback: `v196.html`.

---

# Banco Mestre V196 — abas de informações sempre recolhidas (16/11/2026)

- No leitor dos flashcards, **todas as abas de informações** começam fechadas, incluindo as 11 camadas da resposta evolutiva, aprofundamentos, fundamentos, macetes, pegadinhas, fontes, histórico e detalhes da resposta discursiva.
- Ao reabrir ou trocar de cartão, as abas voltam a ficar recolhidas. Uma aba pode ser expandida manualmente; abas irmãs fecham para evitar sobreposição.
- **Pergunta visível; verso do cartão só aparece com comando de revelação.** Não fechar uma aba pelo simples carregamento de conteúdo enquanto o estudante a lê.
- Arquivos V165/V194/V195 e registros preservados; sem modificações em SRS, respostas, PDFs, imagens, Drive ou dados locais.
- Implementação aditiva: `assets/v196_abas_recolhidas.js`, `v196.html`. Testes de sintaxe e ligação de módulos; visualização real ainda recomendada. Rollback: `v195.html`.
- [Relatório V196](docs/V196_ABAS_CARTOES_RECOLHIDAS.md).

---

# Banco Mestre V195 — respostas discursivas no portal atual (16/11/2026)

- Adiciona botão **Responder discursivamente** ao leitor de cada cartão, antes da V2. Texto livre, nota de dificuldade e classificação Errei/Difícil/Bom/Fácil.
- Armazena cada tentativa com ID e data no IndexedDB do navegador, sem sobrescrever os registros anteriores; exportação JSON integral e histórico consultável.
- Sob OAuth Google e escolha da pasta pelo titular, grava cópias JSON verificadas em `DataBase_Concurso/02_HISTORICOS/RESPOSTAS_DISCURSIVAS`, preservando ID, resposta integral, autoavaliação e versão de referência.
- Pasta criada no Drive, permissões herdadas/preservadas. O ID de pasta **não** é colocado no código público do GitHub; usuário deve informar uma vez no navegador.
- Não reativa cronômetro nem calendário; não modifica SRS oficial, cartões, verso original, 11 camadas da V194, grifos, imagens ou PDFs.
- Sintaxe JS e injeção de HTML/CSS verificadas por inspeção. **OAuth, gravação remota e fluxo de interface em navegador real pendentes**; não afirmar homologação completa.
- Versão V194 permanece disponível para rollback. [Detalhes e limitações](docs/V195_RESPOSTAS_DISCURSIVAS_DRIVE.md).

---

# Banco Mestre V194 — respostas completas no site, sem conectar Drive (16/11/2026)

- Site carrega **1.518 cartões originais** diretamente dos JSONs públicos (1.501 ativos e 17 inativos).
- Depois de **Revelar resposta**, aparecem automaticamente as **11 camadas integrais didáticas** de cada um dos **1.490 cartões liberados**, sem autenticação Drive e sem publicação do histórico SRS.
- Os **11 cartões críticos** permanecem reservados e mostram apenas resposta original, conforme decisão do estudante.
- 19 IDs que faltavam na base pública passaram a fazer parte do catálogo didático. Os 22 operacionais Ijuí continuam em coleção separada.
- Originais E/F/G/H foram preservados; exemplos, fórmulas, pegadinhas e macetes incluídos. URLs Drive particulares e notas administrativas de revisão não foram publicados.
- Preserva V193 (rótulos/planejamento SRS), V191 (grade Todos), V186 (checkpoints), PDFs, imagens, grifos e históricos privados. **Nenhum evento SRS foi migrado ou alterado.**
- Auditoria estrutural: 1.518 IDs únicos, 16.390 camadas, 11 adiados, zero registros SRS nos arquivos públicos. Teste Chromium real pendente por limitação do ambiente.
- Backup de código `backup/v193-before-didactic-public-v194-20261116`; rollback `v193.html`. [Detalhes](docs/V194_PUBLICACAO_CARTOES_COMPLETOS_SEM_DRIVE.md).

---

# Banco Mestre V191 — todos os cartões na grade + snapshot privado V158 (16/11/2026)

- Corrigido o filtro **Todos**: não exibe apenas os primeiros 24. Lista todos os cartões da base atualmente carregada em **uma única grade**, sem grupos destacados; quando houver filtro específico, a paginação de 24 e os grupos voltam.
- **Base privada V158 preparada e salva no Drive** (1.518 IDs / 1.501 ativos; 1.490 aprofundamentos e 11 críticos adiados). Os 1.518 SRS da V045 foram preservados exatamente, mas os históricos de outras conversas e navegadores ainda não estão integralmente conciliados.
- A base pública continua com 1.499 IDs / 1.482 ativos. Para mostrar os outros 19, usar o sincronizador privado V185, carregar a V158; os 22 operacionais Ijuí permanecem separados. Inativos exigem habilitação própria.
- Testes sintéticos Chromium em 1440, 900 e 390 px: Todos=1.523 ativos com base privada+Ijuí, filtro específico=24, Todos+inativos=1.540. OAuth e renderização completa no navegador do titular permanecem sem homologação.
- Arquivos: `v191.html`, `assets/v191_all_cards_grid.js`, `assets/v191_all_cards_grid.css`; preservar V190. [Relatório](docs/V191_TODOS_CARTOES_GRADE_E_SNAPSHOT_V158.md).

---

# Banco Mestre V188 — grade consistente de cartões no agrupamento Geral (16/11/2026)

- Corrigido o cartão isolado exibido com largura total na grade de **Geral** (ex.: CARD-0001 / Instalações e Edificações). A causa era `auto-fit` que expandia a trilha única; V188 aplica `auto-fill` em CSS isolado.
- Desktop mantém células de grade mesmo com 1 ou 2 cartões, celular mantém uma coluna. Testado em Chromium nas larguras 1440, 900, 620 e 390 px; validação na interface do navegador do usuário ainda recomendada.
- Nenhum cartão, ID, resposta, imagem, SRS, integração privada ou ficha inativa alterado. V187 preservada em `v187.html`; backup em `backup/v187-before-general-cards-grid-v188-20261116`.
- Arquivos: `v188.html`, `assets/v188_general_cards_grid.css`, manifesto e página inicial. [Relatório V188](docs/V188_CORRECAO_GRADE_GERAL.md).

---

# Banco Mestre V187 — 1.490 versos evolutivos privados na janela de flashcards (16/11/2026)

- Nova versão `v187.html` preserva V186 (checkpoints), V185 (Drive), V184 (prática/diário), PDFs, imagens, SRS e os 17 cartões inativos.
- Na janela do cartão V165, após **Revelar resposta**, há uma seção fechada por padrão: **Aprofundamento integral (11 camadas)**. O conteúdo vem da V157 privada após OAuth Drive e checagem SHA-256; nada do material privado é copiado para o GitHub.
- 1.490 dos 1.501 cartões ativos são elegíveis; 11 críticos adiados sem nova homologação ou atualização dos seus versos. A base pública permanece com 1.499 IDs / 1.482 ativos até carregar snapshot privado aprovado no sincronizador V185.
- Nenhuma mudança no SRS nem gravação em localStorage/IndexedDB pelo novo módulo; a resposta original e o histórico local continuam em seus próprios componentes.
- Testes simulados de integração: 13/13; teste navegador/OAuth real ainda **pendente**, pois o ambiente de testes bloqueia navegação. O módulo é opt-in e não carrega dados sem o clique do proprietário.
- Backup de código: `backup/v186-before-evolutivos-v187-2026-11-16`. Reversão: `v186.html`. Documento: [V187 — aprofundamentos](docs/V187_APROFUNDAMENTOS_1490_11_ADIADOS.md).

---

# Banco Mestre V178 — PETROBRAS 14 e índice privado do Atlas (16/11/2026)

- Preservadas as 66 imagens-fonte da Parte 14 no Drive; 38 SVGs receberam prévias PNG separadas e os vetores originais não foram substituídos. Índice privado de 104 registros com referência e hashes, incluindo 13 possíveis imagens enviadas pelo estudante, cuja autoria ainda requer confirmação.
- Pasta privada de conhecimento V005: 24 versos integrais recuperados, 27 questões históricas Q001–Q027, Q028–Q047 indexadas somente como referências parciais. Os C001/C002/C004 e a transcrição literal integral permanecem pendentes.
- V178 mantém a galeria V177 e faz leitura autenticada do índice da Parte 14 na raiz privada do Atlas; abre os materiais de cartão em pasta privada separada, sem incluir informações privadas nos arquivos públicos.
- Sem integração dos novos cartões ao baralho operacional, sem mudança em SRS/IDs/dados locais. O acesso real OAuth no Android e a renderização permanecem sem homologação.
- Versão V177 preservada. Arquivos novos: `v178.html`, `assets/v178_drive_images_sync.js`; `index.html` e `assets/version.json` apontam V178 após publicação.

---

# Banco Mestre V171 — mídias do assunto somente sob demanda (14/11/2026)

Motivação: na V170, o usuário relatou demora excessiva e textos sem valor na seção "Imagens e PDFs do assunto" ao navegar em Assuntos com S Pen. Muitas matérias não têm imagem vinculada e exibiam mensagens genéricas e PDFs escolhidos por semelhança de título.

Correção:
- O assunto abre mostrando **apenas um botão textual** "Consultar imagens e PDFs deste assunto". Nenhuma miniatura ou catálogo rápido de PDFs é solicitado pelo módulo do assunto antes da ativação desse botão. Movimento/hover com S Pen não abre a biblioteca, apenas um clique/toque intencional.
- Ao acionar, a galeria e os links anteriores são carregados usando os JPEGs e o índice PDF compacto da V170. Não exibir o texto longo "Nenhuma imagem com correspondência..." quando não houver imagens. Manter breve observação de que sugestões por título não comprovam vínculo documental.
- O módulo original V037 foi clonado para `assets/v171_assuntos_navegacao.js` e deixa de anexar automaticamente blocos de PDFs à página ao fim da leitura de cartões; a consulta sob demanda ainda recupera PDFs por categoria quando o catálogo principal já estiver disponível.
- Arquivos novos: `v171.html`, `assets/v171_assuntos_rapidos.js`, `assets/v171_assuntos_navegacao.js` e `assets/v171_topic_media_on_demand.css`. Sem novos ícones; botão acessível a dedo, mouse e S Pen.
- V170 permanece disponível, e backup anterior à intervenção: `backup/v170-before-on-demand-topic-media-v171-2026-11-14`.
- Base preservada: 1.499 cartões (1.482 ativos), 86 imagens, 78 PDFs, conteúdo e resposta integral dos cartões, SRS, grifos, dados locais e permissões Google Drive.
- Auditoria estática de sintaxe, referências e gatilho de ativação concluída. O comportamento e o desempenho no dispositivo Android/S Pen ainda precisam de teste real.

---

# Banco Mestre V170 — imagens e PDFs imediatamente dentro do assunto (14/11/2026)

Nova versão baseada em V169 com prioridade para mídia na entrada do assunto, sem alterar acervo canônico ou leitores históricos.

- O bloco `#topicMedia` é movido **somente na interface** para imediatamente depois do resumo inicial, antes da lista extensa de cartões. O assunto mostra título, galeria e links antes de concluir o processamento dos cartões.
- As 70 miniaturas históricas agora têm arquivos JPEG públicos separados `assets/topic_thumbs_v170/IMG-XXX.jpg`; são cópias byte a byte das imagens compactas já publicadas nos sete JSONs `img_live_v154_00...06.json`, que permanecem intactos. A primeira faixa de até três miniaturas usa prioridade de carregamento; as seguintes usam lazy load. Na falta de um JPG, há fallback ao `thumb(x)` antigo.
- Os 16 recortes Petrobras P10 permanecem referenciando a fonte Google Drive. A visualização usa miniatura de largura de 600 px em vez de pedir a versão `w2400`, sem alterar o acesso ao original.
- Índice de leitura rápida `assets/topic_pdf_links_v170.json`, com 78 referências, construído dos IDs e links já constantes de `pdf_catalog_v149.json`; a lista aparece sem aguardar a inicialização/renderização de toda a biblioteca de PDFs. O PDF original continua acessado pelos leitores e permissões existentes.
- No celular, a galeria é uma faixa horizontal rolável, evitando uma coluna muito alta antes dos conceitos. Botões permanecem acessíveis por ID.
- Código novo `assets/v170_assuntos_rapidos.js` e `assets/v170_topic_speed.css`; `v170.html` herda todos os demais componentes da V169 (inclusive a gaveta de cartões da V168). V169 e anteriores permanecem intocados.
- Contagens esperadas: 1.499 cartões canônicos, 1.482 ativos, 86 imagens ativas (70 JPEG históricos +16 Drive), 78 PDFs. Sem alteração de IDs, SRS, grifos, respostas, Histórico F17, vade, dados privados ou edição dos arquivos do Drive.
- Testes estáticos de sintaxe e presença dos arquivos concluídos, incluindo conferência dos 70 JPEGs e 78 entradas PDF. Sem medição de tempo ou homologação em navegador Android autenticado: o tempo real depende de dispositivo, conexão e rede Google.
- Backup pré-mudança: `backup/v169-before-topic-image-speed-v170-2026-11-14`.

---

# Banco Mestre V169 — carregamento progressivo de mídias em Assuntos (14/11/2026)

A V169 herda a interface V168 e corrige somente o caminho de abertura dos assuntos e a montagem das imagens/PDFs relacionados. Arquivos novos `v169.html`, `assets/v169_assuntos_rapidos.js` (cópia controlada do módulo V126) e `assets/v169_topic_media_fast.css`.

- O assunto aparece com título e indicador de carregamento antes de terminar a leitura da base; a chegada dos PDFs não impede a visualização de seus cartões.
- A inicialização original de PDFs continua ocorrendo **uma só vez**; a V169 expõe sua Promise para o assunto esperar os links de modo não bloqueante, sem repetir a montagem de toda a biblioteca. Links acionados por ID reutilizam a mesma inicialização quando ela está pendente.
- Miniaturas do assunto são requisitadas somente ao se aproximarem da área visível (`IntersectionObserver`, margem de 320 px). As sete partes históricas `img_live_v154_00...06.json`, que contêm 70 imagens, permanecem intactas; os 16 recortes externos também. Sem `IntersectionObserver`, mantém-se carregamento convencional como fallback.
- A lista dos PDFs usa as associações por título já presentes; a camada V036 continua responsável pelos capítulos e PDFs da mesma disciplina. Não amplia artificialmente vínculos documentais.
- Proteção contra resultados atrasados: cada abertura de assunto tem token de renderização e descarta miniaturas/PDFs que chegarem após a troca de tema.
- O Google Drive pode continuar demorando para abrir o **arquivo PDF original** ou uma miniatura externa, conforme conexão e autorização; V169 reduz bloqueios da interface, não muda o serviço.
- Base pública V024 H14, 1.499 IDs, 1.482 ativos, cartões e versos, histórico/SRS, 78 PDFs, 86 imagens, Vade, grifos, arquivos Drive e preferências locais preservados. V168 e anteriores continuam acessíveis.
- Verificações estáticas de sintaxe, referências e integridade concluídas; medições e homologação em navegador Android/Google OAuth permanecem pendentes.
- Backup de código antes da ativação: `backup/v168-before-topic-media-v169-2026-11-14`.

---

# Banco Mestre V168 — Outros cartões no celular (14/11/2026)

A nova versão publicada utiliza a interface e o leitor V165 como base, acrescentando apenas `assets/v168_mobile_related.css` e `assets/v168_mobile_related.js` em `v168.html`.

- Em telas de até 760 px, o painel **Outros cartões** começa recolhido; ao tocar no botão, aparece como gaveta com lista vertical rolável, pesquisa e seleção legível por ID e pergunta.
- A gaveta oferece fechamento explícito, fechamento ao tocar fora, retorno à pergunta após escolher outro cartão e Escape para fechar a lista antes de fechar o cartão.
- Os itens têm maior área de toque e fonte legível; entrada de busca com 16 px evita zoom automático em dispositivos móveis que aplicam essa regra.
- No desktop, o comportamento de barra lateral da V165 é mantido. A interface V165 permanece preservada integralmente como alternativa.
- Não foram alterados dados, IDs, versos, históricos, SRS, armazenamento do navegador, PDFs, imagens, Vade Mecum nem conexões com Google Drive.
- A alteração está restrita à navegação visual. O relato anterior de cartões que não abrem em todos os caminhos de acesso ainda requer teste de reprodução com IDs específicos; não declarar resolução generalizada.
- Validação: referências, estrutura da montagem V062 e contratos DOM conferidos estaticamente; homologação visual no navegador Android real ainda pendente.
- Backup de código pré-ativação: `backup/v165-before-activate-v168-mobile-2026-11-14`.

---

# Versão principal: V165 — decisão do usuário (13/11/2026)

O usuário preferiu o layout V165 em vez do V164. O arquivo v165.html foi preservado sem modificações e é novamente a versão ativa da publicação. O endereço principal redireciona à V165; links específicos para V164, V166 e V167 permanecem válidos como históricos. Nenhum cartão, ID, SRS, resposta, imagem, PDF ou dado do Google Drive foi alterado. Esta alteração muda apenas ponteiros de versão e a documentação.

---

# Versão principal RESTAURADA: V164 (13/11/2026)

**Decisão do usuário:** desfazer a escolha das interfaces V165, V166 e V167 e voltar ao portal V164. A branch publicada `gh-pages` mantém os arquivos históricos, sem os excluir nem reescrever, mas a entrada `index.html` e o manifesto `assets/version.json` agora direcionam para `v164.html`.

O rollback é somente da **versão ativa**: não substitui dados, SRS, IDs, PDFs, imagens, registros locais, Drive ou conteúdo canônico. Links que apontem **explicitamente** para `v165.html`, `v166.html` ou `v167.html` continuarão abrindo suas versões históricas. Acesse o endereço principal ou `v164.html` para usar a interface restaurada.

---

# Banco Mestre V167 — Assuntos e subassuntos responsivos (13/11/2026)

## Navegação e apresentação
- O link `#tema?g=ENG_GERAL&s=Estruturas%20%2F%20Resist%C3%AAncia%20dos%20materiais` continua compatível com o mecanismo de restauração por grupo e título da V126. Assunto vinculado a 10 cartões originalmente `ENG_MATERIAIS`, sem reclassificar IDs nem afirmar vinculação temática como revisão.
- Nova camada `assets/v167_topic_ui.js`: barra com atalhos Subassuntos, Macetes, Imagens e PDFs, Relações; botões **Expandir todos**/**Recolher todos**; subassuntos com contagens e índice compacto; IDs separados visualmente da pergunta.
- Macetes, imagens/PDFs e relações aparecem em painéis recolhíveis. As seções `topicOverview`, `topicMacetes`, `topicRelated` originalmente ocultas são reveladas somente quando têm conteúdo e respeitam o acionamento do usuário.
- Novo CSS `assets/v167_assuntos_responsivos.css`: fontes maiores e contrastadas, títulos legíveis, ações para toque, espaçamentos adequados, cartões em 2 colunas apenas no desktop amplo (≥1110px) e 1 coluna no celular; navegação horizontal para telas estreitas; grade de imagens proporcional.
- Cópia versionada `assets/v167_assuntos_rapidos.js` preserva a navegação e o material de V126; **Estudar no pop-up** chama `window.BM166Reader.open(id)` quando presente. Sem interação automática com SRS; se o pop-up estiver indisponível, mantém a navegação antiga como fallback.
- Os textos literais do verso e os campos canônicos nunca são sobrescritos. Alterações nos títulos de cartão são somente na DOM de apresentação, para separar ID e pergunta.

## Integridade
- `gh-pages` continua a branch publicada; V166 intacta; índice, histórico, SRS, V045 privada, PDFs, Atlas e Vade não editados.
- Sintaxe dos módulos e carregamento versionado auditados. Teste visual/interativo autenticado no navegador do usuário ainda não homologado.

---

# Banco Mestre V166 — leitor funcional e avaliação local (13/11/2026)

## Correção funcional
A V165 foi relatada como não funcional ao clicar em cartões. V166 usa `assets/v166_card_reader.js` como leitor independente; elimina o módulo de navegação V165 no loader e mantém desativado o V060 gerador de cabeçalho individual. Um clique na superfície ou no botão **Abrir estudo** abre diretamente a janela pop-up. Links `?cartao=ID` abrem a biblioteca com a janela do cartão, sem filtros individuais. Lista de outros cartões, busca e anterior/próximo permanecem na mesma janela.

## Conteúdo, campos e formatação
A pergunta e a escrita aparecem primeiro. Explicações, resposta-modelo, verso literal preservado e macetes vêm em seções com rolagem. Lei seca tem controle independente, apenas para texto literal verificado e com fonte. Informações editoriais/administrativas do cartão ficam recolhidas em **Cadastro e referências**, sem ocupar a frente. O conteúdo canônico original é clonado para visualização quando disponível; nunca é modificado.

## Registro de respostas e classificação
O botão **Registrar e comparar** salva a resposta no armazenamento local `BM_V037_CARTAO_GUIA_{id}`, acrescentando evento `resposta_discursiva_nao_avaliada`. Após comparar, o usuário pode atribuir **Errei (4 d), Difícil (8 d), Bom (16 d), Fácil (28 d)**. A avaliação é gravada separadamente em `BM_V166_AVALIACOES_LOCAIS_V1`, vinculada ao ID da tentativa e com prazo-base *sugerido*. Não realiza o cálculo completo de repetição (multiplicador/teto), não cria evento no SRS canônico nem sincroniza com Drive. Mudar a classificação da mesma tentativa atualiza o registro local sem criar um evento duplicado. **Consultar sem registrar** libera a correção sem gerar tentativa.

É possível copiar o pedido de correção para uma conversa do ChatGPT: o site estático não oferece avaliação automática. A exportação JSON inclui as respostas locais, as classificações e `revisoes` compatíveis com o formato de importação do Calendário SRS local (sem alterar o histórico oficial).

## Proteção de dados
Sem mudanças nos 1.499 cartões públicos, 22 operacionais de Ijuí, 1.518 privados opcionais, histórico F17, IDs, Vade, PDFs, imagens e revisões oficiais. V165 e anteriores intactas. Testes estáticos e funcionais simulados executados; homologação em navegador real autenticado ainda pendente.

---

# Banco Mestre — V165: somente biblioteca + pop-up completo (13/11/2026)

**Ajustes solicitados:** As duas barras de "Cartão individual" da captura eram geradas pelos módulos V060 e V163, carregados juntos. A V165 não carrega nenhum deles, mantendo a biblioteca como interface única. O filtro continua na biblioteca, mas deixa de existir uma página individual com filtros redundantes. Os links antigos `?cartao=PROP-IJUI-001` passam a abrir o pop-up do cartão automaticamente.

**Leitura:** ao clicar na superfície do cartão ou no comando "Abrir leitura", a janela modal apresenta pergunta, verso original, conhecimento mínimo, resposta-modelo, explicações, macetes, pegadinhas, lacunas, fundamentos, interconexões, histórico, fontes e rastreabilidade existentes. Trechos originais da página são copiados apenas para apresentação — não editados nem resumidos. Conteúdos ausentes não são inventados. Lei seca permanece independente, oculta por padrão e com a fonte.

**Navegação:** lista lateral com cartões relacionados ou pesquisa por ID/assunto em toda a base, anterior/próximo, botão recolher lista, leitura rolável e layout móvel. Ao trocar de cartão, resposta e lei seca voltam a ficar ocultas. Ações próprias da biblioteca não abrem o pop-up acidentalmente.

**Preservação:** V164 e versões anteriores intactas; IDs, base, SRS, respostas originais, acervo do Drive, imagens, PDFs, grifos e Vade não sobrescritos. Testes de sintaxe e integração conferidos; ainda não homologado no navegador autenticado do usuário.

---

# Banco Mestre — V164: refinamento mobile da leitura V163 (13/11/2026)

A V164 preserva os módulos de cartões aprofundados publicados na V163 e corrige no CSS novo `assets/v164_cards.css` a ordem do botão **Ler cartão** na visualização estreita. Clique na superfície do cartão abre o leitor local; resposta e lei seca separadas e ocultas inicialmente; leitor com rolagem interna. Ações, editor discursivo e janela individual continuam disponíveis. Nenhum ID, texto, SRS, histórico, PDF, imagem, Vade ou Drive foi regravado.

**Validação:** manifesto V164, entrada, módulo do leitor e CSS conferidos; teste funcional simulado do PROP-IJUI-001 abriu e fechou o leitor, verificou resposta inicialmente oculta, resposta-modelo, verso original intacto e botão separado de lei seca. O teste no navegador do usuário ainda não foi executado.

---

# Banco Mestre — V163: cartões claros e leitura em modal com rolagem (13/11/2026)

**Mudança:** V163 publicada em `gh-pages/v163.html`, com módulos novos `v163_card_reader.js`, `v163_card_window.js`, `v163_card_polish.js`, `v163_lei_seca_literal.js` e `v163_cards.css`. A V162 e módulos históricos não foram editados.

- Clicar na área livre do cartão abre a leitura detalhada na própria página; o botão *Ler cartão* tem a mesma função. Botões, links, campos e controles aninhados conservam o próprio comportamento, sem disparar o modal inadvertidamente. O link **Abrir aba completa** continua disponível e aponta para `index.html?cartao=ID#cartoes` — nunca fixa uma versão antiga.
- Cartão com identificação visual de disciplina, tipo da fonte, assunto e subassunto, guia aprofundado quando disponível e referência cadastrada **sem atribuir verificação normativa à referência original**. A pergunta permanece o elemento principal.
- O leitor rápido ganha cabeçalho/rodapé fixos e área central rolável, com resposta original explicitamente separada, bloco aprofundado (mínimo, resposta-modelo e explicação), macetes, pegadinhas, lacunas, histórico documentado da questão versus cartão, fundamento e páginas do PDF quando presentes. Conteúdos ausentes não são inventados; os grupos são recolhíveis para leitura extensa.
- Resposta original e **lei seca** começam ocultas independentemente. O botão legal recupera os dados literais da V162, com fonte, alcance e aviso de referência divergente quando houver. Ele também existe na lista. Consulta sem gravar SRS/avaliação.
- A visualização preserva IDs, texto original do verso, estados de anotações, links diretos, formulário discursivo, biblioteca de PDFs e imagens e a importação privada V045 (se autorizada pelo usuário).

**Auditoria:** sintaxe e dependências conferidas; homologação visual em navegador autenticado e importação real do Google Drive ainda pendentes.

---

# Banco Mestre — V162: maior cobertura de lei seca por cartão (13/11/2026)

A V162 adiciona **14 transcrições literais de dispositivos** à V161 sem substituir os versos originais: 6 artigos/trechos do Decreto RS 23.430/1974 (arts. 57, 61–63), 4 incisos do art. 5º da CONAMA 001/1986, 1 art. 8º da CONAMA 237/1997 (com aviso de confrontar com Lei 15.190/2025), 2 do art. 9º do Código de Ética Confea e 1 art. 37, V da CF.

**Cobertura total:** 36+14=50 transcrições novas públicas, acrescidas a 3 versos literais preservados = **53/65 públicos**. Ijuí: **15/22 operacionais** com lei seca. Total **68/87**, com 19 cartões restantes honestamente apresentados como 'Lei seca a conferir'. Parte desses 19 são jurisprudência, legislação municipal não identificada ou conflito normativo, e nunca devem receber texto inventado. Dados V045 privados, quando importados, seguem a política de verificação de literalidade sem publicação do acervo.

O módulo `assets/v162_lei_seca_literal.js` substitui somente o V161 na entrada nova; `assets/lei_seca_complementos_v162.json` registra cada ID, trecho, dispositivo, fonte e ressalvas. `v161.html` e versões precedentes intactos. O comportamento segue **um botão por cartão**, sem expor o texto automaticamente e sem abrir a resposta conceitual. SRS, IDs, JSON canônico, Drive, Vade, PDFs, imagens, grifos e históricos não modificados.

**Auditoria:** sintaxe do carregador e módulo, unicidade de 65 IDs entre 3 sidecars, HTTPS das fontes, manifesto e índices conferidos. A interação de navegador pessoal, inclusive Drive OAuth, permanece pendente.

---

# Banco Mestre — V161: botão literal de lei seca por cartão (13/11/2026)

**Motivo:** Na V160, ocultar o resumo do verso não exibia o texto legal. A V161 substitui (não sobrepõe) `v160_lei_seca_toggle.js` por `assets/v161_lei_seca_literal.js`; o texto explicativo e o verso canônico são mantidos inalterados.

**Comportamento:** Cada cartão de legislação tem botão visível na frente, **“📜 Mostrar lei seca”** / **“📜 Ocultar lei seca”**. O controle apresenta apenas o dispositivo literal acompanhado da norma, artigo, alcance da transcrição e link à fonte. Não abre automaticamente a resposta original. Mantém estado temporário por ID durante filtros e navegação na sessão, sem gravar SRS/localStorage.

**Cobertura auditada desta etapa:** `assets/lei_seca_literais_v161.json` contém 36 IDs públicos; `assets/lei_seca_ijui_v161.json` contém 15 cartões operacionais de Ijuí; os três versos legais da Lei 15.190/2025 (CARD-1495/1496/1497) são reaproveitados na íntegra. Resultado: 39/65 cartões públicos de Legislação, 15/22 Ijuí = 54/87 com trecho de lei seca documentado, sem transformar resumos em citações. Os demais 33 continuam como **“Lei seca a conferir”** ao tocar no botão; isto não significa que uma transcrição foi concluída. Fontes e alcances constam dos JSONs. Em V045 privada, usar apenas registros verificados e não copiar dados ao GitHub.

**Alerta jurídico:** O original PROP-IJUI-001 cita a Lei 7.540/2024 art. 2º, mas a definição de cargo/investidura foi encontrada nos arts. 2º e 3º da Lei 3.871/2001, em PDF disponibilizado pela Câmara Municipal; o módulo apresenta a transcrição **com alerta de divergência**, sem editar o ID e a referência original. Não realizar promoção canônica nem migração silenciosa.

**Preservação:** 1.499 IDs públicos (1.482 ativos), 22 Ijuí, 1.518 IDs do Drive privado opcional, SRS e histórias, 78 PDFs, 86 imagens, Vade e grifos preservados. Apenas o HTML loader, o manifesto, o redirecionamento e módulos de apresentação foram modificados.

**Verificação:** JavaScript do módulo e loader conferidos sintaticamente, JSON com IDs únicos e fontes HTTPS; teste visual em sessão de usuário real, inclusive Google OAuth privado, permanece pendente.

---

# Banco Mestre — V160: ocultar e revelar a lei seca (13/11/2026)

**Publicação:** `gh-pages/v160.html`, novo módulo `assets/v160_lei_seca_toggle.js`. Entrada `index.html` e manifesto `assets/version.json` apontam para V160. A V159 foi preservada.

**Interface:** cada cartão de legislação oferece uma segunda área recolhível, independente da resposta geral. O texto inicia oculto por padrão, e é possível mostrar e ocultar novamente pelo próprio cartão. A opção global "Ocultar por padrão" afeta os cartões visíveis. O estado individual é retido apenas em memória, inclusive ao trocar filtros. A janela individual V158 usa o mesmo módulo.

**Precisão jurídica:** CARD-1495, CARD-1496 e CARD-1497 apresentam lei seca literal no verso e são identificados como tal. Nos demais cartões de legislação, inclusive Ijuí, o verso original é recolhível com aviso explícito de que não se confirmou transcrição literal do artigo. Se a base trouxer campo independente de lei seca (`texto_lei_seca`, `lei_seca_texto`, `lei_seca`, `legal_text`, `law_text`, `legal_excerpt`), a transcrição é ocultada separadamente da resposta conceitual. Não se inventa texto legal.

**Integridade:** V024 H14 (1.499 IDs, 1.482 ativos), 22 Ijuí, V045 privada (1.518 IDs quando carregados), SRS, anotações, 78 PDFs, 86 imagens ativas, referências e textos originais não foram modificados. Módulo sem escrita em localStorage/IndexedDB/Drive.

**Auditoria:** JS do módulo e do loader V160 conferidos sintaticamente, nomes e referências de versão validados, contagens do manifesto preservadas. Navegador pessoal autenticado ainda não homologado.

---

# Banco Mestre — V159: buscador de imagens unificado (13/11/2026)

**Mudança publicada:** barra visual duplicada `bm-v044-atlas-controls` oculta apenas após a realocação bem-sucedida dos controles. O filtro principal permanece o V156 com Disciplina → Assunto geral → Assunto específico → Subassunto, contagens e busca por ID/título. Os filtros exclusivos (favoritas, ordenação, visibilidade local) e a ação "Copiar excluídas p/ Drive" foram transferidos para o painel recolhível "Mais opções" sem recriar dados nem redefinir eventos.

**Arquivos:** `v159.html` é derivado de V158; adiciona `assets/v159_atlas_clean_ui.js` após `assets/v156_image_classified_library.js`. V158 permanece intacta. `gh-pages/index.html` redireciona V159 e `assets/version.json` publica `version=V159`, `home=v159.html`.

**Preservação:** 86 imagens ativas, 184 IDs já removidos da biblioteca ativa, 78 PDFs, cartão em aba V158, acesso privado Drive V157, favoritos e títulos/ocultações locais, manuscrito/Vade, grifos e SRS. Nenhum dado ou arquivo no Google Drive foi excluído nem sobrescrito. O painel "Visibilidade local" serve apenas para ocultações/restaurações locais, não para reintroduzir registros anteriormente removidos.

**Validações:** arquivos V159 disponíveis em `gh-pages`; checagem de sintaxe JavaScript e consistência do carregamento e contagens do manifesto. Testes visuais no navegador real/autenticado ainda pendentes.

---

# Banco Mestre — V158: correção de cartão individual e retorno (12/11/2026)

**Problema confirmado:** o link `v055.html?cartao=CARD-0130#cartoes` abre a edição histórica V055. O módulo `assets/v055_card_window.js` também continha **endereços fixos V055** para abrir um cartão e para o botão **Voltar aos cartões**, causando retorno a uma versão obsoleta.

**Correções publicadas:** o antigo `v055.html` redireciona somente links seguros com `?cartao=ID` para `index.html`; o redirecionador `index.html` preserva o ID validado e o fragmento, encaminhando à versão mais recente (`V158`). O novo `assets/v158_card_window.js`, carregado em `v158.html`, abre uma visualização individual numa aba separada por `index.html?cartao=CARD-0130#cartoes`, sem antecipar a resposta, preservando o verso e sem alterar dados; **Voltar aos cartões** direciona a `index.html#cartoes` (versão atual). Há acesso aos PDFs atuais no mesmo menu.

**Auditoria:** `CARD-0130` localizado em `cards_public_v024_000.json`, sobre Qi e Qf de redes coletoras (NBR 9649). Bootstrap da versão nova gerou ~50 mil caracteres, scripts internos sem erros de sintaxe, com arquivos V157 de sincronização privada, V156 de imagens, V154 de Vade, V152 de flashcards e catálogo de 78 PDFs mantidos. Simulação das URLs validou: abertura individual, retorno, redirecionamento de V055, preservação da busca por ID no index e rejeição de parâmetros inválidos. Nenhum SRS, cartão, grifo ou PDF foi modificado. **Teste dentro do navegador real do usuário não realizado.**

---

# Banco Mestre — V157: sincronização privada da Parte 12 (12/11/2026)

A página publicada em `gh-pages/index.html` direciona para `v157.html`, mantendo `v156.html` e o catálogo público V024 H14 intactos. O módulo `assets/v157_private_sync.js` acrescenta em **Flashcards** a opção **Conectar Drive e carregar V045**. A autorização Google OAuth é de **somente leitura**, por ação do usuário; tokens e dados não são escritos no GitHub, localStorage ou IndexedDB.

A fonte `BANCO_MESTRE_PRIVADO_V045_SYNC_2026-11-12.json` fica em pasta **restrita ao proprietário no Google Drive** (ID do arquivo `1Xl_SpP1N1VgaeMAfovlgtOvMQwB6xQR4`). São **1.518 cartões** (1.501 ativos), **19 questões**, **1.518 registros de SRS de referência** e **11 imagens vinculadas**. O botão de importação valida formato, contagens, unicidade dos IDs e SHA-256 da fonte, preserva os cartões operacionais de Ijuí e não sobrescreve o SRS local. O catálogo público continua 1.499 IDs, 1.482 ativos.

Os **11 PNGs originais IMG-P12-001 a IMG-P12-011** foram copiados para a pasta privada do Atlas (`1ksSVWrmRaRlDoG4iDtTGvfr2OnPnhnY6`), que já conta com o leitor de imagens autenticado V084. O acervo público de 86 imagens e as exclusões anteriores não foram alterados. O usuário deve autorizar a leitura na aba **Imagens** para abrir essa biblioteca.

**Verificações efetuadas:** versão/entrada/HTML/módulo consistentes e estrutura da fonte conferida; permissões da fonte privada restritas ao proprietário. **Pendência:** o OAuth e o carregamento efetivo devem ser testados no navegador do usuário, porque o conector não executa uma sessão Google interativa de terceiros. Não afirmar sucesso de login sem esse teste.

---

# Banco Mestre — V156: reclassificação visual de 86 imagens ativas (12/11/2026)

Reclassificação concluída com inspeção visual da totalidade dos registros ativos: **70 prévias JPEG publicadas** e **16 recortes originais PNG lidos do Google Drive**, sem restaurar os **184 IDs excluídos**. Cada ID recebeu disciplina, assunto geral, assunto específico, subassunto, título descritivo, evidência e status de auditoria em `assets/image_classificacao_v156.json`.

**Resultado:** 84 imagens tiveram o assunto identificado com boa confiança. Permanecem duas ressalvas: **IMG-001** é um material já identificado como tecnicamente problemático (preservado com advertência, sem homologação de fórmulas), e **IMG-044** exige leitura do original em maior resolução por ter prévia insuficiente. A auditoria de assunto não equivale à validação normativa de fórmulas, prazos ou gabaritos.

As principais correções foram: pórticos IMG-004/010/024, esquadrias de madeira IMG-052, coletores públicos e poços de visita IMG-079/085, ensaio de ductilidade IMG-094, NR-7/PCMSO IMG-112, vocabulário de interpretação IMG-144, validade de argumentos IMG-146, geometria plana IMG-151. Os três recortes Petrobras antes pendentes (P10-01, P10-03 e P10-04) tiveram seus assuntos identificados com base no texto dos originais.

A biblioteca agora lê `assets/image_classificacao_v156.json`, `assets/imagens_assuntos_v156.json`, `assets/imagens_descritivas_v156.json` e `assets/image_grupos_v156.json`. O renderizador `assets/v156_atlas_edicao_completa.js` mantém favoritos, títulos personalizados, edição, originais e grifos; o menu `assets/v156_image_classified_library.js` continua com filtros encadeados e contagens. Os **16 recortes ambientais** são consultáveis também sob Legislação, por vínculo secundário, sem duplicar a mídia.

Auditorias: 86 IDs presentes em quatro arquivos novos; 13 categorias gerais idênticas aos flashcards; grupos de Pórticos (3), NR-7 (3), Estruturas (20), Legislação ambiental (16); busca por ID, reset e ausência dos 184 excluídos foram testados. Bootstrap de V156 montado sem erros de sintaxe; PDFs V002 (78), Flashcards V152, SRS, Vade V154 e Redação V146 foram preservados. **Validação no navegador autenticado do usuário ainda não executada.**

Relatório individual: `AUDITORIA_IMAGENS_ATIVAS_V156.md` — **86 linhas por ID**, com disciplina, assunto geral, assunto específico, subassunto e status.

---

# Banco Mestre — V155: Classificação das imagens igual aos flashcards (12/11/2026)

O Atlas de imagens passa a usar filtros **Disciplina → Assunto geral → Assunto específico → Subassunto** com contagens dinâmicas, seletores encadeados e botão Limpar filtros. O segundo nível reutiliza integralmente as **13 categorias gerais de flashcards V128**; somente opções presentes na seleção aparecem. O assunto específico segue a categoria temática dos metadados originais e o subassunto segue as relações de estudo documentadas (sem criar conteúdos quando não foram identificados).

A camada `assets/image_classificacao_v155.json` liga os 86 IDs da base ativa V154 à hierarquia; registra grupo original, categoria, assunto, origem da classificação, evidência e status técnico. Existem 70 imagens históricas e 16 recortes Petrobras, com 4 referências cruzadas explícitas à disciplina Legislação, sem duplicar arquivos. Alguns recortes têm subassunto pendente ou carecem de auditoria visual; essas pendências foram preservadas, não substituídas por inferências.

O módulo `assets/v155_image_classified_library.js` reaproveita o renderizador e as funções de favoritos, editor e grifos de V154. Os grupos permanecem recolhidos enquanto nenhum filtro estiver escolhido. Ao filtrar, o Atlas mostra os cartões correspondentes, respeita a paginação e a busca por ID, e permite limpar filtros. Os 184 IDs excluídos na V154 continuam ausentes; **86 imagens ativas**, **78 PDFs** e a versão corrente do Vade Mecum com cache SHA-256 permanecem inalterados.

**Validação:** 86 IDs classificados sem duplicatas, 13 categorias gerais idênticas às de flashcards, simulações positivas de Engenharia Civil (73), Estruturas (21), Vigas (10), Momento de inércia (1), Matemática (5), Legislação cruzada (4), reset, busca exata por ID e impossibilidade de restaurar os 184 excluídos. Bootstrap completo V155 montado com 50.185 caracteres e sem erros de sintaxe; leitor de PDF/Redação/SRS preservados. Navegação autenticada real ainda não homologada.

---

# Banco Mestre — V154: biblioteca ativa limpa + Vade atual validado (12/11/2026)

## Exclusão efetiva da biblioteca de imagens
O arquivo privado `EXCLUSOES_ATLAS_184_V046_ORIGINAL_2026-11-10.json` contém 184 exclusões por ID. Foram removidos **184 registros do catálogo de produção**, e criados arquivos independentes `meta_public_v154.json`, `imagens_assuntos_v154.json`, `image_grupos_v154.json`, `imagens_descritivas_v154.json` e sete arquivos `img_live_v154_00.json` a `img_live_v154_06.json` com **somente 70 imagens históricas remanescentes**. Mais os 16 recortes Petrobras 10, a biblioteca ativa soma **86 registros**. O filtro de excluídas não reconstrói os 184 IDs removidos. Foram mantidos os estados locais das demais imagens; nenhuma operação apagou o histórico dos cartões, grifos ou imagens remanescentes.

**Limite de segurança:** 36 vínculos candidatos do arquivo de exclusões apontam para arquivos do Google Drive, mas são *associações por nome não verificadas*; nenhum deles recebeu autorização de deleção pelo critério de identidade do arquivo. Assim, **zero arquivos do Google Drive foram fisicamente excluídos**. Cópias e catálogos históricos V153 e anteriores continuam no repositório como backups; o catálogo de produção e as prévias carregadas não os acessam.

Arquivos ativos: `v154.html`, `assets/v154_boot_topic.js`, `assets/v154_atlas_edicao_completa.js`, `assets/v154_image_library.js`. O importador de exclusões V086 e a camada de 184 ocultos V087 não integram mais a página ativa.

## Vade Mecum vigente e autorização
Google Drive vigente: `1Bl5q1QE-HKk_G3JSfcP2qQWdnFhckzHI`, edição Senado 3ª edição com grifos e negritos. O PDF atual de 37.143.909 bytes teve seu **SHA-256 verificado** como `2c836a11dcdae84e62e3e4cac8e449de760f82d9acd13278da50c5634f296a90`.

O módulo `assets/v154_vade_current.js` consulta a cópia local do navegador (IndexedDB) por ID e calcula o hash antes de reabrir. Uma cópia antiga é **recusada**, não excluída, e o botão tenta buscar a fonte atual no Google Drive. O botão `Sincronizar Vade` sempre força uma conferência do Drive. O leitor genérico `assets/v154_drive_direct.js` também obriga a edição vigente ao usar Editar PDF para o ID de estudo do Vade.

O OAuth do site GitHub Pages é client-side e usa access tokens temporários (~1 hora), não refresh tokens. A autorização anterior de consentimento pode ser reconhecida sem guardar credenciais; cópias locais atuais verificadas permitem abrir sem nova conexão. **Não se deve armazenar um refresh token no localStorage de uma página estática**. Renovação permanente segura exigiria fluxo de authorization code com back-end e armazenagem segura do refresh token.

## Auditoria
- 70 miniaturas em sete arquivos de produção; 70 metadados históricos ativos; 16 recortes externos; total 86 IDs sem duplicatas.
- Fonte descritiva e associação de grupos com 86 itens cada.
- Bootstrap V154 montou 50 mil caracteres sem erros de sintaxe, mantendo PDF V002 de 274 páginas (78 PDFs ativos), Flashcards V152, Redação V146 e SRS.
- Testes simulados de navegação em grupos, Petrobras 10, pesquisa global e filtro de excluídas passaram.
- Hash de Vade atual conferido com download autenticado, não estimado.
- **Teste com o OAuth real do navegador do usuário ainda pendente.**

---

# Banco Mestre — V153: Atlas de imagens organizado por assunto (12/11/2026)

A biblioteca **Imagens e pranchas** agora usa áreas e grupos temáticos equivalentes aos da biblioteca de PDFs. Foram associados **270 IDs** pelo catálogo `assets/imagens_assuntos_v032.json`: **254 imagens históricas e 16 recortes Petrobras 10**; as três correções de classificação IMG-044 a IMG-046 foram mantidas. A camada de organização usa `assets/image_grupos_v153.json` com 16 grupos em 3 áreas, sem editar a catalogação técnica original.

A interface apresenta grupos inicialmente recolhidos e monta os cartões de cada grupo sob demanda, preservando o limite original de 24 e o botão Mostrar mais. A renderização continua feita pelo Atlas V060 versionado em `assets/v153_atlas_edicao_completa.js`, incluindo favoritos, edição de título/área/assunto/descrição/notas locais, prévias e originais associados, edição/grifos, vínculos, classificação e status. A navegação usa `assets/v153_image_library.js`. As imagens privadas sincronizadas pelo Drive V084 continuam em painel independente. Os estados de visibilidade pré-existentes, inclusive as 184 exclusões históricas por padrão, permanecem reversíveis e não foram apagados; o que o navegador já marcou explicitamente continua prevalecendo.

**Auditoria:** catálogo de 270 IDs sem duplicatas, associação por grupos sem faltas; bootstrap dinâmico de `v153.html` gerado com sucesso e sem erros de sintaxe; validação de recursos presentes no Atlas legado; testes simulados de diretório recolhido, 86 visíveis por padrão (70+16), grupo P10 com 16 imagens, modo excluídas e busca geral. **Sem teste OAuth real no navegador do usuário.** PDF V002, catálogo de 78 PDFs, filtros de flashcards V152, SRS e Redação V146 preservados.

---

# Banco Mestre — V152: novos filtros de flashcards (12/11/2026)

O portal agora permite selecionar **disciplina → assunto geral → assunto específico → subassunto**, com opções encadeadas, números de cartões por categoria, layout responsivo e botão para limpar. Engenharia Civil reúne seus subgrupos canônicos e legados; Matemática agrupa Matemática Financeira e Estatística; Legislação reúne a base geral e Ijuí; Português e Informática têm filtros próprios. Os 13 assuntos gerais continuam sendo a classificação editorial V128 e o assunto/subassunto específico continuam sendo os dados originais de cada cartão. Busca exata por ID e atalhos do estudo continuam disponíveis.

Implementação: `v152.html` usa `assets/v152_flash_filters.js`, com adaptação somente do predicado de exibição da biblioteca no HTML montado. A classificação foi auditada contra 1.504 cartões ativos públicos+operacionais (1.482 + 22) sem grupos não classificados. Foram realizados testes estáticos do bootstrap (50.253 caracteres montados, sem erros de sintaxe) e testes simulados de filtros encadeados, busca por ID e limpeza. **Navegador autenticado real não homologado.** Todos os cartões, dados de SRS, histórico, PDFs V002, Redação e grifos estão intactos. 78 PDFs ativos.

---

# Banco Mestre — V151: correção da verificação de PDFs (12/11/2026)

A mensagem “Catálogo disponível, mas os PDFs ainda não foram exibidos. Atualize a página.” era emitida pelo verificador V145 porque ainda exigia 79 documentos da configuração V140. O site vigente V150 usa o catálogo `assets/pdf_catalog_v149.json`, que contém **78 PDFs** — incluindo o manuscrito completo atual V002 com 274 páginas e 34 capítulos atualizados.

Foi criado `assets/v151_pdf_check.js` e publicado `v151.html` para conferir o catálogo vigente, os 34 capítulos V002, IDs únicos e a montagem das linhas na biblioteca. O botão **Verificar PDFs** solicita a montagem da lista sem exigir recarregamento. O código legado V145 está preservado, mas não é carregado pelo portal V151. O catálogo V149, o leitor do Drive V147, a sincronização V150, os PDFs, grifos, cartões, SRS e Redação não foram alterados. **Testes estáticos passaram; abertura autenticada em navegador privado ainda não foi homologada.**

---

# Banco Mestre — V150: usar somente a versão atual do manuscrito (12/11/2026)

**Ativa:** manuscrito de Engenharia Civil V002, 274 páginas, PDF integral e 34 capítulos por assunto. Biblioteca V149/V150: 78 PDFs ativos (os 34 capítulos de 252 páginas e o caderno de outubro foram removidos apenas da listagem, sem exclusão física nem alteração de grifos).

**V150 corrige também a sincronização recursiva:** o novo módulo `assets/v150_drive_pdf_sync.js` exclui da exibição 36 IDs antigos conhecidos e arquivos do caderno geral datados de 22/10/2026, mesmo após o botão Sincronizar todos os PDFs. O código original V130 e as fontes históricas permanecem intactos. Essa filtragem atua sobre a lista do site, sem apagar nada do Drive. A autenticação em navegador real ainda deve ser verificada na sessão do usuário.

**Arquivos ativos:** `v150.html`, `assets/pdf_catalog_v149.json`, `assets/pdf_grupos_v149.json`, `assets/v149_pdfs_recolhidos.js`, `assets/v150_drive_pdf_sync.js`, `assets/version.json`. ID do PDF-mestre mantido para preservar vínculos históricos de grifos. Demais PDFs não relacionados, flashcards, SRS, Redação e leitores preservados.

---

# Banco Mestre — V148: manuscrito de Engenharia Civil atualizado em 34 capítulos (12/11/2026)

Publicada a versão V148, com a **versão V002 do manuscrito de 274 páginas** distribuída em **34 PDFs por assunto**, em nova pasta versionada do Google Drive. O índice original de 252 páginas não é reutilizado: as faixas foram remapeadas e todas as 274 páginas foram verificadas sem perda ou repetição. O PDF completo permanece no mesmo ID de Drive e foi atualizado para 274 páginas no catálogo.

O catálogo V148 contém **113 PDFs** (79 registros anteriores preservados + 34 novos capítulos), e o novo índice de grupos foi expandido de modo correspondente. Os capítulos V002 usam IDs próprios `CAP-V002-01` a `CAP-V002-34` para **não aplicar automaticamente grifos dos PDFs anteriores a páginas deslocadas**. Os PDFs históricos, seus IDs, notas, grifos, SRS, 1.499 cartões, redação e leitor V147 foram preservados. As anotações manuscritas não passaram por OCR nem validação técnica/normativa. Abertura de PDF privado com OAuth em navegador real não foi homologada nesta mudança.

Arquivos principais: `v148.html`, `assets/pdf_catalog_v148.json`, `assets/pdf_grupos_v148.json`, `assets/v148_pdfs_recolhidos.js`, `assets/manuscrito_indice_v148.json`, `assets/version.json`. A fonte principal continua no Drive; as versões anteriores permanecem acessíveis.

---

# Banco Mestre — V147: diagnóstico e recuperação da abertura de PDFs no Drive

O erro “Não foi possível abrir a edição direta: Failed to fetch” vinha de `assets/v048_drive.js`, no `fetch()` autorizado de `https://www.googleapis.com/drive/v3/files/{id}?alt=media`. Trata-se de ausência de resposta HTTP, sem prova de falta de permissão ou de PDF inválido.

A V147 preserva a V048 e usa uma cópia isolada `assets/v147_drive_direct.js`, carregada somente pelo portal `v147.html`. Em erro de transporte na primeira URL, tenta `https://content.googleapis.com/drive/v3/files/{id}?alt=media&supportsAllDrives=true`. Diferencia HTTP 401, 403, 404, indisponibilidade temporária e rede/CORS/extensão. Só renderiza bytes com cabeçalho PDF; mostra **Abrir cópia local do PDF** após falha para vincular a mesma identidade e grifos armazenados. O fallback é local, não envia arquivos nem altera a pasta do Google Drive. O usuário pode continuar a usar **Abrir no Drive**.

Os 79 registros, file_id, grifos, notas, SRS, Banco Mestre V024 e Redação V146 continuam intactos. Testes de edição/OAuth com arquivos privados no navegador da pessoa ainda não foram executados: publicação de código não comprova sucesso do download. Antes de novo diagnóstico, verificar a situação e a requisição de rede na sessão autenticada.

# Banco Mestre — V146: dicas compactas e auditoria do encadeamento da Redação

A Produção guiada mantém as três etapas FTTD/TEEC, mas oculta o mini-mapa decorativo com quatro caixas e apresenta um único ícone 💡 ao lado de **Dicas e modelos desta etapa**, em resumo acessível recolhível. Alteração CSS isolada em `assets/v146_redacao_compact.css`, carregada somente por `redacao_temas_treino_v146.html`, sem alteração das respostas, editor, abas Temas/Treino, salvamento V145, fontes, PDFs, SRS ou grifos. A V145 permanece intacta.

**Auditoria funcional:** `treinoProxNivel()` chama `salvarRespostasNivel()`, mantém os valores no objeto `treinoRespostas` e renderiza os campos da próxima etapa, mas não gera, reescreve nem cola automaticamente os textos anteriores. `montarRascunho()` apenas exibe a síntese de respostas; `treinoAvaliar()` avalia os campos da etapa ativa. Melhorias propostas e não implementadas nesta versão: referência lateral dos eixos/TEEC, rascunho composto não destrutivo, comparação de reescritas e validação transversal de tese→argumentos→conclusão. Teste visual em navegador real ainda recomendado.

# Banco Mestre — V144: conferência de compatibilidade da consulta da Redação

Pequeno reparo após auditoria da V143: quando `treinoBuscarContexto` é invocada sem receber um botão explícito, o seletor CSS de fallback passa a ser válido. Isso mantém também o comportamento dos botões legados que não utilizam o novo painel. Os módulos `v143_producao_base.js`, `v143_janelas_redacao.js` e `v143_janelas_redacao.css` permanecem intactos; a Redação V144 carrega exatamente esses mesmos módulos com o reparo no HTML, e o portal V144 redireciona à nova página. Calendário V141, PDFs V140, SRS, Drive/Vade/Grifos não modificados. A publicação via GitHub Pages não substitui homologação visual no navegador.

# Banco Mestre — V143: consulta de notícias e argumentos sem perder o texto

A oficina de Redação continua com somente Temas e Treino e o visual aprovado. Antes, `v138_producao_guiada.js` movia os cinco painéis (brainstorm, eixos, notícias, salvos e sync) para cima dos campos e ainda rolava a página ao abrir. Agora uma cópia versionada do arranjo V138 (`assets/v143_producao_base.js`) suprime scroll automático quando o painel já está em uma área de consulta. `assets/v143_janelas_redacao.js/css` move **os mesmos nós originais** para uma janela lateral no desktop, com editor ainda visível à esquerda; para telas até 1099 px, a consulta ocupa a janela e traz botão fixo **Voltar a escrever**. A ferramenta recorda ID, seleção do cursor e foca o campo correspondente ao fechar; trocar painéis no menu não reabre nem apaga o rascunho. Contexto gerado carrega dentro da consulta, com aviso claro de que manchetes são fictícias e dados requerem confirmação; geração pode exigir a chave de IA já utilizada. Os cliques que aplicam eixos guardam os campos atuais em memória antes de atualizar o formulário. Nenhuma chave `treino_*`, eventos SRS, banco de cartões, catálogo de 79 PDFs, Drive/Vade/Grifos ou calendário foi alterada; versões anteriores arquivadas. QA sintático confirmado, validação visual real depende de navegador.

# Banco Mestre — V142: correção abrangente da legibilidade da Redação

A V139 aplicou regras detalhadas apenas ao núcleo da Produção guiada. Nesta edição foi identificado que Temas e muitos tipos de Exercícios de Redação ainda geravam texto novo com `font-size` de 9–12 px e cores originárias da interface escura. A folha **`assets/v142_redacao_contraste.css`**, carregada por último em `redacao_temas_treino_v142.html`, amplia etiquetas de temas, metadados, filtros, barra de exercício, enunciados, opções, mensagens de feedback, fórmulas TEEC, guias FTTD e conectivos; reaplica contrastes acessíveis inclusive nos nós criados pelos scripts legados, mantendo estilos semânticos dos acertos/erros. Controles A−/A+ existentes continuam e passam a atuar também sobre a maior parte destes textos. Não houve alteração nos scripts de estudo nem no armazenamento `pe_stats` e `treino_*`. O portal V142 preserva a V141 Calendário SRS de 60 min, PDF 79, Drive/Vade/Grifos, e a página V139 continua arquivada. JS estático validado; falta QA visual com navegador real Android.

# Banco Mestre — V141: calendário SRS com teto de uma hora por dia

A aba **Calendário SRS** fornece tabela de 14 dias por página em horizonte de 180 dias, com data, cartões vencidos, quantidade a revisar, tempo estimado, tempo livre, IDs e botão abrir cartão. Tempo padrão 2 min/cartão (até 30 no dia); 1,5/3/4 min configuráveis, sempre no teto de 60 min. Prioridade Errei→Difícil→Bom→Fácil; revisões previstas em data futura não são antecipadas. Fonte: 21 datas auditadas F17/V015 no repositório, rotuladas como históricas; cartões sem evento conhecido não são considerados vencidos. Importação CSV/JSON por ID/data/avaliação armazena dados exclusivamente no navegador sob `BM141_CALENDAR_IMPORT_V1`; nunca altera SRS nem avaliações. Opcionalmente preencher tempo ocioso com cartões novos, identificados sem data. Exporta CSV da agenda. Preserva integralmente o catálogo PDF V140 com 79 documentos, Redação V139, cartões, mídias, Vade/Drive/grifos. Sem teste Android/OAuth visual no navegador do usuário.

# Banco Mestre — V139: ajuste fino de legibilidade na Produção guiada

Mantido o layout da V138 aprovado pelo usuário: editor à esquerda, painel de tema/ferramentas à direita, três níveis FTTD/TEEC, ações de salvar/avaliar/navegar, dicas recolhíveis e exercícios dentro do Treino. Novidade: folha CSS independente `assets/v139_producao_legivel.css` aplicada por último especificamente à aba Produção guiada (`#aba-treino`), corrigindo letras herdadas de 8–11 px para 13–16 px e fundos/paleta com contraste, sobretudo no mini-mapa, guia FTTD, modelo TEEC, fórmulas e porcentagens, sugestões, resumo acumulado e painéis de apoio. Não altera scripts da redação nem a lógica de temas/cartões/armazenamento; todo HTML V138 preservado na V138; arquivos V139 adicionam somente o CSS e o direcionamento para a nova página. Parâmetros SRS, IDs, PDFs, Drive, Vade, grifos e Firebase legado não mudam. Pendente QA visual em navegador Android real.

# Banco Mestre — V138: Produção guiada em fluxo de estudo

A produção FTTD/TEEC deixa de exibir tema, ferramentas, orientações e respostas em um bloco contínuo. Layout principal 2 colunas: editor de redação (esquerda) e painel de tema/ferramentas (direita); celular empilha painel e editor. Barra com 3 etapas, status de preenchimento, estrutura dos quatro parágrafos, dicas recolhíveis, rótulos acessíveis, botões de salvar, avaliar com IA, etapa anterior e próxima. Recursos originais (escolher ou sortear tema, brainstorming, eixos, contexto, progressos salvos, sincronização legada com autorização, guia FTTD, chat de IA e construção acumulada) apenas mudaram de lugar; não foram excluídos. Em cópia versionada do HTML foi adicionada a função `treinoVoltarNivel()` e o seletor de Avaliar foi corrigido para o botão específico (antes pegava Salvar código do painel de sincronização). Conteúdos e storage de redação, `pe_stats`, banco mestre, SRS, PDFs e grifos intactos; versões antigas preservadas. QA estático de HTML/JS e implantação GitHub; ainda não equivale a teste visual Android real.

# Banco Mestre — V137: conferência visual dos exercícios de Redação

Correção de apresentação sobre V136: o primeiro painel de Exercícios estava fora do contêiner lateral, pois o cabeçalho inserido anteriormente também era `div`; a camada V137 o reposiciona por classe `.card`, sem recriar o painel nem os filtros. Os botões de gabarito recuperam indicação verde de acerto, vermelha de erro, e conferência ativa/disabled, sem interferir na lógica de registro. Mantidos o design claro e de alto contraste da V136, as abas Temas e Treino, o controle de fonte A−/A+, todos os exercícios, o progresso local e recursos PDF/Drive/Vade/SRS. A implantação é testada no GitHub Actions; navegação Android real/OAuth não homologadas.

# Banco Mestre — V136: contraste e legibilidade da Redação

A pedido do estudante, a página inteira de Redação foi reformulada em estilo de leitura próximo ao de plataformas de questões: fundo cinza-claro, cartões brancos, texto grafite, barra de navegação azul, ações principais em verde, hierarquia nítida entre título, rótulos, enunciado e resposta. O CSS V136 é carregado por último para neutralizar cores e letras pequenas remanescentes do treinador antigo (inclusive orientações TEEC e dicas de tamanho 9–11 px). Foram mantidas somente as abas Temas e Treino; Exercícios de Redação segue como modalidade de Treino. No desktop: painel lateral de filtros do catálogo e painel de controles dos exercícios, ambos com conteúdo principal amplo; no celular, layout empilhado. Controle A−/Padrão/A+ na barra superior com preferência local isolada `bm136_readable_font`. Não modifica fonte dos textos, critérios, gabaritos, registros de treino, `pe_stats`, Firebase legado, cards/SRS, PDF/Drive, Vade ou grifos; páginas V135 e anteriores preservadas. Publicação de código e testes estáticos não substituem homologação visual Android nem autenticação OAuth.

# Banco Mestre — V135, Redação em tela inteira

Ao clicar na navegação principal **Redação**, o portal abre `redacao_temas_treino_v135.html` na mesma guia, **sem iframe** e usando a largura total da página, com retorno claro ao Banco Mestre. Links históricos `#redacao` também conduzem à oficina. Navegação da oficina permanece apenas **Temas** e **Treino**; os antigos flashcards da redação continuam no modo **Exercícios de Redação** dentro do Treino. Layout refinado para monitor e celular, lista em 3/2/1 colunas, cartões com ação treinar, formulário com campos e grupos de ações, método FTTD acessível, sem perder histórico local. Arquivos V134 e anteriores preservados; dados, chaves, 1499 cartões/1482 ativos, PDFs V131 (72 estáticos), Vade, Drive e SRS intocados. Firebase legado segue opt-in por sessão. Verificação de build/JS não substitui teste de navegador Android/OAuth.

# Banco Mestre — V134: formatação Temas e Treino

A Redação do site apresenta somente **Temas** e **Treino**. O portal removeu visualmente abas antigas redundantes (sem apagar conteúdo ou histórico) e exibe o treinador com cabeçalho compacto. No catálogo, pesquisa, filtros de categorias, cartões responsivos, escolha via teclado e exibição incremental de 24 temas; no Treino, três etapas de desenvolvimento, campos de escrita mais claros, guia FTTD recolhível e contador de palavras; Exercícios de Redação são um modo interno do Treino com filtros em seção separada. Metodologia, banco de temas, exercícios e respostas antigos permanecem os mesmos, assim como PDFs, SRS, Drive, Vade e grifos. Firebase legado permanece dependente de autorização por sessão. Código antigo arquivado em V133. Testes estáticos de JS/HTML executados; teste de navegador Android/OAuth não homologado.

# Banco Mestre — V133, Temas + Treino + Exercícios de Redação

A oficina de redação V132 foi refinada para expor **somente Temas e Treino** como abas da ferramenta original; a antiga aba **Flashcards de Redação** foi renomeada para **Exercícios de Redação** e incorporada como modo interno de Treino, ao lado da Produção guiada FTTD/TEEC. Foram preservados os sete modos de questão (identificação, lacunas, ordenar, classificar, corrigir erros, produção curta, mapa mental), filtros, estatísticas e a chave local de progresso `pe_stats`. Clicar em um tema agora abre o Treino, com confirmação se um exercício atual contiver texto. Banco de temas, planejamentos, níveis, conteúdos, prompts e salvamento legado permanecem; demais abas antigas não são exibidas mas o código histórico não foi apagado. O portal principal apresenta **Redação · Temas e Treino**, **Discursivas**, **Histórico**, ocultando as duas áreas redundantes V130 sem remover os seus dados. Página isolada `redacao_temas_treino_v133.html`; página V132 e versões anteriores mantidas. A integração não altera cards/SRS, grifos, Drive, leitor Vade ou sincronizador PDF V131. Serviço externo Firebase original continua desligado por padrão. Resta validar visualmente em navegador Android real.

# Banco Mestre — V132, restauração da oficina completa de Redação
Código-fonte legado: `main/redacao.html` (SHA c3a446af5b7e09491faf472351905ebeb7d1e7bc). A aba Redação e Discursivas oferece primeiro a Oficina completa em iframe isolado (`redacao_completa_v132.html`, visual claro), com as dez funções FTTD, Argumentação, Raio-X, Cirurgia, Checklist, Temas, Treino guiado, Tutor IA, Flashcards de redação e Mapa mental, mais conectivos. Persistência antiga localStorage preservada no mesmo domínio; registros V130 de redação e discursivas preservados separadamente em abas próprias. Para abrir em tela inteira há link explícito. O legado usava Firebase próprio com código pessoal: o acesso é bloqueado até autorização por sessão e alerta de privacidade. Recursos IA continuam dependentes de chave pessoal Anthropic e não foram validados em serviço real. Os temas "Real BB/CEF" são rótulos históricos a conferir, não certificação da banca. Exercícios de redação não mexem nos cartões canônicos nem no SRS. PDF/Drive V131 permanece íntegro. Ainda é necessária auditoria visual/funcional em navegador Android autenticado.

# Banco Mestre — V131, sincronização geral dos PDFs

Nova versão que preserva Redação/Discursivas V130, Vade Mecum V129, filtros V128, flashcards, SRS e grifos. O botão **Sincronizar todos os PDFs** foi reformulado: consulta recursivamente pastas e subpastas dos dois repositórios de concurso no Google Drive, incluindo acervos extras de NRs e licenciamento. Reconhece novos PDFs por ID ao clicar, evita duplicatas e mantém os 72 PDFs canônicos; novos arquivos aparecem na lista autenticada da sessão. Não publica bytes privados no GitHub nem escreve nos PDFs. Em nova sessão, a consulta pode exigir autorização OAuth novamente. A leitura dos PDFs sincronizados usa o arquivo atual do Drive, evitando a cópia local antiga. Teste funcional simulado: segundo clique identificou 1 PDF novo após a inclusão e preservou os existentes. Navegador Android/OAuth real não homologados.

# Banco Mestre — V130, Redação e Discursivas

Nova aba integrada ao portal V129, preservando a V129 e versões anteriores. Recuperado o método FTTD do arquivo histórico `main/redacao.html`; adicionados modo Redação, modo Discursivas, checklist, histórico local com versões imutáveis, importação/exportação JSON e prompt para correção no ChatGPT. Não há nota de IA no site, nem sincronização automática com Drive ou SRS. Chaves locais: `BM130_ESCRITA_V1`, `BM130_RASCUNHOS_V1`. Requer validação visual em navegador real.

# Banco Mestre — versão atual e política de alterações

**Registro conferido em 11/11/2026.**

- **Site configurado para publicação:** V131 (11/11/2026; PDFs sincronizados em todo o acervo, Redação V130 preservada).
- **Branch de publicação:** `gh-pages` (**não** `main`).
- **Arquivo de entrada:** `gh-pages/index.html`.
- **Fonte de verdade da versão em execução:** `gh-pages/assets/version.json` — conferir os campos `version` e `home` **em toda nova solicitação**.
- **Arquivo HTML correspondente na última conferência:** `gh-pages/v131.html`.
- **Versão anterior preservada:** `gh-pages/v130.html` (Redação e Discursivas). V129, V128 e demais páginas históricas continuam preservadas.
- **Branch `main`:** contém código legado, cujo `assets/version.json` indica V031. **Não utilizar a versão da branch `main` para identificar a versão publicada.**

**Navegação e auditoria de versões:** [Mapa de governança Drive/GitHub](docs/GOVERNANCA_VERSOES_DRIVE_GITHUB_2026-11-11.md). Nota: o texto abaixo contém marcos *históricos*; não interpretar seções V113/V124 como declaração da versão em execução.

## V129 — Vade Mecum no Drive com sincronização manual (11/11/2026)

- O Vade Mecum de estudo (3ª edição do Senado, legislação até janeiro de 2026, com grifos e negritos e sem comentários) foi gravado **no mesmo ID** do arquivo principal no Drive: `1Bl5q1QE-HKk_G3JSfcP2qQWdnFhckzHI`, conservando o endereço existente. Backup anterior: `1JpnoON_KQxhxF0QIFSFcn4AJNcjJOFmr`.
- O portal V128 carregava `assets/v041_vade.js` (21 partes do GitHub) antes de `assets/v044_vade_drive.js`; ambos usavam o mesmo identificador de painel, impedindo a execução da fonte Drive. A V129 troca **na montagem da página** V041 pelo novo módulo `assets/v127_vade_drive.js` e remove o duplicado V044, sem editar o leitor PDF canônico.
- Botões **Abrir Vade Mecum (Drive)**, **Sincronizar Vade do Drive** e link direto para a versão atual. A sincronização usa OAuth Drive somente após consentimento do usuário, exige a leitura atual do arquivo (não usa cache IndexedDB nem partes GitHub), confere hash SHA-256 e salva uma nova cópia no IndexedDB sob ID de estudo estável `VADE-SENADO-2026-GUIA`. Os grifos por página continuam associados àquele ID; exportar backup é recomendado.
- Permanecem 1.499 cartões canônicos, 1.482 ativos, 72 PDFs do catálogo geral, 270 imagens, cartões de Ijuí separados, recursos V128 de assuntos gerais e SRS sem reprocessamento.
- Verificação estática de 15 propriedades de carregamento, fonte, hash e preservação de módulos. **Autorização OAuth real e renderização no navegador Android ainda não homologadas.** Se o Google exigir consentimento, usar o botão de conexão no editor do PDF.

## V124 — remissões jurídicas conservadoras (11/11/2026)

A partir da V123 publicada (cartões da Base Técnica), o portal passa a adicionar `assets/v124_remissoes.js` depois do módulo normativo V121 e antes do grifador. Referência explícita a Constituição Federal ou lei reconhecida fica ligada à norma citada; referência à “desta Lei”, “desta Constituição” ou artigo sem identificação confirmada fica com `target:null` e sugestão separada. Não muda cores, grifos existentes, anotações, IDs, planilha, SRS, PDFs ou cartões.

Testes: V114, V121, `tests/v124_remissoes.cjs`, `tests/v124_corpus_referencias_oficiais.cjs` (20 trechos de fontes oficiais + 32 adversariais) e `tests/v124_integridade_portal.cjs` (HTML V123 preservado). Os 52 cenários são de desenvolvimento e **não** aferem taxa de acerto em leis inéditas. A validação de vigência por edição/hash do PDF, a homologação móvel/OAuth e o corpus BIO maior permanecem pendentes.


## V121 — IA jurídica estrutural (11/11/2026)

Acrescenta `assets/v121_relacoes_normativas.js` e calibrador V121 à interface V120, preservando a base de 1.499 cartões, agrupamento de grifos por parágrafo e todos os dados/SRS. Testes `tests/v121_relacoes_normativas.cjs` e `tests/v121_integridade_portal.cjs`; homologação visual/OAuth ainda pendentes.

## V109 — integração privada dos cartões aprovados (11/11/2026)

- Manifesto/entrada apontam para `v109.html` e preservam `v108.html`.
- Somente o módulo privado de cartões passa de `assets/v093_drive_cards_sync.js` (V022) para `assets/v109_drive_cards_sync.js` (V024 H14), sem divulgar os cartões no repositório.
- Controles esperados após OAuth da conta proprietária: 1.499 IDs, 1.482 ativos, 17 inativos; 175 reformulações H13 + 3 fusões H14; SRS prévio intocado.
- Módulos do grifador V108, o arquivo mestre de grifos, 72 PDFs, Atlas, dados locais e versões antigas permanecem intactos.
- A sincronização precisa ser conferida em navegador real com OAuth; publicação do código não comprova autorização nem atualização de cartões na sessão do usuário.

## V113 — Base Técnica V024 novamente ligada ao portal (11/11/2026)

- A V112 carregava o módulo de cartões `assets/v093_drive_cards_sync.js` (V022 antiga) apesar de indicar V024 no manifesto.
- A V113 preserva `v112.html` e seus recursos de grifos, leitor PDF, SRS, Atlas, 72 PDFs e imagens, trocando apenas o módulo de cartões para `assets/v109_drive_cards_sync.js`.
- Após conectar Google Drive na seção Flashcards, espera-se carregar V024 H14 com 1.499 IDs e 1.482 ativos, mantendo o calendário SRS e fazendo verificação a cada 120 segundos durante a sessão autorizada.
- Sem OAuth, permanece a base V015 pública (1.494 cartões), propositalmente não atualizada com conteúdo privado.
- A publicação de código não comprova teste OAuth no navegador do usuário.

## V062 — inclusão de dois PDFs “ORIGINAL” da CONAMA (10/11/2026)

- Catálogo V062: `assets/pdf_catalog_v062.json` com **65 PDFs**, mantendo os 63 anteriores e respectivos IDs.
- Duas entradas adicionais, distintas das apostilas TEC Concursos: `PETRO10-CONAMA-001-ORIGINAL` (texto da resolução CONAMA 001/1986, 5 páginas) e `PETRO10-CONAMA-237-ORIGINAL` (CONAMA 237/1997, 11 páginas).
- “ORIGINAL” significa cópia do texto da norma fornecida pelo estudante, **não** certificação de consolidação/vigência. Validar atos posteriores ao estudar lei seca.
- Arquivos no Drive: `1NXA2iF85ngyuY4dqQo5mcldbQgk12lpY` e `1qwRg_qaNa7Vin6yTZUIYeYeXjC35FJLj`.
- Editor de PDF V061 mantido sem mudanças; origem dos grifos é o próprio estudante; preservar anotações locais, IDs canônicos, SRS e apostilas já cadastradas.
- `v061.html` e `assets/pdf_catalog_v027.json` preservados como versão anterior. Nova página `v062.html` lê exclusivamente `assets/pdf_catalog_v062.json`.

## Procedimento obrigatório antes de editar o site

1. Consultar **explicitamente a branch `gh-pages`** e ler `assets/version.json` na mesma branch. Não depender de memória, histórico de chat, nome de arquivos ou branch padrão do conector.
2. Verificar se `index.html` remete à versão indicada no manifesto e se o arquivo `vNNN.html` existe em `gh-pages`.
3. Caso haja divergência, alteração simultânea ou versão diferente da registrada aqui, **interromper a edição**, investigar e reconciliar, sem sobrescrever o trabalho mais novo.
4. Modificar somente a versão atual conferida ou criar uma versão sucessora, preservando a versão anterior, conforme a solicitação do usuário. **Nunca modificar V031, V050 ou outra versão anterior por engano.**
5. Em mudanças exclusivamente visuais, manter scripts, conteúdos, dados, IDs dos cartões, PDFs, imagens, históricos, SRS e leitores sem alterações.
6. Após publicar a nova versão, atualizar `gh-pages/assets/version.json`, o redirecionamento de `gh-pages/index.html` e este documento; conferir as alterações e informar a versão publicada.
7. A referência deste documento é um **registro histórico**: a autoridade operacional é sempre o `version.json` da branch `gh-pages`, checado de novo antes de cada edição.

**Regra prioritária:** nunca assumir que a branch padrão `main` representa a versão online; nela o manifesto pode estar muitas versões atrás.

## Backup e etapa do grifador V061

- Código V060 preservado também na branch `backup/v060-before-text-selection-2026-11-10`, commit de origem `a4c6be8198f028b3ac5f35d0f8dcb70363d88f85`.
- V061 inicia o grifo por seleção textual PDF.js: seleção automática de palavras, menu de cor/nota/ID de cartão/desfazer; grifo livre anterior permanece.
- O armazenamento local de grifos `BM030_STROKES_PDF` continua compatível. Originais, flashcards, SRS, IDs, Drive, PDFs e V060 não foram modificados por essa etapa.
- O **backup GitHub não cobre localStorage nem IndexedDB do navegador**. Sincronização Drive, OCR, biblioteca de grifos e extensão Chrome ainda são etapas futuras.
- Consulte `gh-pages/PLANO_GRIFOS_2026_11_10.md` para as 21 decisões aprovadas e o escopo preciso.
- A sintaxe e os arquivos foram verificados; falta conferir interação visual em navegador com PDF real.

## V063 — Biblioteca de Grifos local, Etapa 2 (10/11/2026)

- A **V062 de 65 PDFs permanece intacta**, inclusive as duas resoluções CONAMA originais; a V063 usa seu HTML como base e injeta módulos independentes de navegação e Biblioteca de Grifos em tempo de execução (arquivo `v063.html`).
- Módulos novos: `assets/v062_biblioteca_grifos.js`, `assets/v062_biblioteca_grifos.css`, `assets/v063_grifos_navegacao.js`.
- Biblioteca: busca, filtros (disciplina, assunto, PDF, cor, tipo e favorito), categorias/notas locais; marcas V060 antigas são exibidas como marcações visuais, **sem reconhecimento automático de texto**.
- Exportação manual filtrada em TXT, Markdown, JSON e relatório imprimível; backup manual **integral dos registros de grifo** em localStorage prefixo `BM030_STROKES_PDF:` e metadados `BM062_GRIFOS_META`.
- Backup do código anterior: `backup/v062-before-grifos-v063-2026-11-10`, de origem `3f0824c48481a23fda70dac35db47943e8d14d08`.
- Segurança: nenhuma migração automática; backup **não inclui PDFs, IndexedDB, flashcards nem SRS**. Google Drive continua sem sincronização de grifos.
- **Validação:** sintaxe JS verificada; é necessário teste de uso com PDF real e inspeção visual. PDF V061/V062 e marcações originais não foram modificados.

## V064 — consistência das imagens excluídas e painel de grifos (10/11/2026)

- Publicação: `gh-pages/v064.html`; carregador usa `v062.html` imutável com 65 PDFs e injeta os módulos V063 e V064. Não altera versões anteriores.
- Código novo: `assets/v064_imagens_visibilidade.js`, `assets/v064_painel_grifos.js`, `assets/v064_painel_grifos.css`. Biblioteca V063 intacta.
- **Imagens excluídas:** nas páginas de assuntos, imagens com status `hidden` são ocultadas da grade, dos atalhos IMG e das contagens. Assuntos exclusivamente visuais sem imagens disponíveis não aparecem. O Atlas conserva a opção `Mostrar excluídos` para restauração, sem apagar os IDs, arquivos, marcações ou a classificação original.
- **Painel de grifos:** retrátil, redimensionável, ao lado do PDF editável. Mostra todas as marcações locais da versão/hash em uso por página; permite pesquisar texto/notas, clicar para navegar ao trecho e editar notas. Grifos visuais antigos são identificados como `texto não identificado`, sem OCR automático.
- Backup antes da etapa: `backup/v063-before-image-filter-and-pdf-panel-2026-11-10`, origem `4fb2ab187684e85a50a5d4acfe2314a5408ef60f`.
- Nenhuma limpeza de `localStorage` ou `IndexedDB`, migração automática, escrita em Drive, exclusão de mídia, criação de flashcard ou alteração SRS foi implementada.
- **Validação:** JavaScript e estrutura conferidos. Exige teste com imagens realmente excluídas e documento PDF real no navegador do usuário; não assumir validação visual definitiva.

## V065 — ajuste visual da janela Cartão rápido (10/11/2026)

- Corrigida a sobreposição entre o cabeçalho `bm-v047-card-header` e o botão flutuante de fechar PDF: `assets/v065_cartao_rapido_header.css` afasta a janela do topo, fixa o cabeçalho e mantém o × próprio da prévia acessível.
- Modificação somente visual; sem alterações aos flashcards/IDs/SRS, PDFs, grifos e controles funcionais.
- Backup anterior: `backup/v064-before-quick-card-header-fix-2026-11-10`.

## V066 — backup verificável e envio consentido de grifos ao Drive (10/11/2026)

- `v066.html` mantém o catálogo de 65 PDFs e todas as camadas V062–V065, adicionando `assets/v066_backup_drive_grifos.js` e `assets/v066_backup_drive_grifos.css`.
- Biblioteca de Grifos: botão **Preparar backup**, cálculo SHA-256 e tamanho dos dados, **Baixar JSON** e somente após confirmação explícita do usuário botão **Autorizar e enviar cópia ao Drive**.
- OAuth Google `drive.file` com token somente em memória; cria **novo arquivo privado** em `Meu Drive`, jamais sobrescreve um arquivo existente. Verifica ID, tamanho e metadados após upload; não repete automaticamente em caso de resultado ambíguo.
- A cópia inclui somente `BM030_STROKES_PDF:*` e `BM062_GRIFOS_META`; não inclui PDFs, dados IndexedDB, cartões nem SRS. A exportação pode ser guardada offline.
- **Não é sincronização bidirecional**, nem importação: não houve mescla/remoção de dados nem abertura de arquivos privados do usuário pelo assistente. A ferramenta GitHub não tem acesso ao navegador.
- Backup do código anterior: `backup/v065-before-drive-grifos-2026-11-10`.
- **Validação:** código JS, referências e estrutura checados. Teste real de autenticação, upload, interface e segurança depende de ação autorizada no navegador do usuário; não presumir que já foi realizado.

## V067 — diagnóstico funcional sem alterações de dados (10/11/2026)

- A **V066 foi preservada integralmente**. Backup de código: `backup/v066-before-diagnostics-2026-11-10` (branch de `gh-pages` criada antes da V067).
- Nova versão `v067.html`, com dois arquivos independentes: `assets/v067_diagnostico_local.js` e `assets/v067_diagnostico_local.css`.
- Na **Biblioteca de Grifos**, botão **Verificar agora** lista OK, problemas, alertas e verificações não executadas; botão **Copiar relatório sem dados privados** permite compartilhar somente status e totais agregados.
- No leitor de PDF, botão **Diagnóstico do leitor** permite conferir camada de seleção, identidade da fonte e sobreposição do cabeçalho Cartão rápido aos controles flutuantes quando a prévia está aberta.
- Confere manifesto, catálogo de **65 PDFs**, APIs do leitor/painel, backup, WebCrypto, leitura estrutural dos grifos em localStorage, âncoras e possíveis IDs duplicados, e imagens excluídas que eventualmente ainda apareçam na página de assunto carregada.
- **Privacidade e preservação:** nenhuma gravação em localStorage/IndexedDB nem upload ao Drive; a verificação de imagens usa `BancoMestreImagens.all()` apenas para leitura. O relatório não inclui texto de grifos, IDs de documentos ou tokens.
- **Não é substituto do teste real:** em páginas sem PDF aberto o diagnóstico marca testes como não executados; as operações de OAuth e upload **não são exercitadas**.
- Validação até agora: sintaxe e integração estática. Execução do diagnóstico sobre dados reais depende do clique do usuário no site.

## V068 — grifador avançado no PDF, inspirado no fluxo da Bússola Highlights (10/11/2026)

- Nova versão `v068.html`, publicada na `gh-pages`, preservando integralmente a V067 e o HTML-base V062 com **65 PDFs**.
- Backup do código antes do desenvolvimento: `backup/v067-before-complete-highlighter-2026-11-10` (não inclui armazenamento privado do navegador).
- Motor de PDF `assets/pdf_v068.js` (cópia evolutiva do V061): continua usando `BM030_STROKES_PDF` por documento, hash e página; salva texto, âncora com prefixo/sufixo, retângulos normalizados, cores, estilos, notas estruturadas, tags, favoritos, IDs e histórico incremental.
- Menu flutuante e seleção `assets/v068_grifador.js`: **grifo rápido** por seleção, alternância manual, paleta de seis cores semânticas com legendas personalizáveis, cor livre, sublinhado, sublinhado duplo (motor), tachado e ocultação visual com opção de mostrar; ajuste do trecho por nova seleção mantendo o mesmo ID; exclusão com desfazer imediato.
- O editor de notas inclui nota curta, disciplina, assunto, tags, IDs de cartões **já existentes**, explicação, dúvida, correção, macete, pegadinha, fundamento normativo, fonte e favorito. **Não cria flashcards nem altera SRS.**
- Atalhos padrão: Alt+Q marcador rápido e Alt+W painel; configurações locais, com rejeição dos conflitos de navegador mais comuns. Página com texto digital selecionável é necessária; PDF escaneado mantém grifo livre, sem OCR automático.
- Biblioteca `assets/v068_biblioteca_grifos.js` e painel `assets/v068_painel_grifos.js`: mostram notas estruturadas e tags, exportam metadados completos e possibilitam navegação/edição. `assets/v068_grifador.css` aplica visual suave, paleta compacta e notas em janela grande com identidade própria.
- Preservados: PDFs/Drive originais, dados existentes do localStorage/IndexedDB, imagens excluídas da exibição, cartões, SRS, V060–V067 e backup de código V067. **Não há migração automática de grifos antigos.**
- **Limites:** a funcionalidade opera no editor PDF do Banco Mestre, **não como extensão Chrome**. Google Drive V066 continua backup manual consentido; sincronização bidirecional, importação, OCR e conector ChatGPT permanecem pendentes.
- **Verificações feitas:** sintaxe dos novos módulos, integração no loader V068, renderização de estilos com canvas simulado, edição com mesma identidade/retângulos validados/histórico incremental em testes isolados. O teste de seleção, anotação, escala, OCR, OAuth e visual no navegador real continua pendente.

## V069 — estabilização do grifador de PDF (10/11/2026)

- Publicado `v069.html` como nova versão de `gh-pages`; V068 permanece intacta. Backup de código: `backup/v068-before-highlighter-stability-v069-2026-11-10`.
- Corrigida a temporização da seleção: o evento de página pronta é emitido **após** renderizar a página e vizinhas e liberar o estado `painting`, evitando tentar gravar quando o editor ainda está bloqueado.
- Emite `bm-pdf-storage-changed` somente após escrita bem-sucedida de `BM030_STROKES_PDF`; Biblioteca e painel agora escutam a gravação para atualizar as listas.
- **Desfazer exclusão protegido**: somente reverte a exclusão se o documento, hash, página e versão de mutação ainda forem os mesmos. Não desfaz sem querer uma edição posterior.
- **Seleção reversa corrigida**: prefixo e sufixo da âncora vêm dos limites do `Range`, independentemente do sentido do arraste. O sublinhado duplo ganhou botão na paleta.
- Ao trocar apenas o estilo do grifo, a cor anteriormente escolhida é preservada.
- Arquivos: `assets/pdf_v069.js`, `assets/v069_grifador.js`, `assets/v069_biblioteca_grifos.js`, `assets/v069_painel_grifos.js`.
- Preservados: catálogo de 65 PDFs, V068, grifos legados, cartões, IDs, SRS e imagens já excluídas da exibição. Não houve migração de dados ou gravação no Drive.
- **Validação:** sintaxe, integração estática e casos isolados de gravação/duplicação/edição/remoção; ainda pendem testes reais de PDF e interface.

## V070 — cores oficiais por palavra/trecho e proposta de nota (10/11/2026)

- **Quatro cores metodológicas vigentes:** amarelo = regra principal; verde = agente/autoridade/competência; rosa = exceção/ressalva; azul = condição/limitação/requisito/prazo. As seis legendas provisórias V068 não prevalecem; grifos antigos permanecem como estavam.
- O usuário seleciona palavras ou frases no PDF. Com a opção `Cores automáticas` ligada, um classificador **local e heurístico** tenta separar a seleção em trechos semanticamente distintos, atribui cores sugeridas e cria registros individuais com IDs e âncoras próprios.
- **Atomicidade:** os trechos de uma mesma seleção são salvos juntos em `BM030_STROKES_PDF`, com um único ponto para desfazer; qualquer falha invalida o lote e preserva o estado anterior.
- As marcações geram **propostas** de disciplina, assunto/subassunto e nota curta, inferidas de termos e título do PDF quando há evidência. São sinalizadas `classification_status: sugestao`, e só são confirmadas quando o usuário escolhe manualmente uma cor ou salva a revisão da nota.
- Classificações ambíguas mantêm estado não classificado e precisam de revisão. **Não há interpretação normativa por IA ou precisão garantida**.
- Biblioteca/painel indicam explicitamente `Sugestão não confirmada`, permitem revisão e exportam a distinção entre registro consolidado e proposta. Não são gerados flashcards automaticamente.
- Nova base `v070.html` com arquivos `assets/pdf_v070.js`, `assets/v070_classificador.js`, `assets/v070_grifador.js`, `assets/v070_biblioteca_grifos.js`, `assets/v070_painel_grifos.js` e `assets/v070_cores_metodologia.css`.
- Backup antes da implementação: `backup/v069-before-semantic-colors-2026-11-10`. Não contém dados privados do navegador.
- **Teste:** sintaxe e fluxo estático, casos de regra/autoridade/prazo/exceção e palavras isoladas, gravação atômica, IDs independentes, prevenção de duplicata e rollback simulado. Falta validar seleção real em PDF e zoom no navegador do usuário.

## V071 — atualização da metodologia de cores, com regra principal laranja (10/11/2026)

- A metodologia passa a ter **seis cores**: **vermelho** (`#FF8F96`) para proibições/vedações; **verde** (`#86DCAA`) para obrigações/deveres; **amarelo** (`#FFEA70`) para prazos/números; **azul** (`#89C7FF`) para exceções/ressalvas; **roxo** (`#CCA7FF`) para palavras-chave da banca; **laranja** (`#FFB86B`) para regra principal.
- A versão `v071.html` aponta para `assets/pdf_v071.js`, `assets/v071_classificador.js`, `assets/v071_grifador.js` e `assets/v071_cores.css`, mantendo Biblioteca e painel V070.
- O classificador separa sequências ou palavras isoladas conforme termos identificados, com marcadores coloridos e notas/assuntos sugeridos **não confirmados**. Ex.: "é vedado" vermelho, "deverá" verde, "em até 30 dias" amarelo, "exceto" azul, "exclusivamente" roxo, enunciado geral laranja.
- Cores antigas e registros já grifados **não são recoloridos ou migrados**. As categorias históricas `agente` e `condicao` ainda podem ser lidas e editadas na nova versão.
- O grifador permite escolher a cor diretamente, inclusive uma cor livre. A revisão das notas, cores e do assunto continua sob controle do usuário.
- Backup de código: `backup/v070-before-six-colors-2026-11-10`; não inclui grifos privados no navegador.
- **Validação:** sintaxe do JavaScript, integração dos arquivos e testes isolados de frases; seleção visual e persistência real ainda requerem teste no navegador com PDF aberto.

## V072 — identificação contextual de dispositivos normativos (10/11/2026)

- A `v072.html` preserva o HTML-base V062 e os **65 PDFs**, a paleta de seis cores V071 e os módulos de imagens excluídas/Cartão rápido/backup/diagnóstico.
- Novo classificador `assets/v072_contexto_normativo.js`, carregado **depois** do classificador V071 e **antes** do grifador. Acrescenta reconhecimento de `Art. 5º`, `Art.5º`, `§ 2º`, `§2º`, `parágrafo único`, `inciso IV`, `alínea a`, `Lei nº 14.133/2021` e NBRs.
- O amarelo mantém o significado **prazos e números**: referências normativas numéricas também são amarelas, porém recebem justificativa e nota sugerida de **referência normativa**, não de prazo.
- Diferencia expressões de proibição (`não poderá`, `é vedado`), obrigação (`deverá`), exceção/condição (`salvo`, `desde que`) e palavras absolutas de banca (`sempre`, `exclusivamente`). A propagação da cor encerra na vírgula, evitando colorir cláusulas independentes.
- `assets/pdf_v072.js` grava somente em **grifo novo** dois campos adicionais, `classification_confidence` e `classification_basis`. Biblioteca e painel, via `assets/v072_biblioteca_grifos.js` e `assets/v072_painel_grifos.js`, exibem motivo e confiança, sempre como **sugestão não confirmada**.
- CSS adicional `assets/v072_contexto_normativo.css` e testes de regressão em `tests/v072_classificacao_contextual.json`.
- **Validação:** 33/33 casos isolados, uma frase mista com cinco categorias, notas distintas de dispositivo e de prazo, sintaxe dos arquivos. **Pendente:** teste completo no navegador com PDF real, zoom, salvamento e reprodução da seleção.
- Backup de código V071: `backup/v071-before-contextual-legal-highlights-v072-2026-11-10`. Nenhum grifo pessoal, PDF, cartão, SRS ou status de imagem excluída foi migrado ou apagado.

## V073 — seleção PDF e histórico transacional (10/11/2026)

- Nova versão `v073.html`, preservando `v072.html` e o HTML-base V062 com **65 PDFs**.
- Backup do código V072: `backup/v072-before-selection-stability-v073-2026-11-10`; o backup GitHub não guarda grifos privados do navegador.
- Motor evolutivo `assets/pdf_v073.js`: evento `bm-pdf-render-start` avisa que uma troca de página ou zoom começou; desfazer/refazer restaura anotações e pilhas de histórico em qualquer falha de persistência; criações individuais/lotes, edições e exclusões restauram as pilhas anteriores se o localStorage falhar.
- Grifador `assets/v073_grifador.js`: ao iniciar renderização, remove seleção/âncora antiga; ao renderizar camada PDF.js, **anexa a camada antes de calcular medidas**, impede cliques até ficar pronta, remove versões obsoletas e só então permite marcar palavras; mantém seis cores e classificação contextual V072.
- Diagnóstico sob demanda `assets/v073_teste_grifador.js` + CSS: botão **Verificar grifos** no leitor PDF; confere se a camada selecionável está alinhada, marcações locais são legíveis, IDs e retângulos válidos e se existem grifos multilinha; orienta teste de zoom e reabertura sem alterar o documento.
- **Testes isolados:** 10 cenários de criação multilinha em lote, undo/redo, falhas simuladas de criação/edição/exclusão e recuperação das pilhas de histórico; sintaxe e integração checadas. **Ainda não é teste end-to-end real:** zoom, seleção com mouse, recuperação após reabrir e precisão visual dependem de execução no navegador do usuário.
- Preservados PDF/IDs/SRS e marcações históricas, incluindo exclusões de imagens. OCR, reancoragem assistida entre versões PDF, extensão Chrome e Drive bidirecional permanecem pendentes.

## V074 — um grifo por seleção, sem dividir em segmentos (10/11/2026)

- **Nova regra do usuário:** cada seleção inteira, de uma ou de várias linhas, cria **uma anotação, um ID e uma cor única**. A base de dados NÃO recebe um registro diferente por palavra ou sequência.
- O classificador ainda consegue examinar sinais de cores diferentes dentro do texto, mas essa análise serve apenas para decidir **se há uma cor única defensável**. Nunca chama `addTextHighlights` pelo grifador V074.
- **Cor manual tem prioridade absoluta.** Ao escolher um dos seis botões, grava o trecho inteiro com aquela cor; se o mesmo trecho já está marcado, atualiza a cor mantendo o ID e as notas existentes.
- Automático: um único sinal de categoria confiável aplica **uma cor sugerida para todo o trecho**; sinais conflitantes (ex.: obrigação + prazo) ou ausência de evidência deixam a seleção pendente no menu até escolha manual. Não usa silenciosamente a última cor.
- Notas e assuntos sugeridos continuam não confirmados até revisão. Mudança de cor pelo usuário confirma somente a cor, não a nota/assunto.
- Mantém as seis cores: vermelho `#FF8F96`, verde `#86DCAA`, amarelo `#FFEA70`, azul `#89C7FF`, roxo `#CCA7FF`, laranja `#FFB86B`.
- Arquivos: `assets/pdf_v074.js`, `assets/v074_analise_selecao.js`, `assets/v074_grifador.js`, `assets/v074_grifo_unico.css`; HTML `v074.html`; regressão `tests/v074_selecao_unica_cores.json`.
- Backup anterior: `backup/v073-before-unified-highlights-v074-2026-11-10`. Todos os grifos segmentados *existentes* permanecem sem migração e sem mescla automática; nenhuma anotação é apagada ou recolorida.
- **Testes:** reconhecimento de cinco cores com gatilhos explícitos, bloqueio de seleção ambígua, criação única multilinha, prioridade da cor manual e alteração com ID preservado foram simulados e passaram. **Pendente:** teste no navegador do usuário com PDF real, reabertura, zoom e interface mobile.

## V075 — exatamente seis cores fixas na metodologia (10/11/2026)

- **Vermelho `#FF8F96`:** Proibições e vedações (é vedado, não poderá).
- **Verde `#86DCAA`:** Obrigações e deveres (deverá, compete).
- **Amarelo `#FFEA70`:** Prazos e números (em até 30 dias, 2 anos).
- **Azul `#89C7FF`:** Exceções e ressalvas (salvo, exceto, ressalvada).
- **Roxo `#CCA7FF`:** Palavras-chave da banca (exclusivamente, sempre, jamais).
- **Laranja `#FFB86B`:** Conteúdo importante a destacar, **escolhido manualmente**; substitui o significado de "regra principal" nas marcações NOVAS.
- Paleta do novo grifador tem somente essas seis cores: retirados o seletor de cor livre e a opção de alterar o significado das categorias. Configurações históricas de cores não são apagadas, apenas não alteram a nova paleta.
- Cores sugeridas continuam disponíveis para as cinco categorias objetivas. Seleção neutra ou ambígua solicita escolha manual; não é automaticamente destacada em laranja.
- Mantida V074: **uma seleção = um grifo, um ID e uma cor**, inclusive multilinha. Grifos antigos (inclusive `regra`, `agente`, `condicao` e cores personalizadas históricas) permanecem intactos.
- Arquivos novos: `assets/pdf_v075.js`, `assets/v075_seis_cores.js`, `assets/v075_analise_selecao.js`, `assets/v075_grifador.js`, `assets/v075_paleta_fixa.css`; página `v075.html`; testes `tests/v075_seis_cores_fixas.json`.
- Backup do código anterior: `backup/v074-before-fixed-six-colors-v075-2026-11-10`. Não equivale a backup de dados privados do navegador.
- Sintaxe, classificação, seleção ambígua e preservação das categorias legadas testadas isoladamente. Ainda falta validar a operação visual em PDF real no navegador.

## V076 — flashcards sincronizados com planilha privada do Google Drive (10/11/2026)

- Publicada a página `gh-pages/v076.html`, derivada da V075 **sem alterar o grifador, seis cores, 65 PDFs, imagens, SRS ou o armazenamento local**. Backup de código: `backup/v075-before-drive-sync-v076-2026-11-10`.
- Módulo independente `assets/v075_drive_cards_sync.js`: botão de consentimento Google OAuth `drive.readonly` na área Flashcards. Lê diretamente o arquivo XLSX privado no Drive, ID `1SA-PKBrlaovuNLFMPBx7BByH3BH0Tcsr` (aba `Cartoes_V015`) e valida 1.497 IDs, após autorização do titular. O XLSX e as respostas privadas NÃO são publicados no repositório.
- Atualização automática a cada 120 segundos **somente enquanto a página estiver aberta e o token OAuth estiver válido**. Fora dessas condições não há sincronização do lado do servidor. Alterações futuras devem ser gravadas no mesmo ID de arquivo no Drive; novas cópias requerem reconfiguração do ID. O sistema é de **consulta somente leitura**, não envia alterações do site de volta à planilha.
- Falhas de rede, autenticação ou leitura conservam os cartões já disponíveis e não alteram ID, SRS, PDFs, grifos ou respostas. Os 1.494 cartões V015 permanecem como fallback estático, acrescidos dos 22 Ijuí provisórios.
- Teste JavaScript, leitura/validação do XLSX e fluxo de autorização em navegador simulado passaram (1.497 cartões e IDs CARD-1495 a CARD-1497). **Autorização OAuth real no navegador do usuário e implantação visual ainda pendentes de confirmação**; não apresentar como teste real completo.
- Contrato metodológico: todos os cartões usam a estrutura de lei seca (frente concisa, verso exato e verificável, explicação/macete/fontes separados). Literalidade jurídica apenas para dispositivos legais; demais disciplinas exigem correção técnica e contexto. Cartões antigos preservados até auditoria de atualização. Metodologia oficial atualizada no Google Doc vigente, 10/11/2026.

## V077 — Catálogo completo de PDFs e sincronização por pastas privadas (10/11/2026)

- Manifesto `assets/version.json` e entrada do site apontam para `v077.html`, derivada da V076, sem substituir o grifador de seis cores V075 nem a sincronização de cartões. Branch backup `backup/v076-before-pdf-sync-v077-2026-11-10`.
- Catálogo `assets/pdf_catalog_v077.json` possui **72 PDFs**, preservando 65 anteriores e acrescentando seis PDFs NR fornecidos (01, 05, 06, 07, 17 e 18) e a Lei 15.190/2025 (30 páginas, Câmara dos Deputados). Todos os sete arquivos novos estão na pasta `06 – PDFs e Materiais` do Google Drive, em subpastas NRs e Licenciamento Ambiental. Os PDFs permanecem no Drive; apenas metadados/referências no GitHub. A vigência integral dos PDFs NR não foi revalidada para novembro/2026, e seus títulos identificam versão do arquivo fornecido.
- Índice `assets/pdf_grupos_v077.json` atribui **72/72 IDs** a um grupo de consulta. Corrige omissão de ambos os PDF originais CONAMA 001/1986 e 237/1997 no agrupamento anterior. `assets/v077_pdfs_recolhidos.js` mantém os grupos recolhidos por padrão e permite registros dinâmicos detectados no Drive.
- `assets/v077_drive_pdf_sync.js` acrescenta conexão Google OAuth `drive.readonly` somente mediante ação explícita do titular na aba PDFs. Após consentimento, lista PDFs existentes nas pastas do Drive identificadas por IDs `1_IgIlki_2ZlMmOaKmYuzhiMSjyLa-cnV` (NRs) e `18MsuWSayX7xpBhNmGjSvFmiiv1hF6YZk` (Licenciamento), deduplica IDs/nomes estáticos e revalida a cada **120 s** enquanto a página e o token estiverem ativos. Arquivos novos nessas pastas surgem somente na sessão autorizada, sem a necessidade de atualizar o GitHub. Novas pastas fora dessas duas NÃO são monitoradas. Não há serviço de sincronização em segundo plano nem publicação pública dos bytes.
- Falha de rede/autorização conserva catálogo/grifos/IDs SRS; imagens e flashcards intactos. `assets/v077_diagnostico_local.js` confere manifesto e 72 PDFs. A origem PDF no Drive não é modificada pelo site.
- Verificações: catálogo e grupos 72/72 sem IDs duplicados; arquivos originais de PDF presentes no Drive, permissões privadas verificadas em amostras NR-01/Lei 15.190; scripts estáticos e referências conferidos no GitHub. OAuth real e visualização PDF no navegador do titular **ainda precisam de teste em sessão autenticada**.


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


## V083 — auditoria do art. 1º da Constituição no Vade Mecum (10/11/2026)

- Art. 1º localizado na página 12 do PDF (índice de arquivo 11, primeira coluna); cópia original e a cópia “Banco Mestre Anotado” examinadas. O PDF anotado possui grifo amarelo já achatado no conteúdo, abrangendo caput e incisos I a V; original sem grifo. Ambas as páginas possuem zero anotações PDF editáveis detectáveis; não reescrever ou apagar PDF algum.
- Na V082 o classificador **não reconhecia** o numeral impresso `Art. 1o` e marcava `Parágrafo único` de amarelo, mesmo sem prazo/número. No texto normalizado, espalhava amarelo do número do artigo para palavras do caput.
- `assets/v083_contexto_normativo.js` corrige o reconhecimento do ordinal de artigo (`1o`/`1º`), interrompe propagação de `referencia_normativa` e remove a associação falsa de `Parágrafo único` à categoria numérica. Comportamento esperado: sugestão amarela só para `Art. 1o` como referência; **fundamentos e parágrafo único permanecem sem cor automática**.
- **Limitação importante:** o artigo tem fundamentos da República (conteúdo central) sem palavras-chave típicas de obrigação/proibição/exceção. A cor laranja permanece **manual**; não alegar que a V083 reconheça semanticamente os cinco fundamentos.
- Testes de regressão: texto literal da página 12, versão normalizada, `Parágrafo único` isolado, artigos com proibição/obrigação e `não será autorizada`; **6/6 aprovados**. Teste do leitor com o PDF real no Android do titular ainda pendente.
- Backup do código V082 em `backup/v082-before-article1-cf-v083-2026-11-10`; PDFs, biblioteca, grifos, IDs, SRS, Drive e catálogo de 72 documentos preservados.

## V084 — Atlas sincronizado com Google Drive (10/11/2026)

- Base publicada: `gh-pages/v084.html`, derivada da V083, preservando leitor PDF, classificador normativo V083, grifador V082, seis cores e 270 registros antigos. Backup `backup/v083-before-image-sync-v084-2026-11-10`.
- Nova pasta dedicada no Drive: `CONCURSOS – ENGENHARIA CIVIL/07 – Atlas de Imagens (sincronização)`; ID `1ksSVWrmRaRlDoG4iDtTGvfr2OnPnhnY6`. Está inicialmente vazia. Os arquivos em outras pastas e subpastas NÃO são acompanhados automaticamente.
- Módulo `assets/v084_drive_images_sync.js` apresenta uma seção dentro do Atlas com consentimento OAuth Google `drive.readonly`, busca só nessa pasta, atualiza a cada 120 s enquanto página/token válidos, exibe somente JPEG, PNG, WEBP e GIF de até 15 MB, e obtém os bytes com token somente na sessão via `Blob` e `URL.createObjectURL`. Nenhuma imagem privada é postada no GitHub nem salva no cache persistente do aplicativo.
- Identificador estável de novas imagens `DRIVE-IMG-<fileId>`; não cria ou altera `IMG-001..254` nem `IMG-P10-01..16`, não propaga a classificação temática sem auditoria. Os controles do Atlas antigo e a ordem dos scripts permanecem intactos.
- Abertura pelo editor visual `BancoMestreEditorV030.open` permite grifos salvos somente no navegador, separadamente por ID. Em falhas de conexão ou fim da autorização, a base estática permanece disponível; reconexão necessária. Não há atualização em segundo plano quando o site está fechado.
- Testados sintaxe JavaScript, preflight do manifesto e HTML, existência da pasta, identificador estável, preservação do Atlas e escopo de leitura do token. **Teste real OAuth e exibição das imagens na conta do titular pendentes**, pois a pasta está vazia e a autorização interativa só pode ocorrer no navegador.


## V085 — auditoria e ícones do editor PDF (10/11/2026)

- Auditoria da V084 identificou dezenas de botões com caracteres tipográficos minúsculos ou significado ambíguo em uma barra lateral de 116 px desktop / 83 px celular. O núcleo já tinha ações reais para navegação, zoom, desenho, grifo livre, seleção de texto, borracha, mover, notas, cartões, cobertura, desfazer/refazer e exportação.
- `assets/v085_pdf_toolbar.js`: ícones **SVG próprios do aplicativo**, sem fontes nem dependências externas; preserva **os elementos DOM e respectivos listeners/IDs**, adicionando rótulos claros, aria-label/title, foco por teclado, agrupamento visual, estado de ferramenta, modo de barra compacto/amplo, ajuda e atalhos Shift+S (texto), Shift+C (caneta), Shift+G (grifo livre), Shift+B (borracha) e Shift+H (mover). Conserva os atalhos originais Ctrl+Z/Y e o campo de página já existente V057 (não duplica).
- `assets/v085_pdf_toolbar.css`: layout de sidebar 202px/102px no desktop e 160px/102px no celular, cartões de ferramenta com alvos maiores, seleção visual, paleta acessível e respeito aos estados hidden/disabled. Somente editor PDF, sem alterar o editor de imagens.
- `assets/pdf_v085.js`: mantém PDF V081 completo, incluindo `addTextHighlights`; expõe **resetZoomV085()** e `zoomPercent`, reestabelecendo ajuste original (100%) sob solicitação; protege a ação **Limpar página** com cópia e rollback do histórico e marcas se `localStorage` falhar.
- A V084 **permanece preservada**, assim como a janela V084 experimental, Atlas, sincronização de imagens e arquivos privados, catálogo de 72 PDFs, biblioteca, grifos, IDs de cartões, SRS e versões anteriores. Backup do código em `backup/v084-before-pdf-editor-ux-v085-2026-11-10`. Testes com navegador real Chrome/Android ainda pendentes.

## V086 — Importação das 184 exclusões privadas do Atlas (10/11/2026)

- Fonte fornecida pelo titular: JSON `BancoMestreExcluirImagensDriveV046`, exatamente **184 IDs distintos IMG-###** entre 254 IDs antigos. Lista original preservada no Drive, arquivo privado `1PLYugdUTxtpDmoxOe56LtCG-a1cDKGej`. Dos 184 registros, 36 apontam para arquivos candidatos no Drive, **sem conferência de identidade**; 148 não têm vínculo. Não apagar nem mover arquivos do Drive com base nessa lista.
- Versão do site: `v086.html`, derivada de V085 e preservando por completo o leitor PDF V085, ferramentas do grifador, 72 PDFs, sincronização de cartões, sincronização de imagens V084, 270 imagens existentes e SRS. Branch de backup: `backup/v085-before-private-image-exclusions-v086-2026-11-10`.
- Script: `assets/v086_exclusoes_atlas_privadas.js`. Adiciona ao Atlas, após Google OAuth `drive.readonly`, leitura do JSON privado por ID, conferência de formato, contagem, unicidade e existência dos 184 IDs no catálogo. Permite **confirmar** a importação para o IndexedDB `BancoMestreImagensV023`, em transação atômica; gera backup prévio local `BM086_EXCLUSOES_BACKUP_V1` e oferece reversão das alterações do último lote, respeitando intervenções manuais posteriores.
- Aplicar a lista significa definir status `hidden` para os IDs selecionados **somente no navegador autorizado**. Não publica a lista em GitHub, não altera imagens originais no Drive e não muda grifos/SRS. Não há sincronização dessas exclusões em segundo plano entre navegadores; para aplicar em outro dispositivo é necessário conectar e confirmar novamente.
- Auditoria de origem: 184 IDs únicos, todos presentes no catálogo base de 254, nenhum IMG-P10. A identidade dos 36 links candidatos do Drive NÃO foi validada. Inspeção estática e sintaxe JavaScript validadas; **teste real OAuth e aplicação no navegador do usuário ainda pendentes**.


## V087 — seleção de grifo com classificação manual (10/11/2026)

- Nova metodologia solicitada: **seleção comum do trecho no PDF → escolha manual de uma das seis cores → assunto obrigatório, disciplina/subassunto opcionais → confirmação em Salvar grifo**.
- Todos os botões automáticos bloqueados. Não dividir o texto automaticamente nem abrir IA. Clicar na cor não grava grifo. A camada PDF.js mostra cursor de texto, e a seleção é temporariamente destacada em azul enquanto a paleta de classificação estiver aberta.
- `assets/v087_grifador.js`, `assets/v087_grifador.css` e `assets/pdf_v087.js` contêm as alterações; nenhum outro código histórico foi reescrito. O assunto também fica registrado no objeto `subject_suggestion` e no índice `BM062_GRIFOS_META`. Atualizar classificação de um grifo existente preserva ID e histórico com rollback.
- Integra a V086 **mais recente** (importação privada e reversível de exclusões do Atlas). Módulo `v086_exclusoes_atlas_privadas.js?v=086` permanece carregado; V086 inteira preservada e backup `backup/v086-before-simple-highlight-v087-2026-11-10` criado.
- Mantidos 72 PDFs, 270 imagens, todas as anotações anteriores, SRS, notas, flashcards, arquivos Drive, IDs e backups. Verificação real Chrome/Android permanece necessária.

## V088 — Sincronização da visibilidade das 184 imagens excluídas (10/11/2026)

- A exportação do usuário `BancoMestreExcluirImagensDriveV046` contém 184 IDs únicos de imagens IMG-###, todos auditados no catálogo de 254 imagens anteriores. O JSON original, com títulos, associações candidatas e informações de Drive, permanece PRIVADO em Google Drive ID `1PLYugdUTxtpDmoxOe56LtCG-a1cDKGej`.
- **V088** é cópia da V087, preservando todas as melhorias atuais do grifador de PDF, leitor, seis cores, 72 PDFs, 1.494 cartões públicos, sincronizações anteriores e SRS, assim como os 270 registros de imagens. Backup de código: `backup/v087-before-visibility-sync-v088-2026-11-10`.
- O módulo `assets/v087_atlas_visibilidade_global.js` foi injetado imediatamente após `assets/visibilidade-v026.js` no HTML montado. Aplica globalmente um **padrão reversível de 184 ocultas** por meio de `BancoMestreImagens.all()`; não escreve no IndexedDB por padrão, não altera a fonte canônica e não elimina thumbnails nem grifos. Os **70 IDs legados ativos** e os 16 IMG-P10 permanecem visíveis em navegador sem alterações individuais anteriores. A lista pública contém apenas os 70 IDs ativos; o JSON privado completo, nomes e vínculos Drive não são publicados.
- Estado `visible`/`hidden` EXPRESSAMENTE registrado no IndexedDB pelo usuário tem precedência sobre o padrão para permitir restaurar ou ocultar individualmente no navegador. Desfazer importação V086 não apaga a regra de site: ela é um padrão público; a restauração explícita de cada ID continua disponível.
- Esta operação é **sincronização pontual da seleção V046 com o site**, não sincronização contínua do estado local entre dispositivos e Google Drive. Exclusões posteriores feitas somente em um navegador não entram no padrão global até uma nova exportação/auditoria/publicação. Não apagar documentos do Drive a partir de 36 mapeamentos candidatos por nome, ainda não validados.
- Auditoria técnica: módulo avaliado em JavaScript simulando estados locais, resultando em 184 ocultas padrão, 183 após restaurar uma excluída, 184 após ocultar uma anteriormente ativa. Manifesto e loader V088 inspecionados; teste visual no navegador do titular ainda pendente.


## V089 — reparação do PDF, carregador e seleção por coluna (10/11/2026)

- **Falha fatal encontrada na V088:** a string `const atlasInit='<script src="..."></script>';` continha `</script>` literal dentro do script principal. O HTML encerra prematuramente o bloco, deixando código inválido. V089 substituiu a montagem por concatenação `'<scr'+'ipt ... </scr'+'ipt>'`, mantendo o texto final da tag exatamente igual. Teste de parsing de toda a página passou, com um único fechamento real de `<script>`.
- **Salto de palavras no Vade Mecum:** seleção nativa dos spans PDF.js em páginas com 3 colunas pode atravessar a ordem DOM/colunas. O novo motor `assets/v089_pdf_selection_core.js` trabalha com retângulos extraídos do `getTextContent()`, aplica `Util.transform()`, separa faixas de coluna por corredores verticais, ordena palavras por linhas e impede atravessar colunas. Geometria ambígua, sobreposição e seleções excessivas recusadas em vez de gravar dados incorretos.
- **Seleção:** clique/toque na palavra inicial e na palavra final (ou arraste com mouse). Prévia azul das palavras efetivamente escolhidas. Uma caixa pede a cor entre seis categorias e o Assunto; Disciplina e Subassunto opcionais. Nenhum clique de seleção ou cor grava automaticamente.
- **UX:** barra lateral 142px desktop/88px celular, Selecionar Texto, Mover, Zoom, Histórico e Salvar visíveis. Caneta, borracha, limpeza, grifo livre e exportações secundárias disponíveis em `Mais ferramentas`.
- **Preservação:** mantém PDF core V087 (inclusive original dos grifos), backend de sincronização e dados de cartões V018, cache-bust V018, 72 PDFs, 270 imagens, Atlas global, importação reversível das exclusões, IDs, SRS, notas e Drive. Backup `backup/v088-with-v018-before-precision-selector-v089-2026-11-10`.
- **Testes internos:** sintaxe e fechamento da página, detector de três colunas com variações de largura, falha segura em caso de sobreposição, interação simulada selecionar início/fim e salvar exatamente um grifo com assunto. **Teste real dentro do navegador do usuário ainda necessário.**

## V090 — editor PDF reconstruído em três etapas (10/11/2026)

**Etapa 1 — preservar seletor preciso V089:** arquivo `v089_pdf_selection_core.js` e a geometria de `v090_pdf_precise.js` seguem o mesmo algoritmo de coordenadas/colunas, sem voltar à seleção de spans nativos. Seis cores testadas com um registro/assunto por cor. O grifo automático continua desativado.

**Etapa 2 — edição unificada:** `assets/v090_pdf_precise.js` permite criar, escolher cor e assunto, registrar nota, editar sem trocar ID, excluir com confirmação e listar grifos. Fila de cores: selecionar trechos distintos, adicionar à fila, abrir fila pela barra superior e salvar em lote via `addTextHighlights` (uma operação de desfazer); protege contra sobreposições. `assets/pdf_v090.js` grava a nota já no registro original da criação.

**Etapa 3 — interface:** `v090_pdf_toolbar.js` e `v090_pdf_layout.css` substituem a barra lateral sobrecarregada por barra horizontal navegável e botões reais para seleção, mover, página, zoom, desfazer/refazer, biblioteca, exportar, Drive e Mais ferramentas. As ações chamam o núcleo original. O editor de imagem não é alterado.

**Preservação:** V089 continua disponível; backup `backup/v089-before-v090-editor-2026-11-10`. 72 PDFs, 270 imagens, cartões V018, Atlas, IDs, SRS, arquivos Drive e todas as anotações antigos preservados. Não fazer migração nem reclassificação automática.

**Limitação:** testes de módulos, seleção e simulação de interface concluídos; validação visual real no navegador do usuário ainda necessária.

## V091 — rolagem estável e edição do PDF (10/11/2026)

- **Falha corrigida:** V090 herdou a virtualização V048 com páginas vizinhas, captions como “Página 2 — role para ativar a edição” e `promoteByScroll()`. Rolagem contínua alternava `pageNo`, re-renderizava PDF e reinicializava o seletor, dando impressão de travamento. Em `assets/pdf_v091.js`, remover completamente `renderNeighbor()`, `promoteByScroll()` e qualquer `scroll` handler que inicie render. A leitura rola dentro da página atual, sem troca de página. Páginas anteriores/seguintes passam apenas por Anterior, Próxima e Ir. O zoom funciona como antes. As páginas vizinhas ficam ocultas.
- **Por que não editava no link V089:** `v089.html?utm_source=chatgpt.com#pdfs` abre uma versão anterior do site, não um PDF editável. Cada item tem prévia do Google Drive em `iframe` (somente leitura). O PDF deve ser aberto pelo botão **Editar PDF**, selecionando uma cópia autorizada local uma vez. Se já foi guardado via IndexedDB, **Continuar edição** reabre sem novo envio. Não inferir permissão para buscar arquivos privados via URL do Drive.
- **Proteção:** continuar usando seleção por coordenadas V089, editor manual V090, 72 PDFs, 270 imagens, base V018, IDs, SRS, grifos, notas, biblioteca e Drive. Não modificar V089/V090. Backup `backup/v090-before-stable-pdf-scroll-v091-2026-11-10`.
- **Limitação:** testes estáticos de ausência de render por scroll e pré-validação de loader não substituem navegação real com PDF do usuário.

## V092 — rollback isolado do editor ao primeiro grifador automático de 4 cores (V070, 10/11/2026)

- **Escopo exclusivo:** reverter a experiência de edição/classificação de grifos para o comportamento original de quatro cores e sugestões automáticas V070. Não reverter biblioteca, carregador dos dados, V089 de seleção, V091 de rolagem ou PDF core.
- **Código histórico:** reutiliza diretamente `assets/v070_classificador.js`, regras locais de `classifyWords`, `suggestSubject` e `suggestNote`. As cores exatas retornam: `regra=#ffe04d` (amarelo), `agente=#92e8c0` (verde), `excecao=#ffb3c5` (rosa), `condicao=#a6d7ff` (azul). Esse arquivo é carregado antes de `v092_editor_v070.js`.
- **Adaptação necessária:** `assets/v092_editor_v070.js` usa `BancoMestrePreciseCoreV089` e o mesmo mecanismo `pointerdown/move/up` de V089 para construir palavras/retângulos, sem voltar à camada nativa PDF.js de V070 que selecionava colunas incorretamente. O algoritmo histórico sugere a classificação por trechos depois da seleção, exibe prévia de cores e notas, e só grava ao pressionar **Aplicar as cores sugeridas**. Disponível também o grifo inteiro com escolha manual de uma das quatro cores. Modo automático habilitado inicialmente, podendo ser desligado na janela. Não chama IA externa nem usa chave.
- **Segurança:** cores e notas automáticas permanecem `classification_status='sugestao'`; salvar os segmentos é uma única operação via `addTextHighlights`, respeita grifos anteriores, permite Desfazer. Editar grifo anterior não altera ID nem atribui automaticamente uma nova cor, mesmo que ele tenha uma cor histórica de V091.
- **Arquivos preservados byte a byte:** `assets/v089_pdf_selection_core.js`, `assets/pdf_v091.js`, `assets/v090_pdf_toolbar.js`, dados SRS/Drive, 72 PDFs e 270 imagens. V091 permanece em `v091.html`; backup `backup/v091-before-v070-editor-rollback-2026-11-10`.
- **Testes:** em página sintética de três colunas, a mesma seleção precisa V089 produziu sete trechos classificados nas quatro cores, com zero gravações antes de aplicar e gravação única em lote. Edição posterior de assunto e nota manteve o ID. Falta homologação visual em navegador real.

## V256 — fórmulas matemáticas e lacunas legíveis (18/11/2026)
- **Publicação GitHub:** `gh-pages/index.html` e `gh-pages/assets/version.json` apontam para `v256.html`; `v255.html` foi mantida intacta para retorno seguro.
- **Equações:** MathML nativo com frações verticais e índices, especialmente em `bm249-equation` (Guia de Fórmulas) e `bm198-equation` (cartões); texto-fonte preservado no DOM, sem mudança do Google Drive.
- **Lacunas:** título/ID; taxonomia; tipo, cobertura, etapa e prioridade em campos distintos; relato literal em bloco próprio; diagnóstico do assistente e certeza visível; origem, pesquisa, ações e histórico de eventos com datas locais. O JSON, os IDs, os botões, o cartão PETRO14-C014 e o SRS não foram alterados.
- **Auditoria:** sintaxe JS, leitura GitHub por SHA e caso `M_r = α·f_ct·I_c/y_t = α·f_ct·W_t` com um nó `mfrac` e seis subíndices passaram. Documento `docs/V256_AUDITORIA_VISUAL_FORMULAS_LACUNAS_2026-11-18.md`.
- **Pendente:** validação HTTP do GitHub Pages, observação visual em navegador real desktop/celular, compatibilidade universal de MathML e OAuth entre dispositivos. Publicação do código e homologação visual são coisas diferentes. Não atribuir sincronização ou alteração de SRS a esta mudança.

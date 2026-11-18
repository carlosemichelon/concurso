# V242 — Gestão de lacunas vinculadas aos cartões (HOMOLOGAÇÃO, 18/11/2026)

## Fontes e preservação
- Metodologia Mestre vigente (Google Drive ID `1HXpal_7FFV4_yJsvfhEAEKpB36ym4LEzpb4t1PXHmcc`), adendo **Gestão de Lacunas** de 18/11/2026; 33 decisões PMS-1 preservadas.
- Base de partida: `homologacao/v241-cronometro-cabecalho-2026-11-18`. Branch de trabalho: `feature/lacunas-v242-homologacao`. A entrada oficial `gh-pages/index.html` e `assets/version.json` continuam em V239. Nenhuma mesclagem/publicação foi autorizada aqui.

## Implementado no código de homologação
1. `v242.html` carrega a nova aba **Lacunas**; `assets/v242_lacunas.js` fornece busca textual (acentos ignorados), filtros por disciplina/tipo/cobertura/estado, registro individual, histórico append-only, prioridade e vínculo com IDs.
2. Campos separados para **relato literal do estudante** e **diagnóstico do assistente**. O formulário manual nunca atribui ao assistente o texto digitado pelo estudante; diagnósticos validados podem entrar por pacote de importação JSON preservando a autoria.
3. Campos de origem, questão, disciplina → assunto geral → específico → subassunto, fontes, pesquisa complementar, descrição, cobertura e cartões relacionados. Registros duplicados exatos (questão + descrição + conjunto de IDs) são bloqueados.
4. Botão **Abrir [ID] no leitor** utiliza `BancoMestreVisualizarCardV050.showId` (o leitor único). Se o ID não estiver na base carregada, informa pendência, sem apresentar cartão fictício.
5. Evolução de estados identificada → explicada → em reforço → dominada; para marcar dominada exige evidência descritiva. **Isso não gera classificação SRS.**
6. `controle-estudos-v242.html` contém ação **Registrar lacuna da questão**, que abre formulário na aba nativa, com contexto da disciplina e do tópico; cronômetro e contadores anteriores preservados.
7. `assets/v242_lacunas_drive.js` gerencia **um arquivo JSON privado** no Google Drive, com OAuth `drive.file` fornecido pelo cabeçalho, leitura pós-gravação, SHA-256, bloqueio conservador de conflitos e cópia recuperável antes de importar. `assets/v242_global_drive.js` integra o resultado no status do botão único.
8. Dados privados permanecem no `localStorage` até sincronização real; exportar/importar JSON é uma contingência. Nenhum dado do estudante ou token OAuth é gravado no GitHub.

## Exemplo verificado fora do repositório público
- A lacuna temporal da fluência foi confrontada com `PETRO14-C014_FLUENCIA_CONCRETO_COMPLETO.md`, Google Drive ID `1lV1VrH_1E5B1SEssNX6dcA102lesL4BI`. O conteúdo confirma **cobertura direta** do marco temporal após o carregamento, sem necessidade de segundo cartão.
- A ficha privada de importação V242 separa o relato literal da dúvida e o diagnóstico do assistente. Não é cadastrada automaticamente no portal e não altera o SRS.
- O leitor público atual não foi comprovado como capaz de abrir `PETRO14-C014` (ID operacional do Drive, distinto da base canônica/grade do portal). **Vínculo navegável pendente** até integração do cartão ao leitor único e teste funcional.

## Critérios de homologação pendentes
- Executar navegador real em desktop e celular, verificar navegação, filtros, botão de registro na aba Controle, importação e abertura de cartões existentes.
- Validar OAuth no navegador do proprietário, criação/leitura/atualização do JSON no Drive, conflito entre dispositivos, recuperação e status de integridade; código estático não confirma upload.
- Conferir o conteúdo do cartão PETRO14-C014 (11 módulos, galeria e quadro administrativo) dentro do leitor V165 após sua inclusão operacional, se aprovada e tecnicamente compatível.
- Integrar importação assistida dos diagnósticos de questões estudadas no chat, com auditoria de cobertura e autoria; **o portal estático não executa IA sozinho**.
- Revisar requisitos de backups 30 diários/12 mensais, recuperação integral e conflitos offline no módulo de lacunas antes de publicar.
- Registrar a integração em manifesto, versão e logs só após homologação e autorização; nunca publicar mudanças na V239 implicitamente.

## Testes estáticos
- Leitura por retorno de todos os seis arquivos novos e de seus hashes GitHub.
- Sintaxe dos módulos JS validada por compilação estática no ambiente de trabalho.
- Referências do wrapper para os arquivos V242 presentes; `gh-pages/index.html` aponta para V239.
- **Não** equivale a testes de DOM/navegador, OAuth ou sincronização entre dispositivos.

## Arquivos adicionados
`assets/v242_lacunas.js`, `assets/v242_lacunas.css`, `assets/v242_lacunas_drive.js`,
`assets/v242_global_drive.js`, `assets/v242_controle_tab.js`, `controle-estudos-v242.html`, `v242.html`.

Estado: **PROPOSTO / HOMOLOGAÇÃO TÉCNICA**; não integrado à base canônica, não publicado como home, nenhum evento SRS.


## Continuação de implementação — 18/11/2026, após atualização concorrente
O site público foi promovido por outro fluxo da V241 para a **V242 (cronômetro em dock)**, verificado em `gh-pages/assets/version.json`, `gh-pages/index.html` e `gh-pages/v242.html`.
Por integridade, o arquivo público `v242.html` foi preservado, sem tentativa de sobrescrita. A homologação de lacunas foi consolidada na URL separada
`homologacao-lacunas-v243.html`, construída sobre o HTML V242 ativo e preservando o módulo `v242_timer_dock.js`.

### Novo escopo efetivamente gravado e conferido por leitura no GitHub `gh-pages`
- `homologacao-lacunas-v243.html`
- `controle-estudos-v242.html`
- `assets/v242_lacunas.js`, `assets/v242_lacunas.css`
- `assets/v242_lacunas_drive.js`, `assets/v242_global_drive.js`, `assets/v242_controle_tab.js`
- `assets/v242_operational_cards.js`, `assets/v242_card_reader.js`
- `assets/petro14_c014_v242.json`

### Vínculo real com cartão original
O registro `PETRO14-C014` foi extraído do arquivo original do Drive (ID `1lV1VrH_1E5B1SEssNX6dcA102lesL4BI`) e disponibilizado com 11 módulos de texto integral no leitor V165 estendido. A busca privada de lacunas pode abrir o ID e o painel administrativo do cartão pode retornar à busca. Não foi criado um segundo cartão SRS.

A fonte menciona a figura `fluencia_carga_descarga.svg`, mas o arquivo não foi localizado na busca Drive; galeria do leitor declara a ausência e fornece o link ao original. Não houve imagem fictícia.

### Carregamento da lacuna privada
A ficha previamente gravada pelo chat no Drive `PROPOSTA_LACUNA_PETRO14_C014_2026-11-18.json` foi confirmada (fileId `1VsgPA9lAKwV2MRld-HMFodV4luibPNcG`). Na primeira conexão OAuth, **somente com cadastro local e mestre remoto vazios**, o módulo busca essa ficha pelo nome exato e pela pasta oficial privada, confere o ID da lacuna e cria o arquivo mestre próprio com leitura pós-gravação e hash. O original não é modificado. Com cadastros divergentes, a sincronização bloqueia sobrescrita e comunica conflito.

### Novos recursos
- Quatro filtros hierárquicos reais (Disciplina → Assunto geral → Assunto específico → Subassunto), tipo, cobertura, prioridade, estado e busca textual sem distinção de acentos.
- Registro individual de questão com enunciado, tentativa/gabarito, relato literal e campos de diagnóstico independentes; origem, fontes, cartões, pesquisas e histórico.
- Complementos posteriores ao relato literal preservam o original e são lançados no histórico; dominada requer justificativa de recuperação ativa.
- Ação no Controle de Estudos que abre o formulário de lacuna e transmite disciplina/assunto por `postMessage` com restrição de origem.
- Nenhum evento SRS é criado por essas interações.

### Verificações
- Dez arquivos publicados na branch `gh-pages` **como prévia separada**, cada um com leitura de retorno e SHA de conteúdo idêntico ao da branch de trabalho.
- Sintaxe de JavaScript e scripts inline validada; JSON técnico contém 11 módulos não vazios.
- Testes controlados das APIs sem navegador real: importação da ficha do Drive, preservação literal do relato e separação de autoria, rejeição de estados e duplicidades inválidos, carregamento e cache do cartão PETRO14-C014, todos aprovados.
- **PENDENTE**: acesso efetivo do Google Pages para a prévia, teste em navegador real, OAuth no navegador do usuário, escrita de mestre a partir do site, download no segundo dispositivo, ensaio de conflito sob concorrência e homologação visual/mobile.
- **SEM PROMOÇÃO**: `index.html` e `assets/version.json` continuam apontando para a V242 do cronômetro; a prévia `homologacao-lacunas-v243.html` não é página inicial.


## Resultado da homologação técnica — 18/11/2026 (continuação)

**Status formal: homologação de código/testes controlados aprovada; homologação de produção bloqueada.**

Alterações adicionais conferidas por SHA e leitura de retorno no `gh-pages`:
- `assets/v242_lacunas.js`: gravação local transacional com restauração após erro; não sobrescrever alteração detectada em outra aba.
- `assets/v242_lacunas_drive.js`: criação do arquivo mestre com `parents=['1cDkoy-QgXYdzhOzi8SMSr7g4eB4oskBD']`, exigindo confirmação do pai.
- `assets/v242_global_drive.js`: resposta `empty` agora representa pendência, não sincronização concluída.
- `assets/v243_lacunas_smoke.js`: diagnóstico interativo, somente leitura, sem eventos SRS ou gravação Drive.
- `assets/v242_lacunas.css`: visual do diagnóstico.
- `homologacao-lacunas-v243.html`: inclusão do autoteste, cache bust de recursos alterados e preservação do cronômetro V242.

**Testes concluídos**: 4 cenários de persistência local (escrita, conflito de abas, falha de quota, esquema inválido); 7 cenários de sincronização simulada (primeira criação/importação, download, atualização, conflito entre clientes, idempotência, versão remota divergente, mestre duplicado); 1 cenário específico de destino privado no Drive; comparação literal da frente e dos 11 módulos entre arquivo original Drive e JSON publicado (zero divergências). Arquivos GitHub e versão oficial consultados novamente: `index.html` / `assets/version.json` apontam para V242, não a prévia.

**Pendências impeditivas**: portal HTTP público não acessível pelas restrições de rede deste ambiente; ausência de teste real no navegador e no celular; OAuth autenticado não executado; arquivo `BancoMestre_Lacunas_Mestre_V242.json` não encontrado no Drive (logo, não sincronizado pelo portal); concorrência simultânea sem precondição de escrita atômica comprovada; ciclo de 30 backups diários/12 mensais não testado; SVG original de fluência não localizado.

**Rastreabilidade confirmada no Drive**:
- Relatório: ID `10npIp_a7j6AJ-aiALH1Q7CCto41FKrXh`;
- Checkpoint da homologação: ID `1jbFr226pOJJS81C3edWi0voYaZPnTn3y`.

**Decisão**: manter V243 isolada como prévia, **não mesclar nem promover como página inicial até execução dos testes impeditivos**, sem modificar cartões nem gerar eventos SRS.

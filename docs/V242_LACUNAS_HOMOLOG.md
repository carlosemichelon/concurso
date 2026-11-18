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

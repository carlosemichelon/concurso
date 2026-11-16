# Banco Mestre V184 — sincronização de PDFs, imagens e cartões

Data: 16/11/2026. Implementação de sincronização em sessão autenticada e preservação do portal V183 como rollback.

## Mudanças efetivas
- PDFs: o conector passa a atualizar a biblioteca após qualquer autorização OAuth compartilhada da sessão, não apenas após o login dentro da seção PDF. Preserva o catálogo estático de 78 arquivos e adiciona os PDFs acessíveis do Drive por ID sem mover ou reescrever arquivos, com botão manual de nova consulta. O catálogo estático do GitHub continua versionado separadamente.
- Imagens: a descoberta autenticada no Atlas privado agora percorre as subpastas, incluindo coleções por parte do estudo; usa IDs estáveis `DRIVE-IMG-<id>`, filtra formatos suportados e inclui a pasta de origem na apresentação. A biblioteca pública do Atlas não é alterada; imagens de questões e cartões conservam seus vínculos independentes. Não importa automaticamente para a galeria pública arquivos sem aprovação de referência.
- Cartões: deixa de depender exclusivamente de V045 para ler um snapshot privado. O estudante autoriza o Drive, escolhe explicitamente um `BANCO_MESTRE_PRIVADO_Vnnn_SYNC_aaaa-mm-dd.json` da pasta restrita de sincronização e clica em Carregar. Valida formato/versão, quantidade, IDs únicos, frentes e versos preenchidos, contagens e referências SRS. Não aceita automaticamente propostas nem seleciona por data; não grava SRS, não substitui arquivos canônicos, não publica o conteúdo privado no GitHub.
- Página principal: `v184.html` herda a montagem segura da V183 e troca apenas três módulos de sincronização. Outros leitores, guias, dados públicos, imagens históricas, PDFs e grifos permanecem inalterados.
- A simplificação integral da arquitetura fica para depois da consolidação final da base, conforme Metodologia Mestre; esta versão corrige o fluxo sem reescrever o site.

## Verificações executadas
- Sintaxe JavaScript dos três módulos: passou.
- Sintaxe do wrapper HTML de inicialização: passou.
- Teste simulado com imagem na pasta Atlas e outra em subpasta: ambas detectadas, sem incorporar um SVG não suportado.
- Testes simulados do validador de cartões: snapshot válido aceito, ID duplicado rejeitado, verso vazio rejeitado, evento SRS para ID inexistente rejeitado.
- Leitura e verificação do manifesto: pendente até promoção da V184.
- Execução de ponta a ponta em navegador com OAuth real, permissões específicas do titular, download privado de PDF, carregamento privado de cartões e inclusão pública de novos dados: **NÃO TESTADA**. Não declarar sincronização universal ou permanente.

## Limites explícitos
- GitHub Pages é um site estático. Nenhum código do site lê diretamente todas as conversas do ChatGPT ou grava automaticamente conteúdos recebidos nos chats no Drive. A preparação e gravação do checkpoint continuam ações verificáveis separadas.
- PDFs adicionados ao Drive ficam consultáveis no catálogo dinâmico **após autorização OAuth e sincronização**, sem alteração automática do JSON público de 78 registros.
- Imagens privadas colocadas nas subpastas do Atlas aparecem no painel autenticado; originais guardados em outro diretório e sem classificação Atlas não são promovidos automaticamente.
- Cartões novos só podem ser carregados depois de integrar e disponibilizar um snapshot privado válido e explicitamente selecionado. O site não converte propostas em cartões canônicos e não recalcula SRS.
- Erros de autenticação, rede ou permissão preservam as bases e a apresentação anteriores. Não armazenar tokens no repositório, não alterar acessos ao Drive.
- Datas e contagens em documentos históricos não são indicadores de publicação atual. Comprovar sempre a leitura real e o ID antes de declarar sincronia.

## Recuperação
A V183 continua disponível em `v183.html`. O manifesto `assets/version.json` controla a entrada `index.html`. Em incidente, restaurar `home: v183.html` e `version: V183` no manifesto sem exclusão de materiais originais.

## Próxima validação recomendada
Abrir V184 em sessão privada no navegador, conceder OAuth à conta proprietária e executar: (a) novo PDF de teste em subpasta; (b) imagem de teste em subpasta do Atlas; (c) snapshot privado aprovado com ID de cartão já conhecido e um novo, sem SRS alterado; (d) logout/login e permissões negadas; (e) regressão de leitor PDF e grifos. Registrar resultados e voltar à V183 se algo falhar.

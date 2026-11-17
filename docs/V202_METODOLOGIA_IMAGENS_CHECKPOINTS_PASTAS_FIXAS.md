# Banco Mestre V202 — Edição de imagens e contrato de pastas canônicas
Data: 17/11/2026. Branch ativa: `gh-pages`.

## Interface de imagens
- Nos cartões da aba Imagens, o bloco extenso **Tipo de imagem e cartões vinculados** não é mais montado no cartão de forma permanente. A interface apresenta apenas **Mostrar cartão** (quando um vínculo navegável existe) e **Editar imagem**, além das ações de consulta da imagem.
- **Editar imagem** abre janela nativa `<dialog>` para tipo (Conteúdo/Cartão), função (enunciado/figura/explicação), IDs vinculados e evidência de curadoria. Validação de ID e salvamento em `localStorage` permanecem, sem modificar o catálogo de origem. A curadoria V198 (179 registros) não é reescrita automaticamente.
- Título, área, assunto, descrição, observações, favoritos e ocultação/restauração, antes editados diretamente no cartão, passam para outra janela de edição. Continuam sendo preferências locais, com IDs estáveis.
- Exportar/importar vínculos por JSON é acessado pela janela **Gerenciar classificações**, não por campo de upload persistente.
- O comando Mostrar cartão abre o leitor já existente com `CARD-xxxx` validado. Referência histórica sem cartão navegável não cria rota falsa.

## Pastas fixas: somente IDs, nunca nomes mutáveis
### Imagens novas — ÚNICO destino de gravação
- Pasta Drive: **CONCURSOS – ENGENHARIA CIVIL / 07 – Atlas de Imagens (sincronização)**.
- `folder_id = 1ksSVWrmRaRlDoG4iDtTGvfr2OnPnhnY6`.
- Todas as novas imagens originais, diagramas e índices de mídia autorizados devem ser gravados nessa pasta com `parents:[folder_id]`, sem criar pastas paralelas. Após upload, exigir `files.get` para confirmar `fileId,parents,name,mimeType,size` e, quando possível, hash.
- Pasta histórica de recuperação P11–P14 `1pp1CL9oMYVFHPPzv117DZpy1kA-wyJQo` é **apenas para leitura**; a árvore continua monitorada pelo site para preservar links antigos. Não mover arquivos históricos silenciosamente.

### Checkpoints novos — ÚNICO destino de gravação
- Pasta Drive: **Checkpoints Banco Mestre**.
- `folder_id = 1348cILBcxFG9p2cfPJ3WubmHswPRbD24`.
- Cada checkpoint novo deve guardar **ZIP completo, manifesto JSON, índice de imagens/cartões e relatórios** nessa mesma pasta. A pasta histórica `01_CHECKPOINTS_E_BACKUPS` (`1ziAHgnvKfroZ8meSAjdtJ_M0BNGYQi0S`) é só de leitura.
- O portal só oferece gravação do **manifesto JSON**, não do ZIP. A gravação de manifestos V202 checa o contrato `assets/v202_storage_contract.json`, confirma a pasta oficial no Drive pelo próprio ID, faz o upload com `parents:[TARGET]` e relê o conteúdo. O ZIP deve ser enviado à mesma pasta pela etapa de checkpoint no ChatGPT/Drive; **isso não é comprovado por apenas clicar no portal**.

## Garantias técnicas adicionadas
1. Contrato versionado em `assets/v202_storage_contract.json`, com os **dois IDs de destino canônicos** e árvores históricas autorizadas para consulta.
2. Leitor privado de imagens V202 bloqueia a consulta se as raízes configuradas divergirem do contrato. O Atlas novo continua privado e só aparece após OAuth; não publica automaticamente no GitHub.
3. Registro de checkpoint V202 bloqueia envio se contrato ausente/divergente ou se o Drive não comprovar que a pasta de destino é uma pasta válida pelo ID esperado.
4. Nenhuma operação da V202 modifica originais, SRS, versos de cartões, acervo público de 179 imagens ou PDFs; não cria duplicatas deliberadamente.
5. Atualizar em conjunto os destinos, a metodologia e o leitor exige autorização expressa; nunca trocar um folder_id apenas por nome parecido.

## Procedimento obrigatório para novos checkpoints
- Recuperar todos os arquivos e imagens acessíveis, preservando originais e IDs; gerar ZIP integral + JSON de metadados/relacionamentos.
- Antes de subir arquivos, ler o contrato; usar os IDs canônicos, sem decidir diretório por conversa, data ou nome local.
- Confirmar no Drive que **cada arquivo novo** pertence à pasta correta (`parents`) e que os bytes/arquivo e hash podem ser rastreados.
- Verificar a branch `gh-pages`, sua `assets/version.json`, publicação dos catálogos e o leitor do site. Se falhar, declarar **Drive salvo / site não verificado**, não declarar sincronização plena.
- Manter classificação editorial e estado de publicação separados, respeitando autorizações de imagens privadas.

## Testes e limites
- Simulada a montagem do wrapper V202 sobre o HTML V062: **86 scripts, 74 CSS**, todos presentes, sem scripts ou estilos duplicados.
- Sintaxe dos seis scripts novos auditada, e IDs de pasta comparados com metadados do Google Drive na data.
- O teste visual real das janelas, a leitura OAuth no navegador e o upload efetivo de um novo checkpoint **não** foram executados nesta sessão. Logo, não há garantia de funcionamento completo de cada botão nem de execução de uploads de futuros chats sem verificação.
- O contrato protege **o código do portal e a metodologia**, mas não intercepta automaticamente um upload feito fora dele por outra ferramenta. Para esses casos, a checagem `metadata.parents` e o relatório de checkpoint são obrigatórios.

Rollback de interface: `v201.html`; contrato V202 permanece documentado para todos os novos trabalhos.

# V187 — leitura integrada de 1.490 versos evolutivos privados (16/11/2026)

**Escopo:** incrementar o leitor V165, sem substituir sua resposta original, com um bloco recolhível de 11 camadas após o aluno revelar o verso. A fonte do novo aprofundamento é V157 no Google Drive privado; os bytes e os textos não são publicados no GitHub.

## Garantias
- As fichas públicas continuam 1.499 (1.482 ativas); 22 fichas operacionais de Ijuí continuam separadas. Para ver os 19 IDs extras na lista principal, o proprietário deve usar o sincronizador autenticado V185 com um snapshot aprovado contendo 1.518 cartões.
- O leitor privado de V157 contém 1.518 registros, 1.501 ativos, 17 inativos; **1.490 ativos elegíveis** para leitura neste módulo.
- 11 cartões adiados: CARD-0138, CARD-0194, CARD-0248, CARD-0286, CARD-0350, CARD-0424, CARD-0445, CARD-0502, CARD-0509, CARD-0510 e CARD-0693. Não têm aprofundamento novo visível; seus originais são preservados.
- Autorização Google apenas por clique explícito, escopo somente leitura; SHA-256 verificado antes de carregar qualquer camada.
- Conteúdo exibido após revelação da resposta original e clique em **Aprofundamento integral**; camada fechada por padrão.
- Nenhuma escrita em cartões públicos, SRS, localStorage, IndexedDB, PDF, imagens, Drive nem grifos.
- Em caso de divergência de frente/resposta entre site e V055, o novo módulo adverte e não substitui nenhum conteúdo.

## Testes e limitações
- Teste de integração simulado em Node VM: 13/13 verificações aprovadas, incluindo autenticação acionada por clique, 11 camadas, ocultação inicial, 11 adiados, inativos, preservação dos originais, zero escrita no armazenamento e zero mutação de cards.
- Teste prévio de leitura V159: SHA válido aceito e arquivo modificado rejeitado; 11 adiados fora das buscas.
- Código JS com verificação de sintaxe; integridade estrutural e HTML V186 preservados.
- **Ainda pendente:** teste com autenticação Google real no navegador do proprietário. Chromium local é bloqueado pelo administrador do ambiente. Isso não é homologação OAuth real.
- Publicação segura e reversível: V186 preservada em `v186.html` e backup branch `backup/v186-before-evolutivos-v187-2026-11-16`; o novo módulo não é ativado automaticamente sem autenticação.

## Arquivos
- `v187.html`
- `assets/v187_evolutive_modal_bridge.js`
- Reutiliza `assets/preview_evolutivos_1490_11_adiados.js` como fonte privada já publicada pela V159, sem copiar material particular.
- `assets/version.json` e `index.html` apontam a V187.
- Os módulos de checkpoint da V186 e o sincronizador V185 são preservados.

**Como testar:** abra a seção Flashcards, selecione um cartão como CARD-0001, clique em **Revelar resposta**, expanda **Aprofundamento integral (11 camadas)** e autorize a leitura do Google Drive. Confirme que não há novo aprofundamento nos 11 adiados. Exporte um backup das avaliações e SRS no navegador antes de qualquer sincronização futura.

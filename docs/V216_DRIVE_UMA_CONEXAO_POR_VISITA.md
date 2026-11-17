# V216 — Google Drive: conectar uma vez por visita (17/11/2026)

**Status:** mudança de OAuth da V1, sem Firebase ou servidor adicional. Preserva a V215 integralmente (inclusive TRT01-C003).

## Experiência aprovada
- Quando o usuário abre/reabre o portal, poderá clicar **Conectar Google Drive** uma vez.
- Após conceder acesso, a autorização temporária OAuth é compartilhada por **PDFs e imagens** na mesma aba/sessão, sem nova janela por arquivo.
- O botão **Conectar Drive** no Atlas usa o autorregador de autorização do leitor PDF; a biblioteca de PDFs faz o mesmo. A conexão vinda de qualquer módulo compatível é distribuída pelo evento já existente `bm-media-drive-authorized`.
- Nenhum token, senha ou refresh token é salvo no repositório ou no armazenamento persistente do navegador; o token de acesso fica temporariamente na memória.
- Reabertura da página, expiração do token, revogação de acesso e eventual política da conta Google podem exigir novo clique. Este é o compromisso expressamente aceito.
- Atualização de imagens e PDFs enquanto o site estiver aberto e autorizado continua funcionando pelos módulos existentes; não existe sincronização em background quando o site está fechado.
- Nada de Firebase, servidor, banco duplicado novo ou alteração na V2.

## O que não foi concluído nesta etapa
**Drive-only para todos os cartões e dados ainda NÃO está ativo**: a V1 continua usando os catálogos públicos históricos V194/V198/V149, com leitura do Drive quando autorizada. A migração completa de cartões, índices, SRS, grifos e PDFs precisa de auditoria de paridade e testes de conta, sem apagar dados antes. A conexão única é um passo para o objetivo, não um anúncio prematuro de migração integral.

## Implementação
- `v216.html`: V215 copiada com apenas os scripts de autorização do Drive substituídos.
- `assets/v215_drive_direct.js`: ponto de entrada OAuth principal, `prompt:''`, compartilha token via `BancoMestreMediaSyncV182` e aceita token publicado por outra integração.
- `assets/v215_drive_gallery_feed.js`: abre a mesma autorização para a galeria.
- `assets/v215_drive_pdf_sync.js`: abre a mesma autorização para a biblioteca PDF.
- `tests/v216_single_drive_auth.cjs`: regressão de links e ponto de solicitação OAuth; CI com `node --check`.
- **V215 de segurança:** `v215.html`, sem alteração de conteúdo, perguntas, respostas, PDFs, índices ou layout. Sem alteração na base canônica do Drive.

## Limitação dos testes
Os testes automatizados não conseguem verificar o clique OAuth real na conta do usuário. Após a publicação, confira conectar na seção imagens e abrir PDF na mesma sessão: o segundo não deve pedir consentimento.

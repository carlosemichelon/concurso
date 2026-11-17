# Banco Mestre V1 — decisão: Drive-only + login persistente (17/11/2026)

**Status:** especificação e cliente de integração preparados em branch isolada; **NÃO publicado em produção**. A versão V1 atual permanece utilizável enquanto a migração é auditada. A V2 continua pausada.

## Regra de arquitetura aprovada
1. **GitHub é código e infraestrutura de implantação, não fonte de dados**. Não adicionar bancos JSON/XLSX, imagens originais, PDFs, SRS, grifos, fichas de estudo, manifestos privados ou credenciais ao repositório de código. Os recursos antigos presentes no histórico exigem retirada em uma migração posterior, não uma simples alteração de versão.
2. **Drive é fonte de verdade** para cartões, conteúdo das 11 camadas, imagens, PDFs, vínculos, estudos e registros SRS/acentuação/grifos, com IDs imutáveis e auditoria de revisões. As revisões devem ser lidas/gravadAs no Drive apenas com permissão explícita e regras de conflito.
3. **Login Google persistente** pelo fluxo OAuth de autorização *code flow* com `access_type=offline` e backend HTTPS. Servidor armazena refresh token **criptografado**, vinculado ao `sub` da conta, com acesso mínimo e rotação/revogação; navegador recebe só cookie de sessão `HttpOnly; Secure; SameSite` adequado ao domínio. Não salvar token em `localStorage` ou JavaScript público.
4. **Mesmo domínio para o frontend e o backend**, ou configuração segura de cookies e CORS caso haja domínios separados. GitHub Pages isoladamente não executa backend, não guarda segredos e não mantém uma sessão Google offline.
5. **Atualização incremental:** usar Drive API `changes.getStartPageToken` / `changes.list`, IDs, `modifiedTime`, `md5Checksum` quando retornado, paginação e reconciliação por revisão. Dados são armazenados no Drive; backend pode manter estado operacional mínimo, nunca uma segunda base canônica. Não refazer upload de arquivos não alterados.
6. **Acesso privado protegido:** o frontend V1 deve chamar exclusivamente a API autenticada do **mesmo domínio** (ex.: `/api/banco-mestre/*`), não JSONs de conteúdo versionados no GitHub. Ao expirar/retirar autorização, exibir estado de login e não revelar conteúdo de outra conta. Cache privado `no-store`.
7. **Permissões:** `drive.readonly` para consulta; escrita de resultados/grifos apenas com permissão adicional apropriada, escolhida por consentimento. Não solicitar permissão ampla de escrita desnecessariamente.
8. **Revogação:** reconexão é necessária se usuário revogar acesso, token expirar ou políticas Google exigirem nova verificação. Login persistente *reduz* prompts; não é promessa de ausência total de reautorização. Um aplicativo OAuth externo em **Testing** pode receber refresh token válido por apenas 7 dias; verificar publicação/produção.

## Auditoria de fontes — realizada
| Fonte | Confirmado | Lacuna para migração integral |
|---|---|---|
| Snapshot privado no Drive de 16/11 (V158) | 1.518 cartões, 1.518 registros SRS, 1.490 cartões elegíveis com módulos, 19 registros de questões | verificar cronologia mais recente da base e SRS, 11 cartões evolutivos adiados |
| Índice de imagens do snapshot V158 | 11 vínculos de imagem | **não equivale** ao Atlas editorial V198 de 179 registros; conciliar com inventário real de mídia Drive |
| Biblioteca de PDFs da V1 | 78 referências no catálogo V149 | conferir IDs, versões/hashes, permissões e cobertura do Drive |
| Imagens da V1 | 179 referências em catálogo público anterior, outras imagens diretamente no Drive | mapear IDs e classificações sem duplicar por arquivo, preservar suas edições, cobertura de outros índices |
| Dados gravados só no navegador | grifos, notas, eventuais eventos SRS e preferências | migração *opt-in* com backup anterior, sem sobrescrever dados posteriores |
| Publicação V1 no GitHub | código e conteúdo estático presentes no repositório histórico | servidor e acesso autenticado ainda faltam; remoção de dados só após prova de paridade + backup |

**Nenhum conteúdo privado do Drive foi copiado para esta branch.** Os números acima são contagens operacionais, não dados pessoais nem IDs privados.

## Contrato de API seguro (a implementar no backend)
- `GET /api/banco-mestre/session` -> `{source:"google-drive",authenticated:boolean,lastSync:string|null}`
- `GET /api/banco-mestre/data/{cards|evolutive|images|pdfs|srs|annotations|associations|questions}` -> `{source:"google-drive",revision:string,count:number,records:Array}`
- `GET /api/banco-mestre/media/:key` -> stream somente após autenticação, autorização ao arquivo e verificação de tipo/tamanho; sem proxy aberto por URL arbitrária
- `GET /api/banco-mestre/sync/status` -> último checkpoint, falhas, revisões, sem dados de outras contas
- `POST /api/banco-mestre/logout` -> invalidar cookie/sessão, permitir opção separada de revogar o acesso ao Google
- `GET /api/banco-mestre/auth/google/start` + callback servidor -> consentimento inicial e troca do código OAuth com estado/PKCE quando aplicável; verificar `sub` após login
- Para escrita: endpoints separados, com CSRF, idempotência, autorização de ação, registros append-only e precondição de revisão

## Gatilhos obrigatórios ANTES de alterar a página principal
- [ ] Backend externo provisionado, HTTPS e fluxo OAuth real com conta titular em status adequado (sem segredo no GitHub)
- [ ] Login com cookies seguros, retorno na reabertura, refresh token criptografado e revogação efetiva
- [ ] Base de cartões/11 camadas e registros SRS conciliados integralmente por ID, versão e SHA quando possível
- [ ] 179 registros editoriais e demais originais Drive conciliados, imagens sem duplicação
- [ ] PDFs catalogados conferidos, leitor e grifos preservados (versão/hash)
- [ ] Todos os dados locais relevantes migrados somente após exportação de segurança e confirmação
- [ ] UI V1 testada em desktop e celular com a conta titular; offline, expiração, trocas de conta e cancelamento
- [ ] Versão GitHub sem artefatos de dados, com remediação específica dos históricos públicos (não basta remover arquivos do HEAD)
- [ ] Rollback validado; produção só muda após todos os critérios aprovados

## O que foi implementado nesta branch
- `prototype/drive-only/client.mjs`: cliente de leitura para API same-origin; **sem fallback GitHub, sem tokens, sem JSON de banco, sem URLs privadas**. Não está incluído no HTML V1 publicado.
- `prototype/drive-only/tests/client.test.mjs`: teste de origem Drive, sessão, permissões, falha segura, contagens e ausência de referências a base GitHub.
- `.github/workflows/validar-drive-only-staging.yml`: valida o protótipo na branch de desenvolvimento.

## Referências oficiais
- https://developers.google.com/identity/protocols/oauth2/web-server
- https://developers.google.com/identity/oauth2/web/guides/choose-authorization-model
- https://developers.google.com/identity/protocols/oauth2
- https://developers.google.com/workspace/drive/api/guides/manage-changes

**Bloqueio atual:** não há serviço backend OAuth persistentemente provisionado/autorizado para o domínio. **Não** guardar o `client_secret` ou `refresh_token` em GitHub Pages. Deploy externo requer autenticação e configuração da conta do titular.

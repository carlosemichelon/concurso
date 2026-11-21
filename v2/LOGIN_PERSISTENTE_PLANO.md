# V2 — Conta persistente e sincronização incremental (proposta técnica)

Data: 2026-11-17. Repositório: `carlosemichelon/concurso`. Publicação atual: GitHub Pages (`gh-pages`). V2 em desenvolvimento no PR #29, sem mesclagem na V1.

## Problema confirmado
O cliente atual `v2/assets/drive.js` usava `requestAccessToken({prompt: this.connected ? '' : 'consent'})`. Em cada primeira conexão da página, `connected` era falso e `prompt:'consent'` forçava nova tela de autorização. A V2 agora solicita `prompt:''` quando o usuário clica em Conectar, preservando token apenas em memória, como na documentação do Google Identity Services.

**Limite:** não equivale a login persistente, sessão permanente nem sincronização quando a página está fechada. O usuário ainda poderá precisar clicar em Conectar, trocar conta, autorizar acesso ou recuperar uma credencial expirada.

## Meta funcional
1. Primeiro acesso: `Entrar com Google`, consentimento explícito às pastas necessárias e conexão confirmada do Drive.
2. Aberturas posteriores: sessão do portal recuperada automaticamente e dados previamente sincronizados carregados de armazenamento próprio, inclusive sem consultar toda a estrutura do Drive.
3. Serviço de sincronização no backend atualiza somente arquivos alterados, por ID e versão/ETag; o navegador apenas consulta o estado da última sincronização.
4. Cada pessoa vê apenas seus próprios dados. Identidade, SRS, grifos, anotações, propostas, classificação e vínculo das imagens devem ser vinculados à conta e versionados com rollback auditável.
5. Não publicar automaticamente PDFs, mídias privadas, histórico, planilhas ou IDs sensíveis no repositório GitHub Pages público.
6. O logout do portal não deve ser confundido com desconexão/revogação do Drive; fornecer duas ações distintas com efeitos compreensíveis.

## Arquitetura necessária (ainda não provisionada)
- **Frontend:** manter o GitHub Pages, mas trocar o controle do Drive para um serviço autenticado. Sessão de usuário persistente emitida e validada por um provedor de autenticação, preferencialmente Google, com cookies seguros HttpOnly/Secure/SameSite para sessão web quando arquitetura permitir.
- **Backend HTTPS:** fluxo OAuth Google *authorization code* com proteção de estado/PKCE quando aplicável, troca do código e guarda criptografada do refresh token no servidor, nunca em JS público, localStorage, repositório GitHub nem URL.
- **Armazenamento por conta:** banco de dados e armazenamento de arquivos privado, com autorizações por usuário (RLS ou equivalente), histórico de alterações e backup.
- **Sincronização:** tarefa agendada no backend. Inicialmente consulta incremental de metadados/arquivos das pastas autorizadas; guardar ID/versão/hash/modifiedTime e última verificação. Mecanismo de changes/webhooks pode ser avaliado, sem prometer cobertura total antes de homologação.
- **Publicação separada:** catálogo GitHub somente de conteúdo expressamente público e auditado; originais no Drive ou storage privado. Nenhum token do GitHub no navegador.
- **Limitações do navegador:** dados locais da V1 (SRS, grifos) permanecem intactos; migração para a conta exige backup antes e consentimento específico, sem importações silenciosas.

## Etapas propostas
- A. **Correção de UX no cliente atual (implementada na branch V2):** não forçar `prompt:'consent'` a cada clique. Teste unitário acrescentado.
- B. **Identidade persistente:** configurar projeto externo de autenticação, domínio permitido, backend e cookies/sessão segura. Ainda não implementado; depende de provisionamento.
- C. **Vinculação única do Drive ao usuário:** usar autorização do lado servidor, guardar refresh token criptografado e testar revogação, expiração e consentimento seletivo. Ainda não implementado.
- D. **Dados pessoais:** esquema por usuário, auditoria e migração opt-in dos registros locais. Ainda não implementado.
- E. **Atualizações incrementais:** trabalho agendado, monitoramento de falhas, publicação diferenciada. Ainda não implementado.
- F. **Homologação:** teste com conta real no navegador, abertura posterior, novo dispositivo, expiração, logout/desconexão, falha de rede e recuperação de backup. Pendente.

## Critérios de aceite
- Reabrir site sem solicitar nova sincronização completa de todos os arquivos.
- A sessão do portal persiste de forma segura e é revogável; autorizações Google não são armazenadas em cliente.
- O usuário visualiza quando houve última conferência e se os dados exibidos são cópia armazenada ou leitura atual.
- Alterar uma imagem no Drive não duplica IDs nem sobrescreve classificações manuais.
- Falha do Drive não apaga o catálogo publicado nem dados de estudo existentes.
- Conta B nunca recebe PDFs/imagens/grifos/IDs privados da conta A.
- V1 e PR V2 continuam isolados até homologação explícita.

## Referências técnicas Google
- https://developers.google.com/identity/oauth2/web/reference/js-reference
- https://developers.google.com/identity/oauth2/web/guides/choose-authorization-model
- https://developers.google.com/identity/protocols/oauth2/web-server

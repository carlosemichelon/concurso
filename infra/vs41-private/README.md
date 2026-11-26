# Banco Mestre — integração multiusuário experimental

## Referência vigente

A fonte normativa é a Metodologia e o Guia oficiais do Drive (VM19 conferida em 26/11/2026). O manifesto oficial `assets/version.json` é a referência de versões técnicas: VS = site, VC = cartões, VD = Drive, VR = revisões, VI = imagens, VM = metodologia. A base de referência desta branch é VS41/VC52, VR3, VI9 e VD1. O campo method do manifesto ainda indica VM16; isso não substitui a VM19 efetiva no Drive. VD1 é um marco operacional, não prova de conciliação integral. Os números Vxxx antigos são somente referências de compatibilidade, origem e rollback. Não criar outra família de versões nem renumerar históricos. Atualizar apenas o componente efetivamente alterado; commits experimentais não são versões publicadas.

## Fluxo mínimo de estudo (VM19)

Identificar o banco autorizado uma vez na abertura, consultar índice e cartões necessários, elaborar ou evoluir com os 11 critérios e até três perguntas iniciais, conferir uma vez e salvar no delta privado existente. Um delta ativo por sessão; checkpoint leve até cinco questões ou troca de chat. Consolidar índice e snapshot privado juntos a cada 50 IDs distintos ou por encerramento/publicação expressa. Sem alteração privada, sem novo snapshot. Não criar filas, prévias obrigatórias, reservas paralelas, relatórios, cadeia de gerações ou reconstruções integrais por questão. Preservar originais, IDs, mídias, vínculos, histórico, lacunas e SRS. O catálogo público e seu índice de IDs não substituem as fontes privadas. Propostas sem destino ou autorização confirmados permanecem recuperáveis; não inventar IDs.

## Arquitetura e alcance

- Host autenticado: reaproveita a interface original, altera apenas os adaptadores necessários; acesso por sessão, cookies HttpOnly/Secure/SameSite, CSP e lista de recursos permitidos. Não serve genericamente o repositório nem usa fallback administrativo.
- Drive individual: um cliente OAuth do aplicativo, consentimento e token próprios por conta, titularidade e isolamento conferidos. O login no portal não autoriza o conector Drive do ChatGPT. O botão Banco para o chat é identificação auxiliar, não credencial de escrita.
- Adaptadores experimentais: cartões, revisão e calendário (VR3), lacunas, mídia, PDFs, grifos, galeria, anotações de imagens, controle de estudos, cronômetro e guia de fórmulas. Os testes automatizados de duas contas simuladas e interface original passaram; isso não é homologação de todas as operações com dados reais. Os intervalos existentes não são recalculados. Recursos legados não integrados, importações, exportações, dados históricos, concorrência entre processos e volume real ainda exigem validação específica quando pertinente.
- Figuras editoriais públicas: acesso autenticado somente se a associação de cartão/mídia/caminho corresponder ao snapshot oficial. Originais privados não são publicados. Leitura de metadados legados não comprova recuperação de bytes.
- `catalog.mjs` reconhece o formato histórico privado e um delta compatível em modo interno de manutenção (`nativeSnapshotOnly`); verifica ponteiro explícito, titularidade, bytes e vínculos, sem gravação. Esse modo não está ativo nas rotas de estudo, não confirma vigência e não reconcilia SRS, mídia ou histórico. Não reaplicar deltas já incorporados. Funções de validação editorial, IDs e consolidação são puras, opcionais e não criam armazenamento.
- Não há importação direta ChatGPT→portal, promoção de cartões nem sincronização privada automática homologada. Usar as fontes e a operação existentes, não criar uma base nova. A branch oficial gh-pages permanece separada.

## Próximo passo: OAuth direto no navegador (decisão posterior)

A prévia isolada `preview-drive/index.html` reutiliza o fluxo Google Identity Services com Client ID público, escopo drive.readonly e token temporário apenas em memória. Usa o mesmo validador de cartões do leitor experimental, aceita link explícito do snapshot privado ou ponteiro e verifica titularidade, privacidade, revisão e hash quando disponível. Sem servidor, Refresh Token, Client Secret, persistência, fallback público ou gravação. Não é substituto da interface oficial nem homologação da fonte vigente: não aplica deltas, SRS, mídia ou lacunas; o arquivo deve ser confirmado pelo usuário. A publicação da prévia isolada exige autorização e a origem JavaScript do cliente deve ser cadastrada; a branch não é o site publicado. A prova real depende do consentimento Google.

## Alternativa anterior: servidor (adiada)

Usar somente raízes privadas de teste, não o banco real nem uma credencial administrativa comum. Node 22+; configurar no ambiente privado do servidor `BM_USERS_JSON` (um perfil na primeira homologação, dois distintos na segunda: username, subject, rootId, profileId, passwordHash), `BM_GOOGLE_CLIENT_ID`, `BM_GOOGLE_CLIENT_SECRET`, `BM_GOOGLE_GRANTS_JSON` (subject, permissionId e refreshToken de cada conta após consentimento). Manifestos e coleções de teste `private-only`, com appProperties do contrato existente bm-portal-multi-v1. Executar:

```sh
node infra/vs41-private/preflight.mjs
```

Com uma conta o preflight confirma apenas a leitura autorizada (multiuserVerified=false, crossChecks=0); com duas, verifica duas leituras e quatro acessos cruzados negados. Não grava. O diagnóstico legado `test-drive.mjs` (duas pastas na mesma conta) não substitui esse teste. Não inserir credenciais, IDs físicos privados ou dados pessoais no GitHub, navegador ou chat. A fonte privada vigente, o delta, o registro de IDs e permissões adequadas devem ser confirmados antes de ligar o banco real; o compartilhamento amplo de outras pastas não autoriza migração. Não alterar permissões sem autorização.

## Manutenção

Testes existentes em `.github/workflows/vs41-private-cards.yml`; reutilizar resultados válidos. Não executar manutenção global em sessão de estudo. Último código funcional validado: ca74e197192c3ca090d9f23184da762b21667acb ([CI](https://github.com/carlosemichelon/concurso/actions/runs/45747022512)). O histórico detalhado anterior deste README está preservado no Git (mesmo caminho nesse commit), não é procedimento vigente. Até confirmar acesso real e fonte atual, não ampliar infraestrutura por especulação nem declarar implantação ou sincronização.

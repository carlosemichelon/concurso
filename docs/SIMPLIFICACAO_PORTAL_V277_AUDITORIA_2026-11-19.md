# Auditoria de simplificação do portal — V277 (19/11/2026)

## Escopo e limite de segurança
A branch de publicação é `gh-pages`, não `main`. O GitHub Pages serve arquivos estáticos; a integração com Google Drive, autenticação OAuth e sincronização são implementadas no navegador, com Google Drive como armazenamento privado. Não existe aqui um servidor de aplicação dedicado cuja remoção se justifique.

**Invariantes:** não alterar 33 decisões PMS-1; IDs originais; 11 módulos; SRS e avaliações; versões de conteúdo; relatos literais, lacunas, PDF, Atlas, imagens e grifos; regras de consentimento e verificação antes de declarar sincronização. Não copiar conteúdos privados nem tokens para a branch pública.

## Inventário observado da V277
- `gh-pages`: 304 entradas diretas na raiz, incluindo versões históricas; `assets`: 875 entradas diretas; `.github/workflows`: 29 workflows.
- `index.html` e `v277.html`: 135 referências a scripts JS, 18 referências a CSS, antes desta alteração; 3 scripts inline.
- Cinco CSS do cabeçalho, aplicados consecutivamente e em cascata: V263, V264, V265, V266 e V270. Total do conteúdo: 25.609 caracteres (sem separadores).
- `assets/version.json`: cerca de 247 kB, incluindo notas históricas; sua leitura/consumo deve ser mapeada antes de reduzir o manifesto.
- `assets/v268_global_drive.js`: concilia conexão OAuth, consulta de mídias, PDFs, controle, backup, lacunas e grifos, incluindo um ciclo periódico de 120 s.
- Teste estático histórico V263 esperava 1.518 cartões + 22 operacionais, enquanto o manifesto V277 anuncia 1.533 + 22. O teste estava defasado, não necessariamente a base.

## Mudanças pequenas nesta proposta, SEM publicação automática
1. Consolidação exata, em ordem, dos cinco CSS de cabeçalho em `assets/v277_header_compiled.css`. As cinco fontes históricas continuam intactas para rollback. Os dois HTML públicos em V277 passam de 18 para 14 links CSS: redução de 4 requisições CSS (22,2% dos links), sem afirmar ganho de tempo medido.
2. Teste `tests/v277_header_bundle.cjs`: confere igualdade literal entre CSS original e bundle; garante que somente a referência CSS muda, que existem 135 scripts e que os arquivos antigos não são carregados em duplicidade.
3. Atualização de `tests/v263_static_integrity.cjs`: preserva a versão histórica, mas valida o catálogo corrente por invariantes (`canônicos + propostas editoriais = grade`) em vez de valores estáticos já obsoletos. O teste não declara que cartões privados foram sincronizados.
4. Integração do novo teste à rotina CI existente. Nenhum workflow adicional.

## Próximas simplificações propostas — NÃO implementadas
**P1 — Medir antes de cortar JS:** mapear dependências dos 135 scripts e eventos globais; carregamento sob demanda por área (PDF/grifos, imagens/Atlas, redação, Controle, fórmulas), mantendo o módulo de cartões e autenticação prontos quando necessários. Nunca concatenar JS clássicos sem auditar escopo global e ordem de execução.

**P1 — Contrato de dados e adaptadores:** separar no cliente `AuthDrive`, `SyncCoordinator`, `CatalogReader`, `MediaRepository`, `StudyRepository` e `SyncDiagnostics`. Uma operação por módulo em curso; reusar Promises concorrentes; relatar `verificado / pendente / conflito / erro`. Conservar operações de escrita somente com escopo e consentimento válidos; nenhuma escrita no SRS pelo botão de sincronização.

**P2 — Manifesto enxuto:** manter em `version.json` só versão, origem, integridade, contagens e caminhos; mover histórico textual a documento carregado sob demanda, se e somente se nenhum consumidor depender dele. Os bytes só diminuem depois de testes dos leitores.

**P2 — Testes e GitHub Actions:** categorizar 29 workflows em atuais/históricos; evitar execução redundante nos PRs sem apagar testes de regressão. Parar de introduzir regras dependentes de contagem congelada em testes de versões antigas.

**P3 — Arquivos antigos:** preservar versões/rollback no Git e avaliar redução apenas do que é transferido ao usuário. Não apagar arquivos de mídia ou versões sem inventário de referências e validação de URLs existentes.

## Validação pendente
- Testes automatizados da PR (incluindo renderização Playwright desktop/mobile), comparação de layout, abas e leitores.
- Fluxo OAuth real em navegador autenticado, sem divulgar credenciais; conflitos e dados privados devem continuar preservados.
- Medição de rede e de métricas de carregamento antes/depois; 4 requests CSS a menos é contagem estrutural, não medição de velocidade.

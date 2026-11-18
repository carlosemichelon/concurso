# Banco Mestre V259 — carregamento estático e correção da biblioteca de PDFs

Data: 18/11/2026. Solicitação: simplificar o JavaScript que mostra o portal em etapas; corrigir a aba de PDFs aparentemente vazia mesmo após conectar o Drive. Base anterior V258. Mudança conservadora e reversível.

## Diagnóstico reproduzível

1. O antigo `index.html` consultava `assets/version.json`, redirecionava para `v258.html` e então buscava `v062.html`, aplicava substituições e executava `document.write()` para construir a página, gerando etapas visuais evitáveis.
2. CSS inline `html:not([data-bm217-pdf-verified="true"]) #pdfRows{display:none!important}` ocultava **toda a lista** até a verificação Drive, inclusive quando o catálogo histórico de 78 PDFs estava localmente disponível.
3. CSS consolidado da camada antiga também ocultava `#pdfs #bm-pdf-sync` com `display:none!important`, tornando invisível o botão específico de conferência e seu status.
4. `v149_pdfs_recolhidos.js` considerava qualquer lista que não contivesse os 78 IDs históricos um catálogo inválido. Entretanto, a sincronização V217 intencionalmente usa somente os PDFs efetivamente confirmados, podendo retornar um subconjunto ou zero, com sintonia de grupos já cadastrados.
5. Uma conexão OAuth partilhada podia ter sido concedida antes de o módulo PDF instalar seu listener; nesse caso faltava iniciar a consulta após a inicialização, exigindo ação manual.

## Alterações versionadas

- `v259.html`: HTML **pré-montado** a partir da V258 e da V062 na publicação. Não há fetch de V062 nem `document.write` no runtime. Mantém os scripts externos na ordem anterior, substituindo apenas os dois módulos específicos de PDF e o leitor de versão. Inseriu verificação de rota antecipada para `#formulas`, estudo padrão e redirecionamento de `#grifos`.
- `index.html`: a mesma página estática V259 é servida na raiz do site; não faz mais consulta ao manifesto/redirecionamento ao entrar na raiz. A cópia exata do redirect anterior ficou em `docs/index_v258_redirect_backup.html`.
- `assets/v259_site_version.js`: usa atributo de versão da página para rotas `/index.html` ou `/`, preservando o leitor V232 em páginas `vNNN.html`.
- `assets/v259_pdfs_recolhidos.js`: diferencia catálogo histórico pré-verificação e lista parcial/zero verificada do Drive; não bloqueia renderização por IDs históricos não localizados. Mantém os 78 vínculos e grupos de origem, mas exibe somente os confirmados após uma sincronização concluída.
- `assets/v259_drive_pdf_sync.js`: retoma consulta quando a conta já estava autorizada, informa estado não verificado e marca conclusão antes da atualização de grade. Não altera PDFs, ACL, Drive, grifos ou IDs.
- `v259.html` também libera visualmente `#pdfRows` e `#bm-pdf-sync` por CSS explícito e apresenta um aviso: **referências catalogadas não equivalem a arquivos confirmados**.

## Auditoria executada

- `pdf_catalog_v149.json` tem **78 PDFs com IDs únicos**; `pdf_grupos_v149.json` contém **78 associações exatas** e **24 grupos**, sem IDs ausentes ou extras.
- Testes da regra de catálogo: 78 históricos íntegros → aceito; 5 PDFs confirmados → aceito; 0 confirmados → estado vazio explícito; lista histórica incompleta antes de verificar → aviso de integridade.
- Todos os grupos retornados pela função `inferGroup()` existem no índice.
- O HTML estático preserva a sequência de **131 scripts externos** do build V258, exceto três substituições versionadas explícitas (PDF grupos, PDF Drive, leitor de versão).
- O catálogo histórico aparece enquanto não houver conferência Drive, **rotulado como não verificado**. Depois de conferência concluída, a lista é substituída pelos PDFs realmente localizados, sem inventar disponibilidade para os históricos ausentes.
- O carregamento CSS consolidado V257 permanece intacto. Nenhum evento SRS, cartão, sessão de estudo, arquivo privado ou grifo foi modificado.

## Etapas independentes de verificação

- Fonte no GitHub / manifesto V259: salvar e ler de volta.
- Testes estáticos: fonte, presença de IDs e módulos, lógica de subconjunto e grupos, sintaxe e política de não exclusão.
- Teste visual/funcional ao vivo com OAuth e Android: **PENDENTE**. Não afirmar que PDFs privados efetivamente carregaram na sessão do usuário sem este teste.
- Medidas de LCP/INP/CLS/TTI no navegador: **NÃO REALIZADAS**. A redução de etapas de inicialização não equivale a percentual comprovado de velocidade.
- O portal ainda usa scripts históricos externos em sequência; carregamento seletivo requer mapa de dependências e testes antes de alterar ordem.

## Recuperação

- Página anterior: `v258.html`, íntegra.
- Root redirect anterior: `docs/index_v258_redirect_backup.html` (arquivo versionado).
- Histórico GitHub preserva os commits, permitindo reverter somente a apresentação se necessário.

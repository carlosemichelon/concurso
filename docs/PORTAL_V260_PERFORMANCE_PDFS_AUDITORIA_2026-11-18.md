# Banco Mestre V260 — abertura direta, biblioteca PDF corrigida e renderização progressiva

**Data:** 18/11/2026. Origem: pedido expresso de acelerar o site e corrigir os PDFs que aparentemente não aparecem mesmo com o Drive conectado.

## Mudanças concretas

- **Index estático:** o arquivo `index.html` é agora o HTML final já montado; não faz requisição a `version.json`, não redireciona para outra página nem usa `document.write()`. O HTML foi compilado a partir do carregador V258 + sua base V062, preservando 131 referências de scripts na mesma ordem, com somente três substituições específicas introduzidas em V259.
- **CSS:** bundles V257 mantidos. Evita sobreposição de CSS antigo que escondia `#pdfRows` até o Drive ser conferido e também escondia `#bm-pdf-sync`, incluindo seu botão e status. O painel de sincronização foi reexibido.
- **Estados PDF explícitos:** referências do catálogo histórico são rotuladas como **não verificadas** antes da consulta ao Drive; depois de uma consulta bem-sucedida, são exibidos os PDFs confirmados nas pastas monitoradas. Se houver 0 confirmados, um estado vazio visível é exibido. Não afirmar que PDFs não encontrados foram removidos do Drive.
- **Grupo de PDFs:** `assets/v259_pdfs_recolhidos.js` removeu a exigência incorreta de que todos os 78 IDs históricos estivessem na lista verificada. `assets/v260_pdfs_progressive.js` conserva essa correção e acrescenta renderização progressiva: primeiro grupo não vazio aberto automaticamente, grupos recolhidos sem criação antecipada de cartões, **24 cartões por lote** e botão “Mostrar mais” para avançar. Busca/filtro abrem grupos relevantes.
- **Sincronização:** `assets/v259_drive_pdf_sync.js` restaura consulta ao detectar token compartilhado já autorizado, evitando perder o evento OAuth; indica estado e registra a conclusão da verificação antes de atualizar a lista. As 4 pastas-raiz monitoradas e regras existentes de classificação e preservação são mantidas.

## Evidências independentes

1. Catálogo público `pdf_catalog_v149.json`: **78 PDFs, 78 IDs únicos**. Índice `pdf_grupos_v149.json`: **78 associações correspondentes, 24 grupos**.
2. Todos os 22 grupos retornados por `inferGroup` existem no índice. Testes de lógica: catálogo histórico íntegro; subconjunto verificado de 5 itens; 0 itens confirmados; erro preventivo de catálogo histórico incompleto antes da verificação.
3. Montagem V258 original reproduzida isoladamente; comparação com V259 mostrou **131 scripts em ambos e apenas três substituições previstas:** PDF grupos, PDF Drive e leitor da versão.
4. `v259.html`, `v260.html` e `index.html` são páginas HTML finais, sem segunda requisição a `v062.html` e sem reconstrução por `document.write()`.
5. V260 conserva controle de estudos com 3 abas, relógio único, leitor de cartões, PDF editor, fórmulas matemáticas V258, lacunas, Drive e SRS.
6. Teste negativo de segurança da fase de bundles CSS V257 e backups preservados. `v258.html` e `v259.html` mantidos para reversão.
7. Nenhum registro de estudo, cartão, ID, versão histórica, evento SRS, grifo ou PDF privado do usuário foi alterado por esta atualização.

## Limitações de certificação

- Código fonte e montagem estrutural verificados no repositório; **não foi possível acessar a página pública pelo navegador HTTP externo nesta sessão**.
- **OAuth real e leitura das pastas Drive do usuário ainda NÃO homologados**. As correções resolvem bloqueios identificados no frontend, mas não comprovam que as permissões das pastas permitam localizar todos os PDFs.
- Não há métricas medidas de LCP/INP/CLS/TTI no Android. Redução de etapas e processamento não equivale a uma porcentagem medida de ganho.
- **131 scripts externos continuam** na página; divisão por recurso e carregamento condicional dependem de mapa de dependências e testes de interação para preservar originais, PDF/grifos, cards, OAuth, clock e SRS.

## Ações de verificação no celular

- Recarregar a raiz `https://carlosemichelon.github.io/concurso/` e abrir PDFs.
- Antes de conectar: catálogo histórico exibido com rótulo **não verificado**. O painel “PDFs do Google Drive” deve ter o botão de verificar e a mensagem de estado visíveis.
- Após conexão: usar “Verificar PDFs das pastas monitoradas”; observar a contagem e quaisquer erros (pasta sem permissão, sessão expirada, HTTP 403 etc.).
- Abrir o primeiro grupo; confirmar a exibição de até 24 PDFs e o botão de mais itens. PDF original só é considerado disponível quando encontrado na consulta Drive.
- Se falhar, reportar o texto de estado da biblioteca sem enviar tokens ou dados privados.

## Recuperação

- `v259.html`: entrada direta e correções da verificação, sem paginação progressiva.
- `v258.html`: shell anterior (etapas de abertura antigas), preservada no GitHub.
- `docs/index_v258_redirect_backup.html`: cópia do redirect antigo.

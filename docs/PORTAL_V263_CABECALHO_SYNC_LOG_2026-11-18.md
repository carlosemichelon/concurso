# Portal Banco Mestre — V263, compactação e sincronização (18/11/2026)

## Solicitação
Cabeçalho V262 alto demais e ocorrência de erro mesmo após clicar em "Sincronizar Drive".

## Diagnóstico do código anterior (não inferir perda de dados)
1. CSS V262 impunha um bloco de **65 px** para os indicadores, além do título e da navegação. Navegação estava em ~128 px do topo nos testes anteriores.
2. `assets/v182_media_core.js` retornava `lastReport` quando outra consulta ainda estava rodando: poderia retornar `null` ou um resultado antigo, causando **falsa pendência/falha da varredura atual**.
3. `assets/v259_drive_pdf_sync.js` e `assets/v228_drive_gallery_feed.js` não compartilhavam a Promise da operação em curso; uma chamada concorrente podia retornar resultado anterior ou nenhum resultado.
4. `assets/v239_grifos_drive.js` ignorava uma nova chamada enquanto ocupado sem esperar a operação iniciada por outro evento.
5. `assets/v262_global_drive.js` agrupava estados `empty`, autorização incompleta e erros genuínos em `warnings`, fazendo a UI exibir "Parcial/falha" mesmo quando apenas faltavam dados locais; isso **não equivale** a integridade confirmada.
6. Após o erro, as mensagens anteriores eram resumidas em um chip sem detalhar qual módulo tinha falhado, impedindo diagnóstico pelo usuário.

## Correção V263
- Cabeçalho em duas faixas compactas, com área total projetada de ~67–70 px e indicadores 32 px; no celular, os contadores passam para painel sob demanda e permanecem acessíveis.
- Novo botão de status abre relatório por módulo com estado *Conferido*, *Pendente*, *Conflito* ou *Erro*, motivo exato e opção de copiar diagnóstico sem credenciais.
- As varreduras de núcleo de mídias, Atlas, PDFs e grifos reutilizam **a mesma Promise** durante chamadas simultâneas, em vez de retornar `lastReport` antigo ou `undefined`.
- O relatório global grava `notes` (evidências verificadas), `pending` (dados vazios/permissão/sem verificação) e `warnings` (falhas e conflitos).
- `empty` do Controle/Lacunas = pendência (sem cópia presumida, sem inventar fonte); HTTP 403 e conflitos reais permanecem como erro/conflito.
- A varredura PDF exige fonte `google_drive_only`, informações válidas de pasta e IDs históricos confirmados; **78 registros do catálogo histórico não são o total obrigatório de uma varredura nova**.
- Não há persistência de OAuth em dados locais, GitHub ou logs; tokens ficam em memória e não entram no relatório copiado.

## Arquivos novos e legado
`assets/v263_compact_header.css`, `assets/v263_media_core.js`, `assets/v263_drive_pdf_sync.js`, `assets/v263_drive_gallery_feed.js`, `assets/v263_grifos_drive.js`, `assets/v263_global_drive.js`, `assets/v263_sync_truth.js`, `assets/v263_sync_diagnostics.js`.

Os arquivos V262 e as versões históricas permanecem em arquivos separados. `v262.html` é a opção de rollback e os testes V262 foram apontados ao arquivo histórico para impedir regressão artificial.

## Proteção
Nenhuma alteração a cartões, IDs, versões históricas, cronogramas ou eventos SRS; sem gravação de PDF original, imagem original ou grifos canônicos em Drive durante os testes. O portal é interface de consulta; Drive é fonte, GitHub é publicação.

## Validação
- `tests/v263_static_integrity.cjs`: preservação de contagens, rotas, JS válido e bloqueio de sobreposição.
- `tests/v263_browser.cjs`: Playwright desktop/mobile, estabilidade visual e teste com OAuth **exclusivamente simulado**, estado vazio sem erro falso, erro HTTP 403 identificado, conflito preservado.
- `tests/v262_layout_sync.test.cjs` e `tests/v262_browser.cjs`: versão anterior preservada.
- Workflow: `.github/workflows/v263-compact-drive.yml`, além dos testes históricos existentes.

**Limitação ainda real:** aprovação em teste automatizado não substitui OAuth real no navegador do usuário. Não declarar que o Drive privado foi sincronizado até que o painel mostre por módulo evidência positiva na sessão autenticada.

## Escopo da publicação
PR #41: https://github.com/carlosemichelon/concurso/pull/41. Durante preparo, integração/publicação ainda não certificadas. Após merge, verificar em separado GitHub, Pages, auditoria do site público, CSS/JS e Drive autenticado.

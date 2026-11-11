# V101 — Rolagem contínua mais fluida no editor PDF

## Objetivo
Reduzir as pausas ao avançar/voltar entre páginas, sem substituir a rolagem vertical contínua e sem afetar seleção precisa, quatro cores da lei seca, painel de grifos, ícones, dados e SRS.

## Diagnóstico da V100
O leitor herdado de `assets/pdf_v097.js` usa uma janela virtual de três páginas. Em `renderOne`, a página central era renderizada em canvas de alta resolução e depois o sistema esperava `Promise.all` renderizar as duas vizinhas antes de habilitar controles e anunciar `bm-pdf-active-page-rendered`. Em cada promoção por rolagem a mesma página podia ser rasterizada novamente. Renders antigos continuavam consumindo tempo quando o usuário mudava rapidamente de página.

## Alterações V101
- `assets/pdf_v101.js`: ao finalizar o raster central, libera imediatamente a edição e despacha o evento de página ativa usado pelo seletor V094. As duas páginas vizinhas passam a ser preparadas sem bloquear o retorno da página central, iniciando após um quadro de renderização.
- Cache LRU apenas de raster PDF (sem anotações) de **até 2 páginas e 12 milhões de pixels**; a página e a escala compõem a chave. Se a imagem for grande demais, não é armazenada. O cache permite voltar a páginas recém-consultadas sem uma segunda rasterização e gerar prévias vizinhas a partir de uma imagem já presente, quando tiverem o mesmo tamanho visual.
- Renderizações desatualizadas são canceladas quando surge um novo pedido de página ou o documento fecha, evitando trabalho desperdiçado. O carregamento das prévias dá preferência ao sentido da última rolagem, uma de cada vez.
- A promoção por rolagem só usa uma prévia de página realmente pronta e correspondente ao número esperado; a checagem é retomada automaticamente quando a prévia fica pronta, com retry curto após o intervalo de proteção contra oscilação.
- Quando a prévia da página anterior muda de altura (ou deixa de existir na primeira página), mantém-se a posição relativa do texto central no visor, evitando saltos.
- Mantidos eventos e APIs anteriores `BancoMestrePDFV042`, `goToPage`, `bm-pdf-active-page-rendered`, `bm-pdf-mark-changed`, armazenamento e exportação. Não se altera o PDF.js 3.11.174 nem o motor de seleção geométrica V097.

## Regressões e limites
Testes de sintaxe, montagem de loader, cache LRU/limites/reuso, liberação da página central antes das vizinhas e identidade integral das rotinas de grifos/exportação foram realizados em simulações. O teste final de fluidez visual, consumo de memória, PDFs com muitas imagens e seleção durante rolagem contínua requer navegador real — sem medição com PDF real, não é possível afirmar um ganho numérico.

Backup de código `backup/v100-before-pdf-scroll-v101-2026-11-11`. Documentos e dados anteriores permanecem inalterados.

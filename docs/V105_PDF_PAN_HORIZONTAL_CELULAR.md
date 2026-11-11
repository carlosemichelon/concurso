# V105 — Navegação lateral do PDF no celular

## Solicitação
"Melhore a navegação no pdf do celular. Mexer na página para os lados."

Interpretação operacional: permitir deslocar (pan) a página ampliada **para a esquerda e a direita** arrastando o dedo, sem transformar um gesto lateral em troca de páginas nem prejudicar a rolagem vertical, zoom por pinça e seleção por primeiro/último toque.

## Diagnóstico na V104
- O contêiner PDF `#pdfLocalMode` já tinha `overflow-x:auto`; portanto a falha não era simplesmente ausência de scrollbar.
- O seletor de palavras V094/V103/V104 colocava a sobreposição `#bm094WordPointer` no primeiro plano com `touch-action:pan-y`. Isso bloqueava o gesto horizontal precisamente quando a ferramenta de grifar palavras estava ativa.
- Uma página ampliada precisa poder exceder a largura do visor. Regras CSS legadas podem restringir largura máxima de canvas/wrapper.
- Ferramentas de desenho livre têm touch-action:none intencionalmente: para deslocar a página sem riscar, é necessário o modo Mover.

## Alterações
- `assets/v105_pdf_horizontal.css`: só em telas móveis/touch, habilita `touch-action:pan-x pan-y` sobre `#pdfLocalMode` e `#bm094WordPointer`, mantendo `overflow-x:auto` e `overflow-y:auto`, com inércia no iOS e overscroll contido; remove `max-width` forçado do wrapper e dos canvases de página. Não modifica seleção, posição dos grifos nem renderização do PDF.
- `assets/v105_pdf_horizontal.js`: botão discreto `↔ Mover página` apresentado somente com documento aberto e a página maior que a largura do visor. Usa o **próprio botão `pdfPan`** do editor e armazena a ferramenta anterior para retornar por toque, sem replicar estado nem listeners. Se a página couber, o botão some. Atualiza ao zoom, renderização, mudança de ferramenta e redimensionamento.
- Sem alteração de conteúdo PDF, cores, grifos, notas, caches, SRS, sincronização Drive, páginas anteriores ou motor V104.

## Testes feitos / pendência
- Preflight de sintaxe JS/CSS e montagem de loader.
- Teste com DOM simulado: botão só aparece quando há overflow horizontal; alterna Mover/Grifar e desaparece quando a página volta a caber.
- Inspeção de preservação da camada V104 e dos demais módulos; **ainda requer teste visual e de toque real em Android/iOS**, sobretudo rolando lateralmente com Grifar palavras ativado após aplicar zoom, sem criar marca acidental.

Backup do código em `backup/v104-before-mobile-horizontal-pan-v105-2026-11-11`. Não alterar backups de dados nem assumir sincronização remota homologada apenas pela publicação.

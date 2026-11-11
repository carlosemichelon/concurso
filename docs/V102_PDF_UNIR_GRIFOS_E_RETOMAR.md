# V102 — União reversível de grifos, retomada de página e legibilidade

## Solicitações do estudante (11/11/2026)
1. Unir grifos já existentes do PDF, sem perda de cores/IDs/notas, com separação posterior.
2. Remover as etiquetas longas e repetitivas de cores em cada item do painel.
3. Ao continuar a edição de um PDF, abrir na última página visitada.
4. Melhorar legibilidade dos trechos grifados.
5. Melhorar editor de cores (caneta/grifo livre) e explicar a função Cobertura.

## Mudanças
- Painel `assets/v102_painel_grifos.js`: botão `Unir grifos`, caixas de seleção, `Unir selecionados` e `Separar`. É possível unir dois ou mais grifos textuais (ou grupos preexistentes) na **mesma página e mesma cópia do PDF**. Isso cria somente um grupo lógico/visual salvo em `BM102_PDF_HIGHLIGHT_JOINS:<id>:<hash>`, sem reescrever qualquer registro `BM030_STROKES_PDF`; cada trecho mantém cor, IDs, notas e histórico individuais. A separação reverte apenas a união manual. Uniões originais V097 continuam intactas. Grifos visuais livres sem ID textual não são elegíveis para união.
- Agrupador `assets/v102_highlight_groups.js`: aplica grupos manuais como camada sobre a dedução histórica V097, validando IDs, limites, páginas e evitando misturas automáticas de partes. A prévia unida apresenta textos concatenados com separador discreto. O painel remove o bloco `bm097-colors`; a cor continua visível nos próprios grifos e nos detalhes individuais.
- Motor `assets/pdf_v102.js`: armazena a página ativa após sucesso de renderização sob chave `BM102_PDF_LAST_PAGE:<id>:<hash>`, retomando a última página salva ao reabrir **a mesma cópia** no mesmo navegador (localStorage). Não sincroniza esse estado entre aparelhos e não altera o PDF.
- Legibilidade: opção `Texto mais legível` limita **somente a opacidade em tela** das marcas `text_highlight` em estilo de preenchimento a até 28%, preservando sublinhados, tachados e ocultações; o valor e os registros persistidos permanecem iguais e a exportação PDF usa a transparência de origem. Ao desativar, a tela volta a mostrar a opacidade original. A opção persiste no navegador.
- Editor de cor: quatro tons de referência de lei seca para desenhar livremente, input de cor personalizado **original**, slider original de opacidade com prévia de texto. O seletor de palavras com quatro categorias semânticas V099 é independente do controle de cor de desenho livre.
- `Cobertura dos cartões`: renomeia o controle `pdfStatusV037` sem alterar evento: após ativar, clique no PDF e informe 1=Integral, 2=Parcial, 3=Sem cartão ou 4=Não auditado. Grava um rótulo visual no PDF; não audita os cartões nem modifica o SRS.

## Regressões e proteção
A V102 apenas substitui os módulos de renderizador V101 e painel V097 por cópias versionadas; mantém seletor geométrico V094/V097, regras de grifos V099, ícones e barra V100, rolagem contínua e cache V101, Drive privado, 72 PDFs, flashcards, Atlas e SRS. Dados de grifos e documentos anteriores não são migrados. Backup: `backup/v101-before-pdf-merge-resume-v102-2026-11-11`.

## Testes
Validar estrutura e sintaxe dos arquivos, união manual/legado e separação, segurança de página, retomada, opacidade exibida vs exportação, montagem do HTML e ordem dos scripts. Teste visual e de interação com PDF real no navegador permanece necessário; sem esse teste, não afirmar homologação completa.

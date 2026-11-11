# V100 — Organização dos ícones e ferramentas do editor PDF

Origem: HTML real do `<aside class="bm-v046-pdf-side">` enviado em 11/11/2026, extraído durante edição de PDF de 809 páginas (página 2) e auditado contra a V099. O trecho original contém quatro grupos visuais legados em `#pdfMainV043`, um menu `#bm068QuickBar` e dock `#bmV057PdfDock`. Ícones novos e símbolos antigos conviviam, ações redundantes e rótulos longos eram comprimidos em largura lateral de 170px (112px em telas estreitas).

**Objetivo:** manter o editor com rolagem vertical, seleção de palavras precisa e os quatro grifos de lei seca, mas arrumar comandos por tarefas e dimensões sem trocar bibliotecas ou dados.

## Nova organização visual
1. **Grifador** — modo rápido, sugestões por trecho, Meus grifos, Atalhos e legenda de quatro cores, sem mostrar um botão redundante `#bm064TogglePanel`; esse botão continua no DOM e pode ser acionado por `#bm068OpenPanel`.
2. **Navegação** — página ativa, Anterior/Próxima em colunas simétricas, zoom e dock “Ir à página” com seu formulário real.
3. **Grifar texto** — botão principal `#bm068SelectTool` separado das ferramentas de desenho.
4. **Desenho livre** — Caneta, Grifo livre, Borracha, Mover, cor e opacidade.
5. **Anotações** — Nota, Cartão e Cobertura de página com ícones vetoriais próprios.
6. **Histórico** — Desfazer/Refazer juntos; desativados preservam estilo correto.
7. **Salvar e exportar** — Exportar PDF e Salvar no Drive separados, sem ambiguidade.
8. **Mais opções** — lista original recolhível com limpar página, exportar PNG, trocar arquivo; Diagnóstico do leitor no fim.

## Garantias
O script `assets/v100_pdf_tools.js` identifica a estrutura V043/V099, confere presença de todos os controles essenciais e **move os próprios nós** sem `cloneNode`, substituição de HTML ou alteração dos eventos. Os IDs, atributos ARIA, botões, formulário do dock, atalhos, modo grifador, estado, armazenamento e SRS não mudam. O código não toca a geometria do PDF, seleção V097/V094, agrupamento de grifos V097, motor PDF.js 3.11, rolagem e renderização, Drive ou Atlas.

A folha `assets/v100_pdf_tools.css` só é ativada quando `#pdfLocalTools[data-bm100-ready="1"]`, usando layout de cartões agrupados e responsivo (194px desktop, 132px mobile, 122px telas muito estreitas). Se a estrutura esperada faltar, a barra anterior permanece, sem alterações parciais.

**Preflight:** conferir ordem dos scripts, HTML montado, CSS, cardinalidade de botões e integridade da navegação. Testes visuais/clicks com PDF real em desktop e Android permanecem necessários para homologação completa.

Backup GitHub: `backup/v099-before-pdf-icons-v100-2026-11-11`. Reverter apenas os arquivos V100 para voltar ao layout V099; não alterar dados locais.

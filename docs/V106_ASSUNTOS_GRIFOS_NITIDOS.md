# V106 — Assuntos compactos e grifos de melhor contraste

## Requisitos do estudante
- Diminuir a apresentação da área Assuntos, particularmente o título "Escolha uma área de estudo" e a explicação "Abra cada assunto para ler explicações, consultar imagens e PDFs e, quando houver, praticar os cartões. Alguns assuntos possuem imagens mesmo sem flashcards".
- Melhorar a aparência de grifos textuais que cobrem as letras e ficam opacos ou lavados, preservando suas quatro cores e os conteúdos já salvos.

## Etapa 1 — Conteúdo e densidade da página Assuntos
- `assets/v106_assuntos_compactos.js`: título da seção vira "Áreas de estudo", explicação "Escolha uma área e abra um assunto.", segundo cabeçalho "Assuntos"; hero geral reduzido a "Estudar" com frase curta de materiais. Também encurta frase longa caso seja inserida por outro script após carregamento inicial.
- `assets/v106_compact_readability.css`: títulos menores, margens menores, cartões de área e assunto compactos, exemplos limitados a uma linha no computador e ocultados somente na prévia dos cartões no celular. Informações continuam acessíveis dentro de cada assunto. Nenhum assunto, vínculo, cartão ou PDF é removido.

## Etapa 2 — Legibilidade verdadeira dos grifos no PDF
- Problema anterior: canvas de marcações sobreposto ao canvas das letras; desenhar um preenchimento alfa sobre o texto pode esmaecer a imagem. O modo anterior limitava opacidade a 28%, mas isso tornava cores muito fracas e não resolvia o mecanismo de contraste.
- `assets/pdf_v106.js`: quando o modo **Grifo nítido** estiver ligado, o realce de tipo `text_highlight` com estilo `highlight` é desenhado usando `globalCompositeOperation='multiply'` diretamente sobre o raster ORIGINAL da página PDF; o resultado não é redesenhado como preenchimento na camada de tinta. Assim, os pixels pretos das letras permanecem escuros e o fundo recebe a cor. O raster base vem do cache limitado já existente. Pintura do canvas PDF ocorre somente quando a lista de realces ou sua intensidade mudar (assinatura), preservando a fluidez de desenho livre. As prévias vizinhas também usam Multiply e são atualizadas com atraso de 190ms durante mudanças de intensidade para reduzir trabalho.
- Em modo desligado, permanece a apresentação convencional legada sem mesclagem Multiply.
- Intensidade padrão da apresentação na tela: **55%**, ajustável de 30% a 80% por controle dentro do editor, armazenado somente no navegador em `BM106_PDF_SCREEN_HIGHLIGHT_STRENGTH`.
- `assets/v106_ink_ui.js`: checkbox "Grifo nítido (sem apagar as letras)" e slider "Intensidade da cor na tela". Seletor original de cor e transparência para grifo livre continuam intocados; aviso explícito que intensidade só afeta a tela.
- Este processo NÃO modifica os registros de anotação, estilos de grifo ocultação/sublinhado/tachado, cores originais da metodologia lei seca, exportação PDF nem histórico SRS. O PDF exportado continua usando a aparência gravada no momento de cada grifo; se o estudante desejar igualdade entre tela e exportação, isso precisa ser autorizado em outra etapa.

## Garantias, testes e limites
- Verificado com simulação de canvas: presença de blend Multiply somente no preenchimento textual, letras protegidas, desenhos de caneta preservados, desativação restaura renderização legada, mudança de intensidade força somente repaint necessário, exportação PDF byte-identical nos trechos correspondentes.
- Teste final de visualização num PDF real em navegador Android/computador continua pendente; não afirmar ganho quantitativo ou qualidade homologada sem verificação visual.
- Backup: `backup/v105-before-compact-topics-crisp-highlights-v106-2026-11-11`.

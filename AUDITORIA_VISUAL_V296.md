# Auditoria visual — V296 (19/11/2026)

## Critério
Um único sistema de papéis visuais, aplicado depois das folhas anteriores, em componentes identificados no código real. Não trocar a hierarquia das informações nem eliminar conteúdos didáticos ou estados funcionais. Fonte Segoe UI, texto preto-azulado escuro (#111a22), título dos flashcards preto (#101820), azul reservado a navegação/links/ações (#147fbf), painel branco, bordas quadradas (#bfcfd9), fundo cinza-claro (#edf0f2).

## Matriz de cobertura e seletor
| Área | Seletor de componente auditado | Correção |
|---|---|---|
| Cabeçalho | `body>header .head`, `header nav [data-page]` | Fonte e contraste; ativo azul |
| Assuntos | `#assuntos #areaRows .topicCard`, `#topicRows`, `.bm246-formula-shortcut` | Hierarquia de título e metadados |
| PDFs | `#pdfs #bm210PdfToolbar`, `#pdfRows` | Busca/filtros/cartões com superfície/escala homogêneas |
| Flashcards | `#cartoes #cardRows>article.card>h3` | Título **preto #101820**, 16 px, peso 700 |
| Leitor/11 módulos | `#bmCardPeekV050`, `.bm198-module-body`, `.bm163-piece-text` | Texto #111a22, 15 px, títulos azuis escuros |
| Imagens | `#imagens #bm209SyncBar`, `#bm084-grid>article` | Filtros e catálogo; link **Abrir no Drive** |
| Lacunas | `#lacunas .bm242-shell` | Texto, campos e superfícies |
| SRS | `#calendario .c141-wrap`, `.c141-stat` | Métricas, tabela, cores funcionais intactas |
| Controle | `#bm240-native-host.shadowRoot` | Camada visual específica de Shadow DOM |
| Popups | `#bmCardPeekV050`, `#pdfDialog`, `#imageDialog` | Tipografia, contorno e contraste |
| Redação | `redacao_temas_treino_v296.html` | Mesmas famílias tipográficas e superfícies; dados e scripts preservados |

## Integridade funcional
- Somente CSS e troca de importação da galeria/Redação.
- A galeria **já possuía link construído do ID autorizado do Google Drive**. Agora se chama `Abrir no Drive` e orienta mover o arquivo para a lixeira no próprio Drive; a exclusão direta (escopo OAuth completo) deixa de ser importada.
- Nenhum PDF, cartão, ID, SRS, grifo, imagem ou fonte privada foi alterado.
- O comparador SHA permanece exatamente o mesmo: divergência ainda bloqueia comparação; não há bypass.
- Redação V146 e portal V295 ficam disponíveis para rollback.
- A auditoria de CSS é **estática**: não houve renderização real autenticada no GitHub Pages/Google Drive. É necessário conferir desktop e mobile após a publicação.


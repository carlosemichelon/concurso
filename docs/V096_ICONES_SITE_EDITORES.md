# V096 — iconografia aprimorada do portal e dos editores

## Escopo visual

- Portal: ícones vetoriais originais, contornos finos e navegação organizada, inspirados em padrões de plataformas de questões como o TecConcursos (sem reproduzir seus arquivos/identidade proprietária).
- Editor PDF e editor de imagem: caneta, marca-texto, borracha, seleção, mover, desfazer/refazer, zoom, exportação e notas com traço arredondado e estados ativo/inativo, inspirados na usabilidade de aplicativos de caderno digital como Samsung Notes.
- Os elementos de interação originais são mantidos. A camada `assets/v096_icons.js` atribui propriedades e alguns rótulos estáveis aos próprios botões, sem clonar nem remover nós, listeners, `aria-pressed`, IDs, PDF.js ou registros de dados.
- Estilos em `assets/v096_icons.css`; SVGs próprios via `data:` sem carregamento de fontes, imagens externas ou rede de terceiros.

## Regressões preservadas

Seletor preciso V089/V094, classificador/paleta V095, quatro cores, biblioteca V070, painel V070, motores PDF V070, Atlas, editor de imagens, 72 PDFs, autenticações Drive, flashcards e SRS. Não migrar nem recolorir grifos históricos. Backup do início das mudanças: `backup/v094-before-palette-and-icons-2026-11-10`.

## Testes pendentes

Conferir visualmente no navegador real (desktop/Android), comparar proporção dos ícones e testar todos os botões nos dois editores. O deploy GitHub Pages e o cache do browser podem atrasar a atualização.

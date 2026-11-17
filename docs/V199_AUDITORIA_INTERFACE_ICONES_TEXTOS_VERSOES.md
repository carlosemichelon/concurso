# Banco Mestre — Auditoria da interface V199
Data: 17/11/2026. Origem: revisão solicitada de ícones, textos e versões do portal publicado na V198.

## Escopo examinado
- Wrapper `v198.html` e montagem real do HTML pela transformação da base `v062.html`.
- Navegação, estatísticas, cabeçalho e rodapé, Atlas V198, leitor de flashcards, ícones da versão V096 e folhas de estilo mobile, incluindo V103, V107, V109, V122, V165, V168 e V198.
- Comparação dos **159 caminhos de assets** referenciados no HTML montado com o diretório `assets/` da branch `gh-pages`: **159/159 presentes** (86 scripts e 73 folhas de estilo na V199); ausência de duplicação de nomes de scripts e estilos no wrapper.
- Análise sintática da montagem e de scripts específicos; **não** foi realizado teste visual do GitHub Pages em um navegador autenticado.

## Não conformidades encontradas
1. **Versão conflitante (confirmada por código):** a página/manifesto V198 coexistia com `v194_site_info.js` escrevendo `V194` no cabeçalho e no rodapé. Também se misturavam versão da base de cartões, versão do portal e versão do Atlas.
2. **Quadro V198 oculto (confirmado por CSS):** a base V062 define `section{display:none}`. O novo `section.bm198-overview` não tinha `display:block` específico; sem a correção, o quadro de revisão poderia ficar oculto. Os módulos internos tinham regra `display:block` já existente.
3. **Tipografia excessivamente pequena (confirmada por CSS):** V122 fixa estatísticas do cabeçalho em 10/9 px, chegando a 9,5/8 px no celular; V103 usa `font-size:10px` na versão mobile.
4. **Potencial desalinhamento/estreitamento dos ícones e controles:** havia múltiplas folhas responsivas com dimensões e paddings distintos; foram adicionadas regras finais direcionadas a alinhamento, área de toque e quebra de texto, sem substituir os SVGs e máscaras V096.
5. **Texto datado:** o módulo de informações dizia que toda prática, correção e avaliação ocorria no ChatGPT, apesar de o portal agora possuir respostas discursivas locais. A linguagem passa a distinguir registros locais de SRS oficial e arquivos privados.

## Correções implementadas (não destrutivas)
- Novo `assets/v199_site_info.js`: rótulos `Portal V199 · cartões V194 · Atlas V198` e rodapé consistente; mantém rótulo explícito da base histórica V194 e do Atlas editorial V198.
- Novo `assets/v199_ui_audit.css`: torna o quadro informativo visível dentro do leitor; uniformiza ícones; melhora tamanho dos indicadores em desktop/mobile; facilita leitura e interação dos campos de classificação de imagens.
- Novo `v199.html`: injeta as correções após os estilos anteriores; substitui somente o script de informação do cabeçalho; mantém todos os demais recursos de biblioteca, PDF, flashcards e imagens.
- `index.html` e `assets/version.json` devem apontar para V199; V198 mantida disponível em `v198.html`.

## Testes executados
- Executada **simulação da montagem do wrapper** em ambiente JavaScript, usando a fonte exata `v062.html`. Resultado: `document.write` gerou HTML, sem erro no processo de substituições.
- **86 scripts** e **73 estilos** presentes e sem referências duplicadas; **159/159 caminhos** existem no repositório.
- Os cinco ícones principais de navegação (assuntos, PDFs, flashcards, imagens e grifos) possuem caminhos SVG definidos no mapa V096.
- Correção CSS para `#bmCardPeekV050 section.bm198-overview` explicitamente testada por inspeção de seletor e regra.
- Sintaxe de `v199_site_info.js` e do wrapper validada.

## Limitação importante
O endereço público `https://carlosemichelon.github.io/concurso/` não pôde ser aberto com renderização nesta sessão de auditoria. Portanto, **não** há prova de screenshot, ausência de rolagem horizontal, alinhamento real de ícones, comportamento do OAuth Drive ou sucesso do clique entre imagem e cartão no navegador do titular. Requer prova manual de página inicial, Atlas e leitor, em desktop e celular. Não afirmar `EXIBIÇÃO VERIFICADA` sem esse teste.

## Conservação
Os IDs, versões de cartão, textos dos flashcards, base V194, catálogo editorial V198 (85 imagens de cartão / 94 de conteúdo), grifos, originais de imagens/PDF e eventos SRS foram preservados. Para rollback, usar `v198.html`; nenhum módulo antigo foi sobrescrito.

## Roteiro de homologação visual
1. Abrir a página inicial e confirmar rótulo `Portal V199 · cartões V194 · Atlas V198` no topo e identificação V199 no rodapé.
2. Abrir um cartão evolutivo; conferir quadro informativo visível e 11 módulos, rolagem de tabela e ícones legíveis.
3. Abrir o Atlas; conferir filtros Conteúdo/Cartão/A classificar, classificação, botão Abrir cartão e navegação reversa.
4. Verificar em celular largura de 360–390 px: menu, estatísticas legíveis, ícones, campos de texto e ausência de rolagem horizontal de página.
5. Conferir ferramentas do PDF e editor de imagem para garantir que o ajuste visual não alterou comandos, grifos nem dados.

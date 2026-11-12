# Índice das páginas e versões do portal Banco Mestre (atualizado após V128)

**Inventário conferido em 11/11/2026.** Na raiz de `gh-pages` foram encontradas **109 páginas versionadas `vNNN.html`**, cobrindo V018–V128, com ausência de `v039.html` e `v127.html`. Há ainda 15 arquivos HTML de entrada, auxiliares, acervo e testes. Essas páginas históricas são endereços publicados ou possíveis alvos de links antigos: **não as mover nem excluir em lote**.

## Onde abrir o site

- **Entrada recomendada:** https://carlosemichelon.github.io/concurso/ — carregador `index.html`.
- **Versão conferida na auditoria:** https://carlosemichelon.github.io/concurso/v128.html.
- **Identificação autoritativa:** [`assets/version.json`](../assets/version.json); ao abrir no futuro conferir o campo `version` e o `home` correspondente, pois V126 não é uma promessa de versão permanente.
- **Código atual para alterações:** branch `gh-pages`. **NÃO usar a `main` V031 para alterações da publicação.**

## Faixas do histórico `vNNN.html`

| Faixa | Quantidade | Situação |
| --- | ---: | --- |
| `v018.html` a `v038.html` | 21 | Preservadas como arquivo de referências antigas |
| `v040.html` a `v069.html` | 30 | Preservadas |
| `v070.html` a `v099.html` | 30 | Preservadas |
| `v100.html` a `v126.html` | 27 | Preservadas |
| `v128.html` | 1 | Entrada mais recente verificada; V127 não constava na raiz |

**Ausências identificadas:** `v039.html` e `v127.html` não consta da listagem da raiz; não representa necessariamente falha de publicação passada. **Experimental não canônico:** `v084_experimental.html`. Este inventário não testa visualmente cada versão nem comprova todas as dependências externas.

## Páginas auxiliares na raiz

- Acervo: `acervo-v022.html`, `acervo-v023.html`, `acervo-v024.html`.
- Estudo ativo: `estudo-ativo.html` e `estudo-ativo-v020.html` a `estudo-ativo-v024.html`.
- Imagens: `imagens-v023.html`, `imagens-v024.html`, `imagens-v025.html`.
- Entrada, teste e experimental: `index.html`, `teste-marcacoes-conama.html`, `v084_experimental.html`.

## Método seguro de limpeza futura

Primeiro identificar URLs referenciadas por scripts, manifestos, navegador, PDFs, favoritos e links em documentos do Drive. Se alguma versão for comprovadamente desnecessária, exportar e validar backup independente antes de considerar retirada. **Não supor que apenas o arquivo de maior número importa.** A história de commits, os checkpoints do Drive e os dados privados do navegador são camadas distintas.

Ver também [Mapa de governança](GOVERNANCA_VERSOES_DRIVE_GITHUB_2026-11-11.md) e [inventário de branches](INVENTARIO_BRANCHES_2026-11-11.md).

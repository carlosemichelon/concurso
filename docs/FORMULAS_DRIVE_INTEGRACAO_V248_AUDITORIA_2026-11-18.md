# Banco Mestre — Assuntos > Fórmulas — verificação V248

Data: 18/11/2026 (America/Sao_Paulo). Documento de auditoria do **código da interface**, não substitui homologação operacional no navegador.

## Origem e responsabilidade

- Fonte única: Google Docs **Estruturas – Fórmulas, Vigas e Análise Estrutural**, no Google Drive do titular. A integração do portal é **somente leitura** mediante OAuth, reutilizando o token temporário do módulo de mídias.
- O portal chama Drive `files.get` para obter versão, data, título, tipo e lixeira, e `files.export` `text/plain` para ler o conteúdo autorizado. Não publica as fórmulas no GitHub nem persiste cópias locais desse texto.
- O conteúdo continua sendo elaborado separadamente no Google Docs; novos trechos aparecem quando a aba Fórmulas é aberta/reaberta ou quando o usuário escolhe **Atualizar do Drive**. Para evitar desgaste de navegação, revisões idênticas não forçam nova renderização.
- O acesso `#formulas` agora é capturado antes da montagem do bootstrap legado e restaurado após a criação da seção, sem alterar `assets/v241_boot_topic.js`.
- O Guia original, cartões, IDs, originais, mídias e SRS não foram editados nesta implementação.

## Arquivos envolvidos

- `v248.html`: página versionada e captura do link direto (herda os demais módulos do V247).
- `assets/v248_formulas_drive.js`: leitura e roteamento. 
- `assets/v246_formulas.css`: visualização e responsividade (reutilizado sem regravação).
- `assets/version.json` e `index.html`: versão/home V248.
- V246, V247 e módulos anteriores permanecem recuperáveis.

## Testes executados nesta sessão

| Teste | Resultado |
| --- | --- |
| Documento original encontrado no Drive | OK — mesmo ID e título |
| Leitura e parser do corpo original | OK — 16 seções numeradas + apresentação |
| Ordem 1–16 e seções não vazias | OK |
| Pesquisa sem distinção de acentos | OK — teste “fissuracao” |
| Filtro de assunto | OK — aço e estabilidade |
| Pesquisa sem resultado | OK — mensagem explicativa |
| Preservação de seção expandida após nova renderização | OK |
| Consulta quando versão no Drive não mudou | OK — evita reexportação |
| Consulta após mudança de versão simulada | OK — executa reexportação |
| Sem token OAuth | OK — não faz requisição e explica a necessidade |
| Erro 403 simulado | OK — conserva último conteúdo válido e apresenta erro |
| Captura do hash `#formulas` antes do bootstrap legado | OK — auditoria do código |
| Sintaxe do JavaScript V248 | OK |
| Readback de manifesto, página, JS e CSS no GitHub | OK |
| Integridade declarativa do contador de cartões publicado | OK — 1.518 IDs, 1.501 ativos |

**Limitações dos testes:** simulações do parser e de respostas da API foram feitas em ambiente isolado; não são teste funcional do fluxo OAuth com a conta do proprietário nem teste de rede/DOM do GitHub Pages. A leitura do documento por conector confirmou origem e títulos, não a exportação CORS no navegador.

## Pendências antes de homologação total

1. Abrir a página publicada com conta Google autorizada e confirmar exportação `text/plain` no navegador.
2. Abrir diretamente `/#formulas` e testar voltar/avançar no navegador.
3. Conferir visual de desktop e celular, incluindo fonte, legibilidade, rolamento e controles.
4. Testar mudança real do documento durante sessão aberta, voltar à aba e comparar `modifiedTime/version`.
5. Auditar conteúdo normativo/formulação e classificar versões de normas sem alterar edição histórica. Propostas de melhoria do guia deverão ser feitas no documento de origem, mediante auditoria editorial própria.

## Estados por camada

| Camada | Estado |
| --- | --- |
| Google Drive: guia original | Confirmado e preservado |
| Código da integração | Publicado no `gh-pages` |
| Manifesto/entrada | V248, leitura de volta confirmada |
| Exibição pública HTTP | Não comprovada pelo ambiente de teste |
| OAuth real no navegador | Pendente |
| Publicação do conteúdo privado no GitHub | **Não realizada** |
| Atualização de cartões ou SRS | **Não realizada** |

Este LOG descreve somente o trabalho verificado nesta execução e preserva explícitas as pendências.

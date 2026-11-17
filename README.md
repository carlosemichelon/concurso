# Banco Mestre — Portal de estudo (Engenharia Civil / Concursos)

**Site:** [Abrir Banco Mestre](https://carlosemichelon.github.io/concurso/)  
**Branch de publicação:** [`gh-pages`](https://github.com/carlosemichelon/concurso/tree/gh-pages)  
**Manifesto atual (17/11/2026):** **Portal V200** — a página inicial `index.html` redireciona conforme `assets/version.json`; a página anterior **V199** fica preservada em `v199.html`.

## Entender os números de versão

| Componente | Versão | Conteúdo |
|---|---|---|
| **Portal** | **V200** | Código/página principal `v200.html`; anterior V199 |
| **Base didática pública de cartões** | **V194** | 1.518 IDs: 1.501 ativos + 17 inativos; 22 cartões operacionais de Ijuí à parte |
| **Atlas editorial de imagens** | **V198** | 179 imagens públicas catalogadas: 85 de cartão e 94 de conteúdo |
| **PDFs** | **Catálogo V149** | 78 documentos; o esquema histórico de leitura é V140 |
| **Respostas discursivas** | **Formato V195** | Armazenamento e backups históricos compatíveis; novas tentativas registram o portal V200 |
| **Metodologia** | **Documento-mestre próprio** | O número do documento e dos adendos **não** acompanha a versão do portal |

O cabeçalho deve identificar **Portal V200 · cartões V194 · Atlas V198**. Esses números não indicam uma divergência: são linhas de versionamento distintas. Marcas mais antigas como V022, V024, V062, V165 e V186 permanecem em módulos ou históricos e não significam que o site está desatualizado.

**Histórico:** em 11/11/2026, o portal era V131 (1.499 cartões originais, 72 PDFs e 270 registros no inventário anterior). Esses dados são **históricos**, não representam a edição vigente de 17/11/2026. O número V200 é o identificador da edição, **não** uma contagem de 200 páginas: o repositório contém páginas históricas e módulos sem HTML próprio.

## Recursos e governança

- [Manifesto e número atual de versão](assets/version.json)
- [Histórico de alterações — VERSAO_ATUAL](VERSAO_ATUAL.md)
- [Auditoria da numeração de versões V200](docs/V200_AUDITORIA_NUMERACAO_VERSOES.md)
- [Auditoria de ícones, textos e layout V199](docs/V199_AUDITORIA_INTERFACE_ICONES_TEXTOS_VERSOES.md)
- [Regras de edição e segurança](AGENTS.md)
- [Mapa de versões e organização Drive/GitHub](docs/GOVERNANCA_VERSOES_DRIVE_GITHUB_2026-11-11.md)
- [Inventário histórico das branches](docs/INVENTARIO_BRANCHES_2026-11-11.md)
- [Índice histórico das páginas HTML](docs/INDICE_PUBLICACAO_E_HISTORICO_HTML_2026-11-11.md)

A publicação é feita pela branch `gh-pages`; a branch `main` contém uma edição legada V031 e não deve ser tratada como a versão online atual.

## Sincronização e preservação

Os **78 PDFs** do catálogo V149 são a base pública. O módulo de sincronização de PDFs do Drive é V192 e o de imagens privadas é V197; esses números são **versões dos módulos**, não a página atual. A consulta exige autorização Google quando aplicável, e documentos privados não são enviados automaticamente ao GitHub.

No Drive do titular encontram-se as pastas `CONCURSOS – ENGENHARIA CIVIL` e `DataBase_Concurso`. A leitura de arquivos Drive, a publicação de imagens, os cartões e o SRS são processos distintos. Um arquivo no Drive ou catálogo não comprova exibição no site. Versões históricas `vNNN.html` e dados locais anteriores foram preservados; `localStorage`, `IndexedDB`, grifos e eventos SRS exigem backups independentes.

**Validação:** a consistência estrutural de V200 foi verificada no repositório; carregamento real, autenticação e renderização no navegador do titular permanecem sujeitos a teste.

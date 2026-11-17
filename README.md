# Banco Mestre — Portal de estudo (Engenharia Civil / Concursos)

**Site:** [Abrir Banco Mestre](https://carlosemichelon.github.io/concurso/)  
**Branch de publicação:** [`gh-pages`](https://github.com/carlosemichelon/concurso/tree/gh-pages)  
**Manifesto atual (17/11/2026):** **Portal V205** — a página inicial `index.html` redireciona conforme `assets/version.json`; a página anterior **V204** fica preservada em `v204.html`.

## Entender os números de versão

| Componente | Versão | Conteúdo |
|---|---|---|
| **Portal** | **V205** | Código/página principal `v205.html`; anterior V204 |
| **Base didática pública de cartões** | **V194** | 1.518 IDs: 1.501 ativos + 17 inativos; 22 cartões operacionais de Ijuí à parte |
| **Atlas editorial de imagens** | **V198** | 179 imagens públicas catalogadas: 85 de cartão e 94 de conteúdo |
| **PDFs** | **Catálogo V149** | 78 documentos; o esquema histórico de leitura é V140 |
| **Respostas discursivas** | **Formato V195** | Armazenamento e backups históricos compatíveis; novas tentativas registram o portal V205 |
| **Metodologia** | **Documento-mestre próprio** | O número do documento e dos adendos **não** acompanha a versão do portal |

O cabeçalho deve identificar **Portal V205 · cartões V194 · Atlas V198**. Esses números não indicam uma divergência: são linhas de versionamento distintas. Marcas mais antigas como V022, V024, V062, V165 e V186 permanecem em módulos ou históricos e não significam que o site está desatualizado.

**Histórico:** em 11/11/2026, o portal era V131 (1.499 cartões originais, 72 PDFs e 270 registros no inventário anterior). Esses dados são **históricos**, não representam a edição vigente de 17/11/2026. O número V200 é o identificador da edição, **não** uma contagem de 200 páginas: o repositório contém páginas históricas e módulos sem HTML próprio.

## Recursos e governança

- [Manifesto e número atual de versão](assets/version.json)
- [Histórico de alterações — VERSAO_ATUAL](VERSAO_ATUAL.md)
- [V205 — integração de novas imagens Drive no Atlas autenticado](docs/V205_ATLAS_INTEGRACAO_IMAGENS_DRIVE.md)
- [V204 — edição muito menor, com prévia da imagem](docs/V204_JANELA_MENOR_PREVIA_IMAGEM.md)
- [Correção V203 — botão único e janela compacta](docs/V203_EDITOR_UNIFICADO_POPUP_COMPACTO.md)
- [Regras V202 de janelas de edição e pastas canônicas](docs/V202_METODOLOGIA_IMAGENS_CHECKPOINTS_PASTAS_FIXAS.md)
- [Auditoria de sincronização Drive/GitHub V201](docs/V201_AUDITORIA_DRIVE_GITHUB_SITE.md)
- [Auditoria da numeração de versões V200](docs/V200_AUDITORIA_NUMERACAO_VERSOES.md)
- [Auditoria de ícones, textos e layout V199](docs/V199_AUDITORIA_INTERFACE_ICONES_TEXTOS_VERSOES.md)
- [Regras de edição e segurança](AGENTS.md)
- [Mapa de versões e organização Drive/GitHub](docs/GOVERNANCA_VERSOES_DRIVE_GITHUB_2026-11-11.md)
- [Inventário histórico das branches](docs/INVENTARIO_BRANCHES_2026-11-11.md)
- [Índice histórico das páginas HTML](docs/INDICE_PUBLICACAO_E_HISTORICO_HTML_2026-11-11.md)

A publicação é feita pela branch `gh-pages`; a branch `main` contém uma edição legada V031 e não deve ser tratada como a versão online atual.

## Pastas canônicas obrigatórias (V202)

Para **novas imagens**, o destino obrigatório no Drive é **07 – Atlas de Imagens (sincronização)** (`1ksSVWrmRaRlDoG4iDtTGvfr2OnPnhnY6`). Para **novos checkpoints ZIP/JSON**, o destino obrigatório é **Checkpoints Banco Mestre** (`1348cILBcxFG9p2cfPJ3WubmHswPRbD24`). Os IDs exatos constam de `assets/v202_storage_contract.json`; as pastas antigas de recuperação permanecem apenas para leitura. Cada upload externo deve confirmar `parents` via Google Drive; o site só faz upload do manifesto JSON, não do ZIP.

## Sincronização e preservação

O site **não é um espelho contínuo do Google Drive**. Os **1.518 cartões públicos V194** são servidos por JSON estático do GitHub; alterações futuras na base privada do Drive somente aparecerão no site após auditoria e atualização publicada. SRS, grifos e respostas pessoais não entram nesses JSON.

Os **78 PDFs** do catálogo V149 são referências verificadas por ID no Drive. O módulo de consulta de PDFs V201 percorre DataBase_Concurso, CONCURSOS – ENGENHARIA CIVIL, Normas Regulamentadoras e Licenciamento Ambiental. Novos PDFs aparecem só na **sessão autenticada** do navegador, não no repositório.

O Atlas público tem 179 registros (86 históricos + 93 recuperados), e os 93 originais recuperados foram conciliados com os arquivos reais no Drive. **Na V205, as imagens adicionais da conta Drive autenticada entram em um grupo dentro do Atlas e não duplicam as 93 já públicas. O grupo não altera o catálogo público nem realiza publicação automática.** A consulta privada de imagens V201 percorre o Atlas e a pasta de originais recuperados P11–P14 após OAuth. Novas imagens não são publicadas automaticamente; SVGs do Drive são sinalizados como formatos não pré-visualizados no editor atual.

No Drive do titular encontram-se as pastas `CONCURSOS – ENGENHARIA CIVIL` e `DataBase_Concurso`. A leitura de arquivos Drive, a publicação de imagens, os cartões e o SRS são processos distintos. Um arquivo no Drive ou catálogo não comprova exibição no site. Versões históricas `vNNN.html` e dados locais anteriores foram preservados; `localStorage`, `IndexedDB`, grifos e eventos SRS exigem backups independentes.

**Validação:** a consistência estrutural de V205 e os 93 IDs de imagens/78 PDFs foram conferidos; carregamento real, autenticação e renderização no navegador do titular permanecem sujeitos a teste.

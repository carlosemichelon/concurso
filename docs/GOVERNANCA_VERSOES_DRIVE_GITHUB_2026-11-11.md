# Governança e mapa do projeto — Banco Mestre / Eng Civil Concurso

**Auditoria em 11/11/2026.** Este documento organiza a localização e o significado dos artefatos; não homologa, por si, a integridade de nenhuma planilha nem substitui auditoria de IDs/SRS.

## 1. Quadro de referência conferido
| Camada | Referência | Situação verificada |
| --- | --- | --- |
| Site publicado | `gh-pages/assets/version.json` + `gh-pages/index.html` | V128 / `v128.html`, 11/11/2026 (após atualização concorrente; V126 preservada) |
| Branch de desenvolvimento legado | `main` | V031 (não é o site atual) |
| Base servida pelo portal | `BANCO_MESTRE_CANONICO_V024_H14_3_FUSOES_1482_ATIVOS_1499_IDS.xlsx`, no Drive | A V128 declara 1.499 IDs e 1.482 ativos da linha V024 H14, distribuídos por arquivos estáticos versionados; não equivale a comprovação de conciliação com V029 |
| Checkpoint mais recente localizado na pasta de checkpoints | `BANCO_MESTRE_CANONICO_V029_PETRO11_ENCERRADA.xlsx` | Auditada: 1.503 IDs, 1.486 ativos; os 1.499 cartões e respectivos eventos SRS de V024 foram preservados sem diferença, e 4 novos cartões aprovados foram acrescentados. Não publicada |
| Metodologia | `DataBase_Concurso/00_CONTROLE/00_METODOLOGIA_MESTRE_VIGENTE_v010` | Título e abertura conciliados com o adendo V010 em 11/11/2026, sem apagar os textos-base históricos |
| Revisões privadas | Drive / navegador | Não presumir sincronização de SRS, grifos, IndexedDB e localStorage com GitHub |

**Atenção:** V126 (versão do portal), V029 (arquivo da base), V024 H14 (linha de dados do portal) e v009 (metodologia) usam contagens independentes. Nunca ordenar tudo em uma única sequência Vnnn.

## 2. Navegação no Google Drive

### A. CONCURSOS – ENGENHARIA CIVIL
Localização: Google Drive conectado, pasta raiz `CONCURSOS – ENGENHARIA CIVIL` (link privado não publicado neste repositório).

- `00 – Painel e Planilhas`: visão principal do estudo, inventário, Caderno Mestre e base V024 H14 usada pelo portal.
- `00 – Painel e Planilhas/90 – Histórico de versões da base (preservado)`: versões V016 (duas), V018, V022, V023 e cópia antiga `Caderno Mestre – Eng Civil Concurso.xlsx` retiradas da visão principal **sem excluir nem mudar IDs de arquivo**.
- `00 – Painel e Planilhas/Checkpoints Banco Mestre`: checkpoints, evidências, auditorias e V025–V029. Preservar sem mesclar automaticamente.
- `01 – Engenharia Civil`, `02 – Português`, `03 – Legislação Municipal`, `04 – Matemática`: materiais por disciplina.
- `05 – Editais e Provas`; `06 – PDFs e Materiais`; `07 – Atlas de Imagens`: fontes e mídias.

Pasta de arquivo das versões anteriores: `CONCURSOS – ENGENHARIA CIVIL/00 – Painel e Planilhas/90 – Histórico de versões da base (preservado)`.

Checkpoint V029: localizar na subpasta `Checkpoints Banco Mestre`. Não homologado como substituição.

### B. DataBase_Concurso
Localização: Google Drive conectado, pasta `DataBase_Concurso` (link privado não publicado neste repositório).

| Diretório | Uso |
| --- | --- |
| `00_CONTROLE` | Metodologia, LOGs, protocolos, manifestos |
| `01_BASE_CANONICA` | Arquivos F17/V013 e incrementos históricos. **Não supor que este diretório contenha automaticamente a base operacional mais atual** |
| `02_HISTORICOS` | Conversas e registros recuperáveis |
| `03_FONTES` | Fontes de referência e documentos normativos |
| `04_MIDIAS` | Imagens e anexos |
| `05_REVISOES_SRS` | Revisões e evidências SRS |
| `06_BIBLIOTECA_ESTUDO` | Conteúdo para estudo |
| `07_PROPOSTAS` | Cartões propostos, aguardando aprovação |
| `08_AUDITORIAS` | Auditorias independentes e rastreabilidade |
| `09_EXPORTACOES` | ZIPs, checkpoints e versões históricas de site |
| `10_PORTAL_WEB` | Pacotes históricos de publicação |

As duas árvores de Drive foram preservadas; não consolidar pastas por nome sem auditar dependências e links.

## 3. GitHub: branch e versão correta
Repositório: https://github.com/carlosemichelon/concurso

- **Branch publicada = `gh-pages`.** A fonte operacional para conferir é `assets/version.json`, comparada a `index.html` e à presença de `vNNN.html`.
- **Branch padrão `main` = legado V031** no momento da auditoria. Não publicar nela.
- As páginas `vNNN.html` na raiz de `gh-pages` são URLs históricas, não duplicatas descartáveis. Não renomear/mover sem verificar redirecionamentos e dependências.
- [Inventário nominal das 102 branches](INVENTARIO_BRANCHES_2026-11-11.md)
- [Índice das 108 versões de páginas HTML](INDICE_PUBLICACAO_E_HISTORICO_HTML_2026-11-11.md): 32 branches de desenvolvimento/experimentos auditadas, 20 sem commits exclusivos, 12 divergentes com commits exclusivos; nenhuma exclusão.
- Inventário das 102 branches: 68 `backup/`, 21 `feature/` e 13 outras (incluindo `main`, `gh-pages` e experimentais `bm-*`). **Nenhuma foi apagada**.
- PR #7 de diagnóstico da V042 permanece aberta, sem decisão de fechamento nesta auditoria.
- O README antigo da `gh-pages` descrevia V015, e o cabeçalho de `VERSAO_ATUAL.md` descrevia V113. A documentação foi atualizada para explicar a distinção sem alterar páginas, módulos, dados ou manifesto.

## 4. Procedimento de futuras atualizações
1. Identificar fonte, ID, revisão, hash quando possível, origem e status (proposta/aprovado/integrado).
2. Para flashcards, comparar IDs e aprovação expressa; nunca importar automaticamente proposta nem alterar SRS por inferência.
3. Manter LOG append-only com contexto, alterações, fontes e pendências; criar checkpoint restaurável antes de promoção de base.
4. Para código, conferir `gh-pages` e `assets/version.json`; criar branch de trabalho e backup quando apropriado; testar; publicar nova `vNNN.html` e sincronizar `index.html`, manifesto e documentação.
5. Não transformar automaticamente um checkpoint de planilha V029 em dados públicos V126; conciliar explicitamente V024 versus V029 primeiro.
6. Para grifos, PDF, IndexedDB e SRS, verificar exportação/restauração privada própria; GitHub não é backup desses dados.

## 5. Pendências da auditoria
- Comparação de IDs/cartões/eventos V024 versus V029 concluída em 11/11: 1.499 antigos inalterados, 4 novos (CARD-1501 a CARD-1504), SRS dos quatro não iniciado. Antes de promoção, conferir eventuais incrementos Petrobras Parte 12, validação de tabelas multimodais e privacidade do build; manter originais.
- Auditar o compartilhamento dos documentos Drive (não foi modificado nesta organização).
- Revisar se 102 branches precisam continuar como pontos de recuperação, antes de qualquer exclusão, e examinar a PR #7.
- Guia metodológica renomeada para v010 e abertura corrigida para distinguir texto-base v005 de adendos v010; manter links pelo mesmo ID Drive.
- Comparar possíveis duplicatas por hash/conteúdo; nome idêntico ou arquivo de mesmo tamanho **não basta**.
- Não foi feita validação visual/OAuth da V126 nesta etapa.

## 6. LOG de organização — 11/11/2026
- Inventário de duas árvores Drive, pasta de checkpoints e repositório GitHub.
- Criação de `90 – Histórico de versões da base (preservado)` no Painel.
- Movimentação, preservando IDs originais, de 6 XLSX: V016 R1, V016 três cartões, V018, V022, V023 e cópia Excel antiga do Caderno Mestre. O Caderno Mestre Google Sheets permanece no Painel.
- V024 H14 mantida no Painel para não romper a referência atual do portal.
- V029 mantida no diretório de checkpoints; nenhuma aprovação/integração SRS executada.
- Documentação GitHub alinhada à versão publicada; nenhum HTML, ativo, arquivo JSON da base ou branch de backup alterado.

## 7. Atualização da auditoria — 11/11/2026
- A V029 foi efetivamente confrontada com a V024 por todas as colunas do cadastro de 1.499 cartões e da tabela SRS correspondente; sem diferenças nos IDs antigos, 4 novos cartões aprovados e 4 registros SRS não iniciados.
- A pasta DataBase_Concurso/00_CONTROLE recebeu um mapa privado de versões e links (Google Docs). O guia 00_COMECE_AQUI foi atualizado para informar V126 do portal, V024 da publicação e V029 do checkpoint.
- Documentação metodológica renomeada de v009 para v010 após constatar o adendo V010 no próprio arquivo. Nenhum cartão ou calendário SRS foi alterado.
- Branches com commits exclusivos preservadas, conforme inventário nominal; 68 backups ainda exigem auditoria própria, não foram deletados.

### Organização dos checkpoints após a conciliação — 11/11/2026
O diretório de checkpoints, antes com 108 arquivos diretamente na raiz, passou a conter cinco subpastas: **01 – Bases incrementais V025–V029 (5 arquivos)**; **02 – Pacotes de auditorias H e etapas (34)**; **03 – Relatórios e evidências H1–H14 (63)**; **04 – Checkpoints de sessões Petrobras (4)**; **05 – Publicação e pacotes complementares (2)**. A leitura de volta confirmou 108 arquivos distribuídos, nenhum arquivo solto; todos foram movidos dentro da mesma árvore, preservando IDs. O Google Drive privado contém links e detalhes no documento `01_MAPA_ATUAL_DAS_BASES_E_VERSOES — AUDITORIA 11-11-2026`. Nenhum conteúdo XLSX, ZIP ou SRS foi regravado.

## 8. Verificação concorrente da publicação V128 — 11/11/2026
Durante a auditoria, a publicação de terceiros avançou do manifesto V126 para V128, com `index.html` direcionando corretamente para `v128.html` e o arquivo presente, porém o campo `home` de `assets/version.json` ainda estava em `v126.html`. Foi corrigido **somente** `home` para `v128.html`, preservando `version=V128`, os arquivos JSON de cartões, contagens, HTML e a branch `gh-pages`. Leitura de volta confirmou manifesto e entrada coerentes: V128/v128.html e 1.499 cartões da V024 H14. A verificação não comprova propagação instantânea em todos os caches do GitHub Pages.

# Governança e mapa do projeto — Banco Mestre / Eng Civil Concurso

**Auditoria em 11/11/2026.** Este documento organiza a localização e o significado dos artefatos; não homologa, por si, a integridade de nenhuma planilha nem substitui auditoria de IDs/SRS.

## 1. Quadro de referência conferido
| Camada | Referência | Situação verificada |
| --- | --- | --- |
| Site publicado | `gh-pages/assets/version.json` + `gh-pages/index.html` | V126 / `v126.html`, 11/11/2026 |
| Branch de desenvolvimento legado | `main` | V031 (não é o site atual) |
| Base servida pelo portal | `BANCO_MESTRE_CANONICO_V024_H14_3_FUSOES_1482_ATIVOS_1499_IDS.xlsx`, no Drive | A V126 declara 1.499 IDs e 1.482 ativos da linha V024 H14, distribuídos por arquivos estáticos versionados; não equivale a comprovação de conciliação com V029 |
| Checkpoint mais recente localizado na pasta de checkpoints | `BANCO_MESTRE_CANONICO_V029_PETRO11_ENCERRADA.xlsx` | Histórico/candidato a conciliação, **não** promover por numeração sem comparar conteúdo, aprovação, IDs e eventos |
| Metodologia | `DataBase_Concurso/00_CONTROLE/00_METODOLOGIA_MESTRE_VIGENTE_v009` | Documento nominalmente vigente, com versões históricas separadas. Conferir se conteúdo e título estão sincronizados antes de editar |
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
- [Inventário nominal das 102 branches](INVENTARIO_BRANCHES_2026-11-11.md).
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
- Comparar em nível de ID/cartão/evento o conteúdo V024 H14 e o checkpoint V029. Decidir linha canônica após auditoria e autorizações; manter originais.
- Auditar o compartilhamento dos documentos Drive (não foi modificado nesta organização).
- Revisar se 102 branches precisam continuar como pontos de recuperação, antes de qualquer exclusão, e examinar a PR #7.
- Verificar se a guia metodológica nomeada v009 está realmente atualizada internamente.
- Comparar possíveis duplicatas por hash/conteúdo; nome idêntico ou arquivo de mesmo tamanho **não basta**.
- Não foi feita validação visual/OAuth da V126 nesta etapa.

## 6. LOG de organização — 11/11/2026
- Inventário de duas árvores Drive, pasta de checkpoints e repositório GitHub.
- Criação de `90 – Histórico de versões da base (preservado)` no Painel.
- Movimentação, preservando IDs originais, de 6 XLSX: V016 R1, V016 três cartões, V018, V022, V023 e cópia Excel antiga do Caderno Mestre. O Caderno Mestre Google Sheets permanece no Painel.
- V024 H14 mantida no Painel para não romper a referência atual do portal.
- V029 mantida no diretório de checkpoints; nenhuma aprovação/integração SRS executada.
- Documentação GitHub alinhada à versão publicada; nenhum HTML, ativo, arquivo JSON da base ou branch de backup alterado.

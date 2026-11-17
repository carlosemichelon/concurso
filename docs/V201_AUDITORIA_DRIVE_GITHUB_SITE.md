# Banco Mestre V201 — Auditoria Drive → GitHub → portal
Data: 17/11/2026. Escopo: IDs, caminhos, presença de arquivos, leitura dinâmica e limites de publicação. Branch `gh-pages`. **Não** foram modificados dados, cartões, SRS, PDFs, imagens originais nem permissões do Google Drive.

## 1. Arquitetura real
| Acervo | Fonte no site | Atualização do Drive | Publicação automática no GitHub |
|---|---|---|---|
| Cartões | JSON público `meta_public_v194.json` + 7 partes de cartões | **Não automática na V201**; requer auditoria/publicação da base | Não |
| SRS | Dados pessoais externos ao JSON público | Não integrado automaticamente; preservar original | Não |
| Atlas público | `meta_public_v194.json` e complementos V180; catálogo editorial V198 | Links para arquivos recuperados no Drive; catálogo versionado somente no GitHub | Não |
| Imagens privadas | Leitor OAuth V201, agora consulta a árvore do Atlas e também a pasta dos originais recuperados | **Sim, apenas na sessão autenticada**, rechecagem em até 2 min | Não |
| PDFs públicos | `pdf_catalog_v149.json` (78 referências por ID) | O leitor usa o arquivo do Drive quando há permissão, não copia o PDF ao GitHub | Não |
| PDFs adicionais | Consulta OAuth V201 de pastas e subpastas de `DataBase_Concurso`, `CONCURSOS – ENGENHARIA CIVIL`, Normas Regulamentadoras e Licenciamento Ambiental | **Sim, somente sessão autenticada**, comando manual ou após autorização | Não |

**Regra:** um arquivo existir no Drive, aparecer numa lista privada ou ter seu ID no catálogo não é prova de que bytes estejam hospedados no GitHub ou que o leitor tenha aberto efetivamente o arquivo.

## 2. Imagens recuperadas P11–P14 — conciliação de IDs
- Parte 11: 24 registros e 24 imagens identificadas por ID no Drive.
- Parte 12: 30 registros e 30 imagens por ID.
- Parte 13: 21 registros e 21 imagens por ID.
- Parte 14: 18 registros e 18 imagens por ID.
- **93/93 IDs, nomes, tipos MIME e diretórios coincidentes**, sem registros faltantes, extras ou URLs de arquivo incorretas nesse recorte.
- O catálogo público do Atlas reúne **86 imagens históricas + 93 registros recuperados = 179**; o editorial V198 as classifica em 85 de cartão e 94 de conteúdo.
- As 93 imagens recuperadas são referenciadas por URL de miniatura do Drive, não estão garantidas como bytes públicos do GitHub. O teste de carregamento sem OAuth no navegador não foi executado.
- A árvore privada do Atlas também contém arquivos posteriores P15 e materiais P14. Uma parcela de imagens SVG permanece **não compatível com o editor atual**, e a V201 informa sua exclusão da prévia em vez de ocultar o motivo. O catálogo público **não** absorve automaticamente imagens P15 ou futuras imagens do Drive.
- O scanner privado anterior consultava somente a árvore `07 – Atlas de Imagens`; a V201 inclui como segunda raiz `04_MIDIAS / ORIGINAIS_RECUPERADOS_CONVERSAS_11_12_13_14`, preservando deduplicação por ID e busca recursiva.

## 3. PDFs — links verificados no Drive
- **78/78** `file_id` do catálogo V149 foram encontrados no Drive por consulta de metadados e identificados como `application/pdf`.
- **78 IDs distintos** no JSON, sem ID ausente, duplicado nem URL `/file/d/{file_id}/view` divergente.
- Alguns arquivos mantêm nomes diferentes dos rótulos `filename` registrados no catálogo; **o ID do arquivo permaneceu correto**.
- Os **6 PDFs de NRs** e o **PDF de Licenciamento Ambiental** das pastas especiais já pertencem aos 78 do catálogo: a consulta não exige duplicá-los.
- A busca recursiva V201 pode encontrar novos PDFs autorizados e incluí-los na **lista da sessão**; não regrava o catálogo GitHub, não altera PDF nem copia grifos para outra revisão.
- Não foi testado OAuth no navegador nem a renderização individual de cada PDF; existência e MIME não equivalem a leitura efetivamente bem-sucedida na interface.

## 4. Cartões privados versus públicos
- O feed privado de leitura do Drive, datado de **12/11/2026**, contém **1.518 cartões, 19 questões, 11 registros de imagem e 1.518 registros SRS**.
- A base pública V194 no GitHub contém **1.518 cartões (1.501 ativos, 17 inativos)** mais 22 cartões operacionais Ijuí separados.
- Os **1.518 IDs** coincidem entre as duas bases; foram cotejadas a extensão e impressões digitais computadas dos campos ID, grupo, disciplina, assunto, subassunto, frente, verso, explicação, macete, referência e ativo. **Todos os 11 campos agregados coincidiram.** Essa comparação é de snapshots; não garante igualdade perpétua ou futuras atualizações automáticas.
- A versão V201 **não carrega o feed privado ou XLSX de cartões automaticamente**. O carregador ativo utiliza os JSON públicos V194. A configuração legada de sincronização XLSX foi retirada da posição de "sincronização atual" no manifesto, mantida apenas como registro histórico.
- Não modificar, reprocessar nem publicar os 1.518 registros SRS privados.

## 5. Melhorias não destrutivas da V201
- `v201.html` preserva V200 como rollback e mantém os demais módulos do portal.
- `assets/v201_drive_images_sync.js`: varredura por duas raízes de Drive, deduplicação por ID, aviso sobre SVG e limite de 15 MB, painel tornado visível apesar do CSS antigo que oculta `section` sem `active`; texto distingue **consulta de sessão** de publicação.
- `assets/v201_drive_pdf_sync.js`: mensagem de resultado passa a dizer **consulta autorizada nesta sessão, não publicação no GitHub**; mantém os quatro caminhos de busca e IDs.
- `assets/v201_public_cards_ui.js`: esclarece que JSON público V194 não é atualização automática do Drive.
- `assets/v201_site_info.js`, `v201_diagnostico_local.js`, `v201_discursive.js`: rótulos e diagnóstico V201; registros discursivos **novos** preservam formato V195 e passam a registrar origem V201.
- O painel do Diagnóstico local usa `div` em lugar de `section` genérica, para evitar ocultação acidental pelo CSS global.
- Contagens e fonte de cada categoria registradas no manifesto; nenhuma permissão de compartilhamento foi modificada.

## 6. Homologação ainda necessária
**Não verificado:** versão efetivamente implantada pelo GitHub Pages em rede pública; autenticação Google real no navegador do titular; abertura de PDF; carregamento de thumbnail do Drive sem login; abertura de imagem no editor; link imagem↔cartão; sincronização pós-upload efetivo. O teste estrutural do HTML e das referências não comprova essas etapas.

A concessão de permissões Drive deve ser auditada em separado pelo titular; mudanças de compartilhamento **não** foram efetuadas.

**Rollback:** `v200.html`. V201 não envia dados privados ao GitHub, não altera SRS e não substitui arquivos originais.

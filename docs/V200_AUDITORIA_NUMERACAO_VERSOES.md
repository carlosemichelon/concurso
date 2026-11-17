# Banco Mestre — Auditoria dos números de versão V200
**Data:** 17/11/2026. **Branch ativa:** `gh-pages`. **Escopo:** manifesto de publicação, HTML inicial, scripts ativos, telas de diagnóstico, base pública, respostas discursivas e documentação.

## Definição do número correto por componente
- **Portal vigente:** V200 (`v200.html`; `index.html` carrega o manifesto e encaminha para V200).
- **Portal anterior / rollback:** V199 (`v199.html`).
- **Base didática pública dos flashcards:** V194, arquivo `meta_public_v194.json`: **1.518 IDs** (1.501 ativos; 17 inativos), e mais **22 cartões operacionais de Ijuí** independentes, totalizando **1.540 registros na interface**.
- **Catálogo editorial de imagens:** V198, arquivo `v198_editorial_images_catalog.json`: **179 imagens** (85 de cartão; 94 de conteúdo).
- **Catálogo de PDFs:** `pdf_catalog_v149.json`, com **78 documentos**. A versão do esquema interno do catálogo (`BancoMestrePDFCatalogV140`) não é a versão do portal.
- **Código de consulta de cartões:** módulo leitor V165, com módulos evolutivos V198, histórico reauditoria V199 para cartões específicos, e apresentação/integração V200.
- **Formato histórico das respostas discursivas e seu armazenamento:** V195; novos registros passam a identificar o `site_version` **V200**, preservando `format` V195, `base_version` V194 e tentativas anteriores.
- **Metodologia no Google Drive:** arquivo mestre v014 com adendos posteriores; **não** é numerada pela V200 do portal.
- `V062`, `V024`, `V022` e outros marcadores históricos continuam no código-fonte e no histórico quando representam a linhagem dos arquivos, não a edição online atual.

## Não conformidades confirmadas na V199
1. `assets/version.json` informava `version=V199`, mas `home=v196.html` e `previous_version=V195`: campos incompatíveis.
2. `base` e `cache_policy` ainda descreviam **1.499 IDs/1.482 ativos da V024 H14** como se fossem a base pública vigente, embora `meta_public_v194.json` e `counts` indicassem **1.518/1.501**.
3. O módulo efetivamente carregado `v193_diagnostico_local.js` exigia **V193 / v193.html** para aprovar a checagem de versão; assim o diagnóstico da V199 gerava falsa não conformidade mesmo com a página recente.
4. A API de `v194_public_cards_ui.js` expunha `total=1499` e `active=1482`, divergindo dos textos visíveis que já diziam 1.518/1.501.
5. O carregador apresentava o texto **Carregando cartões V024...**, embora utilize a base pública V194.
6. Novas respostas discursivas de V199 eram salvas com `site_version=V195`; o número V195 deveria referir-se ao **formato de registro**, não à versão da página que gerou a tentativa.
7. README abria com V131 (situação de 11/11/2026) e mantinha indicadores antigos como se fossem atuais. O manifesto preservava referências históricas no campo top-level `source_base`, sem diferenciar origem antiga de catálogo ativo.

## Correções na V200
- Criados `v200.html`, `assets/v200_site_info.js`, `assets/v200_diagnostico_local.js`, `assets/v200_public_cards_ui.js` e `assets/v200_discursive.js`.
- Diagnóstico V200 só declara versão atual **correta** quando manifesto informa `V200`, `v200.html` e anterior `V199`.
- `v200_site_info.js` apresenta `Portal V200 · cartões V194 · Atlas V198` em cabeçalho, com rótulos explícitos nos indicadores e rodapé.
- `v200_public_cards_ui.js` expõe 1.518/1.501/17; a linhagem V194 permanece inalterada.
- `v200_discursive.js` grava `site_version=V200` para **novos registros**, mantendo compatibilidade com a base e com o armazenamento/backup histórico V195. Não altera respostas já registradas.
- `v200.html` exibe texto de carregamento V194 corretamente, mantém exatamente 86 scripts e 73 CSS sem duplicação; usa os mesmos módulos históricos compatíveis.
- Atualizados `index.html`, manifesto e README para registrar V200 com anterior V199 e identificação explícita dos componentes. Preservados históricos, checkpoints, cartões, mídias, SRS e módulos anteriores.

## Auditoria da sequência histórica do repositório
Antes da V200, foram localizadas **179 páginas HTML versionadas**, de `v018.html` a `v199.html`; não havia `v039.html`, `v181.html` nem `v182.html`. O número de versão **V199 não significava 199 páginas**: alguns módulos e números históricos não possuem página HTML independente. Com a V200, há **180 páginas HTML versionadas**; não foram criadas páginas artificiais para lacunas históricas.

## Verificações executadas
- `document.write` da página V200 gerou HTML usando o arquivo original `v062.html` e passou nas condições de guarda.
- Todas as **86 referências a scripts e 73 folhas de estilo** foram cotejadas com o diretório de assets e existem. Sem duplicação de carregamentos por nome.
- Scripts de diagnóstico V193, estatísticas de cartões V194, cabeçalho V199 e discursivas V195 **não são carregados pela V200**; são substituídos pelos equivalentes V200, com preservação das versões anteriores como arquivos separados.
- JavaScript parseado em validação estática. Nenhum OAuth, SRS ou dado pessoal alterado.
- Conferidos os **7 arquivos de cartões públicos V194**: 1.518 IDs distintos, 1.501 ativos, 17 inativos; e a cópia operacional Ijuí V027: 22 IDs próprios, total de 1.540 registros de consulta.
- Conferidos os **179 registros do catálogo editorial V198** (85 cartão / 94 conteúdo) e os **78 documentos do catálogo PDF V149**.
- Após a criação de V200, recontado o diretório da branch: **180 páginas versionadas** entre V018 e V200, sem HTML V039, V181 e V182. Não foi presumida exclusão indevida dessas lacunas.
- **Limitação:** a renderização real e o deploy concluído no GitHub Pages não foram medidos com navegador acessível; confirmação do repositório não equivale a teste de interface do usuário.

## Guia de leitura dos números no portal
O rótulo `Portal V200 · cartões V194 · Atlas V198` **não contém três versões concorrentes**. Significa, respectivamente, o código/HTML atual; o conjunto de 1.518 cartões públicos; e o catálogo editorial de 179 imagens. Versões de módulos (V165, V186, V195 etc.) devem ser mantidas enquanto seu código, formato ou armazenamento permanecer ativo; não precisam acompanhar o número do portal.

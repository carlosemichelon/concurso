# Banco Mestre — V162: maior cobertura de lei seca por cartão (13/11/2026)

A V162 adiciona **14 transcrições literais de dispositivos** à V161 sem substituir os versos originais: 6 artigos/trechos do Decreto RS 23.430/1974 (arts. 57, 61–63), 4 incisos do art. 5º da CONAMA 001/1986, 1 art. 8º da CONAMA 237/1997 (com aviso de confrontar com Lei 15.190/2025), 2 do art. 9º do Código de Ética Confea e 1 art. 37, V da CF.

**Cobertura total:** 36+14=50 transcrições novas públicas, acrescidas a 3 versos literais preservados = **53/65 públicos**. Ijuí: **15/22 operacionais** com lei seca. Total **68/87**, com 19 cartões restantes honestamente apresentados como 'Lei seca a conferir'. Parte desses 19 são jurisprudência, legislação municipal não identificada ou conflito normativo, e nunca devem receber texto inventado. Dados V045 privados, quando importados, seguem a política de verificação de literalidade sem publicação do acervo.

O módulo `assets/v162_lei_seca_literal.js` substitui somente o V161 na entrada nova; `assets/lei_seca_complementos_v162.json` registra cada ID, trecho, dispositivo, fonte e ressalvas. `v161.html` e versões precedentes intactos. O comportamento segue **um botão por cartão**, sem expor o texto automaticamente e sem abrir a resposta conceitual. SRS, IDs, JSON canônico, Drive, Vade, PDFs, imagens, grifos e históricos não modificados.

**Auditoria:** sintaxe do carregador e módulo, unicidade de 65 IDs entre 3 sidecars, HTTPS das fontes, manifesto e índices conferidos. A interação de navegador pessoal, inclusive Drive OAuth, permanece pendente.

---

# Banco Mestre — V161: botão literal de lei seca por cartão (13/11/2026)

**Motivo:** Na V160, ocultar o resumo do verso não exibia o texto legal. A V161 substitui (não sobrepõe) `v160_lei_seca_toggle.js` por `assets/v161_lei_seca_literal.js`; o texto explicativo e o verso canônico são mantidos inalterados.

**Comportamento:** Cada cartão de legislação tem botão visível na frente, **“📜 Mostrar lei seca”** / **“📜 Ocultar lei seca”**. O controle apresenta apenas o dispositivo literal acompanhado da norma, artigo, alcance da transcrição e link à fonte. Não abre automaticamente a resposta original. Mantém estado temporário por ID durante filtros e navegação na sessão, sem gravar SRS/localStorage.

**Cobertura auditada desta etapa:** `assets/lei_seca_literais_v161.json` contém 36 IDs públicos; `assets/lei_seca_ijui_v161.json` contém 15 cartões operacionais de Ijuí; os três versos legais da Lei 15.190/2025 (CARD-1495/1496/1497) são reaproveitados na íntegra. Resultado: 39/65 cartões públicos de Legislação, 15/22 Ijuí = 54/87 com trecho de lei seca documentado, sem transformar resumos em citações. Os demais 33 continuam como **“Lei seca a conferir”** ao tocar no botão; isto não significa que uma transcrição foi concluída. Fontes e alcances constam dos JSONs. Em V045 privada, usar apenas registros verificados e não copiar dados ao GitHub.

**Alerta jurídico:** O original PROP-IJUI-001 cita a Lei 7.540/2024 art. 2º, mas a definição de cargo/investidura foi encontrada nos arts. 2º e 3º da Lei 3.871/2001, em PDF disponibilizado pela Câmara Municipal; o módulo apresenta a transcrição **com alerta de divergência**, sem editar o ID e a referência original. Não realizar promoção canônica nem migração silenciosa.

**Preservação:** 1.499 IDs públicos (1.482 ativos), 22 Ijuí, 1.518 IDs do Drive privado opcional, SRS e histórias, 78 PDFs, 86 imagens, Vade e grifos preservados. Apenas o HTML loader, o manifesto, o redirecionamento e módulos de apresentação foram modificados.

**Verificação:** JavaScript do módulo e loader conferidos sintaticamente, JSON com IDs únicos e fontes HTTPS; teste visual em sessão de usuário real, inclusive Google OAuth privado, permanece pendente.

---

# Banco Mestre — V160: ocultar e revelar a lei seca (13/11/2026)

**Publicação:** `gh-pages/v160.html`, novo módulo `assets/v160_lei_seca_toggle.js`. Entrada `index.html` e manifesto `assets/version.json` apontam para V160. A V159 foi preservada.

**Interface:** cada cartão de legislação oferece uma segunda área recolhível, independente da resposta geral. O texto inicia oculto por padrão, e é possível mostrar e ocultar novamente pelo próprio cartão. A opção global "Ocultar por padrão" afeta os cartões visíveis. O estado individual é retido apenas em memória, inclusive ao trocar filtros. A janela individual V158 usa o mesmo módulo.

**Precisão jurídica:** CARD-1495, CARD-1496 e CARD-1497 apresentam lei seca literal no verso e são identificados como tal. Nos demais cartões de legislação, inclusive Ijuí, o verso original é recolhível com aviso explícito de que não se confirmou transcrição literal do artigo. Se a base trouxer campo independente de lei seca (`texto_lei_seca`, `lei_seca_texto`, `lei_seca`, `legal_text`, `law_text`, `legal_excerpt`), a transcrição é ocultada separadamente da resposta conceitual. Não se inventa texto legal.

**Integridade:** V024 H14 (1.499 IDs, 1.482 ativos), 22 Ijuí, V045 privada (1.518 IDs quando carregados), SRS, anotações, 78 PDFs, 86 imagens ativas, referências e textos originais não foram modificados. Módulo sem escrita em localStorage/IndexedDB/Drive.

**Auditoria:** JS do módulo e do loader V160 conferidos sintaticamente, nomes e referências de versão validados, contagens do manifesto preservadas. Navegador pessoal autenticado ainda não homologado.

---

# Banco Mestre — V159: buscador de imagens unificado (13/11/2026)

**Mudança publicada:** barra visual duplicada `bm-v044-atlas-controls` oculta apenas após a realocação bem-sucedida dos controles. O filtro principal permanece o V156 com Disciplina → Assunto geral → Assunto específico → Subassunto, contagens e busca por ID/título. Os filtros exclusivos (favoritas, ordenação, visibilidade local) e a ação "Copiar excluídas p/ Drive" foram transferidos para o painel recolhível "Mais opções" sem recriar dados nem redefinir eventos.

**Arquivos:** `v159.html` é derivado de V158; adiciona `assets/v159_atlas_clean_ui.js` após `assets/v156_image_classified_library.js`. V158 permanece intacta. `gh-pages/index.html` redireciona V159 e `assets/version.json` publica `version=V159`, `home=v159.html`.

**Preservação:** 86 imagens ativas, 184 IDs já removidos da biblioteca ativa, 78 PDFs, cartão em aba V158, acesso privado Drive V157, favoritos e títulos/ocultações locais, manuscrito/Vade, grifos e SRS. Nenhum dado ou arquivo no Google Drive foi excluído nem sobrescrito. O painel "Visibilidade local" serve apenas para ocultações/restaurações locais, não para reintroduzir registros anteriormente removidos.

**Validações:** arquivos V159 disponíveis em `gh-pages`; checagem de sintaxe JavaScript e consistência do carregamento e contagens do manifesto. Testes visuais no navegador real/autenticado ainda pendentes.

---

# Banco Mestre — V158: correção de cartão individual e retorno (12/11/2026)

**Problema confirmado:** o link `v055.html?cartao=CARD-0130#cartoes` abre a edição histórica V055. O módulo `assets/v055_card_window.js` também continha **endereços fixos V055** para abrir um cartão e para o botão **Voltar aos cartões**, causando retorno a uma versão obsoleta.

**Correções publicadas:** o antigo `v055.html` redireciona somente links seguros com `?cartao=ID` para `index.html`; o redirecionador `index.html` preserva o ID validado e o fragmento, encaminhando à versão mais recente (`V158`). O novo `assets/v158_card_window.js`, carregado em `v158.html`, abre uma visualização individual numa aba separada por `index.html?cartao=CARD-0130#cartoes`, sem antecipar a resposta, preservando o verso e sem alterar dados; **Voltar aos cartões** direciona a `index.html#cartoes` (versão atual). Há acesso aos PDFs atuais no mesmo menu.

**Auditoria:** `CARD-0130` localizado em `cards_public_v024_000.json`, sobre Qi e Qf de redes coletoras (NBR 9649). Bootstrap da versão nova gerou ~50 mil caracteres, scripts internos sem erros de sintaxe, com arquivos V157 de sincronização privada, V156 de imagens, V154 de Vade, V152 de flashcards e catálogo de 78 PDFs mantidos. Simulação das URLs validou: abertura individual, retorno, redirecionamento de V055, preservação da busca por ID no index e rejeição de parâmetros inválidos. Nenhum SRS, cartão, grifo ou PDF foi modificado. **Teste dentro do navegador real do usuário não realizado.**

---

# Banco Mestre — V157: sincronização privada da Parte 12 (12/11/2026)

A página publicada em `gh-pages/index.html` direciona para `v157.html`, mantendo `v156.html` e o catálogo público V024 H14 intactos. O módulo `assets/v157_private_sync.js` acrescenta em **Flashcards** a opção **Conectar Drive e carregar V045**. A autorização Google OAuth é de **somente leitura**, por ação do usuário; tokens e dados não são escritos no GitHub, localStorage ou IndexedDB.

A fonte `BANCO_MESTRE_PRIVADO_V045_SYNC_2026-11-12.json` fica em pasta **restrita ao proprietário no Google Drive** (ID do arquivo `1Xl_SpP1N1VgaeMAfovlgtOvMQwB6xQR4`). São **1.518 cartões** (1.501 ativos), **19 questões**, **1.518 registros de SRS de referência** e **11 imagens vinculadas**. O botão de importação valida formato, contagens, unicidade dos IDs e SHA-256 da fonte, preserva os cartões operacionais de Ijuí e não sobrescreve o SRS local. O catálogo público continua 1.499 IDs, 1.482 ativos.

Os **11 PNGs originais IMG-P12-001 a IMG-P12-011** foram copiados para a pasta privada do Atlas (`1ksSVWrmRaRlDoG4iDtTGvfr2OnPnhnY6`), que já conta com o leitor de imagens autenticado V084. O acervo público de 86 imagens e as exclusões anteriores não foram alterados. O usuário deve autorizar a leitura na aba **Imagens** para abrir essa biblioteca.

**Verificações efetuadas:** versão/entrada/HTML/módulo consistentes e estrutura da fonte conferida; permissões da fonte privada restritas ao proprietário. **Pendência:** o OAuth e o carregamento efetivo devem ser testados no navegador do usuário, porque o conector não executa uma sessão Google interativa de terceiros. Não afirmar sucesso de login sem esse teste.

---

# Banco Mestre — V156: reclassificação visual de 86 imagens ativas (12/11/2026)

Reclassificação concluída com inspeção visual da totalidade dos registros ativos: **70 prévias JPEG publicadas** e **16 recortes originais PNG lidos do Google Drive**, sem restaurar os **184 IDs excluídos**. Cada ID recebeu disciplina, assunto geral, assunto específico, subassunto, título descritivo, evidência e status de auditoria em `assets/image_classificacao_v156.json`.

**Resultado:** 84 imagens tiveram o assunto identificado com boa confiança. Permanecem duas ressalvas: **IMG-001** é um material já identificado como tecnicamente problemático (preservado com advertência, sem homologação de fórmulas), e **IMG-044** exige leitura do original em maior resolução por ter prévia insuficiente. A auditoria de assunto não equivale à validação normativa de fórmulas, prazos ou gabaritos.

As principais correções foram: pórticos IMG-004/010/024, esquadrias de madeira IMG-052, coletores públicos e poços de visita IMG-079/085, ensaio de ductilidade IMG-094, NR-7/PCMSO IMG-112, vocabulário de interpretação IMG-144, validade de argumentos IMG-146, geometria plana IMG-151. Os três recortes Petrobras antes pendentes (P10-01, P10-03 e P10-04) tiveram seus assuntos identificados com base no texto dos originais.

A biblioteca agora lê `assets/image_classificacao_v156.json`, `assets/imagens_assuntos_v156.json`, `assets/imagens_descritivas_v156.json` e `assets/image_grupos_v156.json`. O renderizador `assets/v156_atlas_edicao_completa.js` mantém favoritos, títulos personalizados, edição, originais e grifos; o menu `assets/v156_image_classified_library.js` continua com filtros encadeados e contagens. Os **16 recortes ambientais** são consultáveis também sob Legislação, por vínculo secundário, sem duplicar a mídia.

Auditorias: 86 IDs presentes em quatro arquivos novos; 13 categorias gerais idênticas aos flashcards; grupos de Pórticos (3), NR-7 (3), Estruturas (20), Legislação ambiental (16); busca por ID, reset e ausência dos 184 excluídos foram testados. Bootstrap de V156 montado sem erros de sintaxe; PDFs V002 (78), Flashcards V152, SRS, Vade V154 e Redação V146 foram preservados. **Validação no navegador autenticado do usuário ainda não executada.**

Relatório individual: `AUDITORIA_IMAGENS_ATIVAS_V156.md` — **86 linhas por ID**, com disciplina, assunto geral, assunto específico, subassunto e status.

---

# Banco Mestre — V155: Classificação das imagens igual aos flashcards (12/11/2026)

O Atlas de imagens passa a usar filtros **Disciplina → Assunto geral → Assunto específico → Subassunto** com contagens dinâmicas, seletores encadeados e botão Limpar filtros. O segundo nível reutiliza integralmente as **13 categorias gerais de flashcards V128**; somente opções presentes na seleção aparecem. O assunto específico segue a categoria temática dos metadados originais e o subassunto segue as relações de estudo documentadas (sem criar conteúdos quando não foram identificados).

A camada `assets/image_classificacao_v155.json` liga os 86 IDs da base ativa V154 à hierarquia; registra grupo original, categoria, assunto, origem da classificação, evidência e status técnico. Existem 70 imagens históricas e 16 recortes Petrobras, com 4 referências cruzadas explícitas à disciplina Legislação, sem duplicar arquivos. Alguns recortes têm subassunto pendente ou carecem de auditoria visual; essas pendências foram preservadas, não substituídas por inferências.

O módulo `assets/v155_image_classified_library.js` reaproveita o renderizador e as funções de favoritos, editor e grifos de V154. Os grupos permanecem recolhidos enquanto nenhum filtro estiver escolhido. Ao filtrar, o Atlas mostra os cartões correspondentes, respeita a paginação e a busca por ID, e permite limpar filtros. Os 184 IDs excluídos na V154 continuam ausentes; **86 imagens ativas**, **78 PDFs** e a versão corrente do Vade Mecum com cache SHA-256 permanecem inalterados.

**Validação:** 86 IDs classificados sem duplicatas, 13 categorias gerais idênticas às de flashcards, simulações positivas de Engenharia Civil (73), Estruturas (21), Vigas (10), Momento de inércia (1), Matemática (5), Legislação cruzada (4), reset, busca exata por ID e impossibilidade de restaurar os 184 excluídos. Bootstrap completo V155 montado com 50.185 caracteres e sem erros de sintaxe; leitor de PDF/Redação/SRS preservados. Navegação autenticada real ainda não homologada.

---

# Banco Mestre — V154: biblioteca ativa limpa + Vade atual validado (12/11/2026)

## Exclusão efetiva da biblioteca de imagens
O arquivo privado `EXCLUSOES_ATLAS_184_V046_ORIGINAL_2026-11-10.json` contém 184 exclusões por ID. Foram removidos **184 registros do catálogo de produção**, e criados arquivos independentes `meta_public_v154.json`, `imagens_assuntos_v154.json`, `image_grupos_v154.json`, `imagens_descritivas_v154.json` e sete arquivos `img_live_v154_00.json` a `img_live_v154_06.json` com **somente 70 imagens históricas remanescentes**. Mais os 16 recortes Petrobras 10, a biblioteca ativa soma **86 registros**. O filtro de excluídas não reconstrói os 184 IDs removidos. Foram mantidos os estados locais das demais imagens; nenhuma operação apagou o histórico dos cartões, grifos ou imagens remanescentes.

**Limite de segurança:** 36 vínculos candidatos do arquivo de exclusões apontam para arquivos do Google Drive, mas são *associações por nome não verificadas*; nenhum deles recebeu autorização de deleção pelo critério de identidade do arquivo. Assim, **zero arquivos do Google Drive foram fisicamente excluídos**. Cópias e catálogos históricos V153 e anteriores continuam no repositório como backups; o catálogo de produção e as prévias carregadas não os acessam.

Arquivos ativos: `v154.html`, `assets/v154_boot_topic.js`, `assets/v154_atlas_edicao_completa.js`, `assets/v154_image_library.js`. O importador de exclusões V086 e a camada de 184 ocultos V087 não integram mais a página ativa.

## Vade Mecum vigente e autorização
Google Drive vigente: `1Bl5q1QE-HKk_G3JSfcP2qQWdnFhckzHI`, edição Senado 3ª edição com grifos e negritos. O PDF atual de 37.143.909 bytes teve seu **SHA-256 verificado** como `2c836a11dcdae84e62e3e4cac8e449de760f82d9acd13278da50c5634f296a90`.

O módulo `assets/v154_vade_current.js` consulta a cópia local do navegador (IndexedDB) por ID e calcula o hash antes de reabrir. Uma cópia antiga é **recusada**, não excluída, e o botão tenta buscar a fonte atual no Google Drive. O botão `Sincronizar Vade` sempre força uma conferência do Drive. O leitor genérico `assets/v154_drive_direct.js` também obriga a edição vigente ao usar Editar PDF para o ID de estudo do Vade.

O OAuth do site GitHub Pages é client-side e usa access tokens temporários (~1 hora), não refresh tokens. A autorização anterior de consentimento pode ser reconhecida sem guardar credenciais; cópias locais atuais verificadas permitem abrir sem nova conexão. **Não se deve armazenar um refresh token no localStorage de uma página estática**. Renovação permanente segura exigiria fluxo de authorization code com back-end e armazenagem segura do refresh token.

## Auditoria
- 70 miniaturas em sete arquivos de produção; 70 metadados históricos ativos; 16 recortes externos; total 86 IDs sem duplicatas.
- Fonte descritiva e associação de grupos com 86 itens cada.
- Bootstrap V154 montou 50 mil caracteres sem erros de sintaxe, mantendo PDF V002 de 274 páginas (78 PDFs ativos), Flashcards V152, Redação V146 e SRS.
- Testes simulados de navegação em grupos, Petrobras 10, pesquisa global e filtro de excluídas passaram.
- Hash de Vade atual conferido com download autenticado, não estimado.
- **Teste com o OAuth real do navegador do usuário ainda pendente.**

---

# Banco Mestre — V153: Atlas de imagens organizado por assunto (12/11/2026)

A biblioteca **Imagens e pranchas** agora usa áreas e grupos temáticos equivalentes aos da biblioteca de PDFs. Foram associados **270 IDs** pelo catálogo `assets/imagens_assuntos_v032.json`: **254 imagens históricas e 16 recortes Petrobras 10**; as três correções de classificação IMG-044 a IMG-046 foram mantidas. A camada de organização usa `assets/image_grupos_v153.json` com 16 grupos em 3 áreas, sem editar a catalogação técnica original.

A interface apresenta grupos inicialmente recolhidos e monta os cartões de cada grupo sob demanda, preservando o limite original de 24 e o botão Mostrar mais. A renderização continua feita pelo Atlas V060 versionado em `assets/v153_atlas_edicao_completa.js`, incluindo favoritos, edição de título/área/assunto/descrição/notas locais, prévias e originais associados, edição/grifos, vínculos, classificação e status. A navegação usa `assets/v153_image_library.js`. As imagens privadas sincronizadas pelo Drive V084 continuam em painel independente. Os estados de visibilidade pré-existentes, inclusive as 184 exclusões históricas por padrão, permanecem reversíveis e não foram apagados; o que o navegador já marcou explicitamente continua prevalecendo.

**Auditoria:** catálogo de 270 IDs sem duplicatas, associação por grupos sem faltas; bootstrap dinâmico de `v153.html` gerado com sucesso e sem erros de sintaxe; validação de recursos presentes no Atlas legado; testes simulados de diretório recolhido, 86 visíveis por padrão (70+16), grupo P10 com 16 imagens, modo excluídas e busca geral. **Sem teste OAuth real no navegador do usuário.** PDF V002, catálogo de 78 PDFs, filtros de flashcards V152, SRS e Redação V146 preservados.

---

# Banco Mestre — V152: novos filtros de flashcards (12/11/2026)

O portal agora permite selecionar **disciplina → assunto geral → assunto específico → subassunto**, com opções encadeadas, números de cartões por categoria, layout responsivo e botão para limpar. Engenharia Civil reúne seus subgrupos canônicos e legados; Matemática agrupa Matemática Financeira e Estatística; Legislação reúne a base geral e Ijuí; Português e Informática têm filtros próprios. Os 13 assuntos gerais continuam sendo a classificação editorial V128 e o assunto/subassunto específico continuam sendo os dados originais de cada cartão. Busca exata por ID e atalhos do estudo continuam disponíveis.

Implementação: `v152.html` usa `assets/v152_flash_filters.js`, com adaptação somente do predicado de exibição da biblioteca no HTML montado. A classificação foi auditada contra 1.504 cartões ativos públicos+operacionais (1.482 + 22) sem grupos não classificados. Foram realizados testes estáticos do bootstrap (50.253 caracteres montados, sem erros de sintaxe) e testes simulados de filtros encadeados, busca por ID e limpeza. **Navegador autenticado real não homologado.** Todos os cartões, dados de SRS, histórico, PDFs V002, Redação e grifos estão intactos. 78 PDFs ativos.

---

# Banco Mestre — V151: correção da verificação de PDFs (12/11/2026)

A mensagem “Catálogo disponível, mas os PDFs ainda não foram exibidos. Atualize a página.” era emitida pelo verificador V145 porque ainda exigia 79 documentos da configuração V140. O site vigente V150 usa o catálogo `assets/pdf_catalog_v149.json`, que contém **78 PDFs** — incluindo o manuscrito completo atual V002 com 274 páginas e 34 capítulos atualizados.

Foi criado `assets/v151_pdf_check.js` e publicado `v151.html` para conferir o catálogo vigente, os 34 capítulos V002, IDs únicos e a montagem das linhas na biblioteca. O botão **Verificar PDFs** solicita a montagem da lista sem exigir recarregamento. O código legado V145 está preservado, mas não é carregado pelo portal V151. O catálogo V149, o leitor do Drive V147, a sincronização V150, os PDFs, grifos, cartões, SRS e Redação não foram alterados. **Testes estáticos passaram; abertura autenticada em navegador privado ainda não foi homologada.**

---

# Banco Mestre — V150: usar somente a versão atual do manuscrito (12/11/2026)

**Ativa:** manuscrito de Engenharia Civil V002, 274 páginas, PDF integral e 34 capítulos por assunto. Biblioteca V149/V150: 78 PDFs ativos (os 34 capítulos de 252 páginas e o caderno de outubro foram removidos apenas da listagem, sem exclusão física nem alteração de grifos).

**V150 corrige também a sincronização recursiva:** o novo módulo `assets/v150_drive_pdf_sync.js` exclui da exibição 36 IDs antigos conhecidos e arquivos do caderno geral datados de 22/10/2026, mesmo após o botão Sincronizar todos os PDFs. O código original V130 e as fontes históricas permanecem intactos. Essa filtragem atua sobre a lista do site, sem apagar nada do Drive. A autenticação em navegador real ainda deve ser verificada na sessão do usuário.

**Arquivos ativos:** `v150.html`, `assets/pdf_catalog_v149.json`, `assets/pdf_grupos_v149.json`, `assets/v149_pdfs_recolhidos.js`, `assets/v150_drive_pdf_sync.js`, `assets/version.json`. ID do PDF-mestre mantido para preservar vínculos históricos de grifos. Demais PDFs não relacionados, flashcards, SRS, Redação e leitores preservados.

---

# Banco Mestre — V148: manuscrito de Engenharia Civil atualizado em 34 capítulos (12/11/2026)

Publicada a versão V148, com a **versão V002 do manuscrito de 274 páginas** distribuída em **34 PDFs por assunto**, em nova pasta versionada do Google Drive. O índice original de 252 páginas não é reutilizado: as faixas foram remapeadas e todas as 274 páginas foram verificadas sem perda ou repetição. O PDF completo permanece no mesmo ID de Drive e foi atualizado para 274 páginas no catálogo.

O catálogo V148 contém **113 PDFs** (79 registros anteriores preservados + 34 novos capítulos), e o novo índice de grupos foi expandido de modo correspondente. Os capítulos V002 usam IDs próprios `CAP-V002-01` a `CAP-V002-34` para **não aplicar automaticamente grifos dos PDFs anteriores a páginas deslocadas**. Os PDFs históricos, seus IDs, notas, grifos, SRS, 1.499 cartões, redação e leitor V147 foram preservados. As anotações manuscritas não passaram por OCR nem validação técnica/normativa. Abertura de PDF privado com OAuth em navegador real não foi homologada nesta mudança.

Arquivos principais: `v148.html`, `assets/pdf_catalog_v148.json`, `assets/pdf_grupos_v148.json`, `assets/v148_pdfs_recolhidos.js`, `assets/manuscrito_indice_v148.json`, `assets/version.json`. A fonte principal continua no Drive; as versões anteriores permanecem acessíveis.

---

# Banco Mestre — V147: diagnóstico e recuperação da abertura de PDFs no Drive

O erro “Não foi possível abrir a edição direta: Failed to fetch” vinha de `assets/v048_drive.js`, no `fetch()` autorizado de `https://www.googleapis.com/drive/v3/files/{id}?alt=media`. Trata-se de ausência de resposta HTTP, sem prova de falta de permissão ou de PDF inválido.

A V147 preserva a V048 e usa uma cópia isolada `assets/v147_drive_direct.js`, carregada somente pelo portal `v147.html`. Em erro de transporte na primeira URL, tenta `https://content.googleapis.com/drive/v3/files/{id}?alt=media&supportsAllDrives=true`. Diferencia HTTP 401, 403, 404, indisponibilidade temporária e rede/CORS/extensão. Só renderiza bytes com cabeçalho PDF; mostra **Abrir cópia local do PDF** após falha para vincular a mesma identidade e grifos armazenados. O fallback é local, não envia arquivos nem altera a pasta do Google Drive. O usuário pode continuar a usar **Abrir no Drive**.

Os 79 registros, file_id, grifos, notas, SRS, Banco Mestre V024 e Redação V146 continuam intactos. Testes de edição/OAuth com arquivos privados no navegador da pessoa ainda não foram executados: publicação de código não comprova sucesso do download. Antes de novo diagnóstico, verificar a situação e a requisição de rede na sessão autenticada.

# Banco Mestre — V146: dicas compactas e auditoria do encadeamento da Redação

A Produção guiada mantém as três etapas FTTD/TEEC, mas oculta o mini-mapa decorativo com quatro caixas e apresenta um único ícone 💡 ao lado de **Dicas e modelos desta etapa**, em resumo acessível recolhível. Alteração CSS isolada em `assets/v146_redacao_compact.css`, carregada somente por `redacao_temas_treino_v146.html`, sem alteração das respostas, editor, abas Temas/Treino, salvamento V145, fontes, PDFs, SRS ou grifos. A V145 permanece intacta.

**Auditoria funcional:** `treinoProxNivel()` chama `salvarRespostasNivel()`, mantém os valores no objeto `treinoRespostas` e renderiza os campos da próxima etapa, mas não gera, reescreve nem cola automaticamente os textos anteriores. `montarRascunho()` apenas exibe a síntese de respostas; `treinoAvaliar()` avalia os campos da etapa ativa. Melhorias propostas e não implementadas nesta versão: referência lateral dos eixos/TEEC, rascunho composto não destrutivo, comparação de reescritas e validação transversal de tese→argumentos→conclusão. Teste visual em navegador real ainda recomendado.

# Banco Mestre — V144: conferência de compatibilidade da consulta da Redação

Pequeno reparo após auditoria da V143: quando `treinoBuscarContexto` é invocada sem receber um botão explícito, o seletor CSS de fallback passa a ser válido. Isso mantém também o comportamento dos botões legados que não utilizam o novo painel. Os módulos `v143_producao_base.js`, `v143_janelas_redacao.js` e `v143_janelas_redacao.css` permanecem intactos; a Redação V144 carrega exatamente esses mesmos módulos com o reparo no HTML, e o portal V144 redireciona à nova página. Calendário V141, PDFs V140, SRS, Drive/Vade/Grifos não modificados. A publicação via GitHub Pages não substitui homologação visual no navegador.

# Banco Mestre — V143: consulta de notícias e argumentos sem perder o texto

A oficina de Redação continua com somente Temas e Treino e o visual aprovado. Antes, `v138_producao_guiada.js` movia os cinco painéis (brainstorm, eixos, notícias, salvos e sync) para cima dos campos e ainda rolava a página ao abrir. Agora uma cópia versionada do arranjo V138 (`assets/v143_producao_base.js`) suprime scroll automático quando o painel já está em uma área de consulta. `assets/v143_janelas_redacao.js/css` move **os mesmos nós originais** para uma janela lateral no desktop, com editor ainda visível à esquerda; para telas até 1099 px, a consulta ocupa a janela e traz botão fixo **Voltar a escrever**. A ferramenta recorda ID, seleção do cursor e foca o campo correspondente ao fechar; trocar painéis no menu não reabre nem apaga o rascunho. Contexto gerado carrega dentro da consulta, com aviso claro de que manchetes são fictícias e dados requerem confirmação; geração pode exigir a chave de IA já utilizada. Os cliques que aplicam eixos guardam os campos atuais em memória antes de atualizar o formulário. Nenhuma chave `treino_*`, eventos SRS, banco de cartões, catálogo de 79 PDFs, Drive/Vade/Grifos ou calendário foi alterada; versões anteriores arquivadas. QA sintático confirmado, validação visual real depende de navegador.

# Banco Mestre — V142: correção abrangente da legibilidade da Redação

A V139 aplicou regras detalhadas apenas ao núcleo da Produção guiada. Nesta edição foi identificado que Temas e muitos tipos de Exercícios de Redação ainda geravam texto novo com `font-size` de 9–12 px e cores originárias da interface escura. A folha **`assets/v142_redacao_contraste.css`**, carregada por último em `redacao_temas_treino_v142.html`, amplia etiquetas de temas, metadados, filtros, barra de exercício, enunciados, opções, mensagens de feedback, fórmulas TEEC, guias FTTD e conectivos; reaplica contrastes acessíveis inclusive nos nós criados pelos scripts legados, mantendo estilos semânticos dos acertos/erros. Controles A−/A+ existentes continuam e passam a atuar também sobre a maior parte destes textos. Não houve alteração nos scripts de estudo nem no armazenamento `pe_stats` e `treino_*`. O portal V142 preserva a V141 Calendário SRS de 60 min, PDF 79, Drive/Vade/Grifos, e a página V139 continua arquivada. JS estático validado; falta QA visual com navegador real Android.

# Banco Mestre — V141: calendário SRS com teto de uma hora por dia

A aba **Calendário SRS** fornece tabela de 14 dias por página em horizonte de 180 dias, com data, cartões vencidos, quantidade a revisar, tempo estimado, tempo livre, IDs e botão abrir cartão. Tempo padrão 2 min/cartão (até 30 no dia); 1,5/3/4 min configuráveis, sempre no teto de 60 min. Prioridade Errei→Difícil→Bom→Fácil; revisões previstas em data futura não são antecipadas. Fonte: 21 datas auditadas F17/V015 no repositório, rotuladas como históricas; cartões sem evento conhecido não são considerados vencidos. Importação CSV/JSON por ID/data/avaliação armazena dados exclusivamente no navegador sob `BM141_CALENDAR_IMPORT_V1`; nunca altera SRS nem avaliações. Opcionalmente preencher tempo ocioso com cartões novos, identificados sem data. Exporta CSV da agenda. Preserva integralmente o catálogo PDF V140 com 79 documentos, Redação V139, cartões, mídias, Vade/Drive/grifos. Sem teste Android/OAuth visual no navegador do usuário.

# Banco Mestre — V139: ajuste fino de legibilidade na Produção guiada

Mantido o layout da V138 aprovado pelo usuário: editor à esquerda, painel de tema/ferramentas à direita, três níveis FTTD/TEEC, ações de salvar/avaliar/navegar, dicas recolhíveis e exercícios dentro do Treino. Novidade: folha CSS independente `assets/v139_producao_legivel.css` aplicada por último especificamente à aba Produção guiada (`#aba-treino`), corrigindo letras herdadas de 8–11 px para 13–16 px e fundos/paleta com contraste, sobretudo no mini-mapa, guia FTTD, modelo TEEC, fórmulas e porcentagens, sugestões, resumo acumulado e painéis de apoio. Não altera scripts da redação nem a lógica de temas/cartões/armazenamento; todo HTML V138 preservado na V138; arquivos V139 adicionam somente o CSS e o direcionamento para a nova página. Parâmetros SRS, IDs, PDFs, Drive, Vade, grifos e Firebase legado não mudam. Pendente QA visual em navegador Android real.

# Banco Mestre — V138: Produção guiada em fluxo de estudo

A produção FTTD/TEEC deixa de exibir tema, ferramentas, orientações e respostas em um bloco contínuo. Layout principal 2 colunas: editor de redação (esquerda) e painel de tema/ferramentas (direita); celular empilha painel e editor. Barra com 3 etapas, status de preenchimento, estrutura dos quatro parágrafos, dicas recolhíveis, rótulos acessíveis, botões de salvar, avaliar com IA, etapa anterior e próxima. Recursos originais (escolher ou sortear tema, brainstorming, eixos, contexto, progressos salvos, sincronização legada com autorização, guia FTTD, chat de IA e construção acumulada) apenas mudaram de lugar; não foram excluídos. Em cópia versionada do HTML foi adicionada a função `treinoVoltarNivel()` e o seletor de Avaliar foi corrigido para o botão específico (antes pegava Salvar código do painel de sincronização). Conteúdos e storage de redação, `pe_stats`, banco mestre, SRS, PDFs e grifos intactos; versões antigas preservadas. QA estático de HTML/JS e implantação GitHub; ainda não equivale a teste visual Android real.

# Banco Mestre — V137: conferência visual dos exercícios de Redação

Correção de apresentação sobre V136: o primeiro painel de Exercícios estava fora do contêiner lateral, pois o cabeçalho inserido anteriormente também era `div`; a camada V137 o reposiciona por classe `.card`, sem recriar o painel nem os filtros. Os botões de gabarito recuperam indicação verde de acerto, vermelha de erro, e conferência ativa/disabled, sem interferir na lógica de registro. Mantidos o design claro e de alto contraste da V136, as abas Temas e Treino, o controle de fonte A−/A+, todos os exercícios, o progresso local e recursos PDF/Drive/Vade/SRS. A implantação é testada no GitHub Actions; navegação Android real/OAuth não homologadas.

# Banco Mestre — V136: contraste e legibilidade da Redação

A pedido do estudante, a página inteira de Redação foi reformulada em estilo de leitura próximo ao de plataformas de questões: fundo cinza-claro, cartões brancos, texto grafite, barra de navegação azul, ações principais em verde, hierarquia nítida entre título, rótulos, enunciado e resposta. O CSS V136 é carregado por último para neutralizar cores e letras pequenas remanescentes do treinador antigo (inclusive orientações TEEC e dicas de tamanho 9–11 px). Foram mantidas somente as abas Temas e Treino; Exercícios de Redação segue como modalidade de Treino. No desktop: painel lateral de filtros do catálogo e painel de controles dos exercícios, ambos com conteúdo principal amplo; no celular, layout empilhado. Controle A−/Padrão/A+ na barra superior com preferência local isolada `bm136_readable_font`. Não modifica fonte dos textos, critérios, gabaritos, registros de treino, `pe_stats`, Firebase legado, cards/SRS, PDF/Drive, Vade ou grifos; páginas V135 e anteriores preservadas. Publicação de código e testes estáticos não substituem homologação visual Android nem autenticação OAuth.

# Banco Mestre — V135, Redação em tela inteira

Ao clicar na navegação principal **Redação**, o portal abre `redacao_temas_treino_v135.html` na mesma guia, **sem iframe** e usando a largura total da página, com retorno claro ao Banco Mestre. Links históricos `#redacao` também conduzem à oficina. Navegação da oficina permanece apenas **Temas** e **Treino**; os antigos flashcards da redação continuam no modo **Exercícios de Redação** dentro do Treino. Layout refinado para monitor e celular, lista em 3/2/1 colunas, cartões com ação treinar, formulário com campos e grupos de ações, método FTTD acessível, sem perder histórico local. Arquivos V134 e anteriores preservados; dados, chaves, 1499 cartões/1482 ativos, PDFs V131 (72 estáticos), Vade, Drive e SRS intocados. Firebase legado segue opt-in por sessão. Verificação de build/JS não substitui teste de navegador Android/OAuth.

# Banco Mestre — V134: formatação Temas e Treino

A Redação do site apresenta somente **Temas** e **Treino**. O portal removeu visualmente abas antigas redundantes (sem apagar conteúdo ou histórico) e exibe o treinador com cabeçalho compacto. No catálogo, pesquisa, filtros de categorias, cartões responsivos, escolha via teclado e exibição incremental de 24 temas; no Treino, três etapas de desenvolvimento, campos de escrita mais claros, guia FTTD recolhível e contador de palavras; Exercícios de Redação são um modo interno do Treino com filtros em seção separada. Metodologia, banco de temas, exercícios e respostas antigos permanecem os mesmos, assim como PDFs, SRS, Drive, Vade e grifos. Firebase legado permanece dependente de autorização por sessão. Código antigo arquivado em V133. Testes estáticos de JS/HTML executados; teste de navegador Android/OAuth não homologado.

# Banco Mestre — V133, Temas + Treino + Exercícios de Redação

A oficina de redação V132 foi refinada para expor **somente Temas e Treino** como abas da ferramenta original; a antiga aba **Flashcards de Redação** foi renomeada para **Exercícios de Redação** e incorporada como modo interno de Treino, ao lado da Produção guiada FTTD/TEEC. Foram preservados os sete modos de questão (identificação, lacunas, ordenar, classificar, corrigir erros, produção curta, mapa mental), filtros, estatísticas e a chave local de progresso `pe_stats`. Clicar em um tema agora abre o Treino, com confirmação se um exercício atual contiver texto. Banco de temas, planejamentos, níveis, conteúdos, prompts e salvamento legado permanecem; demais abas antigas não são exibidas mas o código histórico não foi apagado. O portal principal apresenta **Redação · Temas e Treino**, **Discursivas**, **Histórico**, ocultando as duas áreas redundantes V130 sem remover os seus dados. Página isolada `redacao_temas_treino_v133.html`; página V132 e versões anteriores mantidas. A integração não altera cards/SRS, grifos, Drive, leitor Vade ou sincronizador PDF V131. Serviço externo Firebase original continua desligado por padrão. Resta validar visualmente em navegador Android real.

# Banco Mestre — V132, restauração da oficina completa de Redação
Código-fonte legado: `main/redacao.html` (SHA c3a446af5b7e09491faf472351905ebeb7d1e7bc). A aba Redação e Discursivas oferece primeiro a Oficina completa em iframe isolado (`redacao_completa_v132.html`, visual claro), com as dez funções FTTD, Argumentação, Raio-X, Cirurgia, Checklist, Temas, Treino guiado, Tutor IA, Flashcards de redação e Mapa mental, mais conectivos. Persistência antiga localStorage preservada no mesmo domínio; registros V130 de redação e discursivas preservados separadamente em abas próprias. Para abrir em tela inteira há link explícito. O legado usava Firebase próprio com código pessoal: o acesso é bloqueado até autorização por sessão e alerta de privacidade. Recursos IA continuam dependentes de chave pessoal Anthropic e não foram validados em serviço real. Os temas "Real BB/CEF" são rótulos históricos a conferir, não certificação da banca. Exercícios de redação não mexem nos cartões canônicos nem no SRS. PDF/Drive V131 permanece íntegro. Ainda é necessária auditoria visual/funcional em navegador Android autenticado.

# Banco Mestre — V131, sincronização geral dos PDFs

Nova versão que preserva Redação/Discursivas V130, Vade Mecum V129, filtros V128, flashcards, SRS e grifos. O botão **Sincronizar todos os PDFs** foi reformulado: consulta recursivamente pastas e subpastas dos dois repositórios de concurso no Google Drive, incluindo acervos extras de NRs e licenciamento. Reconhece novos PDFs por ID ao clicar, evita duplicatas e mantém os 72 PDFs canônicos; novos arquivos aparecem na lista autenticada da sessão. Não publica bytes privados no GitHub nem escreve nos PDFs. Em nova sessão, a consulta pode exigir autorização OAuth novamente. A leitura dos PDFs sincronizados usa o arquivo atual do Drive, evitando a cópia local antiga. Teste funcional simulado: segundo clique identificou 1 PDF novo após a inclusão e preservou os existentes. Navegador Android/OAuth real não homologados.

# Banco Mestre — V130, Redação e Discursivas

Nova aba integrada ao portal V129, preservando a V129 e versões anteriores. Recuperado o método FTTD do arquivo histórico `main/redacao.html`; adicionados modo Redação, modo Discursivas, checklist, histórico local com versões imutáveis, importação/exportação JSON e prompt para correção no ChatGPT. Não há nota de IA no site, nem sincronização automática com Drive ou SRS. Chaves locais: `BM130_ESCRITA_V1`, `BM130_RASCUNHOS_V1`. Requer validação visual em navegador real.

# Banco Mestre — versão atual e política de alterações

**Registro conferido em 11/11/2026.**

- **Site configurado para publicação:** V131 (11/11/2026; PDFs sincronizados em todo o acervo, Redação V130 preservada).
- **Branch de publicação:** `gh-pages` (**não** `main`).
- **Arquivo de entrada:** `gh-pages/index.html`.
- **Fonte de verdade da versão em execução:** `gh-pages/assets/version.json` — conferir os campos `version` e `home` **em toda nova solicitação**.
- **Arquivo HTML correspondente na última conferência:** `gh-pages/v131.html`.
- **Versão anterior preservada:** `gh-pages/v130.html` (Redação e Discursivas). V129, V128 e demais páginas históricas continuam preservadas.
- **Branch `main`:** contém código legado, cujo `assets/version.json` indica V031. **Não utilizar a versão da branch `main` para identificar a versão publicada.**

**Navegação e auditoria de versões:** [Mapa de governança Drive/GitHub](docs/GOVERNANCA_VERSOES_DRIVE_GITHUB_2026-11-11.md). Nota: o texto abaixo contém marcos *históricos*; não interpretar seções V113/V124 como declaração da versão em execução.

## V129 — Vade Mecum no Drive com sincronização manual (11/11/2026)

- O Vade Mecum de estudo (3ª edição do Senado, legislação até janeiro de 2026, com grifos e negritos e sem comentários) foi gravado **no mesmo ID** do arquivo principal no Drive: `1Bl5q1QE-HKk_G3JSfcP2qQWdnFhckzHI`, conservando o endereço existente. Backup anterior: `1JpnoON_KQxhxF0QIFSFcn4AJNcjJOFmr`.
- O portal V128 carregava `assets/v041_vade.js` (21 partes do GitHub) antes de `assets/v044_vade_drive.js`; ambos usavam o mesmo identificador de painel, impedindo a execução da fonte Drive. A V129 troca **na montagem da página** V041 pelo novo módulo `assets/v127_vade_drive.js` e remove o duplicado V044, sem editar o leitor PDF canônico.
- Botões **Abrir Vade Mecum (Drive)**, **Sincronizar Vade do Drive** e link direto para a versão atual. A sincronização usa OAuth Drive somente após consentimento do usuário, exige a leitura atual do arquivo (não usa cache IndexedDB nem partes GitHub), confere hash SHA-256 e salva uma nova cópia no IndexedDB sob ID de estudo estável `VADE-SENADO-2026-GUIA`. Os grifos por página continuam associados àquele ID; exportar backup é recomendado.
- Permanecem 1.499 cartões canônicos, 1.482 ativos, 72 PDFs do catálogo geral, 270 imagens, cartões de Ijuí separados, recursos V128 de assuntos gerais e SRS sem reprocessamento.
- Verificação estática de 15 propriedades de carregamento, fonte, hash e preservação de módulos. **Autorização OAuth real e renderização no navegador Android ainda não homologadas.** Se o Google exigir consentimento, usar o botão de conexão no editor do PDF.

## V124 — remissões jurídicas conservadoras (11/11/2026)

A partir da V123 publicada (cartões da Base Técnica), o portal passa a adicionar `assets/v124_remissoes.js` depois do módulo normativo V121 e antes do grifador. Referência explícita a Constituição Federal ou lei reconhecida fica ligada à norma citada; referência à “desta Lei”, “desta Constituição” ou artigo sem identificação confirmada fica com `target:null` e sugestão separada. Não muda cores, grifos existentes, anotações, IDs, planilha, SRS, PDFs ou cartões.

Testes: V114, V121, `tests/v124_remissoes.cjs`, `tests/v124_corpus_referencias_oficiais.cjs` (20 trechos de fontes oficiais + 32 adversariais) e `tests/v124_integridade_portal.cjs` (HTML V123 preservado). Os 52 cenários são de desenvolvimento e **não** aferem taxa de acerto em leis inéditas. A validação de vigência por edição/hash do PDF, a homologação móvel/OAuth e o corpus BIO maior permanecem pendentes.


## V121 — IA jurídica estrutural (11/11/2026)

Acrescenta `assets/v121_relacoes_normativas.js` e calibrador V121 à interface V120, preservando a base de 1.499 cartões, agrupamento de grifos por parágrafo e todos os dados/SRS. Testes `tests/v121_relacoes_normativas.cjs` e `tests/v121_integridade_portal.cjs`; homologação visual/OAuth ainda pendentes.

## V109 — integração privada dos cartões aprovados (11/11/2026)

- Manifesto/entrada apontam para `v109.html` e preservam `v108.html`.
- Somente o módulo privado de cartões passa de `assets/v093_drive_cards_sync.js` (V022) para `assets/v109_drive_cards_sync.js` (V024 H14), sem divulgar os cartões no repositório.
- Controles esperados após OAuth da conta proprietária: 1.499 IDs, 1.482 ativos, 17 inativos; 175 reformulações H13 + 3 fusões H14; SRS prévio intocado.
- Módulos do grifador V108, o arquivo mestre de grifos, 72 PDFs, Atlas, dados locais e versões antigas permanecem intactos.
- A sincronização precisa ser conferida em navegador real com OAuth; publicação do código não comprova autorização nem atualização de cartões na sessão do usuário.

## V113 — Base Técnica V024 novamente ligada ao portal (11/11/2026)

- A V112 carregava o módulo de cartões `assets/v093_drive_cards_sync.js` (V022 antiga) apesar de indicar V024 no manifesto.
- A V113 preserva `v112.html` e seus recursos de grifos, leitor PDF, SRS, Atlas, 72 PDFs e imagens, trocando apenas o módulo de cartões para `assets/v109_drive_cards_sync.js`.
- Após conectar Google Drive na seção Flashcards, espera-se carregar V024 H14 com 1.499 IDs e 1.482 ativos, mantendo o calendário SRS e fazendo verificação a cada 120 segundos durante a sessão autorizada.
- Sem OAuth, permanece a base V015 pública (1.494 cartões), propositalmente não atualizada com conteúdo privado.
- A publicação de código não comprova teste OAuth no navegador do usuário.

## V062 — inclusão de dois PDFs “ORIGINAL” da CONAMA (10/11/2026)

- Catálogo V062: `assets/pdf_catalog_v062.json` com **65 PDFs**, mantendo os 63 anteriores e respectivos IDs.
- Duas entradas adicionais, distintas das apostilas TEC Concursos: `PETRO10-CONAMA-001-ORIGINAL` (texto da resolução CONAMA 001/1986, 5 páginas) e `PETRO10-CONAMA-237-ORIGINAL` (CONAMA 237/1997, 11 páginas).
- “ORIGINAL” significa cópia do texto da norma fornecida pelo estudante, **não** certificação de consolidação/vigência. Validar atos posteriores ao estudar lei seca.
- Arquivos no Drive: `1NXA2iF85ngyuY4dqQo5mcldbQgk12lpY` e `1qwRg_qaNa7Vin6yTZUIYeYeXjC35FJLj`.
- Editor de PDF V061 mantido sem mudanças; origem dos grifos é o próprio estudante; preservar anotações locais, IDs canônicos, SRS e apostilas já cadastradas.
- `v061.html` e `assets/pdf_catalog_v027.json` preservados como versão anterior. Nova página `v062.html` lê exclusivamente `assets/pdf_catalog_v062.json`.

## Procedimento obrigatório antes de editar o site

1. Consultar **explicitamente a branch `gh-pages`** e ler `assets/version.json` na mesma branch. Não depender de memória, histórico de chat, nome de arquivos ou branch padrão do conector.
2. Verificar se `index.html` remete à versão indicada no manifesto e se o arquivo `vNNN.html` existe em `gh-pages`.
3. Caso haja divergência, alteração simultânea ou versão diferente da registrada aqui, **interromper a edição**, investigar e reconciliar, sem sobrescrever o trabalho mais novo.
4. Modificar somente a versão atual conferida ou criar uma versão sucessora, preservando a versão anterior, conforme a solicitação do usuário. **Nunca modificar V031, V050 ou outra versão anterior por engano.**
5. Em mudanças exclusivamente visuais, manter scripts, conteúdos, dados, IDs dos cartões, PDFs, imagens, históricos, SRS e leitores sem alterações.
6. Após publicar a nova versão, atualizar `gh-pages/assets/version.json`, o redirecionamento de `gh-pages/index.html` e este documento; conferir as alterações e informar a versão publicada.
7. A referência deste documento é um **registro histórico**: a autoridade operacional é sempre o `version.json` da branch `gh-pages`, checado de novo antes de cada edição.

**Regra prioritária:** nunca assumir que a branch padrão `main` representa a versão online; nela o manifesto pode estar muitas versões atrás.

## Backup e etapa do grifador V061

- Código V060 preservado também na branch `backup/v060-before-text-selection-2026-11-10`, commit de origem `a4c6be8198f028b3ac5f35d0f8dcb70363d88f85`.
- V061 inicia o grifo por seleção textual PDF.js: seleção automática de palavras, menu de cor/nota/ID de cartão/desfazer; grifo livre anterior permanece.
- O armazenamento local de grifos `BM030_STROKES_PDF` continua compatível. Originais, flashcards, SRS, IDs, Drive, PDFs e V060 não foram modificados por essa etapa.
- O **backup GitHub não cobre localStorage nem IndexedDB do navegador**. Sincronização Drive, OCR, biblioteca de grifos e extensão Chrome ainda são etapas futuras.
- Consulte `gh-pages/PLANO_GRIFOS_2026_11_10.md` para as 21 decisões aprovadas e o escopo preciso.
- A sintaxe e os arquivos foram verificados; falta conferir interação visual em navegador com PDF real.

## V063 — Biblioteca de Grifos local, Etapa 2 (10/11/2026)

- A **V062 de 65 PDFs permanece intacta**, inclusive as duas resoluções CONAMA originais; a V063 usa seu HTML como base e injeta módulos independentes de navegação e Biblioteca de Grifos em tempo de execução (arquivo `v063.html`).
- Módulos novos: `assets/v062_biblioteca_grifos.js`, `assets/v062_biblioteca_grifos.css`, `assets/v063_grifos_navegacao.js`.
- Biblioteca: busca, filtros (disciplina, assunto, PDF, cor, tipo e favorito), categorias/notas locais; marcas V060 antigas são exibidas como marcações visuais, **sem reconhecimento automático de texto**.
- Exportação manual filtrada em TXT, Markdown, JSON e relatório imprimível; backup manual **integral dos registros de grifo** em localStorage prefixo `BM030_STROKES_PDF:` e metadados `BM062_GRIFOS_META`.
- Backup do código anterior: `backup/v062-before-grifos-v063-2026-11-10`, de origem `3f0824c48481a23fda70dac35db47943e8d14d08`.
- Segurança: nenhuma migração automática; backup **não inclui PDFs, IndexedDB, flashcards nem SRS**. Google Drive continua sem sincronização de grifos.
- **Validação:** sintaxe JS verificada; é necessário teste de uso com PDF real e inspeção visual. PDF V061/V062 e marcações originais não foram modificados.

## V064 — consistência das imagens excluídas e painel de grifos (10/11/2026)

- Publicação: `gh-pages/v064.html`; carregador usa `v062.html` imutável com 65 PDFs e injeta os módulos V063 e V064. Não altera versões anteriores.
- Código novo: `assets/v064_imagens_visibilidade.js`, `assets/v064_painel_grifos.js`, `assets/v064_painel_grifos.css`. Biblioteca V063 intacta.
- **Imagens excluídas:** nas páginas de assuntos, imagens com status `hidden` são ocultadas da grade, dos atalhos IMG e das contagens. Assuntos exclusivamente visuais sem imagens disponíveis não aparecem. O Atlas conserva a opção `Mostrar excluídos` para restauração, sem apagar os IDs, arquivos, marcações ou a classificação original.
- **Painel de grifos:** retrátil, redimensionável, ao lado do PDF editável. Mostra todas as marcações locais da versão/hash em uso por página; permite pesquisar texto/notas, clicar para navegar ao trecho e editar notas. Grifos visuais antigos são identificados como `texto não identificado`, sem OCR automático.
- Backup antes da etapa: `backup/v063-before-image-filter-and-pdf-panel-2026-11-10`, origem `4fb2ab187684e85a50a5d4acfe2314a5408ef60f`.
- Nenhuma limpeza de `localStorage` ou `IndexedDB`, migração automática, escrita em Drive, exclusão de mídia, criação de flashcard ou alteração SRS foi implementada.
- **Validação:** JavaScript e estrutura conferidos. Exige teste com imagens realmente excluídas e documento PDF real no navegador do usuário; não assumir validação visual definitiva.

## V065 — ajuste visual da janela Cartão rápido (10/11/2026)

- Corrigida a sobreposição entre o cabeçalho `bm-v047-card-header` e o botão flutuante de fechar PDF: `assets/v065_cartao_rapido_header.css` afasta a janela do topo, fixa o cabeçalho e mantém o × próprio da prévia acessível.
- Modificação somente visual; sem alterações aos flashcards/IDs/SRS, PDFs, grifos e controles funcionais.
- Backup anterior: `backup/v064-before-quick-card-header-fix-2026-11-10`.

## V066 — backup verificável e envio consentido de grifos ao Drive (10/11/2026)

- `v066.html` mantém o catálogo de 65 PDFs e todas as camadas V062–V065, adicionando `assets/v066_backup_drive_grifos.js` e `assets/v066_backup_drive_grifos.css`.
- Biblioteca de Grifos: botão **Preparar backup**, cálculo SHA-256 e tamanho dos dados, **Baixar JSON** e somente após confirmação explícita do usuário botão **Autorizar e enviar cópia ao Drive**.
- OAuth Google `drive.file` com token somente em memória; cria **novo arquivo privado** em `Meu Drive`, jamais sobrescreve um arquivo existente. Verifica ID, tamanho e metadados após upload; não repete automaticamente em caso de resultado ambíguo.
- A cópia inclui somente `BM030_STROKES_PDF:*` e `BM062_GRIFOS_META`; não inclui PDFs, dados IndexedDB, cartões nem SRS. A exportação pode ser guardada offline.
- **Não é sincronização bidirecional**, nem importação: não houve mescla/remoção de dados nem abertura de arquivos privados do usuário pelo assistente. A ferramenta GitHub não tem acesso ao navegador.
- Backup do código anterior: `backup/v065-before-drive-grifos-2026-11-10`.
- **Validação:** código JS, referências e estrutura checados. Teste real de autenticação, upload, interface e segurança depende de ação autorizada no navegador do usuário; não presumir que já foi realizado.

## V067 — diagnóstico funcional sem alterações de dados (10/11/2026)

- A **V066 foi preservada integralmente**. Backup de código: `backup/v066-before-diagnostics-2026-11-10` (branch de `gh-pages` criada antes da V067).
- Nova versão `v067.html`, com dois arquivos independentes: `assets/v067_diagnostico_local.js` e `assets/v067_diagnostico_local.css`.
- Na **Biblioteca de Grifos**, botão **Verificar agora** lista OK, problemas, alertas e verificações não executadas; botão **Copiar relatório sem dados privados** permite compartilhar somente status e totais agregados.
- No leitor de PDF, botão **Diagnóstico do leitor** permite conferir camada de seleção, identidade da fonte e sobreposição do cabeçalho Cartão rápido aos controles flutuantes quando a prévia está aberta.
- Confere manifesto, catálogo de **65 PDFs**, APIs do leitor/painel, backup, WebCrypto, leitura estrutural dos grifos em localStorage, âncoras e possíveis IDs duplicados, e imagens excluídas que eventualmente ainda apareçam na página de assunto carregada.
- **Privacidade e preservação:** nenhuma gravação em localStorage/IndexedDB nem upload ao Drive; a verificação de imagens usa `BancoMestreImagens.all()` apenas para leitura. O relatório não inclui texto de grifos, IDs de documentos ou tokens.
- **Não é substituto do teste real:** em páginas sem PDF aberto o diagnóstico marca testes como não executados; as operações de OAuth e upload **não são exercitadas**.
- Validação até agora: sintaxe e integração estática. Execução do diagnóstico sobre dados reais depende do clique do usuário no site.

## V068 — grifador avançado no PDF, inspirado no fluxo da Bússola Highlights (10/11/2026)

- Nova versão `v068.html`, publicada na `gh-pages`, preservando integralmente a V067 e o HTML-base V062 com **65 PDFs**.
- Backup do código antes do desenvolvimento: `backup/v067-before-complete-highlighter-2026-11-10` (não inclui armazenamento privado do navegador).
- Motor de PDF `assets/pdf_v068.js` (cópia evolutiva do V061): continua usando `BM030_STROKES_PDF` por documento, hash e página; salva texto, âncora com prefixo/sufixo, retângulos normalizados, cores, estilos, notas estruturadas, tags, favoritos, IDs e histórico incremental.
- Menu flutuante e seleção `assets/v068_grifador.js`: **grifo rápido** por seleção, alternância manual, paleta de seis cores semânticas com legendas personalizáveis, cor livre, sublinhado, sublinhado duplo (motor), tachado e ocultação visual com opção de mostrar; ajuste do trecho por nova seleção mantendo o mesmo ID; exclusão com desfazer imediato.
- O editor de notas inclui nota curta, disciplina, assunto, tags, IDs de cartões **já existentes**, explicação, dúvida, correção, macete, pegadinha, fundamento normativo, fonte e favorito. **Não cria flashcards nem altera SRS.**
- Atalhos padrão: Alt+Q marcador rápido e Alt+W painel; configurações locais, com rejeição dos conflitos de navegador mais comuns. Página com texto digital selecionável é necessária; PDF escaneado mantém grifo livre, sem OCR automático.
- Biblioteca `assets/v068_biblioteca_grifos.js` e painel `assets/v068_painel_grifos.js`: mostram notas estruturadas e tags, exportam metadados completos e possibilitam navegação/edição. `assets/v068_grifador.css` aplica visual suave, paleta compacta e notas em janela grande com identidade própria.
- Preservados: PDFs/Drive originais, dados existentes do localStorage/IndexedDB, imagens excluídas da exibição, cartões, SRS, V060–V067 e backup de código V067. **Não há migração automática de grifos antigos.**
- **Limites:** a funcionalidade opera no editor PDF do Banco Mestre, **não como extensão Chrome**. Google Drive V066 continua backup manual consentido; sincronização bidirecional, importação, OCR e conector ChatGPT permanecem pendentes.
- **Verificações feitas:** sintaxe dos novos módulos, integração no loader V068, renderização de estilos com canvas simulado, edição com mesma identidade/retângulos validados/histórico incremental em testes isolados. O teste de seleção, anotação, escala, OCR, OAuth e visual no navegador real continua pendente.

## V069 — estabilização do grifador de PDF (10/11/2026)

- Publicado `v069.html` como nova versão de `gh-pages`; V068 permanece intacta. Backup de código: `backup/v068-before-highlighter-stability-v069-2026-11-10`.
- Corrigida a temporização da seleção: o evento de página pronta é emitido **após** renderizar a página e vizinhas e liberar o estado `painting`, evitando tentar gravar quando o editor ainda está bloqueado.
- Emite `bm-pdf-storage-changed` somente após escrita bem-sucedida de `BM030_STROKES_PDF`; Biblioteca e painel agora escutam a gravação para atualizar as listas.
- **Desfazer exclusão protegido**: somente reverte a exclusão se o documento, hash, página e versão de mutação ainda forem os mesmos. Não desfaz sem querer uma edição posterior.
- **Seleção reversa corrigida**: prefixo e sufixo da âncora vêm dos limites do `Range`, independentemente do sentido do arraste. O sublinhado duplo ganhou botão na paleta.
- Ao trocar apenas o estilo do grifo, a cor anteriormente escolhida é preservada.
- Arquivos: `assets/pdf_v069.js`, `assets/v069_grifador.js`, `assets/v069_biblioteca_grifos.js`, `assets/v069_painel_grifos.js`.
- Preservados: catálogo de 65 PDFs, V068, grifos legados, cartões, IDs, SRS e imagens já excluídas da exibição. Não houve migração de dados ou gravação no Drive.
- **Validação:** sintaxe, integração estática e casos isolados de gravação/duplicação/edição/remoção; ainda pendem testes reais de PDF e interface.

## V070 — cores oficiais por palavra/trecho e proposta de nota (10/11/2026)

- **Quatro cores metodológicas vigentes:** amarelo = regra principal; verde = agente/autoridade/competência; rosa = exceção/ressalva; azul = condição/limitação/requisito/prazo. As seis legendas provisórias V068 não prevalecem; grifos antigos permanecem como estavam.
- O usuário seleciona palavras ou frases no PDF. Com a opção `Cores automáticas` ligada, um classificador **local e heurístico** tenta separar a seleção em trechos semanticamente distintos, atribui cores sugeridas e cria registros individuais com IDs e âncoras próprios.
- **Atomicidade:** os trechos de uma mesma seleção são salvos juntos em `BM030_STROKES_PDF`, com um único ponto para desfazer; qualquer falha invalida o lote e preserva o estado anterior.
- As marcações geram **propostas** de disciplina, assunto/subassunto e nota curta, inferidas de termos e título do PDF quando há evidência. São sinalizadas `classification_status: sugestao`, e só são confirmadas quando o usuário escolhe manualmente uma cor ou salva a revisão da nota.
- Classificações ambíguas mantêm estado não classificado e precisam de revisão. **Não há interpretação normativa por IA ou precisão garantida**.
- Biblioteca/painel indicam explicitamente `Sugestão não confirmada`, permitem revisão e exportam a distinção entre registro consolidado e proposta. Não são gerados flashcards automaticamente.
- Nova base `v070.html` com arquivos `assets/pdf_v070.js`, `assets/v070_classificador.js`, `assets/v070_grifador.js`, `assets/v070_biblioteca_grifos.js`, `assets/v070_painel_grifos.js` e `assets/v070_cores_metodologia.css`.
- Backup antes da implementação: `backup/v069-before-semantic-colors-2026-11-10`. Não contém dados privados do navegador.
- **Teste:** sintaxe e fluxo estático, casos de regra/autoridade/prazo/exceção e palavras isoladas, gravação atômica, IDs independentes, prevenção de duplicata e rollback simulado. Falta validar seleção real em PDF e zoom no navegador do usuário.

## V071 — atualização da metodologia de cores, com regra principal laranja (10/11/2026)

- A metodologia passa a ter **seis cores**: **vermelho** (`#FF8F96`) para proibições/vedações; **verde** (`#86DCAA`) para obrigações/deveres; **amarelo** (`#FFEA70`) para prazos/números; **azul** (`#89C7FF`) para exceções/ressalvas; **roxo** (`#CCA7FF`) para palavras-chave da banca; **laranja** (`#FFB86B`) para regra principal.
- A versão `v071.html` aponta para `assets/pdf_v071.js`, `assets/v071_classificador.js`, `assets/v071_grifador.js` e `assets/v071_cores.css`, mantendo Biblioteca e painel V070.
- O classificador separa sequências ou palavras isoladas conforme termos identificados, com marcadores coloridos e notas/assuntos sugeridos **não confirmados**. Ex.: "é vedado" vermelho, "deverá" verde, "em até 30 dias" amarelo, "exceto" azul, "exclusivamente" roxo, enunciado geral laranja.
- Cores antigas e registros já grifados **não são recoloridos ou migrados**. As categorias históricas `agente` e `condicao` ainda podem ser lidas e editadas na nova versão.
- O grifador permite escolher a cor diretamente, inclusive uma cor livre. A revisão das notas, cores e do assunto continua sob controle do usuário.
- Backup de código: `backup/v070-before-six-colors-2026-11-10`; não inclui grifos privados no navegador.
- **Validação:** sintaxe do JavaScript, integração dos arquivos e testes isolados de frases; seleção visual e persistência real ainda requerem teste no navegador com PDF aberto.

## V072 — identificação contextual de dispositivos normativos (10/11/2026)

- A `v072.html` preserva o HTML-base V062 e os **65 PDFs**, a paleta de seis cores V071 e os módulos de imagens excluídas/Cartão rápido/backup/diagnóstico.
- Novo classificador `assets/v072_contexto_normativo.js`, carregado **depois** do classificador V071 e **antes** do grifador. Acrescenta reconhecimento de `Art. 5º`, `Art.5º`, `§ 2º`, `§2º`, `parágrafo único`, `inciso IV`, `alínea a`, `Lei nº 14.133/2021` e NBRs.
- O amarelo mantém o significado **prazos e números**: referências normativas numéricas também são amarelas, porém recebem justificativa e nota sugerida de **referência normativa**, não de prazo.
- Diferencia expressões de proibição (`não poderá`, `é vedado`), obrigação (`deverá`), exceção/condição (`salvo`, `desde que`) e palavras absolutas de banca (`sempre`, `exclusivamente`). A propagação da cor encerra na vírgula, evitando colorir cláusulas independentes.
- `assets/pdf_v072.js` grava somente em **grifo novo** dois campos adicionais, `classification_confidence` e `classification_basis`. Biblioteca e painel, via `assets/v072_biblioteca_grifos.js` e `assets/v072_painel_grifos.js`, exibem motivo e confiança, sempre como **sugestão não confirmada**.
- CSS adicional `assets/v072_contexto_normativo.css` e testes de regressão em `tests/v072_classificacao_contextual.json`.
- **Validação:** 33/33 casos isolados, uma frase mista com cinco categorias, notas distintas de dispositivo e de prazo, sintaxe dos arquivos. **Pendente:** teste completo no navegador com PDF real, zoom, salvamento e reprodução da seleção.
- Backup de código V071: `backup/v071-before-contextual-legal-highlights-v072-2026-11-10`. Nenhum grifo pessoal, PDF, cartão, SRS ou status de imagem excluída foi migrado ou apagado.

## V073 — seleção PDF e histórico transacional (10/11/2026)

- Nova versão `v073.html`, preservando `v072.html` e o HTML-base V062 com **65 PDFs**.
- Backup do código V072: `backup/v072-before-selection-stability-v073-2026-11-10`; o backup GitHub não guarda grifos privados do navegador.
- Motor evolutivo `assets/pdf_v073.js`: evento `bm-pdf-render-start` avisa que uma troca de página ou zoom começou; desfazer/refazer restaura anotações e pilhas de histórico em qualquer falha de persistência; criações individuais/lotes, edições e exclusões restauram as pilhas anteriores se o localStorage falhar.
- Grifador `assets/v073_grifador.js`: ao iniciar renderização, remove seleção/âncora antiga; ao renderizar camada PDF.js, **anexa a camada antes de calcular medidas**, impede cliques até ficar pronta, remove versões obsoletas e só então permite marcar palavras; mantém seis cores e classificação contextual V072.
- Diagnóstico sob demanda `assets/v073_teste_grifador.js` + CSS: botão **Verificar grifos** no leitor PDF; confere se a camada selecionável está alinhada, marcações locais são legíveis, IDs e retângulos válidos e se existem grifos multilinha; orienta teste de zoom e reabertura sem alterar o documento.
- **Testes isolados:** 10 cenários de criação multilinha em lote, undo/redo, falhas simuladas de criação/edição/exclusão e recuperação das pilhas de histórico; sintaxe e integração checadas. **Ainda não é teste end-to-end real:** zoom, seleção com mouse, recuperação após reabrir e precisão visual dependem de execução no navegador do usuário.
- Preservados PDF/IDs/SRS e marcações históricas, incluindo exclusões de imagens. OCR, reancoragem assistida entre versões PDF, extensão Chrome e Drive bidirecional permanecem pendentes.

## V074 — um grifo por seleção, sem dividir em segmentos (10/11/2026)

- **Nova regra do usuário:** cada seleção inteira, de uma ou de várias linhas, cria **uma anotação, um ID e uma cor única**. A base de dados NÃO recebe um registro diferente por palavra ou sequência.
- O classificador ainda consegue examinar sinais de cores diferentes dentro do texto, mas essa análise serve apenas para decidir **se há uma cor única defensável**. Nunca chama `addTextHighlights` pelo grifador V074.
- **Cor manual tem prioridade absoluta.** Ao escolher um dos seis botões, grava o trecho inteiro com aquela cor; se o mesmo trecho já está marcado, atualiza a cor mantendo o ID e as notas existentes.
- Automático: um único sinal de categoria confiável aplica **uma cor sugerida para todo o trecho**; sinais conflitantes (ex.: obrigação + prazo) ou ausência de evidência deixam a seleção pendente no menu até escolha manual. Não usa silenciosamente a última cor.
- Notas e assuntos sugeridos continuam não confirmados até revisão. Mudança de cor pelo usuário confirma somente a cor, não a nota/assunto.
- Mantém as seis cores: vermelho `#FF8F96`, verde `#86DCAA`, amarelo `#FFEA70`, azul `#89C7FF`, roxo `#CCA7FF`, laranja `#FFB86B`.
- Arquivos: `assets/pdf_v074.js`, `assets/v074_analise_selecao.js`, `assets/v074_grifador.js`, `assets/v074_grifo_unico.css`; HTML `v074.html`; regressão `tests/v074_selecao_unica_cores.json`.
- Backup anterior: `backup/v073-before-unified-highlights-v074-2026-11-10`. Todos os grifos segmentados *existentes* permanecem sem migração e sem mescla automática; nenhuma anotação é apagada ou recolorida.
- **Testes:** reconhecimento de cinco cores com gatilhos explícitos, bloqueio de seleção ambígua, criação única multilinha, prioridade da cor manual e alteração com ID preservado foram simulados e passaram. **Pendente:** teste no navegador do usuário com PDF real, reabertura, zoom e interface mobile.

## V075 — exatamente seis cores fixas na metodologia (10/11/2026)

- **Vermelho `#FF8F96`:** Proibições e vedações (é vedado, não poderá).
- **Verde `#86DCAA`:** Obrigações e deveres (deverá, compete).
- **Amarelo `#FFEA70`:** Prazos e números (em até 30 dias, 2 anos).
- **Azul `#89C7FF`:** Exceções e ressalvas (salvo, exceto, ressalvada).
- **Roxo `#CCA7FF`:** Palavras-chave da banca (exclusivamente, sempre, jamais).
- **Laranja `#FFB86B`:** Conteúdo importante a destacar, **escolhido manualmente**; substitui o significado de "regra principal" nas marcações NOVAS.
- Paleta do novo grifador tem somente essas seis cores: retirados o seletor de cor livre e a opção de alterar o significado das categorias. Configurações históricas de cores não são apagadas, apenas não alteram a nova paleta.
- Cores sugeridas continuam disponíveis para as cinco categorias objetivas. Seleção neutra ou ambígua solicita escolha manual; não é automaticamente destacada em laranja.
- Mantida V074: **uma seleção = um grifo, um ID e uma cor**, inclusive multilinha. Grifos antigos (inclusive `regra`, `agente`, `condicao` e cores personalizadas históricas) permanecem intactos.
- Arquivos novos: `assets/pdf_v075.js`, `assets/v075_seis_cores.js`, `assets/v075_analise_selecao.js`, `assets/v075_grifador.js`, `assets/v075_paleta_fixa.css`; página `v075.html`; testes `tests/v075_seis_cores_fixas.json`.
- Backup do código anterior: `backup/v074-before-fixed-six-colors-v075-2026-11-10`. Não equivale a backup de dados privados do navegador.
- Sintaxe, classificação, seleção ambígua e preservação das categorias legadas testadas isoladamente. Ainda falta validar a operação visual em PDF real no navegador.

## V076 — flashcards sincronizados com planilha privada do Google Drive (10/11/2026)

- Publicada a página `gh-pages/v076.html`, derivada da V075 **sem alterar o grifador, seis cores, 65 PDFs, imagens, SRS ou o armazenamento local**. Backup de código: `backup/v075-before-drive-sync-v076-2026-11-10`.
- Módulo independente `assets/v075_drive_cards_sync.js`: botão de consentimento Google OAuth `drive.readonly` na área Flashcards. Lê diretamente o arquivo XLSX privado no Drive, ID `1SA-PKBrlaovuNLFMPBx7BByH3BH0Tcsr` (aba `Cartoes_V015`) e valida 1.497 IDs, após autorização do titular. O XLSX e as respostas privadas NÃO são publicados no repositório.
- Atualização automática a cada 120 segundos **somente enquanto a página estiver aberta e o token OAuth estiver válido**. Fora dessas condições não há sincronização do lado do servidor. Alterações futuras devem ser gravadas no mesmo ID de arquivo no Drive; novas cópias requerem reconfiguração do ID. O sistema é de **consulta somente leitura**, não envia alterações do site de volta à planilha.
- Falhas de rede, autenticação ou leitura conservam os cartões já disponíveis e não alteram ID, SRS, PDFs, grifos ou respostas. Os 1.494 cartões V015 permanecem como fallback estático, acrescidos dos 22 Ijuí provisórios.
- Teste JavaScript, leitura/validação do XLSX e fluxo de autorização em navegador simulado passaram (1.497 cartões e IDs CARD-1495 a CARD-1497). **Autorização OAuth real no navegador do usuário e implantação visual ainda pendentes de confirmação**; não apresentar como teste real completo.
- Contrato metodológico: todos os cartões usam a estrutura de lei seca (frente concisa, verso exato e verificável, explicação/macete/fontes separados). Literalidade jurídica apenas para dispositivos legais; demais disciplinas exigem correção técnica e contexto. Cartões antigos preservados até auditoria de atualização. Metodologia oficial atualizada no Google Doc vigente, 10/11/2026.

## V077 — Catálogo completo de PDFs e sincronização por pastas privadas (10/11/2026)

- Manifesto `assets/version.json` e entrada do site apontam para `v077.html`, derivada da V076, sem substituir o grifador de seis cores V075 nem a sincronização de cartões. Branch backup `backup/v076-before-pdf-sync-v077-2026-11-10`.
- Catálogo `assets/pdf_catalog_v077.json` possui **72 PDFs**, preservando 65 anteriores e acrescentando seis PDFs NR fornecidos (01, 05, 06, 07, 17 e 18) e a Lei 15.190/2025 (30 páginas, Câmara dos Deputados). Todos os sete arquivos novos estão na pasta `06 – PDFs e Materiais` do Google Drive, em subpastas NRs e Licenciamento Ambiental. Os PDFs permanecem no Drive; apenas metadados/referências no GitHub. A vigência integral dos PDFs NR não foi revalidada para novembro/2026, e seus títulos identificam versão do arquivo fornecido.
- Índice `assets/pdf_grupos_v077.json` atribui **72/72 IDs** a um grupo de consulta. Corrige omissão de ambos os PDF originais CONAMA 001/1986 e 237/1997 no agrupamento anterior. `assets/v077_pdfs_recolhidos.js` mantém os grupos recolhidos por padrão e permite registros dinâmicos detectados no Drive.
- `assets/v077_drive_pdf_sync.js` acrescenta conexão Google OAuth `drive.readonly` somente mediante ação explícita do titular na aba PDFs. Após consentimento, lista PDFs existentes nas pastas do Drive identificadas por IDs `1_IgIlki_2ZlMmOaKmYuzhiMSjyLa-cnV` (NRs) e `18MsuWSayX7xpBhNmGjSvFmiiv1hF6YZk` (Licenciamento), deduplica IDs/nomes estáticos e revalida a cada **120 s** enquanto a página e o token estiverem ativos. Arquivos novos nessas pastas surgem somente na sessão autorizada, sem a necessidade de atualizar o GitHub. Novas pastas fora dessas duas NÃO são monitoradas. Não há serviço de sincronização em segundo plano nem publicação pública dos bytes.
- Falha de rede/autorização conserva catálogo/grifos/IDs SRS; imagens e flashcards intactos. `assets/v077_diagnostico_local.js` confere manifesto e 72 PDFs. A origem PDF no Drive não é modificada pelo site.
- Verificações: catálogo e grupos 72/72 sem IDs duplicados; arquivos originais de PDF presentes no Drive, permissões privadas verificadas em amostras NR-01/Lei 15.190; scripts estáticos e referências conferidos no GitHub. OAuth real e visualização PDF no navegador do titular **ainda precisam de teste em sessão autenticada**.


## V078 — comparação privada dos grifos sem restauração (10/11/2026)

- Nova publicação `v078.html` preserva a V077, seu catálogo de **72 PDFs**, grupos, pastas privadas no Drive, 6 cores, sincronização consentida de PDFs/cartões, SRS, IDs, imagens e grifos históricos.
- Integra os módulos isolados `assets/v078_pre_sync_grifos.js` e `assets/v078_pre_sync_grifos.css`. Aba Biblioteca de Grifos recebe o botão **Testar cores** (16 casos locais, somente leitura) e **Comparar backup Drive**.
- Comparação exige consentimento Google `drive.file` no navegador do titular; localiza o backup V066 acessível, confere tamanho e SHA-256 antes de ler, valida o esquema e confronta strings brutas por chave de página e metadados. Exibe totais iguais, exclusivos e divergentes. Diferença de formato/ordem em JSON pode ser sinalizada de modo conservador.
- **Proibida nesta etapa:** qualquer importação, restauração, sincronização bidirecional, mesclagem, escrita ou exclusão de grifos. Nada é enviado pela interface de comparação; a proteção da metodologia permanece.
- Testes automatizados: 23/23 casos de classificação V075, 16/16 do autoteste V078, além de simulação de dados iguais/divergentes e rejeição de backups com formato, chaves ou JSON incorretos. **Não houve teste OAuth real ou PDF real com anotações pessoais no navegador.**
- Backup anterior criado: `backup/v077-before-grifos-pre-sync-v078-2026-11-10`. Módulos V078 foram previamente desenvolvidos em branch separada, com documentação e PR #15.


## V079 — diagnóstico de versão e catálogo sem falsos alertas (10/11/2026)

- O módulo `assets/v079_diagnostico_local.js` substitui somente no loader V079 a referência a V077, preservando arquivos e versões anteriores.
- Em vez de exigir sempre `V077 / v077.html`, confere a correspondência entre `version`, `home` e página aberta. Em páginas históricas mostra aviso, não erro; manifesto inconsistente é problema.
- Contagem esperada de PDFs vem de `assets/version.json` com fallback 72. Catálogo e PDFs da V077 continuam sendo os **72 documentos atuais**. A V078 com autoteste das cores e comparação consentida de grifos segue preservada.
- Testes de lógica: **6/6 cenários aprovados**, sintaxe e manutenção de módulos V075/V077/V078 conferidas. Sem escrita de dados pelo diagnóstico. Falta validação no navegador real.
- Backup do código V078: `backup/v078-before-version-diagnostics-v079-2026-11-10`.


## V080 — correção da cor seletiva do grifador (10/11/2026)

- Teste reproduziu falha: quando PDF.js divide uma palavra entre dois ou mais spans (ex.: `ve` + `dado`), a classificação V075 tratava a seleção como indefinida mesmo que o usuário tivesse selecionado `É vedado`. **Correção:** `assets/v080_analise_selecao.js` classifica palavras a partir do texto integral selecionado, mantendo os retângulos originais e as âncoras sem migração.
- Em V075, modo manual com grifo rápido aplicava a última cor sem esperar escolha. **Correção:** `assets/v080_grifador.js` mostra o menu de seis cores antes de gravar; o automático continua colorindo diretamente quando há uma categoria inequívoca, e ambiguidades continuam pedindo escolha.
- CSS `assets/v080_grifador_cores.css` impede que botões com atributo `hidden` apareçam por estilo anterior e torna as cores selecionadas mais claras visualmente.
- Respeita **uma seleção → um grifo/ID/cor**; a cor manual prevalece. Laranja continua apenas manual. Grifos antigos, notas, IDs, SRS, 72 PDFs da V077, biblioteca, Drive, diagnóstico e todas as versões anteriores intactos.
- Backup de código: `backup/v079-before-selective-colors-fix-v080-2026-11-10`.
- Testes isolados de regressão 21/21 e de fragmentação/controle manual 10/10 passaram. **Pendente:** homologação no navegador com PDF real; não afirmar que a seleção física do usuário já foi testada.


## V081 — seleção multicolorida por parágrafo (10/11/2026)

- Pedido do usuário substitui a antiga regra **uma seleção/uma cor** no novo fluxo automático: **uma seleção gera vários trechos coloridos**, cada um com ID próprio, mas com **salvamento e Desfazer conjuntos**; o modo manual continua produzindo um único grifo.
- Novo planejador `assets/v081_multicor.js` reconhece proibições, obrigações, prazos/números, exceções e palavras da banca, preservando palavras completas e limites visuais do PDF. Laranja permanece **exclusivamente manual**. Não colore conteúdo neutro sem evidência.
- `assets/v081_grifador.js` integra seleção de texto em spans PDF.js com offsets/Ranges reais, mostra uma **prévia obrigatória** e botão `Aplicar trechos coloridos`, bloqueia sobreposição a marcações antigas. Limite conservador de 12 grifos por seleção. O usuário pode editar posteriormente cada grifo sem alterar os demais.
- `assets/pdf_v081.js` reexpõe a operação `addTextHighlights` já existente no núcleo, com **uma escrita em localStorage e um desfazer** para o lote; falhas restauram o estado anterior sem gravação parcial. Anotações antigas não sofrem migração.
- Arquivos independentes `assets/v081_multicor.css`, `tests/v081_multicor.json` e `docs/V081_GRIFOS_MULTICOR.md`. Versão V080 e backups preservados em `backup/v080-before-paragraph-multicolor-v081-2026-11-10`.
- **Testes concluídos:** classificação sintética 13/13, palavra fragmentada em spans, bloqueio de palavra parcial, atomicidade e rollback. **Ainda pendente:** homologação com PDF real, zoom e reabertura no Chrome/Android do titular; classificação local é heurística, não interpretação normativa confiável.


## V082 — testes com Vade Mecum real e correção de falsos grifos (10/11/2026)

- Auditoria com duas versões reais do **Vade Mecum Senado Federal 3ª edição** (809 páginas cada). Texto digital de ambas as versões coincide nas 809 páginas. PDFs originais privados no Google Drive, não migrados e sem qualquer escrita/alteração.
- Páginas verificadas: **17** (CF art. 19), **126** (CC art. 315), **137** (CC art. 584), **643** (ECA art. 185), **728** (Lei 14.133 art. 25) e **768** (LRF art. 38). Reconhecimento com os trechos extraídos do PDF: seis casos avaliados e aprovados após correção.
- Falha real 1: o planejador multicolorido V081 unia dois segmentos da mesma cor separados por muitas palavras sem categoria, criando grifo amarelo excessivo. `assets/v082_multicor.js` só une os segmentos quando existe **apenas espaço em branco** entre eles e a expressão anterior não termina em pontuação forte.
- Falha real 2: `Selection.toString()` insere quebra de linha virtual de elementos `<br>` em PDF.js; o `Range.toString()` não a inclui. `assets/v082_grifador.js` mapeia as palavras aos caracteres DOM mesmo nessa condição e **não salva automaticamente** se o alinhamento não é seguro.
- Falha real 3: o classificador não identificava `não será autorizada` como proibição. `assets/v082_contexto_normativo.js` acrescenta variantes de autorização e mantém as demais expressões normativas.
- Motor atômico de grifos `assets/pdf_v081.js`, seis cores fixas, laranja manual, 72 PDFs no catálogo, flashcards, SRS e Drive preservados.
- Backup anterior: `backup/v081-before-vade-test-fixes-v082-2026-11-10`. V081 também permanece disponível. **Pendente:** homologação do PDF real pelo leitor V082 em navegador Chrome/Android com conta do titular.


## V083 — auditoria do art. 1º da Constituição no Vade Mecum (10/11/2026)

- Art. 1º localizado na página 12 do PDF (índice de arquivo 11, primeira coluna); cópia original e a cópia “Banco Mestre Anotado” examinadas. O PDF anotado possui grifo amarelo já achatado no conteúdo, abrangendo caput e incisos I a V; original sem grifo. Ambas as páginas possuem zero anotações PDF editáveis detectáveis; não reescrever ou apagar PDF algum.
- Na V082 o classificador **não reconhecia** o numeral impresso `Art. 1o` e marcava `Parágrafo único` de amarelo, mesmo sem prazo/número. No texto normalizado, espalhava amarelo do número do artigo para palavras do caput.
- `assets/v083_contexto_normativo.js` corrige o reconhecimento do ordinal de artigo (`1o`/`1º`), interrompe propagação de `referencia_normativa` e remove a associação falsa de `Parágrafo único` à categoria numérica. Comportamento esperado: sugestão amarela só para `Art. 1o` como referência; **fundamentos e parágrafo único permanecem sem cor automática**.
- **Limitação importante:** o artigo tem fundamentos da República (conteúdo central) sem palavras-chave típicas de obrigação/proibição/exceção. A cor laranja permanece **manual**; não alegar que a V083 reconheça semanticamente os cinco fundamentos.
- Testes de regressão: texto literal da página 12, versão normalizada, `Parágrafo único` isolado, artigos com proibição/obrigação e `não será autorizada`; **6/6 aprovados**. Teste do leitor com o PDF real no Android do titular ainda pendente.
- Backup do código V082 em `backup/v082-before-article1-cf-v083-2026-11-10`; PDFs, biblioteca, grifos, IDs, SRS, Drive e catálogo de 72 documentos preservados.

## V084 — Atlas sincronizado com Google Drive (10/11/2026)

- Base publicada: `gh-pages/v084.html`, derivada da V083, preservando leitor PDF, classificador normativo V083, grifador V082, seis cores e 270 registros antigos. Backup `backup/v083-before-image-sync-v084-2026-11-10`.
- Nova pasta dedicada no Drive: `CONCURSOS – ENGENHARIA CIVIL/07 – Atlas de Imagens (sincronização)`; ID `1ksSVWrmRaRlDoG4iDtTGvfr2OnPnhnY6`. Está inicialmente vazia. Os arquivos em outras pastas e subpastas NÃO são acompanhados automaticamente.
- Módulo `assets/v084_drive_images_sync.js` apresenta uma seção dentro do Atlas com consentimento OAuth Google `drive.readonly`, busca só nessa pasta, atualiza a cada 120 s enquanto página/token válidos, exibe somente JPEG, PNG, WEBP e GIF de até 15 MB, e obtém os bytes com token somente na sessão via `Blob` e `URL.createObjectURL`. Nenhuma imagem privada é postada no GitHub nem salva no cache persistente do aplicativo.
- Identificador estável de novas imagens `DRIVE-IMG-<fileId>`; não cria ou altera `IMG-001..254` nem `IMG-P10-01..16`, não propaga a classificação temática sem auditoria. Os controles do Atlas antigo e a ordem dos scripts permanecem intactos.
- Abertura pelo editor visual `BancoMestreEditorV030.open` permite grifos salvos somente no navegador, separadamente por ID. Em falhas de conexão ou fim da autorização, a base estática permanece disponível; reconexão necessária. Não há atualização em segundo plano quando o site está fechado.
- Testados sintaxe JavaScript, preflight do manifesto e HTML, existência da pasta, identificador estável, preservação do Atlas e escopo de leitura do token. **Teste real OAuth e exibição das imagens na conta do titular pendentes**, pois a pasta está vazia e a autorização interativa só pode ocorrer no navegador.


## V085 — auditoria e ícones do editor PDF (10/11/2026)

- Auditoria da V084 identificou dezenas de botões com caracteres tipográficos minúsculos ou significado ambíguo em uma barra lateral de 116 px desktop / 83 px celular. O núcleo já tinha ações reais para navegação, zoom, desenho, grifo livre, seleção de texto, borracha, mover, notas, cartões, cobertura, desfazer/refazer e exportação.
- `assets/v085_pdf_toolbar.js`: ícones **SVG próprios do aplicativo**, sem fontes nem dependências externas; preserva **os elementos DOM e respectivos listeners/IDs**, adicionando rótulos claros, aria-label/title, foco por teclado, agrupamento visual, estado de ferramenta, modo de barra compacto/amplo, ajuda e atalhos Shift+S (texto), Shift+C (caneta), Shift+G (grifo livre), Shift+B (borracha) e Shift+H (mover). Conserva os atalhos originais Ctrl+Z/Y e o campo de página já existente V057 (não duplica).
- `assets/v085_pdf_toolbar.css`: layout de sidebar 202px/102px no desktop e 160px/102px no celular, cartões de ferramenta com alvos maiores, seleção visual, paleta acessível e respeito aos estados hidden/disabled. Somente editor PDF, sem alterar o editor de imagens.
- `assets/pdf_v085.js`: mantém PDF V081 completo, incluindo `addTextHighlights`; expõe **resetZoomV085()** e `zoomPercent`, reestabelecendo ajuste original (100%) sob solicitação; protege a ação **Limpar página** com cópia e rollback do histórico e marcas se `localStorage` falhar.
- A V084 **permanece preservada**, assim como a janela V084 experimental, Atlas, sincronização de imagens e arquivos privados, catálogo de 72 PDFs, biblioteca, grifos, IDs de cartões, SRS e versões anteriores. Backup do código em `backup/v084-before-pdf-editor-ux-v085-2026-11-10`. Testes com navegador real Chrome/Android ainda pendentes.

## V086 — Importação das 184 exclusões privadas do Atlas (10/11/2026)

- Fonte fornecida pelo titular: JSON `BancoMestreExcluirImagensDriveV046`, exatamente **184 IDs distintos IMG-###** entre 254 IDs antigos. Lista original preservada no Drive, arquivo privado `1PLYugdUTxtpDmoxOe56LtCG-a1cDKGej`. Dos 184 registros, 36 apontam para arquivos candidatos no Drive, **sem conferência de identidade**; 148 não têm vínculo. Não apagar nem mover arquivos do Drive com base nessa lista.
- Versão do site: `v086.html`, derivada de V085 e preservando por completo o leitor PDF V085, ferramentas do grifador, 72 PDFs, sincronização de cartões, sincronização de imagens V084, 270 imagens existentes e SRS. Branch de backup: `backup/v085-before-private-image-exclusions-v086-2026-11-10`.
- Script: `assets/v086_exclusoes_atlas_privadas.js`. Adiciona ao Atlas, após Google OAuth `drive.readonly`, leitura do JSON privado por ID, conferência de formato, contagem, unicidade e existência dos 184 IDs no catálogo. Permite **confirmar** a importação para o IndexedDB `BancoMestreImagensV023`, em transação atômica; gera backup prévio local `BM086_EXCLUSOES_BACKUP_V1` e oferece reversão das alterações do último lote, respeitando intervenções manuais posteriores.
- Aplicar a lista significa definir status `hidden` para os IDs selecionados **somente no navegador autorizado**. Não publica a lista em GitHub, não altera imagens originais no Drive e não muda grifos/SRS. Não há sincronização dessas exclusões em segundo plano entre navegadores; para aplicar em outro dispositivo é necessário conectar e confirmar novamente.
- Auditoria de origem: 184 IDs únicos, todos presentes no catálogo base de 254, nenhum IMG-P10. A identidade dos 36 links candidatos do Drive NÃO foi validada. Inspeção estática e sintaxe JavaScript validadas; **teste real OAuth e aplicação no navegador do usuário ainda pendentes**.


## V087 — seleção de grifo com classificação manual (10/11/2026)

- Nova metodologia solicitada: **seleção comum do trecho no PDF → escolha manual de uma das seis cores → assunto obrigatório, disciplina/subassunto opcionais → confirmação em Salvar grifo**.
- Todos os botões automáticos bloqueados. Não dividir o texto automaticamente nem abrir IA. Clicar na cor não grava grifo. A camada PDF.js mostra cursor de texto, e a seleção é temporariamente destacada em azul enquanto a paleta de classificação estiver aberta.
- `assets/v087_grifador.js`, `assets/v087_grifador.css` e `assets/pdf_v087.js` contêm as alterações; nenhum outro código histórico foi reescrito. O assunto também fica registrado no objeto `subject_suggestion` e no índice `BM062_GRIFOS_META`. Atualizar classificação de um grifo existente preserva ID e histórico com rollback.
- Integra a V086 **mais recente** (importação privada e reversível de exclusões do Atlas). Módulo `v086_exclusoes_atlas_privadas.js?v=086` permanece carregado; V086 inteira preservada e backup `backup/v086-before-simple-highlight-v087-2026-11-10` criado.
- Mantidos 72 PDFs, 270 imagens, todas as anotações anteriores, SRS, notas, flashcards, arquivos Drive, IDs e backups. Verificação real Chrome/Android permanece necessária.

## V088 — Sincronização da visibilidade das 184 imagens excluídas (10/11/2026)

- A exportação do usuário `BancoMestreExcluirImagensDriveV046` contém 184 IDs únicos de imagens IMG-###, todos auditados no catálogo de 254 imagens anteriores. O JSON original, com títulos, associações candidatas e informações de Drive, permanece PRIVADO em Google Drive ID `1PLYugdUTxtpDmoxOe56LtCG-a1cDKGej`.
- **V088** é cópia da V087, preservando todas as melhorias atuais do grifador de PDF, leitor, seis cores, 72 PDFs, 1.494 cartões públicos, sincronizações anteriores e SRS, assim como os 270 registros de imagens. Backup de código: `backup/v087-before-visibility-sync-v088-2026-11-10`.
- O módulo `assets/v087_atlas_visibilidade_global.js` foi injetado imediatamente após `assets/visibilidade-v026.js` no HTML montado. Aplica globalmente um **padrão reversível de 184 ocultas** por meio de `BancoMestreImagens.all()`; não escreve no IndexedDB por padrão, não altera a fonte canônica e não elimina thumbnails nem grifos. Os **70 IDs legados ativos** e os 16 IMG-P10 permanecem visíveis em navegador sem alterações individuais anteriores. A lista pública contém apenas os 70 IDs ativos; o JSON privado completo, nomes e vínculos Drive não são publicados.
- Estado `visible`/`hidden` EXPRESSAMENTE registrado no IndexedDB pelo usuário tem precedência sobre o padrão para permitir restaurar ou ocultar individualmente no navegador. Desfazer importação V086 não apaga a regra de site: ela é um padrão público; a restauração explícita de cada ID continua disponível.
- Esta operação é **sincronização pontual da seleção V046 com o site**, não sincronização contínua do estado local entre dispositivos e Google Drive. Exclusões posteriores feitas somente em um navegador não entram no padrão global até uma nova exportação/auditoria/publicação. Não apagar documentos do Drive a partir de 36 mapeamentos candidatos por nome, ainda não validados.
- Auditoria técnica: módulo avaliado em JavaScript simulando estados locais, resultando em 184 ocultas padrão, 183 após restaurar uma excluída, 184 após ocultar uma anteriormente ativa. Manifesto e loader V088 inspecionados; teste visual no navegador do titular ainda pendente.


## V089 — reparação do PDF, carregador e seleção por coluna (10/11/2026)

- **Falha fatal encontrada na V088:** a string `const atlasInit='<script src="..."></script>';` continha `</script>` literal dentro do script principal. O HTML encerra prematuramente o bloco, deixando código inválido. V089 substituiu a montagem por concatenação `'<scr'+'ipt ... </scr'+'ipt>'`, mantendo o texto final da tag exatamente igual. Teste de parsing de toda a página passou, com um único fechamento real de `<script>`.
- **Salto de palavras no Vade Mecum:** seleção nativa dos spans PDF.js em páginas com 3 colunas pode atravessar a ordem DOM/colunas. O novo motor `assets/v089_pdf_selection_core.js` trabalha com retângulos extraídos do `getTextContent()`, aplica `Util.transform()`, separa faixas de coluna por corredores verticais, ordena palavras por linhas e impede atravessar colunas. Geometria ambígua, sobreposição e seleções excessivas recusadas em vez de gravar dados incorretos.
- **Seleção:** clique/toque na palavra inicial e na palavra final (ou arraste com mouse). Prévia azul das palavras efetivamente escolhidas. Uma caixa pede a cor entre seis categorias e o Assunto; Disciplina e Subassunto opcionais. Nenhum clique de seleção ou cor grava automaticamente.
- **UX:** barra lateral 142px desktop/88px celular, Selecionar Texto, Mover, Zoom, Histórico e Salvar visíveis. Caneta, borracha, limpeza, grifo livre e exportações secundárias disponíveis em `Mais ferramentas`.
- **Preservação:** mantém PDF core V087 (inclusive original dos grifos), backend de sincronização e dados de cartões V018, cache-bust V018, 72 PDFs, 270 imagens, Atlas global, importação reversível das exclusões, IDs, SRS, notas e Drive. Backup `backup/v088-with-v018-before-precision-selector-v089-2026-11-10`.
- **Testes internos:** sintaxe e fechamento da página, detector de três colunas com variações de largura, falha segura em caso de sobreposição, interação simulada selecionar início/fim e salvar exatamente um grifo com assunto. **Teste real dentro do navegador do usuário ainda necessário.**

## V090 — editor PDF reconstruído em três etapas (10/11/2026)

**Etapa 1 — preservar seletor preciso V089:** arquivo `v089_pdf_selection_core.js` e a geometria de `v090_pdf_precise.js` seguem o mesmo algoritmo de coordenadas/colunas, sem voltar à seleção de spans nativos. Seis cores testadas com um registro/assunto por cor. O grifo automático continua desativado.

**Etapa 2 — edição unificada:** `assets/v090_pdf_precise.js` permite criar, escolher cor e assunto, registrar nota, editar sem trocar ID, excluir com confirmação e listar grifos. Fila de cores: selecionar trechos distintos, adicionar à fila, abrir fila pela barra superior e salvar em lote via `addTextHighlights` (uma operação de desfazer); protege contra sobreposições. `assets/pdf_v090.js` grava a nota já no registro original da criação.

**Etapa 3 — interface:** `v090_pdf_toolbar.js` e `v090_pdf_layout.css` substituem a barra lateral sobrecarregada por barra horizontal navegável e botões reais para seleção, mover, página, zoom, desfazer/refazer, biblioteca, exportar, Drive e Mais ferramentas. As ações chamam o núcleo original. O editor de imagem não é alterado.

**Preservação:** V089 continua disponível; backup `backup/v089-before-v090-editor-2026-11-10`. 72 PDFs, 270 imagens, cartões V018, Atlas, IDs, SRS, arquivos Drive e todas as anotações antigos preservados. Não fazer migração nem reclassificação automática.

**Limitação:** testes de módulos, seleção e simulação de interface concluídos; validação visual real no navegador do usuário ainda necessária.

## V091 — rolagem estável e edição do PDF (10/11/2026)

- **Falha corrigida:** V090 herdou a virtualização V048 com páginas vizinhas, captions como “Página 2 — role para ativar a edição” e `promoteByScroll()`. Rolagem contínua alternava `pageNo`, re-renderizava PDF e reinicializava o seletor, dando impressão de travamento. Em `assets/pdf_v091.js`, remover completamente `renderNeighbor()`, `promoteByScroll()` e qualquer `scroll` handler que inicie render. A leitura rola dentro da página atual, sem troca de página. Páginas anteriores/seguintes passam apenas por Anterior, Próxima e Ir. O zoom funciona como antes. As páginas vizinhas ficam ocultas.
- **Por que não editava no link V089:** `v089.html?utm_source=chatgpt.com#pdfs` abre uma versão anterior do site, não um PDF editável. Cada item tem prévia do Google Drive em `iframe` (somente leitura). O PDF deve ser aberto pelo botão **Editar PDF**, selecionando uma cópia autorizada local uma vez. Se já foi guardado via IndexedDB, **Continuar edição** reabre sem novo envio. Não inferir permissão para buscar arquivos privados via URL do Drive.
- **Proteção:** continuar usando seleção por coordenadas V089, editor manual V090, 72 PDFs, 270 imagens, base V018, IDs, SRS, grifos, notas, biblioteca e Drive. Não modificar V089/V090. Backup `backup/v090-before-stable-pdf-scroll-v091-2026-11-10`.
- **Limitação:** testes estáticos de ausência de render por scroll e pré-validação de loader não substituem navegação real com PDF do usuário.

## V092 — rollback isolado do editor ao primeiro grifador automático de 4 cores (V070, 10/11/2026)

- **Escopo exclusivo:** reverter a experiência de edição/classificação de grifos para o comportamento original de quatro cores e sugestões automáticas V070. Não reverter biblioteca, carregador dos dados, V089 de seleção, V091 de rolagem ou PDF core.
- **Código histórico:** reutiliza diretamente `assets/v070_classificador.js`, regras locais de `classifyWords`, `suggestSubject` e `suggestNote`. As cores exatas retornam: `regra=#ffe04d` (amarelo), `agente=#92e8c0` (verde), `excecao=#ffb3c5` (rosa), `condicao=#a6d7ff` (azul). Esse arquivo é carregado antes de `v092_editor_v070.js`.
- **Adaptação necessária:** `assets/v092_editor_v070.js` usa `BancoMestrePreciseCoreV089` e o mesmo mecanismo `pointerdown/move/up` de V089 para construir palavras/retângulos, sem voltar à camada nativa PDF.js de V070 que selecionava colunas incorretamente. O algoritmo histórico sugere a classificação por trechos depois da seleção, exibe prévia de cores e notas, e só grava ao pressionar **Aplicar as cores sugeridas**. Disponível também o grifo inteiro com escolha manual de uma das quatro cores. Modo automático habilitado inicialmente, podendo ser desligado na janela. Não chama IA externa nem usa chave.
- **Segurança:** cores e notas automáticas permanecem `classification_status='sugestao'`; salvar os segmentos é uma única operação via `addTextHighlights`, respeita grifos anteriores, permite Desfazer. Editar grifo anterior não altera ID nem atribui automaticamente uma nova cor, mesmo que ele tenha uma cor histórica de V091.
- **Arquivos preservados byte a byte:** `assets/v089_pdf_selection_core.js`, `assets/pdf_v091.js`, `assets/v090_pdf_toolbar.js`, dados SRS/Drive, 72 PDFs e 270 imagens. V091 permanece em `v091.html`; backup `backup/v091-before-v070-editor-rollback-2026-11-10`.
- **Testes:** em página sintética de três colunas, a mesma seleção precisa V089 produziu sete trechos classificados nas quatro cores, com zero gravações antes de aplicar e gravação única em lote. Edição posterior de assunto e nota manteve o ID. Falta homologação visual em navegador real.

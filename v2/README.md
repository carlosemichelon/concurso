# Banco Mestre — Site V2 (desenvolvimento isolado)

**Início:** 17/11/2026
**Branch de trabalho:** feature/site-v2-foundation-2026-11-17
**Produção preservada:** gh-pages (backup criado quando a V1 estava na V205; V209 verificada nesta etapa, podendo avançar; o retorno usa sempre index.html)
**Backup verificado:** backup/site-v1-before-v2-2026-11-17, commit 975dd96135fa9c30c38176c5a3860472794731cb

## Etapas 1 e 2 — módulos implementados na branch de desenvolvimento

O novo portal fica em v2/, com arquitetura modular, navegação por teclado, layout responsivo, buscas e catálogos em modo somente leitura. Não altera entrada da produção, index.html, assets/version.json ou a V1.

- index.html: estrutura e navegação acessível;
- assets/site.css: interface independente do legado;
- assets/data.js: leitura, validação de contagem, IDs e contratos;
- assets/app.js: visão geral, cartões com gabarito oculto, filtros de imagens, PDFs, auditoria;
- tests/smoke.mjs: testes determinísticos, ainda sujeitos à execução em ambiente Node.

## Fontes reais

| Módulo | Fonte | Estado |
|---|---|---|
| Cartões | assets/meta_public_v194.json + 7 partes | 1.518 IDs, 1.501 ativos, 17 inativos |
| Imagens | assets/v198_editorial_images_catalog.json | 179 IDs, 85 Cartão, 94 Conteúdo |
| Originais recuperados | assets/v180_native_image_additions.json | 93 mapeamentos para arquivos Drive; não prova acesso |
| PDFs | assets/pdf_catalog_v149.json | 78 referências por ID; originais no Drive |
| Destinos canônicos | assets/v202_storage_contract.json | IDs de pastas; contrato, não prova de upload |

A etapa 2 consulta metadados e prévias de mídias privadas SOMENTE após OAuth de leitura, sem salvar tokens e sem publicá-las no GitHub. SRS, grifos, notas, IndexedDB, localStorage, planilhas de cartões privadas, checkpoints pessoais e permissões não são lidos nem alterados. O leitor com 11 seções evolutivas permanece na V1 publicada, acessível via ../index.html. A produção foi conferida em V207 (home v207.html, fallback V207); sua numeração evolui independentemente da V2 e o painel da V2 sempre relê o manifesto no endereço publicado.

## Roadmap aprovado como sequência técnica

1. Base responsiva e leitura segura dos catálogos, incluindo diagnóstico de versão (esta entrega).
2. **Módulo programado:** Drive OAuth (GIS) com escopo drive.readonly, token apenas em memória, busca recursiva de imagens (duas raízes canônicas V202) e PDFs (quatro raízes da V201), deduplicação por fileId e consulta a cada 120 s enquanto página visível e sessão válida. O estado registrado distingue arquivo listado do catálogo GitHub; a prévia exige clique. OAuth real ainda precisa ser homologado pelo titular.
3. Auditoria de sincronização Drive ↔ GitHub ↔ exibição no navegador. Publicação automática NÃO existe nesta etapa; nenhuma mudança de visibilidade privada sem autorização.
4. Atlas V2: tipos Conteúdo e Cartão, subtipos enunciado/figura/explicação, vínculos N:N, distinção entre documento de origem e associação didática, editor e checkpoint rastreável.
5. Leitor e editor de PDF: migração apenas após testes reais, preservando chaves e históricos locais e todos os 11 módulos dos cartões.
6. Homologação no navegador do titular, desktop/mobile, OAuth, original PDF e imagem SVG, integridade, rollback. Somente depois considerar alterar a entrada do site.

## Testes

Da raiz do repositório, executar em Node 22:

    node --check v2/assets/data.js
    node --check v2/assets/app.js
    node --check v2/assets/drive.js
    node --check v2/assets/drive-ui.js
    node v2/tests/smoke.mjs
    node v2/tests/drive.mjs
    node v2/tests/audit.mjs
    node v2/tests/deployment.mjs
    node v2/tests/evolutive.mjs
    node v2/tests/related-images.mjs
    node v2/tests/pdf-compat.mjs
    node v2/tests/drive-media.mjs

Esses testes não comprovam a autenticação real no Drive nem o carregamento de imagem e PDF. Para homologar será necessário inspecionar a interface no navegador real e comparar os IDs e os arquivos acessíveis.


## Etapa 2 — integração de sessão Google Drive (implementada em código)

- **Acesso:** o botão Conectar só fica disponível após carregamento da configuração OAuth pública e do Google Identity Services. A autorização depende de clique explícito; o token OAuth não é enviado ao GitHub, ao checkpoint ou ao armazenamento local.
- **Atlas:** novas imagens JPEG, PNG, WebP, GIF e SVG da pasta canônica e da árvore histórica aparecem no topo da MESMA aba Atlas, em grupo complementar antes do catálogo público extenso. Os 93 originais já presentes no catálogo V198 são descontados por fileId. O catálogo público de 179 imagens não é modificado.
- **PDFs:** lista adicional de PDFs do Drive, com remoção dos IDs conhecidos pelo catálogo V149. O leitor avançado com grifos continua na V1, sem forçar nova identidade ou migração.
- **Consulta periódica:** a cada 120 segundos enquanto a aba está visível, conectada e não existe outra varredura em curso. A página não consegue atualizar quando está fechada, offline ou sem token.
- **Prévia:** imagem privada só é baixada em memória após o comando Ver prévia (limite 15 MB). Um arquivo localizado por metadados não é declarado visualizado até a prévia ser carregada; a URL do original abre com as permissões da conta.
- **Logout/expiração:** descarta listas privadas em memória e revoga object URLs das prévias. Não cria flashcards, classificações editoriais presumidas ou relações por simples coincidência.
- **Limites:** não há sincronização pública Drive → GitHub, agendamento de servidor, acesso offline a privados, autenticação verificada em navegador titular nem homologação visual. A configuração OAuth existente indica que origem autorizada e consentimento precisam ser testados com a conta real.
- **Validações:** Github Actions executa testes Node de contrato V202, URLs seguras, SVG, deduplicação, travessia recursiva e ausência de persistência de token; não equivalem a teste real do Google Drive.


## Etapa 3 — auditoria de sincronização e versões (implementação de código)

A V2 dispõe agora de duas verificações independentes.

### Conciliação Drive × catálogos

- Compara **somente por ID estável** os 93 originais do Atlas V180/V198 e os 78 PDFs V149 com as varreduras autenticadas da sessão. Os 86 registros históricos do Atlas sem ID do Drive verificável não entram no teste de presença remota: permanecem contabilizados separadamente.
- Estados por arquivo: \`listed_and_referenced\` (arquivo listado nas pastas e ID referenciado no catálogo), \`new_in_drive\` (arquivo novo apenas na consulta privada) e \`not_observed_in_monitored_roots\` (ID do catálogo não observado nas pastas examinadas).
- **Não observado não é exclusão nem arquivo faltante comprovado.** Pode ocorrer por pastas fora das raízes, permissões ou cobertura parcial da busca.
- Visualização de imagem só é registrada quando o elemento de prévia dispara o evento de carregamento. Ter URL, MIME ou metadados NÃO demonstra que bytes foram carregados.
- Contagens de novos e não observados entram no painel Sincronização. Os filtros permitem examinar cada grupo de status e pesquisar ID/nome. Não altera classificações editoriais nem cria vínculos.
- **Exportação protegida:** botão de resumo gera JSON agregado **sem IDs**; inventário detalhado (IDs, nomes e caminhos privados) exige clique e confirmação explícita. Nenhuma modalidade envia dados à rede; o arquivo é gerado e baixado somente no navegador. Nada é enviado ao Drive/GitHub.
- Limites: não verifica modificação por hash ou revisão, nem confirma integridade dos bytes remotos, publicação do GitHub, autorização de acesso a cada item ou exclusão permanente. A conciliação é de METADADOS observados em sessão autorizada.

### Versão publicada e caminhos

- Busca \`assets/version.json\` e \`index.html\` pelo mesmo endereço/origem do portal; confere o campo \`version\`, o \`home\` correspondente a \`vNNN.html\`, contagens principais, fallback estático e o redirecionamento por manifesto.
- Faz verificação HTTP \`HEAD\` do HTML indicado, sem executar o site legado. Código inesperado ou manifesto divergente produz aviso/erro, não força rollback nem sobrescreve a produção.
- O fato de receber HTTP 200 **não homologa** interface, OAuth, PDFs, grifos nem imagens. É um cheque estrutural e pontual de caminho.
- O painel pode ser atualizado manualmente, sem modificar \`gh-pages\`.

### Arquivos e testes desta etapa

- \`assets/audit.js\`: conciliação pura e payload de exportação.
- \`assets/audit-ui.js\`: filtros, indicadores e exportação confirmada.
- \`assets/deployment.js\`: inspeção do manifesto/redirecionamento/HTTP.
- \`assets/deployment-ui.js\`: apresentação de diagnóstico e atualização.
- \`tests/audit.mjs\`: confirma três estados, ausência não conclusiva, relatório agregado sem IDs e inventário com autorização explícita de UI.
- \`tests/deployment.mjs\`: detecta mismatch do \`home\`, HTTP 404, fallback divergente e contagens públicas alteradas.
- CI Node 22: sintaxe, catálogos, OAuth/simulações, reconciliação e versões; **não** é teste de navegador com login real.

O backup anterior à V2 continua no SHA \`975dd96135fa9c30c38176c5a3860472794731cb\`; a V1 permanece em \`gh-pages\`. Todas as alterações desta etapa ficam no PR rascunho **#29**.


## Etapa 4 — leitor evolutivo e vínculos bidirecionais (implementada em código)

### Evolutivos V194, com 11 módulos por cartão

- Reutilizar o manifesto público existente: \`meta_public_v194.json\` → \`evolutive_public.layers_files\`, sete arquivos \`layers_public_v194_000.json\` a \`_006.json\`. **Não** criar versões novas de cartões ou substituir os textos originais.
- \`assets/evolutive.js\` consulta somente o lote do cartão aberto. Usa leitura e cache por lote, validação de ID, 11 módulos obrigatórios, ordem canônica 01–11 e texto não vazio. Um erro de carregamento permite repetir consulta manualmente.
- Conforme a metodologia do Banco Mestre, a **ordem visual priorizada** da V2 é **08 → 04 → 05 → 06 → 09 → 10 → 01 → 02 → 03 → 07 → 11**. Cada seção mostra número de apresentação 01–11 e sua origem canônica em marcador "Fonte NN". O JSON fonte permanece intocado.
- A pergunta continua visível; o **verso original só aparece ao clicar Mostrar resposta**. Dentro da resposta, "Abrir aprofundamento técnico" também começa recolhido. Após abri-lo, **cada um dos 11 módulos continua recolhido**; é possível abrir individualmente ou navegar pelo seletor de módulos.
- Quadro e distinções (origem 08) são apresentados primeiro. Textos são renderizados com parágrafos, cabeçalhos, negrito, listas e tabelas Markdown em elementos nativos, sem executar HTML do JSON.
- Os 11 cartões listados como \`deferred_ids\` na base V194 permanecem reservados, sem fabricação de aprofundamentos. Registros inativos e sem 11 seções retornam explicação de indisponibilidade, sem apagar o verso histórico.
- \`tests/evolutive.mjs\` verifica os sete lotes de produção, **1.490 registros evolutivos íntegros**, todos com 11 seções, ID único, ordem de origem, apresentação priorizada, imutabilidade, cache, recarga e os 11 cartões reservados.
- Sem alteração de SRS, tentativas, IndexedDB, localStorage, notas, grifos ou resposta discursiva. O módulo usa somente o acervo público.

### Cartão ↔ Atlas em duas direções

- A aba Atlas já apresenta botão "Ver CARD-..." para vínculos navegáveis.
- Agora, após abrir a resposta de um cartão, aparece um quadro recolhido **Imagens relacionadas ao cartão** para vínculos registrados no catálogo V198; cada item abre a imagem filtrada na mesma aba Atlas.
- O rótulo distingue vínculo documental, questão conciliada e associação didática; não declara automaticamente que uma imagem didática já fazia parte do cartão original.
- \`tests/related-images.mjs\` valida **101 relações sem duplicatas**, das quais **100 se referem a cartões navegáveis** e uma é referência histórica \`PETRO14-C017\`, que não ganha rota inventada. Ações não alteram origem, classificação nem SRS.

### Estado de testes e limites

Testes automatizados Node/Actions conferem integridade **dos dados e dos módulos**. Ainda é necessária a homologação em navegador real de desktop e celular, com verificação dos 11 painéis, navegação por teclado, tabelas largas, abertura de documentos/figuras e autenticação Google. A qualidade científica e a atualização normativa de cada texto **não são certificadas** pelo teste estrutural.

### Próxima migração

Depois da homologação de interface: leitor de PDF e grifos, com compatibilidade do armazenamento existente. Não migrar dados históricos privados sem inventário e backup específico.


### Verificação funcional automatizada (Chromium)

Foi acrescentado o teste \`v2/tests/browser.mjs\` com servidor HTTP local de arquivos públicos e Chromium via Playwright. O fluxo exercita:
- página geral e contagens;
- pesquisa por \`CARD-1502\`, verso inicialmente oculto e revelação apenas por clique;
- carregamento tardio das 11 seções, ordem visual priorizada e renderização de tabela normativa nativa;
- \`CARD-0138\` reservado, sem aprofundamento artificial;
- navegação Atlas \`IMG-C12-025\` → \`CARD-1504\` → imagens relacionadas;
- painel de sincronização sem login, exportação de dados privados desabilitada;
- layout na largura de 390 px e ausência de transbordamento horizontal.

A instalação dos navegadores de teste está isolada no job \`browser-smoke\` da CI. A imagem do runner foi fixada em \`ubuntu-24.04\` para compatibilidade com Playwright 1.56.1. **A aprovação do teste de navegador deve ser verificada no GitHub Actions; teste automatizado não substitui autorização OAuth e validação do titular.**

Com Playwright instalado no computador local, o comando é:

    node v2/tests/browser.mjs


**Contagem não enganosa do Atlas:** o painel principal continua mostrando os 179 registros editoriais publicados, acompanhados de "+X arquivos Drive fora do catálogo" somente após consulta OAuth. A V2 não soma arquivos privados ao total publicado sem aprovação/editoria, evitando aparentar uma publicação inexistente. O teste Chromium exercita esse estado e a ordem de exibição das imagens privadas na aba Atlas.

## Etapa 5 — PDFs na V2 e proteção dos grifos legados

O novo leitor da V2 implementa somente a visualização, não a edição das marcas. Ele NÃO importa, converte, substitui nem sincroniza grifos, e não cria PDF anotado. O editor completo permanece na V1 até auditoria de migração própria.

- **Abertura pública e privada:** documentos do catálogo PDF V149 e PDFs adicionais descobertos na sessão OAuth oferecem botão \`Ler PDF na V2\`. O leitor aceita cópia local selecionada manualmente (sem armazenamento permanente) ou busca bytes pela Drive API usando a autorização read-only existente na barra. Não usa cookies do iframe Google Drive como prova de acesso.
- **Exibição:** PDF original em \`iframe\` de URL Blob gerada no navegador; limita a 120 MB, exige assinatura de arquivo \`%PDF-\` e calcula hash SHA-256. A URL temporária é revogada ao fechar; nenhum PDF é enviado ao GitHub nem incluído nos metadados públicos.
- **Identidade compatível com V1:** o editor legado usa \`BM030_STROKES_PDF:<documentId>:<hash>:P<page>\`, em que \`hash\` são os primeiros 12 bytes (24 dígitos hexadecimais) de SHA-256 do PDF. O V2 computa exatamente o mesmo identificador antes de consultar marcas.
- **Consulta sob clique:** \`Conferir grifos desta versão\` acessa somente as chaves do mesmo **documentId e hash** no \`localStorage\` da mesma origem web e do mesmo perfil do navegador. Não chama rotinas legadas de migração, mesclagem nem persistência. Mostra totais por página, estimativas de cores/textos e alerta quando há hashes diferentes do mesmo ID.
- **Exclusões:** a auditoria considera a chave \`BM122_DELETED_HIGHLIGHT_IDS\` e \`bm108_deleted_at\`; preserva os registros mínimos de exclusão, sem ressuscitar textos apagados. Para identidades legadas sem ID estável, declara possível ambiguidade ao invés de afirmar cobertura perfeita.
- **Backup local de uma versão:** botão explícito com confirmação cria JSON de leitura do documento/hash com traços originais, marcadores mínimos de exclusão e notas/unificações filtradas do mesmo arquivo. Não copia dados de outros PDFs nem o objeto global inteiro de metadados. **Não é restaurador nem checkpoint completo**; não contém bytes do PDF, dados SRS ou todos os grifos da V1.
- **Limitações importantes:** grifos ainda não são sobrepostos na visualização da V2; a versão histórica original permanece legível e editável apenas na V1. O scanner da V2 não busca automaticamente o mestre privado de grifos no Drive. Sem o mesmo navegador ou backup histórico importado explicitamente, a V2 não pode exibir as marcas de outros dispositivos.
- **Segurança:** tokens OAuth apenas em memória; nenhum \`localStorage.setItem\`/\`removeItem\` e nenhuma escrita IndexedDB/Drive/GitHub. A sessão Drive expirada encerra o PDF remoto da V2.
- **Testes:** \`tests/pdf-compat.mjs\` valida hash V1, chaves por página, versões distintas, tombstones, notas/uniões filtradas, exportação sem dados alheios e ausência de gravação. O \`browser.mjs\` abre um PDF válido de teste em Chromium, compara hash, mostra os registros de teste locais, verifica exclusões e confirma que não altera as chaves previamente existentes. O teste no Chromium comprova UI e URL Blob, mas não garante que todos os PDFs privados reais renderizem corretamente.

A V1 e os grifos armazenados permanecem intocados. Este módulo é uma etapa de compatibilidade, não uma autorização para alterar os históricos.



## Etapa 6 — sobreposição dos grifos V1 (implementada, homologação em andamento)

Os arquivos \`v2/assets/pdf-overlay.js\` e \`pdf-overlay-ui.js\` adicionam um modo opcional de **visualizar** os grifos legados por cima de uma página PDF, sem convertê-los nem alterá-los.

- **Protocolo de acesso:** o estudante escolhe um PDF (local ou Drive autenticado), confere a identidade do arquivo e aciona \`Conferir grifos desta versão\`. Só após essa inspeção aparece \`Exibir grifos sobre o PDF\`, habilitado se houver marcas. Um hash diferente continua bloqueado de transferir grifos de outra versão.
- **Identidades exatas:** além dos IDs \`id:\`, reproduz o algoritmo V122 para identificadores geométricos \`g:\` e legados \`l:\`. A filtragem consulta \`BM122_DELETED_HIGHLIGHT_IDS\` sem importar informações apagadas. Esse é um aprimoramento em relação à auditoria resumida anterior, que admitia ambiguidade nos IDs históricos.
- **Desenho:** PDF.js 3.11.174 renderiza a página para um canvas temporário e a V2 reproduz grifos de texto, sublinhado, sublinhado duplo, tachado, ocultação \`conceal\`, retângulo, caneta, marcador e notas. A geometria normalizada é convertida para a escala do canvas. Grifos de texto padrão usam multiplicação da cor sobre a imagem renderizada para preservar caracteres escuros; o estilo \`conceal\` preserva a área branca.
- **Navegação:** uma página por vez, controles Anterior/Próxima e seletor de página. O botão \`PDF original\` retorna à visualização sem sobreposição. Não cria um novo PDF ou grifo.
- **Proteção:** limite de até 120 MB no PDF e até 20 milhões de pixels na página renderizada; dados temporários são descartados ao fechar o modal, ao abrir outro PDF ou quando expira a autorização do Drive. A autenticação/token não é entregue ao PDF.js; somente os bytes do PDF selecionado são processados localmente.
- **Testes de dados:** \`tests/pdf-overlay.mjs\` prova IDs V122, exclusões de marcas com ID e sem ID, conversão das coordenadas 0..1, estilos, sem escrita no armazenamento.
- **Teste funcional:** \`tests/browser.mjs\` abre PDF de exemplo com PDF.js local no runner e confere pixels da marca ativa e área de marca removida, além de assegurar que o \`localStorage\` não mudou. Resultado final deve ser verificado na execução do GitHub Actions antes de considerar homologado.

**Limitações:** ainda falta validar PDFs reais da conta do titular, capas digitalizadas, rotação/cortes especiais, diferenças de zoom/retina e versões sem hash correspondente. A V2 continua sem editor de grifos, sem sincronizador do mestre privado e sem publicação em produção; a V1 continua o editor oficial.



## Etapa 7 — segurança de mídias Drive e exclusões históricas (2026-11-17)

### Backup de grifos V1 sem conteúdo já excluído

- A identidade dos grifos V122 foi centralizada em \`assets/pdf-identity.js\`; o mesmo algoritmo \`id:\`, \`g:\`, \`l:\` agora orienta tanto o desenho quanto a contagem e exportação, incluindo tombstones geométricos e legados.
- A V2, sem **modificar** nenhum registro da V1, **não coloca texto, cor, pontos ou notas de marcas excluídas no backup JSON**; só preserva os IDs mínimos de exclusão por página para impedir ressurgimento.
- Notas de texto e notas de caneta não-textual são filtradas por registro ainda ativo no mesmo PDF/hash. Associações entre grifos que passaram a incluir uma marca excluída são depuradas; somente associações com ao menos duas marcas ativas permanecem.
- Não é um mecanismo de restauração. A origem (localStorage do navegador) e a cópia mestre do Drive não foram alteradas. Teste \`tests/pdf-compat.mjs\` verifica que material excluído e notas de outro PDF não saem na cópia.

### Download protegido de PDF/imagem

- \`assets/drive-media.js\` valida destino HTTPS na API oficial \`www.googleapis.com/drive/v3/files\`, lê por streaming e interrompe dados acima de **120 MB (PDF)** ou **15 MB (prévia de imagem)**, mesmo sem Content-Length confiável. Confere assinatura \`%PDF-\` e MIME permitido quando informado.
- \`assets/drive.js\` mantém token apenas em memória; incrementa a geração da sessão ao desconectar/expirar/trocar credencial e cancela todos os downloads privados ainda ativos. Respostas atrasadas de sessões encerradas são rejeitadas e descartadas; também impede anexar Bearer a URLs fora da API oficial.
- \`assets/pdf-reader.js\` utiliza \`downloadPdf\` em vez de ler um \`Response.arrayBuffer()\` sem limite. Se houver logout **durante** a obtenção ou verificação do PDF, encerra o modal e rejeita resultados atrasados; não mantém uma URL Blob privada.
- \`tests/drive-media.mjs\` cobre origem permitida/proibida, corpo sem tamanho anunciado, PDF sem assinatura correta, downloads maiores que limite, logout durante requisição, HTTP 401, SVG e ausência de gravações locais.

### Homologação de fluxo com OAuth simulado

- O novo \`tests/browser-drive.mjs\` reproduz uma autorização GIS **fictícia**, com respostas Drive mockadas no Chromium; verifica pastas oficiais, contagem separada das 179 imagens editoriais, prévia SVG, leitura de PDF e limpeza de metadados/Blob no logout.
- Esse teste não acede uma conta Google verdadeira, não valida permissões da conta do titular nem prova que os documentos reais abrem. A execução da CI deve ser conferida no GitHub Actions antes de declarar o teste aprovado.
- A V1 permanece na branch de produção \`gh-pages\`, independente da V2, atualmente em \`feature/site-v2-foundation-2026-11-17\` e PR rascunho #29. A versão pública V1 já chegou a V210; não houve merge/publicação da V2.


## Rollback

A produção continua na branch gh-pages com seu próprio manifesto, sem redirecionar para a V2. Se esta prévia falhar, basta descartar a branch de desenvolvimento; a cópia completa da árvore de código preexistente está na branch de backup. O backup do repositório NÃO é backup do conteúdo privado do navegador nem ZIP integral do Drive.

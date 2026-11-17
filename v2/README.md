# Banco Mestre — Site V2 (desenvolvimento isolado)

**Início:** 17/11/2026
**Branch de trabalho:** feature/site-v2-foundation-2026-11-17
**Produção preservada:** gh-pages (V205 no instante do backup; conferida V207 durante a etapa 3; a numeração pode continuar evoluindo; link operacional sempre via index.html)
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

Esses testes não comprovam a autenticação real no Drive nem o carregamento de imagem e PDF. Para homologar será necessário inspecionar a interface no navegador real e comparar os IDs e os arquivos acessíveis.


## Etapa 2 — integração de sessão Google Drive (implementada em código)

- **Acesso:** o botão Conectar só fica disponível após carregamento da configuração OAuth pública e do Google Identity Services. A autorização depende de clique explícito; o token OAuth não é enviado ao GitHub, ao checkpoint ou ao armazenamento local.
- **Atlas:** novas imagens JPEG, PNG, WebP, GIF e SVG da pasta canônica e da árvore histórica são listadas na MESMA aba Atlas, em um grupo complementar. Os 93 originais já presentes no catálogo V198 são descontados por fileId. O catálogo público de 179 imagens não é modificado.
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

## Rollback

A produção continua na branch gh-pages com seu próprio manifesto, sem redirecionar para a V2. Se esta prévia falhar, basta descartar a branch de desenvolvimento; a cópia completa da árvore de código preexistente está na branch de backup. O backup do repositório NÃO é backup do conteúdo privado do navegador nem ZIP integral do Drive.

# Banco Mestre — Site V2 (desenvolvimento isolado)

**Início:** 17/11/2026
**Branch de trabalho:** feature/site-v2-foundation-2026-11-17
**Produção preservada:** gh-pages (V205 no instante do backup; V206 ao concluir esta etapa; link operacional sempre via index.html)
**Backup verificado:** backup/site-v1-before-v2-2026-11-17, commit 975dd96135fa9c30c38176c5a3860472794731cb

## Etapa 1 — implementada

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

A V2 ainda não lê nem escreve dados privados: SRS, grifos, notas, IndexedDB, localStorage, planilhas privadas, backups pessoais ou permissões. O leitor com 11 seções evolutivas permanece no portal operacional V205. V205 identifica a versão histórica do portal antigo, não a numeração conceitual do novo Site V2.

## Roadmap aprovado como sequência técnica

1. Base responsiva e leitura segura dos catálogos, incluindo diagnóstico de versão (esta entrega).
2. Drive OAuth autorizado; leitura de imagens, PDFs e pastas canônicas; deduplicação e estado por item (listado / acessível / renderizado / publicado). Nunca publicar credenciais ou tokens.
3. Auditoria de sincronização Drive ↔ GitHub ↔ exibição no navegador. Publicação automática NÃO existe nesta etapa; nenhuma mudança de visibilidade privada sem autorização.
4. Atlas V2: tipos Conteúdo e Cartão, subtipos enunciado/figura/explicação, vínculos N:N, distinção entre documento de origem e associação didática, editor e checkpoint rastreável.
5. Leitor e editor de PDF: migração apenas após testes reais, preservando chaves e históricos locais e todos os 11 módulos dos cartões.
6. Homologação no navegador do titular, desktop/mobile, OAuth, original PDF e imagem SVG, integridade, rollback. Somente depois considerar alterar a entrada do site.

## Testes

Da raiz do repositório, executar em Node 22:

    node --check v2/assets/data.js
    node --check v2/assets/app.js
    node v2/tests/smoke.mjs

Esses testes não comprovam a autenticação real no Drive nem o carregamento de imagem e PDF. Para homologar será necessário inspecionar a interface no navegador real e comparar os IDs e os arquivos acessíveis.

## Rollback

A produção continua na V205 sem redirecionar para a V2. Se esta prévia falhar, basta descartar a branch de desenvolvimento; a cópia completa da árvore de código preexistente está na branch de backup. O backup do repositório NÃO é backup do conteúdo privado do navegador nem ZIP integral do Drive.

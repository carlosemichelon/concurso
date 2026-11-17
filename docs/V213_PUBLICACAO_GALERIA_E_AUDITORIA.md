# V213 — Publicação estática do acervo Drive V211 na biblioteca V1

Data: 17/11/2026. Código de preparação: `staging/v213-static-drive-gallery-v1-2026-11-17`.

## Objetivo e estado
Publicar a coleção de imagens já transferidas do Drive ao GitHub, sem transferências repetidas,
sem modificar os originais no Drive e preservando integralmente o visual e as funções da V1.
A V2 permanece fora do escopo.

## Auditoria do conjunto
- Catálogo de origem: `assets/v211_published_images.json`
- Arquivos físicos: `assets/drive-images/v211/`, 237 arquivos distintos, 53.408.401 bytes
- Sobreposição documental com V180/V198: 93 Drive IDs (já existentes entre as 179 imagens anteriores)
- Novos IDs não sobrepostos: 144
- Total exibível: 179 + 144 = **323 imagens distintas**
- Os 179 registros editoriais anteriores continuam no catálogo V198. Os 144 novos permanecem
  classificados provisoriamente como conteúdo, salvo vínculo específico explicitamente documentado.
  Publicação física NÃO é aprovação técnica, normativa ou validação de vínculo com cartões.

## Integração de interface
- `v213.html`: derivada da V212, conserva TRT01-C001/C002, 78 PDFs, 1.518 cartões V194,
  filtros, layouts compactos V210, editor e SRS
- `assets/v213_public_gallery_v1.js`: usa a mesma grade da V1, 144 novos cartões de imagem,
  com ampliar, esconder/restaurar e editar vínculo, sem suprimir o visualizador original
- As 93 imagens V180 com Drive ID já conhecido usam cópia estática para prévia e ampliação
- `assets/v213_drive_gallery_feed.js`: deduplica os 237 IDs na consulta OAuth; evita
  que a sessão privada mostre cópias publicadas como novidades
- `assets/v213_single_image_viewer.js`: mantém botão único Mostrar mais imagens
- `assets/v213_library_counter.js`: apresenta 323 imagens públicas, somadas apenas às
  privadas não publicadas em sessões OAuth
- V211, V212 e versões anteriores continuam acessíveis, sem reescrita

## Privacidade e limites
**Atenção:** publicar imagens em `gh-pages` torna os 237 arquivos acessíveis publicamente.
Os arquivos originais no Google Drive não foram renomeados, movidos nem excluídos.
Grifos pessoais, eventos SRS e dados autenticados não foram publicados.
A publicação não elimina a necessidade de autorização Google para consultar **outros**
arquivos privados ainda não publicados. O site não faz sincronização pública automática
de imagens novas; cada publicação adicional exige auditoria.

## Testes e reversão
- `tests/v213_gallery_integrity.cjs`: valida quantidade, ID, tamanho, arquivo presente,
  sobreposição e referências aos módulos anteriores
- Workflow: `.github/workflows/validar-galeria-v213.yml`
- Conferência automatizada de estrutura e sintaxe: executar em CI e validar resultado
- Validação com navegador real, especialmente Chrome/Android, clique de miniaturas,
  filtros e ciclo de OAuth: não considerar homologada sem teste de sessão real
- Backup anterior: `backup/v212-before-237-drive-images-v213-2026-11-17`
- Rollback público: `https://carlosemichelon.github.io/concurso/v212.html`

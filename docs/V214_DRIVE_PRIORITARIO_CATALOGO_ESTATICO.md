# V214 — Biblioteca V1 com Drive prioritário e catálogo estático alternativo

Data: 17/11/2026.

## Escopo e preservação
V214 herda a V213 Drive-first e seu controle de fontes, sem alterar `v213.html`.
A V2 fica em pausa. Preservados V210–V213, a base pública V194 (1.518 IDs), Atlas editorial V198
(179 registros), 78 PDFs e os cartões operacionais TRT01-C001 e TRT01-C002 com vínculos.
Os eventos SRS, grifos e tokens OAuth não são publicados.

## Imagens
- A fonte principal continua Google Drive, apenas depois de autenticação OAuth válida do titular
  e enquanto a página está aberta; a leitura privada não depende das cópias GitHub
- O modo `Ver catálogo salvo` apresenta a V1 histórica com 179 imagens e 144 inéditas,
  totalizando **323 imagens distintas**, sem exigir login
- O pacote contém 237 arquivos estáticos em `assets/drive-images/v211/` (53.408.401 bytes)
- Exatamente 93 IDs dos 237 estão entre as 179 imagens do catálogo V198/V180;
  os demais 144 têm identificador `DRIVE-IMG-<fileId>`
- `assets/v211_published_images.json` guarda caminhos, origens, classificações provisórias
  e IDs estáveis; itens sem vínculo documental não devem receber vínculo de cartão presumido
- Os 237 arquivos publicados no GitHub Pages são **públicos**. Os originais do Drive permanecem
  intactos e não houve mudança nas permissões do Drive

## Interface
- A página `v214.html` carrega os módulos V213 de Drive como fonte principal
- O catálogo alternativo usa `assets/v214_public_gallery_fallback.js` e a grade original V1
- `assets/v214_single_image_viewer.js` preserva preferência local Drive/catálogo e paginação
- `assets/v214_library_counter.js` mostra contagem da fonte ativa, sem somar a imagem do Drive
  a sua cópia no catálogo alternativo
- A edição, os filtros, o leitor e a navegação V1 continuam disponíveis no modo catálogo

## Verificação e reversão
- Teste automatizado: `tests/v214_gallery_integrity.cjs`
- Workflow: `.github/workflows/validar-galeria-v214.yml`
- Verifica 237 caminhos, bytes físicos, sobreposição exata 93/144 e referências de módulos
- A homologação em navegador Chrome/Android e a autenticação real Google OAuth ainda exigem
  teste na sessão do titular; auditoria estática não comprova renderização visual
- Branch de backup: `backup/v213-drive-first-before-v214-static-2026-11-17`
- Rollback direto: https://carlosemichelon.github.io/concurso/v213.html

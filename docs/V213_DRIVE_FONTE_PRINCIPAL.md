# V213 — Drive como fonte principal de imagens na V1
Data: 17/11/2026 · Repo: carlosemichelon/concurso · publicação exclusiva gh-pages

## Objetivo
Preservar integralmente o layout e os dados da V1/V212; manter a V2 pausada. Permitir consulta visual autenticada dos arquivos **diretamente** no Google Drive, sem publicar binários privados em repositório público.

## Comportamento
1. A página inicializa com a biblioteca salva como alternativa enquanto não há consulta Drive autorizada. Após clicar em **Conectar imagens** e concluir a autorização do Google, a V213 percorre recursivamente as duas pastas definidas em `assets/v202_storage_contract.json`, deduplica por ID e usa a API Drive para prévias e abertura do original.
2. Mostra **todos** os originais lidos, inclusive os que têm referência no catálogo público: durante o modo Drive, os cartões públicos ficam apenas ocultos na mesma grade, **não apagados**. Não soma 179 aos 237 possíveis nem presume que esse total permaneça fixo.
3. O seletor **Ver catálogo salvo / Priorizar Drive** é reversível. A preferência da fonte no `localStorage` contém somente `drive` ou `catalog`; não são armazenados títulos, fotos ou tokens privados.
4. O módulo mantém busca e botão Mostrar mais. As imagens são lidas sob demanda, com Blob URLs em memória, saneamento de SVG e limite 15MB.
5. A consulta de alterações ocorre ao autorizar, ao recuperar foco/visibilidade e a cada dois minutos enquanto a sessão continua válida. Imagens modificadas perdem sua URL de prévia antiga; fotos sem alterações reutilizam a URL.
6. Ao perder autorização, volta ao catálogo preservado; não destrói PDFs, classificação, histórico de grifos nem SRS.
7. O acesso ao Drive **não é persistente quando o site é reaberto**. `prompt:''` remove o consentimento forçado, não fornece refresh token persistente. Para isso, só arquitetura OAuth por backend autorizado e storage criptografado; não implementar tokens no GitHub Pages.

## Segurança e testes
- `drive.readonly`, acesso por API oficial Drive, token em memória. A página continua pública; a leitura dos originais exige credenciais Google e permissões adequadas.
- Não houve upload, exclusão, cópia nem mudança de permissões em mídias Drive.
- Base de cartões V194 (1.518), catálogo público de imagens V198 (179), catálogo de PDFs V149 (78), as duas páginas TRT V211/V212, SRS e grifos preservados.
- Tests: `tests/v213_single_image_viewer.cjs`, `tests/v213_library_counter.cjs` e `.github/workflows/validar-v1-drive-v213.yml`.
- Pendente: teste do login OAuth real e preview de imagens privadas na conta do titular; validação visual desktop/mobile; autenticação persistente entre visitas depende de infraestrutura externa.

## Recuperação
- Backup antes da publicação: `backup/v212-before-v213-drive-primary-publish-2026-11-17`.
- Para reverter o portal, apontar `assets/version.json` e `index.html` para `v212.html` após auditoria; não apagar `v213.html` nem os módulos novos.

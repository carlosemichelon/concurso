# V206 — Editor com imagem lateral, correção da prévia SVG e contrato de sincronização

**Data:** 17/11/2026. **Versão anterior:** V205 (rollback em `v205.html`).

## Diagnóstico

1. A V205 já integrava o **grupo autenticado do Drive** à organização do Atlas. Não realizava publicação automática no GitHub. A consulta é condicionada à conta Google autorizada e agendada por `setInterval` a cada **120.000 ms**, apenas enquanto a página está aberta e a sessão tem token válido.
2. A V204/V205 usava pop-up com prévia pequena **acima** do formulário. O usuário pediu figura **à esquerda** e edição **à direita**.
3. O leitor do Drive conferia `blob.type` recebido de `files/{id}?alt=media` contra a lista de imagens. Para arquivos SVG cuja resposta recebe `application/octet-stream`, `text/plain` ou `application/xml`, o código rejeitava a mídia mesmo quando a ficha do Google Drive indicava `image/svg+xml`. Esta era uma causa potencial identificável no código, não um diagnóstico comprovado em sessão real.

## Implementações

### Editor visual V206
- `assets/v206_atlas_editor.js` e `assets/v206_image_links.js`: tanto edição do Atlas público quanto edição de tipo/vínculos de novas imagens Drive compartilham a mesma composição em duas colunas, preservando **um único botão Editar imagem** e as abas **Dados / Tipo e cartões** na biblioteca pública.
- `assets/v206_image_modals.css`: largura máxima **640 px**, altura máxima **64vh** (teto 570 px); coluna esquerda **44%** (prévia proporcional, object-fit contain), direita **56%** (formulário com rolagem própria).
- **Celular (até 590 px):** janela de no máximo 400 px de largura, imagem de 148 px em cima dos campos. A disposição lateral fica restrita às telas em que os campos continuam legíveis.
- A miniatura utilizada é a mesma do cartão correspondente. Os listeners de monitoramento são associados ao fechamento do diálogo para reduzir retenção de observadores.
- As alterações continuam locais ao navegador, sem reescrever arquivos/imagens, SRS ou catálogo público.

### Prévia SVG V206
- `assets/v206_drive_atlas_svg.js` conserva a descoberta recursiva de arquivos Drive, deduplicação por file ID e as pastas fixas do V205.
- A aceitação de SVG é definida a partir do `mimeType` **da ficha do arquivo** fornecida pelo Drive. O corpo de resposta pode ser `image/svg+xml`, `application/octet-stream`, `text/plain`, `text/xml`, `application/xml` ou sem MIME e continua sendo verificado.
- Para SVG, `DOMParser` valida o XML e sua raiz `svg`, remove elementos potencialmente ativos, atributos `on*` e ligações externas/estilos remotos. `XMLSerializer` gera um novo `Blob(image/svg+xml)` **apenas em memória**, exibido em um elemento `img`. O SVG original no Drive **não é alterado**.
- Se o SVG estiver inválido ou usar recursos externos indispensáveis, a prévia pode ficar incompleta; a opção **Abrir SVG no Drive** permanece como caminho de referência. **Não foi implantado editor de grifos de SVG.**
- O restante dos formatos PNG/JPEG/WebP/GIF conserva leitura do Drive e recebe tipagem MIME normalizada quando o corpo retorna sem MIME ou `application/octet-stream`.

## Fontes, sincronização e limites de integridade

- **Drive** = fonte única de verdade para os **arquivos binários originais**, na pasta de destino canônico `1ksSVWrmRaRlDoG4iDtTGvfr2OnPnhnY6`. Os originais antigos em `1pp1CL9oMYVFHPPzv117DZpy1kA-wyJQo` continuam consulta histórica, não destino novo.
- **Atlas** = indexação e interface didática. As 179 imagens públicas e classificações curadas são versionadas no GitHub, não sobrescritas por toda mudança no Drive. Novas imagens privadas só são exibidas **na sessão autenticada**, com busca e grupo interno; não há publicação pública implícita.
- **A cada 2 minutos** enquanto página aberta/token válido: verificação de novas imagens, modificações e arquivos removidos. A ação manual **Atualizar imagens** força uma consulta; o prazo não é uma garantia de execução em abas suspensas, fora da rede ou sem OAuth.
- Arquivos do Drive, catálogos GitHub, anotações locais, IDs de cartões e checkpoints são dados distintos. Não é correto afirmar sincronização total, em duas vias ou permanente no GitHub.
- Não substituir Atlas pelo Drive: sem Atlas perde-se a interface de estudo, classificação editorial e navegação de cartões. Recomenda-se arquitetura híbrida com Drive como armazenamento dos originais e Atlas como apresentação, com **processo separado de revisão/publicação do catálogo permanente**.
- Checkpoints e manifestos permanecem vinculados à pasta canônica `1348cILBcxFG9p2cfPJ3WubmHswPRbD24`.

## QA
- Montagem de `v206.html` sobre `v062.html`: **86 scripts**, **75 estilos**, sem arquivo não encontrado ou referência duplicada.
- JS dos três módulos modificados validado por compilação sintática.
- Verificados por inspeção: layout lateral em Atlas e editor privado, versão atual exibida e presença de normalização MIME de SVG.
- **Pendente:** teste real com autorização OAuth, renderização de PNG/SVG de usuários, tamanho responsivo em navegador (desktop/mobile), intervalos reais em abas ociosas, acessibilidade do grupo Drive e disponibilização do GitHub Pages. Não declarar homologação integral sem essas provas.

**Rollback:** `https://carlosemichelon.github.io/concurso/v205.html`.

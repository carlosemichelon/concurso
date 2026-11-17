# V204 — Janela de edição menor com prévia da imagem

**Data:** 17/11/2026 — branch operacional `gh-pages`. Reversão disponível em `v203.html`.

## Ajuste solicitado
- Reduzir bastante o tamanho da janela `Editar imagem`: de **450 px / 74vh** (V203) para **320 px / 56vh**, com teto de 500 px, margem externa e rolagem interna. Em telas pequenas, limitar a 320 px de largura e 68vh de altura.
- Exibir a **imagem correspondente ao cartão** dentro da própria janela, no topo, acima das abas `Dados` e `Tipo e cartões`.
- Altura do espaço de prévia: 104 px, usando `object-fit:contain` para não cortar a figura; em telas baixas, 80 px.
- Manter apenas um botão `Editar imagem`; `Mostrar cartão` permanece na face do cartão quando há vínculo.

## Fonte e integridade das imagens
- `assets/v204_image_links.js` disponibiliza `mountImagePreview`, que reutiliza **a URL de miniatura já exibida no cartão**. Não cria arquivo, não publica bytes nem altera a mídia original.
- A janela do Atlas `assets/v204_atlas_editor.js` utiliza o elemento `img.thumb` do cartão público. O pop-up de imagens privadas no Drive busca o `img` do cartão correspondente na sessão autenticada.
- Carregamento posterior da miniatura ou do blob de Drive é acompanhado por evento `load` e `MutationObserver` do atributo `src`; observadores são desconectados quando a janela fecha. Se a miniatura for inacessível, exibir mensagem de prévia indisponível, **sem simular imagem ou trocar de arquivo**.
- Abas, gravadores de metadados locais e classificação editorial V198 são preservados.
- Destinos de imagens e checkpoints no Drive seguem `assets/v202_storage_contract.json`, sem mudança.

## Validação de código
- Wrapper de `v204.html` montado sobre `v062.html` em ambiente simulado: **86 scripts, 74 estilos**, sem caminhos faltantes ou duplicados.
- Cabeçalho esperado: `Portal V204 · cartões V194 · Atlas V198`.
- Scripts dos dois editores validados sintaticamente.
- Conferida a presença da miniatura no fluxo do Atlas e no diálogo privado Drive, bem como a lógica de acompanhar o carregamento assíncrono.
- **Ainda não homologado:** renderização e clique em navegador real, OAuth, miniatura remota acessível ao usuário, layout visual em celular. Esse teste é necessário para afirmar que todas as imagens são exibidas corretamente.
- Sem modificações em cartões, SRS, PDFs, originais, permissões, pasta Drive ou formato de checkpoints.

**Rollback:** `https://carlosemichelon.github.io/concurso/v203.html`.

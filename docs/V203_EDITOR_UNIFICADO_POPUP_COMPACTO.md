# V203 — Correção de edição duplicada e janela compacta
**Data:** 17/11/2026 · **Publicação:** branch `gh-pages`.

## Problema identificado
Dois módulos independentes anexavam a ação `Editar imagem` ao mesmo cartão público:
- `v202_atlas_editor_dialog.js`: texto, assunto, descrição, favoritos, visibilidade
- `v202_image_links_modal.js`: tipo editorial Conteúdo/Cartão e vínculos com flashcards

Isso produzia **dois botões visíveis** e duas experiências separadas de edição.

## Correção implementada
- **Um único botão `Editar imagem`** na imagem pública. O código da edição de classificação V203 detecta a presença do editor do Atlas e não cria outro botão.
- **Uma única janela com duas abas:** `Dados` (título, área, assunto, descrição, observações, favoritos e visibilidade) e `Tipo e cartões` (classificação, função enunciado/figura/explicação, IDs).
- O editor V203 de classificação expõe `mountEditorForm()` para integrar o formulário à janela principal do Atlas. Para imagens privadas do Drive sem botão de edição do Atlas, há **um** botão de edição que abre janela compacta somente com tipo/vínculos.
- **Mostrar cartão** permanece no próprio cartão de imagem quando há vínculo navegável. Cliques nos botões não acionam a ampliação da miniatura.
- **Dimensão:** largura máxima `450px` (máximo `91vw`); altura máxima `74vh` (limite `690px`), com rolagem vertical; no celular, `82vh` e largura `100vw - 18px`.
- O painel de edição de dados não fica montado na imagem visível: é anexado ao abrir a janela. Apenas a aba selecionada é exibida.
- Módulos antigos V202 preservados para rollback, sem reescrever imagens, cartões, SRS ou registro de checkpoint.

## Caminhos e metodologia
Permanece o contrato `assets/v202_storage_contract.json`:
- **Novas imagens:** pasta Drive Atlas `1ksSVWrmRaRlDoG4iDtTGvfr2OnPnhnY6`.
- **Novos checkpoints ZIP/manifesto:** pasta Drive Checkpoints Banco Mestre `1348cILBcxFG9p2cfPJ3WubmHswPRbD24`.
A V203 modifica apenas a interface de edição; os leitores e verificações dos IDs das pastas continuam os mesmos da V202.

## Validação
- Montagem de `v203.html` sobre `v062.html`: **86 scripts + 74 CSS**, sem arquivos faltantes nem duplicação por nome.
- JS dos dois novos módulos analisado sintaticamente e retornou válido.
- Checados em código: detecção do botão do Atlas; duas abas; API de formulário integrado; limites de tamanho da janela.
- **Pendente:** clique em navegador real, abertura dos modais em celular, funcionamento de OAuth e deploy público. Não declarar homologação visual sem essa evidência.

**Rollback:** `v202.html`.

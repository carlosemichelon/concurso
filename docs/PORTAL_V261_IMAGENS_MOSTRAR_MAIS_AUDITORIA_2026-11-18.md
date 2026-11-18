# Banco Mestre V261 — Imagens: botão «Mostrar mais» após as primeiras 24

Data: 18/11/2026. Solicitação: “Aparecem 24 imagens e depois não aparece mais”.

## Causa verificada no código

A galeria autenticada `v228_drive_gallery_feed.js` usa `visible=24`, aumenta em 24 ao clicar `#bm084-more` e emite evento `bm209-drive-render` com `shown` e `matching`. Isso é paginação intencional, não um máximo de 24 imagens.

O botão visível `#bm209More` da camada `v218_single_image_viewer.js` foi colocado em `#bm153Results`. Este contêiner herdado da navegação temática V209/V153 pode estar **oculto por CSS** quando não está em modo de navegação (seletor `#bm153Results:not(.bm153Browsing){display:none!important}`). Por sua vez, a camada V222 desloca apenas a grade `#imageRows` para `#bm221DriveViewport`, deixando o botão de paginação na estrutura antiga oculta. Resultado: aparecem 24 imagens e o usuário não encontra como continuar.

## Alteração V261

- Criado `assets/v261_images_load_more.js`, carregado **depois** de `v222_images_live.js` em `v261.html`.
- Reutiliza o botão original `#bm209More` e o **move ao lado da grade visível**, dentro de `#bm221DriveViewport`; caso o botão não esteja presente, um controle substituto delega ao mesmo `#bm084-more`.
- Não refaz consultas Drive ao clicar. O botão delega ao paginador existente, que altera `visible += 24` e reexecuta os filtros/renderização.
- Exibe contador claro de **X de Y imagens correspondentes aos filtros atuais**, atualizando a cada evento de renderização.
- Botão só aparece quando há mais imagens filtradas e o acesso à biblioteca Drive já foi validado. Quando o total é exatamente 24 ou inferior, não inventa novas imagens.
- Mantém ao menos 44px de altura de toque em celular; não edita arquivos originais, previews, metadados, vínculos, cartões, grifos, filtros, cache privado, SRS nem controle de estudos.

## Testes

- **7/7 testes estáticos** de inserção em `v261.html`: 131 scripts anteriores na mesma ordem + 1 módulo final, Drive/OAuth/imagens preservados, V260 PDFs, startup direto e SRS preservados.
- **6/6 testes de comportamento isolados** do módulo real em DOM simulado: botão transferido para a galeria visível; 55 imagens: 24 iniciais → 48 → 55; botão oculto ao final; exatamente 24 imagens: sem botão falso; sem gravações de dados.
- Teste no navegador real com Google OAuth, Drive privado e smartphone: **pendente**. Testes simulados não comprovam a quantidade real de imagens no Drive do usuário.

## Salvamento, publicação e recuperação

- Arquivo `assets/v261_images_load_more.js` salvo e auditado no `gh-pages`.
- `v261.html` preserva ordem dos scripts existentes, adicionando somente módulo de paginação ao final.
- `index.html` é atualizado com conteúdo idêntico ao de `v261.html` (entrada direta sem o bootstrap dinâmico antigo).
- `assets/version.json` recebe `version: V261` e apontamento para `v261.html`.
- `v260.html` preservado como checkpoint recuperável.

Nota: títulos e status de imagem no código não são prova de que o Drive confirmou todas as fontes. A quantidade real será exibida a partir do evento da galeria autenticada; se o Drive retornar só 24, a interface indicará 24 de 24.

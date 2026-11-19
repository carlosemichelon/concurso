# Auditoria V297 — Banco Mestre (19/11/2026)

## Evidências no código
- CSS V296: `#imagens #bm209SyncBar :is(input,select,button,summary)` impunha cor escura em botões de fundo azul. Corrigido.
- CSS V296: seletor de etiquetas `.tag,.chip,.pill` abrangia indicadores funcionais. Estilo neutro restrito a `.tag`.
- CSS V296: regra geral dos botões nos cartões abrangia classes `.primary` e `.danger`; agora excluídas.
- CSS V296: título do cartão no celular reduzido para 15 px, corpo para 14 px; agora 16 px / 15 px.
- HTML V296: texto orientava a clicar em uma ação de verificação de PDFs removida na V293. Atualizado.
- Relatórios de SHA podem trazer textos longos; área de relatório agora quebra texto sem mudar cálculo/resultado.

## Garantias e limites
- `index.html` e `v297.html` idênticos no commit.
- Fonte anterior `v296.html`/CSS V296 preservada.
- Não houve alteração nos JSON de cartões, IDs, 11 módulos, Drive, imagens, SRS, PDFs ou mecanismo de SHA.
- Validação de código e manifesto: **estática**, sem confirmação da renderização mobile/desktop nem OAuth no navegador real.

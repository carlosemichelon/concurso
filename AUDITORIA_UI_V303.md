# Auditoria da interface V303 — preparação (19/11/2026)
- Capturas reais da V302 em desktop 1366×900 e celular 390×844 mostram PDF com busca à direita e caixa de login à esquerda, um espaço vazio enorme e ferramentas espalhadas.
- Em V302, os filtros secundários de Flashcards, Imagens e PDFs continuam materializados visivelmente quando o `details` está fechado porque CSS legada usa `display:flex!important` para o corpo.
- A V303 corrige a semântica do `details`, cria uma única barra por biblioteca, separa filtros primários de configuração, preserva SVGs, funções de Drive, IDs e SRS.
- A V303 desativa a duplicação de reorganizadores V280/V300; clones de V113/V293 mantêm funções de mobile/imagens sem deslocar os campos novamente.
- Nenhum grifo é apagado, alterado ou injetado no PDF original; o mestre privado JSON segue protegido pelos módulos antigos.
- Testes localizados em `tests/v303_current_ui_static.cjs` e `tests/v303_ui_browser.cjs`, com fotos sintéticas do Chromium. Não equivale a autenticação Google real.

# Auditoria V082 — Vade Mecum real

A versão V081 foi testada com texto extraído de dois PDFs do Vade Mecum Senado Federal 3ª edição. Ambos possuem 809 páginas e texto igual nas 809 páginas. A cópia do Banco Mestre e o PDF original foram apenas lidos.

Foram exercitados dispositivos das páginas 17, 126, 137, 643, 728 e 768. A classificação por expressões funciona em vários dispositivos, mas os testes identificaram três problemas a corrigir:

1. União de marcações amarelas através de conteúdo neutro (LRF art. 38).
2. Seleção multilinha em PDF.js: quebras virtuais podem existir em `Selection.toString()` mas não em `Range.toString()`.
3. Não reconhecimento automático de “não será autorizada” e variações.

V082 fornece arquivos isolados de correção `v082_multicor.js`, `v082_grifador.js` e `v082_contexto_normativo.js`. A V081 e seus grifos não são reescritos.

**Limitação:** a conferência usa o texto efetivo dos PDFs e simulações do Range/DOM. Não equivale a clicar no Vade Mecum dentro do Chrome/Android autenticado do titular. A validação visual de cores, zoom, reabertura e persistência no site é a etapa seguinte.

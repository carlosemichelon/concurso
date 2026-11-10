# V078 — pré-sincronização de grifos, branch de desenvolvimento

Esta entrega é independente da V077, que estava sendo atualizada simultaneamente na branch de publicação em 10/11/2026.

## Testes executados
- Classificador V075: 23/23 testes automatizados aprovados (após inspeção da branch gh-pages).
- Autoteste no novo módulo: 16/16 aprovados.
- Comparação sintética de dois conjuntos: 1 página idêntica, 1 página divergente, 1 somente no remoto.
- Validação de backup V066 válido aprovada; formato desconhecido rejeitado.

## Integração posterior (não publicar sem preflight)
Quando V077 estiver publicada e estabilizada, verificar o manifesto assets/version.json e a versão do loader na branch gh-pages.
Integrar `assets/v078_pre_sync_grifos.js` e `assets/v078_pre_sync_grifos.css` ao novo HTML versionado sem alterar módulos históricos e catálogo vigente.
Preservar os 65 ou 72 PDFs conforme o manifesto oficial naquele instante, sem assumir uma contagem.
Criar backup de código, incrementar versão, atualizar index.html, manifesto e VERSAO_ATUAL.md numa alteração coordenada.
Conferir manualmente OAuth, SHA-256, relatório de diferenças e reabertura de grifos em PDF real.

**Não implementar restauração/importação automática:** a decisão de importação da metodologia não foi aprovada. O módulo novo só compara.

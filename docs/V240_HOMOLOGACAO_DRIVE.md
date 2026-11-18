# Banco Mestre — homologação de integridade do Drive (18/11/2026)

Branch de trabalho `homologacao/v240-drive-integridade-2026-11-18`, **não publicada** como página inicial. A V239 continua indicada pelo manifesto; V240 já tem uma proposta paralela de indicadores compactos, que este arquivo preserva. Nesta branch, o artefato de teste é `homologacao-v240-integridade.html`.

## Alterações
- Botão único de Drive preservado, sem criar outro botão de autenticação.
- Os indicadores pequenos e o estado de cada catálogo da proposta V240 foram mantidos.
- Conferência de PDFs exige 78 documentos, não apenas um relatório parcial.
- Consulta de imagens só é marcada como conferida com `lastSuccess` e contagem positiva válida.
- Grifos só recebem estado integralmente conferido quando o mestre declara `Sem divergências detectadas.`; divergências preservadas aparecem como pendência.
- O resultado global de mídias deve corresponder à execução corrente, não a relatório antigo durante concorrência.
- Painel recolhível apresenta evidências por módulo; SRS e cartões canônicos permanecem explicitamente fora da sincronização.

## Não realizado / riscos
Não foi executado OAuth no navegador do titular, visualização responsiva real, ida e volta Drive/controle em dois aparelhos nem teste de concorrência de atualizações. A verificação de versão Drive anterior ao PATCH não é compare-and-swap atômico; conflito simultâneo continua risco. Sem gravação nem integração do SRS, alterações de cartões, originais PDFs/imagens ou dados privados nesta etapa.

## Testes obrigatórios antes de publicar
1. Abrir em ambiente de homologação HTTPS com origem OAuth habilitada, sem substituir a página inicial.
2. Desconectado: conferir os números estáticos 78 / 1.540 / 179 e status não verificado.
3. Conectar no botão central e autorizar; verificar Drive 78 PDFs, galeria de originais e miniaturas; ler resultados reais do painel.
4. Editar/excluir grifos, simular divergência; não exibir sucesso integral nessa situação.
5. Controle: cronômetro e sessão, sincronização com hash, exportação, conflito entre dois aparelhos e restauração.
6. Testar desktop/celular e leitores de tela; verificação de arquivos/IDs e regressão de flashcards/SRS.
7. Confirmar persistência no Drive e deploy separadamente, antes de promover branch e atualizar manifesto.

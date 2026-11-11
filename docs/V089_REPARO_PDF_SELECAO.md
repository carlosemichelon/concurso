# V089 — recuperação do editor de PDF

Diagnóstico: o carregador V088 tinha um fechamento literal de script dentro de uma string, e o antigo seletor PDF.js seguia a ordem do DOM, problemática em Vade Mecum com três colunas.

## Novos controles
1. Abra PDF, clique **Selecionar texto** (o leitor tende a entrar nesse modo quando abre documento textual).
2. **Toque na primeira palavra e depois na última palavra** da frase. No desktop pode também arrastar com o mouse. Uma seleção nunca atravessa as três colunas do Vade Mecum.
3. Confira a transcrição do trecho na janela. Se houver excesso/falta de palavras, clique **Refazer seleção**.
4. Escolha uma das seis cores, preencha **Assunto** (obrigatório) e clique **Salvar grifo**. Disciplina/Subassunto são opcionais.
5. Clique **Mover** para rolar sem selecionar. **Mais ferramentas** exibe caneta, grifo livre, borracha, limpar e PNG.

O sistema não usa seleção DOM, classificador local automático nem API Claude. O PDF continua em memória do leitor; grifos são salvos somente após confirmação. O original no Drive não é alterado. Grifos antigos não são reescritos nem migrados.

## Proteções
Se o PDF não expõe palavras com posições confiáveis, a seleção é recusada. Seleções excessivas e palavras sobrepostas no mesmo ponto são recusadas. O aplicativo não grava grifos por clique sozinho e não sobrepõe grifos anteriores.

## Auditoria
- Carregador HTML V088 inválido devido a `</script>` em string; corrigido em V089 usando montagem `'<scr'+'ipt'`.
- Teste de sintaxe no loader da V089; contagem de fechamentos reais de script = 1.
- Detector de três colunas em diferentes larguras de fonte; seleção produz somente texto da coluna esperada.
- Teste de segurança com geometria conflituosa.
- Simulação de interação mostra prévia e zero gravações antes da confirmação; depois grava um registro com cor e assunto.
- Não houve teste end-to-end com o PDF real carregado no Chrome/Android do usuário; a homologação do comportamento visual ainda está pendente.

## Versões e dados
V088 preservada. Backup: `backup/v088-with-v018-before-precision-selector-v089-2026-11-10`.
Preservados: versão dos cartões V018, cache e shard, Drive, 72 PDFs, 270 imagens, Atlas, histórico, IDs e SRS.

# Banco Mestre — Contrato metodológico V037
Data: 09/11/2026. Aplicação: todos os cartões existentes e novos, de qualquer disciplina.

## Correção discursiva universal
1. Exibir somente a pergunta antes de o estudante tentar.
2. Registrar a resposta discursiva original com o ID estável, data e hora de tentativa, sem inventar resposta nem classificação.
3. Após a tentativa, mostrar a resposta mínima para acertar e, em separado, a **Resposta exata do cartão original** (verso literal preservado).
4. Prover resposta-guia desenvolvida e contextualizada, com definição, fundamento verificável, mecanismo/conceito, aplicação, distinções, condições, exceções, armadilhas e macete pertinente. Nunca rotular síntese curta como guia aprofundado.
5. Avaliar o que a escrita realmente demonstrou: acertos, lacunas parciais, erros, omissões de requisitos relevantes e itens aprendidos após correção. Não exigir que uma resposta mínima reproduza todo o aprofundamento.
6. Explicitar análise da escrita, cobertura cruzada direta/indireta/parcial e itens ainda não demonstrados. Relação por assunto não é domínio comprovado.
7. Só atribuir Errei/Difícil/Bom/Fácil após avaliação do estudante; manter intervalos e eventos canônicos SRS. O site estático não lança evento SRS automaticamente.
8. Preservar a tentativa, os guias, o histórico e IDs; novas perguntas/cartões dependem de aprovação conforme PMS-1.

## Especificidade da lei seca
- Respeitar a literalidade de caput, artigo, parágrafo, inciso e alínea, bem como vigência, prazos e exceções.
- A resposta histórica e a explicação didática **não certificam** transcrição literal sem cotejo com fonte oficial.
- Referenciar o Vade Mecum Senado Federal 3ª ed., fechado em janeiro/2026, quando presente e atualizado; se a lei estiver ausente, buscar o texto vigente em outra fonte oficial e preservar PDF original próprio.
- Vincular cada dispositivo ao PDF-guia canônico (arquivo original, mesma paginação), ao ID do cartão e ao nível de cobertura integral/parcial/sem cartão/não auditado.

## Interface dos assuntos
- Títulos específicos, por matéria/subassunto, acompanhados de enunciado e ID do cartão nas explicações.
- Não mostrar “Visão geral”, “Conhecimentos e referências associados”, “Outros assuntos do mesmo núcleo temático” nem “Macetes do acervo” na página do assunto.
- Os macetes aparecem somente no cartão, depois da tentativa ou de consulta explícita.

## PDF original editável no site
- Leitura e marcações diretamente sobre a página original no navegador: caneta, grifo, borracha, notas, IDs CARD e estados de cobertura.
- Guardar cópia local autorizada e marcações vinculadas a ID+hash+pagina no navegador, preservar diagramação; permitir reabertura do mesmo PDF e exportação do PDF anotado.
- Nunca tratar armazenamento local como sincronização no Google Drive. Backup exportado é essencial para troca de navegador/dispositivo.
- O PDF do Drive é prévia somente leitura por limitação de origem/autorização; importar a cópia autorizada uma vez para editar no site.

## Status verificável de implementação V037
- A interface para captura de resposta, lacunas, resposta-guia local e exportação foi disponibilizada para **todos os cartões, inclusive novos**.
- A produção de **respostas-guia aprofundadas individualmente para todos os 1.494+22 registros** e a correção automática por IA **não estão concluídas**. Onde não existe guia auditado, a interface marca isso explicitamente.
- O site não altera base V015, contagens do atlas, origem, PDFs do Drive ou SRS; alterações da V037 concentram-se na apresentação e armazenamento voluntário no navegador.

## Contrato permanente de formatação dos cartões — atualização 17/11/2026

- **Um único padrão visual obrigatório:** cartões de TRT, Engenharia, Legislação e qualquer outra disciplina devem usar a mesma hierarquia e classes visuais dos cartões originais do Banco Mestre (referência de comparação: CARD-1338 no site), sem criar um segundo layout/grade paralelo.
- **Frente:** classificação da disciplina e origem; enunciado legível; botão de leitura no mesmo posicionamento dos demais; ID estável; assunto/subassunto e referência quando cadastrados. Não inventar botões que não funcionam nem acionar avaliações sem consentimento.
- **Verso aprofundado:** manter os **11 módulos íntegros na sequência numérica**, incluindo imagens vinculadas. Somente DEPOIS desses módulos apresentar o **“Quadro informativo do cartão”** (resumo de consulta). Não antecipá-lo, não usá-lo para substituir explicações, não omitir nenhum módulo.
- **Metadados administrativos e histórico operacional** ficam recolhidos **dentro do quadro informativo final** quando houver, sem criar outro bloco visível depois dele. O quadro é o último bloco do conteúdo de estudo.
- **“Informações da base e dos cartões”** (informação geral da biblioteca) deve ser o último bloco da página de cartões, inicialmente recolhido.
- **Auditoria e publicação:** antes de publicar, verificar estruturalmente a ordem dos 11 módulos e do quadro, comparar o cartão novo com um original, conferir que os botões visíveis funcionam, testar comportamento responsivo e preservar íntegros IDs, texto original, imagens, fonte, histórico, SRS e sincronização.
- **Manutenção obrigatória:** registrar toda decisão/correção de formatação neste contrato metodológico e no AGENTS.md, evitando depender apenas de mensagens de conversa ou comentários no código. Correção visual não significa integração do SRS canônico.

### Validação da frente TRT após correção de 17/11/2026
- Critério visual obrigatório: reproduzir a hierarquia do CARD-1338: **rótulos de disciplina e origem → pergunta → botão Abrir leitura alinhado no canto direito da pergunta → identificador → etiquetas de assunto/fonte → referência → linha divisória → ações de lei seca, grifar/escrever, guia e excluir da visualização**.
- Controles devem ser executáveis, não decorativos. Para cartões TRT, a ferramenta de anotação usa a mesma interface V122 em armazenamento local isolado pelo ID TRT. Consulta normativa não deve afirmar possuir transcrição literal sem cotejo.
- Quadro informativo após os 11 módulos e imagens, metadados recolhidos dentro dele; informação geral da biblioteca no rodapé da página.
- Documentar conferência de código e conferência de navegador separadamente: teste de sintaxe não prova igualdade visual. Não anunciar homologação visual sem captura/validação no navegador.

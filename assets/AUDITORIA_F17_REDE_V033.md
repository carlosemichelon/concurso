# Banco Mestre — Auditoria F17, interconexões e referência de assuntos — V033
Data: 09/11/2026 · Base canônica preservada V015 · Camada de consulta e navegação no GitHub Pages.

## Fontes efetivamente conciliadas
- `assets/f17_historico_auditado_v029.json`: 21 eventos formais de revisão F17, sete associações registradas na agenda, nove propostas históricas de evolução.
- `assets/f17_respostas_9_v030.json`: nove respostas arquivadas, recuperadas de CSV. O texto preservado não constitui transcrição independente completa de toda a conversa.
- Quatro shards V015: 1.494 cartões canônicos. V033 não reescreve frente, verso, ID, avaliação, eventos ou datas.
- `assets/f17_rede_referencias_v033.json`: índice derivado e verificável com 22 cartões principais distintos (21 eventos + nove respostas, com sobreposição), 7 arestas da auditoria F17, 28 menções adicionais em respostas, 9 propostas evolutivas e 41 IDs distintos no conjunto das arestas/propostas.
- Outras 31 referências de IDs aparecem na rede sem constar entre os 22 registros principais; essas referências não são eventos de revisão.
- `assets/imagens_assuntos_v032.json`: índice independente de imagens e assuntos. Não usar imagens que partilham grupo como comprovação automática do conhecimento.

## Regras verificáveis de cobertura
1. **Evento formal**: vem apenas de `historico_por_id`; avaliação e próxima revisão existentes são apenas reproduzidas.
2. **Histórico de resposta**: conhecer e diferenciar a fala arquivada, pontos demonstrados, incompletos, erros, lacunas, referências citadas e grau de confiança.
3. **Cobertura direta informada**: classificação citada no CSV para parte de conhecimento; NÃO se transforma em lançamento ou acerto formal no cartão de destino.
4. **Cobertura parcial / indireta**: documentada como tal, sem pular automaticamente revisão de qualquer cartão.
5. **Relação somente temática / contextual / não avaliada**: não significa demonstração de conhecimento.
6. **Assunto igual, grupo ou título semelhante**: contexto de navegação, NUNCA aresta auditada nem prova de duplicata.
7. **Evoluções históricas**: proposta, não cartão novo nem revisão; exigir autorização específica para promover a base.
8. **Duas fontes para mesmo par**: são duas evidências documentais, não duas tentativas.

## Retificações pontuais relevantes
- CARD-0095 → CARD-0099: o histórico usa *indireta demonstrada*, não grau direto.
- CARD-0101 → CARD-0100: relação contextual explicitamente não demonstrada.
- CARD-0101 → CARD-0105, 0106 e 0107: os três são *não avaliados* na resposta arquivada; IDs abreviados foram desdobrados.
- CARD-0091: possui resposta arquivada, mas **não** tem evento formal localizado na camada F17; não atribuir nota ou agendamento.
- Distinção preservada entre a classificação da resposta arquivada e a avaliação formal F17 quando forem de momentos diferentes.

## Comportamento da V033
A nova aba **Conexões F17** reúne eventos, respostas, fontes e assuntos relacionados, com pesquisa por ID/texto, filtros por status e propostas evolutivas. Cada relação exibe origem → destino, grau, excerto de evidência e link à fonte. O guia de cada assunto e a resposta de cada cartão usam a mesma rede. O visualizador de imagens e PDFs V032 permanece inalterado.

## Controle de qualidade
- Validação estática: 4 arquivos de script/HTML analisados, IDs de componentes presentes e índices com contagem conferida.
- O catálogo das imagens permanece em `assets/imagens_assuntos_v032.json`; as imagens não foram reclassificadas nesta atualização.
- Nenhum teste real em navegador Android foi executado neste turno. A renderização no aparelho, disponibilidade de conteúdo Drive e gravação local de riscos/grifos precisam de verificação de uso.
- Sem alterações nos 1.494 cartões da V015, nas 22 cópias Ijuí, na SRS ou nos PDFs originais. A versão anterior pode ser aberta diretamente pelo URL `v032.html`.

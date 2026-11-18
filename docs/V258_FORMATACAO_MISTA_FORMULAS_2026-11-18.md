# V258 — Separação de prosa e equações no Guia de Fórmulas e cartões

Data: 18/11/2026. Base de entrada: **V257**, preservada em `v257.html`. Mudança de **apresentação**, sem edição da fonte Drive.

## Causa da regressão
O renderizador MathML V256 interpretava linhas inteiras do guia como fórmula quando continham `=`. Palavras de descrições e condições eram convertidas em identificadores matemáticos `<mi>`, fazendo os espaços sumirem visualmente. A fonte privada no Google Drive conserva seus espaços, símbolos e pontuação.

## Implementação
- `assets/v258_math_refinement.js`: separa texto anterior a dois-pontos, separa equações delimitadas por ponto e vírgula, mantém frases e glosas de unidades como texto quando há prosa, e gera MathML apenas para trechos matemáticos adequados.
- `assets/v258_math_refinement.css`: apresenta descrição e fórmulas em blocos diferentes, dimensionados para celular e computador.
- `v258.html`: página versionada sobre V257, mantendo V256 MathML simples e lacunas. O refinamento é carregado após o renderizador anterior.
- `tests/v258_math_refinement.test.cjs`: seis testes de regressão isolados, inclusive frações, subscritos, texto misturado, unidades e ausência de gravação SRS.

## Critério de conservação
Não alterar o Google Docs do Guia, a ficha privada de lacunas, os 11 módulos, os IDs, o histórico dos cartões, a base F17/PMS-1, o SRS ou o cache de dados. A versão original de cada linha continua disponível no DOM em campo não visual e nos dados originais; não remover texto nem prometer correção normativa.

## Evidência técnica
- Leitura de fonte: guia privado no Drive, ID `1eOla5S9In1LTB6IJkJPLmP8mQfM2P2urk33jgCYam5M`; texto de origem intacto.
- Varredura de **128 linhas** classificadas como equação no leitor: **96** receberam composição textual/matemática, **32** permaneceram sob renderização V256. Sem edição das linhas canônicas.
- 6 testes de regressão de unidade passaram em ambiente JS isolado com DOM simulado. O par de expressões de tensão/força térmica virou **2 blocos MathML**, descrição preservada em texto normal.
- Equações de módulo resistente permanecem com fração MathML e índices subscritos.
- Validação separada de commit, fonte e dependências da página é necessária; simulação de DOM não certifica visualização física no navegador do titular, OAuth ou sincronização Drive.
- Matemática foi formatada, **não revalidada normativamente**. Verificar sempre as hipóteses, sinais e edições pertinentes.

## Limites
Testes visuais em navegação real desktop/móvel, autenticação Google e sincronização interdispositivos não são inferidos de testes estáticos. A mudança não reescreve fontes privadas e não atualiza o SRS.

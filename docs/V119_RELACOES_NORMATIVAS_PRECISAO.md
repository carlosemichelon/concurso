# V119 — Relações normativas e classificação vinculada ao artigo

Data: 11/11/2026. Base da interface: **V118**. A V118 foi publicada durante o desenvolvimento da V119; o arquivo `v119.html` foi derivado da V118, **não** da V117.

## Problema abordado

O classificador de palavras V114 tinha 154 exemplos lexicais e só aprofundava o art. 1º constitucional. A IA Naive Bayes acertou 19/25 casos exploratórios, valor **insuficiente para autorizar novas marcações automaticamente**. Um nome de órgão, uma expressão normativa ou um prazo não define sozinho sua função; o vínculo com artigo, caput, inciso, parágrafo e remissão importa mais do que uma palavra isolada.

## O que efetivamente entrou

- `assets/v119_relacoes_normativas.js`: camada **determinística verificável** sobre V114 (não é BERT/LLM): reconhecimento literal dos arts. 2º, 3º e 4º da Constituição; os núcleos recebem referência à fonte, artigo e tipo de relação, e mantêm `classification_status: sugestao`.
- Art. 2º: identificação dos Poderes da União, harmonia/independência e órgãos nomeados (3 núcleos).
- Art. 3º: caput e quatro objetivos fundamentais (5 núcleos), exigindo incisos I–IV em ordem e pontuação identificável.
- Art. 4º: sujeito e regra de relações internacionais, dez princípios (I–X) e parágrafo único (13 núcleos).
- Art. 1º: os 13 núcleos V114 permanecem no módulo legado; a V119 não substitui nem reclassifica esse resultado.
- `inspectDocument(tokens, profileId)`: índices de artigos, parágrafos, incisos, alíneas e remissões explícitas em **12 perfis normativos existentes**, com chaves estáveis derivadas do perfil selecionado.
- Vínculos estruturais genéricos **não certificam o texto da lei** e **não geram novas cores automaticamente**: `verified_source: false`. Perfil selecionado não comprova identidade do PDF, vigência ou redação.
- `assets/v119_calibrador_ui.js`: informa esse limite no seletor de norma sem mudar a chave da preferência por documento/hash.
- `v119.html`: deriva da V118; preserva compactações, Drive privado, dados locais, PDF.js, grifos e leitor.

## Segurança dos grifos e das quatro cores

Cor amarela `regra` (#FDE68A), verde `agente` (#BBF7D0), azul `condicao` (#BAE6FD) e rosa `excecao` (#FECDD3). O algoritmo não inventa exceção em enumerações de princípios e não pinta números romanos como se fossem o conteúdo. Exige geometria finita e não sobrepõe os núcleos que controla.

Incertos permanecem sujeitos a confirmação manual. Não há treinamento com conteúdo privado, mudança de SRS, alteração de cartões, sincronização silenciosa, gravação retroativa ou recoloração de grifos históricos.

## Ensaios automatizados

- 12 variações sintéticas para cada um dos arts. 2º, 3º e 4º (36 conjuntos positivos).
- 11 casos negativos de ativação indevida, 4 testes de marcadores romanos malformados e rejeição do perfil Geral.
- Auditoria de cores, coordenadas, intervalos sobrepostos, fonte, vínculos ao artigo, índices e remissões.
- 12 perfis com grafo genérico de artigo → parágrafo → inciso → alínea; teste de parágrafo único e remissão à própria norma.
- Preservação da suíte V114: 200 testes V111 + 216 trechos oficiais V112 + 411 adversariais V112, além dos testes do art. 1º V114.
- `tests/v119_integridade_portal.cjs` valida que o carregador HTML utiliza a V118 e não perdeu o PDF, o Drive, o Atlas e o seletor.
- Workflow: `.github/workflows/validar-relacoes-lei-v119.yml`, Node 22 sem dependências npm externas.

Essas verificações são **regressões controladas, não uma estimativa independente de precisão em todos os dispositivos ou leis**. A execução em navegador Android/iOS, o reconhecimento de PDFs escaneados e o fluxo OAuth real seguem sem homologação nesta etapa.

## Fonte jurídica primária e delimitação

Constituição atualizada: https://www2.camara.leg.br/legin/fed/consti/1988/constituicao-1988-5-outubro-1988-322142-normaatualizada-pl.html

Estrutura de artigos, parágrafos, incisos e alíneas descrita na LC 95/1998, art. 10: https://www2.camara.leg.br/legin/fed/leicom/1998/leicomplementar-95-26-fevereiro-1998-363948-normaatualizada-pl.html

A lei utilizada no estudo pode ter redações supervenientes. O reconhecimento de trechos literais aqui não significa verificação automática de revogações, alterações ou jurisprudência.

## Próximo ciclo de precisão (não implementado)

1. Construir corpus ouro **por documento e versão oficial**, com intervalos exatos de palavras e vínculos (`ator`, `norma`, `condicao`, `excecao`, `remissao`, `inciso_de`, etc.).
2. Separar treinamento/validação/testes **por lei**, não sortear frases parecidas do mesmo artigo entre conjuntos; deduplicar redações.
3. Treinar e comparar modelo contextual português jurídico com baseline estrutural, usando rótulos BIO e extração de relações, e avaliar precisão/recall **por cor e por span**. Guardar erros de falso positivo e de referência a artigo errado.
4. Só habilitar inferência automática se superar o baseline em documentos inéditos com critérios de revisão humana e desempenho móvel comprovados. O tamanho do modelo deve ser consequência da precisão real, não meta em si.
5. Associar texto à fonte oficial/edição e registrar hash antes de alegar vigência. Sem cotejo, exibir claramente `não verificado`.

Não promover a V119 como modelo neural maior nem usar o número 19/25 como taxa geral de acerto.

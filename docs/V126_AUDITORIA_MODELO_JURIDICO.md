# V126 experimental — filtro de qualidade e preparação do corpus jurídico por palavra

**Data:** 11/11/2026. **Situação:** NÃO PUBLICAR. Base operacional em `gh-pages`: V125, com o motor de remissões da V124 preservado. Nada deste experimento carrega no portal público. Nenhum grifo, cartão, cor, PDF, imagem ou evento SRS foi modificado.

## 1. Objetivo e evidência

O classificador V124 produz marcações curtas e às vezes incompletas com `confidence:'alta'`. Exemplos identificados no texto oficial:

- CF/88 art. 5º, VIII: grifo amarelo terminava depois de «crença», sem o complemento da regra; grifo rosa terminava em «a», sem completar a exceção.
- Lei 9.784/1999 art. 50: uma sugestão azul juntava «quando: III - ...», atravessando a abertura do rol e o inciso.
- LC 95/1998 art. 10: uma sugestão amarela terminava em «observância dos», sem núcleo suficiente.
- Lei 14.133/2021 art. 1º, § 1º: o núcleo «ressalvado o disposto no» era truncado e a exclusão da regra geral não foi inteiramente recuperada.

Esses defeitos são de **segmentação e contextualização**, não se resolvem aumentando sem avaliação o número de exemplos de um Naive Bayes.

## 2. Experimento técnico

`assets/v126_qualidade_clausulas.js` é camada somente de leitura que pode rebaixar `confidence:alta` para revisão manual, sem criar ou salvar grifos. Conserva os núcleos da CF/88 arts. 1º–4º que já tinham validação literal/contextual V114/V121.

Sinais de risco: frase terminada em conectivo, operador sem complemento, número de inciso dentro de um único grifo, vírgula seguida de continuação do mesmo sintagma e correspondência longa sem limite textual.

- Primeira política demasiado rígida: **36/216 testes oficiais V112 aprovados**, 180 regressões. Não publicável.
- Política atenuada: **105/216 testes oficiais V112 aprovados**, 111 regressões. Continua não publicável; testes V112 cobram reconhecimento da categoria até em excertos propositadamente parciais, portanto não provam sozinhos erro jurídico, mas revelam perda importante de cobertura.
- Em 7 casos difíceis anotados para segurança, havia 12 núcleos anteriormente classificados automaticamente. A camada conservou 4 e desviou 8 para revisão manual. Isto **não** significa 8 erros detectados com certeza: são suspeitas que precisam de avaliação humana.
- Os testes da branch confirmam preservação dos arts. 1º–3º e imutabilidade dos núcleos que continuam aprovados. O art. 4º requer nova cobertura explícita na suíte do filtro.
- `tests/v126_qualidade_clausulas.cjs`: regressão dos casos difíceis, sem mudanças nos textos originais.
- `tests/v126_semente_bio_lei_seca.json`: **7 dispositivos de 5 diplomas**, com **13 intervalos semânticos propostos**, rótulos candidatos por palavra. Status `proposta_sem_homologacao_humana`: não usar ainda no treinamento ou como teste independente.
- `tests/v126_seed_annotation.cjs`: verifica unicidade, presença literal dos trechos, não sobreposição e identidade de fontes.

## 3. Arquitetura de precisão recomendada

1. **Fonte e versão:** identidade explícita da norma, edição e hash do PDF/HTML. Perfil selecionado é preferência, não prova da fonte.
2. **Articulação:** parser da LC 95/1998, hierarquia artigo/caput/parágrafo/inciso/alínea/item e remissões cruzadas; não extrapolar entre frases/dispositivos.
3. **Modelo supervisionado jurídico:** rotular BIO por token (`REGRA`, `AGENTE`, `CONDICAO`, `EXCECAO`, `O`). Treinar com dados oficiais anotados por lei, não usar anotações privadas sem autorização.
4. **Camada de decisão:** só aplicar grifos automaticamente quando regras, contexto e predição forem consistentes. Caso contrário, oferecer revisão manual com explicação do motivo.
5. **Avaliação:** separar treino/validação/teste por **lei e edição** para evitar vazamento. Medir precisão/recall por cor, F1 de intervalo exato, remissão com destino correto, taxa de abstenção e desempenho no celular. Não chamar acerto em conjunto sintético de precisão jurídica geral.

Referências de engenharia de NLP legal brasileiro:
- LeNER-Br — https://github.com/peluz/lener-br ; reconhece entidades de documentos legais, mas não as quatro cores normativas.
- UlyssesLegalNER-Br (PROPOR 2026) — https://aclanthology.org/2026.propor-1.33/ ; corpus de documentos legais e modelos BERTimbau, incluindo leis, mas com taxonomia de NER diversa.
- UlyssesNER-Br (Câmara dos Deputados) — https://github.com/ulysses-camara/ulysses-ner-br ; dados legislativos com etiqueta por token.
- LC 95/1998, redação atualizada — https://www2.camara.leg.br/legin/fed/leicom/1998/leicomplementar-95-26-fevereiro-1998-363948-normaatualizada-pl.html .

## 4. Condições mínimas antes de publicar V126 ou versão posterior

- Não aumentar falsos positivos conhecidos e manter a V124 como fallback preservado.
- Substituir casos vagos de categorização por **intervalos de referência verificáveis**, com revisão e etiqueta jurídica justificada.
- Verificar pelo menos um conjunto independente, inteiramente composto por leis não usadas na calibragem, e publicar a matriz de confusão por cor.
- Exigir testes de não sobreposição, âncora no PDF, salvamento, reabertura e preservação das edições em outro dispositivo antes de afirmar homologação completa.
- Não exigir número de parâmetros ou volume arbitrário de exemplos sem medição de generalização. O primeiro objetivo é uma alta **precisão seletiva**, aceitando abstenções onde não há evidência suficiente.

**Conclusão:** a versão de produção continua V124. A V126 experimental melhorou o bloqueio de alguns padrões perigosos, mas não atingiu cobertura segura e **não foi publicada**.


## Medição adicionada — intervalos exatos por cor (V126)

A suíte `tests/v126_avaliacao_spans.cjs` comparou duas versões sobre uma **semente provisória não homologada de 7 dispositivos, 5 normas e 13 intervalos de referência**. Os resultados são exclusivamente diagnósticos:

| Sistema | Trechos automáticos | Trechos exatamente iguais à referência | Precisão estrita (diagnóstica) | Recuperação estrita |
| --- | ---: | ---: | ---: | ---: |
| V124 (base) | 11 | 5 | 45,45% | 38,46% |
| V126 (filtro) | 5 | 4 | 80,00% | 30,77% |

O filtro reduz marcações incompletas, mas perde cobertura — por isso **não está liberado para publicação**. A amostra é pequena, os rótulos ainda não passaram por auditoria humana independente e os dados não são um conjunto cego. Os percentuais **não devem ser divulgados como acurácia ou confiabilidade geral**.

O relatório `tests/v126_auditoria_cobertura.cjs` confirma a perda de 111 das 216 verificações V112 de presença de categoria, e define `releaseGate.passed=false`. O fluxo de GitHub Actions passa porque avalia **integridade do experimento**, não porque o modelo foi aprovado para grifos automáticos. Manter a V125 pública intacta e a V126 somente em branch até superar os critérios de validação.

Próximo passo de qualidade: ampliar o corpus de trechos oficiais para amostras independentes de cada lei, revisar os quatro intervalos semânticos e suas exclusões com dupla anotação, medir concordância entre anotadores e executar avaliação estratificada por norma/edição com limiares definidos previamente. A arquitetura de modelo neural contextual só será escolhida depois dessa auditoria.

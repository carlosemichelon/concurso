# Banco Mestre V124 — classificação jurídica: remissões verificáveis e controle de falsos vínculos

**Data de análise:** 11/11/2026. **Base pública preservada:** V123 + V122, com 1.499 cartões, 72 PDFs, 270 imagens, 22 cartões Ijuí à parte, edição de grifos e caneta nos flashcards. **Branch:** `feature/v124-remissoes-seguras-20261111`.

## Problema demonstrado

A V121 vinculava algumas remissões à norma ativa no calibrador, mesmo quando o texto citava outra lei. Exemplo de teste: "art. 37 da Constituição Federal" no perfil Lei 9.784/1999 não deve virar `LEI9784:art37`.

## Política de precisão

1. Se o texto contém referência explícita identificável à **CF federal** ou a uma lei federal reconhecida, registrar `target` da norma citada e `resolution:explicit_law`.
2. Se usa apenas `desta Lei`, `desta Constituição` ou artigo sem norma de origem verificada, registrar `target:null` e, quando possível, `suggested_target` separado. O perfil é uma seleção do leitor; **não comprova a identidade do PDF**.
3. Se a norma é desconhecida, ambígua ou aparece em outra frase, não criar destino inventado.
4. Nenhuma marcação anterior será migrada; novas classificações continuam `classification_status:sugestao`. Os IDs, retângulos e as cores do resultado V121 são mantidos.
5. `verified_source:false` em todas as remissões: **a referência lexical não comprova vigência, redação oficial ou revogação**. O modelo ainda não compara hashes entre texto do PDF e texto oficial.

## Implementação

- `assets/v124_remissoes.js`: motor independente, sem rede, sem localStorage, sem IndexedDB, sem Drive. Lê tokens selecionados, identifica referências no contexto do artigo, confirma a norma citada apenas quando a vinculação textual é explícita e mantém os demais metadados.
- `v124.html`: montagem derivada de `v123.html`, com uma única inclusão funcional (V123) depois de V121 e antes de V111. As demais mudanças são versão e link de retorno. A recuperação dos cartões de V123 permanece ativa.
- `tests/v124_integridade_portal.cjs`: reverte em memória a inclusão da V123 e exige igualdade integral com o HTML V123 anterior.
- `tests/v124_remissoes.cjs`: cobertura de remissão interna/externa, normas não catalogadas, frases diferentes, abreviaturas e comparação exata da lista de grifos V121 antes/depois.
- `tests/v124_corpus_referencias_oficiais.cjs`: **52 cenários controlados** (20 trechos de fontes oficiais e 32 frases adversariais). O conjunto é de desenvolvimento, não teste cego; não inferir precisão jurídica geral a partir de acertos nele.
- `.github/workflows/validar-juridico-v124.yml`: reexecuta regressões anteriores V114 e V121, casos V123 e integridade do portal.

## Fontes oficiais usadas na avaliação

- Constituição Federal — https://www4.planalto.gov.br/legislacao/legis-federal/constituicao
- Lei Complementar 95/1998 — https://www2.camara.leg.br/legin/fed/leicom/1998/leicomplementar-95-26-fevereiro-1998-363948-normaatualizada-pl.html
- Lei 8.429/1992 — https://www2.camara.leg.br/legin/fed/lei/1992/lei-8429-2-junho-1992-357452-normaatualizada-pl.html
- Lei 9.784/1999 — https://www2.camara.leg.br/legin/fed/lei/1999/lei-9784-29-janeiro-1999-322239-normaatualizada-pl.html
- Lei 14.133/2021 — https://www.planalto.gov.br/ccivil_03/_ato2019-2022/2021/lei/l14133.htm

## Limites e próximas etapas

A V123 **não aumenta os 154 exemplos do classificador Naive Bayes** e não instala BERT. Antes de uma IA contextual poder grifar automaticamente em normas variadas, falta construir um corpus ouro maior, com classes por intervalo de palavras e vínculos de artigo, dispositivos e fonte/edição. Separar treinamento, validação e testes por **norma/documento** e não por frases parecidas. Medir taxa de falso grifo, precisão/recall por cor, remissões incorretas e taxa de abstenção.

Duas referências externas sobre avaliação no Brasil (tarefas distintas): LegalBench-BR (classificação de decisões) e JurisBench-BR (busca jurídica). Não comparar números de acerto deles diretamente com este grifador.

**Homologação pendente:** PDF real no celular, exportação/reabertura, OCR e sincronização OAuth real não foram testados nesta etapa. Nenhum dado privado foi enviado ao GitHub.

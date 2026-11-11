# V086 — fluxo de seleção simples

**O que muda:** o usuário seleciona uma frase, trecho ou parágrafo no PDF; abre uma paleta; seleciona uma das seis cores; digita o assunto; opcionalmente informa disciplina e subassunto; clica **Salvar grifo**. Cor não cria grifo sozinha.

A seleção é mostrada temporariamente no PDF com fundo azul para revisão. Não é criada qualquer anotação até confirmação.

O grifo é persistido pela mesma API de V085 com ID individual. O assunto também fica salvo no objeto `subject_suggestion` e no cadastro da biblioteca `BM062_GRIFOS_META`; alteração de cor e assunto em grifo existente preserva ID, notas, cartões, tags, favoritos e histórico.

**Bloqueado:** o comando `bm070Smart`, a aplicação automática `bm070ApplyAuto`, o lote `bm081ApplyMulti` e modo rápido `bm068QuickToggle`. As preferências e registros prévios não são apagados.

**Limitação:** OCR não está presente para PDF sem texto selecionável. A V086 não chama API de IA, não envia conteúdo a terceiros e não usa a chave Claude anteriormente compartilhada. Testes estáticos e simulados não substituem clique real no Chrome/Android.

**Teste recomendado:** abrir Vade Mecum, página 12, selecionar “I – a soberania;”, selecionar laranja, informar assunto “Fundamentos da República”, salvar, fechar/abrir e editar o mesmo ID; testar desfazer, recarregar e Drive.

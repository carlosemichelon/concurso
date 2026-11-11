# V109 — Lei seca em quatro cores: maior abrangência com controle de precisão; Flashcards/Imagens mobile

Data: 11/11/2026. Base: V108, preservada em `backup/v108-before-precision-lei-seca-mobile-v109-2026-11-11`.

## Pedido
- Pesquisar métodos complementares de estudo de lei seca, **sem alterar as quatro cores** aprovadas.
- Ampliar regras linguísticas e normativas de classificação; priorizar precisão e evitar grifos desnecessários e blocos inteiros.
- Melhorar a apresentação de Flashcards e Imagens no celular e compactar blocos grandes e pouco usados no início.

## Fundamentação externa
1. LC 95/1998, arts. 10 e 11: a unidade é o artigo; parágrafos complementam o caput e podem conter exceções; incisos/alíneas expressam discriminações/enumerações. **Alínea não é sinônimo de exceção**. Fonte legislativa: https://www2.camara.leg.br/legin/fed/leicom/1998/leicomplementar-95-26-fevereiro-1998-363948-normaatualizada-pl.html
2. Dunlosky et al. (2013), Improving Students’ Learning with Effective Learning Techniques, APS: grifos isolados têm baixa utilidade média; testes de recuperação e prática distribuída oferecem suporte mais amplo. https://www.psychologicalscience.org/publications/journals/pspi/learning-techniques.html
3. Donoghue e Hattie (2021), metanálise das 10 técnicas de estudo: reforça o uso de marcações combinadas com prática de recuperação, explicação e revisão distribuída. https://doi.org/10.3389/feduc.2021.581216
4. Manual de técnica legislativa, Scottish Parliamentary Counsel: explicitar proposição principal, separando circunstâncias, exceções e qualificações. Referência de redação e estrutura (não é lei brasileira): https://www.gov.scot/publications/drafting-matters-2016-guidance/pages/2/

## Metodologia aplicada à lei seca — quatro cores exatas
- **Amarelo (#FDE68A)** = O quê? Núcleo de direito/dever/permissão/proibição, definição, consequência e negativa que o modifica. Ex.: “não poderá”; “é vedada”; “é facultado”; “serão indeferidos”.
- **Verde (#BBF7D0)** = Quem? Agente, autoridade, destinatário, competência e atribuição. Ex.: “Compete ao Município”; “a autoridade competente”.
- **Azul (#BAE6FD)** = Em que condição? Prazo, percentual, limite, quantidade, marco inicial, condição/hypótese/requisito. Ex.: “no prazo de trinta dias”; “mediante decisão fundamentada”; “se houver...”.
- **Rosa (#FECDD3)** = Salvo o quê? Ressalva, dispensa, exceção ou não aplicação expressa. Ex.: “salvo...”, “ressalvados...”, “não se aplica”, “serão dispensados”.
- **Sem quinta cor.** Ênfase tipográfica ou nota com erro anterior continua sendo um recurso distinto de cor, conforme a metodologia existente; não adiciona cor.
- **Parágrafos, incisos e alíneas não recebem rosa só por sua forma**. Uma enumeração pode descrever direitos, sujeitos, condições ou exceções, dependendo de seu texto.

## Fluxo pedagógico sem alterar o SRS
1. Identificar título, art./caput, parágrafo, inciso, alínea, remissões; contexto legal antes de marcar.
2. Ler e separar agente, comando, condição e exceção usando quatro perguntas; preservar negativas, quantificadores e sujeito correto.
3. Marcar preferencialmente a menor sequência de palavras que mantém a compreensão. Não pintar um parágrafo todo quando o classificador só reconhece parte.
4. Transformar os núcleos importantes em perguntas de recuperação (“quem?” / “o que?” / “em que hipótese?” / “qual exceção?”), sem criar cartões automaticamente; revisar pelas regras SRS existentes.
5. Comparar exceções, revogações, vigência e remissões no texto oficial vigente antes de validar resposta ou grifo.

## Engenharia V109
- `assets/v109_classificador_lei_seca.js`: reconhecimento estrutural por tokens normalizados, retângulos de palavras e prioridade **rosa → azul → verde → amarelo**. Prioridade não é importância: evita que um mesmo conjunto de letras receba cores conflitantes. Interrompe regiões em pontuação, novo núcleo e marcadores legislativos. Limitador de trechos e proteção contra rótulos de inciso/alínea.
- Cobertura ampliada para sujeito administrativo, permissão/direito, obrigação/proibição com negação, responsabilidade, definição, concessão/indeferimento, prazos numéricos e por extenso, limites, hipóteses, condicionantes e dispensas. “Foi salvo” não é ressalva.
- `analyzeWords` devolve `segments`, `review`, `coverage`, motivo evidencial e confiança. Marcadores de **alta confiança** são elegíveis ao grifo rápido; sugestão **média** fica sem marcação automática e recebe aviso de revisão. Se nada seguro é detectado, o usuário escolhe manualmente a cor ou refaz a seleção (V108), sem cor padrão indevida. **Mesmo alta confiança é heurística e não valida a norma**.
- `assets/v109_grifador.js`: aplica no máximo os núcleos seguros, sem abrir automaticamente a janela flutuante depois do salvamento; aponta quantos trechos ambíguos foram deixados de lado; seleção manual permanece.
- `assets/pdf_v109.js`: novas marcações guardam `classification_confidence` e `classification_evidence` para futura auditoria; não recolore/regrava antigas e mantém V108 (exclusão reversível), V106 (Multiply), V105 (rolagem lateral), V104 (zoom com pinça e Desfazer).
- Atribuição de disciplina/tema: adicionadas referências explícitas a LC 95, CF, improbidade, processo administrativo, LRF, LAI, LGPD, regime federal, atendimento ao usuário, inclusão, direito ambiental, saneamento, resíduos, NR-1/17 e NBR 9050. Trata-se somente de **sugestão**, não de interpretação legal definitiva.

## Flashcards e Imagens em telas pequenas
- `assets/v109_mobile_library.js`: bloco hero+estatísticas recolhido em **Visão geral e números do acervo**, sem remover números; filtros extras recolhidos enquanto pesquisa, contagem e cartões permanecem acessíveis. Mantém os mesmos nós HTML/IDs e eventos; no computador restaura os filtros originais. As informações técnicas das imagens passam a painel recolhível no celular (aberto no desktop).
- `assets/v109_mobile_library.css`: cards mais densos, botões tocáveis com mínimo de cerca de 41px, perguntas no topo sem cortar respostas, miniaturas de pranchas com `object-fit:contain` **sem recorte**, resumo visual acessível sob demanda, e sem alterar os editores PDF e de imagem.

## Testes concluídos
- **36 casos de regressão** de lei seca: amarelo/verde/azul/rosa, negação, competência, data, prazo por extenso, dispensa, enumeração, “salvo” não jurídico, “caso a caso”, ausência de evidência, controle de falso positivo.
- **9 casos de disciplina/assunto** (8 explícitos e um genérico sem sugestão).
- Integração simulada: 4 núcleos seguros em um parágrafo; um agente de confiança média não recebeu grifo automático; seleção sem núcleo seguro acionou caminho manual; nenhuma quinta cor.
- Teste simulado de DOM: cabeçalho de estatísticas recolhido no celular, pesquisa sempre visível, selects movidos para Filtros, retorno ao desktop com controles/IDs originais e orientações novamente visíveis.
- Sintaxe JS/CSS, montagem do HTML V109, verificação de 72 PDFs, catálogo de 270 imagens, flashcards, Atlas, SRS e arquivo mestre Drive inalterados.

## Limites
A classificação é heurística **local**, não leitura jurídica infalível nem verificação de vigência; PDFs escaneados sem texto selecionável continuam sem OCR. O ato de classificar e grifar segue sob controle do estudante. A interface em Android/iOS precisa ser testada visualmente; o Google Drive não foi homologado por esta atualização. Sem alterações de SRS, IDs, dados persistentes ou das quatro cores originais.

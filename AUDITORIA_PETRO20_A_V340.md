# Auditoria de conformidade com a Metodologia Mestre v014 — Petrobras 20 a Petrobras 26

**Data da auditoria de publicação:** 21/11/2026. **Escopo:** deltas públicos no GitHub `gh-pages` V267, V276, V277, V325, V334, V335, V336, V337, V338, V339 e V340; Metodologia Mestre vigente no Drive. **Não** foram relidas integralmente todas as mensagens privadas nem verificado cada cartão no navegador com autenticação.

## Resultado auditável

- **124 IDs distintos** foram criados, evoluídos, associados ou tiveram apresentação alterada nos deltas examinados. Esse número **não** significa 124 cartões novos.
- **21 desses IDs** têm comprovação no pacote público V339 ou V340 de **anotações semânticas e diagrama derivado vinculado por ID** (18 na V339, quatro na V340, com sobreposição em CARD-0751).
- **103 IDs** não têm essa prova nos incrementos visuais V339/V340 e exigem cotejo direcionado com outros leitores, versões e Atlas. **Não** se deve afirmar que 103 não possuem imagens: apenas a confirmação desses vínculos específicos ainda não foi obtida.
- **Três IDs atuais** (CARD-0751, CARD-0752 e CARD-0753) têm o **original enviado pelo estudante** associado no pacote V340 por ID, hash e link restrito de Drive. CARD-1559 recebe o esquema derivado, porque a tabela original trata de peneiras, não é uma figura original da classificação de pedregulhos.
- **43 IDs** têm evidência estrutural de 11 módulos nos pacotes selecionados. Módulos presentes não comprovam, sozinhos, cobertura técnica de todos os 11 critérios ou renderização correta.
- **Zero** testes reais de browser autenticado e **zero** sincronizações SRS privadas foram realizados como parte desta auditoria; não inventar essas etapas.

## Evidências por versão

| Pacote | Universo auditado | Evidência / lacuna |
|---|---:|---|
| V267 — Petrobras 20 | 19 IDs | Acréscimos parciais em módulos de domínios, concreto e relacionados; reter originais, conferir a profundidade dos módulos ativos e imagens por questão |
| V276–V277 — Petrobras 22 | 4 IDs distintos | CARD-1534 e três relacionados, efeitos do leitor V333 e MathML; cotejo de imagens originais permanece específico por assunto |
| V325 — Petrobras 23 | 66 IDs distintos | Três novos, 35 aprimoramentos de explicação e 40 operações de vínculo; vinculação à mídia privada não é demonstrada por essas contagens |
| V334 — Petrobras 25 | 5 IDs | Um cartão novo com 11 módulos e quatro relacionados; imagens precisam conferência em registro do cartão |
| V335–V336 — Petrobras 25 | 14 IDs | Respostas discursivas nos 14 perfis V336; 10 com fórmulas referidas e 12 com tabela; originais/figuras e grifos por ID ainda sem auditoria visual completa |
| V337 — Petrobras 26 | 19 IDs | 19 perfis com 11 módulos; **sem campo de mídia diretamente incorporada aos perfis**; renderer oferecia ênfase em negrito, não a paleta semântica completa |
| V338 — Petrobras 26 | 18 IDs | 18 perfis com 11 módulos, mas sem campo de mídia no delta de conteúdo; leitura foi melhorada por V339 |
| V339 | 18 IDs | 73 marcas semânticas, nove desenhos vetoriais usados nos 18 versos, cinco tabelas e fórmulas MathML em seis cartões; imagens ORIGINAIS privadas ainda não associadas nesses perfis |
| V340 | 4 IDs | Um cartão novo CARD-1559 e evolução de 0751/0752/0753, diagrama A4 P&B em todos e imagem original privada ligada aos três cartões de peneiras; sem alterar SRS |

## Questões de granulometria da conversa

**PETRO26-GRAN-01:** pedregulho grosso = 20–60 mm; resposta correta D e erro real E (pedra-de-mão = 60–200 mm). **CARD-1559** criado. O guia completo em A4 está no portal e no Drive.

**PETRO26-GRAN-02:** 10 peneiras normais e 6 intermediárias, resposta correta E. **CARD-0752** e **CARD-0753** evoluídos SEM recriação de IDs; CARD-0751 reforça a comparação entre séries e classificação. Imagem original do usuário preservada em:
https://drive.google.com/file/d/1FQBIKei7Se63h8ps2kS0qvr037sfMhru/view

Guia derivado (público):
https://github.com/carlosemichelon/concurso/blob/gh-pages/assets/card_visuals_v340/escala_granulometrica_A4.svg

Mídia: original `IMG-PETRO26-NM248-TAB1-01`, SHA-256 `6d742f1adfa0dce2fd0428f2503f00845f5c58fbb8b2e25b376c0acebfc7baa4`; derivado `IMG-PETRO26-ESCALA-A4-01`, SVG com SHA-256 `372b20f2345c3e0d54bec64a52137cbf203d60f92491ed553e7aba0af19d13df`. O original NÃO foi reproduzido como bytes em GitHub.

## Critério de fechamento e risco residual

Uma ficha só será considerada **completamente conforme** após verificar sua pergunta e resposta-modelo, explicação causal, 11 critérios internos, vínculos, normas e unidades, grifos nas quatro categorias, negritos por erros reais, imagens originais e desenhos associados quando existirem, tabelas e matemática nativa quando necessárias, e preservação de histórico/SRS. Apenas passar pela verificação estrutural de JSON **não substitui** a validação de imagem no navegador nem comprova o conteúdo dos arquivos privados.

**Pendente, em ordem de impacto didático:** cotejar imagens originais de Petrobras 20–25 no Atlas por questão e ID; verificar se os esquemas já produzidos aparecem nos próprios cartões; auditar conteúdo de domínios/traspasse/fundações e demais erros reais; aplicar grifos semânticos aos IDs ainda não cobertos; testar modos Estudo/Revisão sem revelar gabarito; conciliar a fonte canônica privada somente com snapshot atual, sem sobrescrever uma planilha histórica anterior.

**Arquivo auditável por ID:** [assets/auditoria_petro20_v340.json](assets/auditoria_petro20_v340.json).

**Portal:** https://carlosemichelon.github.io/concurso/v340.html · versão anterior preservada `v339.html`.

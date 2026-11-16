# Banco Mestre — Reauditoria técnica V199 (16/11/2026)

## Escopo e estados

Iniciada a reauditoria substantiva dos **1.490 cartões com 11 módulos** do portal público V196. A análise diferencia:

1. **Triagem automatizada:** identifica indícios por extensão, estrutura, figuras e expressões textuais. Não confere a correção do gabarito nem a vigência normativa.
2. **Cotejo técnico pontual:** examina parte relevante da norma/fontes para os IDs indicados, valida exemplos, complementa os módulos sem substituir textos anteriores.
3. **Homologação integral:** requer fonte e edição vigentes, enunciado e imagens originais, cálculo independente, auditoria de abrangência/especificidade, revisão editorial e eventual autorização de incorporação canônica. **Não concluída para nenhum conjunto de 1.490 cartões nesta etapa.**

A existência de 11 seções e um quadro de consulta não constitui homologação didática, normativa ou documental.

## 1. Inventário de todos os cartões

Arquivo machine-readable com registros e flags por ID:
[`docs/V199_TRIAGEM_TECNICA_1490_2026-11-16.json`](V199_TRIAGEM_TECNICA_1490_2026-11-16.json)

| Prioridade | Critério de triagem (heurístico) | Cartões |
|---|---|---:|
| P0 | Textos com alerta documental explícito ou menção a croqui/figura a conferir | 134 |
| P1 | Menos de 220 palavras no conjunto ou 5+ módulos com menos de 20 palavras | 524 |
| P2 | 220–449 palavras, sem indícios P0/P1 | 347 |
| P3 | 450+ palavras, sem indícios P0/P1 | 485 |
| **Total** |  | **1.490** |

Sinais textuais (podem ocorrer simultaneamente): 885 com tema comparativo/normativo sem tabela técnica; 556 com cinco módulos muito curtos; 427 sem termo indicativo de aplicação/exemplo; 370 com menos de 200 palavras; 288 com referência normativa sem URL explícita; 125 com alerta documental textual; 22 com menção a figuras/croquis a conferir. **Não equivalem a 885 erros ou 288 fontes falsas.**

## 2. Primeiro lote de conteúdo realmente aprofundado

Adendos versionados e independentes do canônico:
[`assets/v199_reauditoria_adenda_5_cartoes.json`](../assets/v199_reauditoria_adenda_5_cartoes.json)

| Cartão | Objeto do cotejo | Aprofundamento acrescentado | Estado |
|---|---|---|---|
| CARD-0751 | MF × DMC × solo | Mecânica da retenção, exemplo fechado, limites de ensaio, matriz comparativa, precisão documental | Cotejo pontual NBR 17054:2022 |
| CARD-0752 | Dez peneiras normais, MF | Tabela de 1.000 g com r_i/R_i e MF=2,75; balanço e erros de cálculo | Cotejo pontual NBR 17054:2022 |
| CARD-0753 | Seis peneiras intermediárias | Intercalação por faixa, DMC com/sem intermediária, exceções | Cotejo pontual NBR 17054:2022 |
| CARD-0754 | Limite de 5% da DMC | Três cenários numéricos monotônicos, regra de seleção e falsos critérios | Cotejo pontual NBR 17054:2022 |
| CARD-1001 | Consolo pré-moldado | Biela/tirante/ancoragem, regime a/d, cálculo As,tir≈232,18 mm², quadro de verificações | Cotejo pontual NBR 9062:2017; execução integral pendente |

Os quatro cartões de granulometria foram cotejados com a **NBR 17054:2022 (itens 3.1–3.3, 5.1, 6.1 e 7.1–7.2)**, consultada em:
https://sistema.ceteclins.com.br/Uploads/PDF/22A0B4B2-7A63-4172-B14F-ECE6C59128A2_06072022155025.pdf

O **CARD-1001** foi cotejado com a **NBR 9062:2017 (7.3.3–7.3.9, especialmente 7.3.5.3, 7.3.5.5)**, consultada em:
https://professor.pucgoias.edu.br/sitedocente/admin/arquivosUpload/14026/material/NBR9062_2017.pdf

As demonstrações são **didáticas, não dados reais de um projeto ou ensaio**. A aplicação completa da NBR 6118 ao caso particular ainda depende de informações e conferência da edição aplicável.

### Normas que exigem atualização e cotejo posterior

- NBR 7181:2025 para análise granulométrica de solos: fontes técnicas reportam erratas e versão corrigida em 2026; não confundir com NBR 17054:2022 de agregados. Situação de catálogo primário ainda a verificar para adendos dependentes de edição.
- NBR 7211:2022: escopo não abrange genericamente subprodutos industriais como agregados convencionais; importante em CARD-0755/0756 (não reescritos).
- NBR 8419:1992 Versão Corrigida:1996 (projeto de aterros) ≠ NBR 10004-1/2:2024 (classificação de resíduos): requer ajuste fundamentado em CARD-0760, inclusive regime de transição quando o órgão regulador o determinar (não reescrito).

## 3. Garantias técnicas

- Os lotes públicos históricos `assets/layers_public_v194_000.json` a `006.json` não foram sobrescritos.
- O leitor monta os adendos V199 **após** o texto de cada módulo, preservando seu prefixo literal, o ID e a estrutura de onze seções.
- Os 11 cartões reservados continuam sem camadas novas.
- Nenhum registro, classificação ou calendário do SRS foi escrito.
- O quadro informativo V198 continua sendo síntese visual, **não a auditoria técnica**.
- Em caso de indisponibilidade da fonte V199, mostrar apenas o conjunto histórico com aviso, sem apagar o verso.
- Testes locais: 5/5 adendos renderizados, 11/11 módulos mantidos por cartão, quadro visual e tabela específica presentes, exemplo de MF=2,75 e As≈232,18 mm² conferidos.

## 4. Pendências para conclusão real

1. Examinar todos os P0 individualmente; parte deles contém resultado que não pode ser confirmado sem croqui, alternativas ou dados da questão.
2. Reescrever os P1 por disciplina, priorizando 0751–1250, com fonte verificável, mecanismo, exemplos e análise de pegadinhas.
3. Auditar P2/P3 quanto à verdade técnica e vigência normativa; textos longos também podem conter erro.
4. Integrar achados de Petrobras Parte 14 à trilha por cartão apenas após vincular as questões, imagens, alternativas e aprovações aos IDs corretos.
5. Homologar conteúdo integral no nível Petrobras 14, preservando históricos e estados separados entre aprovado, publicado, exibido e SRS.

**Esta etapa não deve ser comunicada como “1.490 cartões reauditados tecnicamente”. A afirmação correta é “1.490 triados; 5 com adendos técnicos conferidos pontualmente”.**

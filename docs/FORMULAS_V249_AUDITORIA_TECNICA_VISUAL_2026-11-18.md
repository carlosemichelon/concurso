# Auditoria do Guia de Fórmulas e leitor do portal — V249

**Data:** 18/11/2026 · **Âmbito:** leitura técnica e estática da apresentação; **fonte canônica:** Google Docs «Estruturas – Fórmulas, Vigas e Análise Estrutural» (ID \`1eOla5S9In1LTB6IJkJPLmP8mQfM2P2urk33jgCYam5M\`). **Metodologia:** v014 da Metodologia Mestre, consultada na mesma execução.

## Estado das camadas
- Fonte original no Google Drive: **lida, preservada e não alterada**.
- Interface V249: nova composição visual, sem persistência do texto do guia no repositório, sem alteração de IDs, cartões ou SRS.
- Publicação GitHub Pages: arquivos adicionados ao ramo \`gh-pages\` e versão manifestada; acesso público HTTP, OAuth real e teste visual em navegador/celular **não homologados** no ambiente.
- Conteúdo normativo: avaliação técnica preliminar, **não certificação** nem aprovação editorial de alterações no documento-base.

## Auditoria técnica por seção

| Seção | Observação verificável | Encaminhamento |
| --- | --- | --- |
| 1. Roteiro de vigas | Equilíbrio global, cortes, relação \`dV/dx=-q\`, \`dM/dx=V\` e rótula interna corretos na convenção declarada implicitamente. | Explicitar a convenção do sinal de \`q,V,M\` ao ampliar o guia. |
| 2. Casos clássicos | Reações, flechas e momentos dos casos apresentados foram inspecionados e não revelaram erro de fórmula na hipótese linear-elástica. | Ampliar o caso biengastado com \`q\`: \`M_{\mathrm{meio}}=qL²/24\` (positivo), \`R_A=R_B=qL/2\`, mantendo \`M_{\mathrm{apoio}}=-qL²/12\`; não reproduzir fórmulas em novas seções sem necessidade. |
| 3. Resistência dos Materiais | \`I=bh³/12\`, \`W=bh²/6\`, \`σ=M/W\`, \`τmax=1,5V/A\`, deformação axial e unidades dimensionalmente coerentes. | Indicar hipóteses da seção retangular homogênea e da fórmula simplificada de cisalhamento. |
| 4. Análise matricial | Relação \`{F}=[K]{D}\` e matriz axial local 2×2 adequadas para barra axial com dois GDL. | Distinguir barra axial de elemento de viga/pórtico e deslocamentos impostos; **classificação de interface corrigida para análise estrutural**. |
| 5. PTV e Cross | Definições conceituais corretas. | Incluir \`δ=\int(Mm/EI)dx\` para flexão, unidades e um caso de aplicação; em Cross, rigidezes relativas, fatores de distribuição e transporte de momentos. |
| 6. Treliças | Método dos nós e convenção da tração corretos, porém incompletos para a metodologia do usuário. | Acrescentar abordagem **Ritter/seções**, escolha do corte, equilíbrio e braços de alavanca quando houver aprovação editorial. |
| 7. Círculo de Mohr | Centro e raio corretos para \`σ1≥σ3\`. | Acrescentar \`τmax=(σ1−σ3)/2\`, orientação de planos, convenções de sinais e aplicações pertinentes. |
| 8. Flambagem de Euler | \`Pcr=π²EI/(KL)²\` correta para coluna ideal elástica. | Explicitar \`I_{\min}\`, comprimento efetivo, condições de contorno, esbeltez e limite de validade. |
| 9. Adendo | Preserva histórico e identifica edição de 2014. | Manter; não substituir a edição normativa automaticamente. |
| 10. Mr e ELS | \`Mr=αfctIc/yt\`, α históricos, definições e relações dimensionais conferidos com a **NBR 6118:2014**, item 17.3.1. | Manter etiqueta **edição 2014** e separar de prescrições vigentes de 2026. Cálculo independente: \`Ic=0,00208333 m⁴\`; \`Wt=0,00833333 m³\`; \`fctm=2,89647 MPa\`; \`fctk,inf=2,02753 MPa\`; \`Mr(ELS-DEF)=36,2059 kN·m\`; \`Mr(ELS-F)=25,3441 kN·m\`. |
| 11. Flexão e linha neutra | Flexão elástica, módulo resistente, flexão composta e distinção entre estádio I e II descritas de forma conceitualmente consistente. | Acrescentar diagramas de tensões/deformações e seção fissurada quando o conteúdo for autorizado. |
| 12. Geometria | \`A\`, \`Ix\`, \`Wx\`, inércia do círculo, \`J\`, Steiner, raio de giração e unidades compatíveis. | Distinguir explicitamente o momento polar geométrico de \`J\` torsional em seções não circulares. |
| 13. Isostática | Casos clássicos, reações e flechas dimensionais coerentes; hipóteses de EI constante anotadas. | Deduplicar referências remissivas com a seção 2 e adicionar diagramas funcionais de V/M e casos com carregamento combinado. |
| 14. Aço e estabilidade | \`σ=N/A\`, \`σ=M/W\`, \`τ=VQ/(Ib)\`, \`My=fyWel\`, \`Mp=fyZpl\`, Euler: expressões gerais, com ressalvas corretas quanto a resistência de cálculo. | Distinguir teoria geral de critérios da **ABNT NBR 8800:2024, Versão Corrigida:2025**; não transplantar limites da edição de 2008 ou fatores ausentes. |
| 15. Térmica e concreto | \`ΔL=α_T L ΔT\` e \`C=T\`, \`M=Cz=Tz\` dimensionalmente coerentes. | Aproximação de rigidez fissurada da NBR 6118:2014 está apenas **descrita**, não transcrita integralmente; não utilizá-la como fórmula pronta de cálculo sem consultar a edição correta. |
| 16. Índice e evolução | Preserva origem de referência e distingue guia/cadastro/SRS. | Auditar existência, edição e cobertura direta/indireta dos IDs de cartões contra a base canônica antes de afirmar integração. |

## Evidências externas de edição normativa

- ABECE, «NBR 6118 tem emenda publicada pela ABNT»: https://site.abece.com.br/nbr-6118-tem-emenda-publicada-pela-abnt/
- ABECE, «NBR 8800 tem versão corrigida publicada»: https://site.abece.com.br/nbr-8800-tem-versao-corrigida-publicada/
- Catálogo ABNT, pesquisa NBR 8800: https://www.abntcatalogo.com.br/
- A edição histórica 2014 é citada explicitamente na fonte. A ABNT NBR 6118:2023 recebeu a Emenda 1:2026. **Isto não comprova que os itens citados permaneçam idênticos entre edições.**

## Auditoria de interface e correções V249

**Problemas identificados na V248:** apresentação monolítica em elemento \`pre\` com fonte 13 px no computador / 12 px no celular; fórmulas e notas com mesmo estilo; ausência de salto para seção por número/título; seção 4 («Análise Matricial») classificada genericamente como Resistência dos Materiais; alerta de edição normativa sem destaque no início da listagem.

**Medidas implementadas na interface V249:**
1. Cada linha da fonte é exibida sem alterar suas palavras em um contêiner semântico; fórmulas, subtítulos, notas, passos e alertas recebem estilos distintos. O documento é renderizado com \`textContent\` em vez de HTML da fonte.
2. Aumento da legibilidade para 14–15 px nas linhas corridas e fórmulas no desktop; 13 px no celular, espaçamentos, bordas, quebra de linhas, foco teclado visível.
3. Lista de navegação direta que abre uma seção, limpa filtros conflitantes e desloca a página até o item.
4. Correção da classificação «Análise Matricial» como parte de «Vigas, treliças e análise estrutural».
5. Aviso explícito sobre edições normativas históricas, sem inventar vigência de uma fórmula.
6. Leitor preserva texto original na renderização, pesquisa sem acentos, seção expandida, verificação de revisões no Drive e rota direta \`#formulas\`.

## Testes realizados

- A fonte apresentou 16 seções numeradas, 1–16, + apresentação.
- Analisado o conteúdo de todas as 16 seções para aplicabilidade, unidades e lacunas; os cálculos independentes do exemplo \`Mr\` conferiram.
- Leitor V249: sintaxe JavaScript, parser, número de seções, categoria de Análise Matricial, pesquisa sem acentos, filtros, salto de seções por lista, preservação de texto (comparação textual sem espaços), renderização de 49 linhas reconhecidas como fórmulas e contagem dos demais tipos visuais.
- Teste anterior de conexão: token ausente, acesso negado simulado, mudança/no-change de metadados; **não equivale a OAuth no browser**.
- Limites: não foi possível obter resposta HTTP pública do GitHub Pages nem captura de tela real da versão no navegador; **auditoria visual estática e testes estruturais**, e não homologação visual móvel concluída.

## Pendências explícitas

1. Homologar a V249 em navegador real e Android, incluindo OAuth autorizado, contraste, scroll, pesquisa e botão de salto.
2. Aplicar conteúdo adicional no guia **após a auditoria editorial apropriada**, mantendo texto histórico e revisões; nenhuma substituição ou aprovação editorial foi inferida.
3. Auditar IDs e backlinks contra a base canônica viva; não elevar «LIGAÇÕES» a cartões integrados por mera citação do guia.
4. Conferir os dispositivos normativos atuais diretamente nas edições oficiais antes de inserir cálculos de projeto com valores e fatores normativos.
5. Registrar atualização separada do Drive somente quando executada e confirmada, preservando o estado de produção do material paralelo.

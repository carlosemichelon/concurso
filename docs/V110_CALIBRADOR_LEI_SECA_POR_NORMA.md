# Banco Mestre V110 — Calibrador de lei seca por norma

Data: 11/11/2026. Backup prévio: `backup/v109-before-law-calibrators-v110-2026-11-11`.

## Solicitação e objetivo
O estudante deseja escolher, para um PDF específico, um **calibrador de grifo pela lei estudada**, por exemplo Constituição Federal (CF/88). Conhecimento prévio da estrutura e da linguagem de cada norma deve complementar o classificador geral, mantendo **exatamente as quatro cores da metodologia vigente**.

## Modelo funcional
- `assets/v110_perfis_lei_seca.js`: motor de perfis que **complementa**, não substitui, o classificador V109. Cada perfil contém identificadores documentais estritos, expressões jurídicas típicas de quatro categorias, razões de classificação e uma pergunta de recuperação ativa. O motor geral continua sendo a base.
- `assets/v110_calibrador_ui.js`: seletor `Calibrador da lei` na barra lateral do PDF. Valor inicial **Geral**. Pode sugerir uma norma pelo título, mas **não ativa a sugestão sem confirmação do estudante**. Escolhas são guardadas no navegador por ID e hash do conteúdo PDF, sem sobrescrever escolhas de outros arquivos. Uma edição de PDF com hash diferente exige nova escolha.
- `assets/v110_grifador.js`: aplica ao trecho selecionado o perfil ativo, preserva a filtragem automática por alta confiança, deixa ambiguidades para revisão manual e acrescenta ao verso sugerido uma pergunta contextual de revisão. Em marcação manual, a cor escolhida é atribuída explicitamente à categoria confirmada pelo estudante.
- `assets/pdf_v110.js`: grifos **NOVOS** incluem `calibration_profile` e `calibration_evidence`; records existentes não são recalculados nem recoloridos. Esses campos trafegam junto com os grifos no arquivo mestre privado da V104. A **preferência do seletor**, por enquanto, é local de cada aparelho.
- `assets/v110_calibrador.css`: painel responsivo, com menu `select` de lei e detalhes recolhíveis, sem adicionar ícones grandes ou alterar o comportamento de scroll/zoom/gestos.

## Perfis disponíveis
| ID | Norma | Pistas contextuais fortes |
|---|---|---|
| `geral` | Geral | Comando, agente, condição e exceção, sem pressupor lei específica |
| `cf88` | Constituição Federal de 1988 | Direitos e garantias (“é livre”, “é assegurado”), competência expressa (“compete privativamente à União”), reservas/remissões (“nos termos da lei”, “na forma da lei”) e quóruns |
| `licitacoes` | Lei 14.133/2021 | Agente/comissão de contratação, sanções administrativas, dispensa/inexigibilidade, justificativas |
| `improbidade` | Lei 8.429/1992 | Agentes, tipificação, dolo e exclusões expressas (“não configura ato de improbidade”) |
| `estatuto` | Lei 10.257/2001 | Política urbana, plano diretor, Poder Público municipal, lei municipal e contrapartida |
| `servidores` | Lei 8.112/1990 | Deveres, proibições, servidor, autoridade, provimento e ressalvas |
| `processo` | Lei 9.784/1999 | Processo administrativo, autoridade, interessados, motivação |
| `lgpd` | Lei 13.709/2018 | Titular dos dados, agentes de tratamento, consentimento e hipóteses de dispensa |
| `lc95` | LC 95/1998 | Artigo, parágrafo, inciso e alínea; estrutura não equivale automaticamente a exceção |

## Quatro cores permanentes
- **Amarelo `#FDE68A`**: núcleo da regra, definição, comando, direito, dever e proibição.
- **Verde `#BBF7D0`**: agente, destinatário, competência ou responsabilidade.
- **Azul `#BAE6FD`**: condição, prazo, marco, limite, requisito, forma ou quórum.
- **Rosa `#FECDD3`**: exceção, dispensa, ressalva ou não incidência expressa.

O perfil **não introduz quinta cor**. As expressões específicas só geram grifos automáticos quando têm alta confiança lexical/estrutural e não contradizem núcleo existente; colisões sem inequívoca ressalva são encaminhadas à revisão. Perfil selecionado não afirma que a norma é válida, vigente ou interpretada corretamente. Indicações de cor não equivalem a solução de questão de concurso.

## Precisão e limites
- Um perfil selecionado fornece apenas **pistas contextuais lexicalmente verificáveis**, não a íntegra de uma lei nem interpretação semântica completa.
- Foi identificado no classificador geral que “**Não configura ato de improbidade**” podia perder a palavra **não** e virar regra afirmativa. O perfil de improbidade mantém a expressão negativa inteira, categorizada como hipótese de não caracterização. Essa prioridade específica só vale para exceções evidentes.
- Não classificar incisos e alíneas como exceções apenas pela numeração, conforme LC 95/1998. Não converter o termo “arquivo salvo” em ressalva legal.
- Perfis não eliminam a obrigação de conferir texto atualizado, alterações, revogações, vigência, artigo, caput, parágrafo e incisos.
- Não há OCR novo: PDFs sem camada de texto selecionável continuam exigindo seleção/manual ou obtenção de documento pesquisável.
- Não há mudança de SRS, cartões, IDs, metodologia canônica, paleta, grifos prévios ou arquivos de usuário.

## Fontes oficiais consultadas
- Constituição atualizada: Câmara dos Deputados, https://www2.camara.leg.br/atividade-legislativa/legislacao/constituicao1988
- Estrutura constitucional: Planalto, https://www4.planalto.gov.br/legislacao/legis-federal/constituicao
- Técnica legislativa: LC 95/1998, arts. 10–11, Câmara, https://www2.camara.leg.br/legin/fed/leicom/1998/leicomplementar-95-26-fevereiro-1998-363948-normaatualizada-pl.html
- Lei 14.133/2021, Planalto, https://www.planalto.gov.br/ccivil_03/_ato2019-2022/2021/lei/l14133.htm
- Lei 8.112/1990, Planalto, https://www.planalto.gov.br/ccivil_03/leis/l8112cons.htm
- Lei 9.784/1999, Planalto, https://www.planalto.gov.br/ccivil_03/leis/l9784.htm
- Lei 10.257/2001, Planalto, https://www.planalto.gov.br/ccivil_03/leis/leis_2001/l10257.htm

## Testes antes do envio
1. Compilação JS dos perfis, seletor, grifador e motor PDF; CSS equilibrado.
2. 20 frases de perfis e 11 casos de detecção de título: Constituição, licitações, improbidade, servidores, LGPD, LC 95, Estatuto da Cidade, processo, conflito de duas leis e arquivo genérico.
3. Testes especiais: “É livre a manifestação” no modo CF reconhecido; no modo Geral conservador; “Compete privativamente à União” reconhece expressão inteira; “Não configura ato de improbidade” mantém o **não**; dispensa e inexigibilidade como rosa.
4. UI simulada: sugestão somente com confirmação, salvamento por PDF+hash, troca de documento, restauração de preferência, hash alterado começa em Geral, seletor desabilitado sem PDF, sem escrita no banco de grifos.
5. Fluxo real de commit simulado: dados de perfil e justificativa seguem na marcação; escolha manual continua expressa; nenhuma quinta cor.
6. Composição do HTML V110 e regressão de catálogo, Grifos V108, zoom/rolagem V105, biblioteca móvel V109, SRS e Drive V104.
7. **Pendente**: homologação visual no navegador real Android e validação OAuth Drive entre aparelhos; testes simulados não comprovam sincronização real.

## Preservação
Backup da árvore de código V109. Sem remoção de arquivos anteriores. `assets/version.json` mantém totais: 72 PDFs, 270 imagens e 1494 cartões base.

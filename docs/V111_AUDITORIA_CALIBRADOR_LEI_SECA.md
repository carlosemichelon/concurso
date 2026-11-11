# V111 — Auditoria ampliada e calibração jurídica por norma

**Data:** 11/11/2026  
**Origem:** V110, preservada na ramificação `backup/v110-before-regression-calibration-v111-2026-11-11`  
**Escopo:** somente scripts de calibração/classificação, UI do seletor e whitelist de proveniência dos grifos novos. Dados, SRS, Flashcards, PDFs e grifos existentes inalterados.

## 1. Objetivo
Aprofundar os testes e a calibração do grifador de lei seca, que é uma ferramenta de **sugestão** com **quatro cores fixas**, e não um intérprete jurídico infalível. Um perfil não comprova sozinho a atualidade, a origem nem a validade da norma; a versão vigente do PDF deve ser conferida pelo estudante.

## 2. Principais erros encontrados na V110
No primeiro teste adversarial de 16 frases ocorreram **10 falhas**: “não é dispensável” detectado como dispensa, “não é livre” como afirmação de liberdade, tentativa de unir expressões separadas por pontuação, e “não configura” interpretado sem a negação. Essas falhas motivaram novos critérios de segurança.

## 3. Correções implementadas
- **Negação:** não, nem, nunca, jamais e tampouco são inspecionados antes da expressão. Uma regra afirmativa não deve ser aplicada automaticamente ao predicado negado. Uma regra realmente negativa como “não deverão ser motivadas” continua **amarela**, preservando o “não”. A hipótese explícita “não configura ato de improbidade” é **rosa** como não caracterização.
- **Pontuação:** frases separadas por `.`, `;`, `!` ou `?` não são unidas para compor falsos núcleos jurídicos. “É; assegurado” não é reconhecido como “é assegurado”.
- **Fim do núcleo:** interromper a extensão da condição ao encontrar novo verbo de comando ou nova negação. Assim “sem prévia autorização” é azul e “não poderá” é amarelo, em **trechos distintos**, sem sobreposição.
- **Falsos positivos narrativos:** usos como “o documento foi assegurado no sistema” não recebem automaticamente o mesmo tratamento de garantia legal normativa.
- **Sujeitos sem verbo:** “agente de contratação”, “poder executivo” e nomes semelhantes podem ser candidatos a verde, mas sem contexto de comando jurídico passam para revisão manual. Um sujeito expressamente ligado a um dever, como “É dever do Estado”, pode ser separado em amarelo “É dever” e verde “do Estado”.
- **Conflitos:** uma negação jurídica explícita pode substituir uma sugestão afirmativa genérica sobre a mesma sequência. Revisões genéricas inteiramente resolvidas pela expressão específica não geram aviso redundante.
- **Sugestão vs. certeza:** apenas trechos de alta confiança são candidatos ao grifo automático. Sugestões conflitantes, imprecisas ou apenas nominais são encaminhadas para revisão; não se grifa o parágrafo inteiro por falta de evidência.
- **Interface:** aviso quando o perfil escolhido difere da lei sugerida pelo título. Falha ao guardar preferência no armazenamento local impede falsa indicação de sucesso. Atualização de preferência em outra aba do mesmo navegador passa a ser respeitada.

## 4. Perfis disponíveis (13)
**Geral** + **CF/88**, **Lei 14.133/2021**, **Lei 8.429/1992**, **Lei 10.257/2001**, **Lei 8.112/1990**, **Lei 9.784/1999**, **Lei 13.709/2018**, **LC 95/1998**, e os quatro perfis novos:

1. **Lei 12.527/2011 — Lei de Acesso à Informação (LAI):** dever de transparência, agentes, prazos de atendimento e exceções expressas por sigilo. O texto oficial usa “independentemente de requerimentos” e prazo “não superior a 20 (vinte) dias”; ambos receberam expressões calibradas.
2. **LC 101/2000 — Lei de Responsabilidade Fiscal (LRF):** metas, condições, limitações, dever de transparência, vedações e nulidades.
3. **Lei 13.146/2015 — Lei Brasileira de Inclusão (LBI):** direito e titular, igualdade de condições, atendimento e proibições.
4. **Lei 6.938/1981 — Política Nacional do Meio Ambiente (PNMA):** órgãos, instrumentos de política ambiental, licenciamento e condicionantes.

Os perfis já existentes também ganharam expressões mais específicas: CF (competências dos órgãos constitucionais, reserva legal e quóruns), licitações (gestor, contrato, comprovação), improbidade (elemento subjetivo, comandos negativos e conduta), servidores (autorização prévia e deveres), processo administrativo (motivação, caução), LGPD (titular, consentimento e hipóteses), Estatuto da Cidade (lei municipal), LC 95 (articulação, vigência e revogação).

## 5. Quatro cores canônicas — invariáveis
| Cor | Hex | Pergunta |
|---|---|---|
| Amarelo | `#FDE68A` | O quê? Regra, dever, direito, comando, proibição, negação normativa |
| Verde | `#BBF7D0` | Quem? Sujeito, agente, competência, destinatário |
| Azul | `#BAE6FD` | Em que condição? Prazo, requisito, limite, hipótese |
| Rosa | `#FECDD3` | Salvo o quê? Ressalva, dispensa ou não incidência expressa |

A numeração de inciso, alínea ou parágrafo **não determina uma cor por si só**. A LC 95/1998 distingue regra principal, complemento e enumerações; as funções jurídicas dependem do conteúdo.

## 6. Testes executados
Arquivo de testes persistente: `assets/v111_calibrador_qa.js` (não carregado no site, usado para auditoria).

- **200 cenários funcionais**: 107 casos positivos, 66 negativos/adversariais e 27 títulos para reconhecimento da lei — todos aprovados.
- **190 verificações estruturais**: integridade de retângulos, sobreposição, paleta, perfis válidos, limites e rejeição de seleções inválidas — todas sem falha.
- Testes com negativos e pontuação: “Não é dispensável”, “Jamais constitui”, “É. livre”, “Compete. aos Municípios”, “foi assegurado”, “salvo” como arquivo e enumerações não normativas.
- **Integração com o editor**: CF/88 reconhece núcleo amarelo; LAI separa comando amarelo e agente verde; improbidade preserva “não configura” em rosa; negação da dispensa não recebe rosa; ausência de núcleo mantém seleção manual; sucesso não abre menu repetidamente.
- **UI simulada**: 13 opções, sugestão que exige confirmação, preferência salva por PDF+hash, recuperação de escolha anterior, não reutilização quando muda hash, alerta de perfil divergente, tratamento de armazenamento indisponível, evento de mudança entre abas e controle desabilitado sem PDF.
- **Regressões de acervo**: motor de PDF, zoom por pinça, rolagem horizontal, edição/exclusão reversível, classificador com quatro cores, SRS, cards, imagens, catálogo PDF e arquivo mestre privado no Drive.

**Comparação descritiva, não controlada:** no conjunto V111 de 200 casos, a V110 passou 128 e a V111 passou 200. A comparação **não é taxa geral de precisão**, porque a bateria inclui quatro perfis que não existiam na V110 e exemplos usados na própria calibração. Não extrapolar isso para leis/PDFs não testados.

## 7. Fontes oficiais consultadas
- Constituição Federal, texto atualizado na Câmara: https://www2.camara.leg.br/atividade-legislativa/legislacao/constituicao1988
- LC 95/1998, redação oficial dos arts. 10–11: https://www2.camara.leg.br/legin/fed/leicom/1998/leicomplementar-95-26-fevereiro-1998-363948-normaatualizada-pl.html
- Lei 14.133/2021, Planalto: https://www.planalto.gov.br/ccivil_03/_ato2019-2022/2021/lei/l14133.htm
- Lei 8.112/1990, Planalto: https://www.planalto.gov.br/ccivil_03/leis/l8112cons.htm
- Lei 12.527/2011, Planalto: https://www.planalto.gov.br/ccivil_03/_ato2011-2014/2011/lei/l12527.htm
- LC 101/2000, Planalto: https://www.planalto.gov.br/ccivil_03/leis/lcp/lcp101.htm
- Lei 13.146/2015, Planalto: https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2015/lei/l13146.htm
- Lei 6.938/1981, Planalto: https://www.planalto.gov.br/ccivil_03/leis/l6938.htm
- LGPD, versão oficial atualizada na Câmara: https://www2.camara.leg.br/legin/fed/lei/2018/lei-13709-14-agosto-2018-787077-normaatualizada-pl.html

## 8. Limites e próximos pontos de homologação
A suíte é **heurística e sintética**, ainda não mede sensibilidade/especificidade num corpus representativo de grifos reais. Em PDFs escaneados ou com extração de texto defeituosa, a classificação pode não reconhecer as expressões. Em caso de ambiguidade, preservar decisão manual e consultar o dispositivo oficial vigente. Não afirmar homologação visual em Android/iOS ou sincronização OAuth real somente pelos testes de código.

Preferência de perfil é salva **localmente em cada aparelho**, vinculada ao PDF e hash do conteúdo. A proveniência dos novos grifos segue junto ao registro para o arquivo mestre quando a sincronização do Drive for concluída. Nenhum cartão, registro SRS ou grifo antigo deve ser alterado pela calibração.

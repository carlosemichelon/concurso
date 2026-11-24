# V369 — manutenção administrativa: retomada incremental e testes históricos

Sem alteração do portal, dos cartões, do SRS, das imagens ou do catálogo. Sem nova versão visual.

## Encerramento de estudo por lote
- Lote exclusivamente privado (SRS, lacunas, anotações privadas): definir targets = ["drive"]. Não publicar no GitHub nem criar versão do portal.
- Lote que muda cartões públicos ou aplicação: declarar os destinos realmente necessários, incluindo drive, github, pages e browser quando aplicável. Não usar classificação automática para tornar dados privados públicos.
- Manter o journal privado fora do repositório. Preservar IDs e eventos; congelar uma vez e registrar recibos apenas após evidência real.
- `node tools/study_batch.cjs status CAMINHO_PRIVADO` agora mostra `ready`: destinos pendentes que podem ser processados sem repetir os já confirmados. Lote aberto não tem destino pronto.
- Pages exige recibo do GitHub; navegador exige recibo de Pages. Drive é independente. O journal não executa uploads nem sincroniza dados por conta própria.

## Testes
- V277/V303/V307 em navegador: utilizar a página histórica V310 que corresponde às asserções; manter todos os critérios.
- V300: conferir marco mínimo histórico e igualdade com o catálogo vigente, não impor 1533 como contagem atual.
- A verificação do portal vigente continua no portão de encerramento e no contrato de catálogo. O portão didático permanece independente, sem alterar critérios de aprovação.

## Limite
A sincronização privada real precisa de autorização e recibos verificáveis; esta manutenção não confirma o OAuth privado nem sincroniza os dados do estudante. O resultado da execução dos testes deve ser consultado no Actions para o commit desta manutenção.

# V112 — Validação reforçada de grifos de lei seca com fontes oficiais

Data: 11/11/2026. Backup do código antes da atualização:
`backup/v111-before-real-law-corpus-v112-2026-11-11`.

## Solicitação
“Faça mais validações” — validar além das frases artificiais a precisão do classificador de quatro cores, usando trechos verificáveis de legislação, variações do texto selecionado no PDF, erros de correspondência e segurança da gravação e da mesclagem entre aparelhos.

## Melhorias no motor
`assets/v112_perfis_lei_seca.js` é uma evolução conservadora do calibrador V111:
- **Lei 8.429/1992 — Improbidade:** reconhecer definições explícitas com “consideram-se”, inclusive o sujeito “agente público”; distinguir a regra definidora (amarelo) do agente (verde). Reconhecer a não caracterização com “Não configura improbidade” e o afastamento expresso da responsabilidade, preservando a negação e separando o requisito de ausência de dolo (azul). Evitar forçar rosa em todo trecho apenas pela palavra “não”.
- **LC 95/1998:** reconhecer como regra o dever de articulação de textos legais no art. 10, além das regras existentes de vigência, revogação, desdobramento e numeração.
- **Identificação do perfil por arquivo:** reconhecer títulos de PDFs que usam `_` ou hífen para separar palavras, mas preservar a regra de que, quando o título aponta para duas leis, **nenhum perfil será ativado automaticamente**. A sugestão ainda exige confirmação.
- **Quatro cores invariáveis:** amarelo `#FDE68A` (regra), verde `#BBF7D0` (quem), azul `#BAE6FD` (condição), rosa `#FECDD3` (exceção). O sistema permanece conservador em conflitos e não regrifa trechos antigos.
- A UI, o grifador visual, o PDF, os dados de cartões, imagens e SRS continuam usando as implementações anteriores. Só o arquivo de perfis é substituído pela V112.

## Auditorias reproduzíveis
Scripts de teste adicionais, **não carregados no navegador normal**:
1. `assets/v111_calibrador_qa.js` — suíte legado de **200 verificações funcionais**: 107 casos esperados, 66 casos negativos, 27 títulos, acompanhada por **190 verificações estruturais**.
2. `assets/v112_qa_trechos_oficiais.js` — **36 trechos selecionados de 12 normas** federais, cada um reproduzido em seis condições de extração/apresentação de tokens (texto natural, maiúsculas, caracteres Unicode decompondo acentos, caixa mista, remoção de acentos, geometria de palavras com deslocamentos controlados), gerando **216 verificações** de reconhecimento e sobreposição. Não equivale à validação de PDF real pelo navegador.
3. `assets/v112_qa_negacoes.js` — **66 frases adversariais** das categorias “não reconhecer” repetidas em seis formatos tipográficos = **396 verificações**, além de **15 casos de reconhecimento de nomes de arquivo** (incluindo títulos ambíguos apontando para duas leis), totalizando **411 verificações**.

**Total: 827 verificações funcionais e 190 verificações estruturais**, todas aprovadas nesta versão de testes. Estes números medem adequação às expectativas definidas por essa bateria, **não** percentual de acerto em leis arbitrárias. Diversos exemplos foram usados para calibrar o algoritmo, logo não constituem uma amostra estatística independente.

## Testes de integração do armazenamento e Drive
- Foram executadas 14 verificações extraindo e exercitando as funções de verdade do motor `assets/pdf_v111.js`: criação de dois grifos em uma operação, quatro cores fixas, preservação de perfil/evidência/hash/página/ID, IDs distintos, supressão de duplicatas, rejeição de lote parcialmente inválido, rejeição de PDF ou página errada, reversão ao falhar o armazenamento e proteção a IDs desconhecidos de perfil.
- Foram executadas 10 verificações do motor de mesclagem V108 do arquivo mestre: propagação dos metadados `calibration_profile`/`calibration_evidence`, conflito histórico, precedência cronológica de atualização/exclusão/restauração, resistência a cópia antiga que tenta ressuscitar marcação, integridade do identificador de grifo. O teste confirma a lógica local de merge, **não** o OAuth real do Google Drive, disponibilidade de rede, transação em gravações simultâneas ou propagação automática entre celulares e computador.
- A compilação sintática e a composição do HTML foram inspecionadas antes da publicação; nenhuma base de dados existente foi editada. A UI móvel deve ser visualmente homologada em aparelho real.

## Fontes oficiais do corpus
- Constituição Federal: https://www4.planalto.gov.br/legislacao/legis-federal/constituicao
- Lei 14.133/2021 (publicação original da Câmara; conferir atualizações monetárias e alterações na edição vigente): https://www2.camara.leg.br/legin/fed/lei/2021/lei-14133-1-abril-2021-791222-publicacaooriginal-162591-pl.html
- Lei 8.429/1992 atualizada: https://www2.camara.leg.br/legin/fed/lei/1992/lei-8429-2-junho-1992-357452-normaatualizada-pl.html
- LC 95/1998 atualizada: https://www2.camara.leg.br/legin/fed/leicom/1998/leicomplementar-95-26-fevereiro-1998-363948-normaatualizada-pl.html
- Lei 9.784/1999: https://www2.camara.leg.br/legin/fed/lei/1999/lei-9784-29-janeiro-1999-322239-normaatualizada-pl.html
- Lei 12.527/2011: https://www2.camara.leg.br/legin/fed/lei/2011/lei-12527-18-novembro-2011-611802-normaatualizada-pl.html
- Lei 13.146/2015: https://www2.camara.leg.br/legin/fed/lei/2015/lei-13146-6-julho-2015-781174-publicacaooriginal-147468-pl.html
- Lei 8.112/1990 atualizada: https://www2.camara.leg.br/legin/fed/lei/1990/lei-8112-11-dezembro-1990-322161-normaatualizada-pl.html
- Estatuto da Cidade atualizado: https://www2.camara.leg.br/legin/fed/lei/2001/lei-10257-10-julho-2001-327901-normaatualizada-pl.html
- LGPD atualizada: https://www2.camara.leg.br/legin/fed/lei/2018/lei-13709-14-agosto-2018-787077-normaatualizada-pl.html
- LRF atualizada: https://www2.camara.leg.br/legin/fed/leicom/2000/leicomplementar-101-4-maio-2000-351480-normaatualizada-pl.html
- PNMA (texto da publicação original para conferência de expressão, não da vigência): https://www2.camara.leg.br/legin/fed/lei/1980-1987/lei-6938-31-agosto-1981-366135-publicacaooriginal-1-pl.html

## Auditoria crítica e limites
A primeira medição com 20 trechos de quatro normas na V111 reconheceu todas as categorias previamente esperadas em 15 trechos; cinco omissões motivaram a melhoria. Após ajustes conservadores, a V112 passou nos **24 trechos selecionados dessas quatro normas**, ampliados a **36 trechos de 12 normas**, com seis variações cada. Isso não valida toda a legislação, nem substitui conferir texto vigente, revogações, exceções, caput e incisos.

É preferível abster-se de grifar automaticamente um trecho ambíguo a atribuir cor incorreta. Os calibres são sugestões e devem ser confirmados pelo estudante. PDFs escaneados, OCR ausente e quebras anômalas de palavras permanecem limitações. Nenhuma nova nota ou flashcard é criado automaticamente e o SRS permanece intacto.

Para a próxima etapa de alta confiança, comparar um conjunto maior de trechos **não utilizados no ajuste do algoritmo**, extraídos dos PDFs efetivamente estudados, anotados manualmente com gabarito de cor e intervalo exato de palavras. Medir precisão/recall por cor e por dispositivo antes de confiar em aplicação automática de grandes seleções.

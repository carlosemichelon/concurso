# V194 — Banco Mestre público integral: 1.518 cartões e 1.490 aprofundamentos de 11 camadas

**Data:** 16/11/2026. **Fonte:** V158 privada (V045 + V157), com IDs, frentes, versos, explicações, macetes e estados originais preservados. Esta publicação foi autorizada para tornar o material didático acessível no site **sem autenticação no Google Drive**.

## O que foi publicado

- `assets/meta_public_v194.json`: novo manifesto didático público; 1.518 IDs, 1.501 ativos, 17 inativos.
- `assets/cards_public_v194_000.json` até `_006.json`: catálogo público dos 1.518 registros com frente, resposta mínima, explicação, macete, assunto e referência originais.
- `assets/layers_public_v194_000.json` até `_006.json`: 11 camadas para cada um dos 1.490 ativos autorizados (**16.390 camadas**), carregadas por lote somente após revelar a resposta original.
- `assets/v194_public_layers.js` e `.css`: leitura direta no modal de flashcards existente, sem botão de conexão ao Drive.
- `v194.html`: substitui a fonte antiga V154 por V194 no carregamento normal; retira os módulos V157/V187 que dependiam de OAuth para os versos.
- Contadores públicos atualizados. Os 22 cartões operacionais de Ijuí permanecem separados (total de 1.540 entradas incluindo inativos).

## Histórico pessoal protegido

**Não são publicados** objetos `srs`, avaliações, tentativas, respostas privadas do estudante, dados locais do navegador ou arquivos do Google Drive. Links particulares do Drive e trechos puramente administrativos de revisão foram retirados dos textos públicos; as explicações didáticas, exemplos, fórmulas, quadros e macetes foram mantidos. A V045 e a V158 privadas permanecem intactas.

## Itens adiados

CARD-0138, CARD-0194, CARD-0248, CARD-0286, CARD-0350, CARD-0424, CARD-0445, CARD-0502, CARD-0509, CARD-0510, CARD-0693 continuam com o verso original, mas sem liberação das novas 11 camadas e sem homologação.

## Auditoria

Conferidos programaticamente: 1.518 IDs sem duplicatas, 1.501 ativos, 17 inativos; 1.490 conjuntos de 11 camadas, 11 adiados; campos `id/front/back/expl/mnemonic/reference/active` idênticos à V158; 0 objetos SRS nos JSONs públicos; 0 URLs Drive nos textos das novas camadas; sintaxe JS validada.

**Limitação:** ensaio em navegador Chromium não pôde ser concluído neste ambiente. A validação de uso real do leitor no navegador do titular permanece necessária. Isto não certifica a precisão normativa de todas as explicações nem encerra a conciliação dos SRS históricos.

**Rollback:** `v193.html` e branch `backup/v193-before-didactic-public-v194-20261116`. Esta versão não modifica V193, dados locais, edições de PDF, imagens, grifos, SRS planejado nem checkpoints.

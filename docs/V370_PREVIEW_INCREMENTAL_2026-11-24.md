# V370 — desempenho de imagens privadas
- Uma chamada de mídia em andamento é compartilhada entre miniatura e leitor, apenas se ID, revisão, MIME e sessão OAuth forem iguais.
- Falhas liberam a tentativa; mudança de autorização ou revisão impede que uma resposta antiga substitua a atual.
- A reconciliação do catálogo usa mapa por ID para evitar busca linear repetida.
- A varredura periódica antiga já não fazia parte do bundle vigente; não foi alterada. Não foi implementado ainda o feed de mudanças do Drive.
- Tokens e URLs de mídia permanecem exclusivamente em memória; nenhuma nova permissão OAuth ou escrita privada.
- 5 testes de unidade simulados no portão de encerramento; teste real autenticado e métricas de latência ainda não confirmados.
- V369 e seu bundle permanecem intactos. Catálogo, IDs, cartões e SRS inalterados.

# Banco Mestre — grifador e integração, decisões aprovadas (10/11/2026)

## Regras de trabalho
- Alinhamento encerrado a pedido do usuário após **21 decisões aprovadas**. Não considerar a pergunta 22 (importação), que não recebeu resposta.
- Implementar em etapas, com backup do estado anterior, preservando a V060 estática e seus dados. Nunca sobrescrever versões históricas.
- Branch oficial de publicação: `gh-pages`; V060 foi preservada como `backup/v060-before-text-selection-2026-11-10` a partir do commit `a4c6be8198f028b3ac5f35d0f8dcb70363d88f85`.
- O backup Git **não acessa dados privados localStorage/IndexedDB do navegador**. Tratar sua exportação como operação separada, iniciada pelo usuário. Nunca limpar nem migrar automaticamente dados.

## Decisões aprovadas
1. **A** — seleção de texto como modo padrão, com grifo livre como alternativa.
2. **B** — grifo automático após seleção e menu flutuante (cor, nota, vínculo com cartão, desfazer).
3. **B** — grifos no PDF e biblioteca pesquisável, retornando ao trecho.
4. **B** — armazenamento local e sincronização consentida com Google Drive; detectar conflitos.
5. **B** — vinculação com cartões existentes e propostas de novos, apenas após aprovação.
6. **B** — remapear grifos quando o documento mudar, com revisão e preservação de origem.
7. **B** — biblioteca completa com categorias, tags, cores, favoritos, busca e filtros.
8. **B** — extensão Chrome para grifar sites externos e enviar à biblioteca mediante permissão.
9. **B** — conector próprio com ChatGPT para leitura e propostas, sem mutação sem aprovação.
10. **B** — resumos evolutivos por assunto, atualizações aprovadas.
11. **B** — detecção de grifos duplicados/relacionados, sem apagamento ou mescla automática.
12. **B** — cores livres e categorias personalizáveis.
13. **B** — OCR sob demanda para documentos digitalizados, com conferência.
14. **B** — migração assistida dos grifos V060, sem modificar originais.
15. **B** — painel lateral retrátil/redimensionável de grifos durante a leitura.
16. **B** — anotações estruturadas opcionais por grifo (dúvidas, correção, explicação, macete, pegadinha, fonte).
17. **B** — ancoragem híbrida: texto + posição para seleção; coordenadas para grifo livre.
18. **B** — edição do grifo no PDF, mantendo identidade e histórico.
19. **A** — exclusão direta com desfazer imediato, sem lixeira permanente.
20. **B** — atalhos configuráveis sem conflitos com navegador.
21. **B** — exportação seletiva TXT, Markdown, JSON e PDF com metadados e IDs.

## V061 — Etapa 1 (implementada)
- Mantém V060 intacta e os registros `BM030_STROKES_PDF` existentes.
- Cria camada de seleção textual PDF.js, ativa por padrão no PDF editável com texto digital; modo grifo livre da V058 permanece.
- Salva o texto selecionado exatamente, retângulos normalizados, cor, opacidade, documento, hash, página, ID, nota e vínculos opcionais de IDs de cartão. Mesmo armazenamento local por página/hash, sem alteração de SRS.
- Aplica grifo automaticamente quando a seleção por arraste termina; menu flutuante permite cor, nota, IDs de flashcard e desfazer o grifo.
- Reutiliza desfazer/refazer, borracha e PDF anotado; extração V059 reconhece o novo registro, distinguindo seleção exata de geometria antiga.
- Não migra dados, não grava PDF de origem, não altera flashcards/IDs/SRS, não faz upload.
- PDFs escaneados sem camada textual permanecem com grifo livre; OCR é etapa futura.
- **Limite de validação:** sintaxe/integridade estática conferida; seleção e alinhamento da camada de texto ainda exigem teste manual com PDF real.

## Etapas futuras (não implementadas na V061)
Biblioteca de grifos, painel lateral, sincronização Drive, exportação ampla/backup local, OCR, migração V060, sugestões de flashcards/resumos, extensão, conector, gestão de duplicatas, atalhos e edição avançada. Não declarar nenhuma delas concluída antes de testada.

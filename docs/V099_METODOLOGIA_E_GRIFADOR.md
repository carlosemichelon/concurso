# V099 — Regra de estudo ativo e paleta canônica da lei seca

Em 11/11/2026, o estudante forneceu 3 imagens reafirmando o método aprovado V008: quatro perguntas (O quê? Quem? Em que condição? Salvo o quê?), cores exatas `#FDE68A/#BBF7D0/#BAE6FD/#FECDD3`, exemplo CF art. 37 XVI/XVII e negrito reservado a palavras em que errou. As regras foram registradas em seção V010 do Google Doc mestre vigente (sem excluir V008/V009) e no arquivo público `docs/METODOLOGIA_CANONICA_LEI_SECA_CORES.md`. O site substitui apenas rótulos e sugestões locais, não o PDF original nem os registros históricos.

Arquivos `assets/v099_classificador_lei_seca.js`, `assets/v099_grifador_lei_seca.js`, `assets/v099_legenda_grifos.js` e CSS. PDF.js e renderização V097, seletor e colunas V097/V094, painéis V097, navegação e ícones V098 preservados. A heurística não é interpretação legal validada; marcar só núcleo quando termo reconhecido e pedir escolha manual se nada é seguro. Grifos existentes mantém cores, IDs, notas, histórico, SRS e agrupamentos. O estudante deve confirmar qualquer grifo de estudo no PDF-mestre.

## Diagnóstico de rolagem
No PDF V097, `renderOne` aguarda a renderização principal da página E `Promise.all` das duas páginas vizinhas, enquanto `painting=true` impede operações; a transição por rolagem executa `render` novamente antes de corrigir a posição. Esse custo explica pausas plausíveis em PDFs longos, ampliados ou em celulares. É possível manter a rolagem contínua e reduzir trabalho repetido com cache limitado, reuso de página rasterizada e priorização da página ativa, mas mudanças de fluxo requerem teste com PDF real (zoom, rolagem ascendente/descendente, referências por página, seleções, SRS inalterado). Não alterar isso na V099.

Backup prévio: `backup/v098-before-lei-seca-method-v099-2026-11-11`. Teste visual em navegador real pendente.

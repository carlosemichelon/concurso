# Banco Mestre V225 — Filtros jurídicos, TRT e acesso ao Drive

Data: 17/11/2026 · V1 preservada, sem Firebase nem V2.

## Solicitações atendidas
1. **Busca TRT:** quando o usuário procura `trt`, os cartões operacionais passam a ser contados pela biblioteca, e a mensagem “Nenhum cartão corresponde...” não fica ao lado dos TRT visíveis.
2. **Cartões sem sobreposição:** a pergunta aparece uma vez no cabeçalho, com um comando separado “Abrir resposta, 11 módulos e imagens”, sem título duplicado no `summary`. Respostas, módulos, imagens e IDs originais mantidos.
3. **Filtros jurídicos:** os 65 cartões jurídicos da base V024 recebem agrupamentos de apresentação derivados de assunto/subassunto já registrados, não da disciplina genérica legada “Legislação / Ética”. Grupos: Direito Constitucional, Administrativo/servidores, Ética Confea, legislação urbanística, ambiental, licitações, estadual/municipal, saneamento e demais leis.
4. **TRT contabilizados corretamente:** os oito cartões operacionais C001–C008 entram na lista de filtros e assuntos; **não são acrescentados ao Banco Mestre canônico, à fila SRS nem aos eventos de avaliação**. O código apenas busca os oito JSON públicos já existentes e mostra seus campos disciplina/assunto.
5. **Conexão Drive visível:** um controle em cartões/imagens/PDFs mostra o estado da autorização compartilhada e oferece “Conectar / renovar Drive” em um clique quando o Google estiver pronto. Os filtros e a página não precisam ser reiniciados.

## Restrições reais da autorização Google
O site continua estático em GitHub Pages. A biblioteca **Google Identity Services (token model)** fornece tokens OAuth temporários. Por regra de segurança do Google, a renovação após expiração ou nova abertura exige gesto explícito do usuário. A V225 **não promete** login permanente ou renovação silenciosa, não guarda tokens no `localStorage`, `sessionStorage`, cookies ou GitHub e não utiliza chaves permanentes. Um backend com refresh token protegido seria necessário para renovação automática privada entre visitas; a alternativa de tornar mídia pública requer autorização específica, não foi feita.

## Garantias e limitações
- Nenhuma mudança nas 1.518 perguntas e respostas, nas camadas de explicação, nos arquivos de imagens/PDFs, no SRS ou nos grifos existentes.
- Metadados dos cartões TRT permanecem públicos, como já estavam na V224.
- Assuntos são agrupamentos editoriais de navegação, não auditoria normativa de cada lei.
- O Google Drive ainda pode exigir reconexão conforme expiração, revogação ou política de conta.
- Teste `tests/v225_legal_search_oauth.cjs` audita 65 registros jurídicos, oito cartões TRT e ausência de armazenamento de token persistente. Não testa OAuth privado no navegador nem renderização visual em navegador autenticado.
- Retorno de segurança: `v224.html`.

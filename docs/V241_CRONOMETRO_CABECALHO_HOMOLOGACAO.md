# Banco Mestre V241 — homologação do cronômetro e estados de sincronização

Data: 18/11/2026. Estado: PROPOSTO / HOMOLOGAÇÃO. Base: gh-pages V239. A versão ativa do manifesto continua V239; não publicar sem validação e aceite.

## Implementado
- v241.html: mantém bootstrap histórico do portal e integra novos módulos em arquivos separados.
- assets/v241_controle_tab.js: Controle de Estudos como primeiro item de navegação e página inicial quando não houver deep link.
- controle-estudos-v241.html: reutiliza estado original do timer em BM_CONTROLE_TIMER_V238, sessões em BM_CONTROLE_ESTUDOS_V238 e comandos de ponte restritos à janela/origem local. Não duplica cronômetros nem eventos SRS.
- assets/v241_timer_header.js: seletor de matéria, entrada de conteúdo com sugestões, nova matéria, iniciar, pausar, continuar, salvar e descartar; cronômetro na aba do navegador com título, favicon e tempo líquido contínuo após recarga.
- assets/v241_timer_header.css: ícones e cartões de cabeçalho menores com responsividade.
- assets/v241_global_drive.js: usa apenas consulta atual para registrar PDFs e imagens, verifica 78 PDFs, Control Drive e grifos sem divergências.
- assets/v241_sync_truth.js: estados reais e independentes para PDFs, cartões/SRS, imagens, Controle e grifos.

## Proteções e limitações
- Nenhum arquivo de dados pessoais, cartão canônico, grifo, PDF ou SRS foi modificado; somente código e documentação desta branch.
- Cartões/SRS NÃO são sincronizados pelo botão global e permanecem indicados como tal.
- A sincronização conservadora do Controle preserva hash e leitura de volta, mas não garante compare-and-swap atômico entre atualizações concorrentes no Drive.
- Grifos com divergência preservada não recebem status de sincronização integral.
- O relógio ativo é preservado no mesmo navegador e sinaliza mudanças de outra aba via storage event. A transferência automática de relógio ativo entre dispositivos NÃO foi implementada; o histórico do Controle é um mecanismo separado.
- Nenhum teste autenticado OAuth, de celular/desktop real ou de conflito interdispositivo foi realizado.

## Testes
- GitHub Actions: V241 - Cronômetro e integridade do Drive.
- Execução de sucesso em 18/11/2026, commit 420cf944c5547dd34f43baed5649d5c8c8838772.
- URL: https://github.com/carlosemichelon/concurso/actions/runs/44329464601
- Auditoria de 174 referências estáticas: nenhuma faltante; sintaxe dos scripts inline válida.

## Antes de promover para gh-pages
1. Testar tela real no computador e celular e o cronômetro em execução, pausa, retomada, recarga e gravação.
2. Confirmar conexão OAuth, PDFs, imagens, grifos e Controle no Drive por leitura real.
3. Simular conflitos entre dispositivos, inclusive sessão ativa e restauração.
4. Auditar cartões, filtros, PDFs, SRS, IDs, backups e originalidade das mídias.
5. Após aprovação, atualizar index.html, assets/version.json e VERSAO_ATUAL.md, conferir publicação e validar site real.

LOG: 2026-11-18 | V241 | proposto/homologação | GitHub alterado em branch separada | base privada e SRS intactos | testes estáticos OK | OAuth e publicação pendentes.

## Auditoria E2E em Chromium — 18/11/2026
- A primeira execução de navegador expôs um erro real: o bootstrap v156 redirecionava a rota vazia para `#assuntos` antes de o Controle ser montado.
- Correção introduzida em `assets/v241_boot_topic.js`, referenciada por `v241.html`: rotas vazia e `#controle-estudos` são preservadas para o módulo da página inicial, sem afetar deep link `#pdfs`.
- Após a correção: 6 testes de contrato e 6 cenários E2E de navegador em Chromium **aprovados**.
- Cenários navegador: página inicial; início/pausa/retomada/salvamento único; persistência após recarregar; link direto para PDFs; viewport de celular; simulação da mudança dos estados do Drive de não verificado para conferido e para conflito nos grifos (SRS sempre excluído).
- O último cenário emprega **dados simulados de retorno do sincronizador**. Não deve ser descrito como teste OAuth real.
- Execução aprovada no commit `e68f2b5bcf8478baf69468011c7c643cbb0c1258`: https://github.com/carlosemichelon/concurso/actions/runs/44332004736
- Os testes rodaram em servidor HTTP isolado com armazenamento descartável; nenhum acesso a arquivos privados ou operação de gravação Drive foi executada.
- Estado de homologação: `teste automatizado aprovado`, `OAuth real pendente`, `gravação Drive real pendente`, `interdispositivos real pendente`, `publicação principal pendente`.

LOG: 2026-11-18 | E2E V241 | falha de rota inicial encontrada e corrigida | 6/6 contratos e 6/6 browser aprovados | sem alterações privadas | branch de homologação preservada.
# Banco Mestre — auditoria do portal V262 (18/11/2026)

## Escopo e proteção
Solicitação: estabilizar cabeçalho no primeiro carregamento; corrigir mensagens de sincronização e bug JavaScript herdado. Versão anterior V261 preservada em `v261.html`; revisão PR #40 integrada sem alteração dos cartões canônicos, SRS oficial, PDFs, imagens ou grifos originais.

- PR: https://github.com/carlosemichelon/concurso/pull/40
- Merge commit: `316afeeb900851306e8caa3d849f9071e88b07f6`
- Base pública: 1.518 cartões canônicos (1.501 ativos e 17 inativos) + 22 operacionais Ijuí, apresentados separadamente; total de referências exibidas 1.540.
- Catálogo histórico de PDFs: 78. Atlas editorial V198: 179 registros. Estes números **não são prova de sincronização** de arquivos privados.

## Problema visual e solução
O V046 deslocava `.stats` de `main` para `header` durante o boot; V239/V241 injetavam novos indicadores e o botão Drive após pintar a página. A V262 publica cinco caixas, botão de OAuth e status diretamente no HTML, com geometria CSS reservada em desktop/mobile. `v046_layout.js` continua histórico e não encontra mais a barra em `main` para mover.

**Playwright Chromium V262 aprovado:** 3 observações no desktop, `navTop=128px`, altura estável de 65px para os cinco indicadores, sem variação; viewport 390px, indicadores com altura de 60px; botões de navegação funcionais. Não se extrapola estes testes para todos os navegadores ou dispositivos.

## JavaScript
Erro real detectado: `ReferenceError: preview is not defined` em `assets/v106_ink_ui.js:82`, disparado pelo organizador da interface de PDF. A V262 carrega `assets/v262_ink_ui.js` com a criação explícita do elemento `preview`; V106 permanece recuperável no histórico Git. Teste funcional V262: **zero erros JavaScript** na execução Playwright sem OAuth privado.

## Dados e confiança nos indicadores
1. `78` é a quantidade histórica do catálogo PDF, não o número exato que uma nova varredura do Drive deve encontrar. `assets/v262_global_drive.js` verifica `source === 'google_drive_only'`, contagem íntegra de PDFs, pastas e IDs históricos confirmados; o total encontrado pode diferir de 78 sem gerar falha automática. A cobertura dos 78 IDs históricos é indicada separadamente.
2. A contagem da biblioteca PDF é alterada pelo módulo V259 apenas após confirmação de lista no Drive; não se apagam PDFs ou grifos quando a varredura falha.
3. `assets/v262_sync_truth.js` separa sucessos, pendências, autorizações, conflitos e falhas. `Controle: sem registros locais para enviar` não equivale a corrupção nem a sincronização confirmada.
4. O botão único de OAuth reutiliza o controle pré-renderizado. A rotina periódica do Controle/Lacunas verifica existência de módulos e serializa trabalho em segundo plano; não reescreve SRS.
5. Cartões públicos e SRS **não são sincronizados** pelo botão Drive. Nenhuma atualização privada foi declarada bem-sucedida sem relatório de confirmação.
6. Verificação independente de metadados pelo conector Drive confirmou a existência das quatro pastas-raiz monitoradas para PDFs e da pasta principal Atlas. Não é uma simulação de OAuth de navegador, nem auditoria completa de todos os arquivos e revisões.

## Testes e publicação
- Testes estáticos V262 e regressões históricas V121, V124, V214, V216, V217, V219, V222, V225 e V228 aprovados.
- Testes históricos V044/V045/V046 aprovados antes da conclusão do merge. O PDF de simulação V044 tinha SHA-256 distinto do documento mestre atual: o teste agora exige **rejeição segura**, em vez de contornar o controle de integridade.
- Playwright V262: desktop e mobile aprovados, cinco status fixos, fonte Drive sem OAuth classificada como não verificada, SRS fora da sincronização, zero erros JS.
- GitHub Pages `pages build and deployment`: sucesso para o merge `316afeeb`.
- GitHub Actions `Banco Mestre - verificar publicação pública`: sucesso para o merge `316afeeb`.
- O manifesto foi corrigido após o merge para não manter a descrição antiga de "versão proposta", distinguindo publicação de OAuth privado.

## Pendências reais — não declaradas como resolvidas
- **OAuth em sessão real do usuário:** não testado; é necessário clicar `Sincronizar Drive`, conceder permissão e analisar o relatório de cada módulo na própria sessão. Indicadores pendentes não devem mudar para `✓ Conferido` sem evidência.
- **SRS canônico:** preservado; não foi executada conciliação ou escrita de eventos.
- **Metadados de segurança:** a raiz `DataBase_Concurso` retornou permissão `anyone: writer` na leitura de metadados do Google Drive. É uma possível exposição de edição por link; esta operação **não modificou** qualquer permissão. Requer revisão consciente, considerando integrações existentes, antes de restringir acesso.
- Testes de navegador automatizados não substituem homologação visual final com a conta Drive autenticada ou teste de todos os módulos privados.

## Rollback
`v261.html` e a base V194 permanecem disponíveis no GitHub. O histórico de commits preserva cada modificação da V262. Nenhum arquivo de cartões, evento SRS, PDF original ou registro de grifos foi alterado por esta mudança de portal.

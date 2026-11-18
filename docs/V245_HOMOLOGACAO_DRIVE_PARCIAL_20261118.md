# V245 — homologação parcial de Google Drive e integridade
**Data:** 2026-11-18 (America/Sao_Paulo)  
**Ramo-base:** `gh-pages`; portal V245; PR de publicação #38 mesclada  
**Estado:** **PARCIAL — não certifica OAuth do portal nem sincronização interdispositivos**.

## Evidência verificável
| ID | Ensaio | Resultado | Alcance |
|---|---|---|---|
| HD-01 | Criar documento temporário isolado no Google Drive pelo conector autenticado | PASSOU | Conectividade e permissão do conector ChatGPT |
| HD-02 | Inserir registro sintético de sessão (75 min, 20 questões, 16 acertos), ler novamente por Docs e Drive | PASSOU | Persistência e readback do conector |
| HD-03 | Tentar escrita utilizando `requiredRevisionId` anterior | PASSOU: rejeição HTTP 400, original intacto | Proteção de revisão da **API Google Docs**, não do `files.update` JSON usado pelo portal |
| HD-04 | Excluir documento temporário e ler metadata | PASSOU: exclusão confirmada e metadata retornou 404 | Limpeza do teste, sem resíduos |
| CI-01 | GitHub Actions V245, execução 44357972058, job `browser-smoke` | PASSOU | Chromium com desktop e viewport móvel emulados, não aparelhos físicos |
| CI-02 | GitHub Actions V245, execução 44357972058, job `static-and-smoke` | PASSOU | Testes estáticos, backup e conflitos **simulados** |
| GH-01 | PR #38, merge em 2026-11-18 17:24:45 UTC | CONFIRMADO | Código V245 integrado a `gh-pages` |
| GH-02 | `index.html` e `assets/version.json` na `gh-pages` | CONFIRMADO | Direcionamento estático para V245 |
| HTTP-01 | Requisição direta de `https://carlosemichelon.github.io/concurso/v245.html` | NÃO EXECUTÁVEL neste ambiente | Web e container não alcançaram o host; **não é prova de indisponibilidade pública** |

## Limites de segurança constatados
1. **A autenticação pelo botão do portal usa outra sessão OAuth**: o teste do conector ChatGPT não prova o `Google Identity Services` do navegador nem o escopo `drive.file` concedido ao próprio portal.
2. O arquivo privado `BancoMestre_Controle_Estudos_V245.json` e as cópias `BancoMestre_Controle_V245_...` **não foram criados nem alterados por esta auditoria**.
3. O código `assets/v245_controle_drive_sync.js` faz leitura de `files.version` imediatamente antes do `PATCH uploadType=media`, com readback SHA-256; isso reduz riscos mas não constitui, isoladamente, garantia de compare-and-swap atômico diante de gravações concorrentes entre checagem e PATCH. Não foi comprovada precondição atômica suportada pela API para esse fluxo.
4. A conciliação de três vias e os dois backups pré-merge existem no código e nos testes sintéticos; ainda **não foram exercitados com dois clientes físicos**.
5. Um sucesso de CI Chromium não comprova experiência em smartphone físico, troca de rede, login privado, restauração real ou resolução de conflitos reais.
6. Nenhum cartão, evento SRS, PDF, imagem, marcação ou base canônica foi modificado nesta auditoria.

## Critérios pendentes para homologação final
- [ ] Abrir a URL pública em navegação real e confirmar resposta, inicialização, versão e ausência de erros.
- [ ] Acionar o botão único em navegador autenticado pelo titular; confirmar permissões e execução `BM239DriveGlobal.lastReport`.
- [ ] Criar **dados sintéticos isolados** e conferir o JSON V245 no Drive por leitura posterior/hash, sem misturar com dados reais.
- [ ] Testar upload, download, pausa, transferência de cronômetro e restauração em computador e celular físicos, com evidência de preservação dos originais.
- [ ] Provocar conflito de edição/remoção em dois clientes; confirmar bloqueio e preservação dos dois snapshots.
- [ ] Verificar rotação de 30 backups diários e 12 mensais em ambiente isolado; jamais apagar históricos produtivos sem conferência.
- [ ] Auditar atualização concorrente no arquivo mestre e resolver eventual janela TOCTOU, preferindo precondição atômica documentada/testada.

## Decisão de integridade
**Não declarar sincronização entre aparelhos como homologada.** A V245 pode continuar disponível no GitHub Pages; o botão deve reportar sucesso apenas após conferências próprias. Manter PMS-1, IDs, SRS e originais preservados.

Este relatório registra somente o que foi realmente executado em 18/11/2026. Aprovação de um teste do conector **não** implica certificação do OAuth do portal.

# Banco Mestre — Portal de estudo (Engenharia Civil / Concursos)

**Site publicado:** [Abrir Banco Mestre](https://carlosemichelon.github.io/concurso/)  
**Branch de publicação:** [`gh-pages`](https://github.com/carlosemichelon/concurso/tree/gh-pages)  
**Situação conferida em 11/11/2026:** V131, conforme `gh-pages/assets/version.json` e `gh-pages/index.html`. Em futuras consultas, **verifique novamente esses dois arquivos**: o número poderá mudar.

## Por onde começar

- [Mapa de versões e organização Drive/GitHub](docs/GOVERNANCA_VERSOES_DRIVE_GITHUB_2026-11-11.md)
- [Manifesto da versão publicada](assets/version.json)
- [Registro detalhado de versões](VERSAO_ATUAL.md)
- [Inventário das 102 branches](docs/INVENTARIO_BRANCHES_2026-11-11.md)
- [Índice das 109 versões HTML históricas](docs/INDICE_PUBLICACAO_E_HISTORICO_HTML_2026-11-11.md)
- [Regras para agentes e alterações](AGENTS.md)
- No Google Drive conectado: pastas `CONCURSOS – ENGENHARIA CIVIL` e `DataBase_Concurso`. Seus links privados não são publicados aqui.

## Distinguir as versões
**Portal V131** ≠ **Base V024 H14** ≠ **checkpoint V029** ≠ **metodologia v009**. A numeração pertence a linhas diferentes.

Em V131, o manifesto do site registra 1.499 IDs de cartões, 1.482 ativos, 72 PDFs e 270 imagens; os 22 cartões operacionais de Ijuí são separados. Isso não autoriza publicar material privado nem concluir que o checkpoint V029 já está integrado.

O site é publicado por `gh-pages`. A branch padrão `main` contém portal legado V031, e não deve ser usada para editar a versão atual.

**Preservação:** versões históricas `vNNN.html`, branches de backup e arquivos de estudo não foram excluídos. Grifos, SRS, PDFs e dados privados do navegador exigem backups independentes. Uma alteração de HTML ou branch no GitHub não salva `localStorage`/`IndexedDB`.

**Vade Mecum de estudo:** o arquivo principal no Drive foi atualizado sem trocar o ID. No site V129, o botão **Sincronizar Vade do Drive** busca a edição com grifos e negritos direto do Google Drive, e não das 21 partes históricas do GitHub. Grifos e SRS são preservados; sincronização depende de autorização Google no navegador.

## Sincronização de PDFs V131

Na biblioteca **PDFs**, clique em **Sincronizar todos os PDFs**. O portal pede autorização Google Drive quando necessária, percorre as subpastas de `DataBase_Concurso` e `CONCURSOS – ENGENHARIA CIVIL` e consulta os acervos adicionais de NRs e licenciamento. PDFs recém-adicionados surgem na lista da sessão sem cadastro manual no GitHub; os 72 PDFs históricos permanecem no catálogo estático. A leitura dos PDFs encontrados consulta a versão atual do Drive. Esta função não altera nem apaga o PDF original, grifos, cartões, SRS ou a aba Redação; novas sessões podem exigir nova autenticação. Foi validada com API/DOM simulados; o fluxo OAuth real no navegador do usuário ainda precisa ser testado.

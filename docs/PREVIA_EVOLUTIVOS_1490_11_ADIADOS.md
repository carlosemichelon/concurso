# Prévia dos 1.490 cartões elegíveis — 11 adiados

Esta alteração é **apenas uma prévia em branch isolada** baseada na V184 publicada. Não modifica `index.html`, `assets/version.json`, `v184.html`, os JSONs públicos, o SRS ou os dados do navegador.

- Leitor: `assets/preview_evolutivos_1490_11_adiados.js`.
- Página de teste: `preview-evolutivos-1490-adiados11.html`.
- Fonte: overlay V157 no Google Drive privado, lido após OAuth do proprietário e verificação SHA-256; nenhum conteúdo privado está incluído no GitHub.
- Total de registros privados: 1.518; ativos 1.501; inativos 17.
- Ativos elegíveis para leitura aprofundada na prévia: 1.490.
- **Adiados sem homologação e sem exibição de novas camadas:** CARD-0138, CARD-0194, CARD-0248, CARD-0286, CARD-0350, CARD-0424, CARD-0445, CARD-0502, CARD-0509, CARD-0510 e CARD-0693.
- O cadastro original desses 11 cartões não é apagado nem alterado.

## Verificações antes de qualquer publicação

1. Testar autenticação OAuth, leitura do arquivo e comparação SHA em navegador real.
2. Confirmar que todos os 1.490 elegíveis exibem as 11 camadas sem perder o verso mínimo original.
3. Confirmar que os 11 adiados ficam de fora dos resultados evolutivos.
4. Fazer backup dos dados SRS **do navegador do usuário**, inclusive IndexedDB, antes de trocar a versão padrão.
5. Verificar a operação dos cartões existentes (abertura, resposta, SRS e histórico) antes/depois do carregamento.
6. Confirmar que dados privados nunca são incorporados aos arquivos do GitHub.

**Status:** prévia não publicada, sem atualização da entrada do site.
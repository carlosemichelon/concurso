# V185 — Sincronização e atualização incremental do Banco Mestre
Data: 16/11/2026. Base: V184 pública, incluindo prática de cartões e calendário de estudos.

## Correções implementadas
1. PDFs: atualização da lista dinâmica após autorização OAuth compartilhada, além do comando manual já existente. Busca todas as subpastas acessíveis dos dois acervos principais no Drive; não apaga originais nem transforma alterações dinâmicas em arquivos públicos do GitHub.
2. Imagens: consulta autenticada passa a percorrer recursivamente as subpastas de **07 – Atlas de Imagens (sincronização)**. Busca por título ou caminho e mostra a pasta de origem, com IDs estáveis. Imagens em diretórios fora do Atlas e não selecionadas como referências não são automaticamente publicadas.
3. Cartões: substituição da leitura obrigatória de um arquivo V045 fixo por seleção explícita de um snapshot privado aprovado **BANCO_MESTRE_PRIVADO_Vnnn_SYNC_aaaa-mm-dd.json** armazenado na pasta de sincronização. Valida ID, verso, contagens e referências SRS. **Não cria cartões nem registra eventos SRS**.
4. Integridade: a V184 anterior foi preservada como rollback. A V185 incorpora todas as funções de prática de cartões e calendário lançadas simultaneamente à auditoria de sincronização.
5. Fonte do catálogo: PDFs V149 = 78 registros estáticos; outros PDFs aparecem somente na sessão com Drive autorizado. A base pública mantém 1.499 IDs (1.482 ativos) e 22 operacionais Ijuí; não foi modificada por esta atualização.

## Testes executados
- Compilação estática dos módulos JS, dos inicializadores HTML V184/V185 e da versão atual da página: passou.
- Simulação de descoberta recursiva de imagens, uma na raiz e outra em subpasta: passou; SVG não suportado foi excluído da visualização.
- Validação de snapshots de cartões: snapshot válido aceito; duplicação de ID, verso vazio e referência SRS para ID ausente rejeitados.
- Montagem real do HTML V062 pela rotina da V185: passou. 82 etiquetas de script, incluindo módulos de prática e calendário da V184 e novos sincronizadores da V185.

## O que ainda não é automático
- A gravação de novas informações das conversas ChatGPT no Drive exige ação explícita do estudo/checkpoint com conectores disponíveis. O GitHub Pages é estático e não tem integração contínua com conversas.
- O PDF salvo no Drive pode ser encontrado dinamicamente após OAuth, mas não altera automaticamente o catálogo JSON público nem aparece a todos os visitantes.
- Imagens enviadas pelo chat precisam ser preservadas, classificadas e endereçadas no Drive. Só imagens efetivamente destinadas ao Atlas aparecem na consulta recursiva privada.
- Novos cartões aprovados exigem geração e armazenamento de snapshot privado válido. O usuário escolhe o snapshot no site; o site não promove propostas nem substitui o canônico do Drive.
- Autorização OAuth real e teste em navegador com conta do titular: pendentes. Não foi executado teste com os dados privados do usuário no navegador.

## Segurança e rollback
- Códigos novos somente no GitHub; nenhum PDF, imagem privada ou base privada foi publicado.
- Os módulos usam OAuth em memória e não modificam permissões do Drive.
- A V184 pública anterior permanece acessível em `v184.html`. Em incidente, restaurar `home: v184.html` e `version: V184` no manifesto, preservando todas as bases e históricos.
- Nenhum arquivo de backup, cartão, SRS ou imagem original foi excluído.

## Critério de homologação futuro
Com a conta proprietária: salvar um PDF novo em subpasta, imagem em subpasta do Atlas, snapshot privado com cartões aprovados; abrir V185, autorizar Drive, confirmar contagens, vínculos e leitura; repetir após expirar a sessão; conferir que um arquivo não selecionado para Atlas não foi promovido e que o SRS não mudou.

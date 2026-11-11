# V108 — Edição, exclusão reversível e ausência de núcleo no grifador

## Pedido
1. Na seção **Biblioteca de Grifos**, permitir editar grifos e excluí-los.
2. Quando o classificador de lei seca mostrar **“Nenhum núcleo normativo identificado”**, fornecer uma alternativa prática sem grifar automaticamente o trecho inteiro.

## Recursos
- `assets/v108_biblioteca_grifos.js`: botão **Editar grifo** com cor (Amarelo/Verde/Azul/Rosa), estilo (marca-texto, sublinhado, duplo, tachado, ocultar), nota, disciplina, assunto, subassunto e tags; preserva ID, geometria, âncora textual e histórico. Ao salvar, marca `bm108_changed_at` e envia o evento de alteração local. Se a marcação tiver sido alterada em outra aba desde a abertura, recusa gravar uma cópia antiga.
- **Excluir** solicita confirmação e grava `bm108_deleted_at` em vez de apagar bytes. Marcadores antigos sem ID também são suportados por identificação estável da geometria. Os excluídos somem da consulta e da edição do PDF; opção **Mostrar excluídos** permite restaurar. O documento PDF original, o registro integral para backup e o SRS permanecem.
- `assets/pdf_v108.js`: leitura e exportação ignoram grifos arquivados; ao salvar ou refazer o histórico, preserva em armazenamento as entradas arquivadas (para não perdê-las quando uma página for novamente editada). Desfazer/refazer e novas exclusões do próprio leitor registram carimbo de alteração. O sistema de contraste Multiply, seleção por dois toques e zoom não é alterado.
- `assets/v108_sync_core.js` e `assets/v108_master_core.js`: mesclagem do arquivo mestre único privilegia o registro com `bm108_changed_at` mais recente para o mesmo ID ou geometria; conserva variantes anteriores em `conflicts[]`. Isso evita que uma edição ou exclusão recente desapareça após receber uma cópia antiga do outro dispositivo. Não implementa exclusão definitiva; tombstones são preservados enquanto necessário.
- `assets/v108_grifador.js`: quando não há regras suficientes para classificar um núcleo, exibe orientação curta, cores manuais e botões **Grifar seleção** ou **Refazer seleção**; desativa repetição automática da mesma classificação sem evidência. Não inventa núcleo nem aplica a cor amarela automaticamente. Caso o PDF seja imagem escaneada sem texto selecionável, é necessária outra forma de obter texto; não foi incluído OCR.
- `assets/v108_grifos_editor.css`: cartões e editor responsivos, marcação discreta de arquivados e recuperação acessível no celular.

## Regras de segurança
- **Exclusão reversível**, não destruição física. Os backups antigos do Drive não são apagados.
- Não editar pela Biblioteca enquanto o editor PDF estiver aberto, para evitar dessincronizar uma página carregada na memória.
- Os dados de cada aparelho continuam locais até que o Google Drive seja autenticado e a sincronização seja confirmada. A V108 não prova que OAuth real esteja homologado.
- Salvar o novo registro mestre com proteção de conflitos é mitigação de perda, mas o Google Drive neste fluxo não garante transação atômica em duas gravações concorrentes.
- Preserva paleta de quatro categorias, SRS, todos os cartões, Atlas e 72 PDFs.
- Backup do código: `backup/v107-before-grifos-edit-delete-v108-2026-11-11`.

## Testes
- Sintaxe JS/CSS.
- Edição de cor e nota, metadados; recusa dados desatualizados; arquivamento e restauração; bloqueio quando PDF aberto.
- Persistência do grifo arquivado ao criar outro destaque na mesma página.
- Merge local/remoto: exclusão recente vence versão antiga; restauração posterior vence exclusão e conflitos são preservados.
- Montagem de loader e integridade dos módulos de grifos, Drive, cartões, Atlas e PDF.
- Teste visual no Android e OAuth real do Drive ainda dependem de validação nos aparelhos; não afirmar homologação completa.

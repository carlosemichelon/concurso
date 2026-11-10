# Banco Mestre V078 — pré-sincronização segura de grifos

## Publicação e escopo
A V078 é sucessora da V077 e preserva o catálogo com **72 PDFs**, grupos, seis cores fixas, flashcards e SRS. Adiciona dois controles à Biblioteca de Grifos: **Testar cores** e **Comparar backup Drive**.

## Modo de operação
- **Testar cores:** executa 16 verificações de classificação local, sem qualquer alteração.
- **Comparar backup Drive:** somente após clique e autorização OAuth `drive.file`, localiza o backup V066 acessível, verifica tamanho e SHA-256, valida o esquema e compara os registros locais com a cópia remota em memória.
- Resultado agrupa páginas iguais, exclusivas do navegador, exclusivas do Drive e divergentes. Diferenças de serialização JSON são tratadas conservadoramente como divergências.
- **Nunca** importa, restaura, funde, recolore, exclui ou envia dados de grifos automaticamente.

## Testes
- Classificador original V075: 23/23 casos automatizados.
- Autoteste V078: 16/16 casos automatizados.
- Comparação idêntica/divergente, rejeição de formato errado, JSON ilegível, prefixo inválido e IDs duplicados.
- Testes visuais com PDF real, autorização Google e leitura do backup Drive **ainda pendentes**.

## Backup anterior
`backup/v077-before-grifos-pre-sync-v078-2026-11-10`.

## Próxima etapa
Após validação real no navegador, decidir explicitamente se e como habilitar **restauração/importação assistida**, com prévia de conflito, confirmação e rollback. A decisão de importação automática não foi aprovada.

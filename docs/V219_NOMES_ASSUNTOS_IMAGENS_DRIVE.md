# Banco Mestre V219 — títulos e assuntos das imagens do Drive

Data: 2026-11-17

## O que foi corrigido
- O **título de estudo** não é mais o nome bruto do arquivo no Drive.
- O nome original e o ID permanente continuam acessíveis em **Nome original e identificador**, sem renomear ou copiar arquivos.
- Metadados de assunto já auditados são reaproveitados dos índices textuais V211 e V180, ligados por `driveFileId`. Esses índices são somente metadados; nenhuma imagem é carregada do GitHub.
- A biblioteca exibe filtros de **disciplina**, **assunto** e **com assunto/a classificar**. A busca encontra título, nome original, assunto, pasta e ID.
- Os títulos gerados a partir de nomes descritivos de arquivos não são promovidos automaticamente a uma classificação aprovada.

## Limites conferidos
No catálogo textual V211 existem 237 imagens, 93 com tópico registrado e 144 sem. Dentre as 237, 34 têm nomes de arquivos predominantemente numéricos/hexadecimais. Esses números descrevem **o catálogo existente**, não o total atual na conta Drive.

Para um registro sem tema documentado, o site usa “Assunto pendente de classificação”; quando o nome é opaco, usa “Imagem sem título descritivo”. **Não se atribui assunto apenas pelo hash, número, nome da pasta ou semelhante**.

## Fonte e evolução
- **GitHub:** site, formato dos cartões, dados públicos de cartões e índices textuais históricos de associação já publicados.
- **Drive:** bytes originais de todas as imagens; alterações no arquivo/nome aparecem na próxima consulta ao Drive.
- **SRS pessoal:** preservado sem publicação/alteração.
- Imagem nova, ainda sem metadados de classificação, aparece no Drive sem commit GitHub, mas **não recebe automaticamente assunto validado**. Para classificar imagens sem metadados será necessária curadoria real e registro da classificação; a V219 **não cria gravação no Drive**. Um eventual índice de classificação no Drive pode eliminar a necessidade de commit GitHub para classificação futura, mas não foi implementado nesta versão.
- V218 (cartão TRT01-C004) foi preservada integralmente como versão anterior. V219 não altera o conteúdo desse cartão.

## Validação
- `tests/v219_image_metadata.cjs` usa os índices reais existentes e confere 93/144, IDs, nome técnico opaco, título, assunto e cartão TRT01-C004.
- `validar-v219-imagens.yml` confere sintaxe e regressão.
- Teste de browser com conta Google e imagens privadas ainda pendente.

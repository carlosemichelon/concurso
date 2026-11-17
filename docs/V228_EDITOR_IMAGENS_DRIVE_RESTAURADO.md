# Banco Mestre V228 — restauração do editor de informações das imagens

Data: 17/11/2026. V1 intacta; sem mudança de cartões, SRS, PDFs, autorização Google ou arquivos originais do Drive.

## Problema corrigido
O editor completo anterior (Atlas V206) apresentava imagem à esquerda e abas "Dados" e "Tipo e cartões", mas a biblioteca de originais do Drive passou a usar o formulário simplificado de "Tipo e cartões" (V209). Ao clicar em **Editar imagem**, o usuário deixou de encontrar título, disciplina, assuntos, descrição e anotações.

## Solução
- V228 oferece um botão **Editar informações** em cada imagem original do Drive, com janela lateral e **prévia da imagem à esquerda**.
- Três abas: **Informações** (título, disciplina, assunto geral, assunto específico, subassunto, descrição técnica, notas); **Tipo e cartões** (reutiliza o editor V209 e seus vínculos já salvos); **Arquivo e backup** (identificador Drive, nome original, pasta e exportação/importação de ajustes).
- O painel continua exibindo os originais autenticados do Drive. Títulos e categorias editados são usados imediatamente na galeria e na busca, sem recarregar o site.
- Para os IDs antigos `IMG-...` que tenham mapeamento confiável de `driveFileId` no índice V211, recupera as antigas personalizações `BM055_ATLAS_CUSTOM_TITLES` e `BM060_ATLAS_CARD_FIELDS` antes de apresentar os campos. Preserva-as: não as apaga nem as reescreve.
- O editor antigo do Atlas permanece intacto; o novo atua somente em registros do Drive.

## Onde ficam as edições
O conteúdo das imagens está no Drive, mas **os títulos/classificações alterados pelo editor ficam apenas no armazenamento local deste navegador**, sob a chave `BM228_DRIVE_IMAGE_INFO_V1`, até eventual implementação de gravação autenticada no Drive. O botão **Exportar checkpoint JSON** salva um backup de metadados no computador; importar requer ação e confirmação nos conflitos. O editor não sobrescreve arquivos do Drive, não renomeia originais e não altera o SRS. Vínculos de cartão continuam gerenciados pelo editor V209 com seu backup separado.

## Autenticação Google
O V228 mantém o OAuth 2.0 de navegador da V225: token temporário em memória, compartilhado entre imagens e PDFs; renovação por botão após expiração ou nova visita. **Não existe login permanente garantido nesta arquitetura estática.** Para manter a sessão entre visitas com renovação automática é necessário serviço mínimo de backend com fluxo de autorização por código, refresh token protegido no servidor e sessão HTTP segura. O código V228 não grava credenciais e não adiciona Firebase.

## Auditoria e retorno
- Teste: `tests/v228_drive_editor.cjs` e workflow `validar-v228-editor.yml` (com dados catalogados reais e personalizações anteriores simuladas).
- **V227 preservada** em `v227.html`, com TRT01-C009.
- Teste visual em sessão autenticada ainda depende do navegador do titular.

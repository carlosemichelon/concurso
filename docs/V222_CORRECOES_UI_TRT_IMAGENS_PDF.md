# Banco Mestre V222 — Correções da V1 (17/11/2026)

Esta atualização atende à inspeção do usuário (248 imagens do Drive conectadas, mas sem miniaturas, rodapé antigo V206) e preserva o código V1, os cartões TRT01-C001 a C006, a base pública V194, o SRS e os materiais do Drive.

## Ajustes
1. **Informativo dos cartões:** o aviso geral de origem (`bm119PublicSource`) fica em `details` **no final da seção de cartões**, inicialmente recolhido, com possibilidade de reabrir. Nos cartões TRT, informações operacionais e de resposta registrada também ficam ao final, em uma área recolhida.
2. **TRT na grade:** os seis cartões TRT são renderizados em `article.card` na mesma `#cardRows`; a estrutura interna das 11 camadas, respostas, imagens vinculadas e leitura original são reaproveitadas sem copiar dados ou criar eventos SRS. Se o motor de filtros refizer a grade, o adaptador os reinsere. O filtro de pesquisa simples funciona para os títulos/IDs TRT. Os filtros canônicos avançados não os classificam automaticamente em assunto inexistente.
3. **Imagens visíveis e reativação:** o adaptador coloca `#imageRows` numa região visível, independente de seções ocultas da antiga biblioteca. Observa a resposta das imagens do Drive e atualiza após autorização, retorno à aba, foco e entrada na biblioteca, sem recarga de página. Consulta continua restrita às pastas monitoradas e a arquivos autorizados. Um TRT aberto pode carregar suas imagens automaticamente ao conectar o Drive.
4. **PDF e leis:** o botão **Ler / editar PDF** na biblioteca chama `BancoMestreDriveV042.openAndEdit` para PDFs com `file_id` do Drive, reutilizando OAuth e abrindo o PDF.js do próprio site. Não altera `pdfOpen` global — o próprio editor o utiliza internamente — nem substitui conteúdo/bytes/grifos. O link explícito **Abrir no Drive** continua abrindo o original externamente. Ao voltar à aba, a biblioteca consulta alterações se a sessão ainda estiver autorizada.
5. **Rodapé correto:** V222, sem o rótulo obsoleto V206.

## Limites dos testes
`tests/v222_v1_regressions.cjs` cobre integridade de scripts, inclusão dos seis cartões TRT, remanejamento do informativo e simulador de clique em PDF. O fluxo visual completo do navegador com autenticação Google e arquivos privados **não é confirmado por testes automatizados**; é necessária uma conferência no navegador do usuário. PDFs sem `file_id` válido e arquivos de formato não PDF não podem ser carregados diretamente pelo mesmo caminho. PDFs digitalizados podem permitir caneta e grifos de superfície sem permitir selecionar texto nativo. O Vade Mecum especial ainda possui verificação SHA-256 própria e não deve apontar para uma edição diferente sem uma auditoria dos grifos.

## Segurança e retorno
- Nenhuma senha, token permanente, byte privado, SRS, anotação ou grifo enviado ao GitHub.
- Nenhum arquivo original renomeado ou excluído.
- **V221** preservada em `v221.html`, com TRT01-C006 intacto.
- Apenas novo código JS, versão `v222.html`, manifesto e página inicial alterados.

# V091 — Leitor PDF sem travar ao rolar

O leitor não troca mais a página automaticamente durante a rolagem. A mensagem **“Página 2 — role para ativar a edição”** foi eliminada. Para avançar ou voltar, use **Anterior / Próxima** ou o campo **Ir**. Ao rolar, você permanece sempre dentro da mesma página e a seleção por palavras não é reinicializada.

## Por que o PDF não era editável no link da V089?

O endereço `https://carlosemichelon.github.io/concurso/v089.html#pdfs` é uma versão antiga da **biblioteca**. Não é um arquivo PDF. O botão **Ler / editar PDF** abre inicialmente uma visualização do Google Drive em `iframe`, que não admite grifos do Banco Mestre.

Para editar:
1. Abra a versão mais recente do site e navegue até **PDFs**.
2. Escolha o documento e clique **Ler / editar PDF**.
3. Na janela aberta, clique **Editar PDF**. Se for a primeira vez, escolha a cópia autorizada do PDF no seu computador. Se já guardou uma cópia nesse navegador, clique **Continuar edição**.
4. O modo local mostrará **Selecionar**, cor, assunto, notas e **Salvar grifo**. No Drive/iframe original é só leitura.

O aplicativo não extrai PDFs privados automaticamente do Drive, porque a visualização incorporada e permissões de acesso não fornecem bytes do documento para o editor.

## Auditoria técnica

- Nenhum listener `pagePane.addEventListener('scroll')` restou no `pdf_v091.js`.
- Removidos `promoteByScroll()` e renders de anterior/próxima durante a leitura.
- Eliminada a caption “role para ativar a edição”.
- Os módulos V089 de seleção e V090 de cores, notas, filas e barra de ferramentas permanecem exatamente iguais.
- Mantidos os dados e catálogos de 72 PDFs e 270 imagens; notas, grifos e IDs preservados.
- Backup em branch separado. Teste real no navegador com PDFs locais ainda deve ser feito.

# Banco Mestre V090 — novo editor PDF

## 1. Seleção e classificação (manual)
Acesse o PDF e clique **Selecionar**. Use o seletor preciso da V089: clique/toque na primeira palavra e depois na última, dentro da mesma coluna. Selecione uma das **seis cores**, informe o **Assunto** obrigatório e clique **Salvar grifo**. Disciplina, subassunto e nota são opcionais. Nada é gravado por selecionar ou escolher a cor.

Cores: vermelho — proibições; verde — obrigações; amarelo — prazos e números; azul — exceções; roxo — palavras-chave de banca; laranja — conteúdo central. A associação é escolhida manualmente. Não há inferência de IA automática.

## 2. Editar e excluir
Clique sobre um grifo já existente enquanto o selecionador estiver ativo. A mesma janela abre o registro e permite alterar cor, assunto, disciplina, subassunto e nota **sem trocar o ID**, preservando vínculos com cartões e histórico. Excluir requer confirmação; Desfazer restaura o estado anterior. Não é permitido criar um novo grifo sobreposto ao antigo.

## 3. Seis cores no mesmo parágrafo
Selecione um trecho, escolha sua cor e assunto, clique **Adicionar à fila de cores**. Repita com outros trechos. Em seguida, na barra superior clique **Fila de cores (n)** e confirme **Salvar fila (n)**. Nenhum item da fila é gravado antes dessa confirmação. O lote é gravado atomicamente por `addTextHighlights` e uma única operação Desfazer. Se quiser um grifo único, continue usando **Salvar grifo**.

## 4. Editor simplificado
A barra horizontal contém ações reais Selecionar, Mover, Anterior/Próxima, ir para página, Zoom ±/padrão, Desfazer/Refazer, Meus grifos, Fila, Baixar PDF, Salvar Drive e Mais ferramentas. As ferramentas legadas continuam disponíveis sem modificar seus listeners. No celular a barra permite rolagem horizontal. O editor de imagem permanece independente.

## Proteções e escopo
O seletor por coordenadas V089 não foi modificado. A base de cartões V018, 72 PDFs, 270 imagens, visibilidade e exclusões do Atlas, SRS, notas, tags, IDs, fontes Drive e versões anteriores continuam preservados. Backup: `backup/v089-before-v090-editor-2026-11-10`. Sem Claude e sem classificação automática.

## Testes
Foram simuladas as seis opções de cor, o salvamento de cada uma, edição de cor/assunto/nota com o mesmo ID, uma fila de duas cores, zero gravações antes do clique final e uma gravação por lote. A nota inicial foi integrada ao núcleo PDF V090 para evitar um segundo commit. A homologação visual em navegador real ainda não foi feita.

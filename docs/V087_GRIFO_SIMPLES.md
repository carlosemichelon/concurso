# V087 — Seleção simples de texto no PDF

**Fluxo:** clique em Selecionar texto, arraste para marcar um trecho, escolha uma das seis cores, digite **Assunto** (obrigatório), opcionalmente **Disciplina** e **Subassunto**, e clique em **Salvar grifo**. A escolha da cor não salva automaticamente.

- A seleção do texto é destacada em azul até a confirmação ou cancelamento.
- O classificador automático, lote multicolorido e modo rápido estão desabilitados, mesmo se configurações antigas indicarem modo automático.
- Cada grifo mantém seu ID; editar assunto/cor em grifo existente preserva notas, IDs de cartões, tags, favoritos e histórico.
- O assunto é salvo em `subject_suggestion` do próprio grifo e, quando possível, no índice `BM062_GRIFOS_META`. Se o índice local falhar, o grifo ainda conserva o assunto.
- A interface usa os controles originais do leitor, com foco na seleção de texto; o editor de imagem e as rotinas de exclusão do Atlas não foram alterados.
- 72 PDFs, 270 imagens e V086 anterior preservados.
- Sem chamada de IA/Claude, sem chave API e sem migração de grifos.
- Pendente homologação visual em navegador real; testes de sintaxe e de gravação manual já passaram.

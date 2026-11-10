# V085 — melhorias funcionais e visuais do editor PDF

## Escopo
Aprimorar TODAS as áreas de ferramentas de edição PDF com ícones compreensíveis e botões reais, evitando substituição de listeners, IDs, anotações ou coleções de dados. O leitor de imagens, Atlas e SRS permanecem intactos.

## Ações auditadas
| Área | Comandos reais |
|---|---|
| Navegação | Página anterior/próxima, campo Ir para página (V057), zoom +/−, retorno a 100% |
| Seleção / desenho | Selecionar texto, caneta, grifo livre, borracha, mover |
| Anotações | Nota, CARD, cobertura, painel de grifos, selecionar/grifar trechos com 6 cores |
| Histórico | Desfazer, refazer, limpar página com confirmação e rollback seguro |
| Exportação | PDF anotado, PNG da página, salvar cópia no Drive, trocar PDF |
| Interface | Ferramenta ativa, modo compacto/largo, seis categorias fixas, ajuda de atalhos, foco visível, aria-label/title |

## Correção funcional
V081 permitia que `Limpar página` apagasse a marcação em memória mesmo se falhasse o salvamento. A V085 preserva as anotações anteriores por rollback e restaura o histórico; ao concluir, avisa que houve alteração para atualizar controles e backups locais.

## UX
- SVGs integrados (sem arquivos de fonte nem rede externa).
- Botões originais reaproveitados; estado `disabled` e `aria-pressed` preservados.
- Separar explicitamente “Grifo livre” e “Selecionar texto”.
- 202 px barra lateral ampla desktop / 102 px compacta. Celular: 160 px aberta / 102 px compacta. Preferência salva somente neste navegador.
- Nenhum campo “Ir” duplicado: reaproveita o já implementado na V057.
- Atalhos Shift+S, Shift+C, Shift+G, Shift+B, Shift+H só quando PDF aberto e fora de inputs.
- Ao exportar, gera cópia do PDF; original do Drive não é alterado.

## Registros preservados
72 PDFs, imagens privadas, Atlas, versões anteriores, SRS, flashcards, nota, grifos e IDs. Sem migração, recoloração ou exclusão.

## Limitação de validação
Inspeção e testes sintáticos/estáticos não substituem auditoria de clique real no Chrome/Android. Conferir layout nas resoluções 360px, 768px e desktop, e testar todos os botões no mesmo PDF.

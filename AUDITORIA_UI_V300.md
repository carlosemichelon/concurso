# Auditoria de usabilidade — V300 (19/11/2026)

## PDF: reversão localizada do visual
- A V300 continua usando o catálogo, Drive OAuth, leitor, marcações e fontes de PDF da V299.
- `assets/v300_ui_simplified.css` restaura tamanho e hierarquia de títulos, grupos e metadados do catálogo **V297**, retirando apenas o refinamento de apresentação V298 na aba PDFs.
- Pesquisa e grupo ficam principais; ferramentas/status/áreas secundárias são agrupados em painel recolhido, preservando elementos e handlers. Não há migração de arquivos.

## Lacunas: conteúdo integral com prioridade didática
- Exibe pesquisa, disciplina e situação; seis filtros secundários estão sob `Mais filtros`.
- Indica pendentes, reforço e dominadas; agrupa fichas por disciplina/assunto e mostra situação, prioridade, vínculo com cartão e resumo literal da dificuldade.
- Questão, tentativa, gabarito, relato integral do estudante, diagnóstico com autoria, pesquisa, fontes, auditoria, evidência de domínio, histórico e ações de progressão continuam presentes, em detalhe expansível por ID.
- Corrige `section.bm256-lac-block` que podia ser ocultado por `section{display:none}` do portal.
- Registro e backups permanecem, com campos principais visíveis e campos de classificação/fontes opcionais recolhidos.
- O módulo é apenas uma transformação do DOM após a renderização; não muda o schema `BM_LACUNAS_V242`, armazenamento, SRS ou autorização.

## Navegação por filtros
- Assuntos: pesquisa e área.
- Flashcards: pesquisa e disciplina; assunto/especificidade e ações secundárias recolhidas.
- PDFs: pesquisa e grupo; outras ações e filtros por área recolhidos.
- Imagens: pesquisa e disciplina; os três níveis hierárquicos restantes sob `Mais filtros` e ações administrativas em detalhes.
- Lacunas: pesquisa, disciplina e situação; demais filtros sob `Mais filtros`.
- Nós/IDs/listeners originais usados; nenhuma exclusão de funcionalidade ou apagamento de seleção.

## Continuidade e testes
- A V299 tinha introduzido `assets/v299_drive_continuous.js`; permanece importado, antes dos scripts V300, sem mudanças.
- Corrigidos `version`, `home`, `current_versions.portal` e `previous_version` do manifesto; versões V299 e V298 preservadas.
- Testes estáticos verificam sintaxe, 78 PDFs, 1.533 cartões, 11 módulos preservados, Drive V299 e referências.
- Testes Chromium V300 usam apenas fixture sintética para Lacunas, widths 1366/390, filtros, DOM detalhado e estilos. A autenticação Google real não foi executada nem pode ser inferida de testes simulados.

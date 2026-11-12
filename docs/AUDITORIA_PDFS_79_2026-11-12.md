# Integração dos sete PDFs — Banco Mestre V140

Data: 2026-11-12. Publicação: gh-pages. Backup: backup/v139-before-pdf-catalog-2026-11-12.

## Escopo
- 72 PDFs preservados; sete adicionados; 79 IDs estáticos únicos.
- Catálogo: assets/pdf_catalog_v140.json. Agrupamento: assets/pdf_grupos_v140.json.
- Grupo Informática e AutoCAD incluído na área de Português/Matemática; mantidos os 23 grupos originais.
- Originais no Drive sem modificação; arquivos estáticos antigos e versão V139 preservados.
- O botão Sincronizar todos os PDFs continua executando assets/v130_drive_pdf_sync.js: consulta recursiva OAuth e deduplicação por file_id; requer autorização na sessão do navegador.
- A validação documental/estrutural não substitui o teste de OAuth com a conta no navegador.

## Novos registros
- BMPDF-20261112-DNIT | Resumão DNIT — Métodos, procedimentos e controle tecnológico | eng_rodovias | 12EXwRCJQ-LKlBoYbSFicF26mTxGk2keu | 50 páginas
- BMPDF-20261112-PORTUGUES | Português — Caderno manuscrito de estudo geral | lang_port | 1KOqNSZwcAaIqE2tyQdCScFu8KWVASOd3 | 95 páginas
- BMPDF-20261112-INFORMATICA | Informática e AutoCAD — Questões e notas de Ética CONFEA | lang_info | 1ob1B4l-L3I9VxaheE50z3eaALD9_uGRh | 4 páginas
- BMPDF-20261112-ENGCIVIL | Engenharia Civil — Caderno geral manuscrito (edição de outubro) | completo | 1zKnBs90_3ESx2H_YslEAnoqro9sTczHE | 200 páginas
- BMPDF-20261112-MATEMATICA | Matemática e Raciocínio Lógico — Caderno manuscrito | lang_math | 1n8ldvJm0PuEfLDU-FjgF-8-ao0j1sLZJ | 22 páginas
- BMPDF-20261112-CONFEA | CONFEA/CREA — Resoluções para concursos de Engenharia Civil | leg_geral | 1YhnBoGOs0Kici4PaxkMrp-1r9DTPI3HZ | 10 páginas
- BMPDF-20261112-NBR9050-9077 | NBR 9050 e NBR 9077 — Pegadinhas de prova | eng_seguranca | 1r0a7TZArmxMf8-no8jVVCoyTksK_kDlQ | 5 páginas

## Testes estruturais
- 79 documentos/79 atribuições, IDs internos únicos, IDs Drive não duplicados.
- Todos os grupos de cada registro existem.
- v140.html referencia corretamente o catálogo, o agrupador V140 e mantém o sincronizador V130 e o módulo de Redação V139.
- index.html e assets/version.json apontam V140.

Observação: Não foi realizada uma sessão Google OAuth real do site; a primeira autenticação exige ação da conta autorizada.

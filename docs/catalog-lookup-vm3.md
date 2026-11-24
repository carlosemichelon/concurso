# Fluxo incremental VM3 — manutenção candidata

O catálogo oficial continua único: assets/version.json → snapshot vigente. O índice derivado é somente leitura, não é outra base. O workflow gera assets/catalog_lookup/manifest.json, partições de pesquisa e cards/ID.json (cartão integral público + hash). Consultar manifesto e comparar catalog_git_blob com assets/version.json antes de usar. Se divergente, não usar índice antigo como vigente. A projeção não acessa Drive nem SRS. A busca usa partições de até ~100 kB; consultar 1–5 cartões integrais pertinentes por ID.

O motor genérico catalog_evolution_batch.cjs é candidato, somente evoluções existentes, com hash de origem, 11 módulos distintos, grifos, preservação de mídias, original, versão anterior, links recíprocos e contagens. Ainda não está ligado à publicação oficial; falta integrar ao gerador e testar com incremento real. Não autoriza novos IDs, não altera interface, não publica automaticamente cartões, não certifica qualidade técnica (revisão didática continua obrigatória). Não enviar delta privado ao GitHub.

Teste: node --test tests/catalog_lookup_batch.test.cjs. Geração do índice: node tools/catalog_lookup.cjs. Manutenção não altera VC, VS, VI ou VR.

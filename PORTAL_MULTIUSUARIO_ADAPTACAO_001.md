# Adaptação incremental do portal original — etapa 01
Base V347: 5d928932ce379373579b220a01239b02d632c75a. Cópia de segurança: backup/portal-original-v347. Branch de trabalho: feature/portal-atual-dois-usuarios. A V018 reimplementada permanece em feature/multiusuario-v001, não substitui o original.
Objetivo: manter HTML, CSS, recursos e comportamento existentes, mudando somente identidade e roteamento de dados onde necessário. Esta etapa não ativa login novo nem altera index.html.
## Auditoria inicial (18 scripts efetivamente lidos)
- v315_js_000_001: armazenamento local, IndexedDB de imagens.
- v326_js_002_015: localStorage, IndexedDB PDF, múltiplos fluxos OAuth/Drive, referências fixas.
- v315_js_016_027, v315_js_028_039, v326_js_040_051, v326_js_052_063: dados de atlas, grifos, PDF e Drive.
- v315_js_064_075, v326_js_076_087: cartões, SRS, IndexedDB, discursivas, OAuth.
- v326_js_088_099, v315_js_100_111, v315_js_112_123: imagens, PDF, controle, sessões, lacunas, sincronização.
- v326_js_124_135, v315_js_136_147, v326_js_148_159: conexão, calendários, dados privados, preferências.
- v316_drive_progress, v316_srs_journal, v331_related_navigator, v320_organizar_unificado: progresso, SRS, lateral e organização.
Essas são famílias de acesso encontradas por inspeção estática; ainda não é inventário completo de chamadas indiretas, módulos carregados dinamicamente, frames ou dados incorporados no HTML e renderizadores. Não tratar conteúdo publicado de um usuário como banco individual do outro.
## Implementação inicial
assets/multiaccount-storage-v001.mjs: escopo por subject verificado, armazenamento local e nomes IndexedDB separados, sem ler/migrar chaves antigas por padrão, validação de titularidade e pasta Drive. 24 asserções em JavaScript isolado aprovadas. A interface é um contrato de adaptação, não uma substituição global de Storage.prototype nem isolamento de segurança entre scripts da mesma origem. A integração deve remover acesso direto a dados particulares e usar a identidade Google verificada. Dados privados sensíveis devem ficar no Drive individual; usar perfis distintos de navegador para testes reais.
## Portões antes de ativar
1. Inventariar todos os acessos persistentes, OAuth, IDs fixos, catálogo privado e recursos carregados dinamicamente. Não usar IDs de um proprietário como defaults do outro.
2. Integrar adaptadores aos módulos existentes por famílias, preservar markup/estilos e comportamento de estudo. Bloquear acessos privados não convertidos. Não habilitar segundo usuário se alguma rota puder carregar dados do primeiro.
3. Validar dois perfis separados, login/logout, leitura/gravação e conflito no Drive real, cartões, PDFs, imagens, grifos, SRS, lacunas e controle.
4. Homologar com usuário, só depois propor publicação.
## Reversão
Produção gh-pages permanece intocada. Abandonar a branch experimental não exige restaurar nada. Backup V347 preserva código exato desta data; futuras mudanças independentes da produção devem ser preservadas. Antes de qualquer publicação, criar novo checkpoint do head vigente e usar reversão seletiva dos commits de adaptação (sem force push ou rollback de estudos). Backups de código não revertem dados do Drive; migrações de dados exigem backup privado por usuário, preservação dos originais e confirmação.

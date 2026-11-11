# V104 — Arquivo mestre único, zoom por pinça e Desfazer flutuante

## Decisões do estudante — 11/11/2026
1. **Um único arquivo mestre ATIVO de grifos** no Google Drive, acessível com a mesma conta em celular e PC. A prioridade é minimizar o risco de perda de qualquer edição.
2. Zoom com dois dedos no leitor PDF no celular, sem abandonar a rolagem contínua.
3. Botão flutuante Desfazer visível no celular, mesmo com a barra de ferramentas recolhida.
4. Classificação/realce automático não deve reabrir permanentemente o menu flutuante de edição.

## Implementação
- `assets/v104_master_core.js` + `assets/v104_drive_master.js`: um único documento privado `BancoMestre_Grifos_Mestre.json` com `appProperties.bm_kind=bm_grifos_sync_v104_master`. O Google Drive recebe esse arquivo apenas após OAuth `drive.file` explicitamente autorizado. Fonte principal no Drive, cópias de estudo no localStorage de cada dispositivo.
- Importação aditiva de qualquer arquivo antigo V103 criado pelo app, sem apagá-los: tornam-se **legado de recuperação, somente leitura**. O sistema identifica duplicidade de mestres e interrompe a gravação, sem escolher arbitrariamente um dos arquivos.
- `records` armazena grifos textuais, traços livres, metadados, notas e uniões manuais. Em divergências sob mesmo ID, a versão canônica permanece e os conteúdos alternativos são preservados em `conflicts[]` para revisão, sem sobrescrita silenciosa. Não propaga exclusões.
- Antes de atualizar o mestre, lê e mescla os registros antigos e locais; compara o campo `version` do Drive para detectar mudanças ocorridas desde a leitura. Depois de gravar, relê o mestre e confirma que contém os registros locais, inclusive alternativas de conflito, antes de informar sucesso. **Não é uma operação atômica**: conflitos de gravação simultânea podem ainda ocorrer, portanto a cópia local, os arquivos V103 antigos e exportação manual continuam indispensáveis. Nunca prometer perda zero absoluta.
- Sincronização automática quando o PDF fecha (se houver autorização/sessão ativa) e periodicamente a cada 2 minutos com o site aberto; o editor não importa marcações enquanto há página editável aberta. Autenticação não salva tokens em localStorage. OAuth deve ser testado em navegador real e Google Cloud; `drive_auth_v038.json` historicamente marca origem ainda não homologada.
- `assets/pdf_v104.js`: adiciona `setZoomAt`, `zoomLevel`, `beginPinch/endPinch`, cancelamento de traços temporários ao detectar dois dedos; mantém a renderização contínua/caches V101, últimas páginas V102 e exportação original.
- `assets/v104_mobile_gestures.js`: gesto de dois toques simultâneos com prévia CSS temporária e zoom final na âncora tocada; botão Desfazer aciona exatamente o histórico `undoLast()` do PDF, sem duplicar operações.
- `assets/v104_precise_touch.js`: seletor por primeiro e último toque V103 mantido, com `cancelPending()` quando começa zoom por pinça. `assets/v104_grifador.js`: em classificação automática bem-sucedida fecha a paleta em vez de exibi-la a cada grifo; falha de reconhecimento ainda permite seleção manual.
- `assets/v104_mobile.css`: ícone Desfazer dimensionado, estado desabilitado e layout para celulares estreitos.

## Limites e validação
- Uma cópia mestre ativa não implica apagar automaticamente os backups antigos. A exclusão de arquivos V103 só será discutida após migração real comprovada.
- A versão remota é verificada antes e depois da gravação, mas a API Drive v3 **não fornece nesse fluxo uma comparação e atualização atomicamente garantidas**. Edições simultâneas requerem cuidado; cópias locais devem ser preservadas até confirmação.
- Backups/versões do Drive podem ter política de retenção limitada; exportações locais periódicas são recomendadas.
- Um dispositivo sem conexão continua podendo estudar, mas somente terá a cópia remota quando recuperar conexão, mantiver a autorização Google válida e sincronizar.
- Não enviar PDFs, cartões, SRS, imagens ou segredos OAuth ao Drive com este fluxo.
- Testes de código e simulação de dois dispositivos não substituem teste de login real, zoom no Android e reconciliação de conflito real. Não afirmar homologação completa.
- Backup branch: `backup/v103-before-single-master-pinch-undo-v104-2026-11-11`.

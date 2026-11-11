# V103 — Mobile e sincronização privada de grifos

## Solicitação do estudante
- Compartilhar os grifos entre celular e computador.
- Recolher a barra de edição PDF para ver mais da página no telefone.
- Grifar por toque no início e no fim do texto em tela sensível ao toque.
- Reparar layout móvel de todos os setores do site (Assuntos, PDFs, Flashcards, Atlas, Grifos e editores).

## Mudanças
1. **Barra PDF** `assets/v103_mobile_pdf.js`: botão flutuante permanente **Ferramentas / Recolher** na tela do PDF. No celular a barra começa recolhida, salvo preferência explícita do aparelho. Não apaga controles nem handlers; somente muda a classe de layout. Adicionado atalho rápido **Grifar** e indicação de página ativa.
2. **Seleção de dois toques** `assets/v103_precise_touch.js`: mesma extração de palavras e proteção de colunas do núcleo V097/V089. Primeiro toque curto marca o começo; o segundo toque curto marca o final e envia para o grifador V099. Deslize vertical não cria grifo e continua servindo para rolar; mouse continua podendo arrastar. Status e botão Cancelar visíveis em celulares.
3. **Site móvel** `assets/v103_mobile.css`: navbar rolável horizontalmente em vez de esmagar botões; cards e formulários sem transbordamento, alvos de toque aumentados, grade responsiva, painel de grifos como gaveta sobreposta no celular para não estreitar o PDF, barras laterais do PDF redimensionadas. Editor de imagem preservado com largura moderada e rolagem dos controles. CSS do PDF só se aplica quando PDF aberto e em dispositivo móvel.
4. **Sincronização compartilhada via Google Drive** `assets/v103_sync_core.js` + `assets/v103_drive_sync.js`: na Biblioteca de Grifos o usuário conecta sua conta e escolhe sincronização manual ou periódica (2 minutos enquanto página e sessão estiverem abertas). Escopo OAuth `drive.file`. O Drive recebe arquivo JSON privado específico de cada dispositivo (`appProperties.bm_kind=bm_grifos_sync_v103`). O site lê os arquivos criados pelo próprio aplicativo na mesma conta, mescla marcas existentes (incluindo grifos antigos sem ID por conteúdo integral), notas e uniões e publica apenas seu arquivo de origem. Nenhum PDF, flashcard, SRS ou imagem enviada. Não são usados tokens no localStorage, repositório ou parâmetros de URL.
5. **Segurança do merge:** importação apenas aditiva. Grifos com mesmo ID e conteúdo divergente **não são sobrescritos**; conflito é contado e sinalizado. Exclusões entre aparelhos ainda não são propagadas. Cada aparelho retém seu arquivo privado e backup local para recuperação. Antes de aplicar em `localStorage`, o site verifica schema, limites de tamanho e escopo das chaves. Um erro de escrita tenta desfazer alterações no mesmo turno. A sincronização não mescla enquanto um PDF editável está aberto, para não alterar inesperadamente a página ativa.

## Procedimento do usuário
1. No computador abrir Biblioteca de Grifos → **Sincronizar grifos entre dispositivos** → **Baixar backup local** → **Conectar Google Drive** e conceder permissão para arquivos criados pelo app. Conferir status da primeira sincronização.
2. No celular abrir a mesma versão do site, usar a **mesma conta Google**, fazer backup local e conectar. Executar **Sincronizar agora**.
3. Para atualização periódica marcar a opção; a sincronização ocorre apenas com o site aberto e a autorização vigente. Se uma sessão expirar, conectar novamente. Conflitos não são resolvidos automaticamente.
4. O PDF precisa ser a mesma cópia (mesmo ID de catálogo e hash) para que suas anotações apareçam na página certa.

## Limitações e validação
**Ainda não homologado no Google Cloud real**: a configuração de Client ID em `assets/drive_auth_v038.json` foi encontrada com status “CLIENT_ID_CONFIGURADO_AGUARDA_ORIGEM_GOOGLE_CLOUD_E_AUTORIZACAO”. O app pode precisar de origem autorizada, configuração OAuth, consentimento ou usuário de teste. Não prometer sucesso antes de teste com login real no Android e no PC.
Sincronização V103 = compartilhamento aditivo com prevenção de perdas, não reconciliação automática completa de edições e exclusões. Sem OCR para PDFs escaneados. Posição da última página continua local, não sincronizada nesta etapa. Sem teste visual em navegador real, layout móvel precisa de validação no dispositivo.
Backup do código pré-V103: `backup/v102-before-mobile-and-sync-v103-2026-11-11`.

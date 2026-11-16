# V195 — respostas discursivas e classificação no site atual

Data: 2026-11-16. Branch de publicação: `gh-pages`. Base: V194, preservada.

## Funcionalidade
- Cada cartão aberto no leitor possui a opção **Responder discursivamente**, independente da apresentação do verso.
- Resposta livre integral, observações e autoavaliação Errei/Difícil/Bom/Fácil.
- Tentativa única por ID, sem apagar anteriores: `BancoMestreDiscursivasV195 / attempts` (IndexedDB do navegador).
- Salvamento local confirmado após conclusão de transação. Tentativas podem ser vistas no histórico e exportadas em JSON.
- Uma cópia JSON **por tentativa** pode ser enviada, sob autorização da conta Google, à subpasta `RESPOSTAS_DISCURSIVAS` de `DataBase_Concurso / 02_HISTORICOS`. A pasta já existe e não foi configurada para ser privada.
- O usuário deve informar, uma única vez por navegador, o link ou ID da pasta. Esse ID é guardado apenas no navegador, evitando anunciar no código público o endereço de uma pasta com permissão de escrita por link.
- O código do portal GitHub Pages **não** recebe as respostas. Apenas metadados genéricos de estrutura estão no GitHub.
- Após login, o Drive recebe uma cópia JSON com ID, frente, resposta original do estudante, classificação, observações, data/fuso, versão da base e estado de auditoria. O envio checa a pasta de destino e `appProperties.bm_attempt_id`, verifica duplicação pelo nome e confirma metadados após salvar.
- O método de salvamento exige o escopo OAuth `https://www.googleapis.com/auth/drive` para escrita em pasta existente; se o provedor Google bloquear esse escopo, a cópia local e a exportação permanecem disponíveis, mas a sincronização remota não estará homologada.
- A avaliação não altera o SRS canônico; fica registrada como dado de tentativa, para conciliação/auditoria posterior pelo ChatGPT. Não é reativado cronômetro nem calendário.

## Como usar
1. Abra um cartão e clique em **Responder discursivamente**.
2. Escreva a resposta, escolha Errei/Difícil/Bom/Fácil e clique em **Registrar classificação e resposta**.
3. Expanda **Google Drive · configuração e sincronização**, cole o link da pasta e clique **Salvar destino**.
4. Clique **Conectar Google Drive** e autorize o acesso. O sistema tenta sincronizar as tentativas pendentes.
5. Verifique a confirmação do Drive ou exporte o JSON de todas as tentativas para backup.
6. Para auditoria posterior, o ChatGPT poderá ler os JSONs na pasta via conector autorizado e confrontar com os cartões, sem alterar o texto da resposta original.

## Integridade e ressalvas
- Cartões, IDs, verso original, 11 camadas, mídias, grifos e base V194 preservados.
- Os arquivos remotos são append-only; nenhum JSON de tentativa antiga é sobrescrito automaticamente.
- Em caso de falha de rede/OAuth, o registro local permanece com estado de sincronização pendente. Evitar supor que houve cópia antes de ver a confirmação.
- Arquivos exportados contêm todas as respostas escritas; manter backups seguros.
- Os dados locais não são transferidos automaticamente para outro navegador. A cópia no Drive deve ser conferida.
- **Testes estáticos concluídos**: sintaxe JS, presença dos recursos no HTML V195 e ausência de scripts de prática V184/SRS V189. **Testes reais em navegador, OAuth, gravação e leitura Google Drive pendentes**.
- Permissões do Google Drive não foram alteradas. A pasta-mãe já permitia edição por link, segundo verificação de metadados; o usuário aceitou que não fosse privada.

## Arquivos novos
- `v195.html`
- `assets/v195_discursive.js`
- `assets/v195_discursive.css`
- `docs/V195_RESPOSTAS_DISCURSIVAS_DRIVE.md`

## Rollback
O portal V194 continua preservado em `v194.html`. Para voltar, restaure `assets/version.json` e `index.html` para apontar V194, sem apagar o diretório local do IndexedDB nem os arquivos do Drive.

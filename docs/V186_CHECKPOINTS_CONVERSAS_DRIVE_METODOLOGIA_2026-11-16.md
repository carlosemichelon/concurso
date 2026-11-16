# V186 — Registro de checkpoints das conversas no Banco Mestre
Data: 16/11/2026 · Escopo: rastreabilidade sem alterar a base, o SRS, os PDFs ou as mídias.

## Regra de negócio (Metodologia Mestre V014 + diretriz V2)
O ChatGPT prepara o checkpoint ao fim da sessão ou por comando explícito do estudante. O pacote deve conter os arquivos acessíveis e uma manifestação de integridade, classificação e pendências. O ChatGPT, quando autorizado e com conector acessível, grava o ZIP e o manifesto na estrutura existente do Drive. O site **não possui API de acesso às conversas do ChatGPT** e não deve tentar buscar mensagens sem fonte legítima.

### Fluxo
1. ChatGPT → identifica período/parte/IDs, conteúdo novo, atualizações, SRS explícito, imagens em papel QUESTÃO/CARTÃO/REFERÊNCIA_ATLAS, arquivos originais e pendências.
2. ChatGPT → produz ZIP/manifesto e armazena no Drive nas pastas existentes, com conferência por ID e leitura de retorno. Não reauditar lotes antigos sem mudança.
3. Site → mediante OAuth de leitura já existente, percorre as pastas `Checkpoints Banco Mestre` e `09_EXPORTACOES/01_CHECKPOINTS_E_BACKUPS`, incluindo suas subpastas; encontra ZIPs anteriores e manifestos `BM_CHECKPOINT_MANIFEST_V1__<checkpoint_id>.json`.
4. Site → valida o manifesto e lista cada checkpoint com origem e estados DECLARADOS, sem presumir que o conteúdo foi aprovado, sincronizado no canônico ou exibido no portal.
5. Site → permite selecionar um arquivo manifesto JSON e, com consentimento adicional restrito `drive.file`, criar novo registro na pasta de checkpoints. Confirma pasta, ID e conteúdo por leitura de volta. Sem permissões, conserva a opção de baixar o JSON e enviá-lo ao chat para salvamento pelo conector.
6. SRS/canônico/site → permanecem fluxos separados, somente por evento válido, integração aprovada e conferência específica.

## Esquema do manifesto — BancoMestreCheckpointManifestV1
Arquivo por checkpoint, nome `BM_CHECKPOINT_MANIFEST_V1__CP-AAAA-MM-DD-IDENTIFICADOR-VNNN.json` (a implementação aceita IDs CP- com letras maiúsculas, números, hífen e underscore).
Campos obrigatórios:
- `schema` = `BancoMestreCheckpointManifestV1`
- `checkpoint_id` = ID estável iniciado em `CP-`, único, sem reuso.
- `created_at` = ISO-8601 contendo fuso; se a hora da conversa for desconhecida, usar data/hora verificável do arquivo no Drive e identificar a base temporal em `source.timestamp_basis`.
- `source.chat_title` = nome do chat; acrescentar `source.conversation_reference`, intervalo de questões/IDs, limites de recuperação, quando comprovados.
- `state.archive`, `state.classification`, `state.canonical`, `state.site`, `state.srs`: estados SEPARADOS, sempre com PENDENTE quando não verificados.
- `counts`: contagens confirmadas ou `null` para desconhecido. Não inferir.
Campos opcionais:
- `attachments[]`: cada `{drive_file_id, name, role, sha256?}` com hash apenas comprovado.
- `items[]`: `{id,type,action,approval,...}` por cartão/questão/imagem/PDF/SRS/nota/fonte; registrar disciplina, assunto, subassunto, verso integral, fonte, vínculo, destino e papéis de mídia, conforme a Metodologia Mestre.
- `verification`: fatos verificáveis sobre gravação, conteúdo, integração e exibição (distintos).
- `pending[]`, `previous_checkpoint_id`, `notes`: lacunas, histórico e retificações.

Manifesto EXEMPLIFICATIVO (valores fictícios, não representam um checkpoint real):
```json
{
  "schema": "BancoMestreCheckpointManifestV1",
  "checkpoint_id": "CP-20261116-EXEMPLO-V001",
  "created_at": "2026-11-16T10:00:00-03:00",
  "source": {
    "chat_title": "Exemplo de estudo (fictício)",
    "timestamp_basis": "Exemplo de preenchimento, não registro de conversa real"
  },
  "state": {
    "archive": "pendente",
    "classification": "pendente",
    "canonical": "pendente",
    "site": "pendente",
    "srs": "sem evento comprovado"
  },
  "counts": {
    "cards": null, "questions": null, "images": null, "pdfs": null
  },
  "attachments": [],
  "items": [],
  "verification": {
    "drive": "não verificado",
    "canonical": "não verificado",
    "site": "não verificado"
  },
  "pending": ["Exemplo apenas; substituir por evidências reais"]
}
```

## Teste de implementação (reproduzível)
- Validador de manifesto: aceita dados com ID estável, fuso, origem e estados separados; rejeita IDs inválidos, ausência de fuso, hash falso e itens sem ID.
- Busca recursiva simulada: identifica ZIP numa subpasta e manifesto JSON, sem marcar ZIP auditado.
- Upload simulado: cria registro no Drive e só confirma depois de leitura de retorno idêntica.
- Permissão negada: upload não confirma registro; entrada anterior preservada.
- Teste histórico real sem alteração canônica: `CP-20261116-PETRO14-V004`, manifesto privado (Google Doc exportável como texto) criado e verificado por metadados, conteúdo e localização na pasta Checkpoints Banco Mestre. Originais permanecem preservados; cadastro, integração e SRS são pendentes/inalterados conforme o relatório.

## Limitações e pendências
- O ChatGPT não injeta automaticamente novas conversas no site: salvar os checkpoints no Drive através do conector é uma operação separada, explícita e verificável.
- OAuth no navegador do titular, criação direta com `drive.file` na pasta existente e renderização em site real **ainda não foram homologados**. O Drive pode negar a escrita no diretório se o aplicativo não tiver acesso suficiente; não solicitar escopo amplo automaticamente.
- O registro não importa novos cartões para a base, não sincroniza SRS, não anota PDFs e não publica imagens. Para isso continuam os fluxos de aprovação e sincronização específicos.
- Nunca sobrescrever um manifesto existente; retificações usam outro ID e ligação com o anterior. Nenhum ZIP é movido ou excluído durante o registro.

## Recuperação
Se a V186 apresentar falha, usar `v185.html` e restaurar `home: v185.html` no manifesto. Os módulos V185, checkpoints originais e registro no Drive permanecem intactos.

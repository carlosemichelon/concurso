# Banco Mestre V084 (experimental) — janela inteligente de seleção

## O que está implementado
- O usuário clica **✦ Janela inteligente** dentro do leitor PDF e seleciona um artigo na página.
- O texto selecionado aparece em uma janela própria, onde se pode selecionar novamente **trechos específicos**, atribuir uma das seis cores, editar a categoria, remover sugestões, ativar/desativar propostas e confirmar o grupo inteiro.
- **Sugestões locais** usam o classificador V083; ele ainda não interpreta semanticamente os cinco fundamentos da Constituição. É possível marcar esses fundamentos manualmente em laranja na janela.
- O motor V084 valida cada trecho contra as **palavras/posições do PDF**, bloqueia palavras cortadas, sobreposição e texto inexistente. Usa a API existente de **salvamento atômico e Desfazer conjunto**, sem alterar grifos existentes. A janela não lê nem altera SRS.
- A janela é **experimental** em `v084_experimental.html`; a página `index.html`, o manifesto V083 e os 72 PDFs NÃO mudam.
- O botão Claude fica **desabilitado** até configurar um backend autenticado. Nenhuma cobrança ou chamada remota nesta etapa.

## Segurança — necessário antes de conectar o Claude
**Revogue a chave que foi enviada na conversa**, no painel da Anthropic: https://platform.claude.com/settings/keys. Gere uma nova chave de API oficial e **NÃO envie a chave no chat nem a adicione ao GitHub**.

A chave só deve ser cadastrada no painel **Cloudflare Worker → Settings → Variables and Secrets → Add secret** como `ANTHROPIC_API_KEY`.

O projeto `infra/claude-v084/` traz apenas um exemplo de Worker. Ele exige:
1. Worker realmente **protegido por Cloudflare Access** (preferencialmente política por usuário/e-mail, cobrindo TODOS os domínios e previews), com `ctx.access` validado.
2. Segredo `BM_ALLOWED_EMAIL` com o e-mail autorizado, também no Cloudflare, nunca no GitHub.
3. Segredo `ANTHROPIC_API_KEY` cadastrado no Cloudflare com a **nova** chave.
4. Variável `BM_ALLOWED_ORIGIN` específica do site; já preparada como `https://carlosemichelon.github.io`.
5. Variável `CLAUDE_MODEL` (exemplo: `claude-sonnet-5-5`; conferir disponibilidade na conta).
6. Configurar endpoint `https://.../analyze` somente em `assets/v084_ai_config.js` depois de verificar proteção, autenticação, HTTPS, CORS e consumo. O **endpoint URL não é secreto**; a chave é.
7. Testar o fluxo de login e preflight CORS; o Cloudflare Access pode precisar de configuração específica para cookies entre o domínio GitHub Pages e o Worker. Se o navegador bloquear cookies de terceiros, considerar um domínio próprio/proxy no mesmo site.
8. Definir limite de custo/uso. Sem proteção por Access, CORS **não** impede uso abusivo por clientes HTTP externos.

O Worker bloqueia chamadas sem `ctx.access`, sem e-mail autorizado e sem origem permitida. O texto enviado é **somente a seleção**, nunca o PDF completo, as anotações históricas ou o SRS. A IA deve retornar objetos `{start,end,quote,kind,reason}` e o backend E o navegador validam correspondência exata. Nenhuma sugestão é gravada sem o clique do usuário em **Aplicar seleção aprovada**.

## Aceite, limitações e próximos testes
- Foram validados o reconhecimento de seis trechos inteiros do art. 1º como laranja **mediante seleção manual**, a rejeição de citações inventadas, sobreposição e palavras parciais; o Worker bloqueou solicitações anônimas e origens indevidas em testes simulados.
- **Não testado ainda:** fluxo completo de seleção com toque em PDF real no Chrome/Android, login real do Cloudflare Access, autenticação real na Anthropic e custos.
- Marcadores achatados dentro da imagem do PDF (como amarelo preexistente na cópia anotada) **não são removidos/detectados como anotações editáveis**.
- É intencional rejeitar a seleção que não cobre a pontuação integrada à palavra extraída do PDF (ex.: selecionar `povo` em vez de `povo,` pode exigir estender a seleção). Segurança acima de grifos imprecisos.

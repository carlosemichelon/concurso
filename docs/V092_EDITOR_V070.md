# V092 — retorno isolado do editor automático de quatro cores V070

## O que foi recuperado
O **primeiro grifador automático em quatro cores** é o V070. Seu classificador original (`assets/v070_classificador.js`) foi restaurado no fluxo, sem reescrever nem simular suas regras.

| Tipo | Cor | Significado |
| --- | --- | --- |
| `regra` | `#ffe04d` | Amarelo — regra principal |
| `agente` | `#92e8c0` | Verde — autoridade, competência e agente |
| `excecao` | `#ffb3c5` | Rosa — exceção, ressalva |
| `condicao` | `#a6d7ff` | Azul — condição, limitação, prazo |

A inteligência da V070 é **um conjunto de regras locais**. Não é um modelo de IA, não consulta Claude e não substitui conferência normativa.

## O que não mudou
- **Seletor V089**: seleção das palavras por coordenadas, sem saltar entre colunas.
- **Navegação V091**: rolagem sem troca automática de páginas e sem a mensagem “role para ativar a edição”.
- **Barra do V090**: navegação, zoom, mover, desfazer/refazer, PDF e Drive.
- **Acervo**: nenhum dos 72 PDFs, 270 imagens, registros existentes, IDs, notas, cartões ou calendários SRS foi regravado.

## Utilização
1. Clique na primeira palavra e depois na última, dentro da mesma coluna, ou arraste com mouse.
2. O classificador V070 separa automaticamente o texto e apresenta a **prévia dos trechos e quatro cores**.
3. Confira a prévia e clique **Aplicar as cores sugeridas**. O conjunto entra em uma única operação de Desfazer.
4. Alternativamente, selecione uma das quatro cores e clique **Grifar tudo com uma cor**.
5. As sugestões de assunto e nota são opcionais e editáveis. Para ajustar um grifo existente, toque nele; sua edição preserva o ID e o histórico.

## Diferença consciente em relação ao V070 puro
O modo rápido V070 gravava automaticamente ao concluir a seleção. A V092 restaura suas regras e as quatro cores, mas **exige confirmação antes de gravar** para não reintroduzir o comportamento que gerou erros. A seleção antiga baseada no DOM também não é reativada.

## Verificação
Testes estáticos e de componente: quatro cores originais, sugestões por palavras, seleção em três colunas, aplicação em lote e edição preservando ID. Teste do site real no navegador permanece pendente.

# V256 — fórmulas matemáticas e apresentação de lacunas
Data: 18/11/2026. Base preservada: V255 (portal) e V250 (Guia de Fórmulas). Implementação **exclusivamente visual**.

## Auditoria antes da intervenção
- Equações em `bm249-equation` e `bm198-equation` eram exibidas em texto comum, sem estrutura de fração e índices matemáticos.
- O catálogo de lacunas `#bm242-list .bm242-item` mostrava descrição, ID, quatro classificadores, relato literal, diagnóstico, origem, reforço e log em uma sequência sem hierarquia clara.
- O exemplo de auditoria conserva **duas certezas diferentes**: prioridade da lacuna e grau de confiança do diagnóstico; estado `Em reforço` não prova domínio.

## Escopo implantado
1. `assets/v256_math_display.js`: cria MathML no navegador para equações do Guia de Fórmulas e dos 11 módulos dos cartões, com `mfrac`, `msub`, `msup`, letras gregas, equações centralizadas e fonte preservada como texto original no DOM. Não lê nem modifica o Drive.
2. `assets/v256_lacunas_layout.js`: organiza o DOM em cabeçalho/ID, hierarquia temática, grade de classificadores, relato literal, diagnóstico/certeza, origem, pesquisa, ações e histórico recolhível. **Não modifica o texto original do relato**, nem os dados armazenados ou as ações existentes.
3. `assets/v256_readability.css`: layout responsivo, legibilidade da fórmula, diferenciação de autoria e quebra de linhas longas em celular.
4. `v256.html`: herda o loader V255, acrescenta somente os três arquivos e preserva `v255.html` para reversão.

## Verificação
- Leitura de retorno e hashes SHA GitHub dos módulos JS/CSS e do wrapper.
- Sintaxe JS verificada no conector, além do teste estrutural MathML para `M_r = α·f_ct·I_c/y_t = α·f_ct·W_t`: uma fração vertical e seis nós de subíndice; sem erro de compilação.
- Sem nova lacuna nem cartão, SRS inalterado, origem Drive inalterada.
- **Pendente:** screenshot e interação visual efetiva em navegador do usuário; teste HTTP público, OAuth e sincronização real são independentes da alteração visual. Sem afirmar que o mero commit os comprovou.

## Precauções técnicas
- MathML nativo dispensa CDN e scripts externos; navegadores sem MathML adequado devem ser conferidos antes de certificar compatibilidade universal.
- O conversor trata fórmulas reconhecidas; expressões não reconhecidas permanecem como texto original. Revisar visualmente equações complexas com agrupamentos, frações encadeadas e sinais normativos antes de afirmar que todas foram convertidas.
- Manter versões e histórico recuperáveis; não publicar relatos privados no repositório.

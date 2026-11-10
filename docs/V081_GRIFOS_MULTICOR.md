# V081 — Grifos multicoloridos por parágrafo

## Objetivo e contrato
Uma seleção de texto pode gerar **vários grifos individuais**, cada um com sua cor e ID, mas com **um único salvamento e uma única operação de Desfazer**. Esta regra substitui a regra antiga de um grifo por seleção apenas para o fluxo novo de reconhecimento multicolorido, conforme pedido do usuário.

## Fluxo
1. Abrir PDF no leitor local; ativar **Grifar palavras** e **Cores por trecho: automático**.
2. Selecionar um parágrafo com texto digital reconhecível.
3. Ver prévia das cláusulas reconhecidas (máximo 12), com seis cores disponíveis; laranja só manual.
4. Clicar **Aplicar trechos coloridos** para gravar o lote de modo atômico.
5. Se faltar evidência ou geometria segura, o módulo não tenta criar cores nem corta palavras; permite escolher manualmente um único grifo.

## Limites intencionais
O reconhecimento usa regras e pistas locais, não análise semântica jurídica completa. Pode errar o escopo de exceções; a prévia exige confirmação. A palavra completa precisa estar alinhada a um Range real da camada textual. PDF digitalizado não possui essa camada até OCR. Trechos neutros não recebem laranja automaticamente.

## Preservação
Não há migração dos grifos antigos nem alterações em IDs, notas, cartões, SRS ou PDFs. O catálogo V077 de 72 PDFs e sincronizações consentidas V075/V077/V078 permanecem. A implantação usa um novo HTML e novos JS, arquivando versões anteriores.

## Testes e aceite
- Planejador de cláusulas: 13/13 testes sintéticos (incluindo quatro cores, texto neutro, sobreposição e palavra parcial).
- Mapeamento DOM de palavra dividida em spans: passou; fragmento parcial bloqueado.
- Persistência em lote: um snapshot/uma escrita; rollback total em falha.
- Pendente: testar com PDF real e seleção real no Chrome/Android do titular, conferir zoom e reabertura.

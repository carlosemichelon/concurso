# Adendo da Metodologia Mestre — Controle de Estudos (V238)
Data: 2026-11-18
Estado: implementação estática no portal GitHub Pages; homologação visual e sincronização remota pendentes.

## Regra de isolamento obrigatório
A aba `Controle de Estudos` é uma ferramenta de registro de tempo, planejamento, questões e revisões de conteúdos. Seu modelo e armazenamento são independentes da base canônica dos flashcards, do TRT operacional e do SRS formal.

- Não alterar IDs, versos literais, imagens, PDFs, índices canônicos, eventos/avaliações Errei/Difícil/Bom/Fácil, datas SRS ou critérios de certificação.
- Completar revisões de conteúdo no módulo não pode ser confundido com ter respondido um flashcard. Atividade e revisão formal são eventos diferentes.
- Tempo, acertos e metas devem ser baseados somente em sessões efetivamente registradas; não contabilizar planejamentos ou cartões visualizados como estudo concluído.
- Identificar claramente metas sugeridas versus tempo realizado e contagem de exercícios versus percentual de acertos.
- O usuário mantém pleno controle dos registros e pode editar, excluir, filtrar e exportar JSON/CSV.
- Não avançar nenhum contador de cartões certificados em função dos dados desta aba.
- Qualquer integração futura entre estudo e Banco Mestre deve ter autorização explícita, migração auditável e rastreabilidade das operações.

## Versão V238
O portal original V237 foi preservado. O portal novo é `v238.html`, com script de navegação `assets/v238_controle_tab.js` e página de controle `controle-estudos.html`.

Funções: cronômetro líquido com pausa e recuperação após recarregar; alarme visual configurável; sessão manual e por cronômetro; disciplina, conteúdo, tipo e anotações; exercícios/erros/acertos; histórico pesquisável e editável; indicadores e gráficos por dia/disciplina/tipo; disponibilidade e metas diárias, semanais e mensais; ciclo flexível ponderado por dificuldade, peso e questões; revisões de conteúdo (agendamento manual ou após 1/7/30 dias); exportação de backup JSON e CSV; importação do JSON com confirmação.

## Persistência e comunicação honesta
Os dados desta versão ficam em `localStorage` do navegador (`BM_CONTROLE_ESTUDOS_V238` e `BM_CONTROLE_TIMER_V238`). O backup JSON exporta dados salvos, não necessariamente o cronômetro ativo. **Não há sincronização Google Drive, conta remota ou entre dispositivos.** Não sugerir que os dados estão salvos no Drive. É importante exportar JSON periodicamente, sobretudo antes de limpar o navegador.

## Auditoria e limitações
- HTML e os scripts da página e navegação: verificação de sintaxe JavaScript realizada.
- Manifesto `assets/version.json` e entrada `index.html` apontam para V238.
- Verificação real no navegador do proprietário, experiência responsiva e estado de publicação do GitHub Pages: ainda não homologados.
- Integração Google OAuth e sincronização remota: não implementadas.
- Estatísticas só refletem os lançamentos da aba; não representam automaticamente todo o histórico do Banco Mestre.
- Não utilizar marca, identidade visual ou código-fonte proprietário do aplicativo de referência: as funcionalidades foram reimplementadas com interface própria.

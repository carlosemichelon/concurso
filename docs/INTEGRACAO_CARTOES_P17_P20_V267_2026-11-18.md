# Integração incremental V267 — Petrobras 17/20 (18/11/2026)

Versão anterior V266 preservada em `v266.html` (arquivo histórico). A base pública V194 continua IMUTÁVEL: arquivos `cards_public_v194_*` e `layers_public_v194_*` não são alterados.

## Integrações técnicas públicas
- 7 cartões existentes: CARD-0631, CARD-0632, CARD-0637, CARD-0638, CARD-0641, CARD-0643, CARD-0645. Origem: PETRO20-C001.
- 10 relacionados com remissões recíprocas: CARD-0445, CARD-0606, CARD-0622, CARD-0623, CARD-0625, CARD-0626, CARD-0628, CARD-0629, CARD-0633, CARD-0642.
- 2 cartões existentes: CARD-1378 (dmax≤1,2cnom, 35mm→42mm) e CARD-1379 (φlong em pilar 20×40cm, comparação com lajes). Origens: PETRO17-E002/E003.
- Total de IDs existentes afetados: 19; nenhum novo ID, nenhuma modificação literal de frente/verso, SRS ou registros pessoais.

## Arquitetura segura
Dados técnicos incrementais: `assets/estudos_incrementos_v267.json`. O portal V267 carrega a V194 pública e anexa os complementos ao campo de explicação e às seções específicas dos 11 módulos mediante `assets/v267_public_layers.js`. Não replica fontes privadas do Drive nem eventos SRS. Relações são textuais; não se pressupõe gravação retroativa na base privada.

## Limites e continuidade
Propostas inéditas PETRO16-C001…C013, PETRO15-C003, propostas de lajes e charneiras de PETRO17-E003/E004 e outras fichas ainda não homologadas permanecem PENDENTES e FORA do catálogo ativo. Sua publicação exige auditoria de cobertura e aprovação editorial aplicável; nenhum novo cartão é criado por esta integração. Não usar retorno de resposta de questão externa para SRS.

## Checagens
Requisitos: 1.518 IDs da V194, 19 IDs de incrementos únicos, preservação da resposta literal e 11 módulos, sem alterar base original. A publicação no GitHub e o carregamento público do GitHub Pages devem ser verificados separadamente.

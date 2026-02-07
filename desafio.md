# Desafio Dev Pleno — Xadrez Online (Quasar + Pinia + NestJS + WebSocket + Docker + Mongo)

## Objetivo

Construir um **jogo de xadrez online** com **partidas em tempo real**, permitindo que **dois jogadores** joguem a mesma partida via navegador, com **sincronização via WebSocket**.

A intenção do desafio é avaliar **qualidade de código**, **arquitetura**, **organização**, **capacidade de entrega**, e decisões técnicas coerentes para um contexto real.

---

## Stack obrigatória

- **Frontend:** Quasar (Vue 3) + **Pinia**
- **Backend:** NestJS
- **Tempo real:** WebSocket (via NestJS Gateway)
- **Persistência:** **MongoDB + Mongoose**
- **Infra:** Docker + Docker Compose (subir tudo com um comando)
- **Linguagem:** TypeScript (front e back)

---

## Escopo (MVP obrigatório)

### 1) Entrada (autenticação simples)

Tela inicial pedindo:

- **Nome do jogador**
- **Código da sala** (criar ou entrar)

> Não é necessário login real, OAuth ou cadastro.

---

### 2) Salas e partida

- Um jogador cria uma sala (código) e fica aguardando.
- O segundo jogador entra usando o mesmo código.
- Ao iniciar:
  - Um jogador recebe **brancas** e o outro **pretas** (pode ser aleatório).
  - Ambos veem o mesmo tabuleiro e as mesmas jogadas.

---

### 3) Regras básicas do xadrez (MVP)

O MVP precisa:

- Movimentação correta das peças (regras de movimento).
- Impedir jogadas ilegais.
- Alternância de turno.
- Capturas.
- Detecção de **xeque** (ao menos indicar “rei em xeque”).

> **Não é obrigatório para o MVP:** roque, en passant, promoção, xeque-mate e empate por repetição — mas vale como bônus.

---

### 4) Sincronização em tempo real

Toda jogada feita por um jogador deve refletir no outro **instantaneamente**.

Eventos mínimos esperados (sugestão):

- `room:joined`
- `game:started`
- `move:requested`
- `move:accepted` / `move:rejected`
- `game:state` (broadcast do estado atualizado)

---

### 5) UI mínima (Quasar)

- Tabuleiro 8x8 com peças visíveis (pode ser unicode, SVG, imagem, etc.)
- Clique/seleção de peça e destino
- Indicador de turno (Brancas/Pretas)
- Lista de jogadas (notação simples tipo `e2-e4` ok)
- Feedback visual para:
  - jogada inválida (mensagem)
  - peça selecionada
  - casas possíveis (highlight simples)

---

## Persistência (obrigatória)

É obrigatório usar **MongoDB + Mongoose**.

Requisito mínimo de persistência:

- Salvar o **estado atual** da partida por sala:
  - tabuleiro
  - turno
  - lista de jogadas
  - status (em andamento, finalizada, etc.)
- Ao entrar em uma sala existente, o cliente deve conseguir recuperar o estado atual.

> Não é exigido: histórico avançado, ranking, autenticação real, otimização de índices, transações complexas.

---

## Requisitos técnicos obrigatórios

### Docker (obrigatório)

A entrega deve conter `docker-compose.yml` na raiz.

Um único comando deve subir tudo:

- `docker compose up --build`

Deve expor:

- Frontend em uma porta (ex.: `http://localhost:9000`)
- Backend em outra (ex.: `http://localhost:3000`)
- MongoDB (porta padrão ou interna via network)

O `README` deve ter instruções claras de execução.

---

### WebSocket (obrigatório)

- Backend com **NestJS Gateway**
- Gerenciar:
  - conexão/desconexão
  - sala (join/leave)
  - broadcast por sala
  - **validação server-side** de jogadas (regra final é do servidor)

> O servidor deve ser a fonte da verdade (anti-trapaça).

---

### Quasar + Pinia (obrigatório)

- Interface feita em **Quasar (Vue 3)**.
- Gerenciamento de estado usando **Pinia**.
- Organização de componentes e stores clara:
  - store de sessão (player, room)
  - store de jogo (estado do tabuleiro, turno, jogadas)
  - store de socket/transport (conexão, eventos) ou outra abordagem equivalente

---

### NestJS (obrigatório)

Projeto deve ter estrutura coerente:

- módulos
- services
- gateways
- DTOs/validações quando aplicável

Esperado separar bem:

- regras do jogo (domínio)
- transporte (websocket)
- persistência (mongo/mongoose)

---

## Contrato / API (mínimo sugerido)

Você pode implementar somente WebSocket, ou combinar com REST.

Sugestão de eventos WS:

- `room/create` → `{ roomCode, playerName }`
- `room/join` → `{ roomCode, playerName }`
- `game/move` → `{ roomCode, from, to }` (ex.: `e2`, `e4`)
- `game/state` (server → client) → `{ board, turn, moves, status }`

---

## Uso de IA (permitido, com regras)

O uso de ferramentas de IA (ChatGPT, Copilot, etc.) **é permitido**.

O que será avaliado:

- entendimento do que foi entregue
- capacidade de explicar as decisões
- coerência arquitetural e qualidade do código

> Código “gerado” sem entendimento, com padrões aleatórios ou overengineering, será identificado na revisão.

---

## O que será avaliado

### Qualidade e engenharia

- **Clean Code**: legibilidade, nomes, coesão, simplicidade
- **Design Patterns**: uso consciente (sem exagero)
- **SOLID**: separação de responsabilidades, inversão quando fizer sentido
- **OOP**: modelagem do domínio do xadrez (peças, regras, tabuleiro, movimentos)
- **Arquitetura**: separação domínio x infraestrutura (ws/mongo)
- **Consistência do estado**: servidor como fonte da verdade, fluxo previsível

### Produto

- Funciona estável com 2 jogadores?
- Estado consistente?
- Jogadas ilegais são bloqueadas pelo servidor?
- UI clara e usável?

---

## Entregáveis

1. **Repositório Git** contendo:
   - `/backend` (NestJS)
   - `/frontend` (Quasar + Pinia)
   - `docker-compose.yml` na raiz
   - `README.md` na raiz

2. **README deve conter:**
   - requisitos (Docker etc.)
   - como rodar (comandos)
   - URLs/portas
   - decisões de arquitetura (2–6 parágrafos)
   - limitações conhecidas
   - lista do que ficou como bônus (se aplicável)

---

## Restrições

- Não usar engine pronta de xadrez que valide regras completas por você.
  - Pode usar recursos para **representação visual** (sprites/ícones),
  - mas a **regra do jogo** deve estar no seu código.
- O servidor é a fonte da verdade: validação final é sempre server-side.

---

## Critérios de aceite (checklist)

- [x] Sobe com `docker compose up --build`
- [x] Dois jogadores entram na mesma sala
- [x] Jogo inicia e alterna turnos corretamente
- [x] Jogadas ilegais são rejeitadas pelo servidor
- [x] Jogadas sincronizam em tempo real
- [x] Estado é persistido no MongoDB e recuperável ao entrar na sala
- [x] UI permite jogar sem “gambiarras”
- [x] Código organizado e legível
- [x] Pinia usado de forma clara (stores bem definidas)
- [ ] README bem explicado

---

## Bônus (não obrigatório, mas conta pontos)

- [x] Roque, promoção, en passant
- [x] Xeque-mate / empate
- Relógio (tempo por jogador)
- Chat na sala
- Reconexão e retomada da partida com estado consistente
- [x] Espectadores (watch mode)
- Logs estruturados e bom tratamento de erros
- [x] Deploy simples (ex.: compose com envs bem definidos)

---

## Tempo sugerido

- Sugestão: **até 1 semana** para entrega.
- Não é esperado perfeição: o foco é **clareza de raciocínio, boas decisões e entrega funcional**.

Boa sorte!
